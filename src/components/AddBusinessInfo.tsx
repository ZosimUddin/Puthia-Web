import React, { useState } from "react";
import { ArrowLeft, Store, Plus, Sparkles, CheckCircle2, Phone, MapPin, Tag, User, ShieldCheck, Send, Loader2 } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const AddBusinessInfo: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [category, setCategory] = useState("দোকান / মুদি");
  const [union, setUnion] = useState("পুঠিয়া সদর");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ownerName || !phone || !location) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "verified_businesses"), {
        name,
        ownerName,
        category,
        union,
        location,
        phone,
        whatsapp,
        description,
        verifiedBadge: "🟡 অপেক্ষমাণ (Pending Verification)",
        rating: "৫.০",
        createdAt: serverTimestamp()
      });

      setSuccessMsg(true);
      setName("");
      setOwnerName("");
      setLocation("");
      setPhone("");
      setWhatsapp("");
      setDescription("");
    } catch (error) {
      console.error("Error adding business:", error);
      handleFirestoreError(error, OperationType.CREATE, "verified_businesses");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-sans space-y-6 pb-8">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e293b, #334155)" }}
      >
        <button 
          onClick={onGoBack}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-slate-300 text-sm font-bold mb-1 uppercase tracking-wide">ব্যবসায়িক নিবন্ধয়ন</p>
          <h1 className="text-3xl md:text-4xl font-black mb-3 text-white">🏪 নতুন ব্যবসা যুক্ত করুন</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-slate-400/60 pl-3 py-1">
            পুঠিয়া উপজেলা ডিজিটাল ডিরেক্টরিতে আপনার দোকান, সুপার শপ, রেস্টুরেন্ট বা ব্যবসার তথ্য নিখরচায় যুক্ত করুন।
          </p>
        </div>
      </div>

      {successMsg ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl shadow-md">
            ✓
          </div>
          <h3 className="text-xl font-black text-gray-900">আপনার ব্যবসার তথ্য সফলভাবে জমা দেওয়া হয়েছে!</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            আমাদের অ্যাডমিন টিম তথ্যটি যাচাই করে দ্রুততম সময়ে ডিরেক্টরিতে প্রকাশ করবে। ধন্যবাদ!
          </p>
          <button 
            onClick={() => setSuccessMsg(false)}
            className="mt-4 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-2xl text-xs hover:bg-emerald-700 transition cursor-pointer"
          >
            আরেকটি ব্যবসা যুক্ত করুন
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-lg">ব্যবসায়িক বিস্তারিত তথ্য ফরম</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">প্রতিষ্ঠানের/ব্যবসার নাম *</label>
              <input 
                type="text" required placeholder="উদাঃ রহমান ট্রেডার্স বা আল-মদিনা কনফেকশনারি"
                value={name || ""} onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">প্রোপ্রাইটর / মালিকের নাম *</label>
              <input 
                type="text" required placeholder="উদাঃ মোঃ শফিকুর রহমান"
                value={ownerName || ""} onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">ব্যবসার ক্যাটাগরি *</label>
              <select 
                value={category || ""} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="দোকান / মুদি">দোকান / মুদি দোকান</option>
                <option value="সুপার শপ">সুপার শপ</option>
                <option value="রেস্টুরেন্ট & ক্যাফে">রেস্টুরেন্ট & ক্যাফে</option>
                <option value="হোটেল & রিসোর্ট">হোটেল & আবাসন</option>
                <option value="উদ্যোক্তা উদ্যোগ">উদ্যোক্তা উদ্যোগ</option>
                <option value="পোশাক & ফ্যাশন">পোশাক & ফ্যাশন</option>
                <option value="ইলেকট্রনিক্স & কম্পিউটার">ইলেকট্রনিক্স & কম্পিউটার</option>
                <option value="ফার্মেসি & স্বাস্থ্য">ফার্মেসি & স্বাস্থ্য</option>
                <option value="হার্ডওয়্যার & স্যানিটারি">হার্ডওয়্যার & স্যানিটারি</option>
                <option value="অন্যান্য">অন্যান্য ব্যবসা</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">ইউনিয়ন / এলাকা *</label>
              <select 
                value={union || ""} onChange={(e) => setUnion(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                <option value="বানেশ্বর">বানেশ্বর</option>
                <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                <option value="ভালুকগাছী">ভালুকগাছী</option>
                <option value="জৈনপুর">জৈনপুর</option>
                <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">মোবাইল নম্বর *</label>
              <input 
                type="text" required placeholder="উদাঃ 01700-000000"
                value={phone || ""} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)</label>
              <input 
                type="text" placeholder="উদাঃ 01700-000000"
                value={whatsapp || ""} onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block">অবস্থান / বিস্তারিত ঠিকানা *</label>
            <input 
              type="text" required placeholder="উদাঃ দোকান নং ৪, রাজবাড়ী মার্কেট, পুঠিয়া বাজার"
              value={location || ""} onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block">পণ্য ও সেবার বিবরণ</label>
            <textarea 
              rows={3} placeholder="আপনার ব্যবসার মূল পণ্য, অফার ও স্পেশালিটি সম্পর্কে লিখুন..."
              value={description || ""} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              ব্যবসার তথ্য জমা দিন
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
