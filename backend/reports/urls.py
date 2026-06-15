from django.urls import path

from .views import AdminReportsView, DashboardStatsView

urlpatterns = [
    path('reports/dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('reports/admin/', AdminReportsView.as_view(), name='admin-reports'),
]
