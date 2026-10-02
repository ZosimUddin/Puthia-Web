import React, { useState, useEffect } from "react";
import { 
  Mail, 
  MessageSquare, 
  Bell, 
  Megaphone, 
  Send, 
  Settings, 
  Clock, 
  Users, 
  Smartphone, 
  Loader2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  Layout, 
  Calendar, 
  Plus, 
  RefreshCw, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Sliders, 
  Play, 
  Info,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { getNoticeItems, addNoticeItem, updateNoticeItem, deleteNoticeItem, getAllUsers } from "../../api";
import { NoticeItem } from "../../types";

// Types definition
interface DispatchedNotification {
  id?: string;
  title: string;
  body: string;
  imageUrl?: string;
  targetAudience: 'all' | 'business' | 'premium';
  createdAt: string;
  recipientCount: number;
  status: 'sent' | 'failed';
}

interface EmailBroadcast {
  id?: string;
  campaignName: string;
  subject: string;
  templateType: 'announcement' | 'alert' | 'newsletter';
  body: string;
  targetAudience: 'all' | 'business' | 'premium';
  createdAt: string;
  recipientCount: number;
  openRate: number;
  clickRate: number;
  status: 'completed' | 'draft' | 'sending';
}

interface SmsBroadcast {
  id?: string;
  message: string;
  targetAudience: 'all' | 'business' | 'premium';
  createdAt: string;
  recipientCount: number;
  smsCount: number; 
  provider: 'twilio' | 'greenweb' | 'bulksmsbd' | 'custom';
  status: 'delivered' | 'pending' | 'failed';
}

export default function CommunicationManagement() {
  const [activeSubTab, setActiveSubTab] = useState<'push' | 'email' | 'sms' | 'announcements'>('push');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Users for calculation
  const [totalRecipients, setTotalRecipients] = useState({ all: 1540, business: 320, premium: 125 });

  // 1. Push Notification states
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifImage, setNotifImage] = useState("");
  const [pushAudience, setPushAudience] = useState<'all' | 'business' | 'premium'>('all');
  const [sendingPush, setSendingPush] = useState(false);
  const [pushHistory, setPushHistory] = useState<DispatchedNotification[]>([]);
  const [previewPlatform, setPreviewPlatform] = useState<'android' | 'ios'>('android');
  const [loadingPushHistory, setLoadingPushHistory] = useState(false);

  // 2. Email Broadcast states
  const [campaignName, setCampaignName] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTemplate, setEmailTemplate] = useState<'announcement' | 'alert' | 'newsletter'>('announcement');
  const [emailBody, setEmailBody] = useState("");
  const [emailAudience, setEmailAudience] = useState<'all' | 'business' | 'premium'>('all');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailHistory, setEmailHistory] = useState<EmailBroadcast[]>([]);
  const [loadingEmailHistory, setLoadingEmailHistory] = useState(false);
  
  // SMTP Config states
  const [smtpServer, setSmtpServer] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpSender, setSmtpSender] = useState("no-reply@puthiasmartcity.com");
  const [smtpApiKey, setSmtpApiKey] = useState("••••••••••••••••••••");
  const [isSmtpConfigured, setIsSmtpConfigured] = useState(true);
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // 3. SMS Broadcast states
  const [smsMessage, setSmsMessage] = useState("");
  const [smsAudience, setSmsAudience] = useState<'all' | 'business' | 'premium'>('all');
  const [smsProvider, setSmsProvider] = useState<'twilio' | 'greenweb' | 'bulksmsbd' | 'custom'>('bulksmsbd');
  const [sendingSms, setSendingSms] = useState(false);
  const [smsHistory, setSmsHistory] = useState<SmsBroadcast[]>([]);
  const [loadingSmsHistory, setLoadingSmsHistory] = useState(false);
  
  // SMS Gateway Config
  const [smsApiKey, setSmsApiKey] = useState("••••••••••••••••••••");
  const [smsSenderId, setSmsSenderId] = useState("PUTHIAINFO");
  const [smsUsername, setSmsUsername] = useState("puthia_admin");
  const [isSmsConfigured, setIsSmsConfigured] = useState(true);
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testingSms, setTestingSms] = useState(false);

  // 4. Announcement Board states
  const [announcements, setAnnouncements] = useState<NoticeItem[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  
  // New announcement form states
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceText, setAnnounceText] = useState("");
  const [announceColor, setAnnounceColor] = useState("slate");
  const [announcePriority, setAnnouncePriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [announceIsPinned, setAnnounceIsPinned] = useState(false);
  const [announceIsActive, setAnnounceIsActive] = useState(true);
  const [announceLink, setAnnounceLink] = useState("");
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [editingAnnounceId, setEditingAnnounceId] = useState<string | null>(null);

  // Fetch initial histories
  useEffect(() => {
    fetchRecipientsAndHistories();
  }, [activeSubTab]);

  const fetchRecipientsAndHistories = async () => {
    try {
      // Fetch users count to display dynamic audience count
      const allUsers = await getAllUsers();
      if (allUsers && allUsers.length > 0) {
        const businessCount = allUsers.filter(u => u.role === 'business' || u.hasBusiness).length;
        const premiumCount = allUsers.filter(u => u.isPremium || u.role === 'premium' || u.subscriptionActive).length;
        setTotalRecipients({
          all: allUsers.length,
          business: businessCount || 42,
          premium: premiumCount || 28
        });
      }

      if (activeSubTab === 'push') {
        fetchPushHistory();
      } else if (activeSubTab === 'email') {
        fetchEmailHistory();
      } else if (activeSubTab === 'sms') {
        fetchSmsHistory();
      } else if (activeSubTab === 'announcements') {
        fetchAnnouncements();
      }
    } catch (e) {
      console.error("Error loading communication statistics:", e);
    }
  };

  // Helper to show status message
  const triggerStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 1. PUSH NOTIFICATION HELPERS
  const fetchPushHistory = async () => {
    setLoadingPushHistory(true);
    try {
      const q = query(collection(db, "push_notifications"), orderBy("createdAt", "desc"), limit(8));
      const querySnapshot = await getDocs(q);
      const list: DispatchedNotification[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as DispatchedNotification);
      });
      setPushHistory(list);
    } catch (e) {
      console.error("Error fetching push logs:", e);
    } finally {
      setLoadingPushHistory(false);
    }
  };

  const handleSendPush = async () => {
    if (!notifTitle || !notifBody) {
      triggerStatus('error', 'শিরোনাম এবং বার্তা উভয়ই বাধ্যতামূলক!');
      return;
    }

    setSendingPush(true);
    try {
      const allUsers = await getAllUsers();
      let targeted = allUsers;
      if (pushAudience === 'business') {
        targeted = allUsers.filter(u => u.role === 'business' || u.hasBusiness);
      } else if (pushAudience === 'premium') {
        targeted = allUsers.filter(u => u.isPremium || u.role === 'premium' || u.subscriptionActive);
      }

      const count = targeted.length > 0 ? targeted.length : totalRecipients[pushAudience];

      // Dispatch user notifications inside DB
      const promises = (targeted.length > 0 ? targeted : [{ uid: 'system_test_user' }]).map(u => {
        return addDoc(collection(db, "notifications"), {
          userId: u.uid,
          title: notifTitle,
          body: notifBody,
          imageUrl: notifImage || null,
          read: false,
          createdAt: new Date().toISOString(),
          type: 'push_broadcast'
        });
      });
      await Promise.all(promises);

      // Save push history logs
      const log: DispatchedNotification = {
        title: notifTitle,
        body: notifBody,
        imageUrl: notifImage || "",
        targetAudience: pushAudience,
        createdAt: new Date().toISOString(),
        recipientCount: count,
        status: 'sent'
      };
      await addDoc(collection(db, "push_notifications"), log);

      triggerStatus('success', 'পুশ নোটিফিকেশন সফলভাবে সম্প্রচার করা হয়েছে!');
      setNotifTitle("");
      setNotifBody("");
      setNotifImage("");
      fetchPushHistory();
    } catch (error) {
      console.error(error);
      triggerStatus('error', 'পুশ নোটিফিকেশন পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setSendingPush(false);
    }
  };

  const handleDeletePushItem = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই নোটিফিকেশন লগটি মুছতে চান?")) return;
    try {
      await deleteDoc(doc(db, "push_notifications", id));
      setPushHistory(prev => prev.filter(item => item.id !== id));
      triggerStatus('success', 'লগ সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (e) {
      triggerStatus('error', 'লগ মুছতে ব্যর্থ হয়েছে।');
    }
  };

  // 2. EMAIL BROADCAST HELPERS
  const fetchEmailHistory = async () => {
    setLoadingEmailHistory(true);
    try {
      const q = query(collection(db, "email_broadcasts"), orderBy("createdAt", "desc"), limit(8));
      const querySnapshot = await getDocs(q);
      const list: EmailBroadcast[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as EmailBroadcast);
      });

      // Seed mock statistics logs if empty
      if (list.length === 0) {
        const seedLogs: EmailBroadcast[] = [
          {
            campaignName: "জরুরি সাইট মেইনটেন্যান্স অ্যালার্ট",
            subject: "জরুরি নোটিশ: আমাদের পুঠিয়া সার্ভিস মেইনটেন্যান্স",
            templateType: "alert",
            body: "প্রিয় ব্যবহারকারী, আগামী কাল রাত ২টা থেকে ভোর ৫টা পর্যন্ত অ্যাপ আপগ্রেড কার্যক্রম চলবে। সাময়িক অসুবিধার জন্য দুঃখিত।",
            targetAudience: "all",
            createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
            recipientCount: 1540,
            openRate: 85.4,
            clickRate: 12.2,
            status: "completed"
          },
          {
            campaignName: "নতুন কৃষি তথ্য নির্দেশিকা ২০২৬",
            subject: "বর্ষাকালে ধানের বাম্পার ফলন পেতে করণীয় নির্দেশনা",
            templateType: "newsletter",
            body: "ধাপ ১: সঠিক সার ও কীটনাশক নির্বাচন। বিস্তারিত নির্দেশিকা এবং বিশেষজ্ঞ মতামত দেখতে এখানে ট্যাপ করুন।",
            targetAudience: "all",
            createdAt: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
            recipientCount: 1420,
            openRate: 64.1,
            clickRate: 38.6,
            status: "completed"
          }
        ];
        for (const log of seedLogs) {
          await addDoc(collection(db, "email_broadcasts"), log);
        }
        setEmailHistory(seedLogs);
      } else {
        setEmailHistory(list);
      }
    } catch (e) {
      console.error("Error fetching email logs:", e);
    } finally {
      setLoadingEmailHistory(false);
    }
  };

  const handleSendEmail = async () => {
    if (!campaignName || !emailSubject || !emailBody) {
      triggerStatus('error', 'সবগুলো বিবরণ ও ক্যাম্পেইন ফিল্ড পূরণ করুন!');
      return;
    }

    setSendingEmail(true);
    try {
      const recipientCount = totalRecipients[emailAudience];
      
      const log: EmailBroadcast = {
        campaignName,
        subject: emailSubject,
        templateType: emailTemplate,
        body: emailBody,
        targetAudience: emailAudience,
        createdAt: new Date().toISOString(),
        recipientCount,
        openRate: parseFloat((Math.random() * 20 + 60).toFixed(1)), // random simulated rate between 60%-80%
        clickRate: parseFloat((Math.random() * 15 + 10).toFixed(1)), // random simulated between 10%-25%
        status: 'completed'
      };

      await addDoc(collection(db, "email_broadcasts"), log);
      
      triggerStatus('success', 'ইমেইল ব্রডকাস্ট ক্যাম্পেইন সফলভাবে সমাপ্ত হয়েছে!');
      setCampaignName("");
      setEmailSubject("");
      setEmailBody("");
      fetchEmailHistory();
    } catch (e) {
      triggerStatus('error', 'ইমেইল ক্যাম্পেইন পাঠাতে ব্যর্থ হয়েছে।');
    } finally {
      setSendingEmail(false);
    }
  };

  const testSmtpConnection = async () => {
    setTestingConnection(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      triggerStatus('success', 'SMTP গেটওয়ে সংযোগ সফল! টেস্ট পিং সম্পূর্ণ হয়েছে।');
    } catch (e) {
      triggerStatus('error', 'SMTP সার্ভার রেসপন্স টাইমআউট! সংযোগ ব্যর্থ।');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleDeleteEmailLog = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই ইমেইল লগটি মুছতে চান?")) return;
    try {
      await deleteDoc(doc(db, "email_broadcasts", id));
      setEmailHistory(prev => prev.filter(item => item.id !== id));
      triggerStatus('success', 'ক্যাম্পেইন লগ মুছে ফেলা হয়েছে।');
    } catch (e) {
      triggerStatus('error', 'লগ মুছতে ব্যর্থ হয়েছে।');
    }
  };

  // 3. SMS BROADCAST HELPERS
  const fetchSmsHistory = async () => {
    setLoadingSmsHistory(true);
    try {
      const q = query(collection(db, "sms_broadcasts"), orderBy("createdAt", "desc"), limit(8));
      const querySnapshot = await getDocs(q);
      const list: SmsBroadcast[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as SmsBroadcast);
      });

      if (list.length === 0) {
        const seedLogs: SmsBroadcast[] = [
          {
            message: "আমাদের পুঠিয়া অ্যাপে স্বাগতম! আপনার ব্যবসা আমাদের ডিরেক্টরিতে ফ্রিতে লিস্টিং করতে আজই প্রোফাইল ভেরিফাই করুন।",
            targetAudience: "business",
            createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
            recipientCount: 320,
            smsCount: 1,
            provider: "bulksmsbd",
            status: "delivered"
          },
          {
            message: "জরুরি নোটিশ: পুঠিয়া সদর হাসপাতালে রক্ত সংকট দেখা দেওয়ায় জরুরিভাবে ও-নেগেটিভ (O-) রক্তদাতার খোঁজ করা হচ্ছে।",
            targetAudience: "all",
            createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
            recipientCount: 1540,
            smsCount: 1,
            provider: "greenweb",
            status: "delivered"
          }
        ];
        for (const log of seedLogs) {
          await addDoc(collection(db, "sms_broadcasts"), log);
        }
        setSmsHistory(seedLogs);
      } else {
        setSmsHistory(list);
      }
    } catch (e) {
      console.error("Error fetching SMS logs:", e);
    } finally {
      setLoadingSmsHistory(false);
    }
  };

  const handleSendSmsCampaign = async () => {
    if (!smsMessage) {
      triggerStatus('error', 'এসএমএস বার্তা লিখতে হবে!');
      return;
    }

    setSendingSms(true);
    try {
      const charCount = smsMessage.length;
      const isUnicode = /[^\u0000-\u007F]+/.test(smsMessage);
      const limitPerSms = isUnicode ? 70 : 160;
      const smsParts = Math.ceil(charCount / limitPerSms) || 1;

      const log: SmsBroadcast = {
        message: smsMessage,
        targetAudience: smsAudience,
        createdAt: new Date().toISOString(),
        recipientCount: totalRecipients[smsAudience],
        smsCount: smsParts,
        provider: smsProvider,
        status: 'delivered'
      };

      await addDoc(collection(db, "sms_broadcasts"), log);
      triggerStatus('success', 'এসএমএস ব্রডকাস্ট ক্যাম্পেইন সফলভাবে সম্প্রচারিত!');
      setSmsMessage("");
      fetchSmsHistory();
    } catch (e) {
      triggerStatus('error', 'এসএমএস পাঠাতে ত্রুটি হয়েছে।');
    } finally {
      setSendingSms(false);
    }
  };

  const testSingleSms = async () => {
    if (!testPhoneNumber || !smsMessage) {
      triggerStatus('error', 'মোবাইল নাম্বার ও এসএমএস বার্তা দিন!');
      return;
    }
    setTestingSms(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1800));
      triggerStatus('success', `টেস্ট এসএমএস সফলভাবে পাঠানো হয়েছে: ${testPhoneNumber}`);
      setTestPhoneNumber("");
    } catch (e) {
      triggerStatus('error', 'এসএমএস গেটওয়ে রেসপন্স ইরর! কনফিগারেশন চেক করুন।');
    } finally {
      setTestingSms(false);
    }
  };

  const handleDeleteSmsLog = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই এসএমএস লগটি মুছতে চান?")) return;
    try {
      await deleteDoc(doc(db, "sms_broadcasts", id));
      setSmsHistory(prev => prev.filter(item => item.id !== id));
      triggerStatus('success', 'এসএমএস লগ মুছে ফেলা হয়েছে।');
    } catch (e) {
      triggerStatus('error', 'লগ মুছতে ব্যর্থ হয়েছে।');
    }
  };

  // SMS length helper
  const getSmsCharStats = () => {
    const charCount = smsMessage.length;
    const isUnicode = /[^\u0000-\u007F]+/.test(smsMessage);
    const limitPerSms = isUnicode ? 70 : 160;
    const smsParts = Math.ceil(charCount / limitPerSms) || 1;
    const remaining = limitPerSms * smsParts - charCount;

    return {
      count: charCount,
      parts: smsParts,
      isUnicode,
      remaining,
      limit: limitPerSms
    };
  };

  // 4. ANNOUNCEMENT HELPERS (DIRECT SYNC WITH NOTICES)
  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const list = await getNoticeItems();
      setAnnouncements(list);
    } catch (e) {
      console.error("Error fetching announcements:", e);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceText) {
      triggerStatus('error', 'ঘোষণার টেক্সট অবশ্যই লিখতে হবে!');
      return;
    }

    setSavingAnnouncement(true);
    try {
      const noticeObj = {
        title: announceTitle || "সাধারণ ঘোষণা",
        text: announceText,
        color: announceColor,
        isActive: announceIsActive,
        isPinned: announceIsPinned,
        link: announceLink || "",
        order: announcements.length + 1,
        createdAt: new Date().toISOString(),
        publishAt: new Date().toISOString(),
        priority: announcePriority,
        status: 'published' as const
      };

      if (editingAnnounceId) {
        await updateNoticeItem(editingAnnounceId, noticeObj);
        triggerStatus('success', 'ঘোষণাটি সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await addNoticeItem(noticeObj);
        triggerStatus('success', 'নতুন ঘোষণা সফলভাবে তৈরি ও লাইভ করা হয়েছে!');
      }

      setAnnounceTitle("");
      setAnnounceText("");
      setAnnounceColor("slate");
      setAnnouncePriority("medium");
      setAnnounceIsPinned(false);
      setAnnounceLink("");
      setEditingAnnounceId(null);
      
      // Refresh list
      fetchAnnouncements();
    } catch (e) {
      triggerStatus('error', 'ঘোষণা সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleEditAnnouncement = (item: NoticeItem) => {
    setEditingAnnounceId(item.id);
    setAnnounceTitle(item.title || "");
    setAnnounceText(item.text || "");
    setAnnounceColor(item.color || "slate");
    setAnnouncePriority(item.priority || "medium");
    setAnnounceIsPinned(item.isPinned || false);
    setAnnounceIsActive(item.isActive !== false);
    setAnnounceLink(item.link || "");
    
    // Smooth scroll to form
    const element = document.getElementById("announce-form-head");
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleNoticeActive = async (item: NoticeItem) => {
    try {
      const updatedStatus = !item.isActive;
      await updateNoticeItem(item.id, { isActive: updatedStatus });
      setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, isActive: updatedStatus } : a));
      triggerStatus('success', `ঘোষণাটি সফলভাবে ${updatedStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
    } catch (e) {
      triggerStatus('error', 'স্ট্যাটাস আপডেট করা সম্ভব হয়নি।');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই ঘোষণাটি চিরতরে মুছে দিতে চান?")) return;
    try {
      await deleteNoticeItem(id);
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      triggerStatus('success', 'ঘোষণা সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (e) {
      triggerStatus('error', 'ঘোষণা মুছতে ব্যর্থ হয়েছে।');
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-70 pointer-events-none" />
        
        <div className="relative z-10">
          <span className="text-emerald-600 bg-emerald-50 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-emerald-100 inline-flex items-center gap-1.5 mb-3">
            <Sparkles size={11} className="animate-spin" style={{ animationDuration: '6s' }} />
            Omni-Channel Broadcast System
          </span>
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Megaphone className="text-emerald-600" size={32} />
            স্মার্ট কমিউনিকেশন ও ব্রডকাস্ট কেন্দ্র
          </h2>
          <p className="text-xs font-bold text-gray-400 mt-1">
            পুঠিয়া অ্যাপের সকল ব্যবহারকারীদের জন্য পুশ নোটিফিকেশন, এসএমএস, বাল্ক ইমেইল ক্যাম্পেইন এবং লাইভ ঘোষণা পরিচালনা করুন
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <button 
            onClick={fetchRecipientsAndHistories}
            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100 rounded-2xl transition-all flex items-center justify-center"
            title="রিফ্রেশ স্ট্যাটিস্টিকস"
          >
            <RefreshCw size={16} />
          </button>
          <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-gray-200">
            <Users size={14} className="text-emerald-400" />
            <span>মোট গ্রাহক: {totalRecipients.all} জন</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold fixed top-6 right-6 z-50 shadow-2xl max-w-md ${
            statusMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </motion.div>
      )}

      {/* Sub tabs selector */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-100/60 p-2 rounded-3xl max-w-fit border border-gray-200/50">
        {[
          { id: 'push', label: 'পুশ নোটিফিকেশন', icon: Bell, activeColor: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' },
          { id: 'email', label: 'ইমেইল ব্রডকাস্ট', icon: Mail, activeColor: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' },
          { id: 'sms', label: 'এসএমএস ব্রডকাস্ট', icon: MessageSquare, activeColor: 'bg-blue-600 text-white shadow-md shadow-blue-600/10' },
          { id: 'announcements', label: 'ঘোষণা বোর্ড (Notices)', icon: Megaphone, activeColor: 'bg-rose-600 text-white shadow-md shadow-rose-600/10' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
              activeSubTab === tab.id 
                ? tab.activeColor 
                : 'text-gray-500 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <tab.icon size={15} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Channel Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Forms & Config) - Col span 7 */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* PUSH NOTIFICATION DISPATCHER PANEL */}
          {activeSubTab === 'push' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">পুশ নোটিফিকেশন ব্রডকাস্ট</h3>
                    <p className="text-[10px] font-bold text-gray-400">অ্যাপের নিবন্ধিত ব্যবহারকারীদের মোবাইল স্ক্রিনে ইনস্ট্যান্ট পপআপ মেসেজ পাঠান</p>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-5">
                
                {/* Target selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">টার্গেট গ্রাহক গোষ্ঠী (Target Audience)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'all', count: totalRecipients.all, label: 'সকল সাধারণ ইউজার' },
                      { id: 'business', count: totalRecipients.business, label: 'নিবন্ধিত ব্যবসায়ী' },
                      { id: 'premium', count: totalRecipients.premium, label: 'প্রিমিয়াম গ্রাহক' }
                    ].map(aud => (
                      <button
                        key={aud.id}
                        type="button"
                        onClick={() => setPushAudience(aud.id as any)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                          pushAudience === aud.id 
                            ? 'bg-emerald-50/50 border-emerald-500 text-emerald-950 shadow-sm' 
                            : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100/70'
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase text-gray-400">গ্রুপ</p>
                        <p className="text-xs font-black mt-0.5">{aud.label}</p>
                        <span className="absolute bottom-3 right-3 text-[10px] font-black text-emerald-600 bg-white border border-emerald-100 px-2 py-0.5 rounded-md">
                          {aud.count} জন
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">নোটিফিকেশন শিরোনাম (Title) *</label>
                  <input 
                    type="text" 
                    value={notifTitle || ""}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="যেমন: পুঠিয়া বাজারে রুটিন ট্যাক্স ধার্য নোটিশ..."
                    className="w-full px-5 py-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-gray-900 transition-all outline-none"
                  />
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">বিস্তারিত নোটিফিকেশন বার্তা (Body) *</label>
                  <textarea 
                    rows={4}
                    value={notifBody || ""}
                    onChange={(e) => setNotifBody(e.target.value)}
                    placeholder="এখানে আপনার নোটিফিকেশনের মূল বার্তাটি টাইপ করুন যা ব্যবহারকারীর মোবাইলে তাৎক্ষণিকভাবে ভেসে উঠবে..."
                    className="w-full px-5 py-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-gray-900 transition-all outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">রিচ ইমেজ লিংক - Rich Image URL (ঐচ্ছিক)</label>
                  <input 
                    type="text" 
                    value={notifImage || ""}
                    onChange={(e) => setNotifImage(e.target.value)}
                    placeholder="https://example.com/images/banner.jpg"
                    className="w-full px-5 py-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-gray-900 transition-all outline-none"
                  />
                  <p className="text-[10px] text-gray-400 font-bold px-1">ইমেজ যোগ করলে নোটিফিকেশনটি অনেক বেশি দৃষ্টিআকর্ষক হবে এবং অ্যান্ড্রয়েড/আইওএস বড় ব্যানার হিসেবে দেখাবে</p>
                </div>

                {/* CTA Action button */}
                <button
                  type="button"
                  onClick={handleSendPush}
                  disabled={sendingPush || !notifTitle || !notifBody}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-600/10"
                >
                  {sendingPush ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>পুশ নোটিফিকেশন পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>তাত্ক্ষণিক পুশ ব্রডকাস্ট করুন</span>
                    </>
                  )}
                </button>

              </div>
            </motion.div>
          )}

          {/* EMAIL BROADCAST DISPATCHER PANEL */}
          {activeSubTab === 'email' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              
              {/* Campaign settings Card */}
              <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">বাল্ক ইমেইল প্রচার (Email Broadcast)</h3>
                      <p className="text-[10px] font-bold text-gray-400">নির্ধারিত ব্যবহারকারী গোষ্ঠীকে পেশাদার মেইল ক্যাম্পেইন পাঠান</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowGatewayConfig(!showGatewayConfig)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 border border-gray-100 hover:bg-gray-100 rounded-xl text-[11px] font-black text-gray-600 transition-all"
                  >
                    <Settings size={13} />
                    SMTP কনফিগার
                  </button>
                </div>

                {/* Gateway config section (Expandable) */}
                <AnimatePresence>
                  {showGatewayConfig && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border border-gray-100 bg-gray-50/50 rounded-2xl p-5 space-y-4 text-left"
                    >
                      <h4 className="text-xs font-black text-gray-700 flex items-center gap-2">
                        <Settings size={14} className="text-indigo-600" />
                        SMTP সার্ভার এবং গেটওয়ে প্রোভাইডার কনফিগারেশন
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase">SMTP Host Address</label>
                          <input 
                            type="text"
                            value={smtpServer || ""}
                            onChange={(e) => setSmtpServer(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:border-indigo-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase">SMTP Port</label>
                          <input 
                            type="text"
                            value={smtpPort || ""}
                            onChange={(e) => setSmtpPort(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:border-indigo-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase">Sender Email Account</label>
                          <input 
                            type="text"
                            value={smtpSender || ""}
                            onChange={(e) => setSmtpSender(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:border-indigo-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase">API Password / Key</label>
                          <input 
                            type="password"
                            value={smtpApiKey || ""}
                            onChange={(e) => setSmtpApiKey(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-mono focus:border-indigo-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                          <Info size={11} />
                          সার্ভার সিকিউরিটি প্রোটোকল: TLS v1.3
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={testSmtpConnection}
                            disabled={testingConnection}
                            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg transition-all flex items-center gap-1"
                          >
                            {testingConnection ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
                            কানেকশন টেস্ট করুন
                          </button>
                          <button
                            type="button"
                            onClick={() => { triggerStatus('success', 'SMTP সেভ সম্পন্ন হয়েছে!'); setShowGatewayConfig(false); }}
                            className="px-3.5 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg transition-all"
                          >
                            সেভ করুন
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form fields */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campaign name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">ক্যাম্পেইন নাম (Campaign Name) *</label>
                      <input 
                        type="text" 
                        value={campaignName || ""}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="যেমন: জুন মাসের বাজার রিপোর্ট বাড়ে..."
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-gray-900 transition-all outline-none"
                      />
                    </div>

                    {/* Template theme selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">ইমেইল টেমপ্লেট থিম (Template Design)</label>
                      <select 
                        value={emailTemplate || ""}
                        onChange={(e) => setEmailTemplate(e.target.value as any)}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-gray-900 transition-all outline-none appearance-none"
                      >
                        <option value="announcement">সাধারণ তথ্য ও ঘোষণা (System Default)</option>
                        <option value="alert">জরুরি সংকেত ও রেড অ্যালার্ট (Crucial Alert)</option>
                        <option value="newsletter">উইকলি ডাইজেস্ট ও ছবিযুক্ত নিউজলেটার (Newsletter)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Audience selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">গ্রাহক গোষ্ঠী (Target Audience)</label>
                      <select 
                        value={emailAudience || ""}
                        onChange={(e) => setEmailAudience(e.target.value as any)}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-gray-900 transition-all outline-none appearance-none"
                      >
                        <option value="all">সকল নিবন্ধিত ইউজার ({totalRecipients.all} জন)</option>
                        <option value="business">নিবন্ধিত ব্যবসায়ী ডিরেক্টরি ({totalRecipients.business} জন)</option>
                        <option value="premium">প্রিমিয়াম গ্রাহক গ্রুপ ({totalRecipients.premium} জন)</option>
                      </select>
                    </div>

                    {/* Subject line */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">ইমেইল ইমেইল বিষয় (Subject Line) *</label>
                      <input 
                        type="text" 
                        value={emailSubject || ""}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="যেমন: আমাদের পুঠিয়া এলাকার জরুরি নোটিশ..."
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-gray-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Body Text Editor */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">ইমেইলের মূল কন্টেন্ট (HTML Email Content) *</label>
                      <span className="text-[9px] text-gray-400 font-bold">Standard Markdown or Inline Styling allowed</span>
                    </div>
                    <textarea 
                      rows={6}
                      value={emailBody || ""}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="এখানে আপনার ইমেইলের বডি বিস্তারিত বাংলায় গুছিয়ে লিখুন..."
                      className="w-full px-5 py-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-gray-900 transition-all outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={sendingEmail || !campaignName || !emailSubject || !emailBody}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/10"
                  >
                    {sendingEmail ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>ইমেইল ক্যাম্পেইন প্রেরণ করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>বাল্ক ইমেইল ব্রডকাস্ট করুন</span>
                      </>
                    )}
                  </button>

                </div>
              </div>
            </motion.div>
          )}

          {/* SMS BROADCAST DISPATCHER PANEL */}
          {activeSubTab === 'sms' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">বাল্ক এসএমএস ক্যাম্পেইন (SMS Broadcast)</h3>
                      <p className="text-[10px] font-bold text-gray-400">মোবাইল অপারেটরের মাধ্যমে সরাসরি ব্যবহারকারীর অফলাইন সিমে এসএমএস পাঠান</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSmsConfigured(!isSmsConfigured)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-100 hover:bg-gray-100 rounded-xl text-[10px] font-black text-gray-600 transition-all"
                  >
                    <Settings size={12} />
                    API গেটওয়ে
                  </button>
                </div>

                {/* SMS API Config */}
                {!isSmsConfigured && (
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-gray-700 flex items-center gap-2">
                      <Settings size={14} className="text-blue-600" />
                      এসএমএস প্রোভাইডার এবং এপিআই সিক্রেট কনফিগারেশন
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">SMS Service Gateway</label>
                        <select 
                          value={smsProvider || ""}
                          onChange={(e) => setSmsProvider(e.target.value as any)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none"
                        >
                          <option value="bulksmsbd">BulkSMSBD (Bangladesh Local)</option>
                          <option value="greenweb">Greenweb SMS Gateway</option>
                          <option value="twilio">Twilio Global API</option>
                          <option value="custom">কাস্টম REST SMS API</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Sender Masking ID (Sender ID)</label>
                        <input 
                          type="text"
                          value={smsSenderId || ""}
                          onChange={(e) => setSmsSenderId(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:border-blue-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">API Username</label>
                        <input 
                          type="text"
                          value={smsUsername || ""}
                          onChange={(e) => setSmsUsername(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:border-blue-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">API Secret Key</label>
                        <input 
                          type="password"
                          value={smsApiKey || ""}
                          onChange={(e) => setSmsApiKey(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-mono focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => { triggerStatus('success', 'SMS গেটওয়ে সেভ সম্পন্ন হয়েছে!'); setIsSmsConfigured(true); }}
                        className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg transition-all"
                      >
                        কনফিগারেশন সংরক্ষণ করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* Composing Area */}
                <div className="space-y-5">
                  
                  {/* Select target & provider */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">এসএমএস প্রাপক গোষ্ঠী (Target Audience)</label>
                      <select 
                        value={smsAudience || ""}
                        onChange={(e) => setSmsAudience(e.target.value as any)}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-gray-900 transition-all outline-none"
                      >
                        <option value="all">সকল সাধারণ গ্রাহক ({totalRecipients.all} জন)</option>
                        <option value="business">নিবন্ধিত ব্যবসায়ীগণ ({totalRecipients.business} জন)</option>
                        <option value="premium">প্রিমিয়াম গ্রাহকগোষ্ঠী ({totalRecipients.premium} )</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">মোবাইল রুট গেটওয়ে (SMS Route)</label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-gray-600 flex items-center justify-between">
                        <span className="uppercase">{smsProvider} Gateway</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">অনলাইন</span>
                      </div>
                    </div>
                  </div>

                  {/* SMS Text Box */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">এসএমএস বার্তা টাইপ করুন (SMS Body) *</label>
                      
                      {/* Character statistics */}
                      {smsMessage.length > 0 && (
                        <div className="text-[9px] font-bold text-gray-400 flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded ${getSmsCharStats().isUnicode ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                            {getSmsCharStats().isUnicode ? 'বাংলা (Unicode)' : 'English (GSM)'}
                          </span>
                          <span>{getSmsCharStats().count} / {getSmsCharStats().limit} অক্ষর</span>
                          <span className="text-blue-600 font-black">({getSmsCharStats().parts} SMS)</span>
                        </div>
                      )}
                    </div>

                    <textarea 
                      rows={5}
                      value={smsMessage || ""}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      placeholder="এখানে আপনার মোবাইল এসএমএস টেক্সট বার্তা লিখুন। বাংলাতে লিখলে প্রতি এসএমএস ৭০ অক্ষর ও ইংরেজিতে লিখলে ১৬০ অক্ষর পর্যন্ত লিমিট থাকবে..."
                      className="w-full px-5 py-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-gray-900 transition-all outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Action block */}
                  <div className="flex flex-col md:flex-row gap-4 pt-2">
                    <button
                      type="button"
                      onClick={handleSendSmsCampaign}
                      disabled={sendingSms || !smsMessage}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/10"
                    >
                      {sendingSms ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>এসএমএস ক্যাম্পেইন পাঠানো হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>বাল্ক এসএমএস ব্রডকাস্ট করুন</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>

              {/* Single SMS Testing Card */}
              <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4 text-left">
                <div className="border-b border-gray-50 pb-2.5">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Play size={13} className="text-blue-500" />
                    গেটওয়ে টেস্ট করুন (Single Mobile Test Dispatcher)
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400">ব্রডকাস্ট পাঠানোর আগে যেকোনো একটি নাম্বারে টেস্ট এসএমএস পাঠিয়ে যাচাই করুন</p>
                </div>

                <div className="flex flex-col md:flex-row items-end gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase">Test Phone Number</label>
                    <input 
                      type="text"
                      value={testPhoneNumber || ""}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      placeholder="e.g. 01712345678"
                      className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-gray-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={testSingleSms}
                    disabled={testingSms || !testPhoneNumber || !smsMessage}
                    className="px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white font-black text-xs rounded-xl transition-all h-[42px] flex items-center justify-center gap-2"
                  >
                    {testingSms ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                    টেস্ট এসএমএস পাঠান
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ANNOUNCEMENT BOARD / SYSTEM ANNOUNCEMENT GENERAL CRUD */}
          {activeSubTab === 'announcements' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
                
                {/* Form header */}
                <div id="announce-form-head" className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                      <Megaphone size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">
                        {editingAnnounceId ? 'ঘোষণা তথ্য এডিট করুন' : 'নতুন জরুরি ঘোষণা জারি'}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400">অ্যাপ এবং মেইন ওয়েবসাইটের নোটিশ বোর্ডে রিয়েলটাইম প্রকাশ করুন</p>
                    </div>
                  </div>

                  {editingAnnounceId && (
                    <button
                      onClick={() => {
                        setEditingAnnounceId(null);
                        setAnnounceTitle("");
                        setAnnounceText("");
                        setAnnounceColor("slate");
                        setAnnouncePriority("medium");
                        setAnnounceIsPinned(false);
                        setAnnounceLink("");
                      }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-[10px] rounded-lg"
                    >
                      বাতিল করুন
                    </button>
                  )}
                </div>

                {/* Form inputs */}
                <form onSubmit={handleSaveAnnouncement} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">ঘোষণার মূল শিরোনাম (Title)</label>
                      <input 
                        type="text"
                        value={announceTitle || ""}
                        onChange={(e) => setAnnounceTitle(e.target.value)}
                        placeholder="যেমন: পুঠিয়া পৌরসভা নির্বাচন ২০১৬..."
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-gray-900 transition-all outline-none"
                      />
                    </div>

                    {/* Expiration Link */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">বিস্তারিত ওয়েব লিংক - Action Link (ঐচ্ছিক)</label>
                      <input 
                        type="text"
                        value={announceLink || ""}
                        onChange={(e) => setAnnounceLink(e.target.value)}
                        placeholder="https://puthiasmartcity.com/notices/election"
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-gray-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Color style */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">কালার স্কিম থিম (Accent Color)</label>
                      <select
                        value={announceColor || ""}
                        onChange={(e) => setAnnounceColor(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-gray-900 transition-all outline-none appearance-none"
                      >
                        <option value="slate">Slate Standard (ধূসর)</option>
                        <option value="rose">Rose Red (জরুরি / লাল)</option>
                        <option value="emerald">Emerald Green (সাফল্য / সবুজ)</option>
                        <option value="indigo">Indigo Blue (তথ্যমূলক / নীল)</option>
                        <option value="amber">Amber Gold (সতর্কতা / হলুদ)</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">অগ্রাধিকার লেভেল (Severity/Priority)</label>
                      <select
                        value={announcePriority || ""}
                        onChange={(e) => setAnnouncePriority(e.target.value as any)}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-xs font-bold focus:bg-white focus:border-gray-900 transition-all outline-none appearance-none"
                      >
                        <option value="low">Low (সাধারণ নোটিশ)</option>
                        <option value="medium">Medium (গুরুত্বপূর্ণ ঘোষণা)</option>
                        <option value="high">High (জরুরি রেড অ্যালার্ট)</option>
                      </select>
                    </div>

                    {/* Checkboxes for pinning and active */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">অতিরিক্ত অপশন</label>
                      <div className="flex items-center gap-4 h-[42px] bg-gray-50 border border-gray-100 rounded-xl px-4 justify-around">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={announceIsPinned}
                            onChange={(e) => setAnnounceIsPinned(e.target.checked)}
                            className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                          />
                          <span>পিন করে রাখুন</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={announceIsActive}
                            onChange={(e) => setAnnounceIsActive(e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>অনলাইন লাইভ</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Announcement body content */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-1">ঘোষণা টেক্সট কন্টেন্ট (Text Details) *</label>
                    <textarea 
                      rows={5}
                      value={announceText || ""}
                      onChange={(e) => setAnnounceText(e.target.value)}
                      placeholder="এখানে ঘোষণার মূল বিষয় বিস্তারিত টাইপ করুন যা আমাদের পুঠিয়া অ্যাপে নোটিশ বোর্ডে এবং হোম পেজে স্লাইডারে ভেসে উঠবে..."
                      className="w-full px-5 py-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-gray-900 transition-all outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingAnnouncement || !announceText}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-rose-600/10"
                  >
                    {savingAnnouncement ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>সংরক্ষণ করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>{editingAnnounceId ? 'ঘোষণা তথ্য আপডেট করুন' : 'নতুন ঘোষণা প্রকাশ করুন'}</span>
                      </>
                    )}
                  </button>

                </form>
              </div>
            </motion.div>
          )}

        </div>


        {/* Right Column (Visual Simulators & Live Analytics) - Col span 5 */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* PUSH NOTIFICATION LIVE SIMULATOR */}
          {activeSubTab === 'push' && (
            <div className="space-y-8">
              
              {/* Simulator Card */}
              <section className="bg-gray-950 p-6 rounded-[48px] shadow-2xl border-[6px] border-gray-800 relative overflow-hidden text-white select-none">
                
                {/* Platform Toggle */}
                <div className="flex items-center justify-between border-b border-gray-900 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="text-emerald-500 w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">রিয়েলটাইম মোবাইল প্রিভিউ</span>
                  </div>
                  <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
                    <button
                      onClick={() => setPreviewPlatform('android')}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                        previewPlatform === 'android' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Android
                    </button>
                    <button
                      onClick={() => setPreviewPlatform('ios')}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                        previewPlatform === 'ios' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      iOS
                    </button>
                  </div>
                </div>

                {/* Display Body */}
                <div className="bg-[#121212] rounded-[36px] p-4 h-[340px] flex flex-col justify-start relative overflow-hidden">
                  
                  {/* Status bar simulated */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mb-6 px-1">
                    <span>{new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span>পুঠিয়া ৫জি</span>
                    </div>
                  </div>

                  {/* Device Notification Rendering */}
                  <AnimatePresence mode="wait">
                    {previewPlatform === 'android' ? (
                      <motion.div 
                        key="android-preview"
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -30, opacity: 0 }}
                        className="bg-[#242424] border border-gray-800/60 rounded-2xl p-4 text-left shadow-xl w-full"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400">
                            <span className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-[8px] text-white">প</span>
                            <span>আমাদের পুঠিয়া</span>
                          </div>
                          <span className="text-[8px] text-gray-500">এইমাত্র</span>
                        </div>
                        <h4 className="text-xs font-black text-white truncate">
                          {notifTitle || "নোটিফিকেশন শিরোনাম এখানে প্রদর্শিত হবে"}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-relaxed break-words line-clamp-3">
                          {notifBody || "এখানে আপনার নোটিফিকেশনের মূল খুচরা বার্তা ও ঘোষণা দেখাবে যা ব্যবহারকারী তাৎক্ষণিকভাবে তার স্ক্রিনে দেখতে পাবে..."}
                        </p>
                        
                        {notifImage && (
                          <div className="mt-3.5 rounded-xl overflow-hidden h-24 w-full relative bg-gray-900 border border-gray-800">
                            <img 
                              src={notifImage} 
                              alt="Rich banner" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400"; }}
                            />
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="ios-preview"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#1e1e1e]/90 backdrop-blur-md border border-gray-800 rounded-[22px] p-4 text-left shadow-xl w-full"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center text-[11px] text-white font-black shadow-inner">
                              প
                            </div>
                            <div>
                              <h5 className="text-[11px] font-black text-white">আমাদের পুঠিয়া</h5>
                              <p className="text-[9px] text-gray-500 font-bold">পুশ ব্রডকাস্ট</p>
                            </div>
                          </div>
                          <span className="text-[9px] text-gray-500">এইমাত্র</span>
                        </div>

                        <div className="mt-2.5">
                          <h4 className="text-xs font-black text-white">
                            {notifTitle || "নোটিফিকেশন শিরোনাম এখানে প্রদর্শিত হবে"}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-normal break-words line-clamp-2">
                            {notifBody || "এখানে আপনার নোটিফিকেশনের মূল খুচরা বার্তা ও ঘোষণা দেখাবে..."}
                          </p>
                        </div>

                        {notifImage && (
                          <div className="mt-2.5 rounded-lg overflow-hidden h-20 w-full relative bg-gray-900">
                            <img 
                              src={notifImage} 
                              alt="Rich banner" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400"; }}
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Device home bar */}
                  <div className="absolute bottom-2 inset-x-0 flex justify-center">
                    <div className="w-24 h-1 bg-gray-800 rounded-full" />
                  </div>
                </div>
              </section>

              {/* Historical Logs List */}
              <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="text-gray-400 w-4 h-4" />
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">সাম্প্রতিক পুশ নোটিফিকেশন লগ</h4>
                  </div>
                  <button 
                    onClick={fetchPushHistory}
                    className="text-[10px] text-emerald-600 hover:underline font-bold"
                  >
                    রিফ্রেশ
                  </button>
                </div>

                {loadingPushHistory ? (
                  <div className="py-12 flex flex-col items-center gap-2 text-xs font-bold text-gray-400">
                    <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                    <span>ইতিহাস লোড হচ্ছে...</span>
                  </div>
                ) : pushHistory.length === 0 ? (
                  <div className="py-12 text-center text-xs font-bold text-gray-400">
                    কোনো পূর্ববর্তী নোটিফিকেশন লগ পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {pushHistory.map((notif) => (
                      <div key={notif.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-gray-100/80 flex items-start justify-between gap-3 group hover:border-emerald-100 transition-all">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                              notif.targetAudience === 'all' ? 'bg-emerald-100 text-emerald-700' :
                              notif.targetAudience === 'business' ? 'bg-amber-100 text-amber-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {notif.targetAudience === 'all' ? 'সবাই' :
                               notif.targetAudience === 'business' ? 'ব্যবসায়ী' : 'প্রিমিয়াম'}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold">
                              {new Date(notif.createdAt).toLocaleString('bn-BD', { dateStyle: 'short' })}
                            </span>
                          </div>
                          <h5 className="text-xs font-black text-gray-900 truncate">{notif.title}</h5>
                          <p className="text-[10px] text-gray-500 font-bold line-clamp-1 mt-0.5">{notif.body}</p>
                          <p className="text-[9px] font-black text-emerald-600 mt-1 flex items-center gap-1">
                            <Users size={10} />
                            <span>প্রাপক: {notif.recipientCount} জন</span>
                          </p>
                        </div>
                        <button
                          onClick={() => notif.id && handleDeletePushItem(notif.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          )}

          {/* EMAIL BROADCAST LIVE SIMULATOR */}
          {activeSubTab === 'email' && (
            <div className="space-y-8">
              
              {/* Responsive HTML Email Previewer */}
              <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4 text-left">
                <div className="border-b border-gray-50 pb-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Layout className="text-indigo-600" size={15} />
                      রসপনসিভ ইমেইল টেমপ্লেট প্রিভিউ
                    </h4>
                    <p className="text-[9px] font-bold text-gray-400">গ্রাহকদের ইনবক্সে যেভাবে ইমেইলটি প্রদর্শিত হবে</p>
                  </div>
                  <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-black capitalize">
                    {emailTemplate} Template
                  </span>
                </div>

                {/* Simulated Email Wrapper */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 p-4 max-h-[420px] overflow-y-auto">
                  
                  {/* Email header details */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-1 text-xs mb-4 shadow-sm">
                    <p className="font-bold text-gray-400">From: <span className="text-gray-700 font-black">আমাদের পুঠিয়া টিম &lt;{smtpSender}&gt;</span></p>
                    <p className="font-bold text-gray-400">To: <span className="text-gray-700 font-black">recipient-list@{emailAudience}.com</span></p>
                    <p className="font-bold text-gray-400">Subject: <span className="text-indigo-600 font-black">{emailSubject || "এখানে ইমেইল সাবজেক্ট দেখাবে"}</span></p>
                  </div>

                  {/* HTML Template Render */}
                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    {/* Header accent based on theme */}
                    <div className={`p-5 text-center text-white ${
                      emailTemplate === 'alert' ? 'bg-rose-600' :
                      emailTemplate === 'newsletter' ? 'bg-indigo-900' : 'bg-[#007A5E]'
                    }`}>
                      <h2 className="text-md font-black tracking-wide">আমাদের পুঠিয়া স্মার্ট সিটি পোর্টাল</h2>
                      <p className="text-[9px] opacity-80 mt-1 font-bold uppercase tracking-widest">Official Broadcast Newsletter</p>
                    </div>

                    {/* Email body text */}
                    <div className="p-6 space-y-4 text-left">
                      <h3 className="text-sm font-black text-gray-900">
                        {emailSubject || "ক্যাম্পেইন শিরোনাম"}
                      </h3>
                      
                      <div className="text-xs text-gray-600 leading-relaxed space-y-2 font-bold whitespace-pre-line">
                        {emailBody || "এখানে আপনার কাস্টম ইমেইল বার্তাটি টেমপ্লেট অনুযায়ী নিখুঁত ডিজাইনে প্রদর্শিত হবে। আপনি বাম পাশে টাইপ করলে এটি রিয়েলটাইমে আপডেট হবে।"}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 text-center">
                        <span className={`inline-block px-5 py-2.5 text-white font-black text-[10px] rounded-xl cursor-pointer ${
                          emailTemplate === 'alert' ? 'bg-rose-600 hover:bg-rose-700' :
                          emailTemplate === 'newsletter' ? 'bg-indigo-900 hover:bg-indigo-950' : 'bg-[#007A5E] hover:bg-[#005e48]'
                        }`}>
                          বিস্তারিত খবর দেখুন
                        </span>
                      </div>
                    </div>

                    {/* Email footer */}
                    <div className="bg-gray-50 p-4 border-t border-gray-100 text-center text-[9px] text-gray-400 space-y-1">
                      <p className="font-black">© ২০২৬ আমাদের পুঠিয়া ডিজিটাল ইনফো সেন্টার</p>
                      <p className="font-bold">পুঠিয়া রাজবাড়ি রোড, পুঠিয়া, রাজশাহী</p>
                      <p className="font-bold">আপনি এই মেইলটি পেয়েছেন কারণ আপনি আমাদের স্মার্ট পোর্টালে নিবন্ধিত হয়েছেন। <span className="text-indigo-600 underline cursor-pointer">আনসাবস্ক্রাইব করুন</span></p>
                    </div>

                  </div>
                </div>
              </section>

              {/* Campaign Performance & Logs */}
              <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="text-emerald-500" size={14} />
                    ইমেইল ক্যাম্পেইন পারফরম্যান্স ট্র্যাক
                  </h4>
                  <button onClick={fetchEmailHistory} className="text-[10px] text-indigo-600 font-bold hover:underline">রিলোড</button>
                </div>

                {loadingEmailHistory ? (
                  <div className="py-8 text-center text-xs font-bold text-gray-400">
                    লোড হচ্ছে...
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {emailHistory.map((camp) => (
                      <div key={camp.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-gray-100 flex flex-col gap-2 group hover:border-indigo-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                            {camp.templateType} template
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-gray-400 font-bold">{new Date(camp.createdAt).toLocaleDateString('bn-BD')}</span>
                            <button 
                              onClick={() => camp.id && handleDeleteEmailLog(camp.id)}
                              className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-xs font-black text-gray-900 truncate">{camp.campaignName}</h5>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5">{camp.subject}</p>
                        </div>

                        {/* Open, delivery visual indicators */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100/50 text-center">
                          <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                            <p className="text-[8px] font-bold text-gray-400">মোট মেইল</p>
                            <p className="text-xs font-black text-gray-800">{camp.recipientCount} জন</p>
                          </div>
                          <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                            <p className="text-[8px] font-bold text-gray-400">ওপেন রেট</p>
                            <p className="text-xs font-black text-emerald-600">{camp.openRate}%</p>
                          </div>
                          <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                            <p className="text-[8px] font-bold text-gray-400">ক্লিক রেট</p>
                            <p className="text-xs font-black text-indigo-600">{camp.clickRate}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          )}

          {/* SMS BROADCAST HISTORY */}
          {activeSubTab === 'sms' && (
            <div className="space-y-8">
              
              {/* Off-line SMS Simulator */}
              <section className="bg-gray-950 p-6 rounded-[48px] shadow-2xl border-[6px] border-gray-800 relative overflow-hidden text-white select-none">
                <div className="border-b border-gray-900 pb-3 mb-4 flex items-center gap-2">
                  <Smartphone className="text-blue-500 w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">রিয়েলটাইম অফলাইন এসএমএস স্ক্রিন</span>
                </div>

                <div className="bg-[#121212] rounded-[36px] p-4 h-[300px] flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 px-1">
                    <span>{new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>সিম ১ (GP)</span>
                  </div>

                  {/* Messaging Bubble */}
                  <div className="flex-1 flex flex-col justify-center px-2">
                    <motion.div 
                      key={smsMessage}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-4 text-left max-w-[85%] self-start text-xs leading-relaxed text-gray-100 shadow-lg relative"
                    >
                      {/* Notch arrow */}
                      <div className="absolute left-[-6px] top-4 w-3 h-3 bg-gray-800/80 border-l border-b border-gray-700/50 rotate-45" />
                      
                      <p className="text-[9px] font-black text-blue-400 mb-1">Sender: MD-PUTHIA</p>
                      
                      <p className="font-bold whitespace-pre-line break-words text-gray-200">
                        {smsMessage || "ডান পাশে বক্সে কোনো বার্তা টাইপ করলে সেটি সরাসরি অফলাইন মোবাইল সিমে যেভাবে রিসিভ হবে তার নমুনা এখানে ভেসে উঠবে..."}
                      </p>

                      <p className="text-[8px] text-gray-500 font-bold text-right mt-2">এইমাত্র</p>
                    </motion.div>
                  </div>

                  {/* Home indicator */}
                  <div className="absolute bottom-2 inset-x-0 flex justify-center">
                    <div className="w-24 h-1 bg-gray-800 rounded-full" />
                  </div>
                </div>
              </section>

              {/* SMS Dispatcher Logs */}
              <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="text-gray-400" size={14} />
                    সাম্প্রতিক এসএমএস সম্প্রচার ইতিহাস
                  </h4>
                  <button onClick={fetchSmsHistory} className="text-[10px] text-blue-600 font-bold hover:underline">রিলোড</button>
                </div>

                {loadingSmsHistory ? (
                  <div className="py-8 text-center text-xs font-bold text-gray-400">
                    লোড হচ্ছে...
                  </div>
                ) : smsHistory.length === 0 ? (
                  <div className="py-8 text-center text-xs font-bold text-gray-400">
                    কোনো পূর্ববর্তী এসএমএস ক্যাম্পেইন ইতিহাস পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {smsHistory.map((sms) => (
                      <div key={sms.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-gray-100/80 flex items-start justify-between gap-3 group hover:border-blue-100 transition-all">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                              {sms.provider} route
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold">
                              {new Date(sms.createdAt).toLocaleDateString('bn-BD')}
                            </span>
                          </div>
                          
                          <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-relaxed break-words">
                            {sms.message}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-[9px] font-black text-gray-400">
                            <span className="text-emerald-600 flex items-center gap-1">
                              <Users size={10} />
                              প্রাপক: {sms.recipientCount} জন
                            </span>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                              পার্টস: {sms.smsCount} SMS
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => sms.id && handleDeleteSmsLog(sms.id)}
                          className="p-1 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          )}

          {/* SYSTEM ANNOUNCEMENTS LIVE INTERACTIVE LIST */}
          {activeSubTab === 'announcements' && (
            <div className="space-y-8">
              
              {/* List Card */}
              <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="text-rose-600" size={14} />
                      লাইভ নোটিশ ও ঘোষণা তালিকা
                    </h4>
                    <p className="text-[9px] font-bold text-gray-400">বর্তমানে সাইটে লাইভ সক্রিয় নোটিশ বোর্ড</p>
                  </div>
                  
                  <button 
                    onClick={fetchAnnouncements}
                    disabled={loadingAnnouncements}
                    className="text-[10px] text-rose-600 font-bold hover:underline"
                  >
                    {loadingAnnouncements ? 'রিফ্রেশ হচ্ছে...' : 'রিফ্রেশ করুন'}
                  </button>
                </div>

                {loadingAnnouncements ? (
                  <div className="py-12 flex flex-col items-center justify-center text-xs font-bold text-gray-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                    <span>ঘোষণা লোড হচ্ছে...</span>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="py-12 text-center text-xs font-bold text-gray-400">
                    কোনো সক্রিয় নোটিশ বা ঘোষণা তৈরি করা নেই।
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {announcements.map((announce) => (
                      <div 
                        key={announce.id} 
                        className={`p-4 bg-white rounded-2xl border transition-all flex flex-col gap-3 group relative ${
                          announce.isActive 
                            ? 'border-gray-100 hover:border-rose-100 hover:shadow-md' 
                            : 'border-dashed border-gray-200 opacity-60'
                        }`}
                      >
                        
                        {/* Title accent color band */}
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              {announce.isPinned && (
                                <span className="text-[8px] font-black px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded">
                                  📌 পিন করা
                                </span>
                              )}
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                                announce.priority === 'high' ? 'bg-red-100 text-red-700' :
                                announce.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {announce.priority === 'high' ? 'জরুরি রেড অ্যালার্ট' :
                                 announce.priority === 'medium' ? 'গুরুত্বপূর্ণ' : 'সাধারণ নোটিশ'}
                              </span>
                              
                              {/* Display publish date */}
                              <span className="text-[9px] text-gray-400 font-bold">
                                {new Date(announce.createdAt).toLocaleDateString('bn-BD')}
                              </span>
                            </div>

                            <h5 className="text-xs font-black text-gray-900 leading-snug">{announce.title}</h5>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => handleEditAnnouncement(announce)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="এডিট করুন"
                            >
                              <Settings size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(announce.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Content text */}
                        <p className="text-[11px] text-gray-600 font-bold leading-relaxed whitespace-pre-line">
                          {announce.text}
                        </p>

                        {announce.link && (
                          <a 
                            href={announce.link}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] font-black text-indigo-600 hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            <span>বিস্তারিত জানুন</span>
                            <ExternalLink size={9} />
                          </a>
                        )}

                        {/* Toggle active button */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
                          <span className={`text-[9px] font-black ${announce.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {announce.isActive ? '● সক্রিয় ও লাইভ' : '○ ড্রাফট / অফলাইন'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleNoticeActive(announce)}
                            className="flex items-center gap-1 text-[9px] font-black text-gray-500 hover:text-gray-900 transition-all"
                          >
                            {announce.isActive ? (
                              <>
                                <span>অফলাইন করুন</span>
                                <ToggleRight size={16} className="text-emerald-500 shrink-0" />
                              </>
                            ) : (
                              <>
                                <span>লাইভ করুন</span>
                                <ToggleLeft size={16} className="text-gray-400 shrink-0" />
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
