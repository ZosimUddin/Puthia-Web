import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, Compass, Search, Sparkles, Navigation, Award,
  Info, CornerUpRight, Map as MapIcon, RotateCcw, AlertTriangle, Check
} from "lucide-react";
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Check for Google Maps React components
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

// Fix for Leaflet default icon issues in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Real-world coordinates of Puthia heritage spots
export interface TouristSpotLocation {
  id: string;
  name: string;
  banglaName: string;
  lat: number;
  lng: number;
  description: string;
  banglaDescription: string;
  category: "palace" | "temple" | "water" | "other";
  categoryLabel: string;
  imageUrl: string;
  era: string;
}

const PUTHIA_SPOTS: TouristSpotLocation[] = [
  {
    id: "puthia-rajbari",
    name: "Puthia Rajbari Palace",
    banglaName: "পুঠিয়া রাজবাড়ী (পাঁচআনি জমিদার প্যালেস)",
    lat: 24.369528,
    lng: 88.841528,
    category: "palace",
    categoryLabel: "জমিদার রাজপ্রাসাদ",
    era: "১৮৯৫ খ্রিষ্টাব্দ",
    imageUrl: "https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?q=80&w=2071&auto=format&fit=crop",
    description: "Built by Queen Jnanada Devi in 1895, this grand Indo-European style palace is the centerpiece of the Puthia Royal Estate.",
    banglaDescription: "১৮৯৫ সালে পুঠিয়ার রাজবংশের রানী জ্ঞানদা দেবী কর্তৃক নির্মিত ইন্দো-ইউরোপীয় স্থাপত্য শৈলীর এক অপূর্ব রাজপ্রাসাদ। এটি পুঠিয়া রাজবাড়ী কমপ্লেক্সের প্রাণকেন্দ্র।"
  },
  {
    id: "bara-shiva-temple",
    name: "Bara Shiva Mandir",
    banglaName: "ঐতিহাসিক বড় শিব মন্দির",
    lat: 24.369444,
    lng: 88.842778,
    category: "temple",
    categoryLabel: "প্রাচীন হিন্দু মন্দির",
    era: "১৮২৩ খ্রিষ্টাব্দ",
    imageUrl: "https://images.unsplash.com/photo-1544860707-c352cc5a92e3?q=80&w=1974&auto=format&fit=crop",
    description: "One of the largest Hindu Shiva temples in Bangladesh, boasting fine architectural panels and an elevated base.",
    banglaDescription: "১৮২৩ সালে পুঠিয়ার রানী ভুবনময়ী দেবী দ্বারা নির্মিত এটি বাংলাদেশের অন্যতম বৃহৎ এবং চমৎকার কারুকার্যখচিত পাঁচ গম্বুজ বিশিষ্ট শিব মন্দির।"
  },
  {
    id: "shyam-sagar",
    name: "Shyam Sagar Dighi",
    banglaName: "মনোরম শ্যাম সাগর দীঘি",
    lat: 24.3703,
    lng: 88.8398,
    category: "water",
    categoryLabel: "রাজকীয় জলাশয়",
    era: "জমিদার আমল",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop",
    description: "A colossal decorative lake located adjacent to the Rajbari, used historically by the royal family and citizens.",
    banglaDescription: "রাজবাড়ির ঠিক পাশেই অবস্থিত বিশাল ঐতিহ্যবাহী দীঘি। রাজপরিবারের স্নান, জলকেলি এবং পুঠিয়াবাসীর সুপেয় পানির প্রধান উৎস ছিল এটি।"
  },
  {
    id: "govinda-temple",
    name: "Panchani Govinda Temple",
    banglaName: "টেরাকোটা সমৃদ্ধ গোবিন্দ মন্দির",
    lat: 24.3689,
    lng: 88.8413,
    category: "temple",
    categoryLabel: "টেরাকোটা শৈলী",
    era: "১৮শ শতাব্দী",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    description: "Highly decorated brick Govinda temple inside the palace courtyard, famous for its detailed terracotta reliefs.",
    banglaDescription: "পুঠিয়া রাজবাড়ীর অভ্যন্তরে অবস্থিত অপূর্ব পোড়ামাটি বা টেরাকোটা ফলক সমৃদ্ধ শ্রীকৃষ্ণ গোবিন্দ মন্দির। দেওয়ালে রামায়ণ ও মহাভারতের কাহিনীর চমৎকার চিত্রণ রয়েছে।"
  },
  {
    id: "dol-mandir",
    name: "Dol Mancha Mandir",
    banglaName: "ঐতিহাসিক দোলমঞ্চ মন্দির",
    lat: 24.3693,
    lng: 88.8436,
    category: "temple",
    categoryLabel: "দোল উৎসব কেন্দ্র",
    era: "১৮৯৫ খ্রিষ্টাব্দ",
    imageUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&crop=face",
    description: "A unique four-tiered pyramidal temple built for the Holi or Dol festival of Lord Krishna.",
    banglaDescription: "দোল উৎসব পালনের জন্য তৈরি চার তলা বিশিষ্ট অত্যন্ত নান্দনিক পিরামিড সদৃশ স্থাপত্যের দোলমঞ্চ। এর একদম উপর তলায় রাধাকৃষ্ণের প্রতিমা স্থাপন করা হতো।"
  },
  {
    id: "choto-anhik",
    name: "Choto Anhik Mandir",
    banglaName: "অনন্য ছোট আহ্নিক মন্দির",
    lat: 24.3688,
    lng: 88.8412,
    category: "temple",
    categoryLabel: "চার চালা মন্দির",
    era: "১৭শ শতাব্দী",
    imageUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=face",
    description: "A small terracotta brick temple with a Bengali 'chala' (hut-like roof) styled structure.",
    banglaDescription: "দোচালা কুঁড়েঘরের অনুকরণে নির্মিত পোড়ামাটির অলংকরণে সমৃদ্ধ একটি ক্ষুদ্রাকৃতির চমৎকার মন্দির যা দেখার জন্য পর্যটকরা ভিড় জমান।"
  },
  {
    id: "puthia-bus-stand",
    name: "Puthia Bus Stand Entry",
    banglaName: "পুঠিয়া বাসস্ট্যান্ড প্রবেশমুখ (ঢাকা-রাজশাহী মহাসড়ক)",
    lat: 24.3725,
    lng: 88.8350,
    category: "other",
    categoryLabel: "যাতায়াত গেটওয়ে",
    era: "আধুনিক",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    description: "Main entry point to Puthia from the national highway, suitable starting point for tour routing.",
    banglaDescription: "পুঠিয়া উপজেলার প্রধান প্রবেশপথ যা ঢাকা-রাজশাহী মহাসড়কের সাথে সংযুক্ত। দূর-দূরান্ত থেকে আসা পর্যটকদের জন্য পুঠিয়া জমিদার বাড়ির মূল যাত্রা এখান থেকেই শুরু হয়।"
  }
];

// Google Maps API Key variables from env
const GOOGLE_MAPS_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasGoogleKey = Boolean(GOOGLE_MAPS_KEY) && GOOGLE_MAPS_KEY !== 'YOUR_API_KEY';

export const PuthiaInteractiveMap: React.FC = () => {
  const [spots] = useState<TouristSpotLocation[]>(PUTHIA_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState<TouristSpotLocation>(PUTHIA_SPOTS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [routeOrigin, setRouteOrigin] = useState<"bus_stand" | "user_location">("bus_stand");
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [showConfigDetails, setShowConfigDetails] = useState(false);

  // Filter spots
  const filteredSpots = spots.filter(spot => {
    const matchesSearch = 
      spot.banglaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.banglaDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || spot.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get user location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("দুঃখিত, আপনার ব্রাউজারটি লোকেশন ট্র্যাকিং সাপোর্ট করে না।");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setRouteOrigin("user_location");
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("আপনার জিপিএস লোকেশন সনাক্ত করা যায়নি। দয়া করে ব্রাউজারে লোকেশন অনুমতি দিন।");
      }
    );
  };

  // Create external Google Maps Direction URL
  const getDirectionsUrl = (spot: TouristSpotLocation) => {
    let originStr = "24.3725,88.8350"; // Puthiya Bus Stand
    if (routeOrigin === "user_location" && userCoords) {
      originStr = `${userCoords.lat},${userCoords.lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${spot.lat},${spot.lng}&travelmode=driving`;
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xl text-left">
      
      {/* Title Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <Compass size={11} className="animate-spin" /> জিপিএস সাপোর্টেড ন্যাভিগেশন গাইড
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <MapIcon className="text-emerald-400" /> ইন্টারঅ্যাক্টিভ পুঠিয়া ম্যাপ ও ট্যুরিস্ট গাইড
          </h2>
          <p className="text-slate-300 text-xs font-semibold mt-1">
            পুঠিয়ার রাজবাড়ী ও প্রাচীন মন্দির কমপ্লেক্সের সঠিক অবস্থান দেখুন এবং রুট ডিরেকশন বের করুন
          </p>
        </div>

        {/* Engine switcher or info */}
        <div className="flex items-center gap-2">
          {hasGoogleKey ? (
            <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Google Maps Premium Active
            </span>
          ) : (
            <button 
              onClick={() => setShowConfigDetails(!showConfigDetails)}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Info size={13} /> OpenStreetMap + Google Navigation
            </button>
          )}
        </div>
      </div>

      {/* Google Maps Secrets Guide if requested */}
      <AnimatePresence>
        {showConfigDetails && !hasGoogleKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border-b border-amber-100 p-6 text-sm font-bold text-amber-950"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900 text-base mb-1">গুগল ক্লাউড ম্যাপস এপিআই কী সেটআপ নির্দেশাবলী</p>
                <p className="text-xs leading-relaxed text-amber-800">
                  বর্তমানে এই ম্যাপটি ওপেন সোর্স <strong>OpenStreetMap</strong> ব্যবহার করে তাৎক্ষণিকভাবে কাজ করছে। আপনি যদি সরাসরি অ্যাপ্লিকেশনের ভেতরেই গুগলের অফিশিয়াল প্রিমিয়াম স্যাটেলাইট ম্যাপ ও লাইভ রুট ফাইন্ডার ফিচারটি আনলক করতে চান, তাহলে নিচের ধাপগুলো অনুসরণ করুন:
                </p>
                <ul className="list-decimal list-inside text-xs mt-3.5 space-y-2 text-amber-800/95 ml-1">
                  <li>প্রথমে একটি গুগল ম্যাপস এপিআই কী সংগ্রহ করুন: <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">Google Cloud Console</a></li>
                  <li>আমাদের এই ডেভলপার আই-স্টুডিওর স্ক্রিনের ডানদিকের উপরে থাকা <strong>Settings (⚙️ গিয়ার আইকন)</strong> এ ক্লিক করুন।</li>
                  <li><strong>Secrets</strong> সিলেক্ট করুন এবং Secret Name হিসেবে <code>GOOGLE_MAPS_PLATFORM_KEY</code> লিখে এন্টার চাপুন।</li>
                  <li>Value এর ঘরে আপনার সংগৃহীত এপিআই কী-টি পেস্ট করে এন্টার দিন। কোনো রিলোড ছাড়াই ম্যাপটি গুগল ম্যাপসে রূপান্তরিত হবে!</li>
                </ul>
                <button
                  onClick={() => setShowConfigDetails(false)}
                  className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-lg cursor-pointer transition-all border-none"
                >
                  নির্দেশনা বন্ধ করুন
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel: Filters & Search */}
      <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="স্থাপনার নাম লিখে খুঁজুন..."
            className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Category switcher tabs */}
        <div className="flex flex-wrap gap-1.5 md:col-span-2 justify-start md:justify-end">
          {[
            { id: "all", label: "সব স্থান" },
            { id: "palace", label: "🏛️ জমিদার বাড়ি" },
            { id: "temple", label: "🧱 মন্দির" },
            { id: "water", label: "🛶 দীঘি ও হ্রদ" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                  : "text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left Side: Places List */}
        <div className="lg:col-span-4 border-r border-gray-100 max-h-[550px] overflow-y-auto p-4 space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1">
            মোট {filteredSpots.length} টি ঐতিহাসিক স্থান
          </p>
          {filteredSpots.map((spot) => (
            <div
              key={spot.id}
              onClick={() => setSelectedSpot(spot)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                selectedSpot.id === spot.id
                  ? "bg-emerald-50/50 border-emerald-200 shadow-sm"
                  : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  <img src={spot.imageUrl} alt={spot.banglaName} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">
                      {spot.categoryLabel}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">
                      {spot.era}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm truncate mt-0.5">
                    {spot.banglaName}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500 line-clamp-1 mt-0.5">
                    {spot.banglaDescription}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Map & Route Settings */}
        <div className="lg:col-span-8 flex flex-col justify-between h-[550px] relative">
          
          {/* Map Viewer Panel */}
          <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-50">
            {hasGoogleKey ? (
              // PREMIUM GOOGLE MAP COMPONENT
              <APIProvider apiKey={GOOGLE_MAPS_KEY} version="weekly">
                <Map
                  defaultCenter={{ lat: selectedSpot.lat, lng: selectedSpot.lng }}
                  center={{ lat: selectedSpot.lat, lng: selectedSpot.lng }}
                  defaultZoom={15}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: "100%", height: "100%" }}
                >
                  {spots.map((spot) => (
                    <AdvancedMarker
                      key={spot.id}
                      position={{ lat: spot.lat, lng: spot.lng }}
                      onClick={() => setSelectedSpot(spot)}
                    >
                      <Pin 
                        background={selectedSpot.id === spot.id ? "#10b981" : "#4f46e5"} 
                        glyphColor="#ffffff" 
                      />
                    </AdvancedMarker>
                  ))}
                  
                  {/* Real-time route overlay placeholder within map */}
                  <RouteDisplayWrapper 
                    origin={routeOrigin === "bus_stand" ? { lat: 24.3725, lng: 88.8350 } : userCoords} 
                    destination={{ lat: selectedSpot.lat, lng: selectedSpot.lng }} 
                  />
                </Map>
              </APIProvider>
            ) : (
              // STANDARD LEAFLET MAP AS RESILIENT FALLBACK
              <MapContainer
                center={[selectedSpot.lat, selectedSpot.lng]}
                zoom={16}
                key={`${selectedSpot.id}-${routeOrigin}`}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Put all points */}
                {spots.map((spot) => (
                  <LeafletMarker 
                    key={spot.id} 
                    position={[spot.lat, spot.lng]}
                    eventHandlers={{
                      click: () => setSelectedSpot(spot)
                    }}
                  >
                    <LeafletPopup>
                      <div className="text-center p-1 font-sans">
                        <p className="font-extrabold text-xs text-slate-800 mb-0.5">{spot.banglaName}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">{spot.categoryLabel}</p>
                      </div>
                    </LeafletPopup>
                  </LeafletMarker>
                ))}
                
                {/* If user coords exist, add a marker for them */}
                {routeOrigin === "user_location" && userCoords && (
                  <LeafletMarker position={[userCoords.lat, userCoords.lng]}>
                    <LeafletPopup>
                      <span className="font-bold text-xs text-indigo-600">আপনার বর্তমান অবস্থান</span>
                    </LeafletPopup>
                  </LeafletMarker>
                )}
              </MapContainer>
            )}

            {/* Float Overlay: Navigation Point Selector */}
            <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 max-w-xs space-y-2.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">রুট ও যাতায়াত শুরু</span>
              
              <div className="flex gap-1.5 bg-gray-50 p-1 rounded-xl">
                <button
                  onClick={() => setRouteOrigin("bus_stand")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black border-none cursor-pointer transition-all ${
                    routeOrigin === "bus_stand" 
                      ? "bg-white text-emerald-700 shadow-sm" 
                      : "text-gray-500 bg-transparent hover:text-gray-800"
                  }`}
                >
                  পুঠিয়া বাসস্ট্যান্ড
                </button>
                <button
                  onClick={handleGetLocation}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black border-none cursor-pointer transition-all ${
                    routeOrigin === "user_location" 
                      ? "bg-white text-emerald-700 shadow-sm" 
                      : "text-gray-500 bg-transparent hover:text-gray-800"
                  }`}
                >
                  আমার অবস্থান (GPS)
                </button>
              </div>

              <div className="text-[10px] text-gray-500 leading-tight font-semibold flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                <span>
                  {routeOrigin === "bus_stand" 
                    ? "ঢাকা-রাজশাহী মহাসড়কের পুঠিয়া বাসস্ট্যান্ড থেকে হিসেব করা হবে" 
                    : "আপনার ফোনের রিয়েল-টাইম জিপিএস থেকে হিসাব করা হবে"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Card Info & Navigate Trigger */}
          <div className="bg-white border-t border-gray-100 p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  {selectedSpot.categoryLabel}
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  কালখণ্ড: {selectedSpot.era}
                </span>
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight">
                {selectedSpot.banglaName}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
                {selectedSpot.banglaDescription}
              </p>
            </div>

            {/* Launch navigation in Google Maps App */}
            <a
              href={getDirectionsUrl(selectedSpot)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto shrink-0 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.02] cursor-pointer decoration-none border-none"
            >
              <Navigation size={14} fill="currentColor" />
              গুগল ম্যাপসে লাইভ নেভিগেশন চালু করুন
            </a>
          </div>

        </div>
      </div>

      {/* Emergency safety/travel card footer */}
      <div className="bg-emerald-50/40 p-5 border-t border-gray-100/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-emerald-950 font-bold text-left">
          <Award className="text-emerald-600 shrink-0" size={18} />
          <span>পুঠিয়া উপজেলা প্রশাসনের পরামর্শ: ঐতিহাসিক পুরাকীর্তি ও পবিত্র উপাসনালয়ের পবিত্রতা রক্ষা করুন এবং আবর্জনা যথাস্থানে ফেলুন।</span>
        </div>
      </div>

    </div>
  );
};

// Premium Google Maps Route display subcomponent (only used when hasGoogleKey is true)
function RouteDisplayWrapper({ origin, destination }: {
  origin: { lat: number, lng: number } | null;
  destination: { lat: number, lng: number };
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin) return;
    
    // Clear previous routes
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    routesLib.Route.computeRoutes({
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: 'DRIVING',
      fields: ['path', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach((p: any) => p.setMap(map));
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) map.fitBounds(routes[0].viewport);
      }
    }).catch(err => {
      console.warn("Could not calculate Premium Route overlay. Falling back.", err);
    });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [routesLib, map, origin, destination]);

  return null;
}
