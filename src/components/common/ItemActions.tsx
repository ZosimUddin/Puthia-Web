import React, { useState } from 'react';
import { 
  Bookmark, Share2, Map, Phone, MessageCircle, 
  QrCode, AlertTriangle, X 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';
import { copyToClipboard } from '../../utils/clipboard';
import { UniversalReportButton } from './UniversalReportButton';

interface ItemActionsProps {
  id: string;
  type: string;
  title: string;
  phone?: string;
  location?: string;
  url?: string;
}

export const ItemActions: React.FC<ItemActionsProps> = ({ 
  id, type, title, phone, location, url 
}) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareUrl = url || window.location.href;

  React.useEffect(() => {
    if (!user) return;
    const checkFavorite = async () => {
      const favRef = doc(db, 'users', user.uid, 'favorites', `${type}_${id}`);
      const snap = await getDoc(favRef);
      if (snap.exists()) {
        setIsFavorite(true);
      }
    };
    checkFavorite();
  }, [id, type, user]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("লগইন করা প্রয়োজন!");
      return;
    }
    const favRef = doc(db, 'users', user.uid, 'favorites', `${type}_${id}`);
    if (isFavorite) {
      await deleteDoc(favRef);
      setIsFavorite(false);
    } else {
      await setDoc(favRef, { itemId: id, type, title, addedAt: new Date().toISOString() });
      setIsFavorite(true);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `দেখুন: ${title}`,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError' && !err.message.includes('Share canceled')) {
          console.error("Error sharing", err);
        }
      }
    } else {
      await copyToClipboard(shareUrl);
      alert("লিংক কপি করা হয়েছে!");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
        <button 
          onClick={toggleFavorite}
          title="পরে পড়ার জন্য সংরক্ষণ"
          className={`p-2 rounded-xl transition-all ${isFavorite ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500'}`}
        >
          <Bookmark size={16} className={isFavorite ? 'fill-current' : ''} />
        </button>
        
        <button 
          onClick={handleShare}
          title="শেয়ার করুন"
          className="p-2 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
        >
          <Share2 size={16} />
        </button>

        {location && (
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="গুগল ম্যাপে দেখুন"
            className="p-2 bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
          >
            <Map size={16} />
          </a>
        )}

        {phone && (
          <a 
            href={`https://wa.me/${phone ? (phone.startsWith('0') ? '88' + phone : phone) : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="হোয়াটসঅ্যাপে মেসেজ দিন"
            className="p-2 bg-slate-50 text-slate-500 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all"
          >
            <MessageCircle size={16} />
          </a>
        )}

        <button 
          onClick={(e) => { e.stopPropagation(); setShowQR(true); }}
          title="কিউআর কোড"
          className="p-2 bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
        >
          <QrCode size={16} />
        </button>

        <div className="ml-auto">
          <UniversalReportButton
            contentId={id}
            contentType={type}
            contentTitle={title}
            variant="icon"
          />
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowQR(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-[32px] flex flex-col items-center gap-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-slate-800">স্ক্যান করে শেয়ার করুন</h3>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <QRCode value={shareUrl || ""} size={200} />
              </div>
              <button onClick={() => setShowQR(false)} className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">
                বন্ধ করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
