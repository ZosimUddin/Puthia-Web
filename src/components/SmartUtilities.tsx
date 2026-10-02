import React, { useState, useEffect, useRef } from 'react';
import { copyToClipboard } from '../utils/clipboard';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, QrCode, Barcode, Key, ShieldCheck, Hash, Palette, RefreshCw, 
  Fingerprint, Type, Copy, Check, Info, RefreshCw as ResetIcon, Download, 
  Scissors, Eye, EyeOff, Sliders, Play, Plus, Trash2, FileText, Sparkles,
  ArrowRightLeft, CaseSensitive, Binary, Languages, LayoutDashboard
} from 'lucide-react';
import QRCode from 'react-qr-code';

// Helper to convert English digits to Bengali digits
export function toBn(n: number | string): string {
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/[0-9]/g, (w) => bnNums[+w]);
}

const formatBnCurrency = (val: number) => {
  return '৳ ' + toBn(val.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }));
};

// Simple copy feedback hook
function useCopyToClipboard() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (text: string, id: string = 'default') => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return { copiedId, copy };
}

// Code 39 Barcode Map (bars and spaces: 1 = bar, 0 = space)
const CODE39_MAP: Record<string, string> = {
  '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
  '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
  '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
  'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
  'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101011001101',
  'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
  'O': '110101101001', 'P': '101101101001', 'Q': '101010110011', 'R': '110101011001',
  'S': '101101011001', 'T': '101011011001', 'U': '110010101011', 'V': '100110101011',
  'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
  '-': '100101011011', '.': '110010101101', ' ': '100110101101', '*': '100101101101',
  '$': '100100100101', '/': '100100101001', '+': '100101001001', '%': '101001001001'
};

// ============================================================================
// 1. QR Code Generator (কিউআর কোড জенারেটর)
// ============================================================================
export function QRCodeGenerator({ onGoBack }: { onGoBack: () => void }) {
  const [text, setText] = useState('https://ai.studio/build');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(200);
  const { copiedId, copy } = useCopyToClipboard();

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = bgColor;
          context.fillRect(0, 0, size, size);
          context.drawImage(image, 0, 0, size, size);
          const png = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = png;
          downloadLink.download = `qrcode_${Date.now()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
    }
  };

  return (
    <div id="qr_generator_card" className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex justify-between items-center">
        <div>
          <button id="qr_back_btn" onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 id="qr_title" className="text-xl font-black mt-2 flex items-center gap-2">
            <QrCode className="w-6 h-6" /> কিউআর কোড জেনারেটর (QR Code)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">স্মার্ট ইউটিলিটি</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">যেকোনো লিঙ্ক বা টেক্সট লিখুন:</label>
            <textarea
              id="qr_text_input"
              value={text || ""}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 h-24"
              placeholder="এখানে আপনার লিংক বা টেক্সট লিখুন..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">কোডের রঙ (Foreground):</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={fgColor || ""}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={fgColor || ""}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">ব্যাকগ্রাউন্ডের রঙ:</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={bgColor || ""}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor || ""}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">সাইজ (পিক্সেল): {toBn(size)}px</label>
            <input
              type="range"
              min="120"
              max="400"
              step="10"
              value={size || ""}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 p-6">
          <div 
            id="qr_code_container"
            className="p-4 rounded-2xl bg-white shadow-sm border border-slate-200/60 flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            {text ? (
              <QRCode
                id="qr-code-svg"
                value={text || ""}
                size={size > 256 ? 256 : size}
                fgColor={fgColor}
                bgColor={bgColor}
                level="Q"
              />
            ) : (
              <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 font-bold">
                কোনো টেক্সট নেই
              </div>
            )}
          </div>

          {text && (
            <div className="flex gap-2 w-full mt-4">
              <button
                id="qr_copy_btn"
                onClick={() => copy(text, 'qr')}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                {copiedId === 'qr' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedId === 'qr' ? 'কপি হয়েছে' : 'টেক্সট কপি করুন'}
              </button>
              <button
                id="qr_download_btn"
                onClick={handleDownload}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <Download className="w-4 h-4" /> ডাউনলোড PNG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. Barcode Generator (বারকোড জেনারেটর)
// ============================================================================
export function BarcodeGenerator({ onGoBack }: { onGoBack: () => void }) {
  const [text, setText] = useState('CODE12345');
  const [barcodeHeight, setBarcodeHeight] = useState(80);
  const [showText, setShowText] = useState(true);
  const { copiedId, copy } = useCopyToClipboard();

  // Convert input to valid Code 39 format (uppercase, letters, numbers, spaces, specific symbols)
  const cleanInput = text.toUpperCase().replace(/[^0-9A-Z\-\. \$\/\+\%]/g, '');

  // Full barcode sequence consisting of start '*', content, end '*'
  const fullSequence = `*${cleanInput}*`;

  // Draw the SVG barcode representation
  const renderBarcodeBars = () => {
    let binaryStr = '';
    for (let char of fullSequence) {
      const pattern = CODE39_MAP[char];
      if (pattern) {
        binaryStr += pattern + '0'; // Add an extra space bar between characters
      }
    }

    const barWidth = 2;
    const totalBars = binaryStr.length;
    const svgWidth = totalBars * barWidth;

    return (
      <svg
        id="barcode-svg"
        width={svgWidth + 40}
        height={barcodeHeight + (showText ? 40 : 20)}
        className="mx-auto"
        style={{ background: '#ffffff' }}
      >
        <g transform="translate(20, 10)">
          {binaryStr.split('').map((bit, index) => {
            if (bit === '1') {
              return (
                <rect
                  key={index}
                  x={index * barWidth}
                  y={0}
                  width={barWidth}
                  height={barcodeHeight}
                  fill="#000000"
                />
              );
            }
            return null;
          })}
          {showText && (
            <text
              x={svgWidth / 2}
              y={barcodeHeight + 20}
              textAnchor="middle"
              className="font-mono text-xs font-bold fill-slate-800 tracking-[0.2em]"
            >
              {cleanInput}
            </text>
          )}
        </g>
      </svg>
    );
  };

  const handleDownloadBarcode = () => {
    const svg = document.getElementById('barcode-svg');
    if (svg) {
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const bbox = svg.getBoundingClientRect();
        canvas.width = bbox.width || 300;
        canvas.height = bbox.height || 150;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0);
          const png = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = png;
          downloadLink.download = `barcode_${cleanInput}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
    }
  };

  return (
    <div id="barcode_generator_card" className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white flex justify-between items-center">
        <div>
          <button id="barcode_back_btn" onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 id="barcode_title" className="text-xl font-black mt-2 flex items-center gap-2">
            <Barcode className="w-6 h-6" /> বারকোড জেনারেটর (Code 39)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">স্মার্ট ইউটিলিটি</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">বারকোড টেক্সট লিখুন (শুধুমাত্র ইংরেজি বর্ণ ও সংখ্যা):</label>
            <input
              id="barcode_text_input"
              type="text"
              value={text || ""}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black uppercase focus:outline-none focus:border-violet-500"
              placeholder="যেমন: CODE12345"
            />
            <p className="text-[10px] text-slate-400 font-bold mt-1">※ বিশেষ ক্যারেক্টার ও বাংলা অক্ষর স্বয়ংক্রিয়ভাবে বাদ যাবে। সমর্থিত: A-Z, 0-9, স্পেস, -, ., $, /, +, %</p>
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">বারকোড উচ্চতা: {toBn(barcodeHeight)}px</label>
            <input
              type="range"
              min="50"
              max="150"
              value={barcodeHeight || ""}
              onChange={(e) => setBarcodeHeight(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="show_text_checkbox"
              type="checkbox"
              checked={showText}
              onChange={(e) => setShowText(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
            />
            <label htmlFor="show_text_checkbox" className="text-xs font-bold text-slate-600">নিচে রিডঅ্যাবল টেক্সট প্রদর্শন করুন</label>
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 p-6">
          <div id="barcode_render_container" className="p-4 rounded-xl bg-white shadow-sm border border-slate-200/60 w-full overflow-x-auto flex justify-center items-center min-h-[140px]">
            {cleanInput ? renderBarcodeBars() : (
              <span className="text-xs text-slate-400 font-bold">বৈধ ক্যারেক্টার লিখুন</span>
            )}
          </div>

          {cleanInput && (
            <div className="flex gap-2 w-full mt-4">
              <button
                id="barcode_copy_btn"
                onClick={() => copy(cleanInput, 'bar')}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                {copiedId === 'bar' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedId === 'bar' ? 'কপি হয়েছে' : 'টেক্সট কপি'}
              </button>
              <button
                id="barcode_download_btn"
                onClick={handleDownloadBarcode}
                className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <Download className="w-4 h-4" /> ডাউনলোড PNG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3 & 4. Password Generator & Strength Checker (পাসওয়ার্ড জেনারেটর ও শক্তি পরীক্ষক)
// ============================================================================
export function PasswordUtility({ onGoBack, initialTab = 'generate' }: { onGoBack: () => void, initialTab?: 'generate' | 'check' }) {
  const [activeTab, setActiveTab] = useState<'generate' | 'check'>(initialTab);
  
  // Generator State
  const [length, setLength] = useState(12);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Strength Checker State
  const [inputPassword, setInputPassword] = useState('');
  const [showInputPass, setShowInputPass] = useState(false);

  const { copiedId, copy } = useCopyToClipboard();

  // Similar chars to exclude
  const similarChars = 'iIlL1o0O';

  const generatePassword = () => {
    let chars = '';
    if (includeUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (excludeSimilar) {
      chars = chars.split('').filter(c => !similarChars.includes(c)).join('');
    }

    if (!chars) {
      setGeneratedPassword('');
      return;
    }

    let pass = '';
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * chars.length);
      pass += chars[idx];
    }
    setGeneratedPassword(pass);
  };

  useEffect(() => {
    if (activeTab === 'generate') {
      generatePassword();
    }
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeSimilar, activeTab]);

  // Analyze strength of any password
  const checkPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'নেই', color: 'text-slate-400 bg-slate-100', width: 'w-0', suggestions: [] };
    
    let score = 0;
    const suggestions: string[] = [];

    if (pass.length >= 8) {
      score += 1;
    } else {
      suggestions.push('পাসওয়ার্ডটি অন্তত ৮ ক্যারেক্টার লম্বা করুন।');
    }

    if (pass.length >= 12) {
      score += 1;
    }

    if (/[A-Z]/.test(pass)) {
      score += 1;
    } else {
      suggestions.push('অন্তত একটি বড় হাতের অক্ষর (A-Z) যুক্ত করুন।');
    }

    if (/[a-z]/.test(pass)) {
      score += 1;
    } else {
      suggestions.push('অন্তত একটি ছোট হাতের অক্ষর (a-z) যুক্ত করুন।');
    }

    if (/[0-9]/.test(pass)) {
      score += 1;
    } else {
      suggestions.push('অন্তত একটি সংখ্যা (0-9) যুক্ত করুন।');
    }

    if (/[^A-Za-z0-9]/.test(pass)) {
      score += 1;
    } else {
      suggestions.push('অন্তত একটি বিশেষ চিহ্ন (!@#$%^&*) ব্যবহার করুন।');
    }

    // Common passwords list check
    const common = ['123456', 'password', '12345678', '12345', 'qwerty', 'admin', 'welcome', 'bengal', 'bangladesh'];
    if (common.includes(pass.toLowerCase())) {
      score = Math.max(1, score - 3);
      suggestions.unshift('🚨 এটি একটি অত্যন্ত সাধারণ ও ঝুঁকিপূর্ণ পাসওয়ার্ড! অবিলম্বে পরিবর্তন করুন।');
    }

    let label = 'খুব দুর্বল (Very Weak)';
    let color = 'text-rose-600 bg-rose-50 border-rose-200';
    let width = 'w-[15%] bg-rose-500';

    if (score >= 6) {
      label = 'অত্যন্ত শক্তিশালী (Very Strong) 💪';
      color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      width = 'w-full bg-emerald-500';
    } else if (score >= 4) {
      label = 'শক্তিশালী (Strong) 👍';
      color = 'text-green-600 bg-green-50 border-green-200';
      width = 'w-[75%] bg-green-500';
    } else if (score >= 3) {
      label = 'মাঝারি (Medium) ⚠️';
      color = 'text-amber-600 bg-amber-50 border-amber-200';
      width = 'w-[50%] bg-amber-500';
    } else if (score >= 2) {
      label = 'দুর্বল (Weak) ❌';
      color = 'text-orange-600 bg-orange-50 border-orange-200';
      width = 'w-[30%] bg-orange-500';
    }

    return { score, label, color, width, suggestions };
  };

  const currentStrength = checkPasswordStrength(activeTab === 'generate' ? generatedPassword : inputPassword);

  return (
    <div id="password_utility_card" className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex justify-between items-center">
        <div>
          <button id="pass_back_btn" onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 id="pass_title" className="text-xl font-black mt-2 flex items-center gap-2">
            <Key className="w-6 h-6" /> পাসওয়ার্ড টুলবক্স
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">সিকিউরিটি</span>
      </div>

      <div className="p-6">
        <div className="flex gap-4 border-b pb-4 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${activeTab === 'generate' ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            পাসওয়ার্ড তৈরি করুন (Generator)
          </button>
          <button
            onClick={() => setActiveTab('check')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${activeTab === 'check' ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            পাসওয়ার্ড শক্তি পরীক্ষা (Checker)
          </button>
        </div>

        {activeTab === 'generate' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">পাসওয়ার্ড এর দৈর্ঘ্য: {toBn(length)} ক্যারেক্টার</label>
                <input
                  type="range"
                  min="6"
                  max="64"
                  value={length || ""}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeUpper}
                    onChange={(e) => setIncludeUpper(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-slate-300 rounded"
                  />
                  <span className="text-xs font-bold text-slate-600">বড় হাতের (A-Z)</span>
                </label>

                <label className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeLower}
                    onChange={(e) => setIncludeLower(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-slate-300 rounded"
                  />
                  <span className="text-xs font-bold text-slate-600">ছোট হাতের (a-z)</span>
                </label>

                <label className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-slate-300 rounded"
                  />
                  <span className="text-xs font-bold text-slate-600">সংখ্যা (0-9)</span>
                </label>

                <label className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-slate-300 rounded"
                  />
                  <span className="text-xs font-bold text-slate-600">বিশেষ চিহ্ন (#@$)</span>
                </label>
              </div>

              <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-slate-300 rounded"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-700 block">অনুরূপ ক্যারেক্টার বাদ দিন</span>
                  <span className="text-[10px] text-slate-400 font-bold block">(যেমন: i, l, 1, L, o, 0, O)</span>
                </div>
              </label>
            </div>

            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                <span className="text-xs font-black text-slate-500 block uppercase tracking-wider text-center">উৎপন্ন পাসওয়ার্ড</span>
                
                <div className="relative bg-white border border-slate-200 rounded-xl px-3 py-3.5 flex items-center justify-between min-h-[50px] shadow-sm">
                  <span className={`text-sm font-mono break-all font-black pr-8 ${showPassword ? 'text-slate-800' : 'text-slate-300 select-none'}`}>
                    {generatedPassword ? (showPassword ? generatedPassword : '•'.repeat(generatedPassword.length)) : 'নির্বাচন করুন'}
                  </span>
                  
                  <div className="absolute right-2 flex gap-1">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg transition-colors"
                      title={showPassword ? "লুকান" : "দেখুন"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {generatedPassword && (
                      <button
                        onClick={() => copy(generatedPassword, 'genpass')}
                        className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg transition-colors"
                        title="কপি করুন"
                      >
                        {copiedId === 'genpass' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      </button>
                    )}
                  </div>
                </div>

                {generatedPassword && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400">নিরাপত্তা স্তর:</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${currentStrength.color}`}>
                        {currentStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${currentStrength.width}`} />
                    </div>
                  </div>
                )}

                <button
                  onClick={generatePassword}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <RefreshCw size={14} /> নতুন পাসওয়ার্ড তৈরি করুন
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">যেকোনো পাসওয়ার্ড লিখুন:</label>
                <div className="relative">
                  <input
                    type={showInputPass ? 'text' : 'password'}
                    value={inputPassword || ""}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-12 py-3 text-xs font-mono font-black focus:outline-none focus:border-teal-500"
                    placeholder="পাসওয়ার্ড লিখুন..."
                  />
                  <button
                    onClick={() => setShowInputPass(!showInputPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showInputPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {inputPassword && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs font-black text-slate-700">শক্তি স্তর:</span>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded border ${currentStrength.color}`}>
                      {currentStrength.label}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${currentStrength.width}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                    <div>দৈর্ঘ্য: {toBn(inputPassword.length)} ক্যারেক্টার</div>
                    <div>চরিত্রের বৈচিত্র্য: {toBn((/[A-Z]/.test(inputPassword) ? 1 : 0) + (/[a-z]/.test(inputPassword) ? 1 : 0) + (/[0-9]/.test(inputPassword) ? 1 : 0) + (/[^A-Za-z0-9]/.test(inputPassword) ? 1 : 0))}/৪</div>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-5">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-3 min-h-[150px]">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                  <Info size={14} className="text-teal-600" /> উন্নয়ন পরামর্শ (Suggestions)
                </span>
                
                {inputPassword ? (
                  currentStrength.suggestions.length > 0 ? (
                    <ul className="space-y-2">
                      {currentStrength.suggestions.map((sug, i) => (
                        <li key={i} className="text-[10px] font-bold text-slate-600 flex items-start gap-1">
                          <span className="text-teal-500 mt-0.5">•</span> {sug}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                      চমৎকার! আপনার পাসওয়ার্ডটি সম্পূর্ণ নিরাপদ ও শক্তিশালী। 🎉
                    </div>
                  )
                ) : (
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                    পাসওয়ার্ডের নিরাপত্তা ও হ্যাকিং প্রতিরোধ ক্ষমতা পরীক্ষা করতে বাম পাশের বক্সে পাসওয়ার্ড টাইপ করুন।
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 5. Random Number Generator (র্যান্ডম নম্বর জেনারেটর)
// ============================================================================
export function RandomNumberGenerator({ onGoBack }: { onGoBack: () => void }) {
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('5');
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [coinResult, setCoinResult] = useState<'HEADS' | 'TAILS' | null>(null);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleGenerate = () => {
    const minValue = parseInt(min) || 0;
    const maxValue = parseInt(max) || 0;
    const countValue = parseInt(count) || 1;

    if (minValue >= maxValue) return;

    const range = maxValue - minValue + 1;
    if (!allowDuplicates && countValue > range) {
      alert(`ডুপ্লিকেট ছাড়া সর্বোচ্চ ${range}টি নম্বর তৈরি করা সম্ভব!`);
      return;
    }

    const generated: number[] = [];
    if (allowDuplicates) {
      for (let i = 0; i < countValue; i++) {
        generated.push(Math.floor(Math.random() * range) + minValue);
      }
    } else {
      const pool = Array.from({ length: range }, (_, i) => minValue + i);
      for (let i = 0; i < countValue; i++) {
        const index = Math.floor(Math.random() * pool.length);
        generated.push(pool.splice(index, 1)[0]);
      }
    }
    setResults(generated);
  };

  const handleFlipCoin = () => {
    setIsRolling(true);
    setCoinResult(null);
    setTimeout(() => {
      setCoinResult(Math.random() < 0.5 ? 'HEADS' : 'TAILS');
      setIsRolling(false);
    }, 600);
  };

  const handleRollDice = () => {
    setIsRolling(true);
    setDiceResult(null);
    setTimeout(() => {
      setDiceResult(Math.floor(Math.random() * 6) + 1);
      setIsRolling(false);
    }, 600);
  };

  return (
    <div id="random_number_card" className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Hash className="w-6 h-6" /> র্যান্ডম নম্বর ও গেম টুলস
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">স্মার্ট ইউটিলিটি</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">ন্যূনতম সীমা (Min):</label>
              <input
                type="number"
                value={min || ""}
                onChange={(e) => setMin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">সর্বোচ্চ সীমা (Max):</label>
              <input
                type="number"
                value={max || ""}
                onChange={(e) => setMax(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">সংখ্যা তৈরির পরিমাণ:</label>
              <input
                type="number"
                value={count || ""}
                onChange={(e) => setCount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black focus:outline-none focus:border-orange-500"
                min="1"
                max="100"
              />
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDuplicates}
                  onChange={(e) => setAllowDuplicates(e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                />
                <span className="text-xs font-bold text-slate-600">ডুপ্লিকেট সংখ্যা সমর্থন</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <Play className="w-4 h-4" /> নম্বর জেনারেট করুন
          </button>

          {/* Dice & Coin Shortcuts */}
          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            <button
              onClick={handleFlipCoin}
              disabled={isRolling}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              🪙 টস করুন (Flip Coin)
            </button>
            <button
              onClick={handleRollDice}
              disabled={isRolling}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              🎲 লুডুর ছক্কা (Roll Dice)
            </button>
          </div>
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4 flex flex-col justify-between min-h-[250px]">
            <div>
              <span className="text-xs font-black text-slate-500 block uppercase tracking-wider text-center">ফলাফল</span>
              
              {/* Main Numbers Output */}
              {results.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {results.map((val, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 border border-orange-200 text-orange-700 font-black text-sm shadow-sm animate-bounce"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {toBn(val)}
                    </span>
                  ))}
                </div>
              )}

              {/* Coin Result */}
              {coinResult && (
                <div className="text-center mt-6 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">কয়েন ফ্লিপ ফলাফল:</span>
                  <div className="text-3xl font-black text-orange-600 animate-spin">
                    {coinResult === 'HEADS' ? '🪙 হেড (Heads)' : '🪙 টেইল (Tails)'}
                  </div>
                </div>
              )}

              {/* Dice Result */}
              {diceResult && (
                <div className="text-center mt-6 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">ছক্কার দান:</span>
                  <div className="text-5xl font-black text-slate-800 flex justify-center items-center gap-2">
                    <span>🎲</span>
                    <span className="text-orange-600">{toBn(diceResult)}</span>
                  </div>
                </div>
              )}

              {isRolling && (
                <div className="text-center mt-8 text-xs font-bold text-slate-400 animate-pulse">
                  চলছে... ⏱️
                </div>
              )}

              {!results.length && !coinResult && !diceResult && !isRolling && (
                <div className="text-center text-xs text-slate-400 font-bold py-12">
                  কোনো ফলাফল নেই। জেনারেট বা ডাইস রোল করুন।
                </div>
              )}
            </div>

            {(results.length > 0 || coinResult || diceResult) && (
              <button
                onClick={() => {
                  setResults([]);
                  setCoinResult(null);
                  setDiceResult(null);
                }}
                className="w-full py-1.5 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg font-bold transition-colors"
              >
                রিসেট করুন
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6 & 7. Color Picker & Color Converter (কালার পিকার ও কালার কনভার্টার)
// ============================================================================
export function ColorUtility({ onGoBack, initialTab = 'picker' }: { onGoBack: () => void, initialTab?: 'picker' | 'converter' }) {
  const [activeTab, setActiveTab] = useState<'picker' | 'converter'>(initialTab);
  const [colorHex, setColorHex] = useState('#3b82f6');
  
  // Converter inputs
  const [inputHex, setInputHex] = useState('#3b82f6');
  const [inputRgb, setInputRgb] = useState('59, 130, 246');
  const [inputHsl, setInputHsl] = useState('220, 90%, 60%');

  const { copiedId, copy } = useCopyToClipboard();

  // Color conversion helpers
  const hexToRgb = (hex: string) => {
    let cleaned = hex.replace('#', '');
    if (cleaned.length === 3) {
      cleaned = cleaned.split('').map(char => char + char).join('');
    }
    const num = parseInt(cleaned, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hexToCmyk = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    let rPrime = r / 255;
    let gPrime = g / 255;
    let bPrime = b / 255;

    let k = 1 - Math.max(rPrime, gPrime, bPrime);
    let c = k < 1 ? (1 - rPrime - k) / (1 - k) : 0;
    let m = k < 1 ? (1 - gPrime - k) / (1 - k) : 0;
    let y = k < 1 ? (1 - bPrime - k) / (1 - k) : 0;

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  // Safe variables derived from current colorHex
  let derivedRgb = { r: 0, g: 0, b: 0 };
  let derivedHsl = { h: 0, s: 0, l: 0 };
  let derivedCmyk = { c: 0, m: 0, y: 0, k: 0 };

  try {
    derivedRgb = hexToRgb(colorHex);
    derivedHsl = rgbToHsl(derivedRgb.r, derivedRgb.g, derivedRgb.b);
    derivedCmyk = hexToCmyk(colorHex);
  } catch (err) {}

  // Handles updating from hex inputs
  const handleHexChange = (val: string) => {
    setColorHex(val);
    setInputHex(val);
    try {
      const rgb = hexToRgb(val);
      setInputRgb(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setInputHsl(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
    } catch (e) {}
  };

  // Palette colors for Quick Selection
  const PALETTE = [
    '#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', '#4ade80', '#34d399', 
    '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', 
    '#f472b6', '#fb7185', '#1e293b', '#64748b', '#cbd5e1', '#ffffff'
  ];

  return (
    <div id="color_utility_card" className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-teal-600 to-indigo-600 text-white flex justify-between items-center">
        <div>
          <button id="color_back_btn" onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 id="color_title" className="text-xl font-black mt-2 flex items-center gap-2">
            <Palette className="w-6 h-6" /> কালার টুলস (Color Tools)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">ডিজাইন ইউটিলিটি</span>
      </div>

      <div className="p-6">
        <div className="flex gap-4 border-b pb-4 mb-6">
          <button
            onClick={() => setActiveTab('picker')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${activeTab === 'picker' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            কালার পিকার ও প্যালেট (Picker)
          </button>
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${activeTab === 'converter' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            কালার কনভার্টার (Converter)
          </button>
        </div>

        {activeTab === 'picker' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <input
                  type="color"
                  value={colorHex || ""}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-16 h-16 rounded-xl cursor-pointer border border-slate-200"
                />
                <div className="space-y-1">
                  <span className="text-xs font-black text-slate-700 block">রঙ নির্বাচন করুন:</span>
                  <span className="text-[10px] text-slate-400 font-bold block">বাম পাশের কালার বক্সে ক্লিক করে আপনার পছন্দের রঙটি বেছে নিন।</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-black text-slate-700 block mb-2">জনপ্রিয় কালার প্যালেট (Quick Selection):</span>
                <div className="grid grid-cols-10 gap-2">
                  {PALETTE.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleHexChange(item)}
                      className={`w-full aspect-square rounded-lg border transition-transform hover:scale-110 shadow-sm ${colorHex === item ? 'ring-2 ring-indigo-500 scale-105 border-transparent' : 'border-slate-200'}`}
                      style={{ backgroundColor: item }}
                      title={item}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                <div 
                  className="h-24 w-full rounded-2xl shadow-inner border border-black/10 flex items-center justify-center"
                  style={{ backgroundColor: colorHex }}
                >
                  <span 
                    className="text-xs font-mono font-black px-3 py-1.5 rounded-full bg-white/80 text-slate-800 shadow-sm"
                  >
                    {colorHex.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <span className="text-slate-500 font-semibold">HEX:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-bold">{colorHex.toUpperCase()}</span>
                      <button onClick={() => copy(colorHex, 'hex')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600">
                        {copiedId === 'hex' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <span className="text-slate-500 font-semibold">RGB:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-bold">rgb({derivedRgb.r}, {derivedRgb.g}, {derivedRgb.b})</span>
                      <button onClick={() => copy(`rgb(${derivedRgb.r}, ${derivedRgb.g}, ${derivedRgb.b})`, 'rgb')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600">
                        {copiedId === 'rgb' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <span className="text-slate-500 font-semibold">HSL:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-bold">hsl({derivedHsl.h}, {derivedHsl.s}%, {derivedHsl.l}%)</span>
                      <button onClick={() => copy(`hsl(${derivedHsl.h}, ${derivedHsl.s}%, ${derivedHsl.l}%)`, 'hsl')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600">
                        {copiedId === 'hsl' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-black text-slate-700 block mb-1">যেকোনো একটি বিন্যাসে কোড ইনপুট দিন:</span>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">HEX কোড:</label>
                  <input
                    type="text"
                    value={inputHex || ""}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none"
                    placeholder="যেমন: #3B82F6"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">RGB কোড:</label>
                  <input
                    type="text"
                    value={inputRgb || ""}
                    onChange={(e) => {
                      setInputRgb(e.target.value);
                      try {
                        const parts = e.target.value.split(',').map(p => parseInt(p.trim()));
                        if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
                          const hex = '#' + parts.map(p => p.toString(16).padStart(2, '0')).join('');
                          setColorHex(hex);
                          setInputHex(hex);
                          const hsl = rgbToHsl(parts[0], parts[1], parts[2]);
                          setInputHsl(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
                        }
                      } catch (err) {}
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none"
                    placeholder="যেমন: 59, 130, 246"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">HSL কোড:</label>
                  <input
                    type="text"
                    value={inputHsl || ""}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none"
                    placeholder="যেমন: 220, 90%, 60%"
                    disabled
                  />
                  <span className="text-[9px] text-slate-400 font-bold block mt-1">※ HSL ইনপুট লক করা আছে, HEX অথবা RGB দিয়ে ট্রাই করুন।</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                <span className="text-xs font-black text-slate-500 block uppercase tracking-wider text-center">রুপান্তরিত প্রিন্ট আউট</span>

                <div 
                  className="h-20 w-full rounded-2xl shadow-inner border border-black/10 flex items-center justify-center"
                  style={{ backgroundColor: colorHex }}
                />

                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <span className="text-slate-500 font-semibold">CMYK (প্রিন্টিং):</span>
                    <span className="font-mono font-bold">C:{derivedCmyk.c}% M:{derivedCmyk.m}% Y:{derivedCmyk.y}% K:{derivedCmyk.k}%</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <span className="text-slate-500 font-semibold">রঙের উজ্জ্বলতা:</span>
                    <span className="font-bold text-slate-700">
                      {derivedRgb.r * 0.299 + derivedRgb.g * 0.587 + derivedRgb.b * 0.114 > 128 ? 'হালকা রঙ (Light)' : 'গাঢ় রঙ (Dark)'}
                    </span>
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
// 8. UUID Generator (ইউইউআইডি জেনারেটর)
// ============================================================================
export function UUIDGenerator({ onGoBack }: { onGoBack: () => void }) {
  const [uuidCount, setUuidCount] = useState(1);
  const [isUppercase, setIsUppercase] = useState(false);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const { copiedId, copy } = useCopyToClipboard();

  const generateUuidV4 = () => {
    // Standard RFC4122 version 4 UUID generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleGenerate = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let uuid = generateUuidV4();
      if (isUppercase) {
        uuid = uuid.toUpperCase();
      }
      list.push(uuid);
    }
    setGeneratedUuids(list);
  };

  useEffect(() => {
    handleGenerate();
  }, [uuidCount, isUppercase]);

  return (
    <div id="uuid_generator_card" className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-teal-600 to-indigo-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Fingerprint className="w-6 h-6" /> UUID জেনারেটর (Version 4)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">স্মার্ট ইউটিলিটি</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 space-y-4">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">তৈরি করার পরিমাণ (Quantity):</label>
            <select
              value={uuidCount || ""}
              onChange={(e) => setUuidCount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none"
            >
              {[1, 5, 10, 20, 50].map(n => (
                <option key={n} value={n || ""}>{toBn(n)} টি</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <input
              id="uuid_case_checkbox"
              type="checkbox"
              checked={isUppercase}
              onChange={(e) => setIsUppercase(e.target.checked)}
              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="uuid_case_checkbox" className="text-xs font-bold text-slate-600">সব বড় হাতের অক্ষর (UPPERCASE) করুন</label>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <RefreshCw size={14} /> নতুন UUID জেনারেট করুন
          </button>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-xs font-semibold text-slate-500 leading-relaxed space-y-2">
            <span>💡 <strong>UUID কী?</strong></span>
            <p>UUID (Universally Unique Identifier) হলো একটি ১২৮-বিট সংখ্যার অনন্য আইডি যা কোনো সার্ভার বা কোর্ডিনেশন ছাড়াই গ্লোবাল ডেটাবেস এবং আইটেম সনাক্ত করতে ব্যবহৃত হয়।</p>
          </div>
        </div>

        <div className="md:col-span-6 flex flex-col bg-slate-50 rounded-2xl border border-slate-100 p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black text-slate-500 uppercase">ফলাফল তালিকা</span>
            {generatedUuids.length > 0 && (
              <button
                onClick={() => copy(generatedUuids.join('\n'), 'alluuid')}
                className="text-[10px] bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
              >
                {copiedId === 'alluuid' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copiedId === 'alluuid' ? 'সব কপি হয়েছে' : 'সব কপি করুন'}
              </button>
            )}
          </div>

          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 font-mono text-[10px] overflow-y-auto max-h-[250px] space-y-2 min-h-[180px] shadow-sm">
            {generatedUuids.map((uuid, i) => (
              <div key={i} className="flex justify-between items-center p-2 rounded hover:bg-slate-50 group border border-slate-100/50">
                <span className="text-slate-800 font-bold select-all">{uuid}</span>
                <button
                  onClick={() => copy(uuid, `uuid-${i}`)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-400 transition-opacity"
                  title="কপি"
                >
                  {copiedId === `uuid-${i}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 9 & 10. Ultimate Text Tools Suite (টেক্সট টুলস সুইট)
// ============================================================================
const bnWords0to99 = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
  'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
  'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'ঊনত্রিশ', 'ত্রিশ',
  'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ',
  'একচল্লিশ', 'বয়াল্লিশ', 'তেতাল্লিশ', 'চৌয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ',
  'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট',
  'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর', 'সত্তর',
  'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চৌয়াত্তর', 'পঁচাত্তর', 'ছেয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি', 'আশি',
  'একাশি', 'বিয়াশি', 'তিরাশি', 'চৌরাশি', 'পঁচাশি', 'ছেরাশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই', 'নব্বই',
  'একানব্বই', 'বিয়ানব্বই', 'তিরানব্বই', 'চৌরানব্বই', 'পঁচানব্বই', 'ছেনব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
];

function numberToBanglaWords(num: number): string {
  if (num === 0) return 'শূন্য';
  let isNegative = false;
  if (num < 0) {
    isNegative = true;
    num = Math.abs(num);
  }
  let result = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = Math.floor(num / 100);
  num %= 100;

  if (crore > 0) {
    result += numberToBanglaWords(crore) + ' কোটি ';
  }
  if (lakh > 0) {
    result += bnWords0to99[lakh] + ' লাখ ';
  }
  if (thousand > 0) {
    result += bnWords0to99[thousand] + ' হাজার ';
  }
  if (hundred > 0) {
    result += bnWords0to99[hundred] + ' শত ';
  }
  if (num > 0) {
    result += bnWords0to99[Math.floor(num)];
  }
  const finalStr = result.trim();
  return isNegative ? 'ঋণাত্মক ' + finalStr : finalStr;
}

function convertDecimalToBanglaWords(numStr: string): string {
  const cleanStr = numStr.replace(/,/g, '').trim();
  if (!/^-?\d+(\.\d+)?$/.test(cleanStr)) {
    return 'সঠিক সংখ্যা নয়';
  }
  const parts = cleanStr.split('.');
  const integerPart = parseInt(parts[0], 10);
  if (isNaN(integerPart)) {
    return 'সঠিক সংখ্যা নয়';
  }
  let bnWords = numberToBanglaWords(integerPart);
  if (parts.length > 1) {
    const decimalPart = parts[1];
    bnWords += ' দশমিক';
    const digitWords = ['শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
    for (let i = 0; i < decimalPart.length; i++) {
      const digit = parseInt(decimalPart[i], 10);
      if (!isNaN(digit)) {
        bnWords += ' ' + digitWords[digit];
      }
    }
  }
  return bnWords;
}

function enToBnDigits(str: string): string {
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (w) => bnNums[+w]);
}

function bnToEnDigits(str: string): string {
  const enNums: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (w) => enNums[w] || w);
}

interface DiffLine {
  type: 'added' | 'removed' | 'equal';
  text: string;
  originalLineNum?: number;
  modifiedLineNum?: number;
}

function getSimpleDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');
  const diff: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < origLines.length || j < modLines.length) {
    if (i < origLines.length && j < modLines.length) {
      if (origLines[i] === modLines[j]) {
        diff.push({
          type: 'equal',
          text: origLines[i],
          originalLineNum: i + 1,
          modifiedLineNum: j + 1
        });
        i++;
        j++;
      } else {
        let foundMatch = false;
        for (let look = 1; look <= 5; look++) {
          if (i + look < origLines.length && origLines[i + look] === modLines[j]) {
            for (let d = 0; d < look; d++) {
              diff.push({
                type: 'removed',
                text: origLines[i + d],
                originalLineNum: i + d + 1
              });
            }
            i += look;
            foundMatch = true;
            break;
          }
          if (j + look < modLines.length && origLines[i] === modLines[j + look]) {
            for (let a = 0; a < look; a++) {
              diff.push({
                type: 'added',
                text: modLines[j + a],
                modifiedLineNum: j + a + 1
              });
            }
            j += look;
            foundMatch = true;
            break;
          }
        }
        if (!foundMatch) {
          diff.push({
            type: 'removed',
            text: origLines[i],
            originalLineNum: i + 1
          });
          diff.push({
            type: 'added',
            text: modLines[j],
            modifiedLineNum: j + 1
          });
          i++;
          j++;
        }
      }
    } else if (i < origLines.length) {
      diff.push({
        type: 'removed',
        text: origLines[i],
        originalLineNum: i + 1
      });
      i++;
    } else if (j < modLines.length) {
      diff.push({
        type: 'added',
        text: modLines[j],
        modifiedLineNum: j + 1
      });
      j++;
    }
  }
  return diff;
}

export function TextCounterUtility({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'counter' | 'duplicate' | 'compare' | 'case' | 'number_bn'>('counter');

  // Common Notification State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const triggerCopy = async (text: string, key: string = 'default') => {
    await copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // 1. Word & Character Counter State
  const [counterText, setCounterText] = useState('');
  const totalCharacters = counterText.length;
  const charsNoSpaces = counterText.replace(/\s/g, '').length;
  const wordsArray = counterText.trim() ? counterText.trim().split(/\s+/) : [];
  const totalWords = wordsArray.length;
  const linesCount = counterText ? counterText.split('\n').length : 0;
  const sentencesCount = counterText ? (counterText.match(/[.!?।?]/g) || []).length || 1 : 0;
  const paragraphsCount = counterText ? counterText.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  const readingTime = Math.ceil(totalWords / 200);
  const speakingTime = Math.ceil(totalWords / 130);

  const getKeywordDensity = () => {
    if (!counterText.trim()) return [];
    const ignoreWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'ও', 'এবং', 'কিন্তু', 'করা', 'হয়', 'এই', 'যে', 'থেকে', 'হল', 'আছে'];
    const words = counterText.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()।?]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 1 && !ignoreWords.includes(w));
    const freq: Record<string, number> = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6);
  };
  const densities = getKeywordDensity();

  // 2. Remove Duplicate State
  const [dupText, setDupText] = useState('');
  const [dupMode, setDupMode] = useState<'lines' | 'words'>('lines');
  const [dupCaseSensitive, setDupCaseSensitive] = useState(false);
  const [dupTrimSpaces, setDupTrimSpaces] = useState(true);
  const [dupResult, setDupResult] = useState('');
  const [dupStats, setDupStats] = useState<{ original: number; remaining: number; removed: number } | null>(null);

  const handleRemoveDuplicates = () => {
    if (!dupText.trim()) return;
    let items: string[] = [];
    if (dupMode === 'lines') {
      items = dupText.split('\n');
    } else {
      items = dupText.trim().split(/\s+/);
    }
    const originalCount = items.length;
    if (dupTrimSpaces) {
      items = items.map(x => x.trim()).filter(Boolean);
    }
    const seen = new Set<string>();
    const uniqueItems: string[] = [];
    items.forEach(item => {
      const key = dupCaseSensitive ? item : item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      }
    });
    const resultText = dupMode === 'lines' ? uniqueItems.join('\n') : uniqueItems.join(' ');
    setDupResult(resultText);
    setDupStats({
      original: originalCount,
      remaining: uniqueItems.length,
      removed: originalCount - uniqueItems.length
    });
  };

  // 3. Text Compare State
  const [compText1, setCompText1] = useState('');
  const [compText2, setCompText2] = useState('');
  const [compDiff, setCompDiff] = useState<DiffLine[]>([]);
  const [hasCompared, setHasCompared] = useState(false);

  const handleCompare = () => {
    const diff = getSimpleDiff(compText1, compText2);
    setCompDiff(diff);
    setHasCompared(true);
  };

  // 4. Case Converter State
  const [caseText, setCaseText] = useState('');
  const handleCaseConvert = (mode: 'upper' | 'lower' | 'title' | 'sentence' | 'capitalize' | 'inverse') => {
    if (!caseText) return;
    let result = '';
    if (mode === 'upper') {
      result = caseText.toUpperCase();
    } else if (mode === 'lower') {
      result = caseText.toLowerCase();
    } else if (mode === 'title') {
      result = caseText.replace(/\b\w/g, c => c.toUpperCase());
    } else if (mode === 'sentence') {
      result = caseText.toLowerCase().replace(/(^\s*|[.!?।]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
    } else if (mode === 'capitalize') {
      result = caseText.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    } else if (mode === 'inverse') {
      result = caseText.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
    }
    setCaseText(result);
  };

  // 5. Number ↔ Bangla Converter State
  const [numInput, setNumInput] = useState('123456');
  const [bnDigitsResult, setBnDigitsResult] = useState('');
  const [bnWordsResult, setBnWordsResult] = useState('');
  const [enDigitsResult, setEnDigitsResult] = useState('');

  useEffect(() => {
    if (!numInput.trim()) {
      setBnDigitsResult('');
      setBnWordsResult('');
      setEnDigitsResult('');
      return;
    }

    // Is it containing Bangla Digits?
    const hasBanglaDigits = /[০-৯]/.test(numInput);
    
    // Convert to English Digits to feed the Word Engine
    const enDigits = bnToEnDigits(numInput);
    setEnDigitsResult(enDigits);

    // Convert to Bangla Digits
    const bnDigits = enToBnDigits(numInput);
    setBnDigitsResult(bnDigits);

    // Convert to Bangla Spelled Words
    const spelled = convertDecimalToBanglaWords(enDigits);
    setBnWordsResult(spelled);
  }, [numInput]);

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onGoBack} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-800">টেক্সট ও রাইটিং টুলস (Text Tools Suite)</h2>
            <p className="text-xs text-gray-500 font-bold">শব্দ গণনা, ডুপ্লিকেট রিমুভার, টেক্সট তুলনা, কেস কনভার্টার এবং সংখ্যা বানান রূপান্তর</p>
          </div>
        </div>
        <span className="text-xs bg-blue-50 text-blue-600 font-black px-3.5 py-1.5 rounded-full border border-blue-100/50 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-spin" /> ৭-ইন-১ ইউটিলিটি
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-[20px] overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => setActiveTab('counter')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-[12px] font-black shrink-0 transition-all ${
            activeTab === 'counter' 
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <Type className="w-4 h-4" /> শব্দ ও অক্ষর কাউন্টার
        </button>

        <button
          onClick={() => setActiveTab('duplicate')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-[12px] font-black shrink-0 transition-all ${
            activeTab === 'duplicate' 
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <Trash2 className="w-4 h-4" /> ডুপ্লিকেট রিমুভার
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-[12px] font-black shrink-0 transition-all ${
            activeTab === 'compare' 
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" /> টেক্সট তুলনা (Compare)
        </button>

        <button
          onClick={() => setActiveTab('case')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-[12px] font-black shrink-0 transition-all ${
            activeTab === 'case' 
              ? 'bg-white text-purple-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <CaseSensitive className="w-4 h-4" /> কেস কনভার্টার
        </button>

        <button
          onClick={() => setActiveTab('number_bn')}
          className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-[12px] font-black shrink-0 transition-all ${
            activeTab === 'number_bn' 
              ? 'bg-white text-amber-700 shadow-sm border border-slate-200/50' 
              : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <Binary className="w-4 h-4" /> সংখ্যা ↔ বাংলা বানান
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        <AnimatePresence mode="wait">
          {/* Tab 1: Word & Character Counter */}
          {activeTab === 'counter' && (
            <motion.div
              key="counter"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              <div className="md:col-span-8 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] font-black text-slate-700">এখানে আপনার লেখা বা অনুচ্ছেদ পেস্ট করুন:</label>
                  {counterText && (
                    <button
                      onClick={() => setCounterText('')}
                      className="text-[11px] text-rose-500 font-bold hover:underline"
                    >
                      লেখা মুছুন
                    </button>
                  )}
                </div>
                <textarea
                  value={counterText || ""}
                  onChange={(e) => setCounterText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-64 transition-all"
                  placeholder="প্যারাগ্রাফ টাইপ করুন বা পেস্ট করুন..."
                />

                {/* Main counters metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 text-center">
                    <span className="text-[10px] font-black text-slate-400 block">মোট ক্যারেক্টার</span>
                    <span className="text-xl font-black text-blue-700 block mt-1">{toBn(totalCharacters)}</span>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3.5 text-center">
                    <span className="text-[10px] font-black text-slate-400 block">মোট শব্দ</span>
                    <span className="text-xl font-black text-indigo-700 block mt-1">{toBn(totalWords)}</span>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 text-center">
                    <span className="text-[10px] font-black text-slate-400 block">স্পেস ছাড়া ক্যারেক্টার</span>
                    <span className="text-xl font-black text-emerald-700 block mt-1">{toBn(charsNoSpaces)}</span>
                  </div>
                </div>
              </div>

              {/* Sidebar metrics & Density */}
              <div className="md:col-span-4 space-y-4">
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                  <span className="text-[12px] font-black text-slate-700 block border-b border-slate-200/60 pb-2">📋 লেখা বিশ্লেষণ মেট্রিক্স</span>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between font-bold text-slate-600">
                      <span>বাক্য সংখ্যা (Sentences):</span>
                      <span className="font-black text-slate-800">{toBn(sentencesCount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-600">
                      <span>অনুচ্ছেদ (Paragraphs):</span>
                      <span className="font-black text-slate-800">{toBn(paragraphsCount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-600">
                      <span>লাইন সংখ্যা (Lines):</span>
                      <span className="font-black text-slate-800">{toBn(linesCount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-600">
                      <span>পড়ার সময় (Reading Time):</span>
                      <span className="font-black text-slate-800">≈ {toBn(readingTime)} মিনিট</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-600">
                      <span>বলার সময় (Speaking Time):</span>
                      <span className="font-black text-slate-800">≈ {toBn(speakingTime)} মিনিট</span>
                    </div>
                  </div>

                  {densities.length > 0 && (
                    <div className="border-t border-slate-200/60 pt-3 space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ঘন ঘন ব্যবহৃত শব্দ (Word Density)</span>
                      <div className="grid grid-cols-2 gap-2">
                        {densities.map(([word, freq]) => (
                          <div key={word} className="flex justify-between items-center text-[11px] font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
                            <span className="truncate max-w-[70px]">{word}</span>
                            <span className="text-blue-600 shrink-0">{toBn(freq)} বার</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Remove Duplicate Lines/Words */}
          {activeTab === 'duplicate' && (
            <motion.div
              key="duplicate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Input Panel */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] font-black text-slate-700">মূল ডাটা / টেক্সট পেস্ট করুন:</label>
                    {dupText && (
                      <button onClick={() => setDupText('')} className="text-[11px] text-rose-500 font-bold hover:underline">
                        মুছে ফেলুন
                      </button>
                    )}
                  </div>
                  <textarea
                    value={dupText || ""}
                    onChange={(e) => setDupText(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 h-60"
                    placeholder="প্রতি লাইনে একটি করে লেখা লিখুন বা টেক্সট পেস্ট করুন..."
                  />

                  {/* Settings Panel */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Mode selection */}
                      <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="dupMode"
                          checked={dupMode === 'lines'}
                          onChange={() => setDupMode('lines')}
                          className="accent-emerald-600"
                        />
                        লাইন মুছুন (Lines)
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="dupMode"
                          checked={dupMode === 'words'}
                          onChange={() => setDupMode('words')}
                          className="accent-emerald-600"
                        />
                        শব্দ মুছুন (Words)
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Case sensitive */}
                      <label className="flex items-center gap-1.5 text-xs font-black text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dupCaseSensitive}
                          onChange={(e) => setDupCaseSensitive(e.target.checked)}
                          className="rounded text-emerald-600 accent-emerald-600"
                        />
                        কেস সেনসিটিভ
                      </label>
                      {/* Trim */}
                      <label className="flex items-center gap-1.5 text-xs font-black text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dupTrimSpaces}
                          onChange={(e) => setDupTrimSpaces(e.target.checked)}
                          className="rounded text-emerald-600 accent-emerald-600"
                        />
                        স্পেস ছাঁটাই করুন
                      </label>
                    </div>

                    <button
                      onClick={handleRemoveDuplicates}
                      disabled={!dupText.trim()}
                      className="bg-[#009664] hover:bg-[#007f54] text-white font-black text-[12px] px-5 py-2 rounded-xl transition-all disabled:opacity-40 shadow-sm"
                    >
                      ডুপ্লিকেট রিমুভ করুন
                    </button>
                  </div>
                </div>

                {/* Result Panel */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] font-black text-slate-700">ফলাফল (Cleaned Output):</label>
                    {dupResult && (
                      <button
                        onClick={() => triggerCopy(dupResult, 'dup')}
                        className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'dup' ? 'কপি হয়েছে!' : 'ফলাফল কপি করুন'}
                      </button>
                    )}
                  </div>

                  <textarea
                    readOnly
                    value={dupResult || ""}
                    rows={8}
                    className="w-full bg-emerald-50/10 border border-emerald-100 rounded-2xl p-4 text-[13px] font-semibold text-slate-800 focus:outline-none h-60"
                    placeholder="ডুপ্লিকেট মুক্ত টেক্সট এখানে প্রদর্শিত হবে..."
                  />

                  {/* Statistics */}
                  {dupStats && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                        <span className="text-[10px] font-bold text-slate-400 block">আগে ছিল</span>
                        <span className="text-sm font-black text-slate-700 block mt-0.5">{toBn(dupStats.original)}টি</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center">
                        <span className="text-[10px] font-bold text-emerald-500 block">ডুপ্লিকেট মুক্ত</span>
                        <span className="text-sm font-black text-emerald-700 block mt-0.5">{toBn(dupStats.remaining)}টি</span>
                      </div>
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-center">
                        <span className="text-[10px] font-bold text-rose-500 block">বাদ পড়েছে</span>
                        <span className="text-sm font-black text-rose-700 block mt-0.5">{toBn(dupStats.removed)}টি</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Text Compare */}
          {activeTab === 'compare' && (
            <motion.div
              key="compare"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              {/* Inputs side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-slate-500">১ম টেক্সট (মূল লেখা - Original):</label>
                  <textarea
                    value={compText1 || ""}
                    onChange={(e) => setCompText1(e.target.value)}
                    rows={5}
                    placeholder="প্রথম বা আদি সংস্করণ পেস্ট করুন..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[12.5px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-black text-slate-500">২য় টেক্সট (পরিবর্তিত লেখা - Modified):</label>
                  <textarea
                    value={compText2 || ""}
                    onChange={(e) => setCompText2(e.target.value)}
                    rows={5}
                    placeholder="দ্বিতীয় বা নতুন সংস্করণ পেস্ট করুন..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[12.5px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleCompare}
                  disabled={!compText1.trim() && !compText2.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[13px] px-8 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/15 disabled:opacity-40"
                >
                  টেক্সট তুলনা করুন (Compare)
                </button>
              </div>

              {/* Compare Output */}
              {hasCompared && (
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-black text-slate-800 flex items-center gap-1.5">
                      🕵️ তুলনামূলক ফলাফল (Difference View):
                    </span>
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded bg-emerald-100" /> যুক্ত করা হয়েছে (+)</span >
                      <span className="flex items-center gap-1 text-rose-600"><span className="w-2.5 h-2.5 rounded bg-rose-100" /> বাদ দেওয়া হয়েছে (-)</span >
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 font-mono text-[12px] p-4 text-slate-100 max-h-96 overflow-y-auto space-y-1">
                    {compDiff.length === 0 ? (
                      <p className="text-slate-400 text-center py-6">দুটি লেখাই হুবহু এক!</p>
                    ) : (
                      compDiff.map((line, idx) => {
                        let bgClass = '';
                        let prefix = ' ';
                        if (line.type === 'added') {
                          bgClass = 'bg-emerald-950/60 text-emerald-300 border-l-4 border-emerald-500 pl-1.5';
                          prefix = '+';
                        } else if (line.type === 'removed') {
                          bgClass = 'bg-rose-950/60 text-rose-300 border-l-4 border-rose-500 pl-1.5';
                          prefix = '-';
                        } else {
                          bgClass = 'text-slate-400 pl-2.5';
                        }

                        return (
                          <div key={idx} className={`py-0.5 flex gap-3 rounded ${bgClass}`}>
                            <span className="text-[10px] text-slate-500 w-10 text-right select-none">
                              {line.originalLineNum ? toBn(line.originalLineNum) : ''}
                              {line.modifiedLineNum ? `→${toBn(line.modifiedLineNum)}` : ''}
                            </span>
                            <span className="text-slate-500 select-none">{prefix}</span>
                            <span className="break-all whitespace-pre-wrap">{line.text || ' '}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 4: Case Converter */}
          {activeTab === 'case' && (
            <motion.div
              key="case"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-black text-slate-700">ইংরেজি টেক্সট এখানে পেস্ট করুন:</label>
                {caseText && (
                  <button onClick={() => setCaseText('')} className="text-[11px] text-rose-500 font-bold hover:underline">
                    মুছে ফেলুন
                  </button>
                )}
              </div>

              <textarea
                value={caseText || ""}
                onChange={(e) => setCaseText(e.target.value)}
                rows={6}
                placeholder="ইংরেজি প্যারাগ্রাফ পেস্ট করুন। নিচের বাটনগুলো ক্লিক করে তাৎক্ষণিক কেস পরিবর্তন করতে পারবেন..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 h-48"
              />

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <button
                  onClick={() => handleCaseConvert('upper')}
                  disabled={!caseText.trim()}
                  className="bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-black text-[11px] py-2.5 px-3 rounded-xl transition-all border border-purple-100 disabled:opacity-40"
                >
                  UPPERCASE (বড় হরফ)
                </button>
                <button
                  onClick={() => handleCaseConvert('lower')}
                  disabled={!caseText.trim()}
                  className="bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-black text-[11px] py-2.5 px-3 rounded-xl transition-all border border-purple-100 disabled:opacity-40"
                >
                  lowercase (ছোট হরফ)
                </button>
                <button
                  onClick={() => handleCaseConvert('title')}
                  disabled={!caseText.trim()}
                  className="bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-black text-[11px] py-2.5 px-3 rounded-xl transition-all border border-purple-100 disabled:opacity-40"
                >
                  Title Case (টাইটেল)
                </button>
                <button
                  onClick={() => handleCaseConvert('sentence')}
                  disabled={!caseText.trim()}
                  className="bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-black text-[11px] py-2.5 px-3 rounded-xl transition-all border border-purple-100 disabled:opacity-40"
                >
                  Sentence Case (বাক্য)
                </button>
                <button
                  onClick={() => handleCaseConvert('capitalize')}
                  disabled={!caseText.trim()}
                  className="bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-black text-[11px] py-2.5 px-3 rounded-xl transition-all border border-purple-100 disabled:opacity-40"
                >
                  Capitalize Words
                </button>
                <button
                  onClick={() => handleCaseConvert('inverse')}
                  disabled={!caseText.trim()}
                  className="bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-black text-[11px] py-2.5 px-3 rounded-xl transition-all border border-purple-100 disabled:opacity-40"
                >
                  iNvErSe CaSe (উল্টানো)
                </button>
              </div>

              {caseText && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => triggerCopy(caseText, 'case')}
                    className="bg-[#009664] hover:bg-[#007f54] text-white font-black text-[12px] px-5 py-2 rounded-lg transition-all"
                  >
                    {copiedKey === 'case' ? 'কপি হয়েছে!' : 'পরিবর্তিত টেক্সট কপি করুন'}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 5: Number ↔ Bangla Converter */}
          {activeTab === 'number_bn' && (
            <motion.div
              key="number_bn"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5"
            >
              {/* Input section */}
              <div>
                <label className="block text-[12px] font-black text-slate-500 mb-1.5">এখানে কোনো সংখ্যা বা ডিজিট লিখুন (ইংরেজী বা বাংলায়):</label>
                <input
                  type="text"
                  value={numInput || ""}
                  onChange={(e) => setNumInput(e.target.value)}
                  placeholder="উদা: ১২৩.৪৫ অথবা 987654"
                  className="w-full border border-slate-200 rounded-xl bg-slate-50 p-3 text-[16px] font-black text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Translation Panels Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Spelled Words Bengali Output */}
                <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-4.5 space-y-2">
                  <div className="flex justify-between items-center border-b border-amber-100 pb-1.5">
                    <span className="text-[11.5px] font-black text-amber-800">🗣️ বাংলা বানান (Spelled Out words)</span>
                    {bnWordsResult && (
                      <button
                        onClick={() => triggerCopy(bnWordsResult, 'bn_words')}
                        className="text-[10px] text-amber-700 font-bold hover:underline"
                      >
                        {copiedKey === 'bn_words' ? 'কপি হয়েছে' : 'কপি করুন'}
                      </button>
                    )}
                  </div>
                  <p className="text-[15px] font-black text-slate-800 select-all min-h-[30px] flex items-center">
                    {bnWordsResult || '---'}
                  </p>
                </div>

                {/* Bangla Digits Output */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                    <span className="text-[11.5px] font-black text-slate-700">১২৩ বাংলা লিপি (Bangla Digits)</span>
                    {bnDigitsResult && (
                      <button
                        onClick={() => triggerCopy(bnDigitsResult, 'bn_digits')}
                        className="text-[10px] text-slate-600 font-bold hover:underline"
                      >
                        {copiedKey === 'bn_digits' ? 'কপি হয়েছে' : 'কপি করুন'}
                      </button>
                    )}
                  </div>
                  <p className="text-[16px] font-black text-slate-800 select-all min-h-[30px] flex items-center">
                    {bnDigitsResult || '---'}
                  </p>
                </div>

                {/* English Digits Output */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                    <span className="text-[11.5px] font-black text-slate-700">123 ইংরেজি লিপি (English Digits)</span>
                    {enDigitsResult && (
                      <button
                        onClick={() => triggerCopy(enDigitsResult, 'en_digits')}
                        className="text-[10px] text-slate-600 font-bold hover:underline"
                      >
                        {copiedKey === 'en_digits' ? 'কপি হয়েছে' : 'কপি করুন'}
                      </button>
                    )}
                  </div>
                  <p className="text-[16px] font-black text-slate-800 select-all min-h-[30px] flex items-center">
                    {enDigitsResult || '---'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
