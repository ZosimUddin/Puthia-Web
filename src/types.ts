import React from "react";

export interface Upazila {
  nameBangla: string;
  nameEnglish: string;
  area: string; // in sq km, e.g. "২২৮.৫"
  population: string; // e.g. "৩,৫০,০০০"
  unions: number; // number of unions, e.g. ১১
  establishedYear: string; // e.g. "১৯৮৩"
  postalCode: string; // e.g. "১৭৪০"
  famousFor: string; // Famous things, e.g. "কাঁঠাল, শালবন, শিল্পাঞ্চল"
  touristSpots: string[]; // List of tourist/popular spots
  briefHistory: string; // Short history or origin of name
  rivers?: string[]; // Rivers flowing through
  famousPersonalities?: string[]; // Famous figures from here
}

export interface District {
  nameBangla: string;
  nameEnglish: string;
  upazilas: string[]; // List of upazila names or keys
}

export interface Division {
  nameBangla: string;
  nameEnglish: string;
  districts: { [key: string]: District };
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface LostFoundNotice {
  id: string;
  type: "lost" | "found";
  title: string;
  description: string;
  contactPhone: string;
  reporterName: string;
  location: string;
  date: string;
  createdAt: string;
}

export interface SocialEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  category: string;
  organizer: string;
  contactPhone: string;
  createdAt: string;
}

export interface VolunteerActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  organizer: string;
  contactPhone: string;
  volunteerCount: number;
  volunteers: string[]; 
  status: "ongoing" | "completed";
  createdAt: string;
}

export interface LocalIssue {
  id: string;
  title: string;
  description: string;
  locationUnion: string;
  reporterName: string;
  reporterPhone: string;
  status: "Pending" | "Verified" | "Resolved";
  upvotes: number;
  upvotedUsers?: string[];
  createdAt: string;
  category?: string;
  imageUrl?: string;
}

export interface Project {
  id?: string;
  title: string;
  duration: string;
  area: string;
  status: string;
  description?: string;
}

export interface NGO {
  id: string;
  name: string;
  applicantName?: string;
  category: string;
  location: string;
  establishedYear: string;
  shortDescription?: string;
  description: string;
  registrationNumber?: string;
  workingArea?: string;
  head?: string;
  history?: string;
  goals?: string[];
  services?: string[];
  projects?: Project[];
  beneficiaries?: string;
  officeTime?: string;
  phone: string;
  email?: string;
  website?: string;
  facebook?: string;
  googleMapUrl?: string;
  address: string;
  logoUrl?: string;
  coverUrl?: string;
  isVerified?: boolean;
  isPopular?: boolean;
  status: "pending" | "active" | "rejected";
  gallery?: string[];
  videos?: string[];
  documents?: { title: string; url: string }[];
  createdAt: any;
  updatedAt?: any;
  views?: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  ownerName: string;
  contactNumber: string;
  address: string;
  union: string;
  category: string;
  openingTime: string;
  closingTime: string;
  is24Hours: boolean;
  hasHomeDelivery: boolean;
  hasPharmacist: boolean;
  paymentMethods: string[];
  services: string[];
  tradeLicense?: string;
  logoUrl?: string;
  googleMapUrl?: string;
  status: 'active' | 'pending' | 'rejected';
  views: number;
  rating: number;
  reviewCount: number;
  createdAt: any;
  updatedAt?: any;
}

export interface SocialInstitution {
  id: string;
  name: string;
  category: string;
  logoUrl: string;
  coverUrl?: string;
  description: string;
  history?: string;
  goals?: string[];
  activities?: {
    id: string;
    title: string;
    date: string;
    type: "upcoming" | "completed";
    description?: string;
    images?: string[];
  }[];
  location: string; // Union
  address: string;
  phone: string;
  email?: string;
  website?: string;
  facebook?: string;
  establishedYear?: string;
  isVerified?: boolean;
  isPopular?: boolean;
  members?: {
    name: string;
    designation: string;
    phone?: string;
  }[];
  gallery?: string[];
  status: "active" | "pending" | "rejected";
  createdAt: string;
  createdBy: string;
  views?: number;
}

export interface VolunteerApplication {
  id: string;
  institutionId: string;
  institutionName: string;
  name: string;
  phone: string;
  email: string;
  interests: string[];
  status: "pending" | "reviewed" | "accepted";
  createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  unit?: string;
  category: string;
  condition: "new" | "used";
  images: string[];
  imageUrl?: string; // Backward compatibility
  location: string; // Union
  sellerName: string;
  sellerPhone: string;
  sellerId: string;
  status: "active" | "sold" | "pending";
  isFeatured?: boolean;
  createdAt: string;
  views?: number;
  favorites?: string[]; // user ids
  itemType?: 'product' | 'service';
  sellerVerified?: boolean;
  sellerRating?: number;
  sellerMemberSince?: string;
  sellerAvatar?: string;
  sellerSubscription?: 'free' | 'premium' | 'featured';
}

export interface ToLetAd {
  id: string;
  title: string;
  category: "house" | "mess" | "shop" | "other" | "flat" | "room" | "sublet";
  description: string;
  rent: string;
  location: string;
  ownerName: string;
  ownerPhone: string;
  details: string;
  createdAt: string;
  views?: number;
  calls?: number;
  saves?: number;
  union?: string;
  village?: string;
  rating?: number;
  ratingCount?: number;
  ratingSum?: number;
  status?: "pending" | "approved" | "rejected";
  isFeatured?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floor?: string;
  size?: string;
  furnishing?: "furnished" | "semi-furnished" | "unfurnished";
  targetTenant?: "family" | "bachelor" | "female" | "male" | "student" | "any";
  facilities?: string[];
  additionalCosts?: string;
  advanceRent?: string;
  availability?: "available" | "rented" | "upcoming";
  availableFrom?: string;
  expiryDate?: string;
  images?: string[];
  whatsapp?: string;
  isVerified?: boolean;
  ownerId?: string;
  reports?: Array<{ userId: string; reason: string; comment?: string; timestamp: string }>;
}

export interface NoticeItem {
  id: string;
  title?: string;
  text: string;
  content?: string;
  color: string;
  link?: string;
  isActive: boolean;
  isPinned?: boolean;
  order: number;
  createdAt: string;
  publishAt?: string;
  status?: 'published' | 'draft' | 'scheduled';
  priority?: 'low' | 'medium' | 'high';
}

export interface HomePageSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  limit: number;
}

export interface AppSettings {
  appName: string;
  helplineNumber: string;
  logoUrl: string;
  facebookPage: string;
  facebookGroup: string;
  updatePopupEnabled: boolean;
  playStoreLink: string;
  homePageSections?: HomePageSection[];
  todaysPuthia?: {
    weather: string;
    prayerTime: string;
    event: string;
    news: string;
    notice: string;
    marketPrice?: string;
  };
  appVersion?: string;
  minAppVersion?: string;
  forceUpdateEnabled?: boolean;
  apkDownloadUrl?: string;
  appStoreLink?: string;
  updateMessage?: string;
  pushNotificationApiKey?: string;
  pushNotificationAppId?: string;
  pushNotificationProvider?: 'onesignal' | 'firebase' | 'custom';
  isMaintenanceMode?: boolean;
}

export interface ComplaintActionLog {
  message: string;
  date: string;
}

export interface Complaint {
  id: string;
  title: string;
  complainantName: string;
  complainantPhone: string;
  complainantEmail?: string;
  category: string;
  unionName: string;
  description: string;
  evidenceUrls?: string[];
  status: "Pending" | "Verified" | "Processing" | "Resolved" | "Rejected" | "In Progress";
  actionLog?: ComplaintActionLog[];
  createdAt: string;
  userId?: string;
  email?: string;
  department?: string;
  adminReply?: string;
  ticketId?: string;
}

export interface Feedback {
  id: string;
  name: string;
  phone: string;
  rating: number;
  message: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "Pending" | "Replied" | "Resolved";
  adminNotes?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>; // index -> count
  totalVotes: number;
  status: "active" | "past";
  category: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  pollId: string;
  userId: string;
  optionIndex: number;
  createdAt: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  hospital: string;
  location: string;
  contactNumber: string;
  neededAt: string;
  status: "pending" | "fulfilled";
  userId: string;
  createdAt: string;
  isCritical?: boolean;
  details?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userPhone: string;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  label: string;
}

export interface Category {
  id: string;
  label: string;
  itemIds: string[];
  items: CategoryItem[];
}

export interface Business {
  id: string;
  userId?: string;
  name: string;
  ownerName?: string;
  description: string;
  category: string;
  categoryLabel?: string;
  subCategory?: string;
  address: string;
  union?: string;
  marketName?: string;
  phone: string;
  email?: string;
  website?: string;
  facebook?: string;
  whatsapp?: string;
  establishedYear?: string;
  imageUrl?: string;
  logoUrl?: string;
  location?: {
    lat: number;
    lng: number;
  };
  rating: number;
  ratingCount?: number;
  reviewCount?: number;
  views?: number;
  offer?: {
    discount: string;
    title: string;
    validUntil?: string;
  };
  reviewsList?: BusinessReview[];
  images?: string[];
  logo?: string;
  openingHours?: {
    open: string;
    close: string;
    offDay?: string;
  };
  status: "pending" | "approved" | "rejected";
  isFeatured?: boolean;
  isVerified?: boolean;
  isPremium?: boolean;
  isOpen?: boolean;
  products?: BusinessProduct[];
  reportCount?: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  userId: string;
  businessId?: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  imageUrl?: string;
  status: "active" | "inactive";
  stock?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  targetId: string; 
  targetType: 'business' | 'product' | 'tolet';
  targetName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: string;
  lastDonationDate?: string;
  phone: string;
  location: string;
  isAvailable: boolean;
  union: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  slug?: string;
  name: string;
  profilePhoto?: string;
  imageUrl?: string;
  gender?: 'পুরুষ' | 'নারী' | 'অন্যান্য' | string;
  degrees?: string;
  qualifications?: string;
  degree?: string;
  speciality?: string;
  specialization?: string;
  bmdcNumber?: string;
  bmdc_registration?: string;
  designation?: string;
  experience?: number;
  treatmentAreas?: string[];
  services?: string[];
  workplaceType?: 'hospital' | 'clinic' | 'diagnostic' | 'chamber' | 'other' | string;
  workplace?: string;
  previousWorkplace?: string;
  chamberName?: string;
  chamberAddress?: string;
  upazila?: string;
  union?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  chamberDays?: string[];
  chamberTime?: string;
  consultationDays?: string[];
  consultationTime?: string;
  contactNumber?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  googleMapUrl?: string;
  onlineConsultation?: boolean;
  hasOnlineAppt?: boolean;
  emergencyService?: boolean;
  languages?: string;
  biography?: string;
  visitFee?: string;
  fee?: string;
  isVerified?: boolean;
  verificationStatus?: 'verified' | 'pending' | 'rejected' | 'correction_required' | string;
  isFeatured?: boolean;
  chambers?: {
    id: string;
    name: string;
    address: string;
    phone: string;
    visitFee: string;
    schedule: string;
  }[];
  status?: 'approved' | 'active' | 'pending' | 'rejected' | 'draft' | 'suspended' | 'archived' | 'correction_required' | string;
  correctionNotes?: string;
  rejectionReason?: string;
  views?: number;
  rating?: number;
  reviewCount?: number;
  createdBy?: string;
  userId?: string;
  user_id?: string;
  updatedBy?: string;
  createdAt?: any;
  updatedAt?: any;
  // Backward compatibility fields
  spec?: string;
  time?: string;
}

export interface DoctorAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  patientAge?: string | number;
  patientGender?: string;
  appointmentDate: string;
  preferredTime: string;
  chamberName?: string;
  problemDescription?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  userId?: string;
  userPhone?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  userId?: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  likes?: number;
  status?: 'approved' | 'pending' | 'rejected';
  createdAt: any;
}

export interface DoctorReport {
  id: string;
  doctorId: string;
  doctorName?: string;
  reason: 'ভুল তথ্য' | 'ভুল ফোন নম্বর' | 'ডাক্তার এখানে কাজ করেন না' | 'ভুয়া প্রোফাইল' | 'অনুপযুক্ত তথ্য' | 'অন্যান্য' | string;
  details: string;
  reportedBy?: string;
  reporterPhone?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: any;
}

export interface HealthService {
  id: string;
  name: string;
  type: string; // "hospital" | "clinic" | "ambulance" | "pharmacy" | "diagnostic"
  phone: string;
  address: string;
  hours: string;
  rating: number;
  mapUrl: string;
  image: string;
  about: string;
  departments: string[];
  doctors: Doctor[];
  gallery: string[];
  establishedYear?: string;
  email?: string;
  ambulanceHotline?: string;
  emergencyHotline?: string;
  hasAmbulance?: boolean;
  hasParking?: boolean;
  isDisabledFriendly?: boolean;
  bedsAvailable?: number;
  totalBeds?: number;
  opdHours?: string;
  emergencyHours?: string;
  hasEmergency24h?: boolean;
  lat?: number;
  lng?: number;
  status?: "pending" | "approved" | "rejected";
  isFeatured?: boolean;
  isOpen?: boolean;
  location?: { lat: number; lng: number };
}

export interface Hospital {
  id: string;
  slug?: string;
  name: string;
  type?: 'সরকারি' | 'বেসরকারি' | 'বিশেষায়িত' | 'ক্লিনিক' | 'মাতৃসদন' | string;
  ownerName?: string;
  ownership?: string;
  licenseNumber?: string;
  description: string;
  address: string;
  union: string;
  village?: string;
  phone: string;
  emergencyHotline?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  imageUrl?: string;
  openingTime?: string;
  closingTime?: string;
  departments: string[];
  services?: string[];
  facilities?: string[];
  bedCount?: number;
  bedCapacity?: {
    total?: number;
    general?: number;
    icu?: number;
    ccu?: number;
    nicu?: number;
    pediatric?: number;
    female?: number;
    emergency?: number;
    updatedAt?: string;
  };
  schedule?: {
    day: string;
    openingTime: string;
    closingTime: string;
    isClosed?: boolean;
    notes?: string;
  }[];
  hasEmergency24h?: boolean;
  emergencyDetails?: {
    phone?: string;
    ambulancePhone?: string;
    hasEmergency24h?: boolean;
    hours?: string;
    notes?: string;
  };
  hasAmbulance?: boolean;
  hasParking?: boolean;
  isDisabledFriendly?: boolean;
  acceptsInsurance?: boolean;
  acceptsGovtHealthCard?: boolean;
  googleMapUrl?: string;
  gallery?: string[];
  doctorIds?: string[];
  doctors?: Doctor[];
  isVerified?: boolean;
  verificationStatus?: 'verified' | 'pending' | 'rejected' | 'suspended' | string;
  isFeatured?: boolean;
  status?: 'active' | 'pending' | 'rejected' | 'suspended' | string;
  views?: number;
  rating?: number;
  reviewCount?: number;
  distance?: string;
  establishedYear?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface EducationInstitution {
  id: string;
  name: string;
  headName?: string;
  description: string;
  address: string;
  union: string;
  phone: string;
  email?: string;
  website?: string;
  type: 'primary' | 'secondary' | 'college' | 'madrasa' | 'technical' | 'coaching' | 'kindergarten' | 'special';
  studentCount?: number;
  teacherCount?: number;
  officeHours?: string;
  googleMapUrl?: string;
  imageUrl?: string;
  status: 'active' | 'pending' | 'rejected';
  views: number;
  rating: number;
  reviewCount: number;
  createdAt: any;
  updatedAt?: any;
}

export interface SubViewsProps {
  viewId: string;
  onGoBack: () => void;
  bloodDonors: any[];
  setBloodDonors: React.Dispatch<React.SetStateAction<any[]>>;
  onSimulateCall: (recipient: string, role: string) => void;
  setSelectedSubView: (view: string | null) => void;
  bloodSearchTerm: string;
  setBloodSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSelectedNews?: (news: any) => void;
}

export interface ServiceApplication {
  id: string;
  userId?: string;
  serviceId?: string;
  applicantName: string;
  applicantPhone: string;
  applicantNid?: string;
  serviceType?: "birth_registration" | "death_registration" | "nid_service" | "e_mutation" | "citizen_certificate" | "trade_license" | "charity_allowance" | "passport" | "other" | string;
  serviceName: string;
  unionName?: string;
  details?: any;
  status: "Pending" | "Processing" | "Approved" | "Rejected" | string;
  adminFeedback?: string;
  createdAt: string;
}export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'general' | 'emergency' | 'notice' | 'event' | 'alert' | 'business' | 'order';
  read: boolean;
  createdAt: string;
}




export interface MarketPrice {
  id: string;
  itemName: string;
  category: string;
  price: number;
  unit: string;
  previousPrice?: number;
  trend: "up" | "down" | "stable";
  updatedAt: string;
}

export interface AgriNotice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: "low" | "medium" | "high";
  link?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WeatherAlert {
  id: string;
  type: "cyclone" | "rain" | "heat" | "cold" | "storm" | "flood" | "normal";
  severity: "low" | "moderate" | "high" | "extreme";
  message: string;
  date: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PageView {
  id: string;
  path: string;
  timestamp: string;
  userId?: string;
  device?: string;
}

export interface SearchEvent {
  id: string;
  query: string;
  timestamp: string;
  userId?: string;
}

export interface AnalyticsSummary {
  todayVisitors: number;
  totalViews: number;
  popularPages: { path: string; count: number }[];
  weeklyVisits: { date: string; count: number }[];
  searchCount: number;
  popularSearches: { query: string; count: number }[];
}

export interface Report {
  id: string;
  contentId: string;
  contentTitle: string;
  details: string;
  createdAt: any;
  status: 'Pending' | 'Resolved' | 'Rejected';
  reporterId?: string;
  type?: string;
}

export interface UserPost {
  id: string;
  userId?: string;
  userName: string;
  userPhoto?: string;
  text: string;
  images?: string[];
  videoUrl?: string;
  pdfUrl?: string;
  location?: string;
  poll?: Poll;
  scheduledDate?: string;
  isDraft?: boolean;
  hashtags?: string[];
  mentions?: string[];
  createdAt: any;
  status: 'pending' | 'approved' | 'rejected';
  likes?: number;
  commentsCount?: number;
  featured?: boolean;
  category?: string;
  views?: number;
  sharedPostId?: string;
  sharedPostData?: UserPost;
}

export interface LoginHistoryLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  ipAddress: string;
  deviceInfo: string;
  location?: string;
  timestamp: string;
  status: 'success' | 'failed' | 'blocked';
  failReason?: string;
}

export interface SuspiciousActivityLog {
  id: string;
  ipAddress: string;
  userEmail?: string;
  attemptType: 'brute_force' | 'invalid_token' | 'unauthorized_admin_access' | 'rapid_requests' | 'suspicious_ip';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  location?: string;
  timestamp: string;
  status: 'active' | 'investigated' | 'blocked' | 'dismissed';
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteLogoUrl: string;
  darkLogoUrl?: string;
  faviconUrl?: string;
  appIconUrl?: string;
  heroBannerUrl?: string;
  themeColor?: string;
  homeLayout?: string;
  headerText: string;
  footerText: string;
  showFooter?: boolean;
  developerLabel?: string;
  developerName?: string;
  developerLink?: string;
  developerHeartEmoji?: string;
  showDeveloperCredit?: boolean;
  footerBgColor?: string;
  footerTextColor?: string;
  footerAccentColor?: string;
  contactPhone: string;
  helplineNumber?: string;
  contactEmail: string;
  contactAddress: string;
  workingHours?: string;
  mapCoordinates?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
    telegram?: string;
  };
  // SEO & Meta Tags Configuration
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  ogImageUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: 'website' | 'article' | 'place' | 'profile';
  twitterCard?: 'summary_large_image' | 'summary';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  authorName?: string;
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
  googleSearchConsole?: string;
  bingVerification?: string;
  googleAnalyticsId?: string;
  schemaJsonLd?: string;
  googleMapsApiKey: string;
  pushNotificationKey: string;
  senderId?: string;
  smsGatewayKey?: string;
  emailSmtpHost?: string;
  enableSoundAlerts?: boolean;
  isMaintenanceMode: boolean;
  maintenanceMessage?: string;
  allowedIPs?: string;
  
  // Security - Password Policy & Login Security
  loginMaxAttempts?: number;
  loginLockoutDurationMinutes?: number;
  passwordMinLength?: number;
  passwordRequireSpecialChar?: boolean;
  passwordRequireUppercase?: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireNumber?: boolean;
  passwordExpirationDays?: number;
  preventPasswordReuseCount?: number;
  forcePasswordResetOnFirstLogin?: boolean;
  enableLoginCaptcha?: boolean;
  loginAlertEmailOnNewDevice?: boolean;

  // Security - 2FA
  security2FAEnforced?: boolean;
  security2FAForUsers?: boolean;
  twoFactorMethod?: 'sms' | 'email' | 'authenticator' | 'all';
  require2FAForSensitiveActions?: boolean;

  // Security - Session Management
  securitySessionTimeoutMinutes?: number;
  maxConcurrentSessionsPerUser?: number;
  forceLogoutOnPasswordChange?: boolean;
  rememberMeDurationDays?: number;

  // Security - Suspicious Activity
  enableSuspiciousAlerts?: boolean;
  autoBlockSuspiciousIPs?: boolean;
  blockedIPsList?: string[];

  // Security - Admin Security
  adminMasterPinRequired?: boolean;
  adminMasterPin?: string;
  adminIpWhitelistOnly?: boolean;
  adminAuditLogLevel?: 'basic' | 'detailed' | 'verbose';
  notifyAdminOnNewAdminCreation?: boolean;
  securityRequireMobileVerification?: boolean;
  securityRateLimitPerMin?: number;

  // Hero Slider Controls
  showHeroSlider?: boolean;
  heroSliderAutoplayDelay?: number;

  // Emergency Notice Ticker Bar Controls (Home Top Marquee)
  showNoticeTicker?: boolean;
  noticeTickerBadgeText?: string;
  noticeTickerBadgeIcon?: string;
  noticeTickerBadgeColor?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'slate';
  noticeTickerSpeed?: number;
  noticeTickerDestination?: string;
  noticeTickerPauseOnHover?: boolean;

  updatedAt: string;
}

export interface SeoSettings {
  id?: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  ogImageUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: 'website' | 'article' | 'place' | 'profile';
  twitterCard?: 'summary_large_image' | 'summary';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  authorName?: string;
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
  googleSearchConsole?: string;
  bingVerification?: string;
  googleAnalyticsId?: string;
  schemaJsonLd?: string;
  updatedAt?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  link: string;
  tag?: string;
  category?: string;
  emoji?: string;
  badgeColor?: string;
  gradient?: string;
  accentColor?: string;
  buttonBg?: string;
  order: number;
  isActive: boolean;
  stats?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomType {
  id: string;
  name: string; // e.g. "Deluxe Double AC"
  price: number;
  capacity: number;
  features: string[]; // ["AC", "Double Bed", "TV"]
  imageUrl?: string;
}

export interface HotelReview {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: any;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  category: "hotel" | "guest_house" | "motel" | "homestay";
  address: string;
  phone: string;
  email?: string;
  website?: string;
  location: {
    lat: number;
    lng: number;
  };
  startingPrice: number;
  rating: number;
  ratingCount: number;
  images: string[];
  facilities: string[]; // ["wifi", "parking", "ac", "restaurant", "hot_water", "family_room", "prayer_space", "security"]
  rooms: RoomType[];
  checkIn: string; // e.g. "12:00 PM"
  checkOut: string; // e.g. "11:00 AM"
  isFeatured?: boolean;
  isVerified?: boolean;
  status: "active" | "inactive" | "pending";
  createdAt: any;
  updatedAt?: any;
}

export interface BusinessProduct {
  id: string;
  name: string;
  price?: number;
  description?: string;
  imageUrl?: string;
}

export interface BusinessReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: any;
}

export interface Market {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  shopCount: number;
  description?: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  replyToId?: string; // for nested comments
  imageUrl?: string; // for image comment
  pinned?: boolean;
  createdAt: any;
  editedAt?: any;
}

export interface SubMenuPageData {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  contactInfo?: { label: string; value: string; }[];
  mapLocation?: string;
  photoGallery?: string[];
  callNumber?: string;
  websiteUrl?: string;
  facebookUrl?: string;
}

export interface EmergencyService {
  id: string;
  slug: string;
  name: string;
  category: string; // 'ambulance' | 'police' | 'fire' | 'hospital' | 'blood' | 'doctor' | 'diagnostic' | 'transport' | 'pharmacy' | 'electricity' | 'water' | 'other'
  categoryLabel: string;
  organization?: string;
  phone: string;
  altPhone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  location: string;
  union: string;
  village?: string;
  address: string;
  mapsUrl?: string;
  description: string;
  serviceArea?: string;
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'suspended' | 'archived';
  isVerified: boolean;
  lastVerifiedDate: string;
  availabilityType: '24_hours' | 'open_now' | 'scheduled';
  schedule?: { [day: string]: string };
  icon?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface EmergencyFilters {
  category?: string;
  union?: string;
  availability?: string;
  isVerifiedOnly?: boolean;
  searchQuery?: string;
  radiusKm?: number;
}

export interface EmergencyReport {
  id?: string;
  serviceId: string;
  serviceName: string;
  reporterName: string;
  reporterPhone: string;
  incorrectField: string;
  details: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface PoliceContact {
  id: string;
  title: string; // e.g. "ভারপ্রাপ্ত কর্মকর্তা (OC)", "ডিউটি অফিসার", "কন্ট্রোল রুম"
  contactType: 'station' | 'outpost' | 'duty_officer' | 'women_child' | 'traffic' | 'investigation' | 'control_room' | 'other';
  phone: string;
  altPhone?: string;
  email?: string;
  officerName?: string;
  designation?: string;
  stationName?: string;
  availability: '24_hours' | 'open_now' | 'closed';
  isVerified: boolean;
  lastVerifiedDate?: string;
}

export interface PoliceService {
  id: string;
  serviceName: string; // e.g. "সাধারণ ডায়েরি (GD)", "পুলিশ ক্লিয়ারেন্স", "হারানো/প্রাপ্তি"
  category: 'gd' | 'clearance' | 'lost_found' | 'women_child' | 'traffic' | 'citizen_service' | 'investigation' | 'other';
  description: string;
  eligibility?: string;
  requiredDocuments?: string[];
  serviceLocation?: string;
  officeHours?: string;
  contactPhone?: string;
  officialLink?: string;
  additionalNotes?: string;
}

export interface PoliceStation {
  id: string;
  slug: string;
  name: string; // e.g. "পুঠিয়া থানা"
  stationType: 'police_station' | 'outpost' | 'investigation_center' | 'traffic' | 'service_center'; // 'thana' | 'outpost' | 'investigation_center'
  organization: string; // "বাংলাদেশ পুলিশ"
  phone: string;
  altPhone?: string;
  dutyOfficerPhone?: string;
  ocPhone?: string;
  hotline?: string;
  email?: string;
  website?: string;
  location: string;
  union: string;
  village?: string;
  address: string;
  mapsUrl?: string;
  description: string;
  serviceArea: string[];
  keyAreasCovered?: string[];
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'suspended' | 'archived';
  isVerified: boolean;
  verifiedBy?: string;
  lastVerifiedDate?: string;
  availabilityType: '24_hours' | 'open_now' | 'closed' | 'scheduled';
  schedule?: { [day: string]: string };
  keyContacts?: PoliceContact[];
  servicesOffered?: string[]; // list of service names
  facilities?: string[]; // e.g. ['হেল্প ডেস্ক', 'নারী ও শিশু ডেস্ক', 'সাইবার সাপোর্ট', 'জরুরি টহল']
  coverImage?: string;
  galleryImages?: string[];
  lat?: number;
  lng?: number;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface PoliceStationFilters {
  union?: string;
  type?: string;
  category?: string;
  availability?: string;
  isVerifiedOnly?: boolean;
  searchQuery?: string;
  sortBy?: 'relevance' | 'nearest' | 'rating' | 'name' | 'newest';
  maxDistanceKm?: number;
}

export interface PoliceStationReport {
  id?: string;
  stationId: string;
  stationName: string;
  reporterName: string;
  reporterPhone: string;
  problemType: string;
  incorrectInfo: string;
  correctInfo: string;
  comment?: string;
  attachmentUrl?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

// ==========================================
// Lawyer & Legal Services (আইনজীবী ও আইনগত সেবা)
// ==========================================

export interface LawyerChamber {
  name: string;
  address: string;
  union: string;
  village?: string;
  phone: string;
  email?: string;
  officeHours?: string;
  mapsUrl?: string;
  schedule?: { [day: string]: string };
}

export interface Lawyer {
  id: string;
  slug: string;
  name: string; // e.g. "অ্যাডভোকেট মো: আব্দুল মান্নান"
  title: string; // e.g. "আইনজীবী", "সিনিয়র অ্যাডভোকেট", "হাইকোর্ট বিভাগের আইনজীবী"
  photoUrl?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  whatsapp?: string;
  barAssociation: string; // e.g. "রাজশাহী জেলা বার অ্যাসোসিয়েশন"
  court: string; // e.g. "পুঠিয়া চৌকি আদালত ও রাজশাহী জেলা জজ কোর্ট"
  specializations: string[]; // e.g. ['দেওয়ানি', 'ফৌজিদারি', 'পারিবারিক', 'জমি ও সম্পত্তি']
  experienceYears?: number; // e.g. 12
  sanadNo?: string; // Bar council registration / sanad number if verified
  languages?: string[]; // e.g. ['বাংলা', 'English']
  location: string; // e.g. "পুঠিয়া সদর"
  union: string; // e.g. "Puthia"
  village?: string;
  chamber: LawyerChamber;
  secondaryChamber?: LawyerChamber;
  bio?: string;
  isVerified: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'suspended' | 'archived';
  verifiedBy?: string;
  lastVerifiedDate?: string;
  availabilityStatus: 'open_now' | 'closed' | 'appointment_only';
  appointmentAvailable: boolean;
  appointmentFee?: string; // e.g. "আলোচনা সাপেক্ষে"
  rating?: number;
  totalReviews?: number;
  lat?: number;
  lng?: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface LawyerFilters {
  union?: string;
  specialization?: string;
  court?: string;
  availability?: string;
  language?: string;
  isVerifiedOnly?: boolean;
  searchQuery?: string;
  sortBy?: 'relevance' | 'name' | 'nearest' | 'newest' | 'rating';
  maxDistanceKm?: number;
}

export interface LawyerAppointment {
  id?: string;
  lawyerId: string;
  lawyerName: string;
  chamberName: string;
  clientName: string;
  clientPhone: string;
  preferredDate: string;
  preferredTime: string;
  legalCategory: string;
  shortMessage?: string;
  status: 'pending' | 'accepted' | 'rescheduled' | 'completed' | 'cancelled' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface LawyerReport {
  id?: string;
  lawyerId: string;
  lawyerName: string;
  reporterName: string;
  reporterPhone: string;
  problemType: string;
  incorrectInfo: string;
  correctInfo: string;
  comment?: string;
  attachmentUrl?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface LegalAidInfo {
  id: string;
  title: string; // e.g. "জাতীয় আইনগত সহায়তা প্রদান সংস্থা (NLASO)"
  providerName: string;
  hotline: string;
  phone?: string;
  address: string;
  eligibility: string; // Who qualifies for free legal aid
  services: string[];
  howToApply: string;
  officialWebsite?: string;
}

export interface LegalGuideTopic {
  id: string;
  title: string;
  category: string; // e.g. 'jomi', 'family', 'inheritance', 'tenant', 'consumer', 'cyber', 'women_child', 'other'
  summary: string;
  keyPoints: string[];
  stepsToTake?: string[];
  relevantLaws?: string[];
}


export interface AmbulanceBookingRequest {
  id?: string;
  patientName: string;
  mobile: string;
  pickupLocation: string;
  destination: string;
  date: string;
  time: string;
  conditionCategory: 'normal' | 'urgent' | 'critical';
  oxygenRequired: boolean;
  accompaniedCount: number;
  additionalNote?: string;
  status: 'Pending' | 'Accepted' | 'Driver Assigned' | 'On the Way' | 'Completed' | 'Cancelled' | 'Rejected';
  createdAt: string;
  userId?: string;
}

export interface FireStation {
  id: string;
  slug: string;
  name: string;
  stationType: string; // 'upazila' | 'district' | 'station' | 'outpost'
  organization: string;
  phone: string;
  altPhone?: string;
  hotline?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  location: string;
  union: string;
  village?: string;
  address: string;
  mapsUrl?: string;
  description: string;
  serviceArea: string[];
  keyAreasCovered?: string[];
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'suspended' | 'archived';
  isVerified: boolean;
  verifiedBy?: string;
  lastVerifiedDate?: string;
  availabilityType: '24_hours' | 'open_now' | 'closed' | 'scheduled';
  schedule?: { [day: string]: string };
  facilities: string[]; // e.g. ['Fire Engine', 'Rescue Support', 'Firefighting Equipment', 'Water Support']
  servicesOffered: string[]; // e.g. ['অগ্নিকাণ্ড মোকাবিলা', 'উদ্ধার কার্যক্রম', 'দুর্ঘটনা উদ্ধার']
  vehiclesCount?: number;
  fireTendersCount?: number;
  ambulancesCount?: number;
  coverImage?: string;
  galleryImages?: string[];
  lat?: number;
  lng?: number;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface FireStationFilters {
  union?: string;
  availability?: string;
  isVerifiedOnly?: boolean;
  searchQuery?: string;
  sortBy?: 'relevance' | 'nearest' | 'rating' | 'name' | 'newest';
  maxDistanceKm?: number;
}

export interface FireStationReport {
  id?: string;
  stationId: string;
  stationName: string;
  reporterName: string;
  reporterPhone: string;
  problemType: string;
  incorrectInfo: string;
  correctInfo: string;
  comment?: string;
  attachmentUrl?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface PoliceContact {
  id: string;
  title: string;
  contactType: 'station' | 'outpost' | 'duty_officer' | 'women_child' | 'traffic' | 'investigation' | 'control_room' | 'other';
  phone: string;
  altPhone?: string;
  email?: string;
  officerName?: string;
  designation?: string;
  stationName?: string;
  availability: '24_hours' | 'open_now' | 'closed';
  isVerified: boolean;
  lastVerifiedDate?: string;
}

export interface PoliceService {
  id: string;
  serviceName: string;
  category: 'gd' | 'clearance' | 'lost_found' | 'women_child' | 'traffic' | 'citizen_service' | 'investigation' | 'other';
  description: string;
  eligibility?: string;
  requiredDocuments?: string[];
  serviceLocation?: string;
  officeHours?: string;
  contactPhone?: string;
  officialLink?: string;
  additionalNotes?: string;
}

export interface PoliceStation {
  id: string;
  slug: string;
  name: string;
  stationType: 'police_station' | 'outpost' | 'investigation_center' | 'traffic' | 'service_center';
  organization: string;
  phone: string;
  altPhone?: string;
  dutyOfficerPhone?: string;
  ocPhone?: string;
  hotline?: string;
  email?: string;
  website?: string;
  location: string;
  union: string;
  village?: string;
  address: string;
  mapsUrl?: string;
  description: string;
  serviceArea: string[];
  keyAreasCovered?: string[];
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'suspended' | 'archived';
  isVerified: boolean;
  verifiedBy?: string;
  lastVerifiedDate?: string;
  availabilityType: '24_hours' | 'open_now' | 'closed' | 'scheduled';
  schedule?: { [day: string]: string };
  keyContacts?: PoliceContact[];
  servicesOffered?: string[];
  facilities?: string[];
  coverImage?: string;
  galleryImages?: string[];
  lat?: number;
  lng?: number;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface PoliceStationFilters {
  union?: string;
  type?: string;
  category?: string;
  availability?: string;
  isVerifiedOnly?: boolean;
  searchQuery?: string;
  sortBy?: 'relevance' | 'nearest' | 'rating' | 'name' | 'newest';
  maxDistanceKm?: number;
}

export interface PoliceStationReport {
  id?: string;
  stationId: string;
  stationName: string;
  reporterName: string;
  reporterPhone: string;
  problemType: string;
  incorrectInfo: string;
  correctInfo: string;
  comment?: string;
  attachmentUrl?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface BusCounter {
  id: string;
  name: string;
  operatorName: string;
  phone: string;
  location: string;
  destinations: string[];
  hours: string;
}

export interface BusRouteInfo {
  id: string;
  from: string;
  to: string;
  operatorName: string;
  counterPhone: string;
  departureTime: string;
  duration?: string;
  fare?: string;
  status: 'active' | 'delayed' | 'suspended';
}

export interface BusStand {
  id: string;
  slug: string;
  name: string;
  standType: 'bus_stand' | 'terminal' | 'counter' | 'local' | 'interdistrict';
  organization?: string;
  phone: string;
  altPhone?: string;
  hotline?: string;
  location: string;
  union: string;
  village?: string;
  address: string;
  mapsUrl?: string;
  description: string;
  routes: string[];
  destinations: string[];
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'suspended' | 'archived';
  isVerified: boolean;
  verifiedBy?: string;
  lastVerifiedDate?: string;
  availabilityType: '24_hours' | 'open_now' | 'closed' | 'scheduled';
  schedule?: { [day: string]: string };
  counters?: BusCounter[];
  busRoutes?: BusRouteInfo[];
  facilities: string[];
  coverImage?: string;
  galleryImages?: string[];
  lat?: number;
  lng?: number;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface BusStandFilters {
  union?: string;
  type?: string;
  destination?: string;
  availability?: string;
  isVerifiedOnly?: boolean;
  searchQuery?: string;
  sortBy?: 'relevance' | 'nearest' | 'rating' | 'name' | 'newest';
  maxDistanceKm?: number;
}

export interface BusStandReport {
  id?: string;
  busStandId: string;
  busStandName: string;
  reporterName: string;
  reporterPhone: string;
  problemType: string;
  incorrectInfo: string;
  correctInfo: string;
  comment?: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: string;
}

export interface TrainScheduleItem {
  id: string;
  stationName: string;
  stationCode?: string;
  arrivalTime: string;
  departureTime: string;
  stopDuration?: string;
  status?: 'on_time' | 'delayed' | 'cancelled' | 'active';
}

export interface TrainRouteTimelineNode {
  stationName: string;
  stationSlug?: string;
  arrivalTime: string;
  departureTime: string;
  distanceKm?: number;
}

export interface TrainFareInfo {
  id: string;
  className: string;
  fareAmount: string;
  seatType?: string;
}

export interface Train {
  id: string;
  slug: string;
  name: string;
  trainNumber: string;
  trainType: 'intercity' | 'mail' | 'commuter' | 'local' | 'other';
  operator: string;
  startingStation: string;
  destination: string;
  weeklyOffDay: string; // e.g. 'শুক্রবার' or 'কোনোটিই নয়'
  status: 'active' | 'delayed' | 'cancelled' | 'modified';
  lastUpdated: string;
  description: string;
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'suspended' | 'archived';
  isVerified: boolean;
  verifiedBy?: string;
  lastVerifiedDate?: string;
  schedule: TrainScheduleItem[];
  routeTimeline: TrainRouteTimelineNode[];
  fares: TrainFareInfo[];
  classes: string[];
  facilities: string[];
  officialTicketUrl?: string;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
}

export interface TrainFilters {
  trainType?: string;
  departureTimeSlot?: string;
  destination?: string;
  station?: string;
  status?: string;
  searchQuery?: string;
  sortBy?: 'relevance' | 'departure' | 'arrival' | 'name' | 'nearest' | 'rating';
  maxDistanceKm?: number;
  date?: string;
}

export interface TrainReport {
  id?: string;
  trainId: string;
  trainName: string;
  reporterName: string;
  reporterPhone: string;
  problemType: string;
  incorrectInfo: string;
  correctInfo: string;
  comment?: string;
  attachmentUrl?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface RailwayStation {
  id: string;
  slug: string;
  name: string;
  stationCode?: string;
  location: string;
  union: string;
  upazila: string;
  district: string;
  address: string;
  mapsUrl?: string;
  phone?: string;
  availableTrainsCount: number;
  destinations: string[];
  facilities: string[];
  lat?: number;
  lng?: number;
  description?: string;
  createdAt: string;
}

export interface EntrepreneurProduct {
  id: string;
  name: string;
  description: string;
  price?: string;
  imageUrl?: string;
  category?: string;
}

export interface EntrepreneurServiceItem {
  id: string;
  name: string;
  description: string;
  price?: string;
}

export interface EntrepreneurScheduleItem {
  day: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

export interface Entrepreneur {
  id: string;
  slug: string;
  name: string;
  profilePhoto?: string;
  coverPhoto?: string;
  mobile: string;
  email?: string;
  businessName: string;
  category: string;
  entrepreneurType: string;
  businessType: string;
  description: string;
  shortBio?: string;
  services: EntrepreneurServiceItem[];
  products: EntrepreneurProduct[];
  targetCustomers?: string;
  operatingArea?: string;
  establishedYear?: string;
  experienceYears?: string;
  union: string;
  village: string;
  area: string;
  address: string;
  mapLocation?: string;
  lat?: number;
  lng?: number;
  website?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  youtube?: string;
  schedule: EntrepreneurScheduleItem[];
  founderStory?: {
    startedHow?: string;
    challenges?: string;
    futureGoals?: string;
  };
  achievements?: {
    title: string;
    year?: string;
    description?: string;
    organization?: string;
  }[];
  skills?: string[];
  verificationStatus: 'pending' | 'under_review' | 'verified' | 'rejected' | 'suspended' | 'archived';
  verifiedAt?: string;
  verifiedBy?: string;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  views?: number;
  createdAt: string;
}

export interface EntrepreneurReview {
  id: string;
  entrepreneurId: string;
  userName: string;
  userId?: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface EntrepreneurReport {
  id: string;
  entrepreneurId: string;
  reporterName: string;
  reporterPhone?: string;
  problemType: string;
  incorrectInfo: string;
  correctInfo: string;
  comment?: string;
  attachmentUrl?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

// ==========================================
// Restaurant & Food Discovery (রেস্টুরেন্ট ও খাবার তথ্য)
// ==========================================

export interface RestaurantMenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface RestaurantReview {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  category: 'restaurant' | 'cafe' | 'sweet' | 'fastfood';
  contact: string;
  altContact?: string;
  whatsapp?: string;
  location: string;
  union: string;
  specialty: string;
  openingTime: string;
  closingTime: string;
  offDay: string;
  googleMapUrl?: string;
  imageUrl?: string;
  menu?: RestaurantMenuItem[];
  rating?: number;
  reviewCount?: number;
  reviewsList?: RestaurantReview[];
  userId?: string;
  isApproved: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  views?: number;
  createdAt: string;
}

// ==========================================
// Skilled Worker (মিস্ত্রী ও কারিগর)
// ==========================================

export interface SkilledWorkerService {
  id: string;
  name: string;
  description: string;
  startingPrice?: number;
}

export interface SkilledWorkerReview {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  workPhoto?: string;
  createdAt: string;
}

export interface SkilledWorkerReport {
  id: string;
  userId: string;
  reporterName: string;
  type: 'ভুল তথ্য' | 'ভুল ফোন' | 'ভুল সেবা' | 'ভুল লোকেশন' | 'মিস্ত্রী আর সেবা দেন না' | 'ভুয়া প্রোফাইল' | 'প্রতারণার সন্দেহ' | 'অন্যান্য';
  description: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface SkilledWorkerGalleryItem {
  id: string;
  beforeImage?: string;
  afterImage?: string;
  completedImage?: string;
  title?: string;
}

export interface SkilledWorker {
  id: string;
  slug: string;
  name: string;
  profilePhoto: string;
  category: 'রাজমিস্ত্রী' | 'ইলেকট্রিশিয়ান' | 'প্লাম্বার' | 'কাঠমিস্ত্রী' | 'টাইলস মিস্ত্রী' | 'রং মিস্ত্রী' | 'অ্যালুমিনিয়াম মিস্ত্রী' | 'ওয়েল্ডিং মিস্ত্রী' | 'এসি/ফ্রিজ মেকানিক' | 'মোটর/পাম্প মেকানিক' | 'স্যানিটারি মিস্ত্রী' | 'গ্যাস/চুলা মেকানিক' | 'মোবাইল/ইলেকট্রনিক্স টেকনিশিয়ান' | 'গাড়ি/মোটরসাইকেল মেকানিক' | 'অন্যান্য';
  otherSkills?: string[];
  experience: number;
  contactPhone: string;
  contactWhatsApp?: string;
  contactEmail?: string;
  showPhone: boolean;
  showWhatsApp: boolean;
  union: string;
  village: string;
  serviceArea: string;
  availabilityStatus: 'available' | 'need_booking' | 'unavailable';
  workingHours?: string;
  availableDays?: string[];
  emergencyService: boolean;
  emergencyService24h?: boolean;
  about: string;
  serviceDescription: string;
  services?: SkilledWorkerService[];
  gallery?: SkilledWorkerGalleryItem[];
  rating?: number;
  reviewCount?: number;
  reviewsList?: SkilledWorkerReview[];
  reportsList?: SkilledWorkerReport[];
  isVerified: boolean;
  verificationStatus: 'pending' | 'under_review' | 'verified' | 'rejected' | 'suspended' | 'archived';
  verifiedAt?: string;
  verifiedBy?: string;
  adminNotes?: string;
  userId: string;
  views?: number;
  createdAt: string;
}

// ==========================================
// Internet (ইন্টারনেট) Module Types
// ==========================================

export interface InternetPackage {
  id: string;
  name: string;
  speed: string; // e.g. "20 Mbps"
  price: number; // monthly price in Taka
  installationFee?: number;
  connectionType: 'Fiber' | 'Wireless' | 'Other';
  dataLimit?: string; // e.g. "Unlimited" or "500 GB"
  isActive: boolean;
  availability: string;
}

export interface InternetCoverage {
  upazila: string;
  union: string;
  village: string;
  area: string;
  isVerified: boolean;
}

export interface InternetScheduleItem {
  day: string; // e.g., "শনিবার"
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

export interface InternetReview {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface InternetReport {
  id: string;
  providerId: string;
  reporterId: string;
  reporterName: string;
  reporterPhone?: string;
  reportType: 'ভুল তথ্য' | 'ভুল ফোন' | 'ভুল ঠিকানা' | 'ভুল প্যাকেজ' | 'সেবা বন্ধ' | 'ভুল কভারেজ' | 'ভুয়া প্রতিষ্ঠান' | 'অন্যান্য';
  details: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface InternetProvider {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  description: string;
  serviceType: 'Broadband' | 'Fiber' | 'Wi-Fi' | 'Home Internet' | 'Business Internet' | 'Network Service' | 'Installation' | 'Support';
  connectionType: 'Fiber' | 'Wireless' | 'Other';
  
  // Contacts
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  facebook?: string;

  // Location
  union: string;
  village: string;
  address: string;
  mapLocation?: string; // direction link / coord

  // Relations/Data
  categories: string[]; // e.g. ["ব্রডব্যান্ড", "ফাইবার"]
  services: string[]; // e.g. ["New Connection", "Installation", "Technical Support"]
  packages: InternetPackage[];
  coverage: InternetCoverage[];
  schedule: InternetScheduleItem[];
  
  // Stats & Status
  rating?: number;
  reviewCount?: number;
  views?: number;
  isVerified: boolean;
  verificationStatus: 'pending' | 'under_review' | 'verified' | 'rejected' | 'suspended' | 'archived';
  verifiedAt?: string;
  verifiedBy?: string;
  
  userId: string; // owner
  createdAt: string;
  updatedAt?: string;
  reviewsList?: InternetReview[];
}



// --- Chat & Messaging Types ---
export interface UserInfo {
  uid: string;
  name: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: number;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  participantDetails: Record<string, UserInfo>;
  lastMessage?: string;
  lastMessageTime?: number;
  lastMessageSenderId?: string;
  unreadCount?: Record<string, number>;
  createdAt: number;
  updatedAt: number;
  
  // Group specific
  name?: string;
  photoURL?: string;
  admins?: string[];
  description?: string;

  // Privacy & Message Requests
  requestStatus?: 'pending' | 'accepted' | 'declined';
  requestedBy?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'file' | 'link' | 'system' | 'location';
  mediaUrl?: string;
  mediaType?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  caption?: string;
  
  status: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
  deliveredTo?: string[];
  seenBy?: string[];
  seenAt?: number;
  readAt?: number;
  readBy?: Record<string, number>;
  
  timestamp: number;
  isEdited?: boolean;
  isDeleted?: boolean;
  
  reactions?: Record<string, string>;
  replyToId?: string;
  forwardedFrom?: string;
}

// --- Reels & Short Videos Types ---
export type ReelReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface Reel {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  isVerified?: boolean;
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  title?: string;
  hashtags: string[];
  mentions: string[];
  location?: string;
  audioTitle: string;
  audioUrl?: string;
  originalAudio: boolean;
  audioAuthor?: string;
  duration: number;
  privacy: 'public' | 'friends' | 'followers' | 'only_me';
  viewsCount: number;
  likesCount: number;
  reactionsCount: number;
  reactions?: Record<string, ReelReactionType>;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  savedBy?: string[];
  likedBy?: string[];
  status: 'published' | 'processing' | 'draft' | 'archived';
  createdAt: number;
  updatedAt?: number;
  watchTimeTotal?: number;
  completionCount?: number;
  videoFilter?: string;
  playbackSpeed?: number;
  textOverlays?: {
    id: string;
    text: string;
    color: string;
    fontSize: number;
    x: number;
    y: number;
  }[];
}

export interface ReelComment {
  id: string;
  reelId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: number;
  likes: number;
  likedBy?: string[];
  parentId?: string;
  repliesCount?: number;
  reactions?: Record<string, string>;
}

export interface ReelAudio {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  duration: number;
  category: 'popular' | 'trending' | 'folk' | 'islamic' | 'instrumental' | 'ambient';
  coverUrl?: string;
  useCount: number;
  isTrending?: boolean;
  createdAt: number;
}

export interface ReelRulesConfig {
  maxDuration: number;
  maxFileSizeMB: number;
  allowedFormats: string[];
  allowOriginalAudio: boolean;
  allowComments: boolean;
  allowDownloads: boolean;
}

export interface ReelAnalyticsData {
  reelId: string;
  viewsCount: number;
  uniqueViewers: number;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  averageWatchTime: number;
  completionRate: number;
  trafficSources?: {
    feed: number;
    explore: number;
    profile: number;
    direct: number;
  };
}
