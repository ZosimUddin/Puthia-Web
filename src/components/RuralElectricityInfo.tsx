import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Clock, PlusCircle, Trash2, Loader2, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface ElectricityPost {
  id: string;
  name: string;
  category: 'complaint' | 'officers' | 'lineman' | 'billing';
  contact: string;
  location: string;
  serviceHours: string;
  details: string;
  isUserPost?: boolean;
}

const vidyutData: Record<string, string> = {
    "complaint": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="background: #fef9c3; padding: 10px; border-radius: 50%; font-size: 20px;">🚨</div>
                <div>
                    <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">পুঠিয়া জোনাল অফিস অভিযোগ কেন্দ্র</h4>
                    <span style="color: #ea580c; font-size: 12px; font-weight: 600;">Central Complaint Centre</span>
                </div>
            </div>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                <div>📍 <b>এলাকা:</b> পুঠিয়া পৌরসভা ও সদর ইউনিয়ন।</div>
                <div>⏰ <b>সেবা সময়:</b> 🚨 ২৪ ঘণ্টা খোলা (দিন-রাত যেকোনো সময় অভিযোগ জানানো যাবে)।</div>
                <div>📝 <b>বিবরণ:</b> স্থানীয় লাইনের যেকোনো সমস্যা বা ট্রান্সফরমার বিকল হলে দ্রুত জানান।</div>
            </div>
            <a href="tel:+8801769400000" style="background: #dc2626; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 অভিযোগ কেন্দ্রে কল করুন</a>
        </div>
    `,
    "officers": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="background: #f0fdf4; padding: 10px; border-radius: 50%; font-size: 20px;">🏢</div>
                <div>
                    <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">ডেপুটি জেনারেল ম্যানেজার (DGM)</h4>
                    <span style="color: #16a34a; font-size: 12px; font-weight: 600;">নাটোর পল্লী বিদ্যুৎ সমিতি-২, পুঠিয়া</span>
                </div>
            </div>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                <div>📍 <b>লোকেশন:</b> পুঠিয়া সদর, পুঠিয়া, রাজশাহী।</div>
                <div>⏰ <b>অফিস সময়:</b> সকাল ৯:০০ — বিকেল ৪:০০ (জরুরি লাইন টিম ২৪ ঘণ্টা সচল)</div>
            </div>
            <a href="tel:+8801769404101" style="background: #ea580c; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 ডিজিএম (DGM) কে কল করুন</a>
        </div>
    `,
    "lineman": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="background: #e0f2fe; padding: 10px; border-radius: 50%; font-size: 20px;">🛠️</div>
                <div>
                    <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">মো: রফিকুল ইসলাম (লাইনম্যান)</h4>
                    <span style="color: #0284c7; font-size: 12px; font-weight: 600;">বানেশ্বর ও জিউপাড়া এলাকা</span>
                </div>
            </div>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                <div>📱 <b>মোবাইল:</b> ০১৭৬৯-৪০XXXX</div>
                <div>🔧 <b>দায়িত্ব:</b> স্থানীয় তার ছেঁড়া, খুঁটির সমস্যা ও জরুরি লাইন মেরামত।</div>
            </div>
            <a href="tel:+8801769400001" style="background: #1e293b; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 লাইনম্যানকে কল করুন</a>
        </div>
    `,
    "billing": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="background: #fdf2f8; padding: 10px; border-radius: 50%; font-size: 20px;">📝</div>
                <div>
                    <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">নতুন মিটার সংযোগ ও বিলিং শাখা</h4>
                    <span style="color: #db2777; font-size: 12px; font-weight: 600;">গ্রাহক সেবা ডেস্ক</span>
                </div>
            </div>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                <div>📋 <b>সেবা:</b> নতুন আবাসিক/বাণিজ্যিক মিটার আবেদন, অতিরিক্ত বিল সংশোধন ও মিটার পরিবর্তন।</div>
                <div>🏢 <b>কক্ষ নং:</b> ১০৩ (প্রধান কার্যালয়)।</div>
            </div>
            <a href="tel:+8801769404105" style="background: #e2e8f0; color: #1e293b; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 বিলিং শাখায় যোগাযোগ করুন</a>
        </div>
    `
};

export const RuralElectricityInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'complaint' | 'officers' | 'lineman' | 'billing'>("complaint");
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
  const [dbPosts, setDbPosts] = useState<ElectricityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to electricity_posts in Firestore
  useEffect(() => {
    const q = query(collection(db, 'electricity_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ElectricityPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'complaint',
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
      handleFirestoreError(error, OperationType.LIST, "electricity_posts");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getRenderContent = () => {
    return vidyutData[activeTab] || '<p style="text-align:center; color:#64748b; padding:20px;">কোনো তথ্য পাওয়া যায়নি।</p>';
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
      await addDoc(collection(db, 'electricity_posts'), {
        name: newName.trim(),
        category: activeTab,
        contact: newContact.trim(),
        location: newLocation.trim() || 'পুঠিয়া',
        serviceHours: newServiceHours.trim() || '২৪ ঘণ্টা',
        details: newDetails.trim() || 'কোনো বিবরণ দেওয়া হয়নি।',
        createdAt: serverTimestamp()
      });

      // Reset
      setNewName('');
      setNewContact('');
      setNewLocation('');
      setNewServiceHours('');
      setNewDetails('');
      setShowPostForm(false);
      alert('🎉 তথ্যটি সফলভাবে তালিকাভুক্ত করা হয়েছে!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "electricity_posts");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'electricity_posts', id));
      alert('তথ্যটি সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `electricity_posts/${id}`);
    }
  };

  const currentTabPosts = dbPosts.filter(p => p.category === activeTab);

  return (
    <div className="font-sans space-y-6 pb-6 text-center animate-fade-in" style={{ padding: "0" }}>
      <div id="vidyut-banner" style={{ background: "linear-gradient(135deg, #e11d48, #ea580c)", padding: "24px 20px", borderRadius: "24px", color: "white" }}>
          <div style={{ display: "block", marginBottom: "16px", textAlign: "left" }}>
              {onGoBack && (
                  <button onClick={onGoBack} style={{ background: "rgba(255, 255, 255, 0.2)", border: "none", padding: "6px 14px", borderRadius: "20px", color: "white", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                      ← ফিরে যান
                  </button>
              )}
          </div>
          <span style={{ fontSize: "13px", opacity: 0.9, display: "block", marginBottom: "4px", textAlign: "left" }}>বিদ্যুৎ বিভ্রাট ও জরুরি অভিযোগ</span>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "26px", fontWeight: 800, textAlign: "left" }}>পল্লী বিদ্যুৎ অফিস</h2>
          <div style={{ width: "40px", height: "4px", background: "white", borderRadius: "2px", marginBottom: "14px" }}></div>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9, lineHeight: 1.5, textAlign: "justify" }}>নাটোর পল্লী বিদ্যুৎ সমিতি-২ এর আওতাধীন পুঠিয়া জোনাল অফিস, সাব-স্টেশন এবং এলাকাভিত্তিক লাইনম্যান ও অভিযোগ কেন্দ্রের জরুরি কন্টাক্ট নম্বর।</p>
      </div>

      <div className="flex justify-between items-center px-1">
        <h3 className="font-bold text-gray-800 text-base">সেবা ও পরিচিতি</h3>
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
          <PlusCircle className="w-4 h-4" /> নম্বর যুক্ত করুন
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1">
        {[
          { id: 'complaint', label: 'অভিযোগ কেন্দ্র', emoji: '⚡' },
          { id: 'officers', label: 'কর্মকর্তাবৃন্দ', emoji: '🏢' },
          { id: 'lineman', label: 'লাইনম্যান', emoji: '🛠️' },
          { id: 'billing', label: 'সংযোগ ও বিল', emoji: '📝' }
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

      {/* Add Post Form Overlay Modal */}
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
                ⚡ নতুন পরিচিতি যুক্ত করুন
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                সঠিক নাম, পদবি এবং সক্রিয় মোবাইল নম্বর প্রদান করুন।
              </p>

              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">নাম ও পদবি/বিবরণ *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="উদা: মো: সেলিম রেজা (লাইনম্যান)"
                    value={newName || ""}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">মোবাইল নম্বর *</label>
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
                    placeholder="উদা: বানেশ্বর জোন"
                    value={newLocation || ""}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">সেবা সময়</label>
                  <input 
                    type="text" 
                    placeholder="উদা: ২৪ ঘণ্টা বা অফিস সময়"
                    value={newServiceHours || ""}
                    onChange={(e) => setNewServiceHours(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">অতিরিক্ত বিবরণ</label>
                  <textarea 
                    placeholder="যেকোনো অতিরিক্ত তথ্য এখানে লিখুন..."
                    value={newDetails || ""}
                    onChange={(e) => setNewDetails(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPosting}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> তালিকাভুক্ত করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> নিশ্চিত করুন
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div id="vidyut-list-container" style={{ display: "flex", flexDirection: "column", gap: "16px" }} dangerouslySetInnerHTML={{ __html: getRenderContent() }} />

      {/* User-posted electricity contacts */}
      <div className="space-y-4 mt-4 text-left">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : currentTabPosts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-gray-400 tracking-wider uppercase px-1">গ্রাহকদের দ্বারা শেয়ারকৃত নম্বর</h4>
            {currentTabPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-50 p-2.5 rounded-full text-lg">⚡</div>
                    <div>
                      <h4 className="font-black text-gray-900 text-base">{post.name}</h4>
                      <p className="text-xs text-amber-600 font-bold">পল্লী বিদ্যুৎ সেবা</p>
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
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> <b>এলাকা:</b> {post.location}
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
