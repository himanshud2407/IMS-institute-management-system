'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { attendanceService } from '../../../../services/attendance';
import { subjectService } from '../../../../services/academic';
import { AttendanceSession, Subject } from '../../../../types';
import {
  CalendarCheck, Plus, Eye, Trash2, Users, CheckCircle, XCircle, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (filterSubject) params.subject = filterSubject;
      if (filterDate) params.date = filterDate;
      const data = await attendanceService.getSessions(params);
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load attendance sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async () => {
    const data = await subjectService.getAll();
    setSubjects(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSubjects();
  }, []);

  const openDetail = async (session: AttendanceSession) => {
    try {
      const full = await attendanceService.getSession(session.id);
      setSelectedSession(full);
      setIsDetailOpen(true);
    } catch {
      toast.error('Failed to load session details');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this attendance session and all its records?')) return;
    try {
      await attendanceService.deleteSession(id);
      toast.success('Session deleted');
      fetchSessions();
    } catch {
      toast.error('Failed to delete session');
    }
  };

  const statusColor = (pct: number) => {
    if (pct >= 75) return 'success';
    if (pct >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance Overview</h1>
          <p className="text-sm text-slate-500">View and manage all attendance sessions across subjects.</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filter by Subject</label>
              <select
                className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filter by Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchSessions}>Apply Filters</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Attendance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading sessions...</td></tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No attendance sessions found.</p>
                      <p className="text-slate-400 text-xs mt-1">Teachers create sessions when marking attendance.</p>
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => {
                    const pct = session.total_students
                      ? Math.round(((session.present_count ?? 0) / session.total_students) * 100)
                      : 0;
                    return (
                      <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <CalendarCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{session.subject_name}</p>
                              <p className="text-xs text-slate-400">{session.subject_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{session.date}</td>
                        <td className="px-6 py-4 text-slate-500 max-w-[180px] truncate">{session.topic || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-slate-600">{session.present_count ?? 0}</span>
                              <XCircle className="w-3.5 h-3.5 text-rose-400 ml-1" />
                              <span className="text-slate-600">{session.absent_count ?? 0}</span>
                              <Users className="w-3.5 h-3.5 text-slate-400 ml-1" />
                              <span className="text-slate-600">{session.total_students ?? 0}</span>
                            </div>
                            <Badge variant={statusColor(pct) as 'success' | 'warning' | 'danger'}>{pct}%</Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-primary-600 p-2" onClick={() => openDetail(session)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-600 p-2" onClick={() => handleDelete(session.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Session Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Session: ${selectedSession?.subject_name} — ${selectedSession?.date}`}
        size="lg"
        footer={<Button onClick={() => setIsDetailOpen(false)}>Close</Button>}
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{selectedSession.present_count ?? 0}</p>
                <p className="text-xs text-emerald-700 font-medium mt-1">Present</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-rose-600">{selectedSession.absent_count ?? 0}</p>
                <p className="text-xs text-rose-700 font-medium mt-1">Absent</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-slate-600">{selectedSession.total_students ?? 0}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Total</p>
              </div>
            </div>
            {selectedSession.topic && (
              <p className="text-sm text-slate-600"><span className="font-semibold">Topic:</span> {selectedSession.topic}</p>
            )}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Roll No.</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedSession.records || []).map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 font-medium">{rec.student_name}</td>
                      <td className="px-4 py-3 text-slate-500">{rec.student_roll}</td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          rec.status === 'PRESENT' ? 'success'
                          : rec.status === 'LATE' ? 'warning'
                          : rec.status === 'EXCUSED' ? 'secondary'
                          : 'danger'
                        }>
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{rec.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
