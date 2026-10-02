import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const SLIDES = [
  {
    id: 1,
    title: 'সবুজ পুঠিয়া',
    subtitle: 'স্মার্ট পুঠিয়া',
    description: 'ডিজিটাল পুঠিয়া, উন্নত ভবিষ্যৎ',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop&format=webp',
    titleColor: 'text-[#00FF66]',
    subtitleColor: 'text-[#FF3333]',
    buttonText: 'বিস্তারিত দেখুন'
  },
  {
    id: 2,
    title: 'ঐতিহাসিক পুঠিয়া',
    subtitle: 'রাজবাড়ী ও মন্দির',
    description: 'জানুন পুঠিয়ার গৌরবময় ইতিহাস',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1000&auto=format&fit=crop&format=webp',
    titleColor: 'text-emerald-500',
    subtitleColor: 'text-white',
    buttonText: 'ইতিহাস দেখুন'
  }
];

export default function BannerSlider() {
  return (
    <div className="px-4 relative group">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: '.custom-pagination',
          bulletClass: 'swiper-pagination-bullet !bg-white !opacity-60 !w-4 !h-1.5 !rounded-full !transition-all !duration-300',
          bulletActiveClass: '!bg-[#00CC44] !opacity-100 !w-6'
        }}
        navigation={{
          nextEl: '.custom-next',
          prevEl: '.custom-prev',
        }}
        className="rounded-2xl overflow-hidden shadow-lg h-[210px]"
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div 
              className="relative w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent p-6 flex flex-col justify-center">
                <h2 className="text-2xl font-black leading-tight tracking-tight">
                  <span className={slide.titleColor}>{slide.title}</span> <br />
                  <span className={slide.subtitleColor}>{slide.subtitle}</span>
                </h2>
                <p className="text-xs text-gray-200 mt-2 font-medium">{slide.description}</p>
                <div className="mt-5">
                  <button className="bg-[#004D20] text-white text-[11px] px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-green-800 transition-all font-bold shadow-md active:scale-95">
                    {slide.buttonText} <ArrowRight size={12} className="opacity-80" />
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Navigation Buttons */}
        <button className="custom-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-white transition-colors active:scale-90">
          <ChevronLeft size={16} />
        </button>
        <button className="custom-next absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-white transition-colors active:scale-90">
          <ChevronRight size={16} />
        </button>

        {/* Pagination Dots */}
        <div className="custom-pagination absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 justify-center pointer-events-none"></div>
      </Swiper>
    </div>
  );
}
