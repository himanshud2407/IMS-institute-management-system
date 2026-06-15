from django.utils import timezone
from rest_framework import serializers

from .models import Exam, ExamResult


class ExamResultSerializer(serializers.ModelSerializer):
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    subject_name = serializers.CharField(source='exam.subject.name', read_only=True)
    subject_code = serializers.CharField(source='exam.subject.code', read_only=True)
    total_marks = serializers.IntegerField(source='exam.total_marks', read_only=True)
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    entered_by_name = serializers.CharField(source='entered_by.user.full_name', read_only=True)
    percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = ExamResult
        fields = [
            'id', 'exam', 'exam_title', 'subject_name', 'subject_code',
            'total_marks', 'student', 'student_name', 'student_roll',
            'marks_obtained', 'grade', 'status', 'remarks', 'entered_by',
            'entered_by_name', 'published_at', 'percentage', 'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'grade', 'entered_by', 'published_at', 'created_at', 'updated_at']

    def validate(self, attrs):
        exam = attrs.get('exam') or getattr(self.instance, 'exam', None)
        marks = attrs.get('marks_obtained')
        status = attrs.get('status')
        if exam and marks is not None and marks > exam.total_marks:
            raise serializers.ValidationError({'marks_obtained': 'Marks cannot exceed total marks.'})
        if status == ExamResult.Status.ABSENT:
            attrs['marks_obtained'] = None
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.role == 'TEACHER':
            validated_data['entered_by'] = request.user.teacher_profile
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and request.user.role == 'TEACHER':
            validated_data['entered_by'] = request.user.teacher_profile
        return super().update(instance, validated_data)


class ExamSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    subject_course = serializers.UUIDField(source='subject.course.id', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.full_name', read_only=True)
    results_count = serializers.IntegerField(read_only=True)
    pass_count = serializers.IntegerField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)

    class Meta:
        model = Exam
        fields = [
            'id', 'subject', 'subject_name', 'subject_code', 'subject_course',
            'teacher', 'teacher_name', 'title', 'exam_type', 'exam_date',
            'start_time', 'end_time', 'total_marks', 'passing_marks',
            'status', 'description', 'results_published', 'results_count',
            'pass_count', 'is_past', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        start_time = attrs.get('start_time') or getattr(self.instance, 'start_time', None)
        end_time = attrs.get('end_time') or getattr(self.instance, 'end_time', None)
        total_marks = attrs.get('total_marks') or getattr(self.instance, 'total_marks', 0)
        passing_marks = attrs.get('passing_marks') or getattr(self.instance, 'passing_marks', 0)
        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({'end_time': 'End time must be after start time.'})
        if passing_marks > total_marks:
            raise serializers.ValidationError({'passing_marks': 'Passing marks cannot exceed total marks.'})
        return attrs

    def validate_exam_date(self, value):
        if not self.instance and value < timezone.localdate():
            raise serializers.ValidationError('Exam date cannot be in the past.')
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.role == 'TEACHER' and not validated_data.get('teacher'):
            validated_data['teacher'] = request.user.teacher_profile
        return super().create(validated_data)
