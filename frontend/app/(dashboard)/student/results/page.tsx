'use client';

import React, { useEffect, useState } from 'react';
import { Award, BookOpenCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../../../../components/ui/Badge';
import type { BadgeProps } from '../../../../components/ui/Badge';
import { Card, CardBody } from '../../../../components/ui/Card';
import { resultService } from '../../../../services/examinations';
import { ExamResult } from '../../../../types';

const statusVariant = (status: string): BadgeProps['variant'] => {
  if (status === 'PASS') return 'success';
  if (status === 'FAIL' || status === 'ABSENT') return 'danger';
  if (status === 'WITHHELD') return 'warning';
  return 'secondary';
};

export default function StudentResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const data = await resultService.getAll();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Results</h1>
        <p className="text-sm text-slate-500">Published exam scores and teacher remarks.</p>
      </div>

      {isLoading ? (
        <Card><CardBody className="py-12 text-center text-slate-400">Loading results...</CardBody></Card>
      ) : results.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No published results yet.</p>
            <p className="text-slate-400 text-sm mt-1">Your results will appear after teachers publish them.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {results.map((result) => (
            <Card key={result.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{result.exam_title}</h3>
                    <p className="text-sm text-slate-500">{result.subject_name} ({result.subject_code})</p>
                  </div>
                  <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xl font-bold text-slate-800">{result.marks_obtained ?? '-'}</p>
                    <p className="text-xs text-slate-500">Marks</p>
                  </div>
                  <div className="rounded-lg bg-primary-50 p-3">
                    <p className="text-xl font-bold text-primary-700">{result.grade || '-'}</p>
                    <p className="text-xs text-primary-700">Grade</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-xl font-bold text-emerald-600">{result.percentage ?? 0}%</p>
                    <p className="text-xs text-emerald-700">Score</p>
                  </div>
                </div>
                {result.remarks ? (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                    {result.remarks}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <BookOpenCheck className="w-3.5 h-3.5" /> No remarks added
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
