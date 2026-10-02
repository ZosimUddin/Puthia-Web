import React from 'react';
import { 
  FileText, Percent, Landmark, Smartphone, CreditCard, Building, 
  MapPin, HelpCircle, Phone, Globe, ShieldCheck, FileSpreadsheet, 
  Coins, Briefcase, HandCoins, HelpCircle as GuideIcon, ExternalLink
} from 'lucide-react';

export interface QuickActions {
  phone?: string;
  website?: string;
  location?: string;
  guideUrl?: string;
  guideText?: string;
}

export interface FinanceServiceItem {
  id: string;
  name: string;
  banglaName: string;
  subtitle: string;
  icon: string; // Icon name key
  isOfficial?: boolean;
  category: string;
  quickActions: QuickActions;
  subServices?: {
    id: string;
    name: string;
    description: string;
    quickActions: QuickActions;
  }[];
}

export interface FinanceCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  bgLight: string;
  borderLight: string;
}

export const financeCategories: FinanceCategory[] = [
  {
    id: "tax_revenue",
    title: "কর ও রাজস্ব",
    icon: "Coins",
    color: "text-purple-600",
    bgLight: "bg-purple-50/50",
    borderLight: "border-purple-100"
  },
  {
    id: "banking",
    title: "ব্যাংকিং",
    icon: "Landmark",
    color: "text-emerald-600",
    bgLight: "bg-emerald-50/50",
    borderLight: "border-emerald-100"
  },
  {
    id: "digital_payment",
    title: "ডিজিটাল পেমেন্ট",
    icon: "CreditCard",
    color: "text-blue-600",
    bgLight: "bg-blue-50/50",
    borderLight: "border-blue-100"
  },
  {
    id: "business_services",
    title: "ব্যবসায়িক সেবা",
    icon: "Briefcase",
    color: "text-amber-600",
    bgLight: "bg-amber-50/50",
    borderLight: "border-amber-100"
  },
  {
    id: "financial_assistance",
    title: "আর্থিক সহায়তা",
    icon: "HandCoins",
    color: "text-rose-600",
    bgLight: "bg-rose-50/50",
    borderLight: "border-rose-100"
  }
];

export const financeServicesList: FinanceServiceItem[] = [
  {
    id: "income_tax",
    name: "Income Tax",
    banglaName: "আয়কর",
    subtitle: "e-TIN, রিটার্ন দাখিল ও অনলাইন কর পরিশোধ",
    icon: "FileText",
    isOfficial: true,
    category: "tax_revenue",
    quickActions: {
      phone: "09612712200",
      website: "https://etaxnbr.gov.bd",
      location: "https://maps.google.com/?q=National+Board+of+Revenue+Bangladesh",
      guideText: "আয়কর রিটার্ন দেওয়ার জন্য প্রথমে e-TIN নিতে হবে। এরপর প্রতি বছর ৩০শে নভেম্বরের মধ্যে রিটার্ন দাখিল করতে হবে।"
    },
    subServices: [
      {
        id: "etin_reg",
        name: "e-TIN নিবন্ধন",
        description: "জাতীয় পরিচয়পত্র ব্যবহার করে কয়েক মিনিটে নিজের e-TIN সার্টিফিকেট ডাউনলোড করুন।",
        quickActions: {
          website: "https://secure.incometax.gov.bd/TIN/Register",
          phone: "09612712200",
          guideText: "e-TIN পোর্টাল-এ গিয়ে রেজিস্টার করুন। জাতীয় পরিচয়পত্র এবং মোবাইল নম্বর ভেরিফিকেশন সম্পন্ন করলেই বিনামূল্যে TIN পাবেন।"
        }
      },
      {
        id: "ereturn_submit",
        name: "e-Return দাখিল",
        description: "অনলাইনেই সহজে বাৎসরিক আয়কর রিটার্ন পূরণ ও জমা করুন এবং রশিদ প্রিন্ট করুন।",
        quickActions: {
          website: "https://etaxnbr.gov.bd",
          phone: "09612712200",
          guideText: "আপনার TIN এবং বায়োমেট্রিক রেজিস্টার্ড সিম দিয়ে লগইন করুন। আপনার আয়ের তথ্য দিয়ে অনলাইনে ট্যাক্স রিটার্ন দাখিল করুন।"
        }
      },
      {
        id: "tin_verify",
        name: "TIN যাচাই",
        description: "যে কোনো টিআইএন (TIN) নম্বরের সত্যতা এবং ট্যাক্স পেয়ারের তথ্য পরীক্ষা করুন।",
        quickActions: {
          website: "https://secure.incometax.gov.bd/TIN/Verify",
          phone: "09612712200",
          guideText: "TIN নম্বরটি লিখুন এবং সাবমিট বাটনে ক্লিক করে ভেরিফাই করুন।"
        }
      },
      {
        id: "tax_calc",
        name: "কর ক্যালকুলেটর",
        description: "চলতি অর্থ বছরের জন্য আপনার বাৎসরিক আয়ের উপর করের পরিমাণ হিসাব করুন।",
        quickActions: {
          website: "https://nbr.gov.bd/calculator/tax-calculator",
          guideText: "আপনার বাৎসরিক মোট আয় ও কর রেয়াতযোগ্য বিনিয়োগের পরিমাণ দিলে করের পরিমাণ স্বয়ংক্রিয়ভাবে হিসাব হয়ে যাবে।"
        }
      },
      {
        id: "nbr_web",
        name: "NBR ওয়েবসাইট",
        description: "জাতীয় রাজস্ব বোর্ডের অফিসিয়াল পোর্টাল, ফরম এবং সার্কুলার ডাউনলোড করুন।",
        quickActions: {
          website: "https://nbr.gov.bd",
          phone: "09612712200"
        }
      }
    ]
  },
  {
    id: "vat",
    name: "VAT",
    banglaName: "মূল্য সংযোজন কর (VAT)",
    subtitle: "ভ্যাট নিবন্ধন, ভ্যাট রিটার্ন ও বিন যাচাইকরণ",
    icon: "Percent",
    isOfficial: true,
    category: "tax_revenue",
    quickActions: {
      phone: "16120",
      website: "https://vat.gov.bd",
      location: "https://maps.google.com/?q=Customs+Excise+and+VAT+Office",
      guideText: "সকল ব্যবসা প্রতিষ্ঠানের পণ্য বিক্রয় ও সেবার উপর প্রযোজ্য ভ্যাট জমা দেওয়া ও রিটার্ন দাখিল করা আবশ্যক।"
    },
    subServices: [
      {
        id: "vat_reg",
        name: "VAT নিবন্ধন",
        description: "অনলাইনে নতুন ব্যবসা বা প্রতিষ্ঠানের জন্য ভ্যাট (BIN) নিবন্ধন সম্পন্ন করুন।",
        quickActions: {
          website: "https://vat.gov.bd",
          phone: "16120",
          guideText: "প্রয়োজনীয় কাগজপত্র যেমন ট্রেড লাইসেন্স ও ব্যাংক স্টেটমেন্ট আপলোড করে অনলাইনে BIN এর আবেদন করুন।"
        }
      },
      {
        id: "vat_return",
        name: "VAT রিটার্ন",
        description: "বাৎসরিক বা মাসিক ভ্যাট রিটার্ন ফর্ম দাখিল করুন এবং পেমেন্ট চালানের কপি জমা দিন।",
        quickActions: {
          website: "https://vat.gov.bd",
          phone: "16120",
          guideText: "প্রতি মাসের ১৫ তারিখের মধ্যে পূর্ববর্তী মাসের অর্জিত ভ্যাটের রিটার্ন অনলাইনে জমা দিতে হবে।"
        }
      },
      {
        id: "bin_verify",
        name: "BIN যাচাই",
        description: "যে কোনো প্রতিষ্ঠানের ১৩ ডিজিটের ব্যবসায়িক সনাক্তকরণ নম্বর (BIN) ভেরিফাই করুন।",
        quickActions: {
          website: "https://vat.gov.bd",
          guideText: "BIN নম্বর দিয়ে অনলাইনে প্রতিষ্ঠানের আইনি স্থিতি ও সঠিকতা যাচাই করতে পারেন।"
        }
      },
      {
        id: "vat_guide",
        name: "VAT নির্দেশিকা",
        description: "ভ্যাট প্রদানের নিয়মাবলী, ফরম এবং ট্যাক্স হারের বিস্তারিত নির্দেশিকা।",
        quickActions: {
          website: "https://nbr.gov.bd/vat/guidelines"
        }
      }
    ]
  },
  {
    id: "banking_sec",
    name: "Banking",
    banglaName: "ব্যাংকিং সেবা",
    subtitle: "সরকারি, বেসরকারি ও ইসলামী ব্যাংক ের বিস্তারিত তথ্য ও এটিএম",
    icon: "Landmark",
    isOfficial: true,
    category: "banking",
    quickActions: {
      phone: "16236", // Bangladesh Bank
      website: "https://www.bb.org.bd",
      location: "https://maps.google.com/?q=Puthia+Upazila+Banks",
      guideText: "পুঠিয়া উপজেলার বিভিন্ন সরকারি ও বেসরকারি ব্যাংকের শাখাগুলোর অবস্থান ও যোগাযোগের মাধ্যম খুঁজুন।"
    },
    subServices: [
      {
        id: "govt_banks",
        name: "সরকারি ব্যাংক",
        description: "সোনালী ব্যাংক, অগ্রণী ব্যাংক এবং রাকাব এর পুঠিয়া শাখার তথ্য ও ঠিকানা।",
        quickActions: {
          website: "https://www.sonalibank.com.bd",
          phone: "01700-000011",
          location: "https://maps.google.com/?q=Sonali+Bank+Puthia+Branch"
        }
      },
      {
        id: "private_banks",
        name: "বেসরকারি ব্যাংক",
        description: "পূবালী ব্যাংক, ডাচ-বাংলা ব্যাংক এবং অন্যান্য বেসরকারি ব্যাংকের বিস্তারিত গাইড।",
        quickActions: {
          website: "https://www.pubalibangla.com",
          phone: "01700-000113",
          location: "https://maps.google.com/?q=Pubali+Bank+Puthia"
        }
      },
      {
        id: "islamic_banks",
        name: "ইসলামী ব্যাংক",
        description: "ইসলামী ব্যাংক বাংলাদেশ পিএলসি-সহ শরিয়াহ ভিত্তিক পরিচালিত ব্যাংক ের তালিকা।",
        quickActions: {
          website: "https://www.islamibankbd.com",
          phone: "01700-000111",
          location: "https://maps.google.com/?q=Islami+Bank+Puthia"
        }
      },
      {
        id: "bank_locations",
        name: "ব্যাংকের লোকেশন",
        description: "পুঠিয়া উপজেলার সকল ব্যাংক শাখার গুগল ম্যাপস লোকেশন ও জিপিএস নেভিগেশন।",
        quickActions: {
          location: "https://maps.google.com/?q=Banks+in+Puthia+Upazila"
        }
      },
      {
        id: "atm_locator",
        name: "ATM লোকেটর",
        description: "পুঠিয়া উপজেলার বিভিন্ন ব্যাংক ের ২৪ ঘণ্টা চালু থাকা এটিএম বুথের অবস্থান।",
        quickActions: {
          location: "https://maps.google.com/?q=ATM+Booths+in+Puthia+Upazila"
        }
      }
    ]
  },
  {
    id: "mobile_banking",
    name: "Mobile Banking",
    banglaName: "মোবাইল ব্যাংকিং (MFS)",
    subtitle: "বিকাশ, নগদ, রকেট, উপায় ও মোবাইল ওয়ালেট গাইড",
    icon: "Smartphone",
    isOfficial: true,
    category: "banking",
    quickActions: {
      phone: "16247",
      website: "https://www.bkash.com",
      guideText: "মোবাইল ব্যাংকিং বা MFS এর মাধ্যমে দেশের যেকোনো প্রান্তে সহজেই মুহূর্তে টাকা লেনদেন করতে পারবেন।"
    },
    subServices: [
      {
        id: "mfs_bkash",
        name: "বিকাশ (bKash)",
        description: "অ্যাকাউন্ট খোলার নিয়ম, ট্যারিফ এবং এজেন্টের তথ্য। হেল্পলাইন ১৬২৪৭।",
        quickActions: {
          website: "https://www.bkash.com",
          phone: "16247",
          location: "https://maps.google.com/?q=bKash+Customer+Care+Puthia"
        }
      },
      {
        id: "mfs_nagad",
        name: "নগদ (Nagad)",
        description: "সবচেয়ে কম খরচে টাকা ক্যাশ-আউট ও সেন্ড মানি করুন। হেল্পলাইন ১৬১৬৭।",
        quickActions: {
          website: "https://www.nagad.com.bd",
          phone: "16167"
        }
      },
      {
        id: "mfs_rocket",
        name: "রকেট (Rocket)",
        description: "ডাচ-বাংলা ব্যাংকের নিরাপদ মোবাইল ওয়ালেট সুবিধা। হেল্পলাইন ১৬২১৬।",
        quickActions: {
          website: "https://www.dutchbanglabank.com/rocket",
          phone: "16216"
        }
      },
      {
        id: "mfs_upay",
        name: "উপায় (upay)",
        description: "ইউসিবি ব্যাংকের মোবাইল ফিন্যান্সিয়াল সার্ভিস। হেল্পলাইন ১৬২৬৮।",
        quickActions: {
          website: "https://www.upaybd.com",
          phone: "16268"
        }
      },
      {
        id: "nexus_pay",
        name: "ডাচ-বাংলা Nexus Pay",
        description: "ডাচ-বাংলা ব্যাংকের নেক্সাস কার্ড ম্যানেজমেন্ট অ্যাপ ও কিউআর পেমেন্ট।",
        quickActions: {
          website: "https://www.dutchbanglabank.com/nexuspay",
          phone: "16216"
        }
      }
    ]
  },
  {
    id: "etin",
    name: "e-TIN",
    banglaName: "e-TIN নিবন্ধন ও কপি",
    subtitle: "সহজেই অনলাইনে ইলেকট্রনিক করদাতা শনাক্তকরণ নম্বর গ্রহণ করুন",
    icon: "FileText",
    isOfficial: true,
    category: "tax_revenue",
    quickActions: {
      website: "https://secure.incometax.gov.bd/TIN/Register",
      phone: "09612712200",
      guideText: "অনলাইনে e-TIN রেজিস্টার করার পর তা ডাউনলোড করে বিভিন্ন কাজের সাবমিশন করতে পারবেন।"
    }
  },
  {
    id: "tin_verify_direct",
    name: "TIN যাচাই সরাসরি",
    banglaName: "TIN ভেরিফিকেশন",
    subtitle: "অনলাইনে করদাতার নাম ও তথ্যের সঠিকতা পরীক্ষা করুন",
    icon: "ShieldCheck",
    isOfficial: true,
    category: "tax_revenue",
    quickActions: {
      website: "https://secure.incometax.gov.bd/TIN/Verify"
    }
  },
  {
    id: "ereturn_direct",
    name: "e-Return দাখিল",
    banglaName: "অনলাইন আয়কর রিটার্ন",
    subtitle: "কাগজবিহীন ডিজিটাল আয়কর জমা ও প্রত্যয়ন পত্র গ্রহণ",
    icon: "FileSpreadsheet",
    isOfficial: true,
    category: "tax_revenue",
    quickActions: {
      website: "https://etaxnbr.gov.bd",
      phone: "09612712200"
    }
  },
  {
    id: "nbr_direct",
    name: "NBR",
    banglaName: "জাতীয় রাজস্ব বোর্ড (NBR)",
    subtitle: "কর, ভ্যাট, শুল্ক সংক্রান্ত সকল আইন ও বিজ্ঞপ্তি",
    icon: "Coins",
    isOfficial: true,
    category: "tax_revenue",
    quickActions: {
      website: "https://nbr.gov.bd",
      phone: "09612712200"
    }
  },
  {
    id: "atm_booth_direct",
    name: "ATM Booth",
    banglaName: "এটিএম বুথ",
    subtitle: "পুঠিয়া বাজার ও বানেশ্বরে অবস্থিত সকল ব্যাংকের এটিএম",
    icon: "CreditCard",
    category: "banking",
    quickActions: {
      location: "https://maps.google.com/?q=ATM+in+Puthia+Rajshahi",
      guideText: "বানেশ্বর ও পুঠিয়া সদরের প্রধান এটিএম বুথগুলো ২৪ ঘণ্টা খোলা থাকে।"
    }
  },
  {
    id: "branch_locator",
    name: "Bank Branch Locator",
    banglaName: "ব্যাংক শাখা লোকেটর",
    subtitle: "নিকটবর্তী ব্যাংকের ঠিকানা ও গুগল ম্যাপ লোকেশন",
    icon: "MapPin",
    category: "banking",
    quickActions: {
      location: "https://maps.google.com/?q=Banks+in+Puthia+Upazila"
    }
  },
  {
    id: "online_banking",
    name: "Online Banking",
    banglaName: "অনলাইন ব্যাংকিং পোর্টাল",
    subtitle: "ইন্টারনেট ব্যাংকিং, সেলফিন, এবং ব্যাংক অ্যাপস সুবিধা",
    icon: "Globe",
    category: "banking",
    quickActions: {
      website: "https://www.islamibankbd.com",
      guideText: "অনলাইন ব্যাংকিং চালু করতে আপনার নিজ ব্যাংক শাখায় যোগাযোগ করে ইন্টারনেট ব্যাংকিং অ্যাক্টিভ করুন।"
    }
  },
  {
    id: "bkash_direct",
    name: "bKash",
    banglaName: "বিকাশ সেবা",
    subtitle: "দেশের বৃহত্তম ও নিরাপদ মোবাইল ফিন্যান্সিয়াল সার্ভিস",
    icon: "Smartphone",
    category: "digital_payment",
    quickActions: {
      website: "https://www.bkash.com",
      phone: "16247",
      location: "https://maps.google.com/?q=bKash+Agent+Puthia"
    }
  },
  {
    id: "nagad_direct",
    name: "Nagad",
    banglaName: "নগদ সেবা",
    subtitle: "ডাক বিভাগের ডিজিটাল ফাইন্যান্সিয়াল সার্ভিস",
    icon: "Smartphone",
    category: "digital_payment",
    quickActions: {
      website: "https://www.nagad.com.bd",
      phone: "16167"
    }
  },
  {
    id: "rocket_direct",
    name: "Rocket",
    banglaName: "রকেট পেমেন্ট",
    subtitle: "ডিবিবিএল এর বিশ্বস্ত মোবাইল ব্যাংকিং সেবা",
    icon: "Smartphone",
    category: "digital_payment",
    quickActions: {
      website: "https://www.dutchbanglabank.com/rocket",
      phone: "16216"
    }
  },
  {
    id: "upay_direct",
    name: "upay",
    banglaName: "উপায় পেমেন্ট",
    subtitle: "নিরাপদ মোবাইল ওয়ালেট ও ইউটিলিটি বিল পে",
    icon: "Smartphone",
    category: "digital_payment",
    quickActions: {
      website: "https://www.upaybd.com",
      phone: "16268"
    }
  },
  {
    id: "sonali_esheva",
    name: "Sonali e-Sheba",
    banglaName: "সোনালী ই-সেবা",
    subtitle: "সরকারি ফি, চালান, ভর্তি এবং অন্যান্য বিল পরিশোধ পোর্টাল",
    icon: "Globe",
    isOfficial: true,
    category: "digital_payment",
    quickActions: {
      website: "https://sone-seva.sonalibank.com.bd",
      phone: "16639",
      guideText: "সোনালী ই-সেবার মাধ্যমে কলেজ ভর্তি, পাসপোর্ট ফি এবং সরকারি ভ্যাটের টাকা সহজেই চালানের মাধ্যমে দেওয়া যায়।"
    }
  },
  {
    id: "trade_license",
    name: "Trade License",
    banglaName: "ট্রেড লাইসেন্স",
    subtitle: "ইউনিয়ন বা পৌরসভা থেকে ব্যবসা পরিচালনার অনুমতি সনদ",
    icon: "FileText",
    isOfficial: true,
    category: "business_services",
    quickActions: {
      website: "https://etradelicense.gov.bd",
      phone: "333",
      guideText: "অনলাইনে আবেদনের জন্য ই-ট্রেড লাইসেন্স পোর্টেলে প্রবেশ করুন, ইউনিয়ন পরিষদ পুঠিয়া সিলেক্ট করে প্রয়োজনীয় কাগজপত্র সাবমিট করুন।"
    }
  },
  {
    id: "rjsc",
    name: "RJSC",
    banglaName: "কোম্পানি ও পার্টনারশিপ নিবন্ধন (RJSC)",
    subtitle: "যৌথ মূলধন কোম্পানি ও ফার্মের পরিদপ্তর পোর্টাল",
    icon: "Building",
    isOfficial: true,
    category: "business_services",
    quickActions: {
      website: "https://roc.gov.bd",
      phone: "02-55013791",
      guideText: "কোম্পানির নাম ছাড়পত্র (Name Clearance) ও কোম্পানি নিবন্ধনের যাবতীয় কাজ অনলাইনেই সম্পন্ন করা যায়।"
    }
  },
  {
    id: "business_reg",
    name: "Business Registration",
    banglaName: "ব্যবসা নিবন্ধন (e-GP / SME)",
    subtitle: "অনলাইনে ক্ষুদ্র ও মাঝারি শিল্পের জন্য বিসিক ও উদ্যোক্তা সনদ",
    icon: "Briefcase",
    isOfficial: true,
    category: "business_services",
    quickActions: {
      website: "http://www.smef.gov.bd",
      guideText: "ক্ষুদ্র ও কুটির শিল্প কর্পোরেশন (বিসিক) অথবা এসএমই ফাউন্ডেশন পোর্টালে গিয়ে উদ্যোক্তা হিসেবে নিজের ব্যবসা নিবন্ধন করতে পারেন।"
    }
  },
  {
    id: "company_reg",
    name: "Company Registration",
    banglaName: "কোম্পানি নিবন্ধন গাইড",
    subtitle: "লিমিটেড বা অংশীদারি ব্যবসার আইনি ছাড়পত্র ও রেজিস্ট্রেশন",
    icon: "FileText",
    category: "business_services",
    quickActions: {
      website: "https://roc.gov.bd",
      guideText: "প্রথমে নাম ক্লিয়ারেন্স নিতে হবে, এরপর কোম্পানির মেমোরেন্ডাম তৈরি করে নিবন্ধন ফি পরিশোধ পূর্বক সাবমিট করতে হবে।"
    }
  },
  {
    id: "agriculture_loan",
    name: "Agriculture Loan",
    banglaName: "কৃষি ঋণ",
    subtitle: "ফসলের আবাদ, পোল্ট্রি ও মৎস্য চাষের জন্য স্বল্প সুদে সরকারি লোন",
    icon: "HandCoins",
    category: "financial_assistance",
    quickActions: {
      website: "http://www.rakub.org.bd",
      phone: "01700-000015",
      location: "https://maps.google.com/?q=Rakub+Bank+Puthia+Branch",
      guideText: "রাকাব ব্যাংক ও সোনালী ব্যাংক পুঠিয়া শাখা থেকে স্বল্প সুদে ৪% হারে ডাল, তেলবীজ ও মসলা চাষের জন্য বিশেষ কৃষি ঋণ দেওয়া হয়ে থাকে।"
    }
  },
  {
    id: "sme_loan",
    name: "SME Loan",
    banglaName: "এসএমই ঋণ",
    subtitle: "নতুন ব্যবসা ও তরুণ উদ্যোক্তাদের জন্য জামানতবিহীন লোন গাইড",
    icon: "HandCoins",
    category: "financial_assistance",
    quickActions: {
      website: "http://www.smef.gov.bd",
      guideText: "ক্ষুদ্র ও মাঝারি কুটির শিল্পের উদ্যোক্তাদের জন্য সোনালী, পূবালী ও অগ্রণী ব্যাংক বিভিন্ন সহজ কিস্তিতে এসএমই লোন দিয়ে থাকে।"
    }
  },
  {
    id: "remittance",
    name: "Remittance",
    banglaName: "প্রবাসী রেমিট্যান্স",
    subtitle: "বৈধ চ্যানেলে প্রবাসী আয় পাঠানো ও ২.৫% সরকারি প্রণোদনা তথ্য",
    icon: "Coins",
    category: "financial_assistance",
    quickActions: {
      website: "https://www.bb.org.bd",
      guideText: "বৈধ ব্যাংকিং চ্যানেলে রেমিট্যান্স পাঠালে ২.৫% হারে সরকারি নগদ প্রণোদনা সরাসরি আপনার ব্যাংক অ্যাকাউন্টে জমা হবে।"
    }
  },
  {
    id: "govt_grants",
    name: "Government Grants",
    banglaName: "সরকারি অনুদান ও সাহায্য",
    subtitle: "সমাজকল্যাণ, দূর্যোগ ত্রাণ ও অসচ্ছল পরিবারের জন্য অনুদানের আবেদন",
    icon: "HandCoins",
    isOfficial: true,
    category: "financial_assistance",
    quickActions: {
      website: "https://bangladesh.gov.bd",
      phone: "333",
      guideText: "জাতীয় তথ্য বাতায়ন অথবা সমাজসেবা অধিদপ্তরের মাধ্যমে বিভিন্ন অনুদানের বিজ্ঞপ্তি প্রকাশিত হয়, যা অনলাইনে আবেদনযোগ্য।"
    }
  }
];
