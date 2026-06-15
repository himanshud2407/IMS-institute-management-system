from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'roll_number', 'course', 'status')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'roll_number')
    list_filter = ('course', 'status')
