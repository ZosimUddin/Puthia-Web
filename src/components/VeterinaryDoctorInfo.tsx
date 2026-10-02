import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Clock, PlusCircle, Trash2, Loader2, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface VetPost {
  id: string;
  name: string;
  category: 'all' | 'govt' | 'farm' | 'vaccine';
  contact: string;
  location: string;
  serviceHours: string;
  details: string;
  isUserPost?: boolean;
}

const drMahfuzCard = `
    <!-- ডাক্তার মো: মাহফুজুর রহমান কার্ড -->
    <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 12px; text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="background: #f1f5f9; padding: 10px; border-radius: 50%; font-size: 20px;">🏛️</div>
            <div>
                <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">ডাক্তার মো: মাহফুজুর রহমান</h4>
                <span style="color: #dc2626; font-size: 12px; font-weight: 600; display: block; margin-top: 2px;">DVM (Doctor of Veterinary Medicine), MS (Veterinary Surgery)</span>
                <span style="color: #64748b; font-size: 11px; font-weight: bold;">উপজেলা ভেটেরিনারি সার্জন</span>
            </div>
        </div>
        <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            <div>📍 <b>কর্মস্থল:</b> উপজেলা প্রাণিসম্পদ দফতর ও ভেটেরিনারি হাসপাতাল, পুঠিয়া।</div>
            <div>⏰ <b>সেবা সময়:</b> সকাল ০৯:০০ — বিকেল ০৪:০০ (সরকারি কর্মদিবস)</div>
            <div>📝 <b>বিবরণ:</b> সরকারি পশুপাখি হাসপাতালের প্রধান সার্জন। গবাদি পশুর জটিল রোগ, সার্জারি এবং সরকারি টিকাদান (ভ্যাকসিনেশন) কর্মসূচির জন্য সরাসরি যোগাযোগ করুন।</div>
        </div>
        <a href="tel:+8801700000000" style="background: #dc2626; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 সরকারি হাসপাতালে কল করুন</a>
    </div>
`;

const drRezaulCard = `
    <!-- ডা: এস. এম. রেজাউল করিম কার্ড -->
    <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="background: #e0f2fe; padding: 10px; border-radius: 50%; font-size: 20px;">🐄</div>
            <div>
                <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 800;">ডা: এস. এম. রেজাউল করিম</h4>
                <span style="color: #0284c7; font-size: 12px; font-weight: 600; display: block; margin-top: 2px;">DVM (RU), রেজিস্টার্ড ভেটেরিনারি প্রাকটিশনার</span>
                <span style="color: #64748b; font-size: 11px; font-weight: bold;">ডেইরি ও পোল্ট্রি ফার্ম কনসালট্যান্ট</span>
            </div>
        </div>
        <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
            <div>📍 <b>এলাকা:</b> পুঠিয়া সদর, বেলপুকুর ও বানেশ্বর ইউনিয়ন (অন-কল খামার ভিজিট)।</div>
            <div>⏰ <b>সেবা সময়:</b> সকাল ০৮:০০ — রাত ১০:০০ (জরুরি প্রয়োজনে সার্বক্ষণিক)</div>
            <div>📝 <b>বিবরণ:</b> ডেইরি ও পোল্ট্রি খামারের যেকোনো রোগ বা উন্নত চিকিৎসার জন্য সরাসরি খামারে গিয়ে পরামর্শ ও চিকিৎসা প্রদান করেন।</div>
        </div>
        <a href="tel:+8801700000000" style="background: #1e293b; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">📞 ডাক্তারের চেম্বারে কল করুন</a>
    </div>
`;

const vetData: Record<string, string> = {
    "all": drMahfuzCard + drRezaulCard,
    "govt": drMahfuzCard,
    "farm": drRezaulCard,
    "vaccine": `
        <div style="background: #ffffff; padding: 18px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: left;">
            <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 800;">💊 সরকারি ভ্যাকসিন ও পরামর্শ তথ্য</h4>
            <div style="font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 8px;">
                <div>• গবাদি পশুর তড়কা, বাদলা, গলাফুলা ও ক্ষুরারোগের ভ্যাকসিন সরকারি হাসপাতালে সফল মূল্যে পাওয়া যায়।</div>
                <div>• হাঁস-মুরগির রানীক্ষেত ও বসন্ত রোগের প্রতিষেধকের জন্য সরাসরি লাইভস্টক অফিসে যোগাযোগ করুন।</div>
                <div style="margin-top: 10px; font-weight: bold; color: #dc2626;">💡 পরামর্শের জন্য সরকারি হাসপাতালের হটলাইনে (উপরে) অফিস টাইমে কল দিন।</div>
            </div>
        </div>
    `
};

export const VeterinaryDoctorInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'govt' | 'farm' | 'vaccine'>("all");
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
  const [dbPosts, setDbPosts] = useState<VetPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to veterinary_posts in Firestore
  useEffect(() => {
    const q = query(collection(db, 'veterinary_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: VetPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'farm',
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
      handleFirestoreError(error, OperationType.LIST, "veterinary_posts");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getRenderContent = () => {
    return vetData[activeTab] || '<p style="text-align:center; color:#64748b; padding:20px;">কোনো তথ্য পাওয়া যায়নি।</p>';
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
      await addDoc(collection(db, 'veterinary_posts'), {
        name: newName.trim(),
        category: activeTab === 'all' ? 'farm' : activeTab,
        contact: newContact.trim(),
        location: newLocation.trim() || 'পুঠিয়া',
        serviceHours: newServiceHours.trim() || 'সকাল ০৯:০০ - রাত ০৯:০০',
        details: newDetails.trim() || 'রেজিস্টার্ড ভেটেরিনারি সার্জন',
        createdAt: serverTimestamp()
      });

      // Reset
      setNewName('');
      setNewContact('');
      setNewLocation('');
      setNewServiceHours('');
      setNewDetails('');
      setShowPostForm(false);
      alert('🎉 চিকিৎসক সফলভাবে তালিকাভুক্ত করা হয়েছে!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "veterinary_posts");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই চিকিৎসকের তথ্যটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'veterinary_posts', id));
      alert('চিকিৎসকের তথ্য সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `veterinary_posts/${id}`);
    }
  };

  const currentTabPosts = dbPosts.filter(p => {
    if (activeTab === 'all') return true;
    return p.category === activeTab;
  });

  return (
    <div className="font-sans space-y-6 pb-6 text-center animate-fade-in" style={{ padding: "0" }}>
      <div id="vet-banner" style={{ background: "linear-gradient(135deg, #e11d48, #ea580c)", padding: "24px 20px", borderRadius: "24px", color: "white" }}>
          <div style={{ display: "block", marginBottom: "16px", textAlign: "left" }}>
              {onGoBack && (
                  <button onClick={onGoBack} style={{ background: "rgba(255, 255, 255, 0.2)", border: "none", padding: "6px 14px", borderRadius: "20px", color: "white", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                      ← ফিরে যান
                  </button>
              )}
          </div>
          <span style={{ fontSize: "13px", opacity: 0.9, display: "block", marginBottom: "4px", textAlign: "left" }}>প্রাণিসম্পদ ও পশুপাখি চিকিৎসা</span>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "26px", fontWeight: 800, textAlign: "left" }}>ভেটেরিনারি ডাক্তার</h2>
          <div style={{ width: "40px", height: "4px", background: "white", borderRadius: "2px", marginBottom: "14px" }}></div>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9, lineHeight: 1.5, textAlign: "justify" }}>পুঠিয়া উপজেলার রেজিস্টার্ড ভেটেরিনারি সার্জন, সরকারি প্রাণিসম্পদ কর্মকর্তা এবং মাঠ পর্যায়ের অভিজ্ঞ पशु চিকিৎসকদের তালিকা ও জরুরি যোগাযোগ নম্বর।</p>
      </div>

      <div className="flex justify-between items-center px-1">
        <h3 className="font-bold text-gray-800 text-base">চিকিৎসকবৃন্দ</h3>
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
          <PlusCircle className="w-4 h-4" /> ডাক্তার যুক্ত করুন
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1">
        {[
          { id: 'all', label: 'সব চিকিৎসক', emoji: '🧑‍⚕️' },
          { id: 'govt', label: 'সরকারি সার্জন', emoji: '🏛️' },
          { id: 'farm', label: 'খামার ভিজিট', emoji: '🐄' },
          { id: 'vaccine', label: 'ভ্যাকসিন/পরামর্শ', emoji: '💊' }
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

      {/* Add Vet Form Overlay Modal */}
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
                🧑‍⚕️ নতুন ভেটেরিনারি ডাক্তার যুক্ত করুন
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                সঠিক নাম, ডিগ্রি এবং চেম্বারের ঠিকানা প্রদান করুন।
              </p>

              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">ডাক্তারের নাম *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="উদা: ডা: মো: হাসিবুর রহমান"
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
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">এলাকা/কর্মস্থল/চেম্বার</label>
                  <input 
                    type="text" 
                    placeholder="উদা: বানেশ্বর বাজার চেম্বার"
                    value={newLocation || ""}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">সেবা সময়</label>
                  <input 
                    type="text" 
                    placeholder="উদা: সকাল ১০:০০ - রাত ০৮:০০"
                    value={newServiceHours || ""}
                    onChange={(e) => setNewServiceHours(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">ডিগ্রী ও বিবরণ</label>
                  <textarea 
                    placeholder="উদা: DVM (RU), অভিজ্ঞ ডেইরি পরামর্শক"
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
                      <Loader2 className="w-4 h-4 animate-spin" /> সংরক্ষণ করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> ডাক্তার যুক্ত করুন
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div id="vet-list-container" style={{ display: "flex", flexDirection: "column", gap: "16px" }} dangerouslySetInnerHTML={{ __html: getRenderContent() }} />

      {/* User-posted veterinarians */}
      <div className="space-y-4 mt-4 text-left">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : currentTabPosts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-gray-400 tracking-wider uppercase px-1">গ্রাহকদের দ্বারা শেয়ারকৃত ডাক্তার তালিকা</h4>
            {currentTabPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 p-2.5 rounded-full text-lg">🐄</div>
                    <div>
                      <h4 className="font-black text-gray-900 text-base">{post.name}</h4>
                      <p className="text-xs text-emerald-600 font-bold">রেজিস্টার্ড ভেটেরিনারি সার্জন</p>
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
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> <b>এলাকা/চেম্বার:</b> {post.location}
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
