import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, Phone, MapPin, Navigation, Clock, Download, CheckCircle } from 'lucide-react';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface TransportMapProps {
  onGoBack: () => void;
}

const stands = [
  {
    id: 1,
    name: "পুঠিয়া বাসস্ট্যান্ড সিএনজি ইস্টার",
    location: "ঢাকা-রাজশাহী মহাসড়ক সংলগ্ন",
    phone: "01700000001",
    category: "cng_auto",
    categoryLabel: "সিএনজি / অটো",
    position: [24.3820, 88.8410] as [number, number]
  },
  {
    id: 2,
    name: "বানেশ্বর মোড় অটোরিকশা স্ট্যান্ড",
    location: "বানেশ্বর ট্রাফিক মোড়",
    phone: "01700000002",
    category: "cng_auto",
    categoryLabel: "সিএনজি / অটো",
    position: [24.3630, 88.7840] as [number, number]
  },
  {
    id: 3,
    name: "শিবপুর বাজার ইজিবাইক স্ট্যান্ড",
    location: "শিবপুর বাজার কেন্দ্র",
    phone: "01700000003",
    category: "van_easy",
    categoryLabel: "ভ্যান / ইজি",
    position: [24.3850, 88.8550] as [number, number]
  },
  {
    id: 4,
    name: "পুঠিয়া রাজবাড়ী ভ্যান স্ট্যান্ড",
    location: "রাজবাড়ী গেট সংলগ্ন",
    phone: "01700000004",
    category: "van_easy",
    categoryLabel: "ভ্যান / ইজি",
    position: [24.3750, 88.8350] as [number, number]
  }
];

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Estimate travel time (assuming average speed of 20 km/h for local transport)
function estimateTravelTime(distanceKm: number): number {
  const speedKmh = 20; 
  return Math.round((distanceKm / speedKmh) * 60); // Time in minutes
}

// Component to recenter map when user location is found
function LocationMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { animate: true });
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} icon={userIcon}>
      <Popup>আপনার বর্তমান অবস্থান</Popup>
    </Marker>
  );
}

export function TransportMap({ onGoBack }: TransportMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Offline Map States
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    const offlineStatus = localStorage.getItem('puthia_transport_map_offline');
    if (offlineStatus === 'true') {
      setIsOfflineReady(true);
    }
  }, []);

  const handleDownloadMap = () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsDownloading(false);
          setIsOfflineReady(true);
          localStorage.setItem('puthia_transport_map_offline', 'true');
          // Cache stands data for offline use
          localStorage.setItem('puthia_transport_stands', JSON.stringify(stands));
          
          // In a real PWA, we would use the Cache API to cache the Leaflet tile images here:
          // e.g. caches.open('map-tiles').then(cache => cache.addAll([...tileUrls]))
        }, 500);
      }
      setDownloadProgress(progress);
    }, 300);
  };

  const requestLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("আপনার ব্রাউজার লোকেশন সাপোর্ট করে না");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
      },
      (error) => {
        setLocationError("লোকেশন পাওয়া যায়নি। দয়া করে লোকেশন পারমিশন দিন।");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6 h-[100dvh] flex flex-col bg-gray-50">
      <div 
        className="p-6 text-white shrink-0 shadow-sm rounded-b-3xl relative z-10 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #064e3b, #022c22)' }}
      >
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onGoBack} 
              className="border-none p-2 rounded-full text-white cursor-pointer hover:bg-white/20 transition-colors flex items-center justify-center"
              style={{ background: 'rgba(255, 255, 255, 0.15)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="m-0 text-xl font-extrabold tracking-wide">স্ট্যান্ড লোকেশন ম্যাপ</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={isOfflineReady ? undefined : handleDownloadMap}
              disabled={isDownloading || isOfflineReady}
              className={`border-none p-2 rounded-full text-white cursor-pointer transition-colors flex items-center justify-center relative ${isOfflineReady ? 'bg-blue-500' : isDownloading ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-500'}`}
              title={isOfflineReady ? "অফলাইনে এভেইলেবল" : "অফলাইন ম্যাপ ডাউনলোড করুন"}
            >
              {isDownloading ? (
                <span className="text-[10px] font-bold px-1">{downloadProgress}%</span>
              ) : isOfflineReady ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
            <button 
              onClick={requestLocation}
              disabled={isLocating}
              className={`border-none p-2 rounded-full text-white cursor-pointer transition-colors flex items-center justify-center ${isLocating ? 'bg-emerald-700 opacity-50' : 'bg-emerald-600 hover:bg-emerald-500'}`}
              title="আমার লোকেশন দেখুন"
            >
              <Navigation className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
        <p className="m-0 text-xs opacity-90 pl-11 relative z-10">
          {locationError ? <span className="text-red-300">{locationError}</span> : 'নিকটবর্তী ভ্যান ও অটোরিকশা স্ট্যান্ডের অবস্থান'}
        </p>
        
        {/* Downloading Progress Bar */}
        {isDownloading && (
          <div className="absolute bottom-0 left-0 h-1 bg-blue-400" style={{ width: `${downloadProgress}%`, transition: 'width 0.3s ease' }}></div>
        )}
      </div>

      <div className="flex-1 w-full relative z-0 flex flex-col">
        {/* Category Filter */}
        <div className="bg-white px-4 py-3 shadow-sm z-10 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${activeCategory === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            সব স্ট্যান্ড
          </button>
          <button
            onClick={() => setActiveCategory('cng_auto')}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${activeCategory === 'cng_auto' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            সিএনজি ও অটো
          </button>
          <button
            onClick={() => setActiveCategory('van_easy')}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${activeCategory === 'van_easy' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            ভ্যান ও ইজিবাইক
          </button>
        </div>

        <div className="flex-1 w-full relative">
          <MapContainer 
            center={[24.3750, 88.8100]} 
            zoom={13} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <LocationMarker position={userLocation} />
            
            {stands.filter(s => activeCategory === 'all' || s.category === activeCategory).map(stand => (
            <Marker key={stand.id} position={stand.position}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-gray-800 text-[14px] mb-1">{stand.name}</h3>
                  <div className="flex items-center text-gray-500 text-[11px] mb-3">
                    <MapPin className="w-3 h-3 mr-1" />
                    {stand.location}
                  </div>
                  <a 
                    href={`tel:${stand.phone}`}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors w-full no-underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    কল করুন
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
          </MapContainer>
        </div>
      </div>

      <div className="shrink-0 px-4 space-y-3 pb-4">
        {stands.filter(s => activeCategory === 'all' || s.category === activeCategory).map((stand) => {
          let distanceStr = "";
          let timeStr = "";
          
          if (userLocation) {
            const dist = calculateDistance(userLocation[0], userLocation[1], stand.position[0], stand.position[1]);
            const time = estimateTravelTime(dist);
            distanceStr = `${dist.toFixed(1)} কিমি`;
            timeStr = `${time} মি.`;
          }

          return (
            <div key={stand.id} className="bg-white rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-start gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-gray-800 text-[13px] font-bold">{stand.name}</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">{stand.categoryLabel}</span>
                  </div>
                  <p className="text-gray-500 text-[11px] mt-0.5 mb-1.5">{stand.location}</p>
                  
                  {userLocation && (
                    <div className="flex items-center gap-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md inline-flex">
                      <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {distanceStr}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeStr}</span>
                    </div>
                  )}
                </div>
              </div>
              <a 
                href={`tel:${stand.phone}`}
                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-colors z-10 relative"
                title="কল করুন"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
