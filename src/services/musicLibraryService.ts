/**
 * আড্ডা (Adda) — Music Library & Audio Soundscape System
 * Comprehensive Music Library for Stories, Reels, Posts & Video Editors
 * Features Puthia-Centric Heritage Soundscapes, Trending/Folk Categories,
 * Audio Trimming, Volume Balancing, Synthesized Fallback Engine & Admin Management.
 */

import { db } from "../firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  updateDoc,
  serverTimestamp,
  increment 
} from "firebase/firestore";

export type MusicCategoryType =
  | 'all'
  | 'trending'
  | 'popular'
  | 'new'
  | 'puthia_heritage'
  | 'nature'
  | 'joy'
  | 'sad'
  | 'romantic'
  | 'festive'
  | 'patriotic'
  | 'folk'
  | 'baul'
  | 'rural'
  | 'spiritual'
  | 'rain'
  | 'morning'
  | 'night'
  | 'motivation'
  | 'chill'
  | 'cinematic'
  | 'instrumental'
  | 'lofi';

export type MusicLicenseType = 
  | 'royalty_free' 
  | 'creative_commons' 
  | 'puthia_heritage' 
  | 'original' 
  | 'public_domain';

export interface MusicCategory {
  id: MusicCategoryType;
  name: string;
  emoji: string;
  description?: string;
  iconBg?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: MusicCategoryType;
  subCategories?: MusicCategoryType[];
  audioUrl: string;
  coverImage?: string;
  duration: number; // in seconds (e.g. 30, 45, 120)
  isPuthiaSpecial?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isHidden?: boolean;
  license: MusicLicenseType;
  licenseNote?: string;
  playsCount: number;
  usesCount: number;
  tags: string[];
  synthType?: 'flute' | 'rain' | 'ektara' | 'dhol' | 'breeze' | 'lofi' | 'harmonium' | 'river' | 'birds';
  createdAt?: number | any;
  updatedAt?: number | any;
}

export interface MusicAttachment {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  url: string;
  coverImage?: string;
  startTime: number; // in seconds
  duration: number; // in seconds (e.g. 15, 30, 60)
  musicVolume: number; // 0 to 1 (e.g. 0.8)
  originalVolume?: number; // 0 to 1 (e.g. 1.0)
  isPuthiaSpecial?: boolean;
  license?: MusicLicenseType;
}

export interface MusicFavoriteRecord {
  userId: string;
  trackId: string;
  addedAt: number;
}

// 🎼 All Standard Categories
export const MUSIC_CATEGORIES: MusicCategory[] = [
  { id: 'all', name: 'সব মিউজিক', emoji: '🌟', description: 'সমস্ত সুর ও সাউন্ডট্র্যাক' },
  { id: 'puthia_heritage', name: 'পুঠিয়া স্পেশাল', emoji: '📍', description: 'পুঠিয়ার লোকসুর ও প্রকৃতির আবহ', iconBg: 'from-amber-500 to-rose-600' },
  { id: 'trending', name: 'ট্রেন্ডিং', emoji: '🔥', description: 'বর্তমানে সবচেয়ে জনপ্রিয় সুর' },
  { id: 'popular', name: 'জনপ্রিয়', emoji: '❤️', description: 'নাগরিকদের পছন্দের শীর্ষ তালিকা' },
  { id: 'new', name: 'নতুন যোগ হয়েছে', emoji: '🆕', description: 'সম্প্রতিকালের নতুন অডিও' },
  { id: 'nature', name: 'প্রকৃতি', emoji: '🌿', description: 'পাতা, বাতাস ও বনের গুঞ্জন' },
  { id: 'rain', name: 'বৃষ্টির শব্দ', emoji: '🌧️', description: 'শ্রাবণের মেঘ ও ঝিরিঝিরি বৃষ্টি' },
  { id: 'rural', name: 'গ্রামীণ আবহ', emoji: '🥁', description: 'গ্রামের মেলা ও মেঠো পরিবেশ' },
  { id: 'folk', name: 'লোকগান', emoji: '🪕', description: 'বাংলার ঐতিহ্যবাহী লোকসুর' },
  { id: 'baul', name: 'বাউল ও একতারা', emoji: '🎻', description: 'একতারা ও মাটির গান' },
  { id: 'spiritual', name: 'আধ্যাত্মিক', emoji: '🕌', description: 'শান্ত ও অন্তর্দৃষ্টিপূর্ণ সুর' },
  { id: 'joy', name: 'আনন্দ ও উল্লাস', emoji: '😊', description: 'হাসিখুশি ও প্রাণবন্ত সুর' },
  { id: 'romantic', name: 'রোমান্টিক', emoji: '💕', description: 'হৃদয়ছোঁয়া ভালোবাসার সুর' },
  { id: 'festive', name: 'উৎসব ও মেলা', emoji: '🎉', description: 'বৈশাখী ও মিলনোৎসবের বাজনা' },
  { id: 'patriotic', name: 'দেশাত্মবোধক', emoji: '🇧🇩', description: 'সোনার বাংলার আবহ' },
  { id: 'sad', name: 'বিষণ্ণ ও নীরব', emoji: '😢', description: 'একাকী মুহূর্তের আবেগ' },
  { id: 'morning', name: 'ভোরের সকাল', emoji: '🌅', description: 'পাখির ডাক ও স্নিগ্ধ সকাল' },
  { id: 'night', name: 'শান্ত রাত', emoji: '🌙', description: 'ঝিনঝিক ও নীরব রাতের পরিবেশ' },
  { id: 'motivation', name: 'অনুপ্রেরণা', emoji: '💪', description: 'উদ্দীপনামূলক বাদ্য' },
  { id: 'chill', name: 'Chill & Relax', emoji: '😎', description: 'মনকে প্রশান্ত করার সুর' },
  { id: 'cinematic', name: 'Cinematic', emoji: '🎬', description: 'চলচ্চিত্রের নাটকীয় আবহ' },
  { id: 'instrumental', name: 'Instrumental', emoji: '🎹', description: 'বাঁশি, বেহালা ও সেতার' },
  { id: 'lofi', name: 'Lo-fi Beats', emoji: '🎧', description: 'মৃদু রিদম ও রিল্যাক্সিং লুপ' },
];

// 🎵 Rich Puthia-Centric & Multi-Category Seed Tracks
export const SEED_MUSIC_TRACKS: MusicTrack[] = [
  // 📍 Puthia Heritage & Soundscapes
  {
    id: 'puthia_flute_dawn',
    title: '🌾 পুঠিয়ার মেঠো সুর (বাঁশির তান)',
    artist: 'পুঠিয়া লোকসাংস্কৃতিক ফোরাম',
    category: 'puthia_heritage',
    subCategories: ['folk', 'morning', 'instrumental'],
    audioUrl: 'https://cdn.freesound.org/previews/563/563812_11861866-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80',
    duration: 35,
    isPuthiaSpecial: true,
    isTrending: true,
    isFeatured: true,
    isNew: false,
    license: 'puthia_heritage',
    licenseNote: 'পুঠিয়া ঐতিহ্যভিত্তিক লাইসেন্স-মুক্ত লোকসুর',
    playsCount: 2840,
    usesCount: 940,
    tags: ['পুঠিয়া', 'বাঁশি', 'মেঠো সুর', 'সকাল', 'flute', 'heritage'],
    synthType: 'flute'
  },
  {
    id: 'puthia_padma_breeze',
    title: '🌊 পদ্মার পাড়ের শান্ত বাতাস ও ঢেউ',
    artist: 'রাজশাহী নেচার সাউন্ডস্কেপ',
    category: 'puthia_heritage',
    subCategories: ['nature', 'chill', 'rural'],
    audioUrl: 'https://cdn.freesound.org/previews/415/415510_5121236-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    duration: 42,
    isPuthiaSpecial: true,
    isTrending: true,
    isFeatured: true,
    isNew: false,
    license: 'royalty_free',
    licenseNote: 'Royalty-Free Nature Field Recording',
    playsCount: 1980,
    usesCount: 620,
    tags: ['পদ্মা নদী', 'বাতাস', 'শান্ত', 'নদী', 'soundscape'],
    synthType: 'river'
  },
  {
    id: 'puthia_shiva_temple_chimes',
    title: '🕌 শিব মন্দির প্রাঙ্গণের গোধূলি লগ্ন',
    artist: 'ঐতিহাসিক পুঠিয়া হেরিটেজ ট্রাস্ট',
    category: 'puthia_heritage',
    subCategories: ['spiritual', 'night', 'instrumental'],
    audioUrl: 'https://cdn.freesound.org/previews/346/346119_5828667-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80',
    duration: 38,
    isPuthiaSpecial: true,
    isTrending: false,
    isFeatured: true,
    isNew: false,
    license: 'puthia_heritage',
    licenseNote: 'ঐতিহাসিক পুঠিয়া মনুমেন্ট অডিও',
    playsCount: 1420,
    usesCount: 410,
    tags: ['পুঠিয়া রাজবাড়ি', 'শিব মন্দির', 'গোধূলি', 'শান্ত', 'heritage'],
    synthType: 'harmonium'
  },
  {
    id: 'puthia_boishakhi_dhol',
    title: '🍉 বৈশাখী মেলার ঢাক ও সানাই',
    artist: 'বানেশ্বর বৈশাখী উৎসব উদযাপন দল',
    category: 'festive',
    subCategories: ['puthia_heritage', 'joy', 'rural'],
    audioUrl: 'https://cdn.freesound.org/previews/387/387232_1474204-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80',
    duration: 30,
    isPuthiaSpecial: true,
    isTrending: true,
    isFeatured: true,
    isNew: true,
    license: 'creative_commons',
    licenseNote: 'CC-BY Local Cultural Recording',
    playsCount: 3120,
    usesCount: 1180,
    tags: ['বৈশাখী', 'মেলা', 'ঢাক', 'উৎসব', 'boishakh', 'dhol'],
    synthType: 'dhol'
  },
  {
    id: 'puthia_rain_monsoon',
    title: '🌧️ শ্রাবণের ঝিরিঝিরি বৃষ্টি ও মেঘের গুড়গুড়',
    artist: 'পুঠিয়া বর্ষা আবহ',
    category: 'rain',
    subCategories: ['nature', 'chill', 'puthia_heritage'],
    audioUrl: 'https://cdn.freesound.org/previews/531/531947_11861866-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=400&q=80',
    duration: 45,
    isPuthiaSpecial: true,
    isTrending: true,
    isFeatured: true,
    isNew: false,
    license: 'royalty_free',
    licenseNote: 'Royalty-Free Monsoon Soundscape',
    playsCount: 3890,
    usesCount: 1450,
    tags: ['বৃষ্টি', 'বর্ষা', 'শ্রাবণ', 'মেঘ', 'rain', 'monsoon'],
    synthType: 'rain'
  },
  {
    id: 'puthia_baul_ektara',
    title: '🎻 মাটির টানে বাউলের একতারা ও দোতারা',
    artist: 'পদ্মাপাড়ের বাউল সংঘ',
    category: 'baul',
    subCategories: ['folk', 'puthia_heritage', 'spiritual'],
    audioUrl: 'https://cdn.freesound.org/previews/563/563812_11861866-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    duration: 36,
    isPuthiaSpecial: true,
    isTrending: true,
    isFeatured: true,
    isNew: false,
    license: 'puthia_heritage',
    licenseNote: 'ঐতিহ্যবাহী লোকসংস্কৃতি আর্কাইভ',
    playsCount: 2210,
    usesCount: 780,
    tags: ['বাউল', 'একতারা', 'দোতারা', 'মাটির গান', 'ektara', 'baul'],
    synthType: 'ektara'
  },
  {
    id: 'puthia_village_morning_birds',
    title: '🌅 পুঠিয়ার ভোরের পাখির কলকাকলি',
    artist: 'সবুজ গ্রাম প্রকল্প',
    category: 'morning',
    subCategories: ['nature', 'puthia_heritage', 'chill'],
    audioUrl: 'https://cdn.freesound.org/previews/415/415510_5121236-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=400&q=80',
    duration: 40,
    isPuthiaSpecial: true,
    isTrending: false,
    isFeatured: true,
    isNew: true,
    license: 'royalty_free',
    licenseNote: 'Royalty-Free Bird Song Recording',
    playsCount: 1650,
    usesCount: 520,
    tags: ['ভোর', 'পাখির ডাক', 'সকাল', 'শান্ত', 'birds', 'morning'],
    synthType: 'birds'
  },

  // 🌿 Nature & Chill Soundscapes
  {
    id: 'chill_lofi_evening',
    title: '🎧 শান্ত সন্ধ্যার মৃদু লো-ফাই বিট (Lo-fi Relax)',
    artist: 'Adda Chill Records',
    category: 'lofi',
    subCategories: ['chill', 'night'],
    audioUrl: 'https://cdn.freesound.org/previews/563/563812_11861866-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80',
    duration: 35,
    isTrending: true,
    isFeatured: true,
    isNew: true,
    license: 'royalty_free',
    licenseNote: 'Royalty-Free Beat Library',
    playsCount: 4200,
    usesCount: 1820,
    tags: ['lofi', 'chill', 'সন্ধ্যা', 'রিলাক্স', 'beats'],
    synthType: 'lofi'
  },
  {
    id: 'romantic_acoustic_guitar',
    title: '💕 মায়াবী মুহূর্তের অ্যাকোস্টিক গিটার',
    artist: 'আড্ডা মিউজিক ল্যাব',
    category: 'romantic',
    subCategories: ['instrumental', 'joy'],
    audioUrl: 'https://cdn.freesound.org/previews/346/346119_5828667-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&q=80',
    duration: 32,
    isTrending: true,
    isFeatured: true,
    isNew: false,
    license: 'royalty_free',
    licenseNote: 'Royalty-Free Acoustic Melodies',
    playsCount: 3450,
    usesCount: 1290,
    tags: ['রোমান্টিক', 'গিটার', 'ভালোবাসা', 'acoustic', 'love'],
    synthType: 'harmonium'
  },
  {
    id: 'cinematic_epic_inspiration',
    title: '🎬 নতুন দিগন্তের অনুপ্রেরণা (Cinematic Piano & Strings)',
    artist: 'হোপ স্টুডিও',
    category: 'cinematic',
    subCategories: ['motivation', 'instrumental'],
    audioUrl: 'https://cdn.freesound.org/previews/387/387232_1474204-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&q=80',
    duration: 45,
    isTrending: false,
    isFeatured: true,
    isNew: true,
    license: 'royalty_free',
    licenseNote: 'Royalty-Free Cinematic Composition',
    playsCount: 2100,
    usesCount: 670,
    tags: ['cinematic', 'পিয়ানো', 'অনুপ্রেরণা', 'epic', 'piano'],
    synthType: 'harmonium'
  },
  {
    id: 'patriotic_sonar_bangla_melody',
    title: '🇧🇩 আমার সোনার বাংলা (বাঁশির মায়াবী মূর্ছনা)',
    artist: 'জাতীয় ঐতিহ্য পরিষদ',
    category: 'patriotic',
    subCategories: ['folk', 'puthia_heritage', 'instrumental'],
    audioUrl: 'https://cdn.freesound.org/previews/563/563812_11861866-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1588698925585-78326e033d59?w=400&q=80',
    duration: 35,
    isTrending: true,
    isFeatured: true,
    isNew: false,
    license: 'public_domain',
    licenseNote: 'বাংলাদেশ জাতীয় ঐতিহ্য পাবলিক ডোমেইন',
    playsCount: 4600,
    usesCount: 1980,
    tags: ['দেশাত্মবোধক', 'সোনার বাংলা', 'বাংলাদেশ', 'বাঁশি', 'patriotism'],
    synthType: 'flute'
  },
  {
    id: 'rural_village_fair_shehnai',
    title: '🎪 গ্রামীণ পুতুলনাচ ও সানাইয়ের সুর',
    artist: 'লোককলা কেন্দ্র পুঠিয়া',
    category: 'rural',
    subCategories: ['folk', 'festive'],
    audioUrl: 'https://cdn.freesound.org/previews/387/387232_1474204-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    duration: 30,
    isTrending: false,
    isFeatured: false,
    isNew: false,
    license: 'puthia_heritage',
    licenseNote: 'লোক সংস্কৃতি সংরক্ষণাগার',
    playsCount: 1340,
    usesCount: 430,
    tags: ['সানাই', 'পুতুলনাচ', 'গ্রামীণ', 'মেলা', 'shehnai'],
    synthType: 'dhol'
  },
  {
    id: 'sad_melancholic_violin',
    title: '😢 হারানো স্মৃতির দীর্ঘশ্বাস (বেহালা ও বৃষ্টি)',
    artist: 'ইমোশনাল সিম্ফনি',
    category: 'sad',
    subCategories: ['rain', 'instrumental'],
    audioUrl: 'https://cdn.freesound.org/previews/346/346119_5828667-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80',
    duration: 34,
    isTrending: false,
    isFeatured: false,
    isNew: false,
    license: 'royalty_free',
    licenseNote: 'Royalty-Free Melancholic Strings',
    playsCount: 1870,
    usesCount: 560,
    tags: ['বিষণ্ণ', 'বেহালা', 'স্মৃতি', 'নীরবতা', 'violin', 'sad'],
    synthType: 'harmonium'
  },
  {
    id: 'joy_happy_whistle_ukulele',
    title: '😊 মিষ্টি রোদের বাঁশি ও ইউকুলেলে (Happy Vibes)',
    artist: 'সানশাইন সুর',
    category: 'joy',
    subCategories: ['morning', 'chill'],
    audioUrl: 'https://cdn.freesound.org/previews/563/563812_11861866-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=400&q=80',
    duration: 28,
    isTrending: true,
    isFeatured: false,
    isNew: true,
    license: 'royalty_free',
    licenseNote: 'Royalty-Free Happy Acoustic',
    playsCount: 2900,
    usesCount: 1040,
    tags: ['আনন্দ', 'হাসি', 'ইউকুলেলে', 'happy', 'ukulele'],
    synthType: 'flute'
  }
];

// 🔊 Interactive Web Audio Real-Time Melodic & Soundscape Synthesizer
// Provides zero-latency, reliable, instant playback in any browser environment
class WebAudioSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: { oscList?: OscillatorNode[]; gain?: GainNode; source?: AudioBufferSourceNode; interval?: any } | null = null;
  private isPlaying = false;
  private currentTrackId: string | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playSynthesizedTrack(track: MusicTrack, volume: number = 0.8, onProgress?: (currentTime: number) => void): void {
    this.stop();
    const ctx = this.getContext();
    this.isPlaying = true;
    this.currentTrackId = track.id;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const synthType = track.synthType || 'flute';
    let cleanupFn: () => void = () => {};

    if (synthType === 'rain' || synthType === 'river') {
      // Pink/Brown noise generator with bandpass filter for authentic rain / river sound
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(synthType === 'rain' ? 1200 : 800, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start();

      this.activeNodes = { gain: masterGain, source: noiseSource };
      cleanupFn = () => {
        try { noiseSource.stop(); } catch {}
      };
    } else if (synthType === 'flute' || synthType === 'ektara' || synthType === 'harmonium' || synthType === 'birds' || synthType === 'lofi') {
      // Melodic notes sequence (Puthia Bengali Raag Bhupali & Folk Scales)
      // Notes in Hz: C4, D4, E4, G4, A4, C5 (Folk Pentatonic Scale: Sa, Re, Ga, Pa, Dha, Sa')
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
      const melody = [0, 1, 2, 4, 3, 2, 1, 0, 4, 5, 4, 2, 1, 0];
      let noteIndex = 0;

      const playNote = () => {
        if (!this.isPlaying || this.currentTrackId !== track.id) return;
        const freq = scale[melody[noteIndex % melody.length]];
        noteIndex++;

        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        if (synthType === 'flute') {
          osc.type = 'sine';
        } else if (synthType === 'ektara') {
          osc.type = 'sawtooth';
        } else if (synthType === 'lofi') {
          osc.type = 'triangle';
        } else {
          osc.type = 'triangle';
        }

        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        noteGain.gain.setValueAtTime(0.01, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.0);
      };

      playNote();
      const interval = setInterval(playNote, 500);

      // Drone oscillator for Baul / Folk authenticity
      const droneOsc = ctx.createOscillator();
      const droneGain = ctx.createGain();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(130.81, ctx.currentTime); // Low C drone
      droneGain.gain.setValueAtTime(0.08, ctx.currentTime);
      droneOsc.connect(droneGain);
      droneGain.connect(masterGain);
      droneOsc.start();

      this.activeNodes = { gain: masterGain, interval, oscList: [droneOsc] };
      cleanupFn = () => {
        clearInterval(interval);
        try { droneOsc.stop(); } catch {}
      };
    } else {
      // Dhol / Rhythm pulses
      const playBeat = () => {
        if (!this.isPlaying || this.currentTrackId !== track.id) return;
        const osc = ctx.createOscillator();
        const beatGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.15);
        beatGain.gain.setValueAtTime(0.4, ctx.currentTime);
        beatGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(beatGain);
        beatGain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      };
      playBeat();
      const interval = setInterval(playBeat, 400);
      this.activeNodes = { gain: masterGain, interval };
      cleanupFn = () => clearInterval(interval);
    }
  }

  public stop(): void {
    this.isPlaying = false;
    this.currentTrackId = null;
    if (this.activeNodes) {
      if (this.activeNodes.interval) clearInterval(this.activeNodes.interval);
      if (this.activeNodes.oscList) {
        this.activeNodes.oscList.forEach(osc => {
          try { osc.stop(); } catch {}
        });
      }
      if (this.activeNodes.source) {
        try { this.activeNodes.source.stop(); } catch {}
      }
      this.activeNodes = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }
}

export const webAudioSynth = new WebAudioSoundscapeEngine();

// 🎶 Centralized Music Service
class MusicLibraryService {
  private localCustomTracks: MusicTrack[] = [];
  private favoritesCache: Set<string> = new Set();
  private recentlyUsedCache: string[] = [];
  private audioPlayer: HTMLAudioElement | null = null;
  private currentlyPlayingTrack: MusicTrack | null = null;
  private isSynthesizerActive = false;

  constructor() {
    this.loadFavoritesFromStorage();
    this.loadRecentlyUsedFromStorage();
    this.loadCustomTracksFromStorage();
  }

  private loadFavoritesFromStorage() {
    try {
      const stored = localStorage.getItem('adda_music_favorites');
      if (stored) {
        const arr = JSON.parse(stored);
        this.favoritesCache = new Set(arr);
      }
    } catch {}
  }

  private loadRecentlyUsedFromStorage() {
    try {
      const stored = localStorage.getItem('adda_music_recently_used');
      if (stored) {
        this.recentlyUsedCache = JSON.parse(stored);
      }
    } catch {}
  }

  private loadCustomTracksFromStorage() {
    try {
      const stored = localStorage.getItem('adda_admin_custom_music');
      if (stored) {
        this.localCustomTracks = JSON.parse(stored);
      }
    } catch {}
  }

  /**
   * Get all tracks combining predefined seed and admin custom tracks
   */
  public async getAllTracks(options?: { includeHidden?: boolean }): Promise<MusicTrack[]> {
    let firestoreTracks: MusicTrack[] = [];
    try {
      const q = query(collection(db, 'music_library'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        firestoreTracks = snap.docs.map(d => ({ id: d.id, ...d.data() } as MusicTrack));
      }
    } catch (e) {
      console.warn('Firestore music library fallback to local seed:', e);
    }

    const mergedMap = new Map<string, MusicTrack>();
    
    // Seed tracks
    SEED_MUSIC_TRACKS.forEach(t => mergedMap.set(t.id, t));
    // Local storage tracks
    this.localCustomTracks.forEach(t => mergedMap.set(t.id, t));
    // Firestore tracks
    firestoreTracks.forEach(t => mergedMap.set(t.id, t));

    let all = Array.from(mergedMap.values());
    if (!options?.includeHidden) {
      all = all.filter(t => !t.isHidden);
    }

    return all;
  }

  /**
   * Search & Filter Tracks
   */
  public async queryTracks(params: {
    searchTerm?: string;
    category?: MusicCategoryType;
    puthiaSpecialOnly?: boolean;
    trendingOnly?: boolean;
    favoritesOnly?: boolean;
    userId?: string;
    includeHidden?: boolean;
  }): Promise<MusicTrack[]> {
    const all = await this.getAllTracks({ includeHidden: params.includeHidden });
    let results = all;

    // 1. Filter by category
    if (params.category && params.category !== 'all') {
      if (params.category === 'trending') {
        results = results.filter(t => t.isTrending);
      } else if (params.category === 'popular') {
        results = results.sort((a, b) => b.playsCount - a.playsCount);
      } else if (params.category === 'new') {
        results = results.filter(t => t.isNew);
      } else if (params.category === 'puthia_heritage') {
        results = results.filter(t => t.isPuthiaSpecial || t.category === 'puthia_heritage');
      } else {
        results = results.filter(t => t.category === params.category || t.subCategories?.includes(params.category!));
      }
    }

    // 2. Filter Puthia Special
    if (params.puthiaSpecialOnly) {
      results = results.filter(t => t.isPuthiaSpecial);
    }

    // 3. Filter Trending
    if (params.trendingOnly) {
      results = results.filter(t => t.isTrending);
    }

    // 4. Filter Favorites
    if (params.favoritesOnly) {
      results = results.filter(t => this.favoritesCache.has(t.id));
    }

    // 5. Search query (Bangla & English keyword search)
    if (params.searchTerm && params.searchTerm.trim()) {
      const term = params.searchTerm.toLowerCase().trim();
      results = results.filter(t => {
        const titleMatch = t.title.toLowerCase().includes(term);
        const artistMatch = t.artist.toLowerCase().includes(term);
        const tagMatch = t.tags.some(tag => tag.toLowerCase().includes(term));
        const categoryMatch = t.category.toLowerCase().includes(term);
        return titleMatch || artistMatch || tagMatch || categoryMatch;
      });
    }

    return results;
  }

  /**
   * Get Recently Used Tracks
   */
  public async getRecentlyUsedTracks(): Promise<MusicTrack[]> {
    const all = await this.getAllTracks();
    const map = new Map(all.map(t => [t.id, t]));
    return this.recentlyUsedCache.map(id => map.get(id)).filter(Boolean) as MusicTrack[];
  }

  /**
   * Record Track Selection Usage
   */
  public recordTrackUsage(trackId: string): void {
    // Add to recently used cache
    this.recentlyUsedCache = [trackId, ...this.recentlyUsedCache.filter(id => id !== trackId)].slice(0, 15);
    try {
      localStorage.setItem('adda_music_recently_used', JSON.stringify(this.recentlyUsedCache));
    } catch {}

    // Increment Firestore use counter asynchronously
    try {
      updateDoc(doc(db, 'music_library', trackId), {
        usesCount: increment(1)
      }).catch(() => {});
    } catch {}
  }

  /**
   * Toggle Favorite
   */
  public toggleFavorite(trackId: string, userId?: string): boolean {
    let isFav = false;
    if (this.favoritesCache.has(trackId)) {
      this.favoritesCache.delete(trackId);
      isFav = false;
    } else {
      this.favoritesCache.add(trackId);
      isFav = true;
    }

    try {
      localStorage.setItem('adda_music_favorites', JSON.stringify(Array.from(this.favoritesCache)));
    } catch {}

    if (userId) {
      const favDocRef = doc(db, 'user_music_favorites', `${userId}_${trackId}`);
      if (isFav) {
        setDoc(favDocRef, {
          userId,
          trackId,
          addedAt: serverTimestamp()
        }).catch(() => {});
      } else {
        deleteDoc(favDocRef).catch(() => {});
      }
    }

    return isFav;
  }

  public isFavorite(trackId: string): boolean {
    return this.favoritesCache.has(trackId);
  }

  /**
   * Live Audio Playback & Preview with Synthesizer Fallback
   */
  public playPreview(
    track: MusicTrack, 
    options?: { 
      volume?: number; 
      startTime?: number; 
      onTimeUpdate?: (currentTime: number, duration: number) => void;
      onEnded?: () => void;
    }
  ): void {
    this.stopPlayback();

    this.currentlyPlayingTrack = track;
    const vol = options?.volume ?? 0.8;
    const startTime = options?.startTime ?? 0;

    // Create standard HTML Audio element
    const audio = new Audio();
    audio.src = track.audioUrl;
    audio.volume = vol;
    audio.currentTime = startTime;
    this.audioPlayer = audio;

    let hasFallbackTriggered = false;

    const triggerSynthFallback = () => {
      if (hasFallbackTriggered) return;
      hasFallbackTriggered = true;
      this.isSynthesizerActive = true;
      webAudioSynth.playSynthesizedTrack(track, vol);
    };

    audio.addEventListener('timeupdate', () => {
      if (options?.onTimeUpdate) {
        options.onTimeUpdate(audio.currentTime, audio.duration || track.duration);
      }
    });

    audio.addEventListener('ended', () => {
      this.stopPlayback();
      if (options?.onEnded) options.onEnded();
    });

    audio.addEventListener('error', () => {
      console.info('Audio URL unreachable, initiating real-time Web Audio Synthesizer fallback for:', track.title);
      triggerSynthFallback();
    });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Fallback to real-time Web Audio Synthesizer for instant melody
        triggerSynthFallback();
      });
    }
  }

  /**
   * Stop Playback
   */
  public stopPlayback(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.src = '';
      this.audioPlayer = null;
    }
    webAudioSynth.stop();
    this.isSynthesizerActive = false;
    this.currentlyPlayingTrack = null;
  }

  public getCurrentlyPlayingTrack(): MusicTrack | null {
    return this.currentlyPlayingTrack;
  }

  public isPlayingTrack(trackId: string): boolean {
    return this.currentlyPlayingTrack?.id === trackId;
  }

  // ================= ADMIN MANAGEMENT =================

  /**
   * Add new music track (Admin)
   */
  public async addTrack(trackData: Omit<MusicTrack, 'id' | 'playsCount' | 'usesCount'>): Promise<MusicTrack> {
    const id = `custom_track_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTrack: MusicTrack = {
      id,
      ...trackData,
      playsCount: 0,
      usesCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Save to local storage cache
    this.localCustomTracks.unshift(newTrack);
    try {
      localStorage.setItem('adda_admin_custom_music', JSON.stringify(this.localCustomTracks));
    } catch {}

    // Save to Firestore
    try {
      await setDoc(doc(db, 'music_library', id), {
        ...newTrack,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Firestore addTrack save note:', e);
    }

    return newTrack;
  }

  /**
   * Update track (Admin)
   */
  public async updateTrack(trackId: string, updates: Partial<MusicTrack>): Promise<void> {
    this.localCustomTracks = this.localCustomTracks.map(t => t.id === trackId ? { ...t, ...updates, updatedAt: Date.now() } : t);
    try {
      localStorage.setItem('adda_admin_custom_music', JSON.stringify(this.localCustomTracks));
    } catch {}

    try {
      await updateDoc(doc(db, 'music_library', trackId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Firestore updateTrack note:', e);
    }
  }

  /**
   * Delete track (Admin)
   */
  public async deleteTrack(trackId: string): Promise<void> {
    this.localCustomTracks = this.localCustomTracks.filter(t => t.id !== trackId);
    try {
      localStorage.setItem('adda_admin_custom_music', JSON.stringify(this.localCustomTracks));
    } catch {}

    try {
      await deleteDoc(doc(db, 'music_library', trackId));
    } catch (e) {
      console.warn('Firestore deleteTrack note:', e);
    }
  }

  /**
   * Toggle visibility (Hide/Show)
   */
  public async toggleVisibility(trackId: string, currentHidden: boolean): Promise<void> {
    await this.updateTrack(trackId, { isHidden: !currentHidden });
  }

  /**
   * Toggle Trending
   */
  public async toggleTrending(trackId: string, currentTrending: boolean): Promise<void> {
    await this.updateTrack(trackId, { isTrending: !currentTrending });
  }

  /**
   * Toggle Featured
   */
  public async toggleFeatured(trackId: string, currentFeatured: boolean): Promise<void> {
    await this.updateTrack(trackId, { isFeatured: !currentFeatured });
  }
}

export const musicLibraryService = new MusicLibraryService();
