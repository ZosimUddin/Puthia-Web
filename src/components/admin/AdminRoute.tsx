import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AdminRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Allow both 'super_admin' and 'admin' roles (and developer email fallback)
  const isAuthorized = user && (
    userProfile?.role === 'super_admin' || 
    userProfile?.role === 'admin' || 
    user.email === 'mdzosimuddin31@gmail.com'
  );

  if (isAuthorized) {
    return children ? <>{children}</> : <Outlet />;
  }

  return <Navigate to="/super-admin/login" replace />;
};

export default AdminRoute;

