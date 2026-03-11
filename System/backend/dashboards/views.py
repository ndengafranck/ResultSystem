from django.shortcuts import render
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response

from core.permissions import *
from structure.models import *

# The various roles dashboards
# Director's Dashboard
@api_view(["GET"])
@permission_classes([IsDirector])
def director_dashboard(request):
    total_schools = School.objects.all().count()
    total_level_degrees = LevelDegree.objects.all().count()
    total_departments = Department.objects.all().count()
    
    data = {
        "total_schools": total_schools,
        "total_level_degrees": total_level_degrees,
        "total_departments": total_departments
        
    }
    
    return Response(data)


# Hod's Dashboard
@api_view(["GET"])
@permission_classes([IsHOD])
def hod_dashboard(request):
    
    total_schools = School.objects.all().count()
    total_level_degrees = LevelDegree.objects.all().count()
    total_departments = Department.objects.all().count()
    
    data = {
        "total_schools": total_schools,
        "total_level_degrees": total_level_degrees,
        "total_departments": total_departments
        
    }
    
    return Response(data)
    

# Staff's Dashboard
@api_view(["GET"])
@permission_classes([IsStaff])
def staff_dashboard(request):
    
    pass


# Student's Dashboard
@api_view(["GET"])
@permission_classes([IsStudent])
def student_dashboard(request):
    pass
    

