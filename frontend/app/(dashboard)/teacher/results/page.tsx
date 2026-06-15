'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Award, CheckCircle, Megaphone, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/Badge';
import type { BadgeProps } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardBody } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { examService, resultService } from '../../../../services/examinations';
import { studentService } from '../../../../services/users';
import { Exam, ExamResult } from '../../../../types';

type ResultDraft = {
  resultId?: string;
  student: string;
  student_name: string;
  student_roll: string;
  marks_obtained: string;
  status: 'PASS' | 'FAIL' | 'ABSENT' | 'WITHHELD';
  remarks: string;
};

const statusVariant = (status: string): BadgeProps['variant'] => {
  if (status === 'PASS' || status === 'COMPLETED') return 'success';
  if (status === 'FAIL' || status === 'ABSENT') return 'danger';
  if (status === 'WITHHELD' || status === 'SCHEDULED') return 'warning';
  return 'secondary';
};

const errorMessage = (error: unknown, fallback: string) => {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError.response?.data?.message || fallback;
};

export default function TeacherResultsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [drafts, setDrafts] = useState<ResultDraft[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const selectedExam = useMemo(
    () => exams.find((exam) => exam.id === selectedExamId) || null,
    [exams, selectedExamId]
  );

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const data = await examService.getAll();
      const examList = Array.isArray(data) ? data : [];
      setExams(examList);
      if (!selectedExamId && examList.length > 0) {
        setSelectedExamId(examList[0].id);
      }
    } catch {
      toast.error('Failed to load exams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadExamWorkspace = async () => {
      if (!selectedExam) {
        setResults([]);
        setDrafts([]);
        return;
      }
      try {
        const [studentData, resultData] = await Promise.all([
          studentService.getAll(),
          examService.getResults(selectedExam.id),
        ]);
        const allStudents = Array.isArray(studentData) ? studentData : [];
        const courseStudents = allStudents.filter((student) => {
          const course = student.course as { id?: string } | string;
          const courseId = typeof course === 'object' ? course.id : course;
          return courseId === selectedExam.subject_course;
        });
        const resultList = Array.isArray(resultData) ? resultData : [];
        setResults(resultList);
        setDrafts(courseStudents.map((student) => {
          const existing = resultList.find((result) => result.student === student.id);
          return {
            resultId: existing?.id,
            student: student.id,
            student_name: student.user?.full_name || '',
            student_roll: student.roll_number,
            marks_obtained: existing?.marks_obtained?.toString() || '',
            status: existing?.status || 'PASS',
            remarks: existing?.remarks || '',
          };
        }));
      } catch {
        toast.error('Failed to load result workspace');
      }
    };
    loadExamWorkspace();
  }, [selectedExam]);

  const updateDraft = (studentId: string, patch: Partial<ResultDraft>) => {
    setDrafts((items) => items.map((item) => item.student === studentId ? { ...item, ...patch } : item));
  };

  const saveResult = async (draft: ResultDraft) => {
    if (!selectedExam) return;
    if (draft.status !== 'ABSENT' && draft.status !== 'WITHHELD' && !draft.marks_obtained) {
      toast.error('Enter marks or mark the student absent/withheld');
      return;
    }
    setIsSaving(true);
    try {
      const payload: Partial<ExamResult> = {
        exam: selectedExam.id,
        student: draft.student,
        marks_obtained: draft.status === 'ABSENT' ? null : draft.marks_obtained,
        status: draft.status,
        remarks: draft.remarks,
      };
      const saved = draft.resultId
        ? await resultService.update(draft.resultId, payload)
        : await resultService.create(payload);
      updateDraft(draft.student, {
        resultId: saved.id,
        marks_obtained: saved.marks_obtained?.toString() || '',
        status: saved.status,
        remarks: saved.remarks || '',
      });
      setResults((items) => {
        const exists = items.some((item) => item.id === saved.id);
        return exists ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved];
      });
      toast.success('Result saved');
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to save result'));
    } finally {
      setIsSaving(false);
    }
  };

  const publishResults = async () => {
    if (!selectedExam) return;
    setIsPublishing(true);
    try {
      const updated = await examService.publishResults(selectedExam.id);
      setExams((items) => items.map((item) => item.id === updated.id ? updated : item));
      toast.success('Results published');
    } catch {
      toast.error('Failed to publish results');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Results Entry</h1>
          <p className="text-sm text-slate-500">Enter marks, update statuses, and publish results for your exams.</p>
        </div>
        {selectedExam && (
          <Button className="flex items-center gap-2" onClick={publishResults} isLoading={isPublishing} disabled={selectedExam.results_published || results.length === 0}>
            <Megaphone className="w-4 h-4" /> {selectedExam.results_published ? 'Published' : 'Publish Results'}
          </Button>
        )}
      </div>

      <Card>
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exam</label>
              <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
                <option value="">Select exam</option>
                {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title} - {exam.subject_name}</option>)}
              </select>
            </div>
            {selectedExam && <Badge variant={statusVariant(selectedExam.status)}>{selectedExam.status}</Badge>}
            {selectedExam?.results_published && <Badge variant="success">PUBLISHED</Badge>}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Marks</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4 text-right">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading exams...</td></tr>
                ) : !selectedExam ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Select an exam to enter marks.</td></tr>
                ) : drafts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No students available for result entry.</p>
                    </td>
                  </tr>
                ) : drafts.map((draft) => (
                  <tr key={draft.student} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{draft.student_name}</p>
                      <p className="text-xs text-slate-400">Roll: {draft.student_roll}</p>
                    </td>
                    <td className="px-6 py-4 min-w-32">
                      <Input type="number" value={draft.marks_obtained} onChange={(e) => updateDraft(draft.student, { marks_obtained: e.target.value })} disabled={draft.status === 'ABSENT'} />
                    </td>
                    <td className="px-6 py-4 min-w-36">
                      <select className="w-full px-3 py-2 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={draft.status} onChange={(e) => updateDraft(draft.student, { status: e.target.value as ResultDraft['status'] })}>
                        <option value="PASS">Pass</option>
                        <option value="FAIL">Fail</option>
                        <option value="ABSENT">Absent</option>
                        <option value="WITHHELD">Withheld</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 min-w-56">
                      <Input value={draft.remarks} onChange={(e) => updateDraft(draft.student, { remarks: e.target.value })} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" onClick={() => saveResult(draft)} isLoading={isSaving}>
                        {draft.resultId ? <CheckCircle className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Save
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
