// Idempotency & Duplicate Request Protection Engine

export class IdempotencyManager {
  private static activeLocks: Map<string, number> = new Map();
  private static processedKeys: Set<string> = new Set();
  private static readonly LOCK_TIMEOUT_MS = 5000;

  /**
   * Acquire a temporary processing lock for a user action.
   * Prevents double clicks, duplicate submissions, and network retries.
   */
  static acquireLock(key: string): boolean {
    const now = Date.now();
    const existingLockTime = this.activeLocks.get(key);

    if (existingLockTime && now - existingLockTime < this.LOCK_TIMEOUT_MS) {
      return false; // Still locked
    }

    this.activeLocks.set(key, now);
    return true;
  }

  /**
   * Release lock after operation completes.
   */
  static releaseLock(key: string): void {
    this.activeLocks.delete(key);
  }

  /**
   * Check if a specific idempotency key has already been executed.
   */
  static isAlreadyProcessed(idempotencyKey?: string): boolean {
    if (!idempotencyKey) return false;
    return this.processedKeys.has(idempotencyKey);
  }

  /**
   * Mark idempotency key as completed.
   */
  static markProcessed(idempotencyKey?: string): void {
    if (!idempotencyKey) return;
    this.processedKeys.add(idempotencyKey);
    // Cleanup old keys if set gets too large
    if (this.processedKeys.size > 2000) {
      const iterator = this.processedKeys.values();
      for (let i = 0; i < 500; i++) {
        const next = iterator.next();
        if (next.value) this.processedKeys.delete(next.value);
      }
    }
  }
}
