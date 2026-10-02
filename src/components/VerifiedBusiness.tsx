import React, { useState } from "react";
import { ArrowLeft, Search, CheckCircle2, Phone, MapPin, Star, Store } from "lucide-react";
import { useFavorites } from "./FavoriteContext";
import { RatingReviewsList } from "./RatingReviewsList";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface Props { onGoBack: () => void; }

interface VerifiedBizItem {
  id: string;
  name: string;
  category: string;
  rating: string;
  location: string;
  phone: string;
  verifiedBadge: string;
}

export const VerifiedBusiness: React.FC<Props> = ({ onGoBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toggleFollow, isFollowing } = useFavorites();
  const [expandedReviewsBizId, setExpandedReviewsBizId] = useState<string | null>(null);

  const businesses: VerifiedBizItem[] = [
    {
      id: "1",
      name: "পুঠিয়া রাজকীয় খাজা ঘর",
      category: "ঐতিহ্যবাহী মিষ্টি ও কনফেকশনারি",
      rating: "৪.৯",
      location: "রাজবাড়ী রোড, পুঠিয়া সদর।",
      phone: "01712-345678",
      verifiedBadge: "🟢 Verified Business"
    },
    {
      id: "2",
      name: "মেসার্স বিসমিল্লাহ ট্রেডার্স",
      category: "হার্ডওয়্যার ও স্যানিটারি সামগ্রী",
      rating: "৪.৭",
      location: "বানেশ্বর বাজার, পুঠিয়া।",
      phone: "01723-987654",
      verifiedBadge: "🟢 Verified Business"
    },
    {
      id: "3",
      name: "জনতা ড্রাগ হাউস",
      category: "ঔষধ ও মডেল ফার্মেসি",
      rating: "৪.৮",
      location: "থানা রোড, পুঠিয়া সদর।",
      phone: "01711-223344",
      verifiedBadge: "🟢 Verified Business"
    },
    {
      id: "4",
      name: "বানেশ্বর সুপার মার্কেট ফ্যাশন গ্যালারি",
      category: "পোশাক ও ফ্যাশন সামগ্রী",
      rating: "৪.৬",
      location: "হাইওয়ে রোড, বানেশ্বর বাজার।",
      phone: "01732-554433",
      verifiedBadge: "🟢 Verified Business"
    }
  ];

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans pb-10 text-left">
      <UnifiedHeroHeader
        badgeText="যাচাইকৃত ও বিশ্বস্ত প্রতিষ্ঠান"
        title="ভেরিফাইড ব্যবসা প্রতিষ্ঠান"
        subtitle="পুঠিয়া অ্যাপের পক্ষ থেকে সরেজমিনে যাচাইকৃত এবং সবুজ ব্যাজ প্রাপ্ত নির্ভরযোগ্য স্থানীয় ব্যবসাগুলোর তালিকা।"
        icon={<Store size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="ব্যবসা বা দোকানের নাম ও ক্যাটাগরি লিখুন..."
      />

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBusinesses.map(biz => (
            <div key={biz.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden transition hover:shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-gray-800 flex flex-wrap items-center gap-1.5 leading-tight">
                    {biz.name} <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-current" stroke="white" />
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">{biz.category}</p>
                </div>
                <div className="bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-yellow-200">
                  <Star className="w-3.5 h-3.5 fill-current text-yellow-500" /> {biz.rating}
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5 text-xs text-gray-600 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium">{biz.location}</span>
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {biz.verifiedBadge}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-1">
                <a 
                  href={`tel:${biz.phone}`}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 outline-none tracking-wide text-center"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" /> কল করুন
                </a>
                <button
                  onClick={() => toggleFollow({
                    id: biz.id,
                    type: 'business',
                    name: biz.name,
                    category: biz.category,
                    location: biz.location,
                    phone: biz.phone
                  })}
                  className={`px-4 py-2.5 text-xs font-bold transition-all rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border ${
                    isFollowing(biz.id)
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/10'
                      : 'bg-white hover:bg-teal-50 text-teal-700 border-teal-200'
                  }`}
                >
                  {isFollowing(biz.id) ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      ফলোইং
                    </>
                  ) : (
                    <>
                      <span>+</span> ফলো
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setExpandedReviewsBizId(expandedReviewsBizId === biz.id ? null : biz.id)}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border-none mt-1"
              >
                <span>⭐</span> {expandedReviewsBizId === biz.id ? "রিভিউ ও রেটিং বন্ধ করুন" : "রিভিউ ও রেটিং দেখুন"}
              </button>

              {expandedReviewsBizId === biz.id && (
                <div className="w-full mt-2 animate-fade-in border-t border-neutral-100 pt-3">
                  <RatingReviewsList itemId={`verified_biz_${biz.id}`} itemName={biz.name} itemCategory={biz.category} />
                </div>
              )}
            </div>
          ))}

          {filteredBusinesses.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
              <span className="text-4xl block mb-2">🔍</span>
              <h5 className="text-base font-bold text-gray-800 mb-1">কোনো ভেরিফাইড ব্যবসা পাওয়া যায়নি</h5>
              <p className="text-gray-500 text-xs">আপনার খোঁজা নামের কোনো ব্যবসা আমাদের ভেরিফাইড তালিকায় তালিকাভুক্ত নেই।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
