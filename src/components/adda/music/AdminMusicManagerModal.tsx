import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  RefreshCw, 
  MapPin,
  FileCheck,
  Disc3,
  Layers
} from 'lucide-react';
import { 
  musicLibraryService, 
  MusicTrack, 
  MusicCategoryType, 
  MUSIC_CATEGORIES, 
  MusicLicenseType 
} from '../../../services/musicLibraryService';
import toast from 'react-hot-toast';

interface AdminMusicManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
}

export const AdminMusicManagerModal: React.FC<AdminMusicManagerModalProps> = ({
  isOpen,
  onClose,
  userProfile
}) => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Tab: 'list' | 'add' | 'edit'
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);

  // Audio Preview
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formArtist, setFormArtist] = useState('');
  const [formCategory, setFormCategory] = useState<MusicCategoryType>('puthia_heritage');
  const [formAudioUrl, setFormAudioUrl] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formDuration, setFormDuration] = useState<number>(30);
  const [formLicense, setFormLicense] = useState<MusicLicenseType>('royalty_free');
  const [formLicenseNote, setFormLicenseNote] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formIsPuthiaSpecial, setFormIsPuthiaSpecial] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsHidden, setFormIsHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllTracks();
    } else {
      musicLibraryService.stopPlayback();
      setPlayingTrackId(null);
    }
  }, [isOpen]);

  const loadAllTracks = async () => {
    setIsLoading(true);
    try {
      const all = await musicLibraryService.getAllTracks({ includeHidden: true });
      setTracks(all);
    } catch (err) {
      console.error('Error loading admin music tracks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormArtist(userProfile?.name || 'পুঠিয়া সাংস্কৃতিক একাডেমি');
    setFormCategory('puthia_heritage');
    setFormAudioUrl('');
    setFormCoverUrl('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80');
    setFormDuration(30);
    setFormLicense('royalty_free');
    setFormLicenseNote('');
    setFormTags('পুঠিয়া, বাঁশি, মেঠো সুর');
    setFormIsPuthiaSpecial(true);
    setFormIsTrending(false);
    setFormIsFeatured(false);
    setFormIsHidden(false);
    setEditingTrackId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setActiveTab('add');
  };

  const handleOpenEdit = (track: MusicTrack) => {
    setEditingTrackId(track.id);
    setFormTitle(track.title);
    setFormArtist(track.artist);
    setFormCategory(track.category);
    setFormAudioUrl(track.audioUrl);
    setFormCoverUrl(track.coverImage || '');
    setFormDuration(track.duration || 30);
    setFormLicense(track.license || 'royalty_free');
    setFormLicenseNote(track.licenseNote || '');
    setFormTags(track.tags ? track.tags.join(', ') : '');
    setFormIsPuthiaSpecial(Boolean(track.isPuthiaSpecial));
    setFormIsTrending(Boolean(track.isTrending));
    setFormIsFeatured(Boolean(track.isFeatured));
    setFormIsHidden(Boolean(track.isHidden));
    setActiveTab('edit');
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('অনুগ্রহ করে অডিও ফাইল (MP3, WAV, AAC) আপলোড করুন');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('অডিও ফাইলের সাইজ সর্বোচ্চ 8MB হতে পারবে');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormAudioUrl(result);
      if (!formTitle) {
        setFormTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      toast.success('অডিও ফাইল সফলভাবে যুক্ত হয়েছে');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('গানের শিরোনাম লিখুন');
      return;
    }
    if (!formArtist.trim()) {
      toast.error('শিল্পী বা প্রযোজকের নাম লিখুন');
      return;
    }
    if (!formAudioUrl.trim()) {
      toast.error('অডিও URL দিন অথবা ফাইল আপলোড করুন');
      return;
    }

    setIsSubmitting(true);
    const parsedTags = formTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      if (activeTab === 'edit' && editingTrackId) {
        await musicLibraryService.updateTrack(editingTrackId, {
          title: formTitle.trim(),
          artist: formArtist.trim(),
          category: formCategory,
          audioUrl: formAudioUrl.trim(),
          coverImage: formCoverUrl.trim() || undefined,
          duration: Number(formDuration) || 30,
          license: formLicense,
          licenseNote: formLicenseNote.trim() || undefined,
          tags: parsedTags,
          isPuthiaSpecial: formIsPuthiaSpecial,
          isTrending: formIsTrending,
          isFeatured: formIsFeatured,
          isHidden: formIsHidden
        });
        toast.success('মিউজিক তথ্য সফলভাবে আপডেট হয়েছে!');
      } else {
        await musicLibraryService.addTrack({
          title: formTitle.trim(),
          artist: formArtist.trim(),
          category: formCategory,
          audioUrl: formAudioUrl.trim(),
          coverImage: formCoverUrl.trim() || undefined,
          duration: Number(formDuration) || 30,
          license: formLicense,
          licenseNote: formLicenseNote.trim() || undefined,
          tags: parsedTags,
          isPuthiaSpecial: formIsPuthiaSpecial,
          isTrending: formIsTrending,
          isFeatured: formIsFeatured,
          isHidden: formIsHidden
        });
        toast.success('নতুন মিউজিক সফলভাবে যুক্ত ও প্রকাশ করা হয়েছে!');
      }

      await loadAllTracks();
      setActiveTab('list');
      resetForm();
    } catch (err) {
      console.error('Error saving track:', err);
      toast.error('মিউজিক সেভ করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (track: MusicTrack) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${track.title}" মিউজিকটি ডিলিট করতে চান?`)) return;
    try {
      await musicLibraryService.deleteTrack(track.id);
      toast.success('মিউজিক মুছে ফেলা হয়েছে');
      loadAllTracks();
    } catch {
      toast.error('মুছতে সমস্যা হয়েছে');
    }
  };

  const handleToggleHide = async (track: MusicTrack) => {
    try {
      await musicLibraryService.toggleVisibility(track.id, Boolean(track.isHidden));
      toast.success(track.isHidden ? 'মিউজিক দৃশ্যমান করা হয়েছে' : 'মিউজিক হাইড করা হয়েছে');
      loadAllTracks();
    } catch {
      toast.error('আপডেট করতে ব্যর্থ');
    }
  };

  const handleToggleTrending = async (track: MusicTrack) => {
    try {
      await musicLibraryService.toggleTrending(track.id, Boolean(track.isTrending));
      loadAllTracks();
    } catch {}
  };

  const handleToggleFeatured = async (track: MusicTrack) => {
    try {
      await musicLibraryService.toggleFeatured(track.id, Boolean(track.isFeatured));
      loadAllTracks();
    } catch {}
  };

  const handleTogglePreview = (track: MusicTrack) => {
    if (playingTrackId === track.id) {
      musicLibraryService.stopPlayback();
      setPlayingTrackId(null);
    } else {
      musicLibraryService.playPreview(track, {
        onEnded: () => setPlayingTrackId(null)
      });
      setPlayingTrackId(track.id);
    }
  };

  if (!isOpen) return null;

  const filteredTracks = tracks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCat = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Disc3 className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                মিউজিক লাইব্রেরি ম্যানেজমেন্ট (Admin)
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                  অ্যাডমিন কন্ট্রোল
                </span>
              </h2>
              <p className="text-xs text-slate-400">সাউন্ডট্র্যাক আপলোড, ক্যাটাগরি, লাইসেন্স ও ট্রেন্ডিং নিয়ন্ত্রণ করুন</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'list' ? (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                নতুন মিউজিক যুক্ত করুন
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setActiveTab('list'); resetForm(); }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                তালিকায় ফিরুন
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                musicLibraryService.stopPlayback();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form View (Add / Edit) */}
        {activeTab === 'add' || activeTab === 'edit' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="bg-slate-850 bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Music className="w-5 h-5 text-emerald-400" />
                  {activeTab === 'edit' ? 'মিউজিক সম্পাদনা করুন' : 'নতুন মিউজিক / লোকসুর প্রকাশ করুন'}
                </h3>
                <p className="text-xs text-slate-400">
                  কপিরাইট মুক্ত বা অনুমোদিত সাউন্ডট্র্যাকের বিবরণ প্রদান করুন।
                </p>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      মিউজিক / গানের শিরোনাম *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="যেমন: 🌾 পুঠিয়ার মেঠো সুর (বাঁশির তান)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Artist */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      শিল্পী / ব্যান্ড / সুরকার *
                    </label>
                    <input
                      type="text"
                      value={formArtist}
                      onChange={(e) => setFormArtist(e.target.value)}
                      placeholder="যেমন: পুঠিয়া সাংস্কৃতিক একাডেমি"
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">ক্যাটাগরি *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as MusicCategoryType)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {MUSIC_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">দৈর্ঘ্য (সেকেন্ড)</label>
                    <input
                      type="number"
                      min="5"
                      max="600"
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* License */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">লাইসেন্স ও কপিরাইট</label>
                    <select
                      value={formLicense}
                      onChange={(e) => setFormLicense(e.target.value as MusicLicenseType)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="royalty_free">Royalty-Free (রয়্যালটি মুক্ত)</option>
                      <option value="puthia_heritage">পুঠিয়া ঐতিহ্য ও লোকসংস্কৃতি</option>
                      <option value="creative_commons">Creative Commons (CC-BY)</option>
                      <option value="original">মৌলিক সুর / নিজস্ব সৃষ্টি</option>
                      <option value="public_domain">পাবলিক ডোমেইন</option>
                    </select>
                  </div>
                </div>

                {/* Audio File Upload or URL */}
                <div className="space-y-2 bg-slate-800/60 p-4 rounded-2xl border border-slate-750 border-slate-700/60">
                  <label className="block text-xs font-bold text-emerald-400">
                    অডিও উৎস (Audio URL বা ফাইল আপলোড) *
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="url"
                      value={formAudioUrl}
                      onChange={(e) => setFormAudioUrl(e.target.value)}
                      placeholder="https://example.com/audio.mp3"
                      className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    
                    <label className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      ফাইল আপলোড
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Cover Image & Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      কভার ইমেজ URL (থাম্বনেইল)
                    </label>
                    <input
                      type="url"
                      value={formCoverUrl}
                      onChange={(e) => setFormCoverUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      সার্চ ট্যাগ (কমা দিয়ে আলাদা করুন)
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="পুঠিয়া, বাঁশি, মেঠো সুর, পদ্মার বাতাস"
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Toggles: Puthia Special, Trending, Featured, Hidden */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPuthiaSpecial}
                      onChange={(e) => setFormIsPuthiaSpecial(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span className="text-xs font-semibold text-amber-300">📍 পুঠিয়া স্পেশাল</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsTrending}
                      onChange={(e) => setFormIsTrending(e.target.checked)}
                      className="rounded accent-rose-500"
                    />
                    <span className="text-xs font-semibold text-rose-300">🔥 ট্রেন্ডিং</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span className="text-xs font-semibold text-emerald-300">⭐ ফিচার্ড</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsHidden}
                      onChange={(e) => setFormIsHidden(e.target.checked)}
                      className="rounded accent-slate-500"
                    />
                    <span className="text-xs font-semibold text-slate-400">👁️ ড্রাফট / হাইড</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('list'); resetForm(); }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    বাতিল করুন
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {activeTab === 'edit' ? 'আপডেট সম্পন্ন করুন' : 'মিউজিক প্রকাশ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* List View (Table & Filter) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-850 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="মিউজিক খুঁজুন..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">সব ক্যাটাগরি ({tracks.length})</option>
                  {MUSIC_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-7 h-7 animate-spin text-emerald-400" />
                <p className="text-xs">লোড হচ্ছে...</p>
              </div>
            ) : filteredTracks.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <p className="text-sm">কোনো মিউজিক রেকর্ড পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">মিউজিক ও শিল্পী</th>
                      <th className="p-3">ক্যাটাগরি</th>
                      <th className="p-3">লাইসেন্স</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3">ব্যবহার</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredTracks.map((track) => {
                      const isPlay = playingTrackId === track.id;
                      return (
                        <tr key={track.id} className="hover:bg-slate-800/40 transition">
                          {/* Title & Play */}
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleTogglePreview(track)}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition flex-shrink-0 ${
                                  isPlay ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {isPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                              </button>
                              <div>
                                <div className="font-bold text-white text-xs sm:text-sm line-clamp-1 flex items-center gap-1.5">
                                  {track.title}
                                  {track.isPuthiaSpecial && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      পুঠিয়া
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">{track.artist}</div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                              {track.category}
                            </span>
                          </td>

                          {/* License */}
                          <td className="p-3">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                              {track.license || 'Royalty-Free'}
                            </span>
                          </td>

                          {/* Status / Badges */}
                          <td className="p-3">
                            <div className="flex items-center gap-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleToggleTrending(track)}
                                className={`p-1 rounded-lg transition ${
                                  track.isTrending ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-slate-600 hover:text-slate-400'
                                }`}
                                title="ট্রেন্ডিং টগল"
                              >
                                <Flame className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(track)}
                                className={`p-1 rounded-lg transition ${
                                  track.isFeatured ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-600 hover:text-slate-400'
                                }`}
                                title="ফিচার্ড টগল"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleHide(track)}
                                className={`p-1 rounded-lg transition ${
                                  track.isHidden ? 'bg-slate-800 text-slate-500' : 'text-emerald-400'
                                }`}
                                title={track.isHidden ? 'হাইড করা আছে' : 'পাবলিক আছে'}
                              >
                                {track.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Usage Count */}
                          <td className="p-3 font-mono text-slate-400 text-[11px]">
                            {track.usesCount || 0} বার
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(track)}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="এডিট করুন"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(track)}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition"
                                title="ডিলিট করুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
