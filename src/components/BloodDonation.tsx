import { Search, Phone, Droplet, MapPin, ChevronLeft, Filter } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  area: string;
  lastDonation: string;
  phone: string;
  isAvailable: boolean;
}

const MOCK_DONORS: Donor[] = [
  { id: '1', name: 'মোঃ রহিম উদ্দিন', bloodGroup: 'A+', area: 'পুঠিয়া সদর', lastDonation: '৩ মাস আগে', phone: '01700000000', isAvailable: true },
  { id: '2', name: 'আব্দুর রহমান', bloodGroup: 'B+', area: 'বানেশ্বর', lastDonation: '৬ মাস আগে', phone: '01800000000', isAvailable: true },
  { id: '3', name: 'সুমন আহমেদ', bloodGroup: 'O-', area: 'জিউপাড়া', lastDonation: '১ মাস আগে', phone: '01900000000', isAvailable: false },
  { id: '4', name: 'জসিম উদ্দিন', bloodGroup: 'AB+', area: 'বেলপুকুর', lastDonation: '২ মাস আগে', phone: '01600000000', isAvailable: true },
  { id: '5', name: 'মেহেদী হাসান', bloodGroup: 'O+', area: 'শিলমাড়িয়া', lastDonation: '৫ মাস আগে', phone: '01500000000', isAvailable: true },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

interface Props {
  onBack: () => void;
}

export default function BloodDonation({ onBack }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDonors = MOCK_DONORS.filter(donor => {
    const matchesGroup = !selectedGroup || donor.bloodGroup === selectedGroup;
    const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         donor.area.includes(searchQuery);
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-['Hind_Siliguri']">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            <ChevronLeft size={20} />
            <span>ফিরে যান</span>
          </button>
          <h1 className="text-lg font-bold text-slate-800">রক্তদাতার তালিকা</h1>
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <Droplet size={20} fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="নাম বা এলাকা দিয়ে খুঁজুন..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Blood Groups */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
              <Filter size={16} />
              <span>ব্লাড গ্রুপ ফিল্টার</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {BLOOD_GROUPS.map(group => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(selectedGroup === group ? null : group)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedGroup === group 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-red-200'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Donor List */}
      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-4">
        {filteredDonors.length > 0 ? (
          filteredDonors.map((donor, index) => (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex flex-col items-center justify-center text-red-600 border border-red-100">
                  <span className="text-xl font-bold leading-none">{donor.bloodGroup}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{donor.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {donor.area}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>শেষ দান: {donor.lastDonation}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      donor.isAvailable 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {donor.isAvailable ? 'অ্যাভেলেবল' : 'অপেক্ষা করুন'}
                    </span>
                  </div>
                </div>
              </div>

              <a 
                href={`tel:${donor.phone}`}
                className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Phone size={20} fill="currentColor" />
              </a>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-slate-800 font-bold">কোনো দাতা পাওয়া যায়নি</h3>
            <p className="text-slate-400 text-sm mt-1">অনুগ্রহ করে অন্য গ্রুপ বা নাম দিয়ে চেষ্টা করুন</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button className="flex items-center gap-2 bg-red-600 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95">
          <Droplet size={20} fill="currentColor" />
          <span>দাতা হিসেবে নাম লিখুন</span>
        </button>
      </div>
    </div>
  );
}
