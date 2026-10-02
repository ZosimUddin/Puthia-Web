import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { JOB_CATEGORIES, JOB_UNIONS, JOB_TYPES } from "./JobFilters";
import { Briefcase, Building2, MapPin, DollarSign, GraduationCap, Calendar, Phone, Mail, FileText, Plus, X, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface JobFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const JobForm: React.FC<JobFormProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    union: "puthia",
    location: "",
    category: "office",
    type: "full-time",
    salary: "",
    isNegotiable: false,
    education: "ssc",
    experience: "",
    ageLimit: "",
    deadline: "",
    phone: "",
    email: "",
    description: "",
    requirementsInput: "",
    benefitsInput: "",
    isUrgent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("নিয়োগ বিজ্ঞপ্তি পোস্ট করতে প্রথমে লগইন করুন।");
      return;
    }

    if (!formData.title.trim() || !formData.company.trim() || !formData.phone.trim()) {
      setError("অনুগ্রহ করে স্টার (*) চিহ্নিত আবশ্যিক ক্ষেত্রগুলো পূরণ করুন।");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const requirements = formData.requirementsInput
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r !== "");
      const benefits = formData.benefitsInput
        .split("\n")
        .map((b) => b.trim())
        .filter((b) => b !== "");

      const payload = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        union: formData.union,
        location: formData.location.trim() || JOB_UNIONS.find(u => u.id === formData.union)?.label || "পুঠিয়া",
        category: formData.category,
        type: formData.type,
        salary: formData.isNegotiable ? "আলোচনা সাপেক্ষে" : formData.salary.trim(),
        education: formData.education,
        experience: formData.experience.trim() || "অভিজ্ঞতা প্রয়োজন নেই",
        ageLimit: formData.ageLimit.trim() || "নির্দিষ্ট নয়",
        deadline: formData.deadline,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        description: formData.description.trim(),
        requirements,
        benefits,
        isFeatured: false,
        isUrgent: formData.isUrgent,
        status: "pending", // Always pending first for validation
        createdByUid: user.uid,
        views: 0,
        postedDate: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "jobs"), payload);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error("Error creating job vacancy:", err);
      setError("বিজ্ঞপ্তি সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto max-w-2xl w-full mx-auto shadow-xl">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">বিজ্ঞপ্তি জমা হয়েছে!</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            ধন্যবাদ! আপনার নিয়োগ বিজ্ঞপ্তিটি সফলভাবে জমা হয়েছে। আমাদের অ্যাডমিন প্যানেল যাচাই করার পর এটি ২৪ ঘণ্টার মধ্যে লাইভ করা হবে।
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-[#0F5A3F]/10 text-[#0F5A3F]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">নিয়োগ বিজ্ঞপ্তি প্রকাশ করুন</h3>
              <p className="text-xs text-gray-500">সহজে পুঠিয়া উপজেলার সঠিক প্রার্থীদের কাছে বিজ্ঞপ্তি পৌঁছান</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" /> পদের নাম (Job Title) *
              </label>
              <input
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="উদাঃ শোরুম সেলসম্যান"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
              />
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-gray-400" /> প্রতিষ্ঠানের নাম *
              </label>
              <input
                type="text"
                required
                value={formData.company || ""}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="উদাঃ পুঠিয়া সুপার মার্কেট"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
              />
            </div>

            {/* Union select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> ইউনিয়ন *
              </label>
              <select
                value={formData.union || ""}
                onChange={(e) => setFormData({ ...formData, union: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] transition-colors"
              >
                {JOB_UNIONS.filter((u) => u.id !== "all").map((u) => (
                  <option key={u.id} value={u.id || ""}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location details */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> নির্দিষ্ট ঠিকানা
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="উদাঃ পুঠিয়া বাজার মসজিদ গলি"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
              />
            </div>

            {/* Category select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">চাকরির ক্যাটাগরি</label>
              <select
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F]"
              >
                {JOB_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id || ""}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Type select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">কাজের ধরন</label>
              <select
                value={formData.type || ""}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F]"
              >
                {JOB_TYPES.filter((t) => t.id !== "all").map((t) => (
                  <option key={t.id} value={t.id || ""}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Salary */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" /> মাসিক বেতন *
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold text-[#0F5A3F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNegotiable}
                    onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                    className="rounded text-[#0F5A3F] focus:ring-[#0F5A3F] w-3 h-3"
                  />
                  <span>আলোচনা সাপেক্ষে</span>
                </label>
              </div>
              <input
                type="text"
                disabled={formData.isNegotiable}
                value={formData.isNegotiable ? "" : formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder={formData.isNegotiable ? "আলোচনা সাপেক্ষে" : "৳ ১২,০০০ - ১৫,০০০"}
                className="w-full bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
              />
            </div>

            {/* Education select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-gray-400" /> শিক্ষাগত যোগ্যতা
              </label>
              <select
                value={formData.education || ""}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F]"
              >
                <option value="none">যোগ্যতার প্রয়োজন নেই</option>
                <option value="psc">৫ম শ্রেণী / পিএসসি পাস</option>
                <option value="jsc">৮ম শ্রেণী / জেএসসি পাস</option>
                <option value="ssc">এসএসসি (SSC)</option>
                <option value="hsc">এইচএসসি (HSC)</option>
                <option value="graduate">স্নাতক (Degree/Honors)</option>
                <option value="post-graduate">স্নাতকোত্তর (Masters)</option>
              </select>
            </div>

            {/* Experience */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">অভিজ্ঞতার প্রয়োজন</label>
              <input
                type="text"
                value={formData.experience || ""}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="উদাঃ ১ বছর কাজের অভিজ্ঞতা (বা অভিজ্ঞতা লাগবে না)"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> আবেদন শেষ তারিখ *
              </label>
              <input
                type="date"
                required
                value={formData.deadline || ""}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> যোগাযোগ ফোন নম্বর *
              </label>
              <input
                type="tel"
                required
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="017xxxxxxxx"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> যোগাযোগের ইমেইল
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="hr@company.com"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-400" /> চাকরির বিবরণ (Job Description) *
            </label>
            <textarea
              required
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="চাকরির সংক্ষিপ্ত বিবরণ, দায়িত্ব এবং অন্যান্য কাজের বিবরণ দিন..."
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all h-28"
            />
          </div>

          {/* Requirements (lines) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">চাকরির যোগ্যতা (প্রতি লাইনে একটি করে)</label>
            <textarea
              value={formData.requirementsInput || ""}
              onChange={(e) => setFormData({ ...formData, requirementsInput: e.target.value })}
              placeholder="উদাঃ&#10;মোটরসাইকেল ড্রাইভিং জানা আবশ্যক&#10;নম্র ও ভদ্র হতে হবে&#10;কম্পিউটার টাইপিং স্পিড থাকতে হবে"
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all h-24"
            />
          </div>

          {/* Benefits (lines) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">অন্যান্য সুযোগ-সুবিধা (প্রতি লাইনে একটি করে)</label>
            <textarea
              value={formData.benefitsInput || ""}
              onChange={(e) => setFormData({ ...formData, benefitsInput: e.target.value })}
              placeholder="উদাঃ&#10;মোবাইল বিল&#10;উৎসব বোনাস&#10;দুপুরের খাবার সুবিধা"
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-all h-24"
            />
          </div>

          {/* Urgent check */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 flex items-start gap-3">
            <input
              type="checkbox"
              id="isUrgent"
              checked={formData.isUrgent}
              onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
              className="mt-1 rounded text-[#0F5A3F] focus:ring-[#0F5A3F] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isUrgent" className="cursor-pointer">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> এটি কি খুব জরুরি নিয়োগ (Urgent Circular)?
              </span>
              <p className="text-[10px] text-amber-600 mt-0.5">
                এটি চেক করলে আপনার বিজ্ঞপ্তিতে একটি উজ্জ্বল 'জরুরি নিয়োগ' ব্যাজ প্রদর্শন করা হবে যা দ্রুত প্রার্থী পেতে সাহায্য করবে।
              </p>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 bg-[#0F5A3F] hover:bg-[#0b422e] disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "জমা দিন (Submit circular)"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-sm cursor-pointer"
            >
              বাতিল
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
