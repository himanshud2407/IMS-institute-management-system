from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin, IsOwnerOrAdmin
from .models import Teacher
from .serializers import TeacherSerializer, TeacherCreateSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing teachers.
    - List/Retrieve: Any authenticated user.
    - Create/Delete: Admin only.
    - Update: Owner or Admin.
    """
    queryset = Teacher.objects.select_related('user').all().order_by('-created_at')
    filterset_fields = ['department', 'status']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'employee_id']

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherCreateSerializer
        return TeacherSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        return [IsAuthenticated()]
