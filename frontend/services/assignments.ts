import { api } from './api';
import { Assignment, AssignmentSubmission } from '@/types';

const unwrap = <T>(payload: unknown): T => {
  const responsePayload = payload as { data?: unknown };
  const data = responsePayload.data ?? payload;
  const paginated = data as { results?: unknown };
  return (paginated.results ?? data) as T;
};

export const assignmentService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/assignments/${query}`);
    return unwrap<Assignment[]>(response.data);
  },

  getById: async (id: string) => {
    const response = await api.get(`/assignments/${id}/`);
    return unwrap<Assignment>(response.data);
  },

  create: async (data: Partial<Assignment>) => {
    const response = await api.post('/assignments/', data);
    return unwrap<Assignment>(response.data);
  },

  update: async (id: string, data: Partial<Assignment>) => {
    const response = await api.patch(`/assignments/${id}/`, data);
    return unwrap<Assignment>(response.data);
  },

  delete: async (id: string) => {
    await api.delete(`/assignments/${id}/`);
  },

  getSubmissions: async (assignmentId: string) => {
    const response = await api.get(`/assignments/${assignmentId}/submissions/`);
    return unwrap<AssignmentSubmission[]>(response.data);
  },

  submit: async (data: { assignment: string; content: string; attachment_url?: string }) => {
    const response = await api.post('/assignment-submissions/', data);
    return unwrap<AssignmentSubmission>(response.data);
  },

  gradeSubmission: async (
    submissionId: string,
    data: { marks_obtained: number; feedback?: string; status?: 'GRADED' | 'RETURNED' }
  ) => {
    const response = await api.patch(`/assignment-submissions/${submissionId}/grade/`, data);
    return unwrap<AssignmentSubmission>(response.data);
  },
};
