// Form Request Validators for Business Logic Layer

import { 
  CreatePostRequest, 
  UpdatePostRequest, 
  CreateCommentRequest, 
  UserProfileUpdateRequest, 
  SubmitReportRequest,
  ToggleReactionRequest 
} from './types';

export interface ValidationOutput {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export class PostValidator {
  static validateCreate(req: CreatePostRequest): ValidationOutput {
    const errors: Record<string, string[]> = {};

    if (!req.authorId || req.authorId.trim() === '') {
      errors.authorId = ['ব্যবহারকারী আইডি অবশ্যই থাকতে হবে'];
    }

    if (!req.content || req.content.trim().length === 0) {
      if (!req.imageUrl && !req.videoUrl && (!req.gallery || req.gallery.length === 0) && !req.poll) {
        errors.content = ['পোস্টে কিছু লেখা, ছবি, ভিডিও বা পোল যুক্ত করুন'];
      }
    } else if (req.content.length > 5000) {
      errors.content = ['পোস্টের দৈর্ঘ্য সর্বোচ্চ ৫০০০ অক্ষরের মধ্যে হতে হবে'];
    }

    if (req.visibility && !['public', 'friends', 'only_me', 'custom', 'group', 'page'].includes(req.visibility)) {
      errors.visibility = ['অবৈধ পোস্ট ভিজিবিলিটি অপশন'];
    }

    // Basic Anti-Spam link flood detection
    if (req.content) {
      const urlMatches = req.content.match(/https?:\/\/[^\s]+/g);
      if (urlMatches && urlMatches.length > 5) {
        errors.content = ['অতিরিক্ত লিংক স্প্যাম হিসেবে চিহ্নিত হতে পারে (সর্বোচ্চ ৫টি লিংক অনুমোদিত)'];
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateUpdate(req: UpdatePostRequest): ValidationOutput {
    const errors: Record<string, string[]> = {};

    if (!req.postId) {
      errors.postId = ['পোস্ট আইডি প্রয়োজন'];
    }
    if (!req.authorId) {
      errors.authorId = ['অনুমোদিত ইউজার আইডি প্রয়োজন'];
    }
    if (req.content && req.content.length > 5000) {
      errors.content = ['পোস্টের দৈর্ঘ্য সর্বোচ্চ ৫০০০ অক্ষরের মধ্যে হতে হবে'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export class CommentValidator {
  static validateCreate(req: CreateCommentRequest): ValidationOutput {
    const errors: Record<string, string[]> = {};

    if (!req.postId) {
      errors.postId = ['পোস্ট আইডি অনুপস্থিত'];
    }
    if (!req.authorId) {
      errors.authorId = ['ব্যবহারকারী আইডি প্রয়োজন'];
    }
    if (!req.content || req.content.trim().length === 0) {
      if (!req.imageUrl) {
        errors.content = ['কমেন্টে কোনো টেক্সট বা ছবি যুক্ত করুন'];
      }
    } else if (req.content.length > 2000) {
      errors.content = ['মন্তব্যের দৈর্ঘ্য সর্বোচ্চ ২০০০ অক্ষরের মধ্যে হতে হবে'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export class ReactionValidator {
  static validate(req: ToggleReactionRequest): ValidationOutput {
    const errors: Record<string, string[]> = {};
    const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

    if (!req.postId) {
      errors.postId = ['পোস্ট আইডি অনুপস্থিত'];
    }
    if (!req.userId) {
      errors.userId = ['ব্যবহারকারী লগইন থাকা আবশ্যক'];
    }
    if (!validReactions.includes(req.reactionType)) {
      errors.reactionType = ['অবৈধ রিঅ্যাকশন টাইপ'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export class ProfileValidator {
  static validateUpdate(req: UserProfileUpdateRequest): ValidationOutput {
    const errors: Record<string, string[]> = {};

    if (!req.userId) {
      errors.userId = ['ব্যবহারকারী আইডি প্রয়োজন'];
    }
    if (!req.name || req.name.trim().length < 2) {
      errors.name = ['নাম কমপক্ষে ২ অক্ষরের হতে হবে'];
    } else if (req.name.length > 70) {
      errors.name = ['নাম সর্বোচ্চ ৭০ অক্ষরের মধ্যে হতে হবে'];
    }

    if (req.username) {
      const cleanUsername = req.username.trim();
      if (cleanUsername.length < 3 || cleanUsername.length > 30) {
        errors.username = ['ইউজারনেম ৩ থেকে ৩০ অক্ষরের মধ্যে হতে হবে'];
      } else if (!/^[a-zA-Z0-9_\.\u0980-\u09FF]+$/.test(cleanUsername)) {
        errors.username = ['ইউজারনেমে শুধুমাত্র অক্ষর, সংখ্যা ও আন্ডারস্কোর ব্যবহার করা যাবে'];
      }
    }

    if (req.bio && req.bio.length > 500) {
      errors.bio = ['বায়ো সর্বোচ্চ ৫০০ অক্ষরের মধ্যে সীমাবদ্ধ রাখুন'];
    }

    if (req.website && req.website.trim().length > 0) {
      if (!req.website.startsWith('http://') && !req.website.startsWith('https://')) {
        errors.website = ['ওয়েবসাইট অ্যাড্রেস http:// বা https:// দিয়ে শুরু হতে হবে'];
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export class ReportValidator {
  static validate(req: SubmitReportRequest): ValidationOutput {
    const errors: Record<string, string[]> = {};

    if (!req.reporterId) {
      errors.reporterId = ['রিপোর্টার আইডি আবশ্যক'];
    }
    if (!req.targetId || !req.targetType) {
      errors.target = ['রিপোর্ট করার লক্ষ্যবস্তু নির্দিষ্ট করতে হবে'];
    }
    if (!req.reason) {
      errors.reason = ['রিপোর্টের কারণ নির্বাচন করুন'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
