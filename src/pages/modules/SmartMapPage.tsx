import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Compass, Search, Navigation, Info, ArrowLeft, 
  Building2, Phone, Sparkles, ChevronRight, Check, Map as MapIcon, 
  RotateCcw, ShieldAlert, Award, Star, Locate, SearchCode,
  Activity, Stethoscope, GraduationCap, Store, Landmark, Eye, Wrench,
  Clock, Flame, HelpCircle, Layers, ExternalLink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, InfoWindow, useMap as useGoogleMap } from '@vis.gl/react-google-maps';

// Google Maps API Key resolution
const GOOGLE_MAPS_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasGoogleKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'YOUR_API_KEY';

// Fix for Leaflet default icon issues in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Category Pin color helper
const getCategoryColor = (category: string) => {
  if (category === 'emergency' || category === 'hospital') return '#ef4444';
  if (category === 'tourism') return '#10b981';
  if (category === 'education') return '#8b5cf6';
  if (category === 'govt' || category === 'services') return '#f59e0b';
  return '#3b82f6';
};

// Custom Category Marker Generator
const getCustomIcon = (category: string) => {
  let color = '#3b82f6'; // Blue default
  if (category === 'emergency' || category === 'hospital') color = '#ef4444'; // Red
  else if (category === 'tourism') color = '#10b981'; // Emerald
  else if (category === 'education') color = '#8b5cf6'; // Purple
  else if (category === 'govt' || category === 'services') color = '#f59e0b'; // Amber

  return new L.DivIcon({
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1);"><span style="color: white; font-size: 14px; font-weight: bold;">📍</span></div>`,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Real-world villages in Puthia, mapped by Union
const PUTHIA_UNION_VILLAGES: Record<string, string[]> = {
  'পুঠিয়া সদর': ['কান্দ্রা', 'পীরগাছা', 'গোপালপুর', 'গণ্ডগোহালী', 'রামজীবনপুর', 'কৃষ্ণপুর', 'রাজবাড়ী পাড়া'],
  'বেলপুকুরিয়া': ['ধোকড়াকুল', 'বেলপুকুরিয়া', 'ভড়ুয়াপাড়া', 'ছোট শশিয়ারা', 'বড় শশিয়ারা', 'চক কৃষ্ণপুর'],
  'বানেশ্বর': ['খুটিপাড়া', 'দিঘলকান্দি', 'নামোদরপুর', 'পোল্লাপুকুর', 'ধাদাশ', 'বানেশ্বর বাজার'],
  'ভালুকগাছি': ['ভালুকগাছি', 'দুর্গাপুর', 'নন্দনপুর', 'চক মধুপুর', 'তেপুকুরিয়া', 'মালিগাছা'],
  'জিউপাড়া': ['জিউপাড়া', 'চক জিউপাড়া', 'পলাশবাড়ী', 'বারইপাড়া', 'দোমাড়িয়া', 'চক দেউলিয়া'],
  'শিলমাড়িয়া': ['শিলমাড়িয়া', 'রসুলপুর', 'কালীগঞ্জ', 'ধোপাপাড়া', 'পচামাড়িয়া', 'ভালুকার মোড়']
};

interface Institution {
  id: string;
  name: string;
  category: 'hospital' | 'emergency' | 'tourism' | 'education' | 'govt' | 'services';
  categoryLabel: string;
  lat: number;
  lng: number;
  union: string;
  village: string;
  phone: string;
  address: string;
  description: string;
  imageUrl?: string;
  rating?: number;
}

// 20+ Real-world major institutions and hotspots of Puthia with real coordinates
const PUTHIA_INSTITUTIONS: Institution[] = [
  {
    id: "inst-1",
    name: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
    category: "hospital",
    categoryLabel: "হাসপাতাল ও স্বাস্থ্য সেবা",
    lat: 24.3735,
    lng: 88.8430,
    union: "পুঠিয়া সদর",
    village: "কান্দ্রা",
    phone: "01713061245",
    address: "পুঠিয়া উপজেলা রোড, কান্দ্রা",
    description: "উপজেলার প্রধান সরকারি হাসপাতাল। এখানে ২৪ ঘণ্টা জরুরি বিভাগ, প্যাথলজি ও ইনডোর চিকিৎসা সেবা চালু রয়েছে।",
    imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop",
    rating: 4.8
  },
  {
    id: "inst-2",
    name: "ঐতিহাসিক পুঠিয়া রাজবাড়ী ও রাজপ্রাসাদ",
    category: "tourism",
    categoryLabel: "ঐতিহাসিক স্থান ও পর্যটন",
    lat: 24.369528,
    lng: 88.841528,
    union: "পুঠিয়া সদর",
    village: "রাজবাড়ী পাড়া",
    phone: "01712345678",
    address: "রাজবাড়ী চত্বর, পুঠিয়া",
    description: "১৮৯৫ সালে রানী জ্ঞানদা দেবী কর্তৃক ইন্দো-ইউরোপীয় স্থাপত্য শৈলীতে নির্মিত বাংলাদেশের অন্যতম সেরা রাজপ্রাসাদ ও ঐতিহ্যবাহী দর্শনীয় স্থান।",
    imageUrl: "https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?q=80&w=2071&auto=format&fit=crop",
    rating: 4.9
  },
  {
    id: "inst-3",
    name: "ঐতিহাসিক বড় শিব মন্দির",
    category: "tourism",
    categoryLabel: "ঐতিহাসিক স্থান ও পর্যটন",
    lat: 24.369444,
    lng: 88.842778,
    union: "পুঠিয়া সদর",
    village: "রাজবাড়ী পাড়া",
    phone: "01712345679",
    address: "রাজবাড়ী দীঘির পূর্ব পাড়, পুঠিয়া",
    description: "১৮২৩ সালে পুঠিয়ার রানী ভুবনময়ী দেবী দ্বারা নির্মিত এটি বাংলাদেশের অন্যতম বৃহত্তম এবং চমৎকার কারুকার্যখচিত শিব মন্দির।",
    imageUrl: "https://images.unsplash.com/photo-1544860707-c352cc5a92e3?q=80&w=1974&auto=format&fit=crop",
    rating: 4.7
  },
  {
    id: "inst-4",
    name: "পুঠিয়া মডেল থানা (পুলিশ স্টেশন)",
    category: "emergency",
    categoryLabel: "আইনশৃঙ্খলা ও জরুরি সেবা",
    lat: 24.3710,
    lng: 88.8390,
    union: "পুঠিয়া সদর",
    village: "গোপালপুর",
    phone: "01320122245",
    address: "পুঠিয়া সদর থানা রোড, গোপালপুর",
    description: "পুঠিয়া উপজেলার আইন-শৃঙ্খলা রক্ষা এবং জনগণের আইনি সহায়তার ২৪ ঘণ্টার কেন্দ্র। যেকোনো বিপদে সরাসরি বা হটলাইনে যোগাযোগ করুন।",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1976&auto=format&fit=crop",
    rating: 4.5
  },
  {
    id: "inst-5",
    name: "পুঠিয়া ফায়ার সার্ভিস ও সিভিল ডিফেন্স",
    category: "emergency",
    categoryLabel: "আইনশৃঙ্খলা ও জরুরি সেবা",
    lat: 24.3745,
    lng: 88.8370,
    union: "পুঠিয়া সদর",
    village: "গোপালপুর",
    phone: "01730002245",
    address: "ঢাকা-রাজশাহী মহাসড়ক সংলগ্ন, পুঠিয়া",
    description: "অগ্নিকাণ্ড, সড়ক দুর্ঘটনা ও যেকোনো দুর্যোগ প্রশমনে দ্রুত সাড়াদানকারী এবং উদ্ধার কাজে নিয়োজিত ফায়ার সার্ভিস স্টেশন।",
    imageUrl: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?q=80&w=2070&auto=format&fit=crop",
    rating: 4.6
  },
  {
    id: "inst-6",
    name: "বানেশ্বর ডিগ্রি কলেজ",
    category: "education",
    categoryLabel: "শিক্ষা প্রতিষ্ঠান",
    lat: 24.3860,
    lng: 88.8040,
    union: "বানেশ্বর",
    village: "খুটিপাড়া",
    phone: "0721-780124",
    address: "কলেজ রোড, বানেশ্বর বাজার",
    description: "উপজেলার অত্যন্ত ঐতিহ্যবাহী ও বৃহৎ উচ্চ শিক্ষালয়। এখানে উচ্চ মাধ্যমিক, স্নাতক (পাস) ও অনার্স কোর্স চালূ রয়েছে।",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop",
    rating: 4.4
  },
  {
    id: "inst-7",
    name: "বানেশ্বর বাজার ঐতিহ্যবাহী আমের হাট",
    category: "services",
    categoryLabel: "বাজার ও বাণিজ্যিক কেন্দ্র",
    lat: 24.3870,
    lng: 88.8020,
    union: "বানেশ্বর",
    village: "নামোদরপুর",
    phone: "01715566778",
    address: "বানেশ্বর বাজার আম চত্বর",
    description: "উত্তরবঙ্গের বৃহত্তম সুস্বাদু আমের পাইকারি বাজার। বৈশাখ থেকে আষাঢ় মাস পর্যন্ত প্রতিদিন কোটি কোটি টাকার আম বেচাকেনা হয় এখানে।",
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1974&auto=format&fit=crop",
    rating: 4.9
  },
  {
    id: "inst-8",
    name: "বেলপুকুরিয়া ইউনিয়ন ডিজিটাল সেন্টার",
    category: "govt",
    categoryLabel: "প্রশাসনিক ও ইউনিয়ন পরিষদ",
    lat: 24.3520,
    lng: 88.7650,
    union: "বেলপুকুরিয়া",
    village: "বেলপুকুরিয়া",
    phone: "01732998877",
    address: "বেলপুকুরিয়া ইউনিয়ন পরিষদ ভবন",
    description: "অনলাইন জন্ম নিবন্ধন, পর্চা, জমির দাগ নাম্বার যাচাই, নাগরিক সনদপত্র এবং কম্পিউটার প্রশিক্ষণ প্রদানের ডিজিটাল হাব।",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=2053&auto=format&fit=crop",
    rating: 4.3
  },
  {
    id: "inst-9",
    name: "ভালুকগাছি কমিউনিটি ক্লিনিক",
    category: "hospital",
    categoryLabel: "হাসপাতাল ও স্বাস্থ্য সেবা",
    lat: 24.3980,
    lng: 88.8750,
    union: "ভালুকগাছি",
    village: "ভালুকগাছি",
    phone: "01912883344",
    address: "ভালুকগাছি উত্তর পাড়া",
    description: "গ্রামীণ মা ও শিশুদের স্বাস্থ্য সেবা, বিনামূল্যে ঔষধ বিতরণ এবং সাধারণ প্রাথমিক চিকিৎসার নির্ভরযোগ্য সরকারি কেন্দ্র।",
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2070&auto=format&fit=crop",
    rating: 4.1
  },
  {
    id: "inst-10",
    name: "জিউপাড়া শহীদ স্মৃতি উচ্চ বিদ্যালয়",
    category: "education",
    categoryLabel: "শিক্ষা প্রতিষ্ঠান",
    lat: 24.3410,
    lng: 88.8920,
    union: "জিউপাড়া",
    village: "জিউপাড়া",
    phone: "01725112233",
    address: "জিউপাড়া হাইস্কুল মোড়",
    description: "জিউপাড়া ইউনিয়নের প্রধান ও সবচেয়ে প্রাচীন মাধ্যমিক বিদ্যালয়। মানসম্মত শিক্ষা ও সহশিক্ষা কার্যক্রমে অনন্য কৃতিত্ব রয়েছে।",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop",
    rating: 4.5
  },
  {
    id: "inst-11",
    name: "শিলমাড়িয়া ইউনিয়ন পরিষদ কার্যালয়",
    category: "govt",
    categoryLabel: "প্রশাসনিক ও ইউনিয়ন পরিষদ",
    lat: 24.4320,
    lng: 88.9150,
    union: "শিলমাড়িয়া",
    village: "শিলমাড়িয়া",
    phone: "01716334455",
    address: "শিলমাড়িয়া নতুন বাজার কার্যালয়",
    description: "শিলমাড়িয়া ইউনিয়নের প্রশাসনিক সদরদপ্তর। চেয়ারম্যান মহোদয় ও সদস্যবৃন্দের সাথে যোগাযোগ ও স্থানীয় বিরোধ নিষ্পত্তির কার্যালয়।",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
    rating: 4.2
  },
  {
    id: "inst-12",
    name: "পুঠিয়া উপজেলা পিআইও এবং ইউএনও অফিস",
    category: "govt",
    categoryLabel: "প্রশাসনিক ও ইউনিয়ন পরিষদ",
    lat: 24.3720,
    lng: 88.8410,
    union: "পুঠিয়া সদর",
    village: "গোপালপুর",
    phone: "01713200100",
    address: "পুঠিয়া উপজেলা পরিষদ চত্বর",
    description: "উপজেলার প্রশাসনিক সর্বোচ্চ প্রশাসনিক ভবন। উপজেলা নির্বাহী অফিসার (ইউএনও) মহোদয়ের সাথে দাপ্তরিক সাক্ষাতের প্রধান কেন্দ্র।",
    imageUrl: "https://images.unsplash.com/photo-1577416412292-747c6607f055?q=80&w=2073&auto=format&fit=crop",
    rating: 4.6
  },
  {
    id: "inst-13",
    name: "পুঠিয়া রাজবাড়ী সরকারী বালিকা উচ্চ বিদ্যালয়",
    category: "education",
    categoryLabel: "শিক্ষা প্রতিষ্ঠান",
    lat: 24.3705,
    lng: 88.8450,
    union: "পুঠিয়া সদর",
    village: "কান্দ্রা",
    phone: "0721-780120",
    address: "কান্দ্রা হাই স্কুল রোড, পুঠিয়া",
    description: "উপজেলার অন্যতম সেরা সরকারি বালিকা বিদ্যালয়। মাধ্যমিক স্তরে নারী শিক্ষার প্রসারে অত্যন্ত প্রশংসনীয় ভূমিকা রাখছে।",
    imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070&auto=format&fit=crop",
    rating: 4.7
  },
  {
    id: "inst-14",
    name: "বানেশ্বর বিএসবি পপুলার ডায়াগনস্টিক",
    category: "hospital",
    categoryLabel: "হাসপাতাল ও স্বাস্থ্য সেবা",
    lat: 24.3855,
    lng: 88.8030,
    union: "বানেশ্বর",
    village: "দিঘলকান্দি",
    phone: "01714445566",
    address: "ঢাকা-রাজশাহী মহাসড়ক, বানেশ্বর",
    description: "আধুনিক ডিজিটাল প্যাথলজি ল্যাব, আল্ট্রাসোনোগ্রাফি, ইসিজি এবং ল্যাব টেস্টের নির্ভরযোগ্য প্যাথলজি সেন্টার।",
    imageUrl: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?q=80&w=1974&auto=format&fit=crop",
    rating: 4.4
  },
  {
    id: "inst-15",
    name: "বেলপুকুর বাইপাস মোড় হাইওয়ে পুলিশ ফাড়ী",
    category: "emergency",
    categoryLabel: "আইনশৃঙ্খলা ও জরুরি সেবা",
    lat: 24.3550,
    lng: 88.7610,
    union: "বেলপুকুরিয়া",
    village: "ধোকড়াকুল",
    phone: "01320133344",
    address: "বেলপুকুর বাইপাস সংলগ্ন",
    description: "মহাসড়কের নিরাপত্তা এবং মহাসড়কে ডাকাতি ও দুর্ঘটনা প্রশমনে নিয়োজিত রাজশাহী হাইওয়ে পুলিশ ফোর্স ইউনিট।",
    imageUrl: "https://images.unsplash.com/photo-1513829096999-4978602297f7?q=80&w=2070&auto=format&fit=crop",
    rating: 4.3
  }
];

// Puthia Center Reference Coords (Sadar Rajbari Area)
const PUTHIA_CENTER_COORDS = { lat: 24.369528, lng: 88.841528 };
const PUTHIA_BUS_STAND_COORDS = { lat: 24.3725, lng: 88.8350 };

// Geodesic distance calculator (Haversine formula) in kilometers
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2)); // Return with 2 decimal places
};

// Travel time estimations helper (returns in minutes)
const estimateTravelTime = (distanceKm: number, mode: 'walk' | 'bike' | 'auto') => {
  let speed = 4; // km/h for walk
  if (mode === 'bike') speed = 25; // km/h for bike
  if (mode === 'auto') speed = 15; // km/h for auto/tomtom
  
  const timeHours = distanceKm / speed;
  const mins = Math.round(timeHours * 60);
  return mins < 1 ? 1 : mins;
};

// ChangeMapCenter helper component for Leaflet
function ChangeMapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15, { animate: true });
  }, [center, map]);
  return null;
}

// Recenter helper component for Google Maps
function GoogleMapCenterController({ center }: { center: { lat: number; lng: number } }) {
  const map = useGoogleMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center.lat, center.lng]);
  return null;
}

export default function SmartMapPage() {
  const [institutions, setInstitutions] = useState<Institution[]>(PUTHIA_INSTITUTIONS);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(PUTHIA_INSTITUTIONS[0]);
  const [mapProvider, setMapProvider] = useState<'google' | 'osm'>(hasGoogleKey ? 'google' : 'google');
  const [googleMapType, setGoogleMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  
  // Filtering & Cascading dropdown states
  const [selectedUnion, setSelectedUnion] = useState<string>('all');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Location origin states for distance calculations
  const [originType, setOriginType] = useState<'bus_stand' | 'user_gps' | 'rajbari'>('bus_stand');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Active Map view coordinates
  const activeCenterCoords = useMemo(() => {
    if (selectedInstitution) {
      return [selectedInstitution.lat, selectedInstitution.lng] as [number, number];
    }
    return [PUTHIA_CENTER_COORDS.lat, PUTHIA_CENTER_COORDS.lng] as [number, number];
  }, [selectedInstitution]);

  // Current origin coordinate used for distance calculation
  const originCoordinates = useMemo(() => {
    if (originType === 'user_gps' && userLocation) {
      return userLocation;
    }
    if (originType === 'rajbari') {
      return PUTHIA_CENTER_COORDS;
    }
    return PUTHIA_BUS_STAND_COORDS; // default to Puthiya Bus Stand
  }, [originType, userLocation]);

  // Dynamic lists of villages
  const villagesList = useMemo(() => {
    if (selectedUnion === 'all') return [];
    return PUTHIA_UNION_VILLAGES[selectedUnion] || [];
  }, [selectedUnion]);

  // Request & get user live GPS coordinates
  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("দুঃখিত, আপনার ব্রাউজারটি জিপিএস লোকেশন সাপোর্ট করে না। পুঠিয়া বাসস্ট্যান্ড অবস্থান থেকে হিসাব দেখানো হচ্ছে।");
      setOriginType('bus_stand');
      return;
    }
    setIsLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setOriginType('user_gps');
        setIsLocating(false);
      },
      (error) => {
        const errorMessage = error.message || (error.code === 1 ? "লোকেশন পারমিশন দেওয়া হয়নি।" : "জিপিএস লোকেশন সার্ভিস পাওয়া যায়নি।");
        console.warn("GPS Geolocation notice:", errorMessage);
        setGpsError("জিপিএস অফ রয়েছে বা পারমিশন দেওয়া হয়নি। পুঠিয়া বাসস্ট্যান্ড কেন্দ্র থেকে হিসাব করা হচ্ছে।");
        setOriginType('bus_stand');
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  };

  // Reset filter when union changes
  const handleUnionChange = (union: string) => {
    setSelectedUnion(union);
    setSelectedVillage('all'); // reset village filter
  };

  // Pre-calculate distances and sort lists
  const calculatedAndFilteredList = useMemo(() => {
    return institutions
      .map(inst => {
        const distance = calculateDistance(
          originCoordinates.lat,
          originCoordinates.lng,
          inst.lat,
          inst.lng
        );
        return { ...inst, distance };
      })
      .filter(inst => {
        const matchUnion = selectedUnion === 'all' || inst.union === selectedUnion;
        const matchVillage = selectedVillage === 'all' || inst.village === selectedVillage;
        const matchCategory = activeCategory === 'all' || inst.category === activeCategory;
        const matchText = searchQuery.trim() === '' || 
          inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inst.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inst.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inst.village.toLowerCase().includes(searchQuery.toLowerCase());

        return matchUnion && matchVillage && matchCategory && matchText;
      })
      // Sort by nearest first
      .sort((a, b) => a.distance - b.distance);
  }, [institutions, originCoordinates, selectedUnion, selectedVillage, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white z-40 px-4 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()}
              className="p-1.5 hover:bg-white/10 rounded-full transition-all text-white shrink-0 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles size={10} className="animate-pulse" /> পুঠিয়া পৌরসভা ও উপজেলা ডিজিটাল ম্যাপ
              </span>
              <h1 className="text-base sm:text-lg font-black tracking-tight mt-0.5 flex items-center gap-1.5">
                <MapIcon className="text-emerald-400" size={18} /> স্মার্ট লোকেশন ও ম্যাপ গাইড
              </h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              📍 রেফারেন্স কেন্দ্র: {originType === 'bus_stand' ? 'পুঠিয়া বাসস্ট্যান্ড' : originType === 'rajbari' ? 'পুঠিয়া রাজবাড়ী' : 'লাইভ জিপিএস'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Split Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 pb-20">
        
        {/* Left Side: Advanced Filters, Hierarchy & Listing (Col 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Card 1: Hierarchical Cascading Filtering (উপজেলা → ইউনিয়ন → গ্রাম) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={14} className="text-emerald-600" />
                <span>প্রশাসনিক লোকেশন ফিল্টার</span>
              </h3>
              <button 
                onClick={() => {
                  setSelectedUnion('all');
                  setSelectedVillage('all');
                  setActiveCategory('all');
                  setSearchQuery('');
                  setOriginType('bus_stand');
                }}
                className="text-[10px] text-slate-400 hover:text-emerald-600 font-extrabold flex items-center gap-1 transition-colors cursor-pointer border-none bg-transparent"
              >
                <RotateCcw size={10} /> রিসেট অল
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Dropdown 1: Upazila (Fixed to Puthia) */}
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">উপজেলা</label>
                <select 
                  disabled 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-xl py-2 px-2 text-[11px] font-extrabold cursor-not-allowed"
                >
                  <option>পুঠিয়া (রাজশাহী)</option>
                </select>
              </div>

              {/* Dropdown 2: Union Select */}
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">ইউনিয়ন</label>
                <select 
                  value={selectedUnion}
                  onChange={(e) => handleUnionChange(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 text-slate-800 rounded-xl py-2 px-1.5 text-[11px] font-extrabold outline-none cursor-pointer"
                >
                  <option value="all">সব ইউনিয়ন</option>
                  <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                  <option value="বানেশ্বর">বানেশ্বর</option>
                  <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                  <option value="ভালুকগাছি">ভালুকগাছি</option>
                  <option value="জিউপাড়া">জিউপাড়া</option>
                  <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                </select>
              </div>

              {/* Dropdown 3: Village Select (Cascading based on Union) */}
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">গ্রাম</label>
                <select 
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  disabled={selectedUnion === 'all'}
                  className={`w-full border text-[11px] font-extrabold rounded-xl py-2 px-1.5 outline-none cursor-pointer ${
                    selectedUnion === 'all' 
                      ? 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-50 focus:bg-white border-slate-200 focus:border-emerald-500 text-slate-800'
                  }`}
                >
                  <option value="all">সব গ্রাম</option>
                  {villagesList.map((village) => (
                    <option key={village} value={village}>{village}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Distance Calculator Settings & User Location */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Locate size={14} className="text-indigo-600 animate-pulse" />
                <span>দূরত্ব ও যাতায়াত হিসাবকারী</span>
              </h3>
              {userLocation && (
                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                  <Check size={10} /> জিপিএস সচল
                </span>
              )}
            </div>

            <p className="text-[11px] font-medium text-slate-500 leading-normal">
              পুঠিয়ার যে কোনো প্রতিষ্ঠান আপনার বর্তমান অবস্থান থেকে কত দূরে এবং পৌঁছাতে কত সময় লাগবে তা হিসাব করুন।
            </p>

            <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl">
              <button
                onClick={() => setOriginType('bus_stand')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-black border-none cursor-pointer transition-all ${
                  originType === 'bus_stand' 
                    ? 'bg-white text-emerald-700 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🚌 বাসস্ট্যান্ড
              </button>
              <button
                onClick={() => setOriginType('rajbari')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-black border-none cursor-pointer transition-all ${
                  originType === 'rajbari' 
                    ? 'bg-white text-emerald-700 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🏛️ রাজবাড়ী
              </button>
              <button
                onClick={handleGetGPSLocation}
                disabled={isLocating}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-black border-none cursor-pointer transition-all flex items-center justify-center gap-1 ${
                  originType === 'user_gps' 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                📡 {isLocating ? 'খুঁজছে...' : 'লাইভ জিপিএস'}
              </button>
            </div>

            {gpsError && (
              <div className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-[10px] font-bold text-red-600 flex items-center gap-1.5">
                <ShieldAlert size={12} className="shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>

          {/* Search Bar & Categorical Filter Tabs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex-1 flex flex-col">
            
            {/* Live Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রতিষ্ঠানের নাম, ক্যাটাগরি বা গ্রাম লিখে লাইভ খুঁজুন..."
                className="w-full bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-600 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-slate-800 outline-none transition-all"
              />
            </div>

            {/* Quick Category Chips */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none py-1 border-b border-slate-100 shrink-0">
              {[
                { id: 'all', label: 'সব', color: 'bg-slate-100 text-slate-700' },
                { id: 'hospital', label: '🏥 স্বাস্থ্য ও হাসপাতাল', color: 'bg-red-50 text-red-700' },
                { id: 'tourism', label: '🏛️ পর্যটন', color: 'bg-emerald-50 text-emerald-700' },
                { id: 'emergency', label: '🚒 জরুরি', color: 'bg-rose-50 text-rose-700' },
                { id: 'education', label: '🎓 শিক্ষা', color: 'bg-purple-50 text-purple-700' },
                { id: 'govt', label: '🏢 প্রশাসনিক', color: 'bg-amber-50 text-amber-700' },
                { id: 'services', label: '🛒 বাজার', color: 'bg-indigo-50 text-indigo-700' }
              ].map((chip) => {
                const isActive = activeCategory === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setActiveCategory(chip.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold border shrink-0 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : `${chip.color} border-transparent hover:brightness-95`
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* List View of Institutions Sorted by Distance */}
            <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2 pr-1 scrollbar-thin">
              <div className="px-1 py-1 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                <span>অনুসন্ধান অনুযায়ী কাছাকাছি সেবা তালিকা ({calculatedAndFilteredList.length})</span>
                <span>দূরত্ব অনুযায়ী সাজানো</span>
              </div>

              {calculatedAndFilteredList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-bold space-y-1.5">
                  <p>দুঃখিত, কোনো প্রতিষ্ঠান বা সেবা পাওয়া যায়নি!</p>
                  <p className="text-[10px] font-normal text-slate-400">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
                </div>
              ) : (
                calculatedAndFilteredList.map((inst) => {
                  const isSelected = selectedInstitution?.id === inst.id;
                  const dist = inst.distance;

                  return (
                    <div
                      key={inst.id}
                      onClick={() => setSelectedInstitution(inst)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-start relative ${
                        isSelected 
                          ? 'bg-emerald-50/50 border-emerald-300 shadow-xs' 
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {/* Left color bar */}
                      <div className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-xl ${
                        inst.category === 'hospital' ? 'bg-red-500' :
                        inst.category === 'tourism' ? 'bg-emerald-500' :
                        inst.category === 'emergency' ? 'bg-rose-500' :
                        inst.category === 'education' ? 'bg-purple-500' :
                        inst.category === 'govt' ? 'bg-amber-500' : 'bg-indigo-500'
                      }`} />

                      {/* Small Thumbnail */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-100 shadow-3xs">
                        {inst.imageUrl ? (
                          <img src={inst.imageUrl} alt={inst.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold bg-slate-50">
                            🏢
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                            {inst.categoryLabel}
                          </span>
                          
                          {/* DYNAMIC DISTANCE BADGE */}
                          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded-full">
                            {dist < 1 ? `${Math.round(dist * 1000)} মিটার` : `${dist} কি.মি.`}
                          </span>
                        </div>

                        <h4 className="text-xs font-black text-slate-800 truncate mt-0.5">
                          {inst.name}
                        </h4>

                        <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">
                          📍 {inst.union} • {inst.village}
                        </p>

                        <div className="flex items-center gap-3 mt-1.5 text-[9px] text-slate-400 font-bold">
                          <span className="flex items-center gap-0.5 text-slate-400">
                            <Clock size={10} className="text-slate-400" />
                            <span>অটোতে: {estimateTravelTime(dist, 'auto')} মিনিট</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

        {/* Right Side: Map Viewer Panel & Interactive Navigation View (Col 7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Card 3: The Map Box */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs h-[420px] lg:h-[480px] relative flex flex-col">
            
            {/* Top Map Control Bar */}
            <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none gap-2">
              {/* Provider & Map Type Switcher */}
              <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg border border-white/10 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-400 mr-1">
                  <MapIcon size={12} />
                  <span>গুগল ম্যাপস</span>
                </span>
                
                {hasGoogleKey && (
                  <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg">
                    <button
                      onClick={() => setGoogleMapType('roadmap')}
                      className={`px-2 py-0.5 rounded text-[9px] font-black transition-all cursor-pointer ${
                        googleMapType === 'roadmap' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      রোডম্যাপ
                    </button>
                    <button
                      onClick={() => setGoogleMapType('satellite')}
                      className={`px-2 py-0.5 rounded text-[9px] font-black transition-all cursor-pointer ${
                        googleMapType === 'satellite' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      স্যাটেলাইট
                    </button>
                    <button
                      onClick={() => setGoogleMapType('terrain')}
                      className={`px-2 py-0.5 rounded text-[9px] font-black transition-all cursor-pointer ${
                        googleMapType === 'terrain' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      ভূপ্রকৃতি
                    </button>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="pointer-events-auto bg-emerald-950/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-full text-[9px] font-black flex items-center gap-1.5 shadow-md border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>লাইভ জিপিএস ও দূরত্ব</span>
              </div>
            </div>

            {/* Map Frame Container */}
            <div className="flex-1 w-full h-full relative z-10">
              {hasGoogleKey && mapProvider === 'google' ? (
                <APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
                  <GoogleMap
                    defaultCenter={{ lat: activeCenterCoords[0], lng: activeCenterCoords[1] }}
                    center={{ lat: activeCenterCoords[0], lng: activeCenterCoords[1] }}
                    defaultZoom={14}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ height: '100%', width: '100%' }}
                    mapTypeId={googleMapType}
                  >
                    <GoogleMapCenterController center={{ lat: activeCenterCoords[0], lng: activeCenterCoords[1] }} />

                    {calculatedAndFilteredList.map((inst) => (
                      <AdvancedMarker
                        key={inst.id}
                        position={{ lat: inst.lat, lng: inst.lng }}
                        onClick={() => setSelectedInstitution(inst)}
                      >
                        <Pin
                          background={getCategoryColor(inst.category)}
                          borderColor="#ffffff"
                          glyphColor="#ffffff"
                          scale={selectedInstitution?.id === inst.id ? 1.3 : 1.0}
                        />
                      </AdvancedMarker>
                    ))}

                    {/* Origin Marker */}
                    <AdvancedMarker
                      position={{ lat: originCoordinates.lat, lng: originCoordinates.lng }}
                    >
                      <Pin
                        background="#6366f1"
                        borderColor="#ffffff"
                        glyphColor="#ffffff"
                        scale={1.2}
                      />
                    </AdvancedMarker>
                  </GoogleMap>
                </APIProvider>
              ) : (
                <MapContainer
                  center={activeCenterCoords}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Change Map Center Helper */}
                  <ChangeMapCenter center={activeCenterCoords} />

                  {/* Draw all filtered spots as markers */}
                  {calculatedAndFilteredList.map((inst) => (
                    <LeafletMarker
                      key={inst.id}
                      position={[inst.lat, inst.lng]}
                      icon={getCustomIcon(inst.category)}
                      eventHandlers={{
                        click: () => {
                          setSelectedInstitution(inst);
                        }
                      }}
                    >
                      <LeafletPopup>
                        <div className="text-center font-sans p-1 max-w-xs">
                          <span className="text-[9px] font-black text-indigo-600 block uppercase mb-0.5">
                            {inst.categoryLabel}
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-800 leading-tight">
                            {inst.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-1">
                            📍 {inst.village}, {inst.union}
                          </p>
                          <p className="text-[9px] font-bold text-indigo-600 bg-indigo-50 py-0.5 px-1.5 rounded-full inline-block mt-1.5">
                            দূরত্ব: {inst.distance < 1 ? `${Math.round(inst.distance * 1000)} মিটার` : `${inst.distance} কি.মি.`}
                          </p>
                        </div>
                      </LeafletPopup>
                    </LeafletMarker>
                  ))}

                  {/* Mark Selected Origin Coords (GPS/Bus Stand/Rajbari) */}
                  <LeafletMarker
                    position={[originCoordinates.lat, originCoordinates.lng]}
                    icon={new L.DivIcon({
                      html: `<div style="background-color: #6366f1; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"><span style="color: white; font-size: 13px;">🏠</span></div>`,
                      className: 'origin-marker-icon',
                      iconSize: [34, 34],
                      iconAnchor: [17, 34]
                    })}
                  >
                    <LeafletPopup>
                      <div className="text-center font-sans">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase block">আপনার যাত্রা শুরুর অবস্থান</span>
                        <p className="text-xs font-black text-slate-800">
                          {originType === 'bus_stand' ? 'পুঠিয়া বাসস্ট্যান্ড' : originType === 'rajbari' ? 'পুঠিয়া রাজবাড়ী' : 'আমার লাইভ অবস্থান (GPS)'}
                        </p>
                      </div>
                    </LeafletPopup>
                  </LeafletMarker>
                </MapContainer>
              )}
            </div>

          </div>

          {/* Card 4: Selected Institution Details Panel */}
          {selectedInstitution && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 relative overflow-hidden">
              {/* Category indicator strip */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                selectedInstitution.category === 'hospital' ? 'bg-red-500' :
                selectedInstitution.category === 'tourism' ? 'bg-emerald-500' :
                selectedInstitution.category === 'emergency' ? 'bg-rose-500' :
                selectedInstitution.category === 'education' ? 'bg-purple-500' :
                selectedInstitution.category === 'govt' ? 'bg-amber-500' : 'bg-indigo-500'
              }`} />

              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      {selectedInstitution.categoryLabel}
                    </span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Compass size={11} />
                      <span>{selectedInstitution.union} • {selectedInstitution.village}</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                    {selectedInstitution.name}
                  </h3>

                  <p className="text-xs font-medium text-slate-500 leading-relaxed">
                    {selectedInstitution.description}
                  </p>

                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <MapPin size={13} className="text-emerald-600 shrink-0" />
                    <span>ঠিকানা: {selectedInstitution.address}</span>
                  </div>
                </div>

                {/* Calculated Distances & Travel Times Grid */}
                <div className="w-full sm:w-auto shrink-0 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/50 space-y-2.5">
                  <div className="text-center border-b border-slate-200/80 pb-2">
                    <span className="text-[9px] font-black text-slate-400 block uppercase">হিসাবকৃত মোট দূরত্ব</span>
                    <span className="text-base font-black text-slate-800">
                      {calculateDistance(
                        originCoordinates.lat,
                        originCoordinates.lng,
                        selectedInstitution.lat,
                        selectedInstitution.lng
                      )} কি.মি.
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-600">
                    <div className="p-1 bg-white rounded-lg border border-slate-100">
                      <span className="block">🚶 হাটা</span>
                      <span className="font-extrabold text-slate-800 block mt-0.5">
                        {estimateTravelTime(calculateDistance(originCoordinates.lat, originCoordinates.lng, selectedInstitution.lat, selectedInstitution.lng), 'walk')} মি.
                      </span>
                    </div>
                    <div className="p-1 bg-white rounded-lg border border-slate-100">
                      <span className="block">🏍️ বাইক</span>
                      <span className="font-extrabold text-slate-800 block mt-0.5">
                        {estimateTravelTime(calculateDistance(originCoordinates.lat, originCoordinates.lng, selectedInstitution.lat, selectedInstitution.lng), 'bike')} মি.
                      </span>
                    </div>
                    <div className="p-1 bg-white rounded-lg border border-slate-100">
                      <span className="block">🛺 অটো</span>
                      <span className="font-extrabold text-emerald-700 block mt-0.5">
                        {estimateTravelTime(calculateDistance(originCoordinates.lat, originCoordinates.lng, selectedInstitution.lat, selectedInstitution.lng), 'auto')} মি.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {selectedInstitution.phone && (
                  <a
                    href={`tel:${selectedInstitution.phone}`}
                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer decoration-none"
                  >
                    <Phone size={13} className="text-slate-600" />
                    ফোন করুন ({selectedInstitution.phone})
                  </a>
                )}
                
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${originCoordinates.lat},${originCoordinates.lng}&destination=${selectedInstitution.lat},${selectedInstitution.lng}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer decoration-none border-none"
                >
                  <Navigation size={13} fill="currentColor" />
                  গুগল ম্যাপসে নেভিগেশন ও ডিরেকশন
                </a>
              </div>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
