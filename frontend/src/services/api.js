import axios from 'axios';

const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || '/api';
  if (url && url !== '/api' && !url.endsWith('/api') && !url.endsWith('/api/')) {
    url = `${url.replace(/\/+$/, '')}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careermatch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 unauthorized
      localStorage.removeItem('careermatch_token');
      localStorage.removeItem('careermatch_user');
    }
    return Promise.reject(error);
  }
);

export default api;
