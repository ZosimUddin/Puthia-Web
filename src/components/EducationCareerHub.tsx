import React, { useState } from 'react';
import { ArrowLeft, BookOpen, GraduationCap, FileText, ExternalLink, Library, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EducationCoachingHub } from './EducationCoachingHub';

export const EducationCareerHub = ({ onGoBack }: { onGoBack?: () => void }) => {
  const navigate = useNavigate();
  const [showCoaching, setShowCoaching] = useState(false);

  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate(-1);
    }
  };

  if (showCoaching) {
    return <EducationCoachingHub onGoBack={() => setShowCoaching(false)} />;
  }

  const admissionsAndResults = [
    { title: "রাজশাহী শিক্ষা বোর্ড", url: "https://rajshahieducationboard.gov.bd/" },
    { title: "জাতীয় বিশ্ববিদ্যালয়", url: "https://www.nu.ac.bd/" },
    { title: "ভর্তি বিষয়ক ওয়েবসাইট", url: "http://www.xclassadmission.gov.bd/" },
    { title: "ফলাফল পোর্টাল (Web Based)", url: "https://eboardresults.com/" },
  ];

  const libraryResources = [
    { title: "পুঠিয়ার ইতিহাস ও ঐতিহ্য", icon: History, link: "#" },
    { title: "ই-বুক সংগ্রহ", icon: Library, link: "#" },
    { title: "ফ্রি একাডেমিক কোর্স", icon: BookOpen, link: "#" },
  ];

  return (
    <div className="font-sans space-y-6 pb-6 text-left animate-fade-in">
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
      >
        <button 
          onClick={handleBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10 border-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <h1 className="text-3xl font-black mb-3 text-white">শিক্ষা ও ক্যারিয়ার হাব</h1>
          <p className="text-violet-100 text-sm">শিক্ষার্থী ও চাকরি প্রত্যাশীদের জন্য প্রয়োজনীয় সব তথ্য ও রিসোর্স</p>
        </div>
      </div>

      {/* Main Grid Actions */}
      <div className="px-4 grid grid-cols-1 gap-4">
        <button 
          onClick={() => setShowCoaching(true)}
          className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-gray-100 shadow-sm transition hover:shadow-md border-none cursor-pointer w-full"
        >
          <div className="bg-purple-100 text-purple-700 p-4 rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-bold text-gray-800">কোচিং ও টিউটর ডিরেক্টরি</span>
        </button>
      </div>

      {/* Admission & Results */}
      <div className="px-4">
        <h3 className="font-extrabold text-gray-800 text-sm mb-4">ভর্তি ও ফলাফল শর্টকাট</h3>
        <div className="grid grid-cols-2 gap-3">
          {admissionsAndResults.map((item, index) => (
            <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between hover:border-purple-200 transition">
              <span className="text-xs font-bold text-gray-700">{item.title}</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </a>
          ))}
        </div>
      </div>

      {/* Smart Library */}
      <div className="px-4 pb-6">
        <h3 className="font-extrabold text-gray-800 text-sm mb-4">স্মার্ট লাইব্রেরি</h3>
        <div className="grid grid-cols-1 gap-3">
          {libraryResources.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="bg-indigo-100 text-indigo-700 p-3 rounded-xl">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800 text-xs flex-1">{item.title}</span>
              <button className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full cursor-pointer border-none">দেখুন</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EducationCareerHub;
