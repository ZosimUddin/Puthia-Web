// ==========================================================
// ADDA — ANTI-SPAM, BOT & FAKE ACCOUNT PROTECTION ENGINE
// Multi-Signal Risk Scoring, Velocity Limiting & Trust System
// ==========================================================

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  RiskLevel, 
  UserRiskProfile, 
  RiskEvent, 
  RiskEventType, 
  AntiSpamRule, 
  AntiSpamAuditLog,
  SecurityChallenge,
  SuspiciousLoginAlert,
  SecurityReviewRequest
} from '../types/antiSpam';

// DEFAULT EXPLAINABLE ANTI-SPAM RULES
export const DEFAULT_ANTI_SPAM_RULES: AntiSpamRule[] = [
  {
    id: 'rule_fr_005',
    ruleCode: 'FR-005',
    name: 'গণ ফ্রেন্ড রিকোয়েস্ট নিয়ন্ত্রণ (Mass Friend Requests)',
    category: 'friend_request',
    description: 'স্বল্প সময়ে একাধিক অপরিচিত ইউজারকে দ্রুত ফ্রেন্ড রিকোয়েস্ট পাঠানো রোধ করে।',
    threshold: 8, // max 8 requests in 2 minutes
    timeWindowSeconds: 120,
    actionType: 'temporary_restriction',
    penaltyScore: 20,
    isEnabled: true,
    isConfigurable: true
  },
  {
    id: 'rule_fl_004',
    ruleCode: 'FL-004',
    name: 'গণ ফলো প্রটেকশন (Mass Follow Burst)',
    category: 'follow',
    description: 'স্বল্প সময়ে অস্বাভাবিকভাবে শত শত অ্যাকাউন্ট ফলো করা রোধ করে।',
    threshold: 15, // max 15 follows in 1 minute
    timeWindowSeconds: 60,
    actionType: 'rate_limit',
    penaltyScore: 15,
    isEnabled: true,
    isConfigurable: true
  },
  {
    id: 'rule_sp_001',
    ruleCode: 'SP-001',
    name: 'ডুপ্লিকেট ও স্প্যাম পোস্ট প্রটেকশন (Duplicate Post Spam)',
    category: 'post',
    description: 'একই টেক্সট বা একই কন্টেন্ট বারবার পোস্ট করা প্রতিহত করে।',
    threshold: 3, // max 3 identical/rapid posts in 5 mins
    timeWindowSeconds: 300,
    actionType: 'temporary_restriction',
    penaltyScore: 25,
    isEnabled: true,
    isConfigurable: true
  },
  {
    id: 'rule_cm_002',
    ruleCode: 'CM-002',
    name: 'স্প্যাম কমেন্ট ও ইনবক্স বন্যা (Spam Comment Flooding)',
    category: 'comment',
    description: 'একই কমেন্ট যেমন "Inbox করুন", প্রমোশনাল লিংক বারবার বিভিন্ন পোস্টে দেওয়া রোধ করে।',
    threshold: 6, // max 6 comments in 60 seconds
    timeWindowSeconds: 60,
    actionType: 'rate_limit',
    penaltyScore: 20,
    isEnabled: true,
    isConfigurable: true
  },
  {
    id: 'rule_dm_003',
    ruleCode: 'DM-003',
    name: 'গণ মেসেজিং ও প্রমোশনাল ডিএম (Mass Messaging Spam)',
    category: 'message',
    description: 'অপরিচিত ইউজারদের ইনবক্সে স্বল্প সময়ে একই মেসেজ কপি-পেস্ট করা রোধ করে।',
    threshold: 10, // max 10 new DM starts in 3 minutes
    timeWindowSeconds: 180,
    actionType: 'temporary_restriction',
    penaltyScore: 25,
    isEnabled: true,
    isConfigurable: true
  },
  {
    id: 'rule_lk_006',
    ruleCode: 'LK-006',
    name: 'সন্দেহভাজন ফিশিং ও এক্সটার্নাল লিংক স্প্যাম (Link Spam)',
    category: 'post',
    description: 'অননুমোদিত বিপজ্জনক বা প্রমোশনাল রিডাইরেক্ট লিংক ছড়ানো চিহ্নিত করে।',
    threshold: 4,
    timeWindowSeconds: 300,
    actionType: 'challenge',
    penaltyScore: 30,
    isEnabled: true,
    isConfigurable: true
  },
  {
    id: 'rule_bot_001',
    ruleCode: 'BOT-001',
    name: 'অটোমেটেড বট গতিবেগ অ্যালার্ট (Bot Velocity Trigger)',
    category: 'bot',
    description: 'মানুষের চেয়ে দ্রুতগতিতে রোবটিক উপায়ে ক্লিকে বা এপিআই হিট করা শনাক্ত করে।',
    threshold: 30, // 30 actions in 10 seconds
    timeWindowSeconds: 10,
    actionType: 'challenge',
    penaltyScore: 40,
    isEnabled: true,
    isConfigurable: true
  },
  {
    id: 'rule_mk_007',
    ruleCode: 'MK-007',
    name: 'মার্কেটপ্লেস ডুপ্লিকেট ও ফেক প্রাইস স্প্যাম (Marketplace Spam)',
    category: 'marketplace',
    description: 'মার্কেটপ্লেসে ভুয়া মূল্যে একই পণ্যের লিস্টিং বারবার আপলোড রোধ করে।',
    threshold: 4,
    timeWindowSeconds: 600,
    actionType: 'temporary_restriction',
    penaltyScore: 20,
    isEnabled: true,
    isConfigurable: true
  },
  {
    id: 'rule_lg_008',
    ruleCode: 'LG-008',
    name: 'অপরিচিত ডিভাইস ও সন্দেহভাজন লগইন (Suspicious Device Login)',
    category: 'login',
    description: 'নতুন ডিভাইস বা অস্বাভাবিক আইপি নেটওয়ার্ক থেকে অ্যাকাউন্ট লগইন অ্যালার্ট।',
    threshold: 1,
    timeWindowSeconds: 1,
    actionType: 'warning',
    penaltyScore: 10,
    isEnabled: true,
    isConfigurable: true
  },
  {
    id: 'rule_rg_009',
    ruleCode: 'RG-009',
    name: 'ডিভাইস ক্লাস্টারিং ও ফেক অ্যাকাউন্ট সৃষ্টি (Multi-Account Registration)',
    category: 'registration',
    description: 'একই ব্রাউজার বা ডিভাইস থেকে একাধিক ভুয়া অ্যাকাউন্ট তৈরি প্রতিরোধ।',
    threshold: 3, // 3 accounts on same fingerprint in 24 hours
    timeWindowSeconds: 86400,
    actionType: 'manual_review_queue',
    penaltyScore: 35,
    isEnabled: true,
    isConfigurable: true
  }
];

// IN-MEMORY SLIDING WINDOW VELOCITY STORE (For instantaneous client-side prevention)
interface ActionTimestamp {
  timestamp: number;
  contentHash?: string;
  metadata?: any;
}
const userActionMemoryStore = new Map<string, Map<string, ActionTimestamp[]>>();

// Helpers
function getActionTimestamps(userId: string, actionCategory: string): ActionTimestamp[] {
  if (!userActionMemoryStore.has(userId)) {
    userActionMemoryStore.set(userId, new Map());
  }
  const userMap = userActionMemoryStore.get(userId)!;
  if (!userMap.has(actionCategory)) {
    userMap.set(actionCategory, []);
  }
  return userMap.get(actionCategory)!;
}

function recordActionInMemory(userId: string, actionCategory: string, contentHash?: string, metadata?: any) {
  const list = getActionTimestamps(userId, actionCategory);
  const now = Date.now();
  list.push({ timestamp: now, contentHash, metadata });
  
  // Clean old items older than 24 hours
  const filtered = list.filter(item => now - item.timestamp < 86400000);
  userActionMemoryStore.get(userId)!.set(actionCategory, filtered);
}

// Compute Simple Fingerprint
export function generateDeviceFingerprint(): { deviceId: string; deviceName: string; browser: string; os: string } {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const userAgent = nav?.userAgent || 'Unknown Device';
  
  let os = 'Unknown OS';
  if (userAgent.includes('Win')) os = 'Windows PC';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Android')) os = 'Android Mobile';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS Device';
  else if (userAgent.includes('Linux')) os = 'Linux';

  let browser = 'Web Browser';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  // Generate stable local storage fingerprint ID
  let storedDeviceId = '';
  if (typeof localStorage !== 'undefined') {
    storedDeviceId = localStorage.getItem('adda_device_fingerprint') || '';
    if (!storedDeviceId) {
      storedDeviceId = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem('adda_device_fingerprint', storedDeviceId);
    }
  } else {
    storedDeviceId = 'dev_server_' + Math.random().toString(36).substring(2, 8);
  }

  return {
    deviceId: storedDeviceId,
    deviceName: `${browser} on ${os}`,
    browser,
    os
  };
}

// ==========================================================
// ANTI-SPAM ENGINE SERVICE
// ==========================================================

export class AntiSpamEngineService {
  private static cachedRules: AntiSpamRule[] = DEFAULT_ANTI_SPAM_RULES;
  private static rulesInitialized = false;

  /**
   * Initializes real-time sync with Firestore `spam_rules` collection
   */
  static initRulesListener() {
    if (this.rulesInitialized) return;
    this.rulesInitialized = true;

    try {
      const rulesRef = collection(db, 'spam_rules');
      onSnapshot(rulesRef, (snapshot) => {
        if (!snapshot.empty) {
          const remoteRules: AntiSpamRule[] = [];
          snapshot.forEach((docSnap) => {
            remoteRules.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          this.cachedRules = remoteRules;
        } else {
          // Seed default rules if empty
          this.seedDefaultRules();
        }
      }, (err) => {
        console.warn('Spam rules snapshot fallback to defaults:', err.message);
      });
    } catch (e) {
      console.warn('Error setting up rules listener:', e);
    }
  }

  private static async seedDefaultRules() {
    try {
      for (const rule of DEFAULT_ANTI_SPAM_RULES) {
        await setDoc(doc(db, 'spam_rules', rule.id), rule, { merge: true });
      }
    } catch (e) {
      // ignore
    }
  }

  static getActiveRules(): AntiSpamRule[] {
    return this.cachedRules;
  }

  static async updateRule(ruleId: string, updates: Partial<AntiSpamRule>, adminUser: { uid: string; name: string }) {
    await updateDoc(doc(db, 'spam_rules', ruleId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    // Audit log
    await this.logAudit({
      ruleCode: updates.ruleCode || 'CONFIG',
      eventType: 'rule_updated',
      actorType: 'admin',
      actorId: adminUser.uid,
      actorName: adminUser.name,
      targetUserId: 'SYSTEM',
      riskScore: 0,
      actionTaken: `Updated rule config for ${ruleId}`,
      reason: 'অ্যাডমিন কর্তৃক স্প্যাম রুল থ্রেশহোল্ড পরিবর্তন'
    });
  }

  /**
   * Evaluates Risk Score breakdown from 0 to 100
   */
  static calculateRiskScore(params: {
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    isNidVerified?: boolean;
    accountAgeDays?: number;
    riskEvents: RiskEvent[];
    reportsAgainstCount?: number;
  }): { totalScore: number; riskLevel: RiskLevel; breakdown: any } {
    let registrationRisk = 5; // base trust
    let velocityRisk = 0;
    let contentRisk = 0;
    let engagementRisk = 0;
    let reportRiskPenalty = Math.min(25, (params.reportsAgainstCount || 0) * 5);

    // Trust Discounts
    let trustDiscount = 0;
    if (params.isPhoneVerified) trustDiscount += 15;
    if (params.isEmailVerified) trustDiscount += 10;
    if (params.isNidVerified) trustDiscount += 25;
    if ((params.accountAgeDays || 0) > 30) trustDiscount += 10;

    // Tally risk from active recent events (past 7 days)
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;

    params.riskEvents.forEach(evt => {
      const evtTime = new Date(evt.createdAt).getTime();
      if (evtTime >= sevenDaysAgo) {
        if (evt.eventType.includes('registration') || evt.eventType.includes('device') || evt.eventType.includes('ip')) {
          registrationRisk += evt.riskScoreAdded;
        } else if (evt.eventType.includes('bot') || evt.eventType.includes('velocity')) {
          velocityRisk += evt.riskScoreAdded;
        } else if (evt.eventType.includes('post') || evt.eventType.includes('comment') || evt.eventType.includes('link')) {
          contentRisk += evt.riskScoreAdded;
        } else if (evt.eventType.includes('friend') || evt.eventType.includes('follow') || evt.eventType.includes('message')) {
          engagementRisk += evt.riskScoreAdded;
        }
      }
    });

    // Cap categories at 25
    registrationRisk = Math.min(25, Math.max(0, registrationRisk));
    velocityRisk = Math.min(25, Math.max(0, velocityRisk));
    contentRisk = Math.min(25, Math.max(0, contentRisk));
    engagementRisk = Math.min(25, Math.max(0, engagementRisk));

    let grossScore = registrationRisk + velocityRisk + contentRisk + engagementRisk + reportRiskPenalty;
    let netScore = Math.max(0, Math.min(100, grossScore - trustDiscount));

    let riskLevel: RiskLevel = 'low';
    if (netScore >= 80) riskLevel = 'critical';
    else if (netScore >= 60) riskLevel = 'high';
    else if (netScore >= 30) riskLevel = 'medium';

    return {
      totalScore: netScore,
      riskLevel,
      breakdown: {
        registrationRisk,
        velocityRisk,
        contentRisk,
        engagementRisk,
        reportRiskPenalty,
        trustDiscount,
        totalScore: netScore,
        riskLevel
      }
    };
  }

  /**
   * GATEWAY FUNCTION: Checks if user action is permitted or triggers anti-spam safeguard.
   */
  static async checkActionAllowed(
    userId: string,
    actionCategory: 'friend_request' | 'post' | 'comment' | 'message' | 'follow' | 'engagement' | 'marketplace',
    payload?: {
      content?: string;
      targetId?: string;
      userProfile?: any;
    }
  ): Promise<{
    allowed: boolean;
    reason?: string;
    ruleCode?: string;
    requiresChallenge?: boolean;
    restrictionExpiresAt?: string;
    warningMessage?: string;
  }> {
    if (!userId || userId === 'guest') {
      return { allowed: true };
    }

    this.initRulesListener();

    // 1. Check existing active restrictions in Firestore profile cache
    const profileDocRef = doc(db, 'risk_profiles', userId);
    let riskProfile: UserRiskProfile | null = null;
    
    try {
      const snap = await getDoc(profileDocRef);
      if (snap.exists()) {
        riskProfile = snap.data() as UserRiskProfile;
      }
    } catch (e) {
      // offline/fallback
    }

    if (riskProfile && riskProfile.activeRestrictions) {
      const rest = riskProfile.activeRestrictions;
      const expiresAt = rest.expiresAt ? new Date(rest.expiresAt).getTime() : 0;
      const isExpired = expiresAt > 0 && Date.now() > expiresAt;

      if (!isExpired) {
        if (actionCategory === 'friend_request' && rest.friendRequests) {
          return {
            allowed: false,
            ruleCode: rest.ruleId || 'FR-005',
            reason: 'অস্বাভাবিক ফ্রেন্ড রিকোয়েস্টের কারণে আপনার ফ্রেন্ড রিকোয়েস্ট পাঠানো সাময়িক স্থগিত রয়েছে।',
            restrictionExpiresAt: rest.expiresAt
          };
        }
        if (actionCategory === 'post' && rest.posts) {
          return {
            allowed: false,
            ruleCode: rest.ruleId || 'SP-001',
            reason: 'স্প্যাম প্রতিরোধের স্বার্থে আপনার পোস্ট করার সুবিধা সাময়িকভাবে স্থগিত রাখা হয়েছে।',
            restrictionExpiresAt: rest.expiresAt
          };
        }
        if (actionCategory === 'comment' && rest.comments) {
          return {
            allowed: false,
            ruleCode: rest.ruleId || 'CM-002',
            reason: 'দ্রুত একই কমেন্ট করার জন্য সাময়িক বিরতি দেওয়া হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।',
            restrictionExpiresAt: rest.expiresAt
          };
        }
        if (actionCategory === 'message' && rest.messages) {
          return {
            allowed: false,
            ruleCode: rest.ruleId || 'DM-003',
            reason: 'অপরিচিতদের একাধিক মেসেজ পাঠানোর জন্য মেসেজিং সেবা সাময়িক স্থগিত রয়েছে।',
            restrictionExpiresAt: rest.expiresAt
          };
        }
        if (actionCategory === 'follow' && rest.follows) {
          return {
            allowed: false,
            ruleCode: rest.ruleId || 'FL-004',
            reason: 'গণ ফলো করার কারণে ফলো সুবিধা সাময়িক লিমিট করা হয়েছে।',
            restrictionExpiresAt: rest.expiresAt
          };
        }
        if (actionCategory === 'marketplace' && rest.marketplace) {
          return {
            allowed: false,
            ruleCode: rest.ruleId || 'MK-007',
            reason: 'মার্কেটপ্লেস লিস্টিং স্প্যামিংয়ের জন্য সাময়িক বিধিনিষেধ রয়েছে।',
            restrictionExpiresAt: rest.expiresAt
          };
        }
      }
    }

    // 2. Velocity Check using in-memory rolling window + matching AntiSpamRules
    const matchingRules = this.cachedRules.filter(r => r.isEnabled && r.category === actionCategory);
    const now = Date.now();
    const history = getActionTimestamps(userId, actionCategory);

    for (const rule of matchingRules) {
      const windowStart = now - (rule.timeWindowSeconds * 1000);
      const recentEventsInWindow = history.filter(h => h.timestamp >= windowStart);

      // Check Duplicate Text Content (For comments / posts)
      if (payload?.content && (actionCategory === 'post' || actionCategory === 'comment')) {
        const cleanContent = payload.content.trim().toLowerCase();
        const duplicateMatches = recentEventsInWindow.filter(h => h.metadata?.cleanText === cleanContent);

        if (duplicateMatches.length >= 2) {
          // Trigger duplicate warning / rate limit
          await this.recordRiskEventAndApplyAction({
            userId,
            userProfile: payload.userProfile,
            rule,
            eventType: actionCategory === 'post' ? 'spam_post_duplicate' : 'spam_comment_flood',
            details: {
              contentSnippet: payload.content.slice(0, 100),
              velocityCount: duplicateMatches.length + 1
            }
          });

          return {
            allowed: false,
            ruleCode: rule.ruleCode,
            reason: '⚠️ আপনি একই ধরনের কন্টেন্ট বারবার পোস্ট/কমেন্ট করছেন। কিছুক্ষণ অপেক্ষা করুন।',
            requiresChallenge: rule.actionType === 'challenge'
          };
        }
      }

      // Check Velocity Threshold (Count of actions in time window)
      if (recentEventsInWindow.length >= rule.threshold) {
        // Trigger automated safeguard
        const actionResult = await this.recordRiskEventAndApplyAction({
          userId,
          userProfile: payload.userProfile,
          rule,
          eventType: this.mapCategoryToEventType(actionCategory),
          details: {
            velocityCount: recentEventsInWindow.length + 1,
            timeWindowSec: rule.timeWindowSeconds,
            contentSnippet: payload?.content?.slice(0, 100)
          }
        });

        if (rule.actionType === 'warning') {
          recordActionInMemory(userId, actionCategory, undefined, { cleanText: payload?.content?.trim().toLowerCase() });
          return {
            allowed: true,
            warningMessage: `সতর্কতা: আপনি খুব দ্রুত ${actionCategory} করছেন। অতিরিক্ত রিকোয়েস্টে সাময়িক বিরতি আসতে পারে।`,
            ruleCode: rule.ruleCode
          };
        }

        return {
          allowed: false,
          ruleCode: rule.ruleCode,
          reason: `অস্বাভাবিক অ্যাক্টিভিটি শনাক্ত হয়েছে (রুল ${rule.ruleCode})। আপনার সুরক্ষা নিশ্চিত করতে সাময়িক বিরতি দেওয়া হয়েছে।`,
          requiresChallenge: rule.actionType === 'challenge',
          restrictionExpiresAt: actionResult?.expiresAt
        };
      }
    }

    // 3. Bot burst velocity across ALL categories
    const allRecentActions = getActionTimestamps(userId, 'global_activity');
    const globalWindow = now - 10000; // 10 seconds
    const rapidHits = allRecentActions.filter(h => h.timestamp >= globalWindow);
    if (rapidHits.length >= 25) {
      // Trigger Bot Challenge
      const botRule = this.cachedRules.find(r => r.ruleCode === 'BOT-001') || DEFAULT_ANTI_SPAM_RULES[6];
      await this.recordRiskEventAndApplyAction({
        userId,
        userProfile: payload?.userProfile,
        rule: botRule,
        eventType: 'bot_velocity_trigger',
        details: { velocityCount: rapidHits.length + 1, timeWindowSec: 10 }
      });

      return {
        allowed: false,
        ruleCode: 'BOT-001',
        reason: 'রোবটিক বা অতিরিক্ত দ্রুত অনুরোধ শনাক্ত হয়েছে। সিকিউরিটি ভেরিফিকেশন সম্পন্ন করুন।',
        requiresChallenge: true
      };
    }

    // Record action
    recordActionInMemory(userId, actionCategory, undefined, { cleanText: payload?.content?.trim().toLowerCase() });
    recordActionInMemory(userId, 'global_activity');

    return { allowed: true };
  }

  private static mapCategoryToEventType(cat: string): RiskEventType {
    switch (cat) {
      case 'friend_request': return 'mass_friend_request';
      case 'follow': return 'mass_follow';
      case 'post': return 'spam_post_duplicate';
      case 'comment': return 'spam_comment_flood';
      case 'message': return 'mass_messaging';
      case 'marketplace': return 'marketplace_spam';
      default: return 'rate_limit_exceeded';
    }
  }

  /**
   * Records a Risk Event in Firestore and applies appropriate automated restriction
   */
  private static async recordRiskEventAndApplyAction(params: {
    userId: string;
    userProfile?: any;
    rule: AntiSpamRule;
    eventType: RiskEventType;
    details: any;
  }): Promise<{ expiresAt?: string }> {
    const { userId, userProfile, rule, eventType, details } = params;
    const now = new Date();
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const riskEvent: RiskEvent = {
      id: eventId,
      userId,
      userDisplayName: userProfile?.displayName || userProfile?.name || 'ব্যবহারকারী',
      userEmail: userProfile?.email || '',
      eventType,
      ruleId: rule.ruleCode,
      riskScoreAdded: rule.penaltyScore,
      severity: rule.penaltyScore >= 30 ? 'critical' : rule.penaltyScore >= 20 ? 'high' : 'medium',
      details,
      createdAt: now.toISOString()
    };

    // Save event in Firestore
    try {
      await setDoc(doc(db, 'risk_events', eventId), riskEvent);
    } catch (e) {
      console.warn('Failed to save risk event to firestore:', e);
    }

    // Determine restriction duration (e.g., 10 mins to 24 hours depending on severity)
    let restrictionMinutes = 15;
    if (rule.actionType === 'temporary_restriction') {
      restrictionMinutes = rule.category === 'friend_request' ? 60 : 30;
    }
    const expiresAt = new Date(Date.now() + restrictionMinutes * 60000).toISOString();

    // Update User Risk Profile
    const profileRef = doc(db, 'risk_profiles', userId);
    try {
      const snap = await getDoc(profileRef);
      let profileData: Partial<UserRiskProfile> = {};

      if (snap.exists()) {
        const current = snap.data() as UserRiskProfile;
        const newScore = Math.min(100, (current.totalScore || 0) + rule.penaltyScore);
        let newLevel: RiskLevel = 'low';
        if (newScore >= 80) newLevel = 'critical';
        else if (newScore >= 60) newLevel = 'high';
        else if (newScore >= 30) newLevel = 'medium';

        profileData = {
          totalScore: newScore,
          riskLevel: newLevel,
          status: rule.actionType === 'challenge' ? 'challenge_required' : 'restricted',
          activeRestrictions: {
            ...current.activeRestrictions,
            posts: rule.category === 'post' ? true : current.activeRestrictions?.posts,
            comments: rule.category === 'comment' ? true : current.activeRestrictions?.comments,
            friendRequests: rule.category === 'friend_request' ? true : current.activeRestrictions?.friendRequests,
            follows: rule.category === 'follow' ? true : current.activeRestrictions?.follows,
            messages: rule.category === 'message' ? true : current.activeRestrictions?.messages,
            marketplace: rule.category === 'marketplace' ? true : current.activeRestrictions?.marketplace,
            expiresAt,
            reason: rule.description,
            ruleId: rule.ruleCode
          },
          updatedAt: now.toISOString()
        };
      } else {
        profileData = {
          id: userId,
          userId,
          displayName: userProfile?.displayName || userProfile?.name || 'ব্যবহারকারী',
          email: userProfile?.email || '',
          avatarUrl: userProfile?.photoURL || userProfile?.avatar || '',
          phone: userProfile?.phone || '',
          riskLevel: rule.penaltyScore >= 30 ? 'high' : 'medium',
          totalScore: rule.penaltyScore,
          scoreBreakdown: {
            registrationRisk: 5,
            velocityRisk: rule.penaltyScore,
            contentRisk: 0,
            engagementRisk: 0,
            reportRiskPenalty: 0,
            totalScore: rule.penaltyScore,
            riskLevel: rule.penaltyScore >= 30 ? 'high' : 'medium'
          },
          isEmailVerified: Boolean(userProfile?.emailVerified),
          isPhoneVerified: Boolean(userProfile?.isPhoneVerified),
          isNidVerified: Boolean(userProfile?.isNidVerified),
          accountAgeDays: 1,
          knownDevices: [],
          knownIps: [],
          recentPostCount: 0,
          recentCommentCount: 0,
          recentFriendRequestCount: 0,
          recentFollowCount: 0,
          recentMessageCount: 0,
          recentReportCountAgainst: 0,
          status: 'restricted',
          activeRestrictions: {
            posts: rule.category === 'post',
            comments: rule.category === 'comment',
            friendRequests: rule.category === 'friend_request',
            follows: rule.category === 'follow',
            messages: rule.category === 'message',
            marketplace: rule.category === 'marketplace',
            expiresAt,
            reason: rule.description,
            ruleId: rule.ruleCode
          },
          lastActivityAt: now.toISOString(),
          updatedAt: now.toISOString()
        };
      }

      await setDoc(profileRef, profileData, { merge: true });

      // Log to audit trail
      await this.logAudit({
        ruleCode: rule.ruleCode,
        eventType,
        actorType: 'system_engine',
        actorId: 'AUTO_ENGINE',
        actorName: 'আড্ডা অ্যান্টি-স্প্যাম সিকিউরিটি ইঞ্জিন',
        targetUserId: userId,
        targetUserName: userProfile?.displayName || 'ব্যবহারকারী',
        riskScore: rule.penaltyScore,
        actionTaken: `${rule.ruleCode}: ${rule.name} কার্যকর করা হয়েছে (${restrictionMinutes} মিনিট)`,
        reason: rule.description
      });
    } catch (e) {
      console.warn('Failed to update risk profile:', e);
    }

    return { expiresAt };
  }

  /**
   * Device and Session Tracking: Handles new device detection and security alerts
   */
  static async handleDeviceLogin(userId: string, userProfile: any): Promise<{ isNewDevice: boolean; alert?: SuspiciousLoginAlert }> {
    if (!userId) return { isNewDevice: false };

    const fingerprint = generateDeviceFingerprint();
    const now = new Date().toISOString();
    const profileRef = doc(db, 'risk_profiles', userId);

    try {
      const snap = await getDoc(profileRef);
      let isNew = false;
      let knownDevices: any[] = [];

      if (snap.exists()) {
        const data = snap.data() as UserRiskProfile;
        knownDevices = data.knownDevices || [];
        const existingDevice = knownDevices.find(d => d.deviceId === fingerprint.deviceId);

        if (!existingDevice) {
          isNew = true;
          knownDevices.push({
            deviceId: fingerprint.deviceId,
            deviceName: fingerprint.deviceName,
            browser: fingerprint.browser,
            os: fingerprint.os,
            firstSeen: now,
            lastSeen: now,
            isTrusted: knownDevices.length === 0 // First device is trusted by default
          });
        } else {
          existingDevice.lastSeen = now;
        }

        await updateDoc(profileRef, {
          knownDevices,
          lastActivityAt: now
        });
      } else {
        knownDevices.push({
          deviceId: fingerprint.deviceId,
          deviceName: fingerprint.deviceName,
          browser: fingerprint.browser,
          os: fingerprint.os,
          firstSeen: now,
          lastSeen: now,
          isTrusted: true
        });

        await setDoc(profileRef, {
          id: userId,
          userId,
          displayName: userProfile?.displayName || userProfile?.name || 'ব্যবহারকারী',
          email: userProfile?.email || '',
          avatarUrl: userProfile?.photoURL || userProfile?.avatar || '',
          riskLevel: 'low',
          totalScore: 0,
          scoreBreakdown: {
            registrationRisk: 0,
            velocityRisk: 0,
            contentRisk: 0,
            engagementRisk: 0,
            reportRiskPenalty: 0,
            totalScore: 0,
            riskLevel: 'low'
          },
          isEmailVerified: Boolean(userProfile?.emailVerified),
          isPhoneVerified: Boolean(userProfile?.isPhoneVerified),
          isNidVerified: Boolean(userProfile?.isNidVerified),
          accountAgeDays: 1,
          knownDevices,
          knownIps: [],
          recentPostCount: 0,
          recentCommentCount: 0,
          recentFriendRequestCount: 0,
          recentFollowCount: 0,
          recentMessageCount: 0,
          recentReportCountAgainst: 0,
          status: 'active',
          lastActivityAt: now,
          updatedAt: now
        }, { merge: true });
      }

      if (isNew) {
        // Create Suspicious Login Alert
        const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const alert: SuspiciousLoginAlert = {
          id: alertId,
          userId,
          deviceId: fingerprint.deviceId,
          deviceName: fingerprint.deviceName,
          ipAddress: 'লিপিবদ্ধ',
          timestamp: now,
          status: 'unacknowledged'
        };

        await setDoc(doc(db, 'suspicious_logins', alertId), alert);
        return { isNewDevice: true, alert };
      }

      return { isNewDevice: false };
    } catch (e) {
      console.warn('Device login handling err:', e);
      return { isNewDevice: false };
    }
  }

  /**
   * Submits a False Positive Appeal / Security Review Request
   */
  static async submitReviewRequest(params: {
    userId: string;
    userName: string;
    userEmail: string;
    restrictionType: string;
    ruleTriggered: string;
    userExplanation: string;
  }) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const reviewReq: SecurityReviewRequest = {
      id: requestId,
      ...params,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'security_reviews', requestId), reviewReq);

    // Update risk profile to indicate appeal pending
    await updateDoc(doc(db, 'risk_profiles', params.userId), {
      falsePositiveReviewPending: true,
      lastFalsePositiveNote: params.userExplanation
    });

    return requestId;
  }

  /**
   * Admin: Resolve false positive and clear restriction
   */
  static async resolveFalsePositive(requestId: string, userId: string, isApproved: boolean, adminUser: { uid: string; name: string }, note: string) {
    const now = new Date().toISOString();
    
    // Update review request
    await updateDoc(doc(db, 'security_reviews', requestId), {
      status: isApproved ? 'approved' : 'rejected',
      reviewedBy: adminUser.uid,
      reviewerName: adminUser.name,
      reviewDecisionNote: note,
      resolvedAt: now
    });

    if (isApproved) {
      // Clear restriction & reduce risk score
      const profileRef = doc(db, 'risk_profiles', userId);
      const snap = await getDoc(profileRef);
      if (snap.exists()) {
        const cur = snap.data() as UserRiskProfile;
        const reducedScore = Math.max(0, (cur.totalScore || 30) - 40);
        await updateDoc(profileRef, {
          status: 'active',
          totalScore: reducedScore,
          riskLevel: reducedScore >= 60 ? 'high' : reducedScore >= 30 ? 'medium' : 'low',
          activeRestrictions: {
            posts: false,
            comments: false,
            friendRequests: false,
            follows: false,
            messages: false,
            marketplace: false,
            loginLocked: false
          },
          falsePositiveReviewPending: false,
          updatedAt: now
        });
      }

      await this.logAudit({
        ruleCode: 'FP-RESOLVE',
        eventType: 'false_positive_cleared',
        actorType: 'admin',
        actorId: adminUser.uid,
        actorName: adminUser.name,
        targetUserId: userId,
        riskScore: 0,
        actionTaken: 'False Positive অনুমোদন এবং সকল বিধিনিষেধ প্রত্যাহার',
        reason: note || 'অ্যাডমিন কর্তৃক ভুল শনাক্তকরণ সংশোধন'
      });
    }
  }

  /**
   * Admin: Manual Action on User Risk Profile
   */
  static async executeAdminRiskAction(params: {
    targetUserId: string;
    targetUserName: string;
    action: 'release_restrictions' | 'apply_restriction' | 'verify_phone' | 'verify_nid' | 'lock_account' | 'suspend' | 'ban';
    adminUser: { uid: string; name: string };
    reason: string;
    customRestrictions?: any;
    durationMinutes?: number;
  }) {
    const { targetUserId, targetUserName, action, adminUser, reason, customRestrictions, durationMinutes } = params;
    const now = new Date().toISOString();
    const profileRef = doc(db, 'risk_profiles', targetUserId);

    let updatePayload: any = { updatedAt: now };

    if (action === 'release_restrictions') {
      updatePayload = {
        ...updatePayload,
        status: 'active',
        totalScore: 10,
        riskLevel: 'low',
        activeRestrictions: {
          posts: false,
          comments: false,
          friendRequests: false,
          follows: false,
          messages: false,
          marketplace: false,
          loginLocked: false
        }
      };
    } else if (action === 'apply_restriction') {
      const expiresAt = durationMinutes ? new Date(Date.now() + durationMinutes * 60000).toISOString() : undefined;
      updatePayload = {
        ...updatePayload,
        status: 'restricted',
        riskLevel: 'high',
        activeRestrictions: {
          ...customRestrictions,
          expiresAt,
          reason
        }
      };
    } else if (action === 'lock_account') {
      updatePayload = {
        ...updatePayload,
        status: 'locked',
        riskLevel: 'critical',
        activeRestrictions: {
          loginLocked: true,
          reason: reason || 'নিরাপত্তাজনিত কারণে অ্যাকাউন্ট লক করা হয়েছে'
        }
      };
    } else if (action === 'verify_phone') {
      updatePayload = {
        ...updatePayload,
        isPhoneVerified: true,
        trustBadge: 'verified_phone'
      };
    } else if (action === 'verify_nid') {
      updatePayload = {
        ...updatePayload,
        isNidVerified: true,
        trustBadge: 'verified_citizen'
      };
    }

    await setDoc(profileRef, updatePayload, { merge: true });

    await this.logAudit({
      ruleCode: 'ADMIN-ACTION',
      eventType: 'admin_override',
      actorType: 'admin',
      actorId: adminUser.uid,
      actorName: adminUser.name,
      targetUserId,
      targetUserName,
      riskScore: 0,
      actionTaken: `অ্যাডমিন অ্যাকশন: ${action}`,
      reason: reason || 'অ্যাডমিন প্যানেল থেকে সম্পাদন'
    });
  }

  /**
   * Log into Protected Anti-Spam Audit Trail
   */
  static async logAudit(entry: Omit<AntiSpamAuditLog, 'id' | 'timestamp'>) {
    try {
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const logData: AntiSpamAuditLog = {
        ...entry,
        id: logId,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, 'anti_spam_audit_logs', logId), logData);
    } catch (e) {
      console.warn('Failed to write anti_spam_audit_log:', e);
    }
  }
}
