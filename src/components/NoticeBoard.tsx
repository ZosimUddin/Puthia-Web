import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Calendar, Pin, X, Plus, Search, Loader2, Megaphone, Building2, GraduationCap, Heart, FileText, ChevronRight, Trash2 } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'প্রশাসন': case 'সরকারি': return <Building2 className="w-5 h-5 text-emerald-600" />;
    case 'কৃষি': return <FileText className="w-5 h-5 text-emerald-600" />;
    case 'স্বাস্থ্য': return <Heart className="w-5 h-5 text-emerald-600" />;
    case 'শিক্ষা': return <GraduationCap className="w-5 h-5 text-emerald-600" />;
    case 'গুরুত্বপূর্ণ': return <Pin className="w-5 h-5 text-emerald-600" />;
    default: return <Megaphone className="w-5 h-5 text-emerald-600" />;
  }
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function NoticeBoardInfo({ onGoBack }: { onGoBack: () => void }) {
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [dbNotices, setDbNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("সব নোটিশ");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("সাধারণ");
  const [isPinned, setIsPinned] = useState(false);
  const [customDate, setCustomDate] = useState("");

  const staticNotices = [
    { id: "static_1", title: "ইউনিয়ন পরিষদের নতুন চেয়ারম্যানের দায়িত্ব গ্রহণ", date: "২০২৪-০৩-১৫", category: "প্রশাসন", isPinned: true, content: "আগামী ১৫ মার্চ ২০২৪ তারিখে নতুন চেয়ারম্যান দায়িত্ব গ্রহণ করবেন।" },
    { id: "static_2", title: "কৃষি ভর্তুকি প্রদান", date: "২০২৪-০৩-১০", category: "কৃষি", isPinned: false, content: "উপজেলা কৃষি অফিস থেকে আগামী ১০ মার্চ কৃষকদের মধ্যে সার ও বীজ বিতরণ করা হবে।" },
    { id: "static_3", title: "বিনামূল্যে চিকিৎসা ক্যাম্প", date: "২০২৪-০৩-২০", category: "স্বাস্থ্য", isPinned: false, content: "উপজেলা স্বাস্থ্য কমপ্লেক্সে আগামী ২০ মার্চ বিনামূল্যে চক্ষু শিবিরের আয়োজন করা হয়েছে।" }
  ];

  const getBanglaDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const banglaDigits: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    const toBangla = (num: number) => num.toString().split('').map(digit => banglaDigits[digit] || digit).join('');
    return `${toBangla(year)}-${toBangla(month).padStart(2, '০')}-${toBangla(day).padStart(2, '০')}`;
  };

  useEffect(() => {
    if (showAddModal) setCustomDate(getBanglaDateString());
  }, [showAddModal]);

  useEffect(() => {
    const q = query(collection(db, "notices"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({ id: docSnap.id, ...data });
      });
      setDbNotices(list);
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
      handleFirestoreError(error, OperationType.LIST, "notices");
    });
    return () => unsubscribe();
  }, []);

  const sortedNotices = [...[...dbNotices, ...staticNotices].filter(notice =>
    (selectedCategory === "সব নোটিশ" || notice.category === selectedCategory) &&
    (notice.title.toLowerCase().includes(searchQuery.toLowerCase()) || notice.content.toLowerCase().includes(searchQuery.toLowerCase()))
  )].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.date.localeCompare(a.date);
  });

  const categories = ["সব নোটিশ", "গুরুত্বপূর্ণ", "সরকারি", "শিক্ষা", "কৃষি", "স্বাস্থ্য", "অন্যান্য"];

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert("দয়া করে শিরোনাম ও বিস্তারিত বিবরণ পূরণ করুন।");
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "notices"), { title: title.trim(), content: content.trim(), category, isPinned, date: customDate || getBanglaDateString(), createdAt: serverTimestamp() });
      setTitle(""); setContent(""); setCategory("সাধারণ"); setIsPinned(false); setShowAddModal(false);
      alert("নতুন নোটিশটি সফলভাবে প্রকাশ করা হয়েছে!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "notices");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: string, noticeTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`আপনি কি নিশ্চিতভাবে "${noticeTitle}" নোটিশটি ডিলিট করতে চান?`)) {
      try {
        await deleteDoc(doc(db, "notices", id));
        alert("নোটিশটি সফলভাবে ডিলিট করা হয়েছে!");
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `notices/${id}`);
      }
    }
  };

  return (
    <div className="animate-fade-in font-sans bg-gray-50 min-h-screen pb-20">
      <div className="p-6 rounded-b-[32px] text-white relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #065f46 0%, #047857 100%)' }}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={onGoBack} className="bg-white/20 p-2 rounded-full text-white"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-lg font-bold">নোটিশ বোর্ড</h2>
          <Search className="w-5 h-5 text-white/80" />
        </div>
        <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white font-bold uppercase">গুরুত্বপূর্ণ তথ্য</span>
            <h3 className="text-lg font-bold mt-1">সকল নোটিশ ও ঘোষণা একসাথে</h3>
            <p className="text-[11px] opacity-80 mt-1">নিয়মিত আপডেট পেতে আমাদের সাথে থাকুন।</p>
          </div>
          <Megaphone className="w-12 h-12 text-white/40" />
        </div>
      </div>
      <div className="px-4 py-4 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none -mx-1 px-1">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap inline-flex items-center gap-2 transition-all border cursor-pointer active:scale-95 leading-normal ${
              selectedCategory === cat
                ? "bg-[#006a4e] text-white border-[#006a4e] shadow-md shadow-emerald-900/10"
                : "bg-emerald-50/70 text-emerald-900 border-emerald-200/80 hover:bg-emerald-100/80"
            }`}
          >
            <span className="leading-snug">{cat}</span>
          </button>
        ))}
      </div>
      <div className="px-4 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-800">সর্বশেষ নোটিশ</h3>
          <button className="text-emerald-700 text-xs font-bold flex items-center">সব দেখুন <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          {isLoading ? <div className="text-center py-12"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" /></div> :
            sortedNotices.map(notice => (
              <div key={notice.id} onClick={() => setSelectedNotice(notice)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">{getCategoryIcon(notice.category)}</div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">{notice.category}</span>
                  <h4 className="text-sm font-bold text-gray-900 truncate">{notice.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1"><Calendar className="w-3 h-3" /> {notice.date}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
              </div>
            ))
          }
        </div>
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-emerald-900 text-white">
              <button onClick={() => setSelectedNotice(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all border-none outline-none cursor-pointer"><X className="w-5 h-5" /></button>
              <div className="flex items-center gap-2 mb-3"><span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-500/20">{selectedNotice.category}</span></div>
              <h3 className="text-lg font-bold leading-snug pr-8 text-white">{selectedNotice.title}</h3>
            </div>
            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Calendar className="w-4 h-4 text-emerald-500" /><span>প্রকাশের তারিখ: {selectedNotice.date}</span></div>
              <div className="w-full h-px bg-gray-100" />
              <div className="text-[14px] text-gray-700 leading-relaxed font-medium whitespace-pre-wrap bg-gray-50 p-4 rounded-2xl border border-gray-100 text-justify">{selectedNotice.content}</div>
            </div>
            <div className="p-6 pt-0 flex justify-end">
              <button onClick={() => setSelectedNotice(null)} className="w-full px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all hover:shadow-lg active:scale-95 border-none outline-none cursor-pointer">বন্ধ করুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up my-8">
            <div className="relative p-6 pb-4 bg-emerald-900 text-white">
              <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all border-none outline-none cursor-pointer"><X className="w-5 h-5" /></button>
              <div className="flex items-center gap-2 mb-1"><Plus className="w-5 h-5 text-emerald-300" /><span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">নতুন নোটিশ যোগ</span></div>
              <h3 className="text-base font-black">জনসাধারণের উদ্দেশ্যে নোটিশ প্রকাশ করুন</h3>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">শিরোনাম (Title) *</label>
                <input type="text" required placeholder="যেমন: পৌরসভায় বিদ্যুৎ বন্ধ সংক্রান্ত ঘোষণা" value={title || ""} onChange={(e) => setTitle(e.target.value)} className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-emerald-600 transition-all font-medium text-gray-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">বিভাগ (Category) *</label>
                  <select value={category || ""} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-emerald-600 transition-all font-bold text-gray-700 cursor-pointer">
                    <option value="সাধারণ">সাধারণ</option><option value="প্রশাসন">প্রশাসন</option><option value="কৃষি">কৃষি</option><option value="স্বাস্থ্য">স্বাস্থ্য</option><option value="শিক্ষা">শিক্ষা</option><option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">প্রকাশের তারিখ *</label>
                  <input type="text" required placeholder="যেমন: ২০২৬-০৬-২৮" value={customDate || ""} onChange={(e) => setCustomDate(e.target.value)} className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-emerald-600 transition-all font-medium text-gray-800" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">বিস্তারিত বিবরণ (Description) *</label>
                <textarea rows={4} required placeholder="নোটিশের বিস্তারিত তথ্য এখানে লিখুন..." value={content || ""} onChange={(e) => setContent(e.target.value)} className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-emerald-600 transition-all font-medium text-gray-800" />
              </div>
              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="pinToggle" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" />
                <label htmlFor="pinToggle" className="text-xs font-bold text-gray-600 cursor-pointer select-none">📌 এটি একটি গুরুত্বপূর্ণ নোটিশ (শীর্ষে দেখাবে)</label>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer border-none">বাতিল করুন</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border-none">
                  {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />প্রকাশ হচ্ছে...</> : "নোটিশ প্রকাশ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
