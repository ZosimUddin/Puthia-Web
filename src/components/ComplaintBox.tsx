import React from 'react';
import { 
  FileText, Search, Phone, Star, Check, Landmark, RefreshCw, Send, AlertCircle, HelpCircle, Plus 
} from 'lucide-react';
import { Complaint, Feedback } from '../types';
import { addComplaint, addFeedback } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface ComplaintBoxProps {
  complaintTab: string;
  setComplaintTab: (tab: string) => void;
  allComplaintsList: any[];
  setAllComplaintsList: React.Dispatch<React.SetStateAction<any[]>>;
  cpName: string;
  setCpName: (name: string) => void;
  cpPhone: string;
  setCpPhone: (phone: string) => void;
  cpTitle: string;
  setCpTitle: (title: string) => void;
  cpDesc: string;
  setCpDesc: (desc: string) => void;
  cpCategory: string;
  setCpCategory: (cat: string) => void;
  cpUnion: string;
  setCpUnion: (union: string) => void;
  cpEvidenceList: any[];
  setCpEvidenceList: React.Dispatch<React.SetStateAction<any[]>>;
  cpEmail: string;
  setCpEmail: (email: string) => void;
  isSubmittingComplaint: boolean;
  setIsSubmittingComplaint: (submitting: boolean) => void;
  complaintSuccessId: string;
  setComplaintSuccessId: (id: string) => void;
  complaintSubmitted: boolean;
  setComplaintSubmitted: (submitted: boolean) => void;
  cpTrackingId: string;
  setCpTrackingId: (id: string) => void;
  cpTrackingPhone: string;
  setCpTrackingPhone: (phone: string) => void;
  isLoadingComplaints: boolean;
  setIsLoadingComplaints: (loading: boolean) => void;
  feedbackName: string;
  setFeedbackName: (name: string) => void;
  feedbackPhone: string;
  setFeedbackPhone: (phone: string) => void;
  feedbackRating: number;
  setFeedbackRating: (rating: number) => void;
  feedbackMsg: string;
  setFeedbackMsg: (msg: string) => void;
  feedbackSuccess: boolean;
  setFeedbackSuccess: (success: boolean) => void;
  isSubmittingFeedback: boolean;
  setIsSubmittingFeedback: (submitting: boolean) => void;
  onGoBack: () => void;
  onSimulateCall: (recipient: string, role: string) => void;
}

export function ComplaintBox({
  complaintTab,
  setComplaintTab,
  allComplaintsList,
  setAllComplaintsList,
  cpName,
  setCpName,
  cpPhone,
  setCpPhone,
  cpTitle,
  setCpTitle,
  cpDesc,
  setCpDesc,
  cpCategory,
  setCpCategory,
  cpUnion,
  setCpUnion,
  cpEvidenceList,
  setCpEvidenceList,
  cpEmail,
  setCpEmail,
  isSubmittingComplaint,
  setIsSubmittingComplaint,
  complaintSuccessId,
  setComplaintSuccessId,
  complaintSubmitted,
  setComplaintSubmitted,
  cpTrackingId,
  setCpTrackingId,
  cpTrackingPhone,
  setCpTrackingPhone,
  isLoadingComplaints,
  setIsLoadingComplaints,
  feedbackName,
  setFeedbackName,
  feedbackPhone,
  setFeedbackPhone,
  feedbackRating,
  setFeedbackRating,
  feedbackMsg,
  setFeedbackMsg,
  feedbackSuccess,
  setFeedbackSuccess,
  isSubmittingFeedback,
  setIsSubmittingFeedback,
  onGoBack,
  onSimulateCall,
}: ComplaintBoxProps) {
  const { addStars } = useAuth();
  
  const handleEvidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCpEvidenceList((prev) => [
          ...prev,
          { name: file.name, base64: base64String },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpName || !cpPhone || !cpTitle || !cpDesc) {
      alert("অনুগ্রহ করে সব প্রয়োজনীয় লাল তারকা চিহ্নিত ক্ষেত্রগুলো পূরণ করুন!");
      return;
    }
    setIsSubmittingComplaint(true);
    try {
      const newComplaint = {
        title: cpTitle,
        complainantName: cpName,
        complainantPhone: cpPhone,
        complainantEmail: cpEmail || "",
        category: cpCategory,
        unionName: cpUnion,
        description: cpDesc,
        evidenceUrls: cpEvidenceList.map((file) => file.base64),
        status: "Pending" as const,
        actionLog: [
          {
            message: "অভিযোগ সফলভাবে অনলাইনে দাখিল করা হয়েছে",
            date: new Date().toLocaleDateString("bn-BD"),
          },
        ],
        createdAt: new Date().toISOString(),
      };
      const cid = await addComplaint(newComplaint);
      
      // Award 10 points for submitting a complaint!
      if (addStars) {
        try {
          await addStars(10);
        } catch (e) {
          console.error("Error adding points:", e);
        }
      }

      setComplaintSuccessId(cid);
      setComplaintSubmitted(true);

      setAllComplaintsList((prev) => [
        { id: cid, ...newComplaint },
        ...prev,
      ]);

      setCpTitle("");
      setCpName("");
      setCpPhone("");
      setCpEmail("");
      setCpDesc("");
      setCpEvidenceList([]);
    } catch (err) {
      console.error(err);
      alert("দুঃখিত, অভিযোগ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName || !feedbackPhone || !feedbackMsg || feedbackRating === 0) {
      alert("অনুগ্রহ করে সব প্রয়োজনীয় ফিল্ডগুলো পূরণ করুন ও রেটিং দিন!");
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      const newFeedback = {
        name: feedbackName,
        phone: feedbackPhone,
        rating: feedbackRating,
        message: feedbackMsg,
        createdAt: new Date().toISOString(),
      };
      await addFeedback(newFeedback);
      setFeedbackSuccess(true);
      setFeedbackName("");
      setFeedbackPhone("");
      setFeedbackRating(0);
      setFeedbackMsg("");
    } catch (err) {
      console.error(err);
      alert("মতামত পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const dummyComplaints = [
    {
      id: "COMP-2026-0520",
      title: "প্রধান সড়কের পাশে অবৈধ ডাস্টবিন অপসারণ",
      description: "পুঠিয়া বাসস্ট্যান্ড হতে রাজবাড়ী অভিমুখে যাওয়ার পথে ড্রেনের উপর অবৈধভাবে ময়লা ফেলা হচ্ছে, যা দুর্গন্ধ ছড়াচ্ছে।",
      unionName: "পুঠিয়া সদর",
      complainantName: "আব্দুর রহমান",
      complainantPhone: "01712-XXXXXX",
      status: "Resolved",
      actionLog: [
        { message: "অভিযোগ গ্রহণ করা হয়েছে", date: "২০/০৫/২০২৬" },
        { message: "পরিচ্ছন্নতা কর্মীকে নির্দেশ প্রদান", date: "২১/০৫/২০২৬" },
        { message: "ময়লা অপসারণ ও ব্লিচিং পাউডার ছিটানো হয়েছে", date: "২২/০৫/২০২৬" },
      ],
      evidenceUrls: [],
    },
    {
      id: "COMP-2026-0617",
      title: "ভালুকগাছী ৩নং ওয়ার্ডে স্ট্রিট লাইট নষ্ট",
      description: "গত এক সপ্তাহ ধরে মসজিদের সামনের ৩টি সোলার লাইট জ্বলছে না, রাতে চলাচলে অসুবিধা হচ্ছে।",
      unionName: "ভালুকগাছী",
      complainantName: "মোঃ হাসিব",
      complainantPhone: "01823-XXXXXX",
      status: "Processing",
      actionLog: [
        { message: "অভিযোগ ভেরিফাই করা হয়েছে", date: "১৭/০৬/২০২৬" },
        { message: "টেকনিক্যাল টিমকে রিপোর্ট পাঠানো হয়েছে", date: "১৭/০৬/২০২৬" },
      ],
      evidenceUrls: [],
    },
  ];

  const complaintsToDisplay = [...allComplaintsList, ...dummyComplaints];

  const filteredComplaints = complaintsToDisplay.filter(item => {
    const matchId = cpTrackingId ? item.id?.toLowerCase().includes(cpTrackingId.toLowerCase()) : true;
    const matchPhone = cpTrackingPhone ? item.complainantPhone?.includes(cpTrackingPhone) : true;
    return matchId && matchPhone;
  });

  return (
    <div className="space-y-6">
      <div
        style={{ background: "linear-gradient(135deg, #2d5a27, #1a3816)" }}
        className="p-6 sm:p-8 text-white relative rounded-3xl overflow-hidden shadow-md"
      >
        <div className="absolute right-0 bottom-0 w-48 h-48 text-white/10 -mb-8 -mr-8 pointer-events-none">
          <FileText className="w-full h-full" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left font-sans">
            <span className="inline-block bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20">
              Citizen Grievance Redress System
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight mt-2.5">
              অভিযোগ ও ডিজিটাল প্রতিকার সেল
            </h1>
            <p className="mt-1.5 text-white/90 text-xs sm:text-sm max-w-xl leading-relaxed font-semibold">
              উপজেলার নাগরিক সমস্যা সরাসরি প্রশাসনকে জানান এবং অনলাইনে আপনার আবেদনের বর্তমান অবস্থা ট্র্যাক করুন। আমরা আপনার সেবায় প্রতিশ্রুতিবদ্ধ।
            </p>
          </div>
          <button
            onClick={onGoBack}
            className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold border border-white/25 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            ← ফিরে যান
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-100/60 p-2 rounded-2xl border border-neutral-200">
        <button
          onClick={() => setComplaintTab("new")}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition cursor-pointer text-center ${
            complaintTab === "new"
              ? "bg-[#2d5a27] text-white shadow-sm font-sans"
              : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-100/80 font-sans"
          }`}
        >
          <span className="text-2xl mb-1">📝</span>
          <span className="text-xs font-black">নতুন অভিযোগ দাখিল</span>
        </button>

        <button
          onClick={() => setComplaintTab("status")}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition cursor-pointer text-center ${
            complaintTab === "status"
              ? "bg-[#2d5a27] text-white shadow-sm font-sans"
              : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-100/80 font-sans"
          }`}
        >
          <span className="text-2xl mb-1">🔍</span>
          <span className="text-xs font-black">অবস্থা জানুন</span>
        </button>

        <button
          onClick={() => setComplaintTab("contact_feedback")}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition cursor-pointer text-center ${
            complaintTab === "contact_feedback"
              ? "bg-[#2d5a27] text-white shadow-sm font-sans"
              : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-100/80 font-sans"
          }`}
        >
          <span className="text-2xl mb-1">👂</span>
          <span className="text-xs font-black">মতামত ও সহায়তা</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto py-2">
        {complaintTab === "new" && (
          <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-neutral-200 shadow-sm space-y-8 animate-fade-in text-left">
            {complaintSubmitted ? (
               <div className="text-center py-12 space-y-6 animate-fade-in font-sans">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
                    <div className="relative w-24 h-24 bg-green-50 text-[#2d5a27] rounded-full flex items-center justify-center border border-green-200 shadow-sm">
                      <Check className="w-12 h-12" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-[#2d5a27] text-2xl mb-2">
                      আপনার অভিযোগটি সফলভাবে দাখিল হয়েছে!
                    </h3>
                    <p className="text-gray-500 font-bold text-sm sm:text-base">
                       আপনার ট্র্যাকিং আইডি (Complaint ID):{" "}
                       <span className="text-[#CD5C5C] font-mono bg-neutral-100 px-3 py-1 rounded-lg border">
                         {complaintSuccessId}
                       </span>
                    </p>
                  </div>
                  <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 max-w-md mx-auto text-xs font-semibold text-gray-500 leading-relaxed text-center">
                    ভবিষ্যতে আপনার ডকেটের অবস্থা জানতে এই আইডিটি সংরক্ষণ করুন। আগামী ৪৮-৭২ ঘণ্টার মধ্যে সংশ্লিষ্ট বিভাগ আপনার অভিযোগটি পর্যালোচনা করে প্রাথমিক ফিডব্যাক প্রদান করবেন।
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                     <button
                       onClick={() => setComplaintSubmitted(false)}
                       className="px-6 py-3 bg-[#2d5a27] hover:bg-[#1a3816] text-white font-bold rounded-xl text-sm transition shadow-md cursor-pointer"
                     >
                       আরেকটি অভিযোগ দিন
                     </button>
                     <button
                       onClick={() => setComplaintTab("status")}
                       className="px-6 py-3 bg-white hover:bg-neutral-50 text-[#2d5a27] border border-[#2d5a27] font-bold rounded-xl text-sm transition cursor-pointer"
                     >
                       ট্র্যাক করুন
                     </button>
                  </div>
               </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="space-y-6 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-600 block uppercase tracking-wide">আপনার নাম <span className="text-red-500">*</span></label>
                     <input
                        type="text"
                        required
                        value={cpName || ""}
                        onChange={(e) => setCpName(e.target.value)}
                        placeholder="যেমন: মোঃ আবুল হাশেম"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[#2d5a27]/20 focus:border-[#2d5a27] outline-hidden shadow-xs"
                      />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-600 block uppercase tracking-wide">মোবাইল নম্বর (সক্রিয়) <span className="text-red-500">*</span></label>
                     <input
                        type="tel"
                        required
                        value={cpPhone || ""}
                        onChange={(e) => setCpPhone(e.target.value)}
                        placeholder="০১৭XX-XXXXXX"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[#2d5a27]/20 focus:border-[#2d5a27] outline-hidden shadow-xs"
                      />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-600 block uppercase tracking-wide">ইমেইল (ঐচ্ছিক)</label>
                     <input
                        type="email"
                        value={cpEmail || ""}
                        onChange={(e) => setCpEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[#2d5a27]/20 focus:border-[#2d5a27] outline-hidden shadow-xs"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-600 block uppercase tracking-wide">অভিযোগের ধরন <span className="text-red-500">*</span></label>
                     <select
                        value={cpCategory || ""}
                        onChange={(e) => setCpCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[#2d5a27]/20 focus:border-[#2d5a27] outline-hidden bg-white shadow-xs"
                     >
                       <option>রাস্তা/কালভার্ট</option>
                       <option>পরিশুদ্ধ পানি/ড্রেনেজ</option>
                       <option>বিদ্যুৎ বিভ্রাট/সোলার লাইট</option>
                       <option>আইন-শৃঙ্খলা/নিরাপত্তা</option>
                       <option>সরকারি দপ্তর/সেবা হয়রানি</option>
                       <option>পরিবেশ দূষণ/অবৈধ বালু উত্তোলন</option>
                       <option>অন্যান্য</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-600 block uppercase tracking-wide">সংশ্লিষ্ট ইউনিয়ন <span className="text-red-500">*</span></label>
                     <select
                        value={cpUnion || ""}
                        onChange={(e) => setCpUnion(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[#2d5a27]/20 focus:border-[#2d5a27] outline-hidden bg-white shadow-xs"
                     >
                        <option>পুঠিয়া সদর</option>
                        <option>বানেশ্বর</option>
                        <option>ভালুকগাছী</option>
                        <option>শিলমাড়ীয়া</option>
                        <option>জিউপাড়া</option>
                        <option>বেলপুকুরিয়া</option>
                     </select>
                   </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 block uppercase tracking-wide">অভিযোগের বিষয়বস্তু/শিরোনাম <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={cpTitle || ""}
                    onChange={(e) => setCpTitle(e.target.value)}
                    placeholder="সংক্ষেপে বিষিয়টি লিখুন..."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[#2d5a27]/20 focus:border-[#2d5a27] outline-hidden shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 block uppercase tracking-wide">বিস্তারিত অভিযোগ চিত্র <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={5}
                    value={cpDesc || ""}
                    onChange={(e) => setCpDesc(e.target.value)}
                    placeholder="আপনার অভিযোগটির বিস্তারিত বিবরণ দিন (স্থান, সময় ও সমস্যার ধরণসহ)..."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[#2d5a27]/20 focus:border-[#2d5a27] outline-hidden shadow-xs"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-600 block uppercase tracking-wide">প্রমাণস্বরূপ ফাইল বা ছবি (এনভিডেন্স)</label>
                  <div className="relative group">
                    <div className="border-2 border-dashed border-neutral-200 group-hover:border-[#2d5a27]/40 rounded-3xl p-8 text-center transition bg-neutral-50/50 group-hover:bg-emerald-50/30">
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleEvidenceChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-neutral-200/60 rounded-full flex items-center justify-center mx-auto text-neutral-500 group-hover:text-[#2d5a27] group-hover:bg-emerald-50 transition shadow-sm">
                           <Plus className="w-6 h-6" />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-600">ক্লিক করুন অথবা ড্র্যাগ-ড্রপ করে ফাইল ধরুন</p>
                        <p className="text-[10px] text-gray-400">সর্বোচ্চ ১০ মেগাবাইট (JPEG, PNG, বা PDF ফাইল গ্রহণযোগ্য)</p>
                      </div>
                    </div>
                  </div>

                  {cpEvidenceList.length > 0 && (
                    <div className="mt-3 bg-neutral-100 p-3 rounded-xl space-y-2 border">
                      <span className="text-xs font-bold text-gray-500 block">সংযুক্ত ফাইল ({cpEvidenceList.length}টি):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cpEvidenceList.map((file, idx) => (
                           <div key={idx} className="flex justify-between items-center bg-white border p-2 rounded-lg text-xs font-semibold shadow-xs">
                             <span className="truncate max-w-[180px] font-sans text-neutral-600 block">{file.name}</span>
                             <button
                               type="button"
                               onClick={() => setCpEvidenceList(prev => prev.filter((_, i) => i !== idx))}
                               className="text-red-500 hover:text-red-700 px-1.5 focus:outline-none"
                             >মুছে ফেলুন</button>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 text-[#CD5C5C] shrink-0 mt-0.5" />
                   <p className="text-xs text-[#CD5C5C] font-semibold leading-relaxed">
                     সতর্কতা: কোনো মিথ্যা বা উদ্দেশ্যপ্রণোদিত কুৎসা রটানোর অভিযোগ দাখিল করা আইনত দণ্ডনীয় অপরাধ। সকল তথ্য সত্য ও বস্তুনিষ্ঠ হওয়া বাঞ্ছনীয়।
                   </p>
                </div>

                <div className="text-right">
                   <button
                     type="submit"
                     disabled={isSubmittingComplaint}
                     className="w-full sm:w-auto px-8 py-3.5 bg-[#2d5a27] hover:bg-[#1f3f1b] disabled:bg-neutral-300 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-[#2d5a27]/20 flex items-center justify-center gap-2 cursor-pointer"
                   >
                     {isSubmittingComplaint ? (
                       <><RefreshCw className="w-5 h-5 animate-spin" /> অভিযোগ জমা হচ্ছে...</>
                     ) : (
                       <><Send className="w-4 h-4" /> অভিযোগ দাখিল করুন</>
                     )}
                   </button>
                </div>
              </form>
            )}
          </div>
        )}

        {complaintTab === "status" && (
          <div className="space-y-8 text-left font-sans animate-fade-in">
             <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 shadow-inner">
                <h3 className="font-serif font-extrabold text-[#2d5a27] text-lg sm:text-xl mb-4">আপনার অভিযোগটি ট্র্যাক করুন</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 block">ট্র্যাকিং কোড দিয়ে খুঁজুন (Complaint ID):</label>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={cpTrackingId || ""}
                          onChange={(e) => setCpTrackingId(e.target.value)}
                          placeholder="যেমন: COMP-2026-0601"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[#2d5a27] focus:outline-none uppercase font-mono"
                        />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 block">মোবাইল নম্বর দিয়ে খুঁজুন (Applicant Phone):</label>
                     <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={cpTrackingPhone || ""}
                          onChange={(e) => setCpTrackingPhone(e.target.value)}
                          placeholder="যেমন: ০১৭১২-৩৪৫"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-[#2d5a27] focus:outline-none"
                        />
                     </div>
                   </div>
                </div>
                {(cpTrackingId || cpTrackingPhone) && (
                  <div className="text-right mt-3">
                    <button onClick={() => { setCpTrackingId(""); setCpTrackingPhone(""); }} className="text-xs font-bold text-[#CD5C5C] hover:underline">অনুসন্ধান ক্লিয়ার করুন</button>
                  </div>
                )}
             </div>

             <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b">
                   <h4 className="font-serif font-extrabold text-neutral-800 text-base sm:text-lg">অভিযোগ ও প্রতিকার ট্র্যাকিং ফিড</h4>
                   <span className="text-xs font-bold text-gray-400">{filteredComplaints.length}টি তালিকাভুক্ত</span>
                </div>

                {isLoadingComplaints ? (
                  <div className="text-center py-12">
                     <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#2d5a27]" />
                     <p className="text-xs text-gray-400 font-bold mt-2">লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
                  </div>
                ) : filteredComplaints.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 rounded-2xl border">
                     <div className="text-3xl mb-2 opacity-50">🔍</div>
                     <p className="text-gray-500 font-bold">প্রদত্ত তথ্যের সাথে মেলে এমন কোনো অভিযোগ পাওয়া যায়নি।</p>
                     <p className="text-xs text-gray-400 mt-1">দয়া করে ট্র্যাকিং আইডি অথবা রেজিস্টার্ড মোবাইল নম্বরটি পুনরায় যাচাই করুন।</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredComplaints.map((item) => {
                      const isResolved = item.status === "Resolved";
                      const isProcessing = item.status === "Processing";
                      const isVerified = item.status === "Verified";
                      const isPending = item.status === "Pending";
                      const isRejected = item.status === "Rejected";

                      let statusColor = "bg-neutral-100 text-neutral-600 border-neutral-200";
                      let statusText = "অপেক্ষমাণ";

                      if (isResolved) {
                        statusColor = "bg-green-50 text-green-700 border-green-200 shadow-sm shadow-green-100";
                        statusText = "সমাধানকৃত (Resolved)";
                      } else if (isProcessing) {
                        statusColor = "bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm shadow-yellow-100";
                        statusText = "তদন্ত বা প্রক্রিয়াদীন (Processing)";
                      } else if (isVerified) {
                        statusColor = "bg-blue-50 text-blue-700 border-blue-200 shadow-sm shadow-blue-100";
                        statusText = "যাচাইকৃত ও অনুমোদিত";
                      } else if (isPending) {
                        statusColor = "bg-amber-50 text-amber-700 border-amber-200";
                        statusText = "পর্যালোচনার অপেক্ষায় (Pending)";
                      } else if (isRejected) {
                        statusColor = "bg-red-50 text-red-700 border-red-200";
                        statusText = "বাতিলকৃত (Rejected)";
                      }

                      let stepIdx = 0;
                      if (isVerified) stepIdx = 1;
                      if (isProcessing) stepIdx = 2;
                      if (isResolved) stepIdx = 3;
                      if (isRejected) stepIdx = -1;

                      return (
                        <div key={item.id} className="bg-white border hover:border-neutral-300 rounded-3xl p-5 sm:p-6 transition shadow-sm space-y-4">
                           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                             <div>
                               <span className="text-xs font-bold text-[#CD5C5C] font-mono tracking-wider">{item.id}</span>
                               <span className="mx-2 text-gray-200">|</span>
                               <span className="text-xs font-serif font-semibold text-gray-500">{item.unionName}</span>
                             </div>
                             <span className={`px-3 py-1 text-xs font-bold border rounded-full ${statusColor}`}>{statusText}</span>
                           </div>

                           <div className="space-y-2">
                             <h4 className="font-serif font-extrabold text-neutral-800 text-sm sm:text-base leading-snug">{item.title}</h4>
                             <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{item.description}</p>
                           </div>

                           {stepIdx >= 0 && (
                             <div className="py-4 border-t border-b border-neutral-100">
                               <span className="text-xs font-bold text-gray-400 block mb-3 font-sans">বর্তমান অগ্রগতি ধাপ (Progress Stage):</span>
                               <div className="grid grid-cols-4 relative">
                                  <div className="absolute top-3 left-[12%] right-[12%] h-[2px] bg-neutral-200 -z-1" />
                                  <div 
                                    className="absolute top-3 left-[12%] h-[2px] bg-emerald-500 -z-1 transition-all duration-500" 
                                    style={{ width: `${stepIdx===0? 0 : stepIdx===1? 33 : stepIdx===2? 66 : 100}%` }}
                                  />
                                  {[
                                    { title: "১. দাখিল", desc: "Submitted" },
                                    { title: "২. যাচাই", desc: "Verified" },
                                    { title: "৩. প্রক্রিয়াদীন", desc: "Processing" },
                                    { title: "৪. মীমাংসা", desc: "Resolved" }
                                  ].map((step, sIdx) => {
                                    const accomplished = sIdx <= stepIdx;
                                    const current = sIdx === stepIdx;
                                    return (
                                      <div key={sIdx} className="text-center space-y-1 relative z-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto transition ${current? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110' : accomplished? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-400'}`}>
                                          {accomplished ? "✓" : sIdx + 1}
                                        </div>
                                        <span className={`text-[10px] font-bold block ${accomplished? 'text-neutral-800' : 'text-neutral-400'}`}>{step.title}</span>
                                        <span className="text-[8px] tracking-wide text-neutral-400 font-mono block uppercase">{step.desc}</span>
                                      </div>
                                    );
                                  })}
                               </div>
                             </div>
                           )}

                           {item.actionLog && item.actionLog.length > 0 && (
                             <div className="space-y-2 pt-2">
                                <span className="text-xs font-bold text-gray-500 block">প্রক্রিয়া ও তদন্তের ইতিহাস লগ (Action Log):</span>
                                <div className="space-y-3 pl-2.5 border-l-2 border-emerald-500/20">
                                   {item.actionLog.map((log: any, lIdx: number) => (
                                     <div key={lIdx} className="relative pl-4 space-y-0.5">
                                       <div className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                                       <div className="flex justify-between items-center text-[11px] sm:text-xs">
                                          <span className="font-serif text-neutral-700 font-bold">{log.message}</span>
                                          <span className="text-gray-400 font-mono font-bold shrink-0 ml-1">{log.date}</span>
                                       </div>
                                     </div>
                                   ))}
                                </div>
                             </div>
                           )}

                           <div className="flex justify-between items-center text-xs text-gray-400 pt-2 font-mono">
                              <span>আবেদনকারী: {item.complainantName}</span>
                              <span>মোবাইল: {item.complainantPhone?.replace(/.(?=.{4})/g, "*")}</span>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>
          </div>
        )}

        {complaintTab === "contact_feedback" && (
          <div className="space-y-8 animate-fade-in text-left font-sans">
             <div className="space-y-4">
                <h3 className="font-serif font-extrabold text-[#2d5a27] text-lg sm:text-xl pb-2 border-b">অভিযোগ নিষ্পত্তিকারী কর্মকর্তা ও কন্টাক্ট ডেস্ক</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="bg-[#2d5a27]/5 border border-[#2d5a27]/10 p-5 rounded-3xl space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 bg-[#2d5a27]/10 text-[#2d5a27] text-[10px] font-bold rounded-bl-xl">প্রধান সমন্বয়ক</div>
                      <div className="flex gap-3 items-start">
                         <div className="w-10 h-10 bg-[#2d5a27]/10 rounded-full flex items-center justify-center text-neutral-600 shadow-sm mt-0.5">
                            <Landmark className="w-5 h-5 text-[#2d5a27]" />
                         </div>
                         <div>
                            <h4 className="font-serif font-extrabold text-neutral-800 text-sm sm:text-base">উপজেলা নির্বাহী অফিসার (ইউএনও)</h4>
                            <span className="text-[11px] font-bold text-gray-400 block">অভিযোগ ও প্রতিকার সেল, পুঠিয়া</span>
                         </div>
                      </div>
                      <div className="text-xs sm:text-sm space-y-1.5 text-neutral-600">
                         <p>📍 <strong>কার্যালয়:</strong> ২য় তলা, উপজেলা পরিষদ ভবন, পুঠিয়া</p>
                         <p>⏱️ <strong>সাক্ষাতের সময়:</strong> প্রতি কার্যদিবসে সকাল ১০:০০ - দুপুর ১২:০০</p>
                         <p>📧 <strong>ইমেইল:</strong> unoputhia@mopa.gov.bd</p>
                      </div>
                      <div className="pt-2">
                        <button onClick={() => onSimulateCall("০১৭৩৩-৩৪৭৭৫৫", "UNOPuthia Office")} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-emerald-50 text-[#2d5a27] border border-[#2d5a27]/20 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs">
                          📞 উপজেলা হ্যাপ্পি গ্রিভেন্স ডেস্কে কল করুন
                        </button>
                      </div>
                   </div>

                   <div className="bg-red-50/20 border border-red-100 p-5 rounded-3xl space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 bg-red-100/50 text-[#CD5C5C] text-[10px] font-bold rounded-bl-xl">টোল ফ্রি হেল্পলাইন</div>
                      <div className="flex gap-3 items-start">
                         <div className="w-10 h-10 bg-red-100/30 rounded-full flex items-center justify-center text-red-600 shadow-sm mt-0.5">
                            <HelpCircle className="w-5 h-5 text-[#CD5C5C]" />
                         </div>
                         <div>
                            <h4 className="font-serif font-extrabold text-neutral-800 text-sm sm:text-base">জাতীয় অভিযোগ হেল্পলাইন ডেস্ক</h4>
                            <span className="text-[11px] font-bold text-gray-400 block">সরকারি সেবা সংক্রান্ত সাহায্য</span>
                         </div>
                      </div>
                      <div className="text-xs sm:text-sm space-y-1.5 text-neutral-600">
                         <p>📞 <strong>নাগরিক হেল্পলাইন:</strong> ৩৩৩ (ফ্রি কলিং)</p>
                         <p>💼 <strong>উপজেলা সহকারী ডেস্কে অভিযোগ গ্রহণ:</strong> ০৯৬১-২৩৪৫৬৭</p>
                         <p>⏱️ <strong>পরিষেবা সময়সূচী:</strong> ২৪ ঘণ্টা (যেকোনো দিন)</p>
                      </div>
                      <div className="pt-2">
                         <button onClick={() => onSimulateCall("৩৩৩", "National Citizens Helpline")} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-red-50 text-[#CD5C5C] border border-red-100 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs">
                           📞 সরাসরি ৩৩৩ ডায়াল করুন
                         </button>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-neutral-50 p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-inner">
                <h3 className="font-serif font-extrabold text-[#2d5a27] text-lg sm:text-xl pb-2 border-b">আমাদের পরিষেবার উপর আপনার মন্তব্য ও সুপারিেশ প্রদান করুন</h3>
                
                {feedbackSuccess ? (
                  <div className="text-center py-6 bg-green-50 rounded-2xl border border-green-200 space-y-2 mt-4 anime-fade-in">
                     <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow"><Check className="w-6 h-6 animate-bounce" /></div>
                     <h4 className="font-bold text-green-900 font-serif">আপনার গুরুত্বপূর্ণ মতামত সফলভাবে গ্রহণ করা হয়েছে!</h4>
                     <p className="text-sm text-green-700 font-medium font-sans">উপজেলা প্রশাসনের সেবার মানোন্নয়নে আপনার অংশীদারিত্বের জন্য ধন্যবাদ।</p>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4 mt-4 font-sans text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-600">আপনার নাম <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={feedbackName || ""}
                            onChange={(e) => setFeedbackName(e.target.value)}
                            placeholder="আপনার নাম"
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a27]"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-600">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                          <input
                            type="tel"
                            required
                            value={feedbackPhone || ""}
                            onChange={(e) => setFeedbackPhone(e.target.value)}
                            placeholder="০১৭XX-XXXXXX"
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5a27]"
                          />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-600 block">সেবার মান মূল্যায়ন (রেটিং) <span className="text-red-500">*</span></label>
                       <div className="flex gap-2">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <button
                             type="button"
                             key={star}
                             onClick={() => setFeedbackRating(star)}
                             className="focus:outline-none hover:scale-110 transition-transform"
                           >
                             <Star className={`w-6 h-6 ${star <= feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                           </button>
                         ))}
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-600 block">পরামর্শ বা মতামত <span className="text-red-500">*</span></label>
                       <textarea
                         required
                         rows={3}
                         value={feedbackMsg || ""}
                         onChange={(e) => setFeedbackMsg(e.target.value)}
                         placeholder="আপনার সুপারিেশ বা মতামত লিখুন..."
                         className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2d5a27]"
                       />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingFeedback}
                      className="px-5 py-2.5 bg-[#2d5a27] text-white font-bold rounded-xl text-sm hover:bg-[#1a3816] transition-colors cursor-pointer disabled:bg-neutral-300"
                    >
                      {isSubmittingFeedback ? 'মতামত পাঠানো হচ্ছে...' : 'মতামত সাবমিট করুন'}
                    </button>
                  </form>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
