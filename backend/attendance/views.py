"""
Attendance Views
================
Endpoints:
  GET    /api/attendance/sessions/           — List all sessions (Admin/Teacher)
  POST   /api/attendance/sessions/           — Create session + mark attendance
  GET    /api/attendance/sessions/{id}/      — Session detail with records
  PATCH  /api/attendance/sessions/{id}/      — Update session
  DELETE /api/attendance/sessions/{id}/      — Delete session (Admin only)

  GET    /api/attendance/records/            — List records (filterable by session/student)
  PATCH  /api/attendance/records/{id}/       — Update a single record status

  GET    /api/attendance/summary/            — Student's own attendance summary per subject
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from django.utils import timezone

from .biometrics import compare_face_templates
from .models import AttendanceSession, AttendanceRecord, BiometricProfile
from .serializers import (
    AttendanceSessionSerializer,
    AttendanceSessionCreateSerializer,
    AttendanceRecordSerializer,
    BiometricCheckInSerializer,
    BiometricEnrollmentSerializer,
    BiometricProfileSerializer,
    StudentAttendanceSummarySerializer,
)
from accounts.permissions import IsAdmin, IsAdminOrTeacher
from students.models import Student
from subjects.models import Subject


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attendance sessions.
    - List/Retrieve: Admin or Teacher.
    - Create/Update/Delete: Admin or Teacher.
    """
    queryset = AttendanceSession.objects.select_related(
        'subject', 'subject__course', 'teacher', 'teacher__user'
    ).prefetch_related('records').all()

    filterset_fields = ['subject', 'date', 'teacher']
    search_fields = ['subject__name', 'subject__code', 'topic']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ['date', 'created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return AttendanceSessionCreateSerializer
        return AttendanceSessionSerializer

    def get_permissions(self):
        if self.action in ['enroll_face', 'biometric_check_in']:
            return [IsAuthenticated()]
        if self.action in ['destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated(), IsAdminOrTeacher()]

    def _can_manage_student_biometric(self, request, student):
        if request.user.role in ['ADMIN', 'TEACHER']:
            return True
        if request.user.role != 'STUDENT':
            return False
        try:
            return request.user.student_profile == student
        except Student.DoesNotExist:
            return False

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """
        Returns attendance summary for the currently authenticated student.
        Each entry: { subject, total_sessions, present, absent, late, percentage }
        """
        if request.user.role != 'STUDENT':
            return Response(
                {'detail': 'Only students can view their attendance summary.'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({'detail': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Get all subjects for the student's course
        subjects = Subject.objects.filter(course=student.course, is_active=True)
        summary = []
        for subject in subjects:
            records = AttendanceRecord.objects.filter(
                session__subject=subject,
                student=student
            )
            total = records.count()
            present = records.filter(status=AttendanceRecord.Status.PRESENT).count()
            absent = records.filter(status=AttendanceRecord.Status.ABSENT).count()
            late = records.filter(status=AttendanceRecord.Status.LATE).count()
            percentage = round((present / total) * 100, 1) if total > 0 else 0.0

            summary.append({
                'subject_id': subject.id,
                'subject_name': subject.name,
                'total_sessions': total,
                'present': present,
                'absent': absent,
                'late': late,
                'attendance_percentage': percentage,
            })

        serializer = StudentAttendanceSummarySerializer(summary, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='biometrics/enroll')
    def enroll_face(self, request):
        serializer = BiometricEnrollmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student = serializer.validated_data['student']
        if not self._can_manage_student_biometric(request, student):
            return Response(
                {'detail': 'You cannot enroll biometrics for this student.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        face_template = serializer.context['face_template']
        profile, _ = BiometricProfile.objects.update_or_create(
            student=student,
            defaults={
                'face_template': face_template.value,
                'sample_size': face_template.sample_size,
                'is_active': True,
                'consent_given_at': timezone.now(),
                'enrolled_by': request.user,
            },
        )
        return Response(BiometricProfileSerializer(profile).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='biometrics/check-in')
    def biometric_check_in(self, request):
        serializer = BiometricCheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session = serializer.validated_data['session']
        student = serializer.validated_data['student']
        if not self._can_manage_student_biometric(request, student):
            return Response(
                {'detail': 'You cannot mark biometric attendance for this student.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            profile = student.biometric_profile
        except BiometricProfile.DoesNotExist:
            return Response(
                {'detail': 'Student does not have an active biometric enrollment.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not profile.is_active:
            return Response({'detail': 'Student biometric enrollment is inactive.'}, status=status.HTTP_400_BAD_REQUEST)

        candidate = serializer.context['face_template']
        confidence = compare_face_templates(profile.face_template, candidate.value)
        if confidence < 100:
            return Response(
                {'detail': 'Face verification failed.', 'confidence': confidence},
                status=status.HTTP_400_BAD_REQUEST,
            )

        record, _ = AttendanceRecord.objects.update_or_create(
            session=session,
            student=student,
            defaults={
                'status': AttendanceRecord.Status.PRESENT,
                'remarks': 'Marked by facial biometric verification.',
                'source': AttendanceRecord.Source.BIOMETRIC,
                'confidence': confidence,
                'verified_at': timezone.now(),
            },
        )
        profile.last_verified_at = timezone.now()
        profile.save(update_fields=['last_verified_at', 'updated_at'])

        return Response(
            {
                'record': AttendanceRecordSerializer(record).data,
                'confidence': confidence,
            },
            status=status.HTTP_200_OK,
        )


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for updating individual attendance records.
    Primarily used for PATCH (status correction) by Admin/Teacher.
    """
    queryset = AttendanceRecord.objects.select_related(
        'session', 'student', 'student__user'
    ).all()
    serializer_class = AttendanceRecordSerializer
    filterset_fields = ['session', 'student', 'status']
    filter_backends = [DjangoFilterBackend]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_permissions(self):
        return [IsAuthenticated(), IsAdminOrTeacher()]
