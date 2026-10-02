import React, { useState, useEffect } from "react";
import { collection, doc, getDoc, setDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, HandHeart, Users, Rocket, LogIn, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";

interface Props { onGoBack: () => void; }

export const VolunteerNetwork: React.FC<Props> = ({ onGoBack }) => {
  const { user, userProfile, addStars, updateUserProfile } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [filter, setFilter] = useState<"form" | "list">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [union, setUnion] = useState("");
  const [skill, setSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  // Sync profile details if logged in
  useEffect(() => {
    if (user) {
      if (userProfile) {
        setName(prev => prev || userProfile.name || "");
        setPhone(prev => prev || userProfile.phone || "");
        setBloodGroup(prev => prev || userProfile.bloodGroup || "");
        setUnion(prev => prev || userProfile.union || "");
      }

      const checkRegistration = async () => {
        try {
          const userVolRef = doc(db, "volunteers", user.uid);
          const snap = await getDoc(userVolRef);
          if (snap.exists()) {
            setIsAlreadyRegistered(true);
            const data = snap.data();
            setName(data.name || "");
            setPhone(data.phone || "");
            setBloodGroup(data.bloodGroup || "");
            setUnion(data.union || "");
            setSkill(data.skill || "");
          }
        } catch (err) {
          console.error("Error checking volunteer registration:", err);
        }
      };
      checkRegistration();
    }
  }, [user, userProfile]);

  useEffect(() => {
    if (filter === 'list') {
      getDocs(collection(db, "volunteers")).then(snapshot => {
        setVolunteers(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      }).catch(console.error);
    }
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!name || !phone) return;
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, "volunteers", user.uid), {
        uid: user.uid,
        name, 
        phone, 
        bloodGroup, 
        union, 
        skill,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      if (!isAlreadyRegistered) {
        if (addStars) {
          await addStars(20);
        }
        if (updateUserProfile && userProfile) {
          const updatedBadges = [...(userProfile.badges || [])];
          if (!updatedBadges.includes("স্বেচ্ছাসেবক")) {
            updatedBadges.push("স্বেচ্ছাসেবক");
          }
          await updateUserProfile({
            badges: updatedBadges
          });
        }
      }
      
      setIsAlreadyRegistered(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to join.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #7A1C28, #A82C35)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-emerald-600 text-sm font-medium mb-2 uppercase tracking-wide">মানবতার সেবায় পুঠিয়া</p>
          <h1 className="text-4xl font-black mb-1 text-white">স্বেচ্ছাসেবক নেটওয়ার্ক</h1>
          <div className="w-10 h-1 bg-white rounded-full my-3"></div>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
            পুঠিয়ার যেকোনো জরুরি দুর্যোগে বা সামাজিক প্রয়োজনে ভলান্টিয়ার হিসেবে অবদান রাখতে নিজের নাম রেজিস্টার করুন।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("form")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "form"
                ? "bg-[#7A1C28] text-emerald-600 border border-emerald-500/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <HandHeart className={`w-4 h-4 ${filter === "form" ? 'text-emerald-600' : 'text-gray-400'}`}/>
            স্বেচ্ছাসেবক হোন
          </button>
          <button
            onClick={() => setFilter("list")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "list"
                ? "bg-[#7A1C28] text-emerald-600 border border-emerald-500/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Users className={`w-4 h-4 ${filter === "list" ? 'text-emerald-600' : 'text-gray-400'}`}/>
            ভলান্টিয়ার লিস্ট
          </button>
        </div>

        <div className="space-y-4">
          {filter === "form" && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-lg border border-red-50 flex flex-col gap-4 relative overflow-hidden animate-fade-in">
              {showToast && (
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl animate-pulse flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> সফল হয়েছে! ✅
                </div>
              )}
              
              {isAlreadyRegistered && (
                <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>আপনি ইতিমধ্যে ভলান্টিয়ার হিসেবে যুক্ত আছেন। নিচের তথ্য আপডেট করতে পারেন।</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                   <label className="text-xs font-bold text-gray-700 mb-1 block">পূর্ণ নাম</label>
                   <input 
                     type="text" 
                     value={name || ""} 
                     onChange={e => setName(e.target.value)} 
                     required 
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A1C28] transition-colors" 
                     placeholder="আপনার নাম লিখুন" 
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-700 mb-1 block">মোবাইল নম্বর</label>
                   <input 
                     type="tel" 
                     value={phone || ""} 
                     onChange={e => setPhone(e.target.value)} 
                     required 
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A1C28] transition-colors" 
                     placeholder="01XXX-XXXXXX" 
                   />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-xs font-bold text-gray-700 mb-1 block">রক্তের গ্রুপ</label>
                     <select 
                       value={bloodGroup || ""} 
                       onChange={e => setBloodGroup(e.target.value)} 
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A1C28] transition-colors"
                     >
                        <option value="">নির্বাচন করুন</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-700 mb-1 block">ইউনিয়ন</label>
                     <select 
                       value={union || ""} 
                       onChange={e => setUnion(e.target.value)} 
                       className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A1C28] transition-colors"
                     >
                        <option value="">নির্বাচন করুন</option>
                        <option value="পুঠিয়া ইউনিয়ন">পুঠিয়া ইউনিয়ন</option>
                        <option value="বানেশ্বর">বানেশ্বর</option>
                        <option value="জিউপাড়া">জিউপাড়া</option>
                        <option value="শিলমাড়ী">শিলমাড়ী</option>
                        <option value="ভালুকগাছী">ভালুকগাছী</option>
                        <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                     </select>
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-700 mb-1 block">টিম দক্ষতা</label>
                   <select 
                     value={skill || ""} 
                     onChange={e => setSkill(e.target.value)} 
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A1C28] transition-colors"
                   >
                      <option value="">নির্বাচন করুন (উদ্ধারকাজ/মেডিকেল সাপোর্ট ইত্যাদি)</option>
                      <option value="উদ্ধারকাজ">উদ্ধারকাজ</option>
                      <option value="মেডিকেল সাপোর্ট">মেডিকেল সাপোর্ট</option>
                      <option value="ত্রাণ বিতরণ">ত্রাণ বিতরণ</option>
                   </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full mt-2 py-3.5 text-xs font-bold text-[#7A1C28] bg-[#FFC107] rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 outline-none uppercase tracking-wider cursor-pointer"
              >
                <Rocket className="w-4 h-4" /> {isAlreadyRegistered ? "তথ্য আপডেট করুন" : "ভলান্টিয়ার টিম জয়েন করুন"}
              </button>
            </form>
          )}
          {filter === "list" && (
             <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 py-6 animate-fade-in shadow-lg">
              <div className="flex items-center gap-2 justify-center mb-4 text-gray-700">
                <Users className="w-5 h-5 text-gray-400" />
                <h3 className="font-extrabold text-sm">সক্রিয় ভলান্টিয়ার তালিকা</h3>
              </div>
              {volunteers.length === 0 ? (
                <p className="text-sm font-medium text-gray-500 py-4 text-center">বর্তমানে কোনো ভলান্টিয়ার লিস্ট দৃশ্যমান নয়</p>
              ) : (
                <div className="space-y-3 text-left">
                  {volunteers.map(v => (
                    <div key={v.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col hover:bg-red-50/20 transition-colors">
                      <div className="flex justify-between items-start">
                        <strong className="text-gray-800 text-sm font-extrabold">{v.name}</strong>
                        {v.bloodGroup && (
                          <span className="px-2 py-0.5 bg-red-50 text-[#7A1C28] text-[10px] font-black rounded-lg border border-red-100 uppercase">
                            রক্ত: {v.bloodGroup}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                        <span>📍 {v.union || 'ইউনিয়ন উল্লেখ নেই'}</span>
                        <span>•</span>
                        <span>🛠️ {v.skill || 'সাধারণ দক্ষতা'}</span>
                        {v.phone && (
                          <>
                            <span>•</span>
                            <span className="font-sans font-bold text-gray-700">📞 {v.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};
