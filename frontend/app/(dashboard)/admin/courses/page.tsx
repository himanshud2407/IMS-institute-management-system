'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { courseService } from '../../../../services/academic';
import { Course } from '../../../../types';
import { Plus, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { courseSchema, CourseFormData } from '../../../../schemas/academic';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: { duration: 8, is_active: true }
  });

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getAll();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourses();
  }, []);

  const openModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setValue('name', course.name);
      setValue('code', course.code);
      setValue('description', course.description || '');
      setValue('duration', course.duration || 8);
      setValue('is_active', course.is_active);
    } else {
      setEditingCourse(null);
      reset({ name: '', code: '', description: '', duration: 8, is_active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    reset();
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      if (editingCourse) {
        await courseService.update(editingCourse.id, data);
        toast.success('Course updated successfully');
      } else {
        await courseService.create(data);
        toast.success('Course created successfully');
      }
      closeModal();
      fetchCourses();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'An error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Courses Management</h1>
          <p className="text-sm text-slate-500">Manage institution courses and programs.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => openModal()}>
          <Plus className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Course Name & Code</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Loading courses...
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No courses found. Add a new course to get started.
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{course.name}</p>
                            <p className="text-xs text-slate-500">{course.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="line-clamp-2 max-w-xs">{course.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={course.is_active ? 'success' : 'secondary'}>
                          {course.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-primary-600 p-2" onClick={() => openModal(course)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-600 p-2" onClick={async () => {
                            if (confirm('Are you sure you want to delete this course?')) {
                              try {
                                await courseService.delete(course.id);
                                toast.success('Course deleted');
                                fetchCourses();
                              } catch (error: any) {
                                const msg = error?.response?.data?.message || 'Failed to delete course';
                                toast.error(msg);
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
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Course Name"
            placeholder="e.g. Computer Science"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            id="code"
            label="Course Code"
            placeholder="e.g. CS101"
            error={errors.code?.message}
            {...register('code')}
          />
          <Input
            id="duration"
            type="number"
            label="Duration (Semesters)"
            placeholder="e.g. 8"
            error={errors.duration?.message}
            {...register('duration')}
          />
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              id="description"
              className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
              rows={3}
              placeholder="Course description..."
              {...register('description')}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
              {...register('is_active')}
            />
            <label htmlFor="is_active" className="text-sm text-slate-700 font-medium">Active Course</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
