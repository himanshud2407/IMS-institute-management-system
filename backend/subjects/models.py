from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from common.models import TimeStampedModel
from courses.models import Course
from teachers.models import Teacher


class Subject(TimeStampedModel):
    """
    Subject Model
    =============
    Represents an academic subject (e.g., Physics, Data Structures) associated with a Course
    and optionally assigned to a faculty Teacher.
    """
    name = models.CharField(
        max_length=150,
        verbose_name="Subject Name"
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Subject Code",
        help_text="Unique subject code (e.g., PHY-101)."
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="subjects",
        verbose_name="Associated Course"
    )
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subjects",
        verbose_name="Assigned Teacher"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active Status"
    )
    credits = models.PositiveIntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name="Credits",
        help_text="Number of academic credits (1-10)."
    )

    class Meta:
        ordering = ['code']
        verbose_name = "Subject"
        verbose_name_plural = "Subjects"

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        if self.code:
            self.code = self.code.upper().strip()
        super().save(*args, **kwargs)
