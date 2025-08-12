import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage
    const authStore = localStorage.getItem('auth-storage');
    if (authStore) {
      try {
        const parsed = JSON.parse(authStore);
        const token = parsed.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to parse auth token from localStorage');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      // This will be handled by the auth store
    } else if (error.response?.status === 403) {
      toast.error('Access denied');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  profile: () =>
    api.get('/auth/profile'),
  
  permissions: () =>
    api.get('/auth/permissions'),
  
  changePassword: (data: any) =>
    api.post('/auth/change-password', data),
};

export const usersApi = {
  getUsers: (params?: any) =>
    api.get('/users', { params }),
  
  getUserById: (id: string) =>
    api.get(`/users/${id}`),
  
  createUser: (data: any) =>
    api.post('/users', data),
  
  updateUser: (id: string, data: any) =>
    api.put(`/users/${id}`, data),
  
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
  
  activateUser: (id: string) =>
    api.put(`/users/${id}/activate`),
  
  deactivateUser: (id: string) =>
    api.put(`/users/${id}/deactivate`),
};

export const ticketsApi = {
  getTickets: (params?: any) =>
    api.get('/tickets', { params }),
  
  getTicketById: (id: string) =>
    api.get(`/tickets/${id}`),
  
  createTicket: (data: any) =>
    api.post('/tickets', data),
  
  updateTicket: (id: string, data: any) =>
    api.put(`/tickets/${id}`, data),
  
  deleteTicket: (id: string) =>
    api.delete(`/tickets/${id}`),
  
  getMyTickets: (params?: any) =>
    api.get('/tickets/my', { params }),
  
  getTicketStats: (userId?: string) =>
    api.get('/tickets/stats', { params: userId ? { userId } : {} }),
  
  assignTicket: (id: string, data: any) =>
    api.put(`/tickets/${id}/assign`, data),
  
  updateStatus: (id: string, status: string) =>
    api.put(`/tickets/${id}/status`, { status }),
  
  canEdit: (id: string) =>
    api.get(`/tickets/${id}/can-edit`),
  
  closeTicket: (id: string, data: any) =>
    api.put(`/tickets/${id}/close`, data),
};

export const projectsApi = {
  getProjects: (params?: any) =>
    api.get('/projects', { params }),
  
  getProjectById: (id: string) =>
    api.get(`/projects/${id}`),
  
  createProject: (data: any) =>
    api.post('/projects', data),
  
  updateProject: (id: string, data: any) =>
    api.put(`/projects/${id}`, data),
  
  deleteProject: (id: string) =>
    api.delete(`/projects/${id}`),
  
  getProjectIssues: (id: string, params?: any) =>
    api.get(`/projects/${id}/issues`, { params }),
  
  createProjectIssue: (id: string, data: any) =>
    api.post(`/projects/${id}/issues`, data),
};

export const applicationsApi = {
  getApplications: (params?: any) =>
    api.get('/applications', { params }),
  
  getApplicationById: (id: string) =>
    api.get(`/applications/${id}`),
  
  createApplication: (data: any) =>
    api.post('/applications', data),
  
  updateApplication: (id: string, data: any) =>
    api.put(`/applications/${id}`, data),
  
  deleteApplication: (id: string) =>
    api.delete(`/applications/${id}`),
};

export const reportsApi = {
  generateReport: (type: string, params?: any) =>
    api.post(`/reports/generate/${type}`, params),
  
  getReports: (params?: any) =>
    api.get('/reports', { params }),
  
  downloadReport: (id: string) =>
    api.get(`/reports/${id}/download`, { responseType: 'blob' }),
};

export const commentsApi = {
  getComments: (resourceType: string, resourceId: string) =>
    api.get(`/comments/${resourceType}/${resourceId}`),
  
  createComment: (data: any) =>
    api.post('/comments', data),
  
  updateComment: (id: string, data: any) =>
    api.put(`/comments/${id}`, data),
  
  deleteComment: (id: string) =>
    api.delete(`/comments/${id}`),
};

export default api;
