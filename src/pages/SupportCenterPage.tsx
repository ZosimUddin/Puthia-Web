import React, { useState } from 'react';
import { 
  HelpCircle, MessageSquare, Search, Send, FileText, CheckCircle2, 
  Clock, AlertCircle, Plus, Paperclip, ChevronDown, ChevronUp, User, Shield 
} from 'lucide-react';
import { MOCK_FAQS, MOCK_TICKETS, SupportTicket, FaqItem } from '../services/supportCenterService';

export const SupportCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'FAQ' | 'TICKETS' | 'NEW_TICKET'>('FAQ');
  const [faqs] = useState<FaqItem[]>(MOCK_FAQS);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(tickets[0] || null);

  // New Ticket Form State
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<'GENERAL' | 'TECHNICAL' | 'CORRECTION' | 'EMERGENCY'>('GENERAL');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newMessage, setNewMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    const createdTicket: SupportTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      subject: newSubject,
      category: newCategory,
      priority: newPriority,
      status: 'OPEN',
      createdAt: new Date().toLocaleString('bn-BD'),
      userEmail: "mdzosimuddin47@gmail.com",
      replies: [
        {
          id: `R-${Date.now()}`,
          sender: 'USER',
          senderName: 'নাগরিক',
          message: newMessage,
          createdAt: new Date().toLocaleString('bn-BD')
        }
      ]
    };

    setTickets([createdTicket, ...tickets]);
    setSelectedTicket(createdTicket);
    setNewSubject('');
    setNewMessage('');
    setActiveTab('TICKETS');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    const newReply = {
      id: `R-${Date.now()}`,
      sender: 'USER' as const,
      senderName: 'নাগরিক',
      message: replyMessage,
      createdAt: new Date().toLocaleString('bn-BD')
    };

    const updatedTicket = {
      ...selectedTicket,
      replies: [...selectedTicket.replies, newReply]
    };

    setSelectedTicket(updatedTicket);
    setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setReplyMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-teal-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5">
              <HelpCircle size={14} className="text-teal-400" /> Help & Support Center
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">হেল্প সেন্টার ও সাপোর্ট টিকিট পোর্টাল</h1>
            <p className="text-xs sm:text-sm text-teal-100/90 font-medium max-w-xl">
              পুঠিয়া নাগরিক পোর্টাল ব্যবহার সম্পর্কিত যেকোনো জিজ্ঞাসা, অভিযোগ বা সহযোগিতার জন্য হেল্পডেস্ক
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/60 shrink-0">
            <button
              onClick={() => setActiveTab('FAQ')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'FAQ' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              সাধারণ প্রশ্ন (FAQ)
            </button>
            <button
              onClick={() => setActiveTab('TICKETS')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'TICKETS' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              আমার টিকিট ({tickets.length})
            </button>
          </div>
        </div>

        {/* TAB 1: FAQ & SEARCH HELP */}
        {activeTab === 'FAQ' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Search Box */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-md flex items-center gap-3">
              <Search size={20} className="text-slate-400 shrink-0 ml-2" />
              <input
                type="text"
                placeholder="প্রশ্ন বা বিষয় লিখে খুঁজুন (যেমন: রাজবাড়ি সময়সূচি, ট্রেড লাইসেন্স)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-bold bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Accordion FAQ List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-3">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
                প্রচরাচরিত জিজ্ঞাসিত প্রশ্নাবলী (Frequently Asked Questions)
              </h3>

              <div className="divide-y divide-slate-100">
                {filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="py-3">
                    <button
                      onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                      className="w-full flex justify-between items-center text-left text-xs sm:text-sm font-black text-slate-900 cursor-pointer py-2 hover:text-emerald-700 transition-colors"
                    >
                      <span>{faq.question}</span>
                      {expandedFaqIndex === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {expandedFaqIndex === idx && (
                      <p className="text-xs font-medium text-slate-600 leading-relaxed pt-2 pb-1 bg-slate-50 p-3 rounded-2xl mt-1">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-black text-emerald-950">আপনার প্রশ্নের উত্তর খুঁজে পাননি?</h4>
                <p className="text-xs font-bold text-emerald-800">আমাদের অ্যাডমিন টিমকে সরাসরি সাপোর্ট টিকিট পাঠান</p>
              </div>

              <button
                onClick={() => setActiveTab('NEW_TICKET')}
                className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus size={16} /> নতুন টিকিট তৈরি করুন
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MY TICKETS & DETAILS */}
        {activeTab === 'TICKETS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            
            {/* Tickets List Sidebar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900">আপনার টিকিটসমূহ</h3>
                <button
                  onClick={() => setActiveTab('NEW_TICKET')}
                  className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-[10px] font-black hover:bg-emerald-200 cursor-pointer"
                >
                  + নতুন
                </button>
              </div>

              <div className="space-y-2">
                {tickets.map(tck => (
                  <div
                    key={tck.id}
                    onClick={() => setSelectedTicket(tck)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      selectedTicket?.id === tck.id 
                        ? 'bg-emerald-50 border-emerald-400' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-black text-slate-500">{tck.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                        tck.status === 'RESOLVED' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {tck.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">{tck.subject}</h4>
                    <span className="text-[10px] font-bold text-slate-400 block">{tck.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Ticket Conversation View */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6 flex flex-col justify-between">
              {selectedTicket ? (
                <>
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-4 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-black text-emerald-700">{selectedTicket.id}</span>
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-black uppercase">
                          Priority: {selectedTicket.priority}
                        </span>
                      </div>
                      <h2 className="text-base font-black text-slate-900">{selectedTicket.subject}</h2>
                    </div>

                    {/* Messages Feed */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {selectedTicket.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-4 rounded-2xl space-y-1 text-xs max-w-lg ${
                            reply.sender === 'USER' 
                              ? 'bg-emerald-50 border border-emerald-200 ml-auto' 
                              : 'bg-slate-100 border border-slate-200 mr-auto'
                          }`}
                        >
                          <div className="flex justify-between items-center gap-4 text-[10px] font-black text-slate-500 pb-1 border-b border-slate-200/50">
                            <span className="flex items-center gap-1">
                              {reply.sender === 'ADMIN' ? <Shield size={12} className="text-emerald-700" /> : <User size={12} />}
                              {reply.senderName}
                            </span>
                            <span>{reply.createdAt}</span>
                          </div>
                          <p className="font-bold text-slate-800 leading-relaxed pt-1">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 flex gap-2">
                    <input
                      type="text"
                      placeholder="আপনার উত্তর লিখুন..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full text-xs font-bold p-3 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Send size={14} /> উত্তর পাঠান
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-20 text-center text-slate-400 font-bold text-xs">
                  বামপাশ থেকে একটি টিকিট সিলেক্ট করুন
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: NEW TICKET FORM */}
        {activeTab === 'NEW_TICKET' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-2xl mx-auto space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">নতুন সাপোর্ট টিকিট জমা দিন</h2>
              <p className="text-xs text-slate-500 font-medium">আপনার সমস্যা বা মতামত বিস্তারিত লিখুন, আমাদের টিম দ্রুত সমাধান করবে</p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">টিকিটের বিষয়বস্তু (Subject):</label>
                <input
                  type="text"
                  required
                  placeholder="সংক্ষেপে বিষয়টি লিখুন..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 block">ক্যাটাগরি:</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                  >
                    <option value="GENERAL">সাধারণ জিজ্ঞাসা</option>
                    <option value="TECHNICAL">কারিগরি সমস্যা</option>
                    <option value="CORRECTION">তথ্য সংশোধন</option>
                    <option value="EMERGENCY">জরুরি সহায়তা</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 block">জরুরি মাত্রা (Priority):</label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">বিস্তারিত বর্ণনা (Message):</label>
                <textarea
                  required
                  rows={4}
                  placeholder="আপনার সমস্যার বিস্তারিত বিবরণ লিখুন..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('FAQ')}
                  className="px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs cursor-pointer"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send size={14} /> টিকিট সাবমিট করুন
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default SupportCenterPage;
