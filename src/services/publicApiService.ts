// Public API Gateway & Ecosystem Service for Puthia Smart Portal

export interface ApiKeyConfig {
  id: string;
  appName: string;
  developerEmail: string;
  apiKey: string;
  scope: ('read_public' | 'read_emergency' | 'read_business' | 'full_access')[];
  rateLimitPerMin: number;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface PublicApiEndpoint {
  path: string;
  method: 'GET';
  description: string;
  category: 'Services' | 'Locations' | 'Business' | 'Emergency' | 'Education' | 'Tourism' | 'News';
  requiresKey: boolean;
  sampleResponse: any;
}

// Pre-seeded Active API Keys for Developers
export const mockApiKeys: ApiKeyConfig[] = [
  {
    id: "KEY-101",
    appName: "Puthia Local News App",
    developerEmail: "dev@puthia.gov.bd",
    apiKey: "pth_pub_live_9a8b7c6d5e4f",
    scope: ["read_public", "read_business"],
    rateLimitPerMin: 60,
    status: "active",
    createdAt: "২০২৬-০১-১৫"
  },
  {
    id: "KEY-102",
    appName: "Rajshahi Emergency Directory Bot",
    developerEmail: "bot@emergency.bd",
    apiKey: "pth_pub_live_1234567890ab",
    scope: ["read_public", "read_emergency"],
    rateLimitPerMin: 120,
    status: "active",
    createdAt: "২০২৬-০২-০১"
  }
];

// Available Public API Endpoints Directory
export const PUBLIC_API_ENDPOINTS: PublicApiEndpoint[] = [
  {
    path: "/api/v1/services",
    method: "GET",
    description: "পুঠিয়ার স্থানীয় সেবাসমূহের তালিকা ও যোগাযোগ",
    category: "Services",
    requiresKey: true,
    sampleResponse: [
      { id: "srv-1", name: "উপজেলা স্বাস্থ্য কমপ্লেক্স", phone: "01700000000", location: "পুঠিয়া সদর" }
    ]
  },
  {
    path: "/api/v1/locations",
    method: "GET",
    description: "ইউনিয়ন ও মৌজাভিত্তিক ভৌগোলিক ডাটাবেজ",
    category: "Locations",
    requiresKey: false,
    sampleResponse: [
      { union: "বানেশ্বর", totalVillages: 18, postalCode: "৬২৪০" }
    ]
  },
  {
    path: "/api/v1/business",
    method: "GET",
    description: "বানেশ্বর হাট ও স্থানীয় বাণিজ্যিক ডিরেক্টরি",
    category: "Business",
    requiresKey: true,
    sampleResponse: [
      { businessName: "বানেশ্বর রাইস ট্রেডার্স", category: "কৃষি পন্য", phone: "01811112222" }
    ]
  },
  {
    path: "/api/v1/emergency",
    method: "GET",
    description: "ফায়ার সার্ভিস, পুলিশ ও জরুরি রক্তের গ্রুপ ডিরেক্টরি",
    category: "Emergency",
    requiresKey: false,
    sampleResponse: [
      { title: "পুঠিয়া ফায়ার সার্ভিস স্টেশন", helpline: "999", direct: "01711223344" }
    ]
  },
  {
    path: "/api/v1/education",
    method: "GET",
    description: "উপজেলার স্কুল, কলেজ ও মাদ্রাসার তালিকা",
    category: "Education",
    requiresKey: true,
    sampleResponse: [
      { name: "পুঠিয়া পি এন সরকারি উচ্চ বিদ্যালয়", eiin: "126830", level: "মাধ্যমিক" }
    ]
  },
  {
    path: "/api/v1/tourism",
    method: "GET",
    description: "রাজবাড়ি, মন্দির ও পর্যটন স্থানসমূহের বিস্তারিত",
    category: "Tourism",
    requiresKey: false,
    sampleResponse: [
      { spotName: "পুঠিয়া রাজবাড়ি", timing: "সকাল ৯টা - বিকাল ৫টা", entryFee: "৩০ টাকা" }
    ]
  },
  {
    path: "/api/v1/news",
    method: "GET",
    description: "স্থানীয় জরুরি খবর ও সরকারি ঘোষণা",
    category: "News",
    requiresKey: false,
    sampleResponse: [
      { headline: "বানেশ্বর হাটে অতিরিক্ত খাজনা না দেওয়ার অনুরোধ", date: "২০২৬-০৮-১৮" }
    ]
  }
];

/**
 * Validate API Key & Rate Limiter
 */
export function validateApiKey(apiKeyInput: string): { valid: boolean; keyConfig?: ApiKeyConfig; message?: string } {
  if (!apiKeyInput) {
    return { valid: false, message: "API Key প্রদান করা হয়নি (Missing X-API-KEY Header)" };
  }

  const found = mockApiKeys.find(k => k.apiKey === apiKeyInput);
  if (!found) {
    return { valid: false, message: "অকার্যকর API Key" };
  }

  if (found.status !== 'active') {
    return { valid: false, message: "আপনার API Key টি বর্তমানে স্থগিত (Suspended) রয়েছে" };
  }

  return { valid: true, keyConfig: found };
}
