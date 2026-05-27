import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production' || import.meta.env?.MODE === 'production';

const API = axios.create({
  baseURL: isProduction 
    ? 'https://pic2speak-backend.onrender.com/api/v1' 
    : 'http://localhost:8081/api/v1'
});

API.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default API;