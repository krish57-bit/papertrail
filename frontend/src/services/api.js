import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pt_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        localStorage.removeItem('pt_token');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
