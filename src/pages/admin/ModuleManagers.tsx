import React from 'react';
import { GenericAdminManager } from '../../components/admin/GenericAdminManager';
import HealthDirectoryManagement from '../../components/admin/HealthDirectoryManagement';

export const EducationManager = () => (
  <GenericAdminManager
    collectionName="institutions"
    title="শিক্ষা প্রতিষ্ঠান ব্যবস্থাপনা"
    fields={[
      { name: 'name', label: 'প্রতিষ্ঠানের নাম', type: 'text' },
      { name: 'type', label: 'ধরণ (স্কুল/কলেজ)', type: 'text' },
      { name: 'phone', label: 'ফোন নম্বর', type: 'text' },
      { name: 'address', label: 'ঠিকানা', type: 'text' },
      { name: 'est', label: 'স্থাপিত', type: 'text' },
    ]}
  />
);

export const AgricultureManager = () => (
  <GenericAdminManager
    collectionName="agriculture"
    title="কৃষি ও খামার ব্যবস্থাপনা"
    fields={[
      { name: 'name', label: 'নাম', type: 'text' },
      { name: 'type', label: 'ধরণ', type: 'text' },
      { name: 'phone', label: 'ফোন নম্বর', type: 'text' },
      { name: 'address', label: 'ঠিকানা', type: 'text' },
      { name: 'details', label: 'বিস্তারিত', type: 'textarea' },
    ]}
  />
);

export const HealthManager = () => (
  <HealthDirectoryManagement />
);

export const JobsManager = () => (
  <GenericAdminManager
    collectionName="jobs"
    title="চাকরি ব্যবস্থাপনা"
    fields={[
      { name: 'title', label: 'পদের নাম', type: 'text' },
      { name: 'company', label: 'কোম্পানি/প্রতিষ্ঠান', type: 'text' },
      { name: 'location', label: 'অবস্থান', type: 'text' },
      { name: 'deadline', label: 'আবেদনের শেষ তারিখ', type: 'text' },
      { name: 'description', label: 'বিস্তারিত', type: 'textarea' },
      { name: 'contact', label: 'যোগাযোগ', type: 'text' },
    ]}
  />
);

export const AdministrationManager = () => (
  <GenericAdminManager
    collectionName="administration"
    title="উপজেলা প্রশাসন ব্যবস্থাপনা"
    fields={[
      { name: 'name', label: 'অফিসের নাম/কর্মকর্তা', type: 'text' },
      { name: 'designation', label: 'পদবী', type: 'text' },
      { name: 'phone', label: 'ফোন নম্বর', type: 'text' },
      { name: 'email', label: 'ইমেইল', type: 'text' },
      { name: 'address', label: 'ঠিকানা', type: 'text' },
    ]}
  />
);

export const NGOManager = () => (
  <GenericAdminManager
    collectionName="ngos"
    title="এনজিও ব্যবস্থাপনা"
    fields={[
      { name: 'name', label: 'এনজিওর নাম', type: 'text' },
      { name: 'focus', label: 'কাজের ধরণ', type: 'text' },
      { name: 'phone', label: 'ফোন নম্বর', type: 'text' },
      { name: 'address', label: 'ঠিকানা', type: 'text' },
      { name: 'activities', label: 'কার্যক্রম', type: 'textarea' },
    ]}
  />
);

export const MainMenuManager = () => (
  <GenericAdminManager
    collectionName="main_menu"
    title="মেইন মেনু ব্যবস্থাপনা"
    fields={[
      { name: 'label', label: 'মেনুর নাম', type: 'text' },
      { name: 'icon', label: 'আইকন (নাম)', type: 'text' },
      { name: 'link', label: 'লিঙ্ক', type: 'text' },
      { name: 'order', label: 'ক্রম', type: 'number' },
      { name: 'isActive', label: 'সক্রিয়?', type: 'checkbox' },
    ]}
  />
);

export const WeatherSettings = () => (
  <GenericAdminManager
    collectionName="weather_settings"
    title="আবহাওয়া সেটিংস"
    fields={[
      { name: 'locationName', label: 'অবস্থানের নাম', type: 'text' },
      { name: 'latitude', label: 'অক্ষাংশ (Latitude)', type: 'text' },
      { name: 'longitude', label: 'দ্রাঘিমাংশ (Longitude)', type: 'text' },
    ]}
  />
);
