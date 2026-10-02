import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  PlusCircle, 
  Trash2, 
  Loader2, 
  X, 
  Send, 
  Utensils, 
  Search, 
  Star, 
  ChevronRight, 
  MessageSquare, 
  Edit3, 
  Plus, 
  Info, 
  Check, 
  AlertCircle,
  TrendingUp,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc,
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { UnifiedHeroHeader } from './common/UnifiedDesignSystem';
import { Restaurant, RestaurantMenuItem, RestaurantReview } from '../types';

// Standard fallback/preset images
const CATEGORY_IMAGES = {
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80",
  sweet: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
  fastfood: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80"
};

// Premium localized preset seed data for Puthia
const SEED_RESTAURANTS: Omit<Restaurant, 'id'>[] = [
  {
    name: "পুঠিয়া ক্যাফে ও ফাস্টফুড",
    category: "cafe",
    contact: "01712345678",
    altContact: "01787654321",
    whatsapp: "01712345678",
    location: "পুঠিয়া রাজবাড়ি প্রধান ফটকের সামনে",
    union: "পুঠিয়া সদর",
    specialty: "বার্গার, ক্রিসপি চিকেন, স্পেশাল পিৎজা এবং কোল্ড কফি",
    openingTime: "১০:০০ AM",
    closingTime: "১০:০০ PM",
    offDay: "বৃহস্পতিবার",
    googleMapUrl: "https://maps.google.com/?q=Puthia+Rajbari",
    imageUrl: CATEGORY_IMAGES.cafe,
    menu: [
      { id: "menu_1_1", name: "চিকেন বার্গার (Chicken Burger)", price: 120, description: "সুস্বাদু ক্রিসপি চিকেন প্যাটি ও স্পেশাল সস দিয়ে তৈরি", isAvailable: true },
      { id: "menu_1_2", name: "স্পেশাল চিকেন পিৎজা (Special Pizza)", price: 280, description: "প্রচুর চিজ, চিকেন কুচি ও গোলমরিচ দিয়ে বেকড", isAvailable: true },
      { id: "menu_1_3", name: "ফালুদা (Special Falooda)", price: 80, description: "আইসক্রিম, তাজা ফল ও কাস্টার্ডের সুস্বাদু মিশ্রণ", isAvailable: true },
      { id: "menu_1_4", name: "কোল্ড কফি (Cold Coffee)", price: 60, description: "চকলেট সিরাপ ও ক্রিম যুক্ত ঠান্ডা কফি", isAvailable: true }
    ],
    rating: 4.8,
    reviewCount: 2,
    reviewsList: [
      { id: "rev_1_1", userId: "seed_user_1", userName: "মাহিন হাসান", rating: 5, comment: "রাজবাড়ীর সামনে আড্ডা দেওয়ার জন্য দারুণ ক্যাফে! খাবার অনেক সুস্বাদু ছিল।", createdAt: new Date().toISOString() },
      { id: "rev_1_2", userId: "seed_user_2", userName: "রবিন ইসলাম", rating: 4, comment: "পরিবেশ সুন্দর, বিশেষ করে পিৎজার স্বাদ অসাধারণ লেগেছে।", createdAt: new Date().toISOString() }
    ],
    isApproved: true,
    isFeatured: true,
    isVerified: true,
    views: 145,
    createdAt: new Date().toISOString()
  },
  {
    name: "ঝিলিক মিষ্টি ভান্ডার",
    category: "sweet",
    contact: "01723456789",
    location: "পুঠিয়া বাজার চৌরাস্তা মোড়",
    union: "পুঠিয়া সদর",
    specialty: "ঐতিহ্যবাহী পুঠিয়ার রাজভোগ, ছানার মিষ্টি এবং স্পেশাল দই",
    openingTime: "০৮:০০ AM",
    closingTime: "০৯:৩০ PM",
    offDay: "নেই",
    googleMapUrl: "https://maps.google.com/?q=Puthia+Bazar",
    imageUrl: CATEGORY_IMAGES.sweet,
    menu: [
      { id: "menu_2_1", name: "রাজভোগ মিষ্টি (১ পিস)", price: 30, description: "পুঠিয়ার বিখ্যাত বড় সাইজের নরম রাজভোগ", isAvailable: true },
      { id: "menu_2_2", name: "স্পেশাল মিষ্টি দই (১ কেজি)", price: 220, description: "খাঁটি দুধের ঘন মিষ্টি দই", isAvailable: true },
      { id: "menu_2_3", name: "ছানার সন্দেশ (১ কেজি)", price: 380, description: "খাঁটি গরুর দুধের নরম ছানার সন্দেশ", isAvailable: true }
    ],
    rating: 4.9,
    reviewCount: 1,
    reviewsList: [
      { id: "rev_2_1", userId: "seed_user_3", userName: "তাহমিদ আনজুম", rating: 5, comment: "পুঠিয়ার বিখ্যাত রাজভোগ! এক কথায় অসাধারণ স্বাদ। বাজারে আসলে অবশ্যই ট্রাই করবেন।", createdAt: new Date().toISOString() }
    ],
    isApproved: true,
    isFeatured: true,
    isVerified: true,
    views: 320,
    createdAt: new Date().toISOString()
  },
  {
    name: "বানেশ্বর ফুড জোন",
    category: "restaurant",
    contact: "01734567890",
    location: "বানেশ্বর বাজার মহাসড়ক সংলগ্ন",
    union: "বানেশ্বর",
    specialty: "খাসির কাচ্চি বিরিয়ানি ও চিকেন ভুনা খিচুড়ি",
    openingTime: "১১:০০ AM",
    closingTime: "১১:০০ PM",
    offDay: "নেই",
    googleMapUrl: "https://maps.google.com/?q=Baneshwar+Bazar",
    imageUrl: CATEGORY_IMAGES.restaurant,
    menu: [
      { id: "menu_3_1", name: "হাফ কাচ্চি বিরিয়ানি (বাসমতী চাল)", price: 180, description: "খাসির মাংস, আলু ও সুগন্ধি বাসমতী চালের কাচ্চি", isAvailable: true },
      { id: "menu_3_2", name: "চিকেন ভুনা খিচুড়ি", price: 130, description: "দেশি মুরগির মাংস দিয়ে ভুনা খিচুড়ি", isAvailable: true },
      { id: "menu_3_3", name: "স্পেশাল বোরহানি (১ গ্লাস)", price: 40, description: "টক দই ও পুদিনা পাতার মসলাদার বোরহানি", isAvailable: true }
    ],
    rating: 4.7,
    reviewCount: 1,
    reviewsList: [
      { id: "rev_3_1", userId: "seed_user_4", userName: "সাজিদ মাহমুদ", rating: 5, comment: "বানেশ্বরে সেরা কাচ্চি বিরিয়ানি! মাংস অনেক নরম এবং স্বাদ চমৎকার।", createdAt: new Date().toISOString() }
    ],
    isApproved: true,
    isFeatured: false,
    isVerified: true,
    views: 188,
    createdAt: new Date().toISOString()
  },
  {
    name: "বিসমিল্লাহ হোটেল অ্যান্ড রেস্টুরেন্ট",
    category: "restaurant",
    contact: "01756789012",
    location: "বেলপুকুরিয়া বাজার",
    union: "বেলপুকুরিয়া",
    specialty: "হাঁসের মাংস দিয়ে চালের রুটি ও ঐতিহ্যবাহী বাঙালি খাবার",
    openingTime: "০৬:০০ AM",
    closingTime: "১০:০০ PM",
    offDay: "শুক্রবার",
    googleMapUrl: "https://maps.google.com/?q=Belpukur+Bazar",
    imageUrl: CATEGORY_IMAGES.restaurant,
    menu: [
      { id: "menu_5_1", name: "হাঁসের মাংস ভুনা (১ প্লেট)", price: 150, description: "ঝাল ঝাল দেশি হাঁসের মাংসের ঝোল ভুনা", isAvailable: true },
      { id: "menu_5_2", name: "চালের আটার রুটি (১ পিস)", price: 10, description: "গরম গরম তাজা চালের রুটি", isAvailable: true },
      { id: "menu_5_3", name: "গরুর বট/ঝাল ফ্রাই", price: 120, description: "মচমচে এবং ঝাল গরুর বট ভাজি", isAvailable: true }
    ],
    rating: 4.6,
    reviewCount: 1,
    reviewsList: [
      { id: "rev_5_1", userId: "seed_user_5", userName: "রুহুল আমিন", rating: 5, comment: "হাঁসের মাংস ও চালের রুটির স্বাদ অতুলনীয়! দামও খুব সাধ্যের মধ্যে।", createdAt: new Date().toISOString() }
    ],
    isApproved: true,
    isFeatured: false,
    isVerified: false,
    views: 95,
    createdAt: new Date().toISOString()
  }
];

export const LocalRestaurantInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const { user, userProfile } = useAuth();
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'all' | 'restaurant' | 'cafe' | 'sweet' | 'fastfood'>("all");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnion, setSelectedUnion] = useState("all");
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);
  const [filterMyPosts, setFilterMyPosts] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'views'>("rating");

  // Auth & UI control modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'menu' | 'reviews'>("info");

  // Form controls (Add / Edit)
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Form inputs
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<'restaurant' | 'cafe' | 'sweet' | 'fastfood'>("restaurant");
  const [formContact, setFormContact] = useState("");
  const [formAltContact, setFormAltContact] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formUnion, setFormUnion] = useState("পুঠিয়া সদর");
  const [formSpecialty, setFormSpecialty] = useState("");
  const [formOpeningTime, setFormOpeningTime] = useState("০৯:০০ AM");
  const [formClosingTime, setFormClosingTime] = useState("১০:০০ PM");
  const [formOffDay, setFormOffDay] = useState("নেই");
  const [formGoogleMapUrl, setFormGoogleMapUrl] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");

  // Menu Management Modal controls
  const [showMenuManageModal, setShowMenuManageModal] = useState(false);
  const [menuItemsList, setMenuItemsList] = useState<RestaurantMenuItem[]>([]);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState("");
  const [newMenuDesc, setNewMenuDesc] = useState("");
  const [newMenuAvailable, setNewMenuAvailable] = useState(true);

  // Review states
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Firestore collections states
  const [dbPosts, setDbPosts] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load and listen to restaurant posts in Firestore
  useEffect(() => {
    const q = query(collection(db, "restaurant_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Automatically seed initially empty database with Puthia presets
        setIsLoading(true);
        try {
          for (const item of SEED_RESTAURANTS) {
            await addDoc(collection(db, "restaurant_posts"), item);
          }
        } catch (err) {
          console.error("Auto seeding failed:", err);
        }
        
        // Fallback to local SEED_RESTAURANTS so the user can see something even if seeding failed
        const fallbackList: Restaurant[] = SEED_RESTAURANTS.map((item, idx) => ({
          id: `seed_restaurant_${idx + 1}`,
          ...item
        } as Restaurant));
        setDbPosts(fallbackList);
        setIsLoading(false);
        return;
      }

      const list: Restaurant[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || "অজ্ঞাত আউটলেট",
          category: data.category || "cafe",
          contact: data.contact || "",
          altContact: data.altContact || "",
          whatsapp: data.whatsapp || "",
          location: data.location || "পুঠিয়া",
          union: data.union || "পুঠিয়া সদর",
          specialty: data.specialty || "সুস্বাদু খাবার",
          openingTime: data.openingTime || "০৯:০০ AM",
          closingTime: data.closingTime || "১০:০০ PM",
          offDay: data.offDay || "নেই",
          googleMapUrl: data.googleMapUrl || "",
          imageUrl: data.imageUrl || CATEGORY_IMAGES[data.category as keyof typeof CATEGORY_IMAGES] || CATEGORY_IMAGES.cafe,
          menu: data.menu || [],
          rating: typeof data.rating === 'number' ? data.rating : 5.0,
          reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
          reviewsList: data.reviewsList || [],
          userId: data.userId || "",
          isApproved: data.isApproved !== undefined ? data.isApproved : true,
          isFeatured: data.isFeatured || false,
          isVerified: data.isVerified || false,
          views: data.views || 0,
          createdAt: data.createdAt ? (data.createdAt.seconds ? new Date(data.createdAt.seconds * 1000).toISOString() : String(data.createdAt)) : new Date().toISOString()
        });
      });
      setDbPosts(list);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "restaurant_posts");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync selectedRestaurant state when dbPosts update (e.g. review added)
  useEffect(() => {
    if (selectedRestaurant) {
      const refreshed = dbPosts.find(r => r.id === selectedRestaurant.id);
      if (refreshed) {
        setSelectedRestaurant(refreshed);
      }
    }
  }, [dbPosts, selectedRestaurant]);

  // Handle open status
  const isRestaurantOpen = (r: Restaurant): boolean => {
    if (!r.openingTime || !r.closingTime) return true;
    
    const daysBengali = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    const currentDayBengali = daysBengali[new Date().getDay()];
    if (r.offDay && r.offDay.trim() === currentDayBengali) {
      return false;
    }

    try {
      const parseTime = (timeStr: string) => {
        const bToE: Record<string, string> = {
          '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
          '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
        };
        let sanitized = timeStr.replace(/[০-৯]/g, m => bToE[m] || m);
        const match = sanitized.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return { hour: 0, minute: 0 };
        
        let hour = parseInt(match[1]);
        const minute = parseInt(match[2]);
        const ampm = match[3].toUpperCase();
        
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        
        return { hour, minute };
      };

      const open = parseTime(r.openingTime);
      const close = parseTime(r.closingTime);
      
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      
      const openMinutes = open.hour * 60 + open.minute;
      const closeMinutes = close.hour * 60 + close.minute;
      const nowMinutes = currentHour * 60 + currentMin;
      
      if (closeMinutes < openMinutes) {
        return nowMinutes >= openMinutes || nowMinutes <= closeMinutes;
      }
      return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
    } catch (e) {
      return true;
    }
  };

  // Views increment handler
  const incrementViews = async (r: Restaurant) => {
    try {
      const docRef = doc(db, "restaurant_posts", r.id);
      await updateDoc(docRef, {
        views: (r.views || 0) + 1
      });
    } catch (err) {
      console.error("Failed to increment views:", err);
    }
  };

  // Reset form inputs
  const resetForm = () => {
    setFormName("");
    setFormCategory("restaurant");
    setFormContact("");
    setFormAltContact("");
    setFormWhatsapp("");
    setFormLocation("");
    setFormUnion("পুঠিয়া সদর");
    setFormSpecialty("");
    setFormOpeningTime("০৯:০০ AM");
    setFormClosingTime("১০:০০ PM");
    setFormOffDay("নেই");
    setFormGoogleMapUrl("");
    setFormImageUrl("");
    setEditingRestaurant(null);
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    resetForm();
    setEditingRestaurant(null);
    setShowAddEditModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (r: Restaurant, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRestaurant(r);
    setFormName(r.name);
    setFormCategory(r.category);
    setFormContact(r.contact);
    setFormAltContact(r.altContact || "");
    setFormWhatsapp(r.whatsapp || "");
    setFormLocation(r.location);
    setFormUnion(r.union);
    setFormSpecialty(r.specialty);
    setFormOpeningTime(r.openingTime);
    setFormClosingTime(r.closingTime);
    setFormOffDay(r.offDay);
    setFormGoogleMapUrl(r.googleMapUrl || "");
    setFormImageUrl(r.imageUrl || "");
    setShowAddEditModal(true);
  };

  // Save Restaurant (Create or Edit)
  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!formName.trim() || !formContact.trim() || !formLocation.trim()) {
      alert("দয়া করে প্রয়োজনীয় সকল তথ্য (নাম, কন্টাক্ট নম্বর, ঠিকানা) প্রদান করুন।");
      return;
    }

    setIsPosting(true);
    const resolvedImageUrl = formImageUrl.trim() || CATEGORY_IMAGES[formCategory];

    const dataPayload = {
      name: formName.trim(),
      category: formCategory,
      contact: formContact.trim(),
      altContact: formAltContact.trim(),
      whatsapp: formWhatsapp.trim(),
      location: formLocation.trim(),
      union: formUnion,
      specialty: formSpecialty.trim(),
      openingTime: formOpeningTime.trim(),
      closingTime: formClosingTime.trim(),
      offDay: formOffDay.trim(),
      googleMapUrl: formGoogleMapUrl.trim(),
      imageUrl: resolvedImageUrl,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingRestaurant) {
        // Edit flow
        const docRef = doc(db, "restaurant_posts", editingRestaurant.id);
        await updateDoc(docRef, dataPayload);
        alert("🎉 রেস্টুরেন্টের তথ্য সফলভাবে আপডেট করা হয়েছে!");
      } else {
        // Create flow
        const newPayload = {
          ...dataPayload,
          userId: user.uid,
          menu: [],
          rating: 5.0,
          reviewCount: 0,
          reviewsList: [],
          isApproved: true,
          isFeatured: false,
          isVerified: false,
          views: 0,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "restaurant_posts"), newPayload);
        alert("🎉 নতুন রেস্টুরেন্ট সফলভাবে যোগ করা হয়েছে!");
      }
      setShowAddEditModal(false);
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "restaurant_posts");
    } finally {
      setIsPosting(false);
    }
  };

  // Delete Restaurant
  const handleDeleteRestaurant = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই রেস্টুরেন্টটি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।")) return;
    try {
      await deleteDoc(doc(db, "restaurant_posts", id));
      alert("রেস্টুরেন্টটি সফলভাবে মুছে ফেলা হয়েছে।");
      if (selectedRestaurant?.id === id) {
        setSelectedRestaurant(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `restaurant_posts/${id}`);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedRestaurant) return;
    if (!userComment.trim()) {
      alert("দয়া করে রিভিউ মন্তব্যটি লিখুন!");
      return;
    }

    setIsSubmittingReview(true);
    const newReview: RestaurantReview = {
      id: "rev_" + Date.now(),
      userId: user.uid,
      userName: userProfile?.name || user.displayName || "সম্মানিত নাগরিক",
      userPhoto: userProfile?.photoURL || user.photoURL || "",
      rating: userRating,
      comment: userComment.trim(),
      createdAt: new Date().toISOString()
    };

    const currentReviews = selectedRestaurant.reviewsList || [];
    const updatedReviews = [newReview, ...currentReviews];
    const totalStars = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageStars = parseFloat((totalStars / updatedReviews.length).toFixed(1));

    try {
      const docRef = doc(db, "restaurant_posts", selectedRestaurant.id);
      await updateDoc(docRef, {
        reviewsList: updatedReviews,
        rating: averageStars,
        reviewCount: updatedReviews.length
      });
      setUserComment("");
      setUserRating(5);
      alert("🎉 আপনার রিভিউ যুক্ত করা হয়েছে!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `restaurant_posts/${selectedRestaurant.id}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Open Menu Manage Modal
  const handleOpenMenuManage = (r: Restaurant, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRestaurant(r);
    setMenuItemsList(r.menu || []);
    setNewMenuName("");
    setNewMenuPrice("");
    setNewMenuDesc("");
    setNewMenuAvailable(true);
    setShowMenuManageModal(true);
  };

  // Add menu item in local state
  const handleAddMenuItemLocal = () => {
    if (!newMenuName.trim() || !newMenuPrice.trim()) {
      alert("দয়া করে খাবারের নাম ও মূল্য প্রবেশ করুন।");
      return;
    }
    const priceNum = parseFloat(newMenuPrice);
    if (isNaN(priceNum)) {
      alert("দয়া করে সঠিক মূল্য প্রবেশ করুন।");
      return;
    }

    const newItem: RestaurantMenuItem = {
      id: "item_" + Date.now(),
      name: newMenuName.trim(),
      price: priceNum,
      description: newMenuDesc.trim(),
      isAvailable: newMenuAvailable
    };

    setMenuItemsList([...menuItemsList, newItem]);
    setNewMenuName("");
    setNewMenuPrice("");
    setNewMenuDesc("");
    setNewMenuAvailable(true);
  };

  // Delete menu item in local list
  const handleDeleteMenuItemLocal = (id: string) => {
    setMenuItemsList(menuItemsList.filter(item => item.id !== id));
  };

  // Save the full updated menu to Firestore
  const handleSaveMenuFirestore = async () => {
    if (!selectedRestaurant) return;
    try {
      const docRef = doc(db, "restaurant_posts", selectedRestaurant.id);
      await updateDoc(docRef, {
        menu: menuItemsList
      });
      alert("🎉 মেনুটি সফলভাবে সেভ করা হয়েছে!");
      setShowMenuManageModal(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `restaurant_posts/${selectedRestaurant.id}`);
    }
  };

  // Share restaurant info
  const handleShare = (r: Restaurant, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `🍔 ${r.name}\n📍 অবস্থান: ${r.location}, ${r.union}\n📞 যোগাযোগ: ${r.contact}\n🍲 বিশেষ খাবার: ${r.specialty}\nআমাদের পুঠিয়া ডায়রি অ্যাপ থেকে সংগৃহীত।`;
    if (navigator.share) {
      navigator.share({
        title: r.name,
        text: shareText
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(shareText);
      alert("📋 রেস্টুরেন্টের বিস্তারিত তথ্য ক্লিপবোর্ডে কপি করা হয়েছে!");
    }
  };

  // Authorization/Owner permissions helper
  const canManage = (r: Restaurant): boolean => {
    if (!user) return false;
    if (userProfile?.role === 'super_admin' || userProfile?.role === 'admin') return true;
    return r.userId === user.uid;
  };

  // Filter and Sort logic
  const filteredPosts = dbPosts.filter((post) => {
    // Tab filter
    if (activeTab !== "all" && post.category !== activeTab) return false;
    
    // Union filter
    if (selectedUnion !== "all" && post.union !== selectedUnion) return false;
    
    // Open now filter
    if (filterOpenOnly && !isRestaurantOpen(post)) return false;
    
    // My posts filter
    if (filterMyPosts && post.userId !== user?.uid) return false;

    // Search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchName = post.name.toLowerCase().includes(query);
      const matchSpecial = post.specialty.toLowerCase().includes(query);
      const matchLoc = post.location.toLowerCase().includes(query);
      return matchName || matchSpecial || matchLoc;
    }

    return true;
  });

  // Sort logic
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "views") {
      return (b.views || 0) - (a.views || 0);
    }
    // Default sorting: Rating (Top rated)
    return (b.rating || 0) - (a.rating || 0);
  });

  // Category Translation
  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'restaurant': return 'রেস্টুরেন্ট';
      case 'cafe': return 'ক্যাফে';
      case 'sweet': return 'মিষ্টির দোকান';
      case 'fastfood': return 'ফাস্টফুড';
      default: return 'খাবারের দোকান';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch(category) {
      case 'restaurant': return '🍲';
      case 'cafe': return '☕';
      case 'sweet': return '🍩';
      case 'fastfood': return '🍟';
      default: return '🍽️';
    }
  };

  return (
    <div className="font-sans pb-12 text-left animate-fade-in space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
      
      {/* 1. Header with back & action buttons */}
      <UnifiedHeroHeader
        badgeText="পুঠিয়ার ঐতিহ্যবাহী ও আধুনিক স্বাদ"
        title="রেস্টুরেন্ট ও মিষ্টির মেলা"
        subtitle="পুঠিয়া, বানেশ্বর ও বেলপুকুরিয়ার সেরা রেস্টুরেন্ট, নান্দনিক ক্যাফে এবং বিখ্যাত রাজভোগ মিষ্টির দোকানগুলোর ঠিকানা, মেনু ও সরাসরি যোগাযোগ মাধ্যম।"
        icon={<Utensils size={20} />}
        showBack={!!onGoBack}
        onBack={onGoBack}
        rightAction={
          <button 
            onClick={handleOpenAdd}
            className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition border border-emerald-500 shadow-sm"
            title="রেস্টুরেন্ট যোগ করুন"
          >
            <PlusCircle size={20} />
          </button>
        }
      />

      {/* 2. Interactive Search & Filters Section */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-4">
        {/* Search Input bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="রেস্টুরেন্টের নাম, ঠিকানা বা বিশেষ খাবার দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-700"
          />
        </div>

        {/* Dropdown Filters and Toggles Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 items-center">
          {/* Union dropdown */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1 tracking-wider">অবস্থান (ইউনিয়ন)</label>
            <select
              value={selectedUnion}
              onChange={(e) => setSelectedUnion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
            >
              <option value="all">সব ইউনিয়ন</option>
              <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
              <option value="বানেশ্বর">বানেশ্বর</option>
              <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
              <option value="জিউপাড়া">জিউপাড়া</option>
              <option value="ভালুকগাছী">ভালুকগাছী</option>
              <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
            </select>
          </div>

          {/* Sort selection */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1 tracking-wider">সাজানোর নিয়ম</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
            >
              <option value="rating">সর্বোচ্চ রেটিং</option>
              <option value="newest">নতুন আউটলেট</option>
              <option value="views">জনপ্রিয়তা (ভিউ)</option>
            </select>
          </div>

          {/* Open Status checkbox toggle */}
          <div className="flex items-center gap-2 h-full pt-4">
            <input
              type="checkbox"
              id="open_only_toggle"
              checked={filterOpenOnly}
              onChange={(e) => setFilterOpenOnly(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 accent-emerald-600"
            />
            <label htmlFor="open_only_toggle" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
              এখন খোলা আছে
            </label>
          </div>

          {/* My posts filter */}
          {user && (
            <div className="flex items-center gap-2 h-full pt-4">
              <input
                type="checkbox"
                id="my_posts_toggle"
                checked={filterMyPosts}
                onChange={(e) => setFilterMyPosts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 accent-emerald-600"
              />
              <label htmlFor="my_posts_toggle" className="text-xs font-bold text-gray-600 cursor-pointer select-none">
                আমার পোস্টসমূহ
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 3. Horizontal category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
            activeTab === 'all' 
              ? 'bg-emerald-600 text-white border-emerald-600' 
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          🍽️ সব খাবার
        </button>
        <button
          onClick={() => setActiveTab('restaurant')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
            activeTab === 'restaurant' 
              ? 'bg-emerald-600 text-white border-emerald-600' 
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          🍲 রেস্টুরেন্ট
        </button>
        <button
          onClick={() => setActiveTab('cafe')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
            activeTab === 'cafe' 
              ? 'bg-emerald-600 text-white border-emerald-600' 
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          ☕ ক্যাফে
        </button>
        <button
          onClick={() => setActiveTab('sweet')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
            activeTab === 'sweet' 
              ? 'bg-emerald-600 text-white border-emerald-600' 
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          🍩 মিষ্টির দোকান
        </button>
        <button
          onClick={() => setActiveTab('fastfood')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
            activeTab === 'fastfood' 
              ? 'bg-emerald-600 text-white border-emerald-600' 
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          🍟 ফাস্টফুড
        </button>
      </div>

      {/* 4. Active counters (No hard-coding) */}
      <div className="flex items-center justify-between text-xs font-bold text-gray-400 px-1">
        <div>
          খুঁজে পাওয়া গেছে: <span className="text-emerald-600">{sortedPosts.length}টি</span> আউটলেট
        </div>
        <div>
          মোট ডেটাবেস আউটলেট: <span className="text-gray-600">{dbPosts.length}টি</span>
        </div>
      </div>

      {/* 5. Restaurants List Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : sortedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedPosts.map((r) => {
            const open = isRestaurantOpen(r);
            return (
              <div 
                key={r.id}
                onClick={() => {
                  setSelectedRestaurant(r);
                  setDetailTab('info');
                  incrementViews(r);
                }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Header Cover Image */}
                  <div className="h-44 relative bg-gray-100">
                    <img 
                      src={r.imageUrl} 
                      alt={r.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {/* Floating verified badge */}
                    {r.isVerified && (
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        🛡️ ভেরিফাইড
                      </span>
                    )}
                    {/* Floating status badge */}
                    <span className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm ${
                      open ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {open ? '🟢 খোলা আছে' : '🔴 বন্ধ আছে'}
                    </span>
                  </div>

                  {/* Card Content body */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1">
                        {r.name}
                      </h3>
                      {/* Rating bubble */}
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-lg font-black shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                        {r.rating?.toFixed(1) || "5.0"}
                      </div>
                    </div>

                    <p className="text-xs text-emerald-600 font-bold bg-emerald-50/50 px-2 py-1 rounded-lg w-max">
                      {getCategoryEmoji(r.category)} {getCategoryLabel(r.category)}
                    </p>

                    <div className="text-xs text-gray-500 space-y-1.5 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{r.location}, {r.union}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="line-clamp-1"><b>সেরা:</b> {r.specialty}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-gray-50 mt-2">
                  <div className="text-[10px] text-gray-400 font-bold">
                    👁️ {r.views || 0} ভিউস • 💬 {r.reviewCount || 0} রিভিউ
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleShare(r, e)}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                      title="শেয়ার করুন"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    {canManage(r) && (
                      <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
                        <button
                          onClick={(e) => handleOpenEdit(r, e)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleOpenMenuManage(r, e)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="মেনু পরিবর্তন করুন"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteRestaurant(r.id, e)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl">
            🍽️
          </div>
          <h4 className="font-extrabold text-gray-800 text-base">কোনো রেস্টুরেন্ট পাওয়া যায়নি</h4>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            আপনার ফিল্টার বা সার্চ কিওয়ার্ডটি পরিবর্তন করে পুনরায় চেষ্টা করুন অথবা নতুন খাবারের দোকান যুক্ত করুন।
          </p>
          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 text-white font-bold text-xs py-2 px-5 rounded-xl hover:bg-emerald-700 transition"
          >
            নতুন দোকান যোগ করুন
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. DETAILED INTERACTIVE VIEW (OVERLAY MODAL)             */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedRestaurant && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white w-full max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden text-left"
            >
              {/* Cover Image & Close */}
              <div className="h-56 relative bg-gray-100 shrink-0">
                <img 
                  src={selectedRestaurant.imageUrl} 
                  alt={selectedRestaurant.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Floating overlay info */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 text-white">
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    {getCategoryLabel(selectedRestaurant.category)}
                  </span>
                  <h2 className="text-xl font-black mt-1 flex items-center gap-1">
                    {selectedRestaurant.name}
                  </h2>
                </div>
              </div>

              {/* Navigation Tabs inside Details */}
              <div className="flex border-b border-gray-100 bg-gray-50 shrink-0">
                <button
                  onClick={() => setDetailTab('info')}
                  className={`flex-1 py-3 text-center text-xs font-black transition-all ${
                    detailTab === 'info' 
                      ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📍 তথ্য ও সেবা
                </button>
                <button
                  onClick={() => setDetailTab('menu')}
                  className={`flex-1 py-3 text-center text-xs font-black transition-all ${
                    detailTab === 'menu' 
                      ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🍛 খাবার মেনু ({selectedRestaurant.menu?.length || 0})
                </button>
                <button
                  onClick={() => setDetailTab('reviews')}
                  className={`flex-1 py-3 text-center text-xs font-black transition-all ${
                    detailTab === 'reviews' 
                      ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  💬 রিভিউসমূহ ({selectedRestaurant.reviewCount || 0})
                </button>
              </div>

              {/* Detail Content Section */}
              <div className="p-5 overflow-y-auto max-h-[60vh] space-y-5">
                
                {/* TAB 1: GENERAL INFO */}
                {detailTab === 'info' && (
                  <div className="space-y-4">
                    {/* Status & Hours */}
                    <div className="bg-gray-50 rounded-2xl p-4 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">অবস্থা</span>
                        <span className={`text-sm font-black ${
                          isRestaurantOpen(selectedRestaurant) ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {isRestaurantOpen(selectedRestaurant) ? '🟢 এখন খোলা আছে' : '🔴 এখন বন্ধ'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">সাপ্তাহিক বন্ধ</span>
                        <span className="text-sm font-bold text-gray-700">
                          {selectedRestaurant.offDay || "নেই"}
                        </span>
                      </div>
                      <div className="space-y-1 col-span-2 border-t border-gray-100 pt-2 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">খোলা থাকার সময়</span>
                          <span className="text-xs font-bold text-gray-700">
                            ⏱️ {selectedRestaurant.openingTime} - {selectedRestaurant.closingTime}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ইউনিয়ন</span>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {selectedRestaurant.union}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Address & Specialty */}
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl h-max mt-0.5">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-800 text-xs">ঠিকানা / অবস্থান</h4>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            {selectedRestaurant.location}, {selectedRestaurant.union}, পুঠিয়া, রাজশাহী
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl h-max mt-0.5">
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-800 text-xs">বিশেষত্ব ও জনপ্রিয় খাবার</h4>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            {selectedRestaurant.specialty}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Direct Contacts Options */}
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider text-gray-400">সরাসরি যোগাযোগ ও অর্ডার মাধ্যম</h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        * ঘরে বসে অর্ডার বা টেবিল বুকিং করার জন্য নিচের নম্বরগুলোতে সরাসরি কল বা হোয়াটসঅ্যাপ করুন। কোনো অনলাইন পেমেন্ট করবেন না।
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Call primary */}
                        <a 
                          href={`tel:${selectedRestaurant.contact}`}
                          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition"
                        >
                          <Phone className="w-4 h-4" /> কল দিন: {selectedRestaurant.contact}
                        </a>

                        {/* WhatsApp if available */}
                        {selectedRestaurant.whatsapp ? (
                          <a 
                            href={`https://wa.me/88${selectedRestaurant.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition"
                          >
                            💬 হোয়াটসঅ্যাপ চ্যাট
                          </a>
                        ) : null}

                        {/* Alternative contact */}
                        {selectedRestaurant.altContact ? (
                          <a 
                            href={`tel:${selectedRestaurant.altContact}`}
                            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 px-4 rounded-xl transition"
                          >
                            📞 বিকল্প নম্বর: {selectedRestaurant.altContact}
                          </a>
                        ) : null}

                        {/* Google map link */}
                        {selectedRestaurant.googleMapUrl ? (
                          <a 
                            href={selectedRestaurant.googleMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-3 px-4 rounded-xl transition"
                          >
                            🗺️ গুগল ম্যাপে অবস্থান
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: MENU DISPLAY */}
                {detailTab === 'menu' && (
                  <div className="space-y-4">
                    {selectedRestaurant.menu && selectedRestaurant.menu.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRestaurant.menu.map((item) => (
                          <div 
                            key={item.id}
                            className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100"
                          >
                            <div className="space-y-1">
                              <h5 className="font-extrabold text-gray-900 text-sm">{item.name}</h5>
                              {item.description && (
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-xs">{item.description}</p>
                              )}
                              <span className={`inline-block text-[10px] font-black px-1.5 py-0.5 rounded ${
                                item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.isAvailable ? 'সহজলভ্য' : 'স্টক শেষ'}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-black text-emerald-600 text-base">৳{item.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400 space-y-2">
                        <Utensils className="w-10 h-10 mx-auto text-gray-300" />
                        <p className="text-xs font-bold">এই রেস্টুরেন্টের ডিজিটাল খাবার মেনু এখনো যুক্ত করা হয়নি।</p>
                      </div>
                    )}
                    
                    {canManage(selectedRestaurant) && (
                      <button
                        onClick={(e) => {
                          setShowMenuManageModal(true);
                          setMenuItemsList(selectedRestaurant.menu || []);
                        }}
                        className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold py-3 rounded-xl text-xs transition border border-dashed border-emerald-300 flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-4 h-4" /> ডিজিটাল খাবার মেনু আপডেট করুন
                      </button>
                    )}
                  </div>
                )}

                {/* TAB 3: REVIEWS & RATINGS */}
                {detailTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Submit Review Form */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                      <h4 className="font-black text-gray-900 text-xs">আপনার অভিজ্ঞতা শেয়ার করুন</h4>
                      <form onSubmit={handleSubmitReview} className="space-y-3 text-left">
                        {/* Star selection */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 font-bold mr-2">রেটিং:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setUserRating(star)}
                              className="p-0.5 transition hover:scale-110"
                            >
                              <Star className={`w-6 h-6 ${
                                star <= userRating ? 'fill-amber-500 stroke-amber-500' : 'text-gray-300'
                              }`} />
                            </button>
                          ))}
                        </div>

                        {/* Comment input */}
                        <div className="relative">
                          <textarea
                            placeholder="খাবারের স্বাদ, পরিবেশন ও মূল্য নিয়ে আপনার মতামত লিখুন..."
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            required
                            rows={2}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          {isSubmittingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          রিভিউ সাবমিট করুন
                        </button>
                      </form>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-3">
                      <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider text-gray-400">গ্রাহকদের মন্তব্য</h4>
                      {selectedRestaurant.reviewsList && selectedRestaurant.reviewsList.length > 0 ? (
                        <div className="space-y-3">
                          {selectedRestaurant.reviewsList.map((rev) => (
                            <div 
                              key={rev.id}
                              className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-1.5 text-left"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-gray-900 text-xs">{rev.userName}</span>
                                <div className="flex items-center gap-0.5">
                                  {[1,2,3,4,5].map((star) => (
                                    <Star key={star} className={`w-3 h-3 ${
                                      star <= rev.rating ? 'fill-amber-500 stroke-amber-500' : 'text-gray-200'
                                    }`} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 font-medium leading-relaxed">{rev.comment}</p>
                              <span className="text-[9px] text-gray-400 block font-bold">
                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('bn-BD') : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400 space-y-1">
                          <MessageSquare className="w-8 h-8 mx-auto text-gray-300" />
                          <p className="text-xs font-bold">এখনো কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি আপনিই দিন!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
              
              {/* Detailed view Footer */}
              <div className="bg-gray-50 border-t border-gray-100 p-4 shrink-0 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-bold">আইডি: {selectedRestaurant.id.slice(0, 8)}</span>
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm transition"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 7. ADD / EDIT OUTLET FORM MODAL                          */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showAddEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left my-8"
            >
              <button
                onClick={() => {
                  setShowAddEditModal(false);
                  resetForm();
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black text-gray-900 mb-1 flex items-center gap-2">
                🍔 {editingRestaurant ? 'রেস্টুরেন্টের তথ্য সম্পাদনা' : 'নতুন রেস্টুরেন্ট/দোকান যুক্ত করুন'}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                সঠিক নাম, অবস্থান ও কন্টাক্ট নম্বর দিন যেন খাদ্যপ্রেমীরা সহজেই খুঁজে পায়।
              </p>

              <form onSubmit={handleSaveRestaurant} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">রেস্টুরেন্ট বা দোকানের নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: পুঠিয়া ক্যাফে প্যালেস"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Category & Union */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 mb-1">ক্যাটাগরি নির্ধারণ করুন *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold bg-white"
                    >
                      <option value="restaurant">🍲 রেস্টুরেন্ট</option>
                      <option value="cafe">☕ ক্যাফে</option>
                      <option value="sweet">🍩 মিষ্টির দোকান</option>
                      <option value="fastfood">🍟 ফাস্টফুড</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 mb-1">ইউনিয়ন *</label>
                    <select
                      value={formUnion}
                      onChange={(e) => setFormUnion(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold bg-white"
                    >
                      <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                      <option value="বানেশ্বর">বানেশ্বর</option>
                      <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                      <option value="জিউপাড়া">জিউপাড়া</option>
                      <option value="ভালুকগাছী">ভালুকগাছী</option>
                      <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                    </select>
                  </div>
                </div>

                {/* Contacts Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 mb-1">অর্ডার/মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      required
                      placeholder="017xxxxxxxx"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 mb-1">হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)</label>
                    <input
                      type="tel"
                      placeholder="017xxxxxxxx"
                      value={formWhatsapp}
                      onChange={(e) => setFormWhatsapp(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Alt Contact */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">বিকল্প মোবাইল নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="tel"
                    placeholder="বিকল্প নম্বর"
                    value={formAltContact}
                    onChange={(e) => setFormAltContact(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">অবস্থান ও পূর্ণ ঠিকানা *</label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: রাজবাড়ি প্রধান ফটকের অপোজিটে, পুঠিয়া সদর"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Specialties */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">বিশেষ মেনু বা সেরা আকর্ষণ *</label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: চিকেন বিরিয়ানি, রাজভোগ মিষ্টি এবং কোল্ড কফি"
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Times Row */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-700 mb-1 uppercase tracking-wider">খোলার সময়</label>
                    <input
                      type="text"
                      placeholder="০৯:০০ AM"
                      value={formOpeningTime}
                      onChange={(e) => setFormOpeningTime(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-700 mb-1 uppercase tracking-wider">বন্ধের সময়</label>
                    <input
                      type="text"
                      placeholder="১০:০০ PM"
                      value={formClosingTime}
                      onChange={(e) => setFormClosingTime(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-700 mb-1 uppercase tracking-wider">সাপ্তাহিক বন্ধ</label>
                    <select
                      value={formOffDay}
                      onChange={(e) => setFormOffDay(e.target.value)}
                      className="w-full px-1 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      <option value="নেই">নেই</option>
                      <option value="শনিবার">শনিবার</option>
                      <option value="রবিবার">রবিবার</option>
                      <option value="সোমবার">সোমবার</option>
                      <option value="মঙ্গলবার">মঙ্গলবার</option>
                      <option value="বুধবার">বুধবার</option>
                      <option value="বৃহস্পতিবার">বৃহস্পতিবার</option>
                      <option value="শুক্রবার">শুক্রবার</option>
                    </select>
                  </div>
                </div>

                {/* Map Link */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">গুগল ম্যাপ লোকেশন লিংক (ঐচ্ছিক)</label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={formGoogleMapUrl}
                    onChange={(e) => setFormGoogleMapUrl(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Image Link */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">কভার ছবির লিংক / ইউআরএল (ঐচ্ছিক)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-gray-400 block mt-1">ফাঁকা রাখলে ক্যাটাগরি অনুযায়ী প্রিসেট কভার ছবি যুক্ত হবে।</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isPosting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> সাবমিট করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> নিশ্চিত করুন
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 8. MENU MANAGEMENT MODAL                                 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showMenuManageModal && selectedRestaurant && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left my-8"
            >
              <button
                onClick={() => setShowMenuManageModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-gray-900 mb-1">
                🍛 খাবার মেনু পরিবর্তন করুন
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {selectedRestaurant.name}-এর আকর্ষণীয় খাবার ও তাদের মূল্য নির্ধারণ করুন।
              </p>

              {/* Add New Menu Item Form section */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 mb-4">
                <h4 className="font-black text-gray-800 text-xs">১. নতুন খাবার যুক্ত করুন</h4>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="খাবারের নাম (উদা: স্পেশাল বিরিয়ানি)"
                      value={newMenuName}
                      onChange={(e) => setNewMenuName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="মূল্য ৳ (উদা: ১৫০)"
                      value={newMenuPrice}
                      onChange={(e) => setNewMenuPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক: উদা: বাসমতী চাল ও মাটন ১ পিস)"
                  value={newMenuDesc}
                  onChange={(e) => setNewMenuDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newMenuAvailable}
                      onChange={(e) => setNewMenuAvailable(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 accent-emerald-600"
                    />
                    সহজলভ্য / এভেইলেবল আছে
                  </label>

                  <button
                    type="button"
                    onClick={handleAddMenuItemLocal}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition cursor-pointer"
                  >
                    তালিকায় যোগ দিন
                  </button>
                </div>
              </div>

              {/* Current Menu Items List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                <h4 className="font-black text-gray-800 text-xs uppercase tracking-wider text-gray-400">২. বর্তমান খাবার তালিকা</h4>
                {menuItemsList.length > 0 ? (
                  <div className="space-y-2">
                    {menuItemsList.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl shadow-xs"
                      >
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{item.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold">
                            ৳{item.price} • {item.isAvailable ? '🟢 এভেইলেবল' : '🔴 শেষ'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteMenuItemLocal(item.id)}
                          className="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
                          title="তালিমা থেকে বাদ দিন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-gray-400 py-6">তালিকা একদম খালি! ওপর থেকে খাবার যোগ করুন।</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <span className="text-xs text-gray-400 font-bold">মোট খাবার: {menuItemsList.length}টি</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMenuManageModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs px-4 py-2 rounded-xl transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMenuFirestore}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-sm cursor-pointer"
                  >
                    মেনু সেভ করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. Sign in auth modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};
