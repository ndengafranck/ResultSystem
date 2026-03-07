from rest_framework import serializers

# import all the models of the structure
from .models import *


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        exclude = ["external_id","logo"]
        
    

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        exclude = ["external_id","logo"]
        

class LevelDegreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelDegree
        exclude = ["external_id"]
        

class DepartmentLevelDegreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentLevelDegree
        exclude = ["external_id"]

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        exclude = ["external_id"]