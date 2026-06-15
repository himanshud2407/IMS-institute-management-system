from django.conf import settings
from django.db import models
from django.utils import timezone

from common.models import TimeStampedModel


class Notification(TimeStampedModel):
    class Audience(models.TextChoices):
        ALL = 'ALL', 'All Users'
        ADMINS = 'ADMINS', 'Admins'
        TEACHERS = 'TEACHERS', 'Teachers'
        STUDENTS = 'STUDENTS', 'Students'
        USER = 'USER', 'Specific User'

    class Category(models.TextChoices):
        GENERAL = 'GENERAL', 'General'
        ACADEMIC = 'ACADEMIC', 'Academic'
        FEES = 'FEES', 'Fees'
        EXAMS = 'EXAMS', 'Exams'
        ATTENDANCE = 'ATTENDANCE', 'Attendance'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        NORMAL = 'NORMAL', 'Normal'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    title = models.CharField(max_length=200, verbose_name='Title')
    message = models.TextField(verbose_name='Message')
    audience = models.CharField(max_length=15, choices=Audience.choices, default=Audience.ALL)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='direct_notifications',
        verbose_name='Specific Recipient',
    )
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    is_published = models.BooleanField(default=True, verbose_name='Published')
    publish_at = models.DateTimeField(default=timezone.now, verbose_name='Publish At')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_notifications',
        verbose_name='Created By',
    )

    class Meta:
        ordering = ['-publish_at', '-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return self.title

    def is_visible_to(self, user):
        if not self.is_published or self.publish_at > timezone.now():
            return False
        if self.audience == self.Audience.ALL:
            return True
        if self.audience == self.Audience.USER:
            return self.recipient_id == user.id
        role_map = {
            self.Audience.ADMINS: 'ADMIN',
            self.Audience.TEACHERS: 'TEACHER',
            self.Audience.STUDENTS: 'STUDENT',
        }
        return role_map.get(self.audience) == user.role


class NotificationRead(TimeStampedModel):
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='reads',
        verbose_name='Notification',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_reads',
        verbose_name='User',
    )
    read_at = models.DateTimeField(default=timezone.now, verbose_name='Read At')

    class Meta:
        ordering = ['-read_at']
        unique_together = [['notification', 'user']]
        verbose_name = 'Notification Read Receipt'
        verbose_name_plural = 'Notification Read Receipts'

    def __str__(self):
        return f"{self.user} read {self.notification}"
