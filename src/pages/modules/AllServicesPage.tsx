import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Wrench, Bookmark, Sparkles, Headset,
  Search, Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { UnifiedHeroHeader, UnifiedBottomCTA } from '../../components/common/UnifiedDesignSystem';

// @ts-ignore
import puthiaBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bg: string;
  badge?: {
    text: string;
    type: 'new' | 'popular' | 'recommended' | 'comingSoon';
  };
  counterText: string;
  lastUpdated: string;
  path: string;
  isComingSoon?: boolean;
}

const AllServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle Service Click
  const handleServiceClick = (service: ServiceItem) => {
    if (service.isComingSoon) {
      toast.info('মোবাইল অ্যাপ শীঘ্রই আসছে! সাথেই থাকুন।');
      return;
    }
    navigate(service.path);
  };

  const services: ServiceItem[] = [
    {
      id: 'tools',
      title: 'সব টুল ও ক্যালকুলেটর',
      subtitle: 'জমি, কৃষি, নির্মাণ, যাকাত ও পরিমাপ ক্যালকুলেটর',
      icon: <Wrench size={22} className="text-[#009664]" strokeWidth={2.5} />,
      bg: 'bg-emerald-50 border border-emerald-100',
      counterText: '(৫৮টি)',
      lastUpdated: '২০ জুলাই ২০২৬',
      path: '/tools'
    },
    {
      id: 'resources',
      title: 'দরকারি রিসোর্স হাব',
      subtitle: 'সরকারি সেবা, ভূমি, কৃষি, ই-সেবা ও জরুরি তথ্য',
      icon: <Bookmark size={22} className="text-blue-600" strokeWidth={2.5} />,
      bg: 'bg-blue-50 border border-blue-100',
      counterText: '(৭০+ লিংক)',
      lastUpdated: '১৯ জুলাই ২০২৬',
      path: '/resources'
    },
    {
      id: 'exclusive',
      title: 'এক্সক্লুসিভ ফিচার',
      subtitle: 'ডিজিটাল কার্ড, হারানো-পাওয়া, রক্তদান ও অন্যান্য',
      icon: <Sparkles size={22} className="text-amber-500" strokeWidth={2.5} />,
      bg: 'bg-amber-50 border border-amber-100',
      counterText: '(১২টি সেবা)',
      lastUpdated: '১৮ জুলাই ২০২৬',
      path: '/exclusive-features'
    }
  ];

  // Filter services by search query
  const filteredServices = services.filter(s => {
    return searchQuery.trim() === '' || 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.counterText.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans">
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={() => {}} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : `/${path}`);
        }} 
      />

      <main className="flex-1 pb-24 pt-0">
        <div className="animate-fade-in font-sans">
          
          {/* Unified Hero Header */}
          <UnifiedHeroHeader
            title="সকল নাগরিক সেবা"
            subtitle="আপনার প্রয়োজনীয় সকল ডিজিটাল সেবা এখন এক জায়গায় সহজলভ্য"
            rightAction={
              <button 
                onClick={() => {
                  setShowSearch(!showSearch);
                  if (showSearch) {
                    setSearchQuery("");
                  }
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                  showSearch 
                    ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                }`}
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            }
            searchQuery={showSearch ? searchQuery : undefined}
            onSearchChange={showSearch ? setSearchQuery : undefined}
            searchPlaceholder="সেবা খুঁজুন... (যেমন: জমি, আবেদন, AI, ক্যালকুলেটর)"
          >
          </UnifiedHeroHeader>

          <div className="px-4 space-y-4">

            {/* Main Services List */}
            <div className="space-y-3 pt-1">
              {filteredServices.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm space-y-3">
                  <AlertCircle size={36} className="mx-auto text-amber-500" />
                  <p className="text-sm font-bold text-slate-700">কোনো সেবা খুঁজে পাওয়া যায়নি</p>
                  <p className="text-xs text-slate-400">অনুগহ করে অন্য শব্দ দিয়ে আবার চেষ্টা করুন।</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-emerald-50 text-[#009664] font-bold text-xs rounded-xl hover:bg-emerald-100 transition inline-block mt-2 cursor-pointer"
                  >
                    সকল সেবা দেখুন
                  </button>
                </div>
              ) : (
                filteredServices.map((service, index) => {
                  return (
                    <motion.div 
                      key={service.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => handleServiceClick(service)}
                      className="w-full bg-white rounded-[20px] p-3.5 flex flex-col gap-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-100/90 hover:border-emerald-200 hover:shadow-md transition-all text-left group cursor-pointer relative"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Service Icon */}
                        <div className={`w-[50px] h-[50px] rounded-2xl ${service.bg} flex items-center justify-center shrink-0 shadow-2xs`}>
                          {service.icon}
                        </div>
                        
                        {/* Title & Subtitle */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {/* Title with Service Counter */}
                            <h3 className="text-[15px] font-black text-slate-800 group-hover:text-[#01412F] transition-colors leading-tight">
                              {service.title} <span className="text-[#009664] text-xs font-bold">{service.counterText}</span>
                            </h3>

                            {/* Badges */}
                            {service.badge && (
                              <span 
                                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border whitespace-nowrap shadow-2xs ${
                                  service.badge.type === 'new' 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : service.badge.type === 'popular'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : service.badge.type === 'recommended'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {service.badge.text}
                              </span>
                            )}
                          </div>

                          <p className="text-[12px] font-medium text-slate-500 line-clamp-1">{service.subtitle}</p>
                        </div>

                        {/* Right Actions: Chevron */}
                        <div className="flex items-center gap-1.5 shrink-0 self-center">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                            <ChevronRight size={18} className="text-slate-400 group-hover:text-[#01412F]" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>

                      {/* Last Updated Footer Bar on Card */}
                      <div className="pt-2 border-t border-slate-100/70 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-400 shrink-0" />
                          <span>সর্বশেষ হালনাগাদ: <strong className="text-slate-600 font-bold">{service.lastUpdated}</strong></span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Support Banner */}
            <UnifiedBottomCTA
              icon={<Headset size={26} />}
              title="সহায়তা প্রয়োজন?"
              description="যেকোনো তথ্যের প্রয়োজনে বা সমস্যার জন্য আমাদের নাগরিক সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করুন।"
              buttonText="যোগাযোগ করুন"
              onButtonClick={() => navigate('/contact')}
              className="mt-6"
            />

          </div>
        </div>
      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default AllServicesPage;
