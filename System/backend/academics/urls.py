from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

router.register("complaints",ComplaintViewset,basename="complaint")

urlpatterns = [
    path("class/<int:class_id>/course",ClassCourseView.as_view()),
    path("courses",CoursesView.as_view()),
    path("exams",ExamExamTypeView.as_view()),
    path("result/upload",ResultUploadView.as_view()),
    path("department/stats/", DepartmentStatsView.as_view()),
    path("result/publish", ResultPublishmentsView.as_view()),
    path("result/publish/status", ResultPublishmentsView.as_view()),
    path("result/student/retrieve/<int:semester_num>",StudentResultRetrieveView.as_view()),
    path("result/staff/retrieve/<int:semester_num>/<int:class_id>",StaffResultRetrieveView.as_view()),
    path("result/staff/retrieve/<int:student_id>",StaffResultRetrieveView.as_view()),
    path("transcript/", TranscriptView.as_view()),
    path("transcript/<int:transcript_id>/validate/", TranscriptValidateView.as_view()),
    path("result/student/ranking/<int:semester_num>/", ClassRankingView.as_view()),
    # path("complaints/<int:id>/respond",),
    path("",include(router.urls)),
]