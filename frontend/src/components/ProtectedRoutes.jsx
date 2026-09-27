import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user's actual role
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
    return <Navigate to="/jobseeker/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
