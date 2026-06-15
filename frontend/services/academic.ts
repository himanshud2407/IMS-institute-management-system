import { api } from './api';
import { Course, Subject, ApiResponse, PaginatedResponse } from '@/types';

export const courseService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<PaginatedResponse<Course>>>('/courses/');
    return response.data.data.results;
  },
  
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}/`);
    return response.data.data;
  },
  
  create: async (data: Partial<Course>) => {
    const response = await api.post<ApiResponse<Course>>('/courses/', data);
    return response.data.data;
  },
  
  update: async (id: string, data: Partial<Course>) => {
    const response = await api.patch<ApiResponse<Course>>(`/courses/${id}/`, data);
    return response.data.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/courses/${id}/`);
  }
};

export const subjectService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<PaginatedResponse<Subject>>>('/subjects/');
    return response.data.data.results;
  },
  
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Subject>>(`/subjects/${id}/`);
    return response.data.data;
  },
  
  create: async (data: Partial<Subject>) => {
    const response = await api.post<ApiResponse<Subject>>('/subjects/', data);
    return response.data.data;
  },
  
  update: async (id: string, data: Partial<Subject>) => {
    const response = await api.patch<ApiResponse<Subject>>(`/subjects/${id}/`, data);
    return response.data.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/subjects/${id}/`);
  }
};
