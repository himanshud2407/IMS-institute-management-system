from django.test import TestCase

from .models import Assignment


class AssignmentModelTests(TestCase):
    def test_status_defaults_to_draft(self):
        field = Assignment._meta.get_field('status')
        self.assertEqual(field.default, Assignment.Status.DRAFT)
