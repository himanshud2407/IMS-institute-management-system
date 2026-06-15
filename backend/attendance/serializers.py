"""
Attendance Serializers
======================
"""

from rest_framework import serializers
from .biometrics import BiometricError, create_face_template
from .models import AttendanceSession, AttendanceRecord, BiometricProfile
from students.models import Student


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'student', 'student_name', 'student_roll', 'status',
            'remarks', 'source', 'confidence', 'verified_at',
        ]
        read_only_fields = ['source', 'confidence', 'verified_at']


class AttendanceSessionSerializer(serializers.ModelSerializer):
    records = AttendanceRecordSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.full_name', read_only=True)
    total_students = serializers.IntegerField(read_only=True)
    present_count = serializers.IntegerField(read_only=True)
    absent_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = AttendanceSession
        fields = [
            'id', 'subject', 'subject_name', 'subject_code',
            'teacher', 'teacher_name', 'date', 'topic', 'notes',
            'total_students', 'present_count', 'absent_count',
            'records', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class AttendanceSessionCreateSerializer(serializers.ModelSerializer):
    """
    Used when creating a session — accepts nested records list to mark
    attendance for multiple students in a single API call.
    """
    records = AttendanceRecordSerializer(many=True, required=False)

    class Meta:
        model = AttendanceSession
        fields = ['id', 'subject', 'teacher', 'date', 'topic', 'notes', 'records']

    def create(self, validated_data):
        records_data = validated_data.pop('records', [])
        session = AttendanceSession.objects.create(**validated_data)
        for record_data in records_data:
            AttendanceRecord.objects.create(session=session, **record_data)
        return session


class StudentAttendanceSummarySerializer(serializers.Serializer):
    """
    Summary of attendance stats for a single student across all sessions of a subject.
    """
    subject_id = serializers.UUIDField()
    subject_name = serializers.CharField()
    total_sessions = serializers.IntegerField()
    present = serializers.IntegerField()
    absent = serializers.IntegerField()
    late = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()


class BiometricProfileSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = BiometricProfile
        fields = [
            'id', 'student', 'student_name', 'student_roll', 'is_enrolled',
            'is_active', 'sample_size', 'consent_given_at', 'last_verified_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'student_name', 'student_roll', 'is_enrolled', 'sample_size',
            'consent_given_at', 'last_verified_at', 'created_at', 'updated_at',
        ]

    def get_is_enrolled(self, obj):
        return bool(obj.face_template)


class BiometricEnrollmentSerializer(serializers.Serializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.select_related('user').all())
    image = serializers.CharField(write_only=True)
    consent_confirmed = serializers.BooleanField()

    def validate_consent_confirmed(self, value):
        if not value:
            raise serializers.ValidationError('Biometric enrollment requires consent confirmation.')
        return value

    def validate_image(self, value):
        try:
            self.context['face_template'] = create_face_template(value)
        except BiometricError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        return value


class BiometricCheckInSerializer(serializers.Serializer):
    session = serializers.PrimaryKeyRelatedField(
        queryset=AttendanceSession.objects.select_related('subject', 'subject__course').all()
    )
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.select_related('user', 'course').all())
    image = serializers.CharField(write_only=True)

    def validate_image(self, value):
        try:
            self.context['face_template'] = create_face_template(value)
        except BiometricError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        return value

    def validate(self, attrs):
        if attrs['session'].subject.course_id != attrs['student'].course_id:
            raise serializers.ValidationError('Student is not enrolled in the session subject course.')
        return attrs
