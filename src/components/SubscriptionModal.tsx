import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Star, Crown, Calendar, CreditCard, Clock, Gift, Bell, AlertTriangle, ShieldCheck, Download, Zap, TrendingUp, Tag, Copy, ChevronRight, ChevronLeft, Landmark, Wallet } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'billing' | 'settings' | 'checkout'>('overview');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<{name: string, price: string} | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'sslcommerz' | 'bank' | 'manual' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isChangingMethod, setIsChangingMethod] = useState(false);
  
  if (!isOpen) return null;

  const handlePayment = () => {
    if (!paymentMethod) return;
    setIsProcessing(true);
    // Simulate API call to payment gateway
    setTimeout(() => {
      setIsProcessing(false);
      if (isChangingMethod) {
        setIsChangingMethod(false);
        setCheckoutSuccess(false);
        setActiveTab('overview');
      } else {
        setCheckoutSuccess(true);
      }
    }, 2500);
  };

  const currentPlan = {
    name: 'Business Pro',
    status: 'Active',
    startDate: '01 Jun 2026',
    endDate: '25 Jul 2026',
    daysLeft: 25,
    autoRenew: true,
    usage: {
      photos: { current: 18, limit: 'Unlimited' },
      products: { current: 42, limit: 'Unlimited' },
      views: 12540,
      leads: 187
    }
  };

  const paymentHistory = [
    { date: '10 Jun 2026', plan: 'Pro', amount: '৳499', status: 'Paid' },
    { date: '10 May 2026', plan: 'Pro', amount: '৳499', status: 'Paid' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-[24px] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white z-10 shrink-0">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
               <Crown className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-lg font-black text-slate-800 m-0">Manage Subscription</h3>
               <p className="text-xs font-medium text-slate-500 m-0">Puthia Smart City Business</p>
             </div>
           </div>
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
             <X className="w-4 h-4" />
           </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-100 bg-slate-50/50 px-4 shrink-0">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'plans', label: 'Upgrade Plan' },
            { id: 'billing', label: 'Billing & History' },
            { id: 'settings', label: 'Settings & Offers' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[20px] p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-2xl opacity-20 translate-x-1/3 -translate-y-1/3"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                      Active Plan
                    </div>
                    <h2 className="text-3xl font-black mb-1">{currentPlan.name}</h2>
                    <p className="text-indigo-100 font-medium mb-0">Renewal: {currentPlan.endDate} ({currentPlan.daysLeft} Days Left)</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 w-full md:w-auto">
                    <div className="text-sm font-medium text-indigo-100 mb-1">Next Payment</div>
                    <div className="text-2xl font-black mb-3">৳499 / mo</div>
                    <button onClick={() => setActiveTab('plans')} className="w-full bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4 mt-8">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Usage & Analytics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Photos</p>
                  <h4 className="text-xl font-black text-slate-800">{currentPlan.usage.photos.current} <span className="text-sm text-slate-400 font-medium">/ {currentPlan.usage.photos.limit}</span></h4>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Products</p>
                  <h4 className="text-xl font-black text-slate-800">{currentPlan.usage.products.current} <span className="text-sm text-slate-400 font-medium">/ {currentPlan.usage.products.limit}</span></h4>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Views</p>
                  <h4 className="text-xl font-black text-slate-800">{currentPlan.usage.views.toLocaleString()}</h4>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Generated Leads</p>
                  <h4 className="text-xl font-black text-emerald-600">{currentPlan.usage.leads}</h4>
                </div>
              </div>

              {/* Benefits Recap */}
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mt-6">
                <h4 className="font-bold text-indigo-900 mb-3 text-sm">Your Current Benefits:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
                  {[
                    'Featured Business', 'Verified Badge', 'More Visitors', 
                    'Advanced Analytics', 'Priority Support', 'Unlimited Photos', 
                    'Unlimited Products', 'Offer System', 'SEO Boost'
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-medium text-indigo-700">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" /> {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PLANS */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto mb-8">
                <h2 className="text-2xl font-black text-slate-800 mb-2">Upgrade Your Business</h2>
                <p className="text-slate-500 text-sm">Get more customers and better visibility with our premium plans. Save 20% on yearly billing!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm flex flex-col relative opacity-70 hover:opacity-100 transition-opacity">
                  <h3 className="text-xl font-black text-slate-800 mb-1">Free</h3>
                  <div className="text-3xl font-black text-slate-800 mb-4">৳0 <span className="text-sm font-medium text-slate-400">/ forever</span></div>
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> ১টি ব্যবসা</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> ৫টি ছবি</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Basic Analytics</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Basic Listing</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Community Support</div>
                  </div>
                  <button className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm cursor-not-allowed">Downgrade</button>
                </div>

                {/* Pro Plan */}
                <div className="bg-white rounded-[24px] p-6 border-2 border-indigo-500 shadow-xl shadow-indigo-100 flex flex-col relative transform md:-translate-y-2">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">Current Plan</div>
                  <h3 className="text-xl font-black text-indigo-600 mb-1">Pro</h3>
                  <div className="text-3xl font-black text-slate-800 mb-4">৳499 <span className="text-sm font-medium text-slate-400">/ mo</span></div>
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-bold"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Everything in Free</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Unlimited Photos & Products</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Featured Listing</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Business Verification Badge</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Offer & Discount System</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> WhatsApp & Call Button</div>
                  </div>
                  <button className="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-sm">Active</button>
                </div>

                {/* Premium Plan */}
                <div className="bg-slate-900 rounded-[24px] p-6 border border-slate-800 shadow-xl flex flex-col relative text-white">
                   <div className="absolute top-4 right-4 text-emerald-500"><Crown className="w-6 h-6" /></div>
                  <h3 className="text-xl font-black text-white mb-1">Premium</h3>
                  <div className="text-3xl font-black text-white mb-4">৳999 <span className="text-sm font-medium text-slate-400">/ mo</span></div>
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-300 font-bold"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Everything in Pro</div>
                    <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Homepage Featured</div>
                    <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Top Search Ranking</div>
                    <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Advertisement Credit</div>
                    <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Business Insights</div>
                    <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dedicated Support</div>
                  </div>
                  <button 
                    onClick={() => { setSelectedPlanForCheckout({name: 'Premium', price: '৳999'}); setActiveTab('checkout'); setCheckoutSuccess(false); setPaymentMethod(null); }}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold rounded-xl text-sm hover:from-amber-300 hover:to-orange-400 transition-colors"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CHECKOUT */}
          {activeTab === 'checkout' && selectedPlanForCheckout && !checkoutSuccess && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setActiveTab('plans')} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h2 className="text-xl font-black text-slate-800 m-0">Checkout</h2>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600 font-bold">Selected Plan</span>
                  <span className="font-black text-indigo-600">{selectedPlanForCheckout.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-slate-800">{selectedPlanForCheckout.price}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-800 mb-3">Select Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                <button 
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 bg-white hover:border-pink-300'}`}
                >
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-black text-[10px]">bKash</div>
                  <span className="font-bold text-xs text-center">bKash</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white hover:border-orange-300'}`}
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-[10px]">Nagad</div>
                  <span className="font-bold text-xs text-center">Nagad</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('sslcommerz')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${paymentMethod === 'sslcommerz' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                >
                  <CreditCard className={`w-8 h-8 ${paymentMethod === 'sslcommerz' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-center">Card / SSL</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${paymentMethod === 'bank' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
                >
                  <Landmark className={`w-8 h-8 ${paymentMethod === 'bank' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-center">Bank Txn</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('manual')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${paymentMethod === 'manual' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white hover:border-amber-300'}`}
                >
                  <Wallet className={`w-8 h-8 ${paymentMethod === 'manual' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-center">Manual</span>
                </button>
              </div>

              {paymentMethod && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6">
                  <p className="text-sm text-indigo-700 font-medium">
                    {paymentMethod === 'bkash' && 'bKash পেমেন্ট গেটওয়ে নির্বাচন করা হয়েছে। Pay বাটনে ক্লিক করলে bKash Payment API খুলবে।'}
                    {paymentMethod === 'nagad' && 'Nagad পেমেন্ট গেটওয়ে নির্বাচন করা হয়েছে। Pay বাটনে ক্লিক করলে Nagad Payment API খুলবে।'}
                    {paymentMethod === 'sslcommerz' && 'SSLCommerz Checkout নির্বাচন করা হয়েছে (Visa, MasterCard, Amex সাপোর্ট করে)।'}
                    {paymentMethod === 'bank' && 'ব্যাংক ট্রান্সফার নির্বাচন করা হয়েছে। আপনার ট্রানজ্যাকশন আইডি প্রদান করে পেমেন্ট যাচাই করুন।'}
                    {paymentMethod === 'manual' && 'ম্যানুয়াল পেমেন্ট নির্বাচন করা হয়েছে। নির্দেশিকা অনুযায়ী পেমেন্ট করে ট্রানজ্যাকশন আইডি দিন।'}
                  </p>
                  {(paymentMethod === 'bank' || paymentMethod === 'manual') && (
                      <input type="text" placeholder="Transaction ID (TxID)" className="mt-3 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                  )}
                </div>
              )}

              <button 
                onClick={handlePayment}
                disabled={!paymentMethod || isProcessing}
                className={`w-full py-4 rounded-xl text-white font-black text-base shadow-lg transition-all ${!paymentMethod ? 'bg-slate-300 cursor-not-allowed' : isProcessing ? 'bg-indigo-400 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 cursor-pointer'}`}
              >
                {isProcessing ? 'Processing Payment...' : `Pay ${selectedPlanForCheckout.price}`}
              </button>
            </div>
          )}

          {activeTab === 'checkout' && checkoutSuccess && (
            <div className="text-center py-16 max-w-md mx-auto">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">Payment Successful!</h2>
              <p className="text-slate-500 mb-8 font-medium">Your subscription has been successfully upgraded to the <strong className="text-slate-700">{selectedPlanForCheckout?.name}</strong> plan.</p>
              <button onClick={() => { setActiveTab('overview'); setCheckoutSuccess(false); }} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-indigo-200 cursor-pointer">
                Go to Dashboard
              </button>
            </div>
          )}

          {/* TAB: BILLING */}
          {activeTab === 'billing' && !isChangingMethod && (
            <div className="space-y-6">
               <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div>
                   <h3 className="text-base font-bold text-slate-800 mb-1">Payment Method</h3>
                   <div className="flex items-center gap-3">
                     <div className="bg-pink-50 text-pink-600 px-2 py-1 rounded text-xs font-bold border border-pink-100">bKash</div>
                     <span className="text-sm text-slate-500 font-medium">017XX-XXXXXX</span>
                   </div>
                 </div>
                 <button 
                   onClick={() => setIsChangingMethod(true)}
                   className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                 >
                   Change Method
                 </button>
               </div>

               <div>
                 <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                   <Calendar className="w-5 h-5 text-indigo-500" /> Payment History
                 </h3>
                 <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                       <thead>
                         <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                           <th className="p-4 font-bold">Date</th>
                           <th className="p-4 font-bold">Plan</th>
                           <th className="p-4 font-bold">Amount</th>
                           <th className="p-4 font-bold">Status</th>
                           <th className="p-4 font-bold text-right">Invoice</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {paymentHistory.map((payment, i) => (
                           <tr key={i} className="text-sm hover:bg-slate-50/50">
                             <td className="p-4 font-medium text-slate-800">{payment.date}</td>
                             <td className="p-4 font-bold text-indigo-600">{payment.plan}</td>
                             <td className="p-4 font-black text-slate-800">{payment.amount}</td>
                             <td className="p-4">
                               <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">
                                 <CheckCircle2 className="w-3 h-3" /> {payment.status}
                               </span>
                             </td>
                             <td className="p-4 text-right">
                               <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                 <Download className="w-4 h-4" />
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                   <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2">
                     <Tag className="w-5 h-5" /> Have a Coupon Code?
                   </div>
                   <div className="flex gap-2">
                     <input type="text" placeholder="Enter code" className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
                     <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">Apply</button>
                   </div>
                 </div>
                 <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-center justify-between gap-4">
                   <div>
                     <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
                       <Gift className="w-5 h-5" /> Referral Program
                     </div>
                     <p className="text-xs text-amber-700/80 m-0">Invite a business and get 20% off your next bill.</p>
                   </div>
                   <button className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 shrink-0">
                     Get Link
                   </button>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'billing' && isChangingMethod && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setIsChangingMethod(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h2 className="text-xl font-black text-slate-800 m-0">Change Payment Method</h2>
              </div>

              <h3 className="text-sm font-bold text-slate-800 mb-3">Select New Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                <button 
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 bg-white hover:border-pink-300'}`}
                >
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-black text-[10px]">bKash</div>
                  <span className="font-bold text-xs text-center">bKash</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white hover:border-orange-300'}`}
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-[10px]">Nagad</div>
                  <span className="font-bold text-xs text-center">Nagad</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('sslcommerz')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${paymentMethod === 'sslcommerz' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                >
                  <CreditCard className={`w-8 h-8 ${paymentMethod === 'sslcommerz' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-center">Card / SSL</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${paymentMethod === 'bank' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
                >
                  <Landmark className={`w-8 h-8 ${paymentMethod === 'bank' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-center">Bank Txn</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('manual')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${paymentMethod === 'manual' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white hover:border-amber-300'}`}
                >
                  <Wallet className={`w-8 h-8 ${paymentMethod === 'manual' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs text-center">Manual</span>
                </button>
              </div>

              {paymentMethod && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6">
                  <p className="text-sm text-indigo-700 font-medium">
                    {paymentMethod === 'bkash' && 'bKash পেমেন্ট গেটওয়ে নির্বাচন করা হয়েছে। Save বাটনে ক্লিক করলে bKash Payment API খুলবে।'}
                    {paymentMethod === 'nagad' && 'Nagad পেমেন্ট গেটওয়ে নির্বাচন করা হয়েছে। Save বাটনে ক্লিক করলে Nagad Payment API খুলবে।'}
                    {paymentMethod === 'sslcommerz' && 'SSLCommerz Checkout নির্বাচন করা হয়েছে (Visa, MasterCard, Amex সাপোর্ট করে)।'}
                    {paymentMethod === 'bank' && 'ব্যাংক ট্রান্সফার নির্বাচন করা হয়েছে। আপনার ট্রানজ্যাকশন আইডি প্রদান করে পেমেন্ট যাচাই করুন।'}
                    {paymentMethod === 'manual' && 'ম্যানুয়াল পেমেন্ট নির্বাচন করা হয়েছে। নির্দেশিকা অনুযায়ী পেমেন্ট করে ট্রানজ্যাকশন আইডি দিন।'}
                  </p>
                  {(paymentMethod === 'bank' || paymentMethod === 'manual') && (
                      <input type="text" placeholder="Transaction ID (TxID)" className="mt-3 w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                  )}
                </div>
              )}

              <button 
                onClick={handlePayment}
                disabled={!paymentMethod || isProcessing}
                className={`w-full py-4 rounded-xl text-white font-black text-base shadow-lg transition-all ${!paymentMethod ? 'bg-slate-300 cursor-not-allowed' : isProcessing ? 'bg-indigo-400 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 cursor-pointer'}`}
              >
                {isProcessing ? 'Processing Validation...' : 'Save Payment Method'}
              </button>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-5 border-b border-slate-100">
                   <h3 className="text-base font-black text-slate-800 flex items-center gap-2 m-0">
                     <Bell className="w-5 h-5 text-indigo-500" /> Notification Settings
                   </h3>
                 </div>
                 <div className="p-2">
                   <label className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                     <div>
                       <div className="text-sm font-bold text-slate-800">Subscription Expiring</div>
                       <div className="text-xs text-slate-500 mt-0.5">Get notified 7 days before expiry</div>
                     </div>
                     <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600" />
                   </label>
                   <label className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                     <div>
                       <div className="text-sm font-bold text-slate-800">Payment Successful</div>
                       <div className="text-xs text-slate-500 mt-0.5">Receive invoice via email</div>
                     </div>
                     <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600" />
                   </label>
                   <label className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                     <div>
                       <div className="text-sm font-bold text-slate-800">Renewal Reminder</div>
                       <div className="text-xs text-slate-500 mt-0.5">Auto-renewal upcoming notifications</div>
                     </div>
                     <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600" />
                   </label>
                 </div>
               </div>

               <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                 <div className="p-5 border-b border-red-100 bg-red-50/30">
                   <h3 className="text-base font-black text-red-600 flex items-center gap-2 m-0">
                     <AlertTriangle className="w-5 h-5" /> Danger Zone
                   </h3>
                 </div>
                 <div className="p-5">
                   <p className="text-sm text-slate-600 mb-4">
                     If you cancel your subscription, your businesses will be downgraded to the Free plan at the end of your current billing cycle. You will lose access to premium features like unlimited photos, offers, and featured placements.
                   </p>
                   <div className="flex flex-col sm:flex-row gap-3">
                     <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors">
                       Pause Subscription
                     </button>
                     <button className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-colors border border-red-200">
                       Cancel Subscription
                     </button>
                   </div>
                 </div>
               </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
