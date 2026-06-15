'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Eye, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/Badge';
import type { BadgeProps } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardBody } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { notificationService } from '../../../../services/notifications';
import { Notification, NotificationRecipient } from '../../../../types';

const priorityVariant = (priority: string): BadgeProps['variant'] => {
  if (priority === 'URGENT') return 'danger';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'LOW') return 'secondary';
  return 'info';
};

const errorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError.response?.data?.message || fallback;
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    audience: 'ALL',
    recipient: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    is_published: true,
    publish_at: new Date().toISOString().slice(0, 16),
  });

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchNotifications();
      const recipientData = await notificationService.getRecipients();
      setRecipients(Array.isArray(recipientData) ? recipientData : []);
    };
    load();
  }, []);

  const resetForm = () => setForm({
    title: '',
    message: '',
    audience: 'ALL',
    recipient: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    is_published: true,
    publish_at: new Date().toISOString().slice(0, 16),
  });

  const createNotification = async () => {
    if (!form.title || !form.message) {
      toast.error('Title and message are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await notificationService.create({
        ...form,
        recipient: form.audience === 'USER' ? form.recipient : null,
        publish_at: new Date(form.publish_at).toISOString(),
      } as Partial<Notification>);
      toast.success('Notification created');
      setIsCreateOpen(false);
      resetForm();
      fetchNotifications();
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to create notification'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteNotification = async (notification: Notification) => {
    if (!confirm(`Delete notification "${notification.title}"?`)) return;
    try {
      await notificationService.delete(notification.id);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500">Send announcements to everyone, a role, or a specific user.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> New Notification
        </Button>
      </div>

      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Notification</th>
                  <th className="px-6 py-4">Audience</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Publish</th>
                  <th className="px-6 py-4">Reads</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading notifications...</td></tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No notifications yet.</p>
                    </td>
                  </tr>
                ) : notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{notification.title}</p>
                      <p className="text-xs text-slate-400">{notification.category}</p>
                    </td>
                    <td className="px-6 py-4">{notification.audience === 'USER' ? notification.recipient_name : notification.audience}</td>
                    <td className="px-6 py-4"><Badge variant={priorityVariant(notification.priority)}>{notification.priority}</Badge></td>
                    <td className="px-6 py-4">
                      <p>{new Date(notification.publish_at).toLocaleString()}</p>
                      {!notification.is_published && <p className="text-xs text-amber-600 font-semibold">Draft</p>}
                    </td>
                    <td className="px-6 py-4">{notification.read_count ?? 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="p-2" onClick={() => { setSelectedNotification(notification); setIsDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-rose-600" onClick={() => deleteNotification(notification)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Notification" size="xl" footer={<><Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button><Button onClick={createNotification} isLoading={isSubmitting}>Send</Button></>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title *" className="md:col-span-2" value={form.title} onChange={(e) => setForm((value) => ({ ...value, title: e.target.value }))} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Audience</label>
            <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={form.audience} onChange={(e) => setForm((value) => ({ ...value, audience: e.target.value }))}>
              <option value="ALL">All Users</option>
              <option value="ADMINS">Admins</option>
              <option value="TEACHERS">Teachers</option>
              <option value="STUDENTS">Students</option>
              <option value="USER">Specific User</option>
            </select>
          </div>
          {form.audience === 'USER' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recipient</label>
              <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={form.recipient} onChange={(e) => setForm((value) => ({ ...value, recipient: e.target.value }))}>
                <option value="">Select user</option>
                {recipients.map((user) => <option key={user.id} value={user.id}>{user.full_name} ({user.role})</option>)}
              </select>
            </div>
          ) : (
            <Input label="Publish At" type="datetime-local" value={form.publish_at} onChange={(e) => setForm((value) => ({ ...value, publish_at: e.target.value }))} />
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category</label>
            <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={form.category} onChange={(e) => setForm((value) => ({ ...value, category: e.target.value }))}>
              <option value="GENERAL">General</option>
              <option value="ACADEMIC">Academic</option>
              <option value="FEES">Fees</option>
              <option value="EXAMS">Exams</option>
              <option value="ATTENDANCE">Attendance</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</label>
            <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={form.priority} onChange={(e) => setForm((value) => ({ ...value, priority: e.target.value }))}>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          {form.audience === 'USER' && <Input label="Publish At" type="datetime-local" value={form.publish_at} onChange={(e) => setForm((value) => ({ ...value, publish_at: e.target.value }))} />}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Message *</label>
            <textarea className="w-full min-h-40 px-4 py-3 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={form.message} onChange={(e) => setForm((value) => ({ ...value, message: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedNotification?.title || 'Notification'} size="lg" footer={<Button onClick={() => setIsDetailOpen(false)}>Close</Button>}>
        {selectedNotification && (
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex flex-wrap gap-2">
              <Badge variant={priorityVariant(selectedNotification.priority)}>{selectedNotification.priority}</Badge>
              <Badge variant="secondary">{selectedNotification.category}</Badge>
              <Badge variant={selectedNotification.is_published ? 'success' : 'warning'}>{selectedNotification.is_published ? 'PUBLISHED' : 'DRAFT'}</Badge>
            </div>
            <p className="whitespace-pre-wrap">{selectedNotification.message}</p>
            <p className="text-xs text-slate-400">Published {new Date(selectedNotification.publish_at).toLocaleString()} by {selectedNotification.created_by_name || 'Admin'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
