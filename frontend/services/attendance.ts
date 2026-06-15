import { api } from './api';
import { AttendanceSession, AttendanceRecord, AttendanceSummary, BiometricProfile } from '@/types';

type AttendanceRecordInput = Pick<AttendanceRecord, 'student' | 'status' | 'remarks'>;
type AttendanceSessionInput = Omit<Partial<AttendanceSession>, 'records'> & {
  records?: AttendanceRecordInput[];
};

type BiometricEnrollmentInput = {
  student: string;
  image: string;
  consent_confirmed: boolean;
};

type BiometricCheckInInput = {
  session: string;
  student: string;
  image: string;
};

export const attendanceService = {
  // Sessions
  getSessions: async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await api.get(`/attendance/sessions/${query}`);
    const data = res.data?.data ?? res.data;
    return data?.results ?? data;
  },

  getSession: async (id: string) => {
    const res = await api.get(`/attendance/sessions/${id}/`);
    return res.data?.data ?? res.data;
  },

  createSession: async (data: AttendanceSessionInput) => {
    const res = await api.post('/attendance/sessions/', data);
    return res.data?.data ?? res.data;
  },

  updateSession: async (id: string, data: Partial<AttendanceSession>) => {
    const res = await api.patch(`/attendance/sessions/${id}/`, data);
    return res.data?.data ?? res.data;
  },

  deleteSession: async (id: string) => {
    const res = await api.delete(`/attendance/sessions/${id}/`);
    return res.data;
  },

  // Records
  getRecords: async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await api.get(`/attendance/records/${query}`);
    return res.data?.data ?? res.data;
  },

  updateRecord: async (id: string, data: Partial<AttendanceRecord>) => {
    const res = await api.patch(`/attendance/records/${id}/`, data);
    return res.data?.data ?? res.data;
  },

  // Student summary
  getSummary: async (): Promise<AttendanceSummary[]> => {
    const res = await api.get('/attendance/sessions/summary/');
    return res.data?.data ?? res.data;
  },

  enrollFace: async (data: BiometricEnrollmentInput): Promise<BiometricProfile> => {
    const res = await api.post('/attendance/sessions/biometrics/enroll/', data);
    return res.data?.data ?? res.data;
  },

  biometricCheckIn: async (
    data: BiometricCheckInInput
  ): Promise<{ record: AttendanceRecord; confidence: number }> => {
    const res = await api.post('/attendance/sessions/biometrics/check-in/', data);
    return res.data?.data ?? res.data;
  },
};
