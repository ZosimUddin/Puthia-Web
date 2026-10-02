import React from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Phone, Star, Camera, Truck, CreditCard, Globe, Navigation, MessageCircle, Heart, Share2, MessageSquare, Clock, CheckCircle2, Store, Facebook, Gift } from 'lucide-react';
import { useFavorites } from './FavoriteContext';

interface BusinessDetailsModalProps {
  business: any;
  onClose: () => void;
  categories: any[];
  allBusinesses?: any[];
}

export const BusinessDetailsModal = ({ business, onClose, categories, allBusinesses }: BusinessDetailsModalProps) => {
  const { toggleFollow, isFollowing } = useFavorites();
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [reviewText, setReviewText] = React.useState("");
  const [rating, setRating] = React.useState(5);
  
  if (!business) return null;
  
  const categoryLabel = categories.find(c => c.id === business.category)?.label || business.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[24px] shadow-2xl flex flex-col relative"
      >
        {/* Cover Photo */}
        <div className="relative h-64 sm:h-80 w-full shrink-0">
          <img src={business.image || business.logo} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
          
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer border border-white/10">
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-6 left-6 right-6 flex items-end gap-5">
            <img src={business.logo} alt={business.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg bg-white object-cover shrink-0" />
            <div className="text-white pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/20">
                  {categoryLabel}
                </span>
                {business.verified && (
                  <span className="bg-emerald-500/90 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-sm border border-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ভেরিফাইড
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black mb-1 leading-tight">{business.name}</h1>
              <div className="flex items-center gap-4 text-sm sm:text-base opacity-90 font-medium">
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-emerald-500" /> {Number(business.rating).toFixed(1)} ({business.reviews} রিভিউ)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Content (Details) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Description / About */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-500" /> ব্যবসা সম্পর্কে
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {business.description || `${business.name} একটি স্বনামধন্য ${categoryLabel} প্রতিষ্ঠান, যা পুঠিয়ার ${business.address} এলাকায় অবস্থিত। আমরা আমাদের গ্রাহকদের সর্বোচ্চ মানের সেবা প্রদান করতে প্রতিশ্রুতিবদ্ধ।`}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                {business.homeDelivery && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-100/50">
                    <Truck className="w-4 h-4" /> হোম ডেলিভারি উপলব্ধ
                  </span>
                )}
                {business.paymentMethods && business.paymentMethods.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-100/50">
                    <CreditCard className="w-4 h-4" /> পেমেন্ট: {business.paymentMethods.join(", ")}
                  </span>
                )}
              </div>
            </section>
            
            {/* Offers / Discounts */}
            {business.offerBanner && (
              <section className="bg-gradient-to-r from-rose-50 to-orange-50 p-6 rounded-2xl shadow-sm border border-rose-100/50">
                <h3 className="text-lg font-bold text-rose-600 mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5" /> বিশেষ অফার
                </h3>
                <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg m-0">{business.offerBanner}</h4>
                    <p className="text-sm text-slate-500 m-0 mt-0.5">অফারটি সীমিত সময়ের জন্য প্রযোজ্য।</p>
                  </div>
                </div>
              </section>
            )}
            
            {/* Gallery (Mock) */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-500" /> ফটো গ্যালারি
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="aspect-square rounded-xl overflow-hidden bg-slate-200">
                    <img src={business.image || business.logo} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </section>
            
            {/* Reviews (Mock) */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> কাস্টমার রিভিউ
                </h3>
                <button 
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Star className="w-4 h-4" /> {showReviewForm ? 'বাতিল' : 'রিভিউ দিন'}
                </button>
              </div>

              {showReviewForm && (
                <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-3 text-sm">আপনার অভিজ্ঞতা শেয়ার করুন</h4>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-emerald-500 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={reviewText || ""}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="আপনার মতামত লিখুন..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px] mb-3"
                  />
                  <button 
                    onClick={() => {
                      if(!reviewText.trim()) return alert("দয়া করে কিছু লিখুন");
                      alert("ধন্যবাদ! আপনার রিভিউ সফলভাবে জমা হয়েছে।");
                      setShowReviewForm(false);
                      setReviewText("");
                      setRating(5);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm cursor-pointer"
                  >
                    রিভিউ সাবমিট করুন
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {[1, 2].map((review) => (
                  <div key={review} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                        {review === 1 ? 'A' : 'R'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{review === 1 ? 'আহমেদ রিয়াদ' : 'রাকিবুল হাসান'}</div>
                        <div className="flex text-emerald-500">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < 5 ? 'fill-current' : 'text-slate-200'}`} />)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">খুব ভালো সার্ভিস। আমি অত্যন্ত সন্তুষ্ট। আবার আসবো ইনশাআল্লাহ।</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
          
          {/* Right Content (Sidebar) */}
          <div className="space-y-6">
            
            {/* Action Buttons */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
              <a 
                href={`tel:${business.phone}`} 
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 no-underline"
              >
                <Phone className="w-4 h-4" /> কল করুন
              </a>
              <div className="grid grid-cols-2 gap-3">
                {business.whatsapp && (
                  <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noreferrer" className="py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 no-underline border border-green-200">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {business.facebook && (
                  <a href={business.facebook} target="_blank" rel="noreferrer" className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 no-underline border border-blue-200">
                    <Facebook className="w-4 h-4" /> Facebook
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noreferrer" className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 no-underline border border-slate-200">
                    <Globe className="w-4 h-4" /> ওয়েবসাইট
                  </a>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button 
                  onClick={() => toggleFollow({ id: business.id, type: 'business', name: business.name, location: business.address, phone: business.phone, category: business.category })}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${isFollowing(business.id) ? 'bg-rose-50 text-rose-500 border-rose-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  <Heart className={`w-4 h-4 ${isFollowing(business.id) ? 'fill-current' : ''}`} /> সেভ করুন
                </button>
                <button onClick={() => navigator.share ? navigator.share({ title: business.name, text: 'এই ব্যবসাটি দেখুন!', url: window.location.href }).catch(() => {}) : alert('শেয়ার ফিচারটি আপনার ব্রাউজারে সাপোর্ট করে না')} className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer text-xs font-bold">
                  <Share2 className="w-4 h-4" /> শেয়ার
                </button>
              </div>

              <button onClick={() => alert("QR কোড ফিচারটি ডেভেলপমেন্ট পর্যায়ে আছে।")} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer text-xs font-bold mt-3">
                  <div className="w-4 h-4 rounded-sm border-[1.5px] border-slate-700 grid grid-cols-2 gap-[1px] p-[1px] shrink-0">
                      <div className="bg-slate-700"></div><div className="bg-slate-700"></div><div className="bg-slate-700"></div><div className="bg-transparent"></div>
                  </div>
                  QR কোড দেখুন
              </button>
            </div>
            
            {/* Info Box */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-base font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">যোগাযোগের ঠিকানা</h3>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-0.5">ঠিকানা</p>
                  <p className="text-sm text-slate-600">{business.address}</p>
                  {business.union && <p className="text-sm text-slate-500">{business.union}</p>}
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-0.5">ফোন নম্বর</p>
                  <p className="text-sm text-slate-600">{business.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className={`w-5 h-5 shrink-0 mt-0.5 ${business.isOpen ? 'text-emerald-500' : 'text-rose-500'}`} />
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-0.5">সময়সূচী</p>
                  <p className={`text-sm font-bold ${business.isOpen ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {business.isOpen ? 'এখন খোলা আছে' : 'এখন বন্ধ'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">প্রতিদিন সকাল ৯টা থেকে রাত ৮টা</p>
                </div>
              </div>
              
              <a 
                href={business.mapLink}
                target="_blank"
                rel="noreferrer" 
                className="w-full mt-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 no-underline border border-blue-100"
              >
                <Navigation className="w-4 h-4" /> ম্যাপে দেখুন
              </a>
            </div>

            {/* Related Businesses */}
            {allBusinesses && allBusinesses.length > 0 && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-base font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">অনুরূপ ব্যবসা</h3>
                <div className="space-y-3">
                  {allBusinesses
                    .filter((b: any) => b.category === business.category && b.id !== business.id)
                    .slice(0, 3)
                    .map((related: any) => (
                      <div key={related.id} className="flex items-center gap-3">
                        <img src={related.logo || related.image} alt={related.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200" />
                        <div>
                          <p className="text-sm font-bold text-slate-800 line-clamp-1">{related.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] bg-amber-50 text-amber-600 px-1 py-0.5 rounded font-bold flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-current" /> {Number(related.rating).toFixed(1)}</span>
                            <span className="text-[10px] text-slate-500 line-clamp-1">{related.address}</span>
                          </div>
                        </div>
                      </div>
                  ))}
                  {allBusinesses.filter((b: any) => b.category === business.category && b.id !== business.id).length === 0 && (
                    <p className="text-sm text-slate-500">কোন অনুরূপ ব্যবসা পাওয়া যায়নি।</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
};
