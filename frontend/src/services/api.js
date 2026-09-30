import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // ajustá el puerto si tu backend usa otro
});

// Interceptor: agrega el JWT a cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
