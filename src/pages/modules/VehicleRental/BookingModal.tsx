import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, MapPin, Users, Phone, User, CheckCircle2, AlertCircle, Send, Package } from 'lucide-react';
import { Vehicle, BookingRequest } from './types';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase';
import { toast } from 'sonner';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onSuccess?: (booking: BookingRequest) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSuccess
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceType, setServiceType] = useState('daily');
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('08:00 PM');
  const [passengerCount, setPassengerCount] = useState(2);
  const [driverRequired, setDriverRequired] = useState(true);
  const [cargoType, setCargoType] = useState('');
  const [approxLoad, setApproxLoad] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !vehicle) return null;

  const isCargoVehicle = vehicle.type === 'pickup' || vehicle.type === 'covered_van';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !pickupLocation.trim() || !bookingDate) {
      toast.error('দয়া করে সকল প্রয়োজনীয় তথ্য (নাম, মোবাইল নম্বর, পিকআপ লোকেশন ও তারিখ) পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);

    const bookingData: BookingRequest = {
      id: 'bk-' + Date.now(),
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleType: vehicle.typeLabel,
      providerId: vehicle.provider?.id || 'prov-1',
      providerName: vehicle.provider?.businessName || vehicle.provider?.name || 'প্রোভাইডার',
      providerPhone: vehicle.provider?.phone || '01712345678',
      customerName,
      customerPhone,
      serviceType,
      pickupLocation,
      destination: destination || 'পুঠিয়া এলাকা',
      date: bookingDate,
      startTime,
      endTime,
      passengerCount,
      driverRequired,
      cargoType: isCargoVehicle ? cargoType : undefined,
      approxLoad: isCargoVehicle ? approxLoad : undefined,
      note,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      await addDoc(collection(db, 'vehicle_bookings'), {
        ...bookingData,
        createdAtServer: new Date()
      });
    } catch (err) {
      console.warn('Firestore booking fallback:', err);
    }

    // Save to local storage for "আমার বুকিং" tab
    try {
      const savedBookings = JSON.parse(localStorage.getItem('p_vehicle_bookings') || '[]');
      localStorage.setItem('p_vehicle_bookings', JSON.stringify([bookingData, ...savedBookings]));
    } catch (e) {}

    setIsSubmitting(false);
    toast.success('আপনার বুকিং অনুরোধ সফলভাবে পাঠানো হয়েছে! প্রোভাইডার শীঘ্রই আপনাকে কল করবেন।');

    if (onSuccess) onSuccess(bookingData);
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
          className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/80 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#006a4e] text-white flex items-center justify-center font-bold text-lg">
                🚗
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">গাড়ি বুকিং অনুরোধ</h3>
                <p className="text-xs text-[#006a4e] font-semibold truncate max-w-[240px]">
                  {vehicle.name}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition border-none cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
            
            {/* Provider Call Info Notice */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-xs text-amber-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle size={15} className="text-amber-600" />
                <span>অনুরোধ পাঠানোর পর প্রোভাইডার নিশ্চিত করবেন</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                আপনার তথ্যের ভিত্তিতে {vehicle.provider?.businessName || vehicle.provider?.name} কল দিয়ে চূড়ান্ত ভাড়া ও সময় কনফার্ম করবে।
              </p>
            </div>

            {/* Customer Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <User size={13} className="text-[#006a4e]" />
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="যেমন: মো: কামরুল হাসান"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none focus:border-[#006a4e]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Phone size={13} className="text-[#006a4e]" />
                  মোবাইল নম্বর *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none focus:border-[#006a4e]"
                />
              </div>
            </div>

            {/* Service Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">সেবার ধরন</label>
              <select
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
              >
                <option value="daily">দৈনিক চুক্তি</option>
                <option value="hourly">ঘণ্টাভিত্তিক</option>
                <option value="long_distance">দূরপাল্লা (অন্য জেলা/ঢাকা)</option>
                <option value="airport">এয়ারপোর্ট পিক/ড্রপ</option>
                <option value="wedding">বিয়ে / ইভেন্ট</option>
                <option value="cargo">মালামাল পরিবহন</option>
              </select>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <MapPin size={13} className="text-[#006a4e]" />
                  পিকআপ লোকেশন *
                </label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={e => setPickupLocation(e.target.value)}
                  placeholder="যেমন: পুঠিয়া বাজার মোড়"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none focus:border-[#006a4e]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <MapPin size={13} className="text-rose-500" />
                  গন্তব্য (Destination)
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="যেমন: রাজশাহী এয়ারপোর্ট / ঢাকা"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none focus:border-[#006a4e]"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar size={13} className="text-[#006a4e]" />
                  ভাড়ার তারিখ *
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setBookingDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none focus:border-[#006a4e]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Clock size={13} className="text-[#006a4e]" />
                  শুরুর সময়
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  placeholder="08:00 AM"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none focus:border-[#006a4e]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Users size={13} className="text-[#006a4e]" />
                  যাত্রী সংখ্যা
                </label>
                <input
                  type="number"
                  min={1}
                  max={vehicle.seatCapacity || 50}
                  value={passengerCount}
                  onChange={e => setPassengerCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none focus:border-[#006a4e]"
                />
              </div>
            </div>

            {/* Cargo specifics if Pickup/Covered van */}
            {isCargoVehicle && (
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Package size={14} />
                  <span>মালামাল সংক্রান্ত তথ্য</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cargoType}
                    onChange={e => setCargoType(e.target.value)}
                    placeholder="মালামালের ধরন (যেমন: বাসার আসবাব)"
                    className="w-full p-2 rounded-xl border border-blue-200 bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={approxLoad}
                    onChange={e => setApproxLoad(e.target.value)}
                    placeholder="আনুমানিক ওজন (যেমন: ১ টন)"
                    className="w-full p-2 rounded-xl border border-blue-200 bg-white text-xs"
                  />
                </div>
              </div>
            )}

            {/* Driver Included Switch */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-800">👨‍✈️ ড্রাইভার প্রয়োজন</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={driverRequired}
                  onChange={e => setDriverRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006a4e]"></div>
              </label>
            </div>

            {/* Optional Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">বিশেষ কোনো বার্তা (ঐচ্ছিক)</label>
              <textarea
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="যেমন: সাথে ২ টি বড় লাগেজ থাকবে..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium outline-none focus:border-[#006a4e]"
              />
            </div>

            {/* Action Buttons */}
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
                <span>{isSubmitting ? 'পাঠানো হচ্ছে...' : 'বুকিং অনুরোধ পাঠান'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
