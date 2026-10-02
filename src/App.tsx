import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OfflineManager } from "./components/OfflineManager";
import { PushNotificationListener } from "./components/PushNotificationListener";
import { CallModal } from "./components/call/CallModal";
import SEO from "./components/SEO";
import Skeleton from "./components/home/Skeleton";
import { seedSampleDataIfEmpty, prefetchCoreCollections } from "./api";
import GlobalFAB from "./components/home/GlobalFAB";
import { PwaInstallPrompt } from "./components/common/PwaInstallPrompt";
import ScrollProgressBar from "./components/ScrollProgressBar";

import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AccessibilityToolbar } from "./components/common/AccessibilityToolbar";

// Helper for resilient lazy loading that retries on fetch failure
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const pageKey = "page_reloaded_for_chunk_error";
    const attempts = 3;
    for (let i = 0; i < attempts; i++) {
      try {
        const res = await factory();
        sessionStorage.removeItem(pageKey);
        return res;
      } catch (err) {
        if (i < attempts - 1) {
          console.warn(`Dynamic import retry (${i + 1}/${attempts - 1})...`, err);
          await new Promise((r) => setTimeout(r, (i + 1) * 300));
        } else {
          console.error("Dynamic import final failure:", err);
          const hasReloaded = sessionStorage.getItem(pageKey);
          if (!hasReloaded) {
            sessionStorage.setItem(pageKey, "true");
            window.location.reload();
            return new Promise(() => {});
          }
          setTimeout(() => sessionStorage.removeItem(pageKey), 3000);
          throw err;
        }
      }
    }
    throw new Error("Failed to load module");
  });
}

// Lazy load components for optimization
const MemberCardPage = lazyWithRetry(() => import("./pages/modules/MemberCardPage"));
const AdvancedRewardPage = lazyWithRetry(() => import("./pages/modules/AdvancedRewardPage"));
const DiagnosticPage = lazyWithRetry(() => import("./pages/modules/Diagnostic"));
const VehicleRentalPage = lazyWithRetry(() => import("./pages/modules/VehicleRental"));
const BusStandsPage = lazyWithRetry(() => import("./pages/modules/BusStandsPage"));
const TrainsPage = lazyWithRetry(() => import("./pages/modules/TrainsPage"));
const EntrepreneursPage = lazyWithRetry(() => import("./pages/modules/EntrepreneursPage"));
const PublicProfilePage = lazyWithRetry(() => import("./pages/modules/PublicProfilePage"));
const NurseryPage = lazyWithRetry(() => import("./pages/modules/NurseryPage"));
const CourierPage = lazyWithRetry(() => import("./pages/modules/CourierPage"));
const ParlorPage = lazyWithRetry(() => import("./pages/modules/ParlorPage"));
const ContentCreatorsPage = lazyWithRetry(() => import("./pages/modules/ContentCreatorsPage"));
const RestaurantsPage = lazyWithRetry(() => import("./pages/modules/RestaurantsPage"));
import { DesktopSidebar } from "./components/home/DesktopSidebar";
import Home from "./components/home/Home";
const Login = lazyWithRetry(() => import("./components/auth/Login"));
const Register = lazyWithRetry(() => import("./components/auth/Register"));
const Profile = lazyWithRetry(() => import("./components/auth/Profile"));
const MyBusiness = lazyWithRetry(() => import("./components/user/MyBusiness"));
const BusinessForm = lazyWithRetry(() => import("./components/user/BusinessForm"));
const MyProducts = lazyWithRetry(() => import("./components/user/MyProducts"));
const ProductForm = lazyWithRetry(() => import("./components/user/ProductForm"));
const MyProperties = lazyWithRetry(() => import("./components/user/MyProperties"));
const PropertyForm = lazyWithRetry(() => import("./components/user/PropertyForm"));
const MyBookings = lazyWithRetry(() => import("./components/user/MyBookings"));
const Favorites = lazyWithRetry(() => import("./components/user/Favorites"));
const Notifications = lazyWithRetry(() => import("./components/user/Notifications"));
const NotificationsPage = lazyWithRetry(() => import("./pages/modules/NotificationsPage"));
const Settings = lazyWithRetry(() => import("./components/user/Settings"));
const UserPrivilegesPortal = lazyWithRetry(() => import("./components/user/UserPrivilegesPortal"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"));
const BirthRegistrationPage = lazyWithRetry(() => import("./pages/services/BirthRegistrationPage"));
const NIDPage = lazyWithRetry(() => import("./pages/services/NIDPage"));
const PassportPage = lazyWithRetry(() => import("./pages/services/PassportPage"));
const DrivingLicensePage = lazyWithRetry(() => import("./pages/services/DrivingLicensePage"));
const PoliceClearancePage = lazyWithRetry(() => import("./pages/services/PoliceClearancePage"));
const TradeLicensePage = lazyWithRetry(() => import("./pages/services/TradeLicensePage"));
const ETinPage = lazyWithRetry(() => import("./pages/services/ETinPage"));
const LandServicesPage = lazyWithRetry(() => import("./pages/services/LandServicesPage"));

import Dashboard from "./components/user/Dashboard";
const SuperAdminDashboard = lazyWithRetry(() => import("./components/admin/SuperAdminDashboard"));
const SuperAdminLogin = lazyWithRetry(() => import("./pages/admin/SuperAdminLogin"));
const ModeratorDashboard = lazyWithRetry(() => import("./pages/admin/ModeratorDashboard"));
const EditorDashboard = lazyWithRetry(() => import("./pages/admin/EditorDashboard"));
const MyReviews = lazyWithRetry(() => import("./components/user/MyReviews"));
import ProtectedRoute from "./components/auth/ProtectedRoute";
const Marketplace = lazyWithRetry(() => import("./pages/modules/Marketplace"));
const ReelsPage = lazyWithRetry(() => import("./pages/modules/Reels"));
import GenericSubMenuPage from "./pages/modules/GenericSubMenuPage";
import HouseRent from "./pages/modules/HouseRent";
import LandSale from "./pages/modules/LandSale";
import Tourism from "./pages/modules/Tourism";
import Events from "./pages/modules/Events";
import Notice from "./pages/modules/Notice";
import HealthServices from "./pages/modules/HealthServices";
import AmbulanceServices from "./pages/modules/AmbulanceServices";
import Agriculture from "./pages/modules/Agriculture";
import LivestockFisheries from "./pages/modules/LivestockFisheries";
import Jobs from "./pages/modules/Jobs";
import Training from "./pages/modules/Training";
import News from "./pages/modules/News";
import MelaPage from "./pages/modules/MelaPage";
import PhotoGallery from "./pages/modules/PhotoGallery";
import AlbumDetails from "./pages/modules/PhotoGallery/AlbumDetails";
import VideoGallery from "./pages/modules/VideoGallery";
import MediaGallery from "./pages/modules/MediaGallery";
import Hotels from "./pages/modules/Hotels";
import Business from "./pages/modules/Business";
import BusinessDashboard from "./pages/modules/BusinessDashboard";

// Admin Pages
import AdminRoute from "./components/admin/AdminRoute";
import ModeratorRoute from "./components/admin/ModeratorRoute";
import EditorRoute from "./components/admin/EditorRoute";
import { SuperAdminRoute } from "./components/admin/SuperAdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminDashboard"));
const AdminNotificationsPage = lazyWithRetry(() => import("./pages/admin/AdminNotificationsPage"));
const AdminOfflineSyncPage = lazyWithRetry(() => import("./pages/admin/AdminOfflineSyncPage"));
const AdminSearchEnginePage = lazyWithRetry(() => import("./pages/admin/AdminSearchEnginePage"));
const AdminAuditLogsPage = lazyWithRetry(() => import("./pages/admin/AdminAuditLogsPage"));
const UserManagement = lazyWithRetry(() => import("./components/admin/UserManagement"));
const AdminManagement = lazyWithRetry(() => import("./components/admin/AdminManagement"));
const RoleManagement = lazyWithRetry(() => import("./components/admin/RoleManagement"));
const ProfileManagementPage = lazyWithRetry(() => import("./pages/admin/ProfileManagement"));
const ServiceManagement = lazyWithRetry(() => import("./components/admin/ServiceManagement"));
const BusinessApproval = lazyWithRetry(() => import("./pages/admin/BusinessApproval"));
const PageManagement = lazyWithRetry(() => import("./pages/admin/PageManagement"));
const NoticeManagement = lazyWithRetry(() => import("./pages/admin/NoticeManagement"));
const AdminSettings = lazyWithRetry(() => import("./pages/admin/AdminSettings"));
const BloodDonorManagement = lazyWithRetry(() => import("./components/BloodDonorManagement"));
const BloodDonationPage = lazyWithRetry(() => import("./pages/modules/BloodDonationPage"));
const ServiceApplicationManagement = lazyWithRetry(() => import("./components/ServiceApplicationManagement"));
import NewsManagement from "./pages/admin/NewsManagement";
import MelaManagement from "./pages/admin/MelaManagement";
import EventManagement from "./pages/admin/EventManagement";
import TourismManagement from "./pages/admin/TourismManagement";
import ContentManagementPage from "./pages/admin/ContentManagementPage";
import GalleryManagement from "./pages/admin/GalleryManagement";
import { ProductApproval, HouseRentApproval, AdvertisementManagement } from "./pages/admin/Placeholders";
import HeroSliderManagement from "./components/admin/HeroSliderManagement";
import { MyProfile } from "./pages/admin/MyProfile";
import { EditProfile } from "./pages/admin/EditProfile";
import { ChangePassword } from "./pages/admin/ChangePassword";
import { LanguageSettings } from "./pages/admin/LanguageSettings";
import { Support } from "./pages/admin/Support";
import { AnalyticsView } from "./pages/admin/AnalyticsView";
import { EducationManager, AgricultureManager, HealthManager, JobsManager, AdministrationManager, NGOManager, MainMenuManager, WeatherSettings } from "./pages/admin/ModuleManagers";
import { CitizenDrawerManagement } from "./components/admin/CitizenDrawerManagement";
import SiteManagement from "./components/admin/SiteManagement";
const AddaModerationCenter = lazyWithRetry(() => import("./components/admin/AddaModerationCenter").then(m => ({ default: m.AddaModerationCenter })));
const AdminTrustSafetyHub = lazyWithRetry(() => import("./components/admin/AdminTrustSafetyHub").then(m => ({ default: m.AdminTrustSafetyHub })));
const CreatorMonetizationHub = lazyWithRetry(() => import("./components/monetization/CreatorMonetizationHub").then(m => ({ default: m.CreatorMonetizationHub })));
const AdminMonetizationDashboard = lazyWithRetry(() => import("./components/monetization/AdminMonetizationDashboard").then(m => ({ default: m.AdminMonetizationDashboard })));
const ReferralDashboard = lazyWithRetry(() => import("./components/referral/ReferralDashboard").then(m => ({ default: m.ReferralDashboard })));
import { SuspiciousLoginBanner } from "./components/common/SuspiciousLoginBanner";
import { UserAccountSecurityCenter } from "./components/common/UserAccountSecurityCenter";
import { GlobalPresenceTracker } from "./components/common/GlobalPresenceTracker";
const RealtimeUserPresencePage = lazyWithRetry(() => import("./pages/admin/RealtimeUserPresencePage"));

// Placeholder for other pages - in a real app these would be separate files
const EducationCareerHub = lazyWithRetry(() => import("./components/EducationCareerHub"));
const AllServicesPage = lazyWithRetry(() => import("./pages/modules/AllServicesPage"));
const ToolsPage = lazyWithRetry(() => import("./pages/modules/ToolsPage"));
const ResourcesHubPage = lazyWithRetry(() => import("./pages/modules/ResourcesHubPage"));
const DownloadsPage = lazyWithRetry(() => import("./pages/modules/DownloadsPage"));
const ApplicationFormsPage = lazyWithRetry(() => import("./pages/modules/ApplicationFormsPage"));
const GovernmentPDFPage = lazyWithRetry(() => import("./pages/modules/GovernmentPDFPage"));
const GuidelinesPage = lazyWithRetry(() => import("./pages/modules/GuidelinesPage"));
const SampleFormsPage = lazyWithRetry(() => import("./pages/modules/SampleFormsPage"));
const ComplaintPage = lazyWithRetry(() => import("./pages/modules/ComplaintPage"));
const ExclusiveFeaturesPage = lazyWithRetry(() => import("./pages/modules/ExclusiveFeaturesPage"));
const Administration = lazyWithRetry(() => import("./pages/modules/Administration"));
const NGOs = lazyWithRetry(() => import("./pages/modules/NGOs"));
const SocialInstitutions = lazyWithRetry(() => import("./pages/modules/SocialInstitutions"));
const Pharmacy = lazyWithRetry(() => import("./pages/modules/Pharmacy"));
const Doctors = lazyWithRetry(() => import("./pages/modules/Doctors"));
const Hospitals = lazyWithRetry(() => import("./pages/modules/Hospital"));
const Education = lazyWithRetry(() => import("./pages/modules/Education/index"));
const EducationDetailView = lazyWithRetry(() => import("./pages/modules/Education/EducationDetailView"));
const ServicePage = lazyWithRetry(() => import("./components/home/ServicePage"));
const EmergencyPage = lazyWithRetry(() => import("./pages/modules/EmergencyPage"));
const FireServices = lazyWithRetry(() => import("./pages/modules/FireServices"));
const PoliceServices = lazyWithRetry(() => import("./pages/modules/PoliceServices"));
const UpazilaIntroductionPage = lazyWithRetry(() => import("./pages/modules/UpazilaIntroductionPage"));
const HistoryPage = lazyWithRetry(() => import("./pages/modules/HistoryPage"));
const AboutUsPage = lazyWithRetry(() => import("./pages/modules/AboutUsPage"));
const GovtOfficesPage = lazyWithRetry(() => import("./pages/modules/GovtOfficesPage"));
const UnionsPage = lazyWithRetry(() => import("./pages/modules/UnionsPage"));
const SmartMapPage = lazyWithRetry(() => import("./pages/modules/SmartMapPage"));
const ImportantPlacesPage = lazyWithRetry(() => import("./pages/modules/ImportantPlacesPage"));
const ImportantPlaceDetailsPage = lazyWithRetry(() => import("./pages/modules/ImportantPlaceDetailsPage"));
const UnionDetailsPage = lazyWithRetry(() => import("./pages/modules/UnionDetailsPage"));
const CommunityPlatform = lazyWithRetry(() => import("./components/CommunityPlatform"));
const PrivacyPage = lazyWithRetry(() => import("./pages/modules/PrivacyPage"));
const TermsPage = lazyWithRetry(() => import("./pages/modules/TermsPage"));
const FAQPage = lazyWithRetry(() => import("./pages/modules/FAQPage"));
const SupportCenterPage = lazyWithRetry(() => import("./pages/modules/SupportCenter"));
const ReviewsPage = lazyWithRetry(() => import("./pages/modules/ReviewsPage"));
const VolunteerPage = lazyWithRetry(() => import("./pages/modules/VolunteerPage"));
const SportsPage = lazyWithRetry(() => import("./pages/modules/SportsPage"));
const CulturalEventsPage = lazyWithRetry(() => import("./pages/modules/CulturalEventsPage"));
const JournalistsPage = lazyWithRetry(() => import("./pages/modules/JournalistsPage"));
const NewsPortalsPage = lazyWithRetry(() => import("./pages/modules/NewsPortalsPage"));
const ITCentersPage = lazyWithRetry(() => import("./pages/modules/ITCentersPage"));
const CoachingPage = lazyWithRetry(() => import("./pages/modules/CoachingPage"));
const LibrariesPage = lazyWithRetry(() => import("./pages/modules/LibrariesPage"));
const ComputerTrainingPage = lazyWithRetry(() => import("./pages/modules/ComputerTrainingPage"));
const DigitalServiceCentersPage = lazyWithRetry(() => import("./pages/modules/DigitalServiceCentersPage"));
const RuralElectricityPage = lazyWithRetry(() => import("./pages/modules/RuralElectricityPage"));
const InternetServicePage = lazyWithRetry(() => import("./pages/modules/InternetServicePage"));
const LawyersPage = lazyWithRetry(() => import("./pages/modules/LawyersPage"));
const MistriPage = lazyWithRetry(() => import("./pages/modules/MistriPage"));
const LostAndFoundPage = lazyWithRetry(() => import("./pages/modules/LostAndFoundPage"));
const DiscussionPage = lazyWithRetry(() => import("./pages/modules/DiscussionPage"));
const FriendsPage = lazyWithRetry(() => import("./pages/modules/FriendsPage"));
const MemoriesPage = lazyWithRetry(() => import("./pages/modules/MemoriesPage"));
const MessagesPage = lazyWithRetry(() => import("./pages/modules/Messages"));
const AnnouncementPage = lazyWithRetry(() => import("./pages/modules/AnnouncementPage"));
const ContentPolicyPage = lazyWithRetry(() => import("./pages/modules/ContentPolicyPage"));
const MosquePage = lazyWithRetry(() => import("./pages/modules/MosquePage"));
const DownloadAppPage = lazyWithRetry(() => import("./pages/modules/DownloadAppPage"));
const ContactPage = lazyWithRetry(() => import("./pages/modules/ContactPage"));
const FeedbackPage = lazyWithRetry(() => import("./pages/modules/FeedbackPage"));
const DigitalIDPage = lazyWithRetry(() => import("./pages/modules/DigitalIDPage"));
const SmartReminderPage = lazyWithRetry(() => import("./pages/modules/SmartReminderPage"));
const EDocumentVaultPage = lazyWithRetry(() => import("./pages/modules/EDocumentVaultPage"));
const LocalServiceProvidersPage = lazyWithRetry(() => import("./pages/modules/LocalServiceProvidersPage"));
const NotificationCenterPage = lazyWithRetry(() => import("./pages/modules/NotificationCenterPage"));
const BookmarksPage = lazyWithRetry(() => import("./pages/modules/BookmarksPage"));
const VoteAssistantPage = lazyWithRetry(() => import("./pages/modules/VoteAssistantPage"));
const SafeGuidePage = lazyWithRetry(() => import("./pages/modules/SafeGuidePage"));
const CommunityBoardPage = lazyWithRetry(() => import("./pages/modules/CommunityBoardPage"));
const SpecialOffersPage = lazyWithRetry(() => import("./pages/modules/SpecialOffersPage"));
const AdAdvertiserDashboard = lazyWithRetry(() => import("./pages/modules/AdAdvertiserDashboard"));
const LiveSupportPage = lazyWithRetry(() => import("./pages/modules/LiveSupportPage"));
const AccountSecurityPage = lazyWithRetry(() => import("./pages/modules/AccountSecurityPage"));
const VaccinationPage = lazyWithRetry(() => import("./pages/modules/VaccinationPage"));
const BankingFinancePage = lazyWithRetry(() => import("./pages/modules/BankingFinancePage"));
const InsurancePage = lazyWithRetry(() => import("./pages/modules/InsurancePage"));
const OfficersPage = lazyWithRetry(() => import("./pages/modules/OfficersPage"));
const EidgahPage = lazyWithRetry(() => import("./pages/modules/EidgahPage"));
const OrphanagePage = lazyWithRetry(() => import("./pages/modules/OrphanagePage"));
const ZakatPage = lazyWithRetry(() => import("./pages/modules/ZakatPage"));
const CommunityClinicPage = lazyWithRetry(() => import("./pages/modules/CommunityClinicPage"));
const GraveyardPage = lazyWithRetry(() => import("./pages/modules/GraveyardPage"));
const TemplePage = lazyWithRetry(() => import("./pages/modules/TemplePage"));
const CngAutoPage = lazyWithRetry(() => import("./pages/modules/CngAutoPage"));
const LocalTransportPage = lazyWithRetry(() => import("./pages/modules/LocalTransportPage"));
const BikeSharePage = lazyWithRetry(() => import("./pages/modules/BikeSharePage"));
const PetrolPumpPage = lazyWithRetry(() => import("./pages/modules/PetrolPumpPage"));
const FreelancingPage = lazyWithRetry(() => import("./pages/modules/FreelancingPage"));
const SitemapPage = lazyWithRetry(() => import("./pages/modules/SitemapPage"));
const AdminCommandCenter = lazyWithRetry(() => import("./pages/modules/AdminCommandCenter"));
const BankingFinance = lazyWithRetry(() => import("./components/BankingFinance").then(m => ({ default: m.BankingFinance })));

import { ProgressiveModuleSkeleton } from "./components/common/ProgressiveModuleSkeleton";
import { initGlobalHapticFeedback } from "./utils/hapticFeedback";

const LoadingFallback = () => <ProgressiveModuleSkeleton />;

import ErrorBoundary from "./components/home/ErrorBoundary";
import ReloadPrompt from "./components/pwa/ReloadPrompt";
import PWAInstall from "./components/pwa/PWAInstall";
import SiteReloading from "./components/SiteReloading";
import AppLoading from "./components/AppLoading";
import { AnalyticsTracker } from "./components/AnalyticsTracker";
import { SiteSettingsProvider, useSiteSettings } from "./context/SiteSettingsContext";
import MaintenanceModeScreen from "./components/MaintenanceModeScreen";
import { useAuth } from "./contexts/AuthContext";
import { AutoReturnTimer } from "./components/home/AutoReturnTimer";
import { EmergencyOneTap } from "./components/common/EmergencyOneTap";

import { Toaster } from "sonner";
import NotFound from "./components/common/NotFound";
import { AnimatePresence, motion } from "motion/react";
import { useLocation } from "react-router-dom";
import { UniversalAddModal } from "./components/common/UniversalAddModal";

import { ServiceDirectoryTemplate } from "./components/common/MasterServiceTemplate/ServiceDirectoryTemplate";
import { ServiceDetailTemplate } from "./components/common/MasterServiceTemplate/ServiceDetailTemplate";
import { UniversalAdminManager } from "./components/common/MasterServiceTemplate/UniversalAdminManager";
import { MySubmissionsManager } from "./components/common/MasterServiceTemplate/MySubmissionsManager";

const MainAppContent = () => {
  const { settings, loading } = useSiteSettings();
  const { userProfile } = useAuth();
  const location = useLocation();
  const [isUniversalAddOpen, setIsUniversalAddOpen] = React.useState(false);
  const [isSecurityCenterOpen, setIsSecurityCenterOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  useEffect(() => {
    const handleOpenAddModal = () => {
      setIsUniversalAddOpen(true);
    };
    const handleOpenSecurity = () => {
      setIsSecurityCenterOpen(true);
    };
    window.addEventListener("open-universal-add", handleOpenAddModal);
    window.addEventListener("open-security-center", handleOpenSecurity);
    return () => {
      window.removeEventListener("open-universal-add", handleOpenAddModal);
      window.removeEventListener("open-security-center", handleOpenSecurity);
    };
  }, []);
  
  useEffect(() => {
    sessionStorage.removeItem("page_reloaded_for_chunk_error");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Capture URL referral code if present
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    if (refParam) {
      localStorage.setItem("adda_ref_code", refParam.trim().toUpperCase());
    }
  }, [location.pathname]);

  useEffect(() => {
    if (settings?.themeColor) {
      document.documentElement.setAttribute("data-theme", settings.themeColor);
    } else {
      document.documentElement.setAttribute("data-theme", "emerald");
    }
  }, [settings?.themeColor]);

  const isAdminRoute = location.pathname.startsWith("/super-admin") || 
                       location.pathname.startsWith("/admin") ||
                       location.pathname.startsWith("/superadmin");

  if (loading && !isAdminRoute) {
    return <AppLoading />;
  }

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  if (settings?.isMaintenanceMode && !isAdmin) {
    return <MaintenanceModeScreen />;
  }

  return (
    <div className="flex w-full min-h-screen bg-slate-50/20">
      <DesktopSidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <EmergencyOneTap />
        <Toaster position="top-center" richColors />
        <ScrollProgressBar />
        <AnalyticsTracker />
        <GlobalPresenceTracker />
        <AutoReturnTimer />
        <ErrorBoundary>
          <OfflineManager>
            <SEO />
            <PushNotificationListener />
            <ReloadPrompt />
            <PWAInstall />
            <SuspiciousLoginBanner onOpenSecurityCenter={() => setIsSecurityCenterOpen(true)} />
            <Suspense fallback={<LoadingFallback />}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-full max-w-7xl mx-auto overflow-x-clip flex flex-col flex-1 h-full"
                >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />

                {/* Master Auto-Generated Service Directory Routes */}
                <Route path="/service/:serviceKey" element={<ServiceDirectoryTemplate />} />
                <Route path="/service/:serviceKey/:id" element={<ServiceDetailTemplate />} />
                <Route path="/admin/services" element={<AdminRoute><UniversalAdminManager /></AdminRoute>} />
                <Route path="/admin/verification" element={<AdminRoute><UniversalAdminManager /></AdminRoute>} />
                <Route path="/admin/verification-system" element={<AdminRoute><UniversalAdminManager /></AdminRoute>} />
                <Route path="/profile/:userId" element={<PublicProfilePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/my-submissions" element={<ProtectedRoute><Dashboard><MySubmissionsManager /></Dashboard></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Dashboard><Profile /></Dashboard></ProtectedRoute>} />
                <Route path="/my-business" element={<ProtectedRoute><Dashboard><MyBusiness /></Dashboard></ProtectedRoute>} />
                <Route path="/add-business" element={<ProtectedRoute><Dashboard><BusinessForm /></Dashboard></ProtectedRoute>} />
                <Route path="/edit-business/:id" element={<ProtectedRoute><Dashboard><BusinessForm /></Dashboard></ProtectedRoute>} />
                <Route path="/my-products" element={<ProtectedRoute><Dashboard><MyProducts /></Dashboard></ProtectedRoute>} />
                <Route path="/add-product" element={<ProtectedRoute><Dashboard><ProductForm /></Dashboard></ProtectedRoute>} />
                <Route path="/edit-product/:id" element={<ProtectedRoute><Dashboard><ProductForm /></Dashboard></ProtectedRoute>} />
                <Route path="/my-properties" element={<ProtectedRoute><Dashboard><MyProperties /></Dashboard></ProtectedRoute>} />
                <Route path="/add-property" element={<ProtectedRoute><Dashboard><PropertyForm /></Dashboard></ProtectedRoute>} />
                <Route path="/edit-property/:id" element={<ProtectedRoute><Dashboard><PropertyForm /></Dashboard></ProtectedRoute>} />
                <Route path="/my-bookings" element={<ProtectedRoute><Dashboard><MyBookings /></Dashboard></ProtectedRoute>} />
                <Route path="/user-privileges" element={<ProtectedRoute><Dashboard><UserPrivilegesPortal /></Dashboard></ProtectedRoute>} />
                <Route path="/my-applications" element={<ProtectedRoute><Dashboard><UserPrivilegesPortal initialTab="applications" /></Dashboard></ProtectedRoute>} />
                <Route path="/my-downloads" element={<ProtectedRoute><Dashboard><UserPrivilegesPortal initialTab="downloads" /></Dashboard></ProtectedRoute>} />
                <Route path="/my-bookmarks" element={<ProtectedRoute><Dashboard><UserPrivilegesPortal initialTab="bookmarks" /></Dashboard></ProtectedRoute>} />
                <Route path="/my-complaints" element={<ProtectedRoute><Dashboard><UserPrivilegesPortal initialTab="complaints" /></Dashboard></ProtectedRoute>} />
                <Route path="/my-reviews" element={<ProtectedRoute><Dashboard><UserPrivilegesPortal initialTab="reviews" /></Dashboard></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Dashboard><Favorites /></Dashboard></ProtectedRoute>} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Dashboard><Settings /></Dashboard></ProtectedRoute>} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/reels" element={<ReelsPage />} />
                <Route path="/house-rent" element={<HouseRent />} />
                <Route path="/land-sale" element={<LandSale />} />
                <Route path="/health" element={<HealthServices />} />
                <Route path="/education" element={<Education />} />
                <Route path="/education/:subpage" element={<EducationDetailView />} />
                <Route path="/agriculture" element={<Agriculture />} />
                <Route path="/livestock-fisheries" element={<LivestockFisheries />} />
                <Route path="/tourism" element={<Tourism />} />
                <Route path="/tourism/:slug" element={<Tourism />} />
                <Route path="/tourist" element={<Tourism />} />
                <Route path="/tourist/:slug" element={<Tourism />} />
                <Route path="/tourist-spots" element={<Tourism />} />
                <Route path="/sightseeing" element={<Tourism />} />
                <Route path="/events" element={<Events />} />
                <Route path="/cultural-events" element={<CulturalEventsPage />} />
                <Route path="/journalists" element={<JournalistsPage />} />
                <Route path="/news-portals" element={<NewsPortalsPage />} />
                <Route path="/it-centers" element={<ITCentersPage />} />
                <Route path="/coaching" element={<CoachingPage />} />
                <Route path="/libraries" element={<LibrariesPage />} />
                <Route path="/library" element={<LibrariesPage />} />
                <Route path="/computer-training" element={<ComputerTrainingPage />} />
                <Route path="/digital-services" element={<DigitalServiceCentersPage />} />
                <Route path="/rural-electricity" element={<RuralElectricityPage />} />
                <Route path="/internet-service" element={<InternetServicePage />} />
                <Route path="/internet" element={<InternetServicePage />} />
                <Route path="/lawyers" element={<LawyersPage />} />
                <Route path="/mistri" element={<MistriPage />} />
                <Route path="/mistri/:slug" element={<MistriPage />} />
                <Route path="/mistris" element={<MistriPage />} />
                <Route path="/mistris/:slug" element={<MistriPage />} />
                <Route path="/sports" element={<SportsPage />} />
                <Route path="/news" element={<News />} />
                <Route path="/mela" element={<MelaPage />} />
                <Route path="/services/birth-reg" element={<BirthRegistrationPage />} />
                <Route path="/services/nid" element={<NIDPage />} />
                <Route path="/services/passport" element={<PassportPage />} />
                <Route path="/services/driving-license" element={<DrivingLicensePage />} />
                <Route path="/services/police-clearance" element={<PoliceClearancePage />} />
                <Route path="/services/trade-license" element={<TradeLicensePage />} />
                <Route path="/services/etin" element={<ETinPage />} />
                <Route path="/services/land" element={<LandServicesPage />} />
                <Route path="/land/:category" element={<LandServicesPage />} />
                <Route path="/photo-gallery" element={<PhotoGallery />} />
                <Route path="/photo-gallery/:id" element={<AlbumDetails />} />
                <Route path="/video-gallery" element={<VideoGallery />} />
                <Route path="/media-gallery" element={<MediaGallery />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/hotel" element={<Hotels />} />
                <Route path="/resorts" element={<Hotels />} />
                <Route path="/resort" element={<Hotels />} />
                <Route path="/business" element={<Business />} />
                <Route path="/verified-business" element={<Business />} />
                <Route path="/verified-businesses" element={<Business />} />
                <Route path="/verified" element={<Business />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurant" element={<RestaurantsPage />} />
                <Route path="/parlor" element={<ParlorPage />} />
                <Route path="/parlors" element={<ParlorPage />} />
                <Route path="/salon" element={<ParlorPage />} />
                <Route path="/salons" element={<ParlorPage />} />
                <Route path="/nursery" element={<NurseryPage />} />
                <Route path="/nurseries" element={<NurseryPage />} />
                <Route path="/electricity" element={<RuralElectricityPage />} />
                <Route path="/power-office" element={<RuralElectricityPage />} />
                <Route path="/rewards" element={<AdvancedRewardPage />} />
                <Route path="/reward-system" element={<AdvancedRewardPage />} />
                <Route path="/leaderboard" element={<AdvancedRewardPage />} />
                <Route path="/diagnostic" element={<DiagnosticPage />} />
                <Route path="/diagnostic/:slug" element={<DiagnosticPage />} />
                <Route path="/diagnostics" element={<DiagnosticPage />} />
                <Route path="/diagnostics/:slug" element={<DiagnosticPage />} />
                <Route path="/diagnostic-center" element={<DiagnosticPage />} />
                <Route path="/diagnostic-centers" element={<DiagnosticPage />} />
                <Route path="/vehicle-rental" element={<VehicleRentalPage />} />
                <Route path="/vehicle-rentals" element={<VehicleRentalPage />} />
                <Route path="/vehicle-rent" element={<VehicleRentalPage />} />
                <Route path="/car-rental" element={<VehicleRentalPage />} />
                <Route path="/community-clinic" element={<CommunityClinicPage />} />
                <Route path="/community-clinics" element={<CommunityClinicPage />} />
                <Route path="/vaccination" element={<VaccinationPage />} />
                <Route path="/vaccine" element={<VaccinationPage />} />
                <Route path="/fire" element={<FireServices />} />
                <Route path="/fire/:slug" element={<FireServices />} />
                <Route path="/fire-station" element={<FireServices />} />
                <Route path="/fire-stations" element={<FireServices />} />
                <Route path="/fire-services" element={<FireServices />} />
                <Route path="/fire-services/:slug" element={<FireServices />} />
                <Route path="/fire-service" element={<FireServices />} />
                <Route path="/police" element={<PoliceServices />} />
                <Route path="/police/:slug" element={<PoliceServices />} />
                <Route path="/police-station" element={<PoliceServices />} />
                <Route path="/police-stations" element={<PoliceServices />} />
                <Route path="/police-services" element={<PoliceServices />} />
                <Route path="/thana" element={<PoliceServices />} />
                <Route path="/thana/:slug" element={<PoliceServices />} />
                <Route path="/thana-police" element={<PoliceServices />} />
                <Route path="/bus-stands" element={<BusStandsPage />} />
                <Route path="/bus-stands/:slug" element={<BusStandsPage />} />
                <Route path="/bus-stand" element={<BusStandsPage />} />
                <Route path="/bus-terminal" element={<BusStandsPage />} />
                <Route path="/bus-counters" element={<BusStandsPage />} />
                <Route path="/bus" element={<ServicePage title="বাসের সময়সূচি" type="transport" />} />
                <Route path="/train" element={<TrainsPage />} />
                <Route path="/entrepreneurs" element={<EntrepreneursPage />} />
                <Route path="/entrepreneurs/:slug" element={<EntrepreneursPage />} />
                <Route path="/entrepreneur" element={<EntrepreneursPage />} />
                <Route path="/trains" element={<TrainsPage />} />
                <Route path="/trains/:slug" element={<TrainsPage />} />
                <Route path="/railway-stations" element={<TrainsPage />} />
                <Route path="/railway-stations/:slug" element={<TrainsPage />} />
                <Route path="/railway-station" element={<TrainsPage />} />
                <Route path="/courier" element={<CourierPage />} />
                <Route path="/couriers" element={<CourierPage />} />
                <Route path="/matrimony" element={<CommunityPlatform />} />
                <Route path="/mosques" element={<MosquePage />} />
                <Route path="/mosque" element={<MosquePage />} />
                <Route path="/content-creators" element={<ContentCreatorsPage />} />
                <Route path="/content-creator" element={<ContentCreatorsPage />} />
                <Route path="/technology" element={<DigitalServiceCentersPage />} />
                <Route path="/tech-services" element={<DigitalServiceCentersPage />} />
                <Route path="/teachers" element={<Education />} />
                <Route path="/business/dashboard" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/training" element={<Training />} />
                <Route path="/notice" element={<Notice />} />
                <Route path="/notices" element={<Notice />} />
                <Route path="/notice-board" element={<Notice />} />
                <Route path="/notifications" element={<NotificationCenterPage />} />
                <Route path="/notification-center" element={<NotificationCenterPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/saved" element={<BookmarksPage />} />
                <Route path="/my-saved" element={<BookmarksPage />} />
                <Route path="/my-bookmarks" element={<BookmarksPage />} />
                <Route path="/vote-assistant" element={<VoteAssistantPage />} />
                <Route path="/voter-info" element={<VoteAssistantPage />} />
                <Route path="/safe-guide" element={<SafeGuidePage />} />
                <Route path="/cyber-security" element={<SafeGuidePage />} />
                <Route path="/community-board" element={<CommunityBoardPage />} />
                <Route path="/local-discussion" element={<CommunityBoardPage />} />
                <Route path="/special-offers" element={<SpecialOffersPage />} />
                <Route path="/monetization" element={<ProtectedRoute><CreatorMonetizationHub /></ProtectedRoute>} />
                <Route path="/creator-monetization" element={<ProtectedRoute><CreatorMonetizationHub /></ProtectedRoute>} />
                <Route path="/creator-hub" element={<ProtectedRoute><CreatorMonetizationHub /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><CreatorMonetizationHub /></ProtectedRoute>} />
                <Route path="/services/add" element={<Navigate to="/my-submissions" replace />} />
                <Route path="/referral" element={<ProtectedRoute><ReferralDashboard /></ProtectedRoute>} />
                <Route path="/invite" element={<ProtectedRoute><ReferralDashboard /></ProtectedRoute>} />
                <Route path="/ref" element={<ProtectedRoute><ReferralDashboard /></ProtectedRoute>} />
                <Route path="/advertiser-dashboard" element={<AdAdvertiserDashboard />} />
                <Route path="/ads/dashboard" element={<AdAdvertiserDashboard />} />
                <Route path="/discounts" element={<SpecialOffersPage />} />
                <Route path="/coupons" element={<SpecialOffersPage />} />
                <Route path="/offers" element={<SpecialOffersPage />} />
                <Route path="/live-support" element={<LiveSupportPage />} />
                <Route path="/admin-chat" element={<LiveSupportPage />} />
                <Route path="/support-ticket" element={<LiveSupportPage />} />
                <Route path="/account-security" element={<AccountSecurityPage />} />
                <Route path="/privacy-settings" element={<AccountSecurityPage />} />
                <Route path="/login-history" element={<AccountSecurityPage />} />
                <Route path="/active-devices" element={<AccountSecurityPage />} />
                <Route path="/change-password" element={<AccountSecurityPage />} />
                <Route path="/two-factor" element={<AccountSecurityPage />} />
                <Route path="/otp" element={<AccountSecurityPage />} />
                <Route path="/services" element={<AllServicesPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/resources" element={<ResourcesHubPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
                <Route path="/e-document-vault" element={<EDocumentVaultPage />} />
                <Route path="/downloads/vault" element={<EDocumentVaultPage />} />
                <Route path="/downloads/forms" element={<ApplicationFormsPage />} />
                <Route path="/downloads/pdf" element={<GovernmentPDFPage />} />
                <Route path="/downloads/guidelines" element={<GuidelinesPage />} />
                <Route path="/smart-guide" element={<GuidelinesPage />} />
                <Route path="/guidelines" element={<GuidelinesPage />} />
                <Route path="/guide" element={<GuidelinesPage />} />
                <Route path="/downloads/samples" element={<SampleFormsPage />} />
                <Route path="/complaint" element={<ComplaintPage />} />
                <Route path="/exclusive-features" element={<ExclusiveFeaturesPage />} />
                <Route path="/rewards" element={<AdvancedRewardPage />} />
                <Route path="/reward-system" element={<AdvancedRewardPage />} />
                <Route path="/leaderboard" element={<AdvancedRewardPage />} />
                <Route path="/digital-id" element={<DigitalIDPage />} />
                <Route path="/member-card" element={<MemberCardPage />} />
                <Route path="/my-member-card" element={<MemberCardPage />} />
                <Route path="/reminder" element={<SmartReminderPage />} />
                <Route path="/smart-reminder" element={<SmartReminderPage />} />
                <Route path="/local-services" element={<LocalServiceProvidersPage />} />
                <Route path="/local-providers" element={<LocalServiceProvidersPage />} />
                <Route path="/reloading" element={<SiteReloading />} />
                <Route path="/education-hub" element={<EducationCareerHub />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/emergency-services" element={<EmergencyPage />} />
                <Route path="/emergency/:slug" element={<EmergencyPage />} />
                <Route path="/ambulance-service" element={<EmergencyPage />} />
                <Route path="/administration" element={<Administration />} />
                <Route path="/social" element={<SocialInstitutions />} />
                <Route path="/pharmacy" element={<Pharmacy />} />
                <Route path="/pharmacies" element={<Pharmacy />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/doctors/:slug" element={<Doctors />} />
                <Route path="/doctor" element={<Doctors />} />
                <Route path="/doctor/:slug" element={<Doctors />} />
                <Route path="/lawyers" element={<LawyersPage />} />
                <Route path="/lawyers/:slug" element={<LawyersPage />} />
                <Route path="/lawyer" element={<LawyersPage />} />
                <Route path="/lawyer/:slug" element={<LawyersPage />} />
                <Route path="/advocate" element={<LawyersPage />} />
                <Route path="/legal-aid" element={<LawyersPage />} />
                <Route path="/hospitals" element={<Hospitals />} />
                <Route path="/hospitals/:slug" element={<Hospitals />} />
                <Route path="/hospital" element={<Hospitals />} />
                <Route path="/hospital/:slug" element={<Hospitals />} />
                <Route path="/blood-donor" element={<BloodDonationPage />} />
                <Route path="/blood" element={<BloodDonationPage />} />
                <Route path="/blood-donation" element={<BloodDonationPage />} />
                <Route path="/blood-donors" element={<BloodDonationPage />} />
                <Route path="/emergency-blood" element={<BloodDonationPage />} />
                <Route path="/blood-bank" element={<BloodDonationPage />} />
                <Route path="/finance" element={<ServicePage title="ব্যাংক ও আর্থিক সেবা" type="finance" />} />
                <Route path="/finance/tax" element={<ServicePage title="ব্যাংক ও আর্থিক সেবা" type="finance" initialCategory="tax" />} />
                <Route path="/finance/vat" element={<ServicePage title="ব্যাংক ও আর্থিক সেবা" type="finance" initialCategory="vat" />} />
                <Route path="/finance/bank" element={<BankingFinancePage />} />
                <Route path="/banks" element={<BankingFinancePage />} />
                <Route path="/all-banks" element={<BankingFinancePage />} />
                <Route path="/bank" element={<BankingFinancePage />} />
                <Route path="/insurance" element={<InsurancePage />} />
                <Route path="/finance/mobile-banking" element={<ServicePage title="ব্যাংক ও আর্থিক সেবা" type="finance" initialCategory="mobile-banking" />} />
                <Route path="/ngo" element={<NGOs />} />
                <Route path="/ngos" element={<NGOs />} />
                <Route path="/orphanages" element={<OrphanagePage />} />
                <Route path="/orphanage" element={<OrphanagePage />} />
                <Route path="/zakat" element={<ZakatPage />} />
                <Route path="/volunteers" element={<VolunteerPage />} />
                <Route path="/lost-and-found" element={<LostAndFoundPage />} />
                <Route path="/career" element={<Jobs />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/govt-jobs" element={<Jobs initialType="government" />} />
                <Route path="/private-jobs" element={<Jobs initialType="private" />} />
                <Route path="/job-notices" element={<Jobs initialType="notice" />} />
                <Route path="/job-circulars" element={<Jobs initialType="notice" />} />
                <Route path="/freelancing" element={<FreelancingPage />} />
                <Route path="/officers" element={<OfficersPage />} />
                <Route path="/officer" element={<OfficersPage />} />
                <Route path="/officers-staff" element={<OfficersPage />} />
                <Route path="/eidgah" element={<EidgahPage />} />
                <Route path="/graveyard" element={<GraveyardPage />} />
                <Route path="/temple" element={<TemplePage />} />
                <Route path="/church" element={<SocialInstitutions />} />
                <Route path="/religious" element={<SocialInstitutions />} />
                <Route path="/transport" element={<ServicePage title="পরিবহন তথ্য" type="transport" />} />
                <Route path="/cng-auto" element={<CngAutoPage />} />
                <Route path="/local-transport" element={<LocalTransportPage />} />
                <Route path="/ride-share" element={<BikeSharePage />} />
                <Route path="/bike-share" element={<BikeSharePage />} />
                <Route path="/petrol-pump" element={<PetrolPumpPage />} />
                <Route path="/community" element={<CommunityPlatform />} />
                <Route path="/upazila-intro" element={<UpazilaIntroductionPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/sitemap" element={<SitemapPage />} />
                <Route path="/sitemap.xml" element={<SitemapPage />} />
                <Route path="/command-center" element={<AdminCommandCenter />} />
                <Route path="/admin/command-center" element={<AdminCommandCenter />} />
                <Route path="/faq" element={<SupportCenterPage initialTab="faq" />} />
                <Route path="/volunteer" element={<VolunteerPage />} />
                <Route path="/lost-found" element={<LostAndFoundPage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/discussion" element={<Navigate to="/adda" replace />} />
                <Route path="/discussion/memories" element={<Navigate to="/adda/memories" replace />} />
                <Route path="/discussion/post/:id" element={<Navigate to="/adda" replace />} />
                <Route path="/adda" element={<DiscussionPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/adda/friends" element={<FriendsPage />} />
                <Route path="/memories" element={<MemoriesPage />} />
                <Route path="/adda/memories" element={<MemoriesPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/adda/post/:id" element={<DiscussionPage />} />
                <Route path="/announcements" element={<AnnouncementPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/content-policy" element={<ContentPolicyPage />} />
                <Route path="/download" element={<DownloadAppPage />} />
                <Route path="/support" element={<SupportCenterPage />} />
                <Route path="/help" element={<SupportCenterPage />} />
                <Route path="/helpline" element={<SupportCenterPage initialTab="helpline" />} />
                <Route path="/support-tickets" element={<SupportCenterPage initialTab="ticket" />} />
                <Route path="/contact" element={<SupportCenterPage initialTab="contact" />} />
                <Route path="/apps" element={<SupportCenterPage initialTab="apps" />} />
                <Route path="/video-guide" element={<SupportCenterPage initialTab="video" />} />
                <Route path="/support-center" element={<SupportCenterPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/offices" element={<GovtOfficesPage />} />
                <Route path="/govt-offices" element={<GovtOfficesPage />} />
                <Route path="/govt-office" element={<GovtOfficesPage />} />
                <Route path="/unions" element={<UnionsPage />} />
                <Route path="/unions/:id" element={<UnionDetailsPage />} />
                <Route path="/smart-map" element={<SmartMapPage />} />
                <Route path="/important-places" element={<ImportantPlacesPage />} />
                <Route path="/important-places/:id" element={<ImportantPlaceDetailsPage />} />
                <Route path="/ambulance" element={<AmbulanceServices />} />
                <Route path="/p/ambulance" element={<AmbulanceServices />} />
                <Route path="/p/:slug" element={<GenericSubMenuPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="realtime-users" element={<RealtimeUserPresencePage />} />
                  <Route path="active-users" element={<RealtimeUserPresencePage />} />
                  <Route path="presence" element={<RealtimeUserPresencePage />} />
                  <Route path="moderation" element={<AddaModerationCenter />} />
                  <Route path="reports-hub" element={<AddaModerationCenter />} />
                  <Route path="trust-safety" element={<AdminTrustSafetyHub />} />
                  <Route path="spam-protection" element={<AdminTrustSafetyHub />} />
                  <Route path="monetization" element={<AdminMonetizationDashboard />} />
                  <Route path="services" element={<ServiceManagement />} />
                  <Route path="63-services" element={<ServiceManagement />} />
                  <Route path="verification" element={<UniversalAdminManager />} />
                  <Route path="reports" element={<UniversalAdminManager />} />
                  <Route path="reviews" element={<UniversalAdminManager />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="profiles" element={<ProfileManagementPage />} />
                  <Route path="admins" element={<AdminManagement />} />
                  <Route path="roles" element={<RoleManagement />} />
                  <Route path="permissions" element={<RoleManagement />} />
                  <Route path="businesses" element={<BusinessApproval />} />
                  <Route path="products" element={<ProductApproval />} />
                  <Route path="house-rent" element={<HouseRentApproval />} />
                  <Route path="content" element={<ContentManagementPage />} />
                  <Route path="notices" element={<NoticeManagement />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                  <Route path="offline-sync" element={<AdminOfflineSyncPage />} />
                  <Route path="search" element={<AdminSearchEnginePage />} />
                  <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                  <Route path="audit" element={<AdminAuditLogsPage />} />
                  <Route path="news" element={<NewsManagement />} />
                  <Route path="mela" element={<MelaManagement />} />
                  <Route path="events" element={<EventManagement />} />
                  <Route path="tourism" element={<TourismManagement />} />
                  <Route path="gallery" element={<GalleryManagement />} />
                  <Route path="profile" element={<MyProfile />} />
                  <Route path="profile/edit" element={<EditProfile />} />
                  <Route path="password" element={<ChangePassword />} />
                  <Route path="settings/language" element={<LanguageSettings />} />
                  <Route path="support" element={<Support />} />
                  <Route path="banners" element={<HeroSliderManagement />} />
                  <Route path="hero-slider" element={<HeroSliderManagement />} />
                  <Route path="hero" element={<HeroSliderManagement />} />
                  <Route path="advertisements" element={<AdvertisementManagement />} />
                  <Route path="blood-donors" element={<BloodDonorManagement />} />
                  <Route path="education" element={<EducationManager />} />
                  <Route path="agriculture" element={<AgricultureManager />} />
                  <Route path="health" element={<HealthManager />} />
                  <Route path="main-menu" element={<CitizenDrawerManagement />} />
                  <Route path="drawer-menu" element={<CitizenDrawerManagement />} />
                  <Route path="portal-menu" element={<CitizenDrawerManagement />} />
                  <Route path="site-management" element={<SiteManagement />} />
                  <Route path="weather" element={<WeatherSettings />} />
                  <Route path="jobs" element={<JobsManager />} />
                  <Route path="administration" element={<AdministrationManager />} />
                  <Route path="ngo" element={<NGOManager />} />
                  <Route path="e-services" element={<ServiceApplicationManagement />} />
                  <Route path="analytics" element={<AnalyticsView />} />
                  <Route path="pages" element={<PageManagement />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="seo" element={<AdminSettings />} />
                  <Route path="seo-settings" element={<AdminSettings />} />
                  <Route path="security" element={<AdminSettings />} />
                </Route>

                <Route path="/super-admin/direct" element={<Navigate to="/super-admin/login" replace />} />
                <Route path="/superadmin/direct" element={<Navigate to="/super-admin/login" replace />} />
                <Route path="/super-admin/login" element={<SuperAdminLogin />} />
                <Route path="/superadmin/login" element={<Navigate to="/super-admin/login" replace />} />
                <Route path="/admin/login" element={<Navigate to="/super-admin/login" replace />} />
                <Route path="/superadmin" element={<Navigate to="/super-admin/login" replace />} />

                <Route path="/super-admin" element={<SuperAdminRoute><AdminLayout /></SuperAdminRoute>}>
                  <Route index element={<SuperAdminDashboard />} />
                  <Route path="realtime-users" element={<RealtimeUserPresencePage />} />
                  <Route path="active-users" element={<RealtimeUserPresencePage />} />
                  <Route path="presence" element={<RealtimeUserPresencePage />} />
                </Route>

                <Route path="/moderator" element={<ModeratorRoute><AdminLayout /></ModeratorRoute>}>
                  <Route index element={<ModeratorDashboard />} />
                </Route>

                <Route path="/editor" element={<EditorRoute><AdminLayout /></EditorRoute>}>
                  <Route index element={<EditorDashboard />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>

        <GlobalFAB />
        <CallModal />
        <PwaInstallPrompt />
        <UniversalAddModal
          isOpen={isUniversalAddOpen}
          onClose={() => setIsUniversalAddOpen(false)}
        />
        <UserAccountSecurityCenter
          isOpen={isSecurityCenterOpen}
          onClose={() => setIsSecurityCenterOpen(false)}
        />
        </OfflineManager>
      </ErrorBoundary>
      </div>
    </div>
  );
};

export default function App() {
  useEffect(() => {
    seedSampleDataIfEmpty();
    prefetchCoreCollections();
    initGlobalHapticFeedback();
    // Apply saved theme (dark mode) on mount
    const savedTheme = localStorage.getItem("app_theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply saved theme color on mount
    const savedColor = localStorage.getItem("app_theme_color") || "green";
    document.documentElement.setAttribute("data-theme", savedColor);
  }, []);

  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <MainAppContent />
          <AccessibilityToolbar />
        </BrowserRouter>
      </AccessibilityProvider>
    </LanguageProvider>
  );
}
