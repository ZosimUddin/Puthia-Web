import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, ShieldCheck, CheckCircle, XCircle, Trash2, Edit2, 
  Eye, Calendar, DollarSign, ArrowUpRight, TrendingUp, Filter,
  ExternalLink, Search, RefreshCw, Layers, Sparkles, Check, X,
  Plus, MousePointer
} from 'lucide-react';
import { getAdCampaigns, updateAdCampaign, deleteAdCampaign, incrementAdImpression, incrementAdClick, AdCampaign } from '../../api';

const AdvertisementManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCamp, setSelectedCamp] = useState<AdCampaign | null>(null);

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editingCamp, setEditingCamp] = useState<AdCampaign | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    pendingCampaigns: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await getAdCampaigns();
      setCampaigns(data);
      calculateStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (list: AdCampaign[]) => {
    const totalRevenue = list.reduce((sum, c) => sum + (c.spent || 0), 0);
    const totalImpressions = list.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = list.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const activeCampaigns = list.filter(c => c.status === 'active').length;
    const pendingCampaigns = list.filter(c => c.status === 'pending').length;

    setStats({
      totalCampaigns: list.length,
      activeCampaigns,
      pendingCampaigns,
      totalImpressions,
      totalClicks,
      totalRevenue
    });
  };

  const handleStatusChange = async (id: string, newStatus: AdCampaign['status']) => {
    try {
      await updateAdCampaign(id, { status: newStatus });
      fetchCampaigns();
      alert(`ক্যাম্পেইন স্ট্যাটাস সফলভাবে '${newStatus}' এ পরিবর্তন করা হয়েছে।`);
    } catch (err) {
      console.error(err);
      alert("স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই ক্যাম্পেইনটি মুছে ফেলতে চান?")) {
      try {
        await deleteAdCampaign(id);
        fetchCampaigns();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Simulate traffic for easy testing/demo
  const handleSimulateTraffic = async (id: string) => {
    try {
      // Simulate 100-500 impressions, and 5-15 clicks
      const randomImpressions = Math.floor(Math.random() * 400) + 100;
      const randomClicks = Math.floor(Math.random() * 20) + 5;
      
      const camp = campaigns.find(c => c.id === id);
      if (camp) {
        const newImpressions = (camp.impressions || 0) + randomImpressions;
        const newClicks = (camp.clicks || 0) + randomClicks;
        const newSpent = (camp.spent || 0) + (randomClicks * (camp.cpc || 5));
        
        await updateAdCampaign(id, {
          impressions: newImpressions,
          clicks: newClicks,
          spent: Math.min(newSpent, camp.budget)
        });
        
        fetchCampaigns();
        alert(`সফলভাবে ${randomImpressions} ভিউ এবং ${randomClicks} ক্লিক সিমুলেট করা হয়েছে!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCamp) return;

    try {
      await updateAdCampaign(editingCamp.id, {
        campaignName: editingCamp.campaignName,
        link: editingCamp.link,
        imageUrl: editingCamp.imageUrl,
        budget: Number(editingCamp.budget),
        status: editingCamp.status
      });
      setIsEditing(false);
      setEditingCamp(null);
      fetchCampaigns();
      alert("বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে।");
    } catch (err) {
      console.error(err);
      alert("আপডেট করা সম্ভব হয়নি।");
    }
  };

  const filteredCampaigns = campaigns.filter(camp => {
    const matchesStatus = filterStatus === 'all' || camp.status === filterStatus;
    const matchesSearch = camp.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          camp.advertiserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          camp.slotType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-10 space-y-8 bg-slate-50/50 min-h-screen">
      
      {/* HEADER & TITLES */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
            <Megaphone className="text-emerald-500 animate-pulse" size={28} /> বিজ্ঞাপন ও ক্যাম্পেইন ব্যবস্থাপনা (Admin)
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1.5">পুঠিয়া ডিজিটাল পোর্টাল বিজ্ঞাপন, স্পনসরড লিস্টিং ও পেমেন্ট ট্র্যাকিং কনসোল</p>
        </div>
        <button
          onClick={fetchCampaigns}
          className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl border border-slate-200 transition-all shadow-sm flex items-center gap-1.5 font-bold text-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> রিফ্রেশ করুন
        </button>
      </div>

      {/* OVERVIEW METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">মোট ক্যাম্পেইন</span>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalCampaigns}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">লাইভ বিজ্ঞাপন</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.activeCampaigns}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
          <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block">অনুমোদন পেন্ডিং</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{stats.pendingCampaigns}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">মোট ইমপ্রেশন</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.totalImpressions.toLocaleString('bn-BD')}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
          <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest block">মোট ক্লিক</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats.totalClicks.toLocaleString('bn-BD')}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">মোট সংগৃহীত রেভিনিউ</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">৳ {stats.totalRevenue}</p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            সব বিজ্ঞাপন ({campaigns.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'pending' ? 'bg-amber-500 text-slate-950' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            পেন্ডিং পেমেন্ট ({campaigns.filter(c => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            লাইভ চলমান ({campaigns.filter(c => c.status === 'active').length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="ক্যাম্পেইন বা ব্যবসায়ী খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none transition-all"
          />
        </div>
      </div>

      {/* TABLE & LISTINGS */}
      <div className="bg-white rounded-[40px] border border-slate-150 shadow-sm p-6 sm:p-8 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold">লোড হচ্ছে...</div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-bold">কোন বিজ্ঞাপন পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ক্যাম্পেইন ও বিজ্ঞাপনদাতা</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">স্লট ও টার্গেট</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">মেট্রিক্স (ভিউ/ক্লিক/CTR)</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">বাজেট ও খরচ</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">পেমেন্ট ভেরিফিকেশন</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">স্ট্যাটাস</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((camp) => {
                  const ctr = camp.impressions > 0 ? ((camp.clicks / camp.impressions) * 100).toFixed(2) : '0.00';
                  return (
                    <tr key={camp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <img 
                            src={camp.imageUrl} 
                            alt={camp.campaignName} 
                            className="w-16 h-10 object-cover rounded-lg border border-slate-200"
                          />
                          <div>
                            <p className="text-xs font-black text-slate-800 line-clamp-1">{camp.campaignName}</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                              👤 {camp.advertiserName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase rounded block w-fit mb-1">
                          {camp.slotType}
                        </span>
                        <a 
                          href={camp.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[10px] text-emerald-600 hover:underline font-bold flex items-center gap-1"
                        >
                          লিংক <ExternalLink size={10} />
                        </a>
                      </td>
                      <td className="py-5 text-center">
                        <p className="text-xs font-bold text-slate-700">👁️ {camp.impressions || 0}</p>
                        <p className="text-[10px] font-bold text-purple-600 mt-0.5">🎯 {camp.clicks || 0} ({ctr}%)</p>
                      </td>
                      <td className="py-5">
                        <p className="text-xs font-black text-slate-700">৳ {camp.spent || 0} / ৳ {camp.budget}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">CPC: ৳ {camp.cpc || 5}</p>
                      </td>
                      <td className="py-5">
                        <div className="text-[10px] font-bold text-slate-600">
                          <p className="uppercase text-slate-400 text-[8px] font-black">{camp.paymentMethod || 'bKash'}</p>
                          <p className="mt-0.5">নম্বর: {camp.paymentPhone || 'N/A'}</p>
                          <p className="text-emerald-600 font-mono mt-0.5 select-all">TrxID: {camp.paymentTrxId || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg ${
                          camp.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          camp.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                          camp.status === 'completed' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {camp.status === 'active' ? 'Active' :
                           camp.status === 'pending' ? 'Pending' :
                           camp.status === 'completed' ? 'Completed' :
                           'Rejected'}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSimulateTraffic(camp.id)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1"
                            title="ট্রাফিক জেনারেট ট্র্যাকিং"
                          >
                            <TrendingUp size={11} /> ট্রাফিক
                          </button>
                          
                          {camp.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(camp.id, 'active')}
                                className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl transition-all"
                                title="অনুমোদন করুন"
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(camp.id, 'rejected')}
                                className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all"
                                title="বাতিল করুন"
                              >
                                <X size={14} strokeWidth={3} />
                              </button>
                            </>
                          )}

                          {camp.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(camp.id, 'completed')}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                              title="ক্যাম্পেইন সম্পন্ন চিহ্নিত করুন"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingCamp(camp);
                              setIsEditing(true);
                            }}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-all"
                            title="সম্পাদনা"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(camp.id)}
                            className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditing && editingCamp && (
          <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl p-6 sm:p-10 border border-slate-100 relative"
            >
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex gap-4 items-start mb-6">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">বিজ্ঞাপন ক্যাম্পেইন সম্পাদনা</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">ক্যাম্পেইনের বাজেট, স্ট্যাটাস ও ইমেজ আপডেট করুন</p>
                </div>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold">ক্যাম্পেইনের নাম</label>
                  <input
                    required
                    type="text"
                    value={editingCamp.campaignName}
                    onChange={(e) => setEditingCamp({ ...editingCamp, campaignName: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold">টার্গেট লিংক (URL)</label>
                  <input
                    required
                    type="text"
                    value={editingCamp.link}
                    onChange={(e) => setEditingCamp({ ...editingCamp, link: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold">ইমেজ URL</label>
                  <input
                    required
                    type="text"
                    value={editingCamp.imageUrl}
                    onChange={(e) => setEditingCamp({ ...editingCamp, imageUrl: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold">বিজ্ঞাপন বাজেট (৳)</label>
                    <input
                      required
                      type="number"
                      value={editingCamp.budget}
                      onChange={(e) => setEditingCamp({ ...editingCamp, budget: Number(e.target.value) })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold">বিজ্ঞাপন স্ট্যাটাস</label>
                    <select
                      value={editingCamp.status}
                      onChange={(e) => setEditingCamp({ ...editingCamp, status: e.target.value as AdCampaign['status'] })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                  >
                    আপডেট সংরক্ষণ করুন
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

export default AdvertisementManagement;
