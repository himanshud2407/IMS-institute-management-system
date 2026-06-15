from rest_framework import serializers

from accounts.models import User
from .models import Notification, NotificationRead


class NotificationSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)
    is_read = serializers.SerializerMethodField()
    read_count = serializers.IntegerField(source='reads.count', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'audience', 'recipient',
            'recipient_name', 'category', 'priority', 'is_published',
            'publish_at', 'created_by', 'created_by_name', 'is_read',
            'read_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_is_read(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.reads.filter(user=request.user).exists()

    def validate(self, attrs):
        audience = attrs.get('audience') or getattr(self.instance, 'audience', None)
        recipient = attrs.get('recipient') or getattr(self.instance, 'recipient', None)
        if audience == Notification.Audience.USER and not recipient:
            raise serializers.ValidationError({'recipient': 'Recipient is required for direct notifications.'})
        if audience != Notification.Audience.USER:
            attrs['recipient'] = None
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class NotificationReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationRead
        fields = ['id', 'notification', 'user', 'read_at']
        read_only_fields = ['id', 'user', 'read_at']


class NotificationRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'role']
