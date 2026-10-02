import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Calendar, MapPin, Clock, Users, Star, Sparkles, Image as ImageIcon, 
  Video, FileText, Phone, Ticket, Award, Store, ShieldCheck, CheckCircle2, 
  Loader2, Globe, Heart, Bell
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface MelaEventAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultType?: 'fair' | 'festival' | 'cultural' | 'competition';
}

export const MelaEventAddModal: React.FC<MelaEventAddModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultType = 'fair'
}) => {
  const [activeStep, setActiveStep] = useState<'details' | 'schedule' | 'location' | 'media' | 'info' | 'interactive'>('details');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States grouped by sections
  const [eventType, setEventType] = useState<'fair' | 'festival' | 'cultural' | 'competition'>(defaultType);
  
  // Section 1: 🎪 ইভেন্ট তথ্য
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryName, setCategoryName] = useState('বার্ষিক মেলা'); // custom sub-category name
  const [status, setStatus] = useState('আসন্ন'); // চলমান, আসন্ন, সম্পন্ন

  // Section 2: 📅 সময়সূচী
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [scheduleDetails, setScheduleDetails] = useState(''); // Day-by-day or general timing description

  // Section 3: 📍 স্থান
  const [venue, setVenue] = useState('');
  const [googleMapLink, setGoogleMapLink] = useState('');
  const [nearestBusStand, setNearestBusStand] = useState('');
  const [parkingInfo, setParkingInfo] = useState('');

  // Section 4: 🖼️ মিডিয়া
  const [bannerUrl, setBannerUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  // Section 5: 📢 তথ্য (আয়োজক, টিকেট, স্পনসর)
  const [organizer, setOrganizer] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [entryFee, setEntryFee] = useState('বিনামূল্যে');
  const [sponsorInfo, setSponsorInfo] = useState('');

  // Section 6: 🎭 অন্যান্য (নিবন্ধন সক্রিয়করণ)
  const [stallReg, setStallReg] = useState(false);
  const [volunteerReg, setVolunteerReg] = useState(false);
  const [participateReg, setParticipateReg] = useState(false);

  // Auto-set category base depending on type selection
  const handleTypeChange = (type: 'fair' | 'festival' | 'cultural' | 'competition') => {
    setEventType(type);
    if (type === 'fair') setCategoryName('বার্ষিক মেলা');
    else if (type === 'festival') setCategoryName('ধর্মীয় উৎসব');
    else if (type === 'cultural') setCategoryName('সাংস্কৃতিক সন্ধ্যা');
    else if (type === 'competition') setCategoryName('প্রতিযোগিতা');
  };

  const steps = [
    { id: 'details', label: '🎪 ইভেন্ট বিবরণ', desc: 'নাম, ধরণ ও বিবরণ' },
    { id: 'schedule', label: '📅 সময়সূচী', desc: 'তারিখ ও সময়সূচী' },
    { id: 'location', label: '📍 স্থান/ভেন্যু', desc: 'অবস্থান ও মানচিত্র' },
    { id: 'media', label: '🖼️ মিডিয়া', desc: 'ছবি ও ভিডিও লিংক' },
    { id: 'info', label: '📢 আয়োজক ও টিকেট', desc: 'যোগাযোগ ও প্রবেশ মূল্য' },
    { id: 'interactive', label: '🎭 অন্যান্য', desc: 'নিবন্ধন ও আবেদন' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !venue || !startDate) {
      setError('অনুগ্রহ করে নাম, ভেন্যু এবং শুরুর তারিখ অবশ্যই পূরণ করুন।');
      setActiveStep('details');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isMelaOrFestival = eventType === 'fair' || eventType === 'festival';
      
      if (isMelaOrFestival) {
        // Prepare payload for 'fairs' collection
        const payload = {
          name: title,
          category: categoryName,
          status: status,
          venue: venue,
          startDate: startDate,
          endDate: endDate || startDate,
          schedule: eventTime || scheduleDetails || 'সকাল ১০টা থেকে রাত ১০টা',
          entryFee: entryFee,
          organizer: organizer || 'পুঠিয়া মেলা ও উৎসব কমিটি',
          history: description || 'পুঠিয়ার ঐতিহ্যবাহী মেলা ও উৎসবের চমৎকার বিবরণ।',
          bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
          videoUrl: videoUrl,
          posterUrl: posterUrl,
          contactPhone: contactPhone,
          sponsorInfo: sponsorInfo,
          locationLink: googleMapLink,
          stallRegistrationEnabled: stallReg,
          volunteerRegistrationEnabled: volunteerReg,
          participationEnabled: participateReg,
          
          // structures for details view
          attractions: [
            { name: 'ঐতিহ্যবাহী প্রদর্শনী', description: 'মেলা চত্বরের অন্যতম আকর্ষক প্রদর্শনী ও আয়োজন।' },
            { name: 'সাংস্কৃতিক সন্ধ্যা', description: 'মনোমুগ্ধকর সংগীত, লোকনৃত্য এবং উৎসবমুখর পরিবেশনা।' }
          ],
          gallery: bannerUrl ? [{ url: bannerUrl, caption: title, type: 'image' }] : [],
          stalls: stallReg ? [{ name: 'হস্তশিল্প ও গ্রামীণ কুটির শিল্প', count: '৩০' }] : [],
          food: [{ name: 'ঐতিহ্যবাহী মিষ্টি', price: '১৫০ টাকা', shopName: 'পুঠিয়া ঐতিহ্য মিষ্টান্ন', imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?auto=format&fit=crop&q=80&w=400' }],
          events: [
            { time: startDate + ', সকাল ১০:০০', eventName: 'অনুষ্ঠানের শুভ উদ্বোধন ও র‍্যালি', type: 'উদ্বোধন' },
            { time: (endDate || startDate) + ', সন্ধ্যা ৭:০০', eventName: 'সমাপনী ও পুরস্কার বিতরণী অনুষ্ঠান', type: 'সমাপনী' }
          ],
          location: {
            address: venue,
            parkingInfo: parkingInfo || 'সংলগ্ন মাঠে গাড়ি পার্কিংয়ের ব্যবস্থা রয়েছে।',
            nearestBusStand: nearestBusStand || 'পুঠিয়া বাসস্ট্যান্ড'
          },
          security: {
            policeBooth: 'প্রধান তোরণের পাশে পুলিশ বুথ',
            medicalCamp: 'জরুরি প্রাথমিক চিকিৎসা ক্যাম্প',
            lostFoundDesk: 'তথ্য ও অভিযোগ কেন্দ্র',
            emergencyNumbers: [contactPhone || '৯৯৯']
          },
          createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'fairs'), payload);
      } else {
        // Prepare payload for 'events' collection
        const payload = {
          title: title,
          category: eventType === 'cultural' ? 'সাংস্কৃতিক' : 'প্রতিযোগিতা',
          eventDate: startDate,
          eventTime: eventTime || 'সন্ধ্যা ৬:০০',
          venue: venue,
          organizer: organizer || 'পুঠিয়া উপজেলা প্রশাসন',
          description: description || 'মনোজ্ঞ সাংস্কৃতিক আয়োজন ও প্রতিযোগিতা।',
          image: bannerUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
          videoUrl: videoUrl,
          posterUrl: posterUrl,
          contactPhone: contactPhone,
          sponsorInfo: sponsorInfo,
          entryFee: entryFee,
          locationLink: googleMapLink,
          stallRegistrationEnabled: stallReg,
          volunteerRegistrationEnabled: volunteerReg,
          participationEnabled: participateReg,
          createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'events'), payload);
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error adding event/fair:', err);
      setError(err?.message || 'তথ্যাদি সংরক্ষণ করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (activeStep === 'details') setActiveStep('schedule');
    else if (activeStep === 'schedule') setActiveStep('location');
    else if (activeStep === 'location') setActiveStep('media');
    else if (activeStep === 'media') setActiveStep('info');
    else if (activeStep === 'info') setActiveStep('interactive');
  };

  const prevStep = () => {
    if (activeStep === 'schedule') setActiveStep('details');
    else if (activeStep === 'location') setActiveStep('schedule');
    else if (activeStep === 'media') setActiveStep('location');
    else if (activeStep === 'info') setActiveStep('media');
    else if (activeStep === 'interactive') setActiveStep('info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white border border-slate-100 w-full max-w-4xl rounded-[36px] shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]"
      >
        {/* Banner header decoration */}
        <div className="bg-emerald-800 text-white p-6 sm:p-8 relative overflow-hidden flex justify-between items-center shrink-0">
          <div className="absolute top-0 right-0 p-12 opacity-10 scale-150 rotate-12 pointer-events-none">
            <Sparkles size={120} />
          </div>
          <div className="relative z-10 space-y-1">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-black uppercase tracking-wider text-emerald-200">
              নতুন তথ্য সংযোজন
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">মেলা, উৎসব ও অনুষ্ঠান যোগ করুন</h2>
          </div>
          <button 
            onClick={onClose}
            className="relative z-10 w-10 h-10 bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center rounded-full transition-all border border-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content layout (Sidebar tabs + Form Content) */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Steps Navigation Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 p-6 border-r border-slate-100 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0">
            {steps.map((step) => {
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id as any)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition-all shrink-0 w-auto md:w-full ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25' 
                      : 'hover:bg-slate-200/60 text-slate-500 font-bold'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                    {step.id === 'details' && <Award size={16} />}
                    {step.id === 'schedule' && <Calendar size={16} />}
                    {step.id === 'location' && <MapPin size={16} />}
                    {step.id === 'media' && <ImageIcon size={16} />}
                    {step.id === 'info' && <Users size={16} />}
                    {step.id === 'interactive' && <Store size={16} />}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-xs font-black leading-none">{step.label}</div>
                    <div className={`text-[9px] mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400 font-medium'}`}>{step.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form Container */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-12 space-y-6"
                >
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={56} className="animate-bounce" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <h3 className="text-2xl font-black text-slate-900">সফলভাবে যোগ করা হয়েছে!</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                      আপনার প্রদানকৃত মেলা/ইভেন্ট তথ্যটি ডাটাবেজে সফলভাবে সংরক্ষণ করা হয়েছে। শীঘ্রই এটি পেজে দৃশ্যমান হবে।
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSuccess(false);
                      setTitle('');
                      setDescription('');
                      setVenue('');
                      setStartDate('');
                      setEndDate('');
                      setEventTime('');
                      setBannerUrl('');
                      setVideoUrl('');
                      setPosterUrl('');
                      setOrganizer('');
                      setContactPhone('');
                      setEntryFee('বিনামূল্যে');
                      setSponsorInfo('');
                      setStallReg(false);
                      setVolunteerReg(false);
                      setParticipateReg(false);
                      setActiveStep('details');
                      onClose();
                    }}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    বন্ধ করুন
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6 flex-1"
                >
                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 text-sm font-bold">
                      <X size={18} className="shrink-0 mt-0.5 cursor-pointer" onClick={() => setError(null)} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* STEP 1: Details */}
                  {activeStep === 'details' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2.5">ইভেন্ট ধরণ সিলেক্ট করুন *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { id: 'fair', label: '🎪 মেলা', desc: 'মেলার বিবরণ' },
                            { id: 'festival', label: '🎉 উৎসব', desc: 'ধর্মীয় বা সামাজিক' },
                            { id: 'cultural', label: '🎭 সাংস্কৃতিক', desc: 'অনুষ্ঠান ও গীত' },
                            { id: 'competition', label: '🏆 প্রতিযোগিতা', desc: 'সাংস্কৃতিক প্রতিযোগিতা' }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleTypeChange(item.id as any)}
                              className={`p-4 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-1.5 ${
                                eventType === item.id 
                                  ? 'border-emerald-600 bg-emerald-50/40 text-emerald-800 ring-2 ring-emerald-600/20' 
                                  : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className="text-base font-black">{item.label}</span>
                              <span className="text-[10px] text-slate-400 font-bold">{item.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ইভেন্ট/মেলার নাম *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="যেমন: ঐতিহাসিক রথ মেলা" 
                            value={title || ""}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ক্যাটাগরি বা ধরণ</label>
                          <input 
                            type="text" 
                            placeholder="যেমন: বার্ষিক মেলা, লোকসংগীত উৎসব" 
                            value={categoryName || ""}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">বর্তমান অবস্থা</label>
                          <select 
                            value={status || ""}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          >
                            <option value="আসন্ন">আসন্ন (Upcoming)</option>
                            <option value="চলমান">চলমান (Ongoing)</option>
                            <option value="সম্পন্ন">সম্পন্ন (Completed)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">পরিচিতি ও ইতিহাস / বিবরণ</label>
                        <textarea 
                          rows={4}
                          placeholder="মেলা বা ইভেন্টের পটভূমি, ইতিহাস এবং মূল গুরুত্ব বর্ণনা করুন..." 
                          value={description || ""}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Schedule */}
                  {activeStep === 'schedule' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">শুরুর তারিখ *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="যেমন: ১৫ আগস্ট ২০২৬ বা ১৪ এপ্রিল" 
                            value={startDate || ""}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">শেষ তারিখ</label>
                          <input 
                            type="text" 
                            placeholder="যেমন: ২২ আগস্ট ২০২৬ বা ২০ এপ্রিল" 
                            value={endDate || ""}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">অনুষ্ঠানের সময়</label>
                          <input 
                            type="text" 
                            placeholder="যেমন: প্রতিদিন সকাল ১০টা থেকে রাত ১০টা" 
                            value={eventTime || ""}
                            onChange={(e) => setEventTime(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">বিস্তারিত অনুষ্ঠান সূচি (Outline)</label>
                        <textarea 
                          rows={3}
                          placeholder="যেমন: ১৫ আগস্ট উদ্বোধন, ১৭ আগস্ট বাউল গান, ২২ আগস্ট সমাপনী অনুষ্ঠান..." 
                          value={scheduleDetails || ""}
                          onChange={(e) => setScheduleDetails(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Location */}
                  {activeStep === 'location' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ভেন্যু বা স্থান *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="যেমন: রাজবাড়ি মাঠ, পুঠিয়া, রাজশাহী" 
                            value={venue || ""}
                            onChange={(e) => setVenue(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">নিকটবর্তী বাসস্ট্যান্ড</label>
                          <input 
                            type="text" 
                            placeholder="যেমন: পুঠিয়া বাসস্ট্যান্ড" 
                            value={nearestBusStand || ""}
                            onChange={(e) => setNearestBusStand(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Google Map লোকেশন লিংক / Embed URL</label>
                        <input 
                          type="text" 
                          placeholder="Google Map-এর লিংক বা শেয়ারিং লোকেশন কোড..." 
                          value={googleMapLink || ""}
                          onChange={(e) => setGoogleMapLink(e.target.value)}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">পার্কিং সম্পর্কিত তথ্য</label>
                        <input 
                          type="text" 
                          placeholder="যেমন: রাজবাড়ি চত্বরের পূর্ব পাশে গাড়ি পার্কিংয়ের পর্যাপ্ত জায়গা রয়েছে।" 
                          value={parkingInfo || ""}
                          onChange={(e) => setParkingInfo(e.target.value)}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Media */}
                  {activeStep === 'media' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ব্যানার / মূল ছবির URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="যেমন: https://images.unsplash.com/..." 
                            value={bannerUrl || ""}
                            onChange={(e) => setBannerUrl(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-1.5">উচ্চ মানের ছবির লিংক ব্যবহার করুন, যা ব্যানারে সুন্দর দেখাবে।</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ভিডিও লিংক (YouTube / Video URL)</label>
                          <input 
                            type="text" 
                            placeholder="ভিডিও বা প্রোমো ক্লিপের লিংক..." 
                            value={videoUrl || ""}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">পোস্টার / লোগো URL</label>
                          <input 
                            type="text" 
                            placeholder="ডিজিটাল পোস্টার বা ফ্লায়ারের ছবির লিংক..." 
                            value={posterUrl || ""}
                            onChange={(e) => setPosterUrl(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Organizer Info */}
                  {activeStep === 'info' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">আয়োজক সংস্থা / ব্যক্তি</label>
                          <input 
                            type="text" 
                            placeholder="যেমন: উপজেলা প্রশাসন ও যুব সমিতি" 
                            value={organizer || ""}
                            onChange={(e) => setOrganizer(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">জরুরি যোগাযোগ নম্বর</label>
                          <input 
                            type="tel" 
                            placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮" 
                            value={contactPhone || ""}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">টিকিট / প্রবেশ তথ্য</label>
                          <input 
                            type="text" 
                            placeholder="যেমন: বিনামূল্যে অথবা প্রবেশ ফি ৫০ টাকা" 
                            value={entryFee || ""}
                            onChange={(e) => setEntryFee(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">স্পনসর তথ্য (Sponsors)</label>
                          <input 
                            type="text" 
                            placeholder="প্রধান পৃষ্ঠপোষক ও সহযোগী স্পনসর ..." 
                            value={sponsorInfo || ""}
                            onChange={(e) => setSponsorInfo(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: Interactive Options */}
                  {activeStep === 'interactive' && (
                    <div className="space-y-6">
                      <div className="p-5 bg-emerald-50/40 border border-emerald-100 rounded-[28px] space-y-2">
                        <h4 className="font-black text-emerald-950 text-sm flex items-center gap-2">
                          <CheckCircle2 size={16} /> ইন্টারেক্টিভ ও নিবন্ধনের সুযোগ
                        </h4>
                        <p className="text-xs text-emerald-800 font-bold leading-relaxed">
                          আপনার মেলা বা ইভেন্টের জন্য স্টল বরাদ্দ, স্বেচ্ছাসেবী বা সরাসরি অংশগ্রহণের জন্য ডিজিটাল আবেদন ফর্ম সক্রিয় করতে পারেন।
                        </p>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center gap-4 p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer transition-all border border-slate-100">
                          <input 
                            type="checkbox" 
                            checked={stallReg}
                            onChange={(e) => setStallReg(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600/20 cursor-pointer"
                          />
                          <div>
                            <div className="text-sm font-black text-slate-800">🎪 স্টল নিবন্ধন সক্রিয় করুন</div>
                            <div className="text-xs font-bold text-slate-400 mt-0.5">ব্যবসা প্রতিষ্ঠান বা হস্তশিল্পীদের জন্য মেলার ভেতর দোকান নিবন্ধনের আবেদন নেওয়া হবে।</div>
                          </div>
                        </label>

                        <label className="flex items-center gap-4 p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer transition-all border border-slate-100">
                          <input 
                            type="checkbox" 
                            checked={volunteerReg}
                            onChange={(e) => setVolunteerReg(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600/20 cursor-pointer"
                          />
                          <div>
                            <div className="text-sm font-black text-slate-800">🙋‍♂️ স্বেচ্ছাসেবক নিবন্ধন সক্রিয় করুন</div>
                            <div className="text-xs font-bold text-slate-400 mt-0.5">মেলা ও উৎসবের শৃঙ্খলা ও নিরাপত্তা রক্ষায় আগ্রহী তরুণদের স্বেচ্ছাসেবক আবেদনের সুযোগ।</div>
                          </div>
                        </label>

                        <label className="flex items-center gap-4 p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer transition-all border border-slate-100">
                          <input 
                            type="checkbox" 
                            checked={participateReg}
                            onChange={(e) => setParticipateReg(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600/20 cursor-pointer"
                          />
                          <div>
                            <div className="text-sm font-black text-slate-800">🎭 অংশগ্রহণের আবেদন (Performers/Contestants)</div>
                            <div className="text-xs font-bold text-slate-400 mt-0.5">সাংস্কৃতিক সন্ধ্যা বা প্রতিযোগিতায় অংশগ্রহণের জন্য আবেদন ফর্ম সক্রিয় করুন।</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions */}
            {!success && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8 shrink-0">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={activeStep === 'details' || loading}
                  className={`px-6 py-3 font-black text-sm rounded-2xl border border-slate-200 transition-all ${
                    activeStep === 'details' || loading
                      ? 'opacity-30 cursor-not-allowed text-slate-300 bg-slate-50'
                      : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  পূর্ববর্তী
                </button>

                {activeStep === 'interactive' ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-55 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        সংরক্ষণ হচ্ছে...
                      </>
                    ) : (
                      'তথ্যাদি যুক্ত করুন'
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    পরবর্তী
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
