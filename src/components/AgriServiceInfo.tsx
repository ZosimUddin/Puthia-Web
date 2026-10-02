import React, { useState } from 'react';
import { Banknote, Bug, Tractor, Store, Calendar, MapPin, Phone, Info } from 'lucide-react';

interface AgriServiceInfoProps {
  onGoBack: () => void;
  category: string;
}

const categoryLabels: Record<string, string> = {
  agri_loans: "কৃষি ঋণ ও প্রণোদনা",
  agri_diseases: "রোগবালাই পরামর্শ",
  agri_machinery: "কৃষি যন্ত্রপাতি",
  agri_dealers: "সার ও বীজের ডিলার",
  agri_calendar: "ফসল ক্যালেন্ডার"
};

const categoryIcons: Record<string, any> = {
  agri_loans: Banknote,
  agri_diseases: Bug,
  agri_machinery: Tractor,
  agri_dealers: Store,
  agri_calendar: Calendar
};

export const AgriServiceInfo = ({ onGoBack, category }: AgriServiceInfoProps) => {
  const [activeFilter, setActiveFilter] = useState("all");

  const Icon = categoryIcons[category] || Info;
  const label = categoryLabels[category] || "কৃষি তথ্য";

  const getCategoryData = () => {
    switch (category) {
      case "agri_loans":
        return [
          {
            id: 1, name: "উপজেলা কৃষি অফিস (ঋণ শাখা)", type: "সরকারি কৃষি ঋণ", location: "পুঠিয়া সদর", area: "sadar", owner: "কৃষি সম্প্রসারণ অধিদপ্তর",
            desc: "৪% সুদে কৃষকদের জন্য বিশেষ ঋণ এবং সার-বীজের প্রণোদনা প্রদান করা হয়।", phone: "01700-000000"
          },
          {
            id: 2, name: "রাজশাহী কৃষি উন্নয়ন ব্যাংক", type: "ব্যাংক ঋণ", location: "বানেশ্বর বাজার শাখা", area: "baneswar", owner: "ম্যানেজার, রাকাব",
            desc: "সহজ শর্তে কৃষি যন্ত্রপাতি ও ফসল চাষের জন্য ঋণ প্রদান।", phone: "01700-000001"
          }
        ];
      case "agri_diseases":
        return [
          {
            id: 1, name: "উপজেলা উদ্ভিদ সংরক্ষণ অফিস", type: "পরামর্শ কেন্দ্র", location: "পুঠিয়া সদর", area: "sadar", owner: "উদ্ভিদ সংরক্ষণ কর্মকর্তা",
            desc: "ফসলের পোকা মাকড় ও রোগবালাই দমনে সরাসরি বিশেষজ্ঞ পরামর্শ দেওয়া হয়।", phone: "01700-000002"
          },
          {
            id: 2, name: "ডিজিটাল কৃষি তথ্য কেন্দ্র", type: "অনলাইন সেবা", location: "অনলাইন", area: "online", owner: "কৃষি তথ্য সার্ভিস",
            desc: "ছবি পাঠিয়ে ফসলের রোগের সমাধান ও ঔষধের নাম জেনে নিন।", phone: "16123"
          }
        ];
      case "agri_machinery":
        return [
          {
            id: 1, name: "ভাই ভাই এগ্রো মেশিনারিজ", type: "ভাড়া ও বিক্রয়", location: "পুঠিয়া বাস স্ট্যান্ড", area: "sadar", owner: "মোঃ আব্দুল করিম",
            desc: "পাওয়ার টিলার, হারভেস্টার এবং সেচ পাম্প ভাড়া ও বিক্রয় করা হয়।", phone: "01700-000003"
          },
          {
            id: 2, name: "বানেশ্বর কৃষি মেকানিকস", type: "সার্ভিসিং", location: "বানেশ্বর বাজার", area: "baneswar", owner: "মোঃ রহিম মেকানিক",
            desc: "সকল প্রকার কৃষি যন্ত্রপাতি মেরামত ও খুচরা যন্ত্রাংশ পাওয়া যায়।", phone: "01700-000004"
          }
        ];
      case "agri_dealers":
        return [
          {
            id: 1, name: "মেসার্স পুঠিয়া সিড স্টোর", type: "বিসিআইসি ডিলার", location: "পুঠিয়া বাজার", area: "sadar", owner: "আলহাজ্ব মোস্তফা",
            desc: "সরকারি রেটে ইউরিয়া, টিএসপি, পটাশ সার ও উন্নত জাতের বীজ পাওয়া যায়।", phone: "01700-000005"
          },
          {
            id: 2, name: "বানেশ্বর সার ঘর", type: "খুচরা ও পাইকারি", location: "বানেশ্বর মোড়", area: "baneswar", owner: "মোঃ জয়নাল আবেদীন",
            desc: "সকল প্রকার কীটনাশক ও অনুমোদিত হাইব্রিড বীজ বিক্রয় কেন্দ্র।", phone: "01700-000006"
          }
        ];
      case "agri_calendar":
        return [
          {
            id: 1, name: "রবি মৌসুমের ফসল", type: "ফসল গাইড", location: "উপজেলা কৃষি অফিস", area: "sadar", owner: "কৃষি সম্প্রসারণ অধিদপ্তর",
            desc: "গম, ভুট্টা, আলু ও শীতকালীন সবজি চাষের উপযুক্ত সময় ও নির্দেশিকা।", phone: "01700-000007"
          },
          {
            id: 2, name: "খরিফ মৌসুমের ফসল", type: "ফসল গাইড", location: "অনলাইন সেবা", area: "online", owner: "কৃষি বাতায়ন",
            desc: "আউশ, আমন ধান ও গ্রীষ্মকালীন সবজির বিস্তারিত ক্যালেন্ডার।", phone: "16123"
          }
        ];
      default:
        return [
          {
            id: 1, name: `পুঠিয়া ${label.split(' ')[0]} কেন্দ্র`, type: label, location: "উপজেলা কৃষি অফিস", area: "sadar", owner: "অফিসার",
            desc: `এখানে ${label} সংক্রান্ত সকল সেবা দেওয়া হয়।`, phone: "01700-000000"
          }
        ];
    }
  };

  const dummyData = getCategoryData();

  const filteredData = dummyData.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'sadar') return item.area === 'sadar';
    if (activeFilter === 'baneswar') return item.area === 'baneswar';
    if (activeFilter === 'online') return true; // Just for demo
    return true;
  });

  return (
    <div className="font-sans space-y-6 pb-6 text-left animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 to-emerald-700 p-6 rounded-3xl text-white shadow-lg">
        {onGoBack && (
          <button 
            onClick={onGoBack} 
            className="mb-4 bg-white/20 hover:bg-white/30 border-none px-4 py-1.5 rounded-full text-white text-xs font-bold cursor-pointer transition-colors"
          >
            ← ফিরে যান
          </button>
        )}
        <span className="text-xs opacity-80 block mb-1">কৃষি তথ্য ও সেবা</span>
        <h2 className="m-0 text-2xl font-extrabold flex items-center gap-2">
           <Icon className="w-6 h-6" /> {label}
        </h2>
        <div className="w-10 h-1 bg-white rounded-full mt-3 mb-4"></div>
        <p className="m-0 text-sm opacity-90 leading-relaxed text-justify">
          পুঠিয়া উপজেলার কৃষকদের জন্য {label} এর বিস্তারিত তথ্য ও যোগাযোগ নম্বর।
        </p>
      </div>

      <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 0", marginBottom: "20px" }}>
        
        {/* গ্রিড ১: সব */}
        <div 
          onClick={() => setActiveFilter('all')} 
          style={{ flex: 1, minWidth: 0, background: activeFilter === 'all' ? "#e6f4f1" : "#ffffff", color: activeFilter === 'all' ? "#055943" : "#1e293b", border: activeFilter === 'all' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
        >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🌾</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>সব তথ্য</div>
        </div>
        
        {/* গ্রিড ২: পুঠিয়া সদর */}
        <div 
          onClick={() => setActiveFilter('sadar')} 
          style={{ flex: 1, minWidth: 0, background: activeFilter === 'sadar' ? "#e6f4f1" : "#ffffff", color: activeFilter === 'sadar' ? "#055943" : "#1e293b", border: activeFilter === 'sadar' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
        >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>📍</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>পুঠিয়া সদর</div>
        </div>
        
        {/* গ্রিড ৩: বানেশ্বর */}
        <div 
          onClick={() => setActiveFilter('baneswar')} 
          style={{ flex: 1, minWidth: 0, background: activeFilter === 'baneswar' ? "#e6f4f1" : "#ffffff", color: activeFilter === 'baneswar' ? "#055943" : "#1e293b", border: activeFilter === 'baneswar' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
        >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🏢</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>বানেশ্বর</div>
        </div>
        
        {/* গ্রিড ৪: অনলাইন সেবা */}
        <div 
          onClick={() => setActiveFilter('online')} 
          style={{ flex: 1, minWidth: 0, background: activeFilter === 'online' ? "#e6f4f1" : "#ffffff", color: activeFilter === 'online' ? "#055943" : "#1e293b", border: activeFilter === 'online' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
        >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🌐</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>অনলাইন সেবা</div>
        </div>

      </div>

      <div className="flex flex-col gap-4 px-1">
        {filteredData.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 text-green-600 p-3 rounded-full">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="m-0 text-base text-slate-800 font-extrabold">{item.name}</h4>
                <span className="text-green-600 text-xs font-bold">{item.type}</span>
              </div>
            </div>
            
            <div className="text-sm text-slate-600 flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <span><b>দায়িত্বপ্রাপ্ত:</b> {item.owner}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span><b>লোকেশন:</b> {item.location}</span>
              </div>
              <div className="text-slate-500 italic mt-1">"{item.desc}"</div>
            </div>
            
            <a 
              href={`tel:+88${item.phone}`} 
              className="mt-2 bg-green-50 hover:bg-green-100 text-green-700 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-colors"
            >
              <Phone className="w-4 h-4" /> কল করুন
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
