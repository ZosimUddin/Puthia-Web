import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { cleanUndefined } from '../utils/firestoreUtils';

export type BookmarkCategory = 
  | 'doctor' 
  | 'hospital' 
  | 'job' 
  | 'restaurant' 
  | 'business' 
  | 'tourism' 
  | 'news' 
  | 'service' 
  | 'discussion' 
  | 'blood_donor' 
  | 'other';

export interface SavedItem {
  id: string;
  type: BookmarkCategory;
  title: string;
  subtitle?: string;
  image?: string;
  linkId?: string; // used for navigating if needed
  link?: string;
  phone?: string;
  address?: string;
  location?: string;
  categoryLabel?: string;
  rating?: number;
  savedAt?: string | number;
  notes?: string;
  newsItem?: any;
  metadata?: any;
  postId?: string;
  collectionId?: string;
  savedCategory?: string;
  postContent?: string;
  authorName?: string;
  collectionName?: string;
}

export interface FollowedItem {
  id: string;
  type: 'business' | 'provider';
  name: string;
  category?: string;
  location?: string;
  phone?: string;
}

export interface AppNotification {
  id: string;
  type: 'post_approved' | 'new_notice' | 'new_job' | 'blood_request' | 'event_reminder' | 'general';
  title: string;
  text: string;
  date: string;
  isNew: boolean;
  link?: string;
}

interface FavoriteContextType {
  savedItems: SavedItem[];
  bookmarks: SavedItem[];
  toggleSave: (item: SavedItem) => Promise<void> | void;
  toggleBookmark: (item: SavedItem) => Promise<void> | void;
  isSaved: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  removeBookmark: (id: string) => Promise<void> | void;
  updateBookmarkNotes: (id: string, notes: string) => Promise<void> | void;
  clearAllBookmarks: () => Promise<void> | void;
  followedItems: FollowedItem[];
  toggleFollow: (item: FollowedItem) => void;
  isFollowing: (id: string) => boolean;
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'isNew'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

const defaultSavedItems: SavedItem[] = [
  {
    id: "sample-doc-1",
    type: "doctor",
    title: "ডা. মো. রফিকুল ইসলাম",
    subtitle: "এমবিবিএস, এফসিপিএস (মেডিসিন)",
    categoryLabel: "মেডিসিন বিশেষজ্ঞ",
    phone: "01712-334455",
    address: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স সংলগ্ন",
    rating: 4.9,
    savedAt: new Date().toISOString(),
    link: "/service/doctor",
  },
  {
    id: "sample-hosp-1",
    type: "hospital",
    title: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
    subtitle: "৫০ শয্যা বিশিষ্ট সরকারি হাসপাতাল",
    categoryLabel: "সরকারি হাসপাতাল",
    phone: "01730-324500",
    address: "হাসপাতাল রোড, পুঠিয়া বাজার",
    rating: 4.8,
    savedAt: new Date().toISOString(),
    link: "/service/hospital",
  },
  {
    id: "sample-job-1",
    type: "job",
    title: "কম্পিউটার অপারেটর ও অফিস সহকারী",
    subtitle: "পুঠিয়া মডেল হাই স্কুল",
    categoryLabel: "শিক্ষা প্রতিষ্ঠান নিয়োগ",
    phone: "01711-889900",
    address: "পুঠিয়া সদর, রাজশাহী",
    rating: 4.7,
    savedAt: new Date().toISOString(),
    link: "/service/job",
  },
  {
    id: "sample-rest-1",
    type: "restaurant",
    title: "রয়েল ফুড প্যালেস ও ক্যাফে",
    subtitle: "ফ্যামিলি ডাইনিং ও চাইনিজ রেস্টুরেন্ট",
    categoryLabel: "রেস্টুরেন্ট ও খাবার",
    phone: "01755-112233",
    address: "রাজবাড়ী রোড, পুঠিয়া",
    rating: 4.6,
    savedAt: new Date().toISOString(),
    link: "/service/restaurant",
  },
  {
    id: "sample-tour-1",
    type: "tourism",
    title: "পুঠিয়া ঐতিহাসিক পঞ্চরত্ন গোবিন্দ মন্দির ও রাজবাড়ী",
    subtitle: "টেরাকোটা সমৃদ্ধ প্রাচীন রাজপ্রাসাদ",
    categoryLabel: "ঐতিহাসিক দর্শনীয় স্থান",
    address: "রাজবাড়ী চত্বর, পুঠিয়া",
    rating: 5.0,
    savedAt: new Date().toISOString(),
    link: "/history",
  },
];

const defaultNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'post_approved',
    title: 'পোস্ট Approved',
    text: 'অভিনন্দন! পুঠিয়া নাগরিক ফোরামে আপনার পোস্টটি সফলভাবে অনুমোদিত হয়েছে এবং এখন তা সকলের জন্য লাইভ রয়েছে।',
    date: 'এইমাত্র',
    isNew: true
  },
  {
    id: 'notif-2',
    type: 'new_notice',
    title: 'নতুন Notice',
    text: 'পুঠিয়া উপজেলা প্রশাসন ও বানেশ্বর ইউনিয়ন পরিষদ থেকে নতুন কৃষি বীজ বিতরণ ও সহায়তা কর্মসূচি বিষয়ক নোটিশ প্রকাশ করা হয়েছে।',
    date: '৩ ঘণ্টা আগে',
    isNew: true
  },
  {
    id: 'notif-3',
    type: 'new_job',
    title: 'নতুন Job',
    text: 'আপনার জন্য নতুন কর্মসংস্থানের সুযোগ! পুঠিয়া ডিজিটাল সেন্টারে ডাটা এন্ট্রি অপারেটর পদে নিয়োগ বিজ্ঞপ্তি প্রকাশ হয়েছে।',
    date: '১ দিন আগে',
    isNew: false
  },
  {
    id: 'notif-4',
    type: 'blood_request',
    title: 'রক্তের অনুরোধ',
    text: 'জরুরি রক্তের প্রয়োজন! পুঠিয়া সদর হাসপাতালে চিকিৎসাধীন মুমূর্ষু রোগীর জন্য জরুরি ও-নেগেটিভ (O-) রক্তদাতার খোঁজ করা হচ্ছে।',
    date: '২ দিন আগে',
    isNew: false
  },
  {
    id: 'notif-5',
    type: 'event_reminder',
    title: 'Event Reminder',
    text: 'মনে করিয়ে দিচ্ছি: আগামীকাল সকাল ১০:০০ টায় পুঠিয়া রাজবাড়ী মাঠে অনুষ্ঠিত হতে যাচ্ছে ইউনিয়ন ভিত্তিক পরিবেশ সচেতনতামূলক আলোচনা সভা।',
    date: '৩ দিন আগে',
    isNew: false
  }
];

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const saved = localStorage.getItem('puthia_saved_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultSavedItems;
  });

  const [followedItems, setFollowedItems] = useState<FollowedItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Sync with Firestore if logged in
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('puthia_saved_items');
      if (saved) {
        try {
          setSavedItems(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved items');
        }
      } else {
        setSavedItems(defaultSavedItems);
        localStorage.setItem('puthia_saved_items', JSON.stringify(defaultSavedItems));
      }
      return;
    }

    // Subscribe to user's bookmarks in Firestore
    const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
    const unsubscribe = onSnapshot(
      bookmarksRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: SavedItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({
              id: docSnap.id,
              ...(docSnap.data() as Omit<SavedItem, 'id'>)
            });
          });
          setSavedItems(list);
          localStorage.setItem('puthia_saved_items', JSON.stringify(list));
        } else {
          // If empty in firestore, check local storage or seed
          const localSaved = localStorage.getItem('puthia_saved_items');
          if (localSaved) {
            try {
              const parsed: SavedItem[] = JSON.parse(localSaved);
              setSavedItems(parsed);
              // sync existing to firestore
              parsed.forEach((it) => {
                setDoc(doc(db, 'users', user.uid, 'bookmarks', it.id), cleanUndefined(it), { merge: true }).catch(() => {});
              });
            } catch (e) {}
          } else {
            setSavedItems(defaultSavedItems);
            defaultSavedItems.forEach((it) => {
              setDoc(doc(db, 'users', user.uid, 'bookmarks', it.id), cleanUndefined(it), { merge: true }).catch(() => {});
            });
          }
        }
      },
      (error) => {
        console.warn('Firestore bookmarks error, fallback to local:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Notifications & Followed Items setup
  useEffect(() => {
    const followed = localStorage.getItem('puthia_followed_items');
    if (followed) {
      try {
        setFollowedItems(JSON.parse(followed));
      } catch (e) {
        console.error('Failed to parse followed items');
      }
    }

    const storedNotifs = localStorage.getItem('puthia_notifications');
    if (storedNotifs) {
      try {
        setNotifications(JSON.parse(storedNotifs));
      } catch (e) {
        console.error('Failed to parse notifications');
        setNotifications(defaultNotifications);
      }
    } else {
      setNotifications(defaultNotifications);
      localStorage.setItem('puthia_notifications', JSON.stringify(defaultNotifications));
    }
  }, []);

  const toggleSave = async (item: SavedItem) => {
    const exists = savedItems.some((i) => i.id === item.id);
    let newItems: SavedItem[];

    if (exists) {
      newItems = savedItems.filter((i) => i.id !== item.id);
      if (user) {
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'bookmarks', item.id));
        } catch (e) {
          console.error('Error deleting from Firestore:', e);
        }
      }
    } else {
      const itemWithTime: SavedItem = {
        ...item,
        savedAt: item.savedAt || new Date().toISOString(),
      };
      newItems = [itemWithTime, ...savedItems];
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'bookmarks', item.id), cleanUndefined(itemWithTime), { merge: true });
        } catch (e) {
          console.error('Error saving to Firestore:', e);
        }
      }
    }

    setSavedItems(newItems);
    localStorage.setItem('puthia_saved_items', JSON.stringify(newItems));
    window.dispatchEvent(new CustomEvent('bookmarks-updated', { detail: newItems }));
  };

  const removeBookmark = async (id: string) => {
    const newItems = savedItems.filter((i) => i.id !== id);
    setSavedItems(newItems);
    localStorage.setItem('puthia_saved_items', JSON.stringify(newItems));
    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'bookmarks', id));
      } catch (e) {
        console.error('Error removing bookmark from Firestore:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('bookmarks-updated', { detail: newItems }));
  };

  const updateBookmarkNotes = async (id: string, notes: string) => {
    const newItems = savedItems.map((i) => (i.id === id ? { ...i, notes } : i));
    setSavedItems(newItems);
    localStorage.setItem('puthia_saved_items', JSON.stringify(newItems));
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'bookmarks', id), cleanUndefined({ notes }), { merge: true });
      } catch (e) {
        console.error('Error updating bookmark note:', e);
      }
    }
  };

  const clearAllBookmarks = async () => {
    setSavedItems([]);
    localStorage.setItem('puthia_saved_items', JSON.stringify([]));
    if (user) {
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'bookmarks'));
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
      } catch (e) {
        console.error('Error clearing bookmarks:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('bookmarks-updated', { detail: [] }));
  };

  const isSaved = (id: string) => {
    return savedItems.some((i) => i.id === id);
  };

  const toggleFollow = (item: FollowedItem) => {
    setFollowedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      let newItems;
      if (exists) {
        newItems = prev.filter((i) => i.id !== item.id);
      } else {
        newItems = [...prev, item];
      }
      localStorage.setItem('puthia_followed_items', JSON.stringify(newItems));
      return newItems;
    });
  };

  const isFollowing = (id: string) => {
    return followedItems.some((i) => i.id === id);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'date' | 'isNew'>) => {
    setNotifications((prev) => {
      const newNotif: AppNotification = {
        ...notif,
        id: `notif-${Date.now()}`,
        date: 'এইমাত্র',
        isNew: true,
      };
      const updated = [newNotif, ...prev];
      localStorage.setItem('puthia_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isNew: false } : n));
      localStorage.setItem('puthia_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isNew: false }));
      localStorage.setItem('puthia_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      localStorage.setItem('puthia_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('puthia_notifications', JSON.stringify([]));
  };

  return (
    <FavoriteContext.Provider
      value={{
        savedItems,
        bookmarks: savedItems,
        toggleSave,
        toggleBookmark: toggleSave,
        isSaved,
        isBookmarked: isSaved,
        removeBookmark,
        updateBookmarkNotes,
        clearAllBookmarks,
        followedItems,
        toggleFollow,
        isFollowing,
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearNotifications,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};
