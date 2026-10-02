import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  UserCheck, 
  Briefcase, 
  Building2, 
  Newspaper, 
  BadgeCheck, 
  ShieldAlert, 
  Check, 
  X, 
  Info,
  Lock,
  Plus,
  Trash2,
  Edit,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface UserRoleInfo {
  key: string;
  titleBangla: string;
  badgeColor: string;
  icon: any;
  description: string;
  permissions: {
    viewPublic: boolean;
    createPost: boolean;
    applyServices: boolean;
    addBusiness: boolean;
    addServiceListing: boolean;
    publishNews: boolean;
    manageOwnData: boolean;
    moderateContent: boolean;
    adminControl: boolean;
  };
}

export const USER_ROLES_MATRIX: UserRoleInfo[] = [
  {
    key: 'general_user',
    titleBangla: 'সাধারণ ইউজার (Citizen)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: UserCheck,
    description: 'সকল নাগরিক তথ্য দর্শন, সেবার আবেদন, বুকমার্ক ও পোস্ট করার অধিকার রয়েছে।',
    permissions: {
      viewPublic: true,
      createPost: true,
      applyServices: true,
      addBusiness: false,
      addServiceListing: false,
      publishNews: false,
      manageOwnData: true,
      moderateContent: false,
      adminControl: false
    }
  },
  {
    key: 'service_provider',
    titleBangla: 'সেবা প্রদানকারী (Provider)',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: Briefcase,
    description: 'মিস্ত্রি, টেকনিশিয়ান, শিক্ষক, ডাক্তার ইত্যাদি পেশাদারদের জন্য তাদের সেবা যোগ ও রেটিং ম্যানেজমেন্ট।',
    permissions: {
      viewPublic: true,
      createPost: true,
      applyServices: true,
      addBusiness: false,
      addServiceListing: true,
      publishNews: false,
      manageOwnData: true,
      moderateContent: false,
      adminControl: false
    }
  },
  {
    key: 'business_owner',
    titleBangla: 'উদ্যোক্তা / ব্যবসায়ী (Merchant)',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Building2,
    description: 'ব্যবসা ও দোকান ডিরেক্টরিতে যোগ, স্পনসরড বিজ্ঞাপন ও পণ্য প্রদর্শনের অনুমতি।',
    permissions: {
      viewPublic: true,
      createPost: true,
      applyServices: true,
      addBusiness: true,
      addServiceListing: true,
      publishNews: false,
      manageOwnData: true,
      moderateContent: false,
      adminControl: false
    }
  },
  {
    key: 'content_creator',
    titleBangla: 'সংবাদদাতা / কন্টেন্ট ক্রিয়েটর',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Newspaper,
    description: 'স্থানান্তর সংবাদ সাবমিট ও এলাকাভিত্তিক তথ্য ও নোটিশ পোস্ট করার ক্ষমতা।',
    permissions: {
      viewPublic: true,
      createPost: true,
      applyServices: true,
      addBusiness: false,
      addServiceListing: false,
      publishNews: true,
      manageOwnData: true,
      moderateContent: false,
      adminControl: false
    }
  },
  {
    key: 'verified_user',
    titleBangla: 'ভেরিফাইড ইউজার (Verified)',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-black',
    icon: BadgeCheck,
    description: 'NID/ট্রেড লাইসেন্স দ্বারা সত্যায়িত ইউজার ব্যাজ সহ প্রিমিয়াম সুবিধা ও অগ্রাধিকার সেবা।',
    permissions: {
      viewPublic: true,
      createPost: true,
      applyServices: true,
      addBusiness: true,
      addServiceListing: true,
      publishNews: true,
      manageOwnData: true,
      moderateContent: false,
      adminControl: false
    }
  },
  {
    key: 'moderator',
    titleBangla: 'মডারেটর (Moderator)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: ShieldCheck,
    description: 'ব্যবহারকারীদের জমা দেওয়া পোস্ট, সংবাদ ও ব্যবসা অনুমোদন বা পেন্ডিং রিভিউ করার ক্ষমতা।',
    permissions: {
      viewPublic: true,
      createPost: true,
      applyServices: true,
      addBusiness: true,
      addServiceListing: true,
      publishNews: true,
      manageOwnData: true,
      moderateContent: true,
      adminControl: false
    }
  },
  {
    key: 'admin',
    titleBangla: 'এডমিন (System Admin)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 font-black',
    icon: ShieldAlert,
    description: 'সম্পূর্ণ সিস্টেম নিয়ন্ত্রণ, রোল এসাইন, ডাটা এডিট/ডিলিট ও সাইট কনফিগারেশন।',
    permissions: {
      viewPublic: true,
      createPost: true,
      applyServices: true,
      addBusiness: true,
      addServiceListing: true,
      publishNews: true,
      manageOwnData: true,
      moderateContent: true,
      adminControl: true
    }
  }
];

export const UserRolePermissionsMatrixView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-[#006a4e] to-emerald-800 text-white p-6 rounded-none sm:rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold">
              <ShieldCheck size={16} />
              <span>নিরাপত্তা ও অ্যাক্সেস কন্ট্রোল গাইড • আমাদের পুঠিয়া</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95 shadow-xs shrink-0"
                title="পূর্ববর্তী পেজে ফিরে যান"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">রোল ও পারমিশন</h1>
            </div>

            <p className="text-xs md:text-sm text-emerald-100 max-w-xl">
              আপনার একাউন্টের রোল অনুসারে অ্যাক্সেস ও অনুমোদিত ক্ষমতার তালিকা দেখুন।
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 sm:mx-0 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">রোল ভিত্তিক বিস্তারিত বিবরণী</h3>
              <p className="text-[11px] text-slate-500">বিভিন্ন রোলের জন্য নির্দিষ্ট পারমিশনসমূহ</p>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {USER_ROLES_MATRIX.map((role) => {
          const Icon = role.icon;
          return (
            <motion.div 
              key={role.key}
              whileHover={{ y: -2 }}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${role.badgeColor}`}>
                    <Icon size={16} />
                  </div>
                  <h4 className="text-xs font-black text-slate-900">{role.titleBangla}</h4>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${role.badgeColor}`}>
                  {role.key}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {role.description}
              </p>

              {/* Permission List Items */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-bold">
                <div className={`flex items-center gap-1 ${role.permissions.createPost ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {role.permissions.createPost ? <Check size={12} /> : <X size={12} />}
                  <span>পোস্ট তৈরি</span>
                </div>
                <div className={`flex items-center gap-1 ${role.permissions.addBusiness ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {role.permissions.addBusiness ? <Check size={12} /> : <X size={12} />}
                  <span>ব্যবসা যোগ</span>
                </div>
                <div className={`flex items-center gap-1 ${role.permissions.addServiceListing ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {role.permissions.addServiceListing ? <Check size={12} /> : <X size={12} />}
                  <span>সেবা লিস্টিং</span>
                </div>
                <div className={`flex items-center gap-1 ${role.permissions.publishNews ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {role.permissions.publishNews ? <Check size={12} /> : <X size={12} />}
                  <span>সংবাদ পাঠানো</span>
                </div>
                <div className={`flex items-center gap-1 ${role.permissions.moderateContent ? 'text-purple-700' : 'text-slate-400'}`}>
                  {role.permissions.moderateContent ? <Check size={12} /> : <X size={12} />}
                  <span>মডারেশন ক্ষমতা</span>
                </div>
                <div className={`flex items-center gap-1 ${role.permissions.adminControl ? 'text-rose-700' : 'text-slate-400'}`}>
                  {role.permissions.adminControl ? <Check size={12} /> : <X size={12} />}
                  <span>ফুল সিস্টেম এডমিন</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
    </div>
  );
};
