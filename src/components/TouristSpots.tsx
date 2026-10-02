import React, { useState, useEffect } from "react";
import { Star, Sparkles, X, Loader2, MessageSquare, Map as MapIcon } from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import Markdown from "react-markdown";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default icon issues in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  onGoBack: () => void;
  onSubSelect?: (id: string) => void;
}

interface TouristCard {
  id: string;
  icon: string;
  label: string;
  detail: string;
  coords?: [number, number];
}

const tourismSectionData: Record<string, { title: string, subtitle: string, cards: TouristCard[] }> = {
  rajbari: {
    title: "পুঠিয়া রাজবাড়ী",
    subtitle: "রাজশাহী অঞ্চলের মোঘল ও ব্রিটিশ আমলের ইন্দো-ইউরোপীয় স্থাপত্যশৈলীতে নির্মিত পুঠিয়া রাজবংশের ঐতিহ্যবাহী রাজপ্রাসাদ কমপ্লেক্স।",
    cards: [
      { id: "rajbari-palace", icon: "🏛️", label: "প্রধান প্রাসাদ", detail: "মহারানী ভুবনময়ী দেবী ও পাঁচআনি জমিদারদের ঐতিহাসিক রাজভবন", coords: [24.3644, 88.8413] },
      { id: "rajbari-shyam-sagar", icon: "🌿", label: "শ্যামসাগর দীঘি", detail: "রাজবাড়ির কোল ঘেঁষে অবস্থিত বিশাল মনোরম ও ঐতিহাসিক দীঘি", coords: [24.3648, 88.8410] },
      { id: "rajbari-terracotta", icon: "🧱", label: "টেরাকোটা শিল্প", detail: "দেয়ালে প্রাচীন চুন-সুরকি ও পোড়ামাটির অপূর্ব কারুকার্য" },
      { id: "rajbari-time", icon: "🕒", label: "পরিদর্শনের সময়", detail: "সকাল ০৯:০০ থেকে বিকেল ০৫:০০ টা পর্যন্ত জনসাধারণের জন্য উন্মুক্ত" }
    ]
  },
  temples: {
    title: "বড় শিব মন্দির",
    subtitle: "১৮২৩ সালে মহারানী ভুবনময়ী দেবী কর্তৃক নির্মিত এটি বাংলাদেশের অন্যতম বৃহৎ এবং চমৎকার কারুকার্যখচিত শিব মন্দির।",
    cards: [
      { id: "temple-shiva", icon: "🏛️", label: "বড় শিব মন্দির", detail: "উঁচু বেদীর ওপর নির্মিত পাঁচ গম্বুজ বিশিষ্ট ঐতিহ্যবাহী শিব মন্দির", coords: [24.3639, 88.8422] },
      { id: "temple-govinda", icon: "🧱", label: "গোবিন্দ মন্দির", detail: "পাঁচআনি রাজবাড়ির ভেতরে অবস্থিত চমৎকার টেরাকোটা খচিত গোবিন্দ মন্দির", coords: [24.3642, 88.8415] },
      { id: "temple-ratha", icon: "🧭", label: "জগন্নাথ রথ মন্দির", detail: "দৃষ্টিনন্দন দোচালা স্থাপত্যের প্রাচীন রথ মন্দির", coords: [24.3650, 88.8425] },
      { id: "temple-dolmancha", icon: "✨", label: "দোলমঞ্চ ও অন্যান্য", detail: "কমপ্লেক্সের ভেতরে অবস্থিত চতুস্তল বিশিষ্ট প্রাচীন দোলমঞ্চ", coords: [24.3640, 88.8405] }
    ]
  },
  spots: {
    title: "ঐতিহাসিক স্থান",
    subtitle: "পুঠিয়া উপজেলার আনাচে-কানাচে ছড়িয়ে থাকা প্রাচীন হ্রদ, দিঘী, নীলকুঠি এবং রাজ আমলের অন্যান্য পুরাকীর্তি।",
    cards: [
      { id: "spot-shiva-sagar", icon: "🛶", label: "শিবসাগর দিঘী", detail: "শিব মন্দিরের সামনে অবস্থিত বিশাল আয়তনের সুপেয় পানির জলাশয়", coords: [24.3635, 88.8420] },
      { id: "spot-neelkuthi", icon: "🏚️", label: "প্রাচীন নীলকুঠি", detail: "লন্ডন হেয়ার কোম্পানির শাসনামলের ঐতিহাসিক নীল চাষের ধ্বংসাবশেষ", coords: [24.3700, 88.8450] },
      { id: "spot-khas-kachari", icon: "🚪", label: "খাস কাছারি", detail: "জমিদারদের খাজনা আদায়ের প্রাচীন অফিস ও তোশখানা ভবন", coords: [24.3645, 88.8418] },
      { id: "spot-archaeology", icon: "🛡️", label: "প্রত্নতত্ত্ব অধিদপ্তর", detail: "বর্তমানে সরকারের প্রত্নতাত্ত্বিক সম্পদ হিসেবে সংরক্ষিত এলাকা" }
    ]
  },
  guide: {
    title: "ভ্রমণ গাইড",
    subtitle: "দেশ-বিদেশ থেকে আগত পর্যটকদের জন্য পুঠিয়া রাজবাড়ী ভ্রমণের যাতায়াত, হোটেল এবং দিকনির্দেশনামূলক গাইড।",
    cards: [
      { id: "guide-transport", icon: "🚌", label: "যাতায়াত ব্যবস্থা", detail: "রাজশাহী বা নাটোর থেকে বাস ও সিএনজি যোগে পুঠিয়া বাসস্ট্যান্ড", coords: [24.3725, 88.8350] },
      { id: "guide-hotel", icon: "🏪", label: "হোটেল ও রেস্তোরাঁ", detail: "বাসস্ট্যান্ড ও বাজারের আশেপাশে দুপুরের খাবার ও ঐতিহ্যবাহী মিষ্টি" },
      { id: "guide-photo", icon: "📸", label: "ছবি ও ভিডিও শুট", detail: "মোবাইল ও ক্যামেরায় ছবি তোলার উন্মুক্ত ও সুন্দর স্পট" },
      { id: "guide-guidelines", icon: "🚨", label: "ট্যুরিস্ট গাইডলাইন", detail: "ঐতিহাসিক স্থাপনা পরিষ্কার রাখতে এবং শৃঙ্খলা বজায় রাখতে অনুরোধ" }
    ]
  }
};

type SectionType = "rajbari" | "temples" | "spots" | "guide";

export const TouristSpots: React.FC<Props> = ({ onGoBack, onSubSelect }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionType>("temples");
  const [ratings, setRatings] = useState<Record<string, { average: number, total: number }>>({});
  
  // UI State
  const [aiGuideSpot, setAiGuideSpot] = useState<any | null>(null);
  const [aiGuideLoading, setAiGuideLoading] = useState(false);
  const [aiGuideResponse, setAiGuideResponse] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedMapPoint, setSelectedMapPoint] = useState<TouristCard | null>(null);

  const data = tourismSectionData[activeSection];

  useEffect(() => {
    const fetchRatings = async () => {
      const newRatings: Record<string, { average: number, total: number }> = {};
      for (const card of data.cards) {
        const ratingRef = doc(db, "ratings", card.id);
        const ratingDoc = await getDoc(ratingRef);
        if (ratingDoc.exists()) {
          const rData = ratingDoc.data();
          const rMap = (rData?.ratings || {}) as Record<string, number>;
          const totalRatings = Object.keys(rMap).length;
          const sum = Object.values(rMap).reduce((a, b) => a + b, 0);
          newRatings[card.id] = { average: totalRatings > 0 ? sum / totalRatings : 0, total: totalRatings };
        } else {
          newRatings[card.id] = { average: 0, total: 0 };
        }
      }
      setRatings(newRatings);
    };
    fetchRatings();
  }, [activeSection]);

  const handleRating = async (spotId: string, rating: number) => {
    if (!user) return;
    const ratingRef = doc(db, "ratings", spotId);
    const ratingDoc = await getDoc(ratingRef);
    if (ratingDoc.exists()) {
      await updateDoc(ratingRef, { [`ratings.${user.uid}`]: rating });
    } else {
      await setDoc(ratingRef, { ratings: { [user.uid]: rating } });
    }
    // Refresh ratings
    const newRatings = { ...ratings };
    const rDoc = await getDoc(ratingRef);
    const rData = (rDoc.data()?.ratings || {}) as Record<string, number>;
    const totalRatings = Object.keys(rData).length;
    const sum = Object.values(rData).reduce((a, b) => a + b, 0);
    newRatings[spotId] = { average: totalRatings > 0 ? sum / totalRatings : 0, total: totalRatings };
    setRatings(newRatings);
  };

  const fetchAIGuide = async (spot: any) => {
    setAiGuideSpot(spot);
    setAiGuideLoading(true);
    setAiGuideResponse(null);
    try {
      const response = await fetch('/api/tourism-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          spotName: spot.label,
          description: spot.detail
        })
      });
      const data = await response.json();
      if (data.reply) {
        setAiGuideResponse(data.reply);
      } else if (data.isConfigError) {
        setAiGuideResponse("দুঃখিত, এআই ফিচারটি বর্তমানে কনফিগার করা নেই।");
      }
    } catch (error) {
      console.error("AI Guide Error:", error);
      setAiGuideResponse("দুঃখিত, তথ্য লোড করতে সমস্যা হয়েছে।");
    } finally {
      setAiGuideLoading(false);
    }
  };

  const handleSectionSwitch = (section: SectionType) => {
    setActiveSection(section);
  };

  return (
    <div 
      id="tourism-master-container" 
      className="tourism-master-container" 
      style={{ padding: "15px", background: "#fff", fontFamily: "'Hind Siliguri', sans-serif" }}
    >
      {/* Dynamic Top Banner Area */}
      <div 
        id="tourism-top-banner" 
        style={{ 
          padding: "24px 20px", 
          borderRadius: "24px", 
          color: "#ffffff", 
          marginBottom: "20px", 
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)", 
          background: "linear-gradient(135deg, #B45309, #78350F)" 
        }}
      >
        <div style={{ marginBottom: "14px" }}>
          <div style={{ 
            background: "rgba(255, 255, 255, 0.2)", 
            backdropFilter: "blur(5px)", 
            padding: "5px 14px", 
            borderRadius: "20px", 
            display: "inline-block", 
            fontSize: "11.5px", 
            fontWeight: 700, 
            border: "1px solid rgba(255,255,255,0.15)", 
            color: "#ffffff", 
            letterSpacing: "0.2px" 
          }}>
            পরিচিতি তথ্য
          </div>
        </div>

        <h2 style={{ margin: "0 0 12px 0", fontSize: "25px", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>
          {data.title}
        </h2>

        <p style={{ margin: "0 0 20px 0", fontSize: "13.5px", opacity: 0.88, lineHeight: 1.5, textAlign: "justify" }}>
          {data.subtitle}
        </p>

        <div style={{ display: "block" }}>
          <div 
            onClick={onGoBack} 
            style={{ 
              background: "rgba(255, 255, 255, 0.2)", 
              backdropFilter: "blur(5px)", 
              padding: "6px 16px", 
              borderRadius: "20px", 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              fontSize: "12px", 
              fontWeight: 700, 
              color: "#ffffff", 
              cursor: "pointer", 
              border: "1px solid rgba(255,255,255,0.2)", 
              letterSpacing: "0.3px" 
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            ফিরে যান
          </div>
        </div>
      </div>

      {/* Grid Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { id: "rajbari", label: "🏛️ প্রাসাদ" },
          { id: "temples", label: "👑 ইতিহাস" },
          { id: "spots", label: "🚪 ট্যুর" },
          { id: "guide", label: "⏰ সময়" }
        ].map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSectionSwitch(tab.id as SectionType)}
              className={`py-3 px-1 rounded-2xl text-center border font-bold text-[10px] transition shadow-sm ${
                isActive
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg block mb-0.5">{tab.label.split(" ")[0]}</span>
              {tab.label.split(" ").slice(1).join(" ")}
            </button>
          );
        })}
      </div>

      {/* Dynamic Cards Grid */}
      <div 
        id="tourism-bottom-cards" 
        style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}
      >
        {data.cards.map((card, idx) => (
            <div 
            key={idx} 
            className="transition-all duration-200 hover:shadow-lg"
            style={{ 
              background: "#ffffff", 
              padding: "16px 12px", 
              borderRadius: "16px", 
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              textAlign: "center", 
              border: "1px solid #f1f5f9" 
            }}
          >
            <span style={{ fontSize: "24px", marginBottom: "6px" }}>{card.icon}</span>
            <h5 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "14px", fontWeight: 700 }}>
              {card.label}
            </h5>
            <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "11px", lineHeight: 1.3 }}>
              {card.detail}
            </p>
            
            {/* Rating Display */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={`cursor-pointer ${star <= Math.round(ratings[card.id]?.average || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  onClick={() => handleRating(card.id, star)}
                />
              ))}
              <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "4px" }}>
                ({ratings[card.id]?.total || 0})
              </span>
            </div>

            {/* Map & AI Buttons */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                onClick={() => fetchAIGuide(card)}
                className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[9px] font-bold flex items-center justify-center gap-1 transition-colors border border-emerald-100"
              >
                <Sparkles size={10} className="text-emerald-500" />
                এআই গাইড
              </button>
              {card.coords && (
                <button
                  onClick={() => {
                    setSelectedMapPoint(card);
                    setShowMapModal(true);
                  }}
                  className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-[9px] font-bold flex items-center justify-center gap-1 transition-colors border border-amber-100"
                >
                  <MapIcon size={10} className="text-amber-500" />
                  ম্যাপে দেখুন
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Map Modal */}
      {showMapModal && selectedMapPoint && selectedMapPoint.coords && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-gray-800">{selectedMapPoint.label}</h3>
                <p className="text-xs font-bold text-gray-500">ইন্টারেক্টিভ ম্যাপ ভিউ</p>
              </div>
              <button 
                onClick={() => setShowMapModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="h-[400px] w-full relative">
              <MapContainer 
                center={selectedMapPoint.coords} 
                zoom={16} 
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={selectedMapPoint.coords}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold mb-1">{selectedMapPoint.label}</p>
                      <p className="text-[10px] text-gray-500">{selectedMapPoint.detail}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
              
              <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-2xl shadow-lg border border-gray-100 max-w-[200px]">
                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">অবস্থান</p>
                <p className="text-xs font-bold text-gray-800 leading-tight">
                   অক্ষাংশ: {selectedMapPoint.coords[0]}<br/>
                   দ্রাঘিমাংশ: {selectedMapPoint.coords[1]}
                </p>
              </div>
            </div>

            <div className="p-6 flex gap-3">
               <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMapPoint.coords[0]},${selectedMapPoint.coords[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-center text-xs transition-colors shadow-lg shadow-emerald-200 decoration-none flex items-center justify-center gap-1.5"
              >
                গুগল ম্যাপসে রুট দেখুন
              </a>
              <button 
                onClick={() => setShowMapModal(false)}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-black text-xs transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Guide Modal */}
      {aiGuideSpot && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl animate-slide-up">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-6 text-white relative">
              <button 
                onClick={() => setAiGuideSpot(null)}
                className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Sparkles size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">এআই পর্যটন গাইড</span>
              </div>
              <h3 className="text-2xl font-black">{aiGuideSpot.label}</h3>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {aiGuideLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                  <p className="text-sm font-bold text-gray-500 animate-pulse">এআই তথ্য তৈরি করছে...</p>
                </div>
              ) : (
                <div className="prose prose-sm prose-emerald max-w-none">
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 mb-4 flex items-start gap-3">
                    <MessageSquare size={18} className="text-emerald-600 mt-1 flex-shrink-0" />
                    <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line font-medium">
                       <Markdown>{aiGuideResponse || "কোনো তথ্য পাওয়া যায়নি।"}</Markdown>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-wider">
                    এটি এআই জেনারেটেড তথ্য, যাচাই করে নিন।
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 pt-0">
              <button 
                onClick={() => setAiGuideSpot(null)}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-black transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
