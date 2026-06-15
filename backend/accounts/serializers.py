"""
Accounts Serializers
====================
Serializers handle data validation and transformation between JSON and Python objects.

Concept:
    - RegisterSerializer: Validates signup data, creates User with hashed password
    - LoginSerializer: Validates credentials, returns JWT tokens
    - UserSerializer: Reads/updates user profile data
    - ChangePasswordSerializer: Validates old + new password

All serializers enforce field-level and object-level validation.
"""

from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Accepts: full_name, email, password, confirm_password, role
    Returns: user data + JWT tokens
    
    API: POST /api/auth/register/
    """
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        help_text="Minimum 8 characters.",
    )
    confirm_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "password", "confirm_password", "role"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        """Ensure email is unique (case-insensitive)."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        """Ensure password and confirm_password match."""
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop("confirm_password")
        user = User.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            password=validated_data["password"],
            role=validated_data.get("role", User.Role.STUDENT),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    
    Accepts: email, password
    Returns: user data + access/refresh tokens
    
    API: POST /api/auth/login/
    """
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        """Authenticate user and generate JWT tokens."""
        email = attrs.get("email", "").lower()
        password = attrs.get("password")

        # Authenticate against the database
        user = authenticate(
            request=self.context.get("request"),
            email=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password. Please try again."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account has been deactivated. Contact admin."
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
            },
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
        }


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for reading/updating user profile.
    
    API: GET /api/auth/me/
    """

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "role",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "email", "role", "created_at", "updated_at"]


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password.
    
    Validates old password is correct, then updates to new password.
    
    API: POST /api/auth/change-password/
    """
    old_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )
    confirm_new_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate_old_password(self, value):
        """Verify old password is correct."""
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):
        """Ensure new passwords match."""
        if attrs["new_password"] != attrs["confirm_new_password"]:
            raise serializers.ValidationError(
                {"confirm_new_password": "New passwords do not match."}
            )
        return attrs

    def save(self, **kwargs):
        """Update the user's password."""
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
