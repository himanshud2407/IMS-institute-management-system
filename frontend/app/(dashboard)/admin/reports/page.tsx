'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, BookOpen, CreditCard, GraduationCap, Users } from 'lucide-react';
import toast from 'react-hot-toast';

import { Card, CardBody } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { reportService } from '../../../../services/reports';
import { AdminReport } from '../../../../types';

const money = (value?: string | number) =>
  `₹${Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdminReportsPage() {
  const [report, setReport] = useState<AdminReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setIsLoading(true);
        setReport(await reportService.getAdminReport());
      } catch {
        toast.error('Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };
    loadReport();
  }, []);

  const overview = report?.overview || {};
  const academics = report?.academics || {};
  const finance = report?.finance;

  const cards = [
    { label: 'Users', value: overview.users ?? 0, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Students', value: overview.students ?? 0, icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Teachers', value: overview.teachers ?? 0, icon: Users, color: 'bg-amber-50 text-amber-600' },
    { label: 'Courses', value: overview.courses ?? 0, icon: BookOpen, color: 'bg-primary-50 text-primary-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-500">System-wide academic, attendance, and finance summaries.</p>
      </div>

      {isLoading ? (
        <Card><CardBody className="py-12 text-center text-slate-400">Loading report data...</CardBody></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label}>
                  <CardBody className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{card.label}</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${card.color}`}><Icon className="w-5 h-5" /></div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                  <h2 className="font-bold text-slate-800">Academic Performance</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-4"><p className="text-2xl font-bold text-slate-800">{academics.attendance_rate ?? 0}%</p><p className="text-xs text-slate-500">Attendance Rate</p></div>
                  <div className="rounded-lg bg-slate-50 p-4"><p className="text-2xl font-bold text-slate-800">{academics.average_marks ?? 0}</p><p className="text-xs text-slate-500">Average Marks</p></div>
                  <div className="rounded-lg bg-slate-50 p-4"><p className="text-2xl font-bold text-slate-800">{academics.assignments ?? 0}</p><p className="text-xs text-slate-500">Assignments</p></div>
                  <div className="rounded-lg bg-slate-50 p-4"><p className="text-2xl font-bold text-slate-800">{academics.results ?? 0}</p><p className="text-xs text-slate-500">Results</p></div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-slate-800">Finance Summary</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg bg-slate-50 p-4"><p className="text-lg font-bold text-slate-800">{money(finance?.invoiced)}</p><p className="text-xs text-slate-500">Invoiced</p></div>
                  <div className="rounded-lg bg-emerald-50 p-4"><p className="text-lg font-bold text-emerald-700">{money(finance?.collected)}</p><p className="text-xs text-emerald-700">Collected</p></div>
                  <div className="rounded-lg bg-amber-50 p-4"><p className="text-lg font-bold text-amber-700">{money(finance?.balance)}</p><p className="text-xs text-amber-700">Balance</p></div>
                </div>
                <Badge variant={finance?.overdue_invoices ? 'danger' : 'success'}>
                  {finance?.overdue_invoices ?? 0} overdue invoices
                </Badge>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">Course Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Students</th>
                      <th className="px-6 py-4">Subjects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(report?.courses || []).map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-800">{course.name}</td>
                        <td className="px-6 py-4">{course.code}</td>
                        <td className="px-6 py-4">{course.students_count}</td>
                        <td className="px-6 py-4">{course.subjects_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
