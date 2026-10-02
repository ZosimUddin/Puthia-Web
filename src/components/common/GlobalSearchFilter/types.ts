export interface LocationFilterState {
  district: string;
  upazila: string;
  thana: string;
  union: string;
  village: string;
}

export type RatingFilterValue = 'all' | '5.0' | '4.5+' | '4.0+' | '3.0+';

export type VerificationFilterValue = 'all' | 'verified' | 'officially_verified';

export type AvailabilityFilterValue = 'all' | 'open_today' | 'available_now' | 'chamber_today' | '24_hours';

export type DistanceFilterValue = 'all' | '1km' | '5km' | '10km';

export type FeeFilterValue = 'all' | 'low_to_high' | 'high_to_low' | 'under_300' | '300_500' | '500_1000' | 'above_1000';

export type SortOptionValue = 'rating' | 'distance' | 'newest' | 'popular' | 'verified' | 'fee_asc' | 'fee_desc' | 'name_asc';

export interface GlobalFilterState {
  searchInput: string;
  location: LocationFilterState;
  category: string;
  rating: RatingFilterValue;
  verification: VerificationFilterValue;
  availability: AvailabilityFilterValue;
  distance: DistanceFilterValue;
  userCoords: { lat: number; lng: number } | null;
  fee: FeeFilterValue;
  sortBy: SortOptionValue;
}

export const INITIAL_FILTER_STATE: GlobalFilterState = {
  searchInput: '',
  location: {
    district: 'রাজশাহী',
    upazila: 'all',
    thana: 'all',
    union: 'all',
    village: '',
  },
  category: 'all',
  rating: 'all',
  verification: 'all',
  availability: 'all',
  distance: 'all',
  userCoords: null,
  fee: 'all',
  sortBy: 'rating',
};
