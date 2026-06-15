'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays, Eye, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/Badge';
import type { BadgeProps } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardBody } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { examService } from '../../../../services/examinations';
import { subjectService } from '../../../../services/academic';
import { Exam, Subject } from '../../../../types';

const statusVariant = (status: string): BadgeProps['variant'] => {
  if (status === 'COMPLETED') return 'success';
  if (status === 'SCHEDULED') return 'info';
  if (status === 'CANCELLED') return 'danger';
  return 'secondary';
};

const errorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError.response?.data?.message || fallback;
};

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    title: '',
    exam_type: 'MIDTERM',
    exam_date: '',
    start_time: '',
    end_time: '',
    total_marks: 100,
    passing_marks: 35,
    status: 'SCHEDULED',
    description: '',
  });

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const data = await examService.getAll();
      setExams(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load exams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchExams();
      const subjectData = await subjectService.getAll();
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
    };
    load();
  }, []);

  const resetForm = () => setForm({
    subject: '',
    title: '',
    exam_type: 'MIDTERM',
    exam_date: '',
    start_time: '',
    end_time: '',
    total_marks: 100,
    passing_marks: 35,
    status: 'SCHEDULED',
    description: '',
  });

  const createExam = async () => {
    if (!form.subject || !form.title || !form.exam_date || !form.start_time || !form.end_time) {
      toast.error('Subject, title, date, and times are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await examService.create(form as Partial<Exam>);
      toast.success('Exam scheduled');
      setIsCreateOpen(false);
      resetForm();
      fetchExams();
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to schedule exam'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteExam = async (exam: Exam) => {
    if (!confirm(`Delete exam "${exam.title}" and its results?`)) return;
    try {
      await examService.delete(exam.id);
      toast.success('Exam deleted');
      fetchExams();
    } catch {
      toast.error('Failed to delete exam');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Exam Schedule</h1>
          <p className="text-sm text-slate-500">Create and monitor exams across subjects.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Schedule Exam
        </Button>
      </div>

      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Exam</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Marks</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Results</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading exams...</td></tr>
                ) : exams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No exams scheduled.</p>
                    </td>
                  </tr>
                ) : exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{exam.title}</p>
                      <p className="text-xs text-slate-400">{exam.subject_name} ({exam.subject_code}) - {exam.exam_type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{exam.exam_date}</p>
                      <p className="text-xs text-slate-400">{exam.start_time} - {exam.end_time}</p>
                    </td>
                    <td className="px-6 py-4">{exam.total_marks} total, {exam.passing_marks} pass</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant(exam.status)}>{exam.status}</Badge></td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{exam.results_count ?? 0}</span>
                      <span className="text-slate-400"> entered</span>
                      {exam.results_published && <Badge className="ml-2" variant="success">PUBLISHED</Badge>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="p-2" onClick={() => { setSelectedExam(exam); setIsDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-rose-600" onClick={() => deleteExam(exam)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule Exam"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={createExam} isLoading={isSubmitting}>Save Exam</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subject *</label>
            <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={form.subject} onChange={(e) => setForm((value) => ({ ...value, subject: e.target.value }))}>
              <option value="">Select subject</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
            </select>
          </div>
          <Input label="Title *" value={form.title} onChange={(e) => setForm((value) => ({ ...value, title: e.target.value }))} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exam Type</label>
            <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={form.exam_type} onChange={(e) => setForm((value) => ({ ...value, exam_type: e.target.value }))}>
              <option value="QUIZ">Quiz</option>
              <option value="MIDTERM">Midterm</option>
              <option value="FINAL">Final</option>
              <option value="PRACTICAL">Practical</option>
              <option value="ASSIGNMENT">Assignment</option>
            </select>
          </div>
          <Input label="Exam Date *" type="date" value={form.exam_date} onChange={(e) => setForm((value) => ({ ...value, exam_date: e.target.value }))} />
          <Input label="Start Time *" type="time" value={form.start_time} onChange={(e) => setForm((value) => ({ ...value, start_time: e.target.value }))} />
          <Input label="End Time *" type="time" value={form.end_time} onChange={(e) => setForm((value) => ({ ...value, end_time: e.target.value }))} />
          <Input label="Total Marks" type="number" value={form.total_marks} onChange={(e) => setForm((value) => ({ ...value, total_marks: Number(e.target.value) }))} />
          <Input label="Passing Marks" type="number" value={form.passing_marks} onChange={(e) => setForm((value) => ({ ...value, passing_marks: Number(e.target.value) }))} />
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
            <textarea className="w-full min-h-24 px-4 py-3 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={form.description} onChange={(e) => setForm((value) => ({ ...value, description: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedExam?.title || 'Exam'} size="lg" footer={<Button onClick={() => setIsDetailOpen(false)}>Close</Button>}>
        {selectedExam && (
          <div className="space-y-4 text-sm text-slate-600">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 p-4 text-center"><p className="text-2xl font-bold text-slate-800">{selectedExam.results_count ?? 0}</p><p className="text-xs text-slate-500">Results</p></div>
              <div className="rounded-lg bg-emerald-50 p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{selectedExam.pass_count ?? 0}</p><p className="text-xs text-emerald-700">Pass</p></div>
              <div className="rounded-lg bg-primary-50 p-4 text-center"><p className="text-2xl font-bold text-primary-700">{selectedExam.total_marks}</p><p className="text-xs text-primary-700">Marks</p></div>
            </div>
            <p><span className="font-semibold">Subject:</span> {selectedExam.subject_name} ({selectedExam.subject_code})</p>
            <p><span className="font-semibold">Teacher:</span> {selectedExam.teacher_name || 'Unassigned'}</p>
            <p><span className="font-semibold">Schedule:</span> {selectedExam.exam_date}, {selectedExam.start_time} - {selectedExam.end_time}</p>
            {selectedExam.description && <p className="whitespace-pre-wrap">{selectedExam.description}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
