import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Building2, Upload, Phone, Mail, Globe, MapPin, Send, ShieldCheck, Plus, Check } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { UNIONS, SERVICE_FIELDS } from './constants';

interface NgoRegistrationFormProps {
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export default function NgoRegistrationForm({ onClose, onShowToast }: NgoRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    coverUrl: '',
    type: 'জাতীয়' as 'স্থানীয়' | 'জাতীয়' | 'আন্তর্জাতিক',
    establishedYear: '',
    registrationNumber: '',
    headOffice: '',
    puthiaOffice: '',
    union: 'পুঠিয়া',
    workingArea: '',
    selectedServiceFields: [] as string[],
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    contactPerson: '',
    shortDescription: '',
    description: '',
    servicesText: '',
    mapLocationUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleServiceField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServiceFields: prev.selectedServiceFields.includes(field)
        ? prev.selectedServiceFields.filter(f => f !== field)
        : [...prev.selectedServiceFields, field]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      onShowToast("অনুগ্রহ করে সকল আবশ্যকীয় (*) ফিল্ড পূরণ করুন");
      return;
    }

    setIsSubmitting(true);

    try {
      const servicesArray = formData.servicesText
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const newSubmission = {
        name: formData.name,
        logoUrl: formData.logoUrl || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80",
        coverUrl: formData.coverUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80",
        type: formData.type,
        establishedYear: formData.establishedYear,
        registrationNumber: formData.registrationNumber,
        headOffice: formData.headOffice,
        puthiaOffice: formData.puthiaOffice,
        union: formData.union,
        location: formData.puthiaOffice || `${formData.union}, পুঠিয়া, রাজশাহী`,
        workingArea: formData.workingArea,
        serviceFields: formData.selectedServiceFields,
        phone: formData.phone,
        whatsapp: formData.whatsapp || formData.phone,
        email: formData.email,
        website: formData.website,
        contactPerson: formData.contactPerson,
        shortDescription: formData.shortDescription || `${formData.name} একটি সামাজিক উন্নয়নমূলক সংস্থা।`,
        description: formData.description || formData.shortDescription,
        services: servicesArray.length > 0 ? servicesArray : ['সামাজিক উন্নয়ন ও মানবিক সেবা'],
        mapLocationUrl: formData.mapLocationUrl,
        distance: 'পুঠিয়া',
        rating: 5.0,
        reviewCount: 1,
        status: 'Pending Review',
        isVerified: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "ngos"), newSubmission);

      onShowToast("আপনার এনজিও তথ্য সফলভাবে জমা নেওয়া হয়েছে। যাচাইকরণের পর প্রকাশ করা হবে।");
      onClose();
    } catch (error) {
      console.error("NGO registration submission error:", error);
      onShowToast("তথ্য জমা দিতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10008] flex items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 30 }}
        className="bg-white rounded-none sm:rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-emerald-900 text-white flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-50">আপনার এনজিও যুক্ত করুন</h3>
              <p className="text-xs font-bold text-emerald-200">পুঠিয়া উপজেলা এনজিও ডিরেক্টরি ফর্ম</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-full hover:bg-emerald-800 text-emerald-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50">
          
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
            <ShieldCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-emerald-900 leading-relaxed">
              সঠিক ও নির্ভুল তথ্য প্রদান করুন। আবেদনপত্র জমা দেওয়ার পর আমাদের টিম সার্বিক তথ্য যাচাই করে প্রোফাইলটি সচল করবে।
            </p>
          </div>

          {/* Section 1: Basic Info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              ১. মৌলিক তথ্য
            </h4>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">প্রতিষ্ঠানের নাম *</label>
              <input
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="যেমন: ব্র্যাক বা আশা"
                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">এনজিওর ধরন *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="স্থানীয়">স্থানীয়</option>
                  <option value="জাতীয়">জাতীয়</option>
                  <option value="আন্তর্জাতিক">আন্তর্জাতিক</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">প্রতিষ্ঠার বছর</label>
                <input
                  value={formData.establishedYear}
                  onChange={e => setFormData({ ...formData, establishedYear: e.target.value })}
                  placeholder="যেমন: ১৯৭২"
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">এনজিও বিষয়ক ব্যুরো/সমাজসেবা নিবন্ধন নম্বর</label>
              <input
                value={formData.registrationNumber}
                onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="যেমন: NGO-100234"
                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">লোগো ছবি (Image URL)</label>
                <input
                  value={formData.logoUrl}
                  onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">কভার ছবি (Image URL)</label>
                <input
                  value={formData.coverUrl}
                  onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Location */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              ২. ঠিকানা ও অবস্থান
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ইউনিয়ন</label>
                <select
                  value={formData.union}
                  onChange={e => setFormData({ ...formData, union: e.target.value })}
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {UNIONS.filter(u => u !== 'সব ইউনিয়ন').map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">কার্যক্রমের এলাকা</label>
                <input
                  value={formData.workingArea}
                  onChange={e => setFormData({ ...formData, workingArea: e.target.value })}
                  placeholder="যেমন: পুঠিয়া উপজেলার ৬টি ইউনিয়ন"
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">প্রধান কার্যালয়ের ঠিকানা</label>
              <input
                value={formData.headOffice}
                onChange={e => setFormData({ ...formData, headOffice: e.target.value })}
                placeholder="যেমন: মহাখালী, ঢাকা"
                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">পুঠিয়া অফিসের ঠিকানা</label>
              <input
                value={formData.puthiaOffice}
                onChange={e => setFormData({ ...formData, puthiaOffice: e.target.value })}
                placeholder="যেমন: পুঠিয়া রাজবাড়ী সংলগ্ন, পুঠিয়া বাজার"
                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">গুগল ম্যাপ লোকেশন URL</label>
              <input
                value={formData.mapLocationUrl}
                onChange={e => setFormData({ ...formData, mapLocationUrl: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 3: Contact Info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              ৩. যোগাযোগ সংক্রান্ত তথ্য
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ফোন নম্বর *</label>
                <input
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01700-000000"
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">হোয়াটসঅ্যাপ নম্বর</label>
                <input
                  value={formData.whatsapp}
                  onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="01700-000000"
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ই-মেইল ঠিকানা</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@ngo.org"
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ওয়েবসাইট</label>
                <input
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">দায়িত্বপ্রাপ্ত ব্যক্তির নাম ও পদবী</label>
              <input
                value={formData.contactPerson}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="যেমন: মোঃ শফিকুল ইসলাম (শাখা ব্যবস্থাপক)"
                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Services & Description */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              ৪. সেবাসমূহ ও বিবরণ
            </h4>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">সেবার ক্ষেত্রসমূহ (নির্বাচন করুন)</label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_FIELDS.map(sf => {
                  const isSel = formData.selectedServiceFields.includes(sf);
                  return (
                    <button
                      key={sf}
                      type="button"
                      onClick={() => toggleServiceField(sf)}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSel 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isSel && <Check size={12} />}
                      {sf}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">সংক্ষিপ্ত বিবরণ</label>
              <input
                value={formData.shortDescription}
                onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="এক লাইনে প্রতিষ্ঠানের মূল লক্ষ্য লিখুন..."
                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">বিস্তারিত বিবরণ</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="আপনার এনজিওর লক্ষ্য, উদ্দেশ্য ও ইতিহাস লিখুন..."
                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">প্রধান সেবাসমূহ (প্রতি লাইনে একটি)</label>
              <textarea
                rows={3}
                value={formData.servicesText}
                onChange={e => setFormData({ ...formData, servicesText: e.target.value })}
                placeholder={`শিক্ষা সহায়তা\nস্বাস্থ্য পরীক্ষা ও ওষুধ বিতরণ\nনারী ক্ষমতায়ন`}
                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send size={16} /> {isSubmitting ? 'জমা দেওয়া হচ্ছে...' : 'এনজিও জমা দিন'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
