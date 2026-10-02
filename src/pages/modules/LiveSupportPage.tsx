import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Headset, MessageSquare, Send, PhoneCall, HelpCircle, ShieldCheck, 
  ArrowLeft, ExternalLink, CheckCircle2, Clock, User, Sparkles, MessageCircle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../../components/AuthModal';

// @ts-ignore
import puthiaBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  time: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: 'pending' | 'resolved' | 'processing';
  date: string;
  reply?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'admin',
    text: 'আসসালামু আলাইকুম! পুঠিয়া ডিজিটাল সেবা প্ল্যাটফর্মে আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সহায়তা করতে পারি?',
    time: '১০:০০ AM'
  }
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TICK-9921',
    subject: 'জন্ম নিবন্ধন সার্টিফিকেট সংশোধন সংক্রান্ত',
    category: 'নাগরিক সেবা',
    description: 'আমার জন্ম সনদের নামের বানান সংশোধন করতে চাই, কি করতে হবে?',
    status: 'resolved',
    date: '২০২৬-০৭-২০',
    reply: 'আপনার আবেদনটি সংশ্লিষ্ট পৌর ওয়ার্ড অফিসে ফরওয়ার্ড করা হয়েছে। অনুগ্রহ করে মূল কাগজসহ যোগাযোগ করুন।'
  },
  {
    id: 'TICK-9945',
    subject: 'স্থানীয় প্লাম্বার সেবা বুকিং নিশ্চিতকরণ',
    category: 'স্থানীয় সহযোগী',
    description: 'আজ বিকালের জন্য একজন প্লাম্বার বুক করেছিলাম কিন্তু কনফার্মেশন পাইনি।',
    status: 'processing',
    date: '২০২৬-০৭-২১',
    reply: 'আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।'
  }
];

export const LiveSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'chat' | 'tickets'>('chat');

  // Admin Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('puthia_admin_chat');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MESSAGES;
  });
  const [chatInput, setChatInput] = useState('');

  // Ticket State
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem('puthia_support_tickets');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_TICKETS;
  });

  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('নাগরিক সেবা');
  const [ticketDesc, setTicketDesc] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('puthia_admin_chat', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('puthia_support_tickets', JSON.stringify(tickets));
    } catch (e) {}
  }, [tickets]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const query = chatInput.trim();
    setChatInput('');

    // Simulate auto reply from Puthia Support Admin after 1 second
    setTimeout(() => {
      let replyText = 'আপনার বার্তাটি আমরা পেয়েছি। পুঠিয়া হেল্পডেস্ক প্রতিনিধি শীঘ্রই আপনার সাথে যুক্ত হবেন।';
      if (query.includes('জন্ম') || query.includes('nid')) {
        replyText = 'জন্ম নিবন্ধন বা এনআইডি সংক্রান্ত সহায়তার জন্য অনুগ্রহ করে সংশ্লিষ্ট সেবা মডিউল বা উপজেলা অফিসে যোগাযোগ করুন।';
      } else if (query.includes('سلام') || query.includes('হ্যালো')) {
        replyText = 'ওয়ালাইকুমুস সালাম! পুঠিয়া সেবায় আপনাকে কীভাবে সাহায্য করতে পারি?';
      }

      const adminMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'admin',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, adminMsg]);
    }, 1200);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) {
      toast.error('অনুগ্রহ করে বিষয় ও বিবরণ লিখুন');
      return;
    }

    const newTicket: SupportTicket = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject.trim(),
      category: ticketCategory,
      description: ticketDesc.trim(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      reply: 'আপনার টিকিটটি সফলভাবে জমা হয়েছে। শীঘ্রই অ্যাডমিন যাচাই করবেন।'
    };

    setTickets(prev => [newTicket, ...prev]);
    toast.success('সাপোর্ট টিকিট সফলভাবে সাবমিট হয়েছে!');
    setIsNewTicketOpen(false);
    setTicketSubject('');
    setTicketDesc('');
  };

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans">
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={() => {}} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : `/${path}`);
        }} 
      />

      <main className="flex-1 pb-24">
        <div className="animate-fade-in font-sans">
          
          {/* Top Banner Header */}
          <div 
            className="p-5 sm:p-7 rounded-b-[32px] text-white relative overflow-hidden mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)' }}
          >
            <div 
              className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none" 
              style={{ backgroundImage: `url(${puthiaBg})` }} 
            />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <button 
                onClick={() => navigate('/exclusive-features')} 
                className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition flex items-center justify-center cursor-pointer text-white"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                  <Headset className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> ২৪/৭ লাইভ সাপোর্ট ও হেল্পডেস্ক
                </span>
              </div>
            </div>

            <div className="relative z-10 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                লাইভ সাপোর্ট ও হেল্পডেস্ক (Live Support)
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 font-medium leading-relaxed">
                অ্যাডমিন চ্যাট, মেসেঞ্জার, হোয়াটসঅ্যাপ, টেলিগ্রাম এবং সাপোর্ট টিকিটের মাধ্যমে সরাসরি সহায়তা নিন।
              </p>
            </div>

            {/* Direct Social / Messaging Connect Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/15 relative z-10">
              <a
                href="https://m.me/puthiadigital"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/20 rounded-2xl p-2.5 flex items-center justify-center gap-2 border border-white/15 transition cursor-pointer text-white font-bold text-xs"
              >
                <MessageCircle size={16} className="text-sky-300" /> Messenger
              </a>
              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/20 rounded-2xl p-2.5 flex items-center justify-center gap-2 border border-white/15 transition cursor-pointer text-white font-bold text-xs"
              >
                <PhoneCall size={16} className="text-emerald-300" /> WhatsApp
              </a>
              <a
                href="https://t.me/puthiadigital"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/20 rounded-2xl p-2.5 flex items-center justify-center gap-2 border border-white/15 transition cursor-pointer text-white font-bold text-xs"
              >
                <Send size={16} className="text-indigo-300" /> Telegram
              </a>
            </div>
          </div>

          <div className="px-4 max-w-4xl mx-auto space-y-5">

            {/* Switch Tabs: Admin Chat vs Support Tickets */}
            <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-2xl max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'chat' 
                    ? 'bg-white text-sky-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare size={16} /> অ্যাডমিন লাইভ চ্যাট
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'tickets' 
                    ? 'bg-white text-sky-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle size={16} /> সাপোর্ট টিকিট ({tickets.length})
              </button>
            </div>

            {/* TAB 1: Admin Chat Simulator */}
            {activeTab === 'chat' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden flex flex-col h-[500px]">
                {/* Chat Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-black flex items-center justify-center">
                        PA
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">পুঠিয়া সাপোর্ট এক্সিকিউটিভ</h3>
                      <p className="text-[10px] text-emerald-600 font-bold">অনলাইন (সক্রিয়)</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                    রেসপন্স টাইম: ২-৫ মিনিট
                  </span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                  {messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3.5 space-y-1 text-xs shadow-2xs ${
                          isUser 
                            ? 'bg-sky-600 text-white rounded-br-xs' 
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                        }`}>
                          <p className="leading-relaxed font-medium">{msg.text}</p>
                          <span className={`block text-[9px] text-right ${isUser ? 'text-sky-200' : 'text-slate-400'}`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input Footer */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                  <input 
                    type="text"
                    placeholder="আপনার প্রশ্ন বা সমস্যা এখানে লিখুন..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Send size={15} /> পাঠান
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Support Tickets */}
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-800">আপনার জমাকৃত সাপোর্ট টিকিট</h3>
                  <button
                    onClick={() => setIsNewTicketOpen(true)}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <HelpCircle size={15} /> নতুন টিকিট তৈরি করুন
                  </button>
                </div>

                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                            {ticket.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {ticket.category}
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          ticket.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          {ticket.status === 'resolved' ? 'সমাধানকৃত' : ticket.status === 'processing' ? 'প্রক্রিয়াধীন' : 'অপেক্ষমান'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-base font-black text-slate-800">{ticket.subject}</h4>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{ticket.description}</p>
                      </div>

                      {ticket.reply && (
                        <div className="bg-sky-50/70 rounded-2xl p-3.5 border border-sky-100 space-y-1">
                          <span className="block text-[10px] font-bold text-sky-800">অ্যাডমিনের উত্তর:</span>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">{ticket.reply}</p>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>জমা দেওয়ার তারিখ: {ticket.date}</span>
                        <span className="text-emerald-600 font-bold">হেল্পডেস্ক সক্রিয়</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isNewTicketOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <HelpCircle size={18} className="text-sky-600" /> নতুন সাপোর্ট টিকিট তৈরি করুন
                </h3>
                <button 
                  onClick={() => setIsNewTicketOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">সেবার ক্যাটাগরি *</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
                  >
                    <option value="নাগরিক সেবা">নাগরিক সেবা (Citizen Services)</option>
                    <option value="স্থানীয় সহযোগী">স্থানীয় সহযোগী (Local Providers)</option>
                    <option value="কৃষি ও বাজার">কৃষি ও বাজার (Agriculture & Market)</option>
                    <option value="অন্যান্য সমস্যা">অন্যান্য সমস্যা (Others)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">সমস্যার বিষয় (Subject) *</label>
                  <input 
                    type="text"
                    placeholder="সংক্ষেপে আপনার সমস্যার বিষয় লিখুন"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ *</label>
                  <textarea 
                    rows={4}
                    placeholder="আপনার সমস্যা বা অভিযোগ বিস্তারিতভাবে এখানে লিখুন..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl font-bold shadow-md cursor-pointer hover:bg-sky-700 transition"
                  >
                    টিকিট জমা দিন
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default LiveSupportPage;
