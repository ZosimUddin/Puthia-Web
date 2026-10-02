export type VehicleCategory = 
  | 'all' 
  | 'car' 
  | 'microbus' 
  | 'ambulance' 
  | 'pickup' 
  | 'covered_van' 
  | 'cng' 
  | 'autorickshaw' 
  | 'motorcycle' 
  | 'bus' 
  | 'other';

export type ServiceType = 
  | 'hourly' 
  | 'daily' 
  | 'monthly' 
  | 'long_distance' 
  | 'local' 
  | 'airport' 
  | 'wedding' 
  | 'tour' 
  | 'office' 
  | 'cargo';

export type VehicleStatus = 
  | 'draft'
  | 'pending'
  | 'published'
  | 'booked'
  | 'unavailable'
  | 'suspended'
  | 'rejected'
  | 'archived';

export interface VehicleProvider {
  id: string;
  name: string;
  businessName: string;
  profileImage?: string;
  isVerified: boolean;
  rating: number;
  phone: string;
  whatsapp?: string;
  email?: string;
  serviceArea: string;
  address?: string;
  union?: string;
  area?: string;
  totalVehicles?: number;
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'suspended';
}

export interface DriverInfo {
  name?: string;
  experience?: string;
  phone?: string;
  rating?: number;
  licenseVerified?: boolean;
}

export interface VehicleRules {
  minBookingHours?: number;
  maxPassengers?: number;
  fuelIncluded?: boolean;
  tollIncluded?: boolean;
  parkingIncluded?: boolean;
  extraHourCharge?: number;
  cancellationPolicy?: string;
  rulesText?: string;
}

export interface VehiclePricing {
  hourly?: number;
  halfDay?: number;
  daily?: number;
  monthly?: number;
  perKm?: number;
  longDistanceRate?: number;
  longDistanceNote?: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  type: VehicleCategory;
  typeLabel: string;
  brand: string;
  model: string;
  modelYear: string;
  imageUrl: string;
  gallery: string[];
  seatCapacity: number;
  isAC: boolean;
  fuelType: string; // Octane, CNG, Diesel, Electric
  transmission: string; // Automatic, Manual
  luggageCapacity?: string;
  driverOption: 'with_driver' | 'without_driver' | 'both';
  services: ServiceType[];
  serviceArea: string[];
  location: {
    union: string;
    area: string;
    address: string;
    lat?: number;
    lng?: number;
  };
  pricing: VehiclePricing;
  provider: VehicleProvider;
  driverInfo?: DriverInfo;
  rules: VehicleRules;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  status: VehicleStatus;
  bookedDates?: string[]; // Array of YYYY-MM-DD
  createdAt: string;
  description?: string;
}

export interface BookingRequest {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleType: string;
  providerId: string;
  providerName: string;
  providerPhone: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  pickupLocation: string;
  destination: string;
  date: string;
  startTime: string;
  endTime: string;
  passengerCount: number;
  driverRequired: boolean;
  cargoType?: string;
  approxLoad?: string;
  note?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice?: number;
  createdAt: string;
}

export interface VehicleReview {
  id: string;
  vehicleId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface VehicleReport {
  id: string;
  vehicleId: string;
  vehicleName: string;
  reason: string;
  description: string;
  reporterPhone?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface VehicleFilterState {
  category: string;
  serviceType: string;
  driverOption: string;
  seating: string;
  union: string;
  area: string;
  availability: string;
  minPrice: number;
  maxPrice: number;
  isAC: boolean;
}
