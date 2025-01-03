from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render

# Custom 404 view
def custom_404_view(request, exception=None):
    return render(request, '404.html', status=404)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core_first_app.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Custom error handlers
handler404 = custom_404_view

# Optional: Catch-all pattern for unmatched routes (use sparingly)
urlpatterns += [
    re_path(r'^.*$', custom_404_view),  # This will handle unmatched routes
]
