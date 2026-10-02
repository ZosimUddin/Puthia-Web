import React, { useState, useEffect } from "react";
import { ArrowLeft, Phone, Globe, Camera, Edit3, Search, Star, Send, Loader2, CheckCircle2 } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

export function ProvideFeedbackInfo({ onGoBack }: { onGoBack: () => void }) {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("tab1");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recentFeedbacks, setRecentFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentFeedbacks(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "feedbacks"), {
        userId: user?.uid || "anonymous",
        userName: userProfile?.name || "অজ্ঞাত ইউজার",
        userPhoto: userProfile?.photoURL || null,
        text: feedback,
        rating: rating,
        type: activeTab === 'tab3' ? 'review' : 'suggestion',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setFeedback("");
      setRating(0);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "feedbacks");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans space-y-6 pb-6">
      
      {/* Hero Banner Section */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #4A148C, #7B1FA2)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">আপনার মতামত, আমাদের অনুপ্রেরণা</p>
          <h1 className="text-4xl font-black mb-3 text-white">পরামর্শ ও মতামত</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             পুঠিয়া উপজেলার যেকোনো উন্নয়নমূলক কাজের আইডিয়া বা আমাদের এই ডিজিটাল অ্যাপ নিয়ে আপনার মূল্যবান সুচিন্তিত মতামত জানান।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Quick Select Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('tab1')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab1' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">💬</span> নতুন পরামর্শ
        </button>
        <button 
          onClick={() => setActiveTab('tab2')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab2' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📊</span> নাগরিক পোল/ভোট
        </button>
        <button 
          onClick={() => setActiveTab('tab3')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab3' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🌟</span> অ্যাপ রিভিউ
        </button>
        <button 
          onClick={() => setActiveTab('tab4')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab4' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">💡</span> আইডিয়া বক্স
        </button>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-black text-emerald-900 mb-2">ধন্যবাদ!</h3>
              <p className="text-emerald-700 font-medium">আপনার মূল্যবান মতামতটি সফলভাবে জমা দেওয়া হয়েছে।</p>
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            >
              <form onSubmit={handleSubmitFeedback} className="space-y-5">
                {activeTab === 'tab3' && (
                  <div className="flex flex-col items-center gap-3 mb-6">
                    <p className="font-bold text-gray-700">অ্যাপ রেটিং দিন</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform active:scale-90"
                        >
                          <Star 
                            className={`w-10 h-10 ${
                              (hoverRating || rating) >= star 
                                ? "fill-amber-400 text-emerald-500" 
                                : "text-gray-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {activeTab === 'tab3' ? 'আপনার অভিজ্ঞতা লিখুন' : 'আপনার মতামত বা আইডিয়া লিখুন'}
                  </label>
                  <textarea 
                    value={feedback || ""}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="এখানে বিস্তারিত লিখুন..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#4A148C]/20 transition-all min-h-[150px] text-gray-800"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || !feedback}
                  className="w-full bg-[#4A148C] hover:bg-[#7B1FA2] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#4A148C]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {activeTab === 'tab3' ? 'রিভিউ জমা দিন' : 'মতামত পাঠান'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Feedbacks */}
        <div className="mt-10">
          <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
            সাম্প্রতিক মতামত
          </h3>
          <div className="space-y-4">
            {recentFeedbacks.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {item.userPhoto ? (
                      <img src={item.userPhoto} alt={item.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#4A148C] text-white flex items-center justify-center font-bold">
                        {item.userName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{item.userName}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= (item.rating || 0) ? "fill-amber-400 text-emerald-500" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">"{item.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
