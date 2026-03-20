from rest_framework import serializers
from .models import Announcement, AnnouncementFile, Timetable, TimetableClass
from academics.models import ExamResult

class AnnouncementFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementFile
        fields = ['id', 'file', 'uploaded_at']

class AnnouncementSerializer(serializers.ModelSerializer):
    files = AnnouncementFileSerializer(many=True, read_only=True)
    uploaded_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'sender', 'sender_name', 'target_type', 
                 'target_class', 'target_department', 'created_at', 'updated_at', 'files', 'uploaded_files']
        read_only_fields = ['sender', 'created_at', 'updated_at']

    def create(self, validated_data):
        
        uploaded_files = validated_data.pop('uploaded_files', [])
        announcement = super().create(validated_data)
        
        for file in uploaded_files:
            AnnouncementFile.objects.create(announcement=announcement, file=file)
        
        return announcement

class TimetableClassSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='_class.name', read_only=True)
    
    class Meta:
        model = TimetableClass
        fields = ['id', '_class', 'class_name']

class TimetableSerializer(serializers.ModelSerializer):
    classes = TimetableClassSerializer(many=True, read_only=True)
    class_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    department_name = serializers.CharField(source='department.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = Timetable
        fields = ['id', 'pdf_file', 'department', 'department_name', 'uploaded_by', 
                 'uploaded_by_name', 'uploaded_at', 'title', 'classes', 'class_ids']
        read_only_fields = ['uploaded_by', 'uploaded_at','department']

    def create(self, validated_data):
        class_ids = validated_data.pop('class_ids', [])
        timetable = super().create(validated_data)
        
        for class_id in class_ids:
            TimetableClass.objects.create(timetable=timetable, _class_id=class_id)
        
        return timetable

class StudentResultSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='exam_exam_type.exam.class_course.course.name', read_only=True)
    course_code = serializers.CharField(source='exam_exam_type.exam.class_course.course.code', read_only=True)
    class_name = serializers.CharField(source='exam_exam_type.exam.class_course._class.name', read_only=True)
    exam_type = serializers.CharField(source='exam_exam_type.exam_type.name', read_only=True)
    semester = serializers.IntegerField(source='exam_exam_type.exam.class_course.semester_num', read_only=True)
    academic_year = serializers.CharField(source='exam_exam_type.exam.class_course.academic_year', read_only=True)

    class Meta:
        model = ExamResult
        fields = ['id', 'course_name', 'course_code', 'class_name', 'exam_type', 
                 'mark_obtained', 'remark', 'submitted_at', 'is_published', 'semester', 'academic_year']