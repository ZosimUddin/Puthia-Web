import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Check, X, AlertTriangle, Eye, Clock, Filter, Trash2, Ban } from 'lucide-react';

export interface ModerationQueueItem {
  id: string;
  type: 'listing' | 'review' | 'comment' | 'report';
  title: string;
  submittedBy: string;
  submittedAt: string;
  riskScore: number;
  flaggedReasons: string[];
  contentDetails: {
    phone?: string;
    description?: string;
    location?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
}

export const ModerationQueueView: React.FC = () => {
  const [queue, setQueue] = useState<ModerationQueueItem[]>([
    {
      id: "MOD-801",
      type: "listing",
      title: "বিনামূল্যে পার্ট টাইম অনলাইনে কাজের অফার",
      submittedBy: "ইউজার-৩৯৪০",
      submittedAt: "১০ মিনিট আগে",
      riskScore: 85,
      flaggedReasons: ["স্প্যাম কি-ওয়ার্ড সনাক্ত: 'সহজে আয়'", "অকার্যকর ফোন নম্বর"],
      contentDetails: { phone: "0109823412", description: "ঘরে বসে দিনে ৫০০ টাকা আয় করুন। কোনো অভিজ্ঞতা লাগবে না।", location: "পুঠিয়া সদর" },
      status: "pending"
    },
    {
      id: "MOD-802",
      type: "review",
      title: "পুঠিয়া ডায়াগনস্টিক সেন্টার - ফেক রিভিউ সংকেত",
      submittedBy: "ইউজার-১২০৯",
      submittedAt: "২৫ মিনিট আগে",
      riskScore: 65,
      flaggedReasons: ["সংক্ষিপ্ত একপেশে রিভিউ", "১ মিনিটের মধ্যে একাধিক রিভিউ জমা দেয়া হয়েছে"],
      contentDetails: { description: "বাজে সার্ভিস একদম ফালতু।" },
      status: "pending"
    },
    {
      id: "MOD-803",
      type: "listing",
      title: "বানেশ্বর রাইস মিল ও পাইকারি চাল ডিলার",
      submittedBy: "ইউজার-৫৫১২",
      submittedAt: "১ ঘণ্টা আগে",
      riskScore: 45,
      flaggedReasons: ["স্বল্প সময়ে ঘনঘন সাবমিশন (Rate limit)"],
      contentDetails: { phone: "01712345678", description: "বানেশ্বর হাটের বিখ্যাত চাল ডিলার ও মিল মালিক।", location: "বানেশ্বর বাজার" },
      status: "pending"
    }
  ]);

  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null);

  const handleApprove = (id: string) => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
    setSelectedItem(null);
  };

  const handleReject = (id: string) => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item));
    setSelectedItem(null);
  };

  const pendingItems = queue.filter(i => i.status === 'pending');

  return (
    <div className="space-y-6">
      
      {/* Moderation Queue Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-amber-400" /> Fraud & Moderation Safety Queue
          </span>
          <h2 className="text-xl sm:text-2xl font-black">সন্দেহজনক তথ্য ও ফ্রড নিয়ন্ত্রণ মডারেশন কিউ</h2>
          <p className="text-xs text-amber-100/90 font-medium max-w-xl">
            সন্দেহজনক কোনো পোস্ট বা রিভিউ সরাসরি মুছে ফেলা হবে না; অ্যাডমিন ম্যানুয়ালি যাচাই করে অনুমোদন বা বাতিল করবেন।
          </p>
        </div>

        <div className="px-4 py-2.5 bg-amber-500/20 border border-amber-400/30 rounded-2xl text-center">
          <span className="text-[10px] text-amber-200 font-black block uppercase">অপেক্ষমাণ আইটেম</span>
          <span className="text-2xl font-black text-amber-300">{pendingItems.length} টি</span>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-amber-600" />
            অপেক্ষমাণ ফ্লাগকৃত তথ্যসমূহ
          </h3>
        </div>

        {pendingItems.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <ShieldCheck size={48} className="mx-auto text-emerald-600" />
            <h4 className="text-base font-black text-slate-800">কোনো ফ্লাগকৃত আইটেম নেই!</h4>
            <p className="text-xs text-slate-500 font-bold">সকল জমা হওয়া তথ্য নিরাপদ ও ভেরিফাইড</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingItems.map((item) => (
              <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 p-3 rounded-2xl transition-colors">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      item.riskScore >= 70 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      ঝুঁকি স্কোর: {item.riskScore}%
                    </span>
                    <span className="text-xs font-black text-slate-500 uppercase">{item.type}</span>
                    <span className="text-xs text-slate-400 font-bold">• {item.submittedAt}</span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.flaggedReasons.map((reason, rIdx) => (
                      <span key={rIdx} className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[10px] font-bold">
                        ⚠️ {reason}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={14} /> অনুমোদন
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <X size={14} /> বাতিল
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
