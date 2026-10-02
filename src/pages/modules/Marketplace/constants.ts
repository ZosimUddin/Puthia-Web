import { MarketplaceItem } from '../../../types';

export interface MarketplaceCategory {
  id: string;
  label: string;
  emoji: string;
}

export const CATEGORIES: MarketplaceCategory[] = [
  { id: 'mobile', label: 'মোবাইল', emoji: '📱' },
  { id: 'laptop', label: 'ল্যাপটপ', emoji: '💻' },
  { id: 'bicycle', label: 'বাইসাইকেল', emoji: '🚲' },
  { id: 'motorcycle', label: 'মোটরসাইকেল', emoji: '🏍️' },
  { id: 'car', label: 'গাড়ি', emoji: '🚗' },
  { id: 'furniture', label: 'বাসা ও আসবাব', emoji: '🏠' },
  { id: 'electronics', label: 'ইলেকট্রনিক্স', emoji: '📺' },
  { id: 'fashion', label: 'ফ্যাশন', emoji: '👕' },
  { id: 'agri', label: 'কৃষি পণ্য', emoji: '🌾' },
  { id: 'livestock', label: 'গবাদি পশু', emoji: '🐄' },
  { id: 'books', label: 'বই', emoji: '📚' },
  { id: 'toys', label: 'শিশু সামগ্রী', emoji: '🧸' },
  { id: 'repair_service', label: 'মেরামত ও টেক সার্ভিস', emoji: '🛠️' },
  { id: 'education_service', label: 'শিক্ষাদান ও টিউটর', emoji: '🎓' },
  { id: 'delivery_service', label: 'ডেলিভারি ও কুরিয়ার', emoji: '📦' },
  { id: 'it_service', label: 'ডিজিটাল ও আইটি সেবা', emoji: '💻' },
  { id: 'home_service', label: 'বাসাবাড়ি ও রাজমিস্ত্রি', emoji: '🧹' },
  { id: 'other', label: 'অন্যান্য', emoji: '🛒' }
];

export const IMAGE_PRESETS = [
  { label: 'পুঠিয়ার আম', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&fm=webp&q=75&w=600' },
  { label: 'খেজুরের খাঁটি গুড়', url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&fm=webp&q=75&w=600' },
  { label: 'ধান/চাল ফসলাদি', url: 'https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&fm=webp&q=75&w=600' },
  { label: 'স্মার্টফোন', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&fm=webp&q=75&w=600' },
  { label: 'মোটরসাইকেল', url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&fm=webp&q=75&w=600' },
  { label: 'জমি ও বাড়ি', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&fm=webp&q=75&w=600' },
  { label: 'ল্যাপটপ ও কম্পিউটার', url: 'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&fm=webp&q=75&w=600' },
  { label: 'অন্যান্য জিনিসপত্র', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&fm=webp&q=75&w=600' }
];
