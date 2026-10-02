import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Search, Filter, Calendar, MapPin, 
  Upload, Star, Image as ImageIcon, Eye,
  ChevronRight, ArrowRight, Activity, X, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GALLERY_CATEGORIES, GALLERY_FAQS, UNIONS } from './constants';
import { PhotoAlbum } from './types';
import { collection, query, where, getDocs, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Skeleton } from '../../../components/Skeleton';
import { UnifiedHeroHeader } from '../../../components/common/UnifiedDesignSystem';
import Header from '../../../components/home/Header';
import Footer from '../../../components/home/Footer';
import BottomNavigation from '../../../components/home/BottomNavigation';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Mock data fallback if database is empty
const MOCK_ALBUMS: PhotoAlbum[] = [
  {
    id: 'mock-1',
    title: 'পুঠিয়া রাজবাড়ীর প্রাচীন ঐতিহ্য',
    description: 'রাজবাড়ীর চারপাশের দৃশ্য ও ঐতিহাসিক মন্দিরের ছবি',
    category: 'sights',
    union: 'পুঠিয়া পৌরসভা',
    year: '2023',
    coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop',
    photos: Array(12).fill(null).map((_, i) => ({ 
      id: `p1-${i}`, url: `https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=800&auto=format&fit=crop`, caption: `ঐতিহাসিক দৃশ্য ${i+1}`, dateAdded: '2023-10-15', views: 10 + i,
      likes: 5 + i, tags: ['ঐতিহ্য'], location: 'পুঠিয়া', mapUrl: 'https://maps.google.com/?q=Puthia', isFeatured: i === 0, photographer: 'হাসান মাহমুদ'
    })),
    uploadDate: '2023-10-15',
    views: 1250,
    likes: 345,
    status: 'approved',
    photographer: 'হাসান মাহমুদ'
  },
  {
    id: 'mock-2',
    title: 'ঈদের আনন্দ ও উৎসব',
    description: 'ঈদের নামাজ ও উৎসবের আনন্দময় মুহূর্ত',
    category: 'events',
    union: 'বানেশ্বর ইউনিয়ন',
    year: '2023',
    coverImage: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=800&auto=format&fit=crop',
    photos: Array(8).fill(null).map((_, i) => ({ 
      id: `p2-${i}`, url: `https://images.unsplash.com/photo-${1510000000000 + i}?q=80&w=800&auto=format&fit=crop`, caption: `ঈদের আনন্দ ${i+1}`, dateAdded: '2023-04-22', views: 5 + i,
      likes: 2 + i, tags: ['উৎসব', 'ঈদ'], location: 'বানেশ্বর', isFeatured: false, photographer: 'রহিম শেখ'
    })),
    uploadDate: '2023-04-22',
    views: 840,
    likes: 210,
    status: 'approved',
    photographer: 'রহিম শেখ'
  },
  {
    id: 'mock-3',
    title: 'কৃষকের হাসি ও সোনালী ফসল',
    description: 'ধান কাটার মৌসুমে কৃষকদের ব্যস্ততা ও প্রাকৃতিক সৌন্দর্য',
    category: 'agriculture',
    union: 'জীয়নপুর ইউনিয়ন',
    year: '2022',
    coverImage: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=800&auto=format&fit=crop',
    photos: Array(5).fill(null).map((_, i) => ({ 
      id: `p3-${i}`, url: `https://images.unsplash.com/photo-${1520000000000 + i}?q=80&w=800&auto=format&fit=crop`, caption: `কৃষি কাজ ${i+1}`, dateAdded: '2022-12-05', views: 15 + i,
      likes: 8 + i, tags: ['কৃষি', 'প্রকৃতি'], location: 'জীয়নপুর', isFeatured: false, photographer: 'কামাল হোসেন'
    })),
    uploadDate: '2022-12-05',
    views: 620,
    likes: 150,
    status: 'approved',
    photographer: 'কামাল হোসেন'
  }
];

export default function PhotoGallery({ isEmbed = false }: { isEmbed?: boolean }) {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUnion, setSelectedUnion] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [stats, setStats] = useState({ totalAlbums: 0, totalPhotos: 0, totalViews: 0 });

  // Submission Form Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('sights');
  const [newUnion, setNewUnion] = useState('পুঠিয়া পৌরসভা');
  const [newYear, setNewYear] = useState('2026');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'only_me'>('public');
  const [taggedPeopleInput, setTaggedPeopleInput] = useState('');
  const [tagsInput, setTagsInput] = useState('#পুঠিয়া, #ঐতিহ্য');
  const [contributorName, setContributorName] = useState(user?.displayName || '');

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageFiles(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("ছবি বা অ্যালবাম শেয়ার করতে অনুগ্রহ করে লগইন করুন!");
      return;
    }

    const allImages = [...imageFiles];
    if (newImageUrl.trim()) {
      allImages.push(newImageUrl.trim());
    }

    if (!newTitle.trim() || allImages.length === 0) {
      toast.error("অনুগ্রহ করে শিরোনাম এবং অন্তত একটি ছবি বা ছবির লিঙ্ক দিন।");
      return;
    }

    const taggedPeople = taggedPeopleInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(userName => ({ userName: userName.replace(/^@/, '') }));

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    setSubmitting(true);
    try {
      const photosList = allImages.map((imgUrl, i) => ({
        id: 'p-' + Date.now() + '-' + i,
        url: imgUrl,
        caption: `${newTitle.trim()} ${allImages.length > 1 ? `(${i + 1})` : ''}`,
        dateAdded: new Date().toISOString().split('T')[0],
        views: 1,
        likes: 0,
        privacy,
        tags: [newCategory, ...tags],
        taggedPeople: taggedPeople.length > 0 ? taggedPeople : undefined,
        location: newUnion,
        photographer: contributorName || user.displayName || 'সম্মানিত নাগরিক',
        isFeatured: i === 0
      }));

      await addDoc(collection(db, "photo_albums"), {
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: newCategory,
        union: newUnion,
        year: newYear,
        privacy,
        coverImage: allImages[0],
        photos: photosList,
        uploadDate: new Date().toISOString().split('T')[0],
        views: 1,
        likes: 0,
        tags: [newCategory, ...tags],
        taggedPeople: taggedPeople.length > 0 ? taggedPeople : undefined,
        createdByUid: user.uid,
        createdByEmail: user.email,
        status: "approved"
      });
      toast.success("আপনার অ্যালবামটি সফলভাবে তৈরি ও শেয়ার করা হয়েছে!");
      setNewTitle("");
      setNewDesc("");
      setNewImageUrl("");
      setImageFiles([]);
      setTaggedPeopleInput("");
      setIsSubmitModalOpen(false);
    } catch (err) {
      console.error("Error submitting album:", err);
      toast.error("ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'photo_albums'),
        where('status', '==', 'approved'),
        orderBy('uploadDate', 'desc')
      );
      const snapshot = await getDocs(q);
      
      let fetchedAlbums: PhotoAlbum[] = [];
      snapshot.forEach(doc => {
        fetchedAlbums.push({ id: doc.id, ...doc.data() } as PhotoAlbum);
      });

      if (fetchedAlbums.length === 0) {
        fetchedAlbums = MOCK_ALBUMS;
      }

      setAlbums(fetchedAlbums);
      
      // Calculate stats
      let totalPhotos = 0;
      let totalViews = 0;
      fetchedAlbums.forEach(album => {
        totalPhotos += album.photos?.length || 0;
        totalViews += album.views || 0;
      });
      setStats({
        totalAlbums: fetchedAlbums.length,
        totalPhotos,
        totalViews
      });
      
    } catch (error) {
      console.error("Error fetching albums:", error);
      setAlbums(MOCK_ALBUMS); // Fallback on error
    } finally {
      setLoading(false);
    }
  };

  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  
  const filteredAlbums = albums.filter(album => {
    const matchSearch = album.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       album.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || album.category === selectedCategory;
    const matchUnion = !selectedUnion || album.union === selectedUnion;
    const matchYear = !selectedYear || album.year === selectedYear;
    
    return matchSearch && matchCategory && matchUnion && matchYear;
  });

  const featuredAlbum = albums.length > 0 ? albums.find(a => a.photos?.some(p => p.isFeatured)) || albums[0] : null;
  const mostViewedAlbum = albums.length > 0 ? [...albums].sort((a, b) => b.views - a.views)[0] : null;
  const regularAlbums = albums.length > 0 ? filteredAlbums.filter(a => a.id !== featuredAlbum?.id && a.id !== mostViewedAlbum?.id) : filteredAlbums;

  // Group for timeline view
  const timelineGroups = regularAlbums.reduce((groups, album) => {
    const year = album.year || 'অজানা';
    if (!groups[year]) groups[year] = [];
    groups[year].push(album);
    return groups;
  }, {} as Record<string, PhotoAlbum[]>);
  const timelineYears = Object.keys(timelineGroups).sort((a, b) => Number(b) - Number(a));

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans w-full max-w-full overflow-x-hidden ${isEmbed ? 'pt-8' : ''}`}>
      {!isEmbed && <Header />}
      {/* Hero Section */}
      {!isEmbed && (
        <UnifiedHeroHeader
          title="ছবি গ্যালারি"
          subtitle="পুঠিয়ার ঐতিহ্য, প্রকৃতি, অনুষ্ঠান ও স্মরণীয় মুহূর্তের ছবির এক বিশাল সংগ্রহশালা"
          badgeText="ঐতিহ্য ও সংস্কৃতি"
          rightAction={
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setShowSearch(!showSearch);
                  if (showSearch) {
                    setSearchTerm("");
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
              <button
                onClick={() => {
                  if (!user) {
                    toast.error("ছবি শেয়ার করতে অনুগ্রহ করে লগইন করুন!");
                  } else {
                    setIsSubmitModalOpen(true);
                  }
                }}
                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition cursor-pointer border border-emerald-500 shadow-sm"
                aria-label="Add Photo"
                title="নতুন ছবি/অ্যালবাম যোগ করুন"
              >
                <Plus size={18} />
              </button>
            </div>
          }
          searchQuery={showSearch ? searchTerm : undefined}
          onSearchChange={showSearch ? setSearchTerm : undefined}
          searchPlaceholder="ছবি বা অ্যালবাম খুঁজুন..."
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <ImageIcon className="text-indigo-500 mb-2" size={24} />
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{stats.totalAlbums}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">মোট অ্যালবাম</span>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <Camera className="text-emerald-500 mb-2" size={24} />
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{stats.totalPhotos}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">মোট ছবি</span>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <Eye className="text-amber-500 mb-2" size={24} />
            <span className="text-2xl sm:text-3xl font-black text-slate-800">{stats.totalViews}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">মোট ভিউ</span>
          </div>
        </div>

        {/* Search and Filters - Sticky */}
        <div className="sticky top-4 z-30 bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-lg border border-white/50 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="অ্যালবামের নাম বা বর্ণনা দিয়ে খুঁজুন..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                value={searchTerm || ""}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <select 
                className="px-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 min-w-[140px]"
                value={selectedUnion || "all"}
                onChange={e => setSelectedUnion(e.target.value)}
              >
                <option value="">সকল ইউনিয়ন</option>
                {UNIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <select 
                className="px-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 min-w-[140px]"
                value={selectedYear || "all"}
                onChange={e => setSelectedYear(e.target.value)}
              >
                <option value="">সকল বছর</option>
                <option value="2024">২০২৪</option>
                <option value="2023">২০২৩</option>
                <option value="2022">২০২২</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {GALLERY_CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-none px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  selectedCategory === cat.id 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-96 w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-3xl" />)}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Featured Album */}
            {featuredAlbum && selectedCategory === 'all' && !searchTerm && !selectedUnion && !selectedYear && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                    <Star size={20} fill="currentColor" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">ফিচার্ড অ্যালবাম</h2>
                </div>
                
                <Link to={`/photo-gallery/${featuredAlbum.id}`} className="block group">
                  <div className="relative rounded-3xl overflow-hidden aspect-[21/9] bg-slate-900">
                    <img 
                      src={featuredAlbum.coverImage} 
                      alt={featuredAlbum.title} 
                      className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-80 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="text-white space-y-3">
                        <span className="px-3 py-1 bg-emerald-500 rounded-lg text-xs font-black uppercase tracking-widest inline-flex items-center gap-1 shadow-lg shadow-emerald-500/30">
                          {GALLERY_CATEGORIES.find(c => c.id === featuredAlbum.category)?.icon}
                          {GALLERY_CATEGORIES.find(c => c.id === featuredAlbum.category)?.label}
                        </span>
                        <h3 className="text-3xl md:text-5xl font-black drop-shadow-md">{featuredAlbum.title}</h3>
                        <p className="text-emerald-50 text-sm md:text-base max-w-2xl line-clamp-2">{featuredAlbum.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs font-bold text-white/80 pt-2">
                          <span className="flex items-center gap-1"><Camera size={14} /> {featuredAlbum.photos?.length || 0} ছবি</span>
                          <span className="flex items-center gap-1"><Calendar size={14} /> {featuredAlbum.uploadDate}</span>
                          <span className="flex items-center gap-1"><Eye size={14} /> {featuredAlbum.views} ভিউ</span>
                        </div>
                      </div>
                      
                      <button className="flex-none px-6 py-4 bg-white text-emerald-600 rounded-2xl font-black shadow-xl group-hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                        বিস্তারিত দেখুন <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* View Toggle */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <ImageIcon size={20} />
                </div>
                <h2 className="text-2xl font-black text-slate-800">
                  {selectedCategory === 'all' ? 'সকল অ্যালবাম' : GALLERY_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </h2>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-500 hidden md:inline-block">{regularAlbums.length}টি ফলাফল</span>
                <div className="flex bg-slate-200 rounded-lg p-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    গ্রিড ভিউ
                  </button>
                  <button 
                    onClick={() => setViewMode('timeline')}
                    className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'timeline' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    টাইমলাইন
                  </button>
                </div>
              </div>
            </div>

            {/* Most Viewed Gallery Section */}
            {mostViewedAlbum && selectedCategory === 'all' && viewMode === 'grid' && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="text-rose-500" size={20} />
                  <h3 className="text-lg font-black text-slate-800">সর্বাধিক পঠিত গ্যালারি</h3>
                </div>
                <Link to={`/photo-gallery/${mostViewedAlbum.id}`}>
                  <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100 flex flex-col sm:flex-row h-full sm:h-48 group">
                    <div className="w-full sm:w-1/3 h-48 sm:h-full relative overflow-hidden bg-slate-100 shrink-0">
                      <img src={mostViewedAlbum.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent sm:bg-gradient-to-r" />
                      <div className="absolute top-4 left-4 bg-rose-500 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm">
                        Trending
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <h4 className="text-xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors mb-2">{mostViewedAlbum.title}</h4>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-4">{mostViewedAlbum.description}</p>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1"><Eye size={14} className="text-rose-400" /> {mostViewedAlbum.views} ভিউ</span>
                        <span className="flex items-center gap-1"><Camera size={14} /> {mostViewedAlbum.photos?.length || 0} ছবি</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            )}

            {regularAlbums.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularAlbums.map((album) => (
                    <Link key={album.id} to={`/photo-gallery/${album.id}`}>
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group h-full flex flex-col"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          <img 
                            src={album.coverImage} 
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur text-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                              {GALLERY_CATEGORIES.find(c => c.id === album.category)?.label || album.category}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                            <span className="text-sm font-bold flex items-center gap-1"><Camera size={16} /> {album.photos?.length || 0}</span>
                            <span className="text-sm font-bold flex items-center gap-1"><Eye size={16} /> {album.views}</span>
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                            {album.title}
                          </h3>
                          <div className="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-slate-500 border-t border-slate-100">
                            <span className="flex items-center gap-1"><Calendar size={14}/> {album.uploadDate}</span>
                            {album.union && <span className="flex items-center gap-1"><MapPin size={14}/> {album.union}</span>}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-12 pl-4 border-l-2 border-emerald-100 ml-4 md:ml-8">
                  {timelineYears.map(year => (
                    <div key={year} className="relative">
                      <div className="absolute -left-[25px] md:-left-[41px] top-0 w-10 h-10 bg-emerald-100 rounded-full border-4 border-white flex items-center justify-center text-emerald-600 font-black shadow-sm">
                        {year}
                      </div>
                      <div className="pl-6 md:pl-10 space-y-6">
                        <h3 className="text-xl font-black text-slate-800 mb-4">{year} সালের গ্যালারি</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {timelineGroups[year].map(album => (
                            <Link key={album.id} to={`/photo-gallery/${album.id}`}>
                              <motion.div 
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex h-32"
                              >
                                <div className="w-32 h-full relative overflow-hidden bg-slate-100 shrink-0">
                                  <img 
                                    src={album.coverImage} 
                                    alt={album.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  />
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-center">
                                  <h4 className="text-sm font-black text-slate-800 line-clamp-2 group-hover:text-emerald-600 transition-colors mb-1">{album.title}</h4>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-auto">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {album.uploadDate}</span>
                                    <span className="flex items-center gap-1"><Camera size={12}/> {album.photos?.length || 0}</span>
                                  </div>
                                </div>
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
                  <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">কোনো অ্যালবাম পাওয়া যায়নি</h3>
                  <p className="text-slate-500 font-medium">আপনার ফিল্টার বা সার্চ পরিবর্তন করে আবার চেষ্টা করুন।</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedUnion('');
                      setSelectedYear('');
                    }}
                    className="mt-6 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-100 transition-colors"
                  >
                    সব ফিল্টার মুছুন
                  </button>
                </div>
              )}
            </div>

            {/* FAQ Section */}
            <div className="bg-emerald-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">সাধারণ জিজ্ঞাসা<br/><span className="text-emerald-400">ও নিয়মাবলী</span></h2>
                  <p className="text-emerald-100 mb-8 max-w-md">ছবি আপলোড বা গ্যালারি সম্পর্কিত যেকোনো প্রশ্নের উত্তর এখানে পাবেন।</p>
                  <button className="px-8 py-4 bg-white text-emerald-900 rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                    যোগাযোগ করুন
                  </button>
                </div>
                <div className="space-y-4">
                  {GALLERY_FAQS.map((faq, i) => (
                    <div key={i} className="bg-emerald-800/50 backdrop-blur p-6 rounded-2xl border border-emerald-700/50">
                      <h4 className="text-lg font-black text-emerald-50 mb-2 flex gap-3">
                        <span className="text-emerald-400">Q.</span> {faq.question}
                      </h4>
                      <p className="text-sm font-medium text-emerald-100/80 leading-relaxed pl-7">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Upload/Share Photo Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">নতুন ছবি বা অ্যালবাম যোগ করুন</h3>
                  <p className="text-sm text-slate-500 font-medium">পুঠিয়ার ঐতিহ্য ও সুন্দর মুহূর্ত শেয়ার করুন</p>
                </div>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleSubmitAlbum} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">অ্যালবাম বা ছবির শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="যেমন: পুঠিয়া রাজবাড়ী প্রাঙ্গণ"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium"
                  />
                </div>

                {/* File Upload / Gallery Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ছবি আপলোড করুন (ফাইল বা ডিভাইস থেকে)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:cursor-pointer hover:file:bg-emerald-700"
                  />
                  {imageFiles.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
                      {imageFiles.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          <img src={img} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImageFiles(imageFiles.filter((_, i) => i !== idx))}
                            className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-bl text-[10px]"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">অথবা ছবির লিংক (URL)</label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium"
                  />
                </div>

                {/* Privacy Setting */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">প্রাইভেসি / গোপনীয়তা 🔒</label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium bg-white"
                  >
                    <option value="public">🌐 সর্বজনীন (সবাই দেখতে পাবে)</option>
                    <option value="friends">👥 শুধু বন্ধুরা (Friends Only)</option>
                    <option value="only_me">🔒 গোপনীয় (শুধু আমি)</option>
                  </select>
                </div>

                {/* Tag People & Tags */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">বন্ধুদের ট্যাগ করুন 🏷️</label>
                    <input
                      type="text"
                      value={taggedPeopleInput}
                      onChange={(e) => setTaggedPeopleInput(e.target.value)}
                      placeholder="@রহিম, @করিম"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">হ্যাশট্যাগ 🏷️</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="#পুঠিয়া, #ঐতিহ্য"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">বিভাগ</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium bg-white"
                    >
                      {GALLERY_CATEGORIES.filter(cat => cat.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">এলাকা/ইউনিয়ন</label>
                    <select
                      value={newUnion}
                      onChange={(e) => setNewUnion(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium bg-white"
                    >
                      {UNIONS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">বর্ণনা</label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="ছবি সম্পর্কে কিছু বিবরণ লিখুন..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition text-sm"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? "জমা দেওয়া হচ্ছে..." : "জমা দিন"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!isEmbed && <Footer />}
      {!isEmbed && <BottomNavigation activeTab="services" onTabChange={() => {}} />}
    </div>
  );
}
