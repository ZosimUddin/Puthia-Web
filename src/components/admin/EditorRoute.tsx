import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface EditorRouteProps {
  children?: React.ReactNode;
}

export const EditorRoute: React.FC<EditorRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isEditor = user && (
    userProfile?.role === 'editor' || 
    userProfile?.role === 'admin' || 
    userProfile?.role === 'super_admin' || 
    user.email === 'mdzosimuddin47@gmail.com'
  );

  if (!isEditor) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default EditorRoute;

