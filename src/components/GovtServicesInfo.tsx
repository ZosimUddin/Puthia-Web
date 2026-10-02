import React from "react";
import { ArrowLeft, FileText, User, Users, Map, CreditCard, BookOpen, FileCheck, Globe } from "lucide-react";

export function GovtServicesInfo({ onGoBack, setSelectedSubView }: { onGoBack: () => void, setSelectedSubView: (id: string | null) => void }) {
  const services = [
    { id: "ds_birth_reg", title: "জন্ম নিবন্ধন", subtitle: "নতুন আবেদন ও সংশোধন", icon: FileText, color: "text-blue-500" },
    { id: "ds_death_reg", title: "মৃত্যু নিবন্ধন", subtitle: "মৃত্যু তথ্য নিবন্ধন", icon: User, color: "text-red-500" },
    { id: "ds_nid_services", title: "জাতীয় পরিচয়পত্র", subtitle: "এনআইডি ডাউনলোড ও তথ্য পরিবর্তন", icon: Users, color: "text-green-500" },
    { id: "ds_passport", title: "পাসপোর্ট", subtitle: "ই-পাসপোর্ট আবেদন ও স্ট্যাটাস চেক", icon: CreditCard, color: "text-purple-500" },
    { id: "ds_land_services", title: "ভূমি সেবা", subtitle: "খতিয়ান, পর্চা ও ই-নামজারি", icon: Map, color: "text-orange-500" },
    { id: "ds_e_mutation", title: "ই-নামজারি", subtitle: "অনলাইনে নামজারি আবেদন", icon: FileCheck, color: "text-yellow-600" },
    { id: "ds_online_application", title: "অনলাইন আবেদন", subtitle: "সরকারি সেবার অনলাইন আবেদন", icon: Globe, color: "text-indigo-500" },
  ];

  return (
    <div className="font-sans space-y-6 pb-6 p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setSelectedSubView(null)} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-black text-gray-900">সরকারি সেবা</h1>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedSubView(service.id)}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
          >
            <div className={`p-3 rounded-xl bg-gray-50 ${service.color}`}>
              <service.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{service.title}</h3>
              <p className="text-sm text-gray-500">{service.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
