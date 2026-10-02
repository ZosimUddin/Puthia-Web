import { ReportCategory, ReportReasonDefinition, ReportableContentType } from '../types/moderation';

export const REPORT_CATEGORIES: {
  id: ReportCategory;
  name: string;
  bnName: string;
  icon: string;
  color: string;
  badgeBg: string;
  description: string;
}[] = [
  {
    id: 'safety',
    name: 'Safety & Protection',
    bnName: '🚨 নিরাপত্তা ও সুরক্ষা',
    icon: 'ShieldAlert',
    color: 'text-rose-600',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'হুমকি, সহিংসতা বা ব্যক্তিগত আক্রমণ সম্পর্কিত সমস্যা'
  },
  {
    id: 'spam',
    name: 'Spam & Disruption',
    bnName: '🚫 স্প্যাম ও অপপ্রচার',
    icon: 'Ban',
    color: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'অপ্রাসঙ্গিক বিজ্ঞাপন, বারবার একই বার্তা ও ফেক এনগেজমেন্ট'
  },
  {
    id: 'fake_impersonation',
    name: 'Fake & Impersonation',
    bnName: '🎭 ফেক ও পরিচয় জালিয়াতি',
    icon: 'UserX',
    color: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'অন্যের নাম-ছবি ব্যবহার বা ভুয়া অ্যাকাউন্ট ও পেজ'
  },
  {
    id: 'scam',
    name: 'Scam & Financial Fraud',
    bnName: '💰 স্ক্যাম ও আর্থিক প্রতারণা',
    icon: 'AlertOctagon',
    color: 'text-red-600',
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
    description: 'টাকা আত্মসাৎ, ভুয়া চাকরি বা ফেক মার্কেটপ্লেস বিজ্ঞাপন'
  },
  {
    id: 'inappropriate',
    name: 'Inappropriate Content',
    bnName: '🔞 অনৈতিক বা আপত্তিকর বিষয়বস্তু',
    icon: 'AlertTriangle',
    color: 'text-purple-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'অশ্লীলতা, নগ্নতা বা সাম্প্রদায়িক ঘৃণামূলক বক্তব্য'
  },
  {
    id: 'other',
    name: 'Other Policy Violation',
    bnName: '📝 অন্যান্য নীতি লঙ্ঘন',
    icon: 'FileText',
    color: 'text-slate-600',
    badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
    description: 'কমিউনিটি নির্দেশিকা সংক্রান্ত যেকোনো অনাকাঙ্ক্ষিত বিষয়'
  }
];

export const ALL_REPORT_REASONS: ReportReasonDefinition[] = [
  // 1. SAFETY
  {
    id: 'harassment',
    category: 'safety',
    label: 'Harassment & Bullying',
    bnLabel: 'ব্যক্তিগত আক্রমণ বা হ্যারাসমেন্ট (Harassment)',
    description: 'কাউকে অশালীন ভাষায় আক্রমণ, ট্রল করা বা মানসিকভাবে হেনস্তা করা',
    severity: 'high',
    icon: '⚠️',
    applicableTypes: ['post', 'comment', 'reply', 'profile', 'message', 'live'],
    detailsRequired: false
  },
  {
    id: 'threats',
    category: 'safety',
    label: 'Threats & Intimidation',
    bnLabel: 'হুমকি বা ভীতি প্রদর্শন (Threats)',
    description: 'শারীরিক ক্ষতি, ব্ল্যাকমেইল বা জীবনের হুমকির বার্তা',
    severity: 'critical',
    icon: '🛑',
    applicableTypes: ['post', 'comment', 'reply', 'profile', 'message', 'group', 'live'],
    detailsRequired: true
  },
  {
    id: 'violence',
    category: 'safety',
    label: 'Violence & Gore',
    bnLabel: 'সহিংসতা ও রক্তপাত (Violence)',
    description: 'রক্তাক্ত দৃশ্য, অস্ত্র প্রদর্শন বা মারামারির উসকানি',
    severity: 'critical',
    icon: '🩸',
    applicableTypes: ['post', 'story', 'reel', 'video', 'live', 'group', 'page'],
    detailsRequired: false
  },
  {
    id: 'dangerous_content',
    category: 'safety',
    label: 'Dangerous Content & Suicide',
    bnLabel: 'বিপজ্জনক ও ক্ষতিকর বিষয়বস্তু (Dangerous Content)',
    description: 'আত্মহত্যা, মাদকের প্রচারণা বা বিপজ্জনক বেআইনি কাজ',
    severity: 'critical',
    icon: '☣️',
    applicableTypes: ['post', 'story', 'reel', 'video', 'live', 'group', 'message'],
    detailsRequired: false
  },

  // 2. SPAM
  {
    id: 'spam_content',
    category: 'spam',
    label: 'Spam & Link Drops',
    bnLabel: 'স্প্যাম ও অনাকাঙ্ক্ষিত প্রচার (Spam)',
    description: 'অপ্রাসঙ্গিক বিজ্ঞাপন, ক্ষতিকর ফিশিং লিংক বা গ্রুপের বিষয়বস্তুর বাইরের পোস্ট',
    severity: 'low',
    icon: '📢',
    applicableTypes: ['post', 'comment', 'reply', 'message', 'group', 'page', 'marketplace', 'event'],
    detailsRequired: false
  },
  {
    id: 'fake_engagement',
    category: 'spam',
    label: 'Fake Engagement & Bot Activity',
    bnLabel: 'ফেক এনগেজমেন্ট ও বট কার্যকলাপ (Fake Engagement)',
    description: 'স্বয়ংক্রিয় কমেন্ট, লাইক ম্যানিপুলেশন বা কৃত্রিম ফলোয়ার বাড়ানো',
    severity: 'low',
    icon: '🤖',
    applicableTypes: ['post', 'comment', 'profile', 'page', 'group', 'reel'],
    detailsRequired: false
  },
  {
    id: 'repeated_content',
    category: 'spam',
    label: 'Repeated / Flood Content',
    bnLabel: 'একই বিষয়ের পুনরাবৃত্তি (Repeated Content)',
    description: 'অল্প সময়ে বারবার একই পোস্ট বা কমেন্ট ফ্লাডিং করা',
    severity: 'medium',
    icon: '🔁',
    applicableTypes: ['post', 'comment', 'reply', 'message', 'marketplace'],
    detailsRequired: false
  },

  // 3. FAKE / IMPERSONATION
  {
    id: 'fake_account',
    category: 'fake_impersonation',
    label: 'Fake Account',
    bnLabel: 'ভুয়া অ্যাকাউন্ট (Fake Account)',
    description: 'কাল্পনিক বা ভুয়া পরিচয় ব্যবহার করে চালিত অ্যাকাউন্ট',
    severity: 'medium',
    icon: '👤',
    applicableTypes: ['profile', 'message', 'comment'],
    detailsRequired: false
  },
  {
    id: 'impersonating_someone',
    category: 'fake_impersonation',
    label: 'Impersonating Someone',
    bnLabel: 'অন্যের পরিচয় চুরি বা ছদ্মবেশ (Impersonating Someone)',
    description: 'আমার বা অন্য কোনো সুপরিচিত ব্যক্তির নাম/ছবি নকল করা',
    severity: 'high',
    icon: '🎭',
    applicableTypes: ['profile', 'page', 'post', 'message'],
    detailsRequired: true
  },
  {
    id: 'fake_page_group',
    category: 'fake_impersonation',
    label: 'Fake Page / Group',
    bnLabel: 'ভুয়া পেজ বা অননুমোদিত গ্রুপ (Fake Page/Group)',
    description: 'সরকারি অফিস, প্রতিষ্ঠান বা নেতার নামে বিভ্রান্তিকর ভুয়া পেজ',
    severity: 'high',
    icon: '📄',
    applicableTypes: ['page', 'group', 'event'],
    detailsRequired: true
  },

  // 4. SCAM
  {
    id: 'fraud_transaction',
    category: 'scam',
    label: 'Financial Fraud & Blackmail',
    bnLabel: 'আর্থিক প্রতারণা ও জালিয়াতি (Fraud)',
    description: 'বিকাশ/নগদ পেমেন্ট নিয়ে মাল না দেওয়া বা টাকা হাতিয়ে নেওয়া',
    severity: 'critical',
    icon: '💸',
    applicableTypes: ['marketplace', 'post', 'message', 'page', 'group'],
    detailsRequired: true
  },
  {
    id: 'scam_lottery',
    category: 'scam',
    label: 'Scam, Fake Jobs & Lottery',
    bnLabel: 'স্ক্যাম ও ভুয়া লটারি/চাকরি (Scam)',
    description: 'ঘরে বসে সহজে আয়ের প্রলোভন, ভুয়া চাকরি বা পুরস্কার জেতার ফাঁদ',
    severity: 'high',
    icon: '🎰',
    applicableTypes: ['post', 'comment', 'message', 'marketplace', 'page', 'event'],
    detailsRequired: false
  },
  {
    id: 'fake_marketplace_listing',
    category: 'scam',
    label: 'Fake Marketplace Listing',
    bnLabel: 'ভুয়া মার্কেটপ্লেস লিস্টিং (Fake Listing)',
    description: 'পণ্য বাস্তবে নেই, ভুল দাম বা চুরির মালামাল বিক্রি চেষ্টা',
    severity: 'high',
    icon: '🛒',
    applicableTypes: ['marketplace', 'post'],
    detailsRequired: false
  },

  // 5. INAPPROPRIATE CONTENT
  {
    id: 'nudity_sexual',
    category: 'inappropriate',
    label: 'Nudity & Sexual Content',
    bnLabel: 'নগ্নতা ও অশালীন বিষয়বস্তু (Nudity/Sexual Content)',
    description: 'পর্নোগ্রাফি, নগ্ন ছবি বা যৌন ইঙ্গিতপূর্ণ অনুপযুক্ত পোস্ট',
    severity: 'critical',
    icon: '🔞',
    applicableTypes: ['post', 'comment', 'story', 'reel', 'video', 'live', 'profile', 'message'],
    detailsRequired: false
  },
  {
    id: 'hate_speech',
    category: 'inappropriate',
    label: 'Hate & Abusive Speech',
    bnLabel: 'ঘৃণামূলক বক্তব্য ও গালিগালাজ (Hate/Abusive Content)',
    description: 'ধর্ম, বর্ণ, লিঙ্গ বা জাতির বিরুদ্ধে বিদ্বেষ ছড়ানো ও কুরুচিপূর্ণ গালি',
    severity: 'high',
    icon: '🗣️',
    applicableTypes: ['post', 'comment', 'reply', 'video', 'reel', 'story', 'live', 'group', 'page'],
    detailsRequired: false
  },
  {
    id: 'misinformation',
    category: 'inappropriate',
    label: 'Misinformation & Rumors',
    bnLabel: 'গুজব ও বিভ্রান্তিকর অপতথ্য (Misinformation)',
    description: 'সমাজ বা পুঠিয়ায় বিশৃঙ্খলা সৃষ্টিকারী মিথ্যা খবর',
    severity: 'high',
    icon: '📰',
    applicableTypes: ['post', 'video', 'reel', 'story', 'page', 'group'],
    detailsRequired: false
  },

  // 6. OTHER
  {
    id: 'copyright_ip',
    category: 'other',
    label: 'Intellectual Property Violation',
    bnLabel: 'কপিরাইট বা মেধা সম্পদ লঙ্ঘন (Copyright)',
    description: 'অনুমতি ছাড়া অন্য কারো সৃষ্টি বা ছবি ব্যবহার',
    severity: 'medium',
    icon: '©️',
    applicableTypes: ['post', 'video', 'reel', 'page', 'marketplace', 'story'],
    detailsRequired: true
  },
  {
    id: 'other_reason',
    category: 'other',
    label: 'Other Policy Violation',
    bnLabel: 'অন্যান্য সুনির্দিষ্ট আপত্তি (Other Reason)',
    description: 'অন্যান্য কোনো কারণে এই কন্টেন্টটি নীতিমালার পরিপন্থি মনে হলে বিস্তারিত লিখুন',
    severity: 'medium',
    icon: '📝',
    applicableTypes: ['post', 'comment', 'reply', 'profile', 'page', 'group', 'story', 'reel', 'video', 'live', 'marketplace', 'event', 'message'],
    detailsRequired: true
  }
];

export function getReasonsForContentType(contentType: ReportableContentType): ReportReasonDefinition[] {
  return ALL_REPORT_REASONS.filter(r => !r.applicableTypes || r.applicableTypes.includes(contentType));
}

export function calculatePriorityScore(reason: ReportReasonDefinition, reporterTrustScore: number = 80): {
  priority: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
} {
  let baseScore = 40;
  if (reason.severity === 'critical') baseScore = 90;
  else if (reason.severity === 'high') baseScore = 75;
  else if (reason.severity === 'medium') baseScore = 55;
  else baseScore = 30;

  // Weight by reporter trust score
  const finalScore = Math.min(100, Math.round((baseScore * 0.7) + (reporterTrustScore * 0.3)));

  let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
  if (finalScore >= 80) priority = 'critical';
  else if (finalScore >= 65) priority = 'high';
  else if (finalScore >= 45) priority = 'medium';

  return { priority, riskScore: finalScore };
}
