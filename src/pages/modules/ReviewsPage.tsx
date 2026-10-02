import React from "react";
import { motion } from "motion/react";
import { Star, ShieldAlert, ArrowLeft, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import GlobalReviewSystem from "../../components/GlobalReviewSystem";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";
import SEO from "../../components/SEO";

export default function ReviewsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <SEO
        title="নাগরিক রিভিউ ও ফিডব্যাক | আমাদের পুঠিয়া"
        description="আমাদের পুঠিয়া স্মার্ট পোর্টালে আপনার মূল্যবান অভিজ্ঞতা ও রিভিউ প্রদান করুন। আপনার ফিডব্যাক আমাদের সেবার মান বৃদ্ধিতে সাহায্য করে।"
        path="/reviews"
      />

      <Header />

      {/* Full-width Unified Hero Header */}
      <UnifiedHeroHeader
        title="নাগরিক রিভিউ ও ফিডব্যাক"
        subtitle="আমাদের সেবা সম্পর্কে আপনার মূল্যবান অভিজ্ঞতা ও মতামত জানান। আপনার ফিডব্যাক আমাদের সেবার মান উন্নত করতে সাহায্য করে।"
        badgeText="নাগরিক রিভিউ ও ফিডব্যাক পোর্টাল"
        icon={<Star size={24} className="fill-amber-400 text-amber-400" />}
        showBack={true}
        rightAction={
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("লিংক শেয়ারের জন্য কপি করা হয়েছে!");
            }}
            className="py-1.5 px-3 bg-white hover:bg-emerald-50 text-[#006a4e] text-xs font-black rounded-xl flex items-center gap-1 shadow-md border-none cursor-pointer transition-all active:scale-95"
          >
            <Share2 size={15} className="text-[#006a4e] stroke-[2.5]" />
            <span>শেয়ার করুন</span>
          </button>
        }
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-40 flex-1 w-full space-y-8 relative z-10">
        {/* Real-time Global Review Component */}
        <GlobalReviewSystem
          itemId="puthia_portal_general"
          itemName="আমাদের পুঠিয়া ডিজিটাল পোর্টাল"
          itemCategory="portal"
          title="পোর্টালে নাগরিকদের মতামত ও পর্যালোচনা"
          subtitle="যাচাইকৃত নাগরিক রিভিউ, উপযোগী ভোট ও অভিজ্ঞতা"
        />

        {/* Community Guidelines Footer Card */}
        <section className="bg-slate-900 rounded-3xl p-6 text-white space-y-3">
          <h3 className="text-sm font-black text-emerald-400 flex items-center gap-2">
            <ShieldAlert size={18} />
            <span>কমিউনিটি রিভিউ নীতিমালা</span>
          </h3>
          <ul className="text-xs text-slate-300 font-medium space-y-2 list-disc list-inside">
            <li>সত্য ও শালীন ভাষা ব্যবহার করে অভিজ্ঞতা বর্ণনা করুন।</li>
            <li>স্প্যাম, মিথ্যা তথ্য, বা বাণিজ্যিক বিজ্ঞাপন দেওয়া থেকে বিরত থাকুন।</li>
            <li>ব্যক্তিগত আক্রমণ বা কারও গোপনীয়তা ভঙ্গ সংক্রান্ত পোস্ট রিপোর্ট করা হবে।</li>
          </ul>
        </section>
      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
}
