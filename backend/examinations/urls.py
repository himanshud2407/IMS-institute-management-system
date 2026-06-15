from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ExamResultViewSet, ExamViewSet

router = DefaultRouter()
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'results', ExamResultViewSet, basename='exam-result')

urlpatterns = [
    path('', include(router.urls)),
]
