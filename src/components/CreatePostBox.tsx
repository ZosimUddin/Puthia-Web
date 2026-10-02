import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { MyMediaLibraryModal } from './adda/MyMediaLibraryModal';

interface CreatePostBoxProps {
  onOpenCreateModal: (action?: 'photo' | 'video' | 'general') => void;
  onOpenMediaLibrary?: () => void;
}

export function CreatePostBox({ onOpenCreateModal, onOpenMediaLibrary }: CreatePostBoxProps) {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  const handleAvatarClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      navigate(`/profile/${user.uid}`);
    }
  };

  const handleClick = (action?: 'photo' | 'video' | 'general') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    onOpenCreateModal(action);
  };

  const userAvatar = userProfile?.photoURL || (userProfile as any)?.photoUrl || (userProfile as any)?.avatarUrl || user?.photoURL || '';

  return (
    <div className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-slate-200/80 p-3 sm:p-4 mb-2 sm:mb-3.5 shadow-sm">
      <div className="flex gap-3 items-center mb-4">
        <button 
          onClick={handleAvatarClick}
          className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-100 cursor-pointer shadow-sm active:scale-95 transition-all p-0 flex items-center justify-center text-white"
        >
          {userAvatar ? (
            <img 
              src={userAvatar}
              alt={userProfile?.name || user?.displayName || "User"}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-[#0091FF] flex items-center justify-center font-bold text-sm">
              {(userProfile?.name || user?.displayName || 'M')[0]}
            </div>
          )}
        </button>
        <button 
          onClick={() => handleClick('general')}
          className="flex-grow text-left px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 rounded-2xl text-slate-500 text-sm font-medium transition-all border-0 cursor-pointer"
        >
          {user ? `কী ভাবছেন, ${(userProfile?.name || user.displayName || 'নাগরিক').split(' ')[0]}?` : 'আপনার মতামত শেয়ার করুন...'}
        </button>
      </div>

      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}

      {showMediaModal && user && (
        <MyMediaLibraryModal
          userId={user.uid}
          userName={userProfile?.name || user.displayName || 'নাগরিক'}
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
        />
      )}
    </div>
  );
}


