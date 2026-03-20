from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnnouncementViewSet, TimetableViewSet

router = DefaultRouter()
router.register('announcements', AnnouncementViewSet,basename="announcement")
router.register('timetables', TimetableViewSet,basename="timetable")

urlpatterns = [
    path('', include(router.urls)),
]
