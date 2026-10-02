// Advanced Security Audit & Threat Monitoring Service for Puthia Smart Portal

export interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  device: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface SecurityEventLog {
  id: string;
  type: 'LOGIN_SUCCESS' | 'SUSPICIOUS_LOGIN' | 'FAILED_LOGIN' | 'PERMISSION_AUDIT' | 'API_RATE_LIMIT' | 'FILE_UPLOAD_BLOCKED';
  user: string;
  ip: string;
  details: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Pre-seeded Security Data
export const mockActiveSessions: ActiveSession[] = [
  {
    id: "SESS-101",
    userId: "admin-1",
    userName: "উপজেলা নির্বাহী অফিসার (ইউএনও)",
    device: "Chrome on macOS",
    ipAddress: "103.230.104.12",
    location: "পুঠিয়া, রাজশাহী",
    lastActive: "এখনই সক্রিয়",
    current: true
  },
  {
    id: "SESS-102",
    userId: "mod-2",
    userName: "অ্যাডমিন মডারেটর - বানেশ্বর",
    device: "Firefox on Windows 11",
    ipAddress: "103.230.104.45",
    location: "বানেশ্বর, পুঠিয়া",
    lastActive: "৫ মিনিট আগে",
    current: false
  },
  {
    id: "SESS-103",
    userId: "user-88",
    userName: "বানেশ্বর রাইস মিল ও অটো হাব",
    device: "Safari on iPhone 15 Pro",
    ipAddress: "103.112.54.18",
    location: "রাজশাহী শহর",
    lastActive: "১৮ মিনিট আগে",
    current: false
  }
];

export const mockSecurityLogs: SecurityEventLog[] = [
  {
    id: "LOG-501",
    type: "SUSPICIOUS_LOGIN",
    user: "অজ্ঞাত অ্যাকাউন্ট (admin_test)",
    ip: "185.220.101.5",
    details: "অপরিচিত IP ঠিকানা থেকে পরপর ৩বার ভুল পাসওয়ার্ড ইনপুট। অ্যাকাউন্ট সাময়িক ব্লকড।",
    timestamp: "২০২৬-০৮-১৮ ০০:৪৫",
    severity: "high"
  },
  {
    id: "LOG-502",
    type: "LOGIN_SUCCESS",
    user: "উপজেলা নির্বাহী অফিসার (ইউএনও)",
    ip: "103.230.104.12",
    details: "সফলভাবে সুপার অ্যাডমিন প্যানেলে লগইন করা হয়েছে। 2FA যাচাইকৃত।",
    timestamp: "২০২৬-০৮-১৮ ০০:৩০",
    severity: "low"
  },
  {
    id: "LOG-503",
    type: "FILE_UPLOAD_BLOCKED",
    user: "সাধারণ ব্যবহারকারী (user-44)",
    ip: "103.112.54.99",
    details: "ঝুঁকিপূর্ণ এক্সটেনশন (.exe) বিশিষ্ট ফাইল আপলোডের চেষ্টা ব্লক করা হয়েছে।",
    timestamp: "২০২৬-০৮-১৭ ২৩:১৫",
    severity: "medium"
  },
  {
    id: "LOG-504",
    type: "API_RATE_LIMIT",
    user: "Bot Client (dev_key_x)",
    ip: "198.51.100.14",
    details: "পাবলিক API-তে প্রতি মিনিটে ১০০+ রিকোয়েস্ট পাঠিয়ে রেট লিমিট অতিক্রম করেছে।",
    timestamp: "২০২৬-০৮-১৭ ২২:০share",
    severity: "medium"
  }
];

/**
 * Perform Global Security Operation: Force Logout All Active Sessions
 */
export function terminateAllActiveSessions(): Promise<{ success: boolean; terminatedCount: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        terminatedCount: mockActiveSessions.length - 1 // keep current
      });
    }, 1000);
  });
}
