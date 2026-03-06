import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    if (!config.headers) {
      config.headers = {};
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        return api.post('accounts/token/refresh/', { refresh: refreshToken })
          .then((response) => {
            const { access } = response.data;
            localStorage.setItem('access_token', access);
            
            error.config.headers.Authorization = `Bearer ${access}`;
            return api(error.config);
          })
          .catch(() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(error);
          });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
