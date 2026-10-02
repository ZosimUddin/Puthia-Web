import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { getBadgeForStars } from "../utils/reputation";

export const useReputation = () => {
  const addStars = async (userId: string, stars: number) => {
    const userRef = doc(db, "users", userId);
    
    // Get current user data or assume existing
    // For simplicity, we directly increment
    await updateDoc(userRef, {
      stars: increment(stars)
    });
    
    // Note: Re-calculating badges could be done in cloud functions
    // but for now, we can try to update badge if needed, 
    // though the UI should probably derive it from stars.
  };

  return { addStars };
};
