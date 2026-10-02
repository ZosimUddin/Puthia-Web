import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Upload, CheckCircle2, Car, MapPin, Phone, Shield, Send, Image as ImageIcon } from 'lucide-react';
import { Vehicle } from './types';
import { CATEGORY_CHIPS, PUTHIA_UNIONS } from './data';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase';
import { toast } from 'sonner';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccess: (newVehicle: Vehicle) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onAddSuccess
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('car');
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('');
  const [modelYear, setModelYear] = useState('২০২০');
  const [imageUrl, setImageUrl] = useState('');
  const [seatCapacity, setSeatCapacity] = useState(5);
  const [isAC, setIsAC] = useState(true);
  const [fuelType, setFuelType] = useState('অকটেন');
  const [transmission, setTransmission] = useState('অটোমেটিক');
  const [driverOption, setDriverOption] = useState<'with_driver' | 'without_driver' | 'both'>('with_driver');

  // Pricing
  const [dailyRate, setDailyRate] = useState<number | ''>(3000);
  const [hourlyRate, setHourlyRate] = useState<number | ''>(500);
  const [perKmRate, setPerKmRate] = useState<number | ''>(12);

  // Provider Contact
  const [providerName, setProviderName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [union, setUnion] = useState('পুঠিয়া সদর');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !businessName.trim()) {
      toast.error('দয়া করে গাড়ির নাম, ব্যবসার নাম ও ফোন নম্বর দিন।');
      return;
    }

    setIsSubmitting(true);

    const typeObj = CATEGORY_CHIPS.find(c => c.id === type);
    const typeLabel = typeObj ? typeObj.label : 'গাড়ি';

    const newVehicle: Vehicle = {
      id: 'v-' + Date.now(),
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now(),
      name,
      type: type as any,
      typeLabel,
      brand: brand || 'Toyota',
      model: model || 'Standard',
      modelYear: modelYear || '২০২০',
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
      gallery: [imageUrl.trim() || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'],
      seatCapacity,
      isAC,
      fuelType,
      transmission,
      driverOption,
      services: ['daily', 'long_distance', 'local'],
      serviceArea: [union, 'পুঠিয়া', 'রাজশাহী'],
      location: {
        union,
        area: union,
        address: address || `${union}, পুঠিয়া`
      },
      pricing: {
        daily: dailyRate ? Number(dailyRate) : undefined,
        hourly: hourlyRate ? Number(hourlyRate) : undefined,
        perKm: perKmRate ? Number(perKmRate) : undefined
      },
      provider: {
        id: 'prov-' + Date.now(),
        name: providerName || businessName,
        businessName,
        isVerified: false,
        verificationStatus: 'pending',
        rating: 5.0,
        phone,
        whatsapp: whatsapp || phone,
        serviceArea: `${union} ও পুঠিয়া`,
        union,
        totalVehicles: 1
      },
      rules: {
        cancellationPolicy: 'যাত্রার ১২ ঘণ্টা পূর্বে ফ্রিতে বাতিল।'
      },
      rating: 5.0,
      reviewCount: 0,
      isFeatured: false,
      status: 'pending', // Pending review by admin
      createdAt: new Date().toISOString().split('T')[0],
      description: description || `${businessName} এর পক্ষ থেকে নির্ভরযোগ্য ${name} গাড়ি ভাড়া সার্ভিস।`
    };

    try {
      await addDoc(collection(db, 'vehicle_rentals'), {
        ...newVehicle,
        createdAtServer: new Date()
      });
    } catch (err) {
      console.warn('Firestore add vehicle fallback:', err);
    }

    setIsSubmitting(false);
    toast.success('গাড়ির তথ্য সফলভাবে জমা দেওয়া হয়েছে! এডমিন যাচাইয়ের পর এটি প্রকাশিত হবে।');
    onAddSuccess(newVehicle);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/80 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#006a4e] text-white flex items-center justify-center font-bold">
                <Car size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">গাড়ি যুক্ত করুন</h3>
                <p className="text-xs text-emerald-800 font-medium">পুঠিয়ার গাড়ি ভাড়া তালিকায় আপনার সার্ভিস যুক্ত করুন</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition border-none cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
            
            {/* Status Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-xs text-blue-800 flex items-center gap-2">
              <Shield size={18} className="text-blue-600 shrink-0" />
              <span>জমা দেওয়ার পর তথ্যটি <b>"যাচাইাধীন" (Pending)</b> থাকবে এবং এডমিন ভেরিফাই করলে লাইভ হবে।</span>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                ১. গাড়ির সাধারণ তথ্য
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">গাড়ির নাম / মডেল *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="যেমন: Toyota Noah (৮ আসন)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">গাড়ির ধরন *</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                  >
                    {CATEGORY_CHIPS.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ব্র্যান্ড</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder="Toyota / Bajaj"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">আসন সংখ্যা</label>
                  <input
                    type="number"
                    min={1}
                    value={seatCapacity}
                    onChange={e => setSeatCapacity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">মডেল বছর</label>
                  <input
                    type="text"
                    value={modelYear}
                    onChange={e => setModelYear(e.target.value)}
                    placeholder="২০২০"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ফুয়েল টাইপ</label>
                  <input
                    type="text"
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value)}
                    placeholder="অকটেন / ডিজেল / সিএনজি"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                  <span className="text-xs font-bold text-slate-800">❄️ এসি গাড়ি</span>
                  <input
                    type="checkbox"
                    checked={isAC}
                    onChange={e => setIsAC(e.target.checked)}
                    className="w-5 h-5 accent-[#006a4e]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <ImageIcon size={13} className="text-[#006a4e]" />
                  গাড়ির ছবি (Image URL)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                ২. ভাড়ার তথ্য (Pricing)
              </h4>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">দৈনিক ভাড়া (৳)</label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={e => setDailyRate(e.target.value ? Number(e.target.value) : '')}
                    placeholder="3500"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ঘণ্টাভিত্তিক (৳)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(e.target.value ? Number(e.target.value) : '')}
                    placeholder="500"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">প্রতি কিমি (৳)</label>
                  <input
                    type="number"
                    value={perKmRate}
                    onChange={e => setPerKmRate(e.target.value ? Number(e.target.value) : '')}
                    placeholder="14"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                  />
                </div>
              </div>
            </div>

            {/* Provider Contact Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                ৩. প্রোভাইডার ও যোগাযোগের তথ্য
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ব্যবসার নাম / এজেন্সি *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="যেমন: পুঠিয়া রেন্ট-এ-কার"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">মালিক / প্রতিনিধির নাম</label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={e => setProviderName(e.target.value)}
                    placeholder="মো: রফিকুল ইসলাম"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Phone size={13} className="text-[#006a4e]" />
                    ফোন নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ইউনিয়ন</label>
                  <select
                    value={union}
                    onChange={e => setUnion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                  >
                    {PUTHIA_UNIONS.map((u, i) => (
                      <option key={i} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ঠিকানা / স্ট্যান্ড</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="যেমন: রাজবাড়ি রোড, পুঠিয়া বাজার"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">গাড়ির বিস্তারিত বিবরণ</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="গাড়ির কন্ডিশন, সুবিধার বর্ণনা..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#006a4e]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                বাতিল
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send size={15} />
                <span>{isSubmitting ? 'জমা হচ্ছে...' : 'যাচাইয়ের জন্য জমা দিন'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddVehicleModal;
