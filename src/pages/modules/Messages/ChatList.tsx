import React, { useState } from 'react';
import { Search, Edit, Users, MoreVertical } from 'lucide-react';
import { Conversation } from '../../../types';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

interface ChatListProps {
  conversations: Conversation[];
  activeChatId?: string;
  onSelectChat: (chat: Conversation) => void;
  currentUser: any;
}

const ChatList: React.FC<ChatListProps> = ({ conversations, activeChatId, onSelectChat, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const toBengaliNumber = (num: number | string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit)]);
  };

  const getChatName = (chat: Conversation) => {
    if (chat.type === 'group') return chat.name || 'গ্রুপ চ্যাট';
    const otherParticipantId = chat.participants.find(id => id !== currentUser.uid);
    if (!otherParticipantId || !chat.participantDetails) return 'অজানা ব্যবহারকারী';
    return chat.participantDetails[otherParticipantId]?.name || 'ব্যবহারকারী';
  };

  const getChatPhoto = (chat: Conversation) => {
    if (chat.type === 'group') return chat.photoURL;
    const otherParticipantId = chat.participants.find(id => id !== currentUser.uid);
    if (!otherParticipantId || !chat.participantDetails) return null;
    return chat.participantDetails[otherParticipantId]?.photoURL;
  };

  const isOnline = (chat: Conversation) => {
    if (chat.type === 'group') return false;
    const otherParticipantId = chat.participants.find(id => id !== currentUser.uid);
    if (!otherParticipantId || !chat.participantDetails) return false;
    const details = chat.participantDetails[otherParticipantId];
    return Boolean(details?.isOnline || (details?.lastSeen && Date.now() - details.lastSeen < 10 * 60 * 1000));
  };

  const filteredChats = conversations.filter(chat => 
    getChatName(chat).toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <h2 className="text-xl font-extrabold text-slate-800">চ্যাটস</h2>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100">
            <Edit size={16} />
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="খুঁজুন..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="text-center p-8 text-slate-400">
            <p className="text-sm">কোনো চ্যাট পাওয়া যায়নি</p>
          </div>
        ) : (
          filteredChats.map(chat => {
            const name = getChatName(chat);
            const photo = getChatPhoto(chat);
            const online = isOnline(chat);
            const unread = chat.unreadCount?.[currentUser.uid] || 0;
            const isActive = activeChatId === chat.id;

            return (
              <div 
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`flex items-center gap-3 p-3 mx-2 my-1 rounded-2xl cursor-pointer transition-colors ${
                  isActive ? 'bg-emerald-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative">
                  {photo ? (
                    <img src={photo} alt={name} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                      {chat.type === 'group' ? <Users size={20} /> : name.charAt(0)}
                    </div>
                  )}
                  {online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-sm truncate pr-2 ${unread > 0 ? 'font-extrabold text-slate-900' : 'font-bold text-slate-800'}`}>
                      {name}
                    </h3>
                    {chat.lastMessageTime && (
                      <span className={`text-[10px] whitespace-nowrap ${unread > 0 ? 'font-bold text-emerald-600' : 'text-slate-400'}`}>
                        {formatDistanceToNow(new Date(chat.lastMessageTime), { locale: bn, addSuffix: true }).replace('প্রায় ', '')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate pr-4 ${unread > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                      {chat.lastMessageSenderId === currentUser.uid ? 'আপনি: ' : ''}
                      {chat.lastMessage || 'কোনো মেসেজ নেই'}
                    </p>
                    {unread > 0 && (
                      <span className="w-5 h-5 flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full shadow-sm shrink-0">
                        {toBengaliNumber(unread)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
