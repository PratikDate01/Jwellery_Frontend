import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { warmupBackend } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setLoading(false);
  }, []);

  const initializeAuth = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    
    // Kick off the backend warmup in parallel
    warmupBackend();

    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      // Set a longer timeout for the profile fetch (120s) to handle extreme cold starts
      const profilePromise = api.get('accounts/profile/');
      
      const response = await Promise.race([
        profilePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout (120s exceeded)')), 120000))
      ]);

      if (response.data) {
        setUser(response.data);
      }
    } catch (err) {
      const is401 = err.response?.status === 401 || !localStorage.getItem('access_token');
      const isTimeout = err.message?.includes('timeout');

      if (is401) {
        // Expired or invalid token: clean up session
        logout();
      } else if (isTimeout) {
        console.warn('Auth initialization info: Profile fetch timed out (Backend still warming up?)');
      } else {
        console.error('Auth initialization error:', err.message);
        // If tokens were cleared by the interceptor, ensure user state is cleared
        if (!localStorage.getItem('access_token')) {
          logout();
        }
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    initializeAuth();

    // Listen for logout events from the axios interceptor
    const handleLogout = () => {
      logout();
    };
    
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, [initializeAuth, logout]);

  const login = async (email, password) => {
    try {
      // Before login, do a quick health check or warmup if not already done
      const warmupPromise = warmupBackend();
      const cleanEmail = (email || '').trim();

      const response = await api.post('accounts/login/', { email: cleanEmail, password }, {
        timeout: 180000, // Increased to 180s for extreme cold starts
      });
      
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      setUser(userData);
      
      await warmupPromise;
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isSupplier: user?.role === 'SUPPLIER',
    isCustomer: user?.role === 'CUSTOMER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
