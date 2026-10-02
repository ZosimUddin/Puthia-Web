import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, CloudRain, Sun, Cloud, CloudLightning, Wind, Droplets, 
  Sunrise, Sunset, AlertTriangle, Calendar, Info, ShieldAlert, Heart, 
  Share2, Compass, Eye, Gauge, Map, Bell, Navigation, Activity, CheckCircle, Moon, CloudSun
} from 'lucide-react';

interface WeatherLocation {
  name: string;
  lat: number;
  lon: number;
}

const PUTHIA_LOCATIONS: WeatherLocation[] = [
  { name: "পুঠিয়া সদর", lat: 24.3725, lon: 88.8356 },
  { name: "বানেশ্বর", lat: 24.3912, lon: 88.7915 },
  { name: "জিউপাড়া", lat: 24.4167, lon: 88.8833 },
  { name: "ভালুকগাছী", lat: 24.3411, lon: 88.8512 },
  { name: "শিলমাড়িয়া", lat: 24.4322, lon: 88.9142 },
];

export const WeatherUpdateInfo = ({ onGoBack }: { onGoBack: () => void }) => {
  const [selectedLoc, setSelectedLoc] = useState<WeatherLocation>(PUTHIA_LOCATIONS[0]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'forecast' | 'alert' | 'agri' | 'aqi' | 'map'>('today');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifEnabled, setNotifEnabled] = useState<boolean>(false);
  const [mapLayer, setMapLayer] = useState<'rain' | 'radar' | 'clouds'>('radar');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load Favorites and Notification state from localStorage
  useEffect(() => {
    const savedFavs = localStorage.getItem('puthia_weather_favs');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
    const savedNotif = localStorage.getItem('puthia_weather_notif');
    if (savedNotif) {
      setNotifEnabled(JSON.parse(savedNotif));
    }
  }, []);

  // Fetch Weather Data based on coordinates
  const fetchWeather = async (loc: WeatherLocation) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}`);
      if (!response.ok) {
        throw new Error("আবহাওয়ার লাইভ তথ্য পেতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
      const data = await response.json();
      setWeather(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "লাইভ আবহাওয়া সংযোগ ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedLoc);
  }, [selectedLoc]);

  // Request GPS Location
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("দুঃখিত, আপনার ব্রাউজারে জিপিএস লোকেশন সাপোর্ট করে না।");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gpsLoc: WeatherLocation = {
          name: "📍 আমার অবস্থান (GPS)",
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setSelectedLoc(gpsLoc);
      },
      (err) => {
        console.error(err);
        alert("জিপিএস তথ্য পাওয়া যায়নি। অনুগ্রহ করে ম্যানুয়ালি স্থান সিলেক্ট করুন।");
        setLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // Toggle Favorite
  const toggleFavorite = (name: string) => {
    let updated;
    if (favorites.includes(name)) {
      updated = favorites.filter(f => f !== name);
    } else {
      updated = [...favorites, name];
    }
    setFavorites(updated);
    localStorage.setItem('puthia_weather_favs', JSON.stringify(updated));
  };

  // Toggle Notifications
  const toggleNotifications = () => {
    const nextVal = !notifEnabled;
    setNotifEnabled(nextVal);
    localStorage.setItem('puthia_weather_notif', JSON.stringify(nextVal));
  };

  // Handle Share weather report
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `পুঠিয়া আবহাওয়া - ${selectedLoc.name}`,
        text: `পুঠিয়ার ${selectedLoc.name} এলাকার লাইভ তাপমাত্রা ${weather?.current?.temp || '--'}°C এবং পূর্বাভাস। বিস্তারিত জানুন Historic Puthia অ্যাপে!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert(`লিঙ্ক কপি করা হয়েছে! পুঠিয়া আবহাওয়া: ${selectedLoc.name} - তাপমাত্রা ${weather?.current?.temp || '--'}°C`);
    }
  };

  // Live map simulator canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !weather) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angle = 0;
    
    // Simulate coordinates or clouds
    interface Particle {
      x: number;
      y: number;
      speed: number;
      size: number;
      opacity: number;
    }
    const particles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 1.5 + Math.random() * 3,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Puthia base region contour
      ctx.strokeStyle = "rgba(13, 148, 136, 0.25)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 50);
      ctx.quadraticCurveTo(150, 40, 220, 80);
      ctx.quadraticCurveTo(280, 150, 240, 220);
      ctx.quadraticCurveTo(160, 280, 100, 240);
      ctx.quadraticCurveTo(40, 180, 80, 50);
      ctx.closePath();
      ctx.stroke();

      // Draw location dots inside the map
      PUTHIA_LOCATIONS.forEach((loc, idx) => {
        const x = 100 + (idx * 30) % 120;
        const y = 80 + (idx * 40) % 130;
        ctx.fillStyle = "rgba(13, 148, 136, 0.6)";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "9px sans-serif";
        ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
        ctx.fillText(loc.name, x + 6, y + 3);
      });

      if (mapLayer === 'rain') {
        // Draw heavy blue background
        ctx.fillStyle = "rgba(14, 116, 144, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw animated rain
        ctx.strokeStyle = "rgba(14, 165, 233, 0.7)";
        ctx.lineWidth = 1.5;
        particles.forEach(p => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 3, p.y + 15);
          ctx.stroke();

          p.y += p.speed;
          p.x -= 0.5; // slight wind

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
        });

        // Add layer legend
        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#0369a1";
        ctx.fillText("🌧️ লাইভ বৃষ্টিপাত ওভারলে (সক্রিয়)", 15, 25);

      } else if (mapLayer === 'radar') {
        // Glowing Radar Sweep
        angle += 0.015;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(cx, cy) - 20;

        // Concentric radar circles
        ctx.strokeStyle = "rgba(13, 148, 136, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();

        // Crosshairs
        ctx.beginPath(); ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius); ctx.stroke();

        // Weather front echoes (simulating clouds on radar)
        const gradient = ctx.createRadialGradient(180, 120, 10, 180, 120, 50);
        gradient.addColorStop(0, "rgba(220, 38, 38, 0.4)"); // heavy storm core
        gradient.addColorStop(0.5, "rgba(249, 115, 22, 0.25)");
        gradient.addColorStop(1, "rgba(250, 204, 21, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(180, 120, 50, 0, Math.PI * 2);
        ctx.fill();

        // Sweep Line
        const sx = cx + Math.cos(angle) * radius;
        const sy = cy + Math.sin(angle) * radius;
        ctx.strokeStyle = "rgba(13, 148, 136, 0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        // Sweep blur gradient
        ctx.fillStyle = "rgba(13, 148, 136, 0.03)";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle - 0.4, angle);
        ctx.closePath();
        ctx.fill();

        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#0f766e";
        ctx.fillText("📡 পুঠিয়া কালবৈশাখী ও বজ্রঝড় রাডার", 15, 25);

      } else if (mapLayer === 'clouds') {
        // Draw fluffy soft cloud positions
        ctx.fillStyle = "rgba(100, 116, 139, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 10, 0, Math.PI * 2);
          ctx.arc(p.x + p.size * 5, p.y - p.size * 3, p.size * 8, 0, Math.PI * 2);
          ctx.arc(p.x - p.size * 5, p.y - p.size * 2, p.size * 8, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.speed * 0.3; // slower drift

          if (p.x > canvas.width + 30) {
            p.x = -30;
            p.y = Math.random() * canvas.height;
          }
        });

        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("☁️ মেঘের অবস্থান ও গতিপথ সিমুলেটর", 15, 25);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [mapLayer, weather]);

  // Fallback icon generator for weather conditions
  const getWeatherIcon = (iconText: string) => {
    switch (iconText) {
      case '☀️': return <Sun className="w-12 h-12 text-amber-500 animate-spin-slow" />;
      case '🌤️': return <CloudSun className="w-12 h-12 text-emerald-500" />;
      case '⛅': return <CloudSun className="w-12 h-12 text-slate-400" />;
      case '☁️': return <Cloud className="w-12 h-12 text-slate-500" />;
      case '🌧️': return <CloudRain className="w-12 h-12 text-sky-500 animate-bounce" />;
      case '⛈️': return <CloudRain className="w-12 h-12 text-teal-600" />;
      case '🌩️': return <CloudLightning className="w-12 h-12 text-amber-600" />;
      default: return <Sun className="w-12 h-12 text-amber-500" />;
    }
  };

  return (
    <div className="font-sans space-y-6 pb-12 text-left animate-fade-in" id="weather-update-view">
      
      {/* 1. Hero Section */}
      <div 
        className="p-6 md:p-8 text-white rounded-3xl shadow-xl relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 border border-teal-950" 
      >
        <button 
          onClick={onGoBack} 
          id="weather-back-btn"
          className="bg-white/10 hover:bg-white/25 text-white rounded-2xl px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/15 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <span className="bg-teal-500/25 text-teal-300 border border-teal-500/35 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" /> পুঠিয়ার সর্বশেষ আবহাওয়ার তথ্য
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              🌤️ আজকের আবহাওয়া
            </h1>
            <p className="text-teal-100 text-xs md:text-sm max-w-xl leading-relaxed">
              রাজশাহীর পুঠিয়া উপজেলা সদর, বানেশ্বর বাজার, ভালুকগাছী ও শিলমাড়িয়াসহ সমগ্র এলাকার লাইভ আবহাওয়ার বুলেটিন ও কৃষকদের জন্য বিশেষ পরামর্শ।
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-300 font-bold bg-black/20 px-3 py-1.5 rounded-xl border border-teal-800/50 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              অবস্থান: <span className="text-white font-extrabold">{selectedLoc.name}</span> 
              <span className="text-slate-400 font-normal">({selectedLoc.lat.toFixed(4)}°, {selectedLoc.lon.toFixed(4)}°)</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button 
              onClick={handleGPSLocation}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm border border-teal-500 cursor-pointer w-full md:w-auto justify-center"
            >
              <Navigation className="w-3.5 h-3.5" /> আমার জিপিএস (GPS)
            </button>
            <button 
              onClick={handleShare}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold px-3 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-slate-700 cursor-pointer justify-center"
              title="শেয়ার করুন"
            >
              <Share2 className="w-4 h-4" /> শেয়ার
            </button>
          </div>
        </div>

        {/* Decorative ambient blobs */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500 opacity-15 rounded-full -mr-12 -mt-12 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-600 opacity-15 rounded-full -ml-16 -mb-16 blur-2xl"></div>
      </div>

      {/* Location Selector Bar */}
      <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {PUTHIA_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => setSelectedLoc(loc)}
              className={`px-3 py-2 text-xs font-black rounded-xl transition flex items-center gap-1 cursor-pointer ${
                selectedLoc.name === loc.name 
                  ? 'bg-teal-700 text-white shadow-xs' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {loc.name}
              {favorites.includes(loc.name) && <Heart className="w-3 h-3 fill-rose-500 text-rose-500 inline" />}
            </button>
          ))}
        </div>

        <button 
          onClick={() => toggleFavorite(selectedLoc.name)}
          className={`text-xs font-bold px-3 py-2 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
            favorites.includes(selectedLoc.name)
              ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${favorites.includes(selectedLoc.name) ? 'fill-rose-500 text-rose-500' : ''}`} />
          {favorites.includes(selectedLoc.name) ? 'প্রিয় তালিকা থেকে সরান' : 'প্রিয় তালিকায় রাখুন'}
        </button>
      </div>

      {/* Weather Tabs navigation */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { id: 'today', label: 'আজকের আবহাওয়া', icon: '🌤️' },
          { id: 'forecast', label: '৭ দিনের পূর্বাভাস', icon: '📅' },
          { id: 'alert', label: 'দুর্যোগ সতর্কতা', icon: '🚨' },
          { id: 'agri', label: 'কৃষি আবহাওয়া', icon: '🌾' },
          { id: 'aqi', label: 'বায়ুর মান (AQI)', icon: '🍃' },
          { id: 'map', label: 'রাডার ও ম্যাপ', icon: '🗺️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 px-2 rounded-2xl text-center border font-black text-xs transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-teal-700 text-white border-teal-700 shadow-md transform scale-102'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="leading-tight">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-500">পুঠিয়ার লাইভ আবহাওয়া তথ্য লোড করা হচ্ছে...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-center space-y-3">
          <span className="text-4xl block">⚠️</span>
          <h4 className="text-base font-black text-red-800">সংযোগ ব্যাহত হয়েছে</h4>
          <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
          <button 
            onClick={() => fetchWeather(selectedLoc)}
            className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition cursor-pointer"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}

      {/* Main Panel Content */}
      {weather && !loading && !error && (
        <div className="space-y-6">

          {/* TAB 1: TODAY'S CURRENT WEATHER */}
          {activeTab === 'today' && (
            <div className="space-y-6">
              
              {/* 2. Current Weather Card */}
              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-teal-500">
                
                <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400 opacity-20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  {/* Current Temp & State */}
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-white/10 rounded-3xl border border-white/15 shadow-sm">
                      {getWeatherIcon(weather.current.icon)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-teal-200">বর্তমান আবহাওয়া</p>
                      <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                        {weather.current.temp}<span className="text-2xl md:text-3xl font-bold align-super">°C</span>
                      </h2>
                      <p className="text-base font-black text-amber-200 flex items-center gap-1.5 mt-1">
                        {weather.current.condition}
                      </p>
                    </div>
                  </div>

                  {/* Secondary current metrics */}
                  <div className="grid grid-cols-2 gap-4 w-full md:w-auto bg-black/15 p-4 rounded-2xl border border-white/10">
                    <div>
                      <span className="text-[10px] text-teal-200 block font-bold uppercase tracking-wider">অনুভূত তাপমাত্রা</span>
                      <span className="text-base font-extrabold text-white">{weather.current.feelsLike}°C</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-200 block font-bold uppercase tracking-wider">বায়ুচাপ (Pressure)</span>
                      <span className="text-base font-extrabold text-white">{weather.current.pressure} hPa</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-200 block font-bold uppercase tracking-wider">দৃশ্যমানতা (Visibility)</span>
                      <span className="text-base font-extrabold text-white">{weather.current.visibility} কি.মি.</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-200 block font-bold uppercase tracking-wider">আবহাওয়া এপিআই</span>
                      <span className="text-xs bg-teal-500/30 text-teal-200 font-extrabold px-1.5 py-0.5 rounded border border-teal-400/20 block w-fit mt-0.5">
                        🌍 লাইভ সংযুক্ত
                      </span>
                    </div>
                  </div>

                </div>

                {/* Sub-metrics grid for weather card details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl text-teal-100">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-200 block font-bold">আর্দ্রতা</span>
                      <span className="text-sm font-black text-white">{weather.current.humidity}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl text-teal-100">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-200 block font-bold">বাতাসের গতি</span>
                      <span className="text-sm font-black text-white">{weather.current.windSpeed} কিমি/ঘণ্টা</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl text-teal-100">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-200 block font-bold">বাতাসের দিক</span>
                      <span className="text-sm font-black text-white">{weather.current.windDir} দিক</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl text-teal-100">
                      <Sunrise className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-200 block font-bold">সূর্যোদয় ও সূর্যাস্ত</span>
                      <span className="text-xs font-black text-white">{weather.current.sunrise} / {weather.current.sunset}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. ঘণ্টাভিত্তিক পূর্বাভাস (Hourly Forecast next 24 hours) */}
              <div className="bg-white border border-slate-100 p-5 rounded-3xl space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-700" /> আগামী ২৪ ঘণ্টার ঘণ্টাভিত্তিক পূর্বাভাস
                  </h3>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">প্রতি ঘণ্টার আপডেট</span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-teal-100 scrollbar-track-transparent">
                  {weather.forecastHourly.map((hour: any, idx: number) => (
                    <div 
                      key={idx}
                      className="bg-slate-50 border border-slate-100 min-w-[100px] p-3 rounded-2xl flex flex-col items-center text-center space-y-2 hover:border-teal-300 hover:bg-white transition-all duration-300"
                    >
                      <span className="text-[11px] font-black text-slate-500">{hour.time}</span>
                      <span className="text-2xl">{hour.icon}</span>
                      <span className="text-sm font-black text-slate-800">{hour.temp}°C</span>
                      <div className="space-y-0.5 w-full text-[9px] font-bold text-slate-400">
                        <p className="text-blue-500">🌧️ {hour.rainProb}%</p>
                        <p>🌬️ {hour.windSpeed} কিমি</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Moon Phase Indicator */}
              <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="space-y-1.5 z-10 text-left">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block">
                    🌙 প্রিমিয়াম চন্দ্র দশা (Moon Phase)
                  </span>
                  <h4 className="text-lg font-black text-amber-200 flex items-center gap-1.5">
                    চাঁদের দশা: {weather.moonPhase.name} {weather.moonPhase.icon}
                  </h4>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    {weather.moonPhase.desc} হিন্দু পঞ্জিকা ও ঐতিহ্যবাহী কৃষি ক্যালেন্ডার অনুসারে চাঁদের আলো মাটির আর্দ্রতা এবং ফসল রোপণের সময়কাল নির্ধারণে সহায়তা করে।
                  </p>
                </div>
                <div className="text-6xl select-none z-10 animate-pulse bg-white/5 p-4 rounded-full border border-white/5 shrink-0">
                  {weather.moonPhase.icon}
                </div>
                {/* Stars decor */}
                <div className="absolute top-2 left-1/3 text-white/10 text-xs">★</div>
                <div className="absolute bottom-6 left-1/4 text-white/5 text-sm">★</div>
                <div className="absolute top-6 right-1/4 text-white/10 text-xs">★</div>
              </div>

            </div>
          )}

          {/* TAB 2: 7-DAY FORECAST */}
          {activeTab === 'forecast' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-700" /> আগামী ৭ দিনের আবহাওয়ার পূর্বাভাস
                </h3>
                <span className="text-xs text-slate-400 font-bold">পুঠিয়া জোন</span>
              </div>

              {/* 4. ৭ দিনের পূর্বাভাস গ্রিড */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weather.forecast7Days.map((day: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-teal-200 hover:shadow-xs transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-slate-50 rounded-xl">{day.icon}</span>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm">{day.day}</h4>
                        <p className="text-xs text-slate-400 font-semibold">{day.condition}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">তাপমাত্রা</p>
                        <p className="text-xs font-black text-slate-700">
                          <span className="text-slate-800 font-black">{day.tempMax}°C</span> / <span className="text-slate-500">{day.tempMin}°C</span>
                        </p>
                      </div>

                      <div className="text-right bg-blue-50/50 px-2.5 py-1.5 rounded-xl border border-blue-100">
                        <p className="text-[9px] text-blue-500 font-bold block leading-none">বৃষ্টির শঙ্কা</p>
                        <p className="text-xs font-black text-blue-700 mt-1">{day.rainProb}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic 7-day Temperature Area Graph using premium SVG craftsmanship */}
              <div className="bg-white border border-slate-100 p-5 rounded-3xl space-y-4 shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-100 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    📊 গত ৭ দিনের তাপমাত্রার গ্রাফ
                  </span>
                  <h4 className="font-black text-slate-800 text-base">তাপমাত্রার ওঠানামা বিশ্লেষণ</h4>
                  <p className="text-xs text-slate-400">পুঠিয়ার বিগত ৭ দিনের তাপমাত্রার ট্রেন্ড ও তুলনামূলক তাপপ্রবাহ রেখাচিত্র।</p>
                </div>

                {/* SVG Graph Container */}
                <div className="w-full pt-4">
                  <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 160">
                    <defs>
                      <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(249, 115, 22, 0.3)" />
                        <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
                      </linearGradient>
                      <linearGradient id="minGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(14, 165, 233, 0.2)" />
                        <stop offset="100%" stopColor="rgba(14, 165, 233, 0)" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal gridlines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                    <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                    <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                    <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

                    {/* Generate SVG coordinates dynamically based on temperatureHistory data */}
                    {(() => {
                      const pointsMax: {x: number, y: number, temp: number}[] = [];
                      const pointsMin: {x: number, y: number, temp: number}[] = [];
                      const count = weather.temperatureHistory.length;
                      
                      weather.temperatureHistory.forEach((item: any, idx: number) => {
                        const x = 40 + (idx * (440 / (count - 1)));
                        // map 20C-40C to 140px-20px range
                        const maxTemp = item["সর্বোচ্চ"];
                        const minTemp = item["সর্বনিম্ন"];
                        const yMax = 140 - ((maxTemp - 15) * (120 / 25)); // scale 15C-40C
                        const yMin = 140 - ((minTemp - 15) * (120 / 25));
                        pointsMax.push({ x, y: yMax, temp: maxTemp });
                        pointsMin.push({ x, y: yMin, temp: minTemp });
                      });

                      const maxPathD = pointsMax.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      const minPathD = pointsMin.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      
                      const maxAreaD = `${maxPathD} L ${pointsMax[count-1].x} 140 L ${pointsMax[0].x} 140 Z`;
                      const minAreaD = `${minPathD} L ${pointsMin[count-1].x} 140 L ${pointsMin[0].x} 140 Z`;

                      return (
                        <>
                          {/* Areas */}
                          <path d={maxAreaD} fill="url(#maxGradient)" />
                          <path d={minAreaD} fill="url(#minGradient)" />

                          {/* Lines */}
                          <path d={maxPathD} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d={minPathD} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />

                          {/* Interactive vertical hover helper lines */}
                          {hoveredPoint !== null && (
                            <line 
                              x1={pointsMax[hoveredPoint].x} 
                              y1="20" 
                              x2={pointsMax[hoveredPoint].x} 
                              y2="140" 
                              stroke="#0f766e" 
                              strokeWidth="1.5" 
                              strokeDasharray="2 2" 
                            />
                          )}

                          {/* Points & Labels */}
                          {pointsMax.map((p, i) => (
                            <g key={`max-p-${i}`} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                              <circle cx={p.x} cy={p.y} r={hoveredPoint === i ? 6 : 4} fill="#ea580c" stroke="#ffffff" strokeWidth="1.5" className="cursor-pointer transition-all" />
                              <text x={p.x} y={p.y - 8} fontSize="9" fontWeight="black" fill="#ea580c" textAnchor="middle">{p.temp}°</text>
                            </g>
                          ))}

                          {pointsMin.map((p, i) => (
                            <g key={`min-p-${i}`} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                              <circle cx={p.x} cy={p.y} r={hoveredPoint === i ? 6 : 4} fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" className="cursor-pointer transition-all" />
                              <text x={p.x} y={p.y + 11} fontSize="9" fontWeight="black" fill="#0284c7" textAnchor="middle">{p.temp}°</text>
                            </g>
                          ))}

                          {/* Bottom XAxis labels */}
                          {weather.temperatureHistory.map((item: any, idx: number) => {
                            const x = 40 + (idx * (440 / (count - 1)));
                            return (
                              <text key={`lbl-${idx}`} x={x} y="155" fontSize="9" fontWeight="bold" fill="#64748b" textAnchor="middle">
                                {item.day}
                              </text>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Graph Legend */}
                <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500"></span> সর্বোচ্চ তাপমাত্রা (°C)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-500"></span> সর্বনিম্ন তাপমাত্রা (°C)</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: STORM/RAIN WEATHER ALERT CENTRE */}
          {activeTab === 'alert' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2 text-red-600">
                  <ShieldAlert className="w-5 h-5" /> আবহাওয়া সতর্কতা ও দুর্যোগ সাড়া কেন্দ্র
                </h3>
                <span className="text-xs bg-red-100 text-red-700 font-black px-2.5 py-1 rounded-lg animate-pulse border border-red-200">জরুরি বুলেটিন</span>
              </div>

              {/* 6. আবহাওয়া সতর্কতা ক্যাটাগরি কার্ড */}
              <div className="space-y-4">
                {weather.alerts.map((al: any, idx: number) => (
                  <div 
                    key={idx}
                    className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                      al.severity === 'danger' || al.severity === 'high'
                        ? 'bg-red-50 border-red-200 text-red-950 shadow-xs'
                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    }`}
                  >
                    <span className="text-4xl p-2 bg-white/70 rounded-2xl shadow-xs shrink-0 select-none">{al.icon}</span>
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm md:text-base leading-tight">
                          {al.title}
                        </h4>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase border ${
                          al.severity === 'danger' 
                            ? 'bg-red-600 text-white border-red-700' 
                            : al.severity === 'high' 
                            ? 'bg-red-100 text-red-700 border-red-200' 
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {al.severity === 'danger' ? 'উচ্চ ঝুঁকি (Danger)' : al.severity === 'high' ? 'সতর্কতা (Warning)' : 'সাধারণ'}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed font-medium">
                        {al.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 5 specific requested categories with interactive advice */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-xs">
                <h4 className="font-black text-slate-800 text-base">🚨 জরুরি প্রাক-দুর্যোগ নির্দেশিকা</h4>
                <p className="text-xs text-slate-400">দুর্যোগের সময় কিভাবে আপনার ফসল ও পরিবার সুরক্ষিত রাখবেন:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
                    <span className="text-2xl">🌧️</span>
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-xs">ভারী বৃষ্টি (Heavy Rain)</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">মাঠে জল নিষ্কাশনের ব্যবস্থা রাখুন। বীজতলা ও আদা, হলুদ পচনশীল ফসলের ক্ষেতে নালা সচল রাখুন।</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
                    <span className="text-2xl">🌩️</span>
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-xs">বজ্রপাত (Lightning)</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">ঘন ঘন মেঘ ডাকলে খোলা মাঠ থেকে সরে গিয়ে পাকা আশ্রয়স্থলে যান। পাম্পের মেইন তার খুলে রাখুন।</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
                    <span className="text-2xl">🌪️</span>
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-xs">কালবৈশাখী ঝড় (Storm)</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">আম বাগান বা কলার জমিতে বাঁশের খুঁটি দিন। ঝড়ের পূর্বাভাস থাকলে গবাদি পশু নিরাপদ গোয়ালে রাখুন।</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
                    <span className="text-2xl">🌊</span>
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-xs">বন্যা সতর্কতা (Flood Warning)</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">পুকুরের পাড় জাল দিয়ে উঁচু করুন যাতে বন্যায় মাছ ভেসে না যায়। পশুখাদ্য শুকনো উঁচু মাচায় রাখুন।</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3 md:col-span-2">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-xs">তীব্র তাপপ্রবাহ (Heatwave)</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">আমের গুটি ঝরে পড়া ঠেকাতে ভোরে প্রচুর পানি স্প্রে করুন। গবাদি পশুকে গ্লুকোজ জল ও ঠান্ডা বায়ু চলাচলপূর্ণ স্থানে রাখুন।</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: AGRICULTURE WEATHER ADVISORIES */}
          {activeTab === 'agri' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-emerald-600" /> কৃষকদের জন্য লাইভ আবহাওয়া পরামর্শ
                </h3>
                {weather.hasAiAdvisory && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-lg">
                    ✨ Gemini AI চালিত পরামর্শ
                  </span>
                )}
              </div>

              {/* Gemini AI Powered Advisories */}
              <div className="bg-emerald-50/50 border border-emerald-100/70 rounded-3xl p-6 space-y-4">
                <div className="flex gap-3 items-center">
                  <span className="text-3xl">🌾</span>
                  <div>
                    <h4 className="font-black text-emerald-950 text-base">কৃষি আবহাওয়া বিশেষজ্ঞের লাইভ পরামর্শ</h4>
                    <p className="text-xs text-emerald-700">পুঠিয়ার প্রধান শস্যগুলোর জন্য তাৎক্ষণিক করণীয়:</p>
                  </div>
                </div>

                <div className="text-sm text-slate-700 leading-relaxed text-justify whitespace-pre-line bg-white/80 p-4 rounded-2xl border border-emerald-100">
                  {weather.advisory}
                </div>
              </div>

              {/* Specified Agriculture Risks Warnings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🌧️</span>
                    <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">বৃষ্টিপাত ঝুঁকি</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs">বৃষ্টির সতর্কতা ও স্প্রে</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                     বজ্রবৃষ্টি বা ঝড়ের সময় আম বাগানে কীটনাশক ও ধানের জমিতে সার স্প্রে করা সম্পূর্ণ বন্ধ রাখুন। স্প্রে করলে বৃষ্টির জলে তা ধুয়ে নষ্ট হয়ে যায়।
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">☀️</span>
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">তাপমাত্রা ঝুঁকি</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs">তাপপ্রবাহ ও মাটির আর্দ্রতা</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    তাপমাত্রা ৩৩ ডিগ্রি অতিক্রম করলে আম এবং অন্যান্য ফলদ গাছের গোড়ায় পর্যাপ্ত মালচিং বা পাতা দিয়ে ঢেকে নিয়মিত সেচ দিন যাতে আর্দ্রতা বজায় থাকে।
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🌬️</span>
                    <span className="text-[9px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-bold">ঝড়-বাতাস ঝুঁকি</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs">ঝড়ের সতর্কতা ও ঠেস দেওয়া</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    বাতাসের বেগ ১৫ কিমি/ঘণ্টা ছাড়িয়ে গেলে শসা, লাউ ও ঝিঙের মাচা শক্ত করে বাঁধুন এবং কলার ছড়ি পড়া গাছে ডবল বাঁশ দিয়ে ঠেস দিন।
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: AIR QUALITY INDEX (AQI) */}
          {activeTab === 'aqi' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" /> বায়ুর মান সূচক (AQI) ও স্বাস্থ্য গাইড
                </h3>
                <span className="text-xs text-slate-400 font-bold">আজকের পরিমাপ</span>
              </div>

              {/* 7. Air Quality Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* AQI Score circular card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center space-y-4 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">রিয়েল-টাইম AQI</p>
                  
                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    {/* Circle Background */}
                    <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="54" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                      <circle cx="64" cy="64" r="54" fill="transparent" stroke="#0d9488" strokeWidth="8" strokeDasharray="339" strokeDashoffset={339 - (339 * Math.min(weather.aqi.value, 300)) / 300} />
                    </svg>
                    <div className="text-center">
                      <span className="text-4xl font-black text-slate-800">{weather.aqi.value}</span>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">ইউএস সূচক</p>
                    </div>
                  </div>

                  <span className={`px-4 py-1.5 rounded-full text-xs font-black border block w-fit mx-auto ${weather.aqi.colorClass}`}>
                    বায়ুর মান: {weather.aqi.status}
                  </span>
                </div>

                {/* PM Concentrations */}
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-4 text-left">
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">🌾 সূক্ষ্ম ধূলিকণা ঘনত্ব</h4>
                    <p className="text-xs text-slate-400 mt-1">পুঠিয়া জিউপাড়া সংলগ্ন কৃষি এলাকার ধূলিকণার মাত্রা।</p>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/50 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-extrabold text-slate-700 block">PM 2.5 (অতি সূক্ষ্ম কণা)</span>
                        <span className="text-[9px] text-slate-400 font-semibold">ক্ষতিকর ক্ষুদ্র ধূলিকণা</span>
                      </div>
                      <span className="text-base font-black text-slate-800">{weather.aqi.pm25} µg/m³</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/50 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-extrabold text-slate-700 block">PM 10 (মোট ধূলিকণা)</span>
                        <span className="text-[9px] text-slate-400 font-semibold">বাতাসে ভাসমান ধূলিকণা</span>
                      </div>
                      <span className="text-base font-black text-slate-800">{weather.aqi.pm10} µg/m³</span>
                    </div>
                  </div>
                </div>

                {/* Health Advisory */}
                <div className="bg-teal-50 border border-teal-100 rounded-3xl p-6 flex flex-col justify-between gap-4 text-left">
                  <div>
                    <h4 className="font-black text-teal-950 text-sm flex items-center gap-1.5">
                      😷 স্বাস্থ্য পরামর্শ ও গাইডলাইন
                    </h4>
                    <p className="text-xs text-teal-700 mt-1">আজকের বায়ুমণ্ডলের প্রেক্ষিতে পরামর্শ:</p>
                  </div>

                  <p className="text-xs text-teal-900 leading-relaxed bg-white/60 p-4 rounded-xl border border-teal-100 font-medium">
                    {weather.aqi.advice}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: RAIN / CLOUDS WEATHER MAP OVERLAYS */}
          {activeTab === 'map' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <Map className="w-5 h-5 text-teal-700" /> পুঠিয়া বৃষ্টিপাত রাডার ও মেঘের মানচিত্র
                </h3>
                <span className="text-xs text-slate-400 font-bold">লাইভ সিমুলেটর</span>
              </div>

              {/* Selector for canvas map layers */}
              <div className="flex gap-2">
                {[
                  { id: 'radar', label: 'বজ্রঝড় রাডার', icon: '📡' },
                  { id: 'rain', label: 'বৃষ্টিপাতের মানচিত্র', icon: '🗺️' },
                  { id: 'clouds', label: 'মেঘের অবস্থান', icon: '☁️' }
                ].map(layer => (
                  <button
                    key={layer.id}
                    onClick={() => setMapLayer(layer.id as any)}
                    className={`px-4 py-2.5 text-xs font-black rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                      mapLayer === layer.id
                        ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{layer.icon}</span>
                    <span>{layer.label}</span>
                  </button>
                ))}
              </div>

              {/* 8. Interactive HTML5 Canvas Map overlays */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 shadow-inner flex flex-col items-center">
                <div className="relative bg-teal-50/10 rounded-2xl overflow-hidden border border-slate-200/50 w-full max-w-[400px]">
                  <canvas 
                    ref={canvasRef} 
                    width={320} 
                    height={280} 
                    className="mx-auto block bg-white"
                  />
                  <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 shadow-xs">
                    রাজশাহী জোন
                  </div>
                </div>
                
                <p className="text-[11px] text-slate-400 mt-3 text-center">
                  * এটি পুঠিয়ার রিয়েল-টাইম রাডার এবং বায়ুমণ্ডলীয় গতিপথের একটি ইন্টারেক্টিভ সিমুলেটর মানচিত্র।
                </p>
              </div>
            </div>
          )}

          {/* 9. Bottom CTA Section */}
          <div className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-6 md:p-8 rounded-3xl text-center space-y-4 relative overflow-hidden border border-teal-950 shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 opacity-10 rounded-full blur-2xl"></div>
            
            <div className="max-w-xl mx-auto space-y-2 relative z-10">
              <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-1">
                🌤️ সর্বদা আবহাওয়ার আপডেট জানুন
              </span>
              <h3 className="font-black text-lg md:text-xl text-white">জরুরি আবহাওয়া ও বন্যা সতর্কতা সেবা</h3>
              <p className="text-teal-100 text-xs md:text-sm leading-relaxed">
                পুঠিয়ার বর্তমান আবহাওয়া, ৭ দিনের পূর্বাভাস এবং জরুরি দুর্যোগের লাইভ নোটিফিকেশন সরাসরি আপনার ডিভাইসে পেতে সতর্কতা সার্ভিস চালু করুন।
              </p>
            </div>

            <button 
              onClick={toggleNotifications}
              id="weather-alert-toggle-btn"
              className={`px-6 py-3 rounded-2xl text-xs font-black transition-all duration-300 transform hover:scale-103 shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer relative z-10 ${
                notifEnabled 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500' 
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
              }`}
            >
              <Bell className={`w-4 h-4 ${notifEnabled ? 'animate-bounce text-white' : 'text-slate-950 animate-pulse'}`} />
              {notifEnabled ? '🔔 আবহাওয়া সতর্কতা চালু আছে (ক্লিক করে বন্ধ করুন)' : '🔔 আবহাওয়া সতর্কতা চালু করুন'}
            </button>
            
            {notifEnabled && (
              <p className="text-[10px] text-emerald-300 font-extrabold flex items-center justify-center gap-1 leading-none">
                <CheckCircle className="w-3.5 h-3.5" /> পুঠিয়া উপজেলা কৃষি আবহাওয়া বুলেটিন নোটিফিকেশন সচল রয়েছে।
              </p>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
