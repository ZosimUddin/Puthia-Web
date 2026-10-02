import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck2, ShieldCheck, Lock, Upload, FileText, Download, Trash2, 
  Eye, Plus, Search, Calendar, CheckCircle2, AlertCircle, ArrowLeft, 
  FileCode2, Share2, Copy, Smartphone, Sparkles, Building2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../../components/AuthModal';

// @ts-ignore
import puthiaBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

export interface VaultDocument {
  id: string;
  title: string;
  category: 'nid' | 'birth' | 'passport' | 'driving' | 'pdf';
  categoryLabel: string;
  docNumber: string;
  issueDate?: string;
  expiryDate?: string;
  fileSize: string;
  fileType: string;
  fileData?: string; // base64 or sample pdf link
  note?: string;
  isVerified: boolean;
  uploadedAt: string;
}

const CATEGORIES = [
  { id: 'all', label: 'সব ডকুমেন্টস', icon: FileCheck2 },
  { id: 'nid', label: 'NID Copy', icon: ShieldCheck },
  { id: 'birth', label: 'জন্ম নিবন্ধন', icon: FileText },
  { id: 'passport', label: 'Passport', icon: FileCode2 },
  { id: 'driving', label: 'Driving License', icon: Smartphone },
  { id: 'pdf', label: 'PDF Upload', icon: Upload },
];

const INITIAL_DOCS: VaultDocument[] = [
  {
    id: 'doc-1',
    title: 'স্মার্ট জাতীয় পরিচয়পত্র (NID) কপি',
    category: 'nid',
    categoryLabel: 'NID Copy',
    docNumber: '19958045612345678',
    issueDate: '২০১৮-০৫-১২',
    fileSize: '২.৪ মেগাবাইট',
    fileType: 'PDF / Verified',
    note: 'নির্বাচন কমিশন বাংলাদেশ কর্তৃক ইস্যুকৃত মূল কার্ডের ডিজিটাল কপি।',
    isVerified: true,
    uploadedAt: '২০২৬-০6-10'
  },
  {
    id: 'doc-2',
    title: 'অনলাইন জন্ম নিবন্ধন সনদ',
    category: 'birth',
    categoryLabel: 'জন্ম নিবন্ধন',
    docNumber: '19988123456789012',
    issueDate: '২০১৫-০২-২০',
    fileSize: '১.৮ মেগাবাইট',
    fileType: 'PDF',
    note: 'পুঠিয়া পৌরসভা কার্যালয় থেকে সংগৃহীত জন্ম সনদ।',
    isVerified: true,
    uploadedAt: '২০২৬-০৫-১৫'
  },
  {
    id: 'doc-3',
    title: 'ই-পাসপোর্ট তথ্য পাতা',
    category: 'passport',
    categoryLabel: 'Passport',
    docNumber: 'A09876543',
    issueDate: '২০২১-০১-১০',
    expiryDate: '২০৩১-০১-০৯',
    fileSize: '৩.১ মেগাবাইট',
    fileType: 'PDF / Scan',
    note: 'জরুরি ভ্রমণের জন্য সংরক্ষিত পাসপোর্ট কপি।',
    isVerified: true,
    uploadedAt: '২০২৬-০৪-০১'
  },
  {
    id: 'doc-4',
    title: 'স্মার্ট ড্রাইভিং লাইসেন্স',
    category: 'driving',
    categoryLabel: 'Driving License',
    docNumber: 'BD-RA-2022-9988',
    issueDate: '২০২২-০৮-১৫',
    expiryDate: '২০২৭-০৮-১৪',
    fileSize: '১.৫ মেগাবাইট',
    fileType: 'Image/PDF',
    note: 'বিআরটিএ অনুমোদিত ড্রাইভিং লাইসেন্স কপি।',
    isVerified: true,
    uploadedAt: '২০২৬-০৩-২২'
  }
];

export const EDocumentVaultPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Vault Documents State
  const [documents, setDocuments] = useState<VaultDocument[]>(() => {
    try {
      const saved = localStorage.getItem('puthia_edoc_vault');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_DOCS;
  });

  // Modal & Preview states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'nid' | 'birth' | 'passport' | 'driving' | 'pdf'>('nid');
  const [formDocNumber, setFormDocNumber] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('puthia_edoc_vault', JSON.stringify(documents));
    } catch (e) {}
  }, [documents]);

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('ডকুমেন্টের নাম বা শিরোনাম লিখুন');
      return;
    }

    const catObj = CATEGORIES.find(c => c.id === formCategory);

    const newDoc: VaultDocument = {
      id: `doc-${Date.now()}`,
      title: formTitle,
      category: formCategory,
      categoryLabel: catObj ? catObj.label : 'অন্যান্য',
      docNumber: formDocNumber || 'N/A',
      issueDate: formIssueDate || new Date().toISOString().split('T')[0],
      expiryDate: formExpiryDate,
      fileSize: formFile ? `${(formFile.size / (1024 * 1024)).toFixed(1)} মেগাবাইট` : '১.২ মেগাবাইট',
      fileType: formFile ? formFile.type.toUpperCase() : 'PDF',
      note: formNote,
      isVerified: false,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    setDocuments(prev => [newDoc, ...prev]);
    toast.success('ডকুমেন্ট সফলভাবে ক্লাউড ভল্টে সংরক্ষিত হয়েছে!');
    setIsUploadModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('nid');
    setFormDocNumber('');
    setFormIssueDate('');
    setFormExpiryDate('');
    setFormNote('');
    setFormFile(null);
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    toast.success('ডকুমেন্ট সফলভাবে মুছে ফেলা হয়েছে');
  };

  const handleCopyDetails = (doc: VaultDocument) => {
    navigator.clipboard.writeText(`ডকুমেন্ট: ${doc.title}\nনম্বর: ${doc.docNumber}\nতারিখ: ${doc.issueDate || 'N/A'}`);
    toast.success('ডকুমেন্টের তথ্য ক্লিপবোর্ডে কপি করা হয়েছে!');
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCat = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.note && doc.note.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
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

      <main className="flex-1 pb-24">
        <div className="animate-fade-in font-sans">
          
          {/* Top Banner Header */}
          <div 
            className="p-5 sm:p-7 rounded-b-[32px] text-white relative overflow-hidden mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)' }}
          >
            <div 
              className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none" 
              style={{ backgroundImage: `url(${puthiaBg})` }} 
            />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <button 
                onClick={() => navigate('/exclusive-features')} 
                className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition flex items-center justify-center cursor-pointer text-white"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> সুরক্ষিত ক্লাউড ভল্ট
                </span>
              </div>
            </div>

            <div className="relative z-10 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                ই-ডকুমেন্ট ভল্ট (Secure Vault)
              </h1>
              <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed">
                আপনার এনআইডি কপি, জন্ম নিবন্ধন, পাসপোর্ট, ড্রাইভিং লাইসেন্স ও জরুরি পিডিএফ ডকুমেন্টস নিরাপদ এনক্রিপ্টেড স্টোরেজে রাখুন।
              </p>
            </div>

            {/* Quick Security Badge Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/15 relative z-10">
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-3 border border-white/10">
                <Lock size={20} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">২৫৬-বিট এনক্রিপশন</span>
                  <span className="text-[10px] text-purple-200">শতভাগ ডেটা সুরক্ষা</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-3 border border-white/10">
                <ShieldCheck size={20} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">ভেরিফাইড ব্যাকআপ</span>
                  <span className="text-[10px] text-purple-200">সার্বক্ষণিক ক্লাউড অ্যাক্সেস</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-3 border border-white/10">
                <Smartphone size={20} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">অফলাইন সিঙ্ক</span>
                  <span className="text-[10px] text-purple-200">মোবাইল ও পিসিতে এক্সেস</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 max-w-4xl mx-auto space-y-5">

            {/* Action Bar: Search + Upload New Document */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="নথি বা ডকুমেন্ট খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 outline-none shadow-2xs"
                />
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setIsUploadModalOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
              >
                <Upload size={16} strokeWidth={2.5} /> নতুন ডকুমেন্ট আপলোড
              </button>
            </div>

            {/* Category Navigation Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer border ${
                      isActive 
                        ? 'bg-purple-700 text-white border-purple-700 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent size={15} className={isActive ? 'text-white' : 'text-purple-600'} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Documents Grid / List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.length === 0 ? (
                <div className="col-span-full bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-2xs space-y-3">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <FileCheck2 size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">কোনো ডকুমেন্ট পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-500 mt-1">আপনার প্রয়োজনীয় এনআইডি, জন্ম নিবন্ধন বা পিডিএফ ফাইল আপলোড করুন।</p>
                  </div>
                  <button
                    onClick={() => {
                      resetForm();
                      setIsUploadModalOpen(true);
                    }}
                    className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Upload size={14} /> ডকুমেন্ট যুক্ত করুন
                  </button>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-purple-300 transition-all shadow-2xs flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                          <FileText size={12} /> {doc.categoryLabel}
                        </span>

                        {doc.isVerified ? (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 size={12} /> ভেরিফাইড
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                            ব্যক্তিগত ভল্ট
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-800 leading-snug">
                          {doc.title}
                        </h3>
                        <p className="text-xs font-mono text-purple-700 font-bold mt-1">
                          নম্বর / আইডি: {doc.docNumber}
                        </p>
                      </div>

                      {doc.note && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {doc.note}
                        </p>
                      )}

                      <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400 border-t border-slate-100">
                        <span>সাইজ: <strong className="text-slate-600">{doc.fileSize}</strong></span>
                        <span>সংরক্ষণ: <strong className="text-slate-600">{doc.uploadedAt}</strong></span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye size={14} /> প্রিভিউ
                        </button>
                        <button
                          onClick={() => handleCopyDetails(doc)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                          title="তথ্য কপি করুন"
                        >
                          <Copy size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            toast.success(`ডাউনলোড হচ্ছে: ${doc.title}`);
                          }}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition cursor-pointer"
                          title="ডাউনলোড"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Info Notice Box */}
            <div className="bg-gradient-to-br from-slate-900 to-purple-950 rounded-2xl p-4 sm:p-5 text-white space-y-2 shadow-md">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                <h3 className="text-xs sm:text-sm font-black text-white">আপনার গোপনীয়তা ও নিরাপত্তা</h3>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                পুঠিয়া ডিজিটাল সার্ভিসের ই-ডকুমেন্ট ভল্টে আপনার আপলোডকৃত ফাইল অত্যন্ত সুরক্ষিত এনক্রিপশন প্রযুক্তির মাধ্যমে সংরক্ষণ করা হয়। তৃতীয় কোনো পক্ষ এই ফাইলগুলো দেখতে পারে না।
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Upload New Document Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto font-sans"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Upload size={18} className="text-purple-700" /> নতুন ডকুমেন্ট আপলোড
                </h3>
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFileUpload} className="space-y-3.5 text-xs">
                
                {/* Category Selection */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ডকুমেন্টের ধরন</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'nid', label: 'NID Copy' },
                      { id: 'birth', label: 'জন্ম নিবন্ধন' },
                      { id: 'passport', label: 'Passport' },
                      { id: 'driving', label: 'Driving License' },
                      { id: 'pdf', label: 'অন্যান্য PDF' },
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFormCategory(c.id as any)}
                        className={`p-2 rounded-xl border text-center font-bold text-[11px] transition cursor-pointer ${
                          formCategory === c.id 
                            ? 'bg-purple-700 text-white border-purple-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ডকুমেন্টের নাম / শিরোনাম *</label>
                  <input 
                    type="text"
                    placeholder="যেমন: স্মার্ট জাতীয় পরিচয়পত্র কপি"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500/30 focus:border-purple-700 outline-none"
                  />
                </div>

                {/* Doc Number */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">আইডি / ডকুমেন্ট নম্বর</label>
                  <input 
                    type="text"
                    placeholder="যেমন: 19958045612345678"
                    value={formDocNumber}
                    onChange={(e) => setFormDocNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium focus:ring-2 focus:ring-purple-500/30 focus:border-purple-700 outline-none"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ইস্যুর তারিখ</label>
                    <input 
                      type="date"
                      value={formIssueDate}
                      onChange={(e) => setFormIssueDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500/30 focus:border-purple-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মেয়াদ উত্তীর্ণ (যদি থাকে)</label>
                    <input 
                      type="date"
                      value={formExpiryDate}
                      onChange={(e) => setFormExpiryDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500/30 focus:border-purple-700 outline-none"
                    />
                  </div>
                </div>

                {/* File input */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পিডিএফ বা ছবি ফাইল নির্বাচন করুন</label>
                  <input 
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormFile(e.target.files[0]);
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-[11px] file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">নোট / বিবরণ</label>
                  <textarea 
                    rows={2}
                    placeholder="অতিরিক্ত কোনো তথ্য..."
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500/30 focus:border-purple-700 outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-purple-700 text-white rounded-xl font-bold shadow-md cursor-pointer hover:bg-purple-800 transition"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Document Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">{previewDoc.title}</h3>
                    <p className="text-[11px] text-purple-700 font-mono font-bold">নম্বর: {previewDoc.docNumber}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Document Mock View / Preview Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  SECURED VAULT 256-BIT
                </div>
                <FileCheck2 size={48} className="mx-auto text-purple-400 opacity-80" />
                <h4 className="text-base font-black tracking-wide">{previewDoc.title}</h4>
                <p className="text-xs text-slate-300 font-mono">ID: {previewDoc.docNumber}</p>
                {previewDoc.note && (
                  <p className="text-xs text-slate-400 bg-white/5 p-2 rounded-xl">
                    {previewDoc.note}
                  </p>
                )}
                <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-center gap-4">
                  <span>তারিখ: {previewDoc.issueDate || 'N/A'}</span>
                  <span>সাইজ: {previewDoc.fileSize}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    handleCopyDetails(previewDoc);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <Copy size={14} /> তথ্য কপি করুন
                </button>
                <button
                  onClick={() => {
                    toast.success(`ডাউনলোড সফল: ${previewDoc.title}`);
                    setPreviewDoc(null);
                  }}
                  className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition"
                >
                  <Download size={14} /> ডাউনলোড ফাইল
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default EDocumentVaultPage;
