// Auth Business Service (Profile Sync, Verification, Deactivation, Session)

import { db, auth } from '../../../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfileUpdateRequest, ServiceResult } from '../types';
import { ProfileValidator } from '../validators';
import { ProfilePolicy, UserContext } from '../policies';
import { CacheManager } from '../cacheManager';

export class AuthBusinessService {
  /**
   * Sync and fetch authenticated user profile with DB
   */
  static async syncUserProfile(firebaseUser: any): Promise<any> {
    if (!firebaseUser || !firebaseUser.uid) return null;

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data();
        CacheManager.set(`user_profile_${firebaseUser.uid}`, data, 300);
        return data;
      } else {
        // Create initial document
        const initialProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'নাগরিক',
          email: firebaseUser.email || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          photoURL: firebaseUser.photoURL || '',
          username: firebaseUser.email ? firebaseUser.email.split('@')[0] : `user_${firebaseUser.uid.slice(0, 6)}`,
          bio: '',
          role: 'citizen',
          isVerified: false,
          isBanned: false,
          isDeactivated: false,
          friendIds: [],
          blockedUserIds: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(userDocRef, initialProfile, { merge: true });
        CacheManager.set(`user_profile_${firebaseUser.uid}`, initialProfile, 300);
        return initialProfile;
      }
    } catch (err) {
      console.warn('User profile sync fallback:', err);
      return null;
    }
  }

  /**
   * Update Profile with Validation and Policy
   */
  static async updateProfile(
    req: UserProfileUpdateRequest,
    userContext: UserContext
  ): Promise<ServiceResult<void>> {
    const policy = ProfilePolicy.canEditProfile(userContext, req.userId);
    if (!policy.allowed) {
      return { success: false, error: policy.reason, errorCode: 'FORBIDDEN' };
    }

    const validation = ProfileValidator.validateUpdate(req);
    if (!validation.isValid) {
      return { success: false, error: 'প্রোফাইলের তথ্যে ভুল রয়েছে', validationErrors: validation.errors };
    }

    try {
      const userRef = doc(db, 'users', req.userId);
      const updateData: any = {
        name: req.name.trim(),
        updatedAt: serverTimestamp()
      };
      if (req.username) updateData.username = req.username.trim();
      if (req.bio !== undefined) updateData.bio = req.bio.trim();
      if (req.avatarUrl !== undefined) updateData.photoURL = req.avatarUrl;
      if (req.coverUrl !== undefined) updateData.coverURL = req.coverUrl;
      if (req.gender !== undefined) updateData.gender = req.gender;
      if (req.location !== undefined) updateData.location = req.location;
      if (req.website !== undefined) updateData.website = req.website;
      if (req.privacy !== undefined) updateData.privacy = req.privacy;

      await setDoc(userRef, updateData, { merge: true });

      // Invalidate cache
      CacheManager.invalidate(`user_profile_${req.userId}`);

      return { success: true, message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      return { success: false, error: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।' };
    }
  }
}
