import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImageIcon, Folder, Plus, Trash2, Edit, Save, X, Eye, Settings, Image as ImageLucide, BarChart3, MessageSquare, Video } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import CommentApproval from './gallery/CommentApproval';
import { PhotoAlbum, Photo } from '../modules/PhotoGallery/types';
import { GALLERY_CATEGORIES, UNIONS } from '../modules/PhotoGallery/constants';

const GalleryManagement: React.FC = () => {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'albums' | 'videos' | 'comments' | 'stats'>('albums');
  const [editingAlbum, setEditingAlbum] = useState<PhotoAlbum | null>(null);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVideoFormOpen, setIsVideoFormOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("sights");
  const [formUnion, setFormUnion] = useState("পুঠিয়া পৌরসভা");
  const [formYear, setFormYear] = useState("2023");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formPhotographer, setFormPhotographer] = useState("");
  const [formStatus, setFormStatus] = useState<'pending'|'approved'|'rejected'>('approved');
  const [formPhotos, setFormPhotos] = useState<Photo[]>([]);

  // Video Form State
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [videoCategory, setVideoCategory] = useState("sightseeing");
  const [videoUnion, setVideoUnion] = useState("পুঠিয়া");
  const [videoYear, setVideoYear] = useState("২০২৬");
  const [videoDuration, setVideoDuration] = useState("০৫:০০");
  const [videoPlaylist, setVideoPlaylist] = useState("puthia-rajbari");
  const [videoStatus, setVideoStatus] = useState<'pending'|'approved'|'rejected'>('approved');

  // Individual Photo Edit Modal State
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  // Bulk Upload State
  const [bulkUrls, setBulkUrls] = useState("");

  useEffect(() => {
    const qAlbums = query(collection(db, "photo_albums"));
    const unsubAlbums = onSnapshot(qAlbums, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PhotoAlbum[];
      setAlbums(data);
    }, (error) => {
      console.error("Error fetching photo albums:", error);
    });

    const qVideos = query(collection(db, "videos"));
    const unsubVideos = onSnapshot(qVideos, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching videos:", error);
      setLoading(false);
    });

    return () => {
      unsubAlbums();
      unsubVideos();
    };
  }, []);

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("sights");
    setFormUnion("পুঠিয়া পৌরসভা");
    setFormYear(new Date().getFullYear().toString());
    setFormCoverImage("");
    setFormPhotographer("");
    setFormStatus('approved');
    setFormPhotos([]);
    setEditingAlbum(null);
    setIsFormOpen(false);
    setBulkUrls("");
  };

  const openEdit = (album: PhotoAlbum) => {
    setFormTitle(album.title);
    setFormDescription(album.description);
    setFormCategory(album.category);
    setFormUnion(album.union);
    setFormYear(album.year);
    setFormCoverImage(album.coverImage);
    setFormPhotographer(album.photographer || "");
    setFormStatus(album.status);
    setFormPhotos(album.photos || []);
    setEditingAlbum(album);
    setIsFormOpen(true);
    setBulkUrls("");
  };

  const handleBulkUpload = () => {
    const urls = bulkUrls.split('\n').filter(url => url.trim() !== '');
    if (urls.length === 0) return;
    
    const newPhotos: Photo[] = urls.map((url, i) => ({
      id: Date.now().toString() + i,
      url: url.trim(),
      caption: '',
      dateAdded: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0,
      tags: [],
      isFeatured: false
    }));

    setFormPhotos(prev => [...prev, ...newPhotos]);
    setBulkUrls("");
  };

  const removePhoto = (photoId: string) => {
    setFormPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const toggleFeaturedPhoto = (photoId: string) => {
    setFormPhotos(prev => prev.map(p => ({
      ...p,
      isFeatured: p.id === photoId ? !p.isFeatured : false // Only one featured photo per album usually, or can be multiple, but let's toggle
    })));
  };

  const updatePhotoCaption = (photoId: string, caption: string) => {
    setFormPhotos(prev => prev.map(p => p.id === photoId ? { ...p, caption } : p));
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCoverImage.trim()) {
      alert("শিরোনাম এবং কভার ছবি আবশ্যক!");
      return;
    }

    try {
      const albumData = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        union: formUnion,
        year: formYear,
        coverImage: formCoverImage,
        photographer: formPhotographer,
        status: formStatus,
        photos: formPhotos,
        uploadDate: editingAlbum ? editingAlbum.uploadDate : new Date().toISOString().split('T')[0],
        views: editingAlbum ? editingAlbum.views : 0,
        likes: editingAlbum ? editingAlbum.likes : 0,
        comments: editingAlbum ? editingAlbum.comments : [],
        updatedAt: serverTimestamp(),
      };

      if (editingAlbum && editingAlbum.id) {
        await updateDoc(doc(db, "photo_albums", editingAlbum.id), albumData);
      } else {
        await addDoc(collection(db, "photo_albums"), {
          ...albumData,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (error) {
      console.error("Error saving album:", error);
      alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if(window.confirm('আপনি কি নিশ্চিতভাবে এই অ্যালবামটি মুছে ফেলতে চান?')) {
      try {
        await deleteDoc(doc(db, "photo_albums", id));
      } catch (error) {
        console.error("Error deleting album:", error);
      }
    }
  };

  const resetVideoForm = () => {
    setVideoTitle("");
    setVideoUrl("");
    setVideoDesc("");
    setVideoCategory("sightseeing");
    setVideoUnion("পুঠিয়া");
    setVideoYear("২০২৬");
    setVideoDuration("০৫:০০");
    setVideoPlaylist("puthia-rajbari");
    setVideoStatus("approved");
    setEditingVideo(null);
    setIsVideoFormOpen(false);
  };

  const openEditVideo = (video: any) => {
    setVideoTitle(video.title);
    setVideoUrl(video.url);
    setVideoDesc(video.description || "");
    setVideoCategory(video.category || "sightseeing");
    setVideoUnion(video.union || "পুঠিয়া");
    setVideoYear(video.year || "২০২৬");
    setVideoDuration(video.duration || "০৫:০০");
    setVideoPlaylist(video.playlist || "puthia-rajbari");
    setVideoStatus(video.isApproved || "approved");
    setEditingVideo(video);
    setIsVideoFormOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) {
      alert("ভিডিওর শিরোনাম এবং লিঙ্ক আবশ্যক!");
      return;
    }

    try {
      const videoData = {
        title: videoTitle.trim(),
        url: videoUrl.trim(),
        description: videoDesc.trim(),
        category: videoCategory,
        union: videoUnion,
        year: videoYear,
        duration: videoDuration,
        playlist: videoPlaylist,
        isApproved: videoStatus,
        updatedAt: serverTimestamp(),
      };

      if (editingVideo && editingVideo.id) {
        await updateDoc(doc(db, "videos", editingVideo.id), videoData);
      } else {
        await addDoc(collection(db, "videos"), {
          ...videoData,
          views: 0,
          likes: 0,
          shares: 0,
          createdBy: "এডমিন",
          createdByUid: "admin",
          isFeatured: false,
          createdAt: new Date().toISOString()
        });
      }

      resetVideoForm();
    } catch (error) {
      console.error("Error saving video:", error);
      alert("ভিডিও সংরক্ষণ করতে সমস্যা হয়েছে।");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই ভিডিওটি মুছে ফেলতে চান?')) {
      try {
        await deleteDoc(doc(db, "videos", id));
      } catch (error) {
        console.error("Error deleting video:", error);
      }
    }
  };

  const toggleVideoStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'approved' ? 'pending' : 'approved';
      await updateDoc(doc(db, "videos", id), {
        isApproved: nextStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error toggling video status:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-rose-950">গ্যালারি ব্যবস্থাপনা</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">ফটোগ্যালারি, অ্যালবাম এবং মন্তব্য নিয়ন্ত্রণ</p>
        </div>
        {!isFormOpen && !isVideoFormOpen && activeTab === 'albums' && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            নতুন অ্যালবাম
          </button>
        )}
        {!isFormOpen && !isVideoFormOpen && activeTab === 'videos' && (
          <button
            onClick={() => setIsVideoFormOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            নতুন ভিডিও
          </button>
        )}
      </div>

      {!isFormOpen && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('albums')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'albums' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'bg-transparent text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent'}`}
          >
            <Folder size={18} />
            অ্যালবাম 
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'videos' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'bg-transparent text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent'}`}
          >
            <Video size={18} />
            ভিডিও গ্যালারি
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'comments' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'bg-transparent text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent'}`}
          >
            <MessageSquare size={18} />
            মন্তব্য অনুমোদন
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'stats' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'bg-transparent text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent'}`}
          >
            <BarChart3 size={18} />
            পরিসংখ্যান
          </button>
        </div>
      )}

      {isFormOpen ? (
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <Folder className="text-emerald-600" />
              {editingAlbum ? "অ্যালবাম আপডেট করুন" : "নতুন অ্যালবাম তৈরি করুন"}
            </h2>
            <button onClick={resetForm} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSaveAlbum} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">অ্যালবামের নাম *</label>
                <input required value={formTitle || ""} onChange={(e) => setFormTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">কভার ছবির URL *</label>
                <input required type="url" value={formCoverImage || ""} onChange={(e) => setFormCoverImage(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">বিবরণ</label>
                <textarea value={formDescription || ""} onChange={(e) => setFormDescription(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">ক্যাটাগরি</label>
                <select value={formCategory || ""} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium">
                  {GALLERY_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id || ""}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">ইউনিয়ন</label>
                <select value={formUnion || ""} onChange={(e) => setFormUnion(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium">
                  <option value="পুঠিয়া পৌরসভা">পুঠিয়া পৌরসভা</option>
                  {UNIONS.filter(u => u !== 'সকল').map(u => (
                    <option key={u} value={u || ""}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">বছর</label>
                <input value={formYear || ""} onChange={(e) => setFormYear(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">ফটোগ্রাফার (কপিরাইট)</label>
                <input value={formPhotographer || ""} onChange={(e) => setFormPhotographer(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">স্ট্যাটাস</label>
                <select value={formStatus || ""} onChange={(e) => setFormStatus(e.target.value as any)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium">
                  <option value="pending">অপেক্ষমাণ (Pending)</option>
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="rejected">বাতিল (Rejected)</option>
                </select>
              </div>
            </div>

            {/* Photos Management */}
            <div className="mt-8 border-t border-gray-100 pt-8">
              <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                <ImageLucide className="text-emerald-600" /> অ্যালবামের ছবি  ({formPhotos.length})
              </h3>
              
              {/* Bulk Upload Input */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">বাল্ক আপলোড (প্রতি লাইনে একটি ছবির URL দিন)</label>
                <textarea 
                  value={bulkUrls || ""} 
                  onChange={e => setBulkUrls(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium min-h-[100px] text-sm"
                  placeholder="https://image1.jpg&#10;https://image2.jpg"
                />
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={handleBulkUpload} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-slate-700">ছবিগুলো যোগ করুন</button>
                </div>
              </div>

              {/* Photos List */}
              {formPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formPhotos.map((photo, index) => (
                    <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
                      <div className="relative">
                        <img src={photo.url} className="w-full h-32 object-cover" alt="album photo" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <div className="flex justify-between">
                            <button 
                              type="button" 
                              onClick={() => toggleFeaturedPhoto(photo.id)}
                              className={`p-1.5 rounded-lg text-xs font-bold shadow-sm ${photo.isFeatured ? 'bg-amber-500 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'}`}
                              title="Featured করুন"
                            >
                              Featured
                            </button>
                            <div className="flex gap-1">
                              <button 
                                type="button" 
                                onClick={() => setEditingPhoto(photo)}
                                className="p-1.5 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600"
                                title="এডিট করুন"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => removePhoto(photo.id)}
                                className="p-1.5 bg-rose-500 text-white rounded-lg shadow-sm hover:bg-rose-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        {photo.status === 'pending' && <span className="absolute bottom-2 left-2 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded">Pending</span>}
                        {photo.status === 'rejected' && <span className="absolute bottom-2 left-2 px-2 py-1 bg-rose-500 text-white text-[10px] font-bold rounded">Rejected</span>}
                      </div>
                      <div className="p-2 flex-1 flex flex-col gap-2">
                        {photo.title && <div className="text-xs font-bold text-gray-800 truncate">{photo.title}</div>}
                        <input 
                          type="text" 
                          value={photo.caption || ''} 
                          onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                          placeholder="ক্যাপশন..."
                          className="w-full text-xs px-2 py-1 border border-slate-200 rounded mt-auto"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors border border-gray-200">বাতিল</button>
              <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                <Save size={18} />
                {editingAlbum ? "আপডেট করুন" : "সংরক্ষণ করুন"}
              </button>
            </div>
          </form>
        </div>
      ) : isVideoFormOpen ? (
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <Video className="text-emerald-600" />
              {editingVideo ? "ভিডিও আপডেট করুন" : "নতুন ভিডিও যুক্ত করুন"}
            </h2>
            <button onClick={resetVideoForm} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSaveVideo} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">ভিডিওর নাম/শিরোনাম *</label>
                <input required value={videoTitle || ""} onChange={(e) => setVideoTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">ইউটিউব লিঙ্ক (YouTube URL) *</label>
                <input required type="url" value={videoUrl || ""} onChange={(e) => setVideoUrl(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">বিবরণ</label>
                <textarea value={videoDesc || ""} onChange={(e) => setVideoDesc(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">ক্যাটাগরি</label>
                <select value={videoCategory || ""} onChange={(e) => setVideoCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium">
                  <option value="sightseeing">🏛️ দর্শনীয় স্থান</option>
                  <option value="festival">🎉 অনুষ্ঠান ও উৎসব</option>
                  <option value="religious">🕌 ধর্মীয় অনুষ্ঠান</option>
                  <option value="education">🏫 শিক্ষা</option>
                  <option value="sports">⚽ খেলাধুলা</option>
                  <option value="agriculture">🌾 কৃষি</option>
                  <option value="nature">🌳 প্রকৃতি</option>
                  <option value="social">👥 সামাজিক কার্যক্রম</option>
                  <option value="government">🏢 সরকারি কার্যক্রম</option>
                  <option value="news">📢 সংবাদ ও আপডেট</option>
                  <option value="documentary">🎬 তথ্যচিত্র</option>
                  <option value="other">📺 অন্যান্য</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">ইউনিয়ন</label>
                <select value={videoUnion || ""} onChange={(e) => setVideoUnion(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium">
                  <option value="পুঠিয়া">পুঠিয়া</option>
                  <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                  <option value="ভালুকগাছি">ভালুকগাছি</option>
                  <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                  <option value="বানেশ্বর">বানেশ্বর</option>
                  <option value="জিউপাড়া">জিউপাড়া</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">ভিডিওর দৈর্ঘ্য (যেমন: ০৫:৩০)</label>
                <input value={videoDuration || ""} onChange={(e) => setVideoDuration(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">প্লেলিস্ট</label>
                <select value={videoPlaylist || ""} onChange={(e) => setVideoPlaylist(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium">
                  <option value="puthia-rajbari">🏰 পুঠিয়া রাজবাড়ি</option>
                  <option value="festival-playlist">🎭 উৎসব</option>
                  <option value="agri-playlist">🌾 কৃষি ও মেলা</option>
                  <option value="edu-playlist">📚 শিক্ষা</option>
                  <option value="health-playlist">🏥 স্বাস্থ্য</option>
                  <option value="govt-playlist">🏛️ সরকারি কার্যক্রম</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">অনুমোদন স্ট্যাটাস</label>
                <select value={videoStatus || ""} onChange={(e) => setVideoStatus(e.target.value as any)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium">
                  <option value="pending">অপেক্ষমাণ (Pending)</option>
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="rejected">বাতিল (Rejected)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={resetVideoForm} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors border border-gray-200">বাতিল</button>
              <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                <Save size={18} />
                {editingVideo ? "আপডেট করুন" : "যুক্ত করুন"}
              </button>
            </div>
          </form>
        </div>
      ) : activeTab === 'albums' ? (
        loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <motion.div key={album.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm flex flex-col group relative">
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded shadow-sm text-white ${album.status === 'approved' ? 'bg-emerald-500' : album.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                      {album.status}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(album)} className="p-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 shadow-sm"><Edit size={14} /></button>
                    <button onClick={() => handleDeleteAlbum(album.id!)} className="p-2 bg-white text-rose-600 rounded-xl hover:bg-rose-50 shadow-sm"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-gray-800 mb-1 line-clamp-1">{album.title}</h3>
                  <div className="text-xs font-bold text-gray-500 mb-3">{album.category} • {album.photos?.length || 0} টি ছবি</div>
                  <div className="mt-auto flex items-center justify-between text-xs font-medium text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye size={14}/> {album.views || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={14}/> {album.comments?.length || 0}</span>
                    </div>
                    <span>{album.year}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {albums.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-100">
                <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">কোনো অ্যালবাম পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        )
      ) : activeTab === 'videos' ? (
        loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                    <th className="py-4 px-6">থাম্বনেইল ও শিরোনাম</th>
                    <th className="py-4 px-6">ক্যাটাগরি</th>
                    <th className="py-4 px-6">ইউনিয়ন</th>
                    <th className="py-4 px-6">স্ট্যাটাস</th>
                    <th className="py-4 px-6 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {videos.map((video) => {
                    const getYoutubeId = (url: string) => {
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                      const match = url.match(regExp);
                      return (match && match[2].length === 11) ? match[2] : null;
                    };
                    const ytId = getYoutubeId(video.url);
                    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100";

                    return (
                      <tr key={video.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <img src={thumb} className="w-20 h-12 object-cover rounded-lg border border-slate-100" alt="thumb" referrerPolicy="no-referrer" />
                            <div>
                              <div className="font-bold text-slate-800 text-sm line-clamp-1">{video.title}</div>
                              <div className="text-xs text-slate-400 font-medium mt-0.5">⏱️ {video.duration} • শেয়ার করেছেন: {video.createdBy || "সাধারণ ব্যবহারকারী"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-slate-500">{video.category}</td>
                        <td className="py-4 px-6 text-xs font-bold text-slate-500">📍 {video.union}</td>
                        <td className="py-4 px-6">
                          <button 
                            onClick={() => toggleVideoStatus(video.id, video.isApproved || 'approved')}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              (video.isApproved || 'approved') === 'approved' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : (video.isApproved || 'approved') === 'rejected' 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {video.isApproved || 'approved'}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => openEditVideo(video)} className="p-2 text-blue-600 bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 rounded-xl transition-colors"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteVideo(video.id)} className="p-2 text-rose-600 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/50 rounded-xl transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {videos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400 font-medium">
                        <Video size={36} className="mx-auto mb-2 text-slate-300" />
                        কোনো ভিডিও পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : activeTab === 'comments' ? (
        <CommentApproval />
      ) : (
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-emerald-600" size={24} />
            <h2 className="text-xl font-black text-gray-800">গ্যালারি পরিসংখ্যান</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-sm font-bold text-slate-500 mb-2">মোট অ্যালবাম</div>
              <div className="text-4xl font-black text-emerald-600">{albums.length}</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-sm font-bold text-slate-500 mb-2">মোট ছবি</div>
              <div className="text-4xl font-black text-blue-600">
                {albums.reduce((acc, album) => acc + (album.photos?.length || 0), 0)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-sm font-bold text-slate-500 mb-2">মোট ভিউ</div>
              <div className="text-4xl font-black text-amber-600">
                {albums.reduce((acc, album) => acc + (album.views || 0), 0)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-sm font-bold text-slate-500 mb-2">মোট ভিডিও</div>
              <div className="text-4xl font-black text-indigo-600">{videos.length}</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-sm font-bold text-slate-500 mb-2">অপেক্ষমাণ ভিডিও</div>
              <div className="text-4xl font-black text-rose-500">
                {videos.filter(v => v.isApproved === 'pending').length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Edit Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800">ছবি সম্পাদনা</h3>
              <button onClick={() => setEditingPhoto(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">ছবির শিরোনাম</label>
                <input 
                  value={editingPhoto.title || ''} 
                  onChange={(e) => setEditingPhoto({...editingPhoto, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">ক্যাপশন</label>
                <textarea 
                  value={editingPhoto.caption || ''} 
                  onChange={(e) => setEditingPhoto({...editingPhoto, caption: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">ফটোগ্রাফার (কপিরাইট)</label>
                <input 
                  value={editingPhoto.photographer || ''} 
                  onChange={(e) => setEditingPhoto({...editingPhoto, photographer: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">লোকেশন</label>
                <input 
                  value={editingPhoto.location || ''} 
                  onChange={(e) => setEditingPhoto({...editingPhoto, location: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">ক্যাটাগরি</label>
                  <input 
                    value={editingPhoto.category || ''} 
                    onChange={(e) => setEditingPhoto({...editingPhoto, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">ইউনিয়ন</label>
                  <input 
                    value={editingPhoto.union || ''} 
                    onChange={(e) => setEditingPhoto({...editingPhoto, union: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">ট্যাগস (কমা দিয়ে)</label>
                <input 
                  value={editingPhoto.tags?.join(', ') || ''} 
                  onChange={(e) => setEditingPhoto({...editingPhoto, tags: e.target.value.split(',').map(t => t.trim())})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">স্ট্যাটাস</label>
                <select 
                  value={editingPhoto.status || 'approved'} 
                  onChange={(e) => setEditingPhoto({...editingPhoto, status: e.target.value as any})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                >
                  <option value="pending">অপেক্ষমাণ (Pending)</option>
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="rejected">বাতিল (Rejected)</option>
                </select>
              </div>

              {/* Read Only Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">আপলোড ডেট</label>
                  <div className="text-sm font-medium text-gray-700">{editingPhoto.dateAdded || 'N/A'}</div>
                 </div>
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">ভিউ কাউন্ট</label>
                  <div className="text-sm font-medium text-gray-700">{editingPhoto.views || 0}</div>
                 </div>
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">লাইক কাউন্ট</label>
                  <div className="text-sm font-medium text-gray-700">{editingPhoto.likes || 0}</div>
                 </div>
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">শেয়ার কাউন্ট</label>
                  <div className="text-sm font-medium text-gray-700">{editingPhoto.shareCount || 0}</div>
                 </div>
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">তৈরি করেছেন</label>
                  <div className="text-sm font-medium text-gray-700">{editingPhoto.createdBy || 'Admin'}</div>
                 </div>
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">সর্বশেষ আপডেট</label>
                  <div className="text-sm font-medium text-gray-700">{editingPhoto.lastUpdated || 'N/A'}</div>
                 </div>
              </div>

              <button 
                onClick={() => {
                  setFormPhotos(prev => prev.map(p => p.id === editingPhoto.id ? editingPhoto : p));
                  setEditingPhoto(null);
                }}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl mt-4 hover:bg-emerald-700"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
