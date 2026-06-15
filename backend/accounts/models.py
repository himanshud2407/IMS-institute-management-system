"""
Accounts Models
===============
Custom User model using email-based authentication with UUID primary keys.

Concept:
    Django's default User model uses username for authentication. For a 
    production IMS, email-based auth is more professional and user-friendly.
    We use AbstractBaseUser + PermissionsMixin for full control over the
    authentication model, and a custom UserManager for user creation logic.

Key design decisions:
    - Email is the login field (USERNAME_FIELD)
    - UUID primary keys for security (non-guessable IDs)
    - Role field for RBAC (Admin/Teacher/Student)
    - No profile fields here — they belong in students/teachers apps
"""

import uuid

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserManager(BaseUserManager):
    """
    Custom manager for User model.
    
    Handles user creation with email normalization and password hashing.
    """

    def create_user(self, email, full_name, password=None, **extra_fields):
        """
        Create and return a regular user with an email and password.
        
        Args:
            email: User's email address (will be normalized to lowercase)
            full_name: User's full name
            password: Plain text password (will be hashed)
            **extra_fields: Additional fields like role, is_active, etc.
        """
        if not email:
            raise ValueError("The Email field is required.")
        if not full_name:
            raise ValueError("The Full Name field is required.")

        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        """
        Create and return a superuser with admin privileges.
        
        Sets is_staff, is_superuser, and role to ADMIN automatically.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", "ADMIN")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User Model for IMS.
    
    Uses email for authentication instead of username.
    Supports three roles: ADMIN, TEACHER, STUDENT.
    
    This model ONLY handles authentication and role assignment.
    Profile details (phone, address, department, etc.) belong in
    the students and teachers apps respectively.
    """

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        TEACHER = "TEACHER", "Teacher"
        STUDENT = "STUDENT", "Student"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="ID",
    )
    email = models.EmailField(
        unique=True,
        max_length=255,
        verbose_name="Email Address",
    )
    full_name = models.CharField(
        max_length=150,
        verbose_name="Full Name",
    )
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
        verbose_name="Role",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active",
        help_text="Designates whether this user should be treated as active.",
    )
    is_staff = models.BooleanField(
        default=False,
        verbose_name="Staff Status",
        help_text="Designates whether the user can log into the admin site.",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At",
    )

    objects = UserManager()

    # Use email as the login field instead of username
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"

    @property
    def is_admin(self):
        """Check if user has admin role."""
        return self.role == self.Role.ADMIN

    @property
    def is_teacher(self):
        """Check if user has teacher role."""
        return self.role == self.Role.TEACHER

    @property
    def is_student(self):
        """Check if user has student role."""
        return self.role == self.Role.STUDENT
