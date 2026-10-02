import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Edit2, Trash2, Check, X, Search, Filter, 
  ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw, Save, ShieldCheck, 
  Grid, CheckCircle2, AlertTriangle, Layers, Tag, ExternalLink, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ServicesGridService, HomepageGridServiceItem, DEFAULT_64_SERVICES_GRID } from '../../services/servicesGridService';
import { renderGridIcon } from '../home/ServicesGrid';

// Available Lucide Icon options for selection
const AVAILABLE_ICONS = [
  'Stethoscope', 'Hospital', 'Activity', 'Compass', 'Droplet', 'Car', 'HeartPulse',
  'Flame', 'ShieldAlert', 'Gavel', 'Lightbulb', 'Store', 'Pill', 'Scroll',
  'Bus', 'Train', 'Home', 'ShoppingBag', 'Hotel', 'Utensils', 'MapPin',
  'Warehouse', 'Hammer', 'Leaf', 'Zap', 'GraduationCap', 'Truck', 'Play',
  'Sparkles', 'Moon', 'Newspaper', 'Mic', 'Video', 'Tent', 'Trophy',
  'Globe', 'Coins', 'HelpingHand', 'Heart', 'Cross', 'Syringe', 'Landmark',
  'ShieldCheck', 'Building2', 'BadgeCheck', 'Building', 'Map', 'Sun',
  'Trees', 'Milestone', 'Navigation', 'Route', 'Bike', 'Fuel', 'Laptop',
  'BookMarked', 'Library', 'Cpu', 'Monitor', 'QrCode', 'Wifi', 'Wrench',
  'FileCheck', 'Sprout'
];

// Color Presets for Grid Icons
const COLOR_PRESETS = [
  { label: 'এমারেল্ড লাইট', value: 'bg-emerald-50 text-emerald-600' },
  { label: 'রয়্যাল গ্রিন (ডার্ক)', value: 'bg-[#006a4e] text-white shadow-sm' },
  { label: 'রেড (জরুরি)', value: 'bg-red-50 text-red-600' },
  { label: 'রোঝ (স্বাস্থ্য)', value: 'bg-rose-50 text-rose-600' },
  { label: 'অ্যাম্বার (ব্যবসা)', value: 'bg-amber-50 text-amber-600' },
  { label: 'ব্লু (পরিবহন)', value: 'bg-blue-50 text-blue-600' },
  { label: 'পার্পল (সরকারি)', value: 'bg-purple-50 text-purple-600' },
  { label: 'ইন্ডিগো (শিক্ষা)', value: 'bg-indigo-50 text-indigo-600' },
  { label: 'টিয়াল (আইটি)', value: 'bg-teal-50 text-teal-600' },
];

export const ServicesGridManagement: React.FC = () => {
  const [items, setItems] = useState<HomepageGridServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State for Edit / Add
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HomepageGridServiceItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<HomepageGridServiceItem>({
    id: '',
    label: '',
    iconName: 'Sparkles',
    bgColor: 'bg-emerald-50 text-emerald-600',
    path: '/',
    enabled: true,
    order: 1,
    badge: '',
    badgeColor: 'bg-amber-500 text-white',
    category: 'অন্যান্য'
  });

  useEffect(() => {
    const unsubscribe = ServicesGridService.subscribeToServicesGrid((data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filtered Items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Unique Categories
  const categories = Array.from(new Set(items.map(i => i.category || 'অন্যান্য')));

  // Toggle Item Enabled Status
  const handleToggleEnable = async (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item);
    setItems(updated);
    const success = await ServicesGridService.saveServicesGrid(updated);
    if (success) {
      toast.success('স্ট্যাটাস হালনাগাদ করা হয়েছে');
    } else {
      toast.error('সংরক্ষণে ব্যর্থ হয়েছে');
    }
  };

  // Move Item Up
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    // Update order numbers
    const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
    await ServicesGridService.saveServicesGrid(reordered);
    toast.success('ক্রম উপরে সরানো হয়েছে');
  };

  // Move Item Down
  const handleMoveDown = async (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    // Update order numbers
    const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
    await ServicesGridService.saveServicesGrid(reordered);
    toast.success('ক্রম নিচে সরানো হয়েছে');
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: `custom-service-${Date.now()}`,
      label: '',
      iconName: 'Sparkles',
      bgColor: 'bg-emerald-50 text-emerald-600',
      path: '/services',
      enabled: true,
      order: items.length + 1,
      badge: '',
      badgeColor: 'bg-amber-500 text-white',
      category: 'অন্যান্য',
      isCustom: true
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: HomepageGridServiceItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setModalOpen(true);
  };

  // Save Item from Modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim() || !formData.path.trim()) {
      toast.error('নাম এবং গন্তব্য পাথ আবশ্যক');
      return;
    }

    setSaving(true);
    let updated: HomepageGridServiceItem[];
    if (editingItem) {
      updated = items.map(item => item.id === editingItem.id ? { ...formData } : item);
    } else {
      updated = [...items, { ...formData }];
    }

    const success = await ServicesGridService.saveServicesGrid(updated);
    setSaving(false);

    if (success) {
      toast.success(editingItem ? 'সেবা তথ্য এডিট করা হয়েছে' : 'নতুন সেবা সফলভাবে যুক্ত হয়েছে');
      setModalOpen(false);
    } else {
      toast.error('সংরক্ষণে সমস্যা হয়েছে');
    }
  };

  // Delete Item
  const handleDeleteItem = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই সেবা বাটনটি গ্রিড থেকে মুছে ফেলতে চান?')) return;
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    const success = await ServicesGridService.saveServicesGrid(updated);
    if (success) {
      toast.success('সেবা বাটনটি মুছে ফেলা হয়েছে');
    } else {
      toast.error('মুছে ফেলতে ব্যর্থ হয়েছে');
    }
  };

  // Restore Default 64 Services
  const handleResetToDefault = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে সকল ৬৪টি মূল সেবার ডিফল্ট কনফিগারেশনে ফিরে যেতে চান? আপনার তৈরি নতুন কাস্টমাইজেশন রিসেট হয়ে যাবে।')) return;
    setLoading(true);
    const success = await ServicesGridService.resetToDefaultGrid();
    setLoading(false);
    if (success) {
      toast.success('সফলভাবে ডিফল্ট ৬৪টি সেবায় রিসেট করা হয়েছে');
    } else {
      toast.error('রিসেট করতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="w-full space-y-6 pb-20 font-sans text-slate-800">
      
      {/* Banner Header */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-5 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Grid size={220} />
        </div>
        
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-full border border-emerald-400/30 uppercase tracking-wide flex items-center gap-1.5 w-fit">
              <Sparkles size={14} /> এক নজরে সকল সেবা (৬৪টি+) ম্যানেজমেন্ট
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20 whitespace-nowrap"
              >
                <RotateCcw size={14} /> ডিফল্ট ৬৪টি সেবায় রিসেট
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md whitespace-nowrap"
              >
                <Plus size={16} /> নতুন সেবা বাটন যুক্ত করুন
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            হোমপেজ ৬৪টি মূল সেবা গ্রিড কাস্টমাইজেশন
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-3xl">
            নাগরিক হোমপেজের "এক নজরে সকল সেবা" গ্রিডের সকল ৬৪টি আইকন, শিরোনাম, গন্তব্য লিংক, রঙ, ব্যাজ ও প্রদর্শনক্রম সরাসরি এখান থেকে নিয়ন্ত্রণ করুন।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs font-bold text-emerald-200">
            <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10 whitespace-nowrap">
              মোট সেবা বাটন: <strong className="text-white">{items.length}টি</strong>
            </span>
            <span className="bg-emerald-500/30 px-3 py-1 rounded-lg border border-emerald-400/30 text-emerald-100 whitespace-nowrap">
              সক্রিয় সেবা: <strong className="text-white">{items.filter(i => i.enabled).length}টি</strong>
            </span>
            <span className="bg-rose-500/20 px-3 py-1 rounded-lg border border-rose-400/30 text-rose-200 whitespace-nowrap">
              লুকায়িত: <strong className="text-white">{items.filter(i => !i.enabled).length}টি</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="সেবার নাম বা লিংক খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Category Pills (Non-truncating, horizontal scrollable) */}
        <div className="flex items-center gap-2 w-full overflow-x-auto pb-1 pt-1 scrollbar-none">
          <div className="flex items-center gap-1 shrink-0 text-slate-400 pr-1">
            <Filter size={15} />
          </div>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'all' 
                ? 'bg-emerald-700 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সকল ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat} ({items.filter(i => i.category === cat).length})
            </button>
          ))}
        </div>
      </div>

      {/* Grid Items Manager Table / Card List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Grid size={18} className="text-emerald-700" />
            সেবা বাটন তালিকা ({filteredItems.length}টি প্রদর্শিত)
          </h3>
          <span className="text-xs text-slate-400 font-bold">
            উপরে/নিচে নামিয়ে ক্রমানুযায়ী সাজাতে পারেন
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-xs">
            সেবা বাটন ডাটা লোড হচ্ছে...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold text-xs">
            কোনো সেবা বাটন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item, index) => {
              const originalIndex = items.findIndex(i => i.id === item.id);
              return (
                <div 
                  key={item.id}
                  className={`p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition hover:bg-slate-50/80 ${
                    !item.enabled ? 'opacity-50 bg-slate-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Index & Order controls */}
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <button
                        onClick={() => handleMoveUp(originalIndex)}
                        disabled={originalIndex === 0}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-20 cursor-pointer"
                        title="উপরে সরান"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <span className="text-[10px] font-black text-slate-400 w-5 text-center">
                        #{originalIndex + 1}
                      </span>
                      <button
                        onClick={() => handleMoveDown(originalIndex)}
                        disabled={originalIndex === items.length - 1}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-20 cursor-pointer"
                        title="নিচে সরান"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    {/* Icon & Details */}
                    <div className={`w-10 h-10 rounded-full ${item.bgColor || 'bg-emerald-50 text-emerald-600'} flex items-center justify-center shrink-0`}>
                      {renderGridIcon(item.iconName)}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-slate-800">
                          {item.label}
                        </h4>
                        {item.badge && (
                          <span className={`px-1.5 py-0.5 text-[9px] font-black rounded-full ${item.badgeColor || 'bg-amber-500 text-white'}`}>
                            {item.badge}
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                          {item.category || 'অন্যান্য'}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                        গন্তব্য: {item.path}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleToggleEnable(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                        item.enabled 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {item.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                      {item.enabled ? 'সক্রিয়' : 'লুকায়িত'}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition cursor-pointer"
                      title="এডিট করুন"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <Grid size={18} className="text-emerald-300" />
                  {editingItem ? 'সেবা বাটন এডিট করুন' : 'নতুন সেবা বাটন যুক্ত করুন'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">সেবার নাম / লেবেল</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ডাক্তার, হাসপাতাল, ই-সেবা"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">গন্তব্য ইউআরএল / পেজ পাথ</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: /doctors, /hospitals, https://..."
                    value={formData.path}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">আইকন নির্বাচন</label>
                    <select
                      value={formData.iconName}
                      onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      {AVAILABLE_ICONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">ক্যাটাগরি</label>
                    <input
                      type="text"
                      placeholder="যেমন: স্বাস্থ্য, শিক্ষা, জরুরি"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">আইকন কালার থিম</label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.value}
                        onClick={() => setFormData({ ...formData, bgColor: preset.value })}
                        className={`p-2 rounded-xl text-[11px] font-bold border text-left transition cursor-pointer flex items-center justify-between ${
                          formData.bgColor === preset.value
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-black'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{preset.label}</span>
                        {formData.bgColor === preset.value && <Check size={12} className="text-emerald-700 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">কাস্টম ব্যাজ (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      placeholder="যেমন: ২৪/৭, নতুন, লাইভ"
                      value={formData.badge || ''}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">ব্যাজ কালার</label>
                    <select
                      value={formData.badgeColor || 'bg-amber-500 text-white'}
                      onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="bg-amber-500 text-white">অ্যাম্বার (হলুদ)</option>
                      <option value="bg-red-500 text-white">রেড (লাল)</option>
                      <option value="bg-emerald-600 text-white">এমারেল্ড (সবুজ)</option>
                      <option value="bg-blue-600 text-white">ব্লু (নীল)</option>
                      <option value="bg-purple-600 text-white">পার্পল (বেগুনি)</option>
                    </select>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500">হোমপেজে প্রিভিউ:</span>
                  <div className="flex flex-col items-center justify-center py-2 px-3 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
                    {formData.badge && (
                      <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-black rounded-full ${formData.badgeColor}`}>
                        {formData.badge}
                      </span>
                    )}
                    <div className={`w-9 h-9 rounded-full ${formData.bgColor} flex items-center justify-center mb-1`}>
                      {renderGridIcon(formData.iconName)}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">{formData.label || 'শিরোনাম'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save size={14} />
                    {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesGridManagement;
