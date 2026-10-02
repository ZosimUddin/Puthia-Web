import React, { useState, useEffect } from 'react';
import { Ad, getAds, addAdApplication } from '../api';
import { 
  Megaphone, 
  Send, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  PlusCircle, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Phone, 
  ShieldCheck,
  Award,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface SponsorsPageProps {
  onGoBack: () => void;
}

export default function SponsorsPage({ onGoBack }: SponsorsPageProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'apply'>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Application Form State
  const [businessName, setBusinessName] = useState('');
  const [duration, setDuration] = useState('১ মাস (৫০০ টাকা)');
  const [paymentMethod, setPaymentMethod] = useState('বিকাশ (bKash)');
  const [senderNumber, setSenderNumber] = useState('');
  const [txId, setTxId] = useState('');
  
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadAds = async () => {
      setIsLoading(true);
      try {
        const data = await getAds();
        setAds(data);
      } catch (error) {
        console.error('Failed to load ads:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAds();
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !senderNumber || !txId) {
      setSubmitError('অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্যগুলো পূরণ করুন।');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await addAdApplication({
        businessName,
        duration,
        paymentMethod,
        senderNumber,
        txId,
      });
      setSubmitSuccess(true);
      // Reset form
      setBusinessName('');
      setSenderNumber('');
      setTxId('');
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitError('আবেদনটি জমা দেওয়া সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const topBanners = ads.filter(a => a.slotType === 'top_banner');
  const partners = ads.filter(a => a.slotType === 'partner');

  // Stunning mock/default ads for gorgeous rich visual content if none or few exist in DB
  const defaultSponsors = [
    {
      id: 'def-1',
      title: 'পুঠিয়া রাজবাড়ী ক্যাফে ও রেস্টুরেন্ট',
      category: 'খাবার ও রেস্টুরেন্ট',
      description: 'ঈদ ও উৎসব উপলক্ষে সব ফ্যামিলি প্যাকেজে ১৫% বিশেষ ছাড়! আমাদের এখানে পাবেন সম্পূর্ণ স্বাস্থ্যসম্মত পরিবেশে সুস্বাদু দেশী, চাইনিজ ও ফাস্টফুড খাবার। আজই সপরিবারে চলে আসুন।',
      phone: '০১৭১২-৩৪৫৬৭৮',
      location: 'রাজবাড়ী মেইন গেট সংলগ্ন, পুঠিয়া',
      badge: 'গোল্ড স্পন্সর',
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'def-2',
      title: 'মা ডায়াগনস্টিক অ্যান্ড কনসালটেশন সেন্টার',
      category: 'চিকিৎসা ও ডায়াগনস্টিক',
      description: 'আধুনিক ও ডিজিটাল ইক্যুইপমেন্ট সহ নির্ভুল ল্যাব টেস্টের একমাত্র বিশ্বস্ত প্রতিষ্ঠান। আমাদের এখানে প্রতি শুক্রবার অভিজ্ঞ কার্ডিওলজিস্ট ও মেডিসিন বিশেষজ্ঞ সরাসরি রোগী দেখেন। পুঠিয়া অ্যাপ ইউজারদের জন্য ১০% ডিসকাউন্ট!',
      phone: '০১৭১৫-৫৫৬৬৭৭',
      location: 'থানা মোড়, পুঠিয়া সদর',
      badge: 'প্রিমিয়াম পার্টনার',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'def-3',
      title: 'বানেশ্বর ক্লথ স্টোর ও রেডিমেড কর্নার',
      category: 'ফ্যাশন ও পোশাক',
      description: 'সকল প্রকার আধুনিক মানসম্মত পাঞ্জাবি, শাড়ি, থ্রি-পিস ও থান কাপড়ের এক বিশাল আয়োজন। নতুন কালেকশন ও ঈদ ধামাকা অফারে প্রতিটি কেনাকাটায় নিশ্চিত আকর্ষণীয় উপহার জিতে নিন!',
      phone: '০১৭১১-২২৩৩৪৪',
      location: 'বানেশ্বর বাজার মেইন রোড, পুঠিয়া',
      badge: 'সিলভার স্পন্সর',
      color: 'from-blue-500 to-indigo-600',
    }
  ];

  const defaultPartners = [
    { name: 'মেসার্স পুঠিয়া ইলেকট্রনিক্স', desc: 'বিশ্বস্ত ব্র্যান্ডের শোরুম' },
    { name: 'গ্রীন ফার্মেসী', desc: '২৪ ঘণ্টা ঔষধ ও সেবা' },
    { name: 'সাদিয়া বুটিকস', desc: 'আধুনিক থ্রি-পিস ও পোশাক' },
    { name: 'বানেশ্বর এগ্রো ফিড', desc: 'উন্নত মানের পশুখাদ্য' },
    { name: 'রাজশাহী সুইটস', desc: 'খাঁটি ছানার মিষ্টি ও দই' },
    { name: 'কসমো আইটি পুঠিয়া', desc: 'কম্পিউটার ও ডিজিটাল সেবা' },
  ];

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Dynamic Visual Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #006A4E, #003F2F)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-emerald-600 text-sm font-medium mb-2 uppercase tracking-wide">আমাদের পুঠিয়া পার্টনারশিপ</p>
          <h1 className="text-4xl font-black mb-1 text-white">স্থানীয় স্পন্সর ও বিজ্ঞাপন</h1>
          <div className="w-10 h-1 bg-white rounded-full my-3"></div>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
            আমাদের পুঠিয়া অ্যাপের সম্মানিত পৃষ্ঠপোষক, স্পন্সর এবং স্থানীয় ব্যবসাগুলোর বিজ্ঞাপন হাব। আপনার নিজের ব্যবসার প্রচার করতে আজই আবেদন করুন।
          </p>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-20 top-2 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Modern Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl">
        <button 
          onClick={() => { setActiveTab('all'); setSubmitSuccess(false); }}
          className={`flex-1 py-3.5 rounded-xl text-sm font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'all' ? 'bg-white text-[#006A4E] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Megaphone className="w-4 h-4" />
          বর্তমান স্পন্সর ও অফার
        </button>
        <button 
          onClick={() => setActiveTab('apply')}
          className={`flex-1 py-3.5 rounded-xl text-sm font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'apply' ? 'bg-white text-[#006A4E] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <PlusCircle className="w-4 h-4" />
          বিজ্ঞাপনের জন্য আবেদন করুন
        </button>
      </div>

      {activeTab === 'all' ? (
        <div className="space-y-8">
          {/* Top Banners Carousel If Available */}
          {topBanners.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                ফিচার্ড ব্যানার বিজ্ঞাপন
              </h3>
              <div className="relative overflow-hidden w-full h-44 md:h-52 bg-neutral-900 rounded-3xl shadow-sm border border-neutral-200">
                {topBanners.map((ad, i) => (
                  <a 
                    href={ad.link || '#'} 
                    key={ad.id} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="absolute inset-0 block group"
                  >
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex flex-col justify-end p-5">
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-900 text-[10px] font-black rounded-full w-max mb-1 uppercase tracking-wider">স্পন্সরড</span>
                      <h4 className="text-white font-extrabold text-lg md:text-xl drop-shadow">{ad.title}</h4>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Premium Sponsors Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-[#006A4E]" />
              আমাদের প্রধান পৃষ্ঠপোষকবৃন্দ
            </h3>

            {/* Render real ads first if available, then default ads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Database Ads (Non-top_banner) */}
              {ads.filter(a => a.slotType !== 'top_banner' && a.slotType !== 'partner').map((ad) => (
                <div key={ad.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#006A4E]/5 rounded-bl-full -z-10" />
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-[#006A4E]/10 text-[#006A4E] text-[11px] font-bold rounded-full mb-3">
                      ভেরিফাইড স্পন্সর
                    </span>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{ad.title}</h4>
                    {ad.imageUrl && (
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-36 object-cover rounded-2xl mb-3 border border-gray-100" />
                    )}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {ad.link ? `ভিজিট করুন: ${ad.link}` : 'পুঠিয়া বাসীদের জন্য সেরা অফার ও সেবা নিয়ে সর্বদা প্রস্তুত।'}
                    </p>
                  </div>
                  {ad.link && (
                    <a 
                      href={ad.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="mt-2 text-xs font-bold text-[#006A4E] flex items-center gap-1 hover:underline"
                    >
                      আরো দেখুন <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}

              {/* Default/Static Beautiful Sponsors */}
              {defaultSponsors.map((sponsor) => (
                <div 
                  key={sponsor.id} 
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${sponsor.color} opacity-5 rounded-bl-full pointer-events-none`} />
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 text-[11px] font-extrabold rounded-full border border-amber-500/20 uppercase tracking-wide">
                        {sponsor.badge}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 font-mono">{sponsor.category}</span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 group-hover:text-[#006A4E] transition-colors">{sponsor.title}</h4>
                    
                    <div className="w-10 h-0.5 bg-gray-200 rounded-full my-3"></div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {sponsor.description}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-50 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">📍 লোকেশন:</span> {sponsor.location}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <a 
                        href={`tel:${sponsor.phone}`} 
                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 flex items-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#006A4E]" />
                        কল করুন ({sponsor.phone})
                      </a>
                      <span className="text-[11px] font-bold text-[#006A4E] flex items-center gap-0.5">
                        যাচাইকৃত <ShieldCheck className="w-3.5 h-3.5 fill-[#006A4E] text-white" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Partners Directory */}
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  ডিজিটাল বিজনেস পার্টনার্স
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">পুঠিয়া উপজেলার বিশ্বস্ত লোকাল শপ ও সহযোগী ব্র্যান্ড।</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                {partners.length > 0 ? partners.length + defaultPartners.length : defaultPartners.length} টি সচল
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Database Partners */}
              {partners.map(ad => (
                <div key={ad.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition text-center flex flex-col items-center justify-center">
                  {ad.imageUrl ? (
                    <img src={ad.imageUrl} alt={ad.title} className="w-14 h-14 rounded-full bg-neutral-100 object-cover border-2 border-gray-50" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
                      {ad.title.charAt(0)}
                    </div>
                  )}
                  <h5 className="text-xs font-extrabold text-gray-800 mt-2 line-clamp-1">{ad.title}</h5>
                  <p className="text-[10px] text-gray-400 mt-0.5">সহযোগী পার্টনার</p>
                </div>
              ))}

              {/* Default Partners */}
              {defaultPartners.map((p, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-50/70 text-indigo-600 flex items-center justify-center font-black text-base border border-indigo-100/50">
                    🏢
                  </div>
                  <h5 className="text-xs font-bold text-gray-800 mt-2 line-clamp-1">{p.name}</h5>
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ad Benefit Info Bar */}
          <div className="bg-gradient-to-r from-[#006A4E]/5 to-indigo-50 border border-[#006A4E]/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-extrabold text-[#006A4E] text-base">আপনার ব্যবসার প্রচার বাড়াতে চান?</h4>
              <p className="text-xs text-gray-600">আমাদের এই অ্যাপে প্রতিদিন হাজারো পুঠিয়াবাসী ভিজিট করেন। এখানে বিজ্ঞাপন দিয়ে আপনার বেচাকেনা বাড়ান!</p>
            </div>
            <button 
              onClick={() => setActiveTab('apply')}
              className="px-5 py-2.5 bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              বিজ্ঞাপন দিতে এখানে ক্লিক করুন <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          {submitSuccess ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-gray-900">আবেদনটি সফলভাবে সম্পন্ন হয়েছে!</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                আপনার দেওয়া বিজ্ঞাপনের তথ্য এবং পেমেন্ট ট্রানজেকশন আইডি আমাদের ডাটাবেজে সংরক্ষিত হয়েছে। অ্যাডমিন প্যানেল থেকে যাচাইকরণের পর আগামী ২৪ ঘণ্টার মধ্যে আপনার বিজ্ঞাপনটি অ্যাপে লাইভ করা হবে।
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => { setSubmitSuccess(false); setActiveTab('all'); }}
                  className="px-6 py-2.5 bg-[#006A4E] hover:bg-[#00523C] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  স্পন্সর পেজে ফিরে যান
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleApplySubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-gray-900">বিজ্ঞাপনের নতুন আবেদন ফর্ম</h3>
                <p className="text-xs text-gray-500 mt-0.5">নিচের ফর্মটি নির্ভুলভাবে পূরণ করে পুঠিয়া অ্যাপে আপনার বিজ্ঞাপন চালু করুন।</p>
              </div>

              {submitError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Payment Steps Guideline */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  ধাপ ১: পেমেন্ট করার নিয়মাবলি
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  আমাদের অফিশিয়াল পার্সোনাল নম্বর <strong>০১৭০০-০০০০০০</strong> (বিকাশ / রকেট / নগদ) এ আপনার নির্বাচিত বিজ্ঞাপন প্যাকেজের টাকা <strong>Send Money</strong> করুন।
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 font-bold">১ মাস প্যাকেজ</p>
                    <p className="text-xs font-black text-[#006A4E] mt-0.5">৫০০ টাকা</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 font-bold">৩ মাস প্যাকেজ</p>
                    <p className="text-xs font-black text-[#006A4E] mt-0.5">১২০০ টাকা</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 font-bold">৬ মাস প্যাকেজ</p>
                    <p className="text-xs font-black text-[#006A4E] mt-0.5">২০০০ টাকা</p>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">
                  ধাপ ২: বিজ্ঞাপনের তথ্য পূরণ করুন
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-gray-700">প্রতিষ্ঠানের নাম (Business Name) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="উদা: পুঠিয়া জুয়েলার্স" 
                      value={businessName || ""}
                      onChange={e => setBusinessName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#006A4E] focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-gray-700">বিজ্ঞাপনের সময়সীমা (Duration) *</label>
                    <select 
                      value={duration || ""}
                      onChange={e => setDuration(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#006A4E] focus:outline-none transition cursor-pointer"
                    >
                      <option>১ মাস (৫০০ টাকা)</option>
                      <option>৩ মাস (১২০০ টাকা)</option>
                      <option>৬ মাস (২০০০ টাকা)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-gray-700">পেমেন্ট মাধ্যম (Payment Method) *</label>
                    <select 
                      value={paymentMethod || ""}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#006A4E] focus:outline-none transition cursor-pointer"
                    >
                      <option>বিকাশ (bKash)</option>
                      <option>নগদ (Nagad)</option>
                      <option>রকেট (Rocket)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-gray-700">যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Number) *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="উদা: ০১৭xxxxxxxx" 
                      value={senderNumber || ""}
                      onChange={e => setSenderNumber(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#006A4E] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-gray-700">লেনদেন আইডি (Transaction ID - TxID) *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="উদা: TRX98765432" 
                    value={txId || ""}
                    onChange={e => setTxId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#006A4E] focus:outline-none uppercase transition"
                  />
                </div>
              </div>

              {/* Information disclaimer */}
              <p className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                আপনার প্রদত্ত পেমেন্টের তথ্য যদি ভুয়া হয় তবে আবেদনটি সরাসরি বাতিল করা হবে। আপনার বিজ্ঞাপন কন্টেন্ট ও ব্যানার ইমেজ অ্যাডমিন প্যানেল থেকে অ্যাপ্রুভালের পর সরাসরি যুক্ত করা হবে।
              </p>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#006A4E] hover:bg-[#00523C] text-white font-extrabold text-sm rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'প্রসেস হচ্ছে...' : 'আবেদন জমা দিন'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
