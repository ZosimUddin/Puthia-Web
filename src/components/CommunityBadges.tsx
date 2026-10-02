import React, { useState, useEffect } from "react";
import { ArrowLeft, Droplet, Sparkles, ShieldCheck, Lock, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface Props { onGoBack: () => void; }

export const CommunityBadges: React.FC<Props> = ({ onGoBack }) => {
  const { user, userProfile } = useAuth();
  const [isVolunteerRegistered, setIsVolunteerRegistered] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkVol = async () => {
      try {
        const snap = await getDoc(doc(db, "volunteers", user.uid));
        if (snap.exists()) {
          setIsVolunteerRegistered(true);
        }
      } catch (err) {
        console.error("Error checking volunteer status:", err);
      }
    };
    checkVol();
  }, [user]);

  // Profile completeness calculation
  let completedFields = 0;
  if (userProfile?.name) completedFields++;
  if (userProfile?.phone && userProfile.phone.length >= 11) completedFields++;
  if (userProfile?.village && userProfile.village !== "তথ্য নেই") completedFields++;
  if (userProfile?.union) completedFields++;
  if (userProfile?.bloodGroup) completedFields++;
  if (userProfile?.photoURL) completedFields++;
  const completenessPercentage = Math.round((completedFields / 6) * 100);
  const isProfile100Percent = completenessPercentage === 100;

  const stars = userProfile?.stars || 0;

  // Custom Badges list categorized with descriptions and lock/unlock status
  const allBadgesList = [
    {
      id: "verified_citizen",
      category: "নাগরিক ব্যাজ",
      title: "✅ ভেরিফাইড নাগরিক",
      unlocked: isProfile100Percent,
      desc: "নাম, সচল মোবাইল নম্বর, রক্তের গ্রুপ, গ্রাম এবং প্রোফাইল ছবি দিয়ে প্রোফাইল ১০০% সম্পূর্ণ করে অর্জিত হয়েছে।",
      icon: "✅",
    },
    {
      id: "first_blood_donation",
      category: "রক্তদান ব্যাজ",
      title: "🩸 প্রথম রক্তদান",
      unlocked: (userProfile?.bloodDonationCount || 0) >= 1 || userProfile?.isBloodDonor || userProfile?.badges?.includes("রক্তবীর") || false,
      desc: "স্বেচ্ছায় অন্তত ১ বার রক্তদান করার মাধ্যমে এই বিশেষ সম্মাননা ব্যাজ অর্জিত হয়েছে।",
      icon: "🩸",
    },
    {
      id: "five_blood_donations",
      category: "রক্তদান ব্যাজ",
      title: "🩸🩸 ৫ বার রক্তদান",
      unlocked: (userProfile?.bloodDonationCount || 0) >= 5,
      desc: "৫ বার সফলভাবে রক্তদান করে অনেকের জীবন বাঁচানোর অনন্য কৃতিত্বের জন্য অর্জিত হয়েছে।",
      icon: "🩸🩸",
    },
    {
      id: "ten_blood_donations",
      category: "রক্তদান ব্যাজ",
      title: "🩸🩸🩸 ১০ বার রক্তদান",
      unlocked: (userProfile?.bloodDonationCount || 0) >= 10,
      desc: "১০ বার বা তার বেশি স্বেচ্ছায় রক্তদান সম্পন্ন করে পুঠিয়ার একজন আজীবন হিরো বা জীবনদাতা হিসেবে অর্জিত হয়েছে।",
      icon: "🩸🩸🩸",
    },
    {
      id: "volunteer",
      category: "কমিউনিটি ব্যাজ",
      title: "🤝 স্বেচ্ছাসেবক",
      unlocked: isVolunteerRegistered || userProfile?.badges?.includes("স্বেচ্ছাসেবক") || userProfile?.badges?.includes("ভলান্টিয়ার") || false,
      desc: "পুঠিয়া স্বেচ্ছাসেবী নেটওয়ার্কে সক্রিয় ভলান্টিয়ার হিসেবে নিবন্ধনের মাধ্যমে অর্জিত হয়েছে।",
      icon: "🤝",
    },
    {
      id: "community_hero",
      category: "কমিউনিটি ব্যাজ",
      title: "🤝  কমিউনিটি হিরো",
      unlocked: (isVolunteerRegistered && (userProfile?.bloodDonationCount || 0) >= 1) || stars >= 100 || userProfile?.badges?.includes("কমিউনিটি হিরো") || false,
      desc: "ভলান্টিয়ার তালিকায় নিবন্ধিত থাকার পাশাপাশি রক্তদান বা ১০০ সিভিক ইস্টার অর্জনের মাধ্যমে অর্জিত হয়েছে।",
      icon: "🏆",
    },
    {
      id: "conscious_citizen",
      category: "রিপোর্টিং ব্যাজ",
      title: "📢 সচেতন নাগরিক",
      unlocked: (userProfile?.complaintsCount || 0) >= 1 || userProfile?.badges?.includes("সচেতন নাগরিক") || false,
      desc: "এলাকার কোনো জনদুর্ভোগ বা নাগরিক সমস্যা নিয়ে অন্তত ১টি অভিযোগ বা সমস্যা পোর্টালে সাফল্যের সাথে দাখিল করার জন্য অর্জিত।",
      icon: "📢",
    },
    {
      id: "public_servant",
      category: "রিপোর্টিং ব্যাজ",
      title: "📢 জনসেবক",
      unlocked: (userProfile?.complaintsCount || 0) >= 5 || userProfile?.badges?.includes("জনসেবক") || false,
      desc: "সামাজিক দায়িত্ব ও নাগরিক উন্নয়নে ৫টি বা তার বেশি অভিযোগ বা পরামর্শ পোর্টালে সাফল্যের সাথে দাখিল করার জন্য অর্জিত।",
      icon: "🌟",
    },
    {
      id: "verified_merchant",
      category: "ব্যবসা ব্যাজ",
      title: "🏪 ভেরিফাইড ব্যবসায়ী",
      unlocked: (userProfile?.businessesCount || 0) >= 1 || userProfile?.badges?.includes("উদ্যোক্তা") || false,
      desc: "পুঠিয়া উদ্যোক্তা ডিরেক্টরি বা ব্যবসায়ী তালিকায় নিজের ব্যবসা প্রতিষ্ঠান সফলভাবে ভেরিফাই ও নিবন্ধন করার জন্য অর্জিত।",
      icon: "🏪",
    }
  ];

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #125836, #1e3d24)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-emerald-500 text-sm font-medium mb-2 uppercase tracking-wide">ডিজিটাল মেডেল ও সম্মাননা</p>
          <h1 className="text-4xl font-black mb-1 text-white">আপনার নাগরিক ব্যাজ গ্যালারি</h1>
          <div className="w-10 h-1 bg-white rounded-full my-3"></div>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
            পুঠিয়া নাগরিক পোর্টালে আপনার বিভিন্ন জনকল্যাণমূলক কার্যক্রমে অংশ নিয়ে অর্জিত ব্যাজগুলো দেখুন।
          </p>
        </div>
      </div>

      <div className="px-1 space-y-6">
        {["নাগরিক ব্যাজ", "রক্তদান ব্যাজ", "কমিউনিটি ব্যাজ", "রিপোর্টিং ব্যাজ", "ব্যবসা ব্যাজ"].map((categoryName) => {
          const categoryBadges = allBadgesList.filter(b => b.category === categoryName);
          if (categoryBadges.length === 0) return null;

          return (
            <div key={categoryName} className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[24px] p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {categoryName === "নাগরিক ব্যাজ" && "👤"}
                    {categoryName === "রক্তদান ব্যাজ" && "🩸"}
                    {categoryName === "কমিউনিটি ব্যাজ" && "🤝"}
                    {categoryName === "রিপোর্টিং ব্যাজ" && "📢"}
                    {categoryName === "ব্যবসা ব্যাজ" && "🏪"}
                  </span>
                  <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">
                    {categoryName}
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                  {categoryBadges.filter(b => b.unlocked).length} / {categoryBadges.length} অর্জিত
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryBadges.map((badge) => (
                  <div 
                    key={badge.id}
                    className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between h-40 ${
                      badge.unlocked 
                        ? "bg-gradient-to-br from-white to-gray-50/50 dark:from-zinc-900 dark:to-zinc-850 border-emerald-600/10 dark:border-zinc-850 shadow-sm hover:shadow-md" 
                        : "bg-gray-50/50 dark:bg-zinc-900/40 border-gray-100 dark:border-zinc-850 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-2xl p-1.5 rounded-lg ${badge.unlocked ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-gray-100 dark:bg-zinc-800"}`}>
                        {badge.icon}
                      </span>
                      {badge.unlocked ? (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> অর্জিত
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> লকড
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white leading-tight">{badge.title}</h4>
                      <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-1 leading-snug">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
