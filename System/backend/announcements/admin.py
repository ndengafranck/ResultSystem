from django.contrib import admin
from .models import Announcement, AnnouncementFile, Timetable, TimetableClass

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'sender', 'target_type', 'created_at')
    list_filter = ('target_type', 'created_at')
    search_fields = ('title', 'content', 'sender__username')

@admin.register(AnnouncementFile)
class AnnouncementFileAdmin(admin.ModelAdmin):
    list_display = ('announcement', 'file', 'uploaded_at')

@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'uploaded_by', 'uploaded_at')
    list_filter = ('department', 'uploaded_at')

@admin.register(TimetableClass)
class TimetableClassAdmin(admin.ModelAdmin):
    list_display = ('timetable', 'get_class_name')
    
    def get_class_name(self, obj):
        return obj._class.name
    get_class_name.short_description = 'Class'