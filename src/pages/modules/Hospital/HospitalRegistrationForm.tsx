import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Phone, MapPin, User, FileText, 
  Send, AlertCircle, Clock, Zap, Map as MapIcon,
  CheckCircle2, BedDouble, Truck, LayoutGrid, Accessibility, Globe, Mail, MessageSquare
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { UNIONS, RAJSHAHI_UPAZILAS, HOSPITAL_TYPES, FACILITIES_LIST, SERVICES_LIST, DEPARTMENTS_LIST } from './constants';
import { toast } from 'sonner';

interface HospitalRegistrationFormProps {
  onSuccess: () => void;
}

const HospitalRegistrationForm: React.FC<HospitalRegistrationFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'সরকারি',
    ownership: '',
    licenseNumber: '',
    establishedYear: '',
    ownerName: '',
    contactPerson: '',
    phone: '',
    emergencyHotline: '',
    whatsapp: '',
    email: '',
    website: '',
    address: '',
    upazila: 'পুঠিয়া',
    union: 'পুঠিয়া',
    village: '',
    description: '',
    openingTime: '২৪ ঘণ্টা খোলা',
    bedCount: '',
    googleMapUrl: '',
    imageUrl: '',
    coverImageUrl: '',
    selectedDepartments: [] as string[],
    selectedServices: [] as string[],
    selectedFacilities: [] as string[],
    hasEmergency24h: true,
    hasAmbulance: false,
    hasParking: false,
    isDisabledFriendly: false,
    acceptsInsurance: false,
    acceptsGovtHealthCard: false
  });

  const handleToggleArrayItem = (field: 'selectedDepartments' | 'selectedServices' | 'selectedFacilities', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') || `hospital-${Date.now()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setError('দয়া করে হাসপাতালের নাম, যোগাযোগ নম্বর এবং ঠিকানা প্রদান করুন।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const slug = generateSlug(formData.name);
      await addDoc(collection(db, 'hospitals_list'), {
        name: formData.name.trim(),
        slug,
        type: formData.type,
        ownership: formData.ownership,
        licenseNumber: formData.licenseNumber,
        establishedYear: formData.establishedYear,
        ownerName: formData.ownerName,
        contactPerson: formData.contactPerson,
        phone: formData.phone.trim(),
        emergencyHotline: formData.emergencyHotline || formData.phone,
        whatsapp: formData.whatsapp || formData.phone,
        email: formData.email,
        website: formData.website,
        address: formData.address.trim(),
        union: formData.union,
        village: formData.village,
        description: formData.description.trim(),
        openingTime: formData.openingTime,
        bedCount: parseInt(formData.bedCount) || 0,
        googleMapUrl: formData.googleMapUrl,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
        coverImageUrl: formData.coverImageUrl || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=80',
        departments: formData.selectedDepartments.length > 0 ? formData.selectedDepartments : ['জরুরি বিভাগ', 'বহির্বিভাগ'],
        services: formData.selectedServices.length > 0 ? formData.selectedServices : ['জরুরি সেবা'],
        facilities: formData.selectedFacilities.length > 0 ? formData.selectedFacilities : ['Laboratory', 'Pharmacy'],
        hasEmergency24h: formData.hasEmergency24h,
        hasAmbulance: formData.hasAmbulance,
        hasParking: formData.hasParking,
        isDisabledFriendly: formData.isDisabledFriendly,
        acceptsInsurance: formData.acceptsInsurance,
        acceptsGovtHealthCard: formData.acceptsGovtHealthCard,
        isVerified: false,
        verificationStatus: 'pending',
        status: 'pending',
        views: 0,
        rating: 5.0,
        reviewCount: 1,
        createdAt: serverTimestamp(),
        userId: user?.uid || 'anonymous'
      });

      setSubmitted(true);
      toast.success("হাসপাতালের তথ্য সফলভাবে জমা দেওয়া হয়েছে!");
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err) {
      console.error(err);
      setError('তথ্য জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      toast.error("তথ্য জমা দিতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm border border-slate-100 my-4">
        <div className="w-16 h-16 bg-emerald-100 text-[#006a4e] rounded-full flex items-center justify-center mx-auto text-3xl">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">হাসপাতালের তথ্য জমা হয়েছে!</h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          আপনার প্রদত্ত তথ্য সফলভাবে আমাদের সিস্টেমে সংরক্ষিত হয়েছে। আমাদের টিম যাচাই-বাছাই সম্পন্ন করে শীঘ্রই তালিকাভুক্ত করবে।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-100 space-y-5 my-2">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900">হাসপাতালের আবেদন ফর্ম</h2>
        <p className="text-xs text-slate-500">পুঠিয়ার হাসপাতাল ও চিকিৎসা প্রতিষ্ঠানের তথ্যভাণ্ডারে তথ্য যুক্ত করুন</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-[#006a4e] border-b border-emerald-100 pb-1">মৌলিক তথ্য</h3>
        
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">হাসপাতালের নাম *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="যেমন: পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">হাসপাতালের ধরন *</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            >
              {HOSPITAL_TYPES.filter(t => t.id !== 'all').map(t => (
                <option key={t.id} value={t.label}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">প্রতিষ্ঠার বছর</label>
            <input
              type="text"
              value={formData.establishedYear}
              onChange={e => setFormData({ ...formData, establishedYear: e.target.value })}
              placeholder="যেমন: ১৯৮৬"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">লাইসেন্স/নিবন্ধন নম্বর</label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
              placeholder="যেমন: REG-12345"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">মালিকানা</label>
            <input
              type="text"
              value={formData.ownership}
              onChange={e => setFormData({ ...formData, ownership: e.target.value })}
              placeholder="যেমন: সরকারি / প্রাইভেট লিমিটেড"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-[#006a4e] border-b border-emerald-100 pb-1">অবস্থান ও ঠিকানা</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">উপজেলা/থানা *</label>
            <select
              value={formData.upazila}
              onChange={e => setFormData({ ...formData, upazila: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            >
              {RAJSHAHI_UPAZILAS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">ইউনিয়ন/এলাকা *</label>
            <select
              value={formData.union}
              onChange={e => setFormData({ ...formData, union: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            >
              {UNIONS.filter(u => u !== 'সকল এলাকা').map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">গ্রাম/মহল্লা</label>
            <input
              type="text"
              value={formData.village}
              onChange={e => setFormData({ ...formData, village: e.target.value })}
              placeholder="যেমন: গোবিন্দপাড়া"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">সম্পূর্ণ ঠিকানা *</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            placeholder="যেমন: বাসস্ট্যান্ড সংলগ্ন, পুঠিয়া বাজার, রাজশাহী"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-[#006a4e] border-b border-emerald-100 pb-1">যোগাযোগ ও সময়সূচি</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">ফোন নম্বর *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="01712345678"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">জরুরি হটলাইন নম্বর</label>
            <input
              type="tel"
              value={formData.emergencyHotline}
              onChange={e => setFormData({ ...formData, emergencyHotline: e.target.value })}
              placeholder="01712345679"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp</label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="01712345678"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="info@hospital.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">মোট শয্যা / বেড</label>
            <input
              type="number"
              value={formData.bedCount}
              onChange={e => setFormData({ ...formData, bedCount: e.target.value })}
              placeholder="৫০"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
            />
          </div>
        </div>
      </div>

      {/* Facilities & Checkboxes */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-[#006a4e] border-b border-emerald-100 pb-1">সুবিধাসমূহ নির্বাচন করুন</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FACILITIES_LIST.map(f => (
            <label key={f.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer text-xs font-medium text-slate-700 hover:bg-slate-100">
              <input
                type="checkbox"
                checked={formData.selectedFacilities.includes(f.name)}
                onChange={() => handleToggleArrayItem('selectedFacilities', f.name)}
                className="accent-[#006a4e]"
              />
              <span>{f.icon} {f.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Description & Photo Links */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-[#006a4e] border-b border-emerald-100 pb-1">সংক্ষিপ্ত বিবরণ ও ছবি</h3>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">হাসপাতালের পরিচিতি</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="হাসপাতাল সম্পর্কে সংক্ষেপে লিখুন..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">ছবি বা কভার ইমেজের লিংক (ঐচ্ছিক)</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/hospital.jpg"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#006a4e] hover:bg-[#00553e] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
      >
        <Send size={16} />
        <span>{loading ? 'জমা হচ্ছে...' : 'যাচাইয়ের জন্য জমা দিন'}</span>
      </button>
    </form>
  );
};

export default HospitalRegistrationForm;
