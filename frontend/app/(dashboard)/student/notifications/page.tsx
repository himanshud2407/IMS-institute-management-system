'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/Badge';
import type { BadgeProps } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardBody } from '../../../../components/ui/Card';
import { notificationService } from '../../../../services/notifications';
import { Notification } from '../../../../types';

const priorityVariant = (priority: string): BadgeProps['variant'] => {
  if (priority === 'URGENT') return 'danger';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'LOW') return 'secondary';
  return 'info';
};

export default function NotificationsInboxPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const [items, count] = await Promise.all([
        notificationService.getAll(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(Array.isArray(items) ? items : []);
      setUnreadCount(count.unread_count ?? 0);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, []);

  const markRead = async (notification: Notification) => {
    try {
      const updated = await notificationService.markRead(notification.id);
      setNotifications((items) => items.map((item) => item.id === updated.id ? updated : item));
      setUnreadCount((count) => Math.max(count - (notification.is_read ? 0 : 1), 0));
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500">{unreadCount} unread message{unreadCount === 1 ? '' : 's'}.</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCheck className="w-4 h-4" /> Mark all read
        </Button>
      </div>

      {isLoading ? (
        <Card><CardBody className="py-12 text-center text-slate-400">Loading notifications...</CardBody></Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No notifications yet.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.is_read ? 'opacity-80' : 'border-primary-200 shadow-sm'}>
              <CardBody className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-800">{notification.title}</h3>
                      {!notification.is_read && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                    </div>
                    <p className="text-xs text-slate-400">
                      {notification.category} - {new Date(notification.publish_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityVariant(notification.priority)}>{notification.priority}</Badge>
                    {!notification.is_read && <Button size="sm" variant="outline" onClick={() => markRead(notification)}>Mark read</Button>}
                  </div>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{notification.message}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
