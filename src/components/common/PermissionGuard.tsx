import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Lock } from "lucide-react";

export type PermissionType = 
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_services'
  | 'manage_businesses'
  | 'approve_verifications'
  | 'manage_notices'
  | 'manage_settings'
  | 'edit_own_profile'
  | 'edit_own_business'
  | 'edit_assigned_content';

// Role to Permissions mapping matrix (Spatie-style matrix)
export const ROLE_PERMISSIONS: Record<string, PermissionType[]> = {
  super_admin: [
    'view_dashboard',
    'manage_users',
    'manage_services',
    'manage_businesses',
    'approve_verifications',
    'manage_notices',
    'manage_settings',
    'edit_own_profile',
    'edit_own_business',
    'edit_assigned_content'
  ],
  admin: [
    'view_dashboard',
    'manage_users',
    'manage_services',
    'manage_businesses',
    'approve_verifications',
    'manage_notices',
    'edit_own_profile',
    'edit_own_business',
    'edit_assigned_content'
  ],
  moderator: [
    'view_dashboard',
    'manage_services',
    'manage_businesses',
    'manage_notices',
    'edit_own_profile',
    'edit_assigned_content'
  ],
  business_owner: [
    'edit_own_profile',
    'edit_own_business'
  ],
  provider: [
    'edit_own_profile',
    'edit_own_business'
  ],
  user: [
    'edit_own_profile'
  ]
};

interface PermissionGuardProps {
  permission: PermissionType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback
}) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userRole = userProfile?.role || 'user';
  const customPermissions = userProfile?.permissions || [];

  // Check if role has the permission or if user was assigned explicit permission
  const rolePermissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['user'];
  const hasPermission = 
    userRole === 'super_admin' || 
    rolePermissions.includes(permission) || 
    customPermissions.includes(permission);

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="p-6 bg-amber-50/80 border border-amber-200 rounded-2xl text-center max-w-sm mx-auto my-4 space-y-2">
        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <Lock size={20} />
        </div>
        <h4 className="text-sm font-black text-amber-900">অনুমতি নেই (Permission Required)</h4>
        <p className="text-[11px] font-bold text-amber-700">
          এই অ্যাকশনটি সম্পাদনা করার জন্য আপনার অ্যাকাউন্ট পারমিশন (`{permission}`) প্রয়োজন।
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
