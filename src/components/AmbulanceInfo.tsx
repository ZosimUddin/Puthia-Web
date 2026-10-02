import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Clock, Coins, PlusCircle, X, Loader2, Trash2, Send, Heart, Ambulance, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { UnifiedHeroHeader } from './common/UnifiedDesignSystem';

interface Ambulance {
  id: string;
  name: string;
  category: 'govt' | 'private' | 'free';
  location: string;
  contact: string;
  serviceHours: string;
  details: string;
  isUserPost?: boolean;
}

const INITIAL_AMBULANCES: Ambulance[] = [
  {
    id: 'govt1',
    name: 'উপজেলা স্বাস্থ্য কমপ্লেক্স অ্যাম্বুলেন্স',
    category: 'govt',
    location: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স, পুঠিয়া সদর।',
    contact: '01713231317',
    serviceHours: '২৪ ঘণ্টা সচল (জরুরি রেফার্ড রোগীদের জন্য অগ্রাধিকার)',
    details: 'সরকারি নির্ধারিত ফি অনুযায়ী কিলোমিটার হিসেবে ভাড়া নির্ধারণ করা হয়।'
  },
  {
    id: 'private1',
    name: 'পুঠিয়া অন-কল প্রাইভেট অ্যাম্বুলেন্স সার্ভিস',
    category: 'private',
    location: 'পুঠিয়া ও বানেশ্বর থেকে রাজশাহী মেডিকেল বা ঢাকা।',
    contact: '01712456789',
    serviceHours: '২৪ ঘণ্টা',
    details: 'হাই-রুফ এসি ও নন-এসি অ্যাম্বুলেন্স। অক্সিজেন সিলিন্ডার এবং পেশেন্ট বেড সুবিধা সংবলিত আধুনিক গাড়ি। যেকোনো দূরপাল্লার রুটে অন-কল বুকিং নেওয়া হয়।'
  }
];

export const AmbulanceInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'govt' | 'private' | 'free'>('all');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Post form states
  const [showPostForm, setShowPostForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'govt' | 'private' | 'free'>('private');
  const [newLocation, setNewLocation] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newServiceHours, setNewServiceHours] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Firestore state
  const [dbAmbulances, setDbAmbulances] = useState<Ambulance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load ambulance data from Firestore
  useEffect(() => {
    const q = query(collection(db, 'ambulances'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Ambulance[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'private',
          location: data.location || '',
          contact: data.contact || '',
          serviceHours: data.serviceHours || '',
          details: data.details || '',
          isUserPost: true
        });
      });
      setDbAmbulances(list);
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading ambulances:', error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const allAmbulances = [...dbAmbulances, ...INITIAL_AMBULANCES];
 
  // Filter lists based on tab and searchQuery
  const filteredAmbulances = allAmbulances.filter((amb) => {
    const matchesSearch = 
      amb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amb.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amb.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    return amb.category === activeTab;
  });

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!newName || !newLocation || !newContact) {
      alert('দয়া করে প্রয়োজনীয় সব তথ্য পূরণ করুন।');
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, 'ambulances'), {
        name: newName.trim(),
        category: newCategory,
        location: newLocation.trim(),
        contact: newContact.trim(),
        serviceHours: newServiceHours.trim() || '২৪ ঘণ্টা',
        details: newDetails.trim() || 'কোনো অতিরিক্ত বিবরণ দেওয়া হয়নি।',
        createdAt: serverTimestamp()
      });

      // Reset form
      setNewName('');
      setNewLocation('');
      setNewContact('');
      setNewServiceHours('');
      setNewDetails('');
      setShowPostForm(false);
      alert('🎉 অ্যাম্বুলেন্স সেবাটি সফলভাবে তালিকাভুক্ত করা হয়েছে!');
    } catch (err) {
      console.error('Error adding ambulance:', err);
      alert('অ্যাম্বুলেন্স যোগ করতে সমস্যা হয়েছে।');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই অ্যাম্বুলেন্স সেবাটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'ambulances', id));
      alert('অ্যাম্বুলেন্স তথ্য সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (err) {
      console.error('Error deleting ambulance:', err);
      alert('মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="font-sans space-y-6 pb-10 text-left" id="ambulance-main-view">
      <UnifiedHeroHeader
        badgeText="জরুরি চিকিৎসা ও লাইফ সাপোর্ট সেবা"
        title="জরুরি অ্যাম্বুলেন্স"
        subtitle="পুঠিয়া উপজেলা হাসপাতাল ও স্থানীয় অ্যাম্বুলেন্স সেবা প্রদানকারীদের জরুরি যোগাযোগের হটলাইন ডিরেক্টরি। মুমূর্ষু রোগীকে স্থানান্তরের জন্য ২৪ ঘণ্টা সচল সেবা।"
        icon={<Ambulance size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="চালক, ঠিকানা বা বিবরণ দিয়ে খুঁজুন..."
        rightAction={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchQuery("");
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showSearch 
                  ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-400" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button 
              onClick={() => setShowPostForm(!showPostForm)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showPostForm 
                  ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-400" 
                  : "bg-white text-rose-600 hover:bg-rose-50 border-white/20"
              }`}
              title={showPostForm ? "বিজ্ঞপ্তি ফরম বন্ধ করুন" : "নতুন অ্যাম্বুলেন্স যোগ করুন"}
            >
              {showPostForm ? <X size={18} /> : <PlusCircle size={18} />}
            </button>
          </div>
        }
      />

      {/* Action panel & tabs layout */}
      <div className="px-1">
        {/* 4 Interactive Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'all', label: 'সব অ্যাম্বুলেন্স', emoji: '🚑' },
            { id: 'govt', label: 'সরকারি', emoji: '🏛️' },
            { id: 'private', label: 'বেসরকারি', emoji: '📞' },
            { id: 'free', label: 'ফ্রি সার্ভিস', emoji: '🎁' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                  isActive 
                    ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold' 
                    : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50 font-semibold'
                }`}
              >
                <span className={`text-lg ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
                <span className="text-[9px] sm:text-[11px] leading-tight text-center tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Area */}
      <AnimatePresence>
        {showPostForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handlePostSubmit} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-md font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                <PlusCircle className="w-5 h-5 text-rose-500" /> নতুন অ্যাম্বুলেন্স তথ্য যোগ করুন
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">১. চালক বা সার্ভিস প্রতিষ্ঠানের নাম *</label>
                  <input
                    type="text"
                    required
                    value={newName || ""}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="উদাঃ পুঠিয়া আল-মদিনা অ্যাম্বুলেন্স সার্ভিস"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">২. সেবার ধরণ *</label>
                  <select
                    value={newCategory || ""}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm outline-none font-bold text-rose-600"
                  >
                    <option value="private">বেসরকারি (প্রাইভেট)</option>
                    <option value="govt">সরকারি (হাসপাতাল)</option>
                    <option value="free">ফ্রি সার্ভিস (দাতব্য/সংগঠন)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">৩. সার্ভিস এরিয়া / অবস্থান *</label>
                  <input
                    type="text"
                    required
                    value={newLocation || ""}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="উদাঃ বানেশ্বর জোন থেকে রাজশাহী মেডিকেল কলেজ"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">৪. সেবা প্রদানের সময়</label>
                  <input
                    type="text"
                    value={newServiceHours || ""}
                    onChange={(e) => setNewServiceHours(e.target.value)}
                    placeholder="উদাঃ ২৪ ঘণ্টা সচল"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">৫. যোগাযোগের মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={newContact || ""}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="উদাঃ 01712345678"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">৬. ভাড়া বা অন্যান্য সুযোগ-সুবিধার বিবরণ</label>
                <textarea
                  rows={2}
                  value={newDetails || ""}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="অক্সিজেন সাপোর্ট আছে কি না, বা এসি/নন-এসি ভাড়ার তথ্য এখানে লিখুন..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPosting}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer border-none"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    সাবমিট করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    অ্যাম্বুলেন্স তথ্য পোস্ট করুন
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Directory List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
            <p className="text-xs text-gray-500 font-bold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredAmbulances.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
            <span className="text-4xl block mb-2">📋</span>
            <h5 className="text-base font-bold text-gray-800 mb-1">কোনো অ্যাম্বুলেন্স তালিকা পাওয়া যায়নি</h5>
            <p className="text-gray-500 text-xs">এই ক্যাটাগরিতে এখনো কোনো তথ্য যোগ করা হয়নি ভাই। নতুন তথ্য যোগ করতে উপরের বাটনটি চাপুন।</p>
          </div>
        ) : (
          filteredAmbulances.map((amb, index) => (
            <div 
              key={amb.id || index}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Delete button for user-submitted posts */}
              {amb.isUserPost && (
                <button
                  onClick={() => handleDelete(amb.id)}
                  className="absolute top-4 right-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-none bg-transparent z-10"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              )}

              {/* Title & Badge */}
              <div className="flex items-start gap-4">
                <div className="bg-rose-50 text-rose-600 w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0">
                  {amb.category === 'govt' ? '🏛️' : amb.category === 'free' ? '🎁' : '🚑'}
                </div>
                <div className="pr-12">
                  <h3 className="text-lg font-extrabold text-gray-800 leading-tight">
                    {amb.name}
                  </h3>
                  <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full mt-1.5 ${
                    amb.category === 'govt' 
                      ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                      : amb.category === 'free'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {amb.category === 'govt' ? 'সরকারি জরুরি পরিবহন' : amb.category === 'free' ? 'ফ্রি মানবিক সেবা' : 'অন-কল প্রাইভেট অ্যাম্বুলেন্স'}
                  </span>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-800 block">সার্ভিস এরিয়া/অবস্থান:</span>
                    <span>{amb.location}</span>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-800 block">সেবা সময়:</span>
                    <span>{amb.serviceHours || '২৪ ঘণ্টা'}</span>
                  </div>
                </div>
              </div>

              {/* Description Details */}
              {amb.details && (
                <div className="bg-gray-50/20 p-4 rounded-2xl border border-gray-100 text-xs text-gray-500 leading-relaxed">
                  <span className="font-bold text-gray-700 block mb-1">📝 বিস্তারিত সুযোগ-সুবিধা:</span>
                  {amb.details}
                </div>
              )}

              {/* Direct call button */}
              <a 
                href={`tel:${amb.contact}`} 
                id={`call-ambulance-${index}`}
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-center py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                <Phone className="w-4 h-4 fill-current" /> অ্যাম্বুলেন্স বুকিং করুন ({amb.contact})
              </a>
            </div>
          ))
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};
