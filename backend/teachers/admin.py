from django.contrib import admin
from .models import Teacher

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('user', 'employee_id', 'department', 'qualification', 'status')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'employee_id')
    list_filter = ('department', 'status')
