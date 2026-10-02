import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
// @ts-ignore
import templeBg from "../assets/images/puthia_temple_bg_1783616072369.jpg";
import { addContactMessage } from '../api';

const Contact: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !subject || !message) {
      setErrorMsg("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য পূরণ করুন।");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await addContactMessage({
        name,
        phone,
        email: email || undefined,
        subject,
        message,
        createdAt: new Date().toISOString(),
        status: "Pending"
      });

      setSuccess(true);
      setName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setErrorMsg("মেসেজ পাঠানো সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2fcf9] via-[#f7fcfb] to-[#eaf5f2] flex flex-col p-4 relative overflow-y-auto select-none font-sans">
      
      {/* Background watermark */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url(${templeBg})` }}
      />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10 pt-2 max-w-md w-full mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100 text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <ArrowLeft size={20} className="stroke-[2.5]" />
        </button>
        <h1 className="text-lg font-black text-[#01412F]">সাহায্য ও যোগাযোগ</h1>
        <div className="w-10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto space-y-6 relative z-10 pb-12"
      >
        {/* Contact info cards row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <Phone size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-[13px] font-black text-slate-800">কল করুন</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">যেকোনো সহায়তায়</p>
            </div>
            <a href="tel:01700000000" className="text-xs font-black text-[#009664] hover:underline">
              01700-000000
            </a>
          </div>

          <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <Mail size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-[13px] font-black text-slate-800">ইমেইল</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">সমস্যা বিস্তারিত লিখে</p>
            </div>
            <a href="mailto:support@puthiadiary.com" className="text-xs font-black text-[#009664] hover:underline break-all">
              support@puthiadiary.com
            </a>
          </div>
        </div>

        {/* Message Form Card */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800">সরাসরি বার্তা পাঠান</h2>
              <p className="text-[10px] font-bold text-slate-400">আপনার মতামত বা প্রশ্ন আমাদের সরাসরি পাঠান</p>
            </div>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-[16px] text-emerald-800 text-xs font-bold flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#009664] shrink-0 mt-0.5" />
              <div>
                <p className="font-black">বার্তাটি সফলভাবে পাঠানো হয়েছে!</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">আমাদের টিম আপনার সাথে দ্রুত যোগাযোগ করবে।</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-[12px] text-red-600 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-black text-slate-600 mb-1">আপনার নাম <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                required
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
                placeholder="নাম লিখুন"
                className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-slate-600 mb-1">মোবাইল নম্বর <span className="text-rose-500">*</span></label>
                <input 
                  type="tel" 
                  required
                  value={phone || ""}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১৭xxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-600 mb-1">ইমেইল <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span></label>
                <input 
                  type="email" 
                  value={email || ""}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-600 mb-1">বিষয় <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                required
                value={subject || ""}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="বার্তা বা জিজ্ঞাসার মূল বিষয়"
                className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-600 mb-1">বিস্তারিত বার্তা <span className="text-rose-500">*</span></label>
              <textarea 
                required
                rows={4}
                value={message || ""}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="এখানে বিস্তারিতভাবে আপনার বার্তাটি লিখুন..."
                className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#009664] hover:bg-emerald-700 disabled:opacity-50 text-white rounded-[14px] font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} strokeWidth={2.5} />
              )}
              {loading ? "বার্তা পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
            </button>
          </form>
        </div>
      </motion.div>

    </div>
  );
};

export default Contact;
