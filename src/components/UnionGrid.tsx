import React, { useState } from "react";
import { 
  ArrowLeft, MapPin, Phone, Users, Globe, Building2, 
  GraduationCap, TrendingUp, Layers, Info, Calendar, Mail, FileText, CheckCircle
} from "lucide-react";

interface UnionGridProps {
  onGoBack: () => void;
  onSimulateCall?: (phone: string, name: string) => void;
}

interface UnionDetail {
  id: string;
  number: string;
  name: string;
  area: string;
  villagesCount: string;
  population: string;
  literacy: string;
  mouzas: string;
  chairman: {
    name: string;
    phone: string;
  };
  secretary: {
    name: string;
    phone: string;
  };
  udc: {
    entrepreneur: string;
    phone: string;
    email: string;
  };
  history: string;
  hqLocation: string;
  transitGuide: string;
  members: { ward: string; name: string; designation: string }[];
}

const UNIONS_DATA: UnionDetail[] = [
  {
    id: "puthia_sadar",
    number: "১নং",
    name: "পুঠিয়া ইউনিয়ন পরিষদ",
    area: "২৭.৭৪ বর্গ কিমি",
    villagesCount: "২০টি",
    population: "৩৬,৫০০ জন",
    literacy: "৫২.৪%",
    mouzas: "১৮টি",
    chairman: { name: "মোঃ খলিলুর রহমান", phone: "01711-123456" },
    secretary: { name: "মোঃ নজরুল ইসলাম", phone: "01712-234567" },
    udc: { entrepreneur: "মোঃ মাজেদুল ইসলাম", phone: "01713-345678", email: "udc.puthia@gmail.com" },
    history: "১নং পুঠিয়া ইউনিয়ন পরিষদ রাজশাহী জেলার পুঠিয়া উপজেলায় অবস্থিত। এর ঐতিহাসিক গুরুত্ব অনেক, কারণ এখানে বিখ্যাত পুঠিয়া রাজবাড়ী এবং একাধিক প্রাচীন মন্দির অবস্থিত। এটি পুঠিয়া উপজেলার কেন্দ্রস্থলে অবস্থিত ও স্থানীয় যোগাযোগের প্রাণকেন্দ্র।",
    hqLocation: "পুঠিয়া রাজবাড়ী চত্বরের উত্তর পাশে, উপজেলা সদরের নিকটবর্তী।",
    transitGuide: "রাজশাহী সিটি বাইপাস বা নাটোর থেকে ঢাকা-রাজশাহী মহাসড়কে পুঠিয়া বাসস্ট্যান্ডে নেমে রিকশা বা ইজিবাইকে মাত্র ৫ মিনিটে ইউনিয়ন পরিষদে পৌঁছানো যায়।",
    members: [
      { ward: "১নং ওয়ার্ড", name: "মোঃ আকবর আলী", designation: "ইউপি সদস্য" },
      { ward: "২নং ওয়ার্ড", name: "মোঃ মকবুল হোসেন", designation: "ইউপি সদস্য" },
      { ward: "৩নং ওয়ার্ড", name: "মোঃ রবিউল ইসলাম", designation: "ইউপি সদস্য" },
      { ward: "৪নং ওয়ার্ড", name: "মোঃ রফিকুল ইসলাম", designation: "ইউপি সদস্য" },
      { ward: "৫নং ওয়ার্ড", name: "মোঃ আতাউর রহমান", designation: "ইউপি সদস্য" },
      { ward: "৬নং ওয়ার্ড", name: "মোঃ আবুল কালাম", designation: "ইউপি সদস্য" },
      { ward: "৭নং ওয়ার্ড", name: "মোঃ জাকির হোসেন", designation: "ইউপি সদস্য" },
      { ward: "৮নং ওয়ার্ড", name: "মোঃ হাসেম আলী", designation: "ইউপি সদস্য" },
      { ward: "৯নং ওয়ার্ড", name: "মোঃ শাহিনুর রহমান", designation: "ইউপি সদস্য" },
      { ward: "সংরক্ষিত ১", name: "মোসাঃ পারভীন বেগম", designation: "সংরক্ষিত নারী সদস্য (১, ২, ৩ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ২", name: "মোসাঃ রাশেদা আক্তার", designation: "সংরক্ষিত নারী সদস্য (৪, ৫, ৬ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ৩", name: "মোসাঃ সালমা খাতুন", designation: "সংরক্ষিত নারী সদস্য (৭, ৮, ৯ নং ওয়ার্ড)" },
    ]
  },
  {
    id: "belpukur",
    number: "২নং",
    name: "বেলপুকুর ইউনিয়ন পরিষদ",
    area: "৩২.১২ বর্গ কিমি",
    villagesCount: "২৪টি",
    population: "৪২,২০০ জন",
    literacy: "৪৯.৮%",
    mouzas: "২২টি",
    chairman: { name: "মোঃ রাজিবুল হক", phone: "01711-234567" },
    secretary: { name: "শ্রী সুকুমার রায়", phone: "01712-345678" },
    udc: { entrepreneur: "মোসাঃ রেহেনা পারভীন", phone: "01713-456789", email: "udc.belpukur@gmail.com" },
    history: "বেলপুকুর ইউনিয়ন পরিষদ পুঠিয়া উপজেলার প্রবেশদ্বার হিসেবে কাজ করে। এই ইউনিয়নটি ঢাকা-রাজশাহী মহাসড়কের পাশে অবস্থিত ও এর অর্থনৈতিক গুরুত্ব রয়েছে। এখানে বেলপুকুর থানা অবস্থিত যা এলাকার আইন-শৃঙ্খলা রক্ষায় নিয়োজিত।",
    hqLocation: "বেলপুকুর রেল ক্রসিং সংলগ্ন, ঢাকা-রাজশাহী মহাসড়কের পাশেই।",
    transitGuide: "রাজশাহী জেলা সদর থেকে যেকোনো বাসে বা সিএনজিতে চড়ে বেলপুকুর বাজারে নামলেই ইউনিয়ন পরিষদ কমপ্লেক্স ভবনটি হাতের বামে দেখা যাবে।",
    members: [
      { ward: "১নং ওয়ার্ড", name: "মোঃ আশরাফ আলী", designation: "ইউপি সদস্য" },
      { ward: "২নং ওয়ার্ড", name: "মোঃ জয়নাল আবেদীন", designation: "ইউপি সদস্য" },
      { ward: "৩নং ওয়ার্ড", name: "মোঃ মনিরুল ইসলাম", designation: "ইউপি সদস্য" },
      { ward: "৪নং ওয়ার্ড", name: "মোঃ আব্দুস ছাত্তার", designation: "ইউপি সদস্য" },
      { ward: "৫নং ওয়ার্ড", name: "মোঃ সাজ্জাদ হোসেন", designation: "ইউপি সদস্য" },
      { ward: "৬নং ওয়ার্ড", name: "মোঃ বাবুল আক্তার", designation: "ইউপি সদস্য" },
      { ward: "৭নং ওয়ার্ড", name: "মোঃ আব্দুল কুদ্দুস", designation: "ইউপি সদস্য" },
      { ward: "৮নং ওয়ার্ড", name: "মোঃ শরিফুল ইসলাম", designation: "ইউপি সদস্য" },
      { ward: "৯নং ওয়ার্ড", name: "মোঃ আব্দুর রাজ্জাক", designation: "ইউপি সদস্য" },
      { ward: "সংরক্ষিত ১", name: "মোসাঃ ফাতেমা বেগম", designation: "সংরক্ষিত নারী সদস্য (১, ২, ৩ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ২", name: "মোসাঃ শামীমা খাতুন", designation: "সংরক্ষিত নারী সদস্য (৪, ৫, ৬ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ৩", name: "মোসাঃ তহমিনা আক্তার", designation: "সংরক্ষিত নারী সদস্য (৭, ৮, ৯ নং ওয়ার্ড)" },
    ]
  },
  {
    id: "baneshwar",
    number: "৩নং",
    name: "বানেশ্বর ইউনিয়ন পরিষদ",
    area: "২৯.৫৬ বর্গ কিমি",
    villagesCount: "১৯টি",
    population: "৪৫,৮০০ জন",
    literacy: "৫৬.২%",
    mouzas: "১৭টি",
    chairman: { name: "মোঃ আলিম উদ্দিন", phone: "01711-345678" },
    secretary: { name: "মোঃ রফিকুল ইসলাম", phone: "01712-456789" },
    udc: { entrepreneur: "মোঃ আব্দুল আলীম", phone: "01713-567890", email: "udc.baneshwar@gmail.com" },
    history: "বানেশ্বর ইউনিয়ন পরিষদ এ অঞ্চলের সবচেয়ে বড় বাণিজ্যিক ইউনিয়ন। এশিয়া মহাদেশের অন্যতম বৃহৎ আমের হাট বানেশ্বরে বসে। এই ইউনিয়নের ব্যবসা-বাণিজ্য এবং আম ও রেশম উৎপাদন এলাকার অর্থনৈতিক সমৃদ্ধি নিশ্চিত করে।",
    hqLocation: "বানেশ্বর বাজারের পূর্ব দিকে, পুঠিয়া অভিমুখে মহাসড়কের পাশে।",
    transitGuide: "রাজশাহী বা নাটোর থেকে যেকোনো বাসে বানেশ্বর বাজারে নামুন। বাজার থেকে হাঁটা দূরত্বে অথবা ভ্যানে ১ মিনিটে ইউনিয়ন পরিষদ কমপ্লেক্স ভবনে পৌঁছানো যায়।",
    members: [
      { ward: "১নং ওয়ার্ড", name: "মোঃ আসাদুল হক", designation: "ইউপি সদস্য" },
      { ward: "২নং ওয়ার্ড", name: "মোঃ আলমগীর হোসেন", designation: "ইউপি সদস্য" },
      { ward: "৩নং ওয়ার্ড", name: "মোঃ মোস্তফা কামাল", designation: "ইউপি সদস্য" },
      { ward: "৪নং ওয়ার্ড", name: "মোঃ শফিউল আলম", designation: "ইউপি সদস্য" },
      { ward: "৫নং ওয়ার্ড", name: "মোঃ জাহাঙ্গীর আলম", designation: "ইউপি সদস্য" },
      { ward: "৬নং ওয়ার্ড", name: "মোঃ আনারুল ইসলাম", designation: "ইউপি সদস্য" },
      { ward: "৭নং ওয়ার্ড", name: "মোঃ তরিকুল ইসলাম", designation: "ইউপি সদস্য" },
      { ward: "৮নং ওয়ার্ড", name: "মোঃ আমিনুর রহমান", designation: "ইউপি সদস্য" },
      { ward: "৯নং ওয়ার্ড", name: "মোঃ আবু সাঈদ", designation: "ইউপি সদস্য" },
      { ward: "সংরক্ষিত ১", name: "মোসাঃ আয়েশা বেগম", designation: "সংরক্ষিত নারী সদস্য (১, ২, ৩ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ২", name: "মোসাঃ মমতাজ মহল", designation: "সংরক্ষিত নারী সদস্য (৪, ৫, ৬ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ৩", name: "মোসাঃ রেশমা পারভীন", designation: "সংরক্ষিত নারী সদস্য (৭, ৮, ৯ নং ওয়ার্ড)" },
    ]
  },
  {
    id: "jeupara",
    number: "৪নং",
    name: "জিউপাড়া ইউনিয়ন পরিষদ",
    area: "৩৪.৮৫ বর্গ কিমি",
    villagesCount: "২৭টি",
    population: "৩৮,৯০০ জন",
    literacy: "৪৮.৩%",
    mouzas: "২৫টি",
    chairman: { name: "মোঃ জিল্লুর রহমান", phone: "01711-456789" },
    secretary: { name: "মোঃ আবু বকর সিদ্দীক", phone: "01712-567890" },
    udc: { entrepreneur: "মোঃ মেহেদী হাসান", phone: "01713-678901", email: "udc.jeupara@gmail.com" },
    history: "জিউপাড়া ইউনিয়ন পরিষদ একটি কৃষিপ্রধান ইউনিয়ন। এখানকার উর্বর জমি আলু, পেঁয়াজ, গম ও ধান চাষের জন্য বিশেষভাবে পরিচিত। ইউনিয়নের মানুষ মূলত কৃষিকাজ ও পশুপালনের সাথে জড়িত।",
    hqLocation: "জিউপাড়া বাজার, পুঠিয়া উপজেলা সদর থেকে উত্তরে।",
    transitGuide: "পুঠিয়া উপজেলা সদর থেকে উত্তরে সিএনজি বা অটো রিকশায় চড়ে জিউপাড়া বাজারে আসলেই ইউনিয়ন পরিষদ ভবন লক্ষ্য করা যাবে। সময় লাগবে প্রায় ১৫-২০ মিনিট।",
    members: [
      { ward: "১নং ওয়ার্ড", name: "মোঃ রুহুল আমিন", designation: "ইউপি সদস্য" },
      { ward: "২নং ওয়ার্ড", name: "মোঃ সাইদুল ইসলাম", designation: "ইউপি সদস্য" },
      { ward: "৩নং ওয়ার্ড", name: "মোঃ আইয়ুব আলী", designation: "ইউপি সদস্য" },
      { ward: "৪নং ওয়ার্ড", name: "মোঃ আব্দুল ওহাব", designation: "ইউপি সদস্য" },
      { ward: "৫নং ওয়ার্ড", name: "মোঃ রিয়াজ উদ্দিন", designation: "ইউপি সদস্য" },
      { ward: "৬নং ওয়ার্ড", name: "মোঃ মিজানুর রহমান", designation: "ইউপি সদস্য" },
      { ward: "৭নং ওয়ার্ড", name: "মোঃ মোশাররফ হোসেন", designation: "ইউপি সদস্য" },
      { ward: "৮নং ওয়ার্ড", name: "মোঃ লুৎফর রহমান", designation: "ইউপি সদস্য" },
      { ward: "৯নং ওয়ার্ড", name: "মোঃ কামরুজ্জামান", designation: "ইউপি সদস্য" },
      { ward: "সংরক্ষিত ১", name: "মোসাঃ লাইলী বেগম", designation: "সংরক্ষিত নারী সদস্য (১, ২, ৩ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ২", name: "মোসাঃ নাজনীন সুলতানা", designation: "সংরক্ষিত নারী সদস্য (৪, ৫, ৬ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ৩", name: "মোসাঃ আকলিমা আক্তার", designation: "সংরক্ষিত নারী সদস্য (৭, ৮, ৯ নং ওয়ার্ড)" },
    ]
  },
  {
    id: "shilmaria",
    number: "৫নং",
    name: "শিলমাড়িয়া ইউনিয়ন পরিষদ",
    area: "৪২.৩ বর্গ কিমি",
    villagesCount: "৩৪টি",
    population: "৪৯,২০০ জন",
    literacy: "৪৬.৭%",
    mouzas: "৩১টি",
    chairman: { name: "মোঃ সাজ্জাদ হোসেন মুকুল", phone: "01711-567890" },
    secretary: { name: "মোঃ আমিনুল ইসলাম", phone: "01712-678901" },
    udc: { entrepreneur: "মোসাঃ সালমা আক্তার", phone: "01713-789012", email: "udc.shilmaria@gmail.com" },
    history: "শিলমাড়িয়া ইউনিয়ন পরিষদ পুঠিয়া উপজেলার আয়তনে এবং জনসংখ্যায় সর্ববৃহৎ ইউনিয়ন পরিষদ। এই ইউনিয়নটি বৈচিত্র্যময় গ্রামীণ কৃষি ও মৎস্য চাষে অত্যন্ত উন্নত। এখানে বিল ও বিস্তীর্ণ উর্বর মাঠ রয়েছে।",
    hqLocation: "শিলমাড়িয়া বাজার সংলগ্ন ইউনিয়ন পরিষদ কমপ্লেক্স।",
    transitGuide: "পুঠিয়া উপজেলা সদর থেকে ইজিবাইক বা ভ্যানে করে সরাসরি শিলমাড়িয়া বাজারে যাওয়া যায়। আঁকাবাঁকা সুন্দর গ্রামীণ রাস্তা দিয়ে যেতে প্রায় ২৫ মিনিট সময় লাগে।",
    members: [
      { ward: "১নং ওয়ার্ড", name: "মোঃ সিরাজুল ইসলাম", designation: "ইউপি সদস্য" },
      { ward: "২নং ওয়ার্ড", name: "মোঃ বাবলু মিয়া", designation: "ইউপি সদস্য" },
      { ward: "৩নং ওয়ার্ড", name: "মোঃ শাহাদাত হোসেন", designation: "ইউপি সদস্য" },
      { ward: "৪নং ওয়ার্ড", name: "মোঃ আনিসুর রহমান", designation: "ইউপি সদস্য" },
      { ward: "৫নং ওয়ার্ড", name: "মোঃ মোস্তাকিম আলী", designation: "ইউপি সদস্য" },
      { ward: "৬নং ওয়ার্ড", name: "মোঃ আশরাফুল ইসলাম", designation: "ইউপি সদস্য" },
      { ward: "৭নং ওয়ার্ড", name: "মোঃ মাইনুল ইসলাম", designation: "ইউপি সদস্য" },
      { ward: "৮নং ওয়ার্ড", name: "মোঃ সাইদুর রহমান", designation: "ইউপি সদস্য" },
      { ward: "৯নং ওয়ার্ড", name: "মোঃ এনামুল হক", designation: "ইউপি সদস্য" },
      { ward: "সংরক্ষিত ১", name: "মোসাঃ মাজেদা খাতুন", designation: "সংরক্ষিত নারী সদস্য (১, ২, ৩ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ২", name: "মোসাঃ রোকেয়া বেগম", designation: "সংরক্ষিত নারী সদস্য (৪, ৫, ৬ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ৩", name: "মোসাঃ রিনা খাতুন", designation: "সংরক্ষিত নারী সদস্য (৭, ৮, ৯ নং ওয়ার্ড)" },
    ]
  },
  {
    id: "bhalukgachi",
    number: "৬নং",
    name: "ভালুকগাছী ইউনিয়ন পরিষদ",
    area: "২৬.১২ বর্গ কিমি",
    villagesCount: "২১টি",
    population: "৩৫,১০০ জন",
    literacy: "৫৩.১%",
    mouzas: "১৯টি",
    chairman: { name: "মোঃ একরামুল হক", phone: "01711-678901" },
    secretary: { name: "মোঃ মতিউর রহমান", phone: "01712-789012" },
    udc: { entrepreneur: "মোঃ আরিফুল ইসলাম", phone: "01713-890123", email: "udc.bhalukgachi@gmail.com" },
    history: "ভালুকগাছী ইউনিয়ন পরিষদ পুঠিয়া উপজেলার অন্যতম শিক্ষা ও সামাজিক ঐতিহ্যমণ্ডিত ইউনিয়ন। এখানে বেশ কয়েকটি মাধ্যমিক ও প্রাথমিক বিদ্যালয় এবং কলেজ রয়েছে। এই ইউনিয়নে ধান ও পানের উৎপাদন প্রচুর পরিমাণে হয়।",
    hqLocation: "ভালুকগাছী বাজার ও কলেজের সন্নিকটে ইউপি ভবন।",
    transitGuide: "পুঠিয়া সদর থেকে ভ্যান বা অটোরিকশায় চড়ে ভালুকগাছী অভিমুখে রওয়ানা দিলে প্রায় ১৫ মিনিটে সুন্দর ছায়াশুনিবিড় রাস্তায় ভালুকগাছী ইউনিয়ন পরিষদে পৌঁছানো যায়।",
    members: [
      { ward: "১নং ওয়ার্ড", name: "মোঃ মহসিন আলী", designation: "ইউপি সদস্য" },
      { ward: "২নং ওয়ার্ড", name: "মোঃ শরিফুল ইসলাম", designation: "ইউপি সদস্য" },
      { ward: "৩নং ওয়ার্ড", name: "মোঃ জালাল উদ্দিন", designation: "ইউপি সদস্য" },
      { ward: "৪নং ওয়ার্ড", name: "মোঃ ওবাইদুর রহমান", designation: "ইউপি সদস্য" },
      { ward: "৫নং ওয়ার্ড", name: "মোঃ আব্দুল হাকিম", designation: "ইউপি সদস্য" },
      { ward: "৬নং ওয়ার্ড", name: "মোঃ রেজাউল করিম", designation: "ইউপি সদস্য" },
      { ward: "৭নং ওয়ার্ড", name: "মোঃ কামরুল হাসান", designation: "ইউপি সদস্য" },
      { ward: "৮নং ওয়ার্ড", name: "মোঃ মোস্তাফিজুর রহমান", designation: "ইউপি সদস্য" },
      { ward: "৯নং ওয়ার্ড", name: "মোঃ ইদ্রিস আলী", designation: "ইউপি সদস্য" },
      { ward: "সংরক্ষিত ১", name: "মোসাঃ শিরিন আক্তার", designation: "সংরক্ষিত নারী সদস্য (১, ২, ৩ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ২", name: "মোসাঃ বিলকিস বেগম", designation: "সংরক্ষিত নারী সদস্য (৪, ৫, ৬ নং ওয়ার্ড)" },
      { ward: "সংরক্ষিত ৩", name: "মোসাঃ শাহানাজ বেগম", designation: "সংরক্ষিত নারী সদস্য (৭, ৮, ৯ নং ওয়ার্ড)" },
    ]
  }
];

export function UnionGrid({ onGoBack, onSimulateCall }: UnionGridProps) {
  const [selectedUnion, setSelectedUnion] = useState<UnionDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "udc" | "transit">("overview");

  const handleCall = (phone: string, name: string) => {
    if (onSimulateCall) {
      onSimulateCall(phone, name);
    } else {
      window.alert(`${name} কে কল করা হচ্ছে (${phone})...`);
    }
  };

  return (
    <div className="p-4 bg-[#FAF9F6] min-h-screen font-sans">
      {!selectedUnion ? (
        <div className="space-y-6">
          {/* Main Title Banner */}
          <div className="p-6 rounded-[24px] text-white shadow-lg relative overflow-hidden bg-gradient-to-br from-[#125836] to-[#0A2F1C]">
            <div className="absolute right-0 bottom-0 w-32 h-32 text-white/5 -mb-4 -mr-4">
              <Building2 className="w-full h-full" />
            </div>
            <div className="relative z-10">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-block mb-3 border border-white/20">
                প্রশাসনিক ইউনিট
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight leading-tight">
                পুঠিয়ার ইউনিয়ন
              </h2>
              <p className="text-xs sm:text-sm text-neutral-200/90 max-w-xl leading-relaxed text-justify">
                পুঠিয়া উপজেলার আওতাধীন ৬টি ইউনিয়ন পরিষদের আয়তন, জনসংখ্যা, ডিজিটাল সেবা এবং নির্বাচিত জনপ্রতিনিধিদের সম্পূর্ণ তথ্যকোষ।
              </p>
              
              <div className="mt-5 flex gap-3">
                <button 
                  onClick={onGoBack}
                  className="bg-white/25 hover:bg-white/35 text-white text-xs font-bold px-4 py-2 rounded-full border border-white/25 transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
                  <span>ফিরে যান</span>
                </button>
              </div>
            </div>
          </div>

          {/* Unions Grid List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {UNIONS_DATA.map((union) => (
              <div 
                key={union.id}
                onClick={() => {
                  setSelectedUnion(union);
                  setActiveTab("overview");
                }}
                className="bg-white border border-neutral-100 hover:border-[#125836]/40 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 p-5 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#125836]/5 rounded-bl-full flex items-center justify-center text-xs font-bold text-[#125836]/60 pr-2 pt-2 group-hover:bg-[#125836]/10 transition-colors">
                  {union.number}
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#125836]/10 text-[#125836] flex items-center justify-center font-bold text-sm">
                      {union.number.replace("নং", "")}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#1A1A1A] group-hover:text-[#125836] transition-colors text-[16px]">
                        {union.name}
                      </h4>
                      <p className="text-[11px] text-neutral-400 font-medium">পুঠিয়া, রাজশাহী</p>
                    </div>
                  </div>

                  <div className="border-t border-neutral-50/80 pt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-neutral-400" /> আয়তন:</span>
                      <span className="font-bold text-neutral-700">{union.area}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3 text-neutral-400" /> জনসংখ্যা:</span>
                      <span className="font-bold text-neutral-700">{union.population}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3 text-neutral-400" /> চেয়ারম্যান:</span>
                      <span className="font-extrabold text-neutral-800">{union.chairman.name}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-50/80 flex items-center justify-between text-[11.5px] font-bold text-[#125836]">
                  <span>বিস্তারিত প্রোফাইল দেখুন</span>
                  <span>➔</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Detail Header */}
          <div className="p-6 rounded-[24px] text-white shadow-lg relative overflow-hidden bg-gradient-to-br from-[#125836] to-[#0A2F1C]">
            <div className="relative z-10">
              <button 
                onClick={() => setSelectedUnion(null)}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 transition inline-flex items-center gap-1.5 cursor-pointer mb-4"
              >
                <ArrowLeft className="w-3 h-3" strokeWidth={3} />
                <span>সকল ইউনিয়নে ফিরে যান</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/20 text-white">
                  {selectedUnion.number} ইউনিয়ন পরিষদ
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 mb-2">
                {selectedUnion.name}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-200/90 max-w-2xl leading-relaxed text-justify">
                {selectedUnion.history}
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", marginBottom: "20px" }}>
            {[
              { id: "overview", label: "এক নজরে", icon: Info },
              { id: "members", label: "জনপ্রতিনিধি", icon: Users },
              { id: "udc", label: "সেন্টার", icon: Globe },
              { id: "transit", label: "যোগাযোগ", icon: MapPin }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{ 
                    flex: 1, 
                    minWidth: 0, 
                    background: isActive ? "#eff6ff" : "#ffffff", 
                    color: isActive ? "#1e3a8a" : "#1e293b", 
                    border: isActive ? "1.5px solid #3b82f6" : "1px solid #e2e8f0", 
                    padding: "10px 2px", 
                    borderRadius: "16px", 
                    textAlign: "center", 
                    cursor: "pointer", 
                    transition: "all 0.2s" 
                  }}
                  className="hover:border-blue-400 hover:shadow-sm flex flex-col items-center justify-center group"
                >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isActive ? 'bg-blue-100' : 'bg-gray-50'} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{tab.label}</div>
                </div>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-6 min-h-[300px]">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[16px] font-extrabold text-[#1A1A1A] mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#125836]" /> মৌলিক পরিসংখ্যান
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { icon: "📐", label: "মোট আয়তন", value: selectedUnion.area },
                      { icon: "🏡", label: "গ্রাম সংখ্যা", value: selectedUnion.villagesCount },
                      { icon: "👥", label: "জনসংখ্যা", value: selectedUnion.population },
                      { icon: "🎓", label: "শিক্ষার হার", value: selectedUnion.literacy },
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-neutral-50/60 border border-neutral-100 p-4 rounded-xl text-center">
                        <span className="text-xl mb-1 block">{stat.icon}</span>
                        <span className="text-[11px] text-neutral-400 font-semibold block">{stat.label}</span>
                        <span className="text-[14px] font-bold text-neutral-800 mt-0.5 block">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-5">
                  <h3 className="text-[16px] font-extrabold text-[#1A1A1A] mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#125836]" /> প্রশাসনিক ও ভৌগোলিক তথ্য
                  </h3>
                  <div className="bg-neutral-50/50 rounded-xl p-4 space-y-2.5 text-xs text-neutral-600">
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="font-bold">মোট মৌজা সংখ্যা:</span>
                      <span className="font-extrabold text-neutral-800">{selectedUnion.mouzas}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="font-bold">উপজেলা থেকে দূরত্ব:</span>
                      <span className="font-extrabold text-neutral-800">প্রায় ৫-১৫ কিলোমিটার</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="font-bold">পরিষদ কমপ্লেক্সের অবস্থান:</span>
                      <span className="font-extrabold text-neutral-800">{selectedUnion.hqLocation}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: REPRESENTATIVES & WARD MEMBERS */}
            {activeTab === "members" && (
              <div className="space-y-6">
                {/* Core Leaders */}
                <div>
                  <h3 className="text-[16px] font-extrabold text-[#1A1A1A] mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#125836]" /> প্রধান অভিভাবকবৃন্দ
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Chairman Profile */}
                    <div className="bg-neutral-50/50 border border-neutral-100 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#125836]/10 text-[#125836] flex items-center justify-center text-xl">
                          👨‍💼
                        </div>
                        <div>
                          <span className="bg-[#125836]/10 text-[#125836] px-2 py-0.5 rounded text-[9px] font-bold">ইউপি চেয়ারম্যান</span>
                          <h4 className="font-bold text-neutral-800 text-sm mt-0.5">{selectedUnion.chairman.name}</h4>
                          <p className="text-[10px] text-neutral-400 font-medium">মোবাইল: {selectedUnion.chairman.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCall(selectedUnion.chairman.phone, selectedUnion.chairman.name)}
                        className="bg-[#125836] text-white p-2.5 rounded-full hover:bg-emerald-700 transition cursor-pointer shadow-xs active:scale-95"
                        title="সরাসরি কল করুন"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Secretary Profile */}
                    <div className="bg-neutral-50/50 border border-neutral-100 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                          📜
                        </div>
                        <div>
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[9px] font-bold">পরিষদ সচিব</span>
                          <h4 className="font-bold text-neutral-800 text-sm mt-0.5">{selectedUnion.secretary.name}</h4>
                          <p className="text-[10px] text-neutral-400 font-medium">মোবাইল: {selectedUnion.secretary.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCall(selectedUnion.secretary.phone, selectedUnion.secretary.name)}
                        className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition cursor-pointer shadow-xs active:scale-95"
                        title="সরাসরি কল করুন"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ward Members List */}
                <div className="border-t border-neutral-100 pt-5">
                  <h3 className="text-[16px] font-extrabold text-[#1A1A1A] mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#125836]" /> ওয়ার্ড সদস্য ও মেম্বারবৃন্দ
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedUnion.members.map((member, idx) => (
                      <div key={idx} className="bg-white border border-neutral-100 p-3.5 rounded-xl flex items-center gap-3 shadow-xs">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                          member.designation.includes("সংরক্ষিত")
                            ? "bg-rose-50 text-rose-600"
                            : "bg-neutral-150 text-neutral-700"
                        }`}>
                          {member.designation.includes("সংরক্ষিত") ? "👩" : "👤"}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-neutral-800 text-xs">{member.name}</h5>
                          <p className="text-[10px] text-neutral-400 font-semibold">{member.ward} • {member.designation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DIGITAL CENTER */}
            {activeTab === "udc" && (
              <div className="space-y-6">
                <div className="bg-emerald-50/50 border border-emerald-100/50 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#125836] text-white rounded-xl flex items-center justify-center text-xl font-bold">
                      💻
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-800 text-sm">ইউনিয়ন ডিজিটাল সেন্টার (UDC)</h4>
                      <p className="text-[11px] text-[#125836] font-semibold">তথ্য ও অনলাইন নাগরিক সেবা হাব</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-neutral-500">
                    <span className="font-bold text-neutral-700 block">উদ্যোক্তা: {selectedUnion.udc.entrepreneur}</span>
                    <span className="block mt-0.5">ইমেইল: {selectedUnion.udc.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-neutral-100 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 border-b border-neutral-50 pb-2">
                      <FileText className="w-4 h-4 text-[#125836]" /> প্রধান নাগরিক সেবা
                    </h4>
                    <ul className="text-xs text-neutral-600 space-y-2 list-none p-0 m-0">
                      <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> জন্ম ও মৃত্যু নিবন্ধন (নতুন আবেদন ও সংশোধন)</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> নাগরিকত্ব ও ওয়ারিশ সনদপত্রের আবেদন</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> ট্রেড লাইসেন্স ও ব্যবসার প্রত্যয়নপত্র</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> বয়স্ক, বিধবা ও প্রতিবন্ধী ভাতার অনলাইন নিবন্ধন</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> সরকারি ফরম ও ই-পরিষেবা সংক্রান্ত পরামর্শ</li>
                    </ul>
                  </div>

                  <div className="border border-neutral-100 p-4 rounded-xl space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 border-b border-neutral-50 pb-2">
                        <Calendar className="w-4 h-4 text-[#125836]" /> UDC যোগাযোগের তথ্য
                      </h4>
                      <p className="text-xs text-neutral-500 leading-relaxed mt-2">
                        অনলাইন আবেদন সংক্রান্ত যেকোনো কারিগরি সমস্যা বা দ্রুত ইউডিসি সার্ভিস পেতে সরাসরি ডিজিটাল উদ্যোক্তার সাথে যোগাযোগ করুন।
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCall(selectedUnion.udc.phone, `${selectedUnion.udc.entrepreneur} (UDC)`)}
                        className="flex-1 bg-[#125836] text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" /> কল উদ্যোক্তা
                      </button>
                      <a 
                        href={`mailto:${selectedUnion.udc.email}`}
                        className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-200 text-center flex items-center justify-center"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TRANSIT GUIDE & BORDERS */}
            {activeTab === "transit" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#125836]" /> কার্যালয় লোকেশন ও ঠিকানা
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed text-justify">
                      {selectedUnion.hqLocation}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                      🛣️ যাতায়াত নির্দেশিকা (Transit Route)
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed text-justify">
                      {selectedUnion.transitGuide}
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-5 space-y-3">
                  <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                    🗺️ ডিজিটাল লেআউট ম্যাপ ও চতুর্দশ সীমানা
                  </h4>
                  <div className="bg-neutral-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-dashed border-neutral-200">
                    <div className="w-16 h-16 bg-[#125836]/10 text-[#125836] rounded-full flex items-center justify-center mb-3">
                      <MapPin className="w-6 h-6 animate-bounce" />
                    </div>
                    <span className="text-xs font-bold text-neutral-700">ডিজিটাল ম্যাপ ও জিপিএস ট্র্যাক ইস্টার</span>
                    <p className="text-[10px] text-neutral-400 mt-1 max-w-sm">
                      মৌজা খতিয়ান ও স্যাটেলাইট ভিউ অনুযায়ী {selectedUnion.name} এর সীমানা ও ভৌগোলিক কোঅর্ডিনেটস সফলভাবে ট্র্যাক করা হয়েছে।
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
