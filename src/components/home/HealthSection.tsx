import React from "react";
import {
  HeartPulse,
  Stethoscope,
  Phone,
  ChevronRight,
  Activity,
  Clock
} from "lucide-react";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";

import { useNavigate } from "react-router-dom";

const HealthSection: React.FC = () => {
  const navigate = useNavigate();
  const doctors = [
    {
      name: "ডাঃ মোঃ আমিনুল হক",
      specialty: "মেডিসিন বিশেষজ্ঞ",
      phone: "01712421712",
      available: "সকাল ১০টা - দুপুর ২টা",
    },
    {
      name: "ডাঃ রেহানা পারভীন",
      specialty: "গাইনী ও স্ত্রী রোগ বিশেষজ্ঞ",
      phone: "01715451234",
      available: "বিকাল ৪টা - সন্ধ্যা ৮টা",
    }
  ];

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full" id="health-section">
      <SectionHeader
        title="স্বাস্থ্যসেবা"
        subtitle="ডাক্তার ও হাসপাতালের তথ্য"
        icon={<Stethoscope size={24} />}
        buttonText="বিস্তারিত"
        onButtonClick={() => navigate("/health")}
      />

      <div className="bg-[#F8FFF9] rounded-[20px] border border-emerald-100/50 p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hospital Card */}
          <div className="bg-emerald-600 rounded-[20px] p-8 md:p-10 text-white relative overflow-hidden shadow-md shadow-emerald-100/10 group flex flex-col justify-between">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700 blur-2xl" />
            
            <div className="relative z-10">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-[12px] flex items-center justify-center mb-4 shrink-0">
                <HeartPulse size={24} className="md:w-10 md:h-10" />
              </div>
              <h3 className="text-2xl md:text-5xl font-black mb-4 tracking-tight">
                উপজেলা স্বাস্থ্য কমপ্লেক্স
              </h3>
              <p className="text-emerald-50 text-sm md:text-2xl font-medium mb-8 leading-relaxed max-w-sm md:max-w-xl">
                পুঠিয়ার প্রধান সরকারি হাসপাতাল, যেখানে ২৪ ঘণ্টা জরুরি চিকিৎসা সেবা প্রদান করা হয়। সকল প্রয়োজনীয় টেস্ট ও ইনডোর সুবিধা বিদ্যমান।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <a
                href="tel:01762691345"
                className="flex items-center justify-center gap-3 px-8 h-12 md:h-16 min-h-[48px] bg-white text-emerald-600 rounded-[14px] font-black text-[16px] md:text-2xl hover:bg-emerald-50 transition-all shadow-md"
              >
                <Phone size={24} fill="currentColor" className="md:w-8 md:h-8" /> জরুরি কল
              </a>
              <button 
                onClick={() => navigate("/health")}
                className="flex items-center justify-center gap-3 px-8 h-12 md:h-16 min-h-[48px] bg-white/10 text-white rounded-[14px] font-black text-[16px] md:text-2xl backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
              >
                বিস্তারিত দেখুন
              </button>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm md:text-2xl font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 md:w-4 md:h-4 bg-emerald-500 rounded-full animate-pulse" /> পুঠিয়ার অভিজ্ঞ ডাক্তারগণ
            </h4>
            
            {doctors.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white p-6 md:p-10 rounded-[20px] border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_-4px_rgba(16,185,129,0.08)] hover:-translate-y-1 hover:border-emerald-200/50 transition-all duration-300 flex items-center gap-6 group"
              >
                <div className="w-10 h-10 md:w-20 md:h-20 bg-emerald-50 text-emerald-600 rounded-[12px] flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0 shadow-sm">
                  <Stethoscope size={24} className="md:w-10 md:h-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base md:text-3xl font-black text-slate-900 leading-tight truncate">
                    {doc.name}
                  </h4>
                  <p className="text-xs md:text-xl font-black text-emerald-600 mb-2 uppercase tracking-wide">
                    {doc.specialty}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] md:text-lg font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-emerald-400 md:w-5 md:h-5" /> {doc.available}
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${doc.phone}`}
                  className="w-12 h-12 md:w-20 md:h-20 min-h-[48px] bg-emerald-50 text-emerald-600 rounded-[14px] flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm shrink-0"
                >
                  <Phone size={24} fill="currentColor" className="md:w-10 md:h-10" />
                </a>
              </motion.div>
            ))}
            
            <button 
              onClick={() => navigate("/health")}
              className="mt-2 w-full h-12 md:h-20 min-h-[48px] bg-white border-2 border-emerald-50 border-dashed text-emerald-600 rounded-[14px] font-black text-[16px] md:text-2xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              আরও ডাক্তার দেখুন <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform md:w-8 md:h-8" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthSection;
