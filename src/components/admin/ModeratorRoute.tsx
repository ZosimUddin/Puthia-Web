import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ModeratorRouteProps {
  children?: React.ReactNode;
}

export const ModeratorRoute: React.FC<ModeratorRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isModerator = user && (
    userProfile?.role === 'moderator' || 
    userProfile?.role === 'admin' || 
    userProfile?.role === 'super_admin' || 
    user.email === 'mdzosimuddin47@gmail.com'
  );

  if (!isModerator) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ModeratorRoute;

