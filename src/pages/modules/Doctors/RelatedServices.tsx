import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, TestTube, Droplet, Truck, Pill } from 'lucide-react';

export const RelatedServices: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'hospital',
      title: 'হাসপাতাল',
      desc: 'নিকটস্থ হাসপাতাল ও স্বাস্থ্য কেন্দ্র',
      icon: Building2,
      color: 'bg-emerald-50 text-[#006a4e] border-emerald-100',
      route: '/hospitals'
    },
    {
      id: 'diagnostic',
      title: 'ডায়াগনস্টিক',
      desc: 'প্যাথলজি ও রোগ নির্ণয় কেন্দ্র',
      icon: TestTube,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
      route: '/diagnostic'
    },
    {
      id: 'blood',
      title: 'রক্ত',
      desc: 'জরুরি রক্তদাতা ও ব্লাড ব্যাংক',
      icon: Droplet,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      route: '/blood-donor'
    },
    {
      id: 'emergency',
      title: 'জরুরি সেবা',
      desc: 'অ্যাম্বুলেন্স ও জরুরি হেল্পলাইন',
      icon: Truck,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
      route: '/emergency'
    },
    {
      id: 'pharmacy',
      title: 'ফার্মেসি',
      desc: '২৪ ঘণ্টা ওষুধের দোকান',
      icon: Pill,
      color: 'bg-teal-50 text-teal-700 border-teal-100',
      route: '/pharmacy'
    }
  ];

  return (
    <section className="mt-8 mb-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-sm font-black text-slate-800">আপনার প্রয়োজন হতে পারে</h3>
          <p className="text-[11px] text-slate-500 font-medium">পুঠিয়ার অন্যান্য জরুরি স্বাস্থ্য ও নাগরিক সেবা</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.id}
              onClick={() => navigate(svc.route)}
              className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5 border ${svc.color} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e] transition-colors mb-0.5">
                {svc.title}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium line-clamp-1 leading-snug">
                {svc.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedServices;
