import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const customDbId = (firebaseConfig as any).firestoreDatabaseId && (firebaseConfig as any).firestoreDatabaseId !== '(default)'
  ? (firebaseConfig as any).firestoreDatabaseId
  : undefined;
const db = customDbId ? getFirestore(app, customDbId) : getFirestore(app);

const categories = [
  { title: 'সরকারি সেবা', count: '৩৪+', iconName: 'Landmark', bg: 'bg-emerald-50', path: '/administration', order: 1 },
  { title: 'ভূমি সেবা', count: '২১+', iconName: 'Map', bg: 'bg-purple-50', path: '/services', order: 2 },
  { title: 'কৃষি ও কৃষক সেবা', count: '১৮+', iconName: 'Sprout', bg: 'bg-emerald-50', path: '/agriculture', order: 3 },
  { title: 'নাগরিক সেবা', count: '১৬+', iconName: 'Users', bg: 'bg-blue-50', path: '/services', order: 4 },
  { title: 'আইন ও বিধি', count: '১২+', iconName: 'BookOpen', bg: 'bg-orange-50', path: '/notice', order: 5 },
  { title: 'সুরক্ষা ও জরুরি', count: '৯+', iconName: 'ShieldCheck', bg: 'bg-rose-50', path: '/emergency', order: 6 },
  { title: 'ফরম ও আবেদন', count: '২৪+', iconName: 'FileText', bg: 'bg-teal-50', path: '/downloads', order: 7 },
  { title: 'গাইড ও সহায়িকা', count: '১৭+', iconName: 'Lightbulb', bg: 'bg-amber-50', path: '/education', order: 8 },
];

const popularResources = [
  { title: 'ভূমি উন্নয়ন কর প্রদান ফরম (সংশোধিত)', dept: 'ভূমি মন্ত্রণালয়', type: 'PDF', size: '245 KB', color: 'bg-[#009664]' },
  { title: 'জমির নকশা উত্তোলনের আবেদন ফরম', dept: 'ভূমি রেকর্ড ও জরিপ অধিদপ্তর', type: 'PDF', size: '312 KB', color: 'bg-purple-500' },
  { title: 'কৃষি প্রণোদনা আবেদন ফরম', dept: 'কৃষি সম্প্রসারণ অধিদপ্তর', type: 'PDF', size: '180 KB', color: 'bg-orange-500' },
];

const downloadCategories = [
  { id: 'form', label: 'আবেদন ফরম', iconName: 'ClipboardList', order: 1 },
  { id: 'guide', label: 'নির্দেশিকা', iconName: 'BookOpen', order: 2 },
  { id: 'publication', label: 'প্রকাশনা', iconName: 'Book', order: 3 },
  { id: 'certificate', label: 'সনদ ফরম', iconName: 'BadgeCheck', order: 4 },
  { id: 'others', label: 'অন্যান্য', iconName: 'MoreHorizontal', order: 5 },
];

const downloadDocuments = [
  { title: 'ভূমি উন্নয়ন কর প্রদানের আবেদন ফরম', category: 'form', type: 'PDF', size: '245 KB', color: 'bg-red-500', textColor: 'text-red-500', bgLight: 'bg-red-50' },
  { title: 'জমির নকশা উত্তোলনের আবেদন ফরম', category: 'form', type: 'DOC', size: '320 KB', color: 'bg-blue-500', textColor: 'text-blue-500', bgLight: 'bg-blue-50' },
  { title: 'নাগরিক সনদ আবেদন ফরম', category: 'certificate', type: 'PDF', size: '210 KB', color: 'bg-orange-500', textColor: 'text-orange-500', bgLight: 'bg-orange-50' },
];

async function seed() {
  console.log("Seeding categories...");
  for (const cat of categories) {
    await addDoc(collection(db, "resources_categories"), cat);
  }
  
  console.log("Seeding resources...");
  for (const res of popularResources) {
    await addDoc(collection(db, "popular_resources"), { ...res, createdAt: serverTimestamp() });
  }

  console.log("Seeding download categories...");
  for (const cat of downloadCategories) {
    await addDoc(collection(db, "download_categories"), cat);
  }

  console.log("Seeding download documents...");
  for (const doc of downloadDocuments) {
    await addDoc(collection(db, "download_documents"), { ...doc, updatedAt: serverTimestamp() });
  }
  
  console.log("Seed completed!");
  process.exit(0);
}

seed().catch(console.error);
