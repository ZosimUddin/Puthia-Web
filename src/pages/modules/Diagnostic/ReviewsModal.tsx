import React, { useState } from 'react';
import { ReviewItem } from './types';
import { initialReviews } from './data';
import { ArrowLeft, Star, ThumbsUp, MessageCircle, Image, Plus, X, Send } from 'lucide-react';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rating?: number;
  reviewCount?: number;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({
  isOpen,
  onClose,
  rating = 4.6,
  reviewCount = 128
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'latest'>('all');
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // New review state
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  if (!isOpen) return null;

  const handleLike = (id: string) => {
    setLikedReviews(prev => {
      const isLiked = !prev[id];
      setReviews(curr => curr.map(r => r.id === id ? { ...r, likes: r.likes + (isLiked ? 1 : -1) } : r));
      return { ...prev, [id]: isLiked };
    });
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newComment.trim()) return;

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      userName: newUserName,
      date: 'আজ',
      rating: newRating,
      comment: newComment,
      photos: [],
      likes: 0,
      replies: 0
    };

    setReviews([newRev, ...reviews]);
    setShowWriteModal(false);
    setNewUserName('');
    setNewComment('');
  };

  const filteredReviews = reviews.filter(r => {
    if (activeTab === 'photos') return r.photos && r.photos.length > 0;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-sm font-bold text-slate-800">রিভিউ ও রেটিং</h2>
          <div className="w-9" />
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          
          {/* Top Rating Breakdown Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4">
            
            {/* Score Big Display */}
            <div className="flex flex-col items-center justify-center pr-4 border-r border-slate-200">
              <span className="text-3xl font-extrabold text-slate-900">{rating}</span>
              <div className="flex text-amber-400 my-1 text-xs">
                ★ ★ ★ ★ ★
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{reviewCount} টি রিভিউ</span>
            </div>

            {/* Rating Bars */}
            <div className="flex-1 space-y-1 text-[11px] font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3">5★</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#006a4e] rounded-full" style={{ width: '65%' }} />
                </div>
                <span className="w-5 text-right font-normal text-slate-400">78</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3">4★</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#006a4e] rounded-full" style={{ width: '25%' }} />
                </div>
                <span className="w-5 text-right font-normal text-slate-400">32</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3">3★</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '10%' }} />
                </div>
                <span className="w-5 text-right font-normal text-slate-400">10</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3">2★</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '5%' }} />
                </div>
                <span className="w-5 text-right font-normal text-slate-400">5</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3">1★</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '3%' }} />
                </div>
                <span className="w-5 text-right font-normal text-slate-400">3</span>
              </div>
            </div>

          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 pt-1 border-b border-slate-100 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'all'
                  ? 'bg-[#006a4e] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              সব রিভিউ ({reviewCount})
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'photos'
                  ? 'bg-[#006a4e] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ছবি সহ (32)
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'latest'
                  ? 'bg-[#006a4e] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              সর্বশেষ
            </button>
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="p-3 bg-white border border-slate-100 rounded-2xl space-y-2 shadow-2xs">
                
                {/* User Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#006a4e]/10 text-[#006a4e] font-bold text-xs flex items-center justify-center">
                      {rev.userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{rev.userName}</h4>
                      <div className="flex text-amber-400 text-[10px]">
                        {'★'.repeat(rev.rating)}
                        {'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{rev.date}</span>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {rev.comment}
                </p>

                {/* Photos Grid if present */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex gap-2 pt-1 overflow-x-auto">
                    {rev.photos.map((p, idx) => (
                      <div key={idx} className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img 
                          src={p} 
                          alt="Review attachment" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://picsum.photos/seed/revphoto${idx}/300/200`;
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions: Likes & Reply */}
                <div className="flex items-center gap-4 pt-1 text-[11px] font-semibold text-slate-500">
                  <button 
                    onClick={() => handleLike(rev.id)}
                    className={`flex items-center gap-1 hover:text-[#006a4e] transition ${
                      likedReviews[rev.id] ? 'text-[#006a4e]' : ''
                    }`}
                  >
                    <ThumbsUp size={13} />
                    <span>{rev.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-[#006a4e] transition">
                    <MessageCircle size={13} />
                    <span>উপকারী</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Footer Write Review Button */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <button
            onClick={() => setShowWriteModal(true)}
            className="w-full bg-[#006a4e] hover:bg-[#00523d] text-white font-bold py-3.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            রিভিউ লিখুন
          </button>
        </div>

      </div>

      {/* Modal to Write Review */}
      {showWriteModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-800 text-sm">আপনার অভিজ্ঞতা শেয়ার করুন</h3>
              <button onClick={() => setShowWriteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">আপনার নাম *</label>
                <input 
                  type="text" 
                  required
                  placeholder="আপনার নাম লিখুন"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs mt-1 focus:ring-2 focus:ring-[#006a4e] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">রেটিং নির্বাচন করুন</label>
                <div className="flex gap-2 text-2xl text-amber-400 mt-1 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      onClick={() => setNewRating(star)}
                      className={star <= newRating ? 'opacity-100' : 'opacity-30'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">আপনার মতামত *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="সেবা ও পরিবেশ কেমন ছিল?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs mt-1 focus:ring-2 focus:ring-[#006a4e] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#006a4e] text-white font-bold py-3 rounded-xl text-xs hover:bg-[#00523d] transition flex items-center justify-center gap-1.5"
              >
                <Send size={14} />
                রিভিউ জমা দিন
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
