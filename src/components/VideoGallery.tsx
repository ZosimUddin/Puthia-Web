
import { Play, ChevronRight } from 'lucide-react';

const VIDEOS = [
  { id: 1, title: 'পুঠিয়া রাজবাড়ী ড্রোন ভিউ', thumbnail: 'https://images.unsplash.com/photo-1624458213600-664f699042ba?w=400&h=250&fit=crop&format=webp' },
  { id: 2, title: 'বানেশ্বর আম বাজারের লাইভ', thumbnail: 'https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=400&h=250&fit=crop&format=webp' },
  { id: 3, title: 'পুঠিয়ার ঐতিহ্যবাহী মেলা', thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop&format=webp' },
];

export default function VideoGallery() {
  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 text-sm">ভিডিও গ্যালারি</h3>
        <a href="#" className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
          সব দেখুন <ChevronRight size={12} />
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {VIDEOS.map((video) => (
          <div key={video.id} className="min-w-[200px] relative rounded-2xl overflow-hidden shadow-sm aspect-video">
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                <Play className="text-white fill-white" size={16} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[10px] text-white font-bold truncate">{video.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
