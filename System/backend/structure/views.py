from rest_framework import viewsets,permissions,response
from rest_framework.views import APIView 
from .models import *
from core.permissions import IsDirector,IsHOD
from .serializers import *
from user.models import HOD, Staff, Teacher



class SchoolViewset(viewsets.ModelViewSet):
   
    serializer_class = SchoolSerializer
    permission_classes = [IsDirector]
    
    def get_queryset(self):
        self.queryset = School.objects.all().order_by("-created_at")
        
        return self.queryset

class DepartmentViewset(viewsets.ModelViewSet):
    
    serializer_class = DepartmentSerializer
    permission_classes = [IsDirector]
    
    def get_queryset(self):
        self.queryset = Department.objects.all().order_by("-created_at")
        
        return self.queryset
    
    
class LevelDegreeViewset(viewsets.ModelViewSet):
    serializer_class = LevelDegreeSerializer
    permission_classes = [IsDirector]
    queryset = LevelDegree.objects.all()
    
    
    
    
class DepartmentLevelDegreeView(APIView):
    
    serializer_class = DepartmentLevelDegreeSerializer
    permission_classes = [IsDirector]
    
    def get(self,request,department_id):
        department = Department.objects.filter(id=department_id).first()
        department_level_degrees = DepartmentLevelDegree.objects.filter(department=department)
        
        data = []
        for d_l_d in department_level_degrees:
            data.append({
                "id":d_l_d.id,
                "level_degree": d_l_d.level_degree.name,
                "num_levels": d_l_d.num_levels
            })
        
        return response.Response(data)
            
        
    

class ClassViewset(viewsets.ModelViewSet):
    
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == "Admin":
            return Class.objects.all()
        
        teacher = Teacher.objects.filter(user=user).first()
        hod = HOD.objects.filter(teacher=teacher).first()
        staff = Staff.objects.filter(teacher=teacher).first()
        
        if hod or staff:
            classes = Class.objects.filter(
                department_level_degree__department=hod.department
            ) if hod else Class.objects.filter(
                department_level_degree__department=staff.department
            )
            data = []
            for _class in classes:
                level_degree = DepartmentLevelDegree.objects.filter(id=_class.department_level_degree_id).first()
                
                data.append({
                    "id":_class.id,
                    "name":_class.name,
                    "level":_class.level,
                    "level_degree": level_degree.level_degree.name,
                    "message": "success"
                })
                
            return data