from decimal import Decimal, InvalidOperation

from django.db import transaction

from user.serializers import StudentSerializer
from utils.utils import compute_remark
from .serializers import *
from rest_framework import permissions,response,viewsets
from core.permissions import IsHOD,IsStaff,IsDirector, IsStudent
from .models import *
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser,FormParser
from user.models import HOD,Staff, StudentClassCourse

class ClassCourseView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self,request,class_id):
        _class = Class.objects.filter(id=class_id).first()
        class_courses = ClassCourse.objects.filter(_class=_class)
        if not class_courses:
            return response.Response({"data":None,"message":"No courses were found for this class"})
        data = []
        for cc in class_courses:
            # get the teacher assignment for this specific course
            teacher_assigned = TeacherAssignment.objects.filter(class_course=cc).first()
            
            data.append({
                    "course":cc.course.name,
                    "credit": cc.credit,
                    "academic_year": cc.academic_year,
                    "semester_num": cc.semester_num,
                    "course_type": cc.course_type.name,
                    "teacher_assigned":  teacher_assigned.teacher.user.fullname() if teacher_assigned else "No Teacher assigned",
                })
        
        return response.Response({"data":data,"message":"successfully fetched"})


class ExamExamTypeView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    def get(self,request):
        user = request.user
        print(user)
        if user.user_type == "Admin":
    
            exams = Exam.objects.all()
            data = []
            for exam in exams:
                ee_type = ExamExamType.objects.filter(exam=exam).first()
                
                data.append({
                    "exam_id": exam.id,
                    "exam_type": ee_type.exam_type.name,
                    "exam_date": ee_type.exam_date,
                    "Weight_percent": ee_type.weight_percent,
                    "class": exam.class_course._class.name,
                    "course": exam.class_course.course.name
                })
            return response.Response({"data":data})
        
        if user.user_type == "Teacher":
            teacher = Teacher.objects.filter(user=user).first()
            if teacher.is_hod or teacher.is_staff:
                print("HOD")
                hod = HOD.objects.filter(teacher__user = user).first()
                staff = Staff.objects.filter(teacher__user = user).first()
                if hod:
                    exams = Exam.objects.filter(
                        class_course___class__department_level_degree__department = hod.department
                    )
                elif staff:
                    exams = Exam.objects.filter(
                        class_course___class__department_level_degree__department = staff.department
                    )
                data = []
                for exam in exams:
                    ee_type = ExamExamType.objects.filter(exam=exam).first()
                    
                    if ee_type:
                        data.append({
                            "exam_id": exam.id,
                            "exam_exam_type_id": ee_type.id,
                            "class_course_id": exam.class_course.id,
                            "exam_type": ee_type.exam_type.name,
                            "exam_date": ee_type.exam_date,
                            "Weight_percent": ee_type.weight_percent,
                            "class": exam.class_course._class.name,
                            "class_id": exam.class_course._class.id,
                            "course": exam.class_course.course.name
                        })
                return response.Response({"data":data})
            return response.Response({"data":None,"message":"Please you need to be an Hod or a member of Staff"})
        
        return response.Response({"error":"Error"})
    

# Results Upload View
class ResultUploadView(APIView):
    
    permission_classes = [IsStaff]
    # The parser classes to handle file uploads
    parser_classes = [MultiPartParser,FormParser]
    
    def post(self,request,*args,**kwargs):
        
        # 1. Validate form fields
        serializer = ExamResultSerializer(data=request.data)
        
        if not serializer.is_valid():
            return response.Response(serializer.errors)
        
        data = serializer.validated_data
        
        class_course_id = data["class_course_id"]
        exam_exam_type_id = data["exam_exam_type_id"]
        result_file = data["resut_file"]
        
        
        # 2. Fetch ClassCourse & verify Staff's department match
        
        try:
            class_course = ClassCourse.objects.select_related(
                "_class","_class__department_level_degree__department","course"
            ).get(id=class_course_id)
            
        except ClassCourse.DoesNotExist:
            return response.Response(
                {"error": f"ClassCourse with id {class_course_id} not found"}
            )
        
        try: 
            exam_exam_type = ExamExamType.objects.select_related(
                "exam_type"
            ).get(id=exam_exam_type_id)
        
        except ExamExamType.DoesNitExist:
            return response.Response(
                {"error":f"Exam type with id {exam_exam_type_id} not found."}
            )
            
        
        # Verify the ExamExamType actually belongs to this ClassCourse
        try:
            Exam.objects.get(
                examexamtype=exam_exam_type,
                class_course=class_course
            )
            
        except Exam.DoesNotExist:
            return response.Response(
                {"error":"Selected Examtype does not belong to the selected class course."}
            )
            
        # Staff department check
        try: 
            teacher = request.user.teacher
            
            t_staff = Staff.objects.select_related("department").get(teacher=teacher)
            
            staff = teacher.staff
            t_staff_department = staff.department
        except Exception:
            return response.Response(
                {"error":"Staff profile not found for this user."}
            )
        
        class_department = class_course._class.department_level_degree.department   # Accessing the department through the class_course relationship
        
        if t_staff_department != class_department:
            return response.Response(
                {"error":"You can only upload results for classes in your department"}
            )
            
        # 3. Parse file
        
        try:
            file_name = result_file.name.lower()
            import pandas as pd
            if file_name.endswith(".csv"):
                df = pd.read_csv(result_file)
                print(df.head())
            else:
                df = pd.read_excel(result_file,skiprows=3) #Skip the first 2 rows since they contain the wrong info
                print(df.head())
        except Exception as e:
            return response.Response(
                {"error":f"Could not read file: {str(e)}"}
            )
            
        #  Normalize column names (strip spaces, lowercase)
        
        df.columns = [ c.strip().lower().replace(" ","_") for c in df.columns]
        
        required_cols = {"student_name","mark_obtained"}
        missing = required_cols - set(df.columns)
        
        if missing:
            return response.Response(
                {"error":f"Missing columns in file: {missing}."
                 f"Required columns: student_name, mark_obtained"}
                
            )   
            
        # 4. fetch enrolled students for this ClassDourse
        enrolled_students = StudentClassCourse.objects.filter(
            class_course = class_course,
            status = StudentClassCourse.Status.ENROLLED
        ).select_related("student")
        
        # Build a lookup: full_name (lowercase)
        
        enrolled_map = {
            enr.student.user.fullname(): enr.student
            for enr in enrolled_students
        }
        
        # 5. Update or Create ExamResults
        
        created_count = 0
        updated_count = 0
        skipped_rows = []
        
        try:
            with transaction.atomic():
                for idx,row in df.iterrows():
                    row_num = idx + 2  #human readable row number (1-indexed + header)
                    
                    raw_name = str(row.get("student_name","")).strip().lower()
                    raw_mark = row.get("mark_obtained",None)
                    
                    # Validate mark
                    
                    try:
                        mark = Decimal(str(raw_mark))
                        
                        if not (0 <= mark <= 100):
                            raise ValueError("Mark must be between 0 and 100.")
                    
                    except (InvalidOperation,ValueError,TypeError):
                        skipped_rows.append({
                            "row": row_num,
                            "student_name": raw_name,
                            "reason": f"Invalid mark_obtained: '{raw_mark}' (must be 0-100)"
                        })
                        
                        continue
                    
                    # match student
                    
                    student = enrolled_map.get(raw_name)
                    
                    if not student:
                        skipped_rows.append({
                            "row": row_num,
                            "student_name": raw_name,
                            "reason": "Student not enrolled in this class course."
                        })
                        continue
                    # Fetch the exam_exam_type max mark 
                    exam_max_mark = ExamExamType.objects.filter(id=exam_exam_type_id).first()
                    remark = compute_remark(exam_max_mark.max_mark,mark)
                    
                    # Upsert
                    
                    obj,created = ExamResult.objects.update_or_create(
                        student = student,
                        exam_exam_type = exam_exam_type,
                        defaults = {
                            "mark_obtained": mark,
                            "remark": remark,
                            "uploaded_by": staff,
                            "is_published": False,
                        },
                    )
                
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1
        except Exception as e:
            return response.Response(
                {"error":f"Database error during upload: {str(e)}"}
            )
        
        
        return response.Response(
            {
                "message":"Results uploaded successfully.",
                "created": created_count,
                "updated": updated_count,
                "skipped": len(skipped_rows),
                "skipped_details": skipped_rows
            }
        )
        
        
# Student Result Retreive
class StudentResultRetrieveView(APIView):
    permission_classes = [IsStudent]
    
    def get(self,request,semester_num):
        student = request.user.student
        if student:
            data = []
            results = ExamResult.objects.filter(
                student=student,
                exam_exam_type__exam__class_course__semester_num=semester_num
                ).all()
            if results:
                for r in results:
                    data.append({
                        "id":r.id,
                        "remark": r.remark,
                        "mark_obtained": r.mark_obtained,
                        "exam_exam_type": r.exam_exam_type.exam_type.name,
                        "exam_exam_type_id": r.exam_exam_type.id,
                        "course": r.exam_exam_type.exam.class_course.course.name,
                        "semester_num": semester_num
                        })
                
        return response.Response({"Message":f"Welcome","user":data})

# hod and staff result retreive
class StaffResultRetrieveView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self,request,semester_num,class_id):
        user = request.user.teacher.hod if request.user.teacher.is_hod else request.user.teacher.staff
        if user:
            data = []
            
            # get courses enrolled in the class in a particular semester
            class_courses = ClassCourse.objects.filter(_class_id=class_id,semester_num=semester_num).all()
            
            # get the students enrolled in those courses and their results
            for cc in class_courses:
                
                exam_results = ExamResult.objects.filter(
                    exam_exam_type__exam__class_course = cc
                ).select_related("student","exam_exam_type__exam__class_course__course")
                
                for r in exam_results:
                    data.append({
                        "id":r.id,
                        "student": r.student.user.fullname(),
                        "remark": r.remark,
                        "mark_obtained": r.mark_obtained,
                        "exam_exam_type": r.exam_exam_type.exam_type.name,
                        "course": r.exam_exam_type.exam.class_course.course.name,
                        "semester_num": semester_num
                    })
                    
            return response.Response(data)
        
        return response.Response({"error":"Sorry try to login"})
            

# complaint view
class ComplaintViewset(viewsets.ModelViewSet):
    
    serializer_class = ComplaintSerializer
    permission_classes = [IsStudent,IsHOD,IsStaff]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.teacher:
            return Complaint.objects.filter(
                exam_exam_type__exam__class_course___class__department_level_degree__department = user.teacher.department
            ).order_by("-created_at").all()
        
        return Complaint.objects.filter(student=user.student)
    
    def perform_create(self,serializer):
        
        student = self.request.user.student
        
        exam_exam_type_id = self.request.data.get("exam_exam_type_id")
        
        # get the exact exam_exam_type
        exam_exam_type = ExamExamType.objects.filter(id=exam_exam_type_id).filter()
        
        if not exam_exam_type:
            raise serializers.ValidationError({"error":"Exam exam can't be seen sorry"})
        
        complaint = serializer.save(
            exam_exam_type=exam_exam_type,
            student=student,
            concern=self.request.data.get("concern"),
            evidence=self.request.FILES.get("evidence"),
            status = Complaint.Status.SUBMITTED
        )