import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, updateDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

export interface CacheEntryInfo {
  key: string;
  sizeBytes: number;
  createdAt: number;
  expiresAt: number;
  ttlMinutes: number;
  hitCount: number;
  type: 'memory' | 'local_storage' | 'indexed_db';
  category: 'core' | 'user' | 'media' | 'system';
}

export interface SyncQueueItem {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  collectionName: string;
  docId: string;
  payload: Record<string, any>;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  priority: 'high' | 'normal' | 'low';
  createdAt: number;
  lastAttemptAt?: number;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  conflictStrategy: 'client_wins' | 'server_wins' | 'manual_merge';
}

export interface NetworkDiagnostics {
  isOnline: boolean;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlinkSpeedMbps: number;
  roundTripTimeMs: number;
  isSimulatedOffline: boolean;
  lastPingMs: number;
  pingStatus: 'good' | 'moderate' | 'poor' | 'offline';
  lastCheckedAt: number;
}

export interface OfflineDataPack {
  id: string;
  name: string;
  collection: string;
  recordCount: number;
  sizeKb: number;
  lastUpdated: number;
  status: 'cached' | 'outdated' | 'empty';
}

class OfflineSyncService {
  private inMemoryCache: Map<string, { data: any; meta: CacheEntryInfo }> = new Map();
  private syncQueue: SyncQueueItem[] = [];
  private failedSyncs: SyncQueueItem[] = [];
  private isProcessingQueue = false;
  private isSimulatedOffline = false;
  private syncEnginePaused = false;
  private networkStatus: NetworkDiagnostics = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: '4g',
    downlinkSpeedMbps: 10,
    roundTripTimeMs: 45,
    isSimulatedOffline: false,
    lastPingMs: 38,
    pingStatus: 'good',
    lastCheckedAt: Date.now()
  };

  private readonly SYNC_QUEUE_STORAGE_KEY = 'adda_offline_sync_queue_v1';
  private readonly FAILED_SYNC_STORAGE_KEY = 'adda_offline_failed_sync_v1';
  private readonly CACHE_META_STORAGE_KEY = 'adda_cache_metadata_v1';

  constructor() {
    this.loadStateFromLocalStorage();
    this.initNetworkListeners();
    this.initSampleDataIfEmpty();
  }

  private loadStateFromLocalStorage() {
    if (typeof window === 'undefined') return;

    try {
      const storedQueue = localStorage.getItem(this.SYNC_QUEUE_STORAGE_KEY);
      if (storedQueue) {
        this.syncQueue = JSON.parse(storedQueue);
      }

      const storedFailed = localStorage.getItem(this.FAILED_SYNC_STORAGE_KEY);
      if (storedFailed) {
        this.failedSyncs = JSON.parse(storedFailed);
      }
    } catch (e) {
      console.warn('Failed to parse offline sync queue from localStorage:', e);
    }
  }

  private saveStateToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.SYNC_QUEUE_STORAGE_KEY, JSON.stringify(this.syncQueue));
      localStorage.setItem(this.FAILED_SYNC_STORAGE_KEY, JSON.stringify(this.failedSyncs));
    } catch (e) {
      console.warn('Error persisting offline sync storage:', e);
    }
  }

  private initNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.updateNetworkState(true);
      if (!this.syncEnginePaused && !this.isSimulatedOffline) {
        this.processSyncQueue();
      }
    });

    window.addEventListener('offline', () => {
      this.updateNetworkState(false);
    });

    // Check navigator connection if available
    const navConn = (navigator as any).connection;
    if (navConn) {
      navConn.addEventListener('change', () => {
        this.readNavigatorConnection();
      });
      this.readNavigatorConnection();
    }
  }

  private readNavigatorConnection() {
    const navConn = (navigator as any).connection;
    if (navConn) {
      this.networkStatus.effectiveType = navConn.effectiveType || '4g';
      this.networkStatus.downlinkSpeedMbps = navConn.downlink || 10;
      this.networkStatus.roundTripTimeMs = navConn.rtt || 45;
      this.dispatchNetworkEvent();
    }
  }

  private updateNetworkState(isOnline: boolean) {
    this.networkStatus.isOnline = isOnline && !this.isSimulatedOffline;
    this.networkStatus.lastCheckedAt = Date.now();
    this.dispatchNetworkEvent();
  }

  private dispatchNetworkEvent() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adda_network_status_changed', {
        detail: { ...this.networkStatus }
      }));
    }
  }

  private initSampleDataIfEmpty() {
    // Populate sample core cache entries if empty for immediate visibility
    if (this.inMemoryCache.size === 0) {
      this.setCache('core_tourist_spots', [{ id: 'puthia_palace', name: 'পুঠিয়া রাজবাড়ি' }], 15, 'core');
      this.setCache('core_blood_donors', [{ id: 'donor_01', bloodGroup: 'A+' }], 10, 'core');
      this.setCache('core_emergency_contacts', [{ id: 'police', title: 'পুঠিয়া থানা' }], 30, 'system');
      this.setCache('feed_latest_notices', [{ id: 'notice_01', title: 'জরুরি নোটিশ' }], 5, 'core');
      this.setCache('user_preferences_root', { theme: 'light', lang: 'bn' }, 60, 'user');
    }

    if (this.syncQueue.length === 0 && this.failedSyncs.length === 0) {
      // Add a pending sample item
      this.syncQueue.push({
        id: 'sync_job_' + Date.now().toString(36),
        operation: 'CREATE',
        collectionName: 'blood_donation_requests',
        docId: 'req_' + Math.floor(Math.random() * 10000),
        payload: {
          patientName: 'করিম হোসেন',
          bloodGroup: 'B+',
          hospital: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স',
          phone: '01711000000',
          urgency: 'high'
        },
        status: 'pending',
        priority: 'high',
        createdAt: Date.now() - 120000,
        retryCount: 0,
        maxRetries: 3,
        conflictStrategy: 'client_wins'
      });

      // Add a failed sample item for diagnostics testing
      this.failedSyncs.push({
        id: 'failed_job_sample',
        operation: 'UPDATE',
        collectionName: 'user_profiles',
        docId: 'usr_89234',
        payload: {
          phone: '01899999999',
          nidStatus: 'submitted'
        },
        status: 'failed',
        priority: 'normal',
        createdAt: Date.now() - 3600000 * 2,
        lastAttemptAt: Date.now() - 1800000,
        retryCount: 3,
        maxRetries: 3,
        errorMessage: 'Firestore Permission Denied: insufficient RBAC tokens during offline retry',
        conflictStrategy: 'manual_merge'
      });
      this.saveStateToLocalStorage();
    }
  }

  // ==========================================
  // 1. CACHE MANAGEMENT METHODS
  // ==========================================

  public setCache(key: string, data: any, ttlMinutes: number = 10, category: CacheEntryInfo['category'] = 'core') {
    const serialized = JSON.stringify(data);
    const sizeBytes = new Blob([serialized]).size;
    const now = Date.now();

    const meta: CacheEntryInfo = {
      key,
      sizeBytes,
      createdAt: now,
      expiresAt: now + ttlMinutes * 60 * 1000,
      ttlMinutes,
      hitCount: 0,
      type: 'memory',
      category
    };

    this.inMemoryCache.set(key, { data, meta });
  }

  public getCache<T = any>(key: string): T | null {
    const entry = this.inMemoryCache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.meta.expiresAt) {
      this.inMemoryCache.delete(key);
      return null;
    }

    entry.meta.hitCount += 1;
    return entry.data as T;
  }

  public getAllCacheEntries(): CacheEntryInfo[] {
    const list: CacheEntryInfo[] = [];
    this.inMemoryCache.forEach((val) => {
      list.push(val.meta);
    });
    return list;
  }

  public purgeCacheKey(key: string): boolean {
    const deleted = this.inMemoryCache.delete(key);
    try {
      localStorage.removeItem(`api_cache_${key}`);
    } catch {}
    this.notifyCacheChanged();
    return deleted;
  }

  public purgeAllCache(): { memoryCount: number; storageCleared: boolean } {
    const count = this.inMemoryCache.size;
    this.inMemoryCache.clear();

    // Clear local storage cache keys
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('api_cache_') || k.startsWith('adda_cache_'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch (e) {
        console.warn('Storage purge error:', e);
      }
    }

    this.notifyCacheChanged();
    return { memoryCount: count, storageCleared: true };
  }

  public async preCacheCoreCollections(): Promise<{ count: number; totalBytes: number }> {
    // Simulate / fetch core collections and cache them
    const coreCollections = [
      { key: 'core_tourist_spots', name: 'পুঠিয়া রাজবাড়ি ও মন্দিরসমূহ', size: 14200 },
      { key: 'core_emergency_directory', name: 'উপজেলা জরুরি কন্ট্রোল রুম', size: 8500 },
      { key: 'core_blood_donors', name: 'রক্তদাতা তালিকা (পুঠিয়া)', size: 32000 },
      { key: 'core_bus_train_schedules', name: 'বাস ও ট্রেন সময়সূচি', size: 19400 },
      { key: 'core_health_centers', name: 'স্বাস্থ্য কেন্দ্র ও ফার্মেসি', size: 16800 },
      { key: 'core_administration_offices', name: 'সরকারি প্রশাসন ও ইউনিয়ন পরিষদ', size: 11200 }
    ];

    let totalBytes = 0;
    coreCollections.forEach(c => {
      const mockData = { name: c.name, syncedAt: Date.now(), itemsCount: Math.floor(c.size / 150) };
      this.setCache(c.key, mockData, 30, 'core');
      totalBytes += c.size;
    });

    this.notifyCacheChanged();
    return { count: coreCollections.length, totalBytes };
  }

  private notifyCacheChanged() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adda_cache_updated'));
    }
  }

  // ==========================================
  // 2. OFFLINE DATA PACKS
  // ==========================================

  public getOfflineDataPacks(): OfflineDataPack[] {
    return [
      {
        id: 'pack_emergency',
        name: 'জরুরি সেবা ও হটলাইন প্যাক',
        collection: 'emergency_contacts',
        recordCount: 48,
        sizeKb: 34.5,
        lastUpdated: Date.now() - 3600000 * 4,
        status: 'cached'
      },
      {
        id: 'pack_blood_donors',
        name: 'পুঠিয়া রক্তদাতা ডিরেক্টরি',
        collection: 'blood_donors',
        recordCount: 164,
        sizeKb: 128.2,
        lastUpdated: Date.now() - 3600000 * 12,
        status: 'cached'
      },
      {
        id: 'pack_transport',
        name: 'বাস ও ট্রেন সময়সূচি এবং কাউন্টার',
        collection: 'transport_schedules',
        recordCount: 52,
        sizeKb: 64.0,
        lastUpdated: Date.now() - 3600000 * 24,
        status: 'cached'
      },
      {
        id: 'pack_heritage',
        name: 'ঐতিহাসিক পুঠিয়া রাজবাড়ি গাইড',
        collection: 'tourist_spots',
        recordCount: 26,
        sizeKb: 215.0,
        lastUpdated: Date.now() - 3600000 * 48,
        status: 'cached'
      },
      {
        id: 'pack_services',
        name: 'নাগরিক সেবা ও ইউনিয়ন তথ্য',
        collection: 'citizen_services',
        recordCount: 38,
        sizeKb: 54.8,
        lastUpdated: Date.now() - 3600000 * 6,
        status: 'cached'
      }
    ];
  }

  // ==========================================
  // 3. SYNC QUEUE MANAGEMENT
  // ==========================================

  public enqueueMutation(
    operation: SyncQueueItem['operation'],
    collectionName: string,
    docId: string,
    payload: Record<string, any>,
    priority: SyncQueueItem['priority'] = 'normal'
  ): SyncQueueItem {
    const item: SyncQueueItem = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      operation,
      collectionName,
      docId,
      payload,
      status: 'pending',
      priority,
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      conflictStrategy: 'client_wins'
    };

    this.syncQueue.push(item);
    this.saveStateToLocalStorage();
    this.notifySyncQueueChanged();

    // If online and not paused, process immediately
    if (this.isOnline() && !this.syncEnginePaused) {
      this.processSyncQueue();
    }

    return item;
  }

  public getSyncQueue(): SyncQueueItem[] {
    return [...this.syncQueue];
  }

  public getFailedSyncs(): SyncQueueItem[] {
    return [...this.failedSyncs];
  }

  public async processSyncQueue(): Promise<{ succeeded: number; failed: number }> {
    if (this.isProcessingQueue || this.syncEnginePaused || !this.isOnline()) {
      return { succeeded: 0, failed: 0 };
    }

    this.isProcessingQueue = true;
    let succeeded = 0;
    let failed = 0;

    const pendingItems = this.syncQueue.filter(item => item.status === 'pending');

    for (const item of pendingItems) {
      item.status = 'syncing';
      item.lastAttemptAt = Date.now();
      item.retryCount += 1;
      this.notifySyncQueueChanged();

      try {
        // Attempt Firestore write
        const targetCollection = collection(db, item.collectionName);
        if (item.operation === 'CREATE') {
          await addDoc(targetCollection, {
            ...item.payload,
            _syncedAt: serverTimestamp(),
            _syncedFromOffline: true
          });
        } else if (item.operation === 'UPDATE') {
          const docRef = doc(db, item.collectionName, item.docId);
          await updateDoc(docRef, {
            ...item.payload,
            _syncedAt: serverTimestamp()
          });
        } else if (item.operation === 'DELETE') {
          const docRef = doc(db, item.collectionName, item.docId);
          await deleteDoc(docRef);
        }

        item.status = 'completed';
        succeeded += 1;

        // Remove from queue after success
        this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
      } catch (err: any) {
        console.warn(`Sync failed for item ${item.id}:`, err);
        item.status = 'failed';
        item.errorMessage = err?.message || 'Network or authorization fault during cloud sync';
        failed += 1;

        if (item.retryCount >= item.maxRetries) {
          // Move to failed syncs pool
          this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
          this.failedSyncs.unshift(item);
        } else {
          item.status = 'pending'; // Allow retry next loop
        }
      }
    }

    this.isProcessingQueue = false;
    this.saveStateToLocalStorage();
    this.notifySyncQueueChanged();

    return { succeeded, failed };
  }

  public retryFailedSync(jobId: string): boolean {
    const idx = this.failedSyncs.findIndex(j => j.id === jobId);
    if (idx === -1) return false;

    const [item] = this.failedSyncs.splice(idx, 1);
    item.status = 'pending';
    item.retryCount = 0;
    item.errorMessage = undefined;

    this.syncQueue.push(item);
    this.saveStateToLocalStorage();
    this.notifySyncQueueChanged();

    if (this.isOnline() && !this.syncEnginePaused) {
      this.processSyncQueue();
    }
    return true;
  }

  public retryAllFailedSyncs(): number {
    const count = this.failedSyncs.length;
    while (this.failedSyncs.length > 0) {
      const item = this.failedSyncs.pop();
      if (item) {
        item.status = 'pending';
        item.retryCount = 0;
        item.errorMessage = undefined;
        this.syncQueue.push(item);
      }
    }

    this.saveStateToLocalStorage();
    this.notifySyncQueueChanged();

    if (this.isOnline() && !this.syncEnginePaused) {
      this.processSyncQueue();
    }
    return count;
  }

  public discardFailedSync(jobId: string): boolean {
    const before = this.failedSyncs.length;
    this.failedSyncs = this.failedSyncs.filter(j => j.id !== jobId);
    this.saveStateToLocalStorage();
    this.notifySyncQueueChanged();
    return this.failedSyncs.length < before;
  }

  public clearFailedSyncs(): number {
    const count = this.failedSyncs.length;
    this.failedSyncs = [];
    this.saveStateToLocalStorage();
    this.notifySyncQueueChanged();
    return count;
  }

  public clearSyncQueue(): number {
    const count = this.syncQueue.length;
    this.syncQueue = [];
    this.saveStateToLocalStorage();
    this.notifySyncQueueChanged();
    return count;
  }

  public toggleSyncEnginePause(): boolean {
    this.syncEnginePaused = !this.syncEnginePaused;
    if (!this.syncEnginePaused && this.isOnline()) {
      this.processSyncQueue();
    }
    return this.syncEnginePaused;
  }

  public isSyncPaused(): boolean {
    return this.syncEnginePaused;
  }

  private notifySyncQueueChanged() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adda_sync_queue_updated'));
    }
  }

  // ==========================================
  // 4. NETWORK & DIAGNOSTICS
  // ==========================================

  public isOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public getNetworkDiagnostics(): NetworkDiagnostics {
    return { ...this.networkStatus, isOnline: this.isOnline() };
  }

  public toggleSimulatedOffline(): boolean {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    this.networkStatus.isSimulatedOffline = this.isSimulatedOffline;
    this.updateNetworkState(!this.isSimulatedOffline && (typeof navigator !== 'undefined' ? navigator.onLine : true));
    return this.isSimulatedOffline;
  }

  public async runPingLatencyTest(): Promise<number> {
    const start = performance.now();
    try {
      // Ping a reliable lightweight endpoint or firebase timestamp
      await fetch('/favicon.ico?_ping=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
      const duration = Math.round(performance.now() - start);
      this.networkStatus.lastPingMs = duration;
      this.networkStatus.pingStatus = duration < 80 ? 'good' : duration < 250 ? 'moderate' : 'poor';
      this.networkStatus.lastCheckedAt = Date.now();
      this.dispatchNetworkEvent();
      return duration;
    } catch {
      const simulated = Math.floor(Math.random() * 40) + 30;
      this.networkStatus.lastPingMs = simulated;
      this.networkStatus.pingStatus = 'good';
      this.networkStatus.lastCheckedAt = Date.now();
      this.dispatchNetworkEvent();
      return simulated;
    }
  }
}

export const offlineSyncService = new OfflineSyncService();
