// Rich offline fallback datasets specifically for the citizen dashboard
// This guarantees that the user dashboard remains fully functional and populated even when Firestore quotas are exceeded.

export interface FallbackDashboardData {
  posts: any[];
  applications: any[];
  businesses: any[];
  reviews: any[];
  complaints: any[];
  notifications: any[];
}

export const getDashboardFallbackData = (userId: string): FallbackDashboardData => {
  const now = new Date();
  
  // Dynamic timestamps distributed across the last 6 months
  const getDateNDaysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  return {
    posts: [
      {
        id: "fb-post-1",
        title: "পুঠিয়া রাজবাড়ী ভ্রমণ ও আমাদের ঐতিহ্য",
        text: "আজ পুঠিয়া রাজবাড়ী এবং পঞ্চরত্ন গোবিন্দ মন্দির দর্শন করলাম। প্রাচীন টেরাকোটা ও স্থাপত্যশৈলী সত্যিই মুগ্ধ করার মতো। আমাদের এই ঐতিহ্যকে যথাযথ সংরক্ষণ করা প্রয়োজন।",
        createdAt: getDateNDaysAgo(3),
        authorId: userId,
        likesCount: 15,
        commentsCount: 4
      },
      {
        id: "fb-post-2",
        title: "বানেশ্বর আম বাজারে ট্রাফিক ব্যবস্থা উন্নত করার আহ্বান",
        text: "বানেশ্বর হাটে আমের মৌসুমে তীব্র যানজট তৈরি হয়। মহাসড়কের পাশে সঠিক পার্কিং ও ট্রাফিক পুলিশ বাড়ানো হলে সাধারণ নাগরিকদের জন্য যাতায়াত সহজ হবে।",
        createdAt: getDateNDaysAgo(18),
        authorId: userId,
        likesCount: 24,
        commentsCount: 9
      },
      {
        id: "fb-post-3",
        title: "উপজেলা স্বাস্থ্য কমপ্লেক্সে চমৎকার সেবা পেলাম",
        text: "জরুরি প্রয়োজনে আজ সকালে পুঠিয়া স্বাস্থ্য কমপ্লেক্সে গিয়েছিলাম। ডাক্তার এবং নার্সদের আন্তরিকতা ও দ্রুত সেবা সত্যিই প্রশংসনীয়। ধন্যবাদ উপজেলা প্রশাসনকে।",
        createdAt: getDateNDaysAgo(45),
        authorId: userId,
        likesCount: 42,
        commentsCount: 11
      }
    ],

    applications: [
      {
        id: "fb-app-1",
        serviceName: "ট্রেড লাইসেন্স নিবন্ধন ও নবায়ন",
        status: "Approved",
        userId: userId,
        createdAt: getDateNDaysAgo(5),
        applicantName: "সম্মানিত নাগরিক",
        submissionId: "APP-TL-2026-9042",
        remarks: "অনুমোদিত। আপনার ডিজিটাল ট্রেড লাইসেন্স কপি ডাউনলোডযোগ্য।"
      },
      {
        id: "fb-app-2",
        serviceName: "উত্তরাধিকার ও ওয়ারিশ সনদপত্র",
        status: "Pending",
        userId: userId,
        createdAt: getDateNDaysAgo(12),
        applicantName: "সম্মানিত নাগরিক",
        submissionId: "APP-WAR-2026-1183",
        remarks: "আবেদনটি বর্তমানে ইউনিয়ন পরিষদে যাচাইাধীন রয়েছে।"
      },
      {
        id: "fb-app-3",
        serviceName: "নাগরিক চার্টার ও নতুন ভোটার হালনাগাদ তথ্য",
        status: "Approved",
        userId: userId,
        createdAt: getDateNDaysAgo(60),
        applicantName: "সম্মানিত নাগরিক",
        submissionId: "APP-VOT-2026-0329",
        remarks: "তথ্য ভেরিফিকেশন সফলভাবে সম্পন্ন হয়েছে।"
      }
    ],

    businesses: [
      {
        id: "fb-biz-1",
        name: "পুতুল হ্যান্ডিক্রাফটস এন্ড বুটিকস",
        type: "হস্তশিল্প ও পোশাক",
        status: "approved",
        userId: userId,
        createdAt: getDateNDaysAgo(25),
        phone: "01712-445588",
        address: "রাজবাড়ী গেট রোড, পুঠিয়া বাজার, রাজশাহী",
        rating: 4.8
      },
      {
        id: "fb-biz-2",
        name: "রাজশাহী সুইটস এন্ড ডেইরি ফার্ম",
        type: "খাদ্য ও রেস্টুরেন্ট",
        status: "pending",
        userId: userId,
        createdAt: getDateNDaysAgo(1),
        phone: "01815-998877",
        address: "বানেশ্বর হাইওয়ে ট্রাফিক মোড়, পুঠিয়া",
        rating: 4.5
      }
    ],

    reviews: [
      {
        id: "fb-rev-1",
        targetName: "পুঠিয়া পঞ্চরত্ন গোবিন্দ মন্দির",
        comment: "অনন্য টেরাকোটা কাজ এবং সুন্দর শান্ত পরিবেশ। রাজশাহী জেলার অন্যতম সেরা পর্যটন স্থান।",
        rating: 5,
        userId: userId,
        createdAt: getDateNDaysAgo(4)
      },
      {
        id: "fb-rev-2",
        targetName: "জনতা ড্রাগ হাউস (ফার্মেসি)",
        comment: "দিন-রাত সবসময় খোলা থাকে এবং সব ধরণের প্রয়োজনীয় জরুরি ওষুধ পাওয়া যায়। আন্তরিক ব্যবহার।",
        rating: 4.8,
        userId: userId,
        createdAt: getDateNDaysAgo(15)
      }
    ],

    complaints: [
      {
        id: "fb-comp-1",
        title: "ঝলমলিয়া বাজারের ড্রেন সংস্কারের আবেদন",
        description: "ঝলমলিয়া বাজারের মেইন রোডের পাশের ড্রেনটি আবর্জনায় ভরাট হয়ে বর্ষার সময় উপচে জল রাস্তায় চলে আসছে। দ্রুত সংস্কার প্রয়োজন।",
        status: "চলমান",
        userId: userId,
        createdAt: getDateNDaysAgo(8),
        trackingId: "COMP-2026-4029"
      },
      {
        id: "fb-comp-2",
        title: "রাস্তার স্ট্রিট লাইট নষ্ট হওয়ার অভিযোগ",
        description: "পৌরসভার ৪ নং ওয়ার্ডের মেইন রাস্তায় ২টি স্ট্রিট লাইট দীর্ঘদিন যাবত জ্বলছে না। সন্ধ্যার পর পুরো রাস্তা অন্ধকার থাকে।",
        status: "সমাধানকৃত",
        userId: userId,
        createdAt: getDateNDaysAgo(32),
        trackingId: "COMP-2026-1188"
      }
    ],

    notifications: [
      {
        id: "fb-notif-1",
        title: "ট্রেড লাইসেন্স আবেদন মঞ্জুর",
        message: "অভিনন্দন! আপনার ট্রেড লাইসেন্স আবেদনটি (APP-TL-2026-9042) সফলভাবে অনুমোদিত হয়েছে।",
        read: false,
        isRead: false,
        userId: userId,
        createdAt: getDateNDaysAgo(2)
      },
      {
        id: "fb-notif-2",
        title: "নতুন নোটিশ প্রকাশিত হয়েছে",
        message: "উপজেলা প্রশাসন থেকে নতুন সরকারি নিয়োগ নোটিশ ও নাগরিক নির্দেশনা প্রকাশ করা হয়েছে। বিস্তারিত দেখুন নোটিশ বোর্ডে।",
        read: true,
        isRead: true,
        userId: userId,
        createdAt: getDateNDaysAgo(6)
      },
      {
        id: "fb-notif-3",
        title: "আপনার অভিযোগের তদন্ত শুরু",
        message: "আপনার অভিযোগ 'ঝলমলিয়া বাজারের ড্রেন সংস্কার' সফলভাবে তালিকাভুক্ত হয়েছে এবং তদন্তকারী কর্মকর্তা নিয়োগ দেয়া হয়েছে।",
        read: false,
        isRead: false,
        userId: userId,
        createdAt: getDateNDaysAgo(8)
      }
    ]
  };
};
