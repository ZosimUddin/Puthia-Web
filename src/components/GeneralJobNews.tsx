import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Landmark, Building, FileText, ExternalLink, CalendarClock, 
  Sparkles, Plus, Send, X, Loader2, Trash2, Search 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface Props { onGoBack: () => void; }

interface NationalJob {
  id: string;
  title: string;
  company: string;
  qualification: string;
  deadline: string;
  circularUrl: string;
  applyUrl: string;
  category: "gov" | "private";
  daysLeft: number;
}

const nationalJobs: NationalJob[] = [
  {
    id: "railway-asm",
    title: "সহকারী স্টেশন মাস্টার",
    company: "বাংলাদেশ রেলওয়ে",
    qualification: "ন্যূনতম স্নাতক বা সমমানের ডিগ্রি।",
    deadline: "২০ জুলাই ২০২৬",
    circularUrl: "https://railway.gov.bd",
    applyUrl: "http://br.teletalk.com.bd",
    category: "gov",
    daysLeft: 5
  },
  {
    id: "bpsc-ap",
    title: "সহকারী প্রোগ্রামার (১০ম গ্রেড)",
    company: "বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)",
    qualification: "কম্পিউটার বিজ্ঞান বা আইসিটি-তে স্নাতক ডিগ্রি।",
    deadline: "৩০ জুলাই ২০২৬",
    circularUrl: "https://bpsc.gov.bd",
    applyUrl: "http://bpsc.teletalk.com.bd",
    category: "gov",
    daysLeft: 15
  },
  {
    id: "dpe-teacher",
    title: "সহকারী শিক্ষক (রাজশাহী বিভাগ)",
    company: "প্রাথমিক শিক্ষা অধিদপ্তর (DPE)",
    qualification: "স্নাতক বা সমমান ডিগ্রি (দ্বিতীয় শ্রেণী)।",
    deadline: "১৫ আগস্ট ২০২৬",
    circularUrl: "https://dpe.gov.bd",
    applyUrl: "http://dpe.teletalk.com.bd",
    category: "gov",
    daysLeft: 31
  },
  {
    id: "bkash-cso",
    title: "কাস্টমার সার্ভিস অফিসার (Customer Service)",
    company: "বিকাশ লিমিটেড (bKash)",
    qualification: "স্নাতক পাস এবং চমৎকার যোগাযোগ দক্ষতা।",
    deadline: "১০ জুলাই ২০২৬",
    circularUrl: "https://www.bkash.com/en/career",
    applyUrl: "https://www.bkash.com/en/career",
    category: "private",
    daysLeft: 12
  },
  {
    id: "brac-aro",
    title: "এসোসিয়েট রিলেশনশিপ অফিসার (MFI)",
    company: "ব্র্যাক ব্যাংক লিমিটেড (BRAC)",
    qualification: "স্নাতক বা স্নাতকোত্তর ডিগ্রি (এইচএসসি-তেও জিপিএ ৩.০ থাকতে হবে)।",
    deadline: "২৫ জুলাই ২০২৬",
    circularUrl: "https://www.bracbank.com/en/career",
    applyUrl: "https://www.bracbank.com/en/career",
    category: "private",
    daysLeft: 18
  },
  {
    id: "pran-se",
    title: "জুনিয়র সফটওয়্যার ইঞ্জিনিয়ার (React)",
    company: "প্রাণ-আরএফএল গ্রুপ (PRAN-RFL)",
    qualification: "সিএসই/আইটি-তে বিএসসি বা সমমান প্রফেশনাল কোর্স।",
    deadline: "০৮ আগস্ট ২০২৬",
    circularUrl: "https://www.pranrflgroup.com/career",
    applyUrl: "https://www.pranrflgroup.com/career",
    category: "private",
    daysLeft: 22
  }
];

export const GeneralJobNews: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"gov" | "private">("gov");
  const [dbJobs, setDbJobs] = useState<NationalJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Form states
  const [showPostForm, setShowPostForm] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [qualification, setQualification] = useState("");
  const [deadline, setDeadline] = useState("");
  const [daysLeft, setDaysLeft] = useState(15);
  const [circularUrl, setCircularUrl] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [category, setCategory] = useState<"gov" | "private">("gov");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load jobs from Firestore
  useEffect(() => {
    const q = query(collection(db, "job_news"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: NationalJob[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || "",
          company: data.company || "",
          qualification: data.qualification || "",
          deadline: data.deadline || "",
          circularUrl: data.circularUrl || "",
          applyUrl: data.applyUrl || "",
          category: data.category || "gov",
          daysLeft: typeof data.daysLeft === "number" ? data.daysLeft : parseInt(data.daysLeft) || 10,
        });
      });
      setDbJobs(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading job news:", error);
      setIsLoading(false);
      try {
        handleFirestoreError(error, OperationType.LIST, "job_news");
      } catch (err) {
        console.warn("Muted background Firestore error:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  // Post a new job
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !qualification.trim() || !deadline.trim()) {
      alert("দয়া করে সব আবশ্যক ক্ষেত্রগুলো পূরণ করুন।");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "job_news"), {
        title: title.trim(),
        company: company.trim(),
        qualification: qualification.trim(),
        deadline: deadline.trim(),
        daysLeft: Number(daysLeft) || 10,
        circularUrl: circularUrl.trim() || "https://google.com",
        applyUrl: applyUrl.trim() || "https://google.com",
        category,
        createdAt: serverTimestamp(),
      });
      
      // Reset form
      setTitle("");
      setCompany("");
      setQualification("");
      setDeadline("");
      setDaysLeft(15);
      setCircularUrl("");
      setApplyUrl("");
      setShowPostForm(false);
      alert("চাকরির বিজ্ঞপ্তিটি সফলভাবে পোস্ট করা হয়েছে!");
    } catch (err) {
      console.error("Error posting job:", err);
      alert("বিজ্ঞপ্তি পোস্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      handleFirestoreError(err, OperationType.CREATE, "job_news");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a user-posted job
  const handleDeleteJob = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই বিজ্ঞপ্তিটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "job_news", id));
      alert("বিজ্ঞপ্তিটি সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
      handleFirestoreError(err, OperationType.DELETE, `job_news/${id}`);
    }
  };

  const allJobs = [...dbJobs, ...nationalJobs];
  const activeJobs = allJobs.filter((job) => {
    const matchesCategory = job.category === filter;
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans pb-10">
      <UnifiedHeroHeader
        badgeText="জাতীয় ক্যারিয়ার পোর্টাল"
        title="সর্বশেষ চাকরির খবর"
        subtitle="বিসিএস, ব্যাংক, প্রাইমারি শিক্ষক নিয়োগসহ জাতীয় পর্যায়ের শীর্ষস্থানীয় সরকারি ও বেসরকারি চাকরির খবর।"
        icon={<Sparkles size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="পদের নাম, প্রতিষ্ঠান বা যোগ্যতা দিয়ে খুঁজুন..."
        rightAction={
          <button 
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) {
                setSearchQuery("");
              }
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
              showSearch 
                ? "bg-[#1E3A8A] text-white border-[#1E3A8A] hover:bg-[#172e6e]" 
                : "bg-white/10 hover:bg-white/20 text-white border-white/10"
            }`}
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Post Button */}
        <div className="px-1">
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="w-full bg-[#0f766e] hover:bg-[#0d5c56] text-white font-extrabold text-xs md:text-sm py-3.5 px-4 rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-700/20 active:scale-[0.99] border-none"
          >
            {showPostForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showPostForm ? "বিজ্ঞপ্তি ফরম বন্ধ করুন" : "নতুন চাকরির বিজ্ঞপ্তি পোস্ট করুন"}
          </button>
        </div>

        {/* Post Form */}
        <AnimatePresence>
          {showPostForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-6 border border-teal-100 shadow-md space-y-4 overflow-hidden"
            >
              <h3 className="m-0 text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" /> নতুন সার্কুলার যুক্ত করুন
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                জাতীয় ক্যারিয়ার পোর্টালে সরকারি বা বেসরকারি চাকরির নতুন নিয়োগ বিজ্ঞপ্তি সবার সাথে শেয়ার করুন।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">পদের নাম: *</label>
                  <input
                    type="text"
                    required
                    value={title || ""}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="যেমন: সহকারী স্টেশন মাস্টার"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">প্রতিষ্ঠান/কোম্পানির নাম: *</label>
                  <input
                    type="text"
                    required
                    value={company || ""}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="যেমন: বাংলাদেশ রেলওয়ে"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">শিক্ষাগত যোগ্যতা: *</label>
                  <input
                    type="text"
                    required
                    value={qualification || ""}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="যেমন: ন্যূনতম স্নাতক বা সমমানের ডিগ্রি"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">আবেদনের শেষ সময়: *</label>
                  <input
                    type="text"
                    required
                    value={deadline || ""}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="যেমন: ২০ জুলাই ২০২৬"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">কত দিন বাকি আছে: *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={daysLeft || ""}
                    onChange={(e) => setDaysLeft(Number(e.target.value))}
                    placeholder="যেমন: ১৫"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">চাকরির ধরন: *</label>
                  <select
                    value={category || ""}
                    onChange={(e) => setCategory(e.target.value as "gov" | "private")}
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="gov">🏛️ সরকারি চাকরি</option>
                    <option value="private">🏢 বেসরকারি চাকরি</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">সার্কুলার লিংক/ওয়েবসাইট: (ঐচ্ছিক)</label>
                  <input
                    type="url"
                    value={circularUrl || ""}
                    onChange={(e) => setCircularUrl(e.target.value)}
                    placeholder="যেমন: https://railway.gov.bd"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">সরাসরি আবেদনের লিংক: (ঐচ্ছিক)</label>
                <input
                  type="url"
                  value={applyUrl || ""}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  placeholder="যেমন: http://br.teletalk.com.bd"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-xs font-black rounded-2xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md shadow-teal-600/10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    বিজ্ঞপ্তি সাবমিট হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> সার্কুলার পোস্ট করুন
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("gov")}
            className={`py-3.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "gov"
                ? "bg-[#0f172a] text-[#22d3ee] border-2 border-[#22d3ee]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Landmark className={`w-4 h-4 ${filter === "gov" ? 'text-[#22d3ee]' : 'text-gray-400'}`}/>
            সরকারি চাকরি
          </button>
          <button
            onClick={() => setFilter("private")}
            className={`py-3.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "private"
                ? "bg-[#0f172a] text-[#22d3ee] border-2 border-[#22d3ee]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Building className={`w-4 h-4 ${filter === "private" ? 'text-[#22d3ee]' : 'text-gray-400'}`}/>
            বেসরকারি চাকরি
          </button>
        </div>

        {/* Dynamic Display Area */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin" />
              <p className="text-xs text-slate-500 font-semibold">বিজ্ঞপ্তি লোড করা হচ্ছে...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {activeJobs.length > 0 ? (
                  activeJobs.map((job) => {
                    const isUserJob = !nationalJobs.some(nj => nj.id === job.id);
                    
                    return (
                      <div 
                        key={job.id}
                        className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col gap-4 relative overflow-hidden hover:border-[#22d3ee]/50 transition-all hover:shadow-lg"
                      >
                        {/* Time Left Tag & Delete button for User Submitted Jobs */}
                        <div className="absolute top-0 right-0 flex items-center">
                          {isUserJob && (
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-bl-xl border-l border-b border-red-100 transition cursor-pointer border-none"
                              title="বিজ্ঞপ্তি মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="py-1.5 px-4 bg-red-50 text-red-700 text-[10px] font-extrabold rounded-bl-2xl border-l border-b border-red-100 flex items-center gap-1">
                            <CalendarClock className="w-3.5 h-3.5" /> {job.daysLeft} দিন বাকি
                          </div>
                        </div>

                        <div className="pr-20">
                          <div className="text-[10px] font-black text-[#0f766e] uppercase tracking-wider mb-1">
                            {job.company}
                          </div>
                          <h3 className="text-lg font-black text-slate-800 leading-snug tracking-tight">
                            {job.title}
                          </h3>
                        </div>

                        {/* Details Box */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60 space-y-2">
                          <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                            <span className="font-extrabold text-slate-900 shrink-0">শিক্ষাগত যোগ্যতা:</span> 
                            <span>{job.qualification}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs font-semibold text-slate-700 border-t border-slate-200/50 pt-2">
                            <span className="font-extrabold text-slate-900 shrink-0">আবেদনের শেষ সময়:</span> 
                            <span className="text-red-600 font-bold">{job.deadline}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2.5 w-full mt-1">
                          <a 
                            href={job.circularUrl || "https://google.com"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 text-xs font-extrabold text-slate-900 bg-[#22d3ee] rounded-xl hover:bg-cyan-300 transition-all shadow-md shadow-cyan-300/30 flex items-center justify-center gap-1.5 text-center cursor-pointer outline-none active:scale-[0.98]"
                          >
                            <FileText className="w-4 h-4" /> সার্কুলার দেখুন
                          </a>
                          <a 
                            href={job.applyUrl || "https://google.com"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-[0.8] py-3 text-xs font-extrabold text-[#0f766e] bg-teal-50 rounded-xl hover:bg-teal-100 transition-all border border-teal-100 flex items-center justify-center gap-1.5 text-center cursor-pointer outline-none active:scale-[0.98]"
                          >
                            <ExternalLink className="w-4 h-4" /> সরাসরি আবেদন
                          </a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center py-12 animate-fade-in">
                    <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500">বর্তমানে কোনো বিজ্ঞপ্তি নেই</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

