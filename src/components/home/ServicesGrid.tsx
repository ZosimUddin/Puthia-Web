import React, { useState, useEffect } from "react";
import {
  Stethoscope, Hospital, Activity, Compass, Droplet, Car, HeartPulse, Flame, ShieldAlert,
  Gavel, Lightbulb, Store, Pill, Scroll, Bus, Train, Home as HomeIcon, ShoppingBag,
  Hotel, Utensils, MapPin, Warehouse, Hammer, Leaf, Zap, GraduationCap, Truck,
  Play, Sparkles, Moon, Newspaper, Mic, Video, Tent, Trophy, Globe, Coins,
  HelpingHand, Heart, Cross, Syringe, Landmark, ShieldCheck, Building2, BadgeCheck,
  Building, Map, Sun, Trees, Milestone, Navigation, Route, Bike, Fuel, Laptop,
  BookMarked, Library, Cpu, Monitor, QrCode, Wifi, Wrench, FileCheck, Sprout, Star, Search
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import { ServicesGridService, HomepageGridServiceItem, DEFAULT_64_SERVICES_GRID } from "../../services/servicesGridService";

// Helper map to convert string icon names to Lucide icon components
const ICON_MAP: Record<string, React.ReactNode> = {
  Stethoscope: <Stethoscope size={24} />,
  Hospital: <Hospital size={24} />,
  Activity: <Activity size={24} />,
  Compass: <Compass size={24} />,
  Droplet: <Droplet size={24} />,
  Car: <Car size={24} />,
  HeartPulse: <HeartPulse size={24} />,
  Flame: <Flame size={24} />,
  ShieldAlert: <ShieldAlert size={24} />,
  Gavel: <Gavel size={24} />,
  Lightbulb: <Lightbulb size={24} />,
  Store: <Store size={24} />,
  Pill: <Pill size={24} />,
  Scroll: <Scroll size={24} />,
  Bus: <Bus size={24} />,
  Train: <Train size={24} />,
  Home: <HomeIcon size={24} />,
  ShoppingBag: <ShoppingBag size={24} />,
  Hotel: <Hotel size={24} />,
  Utensils: <Utensils size={24} />,
  MapPin: <MapPin size={24} />,
  Warehouse: <Warehouse size={24} />,
  Hammer: <Hammer size={24} />,
  Leaf: <Leaf size={24} />,
  Zap: <Zap size={24} />,
  GraduationCap: <GraduationCap size={24} />,
  Truck: <Truck size={24} />,
  Play: <Play size={24} />,
  Sparkles: <Sparkles size={24} />,
  Moon: <Moon size={24} />,
  Newspaper: <Newspaper size={24} />,
  Mic: <Mic size={24} />,
  Video: <Video size={24} />,
  Tent: <Tent size={24} />,
  Trophy: <Trophy size={24} />,
  Globe: <Globe size={24} />,
  Coins: <Coins size={24} />,
  HelpingHand: <HelpingHand size={24} />,
  Heart: <Heart size={24} />,
  Cross: <Cross size={24} />,
  Syringe: <Syringe size={24} />,
  Landmark: <Landmark size={24} />,
  ShieldCheck: <ShieldCheck size={24} />,
  Building2: <Building2 size={24} />,
  BadgeCheck: <BadgeCheck size={24} />,
  Building: <Building size={24} />,
  Map: <Map size={24} />,
  Sun: <Sun size={24} />,
  Trees: <Trees size={24} />,
  Milestone: <Milestone size={24} />,
  Navigation: <Navigation size={24} />,
  Route: <Route size={24} />,
  Bike: <Bike size={24} />,
  Fuel: <Fuel size={24} />,
  Laptop: <Laptop size={24} />,
  BookMarked: <BookMarked size={24} />,
  Library: <Library size={24} />,
  Cpu: <Cpu size={24} />,
  Monitor: <Monitor size={24} />,
  QrCode: <QrCode size={24} />,
  Wifi: <Wifi size={24} />,
  Wrench: <Wrench size={24} />,
  FileCheck: <FileCheck size={24} />,
  Sprout: <Sprout size={24} />
};

export const renderGridIcon = (iconName: string): React.ReactNode => {
  return ICON_MAP[iconName] || <Sparkles size={24} />;
};

interface ServicesGridProps {
  onServiceClick?: (path: string) => void;
  onSeeAllClick?: () => void;
  hideHeader?: boolean;
}

// Convert English digits to Bengali digits
const toBengaliNumber = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)]);
};

const getServiceBgColor = (item: HomepageGridServiceItem): string => {
  if (!item.bgColor || item.bgColor === 'bg-emerald-50 text-emerald-600') {
    const match = DEFAULT_64_SERVICES_GRID.find(d => d.id === item.id);
    return match?.bgColor || 'bg-teal-50 text-teal-600';
  }
  return item.bgColor;
};

const ServicesGrid: React.FC<ServicesGridProps> = ({ onServiceClick, hideHeader = false }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<HomepageGridServiceItem[]>(() => 
    DEFAULT_64_SERVICES_GRID.filter(item => item.enabled)
  );

  useEffect(() => {
    const unsubscribe = ServicesGridService.subscribeToServicesGrid((items) => {
      setServices(items.filter(item => item.enabled));
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, []);

  const handleItemClick = (path: string) => {
    if (onServiceClick) {
      onServiceClick(path);
      return;
    }
    navigate(path);
  };

  return (
    <section className="pt-2 sm:pt-4 pb-1 sm:pb-2 px-3 sm:px-6 max-w-7xl mx-auto w-full" id="services-grid-section">
      {!hideHeader && (
        <SectionHeader
          title="এক নজরে সকল সেবা"
          subtitle="আপনার প্রয়োজনীয় সকল তথ্য ও সেবা এক জায়গায়"
          count={`${toBengaliNumber(services.length)}টি সেবা`}
          buttonText=""
          centered={true}
        />
      )}

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-4 py-2">
        {services.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handleItemClick(item.path)}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center py-3 px-1 sm:py-3.5 sm:px-2 bg-white rounded-[22px] sm:rounded-[20px] border border-slate-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 cursor-pointer group text-center select-none min-h-[96px] sm:min-h-[108px] relative"
          >
            {item.badge && (
              <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-black rounded-full leading-none shadow-2xs z-10 ${item.badgeColor || 'bg-amber-500 text-white'}`}>
                {item.badge}
              </span>
            )}
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[18px] sm:rounded-2xl ${getServiceBgColor(item)} flex items-center justify-center mb-1.5 transition-all duration-200 shrink-0 group-hover:scale-105 shadow-2xs`}>
              {React.isValidElement(renderGridIcon(item.iconName)) 
                ? React.cloneElement(renderGridIcon(item.iconName) as React.ReactElement<any>, { 
                    size: 22,
                    className: "stroke-[2.2]"
                  }) 
                : renderGridIcon(item.iconName)}
            </div>
            <span className="text-[11.5px] sm:text-xs font-black text-slate-800 group-hover:text-emerald-700 leading-tight text-center line-clamp-2 px-0.5 tracking-tight">
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default ServicesGrid;
