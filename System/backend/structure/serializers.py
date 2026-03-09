from rest_framework import serializers

# import all the models of the structure
from .models import *


class SchoolSerializer(serializers.ModelSerializer):
    
    logo = serializers.SerializerMethodField()
    class Meta:
        model = School
        exclude = ["external_id"]
    
    def get_logo(self, obj):
    
        request = self.context.get("request")
        if obj.logo and hasattr(obj.logo, "url"):
            return request.build_absolute_uri(obj.logo.url)
        return None
    

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        exclude = ["external_id"]
        

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