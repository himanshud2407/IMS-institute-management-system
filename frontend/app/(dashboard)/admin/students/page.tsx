'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { studentService } from '../../../../services/users';
import { courseService } from '../../../../services/academic';
import { Student, Course } from '../../../../types';
import { Plus, GraduationCap, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { studentSchema, StudentFormData } from '../../../../schemas/users';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: { status: 'ACTIVE', gender: 'MALE' }
  });

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await studentService.getAll();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const data = await courseService.getAll();
      setAvailableCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAvailableCourses();
  }, []);

  const openModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setValue('email', student.user?.email || '');
      setValue('full_name', student.user?.full_name || '');
      setValue('roll_number', student.roll_number);
      setValue('course', student.course.id);
      setValue('phone_number', student.phone_number);
      setValue('date_of_birth', student.date_of_birth);
      setValue('gender', student.gender as 'MALE' | 'FEMALE' | 'OTHER');
      setValue('address', student.address);
      setValue('admission_date', student.admission_date);
      setValue('status', (student.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED');
    } else {
      setEditingStudent(null);
      reset({ email: '', password: '', full_name: '', roll_number: '', course: '', phone_number: '', date_of_birth: '', gender: 'MALE', address: '', admission_date: '', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    reset();
  };

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        const payload = { ...data };
        if (!payload.password) delete payload.password;
        await studentService.update(editingStudent.id, payload);
        toast.success('Student updated successfully');
      } else {
        await studentService.create(data);
        toast.success('Student created successfully');
      }
      closeModal();
      fetchStudents();
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
          <h1 className="text-2xl font-bold text-slate-800">Students Directory</h1>
          <p className="text-sm text-slate-500">Manage student records and enrollments.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => openModal()}>
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Info</th>
                  <th className="px-6 py-4">Course & Roll No.</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{student.user?.full_name}</p>
                            <p className="text-xs text-slate-500">{student.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{student.course?.name}</p>
                        <p className="text-xs text-slate-500">Roll: {student.roll_number}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={student.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-primary-600 p-2" onClick={() => openModal(student)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-600 p-2" onClick={async () => {
                            if (confirm('Are you sure you want to delete this student?')) {
                              try {
                                await studentService.delete(student.id);
                                toast.success('Student deleted');
                                fetchStudents();
                              } catch (e) {
                                toast.error('Failed to delete student');
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
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              {editingStudent ? 'Save Changes' : 'Create Student'}
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
                placeholder="student@institute.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder={editingStudent ? "Leave blank to keep current" : "Secure password"}
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                id="full_name"
                label="Full Name"
                placeholder="e.g. Jane Smith"
                error={errors.full_name?.message}
                {...register('full_name')}
                className="md:col-span-2"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 mt-4">
            <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">Student Profile Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="roll_number"
                label="Roll Number"
                placeholder="e.g. STU2023001"
                error={errors.roll_number?.message}
                {...register('roll_number')}
              />
              <div className="space-y-1.5">
                <label htmlFor="course" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Enrolled Course
                </label>
                <select
                  id="course"
                  className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  {...register('course')}
                >
                  <option value="">Select a Course</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.course && <p className="text-xs text-red-500">{errors.course.message}</p>}
              </div>

              <Input
                id="phone_number"
                label="Phone Number"
                placeholder="+1 234 567 890"
                error={errors.phone_number?.message}
                {...register('phone_number')}
              />
              <Input
                id="date_of_birth"
                type="date"
                label="Date of Birth"
                error={errors.date_of_birth?.message}
                {...register('date_of_birth')}
              />
              
              <div className="space-y-1.5">
                <label htmlFor="gender" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Gender
                </label>
                <select
                  id="gender"
                  className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  {...register('gender')}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
              </div>
              
              <Input
                id="admission_date"
                type="date"
                label="Admission Date"
                error={errors.admission_date?.message}
                {...register('admission_date')}
              />
              
              <div className="md:col-span-2 space-y-1.5">
                <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Address
                </label>
                <textarea
                  id="address"
                  className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                  rows={2}
                  placeholder="Full residential address..."
                  {...register('address')}
                />
                {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
              </div>

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
                  <option value="SUSPENDED">Suspended</option>
                  <option value="GRADUATED">Graduated</option>
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
