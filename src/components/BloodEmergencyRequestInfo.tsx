import React, { useState, useEffect } from "react";
import { ArrowLeft, Phone, MapPin, Calendar, Heart, ShieldAlert, PlusCircle, List, Building, Users, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp, addDoc } from "firebase/firestore";
import { BloodRequest } from "../types";

export function BloodEmergencyRequestInfo({ onGoBack }: { onGoBack: () => void }) {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("post");
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "O+",
    hospital: "",
    location: "পুঠিয়া উপজেলা",
    units: 1,
    contactNumber: "",
    neededAt: "",
    details: "",
    isCritical: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Load requests on mount
  useEffect(() => {
    const q = query(collection(db, "blood_requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: BloodRequest[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as BloodRequest);
      });
      setRequests(list);
      setIsLoading(false);
    }, (error) => {
      if (error?.message?.includes("Quota") || error?.code === "resource-exhausted") {
        console.warn("Firestore quota limit reached for blood requests.");
      } else {
        console.warn("Error loading blood requests:", error?.message || error);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'units' ? parseInt(value) || 1 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!formData.patientName || !formData.hospital || !formData.contactNumber || !formData.neededAt) {
      alert("দয়া করে প্রয়োজনীয় সব তথ্য পূরণ করুন।");
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "blood_requests"), {
        ...formData,
        status: "pending",
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      setFormData({
        patientName: "",
        bloodGroup: "O+",
        hospital: "",
        location: "পুঠিয়া উপজেলা",
        units: 1,
        contactNumber: "",
        neededAt: "",
        details: "",
        isCritical: false
      });
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab("demand");
      }, 2000);
    } catch (err) {
      console.error("Error posting blood request:", err);
      alert("পোস্ট করতে সমস্যা হয়েছে।");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই রিকোয়েস্টটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "blood_requests", id));
    } catch (err) {
      console.error("Error deleting blood request:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="font-sans space-y-6 pb-6 text-left" id="emergency-blood-view">
      {/* Dynamic Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #991B1B, #DC2626)" }}
      >
        <button 
          onClick={onGoBack} 
          id="emergency-back-btn"
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        
        <div className="mt-6 relative z-10">
          <span className="bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 inline-block">
            {activeTab === "post" && "জরুরি রক্তের রিকোয়েস্ট ফর্ম"}
            {activeTab === "demand" && "আজকের রক্তের চাহিদা তালিকা"}
            {activeTab === "hospital" && "উপজেলা হাসপাতাল ও ক্লিনিক ডিরেক্টরি"}
            {activeTab === "team" && "স্বেচ্ছাসেবী সংগঠন ও ভলান্টিয়ার টিম"}
          </span>
          <h1 className="text-3xl font-black mb-3 text-white">
            {activeTab === "post" && "রক্তের পোস্ট দিন"}
            {activeTab === "demand" && "লাইভ রক্তের চাহিদা"}
            {activeTab === "hospital" && "হাসপাতাল ডিরেক্টরি"}
            {activeTab === "team" && "ভলান্টিয়ার নেটওয়ার্ক"}
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
            {activeTab === "post" && "পুঠিয়া ও আশেপাশের হাসপাতালে চিকিৎসাধীন রোগীর জন্য রক্তের জরুরি পোস্ট তৈরি করুন।"}
            {activeTab === "demand" && "আজকের দিনে পুঠিয়া উপজেলার বিভিন্ন হাসপাতাল থেকে আসা লাইভ ব্লাড রিকোয়েস্ট এবং জরুরি রক্তের চাহিদার রিয়েল-টাইম ডাটা তালিকা।"}
            {activeTab === "hospital" && "পুঠিয়া উপজেলার সরকারি হাসপাতাল ও প্রাইভেট ক্লিনিকের কন্টাক্ট ডিরেক্টরি। জরুরি ব্লাড ব্যাংক বা অ্যাম্বুলেন্সের জন্য যোগাযোগ করুন।"}
            {activeTab === "team" && "পুঠিয়া উপজেলার বিভিন্ন রক্তদান সংগঠন ও ভলান্টিয়ারদের তালিকা। যেকোনো জরুরি পরিস্থিতিতে রক্তদাতার খোঁজে এদের সাথে যোগাযোগ করতে পারেন।"}
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* 4 Interactive Sub-menu Tabs */}
      <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => setActiveTab('post')} 
            className={`p-2 rounded-xl cursor-pointer text-center border transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm ${
              activeTab === 'post' 
                ? 'bg-red-50 border-red-300 text-red-700 font-bold' 
                : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
            }`}
          >
              <PlusCircle className={`w-5 h-5 ${activeTab === 'post' ? 'text-[#D32F2F] scale-110' : 'text-gray-400'} transition-transform`} />
              <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight">রক্তের পোস্ট</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('demand')} 
            className={`p-2 rounded-xl cursor-pointer text-center border transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm ${
              activeTab === 'demand' 
                ? 'bg-red-50 border-red-300 text-red-700 font-bold' 
                : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
            }`}
          >
              <List className={`w-5 h-5 ${activeTab === 'demand' ? 'text-[#D32F2F] scale-110' : 'text-gray-400'} transition-transform`} />
              <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight">আজকের চাহিদা</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('hospital')} 
            className={`p-2 rounded-xl cursor-pointer text-center border transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm ${
              activeTab === 'hospital' 
                ? 'bg-red-50 border-red-300 text-red-700 font-bold' 
                : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
            }`}
          >
              <Building className={`w-5 h-5 ${activeTab === 'hospital' ? 'text-[#D32F2F] scale-110' : 'text-gray-400'} transition-transform`} />
              <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight">উপজেলা হাসপাতাল</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('team')} 
            className={`p-2 rounded-xl cursor-pointer text-center border transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm ${
              activeTab === 'team' 
                ? 'bg-red-50 border-red-300 text-red-700 font-bold' 
                : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
            }`}
          >
              <Users className={`w-5 h-5 ${activeTab === 'team' ? 'text-[#D32F2F] scale-110' : 'text-gray-400'} transition-transform`} />
              <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight">ভলান্টিয়ার টিম</span>
          </button>
      </div>

      {/* Content Area Rendering Based on Selected Tab */}
      <div id="tab-content-container" className="space-y-4">
        
        {/* TAB 1: FORM TO POST BLOOD REQUEST */}
        {activeTab === "post" && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden space-y-5">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#D32F2F]"></div>
            
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#D32F2F]" /> নতুন রক্তের রিকোয়েস্ট তৈরি করুন
            </h3>

            {showSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3.5 rounded-xl text-sm font-bold text-center animate-pulse">
                🎉 রক্তের রিকোয়েস্টটি সফলভাবে সেভ করা হয়েছে! এটি আজকের চাহিদার তালিকায় প্রকাশ করা হচ্ছে...
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient/Reason */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">১. রোগী বা রোগের বিবরণ (রোগীর নাম বা সিজার/দুর্ঘটনা) *</label>
                  <input 
                    type="text"
                    name="patientName"
                    value={formData.patientName || ""}
                    onChange={handleInputChange}
                    required
                    placeholder="উদাঃ সিজারিয়ান অপারেশন (গর্ভবতী মা)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] text-sm outline-none"
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">২. প্রয়োজনীয় রক্তের গ্রুপ *</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] text-sm outline-none font-bold text-red-600"
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(g => (
                      <option key={g} value={g || ""}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bags count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">৩. রক্তের পরিমাণ (ব্যাগ) *</label>
                  <input 
                    type="number"
                    name="units"
                    min="1"
                    value={formData.units || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] text-sm outline-none"
                  />
                </div>

                {/* Urgency / Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">৪. কখন রক্ত লাগবে? *</label>
                  <input 
                    type="text"
                    name="neededAt"
                    value={formData.neededAt || ""}
                    onChange={handleInputChange}
                    required
                    placeholder="উদাঃ আজ সন্ধ্যার মধ্যে বা ২০ জুন সকাল ১০টা"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] text-sm outline-none"
                  />
                </div>
              </div>

              {/* Location/Hospital */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">৫. রক্তদানের নির্দিষ্ট স্থান/হাসপাতাল *</label>
                <div className="relative">
                  <span className="absolute left-3 inset-y-0 flex items-center text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    name="hospital"
                    value={formData.hospital || ""}
                    onChange={handleInputChange}
                    required
                    placeholder="উদাঃ পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স, পুঠিয়া"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] text-sm outline-none"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">৬. যোগাযোগের মোবাইল নম্বর (রোগীর স্বজন) *</label>
                <div className="relative">
                  <span className="absolute left-3 inset-y-0 flex items-center text-gray-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input 
                    type="tel"
                    name="contactNumber"
                    maxLength={11}
                    value={formData.contactNumber || ""}
                    onChange={handleInputChange}
                    required
                    placeholder="উদাঃ 01712345678"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] text-sm outline-none"
                  />
                </div>
              </div>

              {/* Additional description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">৭. অতিরিক্ত বিবরণ বা রোগীর অবস্থা (ঐচ্ছিক)</label>
                <textarea 
                  name="details"
                  rows={2}
                  value={formData.details || ""}
                  onChange={handleInputChange}
                  placeholder="রোগীর অবস্থা, রক্তের জটিলতা বা যেকোনো বিশেষ তথ্য থাকলে এখানে লিখুন ভাই..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] text-sm outline-none resize-none"
                />
              </div>

              {/* Urgency checkbox */}
              <label className="flex items-center gap-2 mt-2 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 cursor-pointer">
                <input 
                  type="checkbox"
                  name="isCritical"
                  checked={formData.isCritical}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded cursor-pointer accent-[#D32F2F]"
                />
                রোগীর অবস্থা কি অত্যন্ত আশঙ্কাজনক বা দ্রুত রক্তের প্রয়োজন? (Critical Urgency Tag)
              </label>

              {/* Submit button */}
              <button 
                type="submit"
                disabled={isPosting}
                id="post-submit-btn"
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-red-300 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer border-none"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    প্রকাশ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-current" />
                    রক্তের পোস্ট প্রকাশ করুন
                  </>
                )}
              </button>
            </form>
          </div>
        )}
 
        {/* TAB 2: LIVE DEMANDS LIST */}
        {activeTab === "demand" && (
          <div className="space-y-4">
            <h3 className="text-md font-extrabold text-gray-800 px-1">
              আজকের সক্রিয় রক্তের চাহিদা ({requests.length} টি)
            </h3>
            
            {isLoading ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D32F2F] animate-spin mb-2" />
                <p className="text-xs text-gray-500 font-bold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
                <span className="text-4xl block mb-2">📋</span>
                <h5 className="text-base font-bold text-gray-800 mb-1">বর্তমানে কোনো রক্তের চাহিদা পোস্ট করা নেই</h5>
                <p className="text-gray-500 text-xs">আপনার কোনো রক্তের জরুরি প্রয়োজন হলে "রক্তের পোস্ট দিন" ট্যাবে গিয়ে পোস্ট করতে পারেন ভাই।</p>
              </div>
            ) : (
              requests.map((req, index) => (
                <div 
                  key={req.id || index} 
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden"
                >
                  {/* Delete button for user's own posts */}
                  {user && req.userId === user.uid && (
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="absolute top-4 right-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-none bg-transparent z-10"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {req.isCritical && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 animate-pulse" /> Critical Urgent
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4 pr-16">
                    <div className="bg-red-50 text-[#D32F2F] w-12 h-12 rounded-full flex items-center justify-center text-md font-black shadow-inner border border-red-100 shrink-0">
                      {req.bloodGroup}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-800 leading-tight">{req.patientName}</h4>
                      <p className="text-xs font-semibold text-gray-500 mt-1.5 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" /> 
                        <span>{req.hospital}, {req.location}</span>
                      </p>
                    </div>
                  </div>
 
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-400 text-[10px]">🩸 পরিমাণ</span>
                      <span>{req.units} ব্যাগ</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-l border-gray-200 pl-3">
                      <span className="text-gray-400 text-[10px]">🕒 কখন লাগবে</span>
                      <span className="text-[#D32F2F]">{req.neededAt}</span>
                    </div>
                  </div>
 
                  {req.details && (
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-xs text-gray-500 leading-relaxed text-justify">
                      <span className="font-bold text-gray-700 block mb-1">📝 বিবরণ:</span>
                      {req.details}
                    </div>
                  )}
 
                  <a 
                    href={`tel:${req.contactNumber}`} 
                    id={`contact-patient-${index}`}
                    className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-center py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <Phone className="w-4 h-4 fill-current" /> রোগীর স্বজনকে কল করুন ({req.contactNumber})
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: HOSPTAL DIRECTORY */}
        {activeTab === "hospital" && (
          <div className="space-y-4">
            <h3 className="text-md font-extrabold text-gray-800 px-1">
              উপজেলা হাসপাতাল ও অ্যাম্বুলেন্স তালিকা
            </h3>

            {[
              {
                name: "🏥 পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
                address: "পুঠিয়া সদর, পুঠিয়া, রাজশাহী",
                phone: "01711111111",
                ambulance: "01722222222"
              },
              {
                name: "🏥 ঝলমলিয়া লাইফ লাইন ক্লিনিক",
                address: "ঝলমলিয়া বাজার, পুঠিয়া, রাজশাহী",
                phone: "01733333333",
                ambulance: "01744444444"
              },
              {
                name: "🏥 বানেশ্বর ডায়াগনস্টিক ও জেনারেল হাসপাতাল",
                address: "বানেশ্বর বাজার, পুঠিয়া, রাজশাহী",
                phone: "01755555555",
                ambulance: "01766666666"
              }
            ].map((hospital, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                <div>
                  <h4 className="text-base font-bold text-gray-800 leading-tight">{hospital.name}</h4>
                  <p className="text-xs font-semibold text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {hospital.address}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a 
                    href={`tel:${hospital.phone}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-gray-200 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" /> হেল্পলাইন কল
                  </a>
                  <a 
                    href={`tel:${hospital.ambulance}`}
                    className="bg-red-50 hover:bg-red-100 text-[#D32F2F] text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-red-200 cursor-pointer"
                  >
                    🚑 অ্যাম্বুলেন্স
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: VOLUNTEER ORGANIZATIONS */}
        {activeTab === "team" && (
          <div className="space-y-4">
            <h3 className="text-md font-extrabold text-gray-800 px-1">
              স্বেচ্ছাসেবী রক্তদান সংগঠন
            </h3>

            {[
              {
                name: "🤝 পুঠিয়া ব্লাড ডোনার ক্লাব",
                field: "সমগ্র পুঠিয়া উপজেলাব্যাপী রক্ত সরবরাহ",
                desc: "যেকোনো জরুরি রক্তের প্রয়োজনে পুঠিয়া অঞ্চলের অ্যাডমিন ও স্বেচ্ছাসেবীদের সাথে কন্টাক্ট করার প্রধান প্লাটফর্ম ভাই।",
                leader: "মোঃ রাশেদুল হাসান সবুজ",
                phone: "01712345678"
              },
              {
                name: "🤝 বানেশ্বর যুব সমাজ সমাজকল্যাণ সমিতি",
                field: "বানেশ্বর ও পার্শ্ববর্তী জোন",
                desc: "বানেশ্বর জোন বা পঙ্গুয়াপাড়া অঞ্চলে রক্তের ডোনার ম্যানেজ করতে এদের সাহায্য খুবই ফলপ্রসূ হয়ে থাকে।",
                leader: "নাহিদ ইসলাম রাসেল",
                phone: "01823456789"
              }
            ].map((team, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="bg-red-50 text-[#D32F2F] p-2 rounded-xl text-lg shrink-0">🤝</div>
                  <div>
                    <h4 className="text-base font-bold text-gray-800 leading-tight">{team.name}</h4>
                    <p className="text-xs font-semibold text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {team.field}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed text-justify bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  {team.desc}
                </p>

                <div className="flex justify-between items-center text-xs font-bold text-gray-600 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                  <span>👤 প্রধান অ্যাডমিন:</span>
                  <span className="text-gray-800">{team.leader}</span>
                </div>

                <a 
                  href={`tel:${team.phone}`}
                  className="bg-zinc-800 hover:bg-zinc-900 text-white text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" /> টিম লিডারকে কল করুন ({team.phone})
                </a>
              </div>
            ))}
          </div>
        )}

      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
