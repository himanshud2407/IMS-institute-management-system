'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Award, BookMarked, CalendarCheck, CreditCard, FileCheck } from 'lucide-react';

import { Badge } from '../../../../components/ui/Badge';
import { Card, CardBody, CardHeader } from '../../../../components/ui/Card';
import { useAuthStore } from '../../../../store/auth-store';
import { reportService } from '../../../../services/reports';
import { DashboardStats } from '../../../../types';

const money = (value?: string | number) =>
  `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setDashboard(await reportService.getDashboardStats());
      } catch {
        setDashboard(null);
      }
    };
    loadStats();
  }, []);

  const live = dashboard?.stats || {};
  const stats = [
    { label: 'Attendance Rate', value: `${live.attendance_rate ?? 0}%`, change: 'Target rate: >75%', icon: CalendarCheck, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Enrolled Subjects', value: live.subjects ?? 0, change: 'Active course subjects', icon: BookMarked, color: 'bg-primary-50 text-primary-600' },
    { label: 'Pending Assignments', value: live.pending_assignments ?? 0, change: 'Awaiting submission', icon: FileCheck, color: 'bg-amber-50 text-amber-600' },
    { label: 'Fee Outstanding', value: money(live.fee_balance), change: `${live.overdue_fees ?? 0} overdue invoices`, icon: CreditCard, color: 'bg-rose-50 text-rose-600' },
  ];

  const quickActions = [
    { label: 'View Attendance', href: '/student/attendance', icon: CalendarCheck },
    { label: 'Complete Assignments', href: '/student/assignments', icon: FileCheck },
    { label: 'Check Results', href: '/student/results', icon: Award },
    { label: 'Verify Fee Receipts', href: '/student/fees', icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-2xl border border-slate-800 shadow-lg text-white">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome back, {user?.full_name || 'Student'}</h1>
          <p className="text-slate-300 text-sm max-w-xl">Track your attendance, coursework, results, and fee balance.</p>
        </div>
        <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1">Student Profile</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hoverable>
              <CardBody className="flex items-center justify-between p-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                  <span className="text-2xl font-black text-slate-800 block">{stat.value}</span>
                  <span className="text-xs font-medium text-slate-500 block">{stat.change}</span>
                </div>
                <div className={`p-4 rounded-xl shrink-0 ${stat.color}`}><Icon className="w-6 h-6" /></div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <Card>
            <CardHeader><h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Student Shortcuts</h3></CardHeader>
            <CardBody className="grid grid-cols-1 gap-3.5">
              {quickActions.map((act) => {
                const Icon = act.icon;
                return (
                  <Link key={act.href} href={act.href} className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-primary-50/50 hover:text-primary-700 text-slate-700 font-medium text-sm rounded-lg border border-slate-100 hover:border-primary-100 transition-all duration-200 cursor-pointer group">
                    <span className="flex items-center gap-3"><Icon className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />{act.label}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary-500 transition-all duration-200" />
                  </Link>
                );
              })}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card>
            <CardHeader><h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">My Activity Summary</h3></CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {(dashboard?.recent_activity || []).map((item) => (
                  <div key={item.label} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.label}</h4>
                      <p className="text-xs text-slate-500">Live student report</p>
                    </div>
                    <Badge variant="secondary">{item.count} records</Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
