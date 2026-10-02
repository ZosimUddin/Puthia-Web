import React from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ShieldAlert } from 'lucide-react';

const MaintenanceModeScreen: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">সিস্টেম রক্ষণাবেক্ষণ চলছে</h1>
        <p className="text-gray-500 font-bold mb-6">
          আমরা আরও উন্নত সেবা প্রদানের জন্য সিস্টেম আপডেট করছি। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।
        </p>
        {settings?.contactPhone && (
          <div className="text-sm font-bold text-gray-400">
            জরুরী প্রয়োজনে: <a href={`tel:${settings.contactPhone}`} className="text-emerald-600">{settings.contactPhone}</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceModeScreen;
