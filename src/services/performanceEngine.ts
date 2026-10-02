// Advanced Performance, Caching & Scalability Engine for Puthia Smart Portal

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

// Memory Cache Store (Simulating High-Speed Memory/Redis)
const memoryCacheStore = new Map<string, CacheItem<any>>();

/**
 * High Performance In-Memory Cache (Get / Set)
 */
export const cacheManager = {
  get: <T>(key: string): T | null => {
    const item = memoryCacheStore.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttlMs;
    if (isExpired) {
      memoryCacheStore.delete(key);
      return null;
    }
    return item.data as T;
  },

  set: <T>(key: string, data: T, ttlSeconds: number = 300): void => {
    memoryCacheStore.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlSeconds * 1000
    });
  },

  clear: (keyPattern?: string): void => {
    if (!keyPattern) {
      memoryCacheStore.clear();
      return;
    }
    for (const key of memoryCacheStore.keys()) {
      if (key.includes(keyPattern)) {
        memoryCacheStore.delete(key);
      }
    }
  }
};

/**
 * Image CDN & Compression URL Helper
 * Automatically appends WebP format & dimension parameters
 */
export function getOptimizedImageUrl(originalUrl: string, width: number = 600, quality: number = 80): string {
  if (!originalUrl) return "/images/placeholder.webp";
  
  // Unsplash or Cloudinary automatic CDN optimization params
  if (originalUrl.includes('images.unsplash.com')) {
    return `${originalUrl.split('?')[0]}?auto=format&fit=crop&w=${width}&q=${quality}&fm=webp`;
  }

  return originalUrl;
}

/**
 * Search Index Optimizer with Debounce
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delayMs: number = 300) {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delayMs);
  };
}

/**
 * Background Queue Processor for Async Tasks
 */
class PerformanceQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  public enqueue(task: () => Promise<void>) {
    this.queue.push(task);
    this.processNext();
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    const task = this.queue.shift();
    if (task) {
      try {
        await task();
      } catch (err) {
        console.error("Queue Task execution error:", err);
      }
    }
    this.isProcessing = false;
    this.processNext();
  }
}

export const backgroundTaskQueue = new PerformanceQueue();
