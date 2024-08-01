// src/config/axiosConfig.js
import axios from 'axios';
import { baseUrl } from './BaseUrl';

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

api.defaults.headers.common['Content-Type'] = 'application/json';

// Response interceptor for handling token refresh
api.interceptors.response.use(response => {
  return response;
}, async error => {
  const originalRequest = error.config;
  if (error.response && error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const newToken = await refreshToken(); // Ensure refreshToken is available globally or pass it from context
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
});

export default api;
