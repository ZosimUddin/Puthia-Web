import React from "react";
import { motion } from "motion/react";
import { History, Heart, CalendarCheck, Megaphone, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PersonalizedHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const quickLinks = [
    { label: "সম্প্রতি দেখা", icon: <History size={20} />, color: "text-blue-600", bg: "bg-blue-50", path: "/profile" },
    { label: "প্রিয় তালিকা", icon: <Heart size={20} />, color: "text-rose-600", bg: "bg-rose-50", path: "/profile" },
    { label: "আমার বুকিং", icon: <CalendarCheck size={20} />, color: "text-amber-600", bg: "bg-amber-50", path: "/profile" },
    { label: "আমার বিজ্ঞাপন", icon: <Megaphone size={20} />, color: "text-indigo-600", bg: "bg-indigo-50", path: "/marketplace/my-listings" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 mt-12 mb-8">
      <div className="bg-white rounded-[40px] p-8 border border-emerald-100/50 shadow-md shadow-emerald-950/5 relative overflow-hidden">
        {/* User Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                স্বাগতম, {user.displayName?.split(' ')[0] || 'ইউজার'}!
              </span>
            </div>
            <h2 className="text-2xl font-black text-emerald-950">
              আপনার জন্য বিশেষ কিছু
            </h2>
          </div>
          
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-black text-emerald-600 hover:text-emerald-700 transition-colors group"
          >
            আমার ড্যাশবোর্ড <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <motion.button
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(link.path)}
              className="flex flex-col items-center gap-4 p-6 rounded-[32px] border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-emerald-100 hover:shadow-md hover:shadow-emerald-900/5 transition-all text-center group"
            >
              <div className={`w-14 h-14 ${link.bg} ${link.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {link.icon}
              </div>
              <span className="text-xs font-black text-gray-700 tracking-tight">{link.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedHome;
