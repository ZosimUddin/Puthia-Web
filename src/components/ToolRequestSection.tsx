import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, PenSquare, Send, CheckCircle2, AlertCircle, Loader2, 
  Sparkles, User, Phone, FileText, ChevronDown, ChevronUp, Wrench
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface ToolRequest {
  id: string;
  toolName: string;
  description: string;
  userName: string;
  userPhone: string;
  createdAt: string;
}

export default function ToolRequestSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [recentRequests, setRecentRequests] = useState<ToolRequest[]>([]);
  const [isFetchingRequests, setIsFetchingRequests] = useState(false);

  // Fetch recent requested tools to show community ideas
  const fetchRecentRequests = async () => {
    setIsFetchingRequests(true);
    try {
      const q = query(
        collection(db, 'tool_requests'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const requests: ToolRequest[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          toolName: data.toolName || '',
          description: data.description || '',
          userName: data.userName || '',
          userPhone: data.userPhone || '',
          createdAt: data.createdAt || '',
        });
      });
      setRecentRequests(requests);
    } catch (error) {
      console.warn('Failed to fetch tool requests from Firestore:', error);
      // Fallback to local default ideas if offline/firestore not seeded yet
      setRecentRequests([
        {
          id: '1',
          toolName: 'জমি বণ্টন ও হিস্যা ক্যালকুলেটর',
          description: 'উত্তরাধিকারীদের মধ্যে শতাংশ বা কাঠা অনুযায়ী সঠিক জমি বণ্টন করা।',
          userName: 'আরিফ হাসান',
          userPhone: '',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          toolName: 'পারিবারিক সঞ্চয় ও বাজেট ট্র্যাকার',
          description: 'মাসিক আয় ও ব্যয়ের ভিত্তিতে কত টাকা সঞ্চয় করা সম্ভব তার একটি হিসাব।',
          userName: 'সাবিহা সুলতানা',
          userPhone: '',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsFetchingRequests(false);
    }
  };

  useEffect(() => {
    fetchRecentRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim() || !description.trim()) {
      setErrorMessage('দয়া করে টুলের নাম এবং বিবরণ লিখুন।');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const payload = {
      toolName: toolName.trim(),
      description: description.trim(),
      userName: userName.trim() || 'বেনামী ব্যবহারকারী',
      userPhone: userPhone.trim() || '',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'tool_requests'), payload);
      setIsSuccess(true);
      setToolName('');
      setDescription('');
      setUserName('');
      setUserPhone('');
      fetchRecentRequests();
    } catch (error: any) {
      try {
        handleFirestoreError(error, OperationType.CREATE, 'tool_requests');
      } catch (formattedErr: any) {
        setErrorMessage('অনুরোধ পাঠাতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="tool-request-container" className="mt-8 mb-6 font-sans">
      <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-[24px] p-6 shadow-sm relative overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-emerald-500/5 rounded-full pointer-events-none" />
        
        {/* Header Section */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 shrink-0">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-[16px] font-black text-slate-800">আপনার প্রয়োজনীয় টুলটি খুঁজে পাচ্ছেন না?</h3>
            <p className="text-[12px] font-bold text-slate-500 mt-1 leading-relaxed">
              নতুন কোনো টুলের আইডিয়া সমূহথাকলে আমাদের জানান। ব্যবহারকারীদের সুবিধার্থে আমরা আপনার আইডিয়া সমূহঅনুযায়ী নতুন টুল যুক্ত করব!
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        {!isExpanded && !isSuccess && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setIsExpanded(true)}
              className="bg-[#009664] hover:bg-[#007f54] text-white font-bold text-[13px] px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 group"
            >
              <PenSquare size={16} className="group-hover:rotate-12 transition-transform" />
              ✍️ নতুন টুলের অনুরোধ করুন
            </button>
          </div>
        )}

        {/* Expandable Form Component */}
        <AnimatePresence>
          {isExpanded && !isSuccess && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="mt-6 border-t border-emerald-100/60 pt-5 space-y-4 overflow-hidden"
            >
              <h4 className="text-[14px] font-black text-slate-700 flex items-center gap-1.5 mb-2">
                <Wrench size={16} className="text-emerald-600" />
                টুল অনুরোধ ফরম
              </h4>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[12px] font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black text-slate-600 mb-1 flex items-center gap-1">
                    টুলের নাম <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={toolName || ""}
                      onChange={(e) => setToolName(e.target.value)}
                      placeholder="উদা: জমি বণ্টন ক্যালকুলেটর"
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-9 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <FileText size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-black text-slate-600 mb-1">
                    আপনার নাম (ঐচ্ছিক)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userName || ""}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="উদা: করিম আহমেদ"
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-9 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-black text-slate-600 mb-1 flex items-center gap-1">
                  টুলের বিবরণ ও এটি কীভাবে কাজ করবে <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description || ""}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="টুলটি কীভাবে কাজ করবে এবং এর মূল বিষয়গুলো কী কী তা বিস্তারিত লিখুন..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black text-slate-600 mb-1">
                    মোবাইল নম্বর (ঐচ্ছিক)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={userPhone || ""}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="উদা: ০১৭xxxxxxxx"
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-9 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="flex items-end justify-end gap-2 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-[13px] px-5 py-3 rounded-xl transition-all"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#009664] hover:bg-[#007f54] text-white font-bold text-[13px] px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        অপেক্ষা করুন...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        অনুরোধ পাঠান
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Success State */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="mt-5 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-[18px] text-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-[#009664] mx-auto mb-3">
                <CheckCircle2 size={28} />
              </div>
              <h4 className="text-[15px] font-black text-emerald-800">অনুরোধটি সফলভাবে জমা হয়েছে!</h4>
              <p className="text-[12px] font-bold text-emerald-600 mt-1">
                আপনার মূল্যবান আইডিয়ার জন্য ধন্যবাদ। আমাদের টিম খুব শীঘ্রই এই টুলের কার্যকারিতা পর্যালোচনা করে এটি যুক্ত করার ব্যবস্থা করবে।
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setIsExpanded(false);
                }}
                className="mt-4 bg-[#009664] text-white font-bold text-[12px] px-4 py-2 rounded-lg hover:bg-[#007f54] transition-all"
              >
                ঠিক আছে
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Community Requests List */}
      {recentRequests.length > 0 && (
        <div className="mt-6 bg-white border border-slate-100 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[14px] font-black text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              ব্যবহারকারীদের নতুন টুলের আইডিয়া সমূহ
            </h4>
            <span className="text-[11px] font-bold text-slate-400">সর্বশেষ {recentRequests.length}টি</span>
          </div>

          <div className="space-y-3">
            {recentRequests.map((req, idx) => (
              <motion.div 
                key={req.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100/80 rounded-xl transition-all"
              >
                <div className="flex justify-between items-start gap-2">
                  <h5 className="text-[13px] font-black text-slate-800 flex items-center gap-1.5">
                    💡 {req.toolName}
                  </h5>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/60 text-emerald-700">
                    বিবেচনাধীন
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-1.5 leading-relaxed pl-5">
                  {req.description}
                </p>
                <div className="flex items-center gap-1 mt-2 pl-5 text-[10px] font-bold text-slate-400">
                  <span>অনুরোধকারী: {req.userName}</span>
                  <span>•</span>
                  <span>{new Date(req.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
