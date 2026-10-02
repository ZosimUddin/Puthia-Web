import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, PlusCircle, Trash2, Loader2, X, Send, Hotel } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { UnifiedHeroHeader } from './common/UnifiedDesignSystem';

interface HotelPost {
  id: string;
  name: string;
  category: 'residential' | 'resort';
  contact: string;
  location: string;
  amenities: string;
  isUserPost?: boolean;
}

const hotelData: Record<string, string> = {
    "residential": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="background: #f5f3ff; padding: 10px; border-radius: 50%; font-size: 20px;">🏨</div>
                <div>
                    <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">হোটেল রাজপ্রাসাদ আবাসিক</h4>
                    <span style="color: #6d28d9; font-size: 12px; font-weight: 600;">AC / Non-AC রুম</span>
                </div>
            </div>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                <div>📍 <b>অবস্থান:</b> পুঠিয়া মেইন বাজার মোড়, থানা রোড।</div>
                <div>🔒 <b>সুবিধা:</b> ২৪ ঘণ্টা সিসিটিভি নিরাপত্তা, ফ্রি ওয়াইফাই ও জেনারেটর ব্যাকআপ।</div>
            </div>
            <a href="tel:+8801700000005" style="background: #6d28d9; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 অগ্রিম রুম বুকিং করুন</a>
        </div>
    `,
    "resort": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="background: #ecfdf5; padding: 10px; border-radius: 50%; font-size: 20px;">🏡</div>
                <div>
                    <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">উপজেলা পরিষদ ডাকবাংলো</h4>
                    <span style="color: #16a34a; font-size: 12px;">সরকারি রেস্টহাউজ</span>
                </div>
            </div>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                <div>📍 <b>অবস্থান:</b> উপজেলা পরিষদ চত্বর, পুঠিয়া।</div>
                <div>📝 <b>অনুমতি:</b> সরকারি কর্মকর্তা ও অনুমতি সাপেক্ষে সাধারণ দর্শনার্থীদের জন্য।</div>
            </div>
            <a href="tel:+8801700000006" style="background: #e2e8f0; color: #1e293b; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 10px; border-radius: 12px; font-size: 13px; font-weight: bold;">📞 বুকিংয়ের জন্য যোগাযোগ</a>
        </div>
    `
};

export const LocalHotelInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'residential' | 'resort'>("residential");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Form states
  const [showPostForm, setShowPostForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newAmenities, setNewAmenities] = useState('');
  const [newCategory, setNewCategory] = useState<'residential' | 'resort'>('residential');
  const [isPosting, setIsPosting] = useState(false);

  // Firestore state
  const [dbPosts, setDbPosts] = useState<HotelPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load hotel posts from Firestore
  useEffect(() => {
    const q = query(collection(db, "hotel_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: HotelPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || "",
          category: data.category || "residential",
          contact: data.contact || "",
          location: data.location || "",
          amenities: data.amenities || "",
          isUserPost: true
        });
      });
      setDbPosts(list);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "hotel_posts");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getRenderContent = () => {
    if (activeTab === 'all') {
      return hotelData.residential + hotelData.resort;
    } else {
      return hotelData[activeTab] || '<p style="text-align:center; color:#64748b; padding:20px;">কোনো তথ্য পাওয়া যায়নি।</p>';
    }
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
      await addDoc(collection(db, 'hotel_posts'), {
        name: newName.trim(),
        category: newCategory,
        contact: newContact.trim(),
        location: newLocation.trim() || 'পুঠিয়া এলাকা',
        amenities: newAmenities.trim() || 'নিরাপদ গেস্টহাউজ আবাসন',
        createdAt: serverTimestamp()
      });

      // Reset
      setNewName('');
      setNewContact('');
      setNewLocation('');
      setNewAmenities('');
      setShowPostForm(false);
      alert('🎉 হোটেল/ডাকবাংলো আবাসন তথ্যটি সফলভাবে যোগ করা হয়েছে!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "hotel_posts");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'hotel_posts', id));
      alert('তথ্যটি সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `hotel_posts/${id}`);
    }
  };

  const currentTabPosts = dbPosts.filter(p => {
    if (activeTab === 'all') return true;
    return p.category === activeTab;
  });

  return (
    <div className="font-sans pb-6 text-left animate-fade-in space-y-6">
      <UnifiedHeroHeader
        badgeText="পুঠিয়ায় নিরাপদ আবাসন"
        title="আবাসিক হোটেল ও গেস্টহাউজ"
        subtitle="পুঠিয়া উপজেলা ও রাজশাহী জেলা সদরের নিরাপদ আবাসিক হোটেল, ডাকবাংলো এবং গেস্টহাউজের বুকিং নম্বর ও অবস্থান।"
        icon={<Hotel size={20} />}
        showBack={!!onGoBack}
        onBack={onGoBack}
        rightAction={
          <button 
            onClick={() => {
              if (!user) {
                setIsAuthModalOpen(true);
              } else {
                setShowPostForm(true);
              }
            }}
            className="w-10 h-10 rounded-full bg-white text-purple-950 hover:bg-purple-50 flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm"
            title="আবাসন যুক্ত করুন"
          >
            <PlusCircle size={18} />
          </button>
        }
      />

      <div className="flex justify-between items-center px-1 my-4">
        <h3 className="font-bold text-gray-800 text-base">আবাসন তালিকা</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "20px", marginBottom: "20px" }}>
          <div onClick={() => setActiveTab('all')} className="hotel-tab-btn" style={{ background: activeTab === 'all' ? "#6d28d9" : "#ffffff", color: activeTab === 'all' ? "white" : "#1e293b", padding: "12px 6px", borderRadius: "14px", textAlign: "center", cursor: "pointer", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", transition: "0.2s" }}>
              <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>🏠</span>
              <b style={{ fontSize: "11px", display: "block" }}>সব আবাসন</b>
          </div>
          
          <div onClick={() => setActiveTab('residential')} className="hotel-tab-btn" style={{ background: activeTab === 'residential' ? "#6d28d9" : "#ffffff", color: activeTab === 'residential' ? "white" : "#1e293b", padding: "12px 6px", borderRadius: "14px", textAlign: "center", cursor: "pointer", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", transition: "0.2s" }}>
              <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>🏨</span>
              <b style={{ fontSize: "11px", display: "block" }}>আবাসিক হোটেল</b>
          </div>
          
          <div onClick={() => setActiveTab('resort')} className="hotel-tab-btn" style={{ background: activeTab === 'resort' ? "#6d28d9" : "#ffffff", color: activeTab === 'resort' ? "white" : "#1e293b", padding: "12px 6px", borderRadius: "14px", textAlign: "center", cursor: "pointer", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", transition: "0.2s" }}>
              <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>🏡</span>
              <b style={{ fontSize: "11px", display: "block" }}>রিসোর্ট ও বাংলো</b>
          </div>
      </div>

      {/* Add Hotel Form Overlay Modal */}
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
                🏨 নতুন আবাসিক তথ্য যুক্ত করুন
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                সঠিক নাম, রুম ক্যাটাগরি, অবস্থান ও বুকিং নম্বর দিন যাতে পর্যটকরা উপকৃত হন।
              </p>

              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">ধরণ নির্ধারণ করুন *</label>
                  <select
                    value={newCategory || ""}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    <option value="residential">🏨 আবাসিক হোটেল</option>
                    <option value="resort">🏡 রিসোর্ট ও সরকারি ডাকবাংলো</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">হোটেল বা বাংলোর নাম *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="উদা: হোটেল রাজবাড়ি আবাসিক"
                    value={newName || ""}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">বুকিং/মোবাইল নম্বর *</label>
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
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">অবস্থান ও পূর্ণ ঠিকানা</label>
                  <input 
                    type="text" 
                    placeholder="উদা: থানার পাশে, রথবাড়ি মোড়, পুঠিয়া"
                    value={newLocation || ""}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">সুবিধা</label>
                  <input 
                    type="text" 
                    placeholder="উদা: এসি/নন-এসি রুম, ফ্রি ওয়াইফাই, ২৪ ঘণ্টা সিসিটিভি নিরাপত্তা"
                    value={newAmenities || ""}
                    onChange={(e) => setNewAmenities(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPosting}
                  className="w-full bg-[#6d28d9] hover:bg-violet-700 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> সাবমিট করা হচ্ছে...
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

      <div id="hotel-list-container" className="space-y-4" style={{ display: "flex", flexDirection: "column", gap: "16px" }} dangerouslySetInnerHTML={{ __html: getRenderContent() }} />

      {/* User-posted Hotels */}
      <div className="space-y-4 mt-4 text-left">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : currentTabPosts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-gray-400 tracking-wider uppercase px-1">গ্রাহকদের দ্বারা শেয়ারকৃত আবাসন</h4>
            {currentTabPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-violet-50 p-2.5 rounded-full text-lg">
                      {post.category === 'residential' ? '🏨' : '🏡'}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-base">{post.name}</h4>
                      <p className="text-xs text-violet-600 font-bold">
                        {post.category === 'residential' ? 'আবাসিক হোটেল' : 'রিসোর্ট ও সরকারি ডাকবাংলো'}
                      </p>
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
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> <b>অবস্থান:</b> {post.location}
                  </div>
                  {post.amenities && (
                    <p className="text-xs text-gray-500 border-l-2 border-gray-100 pl-2 py-0.5 mt-1">
                      🔒 <b>সুবিধা:</b> {post.amenities}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <a 
                    href={`tel:${post.contact}`}
                    className="bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <Phone className="w-3.5 h-3.5" /> কল / বুকিং করুন ({post.contact})
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
