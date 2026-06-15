from django.db import models
from django.utils import timezone

from common.models import TimeStampedModel
from students.models import Student
from subjects.models import Subject
from teachers.models import Teacher


class Assignment(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PUBLISHED = 'PUBLISHED', 'Published'
        CLOSED = 'CLOSED', 'Closed'

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='assignments',
        verbose_name='Subject',
    )
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assignments',
        verbose_name='Teacher',
    )
    title = models.CharField(max_length=200, verbose_name='Title')
    description = models.TextField(verbose_name='Description')
    instructions = models.TextField(blank=True, verbose_name='Instructions')
    attachment_url = models.URLField(blank=True, verbose_name='Attachment URL')
    due_date = models.DateTimeField(verbose_name='Due Date')
    max_marks = models.PositiveIntegerField(default=100, verbose_name='Maximum Marks')
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.DRAFT,
        verbose_name='Status',
    )

    class Meta:
        ordering = ['-due_date', '-created_at']
        verbose_name = 'Assignment'
        verbose_name_plural = 'Assignments'

    def __str__(self):
        return f"{self.title} - {self.subject.code}"

    @property
    def is_overdue(self):
        return timezone.now() > self.due_date

    @property
    def submissions_count(self):
        return self.submissions.count()

    @property
    def graded_count(self):
        return self.submissions.filter(status=AssignmentSubmission.Status.GRADED).count()


class AssignmentSubmission(TimeStampedModel):
    class Status(models.TextChoices):
        SUBMITTED = 'SUBMITTED', 'Submitted'
        GRADED = 'GRADED', 'Graded'
        RETURNED = 'RETURNED', 'Returned'

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name='Assignment',
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='assignment_submissions',
        verbose_name='Student',
    )
    content = models.TextField(blank=True, verbose_name='Submission Content')
    attachment_url = models.URLField(blank=True, verbose_name='Attachment URL')
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name='Submitted At')
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.SUBMITTED,
        verbose_name='Status',
    )
    marks_obtained = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Marks Obtained',
    )
    feedback = models.TextField(blank=True, verbose_name='Teacher Feedback')
    graded_by = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='graded_submissions',
        verbose_name='Graded By',
    )
    graded_at = models.DateTimeField(null=True, blank=True, verbose_name='Graded At')

    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Assignment Submission'
        verbose_name_plural = 'Assignment Submissions'
        unique_together = [['assignment', 'student']]

    def __str__(self):
        return f"{self.student} - {self.assignment.title}"

    @property
    def is_late(self):
        return self.submitted_at > self.assignment.due_date
