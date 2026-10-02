import { GlobalFilterState } from './types';

interface ParsedIntent {
  updatedState: Partial<GlobalFilterState>;
  feedbackText: string;
}

const LOCATION_KEYWORDS: { [key: string]: { upazila?: string; thana?: string; union?: string } } = {
  'পুঠিয়া': { upazila: 'পুঠিয়া', thana: 'পুঠিয়া' },
  'পুঠিয়ায়': { upazila: 'পুঠিয়া', thana: 'পুঠিয়া' },
  'পুঠিয়ার': { upazila: 'পুঠিয়া', thana: 'পুঠিয়া' },
  'বানেশ্বর': { upazila: 'পুঠিয়া', union: 'বানেশ্বর' },
  'বানেশ্বরে': { upazila: 'পুঠিয়া', union: 'বানেশ্বর' },
  'বেলপুকুরিয়া': { upazila: 'পুঠিয়া', union: 'বেলপুকুরিয়া' },
  'বেলপুকুরিয়ায়': { upazila: 'পুঠিয়া', union: 'বেলপুকুরিয়া' },
  'ভালুকগাছি': { upazila: 'পুঠিয়া', union: 'ভালুকগাছি' },
  'জিউপাড়া': { upazila: 'পুঠিয়া', union: 'জিউপাড়া' },
  'শিলমাড়িয়া': { upazila: 'পুঠিয়া', union: 'শিলমাড়িয়া' },
  'রাজশাহী': { upazila: 'বোয়ালিয়া', union: 'রাজশাহী সিটি' },
  'রাজশাহীতে': { upazila: 'বোয়ালিয়া', union: 'রাজশাহী সিটি' },
  'বাঘমারা': { upazila: 'বাঘমারা' },
  'বাঘা': { upazila: 'বাঘা' },
  'চারঘাট': { upazila: 'চারঘাট' },
  'দুর্গাপুর': { upazila: 'দুর্গাপুর' },
};

const DOCTOR_SPECIALITY_MAP: { [key: string]: string } = {
  'শিশু': 'child',
  'বাচ্চা': 'child',
  'পেডিয়াট্রিক': 'child',
  'হৃদরোগ': 'heart',
  'হার্ট': 'heart',
  'কার্ডিওলজি': 'heart',
  'গাইনি': 'gynae',
  'স্ত্রী': 'gynae',
  'মহিলা': 'gynae',
  'গর্ভবতী': 'gynae',
  'চর্ম': 'skin',
  'চর্মরোগ': 'skin',
  'স্কিন': 'skin',
  'চোখ': 'eye',
  'চক্ষু': 'eye',
  'নাক': 'ent',
  'কান': 'ent',
  'গলা': 'ent',
  'ইএনটি': 'ent',
  'ডেন্টাল': 'dental',
  'দাঁত': 'dental',
  'দাঁতের': 'dental',
  'সার্জারি': 'surgery',
  'মেডিসিন': 'medicine',
  'নিউরো': 'neurology',
  'নিউরোলজি': 'neurology',
  'ব্রেইন': 'neurology',
  'মানসিক': 'psychiatry',
  'অর্থোপেডিক্স': 'orthopedics',
  'হাড়': 'orthopedics',
};

const AVAILABILITY_KEYWORDS: { [key: string]: 'open_today' | 'available_now' | 'chamber_today' | '24_hours' } = {
  'আজ খোলা': 'open_today',
  'আজকে খোলা': 'open_today',
  'এখন খোলা': 'available_now',
  'এখন পাওয়া যাবে': 'available_now',
  'আজ চেম্বার': 'chamber_today',
  '২৪ ঘণ্টা': '24_hours',
  '২৪ ঘন্টা': '24_hours',
  '24 ঘণ্টা': '24_hours',
  '24/7': '24_hours',
};

export function parseSmartSearchQuery(
  rawQuery: string,
  categoryOptions: { id: string; label: string }[] = []
): ParsedIntent {
  const query = rawQuery.trim().toLowerCase();
  const updates: Partial<GlobalFilterState> = {};
  const locationUpdates: Partial<GlobalFilterState['location']> = {};
  const feedbackParts: string[] = [];

  // 1. Location Detection
  for (const [kw, loc] of Object.entries(LOCATION_KEYWORDS)) {
    if (query.includes(kw)) {
      if (loc.upazila) locationUpdates.upazila = loc.upazila;
      if (loc.thana) locationUpdates.thana = loc.thana;
      if (loc.union) locationUpdates.union = loc.union;
      feedbackParts.push(`অবস্থান: ${kw}`);
      break;
    }
  }

  // 2. Doctor Speciality / Category Detection
  for (const [kw, catId] of Object.entries(DOCTOR_SPECIALITY_MAP)) {
    if (query.includes(kw)) {
      updates.category = catId;
      feedbackParts.push(`বিশেষজ্ঞতা: ${kw}`);
      break;
    }
  }

  // Also check standard category labels from config
  if (!updates.category && categoryOptions.length > 0) {
    for (const opt of categoryOptions) {
      if (opt.id !== 'all' && (query.includes(opt.label.toLowerCase()) || query.includes(opt.id.toLowerCase()))) {
        updates.category = opt.id;
        feedbackParts.push(`ক্যাটাগরি: ${opt.label}`);
        break;
      }
    }
  }

  // 3. Availability Detection
  for (const [kw, availVal] of Object.entries(AVAILABILITY_KEYWORDS)) {
    if (query.includes(kw)) {
      updates.availability = availVal;
      feedbackParts.push(`উপলব্ধতা: ${kw}`);
      break;
    }
  }

  // 4. Verification Detection
  if (query.includes('ভেরিফাইড') || query.includes('যাচাইকৃত')) {
    updates.verification = 'verified';
    feedbackParts.push(`যাচাইকরণ: ভেরিফাইড`);
  }

  // 5. Rating Detection
  if (query.includes('সেরা') || query.includes('ভাল') || query.includes('ভালো') || query.includes('টপ')) {
    updates.rating = '4.5+';
    updates.sortBy = 'rating';
    feedbackParts.push(`রেটিং: ৪.৫+`);
  }

  // 6. Proximity / Distance Detection
  if (query.includes('কাছাকাছি') || query.includes('কাছে')) {
    updates.distance = '5km';
    updates.sortBy = 'distance';
    feedbackParts.push(`দূরত্ব: কাছাকাছি (৫ কিমি)`);
  }

  if (Object.keys(locationUpdates).length > 0) {
    updates.location = {
      district: 'রাজশাহী',
      upazila: locationUpdates.upazila || 'all',
      thana: locationUpdates.thana || 'all',
      union: locationUpdates.union || 'all',
      village: '',
    };
  }

  const feedbackText = feedbackParts.length > 0
    ? `স্মার্ট ফিল্টার প্রয়োগ করা হয়েছে: ${feedbackParts.join(' • ')}`
    : `অনুসন্ধান করা হচ্ছে: "${rawQuery}"`;

  return {
    updatedState: updates,
    feedbackText,
  };
}
