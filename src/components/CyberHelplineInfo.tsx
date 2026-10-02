import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Clock, PlusCircle, Trash2, Loader2, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface CyberPost {
  id: string;
  name: string;
  category: 'help' | 'facebook' | 'legal' | 'safety';
  contact: string;
  location: string;
  serviceHours: string;
  details: string;
  isUserPost?: boolean;
}

const govtCyberCard = `
    <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 12px; text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="background: #f1f5f9; padding: 10px; border-radius: 50%; font-size: 20px;">🏛️</div>
            <div>
                <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">পুলিশ সাইবার সাপোর্ট ফর উইমেন (PCSW)</h4>
                <span style="color: #dc2626; font-size: 12px; font-weight: 600; display: block; margin-top: 2px;">নারী ও শিশুদের বিশেষ সাইবার উইং</span>
            </div>
        </div>
        <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            <div>🚨 <b>সেবা সময়:</b> ২৪ ঘণ্টা খোলা (সম্পূর্ণ গোপনীয়তা রক্ষা করা হয়)।</div>
            <div>📝 <b>বিবরণ:</b> ফেসবুক ফেক আইডি, হ্যাকিং বা ব্ল্যাকমেইলিংয়ের শিকার নারীরা সরাসরি মেসেজ বা কল করে আইনি ও টেকনিক্যাল সাপোর্ট নিতে পারেন।</div>
        </div>
        <a href="tel:+8801320000888" style="background: #dc2626; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 PCSW হেল্পলাইনে কল করুন</a>
    </div>

    <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="background: #e0f2fe; padding: 10px; border-radius: 50%; font-size: 20px;">🚨</div>
            <div>
                <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">বিটিআরসি সাইবার ক্রাইম হেল্পডেস্ক</h4>
                <span style="color: #0284c7; font-size: 12px; font-weight: 600; display: block; margin-top: 2px;">BTRC Cyber Security Wing</span>
            </div>
        </div>
        <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            <div>📌 <b>কাজ:</b> আপত্তিকর লিংক বা ফেক ওয়েবসাইট/ইউটিউব ভিডিও ব্লক করার আইনি টিম।</div>
        </div>
        <a href="tel:100" style="background: #1e293b; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 BTRC শর্টকোড ১০০-এ কল দিন</a>
    </div>
`;

const cyberData: Record<string, string> = {
    "help": govtCyberCard,
    "facebook": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 800;">🌐 আইডি হ্যাক হলে তাৎক্ষণিক করণীয়</h4>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 8px; line-height: 1.5;">
                <div>১. দ্রুত আপনার ইমেইল চেক করুন এবং ফেসবুক থেকে আসা Security Link ব্যবহার করে পাসওয়ার্ড চেঞ্জ করুন।</div>
                <div>২. <b>facebook.com/hacked</b> লিংকে গিয়ে অফিসিয়ালি রিকভারি চেষ্টা করুন।</div>
                <div>৩. আপনার পরিচিতদের দ্রুত পোস্ট বা মেসেজ দিয়ে জানান যে আপনার আইডি থেকে টাকা চাইলে যেন না দেয়।</div>
                <div style="margin-top: 10px; font-weight: bold; color: #ea580c;">💡 কারিগরি সাপোর্টের জন্য স্থানীয় বিশ্বস্ত ডেভেলপারের সাহায্য নিতে পারেন।</div>
            </div>
        </div>
    `,
    "legal": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 800;">⚖️ জিডি ও আইনি পদক্ষেপের নিয়ম</h4>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 8px; line-height: 1.5;">
                <div>• সাইবার অপরাধের শিকার হলে সমস্ত চ্যাট স্ক্রিনশট, প্রোফাইল লিংক এবং অডিও/ভিডিওর প্রমাণ পেনড্রাইভে সেভ রাখুন।</div>
                <div>• প্রমাণসহ সরাসরি <b>পুঠিয়া থানায়</b> গিয়ে একটি লিখিত সাধারণ ডায়েরি (GD) করুন।</div>
                <div>• প্রয়োজনে সিআইডি (CID) সাইবার পুলিশ সেন্টারে সরাসরি অভিযোগ ইমেইল করতে পারেন।</div>
            </div>
        </div>
    `,
    "safety": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 800;">🔒 অনলাইন অ্যাকাউন্ট নিরাপদ রাখার টিপস</h4>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 8px; line-height: 1.5;">
                <div>• আপনার ফেসবুক, ইমেইল এবং গুরুত্বপূর্ণ আইডিতে অবশ্যই <b>Two-Factor Authentication (2FA)</b> চালু রাখুন।</div>
                <div>• মেসেঞ্জারে বা ইমেইলে আসা যেকোনো অপরিচিত বা লোভনীয় লিংকে (যেমন: ফ্রি অফার, লটারি) ভুলেও ক্লিক করবেন না।</div>
                <div>• পাসওয়ার্ড হিসেবে নিজের নাম বা মোবাইল নম্বর ব্যবহার না করে স্ট্রং পাসওয়ার্ড (যেমন: P@ss#2026) ব্যবহার করুন।</div>
            </div>
        </div>
    `
};

export const CyberHelplineInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'help' | 'facebook' | 'legal' | 'safety'>("help");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Form states
  const [showPostForm, setShowPostForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newServiceHours, setNewServiceHours] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // DB state
  const [dbPosts, setDbPosts] = useState<CyberPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to cyber_posts in Firestore
  useEffect(() => {
    const q = query(collection(db, 'cyber_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: CyberPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'help',
          contact: data.contact || '',
          location: data.location || '',
          serviceHours: data.serviceHours || '',
          details: data.details || '',
          isUserPost: true
        });
      });
      setDbPosts(list);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "cyber_posts");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getRenderContent = () => {
    return cyberData[activeTab] || '<p style="text-align:center; color:#64748b; padding:20px;">কোনো তথ্য পাওয়া যায়নি।</p>';
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!newName || !newContact) {
      alert('দয়া করে প্রয়োজনীয় সব তথ্য পূরণ করুন।');
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, 'cyber_posts'), {
        name: newName.trim(),
        category: activeTab,
        contact: newContact.trim(),
        location: newLocation.trim() || 'অনলাইন / সাইবার সাপোর্ট',
        serviceHours: newServiceHours.trim() || '২৪ ঘণ্টা খোলা',
        details: newDetails.trim() || 'সাইবার ক্রাইম সাপোর্ট ও পরামর্শ',
        createdAt: serverTimestamp()
      });

      // Reset
      setNewName('');
      setNewContact('');
      setNewLocation('');
      setNewServiceHours('');
      setNewDetails('');
      setShowPostForm(false);
      alert('🎉 সাইবার সাপোর্ট নম্বরটি সফলভাবে তালিকাভুক্ত করা হয়েছে!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "cyber_posts");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'cyber_posts', id));
      alert('তথ্যটি সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `cyber_posts/${id}`);
    }
  };

  const currentTabPosts = dbPosts.filter(p => p.category === activeTab);

  return (
    <div className="font-sans pb-6 text-center animate-fade-in" style={{ padding: "0" }}>
      <div id="cyber-banner" style={{ background: "linear-gradient(135deg, #e11d48, #ea580c)", padding: "24px 20px", borderRadius: "24px", color: "white" }}>
          <div style={{ display: "block", marginBottom: "16px", textAlign: "left" }}>
              {onGoBack && (
                  <button onClick={onGoBack} style={{ background: "rgba(255, 255, 255, 0.2)", border: "none", padding: "6px 14px", borderRadius: "20px", color: "white", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                      ← ফিরে যান
                  </button>
              )}
          </div>
          <span style={{ fontSize: "13px", opacity: 0.9, display: "block", marginBottom: "4px", textAlign: "left" }}>সাইবার নিরাপত্তা ও অনলাইন সহায়তা</span>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "26px", fontWeight: 800, textAlign: "left" }}>সাইবার হেল্পলাইন</h2>
          <div style={{ width: "40px", height: "4px", background: "white", borderRadius: "2px", marginBottom: "14px", textAlign: "left" }}></div>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9, lineHeight: 1.5, textAlign: "justify" }}>ফেসবুক বা ইমেইল হ্যাক, অনলাইন প্রতারণা, ব্ল্যাকমেইল বা যেকোনো সাইবার অপরাধের শিকার হলে তাৎক্ষণিক আইনি ও কারিগরি সহায়তা কেন্দ্র।</p>
      </div>

      <div className="flex justify-between items-center px-1 my-4">
        <h3 className="font-bold text-gray-800 text-base">সাইবার সহায়তা টিম</h3>
        <button
          onClick={() => {
            if (!user) {
              setIsAuthModalOpen(true);
            } else {
              setShowPostForm(true);
            }
          }}
          className="flex items-center gap-1 bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-amber-600 transition shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> কন্টাক্ট যুক্ত করুন
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1">
        {[
          { id: 'help', label: 'ক্রাইম হেল্প', emoji: '🛡️' },
          { id: 'facebook', label: 'ফেবুক হ্যাক', emoji: '🌐' },
          { id: 'legal', label: 'আইনি পরামর্শ', emoji: '⚖️' },
          { id: 'safety', label: 'নিরাপদ থাকার উপায়', emoji: '🔒' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive
                  ? "bg-[#eab308] text-white border-[#eab308] shadow-md"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="font-extrabold text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Add Cyber Contact Form Overlay Modal */}
      <AnimatePresence>
        {showPostForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setShowPostForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-black text-gray-900 mb-1 flex items-center gap-2">
                🌐 নতুন সাইবার কন্টাক্ট যুক্ত করুন
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                কোনো সাইবার বিশেষজ্ঞ, আইনি সাহায্যকারী বা টেকনিক্যাল সাপোর্ট সেন্টারের কন্টাক্ট দিন।
              </p>

              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">নাম/সংস্থার বিবরণ *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="উদা: সাইবার এক্সপার্ট রাহাত হোসেন (টেক সাপোর্ট)"
                    value={newName || ""}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">মোবাইল নম্বর/হটলাইন *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="উদা: 017xxxxxxxx"
                    value={newContact || ""}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">এলাকা/লোকেশন</label>
                  <input 
                    type="text" 
                    placeholder="উদা: পুঠিয়া ও অনলাইন"
                    value={newLocation || ""}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">সেবা সময়</label>
                  <input 
                    type="text" 
                    placeholder="উদা: সকাল ১০:০০ - রাত ১০:০০"
                    value={newServiceHours || ""}
                    onChange={(e) => setNewServiceHours(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">সহায়তার বিবরণ</label>
                  <textarea 
                    placeholder="উদা: ফেসবুক হ্যাক বা রিকভারি সাপোর্ট, ২-ফ্যাক্টর নিরাপত্তা সেটআপ..."
                    value={newDetails || ""}
                    onChange={(e) => setNewDetails(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPosting}
                  className="w-full bg-[#ea580c] hover:bg-[#d97706] text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> সংরক্ষণ করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> কন্টাক্ট যুক্ত করুন
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div id="cyber-list-container" className="space-y-4" style={{ display: "flex", flexDirection: "column", gap: "16px" }} dangerouslySetInnerHTML={{ __html: getRenderContent() }} />

      {/* User-posted cyber contacts */}
      <div className="space-y-4 mt-4 text-left">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : currentTabPosts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-gray-400 tracking-wider uppercase px-1">গ্রাহকদের দ্বারা শেয়ারকৃত সাইবার কন্টাক্ট তালিকা</h4>
            {currentTabPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 p-2.5 rounded-full text-lg">🌐</div>
                    <div>
                      <h4 className="font-black text-gray-900 text-base">{post.name}</h4>
                      <p className="text-xs text-orange-600 font-bold">অনলাইন ও সাইবার হেল্প</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="text-gray-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> <b>সেবা জোন:</b> {post.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" /> <b>সেবা সময়:</b> {post.serviceHours}
                  </div>
                  {post.details && (
                    <p className="text-xs text-gray-500 border-l-2 border-gray-100 pl-2 py-0.5 mt-1">
                      {post.details}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <a 
                    href={`tel:${post.contact}`}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <Phone className="w-3.5 h-3.5" /> কল করুন ({post.contact})
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};
