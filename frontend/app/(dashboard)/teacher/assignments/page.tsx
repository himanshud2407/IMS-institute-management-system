'use client';

import React, { useEffect, useState } from 'react';
import { BookOpenCheck, Eye, Plus, Send, Star } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardBody } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { assignmentService } from '../../../../services/assignments';
import { subjectService } from '../../../../services/academic';
import { Assignment, AssignmentSubmission, Subject } from '../../../../types';
import type { BadgeProps } from '../../../../components/ui/Badge';

const statusVariant = (status: string) => {
  if (status === 'PUBLISHED' || status === 'GRADED') return 'success';
  if (status === 'DRAFT' || status === 'SUBMITTED') return 'warning';
  if (status === 'RETURNED') return 'info';
  return 'secondary';
};

const errorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError.response?.data?.message || fallback;
};

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grading, setGrading] = useState<Record<string, { marks_obtained: string; feedback: string }>>({});
  const [form, setForm] = useState({
    subject: '',
    title: '',
    description: '',
    instructions: '',
    attachment_url: '',
    due_date: '',
    max_marks: 100,
    status: 'PUBLISHED',
  });

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await assignmentService.getAll();
      setAssignments(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchAssignments();
      const subjectData = await subjectService.getAll();
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
    };
    load();
  }, []);

  const resetForm = () => setForm({
    subject: '',
    title: '',
    description: '',
    instructions: '',
    attachment_url: '',
    due_date: '',
    max_marks: 100,
    status: 'PUBLISHED',
  });

  const createAssignment = async () => {
    if (!form.subject || !form.title || !form.description || !form.due_date) {
      toast.error('Subject, title, description, and due date are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await assignmentService.create(form as Partial<Assignment>);
      toast.success('Assignment created');
      setIsCreateOpen(false);
      resetForm();
      fetchAssignments();
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to create assignment'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSubmissions = async (assignment: Assignment) => {
    try {
      setSelectedAssignment(assignment);
      const data = await assignmentService.getSubmissions(assignment.id);
      setSubmissions(Array.isArray(data) ? data : []);
      setGrading(
        Object.fromEntries(
          (Array.isArray(data) ? data : []).map((submission) => [
            submission.id,
            {
              marks_obtained: submission.marks_obtained?.toString() || '',
              feedback: submission.feedback || '',
            },
          ])
        )
      );
      setIsSubmissionsOpen(true);
    } catch {
      toast.error('Failed to load submissions');
    }
  };

  const gradeSubmission = async (submission: AssignmentSubmission) => {
    const draft = grading[submission.id];
    if (!draft?.marks_obtained) {
      toast.error('Enter marks before saving');
      return;
    }
    try {
      const updated = await assignmentService.gradeSubmission(submission.id, {
        marks_obtained: Number(draft.marks_obtained),
        feedback: draft.feedback,
        status: 'GRADED',
      });
      setSubmissions((items) => items.map((item) => item.id === updated.id ? updated : item));
      toast.success('Submission graded');
      fetchAssignments();
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to grade submission'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assignments</h1>
          <p className="text-sm text-slate-500">Create coursework and grade student submissions.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> New Assignment
        </Button>
      </div>

      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Assignment</th>
                  <th className="px-6 py-4">Due</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submissions</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading assignments...</td></tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <BookOpenCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No assignments yet.</p>
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{assignment.title}</p>
                        <p className="text-xs text-slate-400">{assignment.subject_name} ({assignment.subject_code})</p>
                      </td>
                      <td className="px-6 py-4">{new Date(assignment.due_date).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant(assignment.status) as BadgeProps['variant']}>{assignment.status}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{assignment.submissions_count ?? 0}</span>
                        <span className="text-slate-400"> / graded {assignment.graded_count ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="p-2" onClick={() => openSubmissions(assignment)}>
                          <Eye className="w-4 h-4" />
                        </Button>
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
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Assignment"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={createAssignment} isLoading={isSubmitting}><Send className="w-4 h-4 mr-2" /> Publish</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subject *</label>
            <select
              className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
              value={form.subject}
              onChange={(e) => setForm((value) => ({ ...value, subject: e.target.value }))}
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
            </select>
          </div>
          <Input label="Due Date *" type="datetime-local" value={form.due_date} onChange={(e) => setForm((value) => ({ ...value, due_date: e.target.value }))} />
          <Input label="Title *" className="md:col-span-2" value={form.title} onChange={(e) => setForm((value) => ({ ...value, title: e.target.value }))} />
          <Input label="Attachment URL" className="md:col-span-2" value={form.attachment_url} onChange={(e) => setForm((value) => ({ ...value, attachment_url: e.target.value }))} />
          <Input label="Max Marks" type="number" value={form.max_marks} onChange={(e) => setForm((value) => ({ ...value, max_marks: Number(e.target.value) }))} />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
            <select
              className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
              value={form.status}
              onChange={(e) => setForm((value) => ({ ...value, status: e.target.value }))}
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description *</label>
            <textarea className="w-full min-h-24 px-4 py-3 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={form.description} onChange={(e) => setForm((value) => ({ ...value, description: e.target.value }))} />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Instructions</label>
            <textarea className="w-full min-h-24 px-4 py-3 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={form.instructions} onChange={(e) => setForm((value) => ({ ...value, instructions: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isSubmissionsOpen}
        onClose={() => setIsSubmissionsOpen(false)}
        title={`Submissions: ${selectedAssignment?.title || ''}`}
        size="xl"
        footer={<Button onClick={() => setIsSubmissionsOpen(false)}>Close</Button>}
      >
        {submissions.length === 0 ? (
          <div className="py-10 text-center text-slate-400">No submissions yet.</div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="border border-slate-100 rounded-lg p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{submission.student_name}</p>
                    <p className="text-xs text-slate-400">Roll: {submission.student_roll} - {new Date(submission.submitted_at).toLocaleString()}</p>
                  </div>
              <Badge variant={statusVariant(submission.status) as BadgeProps['variant']}>{submission.status}</Badge>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{submission.content || 'No written response.'}</p>
                {submission.attachment_url && <a href={submission.attachment_url} target="_blank" className="text-sm text-primary-600 hover:text-primary-700">Open attachment</a>}
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-3 items-end">
                  <Input
                    label={`Marks / ${selectedAssignment?.max_marks ?? 100}`}
                    type="number"
                    value={grading[submission.id]?.marks_obtained || ''}
                    onChange={(e) => setGrading((value) => ({ ...value, [submission.id]: { ...(value[submission.id] || { feedback: '' }), marks_obtained: e.target.value } }))}
                  />
                  <Input
                    label="Feedback"
                    value={grading[submission.id]?.feedback || ''}
                    onChange={(e) => setGrading((value) => ({ ...value, [submission.id]: { ...(value[submission.id] || { marks_obtained: '' }), feedback: e.target.value } }))}
                  />
                  <Button size="sm" onClick={() => gradeSubmission(submission)}><Star className="w-4 h-4 mr-2" /> Save</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
