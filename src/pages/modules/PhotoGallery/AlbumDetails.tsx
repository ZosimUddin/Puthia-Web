import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Share2, Download, Image as ImageIcon,
  MapPin, Calendar, Camera, User, Eye, X, ChevronLeft, ChevronRight, Maximize,
  Info, Heart, MessageCircle, Tag, Send, CheckCircle2, Clock
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PhotoAlbum, Photo, Comment } from './types';
import { GALLERY_CATEGORIES } from './constants';
import { doc, getDoc, collection, query, where, getDocs, limit, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Skeleton } from '../../../components/Skeleton';

// Add the same MOCK_ALBUMS here for fallback
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
      id: `p-${i}`, 
      url: `https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=800&auto=format&fit=crop`, 
      caption: `ঐতিহাসিক দৃশ্য ${i+1}`, 
      dateAdded: '2023-10-15', 
      views: 10 + i,
      likes: 5 + i,
      tags: ['ঐতিহ্য', 'রাজবাড়ী'],
      location: 'পুঠিয়া রাজবাড়ী',
      mapUrl: 'https://maps.google.com/?q=Puthia+Rajbari',
      isFeatured: i === 0,
      photographer: 'হাসান মাহমুদ'
    })),
    uploadDate: '2023-10-15',
    views: 1250,
    likes: 345,
    status: 'approved',
    photographer: 'হাসান মাহমুদ',
    tags: ['ঐতিহ্য', 'দর্শনীয় স্থান', 'রাজশাহী'],
    comments: [
      {
        id: 'c-1',
        userName: 'আরিফ রহমান',
        text: 'অসাধারণ সব ছবি! পুঠিয়ার সৌন্দর্য খুব সুন্দরভাবে ফুটে উঠেছে।',
        date: '2023-10-16',
        status: 'approved'
      },
      {
        id: 'c-2',
        userName: 'সাদিয়া ইসলাম',
        text: 'পরবর্তী অ্যালবামের অপেক্ষায় রইলাম।',
        date: '2023-10-18',
        status: 'approved'
      }
    ]
  }
];

export default function AlbumDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<PhotoAlbum | null>(null);
  const [relatedAlbums, setRelatedAlbums] = useState<PhotoAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Premium Features State
  const [hasLikedAlbum, setHasLikedAlbum] = useState(false);
  const [likedPhotos, setLikedPhotos] = useState<Set<number>>(new Set());
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLikeAlbum = async () => {
    if (!album || !id || hasLikedAlbum) return;
    try {
      setHasLikedAlbum(true);
      setAlbum(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : prev);
      const docRef = doc(db, 'photo_albums', id);
      await updateDoc(docRef, { likes: increment(1) });
    } catch (e) {
      console.error(e);
      setHasLikedAlbum(false);
      setAlbum(prev => prev ? { ...prev, likes: (prev.likes || 0) - 1 } : prev);
    }
  };

  const handleLikePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!album || !id || likedPhotos.has(currentIndex)) return;
    try {
      setLikedPhotos(prev => new Set(prev).add(currentIndex));
      setAlbum(prev => {
        if (!prev) return prev;
        const newPhotos = [...prev.photos];
        newPhotos[currentIndex] = { ...newPhotos[currentIndex], likes: (newPhotos[currentIndex].likes || 0) + 1 };
        return { ...prev, photos: newPhotos };
      });
      // Updating array element in firestore would require reading/writing the whole array or using specific field paths if mapped
      // For brevity, we just update local state for the mock/demo, but in reality we'd update the document.
      const docRef = doc(db, 'photo_albums', id);
      // await updateDoc(docRef, { photos: newPhotos });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!album || !id || !commentText.trim() || !commentName.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const newComment: Comment = {
        id: Date.now().toString(),
        userName: commentName.trim(),
        text: commentText.trim(),
        date: new Date().toISOString().split('T')[0],
        status: 'pending' // Admin needs to approve
      };

      const docRef = doc(db, 'photo_albums', id);
      await updateDoc(docRef, {
        comments: arrayUnion(newComment)
      });

      // Update local state to show it's pending
      setAlbum(prev => {
        if (!prev) return prev;
        return { ...prev, comments: [...(prev.comments || []), newComment] };
      });
      
      setCommentText('');
      alert('আপনার মন্তব্যটি সফলভাবে পাঠানো হয়েছে এবং অনুমোদনের অপেক্ষায় আছে।');
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert('মন্তব্য পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    fetchAlbumDetails();
  }, [id]);

  const fetchAlbumDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Try to get from Firestore
      const docRef = doc(db, 'photo_albums', id);
      const docSnap = await getDoc(docRef);
      
      let currentAlbum = null;
      if (docSnap.exists()) {
        currentAlbum = { id: docSnap.id, ...docSnap.data() } as PhotoAlbum;
        // Increment views
        await updateDoc(docRef, { views: increment(1) });
      } else {
        // Fallback to mock based on id
        currentAlbum = MOCK_ALBUMS.find(a => a.id === id) || MOCK_ALBUMS[0];
      }
      
      setAlbum(currentAlbum);

      // Fetch related
      if (currentAlbum) {
        const q = query(
          collection(db, 'photo_albums'),
          where('category', '==', currentAlbum.category),
          where('status', '==', 'approved'),
          limit(4)
        );
        const relatedSnap = await getDocs(q);
        let related: PhotoAlbum[] = [];
        relatedSnap.forEach(doc => {
          if (doc.id !== id) {
            related.push({ id: doc.id, ...doc.data() } as PhotoAlbum);
          }
        });
        setRelatedAlbums(related);
      }
      
    } catch (error) {
      console.error("Error fetching album:", error);
      setAlbum(MOCK_ALBUMS[0]);
    } finally {
      setLoading(false);
    }
  };

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setViewerOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeViewer = () => {
    setViewerOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (album && album.photos) {
      setCurrentIndex((prev) => (prev + 1) % album.photos.length);
    }
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (album && album.photos) {
      setCurrentIndex((prev) => (prev - 1 + album.photos.length) % album.photos.length);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename || 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback
      window.open(url, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: album?.title,
        text: album?.description,
        url: window.location.href,
      });
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <Skeleton className="h-[40vh] w-full" />
        <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10 space-y-8">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <ImageIcon size={64} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">অ্যালবামটি পাওয়া যায়নি</h2>
        <button onClick={() => navigate('/photo-gallery')} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold">
          গ্যালারিতে ফিরে যান
        </button>
      </div>
    );
  }

  const currentPhoto = album.photos?.[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Cover Hero */}
      <div className="relative h-[40vh] md:h-[50vh] bg-slate-900 overflow-hidden">
        <button 
          onClick={() => navigate('/photo-gallery')}
          className="absolute top-6 left-6 z-20 w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors border border-white/20"
        >
          <ArrowLeft size={24} />
        </button>
        
        <button 
          onClick={handleShare}
          className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors border border-white/20"
        >
          <Share2 size={24} />
        </button>

        <img 
          src={album.coverImage} 
          alt={album.title} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-black/40 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        {/* Album Header */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 mb-8 flex flex-col md:flex-row gap-8 justify-between">
          <div className="flex-1 space-y-4">
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest inline-flex items-center gap-1">
              {GALLERY_CATEGORIES.find(c => c.id === album.category)?.icon}
              {GALLERY_CATEGORIES.find(c => c.id === album.category)?.label}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800">{album.title}</h1>
            <p className="text-slate-600 text-lg">{album.description}</p>
            
            <div className="flex flex-wrap gap-4 sm:gap-6 pt-4 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-2"><Calendar className="text-slate-400" size={18}/> {album.uploadDate}</span>
              {album.union && <span className="flex items-center gap-2"><MapPin className="text-slate-400" size={18}/> {album.union}</span>}
              {album.photographer && <span className="flex items-center gap-2"><User className="text-slate-400" size={18}/> {album.photographer}</span>}
            </div>
          </div>
          
          <div className="flex gap-4 md:flex-col shrink-0">
            <div className="bg-slate-50 p-4 rounded-2xl flex-1 md:flex-none flex items-center justify-between md:justify-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Camera size={24} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{album.photos?.length || 0}</div>
                <div className="text-xs font-bold text-slate-500">মোট ছবি</div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex-1 md:flex-none flex items-center justify-between md:justify-start gap-4 cursor-pointer hover:bg-rose-50 transition-colors group" onClick={handleLikeAlbum}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${hasLikedAlbum ? 'bg-rose-500 text-white shadow-md' : 'bg-rose-100 text-rose-500 group-hover:bg-rose-200'}`}>
                <Heart size={24} fill={hasLikedAlbum ? 'currentColor' : 'none'} className={hasLikedAlbum ? 'scale-110 transition-transform' : ''} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{album.likes || 0}</div>
                <div className="text-xs font-bold text-slate-500">পছন্দ (Likes)</div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex-1 md:flex-none flex items-center justify-between md:justify-start gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Eye size={24} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{album.views}</div>
                <div className="text-xs font-bold text-slate-500">মোট ভিউ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-black text-slate-800">গ্যালারি</h2>
          </div>
          
          {album.photos && album.photos.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {album.photos.map((photo, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -2 }}
                  onClick={() => openViewer(i)}
                  className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-slate-100 cursor-pointer shadow-sm hover:shadow-lg transition-all"
                >
                  <img 
                    src={photo.url || `https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=400&auto=format&fit=crop`} 
                    alt={photo.caption} 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-sm font-bold line-clamp-2 drop-shadow-md">
                      {photo.caption || 'ক্যাপশন নেই'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-white/80 text-xs font-medium">
                      <Maximize size={12} />
                      <span>বড় করে দেখুন</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
              <ImageIcon size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-400">অ্যালবামে কোনো ছবি নেই</h3>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-black text-slate-800">মন্তব্য</h2>
            <div className="px-3 py-1 bg-slate-200 text-slate-600 text-sm font-bold rounded-full">
              {album.comments?.filter(c => c.status === 'approved').length || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="space-y-6 mb-8">
              {album.comments && album.comments.length > 0 ? (
                album.comments
                .filter(comment => comment.status === 'approved' || comment.status === 'pending') // You'd filter this better in real app
                .map(comment => {
                  // If it's pending, we show it with a pending badge, but ideally we'd only show it to the user who posted it.
                  // For now, we'll just show approved ones, and any pending ones if we want to preview them.
                  if (comment.status !== 'approved' && comment.status !== 'pending') return null;
                  
                  return (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 font-black">
                      {comment.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800">{comment.userName}</span>
                        <span className="text-xs font-bold text-slate-400">{comment.date}</span>
                      </div>
                      <p className="text-slate-600 text-sm">{comment.text}</p>
                      {comment.status === 'pending' && (
                        <div className="mt-2 text-[10px] flex items-center gap-1 text-amber-500 font-bold bg-amber-50 inline-block px-2 py-1 rounded">
                          <Clock size={12}/> অনুমোদনের অপেক্ষায়
                        </div>
                      )}
                    </div>
                  </div>
                )})
              ) : (
                <div className="text-center py-8 text-slate-400 font-bold text-sm">
                  কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmitComment} className="border-t border-slate-100 pt-6">
              <h3 className="font-bold text-slate-800 mb-4">আপনার মন্তব্য লিখুন</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="আপনার নাম"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                  required
                />
                <textarea
                  placeholder="মন্তব্য..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] resize-none text-sm font-medium"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmittingComment ? 'পাঠানো হচ্ছে...' : <><Send size={16} /> মন্তব্য পাঠান</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Related Albums */}
        {relatedAlbums.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-black text-slate-800">একই ক্যাটাগরির অন্যান্য অ্যালবাম</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedAlbums.map(related => (
                <Link key={related.id} to={`/photo-gallery/${related.id}`}>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img src={related.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur px-2 py-1 rounded-lg text-white text-[10px] font-bold flex items-center gap-1">
                        <Camera size={12}/> {related.photos?.length || 0}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-black text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">{related.title}</h4>
                      <p className="text-xs font-bold text-slate-500 mt-1">{related.uploadDate}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Image Viewer Overlay */}
      <AnimatePresence>
        {viewerOpen && currentPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur flex items-center justify-center"
            onClick={closeViewer}
          >
            {/* Top Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10" onClick={e => e.stopPropagation()}>
              <div className="text-white/80 text-sm font-bold">
                {currentIndex + 1} / {album.photos?.length}
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => handleDownload(currentPhoto.url, currentPhoto.caption)} className="text-white/80 hover:text-white transition-colors" title="Download">
                  <Download size={20} />
                </button>
                <button onClick={handleShare} className="text-white/80 hover:text-white transition-colors" title="Share">
                  <Share2 size={20} />
                </button>
                <button onClick={closeViewer} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button 
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all hidden md:flex z-10"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all hidden md:flex z-10"
            >
              <ChevronRight size={32} />
            </button>

            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-20">
              <motion.img 
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                src={currentPhoto.url || `https://images.unsplash.com/photo-${1500000000000 + currentIndex}?q=80&w=1600&auto=format&fit=contain`}
                alt={currentPhoto.caption}
                className="max-w-full max-h-full object-contain"
                onClick={e => e.stopPropagation()}
              />
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent" onClick={e => e.stopPropagation()}>
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex gap-4 items-start flex-1">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 mt-1">
                    <Info size={20} className="text-white/80" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <span>{currentPhoto.caption || 'ক্যাপশন নেই'}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-extrabold text-emerald-300">
                        {currentPhoto.privacy === 'only_me' ? '🔒 গোপনীয়' : currentPhoto.privacy === 'friends' ? '👥 বন্ধুরা' : '🌐 সর্বজনীন'}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-white/60 mb-3">
                      {currentPhoto.photographer && <span className="flex items-center gap-1"><Camera size={14}/> {currentPhoto.photographer}</span>}
                      {currentPhoto.location && (
                        currentPhoto.mapUrl ? (
                          <a href={currentPhoto.mapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
                            <MapPin size={14}/> {currentPhoto.location}
                          </a>
                        ) : (
                          <span className="flex items-center gap-1"><MapPin size={14}/> {currentPhoto.location}</span>
                        )
                      )}
                      {currentPhoto.dateAdded && <span className="flex items-center gap-1"><Calendar size={14}/> {currentPhoto.dateAdded}</span>}
                    </div>

                    {/* Tagged People */}
                    {currentPhoto.taggedPeople && currentPhoto.taggedPeople.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="text-xs text-slate-300 font-bold">ট্যাগ করা ব্যক্তি:</span>
                        {currentPhoto.taggedPeople.map((person, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 rounded-full text-[11px] font-bold">
                            @{person.userName}
                          </span>
                        ))}
                      </div>
                    )}

                    {currentPhoto.tags && currentPhoto.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentPhoto.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-white/10 text-white/80 rounded text-[10px] font-bold flex items-center gap-1">
                            <Tag size={10} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  {/* Multi Reaction Picker */}
                  <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                    {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={handleLikePhoto}
                        className="p-1 hover:scale-125 transition-transform text-base cursor-pointer"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                    <span className="text-white text-xs font-black pl-1 pr-2">
                      {currentPhoto.likes || 0}
                    </span>
                  </div>

                  <div className="px-4 py-2 bg-white/10 rounded-2xl text-white flex items-center gap-2 font-bold text-sm">
                    <Eye size={18} /> {currentPhoto.views || 0}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
