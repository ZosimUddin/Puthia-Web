// Search utilities for Bengali + English phonetic, digit, and synonym normalization
// With added Typo-Tolerance (Fuzzy matching), Recent/Popular searches and Spelling suggestions.

// Map of common Bengali to English numbers and vice versa
export const bnToEnDigits = (str: string = ''): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (w) => bnDigits.indexOf(w).toString());
};

export const enToBnDigits = (str: string = ''): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (w) => bnDigits[parseInt(w)] || w);
};

// Conversational stop words that shouldn't break a match
const BENGALI_STOP_WORDS = new Set([
  'কোথায়', 'কোথায়', 'কিভাবে', 'কীভাবে', 'কি', 'কী', 'কে', 'কবে', 'কেন', 'কোন', 'কোথা', 
  'পুঠিয়ায়', 'পুঠিয়ায়', 'পুঠিয়া', 'পুঠিয়া', 'উপজেলায়', 'উপজেলায়', 'ভালো', 'ভাল', 
  'সেরা', 'খুঁজছি', 'খুজছি', 'চাই', 'দরকার', 'প্রয়োজন', 'আছি', 'আছে', 'দেখান', 
  'বলুন', 'কোথায় পাব', 'পাবো', 'কোথায় পাবো'
]);

// Common Bengali-English Search Synonyms / Aliases
const SEARCH_SYNONYMS: Record<string, string[]> = {
  'ডাক্তার': ['doctor', 'dr', 'চিকিৎসক', 'হাসপাতাল', 'মেডিকেল', 'চেম্বার'],
  'doctor': ['ডাক্তার', 'dr', 'চিকিৎসক', 'হাসপাতাল', 'মেডিকেল', 'চেম্বার'],
  'রক্ত': ['blood', 'রক্তদাতা', 'donor', 'ব্লাড', 'গ্রুপ'],
  'blood': ['রক্ত', 'রক্তদাতা', 'donor', 'ব্লাড', 'গ্রুপ'],
  'অ্যাম্বুলেন্স': ['ambulance', 'জরুরি', 'emergency', 'হাসপাতাল'],
  'ambulance': ['অ্যাম্বুলেন্স', 'জরুরি', 'emergency', 'হাসপাতাল'],
  'পুলিশ': ['police', 'থানা', 'নিরাপত্তা', 'জরুরি', 'ওসি', 'পুলিশিং'],
  'police': ['পুলিশ', 'থানা', 'নিরাপত্তা', 'জরুরি', 'ওসি', 'পুলিশিং'],
  'জরুরি': ['emergency', 'অ্যাম্বুলেন্স', 'ফায়ার সার্ভিস', 'পুলিশ', 'হটলাইন', 'হেল্পলাইন'],
  'emergency': ['জরুরি', 'অ্যাম্বুলেন্স', 'ফায়ার সার্ভিস', 'পুলিশ', 'হটলাইন', 'হেল্পলাইন'],
  'ব্যবসা': ['business', 'shop', 'দোকান', 'মার্কেট', 'ডিরেক্টরি', 'বাজার', 'হকার'],
  'business': ['ব্যবসা', 'shop', 'দোকান', 'মার্কেট', 'ডিরেক্টরি', 'বাজার', 'হকার'],
  'রাজবাড়ী': ['rajbari', 'রাজবাড়ি', 'টেম্পল', 'মন্দির', 'ঐতিহাসিক', 'পর্যটন'],
  'rajbari': ['রাজবাড়ী', 'রাজবাড়ি', 'টেম্পল', 'মন্দির', 'ঐতিহাসিক', 'পর্যটন'],
  'স্কুল': ['school', 'কলেজ', 'শিক্ষা', 'মাদ্রাসা', 'বিদ্যালয়'],
  'school': ['স্কুল', 'কলেজ', 'শিক্ষা', 'মাদ্রাসা', 'বিদ্যালয়'],
  'বাস': ['bus', 'পরিবহন', 'গাড়ি', 'কাউন্টার', 'টিকিট', 'স্ট্যান্ড'],
  'bus': ['বাস', 'পরিবহন', 'গাড়ি', 'কাউন্টার', 'টিকিট', 'স্ট্যান্ড'],
  'খতিয়ান': ['khatian', 'জমির', 'ভূমি', 'পর্চা', 'খতিয়ান', 'পর্চা', 'দাগ'],
  'khatian': ['খতিয়ান', 'খতিয়ান', 'জমির', 'ভূমি', 'পর্চা', 'পর্চা', 'দাগ'],
  'নোটিশ': ['notice', 'বিজ্ঞপ্তি', 'সংবাদ', 'খবর', 'ঘোষণা'],
  'notice': ['নোটিশ', 'বিজ্ঞপ্তি', 'সংবাদ', 'খবর', 'ঘোষণা'],
  'রেস্টুরেন্ট': ['restaurant', 'হোটেল', 'খাবার', 'রেস্তোরাঁ', 'খাইতাম', 'খাব'],
  'restaurant': ['রেস্টুরেন্ট', 'হোটেল', 'খাবার', 'রেস্তোরাঁ', 'খাইতাম', 'খাব'],
};

// Known vocabulary for spelling corrections / "Did you mean?" suggestion
const CORRECT_SPELLINGS = [
  "ডাক্তার", "হাসপাতাল", "মেডিকেল", "ক্লিনিক", "রোগী",
  "অ্যাম্বুলেন্স", "জরুরি", "হটলাইন", "হেল্পলাইন",
  "রাজবাড়ী", "রাজবাড়ি", "দর্শনীয় স্থান", "ঐতিহাসিক",
  "বানেশ্বর", "পুঠিয়া", "উপজেলা", "প্রশাসন", "ইউএনও",
  "রক্তদাতা", "ব্লাড ব্যাংক", "রক্তদান",
  "স্কুল", "কলেজ", "মাদ্রাসা", "শিক্ষা",
  "বাস কাউন্টার", "ট্রেন সময়সূচী", "পরিবহন", "ভাড়া",
  "দোকান", "মার্কেট", "ব্যবসা", "উদ্যোক্তা",
  "মিস্ত্রি", "প্লাম্বার", "ইলেকট্রিশিয়ান", "সেবা",
  "খতিয়ান", "ভূমি সেবা", "পর্চা", "জমির দাগ",
  "রেস্টুরেন্ট", "হোটেল", "খাবার",
  "পুলিশ", "থানা", "ফায়ার সার্ভিস",
  "কৃষি", "খামার", "বাজার দর", "ফসলের দাম",
  "হারানো", "নিখোঁজ", "স্বেচ্ছাসেবক", "সাংবাদিক"
];

/**
 * Normalizes text for matching by converting to lowercase, 
 * standardizing digits, and stripping extra punctuation.
 */
export const normalizeText = (text: string = ''): string => {
  if (!text) return '';
  const lower = text.toLowerCase().trim();
  const digitNormalized = bnToEnDigits(lower);
  return digitNormalized.replace(/[^\w\s\u0980-\u09FF]/gi, '');
};

/**
 * Calculates the Levenshtein distance between two strings
 */
export const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
};

/**
 * Checks if targetText matches the searchQuery using fuzzy digit, 
 * substring, synonym, and full Typo-tolerant distance matching.
 * Also handles conversational queries by removing stop words.
 */
export const smartSearchMatch = (targetText: string = '', searchQuery: string = ''): boolean => {
  if (!searchQuery || !searchQuery.trim()) return true;
  if (!targetText) return false;

  const normalizedTarget = normalizeText(targetText);
  const rawQueryWords = normalizeText(searchQuery).split(/\s+/).filter(Boolean);
  
  // Filter out stop words for conversational voice search
  const queryWords = rawQueryWords.filter(word => !BENGALI_STOP_WORDS.has(word));
  
  // If query was entirely stop words (e.g. "কোথায়"), we can't do much, return false
  if (queryWords.length === 0) return false;
  
  // Create a combined normalized query after stop words removal
  const normalizedQuery = queryWords.join(' ');

  // 1. Direct substring match (or converted digits match)
  if (normalizedTarget.includes(normalizedQuery)) return true;

  // 1.5 Reverse check: if target text itself is fully within the query (useful for keyword targets)
  if (normalizedQuery.includes(normalizedTarget)) return true;

  // 2. Query words split match (with typo-tolerance per word)
  const targetWords = normalizedTarget.split(/\s+/).filter(Boolean);

  const allWordsMatch = queryWords.every((qWord) => {
    // Check direct substring match for this word
    if (normalizedTarget.includes(qWord)) return true;

    // Check synonym match
    const synonyms = SEARCH_SYNONYMS[qWord] || [];
    if (synonyms.some((syn) => normalizedTarget.includes(normalizeText(syn)))) return true;

    // Typo-tolerant distance check (maximum 1 typo for 3-4 letters, 2 typos for 5+ letters)
    const maxDistance = qWord.length <= 4 ? 1 : qWord.length <= 7 ? 2 : 3;
    return targetWords.some((tWord) => {
      // Length check as optimization
      if (Math.abs(tWord.length - qWord.length) > maxDistance) return false;
      return getLevenshteinDistance(qWord, tWord) <= maxDistance;
    });
  });

  if (allWordsMatch) return true;

  // 3. Reverse check Bengali <-> English digits substring
  const bnTarget = enToBnDigits(targetText.toLowerCase());
  const bnQuery = enToBnDigits(searchQuery.toLowerCase());
  if (bnTarget.includes(bnQuery)) return true;

  return false;
};

/**
 * Returns a spelling suggestion ("Did you mean?") if there is a close match to known vocabulary.
 */
export const getSpellingSuggestion = (query: string = ''): string | null => {
  if (!query || !query.trim()) return null;
  const words = normalizeText(query).split(/\s+/).filter(Boolean);

  for (const word of words) {
    if (word.length < 3) continue;

    // Check if it already matches perfectly
    const matchesPerfectly = CORRECT_SPELLINGS.some(correct => normalizeText(correct) === word);
    if (matchesPerfectly) continue;

    let bestMatch: string | null = null;
    let minDistance = 999;

    for (const correct of CORRECT_SPELLINGS) {
      const correctNorm = normalizeText(correct);
      if (Math.abs(correctNorm.length - word.length) > 2) continue;

      const dist = getLevenshteinDistance(word, correctNorm);
      if (dist < minDistance && dist <= 2) {
        minDistance = dist;
        bestMatch = correct;
      }
    }

    if (bestMatch) {
      return bestMatch;
    }
  }

  return null;
};

// Recent Searches Storage Helpers
const RECENT_SEARCHES_KEY = 'puthia_recent_searches_v1';

export const getRecentSearches = (): string[] => {
  try {
    const data = localStorage.getItem(RECENT_SEARCHES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveRecentSearch = (query: string): string[] => {
  if (!query || !query.trim()) return getRecentSearches();
  const trimmed = query.trim();
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 8); // Keep top 8
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
};

export const clearRecentSearches = (): void => {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (e) {
    // ignore
  }
};
