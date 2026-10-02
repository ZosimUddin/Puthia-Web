import React from 'react';
import { Share2 } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url, className }) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await copyToClipboard(url);
      alert('লিঙ্ক কপি করা হয়েছে!');
    }
  };

  return (
    <button 
      onClick={handleShare} 
      className={`p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors ${className}`} 
      title="শেয়ার করুন"
    >
      <Share2 size={18} />
    </button>
  );
};
