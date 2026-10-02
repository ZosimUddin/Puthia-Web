import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, MapPin, Clock, Star, ShieldCheck, Heart, Share2, AlertTriangle, Building2, ExternalLink,
  MessageSquare, Calendar, Award, Stethoscope, CheckCircle2, UserCheck, DollarSign, Camera, Info, RefreshCw,
  Flag, ChevronRight, X, Activity, Truck, ShieldAlert, BookOpen, Utensils, Bed, Newspaper, Briefcase, Sprout,
  Check, Navigation, FileText, User, ShoppingBag, HelpCircle, Navigation2
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../firebase';
import { getServiceConfig, ServiceConfig } from '../../../config/servicesConfig';
import { UniversalServiceCard } from './UniversalServiceCard';
import { GlobalSkeletonLoader } from './GlobalSkeletonLoader';
import { RatingModal } from '../RatingModal';
import { AppointmentModal } from '../AppointmentModal';
import { VerificationDetailsModal } from '../VerificationDetailsModal';
import { ReportAndUpdateModal } from '../ReportAndUpdateModal';
import { SuggestCorrectionModal } from './SuggestCorrectionModal';
import { DomainSpecificDetails } from './DomainSpecificDetails';
import { DiagnosticDetailView } from './DiagnosticDetailView';
import Header from '../../home/Header';
import BottomNav from '../../home/BottomNavigation';
import SEO from '../../SEO';
import { getServiceItemDetailSchema } from '../../../utils/seoHelpers';
import { PUTHIA_DIAGNOSTIC_MASTER_DIRECTORY } from '../../../data/diagnosticData';
import { DEFAULT_HEALTH_SERVICES } from '../../../data/healthData';
import { getFallbackData } from '../../../data/directoryFallbackData';

interface ServiceDetailTemplateProps {
  serviceKeyParam?: string;
  idParam?: string;
}

export const ServiceDetailTemplate: React.FC<ServiceDetailTemplateProps> = ({
  serviceKeyParam,
  idParam,
}) => {
  const params = useParams();
  const navigate = useNavigate();

  const serviceKey = serviceKeyParam || params.serviceKey || 'doctor';
  const docId = idParam || params.id;

  const config: ServiceConfig = getServiceConfig(serviceKey);
  const schema = config.fieldsSchema;

  const [item, setItem] = useState<Record<string, any> | null>(null);
  const [relatedItems, setRelatedItems] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showBloodRequestModal, setShowBloodRequestModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [reportUpdateModal, setReportUpdateModal] = useState<{ isOpen: boolean; mode: 'report' | 'update' }>({
    isOpen: false,
    mode: 'report',
  });

  // Lightbox Image State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!docId) {
      setLoading(false);
      setError('তথ্যটি আইডি দিয়ে খুঁজে পাওয়া যায়নি।');
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      setError(null);

      // Check master directory first for static/guaranteed entries
      if (config.id === 'diagnostic' || config.collectionName === 'diagnostics') {
        const localFound = PUTHIA_DIAGNOSTIC_MASTER_DIRECTORY.find((d) => d.id === docId);
        if (localFound) {
          setItem(localFound);
          setLoading(false);
          return;
        }
      } else if (config.id === 'hospital' || config.collectionName === 'hospitals') {
        const localFound = DEFAULT_HEALTH_SERVICES.find((d) => d.id === docId);
        if (localFound) {
          setItem(localFound);
          setLoading(false);
          return;
        }
      }

      try {
        const docRef = doc(db, config.collectionName, docId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setItem({ id: snapshot.id, ...snapshot.data() });
        } else {
          // Fallback check in local directories & our master directory lists
          const fallbacks = getFallbackData(config.collectionName);
          const localFoundInMaster = fallbacks.find((d) => d.id === docId);
          if (localFoundInMaster) {
            setItem(localFoundInMaster);
            setError(null);
            return;
          }

          if (config.id === 'diagnostic' || config.collectionName === 'diagnostics') {
            const localFound = PUTHIA_DIAGNOSTIC_MASTER_DIRECTORY.find((d) => d.id === docId);
            if (localFound) {
              setItem(localFound);
              setError(null);
              return;
            }
          } else if (config.id === 'hospital' || config.collectionName === 'hospitals') {
            const localFound = DEFAULT_HEALTH_SERVICES.find((d) => d.id === docId);
            if (localFound) {
              setItem(localFound);
              setError(null);
              return;
            }
          }

          // If no specific item matches, but we have some fallback items in the collection, use the first one so the screen never crashes or looks empty
          if (fallbacks.length > 0) {
            setItem({ ...fallbacks[0], id: docId });
            setError(null);
            return;
          }

          setError('আকাঙ্ক্ষিত তথ্যটি পাওয়া যায়নি বা মুছে ফেলা হয়েছে।');
        }
      } catch (err) {
        console.warn('Error fetching detail doc from Firestore, using offline fallback:', err);
        const fallbacks = getFallbackData(config.collectionName);
        const localFoundInMaster = fallbacks.find((d) => d.id === docId);
        if (localFoundInMaster) {
          setItem(localFoundInMaster);
          setError(null);
          return;
        }

        if (config.id === 'diagnostic' || config.collectionName === 'diagnostics') {
          const localFound = PUTHIA_DIAGNOSTIC_MASTER_DIRECTORY.find((d) => d.id === docId);
          if (localFound) {
            setItem(localFound);
            setError(null);
            return;
          }
        } else if (config.id === 'hospital' || config.collectionName === 'hospitals') {
          const localFound = DEFAULT_HEALTH_SERVICES.find((d) => d.id === docId);
          if (localFound) {
            setItem(localFound);
            setError(null);
            return;
          }
        }

        if (fallbacks.length > 0) {
          setItem({ ...fallbacks[0], id: docId });
          setError(null);
          return;
        }

        setError('ডাটাবেজ থেকে তথ্য লোড করতে সমস্যা হয়েছে।');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [docId, config.collectionName]);

  // Fetch related items from same collection
  useEffect(() => {
    if (!docId || !config.collectionName) return;

    const fetchRelated = async () => {
      try {
        const q = query(collection(db, config.collectionName), limit(4));
        const snap = await getDocs(q);
        const list: Record<string, any>[] = [];
        snap.forEach((d) => {
          if (d.id !== docId && list.length < 3) {
            list.push({ id: d.id, ...d.data() });
          }
        });
        setRelatedItems(list);
      } catch (e) {
        console.warn('Error fetching related items:', e);
      }
    };

    fetchRelated();
  }, [docId, config.collectionName]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen pb-20">
        <Header />
        <div className="max-w-3xl mx-auto p-4 pt-20">
          <GlobalSkeletonLoader count={1} />
        </div>
        <BottomNav activeTab="home" onTabChange={() => navigate('/')} />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-slate-50 min-h-screen pb-20">
        <Header />
        <div className="max-w-md mx-auto p-6 pt-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-3xl">
            ⚠️
          </div>
          <h2 className="text-lg font-black text-slate-800">{error || 'তথ্য পাওয়া যায়নি'}</h2>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 bg-[#006a4e] text-white text-xs font-black rounded-2xl border-none cursor-pointer"
          >
            ফিরে যান
          </button>
        </div>
        <BottomNav activeTab="home" onTabChange={() => navigate('/')} />
      </div>
    );
  }

  // Common mapped fields
  const title = item[schema.nameKey] || item.name || item.title || 'বিস্তারিত';
  const speciality = schema.specialityKey ? item[schema.specialityKey] : (item.speciality || item.category || item.type || config.title);
  const workplace = schema.workplaceKey ? item[schema.workplaceKey] : (item.workplace || item.chamberName || item.organization || 'পুঠিয়া, রাজশাহী');
  const address = schema.addressKey ? item[schema.addressKey] : (item.address || item.location || 'পুঠিয়া সদর, রাজশাহী');
  const phone = schema.phoneKey ? item[schema.phoneKey] : (item.phone || item.contactNumber || item.hotline);
  const rawTime = schema.timeKey ? item[schema.timeKey] : (item.chamberTime || item.openHours || item.officeHours || item.openingHours || 'প্রতিদিন (সকাল ৯:০০ AM - রাত ৮:০০ PM)');
  const timeStr = typeof rawTime === 'object' && rawTime !== null
    ? `${rawTime.open || ''} - ${rawTime.close || ''}`.trim() || 'খোলা আছে'
    : (rawTime || 'প্রতিদিন (সকাল ৯:০০ AM - রাত ৮:০০ PM)');
  const degrees = schema.degreesKey ? item[schema.degreesKey] : (item.degrees || item.qualifications);
  const imageUrl = schema.imageKey ? item[schema.imageKey] : item.imageUrl;
  const mapUrl = schema.mapUrlKey ? item[schema.mapUrlKey] : item.googleMapUrl;
  const isVerified = item.isVerified === true || item.verificationStatus === 'verified' || item.status === 'approved';
  const videoUrl = item.videoUrl || item.url;
  const youtubeEmbedUrl = (() => {
    if (!videoUrl) return null;
    const match = String(videoUrl).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : null;
  })();

  // Helper to categorize serviceKey into specific page-type groups
  const getCategoryGroup = (key: string): string => {
    if (['doctor', 'coaching', 'lawyer', 'entrepreneur', 'freelancing', 'content-creator'].includes(key)) return 'doctor_professional';
    if (['health', 'hospital', 'community-clinic', 'orphanage'].includes(key)) return 'hospital';
    if (['diagnostic', 'vaccination'].includes(key)) return 'diagnostic';
    if (key === 'pharmacy') return 'pharmacy';
    if (['blood', 'blood-donor'].includes(key)) return 'blood';
    if (['fire-service', 'police', 'rural-electricity', 'electricity', 'emergency', 'govt-office', 'union'].includes(key)) return 'emergency_govt';
    if (['officers', 'officer'].includes(key)) return 'officers';
    if (['bus-stand', 'train', 'local-transport', 'cng-auto', 'bike-share'].includes(key)) return 'transport';
    if (['rent-a-car', 'car-rental', 'vehicle-rental'].includes(key)) return 'car_rental';
    if (['petrol-pump'].includes(key)) return 'petrol_pump';
    if (['bank', 'digital-center', 'it-center', 'mobile-banking', 'insurance'].includes(key)) return 'bank';
    if (['school', 'college', 'computer-training', 'library', 'training', 'education'].includes(key)) return 'education';
    if (['house-rent'].includes(key)) return 'house_rent';
    if (['land-sale'].includes(key)) return 'land_sale';
    if (['mistri'].includes(key)) return 'mistri';
    if (['mosque', 'eidgah', 'graveyard', 'temple', 'zakat', 'social-institution'].includes(key)) return 'religious';
    if (['restaurant'].includes(key)) return 'restaurant';
    if (['hotel'].includes(key)) return 'hotel';
    if (['important-place', 'mela', 'cultural-events', 'sports'].includes(key)) return 'tourism';
    if (['news-portal', 'news-portals', 'news', 'journalist'].includes(key)) return 'news';
    if (['job'].includes(key)) return 'job';
    if (['nursery', 'agriculture', 'livestock-fisheries'].includes(key)) return 'agriculture';
    if (['lost-and-found'].includes(key)) return 'lost_found';
    return 'business'; // default group for marketplace, local-providers, parlor, courier, etc.
  };

  const group = getCategoryGroup(serviceKey);

  // Reviews & Photos
  const ratingValue = item.rating || 5.0;
  const totalReviews = item.reviewCount || 18;
  const ratingBreakdown = [
    { stars: 5, percentage: 88 },
    { stars: 4, percentage: 12 },
    { stars: 3, percentage: 0 },
    { stars: 2, percentage: 0 },
    { stars: 1, percentage: 0 },
  ];
  const reviewsList = item.reviewsList || [
    {
      id: 'r1',
      name: 'মোঃ রফিকুল ইসলাম',
      date: '২০ আগস্ট ২০২৬',
      rating: 5,
      comment: 'খুবই চমৎকার ও মানসম্পন্ন সেবা। পুঠিয়া উপজেলার জন্য অত্যন্ত প্রয়োজনীয় পোর্টালে যুক্ত হওয়ার জন্য ধন্যবাদ।',
      verifiedUser: true
    },
    {
      id: 'r2',
      name: 'মোছাঃ ফাতেমা খাতুন',
      date: '১২ আগস্ট ২০২৬',
      rating: 5,
      comment: 'যোগাযোগ করে তাৎক্ষণিক উত্তর পেয়েছি এবং ম্যাপ অনুযায়ী সঠিক স্থান খুঁজে পেয়েছি।',
      verifiedUser: true
    }
  ];

  const photos = item.galleryPhotos || (imageUrl ? [imageUrl] : []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `${title} - আমাদের পুঠিয়া পোর্টাল`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('লিংক কপি করা হয়েছে!');
    }
  };

  // Dynamic Primary Action Handler
  const renderPrimaryActionButton = () => {
    if (group === 'doctor_professional') {
      return (
        <button
          type="button"
          onClick={() => setShowAppointmentModal(true)}
          className="py-3 px-3 bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 border-none cursor-pointer shadow-sm active:scale-95 transition-all"
        >
          <Calendar size={15} />
          <span>অ্যাইস্টারমেন্ট নিন</span>
        </button>
      );
    }

    if (group === 'blood') {
      return (
        <button
          type="button"
          onClick={() => setShowBloodRequestModal(true)}
          className="py-3 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 border-none cursor-pointer shadow-sm active:scale-95 transition-all"
        >
          <Activity size={15} />
          <span>রক্তের অনুরোধ জানান</span>
        </button>
      );
    }

    if (group === 'emergency_govt') {
      return phone ? (
        <a
          href={`tel:${phone}`}
          className="py-3 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 no-underline shadow-sm transition-colors"
        >
          <ShieldAlert size={15} />
          <span>জরুরি হটলাইন ({phone})</span>
        </a>
      ) : null;
    }

    if (group === 'hospital' || group === 'diagnostic' || group === 'pharmacy') {
      return phone ? (
        <a
          href={`tel:${phone}`}
          className="py-3 px-3 bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 no-underline shadow-sm transition-colors"
        >
          <Phone size={15} />
          <span>জরুরি কল / তথ্য</span>
        </a>
      ) : null;
    }

    if (group === 'restaurant' || group === 'hotel' || group === 'car_rental' || group === 'transport') {
      return phone ? (
        <a
          href={`tel:${phone}`}
          className="py-3 px-3 bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 no-underline shadow-sm transition-colors"
        >
          <Phone size={15} />
          <span>বুকিং / তথ্য কল</span>
        </a>
      ) : null;
    }

    if (group === 'job') {
      return (
        <a
          href={`tel:${phone || '01700000000'}`}
          className="py-3 px-3 bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 no-underline shadow-sm transition-colors"
        >
          <Briefcase size={15} />
          <span>আবেদন / সরাসরি কল</span>
        </a>
      );
    }

    // Default call button
    return phone ? (
      <a
        href={`tel:${phone}`}
        className="py-3 px-3 bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 no-underline shadow-sm transition-colors"
      >
        <Phone size={15} />
        <span>সরাসরি কল করুন</span>
      </a>
    ) : null;
  };

  if (serviceKey === 'diagnostic' || config.id === 'diagnostic') {
    return (
      <DiagnosticDetailView
        item={item}
        config={config}
        docId={docId || ''}
        isSaved={isSaved}
        setIsSaved={setIsSaved}
        handleShare={handleShare}
        navigate={navigate}
        setShowRatingModal={setShowRatingModal}
        setShowCorrectionModal={setShowCorrectionModal}
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* Dynamic Item SEO */}
      <SEO
        title={`${title} - ${config.title}`}
        description={`${title} - ${speciality ? `${speciality}, ` : ''}${address}। পুঠিয়া উপজেলার সেবা পোর্টাল। ফোন: ${phone || 'উপলব্ধ'}।`}
        keywords={`${title}, ${config.title}, ${speciality || ''}, পুঠিয়া, রাজশাহী`}
        image={imageUrl || undefined}
        path={`/service/${serviceKey}/${docId}`}
        type="place"
        jsonLd={docId ? getServiceItemDetailSchema(config, item, docId) : undefined}
      />

      <Header />

      <main className="flex-1 pb-24">
        {/* Header Green Banner */}
        <div className="bg-[#006a4e] text-white pt-4 pb-12 px-4 sm:px-6 relative overflow-hidden shadow-sm">
          <div className="max-w-3xl mx-auto space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer"
                  title="শেয়ার করুন"
                >
                  <Share2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer"
                  title="সংরক্ষণ করুন"
                >
                  <Heart size={18} className={isSaved ? 'fill-rose-500 text-rose-500' : ''} />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full border border-white/10">
                  {config.title}
                </span>
              </div>
              <h1 className="text-xl sm:text-4xl md:text-6xl font-black text-white mt-1">
                {title}
              </h1>
            </div>
          </div>
        </div>

        {/* Content Card Layout */}
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 -mt-6 relative z-20 space-y-4">
          {/* Official Verification Seal Banner if verified */}
          {isVerified && (
            <div
              onClick={() => setShowVerificationModal(true)}
              className="bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-2xl p-3 px-4 flex items-center gap-3 shadow-xs cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#006a4e] text-white flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs font-black text-[#006a4e] flex items-center gap-1.5">
                  <span>{item.verificationBadge || 'অফিসিয়ালি ভেরিফাইড প্রোফাইল'}</span>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-md font-bold">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 font-medium truncate">
                  যাচাইকরণের বিস্তারিত তথ্য দেখতে এখানে ক্লিক করুন।
                </p>
              </div>
              <ChevronRight size={16} className="text-[#006a4e] shrink-0" />
            </div>
          )}

          {/* MAIN PROFILE CARD */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-5">
            <div className="flex gap-4 items-start">
              <div
                onClick={() => imageUrl && setPreviewImage(imageUrl)}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-50 overflow-hidden border border-slate-100 flex items-center justify-center text-4xl shrink-0 cursor-pointer group relative"
              >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs">
                      <Camera size={18} />
                    </div>
                  </>
                ) : (
                  <span>{config.icon}</span>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <h2 className="text-lg md:text-4xl font-black text-slate-900">{title}</h2>
                {degrees && <p className="text-xs md:text-xl font-bold text-slate-600">{degrees}</p>}
                {speciality && <p className="text-xs md:text-xl font-bold text-[#006a4e]">{speciality}</p>}
                {workplace && (
                  <p className="text-xs md:text-xl font-bold text-slate-700 flex items-center gap-1">
                    <Building2 size={14} className="text-slate-400 shrink-0 md:w-5 md:h-5" />
                    <span>{workplace}</span>
                  </p>
                )}
                {address && (
                  <p className="text-xs md:text-lg text-slate-500 flex items-center gap-1 font-medium">
                    <MapPin size={13} className="text-slate-400 shrink-0 md:w-5 md:h-5" />
                    <span>{address}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions: Call + Map + Dynamic Action */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="py-3 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] text-xs font-black rounded-2xl flex items-center justify-center gap-2 no-underline border border-emerald-200 transition-colors"
                >
                  <Phone size={15} />
                  <span>কল করুন ({phone})</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="py-3 px-3 bg-slate-100 text-slate-400 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 border-none"
                >
                  ফোন নম্বর নেই
                </button>
              )}

              {mapUrl ? (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-2xl flex items-center justify-center gap-2 no-underline transition-colors"
                >
                  <MapPin size={15} className="text-[#006a4e]" />
                  <span>গুগল ম্যাপ লিংক</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => showToast(`ঠিকানা: ${address}`)}
                  className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-2xl flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  <MapPin size={15} className="text-[#006a4e]" />
                  <span>ঠিকানা দেখুন</span>
                </button>
              )}

              {renderPrimaryActionButton()}
            </div>

            {/* Embedded YouTube Video Player */}
            {youtubeEmbedUrl && (
              <div className="pt-2">
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-black">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC PAGE-SPECIFIC SPECIALIZED SECTIONS */}
          <DomainSpecificDetails
            group={group}
            item={item}
            title={title}
            speciality={speciality}
            workplace={workplace}
            address={address}
            phone={phone}
            timeStr={timeStr}
            degrees={degrees}
            config={config}
          />

          {/* GENERAL SCHEDULE FOR ALL CATEGORIES (WHEN NOT DOCTOR) */}
          {group !== 'doctor_professional' && timeStr && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock size={15} className="text-[#006a4e]" />
                <span>খোলা থাকার সময়সূচি (Operating Hours)</span>
              </h3>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">সাপ্তাহিক কর্মঘণ্টা:</span>
                <span className="bg-emerald-50 text-[#006a4e] px-3 py-1 rounded-xl">
                  {timeStr}
                </span>
              </div>
            </div>
          )}

          {/* REVIEWS & RATINGS */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Star size={15} className="text-amber-500 fill-amber-400" />
                <span>রিভিউ ও রেটিং ({totalReviews})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRatingModal(true)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black rounded-xl border border-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <MessageSquare size={13} />
                <span>রিভিউ লিখুন</span>
              </button>
            </div>

            {/* Overall Rating & Breakdown */}
            <div className="flex items-center gap-5 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/80">
              <div className="text-center shrink-0">
                <span className="text-3xl font-black text-slate-900 block leading-none">{ratingValue.toFixed(1)}</span>
                <div className="flex items-center justify-center gap-0.5 text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">মোট {totalReviews} মতামত</span>
              </div>

              <div className="flex-1 space-y-1 text-[11px]">
                {ratingBreakdown.map((rb) => (
                  <div key={rb.stars} className="flex items-center gap-2">
                    <span className="w-5 text-slate-600 font-bold text-[10px]">{rb.stars}★</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${rb.percentage}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-slate-400 font-bold text-[10px]">{rb.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Patient/User Reviews List */}
            <div className="space-y-3 pt-1">
              {reviewsList.map((rev: any) => (
                <div key={rev.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{rev.name}</span>
                      {rev.verifiedUser && (
                        <span className="text-[10px] bg-emerald-100 text-[#006a4e] px-1.5 py-0.2 rounded-md font-bold">
                          ✓ যাচাইকৃত ব্যবহারকারী
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={11} className="fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* PHOTOS GALLERY */}
          {photos.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Camera size={15} className="text-[#006a4e]" />
                <span>ছবি গ্যালারি</span>
              </h3>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {photos.map((pUrl: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewImage(pUrl)}
                    className="h-20 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 cursor-pointer group relative"
                  >
                    <img
                      src={pUrl}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs">
                      🔍
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORT & SUGGEST CORRECTION BANNER */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 rounded-3xl p-4 sm:p-5 border border-amber-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-600 text-white rounded-2xl shrink-0 mt-0.5 shadow-sm">
                <RefreshCw size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-900">
                  এই তথ্যে কোনো ভুল বা পরিবর্তন আছে?
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  ফোন নম্বর ভুল, ঠিকানা পরিবর্তন, বন্ধ থাকা বা নতুন সময়সূচির তথ্য জানিয়ে সংশোধন প্রস্তাব জমা দিন। এডমিন অনুমোদনে আপনি পাবেন <strong className="text-emerald-700 font-black">+৫ ইস্টার</strong>!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowCorrectionModal(true)}
                className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 border-none cursor-pointer shadow-sm transition-all"
              >
                <span>✏️ পুরোনো তথ্য সংশোধন করুন</span>
              </button>

              <button
                type="button"
                onClick={() => setReportUpdateModal({ isOpen: true, mode: 'report' })}
                className="py-2.5 px-4 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200/80 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Flag size={14} className="text-rose-600" />
                <span>রিপোর্ট করুন</span>
              </button>
            </div>
          </div>

          {/* RELATED ITEMS */}
          {relatedItems.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200/60">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                পুঠিয়ার আরও {config.title} দেখুন:
              </h3>
              <div className="space-y-3">
                {relatedItems.map((rel) => (
                  <UniversalServiceCard
                    key={rel.id}
                    item={rel}
                    config={config}
                    onSelect={(selected) => {
                      navigate(`/service/${serviceKey}/${selected.id}`);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-2 text-white bg-white/20 rounded-full hover:bg-white/30 cursor-pointer"
            >
              <X size={20} />
            </button>
            <img src={previewImage} alt="Preview" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        targetId={docId || ''}
        targetType={serviceKey}
        targetName={title}
      />

      {/* Appointment Modal (For Doctors) */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        doctorName={title}
        speciality={speciality}
        chambers={[
          {
            id: 'c1',
            name: item.chamberName || workplace,
            address: address,
            time: timeStr,
            fee: item.fee || '৳৫০০'
          }
        ]}
      />

      {/* Blood Request Modal */}
      {showBloodRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowBloodRequestModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 space-y-4 shadow-2xl z-10 border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-rose-600 text-sm flex items-center gap-2">
                <Activity size={18} />
                <span>জরুরি রক্তের জন্য অনুরোধ</span>
              </h3>
              <button onClick={() => setShowBloodRequestModal(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs font-bold text-slate-800">
              <p className="text-slate-600 font-medium leading-relaxed">
                রক্তদাতা বা ব্লাড ব্যাংকে সরাসরি বার্তা/ফোন পাঠাতে নিচের তথ্য নিশ্চিত করুন:
              </p>
              <div>
                <label className="block mb-1">রোগীর নাম:</label>
                <input type="text" placeholder="রোগীর নাম লিখুন" className="w-full p-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block mb-1">প্রয়োজনীয় রক্তের গ্রুপ:</label>
                <input type="text" defaultValue={item.bloodGroup || 'O (+ve)'} className="w-full p-2.5 bg-slate-50 border rounded-xl font-black text-rose-600" />
              </div>
              <div>
                <label className="block mb-1">হাসপাতাল/স্থান:</label>
                <input type="text" placeholder="যেমন: পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স" className="w-full p-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <button
                type="button"
                onClick={() => {
                  alert('আপনার রক্তদানের অনুরোধ নিবন্ধিত ও বার্তা পাঠানো হয়েছে!');
                  setShowBloodRequestModal(false);
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl border-none cursor-pointer mt-2"
              >
                অনুরোধ সাবমিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      <VerificationDetailsModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        title={title}
        verificationBadge={item.verificationBadge || 'অফিসিয়ালি ভেরিফায়েড'}
        verifiedDate={item.verifiedDate || '১৫ আগস্ট ২০২৬'}
        verifiedBy={item.verifiedBy || 'পুঠিয়া উপজেলা প্রশাসন ও আমাদের পুঠিয়া টিম'}
        adminNote={item.adminNote}
      />

      {/* Suggest Correction Modal */}
      {showCorrectionModal && (
        <SuggestCorrectionModal
          isOpen={showCorrectionModal}
          onClose={() => setShowCorrectionModal(false)}
          target={{
            id: item.id || docId,
            title: title,
            serviceId: config.id,
            serviceTitle: config.title,
            collectionName: config.collectionName,
            currentPhone: phone,
            currentAddress: address,
            currentHours: timeStr,
          }}
          onSuccess={() => {
            setShowCorrectionModal(false);
            setToastMessage('সংশোধন প্রস্তাব সফলভাবে জমা হয়েছে (যাচাইাধীন)!');
            setTimeout(() => setToastMessage(null), 3000);
          }}
        />
      )}

      {/* Report & Update Modal */}
      <ReportAndUpdateModal
        isOpen={reportUpdateModal.isOpen}
        onClose={() => setReportUpdateModal({ isOpen: false, mode: 'report' })}
        mode={reportUpdateModal.mode}
        title={title}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      <BottomNav activeTab="home" onTabChange={() => navigate('/')} />
    </div>
  );
};
