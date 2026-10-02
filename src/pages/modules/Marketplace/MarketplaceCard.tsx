import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Tag, Trash2, Edit, Star, Heart, Clock, Eye, CheckCircle, Sparkles } from 'lucide-react';
import { MarketplaceItem } from '../../../types';
import { CATEGORIES } from './constants';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useFavorites, SavedItem } from '../../../components/FavoriteContext';

interface MarketplaceCardProps {
  item: MarketplaceItem;
  onSelect: (item: MarketplaceItem) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  onEdit?: (item: MarketplaceItem, e: React.MouseEvent) => void;
  isOwner?: boolean;
  isStaff?: boolean;
  isFeatured?: boolean;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ 
  item, 
  onSelect, 
  onDelete, 
  onEdit,
  isOwner, 
  isStaff,
  isFeatured
}) => {
  const { toggleSave, isSaved } = useFavorites();
  const category = CATEGORIES.find(c => c.id === item.category);
  const date = item.createdAt ? new Date(item.createdAt) : new Date();
  
  const isItemSaved = isSaved(item.id);
  const isService = item.itemType === 'service';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const bookmarkItem: SavedItem = {
      id: item.id,
      type: isService ? 'service' : 'business',
      title: item.title,
      subtitle: `${isService ? 'সেবা' : 'পণ্য'} - ৳${item.price.toLocaleString('bn-BD')}`,
      image: (item.images && item.images[0]) || item.imageUrl || '',
      phone: item.sellerPhone,
      address: item.location,
      categoryLabel: category?.label || 'মার্কেটপ্লেস'
    };
    toggleSave(bookmarkItem);
  };

  const sellerSub = item.sellerSubscription || 'free';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onClick={() => onSelect(item)}
      className={`bg-white rounded-[40px] overflow-hidden border transition-all group flex flex-col cursor-pointer relative h-full ${
        sellerSub === 'featured' 
          ? 'ring-4 ring-amber-400 border-amber-300 shadow-xl shadow-amber-500/10' 
          : sellerSub === 'premium'
            ? 'ring-2 ring-purple-400/70 border-purple-200 shadow-lg shadow-purple-500/5'
            : isFeatured || item.isFeatured
              ? 'ring-2 ring-amber-400 border-amber-200'
              : 'border-slate-150'
      }`}
    >
      {/* Featured Badge */}
      {(sellerSub === 'featured' || isFeatured || item.isFeatured) && (
        <div className={`absolute top-6 left-6 z-20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl ${
          sellerSub === 'featured'
            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-900 shadow-amber-500/20 animate-shimmer'
            : 'bg-amber-500 text-white shadow-amber-500/20'
        }`}>
          <Star size={10} fill="currentColor" />
          {sellerSub === 'featured' ? '🥇 গোল্ডেন ব্যবসায়ী' : 'ফিচার্ড'}
        </div>
      )}

      {sellerSub === 'premium' && (
        <div className="absolute top-6 left-6 z-20 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-xl shadow-purple-500/20">
          <Sparkles size={10} fill="currentColor" />
          🥈 প্রিমিয়াম ব্যবসায়ী
        </div>
      )}

      {/* Heart/Favorite Button */}
      <button 
        onClick={handleFavoriteClick}
        className={`absolute top-6 right-6 z-20 w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg border ${
          isItemSaved 
            ? 'bg-rose-50 border-rose-200 text-rose-500' 
            : 'bg-white/90 backdrop-blur-md border-white/20 text-slate-400 hover:text-rose-500'
        }`}
      >
        <Heart size={18} fill={isItemSaved ? "currentColor" : "none"} />
      </button>

      {/* Image Area */}
      <div className="aspect-[4/3] relative overflow-hidden shrink-0">
        <img 
          src={(item.images && item.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&fm=webp&q=75&w=600"} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
          <div className="px-4 py-2 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20 flex items-center gap-1">
            <span>৳ {item.price.toLocaleString('bn-BD')}</span>
            {item.unit && <span className="text-[11px] opacity-80 font-normal">/ {item.unit}</span>}
          </div>
          <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <Clock size={11} />
            {format(date, 'd MMM', { locale: bn })}
          </div>
        </div>
      </div>
      
      {/* Details */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
            {category?.emoji} {category?.label || 'অন্যান্য'}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
            isService 
              ? 'bg-purple-50 text-purple-600' 
              : item.condition === 'new' 
                ? 'bg-blue-50 text-blue-600' 
                : 'bg-slate-50 text-slate-600'
          }`}>
            {isService ? '🛠️ সেবা' : item.condition === 'new' ? 'নতুন' : 'ব্যবহৃত'}
          </span>
          
          {sellerSub === 'featured' && (
            <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <CheckCircle size={10} className="fill-amber-100" /> গোল্ড ব্যবসায়ী
            </span>
          )}
          {sellerSub === 'premium' && (
            <span className="text-[10px] font-black text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <CheckCircle size={10} className="fill-purple-100" /> প্রিমিয়াম ব্যবসায়ী
            </span>
          )}
          {item.sellerVerified && sellerSub === 'free' && (
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <CheckCircle size={10} className="fill-indigo-100" /> ভেরিফাইড
            </span>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-1">
          {item.title}
        </h3>

        <p className="text-xs sm:text-sm font-bold text-slate-400 line-clamp-2 h-[2.5rem] mb-6 leading-relaxed">
          {item.description}
        </p>

        {/* Owner/Staff controls if applicable */}
        {(isOwner || isStaff) && (onEdit || onDelete) && (
          <div className="flex gap-2 mb-4 p-2 bg-slate-50 rounded-2xl border border-slate-100">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item, e);
                }}
                className="flex-1 py-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black border border-slate-200 hover:border-emerald-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Edit size={12} /> এডিট
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id, e);
                }}
                className="flex-1 py-2 bg-white hover:bg-rose-50 text-rose-500 rounded-xl text-xs font-black border border-slate-200 hover:border-rose-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 size={12} /> ডিলিট
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <MapPin size={18} />
            </div>
            <div>
              <div className="text-[11px] font-black text-slate-800 line-clamp-1 max-w-[120px]">{item.location}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">পুঠিয়া, রাজশাহী</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-black text-slate-400 mr-2">
              <Eye size={12} />
              {item.views || 0}
            </div>
            <button 
              className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm min-h-[44px] min-w-[44px]"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`tel:${item.sellerPhone}`);
              }}
            >
              <Phone size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketplaceCard;
