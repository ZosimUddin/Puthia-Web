import React, { useState, useEffect } from "react";
import { UpazilaIntroGrid } from "./UpazilaIntroGrid";
import { UnionNews } from "./UnionNews";
import { GovtServicesInfo } from "./GovtServicesInfo";
import { AdministrationIntro } from "./AdministrationIntro";
import { UnionGrid } from "./UnionGrid";
import { VillageGrid } from "./VillageGrid";
import { MapGrid } from "./MapGrid";
import { AdministrationGov } from "./AdministrationGov";
import { CountdownTimer } from "./CountdownTimer";
import SponsorsPage from "./SponsorsPage";
import { UpazilaQuiz } from "./UpazilaQuiz";
import { ComplaintBox } from "./ComplaintBox";
import { VillageNews } from "./VillageNews";
import { EduNews } from "./EduNews";
import { SportsNews } from "./SportsNews";
import { BusinessNews } from "./BusinessNews";
import { SpecialNews } from "./SpecialNews";
import { CitizenNews } from "./CitizenNews";
import { HospitalInfo } from "./HospitalInfo";
import { ClinicInfo } from "./ClinicInfo";
import { DoctorInfo } from "./DoctorInfo";
import { PharmacyInfo } from "./PharmacyInfo";
import { DiagnosticInfo } from "./DiagnosticInfo";
import { DentalInfo } from "./DentalInfo";
import { AmbulanceInfo } from "./AmbulanceInfo";
import { PoliceInfo } from "./PoliceInfo";
import { FireServiceInfo } from "./FireServiceInfo";
import { RuralElectricityInfo } from "./RuralElectricityInfo";
import { LocalParlorInfo } from "./LocalParlorInfo";
import { LocalNurseryInfo } from "./LocalNurseryInfo";
import { AgriServiceInfo } from "./AgriServiceInfo";
import { MosqueInfo } from "./MosqueInfo";
import { ChurchInfo } from "./ChurchInfo";
import { PagodaInfo } from "./PagodaInfo";
import { OrphanageInfo } from "./OrphanageInfo";
import { FishFarmInfo } from "./FishFarmInfo";
import { AgriTrainingInfo } from "./AgriTrainingInfo";
import { TempleInfo } from "./TempleInfo";
import { EidgahInfo } from "./EidgahInfo";
import { GraveyardInfo } from "./GraveyardInfo";
import { ReligiousEventsInfo } from "./ReligiousEventsInfo";
import { CyberHelplineInfo } from "./CyberHelplineInfo";
import { WomenChildrenHelpInfo } from "./WomenChildrenHelpInfo";
import { NationalHelplineInfo } from "./NationalHelplineInfo";
import { BuySellInfo } from "./BuySellInfo";
import { LocalProductsInfo } from "./LocalProductsInfo";
import { JobPortal } from "./JobPortal";
import { TrainingHub } from "./TrainingHub";
import { BusinessAdsInfo } from "./BusinessAdsInfo";
import { ServiceDirectoryTemplate } from "./common/MasterServiceTemplate/ServiceDirectoryTemplate";
import { ApplicationFormsInfo } from "./ApplicationFormsInfo";
import { ImportantPdfsInfo } from "./ImportantPdfsInfo";
import { CertificateSamplesInfo } from "./CertificateSamplesInfo";
import { AgricultureGuidesInfo } from "./AgricultureGuidesInfo";
import { DownloadCenterPage } from "./DownloadCenterPage";
import { EducationalResourcesInfo } from "./EducationalResourcesInfo";
import { UnoContactInfo } from "./UnoContactInfo";
import { ChairmanContactInfo } from "./ChairmanContactInfo";
import { OcContactInfo } from "./OcContactInfo";
import { UpContactInfo } from "./UpContactInfo";
import { ElectricityContactInfo } from "./ElectricityContactInfo";
import { WaterContactInfo } from "./WaterContactInfo";
import { HospitalContactInfo } from "./HospitalContactInfo";
import { WeatherUpdateInfo } from "./WeatherUpdateInfo";
import { AgriAdviceInfo } from "./AgriAdviceInfo";
import { MarketPriceInfo } from "./MarketPriceInfo";
import { MySavedView } from "./MySavedView";
import { OfficerDirectoryInfo } from "./OfficerDirectoryInfo";
import { AgriOfficersInfo } from "./AgriOfficersInfo";
import { EduInstInfo } from "./EduInstInfo";
import { SchoolInfo } from "./SchoolInfo";
import { CollegeInfo } from "./CollegeInfo";
import { MadrashaInfo } from "./MadrashaInfo";
import { TechnicalEduInfo } from "./TechnicalEduInfo";
import { KindergartenInfo } from "./KindergartenInfo";
import { CoachingInfo } from "./CoachingInfo";
import { ScholarshipInfo } from "./ScholarshipInfo";
import { CareerGuidelineInfo } from "./CareerGuidelineInfo";
import { LibraryInfo } from "./LibraryInfo";
import { BirthRegistrationInfo } from "./BirthRegistrationInfo";
import { DeathRegistrationInfo } from "./DeathRegistrationInfo";
import { NIDServicesInfo } from "./NIDServicesInfo";
import { PassportInfo } from "./PassportInfo";
import { LandServicesInfo } from "./LandServicesInfo";
import { EMutationInfo } from "./EMutationInfo";
import { AllToolsCalculators } from "./AllToolsCalculators";
import { NgoSocial } from "./NgoSocial";
import { RoadsTransport } from "./RoadsTransport";
import { LivestockPoultry } from "./LivestockPoultry";
import LivestockFisheries from "../pages/modules/LivestockFisheries";
import { RentToLet } from "./RentToLet";

import { OnlineApplicationInfo } from "./OnlineApplicationInfo";
import { GovtOfficeDirectoryInfo } from "./GovtOfficeDirectoryInfo";
import { BloodDonorListInfo } from "./BloodDonorListInfo";
import { BloodEmergencyRequestInfo } from "./BloodEmergencyRequestInfo";
import { BloodDonationRegInfo } from "./BloodDonationRegInfo";
import { BloodDonationHistory } from "./BloodDonationHistory";
import { ProblemReportInfo } from "./ProblemReportInfo";
import { CitizenComplaintInfo } from "./CitizenComplaintInfo";
import { RoadProblemInfo } from "./RoadProblemInfo";
import { ElectricityProblemInfo } from "./ElectricityProblemInfo";
import { WaterProblemInfo } from "./WaterProblemInfo";
import { ProvideFeedbackInfo } from "./ProvideFeedbackInfo";
import { PuthiaRajbariInfo } from "./PuthiaRajbariInfo";
import { HeritageTemplesInfo } from "./HeritageTemplesInfo";
import { HistoricalSitesInfo } from "./HistoricalSitesInfo";
import { TravelGuideInfo } from "./TravelGuideInfo";
import { TourismHotelsTransportInfo } from "./TourismHotelsTransportInfo";
import { TourismPhotoGalleryInfo } from "./TourismPhotoGalleryInfo";
import { TourismVideoGalleryInfo } from "./TourismVideoGalleryInfo";
import { ComplaintStatusInfo } from "./ComplaintStatusInfo";
import { DigitalIdCard } from "./DigitalIdCard";
import EducationalInstitutions from "./EducationalInstitutions";
import { UserProfileView } from "./UserProfileView";
import { HistoryOfPuthia } from "./HistoryOfPuthia";
import { GeographicalProfile } from "./GeographicalProfile";
import { Demographics } from "./Demographics";
import { LocalShopDirectoryInfo } from "./LocalShopDirectoryInfo";
import { LocalRestaurantInfo } from "./LocalRestaurantInfo";
import { LocalHotelInfo } from "./LocalHotelInfo";
import { LocalServiceProviderInfo } from "./LocalServiceProviderInfo";
import { EntrepreneurCornerInfo } from "./EntrepreneurCornerInfo";
import { BankingFinance } from "./BankingFinance";
import { InsuranceServices } from "./InsuranceServices";
import { RentToLetHub } from "./RentToLetHub";
import { OfficialMaps } from "./OfficialMaps";
import { AdministrativeStructure } from "./AdministrativeStructure";
import { TouristSpots } from "./TouristSpots";
import { KeyFacts } from "./KeyFacts";
import { NoticeBoardInfo } from "./NoticeBoard";
import { LocalNewsInfo } from "./LocalNewsInfo";
import { CommunityEventsHub } from "./CommunityEventsHub";
import { CommunityPrograms } from "./CommunityPrograms";
import { SportsActivities } from "./SportsActivities";
import { CulturalActivities } from "./CulturalActivities";
import { SocialOrganizations } from "./SocialOrganizations";
import { VolunteerNetwork } from "./VolunteerNetwork";
import { PhotoVideoGallery } from "./PhotoVideoGallery";
import { GeneralJobNews } from "./GeneralJobNews";
import { EducationCoachingHub } from "./EducationCoachingHub";
import { LocalJobOpenings } from "./LocalJobOpenings";
import { FreelancingResources } from "./FreelancingResources";
import { TrainingWorkshops } from "./TrainingWorkshops";
import { LostAndFound } from "./LostAndFound";
import { LocalPolls } from "./LocalPolls";
import { CitizenLeaderboard } from "./CitizenLeaderboard";
import { VerifiedBusiness } from "./VerifiedBusiness";
import { CommunityBadges } from "./CommunityBadges";
import { FreedomFighters } from "./FreedomFighters";
import { NotablePersonsHub } from "./NotablePersonsHub";
import { Academicians } from "./Academicians";
import { SportsPersonalities } from "./SportsPersonalities";
import { Entrepreneurs } from "./Entrepreneurs";
import { UnionProfiles } from "./UnionProfiles";
import { ChairmanMembers } from "./ChairmanMembers";
import { UnionOffices } from "./UnionOffices";
import { UnionServices } from "./UnionServices";
import { UnionMaps } from "./UnionMaps";
import { UnionContact } from "./UnionContact";

import { SearchBloodGroupInfo } from "./SearchBloodGroupInfo";
import { BusCounterInfo } from "./BusCounterInfo";
import { VeterinaryDoctorInfo } from "./VeterinaryDoctorInfo";
import { VillageListInfo } from "./VillageListInfo";
import { VillageHistoryInfo } from "./VillageHistoryInfo";
import { VillagePopulationInfo } from "./VillagePopulationInfo";
import { VillageEducationInfo } from "./VillageEducationInfo";
import { VillageReligiousInfo } from "./VillageReligiousInfo";
import { VillageNotablePersonsInfo } from "./VillageNotablePersonsInfo";
import { VillagePhotoGalleryInfo } from "./VillagePhotoGalleryInfo";
import { VillageMapsInfo } from "./VillageMapsInfo";

import {
  MapPin,
  Users,
  Calendar,
  Compass,
  BookOpen,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Info,
  HelpCircle,
  Phone,
  Mail,
  Map,
  Star,
  StarHalf,
  Award,
  Landmark,
  Eye,
  CheckCircle,
  Store,
  Coffee,
  Footprints,
  Waves,
  FileText,
  CheckCircle2,
  Send,
  RefreshCw,
  Plus,
  Search,
  Check,
  Download,
  Printer,
  ShieldCheck,
  Facebook,
  Twitter,
  MessageCircle,
  Link,
  Share2,
  CalendarDays,
  Megaphone,
  MessageSquare,
  Trophy,
  Building,
  Globe,
  School,
  Droplet,
  Clock,
  Bus,
  Train,
  Banknote,
  Briefcase,
  User,
  Shield,
  Zap,
  Activity,
  Flame,
  Home,
  FileSignature,
  ScrollText,
  Tractor,
  PhoneCall,
  Moon,
  Sun,
  MessageSquareCode,
  MousePointerClick,
  FileX,
  UserCheck,
  Hotel,
} from "lucide-react";
import { jsPDF } from "jspdf";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { puthiaTemples } from "../templeData";
import {
  getLostFoundNotices,
  addLostFoundNotice,
  deleteLostFoundNotice,
  getSocialEvents,
  addSocialEvent,
  deleteSocialEvent,
  getVolunteerActivities,
  addVolunteerActivity,
  enrollVolunteer,
  deleteVolunteerActivity,
  getLocalIssues,
  addLocalIssue,
  upvoteLocalIssue,
  deleteLocalIssue,
  getMarketplaceItems,
  addMarketplaceItem,
  deleteMarketplaceItem,
  compressImageToBase64,
  getComplaints,
  addComplaint,
  addFeedback,
} from "../api";
import {
  LostFoundNotice,
  SocialEvent,
  VolunteerActivity,
  LocalIssue,
  MarketplaceItem,
  Complaint,
  Feedback,
  SubViewsProps,
} from "../types";
import { CATEGORIES } from "../constants";
import { AnimatedCounter, UtilityServicesView } from "./SubComponents";
import { BusScheduleView, TrainInfoView, FareListView, VanAutoInfoView } from "./TransportInfoViews";
import { TransportMap } from "./TransportMap";

class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, message: "" };
  props: any;
  constructor(props: any) {
    super(props);
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: error.message };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("EB Caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 font-bold p-10">
          Error inside renderSubViewContent: {this.state.message}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SubViews({
  viewId,
  onGoBack,
  bloodDonors,
  setBloodDonors,
  onSimulateCall,
  setSelectedSubView,
  bloodSearchTerm,
  setBloodSearchTerm,
  setSelectedNews: globalSetSelectedNews,
}: SubViewsProps) {
  const activeCategory =
    CATEGORIES.find((c) => c.id === viewId || c.itemIds.includes(viewId)) ||
    CATEGORIES[0];

  const activeSubViewId = CATEGORIES.some((c) => c.id === viewId)
    ? CATEGORIES.find((c) => c.id === viewId)?.itemIds[0] || viewId
    : viewId;

  // ==========================================
  // Community Section States
  // ==========================================
  // 1. Lost & Found
  const [lostFoundNotices, setLostFoundNotices] = useState<LostFoundNotice[]>(
    [],
  );
  const [loadingLostFound, setLoadingLostFound] = useState(false);
  const [lostFoundFilter, setLostFoundFilter] = useState<
    "all" | "lost" | "found"
  >("all");
  const [lfType, setLfType] = useState<"lost" | "found">("lost");
  const [lfTitle, setLfTitle] = useState("");
  const [lfDesc, setLfDesc] = useState("");
  const [lfPhone, setLfPhone] = useState("");
  const [lfReporter, setLfReporter] = useState("");
  const [lfLocation, setLfLocation] = useState("");
  const [lfDate, setLfDate] = useState("");
  const [showLfModal, setShowLfModal] = useState(false);

  // 2. Social Events
  const [socialEvents, setSocialEvents] = useState<SocialEvent[]>([]);
  const [loadingSocialEvents, setLoadingSocialEvents] = useState(false);
  const [seTitle, setSeTitle] = useState("");
  const [seDesc, setSeDesc] = useState("");
  const [seDate, setSeDate] = useState("");
  const [seTime, setSeTime] = useState("");
  const [seVenue, setSeVenue] = useState("");
  const [seCategory, setSeCategory] = useState("বিয়ে বাড়ি");
  const [seOrganizer, setSeOrganizer] = useState("");
  const [sePhone, setSePhone] = useState("");
  const [showSeModal, setShowSeModal] = useState(false);

  // 3. Volunteer Activities
  const [volunteerActivities, setVolunteerActivities] = useState<
    VolunteerActivity[]
  >([]);
  const [loadingVolunteer, setLoadingVolunteer] = useState(false);
  const [vaTitle, setVaTitle] = useState("");
  const [vaDesc, setVaDesc] = useState("");
  const [vaDate, setVaDate] = useState("");
  const [vaOrganizer, setVaOrganizer] = useState("");
  const [vaPhone, setVaPhone] = useState("");
  const [showVaModal, setShowVaModal] = useState(false);
  const [enrollingActId, setEnrollingActId] = useState<string | null>(null);
  const [enrollName, setEnrollName] = useState("");
  const [enrollPhone, setEnrollPhone] = useState("");

  // 4. Local Issues
  const [localIssues, setLocalIssues] = useState<LocalIssue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [liTitle, setLiTitle] = useState("");
  const [liDesc, setLiDesc] = useState("");
  const [liUnion, setLiUnion] = useState("পুঠিয়া ইউনিয়ন");
  const [liReporterName, setLiReporterName] = useState("");
  const [liReporterPhone, setLiReporterPhone] = useState("");
  const [showLiModal, setShowLiModal] = useState(false);
  const [liCategory, setLiCategory] = useState("রাস্তা ভাঙা");
  const [liImageUrl, setLiImageUrl] = useState("");
  const [votedIssueIds, setVotedIssueIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("votedIssues") || "[]");
    } catch {
      return [];
    }
  });

  // Local states for interactivity
  // const [selectedUnionGeo, setSelectedUnionGeo] = useState("sadar");
  const [activeMuniUnionTab, setActiveMuniUnionTab] = useState("muni");
  const [selectedUnionCodeMaps, setSelectedUnionCodeMaps] = useState("sadar");
  const [selectedUnionCodeProfile, setSelectedUnionCodeProfile] =
    useState("sadar");
  const [selectedUnionCodeLeaders, setSelectedUnionCodeLeaders] =
    useState("sadar");
  const [selectedUnionCodeOffices, setSelectedUnionCodeOffices] =
    useState("sadar");
  const [selectedUnionCodeServices, setSelectedUnionCodeServices] =
    useState("sadar");
  const [selectedUnionCodeContacts, setSelectedUnionCodeContacts] =
    useState("sadar");
  const [selectedUnionCodeVillages, setSelectedUnionCodeVillages] =
    useState("sadar");
  const [searchQueryVillages, setSearchQueryVillages] = useState("");
  const [templeSearchQuery, setTempleSearchQuery] = useState("");
  const [selectedUnionCodePop, setSelectedUnionCodePop] = useState("sadar");
  const [selectedVillagePop, setSelectedVillagePop] =
    useState("পুঠিয়া চেরাগ্রাহ");
  const [selectedUnionCodeEdu, setSelectedUnionCodeEdu] = useState("sadar");
  const [selectedVillageEdu, setSelectedVillageEdu] =
    useState("পুঠিয়া চেরাগ্রাহ");
  const [selectedUnionCodeRel, setSelectedUnionCodeRel] = useState("sadar");
  const [selectedVillageRel, setSelectedVillageRel] =
    useState("পুঠিয়া চেরাগ্রাহ");

  const [religionTab, setReligionTab] = useState("mosque");
  const [issueTab, setIssueTab] = useState("all");
  const [freedomFighterTab, setFreedomFighterTab] = useState("all");
  const [freedomFighterSearch, setFreedomFighterSearch] = useState("");
  const [academicTab, setAcademicTab] = useState("all");
  const [academicSearch, setAcademicSearch] = useState("");
  const [athleteTab, setAthleteTab] = useState("all");
  const [entrepreneurTab, setEntrepreneurTab] = useState("all");
  const [personalityTab, setPersonalityTab] = useState("freedom_fighter");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newDonorName, setNewDonorName] = useState("");
  const [newDonorPhone, setNewDonorPhone] = useState("");
  const [newDonorGroup, setNewDonorGroup] = useState("A+");
  const [newDonorUnion, setNewDonorUnion] = useState("sadar");
  const [voteSurveySubTab, setVoteSurveySubTab] = useState("live");
  const [specialTab, setSpecialTab] = useState("special_achievements");
  const [rankingSubTab, setRankingSubTab] = useState("education");

  // Missing States for geo, municipal, reps
  const [geoUnionFilter, setGeoUnionFilter] = useState("all");
  const unionGeoData: Record<
    string,
    { name: string; area: string; pop: string; rivers?: string; info?: string }
  > = {
    sadar: {
      name: "পুঠিয়া সদর ইউনিয়ন",
      area: "৩৫.০৬ বর্গ কি.মি.",
      pop: "৫২,০৩৪",
      rivers: "শিব নদী",
      info: "পুঠিয়া উপজেলার প্রাণকেন্দ্র।",
    },
    baneshwar: {
      name: "বানেশ্বর ইউনিয়ন",
      area: "২৯.৪০ বর্গ কি.মি.",
      pop: "৪৮,৫০০",
      rivers: "মুসাখান নদী",
      info: "বানেশ্বর হাট এশিয়া মহাদেশের বৃহত্তম আমের হাট।",
    },
    bhalukgachhi: {
      name: "ভালুকগাছী ইউনিয়ন",
      area: "৩০.২০ বর্গ কি.মি.",
      pop: "৪৫,৩০০",
      rivers: "বারনই নদী",
      info: "ঐতিহ্যবাহী ভালুকগাছী বাজার।",
    },
    jeupara: {
      name: "জিউপাড়া ইউনিয়ন",
      area: "৩২.১০ বর্গ কি.মি.",
      pop: "৪৬,০০০",
      rivers: "শিব নদী",
      info: "কৃষি প্রধান অঞ্চল।",
    },
    silmaria: {
      name: "শিলমাড়িয়া ইউনিয়ন",
      area: "২৭.৫০ বর্গ কি.মি.",
      pop: "৪০,২০০",
      rivers: "মুসাখান নদী",
      info: "ঐতিহ্যবাহী শিলমাড়িয়া বাজার।",
    },
    belpukur: {
      name: "বেলপুকুর ইউনিয়ন",
      area: "২৪.২০ বর্গ কি.মি.",
      pop: "৩৫,৪০০",
      rivers: "মুসাখান নদী",
      info: "রাজশাহী শহরের নিকটবর্তী।",
    },
  };
  const [repUnionFilter, setRepUnionFilter] = useState("all");
  const [muniUnionFilter, setMuniUnionFilter] = useState("all");
  const [muniUnionSearch, setMuniUnionSearch] = useState("");
  const displayCategoryTitle =
    viewId === "shop_directory" ? "দোকান ও ব্যবসা" : "ডিরেক্টরি";

  // Missing States for trade_directory
  const [bizTab, setBizTab] = useState("directory");
  const [bizCategory, setBizCategory] = useState("all");
  const [bizSearch, setBizSearch] = useState("");
  const [allBusinesses, setAllBusinesses] = useState<any[]>([
    {
      id: 1,
      name: "মায়ের দোয়া ট্রেডার্স",
      category: "shop",
      address: "পুঠিয়া বাজার",
      phone: "01700000000",
    },
    {
      id: 2,
      name: "জনতা ফার্মেসি",
      category: "pharmacy",
      address: "বানেশ্বর বাজার",
      phone: "01800000000",
    },
    {
      id: 3,
      name: "রহিম হার্ডওয়্যার",
      category: "shop",
      address: "শিবপুর বাজার",
      phone: "01900000000",
    },
    {
      id: 4,
      name: "সাদিয়া বস্ত্রবিতান",
      category: "shop",
      address: "বেলপুকুর বাজার",
      phone: "01500000000",
    },
    {
      id: 5,
      name: "আল্লাহর দান হোটেল",
      category: "restaurant",
      address: "পুঠিয়া চৌরাস্তা",
      phone: "01600000000",
    },
    {
      id: 6,
      name: "বিসমিল্লাহ স্যানিটারি",
      category: "other",
      address: "ভালুকগাছী বাজার",
      phone: "01300000000",
    },
  ]);
  const [filteredBiz, setFilteredBiz] = useState<any[]>(allBusinesses);
  const [bizRegSuccess, setBizRegSuccess] = useState(false);
  const [bizRegName, setBizRegName] = useState("");
  const [bizRegPhone, setBizRegPhone] = useState("");
  const [bizRegCat, setBizRegCat] = useState("shop");
  const [bizRegAddress, setBizRegAddress] = useState("");
  const [bizRegDesc, setBizRegDesc] = useState("");

  const handleBizRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBizRegSuccess(true);
    setTimeout(() => {
      setBizTab("directory");
      setBizRegSuccess(false);
      setBizRegName("");
      setBizRegPhone("");
      setBizRegAddress("");
      setBizRegDesc("");
    }, 2000);
  };

  // Missing States for utility_services
  const [utilityContactsData, setUtilityContactsData] = useState<any[]>([]);
  const [utilitySearch, setUtilitySearch] = useState("");
  const [utilityUnionFilter, setUtilityUnionFilter] = useState("all");

  // Missing States for agricultural_services
  const [agriTab, setAgriTab] = useState("info");
  const [agriWeatherOffset, setAgriWeatherOffset] = useState(0);
  const [agriCropFilter, setAgriCropFilter] = useState("all");
  const [agriMarketFilter, setAgriMarketFilter] = useState("today");
  const [agriCalcItem, setAgriCalcItem] = useState("ধান (বোরো)");
  const [agriCalcQty, setAgriCalcQty] = useState("1");
  const [agriSubmitSuccess, setAgriSubmitSuccess] = useState(false);
  const [agriSubmitLoading, setAgriSubmitLoading] = useState(false);
  const [agriInquiryType, setAgriInquiryType] = useState("disease");
  const [agriInquiryText, setAgriInquiryText] = useState("");
  const [agriInquiryContact, setAgriInquiryContact] = useState("");

  const [marketItems, setMarketItems] = useState([
    {
      id: 1,
      name: "দেশি গিলা",
      price: "৳ ৪০/কেজি",
      oldPrice: "৳ ৪৫/কেজি",
      category: "vegetable",
    },
    {
      id: 2,
      name: "লাল শাক",
      price: "৳ ২০/আঁটি",
      oldPrice: "৳ ১৫/আঁটি",
      category: "vegetable",
    },
    {
      id: 3,
      name: "সোনালী মুরগী",
      price: "৳ ৩২০/কেজি",
      oldPrice: "৳ ৩১০/কেজি",
      category: "poultry",
    },
    {
      id: 4,
      name: "রুই মাছ",
      price: "৳ ২৫০/কেজি",
      oldPrice: "৳ ২৫০/কেজি",
      category: "fish",
    },
  ]);
  const [loadingMarket, setLoadingMarket] = useState(false);

  // General state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [businessSubTab, setBusinessSubTab] = useState("shopping");
  const [badgeSubTab, setBadgeSubTab] = useState("social");
  const [importantContactTab, setImportantContactTab] = useState("uno");
  const [rentTab, setRentTab] = useState("house");
  const [downloadTab, setDownloadTab] = useState("forms");
  const [digitalIdSubTab, setDigitalIdSubTab] = useState("register");
  const [lostFoundSubTab, setLostFoundSubTab] = useState("lost");
  const [pollSelections, setPollSelections] = useState<Record<string, string>>(
    {},
  );
  const [livePolls, setLivePolls] = useState<any[]>([]);
  const [userVotedPolls, setUserVotedPolls] = useState<string[]>([]);
  const [suggestedPolls, setSuggestedPolls] = useState<any[]>([]);
  const [spName, setSpName] = useState("");
  const [spPhone, setSpPhone] = useState("");
  const [spTitle, setSpTitle] = useState("");
  const [spCategory, setSpCategory] = useState("infrastructure");
  const [spDesc, setSpDesc] = useState("");
  const [spOptionsText, setSpOptionsText] = useState("");

  const [marketFilterCat, setMarketFilterCat] = useState("all");
  const [marketSearchText, setMarketSearchText] = useState("");
  let content: any = null; // mock
  const getHeader = (title: string, description: string, icon: string) => (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#edeae0] shadow-sm mb-6 flex items-start gap-4 animate-fade-in font-sans">
      <div className="w-12 h-12 rounded-full bg-[#f8f9fa] flex items-center justify-center text-2xl shrink-0 border border-gray-100">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-xl md:text-2xl font-serif font-black text-gray-800">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-sans font-medium">
          {description}
        </p>
      </div>
    </div>
  );
  const [fareCalcFrom, setFareCalcFrom] = useState("");
  const [fareCalcTo, setFareCalcTo] = useState("");
  const [fareCalcVehicle, setFareCalcVehicle] = useState("");
  const [transportActiveTab, setTransportActiveTab] = useState("bus");
  const [peopleSector, setPeopleSector] = useState("all");
  const [peopleSearchText, setPeopleSearchText] = useState("");
  const [contactTab, setContactTab] = useState("office");
  const [eventTab, setEventTab] = useState("upcoming");
  const [noticeTab, setNoticeTab] = useState("general");
  const [bloodTab, setBloodTab] = useState("search");
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackPhone, setFeedbackPhone] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [complaintTab, setComplaintTab] = useState("new");
  const [allComplaintsList, setAllComplaintsList] = useState<any[]>([]);
  const [cpName, setCpName] = useState("");
  const [cpPhone, setCpPhone] = useState("");
  const [cpTitle, setCpTitle] = useState("");
  const [cpDesc, setCpDesc] = useState("");
  const [cpCategory, setCpCategory] = useState("রাস্তা/কালভার্ট");
  const [cpUnion, setCpUnion] = useState("পুঠিয়া সদর");
  const [cpEvidenceList, setCpEvidenceList] = useState<any[]>([]);
  const [cpEmail, setCpEmail] = useState("");
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintSuccessId, setComplaintSuccessId] = useState("");
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [cpTrackingId, setCpTrackingId] = useState("");
  const [cpTrackingPhone, setCpTrackingPhone] = useState("");
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const [adCategoryFilter, setAdCategoryFilter] = useState("all");
  const handleAdShare = (...args: any[]) => {}; // mock

  const [eduCoachingTab, setEduCoachingTab] = useState("academic");
  const [quizSubTab, setQuizSubTab] = useState("iq_quiz");
  const [interactiveQuizActive, setInteractiveQuizActive] = useState(false);
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<
    Record<number, number>
  >({});
  const [quizScore, setQuizScore] = useState(0);
  const [photoContestName, setPhotoContestName] = useState("");
  const [photoContestPhone, setPhotoContestPhone] = useState("");
  const [photoContestTitle, setPhotoContestTitle] = useState("");
  const [photoContestDesc, setPhotoContestDesc] = useState("");
  const [megaContestRegistered, setMegaContestRegistered] = useState(false);
  const [showMegaRegModal, setShowMegaRegModal] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [adFormSubmitted, setAdFormSubmitted] = useState(false);
  const [showAdPaymentStep, setShowAdPaymentStep] = useState(false);
  const [adDuration, setAdDuration] = useState("7_days");
  const [adPaymentMethod, setAdPaymentMethod] = useState("bkash");
  const [txSenderPhone, setTxSenderPhone] = useState("");
  const [txId, setTxId] = useState("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [healthUnionFilter, setHealthUnionFilter] = useState("all");
  const [healthSearch, setHealthSearch] = useState("");
  const [activeFilter, setClinicUnionFilter] = useState("all");
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [bloodFilter, setBloodFilter] = useState("all");
  const [bloodSearchQuery, setBloodSearchQuery] = useState("");
  const filteredDonors: any[] = [];
  const getGroupCount = (grp: string) => 0;
  const [donorSuccess, setDonorSuccess] = useState(false);
  const notices: any[] = [];
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<any>(null);
  const [trainingCategoryTab, setTrainingCategoryTab] = useState("computer");
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [localJobCategoryTab, setLocalJobCategoryTab] = useState("all");
  const filteredJobs: any[] = [];
  const handleLocalJobSubmit = (e?: any) => {};
  const [eduScholarshipApplySuccess, setEduScholarshipApplySuccess] =
    useState(false);
  const [eduScholarshipId, setEduScholarshipId] = useState("");
  const [freelanceRoadmap, setFreelanceRoadmap] = useState("web");
  const [eduExamResult, setEduExamResult] = useState<any>(null);
  const [eduExamRoll, setEduExamRoll] = useState("");
  const [eduExamReg, setEduExamReg] = useState("");
  const [eduTab, setEduTab] = useState("edu_school");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolUnionFilter, setSchoolUnionFilter] = useState("all");
  const [eduAdmissionInst, setEduAdmissionInst] = useState("all");
  const [eduApplyTargetInst, setEduApplyTargetInst] = useState("");
  const [eduApplyClass, setEduApplyClass] = useState("");
  const [eduApplySuccess, setEduApplySuccess] = useState(false);
  const [eduApplyName, setEduApplyName] = useState("");
  const [eduApplyPhone, setEduApplyPhone] = useState("");
  const [eduExamType, setEduExamType] = useState("ssc");
  const [eduExamYear, setEduExamYear] = useState("2024");
  const [eduExamSearching, setEduExamSearching] = useState(false);
  const [activeIssues, setActiveIssues] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [udcUnionFilter, setUdcUnionFilter] = useState("all");
  const religiousSearch = ""; // mock
  const schoolsData: any[] = []; // mock

  const [jobSubTab, setJobSubTab] = useState("local");
  const [jobSector, setJobSector] = useState("all");
  const [jobSearch, setJobSearch] = useState("");
  const [jobRegTitle, setJobRegTitle] = useState("");
  const [jobRegOrg, setJobRegOrg] = useState("");
  const [jobRegType, setJobRegType] = useState("full-time");
  const [jobRegSector, setJobRegSector] = useState("education");
  const [jobRegSalary, setJobRegSalary] = useState("");
  const [jobRegDeadline, setJobRegDeadline] = useState("");
  const [jobRegReq, setJobRegReq] = useState("");
  const [jobRegContact, setJobRegContact] = useState("");
  const [jobRegSuccess, setJobRegSuccess] = useState(false);
  const [trainingRegSuccess, setTrainingRegSuccess] = useState(false);
  const [trainingAppName, setTrainingAppName] = useState("");
  const [trainingAppPhone, setTrainingAppPhone] = useState("");
  const [trainingAppCourse, setTrainingAppCourse] = useState("");
  const [userJobs, setUserJobs] = useState<any[]>([]);

  const religiousData = []; // mock
  const [selectedUnionCodeNotable, setSelectedUnionCodeNotable] =
    useState("sadar");
  const [selectedVillageNotable, setSelectedVillageNotable] =
    useState("পুঠিয়া চেরাগ্রাহ");
  const [selectedUnionCodeMap, setSelectedUnionCodeMap] = useState("sadar");

  useEffect(() => {
    if (activeSubViewId?.startsWith("personality_")) {
      setPersonalityTab(activeSubViewId.replace("personality_", ""));
    }
  }, [activeSubViewId]);
  const [selectedVillageMap, setSelectedVillageMap] =
    useState("পুঠিয়া চেরাগ্রাহ");
  const [selectedUnionCodeGallery, setSelectedUnionCodeGallery] =
    useState("sadar");
  const [selectedVillageGallery, setSelectedVillageGallery] =
    useState("পুঠিয়া চেরাগ্রাহ");
  const [selectedUnionCodeHistory, setSelectedUnionCodeHistory] =
    useState("sadar");
  const [selectedVillageHistory, setSelectedVillageHistory] =
    useState("পুঠিয়া চেরাগ্রাহ");

  const unions = [
    {
      code: "sadar",
      name: "পুঠিয়া পৌরসভা / সদর",
      area: "৪২.৫ বর্গ কিমি",
      villages: "২৮টি",
      mauzas: "২১টি",
      literacy: "৫৮.২%",
      population: "৫০,০০০",
      men: "২৫,৫০০",
      women: "২৪,৫০০",
      building: "পৌরসভা ভবন, পুঠিয়া সদর",
      chairman: "জনাব ক",
      secretary: "সচিব খ",
      entrepreneur: "উদ্যোক্তা গ",
      members: [
        {
          w: "১, ২, ৩",
          r: "সংরক্ষিত নারী সদস্য",
          n: "মোসাম্মৎ রেহানা",
          p: "01700000000",
        },
        { w: "১", r: "সাধারণ সদস্য", n: "জনাব রহিম", p: "01700000000" },
      ],
    },
    {
      code: "baneshwar",
      name: "বানেশ্বর",
      area: "৩১.২ বর্গ কিমি",
      villages: "২৪টি",
      mauzas: "১৯টি",
      literacy: "৬০.৫%",
      population: "৪২,০০০",
      men: "২১,৫০০",
      women: "২০,৫০০",
      building: "বানেশ্বর বাজার সংলগ্ন",
      chairman: "জনাব ঘ",
      secretary: "সচিব ঙ",
      entrepreneur: "উদ্যোক্তা চ",
      members: [
        {
          w: "১, ২, ৩",
          r: "সংরক্ষিত নারী সদস্য",
          n: "মোসাম্মৎ ফাতেমা",
          p: "01700000000",
        },
        { w: "১", r: "সাধারণ সদস্য", n: "জনাব করিম", p: "01700000000" },
      ],
    },
    {
      code: "shilmaria",
      name: "শিলমাড়িয়া",
      area: "৩৪.০ বর্গ কিমি",
      villages: "২৫টি",
      mauzas: "২০টি",
      literacy: "৫৫.০%",
      population: "৩৮,০০০",
      men: "১৯,৫০০",
      women: "১৮,৫০০",
      building: "শিলমাড়িয়া অফিস",
      chairman: "জনাব ছ",
      secretary: "সচিব জ",
      entrepreneur: "উদ্যোক্তা ঝ",
      members: [
        {
          w: "১, ২, ৩",
          r: "সংরক্ষিত নারী সদস্য",
          n: "মোসাম্মৎ আয়েশা",
          p: "01700000000",
        },
        { w: "১", r: "সাধারণ সদস্য", n: "জনাব জব্বার", p: "01700000000" },
      ],
    },
    {
      code: "belpukur",
      name: "বেলপুকুরিয়া",
      area: "২৮.৫ বর্গ কিমি",
      villages: "২২টি",
      mauzas: "১৮টি",
      literacy: "৫৭.৫%",
      population: "৩৫,০০০",
      men: "১৮,০০০",
      women: "১৭,০০০",
      building: "বেলপুকুরিয়া অফিস",
      chairman: "জনাব ঞ",
      secretary: "সচিব ট",
      entrepreneur: "উদ্যোক্তা ঠ",
      members: [
        {
          w: "১, ২, ৩",
          r: "সংরক্ষিত নারী সদস্য",
          n: "মোসাম্মৎ সুমি",
          p: "01700000000",
        },
        { w: "১", r: "সাধারণ সদস্য", n: "জনাব কুদ্দুস", p: "01700000000" },
      ],
    },
    {
      code: "jeupara",
      name: "জিউপাড়া",
      area: "৩০.৫ বর্গ কিমি",
      villages: "২৩টি",
      mauzas: "১৯টি",
      literacy: "৫৪.২%",
      population: "৩৬,০০০",
      men: "১৮,৫০০",
      women: "১৭,৫০০",
      building: "জিউপাড়া অফিস",
      chairman: "জনাব ড",
      secretary: "সচিব ঢ",
      entrepreneur: "উদ্যোক্তা ণ",
      members: [
        {
          w: "১, ২, ৩",
          r: "সংরক্ষিত নারী সদস্য",
          n: "মোসাম্মৎ জান্নাত",
          p: "01700000000",
        },
        { w: "১", r: "সাধারণ সদস্য", n: "জনাব মজিদ", p: "01700000000" },
      ],
    },
    {
      code: "bhalukgachhi",
      name: "ভালুকগাছী",
      area: "৩৩.২ বর্গ কিমি",
      villages: "২৬টি",
      mauzas: "২২টি",
      literacy: "৫৬.৮%",
      population: "৩৮,৫০০",
      men: "১৯,৮০০",
      women: "১৮,৭০০",
      building: "ভালুকগাছী অফিস",
      chairman: "জনাব ত",
      secretary: "সচিব থ",
      entrepreneur: "উদ্যোক্তা দ",
      members: [
        {
          w: "১, ২, ৩",
          r: "সংরক্ষিত নারী সদস্য",
          n: "মোসাম্মৎ সীমা",
          p: "01700000000",
        },
        { w: "১", r: "সাধারণ সদস্য", n: "জনাব সালাম", p: "01700000000" },
      ],
    },
  ];

  const [activeServiceModal, setActiveServiceModal] = useState<any>(null);

  // ==========================================
  // Digital Marketplace States
  // ==========================================
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(
    [],
  );
  const [loadingMarketplace, setLoadingMarketplace] = useState(false);
  const [marketCategoryFilter, setMarketCategoryFilter] =
    useState<string>("all");
  const [marketUnionFilter, setMarketUnionFilter] = useState<string>("all");
  const [marketSearch, setMarketSearch] = useState("");

  // Free post item form states
  const [mTitle, setMTitle] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mCategory, setMCategory] = useState<
    | "buy_sell"
    | "local_products"
    | "job_ads"
    | "business_ads"
    | "agri"
    | "local_promo"
    | "used_products"
    | "other"
  >("buy_sell");
  const [mPrice, setMPrice] = useState("");
  const [mUnit, setMUnit] = useState("");
  const [mLocation, setMLocation] = useState("");
  const [mUnion, setMUnion] = useState("sadar");
  const [mSellerName, setMSellerName] = useState("");
  const [mSellerPhone, setMSellerPhone] = useState("");
  const [mBadge, setMBadge] = useState("");
  const [mCondition, setMCondition] = useState<"new" | "used">("new");
  const [mImageUrl, setMImageUrl] = useState("");
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [marketSubmitLoading, setMarketSubmitLoading] = useState(false);
  const [compressingImage, setCompressingImage] = useState(false);

  const [communityTab, setCommunityTab] = useState("community_programs");
  const [emergencyTab, setEmergencyTab] = useState("police");

  // Community-specific states lifted from conditional views to satisfy Rules of Hooks
  const [evtSearch, setEvtSearch] = useState("");
  const [lastJoinedEvt, setLastJoinedEvt] = useState<string | null>(null);
  const [scoreState, setScoreState] = useState<Record<string, string>>({
    s_2: "বানেশ্বর ১৬৮/৫ (২০ ওভার) | ঝলমলিয়া ১২০/৪ (১৪.২ ওভার)",
    s_1: "ম্যাচ শুরু হতে বাকি ২ দিন",
  });
  const [cultSearch, setCultSearch] = useState("");
  const [selectedInquiryCenter, setSelectedInquiryCenter] = useState<
    string | null
  >(null);
  const [inqName, setInqName] = useState("");
  const [inqPhone, setInqPhone] = useState("");
  const [inqCourse, setInqCourse] = useState("নৃত্য ও সঙ্গীত");

  const [eventsFilter, setEventsFilter] = useState("all");
  const [sportsFilter, setSportsFilter] = useState("all");
  const [culturalFilter, setCulturalFilter] = useState("all");
  const [socialFilter, setSocialFilter] = useState("all");
  const [volunteerFilter, setVolunteerFilter] = useState("all");
  const [photoVideoTab, setPhotoVideoTab] = useState<"photos" | "videos">(
    "photos",
  );
  const [photosFilter, setPhotosFilter] = useState("all");
  const [videosFilter, setVideosFilter] = useState("all");
  const [activeGalleryMedia, setActiveGalleryMedia] = useState<any | null>(
    null,
  );
  const [simulatedRSVPs, setSimulatedRSVPs] = useState<string[]>([]);
  const [registeredVolunteerIds, setRegisteredVolunteerIds] = useState<
    string[]
  >([]);
  const [nvName, setNvName] = useState("");
  const [nvRole, setNvRole] = useState("blood");
  const [nvPhone, setNvPhone] = useState("");
  const [nvLoc, setNvLoc] = useState("");
  const [nvScope, setNvScope] = useState("");
  const [showVolRegistration, setShowVolRegistration] = useState(false);
  const [dynamicVolunteers, setDynamicVolunteers] = useState<any[]>([]);
  const [sportName, setSportName] = useState("");
  const [sportOpponent, setSportOpponent] = useState("");
  const [sportDate, setSportDate] = useState("");
  const [sportVenue, setSportVenue] = useState("");
  const [sportPhone, setSportPhone] = useState("");
  const [sportType, setSportType] = useState("tournament");
  const [sportDetails, setSportDetails] = useState("");
  const [showSportForm, setShowSportForm] = useState(false);
  const [dynamicSportsList, setDynamicSportsList] = useState<any[]>([]);

  const GALLERY_PHOTOS = [
    {
      title: "পুঠিয়া রাজপ্রাসাদ",
      cat: "palace",
      desc: "ঐতিহাসিক পুঠিয়া রাজবাড়ী নান্দনিক স্থাপত্যকর্ম...",
      url: "https://example.com/puthia.jpg",
    },
    {
      title: "শিব মন্দির",
      cat: "temple",
      desc: "টেরাকোটা খচিত অপূর্ব শিব মন্দির...",
      url: "https://example.com/shiva.jpg",
    },
    {
      title: "শিব সাগর দিঘি",
      cat: "nature",
      desc: "শান্ত ও মনোরম শিব সাগর দিঘি...",
      url: "https://example.com/shivsagar.jpg",
    },
  ];

  // Tourism Section interactive states
  const [tourismTab, setTourismTab] = useState("places"); // places, gallery, guide, hotels
  const LOCAL_HOTELS = [
    {
      id: "govt_dak",
      name: "সরকারি ডাকবাংলো",
      price: "১০০০ টাকা",
      phone: "০১৭০০-০০০০০০",
      address: "পুঠিয়া সদর",
    },
    {
      id: "hotel_green",
      name: "হোটেল গ্রিন ভিউ",
      price: "১২০০ টাকা",
      phone: "০১৭০০-০০০০০০",
      address: "বানেশ্বর মোড়",
    },
  ];
  const [searchTourQuery, setSearchTourQuery] = useState("");
  const [selectedTourCategory, setSelectedTourCategory] = useState("All");
  const [selectedVideoCategory, setSelectedVideoCategory] = useState("All");
  const [visitedSpots, setVisitedSpots] = useState<string[]>([]);
  const [tourReviews, setTourReviews] = useState<
    Record<
      string,
      Array<{ name: string; rating: number; comment: string; date: string }>
    >
  >({
    rajbari: [
      {
        name: "কবির হোসেন",
        rating: 5,
        comment:
          "অসাধারণ স্থাপত্যকীর্তি! পরিবারের সবাই মিলে ঘুরে এলাম। সুরম্য স্তম্ভ আর বাগানগুলো ভীষণ সুন্দর।",
        date: "১০ জুন ২০২৬",
      },
      {
        name: "সানজিদা আক্তার",
        rating: 4,
        comment:
          "ঐতিহাসিক স্থান হিসেবে বেশ ভালো লেগেছে। তবে সংস্কার কাজগুলোতে ঐতিহ্য বজায় রাখলে চমৎকার হতো।",
        date: "০৫ জুন ২০২৬",
      },
    ],
    shiva: [
      {
        name: "প্রীতম কুমার",
        rating: 5,
        comment:
          "বাংলাদেশের অন্যতম সেরা প্রাচীন মন্দির। চূড়ার কারুকার্য এবং দীঘির জলের প্রতিফলন সত্যি অনন্য দৃশ্য তৈরি করে।",
        date: "২২ মে ২০২৬",
      },
    ],
    govinda: [
      {
        name: "ড. সাজ্জাদ হোসেন",
        rating: 5,
        comment:
          "টেরাকোটার নিখুঁত কাজ দেখে মুগ্ধ হয়েছি! দেয়ালের প্রতিটি ফলক একটি গল্প বলে। গবেষকদের জন্য দারুণ একটি জায়গা।",
        date: "১২ জুন ২০২৬",
      },
    ],
  });
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [submittingReviewFor, setSubmittingReviewFor] = useState<string | null>(
    null,
  );
  const [spotDetailModal, setSpotDetailModal] = useState<any | null>(null);
  const [bookingReceipt, setBookingReceipt] = useState<any | null>(null);
  const [transportOrigin, setTransportOrigin] = useState("dhaka");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [bookingForm, setBookingForm] = useState<any>({
    checkIn: "2026-06-25",
    checkOut: "2026-06-27",
    guests: "2",
    hotelId: "govt_dak",
    roomType: "Non-AC Double Block",
  });
  const [expiredOffers, setExpiredOffers] = useState<Record<string, boolean>>(
    {},
  );
  const handleOfferExpire = (id: string) =>
    setExpiredOffers((prev) => ({ ...prev, [id]: true }));

  // Analytics State
  const [adAnalytics, setAdAnalytics] = useState<
    Record<string, { views: number; shares: number }>
  >({
    clinic: { views: 124, shares: 15 },
    education: { views: 94, shares: 4 },
    showroom: { views: 152, shares: 22 },
  });

  // Real-time Firestore Sync for Community Section
  useEffect(() => {
    if (
      activeSubViewId === "lost_found" ||
      activeSubViewId === "lost_and_found"
    ) {
      const fetchLF = async () => {
        setLoadingLostFound(true);
        try {
          const res = await getLostFoundNotices();
          setLostFoundNotices(res);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingLostFound(false);
        }
      };
      fetchLF();
    } else if (activeSubViewId === "social_events") {
      const fetchSE = async () => {
        setLoadingSocialEvents(true);
        try {
          const res = await getSocialEvents();
          setSocialEvents(res);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSocialEvents(false);
        }
      };
      fetchSE();
    } else if (activeSubViewId === "volunteer_activities") {
      const fetchVA = async () => {
        setLoadingVolunteer(true);
        try {
          const res = await getVolunteerActivities();
          setVolunteerActivities(res);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingVolunteer(false);
        }
      };
      fetchVA();
    } else if (activeSubViewId === "local_issues") {
      const fetchLI = async () => {
        setLoadingIssues(true);
        try {
          const res = await getLocalIssues();
          setLocalIssues(res);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingIssues(false);
        }
      };
      fetchLI();
    }
  }, [activeSubViewId]);

  // 5. Digital Marketplace items
  useEffect(() => {
    if (
      activeSubViewId === "buy_sell" ||
      activeSubViewId === "market_agri_products" ||
      activeSubViewId === "market_local_products" ||
      activeSubViewId === "market_used_products"
    ) {
      const fetchMarketItems = async () => {
        setLoadingMarketplace(true);
        try {
          const res = await getMarketplaceItems();
          setMarketplaceItems(res);
        } catch (e) {
          console.error("Error fetching marketplace items:", e);
        } finally {
          setLoadingMarketplace(false);
        }
      };
      fetchMarketItems();
    }
  }, [activeSubViewId]);

  // Sync Complaints & Grievances
  useEffect(() => {
    if (
      activeSubViewId === "complaint_box" ||
      activeSubViewId === "cmpl_report" ||
      activeSubViewId === "cmpl_status"
    ) {
      const fetchComplaintsData = async () => {
        setIsLoadingComplaints(true);
        try {
          const res = await getComplaints();
          setAllComplaintsList(res);
        } catch (e) {
          console.error("Error fetching complaints:", e);
        } finally {
          setIsLoadingComplaints(false);
        }
      };
      fetchComplaintsData();
    }
  }, [activeSubViewId]);

  // Track Views when Special Offers rendered
  useEffect(() => {
    if (viewId === "shopping") {
      const adIds = ["clinic", "education", "showroom"];
      adIds.forEach((adId) => {
        fetch("/api/analytics/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adId }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.error) {
              setAdAnalytics((prev) => ({ ...prev, [adId]: data }));
            }
          })
          .catch(console.error);
      });
    }
  }, [viewId]);

  useEffect(() => {
    console.log(
      "SubViews useEffect viewId:",
      viewId,
      "tourismTab:",
      tourismTab,
    );
    switch(viewId) {
      case "volunteer_network":
        setCommunityTab("volunteer_network");
        break;
      case "community_programs":
        setCommunityTab("community_programs");
        break;
      case "sports_activities":
        setCommunityTab("sports_activities");
        break;
      case "cultural_activities":
        setCommunityTab("cultural_activities");
        break;
      case "social_organizations":
        setCommunityTab("social_organizations");
        break;
      case "photo_video_gallery":
        setCommunityTab("photo_video_gallery");
        break;
      case "problem_report":
        setIssueTab("new_report");
        break;
      case "citizen_complaint":
        setIssueTab("all");
        break;
      case "road_problem":
      case "electricity_problem":
      case "water_problem":
      case "provide_feedback":
      case "complaint_status":
        setIssueTab("all");
        break;
      case "digital_id_card":
      case "lost_and_found":
      case "local_vote_survey":
      case "citizen_ranking":
      case "verified_business":
      case "community_badge":
      case "upazila_quiz":
      case "local_ads":  
        // not strictly required, but good practice
        break;

      case "edu_school":
        setEduTab("edu_school");
        break;
      case "edu_college":
        setEduTab("edu_college");
        break;
      case "edu_madrasha":
        setEduTab("edu_madrasha");
        break;
      case "edu_coaching":
        setEduTab("edu_coaching");
        break;
      case "education_scholarship":
        setEduTab("education_scholarship");
        break;
      case "career_guideline":
        setEduTab("career_guideline");
        break;
      case "edu_library":
        setEduTab("edu_library");
        break;
      case "job_local_ads":
        setJobSubTab("local");
        break;
      case "job_freelance_res":
        setJobSubTab("freelance");
        break;
      case "job_training_news":
        setJobSubTab("training");
        break;
    }
  }, [viewId]);

  const renderSubViewContent = (activeSubViewId: string | null) => {
    const govtServices = ["ds_birth_reg", "ds_death_reg", "ds_nid_services", "ds_passport", "ds_land_services", "ds_e_mutation", "ds_online_application"];
    const goBackToGovtServices = () => {
      setSelectedSubView("govt_forms");
    };
    const currentOnGoBack = govtServices.includes(activeSubViewId || "") ? goBackToGovtServices : onGoBack;

    switch (activeSubViewId) {
      case "dir_shops_restaurants_pharmacies": return null;
      case "govt_forms": return <GovtServicesInfo onGoBack={onGoBack} setSelectedSubView={setSelectedSubView} />;
      case "all_tools_calculators": return <AllToolsCalculators onGoBack={onGoBack} />;
      case "download_center": return <DownloadCenterPage onGoBack={onGoBack} setSelectedSubView={setSelectedSubView} />;
      case "upazila_admin": return <AdministrativeStructure onGoBack={onGoBack} />;

      case "upazila_tourism":
      case "tourism_heritage": 
        return <TouristSpots onGoBack={onGoBack} onSubSelect={(id) => setSelectedSubView(id)} />;
      case "rent_to_let":
      case "rent_to_let_house":
      case "rent_to_let_shop":
      case "rent_to_let_mess": {
        const category = activeSubViewId.split("_").pop() || "all";
        return <RentToLetHub onGoBack={onGoBack} initialCategory={category === "let" ? "all" : category} />;
      }

      case "upazila_info": return <KeyFacts onGoBack={onGoBack} />;

      case "upazila_quiz":
        return (
          <UpazilaQuiz
            quizSubTab={quizSubTab}
            setQuizSubTab={setQuizSubTab}
            interactiveQuizActive={interactiveQuizActive}
            setInteractiveQuizActive={setInteractiveQuizActive}
            currentQuizQuestionIndex={currentQuizQuestionIndex}
            setCurrentQuizQuestionIndex={setCurrentQuizQuestionIndex}
            selectedQuizAnswers={selectedQuizAnswers}
            setSelectedQuizAnswers={setSelectedQuizAnswers}
            quizScore={quizScore}
            setQuizScore={setQuizScore}
            photoContestName={photoContestName}
            setPhotoContestName={setPhotoContestName}
            photoContestPhone={photoContestPhone}
            setPhotoContestPhone={setPhotoContestPhone}
            photoContestTitle={photoContestTitle}
            setPhotoContestTitle={setPhotoContestTitle}
            photoContestDesc={photoContestDesc}
            setPhotoContestDesc={setPhotoContestDesc}
            megaContestRegistered={megaContestRegistered}
            setMegaContestRegistered={setMegaContestRegistered}
            showMegaRegModal={showMegaRegModal}
            setShowMegaRegModal={setShowMegaRegModal}
            onGoBack={onGoBack}
          />
        );

      case "dir_address_mobile":
      case "dir_business_registration":
      case "shop_directory":
        return (
          <div className="space-y-6">
            {getHeader(
              `🏪 পুঠিয়া ${displayCategoryTitle}`,
              `পুঠিয়া ও বানেশ্বর অঞ্চলের প্রসিদ্ধ ${displayCategoryTitle.toLowerCase()} এবং স্থানীয় ডিরেক্টরি বাতায়ন`,
              "🏪",
            )}

            {/* Tab navigation */}
            <div className="flex flex-wrap gap-2 border-b border-gray-150 pb-3 font-sans">
              <button
                type="button"
                onClick={() => setBizTab("list")}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  bizTab === "list"
                    ? "bg-[#2d5a27] text-white shadow-sm"
                    : "bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-gray-205"
                }`}
              >
                🔎 ব্যবসা ডিরেক্টরি খুঁজুন
              </button>
              <button
                type="button"
                onClick={() => setBizTab("benefits")}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  bizTab === "benefits"
                    ? "bg-[#2d5a27] text-white shadow-sm"
                    : "bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-gray-205"
                }`}
              >
                ⭐ ব্যবসা নিবন্ধনের সুবিধা
              </button>
              <button
                type="button"
                onClick={() => setBizTab("register")}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  bizTab === "register"
                    ? "bg-[#2d5a27] text-white shadow-sm"
                    : "bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-gray-205"
                }`}
              >
                ➕ নতুন ব্যবসা নিবন্ধন পোর্টাল
              </button>
            </div>

            {/* TAB 1: BUSINESS LISTINGS */}
            {bizTab === "list" && (
              <div className="space-y-4">
                {/* Search & Category filter */}
                <div className="bg-white p-4 rounded-2xl border border-[#edeae0] shadow-sm space-y-4 font-sans">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="দোকান, হোটেল, ফার্মেসি কিংবা ঠিকানা দিয়ে সার্চ করুন..."
                        value={bizSearch || ""}
                        onChange={(e) => setBizSearch(e.target.value)}
                        className="w-full bg-neutral-50 pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none font-sans focus:border-[#2d5a27]"
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-xs font-bold text-gray-400 mr-1 shrink-0">
                        ফিল্টার:
                      </span>
                      <button
                        onClick={() => setBizCategory("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                          bizCategory === "all"
                            ? "bg-emerald-50 text-[#2d5a27] border border-emerald-250"
                            : "bg-neutral-50 text-gray-500 hover:bg-neutral-100"
                        }`}
                      >
                        সকল ব্যবসা ({allBusinesses.length})
                      </button>
                      <button
                        onClick={() => setBizCategory("shop")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                          bizCategory === "shop"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-neutral-50 text-gray-500 hover:bg-neutral-100"
                        }`}
                      >
                        🏪 দোকান ও শপিং (
                        {
                          allBusinesses.filter((b) => b.category === "shop")
                            .length
                        }
                        )
                      </button>
                      <button
                        onClick={() => setBizCategory("restaurant")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                          bizCategory === "restaurant"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-neutral-50 text-gray-500 hover:bg-neutral-100"
                        }`}
                      >
                        🍽️ রেস্টুরেন্ট ও মিষ্টি (
                        {
                          allBusinesses.filter(
                            (b) => b.category === "restaurant",
                          ).length
                        }
                        )
                      </button>
                      <button
                        onClick={() => setBizCategory("pharmacy")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                          bizCategory === "pharmacy"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-neutral-50 text-gray-500 hover:bg-neutral-100"
                        }`}
                      >
                        💊 ফার্মেসি (
                        {
                          allBusinesses.filter((b) => b.category === "pharmacy")
                            .length
                        }
                        )
                      </button>
                      <button
                        onClick={() => setBizCategory("other")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                          bizCategory === "other"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-neutral-50 text-gray-500 hover:bg-neutral-100"
                        }`}
                      >
                        💼 অন্যান্য (
                        {
                          allBusinesses.filter((b) => b.category === "other")
                            .length
                        }
                        )
                      </button>
                    </div>
                  </div>

                  {bizSearch && (
                    <p className="text-xs text-gray-450">
                      সার্চ রেজাল্ট: <strong>&ldquo;{bizSearch}&rdquo;</strong>{" "}
                      মিল রেখে মোট <strong>{filteredBiz.length}টি</strong>{" "}
                      ব্যবসা খুঁজে পাওয়া গিয়েছে।
                    </p>
                  )}
                </div>

                {/* Businesses Cards Map */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
                  {filteredBiz.length > 0 ? (
                    filteredBiz.map((biz) => {
                      const isFeatured = biz.featured;
                      return (
                        <div
                          key={biz.id}
                          className={`bg-white rounded-2xl p-5 border transition duration-250 flex flex-col justify-between space-y-4 shadow-3xs relative ${
                            isFeatured
                              ? "border-emerald-500/30 bg-emerald-50/5 hover:border-emerald-500"
                              : "border-[#edeae0] hover:border-emerald-300"
                          }`}
                        >
                          {isFeatured && (
                            <span className="absolute top-3.5 right-3.5 text-[10px] uppercase tracking-wider bg-emerald-100 text-[#2d5a27] font-black px-2 py-0.5 rounded-md">
                              ⭐ স্পেশাল ফিচারড
                            </span>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="w-11 h-11 bg-[#2d5a27]/10 text-xl border border-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                                {biz.icon}
                              </span>
                              <div>
                                <h4 className="font-serif font-black text-[#2d5a27] text-base leading-tight flex items-center gap-1">
                                  {biz.name}
                                  {biz.verified && (
                                    <span
                                      className="text-blue-500"
                                      title="অফিসিয়াল ভেরিফাইড ব্যবসা"
                                    >
                                      ☑️
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                  <span className="font-bold bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded-md">
                                    {biz.categoryLabel}
                                  </span>
                                  <span className="text-amber-500 font-bold">
                                    ★ {biz.rating}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed pt-1.5 border-t border-neutral-100 min-h-[50px]">
                              {biz.description}
                            </p>
                          </div>

                          <div className="text-xs space-y-1 bg-neutral-50/50 p-3 rounded-xl border border-neutral-100 font-sans text-gray-500">
                            <p className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>
                                <strong>ঠিকানা:</strong> {biz.address}
                              </span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>
                                <strong>মোবাইল:</strong> {biz.phone}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 font-sans">
                            <button
                              onClick={() =>
                                onSimulateCall(biz.phone, biz.name)
                              }
                              className="flex-1 bg-[#2d5a27]/10 hover:bg-[#2d5a27] hover:text-white text-[#2d5a27] font-extrabold py-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 border border-[#2d5a27]/15"
                            >
                              <Phone className="w-3.5 h-3.5" /> সরাসরি কথা বলুন
                            </button>
                            <button
                              onClick={() =>
                                alert(
                                  `ঠিকানা '${biz.address}' গুগল ম্যাপসে সফলভাবে লোড করা হচ্ছে।`,
                                )
                              }
                              className="px-3 py-2 bg-white hover:bg-neutral-50 text-gray-600 border border-gray-205 rounded-xl text-xs transition cursor-pointer"
                              title="মানচিত্রে দেখুন"
                            >
                              🗺️ ম্যাপ
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-1 md:col-span-2 bg-[#f4f2ea] p-8 rounded-2xl text-center text-gray-500 space-y-2">
                      <span className="text-4xl block">🔍</span>
                      <strong className="text-sm block">
                        কোনো ব্যবসা মিল খুঁজে পাওয়া যায়নি
                      </strong>
                      <p className="text-xs text-gray-400">
                        ফিল্টার ক্যাটাগরি পরিবর্তন করে অথবা পুনরায় সঠিক বানানে
                        চেষ্টা করুন
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: REGISTRATION BENEFITS */}
            {bizTab === "benefits" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch font-sans">
                {/* Benefits checklist illustration */}
                <div className="lg:col-span-7 bg-white p-6 border border-[#edeae0] rounded-2xl space-y-6">
                  <div className="border-b border-gray-150 pb-3">
                    <span className="text-[#2d5a27] font-black text-xs block uppercase tracking-wide">
                      🏆 পোর্টালের বিশ্বস্ততা
                    </span>
                    <h4 className="font-serif font-black text-lg text-gray-800 mt-1">
                      পৌরসভা ও উপজেলা ব্যবসা নিবন্ধনের প্রধান সুবিধা
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      আপনার ব্যবসাকে অনলাইনে ডিজিটালভাবে প্রচার করে নতুন গ্রাহক
                      তৈরি করুন
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3.5 items-start">
                      <span className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2d5a27] border border-emerald-100 flex items-center justify-center text-lg font-black shrink-0">
                        📈
                      </span>
                      <div className="space-y-0.5">
                        <strong className="text-sm font-bold text-gray-800 block">
                          ১. ডিজিটাল প্রচার ও অনলাইন ভিজিবিলিটি
                        </strong>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          পুঠিয়া ও বানেশ্বর অঞ্চলের ১০ হাজার+ দৈনিক সক্রিয়
                          নাগরিকের দোরগোড়ায় আপনার ব্যবসাকে খুব সহজেই বিনামূল্যে
                          পৌঁছে দিন।
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3.5 items-start">
                      <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-lg font-black shrink-0">
                        📞
                      </span>
                      <div className="space-y-0.5">
                        <strong className="text-sm font-bold text-gray-800 block">
                          ২. সরাসরি ক্রেতা সংযোগ ও বিনা মূল্যে বিজ্ঞাপন
                        </strong>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          মাঝখানে কোনো মধ্যস্বত্বভোগী ছাড়া স্থানীয় ক্রেতারা
                          সরাসরি আপনার স্টোরে মোবাইল কল করে অর্ডার অথবা অগ্রিম
                          বুকিং করতে পারবেন।
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3.5 items-start">
                      <span className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center text-lg font-black shrink-0">
                        📍
                      </span>
                      <div className="space-y-0.5">
                        <strong className="text-sm font-bold text-gray-800 block">
                          ৩. গুগল ম্যাপ লোকেশন গাইড ও কন্টাক্ট ইনফো
                        </strong>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          আপনার দোকানের সঠিক পথনির্দেশিকাসহ মোবাইল নম্বর
                          অন্তর্ভুক্ত করে দিন যেন পর্যটক ও নবাগত নাগরিকরা সহজেই
                          আপনার ঠিকানা খুঁজে পান।
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3.5 items-start">
                      <span className="w-10 h-10 rounded-xl bg-teal-50 text-[#2d5a27] border border-emerald-100 flex items-center justify-center text-lg font-black shrink-0">
                        🛡️
                      </span>
                      <div className="space-y-0.5">
                        <strong className="text-sm font-bold text-gray-800 block">
                          ৪. ডিজিটাল ট্রাস্ট ও ভেরিফাইড ব্যাজ
                        </strong>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          নিবন্ধনের পর উপজেলা বা পৌরসভা আইসিটি সেল কর্তৃক
                          স্বত্বাধিকারী সত্যতা নিশ্চিত করে প্রোফাইলে একটি নীল
                          ভেরিফাইড ব্যাজ প্রদান করা হয়, যা ক্রেতার আস্তা বাড়াতে
                          অতুলনীয়।
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl font-sans text-xs text-amber-800 flex items-start gap-2 leading-relaxed">
                    <span>💡</span>
                    <p>
                      <strong>ভোক্তাদের আস্থা বাড়াতে পরামর্শ:</strong> আপনার
                      ক্যাটাগরিতে ফার্মেসি বা ফুড বাতায়নের বিবরণী সঠিক ও নির্ভুল
                      রাখুন এবং সবসময় সক্রিয় মোবাইল নম্বর সরবরাহ করুন।
                    </p>
                  </div>
                </div>

                {/* Info graphics banner card */}
                <div className="lg:col-span-5 bg-gradient-to-br from-[#2d5a27] to-[#1e3d1a] p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <span className="text-[10px] tracking-wider uppercase bg-white/15 px-2.5 py-0.5 rounded-full inline-block font-black">
                      📢 আইসিটি সেল বিশেষ সংবাদ
                    </span>
                    <h3 className="font-serif font-black text-2xl leading-snug">
                      পুঠিয়া উপজেলাকে ডিজিটাল স্মার্ট হাব গঠনে এগিয়ে আসুন
                    </h3>
                    <p className="text-xs text-white/80 leading-relaxed font-sans">
                      আপনার ব্যবসাকে এই অনলাইনের ডিরেক্টরিতে অন্তর্ভুক্ত করে
                      পুঠিয়ার স্থানীয় অর্থনীতির ডিজিটাল প্রবৃদ্ধিতে যুক্ত করুন।
                    </p>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl border border-white/10 text-xs space-y-2">
                    <strong className="block text-amber-200">
                      📊 ডিরেক্টরি পারফরম্যান্স একনজরে:
                    </strong>
                    <div className="grid grid-cols-2 gap-3 pt-1 text-center">
                      <div className="bg-black/15 p-2 rounded-lg">
                        <span className="text-lg font-black block text-emerald-300">
                          ১,১৫০+
                        </span>
                        <span className="text-[10px] text-white/60 block">
                          নিবন্ধিত স্থানীয় শপ
                        </span>
                      </div>
                      <div className="bg-black/15 p-2 rounded-lg">
                        <span className="text-lg font-black block text-emerald-300">
                          ৭,৫০০+
                        </span>
                        <span className="text-[10px] text-white/60 block">
                          মাসিক ভিজিটর
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setBizTab("register")}
                    className="w-full bg-white hover:bg-neutral-100 text-[#2d5a27] font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm text-center font-serif flex items-center justify-center gap-1"
                  >
                    🚀 আজই আপনার দোকান রেজিস্টার করুন{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: REGISTRATION FORM PORTAL */}
            {bizTab === "register" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
                {/* Form Column */}
                <div className="lg:col-span-7 bg-white p-5 border border-[#edeae0] rounded-2xl shadow-xs">
                  <div className="border-b border-gray-150 pb-3 mb-4">
                    <h4 className="font-serif font-black text-base text-[#2d5a27]">
                      📋 স্থানীয় ব্যবসা নিবন্ধন অ্যাপ্লিকেশন ফর্ম
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      সব বিবরণ সঠিক বাংলা ভাষায় এবং মোবাইল নম্বর সতর্কতার সাথে
                      প্রবেশ করুন
                    </p>
                  </div>

                  {bizRegSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-4 text-xs text-emerald-850 animate-fade-in font-sans">
                      <div className="flex items-center gap-2.5 text-[#2d5a27]">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        <strong className="text-sm font-bold block">
                          অভিনন্দন! আপনার ব্যবসা সফলভাবে নিবন্ধিত হয়েছে।
                        </strong>
                      </div>
                      <p>
                        আপনার প্রদত্ত তথ্যপত্রটি উপজেলা ডিজিটাল ডিরেক্টরিতে
                        তাৎক্ষণিকভাবে যোগ করা হয়েছে। সাধারণ ডিরেক্টরি ট্যাবে
                        গিয়ে এখনই আপনি এটি দেখতে পারবেন।
                      </p>

                      <div className="bg-white/80 p-4 rounded-xl border border-emerald-100 font-mono text-gray-800 space-y-1">
                        <p className="text-[9px] uppercase tracking-wider text-gray-400">
                          ডিজিটাল ট্র্যাকিং কোড
                        </p>
                        <strong className="text-base font-black">
                          PUTHIA-BIZ-
                          {Math.floor(Math.random() * 900000 + 100000)}
                        </strong>
                        <div className="pt-2 text-[11px] leading-relaxed font-sans text-gray-600 space-y-0.5">
                          <p>
                            • <strong>দোকান:</strong> {bizRegName}
                          </p>
                          <p>
                            • <strong>যোগাযোগ:</strong> {bizRegPhone}
                          </p>
                          <p>
                            • <strong>ক্যাটাগরি:</strong>{" "}
                            {bizRegCat === "shop"
                              ? "দোকান ও ফ্যাশন"
                              : bizRegCat === "restaurant"
                                ? "রেস্টুরেন্ট ও মিষ্টি"
                                : bizRegCat === "pharmacy"
                                  ? "ফার্মেসি ও স্বাস্থ্যসেবা"
                                  : "অন্যান্য"}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-white/40 rounded-xl text-[11px] leading-relaxed text-[#2d5a27]/90 font-medium">
                        💡 <strong>ভেরিফিকেশন নির্দেশনা:</strong> আগামী ৭
                        কার্যদিবসের মধ্যে উপজেলা আইসিটি সেল আপনার মোবাইল নম্বরে
                        ও ঠিকানায় এসে স্বত্বাধিকার পরীক্ষা সম্পন্ন করে ডিজিটাল
                        ব্লু ভেরিফাইড টিক প্রদান করবে।
                      </div>

                      <button
                        onClick={() => {
                          setBizRegSuccess(false);
                          setBizRegName("");
                          setBizRegPhone("");
                          setBizRegAddress("");
                          setBizRegDesc("");
                          setBizTab("list");
                        }}
                        className="w-full bg-[#2d5a27] hover:bg-[#1a3a18] text-white font-extrabold py-2 rounded-xl text-xs transition cursor-pointer"
                      >
                        ফিরে যান ডিরেক্টরি তালিকায়
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleBizRegSubmit}
                      className="space-y-4 text-xs text-gray-650 font-sans"
                    >
                      <div className="space-y-1">
                        <label className="font-bold">
                          ব্যবসা অথবা দোকানের অফিশিয়াল নাম *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: পুঠিয়া শাহী কসমেটিকস ও বস্ত্রবিতান"
                          value={bizRegName || ""}
                          onChange={(e) => setBizRegName(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 outline-none p-2.5 rounded-lg text-gray-750 font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold">
                            ব্যবসার ক্যাটাগরি *
                          </label>
                          <select
                            value={bizRegCat || ""}
                            onChange={(e) => setBizRegCat(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 outline-none p-2.5 rounded-lg font-bold text-gray-800"
                          >
                            <option value="shop">🏪 দোকান ও ফ্যাশন</option>
                            <option value="restaurant">
                              🍽️ রেস্টুরেন্ট ও মিষ্টি
                            </option>
                            <option value="pharmacy">
                              💊 ফার্মেসি ও স্বাস্থ্যসেবা
                            </option>
                            <option value="other">
                              💼 অন্যান্য কমার্শিয়াল ব্যবসা
                            </option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold">
                            সক্রিয় মোবাইল নম্বর *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮"
                            value={bizRegPhone || ""}
                            onChange={(e) => setBizRegPhone(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 outline-none p-2.5 rounded-lg text-gray-750 font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold">
                          পূর্ণাঙ্গ ঠিকানা (গ্রাম, ইউনিয়ন অথবা বাজার লোকেশন) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: পুঠিয়া রাজবাড়ী মাঠ সংলগ্ন মার্কেট, পুঠিয়া পৌরসভা"
                          value={bizRegAddress || ""}
                          onChange={(e) => setBizRegAddress(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 outline-none p-2.5 rounded-lg text-gray-750 font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold">
                          ব্যবসার সংক্ষিপ্ত বিবরণ ও প্রধান পণ্য *
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="আপনার দোকান বা রেস্টুরেন্টে কী কী স্পেশাল খাবার, ফার্নিচার, ঔষধ বা ক্লথিং আইটেম পাওয়া যায় তা সংক্ষেপে ক্রেতাদের জন্য বুঝিয়ে লিখুন..."
                          value={bizRegDesc || ""}
                          onChange={(e) => setBizRegDesc(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 outline-none p-2.5 rounded-lg text-gray-750 font-medium leading-relaxed"
                        ></textarea>
                      </div>

                      <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-850 rounded-xl leading-relaxed text-[10px]">
                        <strong>⚠️ আইনি অঙ্গীকারনামা:</strong> পুঠিয়া স্থানীয়
                        ব্যবসা আইন অনুযায়ী যেকোনো অবৈধ ব্যবসা, জাল ওষুধ অথবা
                        অস্বাস্থ্যকর খাদ্য উৎপাদনকারী হোটেল নিবন্ধন দণ্ডনীয়
                        অপরাধ। সকল তথ্য অবশ্যই সত্য হতে হবে।
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#2d5a27] hover:bg-[#153112] text-white font-extrabold py-2.5 rounded-xl transition cursor-pointer font-serif flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        🚀 অ্যাপ্লিকেশন সাবমিট করুন ও ডিরেক্টরিতে যুক্ত হন
                      </button>
                    </form>
                  )}
                </div>

                {/* Helpful tips column */}
                <div className="lg:col-span-5 bg-white p-5 border border-[#edeae0] rounded-2xl shadow-xs space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h4 className="font-serif font-black text-sm text-[#2d5a27]">
                      💡 নিবন্ধন সহায়িকা ও তথ্যকোষ
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      নিবন্ধন সম্পর্কিত অতি সাধারণ কিছু প্রশ্ন ও তার উত্তর
                    </p>
                  </div>

                  <div className="space-y-3.5 text-xs text-gray-650">
                    <div className="space-y-1">
                      <strong className="text-gray-800 font-bold block">
                        • ব্যবসা নিবন্ধন করতে কি কোনো ফি দিতে হয়?
                      </strong>
                      <p className="text-gray-550 leading-relaxed">
                        না, পুঠিয়া উপজেলা আইসিটি সেলের উদ্যোগে ডিজিটালাইজেশন
                        ত্বরান্বিত করার লক্ষে এই ডিরেক্টরি বাতায়নটি একদম{" "}
                        <strong>বিনামূল্যে</strong> পরিচালিত হচ্ছে।
                      </p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-gray-800 font-bold block">
                        • ভেরিফাইড ব্যাজ কিভাবে পাওয়া সম্ভব?
                      </strong>
                      <p className="text-gray-550 leading-relaxed">
                        নিবন্ধন আবেদন সাবমিট করার পর আমাদের ভেরিফিকেশন অফিসার
                        আপনার দোকানে নিজে গিয়ে সরেজমিনে ট্রেড লাইসেন্স এবং
                        মালিকানা সত্যতা পরীক্ষা করে ভেরিফাইড করে দেবেন।
                      </p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-gray-800 font-bold block">
                        • আমার তথ্য কি সংশোধন করা যাবে?
                      </strong>
                      <p className="text-gray-550 leading-relaxed">
                        হ্যাঁ, ভবিষ্যতে আপনার ব্যবসা বা মোবাইল নম্বর সংশোধন করতে
                        চাইলে উপজেলা তথ্য কেন্দ্রের ইমেইলে অথবা সরাসরি যোগাযোগ
                        করে হালনাগাদ করতে পারবেন।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "utility_services":
        return (
          <UtilityServicesView
            contacts={utilityContactsData}
            search={utilitySearch}
            union={utilityUnionFilter}
            onSearchChange={setUtilitySearch}
            onUnionChange={setUtilityUnionFilter}
            onSimulateCall={onSimulateCall}
            headerElement={getHeader(
              "ইউটিলিটি ও ব্লক সুপারভাইজার সেবা",
              "বিদ্যুৎ গোলযোগ মেরামতকারী, উন্নত কৃষি পরামর্শের জন্য উপ-সহকারী কৃষি অফিসার এবং ডিজিটাল সার্ভিস উদ্যোক্তাদের ডিরেক্টরি",
              "⚡",
            )}
          />
        );

      case "utility_services_legacy":
        return null;

      case "agriculture_fishery": {
        const currentTemp = (32.3 + (agriWeatherOffset % 5) * 0.4).toFixed(1);
        const currentHumidity = 65 + (agriWeatherOffset % 3) * 5;
        const currentWind = 12 + (agriWeatherOffset % 4) * 2;
        const currentRain = agriWeatherOffset % 2 === 0 ? "১৫%" : "৪৫%";

        const cropsList = [
          {
            id: "mango",
            name: "আম (উত্তরবঙ্গের প্রধান সুমিষ্ট শস্য)",
            soil: "দো-আঁশ ও উর্বর পলি মাটি",
            time: "বৈশাখ হতে আষাঢ় (আম সংগ্রহ ও বাজারজাতকরণ কাল)",
            varieties:
              "আম্রপালি, গোপালভোগ, ল্যাংড়া, ফজলীলী, খীরসাপাত (হিমসাগর)",
            pests:
              "হপার পোকার আক্রমণ প্রতিরোধে কার্বারিল গ্রুপের কীটনাশক প্রয়োগ করতে হবে মুকুল ফুল ও গুটি আসার সময়ে।",
            fertilizer:
              "গাছের বয়স ভেদে ইউরিয়া ও টিএসপি সার সুষম মাত্রায় দিতে হবে।",
          },
          {
            id: "betel",
            name: "মিষ্টি পান (ভালুকগাছীর ঐতিহ্যবাহী পান)",
            soil: "উঁচু ও সুনিষ্কাশিত পলি দোআঁশ মাটি",
            time: "ভাদ্র-আশ্বিন ও ফাল্গুন-চৈত্র মাস",
            varieties: "বাংলা পান, মিষ্টি পান, সাঁচি পান",
            pests:
              "পাতাপচা রোগ দমনে ট্রাইকোডার্মা ও বোর্দো মিক্সচার খুবই কার্যকর এবং গাছের চারপাশ পরিষ্কার রাখুন।",
            fertilizer:
              "পানের বোরজে খৈল ও গোবর সার প্রয়োগ সবচেয়ে বেশি কার্যকর।",
          },
          {
            id: "sugarcane",
            name: "আখ চাষ (পুঠিয়া ও নাটোর অঞ্চলের চিনি শিল্প)",
            soil: "ভারী দো-আঁশ ও এঁটেল দোআঁশ নিষ্কাশন যুক্ত জমি",
            time: "কার্তিক হতে ফাল্গুন মাস",
            varieties: "ঈশ্বরদী-৩৯, ঈশ্বরদী-৪০, রংপুরের লাল আখ",
            pests:
              "মাজরা পোকা দমনে কার্বোফুরান ৩জি ব্যবহার এবং কান্ডপচা রোগ এড়াতে রোগমুক্ত বীজ ব্যবহার আবশ্যক।",
            fertilizer:
              "হেক্টর প্রতি ১৫০ কেজি নাইট্রোজেন এবং ট্রিপল সুপার ফসফেট দিতে হবে।",
          },
          {
            id: "paddy",
            name: "উন্নত বোরো ও আমন ধান চাষ",
            soil: "উর্বর এঁটেল ও পলি দোআঁশ মাটি",
            time: "আমন: আষাঢ়-শ্রাবণ, বোরো: অগ্রহায়ণ-পৌষ",
            varieties:
              "ব্রি ধান-২৮, ব্রি ধান-২৯, ব্রি ধান-৮৯, ব্রি ধান-৯২, বিনা ধান-১৭",
            pests:
              "বাদামী গাছফড়িং (কারেন্ট পোকা) দমনে হাতজাল ব্যবহার ও স্প্রে করুন। আলোর ফাঁদ বসিয়ে পোকা নিয়ন্ত্রণ করুন।",
            fertilizer:
              "লগিং এড়াতে পটাশ সার ব্যবহার করুন এবং গুটি ইউরিয়া প্রয়োগ করুন।",
          },
          {
            id: "vegetable",
            name: "আলু ও শীতকালীন আধুনিক শাকসবজি",
            soil: "হালকা বেলে দোআঁশ কাদা বিহীন মাটি",
            time: "কার্তিক হতে অগ্রহায়ণ মাস",
            varieties:
              "ডায়মন্ড আলু, লাল আলু, কার্ডিনাল, বারি হাইব্রিড বেগুন ও ফুলকপি",
            pests:
              "আলুর লেট ব্লাইট (নাবি ধসা) রোগ দমনে ম্যানকোজেব গ্রুপের ছত্রাকনাশক ৭-১০ দিন পরপর ব্যবহার করুন।",
            fertilizer:
              "জৈব সার বা কম্পোস্ট ব্যবহারের পরিমাণ বৃদ্ধি করুন এবং বোরণ সার সামান্য যোগ করুন।",
          },
        ];

        const filteredCrops = cropsList.filter((crop) => {
          if (agriCropFilter === "all") return true;
          return crop.id === agriCropFilter;
        });

        const marketPricesData = {
          baneshwar: [
            {
              id: "paddy",
              name: "মিনিকেট ধান (উন্নত)",
              unit: "১ মণ (৪০ কেজি)",
              oldPrice: "১,৫৫০",
              currentPrice: "১,৫৮০",
              trend: "up",
              baseNum: 1580,
            },
            {
              id: "mango",
              name: "আম চারু (আম্রপালি/হিমসাগর)",
              unit: "১ মণ (৪০ কেজি)",
              oldPrice: "৩,৫০০",
              currentPrice: "৩,৭০০",
              trend: "up",
              baseNum: 3700,
            },
            {
              id: "betel",
              name: "ভালুকগাছীর মিষ্টি পান",
              unit: "১ পণ (৮০টি)",
              oldPrice: "২৫০",
              currentPrice: "২৮০",
              trend: "up",
              baseNum: 280,
            },
            {
              id: "sugarcane",
              name: "লাল মিষ্টি আখ (কুশিয়ার)",
              unit: "১০০ পিস",
              oldPrice: "২,২০০",
              currentPrice: "২,০০০",
              trend: "down",
              baseNum: 2000,
            },
            {
              id: "potato",
              name: "ডায়মন্ড গোল আলু",
              unit: "১ কেজি",
              oldPrice: "৩৮",
              currentPrice: "৩৫",
              trend: "down",
              baseNum: 35,
            },
            {
              id: "onion",
              name: "দেশী পেঁয়াজ (লাল)",
              unit: "১ কেজি",
              oldPrice: "৭০",
              currentPrice: "৭৫",
              trend: "up",
              baseNum: 75,
            },
          ],
          sadar: [
            {
              id: "paddy",
              name: "আটাশ ধান (খুচরা)",
              unit: "১ মণ (৪০ কেজি)",
              oldPrice: "১,৪৫০",
              currentPrice: "১,৪৬০",
              trend: "up",
              baseNum: 1460,
            },
            {
              id: "potato",
              name: "নতুন গোল আলু",
              unit: "১ কেজি",
              oldPrice: "৪০",
              currentPrice: "৩৮",
              trend: "down",
              baseNum: 38,
            },
            {
              id: "onion",
              name: "দেশী পেঁয়াজ (খুচরা)",
              unit: "১ কেজি",
              oldPrice: "৭৮",
              currentPrice: "৮২",
              trend: "up",
              baseNum: 82,
            },
            {
              id: "green_chili",
              name: "কাঁচামরিচ (দেশী)",
              unit: "১ কেজি",
              oldPrice: "১২০",
              currentPrice: "১১০",
              trend: "down",
              baseNum: 110,
            },
            {
              id: "fish",
              name: "রুই মাছ (পুকুরের তাজা)",
              unit: "১ কেজি",
              oldPrice: "৩২০",
              currentPrice: "৩৫০",
              trend: "up",
              baseNum: 350,
            },
          ],
        };

        const activeTable =
          agriMarketFilter === "baneshwar"
            ? marketPricesData.baneshwar
            : marketPricesData.sadar;

        const calculatorItems = [
          {
            value: "paddy",
            label: "উন্নত ধান (১,৫৮০ টাকা/মণ)",
            rate: 1580,
            unit: "মণ",
          },
          {
            value: "mango",
            label: "হিমসাগর আম (৩,৭০০ টাকা/মণ)",
            rate: 3700,
            unit: "মণ",
          },
          {
            value: "betel",
            label: "ভালুকগাছীর পানের পণ (২৮০ টাকা/পণ)",
            rate: 280,
            unit: "পণ",
          },
          {
            value: "sugarcane",
            label: "মিষ্টি আখ (২০ টাকা/পিস)",
            rate: 20,
            unit: "পিস",
          },
          {
            value: "potato",
            label: "গোল আলু (৩৫ টাকা/কেজি)",
            rate: 35,
            unit: "কেজি",
          },
          {
            value: "onion",
            label: "লাল পেঁয়াজ (৭৫ টাকা/কেজি)",
            rate: 75,
            unit: "কেজি",
          },
        ];

        const selectedCalc =
          calculatorItems.find((item) => item.value === agriCalcItem) ||
          calculatorItems[0];
        const calculatedTotal = (
          selectedCalc.rate * parseFloat(agriCalcQty || "0")
        ).toLocaleString("bn-BD");

        const officersList = [
          {
            name: "জি. এম. আব্দুল্লাহ আল কাফী",
            role: "উপজেলা কৃষি কর্মকর্তা (Upazila Agriculture Officer)",
            area: "পুঠিয়া কার্যালয়",
            phone: "০১৭২৩-৪৫৬৭৮৯",
            expert: "শস্য রোগদমন ও ফসলের নিবিড়তা লাভ",
          },
          {
            name: "মোছাঃ মাহবুবা পারভীন",
            role: "উপজেলা মৎস্য কর্মকর্তা (Upazila Fisheries Officer)",
            area: "পুঠিয়া কার্যালয় ও বিল অঞ্চল",
            phone: "০১৭৩৪-৫৬৭৮৯০",
            expert: "পুকুরের পোনা সংরক্ষণ ও আধুনিক মৎস্যচাষ",
          },
          {
            name: "ডা. মোহাঃ মইদুল ইসলাম",
            role: "উপজেলা প্রাণিসম্পদ অফিসার (Veterinary Surgeon)",
            area: "প্রাণিসম্পদ দপ্তর, পুঠিয়া",
            phone: "০১৭৪৫-৬৭৮৯০১",
            expert: "ডেইরি ও মুরগির খামার স্বাস্থ্য সমাধান",
          },
          {
            name: "মোঃ সাজ্জাদ হোসেন",
            role: "উপ-সহকারী কৃষি কর্মকর্তা (SAAO)",
            area: "৩নং বানেশ্বর পৌর ব্লক",
            phone: "০১৭৫৬-৭৮৯০১২",
            expert: "আমের মুকুল সুরক্ষা ও আধুনিক পানের বরজ পরিচর্যা",
          },
          {
            name: "মোছাঃ নাজমুন নাহার",
            role: "উপ-সহকারী কৃষি কর্মকর্তা (SAAO)",
            area: "৪নং ভালুকগাছী ও বেলপুকুরিয়া ব্লক",
            phone: "০১৭৬৭-৮৯০১২৩",
            expert: "শীতকালীন সবজি এবং পানের ড্যাম্পিং অফ দমনে বিশেষজ্ঞ",
          },
        ];

        return (
          <div className="space-y-6 animate-fade-in">
            {getHeader(
              "🌾 কৃষি ও মৎস্য উন্নয়ন বাতায়ন",
              "উপজেলা কৃষি সেল: পুঠিয়া ও বানেশ্বর অঞ্চলের রিয়েল-টাইম আবহাওয়া পরামর্শ, সুনির্দিষ্ট শস্য গাইড, পাইকারি বাজারদর ও কর্মকর্তা সহায়তা কেন্দ্র",
              "🌾",
            )}

            {/* Sub Tabs Selection */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 font-sans">
              <button
                onClick={() => setAgriTab("weather")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  agriTab === "weather"
                    ? "bg-[#2d5a27] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-neutral-50 hover:text-gray-900 border border-neutral-200"
                }`}
              >
                ⛅ আবহাওয়া আপডেট
              </button>
              <button
                onClick={() => setAgriTab("advice")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  agriTab === "advice"
                    ? "bg-[#2d5a27] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-neutral-50 hover:text-gray-900 border border-neutral-200"
                }`}
              >
                🌱 ফসল চাষের পরামর্শ
              </button>
              <button
                onClick={() => setAgriTab("prices")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  agriTab === "prices"
                    ? "bg-[#2d5a27] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-neutral-50 hover:text-gray-900 border border-neutral-200"
                }`}
              >
                📊 পাইকারি বাজারদর
              </button>
              <button
                onClick={() => setAgriTab("officers")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  agriTab === "officers"
                    ? "bg-[#2d5a27] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-neutral-50 hover:text-gray-900 border border-neutral-200"
                }`}
              >
                📞 কর্মকর্তা ক্যাবিনেট ও জিজ্ঞাসা
              </button>
            </div>

            {/* TAB VIEW 1: WEATHER */}
            {agriTab === "weather" && (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-emerald-50/70 to-sky-50 border border-sky-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[#2d5a27]/10 text-[#2d5a27] px-3 py-1 rounded-full font-sans font-bold">
                        �� পুঠিয়া, রাজশাহী
                      </span>
                      <span className="text-xs bg-sky-100 text-sky-800 px-3 py-1 rounded-full font-sans font-bold animate-pulse">
                        ● রিয়েল-টাইম লাইভ
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-gray-800 tracking-tight font-serif">
                        {currentTemp}°C
                      </span>
                      <span className="text-base font-bold text-gray-600 font-sans">
                        روদেলা ও আংশিক মেঘলা
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-sans">
                      আজকের বায়ুর আর্দ্রতা: <strong>{currentHumidity}%</strong>{" "}
                      | বাতাসের গতি: <strong>{currentWind} কিমি/ঘণ্টা</strong> |
                      বৃষ্টিপাতের সম্ভাবনা: <strong>{currentRain}</strong>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => setAgriWeatherOffset((prev) => prev + 1)}
                      className="px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-gray-700 rounded-xl shadow-2xs transition-colors flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      🔄 লাইভ রিফ্রেশ ও সিঙ্ক করুন
                    </button>
                  </div>
                </div>

                {/* Grid for weather notifications / farm advisories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-[#edeae0] space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 text-amber-600 font-bold">
                      <span className="text-xl">⚠️</span>
                      <h4 className="font-serif">চলতি সপ্তাহের সতর্কবার্তা</h4>
                    </div>
                    <p className="text-xs text-[#5a5a50] leading-relaxed font-sans font-medium">
                      পরবর্তী ৪৭ ঘণ্টার মধ্যে উত্তরবঙ্গে হালকা কালবৈশাখী ও
                      বৃষ্টিপাতের সম্ভাবনা রয়েছে। যারা বোরো ধান বা তোষা পাট কেটে
                      ফেলেছেন, তারা দ্রুত শুকিয়ে নিরাপদ স্থানে সংরক্ষণ করুন এবং
                      নিচু জমির তরমুজ তুলে ফেলুন।
                    </p>
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md inline-block">
                      জরুরি অগ্রাধিকার
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#edeae0] space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 text-[#2d5a27] font-bold">
                      <span className="text-xl">🥭</span>
                      <h4 className="font-serif">
                        বানেশ্বর আমের আবহাওয়া টিপস
                      </h4>
                    </div>
                    <p className="text-xs text-[#5a5a50] leading-relaxed font-sans font-medium">
                      সুমিষ্ট আমের বোঁটা শক্ত করতে এবং শিলাবৃষ্টিজনিত ক্ষতি
                      প্রশমন করতে এই রোদ-মেঘলার সময়ে হালকা পানি স্প্রে ও হপার
                      দমনে নির্ধারিত ছত্রাকনাশক তরল ব্যবহারে যত্নশীল হন।
                    </p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md inline-block">
                      শস্য সংরক্ষণ গাইড
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#edeae0] space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold">
                      <span className="text-xl">📊</span>
                      <h4 className="font-serif">স্মার্ট সেচ নির্দেশনা</h4>
                    </div>
                    <p className="text-xs text-[#5a5a50] leading-relaxed font-sans font-medium">
                      বর্তমান আর্দ্রতা বেশ সন্তোষজনক পর্যায়ে রয়েছে। আখের জমিতে
                      এবং পানের বোরজে অতিরিক্ত খৈল বা পানি সেচ এড়িয়ে চলুন। রাতের
                      বেলায় ঠান্ডা জলীয় বাষ্পের কারণে ভোরে সেচ দেওয়াই
                      বুদ্ধিমানের কাজ হবে।
                    </p>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md inline-block">
                      সম্পদ সাশ্রয়
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 2: CROP ADVICE */}
            {agriTab === "advice" && (
              <div className="space-y-6 animate-fade-in font-sans text-xs">
                <div className="bg-white p-5 rounded-2xl border border-[#edeae0] space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-150 pb-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="text-sm font-serif font-black text-gray-800">
                        🌱 উপ-সহকারী কৃষি কর্মকর্তা নির্দেশিত সুনির্দিষ্ট শস্য
                        নির্দেশনা
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        আপনার শস্য নির্বাচন করে প্রয়োজনীয় মাটি, সার পদ্ধতি ও
                        রোগবালাই প্রতিরোধ জানুন
                      </p>
                    </div>

                    {/* Crop Filter Dropdown */}
                    <div className="w-full sm:w-auto shrink-0 font-sans">
                      <select
                        value={agriCropFilter || ""}
                        onChange={(e) =>
                          setAgriCropFilter(e.target.value as any)
                        }
                        className="w-full sm:w-auto p-2 bg-neutral-50 border border-gray-250 rounded-xl outline-none font-bold text-xs"
                      >
                        <option value="all">সব শস্য (All Crops)</option>
                        <option value="mango">আম (Mango)</option>
                        <option value="betel">মিষ্টি পান (Betel Leaf)</option>
                        <option value="sugarcane">আখ (Sugarcane)</option>
                        <option value="paddy">ধান (Paddy)</option>
                        <option value="vegetable">
                          শাকসবজি ও আলু (Vegetables)
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Crops Layout Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCrops.map((crop) => (
                      <div
                        key={crop.id}
                        className="bg-white border border-[#edeae0] rounded-2xl p-5 shadow-2xs hover:border-[#2d5a27]/30 transition space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                          <h5 className="font-serif font-black text-sm text-[#2d5a27]">
                            {crop.name}
                          </h5>
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            পুঠিয়া স্পেশাল
                          </span>
                        </div>

                        <div className="text-xs space-y-2 font-sans text-gray-600 leading-relaxed">
                          <div>
                            <strong>🌱 উপযুক্ত মাটি ও জমি:</strong> {crop.soil}
                          </div>
                          <div>
                            <strong>📅 রোপণ ও তোলার উপযুক্ত সময়:</strong>{" "}
                            {crop.time}
                          </div>
                          <div>
                            <strong>🌾 জনপ্রিয় অনুমোদিত জাত:</strong>{" "}
                            {crop.varieties}
                          </div>
                          <div className="p-2.5 bg-red-50/70 border border-red-100 rounded-xl text-red-900">
                            <strong>🐛 রোগবালাই ও দমন থেরাপি:</strong>{" "}
                            {crop.pests}
                          </div>
                          <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-indigo-900">
                            <strong>🧪 সুষম সার ও খৈল প্রয়োগ পদ্ধতি:</strong>{" "}
                            {crop.fertilizer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 3: PRICES & CALCULATOR */}
            {agriTab === "prices" && (
              <div className="animate-fade-in">
                <MarketPriceInfo />
              </div>
            )}

            {/* TAB VIEW 4: OFFICERS & INQUIRY */}
            {agriTab === "officers" && (
              <div className="animate-fade-in">
                <OfficerDirectoryInfo />
              </div>
            )}

            {/* Info Footer Banner */}
            <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3 font-sans text-xs">
              <span className="text-xl">📢</span>
              <p className="text-emerald-800 font-medium leading-relaxed">
                <strong>কৃষি কার্ড ও মৎস্য লাইসেন্স সেশন:</strong> সরকারি যেকোনো
                প্রণোদনা, সার-বীজ অনুদান বা মাছ চাষের লাইসেন্স সরাসরি পেতে আপনার
                নিকটস্থ ইউনিয়ন ডিজিটাল সেন্টার (UDC) অথবা ব্লক উপ-সহকারী
                সুপারভাইজার (এসএএও)-দের নিকট এনআইডি কার্ড ও আবেদনপত্র সরাসরি জমা
                দিন।
              </p>
            </div>
          </div>
        );
      }

      case "upazila_geography": return <GeographicalProfile onGoBack={onGoBack} />;
      case "upazila_history": return <HistoryOfPuthia onGoBack={onGoBack} />;
      case "upazila_population": return <Demographics onGoBack={onGoBack} />;
      case "upazila_map": return <MapGrid onGoBack={onGoBack} />;
      case "official_maps": return <MapGrid onGoBack={onGoBack} />;

      case "local_issues": {
        const handleUpvoteLocalIssue = async (
          id: string,
          currentUpvotes: number = 0,
          currentUsers: string[] = [],
        ) => {
          if (votedIssueIds.includes(id)) return;
          try {
            const userKey = "anonymous";
            await upvoteLocalIssue(id, currentUpvotes, currentUsers, userKey);

            const updatedVoted = [...votedIssueIds, id];
            setVotedIssueIds(updatedVoted);
            localStorage.setItem("votedIssues", JSON.stringify(updatedVoted));

            const fetched = await getLocalIssues();
            setLocalIssues(fetched);
          } catch (err) {
            console.error(err);
          }
        };

        return (
          <div className="space-y-6">
            {getHeader(
              "স্থানীয় নাগরিক সমস্যা ও জনমত ফোরাম",
              "আমাদের এলাকার বেহাল রাস্তাঘাট, কালভার্ট ভাঙন, ড্রেনেজবদ্ধতা কিংবা বিদ্যুৎ ফেইলর সংক্রান্ত সমস্যাগুলোর প্রতিবেদন তুলে ধরে সহমতের মাধ্যমে সংশ্লিষ্ট দপ্তরের দৃষ্টি আকর্ষণ করুন",
              "📢",
            )}

            {/* Table Header controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
              <h3 className="text-base font-bold text-[#2d5a27] font-serif">
                নাগরিকদের কর্তৃক উত্থাপিত গণসমস্যা ের অগ্রগতি
              </h3>
              <button
                onClick={() => setShowLiModal(true)}
                className="px-5 py-2 bg-[#CD5C5C] hover:bg-[#b04545] text-white rounded-xl text-sm font-bold shadow-sm transition transform hover:-translate-y-0.5 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> + সমস্যা ও অভিযোগ রিপোর্ট করুন
              </button>
            </div>

            {loadingIssues ? (
              <div className="text-center py-12 flex justify-center items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#2d5a27] animate-spin" />
                <span className="font-sans text-gray-500 text-sm font-bold">
                  লোড হচ্ছে...
                </span>
              </div>
            ) : (
              <div className="space-y-5">
                {activeIssues.map((issue) => {
                  const isVoted = votedIssueIds.includes(issue.id);
                  return (
                    <div
                      key={issue.id}
                      className="bg-white p-5 rounded-3xl border border-[#edeae0] shadow-sm hover:shadow-md transition text-xs"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold font-sans bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            📍 {issue.locationUnion}
                          </span>

                          {issue.category && (
                            <span className="text-[11px] font-bold font-sans bg-emerald-50 text-[#2d5a27] border border-[#2d5a27]/20 px-2.5 py-0.5 rounded-full">
                              📁 {issue.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      case "MOCK_health_1":
        return (
          <div className="space-y-6 font-sans">
            {getHeader(
              "জরুরী অ্যাম্বুলেন্স সেবা",
              "যেকোন মেডিকেল ইমার্জেন্সিতে দ্রুত সাড়া দিতে",
              "🚑",
            )}

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-rose-100 p-3 rounded-2xl text-rose-600 text-xl border border-rose-200/50">
                  🚑
                </div>
                <div>
                  <span className="font-serif font-black text-[#1e1e1e] text-lg block">
                    স্থানীয় অ্যাম্বুলেন্স 
                  </span>
                  <p className="text-xs text-gray-400 font-sans ml-1">
                    দুর্ঘটনা বা রোগীদের জরুরি ভিত্তিতে হাসপাতালে স্থানান্তরের
                    জন্য সরাসরি কল করুন
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স অ্যাম্বুলেন্স",
                    driver: "মোঃ হাবিবুর রহমান (চালক)",
                    phone: "01733-112233",
                    region: "পুঠিয়া মডেল ফার্স্ট এইড সেন্টার",
                    icon: "🚑",
                    type: "সরকারি",
                  },
                  {
                    title: "শিলমাড়ী ইউনিয়ন ফ্রন্টলাইন অ্যাম্বুলেন্স",
                    driver: "মোস্তাক আহমেদ",
                    phone: "01744-223344",
                    region: "শিলমাড়ী গ্রামীণ উপ-স্বাস্থ্য কেন্দ্র রোড",
                    icon: "🚑",
                    type: "ইউনিয়ন ভিত্তিক",
                  },
                  {
                    title: "ভালুকগাছী ডক্টরস অ্যাসোসিয়েশন ফ্রি অ্যাম্বুলেন্স",
                    driver: "মোঃ রানা হোসেন",
                    phone: "01755-998833",
                    region: "ভালুকগাছী পরিষদ প্রাঙ্গণ",
                    icon: "🚑",
                    type: "স্বেচ্ছাসেবী ফি অ্যাম্বুলেন্স",
                  },
                ].map((ambu, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-rose-500/[0.01] hover:bg-rose-500/[0.03] border border-rose-100 hover:border-rose-400 rounded-2xl transition duration-200 flex flex-col justify-between shadow-3xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-rose-100 text-rose-800 font-extrabold px-2.5 py-1 rounded-md mb-2">
                          {ambu.type}
                        </span>
                        <span className="text-2xl">{ambu.icon}</span>
                      </div>
                      <h4 className="font-serif font-bold text-gray-900 text-base md:text-lg leading-tight">
                        {ambu.title}
                      </h4>
                      <div className="space-y-1 bg-white p-3 rounded-xl border border-rose-100/30 text-xs text-neutral-600 font-sans">
                        <p>
                          📍 <strong>এরিয়া/লোকেশন:</strong> {ambu.region}
                        </p>
                        <p>
                          🧑‍✈️ <strong>দায়িত্বশীল ড্রাইভার:</strong> {ambu.driver}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-dashed border-rose-150 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-rose-600">
                        hotline active 24/7
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onSimulateCall(
                            ambu.phone,
                            `${ambu.title} (${ambu.driver})`,
                          )
                        }
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-sans transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        📞 কল দিন ({ambu.phone})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

        /* lawyers */
        return (
          <div className="space-y-6">
            {getHeader(
              "আইনজীবী ও সাংবাদিক",
              "স্থানীয় আইনি সহায়তা এবং সংবাদ মাধ্যমের প্রতিনিধিদের সাথে যোগাযোগের তথ্য",
              "⚖️",
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-[#edeae0] shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-150">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 text-xl border border-orange-100">
                    ⚖️
                  </div>
                  <h4 className="font-serif font-black text-[#2d5a27] text-lg">
                    স্থানীয় আইনজীবী (Bar Council)
                  </h4>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      name: "অ্যাডভোকেট হাসিবুল ইসলাম",
                      area: "জজ কোর্ট, রাজশাহী",
                      phone: "০১৭১১-২২৩৩৪৫",
                    },
                    {
                      name: "অ্যাডভোকেট শফিকুল সিরাজ",
                      area: "পুঠিয়া জজ কোর্ট",
                      phone: "০১৮২২-৩৩৪৪৫৫",
                    },
                    {
                      name: "অ্যাডভোকেট মমতাজ বেগম",
                      area: "ফ্যামিলি কোর্ট",
                      phone: "০১৯৩৩-৪৪৫৫৬৬",
                    },
                  ].map((lawyer, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-orange-50/30 p-3.5 rounded-2xl border border-orange-100 hover:border-orange-300 transition group"
                    >
                      <div>
                        <strong className="text-sm font-serif text-gray-800">
                          {lawyer.name}
                        </strong>
                        <span className="text-sm block text-gray-500 font-sans mt-0.5">
                          {lawyer.area}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onSimulateCall(
                            lawyer.phone,
                            `আইনজীবী (${lawyer.name})`,
                          )
                        }
                        className="px-3 py-1.5 bg-white rounded-xl shadow-sm border border-orange-100 text-orange-700 hover:bg-orange-500 hover:text-white transition text-sm font-bold whitespace-nowrap cursor-pointer"
                      >
                        📞 কল
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#edeae0] shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-150">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 text-xl border border-sky-100">
                    📰
                  </div>
                  <h4 className="font-serif font-black text-[#2d5a27] text-lg">
                    স্থানীয় সাংবাদিক ফোরাম
                  </h4>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      name: "মোঃ জহুরুল হক",
                      media: "দৈনিক ইত্তেফাক ও চ্যানেল আই",
                      phone: "০১৭২২-৩৩৪৪৫৫",
                    },
                    {
                      name: "শরিফুল ইসলাম বাবুল",
                      media: "প্রথম আলো (পুঠিয়া প্রতিনিধি)",
                      phone: "০১৮৩৩-৪৪৫৫৬৬",
                    },
                    {
                      name: "আহমেদ উল্লাহ",
                      media: "রাজশাহী টেলিভিশন (আরটিভি)",
                      phone: "০১৯৪৪-৫৫৬৬৭৭",
                    },
                  ].map((journalist, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-sky-50/30 p-3.5 rounded-2xl border border-sky-100 hover:border-sky-300 transition group"
                    >
                      <div>
                        <strong className="text-sm font-serif text-gray-800">
                          {journalist.name}
                        </strong>
                        <span className="text-sm block text-gray-500 font-sans mt-0.5">
                          {journalist.media}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onSimulateCall(
                            journalist.phone,
                            `সাংবাদিক (${journalist.name})`,
                          )
                        }
                        className="px-3 py-1.5 bg-white rounded-xl shadow-sm border border-sky-100 text-sky-700 hover:bg-sky-500 hover:text-white transition text-sm font-bold whitespace-nowrap cursor-pointer"
                      >
                        📞 কল
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "union_muni_announcement":
        return selectedNews ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedNews(null)}
              className="mb-4 bg-[#2d5a27]/10 hover:bg-[#2d5a27] text-[#2d5a27] hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition font-sans cursor-pointer"
            >
              ← ফিরে যান
            </button>

            <div className="bg-white p-6 rounded-2xl border border-[#edeae0] space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#CD5C5C]/10 text-[#CD5C5C] px-2.5 py-0.5 rounded-full font-serif font-bold">
                  {selectedNews.category}
                </span>
                <span className="text-xs text-gray-400 font-bold">
                  📅 {selectedNews.date}
                </span>
              </div>

              <h3 className="text-2xl font-serif font-black text-[#1a3a18]">
                {selectedNews.title}
              </h3>

              <div className="text-gray-700 leading-relaxed font-sans space-y-4">
                <p>{selectedNews.desc}</p>
              </div>

              <div className="pt-4 border-t border-gray-150 flex items-center justify-end">
                <button
                  onClick={() => {
                    const pdf = new jsPDF();
                    pdf.text(`PUTHIA DIGITAL PORTAL - ANNOUNCEMENT`, 20, 20);
                    pdf.text(`Category: ${selectedNews.category}`, 20, 30);
                    pdf.text(`Date: ${selectedNews.date}`, 20, 40);
                    pdf.text(`Title: ${selectedNews.title}`, 20, 50);
                    pdf.text(`Description: ${selectedNews.desc}`, 20, 60);

                    const blob = pdf.output(`blob`);
                    const link = document.createElement(`a`);
                    link.href = window.URL.createObjectURL(blob);
                    link.download = `announcement_${selectedNews.id}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="bg-[#2d5a27] hover:bg-[#1a3a18] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition font-sans cursor-pointer"
                >
                  📥 অফিশিয়াল ঘোষণানামা ডাউনলোড করুন (PDF)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {getHeader(
              "ইউনিয়ন ও পৌরসভার ঘোষণা",
              "পুঠিয়া পৌরসভা এবং ৬টি ইউনিয়নের ডিজিটাল নোটিশ ও জরুরি নির্দেশনাপত্র",
              "📣",
            )}
            <div className="space-y-4">
              {[
                {
                  id: "uma-1",
                  title:
                    "ডেঙ্গু প্রতিরোধে পুঠিয়া পৌর এলাকায় মশক নিধন ও বিশেষ পরিচ্ছন্নতা পক্ষ ঘোষণা",
                  category: "পৌরসভা ঘোষণা",
                  date: "১৮ জুন ২০২৬",
                  desc: "আসন্ন বর্ষা মৌসুমের প্রাক্কালে এডিস মশার লার্ভা বংশবিস্তার রোধে পৌর এলাকার ৯টি ওয়ার্ডে একযোগে ড্রেন পরিষ্কার এবং ফগার মেশিন দ্বারা মশার ওষুধ ছিটানো হচ্ছে। জলাবদ্ধতা দূর করতে বাড়ি সংলগ্ন উন্মুক্ত স্থানে জমে থাকা পানি নিজ দায়িত্বে পরিষ্কারের কঠোর আইন জারি করা হয়েছে।",
                },
                {
                  id: "uma-2",
                  title:
                    "বানেশ্বর ইউনিয়ন পরিষদের সুবিধাভোগী কার্ড ডিস্ট্রিবিউশন সংক্রান্ত জরুরি সময়সূচী",
                  category: "ইউনিয়ন পরিষদ বিজ্ঞপ্তি",
                  date: "১৬ জুন ২০২৬",
                  desc: "বানেশ্বর ইউনিয়নের দরিদ্র ও পিছিয়ে পড়া পরিবারের জন্য সরকারি বরাদ্দকৃত নতুন ভিজিএফ চাল ও পুষ্টি কার্ড বিতরণ কার্যক্রম আগামী ২০ই জুন সকাল ৯টা থেকে ইউনিয়ন পরিষদ প্রাঙ্গণে মেম্বার ও চেয়ারম্যান মহোদয়ের উপস্থিতিতে আনুষ্ঠানিকভাবে শুরু হবে। আবেদনকারী সকলকে জাতীয় পরিচয়পত্র বা জন্মনিবন্ধন সহ উপস্থিত থাকার তাগিদ দেওয়া হলো।",
                },
                {
                  id: "uma-3",
                  title:
                    "স্মার্ট নাগরিক হোল্ডিং ট্যাক্স অটোমেশন ও ই-পেমেন্ট নিবন্ধন কার্যক্রমের উদ্বোধন",
                  category: "উপজেলা নোটিশ",
                  date: "১৪ জুন ২০২৬",
                  desc: "পুঠিয়া উপজেলার ৬টি ইউনিয়ন ও পৌরবাসীর বার্ষিক হোল্ডিং ট্যাক্স ও ট্রেড লাইসেন্স ফি সম্পূর্ণ ক্যাশলেস ডিজিটালি পেমেন্ট করার কার্যক্রম আনুষ্ঠানিকভাবে শুরু হয়েছে। যেকোনো ইউনিয়ন ডিজিটাল সেন্টারে বিনামূল্যে নিবন্ধন সম্পন্ন করার ঘোষণা দেওয়া হচ্ছে।",
                },
              ].map((announce, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#edeae0] p-6 hover:shadow-sm transition flex flex-col md:flex-row gap-5 justify-between items-start md:items-center"
                >
                  <div className="space-y-2 flex-1 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[#CD5C5C]/10 text-[#CD5C5C] px-2.5 py-0.5 rounded-full font-serif font-bold">
                        {announce.category}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">
                        📅 {announce.date}
                      </span>
                    </div>
                    <h4
                      onClick={() => setSelectedNews(announce)}
                      className="font-serif font-extrabold text-base text-[#1a3a18] cursor-pointer hover:underline"
                    >
                      {announce.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {announce.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedNews(announce)}
                    className="bg-[#2d5a27]/10 hover:bg-[#2d5a27] text-[#2d5a27] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 font-sans"
                  >
                    পূর্ণ বিবরণ দেখুন
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case "utility_updates":
        content = (
          <div className="space-y-6">
            {getHeader(
              "রাস্তা, বিদ্যুৎ, পানি সংক্রান্ত আপডেট",
              "উপদেশের অবকাঠামো সংস্কার, বিদ্যুৎ লোডশেডিং এবং নিরবচ্ছিন্ন পানি বা সেবা ব্যাহত সংক্রান্ত লাইভ নোটিশ",
              "⚡",
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-[#edeae0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-dashed border-[#edeae0] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🔌</span>
                      <div>
                        <h4 className="font-serif font-black text-[#1a3a18] text-base">
                          পুঠিয়া পল্লী বিদ্যুৎ জোনাল অফিস আপডেট
                        </h4>
                        <p className="text-xs text-gray-400 font-sans">
                          ফিডার ভিত্তিক দৈনিক লোডশেডিং তালিকা ও রেশনিং সূচি
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full font-bold font-sans">
                      সক্রিয় নেটওয়ার্ক
                    </span>
                  </div>

                  <div className="p-4 bg-[#2d5a27]/5 border border-[#2d5a27]/15 rounded-xl font-sans text-sm text-[#2d5a27] leading-relaxed">
                    <strong>💡 গ্রাহকদের অবগতির জন্য:</strong> চলতি সপ্তাহে
                    ঝড়-বৃষ্টির কারণে ৩৩ কেভি লাইনের সঞ্চালন খুঁটি ও ইনসুলেটর বদল
                    করার লক্ষ্যে প্রতিদিন সকাল ০৯:০০টা থেকে দুপুর ১২:০০টার মধ্যে
                    পর্যায়ক্রমে ২-৪ নং ফিডারে সাময়িক শাটডাউন হতে পারে। আপনার
                    এলাকার বর্তমান বিদ্যুৎ স্ট্যাটাস নিচে দেখুন।
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-sans">
                    {[
                      {
                        area: "বানেশ্বর ফিডার-১",
                        status: "অনলাইন (নিরবচ্ছিন্ন)",
                        helper: "০১৭৬৯-৪০০২০১",
                        isUp: true,
                      },
                      {
                        area: "ঝলমলিয়া ফিডার-২",
                        status: "রক্ষণাবেক্ষণ (বিদ্যুৎ বন্ধ)",
                        helper: "০১৭৬৯-৪০০২০২",
                        isUp: false,
                      },
                      {
                        area: "পুঠিয়া পৌর ফিডার-৩",
                        status: "অনলাইন (নিরবচ্ছিন্ন)",
                        helper: "০১৭৬৯-৪০০২০৩",
                        isUp: true,
                      },
                      {
                        area: "শিলমাড়ী ফিডার-৪",
                        status: "সাময়িক মেরামত কাজ চলিতেছে",
                        helper: "০১৭৬৯-৪০০২০৪",
                        isUp: false,
                      },
                    ].map((feeder, i) => (
                      <div
                        key={i}
                        className="p-3 border border-neutral-100 rounded-xl bg-neutral-50/50 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-gray-700">
                            {feeder.area}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${feeder.isUp ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                          >
                            {feeder.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2 text-xs">
                          <span className="text-gray-400">
                            হেল্পলাইন ডেস্ক:
                          </span>
                          <span
                            onClick={() =>
                              onSimulateCall(
                                feeder.helper,
                                `বিদ্যুৎ অভিযোগ কেন্দ্র - ${feeder.area}`,
                              )
                            }
                            className="text-blue-600 cursor-pointer hover:underline font-bold"
                          >
                            📞 {feeder.helper}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#edeae0] shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-dashed border-[#edeae0] pb-3">
                    <span className="text-2xl">🚧</span>
                    <div>
                      <h4 className="font-serif font-black text-[#1a3a18] text-base">
                        সড়ক ও যোগাযোগ ব্যাহত সংক্রান্ত লাইভ নোটিশ
                      </h4>
                      <p className="text-xs text-gray-400 font-sans">
                        রাস্তা সংস্কার, কালভার্ট মেরামত ও বিকল্প যাতায়াত রুট
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 font-sans text-sm">
                    <div className="p-4 border border-rose-500/10 bg-rose-500/5 rounded-xl flex items-start gap-3">
                      <span className="text-2xl">🛑</span>
                      <div className="space-y-1">
                        <strong className="text-rose-800 font-serif">
                          ঝলমলিয়া বাজার ড্রেনেজ ওভারফ্লো কাজের রোড ডাইভারশন
                        </strong>
                        <p className="text-neutral-600 leading-relaxed text-sm">
                          ঝলমলিয়া বাজারের মাঝখানের ড্রেন পুনর্নির্মাণের কারণে বড়
                          ট্রাককে আগামী তিন দিন বাঁশপুকুরিয়া হয়ে বিকল্প
                          রাস্তায় চলাচল করার নির্দেশ দেওয়া হয়েছে। হালকা গাড়ি
                          সীমিত পরিসরে প্রবেশ করতে পারবে।
                        </p>
                        <span className="inline-block text-[10px] font-bold text-rose-700 mt-1 uppercase tracking-wide">
                          ১ নং সতর্কতা নোটিশ
                        </span>
                      </div>
                    </div>

                    <div className="p-4 border border-blue-500/10 bg-blue-500/5 rounded-xl flex items-start gap-3">
                      <span className="text-2xl">🚜</span>
                      <div className="space-y-1">
                        <strong className="text-blue-800 font-serif">
                          বেলপুকুরিয়া-ভালুকগাছী সীমান্ত ব্রিজ পাকা পিচঢালাই
                          কার্যক্রম
                        </strong>
                        <p className="text-neutral-600 leading-relaxed text-sm">
                          পুঠিয়া এলজিইডি কর্তৃক ৩ নম্বর কালভার্টের অ্যাপ্রোচ
                          রোডের কাজ সম্পন্ন হওয়াতে বর্তমানে পিচ ঢালাই ও সুষম
                          লেভেলিং কাজ চলমান। হালকা যান চলাচলের গতি হ্রাস করার
                          পরামর্শ দেওয়া হচ্ছে।
                        </p>
                        <span className="inline-block text-[10px] font-bold text-blue-700 mt-1 uppercase tracking-wide">
                          সড়ক সচল আপডেট
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-[#edeae0] shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 border-b border-dashed border-[#edeae0] pb-3">
                      <span className="text-2xl">🚰</span>
                      <div>
                        <h4 className="font-serif font-black text-[#1a3a18] text-base">
                          পৌর পানি সরবরাহ পাইপলাইন পরিচ্ছন্নতা
                        </h4>
                        <p className="text-xs text-gray-400 font-sans">
                          পানির ওভারহেড ট্যাংক শোধন ও বিতরণ কাজ
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed font-sans mt-2">
                      পৌরসভার পানি শোধনাগার পরিষ্কার করার কারণে আগামী
                      বৃহস্পতিবার ভোর ৫টা থেকে সকাল ৯টা পর্যন্ত ৪ ও ৫ নং
                      ওয়ার্ডের পানি সরবরাহ সাময়িকভাবে বন্ধ থাকবে। নাগরিকদের
                      পূর্বেই নিজ নিজ ধারণ ক্ষমতা অনুযায়ী পানি জমিয়ে রাখার জন্য
                      বিশেষ আহ্বান করা হচ্ছে।
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 p-3 rounded-lg text-xs font-bold font-sans">
                      ⏰ বিঘ্নিত সময়: বৃহস্পতিবার (ভোর ০৫:০০ - সকাল ০৯:০০)
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-dashed border-[#edeae0] mt-4 font-sans">
                    <h5 className="font-serif font-bold text-neutral-700 text-sm">
                      ☎️ জরুরি অবকাঠামো ও সেবা ব্যাহত অভিযোগ
                    </h5>
                    <div className="space-y-2 text-sm text-neutral-600">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">পৌর পানি সুপারভাইজার</span>
                        <span
                          onClick={() =>
                            onSimulateCall(
                              "০১৭৩-২৫৭৬৮১",
                              "পৌর পানি সুপারভাইজার",
                            )
                          }
                          className="text-blue-600 cursor-pointer hover:underline font-bold"
                        >
                          📞 যোগাযোগ করুন
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          উপজেলা প্রকৌশলী (LGED)
                        </span>
                        <span
                          onClick={() =>
                            onSimulateCall(
                              "০১৭২-৯৫৭৪৩২",
                              "এলজিইডি উপজেলা প্রকৌশলী",
                            )
                          }
                          className="text-blue-600 cursor-pointer hover:underline font-bold"
                        >
                          📞 যোগাযোগ করুন
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          উপজেলা বিদ্যুৎ অভিযোগ কেন্দ্র
                        </span>
                        <span
                          onClick={() =>
                            onSimulateCall(
                              "০১৭৬-৯৪০০২০১",
                              "পল্লী বিদ্যুৎ অভিযোগ কেন্দ্র",
                            )
                          }
                          className="text-blue-600 cursor-pointer hover:underline font-bold"
                        >
                          📞 যোগাযোগ করুন
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        break;

      case "edu_health_news":
        content = selectedNews ? (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setSelectedNews(null)}
              className="text-[#2d5a27] font-bold text-sm flex items-center gap-1 hover:underline cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> ফিরে যান
            </button>
            <div className="bg-white rounded-3xl border border-[#edeae0] overflow-hidden">
              <img
                src={selectedNews.img}
                alt={selectedNews.title}
                className="w-full h-80 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                    {selectedNews.category}
                  </span>
                  <span className="text-sm text-gray-500 font-bold">
                    📅 {selectedNews.date}
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-black text-[#1a3a18] mb-6 leading-tight">
                  {selectedNews.title}
                </h2>
                <div className="prose prose-emerald max-w-none text-gray-600 font-sans leading-relaxed space-y-4 text-base">
                  <p>{selectedNews.desc}</p>
                  <p>
                    উপজেলা স্বাস্থ্য কর্মকর্তা এবং মাধ্যমিক শিক্ষা কর্মকর্তা
                    আমাদের সংবাদ প্রকাশনীকে জানিয়েছেন, এই কর্মসূচিগুলো সফলভাবে
                    সম্পন্ন করার জন্য উপজেলা প্রশাসন সবসময় কাজ করছে।
                  </p>
                  <p>
                    শিক্ষার্থীদের মানোন্নয়ন ও পুষ্টির নিশ্চয়তা প্রদানে নিয়মিত
                    কর্মসূচি পালনে প্রশাসন বদ্ধপরিকর।
                  </p>
                </div>
              </div>
              <div className="px-8 py-5 bg-neutral-50 border-t border-dashed border-[#edeae0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-gray-500 font-bold">
                  রিপোর্টার: পুঠিয়া প্রতিনিধি
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {getHeader(
              "শিক্ষা ও স্বাস্থ্য বিষয়ক সংবাদ",
              "পুঠিয়া উপজেলার সকল উচ্চ বিদ্যালয়, কলেজ, প্রাথমিক বিদ্যালয় ও স্বাস্থ্য কমপ্লেক্সের বিশেষ আপডেট",
              "🎓",
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              {[
                {
                  id: "ehn-1",
                  title:
                    "উপজেলা স্বাস্থ্য কমপ্লেক্সে জরায়ুমুখ ক্যানসার প্রতিরোধে HPV টিকাদান ক্যাম্পেইন জোরদার",
                  category: "স্বাস্থ্যসেবা",
                  date: "১৮ জুন ২০২৬",
                  img: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Puthia_Rajbari_-_Rajshahi.jpg",
                  desc: "পুঠিয়া উপজেলার মাধ্যমিক স্কুলের ৫ম থেকে ৯ম শ্রেণীর মেয়েদের এবং ১০-১৪ বছর বয়সী কিশোরীদের বিনামূল্যে হিউম্যান প্যাপিলোমা ভাইরাস (HPV) টিকা প্রধান কার্যক্রম পুরোদমে শুরু হয়েছে। উপজেলা স্বাস্থ্য কমপ্লেক্সের বিশেষ টিম বিভিন্ন বিদ্যালয় পরিদর্শন করে প্রত্যন্ত অঞ্চলে ফ্রিতে এই সেবা দিচ্ছে।",
                },
                {
                  id: "ehn-2",
                  title:
                    "পৌর গালর্স হাই স্কুলের বিজ্ঞান বিজ্ঞান ল্যাবের আধুনিকায়ন ও উন্নত প্রযুক্তি সংযোজন",
                  category: "শিক্ষা উন্নয়ন",
                  date: "১৫ জুন ২০২৬",
                  img: "https://upload.wikimedia.org/wikipedia/commons/8/87/Puthia_Govinda_Temple_Front.jpg",
                  desc: "ডিজিটাল বাংলাদেশ ভিশনের সাথে তাল মিলিয়ে পৌর বালিকা উচ্চ বিদ্যালয়ের শিক্ষার্থীদের সূক্ষ্ম বিজ্ঞান গবেষণার জন্য আধুনিক অনুবীক্ষণ যন্ত্র, রাসায়নিক বিকারক ও কম্পিউটার সহ ল্যাব নতুনভাবে উদ্বোধন করা হয়েছে।",
                },
                {
                  id: "ehn-3",
                  title:
                    "পুঠিয়ার বানেশ্বর সরকারি কলেজে বিনামূল্যে রক্ত পরীক্ষা ও চক্ষু চিকিৎসা ক্যাম্প",
                  category: "ফ্রি চিকিৎসাসেবা",
                  date: "১২ জুন ২০২৬",
                  img: "https://images.unsplash.com/photo-1524492412937-b2f07469d76e?auto=format&fit=crop&q=80&w=800",
                  desc: "স্থানীয় যুব ও সমাজকল্যাণ সংঘ এবং সন্ধানী সন্ধান ক্লাবের আমন্ত্রণে বানেশ্বর সরকারি কলেজ ক্যাম্পাসে সমাজের নিম্নবিত্ত পরিবারের শতাধিক রোগীর বিনামূল্যে রক্ত গ্রুপ ও আধুনিক চক্ষু লেন্স সেটিং ফ্রি চিকিৎসা ক্যাম্প অনুষ্ঠিত হয়।",
                },
                {
                  id: "ehn-4",
                  title:
                    "যুব প্রতিবন্ধীদের জন্য উপজেলা চত্বরে বিশেষ ক্রীড়া প্রতিযোগিতার আয়োজন",
                  category: "খেলাধুলা ও সামাজিক",
                  date: "১৭ জুন ২০২৬",
                  img: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Puthia_Rajbari_-_Rajshahi.jpg",
                  desc: "স্থানীয় যুব সমাজ এবং সমাজসেবা অধিদপ্তরের যৌথ উদ্যোগে উপজেলা পরিষদ মাঠে এক আনন্দঘন ক্রীড়া মেলার আয়োজন করা হয়। যেখানে শতাধিক প্রতিবন্ধী শিশু কিশোর নানা ইভেন্টে অংশগ্রহণ করে।",
                },
                {
                  id: "ehn-5",
                  title:
                    "শিলমাড়ী ইউনিয়নে নতুন পাকা রাস্তা নির্মাণ কাজ উদ্বোধন করলেন ইউএনও",
                  category: "উন্নয়নমূলক সংবাদ",
                  date: "১৬ জুন ২০২৬",
                  img: "https://upload.wikimedia.org/wikipedia/commons/8/87/Puthia_Govinda_Temple_Front.jpg",
                  desc: "দীর্ঘদিনের দুর্ভোগ লাঘবে শিলমাড়ী ইউনিয়নের মূল বাজার সংলগ্ন ২ কিলোমিটার কাঁচা রাস্তা পাকাকরণের কাজ শুরু হয়েছে। এলজিইডির অর্থায়নে এই প্রকল্পের ফলে কয়েক হাজার গ্রামবাসীর যাতায়াতের অভাবনীয় সুবিধা হবে।",
                },
              ].map((news, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#edeae0] overflow-hidden hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={news.img}
                      alt={news.title}
                      className="w-full h-40 object-cover opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-5 space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-bold">
                          {news.category}
                        </span>
                        <span className="text-sm text-gray-500 font-bold">
                          📅 {news.date}
                        </span>
                      </div>
                      <h4
                        onClick={() => setSelectedNews(news)}
                        className="font-serif font-extrabold text-base text-[#2d5a27] leading-snug cursor-pointer hover:underline"
                      >
                        {news.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-500 line-clamp-3">
                        {news.desc}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-3.5 border-t border-dashed border-[#edeae0] bg-neutral-50 flex items-center justify-between text-sm text-gray-400">
                    <span>পুঠিয়া নিউজ ডেস্ক রিপোর্ট</span>
                    <span
                      onClick={() => setSelectedNews(news)}
                      className="text-[#2d5a27] font-bold cursor-pointer hover:underline flex items-center gap-1"
                    >
                      বিস্তারিত পড়ুন...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case "udc_centers": {
        const udcList = [
          {
            id: "baneshwar",
            name: "বানেশ্বর ইউনিয়ন ডিজিটাল সেন্টার",
            entrepreneur: "মোঃ আরিফুল ইসলাম / মোছাঃ নাছিমা",
            phone: "01711-223341",
            bg: "bg-blue-50/50",
          },
          {
            id: "shilmaria",
            name: "শিলমাড়ী ইউনিয়ন ডিজিটাল সেন্টার",
            entrepreneur: "মোঃ রায়হান কবির / ফাতেমা আক্তার",
            phone: "01711-223342",
            bg: "bg-emerald-50/50",
          },
          {
            id: "belpukur",
            name: "বেলপুকুরিয়া ইউনিয়ন ডিজিটাল সেন্টার",
            entrepreneur: "শামীম হোসেন / শিরিন সুলতানা",
            phone: "01711-223343",
            bg: "bg-amber-50/50",
          },
          {
            id: "jeupara",
            name: "জিউপাড়া ইউনিয়ন ডিজিটাল সেন্টার",
            entrepreneur: "ফারুক আহমেদ / রোকসানা বানু",
            phone: "01711-223344",
            bg: "bg-purple-50/50",
          },
          {
            id: "puthia_union",
            name: "পুঠিয়া ইউনিয়ন ডিজিটাল সেন্টার",
            entrepreneur: "মোঃ আব্দুল্লাহ আল মামুন / সাবিনা পারভীন",
            phone: "01711-223345",
            bg: "bg-rose-50/50",
          },
          {
            id: "bhalukgachhi",
            name: "ভালুকগাছী ইউনিয়ন ডিজিটাল সেন্টার",
            entrepreneur: "মিজানুর রহমান / সেলিনা খাতুন",
            phone: "01711-223346",
            bg: "bg-teal-50/50",
          },
        ];

        const activeFilter =
          udcUnionFilter === "all" ? "baneshwar" : udcUnionFilter;
        const selectedUdc =
          udcList.find((u) => u.id === activeFilter) || udcList[0];

        content = (
          <div className="space-y-6">
            {getHeader(
              "ইউনিয়ন ডিজিটাল সেন্টার (UDC)",
              "৬টি ইউনিয়নের ডিজিটাল সেন্টারের সেবাদানকারী উদ্যোক্তাদের তথ্য, ঘরে বসেই সেবা নিন",
              "🌐",
            )}

            <div className="bg-white p-5 rounded-2xl border border-[#edeae0] space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-gray-150">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl">🌐</span>
                    <span className="text-sm font-serif font-black text-[#2d5a27]">
                      ডিজিটাল সেন্টার নির্বাচন করুন
                    </span>
                  </div>
                </div>

                <div className="flex flex-col w-full lg:w-1/3">
                  <select
                    value={activeFilter || ""}
                    onChange={(e) => setUdcUnionFilter(e.target.value)}
                    className="bg-neutral-50 px-3 py-2 border rounded-full outline-none text-sm font-sans font-bold cursor-pointer h-10 text-gray-700 hover:border-[#2d5a27]/30 transition"
                  >
                    <option value="baneshwar">বানেশ্বর ইউনিয়ন</option>
                    <option value="shilmaria">শিলমাড়ী ইউনিয়ন</option>
                    <option value="belpukur">বেলপুকুরিয়া ইউনিয়ন</option>
                    <option value="jeupara">জিউপাড়া ইউনিয়ন</option>
                    <option value="puthia_union">পুঠিয়া ইউনিয়ন</option>
                    <option value="bhalukgachhi">ভালুকগাছী ইউনিয়ন</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className={`p-8 rounded-2xl border border-gray-150 ${selectedUdc.bg} shadow-xs flex flex-col justify-between`}
                >
                  <div className="space-y-4 mb-6">
                    <div className="bg-white p-3 w-fit rounded-xl shadow-sm border border-gray-100 text-3xl">
                      💻
                    </div>
                    <h3 className="font-serif font-black text-[#2d5a27] text-2xl">
                      {selectedUdc.name}
                    </h3>
                    <div className="bg-white p-4 rounded-xl space-y-2 border border-white/50">
                      <p className="text-sm text-gray-700 font-sans flex items-center gap-2">
                        <strong className="text-gray-900">উদ্যোক্তা:</strong>{" "}
                        {selectedUdc.entrepreneur}
                      </p>
                      <p className="text-sm text-gray-700 font-sans flex items-center gap-2">
                        <strong className="text-gray-900">ফোন নম্বর:</strong>{" "}
                        {selectedUdc.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onSimulateCall(selectedUdc.entrepreneur, selectedUdc.name)
                    }
                    className="w-full md:w-auto md:px-8 py-3 bg-white hover:bg-[#2d5a27] text-[#2d5a27] hover:text-white border-2 border-[#2d5a27] rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    📞 কল করুন ({selectedUdc.phone})
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 px-5 py-4 rounded-xl border border-[#edeae0] flex items-start gap-3 mt-4">
              <Info className="w-5 h-5 text-gray-400 shrink-0" />
              <p className="text-sm text-gray-500 leading-relaxed font-sans">
                <strong>যেসব সেবা পাওয়া যায়:</strong> জন্ম নিবন্ধন, নাগরিক সনদ,
                ওয়ারিশ সনদ, ট্রেড লাইসেন্স, পাসপোর্ট ও ভিসা আবেদন, মোবাইল
                ব্যাংকিং, বিদ্যুৎ বিল পরিশোধ, ই-নামজারি, বয়স্ক ও বিধবা ভাতা
                আবেদন এবং বিভিন্ন সরকারি-বেসরকারি ফরম পূরণসহ প্রায় ১৫০+ ডিজিটাল
                সেবা প্রদান করা হয়।
              </p>
            </div>
          </div>
        );
        break;
      }

      case "edu_school":
        return <SchoolInfo onGoBack={onGoBack} />;
      case "add_school":
        return <EducationalInstitutions defaultCategory="school" />;
      case "add_college":
        return <EducationalInstitutions defaultCategory="college" />;
      case "add_madrasha":
        return <EducationalInstitutions defaultCategory="madrasa" />;
      case "add_technical":
        return <EducationalInstitutions defaultCategory="technical" />;
      case "add_kindergarten":
        return <EducationalInstitutions defaultCategory="kindergarten" />;
      case "add_coaching":
        return <EducationalInstitutions defaultCategory="coaching" />;
      case "add_library":
        return <EducationalInstitutions defaultCategory="library" />;
      case "edu_college":
        return <CollegeInfo onGoBack={onGoBack} />;
      case "edu_madrasha":
        return <MadrashaInfo onGoBack={onGoBack} />;
      case "edu_technical":
        return <TechnicalEduInfo onGoBack={onGoBack} />;
      case "edu_kindergarten":
        return <KindergartenInfo onGoBack={onGoBack} />;
      case "edu_coaching":
        return <CoachingInfo onGoBack={onGoBack} />;
      case "education_scholarship":
        return <ScholarshipInfo onGoBack={onGoBack} />;
      case "career_guideline":
        return <CareerGuidelineInfo onGoBack={onGoBack} />;
      case "training_info":
        return <TrainingHub onGoBack={onGoBack} />;
      case "edu_library":
        return <LibraryInfo onGoBack={onGoBack} />;
      case "ds_birth_reg":
        return <BirthRegistrationInfo onGoBack={currentOnGoBack} />;
      case "ds_death_reg":
        return <DeathRegistrationInfo onGoBack={currentOnGoBack} />;
      case "ds_nid_services":
        return <NIDServicesInfo onGoBack={currentOnGoBack} />;
      case "ds_passport":
        return <PassportInfo onGoBack={currentOnGoBack} />;
      case "ds_land_services":
        return <LandServicesInfo onGoBack={currentOnGoBack} />;
      case "ds_e_mutation":
        return <EMutationInfo onGoBack={currentOnGoBack} />;
      case "ds_online_application":
        return <OnlineApplicationInfo onGoBack={currentOnGoBack} />;
      case "ds_govt_office_directory":
        return <GovtOfficeDirectoryInfo onGoBack={() => setSelectedSubView(null)} />;

      case "banking_finance": return <BankingFinance onGoBack={onGoBack} />;
      case "insurance_services": return <InsuranceServices onGoBack={onGoBack} />;
      case "banking_finance_govt": return <BankingFinance onGoBack={onGoBack} initialCategory="govt_bank" />;
      case "banking_finance_private": return <BankingFinance onGoBack={onGoBack} initialCategory="private_bank" />;
      case "banking_finance_agent": return <BankingFinance onGoBack={onGoBack} initialCategory="agent_bank" />;
      case "banking_finance_atm": return <BankingFinance onGoBack={onGoBack} initialCategory="atm_booth" />;
      case "banking_finance_mfs": return <BankingFinance onGoBack={onGoBack} initialCategory="mfs" />;

      case "ngo_social": return <NgoSocial onGoBack={onGoBack} />;
      case "ngo_list": return <NgoSocial onGoBack={onGoBack} initialCategory="ngo_list" />;
      case "ngo_branch": return <NgoSocial onGoBack={onGoBack} initialCategory="branch_address" />;
      case "ngo_contact": return <NgoSocial onGoBack={onGoBack} initialCategory="contact" />;
      case "ngo_loan": return <NgoSocial onGoBack={onGoBack} initialCategory="loan_program" />;
      case "ngo_women": return <NgoSocial onGoBack={onGoBack} initialCategory="women_development" />;
      case "ngo_agri": return <NgoSocial onGoBack={onGoBack} initialCategory="agriculture_sme" />;
      case "ngo_training": return <NgoSocial onGoBack={onGoBack} initialCategory="training_program" />;
      case "ngo_services": return <NgoSocial onGoBack={onGoBack} initialCategory="social_services" />;

      case "roads_transport": return <ServiceDirectoryTemplate serviceKeyParam="local-transport" />;
      case "livestock_poultry": return <LivestockFisheries onGoBack={onGoBack} />;
      case "sub_district_intro": return <AdministrationIntro onGoBack={onGoBack} />;
      case "unions": return <UnionGrid onGoBack={onGoBack} onSimulateCall={onSimulateCall} />;
      case "villages": return <VillageGrid onGoBack={onGoBack} />;
      case "gov_services": return <AdministrationGov onGoBack={onGoBack} />;

      case "my_saved":
        return <MySavedView onGoBack={onGoBack} onSelectNews={globalSetSelectedNews} onSelectService={setSelectedSubView} />;

      case "local_news":
        return <LocalNewsInfo onGoBack={onGoBack} onNavigateToSubView={setSelectedSubView} onSelectNews={globalSetSelectedNews} />;
      case "notice_board":
        return <NoticeBoardInfo onGoBack={onGoBack} />;
      case "community_events_hub":
        return <CommunityEventsHub onGoBack={onGoBack} />;
      case "community_programs":
        return <CommunityPrograms onGoBack={onGoBack} />;
      case "sports_activities":
        return <SportsActivities onGoBack={onGoBack} />;
      case "cultural_activities":
        return <CulturalActivities onGoBack={onGoBack} />;
      case "social_organizations":
        return <SocialOrganizations onGoBack={onGoBack} />;
      case "volunteer_network":
        return <VolunteerNetwork onGoBack={onGoBack} />;
      case "photo_video_gallery":
        return <PhotoVideoGallery onGoBack={onGoBack} />;

      case "unused_old_community": {
        return (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 overflow-x-auto hide-scrollbar">
              <div className="flex px-4 min-w-max">
                {[
                  { id: "community_programs", label: "📅 অনুষ্ঠান" },
                  { id: "sports_activities", label: "🏆 খেলাধুলা" },
                  {
                    id: "cultural_activities",
                    label: "🎭 সাংস্কৃতিক কার্যক্রম",
                  },
                  { id: "social_organizations", label: "🏢 সামাজিক সংগঠন" },
                  {
                    id: "volunteer_network",
                    label: "🤝 স্বেচ্ছাসেবক নেটওয়ার্ক",
                  },
                  { id: "photo_video_gallery", label: "📸 ছবি ও ভিডিও" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCommunityTab(tab.id)}
                    className={`flex-none text-center pb-3 pt-2.5 px-4 font-sans border-b-2 transition-all cursor-pointer ${
                      communityTab === tab.id
                        ? "border-[#006A4E] text-[#006A4E] font-bold"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                    }`}
                  >
                    <span className="block text-sm sm:text-base font-bold whitespace-nowrap">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {communityTab === "lost_found" &&
              (() => {
                const activeLFNotices =
                  lostFoundNotices.length > 0
                    ? lostFoundNotices
                    : [
                        {
                          id: "default_1",
                          type: "lost",
                          title: "জাতীয় পরিচয়পত্র ও কালো রঙের ওয়ালেট",
                          description:
                            "গত ১৭ জুন বিকেলে বানেশ্বর বাজার থেকে পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্সের আসার পথে অটো রিকশায় একটি কালো মানিব্যাগ হারিয়ে গেছে। ভেতরের এনআইডি এবং ড্রাইভ লাইসেন্সটি অত্যন্ত প্রয়োজনীয়। সন্ধানদাতাকে পুরস্কৃত করা হবে।",
                          contactPhone: "০১৯১১-২২৩৩৪৪",
                          reporterName: "মোঃ কবির হোসেন",
                          location: "বানেশ্বর টু পুঠিয়া মেইন রোড",
                          date: "১৭ জুন, ২০২৬",
                          createdAt: "2026-06-17T08:00:00.000Z",
                        },
                        {
                          id: "default_2",
                          type: "found",
                          title: "একটি দামী স্মার্টফোন পাওয়া গেছে",
                          description:
                            "আজ সকালে পুঠিয়া রাজবাড়ীর শিব মন্দির ও কৃষ্ণসাগর দিঘির মাঝের বাগান চত্বরে একটি লাল রঙের স্মার্টফোন কুড়িয়ে পেয়েছি। ফোনে লক থাকায় মালিককে কল দেওয়া সম্ভব হয়নি। সঠিক প্রমাণ ও আইএমইআই লক দিলে ফেরত দেওয়া হবে।",
                          contactPhone: "০১৭১২-৩৪৫৬৭৮",
                          reporterName: "সাজিদুর রহমান",
                          location: "পুঠিয়া রাজবাড়ী দিঘি প্রাঙ্গণ",
                          date: "১৮ জুন, ২০২৬",
                          createdAt: "2026-06-18T10:00:00.000Z",
                        },
                      ];

                const filteredNotices = activeLFNotices.filter((notice) => {
                  if (lostFoundFilter === "all") return true;
                  return notice.type === lostFoundFilter;
                });

                const handleAddNotice = async (e: React.FormEvent) => {
                  e.preventDefault();
                  if (
                    !lfTitle.trim() ||
                    !lfDesc.trim() ||
                    !lfPhone.trim() ||
                    !lfReporter.trim() ||
                    !lfLocation.trim() ||
                    !lfDate.trim()
                  ) {
                    alert("দয়া করে সব কয়টি ঘর সঠিকভাবে পূরণ করুন।");
                    return;
                  }
                  const newNotice = {
                    type: lfType,
                    title: lfTitle,
                    description: lfDesc,
                    contactPhone: lfPhone,
                    reporterName: lfReporter,
                    location: lfLocation,
                    date: lfDate,
                    createdAt: new Date().toISOString(),
                  };
                  try {
                    await addLostFoundNotice(newNotice);
                    setLfTitle("");
                    setLfDesc("");
                    setLfPhone("");
                    setLfReporter("");
                    setLfLocation("");
                    setLfDate("");
                    setShowLfModal(false);
                    const res = await getLostFoundNotices();
                    setLostFoundNotices(res);
                  } catch (err) {
                    console.error("Error creating notice:", err);
                  }
                };

                const handleDeleteNotice = async (id: string) => {
                  if (id.startsWith("default_")) return;
                  if (
                    !confirm(
                      "আপনি কি নিশ্চিতভাবে এই বিজ্ঞপ্তিটি মুছে ফেলতে চান?",
                    )
                  )
                    return;
                  try {
                    await deleteLostFoundNotice(id);
                    const res = await getLostFoundNotices();
                    setLostFoundNotices(res);
                  } catch (err) {
                    console.error(err);
                  }
                };

                return (
                  <div className="space-y-6">
                    {getHeader(
                      "হারানো ও প্রাপ্তি বিজ্ঞপ্তি",
                      "আপনার জরুরি জিনিসপত্র, নথিপত্র বা মানুষ হারিয়ে গেলে কিংবা কোথাও পাওয়া গেলে দ্রুত নাগরিকদের সাহায্যে পোস্ট করুন",
                      "🔍",
                    )}

                    {/* Filters & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                      <div className="flex gap-2">
                        {[
                          { id: "all", label: "সব বিজ্ঞপ্তি" },
                          { id: "lost", label: "🔴 হারানো" },
                          { id: "found", label: "🟢 প্রাপ্তি" },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setLostFoundFilter(btn.id as any)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold font-sans transition border ${
                              lostFoundFilter === btn.id
                                ? "bg-[#2d5a27] text-white border-[#2d5a27] shadow-xs"
                                : "bg-white text-gray-600 border-neutral-200 hover:bg-neutral-50"
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setShowLfModal(true)}
                        className="px-5 py-2 bg-[#CD5C5C] hover:bg-[#b04545] text-white rounded-xl text-sm font-bold shadow-sm transition transform hover:-translate-y-0.5 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" /> নতুন বিজ্ঞপ্তি প্রকাশ করুন
                      </button>
                    </div>

                    {loadingLostFound ? (
                      <div className="text-center py-12 flex justify-center items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-[#2d5a27] animate-spin" />
                        <span className="font-sans text-gray-500 text-sm font-bold">
                          লোড হচ্ছে...
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredNotices.map((lf) => (
                          <div
                            key={lf.id}
                            className="bg-white p-5 rounded-2xl border border-[#edeae0] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <span
                                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                    lf.type === "lost"
                                      ? "bg-red-50 text-red-600 border-red-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  }`}
                                >
                                  {lf.type === "lost" ? "হারানো" : "প্রাপ্তি"}
                                </span>
                                <div className="flex items-center gap-1 font-sans">
                                  <span className="text-xs text-gray-400">
                                    {lf.date}
                                  </span>
                                  {!lf.id.startsWith("default_") && (
                                    <button
                                      onClick={() => handleDeleteNotice(lf.id)}
                                      className="text-red-400 hover:text-red-600 p-1 text-xs cursor-pointer ml-1 font-serif"
                                      title="মুছে ফেলুন"
                                    >
                                      🗑️
                                    </button>
                                  )}
                                </div>
                              </div>
                              <h4 className="font-serif font-black text-neutral-800 text-lg leading-tight">
                                {lf.title}
                              </h4>
                              <p className="text-sm text-gray-600 leading-relaxed font-sans">
                                {lf.description}
                              </p>

                              <div className="text-xs text-gray-500 font-sans flex flex-col gap-1 pt-1">
                                <div>
                                  📌 <span className="font-bold">স্থান:</span>{" "}
                                  {lf.location}
                                </div>
                                <div>
                                  👤{" "}
                                  <span className="font-bold">পোস্টকারী:</span>{" "}
                                  {lf.reporterName}
                                </div>
                              </div>
                            </div>
                            <div className="bg-neutral-50 px-4 py-3 rounded-2xl flex items-center justify-between border border-neutral-100">
                              <div className="text-sm font-sans">
                                <span className="block text-gray-500 font-bold mb-0.5 text-xs">
                                  যোগাযোগ:
                                </span>
                                <strong className="text-neutral-800 text-sm tracking-wider">
                                  {lf.contactPhone}
                                </strong>
                              </div>
                              <button
                                onClick={() =>
                                  onSimulateCall(
                                    lf.contactPhone,
                                    lf.reporterName,
                                  )
                                }
                                className="px-4 py-1.5 bg-white border border-neutral-200 hover:border-[#2d5a27] hover:text-[#2d5a27] text-neutral-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                              >
                                কল করুন
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Form Modal */}
                    {showLfModal && (
                      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-100 space-y-4 max-h-[90vh] overflow-y-auto">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h3 className="font-serif font-black text-lg text-[#2d5a27]">
                              🚨 নতুন বিজ্ঞপ্তি পোস্ট করুন
                            </h3>
                            <button
                              onClick={() => setShowLfModal(false)}
                              className="text-gray-400 hover:text-red-500 font-bold text-2xl rotate-45 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <form
                            onSubmit={handleAddNotice}
                            className="space-y-4 text-xs"
                          >
                            <div className="space-y-1">
                              <label className="font-bold text-gray-600">
                                বিজ্ঞপ্তির ধরন *
                              </label>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => setLfType("lost")}
                                  className={`flex-1 py-3 rounded-xl text-center font-bold border transition ${
                                    lfType === "lost"
                                      ? "bg-red-50 text-red-600 border-red-300 shadow-xs"
                                      : "bg-white text-gray-500 border-neutral-200"
                                  }`}
                                >
                                  🔴 জিনিসপত্র হারিয়েছে
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setLfType("found")}
                                  className={`flex-1 py-3 rounded-xl text-center font-bold border transition ${
                                    lfType === "found"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                                      : "bg-white text-gray-500 border-neutral-200"
                                  }`}
                                >
                                  🟢 জিনিসপত্র কুড়িয়ে পেয়েছি
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-gray-600">
                                বিজ্ঞপ্তির শিরোনাম *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="যেমন: একটি ওয়ালেট হারানো গেছে"
                                value={lfTitle || ""}
                                onChange={(e) => setLfTitle(e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl font-bold text-gray-700 focus:border-[#2d5a27]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-gray-600 font-sans">
                                বিস্তারিত বিবরণ *
                              </label>
                              <textarea
                                required
                                rows={3}
                                placeholder="জিনিসটির বিবরণ, কবে ও কোন জায়গা থেকে হারিয়েছে বা পাওয়া গেছে তা বিস্তারিত লিখুন..."
                                value={lfDesc || ""}
                                onChange={(e) => setLfDesc(e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl font-medium text-gray-700 focus:border-[#2d5a27] resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="font-bold text-gray-600">
                                  ঘটনার স্থান *
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="যেমন: পুঠিয়া বাসস্ট্যান্ড সংলগ্ন"
                                  value={lfLocation || ""}
                                  onChange={(e) =>
                                    setLfLocation(e.target.value)
                                  }
                                  className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl text-gray-700 focus:border-[#2d5a27]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-gray-600">
                                  তারিখ ও সময় *
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="যেমন: ১৮ জুন, সকালে ১০টা"
                                  value={lfDate || ""}
                                  onChange={(e) => setLfDate(e.target.value)}
                                  className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl text-gray-700 focus:border-[#2d5a27]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="font-bold text-gray-600">
                                  আপনার নাম *
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="যেমন: আবদুর রহিম"
                                  value={lfReporter || ""}
                                  onChange={(e) =>
                                    setLfReporter(e.target.value)
                                  }
                                  className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl text-gray-700 focus:border-[#2d5a27]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-gray-600">
                                  মোবাইল কন্টাক্ট নম্বর *
                                </label>
                                <input
                                  type="tel"
                                  required
                                  placeholder="যেমন: ০১৭০০-০০০০০০"
                                  value={lfPhone || ""}
                                  onChange={(e) => setLfPhone(e.target.value)}
                                  className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl text-gray-700 focus:border-[#2d5a27]"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3 bg-[#2d5a27] hover:bg-[#1a3816] text-white font-extrabold text-sm rounded-xl transition shadow-sm cursor-pointer mt-2"
                            >
                              বিজ্ঞপ্তি প্রকাশ করুন
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            {communityTab === "volunteer_network" && <VolunteerNetwork onGoBack={onGoBack} />}
            {communityTab === "community_programs" && <CommunityPrograms onGoBack={onGoBack} />}
            {communityTab === "sports_activities" && <SportsActivities onGoBack={onGoBack} />}
            {communityTab === "cultural_activities" && <CulturalActivities onGoBack={onGoBack} />}
            {communityTab === "social_organizations" && <SocialOrganizations onGoBack={onGoBack} />}
            {communityTab === "photo_video_gallery" && <PhotoVideoGallery onGoBack={onGoBack} />}
            {communityTab === "social_events" &&
              (() => {
                const activeSocialEvents =
                  socialEvents.length > 0
                    ? socialEvents
                    : [
                        {
                          id: "default_se1",
                          title: "উপজেলা গোল্ডকাপ ফুটবল টুর্নামেন্ট ফাইনাল",
                          description:
                            "টানটান উত্তেজনাময় পুঠিয়া উপজেলা স্পোর্টিং ক্লাব বনাম শিলমাড়িয়া ইউনিয়নের মধ্যকার চমৎকার ফাইনাল ফুটবল ম্যাচ। এলাকার ক্রীড়ামোদী সকল নাগরিকদের পরিবার নিয়ে মাঠে উপস্থিত থেকে তরুণ খেলোয়াড়দের অনুপ্রাণিত করার জন্য বিনীত আমন্ত্রণ জানানো যাচ্ছে।",
                          eventDate: "২২ জুন ২০২৬",
                          eventTime: "বিকাল ৩:৩০",
                          venue: "পুঠিয়া পি.এন সরকারি উচ্চ বিদ্যালয় মাঠ",
                          category: "খেলাধুলা",
                          organizer: "উপজেলা ক্রীড়া অ্যাসোসিয়েশন পুঠিয়া",
                          contactPhone: "০১৭২২-৯৮৭৬৫৪",
                          createdAt: "2026-05-18T12:00:00.000Z",
                        },
                        {
                          id: "default_se2",
                          title:
                            "বানেশ্বর শিব মন্দির ঐতিহ্যবাহী দোল উৎসব ও মেলা",
                          description:
                            "শত বছরের ইতিহাসসমৃদ্ধ বানেশ্বর শিব মন্দির প্রাঙ্গণে বাৎসরিক মেলা ও মনোজ্ঞ লোকসংগীত উৎসবানুষ্ঠান শুরু হতে যাচ্ছে। দেশের বিভিন্ন প্রান্তের হস্তশিল্প বিক্রেতাদের স্টল ও ঘূর্ণায়মান নাগরদোলা মেলায় আকর্ষণ বাড়াবে। মেলা সফল ও শান্তিপূর্ণ করতে সকলের সহযোগিতা একান্ত কাম্য।",
                          eventDate: "২৩ জুন ২০২৬",
                          eventTime: "সকাল ৯:০০ থেকে রাত ৯:০০",
                          venue: "বানেশ্বর শিব মন্দির প্রাঙ্গণ",
                          category: "মেলা ও উৎসব",
                          organizer: "বানেশ্বর শিব মন্দির ট্রাস্ট",
                          contactPhone: "০১৭১১-২২৩৩৪৪",
                          createdAt: "2026-05-19T08:00:00.000Z",
                        },
                      ];

                const handleAddSocialEvent = async (e: React.FormEvent) => {
                  e.preventDefault();
                  if (
                    !seTitle.trim() ||
                    !seDesc.trim() ||
                    !seDate.trim() ||
                    !seTime.trim() ||
                    !seVenue.trim() ||
                    !seOrganizer.trim() ||
                    !sePhone.trim()
                  ) {
                    alert("দয়া করে প্রয়োজনীয় সব তথ্য সঠিকভাবে প্রদান করুন।");
                    return;
                  }
                  const newEvent = {
                    title: seTitle,
                    description: seDesc,
                    eventDate: seDate,
                    eventTime: seTime,
                    venue: seVenue,
                    category: seCategory,
                    organizer: seOrganizer,
                    contactPhone: sePhone,
                    createdAt: new Date().toISOString(),
                  };
                  try {
                    await addSocialEvent(newEvent);
                    setSeTitle("");
                    setSeDesc("");
                    setSeDate("");
                    setSeTime("");
                    setSeVenue("");
                    setSeOrganizer("");
                    setSePhone("");
                    setShowSeModal(false);
                    const res = await getSocialEvents();
                    setSocialEvents(res);
                  } catch (err) {
                    console.error(err);
                  }
                };

                const handleDeleteEvent = async (id: string) => {
                  if (
                    !window.confirm(
                      "আপনি কি নিশ্চিতভাবে এই ইভেন্টটি ডিলিট করতে চান?",
                    )
                  )
                    return;
                  try {
                    await deleteSocialEvent(id);
                    const res = await getSocialEvents();
                    setSocialEvents(res);
                  } catch (err) {
                    console.error(err);
                  }
                };

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <h3 className="text-base font-bold text-[#2d5a27] font-serif">
                        আসন্ন সামাজিক ও সাংস্কৃতিক অনুষ্ঠান
                      </h3>
                      <button
                        onClick={() => setShowSeModal(true)}
                        className="px-4 py-1.5 bg-[#2d5a27] hover:bg-[#1a3816] text-white rounded-xl text-sm font-bold transition shadow-sm cursor-pointer border-none"
                      >
                        + নতুন ইভেন্ট যুক্ত করুন
                      </button>
                    </div>

                    {loadingSocialEvents ? (
                      <div className="text-center py-12 flex justify-center items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-[#2d5a27] animate-spin" />
                        <span className="font-sans text-gray-500 text-sm font-bold">
                          লোড হচ্ছে...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeSocialEvents.map((evt) => (
                          <div
                            key={evt.id}
                            className="flex flex-col sm:flex-row gap-5 bg-white p-5 rounded-3xl border border-[#edeae0] shadow-sm hover:shadow-md transition relative"
                          >
                            {/* Left Date Panel */}
                            <div className="p-4 rounded-2xl border bg-emerald-50 text-emerald-800 border-emerald-200 text-center min-w-[100px] flex flex-row sm:flex-col justify-center items-center gap-2 sm:gap-0 shrink-0">
                              <span className="text-3xl font-serif font-black">
                                📅
                              </span>
                              <span className="text-xs font-sans font-bold uppercase sm:mt-1">
                                {evt.eventDate}
                              </span>
                            </div>

                            {/* Right Description Panel */}
                            <div className="flex-1 space-y-3">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-serif font-black text-[#2d5a27] text-lg leading-tight">
                                    {evt.title}
                                  </h4>
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-neutral-100 text-neutral-600 border-neutral-200">
                                    {evt.category}
                                  </span>
                                </div>
                                {!evt.id.startsWith("default_") && (
                                  <button
                                    onClick={() => handleDeleteEvent(evt.id)}
                                    className="text-red-400 hover:text-red-600 p-1 text-sm cursor-pointer shrink-0"
                                    title="মুছে ফেলুন"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 font-sans leading-relaxed">
                                {evt.description}
                              </p>
                              <div className="text-xs text-gray-500 font-sans flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-1">
                                <span>
                                  ⏰{" "}
                                  <strong className="text-gray-700 font-bold">
                                    সময়:
                                  </strong>{" "}
                                  {evt.eventTime}
                                </span>
                                <span>
                                  📍{" "}
                                  <strong className="text-gray-700 font-bold">
                                    স্থান:
                                  </strong>{" "}
                                  {evt.venue}
                                </span>
                                <span>
                                  👤{" "}
                                  <strong className="text-gray-700 font-bold">
                                    আয়োজক:
                                  </strong>{" "}
                                  {evt.organizer}
                                </span>
                              </div>
                            </div>

                            <div className="absolute right-5 bottom-5 hidden md:block font-sans">
                              <button
                                onClick={() =>
                                  onSimulateCall(
                                    evt.contactPhone,
                                    evt.organizer,
                                  )
                                }
                                className="px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition cursor-pointer border border-neutral-200"
                              >
                                আয়োজককে কল দিন
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Social Event Form Modal */}
                    {showSeModal && (
                      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-100 space-y-4 max-h-[90vh] overflow-y-auto">
                          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h3 className="font-serif font-black text-lg text-[#2d5a27]">
                              📅 নতুন সমাজ অনুষ্ঠান প্রকাশ
                            </h3>
                            <button
                              onClick={() => setShowSeModal(false)}
                              className="text-gray-400 hover:text-red-500 font-bold text-2xl rotate-45 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <form
                            onSubmit={handleAddSocialEvent}
                            className="space-y-4 text-xs"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="font-bold text-gray-600">
                                  অনুষ্ঠানের নাম/শিরোনাম *
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="যেমন: রক্তদান ক্যাম্পেইন"
                                  value={seTitle || ""}
                                  onChange={(e) => setSeTitle(e.target.value)}
                                  className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl font-bold text-gray-700 focus:border-[#2d5a27]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-gray-600">
                                  ক্যাটাগরি *
                                </label>
                                <select
                                  value={seCategory || ""}
                                  onChange={(e) =>
                                    setSeCategory(e.target.value)
                                  }
                                  className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl font-bold text-gray-700 focus:border-[#2d5a27]"
                                >
                                  <option value="খেলাধুলা">
                                    খেলাধুলা / ম্যাচ
                                  </option>
                                  <option value="মেলা/উৎসব">
                                    মেলা / সাংস্কৃতিক উৎসব
                                  </option>
                                  <option value="ধর্মীয় অনুষ্ঠান">
                                    ধর্মীয় অনুষ্ঠান (ওয়াজ/পূজা)
                                  </option>
                                  <option value="স্বেচ্ছাসেবী">
                                    স্বেচ্ছাসেবী ও সেবামূলক
                                  </option>
                                  <option value="অন্যান্য">
                                    অন্যান্য উৎসব
                                  </option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1 bg-white">
                              <label className="font-bold text-gray-600">
                                অনুষ্ঠানের বিস্তারিত বিবরণ *
                              </label>
                              <textarea
                                required
                                rows={3}
                                placeholder="অনুষ্ঠানের বিষয়বস্তু, কোনো বিশেষ নিমন্ত্রণ থাকলে তা স্পষ্ট করে বলুন..."
                                value={seDesc || ""}
                                onChange={(e) => setSeDesc(e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl font-medium text-gray-700 focus:border-[#2d5a27] resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1 border-neutral-50">
                                <label className="font-bold text-gray-600">
                                  অনুষ্ঠানের দিন/তারিখ *
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="যেমন: ১৫ জুলাই, ২০২৬"
                                  value={seDate || ""}
                                  onChange={(e) => setSeDate(e.target.value)}
                                  className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl text-gray-700 focus:border-[#2d5a27]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-gray-600">
                                  সময়সূচী *
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="যেমন: বিকাল ৪:০০ টা হতে"
                                  value={seTime || ""}
                                  onChange={(e) => setSeTime(e.target.value)}
                                  className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl text-gray-700 focus:border-[#2d5a27]"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-gray-600">
                                অনুষ্ঠানের স্থান/ভেন্যু *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="যেমন: বানেশ্বর খেলার মাঠ"
                                value={seVenue || ""}
                                onChange={(e) => setSeVenue(e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl text-gray-700 focus:border-[#2d5a27]"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="font-bold text-gray-600">
                                  আয়োজক কমিটি / ব্যক্তি *
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="যেমন: তরুণ সংঘ একাডেমি"
                                  value={seOrganizer || ""}
                                  onChange={(e) =>
                                    setSeOrganizer(e.target.value)
                                  }
                                  className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl text-gray-700 focus:border-[#2d5a27]"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-gray-600">
                                  অনুরোধকারী মোবাইল নম্বর *
                                </label>
                                <input
                                  type="tel"
                                  required
                                  placeholder="যেমন: ০১৯০০-০০০০০০"
                                  value={sePhone || ""}
                                  onChange={(e) => setSePhone(e.target.value)}
                                  className="w-full bg-neutral-50 border border-neutral-200 outline-none p-3 rounded-xl text-gray-700 focus:border-[#2d5a27]"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3 bg-[#2d5a27] hover:bg-[#1a3816] text-white font-extrabold text-sm rounded-xl transition shadow-sm cursor-pointer mt-2"
                            >
                              নতুন সামাজিক ইভেন্ট পোস্ট করুন
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            {communityTab === "volunteer_activities" &&
              (() => {
                const activeVolunteerActs =
                  volunteerActivities.length > 0
                    ? volunteerActivities
                    : [
                        {
                          id: "default_va1",
                          title:
                            "পুঠিয়া রাজবাড়ী দিঘি চত্বর প্লাস্টিকমুক্তকরণ অভিযান",
                          description:
                            "ঐতিহাসিক পুঠিয়া রাজবাড়ীর পঞ্চরত্ন গোবিন্দ মন্দির এবং শিব সাগর সংলগ্ন দিঘির চারপাশ দর্শনার্থীদের ফেলে যাওয়া পলিথিন ও প্লাস্টিক আবর্জনা মুক্ত করার জন্য আগামী শনিবার সচেতনতামূলক স্বেচ্ছাসেবী পরিষ্কার-পরিচ্ছন্নতা ড্রাইভের আয়োজন করা হয়েছে। সকল ছাত্র এবং তরুণ সমাজকে অংশগ্রহণের উদার আহ্বান জানাচ্ছি।",
                          date: "২২ জুন, ২০২৬",
                          organizer: "সচেতন গ্রীন পুঠিয়া ক্লাব",
                          contactPhone: "০১৭১৫-৬৭৮৯০১",
                          volunteerCount: 17,
                          volunteers: [
                            "মোঃ হিমেল (০১৭৭৭৮৮)",
                            "তানভীর (০১৭১১২২)",
                            "রবিন (০১৮১২৩৪)",
                          ],
                          status: "ongoing",
                          createdAt: "2026-06-18T09:00:00.000Z",
                        },
                        {
                          id: "default_va2",
                          title:
                            "ফ্রি ব্লাড গ্রুপিং ক্যাম্প ও ডেঙ্গু সচেতনতা প্রচার",
                          description:
                            "বানেশ্বর ডিগ্রী college ক্যাম্পাসে জরুরি রক্তের সঠিক সোর্স নিশ্চিত করতে সাধারণ মানুষ এবং ছাত্র-ছাত্রীদের ফ্রিতে রক্তের গ্রুপ পরীক্ষা ও ডেঙ্গুর বাহক এডিস মশা নিধনে জনসচেতনতা লিফলেট বিতরণে স্বেচ্ছাসেবক অন্তর্ভুক্তি চলছে।",
                          date: "০৫ জুলাই, ২০২৬",
                          organizer: "উপজেলা রেড ক্রিসেন্ট ভলান্টিয়ার টিম",
                          contactPhone: "০১৯৯৯-৮৮৭৭৬৬",
                          volunteerCount: 12,
                          volunteers: [
                            "নূরে আলম (০১৭১২০০)",
                            "সায়েম (০১৯১৯১৯)",
                            "আয়েশা খাতুন (০১৭৮৭৮৭)",
                          ],
                          status: "ongoing",
                          createdAt: "2026-06-17T11:00:00.000Z",
                        },
                      ];

                const handleAddVolunteerActivity = async (
                  e: React.FormEvent,
                ) => {
                  e.preventDefault();
                  if (
                    !vaTitle.trim() ||
                    !vaDesc.trim() ||
                    !vaDate.trim() ||
                    !vaOrganizer.trim() ||
                    !vaPhone.trim()
                  ) {
                    alert("দয়া করে প্রয়োজনীয় সব তথ্য সঠিকভাবে প্রদান করুন।");
                    return;
                  }
                  const newAct = {
                    title: vaTitle,
                    description: vaDesc,
                    date: vaDate,
                    organizer: vaOrganizer,
                    contactPhone: vaPhone,
                    volunteerCount: 0,
                    volunteers: [],
                    status: "ongoing" as const,
                    createdAt: new Date().toISOString(),
                  };
                  try {
                    await addVolunteerActivity(newAct);
                    setVaTitle("");
                    setVaDesc("");
                    setVaDate("");
                    setVaOrganizer("");
                    setVaPhone("");
                    setShowVaModal(false);
                    const res = await getVolunteerActivities();
                    setVolunteerActivities(res);
                  } catch (err) {
                    console.error(err);
                  }
                };

                const handleEnrollSubmit = async (e: React.FormEvent) => {
                  e.preventDefault();
                  if (!enrollingActId) return;
                  if (!enrollName.trim() || !enrollPhone.trim()) {
                    alert("দয়া করে আপনার নাম ও কন্টাক্ট নম্বর সঠিকভাবে লিখুন।");
                    return;
                  }
                  const activity = activeVolunteerActs.find(
                    (a) => a.id === enrollingActId,
                  );
                  if (!activity) return;

                  try {
                    await enrollVolunteer(
                      enrollingActId,
                      enrollName,
                      enrollPhone,
                      activity.volunteers || [],
                    );
                    setEnrollName("");
                    setEnrollPhone("");
                    setEnrollingActId(null);
                    alert(
                      "অভিনন্দন! আপনি সফলভাবে এই স্বেচ্ছাসেবী কার্যক্রমে ভলান্টিয়ার হিসেবে যুক্ত হয়েছেন।",
                    );
                    const res = await getVolunteerActivities();
                    setVolunteerActivities(res);
                  } catch (err) {
                    console.error(err);
                  }
                };

                const handleDeleteActivity = async (id: string) => {
                  if (id.startsWith("default_")) return;
                  if (
                    !confirm(
                      "আপনি কি নিশ্চিতভাবে এই স্বেচ্ছাসেবী ড্রাইভটি মুছে ফেলতে চান?",
                    )
                  )
                    return;
                  try {
                    await deleteVolunteerActivity(id);
                    const res = await getVolunteerActivities();
                    setVolunteerActivities(res);
                  } catch (err) {
                    console.error(err);
                  }
                };

                return (
                  <div className="space-y-6">
                    {getHeader(
                      "স্বেচ্ছাসেবী কার্যক্রম ও ভলান্টিয়ারিং ড্রাইভ",
                      "উপজেলার বিভিন্ন পরিবেশ রক্ষা, পরিষ্কার-পরিচ্ছন্নতা, ত্রাণ সাহায্য এবং সেবামূলক কার্যক্রমে যুক্ত হয়ে মানবিক সমাজ বিনির্মাণ করুন",
                      "🤝",
                    )}

                    {/* Table Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
                      <h3 className="text-base font-bold text-[#2d5a27] font-serif">
                        চলমান সামাজিক স্বেচ্ছাসেবা 
                      </h3>
                      <button
                        onClick={() => setShowVaModal(true)}
                        className="px-5 py-2 bg-[#CD5C5C] hover:bg-[#b04545] text-white rounded-xl text-sm font-bold shadow-sm transition transform hover:-translate-y-0.5 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" /> নতুন ভলান্টিয়ার ড্রাইভ
                        প্রকাশ করুন
                      </button>
                    </div>

                    {loadingVolunteer ? (
                      <div className="text-center py-12 flex justify-center items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-[#2d5a27] animate-spin" />
                        <span className="font-sans text-gray-500 text-sm font-bold">
                          লোড হচ্ছে...
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {activeVolunteerActs.map((act) => (
                          <div
                            key={act.id}
                            className="bg-white p-5 rounded-3xl border border-[#edeae0] shadow-sm flex flex-col justify-between hover:shadow-md transition relative"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-4">
                                <span className="text-2xl">🌱</span>
                                {!act.id.startsWith("default_") && (
                                  <button
                                    onClick={() => handleDeleteActivity(act.id)}
                                    className="text-red-400 hover:text-red-600 p-1 text-xs cursor-pointer ml-auto"
                                    title="মুছে ফেলুন"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>

                              <h4 className="font-serif font-black text-neutral-800 text-base leading-tight">
                                {act.title}
                              </h4>
                              <p className="text-sm text-gray-500 leading-relaxed font-sans">
                                {act.description}
                              </p>

                              {/* Progress indicators or meta */}
                              <div className="space-y-1.5 pt-1 text-xs text-gray-400 font-sans">
                                <div className="flex justify-between">
                                  <span>
                                    👥{" "}
                                    <strong className="text-gray-600 font-bold">
                                      ভলান্টিয়ার তালিকায়:
                                    </strong>
                                  </span>
                                  <span className="font-bold text-[#2d5a27]">
                                    {act.volunteerCount ||
                                      act.volunteers?.length ||
                                      0}{" "}
                                    জন যুক্ত হয়েছেন
                                  </span>
                                </div>
                                <div>
                                  ⏰{" "}
                                  <strong className="text-gray-600 font-bold">
                                    তারিখ:
                                  </strong>{" "}
                                  {act.date}
                                </div>
                                <div>
                                  📢{" "}
                                  <strong className="text-gray-600 font-bold">
                                    আয়োজক:
                                  </strong>{" "}
                                  {act.organizer}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
          </div>
        );
      }

      case "career_portal":
        return (
          <div className="space-y-6">
            {/* ১. হিরো ব্যানার সেকশন (Hero Banner) */}
            <div
              className="w-full rounded-3xl flex flex-col justify-center p-6 md:p-8 text-white relative overflow-hidden shadow-xs border border-green-800/10"
              style={{
                background: "linear-gradient(135deg, #2E7D32, #1B5E20)",
              }}
            >
              {/* Back button */}
              <button
                type="button"
                onClick={() => onGoBack()}
                className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer border-none"
              >
                ← ফিরে যান
              </button>

              <div className="mt-8 font-sans text-left">
                <span className="text-[#81C784] text-xs font-semibold uppercase tracking-wider mb-1 block">
                  🍁 কর্মসংস্থান ও ক্যারিয়ার
                </span>
                <h1 className="text-2xl md:text-3.5xl font-serif font-black text-white leading-tight">
                  স্থানীয় চাকরির বিজ্ঞপ্তি
                </h1>
                <p className="text-xs md:text-sm text-green-50/90 mt-2 leading-relaxed max-w-2xl font-sans font-medium">
                  পুঠিয়া উপজেলা এবং এর আশেপাশের এলাকার বিভিন্ন দোকান, শোরুম,
                  এনজিও, স্কুল ও কোম্পানিতে চলমান নিয়োগ বিজ্ঞপ্তিগুলো দেখুন এবং
                  সরাসরি যোগাযোগ করুন।
                </p>
              </div>
            </div>

            {/* ২. ক্যাটেগরি ফিল্টার গ্রিড */}
            <div className="grid grid-cols-4 gap-2 font-sans">
              <button
                type="button"
                onClick={() => {
                  setLocalJobCategoryTab("all");
                  setJobRegSuccess(false);
                }}
                className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-xs ${
                  localJobCategoryTab === "all"
                    ? "bg-[#81C784] text-zinc-900 border-[#81C784] font-black"
                    : "bg-white text-gray-700 border-[#edeae0] hover:bg-green-50/20 font-bold"
                }`}
              >
                <span className={`text-xl ${localJobCategoryTab === "all" ? 'scale-110' : ''} transition-transform`}>💼</span>
                <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight">সব চাকরি</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLocalJobCategoryTab("showroom");
                  setJobRegSuccess(false);
                }}
                className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-xs ${
                  localJobCategoryTab === "showroom"
                    ? "bg-[#81C784] text-zinc-900 border-[#81C784] font-black"
                    : "bg-white text-gray-700 border-[#edeae0] hover:bg-green-50/20 font-bold"
                }`}
              >
                <span className={`text-xl ${localJobCategoryTab === "showroom" ? 'scale-110' : ''} transition-transform`}>🏪</span>
                <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight">শোরুম/দোকান</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLocalJobCategoryTab("ngo");
                  setJobRegSuccess(false);
                }}
                className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-xs ${
                  localJobCategoryTab === "ngo"
                    ? "bg-[#81C784] text-zinc-900 border-[#81C784] font-black"
                    : "bg-white text-gray-700 border-[#edeae0] hover:bg-green-50/20 font-bold"
                }`}
              >
                <span className={`text-xl ${localJobCategoryTab === "ngo" ? 'scale-110' : ''} transition-transform`}>🏫</span>
                <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight">এনজিও/শিক্ষক</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLocalJobCategoryTab("post");
                  // Clear form fields
                  setJobRegTitle("");
                  setJobRegOrg("");
                  setJobRegSalary("");
                  setJobRegContact("");
                  setJobRegReq("");
                  setJobRegDeadline("");
                  setJobRegSuccess(false);
                }}
                className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-xs ${
                  localJobCategoryTab === "post"
                    ? "bg-[#2E7D32] text-white border-[#2E7D32] font-black"
                    : "bg-white text-gray-700 border-[#edeae0] hover:bg-green-50/20 font-bold"
                }`}
              >
                <span className={`text-xl ${localJobCategoryTab === "post" ? 'scale-110' : ''} transition-transform`}>📝</span>
                <span className="text-[9px] sm:text-[11px] leading-tight font-extrabold tracking-tight">নিয়োগ পোস্ট</span>
              </button>
            </div>

            {/* ৩. মূল চাকরির বিজ্ঞপ্তি কার্ড সেকশন (Job Circular Feed) */}
            {localJobCategoryTab !== "post" && (
              <div className="space-y-4 font-sans text-left">
                {/* Internal Search bar within jobs page */}
                <div className="bg-white p-4 rounded-2xl border border-[#edeae0] shadow-xs flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="পদের নাম, প্রতিষ্ঠান বা স্থান লিখে খুজুন..."
                      value={jobSearch || ""}
                      onChange={(e) => setJobSearch(e.target.value)}
                      className="w-full bg-neutral-50 pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#2E7D32] transition"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  {jobSearch && (
                    <button
                      type="button"
                      onClick={() => setJobSearch("")}
                      className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      মুছে ফেলুন
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-3xl p-5 md:p-6 border border-[#edeae0] shadow-xs hover:border-green-300 hover:shadow-xs transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-5"
                      >
                        {/* Information Row */}
                        <div className="flex-1 flex gap-4 items-start">
                          {/* Bubble Container */}
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl font-bold font-sans shadow-xs border border-green-150/10"
                            style={{
                              background:
                                job.category === "showroom"
                                  ? "rgba(129, 199, 132, 0.15)"
                                  : "rgba(46, 125, 50, 0.1)",
                              color:
                                job.category === "showroom"
                                  ? "#2E7D32"
                                  : "#1B5E20",
                            }}
                          >
                            {job.icon || "💼"}
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base md:text-lg font-black text-gray-800 leading-tight">
                                {job.title}
                              </h4>
                              {job.badge && (
                                <span className="px-2 py-0.5 text-[9px] font-black border border-green-200 bg-green-50 text-green-800 rounded-md uppercase tracking-wider">
                                  {job.badge}
                                </span>
                              )}
                              <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                {job.type || "পূর্ণকালীন"}
                              </span>
                            </div>

                            {/* Company and Location detail list */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 font-sans">
                              <p className="flex items-center gap-1.5">
                                <span>🏢</span>
                                <strong>প্রতিষ্ঠান:</strong>{" "}
                                <span className="text-gray-700 font-semibold">
                                  {job.org}
                                </span>
                              </p>
                              <p className="flex items-center gap-1.5 font-sans">
                                <span>📍</span>
                                <strong>স্থান:</strong>{" "}
                                <span className="text-gray-700 font-semibold">
                                  {job.location}
                                </span>
                              </p>
                            </div>

                            {/* Job Description details */}
                            <p className="text-xs md:text-sm text-gray-650 leading-relaxed font-sans font-medium">
                              {job.desc}
                            </p>

                            {/* Requirements & Salary summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-neutral-50 p-3 rounded-xl border border-neutral-150/60 font-sans mt-1">
                              <p className="flex items-start gap-1">
                                <span className="text-green-700">💰</span>
                                <span>
                                  <strong>বেতন:</strong>{" "}
                                  <span className="text-gray-800 font-bold">
                                    {job.salary}
                                  </span>
                                </span>
                              </p>
                              <p className="flex items-start gap-1">
                                <span className="text-green-700">🎓</span>
                                <span>
                                  <strong>যোগ্যতা:</strong>{" "}
                                  <span className="text-gray-800 font-bold">
                                    {job.req}
                                  </span>
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Call Button Container */}
                        <div className="w-full md:w-52 flex flex-col justify-center items-center gap-2 shrink-0 md:pl-5 md:border-l border-gray-150 pt-4 md:pt-0 self-stretch">
                          <div className="text-center hidden md:block">
                            <span className="text-[10px] text-gray-400 font-sans font-black uppercase tracking-widest block">
                              সহজ আবেদন কন্টাক্ট
                            </span>
                            <p className="text-[11px] text-gray-500 font-sans">
                              সরাসরি নিয়োগকর্তাকে কল করুন
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onSimulateCall(
                                job.contact,
                                `${job.title} - ${job.org}`,
                              )
                            }
                            className="w-full py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold rounded-2xl text-xs transition cursor-pointer text-center shadow-xs border-none flex items-center justify-center gap-1.5"
                          >
                            📞 সরাসরি যোগাযোগ
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[#fcfbf7] p-12 rounded-3xl text-center text-gray-400 border border-dashed border-[#edeae0] space-y-2">
                      <div className="text-4xl text-gray-300">🔎</div>
                      <h4 className="text-base font-bold text-gray-700">
                        কোনো চাকরির বিজ্ঞপ্তি পাওয়া যায়নি
                      </h4>
                      <p className="text-xs font-medium">
                        অনুসন্ধান বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ৪. নিয়োগ পোস্ট করুন ফর্ম (Recruitment submit form) */}
            {localJobCategoryTab === "post" && (
              <div className="bg-white rounded-3xl p-6 border border-[#edeae0] shadow-xs text-left animate-fade-in font-sans">
                {!jobRegSuccess ? (
                  <form onSubmit={handleLocalJobSubmit} className="space-y-4">
                    <div className="border-b border-gray-100 pb-3 mb-2">
                      <h4 className="font-serif font-black text-[#2e7d32] text-lg">
                        নিয়োগ বিজ্ঞপ্তি পোস্ট করুন
                      </h4>
                      <p className="text-xs text-gray-500">
                        আপনার শোরুম, এনজিও, দোকান বা স্কুলের নিয়োগ তথ্য স্থানীয়
                        যুবকদের জানাতে ফর্মে সতর্কতার সাথে তথ্য দিন।
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Job Title input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-650 block">
                          পদের নাম <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদা: সেলস রিপ্রেজেন্টেটিভ"
                          value={jobRegTitle || ""}
                          onChange={(e) => setJobRegTitle(e.target.value)}
                          className="w-full bg-neutral-50 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#2E7D32]"
                        />
                      </div>

                      {/* Company Name input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-650 block">
                          প্রতিষ্ঠানের নাম{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদা: মেসার্স পুঠিয়া ইলেকট্রনিক্স"
                          value={jobRegOrg || ""}
                          onChange={(e) => setJobRegOrg(e.target.value)}
                          className="w-full bg-neutral-50 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#2E7D32]"
                        />
                      </div>

                      {/* Location input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-650 block">
                          কর্মস্থল/স্থান <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদা: রাজবাড়ী বাজার, পুঠিয়া সদর"
                          value={jobRegDeadline || ""}
                          onChange={(e) => setJobRegDeadline(e.target.value)}
                          className="w-full bg-neutral-50 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#2E7D32]"
                        />
                      </div>

                      {/* Salary input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-650 block">
                          বেতন ও কর্মকালীন সুযোগ{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদা: ১০,০০০ - ১২,০০০ টাকা / আলোচনা সাপেক্ষ"
                          value={jobRegSalary || ""}
                          onChange={(e) => setJobRegSalary(e.target.value)}
                          className="w-full bg-neutral-50 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#2E7D32]"
                        />
                      </div>

                      {/* Requirement input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-650 block">
                          শিক্ষাগত যোগ্যতা বা আবশ্যিকতা{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদা: এসএসসি পাস / বাইসাইকেল চালনা আবশ্যক"
                          value={jobRegReq || ""}
                          onChange={(e) => setJobRegReq(e.target.value)}
                          className="w-full bg-neutral-50 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#2E7D32]"
                        />
                      </div>

                      {/* Contact input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-650 block">
                          সরাসরি যোগাযোগের মোবাইল নম্বর{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="উদা: ০১৭১১-২২৩৩৪৪"
                          value={jobRegContact || ""}
                          onChange={(e) => setJobRegContact(e.target.value)}
                          className="w-full bg-neutral-50 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#2E7D32]"
                        />
                      </div>

                      {/* Job Sector choose */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-650 block">
                          চাকরির ক্যাটেগরি{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={jobRegSector || ""}
                          onChange={(e) => setJobRegSector(e.target.value)}
                          className="w-full bg-neutral-50 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#2E7D32]"
                        >
                          <option value="showroom">🏪 শোরুম ও দোকান</option>
                          <option value="ngo">🏫 এনজিও ও শিক্ষকতা</option>
                        </select>
                      </div>

                      {/* Job type (Part-time / Full-time) */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-650 block">
                          চাকরির ধরন
                        </label>
                        <select
                          value={jobRegType || ""}
                          onChange={(e) => setJobRegType(e.target.value)}
                          className="w-full bg-neutral-50 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#2E7D32]"
                        >
                          <option value="পূর্ণকালীন">পূর্ণকালীন</option>
                          <option value="খণ্ডকালীন">
                            খণ্ডকালীন/পার্ট-টাইম
                          </option>
                          <option value="চুক্তি ভিত্তিক">চুক্তি ভিত্তিক</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold rounded-2xl text-xs transition cursor-pointer text-center block mt-3 shadow-xs border-none"
                    >
                      বিজ্ঞপ্তি প্রকাশ করুন
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-4 animate-fade-in font-sans">
                    <div className="w-16 h-16 bg-green-50 text-[#2e7d32] border border-green-200 rounded-full flex items-center justify-center mx-auto text-3xl">
                      ✓
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-serif font-black text-[#2e7d32] text-xl">
                        চাকরির বিজ্ঞপ্তি প্রকাশ সফল হয়েছে!
                      </h4>
                      <p className="text-xs text-gray-500">
                        আপনার পোস্টটি তাৎক্ষণিকভাবে পুঠিয়া উপজেলা চাকরি ডাটাবেজে
                        যুক্ত করা হয়েছে।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setJobRegSuccess(false);
                        setLocalJobCategoryTab("all");
                      }}
                      className="px-6 py-2 bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-extrabold rounded-xl transition cursor-pointer border-none shadow-xs"
                    >
                      চাকরির তালিকা দেখুন
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "MOCK_health_2":
        {
          const docs = [
            {
              name: "ডাঃ রেজোয়ানুল ইসলাম প্রিন্স",
              deg: "এমবিবিএস, এফসিপিএস (মেডিসিন স্পেশালিস্ট)",
              time: "রবি ও মঙ্গলবার সকাল ৯-১টা",
              icon: "🩺",
              matchUnion: "sadar",
            },
            {
              name: "ডাঃ তাসনিম জাহান মৌলী",
              deg: "এমবিবিএস, এমএস (গাইনি ও প্রসূতি রোগ অভিজ্ঞ)",
              time: "সোম ও বুধবার সকাল ১০-২টা",
              icon: "👩‍⚕️",
              matchUnion: "sadar",
            },
            {
              name: "ডাঃ শফিকুর রহমান",
              deg: "এমবিবিএস, ডি-অর্থো (হাড় ও জোড়া রোগ)",
              time: "বৃহস্পতিবার বিকাল ৫-৮টা",
              icon: "🦴",
              matchUnion: "baneshwar",
            },
          ].filter(
            (d) =>
              (healthUnionFilter === "all" ||
                d.matchUnion === healthUnionFilter) &&
              (d.name.toLowerCase().includes(healthSearch.toLowerCase()) ||
                d.deg.toLowerCase().includes(healthSearch.toLowerCase())),
          );

          const ambus = [
            {
              title: "পুঠিয়া উপজেলা হাসপাতাল জরুরি অ্যাম্বুলেন্স",
              driver: "মোঃ আলতাফ আলী (চালক)",
              phone: "01711-404561",
              region: "পুঠিয়া সদর",
              icon: "🚑",
              matchUnion: "sadar",
            },
            {
              title: "বানেশ্বর লায়ন্স রেড ক্রিসেন্ট অ্যাম্বুলেন্স",
              driver: "শেখ আরমান (রেসপন্স)",
              phone: "01824-998877",
              region: "বানেশ্বর মোড়",
              icon: "🚨",
              matchUnion: "baneshwar",
            },
          ].filter(
            (a) =>
              (healthUnionFilter === "all" ||
                a.matchUnion === healthUnionFilter) &&
              (a.title.toLowerCase().includes(healthSearch.toLowerCase()) ||
                a.region.toLowerCase().includes(healthSearch.toLowerCase())),
          );

          const diags = [
            {
              title: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
              desc: "জরুরি সেবা, আউটডোর ও ভর্তি",
              phone: "০১৭৩০-৩২৪৪৫৫",
              icon: "🏥",
              matchUnion: "sadar",
            },
            {
              title: "মডার্ন ডায়াগনস্টিক সেন্টার",
              desc: "এক্স-রে, ইসিজি, প্যাথলজি টেস্ট",
              phone: "০১৭২২-৩৩৪৪৫৫",
              icon: "🔬",
              matchUnion: "sadar",
            },
            {
              title: "বানেশ্বর বেসরকারি ক্লিনিক",
              desc: "বিশেষজ্ঞ ডাক্তার চেম্বার ও সার্জারি",
              phone: "০১৭৩৩-৪৫৬৭৮৯",
              icon: "🩺",
              matchUnion: "baneshwar",
            },
            {
              title: "পুঠিয়া চক্ষু হাসপাতাল",
              desc: "চোখের ছানি অপারেশন ও ভিশন টেস্ট",
              phone: "০১৭৪৪-৫৫৬৬৭৭",
              icon: "👁️",
              matchUnion: "sadar",
            },
          ].filter(
            (d) =>
              (healthUnionFilter === "all" ||
                d.matchUnion === healthUnionFilter) &&
              (d.title.toLowerCase().includes(healthSearch.toLowerCase()) ||
                d.desc.toLowerCase().includes(healthSearch.toLowerCase())),
          );

          return (
            <div className="space-y-6">
              {getHeader(
                "স্বাস্থ্যসেবা ও অ্যাম্বুলেন্স স্পিড ডিরেক্টরি",
                "উপজেলা স্বাস্থ্য কমপ্লেক্সের চিকিৎসকগণের তথ্যসেবা এবং ২৪ ঘন্টা অ্যাক্টিভ অ্যাম্বুলেন্স তালিকা",
                "🏥",
              )}

              <div className="bg-white p-5 rounded-2xl border border-[#edeae0] space-y-5">
                {/* Marked Menu UI Pattern */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-gray-150">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#CD5C5C] text-xl">🏥</span>
                      <span className="text-sm font-serif font-black text-[#2d5a27]">
                        চিকিৎসক, অ্যাম্বুলেন্স ও হাসপাতাল তালিকা
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-sans">
                      মোট {docs.length + ambus.length + diags.length}টি
                      স্বাস্থ্যসেবা প্রদর্শিত হচ্ছে
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <select
                      value={healthUnionFilter || ""}
                      onChange={(e) => setHealthUnionFilter(e.target.value)}
                      className="bg-neutral-50 px-3 py-1.5 border rounded-full outline-none text-sm font-sans cursor-pointer h-9 text-gray-700"
                    >
                      <option value="all">সব ইউনিয়ন ও পৌরসভা</option>
                      <option value="sadar">পুঠিয়া পৌরসভা</option>
                      <option value="baneshwar">বানেশ্বর ইউনিয়ন</option>
                      <option value="shilmaria">শিলমাড়ী ইউনিয়ন</option>
                      <option value="belpukur">বেলপুকুরিয়া ইউনিয়ন</option>
                      <option value="jeupara">জিউপাড়া ইউনিয়ন</option>
                      <option value="bhalukgachhi">ভালুকগাছী ইউনিয়ন</option>
                    </select>

                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="ডাক্তার, অ্যাম্বুলেন্স বা হাসপাতাল খুঁজুন..."
                        value={healthSearch || ""}
                        onChange={(e) => setHealthSearch(e.target.value)}
                        className="w-full bg-neutral-50 pl-3 pr-8 py-1.5 border rounded-full text-sm outline-none font-sans h-9"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 1. Doctors Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-emerald-100">
                      <span className="text-xl">👨‍⚕️</span>
                      <h3 className="font-serif font-black text-[#2d5a27] text-base">
                        বিশেষজ্ঞ চিকিৎসকবৃন্দ
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {docs.length > 0 ? (
                        docs.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-emerald-50/25 border border-emerald-100 hover:border-emerald-300 rounded-2xl transition duration-200"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="text-xl mt-0.5">{doc.icon}</span>
                              <div>
                                <h4 className="font-bold text-gray-800 text-sm md:text-base">
                                  {doc.name}
                                </h4>
                                <p className="text-xs font-sans text-emerald-800 font-medium mt-0.5">
                                  {doc.deg}
                                </p>
                                <p className="text-xs text-gray-500 font-sans mt-1">
                                  🕒 {doc.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          কোনো চিকিৎসক পাওয়া যায়নি
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2. Ambulance Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-rose-100">
                      <span className="text-xl">🚑</span>
                      <h3 className="font-serif font-black text-rose-800 text-base">
                        জরুরি অ্যাম্বুলেন্স
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {ambus.length > 0 ? (
                        ambus.map((ambu, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-rose-50/25 border border-rose-100 hover:border-rose-300 rounded-2xl transition duration-200"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="text-xl mt-0.5">
                                {ambu.icon}
                              </span>
                              <div className="w-full">
                                <h4 className="font-bold text-gray-800 text-sm md:text-base">
                                  {ambu.title}
                                </h4>
                                <p className="text-xs font-sans text-gray-500 mt-1">
                                  📍 {ambu.region}
                                </p>
                                <div className="flex items-center justify-between gap-1.5 mt-3 pt-2.5 border-t border-dashed border-rose-100">
                                  <span className="text-xs text-rose-700 font-bold">
                                    {ambu.driver}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onSimulateCall(
                                        ambu.phone,
                                        `${ambu.title} (${ambu.driver})`,
                                      )
                                    }
                                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold font-sans transition cursor-pointer flex items-center gap-1"
                                  >
                                    📞 কল করুন
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          কোনো অ্যাম্বুলেন্স পাওয়া যায়নি
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3. Hospital/Diagnostic Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-100">
                      <span className="text-xl">🏥</span>
                      <h3 className="font-serif font-black text-blue-800 text-base">
                        ক্লিনিক ও ডায়াগনস্টিক
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {diags.length > 0 ? (
                        diags.map((diag, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-blue-50/25 border border-blue-100 hover:border-blue-300 rounded-2xl transition duration-200"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="text-xl mt-0.5">
                                {diag.icon}
                              </span>
                              <div className="w-full">
                                <h4 className="font-bold text-gray-800 text-sm md:text-base">
                                  {diag.title}
                                </h4>
                                <p className="text-xs font-sans text-gray-500 mt-0.5">
                                  {diag.desc}
                                </p>
                                <div className="flex items-center justify-end mt-3 pt-2.5 border-t border-dashed border-blue-100">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onSimulateCall(diag.phone, diag.title)
                                    }
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold font-sans transition cursor-pointer flex items-center gap-1"
                                  >
                                    📞 কল করুন
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          কোনো ক্লিনিক/ডায়াগনস্টিক পাওয়া যায়নি
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        /* lawyers */
        return (
          <div className="space-y-6">
            {getHeader(
              "আইনজীবী ও সাংবাদিক",
              "স্থানীয় আইনি সহায়তা এবং সংবাদ মাধ্যমের প্রতিনিধিদের সাথে যোগাযোগের তথ্য",
              "⚖️",
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-[#edeae0] shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 text-xl border border-orange-100">
                    ⚖️
                  </div>
                  <h4 className="font-serif font-black text-[#2d5a27] text-lg">
                    স্থানীয় আইনজীবী (Bar Council)
                  </h4>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      name: "অ্যাডভোকেট হাসিবুল ইসলাম",
                      area: "জজ কোর্ট, রাজশাহী",
                      phone: "০১৭১১-২২৩৩৪৫",
                    },
                    {
                      name: "অ্যাডভোকেট শফিকুল সিরাজ",
                      area: "পুঠিয়া জজ কোর্ট",
                      phone: "০১৮২২-৩৩৪৪৫৫",
                    },
                    {
                      name: "অ্যাডভোকেট মমতাজ বেগম",
                      area: "ফ্যামিলি কোর্ট",
                      phone: "০১৯৩৩-৪৪৫৫৬৬",
                    },
                  ].map((lawyer, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-orange-50/30 p-3.5 rounded-2xl border border-orange-100 hover:border-orange-300 transition group"
                    >
                      <div>
                        <strong className="text-sm font-serif text-gray-800">
                          {lawyer.name}
                        </strong>
                        <span className="text-sm block text-gray-500 font-sans mt-0.5">
                          {lawyer.area}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onSimulateCall(
                            lawyer.phone,
                            `আইনজীবী (${lawyer.name})`,
                          )
                        }
                        className="px-3 py-1.5 bg-white rounded-xl shadow-sm border border-orange-100 text-orange-700 hover:bg-orange-500 hover:text-white transition text-sm font-bold whitespace-nowrap cursor-pointer"
                      >
                        📞 কল
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#edeae0] shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 text-xl border border-sky-100">
                    📰
                  </div>
                  <h4 className="font-serif font-black text-[#2d5a27] text-lg">
                    স্থানীয় সাংবাদিক ফোরাম
                  </h4>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      name: "মোঃ জহুরুল হক",
                      media: "দৈনিক ইত্তেফাক ও চ্যানেল আই",
                      phone: "০১৭২২-৩৩৪৪৫৫",
                    },
                    {
                      name: "শরিফুল ইসলাম বাবুল",
                      media: "প্রথম আলো (পুঠিয়া প্রতিনিধি)",
                      phone: "০১৮৩৩-৪৪৫৫৬৬",
                    },
                    {
                      name: "আহমেদ উল্লাহ",
                      media: "রাজশাহী টেলিভিশন (আরটিভি)",
                      phone: "০১৯৪৪-৫৫৬৬৭৭",
                    },
                  ].map((journalist, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-sky-50/30 p-3.5 rounded-2xl border border-sky-100 hover:border-sky-300 transition group"
                    >
                      <div>
                        <strong className="text-sm font-serif text-gray-800">
                          {journalist.name}
                        </strong>
                        <span className="text-sm block text-gray-500 font-sans mt-0.5">
                          {journalist.media}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onSimulateCall(
                            journalist.phone,
                            `সাংবাদিক (${journalist.name})`,
                          )
                        }
                        className="px-3 py-1.5 bg-white rounded-xl shadow-sm border border-sky-100 text-sky-700 hover:bg-sky-500 hover:text-white transition text-sm font-bold whitespace-nowrap cursor-pointer"
                      >
                        📞 কল
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "emergency_numbers":
        return (
          <div className="space-y-6">
            {getHeader(
              "জরুরি যোগাযোগ স্পিড নম্বর (থানা, ফায়ার ও বিদ্যুৎ)",
              "যেকোনো আইনি সমস্যা, অগ্নিকাণ্ড বা বিদ্যুৎ বিভ্রান্তিতে পুঠিয়ার দায়িত্বশীল সরকারি দপ্তরের ২৪ ঘন্টা সচল হটলাইন ",
              "🚨",
            )}

            <div className="bg-white p-5 rounded-2xl border border-[#edeae0]">
              <h4 className="text-sm font-serif font-black text-[#2d5a27] mb-4 pb-1 border-b border-gray-100 flex items-center gap-1">
                🚨 পুঠিয়া উপজেলার দ্রুত সাড়াদানকারী স্পিড ডায়াল কার্ডস
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm font-sans">
                {[
                  {
                    title: "পুঠিয়া থানা পুলিশ",
                    role: "আইনশৃঙ্খলা ও অভিযোগ",
                    phone: "01320-122485",
                    op: "ওসি পুঠিয়া",
                    icon: "🚓",
                  },
                  {
                    title: "পুঠিয়া ফায়ার ও সিভিল ডিফেন্স",
                    role: "অগ্নি ও উদ্ধার উদ্ধারকারী",
                    phone: "01730-002347",
                    op: "স্টেশন ইনচার্জ",
                    icon: "🚒",
                  },
                  {
                    title: "উপজেলা পলী বিদ্যুৎ (Nesco)",
                    role: "বিদ্যুৎ সরবরাহ ও অভিযোগ",
                    phone: "01755-667788",
                    op: "ডিজিএম পুঠিয়া",
                    icon: "⚡",
                  },
                  {
                    title: "পুঠিয়া উপজেলা হাসপাতাল জরুরি বিভাগ",
                    role: "মেডিকেল সেবা ও জরুরি অ্যাম্বুলেন্স",
                    phone: "01711-404561",
                    op: "ডিউটি অফিসার",
                    icon: "🏥",
                  },
                ].map((em, i) => (
                  <div
                    key={i}
                    className="p-4 bg-red-500/[0.02] hover:bg-[#CD5C5C]/5 rounded-2xl border border-neutral-150 flex flex-col justify-between space-y-4 hover:border-[#CD5C5C] transition duration-200"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-[#CD5C5C] text-white px-2 py-0.5 rounded font-black font-sans uppercase">
                          HOTLINE
                        </span>
                        <span className="text-lg">{em.icon}</span>
                      </div>
                      <strong className="font-serif text-[#2d5a27] text-sm block leading-tight mt-1.5 font-bold">
                        {em.title}
                      </strong>
                      <span className="text-sm text-gray-400 block font-normal">
                        {em.role}
                      </span>
                    </div>

                    <button
                      onClick={() => onSimulateCall(em.op, em.title)}
                      className="w-full bg-[#CD5C5C] hover:bg-[#8B4513] text-white py-1.5 rounded-lg text-sm font-bold transition font-sans cursor-pointer flex items-center justify-center gap-1"
                    >
                      📞 কল দিন ({em.phone.split("-")[1]})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "community_clinics":
        return (
          <div className="space-y-6">
            {getHeader(
              "গ্রামীণ কমিউনিটি ক্লিনিক",
              "প্রত্যন্ত গ্রামের সাধারণ মানুষের দোরগোড়ায় প্রাথমিক স্বাস্থ্যসেবা পৌঁছে দিতে পুঠিয়া উপজেলার সকল কমিউনিটি ক্লিনিকের লোকেশন ও பொறுപ്പপ্রাপ্ত সিএইচসিপি-দের হেল্পলাইন",
              "🏥",
            )}

            <div className="bg-white p-5 rounded-2xl border border-[#edeae0] space-y-4 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-150">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-serif font-black text-[#2d5a27] flex items-center gap-1.5">
                      <span className="p-1.5 bg-[#2d5a27]/10 rounded-lg text-base">
                        🏡
                      </span>{" "}
                      ইউনিয়নভিত্তিক ক্লিনিকের তালিকা
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-sans mt-0.5 ml-8">
                    আপনার সবচেয়ে কাছের ক্লিনিকের সাথে যোগাযোগ করুন
                  </p>
                  <div className="text-sm w-fit font-sans font-bold bg-amber-50 text-amber-700 px-3 py-1.5 border border-amber-100 rounded-full flex items-center gap-1.5 ml-8 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>সেবার সময়: সকাল ৯টা - বিকাল ৩টা</span>
                  </div>
                </div>

                <div className="flex flex-col w-full lg:w-1/3">
                  <select
                    value={activeFilter || ""}
                    onChange={(e) => setClinicUnionFilter(e.target.value)}
                    className="bg-neutral-50 px-3 py-2 border rounded-full outline-none text-sm font-sans font-bold cursor-pointer h-10 text-gray-700 w-full hover:border-[#2d5a27]/30 transition"
                  >
                    <option value="puthia_union">পুঠিয়া ইউনিয়ন</option>
                    <option value="baneshwar">বানেশ্বর ইউনিয়ন</option>
                    <option value="shilmaria">শিলমাড়ী ইউনিয়ন</option>
                    <option value="belpukur">বেলপুকুরিয়া ইউনিয়ন</option>
                    <option value="jeupara">জিউপাড়া ইউনিয়ন</option>
                    <option value="bhalukgachhi">ভালুকগাছী ইউনিয়ন</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm transition duration-250 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-md text-sm font-bold bg-emerald-100 text-emerald-800 mb-3 uppercase tracking-wide shadow-sm">
                      {selectedClinic.union}
                    </span>
                    <h3 className="font-serif font-extrabold text-[#2d5a27] text-2xl mb-2">
                      {selectedClinic.name}
                    </h3>
                    <div className="space-y-2 mt-4 bg-white p-4 rounded-xl border border-emerald-50">
                      <p className="text-sm text-gray-700 font-sans flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">📍</span>
                        <span>
                          <strong>ঠিকানা:</strong> {selectedClinic.address}
                        </span>
                      </p>
                      <p className="text-sm text-gray-700 font-sans flex items-center gap-2">
                        <span className="text-gray-400">🧑‍⚕️</span>
                        <span>
                          সিএইচসিপি: <strong>{selectedClinic.chcp}</strong>
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onSimulateCall(selectedClinic.chcp, selectedClinic.name)
                    }
                    className="mt-5 w-full md:w-auto md:px-8 bg-white hover:bg-[#2d5a27] text-[#2d5a27] hover:text-white border-2 border-[#2d5a27] py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    📞 কল করুন ({selectedClinic.phone})
                  </button>
                </div>
              </div>

              <div className="bg-neutral-50 px-5 py-3 rounded-xl border border-gray-150 text-sm text-gray-500 font-sans mt-2">
                <span className="font-bold text-gray-700">
                  উপলব্ধ সেবা:
                </span>{" "}
                মা ও শিশু স্বাস্থ্যসেবা, প্রজনন স্বাস্থ্য, পরিবার পরিকল্পনা,
                সাধারণ জখম ও জ্বর-সর্দির চিকিৎসা এবং বিনামূল্যে সরকারি ওষুধ
                বিতরণ.
              </div>
            </div>
          </div>
        );

      case "blood_bank":
        return (
          <div className="space-y-6">
            {getHeader(
              "আঞ্চলিক রক্তদাতা ও ভলান্টিয়ার",
              "পুটিয়ার স্বেচ্ছাসেবক ও রক্তদাতাদের তালিকা, রক্তের গ্রুপ ও ইউনিয়ন ের ভিত্তিতে লাইভ ফিল্টার করার পোর্টাল",
              "🩸",
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left side donor lists & search filter */}
              <div className="md:col-span-8 bg-white p-5 rounded-2xl border border-[#edeae0] shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-gray-150">
                  <div className="space-y-0.5">
                    <span className="text-base font-serif font-black text-[#2d5a27] flex items-center gap-1">
                      🩸 স্বেচ্ছাসেবী রক্তদাতা তালিকা ({filteredDonors.length}{" "}
                      জন কুয়েরি মিলছে)
                    </span>
                    <p className="text-sm text-gray-400 font-sans">
                      পুঠিয়া এলাকার স্থানীয় বন্ধুদের মহৎ জীবনরক্ষাকারী টিম
                    </p>
                  </div>

                  {/* Blood Group Filter options tab */}
                  <div className="flex flex-wrap gap-1 bg-neutral-50 p-1 rounded-xl border border-neutral-150">
                    {["All", "A+", "B+", "O+", "AB+", "O-", "B-"].map((g) => {
                      const count = getGroupCount(g);
                      return (
                        <button
                          key={g}
                          onClick={() => setBloodFilter(g)}
                          className={`px-3 py-1 rounded-lg text-sm font-bold font-sans transition flex items-center gap-1 ${
                            bloodFilter === g
                              ? "bg-[#CD5C5C] text-white shadow-xs"
                              : "hover:bg-neutral-200 text-neutral-800 bg-white"
                          }`}
                        >
                          <span>{g}</span>
                          <span
                            className={`text-xs px-1 rounded-full ${bloodFilter === g ? "bg-white/20 text-white" : "bg-neutral-100 text-gray-500"}`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Combined Search filter input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="রক্তদাতার নাম, থাকার ইউনিয়ন (যেমন: বানেশ্বর, পৌরসভা, শিলমাড়ী) টাইপ করুন..."
                    value={bloodSearchQuery || ""}
                    onChange={(e) => setBloodSearchQuery(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white pl-9 pr-14 py-2 border border-neutral-200 focus:border-[#CD5C5C] rounded-2xl text-sm outline-none transition duration-200 font-sans text-neutral-800"
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {bloodSearchQuery && (
                    <button
                      onClick={() => setBloodSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-sm"
                    >
                      ✖
                    </button>
                  )}
                </div>

                {/* Donor Grid list */}
                {filteredDonors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {filteredDonors.map((donor) => (
                      <div
                        key={donor.id}
                        className="p-4 bg-gradient-to-br from-[#fdfcf7] to-white rounded-2xl border border-neutral-200/80 relative flex flex-col justify-between space-y-3 group hover:border-[#CD5C5C] hover:shadow-xs transition duration-200"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <strong className="font-serif text-[#2d5a27] text-sm block font-bold">
                                {donor.name}
                              </strong>
                            </div>
                            <span className="text-sm font-black font-sans bg-rose-50 text-rose-700 px-3 py-0.5 rounded-full border border-rose-100 flex items-center gap-1 shadow-xs">
                              🩸 {donor.group}
                            </span>
                          </div>
                          <div className="space-y-0.5 text-sm text-gray-500 font-sans">
                            <span className="block font-medium text-neutral-700">
                              📍 ইউনিয়ন বাসিন্দা:{" "}
                              <span className="text-[#2d5a27] font-semibold">
                                {donor.union}
                              </span>
                            </span>
                            <span className="block italic text-gray-400">
                              সর্বশেষ দান:{" "}
                              {donor.lastDonated || "পর্যাপ্ত তথ্য নেই"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            onSimulateCall(
                              donor.name,
                              `রক্তদাতা (${donor.group})`,
                            )
                          }
                          className="w-full bg-rose-50 hover:bg-[#CD5C5C] text-[#CD5C5C] hover:text-white py-1.5 text-sm font-bold rounded-xl transition duration-250 font-sans cursor-pointer flex items-center justify-center gap-1 border border-rose-100"
                        >
                          📞 কল ও সংযোগ দিন ({donor.phone.split("-")[1]})
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                    <span className="text-4xl block mb-2">🩸</span>
                    <strong className="text-sm font-serif text-neutral-600 block">
                      কোনো রক্তদাতাকে পাওয়া যায়নি
                    </strong>
                    <p className="text-sm text-gray-400 font-sans mt-0.5">
                      রক্তের গ্রুপ অথবা নাম/ইউনিয়নের বানান পরিবর্তন করে পুনরায়
                      অনুসন্ধান করার চেষ্টা করুন।
                    </p>
                  </div>
                )}
              </div>

              {/* Right side form to join donor list */}
              <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-[#edeae0] shadow-xs space-y-4">
                <span className="text-sm font-bold bg-[#CD5C5C]/15 text-[#CD5C5C] px-2.5 py-0.5 rounded-full font-serif font-black uppercase">
                  স্বেচ্ছায় রক্তদাতা হিসেবে যোগ দিন
                </span>

                <div className="space-y-3.5 text-sm font-sans">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-500 font-bold block">
                      আপনার নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newDonorName || ""}
                      onChange={(e) => setNewDonorName(e.target.value)}
                      placeholder="রক্তদাতার সম্পূর্ণ নাম..."
                      className="w-full bg-neutral-50 px-3 py-1.5 border rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-500 font-bold block">
                      সচল মোবাইল ও হোয়াটসঅ্যাপ{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newDonorPhone || ""}
                      onChange={(e) => setNewDonorPhone(e.target.value)}
                      placeholder="হটলাইন নম্বর..."
                      className="w-full bg-neutral-50 px-3 py-1.5 border rounded-lg text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-500 font-bold block">
                        রক্তের গ্রুপ <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newDonorGroup || ""}
                        onChange={(e) => setNewDonorGroup(e.target.value)}
                        className="w-full bg-neutral-50 p-1.5 border rounded-lg text-sm"
                      >
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O-</option>
                        <option value="A-">A-</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-500 font-bold block">
                        থাকার ইউনিয়ন <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newDonorUnion || ""}
                        onChange={(e) => setNewDonorUnion(e.target.value)}
                        className="w-full bg-neutral-50 p-1.5 border rounded-lg text-sm"
                      >
                        <option value="বানেশ্বর">বানেশ্বর ইউনিয়ন</option>
                        <option value="শিলমাড়ী">শিলমাড়ী ইউনিয়ন</option>
                        <option value="বেলপুকুরিয়া">বেলপুকুরিয়া ইউনিয়ন</option>
                        <option value="পুঠিয়া পৌরসভা">পুঠিয়া পৌরসভা</option>
                        <option value="ভালুকগাছী">ভালুকগাছী ইউনিয়ন</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newDonorName || !newDonorPhone) {
                        alert(
                          "অনুগ্রহ করে আপনার নাম এবং মোবাইল নম্বরটি সঠিকভাবে দিন!",
                        );
                        return;
                      }
                      const newId = Date.now().toString();
                      const nextDonors = [
                        {
                          id: newId,
                          name: newDonorName,
                          group: newDonorGroup,
                          phone: newDonorPhone,
                          union: newDonorUnion,
                          lastDonated: "আজই রেজিস্টার সম্পন্ন",
                        },
                        ...bloodDonors,
                      ];
                      setBloodDonors(nextDonors);
                      try {
                        localStorage.setItem(
                          "puthia_blood_donors",
                          JSON.stringify(nextDonors),
                        );
                      } catch {}
                      setNewDonorName("");
                      setNewDonorPhone("");
                      setDonorSuccess(true);
                      setTimeout(() => setDonorSuccess(false), 5000);
                    }}
                    className="w-full bg-[#CD5C5C] hover:bg-[#8B4513] text-white py-2 rounded-xl text-sm font-semibold font-serif transition cursor-pointer"
                  >
                    ✓ নিজেকে রক্তদাতা হিসেবে যুক্ত করুন
                  </button>

                  {donorSuccess && (
                    <div className="p-3 bg-red-50 border border-red-200 text-[#CD5C5C] rounded-xl text-sm font-bold text-center">
                      সহযোগিতা করার জন্য ধন্যবাদ! আপনার রক্তদাতা ডাটাবেস সফলভাবে
                      পুঠিয়া পোর্টালে যুক্ত হয়েছে।
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "event_calendar":
        return (
          <div className="space-y-6">
            {getHeader(
              "আসন্ন ইভেন্ট ক্যালেন্ডার",
              "উপজেলায় আসন্ন বিভিন্ন মেলা, ওয়াজ মাহফিল, পূজা, ফুটবল টুর্নামেন্ট ও সাংস্কৃতিক অনুষ্ঠানের আগাম তথ্য",
              "📅",
            )}

            <div className="space-y-4">
              {[
                {
                  date: "২৫",
                  month: "জুন",
                  year: "২০২৬",
                  title: "উপজেলা গোল্ডকাপ ফুটবল টুর্নামেন্ট ফাইনাল",
                  time: "বিকাল ৩:৩০",
                  venue: "পুঠিয়া পি.এন উচ্চ বিদ্যালয় মাঠ",
                  tag: "ফুটবল টুর্নামেন্ট",
                  color: "text-green-700 bg-green-50 border-green-200",
                },
                {
                  date: "১২",
                  month: "জুলাই",
                  year: "২০২৬",
                  title: "বানেশ্বর কেন্দ্রীয় রথযাত্রা মেলা",
                  time: "সকাল ১০:০০ - সন্ধ্যা ৭:০০",
                  venue: "বানেশ্বর শিব মন্দির প্রাঙ্গণ",
                  tag: "ঐতিহ্যবাহী মেলা",
                  color: "text-orange-700 bg-orange-50 border-orange-200",
                },
                {
                  date: "০৫",
                  month: "আগস্ট",
                  year: "২০২৬",
                  title: "মাদ্রাসার বাৎসরিক ওয়াজ ও দোয়া মাহফিল",
                  time: "বাদ আসর হতে রাত ১১:০০",
                  venue: "জিউপাড়া কেন্দ্রীয় ঈদগাহ ময়দান",
                  tag: "ওয়াজ মাহফিল",
                  color: "text-indigo-700 bg-indigo-50 border-indigo-200",
                },
              ].map((evt, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row gap-4 sm:items-center bg-white p-4 rounded-2xl border border-[#edeae0] shadow-sm hover:border-gray-300 transition"
                >
                  <div
                    className={`p-4 rounded-2xl border text-center min-w-[90px] ${evt.color}`}
                  >
                    <span className="block text-2xl font-serif font-black">
                      {evt.date}
                    </span>
                    <span className="block text-sm font-sans font-bold uppercase">
                      {evt.month} {evt.year}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-black text-[#2d5a27] text-lg">
                        {evt.title}
                      </h4>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${evt.color}`}
                      >
                        {evt.tag}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 font-sans flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span>
                        ⏰ <strong className="text-gray-800">সময়:</strong>{" "}
                        {evt.time}
                      </span>
                      <span>
                        📍 <strong className="text-gray-800">স্থান:</strong>{" "}
                        {evt.venue}
                      </span>
                    </div>
                  </div>
                  <div className="sm:text-right hidden md:block">
                    <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-bold font-sans rounded-xl transition cursor-pointer">
                      🔔 রিমাইন্ডার অ্যাড করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "cmpl_report":
      case "cmpl_status":
      case "complaint_box":
        return <ComplaintBox {...{
          complaintTab, setComplaintTab, allComplaintsList, setAllComplaintsList,
          cpName, setCpName, cpPhone, setCpPhone, cpTitle, setCpTitle,
          cpDesc, setCpDesc, cpCategory, setCpCategory, cpUnion, setCpUnion,
          cpEvidenceList, setCpEvidenceList, cpEmail, setCpEmail,
          isSubmittingComplaint, setIsSubmittingComplaint,
          complaintSuccessId, setComplaintSuccessId,
          complaintSubmitted, setComplaintSubmitted,
          cpTrackingId, setCpTrackingId, cpTrackingPhone, setCpTrackingPhone,
          isLoadingComplaints, setIsLoadingComplaints,
          feedbackName, setFeedbackName, feedbackPhone, setFeedbackPhone,
          feedbackRating, setFeedbackRating, feedbackMsg, setFeedbackMsg,
          feedbackSuccess, setFeedbackSuccess, isSubmittingFeedback,
          setIsSubmittingFeedback, onGoBack, onSimulateCall
        }} />;

      case "weather_update":
      case "agri_weather":
        return <WeatherUpdateInfo onGoBack={onGoBack} />;

      case "agri_advice":
        return <AgriAdviceInfo onGoBack={onGoBack} />;

      case "agri_officers":
      case "agri_office":
        return <OfficerDirectoryInfo onGoBack={onGoBack} />;

      case "market_price":
      case "agri_prices":
        return <MarketPriceInfo onGoBack={onGoBack} />;

      case "agri_fish_farm":
        return <LivestockFisheries onGoBack={onGoBack} />;

      case "agri_video_training":
        return <AgriTrainingInfo onGoBack={onGoBack} />;

      case "local_nursery":
        return <LocalNurseryInfo onGoBack={onGoBack} />;

      case "agri_loans":
      case "agri_diseases":
      case "agri_machinery":
      case "agri_dealers":
      case "agri_calendar":
        return <AgriServiceInfo onGoBack={onGoBack} category={activeSubViewId} />;

      case "transport_info":
        {
          const busSchedule = [
            {
              company: "দেশ ট্রাভেলস",
              route: "ঢাকা - পুঠিয়া - রাজশাহী",
              times: "সকাল ০৭:১৫, রাত ১০:৩০",
              fare: "৮০০-১২০০ টাকা",
              type: "আন্তঃজেলা বিলাসবহুল",
            },
            {
              company: "ন্যাশনাল ট্রাভেলস",
              route: "রাজশাহী - পুঠিয়া - ঢাকা",
              times: "সকাল ০৮:০০, রাত ১১:৪৫",
              fare: "৮০০ টাকা",
              type: "আন্তঃজেলা",
            },
            {
              company: "গেট লক বাস সার্ভিস",
              route: "রাজশাহী ⇄ পুঠিয়া ⇄ নাটোর",
              times: "প্রতি ১৫ মিনিট পর পর (সকাল ৬:০০ হতে সন্ধ্যা ৭:৩০ অব্দি)",
              fare: "৩০-৫০ টাকা",
              type: "লোকাল গেট লক",
            },
          ];

          const trainSchedule = [
            {
              name: "পদ্মা এক্সপ্রেস (৭৫৯)",
              fromTo: "রাজশাহী ⇄ ঢাকা ( ঈশ্বরদী স্টেশন হয়ে )",
              baneshwarTime: "রাজশাহী ছাড়ে: বিকাল ০৪:০০",
              offDay: "মঙ্গলবার",
              fare: "শোভন ৩৫০ টাকা, স্নিগ্ধা ৬৬৫ টাকা",
            },
            {
              name: "বনলতা এক্সপ্রেস (৭৯১)",
              fromTo: "চাঁপাইনবাবগঞ্জ ⇄ ঢাকা (রাজশাহী বিরতি)",
              baneshwarTime: "রাজশাহী ছাড়ে: সকাল ০৬:০০",
              offDay: "শুক্রবার",
              fare: "শোভন ৪২৫ টাকা, এসি বার্থ ৯৫০ টাকা",
            },
          ];

          const localFareChart = [
            {
              vehicle: "সিএনজি (শেয়ার)",
              route: "পুঠিয়া সদর ⇄ বানেশ্বর মোড়",
              expectedFare: "২০ টাকা (প্রতি আসন)",
              timing: "২৪ ঘন্টা সক্রিয়",
            },
            {
              vehicle: "সিএনজি (শেয়ার)",
              route: "পুঠিয়া সদর ⇄ রাজশাহী ভদ্রা মোড়",
              expectedFare: "৬০ টাকা (প্রতি আসন)",
              timing: "সকাল ০৬:০০ - রাত ১০:০০",
            },
            {
              vehicle: "চার্জার ভ্যান / টমটম",
              route: "পুঠিয়া রাজবাড়ী ⇄ বেলপুকুর রেলগেট",
              expectedFare: "২৫ টাকা (প্রতি আসন)",
              timing: "সকাল ০৭:০০ - রাত ০৯:০০",
            },
          ];

          const getFareCalcResult = () => {
            const from = fareCalcFrom;
            const to = fareCalcTo;
            const vehicle = fareCalcVehicle;

            if (from === to) {
              return {
                distance: "০ কিমি",
                fare: "০ টাকা",
                explanation: "উৎস ও গন্তব্য একই স্থান!",
              };
            }

            const isBetweenPuthiaBaneshwar =
              (from.includes("পুঠিয়া") && to.includes("বানেশ্বর")) ||
              (from.includes("বানেশ্বর") && to.includes("পুঠিয়া"));

            const isBetweenPuthiaRajshahi =
              (from.includes("পুঠিয়া") && to.includes("রাজশাহী")) ||
              (from.includes("রাজশাহী") && to.includes("পুঠিয়া"));

            const isBetweenBaneshwarRajshahi =
              (from.includes("বানেশ্বর") && to.includes("রাজশাহী")) ||
              (from.includes("রাজশাহী") && to.includes("বানেশ্বর"));

            if (isBetweenPuthiaBaneshwar) {
              if (vehicle === "সিএনজি")
                return {
                  distance: "৮.২ কিমি",
                  fare: "২০ টাকা (শেয়ার)",
                  explanation:
                    "মহাসড়কের প্রধান সিএনজি শেয়ার আসনে ২০ টাকা ভাড়া। রিজার্ভ সিএনজি ভাড়া ১৫০ টাকা।",
                };
              if (vehicle === "অটোভ্যান")
                return {
                  distance: "৮.২ কিমি",
                  fare: "৩০ টাকা",
                  explanation:
                    "লোকাল চার্জার ভ্যানে শীতল ও আরামদায়ক গ্রাম্য যাতায়াতে শেয়ার ভাড়া ৩০ টাকা।",
                };
              return {
                distance: "৮.২ কিমি",
                fare: "৩০ টাকা",
                explanation:
                  "লোকাল বাস সার্ভিসের গেট মিনিমাম ভাড়া ৩০ টাকা নির্ধারিত।",
              };
            }

            if (isBetweenPuthiaRajshahi) {
              if (vehicle === "সিএনজি")
                return {
                  distance: "৩১ কিমি",
                  fare: "১০০ টাকা (শেয়ার)",
                  explanation:
                    "পুঠিয়া বাসস্ট্যান্ড হতে রাজশাহী ভদ্রা শেয়ার সিট ১০০ টাকা। রিজার্ভ ৫৫০-৬০০ টাকা।",
                };
              if (vehicle === "অটোভ্যান")
                return {
                  distance: "৩১ কিমি",
                  fare: "২৫০ টাকা",
                  explanation:
                    "দূরত্ব দীর্ঘ বিধায় চার্জার ভ্যান রিকমেন্ডেড নয়, সিএনজি বা বাস বেছে নিন।",
                };
              return {
                distance: "৩১ কিমি",
                fare: "৮০ টাকা",
                explanation:
                  "আন্তঃবিভাগীয় ও গেটলক লোকাল বাসের বিআরটিসি সরকারি টিকেট ভাড়া ৮০ টাকা।",
              };
            }

            if (isBetweenBaneshwarRajshahi) {
              if (vehicle === "সিএনজি")
                return {
                  distance: "২২.৮ কিমি",
                  fare: "৬০ টাকা (শেয়ার)",
                  explanation:
                    "বানেশ্বর ট্রাফালগার চত্বর হতে রাজশাহী শেয়ার সিট ৬০ টাকা। সময় ৩০ মিনিট।",
                };
              if (vehicle === "অটোভ্যান")
                return {
                  distance: "২২.৮ কিমি",
                  fare: "১২০ টাকা",
                  explanation: "ভেঙে ভেঙে ভ্যানে যাতায়াত করতে হবে।",
                };
              return {
                distance: "২২.৮ কিমি",
                fare: "৫০ টাকা",
                explanation:
                  "গেটলক কিংবাস ও অন্যান্য লোকাল সার্ভিসে নিয়মিত মিনিমাম বাস ভাড়া ৫০ টাকা।",
              };
            }

            return {
              distance: "প্রায় ১২ কিমি",
              fare: "৪০-৬০ টাকা",
              explanation:
                "আশেপাশের যাতায়াতের জন্য আনুমানিক ভাড়া। মহাসড়কে চালকের সাথে কথা বলুন।",
            };
          };

          const calcRes = getFareCalcResult();

          content = (
            <div className="space-y-6">
              {getHeader(
                "🚌 পরিবহন তথ্য ও ডিরেক্টরি",
                "রাজশাহী-ঢাকা দূরপাল্লার সার্ভিস সময়সূচী এবং উপজেলার অভ্যন্তরে লোকাল যাতায়াত ও ভাড়ার তালিকা",
                "🚌",
              )}

              {/* Price dynamic calculator */}
              <div className="bg-[#2d5a27]/5 border border-[#2d5a27]/15 p-5 rounded-3xl space-y-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-[#2d5a27] font-sans uppercase">
                    ইন্টারেক্টিভ ভাড়া ক্যালকুলেটর
                  </span>
                  <h3 className="font-serif font-black text-[#2d5a27] text-sm sm:text-base">
                    যাতায়াত দূরত্ব ও সরকারি ভাড়া নির্ণায়ক
                  </h3>
                  <p className="text-xs text-gray-500 font-sans">
                    স্থান এবং যান নির্বাচন করে মুহূর্তেই দূরত্ব ও শেয়ার ভাড়া
                    জেনে নিন
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 block">
                      যাত্রার স্থান (উৎস):
                    </label>
                    <select
                      value={fareCalcFrom || ""}
                      onChange={(e) => setFareCalcFrom(e.target.value)}
                      className="w-full bg-white border border-neutral-200 outline-none p-2.5 rounded-xl text-gray-700"
                    >
                      <option value="পুঠিয়া সদর">
                        পুঠিয়া সদর (জিরো ইস্টার)
                      </option>
                      <option value="বানেশ্বর মোড়">
                        বানেশ্বর মোড় (হাট সংলগ্ন)
                      </option>
                      <option value="রাজশাহী ভদ্রা">রাজশাহী ভদ্রা মোড়</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 block">
                      গন্তব্য স্থান:
                    </label>
                    <select
                      value={fareCalcTo || ""}
                      onChange={(e) => setFareCalcTo(e.target.value)}
                      className="w-full bg-white border border-neutral-200 outline-none p-2.5 rounded-xl text-gray-700"
                    >
                      <option value="বানেশ্বর মোড়">
                        বানেশ্বর মোড় (হাট সংলগ্ন)
                      </option>
                      <option value="পুঠিয়া সদর">
                        পুঠিয়া সদর (জিরো ইস্টার)
                      </option>
                      <option value="রাজশাহী ভদ্রা">রাজশাহী ভদ্রা মোড়</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 block">
                      যানবাহনের ধরণ:
                    </label>
                    <select
                      value={fareCalcVehicle || ""}
                      onChange={(e) => setFareCalcVehicle(e.target.value)}
                      className="w-full bg-white border border-neutral-200 outline-none p-2.5 rounded-xl text-gray-700"
                    >
                      <option value="সিএনজি">সিএনজি অটোরিকশা</option>
                      <option value="অটোভ্যান">লোকাল চার্জার ভ্যান</option>
                      <option value="বাস">গেটলক মিনিবাস</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#2d5a27]/10 flex flex-col sm:flex-row gap-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100">
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">
                      আনুমানিক দূরত্ব
                    </span>
                    <span className="text-base font-black text-[#2d5a27] font-sans block">
                      {calcRes.distance}
                    </span>
                  </div>
                  <div className="flex-1 sm:pl-4 space-y-1">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">
                      নির্ধারিত ভাড়া (শেয়ার)
                    </span>
                    <span className="text-base font-black text-rose-600 font-sans block">
                      {calcRes.fare}
                    </span>
                  </div>
                  <div className="flex-[2] sm:pl-4 space-y-1 text-xs text-gray-500 font-sans">
                    <span className="text-[9px] font-bold text-neutral-400 block uppercase">
                      যাত্রী গাইডবুক
                    </span>
                    <p className="leading-tight">{calcRes.explanation}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="space-y-4">
                <div className="flex border-b border-gray-100 gap-1">
                  {[
                    { id: "bus", label: "🚌 বাস শিডিউল", icon: "🚌" },
                    { id: "train", label: "🚆 রেল কানেকশন", icon: "🚆" },
                    { id: "local", label: "🛺 লোকাল চার্ট", icon: "🛺" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTransportActiveTab(tab.id)}
                      className={`px-4 py-2 font-serif font-black text-xs sm:text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                        transportActiveTab === tab.id
                          ? "border-[#2d5a27] text-[#2d5a27] bg-[#2d5a27]/5"
                          : "border-transparent text-gray-500 hover:text-[#2d5a27]"
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {transportActiveTab === "bus" && (
                  <div className="space-y-3 font-sans text-xs">
                    {busSchedule.map((bus, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-4 rounded-2xl border border-neutral-150 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-neutral-800">
                              {bus.company}
                            </span>
                            <span className="text-[9px] bg-neutral-50 text-[#2d5a27] border px-2 py-0.5 rounded-full">
                              {bus.type}
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-neutral-50 flex items-center justify-between">
                          <div>
                            <span className="text-[8px] text-gray-450 block uppercase">
                              ভেন্ডর ভাড়া
                            </span>
                            <span className="font-bold text-rose-600 font-sans">
                              {bus.fare}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              window.open(
                                "https://eticket.railway.gov.bd",
                                "_blank",
                              )
                            }
                            className="px-3 py-1 bg-[#2d5a27] text-white font-bold text-[9px] rounded-lg"
                          >
                            ই-টিকেট
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {transportActiveTab === "local" && (
                  <div className="bg-white rounded-2xl border border-neutral-150 overflow-hidden font-sans text-xs">
                    <div className="divide-y divide-neutral-100">
                      {localFareChart.map((fare, idx) => (
                        <div
                          key={idx}
                          className="p-3 hover:bg-neutral-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-bold">
                                {fare.vehicle}
                              </span>
                              <span className="text-gray-400 text-[10px]">
                                ⏰ {fare.timing}
                              </span>
                            </div>
                            <span className="font-bold text-neutral-800 block">
                              📍 {fare.route}
                            </span>
                          </div>
                          <div className="sm:text-right shrink-0">
                            <span className="text-[8px] text-gray-400 block font-bold">
                              অনুমোদিত ভাড়া
                            </span>
                            <span className="font-bold text-rose-600 font-sans">
                              {fare.expectedFare}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }
        break;

        /* upazila_map */
        {
          return (
            <div className="space-y-4 font-sans p-4">
              {/* Hero Section */}
              <div className="w-full h-64 rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-950 flex flex-col justify-end p-8 shadow-md">
                <p className="text-emerald-200 text-sm font-medium mb-2">
                  হোম &gt; উপজেলা পরিচিতি
                </p>
                <h1 className="text-4xl font-black text-amber-300 drop-shadow-sm">
                  পুঠিয়া উপজেলার মানচিত্র
                </h1>
              </div>

              {/* Map Viewer */}
              <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-full h-80 bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-inner">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116668.6117621111!2d88.75549019864273!3d24.375253164998877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fbf25a66a1e3dd%3A0x6b74e64573177f0d!2sPuthia!5e0!3m2!1sen!2sbd!4v1718899888888!5m2!1sen!2sbd"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </div>

              {/* Quick Nav */}
              <div className="grid grid-cols-1 gap-3 px-4">
                <a
                  href="https://maps.app.goo.gl/puthia-rajbari"
                  target="_blank"
                  className="bg-emerald-800 text-white p-4 rounded-2xl flex items-center justify-center gap-3"
                >
                  🏛️ ঐতিহাসিক রাজবাড়ী ও মন্দির
                </a>
                <a
                  href="https://maps.app.goo.gl/puthia-hospital"
                  target="_blank"
                  className="bg-emerald-800 text-white p-4 rounded-2xl flex items-center justify-center gap-3"
                >
                  🏥 উপজেলা স্বাস্থ্য কমপ্লেক্স
                </a>
                <a
                  href="https://maps.app.goo.gl/baneswar-busstand"
                  target="_blank"
                  className="bg-emerald-800 text-white p-4 rounded-2xl flex items-center justify-center gap-3"
                >
                  🚌 বানেশ্বর বাস স্ট্যান্ড
                </a>
              </div>
            </div>
          );
        }
        break;

      case "successful_people":
        {
          const peopleList = [
            {
              name: "মহারাণী শরৎসুন্দরী দেবী",
              title: "মহীয়সী জনহিতৈষী ও পুঠিয়া রাজপরিবারের রাজমাতা",
              period: "১৮৪৯ - ১৮৮৮ খ্রিষ্টাব্দ",
              sector: "সমাজসেবা ও মানবকল্যাণ",
              contribution:
                "পুঠিয়া রাজপরিবারের বিখ্যাত শাসক যিনি দীন-দরিদ্রের কল্যাণে জীবন উৎসর্গ করেছিলেন। তিনি অসংখ্য চিকিৎসালয়, স্কুল, এবং বিশুদ্ধ পানীয় জলের পুকুর খনন করার জন্য অবিস্মরণীয় অবদান রেখে যান। ব্রিটিশ সরকার তাকে 'মহারাণী' উপাধিতে ভূষিত করে।",
              legacy:
                "পুঠিয়ার বিখ্যাত পাঁচআনি রাজপ্রাসাদ এবং সংলগ্ন অনন্য শৈলীর শিব মন্দির উনার আন্তরিক সংস্কারে আজকের রুপ পেয়েছে।",
            },
            {
              name: "লতিফুর রহমান (এমপি)",
              title: "আইনবিদ ও সমাজসেবক",
              period: "১৯ শতক - স্বাধীনোত্তর কাল",
              sector: "শিক্ষা ও রাজনীতি",
              contribution:
                "পুঠিয়া ও দুর্গাপুর এলাকার পিছিয়ে পড়া জনগোষ্ঠীর মানোন্নয়ন ও শিক্ষাদীক্ষার প্রসারে অনন্য ভূমিকা পালন করেন। উপজেলার বিভিন্ন লাইব্রেরি ও দাতব্য চিকিৎসালয় প্রতিষ্ঠায় উনার অনন্য প্রেরণা ও পৃষ্ঠপোষকতা রয়েছে।",
              legacy:
                "পুঠিয়ায় বহুসংখ্যক শিক্ষা প্রতিষ্ঠানের ভিত্তিপ্রস্তর প্রতিষ্ঠায় নিবেদিত।",
            },
            {
              name: "মোহাম্মদ কায়কোবাদ",
              title: "বীর মুক্তিযোদ্ধা ও সংগঠক",
              period: "১৯৭১ মহান মুক্তিযুদ্ধ",
              sector: "মুক্তিযুদ্ধ ও স্বাধীনতা",
              contribution:
                "১৯৭১ সালের স্বাধীনতা যুদ্ধে পুঠিয়া এলাকার স্থানীয় যুবকদের সংগঠিত করে শত্রুসেনাদের বিরুদ্ধে সম্মুখ সমরে সাহসী নেতৃত্ব প্রদান। পুঠিয়ার মাটিতে স্বাধীনতার লাল সূর্য উদিত করার নেপথ্যের অনন্য বীর সন্তান।",
              legacy:
                "পুঠিয়ার বীর মুক্তিযোদ্ধা স্মৃতি সংসদ ও বিভিন্ন ঐতিহাসিক স্মৃতিশোধ প্রকল্পের অন্যতম উপদেষ্টা।",
            },
          ];

          const filteredPeople = peopleList.filter((person) => {
            const matchesSector =
              peopleSector === "all" || person.sector.includes(peopleSector);
            const matchesSearch =
              person.name
                .toLowerCase()
                .includes(peopleSearchText.toLowerCase()) ||
              person.contribution
                .toLowerCase()
                .includes(peopleSearchText.toLowerCase());
            return matchesSector && matchesSearch;
          });

          content = (
            <div className="space-y-6">
              {getHeader(
                "🏅 গুণীজন ও সফল ব্যক্তিত্ব ডিরেক্টরি",
                "পুঠিয়া উপজেলার গৌরবময় ইতিহাস রচনায় এবং সমাজ সংস্কার, শিক্ষা, সংস্কৃতি ও স্বাধীনতায় অবদানকারী সূর্য সন্তানদের সংক্ষিপ্ত জীবনী",
                "🏅",
              )}

              {/* Search and Categories Filter */}
              <div className="bg-white p-5 rounded-3xl border border-[#edeae0] flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    অনুসন্ধান ফিল্টার
                  </span>
                  <input
                    type="text"
                    placeholder="নাম বা অনন্য অবদান লিখে খুঁজুন..."
                    value={peopleSearchText || ""}
                    onChange={(e) => setPeopleSearchText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 outline-none rounded-xl text-xs text-gray-750"
                  />
                </div>

                <div className="flex flex-wrap gap-1 text-xs shrink-0 font-bold self-end md:self-center">
                  {[
                    { id: "all", label: "সকল কৃতি ব্যক্তিত্ব" },
                    { id: "কল্যাণ", label: "💖 সমাজসেবা" },
                    { id: "শিক্ষা", label: "📚 শিক্ষা ও সাহিত্য" },
                    { id: "মুক্তিযুদ্ধ", label: "⚔️ বীর মুক্তিযোদ্ধা" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => setPeopleSector(sec.id)}
                      className={`px-3.5 py-2.5 rounded-xl border font-sans cursor-pointer transition-colors ${
                        peopleSector === sec.id
                          ? "bg-[#2d5a27] text-white border-transparent"
                          : "bg-neutral-50 text-gray-500 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
                {filteredPeople.length > 0 ? (
                  filteredPeople.map((person, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-3xl border border-[#edeae0] space-y-4 flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] bg-emerald-50 text-[#2d5a27] border border-emerald-100 px-2 py-0.5 rounded-md font-bold block w-fit mb-1">
                              {person.sector}
                            </span>
                            <h3 className="font-serif font-black text-neutral-850 text-base">
                              {person.name}
                            </h3>
                            <p className="text-[10px] text-[#2d5a27] font-bold mt-0.5">
                              {person.title}
                            </p>
                          </div>
                          <span className="text-[9px] text-gray-400 font-mono bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-100 shrink-0">
                            ⌛ {person.period}
                          </span>
                        </div>

                        <p className="text-gray-500 leading-relaxed pt-2 border-t border-neutral-50">
                          {person.contribution}
                        </p>
                      </div>

                      <div className="bg-[#2d5a27]/5 p-3 rounded-2xl border border-[#2d5a27]/10">
                        <span className="text-[9px] font-black text-[#2d5a27] uppercase block mb-0.5">
                          স্মৃতি ও ঐতিহ্য
                        </span>
                        <p className="text-[#2d5a27] leading-tight text-[10px] font-medium">
                          {person.legacy}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center p-12 bg-neutral-50 border rounded-3xl border-dashed">
                    <span className="text-3xl">🏜️</span>
                    <p className="text-gray-400 mt-2 font-serif">
                      আপনার খোঁজা কৃতি ব্যক্তিত্বের খোঁজ পাওয়া যায়নি। স্পেলিং
                      পরীক্ষা করুন!
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-[#2d5a27]/5 border border-dashed border-[#2d5a27]/20 p-5 rounded-3xl text-center space-y-2">
                <h4 className="font-serif font-bold text-neutral-800 text-sm">
                  নতুন গুণীজন মনোনয়ন প্রস্তাব করুন
                </h4>
                <p className="text-xs text-gray-400 max-w-lg mx-auto font-sans leading-relaxed">
                  আপনার জানা মতে পুঠিয়া উপজেলার এমন কোন গুণী ব্যক্তিত্ব আছেন কি
                  যিনি সমাজে বিশেষ অবদান রেখেছেন? নিচের ফর্ম ক্লিক করে বিস্তারিত
                  পাঠান, পর্যালোচনার পর তা যুক্ত করা হবে।
                </p>
                <button
                  onClick={() =>
                    alert(
                      "মনোনয়ন আবেদন ফর্মটি শীঘ্রই ওপেন হবে। তথ্য প্রস্তুত রাখুন।",
                    )
                  }
                  className="px-4 py-2 bg-[#2d5a27] text-white font-bold text-[10px] rounded-xl hover:bg-[#1e3d1a] transition cursor-pointer"
                >
                  📝 নতুন গুণীজন প্রস্তাব পাঠান
                </button>
              </div>
            </div>
          );
        }
        break;

      case "contact_info":
      case "contact_feedback":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#2d5a27] to-[#1a3816] p-6 sm:p-8 text-white relative rounded-3xl overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="bg-[#CD5C5C] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    উপজেলা நிர்வாக
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-extrabold mt-2">
                    যোগাযোগ ও ফিডব্যাক
                  </h2>
                  <p className="text-gray-200/90 text-sm sm:text-base font-medium mt-1">
                    প্রশাসনের সাথে যোগাযোগ করুন এবং আপনার মূল্যবান মতামত দিন।
                  </p>
                </div>
                <button
                  onClick={onGoBack}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all border border-white/10 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> ফিরে যান
                </button>
              </div>
            </div>

            {/* Subview Tabs Selector */}
            <div className="bg-neutral-50 px-4 sm:px-6 py-3 border border-neutral-200 rounded-2xl flex flex-wrap gap-2">
              <button
                onClick={() => setContactTab("info")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  contactTab === "info"
                    ? "bg-[#2d5a27] text-white shadow-md shadow-[#2d5a27]/20"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Phone className="w-4 h-4" /> যোগাযোগ তথ্য
              </button>
              <button
                onClick={() => setContactTab("feedback")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  contactTab === "feedback"
                    ? "bg-[#2d5a27] text-white shadow-md shadow-[#2d5a27]/20"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> ফিডব্যাক
              </button>
            </div>

            <div className="p-2">
              {contactTab === "info" ? (
                <div className="space-y-4">
                  <h3 className="font-serif font-extrabold text-[#2d5a27] text-lg sm:text-xl pb-2 border-b">
                    কর্মকর্তা ও হেল্পলাইন ডেস্ক
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-[#2d5a27]/5 border border-[#2d5a27]/10 p-5 rounded-3xl space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 bg-[#2d5a27]/10 text-[#2d5a27] text-[10px] font-bold rounded-bl-xl font-sans">
                        প্রধান সমন্বয়ক
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 bg-[#2d5a27]/10 rounded-full flex items-center justify-center text-neutral-600 shadow-sm mt-0.5">
                          <Landmark className="w-5 h-5 text-[#2d5a27]" />
                        </div>
                        <div>
                          <h4 className="font-serif font-extrabold text-neutral-800 text-sm sm:text-base">
                            উপজেলা নির্বাহী অফিসার (ইউএনও)
                          </h4>
                          <span className="text-[11px] font-bold text-gray-400 block">
                            উপজেলা পরিষদ, পুঠিয়া
                          </span>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm space-y-1.5 text-neutral-600">
                        <p>
                          📍 <strong>কার্যালয়:</strong> ২য় তলা, উপজেলা পরিষদ
                          ভবন, পুঠিয়া
                        </p>
                        <p>
                          ⏱️ <strong>সাক্ষাতের সময়:</strong> প্রতি কার্যদিবসে
                          সকাল ১০:০০ - দুপুর ১২:০০
                        </p>
                        <p>
                          📧 <strong>ইমেইল:</strong> unoputhia@mopa.gov.bd
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() =>
                            onSimulateCall("০১৭৩৩-৩৪৭৭৫৫", "UNOPuthia Office")
                          }
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-emerald-50 text-[#2d5a27] border border-[#2d5a27]/20 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
                        >
                          📞 দপ্তরে কল করুন
                        </button>
                      </div>
                    </div>

                    <div className="bg-red-50/20 border border-red-100 p-5 rounded-3xl space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 bg-red-100/50 text-[#CD5C5C] text-[10px] font-bold rounded-bl-xl font-sans">
                        টোল ফ্রি হেল্পলাইন
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 bg-red-100/30 rounded-full flex items-center justify-center text-red-600 shadow-sm mt-0.5">
                          <HelpCircle className="w-5 h-5 text-[#CD5C5C]" />
                        </div>
                        <div>
                          <h4 className="font-serif font-extrabold text-neutral-800 text-sm sm:text-base">
                            জাতীয় হেল্পলাইন ডেস্ক
                          </h4>
                          <span className="text-[11px] font-bold text-gray-400 block">
                            সরকারি সেবা সংক্রান্ত সাহায্য
                          </span>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm space-y-1.5 text-neutral-600">
                        <p>
                          📞 <strong>নাগরিক হেল্পলাইন:</strong> ৩৩৩ (ফ্রি কলিং)
                        </p>
                        <p>
                          💼 <strong>জরুরি সেবা:</strong> ৯৯৯
                        </p>
                        <p>
                          ⏱️ <strong>পরিষেবা সময়সূচী:</strong> ২৪ ঘণ্টা (যেকোনো
                          দিন)
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() =>
                            onSimulateCall("৩৩৩", "National Citizens Helpline")
                          }
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-red-50 text-[#CD5C5C] border border-red-100 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
                        >
                          📞 ৩৩৩ এ কল দিন
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border rounded-3xl p-6 shadow-sm">
                  <h3 className="font-serif font-extrabold text-[#2d5a27] text-lg sm:text-xl pb-3 mb-5 border-b flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> উপজেলা প্রশাসনের সেবার
                    মানোন্নয়নে আপনার মতামত
                  </h3>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600">
                          আপনার নাম <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={feedbackName || ""}
                          onChange={(e) => setFeedbackName(e.target.value)}
                          placeholder="আপনার পূর্ণ নাম"
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600">
                          মোবাইল নম্বর <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={feedbackPhone || ""}
                          onChange={(e) => setFeedbackPhone(e.target.value)}
                          placeholder="০১৭XX-XXXXXX"
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600">
                        সেবার মান মূল্যায়ন নির্ধারণ করুন (রেটিং){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2 border p-2 rounded-xl bg-neutral-50 justify-center sm:justify-start w-fit mx-auto sm:mx-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className="cursor-pointer p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-8 h-8 ${star <= feedbackRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-600">
                        আপনার গঠনমূলক মতামত বা পরামর্শ{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={feedbackMsg || ""}
                        onChange={(e) => setFeedbackMsg(e.target.value)}
                        placeholder="ভবিষ্যত সেবার মান উন্নত করতে আপনার কোনো পরামর্শ থাকলে বিস্তারিত লিখুন..."
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27] transition"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          if (!feedbackName || !feedbackPhone || !feedbackMsg) {
                            alert("অনুগ্রহ করে সকল ফিল্ড সঠিকভাবে পূরণ করুন!");
                            return;
                          }
                          alert(`আপনার মতামত সফলভাবে গ্রহণ করা হয়েছে!
রেটিং: ${feedbackRating} স্টার
ধন্যবাদ, ${feedbackName}।`);
                          setFeedbackName("");
                          setFeedbackPhone("");
                          setFeedbackMsg("");
                          setFeedbackRating(5);
                        }}
                        className="px-6 py-3 bg-[#CD5C5C] hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        মতামত প্রদান করুন
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "event_mela":
      case "event_cultural":
      case "event_sports":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#2d5a27] to-[#1a3816] p-6 sm:p-8 text-white relative rounded-3xl overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="bg-[#CD5C5C] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    উপজেলা ইভেন্ট
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-extrabold mt-2">
                    ইভেন্ট ও উৎসব
                  </h2>
                  <p className="text-gray-200/90 text-sm sm:text-base font-medium mt-1">
                    পুঠিয়া উপজেলার আসন্ন মেলা, সাংস্কৃতিক অনুষ্ঠান ও খেলাধুলার
                    খবর
                  </p>
                </div>
                <button
                  onClick={onGoBack}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all border border-white/10 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> ফিরে যান
                </button>
              </div>
            </div>

            <div className="bg-neutral-50 px-4 sm:px-6 py-3 border border-neutral-200 rounded-2xl flex flex-wrap gap-2">
              <button
                onClick={() => setEventTab("mela")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  eventTab === "mela"
                    ? "bg-[#2d5a27] text-white shadow-md shadow-[#2d5a27]/20"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Store className="w-4 h-4" /> মেলা
              </button>
              <button
                onClick={() => setEventTab("cultural")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  eventTab === "cultural"
                    ? "bg-[#2d5a27] text-white shadow-md shadow-[#2d5a27]/20"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Sparkles className="w-4 h-4" /> সাংস্কৃতিক অনুষ্ঠান
              </button>
              <button
                onClick={() => setEventTab("sports")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  eventTab === "sports"
                    ? "bg-[#2d5a27] text-white shadow-md shadow-[#2d5a27]/20"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Trophy className="w-4 h-4" /> খেলাধুলা
              </button>
            </div>

            <div className="bg-white border rounded-3xl p-6 shadow-sm">
              {eventTab === "mela" && (
                <div className="space-y-4">
                  <h3 className="font-serif font-extrabold text-[#2d5a27] text-lg">
                    উপজেলার মেলা 
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-200 transition">
                      <div className="absolute right-0 top-0 -mt-2 -mr-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1.5 rounded-bl-xl">
                        আপকামিং
                      </div>
                      <h4 className="font-bold text-neutral-800 text-sm sm:text-base mb-2">
                        বৈশাখী মেলা - ২০২৬
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 space-y-1">
                        <span className="block">
                          📅 <strong>সময়:</strong> ১৪ - ১৬ এপ্রিল
                        </span>
                        <span className="block">
                          📍 <strong>স্থান:</strong> উপজেলা পরিষদ প্রাঙ্গণ
                        </span>
                      </p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl hover:border-[#2d5a27]/30 transition group">
                      <h4 className="font-bold text-neutral-800 text-sm sm:text-base mb-2">
                        ঐতিহ্যবাহী শিবরাত্রির মেলা
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 space-y-1">
                        <span className="block">
                          📅 <strong>সময়:</strong> ফেব্রুয়ারি (তারিখ
                          পরিবর্তনশীল)
                        </span>
                        <span className="block">
                          📍 <strong>স্থান:</strong> পুঠিয়া শিব মন্দির প্রাঙ্গণ
                        </span>
                      </p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl hover:border-[#2d5a27]/30 transition group">
                      <h4 className="font-bold text-neutral-800 text-sm sm:text-base mb-2">
                        রথযাত্রার মেলা
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 space-y-1">
                        <span className="block">
                          📅 <strong>সময়:</strong> আষাঢ় মাস
                        </span>
                        <span className="block">
                          📍 <strong>স্থান:</strong> পুঠিয়া রাজবাড়ী মাঠ
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {eventTab === "cultural" && (
                <div className="space-y-4">
                  <h3 className="font-serif font-extrabold text-[#2d5a27] text-lg">
                    সাংস্কৃতিক অনুষ্ঠান
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl hover:border-[#2d5a27]/30 transition group">
                      <h4 className="font-bold text-neutral-800 text-sm sm:text-base mb-2">
                        বসন্ত বরণ উৎসব
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 space-y-1">
                        <span className="block">
                          📅 <strong>সময়:</strong> ১ ফাল্গুন
                        </span>
                        <span className="block">
                          📍 <strong>স্থান:</strong> পুঠিয়া পি. এন. গভার্নমেন্ট
                          হাই স্কুল মাঠ
                        </span>
                      </p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl hover:border-[#2d5a27]/30 transition group">
                      <h4 className="font-bold text-neutral-800 text-sm sm:text-base mb-2">
                        উপজেলা শিল্পকলা উৎসব
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 space-y-1">
                        <span className="block">
                          📅 <strong>সময়:</strong> মে মাস
                        </span>
                        <span className="block">
                          📍 <strong>স্থান:</strong> উপজেলা অডিটোরিয়াম
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {eventTab === "sports" && (
                <div className="space-y-4">
                  <h3 className="font-serif font-extrabold text-[#2d5a27] text-lg">
                    খেলার খবর ও সূচি
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-200 transition">
                      <div className="absolute right-0 top-0 -mt-2 -mr-2 bg-indigo-100 text-indigo-800 text-[10px] font-bold px-3 py-1.5 rounded-bl-xl">
                        চলমান
                      </div>
                      <h4 className="font-bold text-neutral-800 text-sm sm:text-base mb-2">
                        বঙ্গবন্ধু গোল্ডকাপ ফুটবল টুর্নামেন্ট
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 space-y-1">
                        <span className="block">
                          📅 <strong>সময়:</strong> মে - জুন মাস
                        </span>
                        <span className="block">
                          📍 <strong>স্থান:</strong> পি. এন. স্কুল মাঠ
                        </span>
                      </p>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl hover:border-[#2d5a27]/30 transition group">
                      <h4 className="font-bold text-neutral-800 text-sm sm:text-base mb-2">
                        উপজেলা আন্তঃস্কুল ক্রীড়া প্রতিযোগিতা
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 space-y-1">
                        <span className="block">
                          📅 <strong>সময়:</strong> জানুয়ারি
                        </span>
                        <span className="block">
                          📍 <strong>স্থান:</strong> উপজেলা সদর মাঠ
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "notice_upazila":
      case "notice_municipality":
      case "notice_union":
      case "notice_education":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#2d5a27] to-[#1a3816] p-6 sm:p-8 text-white relative rounded-3xl overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="bg-[#CD5C5C] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    জরুরী বিজ্ঞপ্তি
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-extrabold mt-2">
                    নোটিশ বোর্ড
                  </h2>
                  <p className="text-gray-200/90 text-sm sm:text-base font-medium mt-1">
                    উপজেলা প্রশাসন, পৌরসভা, ইউনিয়ন পরিষদ এবং শিক্ষা প্রতিষ্ঠানের
                    সর্বশেষ নোটিশ
                  </p>
                </div>
                <button
                  onClick={onGoBack}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all border border-white/10 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> ফিরে যান
                </button>
              </div>
            </div>

            <div className="bg-neutral-50 px-4 sm:px-6 py-3 border border-neutral-200 rounded-2xl flex flex-wrap gap-2">
              <button
                onClick={() => setNoticeTab("upazila")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  noticeTab === "upazila"
                    ? "bg-[#2d5a27] text-white shadow-md shadow-[#2d5a27]/20"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Building className="w-4 h-4" /> উপজেলা প্রশাসন
              </button>
              <button
                onClick={() => setNoticeTab("municipality")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  noticeTab === "municipality"
                    ? "bg-[#2d5a27] text-white shadow-md shadow-[#2d5a27]/20"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Building className="w-4 h-4" /> পৌরসভা
              </button>
              <button
                onClick={() => setNoticeTab("union")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  noticeTab === "union"
                    ? "bg-[#2d5a27] text-white shadow-md shadow-[#2d5a27]/20"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Globe className="w-4 h-4" /> ইউনিয়ন পরিষদ
              </button>
              <button
                onClick={() => setNoticeTab("education")}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                  noticeTab === "education"
                    ? "bg-[#2d5a27] text-white shadow-md shadow-[#2d5a27]/20"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <School className="w-4 h-4" /> শিক্ষা প্রতিষ্ঠান
              </button>
            </div>

            <div className="bg-white border rounded-3xl p-6 shadow-sm min-h-[40vh]">
              <h3 className="font-serif font-extrabold text-[#2d5a27] text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {noticeTab === "upazila" && "উপজেলা প্রশাসনের নোটিশ"}
                {noticeTab === "municipality" && "পৌরসভার নোটিশ"}
                {noticeTab === "union" && "ইউনিয়ন পরিষদের নোটিশ"}
                {noticeTab === "education" && "শিক্ষা প্রতিষ্ঠানের নোটিশ"}
              </h3>

              <div className="text-center py-16 text-neutral-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>বর্তমানে কোনো নতুন নোটিশ নেই।</p>
              </div>
            </div>
          </div>
        );

      case "upazila_intro_grid":
        return <UpazilaIntroGrid onGoBack={onGoBack} />;

      case "blood_donation_reg":
        return (
          <BloodDonationRegInfo 
            onGoBack={onGoBack} 
            bloodDonors={bloodDonors} 
            setBloodDonors={setBloodDonors} 
          />
        );
      case "search_blood_group":
        return (
          <SearchBloodGroupInfo 
            onGoBack={onGoBack} 
            bloodDonors={bloodDonors} 
          />
        );
      case "blood_donor_list":
        return (
          <BloodDonorListInfo 
            onGoBack={onGoBack} 
            bloodDonors={bloodDonors} 
            setBloodDonors={setBloodDonors}
            bloodSearchTerm={bloodSearchTerm} 
            setBloodSearchTerm={setBloodSearchTerm} 
            onAddDonor={() => setSelectedSubView("blood_donation_reg")}
          />
        );
      case "blood_emergency_request":
      case "emergency_blood":
        return <BloodEmergencyRequestInfo onGoBack={onGoBack} />;

      case "house_rent":
      case "shop_rent":
      case "office_rent":
      case "mess_rent":
      case "land_lease":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 sm:p-8 text-white relative rounded-3xl overflow-hidden shadow-md">
              <Building className="absolute right-0 bottom-0 w-48 h-48 text-white/5 -mb-8 -mr-8" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-bengali tracking-tight flex items-center gap-2">
                    <Building className="w-6 h-6 sm:w-8 sm:h-8" />
                    ভাড়া ও টু-লেট
                  </h1>
                  <p className="mt-2 text-blue-100 font-bengali text-sm sm:text-base max-w-xl leading-relaxed opacity-90">
                    বাসা, দোকান, অফিস বা মেস ভাড়া এবং ফ্ল্যাট ও জমি লিজ
                    সংক্রান্ত সকল তথ্য।
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-neutral-200 overflow-x-auto hide-scrollbar">
                <div className="flex px-4 min-w-max">
                  <button
                    onClick={() => setRentTab("house")}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                      rentTab === "house"
                        ? "border-blue-600 text-blue-700 bg-blue-50/50"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50"
                    }`}
                  >
                    <Home className="w-4 h-4" /> বাসা ভাড়া
                  </button>
                  <button
                    onClick={() => setRentTab("shop")}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                      rentTab === "shop"
                        ? "border-blue-600 text-blue-700 bg-blue-50/50"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50"
                    }`}
                  >
                    <Store className="w-4 h-4" /> দোকান ভাড়া
                  </button>
                  <button
                    onClick={() => setRentTab("office")}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                      rentTab === "office"
                        ? "border-blue-600 text-blue-700 bg-blue-50/50"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" /> অফিস ভাড়া
                  </button>
                  <button
                    onClick={() => setRentTab("mess")}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                      rentTab === "mess"
                        ? "border-blue-600 text-blue-700 bg-blue-50/50"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50"
                    }`}
                  >
                    <Building className="w-4 h-4" /> মেস ভাড়া
                  </button>
                  <button
                    onClick={() => setRentTab("land")}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                      rentTab === "land"
                        ? "border-blue-600 text-blue-700 bg-blue-50/50"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50"
                    }`}
                  >
                    <Map className="w-4 h-4" /> জমি লিজ
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-neutral-50/30">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    {rentTab === "house" ? (
                      <Home className="w-8 h-8 text-blue-600" />
                    ) : rentTab === "shop" ? (
                      <Store className="w-8 h-8 text-blue-600" />
                    ) : rentTab === "office" ? (
                      <Briefcase className="w-8 h-8 text-blue-600" />
                    ) : rentTab === "mess" ? (
                      <Building className="w-8 h-8 text-blue-600" />
                    ) : (
                      <Map className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">
                    {rentTab === "house"
                      ? "বাসার তালিকা আপডেট হচ্ছে"
                      : rentTab === "shop"
                        ? "দোকানের তালিকা আপডেট হচ্ছে"
                        : rentTab === "office"
                          ? "অফিসের তালিকা আপডেট হচ্ছে"
                          : rentTab === "mess"
                            ? "মেসের তালিকা আপডেট হচ্ছে"
                            : "জমির তালিকা আপডেট হচ্ছে"}
                  </h3>
                  <p className="text-neutral-500 max-w-sm">
                    খুব শীঘ্রই এখানে বিস্তারিত তথ্য যোগ করা হবে। অনুগ্রহ করে
                    অপেক্ষা করুন।
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "application_form":
        return <ApplicationFormsInfo onGoBack={() => setSelectedSubView("download_center")} />;
      case "important_pdf":
        return <ImportantPdfsInfo onGoBack={() => setSelectedSubView("download_center")} />;
      case "certificate_sample":
        return <CertificateSamplesInfo onGoBack={() => setSelectedSubView("download_center")} />;
      case "agriculture_guide":
        return <AgricultureGuidesInfo onGoBack={() => setSelectedSubView("download_center")} />;
      case "education_material":
        return <EducationalResourcesInfo onGoBack={() => setSelectedSubView("download_center")} />;

      case "union_profiles": return <UnionProfiles onGoBack={onGoBack} />;
      case "village_list": return <VillageListInfo onGoBack={onGoBack} />;
      case "village_history": return <VillageHistoryInfo onGoBack={onGoBack} />;
      case "village_population": return <VillagePopulationInfo onGoBack={onGoBack} />;
      case "village_education": return <VillageEducationInfo onGoBack={onGoBack} />;
      case "village_religion": return <VillageReligiousInfo onGoBack={onGoBack} />;
      case "village_notable_persons": return <VillageNotablePersonsInfo onGoBack={onGoBack} />;
      case "village_gallery": return <VillagePhotoGalleryInfo onGoBack={onGoBack} />;
      case "village_map": return <MapGrid onGoBack={onGoBack} />;
      case "puthia_rajbari": return <PuthiaRajbariInfo onGoBack={onGoBack} />;
      case "temples": return <HeritageTemplesInfo onGoBack={onGoBack} />;
      case "historical_places": return <HistoricalSitesInfo onGoBack={onGoBack} />;
      case "travel_guide": return <TravelGuideInfo onGoBack={onGoBack} />;
      case "hotel_transport_info": return <TourismHotelsTransportInfo onGoBack={onGoBack} />;
      case "tourism_photo_gallery": return <TourismPhotoGalleryInfo onGoBack={onGoBack} />;
      case "tourism_video_gallery": return <TourismVideoGalleryInfo onGoBack={onGoBack} />;
      case "shop_grocery":
      case "shop_pharmacy":
      case "shop_mobile_computer":
      case "shop_electronics":
      case "shop_clothing_cosmetics":
      case "shop_furniture":
      case "shop_hardware_sanitary":
      case "shop_agri_supplies":
      case "shop_sweets_bakery":
      case "shop_jewelry":
      case "shop_books_stationery":
      case "shop_vet_feed":
      case "shop_mall_market":
        return <LocalShopDirectoryInfo onGoBack={onGoBack} category={activeSubViewId} />;
      case "sp_construction":
      case "sp_plumbing":
      case "sp_electronics":
      case "sp_technical":
      case "sp_vehicle":
      case "sp_lawyer":
      case "sp_journalist":
      case "local_service_provider": return <LocalServiceProviderInfo onGoBack={onGoBack} category={activeSubViewId} />;
      case "entrepreneur_corner":
      case "entrepreneur": return <ServiceDirectoryTemplate serviceKeyParam="entrepreneur" isEmbedded={true} />;
      case "marketplace_buy_sell": return <BuySellInfo onGoBack={onGoBack} />;
      case "marketplace_local_products": return <LocalProductsInfo onGoBack={onGoBack} />;
      case "marketplace_job_ads": return <ServiceDirectoryTemplate serviceKeyParam="job" isEmbedded={true} />;
      case "marketplace_business_ads": return <BusinessAdsInfo onGoBack={onGoBack} />;
      case "local_parlor": return <LocalParlorInfo onGoBack={onGoBack} />;
      case "rural_electricity": return <RuralElectricityInfo onGoBack={onGoBack} />;
      case "van_auto_info": return <VanAutoInfoView onGoBack={onGoBack} onNavigateToMap={() => setSelectedSubView("transport_map")} />;
      case "transport_map": return <TransportMap onGoBack={onGoBack} />;
      case "bus_counter_emergency": return <BusCounterInfo onGoBack={onGoBack} />;
      case "veterinary_doctor": return <VeterinaryDoctorInfo onGoBack={onGoBack} />;
      case "police_contact": return <PoliceInfo onGoBack={onGoBack} />;
      case "emergency_ambulance": return <AmbulanceInfo onGoBack={onGoBack} />;
      case "cyber_helpline": return <CyberHelplineInfo onGoBack={onGoBack} />;
      case "women_children_help": return <WomenChildrenHelpInfo onGoBack={onGoBack} />;
      case "national_helpline": return <NationalHelplineInfo onGoBack={onGoBack} />;
      case "hospital": return <HospitalInfo onGoBack={onGoBack} />;
      case "clinic": return <ClinicInfo onGoBack={onGoBack} />;
      case "doctor": return <DoctorInfo onGoBack={onGoBack} />;
      case "pharmacy": return <ServiceDirectoryTemplate serviceKeyParam="pharmacy" />;
      case "diagnostic": return <DiagnosticInfo onGoBack={onGoBack} />;
      case "dental": return <DentalInfo onGoBack={onGoBack} />;
      case "news_upazila": return <SpecialNews onGoBack={onGoBack} />;
      case "news_union": return <UnionNews onGoBack={onGoBack} />;
      case "news_village": return <VillageNews onGoBack={onGoBack} />;
      case "news_education": return <EduNews onGoBack={onGoBack} />;
      case "news_sports": return <SportsNews onGoBack={onGoBack} />;
      case "news_business": return <BusinessNews onGoBack={onGoBack} />;
      case "news_special": return <SpecialNews onGoBack={onGoBack} />;
      case "news_citizen": return <CitizenNews onGoBack={onGoBack} />;
      case "job_circular": return <GeneralJobNews onGoBack={onGoBack} />;
      case "education_coaching": return <EducationCoachingHub onGoBack={onGoBack} />;
      case "job_local_ads": return <LocalJobOpenings onGoBack={onGoBack} />;
      case "job_freelance_res": return <FreelancingResources onGoBack={onGoBack} />;
      case "job_training_news": return <TrainingWorkshops onGoBack={onGoBack} />;
      case "notable_persons": return <NotablePersonsHub onGoBack={onGoBack} />;
      case "notable_freedom_fighters": return <NotablePersonsHub onGoBack={onGoBack} initialCategory="notable_freedom_fighters" />;
      case "notable_academicians": return <NotablePersonsHub onGoBack={onGoBack} initialCategory="notable_academicians" />;
      case "notable_sports": return <NotablePersonsHub onGoBack={onGoBack} initialCategory="notable_sports" />;
      case "notable_entrepreneurs": return <NotablePersonsHub onGoBack={onGoBack} initialCategory="notable_entrepreneurs" />;

      case "chairman_members": return <ChairmanMembers onGoBack={onGoBack} />;
      case "union_offices": return <UnionOffices onGoBack={onGoBack} />;
      case "union_services": return <UnionServices onGoBack={onGoBack} />;
      case "union_maps": return <MapGrid onGoBack={onGoBack} />;
      case "union_contact": return <UnionContact onGoBack={onGoBack} />;
      case "profile": return <UserProfileView onGoBack={onGoBack} onNavigateToSubView={(viewId) => setSelectedSubView(viewId)} />;
      case "digital_id_card": return <DigitalIdCard onGoBack={onGoBack} />;
      case "lost_and_found": return <LostAndFound onGoBack={onGoBack} />;
      case "local_vote_survey": return <LocalPolls onGoBack={onGoBack} />;
      case "citizen_ranking": return <CitizenLeaderboard onGoBack={onGoBack} />;
      case "verified_business": return <VerifiedBusiness onGoBack={onGoBack} />;
      case "community_badge": return <CommunityBadges onGoBack={onGoBack} />;
      case "local_ads": return <SponsorsPage onGoBack={onGoBack} />;

      case "bus_schedule": return <BusScheduleView onGoBack={onGoBack} />;
      case "train_info": return <TrainInfoView onGoBack={onGoBack} />;
      case "fare_list": return <FareListView onGoBack={onGoBack} />;

      case "uno_contact":
        return <UnoContactInfo onGoBack={onGoBack} />;
      case "chairman_contact":
        return <ChairmanContactInfo onGoBack={onGoBack} onSimulateCall={onSimulateCall} />;
      case "oc_contact":
        return <OcContactInfo onGoBack={onGoBack} />;
      case "up_contact":
        return <UpContactInfo onGoBack={onGoBack} />;
      case "electricity_contact":
        return <ElectricityContactInfo onGoBack={onGoBack} />;
      case "water_contact":
        return <WaterContactInfo onGoBack={onGoBack} />;
      case "hospital_contact":
        return <HospitalContactInfo onGoBack={onGoBack} />;
      case "fire_service_contact":
        return <FireServiceInfo onGoBack={onGoBack} />;

      case "mosque":
        return <MosqueInfo onGoBack={onGoBack} />;
      case "church":
        return <ChurchInfo onGoBack={onGoBack} />;
      case "pagoda":
        return <PagodaInfo onGoBack={onGoBack} />;
      case "orphanage":
        return <OrphanageInfo onGoBack={onGoBack} />;
      case "blood_donation_history":
        return <BloodDonationHistory onGoBack={onGoBack} />;
      case "temple":
        return <TempleInfo onGoBack={onGoBack} />;
      case "eidgah":
        return <EidgahInfo onGoBack={onGoBack} />;
      case "graveyard":
        return <GraveyardInfo onGoBack={onGoBack} />;
      case "religious_events":
        return <ReligiousEventsInfo onGoBack={onGoBack} />;

      case "problem_report":
        return <ProblemReportInfo onGoBack={onGoBack} />;

      case "citizen_complaint":
        return <CitizenComplaintInfo onGoBack={onGoBack} />;
      case "road_problem":
        return <RoadProblemInfo onGoBack={onGoBack} />;
      case "electricity_problem":
        return <ElectricityProblemInfo onGoBack={onGoBack} />;
      case "water_problem":
        return <WaterProblemInfo onGoBack={onGoBack} />;
      case "provide_feedback":
        return <ProvideFeedbackInfo onGoBack={onGoBack} />;
      case "complaint_status":
        return <ComplaintStatusInfo onGoBack={onGoBack} />;

      default:
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4 animate-fade-in bg-white rounded-2xl shadow-sm border border-neutral-100 mt-4">
            <div className="w-20 h-20 bg-[#2d5a27]/10 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white">
              <span className="text-4xl text-[#2d5a27] animate-bounce">🚀</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-serif text-[#2d5a27] mb-3">
              শীঘ্রই আসছে
            </h2>
            <p className="text-neutral-500 font-sans max-w-md mx-auto leading-relaxed">
              এই ফিচারটির কাজ বর্তমানে{" "}
              <strong className="text-[#CD5C5C]">উন্নয়নাধীন</strong> রয়েছে।
              পুঠিয়া বাসীদের জন্য এই চমৎকার সেবাটি খুব দ্রুতই সংযুক্ত করা হবে।
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="px-5 py-2 bg-neutral-100 text-neutral-600 text-sm font-bold font-sans rounded-full border border-neutral-200 flex items-center gap-2">
                <span className="text-lg leading-none">📌</span> উন্নয়নাধীন
              </span>
              <span className="px-5 py-2 bg-red-50 text-red-600 text-sm font-bold font-sans rounded-full border border-red-100 flex items-center gap-2">
                <span className="text-lg leading-none">🔥</span> নতুন ফিচার
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* RENDER THE ACTIVE PANEL CONTENT */}
      <div className="animate-fade-in duration-300">
        <ErrorBoundary>{renderSubViewContent(activeSubViewId)}</ErrorBoundary>
      </div>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-extrabold text-neutral-800 mb-4">
              রক্তদাতা হিসেবে নিবন্ধন করুন
            </h2>
            <div className="space-y-4">
              <input
                className="w-full p-3 border rounded-xl"
                placeholder="নাম"
                value={newDonorName || ""}
                onChange={(e) => setNewDonorName(e.target.value)}
              />
              <input
                className="w-full p-3 border rounded-xl"
                placeholder="ফোন"
                value={newDonorPhone || ""}
                onChange={(e) => setNewDonorPhone(e.target.value)}
              />
              <select
                className="w-full p-3 border rounded-xl"
                value={newDonorGroup || ""}
                onChange={(e) => setNewDonorGroup(e.target.value)}
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                  <option key={g} value={g || ""}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                className="flex-1 px-4 py-2 bg-gray-200 rounded-xl"
                onClick={() => setIsRegisterModalOpen(false)}
              >
                বন্ধ করুন
              </button>
              <button
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl"
                onClick={() => {
                  setBloodDonors((prev) => [
                    ...prev,
                    {
                      name: newDonorName,
                      phone: newDonorPhone,
                      group: newDonorGroup,
                      union: newDonorUnion,
                    },
                  ]);
                  setIsRegisterModalOpen(false);
                }}
              >
                জমা দিন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
