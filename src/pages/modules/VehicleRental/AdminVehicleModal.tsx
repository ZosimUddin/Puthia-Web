import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, CheckCircle, XCircle, Star, Trash2, Edit3, Eye, Search, AlertCircle } from 'lucide-react';
import { Vehicle } from './types';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { toast } from 'sonner';

interface AdminVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onUpdateVehicles: () => void;
}

export const AdminVehicleModal: React.FC<AdminVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onUpdateVehicles
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'published'>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = vehicles.filter(v => {
    if (filterTab === 'pending' && v.status !== 'pending') return false;
    if (filterTab === 'published' && v.status !== 'published') return false;
    if (search.trim()) {
      return v.name.toLowerCase().includes(search.toLowerCase()) || v.provider?.businessName?.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const handleToggleStatus = async (vehicle: Vehicle, newStatus: 'published' | 'suspended' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'vehicle_rentals', vehicle.id), {
        status: newStatus
      });
      toast.success(`স্ট্যাটাস আপডেট করা হয়েছে: ${newStatus}`);
      onUpdateVehicles();
    } catch (e) {
      toast.info('লোকাল স্ট্যাটাস আপডেট করা হয়েছে');
    }
  };

  const handleToggleVerify = async (vehicle: Vehicle) => {
    const isVer = !vehicle.provider?.isVerified;
    try {
      await updateDoc(doc(db, 'vehicle_rentals', vehicle.id), {
        'provider.isVerified': isVer
      });
      toast.success(isVer ? 'প্রোভাইডার ভেরিফাইড করা হয়েছে' : 'ভেরিফাইড বাতিল করা হয়েছে');
      onUpdateVehicles();
    } catch (e) {}
  };

  const handleToggleFeatured = async (vehicle: Vehicle) => {
    const isFeat = !vehicle.isFeatured;
    try {
      await updateDoc(doc(db, 'vehicle_rentals', vehicle.id), {
        isFeatured: isFeat
      });
      toast.success(isFeat ? 'ফিচারড তালিকায় যুক্ত করা হয়েছে' : 'ফিচারড তালিকা থেকে সরানো হয়েছে');
      onUpdateVehicles();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই গাড়ির তথ্য মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'vehicle_rentals', id));
      toast.success('গাড়ি মোছা সম্পন্ন হয়েছে');
      onUpdateVehicles();
    } catch (e) {}
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          className="bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-500 text-slate-900 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Shield size={20} />
              <h3 className="text-base font-black">গাড়ি ভাড়া এডমিন প্যানেল</h3>
            </div>
            <button onClick={onClose} className="border-none bg-transparent text-slate-900 font-bold cursor-pointer text-lg">✕</button>
          </div>

          {/* Stats Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-100 grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">মোট গাড়ি</span>
              <span className="text-sm text-slate-900">{vehicles.length}</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="text-amber-600 block text-[10px]">যাচাইাধীন (Pending)</span>
              <span className="text-sm text-amber-600">{vehicles.filter(v => v.status === 'pending').length}</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="text-emerald-700 block text-[10px]">ভেরিফাইড প্রোভাইডার</span>
              <span className="text-sm text-emerald-700">{vehicles.filter(v => v.provider?.isVerified).length}</span>
            </div>
          </div>

          {/* Search & Tabs */}
          <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1">
              {[
                { id: 'all', label: 'সকল' },
                { id: 'pending', label: 'যাচাইাধীন' },
                { id: 'published', label: 'লাইভ' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilterTab(t.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
                    filterTab === t.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="গাড়ি বা ব্যবসার নাম দিয়ে খুঁজুন..."
              className="p-1.5 px-3 rounded-xl border border-slate-200 text-xs outline-none w-48"
            />
          </div>

          {/* List */}
          <div className="p-4 overflow-y-auto space-y-2 flex-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">কোনো গাড়ি পাওয়া যায়নি</div>
            ) : (
              filtered.map(v => (
                <div key={v.id} className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img src={v.imageUrl} alt={v.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900">{v.name}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          v.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {v.status === 'published' ? 'লাইভ' : 'যাচাইাধীন'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {v.provider?.businessName} • {v.provider?.phone}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                    {v.status !== 'published' && (
                      <button
                        onClick={() => handleToggleStatus(v, 'published')}
                        className="py-1 px-2.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold cursor-pointer border-none"
                      >
                        অনুমোদন
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleVerify(v)}
                      className={`py-1 px-2 rounded-lg text-[11px] font-bold border-none cursor-pointer ${
                        v.provider?.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {v.provider?.isVerified ? '✓ ভেরিফাইড' : 'ভেরিফাই'}
                    </button>

                    <button
                      onClick={() => handleToggleFeatured(v)}
                      className={`py-1 px-2 rounded-lg text-[11px] font-bold border-none cursor-pointer ${
                        v.isFeatured ? 'bg-amber-500 text-slate-900' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {v.isFeatured ? '★ ফিচারড' : 'ফিচার করুন'}
                    </button>

                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer border-none"
                      title="মুছুন"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminVehicleModal;
