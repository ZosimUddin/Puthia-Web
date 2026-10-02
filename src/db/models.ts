import { UserProfile } from '../contexts/AuthContext';
import { AdminRole } from '../types/admin';

/**
 * 🛠️ Master Models Layer Mapping Definition
 * Map relational Eloquent / Firestore entities into strongly typed Domain Model classes.
 */

export class UserModel {
  public uid: string;
  public name: string;
  public email?: string;
  public phone: string;
  public role: AdminRole;
  public isBlocked: boolean;
  public stars: number;
  public points: number;
  public profile: UserProfile;

  constructor(profile: UserProfile) {
    this.uid = profile.uid;
    this.name = profile.name;
    this.email = profile.email;
    this.phone = profile.phone;
    this.role = profile.role || 'user';
    this.isBlocked = profile.isBlocked || false;
    this.stars = profile.stars ?? profile.points ?? 0;
    this.points = profile.points ?? profile.stars ?? 0;
    this.profile = profile;
  }

  // Model Helper Methods
  public isAdmin(): boolean {
    return this.role === 'admin' || this.role === 'super_admin';
  }

  public isModerator(): boolean {
    return this.isAdmin() || this.role === 'moderator' || this.role === 'editor';
  }

  public canEdit(targetOwnerUid: string): boolean {
    return this.isAdmin() || this.uid === targetOwnerUid;
  }
}

export interface BusinessModel {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  ownerName: string;
  phone: string;
  address: string;
  union: string;
  village: string;
  tradeLicenseNo?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  status: 'active' | 'pending' | 'rejected';
  createdAt: string;
}

export interface ServiceApplicationModel {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  serviceId: string;
  serviceTitle: string;
  status: 'submitted' | 'processing' | 'approved' | 'rejected';
  submittedDocuments?: Record<string, string>;
  adminNotes?: string;
  createdAt: string;
}

export interface DoctorProfileModel {
  id: string;
  userId?: string;
  hospitalId?: string;
  name: string;
  specialty: string;
  qualification: string;
  bmdcRegNo?: string;
  chamberAddress: string;
  visitingHours: string;
  phone: string;
  rating: number;
  isVerified: boolean;
}

export interface BloodDonorModel {
  id: string;
  userId: string;
  name: string;
  bloodGroup: string;
  phone: string;
  union: string;
  village: string;
  lastDonatedAt?: string;
  isAvailable: boolean;
  donationCount: number;
}

export interface ReviewModel {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetId: string;
  targetType: 'business' | 'hospital' | 'doctor' | 'service';
  rating: number;
  comment: string;
  createdAt: string;
}
