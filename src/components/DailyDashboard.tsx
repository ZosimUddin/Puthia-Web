import { Cloud, Sun, Calendar, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes';

const BAZAR_PRICES = [
  { item: 'চাল (নাজিরশাইল)', price: '৭৫', unit: 'কেজি' },
  { item: 'সয়াবিন তেল', price: '১৬৫', unit: 'লিটার' },
  { item: 'পেঁয়াজ (দেশি)', price: '৮০', unit: 'কেজি' },
  { item: 'ব্রয়লার মুরগি', price: '১৯০', unit: 'কেজি' },
];

interface DailyDashboardProps {
  weather?: string;
  prayerTime?: string;
  news?: string;
  notice?: string;
  marketPrice?: string;
}

export default function DailyDashboard({ 
  weather, 
  prayerTime, 
  news, 
  notice, 
  marketPrice 
}: DailyDashboardProps) {
  const defaultPrayer = usePrayerTimes();
  const nextPrayer = prayerTime || defaultPrayer;
  
  // Get current Bengali date
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const englishDate = today.toLocaleDateString('bn-BD', options);
  
  const bazarData = marketPrice ? [{ item: 'আজকের দর', price: marketPrice, unit: '' }] : BAZAR_PRICES;

  return (
    <div className="px-0 py-2">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-700 to-[#125836] p-5 text-white">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-green-200" />
              <span className="text-xs font-bold">{englishDate}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10">
              পুঠিয়া উপজেলা পোর্টাল
            </div>
          </div>
          <h2 className="text-2xl font-black">আজকের পুঠিয়া</h2>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weather Mini Card */}
          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-blue-100">
              <Sun className="text-orange-500" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">আবহাওয়া</p>
              <h3 className="text-base font-black text-gray-800">{weather || "৩২°C, রোদ"}</h3>
            </div>
          </div>

          {/* Prayer Time Mini Card */}
          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-100">
              <Clock className="text-indigo-600" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">নামাজের সময়</p>
              <h3 className="text-base font-black text-gray-800">{nextPrayer}</h3>
            </div>
          </div>

          {/* Notice Mini Card */}
          <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100/50 flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-red-100">
              <ShoppingBag className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">বাজারদর / নোটিশ</p>
              <h3 className="text-base font-black text-gray-800 truncate">{marketPrice || notice || "স্বাভাবিক"}</h3>
            </div>
          </div>
        </div>

        {/* News Marquee */}
        {news && (
          <div className="px-4 pb-4">
            <div className="bg-orange-50 rounded-2xl p-3 border border-orange-100 flex items-center gap-3">
              <div className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded flex-shrink-0 animate-pulse">
                সংবাদ
              </div>
              <p className="text-xs font-bold text-orange-900 truncate">
                {news}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

