import React, { useState } from "react";
import { ArrowLeft, User, UserPlus, Phone, MapPin, Calendar, Heart, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";

export function BloodDonationRegInfo({ 
  onGoBack,
  bloodDonors,
  setBloodDonors
}: { 
  onGoBack: () => void;
  bloodDonors: any[];
  setBloodDonors: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isFirstTimeDonor, setIsFirstTimeDonor] = useState(false);
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [donorName, setDonorName] = useState("");

  const onSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedGroup) {
      alert("দয়া করে আপনার রক্তের গ্রুপ নির্বাচন করুন।");
      return;
    }
    if (!agreed) {
      alert("দয়া করে শর্তাবলীতে সম্মত হোন।");
      return;
    }

    const form = e.target as HTMLFormElement;
    const nameValue = (form.elements.namedItem("name") as HTMLInputElement)?.value || "";
    const phoneValue = (form.elements.namedItem("phone") as HTMLInputElement)?.value || "";
    const areaValue = (form.elements.namedItem("area") as HTMLSelectElement)?.value || "";
    
    // Convert English values/Union names to Bengali for consistent display
    const unionMap: Record<string, string> = {
      "puthia_sadar": "পুঠিয়া সদর",
      "baneswar": "বানেশ্বর",
      "jiupara": "জিউপাড়া",
      "shilmaria": "শিলমাড়িয়া",
      "bhalukgachi": "ভালুকগাছী",
      "ponguapara": "পঙ্গুয়াপাড়া",
      "jhalmalia": "ঝলমলিয়া"
    };
    const benglaiUnion = unionMap[areaValue] || areaValue;

    const formattedLastDonated = isFirstTimeDonor 
      ? "প্রথমবার রক্তদান করবেন" 
      : lastDonationDate 
        ? new Date(lastDonationDate).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
        : "জানা নেই";

    const newDonor = {
      id: "donor_" + Date.now(),
      name: nameValue,
      group: selectedGroup,
      phone: phoneValue,
      union: benglaiUnion,
      lastDonated: formattedLastDonated,
      isReady: true
    };

    const updatedDonors = [newDonor, ...bloodDonors];
    setBloodDonors(updatedDonors);
    localStorage.setItem("puthia_blood_donors", JSON.stringify(updatedDonors));

    setDonorName(nameValue);
    setShowSuccessOverlay(true);
  };

  return (
    <div className="font-sans space-y-6 pb-6" id="blood-donation-reg-view">
      {/* Hero Banner Section */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #B91C1C, #EF4444)" }}
      >
        <button 
          onClick={onGoBack} 
          id="reg-back-btn"
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">মানবতার কল্যাণে আপনার একটি সিদ্ধান্ত</p>
          <h1 className="text-3xl font-black mb-3 text-white">রক্তদাতা নিবন্ধন</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             আপনার দেওয়া এক ব্যাগ রক্ত বাঁচাতে পারে একটি মুমূর্ষু জীবন। পুঠিয়া উপজেলার ব্লাড ব্যাংকে একজন গর্বিত রক্তদাতা হিসেবে আজই আপনার নাম তালিকাভুক্ত করুন।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-2 bg-white rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold shadow-sm border border-gray-100">
          <span className="text-xl text-[#D32F2F]">⚖️</span> 
          <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight text-gray-700 text-center">বয়স: ১৮-৫৭</span>
        </div>
        <div className="p-2 bg-white rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold shadow-sm border border-gray-100">
          <span className="text-xl text-[#D32F2F]">⚖️</span> 
          <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight text-gray-700 text-center">ওজন: ৪৫+ কেজি</span>
        </div>
        <div className="p-2 bg-white rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold shadow-sm border border-gray-100">
          <span className="text-xl text-[#D32F2F]">⏱️</span> 
          <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight text-gray-700 text-center">৪ মাস পর</span>
        </div>
        <div className="p-2 bg-white rounded-xl flex flex-col items-center justify-center gap-1.5 font-bold shadow-sm border border-gray-100">
          <span className="text-xl text-[#D32F2F]">🩺</span> 
          <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight text-gray-700 text-center">সম্পূর্ণ সুস্থ</span>
        </div>
      </div>

      {/* Main Registration Form Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#D32F2F]"></div>
        
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-red-50 rounded-lg text-[#D32F2F]">
             <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">রক্তদাতার প্রোফাইল তথ্য</h2>
        </div>

        <form onSubmit={onSimulateSubmit} className="space-y-5">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 block text-left">১. সম্পূর্ণ নাম *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                name="name"
                required
                placeholder="উদাঃ মোঃ আরিফুল ইসলাম" 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all duration-200"
              />
            </div>
          </div>

          {/* Blood Group */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block text-left">২. রক্তের গ্রুপ *</label>
            <div className="grid grid-cols-4 gap-2">
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(group => (
                <button
                  type="button"
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`py-2 rounded-lg border font-bold text-sm transition ${
                    selectedGroup === group 
                      ? 'bg-[#D32F2F] border-[#D32F2F] text-white' 
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 block text-left">৩. মোবাইল নম্বর *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="উদাহরণ: 01712345678" 
                  maxLength={11} 
                  pattern="01[3-9][0-9]{8}" 
                  required 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all duration-200"
                />
              </div>
          </div>

          {/* Area */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 block text-left">৪. ইউনিয়ন/এলাকা নির্বাচন *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select 
                name="area"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all duration-200 appearance-none font-medium text-gray-700"
              >
                <option value="">এলাকা নির্বাচন করুন...</option>
                <option value="puthia_sadar">পুঠিয়া সদর</option>
                <option value="baneswar">বানেশ্বর</option>
                <option value="jiupara">জিউপাড়া</option>
                <option value="shilmaria">শিলমাড়িয়া</option>
                <option value="bhalukgachi">ভালুকগাছী</option>
                <option value="ponguapara">পঙ্গুয়াপাড়া</option>
                <option value="jhalmalia">ঝলমলিয়া</option>
              </select>
            </div>
          </div>

          {/* Last Donation Date */}
          <div className="space-y-1.5 text-left">
              <label className="text-sm font-bold text-gray-700 block">৫. শেষ কবে রক্ত দিয়েছেন?</label>
              <input 
                type="date" 
                name="last_donation" 
                disabled={isFirstTimeDonor}
                value={isFirstTimeDonor ? "" : lastDonationDate}
                onChange={(e) => setLastDonationDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all duration-200 text-gray-700 disabled:opacity-50"
              />
              
              <label className="flex items-center gap-2 mt-2 text-xs text-gray-500 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isFirstTimeDonor}
                    onChange={(e) => {
                      setIsFirstTimeDonor(e.target.checked);
                      if (e.target.checked) {
                        setLastDonationDate("");
                      }
                    }}
                    className="w-4 h-4 text-[#D32F2F] rounded cursor-pointer accent-[#D32F2F]"
                  />
                  আমি জীবনে প্রথমবার রক্ত দেব (পূর্বে দেওয়া হয়নি)
              </label>
          </div>

          {/* Checkbox */}
          <div className="pt-2 text-left">
            <label className="flex items-start gap-3 cursor-pointer bg-red-50/50 p-4 rounded-xl border border-red-100/50 transition hover:border-red-100">
              <div className="flex items-center h-5 mt-0.5">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                  className="w-4 h-4 text-[#D32F2F] bg-white border-gray-300 rounded focus:ring-[#D32F2F]/20 cursor-pointer accent-[#D32F2F]"
                />
              </div>
              <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                 আমি সজ্ঞানে অঙ্গীকার করছি যে, আমার দেওয়া সমস্ত তথ্য সত্য এবং জরুরি প্রয়োজনে রক্তদানে আমি সাধ্যমতো চেষ্টা করব।
              </p>
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            id="reg-submit-btn"
            className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <Heart className="w-5 h-5 fill-current" /> গর্বিত রক্তদাতা হিসেবে নিবন্ধন করুন
          </button>
        </form>

      </div>
      
      {showSuccessOverlay && (
          <div id="success-overlay" className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 animate-fade-in">
              <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl border border-gray-100 transform scale-100 transition-all">
                  <div className="text-5xl mb-4">🩸</div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">ধন্যবাদ {donorName} ভাই!</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      আপনি এখন থেকে <b>আমাদের পুঠিয়া</b>-র একজন নিবন্ধিত গর্বিত রক্তদাতা। আপনার দেওয়া তথ্য আমাদের ডাটাবেজে সংরক্ষিত হয়েছে। কোনো জরুরি প্রয়োজনে রক্তদাতার প্রয়োজন হলে সরাসরি ফোনে আপনার সাথে যোগাযোগ করা হতে পারে।
                  </p>
                  <button 
                      onClick={() => {
                          setShowSuccessOverlay(false);
                          onGoBack();
                      }} 
                      id="success-home-btn"
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition shadow-md hover:shadow-lg cursor-pointer"
                  >
                      হোম পেজে ফিরে যান
                  </button>
              </div>
          </div>
      )}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
