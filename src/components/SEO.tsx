import React, { useEffect } from "react";
import { useSiteSettings } from "../context/SiteSettingsContext";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  path?: string;
  type?: "website" | "article" | "profile" | "place" | "business";
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  noIndex?: boolean;
}

const FALLBACK_TITLE = "আমাদের পুঠিয়া – ঐতিহ্য থেকে ডিজিটাল ভবিষ্যতের পথে";
const FALLBACK_DESC = "পুঠিয়ার মানুষ, ইতিহাস, ঐতিহ্য, তথ্য ও প্রয়োজনীয় সেবাকে এক প্ল্যাটফর্মে যুক্ত করার ডিজিটাল উদ্যোগ।";
const FALLBACK_KEYWORDS = "আমাদের পুঠিয়া, পুঠিয়া ডায়েরি, পুঠিয়া রাজবাড়ী, পুঠিয়া মন্দির কমপ্লেক্স, পুঠিয়া রাজশাহী, Puthia Rajbari, Puthia Upazila, Puthia Doctors, পুঠিয়া হাসপাতাল, বানেশ্বর বাজার, রাজশাহী পর্যটন";
const FALLBACK_IMAGE = "https://our-puthia-app.vercel.app/puthia_official_full_logo.jpg";
const SITE_URL = "https://our-puthia-app.vercel.app";

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  path = "",
  type = "website",
  jsonLd,
  noIndex,
}) => {
  const { settings } = useSiteSettings();

  const siteBrandName = settings?.siteName || "আমাদের পুঠিয়া";
  const activeTitle = title 
    ? (title.includes(siteBrandName) ? title : `${title} | ${siteBrandName}`)
    : (settings?.seoTitle || FALLBACK_TITLE);

  const activeDesc = description || settings?.seoDescription || FALLBACK_DESC;
  const activeKeywords = keywords || settings?.seoKeywords || FALLBACK_KEYWORDS;
  const activeImage = image || settings?.ogImageUrl || FALLBACK_IMAGE;
  const canonicalUrl = `${SITE_URL}${path ? (path.startsWith('/') ? path : `/${path}`) : ''}`;

  const ogTitle = title ? activeTitle : (settings?.ogTitle || activeTitle);
  const ogDesc = description || settings?.ogDescription || activeDesc;
  const twitterCard = settings?.twitterCard || "summary_large_image";
  const twitterTitle = settings?.twitterTitle || ogTitle;
  const twitterDesc = settings?.twitterDescription || ogDesc;
  const twitterImage = settings?.twitterImage || activeImage;

  const isRobotsIndexed = noIndex !== undefined 
    ? !noIndex 
    : (settings?.robotsIndex !== false);
  const isRobotsFollow = settings?.robotsFollow !== false;

  const authorName = settings?.authorName || "আমাদের পুঠিয়া ওয়েব টিম";
  const geoRegion = settings?.geoRegion || "BD-54";
  const geoPlacename = settings?.geoPlacename || "Puthia, Rajshahi";
  const geoPosition = settings?.geoPosition || "24.3683;88.8358";
  const googleSearchConsole = settings?.googleSearchConsole || "";
  const bingVerification = settings?.bingVerification || "";

  useEffect(() => {
    // 1. Browser Tab Title
    document.title = activeTitle;

    // Helper to safely set/update <meta> tags in <head>
    const setMetaTag = (nameAttr: "name" | "property", key: string, content: string | undefined | null) => {
      if (!content) {
        const existing = document.querySelector(`meta[${nameAttr}="${key}"]`);
        if (existing) existing.remove();
        return;
      }
      let el = document.querySelector(`meta[${nameAttr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(nameAttr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Helper for canonical link
    const setCanonical = (url: string) => {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", url);
    };

    // Standard HTML Meta Tags
    setMetaTag("name", "title", activeTitle);
    setMetaTag("name", "description", activeDesc);
    setMetaTag("name", "keywords", activeKeywords);
    setMetaTag(
      "name",
      "robots",
      !isRobotsIndexed
        ? "noindex, nofollow"
        : `${isRobotsFollow ? "index, follow" : "index, nofollow"}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`
    );
    setMetaTag("name", "author", authorName);
    setMetaTag("name", "language", "Bangla");
    setMetaTag("name", "geo.region", geoRegion);
    setMetaTag("name", "geo.placename", geoPlacename);
    setMetaTag("name", "geo.position", geoPosition);
    setMetaTag("name", "ICBM", geoPosition.replace(";", ", "));
    setCanonical(canonicalUrl);

    // Google & Bing Webmaster Verification Tags
    if (googleSearchConsole) {
      const gscCode = googleSearchConsole.includes("=") 
        ? googleSearchConsole.split("=")[1]?.replace(/"/g, "") || googleSearchConsole
        : googleSearchConsole;
      setMetaTag("name", "google-site-verification", gscCode);
    }
    if (bingVerification) {
      setMetaTag("name", "msvalidate.01", bingVerification);
    }

    // OpenGraph (Facebook / WhatsApp / LinkedIn / Telegram)
    setMetaTag("property", "og:type", type === "business" ? "place" : type);
    setMetaTag("property", "og:site_name", siteBrandName);
    setMetaTag("property", "og:locale", "bn_BD");
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:title", ogTitle);
    setMetaTag("property", "og:description", ogDesc);
    setMetaTag("property", "og:image", activeImage);

    // Twitter Card (X)
    setMetaTag("property", "twitter:card", twitterCard);
    setMetaTag("property", "twitter:title", twitterTitle);
    setMetaTag("property", "twitter:description", twitterDesc);
    setMetaTag("property", "twitter:image", twitterImage);
    setMetaTag("property", "twitter:url", canonicalUrl);

    // JSON-LD Structured Data
    let scriptEl = document.getElementById("seo-json-ld");
    if (scriptEl) {
      scriptEl.remove();
    }

    let resolvedJsonLd = jsonLd;
    if (!resolvedJsonLd && settings?.schemaJsonLd) {
      try {
        resolvedJsonLd = JSON.parse(settings.schemaJsonLd);
      } catch (e) {
        console.warn("Failed to parse custom schemaJsonLd:", e);
      }
    }

    if (resolvedJsonLd) {
      const newScript = document.createElement("script") as HTMLScriptElement;
      newScript.id = "seo-json-ld";
      newScript.type = "application/ld+json";
      newScript.text = JSON.stringify(resolvedJsonLd);
      document.head.appendChild(newScript);
    }

    return () => {
      const script = document.getElementById("seo-json-ld");
      if (script) script.remove();
    };
  }, [
    activeTitle,
    activeDesc,
    activeKeywords,
    activeImage,
    canonicalUrl,
    type,
    ogTitle,
    ogDesc,
    twitterCard,
    twitterTitle,
    twitterDesc,
    twitterImage,
    isRobotsIndexed,
    isRobotsFollow,
    authorName,
    geoRegion,
    geoPlacename,
    geoPosition,
    googleSearchConsole,
    bingVerification,
    siteBrandName,
    jsonLd,
    settings?.schemaJsonLd
  ]);

  return null;
};

export default SEO;
