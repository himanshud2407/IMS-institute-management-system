import { api } from './api';
import { useAuthStore } from '../store/auth-store';
import {
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  AuthResponseData,
  User,
  ApiResponse,
} from '../types';

export const authService = {
  /**
   * Log in user
   */
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponseData>> => {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login/', data);
    if (response.data.success) {
      const { user, tokens } = response.data.data;
      useAuthStore.getState().setAuth(user, tokens);
    }
    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponseData>> => {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/register/', data);
    if (response.data.success) {
      const { user, tokens } = response.data.data;
      useAuthStore.getState().setAuth(user, tokens);
    }
    return response.data;
  },

  /**
   * Log out user
   */
  logout: async (): Promise<void> => {
    try {
      const tokens = useAuthStore.getState().tokens;
      if (tokens?.refresh) {
        await api.post('/auth/logout/', { refresh: tokens.refresh });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },

  /**
   * Fetch current user's profile
   */
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/me/');
    if (response.data.success) {
      useAuthStore.getState().setUser(response.data.data);
    }
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>('/auth/change-password/', data);
    return response.data;
  },
};
