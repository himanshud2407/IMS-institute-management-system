'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { useAuthStore } from '../../../../store/auth-store';
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Plus,
  ArrowUpRight,
  Bell,
  CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';
import { reportService } from '../../../../services/reports';
import { DashboardStats } from '../../../../types';

const money = (value?: string | number) =>
  `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function AdminDashboard() {
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
    { label: 'Total Students', value: live.students ?? 0, change: `${live.subjects ?? 0} active subjects`, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Active Teachers', value: live.teachers ?? 0, change: `${live.courses ?? 0} offered courses`, icon: GraduationCap, color: 'bg-amber-50 text-amber-600' },
    { label: 'Assignments', value: live.assignments ?? 0, change: `${live.exams ?? 0} exams scheduled`, icon: BookOpen, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Fees Collected', value: money(live.fee_collected), change: `${money(live.fee_balance)} balance`, icon: DollarSign, color: 'bg-rose-50 text-rose-600' },
  ];

  const quickActions = [
    { label: 'Add New Student', href: '/admin/students', icon: Plus },
    { label: 'Register Teacher', href: '/admin/teachers', icon: Plus },
    { label: 'Create New Course', href: '/admin/courses', icon: Plus },
    { label: 'Broadcast Alert', href: '/admin/notifications', icon: Bell },
  ];

  const recentActivities = dashboard?.recent_activity || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-2xl border border-slate-800 shadow-lg text-white">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name || 'Admin'}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            You have full system privileges. Monitor registrations, manage fee payments, configure timetables, and audit logs.
          </p>
        </div>
        <div>
          <Badge variant="primary" className="bg-primary-500/20 text-primary-300 border-primary-500/30 px-3 py-1">
            System Admin
          </Badge>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} hoverable className="h-full">
              <CardBody className="flex items-center justify-between p-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    {stat.label}
                  </span>
                  <span className="text-2xl font-black text-slate-800 block">
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium text-slate-500 block">
                    {stat.change}
                  </span>
                </div>
                <div className={`p-4 rounded-xl shrink-0 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Quick Shortcuts
              </h3>
            </CardHeader>
            <CardBody className="grid grid-cols-1 gap-3.5">
              {quickActions.map((act, i) => {
                const Icon = act.icon;
                return (
                  <Link
                    key={i}
                    href={act.href}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-primary-50/50 hover:text-primary-700 text-slate-700 font-medium text-sm rounded-lg border border-slate-100 hover:border-primary-100 transition-all duration-200 cursor-pointer group"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />
                      {act.label}
                    </span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary-500 transition-all duration-200" />
                  </Link>
                );
              })}
            </CardBody>
          </Card>
        </div>

        {/* System Activity Logs */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                System Activity Log
              </h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {recentActivities.map((act, i) => (
                  <div key={i} className="p-4 flex items-start gap-4 hover:bg-slate-50/40 transition-colors">
                    <div className="mt-1 bg-slate-100 p-2 rounded-lg text-slate-500">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        {act.label}
                      </p>
                      <span className="text-[11px] text-slate-400 block mt-1 font-semibold">
                        {act.count} records
                      </span>
                    </div>
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
