import axios from 'axios';

const getDefaultApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If env is localhost but we are on production, or if no env URL, use production URL
  if ((envUrl && envUrl.includes('localhost') && !isLocalhost) || !envUrl) {
    if (isLocalhost) return 'http://localhost:8000';
    return 'https://jewellery-backend-ewfw.onrender.com';
  }

  return envUrl;
};

const API_BASE_URL = getDefaultApiUrl();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  timeout: 120000,
});

// Health check to wake up the backend
let warmupPromise = null;

export const warmupBackend = async () => {
  // Return existing promise if warmup is already in progress
  if (warmupPromise) return warmupPromise;

  warmupPromise = (async () => {
    console.log('Waking up backend service...');
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        // Use a longer timeout for individual attempts to cycle through them
        await axios.get(`${API_BASE_URL}/api/health/`, { timeout: 60000 });
        console.log('Backend service is awake and healthy.');
        return true;
      } catch (error) {
        attempts++;
        console.warn(`Warmup attempt ${attempts} failed: ${error.message}`);
        if (attempts < maxAttempts) {
          // Wait 2 seconds before retry
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
    return false;
  })();

  // Clear promise after 60s so it can be retried if needed
  setTimeout(() => { warmupPromise = null; }, 60000);

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
    const skipAuth = 
      url.includes('accounts/login') || 
      url.includes('accounts/register') || 
      url.includes('accounts/token/refresh');

    if (token && !skipAuth) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // Ensure no leading slash when using baseURL with trailing slash
    if (url.startsWith('/')) {
      config.url = url.substring(1);
    }

    // Handle Content-Type correctly
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    } else if (config.data) {
      if (!config.headers.get('Content-Type')) {
        config.headers.set('Content-Type', 'application/json');
      }
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

          originalRequest.headers.set('Authorization', `Bearer ${access}`);
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
