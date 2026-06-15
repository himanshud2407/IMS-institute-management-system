'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '../../../../components/ui/Card';
import { attendanceService } from '../../../../services/attendance';
import { AttendanceSummary } from '../../../../types';
import { CalendarCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentAttendancePage() {
  const [summary, setSummary] = useState<AttendanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const data = await attendanceService.getSummary();
        setSummary(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load attendance summary');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (percentage >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Attendance</h1>
        <p className="text-sm text-slate-500">Overview of your attendance across all subjects.</p>
      </div>

      {isLoading ? (
        <Card>
          <CardBody className="py-12 text-center text-slate-400">Loading attendance data...</CardBody>
        </Card>
      ) : summary.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No attendance records found.</p>
            <p className="text-slate-400 text-sm mt-1">Your attendance will appear here once marked by your teachers.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summary.map((item) => (
            <Card key={item.subject_id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.subject_name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{item.total_sessions} Total Sessions</p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border font-bold text-lg flex items-center gap-1 ${getStatusColor(item.attendance_percentage)}`}>
                  {item.attendance_percentage < 75 && (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {item.attendance_percentage}%
                </div>
              </div>
              <div className="bg-slate-50/50 p-5 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold text-emerald-600">{item.present}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Present</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-rose-600">{item.absent}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Absent</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-amber-500">{item.late}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Late</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
