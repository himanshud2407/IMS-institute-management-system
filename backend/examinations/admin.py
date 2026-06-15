from django.contrib import admin

from .models import Exam, ExamResult


class ExamResultInline(admin.TabularInline):
    model = ExamResult
    extra = 0
    fields = ('student', 'marks_obtained', 'grade', 'status', 'remarks')
    readonly_fields = ('grade',)


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'teacher', 'exam_date', 'exam_type', 'status', 'results_published')
    list_filter = ('status', 'exam_type', 'results_published', 'subject__course', 'subject')
    search_fields = ('title', 'subject__name', 'subject__code')
    inlines = [ExamResultInline]


@admin.register(ExamResult)
class ExamResultAdmin(admin.ModelAdmin):
    list_display = ('exam', 'student', 'marks_obtained', 'grade', 'status')
    list_filter = ('status', 'exam__subject', 'exam__exam_type')
    search_fields = ('exam__title', 'student__user__full_name', 'student__roll_number')
