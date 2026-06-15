'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { teacherService } from '../../../../services/users';
import { Teacher } from '../../../../types';
import { Plus, Users, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { teacherSchema, TeacherFormData } from '../../../../schemas/users';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { status: 'ACTIVE' }
  });

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const data = await teacherService.getAll();
      const results = Array.isArray(data) ? data : [];
      setTeachers(results);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeachers();
  }, []);

  const openModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setValue('email', teacher.user?.email || '');
      setValue('full_name', teacher.user?.full_name || '');
      setValue('employee_id', teacher.employee_id);
      setValue('department', teacher.department);
      setValue('qualification', teacher.qualification);
      setValue('specialization', teacher.specialization || '');
      setValue('phone_number', teacher.phone_number);
      setValue('joining_date', teacher.joining_date);
      setValue('status', (teacher.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE');
    } else {
      setEditingTeacher(null);
      reset({ email: '', password: '', full_name: '', employee_id: '', department: '', qualification: '', specialization: '', phone_number: '', joining_date: '', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    reset();
  };

  const onSubmit = async (data: TeacherFormData) => {
    setIsSubmitting(true);
    try {
      if (editingTeacher) {
        const payload = { ...data };
        if (!payload.password) delete payload.password;
        await teacherService.update(editingTeacher.id, payload);
        toast.success('Teacher updated successfully');
      } else {
        await teacherService.create(data);
        toast.success('Teacher created successfully');
      }
      closeModal();
      fetchTeachers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } | Record<string, unknown> } };
      const errData = err?.response?.data;
      const firstError = errData && typeof errData === 'object' && !errData.message 
        ? firstErrorValue(errData)
        : errData?.message || 'An error occurred';
      toast.error(typeof firstError === 'string' ? firstError : 'An error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teachers Directory</h1>
          <p className="text-sm text-slate-500">Manage faculty members and assignments.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => openModal()}>
          <Plus className="w-4 h-4" />
          Add Teacher
        </Button>
      </div>

      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Faculty Info</th>
                  <th className="px-6 py-4">Department & Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Loading teachers...
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{teacher.user?.full_name}</p>
                            <p className="text-xs text-slate-500">ID: {teacher.employee_id} • {teacher.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{teacher.department}</p>
                        <p className="text-xs text-slate-500">{teacher.specialization}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={teacher.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {teacher.status === 'ACTIVE' ? 'Active' : teacher.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-primary-600 p-2" onClick={() => openModal(teacher)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-600 p-2" onClick={async () => {
                            if (confirm('Are you sure you want to delete this teacher?')) {
                              try {
                                await teacherService.delete(teacher.id);
                                toast.success('Teacher deleted');
                                fetchTeachers();
                              } catch (e) {
                                toast.error('Failed to delete teacher');
                              }
                            }
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              {editingTeacher ? 'Save Changes' : 'Create Teacher'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">User Account Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="teacher@institute.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder={editingTeacher ? "Leave blank to keep current" : "Secure password"}
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                id="full_name"
                label="Full Name"
                placeholder="e.g. John Doe"
                error={errors.full_name?.message}
                {...register('full_name')}
                className="md:col-span-2"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 mt-4">
            <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">Teacher Profile Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="employee_id"
                label="Employee ID"
                placeholder="e.g. EMP1001"
                error={errors.employee_id?.message}
                {...register('employee_id')}
              />
              <Input
                id="department"
                label="Department"
                placeholder="e.g. Computer Science"
                error={errors.department?.message}
                {...register('department')}
              />
              <Input
                id="qualification"
                label="Qualification"
                placeholder="e.g. Ph.D. in Computer Science"
                error={errors.qualification?.message}
                {...register('qualification')}
              />
              <Input
                id="specialization"
                label="Specialization"
                placeholder="e.g. Artificial Intelligence"
                error={errors.specialization?.message}
                {...register('specialization')}
              />
              <Input
                id="phone_number"
                label="Phone Number"
                placeholder="+1 234 567 890"
                error={errors.phone_number?.message}
                {...register('phone_number')}
              />
              <Input
                id="joining_date"
                type="date"
                label="Joining Date"
                error={errors.joining_date?.message}
                {...register('joining_date')}
              />
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  {...register('status')}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
                {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function firstErrorValue(errors: Record<string, unknown>) {
  const [firstValue] = Object.values(errors);
  if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
    return firstValue[0];
  }
  return 'An error occurred';
}
