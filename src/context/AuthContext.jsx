import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { warmupBackend } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setLoading(false);
  }, []);

  const initializeAuth = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    
    // 1. Kick off the backend warmup but DON'T await it yet. 
    // This starts the process immediately while we check other logic.
    const warmupPromise = warmupBackend();

    if (!accessToken) {
      // Still wait for warmup to finish in background but resolve loading
      setLoading(false);
      return;
    }

    try {
      // 2. Wait for the warmup to finish before we attempt profile fetch
      // This ensures the backend is actually awake for the core auth check.
      await warmupPromise;

      const response = await api.get('accounts/profile/', {
        timeout: 90000, // Profile check specifically gets a high timeout
      });

      if (response.data) {
        setUser(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      // Don't set error message for initial profile fetch failures
      // unless it's a critical error beyond just 401/timeout
      if (err.response?.status !== 401) {
        setError('Connection issues. Backend might be warming up.');
      }
      setUser(null);
    } finally {
      // ALWAYS resolve loading state to prevent infinite loader
      setLoading(false);
    }
  }, []);

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
      // This is helpful if the user tries to login immediately after landing
      const warmupPromise = warmupBackend();

      const response = await api.post('accounts/login/', { email, password }, {
        timeout: 120000, // Increased to 120s for cold starts
      });
      
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      setUser(userData);
      setError(null);
      
      // We don't strictly NEED to await the warmupPromise here as login succeeded,
      // but it's good practice to ensure it's not dangling
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
    isWholesaler: user?.role === 'WHOLESALER',
    isSupplier: user?.role === 'SUPPLIER',
    isCustomer: user?.role === 'CUSTOMER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
