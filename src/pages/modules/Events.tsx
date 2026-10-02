import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ModulePageLayout from '../../components/common/ModulePageLayout';
import { 
  Calendar, MapPin, Clock, Users, X, Edit, Trash2, Plus, Sparkles, Image as ImageIcon 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, deleteDoc, doc, setDoc, serverTimestamp 
} from "firebase/firestore";

interface SocialEvent {
  id: string;
  title: string;
  category: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  organizer: string;
  description: string;
  image?: string;
}

const Events: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [items, setItems] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Admin Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("সাংস্কৃতিক");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formVenue, setFormVenue] = useState("");
  const [formOrganizer, setFormOrganizer] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");

  const isStaff = user?.email === 'mdzosimuddin31@gmail.com' || 
                  userProfile?.role === 'admin' || 
                  userProfile?.role === 'super_admin' || 
                  userProfile?.role === 'staff';

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("eventDate", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SocialEvent[];
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "events");
      setLoading(false);
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get("add") === "true") {
      setShowForm(true);
    }
    const tab = params.get("tab");
    if (tab) {
        setActiveFilter(tab);
    }

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const data = {
        title: formTitle,
        category: formCategory,
        eventDate: formDate,
        eventTime: formTime,
        venue: formVenue,
        organizer: formOrganizer,
        description: formDescription,
        image: formImage,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      };

      if (editingId) {
        await setDoc(doc(db, "events", editingId), data, { merge: true });
      } else {
        await addDoc(collection(db, "events"), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
      }

      resetForm();
    } catch (error) {
      handleFirestoreError(error as any, editingId ? OperationType.UPDATE : OperationType.CREATE, `events/${editingId || ''}`);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ইভেন্টটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
    } catch (error) {
      handleFirestoreError(error as any, OperationType.DELETE, `events/${id}`);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormCategory("সাংস্কৃতিক");
    setFormDate("");
    setFormTime("");
    setFormVenue("");
    setFormOrganizer("");
    setFormDescription("");
    setFormImage("");
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (item: SocialEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormDate(item.eventDate);
    setFormTime(item.eventTime);
    setFormVenue(item.venue);
    setFormOrganizer(item.organizer);
    setFormDescription(item.description || "");
    setFormImage(item.image || "");
    setEditingId(item.id);
    setShowForm(true);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { id: 'all', label: 'সবগুলো' },
    { id: 'সাংস্কৃতিক', label: 'সাংস্কৃতিক' },
    { id: 'ধর্মীয়', label: 'ধর্মীয়' },
    { id: 'খেলাধুলা', label: 'খেলাধুলা' },
    { id: 'সামাজিক', label: 'সামাজিক' },
    { id: 'অন্যান্য', label: 'অন্যান্য' },
  ];

  return (
    <ModulePageLayout
      title="ইভেন্ট গ্যালারি"
      subtitle="পুঠিয়া উপজেলার সকল সামাজিক, সাংস্কৃতিক ও ধর্মীয় অনুষ্ঠানের খবর"
      loading={loading}
      addCategory="event"
      onAddClick={undefined} // Let it open the universal add modal for citizens
      onSearchChange={setSearchTerm}
      filters={filterOptions}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      itemCount={filteredItems.length}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-[40px] p-8 flex flex-col sm:flex-row gap-8 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all group relative overflow-hidden h-full"
          >
            {/* Admin Controls */}
            {isStaff && (
              <div className="absolute top-6 right-6 flex gap-2 z-10">
                <button 
                  onClick={(e) => openEdit(item, e)}
                  className="p-3 bg-white/90 backdrop-blur-md border border-slate-100 text-emerald-600 rounded-2xl hover:bg-emerald-50 transition-all shadow-sm"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-3 bg-white/90 backdrop-blur-md border border-slate-100 text-rose-600 rounded-2xl hover:bg-rose-50 transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="w-full sm:w-40 flex flex-col items-center justify-center bg-indigo-50 rounded-[32px] p-6 shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-indigo-600 font-black text-sm uppercase tracking-widest mb-1">
                {new Date(item.eventDate).toLocaleString('bn-BD', { month: 'short' })}
              </span>
              <span className="text-5xl font-black text-indigo-950">
                {new Date(item.eventDate).toLocaleString('bn-BD', { day: '2-digit' })}
              </span>
              <div className="mt-4 px-3 py-1 bg-white/50 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                {item.category}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              <h3 className="font-black text-slate-900 text-2xl leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
                {item.title}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                    <Clock size={16} />
                  </div>
                  <span>{item.eventTime}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                    <MapPin size={16} />
                  </div>
                  <span className="line-clamp-1">{item.venue}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                    <Users size={16} />
                  </div>
                  <span>আয়োজনে: <span className="text-indigo-600 font-black">{item.organizer}</span></span>
                </div>
              </div>
              
              <p className="text-sm font-medium text-slate-400 line-clamp-2 leading-relaxed mt-auto">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Admin Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 bg-indigo-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-[20px]">
                    <Calendar size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{editingId ? "ইভেন্ট আপডেট করুন" : "নতুন ইভেন্ট যুক্ত করুন"}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">অ্যাডমিন কন্ট্রোল</p>
                  </div>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ইভেন্টের শিরোনাম</label>
                    <input
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="যেমন: বার্ষিক সাংস্কৃতিক অনুষ্ঠান ২০২৪"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ক্যাটাগরি</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm appearance-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    >
                      <option value="সাংস্কৃতিক">সাংস্কৃতিক</option>
                      <option value="ধর্মীয়">ধর্মীয়</option>
                      <option value="খেলাধুলা">খেলাধুলা</option>
                      <option value="সামাজিক">সামাজিক</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">তারিখ</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">সময়</label>
                    <input
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="যেমন: সকাল ১০:৩০"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">আয়োজক</label>
                    <input
                      required
                      value={formOrganizer}
                      onChange={(e) => setFormOrganizer(e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="যেমন: পুঠিয়া ক্লাব"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">স্থান/ভেন্যু</label>
                    <input
                      required
                      value={formVenue}
                      onChange={(e) => setFormVenue(e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="যেমন: পুঠিয়া রাজবাড়ি মাঠ"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ব্যানার ইমেজ ইউআরএল (ঐচ্ছিক)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="w-full pl-14 pr-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ইভেন্টের বিবরণ</label>
                    <textarea
                      required
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={4}
                      className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm resize-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="ইভেন্ট সম্পর্কে বিস্তারিত লিখুন..."
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-lg flex items-center justify-center gap-4 shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {editingId ? "ইভেন্ট আপডেট করুন" : "ইভেন্ট পাবলিশ করুন"}
                  <Sparkles size={24} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModulePageLayout>
  );
};

export default Events;
