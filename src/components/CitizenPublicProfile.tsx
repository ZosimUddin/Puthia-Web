import React, { useState, useEffect } from "react";
import { ArrowLeft, Phone, MapPin, Award, CheckCircle2, Star, Calendar, MessageSquare, ShieldCheck, Heart, Video, PhoneCall } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth, UserProfile } from "../contexts/AuthContext";
import { useCall } from "../contexts/CallContext";

interface CitizenPublicProfileProps {
  citizenUid: string;
  onGoBack: () => void;
}

export const CitizenPublicProfile: React.FC<CitizenPublicProfileProps> = ({ citizenUid, onGoBack }) => {
  const { user } = useAuth();
  const { initiateCall } = useCall();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flipped, setFlipped] = useState(false);

  const handleStartAudioCall = () => {
    if (!profile) return;
    initiateCall(
      {
        uid: citizenUid,
        name: profile.name || 'নাগরিক',
        photoURL: profile.photoURL || '',
        phone: profile.phone || ''
      },
      'audio'
    );
  };

  const handleStartVideoCall = () => {
    if (!profile) return;
    initiateCall(
      {
        uid: citizenUid,
        name: profile.name || 'নাগরিক',
        photoURL: profile.photoURL || '',
        phone: profile.phone || ''
      },
      'video'
    );
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const docRef = doc(db, "users", citizenUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setError("দুঃখিত, এই নাগরিক প্রোফাইলটি খুঁজে পাওয়া যায়নি। আইডিটি সঠিক কিনা পরীক্ষা করুন।");
        }
      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError("তথ্য লোড করতে ত্রুটি হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      } finally {
        setLoading(false);
      }
    };

    if (citizenUid) {
      fetchProfile();
    }
  }, [citizenUid]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-zinc-950 p-12 rounded-3xl text-center border border-neutral-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-neutral-500 font-bold">নাগরিক প্রোফাইল লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-zinc-950 p-8 rounded-3xl text-center border border-neutral-100 dark:border-zinc-800 shadow-sm min-h-[300px] flex flex-col items-center justify-center space-y-4">
        <span className="text-5xl">⚠️</span>
        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">প্রোফাইল পাওয়া যায়নি</h3>
        <p className="text-xs text-neutral-500 max-w-xs">{error || "প্রোফাইল ডেটা লোড করা সম্ভব হয়নি।"}</p>
        <button
          onClick={onGoBack}
          className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          ফিরে যান
        </button>
      </div>
    );
  }

  // Level computation logic consistent with the app's rules
  const points = profile.points || 0;
  let levelName = "সচেতন নাগরিক";
  let badgeIcon = "🥉";
  if (points >= 500) {
    levelName = "সুপার সিটিজেন";
    badgeIcon = "👑";
  } else if (points >= 200) {
    levelName = "প্লাটিনাম সিটিজেন";
    badgeIcon = "💎";
  } else if (points >= 100) {
    levelName = "গোল্ডেন সিটিজেন";
    badgeIcon = "🥇";
  } else if (points >= 50) {
    levelName = "সিলভার সিটিজেন";
    badgeIcon = "🥈";
  }

  const joinDate = new Date(profile.createdAt || Date.now()).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-md mx-auto space-y-6 font-sans pb-10 px-4 text-left">
      {/* Header bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoBack}
          className="p-2 bg-neutral-100 dark:bg-zinc-900 rounded-full hover:bg-neutral-200 transition cursor-pointer"
          title="ফিরে যান"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
        </button>
        <div>
          <h2 className="text-lg font-black text-neutral-800 dark:text-neutral-100">নাগরিক প্রোফাইল ভিউয়ার</h2>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">পুঠিয়া স্মার্ট পোর্টাল QR ভেরিফিকেশন</p>
        </div>
      </div>

      {/* Main flip card */}
      <div 
        className="relative w-full aspect-[1.6/1] cursor-pointer perspective-1000 max-w-sm mx-auto"
        onClick={() => setFlipped(!flipped)}
      >
        <div className={`w-full h-full transition-transform duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front of ID card */}
          <div 
            className="absolute w-full h-full backface-hidden rounded-2xl p-5 shadow-xl border border-white/10 flex flex-col justify-between overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(14, 80, 48, 0.98), rgba(8, 36, 22, 1))", backdropFilter: "blur(10px)" }}
          >
            {/* Background pattern */}
            <div className="absolute top-[-20%] right-[-20%] w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-start z-10">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-emerald-900 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xl font-black text-white">{profile.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-tight flex items-center gap-1">
                    {profile.name}
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-amber-400/10" />
                  </h3>
                  <span className="text-[9px] font-black text-emerald-500 tracking-wider uppercase bg-amber-400/10 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {levelName}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white rounded p-1 shadow">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + window.location.pathname + '?citizen_profile_uid=' + profile.uid)}`} 
                  alt="QR Code" 
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="space-y-1 z-10 border-t border-white/10 pt-3 mt-2">
              <p className="text-xs font-medium text-emerald-100 flex items-center gap-1">
                <span className="text-white/60">রক্তের গ্রুপ:</span> 
                <span className="text-amber-300 font-extrabold bg-red-600/20 px-1.5 py-0.5 rounded text-[10px]">{profile.bloodGroup}</span>
                {profile.isBloodDonor && (
                  <span className="inline-block text-[8px] px-1 bg-emerald-500 text-white font-bold rounded">রক্তদাতা</span>
                )}
              </p>
              <p className="text-xs font-medium text-emerald-100">
                <span className="text-white/60">এলাকা/ইউনিয়ন:</span> {profile.village || "জিউপাড়া"}, {profile.union || "পুঠিয়া"}
              </p>
            </div>
          </div>

          {/* Back of ID card */}
          <div 
            className="absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl p-5 shadow-xl border border-white/10 flex flex-col justify-between overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(8, 36, 22, 1), rgba(4, 18, 11, 1))", backdropFilter: "blur(10px)" }}
          >
            <div className="w-full flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-3">
              <p className="text-[10px] text-white/50 mb-0.5 uppercase tracking-wider">স্মার্ট মেম্বারশিপ আইডি</p>
              <p className="text-base font-black text-emerald-500 tracking-wider mb-2.5 font-mono">
                PUT-{profile.uid.substring(0, 8).toUpperCase()}
              </p>
              
              <div className="grid grid-cols-2 gap-x-4 text-left text-[10px] text-emerald-200/80 w-full max-w-[240px] border-t border-white/10 pt-2.5 mt-1">
                <p><span className="text-white/40">ইস্যু ডেট:</span> {joinDate}</p>
                <p className="text-right"><span className="text-white/40">সিভিক ইস্টার:</span> <strong className="text-emerald-500 font-black">{points}</strong></p>
              </div>
            </div>
            <p className="text-[8px] text-center text-white/20 uppercase tracking-widest mt-2">
              Verified Digital Citizen of Puthia
            </p>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-center text-neutral-400 font-bold">কার্ডের পিছনের তথ্য দেখতে কার্ডে ক্লিক করুন</p>

      {/* Citizen Details Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-5">
        <h4 className="text-sm font-black text-neutral-800 dark:text-neutral-200 pb-2 border-b border-neutral-100 dark:border-zinc-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> নাগরিক প্রোফাইল বিবরণী
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-50 dark:bg-zinc-950 p-3 rounded-2xl border border-neutral-100 dark:border-zinc-800/80">
            <p className="text-[10px] text-neutral-400 font-bold uppercase mb-0.5">নাগরিক স্তর</p>
            <p className="text-sm font-black text-neutral-800 dark:text-white flex items-center gap-1">
              <span>{badgeIcon}</span> {levelName}
            </p>
          </div>

          <div className="bg-neutral-50 dark:bg-zinc-950 p-3 rounded-2xl border border-neutral-100 dark:border-zinc-800/80">
            <p className="text-[10px] text-neutral-400 font-bold uppercase mb-0.5">মোট সিভিক ইস্টার</p>
            <p className="text-sm font-black text-neutral-800 dark:text-white">
              ⭐ {points} ইস্টার
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
            <span><strong>স্থায়ী ঠিকানা:</strong> গ্রাম: {profile.village || "জিউপাড়া"}, ইউনিয়ন: {profile.union || "পুঠিয়া"}, রাজশাহী</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
            <span><strong>পোর্টাল নিবন্ধন তারিখ:</strong> {joinDate}</span>
          </div>

          {profile.isBloodDonor && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex gap-3.5 items-start">
              <Heart className="w-5 h-5 text-rose-600 fill-rose-600/10 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-xs">ভেরিফাইড রক্তদাতা (Blood Donor)</p>
                <p className="text-[10px] opacity-90 mt-0.5">এই নাগরিক জরুরী প্রয়োজনে পুঠিয়া রক্তের ব্যাংকে রক্তদানে ইচ্ছুক। রক্তের গ্রুপ: {profile.bloodGroup}</p>
              </div>
            </div>
          )}
        </div>

        {/* In-app WebRTC & Phone Calling Actions */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleStartAudioCall}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer border-none"
            >
              <PhoneCall className="w-4 h-4" />
              <span>অডিও কল</span>
            </button>
            <button
              type="button"
              onClick={handleStartVideoCall}
              className="py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer border-none"
            >
              <Video className="w-4 h-4" />
              <span>ভিডিও কল</span>
            </button>
          </div>

          {profile.phone ? (
            <a
              href={`tel:${profile.phone}`}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-800 dark:text-neutral-200 font-bold rounded-xl flex items-center justify-center gap-2 transition text-xs cursor-pointer decoration-none"
            >
              <Phone className="w-3.5 h-3.5" />
              সরাসরি ফোনে ডায়াল করুন ({profile.phone})
            </a>
          ) : (
            <div className="p-2.5 bg-neutral-50 dark:bg-zinc-950 rounded-xl text-center border border-neutral-100 dark:border-zinc-800/80">
              <p className="text-[10px] text-neutral-400 font-bold">যোগাযোগের মোবাইল নাম্বার দেওয়া হয়নি</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
