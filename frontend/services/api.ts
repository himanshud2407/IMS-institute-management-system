import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL, STORAGE_KEYS } from '../utils/constants';
import { ApiResponse } from '../types';

import { useAuthStore } from '../store/auth-store';

// Create Axios Instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Authorization token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors, particularly token refresh on 401
api.interceptors.response.use(
  (response) => {
    // Return the response directly
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check if error is 401 and it's not a refresh token attempt or login attempt
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/token/refresh');
    
    // Explicit typescript cast to let us add custom properties safely
    const customConfig = originalRequest as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !isAuthEndpoint && !customConfig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (customConfig.headers) {
              customConfig.headers.Authorization = `Bearer ${token}`;
            }
            return api(customConfig);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      customConfig._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the refresh endpoint (using a raw axios call to avoid interceptors loops)
        const response = await axios.post<ApiResponse<{ access: string; refresh?: string }>>(
          `${API_URL}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        if (response.data && response.data.success && response.data.data.access) {
          const newAccessToken = response.data.data.access;
          const newRefreshToken = response.data.data.refresh || refreshToken;
          
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=${newAccessToken}; path=/; max-age=604800`;
          
          useAuthStore.setState((state) => ({
            ...state,
            tokens: { access: newAccessToken, refresh: newRefreshToken }
          }));

          if (customConfig.headers) {
            customConfig.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          
          processQueue(null, newAccessToken);
          return api(customConfig);
        } else {
          throw new Error('Failed to refresh token');
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        
        // Log out user - clean up state, localStorage, cookies and redirect
        if (typeof window !== 'undefined') {
          useAuthStore.getState().logout();
          
          // Redirect to login screen
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
