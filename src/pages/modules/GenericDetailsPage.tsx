import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Share2, Heart, MapPin, Phone, Globe, Facebook, Image as ImageIcon 
} from 'lucide-react';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';

interface GenericDetailsPageProps {
  defaultTitle?: string;
  defaultType?: string;
}

const DUMMY_DATA: Record<string, any> = {
  "administration": {
    title: "উপজেলা পরিচিতি",
    description: "পুঠিয়া উপজেলা বাংলাদেশের রাজশাহী জেলার একটি প্রশাসনিক এলাকা। প্রাচীন ইতিহাস ও ঐতিহ্যে ঘেরা এই উপজেলা শিক্ষা, সংস্কৃতি ও কৃষিতে এক সমৃদ্ধ জনপদ। এখানে রয়েছে ঐতিহ্যবাহী পুঠিয়া রাজবাড়ী ও অনেক প্রাচীন মন্দির।",
    coverImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=1200",
    phone: "01700-000000",
    website: "http://puthia.rajshahi.gov.bd",
    facebook: "https://facebook.com",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14540.231267448553!2d88.825227!3d24.368735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fc17a783685e13%3A0xc3f8373b3791ab91!2sPuthia%20Upazila!5e0!3m2!1sen!2sbd!4v1715424578123!5m2!1sen!2sbd",
    gallery: [
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=400"
    ]
  },
  "history": {
    title: "ইতিহাস ও ঐতিহ্য",
    description: "পুঠিয়া রাজবাড়ী এবং এর সংলগ্ন মন্দিরগুলো বাংলাদেশের অন্যতম প্রত্নতাত্ত্বিক নিদর্শন। ১৮৯৫ সালে মহারানী হেমন্ত কুমারী দেবী এই দৃষ্টিনন্দন রাজবাড়ীটি নির্মাণ করেন। এখানকার পোড়ামাটির ফলকগুলো বাংলার প্রাচীন শিল্পকলার এক অনন্য নিদর্শন।",
    coverImage: "https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&q=80&w=1200",
    phone: "",
    website: "http://puthia.rajshahi.gov.bd",
    facebook: "",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3635.086708709325!2d88.8315183149925!3d24.360819984291884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fc17a5c89df96d%3A0x7d6b38c234a9b5f9!2sPuthia%20Rajbari!5e0!3m2!1sen!2sbd!4v1715424578123!5m2!1sen!2sbd",
    gallery: [
      "https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400"
    ]
  },
  "default": {
    title: "তথ্য বিবরণী",
    description: "এই পেজটিতে বিস্তারিত তথ্য দেওয়া হয়েছে। খুব শিগগিরই এখানে আরও হালনাগাদ তথ্য যুক্ত করা হবে।",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
    phone: "01700-000000",
    website: "https://example.com",
    facebook: "https://facebook.com",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14540.231267448553!2d88.825227!3d24.368735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fc17a783685e13%3A0xc3f8373b3791ab91!2sPuthia%20Upazila!5e0!3m2!1sen!2sbd!4v1715424578123!5m2!1sen!2sbd",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=400"
    ]
  }
};

const GenericDetailsPage: React.FC<GenericDetailsPageProps> = ({ defaultTitle, defaultType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathType = location.pathname.split("/").pop() || defaultType || "default";
  const [isFavorite, setIsFavorite] = useState(false);

  // Get data based on path or use default
  let data = DUMMY_DATA[pathType];
  if (!data) {
    data = { ...DUMMY_DATA["default"] };
    if (defaultTitle) {
      data.title = defaultTitle;
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: window.location.href,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError' && !error.message.includes('Share canceled')) {
          console.log("Error sharing", error);
        }
      }
    } else {
      alert("Sharing is not supported in this browser.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-5xl mx-auto pb-32">
        {/* Top App Bar inside main to float over image or above it */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isFavorite ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Heart size={20} className={isFavorite ? "fill-current" : ""} />
            </button>
            <button 
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <img 
            src={data.coverImage} 
            alt={data.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl md:text-5xl font-black text-white mb-2"
            >
              {data.title}
            </motion.h1>
          </div>
        </div>

        <div className="px-4 py-8 md:px-8 max-w-4xl mx-auto space-y-10">
          
          {/* Quick Actions / Contact Info */}
          <div className="flex flex-wrap gap-4">
            {data.phone && (
              <a href={`tel:${data.phone}`} className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-100 transition-colors">
                <Phone size={18} />
                <span>কল করুন</span>
              </a>
            )}
            {data.website && (
              <a href={data.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 transition-colors">
                <Globe size={18} />
                <span>ওয়েবসাইট</span>
              </a>
            )}
            {data.facebook && (
              <a href={data.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-100 transition-colors">
                <Facebook size={18} />
                <span>ফেসবুক</span>
              </a>
            )}
          </div>

          {/* Description */}
          <section>
            <h3 className="text-xl font-black text-slate-800 mb-4 border-b border-slate-200 pb-2">বিস্তারিত তথ্য</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
              {data.description}
            </p>
          </section>

          {/* Map */}
          {data.mapUrl && (
            <section>
              <h3 className="flex items-center gap-2 text-xl font-black text-slate-800 mb-4 border-b border-slate-200 pb-2">
                <MapPin size={24} className="text-emerald-500" />
                <span>লোকেশন / ম্যাপ</span>
              </h3>
              <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                <iframe 
                  src={data.mapUrl}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </section>
          )}

          {/* Image Gallery */}
          {data.gallery && data.gallery.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-xl font-black text-slate-800 mb-4 border-b border-slate-200 pb-2">
                <ImageIcon size={24} className="text-emerald-500" />
                <span>গ্যালারি</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.gallery.map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                    <img 
                      src={img} 
                      alt="Gallery" 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
};

export default GenericDetailsPage;
