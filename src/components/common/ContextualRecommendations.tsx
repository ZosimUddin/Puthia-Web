import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Hospital, 
  Activity, 
  Ambulance, 
  Droplet, 
  Stethoscope, 
  Pill, 
  Truck, 
  Wrench, 
  Wifi, 
  BookOpen, 
  BookMarked, 
  Award, 
  Car, 
  Navigation, 
  Fuel, 
  Laptop, 
  Briefcase, 
  Store, 
  FileCheck, 
  Flame, 
  Phone, 
  ArrowRight, 
  Star,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { 
  getContextualRecommendations, 
  trackUserBrowsing, 
  RecommendationCategory, 
  RecommendedItem 
} from '../../services/recommendationEngine';

// Icon Map
const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Hospital,
  Activity,
  Ambulance,
  Droplet,
  Stethoscope,
  Pill,
  Truck,
  Wrench,
  Wifi,
  BookOpen,
  BookMarked,
  Award,
  Car,
  Navigation,
  Fuel,
  Laptop,
  Briefcase,
  Store,
  FileCheck,
  Flame
};

interface ContextualRecommendationsProps {
  category?: RecommendationCategory | string;
  contextTitle?: string;
  customHeading?: string;
  customSubtitle?: string;
  limit?: number;
  className?: string;
  compact?: boolean;
}

export const ContextualRecommendations: React.FC<ContextualRecommendationsProps> = ({
  category = 'default',
  contextTitle,
  customHeading,
  customSubtitle,
  limit = 4,
  className = '',
  compact = false
}) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);

  useEffect(() => {
    // Record user activity
    const safeCat = (category as RecommendationCategory) || 'default';
    trackUserBrowsing(safeCat, contextTitle);

    // Fetch matching contextual items
    const items = getContextualRecommendations(category, limit);
    setRecommendations(items);
  }, [category, contextTitle, limit]);

  if (recommendations.length === 0) return null;

  // Title Bengali mapping
  const getDefaultHeading = () => {
    switch (category) {
      case 'doctor':
        return 'আপনার জন্য প্রস্তাবিত কাছাকাছি হাসপাতাল ও ডায়াগনস্টিক';
      case 'health':
      case 'hospital':
        return 'হাসপাতাল সংলগ্ন প্রস্তাবিত ডাক্তার ও সেবা';
      case 'house_rent':
        return 'বাসা পরিবর্তন ও গৃহস্থালি প্রয়োজনীয় সেবা';
      case 'education':
        return 'শিক্ষার্থীদের জন্য প্রস্তাবিত বইপত্র ও কোচিং';
      case 'transport':
      case 'vehicle':
        return 'যাতায়াত ও ফুয়েল পাম্প প্রস্তাবনা';
      case 'jobs':
        return 'ক্যারিয়ার ও ফ্রিল্যান্সিং সম্পর্কিত সুযোগ';
      case 'business':
        return 'সম্পর্কিত ভেরিফাইড দোকান ও ব্যবসা';
      default:
        return 'আপনার আগ্রহের ভিত্তিতে প্রস্তাবিত সেবা';
    }
  };

  const headingText = customHeading || getDefaultHeading();
  const subtitleText = customSubtitle || (contextTitle ? `"${contextTitle}" দেখার ভিত্তিতে তৈরি পরামর্শ` : 'আপনার প্রয়োজনীয় সম্ভাব্য সেবাগুলো একঝলকে');

  if (compact) {
    return (
      <div className={`bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-slate-50 rounded-2xl p-4 border border-emerald-100/80 shadow-2xs text-left font-sans ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              {headingText}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              {subtitleText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {recommendations.map((item) => {
            const IconComp = ICON_COMPONENTS[item.iconName] || Hospital;
            return (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                className="bg-white p-2.5 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-2 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${item.bgColor} ${item.color}`}>
                    <IconComp size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded block w-max truncate">
                      {item.badge}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h5>
                  </div>
                </div>

                <ChevronRight size={14} className="text-slate-400 group-hover:text-emerald-600 shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-emerald-900/40 text-left font-sans relative overflow-hidden ${className}`}>
      {/* Background Decorative Blur */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/40 pb-4 mb-5 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                স্মার্ট রিকমেন্ডেশন
              </span>
              {contextTitle && (
                <span className="text-[10px] text-slate-300 font-mono truncate max-w-[180px] hidden sm:inline-block">
                  ভিউড: {contextTitle}
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-white leading-tight mt-0.5">
              {headingText}
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              {subtitleText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/services')}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition border border-emerald-700/50 cursor-pointer flex items-center gap-1 shrink-0"
        >
          <span>সব দেখুন</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {recommendations.map((item) => {
          const IconComp = ICON_COMPONENTS[item.iconName] || Hospital;
          return (
            <div
              key={item.id}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-4 text-slate-900 border border-white/20 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
              onClick={() => navigate(item.path)}
            >
              <div>
                {/* Badge & Icon Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.color} shrink-0 group-hover:scale-110 transition-transform`}>
                    <IconComp size={20} />
                  </div>
                  <span className={`text-[10px] font-black ${item.color} ${item.bgColor} px-2 py-0.5 rounded-full border ${item.borderColor} truncate`}>
                    {item.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h4 className="text-sm font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5 line-clamp-2">
                  {item.description}
                </p>

                {/* Phone or Location info */}
                {(item.phone || item.location) && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    {item.phone && (
                      <div className="flex items-center gap-1.5 font-mono text-emerald-700 font-bold">
                        <Phone size={12} className="shrink-0" />
                        <span>{item.phone}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-1.5 text-slate-500 truncate">
                        <MapPin size={12} className="shrink-0 text-slate-400" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-2 flex items-center justify-between text-xs font-black text-emerald-700 group-hover:text-emerald-800">
                <span>{item.actionText || 'বিস্তারিত'}</span>
                <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContextualRecommendations;
