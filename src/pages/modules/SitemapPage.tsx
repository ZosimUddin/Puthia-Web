import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, FileCode, Check, Copy, ExternalLink, Search } from 'lucide-react';
import Header from '../../components/home/Header';
import BottomNav from '../../components/home/BottomNavigation';
import Footer from '../../components/home/Footer';
import SEO from '../../components/SEO';
import { getAllSiteRoutes, generateXmlSitemapString } from '../../utils/seoHelpers';

export const SitemapPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'visual' | 'xml'>('visual');
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  const { staticRoutes, serviceRoutes, totalRoutes } = getAllSiteRoutes();
  const xmlString = generateXmlSitemapString();

  const handleCopyXml = () => {
    navigator.clipboard.writeText(xmlString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredServiceRoutes = serviceRoutes.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <SEO
        title="সাইটম্যাপ ও সকল পেজ সূচি"
        description="আমাদের পুঠিয়া পোর্টালের ৬০টি ডিরেক্টরি সেবা ও সকল পেজের পূর্ণাঙ্গ এসইও সাইটম্যাপ।"
        path="/sitemap"
      />

      <Header />

      <main className="flex-1 pb-24">
        {/* Banner Section */}
        <div className="bg-[#006a4e] text-white pt-6 pb-12 px-4 sm:px-6 relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
                <Globe size={14} className="text-emerald-300" />
                <span>সর্বমোট {totalRoutes} টি পেজ ও সার্ভিস ইনডেক্স</span>
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                🗺️ সম্পূর্ণ সাইটম্যাপ ও এসইও ইনডেক্স
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                পুঠিয়া পোর্টালের ৬০টি ডিরেক্টরি পেজ, গুগল ক্রলার ও সার্চ ইঞ্জিনের জন্য ডাইনামিক সাইটম্যাপ
              </p>
            </div>

            {/* Tab selector */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`py-2 px-4 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'visual'
                    ? 'bg-white text-[#006a4e] shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Globe size={14} />
                <span>ভিজ্যুয়াল সাইটম্যাপ</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('xml')}
                className={`py-2 px-4 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'xml'
                    ? 'bg-white text-[#006a4e] shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <FileCode size={14} />
                <span>XML Sitemap (Google Search Console)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
          {activeTab === 'visual' ? (
            <div className="space-y-6">
              {/* Static Main Pages */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#006a4e]" />
                  <span>মূল পেজসমূহ (Static Core Routes)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {staticRoutes.map((r) => (
                    <button
                      key={r.path}
                      onClick={() => navigate(r.path)}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-black text-slate-800 group-hover:text-[#006a4e]">
                          {r.title}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">{r.path}</span>
                      </div>
                      <ExternalLink size={13} className="text-slate-300 group-hover:text-[#006a4e] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 60 Directory Services */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>৬০টি ডিরেক্টরি সার্ভিস পেজ (Dynamic Service Routes)</span>
                  </h2>

                  <div className="relative w-full sm:w-60">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="সার্ভিস খুঁজুন..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {filteredServiceRoutes.map((r) => (
                    <button
                      key={r.path}
                      onClick={() => navigate(r.path)}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{r.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 group-hover:text-[#006a4e] truncate">
                            {r.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono truncate block">
                            {r.path}
                          </span>
                        </div>
                      </div>
                      <ExternalLink size={13} className="text-slate-300 group-hover:text-[#006a4e] shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* XML Output */
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    📄 sitemap.xml কোড
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    গুগল সার্চ কনসোল (Google Search Console) বা বিং-এ সাবমিটের জন্য ব্যবহার করুন
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyXml}
                  className="py-2 px-3.5 bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black rounded-xl flex items-center gap-1.5 border-none cursor-pointer active:scale-95 transition-all shadow-sm"
                >
                  {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  <span>{copied ? 'কপি হয়েছে!' : 'XML কপি করুন'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                  {xmlString}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav activeTab="home" onTabChange={() => navigate('/')} />
    </div>
  );
};

export default SitemapPage;
