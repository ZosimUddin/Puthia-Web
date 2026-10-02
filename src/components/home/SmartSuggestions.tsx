import React from "react";
import { motion } from "motion/react";
import { MapPin, TrendingUp, Calendar, ArrowRight, Hospital, Store, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ContextualRecommendations from "../common/ContextualRecommendations";

const SmartSuggestions: React.FC = () => {
  const navigate = useNavigate();

  const suggestions = [
    {
      title: "কাছাকাছি হাসপাতাল",
      desc: "জরুরি অবস্থায় দ্রুত চিকিৎসা সেবা পেতে",
      icon: <Hospital size={24} />,
      color: "text-rose-600",
      bg: "bg-rose-50",
      borderColor: "border-rose-100",
      path: "/health"
    },
    {
      title: "জনপ্রিয় ব্যবসা",
      desc: "পুঠিয়ার সেরা রেটেড ব্যবসাগুলো দেখুন",
      icon: <Store size={24} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      borderColor: "border-emerald-100",
      path: "/business"
    },
    {
      title: "চলমান ইভেন্ট",
      desc: "উপজেলায় কি কি ইভেন্ট চলছে জেনে নিন",
      icon: <Calendar size={24} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
      borderColor: "border-amber-100",
      path: "/events"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 mt-20 mb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">স্মার্ট পরামর্শ</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-emerald-950">
            আপনার জন্য বিশেষ প্রস্তাবনা
          </h2>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-600">
          <MapPin size={14} className="animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-wider">পুঠিয়া, রাজশাহী</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`p-8 rounded-[32px] border ${s.borderColor} bg-white shadow-sm hover:shadow-md hover:shadow-emerald-900/5 transition-all group cursor-pointer relative overflow-hidden`}
            onClick={() => navigate(s.path)}
          >
            {/* Background Icon Decoration */}
            <div className={`absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12 group-hover:scale-150 transition-transform duration-700 ${s.color}`}>
              {s.icon}
            </div>

            <div className={`w-16 h-16 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
              {s.icon}
            </div>
            
            <h3 className="text-xl font-black text-emerald-950 mb-3 tracking-tight">{s.title}</h3>
            <p className="text-sm font-bold text-gray-500 mb-8 leading-relaxed">
              {s.desc}
            </p>
            
            <div className="flex items-center gap-2 text-xs font-black text-emerald-600 group-hover:gap-4 transition-all">
              বিস্তারিত দেখুন <ArrowRight size={16} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Advanced Recommendation System Banner */}
      <div className="mt-12">
        <ContextualRecommendations category="default" />
      </div>
    </div>
  );
};

export default SmartSuggestions;
