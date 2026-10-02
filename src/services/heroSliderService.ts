import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { HeroSlide } from "../types";
import { createAuditTrail } from "./permissionPolicyEngine";

const COLLECTION_NAME = "hero_slides";

export const INITIAL_HERO_SLIDES: Omit<HeroSlide, 'id'>[] = [
  {
    title: "পুঠিয়ার সব খবর, সেবা\nও আপডেট এক জায়গায়",
    subtitle: "সহজে জানুন, দ্রুত সেবা নিন",
    image: "https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?auto=format&fit=crop&fm=webp&q=75&w=1200",
    cta: "বিস্তারিত দেখুন",
    link: "/news",
    tag: "স্মার্ট ডিজিটাল হাব",
    category: "পুঠিয়া নিউজ ও আপডেট",
    emoji: "🏛️",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
    accentColor: "text-emerald-300",
    buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
    order: 1,
    isActive: true,
    stats: "সর্বশেষ সেবা"
  },
  {
    title: "নিয়মিত পুঠিয়ার সকল তথ্য এড করে আমাদেরকে সহযোগিতা করুন",
    subtitle: "আপনার এলাকার সকল গুরুত্বপূর্ণ সেবা ও ব্যবসা প্রতিষ্ঠানের তথ্য যুক্ত করুন",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&fm=webp&q=75&w=1200",
    cta: "তথ্য যুক্ত করুন",
    link: "/dashboard",
    tag: "নাগরিক অংশীদারিত্ব",
    category: "তথ্য সহযোগী",
    emoji: "🤝",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
    accentColor: "text-emerald-300",
    buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
    order: 2,
    isActive: true,
    stats: "ডিজিটাল পুঠিয়া"
  },
  {
    title: "পুঠিয়া উপজেলার সকল তথ্য সেবা পেতে আমাদের পুঠিয়া অ্যাপ ব্যবহার করুন",
    subtitle: "সহজে নাগরিক সেবা পেতে পুঠিয়া অ্যাপটি ফোনে সংগৃহীত রাখুন",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&fm=webp&q=75&w=1200",
    cta: "অ্যাপ ইনস্টল করুন",
    link: "/app",
    tag: "মোবাইল সুবিধা",
    category: "অফিশিয়াল মোবাইল অ্যাপ",
    emoji: "📱",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
    accentColor: "text-emerald-300",
    buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
    order: 3,
    isActive: true,
    stats: "স্মার্ট অ্যাক্সেস"
  },
  {
    title: "জরুরী রক্তদাতা, ডাক্তার ডিরেক্টরি ও নাগরিক সেবা পেতে আমাদের সাথে থাকুন",
    subtitle: "২৪ ঘন্টা বিনামূল্যে রক্তদাতা ও অ্যাম্বুলেন্স সেবা হটলাইন",
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&fm=webp&q=75&w=1200",
    cta: "জরুরি সেবা",
    link: "/blood-donor",
    tag: "২৪/৭ জরুরি সহায়তা",
    category: "জরুরি সেবা ও ব্লাড ব্যাংক",
    emoji: "❤️",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
    accentColor: "text-emerald-300",
    buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
    order: 4,
    isActive: true,
    stats: "লাইভ নেটওয়ার্ক"
  },
  {
    title: "প্রাচীন পুঠিয়া রাজবাড়ী ও ঐতিহাসিক শিব মন্দির কমপ্লেক্স",
    subtitle: "১৬শ শতাব্দীর রাজপ্রাসাদ ও মনোরম শিব দিঘীর প্রাকৃতিক শোভা",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&fm=webp&q=75&w=1200",
    cta: "রাজবাড়ী দেখুন",
    link: "/history",
    tag: "ঐতিহাসিক সম্পদ",
    category: "ঐতিহ্য ও পর্যটন",
    emoji: "🏰",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
    accentColor: "text-emerald-300",
    buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
    order: 5,
    isActive: true,
    stats: "দর্শনীয় স্থান"
  }
];

/**
 * Fetch all hero slides ordered by display order
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return INITIAL_HERO_SLIDES.map((s, idx) => ({
        ...s,
        id: `initial-slide-${idx + 1}`
      }));
    }
    
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as HeroSlide));
  } catch (error) {
    console.warn("Notice getting hero slides, using fallback slides:", error);
    return INITIAL_HERO_SLIDES.map((s, idx) => ({
      ...s,
      id: `fallback-slide-${idx + 1}`
    }));
  }
}

/**
 * Real-time listener for hero slides
 */
export function onHeroSlidesSnapshot(
  callback: (slides: HeroSlide[]) => void
): () => void {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          const defaultSlides = INITIAL_HERO_SLIDES.map((s, idx) => ({
            ...s,
            id: `initial-slide-${idx + 1}`
          }));
          callback(defaultSlides);
          return;
        }
        const slides: HeroSlide[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as HeroSlide));
        callback(slides);
      },
      (error) => {
        console.warn("Hero slides onSnapshot notice, falling back to default slides:", error?.message || error);
        const fallbackSlides: HeroSlide[] = INITIAL_HERO_SLIDES.map((s, idx) => ({
          ...s,
          id: `fallback-slide-${idx + 1}`
        }));
        callback(fallbackSlides);
      }
    );
  } catch (error) {
    console.warn("Failed to setup hero slides listener, using fallback:", error);
    const fallbackSlides: HeroSlide[] = INITIAL_HERO_SLIDES.map((s, idx) => ({
      ...s,
      id: `fallback-slide-${idx + 1}`
    }));
    callback(fallbackSlides);
    return () => {};
  }
}

/**
 * Seed initial slides if the collection is empty
 */
export async function seedHeroSlidesIfEmpty(): Promise<HeroSlide[]> {
  try {
    const existing = await getHeroSlides();
    if (existing.length > 0) {
      return existing;
    }

    const created: HeroSlide[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < INITIAL_HERO_SLIDES.length; i++) {
      const slideData = INITIAL_HERO_SLIDES[i];
      const newDocRef = doc(collection(db, COLLECTION_NAME));
      const fullSlide: HeroSlide = {
        ...slideData,
        id: newDocRef.id,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(newDocRef, fullSlide);
      created.push(fullSlide);
    }

    await createAuditTrail({
      actorUid: 'super_admin_system',
      actorName: 'Super Admin',
      actorRole: 'super_admin',
      targetType: 'system',
      targetId: 'seed',
      action: 'HERO_SLIDER_SEED',
      reason: 'Super Admin initialized default 5 hero carousel slides'
    });

    return created;
  } catch (error) {
    console.error("Error seeding hero slides:", error);
    return [];
  }
}

/**
 * Create a new hero slide
 */
export async function createHeroSlide(
  slide: Omit<HeroSlide, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const newDocRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();
    
    const payload: HeroSlide = {
      ...slide,
      id: newDocRef.id,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(newDocRef, payload);

    await createAuditTrail({
      actorUid: 'super_admin_system',
      actorName: 'Super Admin',
      actorRole: 'super_admin',
      targetType: 'system',
      targetId: newDocRef.id,
      action: 'HERO_SLIDE_CREATED',
      reason: `Created new hero slide: "${slide.title.replace(/\n/g, ' ')}" (Order: ${slide.order})`
    });

    return newDocRef.id;
  } catch (error) {
    console.error("Error creating hero slide:", error);
    throw error;
  }
}

/**
 * Update an existing hero slide
 */
export async function updateHeroSlide(
  id: string,
  updates: Partial<HeroSlide>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(docRef, payload);

    await createAuditTrail({
      actorUid: 'super_admin_system',
      actorName: 'Super Admin',
      actorRole: 'super_admin',
      targetType: 'system',
      targetId: id,
      action: 'HERO_SLIDE_UPDATED',
      reason: `Updated hero slide ID: ${id} (${updates.title || 'attributes'})`
    });
  } catch (error) {
    console.error("Error updating hero slide:", error);
    throw error;
  }
}

/**
 * Delete a hero slide
 */
export async function deleteHeroSlide(id: string, slideTitle?: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    await createAuditTrail({
      actorUid: 'super_admin_system',
      actorName: 'Super Admin',
      actorRole: 'super_admin',
      targetType: 'system',
      targetId: id,
      action: 'HERO_SLIDE_DELETED',
      reason: `Deleted hero slide: "${slideTitle || id}"`
    });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    throw error;
  }
}

/**
 * Toggle hero slide active/inactive status
 */
export async function toggleHeroSlideStatus(
  id: string, 
  isActive: boolean, 
  slideTitle?: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isActive,
      updatedAt: new Date().toISOString()
    });

    await createAuditTrail({
      actorUid: 'super_admin_system',
      actorName: 'Super Admin',
      actorRole: 'super_admin',
      targetType: 'system',
      targetId: id,
      action: 'HERO_SLIDE_STATUS_TOGGLED',
      reason: `Changed hero slide "${slideTitle || id}" status to ${isActive ? 'Active' : 'Inactive'}`
    });
  } catch (error) {
    console.error("Error toggling slide status:", error);
    throw error;
  }
}

/**
 * Reorder slides by updating order property
 */
export async function reorderHeroSlides(
  orderedSlides: { id: string; order: number }[]
): Promise<void> {
  try {
    const now = new Date().toISOString();
    for (const item of orderedSlides) {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      await updateDoc(docRef, {
        order: item.order,
        updatedAt: now
      });
    }

    await createAuditTrail({
      actorUid: 'super_admin_system',
      actorName: 'Super Admin',
      actorRole: 'super_admin',
      targetType: 'system',
      targetId: 'reorder',
      action: 'HERO_SLIDES_REORDERED',
      reason: `Reordered ${orderedSlides.length} hero slider items`
    });
  } catch (error) {
    console.error("Error reordering hero slides:", error);
    throw error;
  }
}
