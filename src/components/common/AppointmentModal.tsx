import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, User, Phone, X, CheckCircle2, MapPin, Stethoscope } from 'lucide-react';

interface ChamberOption {
  id: string;
  name: string;
  address: string;
  time: string;
  fee?: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  speciality?: string;
  chambers: ChamberOption[];
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  doctorName,
  speciality,
  chambers,
}) => {
  const [selectedChamber, setSelectedChamber] = useState<string>(chambers[0]?.id || '1');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [customDate, setCustomDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('০৫:৩০ PM');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentChamber = chambers.find((c) => c.id === selectedChamber) || chambers[0];

  const timeSlots = ['০৫:০০ PM', '০৫:৩০ PM', '০৬:০০ PM', '০৬:৩০ PM', '০৭:০০ PM', '০৭:৩০ PM'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('রোগীর নাম লিখুন');
      return;
    }
    if (!patientPhone.trim() || patientPhone.length < 11) {
      alert('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
    }, 800);
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#006a4e] text-white p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl shrink-0">
                📅
              </div>
              <div>
                <h3 className="text-base font-black leading-tight">অ্যাইস্টারমেন্ট বুকিং</h3>
                <p className="text-xs text-emerald-100 font-medium">
                  {doctorName} {speciality ? `(${speciality})` : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-800">
            {isSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#006a4e] flex items-center justify-center mx-auto text-3xl shadow-xs">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900">অ্যাইস্টারমেন্ট অনুরোধ সফল হয়েছে!</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
                    আপনার অ্যাইস্টারমেন্ট তথ্য বুকিং তালিকায় যুক্ত হয়েছে। চেম্বার প্রতিনিধি দ্রুত আপনার নম্বরে కాల్ করে সিরিয়াল নম্বর নিশ্চিত করবেন।
                  </p>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-left space-y-2 text-xs font-bold text-slate-700">
                  <div className="flex justify-between border-b border-emerald-200/60 pb-1.5">
                    <span className="text-slate-500">রোগীর নাম:</span>
                    <span className="text-slate-900">{patientName}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200/60 pb-1.5">
                    <span className="text-slate-500">মোবাইল:</span>
                    <span className="text-slate-900">{patientPhone}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200/60 pb-1.5">
                    <span className="text-slate-500">চেম্বার:</span>
                    <span className="text-[#006a4e]">{currentChamber?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">তারিখ ও সময়:</span>
                    <span className="text-slate-900">
                      {selectedDate === 'today' ? 'আজ' : selectedDate === 'tomorrow' ? 'আগামীকাল' : customDate || 'নির্ধারিত তারিখ'} ({selectedTimeSlot})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 bg-[#006a4e] text-white font-black text-xs rounded-2xl border-none cursor-pointer hover:bg-[#00543e] transition-colors"
                >
                  ঠিক আছে
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Chamber Select */}
                {chambers.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#006a4e]" />
                      <span>চেম্বার নির্বাচন করুন</span>
                    </label>
                    <div className="space-y-2">
                      {chambers.map((ch) => (
                        <div
                          key={ch.id}
                          onClick={() => setSelectedChamber(ch.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                            selectedChamber === ch.id
                              ? 'bg-emerald-50/80 border-[#006a4e] ring-1 ring-[#006a4e]/20'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-black text-slate-900">{ch.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{ch.address}</div>
                            <div className="text-[10px] text-emerald-700 font-bold mt-0.5">সময়: {ch.time}</div>
                          </div>
                          {ch.fee && (
                            <span className="text-xs font-black text-[#006a4e] bg-emerald-100 px-2 py-0.5 rounded-lg shrink-0">
                              {ch.fee}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Date Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#006a4e]" />
                    <span>তারিখ নির্বাচন করুন</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDate('today')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedDate === 'today'
                          ? 'bg-[#006a4e] text-white border-[#006a4e]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      আজ
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDate('tomorrow')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedDate === 'tomorrow'
                          ? 'bg-[#006a4e] text-white border-[#006a4e]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      আগামীকাল
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDate('custom')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedDate === 'custom'
                          ? 'bg-[#006a4e] text-white border-[#006a4e]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      অন্য তারিখ
                    </button>
                  </div>
                  {selectedDate === 'custom' && (
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                    />
                  )}
                </div>

                {/* 3. Time Slot */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Clock size={14} className="text-[#006a4e]" />
                    <span>সময় স্লট</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedTimeSlot === slot
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Patient Name & Phone */}
                <div className="space-y-3 pt-1 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      রোগীর নাম <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="017........"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      রোগের বিবরণ / মন্তব্য (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={2}
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      placeholder="সংক্ষেপে সমস্যা লিখুন (যেমন: বুকে ব্যথা, গ্যাস্ট্রিক)..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e] resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#006a4e] hover:bg-[#00543e] text-white font-black text-xs rounded-2xl border-none cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50 mt-2"
                >
                  {loading ? 'প্রসেসিং হচ্ছে...' : 'অ্যাইস্টারমেন্ট সাবমিট করুন'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
