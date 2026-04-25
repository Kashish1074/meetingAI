import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const meetingsAPI = {
  analyze: (transcript) => api.post('/meetings/analyze', { transcript }),
  create: (data) => api.post('/meetings', data),
  getAll: (page = 1) => api.get(`/meetings?page=${page}`),
  getOne: (id) => api.get(`/meetings/${id}`),
  delete: (id) => api.delete(`/meetings/${id}`),
  toggleAction: (id, itemId) => api.patch(`/meetings/${id}/action/${itemId}`),
  toggleUnresolved: (id, itemId) => api.patch(`/meetings/${id}/unresolved/${itemId}`),
  getStats: () => api.get('/meetings/stats/summary')
};

export default api;
