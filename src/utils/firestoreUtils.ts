/**
 * Firestore Utilities
 * Safely sanitizes payloads for Cloud Firestore operations, eliminating undefined fields.
 */

export function cleanUndefined<T = any>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (obj instanceof Date) {
    return obj;
  }
  // If it is a File or Blob, exclude from document payload
  if (typeof File !== 'undefined' && obj instanceof File) {
    return undefined as any;
  }
  if (typeof Blob !== 'undefined' && obj instanceof Blob) {
    return undefined as any;
  }
  if (Array.isArray(obj)) {
    return obj
      .map(item => cleanUndefined(item))
      .filter(item => item !== undefined) as any;
  }
  if (typeof obj === 'object') {
    // Handle Firestore Timestamp or FieldValue objects
    if (
      typeof (obj as any).toDate === 'function' ||
      ((obj as any).seconds !== undefined && (obj as any).nanoseconds !== undefined) ||
      (obj as any)._methodName ||
      (obj as any).constructor?.name === 'FieldValue' ||
      (obj as any).constructor?.name === 'Timestamp'
    ) {
      return obj;
    }
    const proto = Object.getPrototypeOf(obj);
    if (proto !== null && proto !== Object.prototype) {
      return obj;
    }
    const result: Record<string, any> = {};
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        const cleaned = cleanUndefined(val);
        if (cleaned !== undefined) {
          result[key] = cleaned;
        }
      }
    }
    return result as T;
  }
  return obj;
}

export default cleanUndefined;
