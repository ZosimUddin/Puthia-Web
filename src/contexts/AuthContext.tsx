import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, requestNotificationPermission } from "../firebase";
import { requestAndSaveFcmToken, removeFcmToken } from "../services/fcmTokenService";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { logAuditEvent } from "../utils/audit";
import { AdminRole } from "../types/admin";
import { cleanWardFromText } from "../utils/cleanWard";
import { toast } from "sonner";

export interface UserProfile {
  uid: string;
  name: string;
  nickname?: string;
  email?: string;
  phone: string;
  division?: string;
  district?: string;
  upazila?: string;
  village: string;
  union: string;
  gender: string;
  bloodGroup: string;
  isBloodDonor: boolean;
  education?: string;
  bio?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  stars: number;
  points?: number;
  badges: string[];
  followersCount?: number;
  followingCount?: number;
  followers?: string[]; // Array of UIDs
  following?: string[]; // Array of UIDs
  friendsCount?: number;
  friends?: string[]; // Array of friend UIDs
  friendRequestsReceived?: string[]; // Array of received friend request UIDs
  friendRequestsSent?: string[]; // Array of sent friend request UIDs
  createdAt: string;
  photoURL?: string;
  coverURL?: string;
  profileCompleteAwarded?: boolean;
  accountVerifiedAwarded?: boolean;
  role?: AdminRole;
  isBlocked?: boolean;
  permissions?: string[]; 
  // Legacy/Additional fields for linting and older views
  memberSince?: string;
  dob?: string;
  address?: string;
  occupation?: string;
  mobileVerifyStatus?: 'unverified' | 'pending' | 'verified';
  emailVerifyStatus?: 'unverified' | 'pending' | 'verified';
  nidStatus?: 'unverified' | 'pending' | 'verified';
  nidNumber?: string;
  privacySettings?: {
    privacyPublic?: boolean;
    privacyHidePhone?: boolean;
    privacyShareLocation?: boolean;
    phone?: 'public' | 'only_me';
    address?: 'public' | 'only_me';
    dob?: 'public' | 'only_me';
    email?: 'public' | 'only_me';
    profileVisibility?: 'public' | 'private';
  };
  notificationSettings?: {
    notifPush?: boolean;
    notifEmail?: boolean;
    notifSms?: boolean;
    notifNewsEmergency?: boolean;
  };
  securitySettings?: {
    isPinSet?: boolean;
    pinCode?: string;
    is2FaEnabled?: boolean;
  };
  rank?: number | string;
  bloodDonationCount?: number;
  complaintsCount?: number;
  businessesCount?: number;
  marketplaceSubscription?: 'free' | 'premium' | 'featured';
  hometown?: string;
  relationshipStatus?: string;
  highSchool?: string;
  collegeUniversity?: string;
  workExperience?: string;
  workCompany?: string;
  workPosition?: string;
  instagramUsername?: string;
  highlights?: { id: string; title: string; imageUrl: string; }[];
  links?: { id: string; url: string; label: string; }[];
}

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  registerWithEmail: (email: string | undefined, password: string, name: string, phone: string, village: string, union: string, gender: string, bloodGroup: string, isBloodDonor: boolean, upazila?: string) => Promise<void>;
  loginWithEmail: (emailOrPhone: string, password: string, rememberMe?: boolean) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addStars: (amount: number, reason?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Clean any legacy demo keys from local storage
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem("demo_mode_active");
      localStorage.removeItem("demo_mode_role");
    }
  }, []);

  // Sync user profile from Firestore with real-time listener
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, async (userSnap) => {
      if (userSnap.exists()) {
        const rawData = userSnap.data() || {};
        const resolvedPhoto = rawData.photoURL || rawData.photoUrl || rawData.avatarUrl || rawData.photo || rawData.avatar || user.photoURL || '';
        const data = { ...rawData, photoURL: resolvedPhoto } as UserProfile;
        
        // Auto-recover phone number if missing in profile document
        if (!data.phone) {
          const derivedPhone = user.phoneNumber || 
            (user.email && /^01\d{9}@puthiadiary\.com$/.test(user.email) ? user.email.split('@')[0] : '') ||
            (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_registered_phone') || '' : '');
          if (derivedPhone) {
            data.phone = derivedPhone;
            try { updateDoc(userRef, { phone: derivedPhone }); } catch {}
          }
        }
        
        // Respect the role stored in Firestore. Default to 'user' if not set.
        if (!data.role) {
          const isMasterAdminEmail = user.email === 'mdzosimuddin31@gmail.com';
          data.role = isMasterAdminEmail ? 'super_admin' : 'user';
          try { updateDoc(userRef, { role: data.role }); } catch {}
        }
        
        // Auto-sanitize legacy ward numbers from stored village and address
        let needsDbClean = false;
        const updatesToPersist: Partial<UserProfile> = {};

        if (data.village) {
          const cleanedVillage = cleanWardFromText(data.village);
          if (cleanedVillage !== data.village) {
            data.village = cleanedVillage;
            updatesToPersist.village = cleanedVillage;
            needsDbClean = true;
          }
        }

        if (data.address) {
          const cleanedAddress = cleanWardFromText(data.address);
          if (cleanedAddress !== data.address) {
            data.address = cleanedAddress;
            updatesToPersist.address = cleanedAddress;
            needsDbClean = true;
          }
        }

        if (needsDbClean) {
          try { updateDoc(userRef, updatesToPersist); } catch {}
          if (typeof localStorage !== 'undefined') {
            if (data.village) localStorage.setItem('auth_registered_village', data.village);
            if (data.address) localStorage.setItem('auth_registered_location', data.address);
          }
        }

        setUserProfile(data);
        try { localStorage.setItem(`cached_user_profile_${user.uid}`, JSON.stringify(data)); } catch {}
      } else {
        const derivedPhone = user.phoneNumber || 
          (user.email && /^01\d{9}@puthiadiary\.com$/.test(user.email) ? user.email.split('@')[0] : '') ||
          (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_registered_phone') || '' : '');

        const isMasterAdminEmail = user.email === 'mdzosimuddin31@gmail.com';

        // Create initial profile if it doesn't exist
        const initialProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split("@")[0] || "সম্মানিত নাগরিক",
          phone: derivedPhone || "",
          village: "",
          union: "বানেশ্বর",
          upazila: "পুঠিয়া",
          district: "রাজশাহী",
          division: "রাজশাহী",
          address: "বানেশ্বর, পুঠিয়া, রাজশাহী",
          gender: "পুরুষ",
          bloodGroup: "O+",
          isBloodDonor: false,
          stars: 20, // 20 starter stars for joining!
          role: isMasterAdminEmail ? 'super_admin' : 'user',
          badges: ["সচেতন নাগরিক"], // Starter badge
          createdAt: new Date().toISOString(),
          accountVerifiedAwarded: true
        };
        try { 
          await setDoc(userRef, initialProfile); 
        } catch (profileError: any) {
          console.error("Profile creation failed:", profileError);
          if (profileError?.code === "resource-exhausted" || profileError?.message?.includes("quota")) {
            toast.error("ডাটাবেজ লিমিট শেষ হওয়ার কারণে প্রোফাইল সেভ করা যায়নি।");
          }
        }
        setUserProfile(initialProfile);
      }
    }, (error) => {
      if (error?.message?.includes("Quota") || error?.code === "resource-exhausted") {
        console.warn("Firestore quota limit reached for user profile sync. Using cached/fallback profile.");
      } else {
        console.warn("Error syncing user profile:", error?.message || error);
      }

      if (user) {
        let fallbackProfile: UserProfile | null = null;
        try {
          const cached = localStorage.getItem(`cached_user_profile_${user.uid}`);
          if (cached) fallbackProfile = JSON.parse(cached);
        } catch {}

        if (!fallbackProfile) {
          const derivedPhone = user.phoneNumber || 
            (user.email && /^01\d{9}@puthiadiary\.com$/.test(user.email) ? user.email.split('@')[0] : '') ||
            (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_registered_phone') || '' : '');

          fallbackProfile = {
            uid: user.uid,
            name: user.displayName || user.email?.split("@")[0] || "সম্মানিত নাগরিক",
            phone: derivedPhone || "",
            village: "",
            union: "বানেশ্বর",
            upazila: "পুঠিয়া",
            district: "রাজশাহী",
            division: "রাজশাহী",
            address: "বানেশ্বর, পুঠিয়া, রাজশাহী",
            gender: "পুরুষ",
            bloodGroup: "O+",
            isBloodDonor: false,
            stars: 20,
            role: user.email === 'mdzosimuddin47@gmail.com' ? 'super_admin' : 'user',
            badges: ["সচেতন নাগরিক"],
            createdAt: new Date().toISOString(),
            accountVerifiedAwarded: true
          };
        }
        setUserProfile(fallbackProfile);
      }
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await requestAndSaveFcmToken(currentUser.uid);
        } catch (err) {
          console.warn("Could not get or save FCM token:", err);
        }
      }
      setLoading(false);
    });

    return unsubscribeAuth;
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await logAuditEvent("login", "users", result.user.uid, { method: "google" });
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("User closed the popup.");
      } else {
        console.error("Google login error:", error);
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string | undefined, 
    password: string, 
    name: string, 
    phone: string, 
    village: string, 
    union: string,
    gender: string,
    bloodGroup: string,
    isBloodDonor: boolean,
    upazila: string = "পুঠিয়া উপজেলা"
  ) => {
    setLoading(true);
    try {
      // If no email is provided, generate a dummy one based on phone number
      const registrationEmail = email || `${phone}@puthiadiary.com`;
      const result = await createUserWithEmailAndPassword(auth, registrationEmail, password);
      
      const locVillage = village ? cleanWardFromText(village) : "";
      const locUnion = union ? union.trim() : "বানেশ্বর";
      const locUpazila = upazila ? upazila.trim() : "পুঠিয়া";
      const locAddress = cleanWardFromText(`${locVillage ? locVillage + ', ' : ''}${locUnion ? locUnion + ', ' : ''}${locUpazila}, রাজশাহী`);

      // Save custom profile directly
      const initialProfile: UserProfile = {
        uid: result.user.uid,
        name: name.trim(),
        phone: phone.trim(),
        village: locVillage,
        union: locUnion,
        upazila: locUpazila,
        division: "রাজশাহী",
        district: "রাজশাহী",
        address: locAddress,
        gender,
        bloodGroup,
        isBloodDonor,
        stars: 20, // 20 welcome stars!
        badges: isBloodDonor ? ["সচেতন নাগরিক", "রক্তবীর"] : ["সচেতন নাগরিক"],
        createdAt: new Date().toISOString(),
        accountVerifiedAwarded: true
      };

      await setDoc(doc(db, "users", result.user.uid), initialProfile);
      try { localStorage.setItem('auth_registered_phone', phone.trim()); } catch {}
      try { localStorage.setItem('auth_registered_location', locAddress); } catch {}
      try { localStorage.setItem('auth_registered_village', locVillage); } catch {}
      try { localStorage.setItem('auth_registered_union', locUnion); } catch {}
      setUserProfile(initialProfile);
    } catch (error) {
      console.error("Email registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (emailOrPhone: string, password: string, rememberMe: boolean = true) => {
    setLoading(true);
    try {
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      } catch (pErr) {
        console.warn("Could not set persistence:", pErr);
      }
      
      let loginEmail = emailOrPhone.trim();
      // If the user entered a phone number (e.g., exactly 11 digits starting with 01), format it
      if (/^01\d{9}$/.test(loginEmail)) {
        try { localStorage.setItem('auth_registered_phone', loginEmail); } catch {}
        loginEmail = `${loginEmail}@puthiadiary.com`;
      }

      const result = await signInWithEmailAndPassword(auth, loginEmail, password);
      await logAuditEvent("login", "users", result.user.uid, { method: "email" });
    } catch (error) {
      console.error("Email login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (user?.uid) {
        await removeFcmToken(user.uid);
      }
      localStorage.removeItem("demo_mode_active");
      localStorage.removeItem("demo_mode_role");
      sessionStorage.removeItem("super_admin_session_active");
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const sanitized = { ...updates };
      if (sanitized.village) {
        sanitized.village = cleanWardFromText(sanitized.village);
      }
      if (sanitized.address) {
        sanitized.address = cleanWardFromText(sanitized.address);
      }
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, sanitized, { merge: true });
      setUserProfile(prev => prev ? { ...prev, ...sanitized } : null);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  const addStars = async (amount: number, reason?: string) => {
    if (!user || !userProfile) return;
    const newStars = (userProfile.stars || 0) + amount;
    const updatedBadges = [...(userProfile.badges || [])];
    if (newStars >= 50 && !updatedBadges.includes("পুঠিয়া চ্যাম্পিয়ন")) {
      updatedBadges.push("পুঠিয়া চ্যাম্পিয়ন");
    }
    if (newStars >= 100 && !updatedBadges.includes("নগর রত্ন")) {
      updatedBadges.push("নগর রত্ন");
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { 
        stars: newStars,
        badges: updatedBadges
      }, { merge: true });

      setUserProfile(prev => prev ? { ...prev, stars: newStars, badges: updatedBadges } : null);
    } catch (error) {
      console.error("Error adding stars:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      loginWithGoogle, 
      registerWithEmail, 
      loginWithEmail, 
      resetPassword,
      logout,
      updateUserProfile,
      addStars
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
