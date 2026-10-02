import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Bus, Train, Bike, Car, Phone, Navigation, MapPin, 
  Map as MapIcon, Plane, Fuel, FileText, Compass, AlertTriangle, 
  Clock, Info, Search, Copy, Check, CheckCircle2, MessageSquare, Plus, RefreshCw, 
  Send, ExternalLink, Calendar, DollarSign, Locate, User, Trash2, Bookmark,
  Star, Shield, Radio, Bell, Heart, ThumbsUp, Filter, Activity, Gauge, Ticket, Share2
} from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { toast, Toaster } from 'react-hot-toast';
import { UnifiedHeroHeader } from './common/UnifiedDesignSystem';

// Define TS Interfaces for Crowd Reports
interface CrowdReport {
  id?: string;
  type: 'road' | 'traffic';
  location: string;
  status: string;
  description: string;
  reporterName: string;
  timestamp?: any;
}

// Full Submenus mapping including Live Bus, Live Train, Live Traffic, Booking, GPS Nearby, Alerts, Favorites, Reviews
const submenus = [
  { id: 'bus_schedule', label: 'বাসের সময়সূচী', icon: Bus, color: 'from-blue-500 to-indigo-600', emoji: '🚌', desc: 'ঢাকা ও রাজশাহীর আন্তঃজেলা বাসের তথ্য' },
  { id: 'train_schedule', label: 'ট্রেনের সময়সূচী', icon: Train, color: 'from-rose-500 to-red-600', emoji: '🚆', desc: 'রাজশাহী ও নিকটবর্তী স্টেশনের ট্রেনের সূচী' },
  { id: 'live_bus', label: 'লাইভ বাস ট্র্যাকিং', icon: Navigation, color: 'from-sky-500 to-blue-600', emoji: '📍', desc: 'মহাসড়ক ও লোকাল বাসের জিপিএস লাইভ স্থান' },
  { id: 'live_train', label: 'লাইভ ট্রেন ট্র্যাকিং', icon: Radio, color: 'from-rose-600 to-pink-600', emoji: '🚆', desc: 'সারদাহ ও রাজশাহী রুটের ট্রেনের রিয়েল-টাইম স্ট্যাটাস' },
  { id: 'live_traffic', label: 'লাইভ ট্রাফিক ম্যাপ', icon: Activity, color: 'from-amber-500 to-orange-600', emoji: '🚦', desc: 'হাইওয়ে ও বাসস্ট্যান্ড মোড়ের লাইভ ট্রাফিক অবস্থা' },
  { id: 'ticket_booking', label: 'বাস ও ট্রেন টিকিট বুকিং', icon: Ticket, color: 'from-purple-600 to-indigo-700', emoji: '🎫', desc: 'অনলাইন আসন নির্বাচন ও দ্রুত বুকিং আবেদন' },
  { id: 'gps_nearby', label: 'GPS নিকটবর্তী পরিবহন', icon: Compass, color: 'from-emerald-500 to-teal-600', emoji: '📍', desc: 'আপনার বর্তমান অবস্থানের নিকটস্থ স্ট্যান্ড ও স্টেশন' },
  { id: 'route_alerts', label: 'রুট ও ট্রাফিক অ্যালার্ট', icon: Bell, color: 'from-red-500 to-rose-600', emoji: '🔔', desc: 'সড়ক মেরামত, হাটবারের জ্যাম ও জরুরি সতর্কবার্তা' },
  { id: 'fav_routes', label: 'প্রিয় রুট (Favourite Routes)', icon: Heart, color: 'from-pink-500 to-rose-500', emoji: '⭐', desc: 'নিয়মিত যাতায়াতের পছন্দের রুট ও ভাড়া গাইড' },
  { id: 'reviews_ratings', label: 'যাত্রীদের রেটিং ও রিভিউ', icon: Star, color: 'from-yellow-500 to-amber-600', emoji: '💬', desc: 'যাত্রীদের অভিজ্ঞতা, কাউন্টার রেটিং ও মতামত' },
  { id: 'cng_auto', label: 'CNG / অটোরিকশা', icon: Car, color: 'from-green-500 to-emerald-600', emoji: '🚖', desc: 'লোকাল রুট ও রিজার্ভ ভাড়া তালিকা' },
  { id: 'easy_bike', label: 'ইজিবাইক', icon: Bike, color: 'from-amber-500 to-yellow-600', emoji: '🛺', desc: 'পৌরসভা ও গ্রামীণ রুটের ভাড়া' },
  { id: 'local_transport', label: 'লোকাল পরিবহন', icon: Bus, color: 'from-teal-500 to-cyan-600', emoji: '🚐', desc: 'লেগুনা, মাহিন্দ্রা ও ভটভটি সার্ভিস' },
  { id: 'bike_share', label: 'বাইক/রাইড শেয়ার', icon: Bike, color: 'from-lime-500 to-green-600', emoji: '🚲', desc: 'স্থানীয় রাইডার ও বাইক শেয়ার সেবা' },
  { id: 'petrol_pump', label: 'পেট্রোল পাম্প', icon: Fuel, color: 'from-orange-600 to-red-600', emoji: '⛽', desc: 'পুঠিয়া ও বানেশ্বরের ফিলিং স্টেশনের তালিকা' }
];

export function RoadsTransport({ onGoBack }: { onGoBack: () => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSubmenu, setSelectedSubmenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Read tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && submenus.some(s => s.id === tab)) {
      setSelectedSubmenu(tab);
    } else {
      setSelectedSubmenu(null);
    }
  }, [searchParams]);

  const handleSelectSubmenu = (menuId: string | null) => {
    if (menuId) {
      setSearchParams({ tab: menuId });
    } else {
      setSearchParams({});
    }
  };

  // Bus schedule state
  const [busFilterTab, setBusFilterTab] = useState<'all' | 'dhaka' | 'local' | 'bookmarked'>('all');
  const [busSearchQuery, setBusSearchQuery] = useState('');
  const [busBookmarks, setBusBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('puthia_bus_bookmarks');
    if (saved) {
      try {
        setBusBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse bus bookmarks');
      }
    }
  }, []);

  const toggleBusBookmark = (busId: string) => {
    let updated;
    if (busBookmarks.includes(busId)) {
      updated = busBookmarks.filter(id => id !== busId);
      toast.success('বুকমার্ক থেকে সরানো হয়েছে');
    } else {
      updated = [...busBookmarks, busId];
      toast.success('বুকমার্কে যুক্ত করা হয়েছে');
    }
    setBusBookmarks(updated);
    localStorage.setItem('puthia_bus_bookmarks', JSON.stringify(updated));
  };

  // Train schedule state
  const [trainStationFilter, setTrainStationFilter] = useState<'all' | 'sardah' | 'rajshahi' | 'natore' | 'nandangachhi' | 'bookmarked'>('all');
  const [trainSearchQuery, setTrainSearchQuery] = useState('');
  const [trainBookmarks, setTrainBookmarks] = useState<string[]>([]);
  const [selectedTrainForStatus, setSelectedTrainForStatus] = useState<string | null>(null);

  // CNG / Auto state
  const [cngTabFilter, setCngTabFilter] = useState<'all' | 'stands' | 'fares' | 'drivers' | '24hrs'>('all');
  const [cngSearchQuery, setCngSearchQuery] = useState('');

  // Easy Bike state
  const [easyBikeTabFilter, setEasyBikeTabFilter] = useState<'all' | 'routes' | 'fares' | 'stands' | 'schedule'>('all');
  const [easyBikeSearchQuery, setEasyBikeSearchQuery] = useState('');

  // Local Transport state
  const [localTransportFilter, setLocalTransportFilter] = useState<'all' | 'van' | 'nosimon' | 'korimon' | 'leguna' | 'minibus' | 'fares'>('all');
  const [localTransportSearch, setLocalTransportSearch] = useState('');

  // Petrol Pump state
  const [fuelStatusFilter, setFuelStatusFilter] = useState<'all' | 'open' | '24hrs'>('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<'all' | 'octane' | 'petrol' | 'diesel' | 'lpg'>('all');
  const [fuelSearchQuery, setFuelSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('puthia_train_bookmarks');
    if (saved) {
      try {
        setTrainBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse train bookmarks');
      }
    }
  }, []);

  const toggleTrainBookmark = (trainId: string) => {
    let updated;
    if (trainBookmarks.includes(trainId)) {
      updated = trainBookmarks.filter(id => id !== trainId);
      toast.success('বুকমার্ক থেকে সরানো হয়েছে');
    } else {
      updated = [...trainBookmarks, trainId];
      toast.success('বুকমার্কে যুক্ত করা হয়েছে');
    }
    setTrainBookmarks(updated);
    localStorage.setItem('puthia_train_bookmarks', JSON.stringify(updated));
  };

  // Fare calculator state
  const [calcFrom, setCalcFrom] = useState('পুঠিয়া বাসস্ট্যান্ড');
  const [calcTo, setCalcTo] = useState('বানেশ্বর বাজার');
  const [calcMode, setCalcMode] = useState('cng');

  // Ticket booking state
  const [bookingType, setBookingType] = useState<'bus' | 'train'>('bus');
  const [bookingFrom, setBookingFrom] = useState('পুঠিয়া বাসস্ট্যান্ড');
  const [bookingTo, setBookingTo] = useState('ঢাকা (গাবতলী/কল্যাণপুর)');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingClass, setBookingClass] = useState('AC');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // GPS Nearby state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsFilter, setGpsFilter] = useState<'all' | 'bus' | 'train' | 'cng' | 'fuel'>('all');

  const handleGetLocation = () => {
    setGpsLoading(true);
    setGpsError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGpsLoading(false);
          toast.success('আপনার বর্তমান জিপিএস লোকেশন সনাক্ত করা হয়েছে!');
        },
        (error) => {
          console.warn('GPS location error:', error);
          setUserCoords({ lat: 24.3685, lng: 88.8354 });
          setGpsLoading(false);
          toast.success('পুঠিয়া সদরের সাপেক্ষে নিকটবর্তী স্থান দেখানো হচ্ছে');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setUserCoords({ lat: 24.3685, lng: 88.8354 });
      setGpsLoading(false);
      toast.success('পুঠিয়া সদরের সাপেক্ষে নিকটবর্তী স্থান দেখানো হচ্ছে');
    }
  };

  // Favourite Routes state
  const defaultFavRoutes = [
    { id: 'fav-1', from: 'পুঠিয়া বাসস্ট্যান্ড', to: 'রাজশাহী (ভদ্রা মোড়)', mode: 'ইজিবাইক / সিএনজি', duration: '৩৫ মিনিট', fare: '৪০-৬০ টাকা', note: 'প্রতি ৫ মিনিটে লোকাল গাড়ি পাওয়া যায়' },
    { id: 'fav-2', from: 'পুঠিয়া বাসস্ট্যান্ড', to: 'ঢাকা (গাবতলী/কল্যাণপুর)', mode: 'এসি/নন-এসি বাস', duration: '৬ ঘণ্টা', fare: '৭৫০-১৩০০ টাকা', note: 'দেশ ও হানিফ কাউন্টার' },
    { id: 'fav-3', from: 'বানেশ্বর বাজার', to: 'সারদাহ রোড রেল স্টেশন', mode: 'সিএনজি / অটোরিকশা', duration: '১৫ মিনিট', fare: '৩০ টাকা', note: 'ট্রেনের সময়ের ২০ মিনিট আগে পৌঁছান' }
  ];

  const [favRoutesList, setFavRoutesList] = useState<Array<{ id: string; from: string; to: string; mode: string; duration: string; fare: string; note?: string }>>([]);
  const [newFavFrom, setNewFavFrom] = useState('');
  const [newFavTo, setNewFavTo] = useState('');
  const [newFavMode, setNewFavMode] = useState('সিএনজি / অটোরিকশা');
  const [newFavFare, setNewFavFare] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('puthia_fav_routes');
    if (saved) {
      try {
        setFavRoutesList(JSON.parse(saved));
      } catch (e) {
        setFavRoutesList(defaultFavRoutes);
      }
    } else {
      setFavRoutesList(defaultFavRoutes);
    }
  }, []);

  const handleAddFavRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFavFrom || !newFavTo) {
      toast.error('শুরু ও গন্তব্য স্থান লিখুন');
      return;
    }
    const newRoute = {
      id: `fav-${Date.now()}`,
      from: newFavFrom,
      to: newFavTo,
      mode: newFavMode,
      duration: 'আনুমানিক ২০-৩০ মিনিট',
      fare: newFavFare || 'নির্ধারিত ভাড়া',
      note: 'ব্যবহারকারী সংরক্ষিত পছন্দের রুট'
    };
    const updated = [newRoute, ...favRoutesList];
    setFavRoutesList(updated);
    localStorage.setItem('puthia_fav_routes', JSON.stringify(updated));
    toast.success('পছন্দের রুটে সফলভাবে যুক্ত করা হয়েছে!');
    setNewFavFrom('');
    setNewFavTo('');
    setNewFavFare('');
  };

  const handleRemoveFavRoute = (id: string) => {
    const updated = favRoutesList.filter(r => r.id !== id);
    setFavRoutesList(updated);
    localStorage.setItem('puthia_fav_routes', JSON.stringify(updated));
    toast.success('রুটটি পছন্দের তালিকা থেকে সরানো হয়েছে');
  };

  // Reviews & Ratings state
  const defaultReviews = [
    { id: 'rev-1', serviceName: 'দেশ ট্রাভেলস (পুঠিয়া কাউন্টার)', category: 'বাস সেবা', rating: 5, comment: 'কাউন্টার মাস্টার ভাইদের ব্যবহার খুব ভালো ছিল। সময়ে গাড়ি ছাড়ছে।', author: 'কামরুল হাসান', date: '২৪ জুলাই ২০২৬', likes: 12 },
    { id: 'rev-2', serviceName: 'সিল্কসিটি এক্সপ্রেস (সারদাহ রোড)', category: 'ট্রেন সেবা', rating: 4, comment: 'সারদাহ স্টেশনে ২ মিনিট দাঁড়ায়, আগেই টিকিট কেটে রেডি থাকা ভালো।', author: 'তানজিনা আক্তার', date: '২২ জুলাই ২০২৬', likes: 8 },
    { id: 'rev-3', serviceName: 'পুঠিয়া-বানেশ্বর সিএনজি চালক সমিতি', category: 'লোকাল রাইড', rating: 5, comment: 'ভাড়া সুনির্দিষ্ট করা আছে, কোনো অতিরিক্ত টাকা নেয়নি।', author: 'রাশেদুল ইসলাম', date: '২০ জুলাই ২০২৬', likes: 15 }
  ];

  const [reviewsList, setReviewsList] = useState<Array<{ id?: string; serviceName: string; category: string; rating: number; comment: string; author: string; date: string; likes: number }>>([]);
  const [newRevCategory, setNewRevCategory] = useState('দেশ ট্রাভেলস (পুঠিয়া কাউন্টার)');
  const [newRevRating, setNewRevRating] = useState(5);
  const [newRevComment, setNewRevComment] = useState('');
  const [newRevAuthor, setNewRevAuthor] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchTransportReviews = async () => {
    try {
      const q = query(collection(db, 'transport_reviews'), orderBy('timestamp', 'desc'), limit(15));
      const querySnapshot = await getDocs(q);
      const fetched: any[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      if (fetched.length > 0) {
        setReviewsList(fetched);
      } else {
        setReviewsList(defaultReviews);
      }
    } catch (e) {
      setReviewsList(defaultReviews);
    }
  };

  useEffect(() => {
    if (selectedSubmenu === 'reviews_ratings') {
      fetchTransportReviews();
    }
  }, [selectedSubmenu]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevComment || !newRevAuthor) {
      toast.error('দয়া করে আপনার নাম ও রিভিউ লিখুন');
      return;
    }
    setIsSubmittingReview(true);
    const revData = {
      serviceName: newRevCategory,
      category: newRevCategory.includes('ট্রেন') ? 'ট্রেন সেবা' : 'বাস/লোকাল সেবা',
      rating: newRevRating,
      comment: newRevComment,
      author: newRevAuthor,
      date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      likes: 1
    };

    try {
      await addDoc(collection(db, 'transport_reviews'), {
        ...revData,
        timestamp: serverTimestamp()
      });
      toast.success('আপনার মূল্যবান রিভিউটি জমা হয়েছে!');
      setNewRevComment('');
      setNewRevAuthor('');
      fetchTransportReviews();
    } catch (error) {
      console.warn("Firestore error, saving locally:", error);
      setReviewsList(prev => [revData, ...prev]);
      toast.success('আপনার রিভিউটি সাময়িকভাবে প্রকাশিত হয়েছে');
      setNewRevComment('');
      setNewRevAuthor('');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Interactive reports state
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [newReportLocation, setNewReportLocation] = useState('');
  const [newReportStatus, setNewReportStatus] = useState('স্বাভাবিক');
  const [newReportDesc, setNewReportDesc] = useState('');
  const [newReportName, setNewReportName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingReports, setIsFetchingReports] = useState(false);

  // Default initial crowd reports (as fallbacks or starter data)
  const defaultRoadReports: CrowdReport[] = [
    { type: 'road', location: 'পুঠিয়া - তাহেরপুর রোড', status: '🚧 সংস্কার কাজ চলছে', description: 'ভালুকগাছি এলাকায় রাস্তার একাংশে পিচ ঢালাইয়ের কাজ চলছে। ধীরগতিতে গাড়ি চালান।', reporterName: 'আরিফুল ইসলাম' },
    { type: 'road', location: 'বানেশ্বর - চারঘাট রোড', status: '✅ চমৎকার ও মসৃণ', description: 'পুরো রাস্তা কার্পেটিং করা হয়েছে, চমৎকার ড্রাইভ করা যাচ্ছে।', reporterName: 'হাসিবুল হাসান' }
  ];

  const defaultTrafficReports: CrowdReport[] = [
    { type: 'traffic', location: 'বানেশ্বর বাজার গোলচত্বর', status: '🛑 তীব্র যানজট', description: 'হাটবারের কারণে ট্রাক ও লোড গাড়ির জট লেগে আছে। বিকল্প রাস্তা ব্যবহার করুন।', reporterName: 'সুমন আহমেদ' },
    { type: 'traffic', location: 'পুঠিয়া বাসস্ট্যান্ড মোড়', status: '🟢 স্বাভাবিক', description: 'যানবাহন চলাচল সম্পূর্ণ স্বাভাবিক। কোনো ধীরগতি নেই।', reporterName: 'মাহমুদ খান' }
  ];

  // Fetch reports from Firestore
  const fetchCrowdReports = async () => {
    setIsFetchingReports(true);
    try {
      const q = query(collection(db, 'transport_reports'), orderBy('timestamp', 'desc'), limit(15));
      const querySnapshot = await getDocs(q);
      const fetched: CrowdReport[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as CrowdReport);
      });
      setReports(fetched);
    } catch (error) {
      console.warn("Could not load reports from Firestore, using mock defaults:", error);
      // fallback
      setReports([...defaultRoadReports, ...defaultTrafficReports]);
    } finally {
      setIsFetchingReports(false);
    }
  };

  useEffect(() => {
    if (selectedSubmenu === 'road_condition' || selectedSubmenu === 'traffic_update') {
      fetchCrowdReports();
    }
  }, [selectedSubmenu]);

  const handleAddReport = async (e: React.FormEvent, reportType: 'road' | 'traffic') => {
    e.preventDefault();
    if (!newReportLocation || !newReportDesc || !newReportName) {
      toast.error('দয়া করে সব তথ্য পূরণ করুন');
      return;
    }

    setIsSubmitting(true);
    const reportData: CrowdReport = {
      type: reportType,
      location: newReportLocation,
      status: newReportStatus,
      description: newReportDesc,
      reporterName: newReportName,
    };

    try {
      await addDoc(collection(db, 'transport_reports'), {
        ...reportData,
        timestamp: serverTimestamp()
      });
      toast.success('আপনার রিপোর্টটি সফলভাবে সংরক্ষিত হয়েছে!');
      setNewReportLocation('');
      setNewReportDesc('');
      setNewReportName('');
      fetchCrowdReports();
    } catch (error) {
      console.error("Firestore submit error: ", error);
      // client-side append fallback
      setReports(prev => [reportData, ...prev]);
      toast.success('রিপোর্টটি সাময়িকভাবে যুক্ত করা হয়েছে (অফলাইন মোড)');
      setNewReportLocation('');
      setNewReportDesc('');
      setNewReportName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} কপি করা হয়েছে!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filter submenus based on search
  const filteredSubmenus = submenus.filter(s => 
    s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in bg-slate-50 pb-24 font-sans selection:bg-emerald-200">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Hero Banner Header */}
      {!selectedSubmenu ? (
        <UnifiedHeroHeader
          title="🚌 পরিবহন সেবা ও যাতায়াত"
          subtitle="পুঠিয়া ও বানেশ্বর অঞ্চলের বাস, ট্রেন, লোকাল যানবাহন, পেট্রোল পাম্প, ট্রাফিকের লাইভ নাগরিক আপডেট এবং সঠিক ভাড়ার নির্ভরযোগ্য প্ল্যাটফর্ম।"
          showBack={true}
          onBack={onGoBack}
          rightAction={
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchTerm('');
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showSearch 
                  ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          }
          searchQuery={showSearch ? searchTerm : undefined}
          onSearchChange={showSearch ? setSearchTerm : undefined}
          searchPlaceholder="যাতায়াত মাধ্যম বা সেবা খুঁজুন... (যেমন: বাস, ট্রেন, পেট্রোল পাম্প)"
          className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6 pt-3.5 pb-5"
        />
      ) : (
        <UnifiedHeroHeader
          title={submenus.find(s => s.id === selectedSubmenu)?.label || 'সড়ক ও পরিবহন সেবা'}
          subtitle={submenus.find(s => s.id === selectedSubmenu)?.desc || 'পুঠিয়া উপজেলার অনলাইন পরিবহন সেবা ও নির্দেশিকা।'}
          showBack={true}
          onBack={() => {
            handleSelectSubmenu(null);
            setShowSearch(false);
          }}
          rightAction={
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setBusSearchQuery('');
                  setTrainSearchQuery('');
                  setCngSearchQuery('');
                  setEasyBikeSearchQuery('');
                  setLocalTransportSearch('');
                  setFuelSearchQuery('');
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showSearch 
                  ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          }
          searchQuery={
            showSearch ? (
              selectedSubmenu === 'bus_schedule' ? busSearchQuery :
              selectedSubmenu === 'train_schedule' ? trainSearchQuery :
              selectedSubmenu === 'cng_auto' ? cngSearchQuery :
              selectedSubmenu === 'easy_bike' ? easyBikeSearchQuery :
              selectedSubmenu === 'local_transport' ? localTransportSearch :
              selectedSubmenu === 'petrol_pump' ? fuelSearchQuery : searchTerm
            ) : undefined
          }
          onSearchChange={
            showSearch ? (
              selectedSubmenu === 'bus_schedule' ? setBusSearchQuery :
              selectedSubmenu === 'train_schedule' ? setTrainSearchQuery :
              selectedSubmenu === 'cng_auto' ? setCngSearchQuery :
              selectedSubmenu === 'easy_bike' ? setEasyBikeSearchQuery :
              selectedSubmenu === 'local_transport' ? setLocalTransportSearch :
              selectedSubmenu === 'petrol_pump' ? setFuelSearchQuery : setSearchTerm
            ) : undefined
          }
          searchPlaceholder="খুঁজুন..."
          className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6"
        />
      )}

      {!selectedSubmenu ? (
        // MAIN MENU LISTING
        <div className="max-w-4xl mx-auto px-4 py-2 space-y-6">

          {/* Interactive Submenus Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredSubmenus.map((menu) => {
              const IconComp = menu.icon;
              return (
                <button
                  key={menu.id}
                  onClick={() => {
                    handleSelectSubmenu(menu.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-4 text-left shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${menu.color} text-white shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {menu.label}
                      </span>
                      <span className="text-xs shrink-0" role="img" aria-label={menu.label}>
                        {menu.emoji}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal font-medium">
                      {menu.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredSubmenus.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">কোন যাতায়াত মাধ্যম বা সেবা পাওয়া যায়নি</p>
              <button onClick={() => setSearchTerm('')} className="mt-2 text-xs font-bold text-emerald-600 hover:underline">
                অনুসন্ধান মুছুন
              </button>
            </div>
          )}

          {/* Real-time Fare Calculator Widget */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-orange-700 p-1.5 rounded-lg text-xs font-black">
                SMART TOOL
              </span>
              <h3 className="text-md font-black text-slate-800">দূরত্ব ও স্ট্যান্ডার্ড ভাড়া ক্যালকুলেটর</h3>
            </div>
            <p className="text-xs text-slate-500">পুঠিয়ার প্রধান রুটগুলোর আনুমানিক রিকশা, সিএনজি ও ইজিবাইক ভাড়া জানুন।</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">শুরু করার স্থান</label>
                <select 
                  value={calcFrom || ""} 
                  onChange={(e) => setCalcFrom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="পুঠিয়া বাসস্ট্যান্ড">পুঠিয়া বাসস্ট্যান্ড</option>
                  <option value="বানেশ্বর বাজার">বানেশ্বর বাজার</option>
                  <option value="পুঠিয়া রাজবাড়ি">পুঠিয়া রাজবাড়ি</option>
                  <option value="তাহেরপুর">তাহেরপুর</option>
                  <option value="রাজশাহী ভদ্রা মোড়">রাজশাহী ভদ্রা মোড়</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">গন্তব্য স্থান</label>
                <select 
                  value={calcTo || ""} 
                  onChange={(e) => setCalcTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="পুঠিয়া বাসস্ট্যান্ড">পুঠিয়া বাসস্ট্যান্ড</option>
                  <option value="বানেশ্বর বাজার">বানেশ্বর বাজার</option>
                  <option value="পুঠিয়া রাজবাড়ি">পুঠিয়া রাজবাড়ি</option>
                  <option value="তাহেরপুর">তাহেরপুর</option>
                  <option value="রাজশাহী ভদ্রা মোড়">রাজশাহী ভদ্রা মোড়</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">বাহনের ধরন</label>
                <select 
                  value={calcMode || ""} 
                  onChange={(e) => setCalcMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="easybike">🛺 ইজিবাইক (শেয়ার)</option>
                  <option value="cng">🚖 সিএনজি (শেয়ার)</option>
                  <option value="reserve">🚗 প্রাইভেট/রিজার্ভ সিএনজি</option>
                </select>
              </div>
            </div>

            {calcFrom === calcTo ? (
              <div className="bg-slate-50 text-center p-3 rounded-2xl text-xs font-bold text-slate-500">
                শুরু এবং গন্তব্য স্থান একই। দয়া করে ভিন্ন স্থান নির্বাচন করুন।
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">স্ট্যান্ডার্ড ভাড়া (অনুমান)</p>
                  <p className="text-xl font-black text-emerald-950">
                    {(() => {
                      // Simple fare logic table
                      const routes: Record<string, number> = {
                        'পুঠিয়া বাসস্ট্যান্ড-বানেশ্বর বাজার': 20,
                        'পুঠিয়া বাসস্ট্যান্ড-পুঠিয়া রাজবাড়ি': 10,
                        'পুঠিয়া বাসস্ট্যান্ড-তাহেরপুর': 40,
                        'পুঠিয়া বাসস্ট্যান্ড-রাজশাহী ভদ্রা মোড়': 60,
                        'বানেশ্বর বাজার-পুঠিয়া রাজবাড়ি': 25,
                        'বানেশ্বর বাজার-তাহেরপুর': 50,
                        'বানেশ্বর বাজার-রাজশাহী ভদ্রা মোড়': 40,
                        'পুঠিয়া রাজবাড়ি-তাহেরপুর': 45,
                        'পুঠিয়া রাজবাড়ি-রাজশাহী ভদ্রা মোড়': 70,
                        'তাহেরপুর-রাজশাহী ভদ্রা মোড়': 100
                      };
                      const key = [calcFrom, calcTo].sort().join('-');
                      const baseFare = routes[key] || 30;
                      if (calcMode === 'easybike') return `${baseFare} টাকা (প্রতি আসন)`;
                      if (calcMode === 'cng') return `${Math.round(baseFare * 1.5)} টাকা (প্রতি আসন)`;
                      if (calcMode === 'reserve') return `${baseFare * 7} - ${baseFare * 10} টাকা (রিজার্ভ)`;
                      return `${baseFare} টাকা`;
                    })()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-slate-500 uppercase">ভ্রমণ সময় (প্রায়)</p>
                  <p className="text-sm font-black text-slate-800">
                    {(() => {
                      const key = [calcFrom, calcTo].sort().join('-');
                      const times: Record<string, string> = {
                        'পুঠিয়া বাসস্ট্যান্ড-বানেশ্বর বাজার': '১০ - ১২ মিনিট',
                        'পুঠিয়া বাসস্ট্যান্ড-পুঠিয়া রাজবাড়ি': '৩ - ৫ মিনিট',
                        'পুঠিয়া বাসস্ট্যান্ড-তাহেরপুর': '২০ - ২৫ মিনিট',
                        'পুঠিয়া বাসস্ট্যান্ড-রাজশাহী ভদ্রা মোড়': '৩৫ - ৪০ মিনিট',
                        'বানেশ্বর বাজার-পুঠিয়া রাজবাড়ি': '১৫ - ১৮ মিনিট',
                        'বানেশ্বর বাজার-তাহেরপুর': '৩০ - ৩৫ মিনিট',
                        'বানেশ্বর বাজার-রাজশাহী ভদ্রা মোড়': '২৫ - ৩০ মিনিট',
                        'পুঠিয়া রাজবাড়ি-তাহেরপুর': '২৫ - ৩০ মিনিট',
                        'পুঠিয়া রাজবাড়ি-রাজশাহী ভদ্রা মোড়': '৪০ - ৪৫ মিনিট',
                        'তাহেরপুর-রাজশাহী ভদ্রা মোড়': '৫০ - ৬০ মিনিট'
                      };
                      return times[key] || '১৫ মিনিট';
                    })()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // SUBMENU DETAILS VIEW
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            
            {/* 1. বাসের সময়সূচী */}
            {selectedSubmenu === 'bus_schedule' && (() => {
              const busList = [
                {
                  id: 'desh-travels',
                  name: 'দেশ ট্রাভেলস (Desh Travels)',
                  type: 'AC / নন-এসি (হিউন্ডাই)',
                  category: 'dhaka',
                  route: 'রাজশাহী - বানেশ্বর - পুঠিয়া - নাটোর - ঢাকা',
                  schedule: 'সকাল ০৮:৩০, দুপুর ১২:১৫, রাত ০৯:৪৫, রাত ১০:৩০',
                  departure: 'সকাল ০৮:৩০, দুপুর ১২:১৫, রাত ০৯:৪৫, রাত ১০:৩০',
                  arrival: 'ঢাকা (গাবতলী/কল্যাণপুর): আনুমানিক ৬-৭ ঘণ্টা',
                  fare: '৮০০ - ১৩০০ টাকা',
                  phone: '০১৭৬৬-৯৯৮৮৭৭',
                  counter: 'পুঠিয়া বাসস্ট্যান্ড মোড় (সোনালী ব্যাংকের বিপরীতে)',
                  mapLink: 'https://maps.google.com/?q=Puthia+Bus+Stand',
                  ticketLink: 'https://www.shohoz.com/bus-tickets'
                },
                {
                  id: 'hanif-enterprise',
                  name: 'হানিফ এন্টারপ্রাইজ (Hanif Enterprise)',
                  type: 'নন-এসি / এসি (স্ক্যানিয়া)',
                  category: 'dhaka',
                  route: 'রাজশাহী - বানেশ্বর - পুঠিয়া - ঢাকা',
                  schedule: 'সকাল ০৭:১৫, সকাল ০৯:০০, দুপুর ০২:৩০, রাত ১০:১৫, রাত ১১:০০',
                  departure: 'সকাল ০৭:১৫, সকাল ০৯:০০, দুপুর ০২:৩০, রাত ১০:১৫, রাত ১১:০০',
                  arrival: 'ঢাকা (কল্যাণপুর/গাবতলী): আনুমানিক ৬.৫ ঘণ্টা',
                  fare: '৭৫০ - ১৫০০ টাকা',
                  phone: '০১৭১৩-০৪৯০৫০',
                  counter: 'বানেশ্বর বাজার কাউন্টার (ট্রাফিক মোড়)',
                  mapLink: 'https://maps.google.com/?q=Baneswar+Bazar',
                  ticketLink: 'https://www.busbd.com.bd/'
                },
                {
                  id: 'shyamoli-nr',
                  name: 'শ্যামলী এন.আর ট্রাভেলস (Shyamoli NR)',
                  type: 'নন-এসি (ডিলাক্স)',
                  category: 'dhaka',
                  route: 'রাজশাহী - পুঠিয়া - সিরাজগঞ্জ - ঢাকা',
                  schedule: 'সকাল ০৭:৪৫, সকাল ১১:১৫, দুপুর ০৩:৩০, রাত ১০:০০',
                  departure: 'সকাল ০৭:৪৫, সকাল ১১:১৫, দুপুর ০৩:৩০, রাত ১০:০০',
                  arrival: 'ঢাকা (আরামবাগ/কল্যাণপুর): আনুমানিক ৬ ঘণ্টা',
                  fare: '৭৫০ টাকা',
                  phone: '০১৭৫৫-৬৬৭৭৮৮',
                  counter: 'পুঠিয়া পেট্রোল পাম্প সংলগ্ন কাউন্টার',
                  mapLink: 'https://maps.google.com/?q=Puthia+Bus+Stand',
                  ticketLink: 'https://www.shohoz.com/bus-tickets'
                },
                {
                  id: 'national-travels',
                  name: 'ন্যাশনাল ট্রাভেলস (National Travels)',
                  type: 'এসি স্লিপার কোচ',
                  category: 'dhaka',
                  route: 'রাজশাহী - বানেশ্বর - ঢাকা',
                  schedule: 'দুপুর ০১:০০, রাত ০৯:১৫, রাত ১০:৪৫',
                  departure: 'দুপুর ০১:০০, রাত ০৯:১৫, রাত ১০:৪৫',
                  arrival: 'ঢাকা (আব্দুল্লাহপুর/কল্যাণপুর): আনুমানিক ৬ ঘণ্টা',
                  fare: '১৬০০ টাকা',
                  phone: '০১৭৮৮-১১২২৩৩',
                  counter: 'বানেশ্বর ট্রাফিক মোড় কাউন্টার',
                  mapLink: 'https://maps.google.com/?q=Baneswar+Bazar',
                  ticketLink: 'https://www.busbd.com.bd/'
                },
                {
                  id: 'sr-travels',
                  name: 'এসআর ট্রাভেলস (SR Travels)',
                  type: 'নন-এসি / এসি ডিলাক্স',
                  category: 'local',
                  route: 'রাজশাহী - পুঠিয়া - বগুড়া - রংপুর',
                  schedule: 'সকাল ০৮:০০, দুপুর ০১:৩০, বিকাল ০৪:১৫',
                  departure: 'সকাল ০৮:০০, দুপুর ০১:৩০, বিকাল ০৪:১৫',
                  arrival: 'রংপুর টার্মিনাল: আনুমানিক ৪.৫ ঘণ্টা',
                  fare: '৪০০ - ৬০০ টাকা',
                  phone: '০১৭১১-৪৫৬৭৮৯',
                  counter: 'পুঠিয়া বাসস্ট্যান্ড ওভারব্রিজ সংলগ্ন',
                  mapLink: 'https://maps.google.com/?q=Puthia+Bus+Stand',
                  ticketLink: 'https://www.shohoz.com/bus-tickets'
                },
                {
                  id: 'keya-transport',
                  name: 'কেয়া পরিবহন (Keya Transport)',
                  type: 'এসি / নন-এসি লাক্সারি',
                  category: 'local',
                  route: 'রাজশাহী - বানেশ্বর - পুঠিয়া - চট্টগ্রাম',
                  schedule: 'বিকাল ০৫:০০, সন্ধ্যা ০৬:৩০',
                  departure: 'বিকাল ০৫:০০, সন্ধ্যা ০৬:৩০',
                  arrival: 'চট্টগ্রাম (দামপাড়া): আনুমানিক ১১ ঘণ্টা',
                  fare: '১২০০ - ১৮০০ টাকা',
                  phone: '০১৮১৯-৯৮৭৬৫৪',
                  counter: 'বানেশ্বর বাজার হাইওয়ে মোড়',
                  mapLink: 'https://maps.google.com/?q=Baneswar+Bazar',
                  ticketLink: 'https://www.busbd.com.bd/'
                },
                {
                  id: 'local-gatolock',
                  name: 'লোকাল গেটলক সার্ভিস (রাজশাহী-নাটোর)',
                  type: 'নন-এসি ডিরেক্ট',
                  category: 'local',
                  route: 'রাজশাহী - বানেশ্বর - পুঠিয়া - নাটোর',
                  schedule: 'প্রতি ১৫ মিনিট পর পর (সকাল ০৬:০০ - রাত ০৮:৩০)',
                  departure: 'সকাল ০৬:০০ থেকে রাত ০৮:৩০ (প্রতি ১৫ মিনিট পর পর)',
                  arrival: 'নাটোর (৩০ মিনিট), রাজশাহী (৪৫ মিনিট)',
                  fare: '৫০ - ৮০ টাকা',
                  phone: 'N/A',
                  counter: 'সরাসরি বাস থেকে টিকিট (পুঠিয়া ও বানেশ্বর স্ট্যান্ড)',
                  mapLink: 'https://maps.google.com/?q=Puthia+Bus+Stand'
                }
              ];

              // Filtering logic
              const filteredBuses = busList.filter(bus => {
                // Tab filter
                if (busFilterTab === 'dhaka' && bus.category !== 'dhaka') return false;
                if (busFilterTab === 'local' && bus.category !== 'local') return false;
                if (busFilterTab === 'bookmarked' && !busBookmarks.includes(bus.id)) return false;

                // Search query filter (search by destination, name, type, route)
                if (busSearchQuery) {
                  const q = busSearchQuery.toLowerCase();
                  return (
                    bus.name.toLowerCase().includes(q) ||
                    bus.route.toLowerCase().includes(q) ||
                    bus.type.toLowerCase().includes(q) ||
                    bus.counter.toLowerCase().includes(q)
                  );
                }

                return true;
              });

              return (
                <div className="space-y-5">
                  {/* Title Header */}
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <span className="p-2.5 rounded-xl bg-blue-100 text-blue-700 font-bold">🚌</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">দূরপাল্লা ও আন্তঃজেলা বাসের সময়সূচী</h3>
                      <p className="text-xs text-slate-500">পুঠিয়া বাসস্ট্যান্ড এবং বানেশ্বর কাউন্টার থেকে ছেড়ে যাওয়া বাস</p>
                    </div>
                  </div>

                  {/* Search box for destination and operator */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="কোম্পানির নাম, গন্তব্য বা রুট লিখে খুঁজুন... (যেমন: ঢাকা, রংপুর, হানিফ)"
                      value={busSearchQuery || ""}
                      onChange={(e) => setBusSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                    />
                    {busSearchQuery && (
                      <button 
                        onClick={() => setBusSearchQuery('')}
                        className="absolute right-4 top-2 text-[10px] font-black text-slate-400 hover:text-slate-600"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-2">
                    {[
                      { id: 'all', label: 'সব বাস', count: busList.length },
                      { id: 'dhaka', label: 'দূরপাল্লা (ঢাকা)', count: busList.filter(b => b.category === 'dhaka').length },
                      { id: 'local', label: 'লোকাল ও জেলা', count: busList.filter(b => b.category === 'local').length },
                      { id: 'bookmarked', label: 'সংরক্ষিত', count: busBookmarks.length, icon: Bookmark }
                    ].map((tab) => {
                      const isActive = busFilterTab === tab.id;
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setBusFilterTab(tab.id as any)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isActive 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {Icon && <Icon className={`w-3 h-3 ${isActive ? 'fill-white' : ''}`} />}
                          <span>{tab.label}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bus Listing */}
                  <div className="space-y-4">
                    {filteredBuses.map((bus) => {
                      const isBookmarked = busBookmarks.includes(bus.id);
                      return (
                        <div key={bus.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3 hover:border-blue-200 hover:shadow-sm transition-all relative">
                          {/* Bookmark Star Indicator */}
                          <button
                            onClick={() => toggleBusBookmark(bus.id)}
                            className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                            title="বুকমার্ক করুন"
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
                          </button>

                          <div className="pr-8">
                            <h4 className="font-black text-slate-800 text-sm leading-tight">{bus.name}</h4>
                            <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold inline-block mt-1">
                              {bus.type}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-600">
                            <p className="font-medium">
                              <span className="font-bold text-slate-800">রুট:</span> {bus.route}
                            </p>
                          </div>

                          {/* Grid with core info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/80">
                              <p className="text-[10px] text-slate-400 font-bold">ছেড়ে যাওয়ার সময় (Departure)</p>
                              <p className="text-slate-800 font-black text-xs mt-0.5">{bus.departure}</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/80">
                              <p className="text-[10px] text-slate-400 font-bold">পৌঁছানোর সময় (Arrival)</p>
                              <p className="text-slate-800 font-black text-xs mt-0.5">{bus.arrival}</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/80">
                              <p className="text-[10px] text-slate-400 font-bold">টিকিট মূল্য (Standard Fare)</p>
                              <p className="text-blue-700 font-black text-xs mt-0.5">৳ {bus.fare}</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/80">
                              <p className="text-[10px] text-slate-400 font-bold">কাউন্টারের অবস্থান</p>
                              <p className="text-slate-800 font-bold text-xs mt-0.5">{bus.counter}</p>
                            </div>
                          </div>

                          {/* Action Buttons: Phone Call, Map Location, Online Ticket */}
                          <div className="flex flex-wrap gap-2 pt-1.5 border-t border-slate-50">
                            {bus.phone !== 'N/A' && (
                              <>
                                <a 
                                  href={`tel:${bus.phone}`} 
                                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                  <Phone className="w-3.5 h-3.5" /> কল করুন
                                </a>
                                <button 
                                  onClick={() => handleCopy(bus.phone, bus.name)}
                                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                                  title="নম্বর কপি করুন"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            
                            {/* Map Location Link */}
                            {bus.mapLink && (
                              <a 
                                href={bus.mapLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                              >
                                <MapIcon className="w-3.5 h-3.5" /> কাউন্টার ম্যাপ
                              </a>
                            )}

                            {/* Online Ticket Link */}
                            {bus.ticketLink && (
                              <a 
                                href={bus.ticketLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 px-3 py-2 rounded-xl text-xs font-bold transition-all ml-auto"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> টিকিট বুকিং
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {filteredBuses.length === 0 && (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-600">কোনো বাস পাওয়া যায়নি</p>
                        {busFilterTab === 'bookmarked' ? (
                          <p className="text-[10px] text-slate-400 mt-1">আপনার প্রয়োজনীয় বাসের পাশে বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করুন।</p>
                        ) : (
                          <button 
                            onClick={() => { setBusSearchQuery(''); setBusFilterTab('all'); }} 
                            className="mt-2 text-[10px] font-black text-blue-600 hover:underline"
                          >
                            সব বাস দেখুন
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 2. ট্রেনের সময়সূচী */}
            {selectedSubmenu === 'train_schedule' && (() => {
              const trainList = [
                {
                  id: 'banalata',
                  number: '791',
                  name: 'বনলতা এক্সপ্রেস',
                  englishName: 'Banalata Express',
                  type: 'আন্তঃনগর (Intercity)',
                  route: 'চাঁপাইনবাবগঞ্জ ➔ রাজশাহী ➔ নাটোর ➔ ঢাকা',
                  offday: 'শুক্রবার (Friday)',
                  stations: {
                    rajshahi: { dep: '০৬:০০ AM', arr: '০৫:৫০ AM' },
                    sardah: null,
                    nandangachhi: null,
                    natore: { dep: '০৬:৪০ AM', arr: '০৬:৩৮ AM' },
                    dhaka: { dep: '১১:৩০ AM', arr: '১১:৩০ AM' }
                  },
                  scheduleDetail: 'রাজশাহী ছাড়ার সময়: ০৬:০০ AM | ঢাকা পৌঁছানোর সময়: ১১:৩০ AM',
                  seats: [
                    { name: 'শোভন চেয়ার (Shovon Chair)', fare: '৩৫০ টাকা' },
                    { name: 'স্নিগ্ধা (Snigdha AC)', fare: '৬৫৫ টাকা' },
                    { name: 'এসি সিট (AC Seat)', fare: '৭৮৫ টাকা' },
                    { name: 'এসি বার্থ (AC Berth)', fare: '১১৭৫ টাকা' }
                  ],
                  liveInfo: {
                    currentStation: 'আত্রাই স্টেশন অতিক্রম করছে',
                    nextStation: 'নাটোর জংশন',
                    speed: '৭৮ কিমি/ঘণ্টা',
                    delay: 'সঠিক সময় (০ মিনিট বিলম্ব)',
                    progressBar: 45,
                    routeStops: ['রাজশাহী', 'নাটোর', 'আব্দুলপুর', 'ঈশ্বরদী বাইপাস', 'ঢাকা']
                  }
                },
                {
                  id: 'silkcity',
                  number: '753',
                  name: 'সিল্কসিটি এক্সপ্রেস',
                  englishName: 'Silkcity Express',
                  type: 'আন্তঃনগর (Intercity)',
                  route: 'রাজশাহী ➔ সড়দহ রোড ➔ নাটোর ➔ ঢাকা',
                  offday: 'রবিবার (Sunday)',
                  stations: {
                    rajshahi: { dep: '০৭:৪০ AM', arr: '০৩:৫০ PM' },
                    sardah: { dep: '০৮:০১ AM', arr: '০৩:২৯ PM' },
                    nandangachhi: null,
                    natore: { dep: '০৮:২৫ AM', arr: '০৩:০৩ PM' },
                    dhaka: { dep: '০১:৩০ PM', arr: '০৭:৪০ AM' }
                  },
                  scheduleDetail: 'রাজশাহী ছাড়ার সময়: ০৭:৪০ AM (সড়দহ: ০৮:০১ AM) | ঢাকা পৌঁছানোর সময়: ০১:৩০ PM',
                  seats: [
                    { name: 'শোভন চেয়ার (Shovon Chair)', fare: '৩৫০ টাকা' },
                    { name: 'স্নিগ্ধা (Snigdha AC)', fare: '৬৫৫ টাকা' },
                    { name: 'এসি কেবিন (AC Cabin)', fare: '১০০০ টাকা' }
                  ],
                  liveInfo: {
                    currentStation: 'টাঙ্গাইল স্টেশন',
                    nextStation: 'জয়দেবপুর জংশন',
                    speed: '৭২ কিমি/ঘণ্টা',
                    delay: '১০ মিনিট বিলম্ব',
                    progressBar: 80,
                    routeStops: ['রাজশাহী', 'সড়দহ রোড', 'নাটোর', 'মির্জাপুর', 'টাঙ্গাইল', 'ঢাকা']
                  }
                },
                {
                  id: 'padma',
                  number: '759',
                  name: 'পদ্মা এক্সপ্রেস',
                  englishName: 'Padma Express',
                  type: 'আন্তঃনগর (Intercity)',
                  route: 'রাজশাহী ➔ সড়দহ রোড ➔ নাটোর ➔ ঢাকা',
                  offday: 'মঙ্গলবার (Tuesday)',
                  stations: {
                    rajshahi: { dep: '০৪:০০ PM', arr: '১২:১৫ PM' },
                    sardah: { dep: '০৪:২২ PM', arr: '১১:৫০ AM' },
                    nandangachhi: null,
                    natore: { dep: '০৪:৪৫ PM', arr: '১১:২০ AM' },
                    dhaka: { dep: '০৯:৪৫ PM', arr: '১১:০০ PM' }
                  },
                  scheduleDetail: 'রাজশাহী ছাড়ার সময়: ০৪:০০ PM (সড়দহ: ০৪:২২ PM) | ঢাকা পৌঁছানোর সময়: ০৯:৪৫ PM',
                  seats: [
                    { name: 'শোভন চেয়ার (Shovon Chair)', fare: '৩৫০ টাকা' },
                    { name: 'স্নিগ্ধা (Snigdha AC)', fare: '৬৫৫ টাকা' },
                    { name: 'এসি বার্থ (AC Berth)', fare: '১২০০ টাকা' }
                  ],
                  liveInfo: {
                    currentStation: 'সড়দহ রোড স্টেশন পার হচ্ছে',
                    nextStation: 'নাটোর স্টেশন',
                    speed: '৬৫  কিমি/ঘণ্টা',
                    delay: 'সঠিক সময়',
                    progressBar: 15,
                    routeStops: ['রাজশাহী', 'সড়দহ রোড', 'নাটোর', 'টাঙ্গাইল', 'ঢাকা']
                  }
                },
                {
                  id: 'dhumketu',
                  number: '769',
                  name: 'ধূমকেতু এক্সপ্রেস',
                  englishName: 'Dhumketu Express',
                  type: 'আন্তঃনগর (Intercity)',
                  route: 'রাজশাহী ➔ নাটোর ➔ ঢাকা',
                  offday: 'বৃহস্পতিবার (Thursday)',
                  stations: {
                    rajshahi: { dep: '১১:২০ PM', arr: '১১:৪০ AM' },
                    sardah: null,
                    nandangachhi: null,
                    natore: { dep: '১২:০২ AM', arr: '১০:৫৮ AM' },
                    dhaka: { dep: '০৪:৫০ AM', arr: '০৬:০০ AM' }
                  },
                  scheduleDetail: 'রাজশাহী ছাড়ার সময়: ১১:২০ PM | ঢাকা পৌঁছানোর সময়: ০৪:৫০ AM',
                  seats: [
                    { name: 'শোভন চেয়ার (Shovon Chair)', fare: '৩৫০ টাকা' },
                    { name: 'স্নিগ্ধা (Snigdha AC)', fare: '৬৫৫ টাকা' },
                    { name: 'এসি সিট (AC Seat)', fare: '৭৮৫ টাকা' }
                  ],
                  liveInfo: {
                    currentStation: 'বঙ্গবন্ধু সেতু পশ্চিম',
                    nextStation: 'বঙ্গবন্ধু সেতু পূর্ব',
                    speed: '৫০ কিমি/ঘণ্টা',
                    delay: '৫ মিনিট বিলম্ব',
                    progressBar: 60,
                    routeStops: ['রাজশাহী', 'নাটোর', 'মুলাডুলি', 'সিরাজগঞ্জ', 'ঢাকা']
                  }
                },
                {
                  id: 'madhumati',
                  number: '755',
                  name: 'মধুমতি এক্সপ্রেস',
                  englishName: 'Madhumati Express',
                  type: 'আন্তঃনগর (Intercity)',
                  route: 'রাজশাহী ➔ সড়দহ রোড ➔ নন্দনগাছি ➔ ভাঙ্গা (ফরিদপুর)',
                  offday: 'বৃহস্পতিবার (Thursday)',
                  stations: {
                    rajshahi: { dep: '০৮:০০ AM', arr: '০৮:৪০ PM' },
                    sardah: { dep: '০৮:২১ AM', arr: '০৮:১৯ PM' },
                    nandangachhi: { dep: '০৮:৩২ AM', arr: '০৮:০৮ PM' },
                    natore: null,
                    bhanga: { dep: '০২:৪০ PM', arr: '০৩:০০ PM' }
                  },
                  scheduleDetail: 'রাজশাহী ছাড়ার সময়: ০৮:০০ AM (সড়দহ: ০৮:২১ AM) | ভাঙ্গা পৌঁছানোর সময়: ০২:৪০ PM',
                  seats: [
                    { name: 'শোভন চেয়ার (Shovon Chair)', fare: '২৪০ টাকা' },
                    { name: 'শোভন (Shovon)', fare: '২০০ টাকা' },
                    { name: 'স্নিগ্ধা (Snigdha AC)', fare: '৪৭৫ টাকা' }
                  ],
                  liveInfo: {
                    currentStation: 'রাজবাড়ী স্টেশন',
                    nextStation: 'ফরিদপুর স্টেশন',
                    speed: '৫৫ কিমি/ঘণ্টা',
                    delay: 'সঠিক সময়',
                    progressBar: 75,
                    routeStops: ['রাজশাহী', 'সড়দহ রোড', 'নন্দনগাছি', 'কুষ্টিয়া', 'রাজবাড়ী', 'ভাঙ্গা']
                  }
                },
                {
                  id: 'titumir',
                  number: '733',
                  name: 'তিতুমীর এক্সপ্রেস',
                  englishName: 'Titumir Express',
                  type: 'আন্তঃনগর (Intercity)',
                  route: 'রাজশাহী ➔ নাটোর ➔ সান্তাহার ➔ চিলাহাটি',
                  offday: 'বুধবার (Wednesday)',
                  stations: {
                    rajshahi: { dep: '০৬:২০ AM', arr: '০৯:৪৫ PM' },
                    sardah: null,
                    nandangachhi: null,
                    natore: { dep: '০৭:০৭ AM', arr: '০৮:৫৪ PM' },
                    chilahati: { dep: '১২:৫৫ PM', arr: '০২:৩০ PM' }
                  },
                  scheduleDetail: 'রাজশাহী ছাড়ার সময়: ০৬:২০ AM | চিলাহাটি পৌঁছানোর সময়: ১২:৫৫ PM',
                  seats: [
                    { name: 'শোভন চেয়ার (Shovon Chair)', fare: '২৮০ টাকা' },
                    { name: 'শোভন (Shovon)', fare: '২৩০ টাকা' }
                  ],
                  liveInfo: {
                    currentStation: 'সান্তাহার জংশন',
                    nextStation: 'জয়পুরহাট',
                    speed: '৬৫ কিমি/ঘণ্টা',
                    delay: '১২ মিনিট বিলম্ব',
                    progressBar: 40,
                    routeStops: ['রাজশাহী', 'নাটোর', 'সান্তাহার', 'বগুড়া', 'হিলি', 'চিলাহাটি']
                  }
                },
                {
                  id: 'uttara-mail',
                  number: '31',
                  name: 'উত্তরা এক্সপ্রেস (মেল)',
                  englishName: 'Uttara Express (Mail)',
                  type: 'মেইল/লোকাল (Mail/Local)',
                  route: 'রাজশাহী ➔ সড়দহ রোড ➔ নন্দনগাছি ➔ নাটোর ➔ পার্বতীপুর',
                  offday: 'নেই (No Offday)',
                  stations: {
                    rajshahi: { dep: '১২:৩০ PM', arr: '১০:৪৫ AM' },
                    sardah: { dep: '১২:৫২ PM', arr: '১০:১৫ AM' },
                    nandangachhi: { dep: '০১:০৫ PM', arr: '১০:০২ AM' },
                    natore: { dep: '০১:৩৫ PM', arr: '০৯:৩০ AM' },
                    parbatipur: { dep: '০৭:৩০ PM', arr: '০৩:৪৫ AM' }
                  },
                  scheduleDetail: 'রাজশাহী ছাড়ার সময়: ১২:৩০ PM (সড়দহ: ১২:৫২ PM, নন্দনগাছি: ০১:০৫ PM)',
                  seats: [
                    { name: 'সুলভ (Shulob)', fare: '৯০ টাকা' },
                    { name: 'শোভন (Shovon)', fare: '১২৫ টাকা' }
                  ],
                  liveInfo: {
                    currentStation: 'নন্দনগাছি রেলওয়ে স্টেশন',
                    nextStation: 'নন্দনগাছি জংশন পার হয়ে নাটোর',
                    speed: '৪০ কিমি/ঘণ্টা',
                    delay: 'সঠিক সময়',
                    progressBar: 25,
                    routeStops: ['রাজশাহী', 'সড়দহ রোড', 'নন্দনগাছি', 'নাটোর', 'সান্তাহার', 'পার্বতীপুর']
                  }
                }
              ];

              // Filtering logic
              const filteredTrains = trainList.filter(train => {
                // Station Selection Filter
                if (trainStationFilter === 'sardah' && !train.stations.sardah) return false;
                if (trainStationFilter === 'nandangachhi' && !train.stations.nandangachhi) return false;
                if (trainStationFilter === 'rajshahi' && !train.stations.rajshahi) return false;
                if (trainStationFilter === 'natore' && !train.stations.natore) return false;
                if (trainStationFilter === 'bookmarked' && !trainBookmarks.includes(train.id)) return false;

                // Search Input filter
                if (trainSearchQuery) {
                  const q = trainSearchQuery.toLowerCase();
                  return (
                    train.name.toLowerCase().includes(q) ||
                    train.englishName.toLowerCase().includes(q) ||
                    train.number.includes(q) ||
                    train.route.toLowerCase().includes(q) ||
                    train.type.toLowerCase().includes(q)
                  );
                }

                return true;
              });

              // Selected train for live status simulation detail
              const currentLiveTrain = trainList.find(t => t.id === selectedTrainForStatus);

              return (
                <div className="space-y-5">
                  {/* Title Header */}
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <span className="p-2.5 rounded-xl bg-rose-100 text-rose-700 font-bold">🚆</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">নিকটবর্তী রেলওয়ে ট্রেনের সময়সূচী</h3>
                      <p className="text-xs text-slate-500">পুঠিয়ার নিকটবর্তী সড়দহ রোড, নন্দনগাছি, নাটোর এবং রাজশাহী স্টেশনের ট্রেনের সময়সূচী</p>
                    </div>
                  </div>

                  {/* Online Ticket Link Section */}
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-emerald-100 flex items-center gap-1">
                        <span>🎫</span> রেলওয়ের অফিসিয়াল টিকিট বুকিং
                      </p>
                      <h4 className="font-black text-sm md:text-base">অনলাইন টিকিট বুকিং (e-Ticketing)</h4>
                      <p className="text-[11px] text-emerald-50 text-slate-200">ঘরে বসেই বাংলাদেশ রেলওয়ের টিকিট সংগ্রহ করুন সহজ ও নিরাপদ উপায়ে।</p>
                    </div>
                    <a 
                      href="https://eticket.railway.gov.bd/"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white text-emerald-800 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-emerald-50 transition-all shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> অনলাইন টিকিট বুকিং
                    </a>
                  </div>

                  {/* Station selection / Filter Tab */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" /> স্টেশন নির্বাচন করুন (Filter by Railway Station):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'সব স্টেশন', desc: 'সকল ট্রেন' },
                        { id: 'sardah', label: 'সড়দহ রোড', desc: 'পুঠিয়ার নিকটবর্তী (১০ কিমি)' },
                        { id: 'nandangachhi', label: 'নন্দনগাছি', desc: 'ভলুকগাছি সংলগ্ন (১২ কিমি)' },
                        { id: 'natore', label: 'নাটোর স্টেশন', desc: '১৮ কিমি দূরে' },
                        { id: 'rajshahi', label: 'রাজশাহী স্টেশন', desc: '২৯ কিমি দূরে' },
                        { id: 'bookmarked', label: 'সংরক্ষিত', desc: 'পছন্দের ট্রেন', icon: Bookmark }
                      ].map((station) => {
                        const isActive = trainStationFilter === station.id;
                        const Icon = station.icon;
                        return (
                          <button
                            key={station.id}
                            onClick={() => setTrainStationFilter(station.id as any)}
                            className={`px-3 py-2 rounded-xl text-left border transition-all flex flex-col justify-center min-w-[95px] flex-1 ${
                              isActive
                                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <span className="text-xs font-black flex items-center gap-1">
                              {Icon && <Icon className={`w-3 h-3 ${isActive ? 'fill-white' : ''}`} />}
                              {station.label}
                            </span>
                            <span className={`text-[9px] font-medium mt-0.5 ${isActive ? 'text-rose-100' : 'text-slate-400'}`}>
                              {station.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search box for train names */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="ট্রেনের নাম বা নম্বর লিখে খুঁজুন... (যেমন: বনলতা, ৭৯১, সিল্কসিটি, ৭৬৯)"
                      value={trainSearchQuery || ""}
                      onChange={(e) => setTrainSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-sm transition-all"
                    />
                    {trainSearchQuery && (
                      <button 
                        onClick={() => setTrainSearchQuery('')}
                        className="absolute right-4 top-2.5 text-xs font-black text-slate-400 hover:text-slate-600"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>

                  {/* Interactive Live Train Status Component */}
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        <h4 className="font-black text-xs text-slate-800">লাইভ ট্রেন স্ট্যাটাস ট্র্যাকার (Simulated GPS & SMS)</h4>
                      </div>
                      
                      {selectedTrainForStatus && (
                        <button 
                          onClick={() => setSelectedTrainForStatus(null)}
                          className="text-[10px] text-slate-500 hover:text-slate-700 font-bold"
                        >
                          বন্ধ করুন
                        </button>
                      )}
                    </div>

                    {!selectedTrainForStatus ? (
                      <div className="space-y-2.5">
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          ট্রেনের বর্তমান লাইভ জিপিএস লোকেশন ও গতি জানতে নিচে তালিকাভুক্ত যেকোনো ট্রেনের <span className="font-bold text-rose-600">"লাইভ স্ট্যাটাস"</span> বাটনে ক্লিক করুন অথবা রেলওয়ে এসএমএস পদ্ধতি ব্যবহার করুন।
                        </p>
                        <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-600">
                          <span className="p-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold shrink-0">✉️ SMS পদ্ধতি</span>
                          <div>
                            <p className="font-bold text-slate-800">অফলাইন এসএমএস ট্র্যাকিং:</p>
                            <p className="mt-0.5">আপনার মেসেজ অপশনে গিয়ে লিখুন <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono font-bold">TR [TrainNo]</code> (যেমন: <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono">TR 791</code>) এবং পাঠিয়ে দিন <span className="font-black text-slate-800">16318</span> নাম্বারে।</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-3.5 rounded-xl border border-rose-100 space-y-3.5 relative overflow-hidden">
                        <div className="absolute right-0 top-0 bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                          LIVE SIMULATION
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs">🚄</span>
                          <div>
                            <h5 className="font-black text-slate-800 text-xs">{currentLiveTrain?.name} ({currentLiveTrain?.number})</h5>
                            <p className="text-[9px] text-slate-400 font-medium">{currentLiveTrain?.route}</p>
                          </div>
                        </div>

                        {/* Animated progress slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                            <span>উৎস</span>
                            <span>{currentLiveTrain?.liveInfo.currentStation}</span>
                            <span>গন্তব্য</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                            <div 
                              className="bg-rose-500 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${currentLiveTrain?.liveInfo.progressBar}%` }}
                            ></div>
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-rose-500 rounded-full flex items-center justify-center shadow-sm"
                              style={{ left: `calc(${currentLiveTrain?.liveInfo.progressBar}% - 8px)` }}
                            >
                              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive live metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <span className="text-[9px] text-slate-400 font-bold block">বর্তমান গতি</span>
                            <span className="text-[11px] font-black text-slate-700">{currentLiveTrain?.liveInfo.speed}</span>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <span className="text-[9px] text-slate-400 font-bold block">নেক্সট স্টেশন</span>
                            <span className="text-[11px] font-black text-rose-600 block truncate">{currentLiveTrain?.liveInfo.nextStation}</span>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <span className="text-[9px] text-slate-400 font-bold block">বিলম্ব স্ট্যাটাস</span>
                            <span className="text-[11px] font-black text-emerald-600">{currentLiveTrain?.liveInfo.delay}</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2 bg-rose-50/20 -mx-3.5 -mb-3.5 p-3">
                          <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-rose-500 animate-spin" /> {currentLiveTrain?.name} বর্তমানে {currentLiveTrain?.liveInfo.currentStation} এবং পরবর্তী স্টপেজ {currentLiveTrain?.liveInfo.nextStation}।</span>
                          <button 
                            onClick={() => {
                              toast.success('লাইভ স্ট্যাটাস আপডেট করা হয়েছে');
                            }} 
                            className="text-rose-600 font-black flex items-center gap-1 hover:underline"
                          >
                            <RefreshCw className="w-3 h-3" /> রিফ্রেশ করুন
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Train Schedule List */}
                  <div className="space-y-4">
                    {filteredTrains.map((train) => {
                      const isBookmarked = trainBookmarks.includes(train.id);
                      return (
                        <div key={train.id} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4 hover:border-rose-200 hover:shadow-sm transition-all relative">
                          {/* Bookmark button */}
                          <button
                            onClick={() => toggleTrainBookmark(train.id)}
                            className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                            title="বুকমার্ক করুন"
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-rose-600 text-rose-600' : ''}`} />
                          </button>

                          {/* Top part: Train Info */}
                          <div className="pr-8">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-800 text-sm leading-tight">{train.name}</h4>
                              <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                                নং {train.number}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                                {train.type}
                              </span>
                              <span className="text-[10px] bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                ছুটির দিন: {train.offday}
                              </span>
                            </div>
                          </div>

                          {/* Route Flow block */}
                          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 text-xs space-y-1">
                            <p className="font-bold text-slate-700">রুট ও স্টেশন বিরতি:</p>
                            <p className="text-slate-600 leading-relaxed font-medium">{train.route}</p>
                          </div>

                          {/* Stations detail grid */}
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">স্টেশনভিত্তিক সময়সূচী (Station Timings)</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              {train.stations.rajshahi && (
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/80">
                                  <p className="text-[9px] text-slate-400 font-bold">রাজশাহী স্টেশন</p>
                                  <p className="text-slate-800 font-black text-[11px] mt-0.5">ছাড়ার সময়: {train.stations.rajshahi.dep}</p>
                                </div>
                              )}
                              {train.stations.sardah && (
                                <div className="bg-rose-50/40 p-2 rounded-xl border border-rose-100/40">
                                  <p className="text-[9px] text-rose-700 font-bold">সড়দহ রোড স্টেশন</p>
                                  <p className="text-slate-800 font-black text-[11px] mt-0.5">ছাড়ার সময়: {train.stations.sardah.dep}</p>
                                </div>
                              )}
                              {train.stations.nandangachhi && (
                                <div className="bg-amber-50/40 p-2 rounded-xl border border-amber-100/40">
                                  <p className="text-[9px] text-amber-700 font-bold">নন্দনগাছি স্টেশন</p>
                                  <p className="text-slate-800 font-black text-[11px] mt-0.5">ছাড়ার সময়: {train.stations.nandangachhi.dep}</p>
                                </div>
                              )}
                              {train.stations.natore && (
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/80">
                                  <p className="text-[9px] text-slate-400 font-bold">নাটোর স্টেশন</p>
                                  <p className="text-slate-800 font-black text-[11px] mt-0.5">ছাড়ার সময়: {train.stations.natore.dep}</p>
                                </div>
                              )}
                              {train.stations.dhaka && (
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100/80 col-span-1 sm:col-span-1">
                                  <p className="text-[9px] text-slate-400 font-bold">ঢাকা স্টেশন</p>
                                  <p className="text-slate-800 font-black text-[11px] mt-0.5">পৌঁছানোর সময়: {train.stations.dhaka.dep}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Seat & Fare Types section */}
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-emerald-600" /> সিটের ধরন ও ভাড়া তালিকা (Seat Classes & Fares)
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {train.seats.map((seat, sIdx) => (
                                <div key={sIdx} className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                  <span className="font-bold text-slate-600">{seat.name}:</span>
                                  <span className="font-black text-emerald-700">{seat.fare}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Lower Action buttons: Live status check & SMS Info */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                            <button
                              onClick={() => {
                                setSelectedTrainForStatus(train.id);
                                // Scroll up to the live status component smoothly
                                const element = document.getElementById('selected-submenu-container');
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                                toast.success(`${train.name} এর লাইভ স্ট্যাটাস সক্রিয় করা হয়েছে`);
                              }}
                              className="flex-1 min-w-[120px] bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                              <Navigation className="w-3.5 h-3.5" /> লাইভ স্ট্যাটাস দেখুন
                            </button>

                            <button
                              onClick={() => {
                                handleCopy(`TR ${train.number}`, `${train.name} SMS`);
                                toast.success('এসএমএস কোড কপি হয়েছে! ১৬৩১৮ এ পাঠিয়ে দিন।');
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                              title="এসএমএস কোড কপি করুন"
                            >
                              <Copy className="w-3.5 h-3.5" /> SMS কোড
                            </button>

                            <a
                              href="https://eticket.railway.gov.bd/"
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center gap-1 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-2 rounded-xl text-xs font-bold transition-all ml-auto"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> টিকিট কিনুন
                            </a>
                          </div>
                        </div>
                      );
                    })}

                    {filteredTrains.length === 0 && (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-600">কোনো ট্রেন পাওয়া যায়নি</p>
                        {trainStationFilter === 'bookmarked' ? (
                          <p className="text-[10px] text-slate-400 mt-1">পছন্দের ট্রেনের পাশে বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করুন।</p>
                        ) : (
                          <button 
                            onClick={() => { setTrainSearchQuery(''); setTrainStationFilter('all'); }} 
                            className="mt-2 text-[10px] font-black text-rose-600 hover:underline"
                          >
                            সব ট্রেন দেখুন
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 3. CNG / অটোরিকশা */}
            {selectedSubmenu === 'cng_auto' && (() => {
              const cngStandsData = [
                {
                  id: 'stand-1',
                  name: 'পুঠিয়া বাসস্ট্যান্ড সিএনজি ও অটোরিকশা স্ট্যান্ড',
                  location: 'ঢাকা-রাজশাহী মহাসড়ক মোড়, পুরাতন বাসস্ট্যান্ড সংলগ্ন, পুঠিয়া',
                  hours: '২৪ ঘণ্টা খোলা (২৪ Hours Service)',
                  is24h: true,
                  routes: 'পুঠিয়া ➔ বানেশ্বর, রাজশাহী, নাটোর, তাহেরপুর ও শিবপুর',
                  contactPerson: 'রফিকুল ইসলাম (সভাপতি)',
                  contactPhone: '01712849301',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Puthia+Bus+Stand+Rajshahi'
                },
                {
                  id: 'stand-2',
                  name: 'বানেশ্বর বাজার ট্রাফিক মোড় সিএনজি স্ট্যান্ড',
                  location: 'বানেশ্বর ট্রাফিক মোড় ও কলেজ রোড সংলগ্ন, বানেশ্বর বাজার',
                  hours: '২৪ ঘণ্টা খোলা (২৪ Hours Emergency)',
                  is24h: true,
                  routes: 'বানেশ্বর ➔ রাজশাহী শহর (ভদ্রা/শিরোইল), পুঠিয়া, চারঘাট, বেলপুকুর',
                  contactPerson: 'আব্দুল কুদ্দুস (সম্পাদক)',
                  contactPhone: '01735128490',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Baneshwar+Bazar+Rajshahi'
                },
                {
                  id: 'stand-3',
                  name: 'তাহেরপুর মোড় অটোরিকশা ও সিএনজি স্ট্যান্ড',
                  location: 'তাহেরপুর রোড বাইপাস মোড়, পুঠিয়া',
                  hours: 'সকাল ০৬:০০ AM - রাত ১০:০০ PM',
                  is24h: false,
                  routes: 'পুঠিয়া ➔ তাহেরপুর, বাগমারা, শুভডাঙ্গা, সাধনপুর',
                  contactPerson: 'জাহাঙ্গীর আলম',
                  contactPhone: '01728639102',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Puthia+Taherpur+Road'
                },
                {
                  id: 'stand-4',
                  name: 'ঝলমলিয়া বাজার ও হাসপাতাল মোড় স্ট্যান্ড',
                  location: 'ঝলমলিয়া বাজার রাজবাড়ি রোড ও স্বাস্থ্য কমপ্লেক্স মোড়',
                  hours: '২৪ ঘণ্টা খোলা (হাসপাতাল জরুরি নাইট ট্রিপ)',
                  is24h: true,
                  routes: 'ঝলমলিয়া ➔ পুঠিয়া রাজবাড়ি, নাটোর মহাসড়ক, পীরগাছা',
                  contactPerson: 'হেলাল উদ্দিন',
                  contactPhone: '01711984203',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Jhalmalia+Puthia'
                },
                {
                  id: 'stand-5',
                  name: 'শিবপুর বাজার সিএনজি স্ট্যান্ড',
                  location: 'শিবপুর বাজার হাটখোলা ও বহুমুখী স্কুল মাঠ সংলগ্ন',
                  hours: 'সকাল ০৬:৩০ AM - রাত ০৯:৩০ PM',
                  is24h: false,
                  routes: 'শিবপুর ➔ পুঠিয়া, বানেশ্বর, ঝলমলিয়া, নাটোর বাইপাস',
                  contactPerson: 'আকরাম হোসেন',
                  contactPhone: '01819472019',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Shivpur+Bazar+Puthia'
                }
              ];

              const cngFaresData = [
                {
                  id: 'fare-1',
                  route: 'পুঠিয়া বাসস্ট্যান্ড ➔ বানেশ্বর বাজার',
                  shared: '২০ টাকা',
                  reserve: '১৫০ টাকা',
                  distance: '৮ কিমি',
                  time: '১০ মিনিট',
                  is24h: true,
                  mapUrl: 'https://www.google.com/maps/dir/Puthia+Bus+Stand/Baneshwar+Bazar'
                },
                {
                  id: 'fare-2',
                  route: 'বানেশ্বর বাজার ➔ রাজশাহী ভদ্রা মোড়/শিরোইল',
                  shared: '৪০ টাকা',
                  reserve: '৩০০ টাকা',
                  distance: '১৮ কিমি',
                  time: '২৫ মিনিট',
                  is24h: true,
                  mapUrl: 'https://www.google.com/maps/dir/Baneshwar+Bazar/Bhadra+Rajshahi'
                },
                {
                  id: 'fare-3',
                  route: 'পুঠিয়া বাসস্ট্যান্ড ➔ নাটোর বাসস্ট্যান্ড/স্টেশন',
                  shared: '৫০ টাকা',
                  reserve: '৩৫০ টাকা',
                  distance: '১৭ কিমি',
                  time: '৩০ মিনিট',
                  is24h: true,
                  mapUrl: 'https://www.google.com/maps/dir/Puthia+Bus+Stand/Natore'
                },
                {
                  id: 'fare-4',
                  route: 'পুঠিয়া বাসস্ট্যান্ড ➔ তাহেরপুর বাজার',
                  shared: '৩৫ টাকা',
                  reserve: '২৫০ টাকা',
                  distance: '১২ কিমি',
                  time: '২০ মিনিট',
                  is24h: false,
                  mapUrl: 'https://www.google.com/maps/dir/Puthia+Bus+Stand/Taherpur'
                },
                {
                  id: 'fare-5',
                  route: 'পুঠিয়া ➔ শিবপুর বাজার',
                  shared: '১৫ টাকা',
                  reserve: '১০০ টাকা',
                  distance: '৬ কিমি',
                  time: '১২ মিনিট',
                  is24h: false,
                  mapUrl: 'https://www.google.com/maps/dir/Puthia/Shivpur+Bazar'
                },
                {
                  id: 'fare-6',
                  route: 'পুঠিয়া রাজবাড়ি ➔ ঝলমলিয়া হাসপাতাল',
                  shared: '১০ টাকা',
                  reserve: '৮০ টাকা',
                  distance: '৩ কিমি',
                  time: '৭ মিনিট',
                  is24h: true,
                  mapUrl: 'https://www.google.com/maps/dir/Puthia+Rajbari/Jhalmalia'
                },
                {
                  id: 'fare-7',
                  route: 'বানেশ্বর বাজার ➔ চারঘাট ট্রাফিক মোড়',
                  shared: '২৫ টাকা',
                  reserve: '২০০ টাকা',
                  distance: '১০ কিমি',
                  time: '১৫ মিনিট',
                  is24h: false,
                  mapUrl: 'https://www.google.com/maps/dir/Baneshwar/Charghat'
                }
              ];

              const cngDriversData = [
                {
                  id: 'driver-1',
                  name: 'রফিকুল ইসলাম',
                  role: 'সভাপতি, পুঠিয়া সিএনজি সমিতি',
                  stand: 'পুঠিয়া বাসস্ট্যান্ড',
                  vehicle: '৫ সিট সিএনজি অটোরিকশা (রাজশাহী থ-১২-৮৪০১)',
                  phone: '01712849301',
                  is24h: true,
                  note: '২৪ ঘণ্টা জরুরি রিজার্ভ ও রাজশাহী হাসপাতাল ট্রিপ সার্ভিস'
                },
                {
                  id: 'driver-2',
                  name: 'মাসুদ রানা',
                  role: 'সহ-সভাপতি',
                  stand: 'পুঠিয়া বাসস্ট্যান্ড',
                  vehicle: '৪ সিট সিএনজি (রাজশাহী থ-১১-৫৮০২)',
                  phone: '01823940215',
                  is24h: true,
                  note: '২৪ ঘণ্টা নাইট পেশেন্ট রিজার্ভ সার্ভিস'
                },
                {
                  id: 'driver-3',
                  name: 'আব্দুল কুদ্দুস',
                  role: 'মহাসচীব, বানেশ্বর সিএনজি ইউনিট',
                  stand: 'বানেশ্বর বাজার ট্রাফিক মোড়',
                  vehicle: 'সিএনজি অটোরিকশা (রাজশাহী থ-১৪-৭০৩২)',
                  phone: '01735128490',
                  is24h: true,
                  note: '২৪ ঘণ্টা রাজশাহী মেডিকেল জরুরি রোগী বহনে অগ্রাধিকার'
                },
                {
                  id: 'driver-4',
                  name: 'শাহজাহান আলী',
                  role: 'সদস্য, চালক কল্যাণ',
                  stand: 'বানেশ্বর ট্রাফিক মোড়',
                  vehicle: 'সিএনজি (রাজশাহী থ-১২-০৯৫৪)',
                  phone: '01914502831',
                  is24h: false,
                  note: 'সকাল ৬:০০ - রাত ১১:০০ লোকাল ও রিজার্ভ সার্ভিস'
                },
                {
                  id: 'driver-5',
                  name: 'জাহাঙ্গীর আলম',
                  role: 'লাইন মাস্টার',
                  stand: 'তাহেরপুর মোড় স্ট্যান্ড',
                  vehicle: '৫ সিট অটোরিকশা (রাজশাহী থ-১৫-১১৪৩)',
                  phone: '01728639102',
                  is24h: false,
                  note: 'সকাল ৬:০০ - রাত ১০:০০ তাহেরপুর ও বাগমারা রুট'
                },
                {
                  id: 'driver-6',
                  name: 'হেলাল উদ্দিন',
                  role: 'জরুরি সার্ভিস ইনচার্জ',
                  stand: 'ঝলমলিয়া স্ট্যান্ড',
                  vehicle: 'সিএনজি অটোরিকশা (রাজশাহী থ-১৩-৪৯০২)',
                  phone: '01711984203',
                  is24h: true,
                  note: '২৪ ঘণ্টা স্বাস্থ্য কমপ্লেক্স ও নাটোর জরুরি ট্রিপ'
                }
              ];

              // Filtering logic
              const queryStr = cngSearchQuery.toLowerCase();

              const filteredStands = cngStandsData.filter(s => {
                if (cngTabFilter === '24hrs' && !s.is24h) return false;
                if (!queryStr) return true;
                return s.name.toLowerCase().includes(queryStr) || s.location.toLowerCase().includes(queryStr) || s.routes.toLowerCase().includes(queryStr);
              });

              const filteredFares = cngFaresData.filter(f => {
                if (cngTabFilter === '24hrs' && !f.is24h) return false;
                if (!queryStr) return true;
                return f.route.toLowerCase().includes(queryStr);
              });

              const filteredDrivers = cngDriversData.filter(d => {
                if (cngTabFilter === '24hrs' && !d.is24h) return false;
                if (!queryStr) return true;
                return d.name.toLowerCase().includes(queryStr) || d.stand.toLowerCase().includes(queryStr) || d.phone.includes(queryStr);
              });

              const showStands = cngTabFilter === 'all' || cngTabFilter === 'stands' || cngTabFilter === '24hrs';
              const showFares = cngTabFilter === 'all' || cngTabFilter === 'fares' || cngTabFilter === '24hrs';
              const showDrivers = cngTabFilter === 'all' || cngTabFilter === 'drivers' || cngTabFilter === '24hrs';

              return (
                <div className="space-y-5">
                  {/* Header Title */}
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <span className="p-2.5 rounded-xl bg-green-100 text-green-700 font-bold text-lg">🚖</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">CNG ও অটোরিকশা সেবা কেন্দ্র</h3>
                      <p className="text-xs text-slate-500">পুঠিয়া উপজেলার সকল সিএনজি স্ট্যান্ড, রুট ও আনুমানিক ভাড়া, চালকদের ফোন নম্বর এবং ২৪ ঘণ্টা জরুরি সেবা</p>
                    </div>
                  </div>

                  {/* Emergency 24/7 Call Banner */}
                  <div className="p-4 bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full inline-block">
                        ⚡ ২৪ ঘণ্টা জরুরি সিএনজি রিজার্ভ
                      </span>
                      <h4 className="font-black text-sm md:text-base">জরুরি হাসপাতাল বা গভীর রাতের সিএনজি প্রয়োজন?</h4>
                      <p className="text-[11px] text-emerald-100">রাজশাহী মেডিকেল বা নাইট রিজার্ভের জন্য সিএনজি সমিতির জরুরি হটলাইনে সরাসরি কল করুন।</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a 
                        href="tel:01712849301"
                        className="bg-white text-emerald-800 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-emerald-50 transition-all shadow-sm"
                      >
                        <Phone className="w-4 h-4 text-emerald-600 fill-emerald-600" /> 01712-849301
                      </a>
                      <button 
                        onClick={() => handleCopy('01712849301', 'জরুরি সিএনজি নম্বর')}
                        className="p-2.5 bg-emerald-800/60 hover:bg-emerald-800 text-white rounded-xl transition-all"
                        title="নম্বর কপি করুন"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-slate-500 flex items-center gap-1">
                      <Search className="w-3 h-3 text-emerald-600" /> ক্যাটাগরি ফিল্টার করুন:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'সব তথ্য', desc: 'সকল তালিকা' },
                        { id: 'stands', label: 'স্ট্যান্ড লোকেশন', desc: 'স্ট্যান্ড ও ম্যাপ' },
                        { id: 'fares', label: 'আনুমানিক ভাড়া', desc: 'শেয়ার ও রিজার্ভ' },
                        { id: 'drivers', label: 'চালকের ফোন', desc: 'জরুরি নম্বর' },
                        { id: '24hrs', label: '২৪ ঘণ্টা সেবা', desc: 'নাইট সার্ভিস', isHighlight: true }
                      ].map((tab) => {
                        const isActive = cngTabFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setCngTabFilter(tab.id as any)}
                            className={`px-3 py-2 rounded-xl text-left border transition-all flex flex-col justify-center min-w-[95px] flex-1 ${
                              isActive
                                ? tab.isHighlight 
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                                  : 'bg-green-600 text-white border-green-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xs font-black flex items-center gap-1">
                              {tab.isHighlight && <span className="animate-pulse">⚡</span>}
                              {tab.label}
                            </span>
                            <span className={`text-[9px] font-medium mt-0.5 ${isActive ? 'text-green-100' : 'text-slate-400'}`}>
                              {tab.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="স্ট্যান্ড, রুট, স্থান বা চালকের নাম দিয়ে খুঁজুন... (যেমন: বানেশ্বর, পুঠিয়া, রফিকুল)"
                      value={cngSearchQuery || ""}
                      onChange={(e) => setCngSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 shadow-sm transition-all"
                    />
                    {cngSearchQuery && (
                      <button 
                        onClick={() => setCngSearchQuery('')}
                        className="absolute right-4 top-2.5 text-xs font-black text-slate-400 hover:text-slate-600"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>

                  {/* 1. Stand Locations Section */}
                  {showStands && filteredStands.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600" /> স্ট্যান্ড লোকেশন ও ম্যাপ (CNG Stand Locations)
                        </h4>
                        <span className="text-[10px] bg-green-50 text-green-700 border border-green-100 font-bold px-2 py-0.5 rounded-full">
                          {filteredStands.length} টি স্ট্যান্ড
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredStands.map((stand) => (
                          <div key={stand.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3 hover:border-green-300 hover:shadow-sm transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-black text-slate-800 text-sm">{stand.name}</h5>
                                {stand.is24h ? (
                                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                                    ⚡ ২৪ ঘণ্টা
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                                    দিনকালীন
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600 flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>{stand.location}</span>
                              </p>

                              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-700">সময়সূচী: {stand.hours}</span>
                              </p>

                              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                                <p className="font-bold text-slate-700">প্রধান রুট:</p>
                                <p className="text-slate-600">{stand.routes}</p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div className="text-[11px]">
                                <span className="text-slate-400 font-bold block text-[9px]">যোগাযোগ:</span>
                                <span className="font-black text-slate-800">{stand.contactPerson}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${stand.contactPhone}`}
                                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                                >
                                  <Phone className="w-3 h-3 text-green-700" /> কল
                                </a>

                                <a
                                  href={stand.mapUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                                >
                                  <ExternalLink className="w-3 h-3" /> ম্যাপে দেখুন
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Estimated Fares Chart Section */}
                  {showFares && filteredFares.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" /> রুট ও আনুমানিক ভাড়া তালিকা (Estimated Route Fares)
                        </h4>
                        <span className="text-[10px] bg-green-50 text-green-700 border border-green-100 font-bold px-2 py-0.5 rounded-full">
                          {filteredFares.length} টি রুট
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {filteredFares.map((item) => (
                          <div key={item.id} className="p-3.5 bg-white rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-green-200 transition-all">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-black text-slate-800 text-sm">{item.route}</h5>
                                {item.is24h && (
                                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                                    ২৪h
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>দূরত্ব: <strong className="text-slate-700">{item.distance}</strong></span>
                                <span>•</span>
                                <span>আনুমানিক সময়: <strong className="text-slate-700">{item.time}</strong></span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-center min-w-[85px]">
                                <p className="text-[9px] text-slate-400 font-black uppercase">শেয়ার ভাড়া</p>
                                <p className="text-xs font-black text-green-700">{item.shared}</p>
                              </div>

                              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-center min-w-[95px]">
                                <p className="text-[9px] text-slate-400 font-black uppercase">রিজার্ভ ভাড়া</p>
                                <p className="text-xs font-black text-indigo-700">{item.reserve}</p>
                              </div>

                              <a
                                href={item.mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                                title="রুট ম্যাপে দেখুন"
                              >
                                <Navigation className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Driver Directory & Phone Numbers Section */}
                  {showDrivers && filteredDrivers.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-600" /> চালকের ফোন নম্বর ও ২৪ ঘণ্টা সেবা (Driver Directory)
                        </h4>
                        <span className="text-[10px] bg-green-50 text-green-700 border border-green-100 font-bold px-2 py-0.5 rounded-full">
                          {filteredDrivers.length} জন চালক
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredDrivers.map((driver) => (
                          <div key={driver.id} className="p-3.5 bg-white rounded-2xl border border-slate-100 space-y-2.5 hover:border-green-200 transition-all flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h5 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-slate-500" />
                                    {driver.name}
                                  </h5>
                                  <p className="text-[10px] text-slate-500 font-semibold">{driver.role}</p>
                                </div>
                                {driver.is24h ? (
                                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                                    ⚡ ২৪ ঘণ্টা নাইট সার্ভিস
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                                    দিনের শিফট
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <span className="font-bold text-slate-700">স্ট্যান্ড:</span> {driver.stand} | <span className="font-bold text-slate-700">যানবাহন:</span> {driver.vehicle}
                              </p>

                              <p className="text-[11px] text-slate-500 italic">
                                "{driver.note}"
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <span className="font-mono font-black text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {driver.phone}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleCopy(driver.phone, `${driver.name} এর ফোন নম্বর`)}
                                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                                  title="কপি করুন"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                <a
                                  href={`tel:${driver.phone}`}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                                >
                                  <Phone className="w-3.5 h-3.5 fill-white" /> ফোন করুন
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty Search Result */}
                  {filteredStands.length === 0 && filteredFares.length === 0 && filteredDrivers.length === 0 && (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <Info className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">কোনো তথ্য পাওয়া যায়নি</p>
                      <button 
                        onClick={() => { setCngSearchQuery(''); setCngTabFilter('all'); }} 
                        className="text-[10px] font-black text-green-700 hover:underline"
                      >
                        সব তথ্য পুনরায় দেখুন
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 4. ইজিবাইক */}
            {selectedSubmenu === 'easy_bike' && (() => {
              const easyBikeRoutesData = [
                {
                  id: 'eb-route-1',
                  route: 'পুঠিয়া বাসস্ট্যান্ড ➔ রাজবাড়ি ও মন্দির কমপ্লেক্স',
                  distance: '১.৫ কিমি',
                  time: '৫-৭ মিনিট',
                  frequency: 'প্রতি ২ মিনিটে ১টি গাড়ি',
                  sharedFare: '১০ টাকা',
                  reserveFare: '৪০ টাকা',
                  desc: 'পুঠিয়া মেইন বাইপাস থেকে বিখ্যাত রাজবাড়ি, গোবিন্দ মন্দির ও শিব মন্দির ভ্রমণ রুট।',
                  popular: true
                },
                {
                  id: 'eb-route-2',
                  route: 'পুঠিয়া বাসস্ট্যান্ড ➔ ঝলমলিয়া বাজার ও স্বাস্থ্য কমপ্লেক্স',
                  distance: '৩.০ কিমি',
                  time: '৮-১০ মিনিট',
                  frequency: 'প্রতি ৩ মিনিটে ১টি গাড়ি',
                  sharedFare: '১৫ টাকা',
                  reserveFare: '৬০ টাকা',
                  desc: 'উপজেলা স্বাস্থ্য কমপ্লেক্সে রোগী ও সাধারণ যাত্রীদের যাতায়াতের প্রধান ইজিবাইক রুট।',
                  popular: true
                },
                {
                  id: 'eb-route-3',
                  route: 'পুঠিয়া বাসস্ট্যান্ড ➔ ভালুকগাছি ইউনিয়ন পরিষদ',
                  distance: '৪.৫ কিমি',
                  time: '১২-১৫ মিনিট',
                  frequency: 'প্রতি ৫ মিনিটে ১টি গাড়ি',
                  sharedFare: '২০ টাকা',
                  reserveFare: '৯০ টাকা',
                  desc: 'ভালুকগাছি ইউনিয়ন পরিষদ, হাইস্কুল ও স্থানীয় বাজার সংলগ্ন যোগাযোগ রুট।'
                },
                {
                  id: 'eb-route-4',
                  route: 'পুঠিয়া বাসস্ট্যান্ড ➔ জিউপাড়া বাজার ও হাটখোলা',
                  distance: '৬.০ কিমি',
                  time: '১৮-২০ মিনিট',
                  frequency: 'প্রতি ৫-৭ মিনিটে ১টি গাড়ি',
                  sharedFare: '২৫ টাকা',
                  reserveFare: '১২০ টাকা',
                  desc: 'জিউপাড়া ইউনিয়নের প্রধান হাট ও শিক্ষা প্রতিষ্ঠান সংযোগকারী অটো রুট।'
                },
                {
                  id: 'eb-route-5',
                  route: 'পুঠিয়া রাজবাড়ি ➔ গণ্ডগোহালী বাজার',
                  distance: '৩.৫ কিমি',
                  time: '১০-১২ মিনিট',
                  frequency: 'প্রতি ৫ মিনিটে ১টি গাড়ি',
                  sharedFare: '১৫ টাকা',
                  reserveFare: '৭০ টাকা',
                  desc: 'পৌরসভার অভ্যান্তরীন সংযোগ সড়ক ও আবাসিক এলাকা রুট।'
                },
                {
                  id: 'eb-route-6',
                  route: 'পুঠিয়া বাজার ➔ পীরগাছা মোড় ও ধোপাপাড়া',
                  distance: '৫.০ কিমি',
                  time: '১৫-১৮ মিনিট',
                  frequency: 'প্রতি ৭ মিনিটে ১টি গাড়ি',
                  sharedFare: '২০ টাকা',
                  reserveFare: '১০০ টাকা',
                  desc: 'ধোপাপাড়া ও পীরগাছা এলাকার জন্য গ্রামীণ ইজিবাইক নেটওয়ার্ক।'
                }
              ];

              const easyBikeStandsData = [
                {
                  id: 'eb-stand-1',
                  name: 'পুঠিয়া প্রধান বাসস্ট্যান্ড ইজিবাইক মোড়',
                  location: 'ঢাকা-রাজশাহী হাইওয়ে মোড়, পুরাতন ফ্লাইওভার ইস্টার, পুঠিয়া',
                  lineMaster: 'সোলেমান মিয়া (লাইন মাস্টার)',
                  phone: '01718294012',
                  capacity: '৫০+ ইজিবাইক স্ট্যান্ডিং ক্যাপাসিটি',
                  operatingHours: 'সকাল ০৫:৩০ AM - রাত ১০:৩০ PM',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Puthia+Bus+Stand'
                },
                {
                  id: 'eb-stand-2',
                  name: 'রাজবাড়ি শিব মন্দির ফটক টমটম স্ট্যান্ড',
                  location: 'বড় শিব মন্দির ও শ্যামসাগর দীঘি ফটক সংলগ্ন, পুঠিয়া',
                  lineMaster: 'আনোয়ার হোসেন',
                  phone: '01732910482',
                  capacity: '৩০+ পর্যটক ইজিবাইক ইস্টার',
                  operatingHours: 'সকাল ০৬:০০ AM - সন্ধ্যা ০৮:০০ PM',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Puthia+Rajbari'
                },
                {
                  id: 'eb-stand-3',
                  name: 'ঝলমলিয়া হাসপাতাল মোড় অটো স্ট্যান্ড',
                  location: 'উপজেলা স্বাস্থ্য কমপ্লেক্স প্রধান ফটক ও হাট মোড়',
                  lineMaster: 'ফারুক আহমেদ',
                  phone: '01812940192',
                  capacity: '২৫+ অটো ইজিবাইক',
                  operatingHours: '২৪ ঘণ্টা (হাসপাতাল জরুরি নাইট ট্রিপ)',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Puthia+Upazila+Health+Complex'
                },
                {
                  id: 'eb-stand-4',
                  name: 'ভালুকগাছি ইউনিয়ন বাজার স্ট্যান্ড',
                  location: 'ভালুকগাছি বাজার তিনরাস্তা মোড়',
                  lineMaster: 'মতিউর রহমান',
                  phone: '01912839102',
                  capacity: '২০+ ইজিবাইক',
                  operatingHours: 'সকাল ০৬:০০ AM - রাত ০৯:৩০ PM',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Valukgachi+Puthia'
                }
              ];

              const easyBikeSchedules = [
                {
                  period: 'পিক আওয়ার (সকাল ০৮:০০ - ১১:০০ ও দুপুর ০২:০০ - সন্ধ্যা ০৭:০০)',
                  frequency: 'প্রতি ১-৩ মিনিটে ১টি গাড়ি',
                  status: 'সর্বোচ্চ ফ্রিকোয়েন্সি (স্কুল, অফিস ও বাজার সময়)',
                  badgeColor: 'bg-green-100 text-green-800 border-green-200'
                },
                {
                  period: 'সাধারণ আওয়ার (সকাল ০৬:০০ - ০৮:০০ ও বেলা ১১:০০ - ০২:০০)',
                  frequency: 'প্রতি ৪-৬ মিনিটে ১টি গাড়ি',
                  status: 'স্বাভাবিক যাত্রী আনাগোনা',
                  badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
                },
                {
                  period: 'সন্ধ্যার পর (সন্ধ্যা ০৭:০০ - রাত ১০:৩০ PM)',
                  frequency: 'প্রতি ৭-১০ মিনিটে ১টি গাড়ি',
                  status: 'যাত্রী স্বল্পতায় কিছুটা বিরতি',
                  badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
                },
                {
                  period: 'নাইট সার্ভিস (রাত ১০:৩০ PM - সকাল ০৫:৩০ AM)',
                  frequency: 'অন-কল নাইট রিজার্ভ (জরুরি হাসপাতাল/যাত্রী)',
                  status: 'শুধু রিজার্ভ ট্রিপ (হাসপাতাল ও বাসস্ট্যান্ড থেকে)',
                  badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
                }
              ];

              // Filtering
              const queryStr = easyBikeSearchQuery.toLowerCase();

              const filteredRoutes = easyBikeRoutesData.filter(r => {
                if (!queryStr) return true;
                return r.route.toLowerCase().includes(queryStr) || r.desc.toLowerCase().includes(queryStr);
              });

              const filteredStands = easyBikeStandsData.filter(s => {
                if (!queryStr) return true;
                return s.name.toLowerCase().includes(queryStr) || s.location.toLowerCase().includes(queryStr) || s.lineMaster.toLowerCase().includes(queryStr);
              });

              const showRoutes = easyBikeTabFilter === 'all' || easyBikeTabFilter === 'routes';
              const showFares = easyBikeTabFilter === 'all' || easyBikeTabFilter === 'fares';
              const showStands = easyBikeTabFilter === 'all' || easyBikeTabFilter === 'stands';
              const showSchedule = easyBikeTabFilter === 'all' || easyBikeTabFilter === 'schedule';

              return (
                <div className="space-y-5">
                  {/* Title Header */}
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <span className="p-2.5 rounded-xl bg-amber-100 text-amber-700 font-bold text-lg">🛺</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">পৌরসভা ও লোকাল ইজিবাইক (Easy Bike) সেবা</h3>
                      <p className="text-xs text-slate-500">পুঠিয়া পৌরসভা ও স্থানীয় সকল রুটের ইজিবাইক/টমটম রুট, পৌরসভা নির্ধারিত ভাড়া, স্ট্যান্ড ও সময়সূচী</p>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-slate-500 flex items-center gap-1">
                      <Search className="w-3 h-3 text-amber-600" /> তথ্য দেখতে ক্যাটাগরি বেছে নিন:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'সব তথ্য', desc: 'সকল ক্যাটাগরি' },
                        { id: 'routes', label: 'রুট (Routes)', desc: 'প্রধান যাতায়াত রুট' },
                        { id: 'fares', label: 'ভাড়া (Fares)', desc: 'শেয়ার ও রিজার্ভ ভাড়া' },
                        { id: 'stands', label: 'স্ট্যান্ড (Stands)', desc: 'অবস্থান ও লাইন মাস্টার' },
                        { id: 'schedule', label: 'সময়সূচী (Schedule)', desc: 'সার্ভিস আওয়ার ও নাইট ট্রিপ' }
                      ].map((tab) => {
                        const isActive = easyBikeTabFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setEasyBikeTabFilter(tab.id as any)}
                            className={`px-3 py-2 rounded-xl text-left border transition-all flex flex-col justify-center min-w-[95px] flex-1 ${
                              isActive
                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xs font-black flex items-center gap-1">
                              {tab.label}
                            </span>
                            <span className={`text-[9px] font-medium mt-0.5 ${isActive ? 'text-amber-100' : 'text-slate-400'}`}>
                              {tab.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="রুট, স্ট্যান্ড, রাজবাড়ি, ভালুকগাছি বা জায়গা লিখে খুঁজুন..."
                      value={easyBikeSearchQuery || ""}
                      onChange={(e) => setEasyBikeSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm transition-all"
                    />
                    {easyBikeSearchQuery && (
                      <button 
                        onClick={() => setEasyBikeSearchQuery('')}
                        className="absolute right-4 top-2.5 text-xs font-black text-slate-400 hover:text-slate-600"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>

                  {/* 1. Routes (রুট) Section */}
                  {showRoutes && filteredRoutes.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-amber-600" /> প্রধান ইজিবাইক রুট (Main Routes)
                        </h4>
                        <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                          {filteredRoutes.length} টি রুট
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredRoutes.map((r) => (
                          <div key={r.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2.5 hover:border-amber-200 hover:shadow-sm transition-all">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-black text-slate-800 text-sm">{r.route}</h5>
                              {r.popular && (
                                <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shrink-0">
                                  🔥 জনপ্রিয়
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600">{r.desc}</p>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span>দূরত্ব: <strong className="text-slate-700">{r.distance}</strong></span>
                              <span>•</span>
                              <span>সময়: <strong className="text-slate-700">{r.time}</strong></span>
                              <span>•</span>
                              <span className="text-amber-700 font-bold">{r.frequency}</span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-slate-400 font-bold">পৌর ভাড়া:</span>
                              <div className="flex items-center gap-2">
                                <span className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-black text-amber-800">
                                  লোকাল: {r.sharedFare}
                                </span>
                                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-black text-slate-700">
                                  রিজার্ভ: {r.reserveFare}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Fares (ভাড়া) Table Section */}
                  {showFares && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-amber-600" /> পৌরসভা নির্ধারিত ইজিবাইক ভাড়া তালিকা (Fare Chart)
                        </h4>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-[11px] font-black text-slate-600 border-b border-slate-100">
                              <th className="p-3">গন্তব্য রুট</th>
                              <th className="p-3 text-center">আনুমানিক দূরত্ব</th>
                              <th className="p-3 text-center">লোকাল (শেয়ার)</th>
                              <th className="p-3 text-center">রিজার্ভ ভাড়া</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredRoutes.map((r) => (
                              <tr key={`fare-${r.id}`} className="hover:bg-amber-50/30 transition-colors">
                                <td className="p-3 font-bold text-slate-800">{r.route}</td>
                                <td className="p-3 text-center text-slate-500">{r.distance}</td>
                                <td className="p-3 text-center font-black text-amber-700">{r.sharedFare}</td>
                                <td className="p-3 text-center font-black text-indigo-700">{r.reserveFare}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-900 space-y-1">
                        <p className="font-black flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-amber-700" /> ভাড়া সংক্রান্ত বিশেষ নির্দেশিকা:
                        </p>
                        <p className="text-amber-800">
                          • রাত ১০:০০ টার পর যেকোনো রিজার্ভ ট্রিপে ক্ষেত্রবিশেষে ১০-২০ টাকা অতিরিক্ত ভাড়া প্রযোজ্য হতে পারে।<br/>
                          • ভারী মালামাল বহনের ক্ষেত্রে চালকের সাথে আলোচনা করে ভাড়া নির্ধারণ করুন।
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3. Stands (স্ট্যান্ড) Section */}
                  {showStands && filteredStands.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-600" /> প্রধান ইজিবাইক স্ট্যান্ড ও ইস্টার (Easy Bike Stands)
                        </h4>
                        <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                          {filteredStands.length} টি স্ট্যান্ড
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredStands.map((stand) => (
                          <div key={stand.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3 hover:border-amber-200 transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                              <h5 className="font-black text-slate-800 text-sm">{stand.name}</h5>

                              <p className="text-xs text-slate-600 flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{stand.location}</span>
                              </p>

                              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <div>
                                  <span className="text-slate-400 font-bold block text-[9px]">স্ট্যান্ড ক্যাপাসিটি:</span>
                                  <span className="font-bold text-slate-700">{stand.capacity}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-bold block text-[9px]">সার্ভিস সময়:</span>
                                  <span className="font-bold text-slate-700">{stand.operatingHours}</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div className="text-[11px]">
                                <span className="text-slate-400 font-bold block text-[9px]">দায়িত্বপ্রাপ্ত প্রতিনিধি:</span>
                                <span className="font-black text-slate-800">{stand.lineMaster}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${stand.phone}`}
                                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                                >
                                  <Phone className="w-3 h-3 text-amber-700" /> কল
                                </a>

                                <a
                                  href={stand.mapUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                                >
                                  <ExternalLink className="w-3 h-3" /> ম্যাপে দেখুন
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Schedule (সময়সূচী) Section */}
                  {showSchedule && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600" /> সময়সূচী ও ট্রিপ ফ্রিকোয়েন্সি (Service Schedule)
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {easyBikeSchedules.map((sch, idx) => (
                          <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2 hover:border-amber-200 transition-all">
                            <span className={`text-[10px] font-black border px-2.5 py-0.5 rounded-full inline-block ${sch.badgeColor}`}>
                              {sch.frequency}
                            </span>
                            <h5 className="font-black text-slate-800 text-sm">{sch.period}</h5>
                            <p className="text-xs text-slate-600">{sch.status}</p>
                          </div>
                        ))}
                      </div>

                      {/* Municipal Guidelines Card */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <h5 className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" /> পুঠিয়া পৌরসভা ইজিবাইক চলাচলের নিয়মাবলী:
                        </h5>
                        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                          <li>পৌরসভা কতৃক নিবন্ধিত নির্দিষ্ট কিউআর (QR) বারকোডযুক্ত ইজিবাইক চলাচল করতে পারবে।</li>
                          <li>হাইওয়ে মূল সড়কে দ্রুতগতির বাসের সাথে প্রতিযোগিতা করা আইনত দণ্ডনীয়।</li>
                          <li>অতিরিক্ত যাত্রী বহন রোধে চালক ও যাত্রী উভয়কেই সচেতন থাকার অনুরোধ করা হচ্ছে।</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Empty Search Result */}
                  {filteredRoutes.length === 0 && filteredStands.length === 0 && (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <Info className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">কোনো তথ্য পাওয়া যায়নি</p>
                      <button 
                        onClick={() => { setEasyBikeSearchQuery(''); setEasyBikeTabFilter('all'); }} 
                        className="text-[10px] font-black text-amber-700 hover:underline"
                      >
                        সব তথ্য পুনরায় দেখুন
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 5. লোকাল পরিবহন */}
            {selectedSubmenu === 'local_transport' && (() => {
              const vehicleTypesOverview = [
                {
                  id: 'van',
                  title: 'চার্জার ও মোটরাইজড ভ্যান',
                  icon: '🛺',
                  badge: 'পরিবেশবান্ধব ও লোকাল',
                  capacity: '৪-৬ জন যাত্রী / হালকা ব্যাগ',
                  typicalUse: 'উপজেলার গ্রাম, অলিগলি, অভ্যন্তরীণ বাজার ও শর্ট ডিসটেন্স যাতায়াত',
                  color: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800'
                },
                {
                  id: 'nosimon',
                  title: 'নসিমন (শ্যালো ইঞ্জিন)',
                  icon: '🚜',
                  badge: 'কৃষি পণ্য ও হাটের বাহন',
                  capacity: '৮-১২ জন যাত্রী / ভারী শস্য বস্তা',
                  typicalUse: 'পুঠিয়া, বানেশ্বর ও ঝলমলিয়া হাটে আম, ধান, গম, সবজি ও যাত্রী পরিবহন',
                  color: 'from-amber-50 to-orange-50 border-amber-200 text-amber-800'
                },
                {
                  id: 'korimon',
                  title: 'করিমন ও ভটভটি',
                  icon: '🚚',
                  badge: 'মালবাহী ও লোকাল কার্গো',
                  capacity: 'ভারী পণ্য / ১০-১৫ বস্তা মালামাল',
                  typicalUse: 'হাটের দিন পাইকারি মালামাল, নির্মাণ সামগ্রী ও দূরবর্তী বাজার পরিবহন',
                  color: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
                },
                {
                  id: 'leguna',
                  title: 'লেগুনা ও হিউম্যান হলার',
                  icon: '🚐',
                  badge: 'উপজেলা ও আন্তঃজেলা সংযোগ',
                  capacity: '১২-১৪ জন যাত্রী',
                  typicalUse: 'বানেশ্বর ➔ চারঘাট, বাঘা, নাটোর ও রাজশাহী সংযোগ রুট',
                  color: 'from-teal-50 to-cyan-50 border-teal-200 text-teal-800'
                },
                {
                  id: 'minibus',
                  title: 'মিনিবাস ও লোকাল বাস',
                  icon: '🚌',
                  badge: 'মহাসড়ক লোকাল প্যাসেঞ্জার',
                  capacity: '৩০-৪০ জন যাত্রী',
                  typicalUse: 'ঢাকা-রাজশাহী মহাসড়কে পুঠিয়া ➔ বানেশ্বর ➔ রাজশাহী শহর ও নাটোর সার্ভিস',
                  color: 'from-purple-50 to-fuchsia-50 border-purple-200 text-purple-800'
                }
              ];

              const localRoutesList = [
                // Van routes
                {
                  id: 'lr-1',
                  category: 'van',
                  categoryName: 'অটোভ্যান / চার্জার ভ্যান',
                  route: 'পুঠিয়া বাসস্ট্যান্ড ➔ ঝলমলিয়া বাজার ➔ শিবপুর বাজার',
                  distance: '৬.০ কিমি',
                  time: '১৫ মিনিট',
                  frequency: 'প্রতি ২ মিনিটে ১টি',
                  fareShared: '১৫ টাকা',
                  fareCargo: '১০ টাকা/বস্তা',
                  fareReserve: '১২০ টাকা',
                  operatingHours: 'সকাল ০৫:৩০ AM - রাত ১০:৩০ PM',
                  stand: 'পুঠিয়া বাসস্ট্যান্ড ফ্লাইওভার মোড় ভ্যান স্ট্যান্ড',
                  popular: true
                },
                {
                  id: 'lr-2',
                  category: 'van',
                  categoryName: 'অটোভ্যান / চার্জার ভ্যান',
                  route: 'পুঠিয়া রাজবাড়ি ➔ জিউপাড়া ইউনিয়ন পরিষদ ও হাট',
                  distance: '৪.৫ কিমি',
                  time: '১২ মিনিট',
                  frequency: 'প্রতি ৩ মিনিটে ১টি',
                  fareShared: '১৫ টাকা',
                  fareCargo: '১০ টাকা/বস্তা',
                  fareReserve: '১০০ টাকা',
                  operatingHours: 'সকাল ০৬:০০ AM - রাত ১০:০০ PM',
                  stand: 'শিব মন্দির ফটক ও রাজবাড়ি মোড়',
                  popular: true
                },
                {
                  id: 'lr-3',
                  category: 'van',
                  categoryName: 'অটোভ্যান / চার্জার ভ্যান',
                  route: 'বানেশ্বর বাজার ➔ বেলপুকুর রেলগেট ও মোড়',
                  distance: '৫.০ কিমি',
                  time: '১৫ মিনিট',
                  frequency: 'প্রতি ৩ মিনিটে ১টি',
                  fareShared: '২০ টাকা',
                  fareCargo: '১৫ টাকা/বস্তা',
                  fareReserve: '১২০ টাকা',
                  operatingHours: 'সকাল ০৬:০০ AM - রাত ১০:০০ PM',
                  stand: 'বানেশ্বর ট্রাফিক মোড় দক্ষিণ ভ্যান স্ট্যান্ড'
                },
                {
                  id: 'lr-4',
                  category: 'van',
                  categoryName: 'অটোভ্যান / চার্জার ভ্যান',
                  route: 'ঝলমলিয়া স্বাস্থ্য কমপ্লেক্স ➔ পীরগাছা ধোপাপাড়া',
                  distance: '৩.৫ কিমি',
                  time: '১০ মিনিট',
                  frequency: 'প্রতি ৫ মিনিটে ১টি',
                  fareShared: '১০ টাকা',
                  fareCargo: '৫ টাকা/বস্তা',
                  fareReserve: '৮০ টাকা',
                  operatingHours: 'সকাল ০৬:০০ AM - রাত ০৯:৩০ PM',
                  stand: 'ঝলমলিয়া হাসপাতাল গেট মোড়'
                },

                // Nosimon routes
                {
                  id: 'lr-5',
                  category: 'nosimon',
                  categoryName: 'নসিমন (শ্যালো ইঞ্জিন)',
                  route: 'পুঠিয়া হাটখোলা ➔ তাহেরপুর কাঁচাবাজার',
                  distance: '১২.০ কিমি',
                  time: '২৫ মিনিট',
                  frequency: 'প্রতি ১০ মিনিটে ১টি',
                  fareShared: '২৫ টাকা',
                  fareCargo: '১৫-২০ টাকা/বস্তা',
                  fareReserve: '২৫০ টাকা',
                  operatingHours: 'সকাল ০৬:০০ AM - রাত ০৮:৩০ PM',
                  stand: 'পুঠিয়া তাহেরপুর রোড বাইপাস মোড়',
                  popular: true
                },
                {
                  id: 'lr-6',
                  category: 'nosimon',
                  categoryName: 'নসিমন (শ্যালো ইঞ্জিন)',
                  route: 'বানেশ্বর হাট ➔ চারঘাট বাজার ➔ বাঘা',
                  distance: '১৪.০ কিমি',
                  time: '৩০ মিনিট',
                  frequency: 'প্রতি ১০ মিনিটে ১টি',
                  fareShared: '৩০ টাকা',
                  fareCargo: '২০ টাকা/বস্তা',
                  fareReserve: '৩০০ টাকা',
                  operatingHours: 'সকাল ০৬:০০ AM - রাত ০৯:০০ PM',
                  stand: 'বানেশ্বর ট্রাফিক মোড় চারঘাট রোড'
                },
                {
                  id: 'lr-7',
                  category: 'nosimon',
                  categoryName: 'নসিমন (শ্যালো ইঞ্জিন)',
                  route: 'ঝলমলিয়া বাজার ➔ নাটোর বাইপাস ও কাঁচাবাজার',
                  distance: '১৬.০ কিমি',
                  time: '৩৫ মিনিট',
                  frequency: 'প্রতি ১৫ মিনিটে ১টি',
                  fareShared: '৩৫ টাকা',
                  fareCargo: '২৫ টাকা/বস্তা',
                  fareReserve: '৩৫০ টাকা',
                  operatingHours: 'সকাল ০৫:৩০ AM - রাত ০৯:০০ PM',
                  stand: 'ঝলমলিয়া হাটখোলা মোড়'
                },

                // Korimon routes
                {
                  id: 'lr-8',
                  category: 'korimon',
                  categoryName: 'করিমন ও ভটভটি (কার্গো)',
                  route: 'শিবপুর বাজার ➔ পুঠিয়া রাজবাড়ি ধানের আড়ত',
                  distance: '৬.৫ কিমি',
                  time: '১৫ মিনিট',
                  frequency: 'প্রতি ৫ মিনিটে ১টি',
                  fareShared: '১৫ টাকা',
                  fareCargo: '১০ টাকা/বস্তা',
                  fareReserve: '১৫০ টাকা',
                  operatingHours: 'সকাল ০৬:০০ AM - রাত ০৯:০০ PM',
                  stand: 'শিবপুর বাজার হাটখোলা মোড়'
                },
                {
                  id: 'lr-9',
                  category: 'korimon',
                  categoryName: 'করিমন ও ভটভটি (কার্গো)',
                  route: 'বানেশ্বর আমবাজার ➔ বেলপুকুর ও কাটাখালী কাঁচাবাজার',
                  distance: '১০.০ কিমি',
                  time: '২০ মিনিট',
                  frequency: 'প্রতি ৮ মিনিটে ১টি',
                  fareShared: '২০ টাকা',
                  fareCargo: '১৫ টাকা/বস্তা',
                  fareReserve: '২০০ টাকা',
                  operatingHours: '২৪ ঘণ্টা (আমের মৌসুমে সার্বক্ষণিক)',
                  stand: 'বানেশ্বর ফল ও আম আড়ত মোড়',
                  popular: true
                },

                // Leguna routes
                {
                  id: 'lr-10',
                  category: 'leguna',
                  categoryName: 'লেগুনা / হিউম্যান হলার',
                  route: 'বানেশ্বর বাজার ➔ চারঘাট ট্রাফিক মোড়',
                  distance: '১০.০ কিমি',
                  time: '১৮ মিনিট',
                  frequency: 'প্রতি ৭ মিনিটে ১টি',
                  fareShared: '২৫ টাকা',
                  fareCargo: '২০ টাকা/বস্তা',
                  fareReserve: '২৫০ টাকা',
                  operatingHours: 'সকাল ০৬:০০ AM - রাত ১০:০০ PM',
                  stand: 'বানেশ্বর ট্রাফিক মোড় লেগুনা স্ট্যান্ড',
                  popular: true
                },
                {
                  id: 'lr-11',
                  category: 'leguna',
                  categoryName: 'লেগুনা / হিউম্যান হলার',
                  route: 'পুঠিয়া বাসস্ট্যান্ড ➔ নাটোর সদর ও বাসস্ট্যান্ড',
                  distance: '১৭.০ কিমি',
                  time: '৩০ মিনিট',
                  frequency: 'প্রতি ১০ মিনিটে ১টি',
                  fareShared: '৪০ টাকা',
                  fareCargo: '২৫ টাকা/বস্তা',
                  fareReserve: '৩৫০ টাকা',
                  operatingHours: 'সকাল ০৬:০০ AM - রাত ১০:০০ PM',
                  stand: 'পুঠিয়া ওভারব্রিজ সংলগ্ন লেগুনা স্ট্যান্ড',
                  popular: true
                },
                {
                  id: 'lr-12',
                  category: 'leguna',
                  categoryName: 'লেগুনা / হিউম্যান হলার',
                  route: 'বানেশ্বর বাজার ➔ রাজশাহী ভদ্রা মোড় / বিশ্ববিদ্যালয়',
                  distance: '১৮.০ কিমি',
                  time: '৩৫ মিনিট',
                  frequency: 'প্রতি ৫ মিনিটে ১টি',
                  fareShared: '৪৫ টাকা',
                  fareCargo: '৩০ টাকা/বস্তা',
                  fareReserve: '৪০০ টাকা',
                  operatingHours: 'সকাল ০৫:৩০ AM - রাত ১০:৩০ PM',
                  stand: 'বানেশ্বর ফ্লাইওভার পশ্চিম মোড়',
                  popular: true
                },
                {
                  id: 'lr-13',
                  category: 'leguna',
                  categoryName: 'লেগুনা / হিউম্যান হলার',
                  route: 'পুঠিয়া বাইপাস ➔ বাঘা সদর ও মাজার মোড়',
                  distance: '২২.০ কিমি',
                  time: '৪৫ মিনিট',
                  frequency: 'প্রতি ১৫ মিনিটে ১টি',
                  fareShared: '৫০ টাকা',
                  fareCargo: '৩০ টাকা/বস্তা',
                  fareReserve: '৪৫০ টাকা',
                  operatingHours: 'সকাল ০৬:৩০ AM - রাত ০৯:০০ PM',
                  stand: 'পুঠিয়া নতুন বাইপাস মোড়'
                },

                // Minibus routes
                {
                  id: 'lr-14',
                  category: 'minibus',
                  categoryName: 'মিনিবাস ও লোকাল বাস',
                  route: 'বানেশ্বর বাজার ➔ কাটাখালী ➔ রাজশাহী শিরোইল টার্মিনাল',
                  distance: '২০.০ কিমি',
                  time: '৪০ মিনিট',
                  frequency: 'প্রতি ৫ মিনিটে ১টি',
                  fareShared: '৩৫ টাকা',
                  fareCargo: 'নিয়মমাফিক লাগেজ',
                  fareReserve: 'এন/এ',
                  operatingHours: 'সকাল ০৫:০০ AM - রাত ১১:০০ PM',
                  stand: 'বানেশ্বর মহাসড়ক লোকাল বাসস্ট্যান্ড',
                  popular: true
                },
                {
                  id: 'lr-15',
                  category: 'minibus',
                  categoryName: 'মিনিবাস ও লোকাল বাস',
                  route: 'পুঠিয়া বাসস্ট্যান্ড ➔ নাটোর কেন্দ্রীয় বাস টার্মিনাল',
                  distance: '১৮.০ কিমি',
                  time: '৩৫ মিনিট',
                  frequency: 'প্রতি ১০ মিনিটে ১টি',
                  fareShared: '৩০ টাকা',
                  fareCargo: 'নিয়মমাফিক লাগেজ',
                  fareReserve: 'এন/এ',
                  operatingHours: 'সকাল ০৫:৩০ AM - রাত ১০:৩০ PM',
                  stand: 'পুঠিয়া লোকাল বাস কাউন্টার মোড়'
                },
                {
                  id: 'lr-16',
                  category: 'minibus',
                  categoryName: 'মিনিবাস ও লোকাল বাস',
                  route: 'পুঠিয়া বাসস্ট্যান্ড ➔ ঈশ্বরদী / লালপুর মোড়',
                  distance: '৩৫.০ কিমি',
                  time: '১ ঘণ্টা',
                  frequency: 'প্রতি ৩০ মিনিটে ১টি',
                  fareShared: '৭০ টাকা',
                  fareCargo: 'নিয়মমাফিক লাগেজ',
                  fareReserve: 'এন/এ',
                  operatingHours: 'সকাল ০৬:০০ AM - রাত ০৮:৩০ PM',
                  stand: 'পুঠিয়া ঢাকা হাইওয়ে স্ট্যান্ড'
                }
              ];

              const localStandsList = [
                {
                  id: 'ls-1',
                  name: 'বানেশ্বর ট্রাফিক মোড় লেগুনা ও লোকাল পরিবহন টার্মিনাল',
                  location: 'বানেশ্বর ট্রাফিক পুলিশ বক্স ও চারঘাট রোড মোড়',
                  vehicles: 'লেগুনা, নসিমন, মিনিবাস ও লোকাল ভ্যান',
                  contactPerson: 'মোস্তফা কামাল (লাইন মাস্টার)',
                  phone: '01715902148',
                  operatingHours: '২৪ ঘণ্টা চালু',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Baneshwar+Traffic+Box'
                },
                {
                  id: 'ls-2',
                  name: 'পুঠিয়া বাসস্ট্যান্ড নসিমন ও ভ্যান সমিতি টার্মিনাল',
                  location: 'পুরাতন বাসস্ট্যান্ড ও তাহেরপুর বাইপাস রোড মোড়',
                  vehicles: 'অটোভ্যান, নসিমন, করিমন ও লেগুনা',
                  contactPerson: 'জহুরুল ইসলাম (সভাপতি)',
                  phone: '01723810492',
                  operatingHours: 'সকাল ০৫:০০ AM - রাত ১১:০০ PM',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Puthia+Bus+Stand'
                },
                {
                  id: 'ls-3',
                  name: 'ঝলমলিয়া হাটখোলা করিমন ও কৃষি পরিবহন ইস্টার',
                  location: 'ঝলমলিয়া মূল বাজার ও হাটখোলা ময়দান',
                  vehicles: 'করিমন, ভটভটি, নসিমন ও চার্জার ভ্যান',
                  contactPerson: 'আকরাম আলী (ইনচার্জ)',
                  phone: '01819382019',
                  operatingHours: 'সকাল ০৫:৩০ AM - রাত ১০:০০ PM',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Jhalmalia+Market+Puthia'
                },
                {
                  id: 'ls-4',
                  name: 'শিবপুর বাজার লোকাল প্যাসেঞ্জার ও ভ্যান স্ট্যান্ড',
                  location: 'শিবপুর বাজার মডেল হাইস্কুল সংলগ্ন মোড়',
                  vehicles: 'চার্জার ভ্যান, নসিমন ও টেম্পো',
                  contactPerson: 'মিজানুর রহমান',
                  phone: '01912849102',
                  operatingHours: 'সকাল ০৬:০০ AM - রাত ০৯:৩০ PM',
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Shivpur+Bazar+Puthia'
                }
              ];

              // Filtering logic
              const queryStr = localTransportSearch.toLowerCase();

              const filteredRoutes = localRoutesList.filter(item => {
                const matchTab = localTransportFilter === 'all' || localTransportFilter === 'fares' || item.category === localTransportFilter;
                if (!matchTab) return false;
                if (!queryStr) return true;
                return (
                  item.route.toLowerCase().includes(queryStr) ||
                  item.categoryName.toLowerCase().includes(queryStr) ||
                  item.stand.toLowerCase().includes(queryStr)
                );
              });

              const filteredStands = localStandsList.filter(stand => {
                if (!queryStr) return true;
                return (
                  stand.name.toLowerCase().includes(queryStr) ||
                  stand.location.toLowerCase().includes(queryStr) ||
                  stand.vehicles.toLowerCase().includes(queryStr)
                );
              });

              return (
                <div className="space-y-5">
                  {/* Title Header */}
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <span className="p-2.5 rounded-xl bg-teal-100 text-teal-700 font-bold text-lg">🚐</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">পুঠিয়া লোকাল পরিবহন নির্দেশিকা</h3>
                      <p className="text-xs text-slate-500">ভ্যান, নসিমন, করিমন, লেগুনা ও মিনিবাসের স্থানীয় রুট, পৌরসভা ও ইউনিয়ন ভাড়া তালিকা এবং টার্মিনাল তথ্য</p>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-slate-500 flex items-center gap-1">
                      <Search className="w-3 h-3 text-teal-600" /> পরিবহনের ধরন নির্বাচন করুন:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'সব পরিবহন', desc: 'সকল ক্যাটাগরি' },
                        { id: 'van', label: '🛺 ভ্যান', desc: 'চার্জার/মোটরাইজড' },
                        { id: 'nosimon', label: '🚜 নসিমন', desc: 'শ্যালো ইঞ্জিন বাহন' },
                        { id: 'korimon', label: '🚚 করিমন', desc: 'ভটভটি ও কার্গো' },
                        { id: 'leguna', label: '🚐 লেগুনা', desc: 'হিউম্যান হলার' },
                        { id: 'minibus', label: '🚌 মিনিবাস', desc: 'লোকাল বাস সার্ভিস' },
                        { id: 'fares', label: '💰 ভাড়া তালিকা', desc: 'সম্পূর্ণ চার্ট', isHighlight: true }
                      ].map((tab) => {
                        const isActive = localTransportFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setLocalTransportFilter(tab.id as any)}
                            className={`px-3 py-2 rounded-xl text-left border transition-all flex flex-col justify-center min-w-[95px] flex-1 ${
                              isActive
                                ? tab.isHighlight
                                  ? 'bg-teal-800 text-white border-teal-800 shadow-sm'
                                  : 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xs font-black flex items-center gap-1">
                              {tab.label}
                            </span>
                            <span className={`text-[9px] font-medium mt-0.5 ${isActive ? 'text-teal-100' : 'text-slate-400'}`}>
                              {tab.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="রুট, যানবাহন, বাজার বা স্থানের নাম লিখে খুঁজুন... (যেমন: বানেশ্বর, চারঘাট, নসিমন, লেগুনা)"
                      value={localTransportSearch || ""}
                      onChange={(e) => setLocalTransportSearch(e.target.value)}
                      className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm transition-all"
                    />
                    {localTransportSearch && (
                      <button 
                        onClick={() => setLocalTransportSearch('')}
                        className="absolute right-4 top-2.5 text-xs font-black text-slate-400 hover:text-slate-600"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>

                  {/* Vehicle Types Overview Grid (Shows when 'all' is selected and no active query) */}
                  {localTransportFilter === 'all' && !queryStr && (
                    <div className="space-y-3">
                      <h4 className="font-black text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Info className="w-4 h-4 text-teal-600" /> পুঠিয়ার লোকাল যানবাহনের বৈশিষ্ট্য:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {vehicleTypesOverview.map((v) => (
                          <div key={v.id} className={`p-3.5 bg-gradient-to-br ${v.color} rounded-2xl border space-y-2`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xl">{v.icon}</span>
                              <span className="text-[9px] font-black bg-white/80 px-2 py-0.5 rounded-full shadow-xs">
                                {v.badge}
                              </span>
                            </div>
                            <h5 className="font-black text-sm text-slate-900">{v.title}</h5>
                            <p className="text-[11px] font-semibold text-slate-700">ক্যাপাসিটি: {v.capacity}</p>
                            <p className="text-[10px] text-slate-600">{v.typicalUse}</p>
                            <button
                              onClick={() => setLocalTransportFilter(v.id as any)}
                              className="text-[10px] font-black text-teal-700 hover:underline flex items-center gap-1 pt-1"
                            >
                              রুট ও ভাড়া দেখুন ➔
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Routes & Cards Section */}
                  {localTransportFilter !== 'fares' && filteredRoutes.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-teal-600" /> স্থানীয় পরিবহন রুট ও বিবরণ (Local Routes)
                        </h4>
                        <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 font-bold px-2 py-0.5 rounded-full">
                          {filteredRoutes.length} টি রুট
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredRoutes.map((item) => (
                          <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3 hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-black text-slate-800 text-sm">{item.route}</h5>
                                {item.popular && (
                                  <span className="text-[9px] font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full shrink-0">
                                    🔥 জনপ্রিয় রুট
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                  {item.categoryName}
                                </span>
                                <span className="text-[10px] font-bold text-teal-700">
                                  {item.frequency}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>দূরত্ব: <strong className="text-slate-700">{item.distance}</strong></span>
                                <span>•</span>
                                <span>আনুমানিক সময়: <strong className="text-slate-700">{item.time}</strong></span>
                              </p>

                              <p className="text-[11px] text-slate-600 flex items-start gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                <span><strong>স্ট্যান্ড:</strong> {item.stand}</span>
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-100 text-center">
                                  <span className="text-[8px] text-teal-600 font-black block uppercase">যাত্রী ভাড়া</span>
                                  <span className="text-xs font-black text-teal-800">{item.fareShared}</span>
                                </div>
                                <div className="bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 text-center">
                                  <span className="text-[8px] text-slate-400 font-black block uppercase">মালামাল/বস্তা</span>
                                  <span className="text-xs font-black text-slate-700">{item.fareCargo}</span>
                                </div>
                              </div>

                              {item.fareReserve !== 'এন/এ' && (
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-400 font-bold block">রিজার্ভ আনুমানিক:</span>
                                  <span className="text-xs font-black text-indigo-700">{item.fareReserve}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comprehensive Fare Chart Table (Shown when 'fares' or 'all' is selected) */}
                  {(localTransportFilter === 'fares' || localTransportFilter === 'all') && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-teal-600" /> সম্পূর্ণ লোকাল পরিবহন ভাড়া তালিকা (Local Fare Chart)
                        </h4>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-[11px] font-black text-slate-600 border-b border-slate-100">
                              <th className="p-3">যানবাহন ও রুট</th>
                              <th className="p-3 text-center">দূরত্ব</th>
                              <th className="p-3 text-center">যাত্রী ভাড়া</th>
                              <th className="p-3 text-center">মালামাল / পণ্য বস্তা</th>
                              <th className="p-3 text-center">রিজার্ভ আনুমানিক</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredRoutes.map((r) => (
                              <tr key={`fare-table-${r.id}`} className="hover:bg-teal-50/30 transition-colors">
                                <td className="p-3">
                                  <span className="font-bold text-slate-800 block">{r.route}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">{r.categoryName}</span>
                                </td>
                                <td className="p-3 text-center text-slate-500 font-medium">{r.distance}</td>
                                <td className="p-3 text-center font-black text-teal-700">{r.fareShared}</td>
                                <td className="p-3 text-center font-semibold text-slate-600">{r.fareCargo}</td>
                                <td className="p-3 text-center font-black text-indigo-700">{r.fareReserve}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Local Transport Terminals & Line Masters */}
                  {filteredStands.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-teal-600" /> লোকাল পরিবহন টার্মিনাল ও সমিতি কন্টাক্ট
                        </h4>
                        <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 font-bold px-2 py-0.5 rounded-full">
                          {filteredStands.length} টি ইস্টার
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredStands.map((stand) => (
                          <div key={stand.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3 hover:border-teal-200 transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                              <h5 className="font-black text-slate-800 text-sm">{stand.name}</h5>

                              <p className="text-xs text-slate-600 flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                <span>{stand.location}</span>
                              </p>

                              <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <strong>চলমান যানবাহন:</strong> {stand.vehicles}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div className="text-[11px]">
                                <span className="text-slate-400 font-bold block text-[9px]">দায়িত্বপ্রাপ্ত প্রতিনিধি:</span>
                                <span className="font-black text-slate-800">{stand.contactPerson}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleCopy(stand.phone, `${stand.contactPerson} এর ফোন নম্বর`)}
                                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                                  title="কপি করুন"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                <a
                                  href={`tel:${stand.phone}`}
                                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                                >
                                  <Phone className="w-3.5 h-3.5 fill-white" /> ফোন করুন
                                </a>

                                <a
                                  href={stand.mapUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition-all"
                                  title="ম্যাপে দেখুন"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety & Municipal Guidelines Box */}
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                    <h5 className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-700" /> নিরাপদ যাতায়াত ও নিরাপত্তা নির্দেশনা:
                    </h5>
                    <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                      <li>নসিমন ও করিনমে অতিরিক্ত বা ঝুঁকিপূর্ণ যাত্রী বহন করা থেকে বিরত থাকুন।</li>
                      <li>মহাসড়কে চলাচলের সময় নির্ধারিত গতিসীমা মেনে চলতে সকল লোকাল পরিবহন চালকদের নির্দেশ দেওয়া হয়েছে।</li>
                      <li>হাটের দিনে মালামাল বহনের ক্ষেত্রে রাস্তায় চলাচলে পথচারীদের অগ্রাধিকার দিন।</li>
                    </ul>
                  </div>

                  {/* Empty Search Result */}
                  {filteredRoutes.length === 0 && filteredStands.length === 0 && (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <Info className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">কোনো তথ্য পাওয়া যায়নি</p>
                      <button 
                        onClick={() => { setLocalTransportSearch(''); setLocalTransportFilter('all'); }} 
                        className="text-[10px] font-black text-teal-700 hover:underline"
                      >
                        সব তথ্য পুনরায় দেখুন
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 6. রুট ম্যাপ */}
            {selectedSubmenu === 'route_map' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="p-2.5 rounded-xl bg-sky-100 text-sky-700 font-bold">🗺️</span>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">গুরুত্বপূর্ণ রুট ম্যাপ ও দূরত্ব</h3>
                    <p className="text-xs text-slate-500">পুঠিয়ার প্রধান সড়ক নেটওয়ার্ক ও সংযোগ রেখাচিত্র</p>
                  </div>
                </div>

                {/* Schematic visual map */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 font-mono text-xs overflow-x-auto space-y-4">
                  <p className="text-slate-400 font-sans font-bold text-xs">মহাসড়ক সংযোগ রেখাচিত্র (N6 Highway):</p>
                  <div className="flex items-center gap-2 min-w-[500px]">
                    <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-center">
                      <p className="font-black text-[10px] text-sky-300">রাজশাহী</p>
                      <p className="text-[9px]">0 km</p>
                    </div>
                    <div className="flex-1 h-0.5 bg-slate-700 relative flex items-center justify-center">
                      <span className="absolute -top-3 text-[9px] text-slate-400">১৮ কিমি</span>
                    </div>
                    <div className="bg-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-600 text-center">
                      <p className="font-black text-[10px] text-emerald-300">বানেশ্বর</p>
                      <p className="text-[9px]">১৮ কিমি</p>
                    </div>
                    <div className="flex-1 h-0.5 bg-slate-700 relative flex items-center justify-center">
                      <span className="absolute -top-3 text-[9px] text-slate-400">৮ কিমি</span>
                    </div>
                    <div className="bg-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-600 text-center">
                      <p className="font-black text-[10px] text-emerald-300">পুঠিয়া</p>
                      <p className="text-[9px]">২৬ কিমি</p>
                    </div>
                    <div className="flex-1 h-0.5 bg-slate-700 relative flex items-center justify-center">
                      <span className="absolute -top-3 text-[9px] text-slate-400">১৭ কিমি</span>
                    </div>
                    <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-center">
                      <p className="font-black text-[10px] text-sky-300">নাটোর</p>
                      <p className="text-[9px]">৪৩ কিমি</p>
                    </div>
                  </div>

                  <p className="text-slate-400 font-sans font-bold text-xs pt-4">আঞ্চলিক সংযোগ সড়ক:</p>
                  <ul className="space-y-2 font-sans text-xs text-slate-300">
                    <li>🟢 <span className="font-bold text-white">উত্তরমুখী সড়ক:</span> পুঠিয়া বাসস্ট্যান্ড ➔ ভালুকগাছি ➔ তাহেরপুর (১২ কিমি)</li>
                    <li>🔵 <span className="font-bold text-white">দক্ষিণমুখী সড়ক:</span> বানেশ্বর ➔ চারঘাট ➔ বাঘা (২৮ কিমি)</li>
                    <li>🟡 <span className="font-bold text-white">অভ্যন্তরীণ লিংক:</span> পুঠিয়া মোড় ➔ রাজবাড়ি ও মন্দির কমপ্লেক্স (১.২ কিমি)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 7. বাসস্ট্যান্ড */}
            {selectedSubmenu === 'bus_stand' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="p-2.5 rounded-xl bg-orange-100 text-orange-700 font-bold">📍</span>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">উপজেলার প্রধান বাসস্ট্যান্ড</h3>
                    <p className="text-xs text-slate-500">বাসস্ট্যান্ডগুলোর অবস্থান ও স্থানীয় সুবিধা</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'পুঠিয়া বাসস্ট্যান্ড মোড়', location: 'রাজশাহী-নাটোর মহাসড়ক (N6) ও তাহেরপুর রোডের সংযোগস্থল', facilities: 'টিকেট কাউন্টার, হোটেল ও রেস্টুরেন্ট, পাবলিক টয়লেট, রিকশা ও অটোরিকশা স্ট্যান্ড', rating: '★★★★☆' },
                    { name: 'বানেশ্বর বাজার বাসস্ট্যান্ড', location: 'বানেশ্বর বাজার চৌরাস্তা মোড়', facilities: 'বিশাল ফলের আড়ত (আমের বাজার), টিকিট কাউন্টার, মসজিদ, পার্কিং জোন, ডাচ-বাংলা এটিএম বুথ', rating: '★★★★★' },
                    { name: 'শিবপুর বাজার স্ট্যান্ড', location: 'শিবপুর বাজার, ঢাকা-রাজশাহী মহাসড়কের পাশে', facilities: 'লোকাল লেগুনা ও ভ্যান স্ট্যান্ড, বাজার এলাকা, চা-স্টল ও ঔষধের দোকান', rating: '★★★☆☆' }
                  ].map((stand, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-black text-slate-800 text-sm">{stand.name}</h4>
                        <span className="text-xs text-amber-500 font-black">{stand.rating}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">অবস্থান:</span> {stand.location}
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">উপলব্ধ সুবিধা:</span> {stand.facilities}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. রেলওয়ে স্টেশন */}
            {selectedSubmenu === 'railway_station' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="p-2.5 rounded-xl bg-purple-100 text-purple-700 font-bold">🚉</span>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">নিকটবর্তী রেলস্টেশন</h3>
                    <p className="text-xs text-slate-500">পুঠিয়া থেকে সহজে যাতায়াতযোগ্য রেলস্টেশন</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'সড়দহ রোড রেলওয়ে স্টেশন', location: 'চারঘাট (পুঠিয়া সদর থেকে প্রায় ১০ কিমি)', distance: '১০ কিমি', transport: 'সিএনজি অথবা ইজিবাইকে সরাসরি যাওয়া যায় (ভাড়া ৩০-৪০ টাকা)', trains: 'লোকাল এবং মেইল ট্রেন থামে' },
                    { name: 'রাজশাহী রেলওয়ে স্টেশন', location: 'শিরোইল, রাজশাহী শহর', distance: '২৮ কিমি', transport: 'বাস অথবা অটোরিকশায় ভদ্রা হয়ে যাওয়া যায় (ভাড়া ৫০-৮০ টাকা)', trains: 'সকল আন্তঃনগর ট্রেন (বনলতা, সিল্কসিটি, পদ্মা, ধূমকেতু) থামে' }
                  ].map((station, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <h4 className="font-black text-slate-800 text-sm">{station.name}</h4>
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">অবস্থান:</span> {station.location}
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">দূরত্ব:</span> {station.distance}
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">যাতায়াত মাধ্যম:</span> {station.transport}
                      </p>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-100 inline-block">
                        ট্রেন টাইপ: {station.trains}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. বিমান তথ্য */}
            {selectedSubmenu === 'flight_info' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="p-2.5 rounded-xl bg-sky-100 text-sky-700 font-bold">✈️</span>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">শাহ মখদুম বিমানবন্দর ও ফ্লাইটের তথ্য</h3>
                    <p className="text-xs text-slate-500">রাজশাহী বিমানবন্দর থেকে ঢাকার নিয়মিত ফ্লাইটের বিস্তারিত</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-black text-blue-900 text-sm">বিমানবন্দর পরিচিতি</h4>
                  <p className="text-blue-800 leading-relaxed font-medium">
                    শাহ মখদুম বিমানবন্দরটি রাজশাহী শহরের নওহাটা এলাকায় অবস্থিত, যা পুঠিয়া থেকে প্রায় ৩০ কিমি দূরে। বিমানবন্দর থেকে নিয়মিত ঢাকার হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দরে ফ্লাইট পরিচালিত হয়।
                  </p>
                  <p className="text-slate-500 font-bold pt-1">পুঠিয়া থেকে ট্যাক্সি বা প্রাইভেটকার ভাড়া: ১০০০ - ১২০০ টাকা (সিএনজি ৪০০-৫০০ টাকা)।</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-sm">এয়ারলাইন্স ও ফ্লাইট সূচী (রাজশাহী ➔ ঢাকা)</h4>
                  {[
                    { company: 'বিমান বাংলাদেশ এয়ারলাইন্স', flightCode: 'BG-492', time: 'দুপুর ০২:১৫', days: 'প্রতিদিন', fare: '৪,০০০ - ৭,৫০০ টাকা' },
                    { company: 'ইউএস-বাংলা এয়ারলাইন্স', flightCode: 'BS-144', time: 'বিকেল ০৪:৩০', days: 'প্রতিদিন', fare: '৪,৫০০ - ৮,০০০ টাকা' },
                    { company: 'নভোএয়ার (Novoair)', flightCode: 'VQ-922', time: 'সকাল ১১:৪৫', days: 'প্রতিদিন', fare: '৪,৩০০ - ৭,৮০০ টাকা' }
                  ].map((flight, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{flight.company}</h5>
                        <p className="text-[10px] text-slate-500">ফ্লাইট কোড: {flight.flightCode} | দিন: {flight.days}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md font-bold">
                          {flight.time}
                        </span>
                        <p className="text-xs font-black text-slate-700 mt-1">{flight.fare}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. বাইক/রাইড শেয়ার */}
            {selectedSubmenu === 'bike_share' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="p-2.5 rounded-xl bg-lime-100 text-lime-700 font-bold">🚲</span>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">বাইক ও রাইড শেয়ার গাইড</h3>
                    <p className="text-xs text-slate-500">দ্রুত যাতায়াতের জন্য মোটরসাইকেল রাইড সার্ভিস</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    বানেশ্বর মোড় এবং পুঠিয়া বাসস্ট্যান্ডে স্থানীয় নিয়মিত মোটরসাইকেল চালকরা চুক্তিভিত্তিক রাইড প্রদান করে থাকে। রাজশাহী শহরে যাওয়ার জন্য Uber বা Pathao অ্যাপ ব্যবহারের পাশাপাশি স্থানীয় চালকদের সাথে নিচের নম্বরে যোগাযোগ করতে পারেন:
                  </p>

                  {[
                    { rider: 'মো: কালাম (পুঠিয়া স্ট্যান্ড)', location: 'পুঠিয়া বাসস্ট্যান্ড', status: 'সক্রিয়', phone: '০১৭৫২-৯৯৮৮১১' },
                    { rider: 'মো: মিলন (বানেশ্বর মোড়)', location: 'বানেশ্বর বাজার', status: 'সক্রিয়', phone: '০১৭১২-৪৪৫৫৬৬' },
                    { rider: 'মো: রানা (শিবপুর)', location: 'শিবপুর মোড়', status: 'সক্রিয়', phone: '০১৭৮৮-৭৭৬৬৫৫' }
                  ].map((bike, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-slate-800 text-xs sm:text-sm">{bike.rider}</h4>
                        <p className="text-[10px] text-slate-500">{bike.location} • <span className="text-emerald-600 font-bold">{bike.status}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${bike.phone}`} className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                          <Phone className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleCopy(bike.phone, bike.rider)}
                          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 11. পেট্রোল পাম্প */}
            {selectedSubmenu === 'petrol_pump' && (() => {
              const petrolPumps = [
                {
                  id: 'fp-1',
                  name: 'মেসার্স পুঠিয়া ফিলিং স্টেশন',
                  location: 'ঢাকা-রাজশাহী মহাসড়ক, পুঠিয়া ওভারব্রিজ সংলগ্ন, পুঠিয়া সদর',
                  timing: '২৪ ঘণ্টা খোলা (24/7)',
                  is24Hrs: true,
                  isOpen: true,
                  fuels: ['octane', 'petrol', 'diesel', 'lubricant'],
                  fuelsText: 'অক্টেন, পেট্রোল, ডিজেল, মবিল/লুব্রিকেন্ট',
                  phone: '01712849301',
                  altPhone: '01819482019',
                  manager: 'মোঃ রফিকুল ইসলাম (ম্যানেজার)',
                  payments: 'ক্যাশ, বিকাশ, নগদ, ভিসা/মাষ্টারকার্ড',
                  facilities: ['ডিজিটাল পাম্প মিটার', 'বিনামূল্যে বাতাস (টায়ার প্রেশার)', 'নামাযের স্থান', 'পরিচ্ছন্ন ওয়াশরুম ও ফিল্টার পানি'],
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Puthia+Filling+Station',
                  isFeatured: true
                },
                {
                  id: 'fp-2',
                  name: 'মেসার্স বানেশ্বর ফিলিং স্টেশন',
                  location: 'বানেশ্বর ট্রাফিক মোড় সংলগ্ন, মহাসড়ক, বানেশ্বর, পুঠিয়া',
                  timing: 'সকাল ০৫:৩০ AM - রাত ১১:৩০ PM',
                  is24Hrs: false,
                  isOpen: true,
                  fuels: ['octane', 'petrol', 'diesel'],
                  fuelsText: 'অক্টেন, পেট্রোল, ডিজেল',
                  phone: '01716592014',
                  altPhone: '01912381902',
                  manager: 'মোঃ আল-আমিন',
                  payments: 'ক্যাশ, বিকাশ, রকেট',
                  facilities: ['ডিজিটাল পাম্প', 'নাইট্রোজেন বাতাস', 'ফ্রি সুপেয় পানি'],
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Baneshwar+Filling+Station',
                  isFeatured: true
                },
                {
                  id: 'fp-3',
                  name: 'জে.এইচ. ফিলিং স্টেশন ও এলপিজি অটোগ্যাস',
                  location: 'বিড়ালদহ বাইপাস মোড়, ঢাকা-রাজশাহী মহাসড়ক, পুঠিয়া',
                  timing: '২৪ ঘণ্টা খোলা (24/7)',
                  is24Hrs: true,
                  isOpen: true,
                  fuels: ['octane', 'petrol', 'diesel', 'lpg'],
                  fuelsText: 'অক্টেন, পেট্রোল, ডিজেল, এলপিজি (LPG) অটোগ্যাস',
                  phone: '01711209384',
                  altPhone: '',
                  manager: 'হাজী মোঃ জালাল উদ্দিন',
                  payments: 'ক্যাশ, বিকাশ, ব্যাংক কার্ড',
                  facilities: ['এলপিজি সিলিন্ডার রিফিল', 'কার ওয়াশ', 'এয়ার কমপ্রেসার', '২৪ ঘণ্টা সিকিউরিটি'],
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=JH+Filling+Station+Puthia',
                  isFeatured: true
                },
                {
                  id: 'fp-4',
                  name: 'মেসার্স বেলপুকুর ফিলিং স্টেশন',
                  location: 'বেলপুকুর বাইপাস মোড়, পুঠিয়া সংলগ্ন মহাসড়ক',
                  timing: 'সকাল ০৬:০০ AM - রাত ১১:০০ PM',
                  is24Hrs: false,
                  isOpen: true,
                  fuels: ['octane', 'petrol', 'diesel'],
                  fuelsText: 'অক্টেন, পেট্রোল, ডিজেল, লুব্রিকেন্ট',
                  phone: '01723910283',
                  altPhone: '',
                  manager: 'মোঃ সাইদুর রহমান',
                  payments: 'ক্যাশ, বিকাশ',
                  facilities: ['টায়ার প্রেশার চেক', 'পরিচ্ছন্ন ওয়াশরুম', 'ক্যাফেটেরিয়া'],
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Belpukur+Filling+Station',
                  isFeatured: false
                },
                {
                  id: 'fp-5',
                  name: 'মেসার্স শিবপুর ইস্টার অ্যান্ড ফিলিং স্টেশন',
                  location: 'শিবপুর বাজার সংযোগ মোড়, রাজশাহী-নাটোর হাইওয়ে, পুঠিয়া',
                  timing: 'সকাল ০৬:০০ AM - রাত ১০:৩০ PM',
                  is24Hrs: false,
                  isOpen: true,
                  fuels: ['petrol', 'diesel'],
                  fuelsText: 'পেট্রোল, ডিজেল, ইঞ্জিনের তেল',
                  phone: '01823192083',
                  altPhone: '',
                  manager: 'মোঃ মোবারক হোসেন',
                  payments: 'ক্যাশ, নগদ',
                  facilities: ['বিনামূল্যে টায়ার প্রেশার চেক', 'সুপেয় ফিল্টার পানি'],
                  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Shivpur+Filling+Station+Puthia',
                  isFeatured: false
                }
              ];

              const queryStr = fuelSearchQuery.toLowerCase();

              const filteredPumps = petrolPumps.filter(pump => {
                // Status Filter
                if (fuelStatusFilter === 'open' && !pump.isOpen) return false;
                if (fuelStatusFilter === '24hrs' && !pump.is24Hrs) return false;

                // Fuel Type Filter
                if (fuelTypeFilter !== 'all' && !pump.fuels.includes(fuelTypeFilter)) return false;

                // Search Query
                if (!queryStr) return true;

                return (
                  pump.name.toLowerCase().includes(queryStr) ||
                  pump.location.toLowerCase().includes(queryStr) ||
                  pump.fuelsText.toLowerCase().includes(queryStr) ||
                  pump.manager.toLowerCase().includes(queryStr)
                );
              });

              return (
                <div className="space-y-5">
                  {/* Title Header */}
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <span className="p-2.5 rounded-xl bg-orange-100 text-orange-700 font-bold text-lg">⛽</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">পেট্রোল পাম্প ও ফিলিং স্টেশনের নির্দেশিকা</h3>
                      <p className="text-xs text-slate-500">পুঠিয়া, বানেশ্বর ও মহাসড়ক সংলগ্ন জ্বালানি তেল সরবরাহ কেন্দ্র, খোলা/বন্ধের সময় ও অবস্থান ম্যাপ</p>
                    </div>
                  </div>

                  {/* Summary Metric Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-500 block">মোট পাম্প</span>
                      <span className="text-base font-black text-slate-800">{petrolPumps.length} টি</span>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-0.5">
                      <span className="text-[9px] font-bold text-emerald-700 block">২৪ ঘণ্টা খোলা</span>
                      <span className="text-base font-black text-emerald-800">
                        {petrolPumps.filter(p => p.is24Hrs).length} টি
                      </span>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl text-center space-y-0.5">
                      <span className="text-[9px] font-bold text-orange-700 block">LPG গ্যাস স্টেশন</span>
                      <span className="text-base font-black text-orange-800">
                        {petrolPumps.filter(p => p.fuels.includes('lpg')).length} টি
                      </span>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="পাম্পের নাম, অবস্থান বা জ্বালানির নাম লিখে খুঁজুন... (যেমন: পুঠিয়া, বানেশ্বর, অক্টেন, এলপিজি)"
                      value={fuelSearchQuery || ""}
                      onChange={(e) => setFuelSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm transition-all"
                    />
                    {fuelSearchQuery && (
                      <button 
                        onClick={() => setFuelSearchQuery('')}
                        className="absolute right-4 top-2.5 text-xs font-black text-slate-400 hover:text-slate-600"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>

                  {/* Filter Row 1: Status Filters */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" /> সার্ভিস সময় অনুযায়ী ফিল্টার:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'সব পাম্প', desc: 'সকল স্টেশন' },
                        { id: 'open', label: '🟢 খোলা পাম্প', desc: 'বর্তমানে চালু' },
                        { id: '24hrs', label: '⚡ ২৪ ঘণ্টা খোলা', desc: 'সারারাত সার্ভিস' }
                      ].map((tab) => {
                        const isActive = fuelStatusFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setFuelStatusFilter(tab.id as any)}
                            className={`px-3 py-2 rounded-xl text-left border transition-all flex flex-col justify-center min-w-[100px] flex-1 ${
                              isActive
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xs font-black flex items-center gap-1">
                              {tab.label}
                            </span>
                            <span className={`text-[9px] font-medium mt-0.5 ${isActive ? 'text-teal-100' : 'text-slate-400'}`}>
                              {tab.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filter Row 2: Fuel Type Filters */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-slate-500 flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-orange-600" /> জ্বালানির ধরন অনুযায়ী ফিল্টার:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'সব জ্বালানি' },
                        { id: 'octane', label: 'অক্টেন (Octane)' },
                        { id: 'petrol', label: 'পেট্রোল (Petrol)' },
                        { id: 'diesel', label: 'ডিজেল (Diesel)' },
                        { id: 'lpg', label: 'LPG অটোগ্যাস' }
                      ].map((ft) => {
                        const isActive = fuelTypeFilter === ft.id;
                        return (
                          <button
                            key={ft.id}
                            onClick={() => setFuelTypeFilter(ft.id as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isActive
                                ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                            }`}
                          >
                            {ft.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Petrol Pump Cards List */}
                  {filteredPumps.length > 0 ? (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-orange-600" /> ফিলিং স্টেশন ({filteredPumps.length} টি পাওয়া গেছে)
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {filteredPumps.map((pump) => (
                          <div 
                            key={pump.id} 
                            className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3 hover:border-teal-300 hover:shadow-sm transition-all"
                          >
                            {/* Card Top Line */}
                            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-black text-slate-900 text-sm">{pump.name}</h4>
                                  {pump.isFeatured && (
                                    <span className="text-[9px] font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                      হাইওয়ে মেইন পাম্প
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 flex items-start gap-1 mt-1">
                                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                  <span>{pump.location}</span>
                                </p>
                              </div>

                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                                pump.is24Hrs
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-teal-50 text-teal-800 border-teal-200'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {pump.timing}
                              </span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                                <span className="font-black text-slate-500 text-[10px] uppercase block">উপলব্ধ জ্বালানি:</span>
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  <Fuel className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                  {pump.fuelsText}
                                </span>
                              </div>

                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                                <span className="font-black text-slate-500 text-[10px] uppercase block">পেমেন্ট সুবিধা:</span>
                                <span className="font-bold text-slate-800">
                                  💳 {pump.payments}
                                </span>
                              </div>
                            </div>

                            {/* Facilities Badges */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 block">অন্যান্য সুবিধা:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {pump.facilities.map((fac, idx) => (
                                  <span key={idx} className="text-[10px] font-semibold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md border border-teal-100 flex items-center gap-1">
                                    ✓ {fac}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Manager & Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                              <div className="text-[11px]">
                                <span className="text-slate-400 font-bold block text-[9px]">ম্যানেজার / কন্টাক্ট:</span>
                                <span className="font-black text-slate-800">{pump.manager}</span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  onClick={() => handleCopy(pump.phone, `${pump.name} এর ফোন নম্বর`)}
                                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                                  title="ফোন নম্বর কপি করুন"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                <a
                                  href={`tel:${pump.phone}`}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                                >
                                  <Phone className="w-3.5 h-3.5 fill-white" /> ফোন করুন
                                </a>

                                <a
                                  href={pump.mapUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                                >
                                  <MapPin className="w-3.5 h-3.5" /> গুগল ম্যাপস (Map)
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <Fuel className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">কোনো পেট্রোল পাম্প খুঁজে পাওয়া যায়নি</p>
                      <button 
                        onClick={() => { setFuelSearchQuery(''); setFuelStatusFilter('all'); setFuelTypeFilter('all'); }} 
                        className="text-[10px] font-black text-teal-700 hover:underline"
                      >
                        ফিল্টার রিসেট করুন
                      </button>
                    </div>
                  )}

                  {/* Notice Box */}
                  <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-1 text-xs">
                    <h5 className="font-black text-orange-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-orange-600" /> জরুরি সতর্কতা ও টিপস:
                    </h5>
                    <p className="text-orange-800 text-[11px] leading-relaxed">
                      দূরপাল্লার ভ্রমণের ক্ষেত্রে মহাসড়কে যাত্রা শুরু করার পূর্বে আপনার যানবাহনের ফুয়েল ট্যাংক পূর্ণ রাখুন। পাম্পের ডিজিটাল মিটারে শূন্য (০.০০) চেক করে তেল নিন।
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* 12. BRTA সেবা */}
            {selectedSubmenu === 'brta_service' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="p-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold">🚘</span>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">BRTA সেবা ও ফি নির্দেশিকা</h3>
                    <p className="text-xs text-slate-500">ড্রাইভিং লাইসেন্স এবং যানবাহন রেজিস্ট্রেশন পদ্ধতি</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-800 text-sm">অনলাইন বিএসপি (BSP) সেবা</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      বর্তমানে লার্নার ড্রাইভিং লাইসেন্স, লাইসেন্স নবায়ন এবং মোটরসাইকেলের কর প্রদানের সকল কাজ অনলাইনে <b>bsp.brta.gov.bd</b> পোর্টালে সম্পন্ন করা যায়।
                    </p>
                    <a 
                      href="https://bsp.brta.gov.bd" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                    >
                      অফিসিয়াল পোর্টাল দেখুন <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-black text-slate-800 text-sm">সাধারণ ফি তালিকা</h4>
                    <div className="divide-y divide-slate-100">
                      {[
                        { service: 'মোটরসাইকেল ড্রাইভিং লাইসেন্স (পেশাদার)', fee: '৩,২০০ টাকা' },
                        { service: 'অপেশাদার ড্রাইভিং লাইসেন্স (৫ বছর মেয়াদী)', fee: '২,৫৪২ টাকা' },
                        { service: 'অপেশাদার ড্রাইভিং লাইসেন্স (১০ বছর মেয়াদী)', fee: '৪,৪৯৭ টাকা' },
                        { service: 'মোটরসাইকেল রেজিস্ট্রেশন (২ বছর মেয়াদী)', fee: '১১,৫০০ টাকা প্রায়' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2 text-xs">
                          <span className="text-slate-600 font-medium">{item.service}</span>
                          <span className="font-black text-slate-900">{item.fee}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 13. টোল ও মহাসড়ক তথ্য */}
            {selectedSubmenu === 'toll_highway' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="p-2.5 rounded-xl bg-zinc-100 text-zinc-700 font-bold">🛣️</span>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">মহাসড়ক নিয়মাবলি ও টোল তথ্য</h3>
                    <p className="text-xs text-slate-500">N6 মহাসড়কে চলার সঠিক নিয়ম ও লালন শাহ সেতুর টোল হার</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <h4 className="font-black text-slate-800 text-sm">হাইওয়ে নিরাপত্তা নিয়মাবলি</h4>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-600 font-medium">
                      <li>মহাসড়কে সর্বোচ্চ গতিসীমা ৮০ কিমি/ঘণ্টা।</li>
                      <li>বাজার এলাকায় গতিসীমা ৩০ কিমি/ঘণ্টায় নামিয়ে আনুন।</li>
                      <li>মোটরসাইকেলে চালক ও আরোহী উভয়ের হেলমেট পরিধান বাধ্যতামূলক।</li>
                      <li>কোনো অবস্থায় উল্টোপথে গাড়ি চালাবেন না।</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-black text-slate-800 text-sm">লালন শাহ সেতু টোল হার (পদ্মা নদী)</h4>
                    <div className="divide-y divide-slate-100 bg-white border border-slate-100 rounded-2xl p-3">
                      {[
                        { vehicle: 'মোটরসাইকেল', fare: '১০ টাকা' },
                        { vehicle: 'কার / জিপ', fare: '৭০ টাকা' },
                        { vehicle: 'মাইক্রোবাস', fare: '১১০ টাকা' },
                        { vehicle: 'মিনিবাস', fare: '১৫০ টাকা' },
                        { vehicle: 'ভারী ট্রাক (৩ এক্সেল)', fare: '৫৫০ টাকা' }
                      ].map((toll, idx) => (
                        <div key={idx} className="flex justify-between py-2 font-medium">
                          <span className="text-slate-600">{toll.vehicle}</span>
                          <span className="font-black text-slate-900">{toll.fare}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 14. রাস্তার অবস্থা & 15. ট্রাফিক আপডেট (Interactive Citizen Reports) */}
            {(selectedSubmenu === 'road_condition' || selectedSubmenu === 'traffic_update') && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className={`p-2.5 rounded-xl font-bold ${selectedSubmenu === 'road_condition' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedSubmenu === 'road_condition' ? '🚧' : '🚦'}
                  </span>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">
                      {selectedSubmenu === 'road_condition' ? 'রাস্তার অবস্থা লাইভ রিপোর্ট' : 'লাইভ ট্রাফিক আপডেট'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      নাগরিক রিপোর্টের মাধ্যমে পুঠিয়া ও বানেশ্বর মোড়ের সর্বশেষ পরিস্থিতি জানুন
                    </p>
                  </div>
                </div>

                {/* Submitting New Report Form */}
                <form 
                  onSubmit={(e) => handleAddReport(e, selectedSubmenu === 'road_condition' ? 'road' : 'traffic')} 
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3"
                >
                  <h4 className="font-black text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" /> নতুন রিপোর্ট যুক্ত করুন
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">স্থান / সড়ক</label>
                      <input 
                        type="text" 
                        placeholder="যেমন: বানেশ্বর হাইওয়ে মোড়" 
                        value={newReportLocation || ""}
                        onChange={(e) => setNewReportLocation(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">পরিস্থিতি / স্ট্যাটাস</label>
                      <select 
                        value={newReportStatus || ""}
                        onChange={(e) => setNewReportStatus(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 font-bold"
                      >
                        {selectedSubmenu === 'road_condition' ? (
                          <>
                            <option value="✅ চমৎকার ও মসৃণ">✅ চমৎকার ও মসৃণ</option>
                            <option value="🚧 সংস্কার কাজ চলছে">🚧 সংস্কার কাজ চলছে</option>
                            <option value="⚠️ ভাঙাচোরা রাস্তা">⚠️ ভাঙাচোরা রাস্তা</option>
                            <option value="🌧️ কাদা/পানি জমে আছে">🌧️ কাদা/পানি জমে আছে</option>
                          </>
                        ) : (
                          <>
                            <option value="🟢 স্বাভাবিক চলাচল">🟢 স্বাভাবিক চলাচল</option>
                            <option value="🟡 মাঝারি জ্যাম">🟡 মাঝারি জ্যাম</option>
                            <option value="🛑 তীব্র যানজট">🛑 তীব্র যানজট</option>
                            <option value="🚨 দুর্ঘটনা / ধীরগতি">🚨 দুর্ঘটনা / ধীরগতি</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">বিবরণ (বিস্তারিত লিখুন)</label>
                    <textarea 
                      placeholder="বর্তমান পরিস্থিতি নিয়ে অন্য গাড়িচালকদের জন্য গুরুত্বপূর্ণ বিবরণ লিখুন..."
                      rows={2}
                      value={newReportDesc || ""}
                      onChange={(e) => setNewReportDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">আপনার নাম</label>
                      <input 
                        type="text" 
                        placeholder="যেমন: আমিনুল ইসলাম" 
                        value={newReportName || ""}
                        onChange={(e) => setNewReportName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'রিপোর্ট পোস্ট করুন'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Display Reports List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-800 text-sm">নাগরিক আপডেট</h4>
                    <button 
                      onClick={fetchCrowdReports} 
                      disabled={isFetchingReports}
                      className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isFetchingReports ? 'animate-spin' : ''}`} /> রিফ্রেশ করুন
                    </button>
                  </div>

                  <div className="space-y-3">
                    {reports
                      .filter(r => r.type === (selectedSubmenu === 'road_condition' ? 'road' : 'traffic'))
                      .map((report, idx) => (
                        <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h5 className="font-black text-slate-800 text-xs sm:text-sm">{report.location}</h5>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">পোস্ট করেছেন: {report.reporterName}</p>
                            </div>
                            <span className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 shrink-0">
                              {report.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-normal font-medium bg-slate-50/50 p-2.5 rounded-xl border border-slate-50">
                            {report.description}
                          </p>
                        </div>
                      ))}

                    {reports.filter(r => r.type === (selectedSubmenu === 'road_condition' ? 'road' : 'traffic')).length === 0 && (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-500">এখনো কোনো রিপোর্ট পোস্ট করা হয়নি। প্রথম নাগরিক রিপোর্টটি পোস্ট করুন!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 16. পার্কিং */}
            {selectedSubmenu === 'parking_info' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="p-2.5 rounded-xl bg-blue-100 text-blue-700 font-bold">🅿️</span>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">নিরাপদ পার্কিং জোন</h3>
                    <p className="text-xs text-slate-500">রাজবাড়ি ও বাজার এলাকার নিরাপদ পার্কিং স্পট</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-100 space-y-1.5 font-medium">
                    <p className="font-bold text-sm">💡 পর্যটকদের জন্য পার্কিং নির্দেশনা:</p>
                    <p>পুঠিয়া রাজবাড়ি কমপ্লেক্সের প্রধান তোরণ সংলগ্ন বিশাল দীঘির পশ্চিমপাড়ে সরকারিভাবে পার্কিং ইজারা দেওয়া আছে। অযথা প্রধান সড়কে গাড়ি পার্ক করে যানজট সৃষ্টি করা থেকে বিরত থাকুন।</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { area: 'পুঠিয়া রাজবাড়ি শিব মন্দির পার্কিং', type: 'মোটরসাইকেল, কার, মাইক্রোবাস', security: 'সিসিটিভি দ্বারা সুরক্ষিত, লাইভ গার্ড', charge: 'মোটরসাইকেল: ২০ টাকা, কার: ৫০ টাকা' },
                      { area: 'বানেশ্বর হাট ট্রাক টার্মিনাল', type: 'ট্রাক, লরি, মাঝারি পিকআপ', security: 'পৌরসভা ইজারাদার নিয়ন্ত্রিত', charge: 'যানবাহনভেদে ৫০ - ১০০ টাকা' },
                      { area: 'উপজেলা পরিষদ চত্বর পার্কিং', type: 'শুধুমাত্র কর্মকর্তা ও সাধারণ দর্শনার্থী', security: 'আনসার নিরাপত্তা বেষ্টনী', charge: 'সম্পূর্ণ ফ্রি' }
                    ].map((park, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <h4 className="font-black text-slate-800 text-sm">{park.area}</h4>
                        <p className="text-slate-600"><b>অনুমোদিত বাহন:</b> {park.type}</p>
                        <p className="text-slate-600"><b>নিরাপত্তা ব্যবস্থা:</b> {park.security}</p>
                        <p className="text-slate-600"><b>চার্জ/ফি:</b> {park.charge}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Live Bus Tracking View */}
            {selectedSubmenu === 'live_bus' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-sky-100 text-sky-700 font-bold">📍</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">লাইভ বাস ট্র্যাকিং (GPS Live Location)</h3>
                      <p className="text-xs text-slate-500">পুঠিয়া-বানেশ্বর মহাসড়ক ও ঢাকাগামী বাসের অবস্থান</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    লাইভ সক্রিয়
                  </span>
                </div>

                <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 animate-spin" /> GPS Radar: Puthia Highway Circle</span>
                    <span>সক্রিয় ট্র্যাকিং: ৪ টি বাস</span>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    {[
                      { name: 'দেশ ট্রাভেলস (ঢাকা এক্সপ্রেস)', location: 'বানেশ্বর ট্রাফিক মোড় অতিক্রম করছে', speed: '৬৪ কিমি/ঘণ্টা', eta: '৮ মিনিট পর পুঠিয়া স্ট্যান্ডে', status: 'সময়মত', progress: '৮৫%', driver: '০১৭৬৬-৯৯৮৮৭৭' },
                      { name: 'হানিফ এন্টারপ্রাইজ (স্ক্যানিয়া এসি)', location: 'নাটোর বাইপাস (পুঠিয়ার উদ্দেশ্যে)', speed: '৫৮ কিমি/ঘণ্টা', eta: '১৪ মিনিট পর পুঠিয়া স্ট্যান্ডে', status: 'অন টাইম', progress: '৭০%', driver: '০১৭১৩-০৪৯০৫০' },
                      { name: 'লোকাল গেটলক বাস (#০৪)', location: 'বেলপুকুর বাজার মোড়', speed: '৪৩ কিমি/ঘণ্টা', eta: '৫ মিনিট পর বানেশ্বর মোড়ে', status: 'যাত্রী উঠানামা', progress: '৪০%', driver: '০১৭০০-১১২২ ৩৩' },
                      { name: 'শ্যামলী এন.আর ট্রাভেলস', location: 'সিরাজগঞ্জ হাইওয়ে ফুড ভিলেজ', speed: '৭২ কিমি/ঘণ্টা', eta: '১ ঘণ্টা ১০ মিনিট পর পুঠিয়া মোড়ে', status: 'অন টাইম', progress: '২৫%', driver: '০১৭৫৫-৬৬৭৭৮৮' }
                    ].map((bus, idx) => (
                      <div key={idx} className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-amber-300 font-black">{bus.name}</span>
                          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px]">{bus.status}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-300">
                          <span>📍 {bus.location}</span>
                          <span>⚡ {bus.speed}</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: bus.progress }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>⏱️ পৌঁছানোর সময়: {bus.eta}</span>
                          <a href={`tel:${bus.driver}`} className="text-sky-300 hover:underline flex items-center gap-1 font-bold">
                            <Phone className="w-3 h-3" /> কল করুন
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Live Train Tracking View */}
            {selectedSubmenu === 'live_train' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 font-bold">🚆</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">লাইভ ট্রেন ট্র্যাকিং (Live Train Status)</h3>
                      <p className="text-xs text-slate-500">সারদাহ রোড ও রাজশাহী রুটের ট্রেনের অবস্থান</p>
                    </div>
                  </div>
                  <a href="https://eticket.railway.gov.bd" target="_blank" rel="noreferrer" className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl hover:bg-rose-100 flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> রেল সেবা
                  </a>
                </div>

                <div className="space-y-3">
                  {[
                    { train: 'সিল্কসিটি এক্সপ্রেস (৭৫৩)', route: 'ঢাকা ➔ রাজশাহী', location: 'নন্দনগাছী স্টেশন অতিক্রম করছে', stop: 'সারদাহ রোড স্টেশন (১০:৪৫ AM)', speed: '৭২ কিমি/ঘণ্টা', delay: 'অন-টাইম', track: 'ট্র্যাক #১' },
                    { train: 'পদ্মা এক্সপ্রেস (৭৫৯)', route: 'ঢাকা ➔ রাজশাহী', location: 'নাটোর স্টেশন পার হয়েছে', stop: 'আব্দুলপুর জংশন', speed: '৭৮ কিমি/ঘণ্টা', delay: '+৫ মিনিট বিলম্ব', track: 'ট্র্যাক #২' },
                    { train: 'ধুমকেতু এক্সপ্রেস (৭৬৯)', route: 'ঢাকা ➔ রাজশাহী', location: 'ঈশ্বরদী জংশন ইয়ার্ড', stop: 'সারদাহ রোড (দুপুর ১২:১০)', speed: '০ কিমি/ঘণ্টা', delay: 'সিডিউল মাফিক', track: 'ট্র্যাক #১' },
                    { train: 'বনলতা এক্সপ্রেস (৭৯১)', route: 'ঢাকা ➔ রাজশাহী (নন-স্টপ)', location: 'বঙ্গবন্ধু সেতু পশ্চিম প্রান্ত', stop: 'সরাসরি রাজশাহী জংশন', speed: '৯৫ কিমি/ঘণ্টা', delay: 'অন-টাইম', track: 'প্রধান লাইন' }
                  ].map((tr, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{tr.train}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{tr.route}</span>
                        </div>
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${tr.delay.includes('বিলম্ব') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {tr.delay}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 font-medium">
                        <div><b>বর্তমান স্থান:</b> {tr.location}</div>
                        <div><b>পরবর্তী স্টপ:</b> {tr.stop}</div>
                        <div><b>গতিবেগ:</b> {tr.speed}</div>
                        <div><b>লাইন/ট্র্যাক:</b> {tr.track}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Traffic Map View */}
            {selectedSubmenu === 'live_traffic' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 font-bold">🚦</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">লাইভ ট্রাফিক ম্যাপ ও কন্ডিশন</h3>
                      <p className="text-xs text-slate-500">পুঠিয়া মহাসড়ক ও বাজার এলাকার রিয়েল-টাইম জ্যাম আপডেট</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'ঢাকা-রাজশাহী মহাসড়ক (পুঠিয়া স্ট্যান্ড)', status: 'স্বাভাবিক', color: 'bg-emerald-50 border-emerald-200 text-emerald-900', speed: '৫০-৬০ কিমি/ঘণ্টা', desc: 'কোনো বড় যানজট নেই, পথ সম্পূর্ণ পরিষ্কার।' },
                    { title: 'বানেশ্বর বাজার হাইওয়ে গোলচত্বর', status: 'হালকা ধীরগতি', color: 'bg-amber-50 border-amber-200 text-amber-900', speed: '২০-৩০ কিমি/ঘণ্টা', desc: 'লোকাল বাস ও অটোরিকশার কারণে মোড়ে কিছু জট আছে।' },
                    { title: 'পুঠিয়া রাজবাড়ি প্রবেশদ্বার ও রোড', status: 'সম্পূর্ণ ফাঁকা', color: 'bg-emerald-50 border-emerald-200 text-emerald-900', speed: 'মসৃণ চলাচল', desc: 'পর্যটক ও স্থানীয় হালকা যানবাহন স্বাচ্ছন্দ্যে চলাচল করছে।' },
                    { title: 'তাহেরপুর-পুঠিয়া আঞ্চলিক সড়ক', status: 'সড়ক মেরামত কাজ', color: 'bg-orange-50 border-orange-200 text-orange-900', speed: 'ধীরগতি (এক লেন)', desc: 'ভালুকগাছি অংশে সংস্কার চলছে, সতর্কতার সাথে গাড়ি চালান।' }
                  ].map((tf, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border space-y-2 ${tf.color}`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm">{tf.title}</h4>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-full">{tf.status}</span>
                      </div>
                      <p className="text-xs text-slate-700">{tf.desc}</p>
                      <p className="text-[11px] font-bold opacity-80">⚡ গড় গতি: {tf.speed}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Booking View */}
            {selectedSubmenu === 'ticket_booking' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-purple-100 text-purple-700 font-bold">🎫</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">বাস ও ট্রেন টিকিট বুকিং পোর্টাল</h3>
                      <p className="text-xs text-slate-500">সহজে আসন নির্বাচন ও অনলাইন বুকিং আবেদন</p>
                    </div>
                  </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button
                    onClick={() => setBookingType('bus')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${bookingType === 'bus' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    🚌 বাস টিকিট বুকিং
                  </button>
                  <button
                    onClick={() => setBookingType('train')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${bookingType === 'train' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    🚆 ট্রেন টিকিট বুকিং
                  </button>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs font-bold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">প্রস্থান স্থান (Origin)</label>
                      <select value={bookingFrom || ""} onChange={(e) => setBookingFrom(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-purple-500">
                        <option value="পুঠিয়া বাসস্ট্যান্ড">পুঠিয়া বাসস্ট্যান্ড</option>
                        <option value="বানেশ্বর বাজার">বানেশ্বর বাজার</option>
                        <option value="রাজশাহী টার্মিনাল">রাজশাহী টার্মিনাল</option>
                        <option value="সারদাহ রোড স্টেশন">সারদাহ রোড স্টেশন</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">গন্তব্য স্থান (Destination)</label>
                      <select value={bookingTo || ""} onChange={(e) => setBookingTo(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-purple-500">
                        <option value="ঢাকা (গাবতলী/কল্যাণপুর)">ঢাকা (গাবতলী/কল্যাণপুর)</option>
                        <option value="চট্টগ্রাম (দামপাড়া)">চট্টগ্রাম (দামপাড়া)</option>
                        <option value="রংপুর টার্মিনাল">রংপুর টার্মিনাল</option>
                        <option value="বগুড়া সাতমাথা">বগুড়া সাতমাথা</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">যাত্রার তারিখ</label>
                      <input type="date" value={bookingDate || ""} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">ক্লাস/শ্রেণী</label>
                      <select value={bookingClass || ""} onChange={(e) => setBookingClass(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-purple-500">
                        <option value="AC">এসি (AC Scania / Hyundai)</option>
                        <option value="Non-AC">নন-এসি (Deluxe Non-AC)</option>
                        <option value="Sleeper">এসি স্লিপার (Sleeper Coach)</option>
                        <option value="Snigdha">স্নিগ্ধা (Train AC Chair)</option>
                        <option value="Shovon">শোভন চেয়ার (Shovon Chair)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="text-slate-700 font-black block">আসন নির্বাচন করুন (Select Seats):</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'].map((seat) => {
                        const isSelected = selectedSeats.includes(seat);
                        return (
                          <button
                            key={seat}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSeats(selectedSeats.filter(s => s !== seat));
                              } else {
                                setSelectedSeats([...selectedSeats, seat]);
                              }
                            }}
                            className={`py-2 rounded-xl text-xs font-black transition-all ${isSelected ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                          >
                            {seat}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500">নির্বাচিত আসন: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'কোনোটি নির্বাচিত হয়নি'} | আনুমানিক মোট ভাড়া: <b>{selectedSeats.length * (bookingClass.includes('AC') ? 1100 : 750)} টাকা</b></p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-slate-600 block mb-1">যাত্রীর নাম</label>
                      <input type="text" placeholder="আপনার নাম" value={passengerName || ""} onChange={(e) => setPassengerName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">মোবাইল নম্বর</label>
                      <input type="tel" placeholder="০১৭xxxxxxxx" value={passengerPhone || ""} onChange={(e) => setPassengerPhone(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!passengerName || !passengerPhone || selectedSeats.length === 0) {
                        toast.error('নাম, মোবাইল নম্বর ও আসন নির্বাচন করুন');
                        return;
                      }
                      const refCode = `PUTHIA-${bookingType.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
                      setConfirmedBooking({
                        refCode,
                        type: bookingType,
                        from: bookingFrom,
                        to: bookingTo,
                        date: bookingDate,
                        seats: selectedSeats.join(', '),
                        passenger: passengerName,
                        phone: passengerPhone,
                        totalFare: selectedSeats.length * (bookingClass.includes('AC') ? 1100 : 750)
                      });
                      toast.success('টিকিট আবেদন কনফার্ম করা হয়েছে!');
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-black text-xs transition-all shadow-md"
                  >
                    আসন বুকিং জমা দিন
                  </button>
                </div>

                {confirmedBooking && (
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-emerald-950 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <span className="font-black text-sm text-emerald-900">✅ বুকিং স্লিপ (Confirmed Slip)</span>
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border text-emerald-800">{confirmedBooking.refCode}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <p><b>যাত্রী:</b> {confirmedBooking.passenger}</p>
                      <p><b>মোবাইল:</b> {confirmedBooking.phone}</p>
                      <p><b>রুট:</b> {confirmedBooking.from} ➔ {confirmedBooking.to}</p>
                      <p><b>তারিখ:</b> {confirmedBooking.date}</p>
                      <p><b>আসন:</b> {confirmedBooking.seats}</p>
                      <p><b>মোট ভাড়া:</b> {confirmedBooking.totalFare} টাকা</p>
                    </div>
                    <p className="text-[10px] text-emerald-800 pt-1 italic">💡 বি:দ্র: কাউন্টারে এই রেফারেন্স কোড ও মোবাইল নম্বর দেখিয়ে টিকিট সংগ্রহ করতে পারবেন।</p>
                  </div>
                )}
              </div>
            )}

            {/* GPS Nearby Transport View */}
            {selectedSubmenu === 'gps_nearby' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 font-bold">📍</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">GPS ভিত্তিক নিকটবর্তী পরিবহন খোঁজা</h3>
                      <p className="text-xs text-slate-500">আপনার অবস্থানের আশেপাশের কাউন্টার ও স্ট্যান্ড</p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-800 text-white p-5 rounded-2xl space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-black text-sm">আপনার বর্তমান লোকেশন অনুযায়ী দূরত্ব</h4>
                      <p className="text-xs text-emerald-200">জিপিএস ব্যবহার করে সবচেয়ে কাছের কাউন্টার জানুন</p>
                    </div>
                    <button
                      onClick={handleGetLocation}
                      disabled={gpsLoading}
                      className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-100 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Locate className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                      {gpsLoading ? 'সনাক্ত করা হচ্ছে...' : 'আমার অবস্থান খুঁজুন'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'পুঠিয়া কেন্দ্রীয় বাসস্ট্যান্ড মোড়', dist: '৩৫০ মিটার দূরে', time: 'হাঁটার সময়: ৪ মিনিট', vehicles: 'দূরপাল্লার ঢাকা বাস, দেশ ও হানিফ কাউন্টার, সিএনজি স্ট্যান্ড', maps: 'https://maps.google.com/?q=Puthia+Bus+Stand' },
                    { name: 'বানেশ্বর হাইওয়ে ট্রাফিক চত্বর', dist: '৩.৮ কিলোমিটার দূরে', time: 'ইজিবাইকে সময়: ৮ মিনিট', vehicles: 'রাজশাহী লোকাল বাস, সিএনজি, অটো, লেগুনা সার্ভিস', maps: 'https://maps.google.com/?q=Baneswar+Bazar' },
                    { name: 'সারদাহ রোড রেলওয়ে স্টেশন', dist: '৪.২ কিলোমিটার দূরে', time: 'সিএনজি/অটোতে সময়: ১২ মিনিট', vehicles: 'সিল্কসিটি, পদ্মা ও লোকাল মেল ট্রেন সার্ভিস', maps: 'https://maps.google.com/?q=Sardah+Road+Station' },
                    { name: 'পুঠিয়া পেট্রোল পাম্প ফিলিং স্টেশন', dist: '৬০০ মিটার দূরে', time: 'ড্রাইভ সময়: ১.৫ মিনিট', vehicles: 'অকটেন, পেট্রোল, ডিজেল ফুয়েল ও বাইক পার্কিং', maps: 'https://maps.google.com/?q=Puthia+Petrol+Pump' },
                    { name: 'তাহেরপুর সিএনজি ও ইজিবাইক স্ট্যান্ড', dist: '১২.৫ কিলোমিটার দূরে', time: 'সিএনজিতে সময়: ২৫ মিনিট', vehicles: 'তাহেরপুর, বাগমারা ও বানেশ্বরগামী সিএনজি', maps: 'https://maps.google.com/?q=Taherpur+Bazar' }
                  ].map((place, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-800 text-sm">{place.name}</h4>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">{place.dist}</span>
                        </div>
                        <p className="text-slate-600">⏱️ {place.time}</p>
                        <p className="text-slate-500 text-[11px]"><b>উপলব্ধ বাহন:</b> {place.vehicles}</p>
                      </div>
                      <a href={place.maps} target="_blank" rel="noreferrer" className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shrink-0 self-start sm:self-center">
                        <ExternalLink className="w-3.5 h-3.5" /> ম্যাপে দেখুন
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route & Traffic Alerts View */}
            {selectedSubmenu === 'route_alerts' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-red-100 text-red-700 font-bold">🔔</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">রুট ও ট্রাফিক জরুরি অ্যালার্ট</h3>
                      <p className="text-xs text-slate-500">মহাসড়কের জরুরি তথ্য, আবহাওয়া ও ট্রাফিক সতর্কতা</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'বানেশ্বর হাটের বিশেষ ট্রাফিক সতর্কতা', type: 'হাটবার জ্যাম', color: 'bg-amber-50 border-amber-200 text-amber-950', date: 'প্রতি মঙ্গলবার ও শুক্রবার', desc: 'হাটবারে বানেশ্বর গোলচত্বরে অতিরিক্ত পণ্যবাহী ট্রাকের কারণে বেলা ১১টা থেকে বিকেল ৪টা পর্যন্ত যানজট থাকে। বিকল্প হিসেবে ভালোঘাট বা বাইপাস রোড ব্যবহার করতে পারেন।' },
                    { title: 'পুঠিয়া-তাহেরপুর রোড সংস্কার কাজ', type: 'সড়ক মেরামত', color: 'bg-orange-50 border-orange-200 text-orange-950', date: 'সক্রিয় কাজ চলছে', desc: 'ভালুকগাছি ব্রিজ সংলগ্ন স্থানে পিচ ঢালাইয়ের কাজ চলায় এক লাইনে গাড়ি চলাচল করছে। ধীরগতিতে গাড়ি চালানোর পরামর্শ দেওয়া হচ্ছে।' },
                    { title: 'শেষ রাত ও ভোরের ঘন কুয়াশা সতর্কতা', type: 'আবহাওয়া', color: 'bg-blue-50 border-blue-200 text-blue-950', date: 'শীতকাল সতর্কবার্তা', desc: 'ঢাকা-রাজশাহী মহাসড়কের নাটোর-পুঠিয়া অংশে ভোরে দৃষ্টিসীমা কমে যেতে পারে। গতিসীমা ৪০ কিমি/ঘণ্টার নিচে রাখুন।' }
                  ].map((alt, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border space-y-1.5 ${alt.color}`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm">{alt.title}</h4>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-white rounded-full shadow-sm">{alt.type}</span>
                      </div>
                      <p className="text-xs">{alt.desc}</p>
                      <p className="text-[10px] font-bold opacity-75">📅 {alt.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favourite Routes View */}
            {selectedSubmenu === 'fav_routes' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-pink-100 text-pink-700 font-bold">⭐</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">প্রিয় রুট (Favourite Routes)</h3>
                      <p className="text-xs text-slate-500">আপনার নিয়মিত যাতায়াতের বুকমার্ককৃত রুট</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAddFavRoute} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs font-bold">
                  <h4 className="text-slate-800 font-black text-sm">নতুন পছন্দের রুট যুক্ত করুন</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder="শুরু করার স্থান (যেমন: পুঠিয়া বাসস্ট্যান্ড)" value={newFavFrom || ""} onChange={(e) => setNewFavFrom(e.target.value)} className="bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-pink-500" />
                    <input type="text" placeholder="গন্তব্য স্থান (যেমন: রাজশাহী ভদ্রা)" value={newFavTo || ""} onChange={(e) => setNewFavTo(e.target.value)} className="bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-pink-500" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select value={newFavMode || ""} onChange={(e) => setNewFavMode(e.target.value)} className="bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-pink-500">
                      <option value="সিএনজি / অটোরিকশা">সিএনজি / অটোরিকশা</option>
                      <option value="ইজিবাইক">ইজিবাইক</option>
                      <option value="বাস সার্ভিস">বাস সার্ভিস</option>
                      <option value="ট্রেন">ট্রেন</option>
                    </select>
                    <input type="text" placeholder="আনুমানিক ভাড়া (যেমন: ৫০ টাকা)" value={newFavFare || ""} onChange={(e) => setNewFavFare(e.target.value)} className="bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-pink-500" />
                  </div>
                  <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl font-black text-xs transition-all shadow-sm">
                    পছন্দের তালিকায় যোগ করুন
                  </button>
                </form>

                <div className="space-y-3">
                  {favRoutesList.map((route) => (
                    <div key={route.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{route.from} ➔ {route.to}</span>
                          <span className="bg-pink-100 text-pink-800 text-[10px] font-black px-2 py-0.5 rounded-full">{route.mode}</span>
                        </div>
                        <p className="text-slate-600 font-medium">⏱️ সময়: {route.duration} | 💰 ভাড়া: <b>{route.fare}</b></p>
                        {route.note && <p className="text-slate-400 text-[11px]">{route.note}</p>}
                      </div>
                      <button onClick={() => handleRemoveFavRoute(route.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="মুছুন">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passenger Ratings & Reviews View */}
            {selectedSubmenu === 'reviews_ratings' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 font-bold">💬</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">যাত্রীদের রেটিং ও রিভিউ</h3>
                      <p className="text-xs text-slate-500">পরিবহন কাউন্টার ও সার্ভিসের সাধারণ যাত্রীদের অভিজ্ঞতা</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded-full flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> ৪.৮/৫ রেটিং
                  </span>
                </div>

                <form onSubmit={handleAddReview} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs font-bold">
                  <h4 className="text-slate-800 font-black text-sm">আপনার ভ্রমণ অভিজ্ঞতা ও রিভিউ লিখুন</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-600 block mb-1">সার্ভিস নির্বাচন করুন</label>
                      <select value={newRevCategory || ""} onChange={(e) => setNewRevCategory(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500">
                        <option value="দেশ ট্রাভেলস (পুঠিয়া কাউন্টার)">দেশ ট্রাভেলস (পুঠিয়া কাউন্টার)</option>
                        <option value="হানিফ এন্টারপ্রাইজ (বানেশ্বর)">হানিফ এন্টারপ্রাইজ (বানেশ্বর)</option>
                        <option value="সিল্কসিটি এক্সপ্রেস (সারদাহ)">সিল্কসিটি এক্সপ্রেস (সারদাহ)</option>
                        <option value="পুঠিয়া-বানেশ্বর সিএনজি চালক সমিতি">পুঠিয়া-বানেশ্বর সিএনজি চালক সমিতি</option>
                        <option value="পৌরসভা ইজিবাইক সার্ভিস">পৌরসভা ইজিবাইক সার্ভিস</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1">স্টার রেটিং দিন</label>
                      <div className="flex items-center gap-2 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRevRating(star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star className={`w-6 h-6 ${star <= newRevRating ? 'text-amber-500 fill-amber-400' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder="আপনার নাম" value={newRevAuthor || ""} onChange={(e) => setNewRevAuthor(e.target.value)} className="bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500" />
                    <input type="text" placeholder="আপনার অনুভূতি / মন্তব্য সংক্ষেপে লিখুন" value={newRevComment || ""} onChange={(e) => setNewRevComment(e.target.value)} className="bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500" />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-black text-xs transition-all shadow-sm"
                  >
                    {isSubmittingReview ? 'জমা হচ্ছে...' : 'রিভিউ জমা দিন'}
                  </button>
                </form>

                <div className="space-y-3">
                  {reviewsList.map((rev, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">{rev.serviceName}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">"{rev.comment}"</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>👤 {rev.author} | 📅 {rev.date}</span>
                        <span className="text-emerald-600 font-bold">👍 যাত্রীদের পছন্দ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 17. জরুরি পরিবহন নম্বর */}
            {selectedSubmenu === 'emergency_numbers' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 font-bold">📞</span>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">জরুরি পরিবহন ও হাইওয়ে যোগাযোগ নম্বর</h3>
                    <p className="text-xs text-slate-500">নিরাপদ যাতায়াতে জরুরি প্রয়োজনে কল করুন</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { department: 'পবা হাইওয়ে থানা (Poba Highway Police)', phone: '০১৭১৩-৩৭৪১৫৪', purpose: 'মহাসড়কে যেকোনো দুর্ঘটনা বা ডাকাতি প্রতিরোধে' },
                    { department: 'পুঠিয়া ফায়ার সার্ভিস (Puthia Fire Station)', phone: '০১৭৩০-০০০২৪৪', purpose: 'অগ্নিসংযোগ বা মারাত্মক সড়ক দুর্ঘটনা উদ্ধার কাজ' },
                    { department: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স অ্যাম্বুলেন্স', phone: '০১৭৩০-৩২৪৭৫৪', purpose: 'জরুরি রোগী স্থানান্তরের জন্য সরকারি অ্যাম্বুলেন্স' },
                    { department: 'বানেশ্বর ট্রাফিক পুলিশ ফাঁড়ি', phone: '০১৭১১-২২৩৩৪৪', purpose: 'মহাসড়কে কোনো বড় জ্যাম বা অচল অবস্থা নিরসনে' },
                    { department: 'পুঠিয়া থানা (ডিউটি অফিসার)', phone: '০১৭১৩-৩৭৩৮৫১', purpose: 'যেকোনো ধরনের অপরাধমূলক বা আইনগত সহায়তার জন্য' }
                  ].map((contact, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-800 text-sm">{contact.department}</h4>
                        <p className="text-xs text-slate-500 font-medium">{contact.purpose}</p>
                        <p className="text-xs font-black text-emerald-700">{contact.phone}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <a 
                          href={`tel:${contact.phone}`} 
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" /> কল
                        </a>
                        <button 
                          onClick={() => handleCopy(contact.phone, contact.department)}
                          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back Button inside view */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  handleSelectSubmenu(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-3 rounded-2xl font-black text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> আগের মেনুতে ফিরে যান
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
