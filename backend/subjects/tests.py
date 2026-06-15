from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from courses.models import Course
from subjects.models import Subject


class SubjectAPITests(TestCase):
    """
    Test suite for Subject API endpoints.
    """

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email="admin@example.com",
            full_name="Admin User",
            password="adminpassword"
        )
        self.client.force_authenticate(user=self.admin_user)

        self.course = Course.objects.create(
            name="Computer Science",
            code="CS101",
            duration=8
        )

    def test_create_subject_success(self):
        """Test creating a subject with valid credits succeeds."""
        url = reverse("subject-list")
        data = {
            "name": "Data Structures",
            "code": "CS-102",
            "course": str(self.course.id),
            "credits": 4,
            "description": "Study of fundamental data structures",
            "is_active": True
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        response_data = response.json()
        self.assertTrue(response_data["success"])
        self.assertEqual(response_data["data"]["credits"], 4)
        self.assertEqual(Subject.objects.count(), 1)
        self.assertEqual(Subject.objects.first().credits, 4)

    def test_create_subject_invalid_credits_max(self):
        """Test creating a subject with credits > 10 fails validation."""
        url = reverse("subject-list")
        data = {
            "name": "Data Structures",
            "code": "CS-102",
            "course": str(self.course.id),
            "credits": 12,  # Exceeds MaxValueValidator(10)
            "description": "Study of fundamental data structures",
            "is_active": True
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        response_data = response.json()
        self.assertFalse(response_data["success"])
        self.assertIn("credits", response_data["errors"])

    def test_create_subject_invalid_credits_min(self):
        """Test creating a subject with credits < 1 fails validation."""
        url = reverse("subject-list")
        data = {
            "name": "Data Structures",
            "code": "CS-102",
            "course": str(self.course.id),
            "credits": 0,  # Below MinValueValidator(1)
            "description": "Study of fundamental data structures",
            "is_active": True
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        response_data = response.json()
        self.assertFalse(response_data["success"])
        self.assertIn("credits", response_data["errors"])
