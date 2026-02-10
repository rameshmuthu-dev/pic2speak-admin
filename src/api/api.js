import axios from 'axios';

const API = axios.create({
  baseURL: 'https://pic2speak-backend.onrender.com/api/v1',
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem('adminToken');
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default API;