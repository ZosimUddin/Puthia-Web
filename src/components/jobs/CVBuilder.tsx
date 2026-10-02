import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { CVProfile, JobApplication } from "./types";
import { FileText, Save, History, Plus, Trash2, Award, Briefcase, GraduationCap, Sparkles, Loader2, Phone, Mail, MapPin } from "lucide-react";
import { motion } from "motion/react";

export const CVBuilder: React.FC = () => {
  const { user, userProfile } = useAuth();
  
  // Local state for CV profile fields
  const [cvData, setCvData] = useState<CVProfile>({
    name: "",
    phone: "",
    email: "",
    village: "",
    union: "",
    education: "",
    skills: "",
    experience: "",
    bio: "",
    updatedAt: ""
  });

  const [activeSubTab, setActiveSubTab] = useState<"build" | "history">("build");
  const [appliedJobs, setAppliedJobs] = useState<JobApplication[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load CV either from localStorage or pre-populate from UserProfile
  useEffect(() => {
    const localCV = localStorage.getItem(`digital_cv_${user?.uid || "guest"}`);
    if (localCV) {
      try {
        setCvData(JSON.parse(localCV));
      } catch (e) {
        console.error("Failed to parse local CV:", e);
      }
    } else if (userProfile) {
      // Pre-populate with auth profile data
      setCvData({
        name: userProfile.name || "",
        phone: userProfile.phone || "",
        email: userProfile.email || "",
        village: userProfile.village || "",
        union: userProfile.union || "",
        education: userProfile.education || "",
        skills: "",
        experience: "",
        bio: userProfile.bio || "",
        updatedAt: new Date().toISOString()
      });
    }
  }, [userProfile, user?.uid]);

  // Sync applied jobs in real-time
  useEffect(() => {
    if (!user?.uid) return;
    
    setLoadingHistory(true);
    const q = query(
      collection(db, "job_applications"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps: JobApplication[] = [];
      snapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() } as JobApplication);
      });
      // Sort on client since compound query needs index
      apps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
      setAppliedJobs(apps);
      setLoadingHistory(false);
    }, (error) => {
      console.error("Error fetching application history:", error);
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleSaveCV = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCV = {
      ...cvData,
      updatedAt: new Date().toISOString()
    };
    setCvData(updatedCV);
    localStorage.setItem(`digital_cv_${user?.uid || "guest"}`, JSON.stringify(updatedCV));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 mb-8 pb-1 gap-6">
        <button
          onClick={() => setActiveSubTab("build")}
          className={`flex items-center gap-2 pb-3 font-bold text-sm border-b-2 transition-all ${
            activeSubTab === "build"
              ? "border-[#0F5A3F] text-[#0F5A3F]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <FileText className="w-4 h-4" /> ডিজিটাল সিভি মেকার
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          className={`flex items-center gap-2 pb-3 font-bold text-sm border-b-2 transition-all ${
            activeSubTab === "history"
              ? "border-[#0F5A3F] text-[#0F5A3F]"
              : "border-transparent text-[#212121] text-gray-400 hover:text-gray-600"
          }`}
        >
          <History className="w-4 h-4" /> আবেদন ইতিহাস ({appliedJobs.length})
        </button>
      </div>

      {activeSubTab === "build" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CV Form */}
          <form onSubmit={handleSaveCV} className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-[#0F5A3F] font-bold text-base border-b border-gray-100 pb-2 mb-4">
              <Sparkles className="w-4.5 h-4.5 text-amber-500" /> আপনার পেশাদারী তথ্য দিন
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={cvData.name || ""}
                  onChange={(e) => setCvData({ ...cvData, name: e.target.value })}
                  placeholder="আপনার নাম লিখুন"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={cvData.phone || ""}
                  onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                  placeholder="017xxxxxxxx"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  value={cvData.email || ""}
                  onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">গ্রাম ও ইউনিয়ন</label>
                <input
                  type="text"
                  value={cvData.village || ""}
                  onChange={(e) => setCvData({ ...cvData, village: e.target.value })}
                  placeholder="গ্রামের নাম, ইউনিয়ন"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">শিক্ষাগত যোগ্যতা (ডিগ্রি, শিক্ষাপ্রতিষ্ঠান ও সাল)</label>
              <textarea
                value={cvData.education || ""}
                onChange={(e) => setCvData({ ...cvData, education: e.target.value })}
                placeholder="উদাঃ এসএসসি পাস - পুঠিয়া পি.এন. সরকারি মডেল উচ্চ বিদ্যালয় (২০২২)"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all h-20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">দক্ষতা (কমা দিয়ে লিখুন)</label>
              <input
                type="text"
                value={cvData.skills || ""}
                onChange={(e) => setCvData({ ...cvData, skills: e.target.value })}
                placeholder="উদাঃ কম্পিউটার টাইপিং, কাস্টমার সার্ভিস, ড্রাইভিং, হিসাব নিকাশ"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">কাজের অভিজ্ঞতা</label>
              <textarea
                value={cvData.experience || ""}
                onChange={(e) => setCvData({ ...cvData, experience: e.target.value })}
                placeholder="উদাঃ শোরুম সেলসম্যান হিসেবে ১ বছর কাজের অভিজ্ঞতা আছে।"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all h-20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">নিজের সম্পর্কে সংক্ষিপ্ত বিবরণ (Bio)</label>
              <textarea
                value={cvData.bio || ""}
                onChange={(e) => setCvData({ ...cvData, bio: e.target.value })}
                placeholder="আমি একজন পরিশ্রমী ও সময়নিষ্ঠ ব্যক্তি..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all h-24"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#0F5A3F] hover:bg-[#0b422e] text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Save className="w-4 h-4" /> ডিজিটাল সিভি সংরক্ষণ করুন
            </button>

            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs font-bold text-center"
              >
                🎉 আপনার ডিজিটাল সিভি সফলভাবে সংরক্ষিত হয়েছে! চাকরির আবেদনের সময় এটি স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে।
              </motion.div>
            )}
          </form>

          {/* CV Live Preview Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-gray-500 font-bold text-xs uppercase tracking-wider pl-1 flex items-center gap-1.5">
              👁️ সিভির লাইভ প্রিভিউ
            </div>

            <div className="bg-[#FAF9F6] border-2 border-dashed border-gray-200 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#0F5A3F]/5 rounded-bl-full pointer-events-none" />
              
              {/* Header */}
              <div className="border-b border-gray-200/60 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#0F5A3F] text-white flex items-center justify-center text-sm font-black mb-3">
                  {cvData.name ? cvData.name.charAt(0) : "P"}
                </div>
                <h4 className="font-bold text-gray-900 text-base">{cvData.name || "আপনার নাম"}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 italic">
                  {cvData.bio || "আপনার সম্পর্কে সংক্ষিপ্ত কিছু কথা এখানে প্রিভিউ হবে।"}
                </p>
              </div>

              {/* Personal details */}
              <div className="space-y-2 mb-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{cvData.phone || "০১৭xxxxxxxx"}</span>
                </div>
                {cvData.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{cvData.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {cvData.village ? `${cvData.village}` : ""}
                    {cvData.union && cvData.village ? ", " : ""}
                    {cvData.union ? `${cvData.union} ইউনিয়ন` : "পুঠিয়া, রাজশাহী"}
                  </span>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                {/* Education */}
                <div>
                  <div className="flex items-center gap-1.5 text-gray-700 font-bold text-xs uppercase mb-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#0F5A3F]" /> শিক্ষাগত যোগ্যতা
                  </div>
                  <p className="text-xs text-gray-500 whitespace-pre-line pl-5 leading-relaxed">
                    {cvData.education || "তথ্য দেওয়া হয়নি"}
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <div className="flex items-center gap-1.5 text-gray-700 font-bold text-xs uppercase mb-1.5">
                    <Award className="w-3.5 h-3.5 text-[#0F5A3F]" /> দক্ষতা
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-5">
                    {cvData.skills ? (
                      cvData.skills.split(",").map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white text-gray-600 rounded-md border border-gray-200 text-[10px] font-bold"
                        >
                          {skill.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">কোনো দক্ষতা যোগ করা হয়নি</span>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <div className="flex items-center gap-1.5 text-gray-700 font-bold text-xs uppercase mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#0F5A3F]" /> কাজের অভিজ্ঞতা
                  </div>
                  <p className="text-xs text-gray-500 whitespace-pre-line pl-5 leading-relaxed">
                    {cvData.experience || "কোনো অভিজ্ঞতা যোগ করা হয়নি"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Application History Sub-tab */
        <div className="space-y-4">
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#0F5A3F] mb-3" />
              <p className="text-sm">আবেদনপত্র লোড হচ্ছে...</p>
            </div>
          ) : appliedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 bg-gray-50">
              <History className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-bold text-sm text-gray-600">কোনো আবেদনের ইতিহাস পাওয়া যায়নি</p>
              <p className="text-xs text-gray-400 mt-1">পছন্দের চাকরির বিজ্ঞপ্তিগুলোতে অনলাইন আবেদন করুন!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appliedJobs.map((app) => (
                <div
                  key={app.id}
                  className="p-5 border border-gray-100 bg-gray-50/50 rounded-2xl flex flex-col justify-between hover:border-[#0F5A3F]/20 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-bold text-gray-800 text-sm truncate">{app.jobTitle}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.status === "accepted"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : app.status === "rejected"
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : app.status === "reviewing"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}
                      >
                        {app.status === "accepted"
                          ? "গৃহীত"
                          : app.status === "rejected"
                          ? "প্রত্যাখ্যাত"
                          : app.status === "reviewing"
                          ? "যাচাইকরণ"
                          : "আবেদন জমা"}
                      </span>
                    </div>
                    <p className="text-xs text-[#0F5A3F] font-bold">{app.companyName}</p>
                    <div className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
                      <CalendarDay className="w-3 h-3" /> আবেদন তারিখ:{" "}
                      {new Date(app.appliedAt).toLocaleDateString("bn-BD")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Tiny helper for calendar icon because lucide-react name is Calendar
const CalendarDay = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
  </svg>
);
