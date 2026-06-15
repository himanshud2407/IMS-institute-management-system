from django.contrib import admin
from .models import AttendanceSession, AttendanceRecord, BiometricProfile


class AttendanceRecordInline(admin.TabularInline):
    model = AttendanceRecord
    extra = 0
    fields = ('student', 'status', 'remarks')


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'date', 'teacher', 'topic', 'total_students', 'present_count', 'absent_count')
    list_filter = ('date', 'subject__course', 'subject')
    search_fields = ('subject__name', 'subject__code', 'topic')
    inlines = [AttendanceRecordInline]


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'status', 'source', 'confidence', 'verified_at', 'remarks')
    list_filter = ('status', 'source', 'session__subject')
    search_fields = ('student__user__first_name', 'student__roll_number')


@admin.register(BiometricProfile)
class BiometricProfileAdmin(admin.ModelAdmin):
    list_display = ('student', 'is_active', 'sample_size', 'consent_given_at', 'last_verified_at')
    list_filter = ('is_active', 'consent_given_at')
    search_fields = ('student__user__full_name', 'student__roll_number')
    readonly_fields = ('face_template', 'sample_size', 'consent_given_at', 'last_verified_at')
