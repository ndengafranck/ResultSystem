from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

router.register("complaints",ComplaintViewset,basename="complaint")

urlpatterns = [
    path("class/<int:class_id>/course",ClassCourseView.as_view()),
    path("exams",ExamExamTypeView.as_view()),
    path("result/upload",ResultUploadView.as_view()),
    path("result/student/retrieve/<int:semester_num>",StudentResultRetrieveView.as_view()),
    path("result/staff/retrieve/<int:semester_num>/<int:class_id>",StaffResultRetrieveView.as_view()),
    path("",include(router.urls)),
]