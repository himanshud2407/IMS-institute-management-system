import uuid
from django.db import models
from common.models import TimeStampedModel


class Course(TimeStampedModel):
    """
    Course Model
    ============
    Represents an academic course (e.g., Computer Science, Mechanical Engineering).
    """
    name = models.CharField(
        max_length=150,
        verbose_name="Course Name"
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Course Code",
        help_text="Unique course code (e.g., CS-2026)."
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    duration = models.PositiveIntegerField(
        verbose_name="Duration (Semesters)",
        help_text="Duration of the course in semesters."
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active Status"
    )

    class Meta:
        ordering = ['name']
        verbose_name = "Course"
        verbose_name_plural = "Courses"

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        # Force course code to uppercase
        if self.code:
            self.code = self.code.upper().strip()
        super().save(*args, **kwargs)
