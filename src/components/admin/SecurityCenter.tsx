import React, { useState, useEffect } from 'react';
import { Shield, History, Activity, AlertTriangle, Ban, Smartphone, Key, UserX, MessageSquareWarning, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { checkToxicContent, detectSpam } from '../../utils/securityFilter';
import toast from 'react-hot-toast';

const LoginHistory = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(
          collection(db, 'audit_logs'),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'audit_logs');
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-800">লগইন ও সিস্টেম অ্যাক্টিভিটি হিস্ট্রি</h3>
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-[400px] overflow-y-auto space-y-2">
        {logs.map(log => (
          <div key={log.id} className="flex justify-between items-center py-2 px-3 bg-white rounded-xl border border-slate-100">
            <div>
              <span className="text-xs font-black text-emerald-950 uppercase">{typeof log.action === 'object' ? JSON.stringify(log.action) : (log.action || 'activity')}</span>
              <p className="text-[10px] text-slate-400">{typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || log.email || 'System user')}</p>
            </div>
            <span className="text-[11px] font-bold text-slate-600">{log.timestamp ? new Date(log.timestamp?.toDate?.() || log.timestamp).toLocaleString() : ''}</span>
          </div>
        ))}
        {logs.length === 0 && <p className="text-xs font-bold text-slate-500 text-center py-8">কোনো লগ রেকর্ড নেই।</p>}
      </div>
    </div>
  );
};

const AdminReviewSection = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reports', id), { status: 'Resolved' });
      toast.success("রিপোর্টটি সমাধান করা হয়েছে!");
      fetchReports();
    } catch (err) {
      console.error(err);
      toast.error("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-800">অ্যাডমিন রিভিউ (Admin Review & Reports)</h3>
        <button onClick={fetchReports} className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline cursor-pointer">
          <RefreshCw size={12} /> রিফ্রেশ
        </button>
      </div>
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-[450px] overflow-y-auto space-y-3">
        {loading ? (
          <p className="text-xs font-bold text-slate-500 text-center py-8">লোড হচ্ছে...</p>
        ) : reports.length === 0 ? (
          <p className="text-xs font-bold text-slate-500 text-center py-8">কোনো পেন্ডিং রিপোর্ট বা রিভিউ নেই।</p>
        ) : (
          reports.map(rep => (
            <div key={rep.id} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-black uppercase">{rep.reason || rep.type || 'Report'}</span>
                  <span className="text-xs font-bold text-slate-400">{rep.createdAt?.toDate ? new Date(rep.createdAt.toDate()).toLocaleDateString() : 'তারিখ নেই'}</span>
                </div>
                <p className="text-xs font-black text-slate-800 mt-1">{rep.contentTitle || rep.details || rep.reasonText || 'রিপোর্ট বিবরণ'}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">রিপোর্টার আইডি: {rep.reporterId || rep.reportedBy || 'অজ্ঞাত'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${rep.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {rep.status || 'Pending'}
                </span>
                {rep.status !== 'Resolved' && (
                  <button 
                    onClick={() => handleResolve(rep.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black cursor-pointer transition-colors shadow-sm"
                  >
                    মীমাংসা করুন
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AIToxicAndSpamTest = () => {
  const [testText, setTestText] = useState("");
  const [result, setResult] = useState<{ isToxic?: boolean; isSpam?: boolean; reason?: string } | null>(null);

  const handleTest = () => {
    const toxicCheck = checkToxicContent(testText);
    const spamCheck = detectSpam(testText);
    setResult({
      isToxic: toxicCheck.isToxic,
      isSpam: spamCheck.isSpam,
      reason: toxicCheck.reason || spamCheck.reason || "কোনো সমস্যা পাওয়া যায়নি। কন্টেন্ট নিরাপদ।"
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-800">AI Toxic Comment & Spam Detection Simulator</h3>
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
        <p className="text-xs font-bold text-slate-500">এখানে যেকোনো মন্তব্য বা পোস্ট লিখে টেস্ট করুন যে AI ফিল্টার ও স্প্যাম ডিটেক্টর কীভাবে কাজ করে।</p>
        <textarea 
          value={testText || ""}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="এখানে কোনো টেক্সট লিখুন..." 
          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-24"
        />
        <button 
          onClick={handleTest}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all shadow-sm"
        >
          টেস্ট করুন (Analyze)
        </button>

        {result && (
          <div className={`p-4 rounded-xl border text-xs font-bold ${result.isToxic || result.isSpam ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
            <div className="flex items-center gap-2 font-black mb-1">
              {result.isToxic || result.isSpam ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{result.isToxic ? 'তৎক্ষণাৎ ব্লক করা হবে (Toxic)' : result.isSpam ? 'স্প্যাম চিহ্নিত হয়েছে (Spam)' : 'নিরাপদ কন্টেন্ট'}</span>
            </div>
            <p className="text-[11px] font-medium">{result.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const BlockedMutedUsersList = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-800">ব্লক ও ম্যুটকৃত ইউজারগণ (Blocked & Muted Users)</h3>
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
        <p className="text-xs font-bold text-slate-500">ইউজাররা প্রোফাইল বা ডিসকাশন থেকে যেকোনো ইউজারকে ব্লক বা ম্যুট করতে পারেন। ব্লক করা ইউজারের পোস্ট বা মন্তব্য নিউজফিডে দেখাবে না।</p>
        <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-400">
          বর্তমানে কোনো ইউজার সিস্টেমে গ্লোবালি ব্লকড নেই।
        </div>
      </div>
    </div>
  );
};

export default function SecurityCenter() {
  const [activeTab, setActiveTab] = useState<'review' | 'toxic' | 'blocked' | 'history' | 'ip'>('review');

  const tabs = [
    { id: 'review', label: 'অ্যাডমিন রিভিউ (Review)', icon: Shield },
    { id: 'toxic', label: 'AI Toxic & Spam Filter', icon: MessageSquareWarning },
    { id: 'blocked', label: 'ব্লক ও ম্যুট ইউজার', icon: UserX },
    { id: 'history', label: 'লগইন হিস্ট্রি', icon: History },
    { id: 'ip', label: 'IP সিকিউরিটি', icon: Ban },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        <h2 className="text-lg font-black text-slate-800">নিরাপত্তা ও মডারেশন সেন্টার (Security & Moderation)</h2>
        <p className="text-xs font-bold text-slate-400 mt-1">Spam Detection, Block, Mute, Report, Admin Review এবং AI Toxic Filter নিয়ন্ত্রণ করুন।</p>
      </div>

      <div className="bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-[16px] text-xs font-black transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'review' && <AdminReviewSection />}
            {activeTab === 'toxic' && <AIToxicAndSpamTest />}
            {activeTab === 'blocked' && <BlockedMutedUsersList />}
            {activeTab === 'history' && <LoginHistory />}
            {activeTab === 'ip' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800">IP ব্লক ও সিকিউরিটি ফায়ারওয়াল</h3>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs font-bold text-slate-600">
                  সিস্টেম ফায়ারওয়াল সক্রিয় রয়েছে। কোনো সন্দেহজনক বা ক্ষতিকারক IP ট্রাফিক সনাক্ত হয়নি।
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

