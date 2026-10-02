import React, { useState } from "react";
import { ArrowLeft, Hotel, Bus, UtensilsCrossed, PhoneCall, MapPin, Tag, ShieldAlert, Train, Compass, Clock, Search } from "lucide-react";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface Accommodation {
  name: string;
  type: string;
  location: string;
  rent: string;
  contact: string;
  facilities: string[];
  rating: string;
}

interface SweetShop {
  name: string;
  famousFor: string;
  location: string;
  priceRange: string;
  contact: string;
  tips: string;
}

interface TransportInfo {
  route: string;
  mode: string;
  operator: string;
  schedule: string;
  fare: string;
  contact: string;
}

const ACCOMMODATIONS: Accommodation[] = [
  {
    name: "পুঠিয়া ডাক বাংলো (জেলা পরিষদ ডাক বাংলো)",
    type: "সরকারি ডাক বাংলো (বাজেট ফ্রেন্ডলি)",
    location: "পুঠিয়া রাজবাড়ী চত্বরের ঠিক পূর্ব পাশে অবস্থিত।",
    rent: "৫০০ - ১২০০ টাকা / রাত (অনুমতি সাপেক্ষে)",
    contact: "০১৭৩X-XXXXXX (উপজেলা নির্বাহী অফিসারের কার্যালয় / জেলা পরিষদ)",
    facilities: ["নিরাপদ সরকারি পরিবেশ", "রাজবাড়ীর একদম নিকটবর্তী অবস্থান", "সুন্দর কার পার্কিং ও বাগান"],
    rating: "⭐ ৪.০ / ৫"
  },
  {
    name: "হোটেল গ্র্যান্ড রিভারভিউ (রাজশাহী শহর)",
    type: "বিলাসবহুল ৪-স্টার হোটেল (রাজশাহী সদর)",
    location: "রাজশাহী শহর (পুঠিয়া থেকে মাত্র ৩০ কিমি দূরত্বে)।",
    rent: "৪,৫০০ - ১২,০০০ টাকা / রাত",
    contact: "০২৫৮৮-৮৬১৮৮১ (রিসেপশন)",
    facilities: ["সুইমিং পুল ও জিম", "উন্নত এসি লাক্সারি লাউঞ্জ", "ফ্রি ব্রেকফাস্ট বুফে"],
    rating: "⭐ ৪.৮ / ৫"
  },
  {
    name: "হোটেল নাইস ইন্টারন্যাশনাল (রাজশাহী)",
    type: "মধ্যম বাজেটের নির্ভরযোগ্য হোটেল",
    location: "গণকপাড়া, রাজশাহী শহর (পুঠিয়া থেকে ৩০ মিনিট দূর)।",
    rent: "১,৫০০ - ৩,৫০০ টাকা / রাত",
    contact: "০১৭৫৫-৬০৩৪৪৪ (বুকিং)",
    facilities: ["ভালো এসি/নন-এসি রুম", "ডাইন-ইন রেস্টুরেন্ট", "নিরাপদ কার পার্কিং"],
    rating: "⭐ ৪.২ / ৫"
  },
  {
    name: "হোটেল স্টার ইন্টারন্যাশনাল (রাজশাহী)",
    type: "বাজেট ফ্রেন্ডলি ট্রাভেলার হোটেল",
    location: "রেলওয়ে স্টেশন রোড, রাজশাহী শহর।",
    rent: "৮০০ - ২,০০০ টাকা / রাত",
    contact: "০১৭২২-XXXXXX",
    facilities: ["স্টেশন ও বাসস্ট্যান্ডের সন্নিকটে", "স্বল্প খরচে উন্নত সেবা", "ওয়াইফাই সুবিধা"],
    rating: "⭐ ৩.৯ / ৫"
  }
];

const FOOD_OUTLETS: SweetShop[] = [
  {
    name: "আশা দধি ভাণ্ডার ও মিষ্টান্ন গৃহ",
    famousFor: "পুঠিয়ার বিখ্যাত ক্ষীর ও ঘন খাসি দই (ঘন দুগ্ধের তৈরি রাজকীয় স্বাদের লাল দই)",
    location: "পুঠিয়া রাজবাড়ী বাজার সংলগ্ন মন্দির তোরণ রোডে।",
    priceRange: "দই ২০০-২৫০ টাকা (কেজি), চমচম ২৪০ টাকা (কেজি)",
    contact: "০১৭২৩-XXXXXX",
    tips: "দুপুরের পর এখানে দই সাধারণত শেষ হয়ে যায়, তাই আগে ভাগেই অর্ডার করে রাখা ভালো।"
  },
  {
    name: "খালিদ সুইটস ও কনফেকশনারি",
    famousFor: "ঐতিহ্যবাহী ক্ষীর চমচম, নরম রসগোল্লা ও খাঁটি কাঁচাগোল্লা",
    location: "পুঠিয়া বাজার, সোনালী ব্যাংকের নিচে চত্বরে।",
    priceRange: "মিষ্টি ২২০-৩০০ টাকা (কেজি)",
    contact: "০১৭৩৬-XXXXXX",
    tips: "এখানকার ক্ষীর চমচম অত্যন্ত হালকা মিষ্টির ও অত্যন্ত নরম, যা উপহার হিসেবে নেওয়ার জন্য একদম পারফেক্ট।"
  },
  {
    name: "বানেশ্বর বাজারের ঐতিহ্যবাহী আদি মিষ্টান্ন",
    famousFor: "বানেশ্বরের বিখ্যাত ‘মচমচে ক্ষীর চমচম’ ও বিশেষ স্পঞ্জ রসগোল্লা",
    location: "বানেশ্বর বাজার মোড় (পুঠিয়া সদর থেকে ৫ কিমি পশ্চিমে)।",
    priceRange: "চমচম ২০০-২৪০ টাকা / কেজি",
    contact: "০১৭২৮-XXXXXX",
    tips: "আমের মৌসুমে বানেশ্বরে ঘুরতে গেলে এই চমচম ট্রাই করা একদম মিস করবেন না।"
  }
];

const TRANSPORTS: TransportInfo[] = [
  {
    route: "ঢাকা ⇆ পুঠিয়া (সরাসরি বাস)",
    mode: "এসি ও নন-এসি লাক্সারি বাস",
    operator: "হানিফ, শ্যামলী, ন্যাশনাল ট্রাভেলস, দেশ ট্রাভেলস",
    schedule: "প্রতিদিন সকাল ০৬:০০ টা থেকে রাত ১১:৩০ টা পর্যন্ত (প্রতি ৩০ মিনিট পর পর)",
    fare: "৮০০ টাকা (নন-এসি), ১২০০-১৫০০ টাকা (এসি)",
    contact: "পুঠিয়া কাউন্টার: ০১৭১৩-XXXXXX (ন্যাশনাল ট্রাভেলস)"
  },
  {
    route: "ঢাকা ⇆ রাজশাহী বা নাটোর (ট্রেন)",
    mode: "আন্তঃনগর দ্রুতগামী ট্রেন",
    operator: "বনলতা এক্সপ্রেস (নন-স্টপ), সিল্কসিটি, পদ্মা, ধুমকেতু এক্সপ্রেস",
    schedule: "ঢাকা থেকে প্রস্থান: সকাল ০৬:০০ (ধুমকেতু), দুপুর ০২:৪০ (সিল্কসিটি), রাত ১১:০০ (পদ্মা)",
    fare: "৪৫০ টাকা (শোভন চেয়ার), ৮৫০ টাকা (স্নিগ্ধা এসি)",
    contact: "বাংলাদেশ রেলওয়ে অনলাইন বা কমলাপুর কাউন্টার।"
  },
  {
    route: "রাজশাহী বা নাটোর ⇆ পুঠিয়া (লোকাল commute)",
    mode: "লোকাল বাস, শেয়ারিং ইজিবাইক / সিএনজি",
    operator: "স্থানীয় গণপরিবহন",
    schedule: "সারাদিন ২৪ ঘন্টা লভ্য (১০ মিনিট পর পর)",
    fare: "লোকাল বাস ৫০ টাকা, শেয়ারিং সিএনজি ৬০ টাকা",
    contact: "কোনো অগ্রিম বুকিং লাগে না, সরাসরি স্ট্যান্ড থেকে ওঠা যায়।"
  }
];

interface TourismHotelsTransportInfoProps {
  onGoBack: () => void;
  hideHeader?: boolean;
}

export function TourismHotelsTransportInfo({ onGoBack, hideHeader = false }: TourismHotelsTransportInfoProps) {
  const [activeTab, setActiveTab] = useState<"hotel" | "food" | "transport">("hotel");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="space-y-6 pb-8 font-sans text-left" id="hotels-transport-section">
      
      {/* 1. Header Banner */}
      {!hideHeader && (
        <UnifiedHeroHeader
          title="🏨 হোটেল ও যাতায়াত তথ্য"
          subtitle="পুঠিয়ায় নিরাপদে রাত্রিযাপন করার ডাকবাংলো ও সেরা হোটেল ডিরেক্টরি, ঐতিহ্যবাহী মিষ্টি দোকান ও যোগাযোগের তথ্য।"
          showBack={true}
          onBack={onGoBack}
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
                  ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          }
          searchQuery={showSearch ? searchQuery : undefined}
          onSearchChange={showSearch ? setSearchQuery : undefined}
          searchPlaceholder="হোটেল, খাবার বা রুট তথ্য খুঁজুন..."
          className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6 pt-3.5 pb-5"
        />
      )}

      {/* 2. Interactive Navigation Category Tabs */}
      <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", overflowX: "auto" }}>
        {[
          { id: "hotel", label: "🏨 থাকার হোটেল ও বাংলো", icon: Hotel },
          { id: "food", label: "🍨 বিখ্যাত মিষ্টি ও দই বিপণি", icon: UtensilsCrossed },
          { id: "transport", label: "🚌 বাস ও ট্রেন যাতায়াত", icon: Bus }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                minWidth: "120px",
                background: isActive ? "#eff6ff" : "#ffffff",
                color: isActive ? "#1e3a8a" : "#1e293b",
                border: isActive ? "1.5px solid #3b82f6" : "1px solid #e2e8f0",
                padding: "10px 2px",
                borderRadius: "16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="hover:border-blue-400 hover:shadow-sm flex flex-col items-center justify-center group"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isActive ? 'bg-blue-100' : 'bg-slate-50'} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-blue-600' : 'text-slate-600'}`} />
              </div>
              <div style={{ fontSize: "11px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                {tab.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Render Tab Content Dynamically */}
      <div className="space-y-4">
        
        {/* Tab 1: Accommodations */}
        {activeTab === "hotel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACCOMMODATIONS.map((hotel, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-teal-500/10 text-teal-700 font-bold px-3 py-1 text-[10px] rounded-bl-xl border-l border-b border-teal-500/10 uppercase">
                  {hotel.type}
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-serif font-black text-slate-800 text-base md:text-lg pr-12 leading-tight">
                    {hotel.name}
                  </h4>
                  <p className="text-[11px] text-[#0D9488] font-bold">{hotel.rating}</p>
                </div>

                <div className="text-xs space-y-2 text-slate-600 font-medium">
                  <p className="flex items-start gap-1.5 leading-relaxed text-justify">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span><strong>অবস্থান:</strong> {hotel.location}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                    <span><strong>আনুমানিক ভাড়া:</strong> {hotel.rent}</span>
                  </p>
                  <p className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-150">
                    <PhoneCall className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-semibold text-slate-700"><strong>বুকিং ফোন:</strong> {hotel.contact}</span>
                  </p>
                </div>

                {/* Facilities Badges */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">সুযোগ-সুবিধা:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {hotel.facilities.map((fac, fIdx) => (
                      <span key={fIdx} className="bg-slate-50 text-slate-600 border border-slate-150/50 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                        ✦ {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Sweet shops and Foods */}
        {activeTab === "food" && (
          <div className="space-y-4">
            {FOOD_OUTLETS.map((shop, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5 text-left relative overflow-hidden">
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <h4 className="font-serif font-black text-slate-800 text-base md:text-lg">
                      {shop.name}
                    </h4>
                    <p className="text-xs text-teal-700 font-bold mt-0.5">🍰 স্পেশালিটি: {shop.famousFor}</p>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-600 font-medium">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span><strong>অবস্থান:</strong> {shop.location}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                      <span><strong>আনুমানিক দাম:</strong> {shop.priceRange}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">বিশেষ ভ্রমণ পরামর্শ:</span>
                    <p className="text-[11px] text-slate-500 leading-normal text-justify font-semibold">
                      {shop.tips}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-white p-2 rounded-xl border border-slate-150">
                    <PhoneCall className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-bold text-slate-700">{shop.contact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Transport Schedule */}
        {activeTab === "transport" && (
          <div className="space-y-4">
            {TRANSPORTS.map((trans, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5 text-left relative overflow-hidden">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="text-xl">{idx === 1 ? "🚂" : "🚌"}</span>
                    <div>
                      <h4 className="font-serif font-black text-slate-800 text-base md:text-lg leading-tight">
                        {trans.route}
                      </h4>
                      <p className="text-xs text-slate-400 font-bold font-mono uppercase mt-0.5">{trans.mode}</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-2 text-slate-600 font-medium">
                    <p className="flex items-start gap-1.5 leading-relaxed text-justify">
                      <Compass className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>বিকল্প ও কোম্পানি:</strong> {trans.operator}</span>
                    </p>
                    <p className="flex items-start gap-1.5 leading-relaxed text-justify">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>সময়সূচী:</strong> {trans.schedule}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3 shadow-md">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">ভাড়া প্রতি টিকিট:</span>
                    <p className="text-yellow-400 font-black text-sm md:text-base">
                      {trans.fare}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-slate-850 p-2 rounded-xl border border-slate-800 font-mono text-slate-200">
                    <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{trans.contact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 4. Advisory safety instructions */}
      <div className="bg-teal-50 p-5 rounded-3xl border border-teal-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="space-y-1 text-center sm:text-left">
          <h5 className="font-serif font-black text-teal-900 text-base">যোগাযোগের নম্বর যাচাই সতর্কতা</h5>
          <p className="text-xs text-teal-800 font-medium leading-relaxed">
            সরকারি ডাকবাংলোর আসন সীমাবদ্ধ থাকায় ভ্রমণের ১-২ দিন আগেই উপজেলা প্রশাসন বা জেলা পরিষদ প্রতিনিধির সাথে কথা বলে আসন নিশ্চিত করে নিন।
          </p>
        </div>
        <div className="bg-[#115E59] text-white rounded-full px-4 py-2 text-xs font-bold shrink-0">
          📞 জরুরি সেবা: ৯৯৯
        </div>
      </div>

    </div>
  );
}
