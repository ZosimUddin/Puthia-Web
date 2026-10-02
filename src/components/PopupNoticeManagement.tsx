import React, { useState } from 'react';
import { MessageSquare, Save } from 'lucide-react';

export default function PopupNoticeManagement() {
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('জরুরী নোটিশ');
  const [message, setMessage] = useState('আগামীকাল থেকে সকল সেবা পুনরায় চালু হবে।');

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-2">পপআপ নোটিশ (Popup Notice)</h3>
        <p className="text-gray-500 mb-6">অ্যাপ ওপেন করার সময় ব্যবহারকারীদেরকে পপআপ নোটিশ দেখানোর জন্য এটি ব্যবহার করুন</p>

        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <div>
              <h4 className="text-white font-bold">পপআপ নোটিশ স্ট্যাটাস</h4>
              <p className="text-sm text-gray-400">বর্তমান অবস্থা: {enabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</p>
            </div>
            <button 
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">নোটিশের শিরোনাম</label>
              <input 
                type="text" 
                value={title || ""}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">বিস্তারিত বার্তা</label>
              <textarea 
                rows={4}
                value={message || ""}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>
            <button className="bg-[#006A4E] hover:bg-[#005A42] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              <Save className="w-5 h-5" />
              <span>সেভ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
