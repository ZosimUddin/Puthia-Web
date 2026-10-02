import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Megaphone, CheckCircle2, TrendingUp, Users, Target, PhoneCall, 
  MessageCircle, Mail, Facebook, Send, Image as ImageIcon, ChevronDown, 
  ChevronUp, CreditCard, HelpCircle 
} from 'lucide-react';

interface AdvertiseWithUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvertiseWithUsModal = ({ isOpen, onClose }: AdvertiseWithUsModalProps) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'form' | 'contact' | 'faq'>('packages');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'cod' | 'bank' | 'manual' | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      showToast('অনুগ্রহ করে পেমেন্ট মেথড নির্বাচন করুন');
      return;
    }
    
    setIsSubmitting(true);
    showToast(`Payment Gateway (${paymentMethod})-তে রিডাইরেক্ট করা হচ্ছে...`);
    
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('পেমেন্ট সফল! বিজ্ঞাপন Pending Review স্ট্যাটাসে আছে।');
      setTimeout(() => {
        onClose();
      }, 3000);
    }, 2500);
  };

  const packages = [
    {
      name: 'Basic',
      duration: '৭ দিন',
      price: '৳২৯৯',
      features: ['ডিরেক্টরি পেজে বিজ্ঞাপন', 'সাধারণ সার্চ র‍্যাঙ্কিং', 'বিশ্লেষণ রিপোর্ট (বেসিক)', 'কমিউনিটি সাপোর্ট']
    },
    {
      name: 'Standard',
      duration: '১৫ দিন',
      price: '৳৪৯৯',
      popular: true,
      features: ['হোম পেজে বিজ্ঞাপন', 'উন্নত সার্চ র‍্যাঙ্কিং', 'বিস্তারিত বিশ্লেষণ রিপোর্ট', 'কাস্টম বাটন যোগ করার সুবিধা', 'অগ্রাধিকার সাপোর্ট']
    },
    {
      name: 'Premium',
      duration: '৩০ দিন',
      price: '৳৭৯৯',
      features: ['হোম পেজ ও ডিরেক্টরি পেজ', 'সর্বোচ্চ সার্চ র‍্যাঙ্কিং', 'উন্নত বিশ্লেষণ ও ইনসাইট', 'সোশ্যাল মিডিয়া প্রোমোশন', 'ডেডিকেটেড সাপোর্ট']
    }
  ];

  const faqs = [
    {
      q: 'বিজ্ঞাপন কত ঘণ্টার মধ্যে লাইভ হবে?',
      a: 'আপনার আবেদন ও পেমেন্ট সফলভাবে জমা দেওয়ার পর সাধারণত ২-৪ ঘণ্টার মধ্যে আমাদের টিম রিভিউ করে বিজ্ঞাপন লাইভ করে দেয়।'
    },
    {
      q: 'ব্যানারের সাইজ কত হতে হবে?',
      a: 'হোম পেজ ব্যানারের জন্য প্রস্তাবিত সাইজ হল ১২০০ x ৬০০ পিক্সেল এবং ডিরেক্টরি পেজের জন্য ৮০০ x ৪০০ পিক্সেল।'
    },
    {
      q: 'কী ধরনের বিজ্ঞাপন গ্রহণ করা হয়?',
      a: 'যেকোনো বৈধ ব্যবসা, সেবা, শিক্ষা প্রতিষ্ঠান, দোকান বা স্থানীয় উদ্যোগের বিজ্ঞাপন আমরা গ্রহণ করি। অবৈধ বা সমাজবিরোধী কোনো কিছুর বিজ্ঞাপন দেওয়া যাবে না।'
    }
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm sm:p-4">
      <motion.div 
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-white w-full max-w-2xl sm:rounded-[24px] rounded-t-[32px] rounded-b-none h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Drag handle for mobile */}
        <div className="w-full flex justify-center pt-3 pb-2 sm:hidden shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 pt-2 sm:pt-6 border-b border-slate-100 shrink-0">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
               <Megaphone className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-xl font-black text-slate-800 leading-tight">বিজ্ঞাপন দিন</h3>
               <p className="text-sm font-medium text-slate-500 m-0">আপনার ব্যবসাকে সবার কাছে পৌঁছে দিন</p>
             </div>
           </div>
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
             <X className="w-4 h-4" />
           </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-100 px-2 shrink-0 bg-white">
          {[
            { id: 'packages', label: 'প্যাকেজ' },
            { id: 'form', label: 'আবেদন ফর্ম' },
            { id: 'contact', label: 'যোগাযোগ' },
            { id: 'faq', label: 'FAQ' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 p-4 sm:p-6 pb-24 sm:pb-6">
          
          {/* TAB: PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[20px] p-6 text-white shadow-lg">
                <h3 className="text-lg font-black mb-2">কেন আমাদের সাথে বিজ্ঞাপন দেবেন?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="flex flex-col items-center text-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <Users className="w-6 h-6 mb-2 text-blue-200" />
                    <span className="text-sm font-bold">১০,০০০+ ব্যবহারকারী</span>
                  </div>
                  <div className="flex flex-col items-center text-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <Target className="w-6 h-6 mb-2 text-blue-200" />
                    <span className="text-sm font-bold">সঠিক গ্রাহকের কাছে পৌঁছান</span>
                  </div>
                  <div className="flex flex-col items-center text-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 mb-2 text-blue-200" />
                    <span className="text-sm font-bold">ব্যবসার বিক্রি বাড়ান</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg, idx) => (
                  <div key={idx} className={`bg-white rounded-[20px] p-5 border ${pkg.popular ? 'border-blue-500 shadow-md relative' : 'border-slate-200 shadow-sm'}`}>
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                        Popular
                      </div>
                    )}
                    <h4 className="text-lg font-black text-slate-800 mb-1">{pkg.name}</h4>
                    <div className="text-sm text-slate-500 font-medium mb-3">{pkg.duration}</div>
                    <div className="text-2xl font-black text-blue-600 mb-4">{pkg.price}</div>
                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 font-medium leading-tight">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => setActiveTab('form')}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        pkg.popular 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      সিলেক্ট করুন
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FORM */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3">আপনার তথ্য দিন</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">ব্যবসা/প্রতিষ্ঠানের নাম *</label>
                    <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">যোগাযোগের নাম *</label>
                    <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">মোবাইল নম্বর *</label>
                    <input type="tel" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">ইমেইল (ঐচ্ছিক)</label>
                    <input type="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">প্যাকেজ নির্বাচন করুন *</label>
                    <select required defaultValue="standard" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white">
                      <option value="basic">Basic - ৭ দিন (৳২৯৯)</option>
                      <option value="standard">Standard - ১৫ দিন (৳৪৯৯)</option>
                      <option value="premium">Premium - ৩০ দিন (৳৭৯৯)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">বিজ্ঞাপনের স্থান *</label>
                    <select required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white">
                      <option value="home">হোম পেজ</option>
                      <option value="directory">ডিরেক্টরি পেজ</option>
                      <option value="both">উভয় পেজ (শুধুমাত্র Premium)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">বিজ্ঞাপনের ছবি/ব্যানার আপলোড করুন</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group">
                    <ImageIcon className="w-8 h-8 mx-auto text-slate-300 group-hover:text-blue-500 mb-2" />
                    <p className="text-sm font-medium text-slate-600">ছবি আপলোড করতে ক্লিক করুন</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG (Max: 5MB)</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">অতিরিক্ত বার্তা (ঐচ্ছিক)</label>
                  <textarea rows={3} placeholder="আপনার বিজ্ঞাপনের কোনো বিশেষ নির্দেশনা থাকলে লিখুন..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white resize-none"></textarea>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-500" /> পেমেন্ট অপশন নির্বাচন করুন *
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${paymentMethod === 'bkash' ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm ring-1 ring-pink-500/50' : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300'}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div> bKash
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${paymentMethod === 'nagad' ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm ring-1 ring-orange-500/50' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div> Nagad
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('rocket')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${paymentMethod === 'rocket' ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm ring-1 ring-purple-500/50' : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300'}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div> Rocket
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('sslcommerz')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 sm:col-span-1 ${paymentMethod === 'sslcommerz' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500/50' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                  >
                    Card / SSLCommerz
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${paymentMethod === 'bank' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500/50' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                  >
                    Bank Transfer
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${paymentMethod === 'cod' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500/50' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                  >
                    Cash on Delivery
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('manual')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 sm:col-span-3 ${paymentMethod === 'manual' ? 'bg-slate-200 border-slate-500 text-slate-800 shadow-sm ring-1 ring-slate-500/50' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    Manual Payment (Txn ID)
                  </button>
                </div>
                {paymentMethod && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium">
                      {paymentMethod === 'bkash' && 'bKash পেমেন্ট গেটওয়ে নির্বাচন করা হয়েছে। সাবমিট করলে bKash অ্যাপ বা ওয়েব লিংকে নিয়ে যাওয়া হবে।'}
                      {paymentMethod === 'nagad' && 'Nagad পেমেন্ট গেটওয়ে নির্বাচন করা হয়েছে। সাবমিট করলে Nagad অ্যাপ বা ওয়েব লিংকে নিয়ে যাওয়া হবে।'}
                      {paymentMethod === 'rocket' && 'Rocket পেমেন্ট গেটওয়ে নির্বাচন করা হয়েছে।'}
                      {paymentMethod === 'sslcommerz' && 'SSLCommerz Checkout (Visa, MasterCard, Amex) নির্বাচন করা হয়েছে।'}
                      {paymentMethod === 'bank' && 'Bank Transfer নির্বাচন করা হয়েছে। আমাদের ব্যাংক একাউন্ট নম্বর পরবর্তী পেজে দেখানো হবে।'}
                      {paymentMethod === 'cod' && 'Cash on Delivery নির্বাচন করা হয়েছে। আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবে।'}
                      {paymentMethod === 'manual' && 'Manual Payment নির্বাচন করা হয়েছে। অনুগ্রহ করে নির্দিষ্ট নম্বরে সেন্ড মানি করে Transaction ID জমা দিন।'}
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-3 font-medium">পেমেন্ট সফল হলে বিজ্ঞাপনের আবেদন Pending Review স্ট্যাটাসে যাবে।</p>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'প্রসেস হচ্ছে...' : <><Send className="w-5 h-5" /> বিজ্ঞাপন আবেদন করুন</>}
              </button>
            </form>
          )}

          {/* TAB: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeadphonesIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">সরাসরি কথা বলুন</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  বিজ্ঞাপন সংক্রান্ত যেকোনো জিজ্ঞাসা বা সহযোগিতার জন্য আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="tel:+8801700000000" className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors group">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Call Now</h4>
                    <p className="text-xs text-slate-500">+880 1700-000000</p>
                  </div>
                </a>
                
                <a href="https://wa.me/8801700000000" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors group">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">WhatsApp Chat</h4>
                    <p className="text-xs text-slate-500">মেসেজ দিন</p>
                  </div>
                </a>

                <a href="mailto:ads@puthiasmartcity.com" className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Email Us</h4>
                    <p className="text-xs text-slate-500">ads@puthiasmartcity.com</p>
                  </div>
                </a>

                <a href="https://m.me/puthiasmartcity" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Messenger</h4>
                    <p className="text-xs text-slate-500">ফেসবুক পেজে ইনবক্স করুন</p>
                  </div>
                </a>
              </div>
            </div>
          )}

          {/* TAB: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-black text-slate-800 m-0">সচরাচর জিজ্ঞাসিত প্রশ্ন</h3>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border-b border-slate-100 last:border-b-0">
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between focus:outline-none hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-bold text-sm text-slate-800 pr-4">{faq.q}</span>
                      {openFaqIndex === idx ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </button>
                    <AnimatePresence>
                      {openFaqIndex === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed bg-slate-50/50">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Fixed Bottom CTA for Mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 sm:hidden">
          <div className="flex gap-3">
             <button onClick={() => setActiveTab('contact')} className="flex-1 py-3.5 bg-emerald-100 text-emerald-700 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> WhatsApp
             </button>
             <button onClick={() => setActiveTab('form')} className="flex-[2] py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                আবেদন করুন
             </button>
          </div>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl z-[120] whitespace-nowrap border border-white/10 flex items-center gap-2"
            >
              <span className="text-emerald-400">✨</span> {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

function HeadphonesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  )
}
