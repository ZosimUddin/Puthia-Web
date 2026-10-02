import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { AdminNotificationHub } from '../../components/admin/AdminNotificationHub';
import SEO from '../../components/SEO';

export default function AdminNotificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-slate-50/60 p-2 sm:p-4 md:p-6 font-sans">
      <SEO 
        title="এডমিন নোটিফিকেশন হাব - পুঠিয়া ডিজিটাল সেবা" 
        description="প্রশাসনিক নোটিফিকেশন ব্রডকাস্ট, অডিট লগ ও ডেলিভারি মেট্রিক্স" 
      />

      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200/70 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={16} />
            পেছনে ফিরে যান
          </button>
          
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <Bell size={18} />
            </span>
            <h1 className="text-base sm:text-lg font-black text-slate-800">
              এডমিন নোটিফিকেশন সেন্টার
            </h1>
          </div>
        </div>

        {/* Central Admin Hub Component */}
        <AdminNotificationHub />
      </div>
    </div>
  );
}
