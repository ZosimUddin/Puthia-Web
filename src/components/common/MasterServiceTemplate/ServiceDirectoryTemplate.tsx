import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search, Filter, ArrowUpDown, X, Plus, ArrowLeft, CheckCircle2, User, MapPin, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw, Sparkles,
  ShieldCheck, AlertTriangle, XCircle, Database, Edit3
} from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { getServiceConfig, ServiceConfig, PUTHIA_UNIONS } from '../../../config/servicesConfig';
import { PUTHIA_DIAGNOSTIC_MASTER_DIRECTORY } from '../../../data/diagnosticData';
import { DEFAULT_HEALTH_SERVICES } from '../../../data/healthData';
import { getFallbackData } from '../../../data/directoryFallbackData';
import { appCache } from '../../../utils/performanceCache';
import { UniversalServiceCard } from './UniversalServiceCard';
import { AddServiceModal } from './AddServiceModal';
import { SuggestCorrectionModal } from './SuggestCorrectionModal';
import { GlobalSkeletonLoader } from './GlobalSkeletonLoader';
import { GlobalEmptyState } from './GlobalEmptyState';
import { GlobalErrorState } from './GlobalErrorState';
import { GlobalSearchFilterBar } from '../GlobalSearchFilter/GlobalSearchFilterBar';
import { GlobalSearchFilterModal } from '../GlobalSearchFilter/GlobalSearchFilterModal';
import { useGlobalSearchFilter } from '../GlobalSearchFilter/useGlobalSearchFilter';
import Header from '../../home/Header';
import BottomNav from '../../home/BottomNavigation';
import Footer from '../../home/Footer';
import SEO from '../../SEO';
import { getServiceDirectorySchema } from '../../../utils/seoHelpers';

const toBengaliNumber = (num: number | string): string => {
  const englishToBengaliMap: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(num).replace(/[0-9]/g, (digit) => englishToBengaliMap[digit] || digit);
};

const getItemCountText = (count: number) => {
  const bnCount = toBengaliNumber(count);
  return `${bnCount} টি`;
};

interface ServiceDirectoryTemplateProps {
  serviceKeyParam?: string;
  isEmbedded?: boolean;
}

export const ServiceDirectoryTemplate: React.FC<ServiceDirectoryTemplateProps> = ({
  serviceKeyParam,
  isEmbedded = false,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const listTopRef = useRef<HTMLDivElement>(null);

  // Determine active service key
  const serviceKey = serviceKeyParam || params.serviceKey || 'doctor';
  const config: ServiceConfig = useMemo(() => getServiceConfig(serviceKey), [serviceKey]);

  // States for real data from Firestore
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Global Reusable Search & Filter Hook
  const {
    filters,
    setFilters,
    resetFilters,
    filteredItems,
    isFilterModalOpen,
    setIsFilterModalOpen,
    activeFilterCount,
  } = useGlobalSearchFilter(items, config.fieldsSchema);

  // Custom filters for To-Let Module
  const [toLetFilters, setToLetFilters] = useState<Record<string, string>>({
    union: 'all',
    rent_range: 'all',
    bedroom_count: 'all',
    property_type: 'all',
    usage_type: 'all',
    rent_or_sublet: 'all',
  });

  // Custom filters for Marketplace Module
  const [marketplaceFilters, setMarketplaceFilters] = useState<Record<string, string>>({
    union: 'all',
    price_range: 'all',
    condition: 'all',
    sale_type: 'all',
    price_sort: 'all',
  });

  const finalFilteredItems = useMemo(() => {
    if (config.id === 'house-rent') {
      return filteredItems.filter((item) => {
        // 1. Union Filter
        if (toLetFilters.union !== 'all') {
          const itemUnion = (item.union || item.address || '').toLowerCase();
          const filterUnion = toLetFilters.union.toLowerCase().replace('ইউনিয়ন', '').replace('সদর', '').trim();
          if (!itemUnion.includes(filterUnion)) return false;
        }
        
        // 2. Rent Range Filter
        if (toLetFilters.rent_range !== 'all') {
          const rentStr = String(item.rentAmount || item.rent || item.fee || item.price || '0');
          const rentVal = Number(rentStr.replace(/[^0-9]/g, '')) || 0;
          
          const range = toLetFilters.rent_range;
          if (range === 'under_3000' && rentVal >= 3000) return false;
          if (range === '3000_5000' && (rentVal < 3000 || rentVal > 5000)) return false;
          if (range === '5000_10000' && (rentVal < 5000 || rentVal > 10000)) return false;
          if (range === '10000_20000' && (rentVal < 10000 || rentVal > 20000)) return false;
          if (range === 'above_20000' && rentVal <= 20000) return false;
        }

        // 3. Bedroom Count Filter
        if (toLetFilters.bedroom_count !== 'all') {
          const roomDetailsStr = (item.roomDetails || item.title || item.description || '').toLowerCase();
          const range = toLetFilters.bedroom_count;
          if (range === '1_bed') {
            if (!roomDetailsStr.includes('১ রুম') && !roomDetailsStr.includes('1 room') && !roomDetailsStr.includes('১ টি') && !roomDetailsStr.includes('1টি') && !roomDetailsStr.includes('১টি')) return false;
          } else if (range === '2_bed') {
            if (!roomDetailsStr.includes('২ রুম') && !roomDetailsStr.includes('2 room') && !roomDetailsStr.includes('২ টি') && !roomDetailsStr.includes('2টি') && !roomDetailsStr.includes('২টি')) return false;
          } else if (range === '3_bed') {
            if (!roomDetailsStr.includes('৩ রুম') && !roomDetailsStr.includes('3 room') && !roomDetailsStr.includes('৩ টি') && !roomDetailsStr.includes('3টি') && !roomDetailsStr.includes('৩টি')) return false;
          } else if (range === '4plus_bed') {
            if (!roomDetailsStr.includes('৪ রুম') && !roomDetailsStr.includes('৫ রুম') && !roomDetailsStr.includes('4 room') && !roomDetailsStr.includes('5 room') && !roomDetailsStr.includes('৪টি') && !roomDetailsStr.includes('৫টি')) return false;
          }
        }

        // 4. Property Type Filter
        if (toLetFilters.property_type !== 'all') {
          const pType = toLetFilters.property_type;
          const textBlob = (item.rentType || item.title || item.description || '').toLowerCase();
          if (pType === 'family' && !textBlob.includes('family') && !textBlob.includes('ফ্যামিলি') && !textBlob.includes('পরিবার')) return false;
          if (pType === 'bachelor' && !textBlob.includes('bachelor') && !textBlob.includes('ব্যাচেলর') && !textBlob.includes('মেস') && !textBlob.includes('ছাত্র') && !textBlob.includes('ছাত্রী')) return false;
          if (pType === 'commercial' && !textBlob.includes('commercial') && !textBlob.includes('কমার্শিয়াল') && !textBlob.includes('দোকান') && !textBlob.includes('অফিস') && !textBlob.includes('গুদাম')) return false;
        }

        // 5. Usage Type Filter
        if (toLetFilters.usage_type !== 'all') {
          const uType = toLetFilters.usage_type;
          const textBlob = (item.rentType || item.title || item.description || '').toLowerCase();
          if (uType === 'residential') {
            const isComm = textBlob.includes('দোকান') || textBlob.includes('অফিস') || textBlob.includes('গুদাম') || textBlob.includes('commercial') || textBlob.includes('কমার্শিয়াল');
            if (isComm) return false;
          } else if (uType === 'commercial') {
            const isComm = textBlob.includes('দোকান') || textBlob.includes('অফিস') || textBlob.includes('গুদাম') || textBlob.includes('commercial') || textBlob.includes('কমার্শিয়াল') || textBlob.includes('স্পেস');
            if (!isComm) return false;
          }
        }

        // 6. Rent or Sublet Filter
        if (toLetFilters.rent_or_sublet !== 'all') {
          const sType = toLetFilters.rent_or_sublet;
          const textBlob = (item.rentType || item.title || item.description || '').toLowerCase();
          const isSublet = textBlob.includes('সাবলেট') || textBlob.includes('sublet') || textBlob.includes('রুমমেট') || textBlob.includes('roommate');
          if (sType === 'sublet' && !isSublet) return false;
          if (sType === 'full_rent' && isSublet) return false;
        }

        return true;
      });
    }

    if (config.id === 'marketplace') {
      let filtered = filteredItems.filter((item) => {
        // 1. Union Filter
        if (marketplaceFilters.union !== 'all') {
          const itemUnion = (item.union || item.address || item.location || '').toLowerCase();
          const filterUnion = marketplaceFilters.union.toLowerCase().replace('ইউনিয়ন', '').replace('সদর', '').trim();
          if (!itemUnion.includes(filterUnion)) return false;
        }

        // 2. Price Range Filter
        if (marketplaceFilters.price_range !== 'all') {
          const priceStr = String(item.price || item.rentAmount || item.rent || item.fee || '0');
          // Helper to extract digits (handles Bengali and English digits)
          const banglaDigits: Record<string, string> = {
            '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
            '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
          };
          let norm = '';
          for (let i = 0; i < priceStr.length; i++) {
            const char = priceStr[i];
            if (banglaDigits[char] !== undefined) norm += banglaDigits[char];
            else if (char >= '0' && char <= '9') norm += char;
          }
          const priceVal = Number(norm) || 0;

          const range = marketplaceFilters.price_range;
          if (range === 'under_1000' && priceVal >= 1000) return false;
          if (range === '1000_5000' && (priceVal < 1000 || priceVal > 5000)) return false;
          if (range === '5000_15000' && (priceVal < 5000 || priceVal > 15000)) return false;
          if (range === '15000_50000' && (priceVal < 15000 || priceVal > 50000)) return false;
          if (range === 'above_50000' && priceVal <= 50000) return false;
        }

        // 3. Condition Filter (New/Used)
        if (marketplaceFilters.condition !== 'all') {
          const cond = marketplaceFilters.condition;
          const textBlob = (item.condition || item.title || item.description || '').toLowerCase();
          if (cond === 'new' && !textBlob.includes('new') && !textBlob.includes('নতুন')) return false;
          if (cond === 'used' && !textBlob.includes('used') && !textBlob.includes('ব্যবহৃত') && !textBlob.includes('সেকেন্ড হ্যান্ড') && !textBlob.includes('পুরাতন')) return false;
        }

        // 4. Sale Type Filter
        if (marketplaceFilters.sale_type !== 'all') {
          const sType = marketplaceFilters.sale_type;
          const textBlob = (item.sale_type || item.saleType || item.title || item.description || '').toLowerCase();
          if (sType === 'sell' && !textBlob.includes('sell') && !textBlob.includes('বিক্রয়') && !textBlob.includes('বিক্রি')) return false;
          if (sType === 'exchange' && !textBlob.includes('exchange') && !textBlob.includes('বিনিময়')) return false;
          if (sType === 'giveaway' && !textBlob.includes('giveaway') && !textBlob.includes('দান') && !textBlob.includes('উপহার') && !textBlob.includes('ফ্রি') && !textBlob.includes('free')) return false;
        }

        return true;
      });

      // 5. Price Sort Filter
      if (marketplaceFilters.price_sort !== 'all') {
        const sortType = marketplaceFilters.price_sort;
        filtered = [...filtered].sort((a, b) => {
          const parseP = (priceStr: any) => {
            const str = String(priceStr || '0');
            const banglaDigits: Record<string, string> = {
              '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
              '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
            };
            let norm = '';
            for (let i = 0; i < str.length; i++) {
              const char = str[i];
              if (banglaDigits[char] !== undefined) norm += banglaDigits[char];
              else if (char >= '0' && char <= '9') norm += char;
            }
            return Number(norm) || 0;
          };
          const priceA = parseP(a.price || a.rentAmount || a.rent || a.fee);
          const priceB = parseP(b.price || b.rentAmount || b.rent || b.fee);
          return sortType === 'asc' ? priceA - priceB : priceB - priceA;
        });
      }

      return filtered;
    }

    return filteredItems;
  }, [config.id, filteredItems, toLetFilters, marketplaceFilters]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showGeneralCorrectionModal, setShowGeneralCorrectionModal] = useState<boolean>(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Real-time Firestore query listener with instant memory + storage caching
  useEffect(() => {
    const colName = config.collectionName;
    const cacheKey = `service_items_${colName}`;

    // 1. Instant Cache Hit (0ms latency for seamless navigation)
    const cachedData = appCache.get<Record<string, any>[]>(cacheKey);
    if (cachedData && cachedData.length > 0) {
      setItems(cachedData);
      setLoading(false);
    } else {
      setLoading(true);
    }

    setError(null);
    setCurrentPage(1);

    const q = query(collection(db, colName));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rawList: Record<string, any>[] = [];
        snapshot.forEach((docSnap) => {
          rawList.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Only show approved/published items or verified system items to public users
        const list = rawList.filter((item) => {
          if (item.status) {
            const s = String(item.status).toLowerCase();
            if (s === 'pending' || s === 'rejected' || s === 'needs_correction' || s === 'draft') {
              return false;
            }
          }
          if (item.isVerified === false && item.status === 'pending') {
            return false;
          }
          return true;
        });

        // Always merge master diagnostic directory or health services with live Firestore items
        if (config.id === 'diagnostic' || colName === 'diagnostics') {
          const merged: Record<string, any>[] = [...PUTHIA_DIAGNOSTIC_MASTER_DIRECTORY];

          list.forEach((fsItem) => {
            const fsName = (fsItem.name || fsItem.title || '').trim().toLowerCase();
            const existingIndex = merged.findIndex(
              (m) =>
                m.id === fsItem.id ||
                (m.name && m.name.trim().toLowerCase() === fsName) ||
                (fsItem.name && m.name && (m.name.includes(fsItem.name) || fsItem.name.includes(m.name)))
            );

            if (existingIndex >= 0) {
              merged[existingIndex] = {
                ...merged[existingIndex],
                ...fsItem,
                servicesList:
                  Array.isArray(fsItem.servicesList) && fsItem.servicesList.length > 0
                    ? fsItem.servicesList
                    : merged[existingIndex].servicesList,
                doctorsList:
                  Array.isArray(fsItem.doctorsList) && fsItem.doctorsList.length > 0
                    ? fsItem.doctorsList
                    : merged[existingIndex].doctorsList,
              };
            } else if (fsItem.name || fsItem.title || fsItem.institutionName) {
              merged.unshift(fsItem);
            }
          });

          setItems(merged);
          appCache.set(cacheKey, merged);
        } else if (config.id === 'hospital' || colName === 'hospitals') {
          const merged: Record<string, any>[] = [...DEFAULT_HEALTH_SERVICES];

          list.forEach((fsItem) => {
            const fsName = (fsItem.name || fsItem.title || '').trim().toLowerCase();
            const existingIndex = merged.findIndex(
              (m) =>
                m.id === fsItem.id ||
                (m.name && m.name.trim().toLowerCase() === fsName) ||
                (fsItem.name && m.name && (m.name.includes(fsItem.name) || fsItem.name.includes(m.name)))
            );

            if (existingIndex >= 0) {
              merged[existingIndex] = {
                ...merged[existingIndex],
                ...fsItem,
              };
            } else if (fsItem.name || fsItem.title || fsItem.institutionName) {
              merged.unshift(fsItem);
            }
          });

          setItems(merged);
          appCache.set(cacheKey, merged);
        } else {
          if (list.length === 0) {
            const fallback = getFallbackData(colName);
            setItems(fallback);
            appCache.set(cacheKey, fallback);
          } else {
            setItems(list);
            appCache.set(cacheKey, list);
          }
        }
        setLoading(false);
      },
      (err) => {
        console.warn(`Error listening to collection ${colName} (offline/quota):`, err?.message || err);
        const cached = appCache.get(cacheKey);
        if (cached && Array.isArray(cached) && cached.length > 0) {
          setItems(cached);
          setError(null);
        } else if (config.id === 'diagnostic' || colName === 'diagnostics') {
          setItems(PUTHIA_DIAGNOSTIC_MASTER_DIRECTORY);
          setError(null);
        } else if (config.id === 'hospital' || colName === 'hospitals') {
          setItems(DEFAULT_HEALTH_SERVICES);
          setError(null);
        } else {
          const fallback = getFallbackData(colName);
          setItems(fallback);
          setError(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [config.collectionName]);

  // Toggle Save / Favorite
  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize, toLetFilters, marketplaceFilters]);

  // Total count & Pagination Math using Global Filtered Items (or finalFilteredItems)
  const totalItems = finalFilteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentPaginatedItems = useMemo(() => {
    return finalFilteredItems.slice(startIndex, endIndex);
  }, [finalFilteredItems, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (listTopRef.current) {
        listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const verifiedCount = items.filter((i) => i.isVerified === true || i.verificationStatus === 'verified' || i.status === 'approved').length;

  // Generate pagination numbers array with ellipsis
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const renderToLetFilters = () => {
    if (config.id !== 'house-rent') return null;

    return (
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 px-2 bg-slate-100/50 rounded-2xl border border-slate-200/40 mt-1">
        {config.filters?.map((filter) => {
          const value = toLetFilters[filter.id] || 'all';
          return (
            <div key={filter.id} className="flex items-center gap-1 shrink-0">
              <select
                value={value}
                onChange={(e) =>
                  setToLetFilters((prev) => ({
                    ...prev,
                    [filter.id]: e.target.value,
                  }))
                }
                className="px-2.5 py-1.5 bg-white text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-3xs"
              >
                <option value="all">{filter.label} (সব)</option>
                {filter.options?.map((opt: any) => {
                  const isObj = typeof opt === 'object' && opt !== null;
                  const optVal = isObj ? opt.value : opt;
                  const optLabel = isObj ? opt.label : opt;
                  return (
                    <option key={optVal} value={optVal}>
                      {optLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
        {Object.values(toLetFilters).some((val) => val !== 'all') && (
          <button
            type="button"
            onClick={() =>
              setToLetFilters({
                union: 'all',
                rent_range: 'all',
                bedroom_count: 'all',
                property_type: 'all',
                usage_type: 'all',
                rent_or_sublet: 'all',
              })
            }
            className="px-2.5 py-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl transition-all border border-rose-200 hover:border-rose-600 cursor-pointer text-xs font-black shrink-0 flex items-center gap-1 active:scale-95 bg-white shadow-3xs"
            title="ফিল্টার রিসেট করুন"
          >
            <RotateCcw size={12} />
            <span>রিসেট</span>
          </button>
        )}
      </div>
    );
  };

  const renderMarketplaceFilters = () => {
    if (config.id !== 'marketplace') return null;

    return (
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 px-2 bg-slate-100/50 rounded-2xl border border-slate-200/40 mt-1">
        {config.filters?.map((filter) => {
          const value = marketplaceFilters[filter.id] || 'all';
          return (
            <div key={filter.id} className="flex items-center gap-1 shrink-0">
              <select
                value={value}
                onChange={(e) =>
                  setMarketplaceFilters((prev) => ({
                    ...prev,
                    [filter.id]: e.target.value,
                  }))
                }
                className="px-2.5 py-1.5 bg-white text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-3xs"
              >
                <option value="all">{filter.label}</option>
                {filter.options?.map((opt: any) => {
                  const isObj = typeof opt === 'object' && opt !== null;
                  const optVal = isObj ? opt.value : opt;
                  const optLabel = isObj ? opt.label : opt;
                  return (
                    <option key={optVal} value={optVal}>
                      {optLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
        {Object.values(marketplaceFilters).some((val) => val !== 'all') && (
          <button
            type="button"
            onClick={() =>
              setMarketplaceFilters({
                union: 'all',
                price_range: 'all',
                condition: 'all',
                sale_type: 'all',
                price_sort: 'all',
              })
            }
            className="px-2.5 py-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl transition-all border border-rose-200 hover:border-rose-600 cursor-pointer text-xs font-black shrink-0 flex items-center gap-1 active:scale-95 bg-white shadow-3xs"
            title="ফিল্টার রিসেট করুন"
          >
            <RotateCcw size={12} />
            <span>রিসেট</span>
          </button>
        )}
      </div>
    );
  };

  if (isEmbedded) {
    return (
      <div ref={listTopRef} className="w-full space-y-4 pb-28">
        {/* SECTION 1: Global Reusable Search & Filter Engine Bar */}
        <GlobalSearchFilterBar
          filters={filters}
          setFilters={setFilters}
          onOpenFilterModal={() => setIsFilterModalOpen(true)}
          placeholder={config.searchPlaceholder || 'ডাক্তারের নাম, বিশেষজ্ঞতা, চেম্বার, স্থান বা বিষয় লিখে সার্ভিস খুঁজুন...'}
          categoryOptions={config.categories}
          activeFilterCount={activeFilterCount}
        />

        {/* SECTION 2: Horizontal Category Pills */}
        {config.categories && config.categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {config.categories.map((cat) => {
              const isSelected = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, category: cat.id }))}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black border transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                  }`}
                >
                  <span className="text-base">{cat.icon || config.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {renderToLetFilters()}
        {renderMarketplaceFilters()}

        {/* SECTION 4: Real Data Listing */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <GlobalSkeletonLoader count={4} />
          ) : error ? (
            <GlobalErrorState message={error} onRetry={() => window.location.reload()} />
          ) : finalFilteredItems.length === 0 ? (
            <GlobalEmptyState
              onAddClick={() => setShowAddModal(true)}
            />
          ) : (
            <>
              {currentPaginatedItems.map((item) => (
                <UniversalServiceCard
                  key={item.id}
                  item={item}
                  config={config}
                  isSaved={savedIds.includes(item.id)}
                  onToggleSave={handleToggleSave}
                  onSelect={(selectedDoc) => {
                    navigate(`/service/${serviceKey}/${selectedDoc.id}`);
                  }}
                />
              ))}

              {/* Complete Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-row items-center justify-between gap-1.5 sm:gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs mt-6 mb-12 w-full">
                  {/* Previous Button */}
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`py-2.5 px-3 sm:px-4 rounded-xl text-xs font-black flex items-center gap-1 border transition-all cursor-pointer whitespace-nowrap min-h-[40px] touch-manipulation ${
                      currentPage === 1
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs active:scale-95'
                    }`}
                  >
                    <ChevronLeft size={16} />
                    <span>পূর্ববর্তী</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full py-1">
                    {getPaginationNumbers().map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-slate-400">
                            ...
                          </span>
                        );
                      }
                      const isCurrent = currentPage === p;
                      return (
                        <button
                          key={`page-${p}`}
                          type="button"
                          onClick={() => handlePageChange(Number(p))}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center cursor-pointer touch-manipulation ${
                            isCurrent
                              ? 'bg-[#006a4e] text-white shadow-md scale-105'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`py-2.5 px-3 sm:px-4 rounded-xl text-xs font-black flex items-center gap-1 border transition-all cursor-pointer whitespace-nowrap min-h-[40px] touch-manipulation ${
                      currentPage === totalPages
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs active:scale-95'
                    }`}
                  >
                    <span>পরবর্তী</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Global Modals for Embedded Layout */}
        <AddServiceModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          config={config}
        />
        {showGeneralCorrectionModal && (
          <SuggestCorrectionModal
            isOpen={showGeneralCorrectionModal}
            onClose={() => setShowGeneralCorrectionModal(false)}
            target={{
              title: `${config.title} ডিরেক্টরি`,
              serviceId: config.id,
              serviceTitle: config.title,
              collectionName: config.collectionName,
            }}
            onSuccess={() => {
              setShowGeneralCorrectionModal(false);
            }}
          />
        )}
        <GlobalSearchFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          setFilters={setFilters}
          onReset={resetFilters}
          totalResultsCount={totalItems}
          categoryOptions={config.categories}
          serviceTitle={config.title}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* Dynamic SEO & Meta tags & JSON-LD Structured Data for 60 Services */}
      <SEO
        title={`${config.title} তালিকা - পুঠিয়া`}
        description={`${config.subtitle}। পুঠিয়া উপজেলার সকল নির্ভরযোগ্য ও যাচাইকৃত ${config.title} তালিকা, ফোন নম্বর, ঠিকানা ও চেম্বার সময়সূচী।`}
        keywords={`${config.title}, পুঠিয়া ${config.title}, পুঠিয়া উপজেলা, রাজশাহী, বানেশ্বর, পুঠিয়া সেবা ডিরেক্টরি, ${config.searchPlaceholder}`}
        path={`/service/${serviceKey}`}
        type="website"
        jsonLd={getServiceDirectorySchema(config, finalFilteredItems.length)}
      />

      <Header />

      <main className="flex-1 pb-6">
        {/* Banner Section - Brand Green Theme */}
        <div className="bg-[#006a4e] text-white pt-4 pb-10 px-4 sm:px-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            {/* Navigation & Action Row inside Banner */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95"
                title="পূর্ববর্তী পেজে ফিরে যান"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGeneralCorrectionModal(true)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95"
                  title="পুরোনো তথ্য সংশোধন"
                >
                  <Edit3 size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="p-2 rounded-full bg-white hover:bg-emerald-50 text-[#006a4e] border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95 shadow-sm"
                  title="নতুন তথ্য যোগ করুন"
                >
                  <Plus size={18} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-5xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{config.title}</span>
                </h1>
                
                {/* Dynamic Item Count Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#00543e]/90 text-emerald-100 border border-emerald-300/30 shadow-2xs backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>
                    {getItemCountText(finalFilteredItems.length)}
                  </span>
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-xl text-emerald-100 font-medium max-w-2xl leading-relaxed mt-1">
                {config.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div ref={listTopRef} className="max-w-4xl mx-auto w-full px-4 sm:px-6 -mt-5 relative z-20 space-y-3.5 pb-8">

          {/* SECTION 1: Global Reusable Search & Filter Engine Bar */}
          <GlobalSearchFilterBar
            filters={filters}
            setFilters={setFilters}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
            placeholder={config.searchPlaceholder || 'ডাক্তারের নাম, বিশেষজ্ঞতা, চেম্বার, স্থান বা বিষয় লিখে সার্ভিস খুঁজুন...'}
            categoryOptions={config.categories}
            activeFilterCount={activeFilterCount}
          />

          {/* SECTION 2: Horizontal Category Pills (Inline Pill Style like Image 2) */}
          {config.categories && config.categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {config.categories.map((cat) => {
                const isSelected = filters.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, category: cat.id }))}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm md:text-xl font-black border transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap active:scale-95 ${
                      isSelected
                        ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                    }`}
                  >
                    <span className="text-base">{cat.icon || config.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {renderToLetFilters()}
          {renderMarketplaceFilters()}

          {/* SECTION 4: Real Data Listing */}
          <div className="space-y-3 pt-1">
            {loading ? (
              <GlobalSkeletonLoader count={4} />
            ) : error ? (
              <GlobalErrorState message={error} onRetry={() => window.location.reload()} />
            ) : finalFilteredItems.length === 0 ? (
              <GlobalEmptyState
                onAddClick={() => setShowAddModal(true)}
              />
            ) : (
              <>
                {currentPaginatedItems.map((item) => (
                  <UniversalServiceCard
                    key={item.id}
                    item={item}
                    config={config}
                    isSaved={savedIds.includes(item.id)}
                    onToggleSave={handleToggleSave}
                    onSelect={(selectedDoc) => {
                      navigate(`/service/${serviceKey}/${selectedDoc.id}`);
                    }}
                  />
                ))}

                {/* Complete Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-row items-center justify-between gap-1.5 sm:gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs mt-6 mb-16 w-full">
                    {/* Previous Button */}
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`py-2.5 px-3 sm:px-4 rounded-xl text-xs font-black flex items-center gap-1 border transition-all cursor-pointer whitespace-nowrap min-h-[40px] touch-manipulation ${
                        currentPage === 1
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs active:scale-95'
                      }`}
                    >
                      <ChevronLeft size={16} />
                      <span>পূর্ববর্তী</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full py-1">
                      {getPaginationNumbers().map((p, idx) => {
                        if (p === '...') {
                          return (
                            <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-slate-400">
                              ...
                            </span>
                          );
                        }
                        const isCurrent = currentPage === p;
                        return (
                          <button
                            key={`page-${p}`}
                            type="button"
                            onClick={() => handlePageChange(Number(p))}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center cursor-pointer touch-manipulation ${
                              isCurrent
                                ? 'bg-[#006a4e] text-white shadow-md scale-105'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`py-2.5 px-3 sm:px-4 rounded-xl text-xs font-black flex items-center gap-1 border transition-all cursor-pointer whitespace-nowrap min-h-[40px] touch-manipulation ${
                        currentPage === totalPages
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs active:scale-95'
                      }`}
                    >
                      <span>পরবর্তী</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add Information Form Modal */}
      <AddServiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        config={config}
      />

      {/* Suggest Correction Modal */}
      {showGeneralCorrectionModal && (
        <SuggestCorrectionModal
          isOpen={showGeneralCorrectionModal}
          onClose={() => setShowGeneralCorrectionModal(false)}
          target={{
            title: `${config.title} ডিরেক্টরি`,
            serviceId: config.id,
            serviceTitle: config.title,
            collectionName: config.collectionName,
          }}
          onSuccess={() => {
            setShowGeneralCorrectionModal(false);
          }}
        />
      )}

      {/* Global Search & Filter Engine Modal */}
      <GlobalSearchFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onReset={resetFilters}
        totalResultsCount={totalItems}
        categoryOptions={config.categories}
        serviceTitle={config.title}
      />

      <Footer />
      <BottomNav activeTab="home" onTabChange={() => navigate('/')} />
    </div>
  );
};
