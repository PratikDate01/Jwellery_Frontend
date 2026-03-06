import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState({
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  });

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setTokens({ access: null, refresh: null });
    setUser(null);
    setLoading(false);
  }, []);

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await api.get('accounts/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await api.post('accounts/token/refresh/', {
        refresh: tokens.refresh
      });
      const newAccess = response.data.access;
      localStorage.setItem('access_token', newAccess);
      setTokens(prev => ({ ...prev, access: newAccess }));
    } catch {
      logout();
    }
  }, [tokens.refresh, logout]);

  useEffect(() => {
    if (tokens.access) {
      try {
        const decoded = jwtDecode(tokens.access);
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          // Valid token, fetch user profile
          fetchUserProfile(tokens.access);
        } else {
          // Token expired, try refresh
          refreshAccessToken();
        }
      } catch {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, [tokens.access, fetchUserProfile, refreshAccessToken, logout]);

  const login = async (email, password) => {
    const response = await api.post('accounts/login/', { email, password });
    const { access, refresh, user: userData } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    setTokens({ access, refresh });
    setUser(userData);
    return userData;
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
