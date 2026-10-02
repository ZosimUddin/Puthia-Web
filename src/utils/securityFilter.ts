// AI Toxic Comment & Spam Detection Filter for Puthia Platform

const TOXIC_KEYWORDS_BN = [
  "বাাজে", "খারাপ", "মরি", "খুন", "মারধর", "শালীনতা", "বাজে কথা", "গালাগালি", "ফেক", "প্রতারক", "চোর", "দালাল",
  "stupid", "idiot", "fraud", "scam", "spam", "fake", "hate", "abuse", "kill", "suicide"
];

const SPAM_KEYWORDS = [
  "free money", "win cash", "lottery", "click here", "subscribe", "earn fast", "100% bonus",
  "বিনা মূল্যে টাকা", "লটারি", "ক্লিক করুন", "অফার", "ফ্রিতে আয়"
];

export function checkToxicContent(text: string): { isToxic: boolean; reason?: string } {
  if (!text) return { isToxic: false };
  const lower = text.toLowerCase();

  // Check toxic or abusive keywords
  for (const word of TOXIC_KEYWORDS_BN) {
    if (lower.includes(word.toLowerCase())) {
      return { 
        isToxic: true, 
        reason: "এই কন্টেন্টে অনুপযুক্ত বা আক্রমণাত্মক ভাষা শনাক্ত হয়েছে (AI Toxic Filter)." 
      };
    }
  }

  // Check excessive uppercase (shouting)
  if (text.length > 20 && text === text.toUpperCase() && /[A-Z]/.test(text)) {
    return {
      isToxic: true,
      reason: "অতিরিক্ত বড় হাতের অক্ষর বা চিৎকারমূলক ভাষা ব্যবহার করা নিষিদ্ধ।"
    };
  }

  return { isToxic: false };
}

export function detectSpam(text: string): { isSpam: boolean; reason?: string } {
  if (!text) return { isSpam: false };
  const lower = text.toLowerCase();

  for (const word of SPAM_KEYWORDS) {
    if (lower.includes(word.toLowerCase())) {
      return {
        isSpam: true,
        reason: "এই কন্টেন্টটি স্প্যাম বা প্রমোশনাল অফার হিসেবে চিহ্নিত হয়েছে।"
      };
    }
  }

  // Check repetitive character spam (e.g. "aaaaaaa...")
  if (/(.)\1{6,}/.test(text)) {
    return {
      isSpam: true,
      reason: "অপ্রয়োজনীয় রিপিটেটিভ ক্যারেক্টার বা স্প্যাম শনাক্ত হয়েছে।"
    };
  }

  return { isSpam: false };
}
