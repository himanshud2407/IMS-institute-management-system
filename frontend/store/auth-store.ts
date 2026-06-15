import { create } from 'zustand';
import { User, AuthTokens } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading until initialized

  setAuth: (user, tokens) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
      
      // Set cookies for Next.js middleware access
      document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=${tokens.access}; path=/; max-age=604800`; // 7 days
      document.cookie = `ims_user_role=${user.role}; path=/; max-age=604800`;
    }
    set({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      document.cookie = `ims_user_role=${user.role}; path=/; max-age=604800`;
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      // Clear cookies for Next.js middleware
      document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `ims_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initialize: () => {
    if (typeof window === 'undefined') return;

    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (userStr && accessToken && refreshToken) {
        const user = JSON.parse(userStr) as User;
        const tokens = { access: accessToken, refresh: refreshToken };
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (e) {
      console.error('Failed to initialize auth store:', e);
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
