// Cache Manager for Adda (In-Memory + LocalStorage Layer)

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class CacheManager {
  private static memoryCache = new Map<string, CacheEntry<any>>();

  /**
   * Get cached item if not expired.
   */
  static get<T>(key: string): T | null {
    const now = Date.now();

    // 1. Check memory cache first
    const memItem = this.memoryCache.get(key);
    if (memItem) {
      if (now < memItem.expiry) {
        return memItem.data;
      }
      this.memoryCache.delete(key);
    }

    // 2. Check localStorage
    try {
      const raw = localStorage.getItem(`adda_cache_${key}`);
      if (raw) {
        const parsed: CacheEntry<T> = JSON.parse(raw);
        if (now < parsed.expiry) {
          // Re-populate memory cache
          this.memoryCache.set(key, parsed);
          return parsed.data;
        }
        localStorage.removeItem(`adda_cache_${key}`);
      }
    } catch {}

    return null;
  }

  /**
   * Set cache with TTL in seconds (default 120s)
   */
  static set<T>(key: string, data: T, ttlSeconds: number = 120): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    const entry: CacheEntry<T> = { data, expiry };

    this.memoryCache.set(key, entry);

    try {
      localStorage.setItem(`adda_cache_${key}`, JSON.stringify(entry));
    } catch {}
  }

  /**
   * Invalidate specific key or prefix pattern
   */
  static invalidate(pattern: string): void {
    // Memory
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // LocalStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('adda_cache_') && k.includes(pattern)) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    this.memoryCache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('adda_cache_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
  }
}
