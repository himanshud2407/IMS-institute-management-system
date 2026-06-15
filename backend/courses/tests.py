import datetime
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from courses.models import Course
from students.models import Student


class CourseAPITests(TestCase):
    """
    Test suite for Course API endpoints.
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
        
    def test_delete_course_success(self):
        """Test deleting a course with no dependencies succeeds."""
        url = reverse("course-detail", kwargs={"pk": str(self.course.id)})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Course.objects.count(), 0)

    def test_delete_course_protected(self):
        """Test deleting a course with enrolled students fails with a clean message."""
        # Create student user
        student_user = User.objects.create_user(
            email="student@example.com",
            full_name="Student User",
            password="studentpassword",
            role="STUDENT"
        )
        # Create student profile enrolled in this course
        Student.objects.create(
            user=student_user,
            roll_number="CS-001",
            course=self.course,
            phone_number="1234567890",
            date_of_birth=datetime.date(2000, 1, 1),
            gender="MALE",
            address="123 Street",
            admission_date=datetime.date(2026, 1, 1)
        )
        
        url = reverse("course-detail", kwargs={"pk": str(self.course.id)})
        response = self.client.delete(url)
        
        # Verify custom exception handler converted it to 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Check that response data contains our friendly error message
        response_data = response.json()
        self.assertFalse(response_data["success"])
        self.assertEqual(
            response_data["message"], 
            "Cannot delete this record because it is referenced by active students."
        )
        # Confirm course is not deleted in DB
        self.assertTrue(Course.objects.filter(id=self.course.id).exists())
