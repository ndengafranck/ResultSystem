from structure.models import Department
from .models import Announcement, Timetable
from .serializers import AnnouncementSerializer, TimetableSerializer
from rest_framework import viewsets, serializers
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from academics.models import ExamResult
from user.models import Student


class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    queryset = Announcement.objects.all()

    def _director_school_departments(self, user):
        """Return departments that belong to the director's school."""
        director = getattr(user, "director", None)
        if not director or not director.school:
            return Department.objects.none()
        return Department.objects.filter(school=director.school)

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, "director"):
            # Director sees only announcements in his school
            school_depts = self._director_school_departments(user)
            return Announcement.objects.filter(
                Q(target_type=Announcement.TargetType.UNIVERSITY) |
                Q(target_type=Announcement.TargetType.DEPARTMENT, target_department__in=school_depts) |
                Q(target_type=Announcement.TargetType.CLASS,
                  target_class__department_level_degree__department__in=school_depts)
            ).order_by("-created_at")

        elif hasattr(user, "teacher"):
            return Announcement.objects.filter(
                Q(target_type=Announcement.TargetType.UNIVERSITY) |
                Q(target_type=Announcement.TargetType.DEPARTMENT, target_department=user.teacher.department)
            ).order_by("-created_at")

        elif hasattr(user, "student"):
            student_classes = user.student.studentclasscourse_set.values_list(
                "class_course___class", flat=True
            )
            student_departments = Department.objects.filter(
                departmentleveldegree__class__in=student_classes
            ).distinct()
            return Announcement.objects.filter(
                Q(target_type=Announcement.TargetType.UNIVERSITY) |
                Q(target_type=Announcement.TargetType.DEPARTMENT, target_department__in=student_departments) |
                Q(target_type=Announcement.TargetType.CLASS, target_class__in=student_classes)
            ).order_by("-created_at")

        return Announcement.objects.none()

    def perform_create(self, serializer):
        user        = self.request.user
        target_type = serializer.validated_data.get("target_type")

        if hasattr(user, "director"):
            school_depts = self._director_school_departments(user)

            # Director can only target departments/classes in his school
            if target_type == Announcement.TargetType.DEPARTMENT:
                target_dept = serializer.validated_data.get("target_department")
                if target_dept and target_dept not in school_depts:
                    raise serializers.ValidationError(
                        "You can only send announcements to departments in your school."
                    )
            elif target_type == Announcement.TargetType.CLASS:
                target_class = serializer.validated_data.get("target_class")
                if target_class and target_class.department_level_degree.department not in school_depts:
                    raise serializers.ValidationError(
                        "You can only send announcements to classes in your school."
                    )
            # UNIVERSITY type is fine for directors
            serializer.save(sender=user)
            return

        elif hasattr(user, "teacher"):
            if target_type == Announcement.TargetType.UNIVERSITY:
                raise serializers.ValidationError("Only directors can send university-wide announcements.")
            if target_type == Announcement.TargetType.DEPARTMENT:
                target_dept = serializer.validated_data.get("target_department")
                if target_dept != user.teacher.department:
                    raise serializers.ValidationError("You can only send announcements to your department.")
            elif target_type == Announcement.TargetType.CLASS:
                target_class = serializer.validated_data.get("target_class")
                if target_class.department_level_degree.department != user.teacher.department:
                    raise serializers.ValidationError("You can only send announcements to classes in your department.")
            serializer.save(sender=user)
            return

        raise serializers.ValidationError("You don't have permission to send announcements.")


class TimetableViewSet(viewsets.ModelViewSet):
    serializer_class = TimetableSerializer
    permission_classes = [IsAuthenticated]
    queryset = Timetable.objects.all()

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, "director"):
            director = user.director
            if director.school:
                school_depts = Department.objects.filter(school=director.school)
                return Timetable.objects.filter(department__in=school_depts).distinct()
            return Timetable.objects.none()

        elif hasattr(user, "student"):
            student_classes = user.student.studentclasscourse_set.values_list(
                "class_course___class", flat=True
            )
            return Timetable.objects.filter(classes___class__in=student_classes).distinct()

        elif hasattr(user, "teacher"):
            return Timetable.objects.filter(department=user.teacher.department)

        return Timetable.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, "teacher"):
            raise serializers.ValidationError("Only teachers can upload timetables.")
        serializer.save(uploaded_by=user, department=user.teacher.department)
