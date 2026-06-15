from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for Course Model.
    """
    students_count = serializers.IntegerField(
        source="students.count",
        read_only=True,
        help_text="Number of students enrolled in this course."
    )
    subjects_count = serializers.IntegerField(
        source="subjects.count",
        read_only=True,
        help_text="Number of subjects associated with this course."
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "code",
            "description",
            "duration",
            "is_active",
            "students_count",
            "subjects_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "students_count", "subjects_count", "created_at", "updated_at"]
