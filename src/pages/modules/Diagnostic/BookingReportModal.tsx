import React, { useState } from 'react';
import { MedicalTestItem, UserReport } from './types';
import { initialUserReports } from './data';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, User, Download, FileText, CheckCircle2, Plus } from 'lucide-react';

interface BookingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedTests?: MedicalTestItem[];
  defaultTab?: 'booking' | 'reports';
}

export const BookingReportModal: React.FC<BookingReportModalProps> = ({
  isOpen,
  onClose,
  preSelectedTests = [],
  defaultTab = 'booking'
}) => {
  const [activeTab, setActiveTab] = useState<'booking' | 'reports'>(defaultTab);
  const [reportSubTab, setReportSubTab] = useState<'latest' | 'all' | 'shared'>('latest');

  // Form states
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [bookedSuccess, setBookedSuccess] = useState(false);

  // Reports
  const [userReports, setUserReports] = useState<UserReport[]>(initialUserReports);

  if (!isOpen) return null;

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !phone.trim() || !address.trim()) return;

    setBookedSuccess(true);
    setTimeout(() => {
      setBookedSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header Bar */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </button>
          
          {/* Main Modal Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-full text-xs font-bold">
            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3 py-1 rounded-full transition ${
                activeTab === 'booking' ? 'bg-[#006a4e] text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              হোম কালেকশন
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1 rounded-full transition ${
                activeTab === 'reports' ? 'bg-[#006a4e] text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              রিপোর্ট দেখুন
            </button>
          </div>

          <div className="w-9" />
        </div>

        {/* Content View */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          
          {activeTab === 'booking' ? (
            /* Booking Form View */
            <div>
              {bookedSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-[#006a4e] rounded-full flex items-center justify-center mx-auto text-3xl">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">বুকিং সফল হয়েছে!</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking} className="space-y-3.5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b">
                    <Clock size={16} className="text-[#006a4e]" />
                    হোম কালেকশন বুকিং ফরম
                  </h3>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">নাম *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="আপনার নাম লিখুন"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs mt-1 focus:ring-2 focus:ring-[#006a4e] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">মোবাইল নম্বর *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs mt-1 focus:ring-2 focus:ring-[#006a4e] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">ঠিকানা *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="আপনার ঠিকানা লিখুন"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs mt-1 focus:ring-2 focus:ring-[#006a4e] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">তারিখ *</label>
                      <input 
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs mt-1 focus:ring-2 focus:ring-[#006a4e] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">সময় *</label>
                      <select 
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs mt-1 focus:ring-2 focus:ring-[#006a4e] outline-none"
                      >
                        <option value="">সময় নির্বাচন করুন</option>
                        <option value="সকাল ৮:০০ - ১০:০০">সকাল ৮:০০ - ১০:০০</option>
                        <option value="সকাল ১০:০০ - ১২:০০">সকাল ১০:০০ - ১২:০০</option>
                        <option value="বিকাল ৩:০০ - ৫:০০">বিকাল ৩:০০ - ৫:০০</option>
                      </select>
                    </div>
                  </div>

                  {/* Pre-selected tests list */}
                  {preSelectedTests.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-slate-600">পরীক্ষার তালিকা</label>
                      <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80 mt-1 space-y-1">
                        {preSelectedTests.map((t) => (
                          <div key={t.id} className="flex justify-between text-xs font-bold text-slate-700">
                            <span>• {t.name}</span>
                            <span className="text-[#006a4e]">৳ {t.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#006a4e] hover:bg-[#00523d] text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition mt-2 shadow-sm"
                  >
                    বুকিং নিশ্চিত করুন
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Report View Tab */
            <div className="space-y-4">
              
              {/* Report Sub-tabs */}
              <div className="flex border-b border-slate-100">
                {[
                  { id: 'latest', label: 'সর্বশেষ রিপোর্ট' },
                  { id: 'all', label: 'সকল রিপোর্ট' },
                  { id: 'shared', label: 'শেয়ারকৃত রিপোর্ট' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setReportSubTab(st.id as any)}
                    className={`flex-1 pb-2 text-xs font-bold transition border-b-2 ${
                      reportSubTab === st.id
                        ? 'border-[#006a4e] text-[#006a4e]'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Reports List */}
              <div className="space-y-2.5">
                {userReports.map((rep) => (
                  <div key={rep.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006a4e] flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{rep.testName}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{rep.date} • {rep.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        {rep.status}
                      </span>
                      <button 
                        onClick={() => alert(`${rep.testName} রিপোর্ট ডাউনলোড হচ্ছে...`)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Action */}
              <button
                onClick={() => alert("পুরাতন অর্কাইভ রিপোর্ট লোড হচ্ছে...")}
                className="w-full bg-[#006a4e] text-white font-bold py-3 rounded-xl text-xs hover:bg-[#00523d] transition"
              >
                পুরনো রিপোর্ট দেখুন
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
