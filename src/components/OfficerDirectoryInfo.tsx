import React, { useState } from 'react';
import { ArrowLeft, Phone, MapPin, Mail, Search, Award, Building2, UserCheck, CheckCircle } from 'lucide-react';

interface Officer {
  id: string;
  name: string;
  designation: string;
  block: string; // 'upazila', 'union', 'plant'
  unionName?: string;
  phone: string;
  email?: string;
  location: string;
  responsibilities: string;
  status: 'active' | 'on_field';
}

const OFFICERS_DATA: Officer[] = [
  {
    id: "o1",
    name: "কৃষিবিদ মো: রাজিবুর রহমান",
    designation: "উপজেলা কৃষি অফিসার (UAO)",
    block: "upazila",
    phone: "01712345678",
    email: "uao_puthia@dae.gov.bd",
    location: "উপজেলা পরিষদ চত্বর, পুঠিয়া সদর (দ্বিতীয় তলা)",
    responsibilities: "উপজেলার সামগ্রিক কৃষি সম্প্রসারণ, সরকারি বীজ-সার প্রণোদনা বিতরণ সমন্বয় এবং জরুরি বন্যা/খরা দুর্যোগ ব্যবস্থাপনাকরণ।",
    status: "active"
  },
  {
    id: "o2",
    name: "মো: আব্দুল কুদ্দুস",
    designation: "অতিরিক্ত কৃষি কর্মকর্তা (AAO)",
    block: "upazila",
    phone: "01723456789",
    email: "aao_puthia@dae.gov.bd",
    location: "উপজেলা কৃষি অফিস, পুঠিয়া",
    responsibilities: "মাঠপর্যায়ের প্রযুক্তি প্রদর্শনীর তদারকি, প্রশিক্ষণ পরিচালনা এবং কৃষি উন্নয়ন প্রকল্পের অগ্রগতি পর্যবেক্ষণ।",
    status: "on_field"
  },
  {
    id: "o3",
    name: "শ্রী নিখিল চন্দ্র রায়",
    designation: "সহকারী উদ্ভিদ সংরক্ষণ কর্মকর্তা (ASPO)",
    block: "plant",
    phone: "01734567890",
    location: "উপজেলা কৃষি অফিস, পুঠিয়া (উদ্ভিদ সংরক্ষণ শাখা)",
    responsibilities: "আম বাগান ও অন্যান্য ফসলের মহামারী রোগবালাই ও ক্ষতিকর পোকা পরীক্ষা করে সঠিক অনুমোদিত বালাইনাশক প্রেসক্রাইব করা।",
    status: "active"
  },
  {
    id: "o4",
    name: "মো: কামরুজ্জামান",
    designation: "উপ-সহকারী কৃষি কর্মকর্তা (SAAO)",
    block: "union",
    unionName: "বানেশ্বর ইউনিয়ন (বানেশ্বর ব্লক)",
    phone: "01745678901",
    location: "বানেশ্বর ইউনিয়ন তথ্য ও সেবা কেন্দ্র, বানেশ্বর বাজার",
    responsibilities: "বানেশ্বর হাটের আম বাগান পরিচর্যা, উঠান বৈঠক, স্থানীয় পেঁয়াজ ও রসুন চাষীদের মাঠপর্যায়ে সরাসরি ফ্রি বালাইনাশক পরামর্শ প্রদান।",
    status: "on_field"
  },
  {
    id: "o5",
    name: "মোছা: নাজমুন নাহার",
    designation: "উপ-সহকারী কৃষি কর্মকর্তা (SAAO)",
    block: "union",
    unionName: "জিউপাড়া ইউনিয়ন (জিউপাড়া ব্লক)",
    phone: "01756789012",
    location: "জিউপাড়া ইউনিয়ন পরিষদ কার্যালয়",
    responsibilities: "জিউপাড়া অঞ্চলের শস্য বহুমুখীকরণ প্রকল্প তদারকি, মাটির স্বাস্থ্য পরীক্ষা (টিন টেস্ট) এবং ড্রাগন ফল ও সবজি চাষে সহায়তা।",
    status: "active"
  },
  {
    id: "o6",
    name: "মো: রফিকুল ইসলাম",
    designation: "উপ-সহকারী কৃষি কর্মকর্তা (SAAO)",
    block: "union",
    unionName: "শিলমাড়িয়া ইউনিয়ন (শিলমাড়িয়া ব্লক)",
    phone: "01767890123",
    location: "শিলমাড়িয়া ইউনিয়ন কার্যালয়",
    responsibilities: "শিলমাড়িয়ার বিখ্যাত পান চাষীদের লতাপচা দমন, বরজের আবহাওয়া ব্যবস্থাপনা ও তামাক বর্জন করে লাভজনক সরিষা চাষে উদ্বুদ্ধকরণ।",
    status: "on_field"
  },
  {
    id: "o7",
    name: "মো: আশরাফুল ইসলাম",
    designation: "উপ-সহকারী কৃষি কর্মকর্তা (SAAO)",
    block: "union",
    unionName: "ভালুকগাছী ইউনিয়ন (ভালুকগাছী ব্লক)",
    phone: "01778901234",
    location: "ভালুকগাছী ইউনিয়ন পরিষদ",
    responsibilities: "ভালুকগাছী বিল এলাকায় জলাবদ্ধতা নিরসন গাইড, ভাসমান সবজি চাষ ও বোরো ধানের আধুনিক চাষাবাদ প্রশিক্ষণ প্রদান।",
    status: "active"
  }
];

export const OfficerDirectoryInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'upazila' | 'union' | 'plant'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingOfficer, setBookingOfficer] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('সকাল ১০:০০ - ১২:০০');

  // Filter officers
  const filteredOfficers = OFFICERS_DATA.filter(officer => {
    // Tab filter
    const matchesTab = activeTab === 'all' || officer.block === activeTab;
    
    // Search query filter
    const matchesSearch = 
      officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (officer.unionName && officer.unionName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      alert("দয়া করে সাক্ষাতের তারিখ নির্বাচন করুন ভাই।");
      return;
    }
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingOfficer(null);
      setBookingDate('');
    }, 2000);
  };

  return (
    <div className="font-sans space-y-6 pb-6 text-left animate-fade-in" id="officer-directory-view">
      {/* Premium Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #065f46, #047857)" }}
      >
        <button 
          onClick={onGoBack} 
          id="officer-back-btn"
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        
        <div className="mt-6 relative z-10">
          <span className="bg-emerald-500/30 text-emerald-100 border border-emerald-400/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 inline-block">
            সরকারি কৃষি সেবা ও মাঠ পরামর্শ
          </span>
          <h1 className="text-3xl font-black mb-3 text-white">কৃষি কর্মকর্তা ডিরেক্টরি</h1>
          <p className="text-emerald-50 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-emerald-400 pl-3 py-1">
             পুঠিয়া উপজেলা কৃষি সম্প্রসারণ কার্যালয়ের অফিসার এবং আপনার ইউনিয়নের দায়িত্বে নিয়োজিত উপ-সহকারী কৃষি কর্মকর্তাদের সরকারি মোবাইল নম্বর ডিরেক্টরি।
          </p>
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
      </div>

      {/* Grid Tabs Selection */}
      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1 font-sans">
        {[
          { id: 'all', label: 'সব কর্মকর্তা', icon: '📞' },
          { id: 'upazila', label: 'উপজেলা অফিস', icon: '🏢' },
          { id: 'union', label: 'ইউনিয়ন পর্যায়', icon: '🌾' },
          { id: 'plant', label: 'উদ্ভিদ সংরক্ষণ', icon: '🏥' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive 
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.icon}</span>
              <span className="font-extrabold text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <span className="absolute left-3.5 inset-y-0 flex items-center text-gray-400">
          <Search className="w-4 h-4" />
        </span>
        <input 
          type="text"
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="নাম, পদবি বা ইউনিয়নের নাম লিখে খুঁজুন..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition"
        />
      </div>

      {/* Officers List Rendering */}
      <div className="space-y-4">
        {filteredOfficers.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
            <span className="text-4xl block mb-2">🕵️‍♂️</span>
            <h5 className="text-base font-bold text-gray-800 mb-1">কোনো কৃষি কর্মকর্তা পাওয়া যায়নি</h5>
            <p className="text-gray-500 text-xs">সঠিক বানান চেক করে পুনরায় অনুসন্ধান করুন ভাই।</p>
          </div>
        ) : (
          filteredOfficers.map((officer) => (
            <div 
              key={officer.id} 
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Profile Card Header */}
              <div className="flex gap-4 items-start pr-12">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0 flex items-center justify-center text-2xl shadow-inner border border-emerald-100 font-bold">
                  {officer.block === 'upazila' && '🏢'}
                  {officer.block === 'union' && '🌾'}
                  {officer.block === 'plant' && '🏥'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-base leading-tight flex items-center gap-1.5">
                    {officer.name}
                  </h4>
                  <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> {officer.designation}
                  </p>
                  {officer.unionName && (
                    <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-2 inline-block">
                      {officer.unionName}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${officer.status === 'active' ? 'bg-green-500 animate-ping' : 'bg-amber-500'}`}></span>
                <span className="text-[10px] font-bold text-gray-400">
                  {officer.status === 'active' ? 'অফিসে আছেন' : 'মাঠে কর্মরত'}
                </span>
              </div>

              {/* Details and Contact section */}
              <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 leading-relaxed">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <p><span className="font-bold text-gray-800">অফিসের ঠিকানা:</span> {officer.location}</p>
                </div>
                {officer.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p><span className="font-bold text-gray-800">অফিসিয়াল ইমেইল:</span> {officer.email}</p>
                  </div>
                )}
                <div className="border-t border-gray-200/50 pt-2.5 mt-2.5">
                  <span className="font-bold text-gray-800 block mb-1">📋 প্রধান দায়িত্ব ও কাজের ক্ষেত্র:</span>
                  <p className="text-gray-500 text-justify leading-relaxed">{officer.responsibilities}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href={`tel:${officer.phone}`} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" /> সরাসরি কল করুন
                </a>
                
                <button 
                  onClick={() => setBookingOfficer(officer.name)}
                  className="bg-zinc-800 hover:bg-zinc-900 text-white text-center py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  📅 সাক্ষাৎ বুক করুন
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Appointment Booking Modal Sheet */}
      {bookingOfficer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-xl space-y-4 text-left">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
              <UserCheck className="w-5 h-5 text-emerald-600" /> সাক্ষাতের অ্যাইস্টারমেন্ট রিকোয়েস্ট
            </h3>

            <p className="text-xs text-gray-500 leading-relaxed">
              আপনি কৃষিবিদ <b>{bookingOfficer}</b> এর সাথে মুখোমুখি সাক্ষাতের জন্য একটি রিকোয়েস্ট তৈরি করছেন।
            </p>

            {bookingSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-xs font-bold text-center animate-pulse">
                🎉 অ্যাইস্টারমেন্ট রিকোয়েস্টটি সফলভাবে পাঠানো হয়েছে! কর্মকর্তা সম্মতি দিলে আপনার নম্বরে এসএমএস বা কল করে জানিয়ে দেওয়া হবে।
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">১. সাক্ষাতের কাঙ্ক্ষিত তারিখ *</label>
                  <input 
                    type="date"
                    required
                    value={bookingDate || ""}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">২. কাঙ্ক্ষিত সময় সূচী *</label>
                  <select
                    value={bookingTime || ""}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 font-semibold text-gray-700"
                  >
                    <option value="সকাল ১০:০০ - ১২:০০">সকাল ১০:০০ - ১২:০০ (অফিস টাইম)</option>
                    <option value="দুপুর ১২:৩০ - ০২:০০">দুপুর ১২:৩০ - ০২:০০ (অফিস টাইম)</option>
                    <option value="বিকেল ০৩:০০ - ০৪:৩০">বিকেল ০৩:০০ - ০৪:৩০ (মাঠ পরিদর্শন পূর্ব)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">৩. আপনার মোবাইল নম্বর *</label>
                  <input 
                    type="tel"
                    maxLength={11}
                    required
                    placeholder="উদাঃ 01712345678"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">৪. সাক্ষাতের মূল কারণ/বিষয়টি লিখুন *</label>
                  <textarea 
                    rows={2}
                    required
                    placeholder="উদাঃ আমাদের এলাকার আম গাছে মাছি পোকার আক্রমণ হয়েছে..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setBookingOfficer(null)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    বাতিল করুন
                  </button>
                  <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> সাবমিট করুন
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
