import React from "react";
import { ArrowLeft, Building2, MapPin, Phone, Mail, Clock, ShieldCheck, UserCheck, FileText, Info } from "lucide-react";

export function EducationOfficeInfo({ onGoBack }: { onGoBack: () => void }) {
  const offices = [
    {
      id: "off-1",
      name: "উপজেলা মাধ্যমিক শিক্ষা অফিস, পুঠিয়া",
      headName: "মোঃ লায়লুর রহমান",
      designation: "উপজেলা মাধ্যমিক শিক্ষা অফিসার",
      location: "উপজেলা পরিষদ কমপ্লেক্স ভবন (২য় তলা), পুঠিয়া, রাজশাহী",
      phone: "০২৪৭-৮৮৯১২২",
      mobile: "০১৭১১-৯৯৮৮৭৭",
      email: "useo.puthia@gmail.com",
      services: [
        "মাধ্যমিক স্কুল ও মাদ্রাসার এমপিও (MPO) আবেদন ও অনুমোদন সংক্রান্ত তদারকি",
        "উপজেলা পর্যায়ের মেধা বৃত্তি ও উপবৃত্তি (Stipend) ব্যবস্থাপনা",
        "এসএসসি ও এইচএসসি পরীক্ষা কেন্দ্র নিয়ন্ত্রণ ও পরিদর্শন",
        "শিক্ষক ও কর্মচারীদের প্রশিক্ষণ ও পেশাগত দক্ষতা বৃদ্ধি"
      ],
      timing: "রবিবার থেকে বৃহস্পতিবার: সকাল ৯:০০ — বিকেল ৫:০০"
    },
    {
      id: "off-2",
      name: "উপজেলা প্রাথমিক শিক্ষা অফিস, পুঠিয়া",
      headName: "মোছাঃ পারভীন আক্তার",
      designation: "উপজেলা প্রাথমিক শিক্ষা অফিসার (UEO)",
      location: "উপজেলা পরিষদ ভবন (১ম তলা), পুঠিয়া, রাজশাহী",
      phone: "০২৪৭-৮৮৯১১৩",
      mobile: "০১৭২২-৩৩৪৪৫৫",
      email: "ueo.puthia@primary.gov.bd",
      services: [
        "সরকারি প্রাথমিক বিদ্যালয় ের সার্বিক প্রশাসনিক ব্যবস্থাপনা",
        "বিনামূল্যে পাঠ্যপুস্তক বিতরণ ও প্রাথমিক স্তরের বই উৎসব পরিচালনা",
        "কমিউনিটি পর্যায়ে প্রাথমিক শিশু ভর্তি বৃদ্ধি ও উপবৃত্তি সুবিধা বিতরণ",
        "সহকারী শিক্ষক ও প্রধান শিক্ষকদের ছুটি ও সার্ভিস রেকর্ড ব্যবস্থাপনা"
      ],
      timing: "রবিবার থেকে বৃহস্পতিবার: সকাল ৯:০০ — বিকেল ৫:০০"
    }
  ];

  return (
    <div className="font-sans space-y-6 pb-8">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f766e, #115e59)" }}
      >
        <button 
          onClick={onGoBack}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-teal-200 text-sm font-bold mb-1 uppercase tracking-wide">সরকারি সেবা ও প্রশাসন</p>
          <h1 className="text-3xl md:text-4xl font-black mb-3 text-white">🏛️ উপজেলা শিক্ষা অফিস</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-teal-300/60 pl-3 py-1">
            পুঠিয়া উপজেলা মাধ্যমিক শিক্ষা অফিস এবং উপজেলা প্রাথমিক শিক্ষা অফিসের কর্মকর্তা, যোগাযোগ ও প্রশাসনিক সেবা।
          </p>
        </div>
      </div>

      {/* Offices List */}
      <div className="space-y-5">
        {offices.map((off) => (
          <div key={off.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2.5 h-full bg-teal-600"></div>
            <div className="pl-2 space-y-4">
              <div>
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 mb-1">
                  সরকারি দপ্তর
                </span>
                <h3 className="font-bold text-gray-900 text-xl leading-snug">{off.name}</h3>
              </div>

              {/* Head Officer info */}
              <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                  👨‍💼
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 text-sm">{off.headName}</h4>
                  <p className="text-xs text-teal-700 font-bold">{off.designation}</p>
                </div>
              </div>

              {/* Details & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><b>কার্যালয় অবস্থান:</b> {off.location}</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><b>অফিস সময়সূচী:</b> {off.timing}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><b>ফোন/মোবাইল:</b> {off.phone}, {off.mobile}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><b>ইমেইল:</b> {off.email}</span>
                </p>
              </div>

              {/* Services List */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-800 mb-2">প্রধান সেবা:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  {off.services.map((ser, i) => (
                    <li key={i} className="flex items-start gap-1.5 bg-gray-50 p-2 rounded-xl">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{ser}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
