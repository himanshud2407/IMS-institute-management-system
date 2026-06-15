from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Teacher
from accounts.serializers import UserSerializer

User = get_user_model()


class TeacherSerializer(serializers.ModelSerializer):
    """
    Serializer for reading Teacher profiles.
    
    Includes nested user account information.
    """
    user = UserSerializer(read_only=True)
    subjects_count = serializers.IntegerField(
        source="subjects.count",
        read_only=True
    )

    class Meta:
        model = Teacher
        fields = [
            "id",
            "user",
            "employee_id",
            "department",
            "qualification",
            "specialization",
            "phone_number",
            "joining_date",
            "status",
            "subjects_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "subjects_count", "created_at", "updated_at"]


class TeacherCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new Teacher profile.
    
    Accepts user registration fields + teacher profile fields and handles
    creation of both objects inside a single transaction.
    """
    email = serializers.EmailField(write_only=True)
    full_name = serializers.CharField(max_length=150, write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Teacher
        fields = [
            "id",
            "email",
            "full_name",
            "password",
            "employee_id",
            "department",
            "qualification",
            "specialization",
            "phone_number",
            "joining_date",
            "status",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        """Ensure email is unique across the User model."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_employee_id(self, value):
        """Ensure employee ID is unique."""
        if Teacher.objects.filter(employee_id__iexact=value).exists():
            raise serializers.ValidationError("A teacher with this Employee ID already exists.")
        return value.upper().strip()

    def create(self, validated_data):
        """Create both User and Teacher records within a transaction."""
        email = validated_data.pop("email")
        full_name = validated_data.pop("full_name")
        password = validated_data.pop("password")

        with transaction.atomic():
            # 1. Create User account with role TEACHER
            user = User.objects.create_user(
                email=email,
                full_name=full_name,
                password=password,
                role=User.Role.TEACHER
            )

            # 2. Create Teacher profile associated with User
            teacher = Teacher.objects.create(
                user=user,
                **validated_data
            )
            return teacher

    def to_representation(self, instance):
        return TeacherSerializer(instance).data
