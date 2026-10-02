import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";

export const useSocial = () => {
  // Follow a user
  const followUser = async (currentUserId: string, targetUserId: string) => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;
    try {
      const currentUserRef = doc(db, "users", currentUserId);
      await updateDoc(currentUserRef, {
        following: arrayUnion(targetUserId),
        followingCount: increment(1)
      });

      const targetUserRef = doc(db, "users", targetUserId);
      await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUserId),
        followersCount: increment(1)
      });
    } catch (err) {
      console.error("Error following user:", err);
      throw err;
    }
  };

  // Unfollow a user
  const unfollowUser = async (currentUserId: string, targetUserId: string) => {
    if (!currentUserId || !targetUserId) return;
    try {
      const currentUserRef = doc(db, "users", currentUserId);
      await updateDoc(currentUserRef, {
        following: arrayRemove(targetUserId),
        followingCount: increment(-1)
      });

      const targetUserRef = doc(db, "users", targetUserId);
      await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUserId),
        followersCount: increment(-1)
      });
    } catch (err) {
      console.error("Error unfollowing user:", err);
      throw err;
    }
  };

  // Send Friend Request
  const sendFriendRequest = async (currentUserId: string, targetUserId: string) => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;
    try {
      const currentUserRef = doc(db, "users", currentUserId);
      await updateDoc(currentUserRef, {
        friendRequestsSent: arrayUnion(targetUserId)
      });

      const targetUserRef = doc(db, "users", targetUserId);
      await updateDoc(targetUserRef, {
        friendRequestsReceived: arrayUnion(currentUserId)
      });
    } catch (err) {
      console.error("Error sending friend request:", err);
      throw err;
    }
  };

  // Cancel Friend Request
  const cancelFriendRequest = async (currentUserId: string, targetUserId: string) => {
    if (!currentUserId || !targetUserId) return;
    try {
      const currentUserRef = doc(db, "users", currentUserId);
      await updateDoc(currentUserRef, {
        friendRequestsSent: arrayRemove(targetUserId)
      });

      const targetUserRef = doc(db, "users", targetUserId);
      await updateDoc(targetUserRef, {
        friendRequestsReceived: arrayRemove(currentUserId)
      });
    } catch (err) {
      console.error("Error canceling friend request:", err);
      throw err;
    }
  };

  // Accept Friend Request
  const acceptFriendRequest = async (currentUserId: string, senderUserId: string) => {
    if (!currentUserId || !senderUserId) return;
    try {
      const currentUserRef = doc(db, "users", currentUserId);
      await updateDoc(currentUserRef, {
        friendRequestsReceived: arrayRemove(senderUserId),
        friends: arrayUnion(senderUserId),
        friendsCount: increment(1)
      });

      const senderUserRef = doc(db, "users", senderUserId);
      await updateDoc(senderUserRef, {
        friendRequestsSent: arrayRemove(currentUserId),
        friends: arrayUnion(currentUserId),
        friendsCount: increment(1)
      });
    } catch (err) {
      console.error("Error accepting friend request:", err);
      throw err;
    }
  };

  // Reject Friend Request
  const rejectFriendRequest = async (currentUserId: string, senderUserId: string) => {
    if (!currentUserId || !senderUserId) return;
    try {
      const currentUserRef = doc(db, "users", currentUserId);
      await updateDoc(currentUserRef, {
        friendRequestsReceived: arrayRemove(senderUserId)
      });

      const senderUserRef = doc(db, "users", senderUserId);
      await updateDoc(senderUserRef, {
        friendRequestsSent: arrayRemove(currentUserId)
      });
    } catch (err) {
      console.error("Error rejecting friend request:", err);
      throw err;
    }
  };

  // Remove Friend (Unfriend)
  const removeFriend = async (currentUserId: string, targetUserId: string) => {
    if (!currentUserId || !targetUserId) return;
    try {
      const currentUserRef = doc(db, "users", currentUserId);
      await updateDoc(currentUserRef, {
        friends: arrayRemove(targetUserId),
        friendsCount: increment(-1)
      });

      const targetUserRef = doc(db, "users", targetUserId);
      await updateDoc(targetUserRef, {
        friends: arrayRemove(currentUserId),
        friendsCount: increment(-1)
      });
    } catch (err) {
      console.error("Error removing friend:", err);
      throw err;
    }
  };

  return { 
    followUser, 
    unfollowUser, 
    sendFriendRequest, 
    cancelFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend 
  };
};
