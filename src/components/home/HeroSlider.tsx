import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { ArrowRight, Megaphone, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useSiteSettings } from "../../context/SiteSettingsContext";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

export interface StoryCardItem {
  id: number;
  emoji: string;
  category: string;
  badgeColor: string;
  gradient: string;
  accentColor: string;
  buttonBg: string;
  image: string;
  title: string;
  subtitle: string;
  tag: string;
  cta: string;
  link: string;
  stats: string;
}

const STORY_CARDS: StoryCardItem[] = [
  {
    id: 1,
    emoji: "🏛️",
    category: "পুঠিয়া নিউজ ও আপডেট",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
    accentColor: "text-emerald-300",
    buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
    image: "https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?auto=format&fit=crop&fm=webp&q=75&w=1200",
    title: "পুঠিয়ার সব খবর, সেবা ও আপডেট এক জায়গায়",
    subtitle: "সহজে জানুন, দ্রুত সেবা নিন",
    tag: "স্মার্ট ডিজিটাল হাব",
    cta: "বিস্তারিত দেখুন",
    link: "/news",
    stats: "সর্বশেষ সেবা"
  },
  {
    id: 2,
    emoji: "🤝",
    category: "তথ্য সহযোগী",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
    accentColor: "text-emerald-300",
    buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&fm=webp&q=75&w=1200",
    title: "নিয়মিত পুঠিয়ার সকল তথ্য এড করে আমাদেরকে সহযোগিতা করুন",
    subtitle: "আপনার এলাকার সকল গুরুত্বপূর্ণ সেবা ও ব্যবসা প্রতিষ্ঠানের তথ্য যুক্ত করুন",
    tag: "নাগরিক অংশীদারিত্ব",
    cta: "তথ্য যুক্ত করুন",
    link: "/dashboard",
    stats: "ডিজিটাল পুঠিয়া"
  },
  {
    id: 3,
    emoji: "📱",
    category: "অফিশিয়াল মোবাইল অ্যাপ",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
    accentColor: "text-emerald-300",
    buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&fm=webp&q=75&w=1200",
    title: "পুঠিয়া উপজেলার সকল তথ্য সেবা পেতে আমাদের পুঠিয়া অ্যাপ ব্যবহার করুন",
    subtitle: "সহজে নাগরিক সেবা পেতে পুঠিয়া অ্যাপটি ফোনে সংগৃহীত রাখুন",
    tag: "মোবাইল সুবিধা",
    cta: "অ্যাপ ইনস্টল করুন",
    link: "/app",
    stats: "স্মার্ট অ্যাক্সেস"
  },
  {
    id: 4,
    emoji: "❤️",
    category: "জরুরি সেবা ও ব্লাড ব্যাংক",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
    accentColor: "text-emerald-300",
    buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&fm=webp&q=75&w=1200",
    title: "জরুরী রক্তদাতা, ডাক্তার ডিরেক্টরি ও নাগরিক সেবা পেতে আমাদের সাথে থাকুন",
    subtitle: "২৪ ঘন্টা বিনামূল্যে রক্তদাতা ও অ্যাম্বুলেন্স সেবা হটলাইন",
    tag: "২৪/৭ জরুরি সহায়তা",
    cta: "জরুরি সেবা",
    link: "/blood-donor",
    stats: "লাইভ নেটওয়ার্ক"
  },
  {
    id: 5,
    emoji: "🏰",
    category: "ঐতিহ্য ও পর্যটন",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
    accentColor: "text-emerald-300",
    buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&fm=webp&q=75&w=1200",
    title: "প্রাচীন পুঠিয়া রাজবাড়ী ও ঐতিহাসিক শিব মন্দির কমপ্লেক্স",
    subtitle: "১৬শ শতাব্দীর রাজপ্রাসাদ ও মনোরম শিব দিঘীর প্রাকৃতিক শোভা",
    tag: "ঐতিহাসিক সম্পদ",
    cta: "রাজবাড়ী দেখুন",
    link: "/history",
    stats: "দর্শনীয় স্থান"
  }
];

const DEFAULT_NOTICES = [
  "৫ বছর বয়স পর্যন্ত শিশুদের পোলিও টিকাদান ক্যাম্পেইন চলছে। নিকটস্থ কেন্দ্রে টিকা দিন।",
  "পুঠিয়া উপজেলায় ২ নং ওয়ার্ড সংস্কার কাজের জন্য আগামীকাল সকাল ৯টা থেকে বিদ্যুৎ বন্ধ থাকবে।",
  "জরুরি অ্যাম্বুলেন্স, ফায়ার সার্ভিস ও পুলিশ সেবার অফিশিয়াল হটলাইন নম্বর অ্যাপে যুক্ত।"
];

const HeroSlider: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    import("../../api").then(api => {
      unsubscribe = api.onHeroSlidesSnapshot((data) => {
        // Only set the actual data from DB (if admin deletes down to 2, it stays 2)
        if (Array.isArray(data)) {
          setSlides(data);
        }
        setLoading(false);
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // If Super Admin turned off Hero Slider completely
  if (settings?.showHeroSlider === false) {
    return null;
  }

  // Active slides (filtered by isActive !== false)
  // If loading and no data yet, use STORY_CARDS temporarily, but once loaded use exact DB slides (or empty if none)
  const activeDbSlides = slides.filter(s => s.isActive !== false);
  const displaySlides = loading && slides.length === 0 ? STORY_CARDS : activeDbSlides;

  if (!loading && displaySlides.length === 0) {
    return null;
  }

  const autoplayDelay = (settings?.heroSliderAutoplayDelay && settings.heroSliderAutoplayDelay > 0)
    ? settings.heroSliderAutoplayDelay * 1000 
    : 4000;

  const handleSlideChange = (s: any) => {
    const newIdx = s.realIndex ?? s.activeIndex ?? 0;
    if (newIdx !== activeIndexRef.current) {
      activeIndexRef.current = newIdx;
      setActiveIndex(newIdx);
    }
  };

  const handleSelectStory = (index: number) => {
    if (swiperRef.current && swiperRef.current.swiper) {
      if (typeof swiperRef.current.swiper.slideToLoop === 'function') {
        swiperRef.current.swiper.slideToLoop(index);
      } else {
        swiperRef.current.swiper.slideTo(index);
      }
    }
  };

  return (
    <div className="relative w-full mb-4 sm:mb-6">
      {/* Main Hero Slider Card */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-slate-100 border border-slate-200">
          <Swiper
            ref={swiperRef}
            spaceBetween={0}
            speed={500}
            loop={displaySlides.length > 1}
            grabCursor={true}
            onRealIndexChange={handleSlideChange}
            autoplay={{
              delay: autoplayDelay,
              disableOnInteraction: false,
            }}
            modules={[Autoplay, Pagination, Navigation]}
            className="h-[175px] sm:h-[250px] md:h-[300px] relative z-10 rounded-2xl sm:rounded-3xl"
          >
            {displaySlides.map((card, idx) => (
              <SwiperSlide key={card.id || idx}>
                <div 
                  className="relative w-full h-full group cursor-pointer overflow-hidden"
                  onClick={() => navigate(card.link || "/news")}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105"
                  />

                  {/* Overlay Gradient for high legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center p-3.5 sm:p-7 lg:p-10 z-10">
                    <div className="max-w-md sm:max-w-xl space-y-1 sm:space-y-2 relative z-20">
                      <h2 className="text-sm sm:text-2xl md:text-5xl font-black text-white leading-tight drop-shadow-md whitespace-pre-line tracking-tight line-clamp-2 sm:line-clamp-none">
                        {card.title}
                      </h2>
                      {card.subtitle && (
                        <p className="text-[11px] md:text-xl text-slate-200 font-medium drop-shadow-sm opacity-95 line-clamp-1 sm:line-clamp-none">
                          {card.subtitle}
                        </p>
                      )}
                      <div className="pt-1 sm:pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(card.link || "/news");
                          }}
                          className="px-3 py-1 sm:px-5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-[11px] sm:text-sm rounded-full inline-flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all duration-200 ease-out cursor-pointer active:scale-95 group/btn"
                        >
                          <span>{card.cta || "বিস্তারিত দেখুন"}</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Dots Indicator */}
          {displaySlides.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-lg">
              {displaySlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectStory(i)}
                  className={`dot-indicator min-w-0 min-h-0 transition-all duration-300 cursor-pointer p-0 border-0 ${
                    activeIndex === i
                      ? "w-6 h-2 bg-emerald-400 rounded-full shadow-xs"
                      : "w-2 h-2 bg-white/70 hover:bg-white rounded-full"
                  }`}
                  style={{
                    minWidth: activeIndex === i ? '24px' : '8px',
                    minHeight: '8px',
                    maxWidth: activeIndex === i ? '24px' : '8px',
                    maxHeight: '8px',
                    width: activeIndex === i ? '24px' : '8px',
                    height: '8px'
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
