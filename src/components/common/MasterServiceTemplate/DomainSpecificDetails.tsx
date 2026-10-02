import React from 'react';
import {
  Award, Stethoscope, Building2, MapPin, Clock, Phone, CheckCircle2,
  Activity, FileText, Bed, Truck, Utensils, Navigation, Briefcase,
  ShieldAlert, ShieldCheck, Home, Key, Zap, DollarSign, BookOpen,
  GraduationCap, UserCheck, HeartHandshake, Compass, Users, AlertCircle,
  HelpCircle, Wifi, Droplet, Fuel, Calendar, XCircle, AlertTriangle, Sparkles, Mail
} from 'lucide-react';
import { ServiceConfig } from '../../../config/servicesConfig';

interface DomainSpecificDetailsProps {
  group: string;
  item: Record<string, any>;
  title: string;
  speciality?: string;
  workplace?: string;
  address?: string;
  phone?: string;
  timeStr?: string;
  degrees?: string;
  config: ServiceConfig;
}

export const DomainSpecificDetails: React.FC<DomainSpecificDetailsProps> = ({
  group,
  item,
  title,
  speciality,
  workplace,
  address,
  phone,
  timeStr,
  degrees,
  config,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. DOCTOR & PROFESSIONALS (Doctor, Lawyer, Coach, Freelancer, Content Creator, Entrepreneur) */}
      {group === 'doctor_professional' && (
        <>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award size={15} className="text-[#006a4e]" />
              <span>যোগ্যতা, ডিগ্রি ও অভিজ্ঞতা</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 text-[10px] block font-bold">পেশাগত ডিগ্রি / শিক্ষা:</span>
                <span className="font-black text-slate-800 block">{degrees || 'এমবিবিএস, বিসিএস (স্বাস্থ্য)'}</span>
                <span className="text-slate-500 font-medium block text-[11px]">
                  {item.institution || workplace || 'রাজশাহী মেডিকেল কলেজ ও হাসপাতাল'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 text-[10px] block font-bold">অভিজ্ঞতা ও সনদ:</span>
                <span className="font-black text-[#006a4e] block">{item.experienceYears || '১০+ বছর অভিজ্ঞতা'}</span>
                {item.bmdcRegNo ? (
                  <span className="text-slate-600 font-bold block text-[11px]">BMDC রেজি নং: {item.bmdcRegNo}</span>
                ) : item.barRegNo ? (
                  <span className="text-slate-600 font-bold block text-[11px]">বার কাউন্সিল সদস্য নং: {item.barRegNo}</span>
                ) : (
                  <span className="text-slate-500 font-medium block text-[11px]">{item.fellowship || 'প্রফেশনাল সনদপ্রাপ্ত'}</span>
                )}
              </div>
            </div>

            {(item.treatedConditions || item.speciality || speciality) && (
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs space-y-1">
                <span className="text-[#006a4e] font-black flex items-center gap-1">
                  <Stethoscope size={13} />
                  <span>সেবা ও বিশেষজ্ঞতার ক্ষেত্রসমূহ:</span>
                </span>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {item.treatedConditions || `${speciality} সম্পর্কিত যাবতীয় সেবা, পরামর্শ ও পেশাদার সমাধান প্রদান করা হয়।`}
                </p>
              </div>
            )}
          </div>

          {/* Chambers / Office Information */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 size={15} className="text-[#006a4e]" />
              <span>চেম্বার / অফিস ও ভিজিট ফি</span>
            </h3>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">{item.chamberName || workplace}</h4>
                  <p className="text-slate-500 font-medium text-[11px] flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span>{address}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="bg-emerald-100 text-[#006a4e] text-xs font-black px-2.5 py-1 rounded-xl shrink-0">
                    {item.fee ? `ভিজিট: ${item.fee}` : 'ভিজিট: ৳৫০০'}
                  </span>
                  {item.followUpFee && (
                    <span className="text-[10px] text-slate-500 font-bold">
                      ফলো-আপ: {item.followUpFee}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-600 font-bold flex items-center gap-1 bg-white p-2 rounded-xl border border-slate-100">
                <Clock size={13} className="text-[#006a4e] shrink-0" />
                <span>সময়সূচি: {timeStr}</span>
              </div>

              {item.serialPhone && (
                <div className="pt-1 flex items-center justify-between bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-xs font-black text-[#006a4e] flex items-center gap-1">
                    <Phone size={13} />
                    <span>সিরিয়াল বুকিং নম্বর:</span>
                  </span>
                  <a
                    href={`tel:${item.serialPhone}`}
                    className="text-xs font-black text-emerald-800 underline hover:text-[#006a4e]"
                  >
                    {item.serialPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 2. HOSPITAL & COMMUNITY CLINIC */}
      {group === 'hospital' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity size={15} className="text-[#006a4e]" />
            <span>বিভাগ, জরুরি চিকিৎসা ও ভর্তি সেবা</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold">
            {['🚨 ২৪/৭ জরুরি বিভাগ', '🚑 অ্যাম্বুলেন্স সার্ভিস', '🧪 প্যাথলজি ল্যাব', '💊 বিনামূল্যে/জরুরি ওষুধ', '🩸 ব্লাড সাপোর্ট', '🏥 পুরুষ ও মহিলা ওয়ার্ড'].map((dept, i) => (
              <div key={i} className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-[#006a4e] text-center">
                {dept}
              </div>
            ))}
          </div>

          {item.chcpName && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="text-slate-400 text-[10px] block font-bold">দায়িত্বপ্রাপ্ত কমিউনিটি হেলথ কেয়ার প্রোভাইডার (CHCP):</span>
              <span className="font-black text-slate-900 block">{item.chcpName}</span>
              <span className="text-slate-500 font-medium text-[11px]">ইউনিয়ন: {item.unionName || 'পুঠিয়া'}</span>
            </div>
          )}

          {item.facilities && (
            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs space-y-1">
              <span className="text-[#006a4e] font-black flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>উপলব্ধ সুযোগ-সুবিধা:</span>
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">{item.facilities}</p>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900">বেড ও কেবিন চার্ট:</h4>
              {item.bedCount && (
                <span className="text-xs font-bold text-[#006a4e] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  মোট বেড: {item.bedCount}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block">ভিআইপি কেবিন:</span>
                <span className="font-black text-[#006a4e]">৳১,৫০০ / দিন</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block">সাধারণ বেড:</span>
                <span className="font-black text-slate-800">বিনামূল্যে / স্বল্পমূল্য</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block">জরুরি কেয়ার:</span>
                <span className="font-black text-emerald-800">২৪ ঘণ্টা প্রস্তুত</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DIAGNOSTIC & VACCINATION (MASTER DATABASE SPECIFICATION) */}
      {group === 'diagnostic' && (
        <div className="space-y-4">
          {/* Master Status & Verification Banner */}
          <div className={`p-4 rounded-3xl border transition-all ${
            item.status === 'closed'
              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
              : item.status === 'needs_verification'
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {item.status === 'closed' ? (
                  <span className="flex items-center gap-1.5 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                    <XCircle size={14} />
                    <span>🔴 বন্ধ / নিষ্ক্রিয়</span>
                  </span>
                ) : item.status === 'needs_verification' ? (
                  <span className="flex items-center gap-1.5 bg-amber-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                    <AlertTriangle size={14} />
                    <span>🟡 তথ্য যাচাই প্রয়োজন</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-emerald-700 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                    <ShieldCheck size={14} />
                    <span>🟢 যাচাইকৃত প্রতিষ্ঠান</span>
                  </span>
                )}
                <span className="text-xs font-bold">
                  {item.status === 'closed'
                    ? 'কার্যক্রম বর্তমানে বন্ধ রয়েছে'
                    : item.status === 'needs_verification'
                    ? 'প্রাথমিক ডাটাবেজ এন্ট্রি (যাচাই প্রক্রিয়াধীন)'
                    : 'নথিপত্র ও স্থানীয় স্বাস্থ্য বিভাগ দ্বারা পরীক্ষিত'}
                </span>
              </div>

              <div className="text-[11px] font-bold text-slate-600 bg-white/80 px-2.5 py-1 rounded-xl border border-slate-200/60 shadow-2xs">
                সর্বশেষ যাচাই: <span className="text-slate-900 font-black">{item.lastVerifiedDate || '২০২৬-০৮-১৫'}</span>
              </div>
            </div>

            {item.verificationSource && (
              <p className="text-[11px] mt-2.5 font-medium opacity-90 leading-relaxed flex items-start gap-1">
                <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
                <span>যাচাই বিবরণ / লাইসেন্স: {item.verificationSource} {item.licenseNo ? `(লাইসেন্স নং: ${item.licenseNo})` : ''}</span>
              </p>
            )}
          </div>

          {/* Master Specs Card */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 size={15} className="text-[#006a4e]" />
              <span>প্রতিষ্ঠান ওভারভিউ ও মাস্টার তথ্য</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">প্রতিষ্ঠানের ধরন:</span>
                <span className="font-black text-slate-900 block">{item.type || speciality || 'ডিজিটাল ডায়াগনস্টিক সেন্টার'}</span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">এলাকা / ইউনিয়ন:</span>
                <span className="font-black text-emerald-800 block">{item.area || item.union || 'পুঠিয়া সদর, পুঠিয়া'}</span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-0.5 sm:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">পূর্ণ ঠিকানা:</span>
                <span className="font-bold text-slate-800 block">{address || item.address || 'পুঠিয়া বাজার, রাজশাহী'}</span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">খোলার সময়সূচী:</span>
                <span className="font-black text-slate-900 block flex items-center gap-1">
                  <Clock size={13} className="text-[#006a4e]" />
                  <span>{item.openHours || timeStr || 'সকাল ৭:০০ - রাত ১০:০০'}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Emergency সুবিধা:</span>
                <span className={`font-black block flex items-center gap-1 ${item.hasEmergency24h || item.emergency ? 'text-emerald-700' : 'text-slate-700'}`}>
                  <Activity size={13} className="text-emerald-600" />
                  <span>{item.emergency || (item.hasEmergency24h ? '২৪/৭ জরুরি প্যাথলজি ও স্যাম্পল সেবা' : 'নিয়মিত সেবা সময় অনুযায়ী')}</span>
                </span>
              </div>

              {item.email && (
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">ইমেইল যোগাযোগ:</span>
                  <a href={`mailto:${item.email}`} className="font-bold text-[#006a4e] hover:underline flex items-center gap-1">
                    <Mail size={13} />
                    <span>{item.email}</span>
                  </a>
                </div>
              )}

              {item.dghsCode && (
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">DGHS কোড:</span>
                  <span className="font-black text-slate-900 block flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>{item.dghsCode}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Home Sample Collection Banner */}
            {item.homeSampleCollection && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-950 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏠</span>
                  <div>
                    <span className="font-black block">হোম স্যাম্পল কালেকশন সেবা:</span>
                    <span className="text-emerald-800 text-[11px]">{item.homeSampleCollection}</span>
                  </div>
                </div>
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="px-3 py-1.5 bg-[#006a4e] text-white text-[11px] font-black rounded-xl hover:bg-[#00543e] transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                  >
                    <Phone size={12} />
                    <span>কল করুন</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Visiting Doctors List (ডাক্তারদের তালিকা) */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Stethoscope size={15} className="text-[#006a4e]" />
                <span>ডাক্তারদের তালিকা ও কনসালটেশন চেম্বার</span>
              </h3>
              {item.doctorsList && item.doctorsList.length > 0 && (
                <span className="bg-emerald-50 text-[#006a4e] font-black text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {item.doctorsList.length} জন বিশেষজ্ঞ
                </span>
              )}
            </div>

            {item.doctorsList && item.doctorsList.length > 0 ? (
              <div className="space-y-3">
                {item.doctorsList.map((doc: any, dIdx: number) => (
                  <div key={dIdx} className="p-4 bg-slate-50/90 hover:bg-emerald-50/30 rounded-2xl border border-slate-200/80 transition-all space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm leading-snug">{doc.name}</h4>
                        <p className="text-xs font-bold text-[#006a4e]">{doc.speciality}</p>
                        {doc.degrees && <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{doc.degrees}</p>}
                      </div>
                      {doc.fee && (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 font-bold block">ভিজিট ফি</span>
                          <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {doc.fee}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-semibold text-slate-700 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span>চেম্বার বার: <span className="font-bold text-slate-900">{doc.visitingDays || 'প্রতিদিন'}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        <span>সময়সূচী: <span className="font-bold text-slate-900">{doc.visitingHours || 'বিকাল ৪:০০ - রাত ৮:০০'}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 gap-2">
                      {doc.roomNo && (
                        <span className="text-[11px] text-slate-500 font-bold">
                          📍 {doc.roomNo}
                        </span>
                      )}
                      <a
                        href={`tel:${doc.serialPhone || phone || ''}`}
                        className="ml-auto px-3 py-1.5 bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black rounded-xl transition-all shadow-2xs flex items-center gap-1.5 active:scale-95"
                      >
                        <Phone size={12} />
                        <span>সিরিয়াল বুকিং</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1 text-xs">
                <p className="font-bold text-slate-700">কনসালটেশন চেম্বার ডাক্তারদের তালিকা নিয়মিত আপডেট করা হচ্ছে।</p>
                <p className="text-slate-500 text-[11px]">ডাক্তারের বর্তমান চেম্বার শিডিউল জানতে সরাসরি সেন্টারের নম্বরে কল করুন।</p>
                {phone && (
                  <a href={`tel:${phone}`} className="inline-flex items-center gap-1 text-[#006a4e] font-black text-xs mt-2 underline">
                    <Phone size={13} />
                    <span>হেল্পলাইনে কল করুন ({phone})</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Available Tests & Services (সেবাসমূহ ও টেস্টের মূল্য তালিকা) */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText size={15} className="text-[#006a4e]" />
              <span>উপলব্ধ প্যাথলজি টেস্ট, ইমেজিং ও মূল্য তালিকা</span>
            </h3>

            {item.servicesList && item.servicesList.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {item.servicesList.map((test: any, tIdx: number) => (
                  <div key={tIdx} className="py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-black text-slate-900 text-xs block">{test.name}</span>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        {test.deliveryTime && <span>⏱️ রিপোর্ট: <strong className="text-slate-700">{test.deliveryTime}</strong></span>}
                        {test.preparation && <span className="text-amber-700">⚠️ {test.preparation}</span>}
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-[#006a4e] px-3 py-1 rounded-xl text-xs font-black border border-emerald-200/80 shadow-2xs">
                      {test.price}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs font-bold">
                {[
                  { name: 'CBC (কমপ্লিট ব্লাড কাউন্ট - ৩ পার্ট)', price: '৳৪০০', time: '২ ঘণ্টা' },
                  { name: 'কালার আল্ট্রাসোনোগ্রাফি (Whole Abdomen 4D)', price: '৳৮৫০', time: 'একই দিন' },
                  { name: 'ডিজিটাল এক্স-রে (Chest P/A View 500mA)', price: '৳৪৫০', time: '৩০ মিনিট' },
                  { name: '১২ চ্যানেল ডিজিটাল ইসিজি (ECG)', price: '৳৩০০', time: 'তাৎক্ষণিক' },
                  { name: 'ডায়াবেটিস পরীক্ষা (RBS / FBS)', price: '৳১০০', time: '১৫ মিনিট' },
                  { name: 'লিপিড প্রোফাইল (Lipid Profile Complete)', price: '৳৭০০', time: '৪ ঘণ্টা' },
                  { name: 'লিভার ফাংশন টেস্ট (SGPT / SGOT / Bilirubin)', price: '৳৬০০', time: '৩ ঘণ্টা' },
                  { name: 'সেরাম ক্রিয়েটিনিন ও ইউরিক এসিড', price: '৳৪০০', time: '২ ঘণ্টা' },
                  { name: 'ইউরিন রুটিন অ্যান্ড মাইক্রোস্কোপিক (Urine R/E)', price: '৳১৫০', time: '১ ঘণ্টা' },
                ].map((test, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-slate-900 block">{test.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">রিপোর্ট সময়: {test.time}</span>
                    </div>
                    <span className="bg-emerald-50 text-[#006a4e] px-2.5 py-1 rounded-xl text-xs font-black border border-emerald-100">
                      {test.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. PHARMACY */}
      {group === 'pharmacy' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 size={15} className="text-[#006a4e]" />
            <span>ফার্মেসির সেবা ও জরুরি ওষুধ প্রাপ্যতা</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <div className="text-2xl">🌙</div>
              <div>
                <span className="text-slate-900 block font-black">২৪ ঘণ্টা ইমার্জেন্সি নাইট সার্ভিস</span>
                <span className="text-[11px] text-emerald-800 font-medium">জরুরি রাতেও জীবনরক্ষাকারী ওষুধ মিলবে</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <div className="text-2xl">🛵</div>
              <div>
                <span className="text-slate-900 block font-black">হোম ডেলিভারি সেবা</span>
                <span className="text-[11px] text-emerald-800 font-medium">প্রেসক্রিপশন পাঠিয়ে অর্ডার করুন</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. BLOOD DONOR */}
      {group === 'blood' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity size={15} className="text-rose-600" />
            <span>রক্তের গ্রুপ ও রক্তদাতার প্রোফাইল</span>
          </h3>

          <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold block">রক্তের গ্রুপ (Blood Group):</span>
              <span className="text-2xl font-black text-rose-600">{item.bloodGroup || 'O (+ve)'}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold block">বর্তমান রক্তদান অবস্থা:</span>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-[#006a4e] text-xs font-black rounded-full mt-1">
                ✓ প্রস্তুত (Ready to donate)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. EMERGENCY & GOVT / OFFICERS */}
      {(group === 'emergency_govt' || group === 'officers') && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert size={15} className="text-rose-600" />
            <span>সরকারি তথ্য, কর্মকর্তা ও হটলাইন নম্বর</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200">
              <span className="text-rose-600 text-[10px] block">জাতীয় জরুরী সেবা:</span>
              <span className="text-lg font-black text-rose-700">📞 ৯৯৯ (999)</span>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[#006a4e] text-[10px] block">দাপ্তরিক / ডিউটি অফিসার ফোন:</span>
              <span className="text-base font-black text-slate-900">{phone || 'উপলব্ধ'}</span>
            </div>
          </div>

          {item.servicesOffered && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="font-black text-slate-800 block">নাগরিক সেবাসমূহ (Citizen Charter):</span>
              <p className="text-slate-600 leading-relaxed font-medium">{item.servicesOffered}</p>
            </div>
          )}
        </div>
      )}

      {/* 7. TRANSPORT, CNG, BUS & BIKE SHARE */}
      {group === 'transport' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Truck size={15} className="text-[#006a4e]" />
            <span>রুট বিবরণ, ভাড়া তালিকা ও কাউন্টার</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs font-bold">
            {item.route && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">চলাচলের রুট:</span>
                <span className="text-slate-900">{item.route}</span>
              </div>
            )}
            {item.fare && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">ভাড়ার হার:</span>
                <span className="text-[#006a4e]">{item.fare}</span>
              </div>
            )}
            {item.linemanPhone && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">লাইনম্যান / সিরিয়াল ফোন:</span>
                <a href={`tel:${item.linemanPhone}`} className="text-slate-900 underline">{item.linemanPhone}</a>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">চলাচলের সময়সূচি:</span>
              <span className="text-slate-800">{timeStr || 'সকাল ৬:০০ AM – রাত ১০:০০ PM'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. CAR RENTAL */}
      {group === 'car_rental' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Truck size={15} className="text-[#006a4e]" />
            <span>গাড়ির বিবরণ, ভাড়া ও ড্রাইভার পরিচিতি</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-slate-400 text-[10px] block">গাড়ির ধরন</span>
              <span className="text-slate-900 block mt-0.5">{item.vehicleType || 'প্রাইভেট কার / নোয়া'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-slate-400 text-[10px] block">দৈনিক ভাড়া</span>
              <span className="text-[#006a4e] block mt-0.5">{item.dailyRate || '৳৩,০০০ - ৳৪,৫০০'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-slate-400 text-[10px] block">এসি সুবিধা</span>
              <span className="text-emerald-800 block mt-0.5">✓ সম্পূর্ণ এসি</span>
            </div>
          </div>
        </div>
      )}

      {/* 9. PETROL PUMP */}
      {group === 'petrol_pump' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Fuel size={15} className="text-[#006a4e]" />
            <span>উপলব্ধ জ্বালানি ও সেবা</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-bold text-center">
            {['⛽ অকটেন (Octane)', '🛢️ পেট্রোল (Petrol)', '🚜 ডিজেল (Diesel)', '💨 সিএনজি / বায়ু'].map((fuel, i) => (
              <div key={i} className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[#006a4e]">
                {fuel}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. BANK & INSURANCE & MOBILE BANKING */}
      {group === 'bank' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 size={15} className="text-[#006a4e]" />
            <span>ব্যাংকিং সেবা, এটিএম ও শাখা বিবরণ</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs font-bold">
            {item.routingNo && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">রাউটিং নম্বর:</span>
                <span className="text-slate-900">{item.routingNo}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">এটিএম (ATM) বুথ:</span>
              <span className="text-[#006a4e]">✓ ২৪ ঘণ্টা খোলা এটিএম বুথ সংলগ্ন</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ব্যাংকিং লেনদেন সময়:</span>
              <span className="text-slate-800">{timeStr || 'সকাল ১০:০০ AM – বিকাল ৪:০০ PM'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 11. EDUCATION & COACHING & TRAINING */}
      {group === 'education' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <GraduationCap size={15} className="text-[#006a4e]" />
            <span>কোর্স, বিভাগ ও প্রতিষ্ঠান তথ্য</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs font-bold">
            {item.eiin && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">EIIN নম্বর:</span>
                <span className="text-slate-900">{item.eiin}</span>
              </div>
            )}
            {item.courses && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">প্রশিক্ষণ কোর্স:</span>
                <span className="text-slate-900">{item.courses}</span>
              </div>
            )}
            {item.coursesOffered && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">পাঠদানের বিষয়:</span>
                <span className="text-slate-900">{item.coursesOffered}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">ক্লাস ও অফিস সময়:</span>
              <span className="text-slate-800">{timeStr || 'সকাল ৯:০০ AM – বিকাল ৪:০০ PM'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 12. HOUSE RENT & REAL ESTATE */}
      {group === 'house_rent' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Home size={15} className="text-[#006a4e]" />
            <span>বাসা ও ফ্ল্যাটের বিবরণ এবং সুযোগ-সুবিধা</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-slate-400 text-[10px] block">মাসিক ভাড়া</span>
              <span className="text-[#006a4e] block mt-0.5">{item.rentAmount || item.price || '৳৬,০০০ / মাস'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-slate-400 text-[10px] block">বেডরুম ও বাথরুম</span>
              <span className="text-slate-900 block mt-0.5">{item.bedBath || '২ বেড, ১ বাথ, ১ বেলকনি'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-slate-400 text-[10px] block">অগ্রিম জামানত</span>
              <span className="text-emerald-800 block mt-0.5">{item.advance || '২ মাসের অগ্রিম'}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs font-bold text-[#006a4e] flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>পানি, বিদ্যুৎ ও নিজস্ব সাবমার্সিবল পাম্প সুবিধা সংযুক্ত।</span>
          </div>
        </div>
      )}

      {/* 13. LAND SALE */}
      {group === 'land_sale' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin size={15} className="text-[#006a4e]" />
            <span>জমির বিবরণ, মূল্য ও দলিল তথ্য</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs font-bold">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">জমির ধরন:</span>
              <span className="text-slate-900">{item.landType || 'আবাসিক বাস্তু প্লট'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">জমির পরিমাণ:</span>
              <span className="text-slate-900">{item.landArea || '১০ শতাংশ'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">দাম (শতাংশ প্রতি):</span>
              <span className="text-[#006a4e]">{item.pricePerShotangsho || 'আলোচনা সাপেক্ষে'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">কাগজপত্র ও দলিল:</span>
              <span className="text-emerald-800">✓ নির্ভেজাল ও হালনাগাদ খারিজ সম্পন্ন</span>
            </div>
          </div>
        </div>
      )}

      {/* 14. MISTRI & TECHNICIAN */}
      {group === 'mistri' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap size={15} className="text-[#006a4e]" />
            <span>কাজের দক্ষতা, ভিজিট চার্জ ও সেবা এলাকা</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-[10px] block">কাজের ধরন:</span>
              <span className="text-slate-900">{item.trade || speciality || 'ইলেকট্রিশিয়ান ও প্লাম্বিং'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 text-[10px] block">হোম ভিজিট চার্জ:</span>
              <span className="text-[#006a4e]">{item.visitCharge || '৳২০০ - ৳৩০০'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 15. RELIGIOUS (Mosque, Eidgah, Graveyard, Temple, Zakat, Orphanage) */}
      {group === 'religious' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HeartHandshake size={15} className="text-[#006a4e]" />
            <span>জামাআত / পূজা সময়সূচি ও পরিচালনা কমিটি</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs font-bold">
            {item.imamName && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">ইমাম / খতিব:</span>
                <span className="text-slate-900">{item.imamName}</span>
              </div>
            )}
            {item.jamatTime && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">জামায়াত / ঈদ সময়:</span>
                <span className="text-[#006a4e]">{item.jamatTime}</span>
              </div>
            )}
            {item.donationAccount && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">অনুদান / হিসাব নম্বর:</span>
                <span className="text-slate-900">{item.donationAccount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">কমিটি হেল্পলাইন:</span>
              <span className="text-slate-800">{phone || 'যোগাযোগ করুন'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 16. RESTAURANT & FOOD */}
      {group === 'restaurant' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Utensils size={15} className="text-[#006a4e]" />
            <span>স্পেশাল মেন্যু ও ঐতিহ্যবাহী খাবার</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs font-bold">
            {[
              { item: 'পুঠিয়ার বিখ্যাত ঐতিহ্যবাহী কাঁচাগোল্লা', price: '৳৬০০ / কেজি' },
              { item: 'স্পেশাল মাটন কাচ্চি বিরিয়ানি', price: '৳২২০ / প্লেট' },
              { item: 'চিকেন ফ্রাইড রাইস সেট মেন্যু', price: '৳১৮০ / সেট' },
              { item: 'মালাই চা ও স্পেশাল পরোটা', price: '৳৩০' },
            ].map((menu, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <span className="text-slate-800">{menu.item}</span>
                <span className="bg-emerald-100 text-[#006a4e] px-2.5 py-1 rounded-xl text-xs font-black">
                  {menu.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 17. HOTEL & RESORT */}
      {group === 'hotel' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Bed size={15} className="text-[#006a4e]" />
            <span>রুম ক্যাটাগরি ও ভাড়া তালিকা</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-bold">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-slate-400 text-[10px] block">এসি ডিলাক্স রুম</span>
              <span className="text-base font-black text-[#006a4e] block mt-0.5">৳১,৮০০ / রাত</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-slate-400 text-[10px] block">নন-এসি ডাবল রুম</span>
              <span className="text-base font-black text-slate-800 block mt-0.5">৳১,০০০ / রাত</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-slate-400 text-[10px] block">ফ্যামিলি সুইট</span>
              <span className="text-base font-black text-emerald-800 block mt-0.5">৳২,৫০০ / রাত</span>
            </div>
          </div>
        </div>
      )}

      {/* 18. TOURISM & CULTURAL */}
      {group === 'tourism' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Navigation size={15} className="text-[#006a4e]" />
            <span>ঐতিহাসিক পটভূমি ও দর্শনার্থী নির্দেশিকা</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {item.description || 'পুঠিয়া রাজবাড়ি ও মন্দির চত্বর পুঠিয়া উপজেলার ঐতিহাসিক প্রত্নতাত্ত্বিক নিদর্শন। এখানে শিব মন্দির, পঞ্চরত্ন গোবিন্দ মন্দির ও দোল মন্দির অবস্থিত।'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">প্রবেশ ফি:</span>
              <span className="text-slate-800">৳২০ (জনপ্রতি)</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">দর্শনের সময়:</span>
              <span className="text-slate-800">সকাল ৯:০০ AM – বিকাল ৫:০০ PM</span>
            </div>
          </div>
        </div>
      )}

      {/* 19. JOB CIRCULAR */}
      {group === 'job' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Briefcase size={15} className="text-[#006a4e]" />
            <span>চাকরির পদ, বেতন ও যোগ্যতা বিবরণ</span>
          </h3>

          <div className="space-y-2 text-xs font-bold text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">পদবী:</span>
              <span className="text-slate-900">{item.designation || title}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">বেতন পরিসর:</span>
              <span className="text-[#006a4e]">{item.salary || 'আলোচনা সাপেক্ষে'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500">আবেদনের শেষ তারিখ:</span>
              <span className="text-rose-600">{item.deadline || '১৫ সেপ্টেম্বর ২০২৬'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">শিক্ষাগত যোগ্যতা:</span>
              <span className="text-slate-900">{degrees || 'এইচএসসি / স্নাতক সমমান'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 20. AGRICULTURE & LIVESTOCK */}
      {group === 'agriculture' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Droplet size={15} className="text-[#006a4e]" />
            <span>কৃষি ও প্রাণিসম্পদ সেবা এবং পরামর্শ</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs font-bold">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">উপসহকারী কৃষি / পশু কর্মকর্তা:</span>
              <span className="text-slate-900">{item.officerName || 'উপজেলা কৃষি ও প্রাণিসম্পদ দপ্তর'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">সার ও বীজ ডিলার লাইসেন্স:</span>
              <span className="text-[#006a4e]">✓ অনুমোদিত সরকারি ডিলার</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">কৃষি হেল্পলাইন:</span>
              <span className="text-slate-800">{phone || 'যোগাযোগ করুন'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 21. LOST AND FOUND */}
      {group === 'lost_found' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertCircle size={15} className="text-amber-600" />
            <span>হারানো / প্রাপ্তির ঘটনা বিবরণ</span>
          </h3>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2.5 text-xs font-bold">
            <div className="flex justify-between border-b border-amber-200 pb-2">
              <span className="text-slate-600">বিজ্ঞপ্তির ধরন:</span>
              <span className="text-amber-900">{item.itemType || 'হারানো বিজ্ঞপ্তি'}</span>
            </div>
            <div className="flex justify-between border-b border-amber-200 pb-2">
              <span className="text-slate-600">স্থান:</span>
              <span className="text-slate-900">{item.incidentLocation || address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">তারিখ:</span>
              <span className="text-slate-900">{item.incidentDate || timeStr}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
