import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, userProfile, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userProfile?.isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white max-w-md w-full rounded-[40px] p-8 border border-rose-100 shadow-xl shadow-rose-100/50 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-rose-950 mb-3">অ্যাকাউন্ট স্থগিত করা হয়েছে</h2>
          <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
            দুঃখিত, আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত (Blocked) করা হয়েছে। বিস্তারিত জানতে বা অ্যাকাউন্ট পুনরায় সচল করতে অ্যাডমিনের সাথে যোগাযোগ করুন।
          </p>
          <div className="flex flex-col gap-3">
            <a 
              href="tel:01700000000" 
              className="bg-rose-500 hover:bg-rose-600 text-white py-3 px-6 rounded-2xl font-bold text-sm shadow-lg shadow-rose-100 transition-all flex items-center justify-center gap-2"
            >
              যোগাযোগ করুন
            </a>
            <button 
              onClick={() => logout()}
              className="bg-gray-50 hover:bg-gray-100 text-gray-600 py-3 px-6 rounded-2xl font-bold text-sm transition-all"
            >
              লগআউট করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requireAdmin && userProfile?.role !== 'super_admin' && userProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
