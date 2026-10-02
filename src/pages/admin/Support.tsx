import React from 'react';
import { Phone, Mail } from 'lucide-react';

export const Support: React.FC = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-emerald-950 mb-6">সাহায্য ও সাপোর্ট</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <p className="text-gray-700 font-medium">যেকোনো সমস্যায় আমাদের সাথে যোগাযোগ করুন:</p>
        <div className="flex items-center gap-3 text-emerald-700 font-bold">
          <Phone size={20} />
          <span>০১১৯৭ ৫৬৮ ৬০৪</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Mail size={20} />
          <span>support@amaderputhia.com</span>
        </div>
      </div>
    </div>
  );
};
