import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

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
    
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      // Attempt to fetch profile. Our api instance handles headers and silent refresh
      const response = await api.get('accounts/profile/');
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Tokens are cleared by api interceptor on failure, so just clear state
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      // Ensure loading is always stopped
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    try {
      const response = await api.post('accounts/login/', { email, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      setUser(userData);
      return userData;
    } catch (error) {
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
