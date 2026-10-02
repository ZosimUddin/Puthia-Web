import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Phone,
  Truck,
  Flame,
  Stethoscope,
  Zap,
  Droplets,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

interface EmergencyContact {
  id: string;
  label: string;
  phone: string;
}

const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "ambulance",
    label: "অ্যাম্বুলেন্স",
    phone: "01712421712",
  },
  {
    id: "police",
    label: "পুলিশ (থানা)",
    phone: "01713373516",
  },
  {
    id: "fire",
    label: "ফায়ার সার্ভিস",
    phone: "01730336699",
  },
  {
    id: "hospital",
    label: "হাসপাতাল",
    phone: "01762691345",
  },
  {
    id: "electricity",
    label: "বিদ্যুৎ অফিস",
    phone: "01769400000",
  },
  {
    id: "water",
    label: "পানি সরবরাহ",
    phone: "01718466380",
  },
];

const getIconForId = (id: string) => {
  switch (id) {
    case "ambulance": return <Truck className="w-5 h-5 stroke-[2]" />;
    case "police": return <ShieldAlert className="w-5 h-5 stroke-[2]" />;
    case "fire": return <Flame className="w-5 h-5 stroke-[2]" />;
    case "hospital": return <Stethoscope className="w-5 h-5 stroke-[2]" />;
    case "electricity": return <Zap className="w-5 h-5 stroke-[2]" />;
    case "water": return <Droplets className="w-5 h-5 stroke-[2]" />;
    default: return <Phone className="w-5 h-5 stroke-[2]" />;
  }
};

const getCardStyles = (id: string) => {
  switch (id) {
    case "ambulance":
      return {
        bg: "bg-white border-slate-100",
        iconBg: "bg-red-50 text-red-500",
        numberColor: "text-red-500",
        btnStyles: "bg-red-50/50 hover:bg-red-100/70 border-red-100/50 text-red-600"
      };
    case "police":
      return {
        bg: "bg-white border-slate-100",
        iconBg: "bg-[#e8f5e9] text-[#2e7d32]",
        numberColor: "text-[#2e7d32]",
        btnStyles: "bg-[#e8f5e9]/50 hover:bg-[#e8f5e9]/80 border-[#c8e6c9] text-[#2e7d32]"
      };
    case "fire":
      return {
        bg: "bg-white border-slate-100",
        iconBg: "bg-red-50 text-red-500",
        numberColor: "text-red-500",
        btnStyles: "bg-red-50/50 hover:bg-red-100/70 border-red-100/50 text-red-600"
      };
    case "hospital":
      return {
        bg: "bg-white border-slate-100",
        iconBg: "bg-[#e0f2f1] text-[#00796b]",
        numberColor: "text-[#00796b]",
        btnStyles: "bg-[#e0f2f1]/50 hover:bg-[#e0f2f1]/80 border-[#b2dfdb] text-[#00796b]"
      };
    case "electricity":
      return {
        bg: "bg-white border-slate-100",
        iconBg: "bg-[#fff8e1] text-[#f57f17]",
        numberColor: "text-[#f57f17]",
        btnStyles: "bg-[#fff8e1]/50 hover:bg-[#fff8e1]/80 border-[#ffe082] text-[#f57f17]"
      };
    case "water":
      return {
        bg: "bg-white border-slate-100",
        iconBg: "bg-[#e3f2fd] text-[#1565c0]",
        numberColor: "text-[#1565c0]",
        btnStyles: "bg-[#e3f2fd]/50 hover:bg-[#e3f2fd]/80 border-[#bbdefb] text-[#1565c0]"
      };
    default:
      return {
        bg: "bg-white border-slate-100",
        iconBg: "bg-slate-50 text-slate-500",
        numberColor: "text-slate-700",
        btnStyles: "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
      };
  }
};

import SectionHeader from "./SectionHeader";

const EmergencySection: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(DEFAULT_EMERGENCY_CONTACTS);

  useEffect(() => {
    const contactsRef = collection(db, "emergency_contacts");
    const unsubscribe = onSnapshot(contactsRef, (snapshot) => {
      if (!snapshot.empty) {
        const list: EmergencyContact[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            label: data.label || "",
            phone: data.phone || "",
          });
        });
        
        const sorted = list.sort((a, b) => {
          const idxA = DEFAULT_EMERGENCY_CONTACTS.findIndex(c => c.id === a.id);
          const idxB = DEFAULT_EMERGENCY_CONTACTS.findIndex(c => c.id === b.id);
          return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
        });
        setContacts(sorted);
      }
    }, (error) => {
      console.warn("Error listening to emergency contacts (offline/quota):", error?.message || error);
      setContacts(DEFAULT_EMERGENCY_CONTACTS);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, []);

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Red Banner Top - Compact & Clean */}
      <div className="bg-gradient-to-br from-[#E11D48] via-[#BE123C] to-[#9F1239] rounded-[18px] p-3 sm:p-4 shadow-md relative overflow-hidden text-center flex flex-col items-center">
        {/* Abstract shapes for depth */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-24 -mb-24 blur-2xl" />
        
        <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 backdrop-blur-xl rounded-full text-white text-[10px] font-black tracking-wider border border-white/20 mb-1.5 shadow-inner uppercase">
            <ShieldAlert size={12} className="text-white animate-pulse" />
            <span>জরুরি সেবা</span>
          </div>

          {/* Single-line or clean Title */}
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-white mb-2 tracking-tight leading-snug text-center">
            আপনার বিপদে আমরা সবসময় পাশে
          </h2>

          {/* National Helpline 999 Button */}
          <a
            href="tel:999"
            className="w-full max-w-[260px] bg-white text-rose-600 rounded-[12px] h-9 min-h-[36px] px-3 shadow-sm flex items-center justify-between gap-2 font-black text-xs sm:text-sm hover:scale-[1.02] active:scale-95 transition-all group cursor-pointer border border-rose-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <Phone size={12} className="fill-current" />
              </div>
              <span className="tracking-tight text-xs sm:text-sm">হেল্পলাইন ৯৯৯</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs group-hover:bg-rose-700 transition-colors shrink-0">
              <ChevronRight size={14} className="stroke-[3]" />
            </div>
          </a>
        </div>
      </div>

      {/* Grid Container */}
      <div className="mt-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 items-stretch">
          {contacts.map((contact, index) => {
            const styles = getCardStyles(contact.id);
            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="bg-white rounded-[20px] p-2.5 sm:p-3 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-red-100/80 transition-all duration-300 flex flex-col items-center justify-between group relative overflow-hidden text-center h-full"
              >
                {/* Colored Icon Container */}
                <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center mb-1.5 ${styles.iconBg} transition-all duration-300 group-hover:scale-105 shrink-0 border border-white shadow-2xs`}>
                  {React.cloneElement(getIconForId(contact.id), { className: "w-4 h-4 stroke-[2]" })}
                </div>

                {/* Title */}
                <h3 className="text-xs font-black text-slate-900 tracking-tight leading-tight mb-0.5 line-clamp-1">
                  {contact.label}
                </h3>

                {/* Phone Number */}
                <p className={`text-[10px] sm:text-[11px] font-bold tracking-tight mb-2 ${styles.numberColor}`}>
                  {contact.phone}
                </p>

                {/* Clean Phone Icon Button */}
                <a
                  href={`tel:${contact.phone}`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-xs hover:scale-110 active:scale-90 border cursor-pointer ${styles.btnStyles}`}
                  title="কল করুন"
                >
                  <Phone size={13} className="fill-current stroke-[2.5]" />
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Recommendation Banner */}
        <div className="bg-[#fff1f2]/90 border border-red-100 rounded-[16px] p-2.5 sm:p-3 flex flex-row items-center justify-between gap-2.5 w-full shadow-[0_2px_12px_rgba(0,0,0,0.03)] mt-4">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-100 text-[#e11d48] rounded-[10px] flex items-center justify-center shrink-0 shadow-2xs border border-red-200/60">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[#be123c] font-black text-xs sm:text-sm tracking-tight leading-snug">
                জরুরি পরামর্শ
              </h4>
              <p className="text-slate-700 font-bold text-[10px] sm:text-xs mt-0.5 leading-snug">
                শুধু জরুরি প্রয়োজনে কল করুন এবং শান্ত থাকুন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-red-200/60 shadow-2xs">
            <Phone size={12} className="text-[#e11d48] fill-current shrink-0" />
            <span className="text-[10px] sm:text-xs font-black text-[#be123c] whitespace-nowrap">২৪/৭ সেবা</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencySection;
