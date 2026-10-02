/**
 * Helper to translate and format Firebase Auth error messages into user-friendly Bengali.
 */
export function getFriendlyAuthErrorMessage(err: any): string {
  if (!err) return "একটি অজানা ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।";

  const code = err.code || "";
  const message = (err.message || "").toLowerCase();

  if (code === "auth/operation-not-allowed" || message.includes("operation-not-allowed")) {
    return "ফায়ারবেস কনসোলে এই সাইন-ইন মেথডটি (Email/Password) সক্রিয় (Enabled) করা নেই। অনুগ্রহ করে গুগল দিয়ে সাইন-ইন করুন অথবা ফায়ারবেস কনসোল (Authentication > Sign-in method) থেকে মেথডটি সক্রিয় করুন।";
  }

  if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential" || message.includes("invalid-credential")) {
    return "প্রদত্ত ইমেইল/নম্বর অথবা পাসওয়ার্ড সঠিক নয়। দয়া করে পুনরায় যাচাই করুন।";
  }

  if (code === "auth/email-already-in-use" || message.includes("email-already-in-use")) {
    return "এই ইমেইল বা ফোন নম্বর দিয়ে ইতিমধ্যে একটি একাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন।";
  }

  if (code === "auth/weak-password" || message.includes("weak-password")) {
    return "পাসওয়ার্ডটি অত্যন্ত দুর্বল। অনুগ্রহ করে কমপক্ষে ৬ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন।";
  }

  if (code === "auth/invalid-email" || message.includes("invalid-email")) {
    return "সঠিক ইমেইল ঠিকানা প্রদান করুন।";
  }

  if (code === "auth/user-disabled" || message.includes("user-disabled")) {
    return "আপনার একাউন্টটি সাময়িকভাবে স্থগিত বা নিষ্ক্রিয় করা হয়েছে। অনুগ্রহ করে সাপোর্টে যোগাযোগ করুন।";
  }

  if (code === "auth/too-many-requests" || message.includes("too-many-requests")) {
    return "অতিরিক্ত ভুল চেষ্টার কারণে সাময়িকভাবে সেবা স্থগিত করা হয়েছে। কিছুক্ষণ পর পুনরায় চেষ্টা করুন।";
  }

  if (code === "auth/popup-closed-by-user" || message.includes("popup-closed-by-user")) {
    return "গুগল সাইন-ইন পপআপ উইন্ডোটি বন্ধ করা হয়েছে।";
  }

  if (code === "auth/popup-blocked" || message.includes("popup-blocked")) {
    return "আপনার ব্রাউজার পপআপ ব্লক করেছে। অনুগ্রহ করে ব্রাউজার সেটিংসে পপআপ অনুমোদন করুন।";
  }

  if (code === "auth/network-request-failed" || message.includes("network-request-failed")) {
    return "ইন্টারনেট সংযোগে সমস্যা দেখা দিয়েছে। আপনার নেটওয়ার্ক চেক করুন।";
  }

  if (code === "auth/unauthorized-domain" || message.includes("unauthorized-domain")) {
    return "ডোমেইনটি ফায়ারবেস কনসোলের 'Authorized domains' তালিকায় আপডেট হতে ১-২ মিনিট সময় লাগতে পারে। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা সঠিক ইমেইল ও পাসওয়ার্ড দিয়ে সরাসরি লগইন করুন।";
  }

  if (err.message) {
    return err.message;
  }

  return "লগইন বা একাউন্ট ব্যবস্থাপনায় ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন।";
}
