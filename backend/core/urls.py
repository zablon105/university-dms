from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'KAFU DMS Backend'})


urlpatterns = [
    path('', health_check),
    path('health/', health_check),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/categories/', include('categories.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/workflows/', include('workflows.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)