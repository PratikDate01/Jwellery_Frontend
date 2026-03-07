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
    
    // Attempt to wake up backend if it's cold
    try {
      await warmupBackend();
    } catch (e) {
      console.warn('Warmup failed, but continuing with auth init', e);
    }
    
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('accounts/profile/', {
        timeout: 45000, // Specific higher timeout for profile
      });
      if (response.data) {
        setUser(response.data);
        setError(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError(error.message);
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
      const response = await api.post('accounts/login/', { email, password }, {
        timeout: 45000, // Higher timeout for login to handle cold starts
      });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      setUser(userData);
      setError(null);
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
