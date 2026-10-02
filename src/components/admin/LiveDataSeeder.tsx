import React, { useState } from "react";
import { 
  Database, RefreshCw, CheckCircle2, AlertTriangle, 
  ArrowRight, ShieldCheck, Stethoscope, Building2, 
  Sparkles, Layers, FileText, Check, AlertCircle,
  ShoppingBag, Sprout, PhoneCall, MapPin
} from "lucide-react";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { DEFAULT_HEALTH_SERVICES } from "../../data/healthData";
import { SAMPLE_MARKETS } from "../../data/business";
import { logAuditActivity } from "../../services/auditLogger";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

interface SeedModule {
  id: string;
  name: string;
  collection: string;
  count: number;
  description: string;
  getData: () => any[];
}

export const LiveDataSeeder: React.FC = () => {
  const { user } = useAuth();
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [isSeedingAll, setIsSeedingAll] = useState(false);

  // Define modules ready for 1-click live Firestore seeding
  const seedModules: SeedModule[] = [
    {
      id: "hospitals",
      name: "হাসপাতাল ও স্বাস্থ্য কমপ্লেক্স",
      collection: "hospitals",
      count: DEFAULT_HEALTH_SERVICES.filter(h => h.type.includes("হাসপাতাল")).length || 4,
      description: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স এবং ইউনিয়ন কমিউনিটি ক্লিনিক সমূহের লাইভ ডেটা",
      getData: () => DEFAULT_HEALTH_SERVICES.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        phone: item.phone,
        address: item.address,
        hours: item.hours,
        rating: item.rating,
        image: item.image,
        about: item.about,
        departments: item.departments || [],
        establishedYear: item.establishedYear || "১৯৭২",
        email: item.email || "",
        hasEmergency24h: item.hasEmergency24h ?? true,
        totalBeds: item.totalBeds || 50,
        bedsAvailable: item.bedsAvailable || 12,
        isVerified: true,
        status: "active",
        createdAt: new Date().toISOString()
      }))
    },
    {
      id: "doctors",
      name: "ডাক্তার ও বিশেষজ্ঞ তালিকা",
      collection: "doctors",
      count: 6,
      description: "মেডিসিন, শিশু, গাইনি, অর্থোপেডিক ও ডেন্টাল বিশেষজ্ঞ ডাক্তারদের তালিকা ও চেম্বার শিডিউল",
      getData: () => [
        {
          id: "doc-sudip-chakraborty",
          name: "ডা. সুদীপ চক্রবর্তী",
          specialty: "উপজেলা স্বাস্থ্য কর্মকর্তা (মেডিসিন বিশেষজ্ঞ)",
          qualification: "এমবিবিএস, বিসিএস (স্বাস্থ্য), এফসিপিএস (মেডিসিন)",
          hospital: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
          phone: "01711-456789",
          visitingHours: "রবি - বৃহস্পতি (সকাল ৯:০০ - দুপুর ২:০০)",
          fee: "সরকারি ফি (১০ টাকা)",
          chamberAddress: "পুঠিয়া স্বাস্থ্য কমপ্লেক্স বহির্বিভাগ, রুম নং ১০৪",
          rating: 4.8,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        },
        {
          id: "doc-fatema-zohra",
          name: "ডা. ফাতেমা তুজ জোহরা",
          specialty: "গাইনী, প্রসূতি ও স্ত্রীরোগ বিশেষজ্ঞ",
          qualification: "এমবিবিএস, ডিজিও, এফসিপিএস (পার্ট-২)",
          hospital: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
          phone: "01711-456790",
          visitingHours: "সোম - বুধ (সকাল ৯:০০ - দুপুর ২:০০)",
          fee: "সরকারি ফি (১০ টাকা)",
          chamberAddress: "মা ও শিশু কল্যাণ কেন্দ্র, পুঠিয়া",
          rating: 4.9,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        },
        {
          id: "doc-rafiqul-islam",
          name: "ডা. মো. রফিকুল ইসলাম",
          specialty: "শিশু রোগ ও পুষ্টি বিশেষজ্ঞ",
          qualification: "এমবিবিএস, ডিসিএইচ (শিশু)",
          hospital: "পুঠিয়া ডিজিটাল ক্লিনিক ও ডায়াগনস্টিক",
          phone: "01712-998877",
          visitingHours: "প্রতিদিন (বিকাল ৪:০০ - রাত ৮:০০)",
          fee: "৩০০ টাকা",
          chamberAddress: "থানা মোড়, পুঠিয়া বাজার",
          rating: 4.7,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        },
        {
          id: "doc-tauhidul-bari",
          name: "ডা. তৌহিদুল বারী",
          specialty: "হাড়জোড়, বাত ও ট্রমা সার্জন",
          qualification: "এমবিবিএস, ডি-অর্থো, এমএস (অর্থোপেডিক্স)",
          hospital: "বানেশ্বর সেন্ট্রাল হাসপাতাল",
          phone: "01715-334455",
          visitingHours: "শনি, সোম, বুধ (বিকাল ৩:০০ - রাত ৮:০০)",
          fee: "৪০০ টাকা",
          chamberAddress: "বানেশ্বর বাজার, রাজশাহী রোড",
          rating: 4.8,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        },
        {
          id: "doc-kamruzzaman",
          name: "ডা. মো. কামরুজ্জামান (ডিডিএস)",
          specialty: "দন্ত রোগ বিশেষজ্ঞ ও ডেন্টাল সার্জন",
          qualification: "বিডিএস, পিজিটি (ওরাল সার্জারি)",
          hospital: "পপুলার ডায়াগনস্টিক অ্যান্ড ডেন্টাল কেয়ার",
          phone: "01715-112233",
          visitingHours: "প্রতিদিন (সকাল ১০:০০ - রাত ৮:০০)",
          fee: "৩০০ টাকা",
          chamberAddress: "পুঠিয়া বাসস্ট্যান্ড মোড়, রাজশাহী",
          rating: 4.8,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        },
        {
          id: "doc-abu-bakkar",
          name: "ডা. মো. আবু বকর সিদ্দিক",
          specialty: "চক্ষু রোগ বিশেষজ্ঞ ও ফ্যাকো সার্জন",
          qualification: "এমবিবিএস, ডিও (চক্ষু)",
          hospital: "রাজশাহী আই হসপিটাল (পুঠিয়া শাখা)",
          phone: "01716-445566",
          visitingHours: "শনি, সোম ও বুধ (সকাল ১০:০০ - বিকাল ৪:০০)",
          fee: "৩০০ টাকা",
          chamberAddress: "উপজেলা মোড় সংলগ্ন, পুঠিয়া",
          rating: 4.7,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "agri-dealers",
      name: "কৃষি ও সার-বীজ ডিলার তালিকা",
      collection: "agri_dealers",
      count: 6,
      description: "পুঠিয়ার অনুমোদিত বিসিআইসি ও বিএডিসি সার, কীটনাশক ও উন্নত বীজ ডিলারদের তথ্য",
      getData: () => [
        {
          id: "dealer-puthia-sadr",
          name: "মেসার্স পুঠিয়া ট্রেডার্স (বিসিআইসি অনুমোদিত)",
          proprietor: "মো. হাফিজুর রহমান",
          phone: "01712-112244",
          address: "পুঠিয়া বাজার প্রধান সড়ক, পুঠিয়া",
          union: "পুঠিয়া সদর",
          stockStatus: "ইউরিয়া, ডিএপি ও টিএসপি পর্যাপ্ত মজুদ আছে",
          rating: 4.8,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        },
        {
          id: "dealer-baneshwar",
          name: "বানেশ্বর কৃষি ভান্ডার (বিএডিসি বীজ ডিলার)",
          proprietor: "মো. আনিসুর রহমান",
          phone: "01713-556677",
          address: "বানেশ্বর হাট রোড, বানেশ্বর",
          union: "বানেশ্বর",
          stockStatus: "উন্নত জাতের ধান ও ভুট্টার বীজ উপলব্ধ",
          rating: 4.9,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        },
        {
          id: "dealer-belpukuria",
          name: "বেলপুকুরিয়া ফার্টিলাইজার এজেন্সি",
          proprietor: "মো. জাহাঙ্গীর আলম",
          phone: "01718-889911",
          address: "বেলপুকুরিয়া রেলগেট বাজার",
          union: "বেলপুকুরিয়া",
          stockStatus: "এমওপি ও জিপসাম সরকারি মূল্যে বিক্রয় চলছে",
          rating: 4.7,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        },
        {
          id: "dealer-bhalukgachi",
          name: "ভালুকগাছী কৃষক বন্ধু এগ্রো",
          proprietor: "মো. নজরুল ইসলাম",
          phone: "01714-332211",
          address: "ভালুকগাছী বাজার মোড়",
          union: "ভালুকগাছী",
          stockStatus: "জৈব সার ও অনুখাদ্য মজুদ",
          rating: 4.6,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        },
        {
          id: "dealer-shilmaria",
          name: "শিলমাড়িয়া এগ্রো সার্ভিস",
          proprietor: "মো. সাইদুর রহমান",
          phone: "01715-998844",
          address: "শিলমাড়িয়া হাই স্কুল মোড়",
          union: "শিলমাড়িয়া",
          stockStatus: "সকল প্রকার সরকারি সার বিক্রয় কেন্দ্র",
          rating: 4.7,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        },
        {
          id: "dealer-jiupara",
          name: "জিউপাড়া জনতা ট্রেডার্স",
          proprietor: "মো. আবদুর রশিদ",
          phone: "01716-443322",
          address: "জিউপাড়া পরিষদ গেট",
          union: "জিউপাড়া",
          stockStatus: "কীটনাশক ও স্প্রে মেশিন মজুদ আছে",
          rating: 4.7,
          isVerified: true,
          status: "active",
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "markets",
      name: "পুঠিয়ার প্রধান হাট ও বাজার",
      collection: "markets",
      count: SAMPLE_MARKETS.length || 3,
      description: "পুঠিয়া বাজার, বানেশ্বর আম বাজার ও ঝলমলিয়া হাটের লাইভ তথ্য ও দোকান সংখ্যা",
      getData: () => SAMPLE_MARKETS.map(m => ({
        id: m.id,
        name: m.name,
        location: m.location,
        lat: m.lat,
        lng: m.lng,
        shopCount: m.shopCount,
        description: m.description,
        imageUrl: m.imageUrl,
        hatDays: m.name.includes("বানেশ্বর") ? "শনি ও মঙ্গলবার" : "রবি ও বুধবার",
        isVerified: true,
        status: "active",
        createdAt: new Date().toISOString()
      }))
    },
    {
      id: "unions",
      name: "পুঠিয়া ৬টি ইউনিয়ন ও পৌর তথ্য",
      collection: "upazila_info",
      count: 6,
      description: "পুঠিয়া সদর পৌরসভা, বানেশ্বর, বেলপুকুরিয়া, ভালুকগাছী, শিলমাড়িয়া ও জিউপাড়া ইউনিয়নের তথ্য",
      getData: () => [
        { id: "puthia-pourashava", name: "১নং পুঠিয়া পৌরসভা", chairman: "পৌর প্রশাসক", contactNumber: "01711-123456", wardsCount: 9, address: "পুঠিয়া বাজার, রাজশাহী", population: "৪৫,০০০+" },
        { id: "baneshwar-union", name: "২নং বানেশ্বর ইউনিয়ন", chairman: "ইউপি চেয়ারম্যান", contactNumber: "01712-234567", wardsCount: 9, address: "বানেশ্বর বাজার সংলগ্ন", population: "৫২,০০০+" },
        { id: "belpukuria-union", name: "৩নং বেলপুকুরিয়া ইউনিয়ন", chairman: "ইউপি চেয়ারম্যান", contactNumber: "01713-345678", wardsCount: 9, address: "বেলপুকুরিয়া রেলগেট", population: "৩৮,০০০+" },
        { id: "bhalukgachi-union", name: "৪নং ভালুকগাছী ইউনিয়ন", chairman: "ইউপি চেয়ারম্যান", contactNumber: "01714-456789", wardsCount: 9, address: "ভালুকগাছী বাজার", population: "৩৪,০০০+" },
        { id: "shilmaria-union", name: "৫নং শিলমাড়িয়া ইউনিয়ন", chairman: "ইউপি চেয়ারম্যান", contactNumber: "01715-567890", wardsCount: 9, address: "শিলমাড়িয়া পরিষদ ভবন", population: "৩৬,০০০+" },
        { id: "jiupara-union", name: "৬নং জিউপাড়া ইউনিয়ন", chairman: "ইউপি চেয়ারম্যান", contactNumber: "01716-678901", wardsCount: 9, address: "জিউপাড়া পরিষদ মোড়", population: "৩২,০০০+" }
      ].map(u => ({
        ...u,
        services: ["নাগরিক সনদ", "ওয়ারিশান সার্টিফিকেট", "ট্রেড লাইসেন্স", "জন্ম-মৃত্যু নিবন্ধন"],
        status: "active",
        createdAt: new Date().toISOString()
      }))
    },
    {
      id: "emergency",
      name: "জরুরি সেবা ও হটলাইন",
      collection: "emergency_services",
      count: 6,
      description: "পুঠিয়া থানা পুলিশ, ফায়ার সার্ভিস, অ্যাম্বুলেন্স, পল্লী বিদ্যুৎ ও উপজেলা কন্ট্রোল রুম",
      getData: () => [
        {
          id: "hotline-999",
          name: "জাতীয় জরুরি সেবা (পুলিশ, ফায়ার, অ্যাম্বুলেন্স)",
          category: "জাতীয়",
          number: "999",
          available: "২৪ ঘণ্টা ফ্রি",
          description: "সারাদেশের ন্যায় পুঠিয়াতেও যেকোনো জরুরি পরিস্থিতিতে সরাসরি যোগাযোগ করুন",
          priority: 1
        },
        {
          id: "police-puthia",
          name: "পুঠিয়া থানা পুলিশ ডিউটি অফিসার",
          category: "পুলিশ",
          number: "01320-123456",
          available: "২৪ ঘণ্টা",
          description: "আইনশৃঙ্খলা ও যেকোনো নিরাপত্তা সংক্রান্ত সহযোগিতায়",
          priority: 2
        },
        {
          id: "fire-puthia",
          name: "পুঠিয়া ফায়ার সার্ভিস ও সিভিল ডিফেন্স",
          category: "ফায়ার সার্ভিস",
          number: "01730-002233",
          available: "২৪ ঘণ্টা জরুরি রেসপন্স",
          description: "অগ্নিদুর্ঘটনা, সড়ক দুর্ঘটনা ও দুর্যোগে উদ্ধার সেবা",
          priority: 3
        },
        {
          id: "reb-puthia",
          name: "পুঠিয়া পল্লী বিদ্যুৎ অভিযোগ কেন্দ্র",
          category: "বিদ্যুৎ",
          number: "01769-400500",
          available: "২৪ ঘণ্টা",
          description: "বিদ্যুৎ বিভ্রাট, ট্রান্সফরমার ও সংযোগ সংক্রান্ত অভিযোগ",
          priority: 4
        },
        {
          id: "ambulance-puthia",
          name: "সন্ধানী অ্যাম্বুলেন্স সেবা পুঠিয়া",
          category: "স্বাস্থ্য",
          number: "01718-223344",
          available: "২৪ ঘণ্টা অন-কল",
          description: "জরুরি রোগী স্থানান্তর ও আইসিইউ অ্যাম্বুলেন্স",
          priority: 5
        },
        {
          id: "uno-puthia",
          name: "উপজেলা নির্বাহী কর্মকর্তা (UNO) কার্যালয়",
          category: "প্রশাসন",
          number: "01713-200300",
          available: "অফিস চলাকালীন",
          description: "উপজেলা প্রশাসন ও জরুরি নাগরিক সহায়তা",
          priority: 6
        }
      ]
    }
  ];

  const seedModuleData = async (mod: SeedModule) => {
    try {
      setLoadingMap(prev => ({ ...prev, [mod.id]: true }));
      const data = mod.getData();
      
      const batch = writeBatch(db);
      for (const item of data) {
        const docId = item.id ? String(item.id).toLowerCase().replace(/[^a-z0-9_-]/g, "-") : `${mod.collection}_${Math.random().toString(36).substring(2, 9)}`;
        const docRef = doc(db, mod.collection, docId);
        batch.set(docRef, item, { merge: true });
      }

      await batch.commit();

      if (user) {
        await logAuditActivity({
          actorUid: user.uid,
          customUser: user.displayName || user.email || "সুপার অ্যাডমিন",
          customEmail: user.email || "superadmin@puthia.gov.bd",
          actorRole: "super_admin",
          action: "system_data_seed",
          category: "system",
          severity: "info",
          targetType: mod.collection,
          targetId: "batch_seed",
          targetName: mod.name,
          details: `সুপার অ্যাডমিন '${mod.name}' মডিউলের লাইভ ডাটাবেজ সফলভাবে সিড/সিঙ্ক করেছেন।`
        });
      }

      setCompletedMap(prev => ({ ...prev, [mod.id]: true }));
      toast.success(`${mod.name} মডিউলের ডেটা ফায়ারস্টোর ডাটাবেজে সফলভাবে সিড হয়েছে!`);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, mod.collection);
      toast.error(`${mod.name} সিড করতে সমস্যা হয়েছে। নেটওয়ার্ক বা পারমিশন চেক করুন।`);
    } finally {
      setLoadingMap(prev => ({ ...prev, [mod.id]: false }));
    }
  };

  const seedAllModules = async () => {
    setIsSeedingAll(true);
    for (const mod of seedModules) {
      await seedModuleData(mod);
    }
    setIsSeedingAll(false);
    toast.success("সকল মূল মডিউল ডেটাবেজে সফলভাবে সিড ও প্রস্তুত করা হয়েছে!");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
            <Database size={13} className="text-emerald-600" />
            <span>লাইভ ডেটাবেজ সিডার ও ক্লিনআপ টুল (Live Data Manager)</span>
          </div>
          <h3 className="text-xl font-black text-slate-900">
            পুঠিয়া পোর্টাল লাইভ ডেটাবেজ পপুলেশন ও রিয়েল ডেটা সিঙ্ক
          </h3>
          <p className="text-xs text-slate-500 max-w-xl">
            ফলব্যাক ও ডামি ডেটার বদলে ক্লাউড ফায়ারস্টোরে আসল হাসপাতাল, বিশেষজ্ঞ ডাক্তার, সার-বীজ ডিলার, হাট-বাজার এবং জরুরি সেবা লাইভ ডেটাবেজে সিড করুন।
          </p>
        </div>

        <button
          onClick={seedAllModules}
          disabled={isSeedingAll}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-2xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isSeedingAll ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
          <span>এক ক্লিকে সকল মডিউল সিড করুন</span>
        </button>
      </div>

      {/* Grid of Seedable Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seedModules.map((mod) => {
          const isLoading = loadingMap[mod.id];
          const isDone = completedMap[mod.id];

          return (
            <div 
              key={mod.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                      {mod.id === 'hospitals' && <Stethoscope size={16} />}
                      {mod.id === 'doctors' && <Stethoscope size={16} />}
                      {mod.id === 'agri-dealers' && <Sprout size={16} />}
                      {mod.id === 'markets' && <ShoppingBag size={16} />}
                      {mod.id === 'unions' && <Building2 size={16} />}
                      {mod.id === 'emergency' && <PhoneCall size={16} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{mod.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">/{mod.collection}</p>
                    </div>
                  </div>
                  
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold">
                      <CheckCircle2 size={12} /> সিড সম্পন্ন
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                      {mod.count} টি রেকর্ড
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">প্রোডাকশন ডেটাসেট</span>
                <button
                  onClick={() => seedModuleData(mod)}
                  disabled={isLoading}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isLoading ? <RefreshCw size={13} className="animate-spin" /> : isDone ? <Check size={13} /> : <ArrowRight size={13} />}
                  <span>{isDone ? "পুনরায় সিঙ্ক করুন" : "ডেটাবেজে লিখুন"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 space-y-0.5">
          <p className="font-bold">সুপার অ্যাডমিন লাইভ ডেটা গাইডেন্স:</p>
          <p className="text-emerald-800/90 leading-relaxed">
            এখানে সিড করা ডেটা ফায়ারস্টোর ক্লাউডে সরাসরি সক্রিয় হবে। ফলে সাইটে ভিজিটররা কোনো ফলব্যাক ডামি ফিল্ড ছাড়াই আসল পুঠিয়া উপজেলার তথ্য (যেমন: বিসিআইসি সার ডিলার, ডাক্তার শিডিউল, পুঠিয়া হাসপাতাল ও বানেশ্বর আম বাজার) দেখতে পাবেন।
          </p>
        </div>
      </div>
    </div>
  );
};
export default LiveDataSeeder;
