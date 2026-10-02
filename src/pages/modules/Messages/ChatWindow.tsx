import React, { useState, useEffect, useRef } from 'react';
import { Conversation, ChatMessage } from '../../../types';
import { chatService } from '../../../services/chatService';
import { TypingIndicator, TypingUser } from '../../../components/adda/TypingIndicator';
import { 
  ArrowLeft, 
  MoreVertical, 
  Image as ImageIcon, 
  Mic, 
  Send, 
  Paperclip,
  Smile,
  Info,
  Check,
  CheckCheck,
  Clock,
  Phone,
  Video
} from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useCall } from '../../../contexts/CallContext';
import { toast } from 'sonner';

interface ChatWindowProps {
  chat: Conversation;
  currentUser: any;
  onBack: () => void;
  onToggleInfo: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, currentUser, onBack, onToggleInfo }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const { initiateCall } = useCall();
  
  const getOtherParticipant = () => {
    if (chat.type === 'group') return null;
    const otherId = chat.participants.find(id => id !== currentUser.uid);
    if (!otherId) return null;
    const details = chat.participantDetails ? chat.participantDetails[otherId] : null;
    return {
      uid: otherId,
      name: details?.name || 'ব্যবহারকারী',
      photoURL: details?.photoURL || '',
      phone: (details as any)?.phone || ''
    };
  };

  const handleAudioCall = () => {
    const other = getOtherParticipant();
    if (other) {
      initiateCall(other, 'audio');
    }
  };

  const handleVideoCall = () => {
    const other = getOtherParticipant();
    if (other) {
      initiateCall(other, 'video');
    }
  };

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

  const isOnline = () => {
    if (chat.type === 'group') return false;
    const otherId = chat.participants.find(id => id !== currentUser.uid);
    return otherId && chat.participantDetails ? chat.participantDetails[otherId]?.isOnline : false;
  };

  useEffect(() => {
    if (!chat.id) return;
    const unsubscribe = chatService.subscribeToMessages(chat.id, (data) => {
      setMessages(data);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    const currentUserId = currentUser?.uid || 'guest_user';
    const unsubTyping = chatService.subscribeToTyping(chat.id, currentUserId, (users) => {
      setTypingUsers(users);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    return () => {
      unsubscribe();
      unsubTyping();
    };
  }, [chat.id, currentUser?.uid]);

  const handleInputChange = (val: string) => {
    setInputText(val);
    const currentUserId = currentUser?.uid || 'guest_user';
    const currentUserName = currentUser?.displayName || currentUser?.name || 'ব্যবহারকারী';
    
    chatService.setTypingStatus(
      chat.id,
      currentUserId,
      currentUserName,
      val.length > 0,
      currentUser?.photoURL
    );

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (val.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        chatService.setTypingStatus(
          chat.id,
          currentUserId,
          currentUserName,
          false,
          currentUser?.photoURL
        );
      }, 3000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    chatService.setTypingStatus(
      chat.id,
      currentUser?.uid || 'guest_user',
      currentUser?.displayName || currentUser?.name || 'ব্যবহারকারী',
      false,
      currentUser?.photoURL
    );
    
    try {
      await chatService.sendMessage(chat.id, currentUser.uid, text, chat.participants);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error?.message || "মেসেজ পাঠানো সম্ভব হয়নি। পুনরায় চেষ্টা করুন।");
      setInputText(text);
    }
  };

  const handleSendThumbsUp = async () => {
    try {
      await chatService.sendMessage(chat.id, currentUser.uid, '👍', chat.participants);
    } catch (error: any) {
      toast.error(error?.message || "মেসেজ পাঠানো সম্ভব হয়নি।");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ছবির আকার সর্বোচ্চ ৫ মেগাবাইট হতে হবে।");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        await chatService.sendMessage(chat.id, currentUser.uid, '📷 ছবি', chat.participants, {
          type: 'image',
          mediaUrl: dataUrl
        });
        toast.success("ছবি পাঠানো হয়েছে!");
      } catch (err: any) {
        toast.error(err?.message || "ছবি পাঠানো ব্যর্থ হয়েছে।");
      }
    };
    reader.readAsDataURL(file);
  };

  // Safe timestamp parser
  const parseTimestamp = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    if (typeof timestamp === 'object' && timestamp?.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return isNaN(date.getTime()) ? null : date;
    }
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? null : timestamp;
    }
    return null;
  };

  const formatMessageTime = (timestamp: any): string => {
    const date = parseTimestamp(timestamp);
    if (!date) return '';
    return format(date, 'h:mm a');
  };

  const formatFullMessageDateTime = (timestamp: any): string => {
    const date = parseTimestamp(timestamp);
    if (!date) return '';
    return format(date, 'EEEE, MMMM d, yyyy h:mm a');
  };

  const getMessageDateDivider = (currTimestamp: any, prevTimestamp?: any): string | null => {
    const currDate = parseTimestamp(currTimestamp);
    if (!currDate) return null;

    if (prevTimestamp) {
      const prevDate = parseTimestamp(prevTimestamp);
      if (prevDate && currDate.toDateString() === prevDate.toDateString()) {
        return null;
      }
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (currDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (currDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (currDate.getFullYear() === today.getFullYear()) {
      return format(currDate, 'MMMM d');
    } else {
      return format(currDate, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5]">
      <div className="h-16 bg-white px-4 flex items-center justify-between border-b border-slate-200 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden w-8 h-8 flex items-center justify-center -ml-2 text-slate-500 rounded-full hover:bg-slate-100">
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative">
            {getChatPhoto() ? (
              <img src={getChatPhoto()!} alt="profile" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                {getChatName()?.charAt(0)}
              </div>
            )}
            {isOnline() && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div>
            <h2 className="font-extrabold text-slate-800 leading-tight">{getChatName()}</h2>
            <p className="text-[11px] font-bold text-slate-500">
              {typingUsers.length > 0 ? (
                <TypingIndicator typingUsers={typingUsers} variant="header" />
              ) : isOnline() ? (
                <span className="text-emerald-600">Active now</span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-emerald-600">
          {chat.type !== 'group' && (
            <>
              <button 
                type="button"
                onClick={handleAudioCall} 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors cursor-pointer border-none"
                title="অডিও কল"
              >
                <Phone size={19} />
              </button>
              <button 
                type="button"
                onClick={handleVideoCall} 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors cursor-pointer border-none"
                title="ভিডিও কল"
              >
                <Video size={20} />
              </button>
            </>
          )}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 transition-colors cursor-pointer border-none">
            <Info size={20} onClick={onToggleInfo} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 transition-colors cursor-pointer border-none">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const dateDivider = getMessageDateDivider(msg.timestamp, prevMsg ? prevMsg.timestamp : undefined);
          const isMe = msg.senderId === currentUser.uid;
          const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);
          
          return (
            <React.Fragment key={msg.id}>
              {dateDivider && (
                <div className="flex justify-center my-3 select-none">
                  <span className="text-[11px] font-semibold text-slate-500 bg-white/80 border border-slate-200/60 shadow-2xs px-3.5 py-1 rounded-full">
                    {dateDivider}
                  </span>
                </div>
              )}

              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group items-end gap-2`}>
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden mb-0.5 shadow-2xs border border-slate-200/60">
                    {chat.participantDetails?.[msg.senderId]?.photoURL ? (
                      <img src={chat.participantDetails[msg.senderId].photoURL} className="w-full h-full object-cover" alt="avatar" />
                    ) : (
                      <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${msg.senderId}`} className="w-full h-full object-cover" alt="avatar" />
                    )}
                  </div>
                )}
                
                <div className={`max-w-[82%] sm:max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMe && chat.type === 'group' && showAvatar && (
                    <span className="text-[10px] font-bold text-slate-500 ml-1 mb-1">
                      {chat.participantDetails?.[msg.senderId]?.name}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"><MoreVertical size={14}/></button>
                      </div>
                    )}
                    
                    <div 
                      className={`px-3.5 py-2.5 text-[15px] leading-[1.35] shadow-2xs relative break-words ${
                        isMe 
                          ? 'bg-[#0084FF] text-white rounded-[18px] rounded-br-[4px]' 
                          : 'bg-[#e4e6eb] text-[#050505] rounded-[18px] rounded-bl-[4px]'
                      }`}
                      title={formatFullMessageDateTime(msg.timestamp)}
                    >
                      <span className="whitespace-pre-wrap break-words font-normal text-[15px] leading-[1.35]">{msg.text}</span>

                      <span className={`inline-flex items-center gap-1 float-right ml-2.5 mt-1 text-[10px] select-none font-medium tabular-nums ${
                        isMe ? 'text-white/80' : 'text-slate-500'
                      }`}>
                        <span>{formatMessageTime(msg.timestamp)}</span>
                        {isMe && (
                          <span className="inline-flex items-center">
                            {msg.status === 'sending' && (
                              <span title="পাঠানো হচ্ছে..."><Clock size={10} className="text-white/70 animate-spin" /></span>
                            )}
                            {msg.status === 'sent' && (
                              <span title="পাঠানো হয়েছে (Sent)"><Check size={11} className="text-white/90 stroke-[2.2]" /></span>
                            )}
                            {msg.status === 'delivered' && (
                              <span title="পৌঁছেছে (Delivered)"><CheckCheck size={12} className="text-white/95 stroke-[2.2]" /></span>
                            )}
                            {msg.status === 'seen' && (
                              <span title="দেখা হয়েছে (Seen)"><CheckCheck size={12.5} className="stroke-[2.8] text-white" /></span>
                            )}
                          </span>
                        )}
                      </span>
                      <div className="clear-both" />
                    </div>
                    
                    {!isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"><MoreVertical size={14}/></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {typingUsers.length > 0 && (
          <TypingIndicator 
            typingUsers={typingUsers} 
            variant="bubble" 
            userName={getChatName()} 
            userAvatar={getChatPhoto() || undefined} 
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <button type="button" className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors shrink-0">
            <Smile size={24} />
          </button>
          
          <div className="flex-1 bg-slate-100 rounded-3xl flex items-end relative border border-transparent focus-within:border-emerald-300 focus-within:bg-white transition-colors">
            <textarea 
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="মেসেজ লিখুন..." 
              className="w-full bg-transparent max-h-32 min-h-[40px] py-2.5 px-4 outline-none resize-none text-[15px]"
              rows={1}
            />
            <div className="flex items-center pr-2 pb-1.5 shrink-0">
              <label className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-full cursor-pointer">
                <ImageIcon size={20} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
          
          {inputText.trim() ? (
            <button 
              type="submit" 
              className="w-12 h-12 bg-[#1877F2] text-white flex items-center justify-center rounded-full hover:bg-blue-600 transition-colors shrink-0 shadow-sm cursor-pointer border-0"
              title="পাঠান"
            >
              <Send size={20} className="ml-0.5" />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSendThumbsUp} 
              className="w-12 h-12 bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center rounded-full hover:bg-[#1877F2]/20 transition-colors shrink-0 cursor-pointer border-0 text-xl"
              title="লাইক পাঠান"
            >
              👍
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
