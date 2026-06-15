from django.contrib import admin

from .models import Assignment, AssignmentSubmission


class AssignmentSubmissionInline(admin.TabularInline):
    model = AssignmentSubmission
    extra = 0
    fields = ('student', 'status', 'marks_obtained', 'submitted_at', 'graded_at')
    readonly_fields = ('submitted_at', 'graded_at')


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'teacher', 'due_date', 'status', 'submissions_count', 'graded_count')
    list_filter = ('status', 'subject__course', 'subject', 'due_date')
    search_fields = ('title', 'description', 'subject__name', 'subject__code')
    inlines = [AssignmentSubmissionInline]


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'status', 'marks_obtained', 'submitted_at', 'graded_at')
    list_filter = ('status', 'assignment__subject')
    search_fields = ('assignment__title', 'student__user__full_name', 'student__roll_number')
