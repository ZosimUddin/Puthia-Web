import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { Sidebar } from "../../components/Sidebar";
import Notifications from "../../components/user/Notifications";
import SEO from "../../components/SEO";

export const NotificationCenterPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <SEO 
        title="নোটিফিকেশন সেন্টার - পুঠিয়া ডিজিটাল সেবাসমূহ" 
        description="লাইক, কমেন্ট, ফ্রেন্ড রিকুয়েস্ট, মেসেজ, মেনশন, ফলো, গ্রুপ, পেজ, মার্কেটপ্লেস, লাইভ ও স্টোরি সহ সকল নোটিফিকেশন" 
      />

      {/* Main Header */}
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)} 
        customTitle="নোটিফিকেশন সেন্টার"
      />

      {/* Sidebar Mobile Navigation Drawer */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(view) => {
          setIsSidebarOpen(false);
          navigate(`/${view}`);
        }}
        activeItem="notifications"
      />

      {/* Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 py-4">
        <Notifications />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default NotificationCenterPage;
