import React, { useState } from 'react';
import { Code, Key, Lock, CheckCircle2, Copy, Shield, Terminal, Zap, BookOpen } from 'lucide-react';
import { PUBLIC_API_ENDPOINTS, mockApiKeys, validateApiKey, ApiKeyConfig } from '../../services/publicApiService';

export const ApiEcosystemView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeApiKey, setActiveApiKey] = useState<string>(mockApiKeys[0].apiKey);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredEndpoints = selectedCategory === 'All' 
    ? PUBLIC_API_ENDPOINTS 
    : PUBLIC_API_ENDPOINTS.filter(e => e.category === selectedCategory);

  const handleTestApi = (endpoint: typeof PUBLIC_API_ENDPOINTS[0]) => {
    setTestingEndpoint(endpoint.path);
    
    if (endpoint.requiresKey) {
      const authCheck = validateApiKey(activeApiKey);
      if (!authCheck.valid) {
        setTestResult({
          status: 401,
          error: "Unauthorized",
          message: authCheck.message
        });
        return;
      }
    }

    setTestResult({
      status: 200,
      timestamp: new Date().toISOString(),
      endpoint: endpoint.path,
      rateLimitRemaining: 59,
      data: endpoint.sampleResponse
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5">
            <Code size={14} className="text-teal-400" /> Public Data & API Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">আমাদের পুঠিয়া ওপেন ডাটা API ইকোসিস্টেম</h1>
          <p className="text-xs text-teal-100/90 font-medium max-w-xl">
            ডেভেলপার ও গবেষকদের জন্য সুরক্ষিত পাবলিক এপিআই। পুঠিয়ার হাসপাতাল, বাজার দর, শিক্ষা ও ভ্রমণ ডাটাবেজ এক্সেস করুন।
          </p>
        </div>

        <div className="p-4 bg-teal-500/10 border border-teal-400/20 rounded-2xl shrink-0">
          <span className="text-[10px] text-teal-300 font-black block uppercase">সক্রিয় পাবলিক এপিআই এন্ডইস্টার</span>
          <span className="text-2xl font-black text-white">{PUBLIC_API_ENDPOINTS.length} টি মোড্যুল</span>
        </div>
      </div>

      {/* Developer API Key Manager Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Key size={18} className="text-emerald-700" />
            ডেভেলপার API কী (API Key Access & Credentials)
          </h3>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-black border border-emerald-200">
            Rate Limit: 60 req/min
          </span>
        </div>

        <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">আপনার পাবলিক এক্সেস কী (X-API-KEY):</span>
            <span className="font-bold text-emerald-400 break-all">{activeApiKey}</span>
          </div>

          <button
            onClick={() => handleCopyKey(activeApiKey)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            <span>{copied ? "কপি করা হয়েছে" : "কী কপি করুন"}</span>
          </button>
        </div>
      </div>

      {/* API Endpoints Catalog */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Terminal size={18} className="text-emerald-700" />
            এপিআই ক্যাটালগ ও লাইভ টেস্ট প্লেগ্রাউন্ড
          </h3>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Services', 'Locations', 'Business', 'Emergency', 'Education', 'Tourism', 'News'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? "bg-[#006a4e] text-white" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Endpoints Table */}
        <div className="divide-y divide-slate-100">
          {filteredEndpoints.map((ep, idx) => (
            <div key={idx} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 p-3 rounded-2xl transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-black rounded">
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-black text-slate-900">{ep.path}</span>
                  {ep.requiresKey ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-black rounded flex items-center gap-1">
                      <Lock size={10} /> Key Required
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[9px] font-black rounded">
                      Open API
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-600">{ep.description}</p>
              </div>

              <button
                onClick={() => handleTestApi(ep)}
                className="px-4 py-2 bg-slate-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Zap size={14} className="text-emerald-400" />
                <span>টেস্ট করুন</span>
              </button>
            </div>
          ))}
        </div>

        {/* Live Test Response Box */}
        {testResult && (
          <div className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-xs space-y-2 border border-slate-800 animate-in fade-in">
            <div className="flex justify-between items-center text-slate-400 text-[10px] border-b border-slate-800 pb-2">
              <span>Endpoint: {testResult.endpoint}</span>
              <span>HTTP Status: {testResult.status} OK</span>
            </div>
            <pre className="overflow-x-auto text-[11px] leading-relaxed font-bold text-emerald-300 p-2">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
};
