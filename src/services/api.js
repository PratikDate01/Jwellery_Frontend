import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

// Request interceptor: Attach JWT token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData correctly
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token expiration (401) and refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error, not already retried, and NOT a refresh token request
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('accounts/token/refresh/')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Use a clean axios instance for the refresh call to avoid interceptor issues
          const response = await axios.post(`${API_BASE_URL}/api/accounts/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Update Authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          // Dispatch a custom event or let AuthContext handle it
          // window.location.href = '/login'; 
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
