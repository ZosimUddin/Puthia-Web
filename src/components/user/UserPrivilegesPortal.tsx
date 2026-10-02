import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  FolderDown, 
  Bookmark, 
  AlertTriangle, 
  Star, 
  User, 
  ArrowLeft, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import MyApplications from './MyApplications';
import MyDownloads from './MyDownloads';
import MyBookmarks from './MyBookmarks';
import MyComplaints from './MyComplaints';
import MyReviews from './MyReviews';
import { MySubmissionsManager } from '../common/MasterServiceTemplate/MySubmissionsManager';
import { UserRolePermissionsMatrixView } from './UserRolePermissionsMatrix';

export type UserTabType = 'submissions' | 'applications' | 'downloads' | 'bookmarks' | 'complaints' | 'reviews' | 'permissions';

interface UserPrivilegesPortalProps {
  initialTab?: UserTabType;
}

const UserPrivilegesPortal: React.FC<UserPrivilegesPortalProps> = ({ initialTab = 'submissions' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine active tab from URL param or props or route path
  const tabFromUrl = searchParams.get('tab') as UserTabType;
  const [activeTab, setActiveTab] = useState<UserTabType>(() => {
    if (location.pathname === '/my-submissions') return 'submissions';
    if (location.pathname === '/my-applications') return 'applications';
    if (location.pathname === '/my-downloads') return 'downloads';
    if (location.pathname === '/my-bookmarks') return 'bookmarks';
    if (location.pathname === '/my-complaints') return 'complaints';
    if (location.pathname === '/my-reviews') return 'reviews';
    if (location.pathname === '/my-permissions') return 'permissions';
    return tabFromUrl || initialTab;
  });

  useEffect(() => {
    if (location.pathname === '/my-submissions') setActiveTab('submissions');
    else if (location.pathname === '/my-applications') setActiveTab('applications');
    else if (location.pathname === '/my-downloads') setActiveTab('downloads');
    else if (location.pathname === '/my-bookmarks') setActiveTab('bookmarks');
    else if (location.pathname === '/my-complaints') setActiveTab('complaints');
    else if (location.pathname === '/my-reviews') setActiveTab('reviews');
    else if (location.pathname === '/my-permissions') setActiveTab('permissions');
    else if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [location.pathname, tabFromUrl]);

  const handleTabChange = (tab: UserTabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    {
      id: 'submissions',
      label: 'আমার যোগ করা তথ্য',
      icon: Sparkles,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-300 font-black'
    },
    {
      id: 'applications',
      label: 'আমার আবেদন',
      icon: FileText,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'downloads',
      label: 'আমার ডাউনলোড',
      icon: FolderDown,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: 'bookmarks',
      label: 'আমার বুকমার্ক',
      icon: Bookmark,
      color: 'text-rose-600 bg-rose-50 border-rose-200'
    },
    {
      id: 'complaints',
      label: 'আমার অভিযোগ',
      icon: AlertTriangle,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      id: 'reviews',
      label: 'আমার রিভিউ',
      icon: Star,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      id: 'permissions',
      label: 'রোল ও পারমিশন',
      icon: ShieldCheck,
      color: 'text-teal-700 bg-teal-50 border-teal-200'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-4 py-0 sm:py-4 space-y-4 sm:space-y-6">
      {/* Main Tab Content */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'submissions' && <MySubmissionsManager />}
            {activeTab === 'applications' && <MyApplications />}
            {activeTab === 'downloads' && <MyDownloads />}
            {activeTab === 'bookmarks' && <MyBookmarks />}
            {activeTab === 'complaints' && <MyComplaints />}
            {activeTab === 'reviews' && <MyReviews />}
            {activeTab === 'permissions' && <UserRolePermissionsMatrixView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserPrivilegesPortal;
