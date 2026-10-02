import React, { useState } from "react";
import { ArrowLeft, MapPin, Phone, Clock, BookOpen, Calendar, Info, Heart, Search } from "lucide-react";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

export function ChurchInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const churches = [
    {
      id: "church-1",
      name: "পুঠিয়া সেন্ট পলস এংলিকান চার্চ (St. Paul's Church)",
      location: "পুঠিয়া সদর, রাজশাহী",
      type: "খ্রিস্টীয় উপাসনালয়",
      established: "ঐতিহাসিক খ্রিস্টান মিশন",
      details: "পুঠিয়া উপজেলা ও রাজশাহী অঞ্চলের খ্রিস্টান ধর্মাবলম্বীদের প্রধান প্রার্থনালয়। প্রতি রবিবার এখানে বিশেষ প্রার্থনা অনুষ্ঠিত হয়।",
      timing: "রবিবার সকাল ৯:০০ - ১২:০০ (বিশেষ প্রার্থনা)",
      contact: "০১৭০০-০০০০০১",
      image: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "church-2",
      name: "রাজশাহী ব্যাপটিস্ট চার্চ মিশন",
      location: "রাজশাহী রোড সংলগ্ন, পুঠিয়া এলাকা",
      type: "ব্যাপটিস্ট মিশন চার্চ",
      established: "১৯৬৫ খ্রিষ্টাব্দ",
      details: "স্থানীয় খ্রিস্টান সম্প্রদায়ের ধর্মীয় উপাসনা, বড়দিন এবং ইস্টার সানডে উদযাপনের কেন্দ্রবিন্দু।",
      timing: "রবিবার সকাল ৮:৩০ - ১১:৩০",
      contact: "০১৭০০-০০০০০২",
      image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const filteredChurches = churches.filter((church) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      church.name.toLowerCase().includes(q) ||
      church.location.toLowerCase().includes(q) ||
      church.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="font-sans space-y-6 pb-6">
      {/* Hero Banner - Upazila Porichiti Style */}
      <UnifiedHeroHeader
        title="⛪ গির্জা (চার্চ)"
        subtitle="পুঠিয়া ও পার্শ্ববর্তী এলাকার ঐতিহাসিক চার্চ ও খ্রিস্টান উপাসনালয়ের তথ্য ও সময়সূচী।"
        showBack={true}
        onBack={onGoBack}
        rightAction={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-white/15 text-emerald-100 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-sm hidden sm:inline-block">
              ধর্মীয় প্রতিষ্ঠান ও ঐতিহ্য
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
        searchPlaceholder="চার্চ বা স্থান লিখে খুঁজুন..."
        className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6"
      />

      {/* List of Churches */}
      <div className="space-y-4 px-1 sm:px-0">
        {filteredChurches.map((church) => (
          <div key={church.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
            <div className="flex flex-col sm:flex-row gap-4 items-start pl-2">
              <img 
                src={church.image} 
                alt={church.name}
                className="w-full sm:w-32 h-28 object-cover rounded-2xl flex-shrink-0 border border-gray-100"
              />
              <div className="flex-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 mb-1">
                  {church.type}
                </span>
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{church.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> {church.location}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-xl mb-3">
                  {church.details}
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-700">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-600" /> {church.timing}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-blue-600" /> {church.contact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredChurches.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-gray-500 text-sm">কোনো চার্চের তথ্য পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}
