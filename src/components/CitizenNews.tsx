import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, ArrowLeft, Loader2, Newspaper, Camera } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface NewsItem {
  id: string | number;
  title: string;
  time: string;
  loc: string;
  desc: string;
  content: string;
  image: string;
  authorName: string;
  category: string;
  createdAt?: string;
}

export const CitizenNews = ({ onGoBack }: { onGoBack: () => void }) => {
  const [activeTab, setActiveTab] = useState("reports");
  const { user, userProfile, addStars } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Dynamic news loading states
  const [dynamicNews, setDynamicNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // News posting states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("reports");
  const [location, setLocation] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [posting, setPosting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Default beautiful seed news
  const staticNews: NewsItem[] = [
    {
      id: "static_1",
      title: "বানেশ্বর হাইওয়ে সংলগ্ন মোড়ে ফুটপাত দখল, তীব্র যানজটে অতিষ্ঠ পথচারী",
      time: "৪ ঘণ্টা আগে",
      loc: "বানেশ্বর বাজার মোড়",
      desc: "বানেশ্বর বাজারের প্রধান মহাসড়কের পাশে ফুটপাত দখল করে অবৈধ দোকানপাট বসানোর কারণে সাধারণ মানুষ বাধ্য হয়ে মূল রাস্তা দিয়ে হাঁটছেন। এর ফলে প্রতিদিন সকাল ও সন্ধ্যায় তীব্র যানজটের সৃষ্টি হচ্ছে। প্রশাসনের দৃষ্টি আকর্ষণ করছি।",
      content: "বানেশ্বর বাজারের প্রধান মহাসড়কের পাশে ফুটপাত দখল করে অবৈধ দোকানপাট বসানোর কারণে সাধারণ মানুষ বাধ্য হয়ে মূল রাস্তা দিয়ে হাঁটছেন। এর ফলে প্রতিদিন সকাল ও সন্ধ্যায় তীব্র যানজটের সৃষ্টি হচ্ছে। প্রশাসনের দৃষ্টি আকর্ষণ করছি। দ্রুত ফুটপাত অবমুক্ত করে পথচারী বান্ধব পরিবেশ সৃষ্টির দাবি জানাচ্ছে সাধারণ এলাকাবাসী।",
      image: "https://images.unsplash.com/photo-1510006749962-cf76e6255745?auto=format&fit=crop&w=500&q=80",
      authorName: "আরিফুল ইসলাম (সচেতন নাগরিক)",
      category: "reports"
    },
    {
      id: "static_2",
      title: "পুঠিয়া রাজবাড়ী লেকের চারপাশ পরিষ্কার রাখতে নাগরিকদের উদ্যোগ প্রয়োজন",
      time: "গতকাল",
      loc: "পুঠিয়া রাজবাড়ী পার্ক",
      desc: "আমাদের পুঠিয়ার ঐতিহ্যবাহী রাজবাড়ী লেক ও এর আশেপাশের এলাকায় ঘুরতে আসা দর্শনার্থীরা যত্রতত্র চিপসের প্যাকেট, প্লাস্টিকের বোতল ফেলছেন। এতে পরিবেশ নষ্ট হচ্ছে। লেকের সৌন্দর্য রক্ষায় ডাস্টবিন স্থাপন ও সচেতনতা জরুরি।",
      content: "আমাদের পুঠিয়ার ঐতিহ্যবাহী রাজবাড়ী লেক ও এর আশেপাশের এলাকায় ঘুরতে আসা দর্শনার্থীরা যত্রতত্র চিপসের প্যাকেট, প্লাস্টিকের বোতল ফেলছেন। এতে পরিবেশ নষ্ট হচ্ছে। লেকের সৌন্দর্য রক্ষায় ডাস্টবিন স্থাপন ও সচেতনতা জরুরি। উপজেলা প্রশাসনের পাশাপাশি সকল দর্শনার্থীদের এই ঐতিহাসিক সম্পদ রক্ষায় নিজ উদ্যোগে সচেতন হতে হবে।",
      image: "https://images.unsplash.com/photo-1611270418597-a6c77f4b7271?auto=format&fit=crop&w=500&q=80",
      authorName: "সুমাইয়া আক্তার (শিক্ষার্থী)",
      category: "issues"
    },
    {
      id: "static_3",
      title: "তীব্র গরমের হাত থেকে বাঁচতে বেলপুকুরের তরুণদের বৃক্ষরোপণ কর্মসূচি",
      time: "২ দিন আগে",
      loc: "বেলপুকুর ইউনিয়ন",
      desc: "পরিবেশের ভারসাম্য রক্ষা এবং তীব্র দাবদাহের হাত থেকে ভবিষ্যৎ প্রজন্মকে বাঁচাতে বেলপুকুর ইউনিয়নের একদল college-পড়ুয়া তরুণ নিজ উদ্যোগে রাস্তার দুই পাশে প্রায় শতাধিক ছায়াদানকারী বৃক্ষরোপণ করেছে। তরুণদের এই উদ্যোগ প্রশংসনীয়।",
      content: "পরিবেশের ভারসাম্য রক্ষা এবং তীব্র দাবদাহের হাত থেকে ভবিষ্যৎ প্রজন্মকে বাঁচাতে বেলপুকুর ইউনিয়নের একদল কলেজপড়ুয়া তরুণ নিজ উদ্যোগে রাস্তার দুই পাশে প্রায় শতাধিক ছায়াদানকারী বৃক্ষরোপণ করেছে। তরুণদের এই উদ্যোগ প্রশংসনীয়। স্থানীয় ইউনিয়ন পরিষদ ও বন বিভাগের সহায়তা নিয়ে তারা আরো ব্যাপক পরিসরে এই সবুজায়ন কর্মসূচি চালানোর লক্ষ্য স্থির করেছে।",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=500&q=80",
      authorName: "রাসেল আহমেদ (যুবক)",
      category: "awareness"
    }
  ];

  // Fetch news from Firestore based on active category tab
  const fetchNews = async () => {
    if (activeTab === 'submit') return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "citizen_news"),
        where("category", "==", activeTab),
        where("status", "==", "approved")
      );
      const querySnapshot = await getDocs(q);
      const items: NewsItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as NewsItem);
      });
      // Sort dynamic news by createdAt desc (newest first)
      items.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setDynamicNews(items);
    } catch (err) {
      console.error("Error loading citizen news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [activeTab]);

  // Handle local image upload as base64 preview
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit news post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!title.trim() || !category || !location.trim() || !content.trim()) {
      setErrorMsg("অনুগ্রহ করে সকল তারকা চিহ্নিত (*) ঘর সঠিকভাবে পূরণ করুন।");
      return;
    }

    setPosting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const newsData = {
        uid: user.uid,
        title: title.trim(),
        category,
        content: content.trim(),
        desc: content.trim().substring(0, 150) + (content.trim().length > 150 ? "..." : ""),
        loc: location.trim(),
        image: imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=500&q=80",
        authorName: userProfile?.name || "সচেতন নাগরিক",
        authorPhone: userProfile?.phone || "N/A",
        status: "pending",
        createdAt: new Date().toISOString(),
        time: "এইমাত্র"
      };

      await addDoc(collection(db, "citizen_news"), newsData);
      
      // Award 5 points
      await addStars(5);

      setSuccessMsg("আপনার সংবাদটি সফলভাবে পাঠানো হয়েছে এবং এটি অ্যাডমিনের অনুমোদনের অপেক্ষায় আছে! ৫ সিভিক ইস্টার লাভ করেছেন! 🎉");
      setTitle("");
      setLocation("");
      setContent("");
      setImageUrl("");
      
      // Switch back to reports category to see the live post
      setTimeout(() => {
        setActiveTab("reports");
      }, 2500);

    } catch (err) {
      console.error("Error creating news post:", err);
      setErrorMsg("সংবাদ পোস্ট করার সময় কোনো ত্রুটি ঘটেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।");
    } finally {
      setPosting(false);
    }
  };

  // Get filtered news (merge static default with dynamic Firestore ones)
  const getMergedNews = () => {
    const activeStatic = staticNews.filter(n => n.category === activeTab);
    return [...dynamicNews, ...activeStatic];
  };

  const newsFeed = getMergedNews();

  return (
    <div className="font-sans pb-10">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #115e59, #0f172a)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6">
          <p className="text-teal-200 text-sm font-medium mb-2 uppercase tracking-wide">জনগণের কণ্ঠস্বর</p>
          <h1 className="text-3xl md:text-4xl font-black mb-3 text-white">নাগরিক সংবাদ ও মতামত</h1>
          <p className="text-gray-100 text-xs md:text-sm max-w-xl leading-relaxed">
            পুঠিয়া উপজেলার সচেতন নাগরিকদের চোখে দেখা বিভিন্ন সমস্যা, জনদুর্ভোগ, সামাজিক উদ্যোগ এবং সমাজের ইতিবাচক পরিবর্তনের খবর। আপনিও খবর পোস্ট করে সিভিক ইস্টার অর্জন করুন!
          </p>
        </div>
      </div>

      {/* Filter Tabs Grid */}
      <div className="grid grid-cols-4 gap-2 mt-6 mb-6 px-1">
        {[
          { id: 'reports', label: 'নাগরিক খবর', emoji: '👥' },
          { id: 'issues', label: 'জনদুর্ভোগ ও সমস্যা', emoji: '⚠️' },
          { id: 'awareness', label: 'সামাজিক সচেতনতা', emoji: '🌱' },
          { id: 'submit', label: 'আপনার খবর পাঠান', emoji: '✍️' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSuccessMsg("");
                setErrorMsg("");
              }}
              className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl transition-all cursor-pointer border ${
                isActive
                  ? "bg-[#115e59] text-white border-[#115e59] shadow-md scale-102"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span className={`text-lg ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="font-extrabold text-[9px] sm:text-[11.5px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Content Area */}
      {activeTab === 'submit' ? (
        /* SUBMIT NEWS TAB */
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-teal-50 text-[#115e59] rounded-xl flex items-center justify-center text-xl font-bold">
              ✍️
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg leading-tight">এলাকার খবর শেয়ার করুন</h3>
              <p className="text-xs text-gray-500 font-bold mt-0.5">সংবাদ পোস্ট করার সাথে সাথে পাবেন ৫ সিভিক ইস্টার বোনাস!</p>
            </div>
          </div>

          {!user ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-2xl">
                🔒
              </div>
              <div>
                <h4 className="font-bold text-gray-800">লগইন প্রয়োজন</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 leading-relaxed">সংবাদ পোস্ট এবং ইস্টার লাভ করতে দয়া করে আপনার পুঠিয়া আইডিতে লগইন বা সাইনআপ করুন।</p>
              </div>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2.5 bg-[#115e59] hover:bg-[#0f4d49] text-white text-xs font-black rounded-xl transition shadow-md cursor-pointer"
              >
                লগইন / সাইনআপ করুন
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {successMsg && (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-100">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-4 bg-rose-50 text-rose-800 rounded-xl text-xs font-bold border border-rose-100">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-black text-gray-700">খবরের শিরোনাম <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title || ""}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="শিরোনামটি আকর্ষণীয় ও তথ্যবহুল রাখুন"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-semibold bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-gray-700">বিভাগ <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={category || ""}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-semibold bg-gray-50"
                  >
                    <option value="reports">নাগরিক খবর (Reports)</option>
                    <option value="issues">এলাকার সমস্যা ও জনদুর্ভোগ (Issues)</option>
                    <option value="awareness">সামাজিক সচেতনতা ও উদ্যোগ (Awareness)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-gray-700">ঘটনাস্থল / স্থান <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={location || ""}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="যেমন: পুঠিয়া বাজার, বানেশ্বর"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-semibold bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-gray-700">খবরের বিস্তারিত বিবরণ <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={6}
                  value={content || ""}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="খবরের মূল বিষয়বস্তু সুন্দর করে সাজিয়ে লিখুন..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-medium bg-gray-50 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-gray-700">ছবি আপলোড (ঐচ্ছিক)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-gray-50"
                  />
                  {imageUrl && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                      <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={posting}
                className="w-full py-3.5 bg-[#115e59] hover:bg-[#0f4d49] disabled:bg-teal-800/40 text-white font-extrabold rounded-xl transition text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer border-none"
              >
                {posting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> পোস্ট করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Newspaper className="w-4 h-4" /> খবরের পোস্ট পাঠান (+৫ ইস্টার)
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* READ NEWS TABS */
        <div className="space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2.5">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-xs font-bold text-gray-500">খবর লোড হচ্ছে...</p>
            </div>
          ) : newsFeed.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <p className="text-sm font-bold text-gray-500">এই বিভাগে বর্তমানে কোনো খবর নেই।</p>
              <p className="text-xs text-gray-400">আপনার চারপাশের খবরাখবর সবার সাথে শেয়ার করতে উপরে "আপনার খবর পাঠান" বাটনে ক্লিক করুন।</p>
            </div>
          ) : (
            newsFeed.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedNews(item)}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md hover:border-teal-200 cursor-pointer transition-all duration-300 active:scale-[0.99] group"
              >
                <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                   <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col justify-between py-1 flex-1">
                  <div>
                    <h4 className="font-serif font-black text-gray-900 text-lg md:text-xl leading-snug mb-3 hover:text-teal-700 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 font-bold mb-3.5">
                       <span className="bg-gray-100 px-2.5 py-1 rounded-full">⏱️ {item.time}</span>
                       <span className="bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1">📍 {item.loc}</span>
                       <span className="bg-gray-100 px-2.5 py-1 rounded-full">👤 {item.authorName}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 font-sans leading-relaxed line-clamp-2 text-justify">
                      {item.desc}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNews(item);
                    }}
                    className="text-xs font-bold text-[#115e59] hover:text-[#0f4d49] mt-4 md:mt-0 flex items-center gap-1 w-fit bg-[#115e59]/10 px-4 py-2 rounded-xl transition cursor-pointer border-none"
                  >
                    📖 বিস্তারিত পড়ুন
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* News Detail Lightbox Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedNews(null)}>
          <div className="bg-white rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl border border-gray-50 animate-scale-up" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white">
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer border-none"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-teal-500/30 text-teal-200 border border-teal-500/20">
                  {selectedNews.category === "reports" ? "নাগরিক রিপোর্ট" : selectedNews.category === "issues" ? "জনদুর্ভোগ" : "সামাজিক উদ্যোগ"}
                </span>
              </div>
              
              <h3 className="text-base md:text-lg font-black leading-snug pr-8 text-white">
                {selectedNews.title}
              </h3>
            </div>

            {/* Image */}
            <div className="w-full h-48 bg-gray-100 overflow-hidden">
              <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[42vh] overflow-y-auto pr-2 no-scrollbar">
              <div className="flex flex-wrap gap-2.5 items-center text-[11px] font-bold text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  {selectedNews.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  {selectedNews.loc}
                </span>
                <span>•</span>
                <span>প্রতিবেদক: {selectedNews.authorName}</span>
              </div>

              <div className="w-full h-px bg-gray-100" />

              <div className="text-xs md:text-sm text-gray-700 leading-relaxed font-semibold whitespace-pre-wrap bg-gray-50 p-4 rounded-2xl border border-gray-100 text-justify">
                {selectedNews.content}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex justify-end">
              <button
                onClick={() => setSelectedNews(null)}
                className="w-full px-6 py-3 bg-[#115e59] hover:bg-[#0f4d49] text-white rounded-xl text-xs font-black transition cursor-pointer border-none"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal for Posting */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};
