import React from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface ServiceFilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface CategoryOption {
  id: string;
  label: string;
  icon: string;
}

export interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'tel' | 'url' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: FilterOption[];
}

export interface FieldsSchema {
  nameKey: string;
  specialityKey?: string;
  workplaceKey?: string;
  addressKey?: string;
  phoneKey?: string;
  timeKey?: string;
  ratingKey?: string;
  reviewCountKey?: string;
  degreesKey?: string;
  imageKey?: string;
  badgeKey?: string;
  mapUrlKey?: string;
}

export interface ServiceConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  collectionName: string;
  searchPlaceholder: string;
  categories: CategoryOption[];
  filters: ServiceFilterConfig[];
  sortOptions: FilterOption[];
  statsLabels: {
    verifiedLabel: string;
    totalLabel: string;
    regionLabel: string;
  };
  fieldsSchema: FieldsSchema;
  addFormFields: FormFieldConfig[];
}

export const RAJSHAHI_UPAZILAS: FilterOption[] = [
  { value: 'all', label: 'সকল উপজেলা/থানা' },
  { value: 'পুঠিয়া', label: '🏛️ পুঠিয়া উপজেলা' },
  { value: 'বাঘমারা', label: '🏛️ বাঘমারা উপজেলা' },
  { value: 'বাঘা', label: '🏛️ বাঘা উপজেলা' },
  { value: 'চারঘাট', label: '🏛️ চারঘাট উপজেলা' },
  { value: 'দুর্গাপুর', label: '🏛️ দুর্গাপুর উপজেলা' },
  { value: 'গোদাগাড়ী', label: '🏛️ গোদাগাড়ী উপজেলা' },
  { value: 'মোহনপুর', label: '🏛️ মোহনপুর উপজেলা' },
  { value: 'পবা', label: '🏛️ পবা উপজেলা' },
  { value: 'তানোর', label: '🏛️ তানোর উপজেলা' },
  { value: 'বোয়ালিয়া', label: '🏙️ বোয়ালিয়া থানা (রাজশাহী)' },
  { value: 'রাজপাড়া', label: '🏙️ রাজপাড়া থানা (রাজশাহী)' },
  { value: 'মতিহার', label: '🏙️ মতিহার থানা (রাজশাহী)' },
  { value: 'শাহ মখদুম', label: '🏙️ শাহ মখদুম থানা (রাজশাহী)' },
  { value: 'চন্দ্রিমা', label: '🏙️ চন্দ্রিমা থানা (রাজশাহী)' },
  { value: 'কাশিয়াডাঙ্গা', label: '🏙️ কাশিয়াডাঙ্গা থানা (রাজশাহী)' },
  { value: 'কাটাখালী', label: '🏙️ কাটাখালী থানা (রাজশাহী)' },
  { value: 'বিমানবন্দর', label: '🏙️ বিমানবন্দর থানা (রাজশাহী)' },
  { value: 'অন্যান্য', label: '❓ অন্যান্য উপজেলা/থানা' },
];

export const PUTHIA_UNIONS: FilterOption[] = [
  { value: 'all', label: 'সকল ইউনিয়ন/এলাকা' },
  { value: 'পুঠিয়া সদর', label: '🏡 পুঠিয়া সদর' },
  { value: 'বেলপুকুরিয়া', label: '🏡 বেলপুকুরিয়া' },
  { value: 'বানেশ্বর', label: '🏡 বানেশ্বর' },
  { value: 'ভালুকগাছি', label: '🏡 ভালুকগাছি' },
  { value: 'জিউপাড়া', label: '🏡 জিউপাড়া' },
  { value: 'শিলমাড়িয়া', label: '🏡 শিলমাড়িয়া' },
  { value: 'রাজশাহী সিটি', label: '🏙️ রাজশাহী সিটি করপোরেশন' },
  { value: 'অন্যান্য', label: '❓ অন্যান্য' },
];

export const FORM_UPAZILA_OPTIONS: FilterOption[] = [
  { value: 'পুঠিয়া', label: '🏛️ পুঠিয়া উপজেলা' },
  { value: 'বাঘমারা', label: '🏛️ বাঘমারা উপজেলা' },
  { value: 'বাঘা', label: '🏛️ বাঘা উপজেলা' },
  { value: 'চারঘাট', label: '🏛️ চারঘাট উপজেলা' },
  { value: 'দুর্গাপুর', label: '🏛️ দুর্গাপুর উপজেলা' },
  { value: 'গোদাগাড়ী', label: '🏛️ গোদাগাড়ী উপজেলা' },
  { value: 'মোহনপুর', label: '🏛️ মোহনপুর উপজেলা' },
  { value: 'পবা', label: '🏛️ পবা উপজেলা' },
  { value: 'তানোর', label: '🏛️ তানোর উপজেলা' },
  { value: 'বোয়ালিয়া', label: '🏙️ বোয়ালিয়া থানা (রাজশাহী)' },
  { value: 'রাজপাড়া', label: '🏙️ রাজপাড়া থানা (রাজশাহী)' },
  { value: 'মতিহার', label: '🏙️ মতিহার থানা (রাজশাহী)' },
  { value: 'শাহ মখদুম', label: '🏙️ শাহ মখদুম থানা (রাজশাহী)' },
  { value: 'চন্দ্রিমা', label: '🏙️ চন্দ্রিমা থানা (রাজশাহী)' },
  { value: 'কাশিয়াডাঙ্গা', label: '🏙️ কাশিয়াডাঙ্গা থানা (রাজশাহী)' },
  { value: 'কাটাখালী', label: '🏙️ কাটাখালী থানা (রাজশাহী)' },
  { value: 'বিমানবন্দর', label: '🏙️ বিমানবন্দর থানা (রাজশাহী)' },
  { value: 'অন্যান্য', label: '❓ অন্যান্য (নিজের উপজেলা/থানা লিখুন)' },
];

export const FORM_UNION_OPTIONS: FilterOption[] = [
  { value: 'পুঠিয়া সদর', label: '🏡 পুঠিয়া সদর ইউনিয়ন' },
  { value: 'বেলপুকুরিয়া', label: '🏡 বেলপুকুরিয়া ইউনিয়ন' },
  { value: 'বানেশ্বর', label: '🏡 বানেশ্বর ইউনিয়ন' },
  { value: 'ভালুকগাছি', label: '🏡 ভালুকগাছি ইউনিয়ন' },
  { value: 'জিউপাড়া', label: '🏡 জিউপাড়া ইউনিয়ন' },
  { value: 'শিলমাড়িয়া', label: '🏡 শিলমাড়িয়া ইউনিয়ন' },
  { value: 'রাজশাহী সিটি', label: '🏙️ রাজশাহী সিটি করপোরেশন' },
  { value: 'অন্যান্য', label: '❓ অন্যান্য (নিজের ইউনিয়ন/এলাকা লিখুন)' },
];

export const COMMON_SORT_OPTIONS: FilterOption[] = [
  { value: 'relevant', label: 'ডিফল্ট সাজানো' },
  { value: 'rating', label: 'সর্বোচ্চ রেটিং' },
  { value: 'newest', label: 'সর্বশেষ নতুন' },
  { value: 'name_asc', label: 'নাম (অ-অঁ)' },
];
