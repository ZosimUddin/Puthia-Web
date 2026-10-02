/**
 * Strips any ward numbers in Bengali or English parentheses or text from village/address strings.
 * e.g. "ভালুক গাছী পাচাঁনীপাড়া (ওয়ার্ড ০৫)" -> "ভালুক গাছী পাচাঁনীপাড়া"
 * e.g. "আটভাগ (ওয়ার্ড ০৯)" -> "আটভাগ"
 * e.g. "কান্দ্রা (ওয়ার্ড নং - ০৫)" -> "কান্দ্রা"
 */
export const cleanWardFromText = (text?: string | null): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\s*\([^\)]*ওয়ার্ড[^\)]*\)/gi, '')
    .replace(/\s*\([^\)]*ওয়ার্ড[^\)]*\)/gi, '')
    .replace(/\s*\([^\)]*ward[^\)]*\)/gi, '')
    .replace(/\s*\(ওয়ার্ড\s*[^\)]*\)/gi, '')
    .replace(/\s*\(ওয়ার্ড\s*[^\)]*\)/gi, '')
    .replace(/\s*\(ward\s*[^\)]*\)/gi, '')
    .replace(/\s+-\s+ওয়ার্ড\s*[০-৯0-9]+/gi, '')
    .replace(/\s+-\s+ওয়ার্ড\s*[০-৯0-9]+/gi, '')
    .trim();
};
