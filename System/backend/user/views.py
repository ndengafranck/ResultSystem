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
    queryset = User.objects.all()
    serializer_class = PasswordUpdateSerializer
    lookup_field = "email"


# Password reset APIView
class ResetPasswordView(RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = PasswordResetSerializer
    lookup_field = "email"

# The student enrollement view
# Getting the student's courses based on academic_year
class StudentClassCourseView(APIView):
    permission_classes = [IsStudent]
    
    def get(self,request,academic_year):
        user = self.request.user
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
            

# class UserInformationView(APIView):
#     permission_classes = [IsAuthenticated]
    