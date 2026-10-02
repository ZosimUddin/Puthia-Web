import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import ModulePageLayout from '../../components/common/ModulePageLayout';
import { 
  Bell, BellOff, X, Send, AlertCircle, CheckCircle2, Info, Pin, Clock, ShieldCheck, 
  Sparkles, Megaphone, Zap, Trash2, Edit, Smartphone, Settings, Volume2, VolumeX, Check, Search, Loader2, ChevronRight,
  Calendar, MapPin, Phone, Eye, ThumbsUp, Share2, Download, ChevronLeft, FileText, Heart, ArrowLeft,
  Landmark, GraduationCap, MessageCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, deleteDoc, doc, setDoc, serverTimestamp 
} from "firebase/firestore";
import { playNotificationChime } from '../../components/PushNotificationListener';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';

const toBanglaNumber = (num: number | string) => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (digit) => {
    return banglaDigits[parseInt(digit)];
  });
};

const getNoticeDetails = (notice: any) => {
  const text = notice.text || '';
  const category = notice.category || 'অন্যান্য';
  
  if (text.includes('কৃষি') || text.includes('সার') || text.includes('প্রণোদনা') || text.includes('কৃষক') || category === 'গুরুত্বপূর্ণ') {
    return {
      category: 'গুরুত্বপূর্ণ',
      title: 'কৃষি প্রণোদনার জন্য আবেদন শুরু',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop',
      description: 'কৃষি প্রণোদনা কর্মসূচির আওতায় আগ্রহী কৃষকদের জন্য আবেদন প্রক্রিয়া শুরু হয়েছে। এই কর্মসূচির মাধ্যমে কৃষকদের উন্নত কৃষি যন্ত্রপাতি ও সার ক্রয়ে সহায়তা প্রদান করা হবে।',
      eligibility: [
        'বাংলাদেশের স্থায়ী নাগরিক হতে হবে',
        'কৃষি কাজের সাথে সম্পৃক্ত হতে হবে',
        'সকল প্রয়োজনীয় কাগজপত্র জমা দিতে হবে'
      ],
      deadline: '৩১ মে ২০২৪',
      location: 'উপজেলা কৃষি অফিস, পুঠিয়া, রাজশাহী',
      phone: '০১৭১২-৩৪৫৬৭৮',
      pdfSize: '248 KB',
      views: 1245,
      likes: 120,
      hearts: 85
    };
  }
  
  if (text.includes('ইউনিয়ন পরিষদ') || text.includes('বিশেষ সভা') || text.includes('সভা') || category === 'সরকারি') {
    return {
      category: 'সরকারি',
      title: 'ইউনিয়ন পরিষদের বিশেষ সভা',
      image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop',
      description: 'পুঠিয়া ইউনিয়ন পরিষদের উন্নয়নমূলক কাজের পর্যালোচনা এবং আগামী অর্থবছরের বাজেট প্রণয়নের লক্ষ্যে একটি বিশেষ সভার আয়োজন করা হয়েছে। পরিষদের সকল সদস্যকে যথাসময়ে উপস্থিত থাকার জন্য অনুরোধ করা হচ্ছে।',
      eligibility: [
        'ইউনিয়ন পরিষদের সকল সম্মানিত সদস্যবৃন্দ',
        'আমন্ত্রিত বিশেষ অতিথিবৃন্দ',
        'স্থানীয় সচেতন নাগরিক সমাজ'
      ],
      deadline: '১৬ মে ২০২৪, ১১:০০ AM',
      location: 'পুঠিয়া ইউনিয়ন পরিষদ মিলনায়তন',
      phone: '০১৭১৩-৯০০০১১',
      pdfSize: '150 KB',
      views: 890,
      likes: 95,
      hearts: 40
    };
  }

  if (text.includes('টিকা') || text.includes('স্বাস্থ্য') || text.includes('হাসপাতাল') || text.includes('ক্যাম্প') || category === 'স্বাস্থ্য') {
    return {
      category: 'স্বাস্থ্য',
      title: 'বিনামূল্যে স্বাস্থ্যসেবা ও টিকা ক্যাম্প',
      image: 'https://images.unsplash.com/photo-1584515979956-de1510f2791e?w=800&auto=format&fit=crop',
      description: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্সের উদ্যোগে আগামী সপ্তাহে একটি বিনামূল্যে স্বাস্থ্যসেবা ও টিকা ক্যাম্প অনুষ্ঠিত হবে। ক্যাম্পেইন চলাকালীন সকল নাগরিকদের জন্য বিনামূল্যে রক্তচাপ পরীক্ষা, ডায়াবেটিস পরীক্ষা এবং প্রয়োজনীয় টিকা প্রদান করা হবে।',
      eligibility: [
        'পুঠিয়া উপজেলার সকল স্থায়ী বাসিন্দা',
        'শিশুদের ও গর্ভবতী মায়েদের অগ্রাধিকার দেওয়া হবে',
        'জাতীয় পরিচয়পত্র বা জন্ম নিবন্ধন সনদ সাথে আনতে হবে'
      ],
      deadline: '২০ মে ২০২৪',
      location: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স',
      phone: '০১৭১২-৩৪৫৬৭৯',
      pdfSize: '190 KB',
      views: 1450,
      likes: 135,
      hearts: 70
    };
  }

  if (text.includes('বিদ্যুৎ') || text.includes('লোড়শেডিং') || text.includes('লোডশেডিং') || category === 'বিদ্যুৎ') {
    return {
      category: 'বিদ্যুৎ ঘোষণা',
      title: 'জরুরী বিদ্যুৎ উন্নয়ন ও সংস্কার কার্যক্রম',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
      description: 'বিদ্যুৎ লাইনের জরুরী উন্নয়ন ও সংস্কার কাজের জন্য পুঠিয়া সদর ও সংলগ্ন এলাকায় সাময়িক বিদ্যুৎ সরবরাহ বন্ধ থাকবে। সাময়িক এই অসুবিধার জন্য আন্তরিকভাবে দুঃখিত।',
      eligibility: [
        'জরুরী প্রয়োজনে বিকল্প আলোর ব্যবস্থা রাখুন',
        'যেকোনো জরুরি সমস্যায় বিদ্যুৎ অভিযোগ কেন্দ্রে যোগাযোগ করুন'
      ],
      deadline: 'আজ বিকাল ৫:০০ টা পর্যন্ত',
      location: 'পৌরসভা বিদ্যুৎ অভিযোগ কেন্দ্র, পুঠিয়া',
      phone: '০১৭২২-১১২২৩৩',
      pdfSize: '120 KB',
      views: 945,
      likes: 42,
      hearts: 12
    };
  }

  if (text.includes('আবহাওয়া') || text.includes('বৃষ্টি') || text.includes('বন্যা') || text.includes('ঝড়') || text.includes('ঝড়-বৃষ্টি') || category === 'আবহাওয়া') {
    return {
      category: 'আবহাওয়া সতর্কবার্তা',
      title: 'ভারী বৃষ্টিপাত ও আবহাওয়া সতর্কবার্তা',
      image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&auto=format&fit=crop',
      description: 'আবহাওয়া অধিদপ্তরের পূর্বাবাস অনুযায়ী পুঠিয়া ও পার্শ্ববর্তী এলাকায় বজ্রসহ ভারী বৃষ্টিপাতের সম্ভাবনা রয়েছে। নদী তীরবর্তী এলাকার বাসিন্দাদের নিরাপদ আশ্রয়স্থলে থাকার জন্য এবং সাধারণ মানুষকে অপ্রয়োজনে বাড়ির বাইরে না বের হওয়ার জন্য অনুরোধ করা হচ্ছে।',
      eligibility: [
        'বজ্রপাতের সময় খোলা জায়গায় বা গাছের নিচে দাঁড়ানো থেকে বিরত থাকুন',
        'জরুরী প্রয়োজনে উপজেলা নিয়ন্ত্রণ কক্ষে যোগাযোগ করুন',
        'গবাদি পশু ও ফসল নিরাপদ স্থানে সরিয়ে রাখুন'
      ],
      deadline: 'পরবর্তী ৪৮ ঘণ্টা',
      location: 'উপজেলা দুর্যোগ ব্যবস্থাপনা নিয়ন্ত্রণ কক্ষ, পুঠিয়া',
      phone: '০১৭১১-২২৩৩৪৪',
      pdfSize: '310 KB',
      views: 2120,
      likes: 189,
      hearts: 54
    };
  }

  if (text.includes('স্কলারশিপ') || text.includes('শিক্ষা') || text.includes('আবেদন বিজ্ঞপ্তি') || text.includes('পরীক্ষা') || category === 'শিক্ষা') {
    return {
      category: 'শিক্ষা',
      title: 'স্কলারশিপ আবেদন বিজ্ঞপ্তি',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop',
      description: 'পুঠিয়া উপজেলার মেধাবী ও অসচ্ছল শিক্ষার্থীদের জন্য বার্ষিক স্কলারশিপ কর্মসূচির আবেদন আহ্বান করা যাচ্ছে। নির্বাচিত শিক্ষার্থীদের শিক্ষাবর্ষের সকল ব্যয়ভার বহন করা হবে।',
      eligibility: [
        'উপজেলার সরকারি/অনুমোদিত স্কুলের শিক্ষার্থী হতে হবে',
        'বিগত পরীক্ষায় ন্যূনতম জিপিএ ৪.৫ থাকতে হবে',
        'পরিবারের বার্ষিক আয় নির্দিষ্ট সীমার মধ্যে হতে হবে'
      ],
      deadline: '৩০ মে ২০২৪',
      location: 'উপজেলা শিক্ষা অফিস, পুঠিয়া',
      phone: '০১৭১৪-৫৫৬৬৭৭',
      pdfSize: '180 KB',
      views: 1040,
      likes: 110,
      hearts: 65
    };
  }

  if (text.includes('ছুটি') || text.includes('ঈদ') || text.includes('পূজা') || category === 'ছুটি') {
    return {
      category: 'ছুটি',
      title: 'পবিত্র ঈদ উপলক্ষে সরকারি ছুটি',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop',
      description: 'পবিত্র ঈদ-উল-আযহা উপলক্ষে পুঠিয়া পৌরসভা ও উপজেলা পরিষদের সকল প্রশাসনিক কার্যালয় বন্ধ থাকবে। তবে জরুরী পানি ও পরিচ্ছন্নতা সেবা চালু থাকবে।',
      eligibility: [
        'পৌরসভার সকল সাধারণ কর্মকর্তা ও কর্মচারী',
        'জরুরি সেবা বিভাগ ব্যতিরেকে',
        'ছুটি চলাকালীন নিরাপত্তা ব্যবস্থা জোরদার থাকবে'
      ],
      deadline: '২৭ মে - ৩১ মে ২০২৪',
      location: 'পুঠিয়া পৌরসভা কার্যালয়',
      phone: '০১৭২২-১১২২৩৩',
      pdfSize: '110 KB',
      views: 750,
      likes: 68,
      hearts: 30
    };
  }

  // Fallback for general notices
  return {
    category: category,
    title: text || 'সাধারণ ঘোষণা',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop',
    description: 'উপজেলা প্রশাসন ও পুঠিয়া পৌরসভার পক্ষ থেকে সকল নাগরিকের অবগতির জন্য এই বিজ্ঞপ্তি প্রকাশ করা হলো। বিস্তারিত তথ্যের জন্য নিম্নে প্রদত্ত ঠিকানায় অথবা মোবাইল নাম্বারে যোগাযোগ করার জন্য অনুরোধ করা যাচ্ছে।',
    eligibility: [
      'পুঠিয়া উপজেলার সকল সম্মানিত নাগরিকবৃন্দ',
      'প্রয়োজনীয় নথিপত্র (প্রযোজ্য ক্ষেত্রে) সাথে রাখুন',
      'সরকারি স্বাস্থ্যবিধি ও নির্দেশনা মেনে চলুন'
    ],
    deadline: 'চলতি মাসের শেষ কর্মদিবস',
    location: 'উপজেলা পরিষদ কার্যালয়, পুঠিয়া, রাজশাহী',
    phone: '০১৭১৩-৯০০০১১',
    pdfSize: '150 KB',
    views: 450,
    likes: 38,
    hearts: 15
  };
};

const FALLBACK_NOTICES: NoticeItem[] = [
  {
    id: 'notice-1',
    text: 'পুঠিয়া উপজেলায় উন্নয়নের ধারা অব্যাহত রাখতে সবাইকে একসাথে কাজ করতে হবে।',
    category: 'জরুরি ঘোষণা',
    sender: 'উপজেলা প্রশাসন',
    severity: 'critical',
    color: '#ef4444',
    isActive: true,
    isPinned: true,
    order: 1,
    createdAt: { toDate: () => new Date() }
  },
  {
    id: 'notice-2',
    text: '৫ বছর বয়স পর্যন্ত শিশুদের পোলিও টিকাদান ক্যাম্পেইন চলছে। নিকটস্থ কেন্দ্রে টিকা দিন।',
    category: 'স্বাস্থ্য ক্যাম্পেইন',
    sender: 'উপজেলা স্বাস্থ্য কমপ্লেক্স',
    severity: 'warning',
    color: '#f59e0b',
    isActive: true,
    order: 2,
    createdAt: { toDate: () => new Date() }
  },
  {
    id: 'notice-3',
    text: 'কৃষি প্রণোদনা কর্মসূচির আওতায় কৃষকদের মাঝে বিনামূল্যে উন্নত জাতের বীজ ও সার বিতরণ শুরু।',
    category: 'কৃষি নোটিশ',
    sender: 'উপজেলা কৃষি অফিস',
    severity: 'info',
    color: '#3b82f6',
    isActive: true,
    order: 3,
    createdAt: { toDate: () => new Date(Date.now() - 86400000) }
  },
  {
    id: 'notice-4',
    text: 'পৌরসভার বিদ্যুৎ লাইন সংস্কার ও উন্নয়ন কাজের কারণে সাময়িক বিদ্যুৎ সরবরাহ বন্ধ সংক্রান্ত নোটিশ।',
    category: 'বিদ্যুৎ নোটিশ',
    sender: 'পৌরসভা বিদ্যুৎ অভিযোগ কেন্দ্র',
    severity: 'warning',
    color: '#f59e0b',
    isActive: true,
    order: 4,
    createdAt: { toDate: () => new Date(Date.now() - 172800000) }
  },
  {
    id: 'notice-5',
    text: 'পুঠিয়া উপজেলার মেধাবী শিক্ষার্থীদের জন্য বার্ষিক স্কলারশিপ আবেদন বিজ্ঞপ্তি প্রকাশ।',
    category: 'শিক্ষা নোটিশ',
    sender: 'উপজেলা শিক্ষা অফিস',
    severity: 'success',
    color: '#10b981',
    isActive: true,
    order: 5,
    createdAt: { toDate: () => new Date(Date.now() - 259200000) }
  },
  {
    id: 'notice-6',
    text: 'জরুরি অ্যাম্বুলেন্স, ফায়ার সার্ভিস ও থানা-পুলিশের জরুরি হটলাইন সার্বক্ষণিক উন্মুক্ত।',
    category: 'জরুরি সেবা',
    sender: 'জরুরি নিয়ন্ত্রণ কক্ষ',
    severity: 'critical',
    color: '#ef4444',
    isActive: true,
    order: 6,
    createdAt: { toDate: () => new Date(Date.now() - 345600000) }
  }
];

interface NoticeItem {
  id: string;
  text: string;
  color: string;
  isActive: boolean;
  isPinned?: boolean;
  order: number;
  createdAt?: any;
  category?: string;
  sender?: string;
  severity?: 'info' | 'warning' | 'critical' | 'success';
}

const Notice: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<NoticeItem[]>(FALLBACK_NOTICES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Notification Preferences State
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("puthia_notif_sound") !== "disabled";
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [activeNotification, setActiveNotification] = useState<NoticeItem | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  
  // Notice Reactions state
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [hearts, setHearts] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [userHearts, setUserHearts] = useState<Record<string, boolean>>({});

  // Custom categories subscription simulation
  const [subscriptions, setSubscriptions] = useState({
    electricity: true,
    health: true,
    disaster: true,
    govt: true,
    news: false
  });

  // Admin Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formText, setFormText] = useState("");
  const [formCategory, setFormCategory] = useState("সাধারণ ঘোষণা");
  const [formSender, setFormSender] = useState("উপজেলা প্রশাসন");
  const [formSeverity, setFormSeverity] = useState<NoticeItem['severity']>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStaff = user?.email === 'mdzosimuddin31@gmail.com' || 
                  userProfile?.role === 'admin' || 
                  userProfile?.role === 'super_admin' || 
                  userProfile?.role === 'staff';

  useEffect(() => {
    // Real-time listener for notices with graceful fallback to notice_items & FALLBACK_NOTICES
    const q = collection(db, "notices");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NoticeItem[];
      
      if (data.length === 0) {
        // Check notice_items as backup
        const qBackup = collection(db, "notice_items");
        const unsubBackup = onSnapshot(qBackup, (snap2) => {
          const data2 = snap2.docs.map(doc => {
            const d = doc.data();
            return { 
              id: doc.id, 
              text: d.text || d.title || '',
              category: d.category || 'সাধারণ ঘোষণা',
              sender: d.sender || 'উপজেলা প্রশাসন',
              severity: d.severity || (d.priority === 'high' ? 'critical' : 'info'),
              color: d.color || '#007A5E',
              isActive: d.isActive !== false,
              order: d.order || 1,
              createdAt: d.createdAt || new Date(),
              ...d 
            };
          }) as NoticeItem[];
          
          if (data2.length > 0) {
            setItems(data2);
          } else {
            setItems(FALLBACK_NOTICES);
          }
          setLoading(false);
        }, () => {
          setItems(FALLBACK_NOTICES);
          setLoading(false);
        });
      } else {
        setItems(data);
        setLoading(false);
      }
    }, (error) => {
      console.warn("Notice fetch error:", error);
      setItems(FALLBACK_NOTICES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleIncomingNotice = (notice: NoticeItem) => {
    if (!notificationsEnabled) return;
    
    // Browser notification if permitted
    if (browserPermission === 'granted') {
      new Notification('আমাদের পুঠিয়া - নোটিশ', {
        body: notice.text,
        icon: '/logo.png'
      });
    }

    // Play chime if enabled
    if (soundEnabled) {
      playNotificationChime(notice.severity === 'critical' ? 'critical' : notice.severity === 'warning' ? 'warning' : 'info');
    }

    setActiveNotification(notice);
    // Auto-dismiss after 8 seconds
    setTimeout(() => setActiveNotification(null), 8000);
  };

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('আপনার ব্রাউজার পুশ নোটিফিকেশন সমর্থন করে না।');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleToggleNotifications = () => {
    if (!notificationsEnabled) {
      if (browserPermission !== 'granted') {
        setShowPermissionPrompt(true);
      } else {
        setNotificationsEnabled(true);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem("puthia_notif_sound", nextState ? "enabled" : "disabled");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formText.trim()) return;

    setIsSubmitting(true);
    try {
      const severityColors = {
        info: '#3b82f6',
        warning: '#f59e0b',
        critical: '#ef4444',
        success: '#10b981'
      };

      const data = {
        text: formText.trim(),
        category: formCategory,
        sender: formSender,
        severity: formSeverity,
        color: severityColors[formSeverity || 'info'],
        isActive: true,
        order: items.length + 1,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      };

      if (editingId) {
        await setDoc(doc(db, "notices", editingId), data, { merge: true });
      } else {
        await addDoc(collection(db, "notices"), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
      }

      resetForm();
    } catch (error) {
      handleFirestoreError(error as any, editingId ? OperationType.UPDATE : OperationType.CREATE, `notices/${editingId || ''}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "notices", id));
    } catch (error) {
      handleFirestoreError(error as any, OperationType.DELETE, `notices/${id}`);
    }
  };

  const resetForm = () => {
    setFormText("");
    setFormCategory("সাধারণ ঘোষণা");
    setFormSender("উপজেলা প্রশাসন");
    setFormSeverity('info');
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (item: NoticeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormText(item.text);
    setFormCategory(item.category || "সাধারণ ঘোষণা");
    setFormSender(item.sender || "উপজেলা প্রশাসন");
    setFormSeverity(item.severity || 'info');
    setEditingId(item.id);
    setShowForm(true);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm.trim() || 
                          item.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.sender && item.sender.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || 
                          item.severity === activeFilter ||
                          (activeFilter === 'critical' && (item.category?.includes('জরুরি') || item.category?.includes('গুরুত্বপূর্ণ'))) ||
                          (activeFilter === 'warning' && (item.category?.includes('সতর্ক') || item.category?.includes('বিদ্যুৎ') || item.category?.includes('স্বাস্থ্য'))) ||
                          (activeFilter === 'info' && (item.category?.includes('সাধারণ') || item.category?.includes('কৃষি'))) ||
                          (activeFilter === 'success' && (item.category?.includes('সাফল্য') || item.category?.includes('শিক্ষা')));
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { id: 'all', label: 'সবগুলো' },
    { id: 'critical', label: 'জরুরি' },
    { id: 'warning', label: 'সতর্কবার্তা' },
    { id: 'info', label: 'সাধারণ' },
    { id: 'success', label: 'সাফল্য' },
  ];

  const getSeverityStyles = (severity?: string) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', icon: <AlertCircle className="w-5 h-5" /> };
      case 'warning': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Info className="w-5 h-5" /> };
      case 'success': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: <CheckCircle2 className="w-5 h-5" /> };
      default: return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: <Megaphone className="w-5 h-5" /> };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto w-full pt-0 pb-32">
        <div className="animate-fade-in font-sans bg-gray-50 min-h-screen pb-20">
          {/* Header Banner */}
          <div 
            className="p-6 rounded-b-[32px] text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #065f46 0%, #047857 100%)' }}
          >
            <div className="flex items-center justify-between mb-6 min-h-[36px]">
              {showSearch ? (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl w-full">
                  <Search className="w-4 h-4 text-white shrink-0" />
                  <input
                    type="text"
                    placeholder="নোটিশ খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-white placeholder-white/60 text-xs outline-none w-full"
                    autoFocus
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')} 
                      className="text-white/60 hover:text-white text-xs whitespace-nowrap cursor-pointer"
                    >
                      মুছুন
                    </button>
                  )}
                  <button 
                    onClick={() => { setShowSearch(false); setSearchTerm(''); }} 
                    className="text-white/85 hover:text-white text-xs font-bold pl-2 border-l border-white/20 whitespace-nowrap cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate('/')} 
                      className="p-1.5 hover:bg-white/10 rounded-full transition flex items-center justify-center cursor-pointer text-white mr-1"
                      aria-label="Back to Home"
                    >
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <h2 className="text-lg font-bold">নোটিশ বোর্ড</h2>
                  </div>
                  <button 
                    onClick={() => setShowSearch(true)}
                    className="p-1.5 hover:bg-white/10 rounded-full transition flex items-center justify-center cursor-pointer"
                    aria-label="Search Notices"
                  >
                    <Search className="w-5 h-5 text-white/80" />
                  </button>
                </>
              )}
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white font-bold uppercase">গুরুত্বপূর্ণ তথ্য</span>
                <h3 className="text-lg font-bold mt-1">সকল নোটিশ ও ঘোষণা একসাথে</h3>
                <p className="text-[11px] opacity-80 mt-1">নিয়মিত আপডেট পেতে আমাদের সাথে থাকুন।</p>
              </div>
              <Megaphone className="w-12 h-12 text-white/40" />
            </div>
          </div>

          {/* Category Pills */}
          <div className="px-4 py-4 flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
            {filterOptions.map(cat => (
              <button 
                key={`notice-cat-${cat.id}`}
                type="button"
                onClick={() => setActiveFilter(cat.id)}
                className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-black transition-all border cursor-pointer active:scale-95 leading-normal ${
                  activeFilter === cat.id 
                    ? 'bg-[#006a4e] border-[#006a4e] text-white shadow-md' 
                    : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Notice List */}
          <div className="px-4 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800">সর্বশেষ নোটিশ</h3>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" /></div>
              ) : filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-2xs space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h4 className="text-slate-800 font-black text-sm">এই ক্যাটাগরিতে কোনো নোটিশ পাওয়া যায়নি</h4>
                  <p className="text-slate-500 text-xs">সবগুলো নোটিশ দেখতে নিচের বাটনে চাপুন</p>
                  <button
                    type="button"
                    onClick={() => { setActiveFilter('all'); setSearchTerm(''); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006a4e] text-white rounded-xl text-xs font-black shadow-xs cursor-pointer hover:bg-[#00543e] active:scale-95 transition"
                  >
                    <span>সকল নোটিশ দেখুন</span>
                  </button>
                </div>
              ) : (
                filteredItems.map((notice, index) => (
                  <div 
                    key={notice.id} 
                    onClick={() => setSelectedNotice(notice)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group cursor-pointer hover:border-emerald-200 transition active:scale-[0.99]"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Megaphone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">{notice.category}</span>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{notice.text}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                        <Clock className="w-3 h-3" /> {notice.createdAt?.toDate ? notice.createdAt.toDate().toLocaleDateString('bn-BD') : 'এখনই'}
                        {notice.sender && <span>• {notice.sender}</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Modals and forms */}
          <AnimatePresence>
            {selectedNotice && (() => {
              const details = getNoticeDetails(selectedNotice);
              
              // Dynamic reactions count setup
              const currentLikes = likes[selectedNotice.id] ?? details.likes;
              const currentHearts = hearts[selectedNotice.id] ?? details.hearts;
              const isLiked = userLikes[selectedNotice.id] ?? false;
              const isHearted = userHearts[selectedNotice.id] ?? false;

              const handleLikeToggle = () => {
                setLikes(prev => ({
                  ...prev,
                  [selectedNotice.id]: isLiked ? currentLikes - 1 : currentLikes + 1
                }));
                setUserLikes(prev => ({
                  ...prev,
                  [selectedNotice.id]: !isLiked
                }));
              };

              const handleHeartToggle = () => {
                setHearts(prev => ({
                  ...prev,
                  [selectedNotice.id]: isHearted ? currentHearts - 1 : currentHearts + 1
                }));
                setUserHearts(prev => ({
                  ...prev,
                  [selectedNotice.id]: !isHearted
                }));
              };

              const handleShareClick = async () => {
                if (navigator.share) {
                  navigator.share({
                    title: details.title,
                    text: details.description,
                    url: window.location.href,
                  }).catch(err => console.log(err));
                } else {
                  await copyToClipboard(window.location.href);
                  alert('নোটিশের লিঙ্কটি কপি করা হয়েছে!');
                }
              };

              // Find related notices (same category or any other notices, excluding current one)
              const relatedNotices = items
                .filter(item => item.id !== selectedNotice.id)
                .slice(0, 2);

              return (
                <motion.div
                  initial={{ opacity: 0, x: '100%' }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="fixed inset-0 z-[10008] bg-[#f8fafc] flex flex-col font-sans overflow-y-auto"
                >
                  {/* Deep Green Header */}
                  <div className="bg-[#005030] h-16 shrink-0 flex items-center justify-between px-4 text-white shadow-sm sticky top-0 z-50">
                    <button 
                      onClick={() => setSelectedNotice(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
                      id="btn-detail-back"
                    >
                      <ArrowLeft size={24} />
                    </button>
                    <span className="text-base font-black">নোটিশ বিস্তারিত</span>
                    <button 
                      onClick={handleShareClick}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
                      id="btn-detail-share"
                    >
                      <Share2 size={22} />
                    </button>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-4">
                    <div className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100/80 space-y-4">
                      
                      {/* Badge */}
                      <div>
                        <span className={`inline-block text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          selectedNotice.severity === 'critical' ? 'bg-red-50 text-red-600 border border-red-100' :
                          selectedNotice.severity === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          selectedNotice.severity === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-emerald-50 text-emerald-800'
                        }`}>
                          {selectedNotice.severity === 'critical' ? 'গুরুত্বপূর্ণ' : details.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg sm:text-xl font-black text-slate-800 leading-snug">
                        {details.title}
                      </h2>

                      {/* Metadata Row */}
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          প্রকাশের তারিখ: {selectedNotice.createdAt?.toDate ? selectedNotice.createdAt.toDate().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : toBanglaNumber('৩১ মে ২০২৬')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-slate-300" />
                          {toBanglaNumber(details.views)}
                        </span>
                      </div>

                      {/* Image */}
                      <div className="rounded-[20px] overflow-hidden bg-slate-100 aspect-video w-full border border-slate-100">
                        <img 
                          src={details.image} 
                          alt={details.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed whitespace-pre-line">
                        {details.description}
                      </p>

                      {/* Eligibility checklist */}
                      <div className="space-y-2 pt-2">
                        <h3 className="text-xs sm:text-sm font-black text-slate-800">আবেদনের যোগ্যতা:</h3>
                        <div className="space-y-2">
                          {details.eligibility.map((eligibilityItem, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-bold">
                              <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 size={12} className="fill-emerald-50 stroke-emerald-600 stroke-[3px]" />
                              </div>
                              <span>{eligibilityItem}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Details Cards Container */}
                      <div className="border border-slate-100/90 rounded-[24px] overflow-hidden bg-slate-50/30 divide-y divide-slate-100/90">
                        {/* End Date */}
                        <div className="flex items-center gap-3.5 p-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-slate-400">আবেদনের শেষ তারিখ</p>
                            <p className="text-xs font-black text-slate-700">{details.deadline}</p>
                          </div>
                        </div>

                        {/* Submission Location */}
                        <div className="flex items-center gap-3.5 p-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400">আবেদন জমা দেওয়ার স্থান</p>
                            <p className="text-xs font-black text-slate-700 truncate">{details.location}</p>
                          </div>
                        </div>

                        {/* Helpline / Contact */}
                        <div className="flex items-center gap-3.5 p-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-slate-400">বিস্তারিত জানতে</p>
                            <p className="text-xs font-black text-slate-700">{toBanglaNumber(details.phone)}</p>
                          </div>
                        </div>
                      </div>

                      {/* PDF Box */}
                      <div className="flex items-center justify-between p-4 bg-emerald-50/60 border border-emerald-100 rounded-[20px] group cursor-pointer hover:bg-emerald-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-50">
                            <FileText className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800">বিজ্ঞপ্তি ডাউনলোড (PDF)</h4>
                            <p className="text-[10px] font-bold text-slate-400">{details.pdfSize}</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-50 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <Download className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Feedback/Reactions */}
                      <div className="pt-2 border-t border-slate-100/90 space-y-3">
                        <p className="text-xs font-black text-slate-400 text-center">এই নোটিশটি কেমন লাগলো?</p>
                        <div className="flex justify-center gap-3">
                          <button 
                            onClick={handleLikeToggle}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-extrabold transition-all active:scale-95 ${
                              isLiked 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' 
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                            }`}
                            id="btn-like-notice"
                          >
                            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-emerald-600' : ''}`} />
                            {toBanglaNumber(currentLikes)}
                          </button>
                          <button 
                            onClick={handleHeartToggle}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-extrabold transition-all active:scale-95 ${
                              isHearted 
                                ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm' 
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                            }`}
                            id="btn-heart-notice"
                          >
                            <Heart className={`w-4 h-4 ${isHearted ? 'fill-rose-600' : ''}`} />
                            {toBanglaNumber(currentHearts)}
                          </button>
                          <button 
                            onClick={handleShareClick}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-extrabold bg-white text-slate-500 border-slate-100 hover:border-slate-200 transition-all active:scale-95"
                            id="btn-inner-share-notice"
                          >
                            <Share2 className="w-4 h-4" />
                            শেয়ার
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Related Notices Section */}
                    {relatedNotices.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <h3 className="text-sm font-black text-slate-800">সম্পর্কিত নোটিশ</h3>
                          <button 
                            onClick={() => setSelectedNotice(null)}
                            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                            id="btn-view-all-notices"
                          >
                            সব দেখুন &rarr;
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {relatedNotices.map((relatedNoticeItem) => {
                            const itemDetails = getNoticeDetails(relatedNoticeItem);
                            return (
                              <div 
                                key={relatedNoticeItem.id}
                                onClick={() => setSelectedNotice(relatedNoticeItem)}
                                className="bg-white p-3.5 rounded-[20px] shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-emerald-200 transition-all group"
                              >
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                                  <img 
                                    src={itemDetails.image} 
                                    alt={relatedNoticeItem.text} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <span className="text-[9px] font-extrabold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                                    {relatedNoticeItem.category || itemDetails.category}
                                  </span>
                                  <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                                    {relatedNoticeItem.text}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-300" />
                                    {relatedNoticeItem.createdAt?.toDate ? relatedNoticeItem.createdAt.toDate().toLocaleDateString('bn-BD') : toBanglaNumber('১৬ মে ২০২৪')}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          <AnimatePresence>
            {activeNotification && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 20, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-24 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-[10005] bg-slate-900 text-white rounded-[32px] p-6 shadow-2xl border border-white/10"
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${activeNotification.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                    <Zap size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-black text-sm uppercase tracking-widest text-white/60">জরুরি নোটিফিকেশন</h4>
                      <button onClick={() => setActiveNotification(null)}>
                        <X size={18} className="text-white/40 hover:text-white" />
                      </button>
                    </div>
                    <p className="font-black text-base leading-tight mb-2">{activeNotification.text}</p>
                    <div className="text-[10px] font-bold text-white/40">{activeNotification.sender} থেকে</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showPermissionPrompt && (
              <div className="fixed inset-0 z-[10006] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-[40px] w-full max-w-sm p-10 text-center shadow-2xl"
                >
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                    <Bell size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-4">নোটিফিকেশন অনুমতি</h2>
                  <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">
                    আপনি কি পুঠিয়া নোটিশ বোর্ডের গুরুত্বপূর্ণ ও জরুরি নোটিফিকেশনগুলো সরাসরি আপনার ফোনে পেতে চান?
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={handleRequestPermission}
                      className="w-full py-5 bg-indigo-600 text-white rounded-[20px] font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-600/20"
                    >
                      হ্যাঁ, নোটিফিকেশন দিন
                    </button>
                    <button
                      onClick={() => setShowPermissionPrompt(false)}
                      className="w-full py-5 bg-slate-50 text-slate-600 rounded-[20px] font-black text-sm"
                    >
                      না, পরে দেখা যাবে
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showForm && (
              <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="p-10 bg-indigo-600 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-[20px]">
                        <Megaphone size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black">{editingId ? "নোটিশ আপডেট করুন" : "নতুন নোটিশ প্রকাশ করুন"}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">অ্যাডমিন কন্ট্রোল</p>
                      </div>
                    </div>
                    <button onClick={resetForm} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                      <X size={28} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">নোটিশের বিষয়/ক্যাটাগরি</label>
                        <input
                          required
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="যেমন: বিদ্যুৎ বিভ্রাট, টিকা ক্যাম্পেইন"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">প্রেরক/বিভাগ</label>
                          <input
                            required
                            value={formSender}
                            onChange={(e) => setFormSender(e.target.value)}
                            className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">গুরুত্ব</label>
                          <select
                            value={formSeverity}
                            onChange={(e) => setFormSeverity(e.target.value as any)}
                            className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm appearance-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          >
                            <option value="info">সাধারণ</option>
                            <option value="warning">সতর্কবার্তা</option>
                            <option value="critical">জরুরি</option>
                            <option value="success">সাফল্য</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">নোটিশের বর্ণনা</label>
                        <textarea
                          required
                          value={formText}
                          onChange={(e) => setFormText(e.target.value)}
                          rows={5}
                          className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm resize-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-lg flex items-center justify-center gap-4 shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-slate-300"
                    >
                      {isSubmitting ? "প্রকাশ করা হচ্ছে..." : (editingId ? "নোটিশ আপডেট করুন" : "নোটিশ পাবলিশ করুন")}
                      <Sparkles size={24} />
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default Notice;

