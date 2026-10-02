import React, { useState, useEffect } from "react";
import { ArrowLeft, History, Calendar, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

interface DonationRecord {
  id: string;
  date: string;
  location: string;
  bloodGroup: string;
}

interface Props { onGoBack: () => void; }

export const BloodDonationHistory: React.FC<Props> = ({ onGoBack }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const q = query(collection(db, "blood_donations"), where("userId", "==", user.uid), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const data: DonationRecord[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as DonationRecord));
        setHistory(data);
      } catch (err: any) {
        console.error("Error fetching donation history:", err.code, err.message, err);
        alert(`রক্তদানের ইতিহাস আনতে সমস্যা হয়েছে। বিস্তারিত: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #e11d48, #9f1239)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10 border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <h1 className="text-3xl font-black mb-1 text-white">সফল রক্তদান ইতিহাস</h1>
          <p className="text-rose-100 text-sm">আপনার মহৎ রক্তদানের তালিকা ও তথ্য</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-500">লোড হচ্ছে...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">এখনো কোনো সফল রক্তদানের ইতিহাস পাওয়া যায়নি।</p>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <div key={record.id} className="flex items-center gap-4 p-4 border border-gray-100 dark:border-zinc-800 rounded-2xl">
                <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">{record.location}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(record.date).toLocaleDateString()}</span>
                    <span className="font-bold bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded text-rose-800 dark:text-rose-300">{record.bloodGroup}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
