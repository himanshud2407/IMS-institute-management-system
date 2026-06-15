from django.contrib import admin

from .models import Notification, NotificationRead


class NotificationReadInline(admin.TabularInline):
    model = NotificationRead
    extra = 0
    fields = ('user', 'read_at')
    readonly_fields = ('read_at',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'audience', 'category', 'priority', 'is_published', 'publish_at', 'created_by')
    list_filter = ('audience', 'category', 'priority', 'is_published')
    search_fields = ('title', 'message')
    inlines = [NotificationReadInline]


@admin.register(NotificationRead)
class NotificationReadAdmin(admin.ModelAdmin):
    list_display = ('notification', 'user', 'read_at')
    list_filter = ('read_at',)
    search_fields = ('notification__title', 'user__full_name', 'user__email')
