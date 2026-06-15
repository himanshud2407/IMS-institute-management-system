'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { subjectService, courseService } from '../../../../services/academic';
import { Subject, Course } from '../../../../types';
import { Plus, Book, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { subjectSchema, SubjectFormData } from '../../../../schemas/academic';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { is_active: true, credits: 3 }
  });

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const data = await subjectService.getAll();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
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
    fetchSubjects();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAvailableCourses();
  }, []);

  const openModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setValue('name', subject.name);
      setValue('code', subject.code);
      setValue('course', subject.course);
      setValue('teacher', subject.teacher || '');
      setValue('description', subject.description || '');
      setValue('credits', subject.credits || 3);
      setValue('is_active', subject.is_active);
    } else {
      setEditingSubject(null);
      reset({ name: '', code: '', course: '', teacher: '', description: '', credits: 3, is_active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    reset();
  };

  const onSubmit = async (data: SubjectFormData) => {
    setIsSubmitting(true);
    const payload = { ...data, teacher: data.teacher || null };
    try {
      if (editingSubject) {
        await subjectService.update(editingSubject.id, payload);
        toast.success('Subject updated successfully');
      } else {
        await subjectService.create(payload);
        toast.success('Subject created successfully');
      }
      closeModal();
      fetchSubjects();
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
          <h1 className="text-2xl font-bold text-slate-800">Subjects Management</h1>
          <p className="text-sm text-slate-500">Manage institution curriculum subjects.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => openModal()}>
          <Plus className="w-4 h-4" />
          Add Subject
        </Button>
      </div>

      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Subject Info</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Credits</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Loading subjects...
                    </td>
                  </tr>
                ) : subjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No subjects found.
                    </td>
                  </tr>
                ) : (
                  subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Book className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{subject.name}</p>
                            <p className="text-xs text-slate-500">{subject.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">
                          {subject.course_details?.name || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{subject.credits}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-primary-600 p-2" onClick={() => openModal(subject)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-600 p-2" onClick={async () => {
                            if (confirm('Are you sure you want to delete this subject?')) {
                              try {
                                await subjectService.delete(subject.id);
                                toast.success('Subject deleted');
                                fetchSubjects();
                              } catch (error: any) {
                                const msg = error?.response?.data?.message || 'Failed to delete subject';
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
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Subject Name"
            placeholder="e.g. Physics 101"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            id="code"
            label="Subject Code"
            placeholder="e.g. PHY101"
            error={errors.code?.message}
            {...register('code')}
          />
          
          <div className="space-y-1.5">
            <label htmlFor="course" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Associated Course
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
            id="credits"
            type="number"
            label="Credits"
            error={errors.credits?.message}
            {...register('credits', { valueAsNumber: true })}
          />

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              id="description"
              className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
              rows={3}
              placeholder="Subject description..."
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
            <label htmlFor="is_active" className="text-sm text-slate-700 font-medium">Active Subject</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
