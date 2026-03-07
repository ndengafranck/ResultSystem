from django.db import models
from core.image_write import OverWriteStorage

class School(models.Model):
    external_id = models.IntegerField(null=True,blank=True)
    name = models.CharField(max_length=75,null=False,blank=False)
    code = models.CharField(max_length=45,null=False,blank=False)
    logo = models.ImageField(upload_to="school/logo",storage=OverWriteStorage())
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Code: {self.code} ,Name: {self.name}"


class Department(models.Model):
    external_id = models.IntegerField(null=True,blank=True)
    name = models.CharField(max_length=75,null=False,blank=False)
    code = models.CharField(max_length=45,null=False,blank=False)
    logo = models.ImageField(upload_to="department/logo",storage=OverWriteStorage())
    created_at = models.DateTimeField(auto_now_add=True)
    school = models.ForeignKey(School,on_delete=models.CASCADE,null=False,related_name="departments")
    
    def __str__(self):
        return f"Code: {self.code} ,Name: {self.name}"

class LevelDegree(models.Model):
    external_id = models.IntegerField(null=True,blank=True)
    name = models.CharField(max_length=75,null=False,blank=False)
    code = models.CharField(max_length=45,null=False,blank=False)
    
    def __str__(self):
        return f"Code: {self.code} ,Name: {self.name}"

class DepartmentLevelDegree(models.Model):
    external_id = models.IntegerField(null=True,blank=True)
    department = models.ForeignKey(Department,on_delete=models.CASCADE)
    level_degree = models.ForeignKey(LevelDegree,on_delete=models.CASCADE)
    num_levels = models.IntegerField(null=False,blank=False)
    
    def __str__(self):
        return f"Dpt: {self.department.name}: Level/Degree: {self.level_degree.name}"
    

class Class(models.Model):
    external_id = models.IntegerField(null=True,blank=True)
    name = models.CharField(max_length=75,null=False,blank=False)
    level = models.IntegerField(null=False,blank=False)
    department_level_degree = models.ForeignKey(DepartmentLevelDegree,on_delete=models.SET_NULL,null=True,blank=True)
    
    def __str__(self):
        return f"Name: {self.name}"
    
