// Data Freshness & Verification Service for Puthia Smart Portal

export interface VerificationMetadata {
  lastUpdated: string;       // ISO String / Date
  lastVerified: string;      // ISO String / Date
  verificationDate: string;  // ISO String / Date
  nextVerificationDue: string; // ISO String / Date
  verifiedBy?: string;       // Admin or Moderator Name/ID
  freshnessStatus: 'verified' | 'due_soon' | 'expired';
}

// Verification validity period in days (default: 90 days / 3 months)
export const DEFAULT_VERIFICATION_PERIOD_DAYS = 90;

/**
 * Calculate verification status and next due date
 */
export function calculateVerificationMetadata(
  lastVerifiedIso?: string,
  periodDays: number = DEFAULT_VERIFICATION_PERIOD_DAYS
): VerificationMetadata {
  const now = new Date();
  const verifiedDate = lastVerifiedIso ? new Date(lastVerifiedIso) : now;
  
  const nextDue = new Date(verifiedDate);
  nextDue.setDate(nextDue.getDate() + periodDays);

  const diffTime = nextDue.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let freshnessStatus: 'verified' | 'due_soon' | 'expired' = 'verified';
  if (diffDays <= 0) {
    freshnessStatus = 'expired';
  } else if (diffDays <= 15) {
    freshnessStatus = 'due_soon';
  }

  return {
    lastUpdated: now.toISOString(),
    lastVerified: verifiedDate.toISOString(),
    verificationDate: verifiedDate.toISOString(),
    nextVerificationDue: nextDue.toISOString(),
    freshnessStatus
  };
}

/**
 * Helper to check if item requires re-verification
 */
export function isVerificationExpired(nextVerificationDue?: string): boolean {
  if (!nextVerificationDue) return false;
  return new Date(nextVerificationDue).getTime() < Date.now();
}
