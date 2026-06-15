from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Student
from courses.models import Course
from courses.serializers import CourseSerializer
from accounts.serializers import UserSerializer

User = get_user_model()


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializer for reading Student profiles.
    
    Includes nested user account and enrolled course information.
    """
    user = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "user",
            "roll_number",
            "course",
            "phone_number",
            "date_of_birth",
            "gender",
            "address",
            "admission_date",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StudentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new Student profile.
    
    Handles User creation (STUDENT role) and Student registration
    inside a single transaction block.
    """
    email = serializers.EmailField(write_only=True)
    full_name = serializers.CharField(max_length=150, write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.filter(is_active=True),
        help_text="UUID of an active Course."
    )

    class Meta:
        model = Student
        fields = [
            "id",
            "email",
            "full_name",
            "password",
            "roll_number",
            "course",
            "phone_number",
            "date_of_birth",
            "gender",
            "address",
            "admission_date",
            "status",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        """Ensure email is unique across the User model."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_roll_number(self, value):
        """Ensure roll number is unique."""
        if Student.objects.filter(roll_number__iexact=value).exists():
            raise serializers.ValidationError("A student with this Roll Number already exists.")
        return value.upper().strip()

    def create(self, validated_data):
        """Create User and Student profile atomically."""
        email = validated_data.pop("email")
        full_name = validated_data.pop("full_name")
        password = validated_data.pop("password")

        with transaction.atomic():
            # 1. Create User account with role STUDENT
            user = User.objects.create_user(
                email=email,
                full_name=full_name,
                password=password,
                role=User.Role.STUDENT
            )

            # 2. Create Student profile associated with User
            student = Student.objects.create(
                user=user,
                **validated_data
            )
            return student

    def to_representation(self, instance):
        return StudentSerializer(instance).data
