import { useState, useMemo } from 'react';
import { GlobalFilterState, INITIAL_FILTER_STATE } from './types';
import { calculateMatchScore } from '../../../utils/performanceCache';

// Haversine formula distance calculation in kilometers
function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CATEGORY_ALIAS_MAP: Record<string, string[]> = {
  medicine: ['মেডিসিন', 'মেডিসিন বিশেষজ্ঞ', 'medicine', 'ইন্টারনাল', 'internal medicine'],
  child: ['শিশু বিশেষজ্ঞ', 'শিশু', 'শিশু রোগ', 'নবজাতক', 'pediatric', 'পেডিয়াট্রিক', 'child', 'pediatrics'],
  gynae: ['গাইনী ও প্রসূতি', 'গাইনি ও প্রসূতি', 'গাইনী', 'গাইনি', 'প্রসূতি', 'স্ত্রী', 'gynecology', 'gynae', 'obs', 'obstetrics'],
  surgery: ['সার্জারি', 'সার্জন', 'জেনারেল সার্জারি', 'ল্যাপারোস্কোপিক', 'surgery', 'surgeon'],
  cardiology: ['হৃদরোগ', 'কার্ডিওলজি', 'হার্ট', 'কার্ডিয়াক', 'cardiology', 'heart', 'cardiac'],
  eye: ['চক্ষু', 'চোখ', 'চক্ষু রোগ', 'চক্ষু বিশেষজ্ঞ', 'আই', 'eye', 'ophthalmology', 'ophthalmologist'],
  dental: ['দাঁত', 'দন্ত', 'ডেন্টাল', 'দন্তরোগ', 'দন্ত বিশেষজ্ঞ', 'dental', 'dentist'],
  skin: ['চর্মরোগ', 'চর্ম', 'যৌন', 'চর্ম ও যৌন', 'ডার্মাটোলজি', 'ডার্মাটোলজিস্ট', 'skin', 'dermatology'],
  orthopedics: ['অর্থোপেডিক', 'অর্থোপেডিক্স', 'হাড়', 'হাড়-জোড়', 'পঙ্গু', 'orthopedic', 'orthopedics'],
  ent: ['নাক-কান-গলা', 'নাক', 'কান', 'গলা', 'ent', 'ইএনটি', 'ই.এন.টি', 'otolaryngology'],
  mental: ['মানসিক স্বাস্থ্য', 'মানসিক রোগ', 'মানসিক', 'সাইকিয়াট্রি', 'সাইকিয়াট্রি', 'মনোবিজ্ঞান', 'psychiatry', 'mental'],
  'kidney-urology': ['কিডনি ও মূত্ররোগ', 'কিডনি রোগ', 'কিডনি', 'মূত্ররোগ', 'নেফ্রোলজি', 'ইউরোলজি', 'kidney-urology', 'kidney', 'urology', 'nephrology'],
  'liver-gastro': ['লিভার ও পরিপাকতন্ত্র', 'গ্যাস্ট্রোএন্টারোলজি ও লিভার', 'লিভার', 'পরিপাকতন্ত্র', 'গ্যাস্ট্রো', 'liver-gastro', 'gastroenterology', 'hepatology', 'liver', 'gastro'],
  bus: ['বাস', 'বাসের সময়সূচী', 'লোকাল বাস', 'bus'],
  train: ['ট্রেন', 'ট্রেনের সময়সূচী', 'train'],
  auto_rickshaw: ['অটোরিকশা', 'অটো', 'auto_rickshaw', 'auto'],
  cng: ['সিএনজি', 'cng'],
  rickshaw: ['রিকশা', 'rickshaw'],
  van: ['ভ্যান', 'van'],
  microbus: ['মাইক্রোবাস', 'microbus'],
  car_taxi: ['ট্যাক্সি', 'কার', 'ট্যাক্সি/কার', 'car_taxi', 'taxi', 'car'],
  ambulance: ['অ্যাম্বুলেন্স', 'এ্যাম্বুলেন্স', 'ambulance'],
  truck_goods: ['ট্রাক', 'পণ্য পরিবহন', 'পিকআপ', 'ট্রাক/পণ্য পরিবহন', 'truck_goods', 'truck'],
  watercraft: ['নৌযান', 'নৌকা', 'ট্রলার', 'স্পিডবোট', 'watercraft'],
  rental_car: ['ভাড়া গাড়ি', 'গাড়ি ভাড়া', 'rental_car', 'rental'],
  driver_service: ['ড্রাইভিং সেবা', 'ড্রাইভার', 'driver_service', 'driver'],
  police: ['পুলিশ', 'থানা', '৯৯৯', 'police'],
  fire: ['ফায়ার সার্ভিস', 'ফায়ার সার্ভিস', 'fire'],
  women_children: ['নারী ও শিশু সহায়তা', 'নারী', 'শিশু', '১০৯', '১০৯৮', 'women_children'],
  electricity: ['বিদ্যুৎ জরুরি সেবা', 'বিদ্যুৎ', 'পল্লী বিদ্যুৎ', 'electricity'],
  gas: ['গ্যাস জরুরি সেবা', 'গ্যাস', 'gas'],
  road_accident: ['সড়ক/দুর্ঘটনা', 'সড়ক', 'দুর্ঘটনা', 'road_accident', 'accident'],
  waterway: ['নৌ/জলপথ জরুরি সেবা', 'নৌ', 'জলপথ', 'waterway'],
  disaster: ['দুর্যোগ ও উদ্ধার', 'দুর্যোগ', 'উদ্ধার', 'disaster'],
  grocery: ['মুদি দোকান', 'মুদি', 'grocery', 'জেনারেল স্টোর', 'shop_grocery'],
  restaurant: ['রেস্টুরেন্ট', 'খাবার দোকান', 'ফাস্টফুড', 'রেস্তোরাঁ', 'restaurant', 'food'],
  hotel: ['হোটেল', 'আবাসিক', 'ক্যাফে', 'hotel', 'resort'],
  pharmacy: ['ফার্মেসি', 'ফার্মেসী', 'ঔষধ', 'pharmacy', 'medicine_shop'],
  clothing_fashion: ['কাপড় ও ফ্যাশন', 'কাপড়', 'পোশাক', 'ফ্যাশন', 'টেইলার্স', 'clothing', 'fashion', 'garments'],
  electronics: ['ইলেকট্রনিক্স', 'ইলেকট্রিক', 'electronics', 'electric'],
  mobile_computer: ['মোবাইল ও কম্পিউটার', 'মোবাইল', 'কম্পিউটার', 'আইটি', 'mobile', 'computer', 'it'],
  hardware_construction: ['হার্ডওয়্যার ও নির্মাণ', 'হার্ডওয়্যার', 'হার্ডওয়্যার', 'নির্মাণ', 'রড', 'সিমেন্ট', 'স্যানিটারি', 'hardware', 'construction'],
  furniture: ['ফার্নিচার', 'আসবাবপত্র', 'furniture'],
  agro_supplies: ['কৃষি ও কৃষি উপকরণ', 'কৃষি', 'সার', 'বীজ', 'কীটনাশক', 'agro', 'agriculture'],
  nursery_plants: ['নার্সারি ও গাছপালা', 'নার্সারি', 'গাছপালা', 'চারা', 'nursery', 'plants'],
  beauty_salon: ['বিউটি পার্লার ও সেলুন', 'বিউটি পার্লার', 'সেলুন', 'পার্লার', 'beauty', 'salon', 'parlor'],
  vehicles_motorcycles: ['গাড়ি ও মোটরসাইকেল', 'গাড়ি', 'মোটরসাইকেল', 'বাইক', 'শোরুম', 'vehicles', 'motorcycle', 'bike'],
  garage_repair: ['গ্যারেজ ও মেরামত', 'গ্যারেজ', 'মেরামত', 'ওয়ার্কশপ', 'garage', 'repair', 'workshop'],
  bakery_food: ['বেকারি ও খাবার', 'বেকারি', 'কনফেকশনারি', 'মিষ্টি', 'খাবার', 'bakery', 'sweet'],
  stationery_books: ['স্টেশনারি ও বই', 'স্টেশনারি', 'বই', 'লাইব্রেরি', 'লাইব্রেরী', 'stationery', 'books'],
  photocopy_printing: ['ফটোকপি ও প্রিন্টিং', 'ফটোকপি', 'প্রিন্টিং', 'কম্পোজ', 'photocopy', 'printing'],
  courier_parcel: ['কুরিয়ার ও পার্সেল', 'কুরিয়ার', 'পার্সেল', 'courier', 'parcel'],
  banking_finance: ['ব্যাংক ও আর্থিক প্রতিষ্ঠান', 'ব্যাংক', 'আর্থিক', 'এনজিও', 'বিকাশ', 'নগদ', 'bank', 'banking', 'finance'],
  insurance: ['বীমা', 'ইনসিওরেন্স', 'insurance'],
  travel_tourism: ['ট্রাভেল ও ট্যুরিজম', 'ট্রাভেল', 'ট্যুরিজম', 'ট্রাভেলস', 'টিকিট', 'travel', 'tourism'],
  educational_institutions: ['শিক্ষা প্রতিষ্ঠান', 'স্কুল', 'কলেজ', 'মাদ্রাসা', 'কোচিং', 'school', 'college', 'education'],
  private_org: ['বেসরকারি প্রতিষ্ঠান', 'অফিস', 'কোম্পানি', 'private', 'office'],
  others: ['অন্যান্য', 'অন্যান্য ব্যবসা', 'others', 'other'],
  flat_house: ['বাসা/ফ্ল্যাট', 'বাসা', 'ফ্ল্যাট', 'ফ্যামিলি', 'flat', 'house', 'family'],
  single_room: ['রুম', 'এক রুম', 'room', 'single_room'],
  mess: ['মেস', 'mess'],
  student_mess: ['ছাত্র/ছাত্রী মেস', 'ছাত্র মেস', 'ছাত্রী মেস', 'student_mess', 'student'],
  shop: ['দোকান', 'shop', 'store'],
  office: ['পল্লী বিদ্যুৎ অফিস', 'অফিস', 'অফিস স্পেস', 'পল্লী বিদ্যুৎ', 'জোনাল অফিস', 'সাব-স্টেশন', 'office'],
  warehouse: ['গুদাম', 'গুদামঘর', 'warehouse', 'godown'],
  land: ['জমি', 'প্লট', 'land', 'plot'],
  full_house: ['বাড়ি', 'বাড়ী', 'full_house', 'house'],
  commercial_space: ['কমার্শিয়াল স্পেস', 'কমার্শিয়াল', 'commercial_space', 'commercial'],
  event_hall: ['হল/অনুষ্ঠান কেন্দ্র', 'হল', 'কম্যুনিটি সেন্টার', 'event_hall', 'hall'],
  garage_parking: ['গ্যারেজ/পার্কিং', 'গ্যারেজ', 'পার্কিং', 'garage', 'parking'],
  mobile_tablet: ['মোবাইল ও ট্যাব', 'মোবাইল', 'ট্যাব', 'ফোন', 'মোবাইল ও ট্যাব', 'mobile_tablet', 'mobile', 'tablet', 'phone'],
  computer_laptop: ['কম্পিউটার ও ল্যাপটপ', 'কম্পিউটার', 'ল্যাপটপ', 'মনিটর', 'পিসি', 'computer_laptop', 'computer', 'laptop', 'pc'],
  motorcycle: ['মোটরসাইকেল', 'বাইক', 'পালসার', 'ডিসকভার', 'মোটরসাইকেল', 'motorcycle', 'bike', 'motorcycle'],
  car: ['গাড়ি', 'গাড়ী', 'কার', 'প্রাইভেটকার', 'car'],
  bicycle: ['সাইকেল', 'বাইসাইকেল', 'সাইকেল', 'bicycle', 'cycle'],
  home_appliance: ['ইলেকট্রিক/হোম অ্যাপ্লায়েন্স', 'ফ্রিজ', 'টিভি', 'ওভেন', 'ব্লেন্ডার', 'home_appliance', 'appliance'],
  books_education: ['বই ও শিক্ষা', 'বই', 'গাইড', 'শিক্ষা', 'books_education', 'books', 'education'],
  household: ['গৃহস্থালি পণ্য', 'গৃহস্থালি', 'পণ্য', 'household'],
  business_equipment: ['ব্যবসায়িক সরঞ্জাম', 'সরঞ্জাম', 'মেশিন', 'ব্যবসায়িক', 'business_equipment', 'machinery'],
  kids: ['শিশুদের পণ্য', 'বাচ্চাদের খেলনা', 'খেলনা', 'বেবি', 'kids', 'baby', 'toys'],
  animals_pets: ['পশু-পাখি', 'গরু', 'ছাগল', 'বিড়াল', 'পাখি', 'কবুতর', 'animals_pets', 'pets', 'animals'],
  sports: ['খেলাধুলার সামগ্রী', 'ব্যাট', 'বল', 'ফুটবল', 'ক্রিকেট', 'খেলাধুলা', 'sports'],
  jobs_services: ['চাকরি/সেবা', 'চাকরি', 'চাকরী', 'সেবা', 'সার্ভিস', 'jobs_services', 'jobs', 'service'],
  'puthia-news': ['পুঠিয়ার খবর', 'খবর', 'সংবাদ', 'news', 'puthia-news'],
  'puthia-history': ['পুঠিয়ার ইতিহাস', 'ইতিহাস', 'history', 'ঐতিহাসিক', 'puthia-history'],
  'heritage-sites': ['ঐতিহ্য ও স্থাপনা', 'ঐতিহ্য', 'স্থাপনা', 'প্রত্নতত্ত্ব', 'রাজবাড়ি', 'রাজবাড়ী', 'মন্দির', 'heritage-sites', 'heritage'],
  tourism: ['পর্যটন', 'দর্শনীয় স্থান', 'দর্শনীয় স্থান', 'ভ্রমণ', 'tourism', 'tourist'],
  'mela-festivals': ['মেলা ও উৎসব', 'মেলা', 'উৎসব', 'উৎসব ও মেলা', 'festival', 'mela-festivals'],
  religious: ['ধর্মীয় অনুষ্ঠান', 'ধর্মীয় অনুষ্ঠান', 'ধর্মীয়', 'ধর্মীয়', 'religious'],
  educational: ['শিক্ষামূলক', 'শিক্ষা', 'সচেতনতা', 'education', 'educational'],
  agriculture: ['কৃষি', 'কৃষি মেলা', 'চাষ', 'আমের হাট', 'agriculture', 'agro'],
  'local-events': ['স্থানীয় অনুষ্ঠান', 'স্থানীয় অনুষ্ঠান', 'অনুষ্ঠান', 'local-events'],
  interview: ['সাক্ষাৎকার', 'interview'],
  awareness: ['সচেতনতামূলক', 'সচেতনতা', 'awareness'],
  'nature-lifestyle': ['প্রকৃতি ও জীবনযাপন', 'প্রকৃতি', 'জীবনযাপন', 'nature-lifestyle', 'nature'],
  national: ['জাতীয় কুরিয়ার', 'জাতীয়', 'national'],
  'inter-district': ['আন্তঃজেলা কুরিয়ার', 'আন্তঃজেলা', 'inter-district', 'interdistrict'],
  local: ['লোকাল কুরিয়ার', 'লোকাল', 'local'],
  parcel: ['পার্সেল ডেলিভারি', 'পার্সেল', 'parcel'],
  document: ['ডকুমেন্ট ডেলিভারি', 'ডকুমেন্ট', 'document'],
  ecommerce: ['ই-কমার্স ডেলিভারি', 'ই-কমার্স', 'ecommerce', 'e-commerce'],
  'home-delivery': ['হোম ডেলিভারি', 'হোম', 'home-delivery', 'homedelivery'],
  express: ['এক্সপ্রেস/জরুরি ডেলিভারি', 'এক্সপ্রেস', 'জরুরি ডেলিভারি', 'express'],
  cod: ['ক্যাশ অন ডেলিভারি (COD)', 'ক্যাশ অন ডেলিভারি', 'সিওডি', 'cod', 'cash on delivery'],
  'pickup-drop': ['পিকআপ ও ড্রপ-অফ', 'পিকআপ', 'ড্রপ-অফ', 'ড্রপ', 'pickup-drop', 'pickup', 'drop'],
  'new-connection': ['নতুন বিদ্যুৎ সংযোগ', 'নতুন সংযোগ', 'নতুন মিটার', 'বিদ্যুৎ সংযোগ', 'new-connection', 'connection'],
  bill: ['বিদ্যুৎ বিল', 'কারেন্ট বিল', 'বিল', 'বিলিং', 'bill'],
  'bill-pay': ['বিল পরিশোধ', 'বিল পে', 'বিকাশ বিদ্যুৎ বিল', 'বিল প্রদান', 'bill-pay', 'payment'],
  'meter-services': ['মিটার সংক্রান্ত সেবা', 'মিটার', 'মিটার পরিবর্তন', 'মিটার টেস্ট', 'পোস্টপেইড মিটার', 'প্রিপেইড মিটার', 'meter-services', 'meter'],
  'meter-reading': ['মিটার রিডিং', 'রিডিং', 'মিটার রিডার', 'meter-reading', 'reading'],
  'disconnection-reconnection': ['বিদ্যুৎ সংযোগ বিচ্ছিন্ন/পুনঃসংযোগ', 'বিচ্ছিন্ন', 'পুনঃসংযোগ', 'সংযোগ বিচ্ছিন্ন', 'disconnection-reconnection', 'reconnection'],
  'power-outage': ['বিদ্যুৎ বিভ্রাট', 'লোডশেডিং', 'কারেন্ট নাই', 'বিভ্রাট', 'outage', 'power-outage'],
  'emergency-complaint': ['জরুরি অভিযোগ', 'অভিযোগ কেন্দ্র', 'কমপ্লেইন', 'জরুরি', 'হটলাইন', 'emergency-complaint', 'complaint'],
  'line-pole-issue': ['লাইন/খুঁটি সমস্যা', 'খুঁটি', 'তার ছেঁড়া', 'লাইন সমস্যা', 'খুঁটি হেলে পড়া', 'line-pole-issue', 'pole', 'line'],
  'transformer-issue': ['ট্রান্সফরমার সমস্যা', 'ট্রান্সফরমার', 'ট্রান্সফরমার বিকল', 'ট্রান্সফরমার পরিবর্তন', 'transformer-issue', 'transformer'],
  'low-voltage': ['লো-ভোল্টেজ অভিযোগ', 'লো ভোল্টেজ', 'ভোল্টেজ কম', 'low-voltage', 'voltage'],
  'illegal-connection': ['বিদ্যুৎ চুরি/অবৈধ সংযোগ অভিযোগ', 'বিদ্যুৎ চুরি', 'অবৈধ সংযোগ', 'হুকিং', 'অবৈধ লাইন', 'illegal-connection'],
  'fruit-plants': ['ফলজ গাছ', 'ফলদ গাছ', 'ফল গাছ', 'ফল', 'আম', 'লিচু', 'পেয়ারা', 'পেয়ারা', 'fruit-plants', 'fruit'],
  'flower-plants': ['ফুলের গাছ', 'ফুল গাছ', 'ফুল', 'গোলাপ', 'বেলি', 'টগর', 'flower-plants', 'flower'],
  'forest-trees': ['বনজ গাছ', 'বনজ ও কাষ্ঠল চারা', 'মেহগনি', 'সেগুন', 'কাঠ গাছ', 'বনজ', 'কাষ্ঠল গাছ', 'forest-trees', 'forest'],
  'medicinal-plants': ['ঔষধি গাছ', 'ভেষজ গাছ', 'ভেষজ ও ঔষধি গাছ', 'ঔষধি', 'ভেষজ', 'তুলসী', 'নিম', 'অর্জুন', 'medicinal-plants', 'medicinal', 'herbal'],
  'vegetable-seedlings': ['সবজি ও চারা', 'সবজি চারা', 'টমেটো চারা', 'মরিচ চারা', 'বেগুন চারা', 'শাকসবজি চারা', 'vegetable-seedlings', 'vegetable'],
  'ornamental-plants': ['শোভাবর্ধক গাছ', 'শোভাবর্ধনকারী ও ফুল গাছ', 'শোভাবর্ধনকারী', 'শোভাবর্ধক', 'ornamental-plants', 'ornamental'],
  'indoor-plants': ['ইনডোর প্ল্যান্ট', 'ইনডোর প্ল্যান্টস', 'মানি প্ল্যান্ট', 'ঘর সাজানোর গাছ', 'indoor-plants', 'indoor'],
  'palm-dates': ['পাম ও খেজুরজাতীয়', 'পাম ও খেজুরজাতীয়', 'পাম গাছ', 'খেজুর গাছ', 'তাল গাছ', 'সুপারি গাছ', 'palm-dates', 'palm'],
  bonsai: ['বনসাই', 'বনসাই গাছ', 'bonsai'],
  'seeds-seedlings': ['বীজ ও চারা', 'বীজ', 'চারা', 'ধান বীজ', 'ঘাসের বীজ', 'হাইব্রিড বীজ', 'seeds-seedlings', 'seeds'],
  'gardening-tools': ['বাগান সামগ্রী', 'টব', 'কাঁচি', 'স্প্রে বোতল', 'বাগান সরঞ্জাম', 'gardening-tools', 'tools'],
  'organic-fertilizer-soil': ['জৈব সার ও মাটি', 'জৈব সার', 'ভার্মিকম্পোস্ট', 'মাটি', 'কোকোপিট', 'কম্পোস্ট', 'organic-fertilizer-soil', 'fertilizer', 'soil'],
  'plant-care-service': ['গাছের পরিচর্যা সেবা', 'গাছের পরিচর্যা', 'বাগান পরিচর্যা', 'গাছ কাটিং', 'স্প্রে সেবা', 'plant-care-service', 'plant-care'],
  'historical-places': ['ঐতিহাসিক স্থান', 'ঐতিহাসিক', 'ইতিহাস', 'historical-places', 'historical'],
  'archaeological-sites': ['প্রত্নতাত্ত্বিক স্থান', 'প্রত্নতাত্ত্বিক', 'প্রত্নতত্ত্ব', 'খনন', 'archaeological-sites', 'archaeology'],
  'rajbari-palace': ['রাজবাড়ি ও প্রাসাদ', 'রাজবাড়ি', 'রাজবাড়ী', 'প্রাসাদ', 'প্যালেস', 'হেমন্তকুমারী', 'পাঁচআনি', 'rajbari-palace', 'palace', 'rajbari'],
  'temple-religious': ['মন্দির ও ধর্মীয় স্থাপনা', 'মন্দির', 'ধর্মীয় স্থাপনা', 'শিব মন্দির', 'গোবিন্দ মন্দির', 'দোল মন্দির', 'রথ মন্দির', 'temple-religious', 'temple'],
  'ancient-architecture': ['পুরাকীর্তি ও স্থাপত্য', 'পুরাকীর্তি', 'স্থাপত্য', 'টেরাকোটা', 'টেরাকোটা ফলক', 'কারুকার্য', 'ancient-architecture', 'architecture'],
  museum: ['জাদুঘর', 'মিউজিয়াম', 'স্মারক সংগ্রহশালা', 'museum'],
  'park-recreation': ['পার্ক ও বিনোদন কেন্দ্র', 'পার্ক', 'বিনোদন কেন্দ্র', 'গার্ডেন', 'বাগান', 'শিশু পার্ক', 'park-recreation', 'park'],
  'lakes-ponds': ['দিঘি, পুকুর ও জলাশয়', 'দিঘি', 'দীঘি', 'পুকুর', 'জলাশয়', 'লেক', 'হ্রদ', 'শিব সাগর', 'শ্যামসাগর', 'lakes-ponds', 'lake', 'pond'],
  'natural-spots': ['প্রাকৃতিক স্থান', 'প্রকৃতি', 'গাছপালা', 'বনানী', 'natural-spots', 'nature'],
  'river-riverbanks': ['নদী ও নদীর পাড়', 'নদী', 'নদীর পাড়', 'মুসা খাঁ নদী', 'নদী ঘাট', 'ঘাট', 'river-riverbanks', 'river'],
  'picnic-entertainment': ['বিনোদন ও পিকনিক স্পট', 'পিকনিক স্পট', 'পিকনিক', 'বিনোদন', 'বনভোজন', 'picnic-entertainment', 'picnic'],
  'rural-heritage': ['গ্রামবাংলার দর্শনীয় স্থান', 'গ্রামবাংলা', 'গ্রামীণ ঐতিহ্য', 'পল্লী প্রকৃতি', 'ঐতিহ্যবাহী গ্রাম', 'rural-heritage', 'heritage'],
  'bengali-food': ['বাংলা খাবার', 'বাংলা হোটেল', 'ভাত', 'মাছ-ভাত', 'ভর্তা', 'ডাল', 'দেশি খাবার', 'bengali-food', 'bengali'],
  'fast-food': ['ফাস্ট ফুড', 'ফাস্টফুড', 'বার্গার', 'পিজ্জা', 'স্যান্ডউইচ', 'ফ্রাইড চিকেন', 'fast-food', 'fastfood'],
  'biryani-kacchi': ['বিরিয়ানি ও কাচ্চি', 'বিরিয়ানি', 'কাচ্চি', 'কাচ্চি বিরিয়ানি', 'তেহারি', 'মোরগ পোলাও', 'বিরিয়ানি', 'biryani-kacchi', 'biryani', 'kacchi'],
  chinese: ['চাইনিজ', 'চায়নিজ', 'চাউমিন', 'ফ্রাইড রাইস', 'স্যুপ', 'নুডুলস', 'chinese'],
  indian: ['ইন্ডিয়ান', 'ভারতীয় খাবার', 'দোসা', 'নান', 'রুটি', 'বাটার চিকেন', 'মশলা দোসা', 'indian'],
  'cafe-coffee': ['ক্যাফে ও কফি শপ', 'ক্যাফে', 'কফি শপ', 'কফি', 'ক্যাপুচিনো', 'চা-কফি', 'cafe-coffee', 'cafe', 'coffee'],
  'bakery-sweets': ['বেকারি ও মিষ্টান্ন', 'বেকারি', 'মিষ্টান্ন', 'মিষ্টি', 'দই', 'কেক', 'পেস্ট্রি', 'রসগোল্লা', 'চমচম', 'মিষ্টির দোকান', 'bakery-sweets', 'bakery', 'sweets'],
  'grill-bbq': ['গ্রিল ও বারবিকিউ', 'গ্রিল', 'বারবিকিউ', 'চিকেন গ্রিল', 'শিক কাবাব', 'কাবাব', 'বিবিকিউ', 'grill-bbq', 'grill', 'bbq'],
  'fuchka-street-food': ['ফুচকা ও স্ট্রিট ফুড', 'ফুচকা', 'চটপটি', 'ভেলপুরি', 'স্ট্রিট ফুড', 'ঝালমুড়ি', 'fuchka-street-food', 'fuchka', 'street-food'],
  'tea-snacks': ['চা ও নাস্তা', 'চা', 'নাস্তা', 'টং', 'পরোটা', 'সিংগাড়া', 'সমুচা', 'পুরি', 'চা-নাস্তা', 'tea-snacks', 'tea', 'snacks'],
  'family-restaurant': ['ফ্যামিলি রেস্টুরেন্ট', 'ফ্যামিলি ডাইনিং', 'পরিবার রেস্টুরেন্ট', 'পার্টি সেন্টার', 'family-restaurant', 'family'],
  'hotel-restaurant': ['হোটেল রেস্টুরেন্ট', 'হোটেল', 'আবাসিক হোটেল রেস্তোরাঁ', 'খাবার হোটেল', 'hotel-restaurant'],
  'online-delivery': ['অনলাইন/হোম ডেলিভারি', 'অনলাইন ডেলিভারি', 'হোম ডেলিভারি', 'পার্সেল', 'ফুড ডেলিভারি', 'online-delivery', 'delivery'],
  'residential-hotel': ['আবাসিক হোটেল', 'আবাসিক', 'হোটেল', 'residential-hotel', 'residential'],
  'budget-hotel': ['বাজেট হোটেল', 'বাজেট', 'কম খরচে', 'স্বল্পমূল্যে', 'budget-hotel', 'budget'],
  'family-hotel': ['ফ্যামিলি হোটেল', 'পারিবারিক', 'ফ্যামিলি স্যুট', 'family-hotel', 'family'],
  'luxury-hotel': ['লাক্সারি হোটেল', 'লাক্সারি', 'অভিজাত', 'ডিলাক্স', 'luxury-hotel', 'luxury'],
  'guest-house': ['গেস্ট হাউস', 'গেস্ট হাউজ', 'অতিথিশালা', 'ডাকবাংলো', 'রেস্ট হাউস', 'guest-house', 'guesthouse'],
  resort: ['রিসোর্ট', 'ইকো রিসোর্ট', 'বাগান বাড়ি', 'resort'],
  motel: ['মোটেল', 'হাইওয়ে মোটেল', 'motel'],
  cottage: ['কটেজ', 'কাঠের কটেজ', 'ভিলা', 'cottage'],
  'residential-lodge': ['আবাসিক লজ', 'লজ', 'বোর্ডিং', 'আবাসন লজ', 'residential-lodge', 'lodge'],
  'event-convention-hotel': ['বিবাহ/অনুষ্ঠান সুবিধাসহ হোটেল', 'কনভেনশন', 'কমিউনিটি সেন্টার', 'বিবাহ', 'অনুষ্ঠান', 'কনফারেন্স', 'event-convention-hotel', 'convention', 'event'],
  'model-pharmacy': ['মডেল ফার্মেসি', 'মডেল ড্রাগ শপ', 'মডেল ফার্মা', 'এ-গ্রেড ফার্মাসিস্ট', 'model-pharmacy', 'model'],
  'hospital-attached-pharmacy': ['হাসপাতাল সংযুক্ত ফার্মেসি', 'হাসপাতাল সংলগ্ন', 'ক্লিনিক ফার্মেসি', 'স্বাস্থ্য কমপ্লেক্স ফার্মেসি', 'hospital-attached-pharmacy', 'hospital'],
  '24-hours-pharmacy': ['২৪ ঘণ্টার ফার্মেসি', '২৪ ঘণ্টা খোলা', 'রাত-দিন খোলা', 'জরুরি ওষুধ', 'নাইট ফার্মেসি', '24-hours-pharmacy', '24h', 'night'],
  'home-delivery-pharmacy': ['হোম ডেলিভারি ফার্মেসি', 'ওষুধ ডেলিভারি', 'হোম ডেলিভারি', 'অনলাইন ফার্মেসি', 'home-delivery-pharmacy', 'delivery'],
  'unani-pharmacy': ['ইউনানি ফার্মেসি', 'ইউনানি', 'দাওয়াখানা', 'হামদর্দ', 'হাকিমী', 'ইউনানি চিকিৎসা', 'unani-pharmacy', 'unani'],
  'ayurvedic-pharmacy': ['আয়ুর্বেদিক ফার্মেসি', 'আয়ুর্বেদিক', 'ভেষজ ওষুধ', 'সাধনা ঔষধালয়', 'শক্তি ঔষধালয়', 'কবিরাজি', 'ayurvedic-pharmacy', 'ayurvedic'],
  'homeopathic-pharmacy': ['হোমিওপ্যাথিক ফার্মেসি', 'হোমিও ফার্মেসি', 'হোমিওপ্যাথি', 'জার্মান হোমিও', 'homeopathic-pharmacy', 'homeo', 'homeopathy'],
  'veterinary-pharmacy': ['ভেটেরিনারি ওষুধের দোকান', 'পশু পাখির ওষুধ', 'ভেটেরিনারি', 'গরু-ছাগলের ওষুধ', 'পোল্ট্রি মেডিসিন', 'প্রাণিসম্পদ', 'veterinary-pharmacy', 'veterinary'],
  'business-entrepreneur': ['ব্যবসায়ী উদ্যোক্তা', 'ব্যবসায়ী', 'ব্যবসায়ী উদ্যোক্তা', 'ব্যবসা', 'business-entrepreneur', 'business'],
  'agro-entrepreneur': ['কৃষি উদ্যোক্তা', 'কৃষি', 'কৃষিজাত', 'খামার', 'এগ্রো', 'agro-entrepreneur', 'agro', 'agriculture'],
  'women-entrepreneur': ['নারী উদ্যোক্তা', 'নারী', 'মহিলা উদ্যোক্তা', 'স্বাবলম্বী নারী', 'women-entrepreneur', 'women'],
  'youth-entrepreneur': ['যুব উদ্যোক্তা', 'তরুণ উদ্যোক্তা', 'যুব', 'যুবক', 'youth-entrepreneur', 'youth'],
  'online-entrepreneur': ['অনলাইন উদ্যোক্তা', 'অনলাইন', 'ফেসবুক পেজ', 'অনলাইন বিজনেস', 'online-entrepreneur', 'online'],
  'ecommerce-entrepreneur': ['ই-কমার্স উদ্যোক্তা', 'ই-কমার্স', 'ইকমার্স', 'অনলাইন শপ', 'ecommerce-entrepreneur', 'ecommerce'],
  'freelancer-digital-entrepreneur': ['ফ্রিল্যান্সার ও ডিজিটাল উদ্যোক্তা', 'ফ্রিল্যান্সার', 'ডিজিটাল উদ্যোক্তা', 'ডিজিটাল মার্কেটিং', 'freelancer-digital-entrepreneur', 'freelancer', 'digital'],
  'food-restaurant-entrepreneur': ['খাদ্য ও রেস্টুরেন্ট উদ্যোক্তা', 'খাদ্য', 'রেস্টুরেন্ট', 'ক্যাটারিং', 'ফাস্টফুড', 'food-restaurant-entrepreneur', 'food', 'restaurant'],
  'handicraft-cottage': ['হস্তশিল্প ও কুটিরশিল্প', 'হস্তশিল্প', 'কুটিরশিল্প', 'নকশিকাঁথা', 'বুটিক', 'কারুশিল্প', 'handicraft-cottage', 'handicraft', 'cottage'],
  'clothing-fashion': ['পোশাক ও ফ্যাশন', 'পোশাক', 'ফ্যাশন', 'বস্ত্র', 'গার্মেন্টস', 'clothing-fashion', 'clothing', 'fashion'],
  'tech-it': ['প্রযুক্তি ও আইটি', 'প্রযুক্তি', 'আইটি', 'সফটওয়্যার', 'ওয়েব', 'tech-it', 'tech', 'it'],
  'fisheries-livestock': ['মৎস্য ও প্রাণিসম্পদ', 'মৎস্য', 'প্রাণিসম্পদ', 'মাছ চাষ', 'দুগ্ধ খামার', 'পোল্ট্রি', 'গরু মোটাতাজাকরণ', 'fisheries-livestock', 'fisheries', 'livestock'],
  'nursery-agribusiness': ['নার্সারি ও কৃষি ব্যবসা', 'নার্সারি', 'চারা উৎপাদন', 'বীজ ব্যবসা', 'ফলদ বাগান', 'কৃষি ব্যবসা', 'nursery-agribusiness', 'nursery'],
  'social-entrepreneur': ['সামাজিক উদ্যোক্তা', 'সামাজিক উদ্যোগ', 'সমাজকল্যাণ', 'সামাজিক উন্নয়ন', 'social-entrepreneur', 'social'],
  'civil-cases': ['দেওয়ানি মামলা', 'দেওয়ানি মামলা', 'দেওয়ানি', 'দেওয়ানি', 'সিভিল', 'civil-cases', 'civil'],
  'criminal-cases': ['ফৌজদারি মামলা', 'ফৌজি মামলা', 'ফৌজদারী', 'ক্রিমিনাল', 'criminal-cases', 'criminal'],
  'family-law': ['পারিবারিক আইন', 'পারিবারিক মামলা', 'পারিবারিক', 'নিকাহ', 'তালাক', 'মোহরানা', 'ভরণপোষণ', 'family-law', 'family'],
  'land-property-law': ['ভূমি ও সম্পত্তি আইন', 'ভূমি আইন', 'সম্পত্তি আইন', 'জমিজমা', 'খতিয়ান', 'মালিকানা', 'দখল', 'বাটোয়ারা', 'land-property-law', 'land', 'property'],
  'land-registry-deed': ['জমি রেজিস্ট্রি ও দলিল', 'দলিল', 'সাব-রেজিস্ট্রি', 'রেজিস্ট্রি', 'বায়না দলিল', 'হেবা দলিল', 'সাফ কবলা', 'দলিল লেখক', 'land-registry-deed', 'deed', 'registry'],
  'women-child-law': ['নারী ও শিশু আইন', 'নারী নির্যাতন', 'নারী ও শিশু নির্যাতন দমন', 'বাল্যবিয়ে', 'যৌতুক', 'women-child-law', 'women', 'child'],
  'labor-employment-law': ['শ্রম ও চাকরি আইন', 'শ্রম আইন', 'চাকরি আইন', 'লেবার ল', 'কর্মচারী অধিকার', 'labor-employment-law', 'labor', 'employment'],
  'business-commercial-law': ['ব্যবসা ও বাণিজ্যিক আইন', 'বাণিজ্যিক আইন', 'কর আইন', 'ট্যাক্স', 'ভ্যাট', 'ট্রেড লাইসেন্স', 'কোম্পানি আইন', 'business-commercial-law', 'commercial', 'business'],
  'banking-finance-law': ['ব্যাংক ও আর্থিক আইন', 'ব্যাংক আইন', 'আর্থিক ঋণ', 'অর্থঋণ আদালত', 'চেক ডিজঅনার', '১৩৮ ধারা', 'এনআই অ্যাক্ট', 'banking-finance-law', 'banking', 'finance'],
  'cyber-law': ['সাইবার আইন', 'সাইবার ক্রাইম', 'ডিজিটাল নিরাপত্তা', 'আইসিটি আইন', 'সোশ্যাল মিডিয়া হ্যাকিং', 'cyber-law', 'cyber'],
  'notary-affidavit': ['নোটারি ও এফিডেভিট', 'নোটারি পাবলিক', 'এফিডেভিট', 'হলফনামা', 'নোটারি', 'notary-affidavit', 'notary', 'affidavit'],
  'legal-aid': ['লিগ্যাল এইড', 'আইনি সহায়তা', 'সরকারি লিগ্যাল এইড', 'বিনামূল্যে আইনি সাহায্য', 'legal-aid', 'aid'],
  'thana-police': ['থানা পুলিশ', 'থানা', 'ওসি', 'ডিউটি অফিসার', 'thana-police', 'police station', 'পুলিশ স্টেশন'],
  'police-outpost': ['পুলিশ ফাঁড়ি', 'পুলিশ ফাড়ি', 'ফাঁড়ি', 'ফাড়ি', 'police-outpost', 'outpost'],
  'investigation-center': ['তদন্ত কেন্দ্র', 'তদন্ত', 'পুলিশ তদন্ত কেন্দ্র', 'investigation-center', 'investigation'],
  'traffic-police': ['ট্রাফিক পুলিশ', 'ট্রাফিক', 'যানবাহন নিয়ন্ত্রণ', 'traffic-police', 'traffic'],
  'highway-police': ['হাইওয়ে পুলিশ', 'হাইওয়ে পুলিশ', 'হাইওয়ে', 'হাইওয়ে', 'highway-police', 'highway'],
  'women-child-support': ['নারী ও শিশু সহায়তা', 'নারী ও শিশু', 'নারী ও শিশু হেল্প ডেস্ক', 'women-child-support', 'women support', 'child support'],
  'cyber-crime': ['সাইবার ক্রাইম', 'সাইবার নিরাপত্তা', 'ডিজিটাল অপরাধ', 'cyber-crime', 'cyber crime'],
  'community-policing': ['কমিউনিটি পুলিশিং', 'বিট পুলিশিং', 'বিট অফিসার', 'কমিউনিটি', 'community-policing', 'community police', 'beat policing'],
  'police-control-support': ['পুলিশ কন্ট্রোল/সহায়তা', 'পুলিশ কন্ট্রোল', 'কন্ট্রোল রুম', 'জরুরি পুলিশ', '৯৯৯', 'police-control-support', 'control room', 'emergency support'],
  'fire-station': ['ফায়ার স্টেশন', 'ফায়ার স্টেশন', 'ফায়ার সার্ভিস স্টেশন', 'fire-station', 'station'],
  'fire-rescue': ['ফায়ার ও উদ্ধার সেবা', 'ফায়ার ও উদ্ধার', 'উদ্ধার সেবা', 'রেসকিউ', 'fire-rescue', 'rescue'],
  'fire-fighting': ['অগ্নিনির্বাপণ', 'আগুন নেভানো', 'আগুন', 'দমকল', 'fire-fighting', 'fire fighting'],
  'accident-rescue': ['দুর্ঘটনা উদ্ধার', 'দুর্ঘটনা', 'ইমার্জেন্সি উদ্ধার', 'accident-rescue', 'accident'],
  'road-accident-rescue': ['সড়ক দুর্ঘটনা উদ্ধার', 'সড়ক দুর্ঘটনা', 'সড়ক উদ্ধার', 'হাইওয়ে দুর্ঘটনা', 'road-accident-rescue', 'road accident'],
  'building-trapped-rescue': ['ভবন/আটকে পড়া উদ্ধার', 'ভবনে আটকা', 'লিফটে আটকা', 'আটকে পড়া উদ্ধার', 'building-trapped-rescue', 'building collapse'],
  'waterway-rescue': ['নৌ ও জলপথ উদ্ধার', 'পানিতে ডুবে যাওয়া', 'নদীতে উদ্ধার', 'ডুবুরি', 'নৌ দুর্ঘটনা', 'waterway-rescue', 'water rescue', 'diver'],
  'disaster-rescue': ['দুর্যোগ ও উদ্ধার', 'দুর্যোগ', 'বন্যা', 'ঘূর্ণিঝড়', 'ঝড়', 'disaster-rescue', 'disaster'],
  'training-awareness': ['জরুরি প্রশিক্ষণ ও সচেতনতা', 'ফায়ার ড্রিল', 'প্রশিক্ষণ', 'সচেতনতা', 'মহড়া', 'training-awareness', 'fire drill', 'training'],
  'pathology': ['প্যাথলজি', 'প্যাথলজিক্যাল', 'প্যাথলজি ল্যাব', 'pathology', 'pathological', 'ল্যাব'],
  'blood-test': ['রক্ত পরীক্ষা', 'ব্লাড টেস্ট', 'সিবিসি', 'রক্ত', 'blood-test', 'blood test', 'blood', 'cbc', 'hb'],
  'hormone-test': ['হরমোন পরীক্ষা', 'হরমোন টেস্ট', 'হরমোন', 'থাইরয়েড', 'টিএসএইচ', 'hormone-test', 'hormone', 'thyroid', 'tsh'],
  'biochemistry': ['বায়োকেমিস্ট্রি', 'বায়োকেমিক্যাল', 'লিপিড প্রোফাইল', 'কিডনি টেস্ট', 'লিভার ফাংশন', 'ক্রিয়েটিনিন', 'biochemistry', 'biochemical', 'lipid'],
  'imaging-radiology': ['ইমেজিং ও রেডিওলজি', 'ইমেজিং', 'রেডিওলজি', 'imaging-radiology', 'imaging', 'radiology'],
  'x-ray': ['এক্স-রে', 'ডিজিটাল এক্স-রে', 'এক্সরে', 'চেস্ট এক্স-রে', 'x-ray', 'xray'],
  'ultrasonogram': ['আল্ট্রাসনোগ্রাম', 'আল্ট্রাসনোগ্রাফি', 'ইউএসজি', 'আলট্রা', 'ultrasonogram', 'ultrasonography', 'usg', '4d usg'],
  'ecg': ['ইসিজি', 'ইকোকার্ডিওগ্রাম', 'হৃদরোগ পরীক্ষা', 'কার্ডিয়াক', 'ecg', 'echo', 'echocardiogram', 'cardiac'],
  'endoscopy': ['এন্ডোস্কোপি', 'এন্ডোস্কপি', 'কলোনোস্কোপি', 'গ্যাস্ট্রো', 'endoscopy', 'colonoscopy'],
  'dental-diagnostic': ['ডেন্টাল ডায়াগনস্টিক', 'দাঁতের এক্স-রে', 'ডেন্টাল এক্সরে', 'ওপিজি', 'dental-diagnostic', 'dental x-ray', 'opg'],
  'home-sample-collection': ['হোম স্যাম্পল কালেকশন', 'হোম স্যাম্পল', 'বাড়ি থেকে স্যাম্পল', 'স্যাম্পল কালেকশন', 'home-sample-collection', 'home sample'],
  'government-hospital': ['সরকারি হাসপাতাল', 'সরকারি', 'উপজেলা স্বাস্থ্য কমপ্লেক্স', 'স্বাস্থ্য কমপ্লেক্স', 'government-hospital', 'government', 'govt'],
  'private-hospital': ['বেসরকারি হাসপাতাল', 'বেসরকারি', 'প্রাইভেট হাসপাতাল', 'বেসরকারি ক্লিনিক', 'private-hospital', 'private'],
  'clinic': ['ক্লিনিক', 'নার্সিং হোম', 'ক্লিনিক ও নার্সিং হোম', 'clinic', 'nursing home'],
  'maternal-child-hospital': ['মাতৃ ও শিশু হাসপাতাল', 'মাতৃ ও শিশু', 'মা ও শিশু', 'মা ও শিশু কল্যাণ কেন্দ্র', 'মাতৃসদন', 'প্রসূতি হাসপাতাল', 'maternal-child-hospital', 'maternal', 'maternity', 'child hospital'],
  'general-hospital': ['জেনারেল হাসপাতাল', 'জেনারেল', 'সাধারণ হাসপাতাল', 'general-hospital', 'general'],
  'specialized-hospital': ['বিশেষায়িত হাসপাতাল', 'বিশেষায়িত হাসপাতাল', 'বিশেষায়িত', 'ট্রমা সেন্টার', 'স্পেশালাইজড', 'specialized-hospital', 'specialized', 'trauma'],
  'dental-hospital-clinic': ['ডেন্টাল হাসপাতাল/ক্লিনিক', 'ডেন্টাল হাসপাতাল', 'ডেন্টাল ক্লিনিক', 'দাঁতের হাসপাতাল', 'দাঁতের ক্লিনিক', 'dental-hospital-clinic', 'dental hospital', 'dental clinic'],
  'eye-hospital-clinic': ['চক্ষু হাসপাতাল/ক্লিনিক', 'চক্ষু হাসপাতাল', 'চক্ষু ক্লিনিক', 'চোখের হাসপাতাল', 'eye-hospital-clinic', 'eye hospital', 'eye clinic', 'chokkhu'],
  'community-clinic': ['কমিউনিটি ক্লিনিক', 'কমিউনিটি ক্লিনিক / স্বাস্থ্যকেন্দ্র', 'স্বাস্থ্য কেন্দ্র', 'উপ-স্বাস্থ্য কেন্দ্র', 'কমিউনিটি স্বাস্থ্যকেন্দ্র', 'community-clinic', 'community clinic'],
};

export function useGlobalSearchFilter<T extends Record<string, any>>(
  rawItems: T[],
  fieldsSchema?: {
    nameKey?: string;
    specialityKey?: string;
    addressKey?: string;
    phoneKey?: string;
    ratingKey?: string;
    degreesKey?: string;
    workplaceKey?: string;
  }
) {
  const [filters, setFilters] = useState<GlobalFilterState>(INITIAL_FILTER_STATE);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const resetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
  };

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location.upazila !== 'all') count++;
    if (filters.location.thana !== 'all') count++;
    if (filters.location.union !== 'all') count++;
    if (filters.location.village.trim() !== '') count++;
    if (filters.category !== 'all') count++;
    if (filters.rating !== 'all') count++;
    if (filters.verification !== 'all') count++;
    if (filters.availability !== 'all') count++;
    if (filters.distance !== 'all') count++;
    if (filters.fee !== 'all') count++;
    return count;
  }, [filters]);

  // Main Filtering & Sorting Logic
  const filteredItems = useMemo(() => {
    return rawItems
      .filter((item) => {
        // Exclude only explicitly rejected or deleted items
        if (
          item.status === 'rejected' ||
          item.status === 'deleted' ||
          item.status === 'archived'
        ) {
          return false;
        }

        // Exclude empty documents without a title or name
        const hasTitle = Boolean(
          (fieldsSchema?.nameKey && item[fieldsSchema.nameKey]?.trim?.()) ||
          (item.name && String(item.name).trim()) ||
          (item.title && String(item.title).trim()) ||
          (item.spotName && String(item.spotName).trim()) ||
          (item.institutionName && String(item.institutionName).trim()) ||
          (item.serviceName && String(item.serviceName).trim())
        );
        if (!hasTitle) {
          return false;
        }

        // 1. Location Filters: Upazila -> Thana -> Union -> Village
        const addressBlob = [
          item[fieldsSchema?.addressKey || 'address'],
          item.address,
          item.location,
          item.upazila,
          item.thana,
          item.union,
          item.area,
          item.village,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        // Upazila Filter
        if (filters.location.upazila !== 'all') {
          const upaTerm = filters.location.upazila.toLowerCase().replace('উপজেলা', '').trim();
          if (!addressBlob.includes(upaTerm)) return false;
        }

        // Thana Filter
        if (filters.location.thana !== 'all') {
          const thanaTerm = filters.location.thana.toLowerCase().replace('থানা', '').trim();
          if (!addressBlob.includes(thanaTerm)) return false;
        }

        // Union Filter
        if (filters.location.union !== 'all') {
          const unionTerm = filters.location.union.toLowerCase().replace('ইউনিয়ন', '').replace('সদর', '').trim();
          if (!addressBlob.includes(unionTerm)) return false;
        }

        // Village Filter
        if (filters.location.village.trim() !== '') {
          const vTerm = filters.location.village.toLowerCase().trim();
          if (!addressBlob.includes(vTerm)) return false;
        }

        // 2. Category / Specialization Filter
        if (filters.category !== 'all') {
          const catTerm = filters.category.toLowerCase();
          const specBlob = [
            item[fieldsSchema?.specialityKey || 'speciality'],
            item.category,
            item.department,
            item.type,
            item.subType,
            item.services,
            item.beds,
            item.group,
            item.specialization,
            item.speciality,
            item.facilities,
            item.homeSampleCollection,
            Array.isArray(item.facilities) ? item.facilities.join(' ') : '',
            Array.isArray(item.tests) ? item.tests.map((t: any) => typeof t === 'string' ? t : `${t.name || ''} ${t.description || ''}`).join(' ') : '',
            Array.isArray(item.servicesList) ? item.servicesList.map((s: any) => typeof s === 'string' ? s : `${s.name || ''} ${s.category || ''}`).join(' ') : '',
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          const aliases = CATEGORY_ALIAS_MAP[catTerm] || [catTerm];
          const matchesCategory = aliases.some((alias) => specBlob.includes(alias.toLowerCase()));

          if (!matchesCategory) return false;
        }

        // 3. Rating Filter
        if (filters.rating !== 'all') {
          const itemRating = Number(item[fieldsSchema?.ratingKey || 'rating'] || item.rating || 0);
          if (filters.rating === '5.0' && itemRating < 5.0) return false;
          if (filters.rating === '4.5+' && itemRating < 4.5) return false;
          if (filters.rating === '4.0+' && itemRating < 4.0) return false;
          if (filters.rating === '3.0+' && itemRating < 3.0) return false;
        }

        // 4. Verification Filter
        if (filters.verification === 'verified') {
          const isVerified =
            item.isVerified === true ||
            item.verificationStatus === 'verified' ||
            item.status === 'approved' ||
            item.status === 'published';
          if (!isVerified) return false;
        } else if (filters.verification === 'officially_verified') {
          const isOfficial =
            item.isOfficiallyVerified === true ||
            item.verificationStatus === 'official' ||
            item.isGovernmentApproved === true;
          if (!isOfficial) return false;
        }

        // 5. Availability Filter
        if (filters.availability !== 'all') {
          const isAvail = item.isAvailable !== false && item.available !== false && item.isOpen !== false;
          const is24h = item.is24Hours === true || item.is24h === true || String(item.openingTime || '').includes('24');
          
          if (filters.availability === 'available_now' && !isAvail) return false;
          if (filters.availability === '24_hours' && !is24h) return false;
          if (filters.availability === 'open_today' && item.isOpenToday === false) return false;
          if (filters.availability === 'chamber_today' && item.hasChamberToday === false) return false;
        }

        // 6. Proximity / Distance Filter
        if (filters.distance !== 'all' && filters.userCoords && item.latitude && item.longitude) {
          const distKm = getHaversineDistance(
            filters.userCoords.lat,
            filters.userCoords.lng,
            Number(item.latitude),
            Number(item.longitude)
          );
          if (filters.distance === '1km' && distKm > 1) return false;
          if (filters.distance === '5km' && distKm > 5) return false;
          if (filters.distance === '10km' && distKm > 10) return false;
        }

        // 7. Fee Filter
        if (filters.fee !== 'all') {
          const feeVal = Number(item.fee || item.consultationFee || item.price || item.rate || 0);
          if (filters.fee === 'under_300' && (feeVal > 300 || feeVal === 0)) return false;
          if (filters.fee === '300_500' && (feeVal < 300 || feeVal > 500)) return false;
          if (filters.fee === '500_1000' && (feeVal < 500 || feeVal > 1000)) return false;
          if (filters.fee === 'above_1000' && feeVal < 1000) return false;
        }

        // 8. General Unified Text Search (Name, Chamber, Speciality, Hospital, Keywords)
        if (filters.searchInput.trim()) {
          const searchableBlob = [
            item[fieldsSchema?.nameKey || 'name'],
            item.name,
            item.title,
            item[fieldsSchema?.specialityKey || 'speciality'],
            item.category,
            item.department,
            item.designation,
            item[fieldsSchema?.addressKey || 'address'],
            item.address,
            item.location,
            item.union,
            item.village,
            item[fieldsSchema?.phoneKey || 'phone'],
            item.phone,
            item.contactNumber,
            item[fieldsSchema?.degreesKey || 'degrees'],
            item.qualifications,
            item[fieldsSchema?.workplaceKey || 'workplace'],
            item.chamberName,
            item.hospitalName,
            item.organization,
            item.description,
            item.services,
            item.subType,
            item.beds,
            item.keywords,
            item.tags,
            item.facilities,
            item.homeSampleCollection,
            Array.isArray(item.facilities) ? item.facilities.join(' ') : '',
            Array.isArray(item.tests) ? item.tests.map((t: any) => typeof t === 'string' ? t : `${t.name || ''} ${t.description || ''}`).join(' ') : '',
            Array.isArray(item.doctorsList) ? item.doctorsList.map((d: any) => `${d.name} ${d.speciality} ${d.degrees}`).join(' ') : '',
            Array.isArray(item.servicesList) ? item.servicesList.map((s: any) => `${s.name} ${s.category}`).join(' ') : '',
          ]
            .filter(Boolean)
            .join(' ');

          const score = calculateMatchScore(filters.searchInput, searchableBlob);
          return score > 0;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort System
        if (filters.sortBy === 'rating') {
          const rA = Number(a[fieldsSchema?.ratingKey || 'rating'] || a.rating || 0);
          const rB = Number(b[fieldsSchema?.ratingKey || 'rating'] || b.rating || 0);
          return rB - rA;
        }

        if (filters.sortBy === 'distance' && filters.userCoords) {
          const dA = a.latitude && a.longitude
            ? getHaversineDistance(filters.userCoords.lat, filters.userCoords.lng, Number(a.latitude), Number(a.longitude))
            : 9999;
          const dB = b.latitude && b.longitude
            ? getHaversineDistance(filters.userCoords.lat, filters.userCoords.lng, Number(b.latitude), Number(b.longitude))
            : 9999;
          return dA - dB;
        }

        if (filters.sortBy === 'newest') {
          const tA = new Date(a.createdAt || a.dateAdded || 0).getTime();
          const tB = new Date(b.createdAt || b.dateAdded || 0).getTime();
          return tB - tA;
        }

        if (filters.sortBy === 'popular') {
          const vA = Number(a.viewsCount || a.views || a.ratingsCount || 0);
          const vB = Number(b.viewsCount || b.views || b.ratingsCount || 0);
          return vB - vA;
        }

        if (filters.sortBy === 'verified') {
          const verA = a.isVerified === true || a.verificationStatus === 'verified' ? 1 : 0;
          const verB = b.isVerified === true || b.verificationStatus === 'verified' ? 1 : 0;
          return verB - verA;
        }

        if (filters.sortBy === 'fee_asc') {
          const fA = Number(a.fee || a.consultationFee || a.price || 0);
          const fB = Number(b.fee || b.consultationFee || b.price || 0);
          return fA - fB;
        }

        if (filters.sortBy === 'fee_desc') {
          const fA = Number(a.fee || a.consultationFee || a.price || 0);
          const fB = Number(b.fee || b.consultationFee || b.price || 0);
          return fB - fA;
        }

        if (filters.sortBy === 'name_asc') {
          const nameA = String(a[fieldsSchema?.nameKey || 'name'] || a.name || a.title || '');
          const nameB = String(b[fieldsSchema?.nameKey || 'name'] || b.name || b.title || '');
          return nameA.localeCompare(nameB, 'bn');
        }

        return 0;
      });
  }, [rawItems, filters, fieldsSchema]);

  return {
    filters,
    setFilters,
    resetFilters,
    filteredItems,
    isFilterModalOpen,
    setIsFilterModalOpen,
    activeFilterCount,
  };
}
