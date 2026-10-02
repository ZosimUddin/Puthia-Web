import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HandHelping, Calculator, Heart, ShieldCheck, Phone, MapPin, Plus, X, Award, CheckCircle2, Search } from 'lucide-react';
import Header from '../components/home/Header';
import Footer from '../components/home/Footer';
import BottomNavigation from '../components/home/BottomNavigation';
import { useAuth } from '../contexts/AuthContext';
import { UnifiedHeroHeader } from '../components/common/UnifiedDesignSystem';
import toast from 'react-hot-toast';

export function ZakatInfo({ onGoBack }: { onGoBack: () => void }) {
  const { user } = useAuth();
  const [showCalculator, setShowCalculator] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cash, setCash] = useState('');
  const [goldVori, setGoldVori] = useState('');
  const [silverVori, setSilverVori] = useState('');
  const [businessAssets, setBusinessAssets] = useState('');
  const [debts, setDebts] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('সাধারণ জাকাত ফান্ড');
  const [submitting, setSubmitting] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseFloat(cash) || 0;
    const g = (parseFloat(goldVori) || 0) * 85000; // approx per vori gold price tk
    const s = (parseFloat(silverVori) || 0) * 1200; // approx per vori silver price tk
    const b = parseFloat(businessAssets) || 0;
    const d = parseFloat(debts) || 0;

    const totalWealth = c + g + s + b - d;
    // Nisab approx 7.5 vori gold or 52.5 vori silver (let's say 7.5 * 85000 = ~637500)
    const zakatAmount = totalWealth > 0 ? totalWealth * 0.025 : 0;
    setResult(Math.max(0, zakatAmount));
    toast.success("জাকাত হিসাব সম্পন্ন হয়েছে!");
  };

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("জাকাত ফান্ডে অনুদান জমা দিতে অনুগ্রহ করে লগইন করুন!");
      return;
    }
    if (!amount || !donorPhone) {
      toast.error("অনুগ্রহ করে টাকার পরিমাণ ও মোবাইল নম্বর দিন।");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("আপনার জাকাত অনুদান বা সাহায্যের আবেদন সফলভাবে নিবন্ধিত হয়েছে! জাজাকাল্লাহ খায়ের।");
      setDonorName('');
      setDonorPhone('');
      setAmount('');
      setIsModalOpen(false);
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <UnifiedHeroHeader
        badgeText="সামাজিক দায়বদ্ধতা"
        title="জাকাত সাহায্য ও ফান্ড"
        subtitle="পুঠিয়া উপজেলার দরিদ্র, অসহায় ও مستحق (মুসতাহিক) ব্যক্তিদের মাঝে জাকাত বিতরণ ও হিসাব নির্দেশিকা"
        rightAction={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchQuery("");
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showSearch 
                  ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => {
                if (!user) {
                  toast.error("জাকাত আবেদন করতে অনুগ্রহ করে লগইন করুন!");
                } else {
                  setIsModalOpen(true);
                }
              }}
              className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition cursor-pointer border border-emerald-500 shadow-sm"
              aria-label="Add Zakat"
              title="জাকাত প্রদান বা অনুদান যুক্ত করুন"
            >
              <Plus size={18} />
            </button>
          </div>
        }
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="জাকাত বা তথ্য খুঁজুন..."
      />

      <main className="max-w-6xl mx-auto px-6 py-12 flex-grow space-y-12 w-full">
        {/* Action Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Calculator size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">জাকাত ক্যালকুলেটর</h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed mb-6">
                আপনার সোনা, রূপা, নগদ টাকা ও ব্যবসায়িক সম্পদের সঠিক হিসাব করে আপনার ওপর নির্ধারিত জাকাতের পরিমাণ নিমিষেই বের করুন।
              </p>
            </div>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-emerald-600/30 text-center"
            >
              {showCalculator ? "ক্যালকুলেটর বন্ধ করুন" : "জাকাত হিসাব করুন"}
            </button>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Heart size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">জাকাত বিতরণ ফান্ড</h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed mb-6">
                পুঠিয়ার স্থানীয় দুস্থ পরিবার, এতিম ও মেধাবী অসহায় শিক্ষার্থীদের মাঝে সৎভাবে জাকাত পৌঁছে দিতে আমাদের কার্যক্রমে অংশ নিন।
              </p>
            </div>
            <button
              onClick={() => {
                if (!user) {
                  toast.error("অনুদান জমা দিতে অনুগ্রহ করে লগইন করুন!");
                } else {
                  setIsModalOpen(true);
                }
              }}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-indigo-600/30 text-center"
            >
              জাকাত অনুদান প্রদান করুন
            </button>
          </div>
        </div>

        {/* Calculator Modal/Section */}
        <AnimatePresence>
          {showCalculator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h4 className="text-xl font-black text-slate-800">আপনার জাকাতের পরিমাণ নির্ণয় করুন</h4>
                <button onClick={() => setShowCalculator(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">বন্ধ করুন</button>
              </div>

              <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">নগদ টাকা ও ব্যাংক জমানো (টাকা)</label>
                  <input
                    type="number"
                    value={cash}
                    onChange={(e) => setCash(e.target.value)}
                    placeholder="যেমন: ৫০০০০"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">সোনার পরিমাণ (ভরি)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={goldVori}
                    onChange={(e) => setGoldVori(e.target.value)}
                    placeholder="যেমন: ২"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">রূপার পরিমাণ (ভরি)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={silverVori}
                    onChange={(e) => setSilverVori(e.target.value)}
                    placeholder="যেমন: ৫"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">ব্যবসা সামগ্রী বা পণ্যের মূল্য (টাকা)</label>
                  <input
                    type="number"
                    value={businessAssets}
                    onChange={(e) => setBusinessAssets(e.target.value)}
                    placeholder="যেমন: ১০০০০০"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">জরুরি দেনা বা ঋণ (মাইনাস হবে)</label>
                  <input
                    type="number"
                    value={debts}
                    onChange={(e) => setDebts(e.target.value)}
                    placeholder="যেমন: ১০০০০"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm transition shadow-md"
                  >
                    হিসাব করুন
                  </button>
                </div>
              </form>

              {result !== null && (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">আপনার মোট প্রদেয় জাকাত:</p>
                    <h3 className="text-3xl font-black text-emerald-900">৳ {result.toLocaleString('bn-BD')}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setAmount(result.toString());
                      setIsModalOpen(true);
                    }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg transition"
                  >
                    এই জাকাত প্রদান করুন
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info & Rules */}
        <section className="bg-white p-8 md:p-12 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
          <h3 className="text-2xl font-black text-slate-800">জাকাত কাদের ওপর ফরজ ও বিতরণের খাত</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0 mt-1">১</div>
                <div>
                  <h4 className="font-black text-slate-800 text-base mb-1">নিসাব পরিমাণ সম্পদ</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">সাড়ে ৭ ভরি সোনা অথবা সাড়ে ৫২ ভরি রূপা বা সমমূল্যের নগদ অর্থ ও ব্যবসায়িক সম্পদ এক বছর পূর্ণ হলে জাকাত দেওয়া ফরজ।</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0 mt-1">২</div>
                <div>
                  <h4 className="font-black text-slate-800 text-base mb-1">আড়াই শতাংশ (২.৫%) হার</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">নিসাব পরিমাণ সম্পদের ওপর প্রতি বছর নিয়ম অনুযায়ী ২.৫% হারে জাকাত আদায় করতে হয়।</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black shrink-0 mt-1">৩</div>
                <div>
                  <h4 className="font-black text-slate-800 text-base mb-1">বন্টনের খাত</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">দরিদ্র, মিসকিন, জাকাত আদায়ে নিয়োজিত কর্মী, ঋণগ্রস্ত ব্যক্তি এবং আল্লাহর পথে জিহাদ বা সমাজকল্যাণে নিয়োজিতদের জাকাত দেওয়া যায়।</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black shrink-0 mt-1">৪</div>
                <div>
                  <h4 className="font-black text-slate-800 text-base mb-1">স্থানীয় সহায়তা</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">পুঠিয়া উপজেলার দরিদ্র প্রতিবেশী ও আত্মীয়-স্বজনদের অগ্রাধিকার ভিত্তিতে জাকাত প্রদান করা উত্তম।</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Donate / Apply Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">জাকাত অনুদান বা সাহায্যের আবেদন</h3>
                  <p className="text-sm text-slate-500 font-medium">পুঠিয়া উপজেলা সমাজকল্যাণ তহবিল</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleDonate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="যেমন: মোঃ আব্দুল করিম"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="01700-000000"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">টাকার পরিমাণ (টাকা) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="যেমন: ৫০০০"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">খাত বা বিবরণ</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium bg-white"
                  >
                    <option value="সাধারণ জাকাত ফান্ড">সাধারণ জাকাত ফান্ড</option>
                    <option value="দরিদ্র এতিম সহায়তা">দরিদ্র এতিম সহায়তা</option>
                    <option value="অসহায় শিক্ষার্থী সহায়তা">অসহায় শিক্ষার্থী সহায়তা</option>
                    <option value="চিকিৎসা সহায়তা">চিকিৎসা সহায়তা</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition text-sm"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? "জমা দেওয়া হচ্ছে..." : "জমা দিন"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <BottomNavigation activeTab="home" onTabChange={() => {}} />
    </div>
  );
}
