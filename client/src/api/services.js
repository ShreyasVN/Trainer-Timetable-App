import apiClient from './axios';
import { clearToken } from '../utils/tokenManager';

// Auth services
export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  verify: () => apiClient.get('/auth/verify'),
  logout: () => {
    clearToken();
  },
};

// Session services
export const sessionService = {
  getAllSessions: () => apiClient.get('/sessions'),
  getSession: (id) => apiClient.get(`/sessions/${id}`),
  createSession: (sessionData) => apiClient.post('/sessions', sessionData),
  updateSession: (id, sessionData) => apiClient.put(`/sessions/${id}`, sessionData),
  deleteSession: (id) => apiClient.delete(`/sessions/${id}`),
  updateAttendance: (id) => apiClient.patch(`/sessions/${id}/attendance`),
  approveSession: (id, approvalData) => apiClient.put(`/sessions/${id}/approve`, approvalData),
};

// User services
export const userService = {
  getAllUsers: () => apiClient.get('/users'),
  getUser: (id) => apiClient.get(`/users/${id}`),
  createUser: (userData) => apiClient.post('/users', userData),
  updateUser: (id, userData) => apiClient.put(`/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
  getTrainers: () => apiClient.get('/users').then(res => ({
    ...res,
    data: res.data.filter(user => user.role === 'trainer')
  })),
  updateProfile: (id, profileData) => apiClient.put(`/users/${id}`, profileData),
};

// Notification services
export const notificationService = {
  getNotifications: () => apiClient.get('/notifications'),
  sendEmail: (emailData) => apiClient.post('/notifications/email', emailData),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
};

// Busy slots services
export const busySlotService = {
  getBusySlots: () => apiClient.get('/busy-slots'),
  getAllBusySlots: () => apiClient.get('/busy-slots'),
  createBusySlot: (slotData) => apiClient.post('/busy-slots', slotData),
  updateBusySlot: (id, slotData) => apiClient.put(`/busy-slots/${id}`, slotData),
  deleteBusySlot: (id) => apiClient.delete(`/busy-slots/${id}`),
};

// Generic API service for custom requests
export const apiService = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};

// Export the client for direct use if needed
export { apiClient };
