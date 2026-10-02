// Advanced Fraud, Abuse & Spam Detection Engine for Puthia Smart Portal

export interface FraudAnalysisResult {
  isSuspicious: boolean;
  score: number; // 0 to 100
  flaggedReasons: string[];
  suggestedAction: 'approve' | 'flag_for_moderation' | 'rate_limit_exceeded';
}

export interface ReviewSubmission {
  userId: string;
  userIp?: string;
  rating: number;
  comment: string;
  submittedAt: number; // timestamp
}

export interface ListingSubmission {
  title: string;
  description: string;
  phone: string;
  address: string;
  userId: string;
  userIp?: string;
}

// In-Memory Rate Limiter Store
const submissionTimestamps: Record<string, number[]> = {};

// Spam & Offensive Words Dictionary
const SPAM_KEYWORDS = [
  "সহজে আয়", "ক্যাসিনো", "gambling", "loan offer", "সহজ ঋণ", "ফ্রি ডায়মন্ড", 
  "crypto investment", "100% free", "click here", "লটারি বিজয়ী", "টাকা দ্বিগুণ"
];

const SUSPICIOUS_PHONE_PATTERNS = [
  /^010/, /^011/, /^012/ // Invalid BD mobile prefixes
];

/**
 * 1. Spam & Fake Content Detection
 */
export function detectSpamContent(text: string): { isSpam: boolean; reasons: string[] } {
  if (!text) return { isSpam: false, reasons: [] };
  const lowerText = text.toLowerCase();
  const reasons: string[] = [];

  // Check spam keywords
  SPAM_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      reasons.push(`স্প্যাম কি-ওয়ার্ড সনাক্ত: "${keyword}"`);
    }
  });

  // Excessive URLs / Links
  const urlMatches = text.match(/https?:\/\/[^\s]+/g);
  if (urlMatches && urlMatches.length > 2) {
    reasons.push("অতিরিক্ত লিংক (URLs) যুক্ত করা হয়েছে");
  }

  // ALL CAPS or repeated gibberish characters
  if (/(.)\1{5,}/.test(text)) {
    reasons.push("একই অক্ষরের অপ্রয়োজনীয় পুনরাবৃত্তি");
  }

  return {
    isSpam: reasons.length > 0,
    reasons
  };
}

/**
 * 2. Fake Review & Rating Manipulation Detection
 */
export function detectFakeReview(
  review: ReviewSubmission,
  userHistory: ReviewSubmission[] = []
): FraudAnalysisResult {
  const reasons: string[] = [];
  let score = 0;

  // Extremely short high or low rating comment
  if ((review.rating === 1 || review.rating === 5) && review.comment.trim().length < 5) {
    score += 35;
    reasons.push("সংক্ষিপ্ত একপেশে রিভিউ (স্প্যাম বা ফেক হওয়ার আশঙ্কা)");
  }

  // Rapid submissions from same user (within 60 seconds)
  const recentReviews = userHistory.filter(
    r => review.submittedAt - r.submittedAt < 60 * 1000
  );
  if (recentReviews.length >= 2) {
    score += 50;
    reasons.push("১ মিনিটের মধ্যে একাধিক রিভিউ জমা দেয়া হয়েছে (Mass Reviewing)");
  }

  // Spam text check
  const spamCheck = detectSpamContent(review.comment);
  if (spamCheck.isSpam) {
    score += 40;
    reasons.push(...spamCheck.reasons);
  }

  return {
    isSuspicious: score >= 40,
    score: Math.min(score, 100),
    flaggedReasons: reasons,
    suggestedAction: score >= 40 ? 'flag_for_moderation' : 'approve'
  };
}

/**
 * 3. Rate Limiting Check (Prevents Automated Spam Bots)
 */
export function checkRateLimit(key: string, limitCount: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  if (!submissionTimestamps[key]) {
    submissionTimestamps[key] = [];
  }

  // Filter timestamps within window
  submissionTimestamps[key] = submissionTimestamps[key].filter(ts => now - ts < windowMs);

  if (submissionTimestamps[key].length >= limitCount) {
    return false; // Rate limit exceeded
  }

  submissionTimestamps[key].push(now);
  return true; // Allowed
}

/**
 * 4. Fake Listing & Mass Reporting Protection
 */
export function analyzeListingSubmission(listing: ListingSubmission): FraudAnalysisResult {
  const reasons: string[] = [];
  let score = 0;

  // Rate Limiting Check by User IP or User ID
  const rateLimitKey = listing.userIp || listing.userId || "anonymous";
  const isAllowed = checkRateLimit(rateLimitKey, 3, 300000); // Max 3 submissions in 5 mins
  if (!isAllowed) {
    score += 70;
    reasons.push("স্বল্প সময়ে ঘনঘন সাবমিশন (Rate limit exceeded)");
  }

  // Phone number validity check
  const cleanPhone = listing.phone.replace(/\D/g, "");
  if (cleanPhone.length !== 11) {
    score += 45;
    reasons.push("অকার্যকর ফোন নম্বর (১১ ডিজিটাল নয়)");
  }

  SUSPICIOUS_PHONE_PATTERNS.forEach(pattern => {
    if (pattern.test(cleanPhone)) {
      score += 60;
      reasons.push("সন্দেহজনক মোবাইল নম্বর প্রিফিক্স");
    }
  });

  // Spam keywords in title/description
  const titleSpam = detectSpamContent(listing.title);
  const descSpam = detectSpamContent(listing.description);

  if (titleSpam.isSpam) {
    score += 40;
    reasons.push(...titleSpam.reasons);
  }
  if (descSpam.isSpam) {
    score += 30;
    reasons.push(...descSpam.reasons);
  }

  return {
    isSuspicious: score >= 40,
    score: Math.min(score, 100),
    flaggedReasons: reasons,
    suggestedAction: !isAllowed ? 'rate_limit_exceeded' : (score >= 40 ? 'flag_for_moderation' : 'approve')
  };
}
