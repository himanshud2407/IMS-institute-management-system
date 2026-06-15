"""
Accounts Permissions
====================
Role-Based Access Control (RBAC) permission classes.

Concept:
    DRF permissions are checked on every request before the view logic runs.
    Each permission class checks the authenticated user's role and returns
    True/False. Views combine these using permission_classes=[IsAdmin] etc.

Usage in views:
    class StudentViewSet(viewsets.ModelViewSet):
        permission_classes = [IsAuthenticated, IsAdmin]
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Allow access only to users with ADMIN role.
    Used for: Student/Teacher/Course/Subject CRUD, Fee management, Reports.
    """
    message = "Admin access required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class IsTeacher(BasePermission):
    """
    Allow access only to users with TEACHER role.
    Used for: Attendance marking, Assignment creation, Marks entry.
    """
    message = "Teacher access required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "TEACHER"
        )


class IsStudent(BasePermission):
    """
    Allow access only to users with STUDENT role.
    Used for: Viewing own attendance, Submitting assignments, Viewing results.
    """
    message = "Student access required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "STUDENT"
        )


class IsAdminOrTeacher(BasePermission):
    """
    Allow access to users with ADMIN or TEACHER role.
    Used for: Viewing student lists, Attendance reports.
    """
    message = "Admin or Teacher access required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("ADMIN", "TEACHER")
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission: allow access if user is the object owner or admin.
    
    The object must have a `user` field (FK or OneToOne to User).
    Used for: Profile editing, where users can edit their own data.
    """
    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        # Admin can access everything
        if request.user.role == "ADMIN":
            return True
        # Check if the object belongs to the requesting user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user
