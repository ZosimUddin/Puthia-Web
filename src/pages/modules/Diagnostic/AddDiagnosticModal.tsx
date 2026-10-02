import React, { useState } from 'react';
import { DiagnosticCenter } from './types';
import { ArrowLeft, Plus, Image as ImageIcon } from 'lucide-react';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AddDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccess: (newCenter: DiagnosticCenter) => void;
}

export const AddDiagnosticModal: React.FC<AddDiagnosticModalProps> = ({
  isOpen,
  onClose,
  onAddSuccess
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [services, setServices] = useState('');
  const [type, setType] = useState<'private' | 'govt'>('private');
  const [union, setUnion] = useState('পুঠিয়া সদর');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    const newCenter: DiagnosticCenter = {
      id: `diag-${Date.now()}`,
      name,
      tagline: 'নতুন ডায়াগনস্টিক সেন্টার',
      category: 'general',
      type,
      address,
      union,
      area: 'পৌর শহর',
      rating: 5.0,
      reviewCount: 1,
      open24Hours: true,
      onlineReport: true,
      homeCollection: true,
      digitalPayment: true,
      establishedYear: `${new Date().getFullYear()} সাল`,
      reportTime: 'সাধারণত ৩-১২ ঘণ্টা',
      distance: '১.০ কিমি',
      phone,
      whatsapp: phone,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
      services: services.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      await addDoc(collection(db, 'diagnostics'), {
        ...newCenter,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore write failed, fallback local state:', err);
    }

    setIsSubmitting(false);
    onAddSuccess(newCenter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-sm font-bold text-slate-900">নতুন ডায়াগনস্টিক যোগ করুন</h2>
          <div className="w-9" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Logo / Cover Upload Dashed Box */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ডায়াগনস্টিকের লোগো / ছবি
            </label>
            <div className="w-full h-28 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-3 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer text-slate-500">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mb-1 text-slate-600">
                <Plus size={20} />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">ছবি আপলোড করুন (JPG, PNG)</span>
            </div>
            <input 
              type="url"
              placeholder="অথবা সরাসরি ছবি লিংক (URL) প্রদান করুন..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs mt-2 outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          {/* Name Field */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              ডায়াগনস্টিকের নাম <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="ডায়াগনস্টিকের নাম লিখুন"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          {/* Address Field */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              শাখার নাম / ঠিকানা <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="শাখার নাম বা ঠিকানা লিখুন"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              যোগাযোগ / মোবাইল নম্বর <span className="text-red-500">*</span>
            </label>
            <input 
              type="tel" 
              required
              placeholder="০১৭১১২২৩৩৪৪"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          {/* Type & Union Dropdowns Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                ডায়াগনস্টিক ধরন <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'private' | 'govt')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#006a4e]"
              >
                <option value="private">বেসরকারি</option>
                <option value="govt">সরকারি</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                ইউনিয়ন <span className="text-red-500">*</span>
              </label>
              <select
                value={union}
                onChange={(e) => setUnion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#006a4e]"
              >
                <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                <option value="বানেশ্বর">বানেশ্বর</option>
                <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                <option value="জিউপাড়া">জিউপাড়া</option>
                <option value="ভালুকগাছি">ভালুকগাছি</option>
                <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
              </select>
            </div>
          </div>

          {/* Services Tag Input */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              উপলব্ধ সেবাসমূহ (কমা দিয়ে লিখুন)
            </label>
            <input 
              type="text" 
              placeholder="যেমন: প্যাথলজি, ইমেজিং, ইসিজি, ডিজিটাল এক্স-রে"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          {/* Bottom Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#006a4e] hover:bg-[#00523d] text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition shadow-sm"
            >
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

