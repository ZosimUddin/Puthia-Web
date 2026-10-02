import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Trophy, Calendar, Users, User, MapPin, Newspaper, 
  Image, Video, Activity, Phone, Send, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface SportsAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStaff: boolean;
  onSuccess: (msg: string) => void;
}

type ActiveForm = null | 'tournament' | 'match' | 'schedule' | 'club' | 'venue' | 'news' | 'photo' | 'video' | 'proposal';

export const SportsAddModal: React.FC<SportsAddModalProps> = ({ isOpen, onClose, isStaff, onSuccess }) => {
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form States
  const [tournamentForm, setTournamentForm] = useState({
    name: '', organizer: '', startDate: '', venue: '', status: 'আসন্ন', prize: ''
  });

  const [matchForm, setMatchForm] = useState({
    sport: 'ফুটবল', tournament: '', teamA: '', teamB: '', scoreA: '', scoreB: '', time: '১ম হাফ', isLive: true, venue: '', organizerPhone: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    sport: 'ফুটবল', teamA: '', teamB: '', date: '', time: '', venue: ''
  });

  const [clubForm, setClubForm] = useState({
    name: '', description: '', phone: '', sport: 'ফুটবল'
  });

  const [venueForm, setVenueForm] = useState({
    name: '', type: 'খেলার মাঠ', capacity: '', location: '', contact: '', image: ''
  });

  const [newsForm, setNewsForm] = useState({
    title: '', content: '', date: '', source: ''
  });

  const [mediaForm, setMediaForm] = useState({
    type: 'photo' as 'photo' | 'video', title: '', url: ''
  });

  // General user proposal form
  const [proposalForm, setProposalForm] = useState({
    category: 'tournament', title: '', content: '', contact: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let collectionName = '';
      let data: any = {};

      if (!isStaff) {
        collectionName = 'sports_proposals';
        data = {
          ...proposalForm,
          status: 'pending',
          createdAt: serverTimestamp()
        };
      } else {
        switch (activeForm) {
          case 'tournament':
            collectionName = 'sports_tournaments';
            data = { ...tournamentForm, createdAt: serverTimestamp() };
            break;
          case 'match':
            collectionName = 'sports_matches';
            data = { ...matchForm, scoreA: matchForm.scoreA || '০', scoreB: matchForm.scoreB || '০', createdAt: serverTimestamp() };
            break;
          case 'schedule':
            collectionName = 'sports_schedules';
            data = { ...scheduleForm, createdAt: serverTimestamp() };
            break;
          case 'club':
            collectionName = 'sports_clubs';
            data = { ...clubForm, createdAt: serverTimestamp() };
            break;
          case 'venue':
            collectionName = 'sports_venues';
            data = { ...venueForm, createdAt: serverTimestamp() };
            break;
          case 'news':
            collectionName = 'sports_news';
            data = { ...newsForm, createdAt: serverTimestamp() };
            break;
          case 'photo':
          case 'video':
            collectionName = 'sports_gallery';
            data = { 
              type: activeForm, 
              title: mediaForm.title, 
              url: mediaForm.url || (activeForm === 'photo' 
                ? 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600'
                : 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=600'),
              createdAt: serverTimestamp() 
            };
            break;
        }
      }

      await addDoc(collection(db, collectionName), data);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveForm(null);
        onSuccess(isStaff ? 'তথ্যটি সফলভাবে যুক্ত করা হয়েছে' : 'প্রস্তাবটি অনুমোদনের জন্য জমা দেওয়া হয়েছে');
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('দুঃখিত, কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuOptions = [
    { id: 'tournament', label: '🏆 টুর্নামেন্ট যোগ করুন', desc: 'নতুন টুর্নামেন্টের বিবরণ ও পুরস্কার' },
    { id: 'match', label: '⚽ ম্যাচের ফলাফল যোগ করুন', desc: 'চলমান বা সমাপ্ত ম্যাচের লাইভ স্কোর' },
    { id: 'schedule', label: '📅 খেলার সময়সূচী যোগ করুন', desc: 'আসন্ন ম্যাচের দিনক্ষণ ও ভেন্যু' },
    { id: 'club', label: '👥 নতুন ক্লাব নিবন্ধন করুন', desc: 'পুঠিয়ার স্থানীয় ফুটবল/ক্রিকেট ক্লাব' },
    { id: 'venue', label: '🏟️ মাঠের তথ্য যোগ করুন', desc: 'স্টেডিয়াম বা স্থানীয় মাঠের সুবিধা' },
    { id: 'news', label: '📰 খেলাধুলার সংবাদ যোগ করুন', desc: 'ক্রীড়াঙ্গনের সর্বশেষ খবর ও আপডেট' },
    { id: 'photo', label: '📷 ছবি আপলোড করুন', desc: 'খেলাধুলার বিশেষ মুহূর্তের ছবি' },
    { id: 'video', label: '🎥 ভিডিও আপলোড করুন', desc: 'ম্যাচ হাইলাইটস বা ক্রীড়া ভিডিও' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Sheet Container */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative bg-white w-full sm:max-w-xl md:max-w-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-50 to-emerald-100/30">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {showSuccess ? 'অভিনন্দন!' : activeForm ? 'নতুন তথ্য ফরম' : isStaff ? 'ক্রীড়া কন্ট্রোল সেন্টার ➕' : 'তথ্য প্রস্তাব করুন 📝'}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {isStaff ? 'সরাসরি পোর্টালের তথ্য হালনাগাদ করুন' : 'পুঠিয়ার খেলাধুলার যেকোনো তথ্য প্রস্তাব করুন'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition hover:shadow-sm"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-100 animate-pulse">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-xl font-black text-slate-900">
                  {isStaff ? 'সফলভাবে যুক্ত হয়েছে!' : 'প্রস্তাব জমা হয়েছে!'}
                </h4>
                <p className="text-xs font-bold text-slate-500 max-w-sm">
                  {isStaff 
                    ? 'আপনার নতুন ক্রীড়া রেকর্ডটি সাথে সাথে সাইটে যুক্ত করা হলো।' 
                    : 'আপনার প্রস্তাবটি এডমিন প্যানেলে পাঠানো হয়েছে। যাচাইকরণের পর এটি প্রকাশ করা হবে। ধন্যবাদ!'}
                </p>
              </motion.div>
            ) : !activeForm ? (
              // Option Menu or Standard Proposal Selection
              <motion.div 
                key="menu"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {isStaff ? (
                  // Grid of 8 buttons for staff
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {menuOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setActiveForm(option.id as ActiveForm)}
                        className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-left hover:bg-emerald-50/50 hover:border-emerald-500/20 hover:shadow-sm transition duration-200 group"
                      >
                        <div className="mt-0.5 group-hover:scale-110 transition duration-200 shrink-0">
                          {option.label.split(' ')[0]}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-800 group-hover:text-emerald-900 transition">
                            {option.label.split(' ').slice(1).join(' ')}
                          </div>
                          <div className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-700/60 mt-0.5 leading-tight">
                            {option.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  // Simple info proposal card for general users
                  <div className="space-y-4">
                    <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl space-y-2">
                      <h4 className="text-sm font-black text-emerald-950">কেন তথ্য প্রস্তাব করবেন?</h4>
                      <p className="text-xs font-semibold text-emerald-800/80 leading-relaxed">
                        আপনি কি পুঠিয়ার কোনো টুর্নামেন্ট, ক্লাব, মাঠ বা চলমান ম্যাচের খবর জানেন? আমাদের সাথে শেয়ার করুন! আপনার প্রস্তাবিত তথ্য যাচাই করে এডমিন টিম মূল পোর্টালে প্রকাশ করবে।
                      </p>
                    </div>

                    <button 
                      onClick={() => setActiveForm('proposal')}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 transition"
                    >
                      <Send size={16} /> প্রস্তাব ফরমটি খুলুন
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              // Specific Form View
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Back Link */}
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="text-xs font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mb-2"
                >
                  ← অপশনে ফিরে যান
                </button>

                {/* 1. TOURNAMENT FORM */}
                {activeForm === 'tournament' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 border-b pb-2">🏆 নতুন টুর্নামেন্ট তথ্য</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">টুর্নামেন্টের নাম *</label>
                        <input type="text" required value={tournamentForm.name || ""} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} placeholder="যেমন: স্বাধীনতা কাপ গোল্ডকাপ ২০২৬" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">আয়োজক সংস্থা *</label>
                        <input type="text" required value={tournamentForm.organizer || ""} onChange={e => setTournamentForm({...tournamentForm, organizer: e.target.value})} placeholder="যেমন: পুঠিয়া ক্রীড়া পরিষদ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">শুরুর তারিখ *</label>
                        <input type="text" required value={tournamentForm.startDate || ""} onChange={e => setTournamentForm({...tournamentForm, startDate: e.target.value})} placeholder="যেমন: ১৫ আগস্ট ২০২৬" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">খেলার ভেন্যু *</label>
                        <input type="text" required value={tournamentForm.venue || ""} onChange={e => setTournamentForm({...tournamentForm, venue: e.target.value})} placeholder="যেমন: পুঠিয়া পিএন স্কুল মাঠ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">পুরস্কারের বিবরণ *</label>
                        <input type="text" required value={tournamentForm.prize || ""} onChange={e => setTournamentForm({...tournamentForm, prize: e.target.value})} placeholder="যেমন: ট্রফি ও ৫০,০০০ টাকা নগদ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">অবস্থা</label>
                        <select value={tournamentForm.status || ""} onChange={e => setTournamentForm({...tournamentForm, status: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none">
                          <option value="আসন্ন">আসন্ন (Upcoming)</option>
                          <option value="চলমান">চলমান (Ongoing)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. MATCH FORM */}
                {activeForm === 'match' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 border-b pb-2">⚽ ম্যাচের লাইভ ফলাফল</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">খেলার ধরণ *</label>
                        <select value={matchForm.sport || ""} onChange={e => setMatchForm({...matchForm, sport: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none">
                          <option value="ফুটবল">⚽ ফুটবল</option>
                          <option value="ক্রিকেট">�� ক্রিকেট</option>
                          <option value="ভলিবল">🏐 ভলিবল</option>
                          <option value="অন্যান্য">🏆 অন্যান্য</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">টুর্নামেন্টের নাম *</label>
                        <input type="text" required value={matchForm.tournament || ""} onChange={e => setMatchForm({...matchForm, tournament: e.target.value})} placeholder="যেমন: উপজেলা গোল্ডকাপ ২০২৬" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">দল ১ (হোম) *</label>
                        <input type="text" required value={matchForm.teamA || ""} onChange={e => setMatchForm({...matchForm, teamA: e.target.value})} placeholder="যেমন: পুঠিয়া একাদশ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">দল ২ (অ্যাওয়ে) *</label>
                        <input type="text" required value={matchForm.teamB || ""} onChange={e => setMatchForm({...matchForm, teamB: e.target.value})} placeholder="যেমন: বানেশ্বর স্পোর্টিং ক্লাব" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">দল ১ স্কোর (ঐচ্ছিক)</label>
                        <input type="text" value={matchForm.scoreA || ""} onChange={e => setMatchForm({...matchForm, scoreA: e.target.value})} placeholder="যেমন: ২ (ফুটবল) বা ১৪৫/৬ (ক্রিকেট)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">দল ২ স্কোর (ঐচ্ছিক)</label>
                        <input type="text" value={matchForm.scoreB || ""} onChange={e => setMatchForm({...matchForm, scoreB: e.target.value})} placeholder="যেমন: ১ (ফুটবল) বা ১২০/১০ (ক্রিকেট)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">খেলার সময়/অবস্থা *</label>
                        <input type="text" required value={matchForm.time || ""} onChange={e => setMatchForm({...matchForm, time: e.target.value})} placeholder="যেমন: ৪৫ মিনিট, সমাপ্ত, ২য় ইনিংস" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">মাঠ/ভেন্যু *</label>
                        <input type="text" required value={matchForm.venue || ""} onChange={e => setMatchForm({...matchForm, venue: e.target.value})} placeholder="যেমন: বানেশ্বর কলেজ মাঠ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">যোগাযোগ নম্বর *</label>
                        <input type="text" required value={matchForm.organizerPhone || ""} onChange={e => setMatchForm({...matchForm, organizerPhone: e.target.value})} placeholder="যেমন: ০১৭০০-০০০০০০" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={matchForm.isLive} onChange={e => setMatchForm({...matchForm, isLive: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-200" />
                          <span className="text-xs font-bold text-slate-700">ম্যাচটি বর্তমানে লাইভ চলছে</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SCHEDULE FORM */}
                {activeForm === 'schedule' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 border-b pb-2">📅 আসন্ন খেলার সময়সূচী</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">খেলার ধরণ *</label>
                        <select value={scheduleForm.sport || ""} onChange={e => setScheduleForm({...scheduleForm, sport: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none">
                          <option value="ফুটবল">⚽ ফুটবল</option>
                          <option value="ক্রিকেট">🏏 ক্রিকেট</option>
                          <option value="ভলিবল">🏐 ভলিবল</option>
                          <option value="অন্যান্য">🏆 অন্যান্য</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">দল ১ (হোম) *</label>
                        <input type="text" required value={scheduleForm.teamA || ""} onChange={e => setScheduleForm({...scheduleForm, teamA: e.target.value})} placeholder="যেমন: জিউপাড়া একাদশ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">দল ২ (অ্যাওয়ে) *</label>
                        <input type="text" required value={scheduleForm.teamB || ""} onChange={e => setScheduleForm({...scheduleForm, teamB: e.target.value})} placeholder="যেমন: বেলপুকুরিয়া একাদশ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">তারিখ *</label>
                        <input type="text" required value={scheduleForm.date || ""} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} placeholder="যেমন: ৫ আগস্ট ২০২৬" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">সময় *</label>
                        <input type="text" required value={scheduleForm.time || ""} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} placeholder="যেমন: বিকেল ৪:০০" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">খেলার ভেন্যু *</label>
                        <input type="text" required value={scheduleForm.venue || ""} onChange={e => setScheduleForm({...scheduleForm, venue: e.target.value})} placeholder="যেমন: পুঠিয়া পিএন স্কুল মাঠ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. CLUB FORM */}
                {activeForm === 'club' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 border-b pb-2">👥 নতুন ক্লাব নিবন্ধন</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">ক্লাবের নাম *</label>
                        <input type="text" required value={clubForm.name || ""} onChange={e => setClubForm({...clubForm, name: e.target.value})} placeholder="যেমন: পুঠিয়া সূর্যমুখী স্পোর্টিং ক্লাব" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">খেলার ধরণ</label>
                        <select value={clubForm.sport || ""} onChange={e => setClubForm({...clubForm, sport: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none">
                          <option value="ফুটবল">⚽ ফুটবল</option>
                          <option value="ক্রিকেট">🏏 ক্রিকেট</option>
                          <option value="মাল্টি-স্পোর্টস">🏆 মাল্টি-স্পোর্টস</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">যোগাযোগ ফোন নম্বর *</label>
                        <input type="text" required value={clubForm.phone || ""} onChange={e => setClubForm({...clubForm, phone: e.target.value})} placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)</label>
                        <textarea value={clubForm.description || ""} onChange={e => setClubForm({...clubForm, description: e.target.value})} placeholder="ক্লাবের প্রতিষ্ঠা সাল ও সফলতার বিবরণ লিখুন..." rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. VENUE FORM */}
                {activeForm === 'venue' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 border-b pb-2">🏟️ খেলার মাঠের তথ্য</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">মাঠ/স্টেডিয়ামের নাম *</label>
                        <input type="text" required value={venueForm.name || ""} onChange={e => setVenueForm({...venueForm, name: e.target.value})} placeholder="যেমন: ঝলমলিয়া স্কুল খেলার মাঠ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">মাঠের ধরণ *</label>
                        <input type="text" required value={venueForm.type || ""} onChange={e => setVenueForm({...venueForm, type: e.target.value})} placeholder="যেমন: ফুটবল ও ক্রিকেট মাঠ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">ধারন ক্ষমতা (ঐচ্ছিক)</label>
                        <input type="text" value={venueForm.capacity || ""} onChange={e => setVenueForm({...venueForm, capacity: e.target.value})} placeholder="যেমন: ৩,০০০ দর্শক" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">অবস্থান/ঠিকানা *</label>
                        <input type="text" required value={venueForm.location || ""} onChange={e => setVenueForm({...venueForm, location: e.target.value})} placeholder="যেমন: ঝলমলিয়া বাজার সংলগ্ন, পুঠিয়া" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">যোগাযোগ নম্বর *</label>
                        <input type="text" required value={venueForm.contact || ""} onChange={e => setVenueForm({...venueForm, contact: e.target.value})} placeholder="যেমন: ০১৭০০-০০০০০০" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">মাঠের ছবি (URL লিং)</label>
                        <input type="text" value={venueForm.image || ""} onChange={e => setVenueForm({...venueForm, image: e.target.value})} placeholder="https://unsplash.com/... (বা ফাঁকা রাখুন ডেমো ছবির জন্য)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. NEWS FORM */}
                {activeForm === 'news' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 border-b pb-2">📰 খেলাধুলার সংবাদ</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">সংবাদের শিরোনাম *</label>
                        <input type="text" required value={newsForm.title || ""} onChange={e => setNewsForm({...newsForm, title: e.target.value})} placeholder="যেমন: ঝলমলিয়াকে হারিয়ে পুঠিয়া একাদশের দুর্দান্ত জয়!" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">সংবাদের উৎস/সূত্র</label>
                        <input type="text" value={newsForm.source || ""} onChange={e => setNewsForm({...newsForm, source: e.target.value})} placeholder="যেমন: পুঠিয়া রিপোর্টার্স ফোরাম" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">তারিখ</label>
                        <input type="text" value={newsForm.date || ""} onChange={e => setNewsForm({...newsForm, date: e.target.value})} placeholder="যেমন: ১ আগস্ট ২০২৬" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">সংবাদ বিবরণ *</label>
                        <textarea required value={newsForm.content || ""} onChange={e => setNewsForm({...newsForm, content: e.target.value})} placeholder="বিস্তারিত সংবাদটি এখানে লিখুন..." rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 7 & 8. PHOTO / VIDEO MEDIA FORM */}
                {(activeForm === 'photo' || activeForm === 'video') && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 border-b pb-2">
                      {activeForm === 'photo' ? '📷 ছবি আপলোড ও শেয়ার' : '🎥 ভিডিও ক্লিপস শেয়ার'}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">মিডিয়া শিরোনাম *</label>
                        <input type="text" required value={mediaForm.title || ""} onChange={e => setMediaForm({...mediaForm, title: e.target.value})} placeholder="যেমন: গোল্ডকাপ ফাইনালের সেরা মুহূর্ত" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          {activeForm === 'photo' ? 'ছবির URL লিঙ্ক (যেমন Unsplash বা সামাজিক যোগাযোগ মাধ্যম থেকে)' : 'ভিডিওর URL লিঙ্ক (যেমন YouTube, Facebook বা ড্রাইভ লিঙ্ক)'}
                        </label>
                        <input type="text" value={mediaForm.url || ""} onChange={e => setMediaForm({...mediaForm, url: e.target.value})} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. GENERAL USER PROPOSAL FORM */}
                {activeForm === 'proposal' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 border-b pb-2">📝 নতুন ক্রীড়া তথ্য প্রস্তাব করুন</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">প্রস্তাবিত তথ্যের বিভাগ *</label>
                        <select value={proposalForm.category || ""} onChange={e => setProposalForm({...proposalForm, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none">
                          <option value="tournament">🏆 টুর্নামেন্ট বিবরণ</option>
                          <option value="match">⚽ ম্যাচের লাইভ স্কোর/ফলাফল</option>
                          <option value="schedule">📅 আসন্ন খেলার সময়সূচী</option>
                          <option value="club">👥 স্থানীয় ক্লাবের তথ্য</option>
                          <option value="venue">🏟️ মাঠের বিবরণ</option>
                          <option value="news">📰 খেলাধুলার সংবাদ</option>
                          <option value="media">📷 ছবি/ভিডিও ক্লিপস</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">তথ্যের শিরোনাম *</label>
                        <input type="text" required value={proposalForm.title || ""} onChange={e => setProposalForm({...proposalForm, title: e.target.value})} placeholder="যেমন: বানেশ্বর বাজারে নাইট-টুনামেন্ট আয়োজন" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">বিস্তারিত তথ্য বিবরণ *</label>
                        <textarea required value={proposalForm.content || ""} onChange={e => setProposalForm({...proposalForm, content: e.target.value})} placeholder="বিস্তারিত মাঠের নাম, সময়, দল এবং খেলা সম্পর্কে যা কিছু জানেন লিখুন..." rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">আপনার নাম ও যোগাযোগ নম্বর (যাচাইকরণের জন্য) *</label>
                        <input type="text" required value={proposalForm.contact || ""} onChange={e => setProposalForm({...proposalForm, contact: e.target.value})} placeholder="যেমন: শাকিল হোসেন - ০১৭০০-০০০০০০" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/10 transition mt-6 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      {isStaff ? 'পোর্টালে যুক্ত করুন' : 'অনুমোদনের জন্য জমা দিন'}
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
