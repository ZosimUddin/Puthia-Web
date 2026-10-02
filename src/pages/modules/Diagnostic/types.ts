export interface DiagnosticCenter {
  id: string;
  name: string;
  tagline?: string;
  category: 'pathology' | 'imaging' | 'heart' | 'general' | 'maternity' | 'other';
  type: 'govt' | 'private';
  address: string;
  union: string;
  area: string;
  rating: number;
  reviewCount: number;
  open24Hours: boolean;
  onlineReport: boolean;
  homeCollection: boolean;
  digitalPayment: boolean;
  establishedYear: string;
  reportTime: string;
  distance: string;
  phone: string;
  whatsapp?: string;
  imageUrl: string;
  services: string[];
  visitFeeRange?: string;
}

export interface ReviewItem {
  id: string;
  userName: string;
  userAvatar?: string;
  date: string;
  rating: number;
  comment: string;
  photos?: string[];
  likes: number;
  replies?: number;
}

export interface MedicalTestItem {
  id: string;
  name: string;
  bengaliName: string;
  category: 'popular' | 'blood' | 'urine' | 'hormone' | 'serology' | 'imaging' | 'heart' | 'other';
  price: number;
  reportDeliveryTime?: string;
  sampleRequired?: string;
}

export interface UserReport {
  id: string;
  testName: string;
  date: string;
  time: string;
  status: 'সম্পন্ন' | 'প্রসেসিং' | 'অপেক্ষমান';
  fileUrl?: string;
  categoryIcon?: string;
}
