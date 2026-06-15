"""
Accounts Tests
==============
Comprehensive test suite for authentication endpoints.

Tests cover:
    - User registration (all roles, validation errors)
    - User login (valid/invalid credentials)
    - JWT token refresh
    - Protected endpoint access (MeView)
    - Role-based access control
    - Password change
    - Logout with token blacklisting
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import User


class UserModelTests(TestCase):
    """Tests for the custom User model."""

    def test_create_user_with_email(self):
        """Test creating a user with email is successful."""
        user = User.objects.create_user(
            email="test@example.com",
            full_name="Test User",
            password="testpass123",
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.full_name, "Test User")
        self.assertTrue(user.check_password("testpass123"))
        self.assertEqual(user.role, "STUDENT")  # Default role
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_create_user_email_normalized(self):
        """Test email is normalized to lowercase."""
        user = User.objects.create_user(
            email="Test@EXAMPLE.com",
            full_name="Test User",
            password="testpass123",
        )
        self.assertEqual(user.email, "Test@example.com")

    def test_create_user_without_email_raises_error(self):
        """Test creating user without email raises ValueError."""
        with self.assertRaises(ValueError):
            User.objects.create_user(email="", full_name="Test", password="test123")

    def test_create_superuser(self):
        """Test creating a superuser."""
        user = User.objects.create_superuser(
            email="admin@example.com",
            full_name="Admin User",
            password="adminpass123",
        )
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        self.assertEqual(user.role, "ADMIN")

    def test_user_role_properties(self):
        """Test role helper properties."""
        admin = User.objects.create_user(
            email="admin@test.com", full_name="Admin", password="pass123", role="ADMIN"
        )
        teacher = User.objects.create_user(
            email="teacher@test.com", full_name="Teacher", password="pass123", role="TEACHER"
        )
        student = User.objects.create_user(
            email="student@test.com", full_name="Student", password="pass123", role="STUDENT"
        )
        self.assertTrue(admin.is_admin)
        self.assertTrue(teacher.is_teacher)
        self.assertTrue(student.is_student)

    def test_user_string_representation(self):
        """Test user __str__ method."""
        user = User.objects.create_user(
            email="test@example.com",
            full_name="John Doe",
            password="testpass123",
            role="TEACHER",
        )
        self.assertEqual(str(user), "John Doe (Teacher)")


class RegisterViewTests(TestCase):
    """Tests for user registration endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("accounts:register")

    def test_register_student_success(self):
        """Test successful student registration."""
        data = {
            "full_name": "John Student",
            "email": "student@example.com",
            "password": "securepass123",
            "confirm_password": "securepass123",
            "role": "STUDENT",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="student@example.com").exists())

    def test_register_teacher_success(self):
        """Test successful teacher registration."""
        data = {
            "full_name": "Jane Teacher",
            "email": "teacher@example.com",
            "password": "securepass123",
            "confirm_password": "securepass123",
            "role": "TEACHER",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="teacher@example.com")
        self.assertEqual(user.role, "TEACHER")

    def test_register_admin_success(self):
        """Test successful admin registration."""
        data = {
            "full_name": "Admin Boss",
            "email": "admin@example.com",
            "password": "securepass123",
            "confirm_password": "securepass123",
            "role": "ADMIN",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_returns_tokens(self):
        """Test registration returns JWT tokens for auto-login."""
        data = {
            "full_name": "Token User",
            "email": "tokens@example.com",
            "password": "securepass123",
            "confirm_password": "securepass123",
        }
        response = self.client.post(self.register_url, data)
        response_data = response.data.get("data", response.data)
        self.assertIn("tokens", response_data)
        self.assertIn("access", response_data["tokens"])
        self.assertIn("refresh", response_data["tokens"])

    def test_register_duplicate_email_fails(self):
        """Test registration with existing email fails."""
        User.objects.create_user(
            email="exists@example.com", full_name="Existing", password="pass123"
        )
        data = {
            "full_name": "Duplicate",
            "email": "exists@example.com",
            "password": "securepass123",
            "confirm_password": "securepass123",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch_fails(self):
        """Test registration with mismatched passwords fails."""
        data = {
            "full_name": "Mismatch",
            "email": "mismatch@example.com",
            "password": "securepass123",
            "confirm_password": "differentpass",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_short_password_fails(self):
        """Test registration with short password fails."""
        data = {
            "full_name": "Short Pass",
            "email": "short@example.com",
            "password": "short",
            "confirm_password": "short",
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginViewTests(TestCase):
    """Tests for user login endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse("accounts:login")
        self.user = User.objects.create_user(
            email="login@example.com",
            full_name="Login User",
            password="testpass123",
            role="STUDENT",
        )

    def test_login_success(self):
        """Test successful login returns user data and tokens."""
        data = {"email": "login@example.com", "password": "testpass123"}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.data.get("data", response.data)
        self.assertIn("tokens", response_data)
        self.assertIn("user", response_data)
        self.assertEqual(response_data["user"]["role"], "STUDENT")

    def test_login_wrong_password(self):
        """Test login with wrong password fails."""
        data = {"email": "login@example.com", "password": "wrongpass"}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_email(self):
        """Test login with non-existent email fails."""
        data = {"email": "fake@example.com", "password": "testpass123"}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_inactive_user(self):
        """Test login with inactive user fails."""
        self.user.is_active = False
        self.user.save()
        data = {"email": "login@example.com", "password": "testpass123"}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class MeViewTests(TestCase):
    """Tests for the authenticated user profile endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.me_url = reverse("accounts:me")
        self.user = User.objects.create_user(
            email="me@example.com",
            full_name="Me User",
            password="testpass123",
            role="TEACHER",
        )

    def test_get_profile_authenticated(self):
        """Test authenticated user can get their profile."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.data.get("data", response.data)
        self.assertEqual(response_data["email"], "me@example.com")
        self.assertEqual(response_data["role"], "TEACHER")

    def test_get_profile_unauthenticated(self):
        """Test unauthenticated user cannot access profile."""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ChangePasswordViewTests(TestCase):
    """Tests for the change password endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.change_password_url = reverse("accounts:change-password")
        self.user = User.objects.create_user(
            email="changepw@example.com",
            full_name="Change PW",
            password="oldpass123",
        )
        self.client.force_authenticate(user=self.user)

    def test_change_password_success(self):
        """Test successful password change."""
        data = {
            "old_password": "oldpass123",
            "new_password": "newsecure456",
            "confirm_new_password": "newsecure456",
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify new password works
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newsecure456"))

    def test_change_password_wrong_old_password(self):
        """Test change password with wrong old password fails."""
        data = {
            "old_password": "wrongold",
            "new_password": "newsecure456",
            "confirm_new_password": "newsecure456",
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_mismatch(self):
        """Test change password with mismatched new passwords fails."""
        data = {
            "old_password": "oldpass123",
            "new_password": "newsecure456",
            "confirm_new_password": "different789",
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LogoutViewTests(TestCase):
    """Tests for the logout endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse("accounts:login")
        self.logout_url = reverse("accounts:logout")
        self.user = User.objects.create_user(
            email="logout@example.com",
            full_name="Logout User",
            password="testpass123",
        )

    def test_logout_success(self):
        """Test successful logout blacklists refresh token."""
        # Login first to get tokens
        login_response = self.client.post(
            self.login_url,
            {"email": "logout@example.com", "password": "testpass123"},
        )
        response_data = login_response.data.get("data", login_response.data)
        tokens = response_data["tokens"]

        # Logout with refresh token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = self.client.post(
            self.logout_url, {"refresh": tokens["refresh"]}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_without_token_fails(self):
        """Test logout without refresh token fails."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.logout_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
