import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Phone, Navigation, Globe, Share2, MapPin, Building,
  GraduationCap, Users, UserCheck, Calendar, Award, BookOpen,
  Mail, Clock, Star, ExternalLink, CheckCircle2, ChevronRight,
  Shield, Check, Copy, Compass
} from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '../../../utils/clipboard';
import { EducationInstitutionFull } from './data';

interface Props {
  institution: EducationInstitutionFull;
  onClose: () => void;
}

export const EducationDetailModal: React.FC<Props> = ({ institution, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'students' | 'results' | 'contact' | 'location'>('overview');

  const handleShare = async () => {
    const text = `${institution.name}\n${institution.address}\nEIIN: ${institution.eiinNumber}`;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: institution.name, text, url });
      } catch {
        await copyToClipboard(`${text}\n${url}`);
        toast.success('তথ্য লিংক কপি করা হয়েছে');
      }
    } else {
      await copyToClipboard(`${text}\n${url}`);
      toast.success('তথ্য লিংক কপি করা হয়েছে');
    }
  };

  const openMaps = () => {
    if (institution.googleMapUrl) {
      window.open(institution.googleMapUrl, '_blank');
    } else {
      const encoded = encodeURIComponent(`${institution.name}, ${institution.address}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
    }
  };

  const openRoute = () => {
    const encoded = encodeURIComponent(`${institution.name}, ${institution.address}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank');
  };

  const tabs = [
    { id: 'overview', label: 'পরিচিতি', icon: BookOpen },
    { id: 'teachers', label: 'শিক্ষক', icon: UserCheck },
    { id: 'students', label: 'শিক্ষার্থী', icon: Users },
    { id: 'results', label: 'ফলাফল', icon: Award },
    { id: 'contact', label: 'যোগাযোগ', icon: Phone },
    { id: 'location', label: 'অবস্থান', icon: MapPin },
  ] as const;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 my-auto"
      >
        {/* Top Image & Hero Banner */}
        <div className="relative h-48 sm:h-64 bg-slate-900 overflow-hidden shrink-0">
          <img 
            src={institution.imageUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80"}
            alt={institution.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/20 z-10"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-black shadow-md ${
              institution.governmentStatus === 'government'
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 text-white'
            }`}>
              {institution.governmentStatus === 'government' ? 'সরকারি' : 'বেসরকারি'}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full text-xs font-black">
              EIIN: {institution.eiinNumber}
            </span>
            <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-black shadow-md">
              কোড: {institution.institutionCode}
            </span>
          </div>

          {/* Title & Info on Cover */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-10">
            <h1 className="text-xl sm:text-3xl font-black mb-1 leading-tight text-white drop-shadow-md">
              {institution.name}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
              <MapPin size={14} className="text-emerald-400 shrink-0" />
              <span>{institution.village}, {institution.union} ইউনিয়ন, পুঠিয়া</span>
            </p>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-3 sm:p-4 grid grid-cols-5 gap-2 text-center shrink-0">
          <a
            href={`tel:${institution.phone}`}
            className="py-2.5 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all no-underline shadow-sm"
          >
            <Phone size={16} />
            <span>কল করুন</span>
          </a>
          <button
            onClick={openMaps}
            className="py-2.5 px-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <MapPin size={16} className="text-indigo-600" />
            <span>লোকেশন</span>
          </button>
          <button
            onClick={openRoute}
            className="py-2.5 px-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <Compass size={16} className="text-blue-600" />
            <span>রুট দেখুন</span>
          </button>
          <button
            onClick={() => institution.website && window.open(institution.website, '_blank')}
            disabled={!institution.website}
            className={`py-2.5 px-1 bg-white border border-slate-200 rounded-2xl text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all shadow-xs ${
              institution.website ? 'text-slate-700 hover:bg-slate-100 cursor-pointer' : 'text-slate-400 opacity-50 cursor-not-allowed'
            }`}
          >
            <Globe size={16} className="text-teal-600" />
            <span>ওয়েবসাইট</span>
          </button>
          <button
            onClick={handleShare}
            className="py-2.5 px-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <Share2 size={16} className="text-purple-600" />
            <span>শেয়ার</span>
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto p-2 bg-slate-100/80 border-b border-slate-200 shrink-0 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Quick Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-700 block">প্রধান/অধ্যক্ষ</span>
                  <span className="text-xs font-black text-slate-800">{institution.headName}</span>
                </div>
                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-blue-700 block">মোট শিক্ষার্থী</span>
                  <span className="text-xs font-black text-slate-800">{institution.studentCount} জন</span>
                </div>
                <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-purple-700 block">মোট শিক্ষক</span>
                  <span className="text-xs font-black text-slate-800">{institution.teacherCount} জন</span>
                </div>
                <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-700 block">প্রতিষ্ঠার সাল</span>
                  <span className="text-xs font-black text-slate-800">{institution.establishedYear} খ্রি:</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h3 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-600" />
                  <span>প্রতিষ্ঠান সম্পর্কিত বিবরণ</span>
                </h3>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  {institution.description}
                </p>
              </div>

              {/* History */}
              {institution.history && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <h3 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-600" />
                    <span>ইতিহাস ও পটভূমি</span>
                  </h3>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    {institution.history}
                  </p>
                </div>
              )}

              {/* Basic Meta Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                <h3 className="text-xs font-black text-slate-800 mb-3 uppercase tracking-wider text-slate-400">মৌলিক তথ্য</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                  <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">প্রতিষ্ঠানের ধরন:</span>
                    <span className="text-slate-900 font-black">{institution.subType}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">সরকারী/বেসরকারী:</span>
                    <span className="text-slate-900 font-black">{institution.governmentStatus === 'government' ? 'সরকারি' : 'বেসরকারি'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">EIIN নম্বর:</span>
                    <span className="text-slate-900 font-black">{institution.eiinNumber}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">প্রতিষ্ঠান কোড:</span>
                    <span className="text-slate-900 font-black">{institution.institutionCode}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">ইউনিয়ন:</span>
                    <span className="text-slate-900 font-black">{institution.union}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-500">গ্রাম/এলাকা:</span>
                    <span className="text-slate-900 font-black">{institution.village}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEACHERS */}
          {activeTab === 'teachers' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <UserCheck size={18} className="text-emerald-600" />
                  <span>শিক্ষক ও কর্মকর্তাদের তালিকা</span>
                </h3>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                  মোট শিক্ষক: {institution.teacherCount} জন
                </span>
              </div>

              {institution.teachersList && institution.teachersList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {institution.teachersList.map((teacher) => (
                    <div key={teacher.id} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 hover:border-emerald-300 transition-all shadow-xs">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-black rounded-full flex items-center justify-center shrink-0 text-sm">
                        {teacher.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate">{teacher.name}</h4>
                        <p className="text-[11px] font-bold text-emerald-600">{teacher.designation}</p>
                        {teacher.subject && (
                          <p className="text-[10px] font-bold text-slate-400">বিষয়: {teacher.subject}</p>
                        )}
                      </div>
                      {teacher.phone && (
                        <a 
                          href={`tel:${teacher.phone}`}
                          className="p-2 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl transition-colors cursor-pointer"
                          title="কল করুন"
                        >
                          <Phone size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">শিক্ষকবৃন্দের তালিকা প্রকাশের কাজ চলছে</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-1">প্রধান শিক্ষক / অধ্যক্ষ: {institution.headName}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Users size={18} className="text-blue-600" />
                  <span>শিক্ষার্থী সংক্রান্ত তথ্য ও পরিসংখ্যান</span>
                </h3>
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                  সর্বমোট: {institution.studentCount} জন
                </span>
              </div>

              {institution.studentsInfo && institution.studentsInfo.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-black text-slate-600">
                      <tr>
                        <th className="p-3">শ্রেণী / স্তর</th>
                        <th className="p-3 text-right">শিক্ষার্থী সংখ্যা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                      {institution.studentsInfo.map((info, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="p-3 flex items-center gap-2">
                            <GraduationCap size={14} className="text-indigo-500" />
                            <span>{info.class}</span>
                          </td>
                          <td className="p-3 text-right font-black text-slate-900">{info.count} জন</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl text-center">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs font-black text-slate-800">মোট শিক্ষার্থী: {institution.studentCount} জন</p>
                  <p className="text-[11px] font-bold text-slate-500 mt-1">শিক্ষক-শিক্ষার্থী অনুপাত প্রায় ১ : {Math.round(institution.studentCount / (institution.teacherCount || 1))}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RESULTS */}
          {activeTab === 'results' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                <span>পাবলিক পরীক্ষার বিগত বছরের ফলাফল</span>
              </h3>

              {institution.resultsSummary && institution.resultsSummary.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {institution.resultsSummary.map((res, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/50 border border-amber-200/80 rounded-2xl shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-amber-900">{res.exam} পরীক্ষা ({res.year})</span>
                        <span className="text-xs font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-full">
                          পাসের হার: {res.passRate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>GPA 5 পেয়েছেন: <strong className="text-amber-700">{res.gpa5} জন</strong></span>
                        {res.totalExaminees && (
                          <span>মোট পরীক্ষার্থী: {res.totalExaminees} জন</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-black text-slate-800">পাবলিক পরীক্ষায় প্রতি বছর মেধা ও পাসের হারে এগিয়ে থাকে।</p>
                  <p className="text-[11px] font-bold text-slate-500 mt-1">বিস্তারিত ফলাফলের জন্য ইনস্টিটিউটের সাথে সরাসরি যোগাযোগ করুন।</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Phone size={18} className="text-teal-600" />
                <span>যোগাযোগের মাধ্যম</span>
              </h3>

              <div className="space-y-2 text-xs font-bold">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-600" />
                    <span>ঠিকানা:</span>
                  </span>
                  <span className="text-slate-900 font-black">{institution.address}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Phone size={16} className="text-blue-600" />
                    <span>অফিস মোবাইল:</span>
                  </span>
                  <a href={`tel:${institution.phone}`} className="text-blue-600 font-black hover:underline">
                    {institution.phone}
                  </a>
                </div>

                {institution.email && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Mail size={16} className="text-purple-600" />
                      <span>ই-মেইল:</span>
                    </span>
                    <a href={`mailto:${institution.email}`} className="text-purple-600 font-black hover:underline">
                      {institution.email}
                    </a>
                  </div>
                )}

                {institution.website && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Globe size={16} className="text-teal-600" />
                      <span>অফিসিয়াল ওয়েবসাইট:</span>
                    </span>
                    <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 font-black hover:underline">
                      {institution.website}
                    </a>
                  </div>
                )}

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    <span>অফিস সময়:</span>
                  </span>
                  <span className="text-slate-900 font-black">{institution.officeHours || 'সকাল ৯:০০ - বিকাল ৪:০০'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LOCATION & MAP */}
          {activeTab === 'location' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <MapPin size={18} className="text-rose-500" />
                  <span>📍 মানচিত্রে অবস্থান</span>
                </h3>
                <span className="text-xs font-bold text-slate-500">{institution.village}, {institution.union}</span>
              </div>

              {/* Map Preview Container */}
              <div className="relative w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <MapPin size={28} />
                </div>
                <h4 className="text-sm font-black text-slate-900 mb-1">{institution.name}</h4>
                <p className="text-xs font-bold text-slate-500 max-w-sm mb-4">{institution.address}</p>
                <button
                  onClick={openRoute}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer border-none"
                >
                  <Compass size={16} />
                  <span>🧭 এখানে যাওয়ার পথ দেখুন (Google Maps)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 shrink-0">
          <span>আমাদের পুঠিয়া এডুকেশন ডিরেক্টরি</span>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black transition-colors cursor-pointer border-none text-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
};
