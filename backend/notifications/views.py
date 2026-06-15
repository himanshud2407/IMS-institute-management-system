from django.db.models import Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import User
from accounts.permissions import IsAdmin
from .models import Notification, NotificationRead
from .serializers import NotificationRecipientSerializer, NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['audience', 'category', 'priority', 'is_published']
    search_fields = ['title', 'message']
    ordering_fields = ['publish_at', 'created_at', 'priority']

    def get_queryset(self):
        queryset = Notification.objects.select_related('created_by', 'recipient').prefetch_related('reads')
        user = self.request.user
        if user.role == 'ADMIN':
            return queryset
        now = timezone.now()
        audience = Notification.Audience
        role_audience = {
            'TEACHER': audience.TEACHERS,
            'STUDENT': audience.STUDENTS,
        }.get(user.role)
        return queryset.filter(
            is_published=True,
            publish_at__lte=now,
        ).filter(
            Q(audience=audience.ALL) |
            Q(audience=audience.USER, recipient=user) |
            Q(audience=role_audience)
        ).distinct()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'recipients']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        NotificationRead.objects.get_or_create(notification=notification, user=request.user)
        return Response(NotificationSerializer(notification, context={'request': request}).data)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        created = 0
        for notification in self.get_queryset():
            _, was_created = NotificationRead.objects.get_or_create(notification=notification, user=request.user)
            if was_created:
                created += 1
        return Response({'marked_read': created})

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        unread = self.get_queryset().exclude(reads__user=request.user).count()
        return Response({'unread_count': unread})

    @action(detail=False, methods=['get'], url_path='recipients')
    def recipients(self, request):
        users = User.objects.filter(is_active=True).order_by('role', 'full_name')
        return Response(NotificationRecipientSerializer(users, many=True).data)
