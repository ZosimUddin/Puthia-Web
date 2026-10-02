import React, { useState } from "react";
import { 
  Award, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  CreditCard, 
  Clock, 
  XCircle, 
  Megaphone,
  TrendingUp,
  DollarSign,
  Settings,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign as MoneyIcon,
  Activity,
  Layers,
  Sparkles,
  HelpCircle,
  Smartphone,
  Eye,
  Percent
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  subscribersCount: number;
}

interface PremiumPlan {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
  isActive: boolean;
  listingsCount: number;
}

const PremiumManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState<'subscription' | 'payment' | 'advertisement'>('subscription');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Subscriptions State (Translated & Styled beautifully)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([
    {
      id: "1",
      name: "প্রো মেম্বার (Pro Member)",
      price: "৳ ২৯৯",
      billingCycle: "monthly",
      features: ["বিজ্ঞাপন-মুক্ত ব্রাউজিং সুবিধা", "আনলিমিটেড ফ্রি ডিরেক্টরি লিস্টিং", "সাধারণ ড্যাশবোর্ড অ্যানালিটিক্স", "স্পেশাল প্রো ব্যাজ প্রোফাইলে"],
      isActive: true,
      subscribersCount: 145
    },
    {
      id: "2",
      name: "বিজনেস মেম্বার (Business Member)",
      price: "৳ ২৯৯৯",
      billingCycle: "yearly",
      features: ["প্রো মেম্বারশিপের সকল ফিচার", "উন্নত কাস্টমার এনালিটিক্স ও রিপোর্ট", "এপিআই এক্সেস সুবিধা", "২৪/৭ কাস্টমার প্রায়োরিটি সাপোর্ট", "হোমপেজে স্পন্সরড প্রচার"],
      isActive: true,
      subscribersCount: 48
    }
  ]);

  // Premium Listing Packages State
  const [premiumPlans, setPremiumPlans] = useState<PremiumPlan[]>([
    {
      id: "1",
      name: "গোল্ড প্রিমিয়াম লিস্টিং (Gold Package)",
      price: "৳ ৫০০",
      duration: "১ মাস",
      features: ["অনুসন্ধানের সর্বোচ্চ অগ্রাধিকার", "ভেরিফাইড গোল্ড ব্যাজ যুক্ত করা", "সরাসরি ফোন কল ও ম্যাপ ডিরেক্টরি", "গ্রাহকের জন্য সরাসরি মেসেজিং"],
      isActive: true,
      listingsCount: 320
    },
    {
      id: "2",
      name: "প্লাটিনাম প্রিমিয়াম লিস্টিং (Platinum Package)",
      price: "৳ ১২০০",
      duration: "৩ মাস",
      features: ["গোল্ড লিস্টিং এর সকল ফিচার", "হোমপেজের স্লাইডারে ফিচার লিস্টিং", "ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার", "সোশ্যাল মিডিয়ায় প্রোমোশন শেয়ার"],
      isActive: true,
      listingsCount: 114
    }
  ]);

  // Payment State
  const [paymentTab, setPaymentTab] = useState<'gateways' | 'history'>('gateways');
  const [gateways, setGateways] = useState([
    { id: "bkash", name: "bKash (বিকাশ)", status: "active", type: "মোবাইল ব্যাংকিং (MFS)", icon: "৳", description: "বিকাশ ইনস্ট্যান্ট পেমেন্ট মার্চেন্ট" },
    { id: "nagad", name: "Nagad (নগদ)", status: "active", type: "মোবাইল ব্যাংকিং (MFS)", icon: "৳", description: "নগদ পে-আউট এবং পেমেন্ট গেটওয়ে" },
    { id: "rocket", name: "Rocket (রকেট)", status: "inactive", type: "মোবাইল ব্যাংকিং (MFS)", icon: "৳", description: "রকেট ডাচ-বাংলা ব্যাংক লিমিটেড" },
    { id: "sslcommerz", name: "SSLCommerz (এসএসএল)", status: "active", type: "কার্ড ও নেট ব্যাংকিং গেটওয়ে", icon: "💳", description: "কার্ড, নেট ব্যাংকিং ও ব্যাংক ট্রান্সফার" }
  ]);

  const [paymentHistory, setPaymentHistory] = useState([
    { id: "TXN1056", date: "২০২৬-০৭-১২", user: "রহিম ট্রেডার্স বানেশ্বর", amount: "৫০০", method: "bKash", type: "গোল্ড লিস্টিং", status: "completed" },
    { id: "TXN1055", date: "২০২৬-০৭-১২", user: "মায়ের দোয়া ফার্মেসি", amount: "২৯৯৯", method: "SSLCommerz", type: "বিজনেস মেম্বারশিপ", status: "completed" },
    { id: "TXN1054", date: "২০২৬-০৭-১১", user: "সায়মন টেলিকম", amount: "২৯৯", method: "Nagad", type: "প্রো মেম্বারশিপ", status: "completed" },
    { id: "TXN1053", date: "২০২৬-০৭-১০", user: "সুলতানা ফ্যাশন হাউস", amount: "১২০০", method: "bKash", type: "প্লাটিনাম প্যাকেজ", status: "pending" },
    { id: "TXN1052", date: "২০২৬-০৭-১০", user: "পুঠিয়া এগ্রো প্রজেক্ট", amount: "৫০০", method: "Rocket", type: "গোল্ড লিস্টিং", status: "failed" }
  ]);

  // Advertisement State
  const [adNetwork, setAdNetwork] = useState("admob");
  const [appId, setAppId] = useState("ca-app-pub-3940256099942544~3347511713");
  const [bannerId, setBannerId] = useState("ca-app-pub-3940256099942544/6300978111");
  const [interstitialId, setInterstitialId] = useState("ca-app-pub-3940256099942544/1033173712");
  const [totalAdEarnings, setTotalAdEarnings] = useState("৳ ১২,৪৫০");
  const [adImpressions, setAdImpressions] = useState("৮৫,৬০০");

  const [newFeatureText, setNewFeatureText] = useState("");
  const [activePlanForAddFeature, setActivePlanForAddFeature] = useState<string | null>(null);

  const toggleSubPlanStatus = (id: string) => {
    setSubscriptionPlans(subscriptionPlans.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
    showNotification("প্ল্যান স্ট্যাটাস আপডেট করা হয়েছে!");
  };

  const togglePremiumPlanStatus = (id: string) => {
    setPremiumPlans(premiumPlans.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
    showNotification("প্যাকেজ স্ট্যাটাস আপডেট করা হয়েছে!");
  };

  const deleteSubPlan = (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${name}" সাবস্ক্রিপশন প্ল্যানটি মুছে ফেলতে চান?`)) {
      setSubscriptionPlans(subscriptionPlans.filter(p => p.id !== id));
      showNotification("সাবস্ক্রিপশন প্ল্যান মুছে ফেলা হয়েছে।");
    }
  };

  const deletePremiumPlan = (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${name}" প্রিমিয়াম লিস্টিং প্যাকেজটি মুছে ফেলতে চান?`)) {
      setPremiumPlans(premiumPlans.filter(p => p.id !== id));
      showNotification("প্রিমিয়াম লিস্টিং প্যাকেজ মুছে ফেলা হয়েছে।");
    }
  };

  const toggleGatewayStatus = (id: string) => {
    setGateways(gateways.map(g => 
      g.id === id ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g
    ));
    showNotification("গেটওয়ে স্ট্যাটাস পরিবর্তন করা হয়েছে!");
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage("সকল প্রিমিয়াম এবং পেমেন্ট সেটিংস ডাটাবেসে সফলভাবে সংরক্ষিত হয়েছে!");
      setTimeout(() => setSuccessMessage(""), 4000);
    }, 1200);
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Quick stats
  const totalSubscribers = subscriptionPlans.reduce((acc, curr) => acc + curr.subscribersCount, 0);
  const totalPremiumListings = premiumPlans.reduce((acc, curr) => acc + curr.listingsCount, 0);

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">প্রিমিয়াম সার্ভিস ও রেভিনিউ</h2>
          <p className="text-xs font-bold text-gray-400">সাবস্ক্রিপশন প্ল্যান, পেমেন্ট গেটওয়ে এবং বিজ্ঞাপন রেভিনিউ কনফিগারেশন</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#007A5E] hover:bg-[#00634B] text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-emerald-100 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isSaving ? "সংরক্ষণ হচ্ছে..." : "সকল পরিবর্তন সেভ করুন"}
        </button>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs rounded-2xl flex items-center gap-2.5 shadow-sm"
          >
            <CheckCircle2 size={16} className="text-emerald-500" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Tabs */}
      <div className="flex flex-wrap gap-2.5 bg-gray-50 p-2 rounded-[24px] border border-gray-100 max-w-max">
        {[
          { id: 'subscription', label: 'সাবস্ক্রিপশন ও প্রিমিয়াম প্যাকেজ', icon: Award },
          { id: 'payment', label: 'পেমেন্ট গেটওয়ে ও লেনদেন', icon: CreditCard },
          { id: 'advertisement', label: 'বিজ্ঞাপন রেভিনিউ সেটিংস', icon: Megaphone }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
              activeSubTab === tab.id
              ? "bg-[#007A5E] text-white shadow-md shadow-emerald-100"
              : "text-gray-500 hover:bg-white hover:text-gray-900"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {/* ================= SUBSCRIPTION TAB ================= */}
          {activeSubTab === 'subscription' && (
            <div className="space-y-8">
              {/* Quick stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Award size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">মোট সাবস্ক্রাইবার</span>
                    <h4 className="text-2xl font-black text-gray-900 mt-0.5">{totalSubscribers.toLocaleString('bn-BD')} জন</h4>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                    <Layers size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">সক্রিয় প্রিমিয়াম লিস্টিং</span>
                    <h4 className="text-2xl font-black text-gray-900 mt-0.5">{totalPremiumListings.toLocaleString('bn-BD')} টি</h4>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">প্রাক্কলিত রেভিনিউ</span>
                    <h4 className="text-2xl font-black text-amber-600 mt-0.5">৳ ৩,২৫,৫০০ / মাস</h4>
                  </div>
                </div>
              </div>

              {/* Subscriptions section */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">১. ইউজার সাবস্ক্রিপশন প্ল্যান (User Subscriptions)</h3>
                    <p className="text-xs font-bold text-gray-400">ব্যবহারকারীদের প্রিমিয়াম অ্যাকাউন্ট মেম্বারশিপ সার্ভিস</p>
                  </div>
                  <button 
                    onClick={() => {
                      const name = prompt("নতুন সাবস্ক্রিপশন প্ল্যানের নাম দিন:");
                      const price = prompt("প্ল্যানের মূল্য দিন (যেমন: ৳ ১৯৯):");
                      if (name && price) {
                        const newPlan: SubscriptionPlan = {
                          id: Date.now().toString(),
                          name: name,
                          price: price,
                          billingCycle: 'monthly',
                          features: ["বিজ্ঞাপন-মুক্ত ব্রাউজিং", "পেশাদার সাপোর্ট", "নতুন ফিচার"],
                          isActive: true,
                          subscribersCount: 0
                        };
                        setSubscriptionPlans([...subscriptionPlans, newPlan]);
                        showNotification("নতুন সাবস্ক্রিপশন প্ল্যান সফলভাবে তৈরি হয়েছে!");
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 rounded-2xl text-xs font-black transition-all"
                  >
                    <Plus size={14} /> তৈরি করুন
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {subscriptionPlans.map(plan => (
                    <div key={plan.id} className="bg-white border border-gray-100 rounded-[36px] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                      <div>
                        {/* Upper row info */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-black text-gray-900 mb-1">{plan.name}</h4>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-emerald-600">{plan.price}</span>
                              <span className="text-xs font-bold text-gray-400">/{plan.billingCycle === 'monthly' ? 'মাস' : 'বছর'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSubPlanStatus(plan.id)}
                              className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                                plan.isActive 
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                              }`}
                            >
                              {plan.isActive ? 'Active' : 'Inactive'}
                            </button>

                            <button 
                              onClick={() => deleteSubPlan(plan.id, plan.name)}
                              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Subscriber details */}
                        <div className="bg-gray-50/50 rounded-2xl px-4 py-2.5 mb-4 border border-gray-100 max-w-max flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-bold text-gray-500">মোট সাবস্ক্রাইবার: {plan.subscribersCount} জন</span>
                        </div>

                        {/* Feature list */}
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2.5 text-xs font-bold text-gray-600">
                              <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Card Actions */}
                      <div className="flex gap-2 border-t border-gray-50 pt-4 mt-auto">
                        <button 
                          onClick={() => {
                            const feat = prompt("প্ল্যানের জন্য নতুন ফিচার লিখুন:");
                            if (feat) {
                              setSubscriptionPlans(subscriptionPlans.map(p => 
                                p.id === plan.id ? { ...p, features: [...p.features, feat] } : p
                              ));
                              showNotification("ফিচার যুক্ত করা হয়েছে!");
                            }
                          }}
                          className="flex-1 py-2.5 border border-gray-100 hover:border-emerald-500 text-gray-600 hover:text-emerald-600 rounded-xl font-black text-xs transition-colors"
                        >
                          ফিচার যুক্ত করুন
                        </button>
                        <button 
                          onClick={() => {
                            const newPrice = prompt("প্ল্যানের নতুন মূল্য নির্ধারণ করুন:", plan.price);
                            if (newPrice) {
                              setSubscriptionPlans(subscriptionPlans.map(p => 
                                p.id === plan.id ? { ...p, price: newPrice } : p
                              ));
                              showNotification("প্ল্যানের মূল্য পরিবর্তন করা হয়েছে!");
                            }
                          }}
                          className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-black text-xs transition-colors"
                        >
                          দাম পরিবর্তন করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Business Listings section */}
              <div className="pt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">২. প্রিমিয়াম লিস্টিং প্যাকেজ (Premium Listing Packages)</h3>
                    <p className="text-xs font-bold text-gray-400">বানেশ্বর এবং পুঠিয়ার ব্যবসা প্রতিষ্ঠানগুলোর জন্য ফি জেনারেটর</p>
                  </div>
                  <button 
                    onClick={() => {
                      const name = prompt("নতুন প্রিমিয়াম লিস্টিং প্যাকেজের নাম দিন:");
                      const price = prompt("প্যাকেজ মূল্য লিখুন (যেমন: ৳ ৬০০):");
                      if (name && price) {
                        const newPlan: PremiumPlan = {
                          id: Date.now().toString(),
                          name: name,
                          price: price,
                          duration: "১ মাস",
                          features: ["ভিজিটর অগ্রাধিকার", "সোশ্যাল শেয়ার", "কাস্টম ব্যাজ"],
                          isActive: true,
                          listingsCount: 0
                        };
                        setPremiumPlans([...premiumPlans, newPlan]);
                        showNotification("নতুন প্রিমিয়াম প্যাকেজ সফলভাবে তৈরি হয়েছে!");
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-2xl text-xs font-black transition-all"
                  >
                    <Plus size={14} /> প্যাকেজ তৈরি করুন
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {premiumPlans.map(plan => (
                    <div key={plan.id} className="bg-white border border-gray-100 rounded-[36px] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                      <div>
                        {/* Upper row info */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-black text-gray-900 mb-1">{plan.name}</h4>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-rose-600">{plan.price}</span>
                              <span className="text-xs font-bold text-gray-400">/{plan.duration}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => togglePremiumPlanStatus(plan.id)}
                              className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                                plan.isActive 
                                ? "bg-rose-50 text-rose-600 border border-rose-100" 
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                              }`}
                            >
                              {plan.isActive ? 'Active' : 'Inactive'}
                            </button>

                            <button 
                              onClick={() => deletePremiumPlan(plan.id, plan.name)}
                              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Listings count details */}
                        <div className="bg-gray-50/50 rounded-2xl px-4 py-2.5 mb-4 border border-gray-100 max-w-max flex items-center gap-2">
                          <span className="w-2 h-2 bg-rose-500 rounded-full" />
                          <span className="text-xs font-bold text-gray-500">মোট সক্রিয় বিজ্ঞাপন: {plan.listingsCount} টি ব্যবসা</span>
                        </div>

                        {/* Feature list */}
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2.5 text-xs font-bold text-gray-600">
                              <CheckCircle size={14} className="text-rose-500 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Card Actions */}
                      <div className="flex gap-2 border-t border-gray-50 pt-4 mt-auto">
                        <button 
                          onClick={() => {
                            const feat = prompt("প্যাকেজের জন্য নতুন সুবিধা যোগ করুন:");
                            if (feat) {
                              setPremiumPlans(premiumPlans.map(p => 
                                p.id === plan.id ? { ...p, features: [...p.features, feat] } : p
                              ));
                              showNotification("সুবিধা যুক্ত করা হয়েছে!");
                            }
                          }}
                          className="flex-1 py-2.5 border border-gray-100 hover:border-rose-500 text-gray-600 hover:text-rose-600 rounded-xl font-black text-xs transition-colors"
                        >
                          সুবিধা যুক্ত করুন
                        </button>
                        <button 
                          onClick={() => {
                            const newPrice = prompt("প্যাকেজের নতুন মূল্য নির্ধারণ করুন:", plan.price);
                            if (newPrice) {
                              setPremiumPlans(premiumPlans.map(p => 
                                p.id === plan.id ? { ...p, price: newPrice } : p
                              ));
                              showNotification("প্যাকেজের মূল্য পরিবর্তন করা হয়েছে!");
                            }
                          }}
                          className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-black text-xs transition-colors"
                        >
                          দাম পরিবর্তন করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= PAYMENT TAB ================= */}
          {activeSubTab === 'payment' && (
            <div className="space-y-8">
              {/* Payment Inner Header Tabs */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex gap-3 bg-gray-100/60 p-1.5 rounded-2xl border border-gray-100">
                  <button 
                    onClick={() => setPaymentTab('gateways')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                      paymentTab === 'gateways' 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    পেমেন্ট মেথড গেটওয়ে (Gateways)
                  </button>
                  <button 
                    onClick={() => setPaymentTab('history')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                      paymentTab === 'history' 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    পেমেন্ট ট্রানজেকশন হিস্ট্রি (History)
                  </button>
                </div>

                <span className="hidden md:block text-xs font-bold text-gray-400">
                  গেটওয়ে ইন্টিগ্রেশন প্রোভাইডার: SSLCommerz & Shurjopay SDK
                </span>
              </div>

              {/* PAYMENT TAB: GATEWAYS */}
              {paymentTab === 'gateways' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gateways.map(gateway => (
                    <div key={gateway.id} className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
                      {/* Gateway Badge */}
                      <div className="absolute top-4 right-4 text-3xl opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
                        {gateway.icon}
                      </div>

                      <div>
                        <h4 className="font-black text-base text-gray-900 mb-1">{gateway.name}</h4>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">
                          {gateway.type}
                        </span>
                        <p className="text-xs font-bold text-gray-500 leading-relaxed mb-6">
                          {gateway.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <button 
                          onClick={() => toggleGatewayStatus(gateway.id)}
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${
                            gateway.status === 'active' 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse" 
                            : "bg-gray-100 text-gray-400 border border-gray-200"
                          }`}
                        >
                          {gateway.status === 'active' ? 'Active' : 'Inactive'}
                        </button>

                        <button 
                          onClick={() => {
                            const p1 = prompt(`${gateway.name} এর সিক্রেট মার্চেন্ট এপিআই কী সেট করুন:`);
                            if (p1 !== null) {
                              showNotification(`${gateway.name} এর মার্চেন্ট ক্রেডেনশিয়াল সেভ করা হয়েছে।`);
                            }
                          }}
                          className="text-xs font-black text-emerald-600 hover:underline"
                        >
                          কনফিগার করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* PAYMENT TAB: TRANSACTION HISTORY */
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">লেনদেন ও পেমেন্ট হিস্ট্রি</h3>
                      <p className="text-xs font-bold text-gray-400">বানেশ্বর ডিরেক্টরি এবং ব্যবহারকারীদের মোট ট্রানজেকশন তালিকা</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const id = prompt("নতুন কাস্টম ট্রানজেকশন আইডি প্রবেশ করান (যেমন: TXN1057):");
                          const user = prompt("ইউজার অথবা প্রতিষ্ঠানের নাম:");
                          const amount = prompt("পেমেন্ট পরিমাণ (যেমন: ৫০০):");
                          if (id && user && amount) {
                            const newTxn = {
                              id,
                              date: new Date().toISOString().split('T')[0],
                              user,
                              amount,
                              method: "bKash",
                              type: "গোল্ড লিস্টিং",
                              status: "completed"
                            };
                            setPaymentHistory([newTxn, ...paymentHistory]);
                            showNotification("নতুন ডামি ট্রানজেকশন যুক্ত করা হয়েছে!");
                          }
                        }}
                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-700 text-xs font-black rounded-xl transition-all"
                      >
                        পেমেন্ট ট্র্যাকিং যোগ করুন
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-black uppercase tracking-wider">
                        <tr>
                          <th className="px-8 py-4">লেনদেন আইডি</th>
                          <th className="px-8 py-4">পেমেন্ট তারিখ</th>
                          <th className="px-8 py-4">ইউজার/ব্যবসার নাম</th>
                          <th className="px-8 py-4">সার্ভিসের ধরণ</th>
                          <th className="px-8 py-4">পেমেন্ট মাধ্যম</th>
                          <th className="px-8 py-4">টাকার পরিমাণ</th>
                          <th className="px-8 py-4 text-right">লেনদেন স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {paymentHistory.map((txn) => (
                          <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-5 font-mono font-black text-gray-400">{txn.id}</td>
                            <td className="px-8 py-5 font-bold text-gray-500">{txn.date}</td>
                            <td className="px-8 py-5 font-black text-gray-800">{txn.user}</td>
                            <td className="px-8 py-5">
                              <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-full font-bold text-[10px]">
                                {txn.type}
                              </span>
                            </td>
                            <td className="px-8 py-5 font-bold">
                              <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                                {txn.method}
                              </span>
                            </td>
                            <td className="px-8 py-5 font-black text-gray-900 text-sm">৳ {txn.amount}</td>
                            <td className="px-8 py-5 text-right flex justify-end">
                              <div className="flex items-center gap-1.5">
                                {txn.status === 'completed' && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-black text-[10px]">
                                    <CheckCircle2 size={12} /> Completed
                                  </span>
                                )}
                                {txn.status === 'pending' && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full font-black text-[10px] animate-pulse">
                                    <Clock size={12} /> Pending
                                  </span>
                                )}
                                {txn.status === 'failed' && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full font-black text-[10px]">
                                    <XCircle size={12} /> Failed
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= ADVERTISEMENT REVENUE TAB ================= */}
          {activeSubTab === 'advertisement' && (
            <div className="space-y-8">
              {/* Telemetry info row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">মোট এডভিউ ইমপ্রেশন</span>
                  <h3 className="text-3xl font-black text-gray-900">{adImpressions} বার</h3>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">আমাদের পুঠিয়া অ্যান্ড্রয়েড মোবাইল ও ওয়েব অ্যাপ</p>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">সর্বমোট এড রেভিনিউ</span>
                  <h3 className="text-3xl font-black text-emerald-600">{totalAdEarnings}</h3>
                  <p className="text-[10px] font-bold text-emerald-500 mt-2">চলতি মাসে বিজ্ঞাপনের প্রাক্কলিত আয়</p>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">আভ্যন্তরীন ব্যানার ক্লিক</span>
                  <h3 className="text-3xl font-black text-blue-600">৩.৪% CTR</h3>
                  <p className="text-[10px] font-bold text-blue-500 mt-2">ইউজার এনগেজমেন্ট অনুপাত (এভারেজ)</p>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">অ্যাড নেটওয়ার্ক স্ট্যাটাস</span>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black text-emerald-600">এডমোব এপিআই কানেক্টেড</span>
                  </div>
                </div>
              </div>

              {/* Advertisement Configuration Forms */}
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="mb-8 pb-4 border-b border-gray-50 flex items-center gap-2.5">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Megaphone size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">বিজ্ঞাপন নেটওয়ার্ক কনফিগারেশন সেটিংস</h3>
                    <p className="text-xs font-bold text-gray-400">মোবাইল অ্যাপ ও ওয়েবসাইটের ব্যানার ও ইন্টারস্টিশিয়াল বিজ্ঞাপন নিয়ন্ত্রণ করুন</p>
                  </div>
                </div>

                <div className="space-y-6 max-w-3xl">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 ml-1">অ্যাড নেটওয়ার্ক প্রোভাইডার (Ad Network)</label>
                    <select
                      value={adNetwork || ""}
                      onChange={(e) => setAdNetwork(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      <option value="admob">Google AdMob (অ্যাডমোব)</option>
                      <option value="facebook">Facebook Audience Network</option>
                      <option value="applovin">AppLovin MAX</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 ml-1">অ্যাপ আইডি (App ID)</label>
                    <input
                      type="text"
                      value={appId || ""}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="যেমন: ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 ml-1">ব্যানার এড ইউনিট আইডি (Banner Ad Unit ID)</label>
                      <input
                        type="text"
                        value={bannerId || ""}
                        onChange={(e) => setBannerId(e.target.value)}
                        placeholder="যেমন: ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 ml-1">ইন্টারস্টিশিয়াল এড ইউনিট আইডি (Interstitial Ad ID)</label>
                      <input
                        type="text"
                        value={interstitialId || ""}
                        onChange={(e) => setInterstitialId(e.target.value)}
                        placeholder="যেমন: ca-app-pub-xxxxxxxxxxxxxxxx/wwwwwwwwww"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400">
                      নোট: বিজ্ঞাপন পরিবর্তন করতে ১-৩ ঘন্টা সময় লাগতে পারে গুগলের ক্যাশ আপডেট পিরিয়ডের জন্য।
                    </span>

                    <button 
                      onClick={() => {
                        showNotification("বিজ্ঞাপন নেটওয়ার্ক সেটিংস সফলভাবে আপডেট করা হয়েছে!");
                      }}
                      className="px-6 py-3 bg-[#007A5E] hover:bg-[#00634B] text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-emerald-50"
                    >
                      সেটিংস আপডেট করুন
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PremiumManagement;
