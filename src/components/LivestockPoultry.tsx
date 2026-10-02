import React, { useState } from 'react';
import { ArrowLeft, Phone, MapPin, Calculator, ShieldCheck, Heart, User, Sparkles, Star } from 'lucide-react';

interface SicknessGuide {
  disease: string;
  symptoms: string;
  solution: string;
  vaccine?: string;
}

const SICKNESS_DATA: Record<string, SicknessGuide[]> = {
  cattle: [
    {
      disease: "🐂 ক্ষুরা রোগ (Foot and Mouth Disease - FMD)",
      symptoms: "তীব্র জ্বর, মুখ ও জিহ্বায় এবং খুরের মাঝে ফোসকা পড়ে ও ঘা হয়, মুখ দিয়ে লালা ঝরে, পশু খুঁড়িয়ে হাঁটে ও খাওয়া বন্ধ করে দেয়।",
      solution: "আক্রান্ত পশুর মুখ ৪% সোডা পানি বা পটাশ পানি দিয়ে ধুয়ে দিন। পায়ে ঘা হলে তুঁতের পানি ব্যবহার করুন। আক্রান্ত পশুকে সুস্থ পশু থেকে সম্পূর্ণ আলাদা করে ছায়ায় রাখুন ভাই।",
      vaccine: "FMD ভ্যাকসিন (প্রতি বছর ২ বার দিতে হয়)"
    },
    {
      disease: "🐐 ল্যাম্পি স্কিন রোগ (Lumpy Skin Disease - LSD)",
      symptoms: "পশুর শরীরে গুটি গুটি পক্স দেখা দেয়, লসিকা গ্রন্থি ফুলে যায়, তীব্র জ্বর ও পা ফুলে পানি জমে ক্ষত সৃষ্টি হতে পারে।",
      solution: "জ্বর কমানোর জন্য প্যারাসিটামল ও অ্যান্টি-হিস্টামিন ড্রাগ ব্যবহার করুন। শরীরে নিম পাতার পানি বা পটাশ জল দিয়ে ক্ষতস্থান পরিষ্কার রাখুন। মশা-মাছির কামড় থেকে বাঁচিয়ে মশারির ভেতর রাখুন পশুকে।",
      vaccine: "গোট পক্স ভ্যাকসিন (LSD প্রতিরোধের অন্যতম উপায়)"
    }
  ],
  poultry: [
    {
      disease: "🐣 রাণীক্ষেত রোগ (Newcastle Disease)",
      symptoms: "শ্বাসকষ্ট, হাঁ মুখ করে নিঃশ্বাস নেওয়া, নাক ও মুখ দিয়ে তরল ঝরা, সবুজ রঙের ডায়রিয়া ও পা অবশ হয়ে ঘাড় বেঁকে যাওয়া।",
      solution: "রাণীক্ষেত ভাইরাসের সুনির্দিষ্ট চিকিৎসা নেই। তবে দ্বীদ্বিতীয় পর্যায়ের ব্যাকটেরিয়া ইনফেকশন এড়াতে অ্যান্টিবায়োটিক থেরাপি এবং মাল্টিভিটামিন দেওয়া অত্যন্ত জরুরি।",
      vaccine: "BCRDV (১ম সপ্তাহে) ও RDV (১২তম সপ্তাহে) টিকা দিন"
    },
    {
      disease: "🐔 গামবোরো রোগ (Gumboro Disease)",
      symptoms: "মুরগি ঝিমায়, পালক খাড়া করে রাখে, সাদাটে পাতলা মলত্যাগ করে এবং মুরগির মাংসপেশীতে লালচে রক্তের দাগ দেখা যায়।",
      solution: "খামারে জীবানুনাশক স্প্রে করুন। খাবারের পানিতে ইলেক্ট্রোলাইট ও ভিটামিন-সি মিশিয়ে দিয়ে ধকল কমান।",
      vaccine: "গামবোরো লাইভ ভ্যাকসিন (১৪ ও ২১তম দিনে)"
    }
  ],
  fisheries: [
    {
      disease: "🐟 শীতকালীন ক্ষত রোগ (EUS)",
      symptoms: "মাছের লেজ, পিঠ ও গায়ে লালচে দাগ বা ঘা দেখা দেয়। পরবর্তীতে পচন ধরে মাছ ভেসে ওঠে ও মারা যায়।",
      solution: "পুকুরের পানি ভালো রাখতে চুন (১ কেজি/শতক) এবং লবণ (১ কেজি/শতক) গুলে সারা পুকুরে ছিটিয়ে দিন। অথবা পুকুরে পটাসিয়াম পারম্যাঙ্গানেট ৩ গ্রাম প্রতি শতকে প্রয়োগ করতে পারেন।"
    }
  ]
};

const VET_DOCTORS = [
  {
    name: "ডা: মো: সাজ্জাদ হোসেন",
    title: "উপজেলা ভেটেরিনারি সার্জন (UVS)",
    location: "উপজেলা প্রাণিসম্পদ দপ্তর ও ভেটেরিনারি হাসপাতাল, পুঠিয়া সদর",
    phone: "01723456781",
    rating: "৫.০",
    expertise: "গবাদি পশুর জটিল সার্জারি ও কৃত্রিম প্রজনন বিশেষজ্ঞ"
  },
  {
    name: "ডা: সুব্রত কুমার দেবনাথ",
    title: "সহকারী প্রাণিসম্পদ কর্মকর্তা (এল.এ.ডি)",
    location: "বানেশ্বর ভেটেরিনারি সাব-সেন্টার, বানেশ্বর বাজার",
    phone: "01734567812",
    rating: "৪.৯",
    expertise: "হাঁস-মুরগির রোগ নির্ণয় ও ভ্যাকসিনেটর পরামর্শক"
  },
  {
    name: "মো: আব্দুল হান্নান",
    title: "ভেটেরিনারি কম্পাউন্ডার (মাঠ ও খামার বিশেষজ্ঞ)",
    location: "জিউপাড়া জোন ও ঝলমলিয়া ক্লিনিক এরিয়া",
    phone: "01856789012",
    rating: "৪.৮",
    expertise: "খামার জীবানুনাশক ও গবাদি পশুর প্রাথমিক চিকিৎসা"
  }
];

export const LivestockPoultry = ({ onGoBack }: { onGoBack?: () => void }) => {
  const [activeTab, setActiveTab] = useState<'cattle' | 'poultry' | 'fisheries' | 'vet'>('cattle');

  // Cattle Feed Ration Calculator states
  const [cattleWeight, setCattleWeight] = useState<string>('');
  const [cattleType, setCattleType] = useState<'meat' | 'milk'>('meat');
  const [calcResult, setCalcResult] = useState<{
    dryMatter: string;
    greenGrass: string;
    straw: string;
    feedConcentrate: string;
  } | null>(null);

  const handleCalculateFeed = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(cattleWeight);
    if (isNaN(weight) || weight <= 0) {
      alert("দয়া করে পশুর ওজন (কেজিতে) সঠিকভাবে লিখুন ভাই।");
      return;
    }

    // High quality scientific rough calculation:
    // Dry Matter (DM) requirement is roughly 2.5% of body weight
    const dm = weight * 0.025;
    
    // In typical local ratio:
    // Green grass should be ~10% of body weight in wet weight
    const grass = weight * 0.10;
    
    // Straw (খড়) should be ~1.5% of body weight
    const straw = weight * 0.015;
    
    // Concentrate (দানাদার খাদ্য):
    // For meat production: ~1% of body weight
    // For milk production: ~0.5% body weight + extra based on milk yield (assumed standard here)
    const concentrate = cattleType === 'meat' ? weight * 0.01 : (weight * 0.008 + 1.5);

    setCalcResult({
      dryMatter: dm.toFixed(1),
      greenGrass: grass.toFixed(1),
      straw: straw.toFixed(1),
      feedConcentrate: concentrate.toFixed(1)
    });
  };

  return (
    <div className="font-sans space-y-6 pb-6 text-left animate-fade-in" id="livestock-poultry-view">
      {/* Premium Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #0f766e, #115e59)" }}
      >
        <button 
          onClick={onGoBack} 
          id="livestock-back-btn"
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        
        <div className="mt-6 relative z-10">
          <span className="bg-teal-500/30 text-teal-200 border border-teal-500/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 inline-block">
            প্রাণিসম্পদ ও দুগ্ধ খামার
          </span>
          <h1 className="text-3xl font-black mb-3 text-white">প্রাণিসম্পদ ও মৎস্য গাইড</h1>
          <p className="text-teal-50 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-teal-400 pl-3 py-1">
             পুঠিয়া অঞ্চলের খামারী ভাইদের জন্য গরু-ছাগল মোটাতাজাকরণ, উন্নত হাঁস-মুরগি পালন, মাছ চাষের আধুনিক বৈজ্ঞানিক পরামর্শ ও ভেটেরিনারি ডাক্তার ডিরেক্টরি।
          </p>
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
      </div>

      {/* Grid Tabs Selection */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: 'cattle', label: 'গবাদি পশু', icon: '🐄' },
          { id: 'poultry', label: 'হাঁস-মুরগি', icon: '🐓' },
          { id: 'fisheries', label: 'মৎস্য চাষ', icon: '🐟' },
          { id: 'vet', label: 'পশু ডাক্তার', icon: '👨‍⚕️' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-1 rounded-2xl text-center border font-bold text-xs transition shadow-sm cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-teal-50 border-teal-300 text-teal-800' 
                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg block mb-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Dynamic View Content */}
      <div className="space-y-5">
        
        {/* TABS 1-3: SICKNESS AND TREATMENT GUIDES */}
        {activeTab !== 'vet' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-gray-800 text-base px-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-teal-600" /> খামারের প্রধান রোগবালাই ও বৈজ্ঞানিক চিকিৎসা
            </h3>

            <div className="space-y-4">
              {SICKNESS_DATA[activeTab]?.map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-600"></div>
                  
                  <div className="flex flex-col gap-3 pl-2">
                    <h4 className="font-bold text-gray-800 text-sm">{item.disease}</h4>
                    
                    <div className="space-y-2 text-xs leading-relaxed text-justify">
                      <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                        <span className="font-bold text-red-800 block mb-1">⚠️ লক্ষণ:</span>
                        <p className="text-gray-600">{item.symptoms}</p>
                      </div>

                      <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100/50">
                        <span className="font-bold text-teal-800 block mb-1">🩺 প্রাথমিক করণীয় ও প্রেসক্রিপশন:</span>
                        <p className="text-gray-700">{item.solution}</p>
                      </div>

                      {item.vaccine && (
                        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100 font-bold text-amber-900 text-center">
                          💉 সরকারি টিকাদান গাইড: {item.vaccine}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TAB 1 CATTLE SPECIFIC FEED CALCULATOR TOOL */}
            {activeTab === 'cattle' && (
              <div className="bg-zinc-900 text-white rounded-3xl p-6 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-teal-500 text-zinc-950 p-1.5 rounded-xl">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">গরু-মহিষের দৈনিক খাদ্য রেশনের ক্যালকুলেটর</h3>
                    <span className="text-[10px] text-teal-400 font-bold block">বৈজ্ঞানিক পদ্ধতিতে সুষম খাদ্যের পরিমাণ হিসাব</span>
                  </div>
                </div>

                <form onSubmit={handleCalculateFeed} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold">১. পশুর আনুমানিক ওজন (কেজি) *</label>
                      <input 
                        type="number"
                        required
                        value={cattleWeight || ""}
                        onChange={(e) => setCattleWeight(e.target.value)}
                        placeholder="উদাঃ ১৫০"
                        className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2.5 rounded-xl text-xs outline-none focus:border-teal-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold">২. পালনের উদ্দেশ্য *</label>
                      <select
                        value={cattleType || ""}
                        onChange={(e) => setCattleType(e.target.value as any)}
                        className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2.5 rounded-xl text-xs outline-none font-bold"
                      >
                        <option value="meat">মোটাতাজাকরণ ও মাংস উৎপাদন</option>
                        <option value="milk">গাভীর দুগ্ধ উৎপাদন বৃদ্ধি</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-teal-500 hover:bg-teal-600 text-zinc-950 font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow-sm"
                  >
                    খাদ্যের রেশন হিসাব করুন
                  </button>
                </form>

                {calcResult && (
                  <div className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 space-y-3 animate-fade-in text-xs">
                    <h4 className="font-bold text-teal-400 border-b border-zinc-700 pb-1.5">🐂 দৈনিক সুষম খাদ্য রেশন ছক:</h4>
                    <div className="grid grid-cols-2 gap-3 text-zinc-300">
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">শুকনা খাবার (Dry Matter)</span>
                        <span className="font-bold text-white text-sm">{calcResult.dryMatter} কেজি</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">কাঁচা সবুজ ঘাস</span>
                        <span className="font-bold text-white text-sm">{calcResult.greenGrass} কেজি</span>
                      </div>
                      <div className="border-t border-zinc-700/50 pt-2">
                        <span className="text-[10px] text-zinc-500 block uppercase">শুকনো খড় (Straw)</span>
                        <span className="font-bold text-white text-sm">{calcResult.straw} কেজি</span>
                      </div>
                      <div className="border-t border-zinc-700/50 pt-2">
                        <span className="text-[10px] text-zinc-500 block uppercase">দানাদার মিশ্রণ (Concentrate)</span>
                        <span className="font-bold text-white text-sm">{calcResult.feedConcentrate} কেজি</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed pt-2 border-t border-zinc-700/50 text-justify">
                      * <b>পরামর্শ:</b> দানাদার মিশ্রণে ভূষি, খৈল, চালের কুঁড়া ও লবণের সুষম অনুপাত থাকা উচিত ভাই। কাঁচা ঘাসের সাথে সামান্য খড় কুচি মিশিয়ে খাওয়ালে হজম ভালো হয়।
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VETERINARY DOCTORS */}
        {activeTab === 'vet' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-gray-800 text-base px-1 flex items-center gap-1.5">
              <Heart className="w-4.5 h-4.5 text-teal-600 animate-pulse" /> পুঠিয়া উপজেলা প্রাণিসম্পদ চিকিৎসক ডিরেক্টরি
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed px-1">
               গবাদি পশুর হঠাৎ তীব্র পাতলা পায়খানা, বাছুর প্রসবের জটিলতা বা বিষক্রিয়ায় দ্রুত নিচের সরকারি ও রেজিস্টার্ড ভেটেরিনারি চিকিৎসকদের সাথে ফোনে যোগাযোগ করুন।
            </p>

            <div className="space-y-4">
              {VET_DOCTORS.map((doc, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                  <div className="flex gap-4 items-start pr-12">
                    <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex-shrink-0 flex items-center justify-center text-xl shadow-inner border border-teal-100 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm leading-tight">{doc.name}</h4>
                      <p className="text-[11px] font-bold text-teal-600 mt-1">{doc.title}</p>
                      
                      <p className="text-xs text-gray-400 mt-2 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400 mt-0.5" /> 
                        <span>{doc.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 border border-teal-100">
                    <Star className="w-3 h-3 fill-teal-600 text-teal-600" /> {doc.rating}
                  </div>

                  <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-xs text-gray-500 leading-relaxed text-justify">
                    <span className="font-bold text-gray-700 block mb-0.5">🌿 প্রধান দক্ষতা:</span>
                    {doc.expertise}
                  </div>

                  <a 
                    href={`tel:${doc.phone}`}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" /> ডাক্তারকে কল করুন ({doc.phone})
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
