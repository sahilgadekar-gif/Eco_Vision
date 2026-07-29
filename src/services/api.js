// ─── Axios API Client ──────────────────────────────────────────────────────────
// Central HTTP client. Automatically attaches the JWT token to every request.

import axios from 'axios';

// Base URL — uses Vite proxy in dev, direct URL in production
const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: inject JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecovision_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect
      localStorage.removeItem('ecovision_token');
      localStorage.removeItem('ecovision_current_user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth endpoints ────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login', data),
  getMe:    ()      => api.get('/auth/me'),
  logout:   ()      => api.post('/auth/logout'),
};

// ── User endpoints ────────────────────────────────────────────────────────────
export const userAPI = {
  updateProfile:  (data) => api.put('/users/profile',  data),
  changePassword: (data) => api.put('/users/password', data),
  deleteAccount:  ()     => api.delete('/users'),
};

// ── Calculation endpoints ─────────────────────────────────────────────────────
export const calculationAPI = {
  getAll:     ()     => api.get('/calculations'),
  save:       (data) => api.post('/calculations', data),
  deleteOne:  (id)   => api.delete(`/calculations/${id}`),
  clearAll:   ()     => api.delete('/calculations'),
};

// ── Tree Plantation endpoints ─────────────────────────────────────────────────
export const treeAPI = {
  getAll:     ()           => api.get('/trees'),
  create:     (formData)   => api.post('/trees', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:     (id, data)   => api.put(`/trees/${id}`, data),
  deleteOne:  (id)         => api.delete(`/trees/${id}`),
};

// ── Settings endpoints ────────────────────────────────────────────────────────
export const settingsAPI = {
  get:    ()       => api.get('/settings'),
  update: (data)   => api.put('/settings', data),
};

// ── Health check ──────────────────────────────────────────────────────────────
export const healthCheck = () => api.get('/health');

export default api;
