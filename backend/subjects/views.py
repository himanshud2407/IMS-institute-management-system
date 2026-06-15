from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin
from .models import Subject
from .serializers import SubjectSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing subjects.
    - List/Retrieve: Any authenticated user.
    - Create/Update/Delete: Admin only.
    """
    queryset = Subject.objects.select_related('course', 'teacher').all().order_by('-created_at')
    serializer_class = SubjectSerializer
    filterset_fields = ['course', 'teacher', 'is_active']
    search_fields = ['name', 'code', 'description']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
