"""
Accounts Admin
==============
Custom admin configuration for the User model.

Since we use a custom User model (AbstractBaseUser), we need to register it
with a custom admin class that specifies the correct fieldsets and list displays.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin for the User model.
    
    Provides a clean admin interface with:
    - List view: email, full_name, role, is_active, created_at
    - Search by email and full_name
    - Filter by role and is_active
    - Proper fieldsets for add/edit forms
    """

    # List display
    list_display = ("email", "full_name", "role", "is_active", "is_staff", "created_at")
    list_display_links = ("email", "full_name")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "full_name")
    ordering = ("-created_at",)

    # Edit form fieldsets
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("full_name",)}),
        ("Role", {"fields": ("role",)}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
    readonly_fields = ("created_at", "updated_at")

    # Add form fieldsets (when creating new user from admin)
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "full_name",
                    "role",
                    "password1",
                    "password2",
                ),
            },
        ),
    )
