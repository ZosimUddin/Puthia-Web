import * as fs from 'fs';

// Types for Simulation Context
interface Auth {
  uid: string;
  token?: {
    email?: string;
  };
}

interface UserProfile {
  role?: string;
  permissions?: string[];
  isBlocked?: boolean;
  phone?: string;
}

interface TestContext {
  auth: Auth | null;
  dbUsers: Record<string, UserProfile>; // mock "users" collection
  path: string;
  action: 'read' | 'create' | 'update' | 'delete';
  resourceData?: Record<string, any>; // existing data (resource.data)
  requestResourceData?: Record<string, any>; // incoming data (request.resource.data)
}

// Rules Helper functions mapped to JS for perfect logic simulation
function isSignedIn(ctx: TestContext): boolean {
  return ctx.auth !== null;
}

function getUserData(ctx: TestContext): UserProfile {
  if (!ctx.auth) return {};
  return ctx.dbUsers[ctx.auth.uid] || {};
}

function existsUser(ctx: TestContext): boolean {
  if (!ctx.auth) return false;
  return ctx.dbUsers[ctx.auth.uid] !== undefined;
}

function isStaff(ctx: TestContext): boolean {
  const role = getUserData(ctx).role;
  return isSignedIn(ctx) && existsUser(ctx) && (role === 'admin' || role === 'super_admin' || role === 'editor' || role === 'staff');
}

function isAdmin(ctx: TestContext): boolean {
  const role = getUserData(ctx).role;
  return isSignedIn(ctx) && existsUser(ctx) && (role === 'admin' || role === 'super_admin');
}

// Helper for Set Diff and Key Checks
function hasAllKeys(keys: string[], list: string[]): boolean {
  return list.every(k => keys.includes(k));
}

function affectedKeys(resource: Record<string, any>, requestResource: Record<string, any>): string[] {
  const keys = new Set([...Object.keys(resource), ...Object.keys(requestResource)]);
  const affected: string[] = [];
  for (const k of keys) {
    if (resource[k] !== requestResource[k]) {
      affected.push(k);
    }
  }
  return affected;
}

// Simulated Evaluator matching /DRAFT_firestore.rules exactly
function evaluateRules(ctx: TestContext): boolean {
  const { path, action, auth, resourceData = {}, requestResourceData = {} } = ctx;

  // Global defaults
  const isDocOwner = auth && resourceData.userId === auth.uid;
  const isPostOwner = auth && resourceData.uid === auth.uid;

  // Match /stats/{docId}
  if (path.startsWith('/stats/')) {
    if (action === 'read') return true;
    if (action === 'create' || action === 'update' || action === 'delete') {
      return isStaff(ctx);
    }
  }

  // Match /user_posts/{postId}
  if (path.startsWith('/user_posts/')) {
    if (action === 'read') return true;
    if (action === 'create') {
      return isSignedIn(ctx) && requestResourceData.uid === auth?.uid;
    }
    if (action === 'update' || action === 'delete') {
      return isSignedIn(ctx) && (isPostOwner || isStaff(ctx));
    }
  }

  // Match /ads/{adId}
  if (path.startsWith('/ads/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  // Match /tourist_spots/{spotId}
  if (path.startsWith('/tourist_spots/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  // Match /lost_found/{noticeId}
  if (path.startsWith('/lost_found/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx);
    return isStaff(ctx);
  }

  // Match /notices/{noticeId}
  if (path.startsWith('/notices/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  // Match /social_events/{eventId}
  if (path.startsWith('/social_events/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  // Match /volunteer_activities/{activityId}
  if (path.startsWith('/volunteer_activities/')) {
    if (action === 'read') return true;
    if (action === 'create' || action === 'delete') return isStaff(ctx);
    if (action === 'update') {
      const affected = affectedKeys(resourceData, requestResourceData);
      const onlyVolunteers = affected.every(k => k === 'volunteers' || k === 'volunteerCount');
      return isStaff(ctx) || (isSignedIn(ctx) && onlyVolunteers);
    }
  }

  // Match /local_issues/{issueId}
  if (path.startsWith('/local_issues/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx);
    if (action === 'delete') return isStaff(ctx);
    if (action === 'update') {
      const affected = affectedKeys(resourceData, requestResourceData);
      const onlyUpvotes = affected.every(k => k === 'upvotes' || k === 'upvotedUsers');
      return isStaff(ctx) || (isSignedIn(ctx) && onlyUpvotes);
    }
  }

  // Match /marketplace_items/{itemId}
  if (path.startsWith('/marketplace_items/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx);
    return isStaff(ctx) || (isSignedIn(ctx) && isDocOwner);
  }

  // Match /complaints/{complaintId}
  if (path.startsWith('/complaints/')) {
    if (action === 'read') return true;
    if (action === 'create') return true;
    return isStaff(ctx);
  }

  // Match /reports/{reportId}
  if (path.startsWith('/reports/')) {
    return isStaff(ctx);
  }

  // Match /feedbacks/{feedbackId}
  if (path.startsWith('/feedbacks/') || path.startsWith('/citizen_feedbacks/')) {
    if (action === 'read') return true;
    if (action === 'create') return true;
    return isStaff(ctx);
  }

  // Match /ad_applications/{applicationId}
  if (path.startsWith('/ad_applications/')) {
    if (action === 'read') return isStaff(ctx);
    if (action === 'create') return isSignedIn(ctx);
    return isStaff(ctx);
  }

  // Match /service_applications/{appId}
  if (path.startsWith('/service_applications/')) {
    if (action === 'read') return isStaff(ctx) || (isSignedIn(ctx) && isDocOwner);
    if (action === 'create') return isSignedIn(ctx);
    if (action === 'update') return isStaff(ctx) || (isSignedIn(ctx) && isDocOwner);
    if (action === 'delete') return isStaff(ctx);
  }

  // Match /special_offers/{offerId}
  if (path.startsWith('/special_offers/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  // Match /volunteers/{volunteerId}
  if (path.startsWith('/volunteers/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx);
    const selfPhone = getUserData(ctx).phone;
    return isStaff(ctx) || (isSignedIn(ctx) && resourceData.phone === selfPhone && selfPhone !== undefined);
  }

  // Match /blood_donors/{donorId}
  if (path.startsWith('/blood_donors/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx);
    return isStaff(ctx) || (isSignedIn(ctx) && isDocOwner);
  }

  // Match /blood_donations/{docId}
  if (path.startsWith('/blood_donations/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx) && requestResourceData.userId === auth?.uid;
    return isStaff(ctx) || (isSignedIn(ctx) && isDocOwner);
  }

  // Match /blood_requests/{requestId}
  if (path.startsWith('/blood_requests/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx);
    if (action === 'update') return isStaff(ctx) || (isSignedIn(ctx) && isDocOwner);
    if (action === 'delete') return isStaff(ctx);
  }

  // Match /ambulances/{ambulanceId}
  if (path.startsWith('/ambulances/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  // Match /tolet_ads/{adId}
  if (path.startsWith('/tolet_ads/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx);
    const selfPhone = getUserData(ctx).phone;
    return isStaff(ctx) || (isSignedIn(ctx) && resourceData.ownerPhone === selfPhone && selfPhone !== undefined);
  }

  // Match /users/{userId}
  if (path.startsWith('/users/')) {
    const segments = path.split('/');
    const userId = segments[2];

    // Favorites nested collection: /users/{userId}/favorites/{favoriteId}
    if (segments.length >= 5 && segments[3] === 'favorites') {
      return isSignedIn(ctx) && auth?.uid === userId;
    }

    if (action === 'read') return true;
    if (action === 'create') {
      const hasRoleField = Object.keys(requestResourceData).includes('role');
      const isRoleUser = requestResourceData.role === 'user';
      return isSignedIn(ctx) && auth?.uid === userId && (!hasRoleField || isRoleUser);
    }
    if (action === 'update') {
      const affected = affectedKeys(resourceData, requestResourceData);
      const isDangerousChange = affected.some(k => k === 'role' || k === 'permissions' || k === 'isBlocked');
      return isSignedIn(ctx) && auth?.uid === userId && (!isDangerousChange || isAdmin(ctx));
    }
    if (action === 'delete') {
      return isAdmin(ctx);
    }
  }

  // Match /point_history/{docId}
  if (path.startsWith('/point_history/')) {
    if (action === 'read') return isSignedIn(ctx) && resourceData.userId === auth?.uid;
    if (action === 'create') return isSignedIn(ctx) && requestResourceData.userId === auth?.uid;
    return false;
  }

  // Match /recharge_requests/{requestId}
  if (path.startsWith('/recharge_requests/')) {
    if (action === 'read') return isStaff(ctx) || (isSignedIn(ctx) && resourceData.uid === auth?.uid);
    if (action === 'create') return isSignedIn(ctx) && requestResourceData.uid === auth?.uid;
    return isStaff(ctx);
  }

  // Educational references
  if (path.startsWith('/educational_institutions/') || path.startsWith('/orphanage_posts/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  if (path.startsWith('/orphanage_donations/') || path.startsWith('/orphanage_admissions/')) {
    if (action === 'read') return isStaff(ctx);
    if (action === 'create') return isSignedIn(ctx);
    return isStaff(ctx);
  }

  // Citizen News
  if (path.startsWith('/citizen_news/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx) && requestResourceData.uid === auth?.uid;
    return isStaff(ctx) || (isSignedIn(ctx) && resourceData.uid === auth?.uid);
  }

  // Lawyers & Journalists reference lists
  if (path.startsWith('/lawyers/') || path.startsWith('/journalists/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  // Journalist Tips
  if (path.startsWith('/journalist_tips/')) {
    if (action === 'read') return isStaff(ctx) || (isSignedIn(ctx) && resourceData.journalistId === auth?.uid);
    if (action === 'create') return isSignedIn(ctx);
    return isStaff(ctx);
  }

  // Training & Job applications
  if (path.startsWith('/training_registrations/') || path.startsWith('/job_applications/')) {
    if (action === 'read') return isStaff(ctx) || (isSignedIn(ctx) && resourceData.userId === auth?.uid);
    if (action === 'create') return isSignedIn(ctx) && requestResourceData.userId === auth?.uid;
    return isStaff(ctx);
  }

  // Career forum
  if (path.startsWith('/career_queries/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx);
    return isStaff(ctx);
  }

  // Directory reference pages (Careers, Jobs, Health, etc.)
  if (
    path.startsWith('/job_news/') ||
    path.startsWith('/education_posts/') ||
    path.startsWith('/local_jobs/') ||
    path.startsWith('/local_workshops/') ||
    path.startsWith('/scholarships/') ||
    path.startsWith('/health_services/') ||
    path.startsWith('/news/') ||
    path.startsWith('/institutions/') ||
    path.startsWith('/jobs/') ||
    path.startsWith('/agriculture/') ||
    path.startsWith('/administration/') ||
    path.startsWith('/ngos/') ||
    path.startsWith('/hospitals/') ||
    path.startsWith('/clinics/') ||
    path.startsWith('/doctors/') ||
    path.startsWith('/pharmacies/') ||
    path.startsWith('/diagnostics/') ||
    path.startsWith('/dentals/') ||
    path.startsWith('/market_prices/') ||
    path.startsWith('/emergency_contacts/') ||
    path.startsWith('/local_shops/') ||
    path.startsWith('/local_ngos/') ||
    path.startsWith('/electricity_posts/') ||
    path.startsWith('/veterinary_posts/') ||
    path.startsWith('/police_posts/') ||
    path.startsWith('/fire_posts/') ||
    path.startsWith('/cyber_posts/') ||
    path.startsWith('/women_child_posts/') ||
    path.startsWith('/national_helpline_posts/') ||
    path.startsWith('/restaurant_posts/') ||
    path.startsWith('/hotel_posts/') ||
    path.startsWith('/banking_finance_posts/') ||
    path.startsWith('/service_provider_posts/') ||
    path.startsWith('/mosque_posts/') ||
    path.startsWith('/eidgah_posts/') ||
    path.startsWith('/graveyard_posts/') ||
    path.startsWith('/janaza_notices/') ||
    path.startsWith('/religious_event_posts/') ||
    path.startsWith('/orphanage_posts/')
  ) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  // Eidgah volunteers
  if (path.startsWith('/eidgah_volunteers/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx);
    return isStaff(ctx);
  }

  // Events & Categories
  if (path.startsWith('/events/') || path.startsWith('/categories/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  // Settings
  if (path.startsWith('/settings/')) {
    if (action === 'read') return true;
    return isAdmin(ctx);
  }

  // Polls & Votes
  if (path.startsWith('/polls/')) {
    if (action === 'read') return true;
    if (action === 'create' || action === 'delete') return isStaff(ctx);
    return isSignedIn(ctx);
  }

  if (path.startsWith('/votes/')) {
    if (action === 'read') return isSignedIn(ctx) && resourceData.userId === auth?.uid;
    if (action === 'create') return isSignedIn(ctx) && requestResourceData.userId === auth?.uid;
    return false;
  }

  // Event Registrations
  if (path.startsWith('/event_registrations/')) {
    if (action === 'read') return isStaff(ctx) || (isSignedIn(ctx) && resourceData.userId === auth?.uid);
    if (action === 'create') return isSignedIn(ctx) && requestResourceData.userId === auth?.uid;
    return isStaff(ctx);
  }

  // Businesses & Products reference/owner-managed
  if (path.startsWith('/businesses/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx) && requestResourceData.userId === auth?.uid;
    return isStaff(ctx) || (isSignedIn(ctx) && isDocOwner);
  }

  if (path.startsWith('/products/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx) && requestResourceData.userId === auth?.uid;
    return isStaff(ctx) || (isSignedIn(ctx) && isDocOwner);
  }

  if (path.startsWith('/reviews/')) {
    if (action === 'read') return true;
    if (action === 'create') return isSignedIn(ctx) && requestResourceData.userId === auth?.uid;
    return isStaff(ctx) || (isSignedIn(ctx) && isDocOwner);
  }

  if (path.startsWith('/favorites/')) {
    return isSignedIn(ctx) && resourceData.userId === auth?.uid;
  }

  if (path.startsWith('/notifications/')) {
    if (action === 'read' || action === 'update' || action === 'delete') return isSignedIn(ctx) && resourceData.userId === auth?.uid;
    return isStaff(ctx);
  }

  if (path.startsWith('/representatives/') || path.startsWith('/house_rents/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  if (path.startsWith('/gallery_items/') || path.startsWith('/gallery_photos/') || path.startsWith('/gallery_videos/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  if (path.startsWith('/sub_menu_pages/')) {
    if (action === 'read') return true;
    return isStaff(ctx);
  }

  return false; // catch all deny
}

// Suite Execution
interface TestCase {
  id: number;
  description: string;
  context: TestContext;
  shouldPass: boolean;
}

const testCases: TestCase[] = [
  {
    id: 1,
    description: "Payload 1: Unauthorized Role Escalation (Self-Promo)",
    shouldPass: false,
    context: {
      auth: { uid: "user_123" },
      dbUsers: {
        "user_123": { role: "user" }
      },
      path: "/users/user_123",
      action: "update",
      resourceData: { name: "John Doe", role: "user" },
      requestResourceData: { name: "John Doe", role: "super_admin" }
    }
  },
  {
    id: 2,
    description: "Payload 2: Cross-User Profile Modification",
    shouldPass: false,
    context: {
      auth: { uid: "user_123" },
      dbUsers: {
        "user_123": { role: "user" },
        "user_456": { role: "user" }
      },
      path: "/users/user_456",
      action: "update",
      resourceData: { name: "Alice" },
      requestResourceData: { name: "Hacked User" }
    }
  },
  {
    id: 3,
    description: "Payload 3: Unauthorized Public Notice Creation",
    shouldPass: false,
    context: {
      auth: null,
      dbUsers: {},
      path: "/notices/fake_notice_999",
      action: "create",
      requestResourceData: { title: "School Closed Today", content: "Fake news" }
    }
  },
  {
    id: 4,
    description: "Payload 4: Regular User Creating Public Advertisement",
    shouldPass: false,
    context: {
      auth: { uid: "user_123" },
      dbUsers: {
        "user_123": { role: "user" }
      },
      path: "/ads/malicious_ad",
      action: "create",
      requestResourceData: { title: "Free Money Scam", imageUrl: "https://scam.link" }
    }
  },
  {
    id: 5,
    description: "Payload 5: Unauthorized Sub-Menu Page Update",
    shouldPass: false,
    context: {
      auth: { uid: "user_123" },
      dbUsers: {
        "user_123": { role: "user" }
      },
      path: "/sub_menu_pages/tourist-spots",
      action: "update",
      resourceData: { title: "Tourist Spots", description: "Baneswar Temple" },
      requestResourceData: { title: "Tourist Spots", description: "Defaced by hackers" }
    }
  },
  {
    id: 6,
    description: "Payload 6: Malicious Point Duplication (Point History)",
    shouldPass: false,
    context: {
      auth: { uid: "user_123" },
      dbUsers: {
        "user_123": { role: "user" }
      },
      path: "/point_history/fake_point_history",
      action: "create",
      requestResourceData: { userId: "user_456", points: 10000 }
    }
  },
  {
    id: 7,
    description: "Payload 7: Mismatching Recharge Request",
    shouldPass: false,
    context: {
      auth: { uid: "user_123" },
      dbUsers: {
        "user_123": { role: "user" }
      },
      path: "/recharge_requests/fake_req",
      action: "create",
      requestResourceData: { uid: "user_456", rechargeAmount: 100 }
    }
  },
  {
    id: 8,
    description: "Payload 8: Regular User Deleting Local Job Reference",
    shouldPass: false,
    context: {
      auth: { uid: "user_123" },
      dbUsers: {
        "user_123": { role: "user" }
      },
      path: "/local_jobs/valid_job_123",
      action: "delete"
    }
  },
  {
    id: 9,
    description: "Payload 9: Unauthorized Settings Manipulation",
    shouldPass: false,
    context: {
      auth: { uid: "user_123" },
      dbUsers: {
        "user_123": { role: "user" }
      },
      path: "/settings/general",
      action: "update",
      resourceData: { appName: "Puthia Diary" },
      requestResourceData: { appName: "Hacked Diary" }
    }
  },
  {
    id: 10,
    description: "Payload 10: General User Modifying Official Complaint Status",
    shouldPass: false,
    context: {
      auth: { uid: "user_123" },
      dbUsers: {
        "user_123": { role: "user" }
      },
      path: "/complaints/complaint_789",
      action: "update",
      resourceData: { status: "Pending" },
      requestResourceData: { status: "Resolved" }
    }
  },
  {
    id: 11,
    description: "Payload 11: Attempting to Add Blood Donation Record for Other User",
    shouldPass: false,
    context: {
      auth: { uid: "user_123" },
      dbUsers: {
        "user_123": { role: "user" }
      },
      path: "/blood_donations/donation_abc",
      action: "create",
      requestResourceData: { userId: "user_456", bagCount: 2 }
    }
  },
  {
    id: 12,
    description: "Payload 12: Anonymous Attempt to Register as Volunteer",
    shouldPass: false,
    context: {
      auth: null,
      dbUsers: {},
      path: "/volunteers/vol_abc",
      action: "create",
      requestResourceData: { name: "Spam Volunteer", phone: "01700000000" }
    }
  },
  {
    id: 13,
    description: "Positive Case: User Creating Own Profile with User Role",
    shouldPass: true,
    context: {
      auth: { uid: "user_123" },
      dbUsers: {
        "user_123": { role: "user" }
      },
      path: "/users/user_123",
      action: "create",
      requestResourceData: { name: "John Doe", role: "user" }
    }
  },
  {
    id: 14,
    description: "Positive Case: Admin Modifying Application Settings",
    shouldPass: true,
    context: {
      auth: { uid: "admin_123" },
      dbUsers: {
        "admin_123": { role: "admin" }
      },
      path: "/settings/general",
      action: "update",
      resourceData: { appName: "Puthia Diary" },
      requestResourceData: { appName: "Puthia Citizen Directory" }
    }
  }
];

// Run Suite
console.log("=================================================");
console.log("RUNNING FIRESTORE SECURITY RULES COMPLIANCE TESTS");
console.log("=================================================");

let failed = false;
for (const tc of testCases) {
  const allowed = evaluateRules(tc.context);
  const result = allowed === tc.shouldPass;
  if (result) {
    console.log(`[PASS] Test ${tc.id}: ${tc.description}`);
  } else {
    console.error(`[FAIL] Test ${tc.id}: ${tc.description}`);
    console.error(`       Detail: Expected ${tc.shouldPass ? "Allowed" : "Blocked"}, got ${allowed ? "Allowed" : "Blocked"}`);
    failed = true;
  }
}

console.log("=================================================");
if (failed) {
  console.error("❌ TESTING RESULT: FAIL");
  process.exit(1);
} else {
  console.log("✅ TESTING RESULT: SUCCESS! All security constraints validated.");
}
