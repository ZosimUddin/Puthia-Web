import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../../../firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Check, X, Clock, Trash2, ShieldAlert } from 'lucide-react';
import { PhotoAlbum, Comment } from '../../modules/PhotoGallery/types';

export default function CommentApproval() {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We fetch all albums that have comments.
    const q = query(collection(db, 'photo_albums'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PhotoAlbum));
      setAlbums(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (albumId: string, commentId: string) => {
    try {
      const album = albums.find(a => a.id === albumId);
      if (!album || !album.comments) return;

      const updatedComments = album.comments.map(c => 
        c.id === commentId ? { ...c, status: 'approved' as const } : c
      );

      await updateDoc(doc(db, 'photo_albums', albumId), {
        comments: updatedComments
      });
    } catch (err) {
      console.error(err);
      alert('অনুমোদন করতে সমস্যা হয়েছে।');
    }
  };

  const handleReject = async (albumId: string, commentId: string) => {
    try {
      const album = albums.find(a => a.id === albumId);
      if (!album || !album.comments) return;

      const updatedComments = album.comments.filter(c => c.id !== commentId);

      await updateDoc(doc(db, 'photo_albums', albumId), {
        comments: updatedComments
      });
    } catch (err) {
      console.error(err);
      alert('বাতিল করতে সমস্যা হয়েছে।');
    }
  };

  // Flatten comments to list them
  const allComments: { albumId: string, albumTitle: string, comment: Comment }[] = [];
  albums.forEach(album => {
    if (album.comments) {
      album.comments.forEach(c => {
        allComments.push({
          albumId: album.id,
          albumTitle: album.title,
          comment: c
        });
      });
    }
  });

  const pendingComments = allComments.filter(item => item.comment.status === 'pending');
  const approvedComments = allComments.filter(item => item.comment.status === 'approved');

  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShieldAlert className="text-amber-500" /> মন্তব্য অনুমোদন
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">অ্যালবামের ছবিগুলোতে ইউজারদের করা মন্তব্য রিভিউ করুন</p>
        </div>
        <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
          <Clock size={18} /> {pendingComments.length} টি অপেক্ষমাণ
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">লোড হচ্ছে...</div>
      ) : (
        <div className="space-y-4">
          {pendingComments.length > 0 ? (
            pendingComments.map((item) => (
              <div key={`${item.albumId}-${item.comment.id}`} className="bg-slate-50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between border border-amber-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-800">{item.comment.userName}</span>
                    <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                      অ্যালবাম: {item.albumTitle}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{item.comment.date}</span>
                  </div>
                  <p className="text-slate-600 text-sm font-medium">{item.comment.text}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleApprove(item.albumId, item.comment.id)}
                    className="w-10 h-10 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-colors"
                    title="অনুমোদন করুন"
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    onClick={() => handleReject(item.albumId, item.comment.id)}
                    className="w-10 h-10 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-xl flex items-center justify-center transition-colors"
                    title="বাতিল করুন"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 font-bold">
              কোনো অপেক্ষমাণ মন্তব্য নেই।
            </div>
          )}
        </div>
      )}
    </div>
  );
}
