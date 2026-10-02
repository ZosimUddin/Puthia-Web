import React, { useState, useEffect } from "react";
import { 
  Sprout, 
  CloudSun, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Trash2, 
  Edit, 
  Bell, 
  AlertTriangle, 
  Save, 
  X, 
  Loader2,
  Calendar,
  Tag,
  Clock,
  ExternalLink,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getMarketPrices, 
  addMarketPrice, 
  updateMarketPrice, 
  deleteMarketPrice,
  getAgriNotices,
  addAgriNotice,
  updateAgriNotice,
  deleteAgriNotice,
  getWeatherAlerts,
  addWeatherAlert,
  updateWeatherAlert,
  deleteWeatherAlert
} from "../../api";
import { MarketPrice, AgriNotice, WeatherAlert } from "../../types";

const AgriManagement = () => {
  const [activeTab, setActiveTab] = useState<'prices' | 'notices' | 'weather'>('prices');
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [notices, setNotices] = useState<AgriNotice[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [priceForm, setPriceForm] = useState<Partial<MarketPrice>>({
    itemName: "",
    category: "সবজি",
    price: 0,
    unit: "কেজি",
    trend: "stable"
  });

  const [noticeForm, setNoticeForm] = useState<Partial<AgriNotice>>({
    title: "",
    content: "",
    priority: "medium",
    isActive: true
  });

  const [weatherForm, setWeatherForm] = useState<Partial<WeatherAlert>>({
    type: "normal",
    severity: "low",
    message: "",
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'prices') {
        const data = await getMarketPrices();
        setPrices(data);
      } else if (activeTab === 'notices') {
        const data = await getAgriNotices();
        setNotices(data);
      } else {
        const data = await getWeatherAlerts();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateMarketPrice(editingId, priceForm);
      } else {
        await addMarketPrice({
          ...priceForm as Omit<MarketPrice, 'id'>,
          updatedAt: new Date().toISOString()
        });
      }
      resetForms();
      await fetchData();
    } catch (error) {
      alert("তথ্য সংরক্ষণ করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateAgriNotice(editingId, noticeForm);
      } else {
        await addAgriNotice({
          ...noticeForm as Omit<AgriNotice, 'id'>,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }
      resetForms();
      await fetchData();
    } catch (error) {
      alert("তথ্য সংরক্ষণ করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  const handleWeatherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateWeatherAlert(editingId, weatherForm);
      } else {
        await addWeatherAlert({
          ...weatherForm as Omit<WeatherAlert, 'id'>,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }
      resetForms();
      await fetchData();
    } catch (error) {
      alert("তথ্য সংরক্ষণ করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setIsAdding(false);
    setEditingId(null);
    setPriceForm({ itemName: "", category: "সবজি", price: 0, unit: "কেজি", trend: "stable" });
    setNoticeForm({ title: "", content: "", priority: "medium", isActive: true });
    setWeatherForm({ type: "normal", severity: "low", message: "", isActive: true });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এটি মুছে ফেলতে চান?")) return;
    setLoading(true);
    try {
      if (activeTab === 'prices') await deleteMarketPrice(id);
      else if (activeTab === 'notices') await deleteAgriNotice(id);
      else await deleteWeatherAlert(id);
      await fetchData();
    } catch (error) {
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setIsAdding(true);
    if (activeTab === 'prices') setPriceForm(item);
    else if (activeTab === 'notices') setNoticeForm(item);
    else setWeatherForm(item);
  };

  const filteredPrices = prices.filter(p => p.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-1">কৃষি ও আবহাওয়া মডিউল</h2>
            <p className="text-xs font-bold text-gray-400">বাজার দর, কৃষি নোটিশ ও আবহাওয়া সতর্কতা ব্যবস্থাপনা</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-[#F8FAFC] p-1.5 rounded-2xl border border-gray-100">
              <button
                onClick={() => { setActiveTab('prices'); resetForms(); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'prices' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <TrendingUp size={16} /> বাজার দর
              </button>
              <button
                onClick={() => { setActiveTab('notices'); resetForms(); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'notices' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Bell size={16} /> কৃষি নোটিশ
              </button>
              <button
                onClick={() => { setActiveTab('weather'); resetForms(); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'weather' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <CloudSun size={16} /> আবহাওয়া
              </button>
            </div>
            <button 
              onClick={() => { setIsAdding(!isAdding); setEditingId(null); if(!isAdding) resetForms(); }}
              className="bg-[#007A5E] text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-[#00634B] transition-all shadow-lg shadow-emerald-100"
            >
              {isAdding ? <X size={20} /> : <Plus size={20} />}
              {isAdding ? "বন্ধ করুন" : "নতুন যোগ করুন"}
            </button>
          </div>
        </div>

        {!isAdding && activeTab === 'prices' && (
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="পণ্যের নাম দিয়ে খুঁজুন..." 
              value={searchTerm || ""}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 transition-all" 
            />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8"
          >
            <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2">
              {editingId ? <Edit size={24} className="text-emerald-600" /> : <Plus size={24} className="text-emerald-600" />}
              {editingId ? "তথ্য পরিবর্তন করুন" : "নতুন তথ্য যোগ করুন"}
            </h3>

            {activeTab === 'prices' ? (
              <form onSubmit={handlePriceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">পণ্যের নাম</label>
                  <input 
                    type="text" required
                    value={priceForm.itemName || ""}
                    onChange={(e) => setPriceForm({...priceForm, itemName: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">ক্যাটাগরি</label>
                  <select 
                    value={priceForm.category || ""}
                    onChange={(e) => setPriceForm({...priceForm, category: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {["সবজি", "চাল", "ডাল", "মাছ", "মাংস", "ফল", "মসলা", "অন্যান্য"].map(c => <option key={c} value={c || ""}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">দাম (টাকা)</label>
                  <input 
                    type="number" required
                    value={priceForm.price || ""}
                    onChange={(e) => setPriceForm({...priceForm, price: Number(e.target.value)})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">ইউনিট</label>
                  <input 
                    type="text" required
                    value={priceForm.unit || ""}
                    onChange={(e) => setPriceForm({...priceForm, unit: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">ট্রেন্ড</label>
                  <select 
                    value={priceForm.trend || ""}
                    onChange={(e) => setPriceForm({...priceForm, trend: e.target.value as any})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="stable">স্থির (Stable)</option>
                    <option value="up">বৃদ্ধি (Up)</option>
                    <option value="down">হ্রাস (Down)</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button type="submit" className="bg-[#007A5E] text-white px-10 py-3.5 rounded-2xl font-black text-sm hover:bg-[#00634B] transition-all shadow-lg shadow-emerald-100">সংরক্ষণ করুন</button>
                </div>
              </form>
            ) : activeTab === 'notices' ? (
              <form onSubmit={handleNoticeSubmit} className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">শিরোনাম</label>
                  <input 
                    type="text" required
                    value={noticeForm.title || ""}
                    onChange={(e) => setNoticeForm({...noticeForm, title: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">বিস্তারিত বিষয়বস্তু</label>
                  <textarea 
                    rows={6} required
                    value={noticeForm.content || ""}
                    onChange={(e) => setNoticeForm({...noticeForm, content: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 resize-none" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">গুরুত্ব (Priority)</label>
                     <select 
                       value={noticeForm.priority || ""}
                       onChange={(e) => setNoticeForm({...noticeForm, priority: e.target.value as any})}
                       className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                     >
                       <option value="low">স্বল্প (Low)</option>
                       <option value="medium">মাঝারি (Medium)</option>
                       <option value="high">উচ্চ (High)</option>
                     </select>
                   </div>
                   <div className="flex items-center gap-4 pt-8">
                      <button 
                        type="button"
                        onClick={() => setNoticeForm({...noticeForm, isActive: !noticeForm.isActive})}
                        className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${noticeForm.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}
                      >
                        {noticeForm.isActive ? "পাবলিশড" : "ড্রাফট"}
                      </button>
                   </div>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <button type="submit" className="bg-[#007A5E] text-white px-10 py-3.5 rounded-2xl font-black text-sm hover:bg-[#00634B] transition-all shadow-lg shadow-emerald-100">সংরক্ষণ করুন</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleWeatherSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">সতর্কতার ধরন</label>
                  <select 
                    value={weatherForm.type || ""}
                    onChange={(e) => setWeatherForm({...weatherForm, type: e.target.value as any})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="normal">স্বাভাবিক (Normal)</option>
                    <option value="rain">বৃষ্টিপাত (Rain)</option>
                    <option value="storm">ঝড়ো হাওয়া (Storm)</option>
                    <option value="cyclone">ঘূর্ণিঝড় (Cyclone)</option>
                    <option value="heat">তীব্র গরম (Heatwave)</option>
                    <option value="cold">শৈত্যপ্রবাহ (Coldwave)</option>
                    <option value="flood">বন্যা (Flood)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">ভয়াবহতা (Severity)</label>
                  <select 
                    value={weatherForm.severity || ""}
                    onChange={(e) => setWeatherForm({...weatherForm, severity: e.target.value as any})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">স্বল্প (Low)</option>
                    <option value="moderate">মাঝারি (Moderate)</option>
                    <option value="high">উচ্চ (High)</option>
                    <option value="extreme">চরম (Extreme)</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">বার্তা/সতর্কবাণী</label>
                  <textarea 
                    rows={4} required
                    value={weatherForm.message || ""}
                    onChange={(e) => setWeatherForm({...weatherForm, message: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 resize-none" 
                  />
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <button 
                    type="button"
                    onClick={() => setWeatherForm({...weatherForm, isActive: !weatherForm.isActive})}
                    className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${weatherForm.isActive ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}
                  >
                    {weatherForm.isActive ? "সক্রিয় সতর্কতা" : "নিষ্ক্রিয়"}
                  </button>
                </div>
                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button type="submit" className="bg-[#007A5E] text-white px-10 py-3.5 rounded-2xl font-black text-sm hover:bg-[#00634B] transition-all shadow-lg shadow-emerald-100">সতর্কবার্তা দিন</button>
                </div>
              </form>
            )}
          </motion.div>
        ) : loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'prices' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrices.map(p => (
                  <motion.div layout key={p.id} className="bg-white border border-gray-50 rounded-[32px] p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-wider">{p.category}</span>
                      {p.trend === 'up' ? <TrendingUp className="text-rose-500" size={18} /> : p.trend === 'down' ? <TrendingDown className="text-emerald-500" size={18} /> : <Minus className="text-gray-300" size={18} />}
                    </div>
                    <h4 className="text-lg font-black text-gray-900 mb-1">{p.itemName}</h4>
                    <p className="text-2xl font-black text-[#007A5E] mb-6">৳ {p.price} <span className="text-xs text-gray-400 font-bold">/ {p.unit}</span></p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                       <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock size={12} /> {new Date(p.updatedAt).toLocaleDateString('bn-BD')}</p>
                       <div className="flex gap-2">
                         <button onClick={() => startEdit(p)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600"><Edit size={16} /></button>
                         <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : activeTab === 'notices' ? (
              <div className="space-y-4">
                {notices.map(n => (
                  <motion.div layout key={n.id} className="bg-white border border-gray-50 rounded-[32px] p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-xl transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${n.priority === 'high' ? 'bg-rose-50 text-rose-600' : n.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                           {n.priority} Priority
                         </span>
                         {!n.isActive && <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[10px] font-black rounded-full uppercase tracking-wider">Draft</span>}
                      </div>
                      <h4 className="text-lg font-black text-gray-900 mb-2">{n.title}</h4>
                      <p className="text-sm font-bold text-gray-500 line-clamp-2">{n.content}</p>
                    </div>
                    <div className="flex flex-row md:flex-col items-center justify-between gap-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(n.date).toLocaleDateString('bn-BD')}</p>
                       <div className="flex gap-2">
                          <button onClick={() => startEdit(n)} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(n.id)} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600"><Trash2 size={18} /></button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map(a => (
                  <motion.div layout key={a.id} className={`bg-white border rounded-[32px] p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-xl transition-all ${a.isActive ? (a.severity === 'extreme' ? 'border-rose-100 bg-rose-50/10' : 'border-amber-100') : 'border-gray-50'}`}>
                    <div className="flex-1">
                       <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.severity === 'extreme' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                             <AlertTriangle size={20} />
                          </div>
                          <div>
                             <h4 className="font-black text-gray-900 capitalize">{a.type} Alert</h4>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{a.severity} Severity</p>
                          </div>
                       </div>
                       <p className="text-sm font-bold text-gray-700 leading-relaxed">{a.message}</p>
                    </div>
                    <div className="flex flex-row md:flex-col items-center justify-between gap-4">
                       <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${a.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                         {a.isActive ? "সক্রিয়" : "অতীত"}
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => startEdit(a)} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(a.id)} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600"><Trash2 size={18} /></button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgriManagement;
