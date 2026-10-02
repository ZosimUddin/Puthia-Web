import React, { useState } from 'react';
import { 
  ArrowLeft, TrendingUp, Percent, Receipt, Layers, Coins, LineChart, Plus, Trash2, FileText 
} from 'lucide-react';

// Helper to convert English digits to Bengali digits
export function toBn(n: number | string): string {
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/[0-9]/g, (w) => bnNums[+w]);
}

const formatBnCurrency = (val: number) => {
  return '৳ ' + toBn(val.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }));
};

// ============================================================================
// 1. Profit Margin Calculator (প্রফিট মার্জিন ক্যালকুলেটর)
// ============================================================================
export function ProfitMarginCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [mode, setMode] = useState<'margin' | 'pricing'>('margin');
  const [cost, setCost] = useState('120');
  const [revenue, setRevenue] = useState('180');
  const [targetMargin, setTargetMargin] = useState('35');

  const c = parseFloat(cost) || 0;
  const r = parseFloat(revenue) || 0;
  const tm = parseFloat(targetMargin) || 0;

  // Margin & Markup calculation
  const grossProfit = Math.max(0, r - c);
  const profitMargin = r > 0 ? (grossProfit / r) * 100 : 0;
  const markup = c > 0 ? (grossProfit / c) * 100 : 0;

  // Target Pricing calculation
  const calculatedSellingPrice = tm < 100 ? c / (1 - (tm / 100)) : 0;
  const calculatedProfit = Math.max(0, calculatedSellingPrice - c);
  const calculatedMarkup = c > 0 ? (calculatedProfit / c) * 100 : 0;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" /> প্রফিট মার্জিন ক্যালকুলেটর
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">ব্যবসা সহায়ক</span>
      </div>

      <div className="p-6">
        <div className="flex gap-4 border-b pb-4 mb-6">
          <button
            onClick={() => setMode('margin')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${mode === 'margin' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            মার্জিন ও মার্কআপ হিসাব
          </button>
          <button
            onClick={() => setMode('pricing')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${mode === 'pricing' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            আকাঙ্ক্ষিত বিক্রয়মূল্য নির্ধারণ
          </button>
        </div>

        {mode === 'margin' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">পণ্যের ক্রয়মূল্য / উৎপাদন খরচ (৳):</label>
                <input
                  type="number"
                  value={cost || ""}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none focus:border-emerald-500"
                  placeholder="যেমন: ১২০"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">পণ্যের বিক্রয়মূল্য / রাজস্ব (৳):</label>
                <input
                  type="number"
                  value={revenue || ""}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none focus:border-emerald-500"
                  placeholder="যেমন: ১৮০"
                />
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">💡 বুঝুন মার্জিন বনাম মার্কআপ:</span>
                <p className="text-slate-500 leading-relaxed">
                  <strong>প্রফিট মার্জিন:</strong> বিক্রয়মূল্যের কত শতাংশ লাভ হয়েছে তা নির্দেশ করে।
                </p>
                <p className="text-slate-500 leading-relaxed">
                  <strong>মার্কআপ:</strong> ক্রয়মূল্যের চেয়ে কত শতাংশ বেশি দামে বিক্রি করছেন তা নির্দেশ করে।
                </p>
              </div>
            </div>

            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                <div className="text-center pb-3 border-b border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">মোট মুনাফা (Profit)</span>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{formatBnCurrency(grossProfit)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 block">প্রফিট মার্জিন</span>
                    <span className="text-lg font-black text-slate-800 block mt-1">{toBn(profitMargin.toFixed(1))}%</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 block">মার্কআপ (Markup)</span>
                    <span className="text-lg font-black text-slate-800 block mt-1">{toBn(markup.toFixed(1))}%</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-xs font-bold leading-relaxed text-center ${profitMargin >= 30 ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : profitMargin >= 15 ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-amber-50 text-amber-800 border-amber-100'}`}>
                  {profitMargin >= 30 
                    ? 'চমৎকার মার্জিন! ব্যবসায়িক লাভজনকতা খুবই সন্তোষজনক। 🎉' 
                    : profitMargin >= 15 
                      ? 'মাঝারি মার্জিন। পরিচালন খরচ নিয়ন্ত্রণে রেখে লাভ বাড়াতে পারেন। 👍' 
                      : 'কম মার্জিন! উৎপাদন খরচ কমানোর পরামর্শ দেওয়া হচ্ছে। ⚠️'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">পণ্যের ক্রয়মূল্য / উৎপাদন খরচ (৳):</label>
                <input
                  type="number"
                  value={cost || ""}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none focus:border-emerald-500"
                  placeholder="যেমন: ১২ো"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">আকাঙ্ক্ষিত প্রফিট মার্জিন লক্ষ্য (%):</label>
                <input
                  type="number"
                  value={targetMargin || ""}
                  onChange={(e) => setTargetMargin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none focus:border-emerald-500"
                  placeholder="যেমন: ৩৫"
                  max="99"
                  min="1"
                />
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-xs font-semibold text-slate-500 leading-relaxed">
                💡 <strong>উদাহরণ:</strong> যদি আপনার খরচ ১২০ টাকা হয় এবং আপনি ৩৫% প্রফিট মার্জিন অর্জন করতে চান, তাহলে বিক্রয়মূল্য ১৮৪.৬২ টাকা নির্ধারণ করতে হবে।
              </div>
            </div>

            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                <div className="text-center pb-3 border-b border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">প্রয়োজনীয় বিক্রয়মূল্য</span>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{formatBnCurrency(calculatedSellingPrice)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 block">হিসাবকৃত লাভ</span>
                    <span className="text-base font-black text-slate-800 block mt-1">{formatBnCurrency(calculatedProfit)}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 block">প্রয়োজনীয় মার্কআপ</span>
                    <span className="text-base font-black text-slate-800 block mt-1">{toBn(calculatedMarkup.toFixed(1))}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. GST/VAT Calculator (ভ্যাট/জিএসটি ক্যালকুলেটর)
// ============================================================================
export function GSTVATCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [amount, setAmount] = useState('5000');
  const [rate, setRate] = useState('15');
  const [taxType, setTaxType] = useState<'exclusive' | 'inclusive'>('exclusive');

  const amt = parseFloat(amount) || 0;
  const r = parseFloat(rate) || 0;

  let baseAmount = 0;
  let vatAmount = 0;
  let totalAmount = 0;

  if (taxType === 'exclusive') {
    baseAmount = amt;
    vatAmount = amt * (r / 100);
    totalAmount = amt + vatAmount;
  } else {
    totalAmount = amt;
    baseAmount = amt / (1 + (r / 100));
    vatAmount = amt - baseAmount;
  }

  const vatPercentOfTotal = totalAmount > 0 ? (vatAmount / totalAmount) * 100 : 0;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Percent className="w-6 h-6" /> ভ্যাট ও জিএসটি (VAT & GST) ক্যালকুলেটর
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">কর ও ভ্যাট</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTaxType('exclusive')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${taxType === 'exclusive' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              ভ্যাট যুক্ত করুন (Exclusive)
            </button>
            <button
              onClick={() => setTaxType('inclusive')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${taxType === 'inclusive' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              ভ্যাট অন্তর্ভুক্ত (Inclusive)
            </button>
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">মোট মূল্য বা অর্থের পরিমাণ (৳):</label>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none focus:border-blue-500"
              placeholder="যেমন: ৫০০০"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-2">ভ্যাট বা জিএসটি এর হার (%):</label>
            <div className="grid grid-cols-5 gap-2">
              {['5', '7.5', '10', '15', '20'].map(val => (
                <button
                  key={val}
                  onClick={() => setRate(val)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-colors ${rate === val ? 'bg-blue-50 border-blue-400 text-blue-700 font-black' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {toBn(val)}%
                </button>
              ))}
            </div>
            
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">কাস্টম হার:</span>
              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 px-2 py-1 max-w-[120px]">
                <input
                  type="number"
                  value={rate || ""}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full bg-transparent border-none text-xs font-black text-slate-700 focus:outline-none"
                  min="0"
                  max="100"
                />
                <span className="text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
            <span className="text-xs font-black text-slate-700 block text-center mb-1">📊 ভ্যাট হিসাবের ফলাফল</span>

            <div className="space-y-2 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between shadow-sm">
                <span className="text-slate-500 font-semibold">প্রকৃত মূল্য (Base Value):</span>
                <span className="font-bold text-slate-800">{formatBnCurrency(baseAmount)}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between shadow-sm">
                <span className="text-slate-500 font-semibold">ভ্যাটের পরিমাণ ({toBn(rate)}%):</span>
                <span className="font-bold text-blue-600">{formatBnCurrency(vatAmount)}</span>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100/80 flex justify-between items-center mt-3">
                <span className="text-blue-900 font-black">সর্বমোট মূল্য:</span>
                <span className="text-xl font-black text-blue-700">{formatBnCurrency(totalAmount)}</span>
              </div>
            </div>

            {totalAmount > 0 && (
              <div className="space-y-1">
                <div className="h-4 w-full rounded-full bg-slate-100 flex overflow-hidden border border-slate-200/50">
                  <div 
                    style={{ width: `${100 - vatPercentOfTotal}%` }} 
                    className="bg-slate-300 h-full flex items-center justify-center text-[9px] font-bold text-slate-700"
                  >
                    {toBn(Math.round(100 - vatPercentOfTotal))}%
                  </div>
                  <div 
                    style={{ width: `${vatPercentOfTotal}%` }} 
                    className="bg-blue-500 h-full flex items-center justify-center text-[9px] font-bold text-white"
                  >
                    {toBn(Math.round(vatPercentOfTotal))}%
                  </div>
                </div>
                <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                  <span>● প্রকৃত মূল্য ({toBn(Math.round(100 - vatPercentOfTotal))}%)</span>
                  <span>● ভ্যাট উপাদান ({toBn(Math.round(vatPercentOfTotal))}%)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. Invoice Calculator (ইনভয়েস ক্যালকুলেটর)
// ============================================================================
interface InvoiceItem {
  id: number;
  name: string;
  qty: number;
  price: number;
  discountPercent: number;
  vatPercent: number;
}

export function InvoiceCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [businessName, setBusinessName] = useState('পুতুল ফুড অ্যান্ড বেভারেজ');
  const [clientName, setClientName] = useState('জহিরুল ইসলাম');
  const [invoiceNo, setInvoiceNo] = useState(() => 'INV-' + Math.floor(Math.random() * 90000 + 10000));
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, name: 'চাল (মিনিকেট)', qty: 10, price: 65, discountPercent: 0, vatPercent: 5 },
    { id: 2, name: 'মসুর ডাল', qty: 5, price: 130, discountPercent: 5, vatPercent: 5 },
    { id: 3, name: 'সয়াবিন তেল (৫ লিটার)', qty: 2, price: 820, discountPercent: 2, vatPercent: 15 },
  ]);

  const [isPreview, setIsPreview] = useState(false);

  const addItem = () => {
    const nextId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: nextId, name: `পণ্য ${toBn(nextId)}`, qty: 1, price: 100, discountPercent: 0, vatPercent: 5 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalVat = 0;
    let grandTotal = 0;

    const itemDetails = items.map(item => {
      const rawSubtotal = item.qty * item.price;
      const discountAmt = rawSubtotal * (item.discountPercent / 100);
      const discountedSubtotal = rawSubtotal - discountAmt;
      const vatAmt = discountedSubtotal * (item.vatPercent / 100);
      const itemTotal = discountedSubtotal + vatAmt;

      subtotal += rawSubtotal;
      totalDiscount += discountAmt;
      totalVat += vatAmt;
      grandTotal += itemTotal;

      return {
        ...item,
        rawSubtotal,
        discountAmt,
        vatAmt,
        itemTotal
      };
    });

    return {
      subtotal,
      totalDiscount,
      totalVat,
      grandTotal,
      itemDetails
    };
  };

  const totals = calculateTotals();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto print:shadow-none print:border-none">
      <div className="p-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white flex justify-between items-center print:hidden">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Receipt className="w-6 h-6" /> পেশাদার ইনভয়েস ক্যালকুলেটর
          </h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPreview(!isPreview)}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
          >
            <FileText size={14} /> {isPreview ? 'ফরম এডিটর' : 'রসিদ প্রিভিউ'}
          </button>
        </div>
      </div>

      {!isPreview ? (
        <div className="p-6 space-y-6 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">আপনার প্রতিষ্ঠানের নাম:</label>
                <input 
                  type="text" 
                  value={businessName || ""} 
                  onChange={(e) => setBusinessName(e.target.value)} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">গ্রাহকের নাম:</label>
                <input 
                  type="text" 
                  value={clientName || ""} 
                  onChange={(e) => setClientName(e.target.value)} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ইনভয়েস নং:</label>
                  <input 
                    type="text" 
                    value={invoiceNo || ""} 
                    onChange={(e) => setInvoiceNo(e.target.value)} 
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">তারিখ:</label>
                  <input 
                    type="date" 
                    value={invoiceDate || ""} 
                    onChange={(e) => setInvoiceDate(e.target.value)} 
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">পরিশোধের শেষ তারিখ (Due Date):</label>
                <input 
                  type="date" 
                  value={dueDate || ""} 
                  onChange={(e) => setDueDate(e.target.value)} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-700">পণ্যের তালিকা (রসিদে যুক্ত করতে):</span>
              <button
                onClick={addItem}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Plus size={14} /> পণ্য যোগ করুন
              </button>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 sm:col-span-3">
                    <input
                      type="text"
                      value={item.name || ""}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2 flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">পরিমাণ:</span>
                    <input
                      type="number"
                      value={item.qty || ""}
                      onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent border-none text-xs font-bold focus:outline-none"
                      min="1"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2 flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">দর (৳):</span>
                    <input
                      type="number"
                      value={item.price || ""}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none text-xs font-bold focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2 flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">ডিস%:</span>
                    <input
                      type="number"
                      value={item.discountPercent || ""}
                      onChange={(e) => updateItem(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none text-xs font-bold focus:outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-2 flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">ভ্যাট%:</span>
                    <input
                      type="number"
                      value={item.vatPercent || ""}
                      onChange={(e) => updateItem(item.id, 'vatPercent', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none text-xs font-bold focus:outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-purple-50/40 p-4 rounded-2xl border border-purple-100">
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-slate-600">মোট আইটেম: <span className="font-bold text-slate-800">{toBn(items.length)} টি</span></p>
              <p className="font-semibold text-slate-600">সাব-টোটাল: <span className="font-bold text-slate-800">{formatBnCurrency(totals.subtotal)}</span></p>
            </div>
            
            <div className="w-full md:w-auto space-y-2 text-right">
              <div className="text-xs font-bold space-y-1">
                <p className="text-rose-600">(-) মোট ডিসকাউন্ট: {formatBnCurrency(totals.totalDiscount)}</p>
                <p className="text-blue-600">(+) মোট ভ্যাট: {formatBnCurrency(totals.totalVat)}</p>
              </div>
              <div className="border-t pt-2 flex justify-between md:justify-end gap-6 items-center">
                <span className="text-sm font-black text-slate-700">সর্বমোট প্রদেয় (Grand Total):</span>
                <span className="text-xl font-black text-purple-700">{formatBnCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsPreview(true)}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-md flex items-center gap-1.5"
            >
              <FileText size={16} /> ইনভয়েস রসিদ জেনারেট করুন
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6 bg-slate-100">
          <div className="flex justify-between items-center print:hidden bg-white p-3 rounded-xl shadow-sm border border-slate-200/60 mb-2">
            <button
              onClick={() => setIsPreview(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg transition-colors"
            >
              ← তথ্য এডিট করুন
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              🖨️ প্রিন্ট করুন / PDF সেভ
            </button>
          </div>

          <div id="invoice-receipt" className="bg-white p-8 rounded-3xl shadow-lg max-w-3xl mx-auto border border-slate-200 print:border-none print:shadow-none print:p-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-purple-100 gap-4">
              <div>
                <h3 className="text-2xl font-black text-purple-700">{businessName}</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">পেশাদার বাণিজ্যিক চালানের রসিদ</p>
              </div>
              <div className="text-right sm:text-right space-y-1 text-xs">
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-black text-[10px] uppercase">রসিদ বিবরণ</span>
                <p className="font-bold text-slate-700 mt-1">ইনভয়েস নং: <span className="font-black text-purple-700">{invoiceNo}</span></p>
                <p className="text-slate-500">তারিখ: {toBn(invoiceDate)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 text-xs border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">ক্রেতার বিবরণ</span>
                <p className="font-black text-slate-800 text-sm">{clientName}</p>
                <p className="text-slate-500">গ্রাহক ক্যাটাগরি: রিটেইল ক্রেতা</p>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">পেমেন্ট বিবরণ</span>
                <p className="font-bold text-slate-700">পরিশোধের শেষ তারিখ:</p>
                <p className="font-black text-rose-600">{toBn(dueDate)}</p>
              </div>
            </div>

            <div className="py-6 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <th className="py-2.5 px-2">ক্রমিক</th>
                    <th className="py-2.5 px-2">পণ্যের বিবরণ</th>
                    <th className="py-2.5 px-2 text-center">পরিমাণ</th>
                    <th className="py-2.5 px-2 text-right">একক মূল্য</th>
                    <th className="py-2.5 px-2 text-right">ডিসকাউন্ট</th>
                    <th className="py-2.5 px-2 text-right">ভ্যাট</th>
                    <th className="py-2.5 px-2 text-right">মোট (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {totals.itemDetails.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-2 text-slate-400 font-bold">{toBn(idx + 1)}</td>
                      <td className="py-3 px-2 font-black text-slate-800">{item.name}</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">{toBn(item.qty)}</td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-600">{toBn(item.price.toFixed(2))}</td>
                      <td className="py-3 px-2 text-right font-semibold text-rose-500">{item.discountPercent > 0 ? `${toBn(item.discountPercent)}%` : '-'}</td>
                      <td className="py-3 px-2 text-right font-semibold text-blue-500">{item.vatPercent > 0 ? `${toBn(item.vatPercent)}%` : '-'}</td>
                      <td className="py-3 px-2 text-right font-black text-slate-800">{toBn(item.itemTotal.toFixed(2))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-full sm:w-80 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>মোট সাব-টোটাল:</span>
                  <span>{formatBnCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between font-semibold text-rose-500">
                  <span>(-) সর্বমোট ডিসকাউন্ট:</span>
                  <span>{formatBnCurrency(totals.totalDiscount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-blue-600">
                  <span>(+) সর্বমোট ভ্যাট:</span>
                  <span>{formatBnCurrency(totals.totalVat)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2.5 bg-purple-50 p-3 rounded-xl border border-purple-100">
                  <span className="text-sm font-black text-purple-900">সর্বমোট প্রদেয় মূল্য:</span>
                  <span className="text-lg font-black text-purple-700">{formatBnCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center text-[10px] text-slate-400 space-y-1 pt-6 border-t border-slate-100">
              <p>রসিদ তৈরি করার জন্য ধন্যবাদ। আমাদের সাথে থাকুন।</p>
              <p className="font-semibold text-slate-500">স্বাক্ষর ও সিল (অনুমোদিত কর্মী)</p>
              <div className="h-10 w-28 border-b border-dashed border-slate-300 mx-auto mt-2"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. Stock Calculator (স্টক ক্যালকুলেটর)
// ============================================================================
export function StockCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [initialStock, setInitialStock] = useState('100');
  const [purchased, setPurchased] = useState('50');
  const [sales, setSales] = useState('80');
  const [unitCost, setUnitCost] = useState('200');
  const [unitPrice, setUnitPrice] = useState('280');
  const [damaged, setDamaged] = useState('2');

  const init = parseFloat(initialStock) || 0;
  const p = parseFloat(purchased) || 0;
  const s = parseFloat(sales) || 0;
  const uc = parseFloat(unitCost) || 0;
  const up = parseFloat(unitPrice) || 0;
  const d = parseFloat(damaged) || 0;

  const currentStock = init + p - s - d;
  const totalCostOfStock = Math.max(0, currentStock) * uc;
  const totalCOGS = s * uc;
  const totalRevenue = s * up;
  const totalProfit = totalRevenue - totalCOGS;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Layers className="w-6 h-6" /> স্টক ও ইনভেন্টরি (Stock) ক্যালকুলেটর
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">ইনভেন্টরি হিসাব</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">প্রারম্ভিক স্টক (শুরুর পণ্য):</label>
              <input
                type="number"
                value={initialStock || ""}
                onChange={(e) => setInitialStock(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">নতুন পণ্য ক্রয় (Purchased):</label>
              <input
                type="number"
                value={purchased || ""}
                onChange={(e) => setPurchased(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">বিক্রিত পণ্য (Sales Quantity):</label>
              <input
                type="number"
                value={sales || ""}
                onChange={(e) => setSales(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">ক্ষতিগ্রস্ত বা নষ্ট পণ্য:</label>
              <input
                type="number"
                value={damaged || ""}
                onChange={(e) => setDamaged(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">একক প্রতি ক্রয়মূল্য (৳):</label>
              <input
                type="number"
                value={unitCost || ""}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">একক প্রতি বিক্রয়মূল্য (৳):</label>
              <input
                type="number"
                value={unitPrice || ""}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">বর্তমান স্টক অবস্থা:</span>
              {currentStock <= 10 ? (
                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
                  ⚠️ রি-অর্ডার করুন! ({toBn(currentStock)})
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200">
                  ✓ পর্যাপ্ত স্টক ({toBn(currentStock)})
                </span>
              )}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">বর্তমান উপলব্ধ স্টক সংখ্যা</span>
              <p className="text-4xl font-black text-slate-800 mt-1">{toBn(currentStock)} <span className="text-xs text-slate-400 font-bold">টি</span></p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex justify-between">
                <span className="text-slate-500 font-semibold">স্টকের বর্তমান আর্থিক মূল্য:</span>
                <span className="font-bold text-slate-800">{formatBnCurrency(totalCostOfStock)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex justify-between">
                <span className="text-slate-500 font-semibold">বিক্রয়লব্ধ মোট রাজস্ব:</span>
                <span className="font-bold text-slate-800">{formatBnCurrency(totalRevenue)}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex justify-between items-center mt-2">
                <div className="space-y-0.5">
                  <span className="text-emerald-900 font-black block">স্টক থেকে অর্জিত নিট লাভ:</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">প্রফিট মার্জিন: {toBn(profitMargin.toFixed(1))}%</span>
                </div>
                <span className="text-base font-black text-emerald-700">{formatBnCurrency(totalProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. ROI Calculator (বিনিয়োগের রিটার্ন - ROI ক্যালকুলেটর)
// ============================================================================
export function ROICalculator({ onGoBack }: { onGoBack: () => void }) {
  const [initial, setInitial] = useState('50000');
  const [final, setFinal] = useState('75000');
  const [period, setPeriod] = useState('3');

  const init = parseFloat(initial) || 0;
  const fin = parseFloat(final) || 0;
  const years = parseFloat(period) || 0;

  const netProfit = fin - init;
  const roi = init > 0 ? (netProfit / init) * 100 : 0;
  const annualizedRoi = (years > 0 && init > 0 && fin > 0) ? (Math.pow(fin / init, 1 / years) - 1) * 100 : null;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Coins className="w-6 h-6" /> রিটার্ন অন ইনভেস্টমেন্ট (ROI) ক্যালকুলেটর
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">বিনিয়োগ বিশ্লেষণ</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">প্রাথমিক বিনিয়োগের পরিমাণ (৳):</label>
            <input
              type="number"
              value={initial || ""}
              onChange={(e) => setInitial(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">চূড়ান্ত প্রাপ্ত মূল্য বা রিটার্ন (৳):</label>
            <input
              type="number"
              value={final || ""}
              onChange={(e) => setFinal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">বিনিয়োগের মোট সময়কাল (বছর):</label>
            <input
              type="number"
              value={period || ""}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
            <div className="text-center pb-3 border-b border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">বিনিয়োগের নিট মুনাফা</span>
              <p className={`text-3xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatBnCurrency(netProfit)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 block">মোট রিটার্ন (ROI)</span>
                <span className={`text-lg font-black block mt-1 ${roi >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{toBn(roi.toFixed(1))}%</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 block">বাৎসরিক ROI (CAGR)</span>
                <span className="text-lg font-black text-blue-600 block mt-1">
                  {annualizedRoi !== null ? `${toBn(annualizedRoi.toFixed(1))}%` : '-'}
                </span>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs font-bold text-center leading-normal ${roi >= 25 ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : roi >= 0 ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}>
              {roi >= 25 
                ? 'অসাধারণ বিনিয়োগ! চমৎকার লাভজনক রিটার্ন পেয়েছেন। 📈🔥' 
                : roi >= 0 
                  ? 'ইতিবাচক রিটার্ন! বিনিয়োগ লাভজনক হয়েছে। 👍' 
                  : 'দুঃখিত! বিনিয়োগে লোকসান হয়েছে। 🥺'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. Break-even Calculator (ব্রেক-ইভেন ক্যালকুলেটর)
// ============================================================================
export function BreakEvenCalculator({ onGoBack }: { onGoBack: () => void }) {
  const [fixedCosts, setFixedCosts] = useState('50000');
  const [unitVariableCost, setUnitVariableCost] = useState('60');
  const [unitPrice, setUnitPrice] = useState('100');

  const fc = parseFloat(fixedCosts) || 0;
  const vc = parseFloat(unitVariableCost) || 0;
  const p = parseFloat(unitPrice) || 0;

  const contributionMargin = p - vc;
  const cmRatio = p > 0 ? (contributionMargin / p) * 100 : 0;
  const breakEvenUnits = contributionMargin > 0 ? fc / contributionMargin : 0;
  const breakEvenSales = breakEvenUnits * p;

  const isInvalid = vc >= p;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-rose-500 to-pink-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <LineChart className="w-6 h-6" /> ব্রেক-ইভেন (Break-even Point) ক্যালকুলেটর
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">ব্যবসায়িক লাভ সীমা</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">মোট স্থায়ী খরচ (৳) (যেমন: ভাড়া, বেতন ইত্যাদি):</label>
            <input
              type="number"
              value={fixedCosts || ""}
              onChange={(e) => setFixedCosts(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">একক প্রতি পরিবর্তনশীল খরচ (৳) (যেমন: কাঁচামাল, প্যাকেজিং):</label>
            <input
              type="number"
              value={unitVariableCost || ""}
              onChange={(e) => setUnitVariableCost(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">একক প্রতি বিক্রয়মূল্য (৳):</label>
            <input
              type="number"
              value={unitPrice || ""}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none"
            />
          </div>
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
            <span className="text-xs font-black text-slate-700 block text-center border-b pb-2 mb-2">📊 ব্রেক-ইভেন রিপোর্ট</span>

            {isInvalid ? (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs font-bold leading-normal text-center">
                ⚠️ সতর্কবার্তা: পরিবর্তনশীল খরচ বা একক উৎপাদন খরচ অবশ্যই বিক্রয়মূল্যের চেয়ে কম হতে হবে। লোকসানে পণ্য বিক্রি করলে কোনোদিন ব্রেক-ইভেন করা সম্ভব নয়!
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">প্রয়োজনীয় ন্যূনতম বিক্রয় একক</span>
                  <p className="text-3xl font-black text-rose-600 mt-1">{toBn(Math.ceil(breakEvenUnits))} <span className="text-xs text-slate-400 font-bold">টি পণ্য</span></p>
                  <span className="text-[9px] text-slate-400 block mt-1">খরচ ওঠাতে অন্তত এতটি পণ্য বিক্রি করতে হবে।</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs flex justify-between shadow-sm">
                  <span className="text-slate-500 font-bold">ব্রেক-ইভেন বিক্রয়মূল্য:</span>
                  <span className="font-black text-slate-800">{formatBnCurrency(breakEvenSales)}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs flex justify-between shadow-sm">
                  <span className="text-slate-500 font-bold">কন্ট্রিবিউশন মার্জিন (৳):</span>
                  <span className="font-black text-emerald-600">{formatBnCurrency(contributionMargin)} / টি</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs flex justify-between shadow-sm">
                  <span className="text-slate-500 font-bold">মার্জিন অনুপাত (Ratio):</span>
                  <span className="font-black text-indigo-600">{toBn(cmRatio.toFixed(1))}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
