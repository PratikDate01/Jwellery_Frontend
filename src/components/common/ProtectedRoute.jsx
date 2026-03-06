import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // While checking for persistent authentication, show the loader
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no user is logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user role is not allowed for this route, redirect to home or dashboard
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Basic redirect to home if unauthorized
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
