import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { CloudSun, Wind, Droplets, ChevronRight, RefreshCw, Thermometer } from "lucide-react";

const toBengaliDigits = (numStr: string) => {
  const digitsMap: { [key: string]: string } = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  };
  return numStr.replace(/[0-9]/g, (w) => digitsMap[w] || w);
};

const getWeatherDesc = (code: number) => {
  if (code === 0) return "রৌদ্রোজ্জ্বল";
  if (code >= 1 && code <= 3) return "আংশিক মেঘলা";
  if (code >= 51 && code <= 67) return "হালকা বৃষ্টি";
  if (code >= 80 && code <= 82) return "ভারী বৃষ্টি";
  if (code >= 95) return "বজ্রবৃষ্টি";
  return "স্বাভাবিক আবহাওয়া";
};

export const PuthiaSingleLineWeatherBar: React.FC = () => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState({
    temp: "২৮",
    condition: "আংশিক মেঘলা",
    humidity: "৬৮%",
    wind: "১০ কিমি/ঘণ্টা",
    code: 2,
    loading: false
  });

  const fetchPuthiaWeather = async () => {
    try {
      setWeather(prev => ({ ...prev, loading: true }));
      // Puthia coordinates: lat 24.3683, lon 88.8358
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=24.3683&longitude=88.8358&current_weather=true&hourly=relativehumidity_2m");
      if (res.ok) {
        const data = await res.json();
        const current = data.current_weather;
        const humidity = data.hourly?.relativehumidity_2m?.[0] || 68;
        
        setWeather({
          temp: toBengaliDigits(Math.round(current.temperature).toString()),
          condition: getWeatherDesc(current.weathercode),
          humidity: toBengaliDigits(humidity.toString()) + "%",
          wind: toBengaliDigits(Math.round(current.windspeed).toString()) + " কিমি/ঘণ্টা",
          code: current.weathercode,
          loading: false
        });
      } else {
        setWeather(prev => ({ ...prev, loading: false }));
      }
    } catch (e) {
      setWeather(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchPuthiaWeather();
    const timer = setInterval(fetchPuthiaWeather, 1800000); // 30 mins
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-3">
      <div 
        onClick={() => navigate("/weather")}
        className="bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-emerald-500/10 hover:from-sky-500/15 hover:to-emerald-500/15 border border-sky-200/80 rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-2 overflow-x-auto no-scrollbar"
      >
        {/* Left: Weather Icon & Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-2xs">
            <CloudSun size={18} className="stroke-[2.2] md:w-6 md:h-6" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm md:text-lg font-black text-slate-900 whitespace-nowrap">
              🌤️ আবহাওয়া (পুঠিয়া)
            </span>
            <span className="text-xs md:text-sm font-black text-sky-700 bg-sky-100 px-2 py-0.5 md:py-1 rounded-full border border-sky-200 shrink-0">
              {weather.temp}°সে
            </span>
          </div>
        </div>

        {/* Center: Condition & Metrics (Single line) */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-xs md:text-sm font-bold text-slate-600 shrink-0">
          <span className="text-slate-800 font-extrabold hidden min-[420px]:inline md:text-base">
            • {weather.condition}
          </span>
          
          <div className="hidden sm:flex items-center gap-1 text-slate-500">
            <Droplets size={13} className="text-sky-500 stroke-[2.5] md:w-4 md:h-4" />
            <span>আর্দ্রতা: {weather.humidity}</span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-500">
            <Wind size={13} className="text-teal-500 stroke-[2.5] md:w-4 md:h-4" />
            <span>বাতাস: {weather.wind}</span>
          </div>
        </div>

        {/* Right: Refresh & Action */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fetchPuthiaWeather();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            title="আবহাওয়ার আপডেট রিফ্রেশ করুন"
          >
            <RefreshCw size={13} className={`stroke-[2.5] ${weather.loading ? "animate-spin text-sky-600" : ""}`} />
          </button>
          
          <span className="text-[11px] sm:text-xs font-extrabold text-sky-700 flex items-center gap-0.5 hover:underline">
            <span>বিস্তারিত</span>
            <ChevronRight size={13} className="stroke-[2.5]" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default PuthiaSingleLineWeatherBar;
