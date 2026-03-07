
from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/sync/",include("synchronisation.urls")),
    path("api/user/",include("user.urls")),
    path("api/structure/",include("structure.urls")),
    path("api/academic/",include("academics.urls")),
]
