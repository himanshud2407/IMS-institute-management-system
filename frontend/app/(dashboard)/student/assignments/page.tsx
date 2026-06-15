'use client';

import React, { useEffect, useState } from 'react';
import { BookOpenCheck, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardBody } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { assignmentService } from '../../../../services/assignments';
import { Assignment } from '../../../../types';
import type { BadgeProps } from '../../../../components/ui/Badge';

const badgeVariant = (assignment: Assignment) => {
  if (assignment.my_submission?.status === 'GRADED') return 'success';
  if (assignment.my_submission) return 'info';
  if (assignment.is_overdue) return 'danger';
  return 'warning';
};

const badgeText = (assignment: Assignment) => {
  if (assignment.my_submission?.status === 'GRADED') return `GRADED ${assignment.my_submission.marks_obtained}/${assignment.max_marks}`;
  if (assignment.my_submission) return 'SUBMITTED';
  if (assignment.is_overdue) return 'OVERDUE';
  return 'PENDING';
};

const errorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError.response?.data?.message || fallback;
};

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssignments();
  }, []);

  const openSubmit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setContent('');
    setAttachmentUrl('');
    setIsSubmitOpen(true);
  };

  const submitAssignment = async () => {
    if (!selectedAssignment) return;
    if (!content && !attachmentUrl) {
      toast.error('Add a response or attachment URL');
      return;
    }
    setIsSubmitting(true);
    try {
      await assignmentService.submit({
        assignment: selectedAssignment.id,
        content,
        attachment_url: attachmentUrl,
      });
      toast.success('Assignment submitted');
      setIsSubmitOpen(false);
      fetchAssignments();
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to submit assignment'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Assignments</h1>
        <p className="text-sm text-slate-500">Review coursework, submit responses, and track grading.</p>
      </div>

      {isLoading ? (
        <Card><CardBody className="py-12 text-center text-slate-400">Loading assignments...</CardBody></Card>
      ) : assignments.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <BookOpenCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No assignments assigned yet.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="overflow-hidden">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{assignment.title}</h3>
                    <p className="text-sm text-slate-500">{assignment.subject_name} ({assignment.subject_code})</p>
                  </div>
                  <Badge variant={badgeVariant(assignment) as BadgeProps['variant']}>{badgeText(assignment)}</Badge>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3">{assignment.description}</p>
                {assignment.instructions && (
                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm text-slate-600 whitespace-pre-wrap">
                    {assignment.instructions}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Due {new Date(assignment.due_date).toLocaleString()}</span>
                  <span>{assignment.max_marks} marks</span>
                  {assignment.attachment_url && <a href={assignment.attachment_url} target="_blank" className="text-primary-600">Attachment</a>}
                </div>
                {assignment.my_submission?.feedback && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                    <span className="font-semibold">Feedback: </span>{assignment.my_submission.feedback}
                  </div>
                )}
                <Button
                  className="w-full"
                  disabled={Boolean(assignment.my_submission) || assignment.is_overdue}
                  onClick={() => openSubmit(assignment)}
                >
                  {assignment.my_submission ? 'Submitted' : assignment.is_overdue ? 'Closed' : 'Submit Assignment'}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title={`Submit: ${selectedAssignment?.title || ''}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSubmitOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={submitAssignment} isLoading={isSubmitting}><Send className="w-4 h-4 mr-2" /> Submit</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Response</label>
            <textarea
              className="w-full min-h-44 px-4 py-3 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your answer or submission notes..."
            />
          </div>
          <Input
            label="Attachment URL"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </Modal>
    </div>
  );
}
