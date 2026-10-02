import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, GraduationCap, Award, Users, 
  Calendar, Clock, Zap, BookOpen, Star, ArrowRight
} from "lucide-react";
import { db } from "../../firebase";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";

export default function TrainingSection() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, "trainings"), 
      where("isFeatured", "==", true),
      limit(4)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrainings(list);
      setLoading(false);
    }, (error) => {
      if (error?.message?.includes("Quota") || error?.code === "resource-exhausted") {
        console.warn("Firestore quota limit reached for featured trainings.");
      } else {
        console.warn("Error fetching featured trainings:", error?.message || error);
      }
      setLoading(false);
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, []);

  if (!loading && trainings.length === 0) return null;

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <SectionHeader
        title="দক্ষতা উন্নয়ন"
        subtitle="সেরা প্রশিক্ষণ কোর্স"
        icon={<GraduationCap size={24} />}
        buttonText="সবগুলো কোর্স"
        onButtonClick={() => navigate("/training")}
      />

      <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="min-w-[280px] h-64 bg-slate-100 rounded-[20px] animate-pulse"></div>
          ))
        ) : (
          trainings.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate("/training")}
              className="w-[280px] sm:w-[320px] h-[350px] shrink-0 bg-white rounded-[20px] border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_-4px_rgba(5,150,105,0.08)] hover:-translate-y-1.5 hover:border-emerald-200/50 transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-32 overflow-hidden shrink-0">
                <img 
                  src={t.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800"} 
                  alt={t.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute bottom-3 left-4 flex gap-2">
                   {t.certification && (
                     <span className="px-2 py-0.5 bg-amber-400 text-slate-900 rounded-lg text-[8px] font-black uppercase tracking-wider">সনদপ্রাপ্ত</span>
                   )}
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800 leading-tight line-clamp-2 min-h-[2.5rem]">{t.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.organizer}</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-black">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{t.fee}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px]">
                    <Clock className="w-3 h-3" />
                    <span>{t.duration}</span>
                  </div>
                </div>

                <div className="mt-auto pt-1">
                  <button className="w-full h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer">
                    <span>আরও দেখুন</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div 
        className="bg-emerald-600 rounded-[20px] p-6 text-white relative overflow-hidden group cursor-pointer mt-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_-4px_rgba(5,150,105,0.4)] hover:-translate-y-0.5 transition-all duration-300" 
        onClick={() => navigate("/training")}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black leading-tight">নতুন দক্ষতা শিখুন</h3>
            <p className="text-xs font-medium text-emerald-100 opacity-80">ঘরে বসেই ক্যারিয়ার গড়ুন</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-[12px] flex items-center justify-center backdrop-blur-md shrink-0">
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>
      </div>
    </section>
  );
}
