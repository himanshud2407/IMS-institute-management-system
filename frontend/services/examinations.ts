import { api } from './api';
import { Exam, ExamResult } from '@/types';

const unwrap = <T>(payload: unknown): T => {
  const responsePayload = payload as { data?: unknown };
  const data = responsePayload.data ?? payload;
  const paginated = data as { results?: unknown };
  return (paginated.results ?? data) as T;
};

export const examService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/exams/${query}`);
    return unwrap<Exam[]>(response.data);
  },

  getById: async (id: string) => {
    const response = await api.get(`/exams/${id}/`);
    return unwrap<Exam>(response.data);
  },

  create: async (data: Partial<Exam>) => {
    const response = await api.post('/exams/', data);
    return unwrap<Exam>(response.data);
  },

  update: async (id: string, data: Partial<Exam>) => {
    const response = await api.patch(`/exams/${id}/`, data);
    return unwrap<Exam>(response.data);
  },

  delete: async (id: string) => {
    await api.delete(`/exams/${id}/`);
  },

  getResults: async (examId: string) => {
    const response = await api.get(`/exams/${examId}/results/`);
    return unwrap<ExamResult[]>(response.data);
  },

  publishResults: async (examId: string) => {
    const response = await api.post(`/exams/${examId}/publish-results/`);
    return unwrap<Exam>(response.data);
  },
};

export const resultService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/results/${query}`);
    return unwrap<ExamResult[]>(response.data);
  },

  create: async (data: Partial<ExamResult>) => {
    const response = await api.post('/results/', data);
    return unwrap<ExamResult>(response.data);
  },

  update: async (id: string, data: Partial<ExamResult>) => {
    const response = await api.patch(`/results/${id}/`, data);
    return unwrap<ExamResult>(response.data);
  },
};
