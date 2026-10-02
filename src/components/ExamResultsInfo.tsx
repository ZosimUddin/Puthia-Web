import React, { useState } from "react";
import { ArrowLeft, Award, BookOpen, CheckCircle, ExternalLink, FileText, Search, Sparkles } from "lucide-react";

export function ExamResultsInfo({ onGoBack }: { onGoBack: () => void }) {
  const [boardRoll, setBoardRoll] = useState("");
  const [boardReg, setBoardReg] = useState("");
  const [examType, setExamType] = useState("ssc");
  const [examYear, setExamYear] = useState("2026");
  const [simulatedResult, setSimulatedResult] = useState<any>(null);

  const officialLinks = [
    {
      name: "ওয়েব ভিত্তিক অল বোর্ড রেজাল্ট পোর্টাল (SSC/HSC/JSC)",
      link: "https://eboardresults.com",
      authority: "শিক্ষা বোর্ড বাংলাদেশ",
      desc: "এক ক্লিকে প্রতিষ্ঠানের ইনস্টিটিউশনাল রেজাল্ট ও স্বস্ব শিক্ষার্থীদের সম্পূর্ণ মার্কশীট দেখার মূল অফিসিয়াল পোর্টাল।"
    },
    {
      name: "এডুকেশন বোর্ড বাংলাদেশ ফলাফল অফিশিয়াল সার্ভার",
      link: "http://www.educationboardresults.gov.bd",
      authority: "বাংলাদেশ আন্তঃশিক্ষা বোর্ড",
      desc: "রাজশাহী বোর্ডসহ সারাদেশের এসএসসি ও এইচএসসি পরীক্ষার ইস্টার ও গ্রেড অনুসন্ধান।"
    },
    {
      name: "মাদ্রাসা শিক্ষা বোর্ড (দাখিল/আলিম) রেজাল্ট",
      link: "http://www.bmeb.gov.bd",
      authority: "বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড",
      desc: "পুঠিয়ার দাখিল, আলিম ও ফাজিল পরীক্ষার ফলাফল সার্ভার।"
    },
    {
      name: "জাতীয় বিশ্ববিদ্যালয় ডিগ্রি/অনার্স রেজাল্ট পোর্টাল",
      link: "http://www.nu.ac.bd/results",
      authority: "জাতীয় বিশ্ববিদ্যালয়",
      desc: "পুঠিয়া ডিগ্রি কলেজের শিক্ষার্থী ও সম্মান কোর্সের ফল প্রকাশ পোর্টাল।"
    }
  ];

  const handleSimulateCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardRoll) return;

    setSimulatedResult({
      studentName: "মোঃ জোসিম উদ্দিন",
      fatherName: "মোঃ রফিকুল ইসলাম",
      institute: "পুঠিয়া পিএন সরকারি উচ্চ বিদ্যালয়, রাজশাহী",
      board: "রাজশাহী বোর্ড",
      gpa: "5.00 (Golden A+)",
      status: "উত্তীর্ণ (PASSED)",
      roll: boardRoll,
      reg: boardReg || "২০১২৮৮৪৩৯১",
      subjects: [
        { name: "বাংলা (Bangla)", grade: "A+", point: "5.00" },
        { name: "ইংরেজি (English)", grade: "A+", point: "5.00" },
        { name: "গণিত (Mathematics)", grade: "A+", point: "5.00" },
        { name: "পদার্থবিজ্ঞান (Physics)", grade: "A+", point: "5.00" },
        { name: "রসায়ন (Chemistry)", grade: "A+", point: "5.00" },
        { name: "জীববিজ্ঞান (Biology)", grade: "A+", point: "5.00" }
      ]
    });
  };

  return (
    <div className="font-sans space-y-6 pb-8">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e3a8a, #3b82f6)" }}
      >
        <button 
          onClick={onGoBack}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-blue-200 text-sm font-bold mb-1 uppercase tracking-wide">পরীক্ষার ফল অনুসন্ধান</p>
          <h1 className="text-3xl md:text-4xl font-black mb-3 text-white">🏆 ফলাফল (Exam Results)</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-blue-300/60 pl-3 py-1">
            এসএসসি, এইচএসসি, দাখিল, আলিম, প্রাইমারি ও জাতীয় বিশ্ববিদ্যালয়ের পরীক্ষার ফলাফল দেখার লিংক ও দ্রুত সেবা।
          </p>
        </div>
      </div>

      {/* Quick Result Checker Box */}
      <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          দ্রুত ফলাফল অনুসন্ধান ডেমো ড্যাশবোর্ড
        </h3>
        <form onSubmit={handleSimulateCheck} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 block">পরীক্ষার নাম</label>
            <select 
              value={examType || ""} onChange={(e) => setExamType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ssc">এসএসসি (SSC / Dakhil)</option>
              <option value="hsc">এইচএসসি (HSC / Alim)</option>
              <option value="jsc">জেএসসি / সমমান</option>
              <option value="nu">জাতীয় বিশ্ববিদ্যালয়</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 block">পাসের সন</label>
            <select 
              value={examYear || ""} onChange={(e) => setExamYear(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2026">২০২৬</option>
              <option value="2025">২০২৫</option>
              <option value="2024">২০২৪</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 block">রোল নম্বর *</label>
            <input 
              type="text" required placeholder="উদাঃ 123456"
              value={boardRoll || ""} onChange={(e) => setBoardRoll(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-blue-700 transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
            >
              <Search className="w-3.5 h-3.5" /> ফল দেখুন
            </button>
          </div>
        </form>

        {simulatedResult && (
          <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-blue-200 pb-2">
              <span className="font-extrabold text-blue-900 text-sm">পরীক্ষার্থীর ফলাফল বিবরণী</span>
              <span className="bg-emerald-600 text-white font-black px-3 py-0.5 rounded-full text-[11px]">
                {simulatedResult.status}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-800">
              <p><b>নাম:</b> {simulatedResult.studentName}</p>
              <p><b>পিতার নাম:</b> {simulatedResult.fatherName}</p>
              <p><b>প্রতিষ্ঠানের নাম:</b> {simulatedResult.institute}</p>
              <p><b>মোট জিপিএ:</b> <span className="font-black text-blue-700 text-sm">{simulatedResult.gpa}</span></p>
            </div>
            <div className="pt-2">
              <p className="font-bold text-gray-800 mb-1.5">বিষয়ভিত্তিক প্রাপ্ত গ্রেড:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {simulatedResult.subjects.map((sub: any, idx: number) => (
                  <div key={idx} className="bg-white p-2 rounded-xl border border-blue-100 flex items-center justify-between">
                    <span className="font-medium text-gray-700 truncate">{sub.name}</span>
                    <span className="font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded">{sub.grade}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Official Result Links */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 text-base">অফিসিয়াল রেজাল্ট পোর্টাল ের তালিকা</h3>
        {officialLinks.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 mb-1">
                {item.authority}
              </span>
              <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-4 py-2 rounded-xl text-xs transition inline-flex items-center gap-1 whitespace-nowrap cursor-pointer shrink-0"
            >
              ওয়েবসাইটে যান <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
