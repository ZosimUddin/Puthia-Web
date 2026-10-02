import React, { useState } from 'react';

const parlorData: Record<string, string> = {
    "ladies": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="background: #fce7f3; padding: 10px; border-radius: 50%; font-size: 20px;">💅</div>
                <div>
                    <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">রূপসী লেডিজ পার্লার</h4>
                    <span style="color: #db2777; font-size: 12px; font-weight: 600;">ব্রাইডাল ও মেকআপ স্পেশালিস্ট</span>
                </div>
            </div>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                <div>📍 <b>অবস্থান:</b> পুঠিয়া রাজবাড়ি রোড, পুঠিয়া।</div>
                <div>✨ <b>সেবা:</b> ব্রাইডাল মেকআপ, হেয়ার স্টাইলিং, ফেসিয়াল, স্পা।</div>
            </div>
            <a href="tel:+8801700000000" style="background: #db2777; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 সিরিয়ালের জন্য কল করুন</a>
        </div>
    `,
    "gents": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="background: #e0f2fe; padding: 10px; border-radius: 50%; font-size: 20px;">💈</div>
                <div>
                    <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">স্টাইল জোন জেন্টস পার্লার</h4>
                    <span style="color: #0284c7; font-size: 12px; font-weight: 600;">মেনজ গ্রুমিং ও হেয়ারকাট</span>
                </div>
            </div>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                <div>📍 <b>অবস্থান:</b> মেইন রোড, বানেশ্বর বাজার।</div>
                <div>✨ <b>সেবা:</b> মডার্ন হেয়ারকাট, বিয়ার্ড স্টাইলিং, মেনজ ফেসিয়াল।</div>
            </div>
            <a href="tel:+8801700000000" style="background: #e2e8f0; color: #1e293b; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 10px; border-radius: 12px; font-size: 13px; font-weight: bold;">📞 যোগাযোগ করুন</a>
        </div>
    `
};

export const LocalParlorInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const [activeTab, setActiveTab] = useState("ladies");

  const getRenderContent = () => {
    if (activeTab === 'all') {
      return parlorData.ladies + parlorData.gents;
    } else {
      return parlorData[activeTab] || '<p style="text-align:center; color:#64748b; padding:20px;">কোনো তথ্য পাওয়া যায়নি।</p>';
    }
  };

  return (
    <div className="font-sans space-y-6 pb-6 text-center animate-fade-in" style={{ padding: "0" }}>
      <div id="parlor-banner" style={{ background: "linear-gradient(135deg, #be185d, #ec4899)", padding: "24px 20px", borderRadius: "24px", color: "white" }}>
          <div style={{ display: "block", marginBottom: "16px", textAlign: "left" }}>
              {onGoBack && (
                  <button onClick={onGoBack} style={{ background: "rgba(255, 255, 255, 0.2)", border: "none", padding: "6px 14px", borderRadius: "20px", color: "white", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                      ← ফিরে যান
                  </button>
              )}
          </div>
          <span style={{ fontSize: "13px", opacity: 0.8, display: "block", marginBottom: "4px", textAlign: "left" }}>বিউটি ও গ্রুমিং</span>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "26px", fontWeight: 800, textAlign: "left" }}>লোকাল পার্লার</h2>
          <div style={{ width: "40px", height: "4px", background: "white", borderRadius: "2px", marginBottom: "14px" }}></div>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9, lineHeight: 1.5, textAlign: "justify" }}>পুঠিয়া উপজেলা ও আশপাশের এলাকার সেরা লেডিজ ও জেন্টস পার্লারের সেবা এবং বুকিং তথ্য।</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginTop: "20px", marginBottom: "20px" }}>
          
          <div onClick={() => setActiveTab('ladies')} className="parlor-tab-btn" style={{ background: activeTab === 'ladies' ? "#ec4899" : "#ffffff", color: activeTab === 'ladies' ? "white" : "#1e293b", padding: "16px", borderRadius: "16px", textAlign: "center", cursor: "pointer", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", transition: "0.2s" }}>
              <span style={{ fontSize: "22px", display: "block", marginBottom: "4px" }}>💅</span>
              <b style={{ fontSize: "13px", display: "block" }}>লেডিজ পার্লার</b>
          </div>
          
          <div onClick={() => setActiveTab('gents')} className="parlor-tab-btn" style={{ background: activeTab === 'gents' ? "#ec4899" : "#ffffff", color: activeTab === 'gents' ? "white" : "#1e293b", padding: "16px", borderRadius: "16px", textAlign: "center", cursor: "pointer", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", transition: "0.2s" }}>
              <span style={{ fontSize: "22px", display: "block", marginBottom: "4px" }}>💈</span>
              <b style={{ fontSize: "13px", display: "block" }}>জেন্টস পার্লার</b>
          </div>

      </div>

      <div id="parlor-list-container" style={{ display: "flex", flexDirection: "column", gap: "16px" }} dangerouslySetInnerHTML={{ __html: getRenderContent() }} />
    </div>
  );
};
