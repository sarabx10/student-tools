import axios from 'axios';

// Single axios instance for the whole app.
const api = axios.create({ baseURL: '/api' });

// Attach the JWT (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
