import React, { useState } from 'react';

export function ToolFeedback({ contentId }: { contentId: string }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  if (feedback) {
    return (
      <div className="text-sm text-slate-500 font-bold mt-1 text-center">
        ধন্যবাদ আপনার মতামতের জন্য!
      </div>
    );
  }

  return (
    <div className="mt-4 bg-slate-50 p-4 rounded-xl text-center border border-slate-100 shadow-sm">
      <p className="text-base font-bold text-slate-700 mb-2">⭐ এই টুলটি কি আপনার কাজে লেগেছে?</p>
      <div className="flex justify-center gap-6">
        <button onClick={() => setFeedback('yes')} className="text-base font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">👍 হ্যাঁ</button>
        <button onClick={() => setFeedback('no')} className="text-base font-bold text-red-600 hover:text-red-700 flex items-center gap-1">👎 না</button>
      </div>
    </div>
  );
}
