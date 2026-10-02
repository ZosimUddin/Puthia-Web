import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle, XCircle, Trash2, Edit, Plus, AlertCircle, Building2, BarChart2, Check, Clock, UserX } from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Hospital } from '../../../types';
import { toast } from 'sonner';

interface HospitalAdminPanelProps {
  onClose: () => void;
  onEditHospital?: (hospital: Hospital) => void;
}

export const HospitalAdminPanel: React.FC<HospitalAdminPanelProps> = ({ onClose, onEditHospital }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'stats'>('all');

  useEffect(() => {
    const q = query(collection(db, 'hospitals_list'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Hospital[];
      setHospitals(list);
      setLoading(false);
    }, (err) => {
      console.error("Error loading admin hospitals:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'active' | 'pending' | 'rejected' | 'suspended', isVerified?: boolean) => {
    try {
      const updateData: any = { status };
      if (isVerified !== undefined) {
        updateData.isVerified = isVerified;
        updateData.verificationStatus = isVerified ? 'verified' : status;
      }
      await updateDoc(doc(db, 'hospitals_list', id), updateData);
      toast.success("হাসপাতালের স্ট্যাটাস আপডেট করা হয়েছে");
    } catch (err) {
      console.error(err);
      toast.error("আপডেট করতে ব্যর্থ হয়েছে");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই হাসপাতালটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, 'hospitals_list', id));
      toast.success("হাসপাতাল মুছে ফেলা হয়েছে");
    } catch (err) {
      console.error(err);
      toast.error("মুছে ফেলতে ব্যর্থ হয়েছে");
    }
  };

  const stats = {
    total: hospitals.length,
    verified: hospitals.filter(h => h.isVerified || h.verificationStatus === 'verified').length,
    pending: hospitals.filter(h => h.status === 'pending' || h.verificationStatus === 'pending').length,
    active: hospitals.filter(h => h.status === 'active' || !h.status).length,
    featured: hospitals.filter(h => h.isFeatured).length
  };

  const filteredHospitals = hospitals.filter(h => {
    if (activeTab === 'pending') return h.status === 'pending' || h.verificationStatus === 'pending';
    if (activeTab === 'verified') return h.isVerified || h.verificationStatus === 'verified';
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#006a4e] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={24} className="text-emerald-300" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">হাসপাতাল অ্যাডমিন ব্যবস্থাপনা</h2>
              <p className="text-xs text-emerald-100">হাসপাতালের তথ্য অনুমোদন, ভেরিফিকেশন ও তথ্য নিয়ন্ত্রণ করুন</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-white cursor-pointer border-none bg-transparent"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2 overflow-x-auto">
          {[
            { id: 'all', label: `সকল হাসপাতাল (${stats.total})` },
            { id: 'pending', label: `যাচাইাধীন (${stats.pending})` },
            { id: 'verified', label: `ভেরিফাইড (${stats.verified})` },
            { id: 'stats', label: 'পরিসংখ্যান' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all bg-transparent cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#006a4e] text-[#006a4e]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'stats' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                <span className="text-2xl font-black text-[#006a4e]">{stats.total}</span>
                <p className="text-xs font-bold text-slate-600 mt-1">মোট হাসপাতাল</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                <span className="text-2xl font-black text-blue-700">{stats.verified}</span>
                <p className="text-xs font-bold text-slate-600 mt-1">ভেরিফাইড</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                <span className="text-2xl font-black text-amber-700">{stats.pending}</span>
                <p className="text-xs font-bold text-slate-600 mt-1">যাচাইাধীন</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center">
                <span className="text-2xl font-black text-purple-700">{stats.featured}</span>
                <p className="text-xs font-bold text-slate-600 mt-1">বিশেষায়িত / ফিচার্ড</p>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-10 text-xs text-slate-400">তথ্য লোড হচ্ছে...</div>
          ) : filteredHospitals.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">কোনো তথ্য পাওয়া যায়নি</div>
          ) : (
            <div className="space-y-3">
              {filteredHospitals.map(hospital => (
                <div key={hospital.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{hospital.name}</h4>
                      {hospital.isVerified && (
                        <span className="bg-emerald-100 text-[#006a4e] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {hospital.type || 'হাসপাতাল'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">📍 {hospital.address} ({hospital.union})</p>
                    <p className="text-xs text-slate-500">📞 {hospital.phone}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {!hospital.isVerified ? (
                      <button
                        onClick={() => handleUpdateStatus(hospital.id, 'active', true)}
                        className="py-1.5 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors border-none cursor-pointer flex items-center gap-1"
                      >
                        <Check size={14} /> অনুমোদন ও ভেরিফাই
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(hospital.id, 'active', false)}
                        className="py-1.5 px-3 bg-amber-100 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-200 transition-colors border-none cursor-pointer"
                      >
                        ভেরিফিকেশন সরান
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(hospital.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HospitalAdminPanel;
