from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("login/",CustomTokenObtainPairView.as_view(),name="token_obtain_pair"),
    path("refresh-token/",TokenRefreshView.as_view(),name="refresh_token"),
    path("user/change-password/<str:email>",UpdatePasswordView.as_view(),name="Update_password"),
    path("user/reset-password/<str:email>",ResetPasswordView.as_view(),name="Reset_password"),
    path("student/<int:academic_year>/courses",StudentClassCourseView.as_view()),
    
]
