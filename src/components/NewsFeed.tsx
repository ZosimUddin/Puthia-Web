
import { ChevronRight } from 'lucide-react';

const NEWS = [
  {
    id: 1,
    title: 'পুঠিয়া রাজবাড়ী সংস্কার কাজে নতুন গতি',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=400&h=250&fit=crop&format=webp',
    time: '২ ঘণ্টা আগে',
    category: 'উন্নয়ন'
  },
  {
    id: 2,
    title: 'বানেশ্বর হাটে আমের রেকর্ড আমদানি',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop&format=webp',
    time: '৫ ঘণ্টা আগে',
    category: 'কৃষি'
  }
];

export default function NewsFeed() {
  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 text-sm">পুঠিয়ার খবর ও সংবাদ</h3>
        <a href="#" className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
          সব দেখুন <ChevronRight size={12} />
        </a>
      </div>
      <div className="space-y-4">
        {NEWS.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex gap-4 p-2">
            <img src={item.image} alt={item.title} className="w-24 h-20 object-cover rounded-xl" loading="lazy" />
            <div className="flex-1 py-1 pr-2 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                {item.category}
              </span>
              <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">
                {item.title}
              </h4>
              <p className="text-[9px] text-gray-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
