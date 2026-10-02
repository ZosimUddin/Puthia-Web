import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListSkeleton } from './Skeleton';
import { UnifiedHeroHeader, UnifiedEmptyState } from './UnifiedDesignSystem';
import { Plus, AlertCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../home/Header';
import Footer from '../home/Footer';
import BottomNavigation from '../home/BottomNavigation';

interface ModulePageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badgeText?: string;
  loading?: boolean;
  error?: string | null;
  onAddClick?: () => void;
  searchPlaceholder?: string;
  onSearchChange?: (term: string) => void;
  filters?: { id: string; label: string }[];
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
  children: React.ReactNode;
  emptyMessage?: string;
  itemCount: number;
  showAddButton?: boolean;
  addButtonLabel?: string;
  addCategory?: "emergency" | "notice" | "tolet" | "blood" | "lostfound" | "complaint" | "event" | "shop";
}

const ModulePageLayout: React.FC<ModulePageLayoutProps> = ({
  title,
  subtitle,
  icon,
  badgeText,
  loading = false,
  error = null,
  onAddClick,
  searchPlaceholder = "অনুসন্ধান করুন...",
  onSearchChange,
  filters = [],
  activeFilter,
  onFilterChange,
  children,
  emptyMessage = "কোন তথ্য পাওয়া যায়নি",
  itemCount,
  showAddButton = false,
  addButtonLabel = "নতুন যুক্ত করুন",
  addCategory
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    onSearchChange?.(val);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      <Header />
      
      <main className="flex-1 pb-32">
        {/* Unified Green Hero Header */}
        <UnifiedHeroHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          badgeText={badgeText}
          onAddClick={onAddClick}
          addCategory={addCategory}
          showAddButton={showAddButton || !!addCategory}
          rightAction={
            onSearchChange ? (
              <button 
                onClick={() => {
                  setShowSearch(!showSearch);
                  if (showSearch) {
                    handleSearch("");
                  }
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                  showSearch 
                    ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                }`}
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            ) : badgeText ? (
              <span className="text-[11px] font-bold bg-white/15 text-emerald-100 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-sm">
                {badgeText}
              </span>
            ) : undefined
          }
          searchQuery={showSearch ? searchTerm : undefined}
          onSearchChange={showSearch ? handleSearch : undefined}
          searchPlaceholder={searchPlaceholder}
        >
          {/* Filters inside Hero Header */}
          {filters.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => onFilterChange?.(filter.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === filter.id
                      ? "bg-white text-[#0E8F5B] shadow-sm"
                      : "bg-white/15 text-emerald-100 hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </UnifiedHeroHeader>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto w-full px-4 relative min-h-[400px]">
          {loading ? (
            <div className="animate-in fade-in duration-500">
              <ListSkeleton />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center px-6 py-16 bg-white rounded-[24px] border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800">একটু সমস্যা হয়েছে!</h3>
                <p className="text-xs font-bold text-rose-600 max-w-xs">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-5 py-2 bg-rose-600 text-white rounded-2xl text-xs font-black hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            </div>
          ) : itemCount > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          ) : (
            <UnifiedEmptyState 
              title={emptyMessage || "এখনও কোনো তথ্য পাওয়া যায়নি"}
              description="আপনার তথ্য যোগ করে এই বিভাগটি সমৃদ্ধ করুন।"
              onAddClick={onAddClick}
              addButtonLabel={addButtonLabel}
              addCategory={addCategory}
            />
          )}
        </div>
      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default ModulePageLayout;
