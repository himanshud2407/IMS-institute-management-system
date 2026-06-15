"""
Backend URL Configuration
=========================
Root URL routing for the IMS backend.

All API endpoints are namespaced under /api/:
    /api/auth/     → Authentication (accounts app)
    /admin/        → Django admin panel

Future phases will add:
    /api/students/     → Phase 2
    /api/teachers/     → Phase 2
    /api/courses/      → Phase 2
    /api/subjects/     → Phase 2
    /api/attendance/   → Phase 3
    /api/assignments/  → Phase 4
    /api/exams/        → Phase 5
    /api/results/      → Phase 5
    /api/fees/         → Phase 6
    /api/notifications/ → Phase 7
    /api/reports/      → Phase 8
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/auth/', include('accounts.urls', namespace='accounts')),
    path('api/', include('courses.urls')),
    path('api/', include('subjects.urls')),
    path('api/', include('teachers.urls')),
    path('api/', include('students.urls')),
    path('api/', include('attendance.urls')),
    path('api/', include('assignments.urls')),
    path('api/', include('examinations.urls')),
    path('api/', include('fees.urls')),
    path('api/', include('notifications.urls')),
    path('api/', include('reports.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
