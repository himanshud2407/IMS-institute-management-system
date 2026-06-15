import { api } from './api';
import { Teacher, Student, ApiResponse, PaginatedResponse } from '@/types';
import { StudentFormData, TeacherFormData } from '@/schemas/users';

export const teacherService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<PaginatedResponse<Teacher>>>('/teachers/');
    return response.data.data.results;
  },
  
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Teacher>>(`/teachers/${id}/`);
    return response.data.data;
  },
  
  create: async (data: TeacherFormData) => {
    const response = await api.post<ApiResponse<Teacher>>('/teachers/', data);
    return response.data.data;
  },
  
  update: async (id: string, data: Partial<TeacherFormData>) => {
    const response = await api.patch<ApiResponse<Teacher>>(`/teachers/${id}/`, data);
    return response.data.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/teachers/${id}/`);
  }
};

export const studentService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get<ApiResponse<PaginatedResponse<Student>>>(`/students/${query}`);
    return response.data.data.results;
  },
  
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Student>>(`/students/${id}/`);
    return response.data.data;
  },
  
  create: async (data: StudentFormData) => {
    const response = await api.post<ApiResponse<Student>>('/students/', data);
    return response.data.data;
  },
  
  update: async (id: string, data: Partial<StudentFormData>) => {
    const response = await api.patch<ApiResponse<Student>>(`/students/${id}/`, data);
    return response.data.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/students/${id}/`);
  }
};
