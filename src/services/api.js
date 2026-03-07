import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jewellery-backend-ewfw.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
});

// Request interceptor: Attach JWT token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Normalize URL
    let url = config.url || '';
    
    // Auth headers
    if (token && !url.includes('accounts/login') && !url.includes('accounts/register')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure leading slash for join logic with baseURL
    if (!url.startsWith('/') && !url.startsWith('http')) {
      config.url = `/${url}`;
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

    // If 401 error, not already retried, and NOT an auth request
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('accounts/token/refresh') &&
      !originalRequest.url.includes('accounts/login') &&
      !originalRequest.url.includes('accounts/register')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/accounts/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Token is dead
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.dispatchEvent(new Event('auth-logout'));
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available
        localStorage.removeItem('access_token');
        window.dispatchEvent(new Event('auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
