import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, ChevronRight, ArrowRight, AlertCircle, Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import Skeleton from "./Skeleton";

interface NoticeItem {
  id: string;
  text: string;
  category?: string;
  severity?: string;
  isPinned?: boolean;
  createdAt?: any;
}

export const LiveUpdatesSection: React.FC = () => {
  const navigate = useNavigate();
  
  // Real-time states
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  
  const [loading, setLoading] = useState({
    notices: true
  });

  // Selected Notice Modal State
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  // 1. Real-time Notices Listener
  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"), limit(4));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: NoticeItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({ id: docSnap.id, ...data } as NoticeItem);
      });
      setNotices(list);
      setLoading(prev => ({ ...prev, notices: false }));
    }, (error) => {
      console.error("Error loading notices for Live Updates Section:", error);
      setLoading(prev => ({ ...prev, notices: false }));
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, []);

  // Helpers
  const getSeverityStyles = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "warning":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "success":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default:
        return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-12">
      {/* Title Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
        </span>
        <h2 className="text-xl md:text-3xl font-black text-emerald-950 flex items-center gap-2">
          লাইভ তথ্য ও সেবা হাব <span className="text-[10px] md:text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Real-time</span>
        </h2>
      </div>

      {/* Centered Notice Board */}
      <div className="max-w-3xl mx-auto">
        
        {/* Module 1: Live Notices */}
        <div className="bg-white rounded-[32px] p-6 border border-emerald-100/50 shadow-lg shadow-emerald-950/5 hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden h-[420px]">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-emerald-950">ঘোষণা ও নোটিশ বোর্ড</h3>
                  <p className="text-[10px] font-bold text-gray-400">সর্বশেষ উপজেলা বিজ্ঞপ্তি</p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/notice")}
                className="text-[11px] font-black text-emerald-600 hover:underline flex items-center gap-0.5"
              >
                সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading.notices ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 p-3 bg-gray-50/70 rounded-2xl border border-gray-100">
                    <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-full rounded-full" />
                      <Skeleton className="h-3 w-2/3 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                <AlertCircle className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-xs font-bold">বর্তমানে কোনো সচল নোটিশ নেই</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice)}
                    className="p-3 bg-gray-50/70 hover:bg-emerald-50/40 rounded-2xl border border-gray-100 hover:border-emerald-200 cursor-pointer transition-all flex gap-3 group"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${getSeverityStyles(notice.severity)}`}>
                      <Info className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-700 line-clamp-2 leading-relaxed group-hover:text-emerald-950">
                        {notice.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-full border border-gray-100 text-gray-400">
                          {notice.category || "সাধারণ"}
                        </span>
                        {notice.isPinned && (
                          <span className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full">
                            পিন্ড
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-50 pt-3 flex justify-end">
            <button 
              onClick={() => navigate("/notice")}
              className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-1"
            >
              নোটিশ বোর্ডে প্রবেশ করুন <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Selected Notice Detail Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] border border-slate-100 shadow-md p-6 w-full max-w-md relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${getSeverityStyles(selectedNotice.severity)}`}>
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">নোটিশের বিবরণ</h4>
                    <span className="text-[10px] font-bold text-slate-400">
                      শ্রেণী: {selectedNotice.category || "সাধারণ ঘোষণা"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center border border-slate-100 transition-colors"
                >
                  &times;
                </button>
              </div>

              <div className="py-4 border-t border-b border-slate-50">
                <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedNotice.text}
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-2xl transition-colors"
                >
                  বন্ধ করুন
                </button>
                {selectedNotice.category === "জরুরি" && (
                  <button
                    onClick={() => navigate("/emergency")}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl transition-colors"
                  >
                    জরুরি সাহায্য
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
