import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  increment, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage, handleFirestoreError, OperationType } from './firebase';
import { getFallbackData } from './data/directoryFallbackData';
import { 
  LostFoundNotice, 
  SocialEvent, 
  VolunteerActivity, 
  LocalIssue, 
  MarketplaceItem, 
  Complaint, 
  Feedback, 
  ToLetAd, 
  NoticeItem, 
  AppSettings, 
  Poll, 
  Vote, 
  EventRegistration, 
  Business, 
  Product,
  Review,
  Category,
  ServiceApplication,
  HealthService,
  BloodDonor,
  MarketPrice,
  AgriNotice,
  WeatherAlert,
  PageView,
  SearchEvent,
  AnalyticsSummary,
  Report,
  UserPost,
  SiteSettings,
  ContactMessage,
  Comment,
  BusStand,
  BusStandFilters,
  BusStandReport,
  BusCounter,
  BusRouteInfo,
  Train,
  TrainFilters,
  TrainReport,
  RailwayStation,
  TrainScheduleItem,
  TrainRouteTimelineNode,
  TrainFareInfo,
  Entrepreneur,
  EntrepreneurReview,
  EntrepreneurReport,
  EntrepreneurProduct,
  EntrepreneurServiceItem,
  EntrepreneurScheduleItem,
  InternetProvider,
  InternetPackage,
  InternetCoverage,
  InternetReview,
  InternetReport
} from './types';

export type { 
  LostFoundNotice, 
  SocialEvent, 
  VolunteerActivity, 
  LocalIssue, 
  MarketplaceItem, 
  Complaint, 
  Feedback, 
  ToLetAd, 
  NoticeItem, 
  AppSettings, 
  Poll, 
  Vote, 
  EventRegistration, 
  Business, 
  Product,
  Review,
  Category,
  ServiceApplication,
  HealthService,
  BloodDonor,
  MarketPrice,
  AgriNotice,
  WeatherAlert,
  PageView,
  SearchEvent,
  AnalyticsSummary,
  Report,
  UserPost,
  SiteSettings,
  ContactMessage,
  Comment,
  BusStand,
  BusStandFilters,
  BusStandReport,
  BusCounter,
  BusRouteInfo,
  Train,
  TrainFilters,
  TrainReport,
  RailwayStation,
  TrainScheduleItem,
  TrainRouteTimelineNode,
  TrainFareInfo,
  Entrepreneur,
  EntrepreneurReview,
  EntrepreneurReport,
  InternetProvider as TypeInternetProvider,
  InternetPackage as TypeInternetPackage,
  InternetCoverage as TypeInternetCoverage,
  InternetReview as TypeInternetReview,
  InternetReport as TypeInternetReport
};

export interface TouristSpot {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  rating: number;
  expiryDate: string;
  category: string;
  phone: string;
  mapUrl: string;
  type: 'partner' | 'offer' | 'topBanner';
  link: string;
}

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  slotType: 'top_banner' | 'partner';
  expiryDate?: string;
  order: number;
  createdAt: string;
}

export interface AdApplication {
  id: string;
  businessName: string;
  duration: string;
  paymentMethod: string;
  senderNumber: string;
  txId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  details?: string;
  phone?: string;
  contactName?: string;
  adType?: string;
}

const apiCache: Record<string, { data: any; timestamp: number }> = {};
const DEFAULT_TTL = 5 * 60 * 1000;

async function withCache<T>(key: string, fetchFn: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
  const cached = apiCache[key];
  const now = Date.now();
  if (cached && (now - cached.timestamp < ttl)) {
    fetchFn().then((freshData) => {
      apiCache[key] = { data: freshData, timestamp: Date.now() };
    }).catch(() => {});
    return cached.data;
  }
  const data = await fetchFn();
  apiCache[key] = { data, timestamp: Date.now() };
  return data;
}

export const clearApiCache = (key: string) => {
  delete apiCache[key];
};

export const prefetchCoreCollections = () => {
  setTimeout(() => {
    getNoticeItems().catch(() => {});
    getAds().catch(() => {});
    getSpecialOffers().catch(() => {});
    getTouristSpots().catch(() => {});
    getAllBusinesses().catch(() => {});
    getToLetAds().catch(() => {});
    getMarketplaceItems().catch(() => {});
    getAppSettings().catch(() => {});
    getLostFoundNotices().catch(() => {});
    getSocialEvents().catch(() => {});
    getVolunteerActivities().catch(() => {});
  }, 1000);
};

// Notice Items
export const getNoticeItems = async (): Promise<NoticeItem[]> => {
  const path = 'notice_items';
  return withCache(path, async () => {
    try {
      const snapshot = await getDocs(collection(db, path));
      const list: NoticeItem[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as NoticeItem);
      });
      return list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  });
};

export const onNoticesSnapshot = (callback: (notices: NoticeItem[]) => void) => {
  try {
    const q = query(collection(db, 'notice_items'));
    return onSnapshot(q, (snapshot) => {
      const list: NoticeItem[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as NoticeItem);
      });
      list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      callback(list);
    }, (error) => {
      callback([]);
    });
  } catch (error) {
    callback([]);
    return () => {};
  }
};

export const addNoticeItem = async (notice: Omit<NoticeItem, 'id'>) => {
  const id = doc(collection(db, 'notice_items')).id;
  try {
    await setDoc(doc(db, 'notice_items', id), { id, ...notice });
    clearApiCache('notice_items');
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'notice_items');
    throw error;
  }
};

export const updateNoticeItem = async (id: string, notice: Partial<NoticeItem>) => {
  try {
    await updateDoc(doc(db, 'notice_items', id), notice);
    clearApiCache('notice_items');
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'notice_items');
    throw error;
  }
};

export const deleteNoticeItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'notice_items', id));
    clearApiCache('notice_items');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'notice_items');
    throw error;
  }
};

// App Settings
export const getAppSettings = async (): Promise<AppSettings> => {
  const path = 'app_settings/general';
  return withCache(path, async () => {
    try {
      const docSnap = await getDoc(doc(db, 'app_settings', 'general'));
      if (docSnap.exists()) {
        return docSnap.data() as AppSettings;
      }
      return {
        appName: 'ঐতিহাসিক পুঠিয়া',
        helplineNumber: '৯৯৯',
        logoUrl: '',
        facebookPage: '',
        facebookGroup: '',
        updatePopupEnabled: false,
        playStoreLink: '',
        todaysPuthia: {
          weather: '',
          prayerTime: '',
          event: '',
          news: '',
          notice: '',
          marketPrice: ''
        },
        siteName: 'পুঠিয়া ডিজিটাল পোর্টাল',
        emergencyHotline: '৯৯৯',
        policeHotline: '০১৭০০০০০০০০',
        ambulanceHotline: '০১৮০০০০০০০০',
        fireHotline: '০১৯০০০০০০০০',
        heroTitle: 'স্মার্ট পুঠিয়া, উন্নত জীবন',
        heroSubtitle: 'পুঠিয়া উপজেলার সকল সেবা, তথ্য ও যোগাযোগ এক ঠিকানায়।',
        aboutText: 'পুঠিয়া উপজেলার সকল নাগরিক সেবা এক ডিজিটালাইজড প্ল্যাটফর্মে নিয়ে আসার উদ্যোগ।'
      } as any;
    } catch (error) {
      return {
        appName: 'ঐতিহাসিক পুঠিয়া',
        helplineNumber: '৯৯৯',
        logoUrl: '',
        facebookPage: '',
        facebookGroup: '',
        updatePopupEnabled: false,
        playStoreLink: '',
        todaysPuthia: {
          weather: '',
          prayerTime: '',
          event: '',
          news: '',
          notice: '',
          marketPrice: ''
        },
        siteName: 'পুঠিয়া ডিজিটাল পোর্টাল',
        emergencyHotline: '৯৯৯',
        policeHotline: '০১৭০০০০০০০০',
        ambulanceHotline: '০১৮০০০০০০০০',
        fireHotline: '০১৯০০০০০০০০',
        heroTitle: 'স্মার্ট পুঠিয়া, উন্নত জীবন',
        heroSubtitle: 'পুঠিয়া উপজেলার সকল সেবা, তথ্য ও যোগাযোগ এক ঠিকানায়।'
      } as any;
    }
  });
};

export const updateAppSettings = async (settings: Partial<AppSettings>) => {
  try {
    await setDoc(doc(db, 'app_settings', 'general'), settings, { merge: true });
    clearApiCache('app_settings/general');
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'app_settings/general');
    throw error;
  }
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const path = 'site_settings/main';
  return withCache(path, async () => {
    try {
      const docSnap = await getDoc(doc(db, 'site_settings', 'main'));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as SiteSettings;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    return {
      id: 'main',
      siteName: "ঐতিহাসিক পুঠিয়া",
      siteLogoUrl: "",
      headerText: "ঐতিহাসিক পুঠিয়া অনলাইন পোর্টাল",
      footerText: "© ২০২৪ ঐতিহাসিক পুঠিয়া। সর্বস্বত্ব সংরক্ষিত।",
      contactPhone: "017XXXXXXXX",
      contactEmail: "info@puthia.gov.bd",
      contactAddress: "পুঠিয়া, রাজশাহী",
      socialLinks: {
        facebook: "",
        twitter: "",
        youtube: "",
        instagram: ""
      },
      seoTitle: "ঐতিহাসিক পুঠিয়া - রাজশাহী",
      seoDescription: "পুঠিয়ার ইতিহাস, ঐতিহ্য এবং নাগরিক সেবার ডিজিটাল প্ল্যাটফর্ম।",
      googleMapsApiKey: "",
      pushNotificationKey: "",
      isMaintenanceMode: false,
      updatedAt: new Date().toISOString()
    } as SiteSettings;
  });
};

export const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
  try {
    const settingsRef = doc(db, 'site_settings', 'main');
    const oldSnap = await getDoc(settingsRef);
    const oldData = oldSnap.exists() ? oldSnap.data() as SiteSettings : {} as SiteSettings;

    await setDoc(settingsRef, settings, { merge: true });

    // Compare and calculate changes diff
    const changes: Record<string, { old: any; new: any }> = {};
    Object.entries(settings).forEach(([key, value]) => {
      if (key !== 'updatedAt' && key !== 'id') {
        const oldVal = (oldData as any)[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(value)) {
          changes[key] = {
            old: oldVal !== undefined ? oldVal : '',
            new: value
          };
        }
      }
    });

    if (Object.keys(changes).length > 0) {
      try {
        const { logAuditActivity } = await import('./services/auditLogger');
        await logAuditActivity({
          action: 'ওয়েবসাইট সেটিংস সংশোধন',
          details: `সাইট কনফিগারেশন পরিবর্তন করা হয়েছে (${Object.keys(changes).join(', ')})`,
          category: 'system',
          severity: 'warning',
          changes
        });
      } catch (innerErr) {
        console.warn('Non-blocking: Failed to log site settings audit trail:', innerErr);
      }
    }
  } catch (error) {
    console.error("Error updateSiteSettings:", error);
  }
};

// Ads
export const getAds = async () => {
  const path = 'ads';
  return withCache(path, async () => {
    try {
      const querySnapshot = await getDocs(collection(db, path));
      const ads: Ad[] = [];
      querySnapshot.forEach((doc) => {
        ads.push({ id: doc.id, ...doc.data() } as Ad);
      });
      return ads.sort((a, b) => a.order - b.order);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  });
};

export const saveAd = async (ad: Ad) => {
  try {
    await setDoc(doc(db, 'ads', ad.id), ad);
    clearApiCache('ads');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `ads/${ad.id}`);
    throw error;
  }
};

export const deleteAd = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'ads', id));
    clearApiCache('ads');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `ads/${id}`);
    throw error;
  }
};

// Tourist Spots
export const getTouristSpots = async () => {
  const path = 'tourist_spots';
  return withCache(path, async () => {
    try {
      const querySnapshot = await getDocs(collection(db, path));
      const spots: TouristSpot[] = [];
      querySnapshot.forEach((doc) => {
        spots.push(doc.data() as TouristSpot);
      });
      return spots.sort((a, b) => a.order - b.order);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  });
};

export const saveTouristSpot = async (spot: TouristSpot) => {
  try {
    await setDoc(doc(db, 'tourist_spots', spot.id), spot);
    clearApiCache('tourist_spots');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `tourist_spots/${spot.id}`);
  }
};

export const deleteTouristSpot = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'tourist_spots', id));
    clearApiCache('tourist_spots');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `tourist_spots/${id}`);
  }
};

// Special Offers
export const getSpecialOffers = async () => {
  const path = 'special_offers';
  return withCache(path, async () => {
    try {
      const querySnapshot = await getDocs(collection(db, path));
      const offers: SpecialOffer[] = [];
      querySnapshot.forEach((doc) => {
        offers.push(doc.data() as SpecialOffer);
      });
      return offers;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  });
};

export const saveSpecialOffer = async (offer: SpecialOffer) => {
  try {
    await setDoc(doc(db, 'special_offers', offer.id), offer);
    clearApiCache('special_offers');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `special_offers/${offer.id}`);
  }
};

export const deleteSpecialOffer = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'special_offers', id));
    clearApiCache('special_offers');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `special_offers/${id}`);
  }
};

// Ad Applications
export const getAdApplications = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'ad_applications'));
    const apps: AdApplication[] = [];
    querySnapshot.forEach((doc) => {
      apps.push({ id: doc.id, ...doc.data() } as AdApplication);
    });
    return apps;
  } catch (error) {
    return [];
  }
};

export const updateAdApplicationStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    await updateDoc(doc(db, 'ad_applications', id), { status });
  } catch (error) {}
};

export const addAdApplication = async (app: Omit<AdApplication, 'id' | 'status' | 'createdAt'>) => {
  const appId = doc(collection(db, 'ad_applications')).id;
  const newApp: AdApplication = {
    id: appId,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0],
    ...app
  };
  await setDoc(doc(db, 'ad_applications', appId), newApp);
  return newApp;
};

// User Posts
export const addUserPost = async (post: Omit<UserPost, 'id' | 'createdAt' | 'status' | 'likes' | 'commentsCount' | 'views'>) => {
  const postId = doc(collection(db, 'user_posts')).id;
  const newPost: UserPost = {
    id: postId,
    createdAt: new Date().toISOString(),
    status: 'pending',
    likes: 0,
    commentsCount: 0,
    views: 0,
    ...post
  };
  await setDoc(doc(db, 'user_posts', postId), newPost);
  return newPost;
};

export const getUserPosts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'user_posts'));
    const posts: UserPost[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as UserPost);
    });
    return posts;
  } catch (error) {
    return [];
  }
};

export const updateUserPost = async (id: string, data: Partial<UserPost>) => {
  await updateDoc(doc(db, 'user_posts', id), data);
};

export const updateUserPostStatus = async (id: string, status: 'approved' | 'rejected') => {
  await updateDoc(doc(db, 'user_posts', id), { status });
};

export const deleteUserPost = async (id: string) => {
  await deleteDoc(doc(db, 'user_posts', id));
};

export const getUserPostsByUserId = async (userId: string): Promise<UserPost[]> => {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'user_posts'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const list: UserPost[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as UserPost);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    return [];
  }
};

export const getBusinessesByUserId = async (userId: string): Promise<Business[]> => {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'businesses'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const list: Business[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Business);
    });
    return list;
  } catch (error) {
    return [];
  }
};

// Favorites & Notifications & Bookings
export const toggleFavorite = async (userId: string, itemId: string, itemType: string, itemData: any) => {
  const favoriteId = `${userId}_${itemId}`;
  const favRef = doc(db, 'favorites', favoriteId);
  const docSnap = await getDoc(favRef);
  if (docSnap.exists()) {
    await deleteDoc(favRef);
    return false;
  } else {
    await setDoc(favRef, {
      id: favoriteId,
      userId,
      itemId,
      itemType,
      itemData,
      createdAt: new Date().toISOString()
    });
    return true;
  }
};

export const getFavorites = async (userId: string): Promise<any[]> => {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    return [];
  }
};

export const getNotifications = async (userId: string): Promise<any[]> => {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  } catch (error) {}
};

export const getUsersBookings = async (userId: string): Promise<EventRegistration[]> => {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'event_registrations'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const list: EventRegistration[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as EventRegistration);
    });
    return list;
  } catch (error) {
    return [];
  }
};

export const getEventDetails = async (eventId: string): Promise<SocialEvent | null> => {
  try {
    const docRef = doc(db, 'social_events', eventId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SocialEvent;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const registerForEvent = async (registration: Omit<EventRegistration, 'id'>) => {
  const registrationId = `${registration.userId}_${registration.eventId}`;
  const regRef = doc(db, 'event_registrations', registrationId);
  await setDoc(regRef, { id: registrationId, ...registration });
  return registrationId;
};

export const getEventUserRegistration = async (eventId: string, userId: string): Promise<EventRegistration | null> => {
  const registrationId = `${userId}_${eventId}`;
  try {
    const docRef = doc(db, 'event_registrations', registrationId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as EventRegistration;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Polls
export const submitVote = async (vote: Omit<Vote, 'id'>) => {
  const voteId = `${vote.userId}_${vote.pollId}`;
  await setDoc(doc(db, 'votes', voteId), { id: voteId, ...vote });
  const pollRef = doc(db, 'polls', vote.pollId);
  await updateDoc(pollRef, {
    [`votes.${vote.optionIndex}`]: increment(1),
    totalVotes: increment(1)
  });
  return voteId;
};

export const getUserVote = async (pollId: string, userId: string): Promise<Vote | null> => {
  const voteId = `${userId}_${pollId}`;
  try {
    const docSnap = await getDoc(doc(db, 'votes', voteId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Vote;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Businesses & Products
export const getAllBusinesses = async (): Promise<Business[]> => {
  const path = 'businesses';
  return withCache(path, async () => {
    try {
      const querySnapshot = await getDocs(collection(db, path));
      const list: Business[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Business);
      });
      return list;
    } catch (error) {
      return [];
    }
  });
};

export const getUsersBusinesses = async (userId: string): Promise<Business[]> => {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'businesses'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const list: Business[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Business);
    });
    return list;
  } catch (error) {
    return [];
  }
};

export const addBusiness = async (business: Omit<Business, 'id' | 'createdAt' | 'status'>) => {
  const businessId = doc(collection(db, 'businesses')).id;
  const newBusiness: Business = {
    id: businessId,
    createdAt: new Date().toISOString(),
    ...business,
    status: 'pending'
  };
  await setDoc(doc(db, 'businesses', businessId), newBusiness);
  clearApiCache('businesses');
  return newBusiness;
};

export const updateBusinessStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
  await updateDoc(doc(db, 'businesses', id), { status, updatedAt: new Date().toISOString() });
  clearApiCache('businesses');
};

export const toggleBusinessVerification = async (id: string, isVerified: boolean) => {
  await updateDoc(doc(db, 'businesses', id), { isVerified, updatedAt: new Date().toISOString() });
  clearApiCache('businesses');
};

export const toggleBusinessFeatured = async (id: string, isFeatured: boolean) => {
  await updateDoc(doc(db, 'businesses', id), { isFeatured, updatedAt: new Date().toISOString() });
  clearApiCache('businesses');
};

export const getBusinessCategories = async (): Promise<Category[]> => {
  const path = 'business_categories';
  return withCache(path, async () => {
    try {
      const querySnapshot = await getDocs(collection(db, path));
      const list: Category[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Category);
      });
      return list;
    } catch (error) {
      return [];
    }
  });
};

export const addBusinessCategory = async (label: string) => {
  const id = doc(collection(db, 'business_categories')).id;
  const newCategory: Category = { id, label, itemIds: [], items: [] };
  await setDoc(doc(db, 'business_categories', id), newCategory);
  clearApiCache('business_categories');
  return newCategory;
};

export const deleteBusinessCategory = async (id: string) => {
  await deleteDoc(doc(db, 'business_categories', id));
  clearApiCache('business_categories');
};

export const updateBusiness = async (id: string, updates: Partial<Business>) => {
  await updateDoc(doc(db, 'businesses', id), { ...updates, updatedAt: new Date().toISOString() });
  clearApiCache('businesses');
};

export const deleteBusiness = async (id: string) => {
  await deleteDoc(doc(db, 'businesses', id));
  clearApiCache('businesses');
};

export const getUsersProducts = async (userId: string): Promise<Product[]> => {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'products'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const list: Product[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Product);
    });
    return list;
  } catch (error) {
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
  const productId = doc(collection(db, 'products')).id;
  const newProduct: Product = { id: productId, createdAt: new Date().toISOString(), ...product };
  await setDoc(doc(db, 'products', productId), newProduct);
  return newProduct;
};

export const updateProductStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
  await updateDoc(doc(db, 'products', id), { status });
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  await updateDoc(doc(db, 'products', id), updates);
};

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, 'products', id));
};

// Comments
export const addComment = async (comment: Omit<Comment, 'id' | 'createdAt'>) => {
  const id = doc(collection(db, 'comments')).id;
  const newComment = { id, createdAt: serverTimestamp(), ...comment, pinned: false };
  await setDoc(doc(db, 'comments', id), newComment);
  await updateDoc(doc(db, 'user_posts', comment.postId), { commentsCount: increment(1) });
  return newComment;
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const q = query(collection(db, 'comments'), where('postId', '==', postId));
    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() } as Comment);
    });
    return comments;
  } catch (error) {
    return [];
  }
};

export const updateComment = async (id: string, text: string) => {
  await updateDoc(doc(db, 'comments', id), { text });
};

export const deleteComment = async (id: string, postId: string) => {
  await deleteDoc(doc(db, 'comments', id));
  await updateDoc(doc(db, 'user_posts', postId), { commentsCount: increment(-1) });
};

export const pinComment = async (id: string, pinned: boolean) => {
  await updateDoc(doc(db, 'comments', id), { pinned });
};

// Lost & Found, Social Events, Volunteer, Issues, Marketplace, Complaints, Feedback, ToLet
export const getLostFoundNotices = async (): Promise<LostFoundNotice[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'lost_found'));
    const list: LostFoundNotice[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as LostFoundNotice));
    return list;
  } catch (e) { return []; }
};

export const addLostFoundNotice = async (notice: Omit<LostFoundNotice, 'id'>) => {
  const id = doc(collection(db, 'lost_found')).id;
  await setDoc(doc(db, 'lost_found', id), { id, ...notice });
};

export const deleteLostFoundNotice = async (id: string) => {
  await deleteDoc(doc(db, 'lost_found', id));
};

export const getSocialEvents = async (): Promise<SocialEvent[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'social_events'));
    const list: SocialEvent[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as SocialEvent));
    return list;
  } catch (e) { return []; }
};

export const addSocialEvent = async (event: Omit<SocialEvent, 'id'>) => {
  const id = doc(collection(db, 'social_events')).id;
  await setDoc(doc(db, 'social_events', id), { id, ...event });
};

export const deleteSocialEvent = async (id: string) => {
  await deleteDoc(doc(db, 'social_events', id));
};

export const getVolunteerActivities = async (): Promise<VolunteerActivity[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'volunteer_activities'));
    const list: VolunteerActivity[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as VolunteerActivity));
    return list;
  } catch (e) { return []; }
};

export const addVolunteerActivity = async (act: Omit<VolunteerActivity, 'id'>) => {
  const id = doc(collection(db, 'volunteer_activities')).id;
  await setDoc(doc(db, 'volunteer_activities', id), { id, ...act });
};

export const enrollVolunteer = async (activityId: string, name: string, phone: string, existingList: string[]) => {
  const updatedVolunteers = [...(existingList || []), `${name} (${phone})`];
  await updateDoc(doc(db, 'volunteer_activities', activityId), { volunteers: updatedVolunteers, volunteerCount: updatedVolunteers.length });
};

export const deleteVolunteerActivity = async (id: string) => {
  await deleteDoc(doc(db, 'volunteer_activities', id));
};

export const getLocalIssues = async (): Promise<LocalIssue[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'local_issues'));
    const list: LocalIssue[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as LocalIssue));
    return list;
  } catch (e) { return []; }
};

export const addLocalIssue = async (issue: Omit<LocalIssue, 'id'>) => {
  const id = doc(collection(db, 'local_issues')).id;
  await setDoc(doc(db, 'local_issues', id), { id, ...issue });
};

export const upvoteLocalIssue = async (issueId: string, currentUpvotes: number, upvotedUsers: string[], userKey: string) => {
  const updatedUsers = [...(upvotedUsers || []), userKey];
  await updateDoc(doc(db, 'local_issues', issueId), { upvotes: currentUpvotes + 1, upvotedUsers: updatedUsers });
};

export const deleteLocalIssue = async (id: string) => {
  await deleteDoc(doc(db, 'local_issues', id));
};

export const getMarketplaceItems = async (): Promise<MarketplaceItem[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'marketplace_items'));
    const list: MarketplaceItem[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as MarketplaceItem));
    return list;
  } catch (e) { return []; }
};

export const addMarketplaceItem = async (item: Omit<MarketplaceItem, 'id'>) => {
  const id = doc(collection(db, 'marketplace_items')).id;
  await setDoc(doc(db, 'marketplace_items', id), { id, ...item });
};

export const deleteMarketplaceItem = async (id: string) => {
  await deleteDoc(doc(db, 'marketplace_items', id));
};

export const updateMarketplaceItemStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
  await updateDoc(doc(db, 'marketplace_items', id), { status });
};

export const toggleMarketplaceItemFeatured = async (id: string, isFeatured: boolean) => {
  await updateDoc(doc(db, 'marketplace_items', id), { isFeatured });
};

export const getComplaints = async (): Promise<Complaint[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'complaints'));
    const list: Complaint[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Complaint));
    return list;
  } catch (e) { return []; }
};

export const addComplaint = async (complaint: Omit<Complaint, 'id'>) => {
  const id = doc(collection(db, 'complaints')).id;
  await setDoc(doc(db, 'complaints', id), { id, ...complaint });
  return id;
};

export const updateComplaint = async (id: string, updates: Partial<Complaint>) => {
  await updateDoc(doc(db, 'complaints', id), updates);
};

export const deleteComplaint = async (id: string) => {
  await deleteDoc(doc(db, 'complaints', id));
};

export const getFeedbacks = async (): Promise<Feedback[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'feedbacks'));
    const list: Feedback[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Feedback));
    return list;
  } catch (e) { return []; }
};

export const addFeedback = async (feedback: Omit<Feedback, 'id'>) => {
  const id = doc(collection(db, 'feedbacks')).id;
  await setDoc(doc(db, 'feedbacks', id), { id, ...feedback });
  return id;
};

export const deleteFeedback = async (id: string) => {
  await deleteDoc(doc(db, 'feedbacks', id));
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'contact_messages'));
    const list: ContactMessage[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as ContactMessage));
    return list;
  } catch (e) { return []; }
};

export const addContactMessage = async (msg: Omit<ContactMessage, 'id'>) => {
  const id = doc(collection(db, 'contact_messages')).id;
  await setDoc(doc(db, 'contact_messages', id), { id, ...msg });
  return id;
};

export const updateContactMessage = async (id: string, updates: Partial<ContactMessage>) => {
  await updateDoc(doc(db, 'contact_messages', id), updates);
};

export const deleteContactMessage = async (id: string) => {
  await deleteDoc(doc(db, 'contact_messages', id));
};

export const getToLetAds = async (): Promise<ToLetAd[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'to_let_ads'));
    const list: ToLetAd[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as ToLetAd));
    return list;
  } catch (e) { return []; }
};

export const updateToLetAd = async (id: string, updates: Partial<ToLetAd>) => {
  await updateDoc(doc(db, 'to_let_ads', id), updates);
};

export const updateToLetAdStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    await updateDoc(doc(db, 'to_let_ads', id), { status });
  } catch (error) {}
};

export const toggleToLetAdFeatured = async (id: string, isFeatured: boolean) => {
  try {
    await updateDoc(doc(db, 'to_let_ads', id), { isFeatured });
  } catch (error) {}
};

export const deleteToLetAd = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'to_let_ads', id));
  } catch (error) {}
};

export const incrementToLetAdViews = async (id: string) => {
  try {
    await updateDoc(doc(db, 'to_let_ads', id), { views: increment(1) });
  } catch (error) {}
};

export const incrementToLetAdCalls = async (id: string) => {
  try {
    await updateDoc(doc(db, 'to_let_ads', id), { calls: increment(1) });
  } catch (error) {}
};

export const incrementToLetAdSaves = async (id: string, shouldIncrement?: boolean) => {
  try {
    const amount = shouldIncrement === false ? -1 : 1;
    await updateDoc(doc(db, 'to_let_ads', id), { saves: increment(amount) });
  } catch (error) {}
};

export const getAllUsers = async (): Promise<any[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const list: any[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    return list;
  } catch (e: any) { 
    console.error("getAllUsers failed:", e);
    return []; 
  }
};

export const updateUserRole = async (userId: string, updates: string | any) => {
  const data = typeof updates === 'string' ? { role: updates } : updates;
  await updateDoc(doc(db, 'users', userId), data);
};

export const awardStarsToUser = async (userId: string, amount: number, reason?: string) => {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      stars: increment(amount),
      lastStarUpdate: new Date().toISOString(),
      lastStarReason: reason || 'তথ্য অনুমোদন'
    });
    
    try {
      const { logAuditActivity } = await import('./services/auditLogger');
      await logAuditActivity({
        action: 'ইস্টার প্রদান',
        details: `ব্যবহারকারীকে (${userId}) ${amount} ইস্টার প্রদান করা হয়েছে। কারণ: ${reason || 'তথ্য অনুমোদন'}`,
        category: 'system',
        severity: 'info'
      });
    } catch (e) {}
  } catch (error) {
    console.error("Error awarding stars:", error);
  }
};

export const deleteUserAccount = async (userId: string) => {
  await deleteDoc(doc(db, 'users', userId));
};

export const createUserAccount = async (userData: any) => {
  const newRef = doc(collection(db, 'users'));
  const uid = newRef.id;
  const newAccount = {
    uid,
    id: uid,
    name: userData.name || 'নতুন ব্যবহারকারী',
    email: userData.email || '',
    phone: userData.phone || '',
    role: userData.role || 'user',
    union: userData.union || 'পুঠিয়া পৌরসভা',
    village: userData.village || 'পুঠিয়া',
    nidStatus: userData.nidStatus || 'verified',
    isBlocked: false,
    permissions: userData.permissions || [],
    createdAt: new Date().toISOString()
  };
  await setDoc(newRef, newAccount);
  return newAccount;
};

export const addServiceApplication = async (app: any) => {
  const id = doc(collection(db, 'service_applications')).id;
  await setDoc(doc(db, 'service_applications', id), { id, ...app, createdAt: new Date().toISOString() });
  return id;
};

export const getServiceApplications = async (): Promise<any[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'service_applications'));
    const list: any[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    return list;
  } catch (e) { return []; }
};

export const updateServiceApplicationStatus = async (id: string, status: string, adminFeedback?: string) => {
  try {
    const updates: any = { status };
    if (adminFeedback !== undefined) {
      updates.adminFeedback = adminFeedback;
    }
    await updateDoc(doc(db, 'service_applications', id), updates);
  } catch (e) {}
};

// Entrepreneurs
export const INITIAL_ENTREPRENEURS: Entrepreneur[] = [
  {
    id: 'ent-1',
    slug: 'puthia-agro-farm',
    name: 'রফিকুল ইসলাম',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    mobile: '০১৭১২-৩৪৫৬৭৮',
    email: 'rafiqul.agro@gmail.com',
    businessName: 'পুঠিয়া এগ্রো ফার্ম',
    category: 'কৃষি',
    entrepreneurType: 'ব্যক্তিগত উদ্যোগ',
    businessType: 'অফলাইন',
    description: 'স্থানীয়ভাবে নিরাপদ ও বিষমুক্ত শাকসবজি ও ফলমূল উৎপাদন এবং পাইকারি ও খুচরা সরবরাহ।',
    shortBio: 'গত ১০ বছর ধরে পুঠিয়া অঞ্চলে আধুনিক ও জৈব পদ্ধতিতে কৃষি চাষাবাদ করে আসছেন।',
    services: [
      { id: 's1', name: 'জৈব সার সরবরাহ', description: 'খাঁটি ও পরীক্ষিত জৈব সার বিক্রি' },
      { id: 's2', name: 'কৃষি পরামর্শ', description: 'নতুন কৃষকদের জন্য আধুনিক চাষাবাদ বিষয়ক পরামর্শ' }
    ],
    products: [
      { id: 'p1', name: 'টাটকা আম ও লিচু', description: 'পুঠিয়ার বিখ্যাত বাগানের তাজা আম ও লিচু', price: '১২০ টাকা/কেজি' },
      { id: 'p2', name: 'বিষমুক্ত শাকসবজি', description: 'প্রতিদিন সকালে ক্ষেত থেকে তোলা তাজা সবজি', price: 'বাজার দর অনুযায়ী' }
    ],
    targetCustomers: 'স্থানীয় খুচরা ক্রেতা ও পাইকারি ব্যবসায়ীরা',
    operatingArea: 'পুঠিয়া উপজেলা ও রাজশাহী জেলা',
    establishedYear: '২০১৫',
    experienceYears: '১০ বছর',
    union: 'পুঠিয়া',
    village: 'শিবপুর',
    area: 'পুঠিয়া বাজার সংলগ্ন',
    address: 'শিবপুর রোড, পুঠিয়া, রাজশাহী',
    website: 'https://puthiaagro.com',
    facebook: 'https://facebook.com/puthiaagro',
    whatsapp: '01712345678',
    schedule: [
      { day: 'শনিবার', isOpen: true, openingTime: '০৮:০০', closingTime: '২০:০০' },
      { day: 'রবিবার', isOpen: true, openingTime: '০৮:০০', closingTime: '২০:০০' },
      { day: 'সোমবার', isOpen: true, openingTime: '০৮:০০', closingTime: '২০:০০' },
      { day: 'মঙ্গলবার', isOpen: true, openingTime: '০৮:০০', closingTime: '২০:০০' },
      { day: 'বুধবার', isOpen: true, openingTime: '০৮:০০', closingTime: '২০:০০' },
      { day: 'বৃহস্পতিবার', isOpen: true, openingTime: '০৮:০০', closingTime: '২০:০০' },
      { day: 'শুক্রবার', isOpen: false, openingTime: 'বন্ধ', closingTime: 'বন্ধ' }
    ],
    founderStory: {
      startedHow: 'ছোট পরিসরে পারিবারিক জমি দিয়ে শুরু করেছিলেন, যা আজ একটি সফল এগ্রো ফার্মে রূপ নিয়েছে।',
      challenges: 'প্রাথমিকভাবে মূলধন ও আধুনিক যন্ত্রপাতির ঘাটতি ছিল।',
      futureGoals: 'পুঠিয়ার কৃষি পণ্য দেশের গণ্ডি পেরিয়ে বিদেশে রপ্তানি করা।'
    },
    achievements: [
      { title: 'শ্রেষ্ঠ কৃষি উদ্যোক্তা পুরস্কার', year: '২০২২', organization: 'উপজেলা কৃষি অফিস, পুঠিয়া' }
    ],
    skills: ['আধুনিক কৃষি প্রযুক্তি', 'জৈব সার তৈরি', 'মাটি ব্যবস্থাপনা'],
    verificationStatus: 'verified',
    verifiedAt: '2024-01-15',
    verifiedBy: 'Admin',
    isFeatured: true,
    rating: 4.8,
    reviewCount: 24,
    views: 1250,
    createdAt: '2024-01-01'
  },
  {
    id: 'ent-2',
    slug: 'sarda-silk-and-cottage',
    name: 'নাজমা বেগম',
    profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
    mobile: '০১৮১৯-৮৭৬৫৪৩',
    email: 'najma.silk@gmail.com',
    businessName: 'সর্দা সিল্ক ও কুটির শিল্প',
    category: 'পোশাক',
    entrepreneurType: 'নারী উদ্যোক্তা',
    businessType: 'অনলাইন + অফলাইন',
    description: 'ঐতিহ্যবাহী রাজশাহী সিল্ক শাড়ি, থ্রিপিস এবং হস্তশিল্পের চমৎকার কালেকশন।',
    shortBio: 'নারীদের স্বাবলম্বী করতে এবং ঐতিহ্যবাহী সিল্ক শিল্প টিকিয়ে রাখতে কাজ করছেন।',
    services: [
      { id: 's1', name: 'কাস্টমাইজড শাড়ি ডিজাইন', description: 'পছন্দ অনুযায়ী শাড়িতে হাতের কাজ' },
      { id: 's2', name: 'সিল্ক ট্রেনিং', description: 'স্থানীয় নারীদের সেলাই ও কুটির শিল্পের প্রশিক্ষণ' }
    ],
    products: [
      { id: 'p1', name: 'রাজশাহী পিওর সিল্ক শাড়ি', description: 'খাঁটি সিল্কের চমৎকার নকশাদার শাড়ি', price: '৪,৫০০ - ১৫,০০০ টাকা' },
      { id: 'p2', name: 'হাতের কাজের থ্রিপিস', description: 'আরামদায়ক কটন ও জর্জেট থ্রিপিস', price: '১,৮০০ টাকা' }
    ],
    targetCustomers: 'দেশ ও দেশের বাইরের ফ্যাশন সচেতন ক্রেতারা',
    operatingArea: 'সর্দা, পুঠিয়া ও সারা দেশ',
    establishedYear: '২০১৮',
    experienceYears: '৭ বছর',
    union: 'বানেশ্বর',
    village: 'সর্দা বাজার',
    area: 'সর্দা রেলওয়ে স্টেশন সংলগ্ন',
    address: 'সর্দা বাজার, পুঠিয়া, রাজশাহী',
    website: 'https://sardasilk.com',
    facebook: 'https://facebook.com/sardasilk',
    instagram: 'https://instagram.com/sardasilk',
    whatsapp: '01819876543',
    schedule: [
      { day: 'শনিবার', isOpen: true, openingTime: '০৯:০০', closingTime: '২১:০০' },
      { day: 'রবিবার', isOpen: true, openingTime: '০৯:০০', closingTime: '২১:০০' },
      { day: 'সোমবার', isOpen: true, openingTime: '০৯:০০', closingTime: '২১:০০' },
      { day: 'মঙ্গলবার', isOpen: true, openingTime: '০৯:০০', closingTime: '২১:০০' },
      { day: 'বুধবার', isOpen: true, openingTime: '০৯:০০', closingTime: '২১:০০' },
      { day: 'বৃহস্পতিবার', isOpen: true, openingTime: '০৯:০০', closingTime: '২১:০০' },
      { day: 'শুক্রবার', isOpen: true, openingTime: '১৫:০০', closingTime: '২১:০০' }
    ],
    verificationStatus: 'verified',
    verifiedAt: '2024-02-10',
    verifiedBy: 'Admin',
    isFeatured: true,
    rating: 4.9,
    reviewCount: 42,
    views: 2100,
    createdAt: '2024-01-05'
  }
];

export const getEntrepreneurs = async (): Promise<Entrepreneur[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'entrepreneurs'));
    const list: Entrepreneur[] = [];
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Entrepreneur);
      });
    }
    return list;
  } catch (error) {
    return [];
  }
};

export const getEntrepreneurBySlug = async (slug: string): Promise<Entrepreneur | null> => {
  try {
    const q = query(collection(db, 'entrepreneurs'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Entrepreneur;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const addEntrepreneur = async (entrepreneurData: Omit<Entrepreneur, 'id' | 'createdAt' | 'verificationStatus'>): Promise<string> => {
  const id = 'ent-' + Date.now();
  const newEnt: Entrepreneur = {
    ...entrepreneurData,
    id,
    verificationStatus: 'pending',
    rating: 0,
    reviewCount: 0,
    views: 1,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'entrepreneurs', id), newEnt);
  return id;
};

export const seedEntrepreneursIfEmpty = async (): Promise<boolean> => {
  return false;
};

export const submitEntrepreneurReport = async (report: Omit<EntrepreneurReport, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  const id = 'rep-' + Date.now();
  const newReport: EntrepreneurReport = {
    ...report,
    id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'entrepreneur_reports', id), newReport);
  return id;
};

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

export const getSubMenuPage = async (slug: string): Promise<SubMenuPageData | null> => {
  try {
    const q = query(collection(db, 'sub_menu_pages'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as SubMenuPageData;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getAllSubMenuPages = async (): Promise<SubMenuPageData[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'sub_menu_pages'));
    const list: SubMenuPageData[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as SubMenuPageData));
    return list;
  } catch (e) { return []; }
};

export const updateSubMenuPage = async (id: string, updates: Partial<SubMenuPageData>) => {
  try {
    await updateDoc(doc(db, 'sub_menu_pages', id), updates);
  } catch (e) {}
};

export const logPageView = async (path: string, userId?: string) => {
  try {
    const docRef = doc(collection(db, 'page_views'));
    await setDoc(docRef, { id: docRef.id, path, timestamp: new Date().toISOString(), userId: userId || 'anonymous', device: navigator.userAgent });
  } catch (e) {}
};

export const logSearchEvent = async (queryStr: string, userId?: string) => {
  try {
    const docRef = doc(collection(db, 'search_events'));
    await setDoc(docRef, { id: docRef.id, query: queryStr, timestamp: new Date().toISOString(), userId: userId || 'anonymous' });
  } catch (e) {}
};

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  return {
    todayVisitors: 85,
    totalViews: 1250,
    popularPages: [{ path: '/bus', count: 250 }, { path: '/health', count: 180 }],
    weeklyVisits: [
      { date: 'Sun', count: 120 },
      { date: 'Mon', count: 150 },
      { date: 'Tue', count: 180 },
      { date: 'Wed', count: 220 },
      { date: 'Thu', count: 200 },
      { date: 'Fri', count: 170 },
      { date: 'Sat', count: 210 }
    ],
    searchCount: 320,
    popularSearches: [{ query: 'বাস', count: 45 }, { query: 'ডাক্তার', count: 30 }]
  };
};

export const submitEntrepreneurReview = async (review: Omit<EntrepreneurReview, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  const id = 'rev-' + Date.now();
  const newRev: EntrepreneurReview = {
    ...review,
    id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'entrepreneur_reviews', id), newRev);
  return id;
};

export const seedSampleDataIfEmpty = async () => {
  // Real data only - start with clean empty database state
  return;
};

export const getTrains = async (): Promise<Train[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'trains'));
    const list: Train[] = [];
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Train);
      });
    }
    return list;
  } catch (e) {
    return [];
  }
};

export const getTrainBySlug = async (slug: string): Promise<Train | null> => {
  try {
    const q = query(collection(db, 'trains'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Train;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const addTrain = async (train: Omit<Train, 'id'>) => {
  const id = 'tr-' + Date.now();
  await setDoc(doc(db, 'trains', id), { ...train, id, createdAt: new Date().toISOString() });
  return id;
};

export const reportTrain = async (report: Omit<TrainReport, 'id' | 'createdAt' | 'status'>) => {
  const id = 'rep-' + Date.now();
  await setDoc(doc(db, 'train_reports', id), { ...report, id, status: 'pending', createdAt: new Date().toISOString() });
  return id;
};

export const seedTrainsIfEmpty = async () => {
  return;
};

export const getRailwayStations = async (): Promise<RailwayStation[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'railway_stations'));
    const list: RailwayStation[] = [];
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as RailwayStation);
      });
    }
    return list;
  } catch (e) {
    return [];
  }
};

export const seedRailwayStationsIfEmpty = async () => {
  return;
};

export const getBusStands = async (): Promise<BusStand[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'bus_stands'));
    const list: BusStand[] = [];
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as BusStand);
      });
    }
    return list;
  } catch (e) {
    return [];
  }
};

export const addBusStand = async (stand: Omit<BusStand, 'id'>) => {
  const id = 'bs-' + Date.now();
  const newStand = { ...stand, id, createdAt: new Date().toISOString() };
  await setDoc(doc(db, 'bus_stands', id), newStand);
  return id;
};

export const reportBusStand = async (report: Omit<BusStandReport, 'id' | 'createdAt' | 'status'>) => {
  const id = 'rep-' + Date.now();
  await setDoc(doc(db, 'bus_stand_reports', id), { ...report, id, status: 'pending', createdAt: new Date().toISOString() });
  return id;
};

export const seedBusStandsIfEmpty = async () => {
  return;
};

export const getBusStandBySlug = async (slug: string): Promise<BusStand | null> => {
  try {
    const q = query(collection(db, 'bus_stands'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as BusStand;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const getHealthServices = async (): Promise<HealthService[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'health_services'));
    const list: HealthService[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as HealthService));
    return list;
  } catch (e) { return []; }
};

export const addHealthService = async (service: Omit<HealthService, 'id'>): Promise<string> => {
  const id = 'health-' + Date.now();
  await setDoc(doc(db, 'health_services', id), { id, ...service });
  return id;
};

export const updateHealthService = async (id: string, updates: Partial<HealthService>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'health_services', id), updates);
  } catch (e) {}
};

export const deleteHealthService = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'health_services', id));
  } catch (e) {}
};

export const getBloodDonors = async (): Promise<BloodDonor[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'blood_donors'));
    const list: BloodDonor[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as BloodDonor));
    return list;
  } catch (e) { return []; }
};

export const addBloodDonor = async (donor: Omit<BloodDonor, 'id'>): Promise<string> => {
  const id = 'donor-' + Date.now();
  await setDoc(doc(db, 'blood_donors', id), { id, ...donor });
  return id;
};

export const updateBloodDonor = async (id: string, updates: Partial<BloodDonor>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'blood_donors', id), updates);
  } catch (e) {}
};

export const deleteBloodDonor = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'blood_donors', id));
  } catch (e) {}
};

export const getMarketPrices = async (): Promise<MarketPrice[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'market_prices'));
    const list: MarketPrice[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as MarketPrice));
    return list;
  } catch (e) { return []; }
};

export const addMarketPrice = async (item: Omit<MarketPrice, 'id'>): Promise<string> => {
  const id = 'price-' + Date.now();
  await setDoc(doc(db, 'market_prices', id), { id, ...item });
  return id;
};

export const updateMarketPrice = async (id: string, updates: Partial<MarketPrice>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'market_prices', id), updates);
  } catch (e) {}
};

export const deleteMarketPrice = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'market_prices', id));
  } catch (e) {}
};

export const getAgriNotices = async (): Promise<AgriNotice[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'agri_notices'));
    const list: AgriNotice[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as AgriNotice));
    return list;
  } catch (e) { return []; }
};

export const addAgriNotice = async (notice: Omit<AgriNotice, 'id'>): Promise<string> => {
  const id = 'agri-' + Date.now();
  await setDoc(doc(db, 'agri_notices', id), { id, ...notice });
  return id;
};

export const updateAgriNotice = async (id: string, updates: Partial<AgriNotice>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'agri_notices', id), updates);
  } catch (e) {}
};

export const deleteAgriNotice = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'agri_notices', id));
  } catch (e) {}
};

export const getWeatherAlerts = async (): Promise<WeatherAlert[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'weather_alerts'));
    const list: WeatherAlert[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as WeatherAlert));
    return list;
  } catch (e) { return []; }
};

export const addWeatherAlert = async (alert: Omit<WeatherAlert, 'id'>): Promise<string> => {
  const id = 'weather-' + Date.now();
  await setDoc(doc(db, 'weather_alerts', id), { id, ...alert });
  return id;
};

export const updateWeatherAlert = async (id: string, updates: Partial<WeatherAlert>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'weather_alerts', id), updates);
  } catch (e) {}
};

export const deleteWeatherAlert = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'weather_alerts', id));
  } catch (e) {}
};

export const getServiceApplicationsByUserId = async (userId: string): Promise<any[]> => {
  try {
    const q = query(collection(db, 'service_applications'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const list: any[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    return list;
  } catch (e) { return []; }
};

export const compressImageToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Use JPEG format with 0.7 quality for good compression
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};

export const uploadFileToStorage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export const addToLetAd = async (ad: Omit<ToLetAd, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  const id = 'tolet-' + Date.now();
  const newAd: ToLetAd = {
    ...ad,
    id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'to_let_ads', id), newAd);
  return id;
};

export const seedEmergencyServicesIfEmpty = async (): Promise<boolean> => {
  return true;
};

export const seedPoliceStationsIfEmpty = async (): Promise<boolean> => {
  return true;
};

export const seedFireStationsIfEmpty = async (): Promise<boolean> => {
  return true;
};

export const getPoliceStations = async (filters?: any): Promise<any[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'police_stations'));
    let list: any[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    if (filters) {
      if (filters.union && filters.union !== 'all') {
        list = list.filter(item => item.union === filters.union);
      }
      if (filters.availability && filters.availability !== 'all') {
        list = list.filter(item => item.availability === filters.availability);
      }
      if (filters.isVerifiedOnly) {
        list = list.filter(item => item.isVerified);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        list = list.filter(item => 
          item.name?.toLowerCase().includes(q) || 
          item.stationName?.toLowerCase().includes(q) || 
          item.phone?.toLowerCase().includes(q)
        );
      }
    }
    return list;
  } catch (e) { return []; }
};

export const getPoliceStationBySlug = async (slug: string): Promise<any | null> => {
  try {
    const q = query(collection(db, 'police_stations'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  } catch (e) { return null; }
};

export const addPoliceStation = async (data: any): Promise<string> => {
  const id = 'police-' + Date.now();
  await setDoc(doc(db, 'police_stations', id), { id, ...data });
  return id;
};

export const reportPoliceStation = async (data: any): Promise<string> => {
  const id = 'police-rep-' + Date.now();
  await setDoc(doc(db, 'police_station_reports', id), { id, ...data, createdAt: new Date().toISOString() });
  return id;
};

export const INITIAL_POLICE_CONTACTS: any[] = [];
export const INITIAL_POLICE_SERVICES: any[] = [];

export const getFireStations = async (filters?: any): Promise<any[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'fire_stations'));
    let list: any[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    if (filters) {
      if (filters.union && filters.union !== 'all') {
        list = list.filter(item => item.union === filters.union);
      }
      if (filters.availability && filters.availability !== 'all') {
        list = list.filter(item => item.availability === filters.availability);
      }
      if (filters.isVerifiedOnly) {
        list = list.filter(item => item.isVerified);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        list = list.filter(item => 
          item.name?.toLowerCase().includes(q) || 
          item.stationName?.toLowerCase().includes(q) || 
          item.phone?.toLowerCase().includes(q)
        );
      }
    }
    return list;
  } catch (e) { return []; }
};

export const getFireStationBySlug = async (slug: string): Promise<any | null> => {
  try {
    const q = query(collection(db, 'fire_stations'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  } catch (e) { return null; }
};

export const addFireStation = async (data: any): Promise<string> => {
  const id = 'fire-' + Date.now();
  await setDoc(doc(db, 'fire_stations', id), { id, ...data });
  return id;
};

export const reportFireStation = async (data: any): Promise<string> => {
  const id = 'fire-rep-' + Date.now();
  await setDoc(doc(db, 'fire_station_reports', id), { id, ...data, createdAt: new Date().toISOString() });
  return id;
};

export const getEmergencyServices = async (filters?: any): Promise<any[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'emergency_services'));
    let list: any[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    if (filters) {
      if (filters.category && filters.category !== 'all') {
        list = list.filter(item => item.category === filters.category);
      }
      if (filters.union && filters.union !== 'all') {
        list = list.filter(item => item.union === filters.union);
      }
      if (filters.availability && filters.availability !== 'all') {
        list = list.filter(item => item.availability === filters.availability);
      }
      if (filters.isVerifiedOnly) {
        list = list.filter(item => item.isVerified);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        list = list.filter(item => 
          item.name?.toLowerCase().includes(q) || 
          item.description?.toLowerCase().includes(q) || 
          item.phone?.toLowerCase().includes(q)
        );
      }
    }
    return list;
  } catch (e) { return []; }
};

export const getEmergencyServiceBySlug = async (slug: string): Promise<any | null> => {
  try {
    const q = query(collection(db, 'emergency_services'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  } catch (e) { return null; }
};

export const addEmergencyService = async (data: any): Promise<string> => {
  const id = 'emerg-' + Date.now();
  await setDoc(doc(db, 'emergency_services', id), { id, ...data });
  return id;
};

export const reportEmergencyService = async (data: any): Promise<string> => {
  const id = 'emerg-rep-' + Date.now();
  await setDoc(doc(db, 'emergency_reports', id), { id, ...data, createdAt: new Date().toISOString() });
  return id;
};

export const requestAmbulance = async (data: any): Promise<string> => {
  const id = 'amb-req-' + Date.now();
  await setDoc(doc(db, 'ambulance_requests', id), { id, ...data, createdAt: new Date().toISOString() });
  return id;
};

export const getDashboardAnalytics = async () => {
  try {
    const [users, posts, businesses, products, complaints] = await Promise.all([
      getAllUsers(),
      getUserPosts(),
      getAllBusinesses(),
      getDocs(collection(db, 'products')).then(s => s.docs.map(d => d.data())),
      getComplaints()
    ]);
    return {
      totalUsers: users.length,
      totalPosts: posts.length,
      totalBusinesses: businesses.length,
      totalProducts: products.length,
      totalComplaints: complaints.length,
      activeUsers: users.length,
      pendingModeration: posts.filter((p: any) => p.status === 'pending').length + businesses.filter((b: any) => b.status === 'pending').length,
      dailyVisits: 120
    };
  } catch (e) {
    return {
      totalUsers: 0,
      totalPosts: 0,
      totalBusinesses: 0,
      totalProducts: 0,
      totalComplaints: 0,
      activeUsers: 0,
      pendingModeration: 0,
      dailyVisits: 0
    };
  }
};

export const getAuditLogs = async (limitCount?: number): Promise<any[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'audit_logs'));
    const list: any[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    if (limitCount) {
      return list.slice(0, limitCount);
    }
    return list;
  } catch (e) { return []; }
};

export const getModerationCounts = async () => {
  try {
    const [posts, businesses, reports, complaints] = await Promise.all([
      getUserPosts(),
      getAllBusinesses(),
      getPendingReports(),
      getComplaints()
    ]);
    return {
      posts: posts.filter((p: any) => p.status === 'pending').length,
      businesses: businesses.filter((b: any) => b.status === 'pending').length,
      reports: reports.filter((r: any) => r.status === 'pending').length,
      complaints: complaints.filter((c: any) => c.status === 'pending' || !c.status).length
    };
  } catch (e) {
    return { posts: 0, businesses: 0, reports: 0, complaints: 0 };
  }
};

export const getPendingUserPosts = async () => {
  try {
    const posts = await getUserPosts();
    return posts.filter((p: any) => p.status === 'pending');
  } catch (e) { return []; }
};

export const getPendingBusinesses = async () => {
  try {
    const businesses = await getAllBusinesses();
    return businesses.filter((b: any) => b.status === 'pending');
  } catch (e) { return []; }
};

export const getPendingReports = async (): Promise<any[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'reports'));
    const list: any[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    return list;
  } catch (e) { return []; }
};

export const getPendingComplaints = async () => {
  try {
    const complaints = await getComplaints();
    return complaints.filter((c: any) => c.status === 'pending' || !c.status);
  } catch (e) { return []; }
};

export const updateModerationStatus = async (type: string, id: string, status: string) => {
  try {
    if (type === 'post') {
      await updateDoc(doc(db, 'user_posts', id), { status });
    } else if (type === 'business') {
      await updateDoc(doc(db, 'businesses', id), { status });
    } else if (type === 'report') {
      await updateDoc(doc(db, 'reports', id), { status });
    } else if (type === 'complaint') {
      await updateDoc(doc(db, 'complaints', id), { status });
    }
  } catch (e) {}
};

export const getUserReviews = async (userId: string): Promise<any[]> => {
  try {
    const q = query(collection(db, 'reviews'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const list: any[] = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    return list;
  } catch (e) { return []; }
};

export const deleteReview = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'reviews', id));
  } catch (e) {}
};

// ==========================================================
// Internet (ইন্টারনেট) & Connectivity Directory API Operations
// ==========================================================

export const INITIAL_INTERNET_PROVIDERS: InternetProvider[] = [
  {
    id: 'isp-1',
    slug: 'puthia-online-express',
    name: 'পুঠিয়া অনলাইন এক্সপ্রেস',
    logoUrl: '',
    description: 'পুঠিয়া উপজেলার অন্যতম জনপ্রিয় ও নির্ভরযোগ্য স্থানীয় ইন্টারনেট সেবাদাতা প্রতিষ্ঠান। আমরা অত্যন্ত সাশ্রয়ী মূল্যে উচ্চগতির অপটিক্যাল ফাইবার ইন্টারনেট সংযোগ প্রদান করে আসছি।',
    serviceType: 'Broadband',
    connectionType: 'Fiber',
    phone: '০১৭৭৭-১১২২৩৩',
    whatsapp: '০১৭৭৭-১১২২৩৩',
    email: 'info@puthiaonline.com',
    website: 'https://puthiaonline.com',
    facebook: 'https://facebook.com/puthiaonline',
    union: 'পুঠিয়া',
    village: 'পুঠিয়া সদর',
    address: 'পুঠিয়া বাজার মসজিদ মার্কেট, ২য় তলা, পুঠিয়া, রাজশাহী',
    mapLocation: 'https://maps.google.com/?q=Puthia+Bazar',
    categories: ['ব্রডব্যান্ড', 'ফাইবার', 'হোম ইন্টারনেট'],
    services: ['নতুন সংযোগ', 'কর্পোরেট ইন্টারনেট', 'রাউটার কনফিগারেশন', 'আইটি সাপোর্ট', 'ফাইবার অপটিক রিপেয়ার'],
    packages: [
      {
        id: 'pkg-1-1',
        name: 'স্টুডেন্ট প্যাক',
        speed: '10 Mbps',
        price: 500,
        installationFee: 500,
        connectionType: 'Fiber',
        dataLimit: 'Unlimited',
        isActive: true,
        availability: '24 Hours'
      },
      {
        id: 'pkg-1-2',
        name: 'পপুলার প্যাক',
        speed: '20 Mbps',
        price: 700,
        installationFee: 500,
        connectionType: 'Fiber',
        dataLimit: 'Unlimited',
        isActive: true,
        availability: '24 Hours'
      },
      {
        id: 'pkg-1-3',
        name: 'সুপার ফাস্ট ফ্যামিলি',
        speed: '40 Mbps',
        price: 1000,
        installationFee: 0,
        connectionType: 'Fiber',
        dataLimit: 'Unlimited',
        isActive: true,
        availability: '24 Hours'
      }
    ],
    coverage: [
      { upazila: 'পুঠিয়া', union: 'পুঠিয়া', village: 'পুঠিয়া সদর', area: 'পুঠিয়া বাজার', isVerified: true },
      { upazila: 'পুঠিয়া', union: 'পুঠিয়া', village: 'কৃষ্ণপুর', area: 'কৃষ্ণপুর হাইস্কুল রোড', isVerified: true },
      { upazila: 'পুঠিয়া', union: 'বানেশ্বর', village: 'বানেশ্বর বাজার', area: 'বিআরটিসি স্ট্যান্ড সংলগ্ন', isVerified: true },
      { upazila: 'পুঠিয়া', union: 'জিউপাড়া', village: 'জিউপাড়া', area: 'জিউপাড়া ইউনিয়ন পরিষদ রোড', isVerified: true }
    ],
    schedule: [
      { day: 'শনিবার', isOpen: true, openingTime: '০৯:০০ AM', closingTime: '০৯:০০ PM' },
      { day: 'রবিবার', isOpen: true, openingTime: '০৯:০০ AM', closingTime: '০৯:০০ PM' },
      { day: 'সোমবার', isOpen: true, openingTime: '০৯:০০ AM', closingTime: '০৯:০০ PM' },
      { day: 'মঙ্গলবার', isOpen: true, openingTime: '০৯:০০ AM', closingTime: '০৯:০০ PM' },
      { day: 'বুধবার', isOpen: true, openingTime: '০৯:০০ AM', closingTime: '০৯:০০ PM' },
      { day: 'বৃহস্পতিবার', isOpen: true, openingTime: '০৯:০০ AM', closingTime: '০৯:০০ PM' },
      { day: 'শুক্রবার', isOpen: true, openingTime: '০৩:০০ PM', closingTime: '০৯:০০ PM' }
    ],
    rating: 4.8,
    reviewCount: 2,
    views: 450,
    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: '2024-01-10T12:00:00Z',
    verifiedBy: 'Admin',
    userId: 'default-admin',
    createdAt: '2024-01-01T00:00:00Z',
    reviewsList: [
      {
        id: 'rev-1-1',
        userId: 'user-1',
        userName: 'রাশেদ চৌধুরী',
        rating: 5,
        comment: 'প্যাকেজের গতি খুবই স্থিতিশীল। তাদের সার্ভিসও চমৎকার, বিশেষ করে কোনো সমস্যা হলে দ্রুত সমাধান করে দেয়।',
        createdAt: '2024-02-01T10:30:00Z',
        status: 'approved'
      },
      {
        id: 'rev-1-2',
        userId: 'user-2',
        userName: 'ফারজানা আক্তার',
        rating: 4,
        comment: 'বানেশ্বর বাজার এরিয়াতে আমি এই নেট ব্যবহার করছি, স্পিড বেশ ভালো। সাপোর্ট টিমের ব্যবহার অনেক চমৎকার।',
        createdAt: '2024-02-05T14:20:00Z',
        status: 'approved'
      }
    ]
  },
  {
    id: 'isp-2',
    slug: 'amber-it-puthia',
    name: 'আম্বার আইটি (পুঠিয়া শাখা)',
    logoUrl: '',
    description: 'দেশজুড়ে সুপরিচিত আইএসপি আম্বার আইটি-র পুঠিয়া শাখা। আমরা বাড়ি ও ব্যবসা প্রতিষ্ঠানের জন্য ডেডিকেটেড ক্যাশ সার্ভার সহ নিরবচ্ছিন্ন হাই স্পিড ব্রডব্যান্ড ইন্টারনেট সরবরাহ করে আসছি।',
    serviceType: 'Broadband',
    connectionType: 'Fiber',
    phone: '০৯৬১১-২২৩৩৪৪',
    whatsapp: '০১৭০০-০০০০০০',
    email: 'puthia@amberit.com.bd',
    website: 'https://amberit.com.bd',
    facebook: 'https://facebook.com/amberit',
    union: 'বানেশ্বর',
    village: 'বানেশ্বর',
    address: 'বানেশ্বর ট্রাফিক মোড়, ২য় তলা, পুঠিয়া, রাজশাহী',
    mapLocation: 'https://maps.google.com/?q=Baneshwar+Bazar',
    categories: ['ব্রডব্যান্ড', 'ফাইবার', 'ব্যবসায়িক ইন্টারনেট'],
    services: ['নতুন সংযোগ', 'কর্পোরেট ডেডিকেটেড ইন্টারনেট', 'ভিপিএন নেটওয়ার্ক', 'ক্যাশ সার্ভার এক্সেস'],
    packages: [
      {
        id: 'pkg-2-1',
        name: 'হোম আল্ট্রা ফাইবার',
        speed: '15 Mbps',
        price: 600,
        installationFee: 1000,
        connectionType: 'Fiber',
        dataLimit: 'Unlimited',
        isActive: true,
        availability: '24 Hours'
      },
      {
        id: 'pkg-2-2',
        name: 'স্মার্ট ফ্যামিলি প্লাস',
        speed: '25 Mbps',
        price: 800,
        installationFee: 500,
        connectionType: 'Fiber',
        dataLimit: 'Unlimited',
        isActive: true,
        availability: '24 Hours'
      },
      {
        id: 'pkg-2-3',
        name: 'বিজনেস প্রো ডেডিকেটেড',
        speed: '50 Mbps',
        price: 1500,
        installationFee: 0,
        connectionType: 'Fiber',
        dataLimit: 'Unlimited',
        isActive: true,
        availability: '24 Hours'
      }
    ],
    coverage: [
      { upazila: 'পুঠিয়া', union: 'বানেশ্বর', village: 'বানেশ্বর হাট', area: 'বানেশ্বর ট্রাফিক মোড়', isVerified: true },
      { upazila: 'পুঠিয়া', union: 'বানেশ্বর', village: 'খায়েরপুকুর', area: 'স্কুল সংলগ্ন', isVerified: true },
      { upazila: 'পুঠিয়া', union: 'পুঠিয়া', village: 'পুঠিয়া বাজার', area: 'উপজেলা গেট সংলগ্ন', isVerified: true }
    ],
    schedule: [
      { day: 'শনিবার', isOpen: true, openingTime: '১০:০০ AM', closingTime: '০৮:০০ PM' },
      { day: 'রবিবার', isOpen: true, openingTime: '১০:০০ AM', closingTime: '০৮:০০ PM' },
      { day: 'সোমবার', isOpen: true, openingTime: '১০:০০ AM', closingTime: '০৮:০০ PM' },
      { day: 'মঙ্গলবার', isOpen: true, openingTime: '১০:০০ AM', closingTime: '০৮:০০ PM' },
      { day: 'বুধবার', isOpen: true, openingTime: '১০:০০ AM', closingTime: '০৮:০০ PM' },
      { day: 'বৃহস্পতিবার', isOpen: true, openingTime: '১০:০০ AM', closingTime: '০৮:০০ PM' },
      { day: 'শুক্রবার', isOpen: false, openingTime: '', closingTime: '' }
    ],
    rating: 4.6,
    reviewCount: 1,
    views: 310,
    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: '2024-01-15T12:00:00Z',
    verifiedBy: 'Admin',
    userId: 'default-admin',
    createdAt: '2024-01-02T00:00:00Z',
    reviewsList: [
      {
        id: 'rev-2-1',
        userId: 'user-3',
        userName: 'আরিফুল ইসলাম',
        rating: 4,
        comment: 'প্যাকেজের রেট এবং বাফার ফ্রি ইউটিউব ডাউনলোড স্পিড খুবই ভালো। মাঝে মাঝে ঝড়ের সময় ক্যাবল কাটা পড়লে একটু সমস্যা হয়, তবে দ্রুত ঠিক করে দেয়।',
        createdAt: '2024-02-10T11:45:00Z',
        status: 'approved'
      }
    ]
  }
];

export const seedInternetProvidersIfEmpty = async () => {
  return;
};

export const getInternetProviders = async (filters?: {
  category?: string;
  union?: string;
  connectionType?: string;
  isVerifiedOnly?: boolean;
  searchQuery?: string;
}): Promise<InternetProvider[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'internet_providers'));
    let list: InternetProvider[] = [];
    
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as InternetProvider);
      });
    }

    if (filters) {
      if (filters.category && filters.category !== 'all') {
        list = list.filter(item => 
          item.categories?.includes(filters.category!) || 
          item.serviceType === filters.category
        );
      }
      if (filters.union && filters.union !== 'all') {
        list = list.filter(item => 
          item.union === filters.union || 
          item.coverage?.some(cov => cov.union === filters.union)
        );
      }
      if (filters.connectionType && filters.connectionType !== 'all') {
        list = list.filter(item => item.connectionType === filters.connectionType);
      }
      if (filters.isVerifiedOnly) {
        list = list.filter(item => item.isVerified);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        list = list.filter(item => 
          item.name?.toLowerCase().includes(q) || 
          item.description?.toLowerCase().includes(q) || 
          item.phone?.toLowerCase().includes(q) ||
          item.services?.some(s => s.toLowerCase().includes(q)) ||
          item.coverage?.some(c => c.village?.toLowerCase().includes(q) || c.area?.toLowerCase().includes(q)) ||
          item.packages?.some(p => p.name?.toLowerCase().includes(q) || p.speed?.toLowerCase().includes(q))
        );
      }
    }

    return list;
  } catch (e) {
    return [];
  }
};

export const getInternetProviderBySlug = async (slug: string): Promise<InternetProvider | null> => {
  try {
    const q = query(collection(db, 'internet_providers'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as InternetProvider;
    }
    
    // Check fallback by ID
    const docSnap = await getDoc(doc(db, 'internet_providers', slug));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as InternetProvider;
    }

    return null;
  } catch (e) {
    return null;
  }
};

export const addInternetProvider = async (provider: Omit<InternetProvider, 'id' | 'slug' | 'createdAt'>) => {
  const id = 'isp-' + Date.now();
  const slug = provider.name.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '-');
  const newProvider: InternetProvider = {
    ...provider,
    id,
    slug,
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'internet_providers', id), newProvider);
  clearApiCache('internet_providers');
  return id;
};

export const updateInternetProvider = async (id: string, provider: Partial<InternetProvider>) => {
  await updateDoc(doc(db, 'internet_providers', id), {
    ...provider,
    updatedAt: new Date().toISOString()
  });
  clearApiCache('internet_providers');
};

export const deleteInternetProvider = async (id: string) => {
  await deleteDoc(doc(db, 'internet_providers', id));
  clearApiCache('internet_providers');
};

export const submitInternetReport = async (report: Omit<InternetReport, 'id' | 'createdAt' | 'status'>) => {
  const id = 'isp-rep-' + Date.now();
  const newReport: InternetReport = {
    ...report,
    id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'internet_reports', id), newReport);
  return id;
};

export const addInternetReview = async (providerId: string, review: Omit<InternetReview, 'id' | 'createdAt' | 'status'>) => {
  const provider = await getInternetProviderBySlug(providerId);
  if (!provider) throw new Error('Provider not found');

  const id = 'rev-' + Date.now();
  const newReview: InternetReview = {
    ...review,
    id,
    status: 'approved',
    createdAt: new Date().toISOString()
  };

  const updatedReviews = provider.reviewsList ? [...provider.reviewsList, newReview] : [newReview];
  const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = parseFloat((totalRating / updatedReviews.length).toFixed(1));

  await updateDoc(doc(db, 'internet_providers', provider.id), {
    reviewsList: updatedReviews,
    rating: averageRating,
    reviewCount: updatedReviews.length
  });
  clearApiCache('internet_providers');
  return id;
};

export const submitInternetConnectionRequest = async (request: any) => {
  const id = 'conn-req-' + Date.now();
  await setDoc(doc(db, 'internet_connection_requests', id), {
    ...request,
    id,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  return id;
};

// Generic Collection Fetcher with Caching for Advanced Global Search
export const getGenericCollection = async (collectionName: string): Promise<any[]> => {
  return withCache(`generic_${collectionName}`, async () => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Skip unapproved pending/rejected items
          if (data.status) {
            const s = String(data.status).toLowerCase();
            if (s === 'pending' || s === 'rejected' || s === 'needs_correction' || s === 'draft') {
              return;
            }
          }
          if (data.isVerified === false && data.status === 'pending') {
            return;
          }
          list.push({ id: docSnap.id, _collectionName: collectionName, ...data });
        }
      });
      if (list.length === 0) {
        const fb = getFallbackData(collectionName);
        return fb.map(item => ({ ...item, _collectionName: collectionName }));
      }
      return list;
    } catch (e) {
      console.error(`Error fetching collection ${collectionName} for global search:`, e);
      const fb = getFallbackData(collectionName);
      return fb.map(item => ({ ...item, _collectionName: collectionName }));
    }
  }, 5 * 60 * 1000); // 5 minutes TTL
};

export interface AdCampaign {
  id: string;
  campaignName: string;
  advertiserId: string;
  advertiserName: string;
  imageUrl: string;
  link: string;
  slotType: 'top_banner' | 'homepage' | 'service_page' | 'sponsored_listing';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'active';
  impressions: number;
  clicks: number;
  createdAt: string;
  paymentPhone?: string;
  paymentTrxId?: string;
  paymentMethod?: string;
  cpc?: number;
}

export const getAdCampaigns = async (): Promise<AdCampaign[]> => {
  const path = 'ad_campaigns';
  return withCache(path, async () => {
    try {
      const snapshot = await getDocs(collection(db, path));
      const list: AdCampaign[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as AdCampaign);
      });
      return list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    } catch (error: any) {
      if (error?.message?.includes("Quota") || error?.code === "resource-exhausted") {
        console.warn("Firestore quota limit reached in getAdCampaigns.");
      } else {
        console.warn("Error getAdCampaigns:", error?.message || error);
      }
      return [];
    }
  });
};

export const addAdCampaign = async (campaign: Omit<AdCampaign, 'id' | 'createdAt' | 'impressions' | 'clicks' | 'spent' | 'status'> & { status?: AdCampaign['status'] }) => {
  const id = 'camp-' + Date.now();
  const newCampaign: AdCampaign = {
    ...campaign,
    id,
    impressions: 0,
    clicks: 0,
    spent: 0,
    status: campaign.status || 'pending',
    createdAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'ad_campaigns', id), newCampaign);
    clearApiCache('ad_campaigns');
    return id;
  } catch (error) {
    console.error("Error addAdCampaign:", error);
    throw error;
  }
};

export const updateAdCampaign = async (id: string, campaign: Partial<AdCampaign>) => {
  try {
    await updateDoc(doc(db, 'ad_campaigns', id), campaign);
    clearApiCache('ad_campaigns');
  } catch (error) {
    console.error("Error updateAdCampaign:", error);
    throw error;
  }
};

export const deleteAdCampaign = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'ad_campaigns', id));
    clearApiCache('ad_campaigns');
  } catch (error) {
    console.error("Error deleteAdCampaign:", error);
    throw error;
  }
};

export const incrementAdImpression = async (id: string) => {
  try {
    await updateDoc(doc(db, 'ad_campaigns', id), {
      impressions: increment(1)
    });
  } catch (error) {
    console.error("Error incrementAdImpression:", error);
  }
};

export const incrementAdClick = async (id: string, cpc: number = 5) => {
  try {
    await updateDoc(doc(db, 'ad_campaigns', id), {
      clicks: increment(1),
      spent: increment(cpc)
    });
  } catch (error) {
    console.error("Error incrementAdClick:", error);
  }
};

// Hero Carousel Slider & Banners exports
export {
  getHeroSlides,
  onHeroSlidesSnapshot,
  seedHeroSlidesIfEmpty,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideStatus,
  reorderHeroSlides,
  INITIAL_HERO_SLIDES
} from "./services/heroSliderService";

// 63 Upazila Services & User Interaction API exports
export { upazilaServicesService } from "./services/upazilaServicesService";
export type { 
  UpazilaService, 
  UpazilaServiceSubmission, 
  UpazilaServiceEditRequest, 
  UpazilaServiceReport 
} from "./services/upazilaServicesService";

// Local News (স্থানীয় সংবাদ) API exports
export {
  onNewsSnapshot,
  onSingleNewsSnapshot,
  onNewsCommentsSnapshot,
  addNewsComment,
  deleteNewsComment,
  toggleNewsLike,
  incrementNewsView,
  createNews,
  updateNews,
  deleteNews,
  submitCitizenReport,
  onCitizenReportsSnapshot,
  updateCitizenReportStatus,
  convertCitizenReportToNews,
  seedInitialNewsIfEmpty,
  DEFAULT_NEWS_SEED
} from "./services/newsService";
export type { NewsItem as LocalNewsItem, NewsComment, CitizenNewsReport } from "./services/newsService";






