import React, { useState, useEffect } from "react";
import { ArrowLeft, BarChart2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Poll, Vote } from "../types";
import { submitVote, getUserVote } from "../api";

interface Props { onGoBack: () => void; }

export const LocalPolls: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"active" | "past">("active");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "polls"), where("status", "==", filter));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pollList: Poll[] = [];
      snapshot.forEach((doc) => {
        pollList.push({ id: doc.id, ...doc.data() } as Poll);
      });
      setPolls(pollList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }, (err) => {
      console.error("Polls subscription error:", err);
      setError("পোল লোড করতে সমস্যা হচ্ছে।");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  useEffect(() => {
    const fetchVotes = async () => {
      if (!auth.currentUser) return;
      
      const votesMap: Record<string, number> = {};
      for (const poll of polls) {
        const vote = await getUserVote(poll.id, auth.currentUser.uid);
        if (vote) {
          votesMap[poll.id] = vote.optionIndex;
        }
      }
      setUserVotes(votesMap);
    };

    if (polls.length > 0) {
      fetchVotes();
    }
  }, [polls]);

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!auth.currentUser) {
      setError("ভোট দিতে দয়া করে লগইন করুন।");
      return;
    }
    if (userVotes[pollId] !== undefined) return;

    setVotingId(pollId);
    try {
      await submitVote({
        pollId,
        userId: auth.currentUser.uid,
        optionIndex,
        createdAt: new Date().toISOString()
      });
      setUserVotes(prev => ({ ...prev, [pollId]: optionIndex }));
    } catch (err: any) {
      setError(err.message || "ভোট দিতে সমস্যা হয়েছে।");
    } finally {
      setVotingId(null);
    }
  };

  const getPercentage = (votes: Record<string, number> | undefined, index: number, total: number) => {
    if (!votes || total === 0) return 0;
    const count = votes[index.toString()] || 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #2D1B4E, #1F1137)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-emerald-600 text-sm font-medium mb-2 uppercase tracking-wide">নাগরিক মতামত</p>
          <h1 className="text-4xl font-black mb-1 text-white">স্থানীয় ভোট ও জরিপ</h1>
          <div className="w-10 h-1 bg-white rounded-full my-3"></div>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
            পুঠিয়ার বিভিন্ন উন্নয়নমূলক কাজ ও সামাজিক বিষয়ে আপনার মূল্যবান ভোট দিয়ে মতামত জানান।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
            <AlertCircle size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("active")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "active"
                ? "bg-[#2D1B4E] text-[#FFB300] shadow-md border border-[#FFB300]/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <BarChart2 className={`w-4 h-4 ${filter === "active" ? 'text-[#FFB300]' : 'text-gray-400'}`}/>
            চলমান জরিপ
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "past"
                ? "bg-[#2D1B4E] text-[#FFB300] shadow-md border border-[#FFB300]/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Clock className={`w-4 h-4 ${filter === "past" ? 'text-[#FFB300]' : 'text-gray-400'}`}/>
            আগের ফলাফল
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <div className="w-8 h-8 border-4 border-[#2D1B4E] border-t-[#FFB300] rounded-full animate-spin"></div>
              <p className="text-xs font-bold">লোড হচ্ছে...</p>
            </div>
          ) : polls.length > 0 ? (
            polls.map((poll) => {
              const hasVoted = userVotes[poll.id] !== undefined;
              return (
                <div key={poll.id} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 flex flex-col gap-4 relative overflow-hidden animate-fade-in" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${filter === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${filter === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${filter === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                        {filter === 'active' ? 'লাইভ পোল' : 'সমাপ্ত'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                      মোট ভোট: {poll.totalVotes || 0}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1F1137] leading-relaxed">
                    {poll.question}
                  </h3>

                  <div className="space-y-3">
                    {poll.options.map((option, idx) => {
                      const percent = getPercentage(poll.votes, idx, poll.totalVotes || 0);
                      const isUserChoice = userVotes[poll.id] === idx;
                      
                      return (
                        <div 
                          key={idx} 
                          className={`relative w-full bg-gray-50 rounded-xl overflow-hidden h-12 flex items-center px-4 transition-all ${!hasVoted && filter === 'active' ? 'cursor-pointer hover:bg-gray-100 group' : ''}`}
                          onClick={() => !hasVoted && filter === 'active' && handleVote(poll.id, idx)}
                        >
                          <div 
                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isUserChoice ? 'bg-[#FFB300]/20' : 'bg-indigo-500/10'}`} 
                            style={{width: `${percent}%`}}
                          ></div>
                          <div className="relative z-10 flex justify-between w-full items-center">
                            <span className={`text-sm font-bold flex items-center gap-3 ${isUserChoice ? 'text-[#2D1B4E]' : 'text-gray-700'}`}>
                              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isUserChoice ? "border-[#FFB300] bg-[#FFB300]/10" : "border-gray-300"}`}>
                                {isUserChoice && <Check size={12} strokeWidth={4} className="text-[#2D1B4E]" />}
                              </span>
                              {option}
                            </span>
                            {hasVoted && <span className="text-sm font-black text-[#1F1137]">{percent}%</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filter === 'active' && (
                    <div className="mt-2">
                      {!hasVoted ? (
                        <div className="text-[10px] text-gray-400 text-center font-medium flex items-center justify-center gap-1">
                          <Info size={12} /> আপনার মতামত জানাতে একটি অপশনে ক্লিক করুন
                        </div>
                      ) : (
                        <div className="bg-green-50 text-green-600 py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 border border-green-100">
                          <CheckCircle2 className="w-4 h-4" /> আপনার ভোট সফলভাবে গৃহীত হয়েছে
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center py-12 animate-fade-in">
              <BarChart2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">এই মুহূর্তে কোনো জরিপ নেই</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Check = ({ size, className, strokeWidth }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth || 2} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Info = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
