import React from 'react';
import { ArrowLeft, Trash2, MapPin, Calendar, HeartOff } from 'lucide-react';
import { useFavorites } from './FavoriteContext';

export const MySavedView = ({ 
  onGoBack, 
  onSelectNews, 
  onSelectService 
}: { 
  onGoBack: () => void;
  onSelectNews?: (item: any) => void;
  onSelectService?: (viewId: string) => void;
}) => {
  const { savedItems, toggleSave } = useFavorites();

  const newsItems = savedItems.filter(i => i.type === 'news');
  const serviceItems = savedItems.filter(i => i.type === 'service');
  const discussionItems = savedItems.filter(i => i.type === 'discussion');

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden mb-6" style={{ background: "linear-gradient(135deg, #e53e3e, #c53030)" }}>
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6 relative z-10 text-center md:text-left">
          <p className="text-red-100 text-sm font-medium mb-2 uppercase tracking-wide">My Saved Items</p>
          <h1 className="text-3xl md:text-4xl font-black mb-1 text-white">আমার সংরক্ষিত তথ্য</h1>
          <div className="w-10 h-1 bg-white rounded-full my-3 mx-auto md:mx-0"></div>
          <p className="text-red-50 text-sm md:text-base max-w-lg leading-relaxed mx-auto md:mx-0">
            আপনার সেভ করা সব প্রয়োজনীয় সংবাদ, সেবা ও নাগরিক আলোচনা এক জায়গায়।
          </p>
        </div>
      </div>

      {savedItems.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center shadow-sm">
          <HeartOff className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">কোনো তথ্য সংরক্ষিত নেই</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            আপনি কোনো সংবাদ, সেবা বা আলোচনা এখনো সেভ করেননি। সেভ আইকনে ক্লিক করে প্রয়োজনীয় তথ্য সেভ করতে পারেন।
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Discussions Section */}
          {discussionItems.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💬</span> সংরক্ষিত আলোচনা ও পোল
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {discussionItems.map(item => (
                  <div key={item.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-black">
                          নাগরিক ফোরাম
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(item);
                          }}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-bold text-base text-gray-800 leading-tight mb-2">{item.title}</h3>
                      {item.subtitle && (
                        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-4">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {item.subtitle}
                        </p>
                      )}
                    </div>
                    <a 
                      href="/adda"
                      className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition block text-center w-full decoration-none"
                    >
                      আলোচনা পাতায় দেখুন
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Services Section */}
          {serviceItems.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏥</span> সংরক্ষিত সেবা
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceItems.map(item => (
                  <div key={item.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition group">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-800 leading-tight">{item.title}</h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(item);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.subtitle && (
                      <p className="text-sm text-gray-600 flex items-start gap-1.5 mb-4">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" /> {item.subtitle}
                      </p>
                    )}
                    <button 
                      onClick={() => item.linkId && onSelectService?.(item.linkId)}
                      className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition block text-center w-full"
                    >
                      সেবাটি দেখুন
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* News Section */}
          {newsItems.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📰</span> সংরক্ষিত সংবাদ
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {newsItems.map(item => (
                  <div 
                    key={item.id} 
                    className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col sm:flex-row gap-4 cursor-pointer"
                    onClick={() => item.newsItem && onSelectNews?.(item.newsItem)}
                  >
                    {item.image && (
                      <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-base text-gray-800 leading-snug group-hover:text-red-600 transition">{item.title}</h3>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSave(item);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition shrink-0"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {item.subtitle && (
                          <p className="text-xs font-bold text-gray-500 flex items-center gap-1 mt-2">
                            <Calendar className="w-3.5 h-3.5" /> {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
