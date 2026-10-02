/**
 * Puthia Digital Platform — Firebase Storage Integration Service
 * 
 * Provides robust media upload, compression, thumbnail generation, 
 * progress tracking, and retrieval for Profiles, Businesses, Posts, and Short Videos.
 */

import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll, 
  getMetadata,
  UploadTask,
  StorageReference
} from "firebase/storage";
import { storage } from "../firebase";

export type StorageCategory = 
  | 'profiles' 
  | 'covers' 
  | 'businesses' 
  | 'posts' 
  | 'reels' 
  | 'stories' 
  | 'chats' 
  | 'documents' 
  | 'general';

export interface StorageUploadOptions {
  category: StorageCategory;
  ownerId: string;
  subFolder?: string;
  customFileName?: string;
  metadata?: Record<string, string>;
  maxSizeMB?: number;
  allowedTypes?: string[];
  compressImageBeforeUpload?: boolean;
  maxImageDimension?: number;
  imageQuality?: number;
  onProgress?: (progressPercent: number, bytesTransferred: number, totalBytes: number) => void;
}

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
}

export interface StorageItem {
  name: string;
  fullPath: string;
  downloadUrl: string;
  sizeBytes?: number;
  contentType?: string;
  updatedAt?: string;
}

// Limits & Default Constraints
const DEFAULT_MAX_IMAGE_SIZE_MB = 10;
const DEFAULT_MAX_VIDEO_SIZE_MB = 50;
const MAX_SHORT_VIDEO_DURATION_SECONDS = 90; // 1.5 minutes for short video/reels

/**
 * Validate file against MIME types and size constraints
 */
export function validateMediaFile(
  file: File | Blob, 
  options?: { allowedTypes?: string[]; maxSizeMB?: number }
): { valid: boolean; error?: string } {
  const allowed = options?.allowedTypes || [
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'image/gif', 
    'image/svg+xml',
    'video/mp4', 
    'video/webm', 
    'video/quicktime'
  ];
  const maxSize = (options?.maxSizeMB || DEFAULT_MAX_IMAGE_SIZE_MB) * 1024 * 1024;

  if (file.type && !allowed.some(type => file.type.toLowerCase().startsWith(type.replace('*', '')))) {
    return {
      valid: false,
      error: `অনুপযুক্ত ফাইল টাইপ (${file.type})। অনুমোদিত ফরম্যাট: JPG, PNG, WEBP, GIF, MP4, WEBM`
    };
  }

  if (file.size > maxSize) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const limitMb = options?.maxSizeMB || DEFAULT_MAX_IMAGE_SIZE_MB;
    return {
      valid: false,
      error: `ফাইলটির সাইজ (${sizeInMb}MB) অনুমোদিত সীমা (${limitMb}MB) অতিক্রম করেছে।`
    };
  }

  return { valid: true };
}

/**
 * Extract video duration, width and height from File
 */
export function getVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          duration: Math.round(video.duration) || 0,
          width: video.videoWidth || 0,
          height: video.videoHeight || 0
        });
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ duration: 0, width: 0, height: 0 });
      };
      
      video.src = url;
    } catch {
      resolve({ duration: 0, width: 0, height: 0 });
    }
  });
}

/**
 * Generate a thumbnail image Blob from a video file
 */
export function generateVideoThumbnail(file: File, seekTimeSeconds = 1): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'auto';
      const url = URL.createObjectURL(file);
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = Math.min(seekTimeSeconds, video.duration > 0 ? video.duration / 2 : 1);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(url);
              resolve(blob);
            }, 'image/jpeg', 0.8);
          } else {
            URL.revokeObjectURL(url);
            resolve(null);
          }
        } catch {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Compress and optimize image on client-side before uploading
 */
export function compressImage(
  file: File, 
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
): Promise<Blob> {
  return new Promise((resolve) => {
    const maxWidth = options?.maxWidth || 1920;
    const maxHeight = options?.maxHeight || 1080;
    const quality = options?.quality || 0.85;

    // If SVG or GIF, don't compress via canvas to preserve animation/vectors
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Core Firebase Storage Upload Function
 */
export async function uploadMediaFile(
  file: File, 
  options: StorageUploadOptions
): Promise<UploadResult> {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  // 1. Validation
  const maxLimitMB = options.maxSizeMB || (isVideo ? DEFAULT_MAX_VIDEO_SIZE_MB : DEFAULT_MAX_IMAGE_SIZE_MB);
  const validation = validateMediaFile(file, {
    allowedTypes: options.allowedTypes,
    maxSizeMB: maxLimitMB
  });

  if (!validation.valid) {
    throw new Error(validation.error || 'ফাইল ভ্যালিডেশন ব্যর্থ হয়েছে');
  }

  // 2. Extract Video duration if video
  let durationSeconds: number | undefined;
  let videoWidth: number | undefined;
  let videoHeight: number | undefined;
  let thumbnailBlob: Blob | null = null;

  if (isVideo) {
    const meta = await getVideoMetadata(file);
    durationSeconds = meta.duration;
    videoWidth = meta.width;
    videoHeight = meta.height;

    // Check short video limit if category is reels or stories
    if (options.category === 'reels' && durationSeconds > MAX_SHORT_VIDEO_DURATION_SECONDS) {
      throw new Error(`শর্ট ভিডিও/রিল সর্বোচ্চ ${MAX_SHORT_VIDEO_DURATION_SECONDS} সেকেন্ডের হতে পারবে (আপনার ভিডিও: ${durationSeconds} সে.)`);
    }

    thumbnailBlob = await generateVideoThumbnail(file);
  }

  // 3. Compress image if requested and is image
  let uploadBlob: Blob = file;
  if (isImage && options.compressImageBeforeUpload !== false) {
    uploadBlob = await compressImage(file, {
      maxWidth: options.maxImageDimension || 1920,
      maxHeight: options.maxImageDimension || 1080,
      quality: options.imageQuality || 0.85
    });
  }

  // 4. Construct File Path
  const timestamp = Date.now();
  const safeOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileExt = file.name.split('.').pop() || (isImage ? 'webp' : 'mp4');
  const finalFileName = options.customFileName 
    ? `${options.customFileName}_${timestamp}.${fileExt}`
    : `${timestamp}_${safeOriginalName}`;

  const sub = options.subFolder ? `/${options.subFolder}` : '';
  const storagePath = `${options.category}/${options.ownerId}${sub}/${finalFileName}`;
  const storageRef = ref(storage, storagePath);

  // 5. Upload with Resumable Task and Progress
  const customMetadata = {
    ownerId: options.ownerId,
    category: options.category,
    originalName: file.name,
    uploadedAt: new Date().toISOString(),
    ...(durationSeconds ? { durationSeconds: String(durationSeconds) } : {}),
    ...(options.metadata || {})
  };

  const uploadTask: UploadTask = uploadBytesResumable(storageRef, uploadBlob, {
    contentType: uploadBlob.type || file.type,
    customMetadata
  });

  return new Promise<UploadResult>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.totalBytes > 0 
          ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
          : 0;
        if (options.onProgress) {
          options.onProgress(Math.round(progress), snapshot.bytesTransferred, snapshot.totalBytes);
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(new Error(`আপলোড ব্যর্থ হয়েছে: ${error.message}`));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          let thumbnailUrl: string | undefined;

          // If we have a video thumbnail blob, upload it as well
          if (thumbnailBlob) {
            try {
              const thumbPath = `${options.category}/${options.ownerId}${sub}/thumbs/${timestamp}_thumb.jpg`;
              const thumbRef = ref(storage, thumbPath);
              await uploadBytesResumable(thumbRef, thumbnailBlob, { contentType: 'image/jpeg' });
              thumbnailUrl = await getDownloadURL(thumbRef);
            } catch (thumbErr) {
              console.warn('Video thumbnail upload skipped:', thumbErr);
            }
          }

          resolve({
            downloadUrl,
            storagePath,
            fileName: finalFileName,
            contentType: file.type,
            fileSizeBytes: uploadBlob.size,
            uploadedAt: new Date().toISOString(),
            thumbnailUrl,
            durationSeconds,
            width: videoWidth,
            height: videoHeight
          });
        } catch (err: any) {
          reject(new Error(`ডাউনলোড লিংক তৈরি ব্যর্থ: ${err?.message || err}`));
        }
      }
    );
  });
}

// -------------------------------------------------------------
// Specialized Convenience Methods for Profiles, Business & Posts
// -------------------------------------------------------------

/**
 * Upload User Profile Avatar
 */
export async function uploadUserProfilePhoto(
  userId: string, 
  file: File, 
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  return uploadMediaFile(file, {
    category: 'profiles',
    ownerId: userId,
    customFileName: 'avatar',
    maxSizeMB: 5,
    maxImageDimension: 600,
    imageQuality: 0.9,
    compressImageBeforeUpload: true,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    onProgress: (percent) => onProgress && onProgress(percent)
  });
}

/**
 * Upload User Profile Cover Banner
 */
export async function uploadUserCoverPhoto(
  userId: string, 
  file: File, 
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  return uploadMediaFile(file, {
    category: 'covers',
    ownerId: userId,
    customFileName: 'cover',
    maxSizeMB: 8,
    maxImageDimension: 1600,
    imageQuality: 0.85,
    compressImageBeforeUpload: true,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    onProgress: (percent) => onProgress && onProgress(percent)
  });
}

/**
 * Upload Business Media (Logo, Product Showcase, Promo Clip)
 */
export async function uploadBusinessMedia(
  businessId: string, 
  file: File, 
  mediaType: 'logo' | 'banner' | 'product' | 'promo_video',
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const isVideo = file.type.startsWith('video/');
  return uploadMediaFile(file, {
    category: 'businesses',
    ownerId: businessId,
    subFolder: mediaType,
    maxSizeMB: isVideo ? 40 : 10,
    compressImageBeforeUpload: !isVideo,
    onProgress: (percent) => onProgress && onProgress(percent)
  });
}

/**
 * Upload Post Media (Feed Image, Album Photo, Post Video)
 */
export async function uploadPostMedia(
  userId: string, 
  file: File, 
  postId?: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const isVideo = file.type.startsWith('video/');
  return uploadMediaFile(file, {
    category: 'posts',
    ownerId: userId,
    subFolder: postId || 'feed',
    maxSizeMB: isVideo ? 50 : 15,
    compressImageBeforeUpload: !isVideo,
    onProgress: (percent) => onProgress && onProgress(percent)
  });
}

/**
 * Upload Short Video / Reel (Up to 90 seconds)
 */
export async function uploadShortVideoReel(
  userId: string, 
  file: File, 
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  if (!file.type.startsWith('video/')) {
    throw new Error('শুধুমাত্র ভিডিও ফাইল আপলোড করা যাবে।');
  }

  return uploadMediaFile(file, {
    category: 'reels',
    ownerId: userId,
    subFolder: 'clips',
    maxSizeMB: 50,
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    onProgress: (percent) => onProgress && onProgress(percent)
  });
}

/**
 * Delete a media file from Storage using either storagePath or downloadUrl
 */
export async function deleteStorageFile(target: string): Promise<boolean> {
  try {
    let fileRef: StorageReference;
    if (target.startsWith('http')) {
      // Decode Firebase download URL to ref
      fileRef = ref(storage, target);
    } else {
      fileRef = ref(storage, target);
    }
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.warn('Failed to delete storage file (may already be deleted):', error);
    return false;
  }
}

/**
 * List files in a given Storage folder
 */
export async function listFolderFiles(folderPath: string): Promise<StorageItem[]> {
  try {
    const listRef = ref(storage, folderPath);
    const res = await listAll(listRef);

    const items: StorageItem[] = [];
    for (const itemRef of res.items) {
      try {
        const downloadUrl = await getDownloadURL(itemRef);
        const meta = await getMetadata(itemRef);
        items.push({
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          downloadUrl,
          sizeBytes: meta.size,
          contentType: meta.contentType,
          updatedAt: meta.updated
        });
      } catch {
        // continue if metadata fetch fails for a single file
      }
    }

    return items;
  } catch (error) {
    console.warn(`Failed to list files in ${folderPath}:`, error);
    return [];
  }
}

export const firebaseStorageService = {
  validateMediaFile,
  getVideoMetadata,
  generateVideoThumbnail,
  compressImage,
  uploadMediaFile,
  uploadUserProfilePhoto,
  uploadUserCoverPhoto,
  uploadBusinessMedia,
  uploadPostMedia,
  uploadShortVideoReel,
  deleteStorageFile,
  listFolderFiles
};

export default firebaseStorageService;
