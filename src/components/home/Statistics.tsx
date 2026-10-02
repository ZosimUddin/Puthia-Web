import React, { useState, useEffect, useRef } from "react";
import { Users, Briefcase, HandHelping, Eye, BarChart3 } from "lucide-react";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { motion, useInView, animate } from "motion/react";

import SectionHeader from "./SectionHeader";

const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 0.3 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  useEffect(() => {
    if (!isInView || !value) return;

    const controls = animate(0, value, {
      duration: duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        setDisplayValue(Math.floor(latest));
      }
    });

    return () => controls.stop();
  }, [value, isInView, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue.toLocaleString("bn-BD")}
    </span>
  );
};

const Statistics: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 1254,
    totalInfo: 4521,
    dailyVisits: 5404,
    totalBusiness: 1832,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to real-time stats document if it exists, otherwise use fallback values
    const unsub = onSnapshot(doc(db, "stats", "overall"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({
          totalUsers: data.totalUsers || 1254,
          totalInfo: data.totalInfo || 4521,
          dailyVisits: data.dailyVisits || 5404,
          totalBusiness: data.totalBusiness || 1832,
        });
      } else {
        // Fallback default requested values
        setStats({
          totalUsers: 1254,
          totalInfo: 4521,
          dailyVisits: 5404,
          totalBusiness: 1832,
        });
      }
      setLoading(false);
    }, (error) => {
      console.warn("Could not fetch real-time stats", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const statCards = [
    {
      id: "business",
      label: "মোট ব্যবসা",
      value: stats.totalBusiness,
      icon: <Briefcase size={24} />,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-100/50",
    },
    {
      id: "services",
      label: "সেবা ও তথ্য",
      value: stats.totalInfo,
      icon: <HandHelping size={24} />,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100/50",
    },
    {
      id: "citizens",
      label: "নিবন্ধিত নাগরিক",
      value: stats.totalUsers,
      icon: <Users size={24} />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-100/50",
    },
    {
      id: "visitors",
      label: "সর্বমোট ভিজিটর",
      value: stats.dailyVisits ? 85287 : 85287,
      icon: <Eye size={24} />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-100/50",
    },
  ];

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full" id="statistics-section">
      <SectionHeader 
        title="একনজরে পুঠিয়া" 
        subtitle="গুরুত্বপূর্ণ পরিসংখ্যান"
        icon={<BarChart3 size={24} />}
        buttonText=""
        className="!mb-4 sm:!mb-6"
      />

      <div className="bg-[#F7FAF8] rounded-[20px] border border-emerald-100/50 p-4 md:p-5 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              className={`bg-white ${card.borderColor} border p-4 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_-4px_rgba(5,150,105,0.08)] hover:-translate-y-1 hover:border-emerald-200/50 transition-all duration-300 group relative overflow-hidden h-full`}
            >
              <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-slate-50/50 rounded-full blur-xl group-hover:bg-emerald-50/50 transition-colors" />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 relative z-10">
                <div className={`w-10 h-10 ${card.bgColor} ${card.textColor} rounded-[12px] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all border ${card.borderColor} shrink-0`}>
                  {React.cloneElement(card.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                
                <div className="space-y-1.5 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-700 tracking-tight truncate">
                    {card.label}
                  </p>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                      {loading ? "..." : <AnimatedCounter value={card.value} />}
                    </h3>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
