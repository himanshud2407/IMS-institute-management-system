from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin
from .models import Course
from .serializers import CourseSerializer


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing courses.
    - List/Retrieve: Any authenticated user.
    - Create/Update/Delete: Admin only.
    """
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    filterset_fields = ['is_active']
    search_fields = ['name', 'code', 'description']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
