import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Store,
  Megaphone,
  Bell,
  FolderTree,
  Map,
  Calendar,
  HeartPulse,
  Stethoscope,
  CreditCard,
  BarChart,
  Settings,
  ShieldAlert,
  X,
  Menu,
  LogOut,
  ChevronRight,
  Activity,
  Send,
  Tag,
  ShoppingBag,
  Home,
  Newspaper,
  Award,
  Building,
  Leaf,
  Info,
  GraduationCap,
  Building2,
  Briefcase,
  CloudSun,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import UserManagement from "./UserManagement";
import BusinessApproval from "./BusinessApproval";
import AdApplicationManagement from "./AdApplicationManagement";
import NoticeManagement from "./NoticeManagement";
import MarketPriceManagement from "./MarketPriceManagement";
import RentManagement from "./RentManagement";
import ContentCategoryManagement from "./ContentCategoryManagement";
import BloodDonorManagement from "./BloodDonorManagement";
import AppSettingsManagement from "./AppSettingsManagement";
import BackupRestoreManagement from "./BackupRestoreManagement";
import ReportManagement from "./ReportManagement";
import EventManagement from "./EventManagement";
import UpazilaManagement from "./UpazilaManagement";
import ActivityLogManagement from "./ActivityLogManagement";
import PushNotificationManagement from "./PushNotificationManagement";
import CouponManagement from "./CouponManagement";
import ServiceApplicationManagement from "./ServiceApplicationManagement";
import HospitalManagement from "./HospitalManagement";
import EducationManagement from "./EducationManagement";
import GovtOfficeManagement from "./GovtOfficeManagement";
import AgricultureManagement from "./AgricultureManagement";
import NotablePersonsManagement from "./NotablePersonsManagement";
import ContentNewsManagement from "./ContentNewsManagement";
import UpazilaInfoManagement from "./UpazilaInfoManagement";
import NgoManagement from "./NgoManagement";
import JobManagement from "./JobManagement";
import WeatherConfigManagement from "./WeatherConfigManagement";
import GalleryManagement from "../pages/admin/GalleryManagement";
import ContentVideoManagement from "./ContentVideoManagement";
import SportsManagement from "../pages/admin/SportsManagement";

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdminOrSuperAdmin =
    userProfile?.role === "super_admin" || userProfile?.role === "admin";
  const permissions = userProfile?.permissions || [];

  const allTabs = [
    {
      id: "dashboard",
      label: "ড্যাশবোর্ড",
      icon: LayoutDashboard,
      requiredPermission: null,
    },
    {
      id: "users",
      label: "ইউজার ম্যানেজমেন্ট",
      icon: Users,
      requiredPermission: "users",
    },
    {
      id: "business",
      label: "ব্যবসা ম্যানেজমেন্ট",
      icon: Store,
      requiredPermission: "sponsors",
    },
    {
      id: "ads",
      label: "বিজ্ঞাপন ম্যানেজমেন্ট",
      icon: Megaphone,
      requiredPermission: "ads",
    },
    {
      id: "services",
      label: "ডিজিটাল সেবা আবেদন",
      icon: Send,
      requiredPermission: "ads",
    },
    {
      id: "notices",
      label: "নোটিশ ম্যানেজমেন্ট",
      icon: Bell,
      requiredPermission: "notices",
    },
    {
      id: "market_prices",
      label: "আজকের বাজার দর",
      icon: ShoppingBag,
      requiredPermission: "notices",
    },
    {
      id: "rent_to_let",
      label: "মেস ও বাসা ভাড়া",
      icon: Home,
      requiredPermission: "notices",
    },
    {
      id: "directory",
      label: "ডিরেক্টরি ম্যানেজমেন্ট",
      icon: FolderTree,
      requiredPermission: "ugc",
    },
    {
      id: "upazila",
      label: "উপজেলা তথ্য",
      icon: Map,
      requiredPermission: "notices",
    },
    {
      id: "upazila_intro",
      label: "উপজেলা পরিচিতি",
      icon: Info,
      requiredPermission: "ugc",
    },
    {
      id: "gallery",
      label: "ফটো গ্যালারি",
      icon: ImageIcon,
      requiredPermission: "ugc",
    },
    {
      id: "videos",
      label: "ভিডিও গ্যালারি",
      icon: Video,
      requiredPermission: "ugc",
    },
    {
      id: "news",
      label: "সংবাদ ম্যানেজমেন্ট",
      icon: Newspaper,
      requiredPermission: "notices",
    },
    {
      id: "notable_persons",
      label: "গুণীজন ম্যানেজমেন্ট",
      icon: Award,
      requiredPermission: "ugc",
    },
    {
      id: "govt_offices",
      label: "সরকারি অফিস",
      icon: Building,
      requiredPermission: "ugc",
    },
    {
      id: "education",
      label: "শিক্ষা প্রতিষ্ঠান",
      icon: GraduationCap,
      requiredPermission: "ugc",
    },
    {
      id: "agriculture",
      label: "কৃষি তথ্য",
      icon: Leaf,
      requiredPermission: "ugc",
    },
    {
      id: "ngos",
      label: "এনজিও ম্যানেজমেন্ট",
      icon: Building2,
      requiredPermission: "ugc",
    },
    {
      id: "jobs",
      label: "চাকরি ম্যানেজমেন্ট",
      icon: Briefcase,
      requiredPermission: "ugc",
    },
    {
      id: "weather",
      label: "আবহাওয়া কনফিগার",
      icon: CloudSun,
      requiredPermission: "super_admin_only",
    },
    {
      id: "events",
      label: "ইভেন্ট ম্যানেজমেন্ট",
      icon: Calendar,
      requiredPermission: "notices",
    },
    {
      id: "sports",
      label: "খেলাধুলা ম্যানেজমেন্ট",
      icon: Award,
      requiredPermission: "notices",
    },
    {
      id: "blood",
      label: "ব্লাড নেটওয়ার্ক",
      icon: HeartPulse,
      requiredPermission: "blood_donors",
    },
    {
      id: "hospital",
      label: "হাসপাতাল ও ডাক্তার",
      icon: Stethoscope,
      requiredPermission: "ugc",
    },
    {
      id: "payment",
      label: "পেমেন্ট ও বিলিং",
      icon: CreditCard,
      requiredPermission: "sponsors",
    },
    {
      id: "analytics",
      label: "অ্যানালিটিক্স",
      icon: BarChart,
      requiredPermission: null,
    },
    {
      id: "coupons",
      label: "কুপন সিস্টেম",
      icon: Tag,
      requiredPermission: "ads",
    },
    {
      id: "push",
      label: "পুশ নোটিফিকেশন",
      icon: Send,
      requiredPermission: "notices",
    },
    {
      id: "activity",
      label: "অ্যাক্টিভিটি লগ",
      icon: Activity,
      requiredPermission: "super_admin_only",
    },
    {
      id: "settings",
      label: "সেটিংস",
      icon: Settings,
      requiredPermission: "super_admin_only",
    },
    {
      id: "security",
      label: "ব্যাকআপ ও সিকিউরিটি",
      icon: ShieldAlert,
      requiredPermission: "super_admin_only",
    },
  ];

  const tabs = allTabs.filter((tab) => {
    if (isAdminOrSuperAdmin) {
      if (tab.requiredPermission === "super_admin_only")
        return userProfile?.role === "super_admin";
      return true;
    }
    if (!tab.requiredPermission) return true; // Dashboard, Analytics
    return permissions.includes(tab.requiredPermission);
  });

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              ড্যাশবোর্ড ওভারভিউ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "মোট ইউজার",
                  value: "১,২ডি+",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  title: "মোট ব্যবসা",
                  value: "৩৫০+",
                  color: "from-emerald-500 to-teal-500",
                },
                {
                  title: "মোট ক্যাটাগরি",
                  value: "৪৫+",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  title: "মোট বিজ্ঞাপন",
                  value: "১২০+",
                  color: "from-orange-500 to-red-500",
                },
                {
                  title: "Pending Approval",
                  value: "১৫",
                  color: "from-amber-500 to-yellow-500",
                },
                {
                  title: "আজকের ভিজিটর",
                  value: "৩২০",
                  color: "from-indigo-500 to-blue-500",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}
                >
                  <h3 className="text-white/80 font-medium mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-black">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-gray-800 mt-6">
              <h3 className="text-xl font-bold text-white mb-4">
                রিপোর্ট ও চার্ট (শীঘ্রই আসছে)
              </h3>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-xl">
                <span className="text-gray-500">
                  গ্রাফ এবং চার্ট এখানে প্রদর্শিত হবে
                </span>
              </div>
            </div>
          </div>
        );
      case "users":
        return <UserManagement />;
      case "business":
        return <BusinessApproval />;
      case "ads":
        return <AdApplicationManagement />;
      case "services":
        return <ServiceApplicationManagement />;
      case "notices":
        return <NoticeManagement />;
      case "market_prices":
        return <MarketPriceManagement />;
      case "rent_to_let":
        return <RentManagement />;
      case "directory":
        return <ContentCategoryManagement />;
      case "upazila":
        return <UpazilaManagement />;
      case "upazila_intro":
        return <UpazilaInfoManagement />;
      case "gallery":
        return <GalleryManagement />;
      case "videos":
        return <ContentVideoManagement />;
      case "news":
        return <ContentNewsManagement />;
      case "notable_persons":
        return <NotablePersonsManagement />;
      case "govt_offices":
        return <GovtOfficeManagement />;
      case "education":
        return <EducationManagement />;
      case "agriculture":
        return <AgricultureManagement />;
      case "ngos":
        return <NgoManagement />;
      case "jobs":
        return <JobManagement />;
      case "weather":
        return <WeatherConfigManagement />;
      case "events":
        return <EventManagement />;
      case "sports":
        return <SportsManagement />;
      case "blood":
        return <BloodDonorManagement />;
      case "hospital":
        return <HospitalManagement />;
      case "payment":
        return (
          <div className="space-y-6">
            <div className="bg-[#1E1E1E] p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-6">
                ১১. পেমেন্ট ও বিলিং
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {["bKash", "Nagad", "Rocket", "SSLCommerz"].map((gateway) => (
                  <div
                    key={gateway}
                    className="p-4 bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 border border-gray-700"
                  >
                    <span className="font-bold text-white">{gateway}</span>
                    <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                ))}
              </div>
              <h3 className="text-lg font-bold text-white mb-4">
                Payment History
              </h3>
              <div className="p-6 bg-black/20 border-2 border-dashed border-gray-700 rounded-xl text-center">
                <p className="text-sm text-gray-500">
                  কোনো সাম্প্রতিক লেনদেন পাওয়া যায়নি।
                </p>
              </div>
            </div>
          </div>
        );
      case "analytics":
        return <ReportManagement userProfile={userProfile} />;
      case "coupons":
        return <CouponManagement />;
      case "push":
        return <PushNotificationManagement />;
      case "activity":
        return <ActivityLogManagement />;
      case "settings":
        return <AppSettingsManagement />;
      case "security":
        return <BackupRestoreManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col md:flex-row font-sans text-gray-200 w-full fixed inset-0 z-50">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed md:static inset-y-0 left-0 w-[280px] bg-[#1A1A1A] border-r border-gray-800 z-50 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl`}
      >
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006A4E] to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg text-xl">
              A
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">অ্যাডমিন প্যানেল</h2>
              <p className="text-xs text-gray-500">System Admin</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <div className="space-y-1 px-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span>প্যানেল বন্ধ করুন</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full bg-[#121212]">
        <div className="sticky top-0 z-10 bg-[#1A1A1A] border-b border-gray-800 px-4 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-gray-400 p-2 -ml-2 rounded-lg hover:bg-gray-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#1A1A1A]"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold cursor-pointer">
              SA
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
