from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
from courses.models import Course


class Student(TimeStampedModel):
    """
    Student Model
    =============
    Holds profile information for students, linked to their User account and enrolled Course.
    """
    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"
        SUSPENDED = "SUSPENDED", "Suspended"
        GRADUATED = "GRADUATED", "Graduated"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
        verbose_name="User Account"
    )
    roll_number = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Roll Number",
        help_text="Unique student registration/roll number."
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT,
        related_name="students",
        verbose_name="Enrolled Course"
    )
    phone_number = models.CharField(
        max_length=20,
        verbose_name="Phone Number"
    )
    date_of_birth = models.DateField(
        verbose_name="Date of Birth"
    )
    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        verbose_name="Gender"
    )
    address = models.TextField(
        verbose_name="Residential Address"
    )
    admission_date = models.DateField(
        verbose_name="Admission Date"
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.ACTIVE,
        verbose_name="Status"
    )

    class Meta:
        ordering = ['roll_number']
        verbose_name = "Student"
        verbose_name_plural = "Students"

    def __str__(self):
        return f"{self.user.full_name} ({self.roll_number})"

    def save(self, *args, **kwargs):
        if self.roll_number:
            self.roll_number = self.roll_number.upper().strip()
        super().save(*args, **kwargs)
