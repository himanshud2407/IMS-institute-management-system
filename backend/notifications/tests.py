from django.test import TestCase

from accounts.models import User
from notifications.models import Notification


class NotificationVisibilityTests(TestCase):
    def test_role_notification_is_visible_to_matching_role(self):
        teacher = User.objects.create_user(
            email='teacher-note@example.com',
            password='pass12345',
            full_name='Teacher Note',
            role='TEACHER',
        )
        notification = Notification.objects.create(
            title='Faculty Meeting',
            message='Meeting at 3 PM',
            audience=Notification.Audience.TEACHERS,
        )

        self.assertTrue(notification.is_visible_to(teacher))
