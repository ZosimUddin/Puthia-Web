import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, ShieldCheck, FileText, Star, AlertTriangle, Users,
  BarChart3, Settings, Search, Filter, RefreshCw, Eye, Edit3, Trash2,
  CheckCircle2, XCircle, Clock, Award, Building2, Phone, MapPin, Sparkles,
  ArrowUpRight, ChevronRight, MessageSquare, AlertCircle, TrendingUp,
  Download, UserCheck, Stethoscope, School, Landmark, HeartHandshake, Briefcase, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  collection, query, where, onSnapshot, doc, getDoc, updateDoc, setDoc, deleteDoc,
  getDocs, getCountFromServer, orderBy, limit, addDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { SERVICES_CONFIG, getServiceConfig, ServiceConfig } from '../../../config/servicesConfig';
import { EditServiceModal } from './EditServiceModal';
import { TrustVerificationManager } from '../../admin/TrustVerificationManager';
import { logAuditActivity } from '../../../services/auditLogger';

type AdminMasterTab =
  | 'overview'
  | 'services'
  | 'verification'
  | 'corrections'
  | 'reports'
  | 'reviews'
  | 'content'
  | 'users'
  | 'statistics';

export const UniversalAdminManager: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState<AdminMasterTab>('overview');

  // Service Verification State
  const serviceKeys = useMemo(() => Object.keys(SERVICES_CONFIG), []);
  const [selectedServiceKey, setSelectedServiceKey] = useState<string>('doctor');
  const [verificationStatusFilter, setVerificationStatusFilter] = useState<string>('all');
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [serviceItems, setServiceItems] = useState<Record<string, any>[]>([]);
  const [loadingServiceItems, setLoadingServiceItems] = useState(false);

  // Suggested Corrections State
  const [corrections, setCorrections] = useState<any[]>([]);
  const [loadingCorrections, setLoadingCorrections] = useState(false);

  // Overall Global Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServicesCount: 60,
    totalItems: 0,
    pendingVerifications: 0,
    approvedItems: 0,
    totalReports: 0,
    totalReviews: 0,
  });

  // Reports & Complaints State
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Modals & Action Feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const [inspectingItem, setInspectingItem] = useState<Record<string, any> | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationBadge, setVerificationBadge] = useState('অফিসিয়ালি ভেরিফায়েড');

  const currentConfig = useMemo(() => getServiceConfig(selectedServiceKey), [selectedServiceKey]);

  // Fetch Global Overview Statistics across collections
  useEffect(() => {
    let unmounted = false;

    const fetchGlobalStats = async () => {
      try {
        // Users count
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (!unmounted) {
          setUsersList(usersData);
          setStats(prev => ({ ...prev, totalUsers: usersSnap.size }));
        }

        // Complaints & Reports count
        const complaintsSnap = await getDocs(collection(db, 'complaints'));
        const complaintsData = complaintsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (!unmounted) {
          setReports(complaintsData);
          setStats(prev => ({ ...prev, totalReports: complaintsSnap.size }));
        }

        // Reviews count
        const reviewsSnap = await getDocs(collection(db, 'reviews'));
        const reviewsData = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (!unmounted) {
          setReviews(reviewsData);
          setStats(prev => ({ ...prev, totalReviews: reviewsSnap.size }));
        }
      } catch (err) {
        console.error('Error fetching global admin stats:', err);
      }
    };

    fetchGlobalStats();

    // Listen to corrections in real-time
    const correctionsCol = collection(db, 'corrections');
    const unsubCorrections = onSnapshot(correctionsCol, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setCorrections(list);
    });

    return () => { 
      unmounted = true; 
      unsubCorrections();
    };
  }, []);

  // Helper to award points and check contributor badge
  const awardPointsAndBadge = async (targetUserId: string, pointsToAdd: number = 5) => {
    if (!targetUserId || targetUserId === 'anonymous') return;
    try {
      const userRef = doc(db, 'users', targetUserId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        const currentPoints = (uData.stars || 0) + pointsToAdd;
        const currentApprovedCount = (uData.approvedContributionsCount || 0) + 1;
        
        await updateDoc(userRef, {
          points: currentPoints,
          approvedContributionsCount: currentApprovedCount,
        });
      }
    } catch (e) {
      console.error('Failed to update contributor points:', e);
    }
  };

  // Real-time listener for current selected service collection
  useEffect(() => {
    if (!currentConfig) return;
    setLoadingServiceItems(true);

    const colRef = collection(db, currentConfig.collectionName);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const list: Record<string, any>[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Sort newest first
        list.sort((a, b) => {
          const tA = new Date(a.createdAt || a.verifiedAt || 0).getTime();
          const tB = new Date(b.createdAt || b.verifiedAt || 0).getTime();
          return tB - tA;
        });

        setServiceItems(list);
        setLoadingServiceItems(false);
      },
      (err) => {
        console.error(`Error subscribing to ${currentConfig.collectionName}:`, err);
        setLoadingServiceItems(false);
      }
    );

    return () => unsub();
  }, [currentConfig]);

  // Update Status Action (Approve / Reject / Correction / Review)
  const updateItemStatus = async (
    id: string,
    newStatus: 'pending' | 'review' | 'approved' | 'correction_required' | 'rejected',
    extraPayload: Record<string, any> = {}
  ) => {
    try {
      const payload: Record<string, any> = {
        ...extraPayload,
        status: newStatus,
        isVerified: newStatus === 'approved',
        verificationStatus: newStatus,
        updatedAt: new Date().toISOString(),
        verifiedAt: newStatus === 'approved' ? new Date().toISOString() : null,
      };

      const docRef = doc(db, currentConfig.collectionName, id);
      if (typeof id === 'string' && id.startsWith('fallback-')) {
        const itemToPersist = serviceItems.find((i) => i.id === id) || inspectingItem || {};
        await setDoc(docRef, { ...itemToPersist, ...payload }, { merge: true });
      } else {
        try {
          await updateDoc(docRef, payload);
        } catch (updateErr: any) {
          if (
            updateErr?.code === 'not-found' ||
            updateErr?.message?.includes('No document to update')
          ) {
            const itemToPersist = serviceItems.find((i) => i.id === id) || inspectingItem || {};
            await setDoc(docRef, { ...itemToPersist, ...payload }, { merge: true });
          } else {
            throw updateErr;
          }
        }
      }

      // Award +5 Star to Citizen on Admin Approval
      const itemToNotify = serviceItems.find((i) => i.id === id) || inspectingItem;
      if (newStatus === 'approved' && itemToNotify && itemToNotify.userId) {
        await awardPointsAndBadge(itemToNotify.userId, 5);
      }

      // Multi-channel real-time notification dispatching to citizen
      if (itemToNotify && itemToNotify.userId && itemToNotify.userId !== 'anonymous') {
        const itemTitle = itemToNotify.name || itemToNotify.title || itemToNotify.spotName || currentConfig.title;
        let notifTitle = 'আপনার তথ্য আপডেট হয়েছে';
        let notifMessage = `আপনার যোগ করা "${itemTitle}" তথ্যের স্ট্যাটাস পরিবর্তিত হয়েছে।`;
        let notifType = 'service_verification';

        if (newStatus === 'approved') {
          notifTitle = '🎉 আপনার তথ্য অনুমোদিত হয়েছে (+৫ ইস্টার)!';
          notifMessage = `অভিনন্দন! আপনার যোগ করা "${itemTitle}" তথ্যটি এডমিন কর্তৃক যাচাই ও অনুমোদন করে প্ল্যাটফর্মে প্রকাশ করা হয়েছে। আপনার একাউন্টে +৫ ইস্টার যোগ করা হয়েছে।`;
        } else if (newStatus === 'correction_required') {
          notifTitle = '⚠️ আপনার জমা দেওয়া তথ্য সংশোধন প্রয়োজন';
          const corrReason = extraPayload.correctionNote || 'অনুগ্রহ করে তথ্যটি পুনরায় দেখে আপডেট করুন।';
          notifMessage = `আপনার জমা দেওয়া "${itemTitle}" তথ্যে সংশোধন প্রয়োজন। কারণ/নোট: ${corrReason}`;
        } else if (newStatus === 'rejected') {
          notifTitle = '❌ আপনার আবেদন বাতিল করা হয়েছে';
          const rejReason = extraPayload.rejectionReason || 'তথ্যে অসঙ্গতি রয়েছে।';
          notifMessage = `আপনার যোগ করা "${itemTitle}" তথ্যটি বাতিল করা হয়েছে। কারণ: ${rejReason}`;
        } else if (newStatus === 'review') {
          notifTitle = '🔍 আপনার তথ্য যাচাই প্রক্রিয়া চলমান';
          notifMessage = `আপনার যোগ করা "${itemTitle}" তথ্যটি বর্তমানে এডমিন টিম কর্তৃক যাচাই ও নিরীক্ষা করা হচ্ছে।`;
        }

        try {
          // Push to Firebase Notifications Collection
          await addDoc(collection(db, 'notifications'), {
            userId: itemToNotify.userId,
            title: notifTitle,
            message: notifMessage,
            type: notifType,
            status: newStatus,
            badge: extraPayload.verificationBadge || 'অফিসিয়ালি ভেরিফায়েড',
            serviceKey: currentConfig.id,
            serviceTitle: currentConfig.title,
            itemId: id,
            read: false,
            createdAt: new Date().toISOString(),
            timestamp: serverTimestamp(),
          });
        } catch (notifErr) {
          console.error('Failed to dispatch user notification to Firestore:', notifErr);
        }
      }

      const statusMessages = {
        approved: 'তথ্যটি সফলভাবে ভেরিফাই ও প্রকাশিত (Published) করা হয়েছে!',
        review: 'তথ্যটি পর্যালোচনাধীন (Under Review) হিসেবে রাখা হয়েছে।',
        correction_required: 'সংশোধন প্রয়োজন হিসেবে নোটিশ পাঠানো হয়েছে।',
        rejected: 'আবেদনটি বাতিল (Rejected) করা হয়েছে।',
        pending: 'স্ট্যাটাস অপেক্ষমাণ (Pending) এ রাখা হয়েছে।',
      };

      // Log to Global Activity & Audit Log
      const auditItemTitle = itemToNotify ? (itemToNotify.name || itemToNotify.title || itemToNotify.spotName || currentConfig.title) : currentConfig.title;
      await logAuditActivity({
        action: "তথ্য অনুমোদন ও স্ট্যাটাস আপডেট",
        details: `${currentConfig.title} মডিউলে "${auditItemTitle}" নামক তথ্যের স্ট্যাটাস পরিবর্তন করে '${newStatus}' করা হয়েছে।`,
        category: "content",
        severity: newStatus === 'approved' ? "info" : "warning",
        changes: {
          status: { old: (itemToNotify && itemToNotify.status) || "pending", new: newStatus }
        },
        customUser: userProfile?.name || user?.displayName || "এডমিন",
        customEmail: user?.email || "unknown"
      });

      setActionSuccess(statusMessages[newStatus].replace('+১০ ইস্টার', '+৫ ইস্টার'));
      setTimeout(() => setActionSuccess(null), 3500);
      setInspectingItem(null);
    } catch (e) {
      console.error('Status update failed:', e);
      alert('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  // Delete Item Action
  const handleDeleteItem = async (colName: string, id: string, name?: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name || 'এই তথ্যটি'}" স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      if (typeof id === 'string' && !id.startsWith('fallback-')) {
        await deleteDoc(doc(db, colName, id));
      }
      setServiceItems((prev) => prev.filter((item) => item.id !== id));

      // Log to Global Activity & Audit Log
      await logAuditActivity({
        action: "তথ্য ডিলিট / মুছে ফেলা",
        details: `${currentConfig.title} মডিউলে "${name || 'নামহীন তথ্য'}" নামক তথ্য স্থায়ীভাবে মুছে ফেলা হয়েছে।`,
        category: "content",
        severity: "critical",
        changes: {
          status: { old: "exists", new: "deleted" },
          id: { old: id, new: null }
        },
        customUser: userProfile?.name || user?.displayName || "এডমিন",
        customEmail: user?.email || "unknown"
      });

      setActionSuccess('তথ্যটি সফলভাবে মুছে ফেলা হয়েছে।');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      alert('তথ্য মুছতে সমস্যা হয়েছে।');
    }
  };

  // Approve Correction Request & Apply to Service Doc + Reward User
  const handleApproveCorrection = async (corr: any) => {
    try {
      // 1. Update the correction status in 'corrections' collection
      await updateDoc(doc(db, 'corrections', corr.id), {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: userProfile?.name || user?.displayName || 'এডমিন',
      });

      // 2. If target document and collection are specified, apply updates
      if (corr.targetCollection && corr.targetId) {
        const updatePayload: Record<string, any> = {
          updatedAt: new Date().toISOString(),
        };
        if (corr.newPhone) {
          updatePayload.phone = corr.newPhone;
          updatePayload.contactNumber = corr.newPhone;
        }
        if (corr.newAddress) {
          updatePayload.address = corr.newAddress;
          updatePayload.location = corr.newAddress;
        }
        if (corr.newHours) {
          updatePayload.chamberTime = corr.newHours;
          updatePayload.time = corr.newHours;
        }
        if (corr.reason === 'closed') {
          updatePayload.isClosed = true;
          updatePayload.operationalStatus = 'permanently_closed';
        }
        try {
          await updateDoc(doc(db, corr.targetCollection, corr.targetId), updatePayload);
        } catch (targetUpdateErr) {
          console.warn('Target service doc could not be auto-updated:', targetUpdateErr);
        }
      }

      // 3. Award +5 Star to Citizen
      if (corr.userId && corr.userId !== 'anonymous') {
        await awardPointsAndBadge(corr.userId, 5);
        // Dispatch notification
        await addDoc(collection(db, 'notifications'), {
          userId: corr.userId,
          title: '🎉 আপনার সংশোধন প্রস্তাব অনুমোদিত (+৫ ইস্টার)!',
          message: `ধন্যবাদ! "${corr.targetTitle || 'সেবা'}" সম্পর্কিত আপনার দেওয়া তথ্যের সংশোধন এডমিন কর্তৃক গৃহীত হয়েছে এবং আপনার একাউন্টে +৫ ইস্টার যোগ করা হয়েছে।`,
          type: 'correction_approved',
          status: 'approved',
          read: false,
          createdAt: new Date().toISOString(),
          timestamp: serverTimestamp(),
        });
      }

      setActionSuccess('সংশোধন প্রস্তাব অনুমোদিত ও সিস্টেমে আপডেট করা হয়েছে (+৫ ইস্টার প্রদান)!');
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to approve correction:', err);
      alert('সংশোধন অনুমোদন করতে সমস্যা হয়েছে।');
    }
  };

  // Reject Correction Request
  const handleRejectCorrection = async (corr: any) => {
    const reason = window.prompt('প্রত্যাখ্যানের কারণ লিখুন (ঐচ্ছিক):') || 'তথ্যের যথার্থতা নিশ্চিত করা যায়নি।';
    try {
      await updateDoc(doc(db, 'corrections', corr.id), {
        status: 'rejected',
        rejectionReason: reason,
        reviewedAt: new Date().toISOString(),
        reviewedBy: userProfile?.name || user?.displayName || 'এডমিন',
      });

      if (corr.userId && corr.userId !== 'anonymous') {
        await addDoc(collection(db, 'notifications'), {
          userId: corr.userId,
          title: '❌ আপনার সংশোধন প্রস্তাব গৃহীত হয়নি',
          message: `"${corr.targetTitle || 'সেবা'}" এর সংশোধন প্রস্তাবটি বাতিল করা হয়েছে। কারণ: ${reason}`,
          type: 'correction_rejected',
          status: 'rejected',
          read: false,
          createdAt: new Date().toISOString(),
          timestamp: serverTimestamp(),
        });
      }

      setActionSuccess('সংশোধন প্রস্তাব প্রত্যাখ্যান করা হয়েছে।');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to reject correction:', err);
      alert('বাতিল করতে সমস্যা হয়েছে।');
    }
  };

  // Filtered Service Items
  const filteredServiceItems = useMemo(() => {
    return serviceItems.filter((item) => {
      const status = item.status || 'approved';
      if (verificationStatusFilter !== 'all') {
        if (verificationStatusFilter === 'approved' && status !== 'approved' && status !== 'published') return false;
        if (verificationStatusFilter !== 'approved' && status !== verificationStatusFilter) return false;
      }

      if (serviceSearchTerm.trim()) {
        const term = serviceSearchTerm.toLowerCase();
        const title = String(item.name || item.title || item.spotName || item.institutionName || '').toLowerCase();
        const phone = String(item.phone || item.contactNumber || '').toLowerCase();
        const address = String(item.address || item.location || '').toLowerCase();
        return title.includes(term) || phone.includes(term) || address.includes(term);
      }

      return true;
    });
  }, [serviceItems, verificationStatusFilter, serviceSearchTerm]);

  // Counts for Selected Service
  const pendingCount = serviceItems.filter((i) => i.status === 'pending').length;
  const approvedCount = serviceItems.filter((i) => i.status === 'approved' || i.status === 'published' || !i.status).length;
  const correctionCount = serviceItems.filter((i) => i.status === 'correction_required').length;
  const rejectedCount = serviceItems.filter((i) => i.status === 'rejected').length;
  const pendingCorrectionsCount = corrections.filter((c) => c.status === 'pending' || !c.status).length;

  return (
    <div className="min-h-screen bg-slate-50 text-left">
      {/* Top Universal Control Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-[#006a4e] text-white p-5 sm:p-6 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>স্মার্ট পুঠিয়া • সার্বিক অ্যাডমিন কন্ট্রোল সেন্টার</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Master Admin
                  </span>
                </h1>
                <p className="text-xs text-emerald-100/80 font-medium">
                  ৬০টি সার্ভিস, ইউজার সাবমিশন, ভেরিফিকেশন, রিপোর্ট, রিভিউ, কনটেন্ট, ব্যবহারকারী ও সার্বিক পরিসংখ্যান
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="py-2 px-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer"
            >
              নাগরিক পোর্টালে যান
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="py-2 px-3 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md hover:bg-emerald-600 transition-all border-none cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              <span>রিফ্রেশ</span>
            </button>
          </div>
        </div>

        {/* Master Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-5 pt-3 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: '📊 ওভারভিউ (Overview)', icon: LayoutDashboard },
            { id: 'services', label: '🏛️ ৬০টি সার্ভিস (60 Services)', icon: Building2 },
            { id: 'verification', label: '🛡️ ভেরিফিকেশন (Verification)', icon: ShieldCheck, badge: pendingCount > 0 ? `${pendingCount}` : undefined },
            { id: 'corrections', label: '✏️ সংশোধন প্রস্তাবনা (Corrections)', icon: Edit3, badge: pendingCorrectionsCount > 0 ? `${pendingCorrectionsCount}` : undefined },
            { id: 'reports', label: '⚠️ রিপোর্ট ও অভিযোগ (Reports)', icon: AlertTriangle, badge: reports.length > 0 ? `${reports.length}` : undefined },
            { id: 'reviews', label: '⭐ রিভিউ ও রেটিং (Reviews)', icon: Star, badge: reviews.length > 0 ? `${reviews.length}` : undefined },
            { id: 'users', label: '👥 ব্যবহারকারী (Users)', icon: Users, badge: `${usersList.length}` },
            { id: 'statistics', label: '📈 পরিসংখ্যান (Statistics)', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminMasterTab)}
                className={`py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 border-none ${
                  isActive
                    ? 'bg-white text-[#006a4e] shadow-lg shadow-black/20 font-black'
                    : 'bg-white/10 text-white/90 hover:bg-white/15'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#006a4e]' : 'text-white/80'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#006a4e] text-white' : 'bg-amber-400 text-slate-950'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-[#006a4e] rounded-2xl font-bold text-xs flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 size={18} className="text-[#006a4e] shrink-0" />
            <span>{actionSuccess}</span>
          </motion.div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-bold">মোট সার্ভিস পেজ</span>
                <div className="text-2xl font-black text-slate-900">৬০ টি</div>
                <span className="text-[10px] text-emerald-600 font-bold block">সম্পূর্ণ অটোমেটেড</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-bold">নিবন্ধিত নাগরিক</span>
                <div className="text-2xl font-black text-blue-600">{usersList.length || stats.totalUsers} জন</div>
                <span className="text-[10px] text-blue-500 font-bold block">সক্রিয় প্রোফাইল</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-bold">অপেক্ষমাণ ভেরিফিকেশন</span>
                <div className="text-2xl font-black text-amber-500">{pendingCount} টি</div>
                <span className="text-[10px] text-amber-600 font-bold block">যাচাইয়ের অপেক্ষায়</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-bold">মোট অভিযোগ / রিপোর্ট</span>
                <div className="text-2xl font-black text-rose-600">{reports.length} টি</div>
                <span className="text-[10px] text-rose-500 font-bold block">নাগরিক অভিযোগ</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-bold">মোট রিভিউ ও রেটিং</span>
                <div className="text-2xl font-black text-amber-500">{reviews.length} টি</div>
                <span className="text-[10px] text-amber-600 font-bold block">জনসাধারণের ফিডব্যাক</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-bold">ভেরিফায়েড পার্টনার</span>
                <div className="text-2xl font-black text-[#006a4e]">{approvedCount} টি</div>
                <span className="text-[10px] text-emerald-600 font-bold block">অনুমোদিত ও লাইভ</span>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-800">দ্রুত এক্সেস ও অ্যাকশন (Quick Shortcuts)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => { setActiveTab('verification'); setVerificationStatusFilter('pending'); }}
                  className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl text-xs font-black border border-amber-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>⏳ নতুন আবেদন যাচাই করুন</span>
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-2xl text-xs font-black border border-emerald-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>🏛️ ৬০টি সার্ভিসের তথ্য এডিট</span>
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-2xl text-xs font-black border border-rose-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>⚠️ নাগরিক অভিযোগ সমাধান</span>
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-2xl text-xs font-black border border-blue-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>👥 ইউজারদের রোল ও প্রোফাইল</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <TrustVerificationManager />
        )}

        {/* 3. SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {/* Service & Filter Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Service Dropdown */}
                <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                  <span className="text-xs font-black text-slate-700 whitespace-nowrap">সার্ভিস নির্বাচন:</span>
                  <select
                    value={selectedServiceKey}
                    onChange={(e) => setSelectedServiceKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                  >
                    {serviceKeys.map((key) => {
                      const cfg = SERVICES_CONFIG[key];
                      return (
                        <option key={key} value={key}>
                          {cfg.icon} {cfg.title} ({cfg.collectionName})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Search */}
                <div className="relative min-w-[220px]">
                  <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                    placeholder="নাম, ফোন বা ঠিকানা খুঁজুন..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 pl-9 pr-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                  />
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
                {[
                  { id: 'all', label: 'সবগুলো', count: serviceItems.length },
                  { id: 'pending', label: '⏳ অপেক্ষমাণ (Pending)', count: pendingCount },
                  { id: 'approved', label: '✅ অনুমোদিত (Approved)', count: approvedCount },
                  { id: 'correction_required', label: '⚠️ সংশোধন প্রয়োজন', count: correctionCount },
                  { id: 'rejected', label: '❌ বাতিল (Rejected)', count: rejectedCount },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setVerificationStatusFilter(st.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                      verificationStatusFilter === st.id
                        ? 'bg-[#006a4e] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{st.label}</span>
                    <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded-md font-bold">
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Service Items Table / List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-slate-700">
                  {currentConfig.icon} {currentConfig.title} ({filteredServiceItems.length} টি তথ্য)
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  কলেকশন: `{currentConfig.collectionName}`
                </span>
              </div>

              {loadingServiceItems ? (
                <div className="p-12 text-center text-xs font-bold text-slate-400 space-y-2">
                  <RefreshCw size={24} className="animate-spin mx-auto text-[#006a4e]" />
                  <p>তথ্য লোড হচ্ছে...</p>
                </div>
              ) : filteredServiceItems.length === 0 ? (
                <div className="p-12 text-center text-xs font-bold text-slate-400 space-y-2">
                  <p className="text-sm font-black text-slate-700">কোনো তথ্য পাওয়া যায়নি</p>
                  <p>এই ফিল্টারে বর্তমানে কোনো তালিকা নেই।</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredServiceItems.map((item) => {
                    const title = item.name || item.title || item.spotName || item.institutionName || 'শিরোনামহীন';
                    const phone = item.phone || item.contactNumber || 'নম্বর নেই';
                    const address = item.address || item.location || 'পুঠিয়া, রাজশাহী';
                    const status = item.status || 'approved';
                    const image = item.imageUrl || item.image || item.photo;

                    return (
                      <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3.5 flex-1 min-w-[240px]">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-xl">
                            {image ? (
                              <img src={image} alt={title} className="w-full h-full object-cover" />
                            ) : (
                              <span>{currentConfig.icon}</span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-black text-slate-900">{title}</h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                status === 'approved' || status === 'published'
                                  ? 'bg-emerald-100 text-[#006a4e]'
                                  : status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : status === 'correction_required'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {status === 'approved' || status === 'published'
                                  ? '✅ Approved'
                                  : status === 'pending'
                                  ? '⏳ Pending'
                                  : status === 'correction_required'
                                  ? '⚠️ Correction Needed'
                                  : '❌ Rejected'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap">
                              <span>📱 {phone}</span>
                              <span>•</span>
                              <span>📍 {address}</span>
                              {item.userName && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-400">জমা দিয়েছেন: {item.userName}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          {status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => updateItemStatus(item.id, 'approved', {
                                verificationBadge: 'অফিসিয়ালি ভেরিফায়েড',
                                adminNote: 'এডমিন কর্তৃক সরাসরি যাচাইকৃত ও প্রকাশিত',
                              })}
                              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl border-none cursor-pointer transition-all shadow-xs"
                            >
                              অনুমোদন দিন
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setInspectingItem(item);
                              setAdminNote(item.adminNote || '');
                              setRejectionReason(item.rejectionReason || '');
                              setVerificationBadge(item.verificationBadge || 'অফিসিয়ালি ভেরিফায়েড');
                            }}
                            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border-none cursor-pointer transition-colors"
                          >
                            যাচাই / নিরীক্ষা
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border-none bg-transparent cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(currentConfig.collectionName, item.id, title)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border-none bg-transparent cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CORRECTIONS TAB */}
        {activeTab === 'corrections' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Edit3 size={18} className="text-amber-600" />
                  <span>নাগরিকদের পাঠানো তথ্য সংশোধন প্রস্তাবসমূহ ({corrections.length} টি)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ভুল ফোন নম্বর, স্থান পরিবর্তন, বন্ধ থাকা বা নতুন সময়সূচির তথ্য যাচাই করে অনুমোদন করুন। অনুমোদনে ব্যবহারকারী পাবেন <strong>+৫ ইস্টার</strong>।
                </p>
              </div>
            </div>

            {corrections.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400 space-y-2">
                <p className="text-sm font-black text-slate-700">কোনো সংশোধন প্রস্তাব জমা নেই</p>
                <p>নাগরিকরা কোনো তথ্যে পরিবর্তন বা ভুল চিহ্নিত করে সাবমিট করলে এখানে প্রদর্শিত হবে।</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {corrections.map((corr) => {
                  const status = corr.status || 'pending';
                  const isPending = status === 'pending';
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
                    <div key={corr.id} className="py-4 space-y-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-900">
                              {corr.targetTitle || 'নির্দিষ্ট সেবা'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              {reasonLabels[corr.reason] || corr.reason || 'সংশোধন'}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isRejected
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}
                            >
                              {isApproved ? '🟢 অনুমোদিত' : isRejected ? '🔴 প্রত্যাখ্যাত' : '🟡 যাচাইাধীন (Pending)'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 font-medium mt-1">
                            সার্ভিস: <strong>{corr.serviceTitle || corr.serviceId || 'সাধারণ'}</strong> • জমা দিয়েছেন: <strong>{corr.userName || 'নাগরিক'}</strong> ({corr.userPhone || 'ফোন নম্বর নেই'})
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveCorrection(corr)}
                                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black border-none cursor-pointer shadow-xs flex items-center gap-1 transition-all"
                              >
                                <CheckCircle2 size={13} />
                                <span>অনুমোদন (+৫ ইস্টার)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectCorrection(corr)}
                                className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 cursor-pointer transition-all"
                              >
                                <span>বাতিল</span>
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('corrections', corr.id, corr.targetTitle)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 border-none bg-transparent cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Details Box */}
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
                            <span className="font-bold text-slate-500">বিস্তারিত বিবরণ: </span>
                            <span className="text-slate-800 font-medium">{corr.description}</span>
                          </div>
                        )}
                        {corr.rejectionReason && (
                          <div className="text-rose-600 font-bold pt-1">
                            বাতিলের কারণ: {corr.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. REPORTS & COMPLAINTS TAB */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-600" />
                <span>নাগরিক অভিযোগ ও রিপোর্টসমূহ ({reports.length} টি)</span>
              </h3>
            </div>

            {reports.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">
                বর্তমানে কোনো নাগরিক অভিযোগ জমা নেই।
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <div key={rep.id} className="py-3.5 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{rep.subject || rep.title || 'অভিযোগ'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{rep.details || rep.description || 'বিবরণ নেই'}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        জমা: {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('bn-BD') : 'সম্প্রতি'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem('complaints', rep.id)}
                      className="text-xs text-rose-600 font-bold p-2 hover:bg-rose-50 rounded-xl border-none bg-transparent cursor-pointer"
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Star size={18} className="text-amber-500" />
              <span>ইউজার রিভিউ ও রেটিং ({reviews.length} টি)</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">
                কোনো রিভিউ এখনও পাওয়া যায়নি।
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-3.5 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">{rev.userName || 'নাগরিক'}</span>
                        <span className="text-xs text-amber-500 font-bold">★ {rev.rating || 5}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{rev.comment || rev.text || 'কোনো মন্তব্য নেই'}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem('reviews', rev.id)}
                      className="text-xs text-rose-600 font-bold p-2 hover:bg-rose-50 rounded-xl border-none bg-transparent cursor-pointer"
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                <span>নিবন্ধিত ব্যবহারকারী তালিকা ({usersList.length} জন)</span>
              </h3>

              <div className="relative min-w-[220px]">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 pl-9 pr-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {usersList
                .filter(u => {
                  if (!userSearchTerm.trim()) return true;
                  const term = userSearchTerm.toLowerCase();
                  return (
                    String(u.name || '').toLowerCase().includes(term) ||
                    String(u.phone || '').toLowerCase().includes(term) ||
                    String(u.email || '').toLowerCase().includes(term)
                  );
                })
                .map((u) => (
                  <div key={u.id} className="py-3.5 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006a4e] flex items-center justify-center font-black text-sm">
                        {u.name ? u.name[0] : 'U'}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{u.name || 'ব্যবহারকারী'}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{u.phone || u.email || 'তথ্য নেই'}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
                      {u.role || 'user'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 6. STATISTICS TAB */}
        {activeTab === 'statistics' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-[#006a4e]" />
              <span>সার্বিক পোর্টাল অ্যানালিটিক্স ও ডাটাবেজ হেলথ</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-black text-slate-700">৬০টি ক্যাটাগরি ও ডাটাবেজ স্ট্যাটাস</span>
                <p className="text-xs text-slate-500">
                  সকল ৬০টি সেবার কালেকশন ফায়ারবেস ক্লাউড ফায়ারস্টোরের সাথে রিয়েল-টাইমে সিঙ্ক রয়েছে।
                </p>
                <div className="text-xs font-black text-[#006a4e] pt-2">
                  ✅ অল সিস্টেম অপারেশনাল (All Systems Operational)
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-black text-slate-700">ভেরিফিকেশন লাইফসাইকেল হেলথ</span>
                <p className="text-xs text-slate-500">
                  ইউজার সাবমিশন স্বয়ংক্রিয়ভাবে নোটিফিকেশন ডিসপ্যাচার ও অ্যাডমিন অ্যাপ্রুভাল পাইপলাইনের সাথে সংযুক্ত।
                </p>
                <div className="text-xs font-black text-blue-600 pt-2">
                  ⚡ ফাস্ট রেসপন্স পাইপলাইন সক্রিয়
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Verification / Inspection Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#006a4e]" />
              <span>তথ্য নিরীক্ষা ও ভেরিফিকেশন</span>
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <p><span className="font-black">শিরোনাম:</span> {inspectingItem.name || inspectingItem.title}</p>
              <p><span className="font-black">ফোন:</span> {inspectingItem.phone || inspectingItem.contactNumber}</p>
              <p><span className="font-black">ঠিকানা:</span> {inspectingItem.address || inspectingItem.location}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">অফিসিয়াল ব্যাজ নির্ধারণ:</label>
                <select
                  value={verificationBadge}
                  onChange={(e) => setVerificationBadge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold"
                >
                  <option value="অফিসিয়ালি ভেরিফায়েড">🛡️ অফিসিয়ালি ভেরিফায়েড</option>
                  <option value="সরকারিভাবে অনুমোদিত">🏛️ সরকারিভাবে অনুমোদিত</option>
                  <option value="এডমিন ভেরিফায়েড">✅ এডমিন ভেরিফায়েড</option>
                  <option value="প্রিমিয়াম পার্টনার">⭐ প্রিমিয়াম পার্টনার</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">অ্যাডমিন নোট / সত্যায়ন:</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="যেমন: BMDC সনদ ও নম্বর যাচাইকৃত"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => updateItemStatus(inspectingItem.id, 'approved', { verificationBadge, adminNote })}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 text-white rounded-2xl text-xs font-black border-none cursor-pointer shadow-xs"
                >
                  ✅ অনুমোদন ও প্রকাশ (Publish)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const reason = window.prompt('সংশোধনের বিবরণ দিন:');
                    if (reason) updateItemStatus(inspectingItem.id, 'correction_required', { correctionNote: reason });
                  }}
                  className="py-2.5 px-3 bg-amber-500 text-white rounded-2xl text-xs font-black border-none cursor-pointer"
                >
                  ⚠️ সংশোধন চান
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const reason = window.prompt('বাতিলের কারণ:');
                    if (reason) updateItemStatus(inspectingItem.id, 'rejected', { rejectionReason: reason });
                  }}
                  className="py-2.5 px-3 bg-rose-600 text-white rounded-2xl text-xs font-black border-none cursor-pointer"
                >
                  ❌ বাতিল
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInspectingItem(null)}
              className="w-full py-2 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold border-none cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <EditServiceModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          config={getServiceConfig(selectedServiceKey)}
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
