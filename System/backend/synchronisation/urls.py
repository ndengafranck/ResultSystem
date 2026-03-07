from django.urls import path
from .views import sync_data

urlpatterns = [
    path('data/',sync_data,name="sync-data") ,  
]