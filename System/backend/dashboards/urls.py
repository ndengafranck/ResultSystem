from django.urls import path

from .views import director_dashboard

urlpatterns = [
    path("director/dashboard",director_dashboard,name="director-dashboard"),
]
