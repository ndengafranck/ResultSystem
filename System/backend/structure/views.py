from rest_framework import viewsets,permissions,response
from rest_framework.views import APIView 

from .models import *
from core.permissions import IsDirector,IsHOD
from .serializers import *
from user.models import *



class SchoolViewset(viewsets.ModelViewSet):
   
    serializer_class = SchoolSerializer
    permission_classes = [IsDirector]
    
    def get_queryset(self):
        director = getattr(self.request.user, 'director', None)
        if director and director.school:
            return School.objects.filter(id=director.school.id)
        return School.objects.none()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class DepartmentViewset(viewsets.ModelViewSet):
    
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'director'):
            director = user.director
            if director and director.school:
                return Department.objects.filter(school=director.school).order_by("-created_at")
            return Department.objects.none()
        # HOD/Staff/Teachers can also read departments
        return Department.objects.all().order_by("-created_at")
    
    
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
            
        
    

class ClassView(APIView):
    
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    
    def get(self,request,id=None):
        user = request.user
        
        if id:
            try:
                _class = Class.objects.get(id=id)
                count_students = StudentClassCourse.objects.filter(class_course___class=_class).values("student").distinct().count()
                level_degree = DepartmentLevelDegree.objects.filter(id=_class.department_level_degree_id).first()
                data = {
                    "id":_class.id,
                    "name":_class.name,
                    "level":_class.level,
                    "level_degree": level_degree.level_degree.name,
                    "num_students": count_students,
                }
                return response.Response(data)
            except Class.DoesNotExist:
                return response.Response({"message":"Class not found"})
            
        if user.user_type == "Admin":
            # get the schools in department
            school = user.director.school
            department = request.query_params.get('department')
            
            if department:
                department = Department.objects.filter(id=department).first()
                print(f"Department :{department}")
                classes = Class.objects.filter(
                department_level_degree__department__id=department.id
                )
                data = [{
                'id': c.id,
                'name': c.name,
                 }
                for c in classes]
            else:
                departments = Department.objects.filter(school=school)
                
                classes = Class.objects.filter(
                    department_level_degree__department__in=departments
                )
                data = [{
                    'id': c.id,
                    'name': c.name,
                    
                }
                for c in classes]
            return response.Response(data)
        
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
                count_students = StudentClassCourse.objects.filter(class_course___class=_class).values("student").distinct().count()
                data.append({
                    "id":_class.id,
                    "name":_class.name,
                    "level":_class.level,
                    "level_degree": level_degree.level_degree.name,
                    "num_students": count_students,
                })
            
            
            return response.Response(data)
    