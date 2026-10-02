import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Home, Search, PlusCircle, Phone, MapPin, 
  Trash2, Filter, CheckCircle2, Info, Tag, Layers, X, 
  FileText, Landmark, User, Sparkles, Edit, Heart, Eye,
  Share2, AlertTriangle, ShieldCheck, Check, Trash, Plus, Map as MapIcon,
  MessageSquare, ExternalLink, RefreshCw, Star, ArrowUpDown
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { 
  getToLetAds, 
  addToLetAd, 
  deleteToLetAd, 
  updateToLetAd,
  incrementToLetAdViews,
  incrementToLetAdCalls,
  incrementToLetAdSaves,
  uploadFileToStorage
} from "../api";
import { useFavorites } from "./FavoriteContext";
import { ToLetAd } from "../types";
import { motion, AnimatePresence } from "motion/react";

// Robust Puthia-centric seeds if DB is empty
const SEED_PROPERTIES: Omit<ToLetAd, "id">[] = [
  {
    title: "২য় তলায় অভিজাত ফ্যামিলি ফ্ল্যাট ভাড়া হবে",
    category: "flat",
    description: "৩টি বেডরুম, ২টি আধুনিক বাথরুম, ডাইনিং স্পেস, ২টি দক্ষিণমুখী বারান্দা এবং সুন্দর প্রিমিয়াম মার্বেল টাইলস করা ফ্লোর। সার্বক্ষণিক পানি, বিদ্যুৎ ও গ্যাস সিলিন্ডারের সুব্যবস্থা রয়েছে। সম্পূর্ণ সিকিউরড এলাকা ও সিসিটিভি ক্যামেরা দ্বারা নিয়ন্ত্রিত। শুধু চাকরিজীবী ফ্যামিলির জন্য প্রযোজ্য।",
    rent: "৭,৫০০",
    location: "পুঠিয়া ডিগ্রি কলেজ মোড় (থানার নিকটবর্তী), পুঠিয়া",
    ownerName: "মোঃ আব্দুর রহমান",
    ownerPhone: "01711223344",
    whatsapp: "01711223344",
    details: "৩ বেডরুম, ২ বাথরুম, ২ বারান্দা, টাইলস, পানির ফিল্টার সুবিধা",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    union: "পুঠিয়া সদর",
    village: "কলেজ মোড়",
    rating: 4.8,
    ratingCount: 15,
    ratingSum: 72,
    views: 245,
    calls: 18,
    saves: 14,
    status: "approved",
    isVerified: true,
    isFeatured: true,
    bedrooms: 3,
    bathrooms: 2,
    balconies: 2,
    floor: "২য় তলা",
    size: "১২৫০",
    furnishing: "semi-furnished",
    targetTenant: "family",
    facilities: ["water", "electricity", "parking", "balcony", "security", "wifi"],
    additionalCosts: "বিদ্যুৎ ও ময়লা বিল অতিরিক্ত",
    advanceRent: "২ মাসের ভাড়া অগ্রিম",
    availability: "available",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"]
  },
  {
    title: "ডিগ্রি কলেজের পাশে ছাত্রদের মেসে সিট খালি (২টি সিট)",
    category: "mess",
    description: "সম্পূর্ণ নতুন ও টাইলস করা রুমে ২টি সিট খালি আছে। ডাইনিং ব্যবস্থা, ফিল্টারের পানি ও ওয়াইফাই সুবিধা রয়েছে। শান্ত নিরিবিলি পরিবেশ, যা পড়াশোনার জন্য অত্যন্ত সহায়ক। বিদ্যুৎ বিল সবার মাঝে বণ্টন হবে। মোটরসাইকেল পার্কিং গ্যারেজ একদম ফ্রি।",
    rent: "১,২০০",
    location: "পুঠিয়া রাজবাড়ী সংলগ্ন উত্তর পাড়া, পুঠিয়া",
    ownerName: "সুমন আহমেদ",
    ownerPhone: "01722334455",
    whatsapp: "01722334455",
    details: "ওয়াইফাই, খাট ও টেবিল সুবিধা, ফিল্টারের পানি, মোটরসাইকেল গ্যারেজ",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    union: "পুঠিয়া সদর",
    village: "রাজবাড়ী পাড়া",
    rating: 4.2,
    ratingCount: 5,
    ratingSum: 21,
    views: 98,
    calls: 7,
    saves: 3,
    status: "approved",
    isVerified: true,
    isFeatured: false,
    bedrooms: 1,
    bathrooms: 1,
    balconies: 0,
    floor: "১ম তলা",
    size: "২০০",
    furnishing: "unfurnished",
    targetTenant: "student",
    facilities: ["water", "electricity", "wifi", "parking"],
    additionalCosts: "বিদ্যুৎ ও ওয়াইফাই বিল মিলিয়ে ৩০০ টাকা",
    advanceRent: "১ মাসের ভাড়া অগ্রিম",
    availability: "available",
    images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"]
  },
  {
    title: "বানেশ্বর বাজারের মেইন রোড সংলগ্ন আধুনিক দোকান ঘর ভাড়া হবে",
    category: "shop",
    description: "৪০০ বর্গফুটের বাণিজ্যিক দোকান ঘর ভাড়া দেওয়া হবে। দোকানটির অবস্থান অত্যন্ত সুবিধাজনক স্থানে, বাজারের মূল সড়ক সংলগ্ন। সব ধরণের ব্যবসা বা অফিস স্পেসের জন্য অত্যন্ত উপযোগী। নিজস্ব মিটারসহ বিদ্যুৎ ও পানির সংযোগ রয়েছে।",
    rent: "৩,৫০০",
    location: "বানেশ্বর বাজার মহাসড়ক সংলগ্ন, পুঠিয়া",
    ownerName: "হাজী মোঃ মোশাররফ হোসেন",
    ownerPhone: "01712345678",
    details: "৪০০ বর্গফুট, মেইন রোড সংলগ্ন, সাটার গেট, নিজস্ব বিদ্যুৎ মিটার",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    union: "বানেশ্বর",
    village: "বানেশ্বর বাজার",
    rating: 4.5,
    ratingCount: 8,
    ratingSum: 36,
    views: 340,
    calls: 41,
    saves: 28,
    status: "approved",
    isVerified: true,
    isFeatured: true,
    bedrooms: 1,
    bathrooms: 1,
    floor: "গ্রাউন্ড ফ্লোর",
    size: "৪০০",
    furnishing: "unfurnished",
    targetTenant: "any",
    facilities: ["electricity", "water"],
    additionalCosts: "বিদ্যুৎ বিল রিডিং অনুযায়ী",
    advanceRent: "৫০,০০০ টাকা জামানত",
    availability: "available",
    images: ["https://images.unsplash.com/photo-1582037910029-15755290cc5f?auto=format&fit=crop&w=800&q=80"]
  },
  {
    title: "উপজেলা পরিষদের পিছনে নতুন নির্মিত ২ রুমের ছিমছাম ফ্ল্যাট",
    category: "flat",
    description: "২টি বেডরুম, ১টি বাথরুম, ডাইনিং ও রান্নাঘর। ছোট ফ্যামিলি বা সরকারি কর্মকর্তাদের থাকার জন্য অত্যন্ত উপযুক্ত। সম্পূর্ণ আলাদা প্রবেশপথ ও নিশ্ছিদ্র নিরাপত্তা রয়েছে। মোটরসাইকেল পার্কিং এর ব্যবস্থা আছে।",
    rent: "৫,০০০",
    location: "উপজেলা পরিষদ সংলগ্ন স্টাফ কোয়ার্টার রোড, পুঠিয়া সদর",
    ownerName: "ইঞ্জিনিয়ার আমিনুল ইসলাম",
    ownerPhone: "01733445566",
    details: "২ বেডরুম, ১ বাথরুম, আলাদা গেট, মোটরসাইকেল পার্কিং",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    union: "পুঠিয়া সদর",
    village: "উপজেলা কোয়ার্টার",
    rating: 4.4,
    ratingCount: 6,
    ratingSum: 26.4,
    views: 185,
    calls: 14,
    saves: 9,
    status: "approved",
    isVerified: false,
    isFeatured: false,
    bedrooms: 2,
    bathrooms: 1,
    balconies: 1,
    floor: "৩য় তলা",
    size: "৭৫০",
    furnishing: "unfurnished",
    targetTenant: "family",
    facilities: ["water", "electricity", "parking", "balcony"],
    additionalCosts: "সার্ভিস চার্জ ৫০০ টাকা",
    advanceRent: "১ মাসের ভাড়া অগ্রিম",
    availability: "available",
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"]
  },
  {
    title: "ছাত্রী মেস সিট ভাড়া হবে - কলেজের সামনে নিরাপদ আবাস",
    category: "mess",
    description: "শুধুমাত্র ছাত্রীদের জন্য সম্পূর্ণ নিরাপদ ও নিরিবিলি ছাদের রুমে সিট খালি আছে। সিসিটিভি ক্যামেরা এবং মহিলা গার্ড এর ব্যবস্থা আছে। ওয়াইফাই, বিশুদ্ধ সুপেয় পানি এবং বুয়ার ব্যবস্থা রয়েছে (বুয়ার বিল আলাদা)।",
    rent: "১,৫০০",
    location: "বানেশ্বর মহিলা ডিগ্রি কলেজের বিপরীত পাশে, বানেশ্বর",
    ownerName: "মিসেস সাবিনা খাতুন",
    ownerPhone: "01788990011",
    details: "ওয়াইফাই, সিসিটিভি নিরাপত্তা, সুপেয় পানি, বুয়ার সুবিধা",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    union: "বানেশ্বর",
    village: "কলেজ পাড়া",
    rating: 4.7,
    ratingCount: 11,
    ratingSum: 51.7,
    views: 210,
    calls: 25,
    saves: 16,
    status: "approved",
    isVerified: true,
    isFeatured: false,
    bedrooms: 1,
    bathrooms: 1,
    balconies: 1,
    floor: "৩য় তলা",
    size: "১৮০",
    furnishing: "semi-furnished",
    targetTenant: "female",
    facilities: ["water", "electricity", "wifi", "security", "balcony"],
    additionalCosts: "বিদ্যুৎ বিল বণ্টনযোগ্য",
    advanceRent: "১ মাসের এডভান্স",
    availability: "available",
    images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"]
  }
];

export function RentToLetHub({ onGoBack, initialCategory = "all" }: { onGoBack?: () => void; initialCategory?: string }) {
  const { user, userProfile } = useAuth();
  const { toggleSave, isSaved } = useFavorites();

  // Basic lists states
  const [ads, setAds] = useState<ToLetAd[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search Bar / Hero controls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [heroSearchText, setHeroSearchText] = useState<string>("");
  const [searchUnion, setSearchUnion] = useState<string>("all");
  const [searchMaxRent, setSearchMaxRent] = useState<string>("all");
  const [searchCategory, setSearchCategory] = useState<string>("all");

  // Filter systems
  const [activeTab, setActiveTab] = useState<string>(initialCategory);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>("all");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("relevance");

  // Advanced Filter values state
  const [advCategories, setAdvCategories] = useState<string[]>([]);
  const [advTenants, setAdvTenants] = useState<string[]>([]);
  const [advBedrooms, setAdvBedrooms] = useState<string>("all");
  const [advBathrooms, setAdvBathrooms] = useState<string>("all");
  const [advFurnishing, setAdvFurnishing] = useState<string>("all");
  const [advMinRent, setAdvMinRent] = useState<string>("");
  const [advMaxRent, setAdvMaxRent] = useState<string>("");
  const [advUnion, setAdvUnion] = useState<string>("all");
  const [advFacilities, setAdvFacilities] = useState<string[]>([]);

  // Detailed Modal view
  const [selectedAd, setSelectedAd] = useState<ToLetAd | null>(null);

  // Listing report
  const [reportAd, setReportAd] = useState<ToLetAd | null>(null);
  const [reportReason, setReportReason] = useState<string>("wrong_info");
  const [reportComment, setReportComment] = useState<string>("");
  const [reportingAdId, setReportingAdId] = useState<boolean>(false);

  // Auth & Creation Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCallConfirmOpen, setIsCallConfirmOpen] = useState<boolean>(false);
  const [confirmAd, setConfirmAd] = useState<ToLetAd | null>(null);

  // Editing logic
  const [editingAd, setEditingAd] = useState<ToLetAd | null>(null);

  // Form State (New / Edit wizard)
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<"house" | "mess" | "shop" | "flat" | "room" | "sublet" | "other">("flat");
  const [formRent, setFormRent] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formUnion, setFormUnion] = useState("পুঠিয়া সদর");
  const [formVillage, setFormVillage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [formBedrooms, setFormBedrooms] = useState<number>(2);
  const [formBathrooms, setFormBathrooms] = useState<number>(1);
  const [formBalconies, setFormBalconies] = useState<number>(1);
  const [formFloor, setFormFloor] = useState("");
  const [formSize, setFormSize] = useState("");
  const [formFurnishing, setFormFurnishing] = useState<"furnished" | "semi-furnished" | "unfurnished">("unfurnished");
  const [formTargetTenant, setFormTargetTenant] = useState<"family" | "bachelor" | "female" | "male" | "student" | "any">("family");
  const [formFacilities, setFormFacilities] = useState<string[]>([]);
  const [formAdditionalCosts, setFormAdditionalCosts] = useState("");
  const [formAdvanceRent, setFormAdvanceRent] = useState("");
  const [formOwnerName, setFormOwnerName] = useState("");
  const [formOwnerPhone, setFormOwnerPhone] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill profile info
  useEffect(() => {
    if (isAddModalOpen && userProfile) {
      setFormOwnerName(userProfile.name || "");
      setFormOwnerPhone(userProfile.phone || "");
      setFormWhatsapp(userProfile.phone || "");
    }
  }, [isAddModalOpen, userProfile]);

  // Toast trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch ads
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      let data = await getToLetAds();
      
      // If DB is completely empty, populate with seed data automatically
      if (data.length === 0) {
        console.log("No rental properties found, seeding default data...");
        for (const item of SEED_PROPERTIES) {
          await addToLetAd(item);
        }
        data = await getToLetAds();
      }
      setAds(data);
    } catch (e) {
      console.error("Error fetching properties:", e);
    } finally {
      setLoading(false);
    }
  };

  // Image upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview links locally
    const localPreviews = files.map(file => URL.createObjectURL(file));
    setFormImages(prev => [...prev, ...localPreviews]);
  };

  const uploadImagesToServer = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    setUploadingImages(true);
    const urls: string[] = [];
    try {
      for (const file of imageFiles) {
        const path = `rentals/${Date.now()}-${file.name}`;
        const downloadUrl = await uploadFileToStorage(file, path);
        urls.push(downloadUrl);
      }
      return urls;
    } catch (err) {
      console.error("Image upload failed, fallback to defaults.", err);
      // Fallback images matching categories
      return ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"];
    } finally {
      setUploadingImages(false);
    }
  };

  // Add Listing Submission
  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formRent.trim() || !formLocation.trim() || !formOwnerName.trim() || !formOwnerPhone.trim()) {
      triggerToast("অনুগ্রহ করে সবগুলি বাধ্যতামূলক (*) ঘর পূরণ করুন।");
      return;
    }

    setSubmitting(true);
    try {
      // Upload actual selected files first
      let finalImages = [...formImages.filter(img => img.startsWith("http"))];
      const uploadedUrls = await uploadImagesToServer();
      finalImages = [...finalImages, ...uploadedUrls];

      if (finalImages.length === 0) {
        // Fallback default image
        finalImages.push("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80");
      }

      const rawRent = formRent.replace(/[^0-9,]/g, "");

      const propertyData = {
        title: formTitle.trim(),
        category: formCategory,
        description: formDescription.trim(),
        rent: rawRent, // numeric string only for filtering/sorting
        location: formLocation.trim(),
        union: formUnion,
        village: formVillage.trim() || "পুঠিয়া",
        ownerName: formOwnerName.trim(),
        ownerPhone: formOwnerPhone.trim(),
        whatsapp: formWhatsapp.trim() || formOwnerPhone.trim(),
        details: formDetails.trim() || `${formBedrooms} বেড, ${formBathrooms} বাথ, ফ্লোর: ${formFloor || "N/A"}`,
        createdAt: new Date().toISOString(),
        bedrooms: formBedrooms,
        bathrooms: formBathrooms,
        balconies: formBalconies,
        floor: formFloor || "N/A",
        size: formSize || "N/A",
        furnishing: formFurnishing,
        targetTenant: formTargetTenant,
        facilities: formFacilities,
        additionalCosts: formAdditionalCosts,
        advanceRent: formAdvanceRent,
        images: finalImages,
        availability: "available" as const,
        isVerified: false,
        ownerId: user?.uid || "anonymous",
        views: 0,
        calls: 0,
        saves: 0,
        rating: 4.0,
        ratingCount: 1,
        ratingSum: 4.0
      };

      if (editingAd) {
        await updateToLetAd(editingAd.id, propertyData);
        triggerToast("বিজ্ঞাপনটি সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await addToLetAd(propertyData);
        triggerToast("বিজ্ঞাপনটি সফলভাবে পোস্ট করা হয়েছে এবং পর্যালোচনার জন্য পাঠানো হয়েছে!");
      }

      // Reset
      resetForm();
      fetchAds();
    } catch (err) {
      console.error("Listing save error:", err);
      triggerToast("দুঃখিত, বিজ্ঞাপনটি প্রকাশ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormCategory("flat");
    setFormRent("");
    setFormLocation("");
    setFormUnion("পুঠিয়া সদর");
    setFormVillage("");
    setFormDescription("");
    setFormDetails("");
    setFormBedrooms(2);
    setFormBathrooms(1);
    setFormBalconies(1);
    setFormFloor("");
    setFormSize("");
    setFormFurnishing("unfurnished");
    setFormTargetTenant("family");
    setFormFacilities([]);
    setFormAdditionalCosts("");
    setFormAdvanceRent("");
    setFormImages([]);
    setImageFiles([]);
    setEditingAd(null);
    setIsAddModalOpen(false);
  };

  const handleStartEdit = (ad: ToLetAd, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAd(ad);
    setFormTitle(ad.title);
    setFormCategory(ad.category || "flat");
    setFormRent(ad.rent);
    setFormLocation(ad.location);
    setFormUnion(ad.union || "পুঠিয়া সদর");
    setFormVillage(ad.village || "");
    setFormDescription(ad.description || "");
    setFormDetails(ad.details || "");
    setFormBedrooms(ad.bedrooms || 2);
    setFormBathrooms(ad.bathrooms || 1);
    setFormBalconies(ad.balconies || 0);
    setFormFloor(ad.floor || "");
    setFormSize(ad.size || "");
    setFormFurnishing(ad.furnishing || "unfurnished");
    setFormTargetTenant(ad.targetTenant || "family");
    setFormFacilities(ad.facilities || []);
    setFormAdditionalCosts(ad.additionalCosts || "");
    setFormAdvanceRent(ad.advanceRent || "");
    setFormOwnerName(ad.ownerName || "");
    setFormOwnerPhone(ad.ownerPhone || "");
    setFormWhatsapp(ad.whatsapp || "");
    setFormImages(ad.images || []);
    setIsAddModalOpen(true);
  };

  // Delete Listing
  const handleDeleteProperty = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই বাসা ভাড়ার বিজ্ঞাপনটি মুছে ফেলতে চান?")) {
      return;
    }

    try {
      await deleteToLetAd(id);
      setAds(prev => prev.filter(ad => ad.id !== id));
      triggerToast("বিজ্ঞাপনটি সফলভাবে মুছে ফেলা হয়েছে!");
      if (selectedAd?.id === id) {
        setSelectedAd(null);
      }
    } catch (err) {
      console.error(err);
      triggerToast("বিজ্ঞাপনটি মুছতে সমস্যা হয়েছে।");
    }
  };

  // Safe Call confirmation
  const initiateCall = (ad: ToLetAd, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmAd(ad);
    setIsCallConfirmOpen(true);
  };

  const executeCall = async () => {
    if (!confirmAd) return;
    await incrementToLetAdCalls(confirmAd.id);
    setAds(prev => prev.map(item => item.id === confirmAd.id ? { ...item, calls: (item.calls || 0) + 1 } : item));
    window.location.href = `tel:${confirmAd.ownerPhone}`;
    setIsCallConfirmOpen(false);
  };

  // Safe view detail trigger
  const handleOpenDetail = async (ad: ToLetAd) => {
    setSelectedAd(ad);
    await incrementToLetAdViews(ad.id);
    setAds(prev => prev.map(item => item.id === ad.id ? { ...item, views: (item.views || 0) + 1 } : item));
  };

  // Report submission
  const handleReportAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportAd) return;
    setReportingAdId(true);

    try {
      const existingReports = reportAd.reports || [];
      const updatedReports = [
        ...existingReports,
        {
          userId: user?.uid || "guest",
          reason: reportReason,
          comment: reportComment.trim(),
          timestamp: new Date().toISOString()
        }
      ];

      await updateToLetAd(reportAd.id, { reports: updatedReports });
      triggerToast("আপনার অভিযোগটি সফলভাবে জমা হয়েছে। অ্যাডমিন টিম দ্রুত যাচাই করবে। ধন্যবাদ।");
      
      // Update local state
      setAds(prev => prev.map(item => item.id === reportAd.id ? { ...item, reports: updatedReports } : item));
      setReportAd(null);
      setReportComment("");
    } catch (err) {
      console.error(err);
      triggerToast("দুঃখিত, অভিযোগ পাঠাতে সমস্যা হয়েছে।");
    } finally {
      setReportingAdId(false);
    }
  };

  // Favorites trigger
  const handleFavoriteToggle = (ad: ToLetAd, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentSaved = isSaved(ad.id);
    toggleSave({
      id: ad.id,
      type: "service",
      title: ad.title,
      subtitle: `ভাড়া: ৳${ad.rent} | অবস্থান: ${ad.location}`,
      linkId: "rent_to_let"
    });
    incrementToLetAdSaves(ad.id, !currentSaved);
    setAds(prev => prev.map(item => item.id === ad.id ? { ...item, saves: (item.saves || 0) + (currentSaved ? -1 : 1) } : item));
    triggerToast(currentSaved ? "পছন্দের তালিকা থেকে বাদ দেওয়া হয়েছে।" : "পছন্দের তালিকায় যুক্ত হয়েছে।");
  };

  // Sharing copy action
  const handleShareAd = (ad: ToLetAd, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `🏠 *${ad.title}*\n💰 ভাড়া: ৳${ad.rent} টাকা/মাস\n📍 লোকেশন: ${ad.location}\n📞 যোগাযোগ: ${ad.ownerName} (${ad.ownerPhone})\n\nআমাদের পুঠিয়া পোর্টাল থেকে বিস্তারিত দেখুন।`;
    
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: shareText,
        url: window.location.href
      }).then(() => triggerToast("সফলভাবে শেয়ার করা হয়েছে!"))
        .catch(() => {
          navigator.clipboard.writeText(shareText);
          triggerToast("বিজ্ঞাপনের বিবরণ ক্লিপবোর্ডে কপি করা হয়েছে!");
        });
    } else {
      navigator.clipboard.writeText(shareText);
      triggerToast("বিজ্ঞাপনের বিবরণ ক্লিপবোর্ডে কপি করা হয়েছে!");
    }
  };

  // Hero Search trigger
  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(heroSearchText);
    setActiveTab(searchCategory);
    setAdvUnion(searchUnion);
    setAdvMaxRent(searchMaxRent === "all" ? "" : searchMaxRent);
    triggerToast("অনুসন্ধান করা হচ্ছে...");
  };

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setHeroSearchText("");
    setSearchUnion("all");
    setSearchMaxRent("all");
    setSearchCategory("all");
    setActiveTab("all");
    setActiveQuickFilter("all");
    
    // Reset Advanced fields
    setAdvCategories([]);
    setAdvTenants([]);
    setAdvBedrooms("all");
    setAdvBathrooms("all");
    setAdvFurnishing("all");
    setAdvMinRent("");
    setAdvMaxRent("");
    setAdvUnion("all");
    setAdvFacilities([]);
    setSortBy("relevance");
    triggerToast("সব ফিল্টার রিসেট করা হয়েছে");
  };

  // Admin Verification Toggle
  const handleAdminVerify = async (ad: ToLetAd, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVerify = !ad.isVerified;
    try {
      await updateToLetAd(ad.id, { isVerified: nextVerify });
      setAds(prev => prev.map(item => item.id === ad.id ? { ...item, isVerified: nextVerify } : item));
      triggerToast(nextVerify ? "বিজ্ঞাপনটি ভেরিফাইড করা হয়েছে!" : "ভেরিফিকেশন প্রত্যাহার করা হয়েছে!");
    } catch (err) {
      console.error(err);
      triggerToast("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।");
    }
  };

  const handleAdminFeature = async (ad: ToLetAd, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextFeature = !ad.isFeatured;
    try {
      await updateToLetAd(ad.id, { isFeatured: nextFeature });
      setAds(prev => prev.map(item => item.id === ad.id ? { ...item, isFeatured: nextFeature } : item));
      triggerToast(nextFeature ? "ফিচার্ড তালিকায় যুক্ত করা হয়েছে!" : "ফিচার্ড তালিকা থেকে বাদ দেওয়া হয়েছে!");
    } catch (err) {
      console.error(err);
      triggerToast("আপডেট ব্যর্থ হয়েছে।");
    }
  };

  const handleAdminStatus = async (ad: ToLetAd, status: "pending" | "approved" | "rejected", e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateToLetAd(ad.id, { status });
      setAds(prev => prev.map(item => item.id === ad.id ? { ...item, status } : item));
      triggerToast(`স্ট্যাটাস পরিবর্তন করে "${status === 'approved' ? 'অনুমোদিত' : status === 'rejected' ? 'বাতিলকৃত' : 'অপেক্ষমাণ'}" করা হয়েছে!`);
    } catch (err) {
      console.error(err);
      triggerToast("আপডেট ব্যর্থ হয়েছে।");
    }
  };

  // Math-based search filtering and sorting engine
  const filteredAds = ads.filter(ad => {
    // 1. Text Search debounced match
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const titleMatch = ad.title.toLowerCase().includes(query);
      const descMatch = ad.description.toLowerCase().includes(query);
      const locMatch = ad.location.toLowerCase().includes(query);
      const vilMatch = ad.village?.toLowerCase().includes(query);
      const ownerMatch = ad.ownerName.toLowerCase().includes(query);
      const detMatch = ad.details?.toLowerCase().includes(query);
      if (!titleMatch && !descMatch && !locMatch && !vilMatch && !ownerMatch && !detMatch) {
        return false;
      }
    }

    // 2. Tab selection
    if (activeTab !== "all" && ad.category !== activeTab) {
      return false;
    }

    // 3. Union Filter
    const targetUnion = advUnion !== "all" ? advUnion : (searchUnion !== "all" ? searchUnion : "all");
    if (targetUnion !== "all" && ad.union !== targetUnion) {
      return false;
    }

    // 4. Rent limit matching
    const rentVal = parseFloat(ad.rent.replace(/[^0-9]/g, "")) || 0;
    
    // Quick filter check
    if (activeQuickFilter === "low_budget" && rentVal > 3000) return false;
    if (activeQuickFilter === "family" && ad.targetTenant !== "family") return false;
    if (activeQuickFilter === "bachelor" && ad.targetTenant !== "bachelor") return false;
    if (activeQuickFilter === "1bed" && ad.bedrooms !== 1) return false;
    if (activeQuickFilter === "2bed" && ad.bedrooms !== 2) return false;
    if (activeQuickFilter === "3bed" && (ad.bedrooms || 0) < 3) return false;
    if (activeQuickFilter === "furnished" && ad.furnishing !== "furnished") return false;
    if (activeQuickFilter === "new_post") {
      const days = (Date.now() - new Date(ad.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (days > 3) return false;
    }

    // Max rent search
    if (searchMaxRent !== "all") {
      const maxLimit = parseFloat(searchMaxRent);
      if (rentVal > maxLimit) return false;
    }

    // Min and Max rent from advanced filter
    if (advMinRent) {
      const minVal = parseFloat(advMinRent);
      if (rentVal < minVal) return false;
    }
    if (advMaxRent) {
      const maxVal = parseFloat(advMaxRent);
      if (rentVal > maxVal) return false;
    }

    // 5. Bedrooms & Bathrooms
    if (advBedrooms !== "all") {
      if (advBedrooms === "4+") {
        if ((ad.bedrooms || 0) < 4) return false;
      } else {
        if (ad.bedrooms !== parseInt(advBedrooms)) return false;
      }
    }
    if (advBathrooms !== "all") {
      if (advBathrooms === "3+") {
        if ((ad.bathrooms || 0) < 3) return false;
      } else {
        if (ad.bathrooms !== parseInt(advBathrooms)) return false;
      }
    }

    // 6. Furnishing
    if (advFurnishing !== "all" && ad.furnishing !== advFurnishing) {
      return false;
    }

    // 7. Advanced Target Tenants Checkbox Match
    if (advTenants.length > 0 && ad.targetTenant && !advTenants.includes(ad.targetTenant)) {
      return false;
    }

    // 8. Advanced Facilities Checklist Matches
    if (advFacilities.length > 0) {
      const adFac = ad.facilities || [];
      const hasAll = advFacilities.every(fac => adFac.includes(fac));
      if (!hasAll) return false;
    }

    // 9. Standard non-admin view matches ONLY approved unless owner is looking
    const isAdmin = userProfile?.role === "admin" || userProfile?.role === "super_admin";
    const isOwner = user && ad.ownerId === user.uid;
    if (!isAdmin && !isOwner && ad.status === "rejected") {
      return false;
    }

    return true;
  });

  // Sorting Engine
  const sortedAds = [...filteredAds].sort((a, b) => {
    const rentA = parseFloat(a.rent.replace(/[^0-9]/g, "")) || 0;
    const rentB = parseFloat(b.rent.replace(/[^0-9]/g, "")) || 0;

    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "lowToHigh") {
      return rentA - rentB;
    }
    if (sortBy === "highToLow") {
      return rentB - rentA;
    }
    if (sortBy === "mostViewed") {
      return (b.views || 0) - (a.views || 0);
    }
    // relevance - featured first then newest
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case "flat":
        return { label: "ফ্ল্যাট ভাড়া", icon: "🏢", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "house":
        return { label: "বাড়ি ভাড়া", icon: "🏡", bg: "bg-teal-50 text-teal-700 border-teal-200" };
      case "room":
        return { label: "রুম ভাড়া", icon: "🚪", bg: "bg-cyan-50 text-cyan-700 border-cyan-200" };
      case "mess":
        return { label: "ছাত্র মেস", icon: "🎓", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "sublet":
        return { label: "সাবলেট", icon: "🤝", bg: "bg-sky-50 text-sky-700 border-sky-200" };
      case "shop":
        return { label: "দোকান/অফিস", icon: "🏪", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { label: "অন্যান্য", icon: "🚜", bg: "bg-neutral-50 text-neutral-700 border-neutral-200" };
    }
  };

  const getTenantBengali = (target?: string) => {
    switch (target) {
      case "family": return "পরিবার";
      case "bachelor": return "ব্যাচেলর";
      case "female": return "মহিলা শিক্ষার্থী/চাকরিজীবী";
      case "male": return "পুরুষ ব্যাচেলর";
      case "student": return "শিক্ষার্থী";
      default: return "যে কেউ";
    }
  };

  const getFurnishingBengali = (furn?: string) => {
    switch (furn) {
      case "furnished": return "ফুল ফার্নিশড";
      case "semi-furnished": return "সেমি ফার্নিশড";
      default: return "আন-ফার্নিশড";
    }
  };

  const isAdmin = userProfile?.role === "admin" || userProfile?.role === "super_admin";

  return (
    <div className="p-0 space-y-0 bg-neutral-50 min-h-screen font-sans pb-24 text-neutral-800">
      
      {/* Dynamic Toast feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-55 bg-emerald-800 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-xl border border-emerald-600/30 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Navigation Bar */}
      <div className="bg-[#006847] text-white p-4 sticky top-0 z-40 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onGoBack && (
            <button 
              onClick={onGoBack}
              className="p-1.5 hover:bg-white/10 rounded-full transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
              <span>বাসা ভাড়া</span>
              <span className="bg-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold border border-white/10">
                পোর্টাল
              </span>
            </h1>
            <p className="text-[10px] text-emerald-100 font-medium">পুঠিয়া ও আশপাশের এলাকার ভাড়ার বাসা খুঁজে নিন</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (user) {
                setIsAddModalOpen(true);
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            className="bg-white text-[#006847] hover:bg-emerald-50 text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-md transition flex items-center gap-1 active:scale-95 cursor-pointer border border-transparent"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>বিজ্ঞাপন দিন</span>
          </button>
        </div>
      </div>

      {/* 2. Brand Hero Container */}
      <div className="px-4 pt-6 pb-2 bg-gradient-to-b from-emerald-50/70 to-neutral-50">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-emerald-100 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-32 h-32 text-emerald-50 pointer-events-none -mr-4 -mb-4">
            <Home className="w-full h-full" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md border border-emerald-150 inline-block mb-1">
                🏡 আপনার পছন্দের বাসা খুঁজে নিন
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                এলাকা, ভাড়া ও প্রয়োজন অনুযায়ী বাসা খুঁজুন
              </h2>
            </div>

            {/* Quick Hero Search Wizard */}
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-neutral-25 p-2 rounded-2xl border border-neutral-150">
              
              {/* Search text input */}
              <div className="relative col-span-1 sm:col-span-1">
                <span className="absolute left-3 top-3 text-[10px]">🔍</span>
                <input
                  type="text"
                  placeholder="এলাকা বা বাসার ধরন..."
                  value={heroSearchText}
                  onChange={(e) => setHeroSearchText(e.target.value)}
                  className="w-full pl-7 pr-2 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                />
              </div>

              {/* Union Selector */}
              <div className="relative">
                <span className="absolute left-3 top-3 text-[10px]">📍</span>
                <select
                  value={searchUnion}
                  onChange={(e) => setSearchUnion(e.target.value)}
                  className="w-full pl-7 pr-4 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-semibold appearance-none cursor-pointer"
                >
                  <option value="all">সব ইউনিয়ন</option>
                  <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                  <option value="বানেশ্বর">বানেশ্বর</option>
                  <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                  <option value="জিউপাড়া">জিউপাড়া</option>
                  <option value="ভালুকগাছী">ভালুকগাছী</option>
                  <option value="শিলماড়িয়া">শিলমাড়িয়া</option>
                </select>
                <div className="absolute right-3.5 top-3 pointer-events-none text-[8px] text-neutral-400">▼</div>
              </div>

              {/* Budget Limit */}
              <div className="relative">
                <span className="absolute left-3 top-3 text-[10px]">💰</span>
                <select
                  value={searchMaxRent}
                  onChange={(e) => setSearchMaxRent(e.target.value)}
                  className="w-full pl-7 pr-4 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-semibold appearance-none cursor-pointer"
                >
                  <option value="all">যেকোনো বাজেট</option>
                  <option value="2000">৳২,০০০ এর মধ্যে</option>
                  <option value="4000">৳৪,০০০ এর মধ্যে</option>
                  <option value="6000">৳৬,০০০ এর মধ্যে</option>
                  <option value="10000">৳১০,০০০ এর মধ্যে</option>
                  <option value="15000">৳১৫,০০০ এর মধ্যে</option>
                </select>
                <div className="absolute right-3.5 top-3 pointer-events-none text-[8px] text-neutral-400">▼</div>
              </div>

              {/* Submit trigger */}
              <button
                type="submit"
                className="w-full bg-[#006847] hover:bg-emerald-800 text-white text-xs font-black py-2 rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>বাসা খুঁজুন</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Main Filter and Listings Section */}
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        
        {/* Dynamic property count panel */}
        <div className="flex justify-between items-center bg-white px-4 py-3 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-600 rounded-full animate-ping"></span>
            <span className="text-xs font-bold text-neutral-700">
              মোট <strong className="text-emerald-700 text-sm font-black bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{sortedAds.length} টি</strong> বাসা পাওয়া গেছে
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Advanced Filters Trigger */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:border-emerald-600 hover:bg-emerald-25/50 text-neutral-700 hover:text-[#006847] transition text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Filter className="w-3.5 h-3.5 text-[#006847]" />
              <span>ফিল্টার</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3.5 pr-6 py-1.5 bg-white border border-neutral-300 hover:border-emerald-600 rounded-xl text-xs font-bold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer text-neutral-700"
              >
                <option value="relevance">প্রাসঙ্গিক</option>
                <option value="newest">নতুন পোস্ট</option>
                <option value="lowToHigh">কম ভাড়া</option>
                <option value="highToLow">বেশি ভাড়া</option>
                <option value="mostViewed">সর্বাধিক দেখা</option>
              </select>
              <div className="absolute right-2 top-2 pointer-events-none text-[8px] text-neutral-400">▼</div>
            </div>
          </div>
        </div>

        {/* 4. Interactive Property Type Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: "all", label: "সকল বাসা", icon: "📋" },
            { id: "flat", label: "ফ্ল্যাট ভাড়া", icon: "🏢" },
            { id: "house", label: "বাড়ি ভাড়া", icon: "🏡" },
            { id: "room", label: "রুম ভাড়া", icon: "🚪" },
            { id: "mess", label: "ছাত্র মেস", icon: "🎓" },
            { id: "sublet", label: "সাবলেট", icon: "🤝" },
            { id: "shop", label: "দোকান / অফিস", icon: "🏪" },
            { id: "other", label: "অন্যান্য", icon: "🚜" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  triggerToast(`${tab.label} ফিল্টার করা হয়েছে`);
                }}
                className={`px-4 py-2.5 rounded-xl border flex items-center gap-1.5 shrink-0 text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#006847] text-white border-transparent shadow-md scale-102"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 5. Horizontal Quick Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: "all", label: "সব ফিল্টার রিসেট" },
            { id: "low_budget", label: "কম বাজেট (৳৩০০০ এর নিচে)" },
            { id: "family", label: "পরিবার উপযোগী" },
            { id: "bachelor", label: "ব্যাচেলর উপযোগী" },
            { id: "1bed", label: "১ বেডরুম" },
            { id: "2bed", label: "২ বেডরুম" },
            { id: "3bed", label: "৩+ বেডরুম" },
            { id: "furnished", label: "ফার্নিশড" },
            { id: "new_post", label: "নতুন পোস্ট" }
          ].map((chip) => {
            const isActive = activeQuickFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  if (chip.id === "all") {
                    handleResetFilters();
                  } else {
                    setActiveQuickFilter(chip.id);
                    triggerToast(`কুইক ফিল্টার: ${chip.label}`);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg border text-[10px] sm:text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 border-emerald-400 font-extrabold shadow-2xs"
                    : "bg-neutral-100 text-neutral-600 border-neutral-200/80 hover:bg-neutral-200/40"
                }`}
              >
                {chip.id !== "all" && isActive && <Check className="w-3 h-3 inline-block mr-1" />}
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Search status clear indicator */}
        {(searchQuery || advUnion !== "all" || advMaxRent || advBedrooms !== "all" || advFacilities.length > 0) && (
          <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl flex justify-between items-center text-xs">
            <span className="font-semibold text-emerald-800">
              সক্রিয় ফিল্টার রয়েছে। কোনো কোনো রেজাল্ট ফিল্টার করা হতে পারে।
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[#006847] font-black underline cursor-pointer hover:text-emerald-950"
            >
              সব মুছে ফেলুন
            </button>
          </div>
        )}

        {/* 6. Main Listings Layout */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="w-full h-40 bg-neutral-150 rounded-xl"></div>
                <div className="h-4 bg-neutral-150 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-150 rounded w-1/2"></div>
                <div className="h-8 bg-neutral-150 rounded w-full pt-2"></div>
              </div>
            ))}
          </div>
        ) : sortedAds.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 shadow-inner">
              <Home className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-800 text-sm">কোনো ভাড়ার বিজ্ঞাপন পাওয়া যায়নি</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                আপনার দেওয়া ফিল্টার বা সার্চ কুয়েরির সাথে মিলছে এমন কোনো সক্রিয় বাসা ভাড়া বিজ্ঞাপন এই মুহূর্তে পাওয়া যায়নি। আপনি নতুন কোনো বিজ্ঞাপন দিয়ে শুরু করতে পারেন!
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleResetFilters}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                ফিল্টার রিসেট
              </button>
              <button
                onClick={() => {
                  if (user) setIsAddModalOpen(true);
                  else setIsAuthModalOpen(true);
                }}
                className="bg-[#006847] text-white hover:bg-emerald-800 text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                নতুন বিজ্ঞাপন দিন
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {sortedAds.map((ad) => {
                const catMeta = getCategoryMeta(ad.category);
                const isAdSaved = isSaved(ad.id);
                const rentVal = parseFloat(ad.rent.replace(/[^0-9]/g, "")) || 0;
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    key={ad.id}
                    onClick={() => handleOpenDetail(ad)}
                    className="bg-white border border-neutral-200 hover:border-emerald-300 rounded-2xl p-4.5 hover:shadow-md transition duration-300 cursor-pointer flex flex-col justify-between space-y-3.5 relative group overflow-hidden shadow-2xs"
                  >
                    {/* Featured Stripe Accent */}
                    {ad.isFeatured && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400"></div>
                    )}

                    {/* Property Card Header details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-1.5">
                        
                        {/* Category badge */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border uppercase tracking-wider flex items-center gap-1 ${catMeta.bg}`}>
                            <span>{catMeta.icon}</span>
                            <span>{catMeta.label}</span>
                          </span>

                          {ad.isVerified && (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg text-[9px] font-black flex items-center gap-0.5">
                              ✓ যাচাইকৃত
                            </span>
                          )}

                          {ad.isFeatured && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg text-[9px] font-black">
                              ★ ফিচার্ড
                            </span>
                          )}

                          {ad.status === "pending" && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                              অপেক্ষমাণ
                            </span>
                          )}
                        </div>

                        {/* Save & Tools */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleFavoriteToggle(ad, e)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isAdSaved
                                ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                                : "bg-neutral-50 border-neutral-200 text-neutral-400 hover:text-rose-500 hover:bg-neutral-100"
                            }`}
                            title={isAdSaved ? "সংরক্ষণ বাতিল করুন" : "পছন্দের তালিকায় যুক্ত করুন"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isAdSaved ? "fill-rose-500 text-rose-500" : ""}`} />
                          </button>
                          
                          <button
                            onClick={(e) => handleShareAd(ad, e)}
                            className="p-1.5 rounded-lg border bg-neutral-50 border-neutral-200 text-neutral-400 hover:text-emerald-700 hover:bg-neutral-100 transition cursor-pointer"
                            title="শেয়ার করুন"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Owner/Admin actions block */}
                          {(user && ad.ownerId === user.uid) && (
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => handleStartEdit(ad, e)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-100 transition cursor-pointer"
                                title="সম্পাদনা করুন"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteProperty(ad.id, e)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Property Image Cover */}
                      <div className="w-full h-36 bg-neutral-100 rounded-xl relative overflow-hidden border border-neutral-150">
                        <img
                          src={ad.images && ad.images[0] ? ad.images[0] : "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"}
                          alt={ad.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-black text-white">
                          ৳{ad.rent} টাকা / মাস
                        </div>
                        {ad.availability === "rented" && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-red-600 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                              ভাড়া হয়ে গেছে
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Title & Description details */}
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-neutral-800 text-xs sm:text-sm group-hover:text-emerald-900 transition line-clamp-1 leading-snug">
                          {ad.title}
                        </h3>
                        <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                          {ad.description}
                        </p>
                      </div>
                    </div>

                    {/* Technical details Grid (beds, baths, size, location) */}
                    <div className="border-t border-neutral-100 pt-3 space-y-1.5 text-[11px] text-neutral-600 font-medium">
                      
                      {/* Bed/Bath summaries */}
                      <div className="flex items-center gap-3 text-neutral-500 font-bold">
                        {ad.bedrooms && (
                          <span>🛏️ {ad.bedrooms} বেড</span>
                        )}
                        {ad.bathrooms && (
                          <span>🚿 {ad.bathrooms} বাথ</span>
                        )}
                        {ad.balconies !== undefined && (
                          <span>🌿 {ad.balconies} বারান্দা</span>
                        )}
                        {ad.size && ad.size !== "N/A" && (
                          <span>📐 {ad.size} স্কয়ারফিট</span>
                        )}
                      </div>

                      <div className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          <strong className="text-neutral-700">অবস্থান:</strong> {ad.location} {ad.village ? `(${ad.village})` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Admin Actions Strip */}
                    {isAdmin && (
                      <div className="border-t border-dashed border-red-150 pt-2.5 flex flex-wrap gap-1 items-center bg-red-25/40 p-2 rounded-xl">
                        <span className="text-[9px] font-black text-red-800 uppercase block w-full mb-1">🛡️ অ্যাডমিন অ্যাকশনস:</span>
                        <button
                          onClick={(e) => handleAdminVerify(ad, e)}
                          className={`px-2 py-0.5 rounded text-[9px] font-black border ${ad.isVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white border-neutral-300'}`}
                        >
                          {ad.isVerified ? "ভেরিফাইড বাতিল" : "ভেরিফাই করুন"}
                        </button>
                        <button
                          onClick={(e) => handleAdminFeature(ad, e)}
                          className={`px-2 py-0.5 rounded text-[9px] font-black border ${ad.isFeatured ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white border-neutral-300'}`}
                        >
                          {ad.isFeatured ? "ফিচার্ড বাতিল" : "ফিচার্ড করুন"}
                        </button>
                        <div className="flex gap-0.5">
                          <button
                            onClick={(e) => handleAdminStatus(ad, "approved", e)}
                            className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-700 text-white"
                          >
                            অনুমোদন
                          </button>
                          <button
                            onClick={(e) => handleAdminStatus(ad, "rejected", e)}
                            className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white"
                          >
                            প্রত্যাখ্যান
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-100/60">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(ad);
                        }}
                        className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold py-2 rounded-xl transition text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>বিস্তারিত দেখুন</span>
                      </button>
                      <button
                        onClick={(e) => initiateCall(ad, e)}
                        className="w-full bg-[#006847] hover:bg-emerald-800 text-white text-xs font-black py-2 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>যোগাযোগ করুন</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* 7. General Security Guidelines Warning Panel */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">⚠️</span>
          <div className="text-[11px] text-amber-900 leading-normal text-justify space-y-1">
            <strong>নিরাপদ থাকার নির্দেশিকা:</strong>
            <p>
              ১. যেকোনো ভাড়ার চুক্তি সম্পন্ন করার পূর্বে সশরীরে বাসা পরিদর্শন করে সত্যতা নিজে যাচাই করুন।
              <br />
              ২. কোনো বিজ্ঞাপনদাতার সাথে আর্থিক লেনদেন করার পূর্বে প্রামাণিক স্ট্যাম্প ও এনআইডি কপি সংগ্রহ করুন। 
              <br />
              ৩. পুঠিয়া রাজবাড়ী পোর্টাল কোনো অযাচিত লেনদেনের জন্য দায়ী থাকবে না। কোনো জালিয়াতির তথ্য পেলে অবিলম্বে আমাদের এডমিন টিমকে নিচে রিপোর্ট করুন।
            </p>
          </div>
        </div>

      </div>

      {/* MODAL WIZARD 1: ADVANCED FILTER BOTTOM SHEET / SIDEBAR */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-150 flex flex-col max-h-[90vh] text-xs text-neutral-800"
            >
              <div className="bg-[#006847] text-white p-4.5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-4.5 h-4.5 text-emerald-300" />
                  <h3 className="font-extrabold text-sm">উন্নত ফিল্টার অপশন</h3>
                </div>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Filters Scroll area */}
              <div className="p-5 overflow-y-auto space-y-4">
                
                {/* Bedrooms selection */}
                <div className="space-y-1.5">
                  <label className="block text-neutral-700 font-extrabold">বেডরুমের সংখ্যা</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {["all", "1", "2", "3", "4+"].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setAdvBedrooms(num)}
                        className={`py-2 rounded-xl border text-center font-bold cursor-pointer transition ${
                          advBedrooms === num
                            ? "bg-emerald-50 border-emerald-500 text-[#006847] font-black"
                            : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        {num === "all" ? "সকল" : `${num}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bathrooms selection */}
                <div className="space-y-1.5">
                  <label className="block text-neutral-700 font-extrabold">বাথরুমের সংখ্যা</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["all", "1", "2", "3+"].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setAdvBathrooms(num)}
                        className={`py-2 rounded-xl border text-center font-bold cursor-pointer transition ${
                          advBathrooms === num
                            ? "bg-emerald-50 border-emerald-500 text-[#006847] font-black"
                            : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        {num === "all" ? "সকল" : `${num}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tenant filter */}
                <div className="space-y-1.5">
                  <label className="block text-neutral-700 font-extrabold">ভাড়াটিয়ার ধরন (Tenant Target)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "family", label: "পরিবার (Family)" },
                      { id: "bachelor", label: "ব্যাচেলর (Bachelor)" },
                      { id: "female", label: "ছাত্রী/মহিলা" },
                      { id: "male", label: "ছাত্র/পুরুষ" },
                      { id: "student", label: "শিক্ষার্থী (Student)" }
                    ].map((item) => {
                      const isChecked = advTenants.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setAdvTenants(prev => 
                              isChecked ? prev.filter(t => t !== item.id) : [...prev, item.id]
                            );
                          }}
                          className={`py-2 px-3 rounded-xl border font-bold text-left flex items-center gap-2 cursor-pointer ${
                            isChecked
                              ? "bg-emerald-50 border-emerald-500 text-[#006847]"
                              : "bg-neutral-50 border-neutral-200"
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] text-white ${isChecked ? 'bg-emerald-600' : 'bg-white'}`}>✓</span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Furnishing filter */}
                <div className="space-y-1.5">
                  <label className="block text-neutral-700 font-extrabold">আসবাবপত্র (Furnishing Status)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: "all", label: "যেকোনো" },
                      { id: "unfurnished", label: "আন-ফার্নিশড" },
                      { id: "semi-furnished", label: "সেমি" },
                      { id: "furnished", label: "ফুল ফার্নিশড" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setAdvFurnishing(f.id)}
                        className={`py-2 rounded-xl border text-center font-bold text-[10px] cursor-pointer transition ${
                          advFurnishing === f.id
                            ? "bg-emerald-50 border-emerald-500 text-[#006847] font-black"
                            : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom rent range */}
                <div className="space-y-1.5">
                  <label className="block text-neutral-700 font-extrabold">ভাড়ার পরিধি (৳ ভাড়া সীমা)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="সর্বনিম্ন"
                      value={advMinRent}
                      onChange={(e) => setAdvMinRent(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2 bg-neutral-50 font-bold"
                    />
                    <span>থেকে</span>
                    <input
                      type="number"
                      placeholder="সর্বোচ্চ"
                      value={advMaxRent}
                      onChange={(e) => setAdvMaxRent(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2 bg-neutral-50 font-bold"
                    />
                  </div>
                </div>

                {/* Facilities Checklist */}
                <div className="space-y-1.5">
                  <label className="block text-neutral-700 font-extrabold">প্রয়োজনীয় সুযোগ-সুবিধাসমূহ</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "water", label: "💧 সুপেয় পানি" },
                      { id: "electricity", label: "⚡ সার্বক্ষণিক বিদ্যুৎ" },
                      { id: "gas", label: "🔥 তিতাস/সিলিন্ডার গ্যাস" },
                      { id: "parking", label: "🚗 পার্কিং" },
                      { id: "lift", label: "🛗 লিফট" },
                      { id: "security", label: "🔒 নিরাপত্তা কর্মী" },
                      { id: "wifi", label: "📶 ওয়াই-ফাই" },
                      { id: "balcony", label: "🌿 দক্ষিণমুখী বারান্দা" }
                    ].map((item) => {
                      const isChecked = advFacilities.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setAdvFacilities(prev => 
                              isChecked ? prev.filter(f => f !== item.id) : [...prev, item.id]
                            );
                          }}
                          className={`p-2 rounded-xl border font-bold text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                            isChecked
                              ? "bg-emerald-50 border-emerald-500 text-[#006847]"
                              : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100"
                          }`}
                        >
                          <span className="text-[10px]">{item.label}</span>
                          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] text-white ${isChecked ? 'bg-emerald-600' : 'bg-white'}`}>✓</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Action buttons footer */}
              <div className="bg-neutral-50 p-4.5 border-t border-neutral-150 flex gap-2 justify-end shrink-0">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4.5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-600 font-bold cursor-pointer"
                >
                  সব রিসেট
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="bg-[#006847] hover:bg-emerald-800 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  ফিল্টার প্রয়োগ করুন
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WIZARD 2: ADD RENTAL PROPERTY WIZARD (Wizard/Form) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-neutral-150 flex flex-col my-8"
            >
              {/* Header */}
              <div className="bg-[#006847] text-white p-5 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                    <PlusCircle className="w-5 h-5 text-emerald-300" />
                    {editingAd ? "বিজ্ঞাপন তথ্য সংশোধন করুন" : "নতুন বাসা ভাড়ার বিজ্ঞাপন ফরম"}
                  </h3>
                  <p className="text-[10px] text-emerald-100 mt-1">সবগুলো তথ্য নির্ভুলভাবে দিন যাতে ভাড়াটিয়ারা সহজে যোগাযোগ করতে পারে।</p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body container */}
              <form onSubmit={handleCreateAd} className="p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-neutral-700 font-black">বিজ্ঞাপনের আকর্ষক শিরোনাম <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: ডিগ্রী কলেজের পাশে নতুন নির্মিত ৩ বেডরুমের ফ্যামিলি ফ্ল্যাট"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-semibold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Category & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-black">বাসার ধরন / ক্যাটাগরি <span className="text-red-500">*</span></label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-bold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="flat">ফ্ল্যাট (Flat)</option>
                      <option value="house">পুরো বাড়ি (House)</option>
                      <option value="room">একক রুম (Room)</option>
                      <option value="mess">মেস সিট (Mess)</option>
                      <option value="sublet">সাবলেট (Sublet)</option>
                      <option value="shop">বাণিজ্যিক দোকান/অফিস</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-black">মাসিক ভাড়া (টাকায়) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="উদা: ৭,৫০০ (আলোচনা সাপেক্ষ হলে লিখুন)"
                      value={formRent}
                      onChange={(e) => setFormRent(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-bold focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Location controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-black">ইউনিয়ন <span className="text-red-500">*</span></label>
                    <select
                      value={formUnion}
                      onChange={(e) => setFormUnion(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-bold"
                    >
                      <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                      <option value="বানেশ্বর">বানেশ্বর</option>
                      <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                      <option value="জিউপাড়া">জিউপাড়া</option>
                      <option value="ভালুকগাছী">ভালুকগাছী</option>
                      <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-bold">গ্রাম / পাড়া</label>
                    <input
                      type="text"
                      placeholder="উদা: কলেজ পাড়া"
                      value={formVillage}
                      onChange={(e) => setFormVillage(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-black">সঠিক ঠিকানা <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="উদা: ডিগ্রি কলেজ মোড়, পুঠিয়া থানা সংলগ্ন"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-semibold"
                    />
                  </div>
                </div>

                {/* Bedroom Details & Furnishing */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-black">বেডরুম</label>
                    <input
                      type="number"
                      min={0}
                      value={formBedrooms}
                      onChange={(e) => setFormBedrooms(parseInt(e.target.value) || 0)}
                      className="w-full border border-neutral-200 rounded-xl p-2 bg-neutral-50 font-bold text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-black">বাথরুম</label>
                    <input
                      type="number"
                      min={0}
                      value={formBathrooms}
                      onChange={(e) => setFormBathrooms(parseInt(e.target.value) || 0)}
                      className="w-full border border-neutral-200 rounded-xl p-2 bg-neutral-50 font-bold text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-bold">বারান্দা</label>
                    <input
                      type="number"
                      min={0}
                      value={formBalconies}
                      onChange={(e) => setFormBalconies(parseInt(e.target.value) || 0)}
                      className="w-full border border-neutral-200 rounded-xl p-2 bg-neutral-50 font-bold text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-bold">আয়তন (স্কয়ারফিট)</label>
                    <input
                      type="text"
                      placeholder="উদা: ১২৫০"
                      value={formSize}
                      onChange={(e) => setFormSize(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2 bg-neutral-50 font-bold text-center"
                    />
                  </div>
                </div>

                {/* Floor and Target Tenant */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-bold">কোন ফ্লোর/তলা</label>
                    <input
                      type="text"
                      placeholder="উদা: ২য় তলা"
                      value={formFloor}
                      onChange={(e) => setFormFloor(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-black">ভাড়াটিয়া নির্বাচন</label>
                    <select
                      value={formTargetTenant}
                      onChange={(e) => setFormTargetTenant(e.target.value as any)}
                      className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-bold"
                    >
                      <option value="family">পরিবার (Family)</option>
                      <option value="bachelor">ব্যাচেলর (Bachelor)</option>
                      <option value="female">ছাত্রী / মহিলা</option>
                      <option value="male">ছাত্র / পুরুষ</option>
                      <option value="student">শিক্ষার্থী</option>
                      <option value="any">যে কেউ (Any)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-black">আসবাবপত্র</label>
                    <select
                      value={formFurnishing}
                      onChange={(e) => setFormFurnishing(e.target.value as any)}
                      className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-bold"
                    >
                      <option value="unfurnished">আন-ফার্নিশড</option>
                      <option value="semi-furnished">সেমি-ফার্নিশড</option>
                      <option value="furnished">ফুল ফার্নিশড</option>
                    </select>
                  </div>
                </div>

                {/* Additional costs & Advance rent */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-bold">অন্যান্য অতিরিক্ত খরচ (বিদ্যুৎ, সার্ভিস চার্জ ইত্যাদি)</label>
                    <input
                      type="text"
                      placeholder="উদা: বিদ্যুৎ আলাদা রিডিং অনুযায়ী, ময়লা বিল ৫০ টাকা"
                      value={formAdditionalCosts}
                      onChange={(e) => setFormAdditionalCosts(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-bold">অগ্রিম জমা বা সিকিউরিটি ডেপোজিট</label>
                    <input
                      type="text"
                      placeholder="উদা: ২ মাসের ভাড়া অগ্রিম দিতে হবে"
                      value={formAdvanceRent}
                      onChange={(e) => setFormAdvanceRent(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-semibold"
                    />
                  </div>
                </div>

                {/* Facilities Checklist Checkboxes */}
                <div className="space-y-1.5">
                  <label className="block text-neutral-700 font-black">সুবিধাসমূহ নির্বাচন করুন</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "water", label: "💧 পানি" },
                      { id: "electricity", label: "⚡ বিদ্যুৎ" },
                      { id: "gas", label: "🔥 গ্যাস সংযোগ" },
                      { id: "parking", label: "🚗 পার্কিং" },
                      { id: "lift", label: "🛗 লিফট" },
                      { id: "security", label: "🔒 সিকিউরিটি" },
                      { id: "wifi", label: "📶 ওয়াই-ফাই" },
                      { id: "balcony", label: "🌿 দক্ষিণমুখী বারান্দা" }
                    ].map((item) => {
                      const isChecked = formFacilities.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setFormFacilities(prev => 
                              isChecked ? prev.filter(f => f !== item.id) : [...prev, item.id]
                            );
                          }}
                          className={`p-2 rounded-xl border font-bold flex items-center justify-between cursor-pointer transition ${
                            isChecked
                              ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                              : "bg-neutral-50 border-neutral-200"
                          }`}
                        >
                          <span className="text-[10px]">{item.label}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] text-white ${isChecked ? 'bg-emerald-600' : 'bg-white'}`}>✓</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed description */}
                <div className="space-y-1">
                  <label className="block text-neutral-700 font-black">বিস্তারিত বিবরণ <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={4}
                    placeholder="বাসাটির চারপাশের পরিবেশ কেমন, পানি সুব্যবস্থা কি না, এলাকাটি কতোটা নিরাপদ বা অন্যান্য তথ্য বিস্তারিত লিখুন..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-semibold focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Upload drag-drop photos layout */}
                <div className="space-y-1.5">
                  <label className="block text-neutral-700 font-black">বাসার আকর্ষণীয় ছবি সংযুক্ত করুন</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer hover:bg-neutral-50 transition"
                  >
                    <Plus className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
                    <span className="block font-bold text-neutral-600 text-[11px]">ছবি নির্বাচন করতে এখানে ক্লিক করুন</span>
                    <span className="block text-[9px] text-neutral-400 mt-0.5">JPEG, PNG সর্বোচ্চ ৫টি ছবি (প্রতিটি সর্বোচ্চ ৫ এমবি)</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Selected Previews */}
                  {formImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {formImages.map((img, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-xl border border-neutral-200 relative overflow-hidden shrink-0">
                          <img src={img} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setFormImages(prev => prev.filter((_, i) => i !== idx));
                              setImageFiles(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 p-0.5 rounded-full text-white cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Owner contact details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-150">
                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-black">বিজ্ঞাপনদাতার নাম <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="উদা: মোঃ আব্দুর রহিম"
                      value={formOwnerName}
                      onChange={(e) => setFormOwnerName(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2 bg-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-black">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="উদা: 017XXXXXXXX"
                      value={formOwnerPhone}
                      onChange={(e) => setFormOwnerPhone(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2 bg-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-neutral-700 font-bold">হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)</label>
                    <input
                      type="tel"
                      placeholder="উদা: 017XXXXXXXX"
                      value={formWhatsapp}
                      onChange={(e) => setFormWhatsapp(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl p-2 bg-white font-bold"
                    />
                  </div>
                </div>

                {/* Form Action Controls */}
                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4.5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-600 font-bold cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImages}
                    className="bg-[#006847] hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    {submitting || uploadingImages ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>আপলোড ও প্রকাশ করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>বিজ্ঞাপন প্রকাশ করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: PROPERTY DETAILED VIEW OVERLAY */}
      <AnimatePresence>
        {selectedAd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-150 text-xs text-neutral-800 flex flex-col max-h-[90vh]"
            >
              {/* Cover Image Slider on top of detail */}
              <div className="w-full h-52 bg-neutral-100 relative shrink-0">
                <img
                  src={selectedAd.images && selectedAd.images[0] ? selectedAd.images[0] : "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"}
                  alt={selectedAd.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                {/* Actions float overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                  <button
                    onClick={() => setSelectedAd(null)}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => handleFavoriteToggle(selectedAd, e)}
                      className={`p-1.5 rounded-full backdrop-blur-md transition ${isSaved(selectedAd.id) ? 'bg-rose-600 text-white' : 'bg-black/30 hover:bg-black/50 text-white'}`}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={(e) => handleShareAd(selectedAd, e)}
                      className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="bg-emerald-600/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider inline-block mb-1">
                    {getCategoryMeta(selectedAd.category).label}
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight leading-snug line-clamp-2">
                    {selectedAd.title}
                  </h3>
                </div>
              </div>

              {/* Detailed specs content */}
              <div className="p-5 space-y-4 overflow-y-auto">
                
                {/* Rent Info and availability callout */}
                <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-neutral-400 font-bold uppercase block">💰 মাসিক ভাড়া</span>
                    <span className="text-[#006847] font-black text-base">৳ {selectedAd.rent} টাকা / মাস</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-neutral-400 font-bold uppercase block">🟢 বর্তমান স্ট্যাটাস</span>
                    <span className="text-emerald-800 font-extrabold text-xs flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
                      <span>ভাড়া হবে</span>
                    </span>
                  </div>
                </div>

                {/* Facilities Badges and stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-150">
                    <span className="text-neutral-400 text-[10px] block font-bold">🛏️ বেডরুম</span>
                    <span className="font-black text-xs text-neutral-800">{selectedAd.bedrooms || "N/A"} টি</span>
                  </div>
                  <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-150">
                    <span className="text-neutral-400 text-[10px] block font-bold">🚿 বাথরুম</span>
                    <span className="font-black text-xs text-neutral-800">{selectedAd.bathrooms || "N/A"} টি</span>
                  </div>
                  <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-150">
                    <span className="text-neutral-400 text-[10px] block font-bold">🌿 বারান্দা</span>
                    <span className="font-black text-xs text-neutral-800">{selectedAd.balconies || "০"} টি</span>
                  </div>
                </div>

                {/* Core descriptions */}
                <div className="space-y-1.5">
                  <h4 className="font-black text-[#006847] text-xs">📋 বিবরণ ও বর্ণনা</h4>
                  <p className="text-neutral-600 leading-relaxed text-justify bg-neutral-25 border border-neutral-100 p-3 rounded-2xl whitespace-pre-wrap font-medium">
                    {selectedAd.description}
                  </p>
                </div>

                {/* Amenities List */}
                <div className="space-y-2">
                  <h4 className="font-black text-[#006847] text-xs">⚙️ সুযোগ-সুবিধাসমূহ</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAd.facilities && selectedAd.facilities.length > 0 ? (
                      selectedAd.facilities.map((fac, idx) => {
                        let icon = "✓";
                        let name = fac;
                        if (fac === "water") { icon = "💧"; name = "বিশুদ্ধ পানি"; }
                        if (fac === "electricity") { icon = "⚡"; name = "সার্বক্ষণিক বিদ্যুৎ"; }
                        if (fac === "gas") { icon = "🔥"; name = "গ্যাস সংযোগ"; }
                        if (fac === "parking") { icon = "🚗"; name = "পার্কিং গ্যারেজ"; }
                        if (fac === "lift") { icon = "🛗"; name = "লিফট"; }
                        if (fac === "security") { icon = "🔒"; name = "নিরাপত্তা প্রহরী"; }
                        if (fac === "wifi") { icon = "📶"; name = "ওয়াই-ফাই"; }
                        if (fac === "balcony") { icon = "🌿"; name = "বারান্দা"; }
                        return (
                          <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-150 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                            <span>{icon}</span>
                            <span>{name}</span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-neutral-400 italic font-medium">কোনো তালিকাভুক্ত সুবিধা নেই</span>
                    )}
                  </div>
                </div>

                {/* Map location information */}
                <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-150 space-y-2">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-neutral-800 text-xs block">সঠিক অবস্থান / লোকেশন</span>
                      <p className="text-neutral-600 font-bold mt-0.5">{selectedAd.location} {selectedAd.village ? `(${selectedAd.village})` : ""}</p>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAd.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white text-emerald-800 hover:bg-emerald-50 text-[10px] font-black py-2 rounded-xl transition flex items-center justify-center gap-1 border border-emerald-200"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>Google Maps-এ দিকনির্দেশনা দেখুন</span>
                  </a>
                </div>

                {/* Extra detailed Specifications */}
                <div className="border-t border-neutral-100 pt-3.5 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] sm:text-xs">
                  <div>
                    <span className="text-neutral-400 font-bold block">ফ্লোর লেভেল:</span>
                    <strong className="text-neutral-700">{selectedAd.floor || "গ্রাউন্ড ফ্লোর"}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold block">ভাড়াটিয়া যোগ্যতা:</span>
                    <strong className="text-neutral-700">{getTenantBengali(selectedAd.targetTenant)}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold block">আসবাবপত্র স্ট্যাটাস:</span>
                    <strong className="text-neutral-700">{getFurnishingBengali(selectedAd.furnishing)}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold block">অগ্রিম আমানত:</span>
                    <strong className="text-neutral-700">{selectedAd.advanceRent || "আলোচনা সাপেক্ষ"}</strong>
                  </div>
                  {selectedAd.additionalCosts && (
                    <div className="col-span-2">
                      <span className="text-neutral-400 font-bold block">অন্যান্য অতিরিক্ত খরচ:</span>
                      <strong className="text-neutral-700">{selectedAd.additionalCosts}</strong>
                    </div>
                  )}
                </div>

                {/* Owner/Advertiser Details */}
                <div className="bg-emerald-50/60 border border-emerald-150 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-black shadow-md uppercase border border-emerald-200">
                      {selectedAd.ownerName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 font-black uppercase block">মালিক / বিজ্ঞাপনকারী</span>
                      <span className="font-extrabold text-neutral-800 text-xs block">{selectedAd.ownerName}</span>
                      <span className="text-[9px] text-emerald-800 font-bold block">✓ পোর্টাল সদস্য</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1.5">
                    {selectedAd.whatsapp && (
                      <a
                        href={`https://wa.me/${selectedAd.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 p-2.5 text-white rounded-xl transition flex items-center justify-center shadow-xs"
                        title="WhatsApp এ মেসেজ করুন"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={(e) => initiateCall(selectedAd, e)}
                      className="bg-[#006847] hover:bg-emerald-800 text-white font-extrabold px-4.5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>কল দিন</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Close buttons */}
              <div className="bg-neutral-50 p-4 border-t border-neutral-100 flex justify-between items-center shrink-0">
                <button
                  onClick={() => {
                    setReportAd(selectedAd);
                    setSelectedAd(null);
                  }}
                  className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>বিজ্ঞপ্তিটির বিরুদ্ধে রিপোর্ট করুন</span>
                </button>
                <button
                  onClick={() => setSelectedAd(null)}
                  className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-extrabold px-5 py-2 rounded-xl cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: REPORT PROPERTY LISTING */}
      <AnimatePresence>
        {reportAd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-150 text-xs text-neutral-800"
            >
              <div className="bg-red-800 text-white p-4.5 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <h3 className="font-extrabold text-sm">বিজ্ঞপ্তি রিপোর্ট ফরম</h3>
                </div>
                <button onClick={() => setReportAd(null)} className="text-white hover:text-neutral-200">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleReportAd} className="p-5 space-y-4 text-left">
                <p className="text-[11px] text-neutral-500 font-bold leading-normal">
                  আপনি <strong className="text-red-700">"{reportAd.title}"</strong> বিজ্ঞাপনটির বিরুদ্ধে রিপোর্ট করছেন। অনুগ্রহ করে সঠিক কারণটি নির্বাচন করুন যাতে আমাদের মডারেশন টিম অ্যাকশন নিতে পারে।
                </p>

                {/* Reasons option */}
                <div className="space-y-1.5">
                  <label className="block text-neutral-700 font-black">রিপোর্টের প্রধান কারণ</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-bold"
                  >
                    <option value="wrong_info">ভুল তথ্য / অসত্য বিবরণ</option>
                    <option value="fake_ad">ভুয়া বিজ্ঞাপন / প্রতারণার সন্দেহ</option>
                    <option value="wrong_price">ভুল ভাড়ার পরিমাণ উল্লেখ করা হয়েছে</option>
                    <option value="already_rented">ইতিমধ্যে ভাড়া হয়ে গেছে কিন্তু মুছে ফেলা হয়নি</option>
                    <option value="inappropriate">অশালীন বা অনুপযুক্ত ভাষা/ছবি</option>
                    <option value="other">অন্যান্য কারণ (নিচে ব্যাখ্যা করুন)</option>
                  </select>
                </div>

                {/* Comments */}
                <div className="space-y-1">
                  <label className="block text-neutral-700 font-black">বিস্তারিত বিবরণ বা প্রমাণ (ঐচ্ছিক)</label>
                  <textarea
                    rows={3}
                    placeholder="অনুগ্রহ করে অভিযোগটি সুন্দরভাবে বুঝিয়ে লিখুন..."
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 font-semibold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReportAd(null)}
                    className="px-4.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-600 font-bold cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={reportingAdId}
                    className="bg-red-700 hover:bg-red-800 disabled:bg-red-300 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    {reportingAdId ? "প্রসেস হচ্ছে..." : "অভিযোগ জমা দিন"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION POPUP DIALOG: CONTACT CONFIRM WARNING */}
      <AnimatePresence>
        {isCallConfirmOpen && confirmAd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5 border border-neutral-150 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-sm text-neutral-800">নিরাপদ কলের পূর্বে নিশ্চিত হোন</h3>
                <p className="text-[11px] text-neutral-500 leading-relaxed font-bold">
                  আপনি কি বাড়িওয়ালা/মালিক <strong className="text-emerald-700">"{confirmAd.ownerName}"</strong> কে সরাসরি <strong className="text-neutral-700">{confirmAd.ownerPhone}</strong> নম্বরে কল করতে চান?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setIsCallConfirmOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-neutral-300 text-neutral-600 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={executeCall}
                  className="w-full py-2.5 rounded-xl bg-[#006847] text-white text-xs font-black shadow-md hover:bg-emerald-800 transition cursor-pointer active:scale-95"
                >
                  হ্যাঁ, কল দিন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
