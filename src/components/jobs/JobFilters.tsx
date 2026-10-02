import React from "react";
import { Search, MapPin, Briefcase, DollarSign, GraduationCap, RefreshCw } from "lucide-react";

export const JOB_CATEGORIES = [
  { id: "all", label: "সব ক্যাটাগরি" },
  { id: "office", label: "🏢 অফিস চাকরি" },
  { id: "shop", label: "🛍️ দোকান ও শোরুম" },
  { id: "factory", label: "🏭 কারখানা" },
  { id: "hotel", label: "🍽️ রেস্টুরেন্ট ও হোটেল" },
  { id: "clinic", label: "🏥 হাসপাতাল ও ক্লিনিক" },
  { id: "education", label: "🏫 শিক্ষা প্রতিষ্ঠান" },
  { id: "delivery", label: "🚚 ডেলিভারি ও পরিবহন" },
  { id: "it", label: "💻 আইটি ও ফ্রিল্যান্স" },
  { id: "construction", label: "👷 নির্মাণ কাজ" },
  { id: "technician", label: "🛠️ টেকনিশিয়ান ও মিস্ত্রি" },
  { id: "domestic", label: "🧹 গৃহস্থালি সহায়তা" },
  { id: "agriculture", label: "🌾 কৃষি ও খামার" },
];

export const JOB_UNIONS = [
  { id: "all", label: "সব ইউনিয়ন" },
  { id: "puthia", label: "পুঠিয়া ইউনিয়ন" },
  { id: "baneshwar", label: "বানেশ্বর ইউনিয়ন" },
  { id: "belpukur", label: "বেলপুকুর ইউনিয়ন" },
  { id: "jeupara", label: "জিউপাড়া ইউনিয়ন" },
  { id: "gopalpur", label: "গোপালপুর ইউনিয়ন" },
  { id: "shilmaria", label: "শিলমাড়িয়া ইউনিয়ন" },
];

export const JOB_TYPES = [
  { id: "all", label: "সব ধরন" },
  { id: "government", label: "🏛️ সরকারি চাকরি" },
  { id: "private", label: "🏢 বেসরকারি চাকরি" },
  { id: "notice", label: "📜 নিয়োগ বিজ্ঞপ্তি" },
  { id: "full-time", label: "পূর্ণকালীন (Full-time)" },
  { id: "part-time", label: "খণ্ডকালীন (Part-time)" },
  { id: "contract", label: "চুক্তিভিত্তিক (Contract)" },
  { id: "internship", label: "ইন্টার্নশিপ (Internship)" },
];

export const SALARY_RANGES = [
  { id: "all", label: "সব বেতন পরিসর" },
  { id: "0-5000", label: "৫,০০০ টাকার নিচে" },
  { id: "5000-10000", label: "৫,০০০ - ১০,০০০ টাকা" },
  { id: "10000-20000", label: "১০,০০০ - ২০,০০০ টাকা" },
  { id: "20000-30000", label: "২০,০০০ - ৩০,০০০ টাকা" },
  { id: "30000+", label: "৩০,০০০+ টাকা" },
  { id: "negotiable", label: "আলোচনা সাপেক্ষে" },
];

export const EDUCATION_LEVELS = [
  { id: "all", label: "সব শিক্ষাগত যোগ্যতা" },
  { id: "none", label: "প্রাতিষ্ঠানিক যোগ্যতার প্রয়োজন নেই" },
  { id: "psc", label: "৫ম শ্রেণী / পিএসসি পাস" },
  { id: "jsc", label: "৮ম শ্রেণী / জেএসসি পাস" },
  { id: "ssc", label: "এসএসসি (SSC)" },
  { id: "hsc", label: "এইচএসসি (HSC)" },
  { id: "graduate", label: "স্নাতক (Degree/Honors)" },
  { id: "post-graduate", label: "স্নাতকোত্তর (Masters)" },
];

interface FilterProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedUnion: string;
  setSelectedUnion: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  selectedSalary: string;
  setSelectedSalary: (val: string) => void;
  selectedEducation: string;
  setSelectedEducation: (val: string) => void;
  resetFilters: () => void;
}

export const JobFilters: React.FC<FilterProps> = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedUnion,
  setSelectedUnion,
  selectedType,
  setSelectedType,
  selectedSalary,
  setSelectedSalary,
  selectedEducation,
  setSelectedEducation,
  resetFilters,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search || ""}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="পদের নাম, প্রতিষ্ঠান বা শব্দ দিয়ে খুঁজুন..."
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-[#0F5A3F] focus:bg-white transition-colors text-sm"
        />
      </div>

      {/* Advanced Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Union Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#0F5A3F]" /> ইউনিয়ন বা এলাকা
          </label>
          <select
            value={selectedUnion || ""}
            onChange={(e) => setSelectedUnion(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#0F5A3F] transition-colors text-xs font-medium"
          >
            {JOB_UNIONS.map((union) => (
              <option key={union.id} value={union.id || ""}>
                {union.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-[#0F5A3F]" /> চাকরির বিভাগ
          </label>
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#0F5A3F] transition-colors text-xs font-medium"
          >
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id || ""}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Job Type Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-[#0F5A3F]" /> চাকরির ধরন
          </label>
          <select
            value={selectedType || ""}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#0F5A3F] transition-colors text-xs font-medium"
          >
            {JOB_TYPES.map((type) => (
              <option key={type.id} value={type.id || ""}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Salary Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-[#0F5A3F]" /> বেতন পরিসর
          </label>
          <select
            value={selectedSalary || ""}
            onChange={(e) => setSelectedSalary(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#0F5A3F] transition-colors text-xs font-medium"
          >
            {SALARY_RANGES.map((sal) => (
              <option key={sal.id} value={sal.id || ""}>
                {sal.label}
              </option>
            ))}
          </select>
        </div>

        {/* Education Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-[#0F5A3F]" /> শিক্ষাগত যোগ্যতা
          </label>
          <select
            value={selectedEducation || ""}
            onChange={(e) => setSelectedEducation(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#0F5A3F] transition-colors text-xs font-medium"
          >
            {EDUCATION_LEVELS.map((edu) => (
              <option key={edu.id} value={edu.id || ""}>
                {edu.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset Filter Button */}
      {(search || selectedCategory !== "all" || selectedUnion !== "all" || selectedType !== "all" || selectedSalary !== "all" || selectedEducation !== "all") && (
        <div className="flex justify-end mt-4">
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs text-rose-500 font-bold hover:text-rose-600 transition-colors bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100"
          >
            <RefreshCw className="w-3 h-3" /> ফিল্টার রিসেট করুন
          </button>
        </div>
      )}
    </div>
  );
};
