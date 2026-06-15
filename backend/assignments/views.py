from django.db.models import Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsAdminOrTeacher, IsStudent
from .models import Assignment, AssignmentSubmission
from .serializers import (
    AssignmentGradeSerializer,
    AssignmentSerializer,
    AssignmentSubmissionSerializer,
)


class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subject', 'teacher', 'status']
    search_fields = ['title', 'description', 'subject__name', 'subject__code']
    ordering_fields = ['due_date', 'created_at', 'title']

    def get_queryset(self):
        queryset = Assignment.objects.select_related(
            'subject', 'subject__course', 'teacher', 'teacher__user'
        ).prefetch_related('submissions', 'submissions__student', 'submissions__student__user')
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
            return queryset.filter(
                subject__course=student.course,
                status=Assignment.Status.PUBLISHED,
            )
        return queryset.none()

    def get_permissions(self):
        if self.action == 'submissions':
            return [IsAuthenticated(), IsAdminOrTeacher()]
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), IsAdminOrTeacher()]
        if self.action == 'destroy':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['get'], url_path='submissions')
    def submissions(self, request, pk=None):
        assignment = self.get_object()
        submissions = assignment.submissions.select_related(
            'student', 'student__user', 'graded_by', 'graded_by__user'
        )
        serializer = AssignmentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSubmissionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['assignment', 'student', 'status']
    search_fields = ['assignment__title', 'student__user__full_name', 'student__roll_number']
    ordering_fields = ['submitted_at', 'graded_at', 'marks_obtained']

    def get_queryset(self):
        queryset = AssignmentSubmission.objects.select_related(
            'assignment', 'assignment__subject', 'student', 'student__user',
            'graded_by', 'graded_by__user'
        )
        user = self.request.user

        if user.role == 'ADMIN':
            return queryset
        if user.role == 'TEACHER':
            try:
                teacher = user.teacher_profile
            except Exception:
                return queryset.none()
            return queryset.filter(
                Q(assignment__teacher=teacher) | Q(assignment__subject__teacher=teacher)
            ).distinct()
        if user.role == 'STUDENT':
            try:
                student = user.student_profile
            except Exception:
                return queryset.none()
            return queryset.filter(student=student)
        return queryset.none()

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsStudent()]
        if self.action in ['update', 'partial_update']:
            return [IsAuthenticated()]
        if self.action in ['destroy', 'grade']:
            return [IsAuthenticated(), IsAdminOrTeacher()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['patch'], url_path='grade')
    def grade(self, request, pk=None):
        submission = self.get_object()
        serializer = AssignmentGradeSerializer(
            data=request.data,
            context={'submission': submission},
        )
        serializer.is_valid(raise_exception=True)

        graded_by = None
        if request.user.role == 'TEACHER':
            graded_by = request.user.teacher_profile

        submission.marks_obtained = serializer.validated_data['marks_obtained']
        submission.feedback = serializer.validated_data.get('feedback', '')
        submission.status = serializer.validated_data['status']
        submission.graded_by = graded_by
        submission.graded_at = timezone.now()
        submission.save()

        return Response(
            AssignmentSubmissionSerializer(submission).data,
            status=status.HTTP_200_OK,
        )
