from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.utils import timezone

from structure.models import Department
from user.serializers import StudentSerializer
from utils.utils import compute_remark
from .serializers import *
from rest_framework import permissions,response,viewsets,status
from core.permissions import IsHOD,IsStaff,IsDirector, IsStudent
from .models import *
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser,FormParser
from user.models import HOD,Staff, StudentClassCourse

class ClassCourseView(APIView):
    permission_classes = [permissions.IsAuthenticated]
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

class CoursesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self,request):
        teacher = request.user.teacher
        
        courses = Course.objects.all()
       
        data = [] 
        for c in courses:

            class_course = ClassCourse.objects.filter(
                course_id=c.id
                ).first()
            if class_course._class.department_level_degree.department == teacher.department:
                data.append({
                    "name": c.name,
                    "code": c.code,
                    "academic_year": class_course.academic_year,
                    "semester_num": class_course.semester_num
                })
        return response.Response(data)

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
        print(f"class course: {class_course_id} , exam exam type {exam_exam_type_id}")
        
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
                {"error":f"Exam type with id {exam_exam_type_id} not found."},
                status=status.HTTP_204_NO_CONTENT
            )
            
        
        # Verify the ExamExamType actually belongs to this ClassCourse
        try:
            Exam.objects.get(
                examexamtype=exam_exam_type,
                class_course=class_course
            )
            
        except Exam.DoesNotExist:
            return response.Response(
                {"error":"Selected Examtype does not belong to the selected class course."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Staff department check
        try: 
            teacher = request.user.teacher
            
            t_staff = Staff.objects.select_related("department").get(teacher=teacher)
            
            staff = teacher.staff
            t_staff_department = staff.department
        except Exception:
            return response.Response(
                {"error":"Staff profile not found for this user."},
                status=status.HTTP_204_NO_CONTENT
            )
        
        class_department = class_course._class.department_level_degree.department   # Accessing the department through the class_course relationship
        
        if t_staff_department != class_department:
            return response.Response(
                {"error":"You can only upload results for classes in your department"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 3. Parse file
        
        try:
            file_name = result_file.name.lower()
            import pandas as pd
            if file_name.endswith(".csv"):
                df = pd.read_csv(result_file)
                print(df.head())
            else:
                df = pd.read_excel(result_file,skiprows=8) #Skip the first 2 rows since they contain the wrong info
                
        except Exception as e:
            return response.Response(
                {"error":f"Could not read file: {str(e)}"},
                status=status.HTTP_204_NO_CONTENT
            )
            
        #  Normalize column names (strip spaces, lowercase)
        
        df.columns = [ c.strip().lower().replace(" ","_") for c in df.columns]
        df.rename(columns=lambda col: "mark_obtained" if col.startswith("mark") else col ,inplace=True)
        
        required_cols = {"student_name","mark_obtained"}
        missing = required_cols - set(df.columns)
        print(df.head())
        if missing:
            return response.Response(
                {"error":f"Missing columns in file: {missing}."
                 f"Required columns: student_name, mark_obtained"},
                status=status.HTTP_204_NO_CONTENT
                
            )   
            
        # 4. fetch enrolled students for this ClassDourse
        enrolled_students = StudentClassCourse.objects.filter(
            class_course = class_course,
            status = StudentClassCourse.Status.ENROLLED
        ).select_related("student")
        
        # Build a lookup: full_name (lowercase)
        
        enrolled_map = {
            enr.student.user.fullname().lower(): enr.student
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
                {"error":f"Database error during upload: {str(e)}"},
                status=status.HTTP_304_NOT_MODIFIED
            )
        
        
        return response.Response(
            {
                "message":"Results uploaded successfully.",
                "created": created_count,
                "updated": updated_count,
                "skipped": len(skipped_rows),
                "skipped_details": skipped_rows
            },
            status=status.HTTP_201_CREATED
        )
        
        
# Student Result Retreive
class StudentResultRetrieveView(APIView):
    permission_classes = [IsStudent]
    
    def get(self,request,semester_num=None,*args,**kwargs):
        student = request.user.student
        if student:
            data = []
            results = ExamResult.objects.filter(
                student=student,
                exam_exam_type__exam__class_course__semester_num=semester_num,
                is_published=True,
                ).all()
            if results:
                for r in results:
                    data.append({
                        "id":r.id,
                        "remark": r.remark,
                        "mark_obtained": r.mark_obtained,
                        "mark_percent": round(r.mark_obtained / r.exam_exam_type.max_mark * 100,2),
                        "max_mark": r.exam_exam_type.max_mark,
                        "gpa": r.get_gpa(),
                        "exam_exam_type": r.exam_exam_type.exam_type.name,
                        "exam_exam_type_id": r.exam_exam_type.id,
                        "course": r.exam_exam_type.exam.class_course.course.name,
                        "semester_num": semester_num
                        
                        })
                
        return response.Response({"Message":f"Welcome","user":data})


# hod and staff result retreive
class StaffResultRetrieveView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self,request,semester_num=None,class_id=None,student_id=None,*args,**kwargs):
        user = request.user.teacher.hod if request.user.teacher.is_hod else request.user.teacher.staff
        if user:
            data = []
            
            if student_id:
                student = Student.objects.filter(id=student_id).first()
                if not student:
                    return response.Response({"error":"Student not found"})
                
                results = ExamResult.objects.filter(student=student).all()
                
                for r in results:
                    
                    # Get the course type for the class
                    course_type = r.exam_exam_type.exam.class_course.course_type.name
                    data.append({
                        "student": r.student.user.fullname(),
                        "remark": r.remark,
                        "mark_obtained": round(r.mark_obtained / r.exam_exam_type.max_mark * 100,2),
                        "exam_exam_type": r.exam_exam_type.exam_type.name,
                        "course": r.exam_exam_type.exam.class_course.course.name,
                        "semester_num": r.exam_exam_type.exam.class_course.semester_num,
                        "course_type": course_type,
                    })
                
            
            if semester_num and class_id:
            
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
                            "mark_obtained":  round(r.mark_obtained / r.exam_exam_type.max_mark * 100,2),
                            "exam_exam_type": r.exam_exam_type.exam_type.name,
                            "course": r.exam_exam_type.exam.class_course.course.name,
                            "semester_num": semester_num
                        })
                    
            return response.Response(data)
        
        return response.Response({"error":"Sorry try to login"})

# Department Stats view
class DepartmentStatsView(APIView):
    permission_classes = [IsHOD | IsStaff]

    def get(self, request, *args, **kwargs):
        user = request.user
        teacher = getattr(user, "teacher", None)
        if not teacher:
            return response.Response({"error": "Not authorised."}, status=403)

        hod = HOD.objects.filter(teacher=teacher).first()
        staff = Staff.objects.filter(teacher=teacher).first()
        department = hod.department if hod else (staff.department if staff else None)

        if not department:
            return response.Response({"error": "No department found for this user."}, status=404)

        # All classes in this department
        classes = Class.objects.filter(
            department_level_degree__department=department
        )

        # Total students enrolled in those classes (distinct)
        student_ids = StudentClassCourse.objects.filter(
            class_course___class__in=classes
        ).values_list("student_id", flat=True).distinct()
        total_students = len(list(student_ids))

        # Total teaching staff in department
        total_staff = Staff.objects.filter(department=department).count()
        total_staff += HOD.objects.filter(department=department).count()

        # All published exam results in the department
        all_results = ExamResult.objects.filter(
            exam_exam_type__exam__class_course___class__in=classes,
            is_published=True,
            mark_obtained__isnull=False,
        ).select_related(
            "exam_exam_type__exam__class_course__course",
            "exam_exam_type__exam__class_course",
        )

        total_results = all_results.count()

        # Pass rate — anything not "Weak" is a pass
        passed = all_results.exclude(remark=ExamResult.Remark.WEAK).count()
        pass_rate = round((passed / total_results * 100), 1) if total_results > 0 else 0

        # Average GPA proxy: map remark to grade points

        if total_results > 0:
            gpa_sum = sum(
                r.get_gpa() for r in all_results if r.remark
            )
            average_gpa = round(gpa_sum / total_results, 2)
        else:
            average_gpa = 0.0

        # Course performance: average mark per course
        course_map = {}
        for r in all_results:
            course_name = r.exam_exam_type.exam.class_course.course.name
            if course_name not in course_map:
                course_map[course_name] = {"total": Decimal("0"), "count": 0, "students": set()}
            course_map[course_name]["total"] += r.mark_obtained or Decimal("0")
            course_map[course_name]["count"] += 1
            course_map[course_name]["students"].add(r.student_id)

        course_performance = [
            {
                "name": name[:20],  # truncate long names
                "average": round(float(data["total"] / data["count"]), 1) if data["count"] > 0 else 0,
                "students": len(data["students"]),
            }
            for name, data in course_map.items()
        ]
        # Sort by average descending
        course_performance.sort(key=lambda x: x["average"], reverse=True)

        # Semester trends: average mark per semester
        semester_map = {}
        for r in all_results:
            sem = r.exam_exam_type.exam.class_course.semester_num
            if sem not in semester_map:
                semester_map[sem] = {"total": Decimal("0"), "count": 0}
            semester_map[sem]["total"] += r.mark_obtained or Decimal("0")
            semester_map[sem]["count"] += 1

        semester_trends = [
            {
                "semester": f"Sem {sem}",
                "average": round(float(data["total"] / data["count"]), 1) if data["count"] > 0 else 0,
            }
            for sem, data in sorted(semester_map.items())
        ]

        # Grade distribution from remark field
        remark_to_grade = {
            ExamResult.Remark.EXCELLENT: "A+",
            ExamResult.Remark.VERYGOOD: "A",
            ExamResult.Remark.GOOD: "B",
            ExamResult.Remark.FAIRLYGOOD: "C",
            ExamResult.Remark.AVERAGE: "D",
            ExamResult.Remark.WEAK: "F",
        }
        grade_count = {}
        for r in all_results:
            grade = remark_to_grade.get(r.remark, "N/A") if r.remark else "N/A"
            grade_count[grade] = grade_count.get(grade, 0) + 1

        grade_distribution = [
            {
                "name": grade,
                "value": count,
                "percentage": round(count / total_results * 100, 1) if total_results > 0 else 0,
            }
            for grade, count in sorted(grade_count.items())
        ]

        return response.Response({
            "department": department.name,
            "totalStudents": total_students,
            "totalStaff": total_staff,
            "averageGPA": average_gpa,
            "passRate": pass_rate,
            "coursePerformance": course_performance,
            "semesterTrends": semester_trends,
            "gradeDistribution": grade_distribution,
        })


# Result Publishment view
class ResultPublishmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """Publish or unpublish results for a given exam_exam_type_id."""
        if hasattr(request.user,"staff"):
            exam_exam_type_id = request.data.get("exam_exam_type_id")
            action = request.data.get("action")  # "publish" or "unpublish"

            if not exam_exam_type_id or action not in ("publish", "unpublish"):
                return response.Response(
                    {"error": "Provide exam_exam_type_id and action ('publish' or 'unpublish')."},
                    status=400,
                )

            exam_exam_type = ExamExamType.objects.filter(id=exam_exam_type_id).first()
            if not exam_exam_type:
                return response.Response({"error": "ExamExamType not found."}, status=404)

            is_published = action == "publish"
            published_at = timezone.now() if is_published else None

            updated = ExamResult.objects.filter(exam_exam_type=exam_exam_type).update(
                is_published=is_published,
                published_at=published_at,
            )

            return response.Response(
                {
                    "message": f"Successfully {'published' if is_published else 'unpublished'} {updated} result(s).",
                    "exam_exam_type_id": exam_exam_type_id,
                    "is_published": is_published,
                    "count": updated,
                },
                status=status.HTTP_201_CREATED
            )
        
        return response.Response({"error":"You don't have the permission to publish results"},status=status.HTTP_403_FORBIDDEN)

    def get(self, request, *args, **kwargs):
        """Return publish status summary for all exam_exam_types in the user's department."""
        user = request.user
        teacher = getattr(user, "teacher", None)
        if not teacher:
            return response.Response({"error": "Not authorised."}, status=403)

        hod = HOD.objects.filter(teacher=teacher).first()
        staff = Staff.objects.filter(teacher=teacher).first()
        department = hod.department if hod else (staff.department if staff else None)

        exams = Exam.objects.filter(
            class_course___class__department_level_degree__department=department
        )

        data = []
        for exam in exams:
            for eet in ExamExamType.objects.filter(exam=exam):
                total = ExamResult.objects.filter(exam_exam_type=eet).count()
                published = ExamResult.objects.filter(exam_exam_type=eet, is_published=True).count()
                data.append({
                    "exam_exam_type_id": eet.id,
                    "course": exam.class_course.course.name,
                    "class": exam.class_course._class.name,
                    "exam_type": eet.exam_type.name,
                    "exam_date": eet.exam_date,
                    "total_results": total,
                    "published_results": published,
                    "is_fully_published": total > 0 and total == published,
                })

        return response.Response({"data": data})

# complaint view
class ComplaintViewset(viewsets.ModelViewSet):
    
    permission_classes = [permissions.IsAuthenticated]
    # for getting the diverse serializer classes
    def get_serializer_class(self):
        if hasattr(self.request.user,"teacher"):
            return ComplaintStaffSerializer
        
        if hasattr(self.request.user,"student"):
            return ComplaintSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user,"teacher"):
            return Complaint.objects.filter(
                exam_exam_type__exam__class_course___class__department_level_degree__department = user.teacher.department
            ).order_by("-created_at").all()
        
        return Complaint.objects.filter(student=user.student)
    
    def perform_create(self,serializer):
        
        student = self.request.user.student
        
        exam_exam_type_id = self.request.data.get("exam_exam_type_id")
        
        # get the exact exam_exam_type
        exam_exam_type = ExamExamType.objects.filter(id=exam_exam_type_id).first()
        
        if not exam_exam_type:
            raise serializers.ValidationError({"error":"Exam exam type not found."})
        
        complaint = serializer.save(
            exam_exam_type=exam_exam_type,
            student=student,
            concern=self.request.data.get("concern"),
            evidence=self.request.FILES.get("evidence"),
            status = Complaint.Status.SUBMITTED
        )
        
class TranscriptView(APIView):
    """Student requests a transcript; staff/HOD/director validate it."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Student: fetch own transcripts
        if user.user_type == "Student":
            student = getattr(user, "student", None)
            if not student:
                return response.Response({"error": "Student not found."}, status=404)
            transcripts = Transcript.objects.filter(student=student).order_by("-requested_at")
        else:
            # Director sees all; HOD/Staff sees their dept
            teacher = getattr(user, "teacher", None)
            if user.user_type == "Admin":
                # get all the departments in the school
                director = getattr(user,"director")
                school = director.school if director else None
                
                if not school:
                    return response.Response({"error":"No schools assigned to this director"})
                 
                departments = Department.objects.filter(school=school)
                
                # get transcripts of students enrolled in courses within those department
                transcripts = Transcript.objects.filter(
                    student__studentclasscourse__class_course___class__department_level_degree__department__in=departments
                ).distinct().order_by("-requested_at")
            elif teacher:
                dept = teacher.department
                transcripts = Transcript.objects.filter(
                    student__studentclasscourse__class_course___class__department_level_degree__department=dept
                ).distinct().order_by("-requested_at")
            else:
                return response.Response({"error": "Not authorised."}, status=403)

        data = []
        for t in transcripts:
            # Gather published results for the student
            results_qs = ExamResult.objects.filter(
                student=t.student, is_published=True
            ).select_related(
                "exam_exam_type__exam__class_course__course",
                "exam_exam_type__exam__class_course",
                "exam_exam_type__exam_type",
            )
            results = []
            for r in results_qs:
                cc = r.exam_exam_type.exam.class_course
                results.append({
                    "course":        cc.course.name,
                    "course_code":   cc.course.code,
                    "credits":       cc.credit,
                    "semester":      cc.semester_num,
                    "academic_year": cc.academic_year,
                    "exam_type":     r.exam_exam_type.exam_type.name,
                    "mark":          str(r.mark_obtained),
                    "remark":        r.remark,
                })

            data.append({
                "id":                   t.id,
                "student_name":         t.student.user.fullname(),
                "student_matricule":    t.student.matricule,
                "student_email":        t.student.school_mail,
                "academic_year":        t.academic_year,
                "status":               t.status,
                "requested_at":         t.requested_at,
                "validated_at":         t.validated_at,
                "notes":                t.notes,
                "has_director_sig":     t.director_signature_id is not None,
                "has_hod_sig":          t.hod_signature_id is not None,
                "has_staff_sig":        t.staff_signature_id is not None,
                "director_sig_url":     request.build_absolute_uri(t.director_signature.image.url) if t.director_signature else None,
                "hod_sig_url":          request.build_absolute_uri(t.hod_signature.image.url) if t.hod_signature else None,
                "staff_sig_url":        request.build_absolute_uri(t.staff_signature.image.url) if t.staff_signature else None,
                "results":              results,
            })
        return response.Response(data)

    def post(self, request):
        """Student creates a transcript request."""
        user = request.user
        if user.user_type != "Student":
            return response.Response({"error": "Only students can request transcripts."}, status=403)
        student = getattr(user, "student", None)
        if not student:
            return response.Response({"error": "Student profile not found."}, status=404)

        academic_year = request.data.get("academic_year", "")
        # Prevent duplicate pending requests
        existing = Transcript.objects.filter(student=student, status=Transcript.Status.PENDING).first()
        if existing:
            return response.Response({"error": "You already have a pending transcript request."}, status=400)

        transcript = Transcript.objects.create(student=student, academic_year=academic_year)
        return response.Response({"message": "Transcript request submitted.", "id": transcript.id}, status=201)


class TranscriptValidateView(APIView):
    """Director/HOD/Staff signs a transcript with their stored signature."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, transcript_id):
        user = request.user
        transcript = Transcript.objects.filter(id=transcript_id).first()
        if not transcript:
            return response.Response({"error": "Transcript not found."}, status=404)

        action = request.data.get("action", "validate")  # validate | reject

        if action == "reject":
            transcript.status = Transcript.Status.REJECTED
            transcript.notes = request.data.get("notes", "")
            transcript.validated_at = timezone.now()
            transcript.save()
            return response.Response({"message": "Transcript rejected."})

        # Get signer's signature
        sig = None
        role = None
        if user.user_type == "Admin" and hasattr(user, "director"):
            sig = user.director.signature
            role = "director"
        elif user.user_type == "Teacher" and hasattr(user, "teacher"):
            if user.teacher.is_hod and hasattr(user.teacher, "hod"):
                sig = user.teacher.hod.signature
                role = "hod"
            elif user.teacher.is_staff and hasattr(user.teacher, "staff"):
                sig = user.teacher.staff.signature
                role = "staff"

        if not sig:
            return response.Response(
                {"error": "You have no signature on file. Please upload your signature in your profile first."},
                status=400,
            )

        # Attach signature
        if role == "director":
            transcript.director_signature = sig
        elif role == "hod":
            transcript.hod_signature = sig
        elif role == "staff":
            transcript.staff_signature = sig

        transcript.status = Transcript.Status.VALIDATED
        transcript.validated_at = timezone.now()
        transcript.notes = request.data.get("notes", transcript.notes)
        transcript.save()

        return response.Response({"message": f"Transcript validated by {role}.", "status": transcript.status})


class ClassRankingView(APIView):
    """Returns class ranking + averages for a semester (student sees own rank)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, semester_num):
        user = request.user
        student = getattr(user, "student", None)
        if not student:
            return response.Response({"error": "Student not found."}, status=404)

        # Find the class the student is enrolled in for this semester
        enrollment = StudentClassCourse.objects.filter(
            student=student,
            class_course__semester_num=semester_num,
        ).first()
        if not enrollment:
            return response.Response({"data": [], "my_rank": None, "class_average": None})

        target_class = enrollment.class_course._class

        # All students in that class this semester
        enrollments = StudentClassCourse.objects.filter(
            class_course___class=target_class,
            class_course__semester_num=semester_num,
        ).values_list("student", flat=True).distinct()

        student_averages = []
        for sid in enrollments:
            results = ExamResult.objects.filter(
                student_id=sid,
                exam_exam_type__exam__class_course__semester_num=semester_num,
                exam_exam_type__exam__class_course___class=target_class,
                is_published=True,
                mark_obtained__isnull=False,
            )
            count = results.count()
            if count == 0:
                continue
            total = sum(float( r.mark_obtained / r.exam_exam_type.max_mark * 100) for r in results)
            avg = round(total / count, 2)
            s = Student.objects.get(id=sid)
            student_averages.append({
                "student_id":   sid,
                "name":         s.user.fullname(),
                "matricule":    s.matricule,
                "average":      avg,
                "is_me":        sid == student.id,
            })

        # Sort by average descending
        student_averages.sort(key=lambda x: x["average"], reverse=True)
        for i, s in enumerate(student_averages):
            s["rank"] = i + 1

        class_avg = round(
            sum(s["average"] for s in student_averages) / len(student_averages), 2
        ) if student_averages else None

        my_rank = next((s["rank"] for s in student_averages if s["is_me"]), None)

        return response.Response({
            "class_name":    target_class.name,
            "semester":      semester_num,
            "class_average": class_avg,
            "my_rank":       my_rank,
            "total_students": len(student_averages),
            "ranking":       student_averages,
        })
