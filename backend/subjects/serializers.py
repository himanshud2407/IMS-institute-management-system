from rest_framework import serializers
from .models import Subject
from courses.serializers import CourseSerializer

class SubjectSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    # To prevent circular import, we can fetch basic teacher details, or just return ID
    
    class Meta:
        model = Subject
        fields = [
            'id', 'course', 'course_details', 'teacher', 'name', 
            'code', 'description', 'credits', 'is_active', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
