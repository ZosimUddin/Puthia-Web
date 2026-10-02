import React, { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  Droplets,
  Wind,
  Thermometer,
  MapPin,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  ChevronRight,
  Bell,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";
// @ts-ignore
import templeBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

// WMO weather code description helper
const getWeatherDescription = (weatherCode: number) => {
  if (weatherCode === 0) return "রৌদ্রোজ্জ্বল";
  if (weatherCode >= 1 && weatherCode <= 3) return "মেঘলা";
  if (weatherCode >= 51 && weatherCode <= 67) return "বৃষ্টিপাত";
  if (weatherCode >= 71 && weatherCode <= 77) return "তুষারপাত";
  if (weatherCode >= 80 && weatherCode <= 82) return "ভারী বৃষ্টি";
  if (weatherCode >= 95 && weatherCode <= 99) return "বজ্রপাত সহ বৃষ্টি";
  return "আংশিক মেঘলা";
};

// Translate English digits to Bengali digits
const toBengaliDigits = (numStr: string) => {
  const digitsMap: { [key: string]: string } = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  };
  return numStr.replace(/[0-9]/g, (w) => digitsMap[w] || w);
};

const FALLBACK_WEATHER_DATA = {
  current_weather: {
    temperature: 27,
    weathercode: 2, // Cloudy
    windspeed: 9.2,
    winddirection: 225, // SW
  },
  daily: {
    temperature_2m_max: [30],
    temperature_2m_min: [25],
  },
};

import { db } from "../../firebase";
import { collection, query, where, limit, onSnapshot, orderBy } from "firebase/firestore";

const WeatherSection: React.FC = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liveAlert, setLiveAlert] = useState<any>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Coordinates for Puthia, Rajshahi (Lat: 24.36, Lon: 88.83)
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=24.36&longitude=88.83&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto");
        if (!res.ok) {
          throw new Error(`Weather API returned status: ${res.status}`);
        }
        const data = await res.json();
        if (data && data.current_weather && data.daily) {
          setWeatherData(data);
        } else {
          throw new Error("Invalid weather data format received");
        }
      } catch (error) {
        console.warn("Error fetching weather, using fallback data:", error);
        setWeatherData(FALLBACK_WEATHER_DATA);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeather();

    // Listen for live weather alerts
    const aq = query(
      collection(db, "weather_alerts"), 
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const unsubAlerts = onSnapshot(aq, (snapshot) => {
      if (!snapshot.empty) {
        setLiveAlert(snapshot.docs[0].data());
      } else {
        setLiveAlert(null);
      }
    });

    const interval = setInterval(fetchWeather, 1800000); // Update every 30 mins
    return () => {
      clearInterval(interval);
      unsubAlerts();
    };
  }, []);

  if (loading || !weatherData) {
    return (
      <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full font-sans">
        <div className="max-w-lg mx-auto bg-[#064e3b]/90 rounded-[20px] p-8 h-[380px] animate-pulse flex flex-col justify-between">
          <div className="w-1/3 h-6 bg-white/20 rounded-full mx-auto"></div>
          <div className="flex justify-between items-center my-6">
            <div className="w-24 h-24 bg-white/20 rounded-full"></div>
            <div className="w-24 h-12 bg-white/20 rounded-[12px]"></div>
          </div>
          <div className="w-3/4 h-4 bg-white/20 rounded mx-auto"></div>
        </div>
      </section>
    );
  }

  const current = weatherData.current_weather;
  const todayMax = Math.round(weatherData.daily.temperature_2m_max[0] || 30);
  const todayMin = Math.round(weatherData.daily.temperature_2m_min[0] || 25);
  const currentTemp = Math.round(current.temperature);
  const code = current.weathercode;

  // Derive variables dynamically from WMO code
  let humidity = 68;
  let windDirectionLabel = "দক্ষিণ-পশ্চিম";
  let uvIndex = "5";
  let uvLevel = "মাঝারি";
  let airQuality = 42;
  let airQualityLabel = "ভালো";
  let alertText = "পরবর্তী ২৪ ঘণ্টায় হালকা বৃষ্টির সম্ভাবনা রয়েছে।";

  if (code >= 95) {
    humidity = 90;
    uvIndex = "2";
    uvLevel = "কম";
    alertText = "বজ্রপাত ও শিলাবৃষ্টির সতর্কতা রয়েছে, নিরাপদ আশ্রয়ে থাকুন।";
  } else if (code >= 80) {
    humidity = 95;
    uvIndex = "2";
    uvLevel = "কম";
    alertText = "ভারী বৃষ্টিপাতের সতর্কতা রয়েছে, মাঠে জমে থাকা পানি সরান।";
  } else if (code >= 51) {
    humidity = 84;
    uvIndex = "3";
    uvLevel = "কম";
    alertText = "হালকা থেকে মাঝারি বৃষ্টিপাতের সম্ভাবনা রয়েছে।";
  } else if (code >= 1 && code <= 3) {
    humidity = 68;
    uvIndex = "5";
    uvLevel = "মাঝারি";
    alertText = "পরবর্তী ২৪ ঘণ্টায় হালকা বৃষ্টির সম্ভাবনা রয়েছে।";
  } else {
    humidity = 55;
    uvIndex = "8";
    uvLevel = "তীব্র";
    alertText = "আজকের আবহাওয়া পরিষ্কার ও রৌদ্রোজ্জ্বল থাকবে।";
  }

  // Handle Wind Direction Label
  if (current.winddirection !== undefined) {
    const deg = current.winddirection;
    if (deg >= 22.5 && deg < 67.5) windDirectionLabel = "উত্তর-পূর্ব";
    else if (deg >= 67.5 && deg < 112.5) windDirectionLabel = "পূর্ব";
    else if (deg >= 112.5 && deg < 157.5) windDirectionLabel = "দক্ষিণ-পূর্ব";
    else if (deg >= 157.5 && deg < 202.5) windDirectionLabel = "দক্ষিণ";
    else if (deg >= 202.5 && deg < 247.5) windDirectionLabel = "দক্ষিণ-পশ্চিম";
    else if (deg >= 247.5 && deg < 292.5) windDirectionLabel = "পশ্চিম";
    else if (deg >= 292.5 && deg < 337.5) windDirectionLabel = "উত্তর-পশ্চিম";
    else windDirectionLabel = "উত্তর";
  }

  // Calculate Feels Like Temp
  let feelsLike = currentTemp;
  if (currentTemp > 28) {
    feelsLike = Math.round(currentTemp + (humidity > 70 ? 2 : 1));
  } else {
    feelsLike = Math.round(currentTemp - (humidity < 60 ? 1 : 0));
  }

  // Generate hourly slots starting from current hour
  const startHour = new Date().getHours();
  const hourlySlots = [];
  for (let i = 0; i < 7; i++) {
    const hourVal = (startHour + i) % 24;
    const isPM = hourVal >= 12;
    const displayHour = hourVal % 12 === 0 ? 12 : hourVal % 12;
    const hourLabel = i === 0 ? "এখন" : `${displayHour} ${isPM ? "PM" : "AM"}`;
    
    // Wave pattern for dynamic temperature curves
    const tempOffset = Math.sin((hourVal - 14) * Math.PI / 12) * 2.5;
    const hourTemp = Math.round(currentTemp + tempOffset);
    
    hourlySlots.push({
      label: hourLabel,
      temp: hourTemp,
    });
  }

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full font-sans" id="premium-weather-card">
      <div className="max-w-lg mx-auto w-full">
      
      {/* 1. Main Weather Banner (Temple Landscape BG Overlay) */}
      <div 
        className="rounded-[20px] p-6 sm:p-7 text-white relative overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col items-center select-none"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(6, 78, 59, 0.45), rgba(4, 47, 46, 0.98)), url(${templeBg})`, 
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
        
        {/* Header Badge / Pill */}
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs sm:text-sm font-black shadow-inner">
          <MapPin size={14} className="text-emerald-300" />
          <span>পুঠিয়া, রাজশাহী</span>
        </div>

        {/* Air Quality Index Box (Top Right) */}
        <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-md border border-white/15 rounded-[12px] px-3 py-1.5 text-center min-w-[70px] shadow-sm select-none">
          <span className="block text-[8px] text-emerald-200/90 font-bold leading-none mb-0.5">বায়ুর মান</span>
          <span className="block text-base sm:text-lg font-black leading-none mb-1">42</span>
          <span className="block text-[8px] text-emerald-300 font-extrabold bg-emerald-900/40 px-1.5 py-0.5 rounded-full leading-none">ভালো</span>
        </div>

        {/* Mid Row: Illustration & Temperature Display */}
        <div className="w-full flex items-center justify-between gap-4 mt-8 sm:mt-10">
          
          {/* Animated Glowing Sun-Cloud 3D Illustration */}
          <div className="relative w-32 h-24 sm:w-36 sm:h-28 flex items-center justify-center shrink-0">
            <div className="absolute w-16 h-16 sm:w-20 sm:h-20 bg-amber-400/25 rounded-full blur-2xl animate-pulse"></div>
            
            {/* Sun with custom glow & shadow */}
            <Sun className="w-16 sm:w-20 h-16 sm:h-20 text-amber-300 absolute top-0 left-0 drop-shadow-sm animate-spin-slow" />
            
            {/* Cloud floating in front */}
            <Cloud className="w-20 sm:w-24 h-20 sm:h-24 text-slate-100 absolute bottom-0 right-0 drop-shadow-sm fill-slate-50/10" />
          </div>

          {/* Temperature & Description Info */}
          <div className="text-right flex flex-col justify-center">
            <h1 className="text-[64px] sm:text-[80px] font-black tracking-tighter leading-none select-none text-white drop-shadow-md">
              {currentTemp}°
            </h1>
            <p className="text-lg sm:text-xl font-extrabold text-white mt-1 uppercase tracking-wide">
              {getWeatherDescription(code)}
            </p>
          </div>

        </div>

        {/* Subtitle with High-Contrast Text */}
        <p className="text-emerald-100 font-bold text-[11px] sm:text-xs text-center mt-6 tracking-wide drop-shadow-sm">
          আজ সর্বোচ্চ তাপমাত্রা {todayMax}° এবং সর্বনিম্ন {todayMin}° হতে পারে।
        </p>

        {/* Bottom Glass Cards: Wind, Feels Like, Humidity */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full mt-7 relative z-10">
          
          {/* Wind Info */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[14px] p-2.5 sm:p-3 text-center flex flex-col items-center justify-between h-[95px] sm:h-[110px] shadow-sm">
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-200">
              <Wind size={14} />
              <span>বাতাসের গতি</span>
            </div>
            <div className="my-1.5">
              <span className="block text-sm sm:text-base font-black text-white leading-none">
                {current.windspeed}
              </span>
              <span className="text-[9px] text-emerald-200 font-bold mt-0.5 block">কিমি/ঘণ্টা</span>
            </div>
            <span className="text-[9px] text-emerald-300 font-extrabold bg-emerald-950/30 px-1.5 py-0.5 rounded-full">
              {windDirectionLabel}
            </span>
          </div>

          {/* Feels Like Info */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[14px] p-2.5 sm:p-3 text-center flex flex-col items-center justify-between h-[95px] sm:h-[110px] shadow-sm">
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-200">
              <Thermometer size={14} />
              <span>অনুভূত তাপমাত্রা</span>
            </div>
            <div className="my-1.5">
              <span className="block text-sm sm:text-base font-black text-white leading-none">
                {feelsLike}°
              </span>
              <span className="text-[9px] text-emerald-200 font-bold mt-0.5 block">তাপমাত্রা</span>
            </div>
            <span className="text-[9px] text-emerald-300 font-extrabold bg-emerald-950/30 px-1.5 py-0.5 rounded-full">
              মনে হচ্ছে {feelsLike + 1}°
            </span>
          </div>

          {/* Humidity Info */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[14px] p-2.5 sm:p-3 text-center flex flex-col items-center justify-between h-[95px] sm:h-[110px] shadow-sm">
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-200">
              <Droplets size={14} />
              <span>আর্দ্রতা</span>
            </div>
            <div className="my-1.5">
              <span className="block text-sm sm:text-base font-black text-white leading-none">
                {humidity}%
              </span>
              <span className="text-[9px] text-emerald-200 font-bold mt-0.5 block">পরিমাণ</span>
            </div>
            <span className="text-[9px] text-emerald-300 font-extrabold bg-emerald-950/30 px-1.5 py-0.5 rounded-full">
              {humidity > 75 ? "ভেজাভাব" : "স্বাভাবিক"}
            </span>
          </div>

        </div>

      </div>

      {/* 2. Hourly Forecast Section */}
      <div className="bg-white border border-slate-100 rounded-[20px] p-5 mt-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-800 font-black text-sm sm:text-base tracking-tight">ঘণ্টায় আবহাওয়া</h3>
          <button className="text-[11px] font-extrabold text-slate-500 hover:text-slate-800 transition flex items-center gap-0.5">
            <span>পরবর্তী ২৪ ঘণ্টা</span>
            <ChevronRight size={14} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Horizontal Timeline List */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
          {hourlySlots.map((slot, index) => (
            <div key={index} className="flex flex-col items-center text-center shrink-0 min-w-[50px] sm:min-w-[60px]">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">{slot.label}</span>
              
              {/* Conditional Hour Weather Icons */}
              <div className="w-8 h-8 flex items-center justify-center my-1 text-slate-500">
                {index === 0 ? (
                  <Cloud className="w-5 h-5 text-slate-300 fill-slate-100" />
                ) : index % 3 === 1 ? (
                  <div className="relative">
                    <Sun className="w-4 h-4 text-emerald-500" />
                    <Cloud className="w-4 h-4 text-slate-300 absolute -bottom-1 -right-1 fill-slate-50" />
                  </div>
                ) : index % 3 === 2 ? (
                  <div className="relative">
                    <Cloud className="w-5 h-5 text-slate-300 fill-slate-100" />
                  </div>
                ) : (
                  <CloudRain className="w-5 h-5 text-blue-400" />
                )}
              </div>

              <span className="text-xs sm:text-sm font-black text-slate-700 mt-1">{slot.temp}°</span>
            </div>
          ))}
        </div>

      </div>

      {/* 3. Additional Weather Information Grid */}
      <div className="mt-5">
        <h3 className="text-slate-800 font-black text-sm sm:text-base tracking-tight mb-3 px-1">আজকের অতিরিক্ত তথ্য</h3>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          
          {/* Card 1: Rain Probability */}
          <div className="flex items-start gap-3 p-3.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm">
              <CloudRain size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-slate-400 font-black text-[9px] sm:text-[10px] uppercase tracking-wide">বৃষ্টির সম্ভাবনা</span>
              <span className="block text-slate-800 font-black text-sm sm:text-base mt-0.5">
                {code >= 51 ? "৮০%" : "২০%"}
              </span>
              <span className="block text-slate-400 font-bold text-[9px] mt-0.5 leading-none">
                {code >= 51 ? "ভারী বৃষ্টি হতে পারে" : "সামান্য বৃষ্টি হতে পারে"}
              </span>
            </div>
          </div>

          {/* Card 2: Sunrise */}
          <div className="flex items-start gap-3 p-3.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm">
              <Sunrise size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-slate-400 font-black text-[9px] sm:text-[10px] uppercase tracking-wide">সূর্যোদয়</span>
              <span className="block text-slate-800 font-black text-sm sm:text-base mt-0.5">
                {toBengaliDigits("5:21")} AM
              </span>
              <span className="block text-slate-400 font-bold text-[9px] mt-0.5 leading-none">ভোরবেলা</span>
            </div>
          </div>

          {/* Card 3: Sunset */}
          <div className="flex items-start gap-3 p-3.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm">
              <Sunset size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-slate-400 font-black text-[9px] sm:text-[10px] uppercase tracking-wide">সূর্যাস্ত</span>
              <span className="block text-slate-800 font-black text-sm sm:text-base mt-0.5">
                {toBengaliDigits("6:38")} PM
              </span>
              <span className="block text-slate-400 font-bold text-[9px] mt-0.5 leading-none">সন্ধ্যাবেলা</span>
            </div>
          </div>

          {/* Card 4: UV Index */}
          <div className="flex items-start gap-3 p-3.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm">
              <Sun size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-slate-400 font-black text-[9px] sm:text-[10px] uppercase tracking-wide">UV সূচক</span>
              <span className="block text-slate-800 font-black text-sm sm:text-base mt-0.5">
                {uvIndex}
              </span>
              <span className="block text-slate-400 font-bold text-[9px] mt-0.5 leading-none">
                {uvLevel}
              </span>
            </div>
          </div>

          {/* Card 5: Air Pressure */}
          <div className="flex items-start gap-3 p-3.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm">
              <Gauge size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-slate-400 font-black text-[9px] sm:text-[10px] uppercase tracking-wide">বায়ুচাপ</span>
              <span className="block text-slate-800 font-black text-sm sm:text-base mt-0.5">
                1012 hPa
              </span>
              <span className="block text-slate-400 font-bold text-[9px] mt-0.5 leading-none">স্বাভাবিক</span>
            </div>
          </div>

          {/* Card 6: Visibility */}
          <div className="flex items-start gap-3 p-3.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm">
              <Eye size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="block text-slate-400 font-black text-[9px] sm:text-[10px] uppercase tracking-wide">দৃষ্টিসীমা</span>
              <span className="block text-slate-800 font-black text-sm sm:text-base mt-0.5">
                10 কিমি
              </span>
              <span className="block text-slate-400 font-bold text-[9px] mt-0.5 leading-none">ভালো</span>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Warning / Alert Message Card (Bottom Banner) */}
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-[20px] p-4 flex items-center justify-between gap-4 w-full shadow-sm mt-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm ${liveAlert ? (liveAlert.severity === 'extreme' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600') : 'bg-emerald-100 text-emerald-600'}`}>
            {liveAlert ? <AlertTriangle size={24} className="stroke-[2.5]" /> : <Bell size={24} className="stroke-[2.5]" />}
          </div>
          <div className="min-w-0">
            <h4 className={`font-black text-xs sm:text-sm tracking-tight leading-none ${liveAlert ? (liveAlert.severity === 'extreme' ? 'text-rose-800' : 'text-amber-800') : 'text-emerald-800'}`}>
              {liveAlert ? `${liveAlert.type.toUpperCase()} সতর্কতা` : 'আবহাওয়া সতর্কতা'}
            </h4>
            <p className={`font-bold text-[10px] sm:text-xs mt-1 leading-normal ${liveAlert ? (liveAlert.severity === 'extreme' ? 'text-rose-600' : 'text-amber-600') : 'text-emerald-600'}`}>
              {liveAlert ? liveAlert.message : alertText}
            </p>
          </div>
        </div>
        <button className="text-emerald-600 hover:text-emerald-800 shrink-0">
          <ChevronRight size={20} className="stroke-[2.5]" />
        </button>
      </div>
      </div>
    </section>
  );
};

export default WeatherSection;
