import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  writeBatch
} from 'firebase/firestore';
import { Conversation, ChatMessage, UserInfo } from '../types';

export interface ExtendedChatMessage extends ChatMessage {
  audioDuration?: number;
  location?: { lat: number; lng: number; address?: string };
  caption?: string;
  isEdited?: boolean;
  editedAt?: number;
  replyToMessage?: {
    id: string;
    senderName: string;
    text: string;
  };
}

/**
 * Recursively removes undefined fields from an object or array before persisting to Firestore.
 * Preserves Date, FieldValue instances, and primitives.
 */
export function cleanFirestoreData<T>(data: T): T {
  if (data === undefined) {
    return undefined as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data;
  }
  if (typeof (data as any).isEqual === 'function' || (data as any)._methodName) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !(value instanceof Date) &&
        typeof (value as any).isEqual !== 'function' &&
        !(value as any)._methodName
      ) {
        result[key] = cleanFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

export const INITIAL_DEMO_CONVERSATIONS: Conversation[] = [];
export const INITIAL_DEMO_MESSAGES: Record<string, ExtendedChatMessage[]> = {};

export const chatService = {
  subscribeToConversations: (userId: string, callback: (conversations: Conversation[]) => void) => {
    try {
      const currentUserId = userId || 'guest_user';
      // Query without composite index requirement so it never fails
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUserId)
      );

      return onSnapshot(q, (snapshot) => {
        const conversations: Conversation[] = [];
        snapshot.forEach((doc) => {
          conversations.push({ id: doc.id, ...doc.data() } as Conversation);
        });

        // Client-side sort by latest update or message time
        conversations.sort((a, b) => (b.updatedAt || b.lastMessageTime || 0) - (a.updatedAt || a.lastMessageTime || 0));

        callback(conversations);
      }, (error) => {
        console.warn("Firestore conversations subscription note:", error);
        callback([]);
      });
    } catch (error) {
      console.warn("Error setting up conversations listener:", error);
      callback([]);
      return () => {};
    }
  },

  subscribeToMessages: (conversationId: string, callback: (messages: ExtendedChatMessage[]) => void) => {
    if (!conversationId) {
      callback([]);
      return () => {};
    }

    try {
      const q = query(
        collection(db, `conversations/${conversationId}/messages`),
        orderBy('timestamp', 'asc')
      );

      const localKey = `adda_messages_${conversationId}`;

      const getMergedMessages = (firestoreMsgs: ExtendedChatMessage[]) => {
        try {
          const localList: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
          const localPending = localList.filter(m => m.status === 'sending' || m.status === 'failed');
          
          const firestoreIds = new Set(firestoreMsgs.map(m => m.id));
          const uniquePending = localPending.filter(m => !firestoreIds.has(m.id));

          const merged = [...firestoreMsgs, ...uniquePending];
          merged.sort((a, b) => a.timestamp - b.timestamp);
          return merged;
        } catch {
          return firestoreMsgs;
        }
      };

      const unsub = onSnapshot(q, (snapshot) => {
        const firestoreMsgs: ExtendedChatMessage[] = [];
        snapshot.forEach((doc) => {
          firestoreMsgs.push({ id: doc.id, ...doc.data() } as ExtendedChatMessage);
        });
        callback(getMergedMessages(firestoreMsgs));
      }, (error) => {
        console.warn("Messages snapshot note, falling back to local merge:", error);
        try {
          const localList: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
          callback(localList);
        } catch {
          callback([]);
        }
      });

      const handleLocalUpdate = () => {
        try {
          const localList: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
          callback(localList);
        } catch {}
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('adda_local_message_sent', handleLocalUpdate);
      }

      return () => {
        unsub();
        if (typeof window !== 'undefined') {
          window.removeEventListener('adda_local_message_sent', handleLocalUpdate);
        }
      };
    } catch (error) {
      console.warn("Error setting up messages listener:", error);
      callback([]);
      return () => {};
    }
  },

  startDirectConversation: async (currentUser: UserInfo, targetUser: UserInfo): Promise<string> => {
    const currentUserId = currentUser.uid || 'guest_user';
    let targetUserId = targetUser.uid;

    // Publish current user active profile to Firestore users collection
    try {
      if (currentUserId) {
        await setDoc(doc(db, 'users', currentUserId), cleanFirestoreData({
          uid: currentUserId,
          name: currentUser.name || '',
          displayName: currentUser.name || '',
          photoURL: currentUser.photoURL || '',
          isOnline: true,
          lastSeen: Date.now(),
          updatedAt: Date.now()
        }), { merge: true });
      }
    } catch {}

    // Smart resolution: if targetUser UID is a legacy/demo string, check if a real user exists in Firestore
    try {
      if (targetUserId.startsWith('u_') || targetUserId.startsWith('demo_')) {
        const usersRef = collection(db, 'users');
        const qUsers = query(usersRef, limit(100));
        const userSnaps = await getDocs(qUsers);
        userSnaps.forEach(uDoc => {
          const uData = uDoc.data();
          const uName = (uData.displayName || uData.name || '').trim().toLowerCase();
          const targetName = (targetUser.name || '').trim().toLowerCase();
          if (uDoc.id !== currentUserId) {
            if (uDoc.id === targetUserId || (targetName && uName === targetName)) {
              targetUserId = uDoc.id;
            }
          }
        });
      }
    } catch (e) {
      console.warn("Target user UID lookup note:", e);
    }

    const sortedIds = [currentUserId, targetUserId].sort();
    const deterministicConvId = `conv_${sortedIds[0]}_${sortedIds[1]}`;

    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUserId)
      );
      const snapshot = await getDocs(q);
      
      let existingConvId: string | null = null;
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.participants?.includes(targetUserId)) {
          existingConvId = docSnap.id;
        }
      });

      if (existingConvId) {
        await setDoc(doc(db, 'conversations', existingConvId), cleanFirestoreData({
          participants: [currentUserId, targetUserId],
          participantDetails: {
            [currentUserId]: currentUser,
            [targetUserId]: { ...targetUser, uid: targetUserId }
          },
          updatedAt: Date.now()
        }), { merge: true });
        return existingConvId;
      }

      // Check if they are friends
      let isFriend = false;
      try {
        const currentUserSnap = await getDoc(doc(db, 'users', currentUserId));
        if (currentUserSnap.exists()) {
          const uData = currentUserSnap.data();
          if (uData.friends?.includes(targetUserId)) {
            isFriend = true;
          }
        }
        if (!isFriend) {
          const targetUserSnap = await getDoc(doc(db, 'users', targetUserId));
          if (targetUserSnap.exists()) {
            const tData = targetUserSnap.data();
            if (tData.friends?.includes(currentUserId)) {
              isFriend = true;
            }
          }
        }
      } catch (e) {
        console.warn("Friend check in startDirectConversation error:", e);
      }

      const reqStatus = isFriend ? 'accepted' : 'pending';

      const convData: Conversation = {
        id: deterministicConvId,
        type: 'direct',
        participants: [currentUserId, targetUserId],
        participantDetails: {
          [currentUserId]: currentUser,
          [targetUserId]: { ...targetUser, uid: targetUserId }
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastMessage: 'আড্ডায় নতুন কথোপকথন শুরু হয়েছে।',
        lastMessageTime: Date.now(),
        unreadCount: {
          [currentUserId]: 0,
          [targetUserId]: 0
        },
        requestStatus: reqStatus,
        requestedBy: currentUserId
      };

      await setDoc(doc(db, 'conversations', deterministicConvId), cleanFirestoreData(convData), { merge: true });
      return deterministicConvId;
    } catch (error) {
      console.warn("Direct conversation creation falling back to client state:", error);
      const convData: Conversation = {
        id: deterministicConvId,
        type: 'direct',
        participants: [currentUserId, targetUserId],
        participantDetails: {
          [currentUserId]: currentUser,
          [targetUserId]: { ...targetUser, uid: targetUserId }
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastMessage: 'আড্ডায় নতুন কথোপকথন শুরু হয়েছে।',
        lastMessageTime: Date.now(),
        unreadCount: {
          [currentUserId]: 0,
          [targetUserId]: 0
        }
      };
      
      try {
        const existingList = JSON.parse(localStorage.getItem(`adda_conversations_${currentUserId}`) || '[]');
        localStorage.setItem(`adda_conversations_${currentUserId}`, JSON.stringify([convData, ...existingList]));
      } catch {}
      
      return deterministicConvId;
    }
  },

  createGroupConversation: async (
    currentUser: UserInfo,
    groupName: string,
    groupPhoto: string,
    description: string,
    selectedMembers: UserInfo[]
  ): Promise<string> => {
    const currentUserId = currentUser.uid || 'guest_user';
    const participants = [currentUserId, ...selectedMembers.map(m => m.uid)];
    const participantDetails: Record<string, UserInfo> = {
      [currentUserId]: currentUser
    };
    selectedMembers.forEach(m => {
      participantDetails[m.uid] = m;
    });

    const newGroupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const groupData: Conversation = {
      id: newGroupId,
      type: 'group',
      name: groupName,
      photoURL: groupPhoto || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=200',
      description: description || 'পুঠিয়া সামাজিক গ্রুপ',
      admins: [currentUserId],
      participants,
      participantDetails,
      lastMessage: `${currentUser.name} গ্রুপটি তৈরি করেছেন।`,
      lastMessageTime: Date.now(),
      lastMessageSenderId: currentUserId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      unreadCount: {}
    };

    try {
      await setDoc(doc(db, 'conversations', newGroupId), cleanFirestoreData(groupData), { merge: true });
    } catch (e) {
      console.warn("Creating group locally due to network/rules:", e);
    }

    try {
      const existingList = JSON.parse(localStorage.getItem(`adda_conversations_${currentUserId}`) || '[]');
      localStorage.setItem(`adda_conversations_${currentUserId}`, JSON.stringify([groupData, ...existingList]));
    } catch {}

    return newGroupId;
  },

  sendSystemMessage: async (conversationId: string, text: string) => {
    const msgId = `msg_sys_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const messageData: ExtendedChatMessage = {
      id: msgId,
      conversationId,
      senderId: 'system',
      text,
      type: 'system',
      status: 'sent',
      timestamp: Date.now()
    };

    // Save message locally
    try {
      const localKey = `adda_messages_${conversationId}`;
      const savedMessages: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
      savedMessages.push(messageData);
      localStorage.setItem(localKey, JSON.stringify(savedMessages));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adda_local_message_sent', { detail: { conversationId, message: messageData } }));
      }
    } catch {}

    try {
      const msgRef = doc(db, `conversations/${conversationId}/messages`, msgId);
      await setDoc(msgRef, cleanFirestoreData(messageData));

      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        lastMessage: text,
        lastMessageTime: Date.now(),
        lastMessageSenderId: 'system',
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn("Send system message error:", e);
    }
  },

  updateGroupConversation: async (
    conversationId: string,
    currentUser: UserInfo,
    groupName: string,
    groupPhoto: string,
    description: string
  ) => {
    const systemText = `${currentUser.name} গ্রুপের তথ্য পরিবর্তন করেছেন।`;
    
    // Firestore update
    try {
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        name: groupName,
        photoURL: groupPhoto || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=200',
        description: description,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn("Update group locally fallback:", e);
    }

    // Local Storage update fallback
    try {
      const currentUserId = currentUser.uid || 'guest_user';
      const localKey = `adda_conversations_${currentUserId}`;
      const existingList: Conversation[] = JSON.parse(localStorage.getItem(localKey) || '[]');
      const updated = existingList.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            name: groupName,
            photoURL: groupPhoto,
            description: description,
            updatedAt: Date.now()
          };
        }
        return c;
      });
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch {}

    await chatService.sendSystemMessage(conversationId, systemText);
  },

  addGroupMembers: async (
    conversationId: string,
    currentUser: UserInfo,
    newMembers: UserInfo[]
  ) => {
    const memberNames = newMembers.map(m => m.name).join(', ');
    const systemText = `${currentUser.name} যোগ করেছেন: ${memberNames}`;

    try {
      const convRef = doc(db, 'conversations', conversationId);
      const convSnap = await getDoc(convRef);
      if (convSnap.exists()) {
        const data = convSnap.data() as Conversation;
        const currentParticipants = data.participants || [];
        const currentDetails = data.participantDetails || {};

        const updatedParticipants = [...currentParticipants];
        const updatedDetails = { ...currentDetails };

        newMembers.forEach(m => {
          if (!updatedParticipants.includes(m.uid)) {
            updatedParticipants.push(m.uid);
          }
          updatedDetails[m.uid] = m;
        });

        await updateDoc(convRef, {
          participants: updatedParticipants,
          participantDetails: updatedDetails,
          updatedAt: Date.now()
        });
      }
    } catch (e) {
      console.warn("Add group members locally fallback:", e);
    }

    // Local Storage update fallback
    try {
      const currentUserId = currentUser.uid || 'guest_user';
      const localKey = `adda_conversations_${currentUserId}`;
      const existingList: Conversation[] = JSON.parse(localStorage.getItem(localKey) || '[]');
      const updated = existingList.map(c => {
        if (c.id === conversationId) {
          const currentParticipants = c.participants || [];
          const currentDetails = c.participantDetails || {};

          const updatedParticipants = [...currentParticipants];
          const updatedDetails = { ...currentDetails };

          newMembers.forEach(m => {
            if (!updatedParticipants.includes(m.uid)) {
              updatedParticipants.push(m.uid);
            }
            updatedDetails[m.uid] = m;
          });

          return {
            ...c,
            participants: updatedParticipants,
            participantDetails: updatedDetails,
            updatedAt: Date.now()
          };
        }
        return c;
      });
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch {}

    await chatService.sendSystemMessage(conversationId, systemText);
  },

  removeGroupMember: async (
    conversationId: string,
    currentUser: UserInfo,
    memberId: string,
    memberName: string
  ) => {
    const systemText = `${currentUser.name} গ্রুপ থেকে ${memberName}-কে সরিয়ে দিয়েছেন।`;

    try {
      const convRef = doc(db, 'conversations', conversationId);
      const convSnap = await getDoc(convRef);
      if (convSnap.exists()) {
        const data = convSnap.data() as Conversation;
        const currentParticipants = data.participants || [];
        const currentDetails = data.participantDetails || {};
        const currentAdmins = data.admins || [];

        const updatedParticipants = currentParticipants.filter(p => p !== memberId);
        const updatedDetails = { ...currentDetails };
        delete updatedDetails[memberId];
        const updatedAdmins = currentAdmins.filter(a => a !== memberId);

        await updateDoc(convRef, {
          participants: updatedParticipants,
          participantDetails: updatedDetails,
          admins: updatedAdmins,
          updatedAt: Date.now()
        });
      }
    } catch (e) {
      console.warn("Remove group member locally fallback:", e);
    }

    // Local Storage update fallback
    try {
      const currentUserId = currentUser.uid || 'guest_user';
      const localKey = `adda_conversations_${currentUserId}`;
      const existingList: Conversation[] = JSON.parse(localStorage.getItem(localKey) || '[]');
      const updated = existingList.map(c => {
        if (c.id === conversationId) {
          const currentParticipants = c.participants || [];
          const currentDetails = c.participantDetails || {};
          const currentAdmins = c.admins || [];

          const updatedParticipants = currentParticipants.filter(p => p !== memberId);
          const updatedDetails = { ...currentDetails };
          delete updatedDetails[memberId];
          const updatedAdmins = currentAdmins.filter(a => a !== memberId);

          return {
            ...c,
            participants: updatedParticipants,
            participantDetails: updatedDetails,
            admins: updatedAdmins,
            updatedAt: Date.now()
          };
        }
        return c;
      });
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch {}

    await chatService.sendSystemMessage(conversationId, systemText);
  },

  leaveGroup: async (
    conversationId: string,
    currentUser: UserInfo
  ) => {
    const systemText = `${currentUser.name} গ্রুপ ত্যাগ করেছেন।`;

    try {
      const convRef = doc(db, 'conversations', conversationId);
      const convSnap = await getDoc(convRef);
      if (convSnap.exists()) {
        const data = convSnap.data() as Conversation;
        const currentParticipants = data.participants || [];
        const currentDetails = data.participantDetails || {};
        const currentAdmins = data.admins || [];

        const updatedParticipants = currentParticipants.filter(p => p !== currentUser.uid);
        const updatedDetails = { ...currentDetails };
        delete updatedDetails[currentUser.uid];
        
        let updatedAdmins = currentAdmins.filter(a => a !== currentUser.uid);
        // If the leaving user was the only admin and there are participants left, make another user admin
        if (updatedAdmins.length === 0 && updatedParticipants.length > 0) {
          updatedAdmins = [updatedParticipants[0]];
        }

        await updateDoc(convRef, {
          participants: updatedParticipants,
          participantDetails: updatedDetails,
          admins: updatedAdmins,
          updatedAt: Date.now()
        });
      }
    } catch (e) {
      console.warn("Leave group locally fallback:", e);
    }

    // Local Storage update fallback
    try {
      const currentUserId = currentUser.uid || 'guest_user';
      const localKey = `adda_conversations_${currentUserId}`;
      const existingList: Conversation[] = JSON.parse(localStorage.getItem(localKey) || '[]');
      const updated = existingList.filter(c => c.id !== conversationId); // Remove from left user's local conversations
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch {}

    await chatService.sendSystemMessage(conversationId, systemText);
  },

  toggleGroupAdmin: async (
    conversationId: string,
    currentUser: UserInfo,
    memberId: string,
    memberName: string,
    isAdmin: boolean
  ) => {
    const systemText = `${currentUser.name} ${memberName}-কে ${isAdmin ? 'গ্রুপ এডমিন বানিয়েছেন' : 'এডমিন পদ থেকে সরিয়ে দিয়েছেন'}।`;

    try {
      const convRef = doc(db, 'conversations', conversationId);
      const convSnap = await getDoc(convRef);
      if (convSnap.exists()) {
        const data = convSnap.data() as Conversation;
        const currentAdmins = data.admins || [];
        let updatedAdmins = [...currentAdmins];

        if (isAdmin) {
          if (!updatedAdmins.includes(memberId)) {
            updatedAdmins.push(memberId);
          }
        } else {
          updatedAdmins = updatedAdmins.filter(a => a !== memberId);
        }

        await updateDoc(convRef, {
          admins: updatedAdmins,
          updatedAt: Date.now()
        });
      }
    } catch (e) {
      console.warn("Toggle admin locally fallback:", e);
    }

    // Local Storage update fallback
    try {
      const currentUserId = currentUser.uid || 'guest_user';
      const localKey = `adda_conversations_${currentUserId}`;
      const existingList: Conversation[] = JSON.parse(localStorage.getItem(localKey) || '[]');
      const updated = existingList.map(c => {
        if (c.id === conversationId) {
          const currentAdmins = c.admins || [];
          let updatedAdmins = [...currentAdmins];

          if (isAdmin) {
            if (!updatedAdmins.includes(memberId)) {
              updatedAdmins.push(memberId);
            }
          } else {
            updatedAdmins = updatedAdmins.filter(a => a !== memberId);
          }

          return {
            ...c,
            admins: updatedAdmins,
            updatedAt: Date.now()
          };
        }
        return c;
      });
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch {}

    await chatService.sendSystemMessage(conversationId, systemText);
  },

  /**
   * Check if user A blocked user B or vice-versa
   */
  isUserBlocked: async (userAId: string, userBId: string): Promise<{ isBlocked: boolean; blockedBy: 'self' | 'other' | 'none' }> => {
    if (!userAId || !userBId || userAId === userBId) {
      return { isBlocked: false, blockedBy: 'none' };
    }
    try {
      // Check block A -> B
      const blockSnap1 = await getDoc(doc(db, 'user_blocks', `${userAId}_${userBId}`));
      if (blockSnap1.exists()) return { isBlocked: true, blockedBy: 'self' };
      
      const legacySnap1 = await getDoc(doc(db, 'blocks', `${userAId}_${userBId}`));
      if (legacySnap1.exists()) return { isBlocked: true, blockedBy: 'self' };

      // Check block B -> A
      const blockSnap2 = await getDoc(doc(db, 'user_blocks', `${userBId}_${userAId}`));
      if (blockSnap2.exists()) return { isBlocked: true, blockedBy: 'other' };

      const legacySnap2 = await getDoc(doc(db, 'blocks', `${userBId}_${userAId}`));
      if (legacySnap2.exists()) return { isBlocked: true, blockedBy: 'other' };

      // Check user document blockedUserIds
      const userASnap = await getDoc(doc(db, 'users', userAId));
      if (userASnap.exists()) {
        const uData = userASnap.data();
        if (uData.blockedUserIds?.includes(userBId)) return { isBlocked: true, blockedBy: 'self' };
      }

      const userBSnap = await getDoc(doc(db, 'users', userBId));
      if (userBSnap.exists()) {
        const uData = userBSnap.data();
        if (uData.blockedUserIds?.includes(userAId)) return { isBlocked: true, blockedBy: 'other' };
      }
    } catch (e) {
      console.warn("Block check note:", e);
    }
    return { isBlocked: false, blockedBy: 'none' };
  },

  /**
   * Check permission based on privacy settings and blocking
   */
  canUserMessage: async (senderId: string, recipientId: string): Promise<{ allowed: boolean; reason?: string }> => {
    if (!senderId || !recipientId || senderId === recipientId) return { allowed: true };

    // 1. Check blocking
    const blockStatus = await chatService.isUserBlocked(senderId, recipientId);
    if (blockStatus.isBlocked) {
      if (blockStatus.blockedBy === 'self') {
        return { allowed: false, reason: 'আপনি এই ব্যবহারকারীকে ব্লক করেছেন। মেসেজ পাঠাতে আনব্লক করুন।' };
      } else {
        return { allowed: false, reason: 'এই ব্যবহারকারী মেসেজ পাওয়া বন্ধ রেখেছেন।' };
      }
    }

    // 2. Check recipient privacy setting
    try {
      const recipientSnap = await getDoc(doc(db, 'users', recipientId));
      if (recipientSnap.exists()) {
        const rData = recipientSnap.data();
        const msgSetting = rData.privacySettings?.allowMessagesFrom || 'everyone';

        if (msgSetting === 'nobody') {
          return { allowed: false, reason: 'এই ব্যবহারকারী সকল মেসেজিং রিসিভ বন্ধ করে রেখেছেন।' };
        }

        if (msgSetting === 'friends_only') {
          const recipientFriends: string[] = rData.friendIds || rData.friends || [];
          const isFriend = recipientFriends.includes(senderId);
          if (!isFriend) {
            return { allowed: false, reason: 'শুধুমাত্র বন্ধুগণ এই ব্যবহারকারীকে মেসেজ পাঠাতে পারবেন।' };
          }
        }
      }
    } catch (e) {
      console.warn("Privacy permission check note:", e);
    }

    return { allowed: true };
  },

  sendMessage: async (
    conversationId: string, 
    senderId: string, 
    text: string,
    participants: string[],
    options?: {
      type?: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location';
      mediaUrl?: string;
      audioDuration?: number;
      fileName?: string;
      fileSize?: number;
      location?: { lat: number; lng: number; address?: string };
      replyToMessage?: { id: string; senderName: string; text: string };
      msgId?: string;
    }
  ) => {
    // Check permission & blocking for direct chats
    const otherParticipant = participants.find(p => p !== senderId);
    if (otherParticipant) {
      const checkResult = await chatService.canUserMessage(senderId, otherParticipant);
      if (!checkResult.allowed) {
        throw new Error(checkResult.reason || 'মেসেজ পাঠানো সম্ভব নয়।');
      }
    }
    const msgId = options?.msgId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const messageData: ExtendedChatMessage = {
      id: msgId,
      conversationId,
      senderId,
      text: text || '',
      type: options?.type || 'text',
      status: 'sending',
      timestamp: Date.now()
    };

    if (options?.mediaUrl) messageData.mediaUrl = options.mediaUrl;
    if (options?.fileName) messageData.fileName = options.fileName;
    if (options?.fileSize !== undefined) messageData.fileSize = options.fileSize;
    if (options?.audioDuration !== undefined) messageData.audioDuration = options.audioDuration;
    if (options?.location) messageData.location = options.location;
    if (options?.replyToMessage) messageData.replyToMessage = options.replyToMessage;

    const localKey = `adda_messages_${conversationId}`;

    // Save/Update message locally as sending
    try {
      const savedMessages: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || JSON.stringify(INITIAL_DEMO_MESSAGES[conversationId] || []));
      const idx = savedMessages.findIndex(m => m.id === msgId);
      if (idx > -1) {
        savedMessages[idx] = messageData;
      } else {
        savedMessages.push(messageData);
      }
      localStorage.setItem(localKey, JSON.stringify(savedMessages));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adda_local_message_sent', { detail: { conversationId, message: messageData } }));
      }
    } catch {}

    // If offline, fail immediately to trigger retry
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        const savedMessages: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
        const updated = savedMessages.map(m => m.id === msgId ? { ...m, status: 'failed' as const } : m);
        localStorage.setItem(localKey, JSON.stringify(updated));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('adda_local_message_sent', { detail: { conversationId } }));
        }
      } catch {}
      throw new Error('নেটওয়ার্ক অফলাইন। বার্তাটি পুনরায় চেষ্টার জন্য রাখা হয়েছে।');
    }

    try {
      const msgRef = doc(db, `conversations/${conversationId}/messages`, msgId);
      const batch = writeBatch(db);
      
      const firestoreMsg = cleanFirestoreData({ ...messageData, status: 'sent' as const });
      batch.set(msgRef, firestoreMsg);
      
      const convRef = doc(db, 'conversations', conversationId);
      const updates: any = {
        participants: participants,
        lastMessage: options?.type === 'image' ? '📷 ছবি পাঠানো হয়েছে' : (options?.type === 'voice' ? '🎙️ ভয়েস মেসেজ' : (text || '')),
        lastMessageTime: Date.now(),
        lastMessageSenderId: senderId,
        updatedAt: Date.now()
      };
      
      participants.forEach(p => {
        if (p !== senderId) {
          updates[`unreadCount.${p}`] = increment(1);
        }
      });
      
      batch.set(convRef, cleanFirestoreData(updates), { merge: true });
      await batch.commit();

      // Update locally to sent
      try {
        const savedMessages: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
        const updated = savedMessages.map(m => m.id === msgId ? { ...m, status: 'sent' as const } : m);
        localStorage.setItem(localKey, JSON.stringify(updated));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('adda_local_message_sent', { detail: { conversationId } }));
        }
      } catch {}

      // Generate notification records for each recipient in Firestore
      participants.filter(p => p !== senderId).forEach(async (recipientId) => {
        try {
          await addDoc(collection(db, 'notifications'), cleanFirestoreData({
            userId: recipientId,
            type: 'chat_message',
            title: 'নতুন আড্ডা বার্তা',
            body: options?.type === 'image' ? '📷 ছবি পাঠানো হয়েছে' : (options?.type === 'voice' ? '🎙️ ভয়েস মেসেজ' : (text || '')),
            fromUserId: senderId,
            conversationId: conversationId,
            isRead: false,
            createdAt: Date.now()
          }));
        } catch (err) {
          console.warn("Notification creation note:", err);
        }
      });

      // Simulate delivery & seen status
      setTimeout(async () => {
        try {
          const updateDelivered = doc(db, `conversations/${conversationId}/messages`, msgId);
          await updateDoc(updateDelivered, { status: 'delivered' });
        } catch {}

        try {
          const currentList: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
          const updated = currentList.map(m => m.id === msgId ? { ...m, status: 'delivered' as const } : m);
          localStorage.setItem(localKey, JSON.stringify(updated));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('adda_local_message_sent', { detail: { conversationId } }));
          }
        } catch {}
      }, 700);

      setTimeout(async () => {
        const seenTimestamp = Date.now();
        try {
          const updateSeen = doc(db, `conversations/${conversationId}/messages`, msgId);
          await updateDoc(updateSeen, { 
            status: 'seen', 
            seenAt: seenTimestamp,
            seenBy: participants.filter(p => p !== senderId)
          });
        } catch {}

        try {
          const currentList: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
          const updated = currentList.map(m => m.id === msgId ? { 
            ...m, 
            status: 'seen' as const, 
            seenAt: seenTimestamp,
            seenBy: participants.filter(p => p !== senderId)
          } : m);
          localStorage.setItem(localKey, JSON.stringify(updated));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('adda_local_message_sent', { detail: { conversationId } }));
          }
        } catch {}
      }, 2500);

      return msgId;
    } catch (error) {
      console.warn("Saving message locally with failed status due to error:", error);

      try {
        const savedMessages: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
        const updated = savedMessages.map(m => m.id === msgId ? { ...m, status: 'failed' as const } : m);
        localStorage.setItem(localKey, JSON.stringify(updated));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('adda_local_message_sent', { detail: { conversationId } }));
        }
      } catch {}

      throw error;
    }
  },

  retryMessage: async (conversationId: string, messageId: string, senderId: string, participants: string[]) => {
    const localKey = `adda_messages_${conversationId}`;
    try {
      const localList: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
      const msg = localList.find(m => m.id === messageId);
      if (!msg) return;

      // Reset state to sending first
      msg.status = 'sending';
      localStorage.setItem(localKey, JSON.stringify(localList));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adda_local_message_sent', { detail: { conversationId } }));
      }

      await chatService.sendMessage(conversationId, senderId, msg.text, participants, {
        type: msg.type as any,
        mediaUrl: msg.mediaUrl,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        audioDuration: msg.audioDuration,
        location: msg.location,
        replyToMessage: msg.replyToMessage,
        msgId: msg.id // Reuse ID to prevent duplicate document creations
      });
    } catch (err) {
      console.warn("Manual retry failed:", err);
    }
  },

  syncFailedMessages: async (senderId: string) => {
    if (typeof window === 'undefined') return;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('adda_messages_')) {
          const conversationId = key.replace('adda_messages_', '');
          const localList: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(key) || '[]');
          const failedMessages = localList.filter(m => m.status === 'failed' && m.senderId === senderId);

          for (const msg of failedMessages) {
            try {
              const convSnap = await getDoc(doc(db, 'conversations', conversationId));
              const participants = convSnap.exists() ? (convSnap.data().participants || []) : [senderId];
              
              await chatService.sendMessage(conversationId, senderId, msg.text, participants, {
                type: msg.type as any,
                mediaUrl: msg.mediaUrl,
                fileName: msg.fileName,
                fileSize: msg.fileSize,
                audioDuration: msg.audioDuration,
                location: msg.location,
                replyToMessage: msg.replyToMessage,
                msgId: msg.id
              });
            } catch (err) {
              console.warn(`Auto sync failed for message ${msg.id}:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Error in syncFailedMessages:", err);
    }
  },

  toggleReaction: async (conversationId: string, messageId: string, userId: string, emoji: string) => {
    try {
      const msgRef = doc(db, `conversations/${conversationId}/messages`, messageId);
      const msgSnap = await getDoc(msgRef);
      if (msgSnap.exists()) {
        const currentReactions = msgSnap.data().reactions || {};
        if (currentReactions[userId] === emoji) {
          await updateDoc(msgRef, {
            [`reactions.${userId}`]: deleteField()
          });
        } else {
          await updateDoc(msgRef, {
            [`reactions.${userId}`]: emoji
          });
        }
      } else {
        await updateDoc(msgRef, {
          [`reactions.${userId}`]: emoji
        });
      }
    } catch (e) {
      console.warn("Reaction toggle error:", e);
    }
  },

  editMessage: async (conversationId: string, messageId: string, newText: string) => {
    try {
      const msgRef = doc(db, `conversations/${conversationId}/messages`, messageId);
      await updateDoc(msgRef, {
        text: newText,
        isEdited: true,
        editedAt: Date.now()
      });
    } catch (e) {
      console.warn("Edit message error:", e);
    }
  },

  reportMessage: async (conversationId: string, messageId: string, reporterId: string, reason: string, messageText?: string) => {
    try {
      await addDoc(collection(db, 'report_notifications'), {
        type: 'message_report',
        conversationId,
        messageId,
        reporterId,
        reason,
        messageText: messageText || '',
        createdAt: Date.now(),
        status: 'pending'
      });
    } catch (e) {
      console.warn("Report message error:", e);
    }
  },

  markAsRead: async (conversationId: string, userId: string) => {
    try {
      const convRef = doc(db, 'conversations', conversationId);
      await setDoc(convRef, {
        [`unreadCount.${userId}`]: 0
      }, { merge: true });

      // Mark messages where senderId !== userId as seen
      const msgsQuery = query(
        collection(db, `conversations/${conversationId}/messages`),
        where('status', '!=', 'seen')
      );
      const snapshot = await getDocs(msgsQuery);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach((d) => {
          const data = d.data();
          if (data.senderId !== userId) {
            batch.update(d.ref, {
              status: 'seen',
              seenAt: Date.now(),
              seenBy: [userId]
            });
          }
        });
        await batch.commit();
      }
    } catch (error) {
      console.warn("Mark as read note:", error);
    }

    // Update local storage cache
    try {
      const localKey = `adda_messages_${conversationId}`;
      const savedMessages: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
      let changed = false;
      const updated = savedMessages.map(m => {
        if (m.senderId !== userId && m.status !== 'seen') {
          changed = true;
          return { ...m, status: 'seen' as const, seenAt: Date.now(), seenBy: [userId] };
        }
        return m;
      });
      if (changed) {
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
    } catch {}
  },

  deleteMessage: async (conversationId: string, messageId: string) => {
    try {
      await deleteDoc(doc(db, `conversations/${conversationId}/messages`, messageId));
    } catch (e) {
      console.warn("Delete message locally note:", e);
    }

    try {
      const localKey = `adda_messages_${conversationId}`;
      const savedMessages: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(localKey) || '[]');
      const filtered = savedMessages.filter(m => m.id !== messageId);
      localStorage.setItem(localKey, JSON.stringify(filtered));
    } catch {}
  },
  
  // Search registered citizens from Firestore users collection
  searchConversationsAndMessages: async (searchQuery: string, currentUserId: string): Promise<{
    conversations: Conversation[];
    messages: ChatMessage[];
  }> => {
    try {
      const term = searchQuery.toLowerCase().trim();
      if (!term) return { conversations: [], messages: [] };

      // 1. Search conversations (where user is participant)
      const convsRef = collection(db, 'conversations');
      const convsQuery = query(
        convsRef,
        where('participants', 'array-contains', currentUserId)
      );
      const convSnap = await getDocs(convsQuery);
      
      const foundConvs: Conversation[] = [];
      const foundMessages: ChatMessage[] = [];
      
      const convsData = convSnap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));

      // 2. Filter conversations by name
      for (const chat of convsData) {
        let title = '';
        if (chat.type === 'group') {
           title = (chat as any).title || '';
        } else {
           const participantId = chat.participants.find(id => id !== currentUserId);
           if (participantId && chat.participantDetails?.[participantId]) {
              title = chat.participantDetails[participantId].name || '';
           }
        }
        title = (title || chat.lastMessage || '').toLowerCase();
        
        if (title.includes(term)) {
           foundConvs.push(chat);
        }

        // 3. Search messages inside this conversation
        const msgRef = collection(db, `conversations/${chat.id}/messages`);
        const msgQuery = query(msgRef, orderBy('timestamp', 'desc'), limit(20));
        const msgSnap = await getDocs(msgQuery);
        
        msgSnap.forEach(mSnap => {
          const mData = mSnap.data() as ChatMessage;
          if ((mData.text || '').toLowerCase().includes(term)) {
            foundMessages.push({ ...mData, id: mSnap.id, conversationId: chat.id });
          }
        });
      }

      return {
        conversations: foundConvs,
        messages: foundMessages
      };
    } catch (error) {
      console.error('Error searching conversations:', error);
      return { conversations: [], messages: [] };
    }
  },

  searchRegisteredCitizens: async (searchQuery: string, currentUserId: string): Promise<UserInfo[]> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(50));
      const snapshot = await getDocs(q);
      const results: UserInfo[] = [];
      const term = searchQuery.trim().toLowerCase();

      snapshot.forEach((docSnap) => {
        if (docSnap.id === currentUserId) return;
        const data = docSnap.data();
        const name = (data.displayName || data.name || data.fullName || 'নাগরিক').toString();
        const photoURL = data.photoURL || '';
        const isOnline = Boolean(data.isOnline);
        const occupation = data.occupation || data.role || 'পুঠিয়া নাগরিক';

        if (!term || name.toLowerCase().includes(term) || occupation.toLowerCase().includes(term)) {
          results.push({
            uid: docSnap.id,
            name,
            photoURL,
            isOnline,
            lastSeen: data.lastSeen || Date.now()
          });
        }
      });
      return results;
    } catch (error) {
      console.warn("Search registered citizens error:", error);
      return [];
    }
  },

  acceptMessageRequest: async (conversationId: string) => {
    try {
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        requestStatus: 'accepted'
      });
    } catch (error) {
      console.warn("Accept message request error:", error);
    }
  },

  declineMessageRequest: async (conversationId: string) => {
    try {
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        requestStatus: 'declined'
      });
    } catch (error) {
      console.warn("Decline message request error:", error);
    }
  },

  blockUser: async (blockerId: string, blockedId: string) => {
    try {
      await setDoc(doc(db, 'user_blocks', `${blockerId}_${blockedId}`), {
        blockerId,
        blockedId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn("Block user error:", error);
    }
  },

  unblockUser: async (blockerId: string, blockedId: string) => {
    try {
      await deleteDoc(doc(db, 'user_blocks', `${blockerId}_${blockedId}`));
    } catch (error) {
      console.warn("Unblock user error:", error);
    }
  },

  reportUser: async (reporterId: string, reportedId: string, reason: string) => {
    try {
      await addDoc(collection(db, 'user_reports'), {
        reporterId,
        reportedId,
        reason,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn("Report user error:", error);
    }
  },

  // Real-time Typing Status Management
  setTypingStatus: async (
    conversationId: string,
    userId: string,
    userName: string,
    isTyping: boolean,
    userPhoto?: string
  ) => {
    if (!conversationId || !userId) return;

    // 1. Broadcast locally for instant multi-tab/client reactivity
    try {
      if (typeof window !== 'undefined') {
        const payload = {
          conversationId,
          userId,
          userName,
          isTyping,
          userPhoto: userPhoto || '',
          timestamp: Date.now()
        };
        window.dispatchEvent(new CustomEvent('adda_typing_event', { detail: payload }));
        
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('adda_typing_channel');
          bc.postMessage(payload);
          bc.close();
        }
      }
    } catch (e) {
      console.warn("Local typing broadcast note:", e);
    }

    // 2. Sync to Firestore subcollection /conversations/{convId}/typing/{userId}
    try {
      const typingDocRef = doc(db, `conversations/${conversationId}/typing`, userId);
      if (isTyping) {
        await setDoc(typingDocRef, {
          uid: userId,
          name: userName,
          photoURL: userPhoto || '',
          isTyping: true,
          timestamp: Date.now()
        }, { merge: true });
      } else {
        await deleteDoc(typingDocRef).catch(() => {});
      }
    } catch (e) {
      // Offline / fallback handled gracefully
    }
  },

  subscribeToTyping: (
    conversationId: string,
    currentUserId: string,
    callback: (typingUsers: { uid: string; name: string; photoURL?: string }[]) => void
  ) => {
    if (!conversationId) {
      callback([]);
      return () => {};
    }

    const localTypers: Map<string, { uid: string; name: string; photoURL?: string; timestamp: number }> = new Map();

    const updateCombined = () => {
      const now = Date.now();
      const active: { uid: string; name: string; photoURL?: string }[] = [];
      localTypers.forEach((val, uid) => {
        if (uid !== currentUserId && now - val.timestamp < 5000) {
          active.push({ uid: val.uid, name: val.name, photoURL: val.photoURL });
        }
      });
      callback(active);
    };

    // Auto cleanup stale typers every 2.5s
    const cleanupInterval = setInterval(() => {
      let changed = false;
      const now = Date.now();
      localTypers.forEach((val, uid) => {
        if (now - val.timestamp >= 5000) {
          localTypers.delete(uid);
          changed = true;
        }
      });
      if (changed) updateCombined();
    }, 2500);

    // Event listener for window events
    const handleLocalEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.conversationId === conversationId) {
        if (detail.isTyping) {
          localTypers.set(detail.userId, {
            uid: detail.userId,
            name: detail.userName,
            photoURL: detail.userPhoto,
            timestamp: detail.timestamp || Date.now()
          });
        } else {
          localTypers.delete(detail.userId);
        }
        updateCombined();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('adda_typing_event', handleLocalEvent);
    }

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('adda_typing_channel');
        bc.onmessage = (ev) => {
          if (ev.data && ev.data.conversationId === conversationId) {
            if (ev.data.isTyping) {
              localTypers.set(ev.data.userId, {
                uid: ev.data.userId,
                name: ev.data.userName,
                photoURL: ev.data.userPhoto,
                timestamp: ev.data.timestamp || Date.now()
              });
            } else {
              localTypers.delete(ev.data.userId);
            }
            updateCombined();
          }
        };
      } catch {}
    }

    // Firestore listener
    let unsubFirestore = () => {};
    try {
      const typingColRef = collection(db, `conversations/${conversationId}/typing`);
      unsubFirestore = onSnapshot(typingColRef, (snapshot) => {
        const now = Date.now();
        snapshot.forEach(d => {
          const data = d.data();
          if (data && data.uid && data.uid !== currentUserId) {
            if (data.isTyping && (!data.timestamp || now - data.timestamp < 6000)) {
              localTypers.set(data.uid, {
                uid: data.uid,
                name: data.name || 'সঙ্গী নাগরিক',
                photoURL: data.photoURL,
                timestamp: data.timestamp || Date.now()
              });
            } else {
              localTypers.delete(data.uid);
            }
          }
        });
        updateCombined();
      }, () => {
        // Fallback gracefully
      });
    } catch {}

    return () => {
      clearInterval(cleanupInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('adda_typing_event', handleLocalEvent);
      }
      if (bc) {
        bc.close();
      }
      unsubFirestore();
    };
  }
};
