import React, { useState } from "react";
import { ArrowLeft, Phone, MapPin, CheckCircle, Heart, Search, Plus } from "lucide-react";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

export function BloodDonorListInfo({ 
  onGoBack,
  bloodDonors,
  setBloodDonors,
  bloodSearchTerm,
  setBloodSearchTerm,
  onAddDonor
}: { 
  onGoBack: () => void;
  bloodDonors: any[];
  setBloodDonors: React.Dispatch<React.SetStateAction<any[]>>;
  bloodSearchTerm: string;
  setBloodSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  onAddDonor?: () => void;
}) {
  const [activeTab, setActiveTab] = useState("positive_groups");
  const [showSearch, setShowSearch] = useState(false);

  const getFilteredDonors = () => {
    let baseDonors = [];
    switch(activeTab) {
      case 'negative_groups':
        // Return donors with negative blood groups
        baseDonors = bloodDonors.filter(d => d.group.includes('-'));
        break;
      case 'puthia_sadar':
        // Return donors located in Puthia Sadar or Municipality
        baseDonors = bloodDonors.filter(d => 
          (d.union || "").toLowerCase().includes("সদর") || 
          (d.union || "").toLowerCase().includes("পৌরসভা") || 
          (d.union || "").toLowerCase().includes("sadar")
        );
        break;
      case 'baneswar':
        // Return donors located in Baneswar
        baseDonors = bloodDonors.filter(d => 
          (d.union || "").toLowerCase().includes("বানেশ্বর") || 
          (d.union || "").toLowerCase().includes("baneswar")
        );
        break;
      case 'positive_groups':
      default:
        // Return donors with positive blood groups
        baseDonors = bloodDonors.filter(d => d.group.includes('+'));
        break;
    }

    if (showSearch && bloodSearchTerm) {
      const q = bloodSearchTerm.toLowerCase();
      baseDonors = baseDonors.filter(d => 
        (d.name || "").toLowerCase().includes(q) ||
        (d.union || "").toLowerCase().includes(q) ||
        (d.group || "").toLowerCase().includes(q)
      );
    }
    return baseDonors;
  };

  const currentDonors = getFilteredDonors();

  const getSectionMetadata = () => {
    switch(activeTab) {
      case 'negative_groups':
        return {
          title: "নেগেটিভ গ্রুপ",
          subtitle: "পুঠিয়া উপজেলার রেয়ার বা বিরল নেগেটিভ রক্তের গ্রুপের (A-, B-, O-, AB-) ডোনারদের তালিকা।",
          badge: "জরুরি নেগেটিভ ডোনার"
        };
      case 'puthia_sadar':
        return {
          title: "পুঠিয়া সদর ডোনার",
          subtitle: "পুঠিয়া সদর ইউনিয়ন এবং পৌরসভা এলাকার আশেপাশে অবস্থানরত সক্রিয় রক্তদাতাদের তালিকা।",
          badge: "স্থানীয় সদর রক্তদাতা"
        };
      case 'baneswar':
        return {
          title: "বানেশ্বর অঞ্চলের ডোনার",
          subtitle: "বানেশ্বর বাজার, বানেশ্বর ইউনিয়ন ও তৎসংলগ্ন এলাকার নিবন্ধিত রক্তদাতাদের কন্টাক্ট লিস্ট।",
          badge: "বানেশ্বর জোন ডোনার"
        };
      case 'positive_groups':
      default:
        return {
          title: "পজিটিভ গ্রুপ",
          subtitle: "পুঠিয়া উপজেলার সকল পজিটিভ রক্তের গ্রুপের (A+, B+, O+, AB+) স্বেচ্ছায় রক্তদাতাদের তালিকা।",
          badge: "জীবন বাঁচাতে রক্তদান"
        };
    }
  };

  const meta = getSectionMetadata();

  return (
    <div className="font-sans space-y-6 pb-6 text-left" id="blood-donor-list-view">
      <UnifiedHeroHeader
        badgeText={meta.badge}
        title={meta.title}
        subtitle={meta.subtitle}
        icon={<Heart size={20} className="text-red-500 fill-red-500" />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? bloodSearchTerm : undefined}
        onSearchChange={showSearch ? setBloodSearchTerm : undefined}
        searchPlaceholder="রক্তদাতার নাম, এলাকা বা গ্রুপ দিয়ে খুঁজুন..."
        rightAction={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setBloodSearchTerm("");
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showSearch 
                  ? "bg-red-500 text-white border-red-500 hover:bg-red-400" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            {onAddDonor && (
              <button 
                onClick={onAddDonor}
                className="w-10 h-10 rounded-full bg-white text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm"
                title="নতুন রক্তদাতা যোগ করুন"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        }
      />

      {/* Tabs Menu Grid */}
      <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => setActiveTab('positive_groups')} 
            className={`p-2 rounded-xl font-bold border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              activeTab === 'positive_groups' 
                ? 'bg-red-50 border-red-300 text-red-700' 
                : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
            }`}
          >
              <span className={`text-xl ${activeTab === 'positive_groups' ? 'scale-110' : ''} transition-transform`}>🔴</span>
              <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight">পজিটিভ গ্রুপ</span>
          </button>
          <button 
            onClick={() => setActiveTab('negative_groups')} 
            className={`p-2 rounded-xl font-bold border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              activeTab === 'negative_groups' 
                ? 'bg-red-50 border-red-300 text-red-700' 
                : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
            }`}
          >
              <span className={`text-xl ${activeTab === 'negative_groups' ? 'scale-110' : ''} transition-transform`}>🩸</span>
              <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight">নেগেটিভ গ্রুপ</span>
          </button>
          <button 
            onClick={() => setActiveTab('puthia_sadar')} 
            className={`p-2 rounded-xl font-bold border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              activeTab === 'puthia_sadar' 
                ? 'bg-red-50 border-red-300 text-red-700' 
                : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
            }`}
          >
              <span className={`text-xl ${activeTab === 'puthia_sadar' ? 'scale-110' : ''} transition-transform`}>📍</span>
              <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight text-center">পুঠিয়া সদর</span>
          </button>
          <button 
            onClick={() => setActiveTab('baneswar')} 
            className={`p-2 rounded-xl font-bold border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              activeTab === 'baneswar' 
                ? 'bg-red-50 border-red-300 text-red-700' 
                : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
            }`}
          >
              <span className={`text-xl ${activeTab === 'baneswar' ? 'scale-110' : ''} transition-transform`}>🗺️</span>
              <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight text-center">বানেশ্বর জোন</span>
          </button>
      </div>

      {/* Dynamic Donor List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-md font-extrabold text-gray-800">
            রক্তদাতা তালিকা ({currentDonors.length} জন)
          </h3>
          <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">
            সক্রিয় তালিকা
          </span>
        </div>

        {currentDonors.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
            <span className="text-4xl block mb-2">🤝</span>
            <h5 className="text-base font-bold text-gray-800 mb-1">এই ক্যাটাগরিতে কোনো রক্তদাতা নেই</h5>
            <p className="text-gray-500 text-xs">রক্তদান নিবন্ধন ফরম পূরণ করে আপনার নাম তালিকাভুক্ত করুন ভাই!</p>
          </div>
        ) : (
          currentDonors.map((donor, idx) => (
            <div 
              key={donor.id || idx} 
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-red-50 text-[#D32F2F] w-12 h-12 rounded-full flex items-center justify-center text-md font-black shadow-inner border border-red-100">
                    {donor.group}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-800 leading-tight">{donor.name}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <p className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {donor.union}
                      </p>
                      {donor.verified !== false && (
                        <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          🔵 Verified Blood Donor
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-100 whitespace-nowrap">
                  <CheckCircle className="w-3 h-3 fill-current text-white" /> রক্তদানে প্রস্তুত
                </span>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <span>🕒 শেষ রক্তদান:</span>
                <span className="text-gray-700">{donor.lastDonated || "১ম বার রক্তদান"}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a 
                  href={`tel:${donor.phone}`}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" /> কল করুন
                </a>
                <a 
                  href={`https://api.whatsapp.com/send?phone=${donor.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-emerald-200 cursor-pointer"
                >
                  💬 হোয়াটসঅ্যাপ
                </a>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
