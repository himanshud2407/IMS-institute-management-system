'use client';

import React, { useEffect, useState } from 'react';
import { BookOpenCheck, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardBody } from '../../../../components/ui/Card';
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

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (filterSubject) params.subject = filterSubject;
      if (filterStatus) params.status = filterStatus;
      const data = await assignmentService.getAll(params);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (assignment: Assignment) => {
    try {
      setSelectedAssignment(assignment);
      const data = await assignmentService.getSubmissions(assignment.id);
      setSubmissions(Array.isArray(data) ? data : []);
      setIsDetailOpen(true);
    } catch {
      toast.error('Failed to load submissions');
    }
  };

  const deleteAssignment = async (assignment: Assignment) => {
    if (!confirm(`Delete assignment "${assignment.title}" and its submissions?`)) return;
    try {
      await assignmentService.delete(assignment.id);
      toast.success('Assignment deleted');
      fetchAssignments();
    } catch {
      toast.error('Failed to delete assignment');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Assignment Overview</h1>
        <p className="text-sm text-slate-500">Monitor coursework across teachers, subjects, and submissions.</p>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subject</label>
              <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
              <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchAssignments}>Apply Filters</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Assignment</th>
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Due</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading assignments...</td></tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <BookOpenCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No assignments found.</p>
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{assignment.title}</p>
                        <p className="text-xs text-slate-400">{assignment.subject_name} ({assignment.subject_code})</p>
                      </td>
                      <td className="px-6 py-4">{assignment.teacher_name || 'Unassigned'}</td>
                      <td className="px-6 py-4">{new Date(assignment.due_date).toLocaleString()}</td>
                      <td className="px-6 py-4"><Badge variant={statusVariant(assignment.status) as BadgeProps['variant']}>{assignment.status}</Badge></td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{assignment.submissions_count ?? 0}</span>
                        <span className="text-slate-400"> submissions, {assignment.graded_count ?? 0} graded</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="p-2" onClick={() => openDetail(assignment)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-rose-600" onClick={() => deleteAssignment(assignment)}><Trash2 className="w-4 h-4" /></Button>
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
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Submissions: ${selectedAssignment?.title || ''}`}
        size="xl"
        footer={<Button onClick={() => setIsDetailOpen(false)}>Close</Button>}
      >
        {submissions.length === 0 ? (
          <div className="py-10 text-center text-slate-400">No submissions yet.</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{submission.student_name}</p>
                      <p className="text-xs text-slate-400">{submission.student_roll}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(submission.submitted_at).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(submission.status) as BadgeProps['variant']}>{submission.status}</Badge></td>
                    <td className="px-4 py-3 text-slate-600">{submission.marks_obtained ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
