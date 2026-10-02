import { UserProfile } from "../contexts/AuthContext";

export interface ReputationBadge {
  id: string;
  label: string;
  emoji: string;
  minStars: number;
  minPoints?: number;
  description: string;
  colorClass: string;
  bgClass: string;
}

export const BADGES: Record<string, ReputationBadge> = {
  NEW_MEMBER: {
    id: "new_member",
    label: "নতুন নাগরিক",
    emoji: "🌱",
    minStars: 0,
    minPoints: 0,
    description: "পুঠিয়া ডিজিটাল পোর্টালে যুক্ত হয়েছেন",
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-50 border-emerald-200",
  },
  ACTIVE_MEMBER: {
    id: "active_member",
    label: "সক্রিয় নাগরিক",
    emoji: "⚡",
    minStars: 50,
    minPoints: 50,
    description: "নিয়মিত তথ্য ব্রাউজ ও ফিডব্যাক প্রদান করেন",
    colorClass: "text-blue-700",
    bgClass: "bg-blue-50 border-blue-200",
  },
  TRUSTED_MEMBER: {
    id: "trusted_member",
    label: "বিশ্বস্ত সেবক",
    emoji: "🛡️",
    minStars: 200,
    minPoints: 200,
    description: "একাধিক যাচাইকৃত সেবা তথ্য যোগ ও অনুমোদন পেয়েছেন",
    colorClass: "text-purple-700",
    bgClass: "bg-purple-50 border-purple-200",
  },
  COMMUNITY_HERO: {
    id: "community_hero",
    label: "কমিউনিটি হিরো",
    emoji: "🌟",
    minStars: 500,
    minPoints: 500,
    description: "উপজেলার তথ্যভাণ্ডার সমৃদ্ধ করতে অসাধারণ অবদান",
    colorClass: "text-amber-700",
    bgClass: "bg-amber-50 border-amber-200",
  },
  TOP_CONTRIBUTOR: {
    id: "top_contributor",
    label: "পুঠিয়ার গৌরব",
    emoji: "👑",
    minStars: 1000,
    minPoints: 1000,
    description: "পুঠিয়ার শীর্ষস্থানীয় নাগরিক ও পথপ্রদর্শক",
    colorClass: "text-rose-700",
    bgClass: "bg-rose-50 border-rose-200",
  },
};

export const getBadgeForStars = (stars: number = 0): ReputationBadge => {
  if (stars >= BADGES.TOP_CONTRIBUTOR.minStars) return BADGES.TOP_CONTRIBUTOR;
  if (stars >= BADGES.COMMUNITY_HERO.minStars) return BADGES.COMMUNITY_HERO;
  if (stars >= BADGES.TRUSTED_MEMBER.minStars) return BADGES.TRUSTED_MEMBER;
  if (stars >= BADGES.ACTIVE_MEMBER.minStars) return BADGES.ACTIVE_MEMBER;
  return BADGES.NEW_MEMBER;
};

export const getBadgeForPoints = getBadgeForStars;

/**
 * Calculate detailed profile completion percentage and missing fields
 */
export interface CompletionResult {
  percentage: number;
  completedCount: number;
  totalCount: number;
  missingFields: Array<{ key: string; label: string }>;
}

export const calculateProfileCompletion = (profile: Partial<UserProfile> | null): CompletionResult => {
  if (!profile) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount: 10,
      missingFields: [],
    };
  }

  const fieldsToCheck = [
    { key: "name", label: "আপনার পূর্ণ নাম", value: profile.name },
    { key: "phone", label: "সচল মোবাইল নম্বর", value: profile.phone },
    { key: "union", label: "ইউনিয়ন / এলাকা", value: profile.union },
    { key: "village", label: "গ্রাম বা ওয়ার্ড", value: profile.village },
    { key: "photoURL", label: "প্রোফাইল ছবি (Avatar)", value: profile.photoURL },
    { key: "bloodGroup", label: "রক্তের গ্রুপ", value: profile.bloodGroup },
    { key: "occupation", label: "পেশা / পদবী", value: profile.occupation },
    { key: "bio", label: "সংক্ষিপ্ত পরিচিতি (Bio)", value: profile.bio },
    { key: "email", label: "ইমেইল অ্যাড্রেস", value: profile.email },
    { key: "gender", label: "লিঙ্গ", value: profile.gender },
  ];

  let completed = 0;
  const missing: Array<{ key: string; label: string }> = [];

  for (const field of fieldsToCheck) {
    if (field.value && String(field.value).trim().length > 0 && field.value !== "notSpecified") {
      completed++;
    } else {
      missing.push({ key: field.key, label: field.label });
    }
  }

  const percentage = Math.round((completed / fieldsToCheck.length) * 100);

  return {
    percentage,
    completedCount: completed,
    totalCount: fieldsToCheck.length,
    missingFields: missing,
  };
};

/**
 * Calculate Trust & Reputation Score (0 to 100)
 */
export interface TrustScoreDetails {
  totalScore: number;
  tier: "নতুন নাগরিক" | "উন্নয়নশীল" | "উচ্চ বিশ্বস্ত" | "অনুমোদিত অভিভাবক";
  tierColor: string;
  breakdown: {
    profileCompletenessScore: number; // Max 25
    verificationScore: number;        // Max 30
    contributionScore: number;        // Max 25
    communityBonus: number;           // Max 20
  };
  isVerifiedCitizen: boolean;
}

export const calculateTrustScore = (
  profile: Partial<UserProfile> | null,
  contributionsCount: number = 0,
  approvedCount: number = 0
): TrustScoreDetails => {
  if (!profile) {
    return {
      totalScore: 10,
      tier: "নতুন নাগরিক",
      tierColor: "text-slate-500",
      breakdown: {
        profileCompletenessScore: 5,
        verificationScore: 0,
        contributionScore: 0,
        communityBonus: 5,
      },
      isVerifiedCitizen: false,
    };
  }

  // 1. Profile Completeness (0-25)
  const completion = calculateProfileCompletion(profile);
  const profileCompletenessScore = Math.round((completion.percentage / 100) * 25);

  // 2. Verification Badges (0-30)
  let verificationScore = 0;
  if (profile.phone && profile.phone.length >= 11) verificationScore += 10;
  if (profile.email) verificationScore += 5;
  if (profile.mobileVerifyStatus === "verified" || profile.accountVerifiedAwarded) verificationScore += 10;
  if (profile.nidStatus === "verified" || profile.role === "admin" || profile.role === "super_admin") verificationScore += 5;
  verificationScore = Math.min(verificationScore, 30);

  // 3. Added & Approved Contents (0-25)
  let contributionScore = Math.min((approvedCount * 5) + (contributionsCount * 2), 25);

  // 4. Civic Stars & Community Engagement (0-20)
  const stars = profile.stars || 0;
  let communityBonus = Math.min(Math.round(stars / 25), 20);

  const totalScore = Math.min(
    profileCompletenessScore + verificationScore + contributionScore + communityBonus,
    100
  );

  let tier: TrustScoreDetails["tier"] = "নতুন নাগরিক";
  let tierColor = "text-slate-600";

  if (totalScore >= 80) {
    tier = "অনুমোদিত অভিভাবক";
    tierColor = "text-emerald-700";
  } else if (totalScore >= 60) {
    tier = "উচ্চ বিশ্বস্ত";
    tierColor = "text-blue-700";
  } else if (totalScore >= 35) {
    tier = "উন্নয়নশীল";
    tierColor = "text-amber-700";
  }

  const isVerifiedCitizen =
    totalScore >= 60 ||
    profile.role === "super_admin" ||
    profile.role === "admin" ||
    profile.accountVerifiedAwarded === true;

  return {
    totalScore,
    tier,
    tierColor,
    breakdown: {
      profileCompletenessScore,
      verificationScore,
      contributionScore,
      communityBonus,
    },
    isVerifiedCitizen,
  };
};
