import React from 'react';

export const LanguageSettings: React.FC = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-emerald-950 mb-6">ভাষা পরিবর্তন</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p className="text-gray-700 font-medium">বর্তমানে বাংলা ভাষা সেট করা আছে।</p>
        <button className="mt-4 w-full bg-emerald-50 text-emerald-700 p-3 rounded-xl font-bold">
          ইংরেজি নির্বাচন করুন (শীঘ্রই আসছে)
        </button>
      </div>
    </div>
  );
};
