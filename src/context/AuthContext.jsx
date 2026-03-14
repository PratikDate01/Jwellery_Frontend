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
    
    // Kick off the backend warmup in parallel
    warmupBackend();

    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      // Set a timeout for the profile fetch so it doesn't block forever
      // If it takes more than 2 seconds, we proceed as "logged in" but maybe partial data
      // The ProtectedRoute or subsequent queries will handle the rest
      const profilePromise = api.get('accounts/profile/');
      
      // Wait for profile with a reasonable timeout for UI responsiveness
      const response = await Promise.race([
        profilePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
      ]);

      if (response.data) {
        setUser(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Auth initialization info:', err.message);
      // If it's just a timeout, we keep loading as true or false?
      // If we have a token, we assume authenticated for now to show the UI
      if (accessToken) {
        // We have a token but profile fetch failed/timed out
        // Just set loading to false so the user can see the page
        // Subsequent API calls will either work or trigger a 401
        console.log('Proceeding with cached token despite profile fetch delay');
      }
    } finally {
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
    isSupplier: user?.role === 'SUPPLIER',
    isCustomer: user?.role === 'CUSTOMER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
