
from rest_framework import serializers
from .models import *

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"

class CourseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseType
        fiels = "__all__"
        
class ClassCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassCourse
        fields = "__all__"
        
class ExamSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Exam
        fields = "__all__"

class ExamTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamType
        fields = "__all__"
        
class ExamExamTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamExamType
        fields = "__all__"
    
class ExamResultSerializer(serializers.ModelSerializer):
    class_course_id = serializers.IntegerField()
    exam_exam_type_id = serializers.IntegerField()
    resut_file = serializers.FileField()
    
    class Meta:
        model = ExamResult
        exclude = ["student","published_at"]
        
    def validate_result_file(self,value):
        name = value.name.lower()
        
        if not (name.endswith(".csv") or name.endswith(".xlsx") or name.endswith(".xls")):
            raise serializers.ValidationError(
                "Only .csv, .xlsx or .xls files are accepted."
            )
        return value

class ExamResultRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamResult
        
        fields = "__all__"
 
class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        models = Complaint
        fields = "__all__"


