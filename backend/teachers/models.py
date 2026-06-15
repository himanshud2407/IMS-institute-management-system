from django.db import models
from django.conf import settings
from common.models import TimeStampedModel


class Teacher(TimeStampedModel):
    """
    Teacher Model
    =============
    Holds profile information for faculty members, linked to their User account.
    """
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"
        ON_LEAVE = "ON_LEAVE", "On Leave"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="teacher_profile",
        verbose_name="User Account"
    )
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Employee ID",
        help_text="Unique employee identification code."
    )
    department = models.CharField(
        max_length=100,
        verbose_name="Department"
    )
    qualification = models.CharField(
        max_length=150,
        verbose_name="Qualification"
    )
    specialization = models.CharField(
        max_length=150,
        blank=True,
        verbose_name="Specialization"
    )
    phone_number = models.CharField(
        max_length=20,
        verbose_name="Phone Number"
    )
    joining_date = models.DateField(
        verbose_name="Joining Date"
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.ACTIVE,
        verbose_name="Status"
    )

    class Meta:
        ordering = ['employee_id']
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"

    def __str__(self):
        return f"{self.user.full_name} ({self.employee_id})"

    def save(self, *args, **kwargs):
        if self.employee_id:
            self.employee_id = self.employee_id.upper().strip()
        super().save(*args, **kwargs)
