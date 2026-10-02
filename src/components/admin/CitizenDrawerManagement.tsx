import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  MoveUp, 
  MoveDown, 
  Eye, 
  EyeOff, 
  Edit3, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Info, 
  ShieldCheck, 
  Headphones, 
  Shield, 
  FileSignature, 
  FileText, 
  Star, 
  AlertTriangle, 
  Download, 
  Home, 
  Sparkles, 
  Globe, 
  Phone, 
  Mail, 
  Clock, 
  Smartphone, 
  ExternalLink,
  ChevronRight,
  X,
  MessageSquare,
  Search,
  Check,
  Filter,
  Send
} from 'lucide-react';
import { 
  SiteContentService, 
  CitizenDrawerMenuItem, 
  AboutPuthiaContent, 
  UserGuidelinesContent, 
  SupportCenterConfig, 
  PolicyDocumentContent, 
  AppDownloadConfig, 
  CitizenReview, 
  CitizenComplaint,
  DEFAULT_DRAWER_ITEMS 
} from '../../services/siteContentService';
import { toast } from 'sonner';

// Helper to resolve icon component by string name
const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Info,
  ShieldCheck,
  Headphones,
  Shield,
  FileSignature,
  FileText,
  Star,
  AlertTriangle,
  Download,
  Globe,
  Sparkles,
  Phone,
  MessageSquare,
  Smartphone
};

export const CitizenDrawerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('menu_order');
  
  // Drawer items state
  const [drawerItems, setDrawerItems] = useState<CitizenDrawerMenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<CitizenDrawerMenuItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<CitizenDrawerMenuItem>>({
    label: '',
    path: '/',
    iconName: 'Globe',
    enabled: true,
    badge: '',
    badgeColor: 'bg-emerald-500'
  });

  // CMS states
  const [aboutContent, setAboutContent] = useState<AboutPuthiaContent>(SiteContentService.getAboutContent());
  const [guideContent, setGuideContent] = useState<UserGuidelinesContent>(SiteContentService.getGuideContent());
  const [supportConfig, setSupportConfig] = useState<SupportCenterConfig>(SiteContentService.getSupportConfig());
  const [privacyPolicy, setPrivacyPolicy] = useState<PolicyDocumentContent>(SiteContentService.getPrivacyPolicy());
  const [termsPolicy, setTermsPolicy] = useState<PolicyDocumentContent>(SiteContentService.getTermsPolicy());
  const [contentPolicy, setContentPolicy] = useState<PolicyDocumentContent>(SiteContentService.getContentPolicy());
  const [appConfig, setAppConfig] = useState<AppDownloadConfig>(SiteContentService.getAppDownloadConfig());
  const [reviews, setReviews] = useState<CitizenReview[]>(SiteContentService.getCitizenReviews());
  const [complaints, setComplaints] = useState<CitizenComplaint[]>(SiteContentService.getCitizenComplaints());
  
  // Filtering states for reviews/complaints
  const [reviewFilter, setReviewFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [complaintFilter, setComplaintFilter] = useState<'all' | 'pending' | 'under_review' | 'resolved' | 'rejected'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<CitizenComplaint | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Initial load
  useEffect(() => {
    setDrawerItems(SiteContentService.getDrawerItems());
  }, []);

  // Save drawer items
  const handleSaveDrawerItems = (updatedItems: CitizenDrawerMenuItem[]) => {
    setDrawerItems(updatedItems);
    SiteContentService.saveDrawerItems(updatedItems);
    toast.success('ড্রয়ার মেনু সফলভাবে আপডেট ও সংরক্ষিত হয়েছে');
  };

  // Reordering
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= drawerItems.length) return;

    const newItems = [...drawerItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalculate orders
    const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    handleSaveDrawerItems(reordered);
  };

  // Toggle enable/disable
  const toggleItemStatus = (id: string) => {
    const updated = drawerItems.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    handleSaveDrawerItems(updated);
  };

  // Delete custom item
  const handleDeleteItem = (id: string) => {
    const updated = drawerItems.filter(item => item.id !== id);
    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    handleSaveDrawerItems(reordered);
    toast.success('মেনু আইটেমটি মুছে ফেলা হয়েছে');
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সকল মেনু আইটেম ডিফল্ট বিন্যাসে ফিরিয়ে নিতে চান?')) {
      const def = SiteContentService.resetDrawerItems();
      setDrawerItems(def);
      toast.success('ডিফল্ট মেনু বিন্যাস সফলভাবে প্রতিস্থাপন করা হয়েছে');
    }
  };

  // Save Add Item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.label || !newItem.path) {
      toast.error('অনুগ্রহ করে মেনুর নাম ও লিঙ্ক প্রদান করুন');
      return;
    }
    const itemToAdd: CitizenDrawerMenuItem = {
      id: `custom-${Date.now()}`,
      label: newItem.label,
      path: newItem.path,
      iconName: newItem.iconName || 'Globe',
      enabled: true,
      order: drawerItems.length + 1,
      badge: newItem.badge || '',
      badgeColor: newItem.badgeColor || 'bg-emerald-500',
      isCustom: true
    };
    const updated = [...drawerItems, itemToAdd];
    handleSaveDrawerItems(updated);
    setShowAddModal(false);
    setNewItem({ label: '', path: '/', iconName: 'Globe', enabled: true, badge: '', badgeColor: 'bg-emerald-500' });
  };

  // Save Edit Item
  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const updated = drawerItems.map(item => item.id === editingItem.id ? editingItem : item);
    handleSaveDrawerItems(updated);
    setEditingItem(null);
  };

  // CMS Save Handlers
  const handleSaveAbout = () => {
    SiteContentService.saveAboutContent(aboutContent);
    toast.success('পুঠিয়া সম্পর্কে তথ্যাবলী সফলভাবে সংরক্ষিত হয়েছে');
  };

  const handleSaveGuide = () => {
    SiteContentService.saveGuideContent(guideContent);
    toast.success('ব্যবহার নির্দেশিকা কনটেন্ট সফলভাবে সংরক্ষিত হয়েছে');
  };

  const handleSaveSupport = () => {
    SiteContentService.saveSupportConfig(supportConfig);
    toast.success('সাপোর্ট সেন্টার সেটিংস সফলভাবে সংরক্ষিত হয়েছে');
  };

  const handleSavePrivacy = () => {
    SiteContentService.savePrivacyPolicy(privacyPolicy);
    toast.success('গোপনীয়তা নীতি সফলভাবে সংরক্ষিত হয়েছে');
  };

  const handleSaveTerms = () => {
    SiteContentService.saveTermsPolicy(termsPolicy);
    toast.success('শর্তাবলী সফলভাবে সংরক্ষিত হয়েছে');
  };

  const handleSaveContentPolicy = () => {
    SiteContentService.saveContentPolicy(contentPolicy);
    toast.success('ডাটা ও কনটেন্ট নীতি সফলভাবে সংরক্ষিত হয়েছে');
  };

  const handleSaveAppConfig = () => {
    SiteContentService.saveAppDownloadConfig(appConfig);
    toast.success('অ্যাপ ডাউনলোড কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে');
  };

  // Reviews actions
  const updateReviewStatus = (id: string, status: 'approved' | 'rejected') => {
    const updated = reviews.map(r => r.id === id ? { ...r, status } : r);
    setReviews(updated);
    SiteContentService.saveCitizenReviews(updated);
    toast.success(`রিভিউ স্ট্যাটাস "${status === 'approved' ? 'অনুমোদিত' : 'বাতিল'}" করা হয়েছে`);
  };

  const deleteReview = (id: string) => {
    const updated = reviews.filter(r => r.id !== id);
    setReviews(updated);
    SiteContentService.saveCitizenReviews(updated);
    toast.success('রিভিউ মুছে ফেলা হয়েছে');
  };

  // Complaints actions
  const updateComplaintStatus = (status: CitizenComplaint['status']) => {
    if (!selectedComplaint) return;
    const updated = complaints.map(c => 
      c.id === selectedComplaint.id 
        ? { 
            ...c, 
            status, 
            resolutionNote: resolutionText || c.resolutionNote,
            resolvedDate: status === 'resolved' ? new Date().toISOString().split('T')[0] : c.resolvedDate 
          } 
        : c
    );
    setComplaints(updated);
    SiteContentService.saveCitizenComplaints(updated);
    setSelectedComplaint(null);
    setResolutionText('');
    toast.success('অভিযোগের সমাধান স্ট্যাটাস আপডেট করা হয়েছে');
  };

  return (
    <div className="w-full space-y-6 pb-20 font-sans text-slate-800">
      
      {/* Master Emerald Header */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Menu size={220} />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-emerald-950 rounded-full text-xs font-black shadow-xs">
              <Sparkles size={13} /> সুপার অ্যাডমিন মাস্টার কন্ট্রোল
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-xs">
              নাগরিক পোর্টাল ও ড্রয়ার মেনু সিষ্টেম
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            সিটিজেন ড্রয়ার মেনু ও ১০টি পাবলিক পেজ ম্যানেজমেন্ট
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-3xl leading-relaxed">
            নাগরিক পোর্টালের সাইড ড্রয়ারে প্রদর্শিত হোম, পুঠিয়া সম্পর্কে, ব্যবহার নির্দেশিকা, সাপোর্ট সেন্টার, গোপনীয়তা নীতি, শর্তাবলী, ডাটা নীতি, রিভিউ, অভিযোগ ও অ্যাপ ডাউনলোড পেজগুলোর দৃশ্যমানতা, ক্রম ও সকল কনটেন্ট সরাসরি নিয়ন্ত্রণ করুন।
          </p>
        </div>

        {/* Global Tabs Navigation */}
        <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 mt-6 pt-4 border-t border-white/15 scrollbar-none no-scrollbar touch-pan-x">
          {[
            { id: 'menu_order', label: '📱 ড্রয়ার মেনু ক্রম ও দৃশ্যমানতা', icon: Menu },
            { id: 'about_cms', label: '🏛️ পুঠিয়া সম্পর্কে (CMS)', icon: Info },
            { id: 'guide_cms', label: '📖 ব্যবহার নির্দেশিকা (CMS)', icon: ShieldCheck },
            { id: 'support_cms', label: '🎧 সাপোর্ট সেন্টার কনফিগ', icon: Headphones },
            { id: 'privacy_cms', label: '🛡️ গোপনীয়তা নীতি (CMS)', icon: Shield },
            { id: 'terms_cms', label: '📝 শর্তাবলী (CMS)', icon: FileSignature },
            { id: 'content_cms', label: '📄 ডাটা ও কনটেন্ট নীতি', icon: FileText },
            { id: 'reviews_cms', label: '⭐ রিভিউ ও মতামত মডারেশন', icon: Star },
            { id: 'complaints_cms', label: '⚠️ অভিযোগ ও পরামর্শ সেল', icon: AlertTriangle },
            { id: 'app_cms', label: '📥 মোবাইল অ্যাপ ও APK হাব', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0 flex-shrink-0 min-w-max ${
                  isActive 
                    ? 'bg-white text-emerald-950 shadow-md font-black' 
                    : 'bg-white/15 text-white hover:bg-white/25 font-bold'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DRAWER MENU ORDER & VISIBILITY CONTROL */}
      {activeTab === 'menu_order' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main List Management */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">ড্রয়ার মেনু আইটেম তালিকা ({drawerItems.length} টি)</h3>
                <p className="text-xs text-slate-400 font-bold">টগল করে চালু/বন্ধ করুন, ক্রম পরিবর্তন করুন বা নাম এডিট করুন</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToDefault}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="ডিফল্ট অবস্থানে ফিরিয়ে নিন"
                >
                  <RotateCcw size={14} /> রিসেট
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Plus size={14} /> নতুন আইটেম যুক্ত করুন
                </button>
              </div>
            </div>

            {/* Drag & Reorder List */}
            <div className="space-y-3">
              {drawerItems.map((item, index) => {
                const IconComponent = ICON_MAP[item.iconName] || Globe;
                return (
                  <div 
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      item.enabled 
                        ? 'bg-white border-slate-200/80 shadow-2xs hover:border-emerald-200' 
                        : 'bg-slate-50 border-slate-200/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <button
                          disabled={index === 0}
                          onClick={() => moveItem(index, 'up')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-700 disabled:opacity-20 cursor-pointer"
                        >
                          <MoveUp size={14} />
                        </button>
                        <span className="text-[10px] font-black text-slate-400">{index + 1}</span>
                        <button
                          disabled={index === drawerItems.length - 1}
                          onClick={() => moveItem(index, 'down')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-700 disabled:opacity-20 cursor-pointer"
                        >
                          <MoveDown size={14} />
                        </button>
                      </div>

                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        item.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        <IconComponent size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-800 truncate">{item.label}</h4>
                          {item.badge && (
                            <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-emerald-500'}`}>
                              {item.badge}
                            </span>
                          )}
                          {item.isCustom && (
                            <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                              কাস্টম
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.path}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleItemStatus(item.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          item.enabled 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title={item.enabled ? 'হাইড করুন' : 'শো করুন'}
                      >
                        {item.enabled ? <Eye size={15} /> : <EyeOff size={15} />}
                        <span className="hidden sm:inline">{item.enabled ? 'দৃশ্যমান' : 'লুকায়িত'}</span>
                      </button>

                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 size={15} />
                      </button>

                      {item.isCustom && (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smartphone Live Drawer Preview */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-emerald-700" />
                <h4 className="text-sm font-black text-slate-800">লাইভ ড্রয়ার প্রিভিউ</h4>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                নাগরিক ভিউ
              </span>
            </div>

            {/* Mobile Drawer Visual Mockup */}
            <div className="border-4 border-slate-800 rounded-3xl overflow-hidden shadow-lg bg-slate-50 max-w-[280px] mx-auto">
              {/* Mockup Header */}
              <div className="bg-gradient-to-br from-[#006a4e] to-[#004d3d] p-4 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow">
                    <span className="text-[#006a4e] font-black text-lg">P</span>
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-white leading-tight">আমাদের পুঠিয়া</h5>
                    <p className="text-[8px] text-emerald-200 uppercase tracking-wider font-bold">Citizen Portal</p>
                  </div>
                </div>
              </div>

              {/* Mockup Items */}
              <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto no-scrollbar">
                {drawerItems.filter(i => i.enabled).map((item) => {
                  const Icon = ICON_MAP[item.iconName] || Globe;
                  return (
                    <div key={item.id} className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Icon size={14} />
                      </div>
                      <span className="text-xs font-black text-slate-700 truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[8px] font-bold text-white px-1.5 py-0.2 rounded-full ml-auto ${item.badgeColor || 'bg-emerald-500'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center font-medium">
              সুপার অ্যাডমিনের প্রতিটি পরিবর্তন তাৎক্ষণিক নাগরিক অ্যাপ ও ওয়েব ড্রয়ারে সিঙ্ক হয়।
            </p>
          </div>

        </div>
      )}

      {/* TAB 2: ABOUT PUTHIA CMS */}
      {activeTab === 'about_cms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Info size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">"পুঠিয়া সম্পর্কে" পেজ কনটেন্ট এডিটর</h3>
                <p className="text-xs text-slate-400 font-bold">ঐতিহাসিক তথ্য, আয়তন, জনসংখ্যা ও দর্শনীয় স্থানের বিবরণ পরিবর্তন করুন</p>
              </div>
            </div>
            <button
              onClick={handleSaveAbout}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Save size={15} /> সংরক্ষণ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">পেজের মূল শিরোনাম</label>
              <input
                type="text"
                value={aboutContent.title}
                onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">সাব-টাইটেল বা সংক্ষিপ্ত বিবরণ</label>
              <input
                type="text"
                value={aboutContent.subtitle}
                onChange={(e) => setAboutContent({ ...aboutContent, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <label className="text-[11px] font-bold text-slate-400">মোট আয়তন (বর্গ কিমি)</label>
              <input
                type="text"
                value={aboutContent.areaSqKm}
                onChange={(e) => setAboutContent({ ...aboutContent, areaSqKm: e.target.value })}
                className="w-full bg-transparent font-black text-sm text-slate-800 outline-none"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <label className="text-[11px] font-bold text-slate-400">জনসংখ্যা</label>
              <input
                type="text"
                value={aboutContent.population}
                onChange={(e) => setAboutContent({ ...aboutContent, population: e.target.value })}
                className="w-full bg-transparent font-black text-sm text-slate-800 outline-none"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <label className="text-[11px] font-bold text-slate-400">ইউনিয়ন ও পৌরসভা</label>
              <input
                type="text"
                value={aboutContent.unionsCount}
                onChange={(e) => setAboutContent({ ...aboutContent, unionsCount: e.target.value })}
                className="w-full bg-transparent font-black text-sm text-slate-800 outline-none"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <label className="text-[11px] font-bold text-slate-400">মোট গ্রাম সংখ্যা</label>
              <input
                type="text"
                value={aboutContent.villagesCount}
                onChange={(e) => setAboutContent({ ...aboutContent, villagesCount: e.target.value })}
                className="w-full bg-transparent font-black text-sm text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">পুঠিয়ার ইতিহাস ও ঐতিহ্য বিবরণ</label>
            <textarea
              rows={4}
              value={aboutContent.historyText}
              onChange={(e) => setAboutContent({ ...aboutContent, historyText: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">ভৌগোলিক সীমানা ও অবস্থান বিবরণ</label>
            <textarea
              rows={3}
              value={aboutContent.geographyText}
              onChange={(e) => setAboutContent({ ...aboutContent, geographyText: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">প্রশাসন ও সিস্টেম ওনারের বার্তা</label>
            <textarea
              rows={2}
              value={aboutContent.leadershipMessage}
              onChange={(e) => setAboutContent({ ...aboutContent, leadershipMessage: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
        </div>
      )}

      {/* TAB 3: USER GUIDELINES CMS */}
      {activeTab === 'guide_cms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">"ব্যবহার নির্দেশিকা" কনটেন্ট ও FAQ এডিটর</h3>
                <p className="text-xs text-slate-400 font-bold">নাগরিক সেবা গ্রহণের নির্দেশিকা ও জিজ্ঞাসিত প্রশ্নাবলী পরিচালনা করুন</p>
              </div>
            </div>
            <button
              onClick={handleSaveGuide}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Save size={15} /> সংরক্ষণ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">নির্দেশিকা পেজ শিরোনাম</label>
              <input
                type="text"
                value={guideContent.title}
                onChange={(e) => setGuideContent({ ...guideContent, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">সংক্ষিপ্ত ভূমিকা</label>
              <input
                type="text"
                value={guideContent.subtitle}
                onChange={(e) => setGuideContent({ ...guideContent, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Service Apply Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">ধাপে ধাপে সেবা আবেদনের ধাপসমূহ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {guideContent.serviceApplySteps.map((step, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                      {step.step}
                    </span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const updated = [...guideContent.serviceApplySteps];
                        updated[idx].title = e.target.value;
                        setGuideContent({ ...guideContent, serviceApplySteps: updated });
                      }}
                      className="font-black text-xs text-slate-800 bg-transparent outline-none flex-1 border-b border-dashed border-slate-300 pb-0.5"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={step.desc}
                    onChange={(e) => {
                      const updated = [...guideContent.serviceApplySteps];
                      updated[idx].desc = e.target.value;
                      setGuideContent({ ...guideContent, serviceApplySteps: updated });
                    }}
                    className="w-full text-[11px] text-slate-600 bg-transparent outline-none resize-none font-medium"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* FAQs List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">সাধারণ প্রশ্ন ও উত্তর (FAQ)</h4>
            <div className="space-y-3">
              {guideContent.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...guideContent.faqs];
                      updated[idx].question = e.target.value;
                      setGuideContent({ ...guideContent, faqs: updated });
                    }}
                    className="w-full font-black text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                    placeholder="প্রশ্ন লিখুন..."
                  />
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...guideContent.faqs];
                      updated[idx].answer = e.target.value;
                      setGuideContent({ ...guideContent, faqs: updated });
                    }}
                    className="w-full text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                    placeholder="উত্তর লিখুন..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT CENTER CONFIG */}
      {activeTab === 'support_cms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Headphones size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">সাপোর্ট সেন্টার ও হেল্পলাইন কনফিগারেশন</h3>
                <p className="text-xs text-slate-400 font-bold">নাগরিক সাপোর্ট ডেস্ক, জরুরি ফোন নম্বর ও অফিস সময়সূচী নির্ধারণ করুন</p>
              </div>
            </div>
            <button
              onClick={handleSaveSupport}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Save size={15} /> সংরক্ষণ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">জরুরি সাপোর্ট ইমেইল</label>
              <input
                type="email"
                value={supportConfig.emergencyEmail}
                onChange={(e) => setSupportConfig({ ...supportConfig, emergencyEmail: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">হোয়াটসঅ্যাপ হেল্পলাইন</label>
              <input
                type="text"
                value={supportConfig.whatsappNumber}
                onChange={(e) => setSupportConfig({ ...supportConfig, whatsappNumber: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">সাপোর্ট অফিস কর্মঘণ্টা</label>
              <input
                type="text"
                value={supportConfig.officeHours}
                onChange={(e) => setSupportConfig({ ...supportConfig, officeHours: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Hotlines list */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">সার্বক্ষণিক হটলাইন নম্বরসমূহ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {supportConfig.hotlines.map((hotline, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={hotline.label}
                      onChange={(e) => {
                        const updated = [...supportConfig.hotlines];
                        updated[idx].label = e.target.value;
                        setSupportConfig({ ...supportConfig, hotlines: updated });
                      }}
                      className="font-bold text-xs text-slate-700 bg-transparent outline-none w-full"
                    />
                    <input
                      type="text"
                      value={hotline.number}
                      onChange={(e) => {
                        const updated = [...supportConfig.hotlines];
                        updated[idx].number = e.target.value;
                        setSupportConfig({ ...supportConfig, hotlines: updated });
                      }}
                      className="font-black text-sm text-emerald-700 bg-transparent outline-none w-full"
                    />
                  </div>
                  <span className="text-[10px] font-black px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                    {hotline.available}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY POLICY CMS */}
      {activeTab === 'privacy_cms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">"গোপনীয়তা নীতি" (Privacy Policy) এডিটর</h3>
                <p className="text-xs text-slate-400 font-bold">নাগরিক ডাটা সুরক্ষা, নিরাপত্তা ও গোপনীয়তার নীতিমালা নির্ধারণ করুন</p>
              </div>
            </div>
            <button
              onClick={handleSavePrivacy}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Save size={15} /> সংরক্ষণ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700">পলিসি শিরোনাম</label>
              <input
                type="text"
                value={privacyPolicy.title}
                onChange={(e) => setPrivacyPolicy({ ...privacyPolicy, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700">সর্বশেষ সংশোধনের তারিখ</label>
              <input
                type="text"
                value={privacyPolicy.lastUpdated}
                onChange={(e) => setPrivacyPolicy({ ...privacyPolicy, lastUpdated: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            {privacyPolicy.sections.map((sec, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => {
                    const updated = [...privacyPolicy.sections];
                    updated[idx].title = e.target.value;
                    setPrivacyPolicy({ ...privacyPolicy, sections: updated });
                  }}
                  className="w-full font-black text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                />
                <textarea
                  rows={3}
                  value={sec.content}
                  onChange={(e) => {
                    const updated = [...privacyPolicy.sections];
                    updated[idx].content = e.target.value;
                    setPrivacyPolicy({ ...privacyPolicy, sections: updated });
                  }}
                  className="w-full text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: TERMS POLICY CMS */}
      {activeTab === 'terms_cms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <FileSignature size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">"শর্তাবলী" (Terms & Conditions) এডিটর</h3>
                <p className="text-xs text-slate-400 font-bold">পোর্টাল ব্যবহারের সাধারণ শর্তাবলী ও আইনি নীতিমালা পরিচালনা করুন</p>
              </div>
            </div>
            <button
              onClick={handleSaveTerms}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Save size={15} /> সংরক্ষণ করুন
            </button>
          </div>

          <div className="space-y-4">
            {termsPolicy.sections.map((sec, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => {
                    const updated = [...termsPolicy.sections];
                    updated[idx].title = e.target.value;
                    setTermsPolicy({ ...termsPolicy, sections: updated });
                  }}
                  className="w-full font-black text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                />
                <textarea
                  rows={3}
                  value={sec.content}
                  onChange={(e) => {
                    const updated = [...termsPolicy.sections];
                    updated[idx].content = e.target.value;
                    setTermsPolicy({ ...termsPolicy, sections: updated });
                  }}
                  className="w-full text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DATA & CONTENT POLICY CMS */}
      {activeTab === 'content_cms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">"ডাটা ও কনটেন্ট নীতি" (Content Policy) এডিটর</h3>
                <p className="text-xs text-slate-400 font-bold">ইউজার জেনারেটেড কন্টেন্ট (UGC) ও কপিরাইট নীতিমালা পরিবর্তন করুন</p>
              </div>
            </div>
            <button
              onClick={handleSaveContentPolicy}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Save size={15} /> সংরক্ষণ করুন
            </button>
          </div>

          <div className="space-y-4">
            {contentPolicy.sections.map((sec, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => {
                    const updated = [...contentPolicy.sections];
                    updated[idx].title = e.target.value;
                    setContentPolicy({ ...contentPolicy, sections: updated });
                  }}
                  className="w-full font-black text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                />
                <textarea
                  rows={3}
                  value={sec.content}
                  onChange={(e) => {
                    const updated = [...contentPolicy.sections];
                    updated[idx].content = e.target.value;
                    setContentPolicy({ ...contentPolicy, sections: updated });
                  }}
                  className="w-full text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: REVIEWS & FEEDBACK MODERATION */}
      {activeTab === 'reviews_cms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Star size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">নাগরিক রিভিউ ও রেটিং মডারেশন</h3>
                <p className="text-xs text-slate-400 font-bold">নাগরিকদের মতামত অনুমোদন, রিপ্লাই ও মডারেশন করুন</p>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(['all', 'approved', 'pending', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setReviewFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                    reviewFilter === st ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all' && 'সকল'}
                  {st === 'approved' && 'অনুমোদিত'}
                  {st === 'pending' && 'পেন্ডিং'}
                  {st === 'rejected' && 'বাতিল'}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews
              .filter(r => reviewFilter === 'all' || r.status === reviewFilter)
              .map((rev) => (
                <div key={rev.id} className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-800">{rev.userName}</h4>
                        <span className="text-xs font-bold text-amber-500 flex items-center">
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">({rev.date})</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                        ক্যাটাগরি: {rev.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {rev.status !== 'approved' && (
                        <button
                          onClick={() => updateReviewStatus(rev.id, 'approved')}
                          className="p-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg text-xs font-bold cursor-pointer"
                          title="অনুমোদন করুন"
                        >
                          <Check size={14} /> অনুমোদন
                        </button>
                      )}
                      {rev.status !== 'rejected' && (
                        <button
                          onClick={() => updateReviewStatus(rev.id, 'rejected')}
                          className="p-1.5 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg text-xs font-bold cursor-pointer"
                          title="বাতিল করুন"
                        >
                          <X size={14} /> বাতিল
                        </button>
                      )}
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                    "{rev.comment}"
                  </p>

                  {rev.adminReply && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 font-medium">
                      <span className="font-black text-emerald-800">অ্যাডমিন রিপ্লাই:</span> {rev.adminReply}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 9: COMPLAINTS & GRIEVANCES REDRESSAL */}
      {activeTab === 'complaints_cms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">নাগরিক অভিযোগ ও পরামর্শ প্রতিকার সেল</h3>
                <p className="text-xs text-slate-400 font-bold">নাগরিকদের সরাসরি পাঠানো অভিযোগসমূহের ট্র্যাকিং ও সমাধান পরিচালনা</p>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
              {(['all', 'pending', 'under_review', 'resolved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setComplaintFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer whitespace-nowrap ${
                    complaintFilter === st ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all' && 'সকল'}
                  {st === 'pending' && 'পেন্ডিং'}
                  {st === 'under_review' && 'তদন্তাধীন'}
                  {st === 'resolved' && 'সমাধানকৃত'}
                  {st === 'rejected' && 'বাতিল'}
                </button>
              ))}
            </div>
          </div>

          {/* Complaints Grid */}
          <div className="space-y-4">
            {complaints
              .filter(c => complaintFilter === 'all' || c.status === complaintFilter)
              .map((comp) => (
                <div key={comp.id} className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-800">{comp.subject}</span>
                        <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          {comp.trackingId}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          comp.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                          comp.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                          comp.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {comp.status === 'resolved' ? 'সমাধানকৃত' :
                           comp.status === 'under_review' ? 'তদন্তাধীন' :
                           comp.status === 'rejected' ? 'বাতিল' : 'পেন্ডিং'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold mt-1">
                        দাখিলকারী: {comp.citizenName} • {comp.phone} • {comp.union} • তারিখ: {comp.submittedDate}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedComplaint(comp);
                        setResolutionText(comp.resolutionNote || '');
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition cursor-pointer self-start sm:self-center"
                    >
                      সমাধান / স্ট্যাটাস পরিবর্তন
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs text-slate-700 font-medium leading-relaxed">
                    {comp.description}
                  </div>

                  {comp.resolutionNote && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                      <span className="font-black text-emerald-800">অফিসিয়াল সমাধান নোট:</span> {comp.resolutionNote}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 10: APP DOWNLOAD & APK HUB CMS */}
      {activeTab === 'app_cms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Download size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">মোবাইল অ্যাপ ও APK রিলিজ হাব</h3>
                <p className="text-xs text-slate-400 font-bold">অ্যাপ ডাউনলোড লিংক, ভার্সন কোড, সাইজ ও চেঞ্জলগ নিয়ন্ত্রণ করুন</p>
              </div>
            </div>
            <button
              onClick={handleSaveAppConfig}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Save size={15} /> সংরক্ষণ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">অ্যাপের পূর্ণ নাম</label>
              <input
                type="text"
                value={appConfig.appName}
                onChange={(e) => setAppConfig({ ...appConfig, appName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">লেটেস্ট ভার্সন (Version)</label>
              <input
                type="text"
                value={appConfig.version}
                onChange={(e) => setAppConfig({ ...appConfig, version: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">APK সাইজ</label>
              <input
                type="text"
                value={appConfig.apkSizeMb}
                onChange={(e) => setAppConfig({ ...appConfig, apkSizeMb: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">সরাসরি APK ডাউনলোড URL</label>
              <input
                type="text"
                value={appConfig.apkDownloadUrl}
                onChange={(e) => setAppConfig({ ...appConfig, apkDownloadUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">Google Play Store লিঙ্ক</label>
              <input
                type="text"
                value={appConfig.playStoreUrl}
                onChange={(e) => setAppConfig({ ...appConfig, playStoreUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Force Update Toggle */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-black text-amber-900">বাধ্যতামূলক আপডেট (Force Update Alert)</h4>
              <p className="text-[11px] text-amber-700 font-medium">চালু রাখলে পুরাতন ভার্সন ব্যবহারকারীদের সরাসরি ডাউনলোড পেজে রিডাইরেক্ট করবে।</p>
            </div>
            <button
              onClick={() => setAppConfig({ ...appConfig, forceUpdateRequired: !appConfig.forceUpdateRequired })}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                appConfig.forceUpdateRequired ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {appConfig.forceUpdateRequired ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
            </button>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[999] backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-slate-800">নতুন ড্রয়ার মেনু আইটেম</h4>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">মেনুর লেবেল / নাম</label>
                <input
                  type="text"
                  required
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  placeholder="যেমন: ই-লাইব্রেরি"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">লিঙ্ক / পাথ (Path)</label>
                <input
                  type="text"
                  required
                  value={newItem.path}
                  onChange={(e) => setNewItem({ ...newItem, path: e.target.value })}
                  placeholder="যেমন: /library বা https://..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">ব্যাজ (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={newItem.badge}
                    onChange={(e) => setNewItem({ ...newItem, badge: e.target.value })}
                    placeholder="যেমন: নতুন"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">আইকন</label>
                  <select
                    value={newItem.iconName}
                    onChange={(e) => setNewItem({ ...newItem, iconName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    {Object.keys(ICON_MAP).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm"
                >
                  যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ITEM MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-[999] backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-slate-800">মেনু আইটেম সম্পাদনা</h4>
              <button onClick={() => setEditingItem(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">মেনুর লেবেল / নাম</label>
                <input
                  type="text"
                  required
                  value={editingItem.label}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">লিঙ্ক / পাথ (Path)</label>
                <input
                  type="text"
                  required
                  value={editingItem.path}
                  onChange={(e) => setEditingItem({ ...editingItem, path: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">ব্যাজ (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={editingItem.badge || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                    placeholder="যেমন: ৪.৯ ★"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">আইকন</label>
                  <select
                    value={editingItem.iconName}
                    onChange={(e) => setEditingItem({ ...editingItem, iconName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    {Object.keys(ICON_MAP).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLAINT STATUS MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 z-[999] backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-800">অভিযোগের সমাধান ও স্ট্যাটাস</h4>
                <p className="text-xs text-slate-400 font-bold">ট্র্যাকিং: {selectedComplaint.trackingId}</p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <p className="font-bold text-slate-500">বিষয়: {selectedComplaint.subject}</p>
                <p className="font-medium text-slate-700 mt-1">{selectedComplaint.description}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">অফিসিয়াল সমাধান বা গৃহীত পদক্ষেপের নোট</label>
                <textarea
                  rows={3}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="নাগরিককে অবগত করার জন্য পদক্ষেপের বিবরণ লিখুন..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-black text-slate-700">স্ট্যাটাস নির্ধারণ করুন:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => updateComplaintStatus('pending')}
                    className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    পেন্ডিং
                  </button>
                  <button
                    onClick={() => updateComplaintStatus('under_review')}
                    className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    তদন্তাধীন
                  </button>
                  <button
                    onClick={() => updateComplaintStatus('resolved')}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs"
                  >
                    সমাধানকৃত
                  </button>
                  <button
                    onClick={() => updateComplaintStatus('rejected')}
                    className="py-2.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
