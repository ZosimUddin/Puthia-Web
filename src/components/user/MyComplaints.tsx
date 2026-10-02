import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Calendar, 
  Eye, 
  Trash2, 
  RefreshCw,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  Send,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getComplaints, addComplaint } from '../../api';
import { Complaint } from '../../types';
import { toast } from 'sonner';

const SAMPLE_COMPLAINTS: Partial<Complaint & { ticketId: string; responseDate?: string }>[] = [
  {
    id: 'grs-1',
    ticketId: 'GRS-PUTHIA-7839',
    title: 'পুঠিয়া হাসপাতাল সংলগ্ন ড্রেন সংস্কার ও ডেঙ্গু মশক নিধন',
    department: 'পুঠিয়া পৌরসভা ও স্বাস্থ্য শাখা',
    description: 'উপজেলা স্বাস্থ্য কমপ্লেক্সের পূর্ব পাশে ড্রেনে পানি জমে মশার উপদ্রব বৃদ্ধি পেয়েছে। অনতিবিলম্বে স্প্রে ছিটানো প্রয়োজন।',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    adminReply: 'অভিযোগটি পৌরসভার মশক নিধন ও বর্জ্য ব্যবস্থাপনা টিমের নিকট পাঠানো হয়েছে। আগামী ২৪ ঘণ্টার মধ্যে কাজ শুরু হবে।',
    responseDate: '২১ জুলাই ২০২৬'
  },
  {
    id: 'grs-2',
    ticketId: 'GRS-PUTHIA-6102',
    title: 'রাজবাড়ি রোডে রাতের বেলা রাস্তার লাইট অকেজো',
    department: 'বিদ্যুৎ দপ্তর ও পৌর প্রকৌশল বিভাগ',
    description: 'রাজবাড়ি মোড় থেকে পাঁচ আনী মন্দির গামী রাস্তার ৪টি সড়ক বাতি অকেজো হয়ে অন্ধকারের সৃষ্টি করছে।',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    adminReply: 'সড়ক বাতি মেরামত টিম লাইট পরিদর্শনের মাধ্যমে নতুন এলইডি বাল্ব স্থাপন করেছে। সমস্যা সমাধানকৃত।',
    responseDate: '১৮ জুলাই ২০২৬'
  }
];

const MyComplaints: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    loadComplaints();
  }, [user]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      let firebaseComplaints: any[] = [];
      if (user) {
        const all = await getComplaints();
        firebaseComplaints = all.filter(c => c.userId === user.uid || c.email === user.email);
      }

      const localRaw = localStorage.getItem('user_submitted_complaints');
      const localComplaints = localRaw ? JSON.parse(localRaw) : [];

      const merged = [...firebaseComplaints, ...localComplaints];

      if (merged.length === 0) {
        setComplaints(SAMPLE_COMPLAINTS);
      } else {
        const unique = Array.from(new Map(merged.map(item => [item.id || item.ticketId, item])).values());
        setComplaints(unique);
      }
    } catch (err) {
      console.error("Error loading complaints:", err);
      setComplaints(SAMPLE_COMPLAINTS);
    } fontFinally: {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(item => {
    const statusVal = item.status || 'Pending';
    const matchesStatus = filterStatus === 'all' || statusVal === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      item.title?.toLowerCase().includes(q) ||
      (item.ticketId && item.ticketId.toLowerCase().includes(q)) ||
      (item.department && item.department.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'সমাধানকৃত':
      case 'নিস্পন্ন':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>সমাধানকৃত</span>
          </span>
        );
      case 'In Progress':
      case 'তদন্তাধীন':
      case 'প্রক্রিয়াধীন':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shrink-0 animate-pulse">
            <Clock size={13} className="text-amber-600" />
            <span>তদন্তাধীন</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1 shrink-0">
            <AlertTriangle size={13} className="text-purple-600" />
            <span>অপেক্ষমাণ</span>
          </span>
        );
    }
  };

  const handleDeleteComplaint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি অভিযোগের রেকর্ডটি সরাতে চান?")) return;
    const updated = complaints.filter(c => c.id !== id && c.ticketId !== id);
    setComplaints(updated);
    toast.success("অভিযোগের রেকর্ডটি সরানো হয়েছে!");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white p-6 rounded-none sm:rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-2 text-purple-200 text-xs font-bold">
              <ShieldAlert size={16} />
              <span>পাবলিক নালিশ ও অভিযোগ প্রতিকার সিস্টেম (GRS)</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95 shadow-xs shrink-0"
                title="পূর্ববর্তী পেজে ফিরে যান"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">আমার অভিযোগ</h1>
            </div>

            <p className="text-xs md:text-sm text-purple-100 max-w-xl">
              আপনার দাখিলকৃত সাধারণ নালিশ ও গণ-অভিযোগের সর্বশেষ অগ্রগতি ট্র্যাকিং ও প্রতিক্রিয়া দেখুন।
            </p>
          </div>

          <button
            onClick={() => navigate('/complaint')}
            className="px-5 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-black text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>নতুন অভিযোগ দাখিল করুন</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mx-4 sm:mx-0 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0">
            {complaints.length}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">মোট অভিযোগ</p>
            <p className="text-sm font-black text-slate-800">জিআরএস টিকিট</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">
            {complaints.filter(c => c.status === 'In Progress' || c.status === 'তদন্তাধীন').length}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">তদন্তাধীন</p>
            <p className="text-sm font-black text-amber-700">কাজ চলছে</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
            {complaints.filter(c => c.status === 'Resolved' || c.status === 'সমাধানকৃত').length}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500">সমাধানকৃত</p>
            <p className="text-sm font-black text-emerald-700">সম্পূর্ণ সমাধান</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="mx-4 sm:mx-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="অভিযোগ বা টিকিট আইডি দিয়ে অনুসন্ধান করুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 text-xs font-bold text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ক্লিয়ার
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <span className="text-[11px] font-black text-slate-400 uppercase shrink-0 flex items-center gap-1 mr-1">
            <Filter size={12} /> স্ট্যাটাস:
          </span>
          {[
            { key: 'all', label: 'সকল অভিযোগ' },
            { key: 'In Progress', label: 'তদন্তাধীন' },
            { key: 'Resolved', label: 'সমাধানকৃত' },
            { key: 'Pending', label: 'পেন্ডিং' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterStatus === tab.key
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 space-y-4">
          <AlertTriangle size={48} className="mx-auto text-slate-300" />
          <div>
            <h3 className="text-base font-black text-slate-800">কোনো অভিযোগ রেকার্ড পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {searchQuery ? `"${searchQuery}" এর সাথে কোনো টিকিট আইডি মেলেনি।` : 'আপনার কোনো অভিযোগ রেকর্ড জমা নেই।'}
            </p>
          </div>
          <button
            onClick={() => navigate('/complaint')}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus size={15} />
            <span>নতুন অভিযোগ দাখিল করুন</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 px-4 sm:px-0">
          {filteredComplaints.map((item) => (
            <div
              key={item.id || item.ticketId}
              onClick={() => setSelectedTicket(item)}
              className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100 font-black text-xs">
                    GRS
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">টিকিট আইডি</span>
                    <p className="text-xs font-black text-slate-900 group-hover:text-purple-700 transition-colors">{item.ticketId || item.id}</p>
                  </div>
                </div>
                <div>{getStatusBadge(item.status || 'Pending')}</div>
              </div>

              <div>
                <h3 className="text-xs md:text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  {item.title || 'গণ-অভিযোগ বিবরণ'}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              {/* Officer Reply Preview */}
              {item.adminReply && (
                <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/80 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-black text-[11px]">
                    <UserCheck size={14} />
                    <span>উপজেলা কর্মকর্তার মন্তব্য:</span>
                  </div>
                  <p className="text-emerald-900 text-xs line-clamp-2 italic">{item.adminReply}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('bn-BD') : 'সম্প্রতি'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTicket(item);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-purple-200"
                  >
                    <Eye size={13} />
                    <span>বিস্তারিত পড়ুন</span>
                  </button>

                  <button
                    onClick={(e) => handleDeleteComplaint(item.id || item.ticketId, e)}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer border border-rose-200"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">পাবলিক নালিশ টিকিট</span>
                  <h3 className="text-base font-black text-slate-900">{selectedTicket.title}</h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">টিকিট নং: {selectedTicket.ticketId || selectedTicket.id}</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Status Banner */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500">বর্তমান অবস্থা</p>
                  <div className="mt-1">{getStatusBadge(selectedTicket.status || 'Pending')}</div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-500">জমার তারিখ</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString('bn-BD') : 'সম্প্রতি'}
                  </p>
                </div>
              </div>

              {/* Complaint Description */}
              <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
                <p className="font-black text-slate-800">অভিযোগের বিষয়বস্তু:</p>
                <p className="text-slate-700 leading-relaxed">{selectedTicket.description}</p>
              </div>

              {/* Official Response */}
              {selectedTicket.adminReply ? (
                <div className="space-y-2 bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs">
                  <div className="flex items-center justify-between text-emerald-900 font-black">
                    <span className="flex items-center gap-1.5">
                      <UserCheck size={16} />
                      <span>দায়িত্বপ্রাপ্ত কর্মকর্তার মন্তব্য</span>
                    </span>
                    {selectedTicket.responseDate && (
                      <span className="text-[10px] font-bold text-emerald-700">{selectedTicket.responseDate}</span>
                    )}
                  </div>
                  <p className="text-emerald-950 font-medium leading-relaxed italic">{selectedTicket.adminReply}</p>
                </div>
              ) : (
                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-800 font-bold flex items-center gap-2">
                  <Clock size={16} className="text-amber-600 shrink-0" />
                  <span>উপজেলা সংশ্লিষ্ট বিভাগ অভিযোগটি পর্যবেক্ষণ করছে। খুব শীঘ্রই উত্তর দেওয়া হবে।</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyComplaints;
