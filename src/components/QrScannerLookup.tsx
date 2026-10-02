import React, { useState } from "react";
import { ArrowLeft, QrCode, Search, Sparkles, Upload, HelpCircle, User, CheckCircle2, Phone, AlertCircle } from "lucide-react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";

interface QrScannerLookupProps {
  onGoBack: () => void;
  onProfileSelect: (uid: string) => void;
}

export const QrScannerLookup: React.FC<QrScannerLookupProps> = ({ onGoBack, onProfileSelect }) => {
  const [manualId, setManualId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanTab, setScanTab] = useState<'camera' | 'search'>('camera');
  const [simulatingScan, setSimulatingScan] = useState(false);

  // Hardcoded known citizen mock examples for instant offline scanning simulations
  const demoCitizens = [
    { uid: "demo_jasim", name: "জসিম উদ্দিন", phone: "01712-874512", village: "জিউপাড়া", union: "পুঠিয়া", points: 120, bloodGroup: "O+", label: "🥉 সিলভার সিটিজেন" },
    { uid: "demo_shafiq", name: "শফিকুল আলম", phone: "01711-234567", village: "বানেশ্বর বাজার", union: "বানেশ্বর", points: 280, bloodGroup: "A+", label: "🥇 গোল্ডেন সিটিজেন" },
    { uid: "demo_taslima", name: "মোছা: তাসলিমা খাতুন", phone: "01912-998877", village: "বেলপুকুর", union: "বেলপুকুর", points: 550, bloodGroup: "B+", label: "👑 সুপার সিটিজেন" }
  ];

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSearchResults([]);

    const cleanId = manualId.trim().toUpperCase();
    if (!cleanId) return;

    setSearching(true);
    try {
      // If it starts with PUT-
      let targetUid = cleanId;
      if (cleanId.startsWith("PUT-")) {
        targetUid = cleanId.replace("PUT-", "").toLowerCase();
      }

      // 1. Check if matches any demo ID
      const demoMatch = demoCitizens.find(c => c.uid.endsWith(targetUid.toLowerCase()) || c.uid === targetUid);
      if (demoMatch) {
        onProfileSelect(demoMatch.uid);
        setSearching(false);
        return;
      }

      // 2. Query Firestore by UID starting matches or partial search
      // To perform a robust query, let's search users where name or phone or uid exists
      const usersRef = collection(db, "users");
      const q = query(usersRef, limit(15));
      const querySnapshot = await getDocs(q);
      
      const found: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const shortId = docSnap.id.substring(0, 6).toUpperCase();
        const isUidMatch = docSnap.id.toLowerCase() === targetUid.toLowerCase() || shortId === cleanId;
        const isNameMatch = d.name && d.name.toLowerCase().includes(targetUid.toLowerCase());
        const isPhoneMatch = d.phone && d.phone.includes(targetUid);

        if (isUidMatch || isNameMatch || isPhoneMatch) {
          found.push({
            uid: docSnap.id,
            ...d
          });
        }
      });

      if (found.length > 0) {
        if (found.length === 1) {
          onProfileSelect(found[0].uid);
        } else {
          setSearchResults(found);
        }
      } else {
        setErrorMsg("দুঃখিত, এই আইডি বা নামের কোনো ভেরিফাইড নাগরিক পাওয়া যায়নি।");
      }
    } catch (err) {
      console.error("Error searching citizen:", err);
      setErrorMsg("অনুসন্ধান করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setSearching(false);
    }
  };

  const simulateCameraScan = (uid: string) => {
    setSimulatingScan(true);
    setTimeout(() => {
      setSimulatingScan(false);
      onProfileSelect(uid);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Simulate reading QR code from uploaded image
      setSimulatingScan(true);
      setTimeout(() => {
        setSimulatingScan(false);
        // Randomly pick one of the demo users
        const randomDemo = demoCitizens[Math.floor(Math.random() * demoCitizens.length)];
        onProfileSelect(randomDemo.uid);
      }, 1500);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 font-sans pb-10 px-4 text-left">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoBack}
          className="p-2 bg-neutral-100 dark:bg-zinc-900 rounded-full hover:bg-neutral-200 transition cursor-pointer"
          title="ফরি যান"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
        </button>
        <div>
          <h2 className="text-lg font-black text-neutral-800 dark:text-neutral-100">QR আইডি স্ক্যানার ও সার্চার</h2>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">স্মার্ট সিটিজেন কার্ড স্ক্যান করুন</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 bg-neutral-100 dark:bg-zinc-900 p-1.5 rounded-2xl">
        <button
          onClick={() => setScanTab('camera')}
          className={`py-2 text-xs font-black rounded-xl transition ${
            scanTab === 'camera'
              ? 'bg-white dark:bg-zinc-800 text-teal-800 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          📷 ক্যামেরা স্ক্যানার
        </button>
        <button
          onClick={() => setScanTab('search')}
          className={`py-2 text-xs font-black rounded-xl transition ${
            scanTab === 'search'
              ? 'bg-white dark:bg-zinc-800 text-teal-800 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          🔍 আইডি দিয়ে খুঁজুন
        </button>
      </div>

      {scanTab === 'camera' ? (
        <div className="space-y-6">
          {/* Scanning Box Screen */}
          <div className="bg-neutral-900 dark:bg-black aspect-square rounded-3xl border border-neutral-800 relative overflow-hidden flex flex-col items-center justify-center shadow-lg">
            {simulatingScan ? (
              <div className="text-center text-white space-y-3 z-10">
                <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-emerald-400 animate-pulse">QR কোড বিশ্লেষণ করা হচ্ছে...</p>
              </div>
            ) : (
              <>
                {/* Laser scan line anim */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-bounce z-10"></div>
                
                {/* Four corners frame overlay */}
                <div className="absolute w-64 h-64 border-2 border-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></div>
                  
                  <QrCode className="w-16 h-16 text-emerald-400/40 animate-pulse" />
                </div>
                
                <p className="absolute bottom-5 text-[11px] font-bold text-white/50 text-center px-4">
                  ক্যামেরা সচল করুন অথবা নিচে দেওয়া ডেমো নাগরিক কার্ডের QR কোড স্ক্যান করার জন্য ক্লিক করুন
                </p>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-2.5">
            <label className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer text-xs">
              <Upload className="w-4 h-4" />
              গ্যালারি থেকে QR কোড আপলোড করুন
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Simulate List block */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-3xl p-5 space-y-3.5 shadow-xs">
            <h4 className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> ডেমো নাগরিক কার্ড স্ক্যান সিমুলেশন
            </h4>
            <p className="text-[11px] text-neutral-500 font-medium">
              বাস্তব ক্যামেরার স্ক্যানিং অনুভব করতে নিচের যেকোনো একটি নাগরিক কার্ডের "QR স্ক্যান করুন" বাটনে ক্লিক করুন:
            </p>

            <div className="space-y-2">
              {demoCitizens.map((citizen) => (
                <div key={citizen.uid} className="p-3 bg-neutral-50 dark:bg-zinc-950 rounded-2xl border border-neutral-100 dark:border-zinc-800/80 flex justify-between items-center hover:border-neutral-200 transition">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-8 h-8 bg-teal-100 text-teal-800 rounded-full font-black flex items-center justify-center text-xs">
                      {citizen.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{citizen.name}</p>
                      <p className="text-[9px] text-neutral-400 font-bold">{citizen.label} • {citizen.bloodGroup}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => simulateCameraScan(citizen.uid)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer border-none"
                  >
                    QR স্ক্যান
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Manual NID / UID Search Form */}
          <form onSubmit={handleManualSearch} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="নাগরিক আইডি (যেমন: PUT-8745) বা মোবাইল নাম্বার লিখুন..."
                value={manualId || ""}
                onChange={(e) => setManualId(e.target.value)}
                className="w-full text-xs p-3.5 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl focus:ring-1 focus:ring-teal-600 focus:border-teal-600 outline-none pr-10"
              />
              <button
                type="submit"
                disabled={searching}
                className="absolute right-3 top-3.5 text-neutral-500 hover:text-teal-600 transition"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={searching || !manualId.trim()}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-neutral-300 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {searching ? "অনুসন্ধান করা হচ্ছে..." : "নাগরিক অনুসন্ধান করুন"}
            </button>
          </form>

          {/* Search results list */}
          {searchResults.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-neutral-700 dark:text-neutral-300">অনুসন্ধান ফলাফল:</h4>
              <div className="space-y-2">
                {searchResults.map((res) => (
                  <button
                    key={res.uid}
                    onClick={() => onProfileSelect(res.uid)}
                    className="w-full p-3 bg-neutral-50 dark:bg-zinc-950 rounded-2xl border border-neutral-100 dark:border-zinc-800 flex justify-between items-center hover:border-teal-200 text-left transition cursor-pointer"
                  >
                    <div className="flex gap-2.5 items-center">
                      <div className="w-8 h-8 bg-teal-100 text-teal-800 rounded-full font-black flex items-center justify-center text-xs">
                        {res.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                          {res.name} <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 fill-teal-500/10" />
                        </p>
                        <p className="text-[10px] text-neutral-400 font-bold">{res.village || "জিউপাড়া"}, {res.union || "পুঠিয়া"}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-teal-700">কার্ড দেখুন &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Helper Tips */}
          <div className="bg-neutral-50 dark:bg-zinc-900 p-4 rounded-3xl border border-neutral-100 dark:border-zinc-800/80 space-y-2.5">
            <h4 className="text-xs font-black text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-neutral-500" /> আইডি সার্চ করার নিয়মাবলী
            </h4>
            <ul className="text-[11px] text-neutral-500 space-y-1 pl-4 list-disc font-medium">
              <li>যেকোনো ভেরিফাইড নাগরিকের মেম্বারশিপ আইডি কার্ডের পিছনের PUT- কোডটি লিখুন (যেমন: <code className="font-mono bg-neutral-200 px-1 rounded text-neutral-800 font-bold">PUT-8745</code>)।</li>
              <li>আইডির পরিবর্তে সরাসরি তাদের ভেরিফাইড নাম বা যোগাযোগের মোবাইল নাম্বার দিয়েও সার্চ করতে পারেন।</li>
              <li>সার্চ করে যেকোনো নাগরিকের রক্তদানের তথ্য ও তার অর্জন যাচাই করা সম্ভব।</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
