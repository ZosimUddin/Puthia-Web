import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { School, MapPin, Phone, Plus, Loader2, GraduationCap, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function EducationalInstitutions({ defaultCategory = '' }: { defaultCategory?: string }) {
  const { user, addStars } = useAuth();
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [village, setVillage] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [eiinCode, setEiinCode] = useState('');
  const [establishmentYear, setEstablishmentYear] = useState('');
  const [headmaster, setHeadmaster] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  const fetchInstitutions = async () => {
    try {
      const q = query(collection(db, 'educational_institutions'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInstitutions(data);
    } catch (err) {
      console.error("Error fetching institutions:", err);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    
    try {
        await addDoc(collection(db, 'educational_institutions'), {
            name: name.trim(), 
            category: category || defaultCategory, 
            village: village.trim(), 
            fullAddress: fullAddress.trim(), 
            eiinCode: eiinCode.trim(), 
            establishmentYear: establishmentYear.trim(), 
            headmaster: headmaster.trim(), 
            contact: contact.trim(),
            createdAt: serverTimestamp()
        });
        
        // Award 20 Civic Points if logged in!
        if (user && addStars) {
          await addStars(20);
          setSuccessMsg('প্রতিষ্ঠানটি সফলভাবে যুক্ত হয়েছে এবং আপনার অ্যাকাউন্টে ২০ সিভিক ইস্টার যোগ হয়েছে! 🎉');
        } else {
          setSuccessMsg('প্রতিষ্ঠানটি সফলভাবে যুক্ত হয়েছে! অনুগ্রহ করে অনুমোদনের জন্য অপেক্ষা করুন।');
        }

        setName(''); 
        setVillage(''); 
        setFullAddress(''); 
        setEiinCode(''); 
        setEstablishmentYear(''); 
        setHeadmaster(''); 
        setContact('');
        if (!defaultCategory) setCategory('');
        
        // Re-fetch
        fetchInstitutions();
    } catch (err) {
        console.error(err);
        alert('যোগ করার সময় কোনো ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
        setLoading(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'school': return 'স্কুল';
      case 'college': return 'কলেজ';
      case 'madrasa': return 'মাদ্রাসা';
      case 'technical': return 'কারিগরি শিক্ষা';
      case 'kindergarten': return 'কিন্ডারগার্টেন';
      case 'coaching': return 'কোচিং সেন্টার';
      case 'library': return 'লাইব্রেরি';
      default: return cat;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 rounded-[28px] text-white shadow-md shadow-emerald-950/[0.04]">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-6 h-6 text-emerald-300" />
          <h3 className="font-black text-xl text-white leading-tight">শিক্ষা প্রতিষ্ঠান ডিরেক্টরি</h3>
        </div>
        <p className="text-xs text-emerald-100 leading-relaxed max-w-xl">
          পুঠিয়া উপজেলার সকল স্কুল, কলেজ, মাদ্রাসা ও শিক্ষা প্রতিষ্ঠানের তথ্য তালিকাভুক্ত করুন। নতুন প্রতিষ্ঠান যুক্ত করে উপজেলার সাধারণ নাগরিকদের সঠিক তথ্য প্রাপ্তিতে সাহায্য করুন এবং ২০ ইস্টার অর্জন করুন!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Entry Form Column */}
        <div className="lg:col-span-6">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] shadow-md border border-emerald-600/10 dark:border-zinc-800/80 space-y-4">
            <h4 className="font-black text-base text-gray-800 dark:text-white pb-2 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
              🏫 নতুন প্রতিষ্ঠান সংযুক্তি
            </h4>

            {successMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-800/20 animate-fade-in flex items-start gap-1.5">
                <span>✨</span>
                <p>{successMsg}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">প্রতিষ্ঠানের নাম <span className="text-red-500">*</span></label>
              <input 
                value={name || ""} 
                onChange={e => setName(e.target.value)} 
                placeholder="যেমন: বানেশ্বর সরকারি কলেজ" 
                className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-semibold shadow-xs" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!defaultCategory && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">ক্যাটাগরি <span className="text-red-500">*</span></label>
                  <select 
                    value={category || ""} 
                    onChange={e => setCategory(e.target.value)} 
                    className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-semibold shadow-xs" 
                    required
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="school">স্কুল</option>
                    <option value="college">কলেজ</option>
                    <option value="madrasa">মাদ্রাসা</option>
                    <option value="technical">কারিগরি শিক্ষা</option>
                    <option value="kindergarten">কিন্ডারগার্টেন</option>
                    <option value="coaching">কোচিং সেন্টার</option>
                    <option value="library">লাইব্রেরি</option>
                  </select>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">গ্রাম/এলাকা <span className="text-red-500">*</span></label>
                <input 
                  value={village || ""} 
                  onChange={e => setVillage(e.target.value)} 
                  placeholder="যেমন: বানেশ্বর" 
                  className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-semibold shadow-xs" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span></label>
              <input 
                value={fullAddress || ""} 
                onChange={e => setFullAddress(e.target.value)} 
                placeholder="যেমন: রাজশাহী-নাটোর মহাসড়ক, বানেশ্বর, পুঠিয়া" 
                className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-semibold shadow-xs" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">EIIN কোড (ঐচ্ছিক)</label>
                <input 
                  value={eiinCode || ""} 
                  onChange={e => setEiinCode(e.target.value)} 
                  placeholder="যেমন: ১২৩৪৫৬" 
                  className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-semibold shadow-xs" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">প্রতিষ্ঠাকাল (ঐচ্ছিক)</label>
                <input 
                  value={establishmentYear || ""} 
                  onChange={e => setEstablishmentYear(e.target.value)} 
                  placeholder="যেমন: ১৯৭২" 
                  className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-semibold shadow-xs" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">প্রধানের নাম (প্রধান শিক্ষক/অধ্যক্ষ)</label>
                <input 
                  value={headmaster || ""} 
                  onChange={e => setHeadmaster(e.target.value)} 
                  placeholder="যেমন: ড. মো: রফিকুল ইসলাম" 
                  className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-semibold shadow-xs" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">যোগাযোগ নম্বর <span className="text-red-500">*</span></label>
                <input 
                  value={contact || ""} 
                  onChange={e => setContact(e.target.value)} 
                  placeholder="যেমন: ০১৭১২৩৪৫৬৭৮" 
                  className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-semibold shadow-xs" 
                  required 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 p-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-bold transition shadow-md cursor-pointer border-none text-sm">
              {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <Plus className="w-5 h-5" />} ডিরেক্টরিতে যুক্ত করুন (+২০ ইস্টার)
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 p-6 rounded-[28px] shadow-md border border-emerald-600/10 dark:border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
            <h4 className="font-black text-base text-gray-800 dark:text-white flex items-center gap-2">
              📋 তালিকাভুক্ত শিক্ষা প্রতিষ্ঠান
            </h4>
            <span className="text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/20">
              মোট: {institutions.length} টি
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
            {institutions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-neutral-50 dark:bg-zinc-800/20 rounded-2xl border border-neutral-100/80 dark:border-zinc-800/40">
                <School className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-500">বর্তমানে কোনো প্রতিষ্ঠান তালিকাভুক্ত নেই।</p>
                <p className="text-[10px] text-gray-400 max-w-[200px] mx-auto mt-1 leading-relaxed">প্রথম প্রতিষ্ঠান যুক্ত করে অবদান শুরু করুন!</p>
              </div>
            ) : (
              institutions.map(inst => (
                <div key={inst.id} className="bg-neutral-50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-neutral-100/80 dark:border-zinc-800/50 flex items-start gap-4 hover:border-emerald-500/20 dark:hover:border-emerald-500/10 transition-all duration-300 hover:shadow-sm group">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                    <School className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold">
                        {getCategoryLabel(inst.category)}
                      </span>
                      {inst.establishmentYear && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold flex items-center gap-1">
                          <Award className="w-3 h-3" /> স্থাপিত: {inst.establishmentYear}
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-gray-900 dark:text-white mt-2 text-base leading-tight">{inst.name}</h4>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>{inst.fullAddress}</span>
                    </p>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-start gap-1 font-medium">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>যোগাযোগ: {inst.contact}</span>
                    </p>

                    {inst.headmaster && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-2 pt-2 border-t border-gray-100/50 dark:border-zinc-800/50">
                        👨‍🏫 প্রধান শিক্ষক/অধ্যক্ষ: <span className="font-black">{inst.headmaster}</span>
                      </p>
                    )}

                    {inst.eiinCode && (
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">
                        EIIN: {inst.eiinCode}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
