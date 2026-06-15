'use client';

import React, { useEffect, useState } from 'react';
import { Award, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/Badge';
import type { BadgeProps } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardBody } from '../../../../components/ui/Card';
import { Modal } from '../../../../components/ui/Modal';
import { examService, resultService } from '../../../../services/examinations';
import { Exam, ExamResult } from '../../../../types';

const statusVariant = (status: string): BadgeProps['variant'] => {
  if (status === 'PASS') return 'success';
  if (status === 'FAIL' || status === 'ABSENT') return 'danger';
  if (status === 'WITHHELD') return 'warning';
  return 'secondary';
};

export default function AdminResultsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterExam, setFilterExam] = useState('');

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (filterExam) params.exam = filterExam;
      const data = await resultService.getAll(params);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const [examData] = await Promise.all([examService.getAll(), fetchResults()]);
      setExams(Array.isArray(examData) ? examData : []);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Results Overview</h1>
        <p className="text-sm text-slate-500">Review entered marks and publication status across exams.</p>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px] space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exam</label>
              <select className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none" value={filterExam} onChange={(e) => setFilterExam(e.target.value)}>
                <option value="">All Exams</option>
                {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title} - {exam.subject_name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchResults}>Apply Filters</Button>
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
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Exam</th>
                  <th className="px-6 py-4">Marks</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading results...</td></tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No results found.</p>
                    </td>
                  </tr>
                ) : results.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{result.student_name}</p>
                      <p className="text-xs text-slate-400">{result.student_roll}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{result.exam_title}</p>
                      <p className="text-xs text-slate-400">{result.subject_name} ({result.subject_code})</p>
                    </td>
                    <td className="px-6 py-4">{result.marks_obtained ?? '-'} / {result.total_marks ?? '-'}</td>
                    <td className="px-6 py-4 font-semibold">{result.grade || '-'}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant(result.status)}>{result.status}</Badge></td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="p-2" onClick={() => { setSelectedResult(result); setIsDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Result Details" size="lg" footer={<Button onClick={() => setIsDetailOpen(false)}>Close</Button>}>
        {selectedResult && (
          <div className="space-y-4 text-sm text-slate-600">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 p-4 text-center"><p className="text-2xl font-bold text-slate-800">{selectedResult.marks_obtained ?? '-'}</p><p className="text-xs text-slate-500">Marks</p></div>
              <div className="rounded-lg bg-primary-50 p-4 text-center"><p className="text-2xl font-bold text-primary-700">{selectedResult.grade || '-'}</p><p className="text-xs text-primary-700">Grade</p></div>
              <div className="rounded-lg bg-emerald-50 p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{selectedResult.percentage ?? 0}%</p><p className="text-xs text-emerald-700">Score</p></div>
            </div>
            <p><span className="font-semibold">Student:</span> {selectedResult.student_name} ({selectedResult.student_roll})</p>
            <p><span className="font-semibold">Exam:</span> {selectedResult.exam_title}</p>
            <p><span className="font-semibold">Entered by:</span> {selectedResult.entered_by_name || 'Admin'}</p>
            {selectedResult.remarks && <p className="whitespace-pre-wrap"><span className="font-semibold">Remarks:</span> {selectedResult.remarks}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
