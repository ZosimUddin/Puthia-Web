export interface UserInfo {
  uid: string;
  name: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: number;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  participantDetails: Record<string, UserInfo>;
  lastMessage?: string;
  lastMessageTime?: number;
  lastMessageSenderId?: string;
  unreadCount?: Record<string, number>;
  createdAt: number;
  updatedAt: number;
  
  // Group specific
  name?: string;
  photoURL?: string;
  admins?: string[];
  description?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'file' | 'link' | 'system' | 'location';
  mediaUrl?: string;
  mediaType?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  
  status: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
  deliveredTo?: string[];
  seenBy?: string[];
  
  timestamp: number;
  isEdited?: boolean;
  isDeleted?: boolean;
  
  reactions?: Record<string, string>;
  replyToId?: string;
  forwardedFrom?: string;
}
