from django.utils import timezone
from rest_framework import serializers

from .models import Assignment, AssignmentSubmission


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    subject_name = serializers.CharField(source='assignment.subject.name', read_only=True)
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    graded_by_name = serializers.CharField(source='graded_by.user.full_name', read_only=True)
    is_late = serializers.BooleanField(read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = [
            'id', 'assignment', 'assignment_title', 'subject_name',
            'student', 'student_name', 'student_roll', 'content',
            'attachment_url', 'submitted_at', 'status', 'marks_obtained',
            'feedback', 'graded_by', 'graded_by_name', 'graded_at',
            'is_late', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'student', 'submitted_at', 'status', 'marks_obtained',
            'feedback', 'graded_by', 'graded_at', 'created_at', 'updated_at',
        ]

    def validate_assignment(self, assignment):
        request = self.context.get('request')
        if request and request.user.role == 'STUDENT':
            if assignment.status != Assignment.Status.PUBLISHED:
                raise serializers.ValidationError('This assignment is not open for submissions.')
            if assignment.is_overdue:
                raise serializers.ValidationError('The due date for this assignment has passed.')
        return assignment

    def create(self, validated_data):
        request = self.context['request']
        validated_data['student'] = request.user.student_profile
        return super().create(validated_data)


class AssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.full_name', read_only=True)
    submissions_count = serializers.IntegerField(read_only=True)
    graded_count = serializers.IntegerField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    my_submission = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id', 'subject', 'subject_name', 'subject_code',
            'teacher', 'teacher_name', 'title', 'description',
            'instructions', 'attachment_url', 'due_date', 'max_marks',
            'status', 'is_overdue', 'submissions_count', 'graded_count',
            'my_submission', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_my_submission(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated or request.user.role != 'STUDENT':
            return None
        try:
            submission = obj.submissions.get(student=request.user.student_profile)
        except AssignmentSubmission.DoesNotExist:
            return None
        return AssignmentSubmissionSerializer(submission).data

    def validate_due_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError('Due date must be in the future.')
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.role == 'TEACHER' and not validated_data.get('teacher'):
            validated_data['teacher'] = request.user.teacher_profile
        return super().create(validated_data)


class AssignmentGradeSerializer(serializers.Serializer):
    marks_obtained = serializers.DecimalField(max_digits=6, decimal_places=2)
    feedback = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(
        choices=[AssignmentSubmission.Status.GRADED, AssignmentSubmission.Status.RETURNED],
        default=AssignmentSubmission.Status.GRADED,
    )

    def validate_marks_obtained(self, value):
        submission = self.context['submission']
        if value < 0 or value > submission.assignment.max_marks:
            raise serializers.ValidationError(
                f"Marks must be between 0 and {submission.assignment.max_marks}."
            )
        return value
