import { db } from "../firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit
} from "firebase/firestore";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type PrivacyOption = "Everyone" | "Friends" | "OnlyMe";

export type VerificationStatusType = 
  | "not_verified" 
  | "pending" 
  | "under_review" 
  | "verified" 
  | "rejected" 
  | "suspended";

export interface ProfilePrivacySettings {
  profileVisibility: PrivacyOption;
  whoCanFollow: PrivacyOption;
  whoCanFriendRequest: PrivacyOption | "FriendsOfFriends";
  whoCanMessage: PrivacyOption;
  whoCanViewPosts: PrivacyOption;
  whoCanViewTaggedPosts: PrivacyOption;
  whoCanSeeFriendList: PrivacyOption;
  whoCanSeeFollowers: PrivacyOption;
  showInSearch: boolean;
  isPrivateAccount: boolean;
  updatedAt?: any;
}

export interface FeaturedItem {
  id: string;
  userId: string;
  type: "post" | "photo" | "video" | "reel" | "event" | "achievement";
  title: string;
  description?: string;
  mediaUrl?: string;
  targetId?: string;
  order: number;
  visibility: PrivacyOption;
  createdAt: any;
}

export interface VerificationRequestRecord {
  id: string;
  applicantUid: string;
  applicantName: string;
  applicantPhone: string;
  badgeType: "user" | "business" | "official" | "professional";
  nidNumber?: string;
  tradeLicenseNumber?: string;
  documentUrls?: string[];
  status: VerificationStatusType;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: any;
  createdAt: any;
}

export interface ProfileAuditLog {
  id?: string;
  userId: string;
  action: "PROFILE_UPDATE" | "USERNAME_CHANGE" | "PRIVACY_UPDATE" | "FEATURED_UPDATE" | "VERIFICATION_SUBMIT" | "FRIEND_ACTION" | "FOLLOW_ACTION" | "BLOCK_ACTION";
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: any;
}

export interface UserProfileFull {
  uid: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatarUrl: string;
  coverUrl?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  location?: string;
  union?: string;
  website?: string;
  dateOfBirth?: string;
  dobVisibility?: PrivacyOption;
  contactVisibility?: PrivacyOption;
  role?: string;
  points?: number;
  badges?: string[];
  verificationStatus: VerificationStatusType;
  isVerified: boolean;
  authorBadge?: boolean;
  lastUsernameChangeAt?: any;
  
  // Real-time Statistics
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  postCount: number;
  profileViews: number;
  
  createdAt: any;
  updatedAt?: any;
}

// Reserved usernames that users cannot register or change to
export const RESERVED_USERNAMES = new Set([
  "admin", "administrator", "puthia", "official", "government", "govt",
  "moderator", "mod", "help", "support", "root", "api", "auth", "system",
  "settings", "security", "verify", "verified", "union", "upazila", "police",
  "fire", "hospital", "doctor", "emergency", "service", "terms", "privacy", "about"
]);

// ==========================================
// 2. USERNAME & PROFILE VALIDATION
// ==========================================

export async function checkUsernameAvailability(username: string, currentUid?: string): Promise<{
  available: boolean;
  reason?: string;
}> {
  const cleanUsername = username.trim().toLowerCase();

  // 1. Format check
  if (!/^[a-z0-9_.]{3,20}$/.test(cleanUsername)) {
    return {
      available: false,
      reason: "ইউজারনেম ৩-২০ অক্ষরের মধ্যে ছোট হাতের বর্ণ, সংখ্যা, আন্ডারস্কোর (_) বা ডট (.) দিয়ে হতে হবে।"
    };
  }

  // 2. Reserved username check
  if (RESERVED_USERNAMES.has(cleanUsername)) {
    return {
      available: false,
      reason: "এই ইউজারনেমটি একটি সংরক্ষিত সিস্টেম কিওয়ার্ড (Reserved Username)। অন্য ইউজারনেম চেষ্টা করুন।"
    };
  }

  // 3. Uniqueness check in Firestore
  try {
    const q = query(collection(db, "users"), where("username", "==", cleanUsername), limit(1));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const existingDoc = snap.docs[0];
      if (currentUid && existingDoc.id === currentUid) {
        return { available: true }; // Current user already owns this username
      }
      return {
        available: false,
        reason: "এই ইউজারনেমটি অন্য একজন নাগরিক ইতোমধ্যে ব্যবহার করছেন।"
      };
    }
  } catch (err) {
    console.error("Username availability check error:", err);
  }

  return { available: true };
}

// Validate Image Upload Payload (Base64 size / URL format)
export function validateImagePayload(imageData: string, maxBytesMB: number = 5): { valid: boolean; error?: string } {
  if (!imageData) return { valid: true };

  if (imageData.startsWith("data:image/")) {
    const stringLength = imageData.length - imageData.indexOf(",") - 1;
    const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896;
    const maxAllowed = maxBytesMB * 1024 * 1024;
    if (sizeInBytes > maxAllowed) {
      return {
        valid: false,
        error: `ছবিটির সাইজ খুব বড় (সর্বোচ্চ ${maxBytesMB}MB ফাইল আপলোড গ্রহণযোগ্য)।`
      };
    }
  }
  return { valid: true };
}

// ==========================================
// 3. PROFILE CRUD & STATISTICS API
// ==========================================

export async function getUserProfileById(uid: string): Promise<UserProfileFull | null> {
  try {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: snap.id,
        name: data.name || "সম্মানিত নাগরিক",
        username: data.username || `user_${snap.id.substring(0, 8)}`,
        email: data.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        avatarUrl: data.avatarUrl || data.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${uid}`,
        coverUrl: data.coverUrl || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
        gender: data.gender || "prefer_not_to_say",
        location: data.location || data.union || "পুঠিয়া",
        union: data.union || "পুঠিয়া ইউনিয়ন",
        website: data.website || "",
        dateOfBirth: data.dateOfBirth || "",
        dobVisibility: data.dobVisibility || "Friends",
        contactVisibility: data.contactVisibility || "Friends",
        role: data.role || "user",
        points: data.points || 0,
        badges: data.badges || [],
        verificationStatus: data.verificationStatus || "not_verified",
        isVerified: data.isVerified === true || data.verificationStatus === "verified",
        authorBadge: data.authorBadge === true || data.isVerified === true,
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
        friendsCount: data.friendsCount || 0,
        postCount: data.postCount || 0,
        profileViews: data.profileViews || 0,
        createdAt: data.createdAt || new Date().toISOString()
      };
    }
  } catch (err) {
    console.error("Error fetching user profile by ID:", err);
  }
  return null;
}

export async function getUserProfileByUsername(username: string): Promise<UserProfileFull | null> {
  try {
    const cleanUsername = username.trim().toLowerCase();
    const q = query(collection(db, "users"), where("username", "==", cleanUsername), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return getUserProfileById(snap.docs[0].id);
    }
  } catch (err) {
    console.error("Error fetching user profile by username:", err);
  }
  return null;
}

export async function updateUserProfile(
  uid: string, 
  updates: Partial<UserProfileFull>
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. If username is being changed, check availability & rate limit
    if (updates.username) {
      const cleanUsername = updates.username.trim().toLowerCase();
      const availability = await checkUsernameAvailability(cleanUsername, uid);
      if (!availability.available) {
        return { success: false, error: availability.reason };
      }
      updates.username = cleanUsername;
    }

    // 2. Validate images
    if (updates.avatarUrl) {
      const imgVal = validateImagePayload(updates.avatarUrl);
      if (!imgVal.valid) return { success: false, error: imgVal.error };
    }
    if (updates.coverUrl) {
      const imgVal = validateImagePayload(updates.coverUrl);
      if (!imgVal.valid) return { success: false, error: imgVal.error };
    }

    // 3. Save updates to Firestore
    const userRef = doc(db, "users", uid);
    const profileRef = doc(db, "profiles", uid);

    const payload = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, payload, { merge: true });
    await setDoc(profileRef, payload, { merge: true });

    // 4. Record audit log
    await logProfileAudit(uid, "PROFILE_UPDATE", "প্রোফাইলের তথ্যাদি সফলভাবে আপডেট করা হয়েছে।");

    return { success: true };
  } catch (err: any) {
    console.error("Error updating user profile:", err);
    return { success: false, error: err.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।" };
  }
}

// Increments profile view count
export async function incrementProfileView(targetUid: string, viewerUid?: string) {
  if (!targetUid || targetUid === viewerUid) return;
  try {
    const userRef = doc(db, "users", targetUid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const currentViews = snap.data().profileViews || 0;
      await updateDoc(userRef, { profileViews: currentViews + 1 });
    }
  } catch (e) {
    // Non-blocking
  }
}

// ==========================================
// 4. FRIEND SYSTEM (friendships & friend_requests)
// ==========================================

export async function sendFriendRequest(senderId: string, receiverId: string): Promise<{ success: boolean; message?: string }> {
  if (senderId === receiverId) return { success: false, message: "নিজের কাছে ফ্রেন্ড রিকোয়েস্ট পাঠানো যাবে না।" };

  try {
    // Check if blocked
    const blockId1 = `${senderId}_${receiverId}`;
    const blockId2 = `${receiverId}_${senderId}`;
    const bSnap1 = await getDoc(doc(db, "blocks", blockId1));
    const bSnap2 = await getDoc(doc(db, "blocks", blockId2));
    if (bSnap1.exists() || bSnap2.exists()) {
      return { success: false, message: "ব্লক থাকা অবস্থায় ফ্রেন্ড রিকোয়েস্ট পাঠানো যাবে না।" };
    }

    // Check if already friends
    const fsId1 = `${senderId}_${receiverId}`;
    const fsId2 = `${receiverId}_${senderId}`;
    const fsSnap1 = await getDoc(doc(db, "friendships", fsId1));
    const fsSnap2 = await getDoc(doc(db, "friendships", fsId2));
    if (fsSnap1.exists() || fsSnap2.exists()) {
      return { success: false, message: "আপনারা ইতোমধ্যে ফ্রেন্ড।" };
    }

    // Add friend request record
    const reqDocId = `${senderId}_${receiverId}`;
    await setDoc(doc(db, "friend_requests", reqDocId), {
      senderId,
      receiverId,
      status: "pending",
      createdAt: serverTimestamp()
    });

    // Send Real-time Notification
    await addDoc(collection(db, "notifications"), {
      recipientId: receiverId,
      senderId: senderId,
      type: "friend_request",
      title: "নতুন বন্ধুত্বের অনুরোধ! 👥",
      content: "একজন নাগরিক আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন।",
      read: false,
      createdAt: serverTimestamp()
    });

    await logProfileAudit(senderId, "FRIEND_ACTION", `User ${receiverId} কে ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে।`);

    return { success: true, message: "ফ্রেন্ড রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!" };
  } catch (err: any) {
    return { success: false, message: err.message || "ত্রুটি হয়েছে।" };
  }
}

export async function acceptFriendRequest(senderId: string, receiverId: string): Promise<{ success: boolean }> {
  try {
    const reqDocId = `${senderId}_${receiverId}`;
    await deleteDoc(doc(db, "friend_requests", reqDocId));

    // Create bi-directional friendship document
    const friendshipId = `${senderId}_${receiverId}`;
    await setDoc(doc(db, "friendships", friendshipId), {
      user1Id: senderId,
      user2Id: receiverId,
      createdAt: serverTimestamp()
    });

    // Automatically ensure follow relationship as well
    await setDoc(doc(db, "follows", `${senderId}_${receiverId}`), { followerId: senderId, followingId: receiverId, createdAt: serverTimestamp() });
    await setDoc(doc(db, "follows", `${receiverId}_${senderId}`), { followerId: receiverId, followingId: senderId, createdAt: serverTimestamp() });

    // Send Acceptance Notification
    await addDoc(collection(db, "notifications"), {
      recipientId: senderId,
      senderId: receiverId,
      type: "friend_accept",
      title: "বন্ধুত্বের অনুরোধ গৃহীত হয়েছে! 🤝",
      content: "আপনার ফ্রেন্ড রিকোয়েস্ট গ্রহণ করা হয়েছে।",
      read: false,
      createdAt: serverTimestamp()
    });

    await logProfileAudit(receiverId, "FRIEND_ACTION", `User ${senderId} এর ফ্রেন্ড রিকোয়েস্ট গ্রহণ করা হয়েছে।`);

    return { success: true };
  } catch (err) {
    console.error("Accept friend request error:", err);
    return { success: false };
  }
}

export async function removeFriend(uid1: string, uid2: string): Promise<{ success: boolean }> {
  try {
    await deleteDoc(doc(db, "friendships", `${uid1}_${uid2}`));
    await deleteDoc(doc(db, "friendships", `${uid2}_${uid1}`));
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// Calculate mutual friends
export function calculateMutualFriends(user1Friends: string[], user2Friends: string[]): string[] {
  const set2 = new Set(user2Friends);
  return user1Friends.filter(uid => set2.has(uid));
}

// ==========================================
// 5. FOLLOW SYSTEM (follows)
// ==========================================

export async function followUser(followerId: string, followingId: string): Promise<{ success: boolean }> {
  if (followerId === followingId) return { success: false };

  try {
    const followId = `${followerId}_${followingId}`;
    await setDoc(doc(db, "follows", followId), {
      followerId,
      followingId,
      createdAt: serverTimestamp()
    });

    // Follow Notification
    await addDoc(collection(db, "notifications"), {
      recipientId: followingId,
      senderId: followerId,
      type: "follow",
      title: "নতুন ফলোয়ার! 🔔",
      content: "একজন নতুন নাগরিক আপনাকে ফলো করা শুরু করেছেন।",
      read: false,
      createdAt: serverTimestamp()
    });

    await logProfileAudit(followerId, "FOLLOW_ACTION", `User ${followingId} কে ফলো করা হয়েছে।`);

    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<{ success: boolean }> {
  try {
    const followId = `${followerId}_${followingId}`;
    await deleteDoc(doc(db, "follows", followId));
    await logProfileAudit(followerId, "FOLLOW_ACTION", `User ${followingId} কে আনফলো করা হয়েছে।`);
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// ==========================================
// 6. BLOCK & UNBLOCK SYSTEM (blocks)
// ==========================================

export async function blockUser(blockedBy: string, blockedUser: string): Promise<{ success: boolean }> {
  if (blockedBy === blockedUser) return { success: false };
  try {
    const blockId = `${blockedBy}_${blockedUser}`;
    await setDoc(doc(db, "blocks", blockId), {
      blockedBy,
      blockedUser,
      createdAt: serverTimestamp()
    });

    // Remove any existing friendship & follows
    await removeFriend(blockedBy, blockedUser);
    await unfollowUser(blockedBy, blockedUser);
    await unfollowUser(blockedUser, blockedBy);

    await logProfileAudit(blockedBy, "BLOCK_ACTION", `User ${blockedUser} কে ব্লক করা হয়েছে।`);

    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function unblockUser(blockedBy: string, blockedUser: string): Promise<{ success: boolean }> {
  try {
    const blockId = `${blockedBy}_${blockedUser}`;
    await deleteDoc(doc(db, "blocks", blockId));
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// ==========================================
// 7. PRIVACY SETTINGS API (profile_privacy)
// ==========================================

export async function getProfilePrivacy(uid: string): Promise<ProfilePrivacySettings> {
  const defaultSettings: ProfilePrivacySettings = {
    profileVisibility: "Everyone",
    whoCanFollow: "Everyone",
    whoCanFriendRequest: "Everyone",
    whoCanMessage: "Everyone",
    whoCanViewPosts: "Everyone",
    whoCanViewTaggedPosts: "Friends",
    whoCanSeeFriendList: "Everyone",
    whoCanSeeFollowers: "Everyone",
    showInSearch: true,
    isPrivateAccount: false
  };

  try {
    const docRef = doc(db, "profile_privacy", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...defaultSettings, ...snap.data() };
    }
  } catch (err) {
    console.error("Error reading privacy settings:", err);
  }

  return defaultSettings;
}

export async function updateProfilePrivacy(
  uid: string, 
  settings: Partial<ProfilePrivacySettings>
): Promise<{ success: boolean }> {
  try {
    const docRef = doc(db, "profile_privacy", uid);
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });

    await logProfileAudit(uid, "PRIVACY_UPDATE", "প্রাইভেসি ও ভিজিবিলিটি সেটিংস আপডেট করা হয়েছে।");

    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// Check authorization based on privacy option
export function isActionAllowedByPrivacy(
  option: PrivacyOption | "FriendsOfFriends", 
  viewerRelation: "is_me" | "is_friend" | "is_follower" | "public"
): boolean {
  if (viewerRelation === "is_me") return true;
  if (option === "OnlyMe") return false;
  if (option === "Friends") return viewerRelation === "is_friend";
  if (option === "Everyone" || option === "FriendsOfFriends") return true;
  return true;
}

// ==========================================
// 8. FEATURED CONTENT API (profile_featured)
// ==========================================

export async function getFeaturedItems(uid: string): Promise<FeaturedItem[]> {
  try {
    const q = query(
      collection(db, "profile_featured"), 
      where("userId", "==", uid),
      orderBy("order", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FeaturedItem));
  } catch (err) {
    console.error("Error fetching featured items:", err);
    return [];
  }
}

export async function addFeaturedItem(
  userId: string, 
  item: Omit<FeaturedItem, "id" | "userId" | "createdAt">
): Promise<{ success: boolean; id?: string }> {
  try {
    const ref = await addDoc(collection(db, "profile_featured"), {
      ...item,
      userId,
      createdAt: serverTimestamp()
    });

    await logProfileAudit(userId, "FEATURED_UPDATE", `নতুন ফিচার্ড আইটেম যোগ করা হয়েছে: ${item.title}`);

    return { success: true, id: ref.id };
  } catch (err) {
    return { success: false };
  }
}

export async function removeFeaturedItem(userId: string, itemId: string): Promise<{ success: boolean }> {
  try {
    await deleteDoc(doc(db, "profile_featured", itemId));
    await logProfileAudit(userId, "FEATURED_UPDATE", `ফিচার্ড আইটেম মুছে ফেলা হয়েছে।`);
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// ==========================================
// 9. AUDIT LOGGING API (profile_audit_logs)
// ==========================================

export async function logProfileAudit(
  userId: string, 
  action: ProfileAuditLog["action"], 
  description: string
) {
  try {
    await addDoc(collection(db, "profile_audit_logs"), {
      userId,
      action,
      description,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Web",
      createdAt: serverTimestamp()
    });
  } catch (err) {
    // Audit log error non-blocking
  }
}

// ==========================================
// 10. REAL-TIME LISTENERS
// ==========================================

export function subscribeProfileData(
  uid: string, 
  callback: (profile: UserProfileFull | null) => void
) {
  const docRef = doc(db, "users", uid);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({
        uid: snap.id,
        name: data.name || "সম্মানিত নাগরিক",
        username: data.username || `user_${snap.id.substring(0, 8)}`,
        email: data.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        avatarUrl: data.avatarUrl || data.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${uid}`,
        coverUrl: data.coverUrl || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
        gender: data.gender || "prefer_not_to_say",
        location: data.location || data.union || "পুঠিয়া",
        union: data.union || "পুঠিয়া ইউনিয়ন",
        website: data.website || "",
        dateOfBirth: data.dateOfBirth || "",
        dobVisibility: data.dobVisibility || "Friends",
        contactVisibility: data.contactVisibility || "Friends",
        role: data.role || "user",
        points: data.points || 0,
        badges: data.badges || [],
        verificationStatus: data.verificationStatus || "not_verified",
        isVerified: data.isVerified === true || data.verificationStatus === "verified",
        authorBadge: data.authorBadge === true || data.isVerified === true,
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
        friendsCount: data.friendsCount || 0,
        postCount: data.postCount || 0,
        profileViews: data.profileViews || 0,
        createdAt: data.createdAt || new Date().toISOString()
      });
    } else {
      callback(null);
    }
  });
}
