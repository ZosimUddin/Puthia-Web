import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, MessageSquarePlus, MessageCircle, AlertCircle, HelpCircle, 
  ThumbsUp, Share2, ArrowLeft, Search, Send, CheckCircle2, Filter, Sparkles, MapPin, Tag
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

export interface CommunityPost {
  id: string;
  type: 'question' | 'opinion' | 'problem' | 'discussion';
  typeLabel: string;
  title: string;
  content: string;
  authorName: string;
  authorLocation: string;
  date: string;
  likes: number;
  commentsCount: number;
  commentsList: { id: string; author: string; text: string; date: string }[];
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    type: 'problem',
    typeLabel: 'সমস্যা জানান',
    title: 'পুঠিয়া পৌরসভার ৩নং ওয়ার্ডের প্রধান সড়কে ড্রেনেজ সমস্যা ও জলাবদ্ধতা',
    content: 'গত কয়েকদিনের টানা বৃষ্টিতে ৩নং ওয়ার্ডের প্রধান বাজার সংলগ্ন ড্রেনটি ময়লা-আবর্জনায় ব্লক হয়ে পানি রাস্তায় জমে গেছে। পথচারী ও দোকানদারদের চলাচলে মারাত্মক সমস্যা হচ্ছে। সংশ্লিষ্ট কর্তৃপক্ষের দৃষ্টি আকর্ষণ করছি।',
    authorName: 'মো. রফিকুল ইসলাম',
    authorLocation: 'পুঠিয়া সদর, পুঠিয়া',
    date: '২০২৬-০৭-২২',
    likes: 18,
    commentsCount: 4,
    commentsList: [
      { id: 'c-1', author: 'আব্দুল করিম', text: 'খুবই গুরুত্বপূর্ণ সমস্যা। পৌর্ত বিভাগকে দ্রুত জানানো দরকার।', date: '২০২৬-০৭-২২' },
      { id: 'c-2', author: 'নজরুল ইসলাম', text: 'মেয়র মহোদয় বিষয়টি অবগত আছেন, আশা করি দ্রুত পরিষ্কার করা হবে।', date: '২০২৬-০৭-২২' }
    ]
  },
  {
    id: 'post-2',
    type: 'question',
    typeLabel: 'প্রশ্ন করুন',
    title: 'পুঠিয়া রাজবাড়িতে দর্শনার্থীদের জন্য প্রবেশ টিকিটের মূল্য ও সময়সূচি কেমন?',
    content: 'আমি আগামী শুক্রবার পরিবার নিয়ে পুঠিয়া রাজবাড়ি ও মন্দির চত্বর ঘুরতে যেতে চাই। দর্শনার্থীদের জন্য টিকিটের মূল্য এবং খোলার সময় সম্পর্কে কেউ কি জানাতে পারবেন?',
    authorName: 'তানভীর আহমেদ',
    authorLocation: 'রাজশাহী বিশ্ববিদ্যালয়',
    date: '২০২৬-০৭-২১',
    likes: 12,
    commentsCount: 2,
    commentsList: [
      { id: 'c-3', author: 'প্রীতম দাস', text: 'সকাল ৯টা থেকে বিকেল ৫টা পর্যন্ত খোলা থাকে। প্রবেশ মূল্য খুবই সাধারণ (১০-২০ টাকা)।', date: '২০২৬-০৭-২১' }
    ]
  },
  {
    id: 'post-3',
    type: 'opinion',
    typeLabel: 'মতামত দিন',
    title: 'পুঠিয়া আমের বাজার আধুনিকায়ন ও কোল্ড স্টোরেজ স্থাপন নিয়ে কিছু কথা',
    content: 'আমাদের পুঠিয়ায় উৎপাদিত আম সংরক্ষণের জন্য যদি একটি সরকারি বা বেসরকারি কোল্ড স্টোরেজ বা সংরক্ষণাগার তৈরি করা যায়, তবে কৃষকরা অনেক লাভবান হবেন এবং আমের সঠিক মূল্য পাবেন।',
    authorName: 'কৃষক মো. মোতালেব হোসেন',
    authorLocation: 'বানেশ্বর ইউনিয়ন, পুঠিয়া',
    date: '২০২৬-০৭-২০',
    likes: 35,
    commentsCount: 6,
    commentsList: [
      { id: 'c-4', author: 'শাহিন আলম', text: 'একদম সময়োপযোগী মতামত। এটি অত্যন্ত জরুরি।', date: '২০২৬-০৭-২০' }
    ]
  },
  {
    id: 'post-4',
    type: 'discussion',
    typeLabel: 'স্থানীয় আলোচনা',
    title: 'আসন্ন পুঠিয়া উপজেলা সাহিত্য ও সাংস্কৃতিক উৎসব প্রস্তুতি নিয়ে আলোচনা',
    content: 'আমাদের এলাকার যুবসমাজ ও গুণীজনদের নিয়ে আগামী আগস্ট মাসে একটি স্থানীয় সাহিত্য ও সাংস্কৃতিক উৎসবের আয়োজন করা যেতে পারে। সকলের সহযোগিতা ও অংশগ্রহণ কামনা করছি।',
    authorName: 'নাজমুল হাসান',
    authorLocation: 'পুঠিয়া পৌরসভা',
    date: '২০২৬-০৭-১৯',
    likes: 24,
    commentsCount: 3,
    commentsList: []
  }
];

const TABS = [
  { id: 'all', label: 'সকল পোস্ট', icon: Users },
  { id: 'problem', label: 'সমস্যা জানান', icon: AlertCircle },
  { id: 'question', label: 'প্রশ্ন করুন', icon: HelpCircle },
  { id: 'opinion', label: 'মতামত দিন', icon: MessageSquarePlus },
  { id: 'discussion', label: 'স্থানীয় আলোচনা', icon: MessageCircle },
];

export const CommunityBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem('puthia_community_board');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_POSTS;
  });

  // New Post Form Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postType, setPostType] = useState<'question' | 'opinion' | 'problem' | 'discussion'>('problem');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [authorNameInput, setAuthorNameInput] = useState(user?.displayName || 'স্থানীয় নাগরিক');
  const [authorLocInput, setAuthorLocInput] = useState('পুঠিয়া সদর');

  // Comment input state per post
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  useEffect(() => {
    try {
      localStorage.setItem('puthia_community_board', JSON.stringify(posts));
    } catch (e) {}
  }, [posts]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error('অনুগ্রহ করে শিরোনাম এবং বিস্তারিত বিবরণ লিখুন');
      return;
    }

    const typeLabels: { [key: string]: string } = {
      problem: 'সমস্যা জানান',
      question: 'প্রশ্ন করুন',
      opinion: 'মতামত দিন',
      discussion: 'স্থানীয় আলোচনা'
    };

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      type: postType,
      typeLabel: typeLabels[postType],
      title: postTitle,
      content: postContent,
      authorName: authorNameInput || 'নাগরিক প্রতিনিধি',
      authorLocation: authorLocInput || 'পুঠিয়া, রাজশাহী',
      date: new Date().toISOString().split('T')[0],
      likes: 1,
      commentsCount: 0,
      commentsList: []
    };

    setPosts(prev => [newPost, ...prev]);
    toast.success('আপনার পোস্টটি কমিউনিটি বোর্ডে সফলভাবে প্রকাশিত হয়েছে!');
    setIsCreateModalOpen(false);
    setPostTitle('');
    setPostContent('');
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    toast.success('পোস্টে লাইক দেওয়া হয়েছে');
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) {
      toast.error('অনুগ্রহ করে মন্তব্য লিখুন');
      return;
    }

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newCom = {
          id: `comm-${Date.now()}`,
          author: user?.displayName || 'স্থানীয় বাসিন্দা',
          text: text.trim(),
          date: new Date().toISOString().split('T')[0]
        };
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          commentsList: [...p.commentsList, newCom]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    toast.success('মন্তব্য সফলভাবে যুক্ত হয়েছে');
  };

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === 'all' || post.type === activeTab;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #1e3a8a 100%)' }}
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
                  <Users className="w-3.5 h-3.5 text-amber-300" /> পুঠিয়া নাগরিক ফোরাম
                </span>
              </div>
            </div>

            <div className="relative z-10 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                কমিউনিটি বোর্ড (Community Board)
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
                প্রশ্ন করুন, মতামত দিন, স্থানীয় সমস্যা জানান এবং এলাকার মানুষের সাথে গুরুত্বপূর্ণ আলোচনা করুন।
              </p>
            </div>

            {/* Quick Action Button inside banner */}
            <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/15 relative z-10">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <MessageSquarePlus size={16} strokeWidth={2.5} /> নতুন পোস্ট বা সমস্যা জানান
              </button>
            </div>
          </div>

          <div className="px-4 max-w-4xl mx-auto space-y-5">

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="প্রশ্ন, সমস্যা বা মতামত খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer border ${
                      isActive 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent size={15} className={isActive ? 'text-white' : 'text-blue-600'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-2xs space-y-3">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Users size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">কোনো পোস্ট বা আলোচনা পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-500 mt-1">প্রথম পোস্ট বা সমস্যা জানিয়ে কমিউনিটি বোর্ডে অবদান রাখুন।</p>
                  </div>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  return (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 hover:border-blue-300 transition-all shadow-2xs space-y-4"
                    >
                      {/* Author & Badge header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center">
                            {post.authorName.charAt(0)}
                          </div>
                          <div>
                            <span className="block text-xs font-black text-slate-800">{post.authorName}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin size={11} /> {post.authorLocation} • {post.date}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          post.type === 'problem' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          post.type === 'question' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          post.type === 'opinion' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {post.typeLabel}
                        </span>
                      </div>

                      {/* Post Title & Content */}
                      <div className="space-y-1.5">
                        <h3 className="text-base sm:text-lg font-black text-slate-800 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                          {post.content}
                        </p>
                      </div>

                      {/* Engagement Bar (Likes & Comments count) */}
                      <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                        >
                          <ThumbsUp size={14} /> <span>{post.likes}</span> লাইক
                        </button>
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <MessageCircle size={14} /> <span>{post.commentsCount}</span> মন্তব্য
                        </div>
                      </div>

                      {/* Comments List */}
                      {post.commentsList.length > 0 && (
                        <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 border border-slate-100">
                          <span className="block text-[11px] font-bold text-slate-500 mb-1">সর্বশেষ মন্তব্য:</span>
                          {post.commentsList.map((comm) => (
                            <div key={comm.id} className="text-xs bg-white p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <strong className="text-slate-800 font-bold">{comm.author}</strong>
                                <span className="text-[10px] text-slate-400">{comm.date}</span>
                              </div>
                              <p className="text-slate-600 font-medium">{comm.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input 
                          type="text"
                          placeholder="আপনার মন্তব্য বা মতামত লিখুন..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-none"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <Send size={13} /> মন্তব্য
                        </button>
                      </div>

                    </motion.div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Create New Post / Problem / Opinion Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <MessageSquarePlus size={18} className="text-blue-600" /> নতুন পোস্ট বা সমস্যা জানান
                </h3>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পোস্টের ক্যাটাগরি *</label>
                  <select
                    value={postType}
                    onChange={(e: any) => setPostType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-none"
                  >
                    <option value="problem">সমস্যা জানান (Problem Report)</option>
                    <option value="question">প্রশ্ন করুন (Question)</option>
                    <option value="opinion">মতামত দিন (Opinion / Feedback)</option>
                    <option value="discussion">স্থানীয় আলোচনা (Local Discussion)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">শিরোনাম *</label>
                  <input 
                    type="text"
                    placeholder="আপনার বিষয় বা সমস্যার মূল শিরোনাম লিখুন"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ *</label>
                  <textarea 
                    rows={4}
                    placeholder="আপনার প্রশ্ন, মতামত বা সমস্যা বিস্তারিতভাবে এখানে লিখুন..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">আপনার নাম</label>
                    <input 
                      type="text"
                      value={authorNameInput}
                      onChange={(e) => setAuthorNameInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">এলাকা / ঠিকানা</label>
                    <input 
                      type="text"
                      value={authorLocInput}
                      onChange={(e) => setAuthorLocInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-md cursor-pointer hover:bg-blue-700 transition"
                  >
                    প্রকাশ করুন
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

export default CommunityBoardPage;
