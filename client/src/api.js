// client/src/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// Session Service
export const sessionService = {
  getAllSessions: () => api.get('/sessions'),
  getSession: (id) => api.get(`/sessions/${id}`),
  createSession: (sessionData) => api.post('/sessions', sessionData),
  updateSession: (id, sessionData) => api.put(`/sessions/${id}`, sessionData),
  deleteSession: (id) => api.delete(`/sessions/${id}`),
  updateAttendance: (id) => api.patch(`/sessions/${id}/attendance`),
  approveSession: (id, approvalData) => api.put(`/sessions/${id}/approve`, approvalData),
};

// User Service
export const userService = {
  getAllUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getTrainers: () => api.get('/users').then(res => ({
    ...res,
    data: res.data.filter(user => user.role === 'trainer')
  })),
  updateProfile: (id, profileData) => api.put(`/users/${id}`, profileData),
};

// Notification Service
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  sendEmail: (emailData) => api.post('/notifications/email', emailData),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

// Busy Slots Service
export const busySlotService = {
  getAllBusySlots: () => api.get('/busy-slots'),
  createBusySlot: (slotData) => api.post('/busy-slots', slotData),
  updateBusySlot: (id, slotData) => api.put(`/busy-slots/${id}`, slotData),
  deleteBusySlot: (id) => api.delete(`/busy-slots/${id}`),
};

// Auth Service
export const authService = {
  login: (credentials) => axios.post('http://localhost:5000/api/auth/login', credentials),
  register: (userData) => axios.post('http://localhost:5000/api/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth:logout'));
  },
};

export default api;
