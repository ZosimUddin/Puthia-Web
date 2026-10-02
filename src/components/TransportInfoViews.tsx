import React from 'react';
import { ArrowLeft, ArrowRight, Bus, Train, Banknote, Clock, MapPin, Phone } from 'lucide-react';

const busSchedules = [
  {
    route: "রাজশাহী - ঢাকা",
    type: "এসি / নন-এসি",
    buses: ["ন্যাশনাল ট্রাভেলস", "দেশ ট্রাভেলস", "হানিফ এন্টারপ্রাইজ", "শ্যামলী পরিবহন", "দেশা"],
    time: "সকাল ৬:০০ থেকে রাত ১১:০০ পর্যন্ত (প্রতি ১ ঘণ্টা পর পর)",
    boarding: ["বানেশ্বর বাজার বাস স্ট্যান্ড", "পুঠিয়া বাস স্ট্যান্ড"]
  },
  {
    route: "রাজশাহী - চট্টগ্রাম",
    type: "এসি / নন-এসি",
    buses: ["ন্যাশনাল ট্রাভেলস", "দেশ ট্রাভেলস", "হানিফ এন্টারপ্রাইজ", "শ্যামলী পরিবহন"],
    time: "সকাল ৭:০০ থেকে রাত ৮:০০ পর্যন্ত",
    boarding: ["বানেশ্বর ট্রাফিক মোড়", "পুঠিয়া বাজার"]
  },
  {
    route: "রাজশাহী - সিলেট",
    type: "এসি / নন-এসি",
    buses: ["শ্যামলী পরিবহন", "এনা পরিবহন", "হানিফ এন্টারপ্রাইজ"],
    time: "সকাল ৭:৩০ থেকে রাত ৮:৩০ পর্যন্ত",
    boarding: ["বানেশ্বর বাজার", "পুঠিয়া"]
  },
  {
    route: "রাজশাহী - রংপুর / কুড়িগ্রাম",
    type: "নন-এসি",
    buses: ["মায়ের দোয়া", "আহমেদ পরিবহন", "বিআরটিসি", "পিংকি"],
    time: "সকাল ৬:০০ থেকে সন্ধ্যা ৬:০০ পর্যন্ত",
    boarding: ["পুঠিয়া বাস স্ট্যান্ড", "বানেশ্বর ট্রাফিক মোড়"]
  },
  {
    route: "লোকাল সার্ভিস (রাজশাহী - নাটোর - পাবনা)",
    type: "লোকাল / সিটিং সার্ভিস",
    buses: ["রাজশাহী-নাটোর গামী সকল লোকাল বাস", "মহানগর পরিবহন"],
    time: "সকাল ৬:০০ থেকে রাত ৯:০০ পর্যন্ত (প্রতি ১০-১৫ মিনিট পর পর)",
    boarding: ["পুঠিয়া সদর", "বানেশ্বর", "ঝলমলিয়া", "বেলপুকুর"]
  }
];

export function BusScheduleView({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = React.useState('all');

  const filteredSchedules = busSchedules.filter(schedule => {
    if (activeTab === 'all') return true;
    if (activeTab === 'dhaka' && schedule.route.includes("ঢাকা")) return true;
    if (activeTab === 'chittagong' && schedule.route.includes("চট্টগ্রাম")) return true;
    if (activeTab === 'local' && schedule.route.includes("লোকাল")) return true;
    return false;
  });

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      {/* 🟢 ওপরে প্রিমিয়াম ডার্ক গ্রিন ব্যানার */}
      <div 
        className="p-6 rounded-[24px] text-white mb-5 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #064e3b, #022c22)' }}
      >
        <div className="block mb-4">
          <button 
            onClick={onGoBack} 
            className="border-none px-3.5 py-1.5 rounded-full text-white text-xs font-bold cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-1.5"
            style={{ background: 'rgba(255, 255, 255, 0.15)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
          </button>
        </div>
        <span 
          className="text-xs px-3 py-1 rounded-xl inline-block mb-2 font-medium"
          style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)' }}
        >
          পুঠিয়া পরিবহন কেন্দ্র
        </span>
        <h2 className="m-0 mb-3 text-[26px] font-extrabold tracking-wide">বাস সময়সূচী</h2>
        <div className="w-10 h-1 rounded-sm mb-3.5" style={{ background: '#34d399' }}></div>
        <p className="m-0 text-[13px] opacity-85 leading-relaxed text-justify">
          পুঠিয়া উপজেলা সদর ও বানেশ্বর বাজার থেকে ছেড়ে যাওয়া দূরপাল্লা এবং লোকাল বাসের রিয়েল-টাইম সময়সূচী ও কাউন্টার নম্বর।
        </p>
      </div>
      
      {/* 🎛️ ৪টি সাব-ক্যাটাগরি বাটন (No-Scroll) */}
      <div className="flex gap-[6px] w-full box-border py-[2px] mb-6">
        <div 
          onClick={() => setActiveTab('all')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'all' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'all' ? '#055943' : '#1e293b', 
            border: activeTab === 'all' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'all' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">🚌</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">সব বাস</div>
        </div>
        
        <div 
          onClick={() => setActiveTab('dhaka')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'dhaka' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'dhaka' ? '#055943' : '#1e293b', 
            border: activeTab === 'dhaka' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'dhaka' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">🌆</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">ঢাকা রুট</div>
        </div>
        
        <div 
          onClick={() => setActiveTab('chittagong')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'chittagong' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'chittagong' ? '#055943' : '#1e293b', 
            border: activeTab === 'chittagong' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'chittagong' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">🌊</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">চট্টগ্রাম রুট</div>
        </div>
        
        <div 
          onClick={() => setActiveTab('local')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'local' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'local' ? '#055943' : '#1e293b', 
            border: activeTab === 'local' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'local' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">🛑</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">লোকাল বাস</div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map((schedule, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-gray-100 pb-4 mb-4 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{schedule.route}</h3>
                  <span className="inline-block mt-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                    {schedule.type}
                  </span>
                </div>
                <div className="hidden sm:flex w-12 h-12 rounded-full bg-emerald-50 items-center justify-center flex-shrink-0">
                  <Bus className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Bus className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">বাস </p>
                    <p className="text-sm font-bold text-gray-800">{schedule.buses.join(', ')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">সময়সূচী</p>
                    <p className="text-sm font-bold text-gray-800">{schedule.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">বোর্ডিং ইস্টার</p>
                    <p className="text-sm font-bold text-gray-800">{schedule.boarding.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm">কোনো বাস পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}

const trainSchedules = [
  {
    station: "রাজশাহী রেলওয়ে স্টেশন",
    trains: [
      { name: "সিল্কসিটি এক্সপ্রেস", route: "রাজশাহী - ঢাকা", time: "সকাল ৭:৪০", status: "On Time" },
      { name: "পদ্মা এক্সপ্রেস", route: "রাজশাহী - ঢাকা", time: "বিকেল ৪:০০", status: "Delayed" },
      { name: "ধূমকেতু এক্সপ্রেস", route: "রাজশাহী - ঢাকা", time: "রাত ১১:২০", status: "On Time" },
      { name: "বনলতা এক্সপ্রেস", route: "রাজশাহী - ঢাকা", time: "সকাল ৭:৩০", status: "On Time" },
      { name: "কপোতাক্ষ এক্সপ্রেস", route: "রাজশাহী - খুলনা", time: "দুপুর ২:১৫", status: "Delayed" },
      { name: "সাগরদাঁড়ি এক্সপ্রেস", route: "রাজশাহী - খুলনা", time: "সকাল ৬:৪০", status: "On Time" },
      { name: "উত্তরা মেইল (৩১)", route: "রাজশাহী - পার্বতীপুর", time: "দুপুর ১২:৩০", status: "Cancelled" },
      { name: "রাজশাহী মেইল (৫)", route: "রাজশাহী - ঈশ্বরদী", time: "সকাল ১০:০০", status: "On Time" },
      { name: "মহানন্দা মেইল (১৫)", route: "রাজশাহী - খুলনা", time: "দুপুর ৩:২০", status: "On Time" },
      { name: "রকেট মেইল (২৩)", route: "রাজশাহী - খুলনা", time: "সকাল ৯:১৫", status: "Delayed" }
    ]
  },
  {
    station: "আব্দুলপুর জংশন (নাটোর)",
    trains: [
      { name: "সিল্কসিটি এক্সপ্রেস", route: "রাজশাহী - ঢাকা", time: "সকাল ৮:৩৫", status: "On Time" },
      { name: "পদ্মা এক্সপ্রেস", route: "রাজশাহী - ঢাকা", time: "বিকেল ৪:৫৮", status: "Delayed" },
      { name: "ধূমকেতু এক্সপ্রেস", route: "রাজশাহী - ঢাকা", time: "রাত ১২:০৬", status: "On Time" },
      { name: "কপোতাক্ষ এক্সপ্রেস", route: "রাজশাহী - খুলনা", time: "দুপুর ৩:১০", status: "Delayed" },
      { name: "সাগরদাঁড়ি এক্সপ্রেস", route: "রাজশাহী - খুলনা", time: "সকাল ৭:৩৫", status: "On Time" },
      { name: "নীলসাগর এক্সপ্রেস", route: "চিলাহাটি - ঢাকা", time: "দুপুর ১:২০", status: "On Time" },
      { name: "কুড়িগ্রাম এক্সপ্রেস", route: "কুড়িগ্রাম - ঢাকা", time: "দুপুর ১:৫০", status: "On Time" },
      { name: "উত্তরা মেইল (৩১)", route: "রাজশাহী - পার্বতীপুর", time: "দুপুর ১:২০", status: "Cancelled" },
      { name: "রাজশাহী মেইল (৬)", route: "ঈশ্বরদী - রাজশাহী", time: "দুপুর ১২:৪০", status: "On Time" },
      { name: "রকেট মেইল (২৪)", route: "খুলনা - রাজশাহী", time: "বিকেল ৪:১০", status: "Delayed" }
    ]
  }
];

export function TrainInfoView({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = React.useState('all');

  const filteredSchedules = trainSchedules.map(stationInfo => ({
    ...stationInfo,
    trains: stationInfo.trains.filter(train => {
      if (activeTab === 'all') return true;
      if (activeTab === 'dhaka' && train.route.includes("ঢাকা")) return true;
      if (activeTab === 'khulna' && train.route.includes("খুলনা")) return true;
      if (activeTab === 'mail' && train.name.includes("মেইল")) return true;
      return false;
    })
  })).filter(stationInfo => stationInfo.trains.length > 0);

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div 
        className="p-6 rounded-[24px] text-white mb-6 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #064e3b, #022c22)', boxShadow: '0 4px 12px rgba(2, 44, 34, 0.15)' }}
      >
        <div className="block mb-4">
          <button 
            onClick={onGoBack} 
            className="border-none px-3.5 py-1.5 rounded-full text-white text-xs font-bold cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-1.5"
            style={{ background: 'rgba(255, 255, 255, 0.15)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
          </button>
        </div>
        <span 
          className="text-[11px] px-3 py-1 rounded-xl inline-block mb-2 font-bold tracking-wide"
          style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)' }}
        >
          🚆 রেলওয়ে সময়সূচী ও স্টেশন ডিরেক্টরি
        </span>
        <h2 className="m-0 mb-3 text-[26px] font-extrabold tracking-wide text-white">ট্রেন তথ্য</h2>
        <div className="w-10 h-1 rounded-sm mb-3.5" style={{ background: '#34d399' }}></div>
        <p className="m-0 text-[13px] opacity-85 leading-relaxed text-justify">
          রাজশাহী রেলওয়ে স্টেশন ও আব্দুলপুর জংশনসহ নিকটবর্তী স্টেশনের আন্তঃনগর ও মেইল ট্রেনের রিয়েল-টাইম সময়সূচী, ছুটির দিন এবং রুট সংক্রান্ত বিস্তারিত তথ্য।
        </p>
      </div>

      {/* 🎛️ ৪টি সাব-ক্যাটাগরি বাটন (No-Scroll) */}
      <div className="flex gap-[6px] w-full box-border py-[2px] mb-6">
        <div 
          onClick={() => setActiveTab('all')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'all' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'all' ? '#055943' : '#1e293b', 
            border: activeTab === 'all' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'all' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">🚆</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">সব ট্রেন</div>
        </div>
        
        <div 
          onClick={() => setActiveTab('dhaka')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'dhaka' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'dhaka' ? '#055943' : '#1e293b', 
            border: activeTab === 'dhaka' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'dhaka' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">🌆</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">ঢাকা রুট</div>
        </div>
        
        <div 
          onClick={() => setActiveTab('khulna')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'khulna' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'khulna' ? '#055943' : '#1e293b', 
            border: activeTab === 'khulna' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'khulna' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">🌳</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">খুলনা রুট</div>
        </div>
        
        <div 
          onClick={() => setActiveTab('mail')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'mail' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'mail' ? '#055943' : '#1e293b', 
            border: activeTab === 'mail' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'mail' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">🛑</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">মেইল ট্রেন</div>
        </div>
      </div>
      
      <div className="space-y-6">
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map((stationInfo, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{stationInfo.station}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stationInfo.trains.map((train, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Train className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{train.name}</p>
                        <p className="text-xs text-gray-500">{train.route}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg whitespace-nowrap">
                        {train.time}
                      </span>
                      {train.status === 'On Time' && (
                        <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-md whitespace-nowrap">
                          On Time
                        </span>
                      )}
                      {train.status === 'Delayed' && (
                        <span className="inline-block px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-md whitespace-nowrap">
                          Delayed
                        </span>
                      )}
                      {train.status === 'Cancelled' && (
                        <span className="inline-block px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md whitespace-nowrap">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm">কোনো ট্রেন পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}

const fareList = [
  {
    category: "বাস ভাড়া",
    icon: Bus,
    bgIcon: "bg-amber-50",
    textIcon: "text-amber-600",
    bgBadge: "bg-amber-50",
    textBadge: "text-amber-700",
    routes: [
      { from: "পুঠিয়া", to: "রাজশাহী (লোকাল)", fare: "৫০ - ৬০ টাকা" },
      { from: "পুঠিয়া", to: "নাটোর (লোকাল)", fare: "৪০ - ৫০ টাকা" },
      { from: "বানেশ্বর", to: "রাজশাহী (লোকাল)", fare: "৪০ - ৫০ টাকা" },
      { from: "রাজশাহী", to: "ঢাকা (এসি/নন-এসি)", fare: "৭০০ - ১৫০০ টাকা" }
    ]
  },
  {
    category: "ভ্যান ও অটোরিকশা",
    icon: Banknote,
    bgIcon: "bg-purple-50",
    textIcon: "text-purple-600",
    bgBadge: "bg-purple-50",
    textBadge: "text-purple-700",
    routes: [
      { from: "পুঠিয়া বাস স্ট্যান্ড", to: "পুঠিয়া রাজবাড়ী", fare: "১০ - ২০ টাকা" },
      { from: "পুঠিয়া", to: "ঝলমলিয়া", fare: "১৫ - ২০ টাকা" },
      { from: "বানেশ্বর", to: "পুঠিয়া", fare: "২০ - ২৫ টাকা" },
      { from: "পুঠিয়া", to: "শিলমাড়িয়া", fare: "৩০ - ৪০ টাকা" }
    ]
  },
  {
    category: "ট্রেন ভাড়া",
    icon: Train,
    bgIcon: "bg-blue-50",
    textIcon: "text-blue-600",
    bgBadge: "bg-blue-50",
    textBadge: "text-blue-700",
    routes: [
      { from: "রাজশাহী", to: "ঢাকা (শোভন চেয়ার)", fare: "৩৪০ টাকা" },
      { from: "রাজশাহী", to: "ঢাকা (স্নিগ্ধা)", fare: "৬৫৬ টাকা" },
      { from: "রাজশাহী", to: "খুলনা (শোভন চেয়ার)", fare: "২১০ টাকা" },
      { from: "আব্দুলপুর", to: "ঢাকা (শোভন চেয়ার)", fare: "২৮০ টাকা" }
    ]
  }
];

export function VanAutoInfoView({ onGoBack, onNavigateToMap }: { onGoBack: () => void, onNavigateToMap?: () => void }) {
  const [source, setSource] = React.useState("পুঠিয়া সদর (জিরো ইস্টার)");
  const [destination, setDestination] = React.useState("বানেশ্বর মোড় (হাট সংলগ্ন)");
  const [vehicle, setVehicle] = React.useState("সিএনজি অটোরিকশা");

  const routeDatabase: Record<string, Record<string, { distance: string; cngFare: string; vanFare: string; cngGuide: string; vanGuide: string }>> = {
    "পুঠিয়া সদর (জিরো ইস্টার)": {
      "বানেশ্বর মোড় (হাট সংলগ্ন)": {
        distance: "৮.২ কিমি",
        cngFare: "২০ টাকা (শেয়ার)",
        vanFare: "২৫ টাকা (শেয়ার)",
        cngGuide: "মহাসড়কের প্রধান সিএনজি শেয়ার আসনে ২০ টাকা ভাড়া। রিজার্ভ সিএনজি ভাড়া ১৫০ টাকা।",
        vanGuide: "ইজিবাইক বা লোকাল ভ্যানে শেয়ার ভাড়া ২৫ টাকা। রিজার্ভ ভাড়া ১০০-১২০ টাকা।"
      },
      "শিবপুর বাজার": {
        distance: "৭.৫ কিমি",
        cngFare: "২০ টাকা (শেয়ার)",
        vanFare: "২৫ টাকা (শেয়ার)",
        cngGuide: "শেয়ার সিএনজি ২০ টাকা। রিজার্ভ সিএনজি ১২০-১৫০ টাকা।",
        vanGuide: "লোকাল ভ্যান/ইজিবাইক ভাড়া ২৫ টাকা। রিজার্ভ ভাড়া ১০০ টাকা।"
      },
      "পুঠিয়া বাস স্ট্যান্ড": {
        distance: "১.২ কিমি",
        cngFare: "১০ টাকা (শেয়ার)",
        vanFare: "১০ টাকা (শেয়ার)",
        cngGuide: "বাসস্ট্যান্ড পর্যন্ত শেয়ার অটোরিকশা ভাড়া ১০ টাকা।",
        vanGuide: "ভ্যান অথবা ইজিবাইকে লোকাল ভাড়া ১০ টাকা।"
      },
      "ঝলমলিয়া বাজার": {
        distance: "৪.০ কিমি",
        cngFare: "১৫ টাকা (শেয়ার)",
        vanFare: "১৫ টাকা (শেয়ার)",
        cngGuide: "পুঠিয়া জিরো ইস্টার থেকে ঝলমলিয়া শেয়ার সিএনজি ১৫ টাকা।",
        vanGuide: "ইজিবাইক বা ভ্যানে শেয়ার ভাড়া ১৫ টাকা।"
      },
      "শিলমাড়িয়া": {
        distance: "১২.৫ কিমি",
        cngFare: "৪০ টাকা (শেয়ার)",
        vanFare: "৪৫ টাকা (শেয়ার)",
        cngGuide: "শিলমাড়িয়া পর্যন্ত সরাসরি সিএনজি ভাড়া ৪০ টাকা। রিজার্ভ ২৫০-৩০০ টাকা।",
        vanGuide: "ভ্যান/ইজিবাইক ভেঙ্গে ভেঙ্গে যেতে হবে, আনুমানিক লোকাল ভাড়া ৪৫ টাকা।"
      },
      "পুঠিয়া রাজবাড়ী": {
        distance: "০.৫ কিমি",
        cngFare: "৫ টাকা (শেয়ার)",
        vanFare: "৫ টাকা (শেয়ার)",
        cngGuide: "জিরো ইস্টার থেকে রাজবাড়ী হাঁটা দূরত্ব, অটোরিকশায় নূন্যতম ভাড়া ৫ টাকা।",
        vanGuide: "লোকাল ভ্যানে নূন্যতম ভাড়া ৫ টাকা।"
      }
    },
    "বানেশ্বর মোড় (হাট সংলগ্ন)": {
      "শিবপুর বাজার": {
        distance: "১৫.০ কিমি",
        cngFare: "৪৫ টাকা (শেয়ার)",
        vanFare: "৫০ টাকা (শেয়ার)",
        cngGuide: "বানেশ্বর থেকে শিবপুর সরাসরি সিএনজি শেয়ার ভাড়া ৪৫ টাকা।",
        vanGuide: "ভ্যান/ইজিবাইকে সরাসরি বা ভেঙ্গে গেলে ভাড়া ৫০ টাকা।"
      },
      "পুঠিয়া বাস স্ট্যান্ড": {
        distance: "৭.০ কিমি",
        cngFare: "১৫ টাকা (শেয়ার)",
        vanFare: "২০ টাকা (শেয়ার)",
        cngGuide: "বানেশ্বর থেকে পুঠিয়া বাসস্ট্যান্ড সিএনজি শেয়ার ভাড়া ১৫ টাকা।",
        vanGuide: "ইজিবাইক বা ভ্যানে লোকাল ভাড়া ২০ টাকা।"
      },
      "ঝলমলিয়া বাজার": {
        distance: "১২.২ কিমি",
        cngFare: "৩০-৩৫ টাকা (শেয়ার)",
        vanFare: "৩৫ টাকা (শেয়ার)",
        cngGuide: "মহাসড়ক হয়ে শেয়ার সিএনজি ভাড়া ৩০-৩৫ টাকা।",
        vanGuide: "ইজিবাইকে লোকাল ভাড়া ৩৫ টাকা।"
      },
      "শিলমাড়িয়া": {
        distance: "২০.০ কিমি",
        cngFare: "৬০ টাকা (শেয়ার)",
        vanFare: "৭০ টাকা (শেয়ার)",
        cngGuide: "দীর্ঘ দূরত্বের জন্য শেয়ার সিএনজি ভাড়া ৬০ টাকা। রিজার্ভ ৪০০ টাকা।",
        vanGuide: "ইজিবাইক বা লোকাল ভ্যানে লোকাল ভাড়া ৭০ টাকা।"
      },
      "পুঠিয়া রাজবাড়ী": {
        distance: "৮.৫ কিমি",
        cngFare: "২৫ টাকা (শেয়ার)",
        vanFare: "৩০ টাকা (শেয়ার)",
        cngGuide: "সরাসরি রাজবাড়ী ফটক পর্যন্ত শেয়ার সিএনজি ভাড়া ২৫ টাকা।",
        vanGuide: "ইজিবাইক বা ভ্যানে লোকাল ভাড়া ৩০ টাকা।"
      }
    },
    "শিবপুর বাজার": {
      "পুঠিয়া বাস স্ট্যান্ড": {
        distance: "৮.৫ কিমি",
        cngFare: "২৫ টাকা (শেয়ার)",
        vanFare: "৩০ টাকা (শেয়ার)",
        cngGuide: "শিবপুর থেকে পুঠিয়া বাসস্ট্যান্ড সিএনজি শেয়ার ভাড়া ২৫ টাকা।",
        vanGuide: "ইজিবাইক বা ভ্যানে লোকাল ভাড়া ৩০ টাকা।"
      },
      "ঝলমলিয়া বাজার": {
        distance: "১১.৫ কিমি",
        cngFare: "৩৫ টাকা (শেয়ার)",
        vanFare: "৪০ টাকা (শেয়ার)",
        cngGuide: "শিবপুর থেকে ঝলমলিয়া শেয়ার সিএনজি ভাড়া ৩৫ টাকা।",
        vanGuide: "লোকাল ভ্যান/ইজিবাইক ভাড়া ৪০ টাকা।"
      },
      "শিলমাড়িয়া": {
        distance: "৫.০ কিমি",
        cngFare: "১৫ টাকা (শেয়ার)",
        vanFare: "১৫ টাকা (শেয়ার)",
        cngGuide: "শিবপুর থেকে শিলমাড়িয়া শেয়ার সিএনজি ভাড়া ১৫ টাকা।",
        vanGuide: "লোকাল ইজিবাইক বা ভ্যানে ভাড়া ১৫ টাকা।"
      },
      "পুঠিয়া রাজবাড়ী": {
        distance: "৮.০ কিমি",
        cngFare: "২০-২৫ টাকা (শেয়ার)",
        vanFare: "২৫-৩০ টাকা (শেয়ার)",
        cngGuide: "রাজবাড়ী ফটক পর্যন্ত সিএনজি শেয়ার ভাড়া ২০-২৫ টাকা।",
        vanGuide: "ইজিবাইক বা লোকাল ভ্যানে লোকাল ভাড়া ২৫-৩০ টাকা।"
      }
    },
    "পুঠিয়া বাস স্ট্যান্ড": {
      "ঝলমলিয়া বাজার": {
        distance: "৫.২ কিমি",
        cngFare: "১৫ টাকা (শেয়ার)",
        vanFare: "১৫ টাকা (শেয়ার)",
        cngGuide: "বাসস্ট্যান্ড থেকে ঝলমলিয়া শেয়ার সিএনজি ১৫ টাকা।",
        vanGuide: "ইজিবাইক বা ভ্যানে লোকাল ভাড়া ১৫ টাকা।"
      },
      "শিলমাড়িয়া": {
        distance: "১৩.৫ কিমি",
        cngFare: "৪০ টাকা (শেয়ার)",
        vanFare: "৪৫ টাকা (শেয়ার)",
        cngGuide: "বাসস্ট্যান্ড থেকে শিলমাড়িয়া শেয়ার সিএনজি ভাড়া ৪০ টাকা।",
        vanGuide: "ভ্যান/ইজিবাইকে ভাঙ্গা ভাঙ্গা রুটে ৪৫ টাকা লোকাল ভাড়া।"
      },
      "পুঠিয়া রাজবাড়ী": {
        distance: "১.৫ কিমি",
        cngFare: "১০ টাকা (শেয়ার)",
        vanFare: "১০ টাকা (শেয়ার)",
        cngGuide: "রাজবাড়ী প্রবেশদ্বার পর্যন্ত অটোরিকশা শেয়ার ভাড়া ১০ টাকা।",
        vanGuide: "লোকাল ভ্যান অথবা ইজিবাইকে ১০ টাকা ভাড়া।"
      }
    },
    "ঝলমলিয়া বাজার": {
      "শিলমাড়িয়া": {
        distance: "১৬.৫ কিমি",
        cngFare: "৫০ টাকা (শেয়ার)",
        vanFare: "৬০ টাকা (শেয়ার)",
        cngGuide: "ঝলমলিয়া থেকে শিলমাড়িয়া শেয়ার সিএনজি ভাড়া ৫০ টাকা।",
        vanGuide: "ইজিবাইক বা লোকাল ভ্যানে ভাড়া ৬০ টাকা।"
      },
      "পুঠিয়া রাজবাড়ী": {
        distance: "৪.২ কিমি",
        cngFare: "১৫ টাকা (শেয়ার)",
        vanFare: "১৫ টাকা (শেয়ার)",
        cngGuide: "ঝলমলিয়া থেকে রাজবাড়ী শেয়ার সিএনজি ভাড়া ১৫ টাকা।",
        vanGuide: "ইজিবাইক বা লোকাল ভ্যানে ১৫ টাকা ভাড়া।"
      }
    },
    "শিলমাড়িয়া": {
      "পুঠিয়া রাজবাড়ী": {
        distance: "১৩.০ কিমি",
        cngFare: "৪০-৪৫ টাকা (শেয়ার)",
        vanFare: "৪৫-৫০ টাকা (শেয়ার)",
        cngGuide: "শিলমাড়িয়া থেকে রাজবাড়ী সরাসরি সিএনজি ভাড়া ৪০-৪৫ টাকা।",
        vanGuide: "ইজিবাইক বা লোকাল ভ্যানে লোকাল ভাড়া ৪৫-৫০ টাকা।"
      }
    }
  };

  const getRouteDetails = (src: string, dest: string, veh: string) => {
    if (src === dest) {
      return {
        distance: "০ কিমি",
        fare: "০ টাকা",
        guidebook: "উৎস এবং গন্তব্য একই স্থান! অনুগ্রহ করে ভিন্ন গন্তব্য নির্বাচন করুন।"
      };
    }

    const data = routeDatabase[src]?.[dest] || routeDatabase[dest]?.[src];
    if (data) {
      return {
        distance: data.distance,
        fare: veh === "সিএনজি অটোরিকশা" ? data.cngFare : data.vanFare,
        guidebook: veh === "সিএনজি অটোরিকশা" ? data.cngGuide : data.vanGuide
      };
    }

    return {
      distance: "অজানা",
      fare: "-",
      guidebook: "এই রুটের সঠিক তথ্য আমাদের ডেটাবেসে এখনো সংযুক্ত হয়নি।"
    };
  };

  const calculatorData = getRouteDetails(source, destination, vehicle);

  const stands = [
    {
      name: "পুঠিয়া বাসস্ট্যান্ড সিএনজি ইস্টার",
      location: "ঢাকা-রাজশাহী মহাসড়ক সংলগ্ন",
      phone: "01700000001"
    },
    {
      name: "বানেশ্বর মোড় অটোরিকশা স্ট্যান্ড",
      location: "বানেশ্বর ট্রাফিক মোড়",
      phone: "01700000002"
    },
    {
      name: "শিবপুর বাজার ইজিবাইক স্ট্যান্ড",
      location: "শিবপুর বাজার কেন্দ্র",
      phone: "01700000003"
    }
  ];

  const locationsList = [
    "পুঠিয়া সদর (জিরো ইস্টার)",
    "বানেশ্বর মোড় (হাট সংলগ্ন)",
    "শিবপুর বাজার",
    "পুঠিয়া বাস স্ট্যান্ড",
    "ঝলমলিয়া বাজার",
    "শিলমাড়িয়া",
    "পুঠিয়া রাজবাড়ী"
  ];

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div 
        className="p-6 rounded-[24px] text-white mb-6 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #064e3b, #022c22)', boxShadow: '0 4px 12px rgba(2, 44, 34, 0.15)' }}
      >
        <div className="block mb-4">
          <button 
            onClick={onGoBack} 
            className="border-none px-3.5 py-1.5 rounded-full text-white text-xs font-bold cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-1.5"
            style={{ background: 'rgba(255, 255, 255, 0.15)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
          </button>
        </div>
        <span 
          className="text-[11px] px-3 py-1 rounded-xl inline-block mb-2 font-bold tracking-wide"
          style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)' }}
        >
          🛺 স্থানীয় পরিবহন ও ভাড়া
        </span>
        <h2 className="m-0 mb-3 text-[26px] font-extrabold tracking-wide text-white">ভ্যান ও অটোরিকশা</h2>
        <div className="w-10 h-1 rounded-sm mb-3.5" style={{ background: '#34d399' }}></div>
        <p className="m-0 text-[13px] opacity-85 leading-relaxed text-justify">
          পুঠিয়া উপজেলার অভ্যন্তরীণ চলাচলের জন্য ভ্যান ও অটোরিকশার রুট, ভাড়া এবং চালকদের সাথে যোগাযোগের সম্ভাব্য তথ্য।
        </p>
      </div>

      {/* Interactive Fare Calculator */}
      <div className="bg-white border-[6px] border-[#d34b4b] rounded-xl p-5 shadow-sm mx-1">
        <div className="mb-4">
          <h3 className="text-[#205b32] text-[15px] font-extrabold">ইন্টারেক্টিভ ভাড়া ক্যালকুলেটর</h3>
          <h4 className="text-[#205b32] text-xs font-bold mt-0.5">যাতায়াত দূরত্ব ও সরকারি ভাড়া নির্ধারক</h4>
          <p className="text-gray-500 text-[10px] mt-1 font-medium leading-tight">স্থান এবং যান নির্বাচন করে মুহূর্তেই দূরত্ব ও শেয়ার ভাড়া জেনে নিন</p>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">যাত্রার স্থান (উৎস):</label>
            <div className="relative">
              <select 
                value={source || ""}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-gray-400 shadow-sm"
              >
                {locationsList.map((loc) => (
                  <option key={loc} value={loc || ""}>{loc}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">গন্তব্য স্থান:</label>
            <div className="relative">
              <select 
                value={destination || ""}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-gray-400 shadow-sm"
              >
                {locationsList.map((loc) => (
                  <option key={loc} value={loc || ""}>{loc}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">যানবাহনের ধরণ:</label>
            <div className="relative">
              <select 
                value={vehicle || ""}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-gray-400 shadow-sm"
              >
                <option value="সিএনজি অটোরিকশা">সিএনজি অটোরিকশা</option>
                <option value="ভ্যান/ইজিবাইক">ভ্যান/ইজিবাইক</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#fcfdfc] rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="mb-3 border-b border-gray-100 pb-3">
            <div className="text-[10px] font-bold text-gray-400 mb-0.5">আনুমানিক দূরত্ব</div>
            <div className="text-xl font-extrabold text-[#205b32]">{calculatorData.distance}</div>
          </div>
          <div className="mb-3 border-b border-gray-100 pb-3">
            <div className="text-[10px] font-bold text-gray-400 mb-0.5">নির্ধারিত ভাড়া (শেয়ার)</div>
            <div className="text-xl font-extrabold text-[#d34b4b]">{calculatorData.fare}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 mb-0.5">যাত্রী গাইডবুক</div>
            <p className="text-gray-600 text-[11px] leading-relaxed font-medium">{calculatorData.guidebook}</p>
          </div>
        </div>
      </div>

      {/* Interactive Map & Contacts */}
      <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 mx-1">
        <h3 className="text-gray-800 text-[15px] font-extrabold mb-1">স্ট্যান্ড লোকেশন ও যোগাযোগ</h3>
        <p className="text-gray-500 text-[11px] mb-4 leading-relaxed font-medium">নিকটবর্তী স্ট্যান্ডের অবস্থান ম্যাপে দেখুন অথবা সরাসরি কল করে রিজার্ভ করুন।</p>
        
        {/* Map Button */}
        <button 
          onClick={onNavigateToMap}
          className="w-full h-[180px] bg-emerald-50 rounded-xl mb-5 relative overflow-hidden flex items-center justify-center border border-emerald-100/50 cursor-pointer hover:bg-emerald-100/50 transition-colors"
        >
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(#34d399 1px, transparent 1px), linear-gradient(90deg, #34d399 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
          
          <MapPin className="w-8 h-8 text-emerald-500 absolute top-[30%] left-[40%] animate-bounce" />
          <MapPin className="w-6 h-6 text-emerald-400 absolute top-[60%] left-[70%]" />
          <MapPin className="w-7 h-7 text-emerald-400 absolute top-[45%] left-[20%]" />
          
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-emerald-100 text-xs font-bold text-emerald-700 z-10 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            লোকেশন ম্যাপ দেখুন
          </div>
        </button>

        {/* Contact List */}
        <div className="space-y-3">
          {stands.map((stand, idx) => (
            <div key={idx} className="bg-gray-50/80 rounded-xl p-3 flex items-center justify-between gap-3 border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100/50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-gray-800 text-[13px] font-bold">{stand.name}</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">{stand.location}</p>
                </div>
              </div>
              <a 
                href={`tel:${stand.phone}`}
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-colors"
                title="কল করুন"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FareListView({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Calculator State
  const [calcDest, setCalcDest] = React.useState('ঢাকা');
  const [calcVehicle, setCalcVehicle] = React.useState('বাস');
  const [passengers, setPassengers] = React.useState(1);

  const availableVehicles = {
    'ঢাকা': ['বাস', 'ট্রেন (শোভন)', 'ট্রেন (স্নিগ্ধা)'],
    'রাজশাহী': ['বাস'],
    'নাটোর': ['বাস'],
    'খুলনা': ['ট্রেন']
  };

  React.useEffect(() => {
    if (!availableVehicles[calcDest as keyof typeof availableVehicles].includes(calcVehicle)) {
      setCalcVehicle(availableVehicles[calcDest as keyof typeof availableVehicles][0]);
    }
  }, [calcDest]);

  const calculateTotalFare = () => {
    const rates: Record<string, { min: number, max: number }> = {
      "ঢাকা_বাস": { min: 700, max: 1500 },
      "ঢাকা_ট্রেন (শোভন)": { min: 340, max: 340 },
      "ঢাকা_ট্রেন (স্নিগ্ধা)": { min: 656, max: 656 },
      "রাজশাহী_বাস": { min: 50, max: 60 },
      "নাটোর_বাস": { min: 40, max: 50 },
      "খুলনা_ট্রেন": { min: 210, max: 210 }
    };
    
    const rate = rates[`${calcDest}_${calcVehicle}`];
    if (!rate) return "০ ৳";
    
    if (rate.min === rate.max) {
      return `${rate.min * passengers} ৳`;
    } else {
      return `${rate.min * passengers} - ${rate.max * passengers} ৳`;
    }
  };

  const filteredFareList = fareList.filter(section => {
    if (activeTab === 'all') return true;
    if (activeTab === 'bus' && section.category === "বাস ভাড়া") return true;
    if (activeTab === 'auto' && section.category === "ভ্যান ও অটোরিকশা") return true;
    if (activeTab === 'train' && section.category === "ট্রেন ভাড়া") return true;
    return false;
  }).map(section => {
    const filteredRoutes = section.routes.filter(route => 
      route.from.toLowerCase().includes(searchQuery.toLowerCase()) || 
      route.to.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...section,
      routes: filteredRoutes.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to))
    };
  }).filter(section => section.routes.length > 0);

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div 
        className="p-6 rounded-[24px] text-white mb-6 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #064e3b, #022c22)', boxShadow: '0 4px 12px rgba(2, 44, 34, 0.15)' }}
      >
        <div className="block mb-4">
          <button 
            onClick={onGoBack} 
            className="border-none px-3.5 py-1.5 rounded-full text-white text-xs font-bold cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-1.5"
            style={{ background: 'rgba(255, 255, 255, 0.15)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
          </button>
        </div>
        <span 
          className="text-[11px] px-3 py-1 rounded-xl inline-block mb-2 font-bold tracking-wide"
          style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)' }}
        >
          💰 পুঠিয়া যাতায়াত ও পরিবহন খরচ
        </span>
        <h2 className="m-0 mb-3 text-[26px] font-extrabold tracking-wide text-white">ভাড়া তালিকা</h2>
        <div className="w-10 h-1 rounded-sm mb-3.5" style={{ background: '#34d399' }}></div>
        <p className="m-0 text-[13px] opacity-85 leading-relaxed text-justify">
          পুঠিয়া উপজেলা থেকে বিভিন্ন রুটে চলাচলকারী ভ্যান, অটোরিকশা, বাস এবং দূরপাল্লার ট্রেনের সরকার নির্ধারিত ও বর্তমান লোকাল ভাড়ার সঠিক তালিকা।
        </p>
      </div>

      {/* 🎛️ ৪টি ভাড়ার ক্যাটাগরি বাটন (No-Scroll) */}
      <div className="flex gap-[6px] w-full box-border py-[2px] mb-6">
        <div 
          onClick={() => setActiveTab('all')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'all' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'all' ? '#055943' : '#1e293b', 
            border: activeTab === 'all' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'all' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">💵</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">সব ভাড়া</div>
        </div>
        
        <div 
          onClick={() => setActiveTab('bus')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'bus' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'bus' ? '#055943' : '#1e293b', 
            border: activeTab === 'bus' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'bus' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">🚌</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">বাস ভাড়া</div>
        </div>
        
        <div 
          onClick={() => setActiveTab('auto')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'auto' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'auto' ? '#055943' : '#1e293b', 
            border: activeTab === 'auto' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'auto' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">🛺</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">ভ্যান-অটো</div>
        </div>
        
        <div 
          onClick={() => setActiveTab('train')} 
          className="flex-1 min-w-0 py-[14px] px-[2px] rounded-[18px] text-center cursor-pointer transition-all duration-200 ease-in-out"
          style={{ 
            background: activeTab === 'train' ? '#e6f4f1' : '#ffffff', 
            color: activeTab === 'train' ? '#055943' : '#1e293b', 
            border: activeTab === 'train' ? '1.5px solid #a3e635' : '1px solid #e2e8f0',
            boxShadow: activeTab === 'train' ? '0 4px 6px -1px rgba(0,0,0,0.02)' : 'none'
          }}
        >
          <div className="text-[20px] mb-1">🚆</div>
          <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-snug">ট্রেন ভাড়া</div>
        </div>
      </div>
      
      {/* 🔍 রুট সার্চ (Route Search) */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="গন্তব্য বা শুরুর স্থান খুঁজুন..."
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow shadow-sm"
        />
      </div>

      {/* 🧮 Fare Calculator */}
      <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-lg">🧮</span>
            </div>
            <h3 className="text-sm font-bold text-emerald-900 leading-tight">ভাড়া ক্যালকুলেটর</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">গন্তব্য</label>
              <select 
                value={calcDest || ""}
                onChange={(e) => setCalcDest(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 appearance-none"
              >
                <option value="ঢাকা">ঢাকা</option>
                <option value="রাজশাহী">রাজশাহী (লোকাল)</option>
                <option value="নাটোর">নাটোর (লোকাল)</option>
                <option value="খুলনা">খুলনা</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">বাহন</label>
              <select 
                value={calcVehicle || ""}
                onChange={(e) => setCalcVehicle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 appearance-none"
              >
                {availableVehicles[calcDest as keyof typeof availableVehicles].map(v => (
                  <option key={v} value={v || ""}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
            <span className="text-xs font-bold text-gray-600">যাত্রী সংখ্যা:</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center font-bold hover:bg-gray-100"
              >-</button>
              <span className="text-sm font-black w-4 text-center">{passengers}</span>
              <button 
                onClick={() => setPassengers(Math.min(10, passengers + 1))}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center font-bold hover:bg-gray-100"
              >+</button>
            </div>
          </div>

          <div className="bg-emerald-500 p-4 rounded-xl flex items-center justify-between text-white shadow-md shadow-emerald-500/20">
            <div>
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest block mb-0.5">মোট সম্ভাব্য খরচ</span>
              <div className="text-xs font-medium opacity-90">{calcDest} • {calcVehicle} ({passengers} জন)</div>
            </div>
            <div className="text-lg font-black tracking-tight">{calculateTotalFare()}</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredFareList.length > 0 ? (
          filteredFareList.map((section, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
                <div className={`w-10 h-10 rounded-full ${section.bgIcon} flex items-center justify-center`}>
                  <section.icon className={`w-5 h-5 ${section.textIcon}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{section.category}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.routes.map((route, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-bold text-gray-700">{route.from} ➔ {route.to}</p>
                    </div>
                    <span className={`inline-block px-3 py-1 ${section.bgBadge} ${section.textBadge} text-xs font-bold rounded-lg whitespace-nowrap`}>
                      {route.fare}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm">কোনো ভাড়া পাওয়া যায়নি</p>
          </div>
        )}
        
        <p className="text-xs text-center text-gray-400 mt-4">* ভাড়ার পরিমাণ যেকোনো সময় পরিবর্তিত হতে পারে।</p>
      </div>
    </div>
  );
}
