import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Clock, PlusCircle, Trash2, Loader2, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface WomenChildPost {
  id: string;
  name: string;
  category: 'emergency' | 'legal' | 'allowance' | 'health';
  contact: string;
  location: string;
  serviceHours: string;
  details: string;
  isUserPost?: boolean;
}

const emergencyHelplineCard = `
    <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 12px; text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="background: #fee2e2; padding: 10px; border-radius: 50%; font-size: 20px;">🚨</div>
            <div>
                <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">জাতীয় নারী ও শিশু নির্যাতন প্রতিরোধ সেল</h4>
                <span style="color: #dc2626; font-size: 12px; font-weight: 600; display: block; margin-top: 2px;">টোল-ফ্রি হটলাইন (১০৯)</span>
            </div>
        </div>
        <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            <div>⏰ <b>সেবা সময়:</b> ২৪ ঘণ্টা (যেকোনো মোবাইল থেকে সম্পূর্ণ বিনামূল্যে)।</div>
            <div>📝 <b>বিবরণ:</b> বাল্যবিয়ে প্রতিরোধ, পারিবারিক সহিংসতা, ইভটিজিং বা যেকোনো নির্যাতনের শিকার হলে তাৎক্ষণিক সরকারি আইনি ও পুলিশি সহায়তার জন্য কল করুন।</div>
        </div>
        <a href="tel:109" style="background: #dc2626; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 হটলাইন ১০৯-এ কল করুন</a>
    </div>

    <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="background: #e0f2fe; padding: 10px; border-radius: 50%; font-size: 20px;">🧒</div>
            <div>
                <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">চাইল্ড হেল্পলাইন (Child Helpline)</h4>
                <span style="color: #0284c7; font-size: 12px; font-weight: 600; display: block; margin-top: 2px;">টোল-ফ্রি হটলাইন (১০৯৮)</span>
            </div>
        </div>
        <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            <div>📌 <b>কাজ:</b> শিশুর অধিকার রক্ষা, শিশু শ্রম প্রতিরোধ, নিখোঁজ শিশু এবং ঝুঁকিতে থাকা শিশুদের সুরক্ষায় ইউনিসেফ ও সমাজсеবা অধিদফতরের যৌথ উদ্যোগ।</div>
        </div>
        <a href="tel:1098" style="background: #1e293b; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 চাইল্ড হেল্পলাইন ১০৯৮</a>
    </div>
`;

const womenChildData: Record<string, string> = {
    "emergency": emergencyHelplineCard,
    "legal": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 800;">⚖️ পুঠিয়া উপজেলা আইনি সহায়তা কেন্দ্র</h4>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 10px; line-height: 1.5;">
                <div>• পুঠিয়া উপজেলা নির্বাহী অফিসার (UNO) কার্যালয় এবং উপজেলা সমাজসেবা অফিসে অসচ্ছল নারীদের জন্য সরকারি খরচে আইনি সহায়তা সেল রয়েছে।</div>
                <div>• যৌতুক, লিগ্যাল নোটিশ বা দেনমোহর আদায়ের যেকোনো আইনি পরামর্শের জন্য সরাসরি উপজেলা তথ্য আপা (জাতীয় মহিলা সংস্থা) প্রকল্পে যোগাযোগ করতে পারেন।</div>
                <div style="margin-top: 6px; font-weight: bold; color: #dc2626;">💡 জরুরি পুলিশি প্রোটেকশনের জন্য পুঠিয়া থানার ডিউটি অফিসারের শরণাপন্ন হোন।</div>
            </div>
        </div>
    `,
    "allowance": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 800;">🎁 নারী ও শিশুদের জন্য সরকারি সামাজিক নিরাপত্তা কর্মসূচী</h4>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 8px; line-height: 1.5;">
                <div>• <b>বিধবা ও স্বামী নিগৃহীতা মহিলা ভাতা:</b> আবেদনের জন্য নিজ ইউনিয়ন পরিষদ বা পৌরসভা কার্যালয়ে যোগাযোগ করুন।</div>
                <div>• <b>মাতৃত্বকালীন ও ল্যাকটেটিং মাদার ভাতা:</b> দরিদ্র গর্ভবতী ও দুগ্ধদানকারী মায়েদের আর্থিক সহায়তা।</div>
                <div>• <b>উপবৃত্তি:</b> ছাত্রীদের ঝরে পড়া রোধে প্রাথমিক ও মাধ্যমিক স্তরে বিশেষ উপবৃত্তি ও শিক্ষা সামগ্রী বিতরণ প্রকল্প।</div>
            </div>
        </div>
    `,
    "health": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 800;">🩺 গর্ভবতী মা ও শিশুর স্বাস্থ্য কেন্দ্র</h4>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 8px; line-height: 1.5;">
                <div>• পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্সে এবং গ্রামীণ কমিউনিটি ক্লিনিকগুলোতে মা ও শিশুর বিনামূল্যে টিকাদান (EPI) এবং স্বাস্থ্য পরীক্ষা করা হয়।</div>
                <div>• গর্ভবতী মায়েদের আয়রন ও ফলিক এসিড ট্যাবলেট বিনামূল্যে সরকারি হাসপাতাল থেকে সরবরাহ করা হয়।</div>
                <div>• শিশুর পুষ্টিহীনতা দূর করতে ও নিয়মিত ওজন পরিমাপের জন্য নিকটস্থ স্যাটেলাইট ক্লিনিকে যোগাযোগ রাখুন।</div>
            </div>
        </div>
    `
};

export const WomenChildrenHelpInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'emergency' | 'legal' | 'allowance' | 'health'>("emergency");
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
  const [dbPosts, setDbPosts] = useState<WomenChildPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to women_child_posts in Firestore
  useEffect(() => {
    const q = query(collection(db, 'women_child_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: WomenChildPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'emergency',
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
      handleFirestoreError(error, OperationType.LIST, "women_child_posts");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getRenderContent = () => {
    return womenChildData[activeTab] || '<p style="text-align:center; color:#64748b; padding:20px;">কোনো তথ্য পাওয়া যায়নি।</p>';
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
      await addDoc(collection(db, 'women_child_posts'), {
        name: newName.trim(),
        category: activeTab,
        contact: newContact.trim(),
        location: newLocation.trim() || 'পুঠিয়া এলাকা',
        serviceHours: newServiceHours.trim() || '২৪ ঘণ্টা খোলা',
        details: newDetails.trim() || 'নারী ও শিশু উন্নয়ন ও আইনি পরামর্শ',
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
      handleFirestoreError(err, OperationType.CREATE, "women_child_posts");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'women_child_posts', id));
      alert('তথ্যটি সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `women_child_posts/${id}`);
    }
  };

  const currentTabPosts = dbPosts.filter(p => p.category === activeTab);

  return (
    <div className="font-sans pb-6 text-center animate-fade-in" style={{ padding: "0" }}>
      <div id="women-child-banner" style={{ background: "linear-gradient(135deg, #e11d48, #ea580c)", padding: "24px 20px", borderRadius: "24px", color: "white" }}>
          <div style={{ display: "block", marginBottom: "16px", textAlign: "left" }}>
              {onGoBack && (
                  <button onClick={onGoBack} style={{ background: "rgba(255, 255, 255, 0.2)", border: "none", padding: "6px 14px", borderRadius: "20px", color: "white", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                      ← ফিরে যান
                  </button>
              )}
          </div>
          <span style={{ fontSize: "13px", opacity: 0.9, display: "block", marginBottom: "4px", textAlign: "left" }}>সুরক্ষা, অধিকার ও আইনি সহায়তা</span>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "26px", fontWeight: 800, textAlign: "left" }}>নারী ও শিশু সহায়তা</h2>
          <div style={{ width: "40px", height: "4px", background: "white", borderRadius: "2px", marginBottom: "14px" }}></div>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9, lineHeight: 1.5, textAlign: "justify" }}>পারিবারিক নির্যাতন প্রতিরোধ, বাল্যবিয়ে বন্ধ, আইনি সহায়তা এবং নারী ও শিশুদের স্বাস্থ্য-পুষ্টি ও সরকারি সুবিধা সংক্রান্ত নির্দেশিকা।</p>
      </div>

      <div className="flex justify-between items-center px-1 my-4">
        <h3 className="font-bold text-gray-800 text-base">সহায়তা ও যোগাযোগ</h3>
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
          { id: 'emergency', label: 'জরুরি হেল্পলাইন', emoji: '🚨' },
          { id: 'legal', label: 'আইনি সহায়তা', emoji: '⚖️' },
          { id: 'allowance', label: 'सरकारी ভাতা', emoji: '🎁' },
          { id: 'health', label: 'স্বাস্থ্য ও পুষ্টি', emoji: '🩺' }
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

      {/* Add Women/Child Contact Form Overlay Modal */}
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
                👩‍👧 নতুন সহায়তা কন্টাক্ট যুক্ত করুন
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                সঠিক নাম, পদবি এবং সক্রিয় কন্টাক্ট নম্বর বা হটলাইন শেয়ার করুন।
              </p>

              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">পদবি/সহায়তা কেন্দ্রের নাম *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="উদা: উপজেলা তথ্য আপা কার্যালয়, পুঠিয়া"
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
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">লোকেশন/কার্যালয়</label>
                  <input 
                    type="text" 
                    placeholder="উদা: উপজেলা পরিষদ ভবন, পুঠিয়া"
                    value={newLocation || ""}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">সেবা সময়</label>
                  <input 
                    type="text" 
                    placeholder="উদা: সকাল ০৯:০০ - বিকেল ০৫:০০"
                    value={newServiceHours || ""}
                    onChange={(e) => setNewServiceHours(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">সহায়তার ধরণ ও বিবরণ</label>
                  <textarea 
                    placeholder="উদা: অসচ্ছল গর্ভবতী মহিলাদের পুষ্টি পরামর্শ, আইনি সহায়তা সেল ইত্যাদি..."
                    value={newDetails || ""}
                    onChange={(e) => setNewDetails(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPosting}
                  className="w-full bg-[#eab308] hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
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

      <div id="women-child-list-container" style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px" }} dangerouslySetInnerHTML={{ __html: getRenderContent() }} />

      {/* User-posted women/child contacts */}
      <div className="space-y-4 mt-4 text-left">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : currentTabPosts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-gray-400 tracking-wider uppercase px-1">গ্রাহকদের দ্বারা শেয়ারকৃত সহায়তা নম্বর</h4>
            {currentTabPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-50 p-2.5 rounded-full text-lg">👩‍👧</div>
                    <div>
                      <h4 className="font-black text-gray-900 text-base">{post.name}</h4>
                      <p className="text-xs text-pink-600 font-bold">নারী ও শিশু নিরাপত্তা</p>
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
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> <b>কার্যালয়:</b> {post.location}
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
