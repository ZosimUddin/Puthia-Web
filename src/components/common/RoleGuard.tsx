import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ShieldAlert } from "lucide-react";

export type RoleType = 'super_admin' | 'admin' | 'moderator' | 'business_owner' | 'provider' | 'user';

interface RoleGuardProps {
  allowedRoles: RoleType[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback
}) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentRole: RoleType = (userProfile?.role as RoleType) || 'user';

  // Super Admin has global override access
  const hasAccess = currentRole === 'super_admin' || allowedRoles.includes(currentRole);

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="p-8 bg-red-50/80 border border-red-200 rounded-2xl text-center max-w-md mx-auto my-6 space-y-3">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={24} />
        </div>
        <h3 className="text-base font-black text-red-900">অনুমতি সংরক্ষিত (Role Restricted)</h3>
        <p className="text-xs font-bold text-red-600 leading-relaxed">
          এই বিভাগ বা ফিচারে প্রবেশ করার প্রয়োজনীয় রোল (`{allowedRoles.join(', ')}`) আপনার প্রোফাইলে সক্রিয় নেই।
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
