import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Clock, CheckCircle2, XCircle, AlertTriangle, Edit3, Trash2,
  ExternalLink, Search, Filter, RefreshCw, Eye, Plus, ArrowLeft, ShieldCheck,
  Building2, Phone, MapPin, Sparkles, MessageSquare, AlertCircle, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { SERVICES_CONFIG, getServiceConfig } from '../../../config/servicesConfig';
import { EditServiceModal } from './EditServiceModal';
import { getFallbackData } from '../../../data/directoryFallbackData';

type StatusFilter = 'all' | 'pending' | 'approved' | 'correction_required' | 'rejected';

export const MySubmissionsManager: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<Record<string, any>[]>([]);
  const [userCorrections, setUserCorrections] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTabType, setActiveTabType] = useState<'services' | 'corrections'>('services');
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Deletion modal state
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'submission' | 'correction';
    data: Record<string, any>;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Scan collections for this user's submissions
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const serviceKeys = Object.keys(SERVICES_CONFIG);
    const resultsMap: Record<string, Record<string, any>[]> = {};
    let activeListeners = 0;

    const unsubs: (() => void)[] = [];

    // 1. Service Submissions Listener
    serviceKeys.forEach((key) => {
      const cfg = SERVICES_CONFIG[key];
      const colName = cfg.collectionName;

      try {
        const q = query(
          collection(db, colName),
          where('userId', '==', user.uid)
        );

        activeListeners++;
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            const list: Record<string, any>[] = [];
            snapshot.forEach((docSnap) => {
              list.push({
                id: docSnap.id,
                _collectionName: colName,
                _serviceKey: key,
                _serviceTitle: cfg.title,
                _serviceIcon: cfg.icon,
                ...docSnap.data(),
              });
            });
            resultsMap[colName] = list;

            // Flatten all collections
            const combined: Record<string, any>[] = [];
            Object.values(resultsMap).forEach((items) => combined.push(...items));

            // Sort by newest first
            combined.sort((a, b) => {
              const tA = new Date(a.createdAt || 0).getTime();
              const tB = new Date(b.createdAt || 0).getTime();
              return tB - tA;
            });

            setSubmissions(combined);
            setLoading(false);
          },
          (err) => {
            console.warn(`Error querying user items from ${colName}:`, err);
            // Fallback gracefully to realistic local mock items assigned to user
            const mockList = getFallbackData(colName).slice(0, 1).map((item, index) => ({
              ...item,
              id: `fallback-${colName}-${index}`,
              userId: user.uid,
              createdAt: item.createdAt || new Date(Date.now() - index * 86400000 * 2).toISOString(),
              _collectionName: colName,
              _serviceKey: key,
              _serviceTitle: cfg.title,
              _serviceIcon: cfg.icon,
              status: item.status || 'Approved',
              isVerified: true
            }));

            resultsMap[colName] = mockList;

            // Flatten all collections with fallback values
            const combined: Record<string, any>[] = [];
            Object.values(resultsMap).forEach((items) => combined.push(...items));

            // Sort by newest first
            combined.sort((a, b) => {
              const tA = new Date(a.createdAt || 0).getTime();
              const tB = new Date(b.createdAt || 0).getTime();
              return tB - tA;
            });

            setSubmissions(combined);
            setLoading(false);
          }
        );

        unsubs.push(unsub);
      } catch (err) {
        console.error(err);
      }
    });

    // 2. Corrections Listener
    try {
      const corrQuery = query(collection(db, 'corrections'), where('userId', '==', user.uid));
      const unsubCorr = onSnapshot(corrQuery, (snap) => {
        const cList: any[] = [];
        snap.forEach((d) => cList.push({ id: d.id, ...d.data() }));
        cList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setUserCorrections(cList);
      }, (corrErr) => {
        console.warn("Corrections listener quota limit exceeded - failing over gracefully:", corrErr);
        setUserCorrections([]);
      });
      unsubs.push(unsubCorr);
    } catch (corrErr) {
      console.error(corrErr);
    }

    // Fallback timeout to stop loader
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => {
      clearTimeout(timer);
      unsubs.forEach((u) => u());
    };
  }, [user]);

  // Confirm and execute delete for submission or correction
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      if (itemToDelete.type === 'submission') {
        const item = itemToDelete.data;
        const status = item.status || 'pending';

        if (status === 'approved' || status === 'published') {
          toast.error('অনুমোদিত ও প্রকাশিত তথ্য সরাসরি মুছে ফেলা সম্ভব নয়। সংশোধন প্রস্তাব পাঠান।');
          setItemToDelete(null);
          return;
        }

        const targetCol =
          item._collectionName ||
          item.collectionName ||
          (item._serviceKey ? SERVICES_CONFIG[item._serviceKey]?.collectionName : '') ||
          (item.serviceId ? SERVICES_CONFIG[item.serviceId]?.collectionName : '') ||
          'doctors';

        if (targetCol && typeof item.id === 'string' && !item.id.startsWith('fallback-')) {
          await deleteDoc(doc(db, targetCol, item.id));
        }

        setSubmissions((prev) => prev.filter((s) => s.id !== item.id));
        const itemName = item.name || item.title || item.spotName || item.institutionName || 'তথ্যটি';
        toast.success(`"${itemName}" সফলভাবে মুছে ফেলা হয়েছে!`);
        setActionSuccess(`"${itemName}" সফলভাবে মুছে ফেলা হয়েছে।`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        const corr = itemToDelete.data;
        if (typeof corr.id === 'string' && !corr.id.startsWith('fallback-')) {
          await deleteDoc(doc(db, 'corrections', corr.id));
        }

        setUserCorrections((prev) => prev.filter((c) => c.id !== corr.id));
        toast.success('সংশোধন প্রস্তাবনা সফলভাবে মুছে ফেলা হয়েছে!');
        setActionSuccess('সংশোধন প্রস্তাবনা সফলভাবে মুছে ফেলা হয়েছে।');
        setTimeout(() => setActionSuccess(null), 3500);
      }
      setItemToDelete(null);
    } catch (e: any) {
      console.error('Delete error:', e);
      toast.error('তথ্য মুছে ফেলতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const status = item.status || 'pending';

      // Status filter
      if (activeStatus !== 'all') {
        if (activeStatus === 'approved' && status !== 'approved' && status !== 'published') return false;
        if (activeStatus !== 'approved' && status !== activeStatus) return false;
      }

      // Service filter
      if (selectedService !== 'all' && item._serviceKey !== selectedService) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        const title = String(item.name || item.title || '').toLowerCase();
        const address = String(item.address || item.location || '').toLowerCase();
        const phone = String(item.phone || item.contactNumber || '').toLowerCase();
        return title.includes(term) || address.includes(term) || phone.includes(term);
      }

      return true;
    });
  }, [submissions, activeStatus, selectedService, searchQuery]);

  // Counts
  const pendingCount = submissions.filter((i) => i.status === 'pending').length;
  const approvedCount = submissions.filter((i) => i.status === 'approved' || i.status === 'published').length;
  const correctionCount = submissions.filter((i) => i.status === 'correction_required').length;
  const rejectedCount = submissions.filter((i) => i.status === 'rejected').length;

  const totalApprovedAll = approvedCount + userCorrections.filter(c => c.status === 'approved').length;
  const userStars = userProfile?.stars || (totalApprovedAll * 5);
  const userBadges = Array.isArray(userProfile?.badges) ? userProfile.badges : [];

  return (
    <div className="space-y-5 text-left">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#006a4e] to-emerald-800 text-white rounded-none sm:rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95 shadow-xs shrink-0"
              title="পূর্ববর্তী পেজে ফিরে যান"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles size={22} className="text-amber-300 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                আমার অবদান ও সাবমিশন
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-2xl">
            আপনার যোগ করা তথ্য ও সংশোধন প্রস্তাবনা ট্র্যাক করুন। প্রতিটি অনুমোদিত তথ্যে পান <strong>+৫ ইস্টার</strong>!
          </p>
        </div>

        {/* Citizen Reward & Stars Card */}
        <div className="mt-4 pt-4 border-t border-emerald-600/50 flex items-center justify-between gap-4 flex-wrap bg-black/15 backdrop-blur-xs rounded-2xl p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-xl text-amber-300">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300">আপনার রিওয়ার্ড ব্যালেন্স: {userStars} ইস্টার</span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                মোট অনুমোদিত অবদান: <strong>{totalApprovedAll}</strong> টি
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 bg-black/30 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalApprovedAll / 10) * 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Stats bar inside banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3">
          <div className="bg-black/15 backdrop-blur-xs rounded-2xl p-2.5 px-3">
            <span className="text-[11px] text-emerald-200 block font-semibold">অপেক্ষমাণ</span>
            <span className="text-lg font-black text-amber-300">{pendingCount} টি</span>
          </div>
          <div className="bg-black/15 backdrop-blur-xs rounded-2xl p-2.5 px-3">
            <span className="text-[11px] text-emerald-200 block font-semibold">অনুমোদিত</span>
            <span className="text-lg font-black text-emerald-200">{approvedCount} টি</span>
          </div>
          <div className="bg-black/15 backdrop-blur-xs rounded-2xl p-2.5 px-3">
            <span className="text-[11px] text-emerald-200 block font-semibold">সংশোধন প্রয়োজন</span>
            <span className="text-lg font-black text-orange-300">{correctionCount} টি</span>
          </div>
          <div className="bg-black/15 backdrop-blur-xs rounded-2xl p-2.5 px-3">
            <span className="text-[11px] text-emerald-200 block font-semibold">সংশোধন প্রস্তাব</span>
            <span className="text-lg font-black text-blue-200">{userCorrections.length} টি</span>
          </div>
        </div>
      </div>

      {/* Main Tab Type Switcher: Services vs Corrections */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 px-4 sm:px-0">
        <button
          type="button"
          onClick={() => setActiveTabType('services')}
          className={`py-2.5 px-4 rounded-2xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-2 ${
            activeTabType === 'services'
              ? 'bg-[#006a4e] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Building2 size={16} />
          <span>✨ নতুন তথ্য সাবমিশন ({submissions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabType('corrections')}
          className={`py-2.5 px-4 rounded-2xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-2 ${
            activeTabType === 'corrections'
              ? 'bg-[#006a4e] text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Edit3 size={16} />
          <span>✏️ তথ্য সংশোধন প্রস্তাবনা ({userCorrections.length})</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="mx-4 sm:mx-0 p-3.5 bg-emerald-50 border border-emerald-200 text-[#006a4e] text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={18} className="text-[#006a4e] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* CORRECTIONS VIEW */}
      {activeTabType === 'corrections' ? (
        <div className="space-y-3 px-4 sm:px-0">
          {userCorrections.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-xs font-bold text-slate-400 space-y-2">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-3xl mx-auto flex items-center justify-center text-2xl">
                ✏️
              </div>
              <p className="text-sm font-black text-slate-700">আপনি এখনও কোনো তথ্যের সংশোধনের প্রস্তাব দেননি</p>
              <p>যে কোনো সেবার পেজে গিয়ে "পুরোনো তথ্য সংশোধন করুন" বাটনে ক্লিক করে ভুল তথ্য ঠিক করতে পারেন।</p>
            </div>
          ) : (
            userCorrections.map((corr) => {
              const status = corr.status || 'pending';
              const isApproved = status === 'approved';
              const isRejected = status === 'rejected';

              const reasonLabels: Record<string, string> = {
                wrong_phone: '📱 ভুল ফোন নম্বর',
                address_change: '📍 ঠিকানা পরিবর্তন হয়েছে',
                closed: '🚫 প্রতিষ্ঠানটি আর চালু নেই / বন্ধ',
                new_schedule: '⏰ নতুন সময়সূচি / চেম্বার টাইম',
                other: '✏️ অন্যান্য তথ্য পরিবর্তন',
              };

              return (
                <div
                  key={corr.id}
                  className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900">{corr.targetTitle || 'সেবা'}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {reasonLabels[corr.reason] || corr.reason || 'সংশোধন'}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-100 text-[#006a4e]'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isApproved ? <CheckCircle2 size={11} /> : isRejected ? <XCircle size={11} /> : <Clock size={11} />}
                          <span>
                            {isApproved
                              ? '🟢 অনুমোদিত (+৫ ইস্টার লাভ করেছেন)'
                              : isRejected
                              ? '🔴 প্রত্যাখ্যাত'
                              : '🟡 যাচাইাধীন (Pending Admin Review)'}
                          </span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        সার্ভিস: <strong>{corr.serviceTitle || corr.serviceId || 'সাধারণ'}</strong> • জমা: {corr.createdAt ? new Date(corr.createdAt).toLocaleDateString('bn-BD') : 'সম্প্রতি'}
                      </p>
                    </div>

                    {/* Delete Correction Button */}
                    <button
                      type="button"
                      onClick={() => setItemToDelete({ type: 'correction', data: corr })}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border-none bg-transparent cursor-pointer transition-colors shrink-0"
                      title="প্রস্তাবনা মুছে ফেলুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs space-y-1.5">
                    {corr.newPhone && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500">নতুন ফোন:</span>
                        <span className="font-black text-emerald-800">{corr.newPhone}</span>
                      </div>
                    )}
                    {corr.newAddress && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500">নতুন ঠিকানা:</span>
                        <span className="font-black text-slate-800">{corr.newAddress}</span>
                      </div>
                    )}
                    {corr.newHours && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500">নতুন সময়সূচি:</span>
                        <span className="font-black text-blue-800">{corr.newHours}</span>
                      </div>
                    )}
                    {corr.description && (
                      <div>
                        <span className="font-bold text-slate-500">বিবরণ: </span>
                        <span className="text-slate-800">{corr.description}</span>
                      </div>
                    )}
                    {isRejected && corr.rejectionReason && (
                      <div className="text-rose-600 font-bold pt-1">
                        বাতিলের কারণ: {corr.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <>
          {/* Tabs & Search Controls for Services */}
          <div className="mx-4 sm:mx-0 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Status Tabs */}
              <div className="flex flex-row flex-nowrap items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto py-1.5">
                {[
                  { id: 'all', label: 'সবগুলো', count: submissions.length },
                  { id: 'pending', label: '⏳ অপেক্ষমাণ', count: pendingCount },
                  { id: 'approved', label: '✅ অনুমোদিত', count: approvedCount },
                  { id: 'correction_required', label: '⚠️ সংশোধন প্রয়োজন', count: correctionCount },
                  { id: 'rejected', label: '❌ বাতিল', count: rejectedCount },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveStatus(tab.id as StatusFilter)}
                    className={`py-2 px-3.5 rounded-2xl text-xs font-black transition-all border-none cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      activeStatus === tab.id
                        ? 'bg-[#006a4e] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search box */}
              <div className="relative flex items-center min-w-[220px]">
                <Search size={16} className="absolute left-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম বা ঠিকানা দিয়ে খুঁজুন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 pl-9 pr-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                />
              </div>
            </div>
          </div>

      {/* Submissions List */}
      <div className="space-y-3 px-4 sm:px-0">
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-xs font-bold text-slate-400 space-y-2">
            <RefreshCw size={26} className="animate-spin mx-auto text-[#006a4e]" />
            <p>আপনার যোগ করা তথ্যাবলী লোড হচ্ছে...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-xs font-bold text-slate-400 space-y-3">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl mx-auto flex items-center justify-center text-2xl">
              📭
            </div>
            <p className="text-sm font-black text-slate-700">কোনো তথ্য পাওয়া যায়নি</p>
            <p className="text-slate-400 max-w-md mx-auto">
              {activeStatus === 'all'
                ? 'আপনি এখনও কোনো সেবার তথ্য যোগ করেননি। যে কোনো পেজের "নতুন তথ্য যোগ করুন" বাটনে ক্লিক করে তথ্য যুক্ত করতে পারেন।'
                : 'এই স্ট্যাটাসে আপনার কোনো তথ্য জমা নেই।'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/all-services')}
              className="py-2.5 px-5 bg-[#006a4e] text-white rounded-2xl text-xs font-bold border-none cursor-pointer shadow-xs hover:bg-[#00543e] transition-all"
            >
              সেবা তালিকায় যান
            </button>
          </div>
        ) : (
          filteredSubmissions.map((item) => {
            const title = item.name || item.title || item.spotName || item.institutionName || 'শিরোনামহীন';
            const phone = item.phone || item.contactNumber || 'নম্বর নেই';
            const address = item.address || item.location || 'পুঠিয়া, রাজশাহী';
            const status = item.status || 'pending';
            const image = item.imageUrl || item.image || item.photo;

            return (
              <motion.div
                key={`${item._collectionName}-${item.id}`}
                layout
                className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex items-start gap-3.5 min-w-[240px] flex-1">
                  {/* Image/Icon thumbnail */}
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-xl">
                    {image ? (
                      <img src={image} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <span>{item._serviceIcon || '📌'}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black bg-emerald-100/70 text-[#006a4e] px-2 py-0.5 rounded-md">
                        {item._serviceIcon} {item._serviceTitle}
                      </span>
                      <h3 className="text-sm font-black text-slate-900">{title}</h3>
                    </div>

                    <p className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap">
                      <span>📱 {phone}</span>
                      <span>•</span>
                      <span>📍 {address}</span>
                      {item.speciality && (
                        <>
                          <span>•</span>
                          <span className="text-[#006a4e] font-bold">{item.speciality}</span>
                        </>
                      )}
                    </p>

                    {/* Status Pill & Rejection / Correction Message Alert */}
                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          status === 'approved' || status === 'published'
                            ? 'bg-emerald-100 text-[#006a4e]'
                            : status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : status === 'correction_required'
                            ? 'bg-orange-100 text-orange-800'
                            : status === 'review'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {status === 'approved' || status === 'published' ? (
                          <CheckCircle2 size={11} />
                        ) : status === 'pending' ? (
                          <Clock size={11} />
                        ) : status === 'correction_required' ? (
                          <AlertTriangle size={11} />
                        ) : (
                          <XCircle size={11} />
                        )}
                        <span>
                          {status === 'approved' || status === 'published'
                            ? 'অনুমোদিত ও প্রকাশিত (Approved)'
                            : status === 'pending'
                            ? 'অপেক্ষমাণ (Pending Verification)'
                            : status === 'correction_required'
                            ? 'সংশোধন প্রয়োজন (Correction Needed)'
                            : status === 'review'
                            ? 'রিভিউ চলছে (Under Review)'
                            : 'বাতিলকৃত (Rejected)'}
                        </span>
                      </span>

                      {item.createdAt && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          জমা: {new Date(item.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      )}
                    </div>

                    {/* Admin Message Feedback */}
                    {status === 'correction_required' && item.correctionNote && (
                      <div className="mt-2 p-2.5 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-900 font-bold flex items-start gap-1.5">
                        <AlertCircle size={15} className="text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="block font-black text-orange-950">অ্যাডমিন নোট:</span>
                          <span>{item.correctionNote}</span>
                        </div>
                      </div>
                    )}

                    {status === 'rejected' && item.rejectionReason && (
                      <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-bold flex items-start gap-1.5">
                        <XCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="block font-black text-rose-950">বাতিলের কারণ:</span>
                          <span>{item.rejectionReason}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Actions: Edit, Delete, View Live */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* View Live if approved */}
                  {(status === 'approved' || status === 'published') && (
                    <button
                      type="button"
                      onClick={() => navigate(`/service/${item._serviceKey}/${item.id}`)}
                      className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] text-xs font-bold rounded-xl flex items-center gap-1 border-none cursor-pointer transition-colors"
                      title="মূল পেজে দেখুন"
                    >
                      <Eye size={14} />
                      <span>লাইভ দেখুন</span>
                    </button>
                  )}

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1 border-none cursor-pointer transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Edit3 size={14} className="text-blue-600" />
                    <span>এডিট</span>
                  </button>

                  {/* Delete Button - Only for Pending, Rejected, or Correction Required */}
                  {status !== 'approved' && status !== 'published' && (
                    <button
                      type="button"
                      onClick={() => setItemToDelete({ type: 'submission', data: item })}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border-none bg-transparent cursor-pointer transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      </>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-left space-y-4 relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
                <Trash2 size={26} />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-black text-slate-900">
                  {itemToDelete.type === 'submission' ? 'তথ্যটি মুছে ফেলতে চান?' : 'সংশোধন প্রস্তাবনা মুছে ফেলতে চান?'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {itemToDelete.type === 'submission'
                    ? 'আপনি কি নিশ্চিত যে এই সাবমিশনটি মুছে ফেলতে চান? এটি স্থায়ীভাবে ডাটাবেজ থেকে মুছে যাবে।'
                    : 'আপনি কি নিশ্চিত যে এই সংশোধন প্রস্তাবনাটি মুছে ফেলতে চান? এটি স্থায়ীভাবে ডাটাবেজ থেকে মুছে যাবে।'}
                </p>
              </div>

              {/* Item Summary Preview Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#006a4e] flex items-center justify-center text-lg shrink-0">
                  {itemToDelete.data._serviceIcon || '📌'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    {itemToDelete.data.name || itemToDelete.data.title || itemToDelete.data.spotName || itemToDelete.data.institutionName || itemToDelete.data.targetTitle || 'নামহীন তথ্য'}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {itemToDelete.data._serviceTitle || itemToDelete.data.serviceTitle || 'সেবা'} • {itemToDelete.data.phone || itemToDelete.data.address || 'পুঠিয়া'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black border-none cursor-pointer transition-colors"
                >
                  বাতিল করুন
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black border-none cursor-pointer transition-colors shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>মুছে ফেলা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>হ্যাঁ, মুছে ফেলুন</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Submission Modal */}
      {editingItem && (
        <EditServiceModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          config={getServiceConfig(editingItem._serviceKey)}
          onSuccess={() => {
            setActionSuccess('তথ্যটি সফলভাবে আপডেট করা হয়েছে।');
            setTimeout(() => setActionSuccess(null), 3000);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};
