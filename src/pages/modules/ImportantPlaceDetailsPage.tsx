import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, ArrowLeft, Image as ImageIcon, Map as MapIcon, 
  Clock, Phone, Navigation, Share2, Heart, Info, DollarSign,
  Car, Accessibility, ShieldCheck, ChevronRight, Star
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

const PLACE_DETAILS_FALLBACK: Record<string, any> = {
  "p1": {
    name: "পুঠিয়া রাজবাড়ী",
    category: "religious",
    union: "১নং পুঠিয়া",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Puthia_Rajbari%2C_Rajshahi.jpg/800px-Puthia_Rajbari%2C_Rajshahi.jpg",
    desc: "ঐতিহাসিক পুঠিয়া রাজবাড়ী ও মন্দির চত্বর।",
    rating: 4.8,
    address: "পুঠিয়া সদর, পুঠিয়া, রাজশাহী",
    hours: "সকাল ৯:০০ - বিকাল ৫:০০ (রবিবার বন্ধ)",
    phone: "0722-XXXXXX",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3625.59779375102!2d88.825126!3d24.360677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fc177f0a6d1bb7%3A0xc6a827bcbe3d65b1!2sPuthia%20Rajbari!5e0!3m2!1sen!2sbd!4v1700000000000",
    history: "পুঠিয়া রাজবাড়ী বাংলাদেশের অন্যতম প্রত্নতাত্ত্বিক নিদর্শন। ১৮৯৫ সালে মহারানী হেমন্ত কুমারী দেবী এটি নির্মাণ করেন। এখানে রয়েছে শিব মন্দির, গোবিন্দ মন্দির, বড় আহ্নিক মন্দির এবং দোল মঞ্চ। রাজবাড়ীর বিশাল প্রাঙ্গণ এবং নান্দনিক কারুকাজ পর্যটকদের মুগ্ধ করে।",
    entryFee: "বাংলাদেশি: ২০ টাকা, সার্কভুক্ত দেশ: ১০০ টাকা, অন্যান্য বিদেশি: ২০০ টাকা",
    parking: "রাজবাড়ী সংলগ্ন বিশাল পার্কিং সুবিধা রয়েছে। বাস ও প্রাইভেট কার পার্ক করা যায়। পার্কিং ফি প্রযোজ্য।",
    accessibility: "প্রধান প্রবেশপথে হুইলচেয়ার অ্যাক্সেস রয়েছে, তবে মন্দিরের ভেতরে কিছু জায়গায় সিঁড়ি আছে।",
    gallery: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Puthia_Rajbari%2C_Rajshahi.jpg/800px-Puthia_Rajbari%2C_Rajshahi.jpg",
      "https://images.unsplash.com/photo-1596700543632-15f5c9e2b0fa?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1588667635677-440409a656db?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "p2": {
    name: "গোবিন্দ মন্দির",
    category: "religious",
    union: "১নং পুঠিয়া",
    image: "https://images.unsplash.com/photo-1596700543632-15f5c9e2b0fa?auto=format&fit=crop&q=80&w=800",
    desc: "টেরাকোটা অলংকরণে সমৃদ্ধ প্রাচীন মন্দির।",
    rating: 4.9,
    address: "রাজবাড়ী প্রাঙ্গণ, পুঠিয়া",
    hours: "সকাল ৯:০০ - বিকাল ৫:০০",
    phone: "",
    mapUrl: "",
    history: "গোবিন্দ মন্দির পুঠিয়া রাজবাড়ী চত্বরের একটি অপূর্ব নিদর্শন। ১৮২৩ থেকে ১৮৯৬ সালের মধ্যে মহারানী শরৎ সুন্দরী দেবী এই মন্দির নির্মাণ করেন। এটি একটি চারচালা মন্দির যার গায়ে অসংখ্য সুন্দর টেরাকোটা ফলক রয়েছে, যা রামায়ণ ও মহাভারতের বিভিন্ন কাহিনী চিত্রিত করে।",
    entryFee: "পুঠিয়া রাজবাড়ীর টিকিটের অন্তর্ভুক্ত।",
    parking: "রাজবাড়ী সংলগ্ন পার্কিং।",
    accessibility: "প্রধান আঙিনায় অ্যাক্সেস রয়েছে।",
    gallery: ["https://images.unsplash.com/photo-1596700543632-15f5c9e2b0fa?auto=format&fit=crop&q=80&w=800"]
  },
  "p3": {
    name: "শিব মন্দির",
    category: "religious",
    union: "১নং পুঠিয়া",
    image: "https://images.unsplash.com/photo-1588667635677-440409a656db?auto=format&fit=crop&q=80&w=800",
    desc: "বাংলাদেশের অন্যতম বৃহৎ শিব মন্দির।",
    rating: 4.8,
    address: "শিব সরোবরের পাড়ে, পুঠিয়া",
    hours: "সকাল ৯:০০ - বিকাল ৫:০০",
    phone: "",
    mapUrl: "",
    history: "১৮২৩ সালে রানী ভুবনময়ী দেবী এই বিশাল পঞ্চরত্ন শিব মন্দির নির্মাণ করেন। এটি বাংলাদেশের সবচেয়ে বড় শিব মন্দির। এটি শিব সরোবর বা শ্যামসাগর নামক বিশাল দিঘির পাড়ে অবস্থিত এবং এর নির্মাণশৈলী অত্যন্ত দৃষ্টিনন্দন।",
    entryFee: "পুঠিয়া রাজবাড়ীর টিকিটের অন্তর্ভুক্ত।",
    parking: "রাজবাড়ী সংলগ্ন পার্কিং।",
    accessibility: "প্রধান আঙিনায় অ্যাক্সেস রয়েছে, তবে মূল মন্দিরে সিঁড়ি বেয়ে উঠতে হয়।",
    gallery: ["https://images.unsplash.com/photo-1588667635677-440409a656db?auto=format&fit=crop&q=80&w=800"]
  },
  "p4": {
    name: "জগন্নাথ মন্দির",
    category: "religious",
    union: "১নং পুঠিয়া",
    image: "https://images.unsplash.com/photo-1623910384877-a859c22822a1?auto=format&fit=crop&q=80&w=800",
    desc: "পুঠিয়ার একটি প্রাচীন ও সুন্দর মন্দির।",
    rating: 4.6,
    address: "পুঠিয়া সদর",
    hours: "সকাল ৯:০০ - বিকাল ৫:০০",
    phone: "",
    mapUrl: "",
    history: "জগন্নাথ মন্দির পুঠিয়ার আরেকটি ঐতিহাসিক ও ধর্মীয় নিদর্শন। এর স্থাপত্যশৈলী ও কারুকাজ দর্শনার্থীদের মুগ্ধ করে।",
    entryFee: "ফ্রি",
    parking: "উপলব্ধ",
    accessibility: "সীমিত অ্যাক্সেসিবিলিটি।",
    gallery: ["https://images.unsplash.com/photo-1623910384877-a859c22822a1?auto=format&fit=crop&q=80&w=800"]
  },
  "p5": {
    name: "উপজেলা পরিষদ",
    category: "govt",
    union: "১নং পুঠিয়া",
    image: "https://images.unsplash.com/photo-1541887143493-2cecb93b2229?auto=format&fit=crop&q=80&w=800",
    desc: "পুঠিয়া উপজেলার প্রশাসনিক কেন্দ্র।",
    rating: 4.5,
    address: "উপজেলা পরিষদ চত্বর, পুঠিয়া",
    hours: "সকাল ৯:০০ - বিকাল ৫:০০ (শুক্র ও শনি বন্ধ)",
    phone: "0722-XXXXXX",
    mapUrl: "",
    history: "পুঠিয়া উপজেলা পরিষদ এলাকার প্রশাসনিক, উন্নয়ন ও নাগরিক সেবা প্রদানের মূল কেন্দ্র। এখানে বিভিন্ন সরকারি দপ্তর অবস্থিত।",
    entryFee: "ফ্রি",
    parking: "বিশাল পার্কিং সুবিধা রয়েছে।",
    accessibility: "নিচতলার অফিসগুলোতে হুইলচেয়ার অ্যাক্সেস রয়েছে।",
    gallery: ["https://images.unsplash.com/photo-1541887143493-2cecb93b2229?auto=format&fit=crop&q=80&w=800"]
  },
  "p6": {
    name: "পুঠিয়া থানা",
    category: "police",
    union: "১নং পুঠিয়া",
    image: "https://images.unsplash.com/photo-1588610547000-84ce2c41c7b2?auto=format&fit=crop&q=80&w=800",
    desc: "উপজেলার আইন-শৃঙ্খলা রক্ষায় প্রধান কেন্দ্র।",
    rating: 4.0,
    address: "থানা রোড, পুঠিয়া সদর",
    hours: "২৪ ঘণ্টা",
    phone: "013XX-XXXXXX",
    mapUrl: "",
    history: "পুঠিয়া মডেল থানা এলাকার আইন-শৃঙ্খলা রক্ষা, অপরাধ দমন এবং নাগরিকদের নিরাপত্তা প্রদানে কাজ করে।",
    entryFee: "প্রযোজ্য নয়",
    parking: "থানা প্রাঙ্গণে পার্কিং সুবিধা আছে।",
    accessibility: "প্রধান অফিস অ্যাক্সেসযোগ্য।",
    gallery: ["https://images.unsplash.com/photo-1588610547000-84ce2c41c7b2?auto=format&fit=crop&q=80&w=800"]
  },
  "p7": {
    name: "উপজেলা স্বাস্থ্য কমপ্লেক্স",
    category: "hospital",
    union: "১নং পুঠিয়া",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    desc: "পুঠিয়া উপজেলার প্রধান সরকারি স্বাস্থ্যসেবা কেন্দ্র।",
    rating: 4.2,
    address: "হাসপাতাল রোড, পুঠিয়া",
    hours: "২৪ ঘণ্টা (জরুরি বিভাগ)",
    phone: "017XX-XXXXXX",
    mapUrl: "",
    history: "৫০ শয্যা বিশিষ্ট এই উপজেলা স্বাস্থ্য কমপ্লেক্স স্থানীয় জনগণের স্বাস্থ্যসেবা, জরুরি চিকিৎসা এবং মাতৃ ও শিশু স্বাস্থ্য সুরক্ষায় গুরুত্বপূর্ণ ভূমিকা পালন করে।",
    entryFee: "সরকারি নিয়মানুযায়ী",
    parking: "রোগী ও অ্যাম্বুলেন্সের জন্য পার্কিং সুবিধা রয়েছে।",
    accessibility: "র‍্যাম্প এবং হুইলচেয়ার সুবিধা উপলব্ধ।",
    gallery: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"]
  },
  "p11": {
    name: "বানেশ্বর আমের হাট",
    category: "market",
    union: "৩নং বানেশ্বর",
    image: "https://images.unsplash.com/photo-1579294215915-188b62bc3465?auto=format&fit=crop&q=80&w=800",
    desc: "রাজশাহীর অন্যতম বৃহৎ আমের হাট।",
    rating: 4.7,
    address: "বানেশ্বর বাজার, ঢাকা-রাজশাহী মহাসড়ক",
    hours: "সকাল ৬:০০ - সন্ধ্যা ৭:০০ (মৌসুমে)",
    phone: "",
    mapUrl: "",
    history: "বানেশ্বর হাট রাজশাহী জেলার অন্যতম প্রাচীন এবং বৃহৎ একটি বাণিজ্যিক কেন্দ্র। আমের মৌসুমে এটি বাংলাদেশের অন্যতম বৃহৎ আমের আড়তে পরিণত হয়। দেশের বিভিন্ন স্থান থেকে ব্যাপারীরা এখান থেকে আম ক্রয় করেন।",
    entryFee: "ফ্রি",
    parking: "হাটের চারপাশে পার্কিং সুবিধা, তবে মৌসুমে প্রচুর ভিড় থাকে।",
    accessibility: "খোলা বাজার এলাকা, অ্যাক্সেসযোগ্য।",
    gallery: ["https://images.unsplash.com/photo-1579294215915-188b62bc3465?auto=format&fit=crop&q=80&w=800"]
  }
};

const ImportantPlaceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [place, setPlace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, 'important_places', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPlace(docSnap.data());
        } else {
          setPlace(PLACE_DETAILS_FALLBACK[id] || PLACE_DETAILS_FALLBACK["p1"]);
        }
      } catch (e) {
        console.error("Error loading place details", e);
        try {
          handleFirestoreError(e, OperationType.GET, `important_places/${id}`);
        } catch (err) {
          setPlace(PLACE_DETAILS_FALLBACK[id || "p1"] || PLACE_DETAILS_FALLBACK["p1"]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place?.name,
          text: place?.desc,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert("লিংকটি কপি করুন: " + window.location.href);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!place) {
    return <div className="min-h-screen flex items-center justify-center">তথ্য পাওয়া যায়নি</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors shrink-0">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-black text-slate-900 tracking-wide flex items-center gap-2 line-clamp-1">
              {place.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setIsFavorite(!isFavorite)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button onClick={handleShare} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Cover Image */}
        <div className="relative h-[300px] md:h-[400px] bg-slate-200">
          <img src={place.image || (place.gallery && place.gallery[0])} alt={place.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
             {place.rating && (
               <div className="inline-flex items-center gap-1 bg-amber-400/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-black text-amber-900 mb-4 shadow-lg">
                 <Star size={14} fill="currentColor" /> {place.rating}
               </div>
             )}
             <h1 className="text-3xl md:text-5xl font-black mb-2 shadow-sm">{place.name}</h1>
             <p className="flex items-center gap-2 text-rose-100 font-medium text-sm md:text-base"><MapPin size={16} /> {place.address}</p>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          
          {/* Quick Actions */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {place.phone && (
              <a href={`tel:${place.phone}`} className="shrink-0 flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors">
                <Phone size={18} className="text-blue-500" /> কল করুন
              </a>
            )}
            {place.mapUrl ? (
              <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-2 bg-rose-500 text-white px-5 py-3 rounded-xl font-bold shadow-md hover:bg-rose-600 hover:shadow-rose-500/25 transition-all">
                <Navigation size={18} /> দিকনির্দেশনা
              </a>
            ) : (
              <div className="shrink-0 flex items-center gap-2 bg-rose-500 text-white px-5 py-3 rounded-xl font-bold shadow-md hover:bg-rose-600 hover:shadow-rose-500/25 transition-all opacity-50 cursor-not-allowed">
                <Navigation size={18} /> দিকনির্দেশনা (শীঘ্রই আসছে)
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2"><Info size={20} className="text-rose-500" /> পরিচিতি ও ইতিহাস</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {place.history || place.desc || "এই স্থান সম্পর্কে বিস্তারিত তথ্য খুব শীঘ্রই হালনাগাদ করা হবে।"}
                </p>
              </div>

              {place.gallery && place.gallery.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> গ্যালারি</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {place.gallery.map((img: string, idx: number) => (
                      <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-slate-100">
                        <img src={img} alt={`${place.name} ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {place.mapUrl && (
                <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[300px] md:h-[400px]">
                   <iframe 
                     src={place.mapUrl}
                     width="100%" 
                     height="100%" 
                     style={{ border: 0, borderRadius: '1.25rem' }} 
                     allowFullScreen 
                     loading="lazy" 
                     referrerPolicy="no-referrer-when-downgrade"
                     title="Location Map"
                   ></iframe>
                </div>
              )}

            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <h3 className="font-black text-slate-900 mb-2">জরুরি তথ্য</h3>
                
                {place.hours && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-1">সময়সূচি</p>
                      <p className="font-bold text-slate-800 text-sm">{place.hours}</p>
                    </div>
                  </div>
                )}
                
                {place.entryFee && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-1">প্রবেশ ফি</p>
                      <p className="font-bold text-slate-800 text-sm">{place.entryFee}</p>
                    </div>
                  </div>
                )}

                {place.parking && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <Car size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-1">পার্কিং সুবিধা</p>
                      <p className="font-bold text-slate-800 text-sm">{place.parking}</p>
                    </div>
                  </div>
                )}
                
                {place.accessibility && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                      <Accessibility size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-1">অ্যাক্সেসিবিলিটি</p>
                      <p className="font-bold text-slate-800 text-sm">{place.accessibility}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="relative z-10">
                  <ShieldCheck size={28} className="text-rose-400 mb-3" />
                  <h4 className="font-black mb-2">নিরাপত্তা নির্দেশনা</h4>
                  <p className="text-sm font-medium text-slate-300 opacity-90 leading-relaxed">
                    স্থানটিতে ভ্রমণের সময় নিজস্ব জিনিসপত্র সাবধানে রাখুন। কর্তৃপক্ষের নির্দেশিকা মেনে চলুন।
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportantPlaceDetailsPage;
