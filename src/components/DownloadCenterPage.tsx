import React from "react";
import { ArrowLeft, FileText, FileSignature, ScrollText, Tractor, BookOpen } from "lucide-react";

export function DownloadCenterPage({ onGoBack, setSelectedSubView }: { onGoBack: () => void, setSelectedSubView: (id: string | null) => void }) {
  const items = [
    { id: "application_form", title: "আবেদন ফরম", subtitle: "সরকারি আবেদন ফরম", icon: FileText, color: "text-emerald-600" },
    { id: "important_pdf", title: "গুরুত্বপূর্ণ PDF", subtitle: "জরুরি নির্দেশিকা ও তথ্যপত্র", icon: FileSignature, color: "text-blue-600" },
    { id: "certificate_sample", title: "নাগরিক সনদ নমুনা", subtitle: "সনদপত্রের ফরম্যাট সংগ্রহ করুন", icon: ScrollText, color: "text-purple-600" },
    { id: "agriculture_guide", title: "কৃষি গাইড", subtitle: "কৃষি বিষয়ক সহায়িকা", icon: Tractor, color: "text-amber-600" },
    { id: "education_material", title: "শিক্ষা উপকরণ", subtitle: "শিক্ষামূলক রিসোর্স", icon: BookOpen, color: "text-sky-600" },
  ];

  return (
    <div className="font-sans space-y-6 pb-6 p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setSelectedSubView(null)} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-black text-gray-900">ডাউনলোড সেন্টার</h1>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedSubView(item.id)}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
          >
            <div className={`p-3 rounded-xl bg-gray-50 ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
