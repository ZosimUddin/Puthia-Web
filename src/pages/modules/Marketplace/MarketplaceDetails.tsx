import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Phone, User, Tag, Clock, ShieldCheck, 
  ShoppingBag, MessageSquare, Navigation, Heart, ChevronLeft, 
  ChevronRight, Eye, Calendar, AlertTriangle, CheckCircle, Star, Send,
  Lock, Download, TrendingUp, BarChart3, Share2, Award, Sparkles
} from 'lucide-react';
import { MarketplaceItem } from '../../../types';
import { CATEGORIES } from './constants';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useFavorites, SavedItem } from '../../../components/FavoriteContext';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface MarketplaceDetailsProps {
  item: MarketplaceItem | null;
  onClose: () => void;
}

const MarketplaceDetails: React.FC<MarketplaceDetailsProps> = ({ item, onClose }) => {
  const { toggleSave, isSaved } = useFavorites();
  const { user, userProfile } = useAuth();
  
  const [activeImage, setActiveImage] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('fake_price');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Poster generator states
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');
  const [generatingPoster, setGeneratingPoster] = useState(false);

  if (!item) return null;

  const category = CATEGORIES.find(c => c.id === item.category);

  // HTML5 Canvas Banner Generator for Featured Sellers
  const generatePoster = () => {
    setGeneratingPoster(true);
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 800);
    grad.addColorStop(0, '#047857'); // Emerald 700
    grad.addColorStop(1, '#065f46'); // Emerald 800
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 800);

    // Decorative glowing geometric overlays
    ctx.fillStyle = 'rgba(251, 191, 36, 0.05)'; // Amber overlay
    ctx.beginPath(); ctx.arc(750, 50, 250, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(50, 750, 200, 0, Math.PI * 2); ctx.fill();

    // Golden framing line
    ctx.strokeStyle = '#f59e0b'; // Amber 500
    ctx.lineWidth = 12;
    ctx.strokeRect(24, 24, 752, 752);

    // Header label
    ctx.fillStyle = '#fbbf24'; // Yellow 400
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(150, 45, 500, 60, 16) : ctx.rect(150, 45, 500, 60);
    ctx.fill();
    
    ctx.fillStyle = '#0f172a'; // Slate 900
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('পুঠিয়া পৌর ডিজিটাল সিটিজেন পোর্টাল', 400, 82);

    // Main central cards
    const r = 32;
    ctx.beginPath();
    ctx.moveTo(80 + r, 140);
    ctx.lineTo(720 - r, 140);
    ctx.arcTo(720, 140, 720, 670, r);
    ctx.lineTo(720, 670 - r);
    ctx.arcTo(720, 670, 80, 670, r);
    ctx.lineTo(80 + r, 670);
    ctx.arcTo(80, 670, 80, 140, r);
    ctx.lineTo(80, 140 + r);
    ctx.arcTo(80, 140, 720, 140, r);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 15;
    ctx.fill();
    ctx.shadowColor = 'transparent'; // Reset

    // Subheader inside the white card
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(80 + r, 140);
    ctx.lineTo(720 - r, 140);
    ctx.arcTo(720, 140, 720, 230, r);
    ctx.lineTo(720, 230);
    ctx.lineTo(80, 230);
    ctx.lineTo(80, 140 + r);
    ctx.arcTo(80, 140, 720, 140, r);
    ctx.closePath();
    ctx.fill();

    // Render Category
    ctx.fillStyle = '#d1fae5';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(110, 165, 180, 42, 12) : ctx.rect(110, 165, 180, 42);
    ctx.fill();
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${category?.emoji || '📦'} ${category?.label || 'পণ্য'}`, 130, 191);

    // Render Trust Seal Label
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(470, 165, 220, 42, 12) : ctx.rect(470, 165, 220, 42);
    ctx.fill();
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText('🥇 গোল্ডেন ভেরিফাইড বিক্রেতা', 485, 191);

    // Title of item
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.title, 400, 310);

    // Render Item Description
    ctx.fillStyle = '#475569';
    ctx.font = 'normal 18px Arial, sans-serif';
    const cleanDesc = item.description.replace(/\n/g, ' ').slice(0, 150) + (item.description.length > 150 ? '...' : '');
    
    // Auto wrap lines
    const wrapWidth = 520;
    const wordsArr = cleanDesc.split(' ');
    const linesArr = [];
    let currentLine = '';
    
    for (let i = 0; i < wordsArr.length; i++) {
      const testLine = currentLine + wordsArr[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > wrapWidth && i > 0) {
        linesArr.push(currentLine);
        currentLine = wordsArr[i] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    linesArr.push(currentLine);
    
    let yPos = 370;
    linesArr.slice(0, 3).forEach(l => {
      ctx.fillText(l.trim(), 400, yPos);
      yPos += 28;
    });

    // Elegant separator line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 480);
    ctx.lineTo(650, 480);
    ctx.stroke();

    // Elegant pricing badge
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 55px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`৳ ${item.price.toLocaleString('bn-BD')} / ${item.unit || 'পিস'}`, 400, 560);

    // Contact badge
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(120, 600, 560, 52, 14) : ctx.rect(120, 600, 560, 52);
    ctx.fill();
    
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText(`📞 বিক্রেতা: ${item.sellerName} (ফোন: ${item.sellerPhone})`, 400, 632);

    // Footer lines
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText('পুঠিয়া পৌর ডিজিটাল মার্কেটপ্লেস ২.০', 400, 715);
    ctx.font = 'normal 13px Arial, sans-serif';
    ctx.fillText('পৌরবাসীর কেনা-বেচার বিশ্বস্ত ও নিরাপদ অনলাইন পোর্টাল', 400, 735);

    // Set URL
    const url = canvas.toDataURL('image/png');
    setPosterUrl(url);
    setGeneratingPoster(false);
    setShowPosterModal(true);
  };
  const images = item.images && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&fm=webp&q=75&w=800"];
  const date = item.createdAt ? new Date(item.createdAt) : new Date();

  const isItemSaved = isSaved(item.id);
  const isService = item.itemType === 'service';

  const handleFavoriteToggle = () => {
    const bookmarkItem: SavedItem = {
      id: item.id,
      type: isService ? 'service' : 'business',
      title: item.title,
      subtitle: `${isService ? 'সেবা' : 'পণ্য'} - ৳${item.price.toLocaleString('bn-BD')}`,
      image: images[0],
      phone: item.sellerPhone,
      address: item.location,
      categoryLabel: category?.label || 'মার্কেটপ্লেস'
    };
    toggleSave(bookmarkItem);
  };

  // WhatsApp chat template prefilled
  const whatsappText = `আসসালামু আলাইকুম, আমি আপনার পুঠিয়া পোর্টালে দেওয়া '${item.title}' (${isService ? 'সেবা' : 'পণ্য'}) বিজ্ঞাপনটি দেখেছি। এ বিষয়ে বিস্তারিত জানতে আগ্রহী।`;
  const whatsappUrl = `https://wa.me/88${item.sellerPhone}?text=${encodeURIComponent(whatsappText)}`;

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      await addDoc(collection(db, "marketplace_reports"), {
        itemId: item.id,
        itemTitle: item.title,
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        reporterId: user?.uid || 'guest',
        reporterName: userProfile?.name || 'অজ্ঞাত ইউজার',
        reporterPhone: userProfile?.phone || '',
        reason: reportReason,
        details: reportDetails,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportDetails('');
      }, 2500);
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("রিপোর্ট সাবমিট করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setReportSubmitting(false);
    }
  };

  // Helper to render rating stars
  const renderStars = (rating: number = 4.5) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} size={14} className="fill-amber-400 text-amber-400" />);
      } else {
        stars.push(<Star key={i} size={14} className="text-slate-200" />);
      }
    }
    return stars;
  };

  return (
    <div className="fixed inset-0 z-[10005] flex items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-none sm:rounded-[64px] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col lg:flex-row h-full sm:h-[90vh] relative"
      >
        {/* Left: Image Section */}
        <div className="w-full lg:w-1/2 bg-slate-100 relative h-[40vh] lg:h-full shrink-0">
          <AnimatePresence mode="wait">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={images[activeImage]} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-8 left-8 p-4 bg-white/20 backdrop-blur-md rounded-3xl text-white hover:bg-white/40 transition-all border border-white/20 z-10"
          >
            <X size={24} />
          </button>

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <div className="absolute bottom-8 left-8 flex gap-2 z-10">
                {images.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-12 h-1.5 rounded-full transition-all ${i === activeImage ? 'bg-emerald-500 w-16' : 'bg-white/40'}`}
                  />
                ))}
              </div>
              <div className="absolute bottom-8 right-8 flex gap-3 z-10">
                <button 
                  onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl text-white flex items-center justify-center hover:bg-white/40 transition-all border border-white/20"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setActiveImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl text-white flex items-center justify-center hover:bg-white/40 transition-all border border-white/20"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </>
          )}

          <div className="absolute top-8 right-8 flex gap-3 z-10">
            <div className="px-5 py-2.5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-950/20 flex items-center gap-1">
              <span>৳ {item.price.toLocaleString('bn-BD')}</span>
              {item.unit && <span className="text-xs opacity-80 font-normal">/ {item.unit}</span>}
            </div>
          </div>
        </div>

        {/* Right: Content Section */}
        <div className="flex-1 p-8 lg:p-16 overflow-y-auto bg-white flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl">
                {category?.emoji} {category?.label}
              </span>
              <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl ${
                isService 
                  ? 'bg-purple-50 text-purple-600' 
                  : item.condition === 'new' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'bg-slate-50 text-slate-600'
              }`}>
                {isService ? '🛠️ সেবা' : item.condition === 'new' ? 'নতুন' : 'ব্যবহৃত'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-1.5 text-xs font-black">
                <Eye size={16} />
                {item.views || 0} ভিউ
              </div>
              <button 
                onClick={handleFavoriteToggle}
                className={`transition-colors cursor-pointer ${isItemSaved ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
              >
                <Heart size={20} fill={isItemSaved ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-tight mb-8">
            {item.title}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-12">
            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
              <div className="flex items-center gap-3 mb-2 text-slate-400">
                <MapPin size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">অবস্থান (ইউনিয়ন)</span>
              </div>
              <p className="text-sm font-black text-slate-700">{item.location || 'পুঠিয়া'}, রাজশাহী</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
              <div className="flex items-center gap-3 mb-2 text-slate-400">
                <Calendar size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">প্রকাশের তারিখ</span>
              </div>
              <p className="text-sm font-black text-slate-700">{format(date, 'd MMMM, yyyy', { locale: bn })}</p>
            </div>
          </div>

          <div className="mb-12">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Tag size={14} className="text-emerald-500" /> {isService ? 'সেবার বিবরণ' : 'পণ্যের বর্ণনা'}
            </h4>
            <div className="p-8 bg-emerald-50/30 rounded-[40px] border border-emerald-100/50">
              <p className="text-base font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          </div>

          {/* Seller Dashboard & Analytics Panel */}
          {user?.uid === item.sellerId && (
            <div className="mb-12 p-8 bg-slate-50 rounded-[40px] border border-slate-200/60 relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" /> ব্যবসায়ী ড্যাশবোর্ড
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bold mt-1">বিজ্ঞাপন পারফরম্যান্স ও এনালাইটিক্স</p>
                </div>
                <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg ${
                  item.sellerSubscription === 'featured' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  item.sellerSubscription === 'premium' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                  'bg-slate-200/60 text-slate-500'
                }`}>
                  {item.sellerSubscription === 'featured' ? '👑 গোল্ডেন ব্যবসায়ী' :
                   item.sellerSubscription === 'premium' ? '✨ প্রিমিয়াম ব্যবসায়ী' :
                   'ফ্রি মেম্বার'}
                </span>
              </div>

              {(item.sellerSubscription === 'premium' || item.sellerSubscription === 'featured') ? (
                <div className="space-y-6">
                  {/* Grid stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 text-center">
                      <div className="text-slate-400 mb-1 flex items-center justify-center gap-1">
                        <Eye size={12} /> <span className="text-[9px] font-black uppercase tracking-wider">ভিউ</span>
                      </div>
                      <p className="text-2xl font-black text-slate-800">{item.views || 0}</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 text-center">
                      <div className="text-slate-400 mb-1 flex items-center justify-center gap-1">
                        <Navigation size={12} /> <span className="text-[9px] font-black uppercase tracking-wider">ক্লিক</span>
                      </div>
                      <p className="text-2xl font-black text-emerald-600">{Math.round((item.views || 0) * 0.72)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 text-center">
                      <div className="text-slate-400 mb-1 flex items-center justify-center gap-1">
                        <Share2 size={12} /> <span className="text-[9px] font-black uppercase tracking-wider">শেয়ার</span>
                      </div>
                      <p className="text-2xl font-black text-purple-600">{Math.round((item.views || 0) * 0.15)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 text-center">
                      <div className="text-slate-400 mb-1 flex items-center justify-center gap-1">
                        <Award size={12} /> <span className="text-[9px] font-black uppercase tracking-wider">র‍্যাংক</span>
                      </div>
                      <p className="text-2xl font-black text-amber-500">
                        {item.sellerSubscription === 'featured' ? '#১' : '#৫'}
                      </p>
                    </div>
                  </div>

                  {/* Simulated line chart */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                      <BarChart3 size={11} /> ৭ দিনের ভিজিটর পারফরম্যান্স ট্রাফিক্স
                    </p>
                    {/* SVG Line Chart */}
                    <div className="h-32 w-full flex items-end">
                      <svg viewBox="0 0 500 100" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                        <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                        <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                        
                        {/* Area glow */}
                        <path
                          d={`M 0,${100 - (item.views || 0) * 0.1} 
                             L 83,${100 - (item.views || 0) * 0.3} 
                             L 166,${100 - (item.views || 0) * 0.25} 
                             L 249,${100 - (item.views || 0) * 0.5} 
                             L 332,${100 - (item.views || 0) * 0.65} 
                             L 415,${100 - (item.views || 0) * 0.8} 
                             L 500,${100 - (item.views || 0) * 0.72} 
                             L 500,100 L 0,100 Z`}
                          fill="url(#chartGlow)"
                        />
                        {/* Line */}
                        <path
                          d={`M 0,${100 - (item.views || 0) * 0.1} 
                             L 83,${100 - (item.views || 0) * 0.3} 
                             L 166,${100 - (item.views || 0) * 0.25} 
                             L 249,${100 - (item.views || 0) * 0.5} 
                             L 332,${100 - (item.views || 0) * 0.65} 
                             L 415,${100 - (item.views || 0) * 0.8} 
                             L 500,${100 - (item.views || 0) * 0.72}`}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {/* Point circles */}
                        <circle cx="500" cy={100 - (item.views || 0) * 0.72} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" className="animate-pulse" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                      <span>সোমবার</span>
                      <span>বুধবার</span>
                      <span>শুক্রবার</span>
                      <span>আজ (রিয়েল-টাইম)</span>
                    </div>
                  </div>

                  {/* Promotional Tools */}
                  {item.sellerSubscription === 'featured' && (
                    <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/5 p-6 rounded-3xl border border-amber-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500 text-white rounded-2xl">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-amber-900">সোশ্যাল মিডিয়া প্রোমো টুলস</p>
                          <p className="text-[10px] font-bold text-amber-700/80 mt-0.5">১-ক্লিকে চমৎকার ফেসবুক প্রোমোশনাল পোস্টার ব্যানার তৈরি করুন</p>
                        </div>
                      </div>
                      <button
                        onClick={generatePoster}
                        disabled={generatingPoster}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95 transition-all"
                      >
                        {generatingPoster ? 'তৈরি করা হচ্ছে...' : '🥇 ব্যানার তৈরি করুন'}
                        <Download size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                  <div className="p-4 bg-slate-100 text-slate-400 rounded-full mb-3">
                    <Lock size={20} />
                  </div>
                  <h5 className="text-xs font-black text-slate-700 mb-1">ভিজিটর ও ক্লিক অ্যানালিটিক্স লক করা</h5>
                  <p className="text-[10px] text-slate-400 font-bold max-w-sm mb-4 leading-relaxed">
                    আপনার বিজ্ঞাপনের ইউনিক ভিজিটর গ্রাফ, সোশ্যাল শেয়ার এনালাইটিক্স এবং অটোমেটিক ব্যানার মেকার সリューション অ্যাক্সেস করতে আপনার সাবস্ক্রিপশন প্রিমিয়াম বা ফিচার্ড প্ল্যানে আপগ্রেড করুন।
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Seller Profile */}
          <div className="mt-auto space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">বিক্রেতার তথ্য ও পরিচিতি</h4>
            <div className="bg-white border border-slate-150 rounded-[40px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-5">
                {item.sellerAvatar ? (
                  <img 
                    src={item.sellerAvatar} 
                    alt={item.sellerName} 
                    className="w-16 h-16 rounded-[24px] object-cover border border-slate-200" 
                  />
                ) : (
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-[24px] flex items-center justify-center text-xl font-black shadow-inner">
                    {item.sellerName ? item.sellerName.charAt(0) : 'S'}
                  </div>
                )}
                
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <h4 className="text-lg sm:text-xl font-black text-slate-800">{item.sellerName}</h4>
                    {item.sellerVerified && (
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5" title="জাতীয় পরিচয়পত্র বা পৌরসভা দ্বারা সনাক্তকৃত">
                        <ShieldCheck size={11} fill="currentColor" className="text-indigo-600 fill-white" /> ভেরিফাইড
                      </span>
                    )}
                  </div>
                  
                  {/* Rating display */}
                  <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-slate-400 text-xs">
                    <span className="font-bold text-slate-600">{item.sellerRating || '4.5'}</span>
                    <div className="flex gap-0.5">{renderStars(item.sellerRating || 4.5)}</div>
                    <span className="text-[10px] text-slate-400">({(item.views || 0) + 1} ডিল)</span>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    সদস্য: {item.sellerMemberSince || 'আগস্ট ২০২৬'}
                  </div>
                </div>
              </div>

              {/* Action Circle buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => window.open(`sms:${item.sellerPhone}?body=${encodeURIComponent(whatsappText)}`)}
                  className="w-14 h-14 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center transition-all cursor-pointer"
                  title="এসএমএস পাঠান"
                >
                  <Navigation size={22} />
                </button>
                <div className="h-10 w-px bg-slate-100 mx-2" />
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="w-14 h-14 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl flex items-center justify-center transition-all cursor-pointer"
                  title="বিজ্ঞাপন রিপোর্ট করুন"
                >
                  <AlertTriangle size={22} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href={`tel:${item.sellerPhone}`}
                className="py-5 bg-emerald-600 text-white rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Phone size={18} /> সরাসরি কল করুন
              </a>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-5 bg-emerald-50 text-emerald-700 rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageSquare size={18} /> হোয়াটসঅ্যাপ চ্যাট
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* REPORT MODAL */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[10008] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl p-8 sm:p-10 border border-slate-100 flex flex-col relative"
            >
              <button 
                onClick={() => setShowReportModal(false)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex gap-4 items-start mb-6">
                <div className="p-3 bg-red-100 text-red-500 rounded-2xl">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">বিজ্ঞাপন রিপোর্ট করুন</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">নিরাপদ মার্কেটপ্লেস গঠনে আমাদের সাহায্য করুন</p>
                </div>
              </div>

              {reportSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-lg font-black text-slate-800">রিপোর্ট সফলভাবে জমা হয়েছে!</h4>
                  <p className="text-xs text-slate-400 font-medium">অ্যাডমিন প্যানেল খুব দ্রুত এই বিষয়টি খতিয়ে দেখবে। ধন্যবাদ!</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">অভিযোগের কারণ</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-xs text-slate-700 focus:border-red-500 focus:bg-white transition-all outline-none"
                    >
                      <option value="fake_price">ভুল দাম বা মিথ্যা বিবরণ</option>
                      <option value="spam_abuse">স্প্যাম বা অশ্লীল ছবি ও কন্টেন্ট</option>
                      <option value="fraud">প্রতারণা বা ক্রাইম সন্দেহ</option>
                      <option value="sold_already">ইতিমধ্যে বিক্রি হয়ে গেছে</option>
                      <option value="other">অন্যান্য সমস্যা</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">বিস্তারিত বিবরণ (ঐচ্ছিক)</label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      rows={4}
                      placeholder="আপনার অভিযোগটি সংক্ষেপে ব্যাখ্যা করুন..."
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-xs text-slate-700 resize-none focus:border-red-500 focus:bg-white transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="w-full py-4.5 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-100 disabled:bg-slate-200 disabled:shadow-none"
                  >
                    {reportSubmitting ? "জমাদান হচ্ছে..." : "রিপোর্ট সাবমিট করুন"}
                    <Send size={14} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROMO POSTER MODAL */}
      <AnimatePresence>
        {showPosterModal && (
          <div className="fixed inset-0 z-[10009] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl p-8 sm:p-10 border border-slate-100 flex flex-col relative"
            >
              <button 
                onClick={() => setShowPosterModal(false)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex gap-4 items-start mb-6">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">আপনার প্রমোশনাল ব্যানার</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">ফেসবুক, হোয়াটসঅ্যাপ বা ভাইবারে শেয়ার করার জন্য প্রস্তুত</p>
                </div>
              </div>

              {posterUrl && (
                <div className="space-y-6">
                  <div className="border border-slate-200 rounded-[24px] overflow-hidden shadow-inner max-h-[350px] flex items-center justify-center bg-slate-100">
                    <img src={posterUrl} alt="Puthia Marketplace Poster" className="max-w-full max-h-full object-contain" />
                  </div>

                  <a
                    href={posterUrl}
                    download={`puthia_marketplace_${item.id}.png`}
                    className="w-full py-4.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <Download size={16} /> পোস্টার ডাউনলোড করুন (PNG)
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketplaceDetails;