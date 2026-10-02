import React, { useState } from 'react';
import { MedicalTestItem } from './types';
import { initialTestList } from './data';
import { ArrowLeft, Search, ShoppingBag, Check, Plus, Trash2 } from 'lucide-react';

interface TestsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking?: (selectedTests: MedicalTestItem[]) => void;
}

export const TestsListModal: React.FC<TestsListModalProps> = ({
  isOpen,
  onClose,
  onProceedToBooking
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTests, setSelectedTests] = useState<MedicalTestItem[]>([]);

  if (!isOpen) return null;

  const categories = [
    { id: 'popular', label: 'জনপ্রিয় পরীক্ষা' },
    { id: 'blood', label: 'রক্ত পরীক্ষা' },
    { id: 'urine', label: 'প্রস্রাব পরীক্ষা' },
    { id: 'hormone', label: 'হরমোন পরীক্ষা' },
    { id: 'serology', label: 'সেরোলজি' },
    { id: 'imaging', label: 'ইমেজিং' },
    { id: 'heart', label: 'হার্ট পরীক্ষা' },
    { id: 'other', label: 'অন্যান্য' }
  ];

  const filteredTests = initialTestList.filter(t => {
    const matchesCategory = activeCategory === 'popular' ? true : t.category === activeCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.bengaliName.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const toggleSelectTest = (test: MedicalTestItem) => {
    if (selectedTests.some(t => t.id === test.id)) {
      setSelectedTests(selectedTests.filter(t => t.id !== test.id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const totalPrice = selectedTests.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Top Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-sm font-bold text-slate-800">পরীক্ষা সমূহ (Medical Tests)</h2>
          <div className="w-9" />
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="পরীক্ষার নাম খুঁজুন (যেমন: CBC, ECG)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>
        </div>

        {/* Two-Column Body Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Category Sidebar */}
          <div className="w-32 sm:w-36 bg-slate-50 border-r border-slate-100 overflow-y-auto shrink-0 py-2">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-3 py-3 text-xs font-bold transition flex items-center justify-between border-l-4 ${
                    isSelected
                      ? 'bg-white text-[#006a4e] border-[#006a4e] shadow-2xs'
                      : 'text-slate-600 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <span className="line-clamp-2">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Test Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => {
                const isSelected = selectedTests.some(t => t.id === test.id);
                return (
                  <div
                    key={test.id}
                    onClick={() => toggleSelectTest(test)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-50/60 border-[#006a4e]'
                        : 'bg-white border-slate-100 hover:border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">{test.name}</h4>
                      <p className="text-[11px] font-medium text-slate-500">{test.bengaliName}</p>
                      {test.reportDeliveryTime && (
                        <p className="text-[10px] text-slate-400">রিপোর্ট: {test.reportDeliveryTime}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#006a4e] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        ৳ {test.price}
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                        isSelected ? 'bg-[#006a4e] text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isSelected ? <Check size={14} /> : <Plus size={14} />}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                কোনো পরীক্ষা পাওয়া যায়নি
              </div>
            )}
          </div>

        </div>

        {/* Footer Bar */}
        <div className="p-3 border-t border-slate-100 bg-white shadow-lg">
          <button
            onClick={() => {
              if (onProceedToBooking) {
                onProceedToBooking(selectedTests);
              }
              onClose();
            }}
            className="w-full bg-[#006a4e] hover:bg-[#00523d] text-white font-bold py-3.5 rounded-xl shadow-sm text-xs sm:text-sm transition flex items-center justify-between px-4"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} />
              <span>টেস্ট বুক করুন ({selectedTests.length}টি নির্বাচিত)</span>
            </div>
            {totalPrice > 0 && (
              <span className="bg-white/20 px-2.5 py-1 rounded-lg text-xs font-extrabold">
                মোট: ৳ {totalPrice}
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
