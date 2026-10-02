import { ChevronLeft, Landmark, FileText, CheckCircle2, Clock, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface Step {
  title: string;
  desc: string;
  time: string;
}

const STEPS: Step[] = [
  { title: 'অনলাইন আবেদন', desc: 'অফিসিয়াল পোর্টালে গিয়ে নির্ভুলভাবে ফর্ম পূরণ করুন।', time: '১৫-২০ মিনিট' },
  { title: 'ফি প্রদান', desc: 'নির্ধারিত ব্যাংকে বা অনলাইনে পাসপোর্টের ফি জমা দিন।', time: '৫ মিনিট' },
  { title: 'বায়োমেট্রিক', desc: 'আঞ্চলিক পাসপোর্ট অফিসে গিয়ে ছবি ও আঙুলের ছাপ দিন।', time: '১-২ ঘণ্টা' },
  { title: 'পুলিশ ভেরিফিকেশন', desc: 'আপনার দেওয়া ঠিকানায় পুলিশ তদন্ত সম্পন্ন হবে।', time: '৩-৭ দিন' },
  { title: 'পাসপোর্ট সংগ্রহ', desc: 'এসএমএস পাওয়ার পর অফিস থেকে পাসপোর্ট সংগ্রহ করুন।', time: '৩-১০ দিন' },
];

interface Props {
  onBack: () => void;
}

export default function PassportServices({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-['Hind_Siliguri']">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            <ChevronLeft size={20} />
            <span>ফিরে যান</span>
          </button>
          <h1 className="text-lg font-bold text-slate-800">পাসপোর্ট সেবা গাইড</h1>
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden mb-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Landmark className="text-blue-400" />
              <span className="text-sm font-bold uppercase tracking-widest text-blue-400">অফিসিয়াল গাইড</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">ই-পাসপোর্ট আবেদনের সহজ ধাপ</h2>
            <p className="text-slate-400 mb-8 max-w-lg">
              পুঠিয়া থেকে পাসপোর্ট আবেদনের জন্য আপনাকে রাজশাহী আঞ্চলিক পাসপোর্ট অফিসে যোগাযোগ করতে হবে। নিচে আবেদনের বিস্তারিত ধাপ দেওয়া হলো।
            </p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95">
              <span>অনলাইন আবেদন করুন</span>
              <ExternalLink size={18} />
            </button>
          </div>
        </motion.div>

        {/* Process Steps */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <FileText className="text-blue-600" />
            আবেদন প্রক্রিয়া
          </h3>
          
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 group"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center font-bold text-slate-400 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors">
                  {index + 1}
                </div>
                {index !== STEPS.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 my-2" />
                )}
              </div>
              <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-4 group-hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800">{step.title}</h4>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                    <Clock size={12} />
                    <span>{step.time}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Office Location */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <MapPin className="text-blue-600" />
            আপনার আঞ্চলিক অফিস
          </h3>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-48 h-32 bg-slate-100 rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                <MapPin size={40} />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 mb-2">আঞ্চলিক পাসপোর্ট অফিস, রাজশাহী</h4>
              <p className="text-sm text-slate-500 mb-4">বনলতা বাণিজ্যিক এলাকা, চন্দ্রিমা, রাজশাহী।</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold text-slate-700 transition-colors">
                  ম্যাপে দেখুন
                </button>
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold text-slate-700 transition-colors">
                  ফোন নম্বর
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-blue-50 rounded-3xl p-8 border border-blue-100 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 mx-auto shadow-sm mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">প্রয়োজনীয় কাগজপত্র</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">আবেদনের সময় এনআইডি কার্ড বা জন্ম নিবন্ধনের অনলাইন কপি সাথে রাখুন।</p>
          <button className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all">
            সম্পূর্ণ চেকলিস্ট দেখুন
          </button>
        </div>
      </div>
    </div>
  );
}
