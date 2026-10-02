import React from 'react';
import { toolDescriptions } from '../data/toolDescriptions';

export function ToolExtraInfo({ toolId }: { toolId: string }) {
  const info = toolDescriptions[toolId];
  if (!info) return null;
  return (
    <div className="bg-slate-50 p-6 rounded-2xl mt-6 space-y-4 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 text-lg border-b border-slate-200 pb-2 mb-2">সহায়ক তথ্য:</h3>
        <p className="text-base text-slate-700 leading-relaxed"><strong className="text-slate-900">কী কাজে লাগে:</strong> {info.what}</p>
        <p className="text-base text-slate-700 leading-relaxed"><strong className="text-slate-900">কীভাবে ব্যবহার করবেন:</strong> {info.how}</p>
        <p className="text-base text-slate-700 leading-relaxed"><strong className="text-slate-900">উদাহরণ:</strong> {info.example}</p>
    </div>
  );
}
