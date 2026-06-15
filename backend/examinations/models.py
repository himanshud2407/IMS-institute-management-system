from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from common.models import TimeStampedModel
from students.models import Student
from subjects.models import Subject
from teachers.models import Teacher


class Exam(TimeStampedModel):
    class ExamType(models.TextChoices):
        QUIZ = 'QUIZ', 'Quiz'
        MIDTERM = 'MIDTERM', 'Midterm'
        FINAL = 'FINAL', 'Final'
        PRACTICAL = 'PRACTICAL', 'Practical'
        ASSIGNMENT = 'ASSIGNMENT', 'Assignment'

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='exams',
        verbose_name='Subject',
    )
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='exams',
        verbose_name='Teacher',
    )
    title = models.CharField(max_length=200, verbose_name='Exam Title')
    exam_type = models.CharField(
        max_length=20,
        choices=ExamType.choices,
        default=ExamType.QUIZ,
        verbose_name='Exam Type',
    )
    exam_date = models.DateField(verbose_name='Exam Date')
    start_time = models.TimeField(verbose_name='Start Time')
    end_time = models.TimeField(verbose_name='End Time')
    total_marks = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(1)],
        verbose_name='Total Marks',
    )
    passing_marks = models.PositiveIntegerField(
        default=35,
        validators=[MinValueValidator(0)],
        verbose_name='Passing Marks',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
        verbose_name='Status',
    )
    description = models.TextField(blank=True, verbose_name='Description')
    results_published = models.BooleanField(default=False, verbose_name='Results Published')

    class Meta:
        ordering = ['-exam_date', '-start_time']
        verbose_name = 'Exam'
        verbose_name_plural = 'Exams'

    def __str__(self):
        return f"{self.title} - {self.subject.code}"

    @property
    def is_past(self):
        return self.exam_date < timezone.localdate()

    @property
    def results_count(self):
        return self.results.count()

    @property
    def pass_count(self):
        return self.results.filter(status=ExamResult.Status.PASS).count()


class ExamResult(TimeStampedModel):
    class Status(models.TextChoices):
        PASS = 'PASS', 'Pass'
        FAIL = 'FAIL', 'Fail'
        ABSENT = 'ABSENT', 'Absent'
        WITHHELD = 'WITHHELD', 'Withheld'

    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='results',
        verbose_name='Exam',
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='exam_results',
        verbose_name='Student',
    )
    marks_obtained = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Marks Obtained',
    )
    grade = models.CharField(max_length=5, blank=True, verbose_name='Grade')
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PASS,
        verbose_name='Status',
    )
    remarks = models.TextField(blank=True, verbose_name='Remarks')
    entered_by = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entered_exam_results',
        verbose_name='Entered By',
    )
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='Published At')

    class Meta:
        ordering = ['exam', 'student__roll_number']
        verbose_name = 'Exam Result'
        verbose_name_plural = 'Exam Results'
        unique_together = [['exam', 'student']]

    def __str__(self):
        return f"{self.student} - {self.exam.title}"

    def save(self, *args, **kwargs):
        if self.status != self.Status.ABSENT and self.marks_obtained is not None:
            if self.marks_obtained >= self.exam.passing_marks:
                self.status = self.Status.PASS
            else:
                self.status = self.Status.FAIL
            self.grade = self.calculate_grade()
        super().save(*args, **kwargs)

    def calculate_grade(self):
        if self.marks_obtained is None or self.exam.total_marks == 0:
            return ''
        percentage = (float(self.marks_obtained) / self.exam.total_marks) * 100
        if percentage >= 90:
            return 'A+'
        if percentage >= 80:
            return 'A'
        if percentage >= 70:
            return 'B'
        if percentage >= 60:
            return 'C'
        if percentage >= 50:
            return 'D'
        return 'F'

    @property
    def percentage(self):
        if self.marks_obtained is None or self.exam.total_marks == 0:
            return 0
        return round((float(self.marks_obtained) / self.exam.total_marks) * 100, 2)
