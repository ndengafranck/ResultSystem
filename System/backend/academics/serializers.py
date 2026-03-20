
from rest_framework import serializers

from user.serializers import StudentSerializer
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
 
class ComplaintStaffSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    course = serializers.CharField(
        source="exam_exam_type.exam.class_course.course.name"
    )
    class Meta:
        model = Complaint
        fields = "__all__"
    
    def update(self,instance,validated_data):
        new_status = validated_data.get("status").lower()
        if new_status == "rejected":
            instance.status = Complaint.Status.REJECTED
        elif new_status == "approved":
            instance.status = Complaint.Status.APPROVED
        elif new_status == "solved":
            instance.status = Complaint.Status.SOLVED
        elif new_status == "under review":
            instance.status = Complaint.Status.REVIEW
        elif new_status == "responded":
            instance.status = Complaint.Status.RESPONDED
        
        instance.save()
        
        return instance
class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = "__all__"
        read_only_fields = ["student","created_at","status","exam_exam_type","course"]
    


