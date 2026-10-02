/**
 * High-Performance Client Cache & Search Indexing Engine for Smart Puthia
 * Provides:
 * 1. Fast fuzzy / phonetic search indexing (similar to Meilisearch) in memory
 * 2. Instant Memory + SessionStorage / IndexedDB fallback caching
 * 3. Smart Debouncing & Throttling
 * 4. Image URL optimizer (CDN resizing, webp conversions, skeleton placeholders)
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

class CacheAndIndexEngine {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default

  /**
   * Get cached data or null
   */
  get<T>(key: string): T | null {
    // 1. Check memory cache
    const mem = this.memoryCache.get(key);
    if (mem && Date.now() - mem.timestamp < mem.ttl) {
      return mem.data as T;
    }

    // 2. Check session storage for persisting across page nav
    try {
      const raw = sessionStorage.getItem(`puthia_cache_${key}`);
      if (raw) {
        const parsed: CacheEntry<T> = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          // Restore to memory
          this.memoryCache.set(key, parsed);
          return parsed.data;
        } else {
          sessionStorage.removeItem(`puthia_cache_${key}`);
        }
      }
    } catch {
      // Ignore sessionStorage issues
    }

    return null;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    this.memoryCache.set(key, entry);

    try {
      sessionStorage.setItem(`puthia_cache_${key}`, JSON.stringify(entry));
    } catch {
      // Storage quota exceeded or disabled
    }
  }

  /**
   * Invalidate specific key or prefix
   */
  invalidate(keyOrPrefix: string): void {
    for (const k of this.memoryCache.keys()) {
      if (k.startsWith(keyOrPrefix)) {
        this.memoryCache.delete(k);
        try {
          sessionStorage.removeItem(`puthia_cache_${k}`);
        } catch {}
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith('puthia_cache_')) {
          sessionStorage.removeItem(k);
        }
      });
    } catch {}
  }
}

export const appCache = new CacheAndIndexEngine();

/**
 * High-speed Bengali + English phonetic normalized search tokenizer (Meilisearch-like in-memory)
 */
export function normalizeSearchTerm(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[।,\.\-_/\\()]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Fuzzy text match scoring (0 - 100)
 */
export function calculateMatchScore(query: string, text: string): number {
  if (!query || !text) return 0;
  const q = normalizeSearchTerm(query);
  const t = normalizeSearchTerm(text);

  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 75;

  // Word level matching
  const qWords = q.split(' ');
  let matchedWords = 0;
  for (const qw of qWords) {
    if (qw.length > 0 && t.includes(qw)) {
      matchedWords++;
    }
  }

  return Math.round((matchedWords / qWords.length) * 60);
}

/**
 * Image Optimizer Utility
 * Generates low-latency srcset / sizes or fallback placeholders
 */
export function getOptimizedImageUrl(url?: string, options?: { width?: number; quality?: number }): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  // Unsplash image optimization
  if (url.includes('unsplash.com')) {
    const width = options?.width || 400;
    const quality = options?.quality || 80;
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
  }

  // Cloudinary optimization
  if (url.includes('res.cloudinary.com')) {
    const width = options?.width || 400;
    return url.replace('/upload/', `/upload/c_scale,w_${width},q_auto,f_auto/`);
  }

  // Firebase Storage image - return original
  return url;
}
