import React, { useState } from "react";
import { copyToClipboard } from "../utils/clipboard";
import { ArrowLeft, Search, Filter, ZoomIn, Calendar, Eye, Download, Share2, Compass, Camera, Heart, X } from "lucide-react";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface PhotoItem {
  id: string;
  title: string;
  banglaTitle: string;
  category: "palace" | "terracotta" | "lakes" | "drone";
  photographer: string;
  camera: string;
  date: string;
  description: string;
  colorGrading: string; // Tailwind bg gradient used as visual placeholder
  emoji: string;
}

const PHOTOS: PhotoItem[] = [
  {
    id: "photo1",
    title: "Greek Pillars of Five-Anni Palace",
    banglaTitle: "পাঁচআনি রাজপ্রাসাদের প্রধান তোরণ ও গ্রিক কলাম",
    category: "palace",
    photographer: "তানভীর আহমেদ",
    camera: "Sony α7R IV, FE 24-70mm f/2.8 GM",
    date: "১৫ মে, ২০২৫",
    description: "অপরাহ্ণের গোধূলি আলোয় স্নানরত পুঠিয়া পাঁচআনি রাজপ্রাসাদের বিশাল তোরণ। এর নান্দনিক করিন্থিয়ান গ্রিক কলামগুলো রোমান স্থাপত্যের আভিজাত্য ফুটিয়ে তোলে।",
    colorGrading: "from-amber-600 via-orange-500 to-amber-900",
    emoji: "🏛️"
  },
  {
    id: "photo2",
    title: "Incredible Terracotta of Govinda Temple",
    banglaTitle: "গোবিন্দ মন্দিরের সূক্ষ্ম পোড়ামাটির টেরাকোটা দেয়াল",
    category: "terracotta",
    photographer: "রাশেদুল ইসলাম",
    camera: "Canon EOS R5, 100mm f/2.8L Macro",
    date: "১০ অক্টোবর, ২০২৫",
    description: "গোবিন্দ মন্দিরের দেওয়ালে খোদাইকৃত রামায়ণ ও মহাভারতের কাহিনীর পোড়ামাটির ফলকচিত্র। প্রতিটি ফলকে তৎকালীন যুদ্ধরত ঘোড়া, ধনুর্বিদ এবং রাধাকৃষ্ণের চিত্র নিখুঁতভাবে খোদাই করা হয়েছে।",
    colorGrading: "from-red-650 via-rose-600 to-amber-800",
    emoji: "🧱"
  },
  {
    id: "photo3",
    title: "Shib Sarobar Lake at Golden Hour",
    banglaTitle: "স্বর্ণালী আলোয় শিব সরোবর দিঘির শান্ত জলরাশি",
    category: "lakes",
    photographer: "ফারজানা রশীদ",
    camera: "Fujifilm X-T4, 16-55mm f/2.8",
    date: "০২ জানুয়ারি, ২০২৬",
    description: "শীতের সকালে শিব মন্দিরের ছায়া ঘেরা পুকুরঘাট ও তার শান্ত কাঁচের মতো জলরাশি। কুয়াশাচ্ছন্ন ভোরের সোনালী রোদে পুরো পরিবেশ এক রূপকথার মতো দেখায়।",
    colorGrading: "from-blue-600 via-cyan-500 to-sky-800",
    emoji: "🌊"
  },
  {
    id: "photo4",
    title: "Drone Aerial View of Temple Square",
    banglaTitle: "আকাশ থেকে পুঠিয়া ঐতিহাসিক মন্দির প্রাঙ্গণ",
    category: "drone",
    photographer: "আসিফ জামান (ড্রোন শট)",
    camera: "DJI Mavic 3 Pro, Hasselblad L2D-20c",
    date: "১২ নভেম্বর, ২০২৫",
    description: "আকাশচুম্বী ড্রোন ভিউতে তোলা পুঠিয়া মন্দির কমপ্লেক্সের চোখজুড়ানো ছবি। বড় শিব মন্দির, দিঘি, খেলার মাঠ ও দোলমঞ্চের জ্যামিতিক অবস্থানকে একই ফ্রেমে ফুটিয়ে তোলা হয়েছে।",
    colorGrading: "from-emerald-600 via-teal-500 to-emerald-950",
    emoji: "🛸"
  },
  {
    id: "photo5",
    title: "Bhubaneshwar Shiva Temple Majesty",
    banglaTitle: "ভুবনেশ্বর বড় শিব মন্দিরের সুউচ্চ রত্ন শিখর",
    category: "palace",
    photographer: "তানভীর আহমেদ",
    camera: "Nikon Z7 II, 70-200mm f/2.8 VR S",
    date: "০৮ সেপ্টেম্বর, ২০২৫",
    description: "বাংলাদেশের অন্যতম বৃহৎ এবং সুউচ্চ শিব মন্দিরের পাঁচটি অলংকৃত শিখর ও রত্ন তোরণের একটি নিপুণ ছবি, যা মুঘল ও বাঙালি কারুকার্যের অনন্য শৈলী ফুটিয়ে তোলে।",
    colorGrading: "from-violet-650 via-purple-600 to-indigo-900",
    emoji: "🛕"
  },
  {
    id: "photo6",
    title: "Pyramid Style Dolmancha in Green Field",
    banglaTitle: "সবুজ মাঠের বুক চিরে দাঁড়িয়ে থাকা ৪-তলা দোলমঞ্চ",
    category: "lakes",
    photographer: "মাহাদী হাসান",
    camera: "Sony α7 III, FE 16-35mm f/4G",
    date: "২০ ডিসেম্বর, ২০২৫",
    description: "বিশাল খেলার মাঠের বুক চিরে আকাশ অভিমুখে ধাপে ধাপে ধাবমান পিরামিড সদৃশ ঐতিহাসিক দোলমঞ্চের এক চোখজুড়ানো ল্যান্ডস্কেপ আলোকচিত্র।",
    colorGrading: "from-lime-600 via-emerald-500 to-emerald-900",
    emoji: "🎪"
  }
];

interface TourismPhotoGalleryInfoProps {
  onGoBack: () => void;
  hideHeader?: boolean;
}

export function TourismPhotoGalleryInfo({ onGoBack, hideHeader = false }: TourismPhotoGalleryInfoProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "palace" | "terracotta" | "lakes" | "drone">("all");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({
    photo1: 142, photo2: 235, photo3: 98, photo4: 310, photo5: 189, photo6: 124
  });
  const [likedByUser, setLikedByUser] = useState<Record<string, boolean>>({});

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening lightbox
    const hasLiked = !!likedByUser[id];
    setLikedByUser(prev => ({ ...prev, [id]: !hasLiked }));
    setLikes(prev => ({ ...prev, [id]: prev[id] + (hasLiked ? -1 : 1) }));
  };

  const filteredPhotos = PHOTOS.filter(photo => {
    const matchesSearch = 
      photo.banglaTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.photographer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || photo.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-8 font-sans" id="photo-gallery-section">
      
      {/* 1. Header Banner */}
      {!hideHeader && (
        <UnifiedHeroHeader
          title="📸 ছবি গ্যালারি (আলোকচিত্র)"
          subtitle="দক্ষ পেশাদার ট্রাভেলার ও লোকাল আলোকচিত্রীদের ক্যামেরার ফ্রেমে বন্দি পুঠিয়ার নান্দনিক ছবিগুলোর চমৎকার সংগ্রহশালা।"
          showBack={true}
          onBack={onGoBack}
          rightAction={
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchTerm("");
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showSearch 
                  ? "bg-[#FFC107] text-pink-950 border-[#FFC107] hover:bg-amber-400" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          }
          searchQuery={showSearch ? searchTerm : undefined}
          onSearchChange={showSearch ? setSearchTerm : undefined}
          searchPlaceholder="ছবির ক্যাপশন, আলোকচিত্রী বা স্থান দিয়ে খুঁজুন..."
          className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6 pt-3.5 pb-5"
        />
      )}

      {/* 2. Interactive Category Filters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">

        {/* Category Filters */}
        <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", overflowX: "auto" }}>
          {[
            { id: "all", label: "🖼️ সব ছবি" },
            { id: "palace", label: "🏛️ রাজপ্রাসাদ চত্বর" },
            { id: "terracotta", label: "🧱 টেরাকোটা ও শিল্প" },
            { id: "lakes", label: "🌊 মনোরম দিঘি ও অন্যান্য" },
            { id: "drone", label: "🛸 আকাশচুম্বী ড্রোন শট" }
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                style={{
                  flex: 1,
                  minWidth: "100px",
                  background: isActive ? "#eff6ff" : "#ffffff",
                  color: isActive ? "#1e3a8a" : "#1e293b",
                  border: isActive ? "1.5px solid #3b82f6" : "1px solid #e2e8f0",
                  padding: "8px 2px",
                  borderRadius: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                className="hover:border-blue-400 hover:shadow-sm flex items-center justify-center group"
              >
                <div style={{ fontSize: "11px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                  {cat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Photo Masonry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredPhotos.length > 0 ? (
          filteredPhotos.map((photo) => {
            const hasLiked = !!likedByUser[photo.id];
            return (
              <div 
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-[280px]"
              >
                {/* Colored visual placeholder with gradient and icon */}
                <div className={`w-full h-44 bg-gradient-to-br ${photo.colorGrading} relative flex items-center justify-center text-white/95 text-5xl transition-all duration-300 group-hover:scale-105 overflow-hidden`}>
                  {photo.emoji}
                  
                  {/* Subtle overlay elements */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white drop-shadow-md" />
                  </div>

                  <span className="absolute bottom-2.5 left-3.5 bg-black/40 backdrop-blur-md text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-pink-200">
                    {photo.category === "palace" && "🏛️ প্রাসাদ"}
                    {photo.category === "terracotta" && "🧱 টেরাকোটা"}
                    {photo.category === "lakes" && "🌊 জলাশয়"}
                    {photo.category === "drone" && "🛸 আকাশ ভিউ"}
                  </span>
                </div>

                {/* Bottom Title / Details */}
                <div className="p-4 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1 leading-tight group-hover:text-[#DB2777] transition-colors">
                      {photo.banglaTitle}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 font-mono">
                      <Camera className="w-3.5 h-3.5" /> By {photo.photographer}
                    </p>
                  </div>

                  {/* Likes and zoom control panel */}
                  <div className="flex justify-between items-center border-t border-slate-50 pt-2 text-[11px] text-slate-400 font-bold">
                    <span>{photo.date}</span>
                    
                    <button
                      onClick={(e) => handleLike(photo.id, e)}
                      className={`flex items-center gap-1 cursor-pointer transition ${
                        hasLiked ? "text-pink-600 scale-110" : "hover:text-pink-500"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? "fill-pink-600 stroke-pink-600" : ""}`} />
                      <span>{likes[photo.id]}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="sm:col-span-2 md:col-span-3 bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm space-y-3">
            <span className="text-5xl block">📷</span>
            <h4 className="font-serif font-bold text-lg text-slate-800">কোনো আলোকচিত্র খুঁজে পাওয়া যায়নি!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              আপনার অনুসন্ধানকৃত তথ্যের সাথে মেলে এমন কোনো সুন্দর আলোকচিত্র পাওয়া যায়নি।
            </p>
          </div>
        )}
      </div>

      {/* 4. Immersive Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto animate-fade-in">
          
          {/* Main Modal Area */}
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row text-left max-h-[90vh]">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/85 text-white w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 z-20 cursor-pointer shadow-md"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            {/* Left Column: Visual Canvas Area */}
            <div className={`md:w-1/2 bg-gradient-to-br ${selectedPhoto.colorGrading} relative flex items-center justify-center text-white text-8xl min-h-[250px] md:min-h-full`}>
              {selectedPhoto.emoji}

              {/* Visual overlay tag */}
              <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/25 text-[10px] font-bold text-pink-100 uppercase px-3 py-1.5 rounded-full tracking-wide">
                📸 এক্সক্লুসিভ ফ্রেম
              </div>
            </div>

            {/* Right Column: Detailed Info Sheet */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto gap-6 bg-white">
              
              {/* Detailed Descriptions */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="bg-pink-100 text-[#9D174D] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                    {selectedPhoto.category.toUpperCase()} CATEGORY
                  </span>
                  <h3 className="font-serif font-black text-slate-900 text-xl md:text-2xl leading-snug">
                    {selectedPhoto.banglaTitle}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold font-mono tracking-wide uppercase">
                    {selectedPhoto.title}
                  </p>
                </div>

                <p className="text-slate-600 text-xs md:text-sm leading-relaxed text-justify font-medium">
                  {selectedPhoto.description}
                </p>

                {/* Exif Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">ক্যামেরা ও লেন্স</span>
                    <span className="text-xs text-slate-700 font-extrabold flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {selectedPhoto.camera}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">আলোকচিত্রী ও তারিখ</span>
                    <span className="text-xs text-slate-700 font-extrabold flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {selectedPhoto.photographer}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="border-t border-slate-100 pt-4 flex gap-3.5">
                <button
                  onClick={() => {
                    alert("ছবি ডাউনলোড সিমুলেশন সফল হয়েছে! উচ্চ রেজোলিউশনের ছবিটি আপনার ডিভাইসে সংরক্ষিত হচ্ছে।");
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5 py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 flex-1 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" /> অফলাইন ডাউনলোড
                </button>
                
                <button
                  onClick={async () => {
                    await copyToClipboard(`ঐতিহাসিক পুঠিয়া রাজবাড়ীর ছবি: ${selectedPhoto.banglaTitle} by ${selectedPhoto.photographer}`);
                    alert("আলোকচিত্র লিংক কপি হয়েছে! আপনার বন্ধুদের সাথে শেয়ার করুন।");
                  }}
                  className="bg-pink-50 hover:bg-pink-100 text-[#9D174D] border border-pink-100 rounded-full px-5 py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 flex-1 shadow-sm cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> শেয়ার করুন
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
