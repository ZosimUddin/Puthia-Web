import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const RAJBARI_PHOTOS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?auto=format&fit=crop&fm=webp&q=75&w=1200",
    caption: "পুঠিয়া রাজবাড়ী সম্মুখ দৃশ্য"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1599661046289-e3188768a417?auto=format&fit=crop&fm=webp&q=75&w=1200",
    caption: "রাজবাড়ীর স্থাপত্য"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&fm=webp&q=75&w=1200",
    caption: "পুঠিয়া মন্দির প্রাঙ্গণ"
  }
];

const PuthiaRajbariSlider: React.FC = () => {
  return (
    <section className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
         <h3 className="text-[22px] font-black text-emerald-950 mb-6">পুঠিয়া রাজবাড়ীর কিছু মুহূর্ত</h3>
         <Swiper
            spaceBetween={16}
            slidesPerView={1.1}
            centeredSlides={true}
            loop={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            modules={[Autoplay, Pagination]}
            className="rounded-[16px] shadow-lg"
         >
            {RAJBARI_PHOTOS.map(photo => (
               <SwiperSlide key={photo.id}>
                  <div className="relative h-[250px] sm:h-[350px] rounded-[16px] overflow-hidden">
                     <img src={photo.image} alt={photo.caption} className="w-full h-full object-cover" />
                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white font-bold text-[14px]">
                        {photo.caption}
                     </div>
                  </div>
               </SwiperSlide>
            ))}
         </Swiper>
      </div>
    </section>
  );
};

export default PuthiaRajbariSlider;
