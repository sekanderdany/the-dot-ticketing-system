import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPPORT_L1' | 'SUPPORT_L2' | 'SUPPORT_L3' | 'DEVELOPER' | 'PROJECT_MANAGER' | 'CLIENT';
  isActive: boolean;
  isVerified: boolean;
}

export interface Permission {
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
  loadUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

interface RegisterData {
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { access_token, user } = response.data;

          // Set token in API client
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          // Get user permissions
          const permissionsResponse = await api.get('/auth/permissions');
          const { permissions } = permissionsResponse.data;

          set({
            user,
            token: access_token,
            permissions,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('Welcome back!');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Login failed');
          throw error;
        }
      },

      logout: () => {
        // Clear token from API client
        delete api.defaults.headers.common['Authorization'];

        set({
          user: null,
          token: null,
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
        });

        toast.success('Logged out successfully');
      },

      register: async (data: RegisterData) => {
        try {
          await api.post('/auth/register', data);
          toast.success('Registration successful! Please log in.');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Registration failed');
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const token = get().token;
          if (!token) return;

          const response = await api.post('/auth/refresh', { refreshToken: token });
          const { access_token, user } = response.data;

          // Update token in API client
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          set({
            user,
            token: access_token,
            isAuthenticated: true,
          });
        } catch (error) {
          // If refresh fails, logout
          get().logout();
        }
      },

      loadUser: async () => {
        try {
          const token = get().token;
          if (!token) {
            set({ isLoading: false });
            return;
          }

          // Set token in API client
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Get user profile
          const profileResponse = await api.get('/auth/profile');
          const user = profileResponse.data;

          // Get user permissions
          const permissionsResponse = await api.get('/auth/permissions');
          const { permissions } = permissionsResponse.data;

          set({
            user,
            permissions,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // If profile fetch fails, logout
          get().logout();
        }
      },

      hasPermission: (permission: string) => {
        const { permissions } = get();
        return permissions.some(p => p.name === permission);
      },

      hasRole: (role: string) => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

// Initialize auth on app start
useAuthStore.getState().loadUser();
