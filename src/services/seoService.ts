import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { SeoSettings, SiteSettings } from "../types";
import { createAuditTrail } from "./permissionPolicyEngine";

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  id: "main",
  seoTitle: "আমাদের পুঠিয়া – ঐতিহ্য থেকে ডিজিটাল ভবিষ্যতের পথে",
  seoDescription: "পুঠিয়ার মানুষ, ইতিহাস, ঐতিহ্য, তথ্য ও প্রয়োজনীয় সেবাকে এক প্ল্যাটফর্মে যুক্ত করার ডিজিটাল উদ্যোগ।",
  seoKeywords: "আমাদের পুঠিয়া, পুঠিয়া ডায়েরি, পুঠিয়া রাজবাড়ী, পুঠিয়া মন্দির কমপ্লেক্স, পুঠিয়া রাজশাহী, Puthia Rajbari, Puthia Upazila, Puthia Temple Complex, Puthia Doctors, পুঠিয়া হাসপাতাল, বানেশ্বর বাজার, রাজশাহী পর্যটন",
  ogTitle: "আমাদের পুঠিয়া – ঐতিহ্য থেকে ডিজিটাল ভবিষ্যতের পথে",
  ogDescription: "পুঠিয়ার মানুষ, ইতিহাস, ঐতিহ্য, তথ্য ও প্রয়োজনীয় সেবাকে এক প্ল্যাটফর্মে যুক্ত করার ডিজিটাল উদ্যোগ।",
  ogImageUrl: "https://our-puthia-app.vercel.app/puthia_official_full_logo.jpg",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "আমাদের পুঠিয়া – ঐতিহ্য থেকে ডিজিটাল ভবিষ্যতের পথে",
  twitterDescription: "পুঠিয়ার মানুষ, ইতিহাস, ঐতিহ্য, তথ্য ও প্রয়োজনীয় সেবাকে এক প্ল্যাটফর্মে যুক্ত করার ডিজিটাল উদ্যোগ।",
  twitterImage: "https://our-puthia-app.vercel.app/puthia_official_full_logo.jpg",
  canonicalUrl: typeof window !== "undefined" ? window.location.origin : "https://amaderputhia.gov.bd",
  robotsIndex: true,
  robotsFollow: true,
  authorName: "আমাদের পুঠিয়া ওয়েব টিম",
  geoRegion: "BD-54",
  geoPlacename: "Puthia, Rajshahi",
  geoPosition: "24.3683;88.8358",
  googleSearchConsole: "google-site-verification=AmaderPuthiaPortalVerificationToken2026",
  bingVerification: "",
  googleAnalyticsId: "G-XXXXXXXXXX",
  schemaJsonLd: JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://amaderputhia.gov.bd/#website",
        "url": "https://amaderputhia.gov.bd/",
        "name": "আমাদের পুঠিয়া",
        "description": "পুঠিয়া উপজেলার সকল ডিজিটাল তথ্য ও নাগরিক সেবা হাব",
        "inLanguage": "bn-BD",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://amaderputhia.gov.bd/?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "AdministrativeArea",
        "@id": "https://amaderputhia.gov.bd/#puthia-upazila",
        "name": "পুঠিয়া উপজেলা (Puthia Upazila)",
        "alternateName": ["Puthia Rajbari", "পুঠিয়া রাজবাড়ী"],
        "description": "রাজশাহী জেলার ঐতিহাসিক ও ঐতিহ্যবাহী উপজেলা পুঠিয়া, যা মহারানী হেমন্তকুমারী ও শিব মন্দিরের জন্য বিখ্যাত।",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 24.3683,
          "longitude": 88.8358
        },
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "রাজশাহী জেলা",
          "containedInPlace": {
            "@type": "Country",
            "name": "বাংলাদেশ"
          }
        }
      },
      {
        "@type": "TouristAttraction",
        "name": "পুঠিয়া রাজবাড়ী ও মন্দির কমপ্লেক্স (Puthia Temple Complex)",
        "description": "বাংলাদেশের অন্যতম প্রাচীন টেরাকোটা সমৃদ্ধ হিন্দু মন্দির স্থাপত্য রাজবাড়ী ও ডোল মন্দির।",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "পুঠিয়া",
          "addressRegion": "রাজশাহী",
          "addressCountry": "BD"
        }
      }
    ]
  }, null, 2)
};

/**
 * Fetch SEO settings from Firestore with default fallback
 */
export async function getSeoSettings(): Promise<SeoSettings> {
  try {
    const docRef = doc(db, "site_settings", "main");
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as Partial<SiteSettings>;
      return {
        id: "main",
        seoTitle: data.seoTitle || DEFAULT_SEO_SETTINGS.seoTitle,
        seoDescription: data.seoDescription || DEFAULT_SEO_SETTINGS.seoDescription,
        seoKeywords: data.seoKeywords || DEFAULT_SEO_SETTINGS.seoKeywords,
        ogTitle: data.ogTitle || data.seoTitle || DEFAULT_SEO_SETTINGS.ogTitle,
        ogDescription: data.ogDescription || data.seoDescription || DEFAULT_SEO_SETTINGS.ogDescription,
        ogImageUrl: data.ogImageUrl || DEFAULT_SEO_SETTINGS.ogImageUrl,
        ogType: data.ogType || DEFAULT_SEO_SETTINGS.ogType,
        twitterCard: data.twitterCard || DEFAULT_SEO_SETTINGS.twitterCard,
        twitterTitle: data.twitterTitle || data.seoTitle || DEFAULT_SEO_SETTINGS.twitterTitle,
        twitterDescription: data.twitterDescription || data.seoDescription || DEFAULT_SEO_SETTINGS.twitterDescription,
        twitterImage: data.twitterImage || data.ogImageUrl || DEFAULT_SEO_SETTINGS.twitterImage,
        canonicalUrl: data.canonicalUrl || DEFAULT_SEO_SETTINGS.canonicalUrl,
        robotsIndex: data.robotsIndex !== undefined ? data.robotsIndex : true,
        robotsFollow: data.robotsFollow !== undefined ? data.robotsFollow : true,
        authorName: data.authorName || DEFAULT_SEO_SETTINGS.authorName,
        geoRegion: data.geoRegion || DEFAULT_SEO_SETTINGS.geoRegion,
        geoPlacename: data.geoPlacename || DEFAULT_SEO_SETTINGS.geoPlacename,
        geoPosition: data.geoPosition || DEFAULT_SEO_SETTINGS.geoPosition,
        googleSearchConsole: data.googleSearchConsole || DEFAULT_SEO_SETTINGS.googleSearchConsole,
        bingVerification: data.bingVerification || DEFAULT_SEO_SETTINGS.bingVerification,
        googleAnalyticsId: data.googleAnalyticsId || DEFAULT_SEO_SETTINGS.googleAnalyticsId,
        schemaJsonLd: data.schemaJsonLd || DEFAULT_SEO_SETTINGS.schemaJsonLd,
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
    return DEFAULT_SEO_SETTINGS;
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    return DEFAULT_SEO_SETTINGS;
  }
}

/**
 * Update SEO settings in Firestore with audit trail logging
 */
export async function updateSeoSettings(
  updates: Partial<SeoSettings>,
  reason = "Super Admin updated SEO & Meta Tags configuration"
): Promise<void> {
  try {
    const docRef = doc(db, "site_settings", "main");
    const oldSnap = await getDoc(docRef);
    const oldData = oldSnap.exists() ? oldSnap.data() : {};

    const cleanUpdates = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await setDoc(docRef, cleanUpdates, { merge: true });

    // Calculate changes for audit logging
    const changes: Record<string, { old: any; new: any }> = {};
    Object.entries(cleanUpdates).forEach(([key, val]) => {
      if (key !== "updatedAt" && key !== "id") {
        const oldVal = (oldData as any)[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(val)) {
          changes[key] = {
            old: oldVal !== undefined ? oldVal : "",
            new: val
          };
        }
      }
    });

    if (Object.keys(changes).length > 0) {
      try {
        const { logAuditActivity } = await import("./auditLogger");
        await logAuditActivity({
          action: "এসইও ও মেটাডাটা কনফিগারেশন আপডেট",
          details: `এসইও ও ওপেন গ্রাফ মেটা সেটিংস সংশোধন করা হয়েছে (${Object.keys(changes).join(", ")})`,
          category: "system",
          severity: "info",
          changes
        });
      } catch (e) {
        console.warn("Audit logger skipped:", e);
      }

      await createAuditTrail({
        actorUid: "super_admin",
        actorName: "Super Admin",
        actorRole: "super_admin",
        targetType: "system",
        targetId: "main",
        action: "UPDATE_SEO_SETTINGS",
        reason: reason || "Super Admin updated SEO & Meta Tags configuration",
        previousState: oldData,
        newState: cleanUpdates
      });
    }
  } catch (error) {
    console.error("Error updating SEO settings in Firestore:", error);
    throw error;
  }
}

/**
 * Subscribe to real-time SEO settings changes
 */
export function subscribeSeoSettings(callback: (settings: SeoSettings) => void): () => void {
  const docRef = doc(db, "site_settings", "main");
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<SiteSettings>;
        callback({
          id: "main",
          seoTitle: data.seoTitle || DEFAULT_SEO_SETTINGS.seoTitle,
          seoDescription: data.seoDescription || DEFAULT_SEO_SETTINGS.seoDescription,
          seoKeywords: data.seoKeywords || DEFAULT_SEO_SETTINGS.seoKeywords,
          ogTitle: data.ogTitle || data.seoTitle || DEFAULT_SEO_SETTINGS.ogTitle,
          ogDescription: data.ogDescription || data.seoDescription || DEFAULT_SEO_SETTINGS.ogDescription,
          ogImageUrl: data.ogImageUrl || DEFAULT_SEO_SETTINGS.ogImageUrl,
          ogType: data.ogType || DEFAULT_SEO_SETTINGS.ogType,
          twitterCard: data.twitterCard || DEFAULT_SEO_SETTINGS.twitterCard,
          twitterTitle: data.twitterTitle || data.seoTitle || DEFAULT_SEO_SETTINGS.twitterTitle,
          twitterDescription: data.twitterDescription || data.seoDescription || DEFAULT_SEO_SETTINGS.twitterDescription,
          twitterImage: data.twitterImage || data.ogImageUrl || DEFAULT_SEO_SETTINGS.twitterImage,
          canonicalUrl: data.canonicalUrl || DEFAULT_SEO_SETTINGS.canonicalUrl,
          robotsIndex: data.robotsIndex !== undefined ? data.robotsIndex : true,
          robotsFollow: data.robotsFollow !== undefined ? data.robotsFollow : true,
          authorName: data.authorName || DEFAULT_SEO_SETTINGS.authorName,
          geoRegion: data.geoRegion || DEFAULT_SEO_SETTINGS.geoRegion,
          geoPlacename: data.geoPlacename || DEFAULT_SEO_SETTINGS.geoPlacename,
          geoPosition: data.geoPosition || DEFAULT_SEO_SETTINGS.geoPosition,
          googleSearchConsole: data.googleSearchConsole || DEFAULT_SEO_SETTINGS.googleSearchConsole,
          bingVerification: data.bingVerification || DEFAULT_SEO_SETTINGS.bingVerification,
          googleAnalyticsId: data.googleAnalyticsId || DEFAULT_SEO_SETTINGS.googleAnalyticsId,
          schemaJsonLd: data.schemaJsonLd || DEFAULT_SEO_SETTINGS.schemaJsonLd,
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      } else {
        callback(DEFAULT_SEO_SETTINGS);
      }
    },
    (error) => {
      console.warn("Error subscribing to SEO settings:", error);
      callback(DEFAULT_SEO_SETTINGS);
    }
  );
}

/**
 * Reset SEO settings to system-recommended optimal defaults
 */
export async function resetSeoSettingsToDefaults(): Promise<void> {
  return updateSeoSettings(DEFAULT_SEO_SETTINGS, "Reset SEO settings to optimal defaults");
}

export interface SeoAuditCheck {
  id: string;
  category: "meta" | "social" | "indexing" | "schema" | "analytics";
  label: string;
  status: "pass" | "warn" | "fail";
  score: number;
  message: string;
  recommendation?: string;
}

export interface SeoHealthReport {
  totalScore: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  checks: SeoAuditCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
}

/**
 * Calculate dynamic SEO Health Score & Actionable Recommendations
 */
export function calculateSeoHealthScore(settings: Partial<SeoSettings>): SeoHealthReport {
  const checks: SeoAuditCheck[] = [];

  // 1. Meta Title Check
  const title = (settings.seoTitle || "").trim();
  const titleLen = title.length;
  if (!title) {
    checks.push({
      id: "title_missing",
      category: "meta",
      label: "মেটা টাইটেল (SEO Title)",
      status: "fail",
      score: 0,
      message: "কোনো এসইও টাইটেল দেওয়া হয়নি। সার্চ ইঞ্জিনে সাইট সঠিকভাবে প্রদর্শিত হবে না।",
      recommendation: "৫০-৬০ অক্ষরের মধ্যে একটি আকর্ষণীয় ও প্রাসঙ্গিক টাইটেল লিখুন।"
    });
  } else if (titleLen >= 30 && titleLen <= 65) {
    checks.push({
      id: "title_optimal",
      category: "meta",
      label: "মেটা টাইটেল দৈর্ঘ্য",
      status: "pass",
      score: 20,
      message: `পারফেক্ট দৈর্ঘ্য (${titleLen} অক্ষর)! সার্চ রেজাল্টে পুরো টাইটেল প্রদর্শিত হবে।`
    });
  } else if (titleLen < 30) {
    checks.push({
      id: "title_short",
      category: "meta",
      label: "মেটা টাইটেল দৈর্ঘ্য",
      status: "warn",
      score: 12,
      message: `টাইটেল কিছুটা ছোট (${titleLen} অক্ষর)।`,
      recommendation: "পুঠিয়া উপজেলার বিশেষ কিওয়ার্ড ও ব্র্যান্ড নাম যুক্ত করুন।"
    });
  } else {
    checks.push({
      id: "title_long",
      category: "meta",
      label: "মেটা টাইটেল দৈর্ঘ্য",
      status: "warn",
      score: 14,
      message: `টাইটেল দীর্ঘ (${titleLen} অক্ষর)। গুগল সার্চে শেষের অংশ কেটে যেতে পারে।`,
      recommendation: "টাইটেল ৬০ অক্ষরের মধ্যে রাখার চেষ্টা করুন।"
    });
  }

  // 2. Meta Description Check
  const desc = (settings.seoDescription || "").trim();
  const descLen = desc.length;
  if (!desc) {
    checks.push({
      id: "desc_missing",
      category: "meta",
      label: "মেটা ডেসক্রিপশন",
      status: "fail",
      score: 0,
      message: "মেটা ডেসক্রিপশন অনুপস্থিত।",
      recommendation: "১২০-১৬০ অক্ষরের সংক্ষিপ্ত তথ্যবহুল সারসংক্ষেপ লিখুন।"
    });
  } else if (descLen >= 100 && descLen <= 165) {
    checks.push({
      id: "desc_optimal",
      category: "meta",
      label: "মেটা ডেসক্রিপশন দৈর্ঘ্য",
      status: "pass",
      score: 20,
      message: `আদর্শ দৈর্ঘ্য (${descLen} অক্ষর)! সার্চ ইঞ্জিনের স্নেপেটে পরিষ্কার দেখাবে।`
    });
  } else if (descLen < 100) {
    checks.push({
      id: "desc_short",
      category: "meta",
      label: "মেটা ডেসক্রিপশন দৈর্ঘ্য",
      status: "warn",
      score: 12,
      message: `ডেসক্রিপশন কিছুটা সংক্ষিপ্ত (${descLen} অক্ষর)।`,
      recommendation: "নাগরিক সেবা ও রাজবাড়ী সম্পর্কিত আরও ২-৩টি তথ্য যুক্ত করুন।"
    });
  } else {
    checks.push({
      id: "desc_long",
      category: "meta",
      label: "মেটা ডেসক্রিপশন দৈর্ঘ্য",
      status: "warn",
      score: 14,
      message: `ডেসক্রিপশন কিছুটা বড় (${descLen} অক্ষর)। সার্চে ট্রাঙ্কেট হতে পারে।`
    });
  }

  // 3. Keywords Check
  const keywords = (settings.seoKeywords || "").trim();
  const kwList = keywords ? keywords.split(",").filter((k) => k.trim().length > 0) : [];
  if (kwList.length >= 5) {
    checks.push({
      id: "keywords_pass",
      category: "meta",
      label: "এসইও কিওয়ার্ডস",
      status: "pass",
      score: 15,
      message: `${kwList.length}টি কিওয়ার্ড সক্রিয় রয়েছে।`
    });
  } else if (kwList.length > 0) {
    checks.push({
      id: "keywords_warn",
      category: "meta",
      label: "এসইও কিওয়ার্ডস",
      status: "warn",
      score: 10,
      message: `মাত্র ${kwList.length}টি কিওয়ার্ড রয়েছে।`,
      recommendation: "অন্তত ৫-১০টি প্রাসঙ্গিক ট্যাগ যোগ করুন।"
    });
  } else {
    checks.push({
      id: "keywords_fail",
      category: "meta",
      label: "এসইও কিওয়ার্ডস",
      status: "fail",
      score: 0,
      message: "কোনো কিওয়ার্ড যুক্ত করা হয়নি।"
    });
  }

  // 4. OpenGraph Social Card Check
  const ogImg = (settings.ogImageUrl || "").trim();
  if (ogImg && ogImg.startsWith("http")) {
    checks.push({
      id: "og_image_pass",
      category: "social",
      label: "সোশ্যাল শেয়ার কার্ড ছবি (OG Image)",
      status: "pass",
      score: 15,
      message: "সোশ্যাল প্রিভিউ কার্ডে আকর্ষণীয় ব্যানার ইমেজ সংযুক্ত আছে।"
    });
  } else {
    checks.push({
      id: "og_image_fail",
      category: "social",
      label: "সোশ্যাল শেয়ার কার্ড ছবি (OG Image)",
      status: "fail",
      score: 0,
      message: "কোনো ভ্যালিড Open Graph ব্যানার লিংক নেই। ফেসবুক/হোয়াটসঅ্যাপে শেয়ার করলে ইমেজ আসবে না।",
      recommendation: "১২০০x৬৩০ সাইজের একটি আকর্ষণীয় ল্যান্ডস্কেপ ইমেজ যুক্ত করুন।"
    });
  }

  // 5. Indexing & Robots
  if (settings.robotsIndex !== false) {
    checks.push({
      id: "robots_pass",
      category: "indexing",
      label: "গুগল ইনডেক্সিং স্ট্যাটাস",
      status: "pass",
      score: 10,
      message: "সার্চ ইঞ্জিন ক্রলারদের জন্য সাইট উন্মুক্ত (Index & Follow সক্রিয়)।"
    });
  } else {
    checks.push({
      id: "robots_fail",
      category: "indexing",
      label: "গুগল ইনডেক্সিং স্ট্যাটাস",
      status: "fail",
      score: 0,
      message: "নো-ইনডেক্স (noindex) চালু রয়েছে! সার্চ ইঞ্জিন এই সাইট ইনডেক্স করবে না।",
      recommendation: "যদি সাইটটি লাইভ থাকে তবে ইনডেক্সিং চালু করুন।"
    });
  }

  // 6. Google Search Console & Analytics
  const gsc = (settings.googleSearchConsole || "").trim();
  const ga = (settings.googleAnalyticsId || "").trim();
  if (gsc && ga) {
    checks.push({
      id: "analytics_pass",
      category: "analytics",
      label: "গুগল কনসোল ও এনালিটিক্স",
      status: "pass",
      score: 10,
      message: "Google Search Console এবং GA4 ট্র্যাকিং কোড কনফিগার করা আছে।"
    });
  } else if (gsc || ga) {
    checks.push({
      id: "analytics_warn",
      category: "analytics",
      label: "গুগল কনসোল ও এনালিটিক্স",
      status: "warn",
      score: 5,
      message: "Search Console অথবা GA4 আইডি কনফিগার করা বাকি রয়েছে।"
    });
  } else {
    checks.push({
      id: "analytics_fail",
      category: "analytics",
      label: "গুগল কনসোল ও এনালিটিক্স",
      status: "warn",
      score: 2,
      message: "গুগল ওয়েবমাস্টার ভেরিফিকেশন কোড যুক্ত করা হয়নি।"
    });
  }

  // 7. Schema.org JSON-LD Structured Data
  const schemaStr = (settings.schemaJsonLd || "").trim();
  let schemaValid = false;
  if (schemaStr) {
    try {
      JSON.parse(schemaStr);
      schemaValid = true;
    } catch {
      schemaValid = false;
    }
  }

  if (schemaValid) {
    checks.push({
      id: "schema_pass",
      category: "schema",
      label: "Schema.org স্ট্রাকচার্ড ডেটা",
      status: "pass",
      score: 10,
      message: "JSON-LD স্ট্রাকচার্ড ডেটা ভ্যালিড এবং রিচ স্ন্যাপেটের জন্য রেডি।"
    });
  } else if (schemaStr) {
    checks.push({
      id: "schema_invalid",
      category: "schema",
      label: "Schema.org স্ট্রাকচার্ড ডেটা",
      status: "fail",
      score: 0,
      message: "JSON-LD ডেটা সিনট্যাক্স সঠিক নয়।"
    });
  } else {
    checks.push({
      id: "schema_missing",
      category: "schema",
      label: "Schema.org স্ট্রাকচার্ড ডেটা",
      status: "warn",
      score: 3,
      message: "স্ট্রাকচার্ড ডেটা দেওয়া হয়নি। ডিফল্ট স্কিমা ব্যবহূত হচ্ছে।"
    });
  }

  const totalScore = Math.min(
    100,
    checks.reduce((acc, c) => acc + c.score, 0)
  );

  let grade: SeoHealthReport["grade"] = "F";
  if (totalScore >= 90) grade = "A+";
  else if (totalScore >= 80) grade = "A";
  else if (totalScore >= 65) grade = "B";
  else if (totalScore >= 50) grade = "C";
  else if (totalScore >= 35) grade = "D";

  return {
    totalScore,
    grade,
    checks,
    passCount: checks.filter((c) => c.status === "pass").length,
    warnCount: checks.filter((c) => c.status === "warn").length,
    failCount: checks.filter((c) => c.status === "fail").length
  };
}
