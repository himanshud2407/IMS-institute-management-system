'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { attendanceService } from '../../../../services/attendance';
import { subjectService } from '../../../../services/academic';
import { studentService } from '../../../../services/users';
import { AttendanceSession, Subject, Student } from '../../../../types';
import { CalendarCheck, Plus, CheckCircle, XCircle, Eye, Camera, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

type RecordDraft = { student: string; student_name: string; student_roll: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks: string };
type BiometricMode = 'enroll' | 'check-in';
type BiometricTarget = {
  student: string;
  student_name?: string;
  student_roll?: string;
};

export default function TeacherAttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create-session form state
  const [form, setForm] = useState({ subject: '', date: new Date().toISOString().split('T')[0], topic: '', notes: '' });
  const [records, setRecords] = useState<RecordDraft[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);
  const [biometricMode, setBiometricMode] = useState<BiometricMode>('enroll');
  const [biometricTarget, setBiometricTarget] = useState<BiometricTarget | null>(null);
  const [capturedImage, setCapturedImage] = useState('');
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isBiometricSubmitting, setIsBiometricSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await attendanceService.getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      await fetchSessions();
      const subjData = await subjectService.getAll();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubjects(Array.isArray(subjData) ? subjData : []);
    };
    load();
  }, []);

  useEffect(() => {
    if (!isBiometricOpen) return;
    startCamera();
    return () => stopCamera();
  }, [isBiometricOpen]);

  const handleSubjectChange = async (subjectId: string) => {
    setForm((f) => ({ ...f, subject: subjectId }));
    if (!subjectId) { setRecords([]); return; }
    setLoadingStudents(true);
    try {
      const subj = subjects.find((s) => s.id === subjectId);
      const data = await studentService.getAll(subj?.course ? { course: subj.course } : undefined);
      setRecords(
        (Array.isArray(data) ? data : []).map((s: Student) => ({
          student: s.id,
          student_name: s.user?.full_name || '',
          student_roll: s.roll_number,
          status: 'PRESENT' as const,
          remarks: '',
        }))
      );
    } catch {
      toast.error('Failed to load students for this subject');
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleAll = (status: 'PRESENT' | 'ABSENT') => {
    setRecords((r) => r.map((rec) => ({ ...rec, status })));
  };

  const handleSubmit = async () => {
    if (!form.subject || !form.date) { toast.error('Subject and date are required'); return; }
    setIsSubmitting(true);
    try {
      await attendanceService.createSession({
        ...form,
        records: records.map(({ student, status, remarks }) => ({ student, status, remarks })),
      });
      toast.success('Attendance session saved!');
      setIsCreateOpen(false);
      setForm({ subject: '', date: new Date().toISOString().split('T')[0], topic: '', notes: '' });
      setRecords([]);
      fetchSessions();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Failed to save session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetail = async (session: AttendanceSession) => {
    try {
      const full = await attendanceService.getSession(session.id);
      setSelectedSession(full);
      setIsDetailOpen(true);
    } catch {
      toast.error('Failed to load session');
    }
  };

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Camera access is not available in this browser.');
      return;
    }
    setIsCameraStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      toast.error('Camera permission denied or unavailable.');
    } finally {
      setIsCameraStarting(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  const openBiometric = (mode: BiometricMode, target: BiometricTarget) => {
    setBiometricMode(mode);
    setBiometricTarget(target);
    setCapturedImage('');
    setIsBiometricOpen(true);
  };

  const closeBiometric = () => {
    stopCamera();
    setIsBiometricOpen(false);
    setCapturedImage('');
    setBiometricTarget(null);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = 480;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.82));
  };

  const submitBiometric = async () => {
    if (!biometricTarget || !capturedImage) {
      toast.error('Capture a face image first.');
      return;
    }
    setIsBiometricSubmitting(true);
    try {
      if (biometricMode === 'enroll') {
        await attendanceService.enrollFace({
          student: biometricTarget.student,
          image: capturedImage,
          consent_confirmed: true,
        });
        toast.success(`Biometric enrolled for ${biometricTarget.student_name || 'student'}`);
      } else {
        if (!selectedSession) {
          toast.error('Open an attendance session before biometric check-in.');
          return;
        }
        await attendanceService.biometricCheckIn({
          session: selectedSession.id,
          student: biometricTarget.student,
          image: capturedImage,
        });
        toast.success(`Biometric attendance marked for ${biometricTarget.student_name || 'student'}`);
        setSelectedSession(await attendanceService.getSession(selectedSession.id));
        fetchSessions();
      }
      closeBiometric();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; detail?: string } } };
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Biometric verification failed');
    } finally {
      setIsBiometricSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance Management</h1>
          <p className="text-sm text-slate-500">Create sessions and mark student attendance.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Take Attendance
        </Button>
      </div>

      {/* Sessions list */}
      <Card>
        <CardBody className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No sessions yet.</p>
                      <p className="text-slate-400 text-xs mt-1">Click &quot;Take Attendance&quot; to create your first session.</p>
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{s.subject_name}</p>
                        <p className="text-xs text-slate-400">{s.subject_code}</p>
                      </td>
                      <td className="px-6 py-4 font-medium">{s.date}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-[160px] truncate">{s.topic || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{s.present_count ?? 0}</span>
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>{s.absent_count ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-primary-600" onClick={() => openDetail(s)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Create Session Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Take Attendance"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={records.length === 0}>
              Save Attendance ({records.length} students)
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subject *</label>
              <select
                className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-sm shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none"
                value={form.subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
              >
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <Input
              label="Date *"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
            <Input
              label="Topic Covered"
              placeholder="e.g. Newton's Laws of Motion"
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
            />
            <Input
              label="Notes"
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {/* Student records */}
          {loadingStudents && <p className="text-sm text-slate-500 text-center py-4">Loading students...</p>}
          {records.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">{records.length} Students</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleAll('PRESENT')}>All Present</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleAll('ABSENT')}>All Absent</Button>
                </div>
              </div>
              <div className="border rounded-lg divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {records.map((rec, i) => (
                  <div key={rec.student} className="flex items-center gap-4 px-4 py-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{rec.student_name}</p>
                      <p className="text-xs text-slate-400">Roll: {rec.student_roll}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setRecords((r) => r.map((x, j) => j === i ? { ...x, status: st } : x))}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
                            rec.status === st
                              ? st === 'PRESENT' ? 'bg-emerald-500 text-white border-emerald-500'
                                : st === 'ABSENT' ? 'bg-rose-500 text-white border-rose-500'
                                : st === 'LATE' ? 'bg-amber-400 text-white border-amber-400'
                                : 'bg-slate-400 text-white border-slate-400'
                              : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {st === 'PRESENT' ? '✓' : st === 'ABSENT' ? '✗' : st === 'LATE' ? 'L' : 'E'}
                        </button>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openBiometric('enroll', rec)}
                      leftIcon={<Camera className="w-3.5 h-3.5" />}
                    >
                      Enroll
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!form.subject && <p className="text-sm text-slate-400 text-center py-2">Select a subject to load students.</p>}
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`${selectedSession?.subject_name} — ${selectedSession?.date}`}
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
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Roll</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Biometric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedSession.records || []).map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 font-medium">{rec.student_name}</td>
                      <td className="px-4 py-3 text-slate-400">{rec.student_roll}</td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          rec.status === 'PRESENT' ? 'success'
                          : rec.status === 'LATE' ? 'warning'
                          : rec.status === 'EXCUSED' ? 'secondary'
                          : 'danger'
                        }>
                          {rec.status}
                        </Badge>
                        {rec.source === 'BIOMETRIC' && (
                          <Badge variant="info" size="sm" className="ml-2">
                            Face {rec.confidence}%
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openBiometric('check-in', rec)}
                          leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                        >
                          Verify
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isBiometricOpen}
        onClose={closeBiometric}
        title={
          biometricMode === 'enroll'
            ? `Enroll Face: ${biometricTarget?.student_name || ''}`
            : `Verify Face: ${biometricTarget?.student_name || ''}`
        }
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeBiometric} disabled={isBiometricSubmitting}>Cancel</Button>
            <Button variant="outline" onClick={capturePhoto} disabled={isCameraStarting}>
              Capture
            </Button>
            <Button onClick={submitBiometric} isLoading={isBiometricSubmitting} disabled={!capturedImage}>
              {biometricMode === 'enroll' ? 'Save Enrollment' : 'Mark Present'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Center the student face in the camera frame, capture once, then submit.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {isCameraStarting && <span className="absolute text-xs text-white">Starting camera...</span>}
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
              {capturedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm text-slate-400">No capture yet</span>
              )}
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <p className="text-xs text-slate-400">
            Consent is required before enrollment. The server stores a derived biometric template, not the raw camera image.
          </p>
        </div>
      </Modal>
    </div>
  );
}
