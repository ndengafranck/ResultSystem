from django.urls import path

from .views import director_dashboard, hod_dashboard, staff_dashboard, student_dashboard

urlpatterns = [
    path("director/dashboard", director_dashboard, name="director-dashboard"),
    path("hod/dashboard", hod_dashboard, name="hod-dashboard"),
    path("staff/dashboard", staff_dashboard, name="staff-dashboard"),
    path("student/dashboard", student_dashboard, name="student-dashboard"),
]
