import React, { useState } from 'react';

const deshiBusCard = `
    <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 12px; text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="background: #fee2e2; padding: 10px; border-radius: 50%; font-size: 20px;">🚌</div>
            <div>
                <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">দেশ ট্রাভেলস (Desh Travels)</h4>
                <span style="color: #dc2626; font-size: 12px; font-weight: 600;">ঢাকা রুটের প্রিমিয়াম বাস (Top Priority)</span>
            </div>
        </div>
        <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            <div>📍 <b>কাউন্টার অবস্থান:</b> পুঠিয়া বাজার মোড় (মহাসড়ক সংলগ্ন), পুঠিয়া।</div>
            <div>⏰ <b>প্রথম ও শেষ ট্রিপ:</b> সকাল ০৬:৩০ (প্রথম বাস) — রাত ১১:১৫ (শেষ বাস)</div>
            <div>🚌 <b>বাসের ধরন:</b> লাক্সারি স্ক্যানিয়া এসি (AC) এবং প্রিমিয়াম নন-এসি বাস। পুঠিয়া থেকে সরাসরি ঢাকা (কল্যাণপুর/গাবতলী)।</div>
        </div>
        <a href="tel:+8801700000000" style="background: #dc2626; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 টিকিট বুকিং করুন</a>
    </div>
`;

const nationalBusCard = `
    <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 12px; text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="background: #e0f2fe; padding: 10px; border-radius: 50%; font-size: 20px;">🏢</div>
            <div>
                <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">ন্যাশনাল ট্রাভেলস (National Travels)</h4>
                <span style="color: #0284c7; font-size: 12px; font-weight: 600;">দূরপাল্লার জনপ্রিয় নন-এসি সার্ভিস</span>
            </div>
        </div>
        <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            <div>📍 <b>কাউন্টার অবস্থান:</b> বানেশ্বর ট্রাফিক মোড়, পুঠিয়া।</div>
            <div>⏰ <b>ট্রিপ ডিটেইলস:</b> প্রতি ৩০ মিনিট পর পর ঢাকা ও রাজশাহীর উদ্দেশ্যে গাড়ি ছেড়ে যায়।</div>
            <div>🚌 <b>বাসের ধরন:</b> উন্নত মানের নন-এসি চেয়ার কোচ। দক্ষ চালক এবং চমৎকার যাত্রী সেবা।</div>
        </div>
        <a href="tel:+8801711223344" style="background: #1e293b; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 টিকিট বুকিং করুন</a>
    </div>
`;

const puthiaSpecialCard = `
    <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 12px; text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="background: #fef9c3; padding: 10px; border-radius: 50%; font-size: 20px;">⚡</div>
            <div>
                <h4 style="margin: 0; font-size: 16px; color: #ca8a04; font-weight: 800;">পুঠিয়া স্পেশাল গেটলক (Puthia Special)</h4>
                <span style="color: #1e293b; font-size: 12px; font-weight: 600;">রাজশাহী-নাটোর রুটের দ্রুততম গেটলক সার্ভিস</span>
            </div>
        </div>
        <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            <div>📍 <b>কাউন্টার অবস্থান:</b> পুঠিয়া মেইন বাসস্ট্যান্ড (মহাসড়ক সংলগ্ন)।</div>
            <div>⏰ <b>সময়সূচী:</b> সকাল ০৬:০০ থেকে রাত ০৮:৩০ (প্রতি ১৫ মিনিট পর পর)।</div>
            <div>🚌 <b>রুট ও ভাড়া:</b> রাজশাহী (ভদ্রা) ⇄ পুঠিয়া (ভাড়া ৫০ টাকা) ⇄ নাটোর (ভাড়া ৩৫ টাকা)।</div>
        </div>
        <a href="tel:+8801712345678" style="background: #ca8a04; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 টিকিট বুকিং করুন</a>
    </div>
`;

const uttaraExpressCard = `
    <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 12px; text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="background: #dcfce7; padding: 10px; border-radius: 50%; font-size: 20px;">🟢</div>
            <div>
                <h4 style="margin: 0; font-size: 16px; color: #16a34a; font-weight: 800;">উত্তরা এক্সপ্রেস লোকাল (Uttara Express)</h4>
                <span style="color: #1e293b; font-size: 12px; font-weight: 600;">জনপ্রিয় ও সাশ্রয়ী লোকাল বাস সার্ভিস</span>
            </div>
        </div>
        <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            <div>📍 <b>কাউন্টার অবস্থান:</b> বানেশ্বর বাজার ট্রাফিক মোড় কাউন্টার।</div>
            <div>⏰ <b>সময়সূচী:</b> সকাল ০৭:০০ থেকে সন্ধ্যা ০৭:৪৫ (প্রতি ৩০ মিনিট পর পর)।</div>
            <div>🚌 <b>রুট ও ভাড়া:</b> রাজশাহী শিরোইল ⇄ পুঠিয়া (ভাড়া ৪০ টাকা) ⇄ নাটোর ⇄ ঈশ্বরদী (ভাড়া ৯০ টাকা)।</div>
        </div>
        <a href="tel:+8801713987654" style="background: #16a34a; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 টিকিট বুকিং করুন</a>
    </div>
`;

const madhuriGateLockCard = `
    <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 12px; text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="background: #f0fdf4; padding: 10px; border-radius: 50%; font-size: 20px;">🌸</div>
            <div>
                <h4 style="margin: 0; font-size: 16px; color: #059669; font-weight: 800;">মাধুরী গেটলক সার্ভিস (Madhuri Gate-Lock)</h4>
                <span style="color: #1e293b; font-size: 12px; font-weight: 600;">তালাইমারী ও বিশ্ববিদ্যালয়গামী নিয়মিত সার্ভিস</span>
            </div>
        </div>
        <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            <div>📍 <b>কাউন্টার অবস্থান:</b> পুঠিয়া রাজবাড়ী মোড় সংলগ্ন মহাসড়ক।</div>
            <div>⏰ <b>সময়সূচী:</b> সকাল ০৬:৩০ থেকে রাত ০৯:০০ (প্রতি ২০ মিনিট পর পর)।</div>
            <div>🚌 <b>রুট ও ভাড়া:</b> রাজশাহী (তালাইমারী) ⇄ বেলপুকুর ⇄ পুঠিয়া (ভাড়া ৪০ টাকা) ⇄ নাটোর বাইপাস (ভাড়া ৩০ টাকা)।</div>
        </div>
        <a href="tel:+8801714556677" style="background: #059669; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 টিকিট বুকিং করুন</a>
    </div>
`;

const busData: Record<string, string> = {
    "all": deshiBusCard + nationalBusCard + puthiaSpecialCard + uttaraExpressCard + madhuriGateLockCard,
    "dhaka": deshiBusCard + nationalBusCard,
    "local": puthiaSpecialCard + uttaraExpressCard + madhuriGateLockCard,
    "fare": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 800;">💰 পুঠিয়া থেকে বিভিন্ন রুটের আনুমানিক ভাড়া</h4>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                    <span>ঢাকা (নন-এসি):</span> <b>৳৭০০ - ৳৮০০</b>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                    <span>ঢাকা (এসি - স্ক্যানিয়া):</span> <b>৳১৩०० - ৳১৫০০</b>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                    <span>রাজশাহী (গেটলক):</span> <b>৳৫০</b>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                    <span>নাটোর (গেটলক):</span> <b>৳৩৫</b>
                </div>
                <div style="display: flex; justify-content: space-between; padding-bottom: 4px;">
                    <span>রাজশাহী/নাটোর (লোকাল):</span> <b>৳৩০ - ৳৪০</b>
                </div>
            </div>
        </div>
    `
};

export const BusCounterInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const [activeTab, setActiveTab] = useState("all");

  const getRenderContent = () => {
    return busData[activeTab] || '<p style="text-align:center; color:#64748b; padding:20px;">কোনো তথ্য পাওয়া যায়নি।</p>';
  };

  return (
    <div className="font-sans space-y-6 pb-6 text-center animate-fade-in" style={{ padding: "0" }}>
      <div id="bus-banner" style={{ background: "linear-gradient(135deg, #e11d48, #ea580c)", padding: "24px 20px", borderRadius: "24px", color: "white" }}>
          <div style={{ display: "block", marginBottom: "16px", textAlign: "left" }}>
              {onGoBack && (
                  <button onClick={onGoBack} style={{ background: "rgba(255, 255, 255, 0.2)", border: "none", padding: "6px 14px", borderRadius: "20px", color: "white", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                      ← ফিরে যান
                  </button>
              )}
          </div>
          <span style={{ fontSize: "13px", opacity: 0.9, display: "block", marginBottom: "4px", textAlign: "left" }}>সহজ ও নিরাপদ যাতায়াত</span>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "26px", fontWeight: 800, textAlign: "left" }}>বাস কাউন্টার তালিকা</h2>
          <div style={{ width: "40px", height: "4px", background: "white", borderRadius: "2px", marginBottom: "14px" }}></div>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9, lineHeight: 1.5, textAlign: "justify" }}>পুঠিয়া এবং বানেশ্বর মোড়ে অবস্থিত বিভিন্ন আন্তঃজেলা দূরপাল্লার বাস কাউন্টারগুলোর সময়সূচী, টিকিটের মূল্য এবং বুকিং নম্বর।</p>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1">
        {[
          { id: 'all', label: 'সব কাউন্টার', emoji: '🚌' },
          { id: 'dhaka', label: 'ঢাকা রুট', emoji: '🏢' },
          { id: 'local', label: 'লোকাল রুট', emoji: '📍' },
          { id: 'fare', label: 'ভাড়া ও সময়', emoji: '💰' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive
                  ? "bg-[#eab308] text-white border-[#eab308] shadow-md"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="font-extrabold text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div id="bus-list-container" style={{ display: "flex", flexDirection: "column", gap: "16px" }} dangerouslySetInnerHTML={{ __html: getRenderContent() }} />
    </div>
  );
};
