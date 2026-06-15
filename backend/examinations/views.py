from django.db.models import Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsAdminOrTeacher
from .models import Exam, ExamResult
from .serializers import ExamResultSerializer, ExamSerializer


class ExamViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subject', 'teacher', 'exam_type', 'status', 'results_published']
    search_fields = ['title', 'description', 'subject__name', 'subject__code']
    ordering_fields = ['exam_date', 'start_time', 'created_at', 'title']

    def get_queryset(self):
        queryset = Exam.objects.select_related(
            'subject', 'subject__course', 'teacher', 'teacher__user'
        ).prefetch_related('results', 'results__student', 'results__student__user')
        user = self.request.user

        if user.role == 'ADMIN':
            return queryset
        if user.role == 'TEACHER':
            try:
                teacher = user.teacher_profile
            except Exception:
                return queryset.none()
            return queryset.filter(Q(teacher=teacher) | Q(subject__teacher=teacher)).distinct()
        if user.role == 'STUDENT':
            try:
                student = user.student_profile
            except Exception:
                return queryset.none()
            return queryset.filter(subject__course=student.course)
        return queryset.none()

    def get_permissions(self):
        if self.action in ['results', 'publish_results']:
            return [IsAuthenticated(), IsAdminOrTeacher()]
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), IsAdminOrTeacher()]
        if self.action == 'destroy':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['get'], url_path='results')
    def results(self, request, pk=None):
        exam = self.get_object()
        results = exam.results.select_related('student', 'student__user', 'entered_by', 'entered_by__user')
        serializer = ExamResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='publish-results')
    def publish_results(self, request, pk=None):
        exam = self.get_object()
        exam.results_published = True
        exam.status = Exam.Status.COMPLETED
        exam.save(update_fields=['results_published', 'status', 'updated_at'])
        exam.results.filter(published_at__isnull=True).update(published_at=timezone.now())
        return Response(ExamSerializer(exam, context={'request': request}).data)


class ExamResultViewSet(viewsets.ModelViewSet):
    serializer_class = ExamResultSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['exam', 'student', 'status']
    search_fields = ['exam__title', 'student__user__full_name', 'student__roll_number']
    ordering_fields = ['marks_obtained', 'created_at', 'updated_at']

    def get_queryset(self):
        queryset = ExamResult.objects.select_related(
            'exam', 'exam__subject', 'student', 'student__user', 'entered_by', 'entered_by__user'
        )
        user = self.request.user

        if user.role == 'ADMIN':
            return queryset
        if user.role == 'TEACHER':
            try:
                teacher = user.teacher_profile
            except Exception:
                return queryset.none()
            return queryset.filter(Q(exam__teacher=teacher) | Q(exam__subject__teacher=teacher)).distinct()
        if user.role == 'STUDENT':
            try:
                student = user.student_profile
            except Exception:
                return queryset.none()
            return queryset.filter(student=student, exam__results_published=True)
        return queryset.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrTeacher()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()
