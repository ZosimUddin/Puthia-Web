import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import SEO from "../SEO";
import { Sidebar } from "../Sidebar";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Droplet, Search, Store, Sparkles } from "lucide-react";
import HeroSlider from "./HeroSlider";
import WelcomeBanner from "./WelcomeBanner";
import NoticeTickerBar from "./NoticeTickerBar";
import QuickActionsStatsCard from "./QuickActionsStatsCard";
import InfoBannerSlider from "./InfoBannerSlider";
import PuthiaSingleLineWeatherBar from "./PuthiaSingleLineWeatherBar";
import { LiveUpdatesSection } from "./LiveUpdatesSection";
import BottomNavigation from "./BottomNavigation";

import PopularCategoriesSection from "./PopularCategoriesSection";
import ServicesGrid from "./ServicesGrid";
import { SmartRecommendations } from "./SmartRecommendations";
import LatestNoticeSection from "./LatestNoticeSection";
import FeaturedBusinessSection from "./FeaturedBusinessSection";
import HealthSection from "./HealthSection";
import TrainingSection from "./TrainingSection";
import AgricultureSection from "./AgricultureSection";
import TourismSection from "./TourismSection";
import BuySellSection from "./BuySellSection";
import HouseRentSection from "./HouseRentSection";
import WeatherSection from "./WeatherSection";
import EventsSection from "./EventsSection";
import BloodDonationSection from "./BloodDonationSection";
import MediaGallerySection from "./MediaGallerySection";
import AdvertisementSection from "./AdvertisementSection";
import HomepageAdSection from "./HomepageAdSection";
import AppDownloadSection from "./AppDownloadSection";
import Footer from "./Footer";
import SearchResults from "./SearchResults";
import {
  ServicesGridSkeleton,
  BloodDonationSectionSkeleton,
  CommunicationHubSectionSkeleton,
  AdvertisementSectionSkeleton
} from "./Skeleton";
import { useAuth } from "../../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { 
  getSpecialOffers, 
  getToLetAds, 
  getMarketplaceItems, 
  getTouristSpots, 
  getUserPosts, 
  getNoticeItems,
  getHealthServices,
  getBloodDonors,
  getMarketPrices,
  getAgriNotices,
  getGenericCollection
} from "../../api";
import { smartSearchMatch } from "../../utils/searchUtils";

import PullToRefresh from "./PullToRefresh";

import { useSiteSettings } from "../../context/SiteSettingsContext";

const Home: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isBloodPaused, setIsBloodPaused] = useState(false);
  const [bloodTouchTimeout, setBloodTouchTimeout] = useState<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (bloodTouchTimeout) clearTimeout(bloodTouchTimeout);
    };
  }, [bloodTouchTimeout]);

  useEffect(() => {
    const qParam = searchParams.get("search");
    if (qParam) {
      handleSearch(qParam);
    }
  }, [searchParams]);

  const FALLBACK_BLOOD_REQUESTS = [
    { id: "fb1", patientName: "মোছাম্মৎ রুকসানা বেগম", bloodGroup: "O+", units: "১", hospital: "পুঠিয়া স্বাস্থ্য কমপ্লেক্স", neededAt: "জরুরি প্রয়োজন", contactNumber: "01712345678" },
    { id: "fb2", patientName: "মোঃ রফিকুল ইসলাম", bloodGroup: "B-", units: "২", hospital: "রাজশাহী মেডিকেল হাসপাতাল", neededAt: "আজকের মধ্যে", contactNumber: "01812345679" },
    { id: "fb3", patientName: "আরিফুল হাসান", bloodGroup: "A+", units: "১", hospital: "বানেশ্বর জেনারেল হাসপাতাল", neededAt: "আগামীকাল সকালে", contactNumber: "01912345680" }
  ];

  useEffect(() => {
    const q = query(collection(db, "blood_requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === "pending" || data.isCritical) {
          list.push({ id: docSnap.id, ...data });
        }
      });
      if (list.length > 0) {
        setBloodRequests(list);
      } else {
        setBloodRequests(FALLBACK_BLOOD_REQUESTS);
      }
    }, (error) => {
      if (error?.message?.includes("Quota") || error?.code === "resource-exhausted") {
        console.warn("Firestore quota limit reached for blood requests banner.");
      } else {
        console.warn("Error loading blood requests for banner:", error?.message || error);
      }
      setBloodRequests(FALLBACK_BLOOD_REQUESTS);
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, []);

  const handleRefresh = async () => {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    window.location.reload();
  };

  const handleNavigate = (path: string) => {
    setIsSidebarOpen(false);
    const targetPath = path.startsWith('/') ? path : `/${path}`;
    navigate(targetPath);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    setIsSearching(true);
    setIsSearchActive(true);

    try {
      const collectionsToSearch = [
        { name: 'doctors', label: 'ডাক্তার' },
        { name: 'hospitals', label: 'হাসপাতাল' },
        { name: 'diagnostics', label: 'ডায়াগনস্টিক সেন্টার' },
        { name: 'vehicle_rentals', label: 'যানবাহন ভাড়া' },
        { name: 'emergency_services', label: 'জরুরি সেবা' },
        { name: 'fire_services', label: 'ফায়ার সার্ভিস' },
        { name: 'police_services', label: 'পুলিশ সেবা' },
        { name: 'lawyers', label: 'আইনজীবী' },
        { name: 'bus_stands', label: 'বাস স্ট্যান্ড ও কাউন্টার' },
        { name: 'train_schedules', label: 'ট্রেন সময়সূচী' },
        { name: 'entrepreneurs', label: 'উদ্যোক্তা ও শপ' },
        { name: 'house_rents', label: 'বাড়ি ভাড়া' },
        { name: 'restaurants', label: 'রেস্তোরাঁ ও হোটেল' },
        { name: 'mistris', label: 'মিস্ত্রি ও কারিগর' },
        { name: 'tourist_spots', label: 'দর্শনীয় স্থান' },
        { name: 'banks', label: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান' },
        { name: 'pharmacies', label: 'ফার্মেসি ও ঔষধ' },
        { name: 'ambulances', label: 'অ্যাম্বুলেন্স' },
        { name: 'sports_events', label: 'খেলাধুলা ও ক্লাব' },
        { name: 'mosques', label: 'মসজিদ ও ধর্মীয় স্থান' },
        { name: 'journalists', label: 'সাংবাদিক ও প্রেস' },
        { name: 'content_creators', label: 'কনটেন্ট ক্রিয়েটর' },
        { name: 'parlors', label: 'পার্লার ও সেলুন' },
        { name: 'courier_services', label: 'কুরিয়ার সার্ভিস' },
        { name: 'videos', label: 'ভিডিও ও ডকুমেন্টারি' },
        { name: 'educational_institutions', label: 'শিক্ষা প্রতিষ্ঠান' },
        { name: 'jobs', label: 'চাকরি ও নিয়োগ' },
        { name: 'ngos', label: 'এনজিও ও সংগঠন' },
        { name: 'blood_donors', label: 'রক্তদাতা' },
        { name: 'volunteers', label: 'স্বেচ্ছাসেবক' },
        { name: 'nurseries', label: 'নার্সারি ও বাগান' },
        { name: 'hotels', label: 'আবাসিক হোটেল' },
        // Custom collections
        { name: 'news', label: 'খবর' },
        { name: 'notice_items', label: 'নোটিশ' },
        { name: 'user_posts', label: 'পোস্ট/সামাজিক মতামত' },
        { name: 'marketplace_items', label: 'Buy & Sell' },
        { name: 'blood_requests', label: 'রক্তের আবেদন' },
        { name: 'market_prices', label: 'কৃষি বাজার দর' },
        { name: 'agri_notices', label: 'কৃষি নোটিশ' }
      ];

      // Fetch all collections concurrently
      const fetchPromises = collectionsToSearch.map(async (col) => {
        try {
          const docs = await getGenericCollection(col.name);
          return { col, docs };
        } catch (err) {
          console.error(`Error querying collection ${col.name}:`, err);
          return { col, docs: [] };
        }
      });

      const fetchedCollections = await Promise.all(fetchPromises);
      const results: any[] = [];

      // Search Static Menu Items
      const MENU_ITEMS = [
        { id: "admin", label: "উপজেলা ও প্রশাসন", type: "administration", keywords: ["admin", "office", "govt", "প্রশাসন", "ইউএনও", "অফিস"] },
        { id: "history", label: "ইতিহাস ও ঐতিহ্য", type: "history", keywords: ["history", "heritage", "tourism", "ইতিহাস", "রাজবাড়ী", "ঐতিহ্য"] },
        { id: "blood", label: "রক্তদাতা নেটওয়ার্ক", type: "blood-donor", keywords: ["blood", "donor", "রক্ত", "দাতা", "ব্লাড"] },
        { id: "education", label: "শিক্ষা প্রতিষ্ঠান", type: "education", keywords: ["education", "school", "college", "শিক্ষা", "স্কুল", "কলেজ", "মাদ্রাসা"] },
        { id: "agri", label: "কৃষি, খামার ও আবহাওয়া", type: "agriculture", keywords: ["agri", "farm", "weather", "কৃষি", "খামার", "আবহাওয়া"] },
        { id: "services", label: "সেবা প্রদানকারী", type: "services", keywords: ["service", "electrician", "plumber", "সেবা", "মিস্ত্রি", "সার্ভিস"] },
        { id: "business", label: "ব্যবসা ও বাজার", type: "business", keywords: ["business", "market", "shop", "ব্যবসা", "বাজার", "দোকান"] },
        { id: "health", label: "স্বাস্থ্যসেবা ও চিকিৎসা", type: "health", keywords: ["health", "doctor", "hospital", "স্বাস্থ্য", "ডাক্তার", "হাসপাতাল", "ক্লিনিক"] },
        { id: "doctors", label: "ডাক্তার ও চেম্বার", type: "doctors", keywords: ["doctor", "specialist", "chamber", "ডাক্তার", "চেম্বার", "বিশেষজ্ঞ"] },
        { id: "pharmacy", label: "ফার্মেসি ও ওষুধ সেবা", type: "pharmacy", keywords: ["pharmacy", "medicine", "medicine shop", "ফার্মেসি", "ওষুধ", "দোকান", "মডেল ফার্মেসি"] },
        { id: "transport", label: "পরিবহন তথ্য", type: "transport", keywords: ["transport", "bus", "train", "পরিবহন", "বাস", "ট্রেন", "ভাড়া"] },
        { id: "volunteer", label: "স্বেচ্ছাসেবক নেটওয়ার্ক", type: "volunteer", keywords: ["volunteer", "help", "social", "স্বেচ্ছাসেবক", "সাহায্য", "কল্যাণ"] },
        { id: "lost-found", label: "হারানো ও পাওয়া", type: "lost-found", keywords: ["lost", "found", "help", "হারানো", "পাওয়া", "নিখোঁজ"] },
        { id: "emergency", label: "জরুরি সহায়তা", type: "emergency", keywords: ["emergency", "ambulance", "hospital", "blood", "জরুরি", "অ্যাম্বুলেন্স", "হাসপাতাল", "রক্ত"] },
        { id: "adda", label: "আড্ডা (Social Hub)", type: "adda", keywords: ["adda", "discussion", "forum", "opinion", "আড্ডা", "মতামত", "আলোচনা", "ফোরাম"] },
        { id: "social-humanitarian", label: "সামাজিক প্রতিষ্ঠান", type: "social", keywords: ["social", "institution", "organization", "club", "humanitarian", "সামাজিক", "প্রতিষ্ঠান", "সংগঠন", "সেবামূলক"] },
        { id: "announcement", label: "কমিউনিটি ঘোষণা", type: "announcements", keywords: ["announcement", "notice", "news", "ঘোষণা", "নোটিশ", "খ খবর"] },
      ];

      MENU_ITEMS.forEach(menu => {
        if (smartSearchMatch(menu.label, query) || menu.keywords.some(k => smartSearchMatch(k, query))) {
          results.push({
            id: menu.id,
            title: menu.label,
            description: "মেনু লিঙ্ক - সরাসরি এই ক্যাটাগরিতে যান",
            type: "menu",
            targetType: menu.type,
            isMenu: true
          });
        }
      });

      // Match records from all dynamic collections
      fetchedCollections.forEach(({ col, docs }) => {
        docs.forEach((record: any) => {
          const fieldsToMatch = [
            record.title,
            record.name,
            record.description,
            record.content,
            record.text,
            record.address,
            record.phone,
            record.contactNumber,
            record.speciality,
            record.itemName,
            record.patientName,
            record.spotName,
            record.location,
            record.details,
            record.category
          ].filter(Boolean).map(val => String(val));

          const matches = fieldsToMatch.some(val => smartSearchMatch(val, query));

          if (matches) {
            results.push({
              id: record.id,
              title: record.title || record.name || record.itemName || record.patientName || record.spotName || (record.text && record.text.substring(0, 55)) || col.label,
              description: record.description || record.details || record.content || record.text || record.address || `${col.label} বিভাগের তথ্য`,
              category: record.category || record.speciality || record.type || col.label,
              type: record.type || record._collectionName || col.name,
              _collectionName: record._collectionName || col.name,
              imageUrl: record.imageUrl || record.image || (record.images && record.images[0]) || "",
              phone: record.phone || record.contactNumber || record.phoneKey || "",
              location: record.location || record.address || record.union || ""
            });
          }
        });
      });

      const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());
      setSearchResults(uniqueResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={handleSearch}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={handleNavigate}
      />

      <AnimatePresence>
        {isSearchActive && (
          <Suspense fallback={
            <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-500">অনুসন্ধান করা হচ্ছে...</span>
              </div>
            </div>
          }>
            <SearchResults 
              query={searchQuery}
              results={searchResults}
              isLoading={isSearching}
              onClose={() => {
                setIsSearchActive(false);
                setSearchParams({});
              }}
              onSearchUpdate={(newQuery) => {
                setSearchParams({ search: newQuery });
                handleSearch(newQuery);
              }}
              onItemClick={(item) => {
                setIsSearchActive(false);
                setSearchParams({});
                if (item.isMenu && item.targetType) {
                  navigate(`/${item.targetType}`);
                } else if (item.type === "business") {
                  navigate("/business");
                } else if (item.type === "rent" || item.type === "house_rents") {
                  navigate("/house-rent");
                } else if (item.type === "marketplace") {
                  navigate("/marketplace");
                } else if (item.type === "health") {
                  navigate("/health");
                } else if (item.type === "education") {
                  navigate("/education");
                } else if (item.type === "agri") {
                  navigate("/agriculture");
                } else if (item.type === "tourism") {
                  navigate("/tourism");
                } else if (item.type === "news") {
                  navigate("/news");
                } else if (item.type === "notice" || item.type === "notice_items") {
                  navigate("/notice");
                } else if (item.type === "discussion" || item.type === "adda" || item.type === "user_posts") {
                  navigate("/adda");
                } else if (item.type === "blood-donor" || item.type === "blood_donors") {
                  navigate("/blood-donor");
                } else {
                  navigate("/local-services");
                }
              }}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* SEO & Meta tags optimization */}
      <SEO 
        title="আমাদের পুঠিয়া – ঐতিহ্য থেকে ডিজিটাল ভবিষ্যতের পথে"
        description="পুঠিয়ার মানুষ, ইতিহাস, ঐতিহ্য, তথ্য ও প্রয়োজনীয় সেবাকে এক প্ল্যাটফর্মে যুক্ত করার ডিজিটাল উদ্যোগ।"
        path="/"
      />

      <PullToRefresh onRefresh={handleRefresh}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="md:flex md:flex-col md:gap-16 pb-28 md:pb-8"
        >
          {/* Top blood alert ticker banner removed per user request */}
          
          <NoticeTickerBar />
          <HeroSlider />
          <Suspense fallback={<ServicesGridSkeleton />}><ServicesGrid /></Suspense>
          <HomepageAdSection />

          <Suspense fallback={<BloodDonationSectionSkeleton />}><BloodDonationSection /></Suspense>

          {settings?.homeLayout === 'minimal' && (
             <div className="py-8">
               <Suspense fallback={<CommunicationHubSectionSkeleton />}><LatestNoticeSection /></Suspense>
             </div>
          )}

          {(!settings?.homeLayout || settings.homeLayout === 'default') && (
            <>
              <Suspense fallback={<CommunicationHubSectionSkeleton />}><TrainingSection /></Suspense>
            </>
          )}

          <Suspense fallback={<AdvertisementSectionSkeleton />}><AdvertisementSection /></Suspense>
        </motion.div>
      </PullToRefresh>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Home;
