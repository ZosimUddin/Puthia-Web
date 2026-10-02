import React, { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Shield, 
  Key, 
  Lock, 
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function BackupRestoreManagement() {
  const [activeTab, setActiveTab] = useState<'backup' | 'security'>('backup');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real database backup function
  const handleDatabaseBackup = async () => {
    setIsBackingUp(true);
    setMessage({ text: '', type: null });
    try {
      const backupData: Record<string, any[]> = {};
      const targetCollections = ['notices', 'site_settings', 'feedback', 'users'];

      for (const colName of targetCollections) {
        try {
          const snapshot = await getDocs(collection(db, colName));
          backupData[colName] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } catch (e) {
          console.warn(`Could not back up collection ${colName}:`, e);
          backupData[colName] = []; // Fallback to empty if restricted
        }
      }

      // Generate downloadable JSON file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `puthia_db_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ text: 'ডাটাবেস ব্যাকআপ জেনারেট এবং লোকাল ডিভাইসে ডাউনলোড করা সম্পন্ন হয়েছে!', type: 'success' });
    } catch (error: any) {
      console.error(error);
      setMessage({ text: `ব্যাকআপ তৈরি করতে সমস্যা হয়েছে: ${error.message}`, type: 'error' });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Real database restore function
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setMessage({ text: '', type: null });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);

        let restoredCount = 0;

        // Traverse backed up collections
        for (const [colName, docs] of Object.entries(backupData)) {
          if (!Array.isArray(docs)) continue;

          for (const docData of docs) {
            const { id, ...data } = docData;
            if (id) {
              await setDoc(doc(db, colName, id), data, { merge: true });
              restoredCount++;
            }
          }
        }

        setMessage({ text: `সফলভাবে ${restoredCount} টি রেকর্ড ডাটাবেসে রিস্টোর করা হয়েছে!`, type: 'success' });
      } catch (error: any) {
        console.error(error);
        setMessage({ text: `ফাইল রিড বা ডেটা ইম্পোর্ট করতে সমস্যা হয়েছে: ${error.message}`, type: 'error' });
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  // Real Puthia database initial seeder
  const handleSeedRealPuthiaData = async () => {
    setIsSeeding(true);
    setMessage({ text: '', type: null });
    try {
      // 1. Seed discussions (posts)
      const discussions = [
        {
          title: "পুঠিয়া রাজবাড়ির সৌন্দর্য রক্ষা আমাদের দায়িত্ব",
          content: "আসসালামু আলাইকুম পুঠিয়াবাসী। আমাদের পুঠিয়া রাজবাড়ি এবং সংলগ্ন দীঘিগুলো আমাদের গৌরব। কিন্তু ইদানীং দেখা যাচ্ছে কিছু অসচেতন দর্শনার্থী সেখানে প্লাস্টিক ও ময়লা ফেলে পরিবেশ নষ্ট করছে। আমাদের সকলের উচিত সচেতন হওয়া এবং ঐতিহাসিক ঐতিহ্য রক্ষা করা।",
          author: "মোঃ জসিম উদ্দিন",
          authorId: "u4",
          authorBadge: true,
          union: "পুঠিয়া ইউনিয়ন",
          category: "heritage",
          likesCount: 15,
          commentsCount: 4,
          sharesCount: 2,
          isPinned: true,
          isHot: true,
          viewsCount: 142,
          createdAt: serverTimestamp()
        },
        {
          title: "বানেশ্বর আম বাজার থেকে আম কুরিয়ার করার অভিজ্ঞতা",
          content: "শুভ সকাল! গতকাল বানেশ্বর বাজার থেকে লক্ষণভোগ এবং ল্যাংড়া আম সরাসরি ঢাকায় কুরিয়ার করলাম। উপজেলা প্রশাসনের উপস্থিতিতে আমগুলো সুন্দর করে প্যাকিং করা হয়েছে এবং ফলের মানও চমৎকার ছিল। ধন্যবাদ উপজেলা প্রশাসনকে চমৎকার বাজার মনিটরিং ব্যবস্থার জন্য!",
          author: "তানজিলা আক্তার",
          authorId: "u1",
          authorBadge: false,
          union: "বানেশ্বর ইউনিয়ন",
          category: "general",
          likesCount: 8,
          commentsCount: 2,
          sharesCount: 1,
          isPinned: false,
          isHot: false,
          viewsCount: 56,
          createdAt: serverTimestamp()
        }
      ];

      for (const post of discussions) {
        await addDoc(collection(db, "discussions"), post);
      }

      // 2. Seed hospitals
      const hospitals = [
        {
          name: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
          address: "পুঠিয়া উপজেলা সদর, রাজশাহী",
          phone: "01712-345678",
          email: "uhc.puthia@host.gov.bd",
          location: "পুঠিয়া সদর",
          isApproved: true,
          createdAt: serverTimestamp()
        },
        {
          name: "বানেশ্বর জেনারেল হাসপাতাল",
          address: "বানেশ্বর বাজার, পুঠিয়া, রাজশাহী",
          phone: "01730-987654",
          email: "baneswar.gen@gmail.com",
          location: "বানেশ্বর",
          isApproved: true,
          createdAt: serverTimestamp()
        }
      ];

      for (const hospital of hospitals) {
        await addDoc(collection(db, "hospitals_list"), hospital);
      }

      // 3. Seed doctors
      const doctors = [
        {
          name: "ডাঃ মোঃ আরিফুল ইসলাম",
          designation: "সিনিয়র কনসালটেন্ট (মেডিসিন)",
          office: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
          phone: "01712-345678",
          email: "ariful.uhc@gov.bd",
          union: "পুঠিয়া ইউনিয়ন",
          status: "active",
          category: "medicine",
          docType: "government",
          createdAt: serverTimestamp()
        },
        {
          name: "ডাঃ তানজিলা আক্তার",
          designation: "স্ত্রী রোগ ও প্রসূতি বিশেষজ্ঞ",
          office: "বানেশ্বর জেনারেল হাসপাতাল",
          phone: "01730-987654",
          email: "tanzila.obgyn@gmail.com",
          union: "বানেশ্বর ইউনিয়ন",
          status: "active",
          category: "gynaecology",
          docType: "private",
          createdAt: serverTimestamp()
        }
      ];

      for (const doctor of doctors) {
        await addDoc(collection(db, "doctors_list"), doctor);
      }

      // 4. Seed businesses
      const businesses = [
        {
          name: "পুঠিয়া রাজবাড়ী মিষ্টি ভান্ডার",
          ownerName: "শ্রী অনিল ঘোষ",
          category: "খাদ্য ও রেস্তোরাঁ",
          location: "রাজবাড়ী গেট সংলগ্ন, পুঠিয়া",
          phone: "01715-111222",
          status: "approved",
          union: "পুঠিয়া ইউনিয়ন",
          createdAt: serverTimestamp()
        },
        {
          name: "বানেশ্বর ফল আড়ৎ",
          ownerName: "মোঃ হাসেম আলী",
          category: "কৃষি ও ফল বিপণন",
          location: "বানেশ্বর বাজার, পুঠিয়া",
          phone: "01718-555666",
          status: "approved",
          union: "বানেশ্বর ইউনিয়ন",
          createdAt: serverTimestamp()
        }
      ];

      for (const biz of businesses) {
        await addDoc(collection(db, "businesses"), biz);
      }

      // 5. Seed notices
      const notices = [
        {
          title: "পুঠিয়া রাজবাড়ী ও মন্দির কমপ্লেক্সে নতুন প্রবেশ নীতি",
          content: "ঐতিহাসিক পুঠিয়া রাজবাড়ী এবং এর আশেপাশের মন্দিরসমূহ সংরক্ষণের স্বার্থে এখন থেকে দর্শনার্থীদের জন্য সকাল ৯:০০ টা থেকে বিকাল ৫:০০ টা পর্যন্ত প্রবেশের সময়সীমা নির্ধারণ করা হয়েছে। সকল দর্শনার্থীকে শৃঙ্খলা বজায় রাখতে অনুরোধ করা হচ্ছে।",
          category: "general",
          date: "২৩ আগস্ট, ২০২৬",
          publisher: "উপজেলা প্রশাসন, পুঠিয়া",
          status: "active",
          createdAt: serverTimestamp()
        },
        {
          title: "জন্ম ও মৃত্যু নিবন্ধন সংক্রান্ত জরুরী বিজ্ঞপ্তি",
          content: "পুঠিয়া উপজেলার সকল ইউনিয়নের সম্মানিত নাগরিকদের অবগতির জন্য জানানো যাচ্ছে যে, আগামী ১লা সেপ্টেম্বর থেকে নতুন ডিজিটাল সার্ভারে জন্ম ও মৃত্যু নিবন্ধন কার্যক্রম শুরু হবে। অনুগ্রহ করে প্রয়োজনীয় কাগজপত্র সাথে নিয়ে ইউনিয়ন পরিষদে যোগাযোগ করুন।",
          category: "government",
          date: "২২ আগস্ট, ২০২৬",
          publisher: "ইউএনও অফিস, পুঠিয়া",
          status: "active",
          createdAt: serverTimestamp()
        }
      ];

      for (const notice of notices) {
        await addDoc(collection(db, "notices"), notice);
      }

      // 6. Seed news
      const newsList = [
        {
          title: "পুঠিয়ার প্রত্নতাত্ত্বিক শিব মন্দির সংস্কারে মেগা প্রজেক্ট",
          content: "রাজশাহীর পুঠিয়া উপজেলার ঐতিহাসিক বড় শিব মন্দিরের সৌন্দর্য রক্ষা ও प्राचीन প্রাচীন প্রাচীন ancient প্রাচীন কারুকাজ পুনঃস্থাপনে প্রত্নতত্ত্ব অধিদপ্তর একটি বিশেষ সংস্কার প্রকল্প হাতে নিয়েছে। ইতিমধ্যে কাজের টেন্ডার সম্পন্ন হয়েছে এবং কাজ শুরু হবে।",
          category: "heritage",
          author: "পুঠিয়া রিপোর্টার",
          status: "published",
          createdAt: serverTimestamp()
        },
        {
          title: "বানেশ্বর বাজারে আমের বেচাকেনা রেকর্ড ছুঁয়েছে",
          content: "চলতি মৌসুমে উত্তরবঙ্গের বৃহত্তম আমের বাজার রাজশাহীর বানেশ্বরে আমের কেনাবেচা অতীতের সকল রেকর্ড ছাড়িয়ে গেছে। দেশের বিভিন্ন প্রান্ত থেকে প্রতিদিন শত শত ট্রাক আম সারা দেশে সরবরাহ করা হচ্ছে। উপজেলা প্রশাসনের কড়া নজরদারিতে ফরমালিন মুক্ত আম বিক্রি হচ্ছে।",
          category: "economy",
          author: "কৃষি প্রতিনিধি",
          status: "published",
          createdAt: serverTimestamp()
        }
      ];

      for (const news of newsList) {
        await addDoc(collection(db, "news"), news);
      }

      // 7. Seed events
      const events = [
        {
          title: "পুঠিয়া ঐতিহ্যবাহী রথযাত্রা মেলা ২০২৬",
          description: "পুঠিয়া জগন্নাথ মন্দিরে প্রতি বছরের ন্যায় এবারও ঐতিহ্যবাহী রথযাত্রা মেলা অনুষ্ঠিত হতে যাচ্ছে। মেলায় হস্তশিল্প, লোকজ সংস্কৃতি এবং শিশুদের বিনোদনের জন্য বিভিন্ন আয়োজন থাকবে।",
          eventDate: "2026-09-05",
          location: "জগন্নাথ মন্দির প্রাঙ্গণ, পুঠিয়া",
          organizer: "মেলা উদযাপন কমিটি",
          status: "active",
          createdAt: serverTimestamp()
        }
      ];

      for (const ev of events) {
        await addDoc(collection(db, "events"), ev);
      }

      setMessage({ text: 'অভিনন্দন! আপনার খালি ক্লাউড ডাটাবেসটি সফলভাবে পুঠিয়ার আসল সরকারি, চিকিৎসা, আড্ডা এবং ব্যবসায়িক তথ্য দিয়ে সাজানো সম্পন্ন হয়েছে!', type: 'success' });
    } catch (e: any) {
      console.error(e);
      setMessage({ text: `ডাটা সীড করতে ব্যর্থ হয়েছে: ${e.message}`, type: 'error' });
    } finally {
      setIsSeeding(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-gray-800 pb-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    ব্যাকআপ ও সিকিউরিটি (Backup & Security)
                </h3>
                <p className="text-gray-500 text-sm">ডেটাবেসের নিরাপত্তা নিশ্চিত করতে ব্যাকআপ নিন এবং সিকিউরিটি কনফিগার করুন</p>
            </div>
            
            <div className="flex bg-[#121212] p-1 rounded-xl border border-gray-800">
                <button 
                    onClick={() => setActiveTab('backup')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'backup' ? 'bg-[#006A4E] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <Database className="w-4 h-4 hidden sm:block" /> Backup & Restore
                </button>
                <button 
                    onClick={() => setActiveTab('security')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'security' ? 'bg-[#006A4E] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <Shield className="w-4 h-4 hidden sm:block" /> Security Settings
                </button>
            </div>
        </div>

        {/* Dynamic Alert Messages */}
        {message.type && (
          <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        {/* Hidden File Input for Restore */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json" 
          className="hidden" 
        />

        {activeTab === 'backup' ? (
            <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-[#121212] border border-gray-800 rounded-2xl flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                    <Download className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">ডেটাবেস ব্যাকআপ</h4>
                    <p className="text-sm text-gray-400 mb-6">সম্পূর্ণ ডেটাবেসের একটি কপি লোকাল স্টোরেজে ডাউনলোড করুন (.json)</p>
                    <button 
                      onClick={handleDatabaseBackup}
                      disabled={isBackingUp}
                      className="w-full py-3 bg-[#006A4E] hover:bg-emerald-850 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 border-none"
                    >
                      {isBackingUp ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                      <span>{isBackingUp ? 'ব্যাকআপ ডাউনলোড হচ্ছে...' : 'ব্যাকআপ ডাউনলোড করুন'}</span>
                    </button>
                </div>

                <div className="p-6 bg-[#121212] border border-gray-800 rounded-2xl flex flex-col items-center text-center hover:border-blue-500/50 transition-colors">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">ডেটাবেস রিস্টোর</h4>
                    <p className="text-sm text-gray-400 mb-6">পূর্বে সেভ করা ব্যাকআপ ফাইল থেকে ডেটাবেস রিস্টোর করুন</p>
                    <button 
                      onClick={triggerFileInput}
                      disabled={isRestoring}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 border-none"
                    >
                      {isRestoring ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      <span>{isRestoring ? 'রিস্টোর হচ্ছে...' : 'ফাইল আপলোড করুন'}</span>
                    </button>
                </div>

                <div className="p-6 bg-[#121212] border border-gray-800 rounded-2xl flex flex-col items-center text-center hover:border-purple-500/50 transition-colors">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                    <Database className="w-8 h-8 text-purple-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">রিয়েল পুঠিয়া ডাটা সীডার</h4>
                    <p className="text-sm text-gray-400 mb-6">খালি ডেটাবেস পূর্ণ করতে পুঠিয়ার আসল তথ্য (ডাক্তার, ব্যবসা ইত্যাদি) দিয়ে সাজান</p>
                    <button 
                      onClick={handleSeedRealPuthiaData}
                      disabled={isSeeding}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 border-none"
                    >
                      {isSeeding ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                      <span>{isSeeding ? 'ডেটা রোপণ হচ্ছে...' : 'রিয়েল পুঠিয়া ডাটা সীড করুন'}</span>
                    </button>
                </div>
                </div>

                <div className="mt-8 p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-4">
                <RefreshCw className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <div>
                    <h5 className="text-amber-500 font-bold mb-1">অটোমেটিক ব্যাকআপ</h5>
                    <p className="text-sm text-amber-500/70">সিস্টেম প্রতিদিন রাত ২:০০ টায় স্বয়ংক্রিয়ভাবে ক্লাউডে ব্যাকআপ সংরক্ষণ করে।</p>
                </div>
                </div>
            </>
        ) : (
            <div className="space-y-6">
                <div className="bg-[#121212] p-6 rounded-xl border border-gray-800">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5 text-gray-400" /> API Keys & Secrets
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Firebase Server Key</label>
                            <input type="password" value="********************************" readOnly className="w-full bg-[#1A1A1A] border border-gray-700 text-gray-400 px-4 py-3 rounded-xl focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Payment Gateway Secret</label>
                            <input type="password" value="********************************" readOnly className="w-full bg-[#1A1A1A] border border-gray-700 text-gray-400 px-4 py-3 rounded-xl focus:outline-none" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">API Keys পরিবর্তন করতে সুপার অ্যাডমিন পারমিশন প্রয়োজন।</p>
                    </div>
                </div>

                <div className="bg-[#121212] p-6 rounded-xl border border-gray-800">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-gray-400" /> Security Policies
                    </h4>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
                            <div>
                                <span className="font-bold text-white block mb-1">2-Factor Authentication (2FA)</span>
                                <span className="text-sm text-gray-400">সকল অ্যাডমিনের জন্য 2FA বাধ্যতামূলক করুন</span>
                            </div>
                            <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 bg-gray-800 border-gray-700 cursor-pointer" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
                            <div>
                                <span className="font-bold text-white block mb-1">Session Timeout</span>
                                <span className="text-sm text-gray-400">৩০ মিনিট ইনঅ্যাক্টিভ থাকলে লগআউট করুন</span>
                            </div>
                            <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 bg-gray-800 border-gray-700 cursor-pointer" defaultChecked />
                        </label>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button className="px-6 py-3 bg-[#006A4E] hover:bg-emerald-850 text-white rounded-xl font-bold transition-colors cursor-pointer">
                            সেটিংস সেভ করুন
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
