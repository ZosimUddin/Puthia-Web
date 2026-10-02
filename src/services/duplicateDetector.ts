// Duplicate Detection Engine for Puthia Smart Portal

export interface CandidateItem {
  id?: string;
  title?: string;
  name?: string;
  phone?: string;
  contactNumber?: string;
  location?: string;
  address?: string;
  category?: string;
}

export interface DuplicateMatch {
  existingItem: CandidateItem;
  similarityScore: number; // 0 to 100
  matchReasons: string[];
}

/**
 * Normalizes Bangla and English text for fuzzy comparison
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^অ-হa-z0-9\s]/gi, "") // Remove punctuation
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculates Levenshtein similarity percentage between two strings
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 100;

  // Simple Token Jaccard Similarity for Bengali Phrases
  const tokens1 = new Set(s1.split(" "));
  const tokens2 = new Set(s2.split(" "));

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  if (union.size === 0) return 0;
  return Math.round((intersection.size / union.size) * 100);
}

/**
 * Detect duplicates across existing records
 */
export function checkForDuplicates(
  newItem: CandidateItem,
  existingList: CandidateItem[],
  thresholdPercentage: number = 50
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  const newTitle = newItem.title || newItem.name || "";
  const newPhone = newItem.phone || newItem.contactNumber || "";
  const newAddress = newItem.location || newItem.address || "";

  existingList.forEach(item => {
    const itemTitle = item.title || item.name || "";
    const itemPhone = item.phone || item.contactNumber || "";
    const itemAddress = item.location || item.address || "";

    const matchReasons: string[] = [];
    let score = 0;

    // 1. Phone number exact match (High weight)
    if (newPhone && itemPhone && newPhone.replace(/\D/g, "") === itemPhone.replace(/\D/g, "")) {
      score += 60;
      matchReasons.push("হুবহু একই ফোন নম্বর পাওয়া গেছে");
    }

    // 2. Title / Name Similarity
    const titleSim = calculateStringSimilarity(newTitle, itemTitle);
    if (titleSim > 40) {
      score += Math.round((titleSim * 0.4));
      matchReasons.push(`প্রতিষ্ঠানের নামের সাদৃশ্য: ${titleSim}%`);
    }

    // 3. Location / Address Similarity
    if (newAddress && itemAddress) {
      const addrSim = calculateStringSimilarity(newAddress, itemAddress);
      if (addrSim > 40) {
        score += Math.round((addrSim * 0.2));
        matchReasons.push(`ঠিকানার মিল পাওয়া গেছে`);
      }
    }

    if (score >= thresholdPercentage) {
      matches.push({
        existingItem: item,
        similarityScore: Math.min(score, 100),
        matchReasons
      });
    }
  });

  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}
