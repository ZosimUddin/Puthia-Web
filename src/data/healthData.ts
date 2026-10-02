export interface Doctor {
  name: string;
  spec: string;
  time: string;
  fee: string;
  phone: string;
}

export interface HealthService {
  id: string;
  name: string;
  type: string;
  phone: string;
  address: string;
  hours: string;
  rating: number;
  mapUrl: string;
  image: string;
  about: string;
  departments: string[];
  doctors: Doctor[];
  gallery: string[];
  establishedYear?: string;
  email?: string;
  opdHours?: string;
  emergencyHours?: string;
  hasEmergency24h?: boolean;
  totalBeds?: number;
  bedsAvailable?: number;
  lat?: number;
  lng?: number;
}

export const DEFAULT_HEALTH_SERVICES: HealthService[] = [
  {
    id: "puthia-upazila-complex",
    name: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
    type: "সরকারি হাসপাতাল",
    phone: "01711-456789",
    address: "পুঠিয়া থানা মোড় সংলগ্ন, পুঠিয়া, রাজশাহী",
    hours: "২৪ ঘণ্টা খোলা",
    rating: 4.6,
    mapUrl: "https://maps.google.com/?q=Puthia+Upazila+Health+Complex",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80",
    about: "পুঠিয়া উপজেলার প্রধান সরকারি চিকিৎসা কেন্দ্র। এখানে বিনামূল্যে আউটডোর সেবা, স্বল্পমূল্যে ইনডোর ভর্তি, এক্স-রে, আল্ট্রাসোনোগ্রাফি, জরুরি ও সাধারণ প্রসূতি সেবা প্রদান করা হয়।",
    departments: ["জরুরি বিভাগ", "বহির্বিভাগ (OPD)", "মা ও শিশু ওয়ার্ড", "সার্জারি বিভাগ", "দাঁত ও চক্ষু বিভাগ"],
    doctors: [
      { name: "ডা. সুদীপ চক্রবর্তী", spec: "উপজেলা স্বাস্থ্য কর্মকর্তা (মেডিসিন)", time: "রবি - বৃহস্পতি (সকাল ৯:০০ - দুপুর ২:০০)", fee: "সরকারি ফি (১০ টাকা)", phone: "01711-456789" },
      { name: "ডা. ফাতেমা তুজ জোহরা", spec: "গাইনী ও স্ত্রীরোগ বিশেষজ্ঞ", time: "সোম - বুধ (সকাল ৯:০০ - দুপুর ২:০০)", fee: "সরকারি ফি (১০ টাকা)", phone: "01711-456790" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80"
    ],
    establishedYear: "১৯৭২",
    email: "puthia.uhc@dghs.gov.bd",
    opdHours: "সকাল ৮:০০ - দুপুর ২:৩০",
    emergencyHours: "২৪ ঘণ্টা খোলা",
    hasEmergency24h: true,
    totalBeds: 50,
    bedsAvailable: 12,
    lat: 24.3643,
    lng: 88.8351
  },
  {
    id: "puthia-mother-child",
    name: "পুঠিয়া মা ও শিশু কল্যাণ কেন্দ্র",
    type: "মা ও শিশু স্বাস্থ্য",
    phone: "01712-345678",
    address: "রাজবাড়ি সংলগ্ন রোড, পুঠিয়া, রাজশাহী",
    hours: "সকাল ৮:০০ - বিকাল ৪:০০",
    rating: 4.4,
    mapUrl: "https://maps.google.com/?q=Puthia+Mother+and+Child+Welfare+Centre",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
    about: "মা ও নবজাতক শিশুদের জরুরি স্বাস্থ্য সুরক্ষায় নিয়োজিত বিশেষ সরকারি স্বাস্থ্য কেন্দ্র। গর্ভবতী মায়েদের নিয়মিত চেকআপ ও টিকাদান সম্পন্ন করা হয়।",
    departments: ["প্রসব পূর্ব সেবা (ANC)", "প্রসব পরবর্তী সেবা (PNC)", "পরিকল্পিত পরিবার পরিকল্পনা", "শিশু টিকাদান"],
    doctors: [
      { name: "ডা. শায়লা ইয়াসমিন", spec: "মা ও শিশু রোগ বিশেষজ্ঞ", time: "শনিবার - বৃহস্পতিবার (সকাল ৮:৩০ - দুপুর ১:৩০)", fee: "বিনামূল্যে (সরকারি)", phone: "01712-345678" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1531012244734-116382410a31?auto=format&fit=crop&w=400&q=80"
    ],
    establishedYear: "১৯৮৮",
    email: "mcwc.puthia@dghs.gov.bd",
    opdHours: "সকাল ৮:০০ - দুপুর ২:০০",
    emergencyHours: "২৪ ঘণ্টা (প্রসূতি সেবা)",
    hasEmergency24h: true,
    totalBeds: 10,
    bedsAvailable: 4,
    lat: 24.3670,
    lng: 88.8335
  },
  {
    id: "medical-aid-diagnostic",
    name: "মেডিকেল এইড ডিজিটাল ক্লিনিক ও ডায়াগনস্টিক",
    type: "প্রাইভেট ক্লিনিক",
    phone: "01730-889900",
    address: "ঝলমলিয়া বাজার, পুঠিয়া, রাজশাহী",
    hours: "সকাল ৭:০০ - রাত ১০:০০",
    rating: 4.5,
    mapUrl: "https://maps.google.com/?q=Medical+Aid+Clinic+Puthia",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
    about: "আধুনিক যন্ত্রপাতি ও ডিজিটাল ডায়াগনস্টিক ল্যাব সুবিধা সমৃদ্ধ একটি বেসরকারি ক্লিনিক। এখানে বিভিন্ন মেডিকেল কলেজের অভিজ্ঞ কনসালটেন্ট চিকিৎসাগণ চেম্বার করে থাকেন।",
    departments: ["ডিজিটাল প্যাথলজি", "রঙিন আল্ট্রাসোনোগ্রাফি", "ডিজিটাল এক্স-রে", "ইসিজি ও কার্ডিওলজি", "সার্জারি বিভাগ", "শিশু বিভাগ", "মেডিসিন"],
    doctors: [
      { name: "ডা. মো. রফিকুল ইসলাম", spec: "মেডিসিন ও হৃদরোগ বিশেষজ্ঞ (রাজশাহী মেডিকেল)", time: "প্রতিদিন (বিকাল ৪:০০ - রাত ৮:০০)", fee: "৫০০ টাকা", phone: "01730-889900" },
      { name: "ডা. নাসরিন সুলতানা", spec: "শিশুরোগ ও হরমোন বিশেষজ্ঞ", time: "সোম ও বুধ (বিকাল ৫:০০ - রাত ৯:০০)", fee: "৪০০ টাকা", phone: "01730-889901" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=400&q=80"
    ],
    establishedYear: "২০১৫",
    email: "medicalaid.puthia@gmail.com",
    opdHours: "বিকাল ৩:০০ - রাত ৯:০০",
    emergencyHours: "সকাল ৭:০০ - রাত ১০:০০",
    hasEmergency24h: false,
    totalBeds: 20,
    bedsAvailable: 7,
    lat: 24.3595,
    lng: 88.8520
  },
  {
    id: "popular-dental-care",
    name: "পপুলার ডায়াগনস্টিক অ্যান্ড ডেন্টাল কেয়ার",
    type: "ডেন্টাল ক্লিনিক",
    phone: "01715-112233",
    address: "পুঠিয়া বাসস্ট্যান্ড মোড়, রাজশাহী",
    hours: "সকাল ৯:০০ - রাত ৯:০০",
    rating: 4.8,
    mapUrl: "https://maps.google.com/?q=Popular+Dental+Care+Puthia",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=600&q=80",
    about: "দাঁতের যাবতীয় জটিল রোগ ও রূপচর্চার নির্ভরযোগ্য চিকিৎসালয়। আধুনিক ডেন্টাল চেয়ার ও জীবাণুমুক্ত নিরাপদ চিকিৎসার নিশ্চয়তা প্রদানকারী একমাত্র বিশেষজ্ঞ সেন্টার।",
    departments: ["রুট ক্যানেল থেরাপি", "স্কেলিং ও পলিশিং", "দাঁত বাঁধানো ও ক্যাপ", "দাঁত তোলা ও সার্জারি"],
    doctors: [
      { name: "ডা. মো. কামরুজ্জামান (ডিডিএস)", spec: "দন্ত রোগ বিশেষজ্ঞ ও সার্জন", time: "প্রতিদিন (সকাল ১০:০০ - রাত ৮:০০, শুক্রবার বন্ধ)", fee: "৩০০ টাকা", phone: "01715-112233" }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1461532252291-68627e487332?auto=format&fit=crop&w=400&q=80"
    ],
    establishedYear: "২০১৮",
    email: "populardental.puthia@gmail.com",
    opdHours: "সকাল ৯:০০ - রাত ৯:০০",
    emergencyHours: "সকাল ৯:০০ - রাত ৯:০০",
    hasEmergency24h: false,
    totalBeds: 0,
    bedsAvailable: 0,
    lat: 24.3655,
    lng: 88.8315
  },
  {
    id: "puthia-eye-care",
    name: "রাজশাহী আই হসপিটাল (পুঠিয়া শাখা)",
    type: "চক্ষু সেবা",
    phone: "01716-445566",
    address: "উপজেলা মোড় সংলগ্ন, পুঠিয়া, রাজশাহী",
    hours: "সকাল ৯:০০ - বিকাল ৫:০০",
    rating: 4.3,
    mapUrl: "https://maps.google.com/?q=Eye+Hospital+Puthia",
    image: "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?auto=format&fit=crop&w=600&q=80",
    about: "রাজশাহী আই হসপিটালের পুঠিয়া শাখা চক্ষু চিকিৎসার একটি নির্ভরযোগ্য নাম। এখানে কম্পিউটারাইজড চোখ পরীক্ষা, চশমা পরিমাপ ও ছানি অপারেশনের পরামর্শ প্রদান করা হয়।",
    departments: ["কম্পিউটার চোখ পরীক্ষা", "ছানি অপারেশন ইউনিট", "চশমা কালেকশন ইস্টার"],
    doctors: [
      { name: "ডা. মো. আবু বকর সিদ্দিক", spec: "চক্ষু রোগ বিশেষজ্ঞ ও ফ্যাকো সার্জন", time: "শনি, সোম ও বুধ (সকাল ১০:০০ - বিকাল ৪:০০)", fee: "৩০০ টাকা", phone: "01716-445566" }
    ],
    gallery: [],
    establishedYear: "২০২০",
    email: "eyehospital.puthia@gmail.com",
    opdHours: "সকাল ৯:০০ - বিকাল ৫:০০",
    emergencyHours: "সকাল ৯:০০ - বিকাল ৫:০০",
    hasEmergency24h: false,
    totalBeds: 8,
    bedsAvailable: 3,
    lat: 24.3638,
    lng: 88.8340
  },
  {
    id: "sandhani-ambulance",
    name: "সন্ধানী অ্যাম্বুলেন্স ও ডেডবডি ক্যারিয়ার সার্ভিস",
    type: "অ্যাম্বুলেন্স",
    phone: "01718-223344",
    address: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স গেট সংলগ্ন",
    hours: "২৪ ঘণ্টা খোলা (জরুরি)",
    rating: 4.7,
    mapUrl: "https://maps.google.com/?q=Ambulance+Service+Puthia",
    image: "https://images.unsplash.com/photo-1612277795421-9bc7e6573f54?auto=format&fit=crop&w=600&q=80",
    about: "জরুরি রোগী পরিবহনে পুঠিয়া ও রাজশাহীর যেকোনো গন্তব্যে দ্রুততম সময়ে পৌঁছাতে প্রস্তুত অক্সিজেন ও ফার্স্ট এইড সম্বলিত আধুনিক লাইফ সাপোর্ট অ্যাম্বুলেন্স।",
    departments: ["জরুরি লাইফ সাপোর্ট", "সাধারণ অ্যাম্বুলেন্স", "রাজশাহী মেডিকেল ট্রিপ"],
    doctors: [],
    gallery: [],
    establishedYear: "২০১০",
    opdHours: "২৪ ঘণ্টা খোলা",
    emergencyHours: "২৪ ঘণ্টা খোলা",
    hasEmergency24h: true,
    totalBeds: 0,
    bedsAvailable: 0,
    lat: 24.3640,
    lng: 88.8355
  },
  {
    id: "puthia-model-pharmacy",
    name: "মডেল ফার্মেসী পুঠিয়া",
    type: "ফার্মেসি",
    phone: "01719-778899",
    address: "উপজেলা গেটের বিপরীতে, পুঠিয়া",
    hours: "২৪ ঘণ্টা খোলা",
    rating: 4.5,
    mapUrl: "https://maps.google.com/?q=Model+Pharmacy+Puthia",
    image: "https://images.unsplash.com/photo-1607619056574-7b8d304f3b6f?auto=format&fit=crop&w=600&q=80",
    about: "শতভাগ আসল ও আমদানিকৃত ওষুধ বিক্রির নির্ভরযোগ্য মডেল ফার্মেসী। এখানে সার্বক্ষণিক অভিজ্ঞ ফার্মাসিস্ট নিয়োজিত থাকেন এবং ডায়াবেটিস ও রক্তচাপ পরিমাপ করা হয়।",
    departments: ["ওষুধ সরবরাহ", "ইনসুলিন কুলিং জোন", "জরুরি ফার্স্ট এইড কিট", "প্রেসার ও ডায়াবেটিস মাপ"],
    doctors: [],
    gallery: [],
    establishedYear: "২০২২",
    opdHours: "২৪ ঘণ্টা খোলা",
    emergencyHours: "২৪ ঘণ্টা খোলা",
    hasEmergency24h: true,
    totalBeds: 0,
    bedsAvailable: 0,
    lat: 24.3645,
    lng: 88.8348
  },
  {
    id: "baneshwar-general-hospital-diagnostic",
    name: "বানেশ্বর জেনারেল হসপিটাল এন্ড স্পেশালাইজড ডায়াগনস্টিক সেন্টার",
    type: "বেসরকারি হাসপাতাল ও ডায়াগনস্টিক",
    phone: "যাচাই প্রয়োজন",
    email: "baneshwarhospital21@gmail.com",
    address: "বানেশ্বর বাজার, পুঠিয়া, রাজশাহী",
    hours: "২৪ ঘণ্টা খোলা",
    rating: 4.8,
    mapUrl: "https://maps.google.com/?q=Baneswar+Puthia+Rajshahi",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
    about: "স্বাস্থ্য অধিদপ্তর (DGHS Code: 10033369) নিবন্ধিত বানেশ্বরের সমন্বিত জেনারেল হাসপাতাল ও স্পেশালাইজড ডায়াগনস্টিক সেন্টার।",
    departments: ["জরুরি বিভাগ", "ইনডোর রোগী পর্যবেক্ষণ", "ডিজিটাল প্যাথলজি", "কনসালটেশন ও ইসিজি"],
    doctors: [
      { name: "কনসালটেন্ট ফিজিশিয়ান", spec: "জেনারেল মেডিসিন ও কনসালটেশন", time: "সকাল ১০:০০ - দুপুর ২:০০ ও বিকাল ৫:০০ - রাত ৮:০০", fee: "৪০০ টাকা", phone: "যাচাই প্রয়োজন" }
    ],
    gallery: [],
    establishedYear: "২০২৩",
    opdHours: "সকাল ৮:০০ - রাত ৯:০০",
    emergencyHours: "২৪ ঘণ্টা খোলা",
    hasEmergency24h: true,
    totalBeds: 15,
    bedsAvailable: 5,
    lat: 24.3820,
    lng: 88.7850
  },
  {
    id: "green-life-hospital-baneshwar",
    name: "গ্রীণ লাইফ হসপিটাল",
    type: "বেসরকারি হাসপাতাল",
    phone: "যাচাই প্রয়োজন",
    email: "babulakterbabu@gmail.com",
    address: "বানেশ্বর, পুঠিয়া, রাজশাহী (রেজিস্ট্রিতে: Banesshor, Puthia)",
    hours: "২৪ ঘণ্টা খোলা",
    rating: 4.7,
    mapUrl: "https://maps.google.com/?q=Baneswar+Puthia+Rajshahi",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80",
    about: "স্বাস্থ্য অধিদপ্তর (DGHS Code: 10029050) অনুমোদিত বানেশ্বরের বেসরকারি হাসপাতাল ও ক্লিনিক।",
    departments: ["জরুরি বিভাগ", "ইনডোর ভর্তি", "প্রাথমিক চিকিৎসা"],
    doctors: [
      { name: "মেডিকেল অফিসার", spec: "জেনারেল মেডিসিন ও জরুরি চিকিৎসা", time: "২৪ ঘণ্টা অন-কল", fee: "৩৫০ টাকা", phone: "যাচাই প্রয়োজন" }
    ],
    gallery: [],
    establishedYear: "২০২২",
    opdHours: "সকাল ৯:০০ - রাত ৯:০০",
    emergencyHours: "২৪ ঘণ্টা খোলা",
    hasEmergency24h: true,
    totalBeds: 10,
    bedsAvailable: 4,
    lat: 24.3815,
    lng: 88.7840
  },
  {
    id: "puthia-square-hospital",
    name: "পুঠিয়া স্কয়ার হাসপাতাল",
    type: "বেসরকারি হাসপাতাল",
    phone: "যাচাই প্রয়োজন",
    address: "পুঠিয়া, রাজশাহী",
    hours: "২৪ ঘণ্টা খোলা",
    rating: 4.6,
    mapUrl: "https://maps.google.com/?q=Puthia+Rajshahi",
    image: "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?auto=format&fit=crop&w=600&q=80",
    about: "স্বাস্থ্য অধিদপ্তর (DGHS Code: 10033362) নিবন্ধিত পুঠিয়ার বেসরকারি হাসপাতাল।",
    departments: ["জরুরি স্বাস্থ্যসেবা", "ইনডোর বেড", "মেডিকেল কনসালটেশন"],
    doctors: [
      { name: "মেডিকেল অফিসার", spec: "জেনারেল প্র্যাকটিস", time: "সকাল ৯:০০ - রাত ৯:০০", fee: "৩৫০ টাকা", phone: "যাচাই প্রয়োজন" }
    ],
    gallery: [],
    establishedYear: "২০২১",
    opdHours: "সকাল ৯:০০ - রাত ৮:০০",
    emergencyHours: "২৪ ঘণ্টা খোলা",
    hasEmergency24h: true,
    totalBeds: 12,
    bedsAvailable: 4,
    lat: 24.3640,
    lng: 88.8350
  },
  {
    id: "puthia-diabetic-center-pathology",
    name: "পুঠিয়া ডায়াবেটিক সেন্টার এন্ড প্যাথলজি",
    type: "ডায়াগনস্টিক ও ডায়াবেটিক সেন্টার",
    phone: "01319-720001",
    address: "Puthia 6260, Bangladesh",
    hours: "সকাল ৭:০০ - রাত ৮:০০",
    rating: 4.5,
    mapUrl: "https://maps.google.com/?q=Puthia+6260+Bangladesh",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
    about: "পুঠিয়া এলাকায় ডায়াবেটিক কেয়ার ও প্যাথলজিক্যাল ডায়াগনস্টিক সেন্টার (Local Listing)। ডায়াবেটিস পরীক্ষা ও পরামর্শের জন্য নির্ভরযোগ্য প্রতিষ্ঠান।",
    departments: ["ডায়াবেটিস ইউনিট", "প্যাথলজি ল্যাব", "এইচবিএ১সি টেস্ট", "ইসিজি"],
    doctors: [
      { name: "ডায়াবেটিস কনসালটেন্ট", spec: "ডায়াবেটিস ও হরমোন পরামর্শ (সিসিডি-বারডেম)", time: "সকাল ৮:০০ - ১২:০০ ও বিকাল ৪:০০ - রাত ৮:০০", fee: "৪০০ টাকা", phone: "01319-720001" }
    ],
    gallery: [],
    establishedYear: "২০২০",
    opdHours: "সকাল ৭:০০ - রাত ৮:০০",
    emergencyHours: "সকাল ৭:০০ - রাত ৮:০০",
    hasEmergency24h: false,
    totalBeds: 0,
    bedsAvailable: 0,
    lat: 24.3650,
    lng: 88.8340
  }
];

export interface HealthTip {
  icon: string;
  category: string;
  title: string;
  description: string;
  points: string[];
}

export const HEALTH_TIPS: HealthTip[] = [
  {
    icon: "🍎",
    category: "পুষ্টি",
    title: "সুস্থ দেহে সুষম পুষ্টির গুরুত্ব",
    description: "দৈনন্দিন খাবারে পর্যাপ্ত ভিটামিন ও মিনারেল সমৃদ্ধ পুষ্টিকর উপাদান যোগ করা রোগ প্রতিরোধ ক্ষমতা দ্বিগুণ বাড়িয়ে তোলে।",
    points: [
      "প্রতিদিনের খাদ্যতালিকায় তাজা সবুজ শাকসবজি ও ফলমূল অন্তর্ভুক্ত করুন।",
      "অতিরিক্ত ভাজা-পোড়া, ফাস্টফুড ও প্রক্রিয়াজাত চিনিযুক্ত খাবার এড়িয়ে চলুন।",
      "শরীরের ওজন অনুযায়ী প্রতিদিন পর্যাপ্ত প্রোটিন ও ক্যালসিয়াম জাতীয় খাবার খান।"
    ]
  },
  {
    icon: "🏃",
    category: "ব্যায়াম",
    title: "শারীরিক ব্যায়াম ও কর্মক্ষমতা",
    description: "নিয়মিত পরিমিত ব্যায়াম হৃদযন্ত্রকে সবল রাখে, রক্তসঞ্চালন বৃদ্ধি করে এবং মানসিক অবসাদ দূর করতে টনিকের মতো কাজ করে।",
    points: [
      "প্রতিদিন কমপক্ষে ৩০ মিনিট দ্রুত হাঁটার বা হালকা ফ্রি-হ্যান্ড ব্যায়াম করার অভ্যাস করুন।",
      "অফিসে একনাগাড়ে বসে কাজ না করে প্রতি এক ঘণ্টায় অন্তত ৫ মিনিট উঠে দাঁড়ান বা সামান্য হাঁটাচলা করুন।",
      "সিঁড়ি ব্যবহারের মাধ্যমে পায়ের পেশী ও জয়েন্ট ভালো রাখুন।"
    ]
  },
  {
    icon: "💧",
    category: "নিরাপদ পানি",
    title: "পর্যাপ্ত ও বিশুদ্ধ পানি পান করুন",
    description: "বিশুদ্ধ পানি কিডনির সুস্থতা নিশ্চিত করে এবং হজম প্রক্রিয়া স্বাভাবিক রাখতে সবচেয়ে বড় চালিকা শক্তি।",
    points: [
      "একজন সুস্থ প্রাপ্তবয়স্ক মানুষের প্রতিদিন ৩-৪ লিটার বিশুদ্ধ পানি পান করা উচিত।",
      "খাবার পানি ফুটিয়ে অথবা বিশ্বস্ত ফিল্টার ব্যবহার করে জীবাণুমুক্ত ও আর্সেনিকমুক্ত করুন।",
      "দাঁড়ানোর চেয়ে বসে পানি পানের অভ্যাস করুন, এটি কিডনির উপর চাপ কমায়।"
    ]
  },
  {
    icon: "💉",
    category: "টিকাদান",
    title: "সময়মতো টিকা গ্রহণ ও শিশু সুরক্ষা",
    description: "টিকাদানের মাধ্যমে পোলিও, হাম, যক্ষ্মা ও ধনুষ্টঙ্কারের মতো প্রাণঘাতী রোগ থেকে ভবিষ্যৎ প্রজন্মকে চিরতরে মুক্ত রাখা সম্ভব।",
    points: [
      "ইপিআই (EPI) শিডিউল অনুযায়ী শিশুর জন্মের প্রথম দিন থেকে ১৫ মাস বয়সের মধ্যে সবকটি প্রয়োজনীয় টিকা দিন।",
      "গর্ভবতী মায়েদের জন্য ধনুষ্টঙ্কার এড়াতে টিটি (TT) টিকার ডোজ সঠিক সময়ে পূর্ণ করুন।",
      "টিকা কার্ডটি যত্ন সহকারে সংরক্ষণ করুন, এটি শিশুর ভবিষ্যৎ শিক্ষাজীবনেও প্রয়োজন হতে পারে।"
    ]
  },
  {
    icon: "🩺",
    category: "রোগ প্রতিরোধ",
    title: "নিয়মিত স্বাস্থ্য পরীক্ষা ও রোগ প্রতিরোধ",
    description: "নীরব ঘাতক ডায়াবেটিস ও উচ্চ রক্তচাপ এড়াতে স্বাস্থ্য পরীক্ষা ও নিয়ন্ত্রিত জীবনযাপনই সবচেয়ে কার্যকর প্রতিরোধ ব্যবস্থা।",
    points: [
      "চল্লিশোর্ধ্ব বয়সে পৌঁছানোর পর বছরে অন্তত একবার রক্তে সুগার, কোলেস্টেরল ও রক্তচাপ পরীক্ষা করুন।",
      "রান্নায় লবণের পরিমাণ হ্রাস করুন এবং খাবারে বাড়তি কাঁচা লবণ খাওয়া সম্পূর্ণ বন্ধ করুন।",
      "ধূমপান ও যেকোনো ধরনের তামাকজাত দ্রব্য গ্রহণ থেকে কঠোরভাবে বিরত থাকুন।"
    ]
  }
];

export interface HealthCamp {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  organizer: string;
  description: string;
  status: "upcoming" | "completed";
}

export const HEALTH_CAMPS: HealthCamp[] = [
  {
    id: "camp-1",
    title: "ফ্রি ডায়াবেটিস ও প্রেসার চেকআপ ক্যাম্প",
    type: "ফ্রি মেডিকেল ক্যাম্প",
    date: "২৫ জুলাই, ২০২৬",
    location: "পুঠিয়া মডেল উচ্চ বিদ্যালয় মাঠ প্রাঙ্গণ",
    organizer: "রোটারী ক্লাব অব পুঠিয়া ও মেডিকেল এইড ক্লিনিক",
    description: "বিশেষজ্ঞ মেডিসিন চিকিৎসক দ্বারা দিনব্যাপী বিনামূল্যে পরামর্শ ও রক্তে সুগার পরীক্ষা। প্রয়োজনীয় ওষুধও বিনামূল্যে দেওয়া হবে।",
    status: "upcoming"
  },
  {
    id: "camp-2",
    title: "উপজেলা রক্তদান কর্মসূচি ও হেলথ ক্যাম্প",
    type: "রক্তদান কর্মসূচি",
    date: "১০ আগস্ট, ২০২৬",
    location: "পুঠিয়া রাজবাড়ি মাঠ",
    organizer: "সন্ধানী রাজশাহী মেডিকেল কলেজ ইউনিট",
    description: "নিরাপদে স্বেচ্ছায় রক্তদান এবং বিনামূল্যে রক্তের গ্রুপ নির্ধারণ টেস্ট। সংগৃহীত রক্ত রাজশাহী মেডিকেল কলেজের ব্লাড ব্যাংকে জমা হবে।",
    status: "upcoming"
  },
  {
    id: "camp-3",
    title: "ফ্রি চক্ষু চিকিৎসা ও ছানি অপারেশন ক্যাম্প",
    type: "চোখের ক্যাম্প",
    date: "০৫ সেপ্টেম্বর, ২০২৬",
    location: "উপজেলা মিলনায়তন হল, পুঠিয়া",
    organizer: "রাজশাহী আই হসপিটাল ও লায়ন্স ক্লাব",
    description: "কম্পিউটার চোখ পরীক্ষা এবং ছানি রোগীদের বিনামূল্যে লেন্সসহ মাইক্রো-সার্জারি অপারেশনের জন্য বাছাইকরণ ক্যাম্প।",
    status: "upcoming"
  }
];

export interface HealthFAQ {
  q: string;
  a: string;
}

export const HEALTH_FAQS: HealthFAQ[] = [
  {
    q: "কোথায় অ্যাম্বুলেন্স পাব?",
    a: "আমাদের অ্যাম্বুলেন্স সেকশনে গিয়ে সন্ধানী অ্যাম্বুলেন্সসহ পুঠিয়ার নির্ভরযোগ্য জরুরি চালকদের মোবাইল নম্বর পেয়ে যাবেন। সরাসরি কল বাটনে চাপ দিয়ে যেকোনো সময় অ্যাম্বুলেন্স ডাকতে পারেন। এছাড়া পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্সেও নিজস্ব অ্যাম্বুলেন্স রয়েছে।"
  },
  {
    q: "জরুরি চিকিৎসার জন্য কোথায় যাব?",
    a: "যেকোনো মাঝারি থেকে গুরুতর জরুরি চিকিৎসার জন্য পুঠিয়া থানা মোড়ে অবস্থিত 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স'-এ সরাসরি চলে যান। সেখানে ২৪ ঘণ্টা জরুরি বিভাগ খোলা থাকে এবং সার্বক্ষণিক অন-কল চিকিৎসক নিয়োজিত থাকেন।"
  },
  {
    q: "রক্তদাতার সাথে কীভাবে যোগাযোগ করব?",
    a: "আমাদের রক্তদাতা ক্লাবের ড্যাশবোর্ডে গিয়ে আপনার প্রয়োজনীয় ব্লাড গ্রুপটি সিলেক্ট করুন। মুহূর্তের মধ্যে পুঠিয়া এলাকার রক্তদাতাদের মোবাইল নম্বর সহ তালিকা চলে আসবে। কল বাটনে চাপ দিয়ে সরাসরি যোগাযোগ করতে পারবেন।"
  },
  {
    q: "টিকাদান কেন্দ্র সমূহে সমূহে কোথায়?",
    a: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স এবং ইউনিয়ন উপ-স্বাস্থ্য কেন্দ্র সমূহে সমূহে সমূহে সরকারি ইপিআই (EPI) সূচি অনুযায়ী প্রতি সপ্তাহে নির্দিষ্ট দিনে টিকাদান কার্যক্রম চালানো হয়। এছাড়া প্রতিটি গ্রাম/পাড়ায় অস্থায়ী ইপিআই আউটরিচ কেন্দ্র সমূহে সমূহে স্থাপন করা হয়।"
  }
];

export interface HealthDownload {
  title: string;
  type: string;
  size: string;
  link: string;
}

export const HEALTH_DOWNLOADS: HealthDownload[] = [
  {
    title: "জরুরি প্রথমিক চিকিৎসা সহায়িকা (First Aid Guide)",
    type: "PDF বই",
    size: "২.৮ MB",
    link: "https://www.who.int/publications"
  },
  {
    title: "শিশুদের ইপিআই সরকারি টিকাদান সময়সূচি ২০২৬",
    type: "রঙিন ক্যালেন্ডার PDF",
    size: "১.২ MB",
    link: "https://dghs.gov.bd"
  },
  {
    title: "গর্ভবতী মায়েদের প্রসব পূর্ববর্তী ও প্রসব পরবর্তী যত্ন গাইড",
    type: "সচেতনতামূলক পুস্তিকা",
    size: "১.৫ MB",
    link: "https://dghs.gov.bd"
  }
];
