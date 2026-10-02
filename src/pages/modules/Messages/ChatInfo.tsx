import React from 'react';
import { Conversation } from '../../../types';
import { X, Bell, Search, Ban, Trash2, Image as ImageIcon, FileText, Link as LinkIcon, UserPlus } from 'lucide-react';

interface ChatInfoProps {
  chat: Conversation;
  currentUser: any;
  onClose: () => void;
}

const ChatInfo: React.FC<ChatInfoProps> = ({ chat, currentUser, onClose }) => {
  const getChatName = () => {
    if (chat.type === 'group') return chat.name || 'গ্রুপ চ্যাট';
    const otherId = chat.participants.find(id => id !== currentUser.uid);
    return otherId && chat.participantDetails ? chat.participantDetails[otherId]?.name : 'ব্যবহারকারী';
  };

  const getChatPhoto = () => {
    if (chat.type === 'group') return chat.photoURL;
    const otherId = chat.participants.find(id => id !== currentUser.uid);
    return otherId && chat.participantDetails ? chat.participantDetails[otherId]?.photoURL : null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="h-16 flex items-center justify-between px-4 bg-white border-b border-slate-100">
        <h3 className="font-bold text-slate-800">তথ্য</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center py-6 bg-white border-b border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full mb-3 flex items-center justify-center text-2xl font-bold text-emerald-600 overflow-hidden shadow-sm">
            {getChatPhoto() ? (
              <img src={getChatPhoto()!} alt="profile" className="w-full h-full object-cover" />
            ) : (
              getChatName()?.charAt(0)
            )}
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">{getChatName()}</h2>
          {chat.type === 'group' && (
            <p className="text-sm text-slate-500 mt-1">{chat.participants.length} সদস্য</p>
          )}
        </div>

        <div className="flex justify-center gap-6 py-4 bg-white border-b border-slate-100">
          <button className="flex flex-col items-center gap-1.5 text-slate-600 hover:text-slate-900">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <Search size={18} />
            </div>
            <span className="text-xs font-bold">সার্চ</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-slate-600 hover:text-slate-900">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <Bell size={18} />
            </div>
            <span className="text-xs font-bold">মিউট</span>
          </button>
          {chat.type === 'group' && (
            <button className="flex flex-col items-center gap-1.5 text-slate-600 hover:text-slate-900">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <UserPlus size={18} />
              </div>
              <span className="text-xs font-bold">সদস্য যোগ</span>
            </button>
          )}
        </div>

        <div className="mt-2 bg-white">
          <div className="p-4 border-b border-slate-100">
            <h4 className="font-extrabold text-slate-800 text-sm mb-3">মিডিয়া, ফাইল এবং লিংক</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <ImageIcon size={24} />
              </div>
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <FileText size={24} />
              </div>
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <LinkIcon size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 bg-white pb-6">
          <div className="p-2">
            <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 rounded-xl transition-colors text-slate-700">
              <Ban size={18} className="text-slate-500" />
              <span className="text-sm font-bold">ব্লক করুন</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-rose-50 rounded-xl transition-colors text-rose-600 mt-1">
              <Trash2 size={18} />
              <span className="text-sm font-bold">চ্যাট ডিলিট করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInfo;
