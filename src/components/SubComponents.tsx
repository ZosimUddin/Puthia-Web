import React, { useState, useEffect } from "react";

export const AnimatedCounter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <p className="text-5xl font-black">{count.toLocaleString('bn-BD')}</p>;
};

export const RenderAgricultureFishery = ({ agriWeatherOffset }) => {
    let currentTemp = (32.3 + (agriWeatherOffset % 5) * 0.4).toFixed(1);
    let currentHumidity = 65 + (agriWeatherOffset % 3) * 5;
    let currentWind = 12 + (agriWeatherOffset % 4) * 2;
    let currentRain = (agriWeatherOffset % 2) === 0 ? "১৫%" : "৪৫%";

    let cropsList = [
        {
            id: "mango",
            name: "আম (উত্তরবঙ্গের প্রধান সুমিষ্ট শস্য)",
            soil: "দো-আঁশ ও উর্বর পলি মাটি",
            time: "বৈশাখ হতে আষাঢ় (আম সংগ্রহ ও বাজারজাতকরণ কাল)",
            varieties: "আম্রপালি, গোপালভোগ, ল্যাংড়া, ফজলীলী, খীরসাপাত (হিমসাগর)",
            pests: "হপার পোকার আক্রমণ প্রতিরোধে কার্বারিল গ্রুপের কীটনাশক প্রয়োগ করতে হবে মুকুল ফুল ও গুটি আসার সময়ে।",
            fertilizer: "গাছের বয়স ভেদে ইউরিয়া ও টিএসপি সার সুষম মাত্রায় দিতে হবে।"
        }
    ];

    return (
        <div>
           {/* Rendering cropsList logic */}
        </div>
    );
};

export const UtilityServicesView = ({ contacts, search, union, onSearchChange, onUnionChange, onSimulateCall, headerElement }) => {
    const filtered = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(search.toLowerCase()) ||
                              contact.role.toLowerCase().includes(search.toLowerCase()) ||
                              contact.details.toLowerCase().includes(search.toLowerCase()) ||
                              contact.serviceType.toLowerCase().includes(search.toLowerCase());
        const matchesUnion = union === "all" || contact.matchUnion === union;
        return matchesSearch && matchesUnion;
    });

    return (
        <div className="space-y-6">
            {headerElement}
            <div className="bg-white p-5 rounded-2xl border border-[#edeae0] space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-gray-150">
                    <div className="space-y-1">
                        <span className="text-sm font-serif font-black text-[#2d5a27]">⚡ ইউটিলিটি, পাওয়ার গ্রিড ও ব্লক অফিসার তালিকা</span>
                        <p className="text-sm text-gray-400 font-sans">মোট {filtered.length}জন দায়িত্বশীল স্টাফ প্রদর্শিত হচ্ছে</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <select value={union || ""} onChange={(e) => onUnionChange(e.target.value)} className="bg-neutral-50 px-3 py-1.5 border rounded-full outline-none text-sm font-sans cursor-pointer">
                            <option value="all">সব ইউনিয়ন ও পৌরসভা</option>
                            <option value="sadar">পুঠিয়া পৌরসভা</option>
                            <option value="baneshwar">বানেশ্বর ইউনিয়ন</option>
                            <option value="shilmaria">শিলমাড়ী ইউনিয়ন</option>
                            <option value="belpukur">বেলপুকুরিয়া ইউনিয়ন</option>
                            <option value="jeupara">জিউপাড়া ইউনিয়ন</option>
                            <option value="bhalukgachhi">ভালুকগাছী ইউনিয়ন</option>
                        </select>
                        <div className="relative w-full sm:w-64">
                            <input type="text" placeholder="অফিসারের নাম, কুশলতা বা জোন খুঁজুন..." value={search || ""} onChange={(e) => onSearchChange(e.target.value)} className="w-full bg-neutral-50 pl-3 pr-8 py-1.5 border rounded-full text-sm outline-none font-sans" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
