export type PrivacyType = 'public' | 'friends' | 'only_me';

export interface PhotoTag {
  userId?: string;
  userName: string;
  x?: number; // % position
  y?: number; // % position
}

export interface Photo {
  id: string;
  title?: string;
  caption: string;
  category?: string;
  albumId?: string;
  location?: string;
  union?: string;
  photographer?: string;
  dateAdded: string; // uploadDate
  url: string; // Image File
  thumbnail?: string;
  tags?: string[];
  taggedPeople?: PhotoTag[];
  privacy?: PrivacyType;
  isFeatured?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  views: number;
  likes?: number;
  reactions?: Record<string, 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'>;
  shareCount?: number;
  createdBy?: string;
  createdByUid?: string;
  lastUpdated?: string;
  mapUrl?: string;
}

export interface Comment {
  id: string;
  userName: string;
  userAvatar?: string;
  text: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PhotoAlbum {
  id: string;
  title: string;
  description: string;
  category: string;
  union?: string;
  event?: string;
  year: string;
  coverImage: string;
  photos: Photo[];
  uploadDate: string;
  views: number;
  likes?: number;
  reactions?: Record<string, 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'>;
  privacy?: PrivacyType;
  tags?: string[];
  taggedPeople?: PhotoTag[];
  status: 'pending' | 'approved' | 'rejected';
  photographer?: string;
  createdByUid?: string;
  comments?: Comment[];
}
