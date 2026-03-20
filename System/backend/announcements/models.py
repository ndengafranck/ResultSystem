from django.db import models
from django.contrib.auth import get_user_model
from structure.models import Department, Class
from user.models import Student

User = get_user_model()

class Announcement(models.Model):
    class TargetType(models.TextChoices):
        CLASS = 'class', 'Class'
        DEPARTMENT = 'department', 'Department'
        UNIVERSITY = 'school', 'School'

    title = models.CharField(max_length=200)
    content = models.TextField()
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    target_type = models.CharField(max_length=20, choices=TargetType.choices)
    target_class = models.ForeignKey(Class, on_delete=models.CASCADE, null=True, blank=True)
    target_department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.sender.username}"

class AnnouncementFile(models.Model):
    announcement = models.ForeignKey(Announcement, related_name='files', on_delete=models.CASCADE)
    file = models.FileField(upload_to='announcements/files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File for {self.announcement.title}"

class Timetable(models.Model):
    pdf_file = models.FileField(upload_to='timetables/')
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=200, default='Timetable')

    def __str__(self):
        return f"Timetable for {self.department.name} by {self.uploaded_by.username}"

class TimetableClass(models.Model):
    timetable = models.ForeignKey(Timetable, related_name='classes', on_delete=models.CASCADE)
    _class = models.ForeignKey(Class, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('timetable', '_class')

    def __str__(self):
        return f"{self.timetable.title} - {self._class.name}"