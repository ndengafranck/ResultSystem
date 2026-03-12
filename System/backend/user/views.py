from urllib import request

from django.shortcuts import render
from core.permissions import IsStudent
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView,RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User
from academics.models import ClassCourse
from structure import models,serializers

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UpdatePasswordView(RetrieveUpdateAPIView):
    serializer_class = PasswordUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


# Password reset APIView
class ResetPasswordView(RetrieveUpdateAPIView):
    serializer_class = PasswordResetSerializer
    
    
    def get_object(self):
        return self.request.user

# The student enrollement view
# Getting the student's courses based on academic_year
# Also getting the students in a class
class StudentClassCourseView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request,academic_year=None,class_id=None):
        
        user = self.request.user
        if class_id:
            _class = models.Class.objects.filter(id=class_id).first()
            student_class_courses = StudentClassCourse.objects.filter(class_course___class=_class)
            data = []
            for s_c_c in student_class_courses:
                student = Student.objects.filter(id=s_c_c.student.id).first()
                if not any(d["student_name"] == student.user.fullname() 
                for d in data):
                    data.append({
                        "id": s_c_c.id,
                        "student_id": student.id,
                        "student_name": student.user.fullname(),
                        "student_matricule": student.matricule,
                        "student_email": student.school_mail,
                        "enrolled_year": student.enrolled_year
                    }) 
            return Response(data)
        
        if academic_year and hasattr(user,"student"):
            formated_year = f"{academic_year-1}/{academic_year}"
            student = Student.objects.filter(user=user).first()
            
            student_class_courses = StudentClassCourse.objects.filter(student=student,class_course__academic_year=formated_year)
            data =[]
            for s_c_c in student_class_courses:
                class_course = ClassCourse.objects.filter(id=s_c_c.class_course.id).first()
                _class = models.Class.objects.filter(id=class_course._class.id).first()
                data.append({
                    "id":s_c_c.id,
                    "course_name": s_c_c.class_course.course.name,
                    "course_type": s_c_c.class_course.course_type.name,
                    "credit": s_c_c.class_course.credit,
                    "academic_year": formated_year,
                    "semester_num": s_c_c.class_course.semester_num,
                    "class": _class.name
                    
                })
            
            return Response(data)
            

class UserInformationView(APIView):
    permission_classes = [IsAuthenticated]
    def get_serializer_context(self):
        return {"request": self.request}
    
    def get(self,request):
        user = self.request.user
        data = {}
        if hasattr(user,'student'):
            data["matricule"] = user.student.matricule
            data["role"] = "Student"
            data["profile"] = request.build_absolute_uri(user.student.profile_pic.url) if user.student.profile_pic else None
        elif hasattr(user,'director'):
            data["matricule"] = user.director.matricule
            data["role"] = "Director"
            data["profile"] = request.build_absolute_uri(user.director.profile_pic.url) if user.director.profile_pic else None
        else:
            data["matricule"] = user.teacher.matricule
            data["role"] = "HOD" if user.teacher.is_hod else "Staff"
            data["profile"] = request.build_absolute_uri(user.teacher.profile_pic.url) if user.teacher.profile_pic else None
        
        data.update({
            "id": user.id,
            "fullname": user.fullname(),
            "gender": user.gender,
            "email": user.email,
            "phone": user.phone,
            "dob": user.dob,
            "is_active": user.is_active
            
        })
        
        return Response(data)