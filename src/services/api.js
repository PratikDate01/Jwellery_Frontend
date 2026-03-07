import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jewellery-backend-ewfw.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000, // Increased to 60s for Render cold starts
});

// Health check to wake up the backend
let warmupPromise = null;

export const warmupBackend = async () => {
  // Return existing promise if warmup is already in progress
  if (warmupPromise) return warmupPromise;

  warmupPromise = (async () => {
    console.log('Waking up backend service...');
    try {
      // 60s timeout for cold starts on Render
      await axios.get(`${API_BASE_URL}/api/health/`, { timeout: 60000 });
      console.log('Backend service is awake and healthy.');
      return true;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.warn('Backend warmup timed out (Render cold start?)');
      } else {
        console.warn('Backend warmup failed', error.message);
      }
      return false;
    } finally {
      // Clear promise after 30s so it can be retried if needed
      setTimeout(() => { warmupPromise = null; }, 30000);
    }
  })();

  return warmupPromise;
};

/**
 * Safe request wrapper to prevent infinite loaders and handle errors gracefully
 */
export const safeRequest = async (requestFn, fallbackValue = null) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    console.error('API Request failed:', error);
    return fallbackValue;
  }
};

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
