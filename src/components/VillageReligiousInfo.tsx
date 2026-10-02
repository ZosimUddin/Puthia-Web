import React, { useState } from "react";
import { ArrowLeft, Phone, Search } from "lucide-react";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface VillageReligiousInfoProps {
  onGoBack: () => void;
}

export const VillageReligiousInfo: React.FC<VillageReligiousInfoProps> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"mosque" | "temple" | "eidgah" | "other">("mosque");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="space-y-6 font-sans pb-10">
      <UnifiedHeroHeader
        title="গ্রামের ধর্মীয় প্রতিষ্ঠান"
        subtitle="গ্রাম পর্যায়ে অবস্থিত জামে মসজিদ, ঐতিহাসিক মন্দির, ঈদগাহ এবং ধর্মীয় সেবামূলক প্রতিষ্ঠানের তালিকা।"
        showBack={true}
        onBack={onGoBack}
        rightAction={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-white/15 text-emerald-100 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-sm hidden sm:inline-block">
              ধর্মীয় উপাসনালয় ডিরেক্টরি
            </span>
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchQuery("");
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showSearch 
                  ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>
        }
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="প্রতিষ্ঠানের নাম খুঁজুন..."
        className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6"
      />

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("mosque")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "mosque"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            🕌 জামে মসজিদ
          </button>
          <button
            onClick={() => setFilter("temple")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "temple"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            🛕 গ্রামীন মন্দির
          </button>
          <button
            onClick={() => setFilter("eidgah")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "eidgah"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            🌙 ঈদগাহ প্রাঙ্গণ
          </button>
          <button
            onClick={() => setFilter("other")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "other"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            ⛪ অন্যান্য উপাসনালয়
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-2">ধোকড়াকুল মধ্যপাড়া জামে মসজিদ</h3>
            <p className="text-sm text-gray-700 font-medium mb-1">
              <span className="font-bold">গ্রাম:</span> ধোকড়াকুল | <span className="font-bold">ইমাম:</span> [সম্মানিত ইমামের নাম]
            </p>
            <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="font-bold text-[#4CAF50]">সুবিধা:</span> সুপরিসর ওজুখানা এবং সুসজ্জিত কাতার ব্যবস্থা।
            </p>
            <button className="w-full py-2.5 text-xs font-bold text-[#4CAF50] bg-green-50 rounded-xl hover:bg-[#4CAF50] hover:text-white transition-colors border border-green-100/50 flex items-center justify-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              কমিটির কন্টাক্ট
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};