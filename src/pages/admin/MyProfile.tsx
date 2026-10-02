import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Crown, 
  CheckCircle2, 
  Key, 
  Lock, 
  Activity, 
  Server, 
  Users, 
  Sliders, 
  Clock, 
  FileText, 
  Globe, 
  ExternalLink,
  Zap,
  Fingerprint,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const MyProfile: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'shortcuts' | 'security'>('overview');
  const [copied, setCopied] = useState(false);

  // Email and name resolution
  const userEmail = user?.email || userProfile?.email || 'mdzosimuddin47@gmail.com';
  const userName = user?.displayName || userProfile?.name || 'মোঃ জসিম উদ্দিন';
  const isSuperAdmin = userProfile?.role === 'super_admin' || userEmail === 'mdzosimuddin47@gmail.com';
  const displayRole = isSuperAdmin ? 'সুপার অ্যাডমিন (Super Admin)' : (userProfile?.role === 'admin' ? 'অ্যাডমিন (Admin)' : 'ইউজার');
  const adminId = 'SA-PUTHIA-001';

  const copyId = () => {
    navigator.clipboard.writeText(adminId);
    setCopied(true);
    toast.success('সুপার অ্যাডমিন আইডি কপি করা হয়েছে');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-slate-800">
      
      {/* Super Admin Master Banner - Cohesive Rounded Card */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden rounded-3xl border border-emerald-700/50">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Crown size={260} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 border-2 border-white/40 backdrop-blur-md rounded-3xl flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-lg shadow-emerald-950/20">
                {userName.charAt(0) || 'ম'}
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-amber-400 text-emerald-950 rounded-xl shadow-md border-2 border-white">
                <Crown size={18} className="fill-emerald-950" />
              </div>
            </div>

            {/* Main Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-emerald-950 rounded-full text-xs font-black shadow-xs">
                  <Crown size={14} className="fill-emerald-950" /> {displayRole}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 border border-white/20 text-white rounded-full text-xs font-black backdrop-blur-xs">
                  <CheckCircle2 size={13} className="text-emerald-300" /> সিস্টেম ওনার & প্রধান অ্যাডমিনিস্ট্রেটর
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {userName}
              </h1>
              
              <p className="text-xs sm:text-sm text-emerald-100 font-medium flex items-center gap-2">
                <Mail size={14} className="text-emerald-300" />
                <span className="font-bold">{userEmail}</span>
              </p>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button 
              onClick={copyId}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-2xl text-xs font-black text-white flex items-center gap-2 backdrop-blur-xs cursor-pointer transition active:scale-95"
            >
              <Fingerprint size={16} className="text-emerald-300" />
              <span>আইডি: {adminId}</span>
              {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} className="text-emerald-200" />}
            </button>
            <div className="px-4 py-2.5 bg-emerald-500/30 border border-emerald-400/40 rounded-2xl text-xs font-black text-emerald-100 flex items-center gap-2 backdrop-blur-xs">
              <Shield size={16} className="text-emerald-300" />
              <span>টিয়ার-১ মাস্টার প্রিভিলেজ</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 mt-8 pt-6 border-t border-white/15 scrollbar-none no-scrollbar touch-pan-x">
          {[
            { id: 'overview', label: '👤 প্রোফাইল পরিচিতি ও তথ্য', icon: User },
            { id: 'permissions', label: '🛡️ সুপার অ্যাডমিন পারমিশন ম্যাট্রিক্স', icon: Shield },
            { id: 'shortcuts', label: '⚡ দ্রুত কমান্ড ও কন্ট্রোল হাব', icon: Zap },
            { id: 'security', label: '🔒 নিরাপত্তা ও অ্যাক্টিভ সেশন', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2.5 whitespace-nowrap transition-all cursor-pointer shrink-0 flex-shrink-0 min-w-max ${
                  isActive 
                    ? 'bg-white text-emerald-900 shadow-md font-black' 
                    : 'bg-white/15 text-white hover:bg-white/25 font-bold'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-emerald-800' : 'text-emerald-100'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="w-full space-y-6">

        {/* TAB 1: OVERVIEW & PROFILE DETAILS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Primary Details Card */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">অ্যাডমিনিস্ট্রেটর মূল প্রোফাইল ডেটা</h3>
                    <p className="text-xs text-slate-400 font-bold">পুঠিয়া ডিজিটাল ডায়েরির মাস্টার কনফিগারেশন</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black flex items-center gap-1">
                  <CheckCircle2 size={13} /> অ্যাক্টিভ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-1">পূর্ণ নাম (Display Name)</p>
                  <p className="text-sm font-black text-slate-800">{userName}</p>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-1">প্রাথমিক ইমেইল (Primary Email)</p>
                  <p className="text-sm font-black text-emerald-700">{userEmail}</p>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-1">সিস্টেম রোল (Authority Role)</p>
                  <p className="text-sm font-black text-amber-600 flex items-center gap-1.5">
                    <Crown size={15} /> {displayRole}
                  </p>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-1">সুপার অ্যাডমিন ইউনিক আইডি</p>
                  <p className="text-sm font-black text-slate-800 font-mono">{adminId}</p>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-1">এরিয়া / লোকেশন এখতিয়ার</p>
                  <p className="text-sm font-black text-slate-800">পুঠিয়া উপজেলা (৬টি ইউনিয়ন ও পৌরসভা)</p>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-1">অ্যাক্সেস লেভেল</p>
                  <p className="text-sm font-black text-emerald-600">রুট ফুল এক্সেস (Root / Master Level)</p>
                </div>
              </div>

              {/* Bio & System Scope Note */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 text-emerald-900 space-y-1">
                <p className="text-xs font-black flex items-center gap-1.5">
                  <Shield size={14} className="text-emerald-700" /> সিস্টেম ওনার নোট:
                </p>
                <p className="text-xs font-medium leading-relaxed">
                  এই অ্যাকাউন্টটি পুঠিয়া ডিজিটাল ডায়েরি প্ল্যাটফর্মের সর্বোচ্চ রুট কন্ট্রোল ধারক। এখান থেকে সকল সাব-মডিউল অনুমোদন, রোল নির্ধারণ, ফায়ারওয়াল সিকিউরিটি ও ব্যাকআপ সিস্টেম সার্বক্ষণিক নিয়ন্ত্রণ করা সম্ভব।
                </p>
              </div>
            </div>

            {/* Quick Status & Access Summary Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Crown size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">সুপার প্রিভিলেজ স্থিতি</h3>
                  <p className="text-xs text-slate-400 font-bold">সিস্টেম সিকিউরিটি স্টেট</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl text-xs">
                  <span className="font-bold text-slate-600">ডাটাবেস রাইট ও ডিলিট</span>
                  <span className="font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">সম্পূর্ণ সক্রিয়</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl text-xs">
                  <span className="font-bold text-slate-600">মাস্টার সিকিউরিটি পিন</span>
                  <span className="font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">সুরক্ষিত</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl text-xs">
                  <span className="font-bold text-slate-600">অডিট ট্রেইল লগিং</span>
                  <span className="font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">রিয়েল-টাইম</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl text-xs">
                  <span className="font-bold text-slate-600">আইপি ফায়ারওয়াল এক্সেস</span>
                  <span className="font-black text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">হোয়াইটলিস্টেড</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/admin/system"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sliders size={16} /> সিস্টেম কন্ট্রোলে যান
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PERMISSIONS MATRIX */}
        {activeTab === 'permissions' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">সুপার অ্যাডমিন পারমিশন ও এক্সেস পলিসি ম্যাট্রিক্স</h3>
                  <p className="text-xs text-slate-500 font-bold">সকল মডিউল ও সিস্টেম লেভেলে আপনার অনুমোদিত অধিকারসমূহ</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black">
                ১০০% মাস্টার পারমিশন
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'ডাটাবেস ও ফায়ারস্টোর রুলস', desc: 'সকল কালেকশন ও ডকুমেন্টে ফুল রিড, রাইট, এডিট ও ডিলিট অধিকার', status: 'Full Access' },
                { title: 'ইউজার ও অ্যাডমিন রোল কন্ট্রোল', desc: 'যেকোনো ইউজারের রোল সুপার অ্যাডমিন, মডারেটর বা ইউজারে রূপান্তর', status: 'Full Access' },
                { title: 'নিরাপত্তা ও আইপি পলিসি', desc: 'সাসপেনশন, ব্যান, আইপি ব্লকিং ও রেট-লিমিটিং রুলস কনফিগার', status: 'Full Access' },
                { title: 'পেমেন্ট ও ভেরিফিকেশন অনুমোদন', desc: 'নাগরিক ও ব্যবসায়ীদের NID ভেরিফিকেশন ও প্রিমিয়াম এপ্রুভাল', status: 'Full Access' },
                { title: 'বিজ্ঞাপন ও স্পনসর ম্যানেজমেন্ট', desc: 'সকল প্রকার বিজ্ঞাপন ব্যানার এক্টিভেশন ও রেভিনিউ ট্র্যাকিং', status: 'Full Access' },
                { title: 'ব্যাকআপ ও সিস্টেম রিস্টোর', desc: 'ফুল ডাটাবেস ব্যাকআপ জেনারেশন এবং যেকোনো ব্যাকআপ রিস্টোরেশন', status: 'Full Access' },
                { title: 'সার্চ ইঞ্জিন ও মেইলিসার্চ ইনডেক্স', desc: 'মেইলিসার্চ লাইভ ইনডেক্সিং ও এআই ভয়েস সার্চ কনফিগারেশন', status: 'Full Access' },
                { title: 'অডিট লগ ও সিস্টেম মনিটরিং', desc: 'অ্যাডমিনদের সমস্ত অ্যাক্টিভিটি টাইমস্ট্যাম্পসহ অডিট ট্রেইল ভিউ', status: 'Full Access' },
                { title: 'পাবলিক নোটিশ ও জরুরি বার্তা', desc: 'পুঠিয়ার সকল নাগরিকের স্ক্রিনে ইনস্ট্যান্ট নোটিশ পুশ নোটিফিকেশন', status: 'Full Access' },
              ].map((perm, idx) => (
                <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 hover:bg-emerald-50/40 transition">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> {perm.title}
                    </h4>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      {perm.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{perm.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COMMAND SHORTCUTS */}
        {activeTab === 'shortcuts' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Zap size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">সুপার অ্যাডমিন দ্রুত কমান্ড ও সাব-মডিউল শর্টকাট</h3>
                <p className="text-xs text-slate-500 font-bold">কমান্ড সেন্টার থেকে এক ক্লিকে যেকোনো অ্যাডমিন মডিউলে সরাসরি প্রবেশ করুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'সিস্টেম কন্ট্রোল ও রোল ম্যানেজার', desc: 'অ্যাডমিন রোল ও সিস্টেম কনফিগ', path: '/admin/system', icon: Sliders, color: 'bg-emerald-50 text-emerald-700' },
                { title: 'সিকিউরিটি ও ট্রাস্ট সেন্টার', desc: 'ফায়ারওয়াল, বট ফিল্টার ও রিস্ক স্কোর', path: '/admin/trust-safety', icon: Shield, color: 'bg-red-50 text-red-700' },
                { title: 'সুপার অ্যাডমিন অডিট ট্রেইল', desc: 'সকল ক্রিয়াকলাপের বিস্তারিত লগ ভিউয়ার', path: '/admin/audit-logs', icon: FileText, color: 'bg-blue-50 text-blue-700' },
                { title: 'সার্চ ইঞ্জিন ও মেইলিসার্চ হাব', desc: 'সার্চ ইনডেক্সিং ও ভয়েস সার্চ কন্ট্রোল', path: '/admin/search-engine', icon: Zap, color: 'bg-amber-50 text-amber-700' },
                { title: 'নাগরিক প্রোফাইল ও সোশ্যাল গ্রাফ', desc: 'সিটিজেন একাউন্ট ও NID ভেরিফিকেশন', path: '/admin/profiles', icon: Users, color: 'bg-teal-50 text-teal-700' },
                { title: 'ডাটাবেস ব্যাকআপ ও রিস্টোর', desc: 'ব্যাকআপ জেনারেটর ও রিকভারি', path: '/admin/backup-restore', icon: Server, color: 'bg-purple-50 text-purple-700' },
                { title: 'স্বাস্থ্য ডিরেক্টরি ম্যানেজমেন্ট', desc: 'হাসপাতাল, ডাক্তার ও ব্লাড ডোনার', path: '/admin/health-directory', icon: Activity, color: 'bg-emerald-50 text-emerald-700' },
                { title: 'সাইট সেটিংস ও ব্র্যান্ডিং', desc: 'অ্যাপ মেটাডেটা, লোগো ও থিম কনফিগ', path: '/admin/site-settings', icon: Globe, color: 'bg-cyan-50 text-cyan-700' },
                { title: 'বিজ্ঞাপন ও প্রমোশন হাব', desc: 'ব্যানার এডভার্টাইজ ও রেভিনিউ', path: '/admin/ads', icon: Crown, color: 'bg-amber-50 text-amber-700' },
              ].map((shortcut, idx) => {
                const Icon = shortcut.icon;
                return (
                  <Link
                    key={idx}
                    to={shortcut.path}
                    className="p-5 bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 rounded-2xl transition group flex items-start gap-3.5 shadow-2xs cursor-pointer"
                  >
                    <div className={`p-3 rounded-xl shrink-0 ${shortcut.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-black text-slate-800 group-hover:text-emerald-900 transition truncate">
                          {shortcut.title}
                        </h4>
                        <ExternalLink size={13} className="text-slate-400 group-hover:text-emerald-700 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">{shortcut.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & ACTIVE SESSION */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Security Status Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">অ্যাকাউন্ট সিকিউরিটি ও প্রটেকশন</h3>
                  <p className="text-xs text-slate-400 font-bold">সুপার অ্যাডমিন লেভেল সাইবার ডিফেন্স</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Shield className="text-emerald-600" size={18} />
                    <div>
                      <p className="text-xs font-black text-slate-800">টু-ফ্যাক্টর অথেনটিকেশন (2FA)</p>
                      <p className="text-[11px] text-slate-500 font-medium">রুট অ্যাক্সেস প্রটেকশন চালু রয়েছে</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black">
                    সক্রিয়
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Key className="text-amber-600" size={18} />
                    <div>
                      <p className="text-xs font-black text-slate-800">মাস্টার অ্যাডমিন পিন (Master PIN)</p>
                      <p className="text-[11px] text-slate-500 font-medium">সংবেদনশীল অপারেশনগুলোর জন্য বাধ্যতামূলক</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black">
                    এনফোর্সড
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Activity className="text-blue-600" size={18} />
                    <div>
                      <p className="text-xs font-black text-slate-800">এনক্রিপ্টেড সেশন টোকেন</p>
                      <p className="text-[11px] text-slate-500 font-medium">TLS 1.3 / SSL সুরক্ষিত কমিউনিকেশন</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black">
                    নিরাপদ
                  </span>
                </div>
              </div>
            </div>

            {/* Current Session Specs */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Activity size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">বর্তমান লাইভ সেশন তথ্য</h3>
                  <p className="text-xs text-slate-400 font-bold">ব্রাউজার ও ডিভাইস কানেক্টিভিটি</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">অনলাইন স্থিতি</span>
                  <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> লাইভ কানেক্টেড
                  </span>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">ডিভাইস ও ব্রাউজার</span>
                  <span className="text-xs font-black text-slate-800">Chrome Mobile / Web Secure</span>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">অথেনটিকেশন প্রোভাইডার</span>
                  <span className="text-xs font-black text-slate-800">Firebase Native Auth</span>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">অ্যাক্টিভিটি ট্র্যাকিং</span>
                  <span className="text-xs font-black text-emerald-700">Audit Trail Enabled</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
