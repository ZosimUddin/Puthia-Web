import { Hotel } from "../types";

export const SAMPLE_HOTELS: Hotel[] = [
  {
    id: "h1",
    name: "পুঠিয়া রাজ গেস্ট হাউস",
    description: "পুঠিয়া রাজবাড়ির একদম পাশেই অবস্থিত একটি আধুনিক গেস্ট হাউস। পর্যটকদের জন্য সকল প্রকার সুযোগ-সুবিধা নিশ্চিত করা হয়েছে। এখানে আমাদের অতিথিরা রাজবাড়ির মনোরম পরিবেশ খুব কাছে থেকে উপভোগ করতে পারেন। আমাদের প্রতিটি রুম অত্যন্ত পরিষ্কার এবং আধুনিক আসবাবপত্র দ্বারা সজ্জিত।",
    category: "guest_house",
    address: "রাজবাড়ি গেট, পুঠিয়া, রাজশাহী",
    phone: "01712345678",
    email: "raj.gh@example.com",
    location: {
      lat: 24.3683,
      lng: 88.8475
    },
    startingPrice: 1200,
    rating: 4.8,
    ratingCount: 156,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80"
    ],
    facilities: ["wifi", "parking", "ac", "restaurant", "hot_water", "family_room", "security"],
    rooms: [
      {
        id: "r1",
        name: "Deluxe AC Double",
        price: 2500,
        capacity: 2,
        features: ["AC", "Double Bed", "TV", "Hot Water"]
      },
      {
        id: "r2",
        name: "Standard Non-AC Double",
        price: 1200,
        capacity: 2,
        features: ["Fan", "Double Bed", "Attached Bath"]
      }
    ],
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    isFeatured: true,
    isVerified: true,
    status: "active",
    createdAt: new Date().toISOString()
  },
  {
    id: "h2",
    name: "হোটেল গ্রিন ভিউ",
    description: "প্রাকৃতিক মনোরম পরিবেশে অবস্থিত একটি চমৎকার আবাসন। নিরিবিলি পরিবেশে সময় কাটাতে চাইলে এটি হতে পারে আপনার সেরা পছন্দ। আমরা আমাদের অতিথিদের জন্য ঘরোয়া পরিবেশের নিশ্চয়তা প্রদান করি। পুঠিয়া বাসস্ট্যান্ড থেকে মাত্র ৫ মিনিটের দূরত্বে এর অবস্থান।",
    category: "hotel",
    address: "বাসস্ট্যান্ড রোড, পুঠিয়া",
    phone: "01812345679",
    location: {
      lat: 24.3650,
      lng: 88.8420
    },
    startingPrice: 800,
    rating: 4.2,
    ratingCount: 89,
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"
    ],
    facilities: ["parking", "ac", "restaurant", "family_room", "security"],
    rooms: [
      {
        id: "r3",
        name: "Double AC Room",
        price: 1800,
        capacity: 2,
        features: ["AC", "Double Bed", "TV"]
      },
      {
        id: "r4",
        name: "Non-AC Twin",
        price: 800,
        capacity: 2,
        features: ["Fan", "Twin Bed"]
      }
    ],
    checkIn: "10:00 AM",
    checkOut: "09:00 AM",
    status: "active",
    createdAt: new Date().toISOString()
  }
];

export const HOTEL_FAQS = [
  {
    q: "কিভাবে রুম বুকিং করব?",
    a: "আপনি হোটেলের ফোন নম্বরে সরাসরি কল করে অথবা হোটেলের রিসেপশনে গিয়ে রুম বুক করতে পারেন।"
  },
  {
    q: "পরিবার নিয়ে থাকা যাবে কি?",
    a: "হ্যাঁ, অধিকাংশ হোটেল এবং গেস্ট হাউসে পরিবারের জন্য বিশেষ ফ্যামিলি রুমের ব্যবস্থা আছে।"
  },
  {
    q: "হোটেলগুলোতে কি পার্কিং সুবিধা আছে?",
    a: "পুঠিয়ার প্রধান হোটেল এবং গেস্ট হাউসগুলোতে পর্যটকদের যানবাহনের জন্য পর্যাপ্ত এবং নিরাপদ পার্কিং স্পেস রয়েছে।"
  },
  {
    q: "খাবারের ব্যবস্থা কি ভেতরেই থাকে?",
    a: "বেশিভাগ হোটেলে নিজস্ব রেস্টুরেন্ট আছে, এছাড়াও রাজবাড়ির আশেপাশে ভালো মানের বেশ কিছু স্থানীয় হোটেল রয়েছে।"
  }
];
