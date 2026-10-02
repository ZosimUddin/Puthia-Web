import React from 'react';
import { Star, MapPin, Phone, Briefcase, CheckCircle, Image as ImageIcon, Scale, Newspaper, Mail, Plus, Check, X, AlertCircle, Sparkles, Send, Globe, Search, BookOpen, Trash2 } from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { useFavorites } from './FavoriteContext';
import { RatingReviewsList } from './RatingReviewsList';

interface Lawyer {
  id: string;
  name: string;
  chamber: string;
  phone: string;
  expertise: string;
  court: string;
  rating: number;
  reviews: number;
  verified: boolean;
}

const seedLawyers: Lawyer[] = [
  {
    id: "lawyer_1",
    name: "অ্যাডভোকেট মো: আশরাফুল ইসলাম",
    chamber: "উপজেলা গেটের বিপরীতে, পুঠিয়া বাজার",
    phone: "01712-456123",
    expertise: "দেওয়ানি, জমিজমা ও দেওয়ানি মামলায় বিশেষ পারদর্শী",
    court: "রাজশাহী জেলা ও দায়রা জজ আদালত",
    rating: 4.9,
    reviews: 18,
    verified: true
  },
  {
    id: "lawyer_2",
    name: "অ্যাডভোকেট শিরিন আক্তার",
    chamber: "থানা সংলগ্ন ল' চেম্বার, পুঠিয়া",
    phone: "01723-987111",
    expertise: "পারিবারিক, যৌতুক ও নারী নির্যাতন এবং ফৌজদারি মামলা",
    court: "রাজশাহী জজ কোর্ট এবং নারী ও শিশু নির্যাতন ট্রাইব্যুনাল",
    rating: 4.8,
    reviews: 12,
    verified: true
  },
  {
    id: "lawyer_3",
    name: "অ্যাডভোকেট মো: শফিকুল আলম (শফিক)",
    chamber: "বানেশ্বর চেম্বার, বানেশ্বর বাজার",
    phone: "01732-112299",
    expertise: "জমিজমা রেজিস্ট্রি, দলিলের আইনি জটিলতা এবং দেওয়ানি",
    court: "রাজশাহী জেলা ও দায়রা জজ আদালত",
    rating: 4.7,
    reviews: 15,
    verified: false
  }
];

interface Journalist {
  id: string;
  name: string;
  media: string;
  phone: string;
  email: string;
  submitNewsUrl?: string;
  verified: boolean;
}

const seedJournalists: Journalist[] = [
  {
    id: "journalist_1",
    name: "মো: আহসান হাবীব",
    media: "দৈনিক প্রথম আলো (পুঠিয়া উপজেলা প্রতিনিধি)",
    phone: "01712-111222",
    email: "ahsan.puthia@gmail.com",
    submitNewsUrl: "",
    verified: true
  },
  {
    id: "journalist_2",
    name: "মো: কামাল হোসেন",
    media: "সময় টিভি ও দৈনিক যুগান্তর (উপজেলা প্রতিনিধি)",
    phone: "01715-333444",
    email: "kamal.puthia@email.com",
    submitNewsUrl: "",
    verified: true
  },
  {
    id: "journalist_3",
    name: "রাজু আহমেদ",
    media: "বরেন্দ্র বার্তা অনলাইন (স্টাফ রিপোর্টার)",
    phone: "01911-555666",
    email: "raju.puthia@email.com",
    submitNewsUrl: "https://borendrobarta.com/contact",
    verified: false
  }
];

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  location: string;
  phone: string;
  rating: number;
  reviews: number;
  experience: string;
  verified: boolean;
  images: string[];
}

const serviceProviders: ServiceProvider[] = [
  {
    id: "1",
    name: "মো: রহিম উদ্দিন",
    category: "sp_mason",
    location: "পুঠিয়া সদর",
    phone: "01712-456789",
    rating: 4.8,
    reviews: 12,
    experience: "১৫ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "2",
    name: "আরিফ ফার্নিচার ও কাঠ মিস্ত্রি",
    category: "sp_carpenter",
    location: "বানেশ্বর",
    phone: "01723-987654",
    rating: 4.5,
    reviews: 8,
    experience: "১০ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1455792244736-3ed96c3d7f7e?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "3",
    name: "রংধনু পেইন্টার্স (শাহীন)",
    category: "sp_painter",
    location: "বেলপুকুর",
    phone: "01732-112233",
    rating: 4.9,
    reviews: 24,
    experience: "১২ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "4",
    name: "মডার্ন টাইলস ফিটিং (সুমন)",
    category: "sp_tiles",
    location: "পুঠিয়া সদর",
    phone: "01915-445566",
    rating: 4.7,
    reviews: 15,
    experience: "৮ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1502005229762-fc1b2381f0db?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "5",
    name: "রনি স্যানিটারি ও টিউবওয়েল",
    category: "sp_tubewell",
    location: "জোলমোলিয়া",
    phone: "01718-889900",
    rating: 4.6,
    reviews: 9,
    experience: "৫ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1542013936693-8848e574047a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "6",
    name: "বিসমিল্লাহ স্যানিটারি ওয়ার্কস",
    category: "sp_sanitary",
    location: "বানেশ্বর",
    phone: "01725-334455",
    rating: 4.8,
    reviews: 18,
    experience: "১৪ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1581781894097-4141c191a33c?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "7",
    name: "এলিগেন্ট ইন্টেরিয়র",
    category: "sp_interior",
    location: "রাজশাহী রোড",
    phone: "01711-556677",
    rating: 5.0,
    reviews: 5,
    experience: "৭ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "8",
    name: "ভাই ভাই গ্রিল ওয়ার্কশপ",
    category: "sp_grill",
    location: "পুঠিয়া বাজার",
    phone: "01742-123456",
    rating: 4.4,
    reviews: 11,
    experience: "১০ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "9",
    name: "স্টার থাই অ্যালুমিনিয়াম",
    category: "sp_thai_aluminum",
    location: "বানেশ্বর বাজার",
    phone: "01755-667788",
    rating: 4.7,
    reviews: 20,
    experience: "১২ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "10",
    name: "সততা ইলেকট্রিক সার্ভিস",
    category: "sp_electrician",
    location: "শিলমাড়িয়া",
    phone: "01733-445566",
    rating: 4.9,
    reviews: 32,
    experience: "৮ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1558211583-d26f610c1eb1?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "11",
    name: "স্পিড ওয়াইফাই টেকনিশিয়ান",
    category: "sp_wifi",
    location: "পুঠিয়া সদর",
    phone: "01912-778899",
    rating: 4.5,
    reviews: 14,
    experience: "৪ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1551703599-6b3dbb57c24e?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "12",
    name: "আইফিক্স মোবাইল কেয়ার",
    category: "sp_mobile",
    location: "পুঠিয়া বাজার",
    phone: "01719-223344",
    rating: 4.8,
    reviews: 45,
    experience: "৯ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1597740985671-2a8a3b80dc04?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "13",
    name: "পুঠিয়া আইটি কেয়ার",
    category: "sp_computer",
    location: "কলেজ রোড",
    phone: "01715-112233",
    rating: 4.9,
    reviews: 50,
    experience: "১১ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "14",
    name: "নিরাপদ সিসিটিভি সলিউশন",
    category: "sp_cctv",
    location: "বানেশ্বর",
    phone: "01726-556677",
    rating: 4.6,
    reviews: 12,
    experience: "৫ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "15",
    name: "কুলিং জোন এসি সার্ভিস",
    category: "sp_ac",
    location: "পুঠিয়া সদর",
    phone: "01713-998877",
    rating: 4.8,
    reviews: 22,
    experience: "৭ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "16",
    name: "হিমেল ফ্রিজ সার্ভিসিং",
    category: "sp_fridge",
    location: "জোলমোলিয়া",
    phone: "01717-334455",
    rating: 4.5,
    reviews: 16,
    experience: "৬ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1571171637578-41bc2dd4dcd2?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "17",
    name: "সনি টিভি হসপিটাল",
    category: "sp_tv",
    location: "বানেশ্বর",
    phone: "01724-112233",
    rating: 4.7,
    reviews: 28,
    experience: "১৫ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "18",
    name: "মাস্টার কার সার্ভিসিং",
    category: "sp_car",
    location: "রাজশাহী রোড",
    phone: "01714-223344",
    rating: 4.9,
    reviews: 35,
    experience: "১২ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "19",
    name: "রাইডার্স বাইক ইস্টার",
    category: "sp_bike",
    location: "পুঠিয়া বাজার",
    phone: "01729-123456",
    rating: 4.8,
    reviews: 40,
    experience: "৮ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "20",
    name: "জেনারেল মেইনটেন্যান্স (হাবিব)",
    category: "sp_others",
    location: "পুঠিয়া সদর",
    phone: "01718-445566",
    rating: 4.4,
    reviews: 6,
    experience: "৫ বছরের অভিজ্ঞতা",
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=600"
    ]
  }
];

const categoryLabels: Record<string, string> = {
  "sp_mason": "রাজ মিস্ত্রি",
  "sp_carpenter": "কাঠ মিস্ত্রি",
  "sp_painter": "রং মিস্ত্রি",
  "sp_tiles": "টাইলস মিস্ত্রি",
  "sp_tubewell": "টিউবওয়েল মিস্ত্রি",
  "sp_sanitary": "স্যানিটারি মিস্ত্রি",
  "sp_grill": "গ্রিল মিস্ত্রি",
  "sp_thai_aluminum": "থাই/অ্যালুমিনিয়াম মিস্ত্রি",
  "sp_electrician": "ইলেকট্রিশিয়ান",
  "sp_wifi": "WiFi টেকনিশিয়ান",
  "sp_mobile": "মোবাইল সার্ভিসিং",
  "sp_computer": "কম্পিউটার সার্ভিসিং",
  "sp_cctv": "CCTV সার্ভিসিং",
  "sp_ac": "এসি সার্ভিসিং",
  "sp_fridge": "ফ্রিজ সার্ভিসিং",
  "sp_tv": "টিভি সার্ভিসিং",
  "sp_car": "গাড়ি সার্ভিসিং",
  "sp_bike": "বাইক মিস্ত্রি",
  "sp_electronics": "ইলেকট্রনিক্স সার্ভিসিং",
  "sp_technical": "টেকনিক্যাল সার্ভিস",
  "sp_construction": "নির্মাণ ও ডেকোরেশন",
  "sp_plumbing": "টিউবওয়েল ও স্যানিটারি",
  "sp_vehicle": "গাড়ি ও বাইক মেকানিক",
  "sp_lawyer": "আইনজীবী",
  "sp_journalist": "সাংবাদিক",
  "local_service_provider": "সব সেবা প্রদানকারী"
};

export const LocalServiceProviderInfo = ({ onGoBack, category }: { onGoBack?: () => void, category?: string | null }) => {
  const [subCategory, setSubCategory] = React.useState<string | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const activeCategory = category || 'local_service_provider';

  const { user } = useAuth();
  const { toggleFollow, isFollowing } = useFavorites();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [expandedReviewsProviderId, setExpandedReviewsProviderId] = React.useState<string | null>(null);

  // Service Provider DB state
  const [dbProviders, setDbProviders] = React.useState<ServiceProvider[]>([]);
  const [showProviderForm, setShowProviderForm] = React.useState(false);

  // Form states
  const [providerName, setProviderName] = React.useState("");
  const [providerPhone, setProviderPhone] = React.useState("");
  const [providerLocation, setProviderLocation] = React.useState("");
  const [providerExperience, setProviderExperience] = React.useState("");
  const [providerSubCategory, setProviderSubCategory] = React.useState("");
  const [providerImageUrl, setProviderImageUrl] = React.useState("");
  const [providerSuccess, setProviderSuccess] = React.useState("");
  const [providerError, setProviderError] = React.useState("");
  const [isSubmittingProvider, setIsSubmittingProvider] = React.useState(false);

  // Maps
  const categoryToSubcategories: Record<string, { value: string; label: string }[]> = {
    sp_construction: [
      { value: "sp_mason", label: "রাজ মিস্ত্রি" },
      { value: "sp_carpenter", label: "কাঠ মিস্ত্রি" },
      { value: "sp_painter", label: "রং মিস্ত্রি" },
      { value: "sp_tiles", label: "টাইলস মিস্ত্রি" },
      { value: "sp_grill", label: "গ্রিল মিস্ত্রি" },
      { value: "sp_thai_aluminum", label: "থাই/অ্যালুমিনিয়াম মিস্ত্রি" }
    ],
    sp_plumbing: [
      { value: "sp_tubewell", label: "টিউবওয়েল মিস্ত্রি" },
      { value: "sp_sanitary", label: "স্যানিটারি মিস্ত্রি" }
    ],
    sp_electronics: [
      { value: "sp_electrician", label: "ইলেকট্রিশিয়ান" },
      { value: "sp_mobile", label: "মোবাইল সার্ভিসিং" },
      { value: "sp_computer", label: "কম্পিউটার সার্ভিসিং" },
      { value: "sp_tv", label: "টিভি সার্ভিসিং" }
    ],
    sp_technical: [
      { value: "sp_wifi", label: "WiFi টেকনিশিয়ান" },
      { value: "sp_cctv", label: "CCTV সার্ভিসিং" },
      { value: "sp_ac", label: "এসি সার্ভিসিং" },
      { value: "sp_fridge", label: "ফ্রিজ সার্ভিসিং" }
    ],
    sp_vehicle: [
      { value: "sp_car", label: "গাড়ি সার্ভিসিং" },
      { value: "sp_bike", label: "বাইক মিস্ত্রি" }
    ],
    local_service_provider: [
      { value: "sp_mason", label: "রাজ মিস্ত্রি" },
      { value: "sp_carpenter", label: "কাঠ মিস্ত্রি" },
      { value: "sp_painter", label: "রং মিস্ত্রি" },
      { value: "sp_tiles", label: "টাইলস মিস্ত্রি" },
      { value: "sp_tubewell", label: "টিউবওয়েল মিস্ত্রি" },
      { value: "sp_sanitary", label: "স্যানিটারি মিস্ত্রি" },
      { value: "sp_grill", label: "গ্রিল মিস্ত্রি" },
      { value: "sp_thai_aluminum", label: "থাই/অ্যালুমিনিয়াম মিস্ত্রি" },
      { value: "sp_electrician", label: "ইলেকট্রিশিয়ান" },
      { value: "sp_wifi", label: "WiFi টেকনিশিয়ান" },
      { value: "sp_mobile", label: "মোবাইল সার্ভিসিং" },
      { value: "sp_computer", label: "কম্পিউটার সার্ভিসিং" },
      { value: "sp_cctv", label: "CCTV সার্ভিসিং" },
      { value: "sp_ac", label: "এসি সার্ভিসিং" },
      { value: "sp_fridge", label: "ফ্রিজ সার্ভিসিং" },
      { value: "sp_tv", label: "টিভি সার্ভিসিং" },
      { value: "sp_car", label: "গাড়ি সার্ভিসিং" },
      { value: "sp_bike", label: "বাইক মিস্ত্রি" }
    ]
  };

  const defaultImagesBySubcategory: Record<string, string[]> = {
    sp_mason: ["https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600"],
    sp_carpenter: ["https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&q=80&w=600"],
    sp_painter: ["https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600"],
    sp_tiles: ["https://images.unsplash.com/photo-1502005229762-fc1b2381f0db?auto=format&fit=crop&q=80&w=600"],
    sp_tubewell: ["https://images.unsplash.com/photo-1542013936693-8848e574047a?auto=format&fit=crop&q=80&w=600"],
    sp_sanitary: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600"],
    sp_grill: ["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600"],
    sp_thai_aluminum: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600"],
    sp_electrician: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600"],
    sp_wifi: ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600"],
    sp_mobile: ["https://images.unsplash.com/photo-1597740985671-2a8a3b80dc04?auto=format&fit=crop&q=80&w=600"],
    sp_computer: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600"],
    sp_cctv: ["https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=600"],
    sp_ac: ["https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=600"],
    sp_fridge: ["https://images.unsplash.com/photo-1571171637578-41bc2dd4dcd2?auto=format&fit=crop&q=80&w=600"],
    sp_tv: ["https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&q=80&w=600"],
    sp_car: ["https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600"],
    sp_bike: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600"]
  };

  // Sync chosen subcategory in the form
  React.useEffect(() => {
    if (subCategory) {
      setProviderSubCategory(subCategory);
    } else {
      const subs = categoryToSubcategories[activeCategory] || [];
      if (subs.length > 0) {
        setProviderSubCategory(subs[0].value);
      } else {
        setProviderSubCategory("");
      }
    }
  }, [subCategory, activeCategory]);

  // Subscribe to service providers posts
  React.useEffect(() => {
    const q = query(collection(db, "service_provider_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ServiceProvider[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || '',
          category: data.category || '',
          location: data.location || '',
          phone: data.phone || '',
          rating: Number(data.rating) || 5.0,
          reviews: Number(data.reviews) || 1,
          experience: data.experience || '',
          verified: data.verified !== undefined ? !!data.verified : false,
          images: Array.isArray(data.images) ? data.images : [],
          userId: data.userId || ''
        } as any);
      });
      setDbProviders(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "service_provider_posts");
    });

    return () => unsubscribe();
  }, []);

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!providerName || !providerPhone || !providerLocation || !providerExperience || !providerSubCategory) {
      setProviderError("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য প্রদান করুন।");
      return;
    }

    setIsSubmittingProvider(true);
    setProviderError("");
    setProviderSuccess("");

    try {
      let imagesList: string[] = [];
      if (providerImageUrl.trim()) {
        imagesList = [providerImageUrl.trim()];
      } else {
        const defaults = defaultImagesBySubcategory[providerSubCategory] || [];
        if (defaults.length > 0) {
          imagesList = [defaults[0]];
        }
      }

      const docData = {
        name: providerName,
        phone: providerPhone,
        location: providerLocation,
        experience: providerExperience,
        category: providerSubCategory,
        rating: 5.0,
        reviews: 1,
        verified: false,
        images: imagesList,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "service_provider_posts"), docData);
      setProviderSuccess("আপনার সেবাদাতা পোস্টটি সফলভাবে প্রকাশ করা হয়েছে!");
      
      setProviderName("");
      setProviderPhone("");
      setProviderLocation("");
      setProviderExperience("");
      setProviderImageUrl("");

      setTimeout(() => {
        setProviderSuccess("");
        setShowProviderForm(false);
      }, 2500);
    } catch (err: any) {
      console.error("Error creating service provider post:", err);
      setProviderError("পোস্ট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmittingProvider(false);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই পোস্টটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "service_provider_posts", providerId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `service_provider_posts/${providerId}`);
    }
  };

  // DB & Seed state
  const [dbLawyers, setDbLawyers] = React.useState<Lawyer[]>([]);
  const [dbJournalists, setDbJournalists] = React.useState<Journalist[]>([]);
  const [isLoadingDb, setIsLoadingDb] = React.useState(false);

  // Lawyer Form
  const [showLawyerForm, setShowLawyerForm] = React.useState(false);
  const [lawyerName, setLawyerName] = React.useState("");
  const [lawyerChamber, setLawyerChamber] = React.useState("");
  const [lawyerPhone, setLawyerPhone] = React.useState("");
  const [lawyerExpertise, setLawyerExpertise] = React.useState("");
  const [lawyerCourt, setLawyerCourt] = React.useState("");
  const [lawyerSuccess, setLawyerSuccess] = React.useState("");
  const [lawyerError, setLawyerError] = React.useState("");
  const [isSubmittingLawyer, setIsSubmittingLawyer] = React.useState(false);

  // Journalist Form
  const [showJournalistForm, setShowJournalistForm] = React.useState(false);
  const [journalistName, setJournalistName] = React.useState("");
  const [journalistMedia, setJournalistMedia] = React.useState("");
  const [journalistPhone, setJournalistPhone] = React.useState("");
  const [journalistEmail, setJournalistEmail] = React.useState("");
  const [journalistSubmitUrl, setJournalistSubmitUrl] = React.useState("");
  const [journalistSuccess, setJournalistSuccess] = React.useState("");
  const [journalistError, setJournalistError] = React.useState("");
  const [isSubmittingJournalist, setIsSubmittingJournalist] = React.useState(false);

  // Send News Tip Form Modal
  const [selectedJournalistForTip, setSelectedJournalistForTip] = React.useState<Journalist | null>(null);
  const [tipSenderName, setTipSenderName] = React.useState("");
  const [tipSenderPhone, setTipSenderPhone] = React.useState("");
  const [tipSubject, setTipSubject] = React.useState("");
  const [tipDetails, setTipDetails] = React.useState("");
  const [tipSuccess, setTipSuccess] = React.useState("");
  const [tipError, setTipError] = React.useState("");
  const [isSendingTip, setIsSendingTip] = React.useState(false);

  // Search & Filter
  const [lawyerSearch, setLawyerSearch] = React.useState("");
  const [lawyerFilterExpertise, setLawyerFilterExpertise] = React.useState("");
  const [journalistSearch, setJournalistSearch] = React.useState("");
  
  React.useEffect(() => {
    if (activeCategory === 'sp_electronics') setSubCategory('sp_electrician');
    else if (activeCategory === 'sp_technical') setSubCategory('sp_wifi');
    else if (activeCategory === 'sp_construction') setSubCategory('sp_mason');
    else if (activeCategory === 'sp_plumbing') setSubCategory('sp_tubewell');
    else if (activeCategory === 'sp_vehicle') setSubCategory('sp_car');
    else setSubCategory(null);
  }, [activeCategory]);

  React.useEffect(() => {
    if (activeCategory === 'sp_lawyer') {
      setIsLoadingDb(true);
      getDocs(collection(db, "lawyers"))
        .then((snapshot) => {
          const list: Lawyer[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              name: data.name || '',
              chamber: data.chamber || '',
              phone: data.phone || '',
              expertise: data.expertise || '',
              court: data.court || '',
              rating: Number(data.rating) || 5.0,
              reviews: Number(data.reviews) || 0,
              verified: data.verified !== undefined ? !!data.verified : true,
            });
          });
          setDbLawyers(list);
        })
        .catch((err) => console.error("Error loading lawyers from DB:", err))
        .finally(() => setIsLoadingDb(false));
    } else if (activeCategory === 'sp_journalist') {
      setIsLoadingDb(true);
      getDocs(collection(db, "journalists"))
        .then((snapshot) => {
          const list: Journalist[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              name: data.name || '',
              media: data.media || '',
              phone: data.phone || '',
              email: data.email || '',
              submitNewsUrl: data.submitNewsUrl || '',
              verified: data.verified !== undefined ? !!data.verified : true,
            });
          });
          setDbJournalists(list);
        })
        .catch((err) => console.error("Error loading journalists from DB:", err))
        .finally(() => setIsLoadingDb(false));
    }
  }, [activeCategory]);

  const handleAddLawyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lawyerName || !lawyerChamber || !lawyerPhone || !lawyerExpertise || !lawyerCourt) {
      setLawyerError("অনুগ্রহ করে সব তথ্য প্রদান করুন।");
      return;
    }
    setIsSubmittingLawyer(true);
    setLawyerError("");
    setLawyerSuccess("");

    try {
      const docData = {
        name: lawyerName,
        chamber: lawyerChamber,
        phone: lawyerPhone,
        expertise: lawyerExpertise,
        court: lawyerCourt,
        rating: 5.0,
        reviews: 1,
        verified: true,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "lawyers"), docData);
      const newLawyer: Lawyer = {
        id: docRef.id,
        ...docData
      };
      setDbLawyers(prev => [newLawyer, ...prev]);
      setLawyerSuccess("সফলভাবে আইনজীবী যুক্ত করা হয়েছে!");
      
      // Reset form
      setLawyerName("");
      setLawyerChamber("");
      setLawyerPhone("");
      setLawyerExpertise("");
      setLawyerCourt("");
      setTimeout(() => {
        setLawyerSuccess("");
        setShowLawyerForm(false);
      }, 2000);
    } catch (err: any) {
      console.error("Error creating lawyer:", err);
      setLawyerError("সার্ভার ত্রুটি, অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmittingLawyer(false);
    }
  };

  const handleAddJournalist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalistName || !journalistMedia || !journalistPhone || !journalistEmail) {
      setJournalistError("অনুগ্রহ করে সব তথ্য প্রদান করুন।");
      return;
    }
    setIsSubmittingJournalist(true);
    setJournalistError("");
    setJournalistSuccess("");

    try {
      const docData = {
        name: journalistName,
        media: journalistMedia,
        phone: journalistPhone,
        email: journalistEmail,
        submitNewsUrl: journalistSubmitUrl || "",
        verified: true,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "journalists"), docData);
      const newJournalist: Journalist = {
        id: docRef.id,
        ...docData
      };
      setDbJournalists(prev => [newJournalist, ...prev]);
      setJournalistSuccess("সফলভাবে সাংবাদিক যুক্ত করা হয়েছে!");
      
      // Reset form
      setJournalistName("");
      setJournalistMedia("");
      setJournalistPhone("");
      setJournalistEmail("");
      setJournalistSubmitUrl("");
      setTimeout(() => {
        setJournalistSuccess("");
        setShowJournalistForm(false);
      }, 2000);
    } catch (err: any) {
      console.error("Error creating journalist:", err);
      setJournalistError("সার্ভার ত্রুটি, অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmittingJournalist(false);
    }
  };

  const handleSendTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipSubject || !tipDetails) {
      setTipError("অনুগ্রহ করে সংবাদের বিষয় ও বিস্তারিত বিবরণ লিখুন।");
      return;
    }
    setIsSendingTip(true);
    setTipError("");
    setTipSuccess("");

    try {
      const docData = {
        journalistId: selectedJournalistForTip?.id || "unknown",
        journalistName: selectedJournalistForTip?.name || "General",
        senderName: tipSenderName || "বেনামী নাগরিক",
        senderPhone: tipSenderPhone || "গোপন রাখা হয়েছে",
        subject: tipSubject,
        details: tipDetails,
        imageUrl: "",
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, "journalist_tips"), docData);
      setTipSuccess("আপনার সংবাদ তথ্যটি সফলভাবে পাঠানো হয়েছে! সাংবাদিক মহোদয় সত্যতা যাচাই করে প্রয়োজনীয় পদক্ষেপ গ্রহণ করবেন।");
      
      // Reset
      setTipSubject("");
      setTipDetails("");
      setTipSenderName("");
      setTipSenderPhone("");
      setTimeout(() => {
        setTipSuccess("");
        setSelectedJournalistForTip(null);
      }, 4000);
    } catch (err: any) {
      console.error("Error sending news tip:", err);
      setTipError("তথ্য পাঠাতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsSendingTip(false);
    }
  };

  const combinedProviders = [...dbProviders, ...serviceProviders];

  const currentCategory = (activeCategory === 'sp_electronics' || activeCategory === 'sp_technical' || activeCategory === 'sp_construction' || activeCategory === 'sp_plumbing' || activeCategory === 'sp_vehicle') && subCategory ? subCategory : activeCategory;

  const filteredProviders = currentCategory === 'local_service_provider' 
    ? combinedProviders 
    : currentCategory === 'sp_thai_grill_tiles'
      ? combinedProviders.filter(p => ['sp_tiles', 'sp_grill', 'sp_thai_aluminum'].includes(p.category))
      : combinedProviders.filter(p => p.category === currentCategory);

  const bannerTitle = categoryLabels[activeCategory] || "সেবা প্রদানকারী";

  if (activeCategory === 'sp_lawyer') {
    // Combine seed list with database lawyers
    const allLawyers = [...dbLawyers, ...seedLawyers];
    
    // Filter & Search
    const filteredLawyers = allLawyers.filter(lawyer => {
      const matchSearch = lawyer.name.toLowerCase().includes(lawyerSearch.toLowerCase()) || 
                          lawyer.chamber.toLowerCase().includes(lawyerSearch.toLowerCase()) ||
                          lawyer.expertise.toLowerCase().includes(lawyerSearch.toLowerCase());
      const matchExpertise = lawyerFilterExpertise ? lawyer.expertise.includes(lawyerFilterExpertise) : true;
      return matchSearch && matchExpertise;
    });

    return (
      <div className="font-sans space-y-6 pb-6 animate-fade-in text-left">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Scale className="w-48 h-48 -mr-10 -mb-10 text-white" />
          </div>
          {onGoBack && (
            <button 
              onClick={onGoBack} 
              className="mb-4 bg-white/20 hover:bg-white/30 border-none px-4 py-1.5 rounded-full text-white text-sm font-bold cursor-pointer transition-colors"
            >
              ← ফিরে যান
            </button>
          )}
          <span className="text-xs bg-amber-500/30 text-amber-300 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            আইনি পরামর্শ ও বিচার বিভাগীয় তথ্য
          </span>
          <h2 className="m-0 text-2xl font-extrabold mb-2">⚖️ আইনজীবী ও আইন চেম্বার</h2>
          <div className="w-12 h-1 bg-amber-500 rounded-full mb-3"></div>
          <p className="m-0 text-sm text-slate-300 leading-relaxed text-justify">
            পুঠিয়া উপজেলা ও রাজশাহী আদালতের বিজ্ঞ আইনজীবীদের তালিকা, তাঁদের চেম্বারের ঠিকানা ও বিষয়ের বিবরণ। যেকোনো আইনি পরামর্শ বা জরুরি সহায়তায় সরাসরি যোগাযোগ করুন।
          </p>
        </div>

        {/* Form and actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setShowLawyerForm(!showLawyerForm)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer border-none"
          >
            {showLawyerForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showLawyerForm ? "ফর্ম বন্ধ করুন" : "নতুন আইনজীবী যুক্ত করুন"}
          </button>
          
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-semibold">
            মোট আইনজীবী: {filteredLawyers.length} জন
          </div>
        </div>

        {/* Add Lawyer Form */}
        {showLawyerForm && (
          <form onSubmit={handleAddLawyer} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner space-y-4">
            <h4 className="m-0 text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Scale className="w-4.5 h-4.5 text-amber-600" /> নতুন আইনজীবী নিবন্ধন ফর্ম
            </h4>
            
            {lawyerError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{lawyerError}</span>
              </div>
            )}
            
            {lawyerSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{lawyerSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">আইনজীবীর নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={lawyerName || ""} 
                  onChange={(e) => setLawyerName(e.target.value)}
                  placeholder="বিজ্ঞ আইনজীবীর নাম লিখুন" 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  value={lawyerPhone || ""} 
                  onChange={(e) => setLawyerPhone(e.target.value)}
                  placeholder="মোবাইল নম্বর লিখুন" 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">চেম্বারের ঠিকানা <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={lawyerChamber || ""} 
                  onChange={(e) => setLawyerChamber(e.target.value)}
                  placeholder="চেম্বারের অবস্থান ও ঠিকানা" 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">কোর্টের তথ্য (যেখানে প্র্যাকটিস করেন) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={lawyerCourt || ""} 
                  onChange={(e) => setLawyerCourt(e.target.value)}
                  placeholder="যেমন: রাজশাহী জেলা ও দায়রা জজ আদালত" 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700">যেসব বিষয়ে আইনি পরামর্শ দেন (কাজ করেন) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={lawyerExpertise || ""} 
                  onChange={(e) => setLawyerExpertise(e.target.value)}
                  placeholder="যেমন: দেওয়ানি, ফৌজদারি, পারিবারিক, জমিজমা ইত্যাদি" 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingLawyer}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer border-none disabled:opacity-50"
            >
              {isSubmittingLawyer ? "সংরক্ষণ করা হচ্ছে..." : "আইনজীবী তথ্য সংরক্ষণ করুন"}
            </button>
          </form>
        )}

        {/* Filters and search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={lawyerSearch || ""}
              onChange={(e) => setLawyerSearch(e.target.value)}
              placeholder="আইনজীবীর নাম বা চেম্বার খুঁজুন..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <select
              value={lawyerFilterExpertise || ""}
              onChange={(e) => setLawyerFilterExpertise(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">সকল আইনজীবী (সব ক্যাটাগরি)</option>
              <option value="দেওয়ানি">দেওয়ানি মামলা</option>
              <option value="ফৌজদারি">ফৌজদারি মামলা</option>
              <option value="পারিবারিক">পারিবারিক আইন</option>
              <option value="ভূমি ও সম্পত্তি">ভূমি ও সম্পত্তি আইন</option>
              <option value="জমি রেজিস্ট্রি">জমি রেজিস্ট্রি ও দলিল</option>
              <option value="নারী ও শিশু">নারী ও শিশু আইন</option>
              <option value="শ্রম ও চাকরি">শ্রম ও চাকরি আইন</option>
              <option value="ব্যবসা ও বাণিজ্যিক">ব্যবসা ও বাণিজ্যিক আইন</option>
              <option value="ব্যাংক ও আর্থিক">ব্যাংক ও আর্থিক আইন</option>
              <option value="সাইবার">সাইবার আইন</option>
              <option value="নোটারি">নোটারি ও এফিডেভিট</option>
              <option value="লিগ্যাল এইড">লিগ্যাল এইড</option>
              <option value="অন্যান্য">অন্যান্য</option>
            </select>
          </div>
        </div>

        {/* Lawyer List */}
        {isLoadingDb && allLawyers.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-slate-500 m-0 animate-pulse">তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredLawyers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLawyers.map(lawyer => (
              <div key={lawyer.id} className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-left flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="m-0 text-base font-bold text-slate-800 flex items-center gap-1">
                          {lawyer.name}
                        </h3>
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium mt-0.5 inline-block">
                          {lawyer.court}
                        </span>
                      </div>
                    </div>
                    {lawyer.verified && (
                      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                        🟣 Verified Service Provider
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 my-4 border-t border-b border-slate-50 py-3">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-slate-800 min-w-[100px]">💼 আইনি বিষয়:</span>
                      <span className="text-slate-700 font-medium bg-amber-50/50 text-amber-900 px-2 py-0.5 rounded-md">{lawyer.expertise}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-slate-800 min-w-[100px]">📍 চেম্বার ঠিকানা:</span>
                      <span className="text-slate-700">{lawyer.chamber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-2">
                  <a 
                    href={`tel:${lawyer.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 text-white py-2.5 rounded-xl font-bold text-sm transition-colors decoration-none shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    কল করুন ({lawyer.phone})
                  </a>
                  <button
                    onClick={() => toggleFollow({
                      id: lawyer.id,
                      type: 'provider',
                      name: lawyer.name,
                      category: 'আইনজীবী (' + lawyer.expertise + ')',
                      location: lawyer.chamber,
                      phone: lawyer.phone
                    })}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      isFollowing(lawyer.id)
                        ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                        : 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isFollowing(lawyer.id) ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        ফলোইং
                      </>
                    ) : (
                      <>
                        <span>+</span> ফলো
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setExpandedReviewsProviderId(expandedReviewsProviderId === lawyer.id ? null : lawyer.id)}
                  className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border-none mt-2"
                >
                  <span>⭐</span> {expandedReviewsProviderId === lawyer.id ? "রিভিউ ও রেটিং বন্ধ করুন" : "রিভিউ ও রেটিং দেখুন"}
                </button>

                {expandedReviewsProviderId === lawyer.id && (
                  <div className="w-full mt-2 animate-fade-in border-t border-neutral-100 pt-3">
                    <RatingReviewsList itemId={`lawyer_${lawyer.id}`} itemName={lawyer.name} itemCategory="আইনজীবী" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-slate-500 m-0">কোনো আইনজীবী পাওয়া যায়নি।</p>
          </div>
        )}
      </div>
    );
  }

  if (activeCategory === 'sp_journalist') {
    // Combine seed journalists with DB journalists
    const allJournalists = [...dbJournalists, ...seedJournalists];
    
    // Filter & Search
    const filteredJournalists = allJournalists.filter(j => 
      j.name.toLowerCase().includes(journalistSearch.toLowerCase()) ||
      j.media.toLowerCase().includes(journalistSearch.toLowerCase())
    );

    return (
      <div className="font-sans space-y-6 pb-6 animate-fade-in text-left">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Newspaper className="w-48 h-48 -mr-10 -mb-10 text-white" />
          </div>
          {onGoBack && (
            <button 
              onClick={onGoBack} 
              className="mb-4 bg-white/20 hover:bg-white/30 border-none px-4 py-1.5 rounded-full text-white text-sm font-bold cursor-pointer transition-colors"
            >
              ← ফিরে যান
            </button>
          )}
          <span className="text-xs bg-emerald-500/30 text-emerald-300 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            উপজেলার গণমাধ্যমকর্মী ও নির্ভীক কণ্ঠস্বর
          </span>
          <h2 className="m-0 text-2xl font-extrabold mb-2">📰 স্থানীয় সাংবাদিক তালিকা</h2>
          <div className="w-12 h-1 bg-emerald-500 rounded-full mb-3"></div>
          <p className="m-0 text-sm text-slate-300 leading-relaxed text-justify">
            পুঠিয়া উপজেলার বিভিন্ন জাতীয় ও স্থানীয় সংবাদপত্র, টিভি চ্যানেল এবং অনলাইন পোর্টালের সাংবাদিকদের তালিকা। যেকোনো জরুরি সংবাদ পাঠানো, মতামত বা প্রেস রিলিজ প্রেরণের জন্য সরাসরি যোগাযোগ করুন।
          </p>
        </div>

        {/* Form and actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setShowJournalistForm(!showJournalistForm)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer border-none"
          >
            {showJournalistForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showJournalistForm ? "ফর্ম বন্ধ করুন" : "নতুন সাংবাদিক যুক্ত করুন"}
          </button>
          
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-semibold">
            মোট সাংবাদিক: {filteredJournalists.length} জন
          </div>
        </div>

        {/* Add Journalist Form */}
        {showJournalistForm && (
          <form onSubmit={handleAddJournalist} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner space-y-4">
            <h4 className="m-0 text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Newspaper className="w-4.5 h-4.5 text-emerald-600" /> নতুন সাংবাদিক নিবন্ধন ফর্ম
            </h4>
            
            {journalistError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{journalistError}</span>
              </div>
            )}
            
            {journalistSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{journalistSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">সাংবাদিকের নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={journalistName || ""} 
                  onChange={(e) => setJournalistName(e.target.value)}
                  placeholder="সাংবাদিকের নাম লিখুন" 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">সংবাদপত্রের/চ্যানেলের নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={journalistMedia || ""} 
                  onChange={(e) => setJournalistMedia(e.target.value)}
                  placeholder="যেমন: দৈনিক প্রথম আলো / সময় টিভি" 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  value={journalistPhone || ""} 
                  onChange={(e) => setJournalistPhone(e.target.value)}
                  placeholder="মোবাইল নম্বর লিখুন" 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ইমেইল ঠিকানা <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  value={journalistEmail || ""} 
                  onChange={(e) => setJournalistEmail(e.target.value)}
                  placeholder="ইমেইল এড্রেস লিখুন" 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700">সংবাদ পাঠানোর পোর্টাল/লিংক (ঐচ্ছিক)</label>
                <input 
                  type="url" 
                  value={journalistSubmitUrl || ""} 
                  onChange={(e) => setJournalistSubmitUrl(e.target.value)}
                  placeholder="পোর্টালের যোগাযোগ ফরম লিংক (যেমন: https://borendrobarta.com/contact)" 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingJournalist}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer border-none disabled:opacity-50"
            >
              {isSubmittingJournalist ? "সংরক্ষণ করা হচ্ছে..." : "সাংবাদিক তথ্য সংরক্ষণ করুন"}
            </button>
          </form>
        )}

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative">
          <Search className="absolute left-7 top-6.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={journalistSearch || ""}
            onChange={(e) => setJournalistSearch(e.target.value)}
            placeholder="সাংবাদিকের নাম বা মিডিয়া পোর্টাল খুঁজুন..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Journalists List */}
        {isLoadingDb && allJournalists.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-slate-500 m-0 animate-pulse">তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredJournalists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJournalists.map(journalist => (
              <div key={journalist.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all text-left flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                        <Newspaper className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="m-0 text-base font-bold text-slate-800">{journalist.name}</h3>
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium mt-0.5 inline-block">
                          {journalist.media}
                        </span>
                      </div>
                    </div>
                    {journalist.verified && (
                      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                        🟣 Verified Service Provider
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 my-4 border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">মোবাইল:</span>
                      <a href={`tel:${journalist.phone}`} className="text-emerald-700 font-bold hover:underline decoration-none">{journalist.phone}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">ইমেইল:</span>
                      <a href={`mailto:${journalist.email}`} className="text-slate-600 hover:underline decoration-none">{journalist.email}</a>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-2 pt-2 border-t border-slate-50">
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => setSelectedJournalistForTip(journalist)}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border-none shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      📰 খবর ও তথ্য পাঠান
                    </button>
                    <button
                      onClick={() => toggleFollow({
                        id: journalist.id,
                        type: 'provider',
                        name: journalist.name,
                        category: 'সাংবাদিক (' + journalist.media + ')',
                        phone: journalist.phone
                      })}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        isFollowing(journalist.id)
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/10'
                          : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {isFollowing(journalist.id) ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                          ফলোইং
                        </>
                      ) : (
                        <>
                          <span>+</span> ফলো
                        </>
                      )}
                    </button>
                  </div>

                  {journalist.submitNewsUrl && (
                    <a 
                      href={journalist.submitNewsUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg text-[11px] transition-colors decoration-none text-center font-bold"
                    >
                      <Globe className="w-3 h-3" /> পোর্টাল যোগাযোগ পাতা
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-slate-500 m-0">কোনো সাংবাদিক পাওয়া যায়নি।</p>
          </div>
        )}

        {/* Send News Tip Form Modal */}
        {selectedJournalistForTip && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={() => setSelectedJournalistForTip(null)}>
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-left" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setSelectedJournalistForTip(null)}
                className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer border-none font-bold"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="m-0 text-base font-bold text-slate-800">
                    সংবাদ ও তথ্য পাঠান
                  </h3>
                  <p className="m-0 text-xs text-slate-500">
                    সাংবাদিক: <b className="text-slate-800">{selectedJournalistForTip.name}</b> ({selectedJournalistForTip.media})
                  </p>
                </div>
              </div>

              {tipError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{tipError}</span>
                </div>
              )}

              {tipSuccess ? (
                <div className="bg-green-50 text-green-700 p-5 rounded-xl text-sm flex flex-col items-center justify-center text-center gap-3 font-semibold py-8">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl mb-1">
                    ✓
                  </div>
                  <span>{tipSuccess}</span>
                </div>
              ) : (
                <form onSubmit={handleSendTip} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">প্রেরকের নাম (ঐচ্ছিক / গোপন রাখা হবে)</label>
                      <input 
                        type="text" 
                        value={tipSenderName || ""}
                        onChange={(e) => setTipSenderName(e.target.value)}
                        placeholder="আপনার নাম (Anonymous হলে খালি রাখুন)" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">মোবাইল নম্বর (ঐচ্ছিক / গোপন রাখা হবে)</label>
                      <input 
                        type="tel" 
                        value={tipSenderPhone || ""}
                        onChange={(e) => setTipSenderPhone(e.target.value)}
                        placeholder="আপনার মোবাইল নম্বর" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">সংবাদের বিষয় বা শিরোনাম <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={tipSubject || ""}
                      onChange={(e) => setTipSubject(e.target.value)}
                      placeholder="খবরের মূল বিষয় এক লাইনে লিখুন" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">বিস্তারিত তথ্য / ঘটনার বিবরণ <span className="text-red-500">*</span></label>
                    <textarea 
                      rows={4}
                      value={tipDetails || ""}
                      onChange={(e) => setTipDetails(e.target.value)}
                      placeholder="ঘটনা কখন ঘটেছে, কোথায় ঘটেছে, বিস্তারিত বিবরণ লিখুন..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingTip}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer border-none disabled:opacity-50"
                  >
                    {isSendingTip ? "পাঠানো হচ্ছে..." : "সাংবাদিককে খবর পাঠান"}
                  </button>
                </form>
              )}
              
              <p className="text-[10px] text-slate-400 text-justify leading-relaxed m-0 mt-2 border-t border-slate-100 pt-2">
                * তথ্য প্রেরণের ক্ষেত্রে আপনার নাম ও মোবাইল প্রকাশ করা হবে না। সাংবাদিক মহোদয় খবরের সত্যতা অনুসন্ধান করতে কেবল অভ্যন্তরীণভাবে এটি ব্যবহার করতে পারেন।
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="font-sans space-y-6 pb-6 animate-fade-in text-left">
      <div className="bg-gradient-to-br from-slate-900 to-sky-700 p-6 rounded-3xl text-white shadow-lg">
        {onGoBack && (
          <button 
            onClick={onGoBack} 
            className="mb-4 bg-white/20 hover:bg-white/30 border-none px-4 py-1.5 rounded-full text-white text-sm font-bold cursor-pointer transition-colors"
          >
            ← ফিরে যান
          </button>
        )}
        <span className="text-sm opacity-80 block mb-1">দক্ষ কারিগর ও জরুরি সেবা</span>
        <h2 className="m-0 text-2xl font-extrabold mb-3">{bannerTitle}</h2>
        <div className="w-10 h-1 bg-white rounded-full mb-4"></div>
        <p className="m-0 text-sm opacity-90 leading-relaxed text-justify">
          পুঠিয়া উপজেলার অভিজ্ঞ মিস্ত্রি, টেকনিশিয়ান এবং বিভিন্ন সেবাদাতাদের তালিকা। রেটিং ও যাচাইকৃত তথ্য দেখে আপনার প্রয়োজনীয় সেবা নিন।
        </p>
      </div>

      {/* Form and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => {
            if (!user) {
              setIsAuthModalOpen(true);
            } else {
              setShowProviderForm(!showProviderForm);
            }
          }}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer border-none"
        >
          {showProviderForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showProviderForm ? "ফর্ম বন্ধ করুন" : "নতুন সেবাদাতা তথ্য যোগ করুন"}
        </button>
        
        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-semibold">
          মোট সেবাদাতা: {filteredProviders.length} জন
        </div>
      </div>

      {/* Add Service Provider Form */}
      {showProviderForm && (
        <form onSubmit={handleAddProvider} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner space-y-4">
          <h4 className="m-0 text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
            <Sparkles className="w-4.5 h-4.5 text-sky-600" /> নতুন সেবাদাতার তথ্য দিন
          </h4>
          
          {providerError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{providerError}</span>
            </div>
          )}
          
          {providerSuccess && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{providerSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">নাম <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={providerName || ""} 
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="সেবাদাতার নাম লিখুন" 
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">মোবাইল নম্বর <span className="text-red-500">*</span></label>
              <input 
                type="tel" 
                value={providerPhone || ""} 
                onChange={(e) => setProviderPhone(e.target.value)}
                placeholder="যেমন: 017XXXXXXXX" 
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ঠিকানা / এলাকা <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={providerLocation || ""} 
                onChange={(e) => setProviderLocation(e.target.value)}
                placeholder="যেমন: পুঠিয়া বাজার / বানেশ্বর" 
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">অভিজ্ঞতা <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={providerExperience || ""} 
                onChange={(e) => setProviderExperience(e.target.value)}
                placeholder="যেমন: ৫ বছরের অভিজ্ঞতা" 
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">সেবার ধরন / উপ-শ্রেণি <span className="text-red-500">*</span></label>
              <select
                value={providerSubCategory || ""}
                onChange={(e) => setProviderSubCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                required
              >
                <option value="">উপ-শ্রেণি নির্বাচন করুন</option>
                {(categoryToSubcategories[activeCategory] || []).map(sub => (
                  <option key={sub.value} value={sub.value || ""}>{sub.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">কাজের ছবি (ঐচ্ছিক URL)</label>
              <input 
                type="url" 
                value={providerImageUrl || ""} 
                onChange={(e) => setProviderImageUrl(e.target.value)}
                placeholder="যেমন: https://images.unsplash.com/... (খালি রাখলে ডিফল্ট ছবি সেট হবে)" 
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmittingProvider}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer border-none disabled:opacity-50"
          >
            {isSubmittingProvider ? "প্রকাশ করা হচ্ছে..." : "তথ্য সংরক্ষণ ও প্রকাশ করুন"}
          </button>
        </form>
      )}

      {activeCategory === 'sp_construction' && (
        <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 0", marginBottom: "20px" }}>
          <div 
            onClick={() => setSubCategory("sp_mason")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_mason' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_mason' ? "#055943" : "#1e293b", border: subCategory === 'sp_mason' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🧱</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>রাজ মিস্ত্রি</div>
          </div>
          <div 
            onClick={() => setSubCategory("sp_carpenter")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_carpenter' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_carpenter' ? "#055943" : "#1e293b", border: subCategory === 'sp_carpenter' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🪚</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>কাঠ মিস্ত্রি</div>
          </div>
          <div 
            onClick={() => setSubCategory("sp_painter")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_painter' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_painter' ? "#055943" : "#1e293b", border: subCategory === 'sp_painter' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🎨</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>রং মিস্ত্রি</div>
          </div>
          <div 
            onClick={() => setSubCategory("sp_thai_grill_tiles")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_thai_grill_tiles' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_thai_grill_tiles' ? "#055943" : "#1e293b", border: subCategory === 'sp_thai_grill_tiles' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🧊</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>থাই/গ্রিল/টাইলস</div>
          </div>
        </div>
      )}

      {activeCategory === 'sp_plumbing' && (
        <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 0", marginBottom: "20px" }}>
          <div 
            onClick={() => setSubCategory("sp_tubewell")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_tubewell' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_tubewell' ? "#055943" : "#1e293b", border: subCategory === 'sp_tubewell' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🚰</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>টিউবওয়েল মিস্ত্রি</div>
          </div>
          <div 
            onClick={() => setSubCategory("sp_sanitary")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_sanitary' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_sanitary' ? "#055943" : "#1e293b", border: subCategory === 'sp_sanitary' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🚽</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>স্যানিটারি মিস্ত্রি</div>
          </div>
        </div>
      )}

      {activeCategory === 'sp_vehicle' && (
        <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 0", marginBottom: "20px" }}>
          <div 
            onClick={() => setSubCategory("sp_car")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_car' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_car' ? "#055943" : "#1e293b", border: subCategory === 'sp_car' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🚗</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>গাড়ি সার্ভিসিং</div>
          </div>
          <div 
            onClick={() => setSubCategory("sp_bike")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_bike' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_bike' ? "#055943" : "#1e293b", border: subCategory === 'sp_bike' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🏍️</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>বাইক মিস্ত্রি</div>
          </div>
        </div>
      )}

      {activeCategory === 'sp_electronics' && (
        <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 0", marginBottom: "20px" }}>
          <div 
            onClick={() => setSubCategory("sp_electrician")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_electrician' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_electrician' ? "#055943" : "#1e293b", border: subCategory === 'sp_electrician' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>⚡</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>ইলেকট্রিশিয়ান</div>
          </div>
          <div 
            onClick={() => setSubCategory("sp_mobile")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_mobile' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_mobile' ? "#055943" : "#1e293b", border: subCategory === 'sp_mobile' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>📱</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>মোবাইল সার্ভিসিং</div>
          </div>
          <div 
            onClick={() => setSubCategory("sp_computer")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_computer' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_computer' ? "#055943" : "#1e293b", border: subCategory === 'sp_computer' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>💻</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>কম্পিউটার সার্ভিসিং</div>
          </div>
          <div 
            onClick={() => setSubCategory("sp_tv")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_tv' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_tv' ? "#055943" : "#1e293b", border: subCategory === 'sp_tv' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>📺</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>টিভি সার্ভিসিং</div>
          </div>
        </div>
      )}

      {activeCategory === 'sp_technical' && (
        <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 0", marginBottom: "20px" }}>
          <div 
            onClick={() => setSubCategory("sp_wifi")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_wifi' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_wifi' ? "#055943" : "#1e293b", border: subCategory === 'sp_wifi' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🌐</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>WiFi টেকনিশিয়ান</div>
          </div>
          <div 
            onClick={() => setSubCategory("sp_cctv")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_cctv' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_cctv' ? "#055943" : "#1e293b", border: subCategory === 'sp_cctv' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>📹</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>CCTV সার্ভিসিং</div>
          </div>
          <div 
            onClick={() => setSubCategory("sp_ac")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_ac' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_ac' ? "#055943" : "#1e293b", border: subCategory === 'sp_ac' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>❄️</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>এসি সার্ভিসিং</div>
          </div>
          <div 
            onClick={() => setSubCategory("sp_fridge")}
            style={{ flex: 1, minWidth: 0, background: subCategory === 'sp_fridge' ? "#e6f4f1" : "#ffffff", color: subCategory === 'sp_fridge' ? "#055943" : "#1e293b", border: subCategory === 'sp_fridge' ? "1.5px solid #a3e635" : "1px solid #e2e8f0", padding: "10px 2px", borderRadius: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>🧊</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>ফ্রিজ সার্ভিসিং</div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filteredProviders.length > 0 ? (
          filteredProviders.map(provider => (
            <div key={provider.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="m-0 text-lg font-bold text-slate-800">{provider.name}</h3>
                  {provider.verified && (
                    <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                      🟣 Verified Service Provider
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-amber-400 text-emerald-500" />
                    <span className="text-sm font-bold text-amber-700">{provider.rating}</span>
                    <span className="text-xs text-amber-600/80">({provider.reviews})</span>
                  </div>
                  {user && (provider as any).userId === user.uid && (
                    <button
                      onClick={() => handleDeleteProvider(provider.id)}
                      className="p-1.5 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors border-none cursor-pointer"
                      title="পোস্টটি মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{provider.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{provider.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-4 h-4 flex items-center justify-center bg-slate-100 rounded text-[10px]">🛠️</div>
                  <span>{categoryLabels[provider.category]}</span>
                </div>
              </div>

              {provider.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-500" /> কাজের কিছু ছবি (ক্লিক করে বড় করে দেখুন):
                  </p>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x scrollbar-none">
                    {provider.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-slate-200 cursor-zoom-in group hover:border-sky-500 transition-all snap-start"
                        onClick={() => setSelectedImage(img)}
                      >
                        <img 
                          src={img} 
                          alt={`Work ${idx+1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[10px] bg-slate-900/70 text-white px-2 py-0.5 rounded-full font-medium">বড় করে দেখুন</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 w-full">
                <a 
                  href={`tel:${provider.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-bold text-sm transition-colors decoration-none"
                >
                  <Phone className="w-4 h-4" />
                  কল করুন ({provider.phone})
                </a>
                <button
                  onClick={() => toggleFollow({
                    id: provider.id,
                    type: 'provider',
                    name: provider.name,
                    category: categoryLabels[provider.category] || 'সেবাদাতা',
                    location: provider.location,
                    phone: provider.phone
                  })}
                  className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    isFollowing(provider.id)
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/10'
                      : 'bg-white hover:bg-sky-50 text-sky-700 border-sky-200'
                  }`}
                >
                  {isFollowing(provider.id) ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      ফলোইং
                    </>
                  ) : (
                    <>
                      <span>+</span> ফলো
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setExpandedReviewsProviderId(expandedReviewsProviderId === provider.id ? null : provider.id)}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border-none mt-2"
              >
                <span>⭐</span> {expandedReviewsProviderId === provider.id ? "রিভিউ ও রেটিং বন্ধ করুন" : "রিভিউ ও রেটিং দেখুন"}
              </button>

              {expandedReviewsProviderId === provider.id && (
                <div className="w-full mt-2 animate-fade-in border-t border-neutral-100 pt-3">
                  <RatingReviewsList itemId={`provider_${provider.id}`} itemName={provider.name} itemCategory={categoryLabels[provider.category] || "সেবাদাতা"} />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-slate-500 m-0">এই ক্যাটাগরিতে কোনো সেবা প্রদানকারী পাওয়া যায়নি।</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="কাজের বিস্তারিত ছবি" 
              className="max-w-full max-h-[75vh] object-contain rounded-xl border border-white/20 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <button 
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/35 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-all border-none shadow-md"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
          <p className="text-white/80 text-sm mt-4 text-center font-semibold bg-black/50 px-4 py-2 rounded-full">
            বন্ধ করতে স্ক্রিনের যেকোনো জায়গায় অথবা ✕ বাটনে চাপুন
          </p>
        </div>
      )}
      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};
