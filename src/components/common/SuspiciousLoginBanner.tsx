import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, Lock, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SuspiciousLoginAlert } from '../../types/antiSpam';
import { toast } from 'react-hot-toast';

export const SuspiciousLoginBanner: React.FC<{ onOpenSecurityCenter?: () => void }> = ({ onOpenSecurityCenter }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SuspiciousLoginAlert[]>([]);
  const [dismissedLocally, setDismissedLocally] = useState(false);

  useEffect(() => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'suspicious_logins'),
        where('userId', '==', user.uid),
        where('status', '==', 'unacknowledged')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: SuspiciousLoginAlert[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setAlerts(list);
      }, (err) => {
        console.warn('Suspicious login fetch err:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      // ignore
    }
  }, [user]);

  if (!alerts.length || dismissedLocally) return null;

  const currentAlert = alerts[0];

  const handleConfirmThisWasMe = async () => {
    try {
      await updateDoc(doc(db, 'suspicious_logins', currentAlert.id), {
        status: 'confirmed_owner',
        acknowledgedAt: new Date().toISOString()
      });
      toast.success('ডিভাইসটি আপনার বিশ্বস্ত তালিকায় যুক্ত হয়েছে।', { icon: '🛡️' });
    } catch (e) {
      toast.error('সমস্যা হয়েছে।');
    }
  };

  const handleSecureAccount = async () => {
    try {
      await updateDoc(doc(db, 'suspicious_logins', currentAlert.id), {
        status: 'secured_by_owner',
        acknowledgedAt: new Date().toISOString()
      });
      onOpenSecurityCenter?.();
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-amber-950/90 border-b border-amber-500/40 text-white px-4 py-3 shadow-lg relative z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 shrink-0">
            <ShieldAlert size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-amber-200">
                নতুন ডিভাইস থেকে লগইন শনাক্ত হয়েছে!
              </h4>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                নিরাপত্তা সতর্কতা
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              আপনার অ্যাকাউন্টে <strong className="text-white">{currentAlert.deviceName}</strong> থেকে সম্প্রতি লগইন করা হয়েছে।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={handleConfirmThisWasMe}
            className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Check size={14} />
            হ্যাঁ, এটি আমি ছিলাম
          </button>
          <button
            onClick={handleSecureAccount}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Lock size={14} />
            অ্যাকাউন্ট সুরক্ষিত করুন
          </button>
          <button
            onClick={() => setDismissedLocally(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            title="লুকান"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
