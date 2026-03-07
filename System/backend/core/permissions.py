from rest_framework.permissions import BasePermission
from user.models import User

class IsDirector(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == User.UserType.DIRECTOR
    
class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == User.UserType.TEACHER
    
class IsHOD(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated)\
            and (request.user.user_type == User.UserType.TEACHER)\
            and (request.user.teacher.is_hod == True)
            
class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated)\
            and (request.user.user_type == User.UserType.TEACHER)\
            and (request.user.teacher.is_staff == True)

class IsStudent(BasePermission):
    def has_permission(self,request,view):
        return request.user.is_authenticated and request.user.user_type == User.UserType.STUDENT
    
