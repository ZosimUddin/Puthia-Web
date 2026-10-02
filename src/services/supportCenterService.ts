// Complete Help & Support Center Ticket Service for Amader Puthia (আমাদের পুঠিয়া) Platform

export interface SupportTicketReply {
  id: string;
  sender: 'USER' | 'ADMIN';
  senderName: string;
  message: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface TicketProgressStep {
  title: string;
  desc: string;
  completed: boolean;
  date?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'ACCOUNT' | 'DOCTOR' | 'BLOOD' | 'MERCHANT' | 'REFERRAL' | 'TECHNICAL' | 'GENERAL' | 'CORRECTION' | 'EMERGENCY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt?: string;
  userEmail: string;
  assignedTo?: string;
  estimatedResolutionTime?: string;
  progressPercent?: number;
  replies: SupportTicketReply[];
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  category: string;
  helpfulYes?: number;
  helpfulNo?: number;
}

export const MOCK_PUTHIA_FAQS: FaqItem[] = [
  {
    id: "pf-1",
    category: "অ্যাকাউন্ট ও লগইন",
    question: "আমাদের পুঠিয়া ওয়েবসাইটে অ্যাকাউন্ট খোলার নিয়ম কী?",
    answer: "ওয়েবসাইটের উপরের ডানদিকের 'লগইন' বাটনে ক্লিক করে 'নতুন একাউন্ট খুলুন' সিলেক্ট করুন। আপনার নাম, মোবাইল নম্বর এবং একটি নিরাপদ পাসওয়ার্ড দিয়ে সহজেই ১ মিনিটে ফ্রি অ্যাকাউন্ট তৈরি করতে পারবেন। কোনো ওটিপি চার্জ বা ফি নেই।"
  },
  {
    id: "pf-2",
    category: "অ্যাকাউন্ট ও লগইন",
    question: "পাসওয়ার্ড ভুলে গেলে কীভাবে পুনরুদ্ধার (Reset) করব?",
    answer: "লগইন স্ক্রিনে 'পাসওয়ার্ড ভুলে গেছেন?' অপশনে ক্লিক করে আপনার নিবন্ধিত মোবাইল নম্বর বা ইমেইল প্রদান করুন। নির্দেশিত নিয়মে নতুন পাসওয়ার্ড সেট করে নিতে পারবেন অথবা আমাদের সাপোর্ট হেল্পলাইনে যোগাযোগ করতে পারেন।"
  },
  {
    id: "pf-3",
    category: "রক্তদাতা ও ব্লাড ব্যাংক",
    question: "রক্তদাতা তালিকায় নিজের নাম কীভাবে যুক্ত বা আপডেট করব?",
    answer: "আমাদের পুঠিয়া প্ল্যাটফর্মের 'রক্তদান' মেনুতে গিয়ে 'রক্তদাতা হিসেবে নিবন্ধন করুন' বাটনে ক্লিক করুন। আপনার রক্তের গ্রুপ, ইউনিয়ন, মোবাইল নম্বর ও শেষ রক্তদানের তারিখ উল্লেখ করে সাবমিট করুন। পরবর্তীতে প্রোফাইল থেকে যেকোনো সময় স্ট্যাটাস পরিবর্তন করতে পারবেন।"
  },
  {
    id: "pf-4",
    category: "রক্তদাতা ও ব্লাড ব্যাংক",
    question: "জরুরি রক্তদাতার খোঁজ পেতে কীভাবে সার্চ করতে হবে?",
    answer: "'রক্ত খুঁজুন' পেজে প্রবেশ করে নির্দিষ্ট রক্তের গ্রুপ (যেমন: A+, O+, B+ ইত্যাদি) এবং পুঠিয়ার নির্দিষ্ট ইউনিয়ন ফিল্টার করে সরাসরি সচল রক্তদাতাদের মোবাইল নম্বর দেখে তাৎক্ষণিক কল দেওয়া যাবে।"
  },
  {
    id: "pf-5",
    category: "ডাক্তার ও স্বাস্থ্য সেবা",
    question: "ওয়েবসাইট থেকে ডাক্তার সিরিয়াল বা চেম্বার বুকিং কীভাবে করব?",
    answer: "'ডাক্তার' পেজে গিয়ে বিষয়ভিত্তিক বিশেষজ্ঞ ডাক্তার নির্বাচন করুন এবং 'সিরিয়াল নিন' বাটনে ক্লিক করুন। রোগীর নাম, বয়স, সমস্যা ও কাঙ্ক্ষিত তারিখ নির্বাচন করে কনফার্ম করলে তাৎক্ষণিক ডিজিটাল সিরিয়াল স্লিপ পাবেন।"
  },
  {
    id: "pf-6",
    category: "দোকান ও ব্যবসা লিস্টিং",
    question: "আমার দোকান বা ব্যবসাপ্রতিষ্ঠান কীভাবে আমাদের পুঠিয়ায় ফ্রিতে যুক্ত করব?",
    answer: "'দোকান ও ব্যবসা' বা সাইডবার মেনু থেকে 'প্রতিষ্ঠান যুক্ত করুন' ফর্মে গিয়ে দোকানের নাম, ক্যাটাগরি (মুদি, ফার্মেসি, হার্ডওয়্যার ইত্যাদি), ছবি, মোবাইল নম্বর ও ঠিকানা দিয়ে সাবমিট করুন। অ্যাডমিন টিম দ্রুত যাচাই করে লিস্টিং লাইভ করে দেবে।"
  },
  {
    id: "pf-7",
    category: "রেফারেল ও ইনকাম",
    question: "রেফারেল কোড শেয়ার করে কীভাবে রিওয়ার্ড পয়েন্ট বা নগদ বোনাস পাওয়া যায়?",
    answer: "'রেফারেল ও আয়' সেকশনে আপনার নিজস্ব ইউনিক রেফারেল লিংক বা কোডটি বন্ধুদের সাথে শেয়ার করুন। তারা একাউন্ট খুললেই এবং প্ল্যাটফর্মের সেবা গ্রহণ করলেই আপনার ওয়ালেটে বোনাস কয়েন ও ক্যাশ যোগ হবে।"
  },
  {
    id: "pf-8",
    category: "বাস ও যাতায়াত",
    question: "বাসের সময়সূচি ও টিকিট কাউন্টারের নম্বর কীভাবে খুঁজে পাব?",
    answer: "'বাস ও পরিবহন' পেজে পুঠিয়া টু ঢাকা, রাজশাহী, নাটোর ও অন্যান্য রুটের সকল বাসের নাম, ছাড়ার সময়সূচি, ভাড়া ও লোকাল কাউন্টার মাস্টারদের সচল মোবাইল নম্বর দেওয়া রয়েছে।"
  },
  {
    id: "pf-9",
    category: "অ্যাপ ইনস্টলেশন ও টেকনিক্যাল",
    question: "আমাদের পুঠিয়া ওয়েবসাইটকে মোবাইলে অ্যাপের মতো ব্যবহার করার উপায় কী?",
    answer: "যেকোনো ব্রাউজারে সাইটটি ওপেন করে ড্রয়ার মেনুর 'অ্যাপ ডাউনলোড' এ চাপুন অথবা ব্রাউজারের ৩ ডট মেনু থেকে 'Add to Home Screen / Install App' এ ক্লিক করলে মোবাইলের হোম স্ক্রিনে আমাদের পুঠিয়া অ্যাপ আইকন চলে আসবে।"
  },
  {
    id: "pf-10",
    category: "সাপোর্ট ও ভেরিফিকেশন",
    question: "ভেরিফাইড ব্যাজ (Verified Badge) কীভাবে পাওয়া যায়?",
    answer: "ব্যবসায়ী, চিকিৎসক, রক্তদাতা ও সার্ভিস প্রোভাইডারগণ তাদের জাতীয় পরিচয়পত্র বা ট্রেড লাইসেন্স ডকুমেন্টস সাবমিট করে অ্যাডমিন পর্যালোচনার পর প্রোফাইলে ব্লু/গ্রিন ভেরিফাইড সিল পাবেন।"
  }
];

export const MOCK_PUTHIA_TICKETS: SupportTicket[] = [
  {
    id: "TCK-801",
    subject: "বানেশ্বর বাজারের ইলেকট্রনিক্স শপ লিস্টিংয়ের ফোন নম্বর আপডেট প্রয়োজন",
    category: "MERCHANT",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    createdAt: "২০২৬-০৮-১৭ ১০:৩০",
    updatedAt: "২০২৬-০৮-১৭ ১১:১৫",
    userEmail: "mdzosimuddin47@gmail.com",
    assignedTo: "জসিম উদ্দিন (সাপোর্ট লিড, আমাদের পুঠিয়া)",
    estimatedResolutionTime: "২ ঘণ্টার মধ্যে",
    progressPercent: 65,
    replies: [
      {
        id: "R-1",
        sender: "USER",
        senderName: "দোকান মালিক",
        message: "আমাদের পুঠিয়া ডিরেক্টরিতে আমার 'জননী ইলেকট্রনিক্স' এর পুরোনো নম্বর পরিবর্তন করে নতুন নম্বর ০১৭১২-xxxxxx যুক্ত করতে চাচ্ছি।",
        createdAt: "২০২৬-০৮-১৭ ১০:৩০"
      },
      {
        id: "R-2",
        sender: "ADMIN",
        senderName: "আমাদের পুঠিয়া সাপোর্ট টিম",
        message: "ধন্যবাদ! আপনার অনুরোধটি আমরা গ্রহণ করেছি। নতুন নম্বরটি ভেরিফাই করে ২০ মিনিটের মধ্যে লাইভ আপডেট করে দেওয়া হচ্ছে।",
        createdAt: "২০২৬-০৮-১৭ ১১:১৫"
      }
    ]
  },
  {
    id: "TCK-802",
    subject: "রক্তদাতা প্রোফাইলে রক্তের গ্রুপ ও ইউনিয়ন সংশোধন",
    category: "BLOOD",
    priority: "HIGH",
    status: "RESOLVED",
    createdAt: "২০২৬-০৮-১৫ ১৪:২০",
    updatedAt: "২০২৬-০৮-১৫ ১৫:১০",
    userEmail: "mdzosimuddin47@gmail.com",
    assignedTo: "ব্লাড উইং কোঅর্ডিনেটর (আমাদের পুঠিয়া)",
    estimatedResolutionTime: "সম্পন্ন",
    progressPercent: 100,
    replies: [
      {
        id: "R-101",
        sender: "USER",
        senderName: "রক্তদাতা সদস্য",
        message: "আমার প্রোফাইলে রক্তের গ্রুপ ভুলবশত B+ এর জায়গায় O+ দেখাচ্ছে। দয়া করে ঠিক করে দিন।",
        createdAt: "২০২৬-০৮-১৫ ১৪:২০"
      },
      {
        id: "R-102",
        sender: "ADMIN",
        senderName: "আমাদের পুঠিয়া সাপোর্ট ডেস্ক",
        message: "আপনার প্রোফাইল তথ্য সফলভাবে B+ (বি পজিটিভ) আপডেট করা হয়েছে। মানবিক রক্তদানে পাশে থাকার জন্য আপনাকে আন্তরিক ধন্যবাদ।",
        createdAt: "২০২৬-০৮-১৫ ১৫:১০"
      }
    ]
  },
  {
    id: "TCK-803",
    subject: "উপজেলা স্বাস্থ্য কমপ্লেক্সের ডাক্তার সিরিয়াল কনফার্মেশন মেসেজ আসেনি",
    category: "DOCTOR",
    priority: "URGENT",
    status: "OPEN",
    createdAt: "২০২৬-০৯-০১ ০৯:০০",
    updatedAt: "২০২৬-০৯-০১ ০৯:০০",
    userEmail: "mdzosimuddin47@gmail.com",
    assignedTo: "হেলথকেয়ার সাপোর্ট ডেস্ক (অপেক্ষমান)",
    estimatedResolutionTime: "১ ঘণ্টার মধ্যে",
    progressPercent: 25,
    replies: [
      {
        id: "R-201",
        sender: "USER",
        senderName: "নাগরিক",
        message: "আজ সকালের জন্য ডাক্তার সিরিয়াল বুক করেছি, কিন্তু কনফার্মেশন এসএমএস পাইনি। সিরিয়াল নম্বর যাচাই করা প্রয়োজন।",
        createdAt: "২০২৬-০৯-০১ ০৯:০০"
      }
    ]
  }
];

export const MOCK_FAQS = MOCK_PUTHIA_FAQS;
export const MOCK_TICKETS = MOCK_PUTHIA_TICKETS;

export function getTicketProgressSteps(ticket?: SupportTicket | null): TicketProgressStep[] {
  if (!ticket) return [];
  const status = ticket.status || 'OPEN';
  const isResolved = status === 'RESOLVED' || status === 'CLOSED';
  const isInProgress = status === 'IN_PROGRESS' || isResolved;
  const isOpen = true; // Always submitted

  return [
    {
      title: "টিকিট গ্রহণ ও রেজিস্ট্রেশন",
      desc: "আমাদের পুঠিয়া সাপোর্ট পোর্টালে আপনার অনুরোধটি নিবন্ধিত হয়েছে",
      completed: isOpen,
      date: ticket.createdAt || ""
    },
    {
      title: "সাপোর্ট অফিসার বরাদ্দ ও পর্যালোচনা",
      desc: ticket.assignedTo ? `দায়িত্বপ্রাপ্ত: ${ticket.assignedTo}` : "আমাদের পুঠিয়া টেকনিক্যাল টিম রিভিউ করছে",
      completed: isInProgress,
      date: ticket.updatedAt || ticket.createdAt || ""
    },
    {
      title: "সমাধান ও ডেটা যাচাইকরণ",
      desc: isResolved ? "তথ্য যাচাই ও সমাধান কাজ সম্পন্ন হয়েছে" : "প্রয়োজনীয় সমাধান ও ডেটাবেজ আপডেট চলমান",
      completed: isInProgress,
      date: isInProgress ? (ticket.updatedAt || ticket.createdAt) : undefined
    },
    {
      title: "চূড়ান্ত সমাধান ও টিকেট নিষ্পত্তি",
      desc: isResolved ? "আপনার সমস্যার সমাধান সম্পন্ন হয়েছে" : "সমাধান নিশ্চিত করে টিকেট বন্ধ করা হবে",
      completed: isResolved,
      date: isResolved ? ticket.updatedAt : undefined
    }
  ];
}
