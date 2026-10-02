import React, { useState } from 'react';

const nurseryData: Record<string, string> = {
    "plants": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="background: #dcfce7; padding: 10px; border-radius: 50%; font-size: 20px;">🌱</div>
                <div>
                    <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">সবুজ নার্সারি</h4>
                    <span style="color: #15803d; font-size: 12px; font-weight: 600;">ফলজ ও বনজ চারা</span>
                </div>
            </div>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                <div>📍 <b>অবস্থান:</b> বানেশ্বর রোড, পুঠিয়া।</div>
                <div>✨ <b>চারা:</b> আম, কাঁঠাল, পেয়ারা, মেহগনি, নিম ও অন্যান্য।</div>
            </div>
            <a href="tel:+8801700000000" style="background: #15803d; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 যোগাযোগ করুন</a>
        </div>
    `,
    "flowers": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="background: #fef08a; padding: 10px; border-radius: 50%; font-size: 20px;">🌸</div>
                <div>
                    <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">ফুলকলি নার্সারি</h4>
                    <span style="color: #ca8a04; font-size: 12px; font-weight: 600;">দেশি-বিদেশি ফুল চারা</span>
                </div>
            </div>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                <div>📍 <b>অবস্থান:</b> পুঠিয়া রাজবাড়ি গেট সংলগ্ন।</div>
                <div>✨ <b>চারা:</b> গোলাপ, গাঁদা, অর্কিড, ইনডোর প্লান্টস।</div>
            </div>
            <a href="tel:+8801700000000" style="background: #ca8a04; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 10px; border-radius: 12px; font-size: 13px; font-weight: bold;">📞 যোগাযোগ করুন</a>
        </div>
    `
};

export const LocalNurseryInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const [activeTab, setActiveTab] = useState("plants");

  const getRenderContent = () => {
    if (activeTab === 'all') {
      return nurseryData.plants + nurseryData.flowers;
    } else {
      return nurseryData[activeTab] || '<p style="text-align:center; color:#64748b; padding:20px;">কোনো তথ্য পাওয়া যায়নি।</p>';
    }
  };

  return (
    <div className="font-sans space-y-6 pb-6 text-center animate-fade-in" style={{ padding: "0" }}>
      <div id="nursery-banner" style={{ background: "linear-gradient(135deg, #166534, #22c55e)", padding: "24px 20px", borderRadius: "24px", color: "white" }}>
          <div style={{ display: "block", marginBottom: "16px", textAlign: "left" }}>
              {onGoBack && (
                  <button onClick={onGoBack} style={{ background: "rgba(255, 255, 255, 0.2)", border: "none", padding: "6px 14px", borderRadius: "20px", color: "white", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                      ← ফিরে যান
                  </button>
              )}
          </div>
          <span style={{ fontSize: "13px", opacity: 0.8, display: "block", marginBottom: "4px", textAlign: "left" }}>বৃক্ষরোপণ ও বাগান</span>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "26px", fontWeight: 800, textAlign: "left" }}>লোকাল নার্সারি</h2>
          <div style={{ width: "40px", height: "4px", background: "white", borderRadius: "2px", marginBottom: "14px" }}></div>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9, lineHeight: 1.5, textAlign: "justify" }}>পুঠিয়া উপজেলা ও আশপাশের এলাকার সেরা নার্সারি থেকে ফলজ, বনজ এবং ফুলের চারা সম্পর্কিত তথ্য।</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginTop: "20px", marginBottom: "20px" }}>
          
          <div onClick={() => setActiveTab('plants')} className="nursery-tab-btn" style={{ background: activeTab === 'plants' ? "#166534" : "#ffffff", color: activeTab === 'plants' ? "white" : "#1e293b", padding: "16px", borderRadius: "16px", textAlign: "center", cursor: "pointer", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", transition: "0.2s" }}>
              <span style={{ fontSize: "22px", display: "block", marginBottom: "4px" }}>🌱</span>
              <b style={{ fontSize: "13px", display: "block" }}>ফলজ ও বনজ চারা</b>
          </div>
          
          <div onClick={() => setActiveTab('flowers')} className="nursery-tab-btn" style={{ background: activeTab === 'flowers' ? "#ca8a04" : "#ffffff", color: activeTab === 'flowers' ? "white" : "#1e293b", padding: "16px", borderRadius: "16px", textAlign: "center", cursor: "pointer", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", transition: "0.2s" }}>
              <span style={{ fontSize: "22px", display: "block", marginBottom: "4px" }}>🌸</span>
              <b style={{ fontSize: "13px", display: "block" }}>ফুল ও অন্যান্য</b>
          </div>

      </div>

      <div id="nursery-list-container" style={{ display: "flex", flexDirection: "column", gap: "16px" }} dangerouslySetInnerHTML={{ __html: getRenderContent() }} />
    </div>
  );
};
