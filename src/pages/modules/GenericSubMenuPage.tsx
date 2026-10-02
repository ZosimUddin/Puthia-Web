import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getSubMenuPage } from '../../api';
import { SubMenuPageData } from '../../types';
import { SubMenuDetailLayout } from '../../components/common/SubMenuDetailLayout';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { AdministrationUnions } from '../../components/AdministrationUnions';
import { PhotoVideoGallery } from '../../components/PhotoVideoGallery';
import { TouristSpots } from '../../components/TouristSpots';
import Agriculture from './Agriculture';
import LivestockFisheries from './LivestockFisheries';
import { WeatherUpdateInfo } from '../../components/WeatherUpdateInfo';
import { HospitalInfo } from '../../components/HospitalInfo';
import { DoctorInfo } from '../../components/DoctorInfo';
import { ClinicInfo } from '../../components/ClinicInfo';
import { PharmacyInfo } from '../../components/PharmacyInfo';
import { DiagnosticInfo } from '../../components/DiagnosticInfo';
import { AmbulanceInfo } from '../../components/AmbulanceInfo';
import { VaccinationInfo } from '../../components/VaccinationInfo';
import { LocalHotelInfo } from '../../components/LocalHotelInfo';
import { BankingFinance } from '../../components/BankingFinance';
import { InsuranceServices } from '../../components/InsuranceServices';
import { EduInstInfo } from '../../components/EduInstInfo';
import { SchoolInfo } from '../../components/SchoolInfo';
import { CollegeInfo } from '../../components/CollegeInfo';
import { MadrashaInfo } from '../../components/MadrashaInfo';
import { UniversityInfo } from '../../components/UniversityInfo';
import { CoachingInfo } from '../../components/CoachingInfo';
import { AdmissionInfo } from '../../components/AdmissionInfo';
import { ExamResultsInfo } from '../../components/ExamResultsInfo';
import { LibraryInfo } from '../../components/LibraryInfo';
import { EducationOfficeInfo } from '../../components/EducationOfficeInfo';
import { VerifiedBusiness } from '../../components/VerifiedBusiness';
import { LocalShopDirectoryInfo } from '../../components/LocalShopDirectoryInfo';
import { SuperShopInfo } from '../../components/SuperShopInfo';
import { LocalRestaurantInfo } from '../../components/LocalRestaurantInfo';
import { EntrepreneurCornerInfo } from '../../components/EntrepreneurCornerInfo';
import { AddBusinessInfo } from '../../components/AddBusinessInfo';
import SpecialOffersPage from './SpecialOffersPage';
import ReviewsPage from './ReviewsPage';
import MistriPage from './MistriPage';
import { JobPortal } from '../../components/JobPortal';
import { ServiceDirectoryTemplate } from '../../components/common/MasterServiceTemplate/ServiceDirectoryTemplate';
import { TrainingHub } from '../../components/TrainingHub';
import { ScholarshipInfo } from '../../components/ScholarshipInfo';
import { VolunteerNetwork } from '../../components/VolunteerNetwork';
import { LostAndFound } from '../../components/LostAndFound';
import { CommunityPrograms } from '../../components/CommunityPrograms';
import { MosqueInfo } from '../../components/MosqueInfo';
import { TempleInfo } from '../../components/TempleInfo';
import { ChurchInfo } from '../../components/ChurchInfo';
import { PagodaInfo } from '../../components/PagodaInfo';
import { VillageReligiousInfo } from '../../components/VillageReligiousInfo';
import { OfficerDirectoryInfo } from '../../components/OfficerDirectoryInfo';
import { OfficialMaps } from '../../components/OfficialMaps';
import { CommunityClinicInfo } from '../../components/CommunityClinicInfo';
import { MediaHubInfo } from '../../components/MediaHubInfo';
import { FreelancingResources } from '../../components/FreelancingResources';
import { EidgahInfo } from '../../components/EidgahInfo';
import { GraveyardInfo } from '../../components/GraveyardInfo';
import { OrphanageInfo } from '../../components/OrphanageInfo';
import { ZakatInfo } from '../../components/ZakatInfo';

export const DUMMY_DATA: Record<string, any> = {
  "volunteer": {
    title: "স্বেচ্ছাসেবক",
    description: "স্বেচ্ছাসেবকদের তালিকা এবং রেজিস্ট্রেশন পোর্টাল।",
    coverImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=1200",
    contactInfo: []
  },
  "lost-found": {
    title: "হারানো ও পাওয়া",
    description: "আপনার হারানো বা পাওয়া জিনিসের বিজ্ঞাপন ও অনুসন্ধান করুন।",
    coverImage: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=1200",
    contactInfo: []
  },
  "announcement": {
    title: "কমিউনিটি ঘোষণা",
    description: "এলাকার সর্বশেষ ঘোষণা ও উৎসব।",
    coverImage: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1200",
    contactInfo: []
  },
  "administration": {
    title: "উপজেলা পরিচিতি",
    description: "পুঠিয়া উপজেলার আয়তন, জনসংখ্যা, ভৌগোলিক অবস্থান এবং অন্যান্য সাধারণ তথ্যাবলী।",
    coverImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=1200",
    mapLocation: "উপজেলা পরিষদ, পুঠিয়া",
    contactInfo: [
      { label: "আয়তন", value: "২০৭.৬৪ বর্গ কিঃ মিঃ" },
      { label: "জনসংখ্যা", value: "২,০৭,৪৯০ জন" }
    ]
  },
  "history": {
    title: "ইতিহাস ও ঐতিহ্য",
    description: "পুঠিয়ার প্রাচীন রাজবাড়ি, ঐতিহাসিক মন্দির ও অন্যান্য প্রত্নতাত্ত্বিক নিদর্শনের ইতিহাস।",
    coverImage: "https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&q=80&w=1200",
    photoGallery: [
      "https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400"
    ]
  },
  "offices": {
    title: "সরকারি অফিস",
    description: "উপজেলা পর্যায়ের সকল সরকারি অফিসের বিবরণ, সেবা এবং যোগাযোগের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1577962917302-c8732b06a6c5?auto=format&fit=crop&q=80&w=1200",
    callNumber: "01700-000000",
    websiteUrl: "http://puthia.rajshahi.gov.bd",
    mapLocation: "পুঠিয়া উপজেলা পরিষদ",
  },
  "unions": {
    title: "ইউনিয়ন",
    description: "পুঠিয়া উপজেলার অন্তর্গত ৬টি ইউনিয়নের তথ্য এবং সেবা।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
  "social": {
    title: "সামাজিক প্রতিষ্ঠান",
    description: "এলাকার বিভিন্ন সামাজিক, স্বেচ্ছাসেবী ও সাংস্কৃতিক প্রতিষ্ঠানের কার্যক্রম।",
    coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200",
  },
  "ngo": {
    title: "এনজিও",
    description: "উপজেলায় কর্মরত বিভিন্ন এনজিওর তালিকা এবং সেবা।",
    coverImage: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=1200",
  },
  "blood-donor": {
    title: "রক্তদাতা",
    description: "জরুরী প্রয়োজনে রক্তদাতাদের ডাটাবেস ও যোগাযোগের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1200",
    callNumber: "01700-112233",
  },
  "community": {
    title: "কমিউনিটি ইভেন্ট",
    description: "এলাকায় অনুষ্ঠিতব্য বিভিন্ন কমিউনিটি ইভেন্ট, মেলা এবং অনুষ্ঠানের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1200",
  },
  "business": {
    title: "ব্যবসা ও বাজার",
    description: "স্থানীয় ব্যবসা প্রতিষ্ঠান, দোকানপাট ও বাজারের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&q=80&w=1200",
  },
  "services": {
    title: "সেবা প্রদানকারী",
    description: "ইলেকট্রিশিয়ান, প্লাম্বার, মেকানিক সহ অন্যান্য লোকাল সার্ভিস প্রোভাইডারদের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200",
  },
  "finance": {
    title: "ব্যাংক ও আর্থিক সেবা",
    description: "বিভিন্ন ব্যাংক, বীমা, ও মোবাইল ব্যাংকিং এজেন্টদের যোগাযোগের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&q=80&w=1200",
  },
  "marketplace": {
    title: "কেনাবেচা",
    description: "স্থানীয়ভাবে নতুন ও পুরাতন পণ্য কেনাবেচার তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=1200",
  },
  "house-rent": {
    title: "বাড়ি ভাড়া",
    description: "বাসা ও মেস ভাড়ার তথ্য ও যোগাযোগ।",
    coverImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200",
  },
  "education": {
    title: "শিক্ষা প্রতিষ্ঠান",
    description: "স্কুল, কলেজ, মাদ্রাসা ও কিন্ডারগার্টেনের তালিকা এবং যোগাযোগের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200",
  },
  "career": {
    title: "চাকরি",
    description: "স্থানীয় সরকারি ও বেসরকারি চাকরির খবর।",
    coverImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200",
  },
  "training": {
    title: "প্রশিক্ষণ কেন্দ্র",
    description: "যুব উন্নয়ন, মহিলা বিষয়ক এবং কারিগরি প্রশিক্ষণ কেন্দ্রের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200",
  },
  "scholarship": {
    title: "বৃত্তি ও স্কলারশিপ",
    description: "শিক্ষার্থীদের জন্য বিভিন্ন বৃত্তির খবর।",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200",
  },
  "agriculture": {
    title: "কৃষি",
    description: "কৃষি সম্প্রসারণ অধিদপ্তর, সার ডিলার ও কৃষকদের জন্য পরামর্শ।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
  "agriculture-office": {
    title: "কৃষি অফিস",
    description: "উপজেলা কৃষি সম্প্রসারণ কর্মকর্তার কার্যালয়, ইউনিয়ন SAAO ও সরকারি সুযোগ-সুবিধার তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
  "agriculture-consultation": {
    title: "কৃষি পরামর্শ",
    description: "ফসলের রোগবালাই দমন ও আধুনিক পদ্ধতিতে চাষাবাদের জন্য এআই ও বিশেষজ্ঞ পরামর্শ।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
  "agriculture-fertilizer-seed": {
    title: "সার ও বীজ",
    description: "সঠিক সারের মাত্রা, উন্নত জাতের বীজ এবং সারের হিসাব-নিকাশের ক্যালকুলেটর।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
  "agriculture-machinery": {
    title: "কৃষি যন্ত্রপাতি",
    description: "আধুনিক কৃষি যন্ত্রপাতির ব্যবহার, সরকারি ভর্তুকি ও ভাড়ার বিবরণ।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
  "agriculture-pesticides": {
    title: "কীটনাশক",
    description: "অনুমোদিত কীটনাশক ও সঠিক রোগ দমন নির্দেশিকা।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
  "agriculture-crop-calendar": {
    title: "ফসল ক্যালেন্ডার",
    description: "মাস ও মৌসুম ভিত্তিক ফসলের আবাদ ক্যালেন্ডার ও চাষ পদ্ধতি।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
  "agriculture-training": {
    title: "কৃষি প্রশিক্ষণ",
    description: "চাষীদের জন্য আধুনিক কৃষি প্রশিক্ষণ কোর্স ও অনলাইন নিবন্ধন ব্যবস্থা।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
  "agriculture-market": {
    title: "কৃষি বাজার",
    description: "পুঠিয়া উপজেলার বানেশ্বর সহ বিভিন্ন বাজারের ফসল ও কৃষিপণ্যের দৈনিক বাজার দর।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
  "agriculture-news": {
    title: "কৃষি সংবাদ",
    description: "উপজেলার কৃষি বিষয়ক তাজা খবর ও নোটিশ বোর্ড।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
  },
  "farm": {
    title: "খামার ও মৎস্য",
    description: "উপজেলার বিভিন্ন মৎস্য, পোল্ট্রি ও ডেইরি ফার্মের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&q=80&w=1200",
  },
  "livestock-office": {
    title: "প্রাণিসম্পদ অফিস",
    description: "উপজেলা প্রাণিসম্পদ কর্মকর্তার কার্যালয় ও সরকারি সেবার বিস্তারিত তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&q=80&w=1200",
  },
  "veterinary-hospital": {
    title: "পশু হাসপাতাল",
    description: "উপজেলা সরকারি ভেটেরিনারি হাসপাতাল ও পশু চিকিৎসকদের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=1200",
  },
  "fish-farming": {
    title: "মাছ চাষ",
    description: "উপজেলার বিভিন্ন মৎস্য প্রকল্প, পোনা উৎপাদনকারী এবং চাষ পদ্ধতি।",
    coverImage: "https://images.unsplash.com/photo-1529563021966-ecb85b6e4e82?auto=format&fit=crop&q=80&w=1200",
  },
  "cattle-livestock": {
    title: "গবাদি পশু",
    description: "ডেইরি ফার্ম, গরু মোটাতাজাকরণ ও উন্নত ছাগল-ভেড়ার খামারের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=1200",
  },
  "poultry": {
    title: "হাঁস-মুরগি",
    description: "ব্রয়লার, লেয়ার ও সোনালী পোল্ট্রি খামার এবং ডিম উৎপাদনের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=1200",
  },
  "weather": {
    title: "আবহাওয়া",
    description: "বর্তমান আবহাওয়া, কৃষকদের জন্য পূর্বাভাস এবং দুর্যোগ সতর্কতা।",
    coverImage: "https://images.unsplash.com/photo-1504608524841-42ce6f111fcb?auto=format&fit=crop&q=80&w=1200",
  },
  "health": {
    title: "স্বাস্থ্যসেবা",
    description: "উপজেলা স্বাস্থ্য কমপ্লেক্স, কমিউনিটি ক্লিনিক ও প্রাইভেট চেম্বারের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200",
  },
  "hospital": {
    title: "হাসপাতাল",
    description: "সকল সরকারি ও বেসরকারি হাসপাতাল, ক্লিনিক এবং ডায়াগনস্টিক সেন্টারের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200",
  },
  "ambulance": {
    title: "অ্যাম্বুলেন্স",
    description: "জরুরী প্রয়োজনে অ্যাম্বুলেন্স সেবার নম্বর।",
    coverImage: "https://images.unsplash.com/photo-1587556610214-a90100f283d5?auto=format&fit=crop&q=80&w=1200",
    callNumber: "01700-112233",
  },
  "emergency": {
    title: "জরুরি সেবা",
    description: "ফায়ার সার্ভিস, থানা পুলিশ ও অন্যান্য জরুরি সেবার হটলাইন নম্বর।",
    coverImage: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&q=80&w=1200",
    callNumber: "999",
  },
  "transport": {
    title: "পরিবহন তথ্য",
    description: "বাস কাউন্টার, ট্রেনের সময়সূচী ও অন্যান্য পরিবহন সুবিধা।",
    coverImage: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1200",
  },
  "tourism": {
    title: "দর্শনীয় স্থান",
    description: "রাজবাড়ী, মন্দির সহ পুঠিয়ার সকল আকর্ষণীয় পর্যটন কেন্দ্রের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&q=80&w=1200",
  },
  "hotel": {
    title: "হোটেল",
    description: "দর্শনার্থীদের জন্য আবাসিক হোটেল ও রেস্টুরেন্টের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
  },
  "guide": {
    title: "ট্যুর গাইড",
    description: "স্থানীয় পর্যটন গাইডদের সাথে যোগাযোগের তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200",
  },
  "news": {
    title: "সংবাদ",
    description: "এলাকার সর্বশেষ সংবাদ ও ঘটনাবলী।",
    coverImage: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1200",
  },
  "notice": {
    title: "নোটিশ",
    description: "উপজেলা প্রশাসন ও অন্যান্য প্রতিষ্ঠানের বিভিন্ন নোটিশ।",
    coverImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1200",
  },
  "photo-gallery": {
    title: "ছবি গ্যালারি",
    description: "উপজেলার বিভিন্ন ঐতিহাসিক স্থান এবং অনুষ্ঠানের স্থিরচিত্র।",
    coverImage: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=1200",
  },
  "video-gallery": {
    title: "ভিডিও গ্যালারি",
    description: "উপজেলার বিভিন্ন প্রামাণ্যচিত্র এবং ভিডিও গ্যালারি।",
    coverImage: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=1200",
  },
  "birth-registration": {
    title: "জন্ম নিবন্ধন তথ্য ও সেবা",
    description: "নতুন জন্ম নিবন্ধনের আবেদন, সংশোধন, অনলাইন কপি ডাউনলোড ও প্রয়োজনীয় কাগজপত্রের বিস্তারিত নির্দেশিকা।",
    coverImage: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=1200",
    websiteUrl: "https://bdris.gov.bd",
    contactInfo: [
      { label: "হেল্পলাইন", value: "১৬১২২" },
      { label: "সেবামূল্য", value: "বয়স অনুযায়ী ২৫ থেকে ৫০ টাকা মাত্র" }
    ]
  },
  "nid-card": {
    title: "জাতীয় পরিচয়পত্র (NID) সেবা",
    description: "নতুন ভোটার নিবন্ধন, এনআইডি কার্ড সংশোধন, হারিয়ে যাওয়া কার্ড রি-ইস্যু ও অনলাইন ডাউনলোড সংক্রান্ত সকল তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=1200",
    websiteUrl: "https://services.nidw.gov.bd",
    contactInfo: [
      { label: "কল সেন্টার", value: "১০৫" },
      { label: "সময়সূচী", value: "রবি থেকে বৃহস্পতিবার সকাল ৯টা - বিকাল ৫টা" }
    ]
  },
  "passport": {
    title: "পাসপোর্ট আবেদন ও তথ্য",
    description: "ই-পাসপোর্টের নতুন আবেদন, ফি পরিশোধ, প্রয়োজনীয় দলিলপত্র এবং পাসপোর্ট সংক্রান্ত সকল নাগরিক নির্দেশিকা।",
    coverImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200",
    websiteUrl: "https://www.epassport.gov.bd",
    contactInfo: [
      { label: "সহায়তা ডেস্ক", value: "০৯৬১২১১৮২২২" },
      { label: "পেমেন্ট মাধ্যম", value: "এ-চালান, মোবাইল ব্যাংকিং" }
    ]
  },
  "trade-license": {
    title: "ট্রেড লাইসেন্স সেবা",
    description: "পুঠিয়া উপজেলায় নতুন ব্যবসা আরম্ভ করার জন্য ইউনিয়ন পরিষদ বা পৌরসভা থেকে ট্রেড লাইসেন্স গ্রহণ ও নবায়নের নিয়মাবলী।",
    coverImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "প্রদানকারী কর্তৃপক্ষ", value: "স্থানীয় ইউনিয়ন পরিষদ / পৌরসভা কার্যালয়" },
      { label: "প্রয়োজনীয় কাগজ", value: "জাতীয় পরিচয়পত্র, ব্যবসা প্রতিষ্ঠানের ভাড়ার চুক্তিপত্র" }
    ]
  },
  "restaurants": {
    title: "রেস্টুরেন্ট ও খাবার দোকান",
    description: "পুঠিয়ার সুস্বাদু খাবার এবং ঐতিহ্যবাহী মিষ্টির দোকান সহ সেরা মানের রেস্টুরেন্টের তালিকা ও যোগাযোগের মাধ্যম।",
    coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "বিশেষত্ব", value: "পুঠিয়ার ঐতিহ্যবাহী রাজবাড়ীর মিষ্টি ও দই" },
      { label: "পরিষেবা", value: "ডাইন-ইন, টেক-অ্যাওয়ে এবং হোম ডেলিভারি" }
    ]
  },
  "tour-packages": {
    title: "ট্যুর প্যাকেজ ও ভ্রমণ পরিকল্পনা",
    description: "পুঠিয়া রাজবাড়ী এবং এর আশেপাশের দর্শনীয় স্থান ঘুরে দেখার আকর্ষণীয় ডে-ট্যুর ও ফ্যামিলি প্যাকেজ।",
    coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "জনপ্রিয় ট্যুর", value: "ঐতিহাসিক পুঠিয়া মন্দির গ্রুপ হাফ-ডে ট্যুর" },
      { label: "বুকিং হটলাইন", value: "০১৭০০-০০০০০০" }
    ]
  },
  "govt-jobs": {
    title: "সরকারি চাকরির বিজ্ঞপ্তি",
    description: "পুঠিয়া উপজেলা এবং রাজশাহী জেলা সহ দেশব্যাপী সকল সরকারি নিয়োগ ও চাকরির সর্বশেষ তথ্য।",
    coverImage: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f71?auto=format&fit=crop&q=80&w=1200",
    websiteUrl: "http://www.mopa.gov.bd",
    contactInfo: [
      { label: "আপডেটের ধরণ", value: "দৈনিক ও সাপ্তাহিক বিজ্ঞপ্তি" },
      { label: "আবেদনের ধরণ", value: "অনলাইন টেলিটক পোর্টাল" }
    ]
  },
  "private-jobs": {
    title: "বেসরকারি ও কর্পোরেট চাকরি",
    description: "স্থানীয় এনজিও, ব্যাংক, বিপণন প্রতিষ্ঠান এবং বিভিন্ন বেসরকারি প্রতিষ্ঠানের সর্বশেষ চাকরির শূন্যপদ।",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "বিভাগ", value: "মার্কেটিং, ফাইন্যান্স, আইটি ও এডমিন" },
      { label: "যোগ্যতা", value: "এইচএসসি থেকে স্নাতকোত্তর পাস" }
    ]
  },
  "local-jobs": {
    title: "স্থানীয় নিয়োগ ও কাজ",
    description: "পুঠিয়ার স্থানীয় ব্যবসা প্রতিষ্ঠান, কল-কারখানা, শপিংমল ও সেবাখাতে খণ্ডকালীন বা পূর্ণকালীন কাজের খবর।",
    coverImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "ধরণ", value: "ডেলিভারি রাইডার, সেলসম্যান, ক্যাশিয়ার, ড্রাইভার" },
      { label: "যোগাযোগ", value: "সরাসরি ম্যানেজার বা মালিক পক্ষ" }
    ]
  },
  "internship": {
    title: "ইন্টার্নশিপ ও শিক্ষানবিস সুযোগ",
    description: "শিক্ষার্থী এবং নতুন গ্র্যাজুয়েটদের জন্য পুঠিয়ার বিভিন্ন ব্যাংক, এনজিও ও আইটি ফার্মে বাস্তব কাজের অভিজ্ঞতার সুযোগ।",
    coverImage: "https://images.unsplash.com/photo-1521791136368-1a46827d52bc?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "সময়কাল", value: "৩ মাস থেকে ৬ মাস" },
      { label: "সুবিধা", value: "অভিজ্ঞতার সার্টিফিকেট ও পকেট মানি" }
    ]
  },
  "freelancing": {
    title: "ফ্রিল্যান্সিং ও অনলাইন ক্যারিয়ার",
    description: "ফ্রিল্যান্সিং, আউটসোর্সিং এবং অনলাইন ইনকামের জন্য প্রয়োজনীয় গাইডলাইন, কাজের ধরন ও রিসোর্স।",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "কাজের ক্ষেত্র", value: "ওয়েব ডেভেলপমেন্ট, গ্রাফিক্স ডিজাইন, ডিজিটাল মার্কেটিং" },
      { label: "প্রয়োজনীয় দক্ষতা", value: "ইংরেজি যোগাযোগ, নির্দিষ্ট কারিগরি দক্ষতা" }
    ]
  },
  "business-ads": {
    title: "ব্যবসায়িক বিজ্ঞাপন ও প্রচার",
    description: "পুঠিয়ার যেকোনো ছোট-বড় ব্যবসার প্রচার বাড়াতে পোর্টালের মাধ্যমে আকর্ষণীয় ও স্বল্পমূল্যে বিজ্ঞাপনের সুবর্ণ সুযোগ।",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "বিজ্ঞাপন বিভাগ", value: "ব্যানার, সাইডবার ও স্পন্সরড পোস্ট" },
      { label: "যোগাযোগ করুন", value: "০১৭০০-১১২২৩৩" }
    ]
  },
  "special-offers": {
    title: "বিশেষ অফার ও ডিল",
    description: "পুঠিয়ার জনপ্রিয় ব্র্যান্ড, সুপারশপ এবং রেস্টুরেন্টগুলোর বর্তমান চলমান সকল বিশেষ অফারের তালিকা।",
    coverImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "ধরণ", value: "বাই ওয়ান গেট ওয়ান, উইকএন্ড ডিল" },
      { label: "বৈধতা", value: "সীমিত সময়ের অফার" }
    ]
  },
  "discounts": {
    title: "ডিসকাউন্ট ও ছাড়",
    description: "পোশাক, ইলেকট্রনিক্স ও সেবামূলক প্রতিষ্ঠানে পুঠিয়ার নাগরিকদের জন্য দেওয়া বিশেষ আকর্ষণীয় ডিসকাউন্টের খবরাখবর।",
    coverImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "ডিসকাউন্ট রেট", value: "১০% থেকে ৫০% পর্যন্ত ছাড়" },
      { label: "কুপন কোড", value: "পোর্টালে প্রদর্শিত প্রোমো কোড ব্যবহার করুন" }
    ]
  },
  "new-launch": {
    title: "নতুন উদ্বোধন",
    description: "পুঠিয়া উপজেলায় সম্প্রতি চালু হওয়া নতুন শোরুম, শপ, ডায়াগনস্টিক সেন্টার ও রেস্টুরেন্টের শুভ উদ্বোধনের খবর।",
    coverImage: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "উদ্বোধনী অফার", value: "উদ্বোধন উপলক্ষে বিশেষ আকর্ষণীয় উপহার" },
      { label: "স্থান", value: "পুঠিয়া বাজার, রাজবাড়ী গেট ও আশেপাশের এলাকা" }
    ]
  },
  "shop-rent": {
    title: "দোকান ও বাণিজ্যিক স্পেস ভাড়া",
    description: "ব্যবসা বা শোরুম স্থাপনের জন্য পুঠিয়ার ব্যস্ততম বাণিজ্যিক এলাকা ও শপিংমলগুলোতে দোকান ভাড়ার সর্বশেষ বিজ্ঞপ্তি।",
    coverImage: "https://images.unsplash.com/photo-1582034986517-30d183e77871?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "ধরণ", value: "গ্রাউন্ড ফ্লোর শপ, office স্পেস, গোডাউন" },
      { label: "পজিশন মানি", value: "আলোচনা সাপেক্ষে" }
    ]
  },
  "land-sale": {
    title: "জমি বিক্রি ও প্লট",
    description: "বাড়ি নির্মাণ, চাষাবাদ বা শিল্প কারখানা স্থাপনের জন্য পুঠিয়া এলাকায় নিষ্কণ্টক জমি কেনাবেচার নির্ভরযোগ্য তথ্যাবলী।",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "জমির ধরণ", value: "ভিটা, ধানি জমি, বাণিজ্যিক প্লট" },
      { label: "দলিলপত্র", value: "হালনাগাদ দাখিলা ও নামজারিসহ ১০০% নিষ্কণ্টক" }
    ]
  },
  "flat-sale": {
    title: "ফ্ল্যাট ও অ্যাপার্টমেন্ট বিক্রি",
    description: "পুঠিয়ার নিরাপদ ও আধুনিক আবাসিক এলাকাগুলোতে নতুন ও ব্যবহৃত রেডি ফ্ল্যাট বিক্রির আকর্ষণীয় বিজ্ঞপ্তি।",
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "আয়তন", value: "১০০০ থেকে ১৬০০ বর্গফুট" },
      { label: "ফিটিংস", value: "আধুনিক বাথরুম, কিচেন ক্যাবিনেট ও লিফট সুবিধা" }
    ]
  },
  "rain-forecast": {
    title: "বৃষ্টির পূর্বাভাস ও দুর্যোগ সতর্কতা",
    description: "পুঠিয়া উপজেলার জন্য লাইভ বৃষ্টিপাতের পূর্বাভাস, মেঘের গতিবিধি এবং বজ্রঝড় ও বন্যার সতর্কবার্তা।",
    coverImage: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "উৎস", value: "বাংলাদেশ আবহাওয়া অধিদপ্তর ও বৈশ্বিক স্যাটেলাইট ডাটা" },
      { label: "সতর্কতা লেভেল", value: "লাইভ আপডেট এবং নোটিফিকেশন" }
    ]
  },
  "doctors": {
    title: "ডাক্তার ও বিশেষজ্ঞ চেম্বার",
    description: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স এবং বিভিন্ন প্রাইভেট ক্লিনিকে বসা অভিজ্ঞ ডাক্তারদের তালিকা, সময়সূচী ও সিরিয়াল বুকিং নম্বর।",
    coverImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "বিশেষজ্ঞ", value: "মেডিসিন, শিশু, স্ত্রী রোগ ও কার্ডিওলজি" },
      { label: "বুকিং নম্বর", value: "০১৭০০-৩৩৪৪৫৫" }
    ]
  },
  "pharmacy": {
    title: "ফার্মেসি ও ঔষধের দোকান",
    description: "২৪ ঘণ্টা খোলা জরুরি লাইফ সেভিং ঔষধের দোকান, সরকারি মডেল ফার্মেসি এবং হোম ডেলিভারি সেবাদাতা ঔষধের দোকান।",
    coverImage: "https://images.unsplash.com/photo-1607619056574-7b8d304f3b24?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "সেবা", value: "২৪/৭ ইমার্জেন্সি মেডিসিন সাপোর্ট" },
      { label: "প্রেসক্রিপশন আপলোড", value: "ভাইবার বা হোয়াটসঅ্যাপে পাঠিয়ে অর্ডার করুন" }
    ]
  },
  "faq": {
    title: "সাধারণ জিজ্ঞাসা (FAQ)",
    description: "আমাদের পুঠিয়া ডিজিটাল সেবা পোর্টাল ব্যবহারের নিয়মাবলী এবং সাধারণ তথ্যাবলীর প্রশ্ন ও উত্তরমালা।",
    coverImage: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "সহায়তা ইমেইল", value: "support@amaderputhia.com" },
      { label: "কল সেন্টার", value: "০১৭০০-১১২২৩৩" }
    ]
  },
  "privacy": {
    title: "গোপনীয়তা নীতি (Privacy Policy)",
    description: "আমাদের পুঠিয়া অ্যাপ্লিকেশনটি ব্যবহারকারীদের ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা দিতে প্রতিশ্রুতিবদ্ধ। আমরা কীভাবে তথ্য সংগ্রহ ও সংরক্ষণ করি তার বিস্তারিত বিবরণ।",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "তথ্য সংগ্রহ নীতি", value: "কেবলমাত্র ইউজার রেজিস্ট্রেসন ও সেবামূলক ব্যবহারের জন্য প্রয়োজনীয় তথ্য" },
      { label: "নিরাপত্তা মানদণ্ড", value: "ফায়ারবেস এনক্রিপ্টেড ডাটা স্টোরেজ ও ওটিপি ভেরিফিকেশন" }
    ]
  },
  "terms": {
    title: "ব্যবহারের শর্তাবলী (Terms & Conditions)",
    description: "আমাদের পুঠিয়া সেবা পোর্টাল ব্যবহারের ক্ষেত্রে ব্যবহারকারী ও কর্তৃপক্ষের মধ্যে সম্মত শর্ত ও আইনী নিয়মাবলী।",
    coverImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "দায়বদ্ধতা", value: "বিজ্ঞাপন বা কেনাবেচার পূর্বে ব্যবহারকারীকে নিজস্ব দায়িত্বে সত্যতা যাচাই করতে হবে" },
      { label: "শর্ত পরিবর্তন", value: "কর্তৃপক্ষ যেকোনো সময়ে শর্তাবলীতে পরিবর্তন বা পরিমার্জন করতে পারে" }
    ]
  },
  "content-policy": {
    title: "Data & Content Policy",
    description: "পোর্টালে পোস্ট করা ছবি, বিজ্ঞাপন, সংবাদ এবং অন্যান্য তথ্যের সত্যতা, মান ও আইনী কপিরাইট নিশ্চিতকরণ সংক্রান্ত নীতিমালা।",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "নিষিদ্ধ কনটেন্ট", value: "যেকোনো বিভ্রান্তিকর, উস্কানিমূলক বা কপিরাইট লঙ্ঘিত তথ্য ও ছবি সম্পূর্ণ নিষিদ্ধ" },
      { label: "সংশোধন অনুরোধ", value: "কোনো ভুল বা কপিরাইটেড কনটেন্ট দেখলে দ্রুত রিপোর্ট বক্সে রিপোর্ট করুন" }
    ]
  },
  "download-app": {
    title: "অ্যান্ড্রয়েড অ্যাপ ডাউনলোড করুন",
    description: "আমাদের পুঠিয়া ডিজিটাল সেবা অ্যাপের অফিশিয়াল APK ফাইলটি সরাসরি ফোনে ইন্সটল করে লাইভ আপডেট ও পুশ নোটিফিকেশন পান যেকোনো মুহূর্তে।",
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1200",
    contactInfo: [
      { label: "সংস্করণ", value: "v২.৪.১ (সর্বশেষ আপডেট)" },
      { label: "ফাইলের আকার", value: "১২.৪ মেগাবাইট" }
    ]
  }
};

const GenericSubMenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<SubMenuPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug === 'video-gallery') {
      navigate('/video-gallery', { replace: true });
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (slug) {
          const data = await getSubMenuPage(slug);
          setPageData(data);
        }
      } catch (err) {
        console.error("Error fetching sub menu page:", err);
        setError("তথ্য লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 w-full flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-slate-600 font-bold animate-pulse">তথ্য লোড হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
        </main>
        <Footer />
        <BottomNavigation activeTab="services" onTabChange={() => {}} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 w-full flex flex-col items-center justify-center p-8">
          <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-rose-500/5 border border-rose-100 flex flex-col items-center text-center max-w-md">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">লোড করতে ব্যর্থ হয়েছে</h2>
            <p className="text-slate-500 font-bold mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </main>
        <Footer />
        <BottomNavigation activeTab="services" onTabChange={() => {}} />
      </div>
    );
  }

  if (
    slug === 'agriculture' ||
    slug === 'agriculture-office' ||
    slug === 'agriculture-consultation' ||
    slug === 'agriculture-fertilizer-seed' ||
    slug === 'agriculture-machinery' ||
    slug === 'agriculture-pesticides' ||
    slug === 'agriculture-crop-calendar' ||
    slug === 'agriculture-training' ||
    slug === 'agriculture-market' ||
    slug === 'agriculture-news'
  ) {
    return <Agriculture onGoBack={() => navigate(-1)} initialTab={slug} />;
  }
  if (
    slug === 'farm' || 
    slug === 'livestock-fisheries' || 
    slug === 'livestock-office' || 
    slug === 'veterinary-hospital' || 
    slug === 'fish-farming' || 
    slug === 'cattle-livestock' || 
    slug === 'poultry'
  ) {
    return <LivestockFisheries onGoBack={() => navigate(-1)} initialTab={slug} />;
  }
  if (slug === 'weather') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4">
          <WeatherUpdateInfo onGoBack={() => navigate(-1)} />
        </main>
        <Footer />
        <BottomNavigation activeTab="services" onTabChange={() => {}} />
      </div>
    );
  }

  const fallbackData = DUMMY_DATA[slug || ''] || {
    title: slug?.replace(/-/g, ' ').toUpperCase() || "বিস্তারিত তথ্য",
    description: "এই পেজটিতে বিস্তারিত তথ্য দেওয়া হয়েছে। খুব শিগগিরই এখানে আরও হালনাগাদ তথ্য যুক্ত করা হবে।",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
    contactInfo: []
  };

  const data = pageData || fallbackData;
  
  const renderCustomComponent = () => {
    switch (slug) {
      case 'unions': return <AdministrationUnions onGoBack={() => navigate(-1)} />;
      case 'tourism': return <TouristSpots onGoBack={() => navigate(-1)} />;
      case 'photo-gallery': return <PhotoVideoGallery onGoBack={() => navigate(-1)} />;
      case 'video-gallery': return <ServiceDirectoryTemplate serviceKeyParam="video" />;
      case 'hospital':
      case 'hospitals':
      case 'hospital-list': return <HospitalInfo onGoBack={() => navigate(-1)} />;
      case 'doctor':
      case 'doctors':
      case 'doctors-list': return <DoctorInfo onGoBack={() => navigate(-1)} />;
      case 'clinic':
      case 'specialist-chamber': return <ClinicInfo onGoBack={() => navigate(-1)} />;
      case 'pharmacy':
      case 'pharmacies': return <ServiceDirectoryTemplate serviceKeyParam="pharmacy" />;
      case 'diagnostic':
      case 'diagnostics':
      case 'diagnostic-center':
      case 'diagnostic-centers': return <DiagnosticInfo onGoBack={() => navigate(-1)} />;
      case 'ambulance': return <AmbulanceInfo onGoBack={() => navigate(-1)} />;
      case 'vaccination':
      case 'vaccination-center': return <VaccinationInfo onGoBack={() => navigate(-1)} />;
      case 'community-clinic': return <CommunityClinicInfo onGoBack={() => navigate(-1)} />;
      case 'media-hub': return <MediaHubInfo onGoBack={() => navigate(-1)} />;
      case 'journalist-list': return <MediaHubInfo onGoBack={() => navigate(-1)} initialTab="journalists" />;
      case 'local-newspapers': return <MediaHubInfo onGoBack={() => navigate(-1)} initialTab="newspapers" />;
      case 'online-portals': return <MediaHubInfo onGoBack={() => navigate(-1)} initialTab="portals" />;
      case 'tv-reps': return <MediaHubInfo onGoBack={() => navigate(-1)} initialTab="tv_representatives" />;
      case 'press-club': return <MediaHubInfo onGoBack={() => navigate(-1)} initialTab="press_club" />;
      case 'press-releases': return <MediaHubInfo onGoBack={() => navigate(-1)} initialTab="press_releases" />;
      case 'citizen-news': return <MediaHubInfo onGoBack={() => navigate(-1)} initialTab="citizen_news" />;
      case 'media-gallery': return <MediaHubInfo onGoBack={() => navigate(-1)} initialTab="gallery" />;
      case 'verified-business':
      case 'business-directory': return <VerifiedBusiness onGoBack={() => navigate(-1)} />;
      case 'shop':
      case 'shop-directory': return <LocalShopDirectoryInfo onGoBack={() => navigate(-1)} />;
      case 'supershop': return <SuperShopInfo onGoBack={() => navigate(-1)} />;
      case 'restaurant':
      case 'restaurants':
      case 'food':
      case 'dining': return <ServiceDirectoryTemplate serviceKeyParam="restaurant" />;
      case 'mistri':
      case 'mistris': return <MistriPage />;
      case 'hotel':
      case 'hotels':
      case 'resort':
      case 'resorts': return <ServiceDirectoryTemplate serviceKeyParam="hotel" />;
      case 'entrepreneur':
      case 'entrepreneurs': return <ServiceDirectoryTemplate serviceKeyParam="entrepreneur" />;
      case 'fire':
      case 'fire-service':
      case 'fire-services':
      case 'fire-station':
      case 'fire-stations': return <ServiceDirectoryTemplate serviceKeyParam="fire-service" />;
      case 'thana':
      case 'police':
      case 'police-station':
      case 'police-stations':
      case 'police-services': return <ServiceDirectoryTemplate serviceKeyParam="police" />;
      case 'lawyer':
      case 'lawyers':
      case 'advocate':
      case 'advocates': return <ServiceDirectoryTemplate serviceKeyParam="lawyer" />;
      case 'special-offers':
      case 'offers': return <SpecialOffersPage />;
      case 'reviews': return <ReviewsPage />;
      case 'add-business': return <AddBusinessInfo onGoBack={() => navigate(-1)} />;
      case 'finance': return <BankingFinance onGoBack={() => navigate(-1)} />;
      case 'insurance': return <InsuranceServices onGoBack={() => navigate(-1)} />;
      case 'education': return <EduInstInfo onGoBack={() => navigate(-1)} />;
      case 'school': return <SchoolInfo onGoBack={() => navigate(-1)} />;
      case 'college': return <CollegeInfo onGoBack={() => navigate(-1)} />;
      case 'madrasha': return <MadrashaInfo onGoBack={() => navigate(-1)} />;
      case 'university': return <UniversityInfo onGoBack={() => navigate(-1)} />;
      case 'coaching': return <CoachingInfo onGoBack={() => navigate(-1)} />;
      case 'admission': return <AdmissionInfo onGoBack={() => navigate(-1)} />;
      case 'results': return <ExamResultsInfo onGoBack={() => navigate(-1)} />;
      case 'scholarship': return <ScholarshipInfo onGoBack={() => navigate(-1)} />;
      case 'library': return <LibraryInfo onGoBack={() => navigate(-1)} />;
      case 'edu-office': return <EducationOfficeInfo onGoBack={() => navigate(-1)} />;
      case 'career': return <ServiceDirectoryTemplate serviceKeyParam="job" />;
      case 'local-jobs': return <ServiceDirectoryTemplate serviceKeyParam="job" />;
      case 'govt-jobs': return <ServiceDirectoryTemplate serviceKeyParam="job" />;
      case 'private-jobs': return <ServiceDirectoryTemplate serviceKeyParam="job" />;
      case 'internship': return <ServiceDirectoryTemplate serviceKeyParam="job" />;
      case 'freelancing': return <FreelancingResources onGoBack={() => navigate(-1)} />;
      case 'training': return <TrainingHub onGoBack={() => navigate(-1)} />;
      case 'volunteer': return <VolunteerNetwork onGoBack={() => navigate(-1)} />;
      case 'lost-found': return <LostAndFound onGoBack={() => navigate(-1)} />;
      case 'announcement': return <CommunityPrograms onGoBack={() => navigate(-1)} />;
      case 'mosque': return <MosqueInfo onGoBack={() => navigate(-1)} />;
      case 'eidgah': return <EidgahInfo onGoBack={() => navigate(-1)} />;
      case 'graveyard': return <GraveyardInfo onGoBack={() => navigate(-1)} />;
      case 'orphanage': return <OrphanageInfo onGoBack={() => navigate(-1)} />;
      case 'zakat': return <ZakatInfo onGoBack={() => navigate(-1)} />;
      case 'temple': return <TempleInfo onGoBack={() => navigate(-1)} />;
      case 'church': return <ChurchInfo onGoBack={() => navigate(-1)} />;
      case 'pagoda': return <PagodaInfo onGoBack={() => navigate(-1)} />;
      case 'religious': 
      case 'religious-institutions': return <VillageReligiousInfo onGoBack={() => navigate(-1)} />;
      case 'officers':
      case 'officer':
      case 'officer-directory': return <ServiceDirectoryTemplate serviceKeyParam="officers" />;
      case 'courier':
      case 'couriers':
      case 'courier-service': return <ServiceDirectoryTemplate serviceKeyParam="courier" />;
      case 'electricity':
      case 'rural-electricity':
      case 'rural_electricity':
      case 'power-office': return <ServiceDirectoryTemplate serviceKeyParam="electricity" />;
      case 'nursery':
      case 'nurseries':
      case 'nursery-plants': return <ServiceDirectoryTemplate serviceKeyParam="nursery" />;
      case 'tourist':
      case 'tourist-spots':
      case 'tourist-places':
      case 'sightseeing':
      case 'spots': return <ServiceDirectoryTemplate serviceKeyParam="tourism" />;
      case 'map':
      case 'official-map': return <OfficialMaps onGoBack={() => navigate(-1)} />;
      default: return null;
    }
  };
  
  const customComponent = renderCustomComponent();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className={`flex-1 w-full max-w-7xl mx-auto ${customComponent ? 'pt-0 pb-8' : 'py-8'}`}>
        {!customComponent && (
          <div className="mb-4 px-4">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all text-sm"
            >
              ফিরে যান
            </button>
          </div>
        )}
        {customComponent ? customComponent : (
        <SubMenuDetailLayout 
          title={data.title}
          description={data.description}
          coverImage={data.coverImage}
          mapLocation={data.mapLocation}
          callNumber={data.callNumber}
          websiteUrl={data.websiteUrl}
          facebookUrl={data.facebookUrl}
          photoGallery={data.photoGallery || []}
          contactInfo={data.contactInfo || []}
        />
        )}
      </main>
      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default GenericSubMenuPage;
