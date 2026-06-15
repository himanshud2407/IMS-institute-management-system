"""
Attendance Models
=================
Tracks daily attendance for students per subject.
"""

from django.conf import settings
from django.db import models
from django.utils import timezone

from common.models import TimeStampedModel
from students.models import Student
from subjects.models import Subject
from teachers.models import Teacher


class AttendanceSession(TimeStampedModel):
    """
    Represents a single attendance-taking event for a subject on a date.
    """
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='attendance_sessions',
        verbose_name='Subject'
    )
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attendance_sessions',
        verbose_name='Teacher'
    )
    date = models.DateField(verbose_name='Session Date')
    topic = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Topic Covered',
        help_text='Optional topic covered in this session.'
    )
    notes = models.TextField(blank=True, verbose_name='Notes')

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Attendance Session'
        verbose_name_plural = 'Attendance Sessions'
        unique_together = [['subject', 'date']]

    def __str__(self):
        return f"{self.subject.name} - {self.date}"

    @property
    def total_students(self):
        return self.records.count()

    @property
    def present_count(self):
        return self.records.filter(status=AttendanceRecord.Status.PRESENT).count()

    @property
    def absent_count(self):
        return self.records.filter(status=AttendanceRecord.Status.ABSENT).count()


class AttendanceRecord(TimeStampedModel):
    """
    Individual attendance entry for one student in one session.
    """
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        ABSENT = 'ABSENT', 'Absent'
        LATE = 'LATE', 'Late'
        EXCUSED = 'EXCUSED', 'Excused'

    class Source(models.TextChoices):
        MANUAL = 'MANUAL', 'Manual'
        BIOMETRIC = 'BIOMETRIC', 'Biometric'

    session = models.ForeignKey(
        AttendanceSession,
        on_delete=models.CASCADE,
        related_name='records',
        verbose_name='Session'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='attendance_records',
        verbose_name='Student'
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PRESENT,
        verbose_name='Attendance Status'
    )
    remarks = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Remarks'
    )
    source = models.CharField(
        max_length=15,
        choices=Source.choices,
        default=Source.MANUAL,
        verbose_name='Attendance Source'
    )
    confidence = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Biometric Confidence'
    )
    verified_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Biometric Verification Time'
    )

    class Meta:
        ordering = ['session', 'student']
        verbose_name = 'Attendance Record'
        verbose_name_plural = 'Attendance Records'
        unique_together = [['session', 'student']]

    def __str__(self):
        return f"{self.student} - {self.session.date} - {self.status}"


class BiometricProfile(TimeStampedModel):
    """
    Stores a derived face template for a student.
    Raw camera images are intentionally not stored.
    """
    student = models.OneToOneField(
        Student,
        on_delete=models.CASCADE,
        related_name='biometric_profile',
        verbose_name='Student'
    )
    face_template = models.CharField(max_length=64, verbose_name='Face Template')
    sample_size = models.PositiveIntegerField(default=0, verbose_name='Enrollment Sample Size')
    is_active = models.BooleanField(default=True, verbose_name='Is Active')
    consent_given_at = models.DateTimeField(default=timezone.now, verbose_name='Consent Given At')
    enrolled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enrolled_biometric_profiles',
        verbose_name='Enrolled By'
    )
    last_verified_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Last Verified At'
    )

    class Meta:
        ordering = ['student__roll_number']
        verbose_name = 'Biometric Profile'
        verbose_name_plural = 'Biometric Profiles'

    def __str__(self):
        return f"Biometric profile - {self.student}"
