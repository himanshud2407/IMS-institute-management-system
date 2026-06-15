from django.contrib import admin
from .models import Subject

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'course', 'teacher', 'is_active')
    search_fields = ('name', 'code')
    list_filter = ('is_active', 'course')
