import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle, XCircle, ShieldCheck, 
  Trash2, Edit, Eye, Filter, Search, 
  TrendingUp, Calendar, Image as ImageIcon,
  AlertTriangle, Check, X, MoreVertical,
  Award, BarChart3, Clock, Rocket, Building2
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, increment, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { NGO } from '../../types';
import { NGO_CATEGORIES } from '../../pages/modules/NGOs/constants';
import EditNgoModal from './ngo/EditNgoModal';
import { bn } from 'date-fns/locale';

const NgoModeration: React.FC = () => {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'rejected' | 'projects' | 'gallery'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNgo, setSelectedNgo] = useState<NGO | null>(null);

  const [pendingProjects, setPendingProjects] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "ngos_list"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NGO));
      setNgos(data);
      
      const pProjs: any[] = [];
      data.forEach(ngo => {
        if (ngo.projects) {
          ngo.projects.forEach((proj: any) => {
            if (proj.status === 'pending') {
              pProjs.push({ ...proj, ngoId: ngo.id, ngoName: ngo.name });
            }
          });
        }
      });
      setPendingProjects(pProjs);

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, status: "active" | "rejected") => {
    try {
      await updateDoc(doc(db, "ngos_list", id), { status });
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const handleVerify = async (id: string, isVerified: boolean) => {
    try {
      await updateDoc(doc(db, "ngos_list", id), { isVerified });
    } catch (e) {
      console.error("Verification error:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই এনজিওটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "ngos_list", id));
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const handleProjectStatus = async (ngoId: string, projectId: string, status: 'active' | 'rejected') => {
    const ngo = ngos.find(i => i.id === ngoId);
    if (!ngo || !ngo.projects) return;

    const updatedProjects = ngo.projects.map((proj: any) => 
      proj.id === projectId ? { ...proj, status } : proj
    );

    try {
      await updateDoc(doc(db, "ngos_list", ngoId), { projects: updatedProjects });
    } catch (e) {
      console.error("Project status update error:", e);
    }
  };

  const filteredNgos = ngos.filter(ngo => {
    const matchesTab = ngo.status === activeTab;
    const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ngo.description.toLowerCase().includes(searchTerm.toLowerCase());
    return (activeTab === 'pending' || activeTab === 'active' || activeTab === 'rejected') && matchesTab && matchesSearch;
  });

  const stats = {
    total: ngos.length,
    pending: ngos.filter(i => i.status === 'pending').length,
    active: ngos.filter(i => i.status === 'active').length,
    verified: ngos.filter(i => i.isVerified).length,
    pendingProjects: pendingProjects.length,
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="মোট এনজিও" value={stats.total} icon={<Building2 />} color="bg-blue-600" />
        <StatCard label="পেন্ডিং এনজিও" value={stats.pending} icon={<Clock />} color="bg-amber-500" />
        <StatCard label="পেন্ডিং প্রকল্প" value={stats.pendingProjects} icon={<Rocket />} color="bg-rose-500" />
        <StatCard label="অনুমোদিত" value={stats.active} icon={<CheckCircle />} color="bg-emerald-600" />
        <StatCard label="ভেরিফাইড" value={stats.verified} icon={<ShieldCheck />} color="bg-indigo-600" />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex bg-slate-100 p-1.5 rounded-[24px] overflow-x-auto scrollbar-hide max-w-full">
            {[
              { id: 'pending', label: 'পেন্ডিং', icon: <Clock size={16} /> },
              { id: 'active', label: 'অনুমোদিত', icon: <CheckCircle size={16} /> },
              { id: 'projects', label: 'প্রকল্প', icon: <Rocket size={16} /> },
              { id: 'gallery', label: 'গ্যালারি', icon: <ImageIcon size={16} /> },
              { id: 'rejected', label: 'বাতিল', icon: <XCircle size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 min-w-max cursor-pointer ${
                  activeTab === tab.id ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              value={searchTerm || ""}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="সার্চ করুন..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-[24px] font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-bold">লোড হচ্ছে...</div>
          ) : activeTab === 'projects' ? (
            pendingProjects.length > 0 ? (
              pendingProjects.map((proj, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Rocket size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">{proj.ngoName}</p>
                    <h3 className="text-lg font-black text-slate-800">{proj.title}</h3>
                    <p className="text-xs font-bold text-slate-400 line-clamp-1">{proj.area} - {proj.duration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleProjectStatus(proj.ngoId, proj.id, 'active')}
                      className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={() => handleProjectStatus(proj.ngoId, proj.id, 'rejected')}
                      className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-slate-400 font-bold">অনুমোদনের জন্য কোনো প্রকল্প নেই।</div>
            )
          ) : activeTab === 'gallery' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {ngos.flatMap(ngo => (ngo.gallery || []).map((url, index) => ({ url, ngoName: ngo.name, ngoId: ngo.id, index }))).length > 0 ? (
                ngos.flatMap(ngo => (ngo.gallery || []).map((url, index) => ({ url, ngoName: ngo.name, ngoId: ngo.id, index }))).map((item, i) => (
                  <div key={i} className="relative group rounded-2xl overflow-hidden aspect-square bg-slate-100 shadow-sm border border-slate-200">
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-white text-xs font-black truncate mb-2">{item.ngoName}</p>
                      <button 
                        onClick={async () => {
                          if (window.confirm('এই ছবিটি মুছে ফেলতে চান?')) {
                            const ngoToUpdate = ngos.find(n => n.id === item.ngoId);
                            if (ngoToUpdate) {
                              const updatedGallery = [...(ngoToUpdate.gallery || [])];
                              updatedGallery.splice(item.index, 1);
                              try {
                                await updateDoc(doc(db, "ngos_list", item.ngoId), { gallery: updatedGallery });
                              } catch (e) {
                                console.error(e);
                              }
                            }
                          }
                        }}
                        className="w-full py-2 bg-rose-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} /> ডিলিট
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-slate-400 font-bold">কোনো ছবি পাওয়া যায়নি।</div>
              )}
            </div>
          ) : filteredNgos.length > 0 ? (
            filteredNgos.map(ngo => (
              <motion.div 
                layout
                key={ngo.id}
                className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all"
              >
                <div className="w-20 h-20 bg-white rounded-2xl p-3 shrink-0 shadow-sm">
                  <img src={ngo.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ngo.name)}&background=047857&color=fff`} alt="" className="w-full h-full object-contain rounded-xl" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-slate-800 truncate">{ngo.name}</h3>
                    {ngo.isVerified && <ShieldCheck size={16} className="text-blue-500" fill="currentColor" />}
                  </div>
                  <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {ngo.location}</span>
                    <span className="flex items-center gap-1.5"><Eye size={12} /> {ngo.views || 0} ভিউ</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeTab === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(ngo.id, 'active')}
                        className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        title="Approve"
                      >
                        <Check size={20} />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(ngo.id, 'rejected')}
                        className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        title="Reject"
                      >
                        <X size={20} />
                      </button>
                    </>
                  )}
                  {activeTab === 'active' && (
                    <button 
                      onClick={() => handleVerify(ngo.id, !ngo.isVerified)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                        ngo.isVerified ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                      }`}
                      title={ngo.isVerified ? "Unverify" : "Verify"}
                    >
                      <ShieldCheck size={20} />
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedNgo(ngo)}
                    className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(ngo.id)}
                    className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400 font-bold">এই মুহূর্তে কোনো এনজিও নেই।</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {selectedNgo && (
          <EditNgoModal ngo={selectedNgo} onClose={() => setSelectedNgo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-slate-800">{value}</div>
    </div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

const MapPin = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

export default NgoModeration;
