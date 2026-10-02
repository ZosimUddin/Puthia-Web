import React, { useState } from "react";
import { ArrowLeft, Search, Phone, MessageSquare, Gift, X, CheckCircle2, Send, PlusCircle, MapPin, Eye, Camera } from "lucide-react";

interface Props { onGoBack: () => void; }

interface ChatMessage {
  sender: "user" | "poster";
  text: string;
  time: string;
}

interface Post {
  id: string;
  type: "lost" | "found";
  title: string;
  details: string;
  location: string;
  time: string;
  contactName: string;
  phone: string;
  imageUrl?: string;
  category?: string;
  messages: ChatMessage[];
}

export const LostAndFound: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"lost" | "found">("lost");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Interactive Modals State
  const [selectedContactPost, setSelectedContactPost] = useState<Post | null>(null);
  const [selectedChatPost, setSelectedChatPost] = useState<Post | null>(null);
  const [selectedDetailPost, setSelectedDetailPost] = useState<Post | null>(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Post Form State
  const [newPostData, setNewPostData] = useState({
    type: "lost" as "lost" | "found",
    title: "",
    details: "",
    location: "",
    contactName: "",
    phone: "",
    category: "wallet"
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Default Mock/Initial Posts State with High-Quality Stock Images
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "lost_1",
      type: "lost",
      title: "জাতীয় পরিচয়পত্র ও মানিব্যাগ",
      details: "একটি কালো চামড়ার ওয়ালেটে জাতীয় পরিচয়পত্র (এনআইডি) এবং বিআরটিএ ড্রাইভিং লাইসেন্স ছিল।",
      location: "বানেশ্বর বাজার সংলগ্ন রোড",
      time: "২ ঘণ্টা আগে",
      contactName: "মো: আরিফুল ইসলাম",
      phone: "০১৭১২-৩৪৫৬৭৮",
      imageUrl: "https://images.unsplash.com/photo-1627124424074-7e28383a54b3?auto=format&fit=crop&w=600&q=80",
      category: "wallet",
      messages: [
        { sender: "poster", text: "আসসালামু আলাইকুম। আমার মানিব্যাগটি খুঁজে পেলে দয়া করে জানান।", time: "২ ঘণ্টা আগে" }
      ]
    },
    {
      id: "lost_2",
      type: "lost",
      title: "কলেজ আইডি কার্ড ও ফাইল",
      details: "পুঠিয়া পিএন সরকারী উচ্চ বিদ্যালয়ের দ্বাদশ শ্রেণীর বিজ্ঞান বিভাগের একটি লাল রঙের ফাইল ও আইডি কার্ড হারিয়েছে।",
      location: "সদর হাসপাতাল মোড়",
      time: "৫ ঘণ্টা আগে",
      contactName: "সাদিয়া আফরিন",
      phone: "০১৭১৩-১১২২৩৩",
      imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80",
      category: "document",
      messages: [
        { sender: "poster", text: "ফাইলটি আমার পরীক্ষার জন্য খুবই জরুরি। কেউ পেয়ে থাকলে যোগাযোগ করবেন প্লিজ।", time: "৫ ঘণ্টা আগে" }
      ]
    },
    {
      id: "found_1",
      type: "found",
      title: "একটি চাবির তোড়া পাওয়া গেছে",
      details: "পুঠিয়া রাজবাড়ি মন্দিরের সামনে একটি রিং-এ লাগানো ৪টি চাবির তোড়া পাওয়া গেছে। উপযুক্ত প্রমাণ দিয়ে নিয়ে যান।",
      location: "পুঠিয়া রাজবাড়ি মন্দির চত্বর",
      time: "১ দিন আগে",
      contactName: "মো: হাসিবুর রহমান",
      phone: "০১৭১৪-৪৪৫৫৬৬",
      imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80",
      category: "keys",
      messages: [
        { sender: "poster", text: "চাবিটি হারিয়ে থাকলে সঠিক পরিচয় দিয়ে দয়া করে সংগ্রহ করুন।", time: "১ দিন আগে" }
      ]
    },
    {
      id: "found_2",
      type: "found",
      title: "কালো রঙের চশমা ও বক্স",
      details: "পাবলিক লাইব্রেরীর রিডিং রুমে একটি কালো ফ্রেমের প্রেসক্রিপশন চশমা বক্সসহ পাওয়া গেছে।",
      location: "পুঠিয়া উপজেলা পাবলিক লাইব্রেরী",
      time: "২ দিন আগে",
      contactName: "লাইব্রেরী ইনচার্জ",
      phone: "০১৭১৫-৭৭৮৮৯৯",
      imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80",
      category: "glasses",
      messages: [
        { sender: "poster", text: "অফিস চলাকালীন সময়ে এসে চশমাটি নিয়ে যেতে পারেন।", time: "২ দিন আগে" }
      ]
    }
  ]);

  // Preset Unsplash images matching selected categories
  const categoryImages: Record<string, string> = {
    wallet: "https://images.unsplash.com/photo-1627124424074-7e28383a54b3?auto=format&fit=crop&w=600&q=80",
    document: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80",
    keys: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80",
    glasses: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80",
    phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    bag: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    other: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80"
  };

  const handleSendMessage = (postId: string) => {
    if (!typedMessage.trim()) return;
    
    // Find the post and append message
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const updatedMessages = [
            ...post.messages,
            { sender: "user" as const, text: typedMessage, time: "এখন" }
          ];
          
          // Simulate simple auto-response from the poster
          setTimeout(() => {
            setPosts(latestPosts =>
              latestPosts.map(latestPost => {
                if (latestPost.id === postId) {
                  return {
                    ...latestPost,
                    messages: [
                      ...latestPost.messages,
                      {
                        sender: "poster" as const,
                        text: "অনেক ধন্যবাদ মেসেজ দেওয়ার জন্য! আমি আপনার বার্তাটি পেয়েছি, খুব শীঘ্রই মোবাইল নাম্বারে কথা বলছি।",
                        time: "এখন"
                      }
                    ]
                  };
                }
                return latestPost;
              })
            );
          }, 1500);

          return { ...post, messages: updatedMessages };
        }
        return post;
      })
    );

    // Temporarily update current modal viewing messages
    if (selectedChatPost && selectedChatPost.id === postId) {
      setSelectedChatPost(prev => prev ? {
        ...prev,
        messages: [
          ...prev.messages,
          { sender: "user", text: typedMessage, time: "এখন" }
        ]
      } : null);
    }

    setTypedMessage("");
  };

  const handleAddPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostData.title || !newPostData.location || !newPostData.contactName || !newPostData.phone) return;

    const chosenImage = categoryImages[newPostData.category] || categoryImages.other;

    const newPost: Post = {
      id: `custom_${Date.now()}`,
      type: newPostData.type,
      title: newPostData.title,
      details: newPostData.details || "কোনো অতিরিক্ত বিবরণ দেওয়া হয়নি।",
      location: newPostData.location,
      time: "সদ্য পোস্ট করা",
      contactName: newPostData.contactName,
      phone: newPostData.phone,
      imageUrl: chosenImage,
      category: newPostData.category,
      messages: [
        { sender: "poster", text: `আসসালামু আলাইকুম। আমি এই পোস্টটি তৈরি করেছি।`, time: "সদ্য" }
      ]
    };

    setPosts([newPost, ...posts]);
    setShowAddModal(false);
    setNewPostData({
      type: "lost",
      title: "",
      details: "",
      location: "",
      contactName: "",
      phone: "",
      category: "wallet"
    });

    // Show custom toast message
    setToastMessage("আপনার বিজ্ঞপ্তিটি সফলভাবে পোস্ট করা হয়েছে!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredPosts = posts
    .filter(post => post.type === filter)
    .filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6 font-sans pb-10 relative">
      {/* Dynamic Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs py-3 px-6 rounded-2xl shadow-xl z-[9999] flex items-center gap-2 animate-fade-in border border-emerald-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {toastMessage}
        </div>
      )}

      {/* Header Visual Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #2D1B4E, #1F1137)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-emerald-600 text-sm font-medium mb-2 uppercase tracking-wide">পারস্পরিক সহযোগিতা</p>
          <h1 className="text-4xl font-black mb-1 text-white">হারানো ও পাওয়া হাব</h1>
          <div className="w-10 h-1 bg-white rounded-full my-3"></div>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
            আপনার কোনো মূল্যবান জিনিস হারিয়ে গেলে বা কোথাও খুঁজে পেলে এখানে পোস্ট করে পুঠিয়াবাসীকে জানান।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Search Bar & Add Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আইটেম বা এলাকা দিয়ে খুঁজুন..." 
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl py-3 pl-9 pr-4 text-xs focus:outline-none focus:border-[#2D1B4E] focus:ring-1 focus:ring-[#2D1B4E] transition-all"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 bg-[#FFC107] hover:bg-yellow-500 text-[#2D1B4E] rounded-xl flex items-center gap-1.5 text-xs font-black transition-colors shadow-md shadow-yellow-500/10 shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> নতুন পোস্ট
          </button>
        </div>

        {/* Filters Tabs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("lost")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "lost"
                ? "bg-[#2D1B4E] text-emerald-600 shadow-md border border-emerald-500/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Search className={`w-4 h-4 ${filter === "lost" ? 'text-emerald-600' : 'text-gray-400'}`}/>
            হারানো বিজ্ঞপ্তি
          </button>
          <button
            onClick={() => setFilter("found")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "found"
                ? "bg-[#2D1B4E] text-emerald-600 shadow-md border border-emerald-500/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Gift className={`w-4 h-4 ${filter === "found" ? 'text-emerald-600' : 'text-gray-400'}`}/>
            খুঁজে পাওয়া জিনিস
          </button>
        </div>

        {/* Listings Directory */}
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isLost = post.type === "lost";
            return (
              <div 
                key={post.id} 
                className="bg-white rounded-2xl p-5 shadow-lg border border-purple-50 flex flex-col gap-3 relative overflow-hidden animate-fade-in group hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  {isLost ? (
                    <span className="px-2.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-black rounded-full border border-red-100 uppercase tracking-wider">হারানো গেছে</span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-wider">খুঁজে পাওয়া গেছে</span>
                  )}
                  <span className="text-[10px] text-gray-400 font-bold ml-auto">{post.time}</span>
                </div>

                {/* Left Aligned Content with Thumbnail if Image is Present */}
                <div className="flex gap-4 items-start">
                  {post.imageUrl && (
                    <div 
                      onClick={() => setSelectedDetailPost(post)}
                      className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-purple-100 cursor-pointer relative group-hover:border-purple-300 transition-colors"
                    >
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 
                      onClick={() => setSelectedDetailPost(post)}
                      className="text-base font-black text-[#2D1B4E] leading-tight cursor-pointer hover:text-purple-700 transition-colors inline-block hover:underline"
                    >
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-1">
                      {post.details}
                    </p>
                    <p className="text-[11px] text-gray-500 font-bold mt-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 inline" /> {post.location}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full mt-1 border-t border-gray-100 pt-3">
                  <button 
                    onClick={() => setSelectedContactPost(post)}
                    className="py-2.5 text-xs font-black text-[#1F1137] bg-[#FFC107] hover:bg-yellow-400 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 outline-none"
                  >
                    <Phone className="w-3.5 h-3.5" /> কন্টাক্ট করুন
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedChatPost(post);
                      // Pull latest state version of messages
                      const currentPost = posts.find(p => p.id === post.id);
                      if (currentPost) setSelectedChatPost(currentPost);
                    }}
                    className="py-2.5 text-xs font-black text-[#2D1B4E] bg-purple-50 hover:bg-purple-100 rounded-xl transition-all border border-purple-100 flex items-center justify-center gap-1.5 outline-none"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> চ্যাট মেসেজ
                  </button>
                </div>
              </div>
            );
          })}

          {filteredPosts.length === 0 && (
            <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-md">
              <Gift className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-400">কোনো বিজ্ঞপ্তি বা বিজ্ঞাপন খুঁজে পাওয়া যায়নি।</p>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail View Modal (Opens when clicking on Title or Image) */}
      {selectedDetailPost && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            {/* Header / Image Area */}
            <div className="relative h-48 bg-slate-900 overflow-hidden">
              <button 
                onClick={() => setSelectedDetailPost(null)}
                className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 p-2 rounded-full transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>
              {selectedDetailPost.imageUrl ? (
                <img 
                  src={selectedDetailPost.imageUrl} 
                  alt={selectedDetailPost.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-4">
                  <Camera className="w-10 h-10 text-gray-500 mb-2" />
                  <p className="text-xs font-bold text-gray-400">কোনো ছবি সংযুক্ত নেই</p>
                </div>
              )}
              {/* Type overlay */}
              <div className="absolute bottom-4 left-4">
                {selectedDetailPost.type === "lost" ? (
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-black rounded-xl shadow-lg border border-red-500 uppercase tracking-wider">হারানো গেছে</span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-lg border border-emerald-500 uppercase tracking-wider">খুঁজে পাওয়া গেছে</span>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-1">⏱️ পোস্ট করা হয়েছে: {selectedDetailPost.time}</span>
                <h3 className="text-lg font-black text-[#2D1B4E] leading-tight">{selectedDetailPost.title}</h3>
              </div>

              <div className="space-y-2 text-xs text-gray-700 leading-relaxed font-medium bg-purple-50/50 p-4 rounded-2xl border border-purple-100/30">
                <p>
                  <strong className="text-[#2D1B4E]">বিস্তারিত বিবরণ:</strong> <br />
                  {selectedDetailPost.details}
                </p>
                <p className="pt-2 border-t border-purple-100 flex items-center gap-1.5 font-bold">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <span>স্থান: {selectedDetailPost.location}</span>
                </p>
              </div>

              {/* Contact Info Row */}
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">পোস্ট করেছেন:</span>
                  <span className="text-xs font-bold text-gray-800">{selectedDetailPost.contactName}</span>
                </div>
                <span className="text-[10px] px-2.5 py-1 bg-purple-100 text-[#2D1B4E] font-extrabold rounded-lg">ভেরিফাইড ইউজার</span>
              </div>

              {/* Quick Actions inside detail view */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  onClick={() => {
                    setSelectedDetailPost(null);
                    setSelectedContactPost(selectedDetailPost);
                  }}
                  className="py-3 text-xs font-black text-[#1F1137] bg-[#FFC107] hover:bg-yellow-400 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 outline-none"
                >
                  <Phone className="w-3.5 h-3.5" /> কন্টাক্ট করুন
                </button>
                <button 
                  onClick={() => {
                    setSelectedDetailPost(null);
                    setSelectedChatPost(selectedDetailPost);
                  }}
                  className="py-3 text-xs font-black text-white bg-[#2D1B4E] hover:bg-purple-900 rounded-xl transition-all flex items-center justify-center gap-1.5 outline-none"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> চ্যাট মেসেজ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Poster Modal */}
      {selectedContactPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-purple-900 to-slate-950 text-white">
              <button 
                onClick={() => setSelectedContactPost(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">যোগাযোগের ঠিকানা</span>
              </div>
              <h3 className="text-sm font-black pr-8">{selectedContactPost.title}</h3>
            </div>

            <div className="p-6 space-y-4 text-center">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100/50">
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block mb-1">বিজ্ঞপ্তি দাতা</span>
                <span className="text-base font-black text-gray-800 block">{selectedContactPost.contactName}</span>
              </div>

              <p className="text-xs text-gray-500 font-bold">
                আইটেমটি সম্পর্কে সঠিক তথ্য জানাতে সরাসরি বিজ্ঞপ্তিদাতার মোবাইল নাম্বারে কল করুন।
              </p>

              <div className="flex flex-col gap-2">
                <a 
                  href={`tel:${selectedContactPost.phone}`}
                  className="w-full py-3 bg-[#FFC107] text-[#2D1B4E] text-xs font-black rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-md shadow-yellow-500/10"
                >
                  📞 কল করুন: {selectedContactPost.phone}
                </a>
                <button
                  onClick={() => setSelectedContactPost(null)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Chat Dialog Modal */}
      {selectedChatPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col h-[480px] animate-scale-up">
            {/* Header */}
            <div className="relative p-5 pb-3.5 bg-gradient-to-r from-purple-900 to-slate-900 text-white shrink-0">
              <button 
                onClick={() => setSelectedChatPost(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">লাইভ চ্যাট</span>
              </div>
              <h3 className="text-sm font-black pr-8 text-white truncate">{selectedChatPost.contactName}</h3>
              <p className="text-[10px] text-gray-300 font-medium truncate mt-0.5">আইটেম: {selectedChatPost.title}</p>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/50">
              {posts.find(p => p.id === selectedChatPost.id)?.messages.map((msg, index) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={index} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div className={`p-3 max-w-[85%] text-xs font-bold shadow-sm rounded-2xl ${
                      isUser 
                        ? "bg-[#2D1B4E] text-emerald-600 rounded-tr-none" 
                        : "bg-white text-gray-800 border border-purple-50 rounded-tl-none"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-gray-400 font-semibold mt-1 px-1">{msg.time}</span>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0 flex gap-2">
              <input 
                type="text" 
                value={typedMessage || ""}
                onChange={(e) => setTypedMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage(selectedChatPost.id);
                }}
                placeholder="মেসেজ লিখুন..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 text-xs font-semibold focus:outline-none focus:border-[#2D1B4E]"
              />
              <button 
                onClick={() => handleSendMessage(selectedChatPost.id)}
                className="p-2.5 bg-[#2D1B4E] hover:bg-purple-900 text-emerald-600 rounded-xl transition flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Post Creator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-purple-950 to-slate-900 text-white">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">অনলাইন পোস্ট</span>
              </div>
              <h3 className="text-base font-black">বিজ্ঞপ্তি যোগ করুন</h3>
            </div>

            <form onSubmit={handleAddPostSubmit} className="p-5 space-y-3.5 max-h-[380px] overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">বিজ্ঞপ্তির প্রকার</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setNewPostData({ ...newPostData, type: "lost" })}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      newPostData.type === "lost" 
                        ? "bg-[#2D1B4E] text-emerald-600" 
                        : "text-gray-500"
                    }`}
                  >
                    হারানো গেছে
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPostData({ ...newPostData, type: "found" })}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      newPostData.type === "found" 
                        ? "bg-[#2D1B4E] text-emerald-600" 
                        : "text-gray-500"
                    }`}
                  >
                    খুঁজে পাওয়া গেছে
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">আইটেম ক্যাটাগরি (ছবির জন্য)</label>
                <select
                  value={newPostData.category || ""}
                  onChange={(e) => setNewPostData({ ...newPostData, category: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#2D1B4E]"
                >
                  <option value="wallet">মানিব্যাগ / আইডি কার্ড</option>
                  <option value="document">গুরুত্বপূর্ণ ফাইল / বই</option>
                  <option value="keys">চাবির তোড়া / মেটাল</option>
                  <option value="glasses">চশমা / গ্লাস আইটেম</option>
                  <option value="phone">স্মার্টফোন / গ্যাজেট</option>
                  <option value="bag">ব্যাগ / লাগেজ</option>
                  <option value="other">অন্যান্য জিনিসপত্র</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">শিরোনাম</label>
                <input 
                  type="text" 
                  required
                  placeholder="যেমন: একটি চাবির তোড়া হারিয়েছে"
                  value={newPostData.title || ""}
                  onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#2D1B4E]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">বিস্তারিত বিবরণ</label>
                <textarea 
                  required
                  placeholder="বিজ্ঞপ্তির বিবরণ দিন (রং, কোম্পানি, আকার ইত্যাদি)"
                  value={newPostData.details || ""}
                  onChange={(e) => setNewPostData({ ...newPostData, details: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#2D1B4E] h-16 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">এলাকা/ভেন্যু</label>
                <input 
                  type="text" 
                  required
                  placeholder="যেমন: পুঠিয়া বাসস্ট্যান্ড রোড"
                  value={newPostData.location || ""}
                  onChange={(e) => setNewPostData({ ...newPostData, location: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#2D1B4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">আপনার নাম</label>
                  <input 
                    type="text" 
                    required
                    placeholder="যেমন: মো: রানা"
                    value={newPostData.contactName || ""}
                    onChange={(e) => setNewPostData({ ...newPostData, contactName: e.target.value })}
                    className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#2D1B4E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">মোবাইল নম্বর</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="যেমন: ০১৭১১-২২৩৩৪৪"
                    value={newPostData.phone || ""}
                    onChange={(e) => setNewPostData({ ...newPostData, phone: e.target.value })}
                    className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#2D1B4E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#2D1B4E] text-emerald-600 text-xs font-black rounded-xl transition shadow-md shadow-[#2D1B4E]/10"
              >
                বিজ্ঞপ্তি পোস্ট করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
