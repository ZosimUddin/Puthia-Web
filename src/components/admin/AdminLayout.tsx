import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, LayoutDashboard, Users, Store, Package, Home, 
  Bell, Newspaper, Calendar, Image as ImageIcon, 
  Megaphone, Settings, LogOut, Menu, X,
  Droplets, FileText, Building2, Heart, User, Pencil, Lock, Globe, HelpCircle, 
  ShieldCheck, ShieldAlert, DollarSign, Sparkles, Trophy, Landmark,
  Activity, Shield, CheckCircle2, ChevronDown, ChevronRight, Eye, Key,
  Phone, Share2, Search, Wrench, Clock, AlertCircle, AlertTriangle, FileCheck, CheckSquare,
  Tag, ShoppingBag, Truck, MapPin, Stethoscope, GraduationCap, Sprout, Briefcase,
  Video, FolderKanban, Sliders, Layers, UserCheck, UserX, BarChart2, MessageSquare, Flame, Smartphone,
  Database, HardDrive, UploadCloud, Wifi, Mic, SearchCode, History, Info, Headphones, Star, Download
} from 'lucide-react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface NavSubItem {
  name: string;
  href: string;
  icon?: React.ElementType;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: ('super_admin' | 'admin' | 'editor' | 'moderator')[];
  badge?: string | number;
  badgeColor?: string;
  subItems?: NavSubItem[];
}

interface NavSection {
  title: string;
  roles: ('super_admin' | 'admin' | 'editor' | 'moderator')[];
  items: NavItem[];
}

const AdminLayout: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Session Warning State Variables
  const [sessionTimeLeft, setSessionTimeLeft] = useState(60);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const lastActiveRef = useRef<number>(Date.now());

  // Determine effective role
  const effectiveRole: 'super_admin' | 'admin' | 'editor' | 'moderator' = useMemo(() => {
    const r = (userProfile?.role as string) || '';
    const isMaster = user?.email === 'mdzosimuddin31@gmail.com';
    if (r === 'super_admin' || (isMaster && !r)) return 'super_admin';
    if (r === 'admin') return 'admin';
    if (r === 'editor') return 'editor';
    if (r === 'moderator') return 'moderator';
    return r === 'super_admin' ? 'super_admin' : 'admin';
  }, [userProfile, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Role details config
  const roleConfig = useMemo(() => {
    switch (effectiveRole) {
      case 'super_admin':
        return {
          title: 'সুপার অ্যাডমিন প্যানেল',
          badge: '👑 সুপার অ্যাডমিন',
          badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/60',
          gradient: 'from-[#01412F] to-emerald-700',
          accent: 'emerald',
          dashboardHref: '/super-admin'
        };
      case 'admin':
        return {
          title: 'অ্যাডমিন ড্যাশবোর্ড',
          badge: '🛡️ অ্যাডমিনিস্ট্রেটর',
          badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/60',
          gradient: 'from-emerald-600 to-teal-700',
          accent: 'emerald',
          dashboardHref: '/admin'
        };
      case 'editor':
        return {
          title: 'এডিটর পাবলিশিং হাব',
          badge: '📝 কন্টেন্ট এডিটর',
          badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-300/60',
          gradient: 'from-blue-600 to-indigo-700',
          accent: 'blue',
          dashboardHref: '/editor'
        };
      case 'moderator':
        return {
          title: 'মডারেশন ও সেফটি হাব',
          badge: '🛡️ কমিউনিটি মডারেটর',
          badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-300/60',
          gradient: 'from-purple-600 to-fuchsia-700',
          accent: 'purple',
          dashboardHref: '/moderator'
        };
    }
  }, [effectiveRole]);

  // Structured Nav Sections by Role
  const navSections: NavSection[] = useMemo(() => [
    {
      title: 'প্রধান নিয়ন্ত্রণ ও ড্যাশবোর্ড',
      roles: ['super_admin', 'admin', 'editor', 'moderator'],
      items: [
        { 
          name: 'মূল ড্যাশবোর্ড', 
          href: roleConfig.dashboardHref, 
          icon: LayoutDashboard, 
          roles: ['super_admin', 'admin', 'editor', 'moderator']
        },
        { 
          name: '🟢 রিয়েল-টাইম ইউজার ট্র্যাকিং', 
          href: '/admin/realtime-users', 
          icon: Activity, 
          roles: ['super_admin', 'admin', 'moderator'],
          badge: 'Live',
          badgeColor: 'bg-emerald-500 text-white animate-pulse',
          subItems: [
            { name: 'লাইভ অনলাইন মনিটর', href: '/admin/realtime-users?tab=live', icon: Activity },
            { name: 'রিয়েল-টাইম পেজ ট্রাফিক', href: '/admin/realtime-users?tab=pages', icon: Flame },
            { name: 'ডিভাইস ও ব্রাউজার স্ট্যাটস', href: '/admin/realtime-users?tab=devices', icon: Smartphone },
            { name: 'ইউনিয়ন ও এরিয়া ম্যাপ', href: '/admin/realtime-users?tab=locations', icon: MapPin },
          ]
        },
        { 
          name: 'নোটিফিকেশন সিস্টেম', 
          href: '/admin/notifications', 
          icon: Bell, 
          roles: ['super_admin', 'admin', 'editor', 'moderator'],
          badge: 'Live',
          badgeColor: 'bg-emerald-500 text-white',
          subItems: [
            { name: 'পুশ নোটিফিকেশন', href: '/admin/notifications?tab=push', icon: Smartphone },
            { name: 'ইন-অ্যাপ নোটিফিকেশন', href: '/admin/notifications?tab=inapp', icon: Flame },
            { name: 'ইউজার নোটিফিকেশন', href: '/admin/notifications?tab=user', icon: Users },
            { name: 'অ্যাডমিন নোটিফিকেশন', href: '/admin/notifications?tab=admin', icon: ShieldAlert },
            { name: 'সিস্টেম নোটিফিকেশন', href: '/admin/notifications?tab=system', icon: Sparkles },
          ]
        },
        { 
          name: 'অফলাইন ও সিঙ্ক', 
          href: '/admin/offline-sync', 
          icon: Database, 
          roles: ['super_admin', 'admin'],
          badge: 'PWA',
          badgeColor: 'bg-teal-500 text-white',
          subItems: [
            { name: 'ক্যাশ ম্যানেজমেন্ট', href: '/admin/offline-sync?tab=cache', icon: Database },
            { name: 'অফলাইন ডেটা', href: '/admin/offline-sync?tab=offline-data', icon: HardDrive },
            { name: 'সিঙ্ক কিউ (Queue)', href: '/admin/offline-sync?tab=sync-queue', icon: UploadCloud },
            { name: 'ব্যর্থ সিঙ্ক রিকুয়েস্ট', href: '/admin/offline-sync?tab=failed-sync', icon: AlertTriangle },
            { name: 'নেটওয়ার্ক স্ট্যাটাস', href: '/admin/offline-sync?tab=network-status', icon: Wifi },
          ]
        },
        { 
          name: 'অনুসন্ধান ও সার্চ', 
          href: '/admin/search', 
          icon: Search, 
          roles: ['super_admin', 'admin', 'editor', 'moderator'],
          badge: 'Meili',
          badgeColor: 'bg-emerald-500 text-white',
          subItems: [
            { name: 'মেইলি সার্চ ইঞ্জিন', href: '/admin/search?tab=meilisearch', icon: Database },
            { name: 'গ্লোবাল সার্চ', href: '/admin/search?tab=global', icon: SearchCode },
            { name: 'ফিল্টারিং ও কুয়েরি', href: '/admin/search?tab=filter', icon: Sliders },
            { name: 'এলাকা-ভিত্তিক অনুসন্ধান', href: '/admin/search?tab=area', icon: MapPin },
            { name: 'ভয়েস সার্চ ইন্টিগ্রেশন', href: '/admin/search?tab=voice', icon: Mic },
          ]
        },
        { 
          name: '💰 মনিটাইজেশন ও ওয়ালেট', 
          href: '/admin/monetization', 
          icon: DollarSign, 
          roles: ['super_admin', 'admin'],
          badge: 'New',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          subItems: [
            { name: 'ওয়ালেট ও আয় ওভারভিউ', href: '/admin/monetization?tab=overview', icon: DollarSign },
            { name: 'উইথড্রয়াল ও পেমেন্ট রিকুয়েস্ট', href: '/admin/monetization?tab=withdrawals', icon: FileCheck },
            { name: 'ক্রিয়েটর সাবস্ক্রিপশন প্ল্যান', href: '/admin/monetization?tab=subscriptions', icon: Sparkles },
            { name: 'রেফারেল সিস্টেম ম্যানেজমেন্ট', href: '/admin/monetization?tab=referrals', icon: Users },
          ]
        },
        { 
          name: 'আড্ডা মডারেশন ও রিপোর্ট হাব', 
          href: '/admin/moderation', 
          icon: ShieldAlert, 
          roles: ['super_admin', 'admin', 'moderator'],
          subItems: [
            { name: 'পোস্ট মডারেশন ও ফ্ল্যাগ', href: '/admin/moderation?tab=posts', icon: ShieldAlert },
            { name: 'কমেন্ট মডারেশন', href: '/admin/moderation?tab=comments', icon: MessageSquare },
            { name: 'ইউজার ফ্ল্যাগড রিপোর্ট', href: '/admin/moderation?tab=reports', icon: AlertCircle },
            { name: 'ব্যানড ও সাসপেন্ডেড ইউজার', href: '/admin/moderation?tab=banned', icon: UserX },
          ]
        },
        { 
          name: 'স্প্যাম ও ট্রাস্ট/সেফটি (Anti-Spam)', 
          href: '/admin/trust-safety', 
          icon: ShieldCheck, 
          roles: ['super_admin', 'admin', 'moderator'],
          subItems: [
            { name: 'সেফটি রুলস ওভারভিউ', href: '/admin/trust-safety?tab=overview', icon: ShieldCheck },
            { name: 'অটোমেটিক ফিল্টারিং রুলস', href: '/admin/trust-safety?tab=rules', icon: Sliders },
            { name: 'ব্ল্যাকলিস্টেড আইপি ও ডিভাইস', href: '/admin/trust-safety?tab=blacklist', icon: Lock },
            { name: 'ট্রাস্ট স্কোর সেটিংস', href: '/admin/trust-safety?tab=trust-score', icon: Activity },
          ]
        },
      ]
    },
    {
      title: 'সেবা ও ডিরেক্টরি ব্যবস্থাপনা',
      roles: ['super_admin', 'admin', 'editor', 'moderator'],
      items: [
        { 
          name: '৬৩টি সেবা ক্যাটালগ (Hub)', 
          href: '/admin/63-services', 
          icon: Sparkles, 
          roles: ['super_admin', 'admin', 'editor'],
          subItems: [
            { name: 'সকল ৬৩টি সেবা ক্যাটালগ', href: '/admin/63-services?tab=all', icon: Sparkles },
            { name: 'জরুরি ও চিকিৎসা সেবা', href: '/admin/63-services?tab=emergency', icon: Heart },
            { name: 'সরকারি ই-সেবা ক্যাটালগ', href: '/admin/63-services?tab=govt', icon: Building2 },
            { name: 'কৃষি ও ডিরেক্টরি সেবা', href: '/admin/63-services?tab=agriculture', icon: Sprout },
          ]
        },
        { 
          name: 'হাসপাতাল ও স্বাস্থ্য তথ্য', 
          href: '/admin/health', 
          icon: Heart, 
          roles: ['super_admin', 'admin', 'editor'],
          subItems: [
            { name: 'সকল হাসপাতাল ও ক্লিনিক', href: '/admin/health?tab=hospitals', icon: Heart },
            { name: 'ড্রাগস ও ফার্মেসি তালিকা', href: '/admin/health?tab=pharmacy', icon: Stethoscope },
            { name: 'স্পেশালিস্ট ডাক্তার ডিরেক্টরি', href: '/admin/health?tab=doctors', icon: UserCheck },
            { name: '২-ঘণ্টা অ্যাম্বুলেন্স সেবা', href: '/admin/health?tab=ambulance', icon: Truck },
          ]
        },
        { 
          name: 'রক্তদাতা নেটওয়ার্ক', 
          href: '/admin/blood-donors', 
          icon: Droplets, 
          roles: ['super_admin', 'admin'],
          subItems: [
            { name: 'রক্তদাতা ডিরেক্টরি', href: '/admin/blood-donors?tab=donors', icon: Droplets },
            { name: 'জরুরি রক্ত আবেদনসমূহ', href: '/admin/blood-donors?tab=requests', icon: AlertCircle },
            { name: 'ব্ল্যাকলিস্ট ও ফেক আইডি', href: '/admin/blood-donors?tab=blacklist', icon: UserX },
          ]
        },
        { 
          name: 'ই-সেবা আবেদনসমূহ', 
          href: '/admin/e-services', 
          icon: FileText, 
          roles: ['super_admin', 'admin'],
          subItems: [
            { name: 'সকল ই-সেবা আবেদন', href: '/admin/e-services?status=all', icon: FileText },
            { name: 'পেন্ডিং আবেদনপত্র', href: '/admin/e-services?status=pending', icon: Clock },
            { name: 'সম্পন্নকৃত আবেদনপত্র', href: '/admin/e-services?status=completed', icon: CheckCircle2 },
          ]
        },
      ]
    },
    {
      title: 'কনটেন্ট ও পাবলিশিং',
      roles: ['super_admin', 'admin', 'editor'],
      items: [
        { 
          name: 'কন্টেন্ট হাব (Master CMS)', 
          href: '/admin/content', 
          icon: Sparkles, 
          roles: ['super_admin', 'admin', 'editor'],
          subItems: [
            { name: 'সংবাদ ও পুঠিয়া খবর', href: '/admin/news', icon: Newspaper },
            { name: 'মেলা ও স্থানীয় ইভেন্ট', href: '/admin/events', icon: Calendar },
            { name: 'জরুরি নোটিশ বোর্ড', href: '/admin/notices', icon: Bell },
            { name: 'পর্যটন ও রাজবাড়ি', href: '/admin/tourism', icon: Landmark },
            { name: 'হিরো স্লাইডার ও ব্যানার', href: '/admin/banners', icon: Sliders },
          ]
        },
        { 
          name: 'ফটো গ্যালারি হাব', 
          href: '/admin/gallery', 
          icon: ImageIcon, 
          roles: ['super_admin', 'admin', 'editor'],
          subItems: [
            { name: 'ফটো অ্যালবামসমূহ', href: '/admin/gallery?tab=photos', icon: ImageIcon },
            { name: 'ভিডিও গ্যালারি কন্টেন্ট', href: '/admin/gallery?tab=videos', icon: Video },
          ]
        },
        { 
          name: 'সিটিজেন ড্রয়ার ও মেনু কন্ট্রোল', 
          href: '/admin/main-menu', 
          icon: Menu, 
          roles: ['super_admin', 'admin'],
          badge: '১০ পেজ',
          badgeColor: 'bg-emerald-600 text-white',
          subItems: [
            { name: 'ড্রয়ার মেনু ও ক্রম নিয়ন্ত্রণ', href: '/admin/main-menu', icon: Menu },
            { name: 'পুঠিয়া সম্পর্কে (CMS)', href: '/admin/main-menu', icon: Info },
            { name: 'ব্যবহার নির্দেশিকা (CMS)', href: '/admin/main-menu', icon: ShieldCheck },
            { name: 'সাপোর্ট সেন্টার কনফিগ', href: '/admin/main-menu', icon: Headphones },
            { name: 'গোপনীয়তা ও ডাটা নীতি', href: '/admin/main-menu', icon: Shield },
            { name: 'রিভিউ ও অভিযোগ সেল', href: '/admin/main-menu', icon: Star },
            { name: 'মোবাইল অ্যাপ ও APK হাব', href: '/admin/main-menu', icon: Download },
            { name: 'সাইট ম্যানেজমেন্ট বিল্ডার', href: '/admin/site-management', icon: Globe },
          ]
        },
        { 
          name: 'সাব-মেনু ও কাস্টম পেজ', 
          href: '/admin/pages', 
          icon: FileText, 
          roles: ['super_admin', 'admin'],
          subItems: [
            { name: 'সকল কাস্টম পেজ', href: '/admin/pages?tab=all', icon: FileText },
            { name: 'নতুন কাস্টম পেজ তৈরি', href: '/admin/pages?tab=create', icon: Pencil },
          ]
        },
      ]
    },
    {
      title: 'সিস্টেম, ইউজার ও সেটিংস (Super Admin Only)',
      roles: ['super_admin', 'admin'],
      items: [
        { 
          name: 'ব্যবহারকারী ও নাগরিক তালিকা', 
          href: '/admin/users', 
          icon: Users, 
          roles: ['super_admin'],
          subItems: [
            { name: '🟢 রিয়েল-টাইম সক্রিয় ইউজার (Live)', href: '/admin/realtime-users', icon: Activity },
            { name: 'নিবন্ধিত সকল নাগরিক', href: '/admin/users?role=all', icon: Users },
            { name: 'ভেরিফাইড নাগরিক ডিরেক্টরি', href: '/admin/users?role=verified', icon: UserCheck },
            { name: 'ব্লকড ও ব্যানড আইডি', href: '/admin/users?role=banned', icon: UserX },
          ]
        },
        { 
          name: 'প্রোফাইল সিষ্টেম হাব', 
          href: '/admin/profiles', 
          icon: User, 
          roles: ['super_admin', 'admin', 'moderator'],
          subItems: [
            { name: 'প্রোফাইল হাব ওভারভিউ', href: '/admin/profiles?tab=overview', icon: User },
            { name: 'ডিজিটাল আইডি কার্ড সিষ্টেম', href: '/admin/profiles?tab=digital_id', icon: ShieldCheck },
          ]
        },
        { 
          name: 'অ্যাডমিন ও রোল টিম (Admin)', 
          href: '/admin/admins', 
          icon: Shield, 
          roles: ['super_admin'],
          subItems: [
            { name: 'অ্যাডমিন ম্যানেজমেন্ট টিম', href: '/admin/admins?tab=staff_list', icon: Shield },
            { name: 'পারমিশন ম্যাট্রিক্স', href: '/admin/admins?tab=permission_matrix', icon: Key },
            { name: 'সুপার অডিট ট্রেইল (Audit Log)', href: '/admin/audit-logs', icon: History },
          ]
        },
        { 
          name: 'রোল ও পারমিশন কন্ট্রোল (RBAC)', 
          href: '/admin/roles', 
          icon: Key, 
          roles: ['super_admin'],
          subItems: [
            { name: 'রোল পারমিশন ম্যাট্রিক্স', href: '/admin/roles?tab=matrix', icon: Key },
            { name: 'রোল এক্সেস পলিসি', href: '/admin/roles?tab=policy', icon: Lock },
          ]
        },
        { 
          name: 'প্ল্যাটফর্ম এনালাইটিক্স', 
          href: '/admin/analytics', 
          icon: Activity, 
          roles: ['super_admin', 'admin'],
          subItems: [
            { name: 'ভিজিটর ও ট্রাফিক ওভারভিউ', href: '/admin/analytics?tab=traffic', icon: BarChart2 },
            { name: 'ইউজার এনগেজমেন্ট রিপোর্ট', href: '/admin/analytics?tab=engagement', icon: Activity },
          ]
        },
        { 
          name: 'সিস্টেম সেটিংস', 
          href: '/admin/settings', 
          icon: Settings, 
          roles: ['super_admin'],
          subItems: [
            { name: 'ওয়েবসাইট সেটিংস', href: '/admin/settings?tab=website', icon: Globe },
            { name: 'লোগো ও ব্র্যান্ডিং', href: '/admin/settings?tab=logo', icon: ImageIcon },
            { name: 'ফুটার ও কপিরাইট', href: '/admin/settings?tab=footer', icon: FileText },
            { name: 'যোগাযোগের তথ্য', href: '/admin/settings?tab=contact', icon: Phone },
            { name: 'সোশ্যাল লিংকসমূহ', href: '/admin/settings?tab=social', icon: Share2 },
            { name: 'এসইও ও মেটাডাটা', href: '/admin/settings?tab=seo', icon: Search },
            { name: 'নোটিফিকেশন অ্যালার্ট', href: '/admin/settings?tab=notification', icon: Bell },
            { name: 'মেনটেনেন্স মোড', href: '/admin/settings?tab=maintenance', icon: Wrench },
          ]
        },
        {
          name: 'সিকিউরিটি সেটিংস',
          href: '/admin/security',
          icon: ShieldCheck,
          roles: ['super_admin'],
          subItems: [
            { name: 'সিকিউরিটি ওভারভিউ', href: '/admin/security?secTab=all', icon: Lock },
            { name: 'পাসওয়ার্ড পলিসি', href: '/admin/security?secTab=password-policy', icon: Key },
            { name: 'লগইন সিকিউরিটি', href: '/admin/security?secTab=login-security', icon: Key },
            { name: 'দ্বিমাত্রিক নিরাপত্তা (2FA)', href: '/admin/security?secTab=2fa', icon: ShieldCheck },
            { name: 'সেশন ম্যানেজমেন্ট', href: '/admin/security?secTab=session', icon: Clock },
            { name: 'লগইন হিস্টোরি', href: '/admin/security?secTab=login-history', icon: FileText },
            { name: 'সাসপিসিয়াস অ্যাক্টিভিটি', href: '/admin/security?secTab=suspicious', icon: ShieldAlert },
            { name: 'অ্যাডমিন মাস্টার পিন', href: '/admin/security?secTab=admin-security', icon: Shield },
          ]
        },
        { 
          name: 'ইউজার সাপোর্ট মেসেজ', 
          href: '/admin/support', 
          icon: HelpCircle, 
          roles: ['super_admin', 'admin'],
          subItems: [
            { name: 'নতুন মেসেজসমূহ', href: '/admin/support?status=unread', icon: HelpCircle },
            { name: 'পেনডিং সাপোর্ট টিকিট', href: '/admin/support?status=pending', icon: Clock },
            { name: 'সমাধানকৃত বিষয়সমূহ', href: '/admin/support?status=resolved', icon: CheckCircle2 },
          ]
        },
      ]
    }
  ], [roleConfig.dashboardHref]);

  // Filter sections and items based on role
  const visibleSections = useMemo(() => {
    return navSections
      .filter(section => section.roles.includes(effectiveRole))
      .map(section => ({
        ...section,
        items: section.items.filter(item => item.roles.includes(effectiveRole))
      }))
      .filter(section => section.items.length > 0);
  }, [navSections, effectiveRole]);

  // Mobile Bottom Navigation depending on role
  const mobileNavItems = useMemo(() => {
    if (effectiveRole === 'editor') {
      return [
        { name: 'ড্যাশবোর্ড', icon: LayoutDashboard, href: '/editor' },
        { name: 'সংবাদ', icon: Newspaper, href: '/admin/news' },
        { name: 'ইভেন্ট', icon: Calendar, href: '/admin/events' },
        { name: 'গ্যালারি', icon: ImageIcon, href: '/admin/gallery' },
        { name: 'নোটিশ', icon: Bell, href: '/admin/notices' },
      ];
    }
    if (effectiveRole === 'moderator') {
      return [
        { name: 'ড্যাশবোর্ড', icon: LayoutDashboard, href: '/moderator' },
        { name: 'মডারেশন', icon: ShieldAlert, href: '/admin/moderation' },
        { name: 'সেফটি হাব', icon: ShieldCheck, href: '/admin/trust-safety' },
        { name: 'নোটিফিকেশন', icon: Bell, href: '/admin/notifications' },
        { name: 'প্রোফাইল', icon: User, href: '/admin/profile' },
      ];
    }
    // Admin / Super Admin
    return [
      { name: 'ড্যাশবোর্ড', icon: LayoutDashboard, href: roleConfig.dashboardHref },
      { name: '৬৩টি সেবা', icon: Sparkles, href: '/admin/63-services' },
      { name: 'ব্যবসা', icon: Store, href: '/admin/businesses' },
      { name: 'ইউজার', icon: Users, href: '/admin/users' },
      { name: 'সেটিংস', icon: Settings, href: '/admin/settings' },
    ];
  }, [effectiveRole, roleConfig.dashboardHref]);

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("super_admin_session_active");
      await logout();
      navigate('/super-admin/login');
    } catch (error) {
      console.error('Failed to log out', error);
      sessionStorage.removeItem("super_admin_session_active");
      navigate('/super-admin/login');
    }
  };

  // Detect user activity to extend session
  useEffect(() => {
    const handleActivity = () => {
      if (!showWarningModal) {
        lastActiveRef.current = Date.now();
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [showWarningModal]);

  // Session monitor loop (Runs every 2 seconds)
  useEffect(() => {
    const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes session in milliseconds
    const WARNING_THRESHOLD = 60 * 1000; // 60 seconds warning threshold

    const interval = setInterval(() => {
      if (showWarningModal) return;

      const now = Date.now();
      const elapsed = now - lastActiveRef.current;

      if (elapsed >= (SESSION_TIMEOUT - WARNING_THRESHOLD)) {
        const remainingSeconds = Math.max(0, Math.ceil((SESSION_TIMEOUT - elapsed) / 1000));
        setSessionTimeLeft(remainingSeconds > 0 ? remainingSeconds : 60);
        setShowWarningModal(true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [showWarningModal]);

  // Real-time countdown when warning modal is visible
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | null = null;

    if (showWarningModal) {
      countdownInterval = setInterval(() => {
        setSessionTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval!);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showWarningModal]);

  const handleKeepSessionAlive = () => {
    lastActiveRef.current = Date.now();
    setShowWarningModal(false);
    setSessionTimeLeft(60);
    toast.success('আপনার সেশনটি সফলভাবে বর্ধিত করা হয়েছে!', {
      icon: '👑',
      style: {
        borderRadius: '16px',
        background: '#01412F',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '12px'
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900">
      {/* Sidebar Mobile Overlay with Glass Blur */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Unified Sidebar Container */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-xs ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header & Role Badge */}
        <div className="p-5 border-b border-slate-100/90 bg-gradient-to-b from-slate-50/80 via-white to-white flex flex-col gap-3.5 shrink-0">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/20 group-hover:scale-105 transition-transform">
                পু
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">আমাদের পুঠিয়া</h1>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">PRO</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">UNIFIED ADMIN SYSTEM</p>
              </div>
            </Link>
            <button 
              className="lg:hidden p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Dynamic Active Role Pill Card */}
          <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-[11px] font-bold shadow-2xs backdrop-blur-xs transition-all ${roleConfig.badgeColor}`}>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="shrink-0" />
              <span className="font-extrabold">{roleConfig.badge}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/60 px-2 py-0.5 rounded-full border border-black/5">
              <span className="text-[10px] font-extrabold text-emerald-800">অনলাইন</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Nav Menu */}
        <div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-7 custom-scrollbar">
          {visibleSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              {/* Section Header */}
              <div className="flex items-center gap-2 px-3 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs"></span>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/90 truncate">
                  {section.title}
                </p>
              </div>

              {/* Section Nav Items */}
              {section.items.map((item) => {
                const currentFullUrl = location.pathname + (location.search || '');
                const Icon = item.icon;
                const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                
                // Determine if parent or child is currently active
                const isExactActive = location.pathname === item.href;
                const isChildActive = Boolean(hasSubItems && item.subItems!.some(sub => {
                  const subQuery = sub.href.includes('?') ? sub.href.split('?')[1] : '';
                  if (currentFullUrl === sub.href) return true;
                  if (subQuery && location.search.includes(subQuery)) return true;
                  return false;
                }));
                const isParentPathActive = item.href !== '/admin' && item.href !== '/super-admin' && item.href !== '/editor' && item.href !== '/moderator' && location.pathname.startsWith(item.href);
                const isParentActive = isExactActive || isChildActive || isParentPathActive;
                
                const isExpanded = expandedMenus[item.name] ?? isParentActive;

                const handleMainClick = (e: React.MouseEvent) => {
                  if (hasSubItems) {
                    setExpandedMenus(prev => ({
                      ...prev,
                      [item.name]: !isExpanded
                    }));
                  } else {
                    setSidebarOpen(false);
                  }
                };
                
                const menuContent = (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isExactActive || (isParentPathActive && !hasSubItems)
                          ? 'bg-white/20 text-white shadow-2xs' 
                          : isParentActive
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className="truncate font-extrabold text-[12.5px]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-black shadow-2xs uppercase tracking-wide ${
                          item.badge === 'New' 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white animate-pulse' 
                            : item.badgeColor || 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {hasSubItems && (
                        <div className={`p-1 rounded-lg transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                          <ChevronDown size={14} />
                        </div>
                      )}
                    </div>
                  </>
                );

                const menuClass = `flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer group ${
                  isExactActive || (isParentPathActive && !hasSubItems)
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 translate-x-0.5' 
                    : isParentActive
                    ? 'bg-emerald-50/80 text-emerald-900 border border-emerald-200/60 font-black'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-0.5'
                }`;

                return (
                  <div key={item.name} className="space-y-1">
                    {hasSubItems ? (
                      <div
                        role="button"
                        onClick={handleMainClick}
                        className={menuClass}
                      >
                        {menuContent}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={handleMainClick}
                        className={menuClass}
                      >
                        {menuContent}
                      </Link>
                    )}

                    {/* Sub Items Dropdown Accordion Tree */}
                    <AnimatePresence initial={false}>
                      {hasSubItems && isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-3.5 pr-1 py-1 space-y-1.5 border-l-2 border-emerald-500/30 hover:border-emerald-500/60 ml-5 my-1.5 transition-colors"
                        >
                          {item.subItems!.map((sub) => {
                            const SubIcon = sub.icon || Globe;
                            const subQuery = sub.href.includes('?') ? sub.href.split('?')[1] : '';
                            let isSubActive = currentFullUrl === sub.href;
                            if (!isSubActive && subQuery) {
                              isSubActive = location.pathname === sub.href.split('?')[0] && location.search.includes(subQuery);
                            }
                            if (!isSubActive && (sub.href === '/admin/security' || sub.href === '/admin/security?secTab=all') && location.pathname === '/admin/security' && (!location.search || location.search.includes('secTab=all'))) {
                              isSubActive = true;
                            }
                            
                            return (
                              <Link
                                key={sub.name}
                                to={sub.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 min-h-[38px] group ${
                                  isSubActive 
                                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-sm font-extrabold translate-x-1' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 hover:translate-x-0.5'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                    isSubActive 
                                      ? 'bg-white/20 text-white shadow-2xs scale-105' 
                                      : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                                  }`}>
                                    <SubIcon size={13} />
                                  </div>
                                  <span className="truncate">{sub.name}</span>
                                </div>
                                {isSubActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs shrink-0 animate-pulse" />
                                )}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer & User Overview */}
        <div className="p-3.5 border-t border-slate-100/90 bg-gradient-to-b from-slate-50/50 to-slate-100/60 space-y-2 shrink-0">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <Eye size={15} className="text-emerald-200 group-hover:scale-110 transition-transform" />
            <span>মূল সাইট দেখুন (Live View)</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/50 rounded-2xl transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span>লগ আউট</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200/80 px-4 md:px-6 py-2 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div>
              <h2 className="text-sm font-black text-slate-900 hidden sm:block">
                {roleConfig.title}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                উপজেলা ডিজিটাল সেবা ও পরিচালনা ফ্রেমওয়ার্ক
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Link to Notifications */}
            <Link 
              to="/admin/notifications" 
              className="w-8 h-8 rounded-xl border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-50 relative transition-colors"
              title="অ্যাডমিন নোটিফিকেশন"
            >
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </Link>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-50 border border-slate-200/70 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-xs">
                  {user?.displayName ? user.displayName.charAt(0) : 'A'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-black text-slate-800 leading-tight truncate max-w-[110px]">{user?.displayName || 'অ্যাডমিন'}</p>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase">{effectiveRole.replace('_', ' ')}</p>
                </div>
                <ChevronDown size={12} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 z-50"
                  >
                    <div className="flex items-center gap-3 p-2 mb-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-xs">
                        {user?.displayName ? user.displayName.charAt(0) : 'A'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 text-xs truncate">{user?.displayName || 'অ্যাডমিন'}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded-sm">
                          {roleConfig.badge}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      {[
                        { icon: User, label: 'আমার প্রোফাইল', href: '/admin/profile' },
                        { icon: Pencil, label: 'প্রোফাইল এডিট করুন', href: '/admin/profile/edit' },
                        { icon: Lock, label: 'পাসওয়ার্ড ও নিরাপত্তা', href: '/admin/password' },
                        { icon: Settings, label: 'সিস্টেম সেটিংস', href: '/admin/settings' },
                        { icon: HelpCircle, label: 'সাহায্য ও সাপোর্ট', href: '/admin/support' },
                      ].map((item) => (
                        <Link 
                          key={item.label} 
                          to={item.href} 
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
                        >
                          <item.icon size={15} className="text-slate-400" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <button 
                          onClick={handleLogout} 
                          className="flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold w-full transition-colors cursor-pointer"
                        >
                          <LogOut size={15} />
                          লগআউট
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content Area - Full width edge-to-edge responsive layout */}
        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-2 sm:p-4 md:p-6 w-full min-h-full">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
        
        {/* Responsive Role-Adaptive Mobile Bottom Navigation */}
        <div className="lg:hidden bg-white border-t border-slate-200/80 px-2 py-1.5 flex justify-around items-center shrink-0 z-20 shadow-xs">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link 
                key={item.name} 
                to={item.href} 
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
                  isActive ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Session Expiry Warning Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Dark glass backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-slate-900 rounded-[28px] p-7 max-w-sm w-full border border-amber-100 dark:border-amber-950/40 shadow-2xl relative overflow-hidden text-center z-10"
            >
              {/* Alert Icon Badge */}
              <div className="relative flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center border-4 border-amber-100/50 dark:border-amber-900/20">
                  <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
                </div>
              </div>

              {/* Warnings Texts */}
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1.5">
                অ্যাডমিন সেশন শেষ হতে চলেছে!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                আপনি দীর্ঘ সময় ধরে নিষ্ক্রিয় আছেন। আপনার গুরুত্বপূর্ণ ডেটা বা কাজ যাতে হারিয়ে না যায়, সেজন্য অনুগ্রহ করে সেশনটি সচল রাখুন।
              </p>

              {/* Countdown Tracker Box */}
              <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/40 rounded-2xl py-3 px-4 mb-6">
                <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-1">
                  স্বয়ংক্রিয় লগ আউটের বাকি আছে
                </span>
                <span className="text-2xl font-black text-amber-600 font-mono tracking-tight animate-pulse">
                  {sessionTimeLeft} সেকেন্ড
                </span>
              </div>

              {/* Action Triggers */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleKeepSessionAlive}
                  className="w-full py-3 bg-[#01412F] hover:bg-[#013023] text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                >
                  👑 সেশন বর্ধিত করুন
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-rose-600 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  লগ আউট করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;

