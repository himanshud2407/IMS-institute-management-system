from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin, IsOwnerOrAdmin
from .models import Student
from .serializers import StudentSerializer, StudentCreateSerializer

class StudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing students.
    - List/Retrieve: Any authenticated user.
    - Create/Delete: Admin only.
    - Update: Owner or Admin.
    """
    queryset = Student.objects.select_related('user', 'course').all().order_by('-created_at')
    filterset_fields = ['course', 'status']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'roll_number']

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        return StudentSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        return [IsAuthenticated()]
