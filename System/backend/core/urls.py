
from django.contrib import admin
from django.urls import path,include

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/sync/",include("synchronisation.urls")),
    path("api/user/",include("user.urls")),
    path("api/structure/",include("structure.urls")),
    path("api/academic/",include("academics.urls")),
    path("api/dashboard/",include("dashboards.urls")),
    path("api/announcements/",include("announcements.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
