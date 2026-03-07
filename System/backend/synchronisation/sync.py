from user.models import *
from structure.models import *
from academics.models import *
from .pairing import Pairer
from .fetch import FetchData
from .checks import TeacherRole
# TO manage images
from django.core.files.base import ContentFile
from PIL import Image
import io
import base64
# instantiate the Pairer class & FetchData class
pairer = Pairer()
fetchdata = FetchData()
teacher_role = TeacherRole()
# Synchronisation class
class Sync:
    def sync_user(self):
        users_pair_role = pairer.user_type_pairer()
        
        for pair in users_pair_role:
            user,role = pair
            id,fullname,email,phone,gender,dob,user_type = user
            
            # unpacking first and last name
            parts = fullname.split()
            
            # Extract the password from the role pair
            password = role[0]
            
            db_user,created = User.objects.update_or_create(
                external_id = id,
                defaults={
                    'username': parts[0]+"."+"".join(parts[1:]),
                    'first_name': parts[0],
                    'last_name': " ".join(parts[1:]),
                    'email': email,
                    'phone': phone,
                    'gender': gender,
                    'dob': dob,
                    'user_type': user_type
                }
            )
            
            if created:
                db_user.set_password(password)
                
            db_user.save()
        print("===========================")
        print("User Synchronisation Done!!")
        print("===========================")
        return True
# Teacher's Role synchronisations
    def sync_user_role(self):
        pairs = pairer.user_type_pairer()
        for pair in pairs:
            user,role = pair
            id,fullname,email,phone,gender,dob,user_type = user
            if user_type == 'Admin':
                matricule,admin_id,profile_pic = role
                
                user_model = User.objects.filter(external_id=id).first()
                db_director,created = Director.objects.update_or_create(
                    external_id = admin_id,
                    defaults={
                        "matricule": matricule,
                        "user": user_model
                    }
                )
            
                if profile_pic:
                    
                    img = Image.open(io.BytesIO(profile_pic))
                    ext = img.format.lower()
                    filename = f"admin_{admin_id}_profile_pic.{ext}"
                    db_director.profile_pic.save(filename,ContentFile(profile_pic),save=True)
                    print("===========================")
                    print("Admins Synchronisation Done!!")
                    print("===========================")
                db_director.save()
                
                    
            elif user_type == 'Teacher':
                # print(user)
                matricule,teacher_id,school_email,department_id,profile_pic = role
                user_model = User.objects.filter(external_id=id).first()
                dept_model = Department.objects.filter(external_id=department_id).first()
                db_teacher,created = Teacher.objects.update_or_create(
                    external_id = teacher_id,
                    defaults={
                        "matricule": matricule,
                        "school_mail": school_email,
                        "user": user_model, 
                        "department": dept_model,
                        "is_hod": teacher_role.isHod(teacher_id),
                        "is_staff": teacher_role.isStaff(teacher_id)
                    }
                )
                # Save first the teacher before saving the specific role
                
                if profile_pic:
                    img = Image.open(io.BytesIO(profile_pic))
                    ext = img.format.lower()
                    filename = f"teacher_{teacher_id}_profile_pic.{ext}"
                    db_teacher.profile_pic.save(filename,ContentFile(profile_pic),save=True)
                    
                    print("===========================")
                    print("Teachers Synchronisation Done!!")
                    print("===========================")
                db_teacher.save()
                    
                if teacher_role.isHod(teacher_id):
                    t = fetchdata.fetch_hod_by_teacher_id(teacher_id)
                    t_id,t_id,t_department_id = t
                    t_dpt = Department.objects.filter(external_id=t_department_id).first()
                    t_tch_id = Teacher.objects.filter(external_id=t_id).first()
                    db_hod,hod_created = HOD.objects.update_or_create(
                        external_id = t_id,
                        defaults={
                            'department': t_dpt,
                            'teacher': t_tch_id
                        }
                    )
                    
                    db_hod.save()
                        
                elif teacher_role.isStaff(teacher_id):
                    t = fetchdata.fetch_staff_by_teacher_id(teacher_id)
                    t_id,t_id,t_department_id = t
                    t_dpt = Department.objects.filter(external_id=t_department_id).first()
                    t_tch_id = Teacher.objects.filter(external_id=t_id).first()
                    db_staff,staff_created = Staff.objects.update_or_create(
                        external_id = t_id,
                        defaults={
                            'department': t_dpt,
                            'teacher': t_tch_id
                        }
                    )
                    if staff_created:
                        db_staff.save()
                        
                else:
                    pass
                
            elif user_type == 'Student':
                # print(user)
                matricule,student_id,school_email,profile_pic,enrollment_year = role
                user_model = User.objects.filter(external_id=id).first()
                db_student,created = Student.objects.update_or_create(
                    external_id = student_id,
                    defaults={
                        "matricule": matricule,
                        "school_mail": school_email,
                        "user": user_model,
                        "enrolled_year": enrollment_year
                    }
                )
               
                if profile_pic:
                    img = Image.open(io.BytesIO(profile_pic))
                    ext = img.format.lower()
                    filename = f"student_{student_id}_profile_pic.{ext}"
                    db_student.profile_pic.save(filename,ContentFile(profile_pic),save=True)
                    
                    print("===========================")
                    print("Students Synchronisation Done!!")
                    print("===========================")
                db_student.save()
                    
                    
                    
            else:
                pass
        print("===========================")
        print("Roles Synchronisation Done!!")
        print("===========================")
        
    def sync_structure(self,model:str):
        
        if model == "School":
            schools = fetchdata.fetch_school()
            
            for school in schools:
                id,name,logo,code = school
                
                db_school,created = School.objects.update_or_create(
                    external_id = id,
                    defaults={
                        'name': name,
                        'code': code
                    }
                )
                
                if logo:
                    img = Image.open(io.BytesIO(logo))
                    ext = img.format.lower()
                    filename = f"school_{id}_logo.{ext}"
                    db_school.logo.save(filename,ContentFile(logo),save=True)
                
                db_school.save()
            print("===========================")
            print("Schools sync Done!")
            print("===========================")
            
        if model == "Department":
            departments = fetchdata.fetch_department()
            
            for department in departments:
                id,name,logo,code,school_id = department
                sch = School.objects.filter(external_id=school_id).first()
                db_department,created = Department.objects.update_or_create(
                    external_id = id,
                    defaults={
                        'name': name,
                        'code': code,
                        'school': sch
                    }
                )
                
                if logo:
                    img = Image.open(io.BytesIO(logo))
                    ext = img.format.lower()
                    filename = f"department_{id}_logo.{ext}"
                    db_department.logo.save(filename,ContentFile(logo),save=True)
                db_department.save()
            print("===========================")
            print("Departments sync Done!")
            print("===========================")
        if model == "LevelDregee":
            level_degrees = fetchdata.fetch_level_degree()
            
            for level_degree in level_degrees:
                id,name,code = level_degree
                db_level_degree,created = LevelDegree.objects.update_or_create(
                    external_id = id,
                    defaults={
                        'name': name,
                        'code': code,
                    }
                )
                
                db_level_degree.save()
            print("===========================")
            print("LevelDegree sync Done!")
            print("===========================")
        if model == "DepartmentLevelDegree":
            department_degrees = fetchdata.fetch_level_department()
            
            for department_degree in department_degrees:
                id,dept_id,level_id,num_levels = department_degree
                dept = Department.objects.filter(external_id=dept_id).first()
                level_deg = LevelDegree.objects.filter(external_id=level_id).first()
                db_dept_degree,created = DepartmentLevelDegree.objects.update_or_create(
                    external_id = id,
                    defaults={
                        'department': dept,
                        'level_degree': level_deg,
                        'num_levels':num_levels
                    }
                )
                
                if created:
                    db_dept_degree.save()
            print("===========================")
            print("DepartmentDegree sync Done!")
            print("===========================")
        if model == "Class":
            classes = fetchdata.fetch_class()
                        
            for _class in classes:
                id,name,level_number,department_degree_id = _class
                dept_deg = DepartmentLevelDegree.objects.filter(external_id=department_degree_id).first()
                db_class,created = Class.objects.update_or_create(
                    external_id = id,
                    defaults={
                        'name': name,
                        'level': level_number,
                        'department_level_degree': dept_deg
                    }
                )
                
                
                db_class.save()
            print("===========================")
            print("Classes sync Done!")
            print("===========================")
            
    def sync_academic(self,model:str):
        
        if model == "Course":
            courses = fetchdata.fetch_course()
            
            for course in courses:
                id,code,name,description = course
                
                db_course,created = Course.objects.update_or_create(
                    external_id = id,
                    defaults={
                        "code":code,
                        "name":name,
                        "desc":description
                    }
                )
                
                if created:
                    db_course.save()
                
            print("===========================")
            print("Courses sync Done!")
            print("===========================")
            
        if model == "CourseType":
            course_types = fetchdata.fetch_course_type()
            
            for course_type in course_types:
                id,name,description = course_type
                
                db_course_type,created = CourseType.objects.update_or_create(
                    external_id = id,
                    defaults={
                        "name":name,
                        "desc":description
                    }
                )
                
            
                db_course_type.save()
                
            print("===========================")
            print("CourseTypes sync Done!")
            print("===========================")
            
        if model == "ClassCourse":
            class_courses = fetchdata.fetch_class_course()
            
            for class_course in class_courses:
                id,class_id,course_id,category_id,academy_year,semester_num,credit = class_course
                
                _class = Class.objects.filter(external_id=class_id).first()
                course = Course.objects.filter(external_id=course_id).first()
                course_type = CourseType.objects.filter(external_id=category_id).first()
                db_class_course,created = ClassCourse.objects.update_or_create(
                    external_id = id,
                    defaults={
                        "_class":_class,
                        "course":course,
                        "course_type":course_type,
                        "credit":credit,
                        "academic_year": academy_year,
                        "semester_num": semester_num
                    }
                )
                
                
                db_class_course.save()
                
            print("===========================")
            print("CourseClasses sync Done!")
            print("===========================")
        
        
        if model == "Exam":
            exams = fetchdata.fetch_exam()
            
            for exam in exams:
                id,class_course_id = exam
                
                class_course = ClassCourse.objects.filter(external_id=class_course_id).first()
                db_exam,created = Exam.objects.update_or_create(
                    external_id = id,
                    defaults={
                        "class_course":class_course
                    }
                )
                
                
                db_exam.save()
                
            print("===========================")
            print("Exams sync Done!")
            print("===========================")
        if model == "ExamType":
            exam_types = fetchdata.fetch_exam_type()
            
            for exam_type in exam_types:
                id, name, description = exam_type
                
                db_exam_type,created = ExamType.objects.update_or_create(
                    external_id = id,
                    defaults={
                        "name":name
                    }
                )
                
                db_exam_type.save()
                
            print("===========================")
            print("ExamTypes sync Done!")
            print("===========================")
        if model == "ExamExamType":
            exam_exam_types = fetchdata.fetch_exam_exam_type()
            
            for exam_exam_type in exam_exam_types:
                id,exam_id,exam_type_id,exam_date,weight_percentage,max_mark = exam_exam_type
                exam = Exam.objects.filter(external_id=exam_id).first()
                exam_type = ExamType.objects.filter(external_id=exam_type_id).first()
                db_exam_exam_type,created = ExamExamType.objects.update_or_create(
                    external_id = id,
                    defaults={
                        "exam":exam,
                        "exam_type":exam_type,
                        "exam_date":exam_date,
                        "weight_percent": weight_percentage,
                        "max_mark": max_mark
                    }
                )
                
                db_exam_exam_type.save()
                
            print("===========================")
            print("ExamExamTypes sync Done!")
            print("===========================")
        if model == "TeacherAssignment":
            teacher_assignments = fetchdata.fetch_teacher_assignment()
            
            for teacher_assingment in teacher_assignments:
                id,teacher_id,class_course_id,academic_year,semester_num = teacher_assingment
                teacher = Teacher.objects.filter(external_id=teacher_id).first()
                class_course = ClassCourse.objects.filter(external_id=class_course_id).first()
                
                db_teacher_assignment,created = TeacherAssignment.objects.update_or_create(
                    external_id = id,
                    defaults = {
                        "teacher":teacher,
                        "class_course":class_course,
                        "academic_year":academic_year,
                        "semester_num":semester_num
                    }
                )
                
                db_teacher_assignment.save()
                
            print("===========================")
            print("Teacher Assigned sync Done!")
            print("===========================")
                
        if model == "StudentClassCourse":
            student_class_courses = fetchdata.fetch_student_class_course()
            
            for student_class_course in student_class_courses:
                id,student_id,class_course_id,status,enrollment_date = student_class_course
                
                student = Student.objects.filter(external_id=student_id).first()
                class_course = ClassCourse.objects.filter(external_id=class_course_id).first()
                db_student_class_course,created = StudentClassCourse.objects.update_or_create(
                    external_id = id,
                    defaults={
                        "student":student,
                        "class_course":class_course,
                        "status":status,
                        "enrolled_date": enrollment_date
                    }
                )
                
                db_student_class_course.save()
                
            print("===========================")
            print("Student Enrollment sync Done!")
            print("===========================")