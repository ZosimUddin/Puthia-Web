import React from 'react';
import { OfflineSyncHub } from '../../components/admin/OfflineSyncHub';
import { Database, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminOfflineSyncPage() {
  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/admin" className="hover:text-emerald-700 transition-colors">
          অ্যাডমিন ড্যাশবোর্ড
        </Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 flex items-center gap-1.5 font-extrabold">
          <Database size={14} className="text-emerald-700" /> Offline + Sync
        </span>
      </div>

      {/* Security Level Indicator Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-4 text-emerald-950">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h4 className="font-extrabold text-xs text-emerald-900">
              অফলাইন ডেটা পারসিস্টেন্স ও সিকিউর সিঙ্ক ইঞ্জিন
            </h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              সকল মিউটেশন এনক্রিপ্টেড কিউতে জমা থাকে এবং পিয়ার-টু-ক্লাউড কনফ্লিক্ট রেজোলিউশন পলিসি অনুযায়ী ব্যাকআপ হয়।
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900">
            Fortress Mode
          </span>
        </div>
      </div>

      {/* Main Command Center Component */}
      <OfflineSyncHub />
    </div>
  );
}

