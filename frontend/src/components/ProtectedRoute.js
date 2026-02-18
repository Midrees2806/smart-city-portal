import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['user', 'admin'],
  allowedCategories = ['hostel', 'school']
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  // Check category (if not admin)
  if (user.role !== 'admin' && !allowedCategories.includes(user.category)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;

// Admin only route
export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

// Hostel user route
export const HostelRoute = ({ children }) => (
  <ProtectedRoute allowedCategories={['hostel']}>
    {children}
  </ProtectedRoute>
);

// School user route
export const SchoolRoute = ({ children }) => (
  <ProtectedRoute allowedCategories={['school']}>
    {children}
  </ProtectedRoute>
);