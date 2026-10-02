import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const SuperAdminRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const isSuperAdmin = user && (
    userProfile?.role === "super_admin" || 
    user.email === "mdzosimuddin31@gmail.com"
  );
  const isSessionActive = sessionStorage.getItem("super_admin_session_active") === "true";

  if (isSuperAdmin && isSessionActive) {
    return children ? <>{children}</> : <Outlet />;
  }
  return <Navigate to="/super-admin/login" replace />;
};

export default SuperAdminRoute;

