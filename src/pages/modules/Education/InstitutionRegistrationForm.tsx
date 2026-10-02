import React, { useState } from 'react';
import { 
  School, User, Phone, MapPin, Mail, Globe, 
  FileText, Send, AlertCircle, CheckCircle2, 
  Clock, Users, GraduationCap, Building
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';

interface Props {
  onSuccess: () => void;
}

const UNIONS = [
  'পুঠিয়া',
  'বানেশ্বর',
  'বেলপুকুরিয়া',
  'ভালুকগাছি',
  'জিউপাড়া',
  'শিলমাড়িয়া'
];

const TYPES = [
  { id: 'primary', label: 'প্রাথমিক বিদ্যালয়' },
  { id: 'school', label: 'মাধ্যমিক বিদ্যালয়' },
  { id: 'college', label: 'উচ্চ মাধ্যমিক / কলেজ' },
  { id: 'madrasa', label: 'মাদ্রাসা' },
  { id: 'technical', label: 'কারিগরি ও ভোকেশনাল' },
  { id: 'higher_ed', label: 'বিশ্ববিদ্যালয় / উচ্চশিক্ষা' },
  { id: 'kindergarten', label: 'কিন্ডারগার্টেন' },
  { id: 'orphanage', label: 'এতিমখানা ও আবাসিক শিক্ষা' },
  { id: 'other', label: 'অন্যান্য' }
];

const InstitutionRegistrationForm: React.FC<Props> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    headName: '',
    applicantName: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    union: 'পুঠিয়া',
    type: 'school',
    description: '',
    studentCount: '',
    teacherCount: '',
    officeHours: 'সকাল ৯:০০ - বিকাল ৪:০০',
    registrationInfo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      setError('দয়া করে প্রতিষ্ঠানের নাম, ফোন এবং ঠিকানা প্রদান করুন।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'institutions_list'), {
        ...formData,
        studentCount: parseInt(formData.studentCount) || 0,
        teacherCount: parseInt(formData.teacherCount) || 0,
        status: 'pending',
        views: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: serverTimestamp(),
        userId: user?.uid || 'anonymous'
      });

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('আবেদনটি জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4">আবেদনটি সফলভাবে জমা হয়েছে!</h2>
        <p className="text-sm font-bold text-slate-500 leading-relaxed">
          আপনার প্রদত্ত তথ্য আমাদের টিম যাচাই করার পর শিক্ষা প্রতিষ্ঠান ডিরেক্টরিতে যুক্ত করা হবে। ধন্যবাদ।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-black border border-rose-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-indigo-600 mb-2">
          <Building className="w-5 h-5" />
          <h3 className="text-base font-black">সাধারণ তথ্য</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">প্রতিষ্ঠানের নাম *</label>
            <div className="relative">
              <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                required
                placeholder="যেমন: পুঠিয়া মডেল স্কুল"
                value={formData.name || ""}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">প্রতিষ্ঠানের ধরন</label>
            <select 
              value={formData.type || ""}
              onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
            >
              {TYPES.map(t => <option key={t.id} value={t.id || ""}>{t.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">আবেদনকারীর নাম *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                required
                placeholder="আপনার নাম লিখুন"
                value={formData.applicantName || ""}
                onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">প্রধান শিক্ষক/অধ্যক্ষ</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="নাম লিখুন"
                value={formData.headName || ""}
                onChange={e => setFormData({ ...formData, headName: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">যোগাযোগ নম্বর *</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="tel"
                required
                placeholder="০১৭XXXXXXXX"
                value={formData.phone || ""}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-indigo-600 mb-2">
          <MapPin className="w-5 h-5" />
          <h3 className="text-base font-black">অবস্থান</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">ইউনিয়ন *</label>
            <select 
              value={formData.union || ""}
              onChange={e => setFormData({ ...formData, union: e.target.value })}
              className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
            >
              {UNIONS.map(u => <option key={u} value={u || ""}>{u}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">ঠিকানা *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                required
                placeholder="বিস্তারিত ঠিকানা"
                value={formData.address || ""}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-indigo-600 mb-2">
          <Users className="w-5 h-5" />
          <h3 className="text-base font-black">পরিসংখ্যান ও সময়</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">শিক্ষার্থী সংখ্যা</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="number"
                placeholder="মোট শিক্ষার্থী"
                value={formData.studentCount || ""}
                onChange={e => setFormData({ ...formData, studentCount: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">শিক্ষক সংখ্যা</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="number"
                placeholder="মোট শিক্ষক"
                value={formData.teacherCount || ""}
                onChange={e => setFormData({ ...formData, teacherCount: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">অফিস সময়</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="যেমন: সকাল ৯টা - বিকাল ৪টা"
                value={formData.officeHours || ""}
                onChange={e => setFormData({ ...formData, officeHours: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description & Registration Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-indigo-600 mb-2">
          <FileText className="w-5 h-5" />
          <h3 className="text-base font-black">বিবরণ ও নিবন্ধন তথ্য</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">অনুমোদান বা নিবন্ধনের তথ্য (যদি থাকে)</label>
            <input 
              type="text"
              placeholder="নিবন্ধন নম্বর বা তথ্য"
              value={formData.registrationInfo || ""}
              onChange={e => setFormData({ ...formData, registrationInfo: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">প্রতিষ্ঠানের বিবরণ</label>
            <textarea 
              placeholder="প্রতিষ্ঠানের ইতিহাস, ফলাফল বা অন্যান্য বিশেষত্ব লিখুন..."
              value={formData.description || ""}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 min-h-[120px] outline-none"
            />
          </div>
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className={`w-full py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 border-none cursor-pointer ${
          loading 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-900/20'
        }`}
      >
        {loading ? 'প্রসেসিং হচ্ছে...' : (
          <>
            <Send className="w-5 h-5" /> আবেদন জমা দিন
          </>
        )}
      </button>
    </form>
  );
};

export default InstitutionRegistrationForm;
