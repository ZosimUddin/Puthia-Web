import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Camera, Calendar, ChevronDown, Search, Plus, 
  Briefcase, Building2, GraduationCap, Loader2, CheckCircle2, AlertCircle, Phone, Smartphone, Trash2,
  Mail, Globe, Share2, Shield, Lock, Eye, Sparkles, Check, X, Wrench, Store,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { compressImageToBase64 } from "../../api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: (e: React.FormEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCoverUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editLoading: boolean;
  editSuccess: boolean;
  editError: string;
}

const TABS = [
  { id: "basic", label: "১. মৌলিক তথ্য", icon: Sparkles },
  { id: "details", label: "২. ব্যক্তিগত বিবরণ", icon: Calendar },
  { id: "work", label: "৩. পেশা ও কাজ", icon: Briefcase },
  { id: "education", label: "৪. শিক্ষা জীবন", icon: GraduationCap },
  { id: "skills", label: "৫. দক্ষতা ও সেবা", icon: Wrench },
  { id: "contact", label: "৬. যোগাযোগ ও সোশ্যাল", icon: Phone },
  { id: "business", label: "৭. আমার ব্যবসা", icon: Store },
  { id: "privacy", label: "৮. তথ্য গোপনীয়তা", icon: Lock },
  { id: "status", label: "৯. প্রোফাইল স্ট্যাটাস", icon: Shield },
] as const;

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  onClose,
  formData,
  setFormData,
  handleSubmit,
  handleImageUpload,
  handleCoverUpload,
  editLoading,
  editSuccess,
  editError,
  isOpen,
}) => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "details" | "work" | "education" | "skills" | "contact" | "business" | "privacy" | "status"
  >("basic");

  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab);
  const goToNextTab = () => {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1].id as any);
    }
  };
  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(TABS[currentTabIndex - 1].id as any);
    }
  };

  const [coverUploading, setCoverUploading] = useState(false);

  // New Work Entry Form state
  const [newWork, setNewWork] = useState({
    company: "",
    position: "",
    type: "Full-time",
    location: "",
    startYear: "",
    endYear: "",
    current: false,
    description: ""
  });

  // New Education Entry Form state
  const [newEdu, setNewEdu] = useState({
    level: "High School / College",
    institution: "",
    degree: "",
    subject: "",
    startYear: "",
    endYear: "",
    current: false,
    description: ""
  });

  // Skill Tag Input state
  const [skillInput, setSkillInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handlePrivacyChange = (fieldKey: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      privacySettings: {
        ...(prev.privacySettings || {}),
        [fieldKey]: value
      }
    }));
  };

  const onCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    try {
      if (handleCoverUpload) {
        await handleCoverUpload(e);
      } else {
        const base64 = await compressImageToBase64(file);
        setFormData((prev: any) => ({ ...prev, coverURL: base64 }));
      }
    } catch (err) {
      console.error("Cover upload error:", err);
    } finally {
      setCoverUploading(false);
      e.target.value = '';
    }
  };

  // Add Work Experience Entry
  const handleAddWorkEntry = () => {
    if (!newWork.company.trim()) return;
    const existingList = Array.isArray(formData.workList) ? formData.workList : [];
    const updated = [...existingList, { ...newWork, id: Date.now().toString() }];
    setFormData((prev: any) => ({
      ...prev,
      workList: updated,
      workCompany: newWork.company,
      workRole: newWork.position
    }));
    setNewWork({
      company: "",
      position: "",
      type: "Full-time",
      location: "",
      startYear: "",
      endYear: "",
      current: false,
      description: ""
    });
  };

  const handleRemoveWorkEntry = (id: string) => {
    const existingList = Array.isArray(formData.workList) ? formData.workList : [];
    const updated = existingList.filter((w: any) => w.id !== id);
    setFormData((prev: any) => ({ ...prev, workList: updated }));
  };

  // Add Education Entry
  const handleAddEduEntry = () => {
    if (!newEdu.institution.trim()) return;
    const existingList = Array.isArray(formData.educationList) ? formData.educationList : [];
    const updated = [...existingList, { ...newEdu, id: Date.now().toString() }];
    setFormData((prev: any) => ({
      ...prev,
      educationList: updated,
      collegeUniversity: newEdu.institution,
      education: newEdu.institution
    }));
    setNewEdu({
      level: "High School / College",
      institution: "",
      degree: "",
      subject: "",
      startYear: "",
      endYear: "",
      current: false,
      description: ""
    });
  };

  const handleRemoveEduEntry = (id: string) => {
    const existingList = Array.isArray(formData.educationList) ? formData.educationList : [];
    const updated = existingList.filter((eItem: any) => eItem.id !== id);
    setFormData((prev: any) => ({ ...prev, educationList: updated }));
  };

  // Add Skill Tag
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const existing = Array.isArray(formData.skills) ? formData.skills : [];
    if (!existing.includes(skillInput.trim())) {
      setFormData((prev: any) => ({ ...prev, skills: [...existing, skillInput.trim()] }));
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    const existing = Array.isArray(formData.skills) ? formData.skills : [];
    setFormData((prev: any) => ({ ...prev, skills: existing.filter((s: string) => s !== skill) }));
  };

  // Add Service Tag
  const handleAddService = () => {
    if (!serviceInput.trim()) return;
    const existing = Array.isArray(formData.servicesOffered) ? formData.servicesOffered : [];
    if (!existing.includes(serviceInput.trim())) {
      setFormData((prev: any) => ({ ...prev, servicesOffered: [...existing, serviceInput.trim()] }));
    }
    setServiceInput("");
  };

  const handleRemoveService = (service: string) => {
    const existing = Array.isArray(formData.servicesOffered) ? formData.servicesOffered : [];
    setFormData((prev: any) => ({ ...prev, servicesOffered: existing.filter((s: string) => s !== service) }));
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-0 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 280 }}
          className="bg-slate-50 w-full max-w-xl sm:max-w-2xl rounded-none sm:rounded-[28px] shadow-2xl relative overflow-hidden border border-slate-200/80 h-full sm:h-auto sm:max-h-[92vh] flex flex-col text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sticky Header */}
          <div className="px-4 py-3 border-b border-slate-200/90 flex items-center justify-between bg-white sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-800 border-0 bg-transparent cursor-pointer transition active:scale-95"
                title="Back"
              >
                <ArrowLeft size={18} />
              </button>

              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                প্রোফাইল এডিট ও সেটিংস
              </h3>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={editLoading}
              className="px-4 py-1.5 bg-[#1877F2] hover:bg-blue-600 text-white font-black rounded-xl text-xs sm:text-sm disabled:opacity-50 border-0 cursor-pointer transition active:scale-95 flex items-center gap-1.5 shadow-xs"
            >
              {editLoading && <Loader2 size={15} className="animate-spin text-white" />}
              <span>সংরক্ষণ করুন (Save)</span>
            </button>
          </div>

          {/* Navigation Section Tabs (Never squished on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto px-3 py-2.5 bg-slate-100/90 border-b border-slate-200/90 shrink-0 text-xs font-bold scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
                    isActive 
                      ? "bg-[#1877F2] text-white border-[#1877F2] shadow-sm font-black" 
                      : "bg-white text-slate-700 hover:text-slate-900 border-slate-200/90 hover:bg-slate-50 shadow-2xs"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-white" : "text-slate-500"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 custom-scrollbar">
            {/* Feedback Alerts */}
            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 font-semibold text-xs animate-in fade-in duration-200">
                <AlertCircle className="shrink-0 text-rose-600" size={16} />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-semibold text-xs animate-in fade-in duration-200">
                <CheckCircle2 className="shrink-0 text-emerald-600" size={16} />
                <span>প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!</span>
              </div>
            )}

            {/* TAB 1: BASIC INFO */}
            {activeTab === "basic" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Header Profile & Cover Banner Card */}
                <div className="relative rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs overflow-hidden min-h-[170px] flex flex-col justify-between bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white">
                  {/* Cover Photo Preview */}
                  {formData.coverURL && (
                    <div className="absolute inset-0 z-0">
                      <img src={formData.coverURL} alt="Cover Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40" />
                    </div>
                  )}

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="text-sm font-black italic tracking-wide text-white drop-shadow-xs">
                      কভার ও প্রোফাইল ছবি
                    </span>
                    <div className="flex items-center gap-1.5">
                      {formData.coverURL && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev: any) => ({ ...prev, coverURL: '' }))}
                          className="px-2.5 py-1 bg-black/50 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition border border-white/20"
                        >
                          <Trash2 size={13} />
                          <span>মুছুন</span>
                        </button>
                      )}
                      <label className="px-3 py-1 bg-white text-slate-900 hover:bg-blue-50 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition shadow-xs border-0">
                        {coverUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                        <span>{coverUploading ? "আপলোড হচ্ছে..." : "কভার ছবি পরিবর্তন"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={onCoverFileSelect} disabled={coverUploading} />
                      </label>
                    </div>
                  </div>

                  {/* Avatar + Identity Info */}
                  <div className="relative z-10 flex items-center gap-3.5 pt-3">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white">
                        <img 
                          src={formData.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(formData.name || 'user')}`} 
                          alt={formData.name || "Avatar"} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition">
                        <Camera size={13} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg font-black truncate text-white drop-shadow-xs">
                        {formData.name || "User"}
                      </h4>
                      <p className="text-xs font-bold text-blue-200 truncate">
                        @{formData.username || (formData.name ? formData.name.toLowerCase().replace(/\s+/g, '') : 'user')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3.5 shadow-xs">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">পূর্ণ নাম (Full Name)</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1877F2]"
                      placeholder="আপনার নাম"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ইউজারনেম (Username)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400 font-extrabold text-sm">@</span>
                      <input
                        type="text"
                        name="username"
                        value={formData.username || ""}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
                          setFormData((prev: any) => ({ ...prev, username: val }));
                        }}
                        className="w-full pl-8 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1877F2]"
                        placeholder="আমাদেরপুঠিয়া"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">মোবাইল নম্বর (Phone)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-[#1877F2]"
                      placeholder="017XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">সংক্ষিপ্ত বায়ো (Bio)</label>
                    <textarea
                      name="bio"
                      value={formData.bio || ""}
                      onChange={(e) => {
                        if (e.target.value.length <= 160) handleChange(e);
                      }}
                      rows={3}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-[#1877F2] resize-none"
                      placeholder="নিজের সম্পর্কে ছোট পরিচিতি..."
                    />
                    <div className="text-right text-[11px] text-slate-400 font-semibold mt-1">
                      {(formData.bio || "").length}/160
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DETAILS */}
            {activeTab === "details" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3.5 shadow-xs">
                  {/* Birthday + Privacy */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">জন্মতারিখ (Date of Birth)</label>
                      <select
                        value={formData.privacySettings?.birthday || "Everyone"}
                        onChange={(e) => handlePrivacyChange("birthday", e.target.value)}
                        className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700"
                      >
                        <option value="Everyone">Everyone 🌐</option>
                        <option value="Friends">Friends 👥</option>
                        <option value="Only me">Only me 🔒</option>
                      </select>
                    </div>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate || formData.birthday || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, birthDate: e.target.value, birthday: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">লিঙ্গ (Gender)</label>
                    <select
                      name="gender"
                      value={formData.gender || "male"}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value="male">পুরুষ (Male)</option>
                      <option value="female">নারী (Female)</option>
                      <option value="other">অন্যান্য (Other)</option>
                    </select>
                  </div>

                  {/* Blood Group + Privacy */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">রক্তের গ্রুপ (Blood Group)</label>
                      <select
                        value={formData.privacySettings?.bloodGroup || "Everyone"}
                        onChange={(e) => handlePrivacyChange("bloodGroup", e.target.value)}
                        className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700"
                      >
                        <option value="Everyone">Everyone 🌐</option>
                        <option value="Friends">Friends 👥</option>
                        <option value="Only me">Only me 🔒</option>
                      </select>
                    </div>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value="">নির্বাচন করুন</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Hometown + Privacy */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">স্থায়ী বাসস্থান (Hometown)</label>
                      <select
                        value={formData.privacySettings?.hometown || "Everyone"}
                        onChange={(e) => handlePrivacyChange("hometown", e.target.value)}
                        className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700"
                      >
                        <option value="Everyone">Everyone 🌐</option>
                        <option value="Friends">Friends 👥</option>
                        <option value="Only me">Only me 🔒</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      name="hometown"
                      value={formData.hometown || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none"
                      placeholder="যেমন: রাজশাহী"
                    />
                  </div>

                  {/* Relationship Status + Privacy */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">সম্পর্কের অবস্থা (Relationship)</label>
                      <select
                        value={formData.privacySettings?.relationship || "Everyone"}
                        onChange={(e) => handlePrivacyChange("relationship", e.target.value)}
                        className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700"
                      >
                        <option value="Everyone">Everyone 🌐</option>
                        <option value="Friends">Friends 👥</option>
                        <option value="Only me">Only me 🔒</option>
                      </select>
                    </div>
                    <select
                      name="relationshipStatus"
                      value={formData.relationshipStatus || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value="">নির্বাচন করুন</option>
                      <option value="Single">Single (অবিবাহিত)</option>
                      <option value="Married">Married (বিবাহিত)</option>
                      <option value="In a relationship">In a relationship</option>
                      <option value="Engaged">Engaged</option>
                      <option value="It's complicated">It's complicated</option>
                    </select>
                  </div>

                  {/* Union, Village, Post Office */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">ইউনিয়ন</label>
                      <input
                        type="text"
                        name="union"
                        value={formData.union || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                        placeholder="যেমন: বাণেশ্বর"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">গ্রাম / এলাকা</label>
                      <input
                        type="text"
                        name="village"
                        value={formData.village || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                        placeholder="যেমন: তারাপুর"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">পোস্ট অফিস</label>
                      <input
                        type="text"
                        name="postOffice"
                        value={formData.postOffice || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                        placeholder="যেমন: পুঠিয়া পোস্ট"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WORK */}
            {activeTab === "work" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Existing Work List */}
                {Array.isArray(formData.workList) && formData.workList.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-700">যুক্ত করা কাজের তালিকা:</h4>
                    {formData.workList.map((w: any) => (
                      <div key={w.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                        <div>
                          <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">{w.company}</h5>
                          <p className="text-xs text-slate-600 font-semibold">{w.position} • {w.type}</p>
                          <p className="text-[11px] text-slate-400">{w.startYear} - {w.current ? "বর্তমান" : w.endYear}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkEntry(w.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border-0 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Work Form */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Briefcase size={16} className="text-[#1877F2]" />
                    <span>নতুন কর্মসংস্থান যোগ করুন</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">প্রতিষ্ঠানের নাম</label>
                      <input
                        type="text"
                        value={newWork.company}
                        onChange={(e) => setNewWork(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        placeholder="যেমন: আর জে সফটওয়্যার"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">পদবি</label>
                      <input
                        type="text"
                        value={newWork.position}
                        onChange={(e) => setNewWork(prev => ({ ...prev, position: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        placeholder="যেমন: সিইও / ম্যানেজার"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">কাজের ধরন</label>
                      <select
                        value={newWork.type}
                        onChange={(e) => setNewWork(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="Full-time">ফুলটাইম (Full-time)</option>
                        <option value="Part-time">পার্টটাইম (Part-time)</option>
                        <option value="Freelance">ফ্রিল্যান্স (Freelance)</option>
                        <option value="Government">সরকারি চাকরি</option>
                        <option value="Business">নিজস্ব ব্যবসা</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">অবস্থান / স্থান</label>
                      <input
                        type="text"
                        value={newWork.location}
                        onChange={(e) => setNewWork(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        placeholder="যেমন: পুঠিয়া, রাজশাহী"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">শুরু বছর</label>
                      <input
                        type="text"
                        value={newWork.startYear}
                        onChange={(e) => setNewWork(prev => ({ ...prev, startYear: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        placeholder="২০২০"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">শেষ বছর</label>
                      <input
                        type="text"
                        disabled={newWork.current}
                        value={newWork.current ? "বর্তমান" : newWork.endYear}
                        onChange={(e) => setNewWork(prev => ({ ...prev, endYear: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold disabled:opacity-60"
                        placeholder="২০২৪"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="currentWork"
                      checked={newWork.current}
                      onChange={(e) => setNewWork(prev => ({ ...prev, current: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#1877F2]"
                    />
                    <label htmlFor="currentWork" className="text-xs font-bold text-slate-700 cursor-pointer">
                      আমি বর্তমানে এখানে কাজ করছি
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWorkEntry}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer border-0"
                  >
                    + কাজের অভিজ্ঞতা যুক্ত করুন
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: EDUCATION */}
            {activeTab === "education" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Existing Edu List */}
                {Array.isArray(formData.educationList) && formData.educationList.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-700">যুক্ত করা শিক্ষা প্রতিষ্ঠান:</h4>
                    {formData.educationList.map((eItem: any) => (
                      <div key={eItem.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                        <div>
                          <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">{eItem.institution}</h5>
                          <p className="text-xs text-slate-600 font-semibold">{eItem.level} • {eItem.subject || eItem.degree}</p>
                          <p className="text-[11px] text-slate-400">{eItem.startYear} - {eItem.current ? "অধ্যয়নরত" : eItem.endYear}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEduEntry(eItem.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border-0 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Education Form */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <GraduationCap size={16} className="text-purple-600" />
                    <span>নতুন শিক্ষা প্রতিষ্ঠান যোগ করুন</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">শিক্ষা স্তর</label>
                      <select
                        value={newEdu.level}
                        onChange={(e) => setNewEdu(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="High School">মাধ্যমিক (High School)</option>
                        <option value="College">উচ্চ মাধ্যমিক (College)</option>
                        <option value="University">বিশ্ববিদ্যালয় (University)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">প্রতিষ্ঠানের নাম</label>
                      <input
                        type="text"
                        value={newEdu.institution}
                        onChange={(e) => setNewEdu(prev => ({ ...prev, institution: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        placeholder="যেমন: এন.এস. সরকারি কলেজ"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">বিভাগ / বিষয়</label>
                      <input
                        type="text"
                        value={newEdu.subject}
                        onChange={(e) => setNewEdu(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        placeholder="যেমন: বিজ্ঞান / রাষ্ট্রবিজ্ঞান"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">ডিগ্রি</label>
                      <input
                        type="text"
                        value={newEdu.degree}
                        onChange={(e) => setNewEdu(prev => ({ ...prev, degree: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        placeholder="যেমন: এইচএসসি / অনার্স"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddEduEntry}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition cursor-pointer border-0"
                  >
                    + শিক্ষা প্রতিষ্ঠান যুক্ত করুন
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: SKILLS & SERVICES */}
            {activeTab === "skills" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-4 shadow-xs">
                  {/* Skills Section */}
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 mb-2">
                      <Wrench size={16} className="text-cyan-600" />
                      <span>আমার দক্ষতাসমূহ (Skills)</span>
                    </h4>

                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        placeholder="যেমন: Web Design, Photography"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-3 py-2 bg-cyan-600 text-white font-bold text-xs rounded-xl cursor-pointer border-0"
                      >
                        + যোগ
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(formData.skills) && formData.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-cyan-50 text-cyan-800 font-extrabold text-xs rounded-xl border border-cyan-200 flex items-center gap-1.5">
                          <span>{skill}</span>
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-600 text-slate-400 font-black border-0 bg-transparent cursor-pointer">✕</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Services Section */}
                  <div className="border-t border-slate-100 pt-3">
                    <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 mb-2">
                      <Briefcase size={16} className="text-indigo-600" />
                      <span>প্রদানকৃত সেবাসমূহ (Services Offered)</span>
                    </h4>

                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={serviceInput}
                        onChange={(e) => setServiceInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        placeholder="যেমন: অটো সার্ভিস, ল্যাপটপ মেরামত"
                      />
                      <button
                        type="button"
                        onClick={handleAddService}
                        className="px-3 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer border-0"
                      >
                        + যোগ
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(formData.servicesOffered) && formData.servicesOffered.map((srv: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-800 font-extrabold text-xs rounded-xl border border-indigo-200 flex items-center gap-1.5">
                          <span>{srv}</span>
                          <button type="button" onClick={() => handleRemoveService(srv)} className="hover:text-rose-600 text-slate-400 font-black border-0 bg-transparent cursor-pointer">✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: CONTACT & SOCIAL */}
            {activeTab === "contact" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3.5 shadow-xs">
                  {/* Email + Privacy */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">ইমেইল ঠিকানা (Email)</label>
                      <select
                        value={formData.privacySettings?.email || "Everyone"}
                        onChange={(e) => handlePrivacyChange("email", e.target.value)}
                        className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700"
                      >
                        <option value="Everyone">Everyone 🌐</option>
                        <option value="Friends">Friends 👥</option>
                        <option value="Only me">Only me 🔒</option>
                      </select>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                      placeholder="example@gmail.com"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp নম্বর</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                      placeholder="017XXXXXXXX"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ওয়েবসাইট (Website URL)</label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                      placeholder="https://mywebsite.com"
                    />
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Facebook প্রোফাইল / পেজ</label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-[#1877F2]"
                      placeholder="facebook.com/username"
                    />
                  </div>

                  {/* YouTube */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">YouTube চ্যানেল</label>
                    <input
                      type="text"
                      name="youtube"
                      value={formData.youtube || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-rose-600"
                      placeholder="youtube.com/@channel"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Instagram আইডি</label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram || ""}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-pink-600"
                      placeholder="instagram.com/username"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: MY BUSINESS */}
            {activeTab === "business" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mx-auto font-black text-xl">
                    🏢
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">ব্যবসা প্রোফাইল ও ডিরেক্টরি</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    আমাদের পুঠিয়া ডিরেক্টরিতে আপনার দোকান বা ব্যবসা ফ্রিতে তালিকাভুক্ত করুন।
                  </p>
                  <a
                    href="/businesses"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition no-underline shadow-xs"
                  >
                    <span>+ নতুন ব্যবসা তালিকাভুক্ত করুন</span>
                  </a>
                </div>
              </div>
            )}

            {/* TAB 8: PRIVACY */}
            {activeTab === "privacy" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Lock size={16} className="text-[#1877F2]" />
                    <span>তথ্য গোপনীয়তা ও প্রাইভেসি কন্ট্রোল</span>
                  </h4>

                  {[
                    { label: "Who can see my birthday?", key: "birthday" },
                    { label: "Who can see my phone?", key: "phone" },
                    { label: "Who can see my hometown?", key: "hometown" },
                    { label: "Who can see my blood group?", key: "bloodGroup" },
                    { label: "Who can see my email?", key: "email" }
                  ].map((pItem) => (
                    <div key={pItem.key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-800">{pItem.label}</span>
                      <select
                        value={formData.privacySettings?.[pItem.key] || "Everyone"}
                        onChange={(e) => handlePrivacyChange(pItem.key, e.target.value)}
                        className="text-xs font-extrabold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
                      >
                        <option value="Everyone">Everyone 🌐</option>
                        <option value="Friends">Friends 👥</option>
                        <option value="Only me">Only me 🔒</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 9: PROFILE STATUS */}
            {activeTab === "status" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Shield size={16} className="text-emerald-600" />
                    <span>প্রোফাইল ভিজিবিলিটি ও এক্টিভিটি স্ট্যাটাস</span>
                  </h4>

                  {[
                    { label: "Show me as available (অনলাইন দেখাবে)", key: "showAvailable" },
                    { label: "Allow friend requests (বন্ধু অনুরোধ গ্রহণ)", key: "allowFriendRequests" },
                    { label: "Allow messages (ইনবক্সে মেসেজ গ্রহণ)", key: "allowMessages" },
                    { label: "Show me in people search (সার্চে দেখাবে)", key: "showInSearch" },
                    { label: "Show my profile in local directory (লোকাল ডিরেক্টরিতে দেখাবে)", key: "showInDirectory" }
                  ].map((sItem) => (
                    <div key={sItem.key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-800">{sItem.label}</span>
                      <input
                        type="checkbox"
                        name={sItem.key}
                        checked={formData[sItem.key] !== false}
                        onChange={handleChange}
                        className="w-4 h-4 rounded text-[#1877F2]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Bottom Step Navigation Bar */}
          <div className="p-3 bg-white border-t border-slate-200/90 flex items-center justify-between gap-2 shrink-0 z-20">
            <button
              type="button"
              onClick={goToPrevTab}
              disabled={currentTabIndex === 0}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer border-0 flex items-center gap-1 active:scale-95"
            >
              <ChevronLeft size={16} />
              <span>পূর্ববর্তী ধাপ</span>
            </button>

            <span className="text-[11px] font-black text-slate-500">
              ধাপ {currentTabIndex + 1} / {TABS.length}
            </span>

            <button
              type="button"
              onClick={goToNextTab}
              disabled={currentTabIndex === TABS.length - 1}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed text-[#1877F2] font-bold text-xs rounded-xl transition cursor-pointer border-0 flex items-center gap-1 active:scale-95"
            >
              <span>পরবর্তী ধাপ</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
