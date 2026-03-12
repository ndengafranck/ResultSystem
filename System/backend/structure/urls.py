from django.urls import path,include
from rest_framework.routers import DefaultRouter
from structure.views import *


router = DefaultRouter()

router.register("schools",SchoolViewset,basename="school")
router.register("departments",DepartmentViewset,basename="department")
router.register("level-degrees",LevelDegreeViewset,basename="level-degree")

urlpatterns = [
    path("department/<int:department_id>/level-degrees/",DepartmentLevelDegreeView.as_view()),
    path("classes/",ClassView.as_view()),
    path("",include(router.urls))
]

