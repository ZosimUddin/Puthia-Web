import React, { useState, useEffect } from "react";
import { ArrowLeft, Store, Search, MapPin, Phone, Clock, ShoppingBag, ShieldCheck, Plus, Trash2, Loader2, Sparkles, Send, Truck, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface SuperShop {
  id: string;
  name: string;
  location: string;
  timing: string;
  contact: string;
  products: string;
  delivery: boolean;
  rating?: string;
  icon?: string;
}

const staticSuperShops: SuperShop[] = [
  {
    id: "ss-1",
    name: "পুঠিয়া রাজকীয় মেগা সুপার শপ",
    location: "রাজবাড়ী মেইন গেট সংলগ্ন, পুঠিয়া সদর",
    timing: "প্রতিদিন সকাল ৮:০০ — রাত ১০:০০",
    contact: "০১৭৩০-১২২৩৩৪",
    products: "দৈনন্দিন মুদি বাজার, গুঁড়ো দুধ, ঘি, অর্গানিক মধু, প্যাকেজড চাল-ডাল, প্রসাধনী ও গৃহস্থালী সামগ্রী।",
    delivery: true,
    rating: "৪.৯",
    icon: "🛒"
  },
  {
    id: "ss-2",
    name: "বানেশ্বর মেগা সুপার বাজার",
    location: "বানেশ্বর হাইওয়ে মোড়, পুঠিয়া",
    timing: "প্রতিদিন সকাল ৭:৩০ — রাত ১০:৩০",
    contact: "০১৭১২-৪৫৫৬৬৭",
    products: "তাজা ফলমূল, ফ্রোজেন ফুড, ব্র্যান্ডেড স্ন্যাক্স, পার্সোনাল কেয়ার প্রোডাক্টস ও বেকারি আইটেম।",
    delivery: true,
    rating: "৪.৮",
    icon: "🏬"
  },
  {
    id: "ss-3",
    name: "ফ্যামিলি বাজার & সুপার শপ",
    location: "পুঠিয়া বাসস্ট্যান্ড রোড, পুঠিয়া",
    timing: "প্রতিদিন সকাল ৮:৩০ — রাত ৯:৩০",
    contact: "০১৭৫৫-৮৮৯৯০০",
    products: "আন্তর্জাতিক ব্র্যান্ডের ইম্পোর্টেড চকলেট, কসমেটিকস, শিশু খাদ্য (Baby Food) ও ক্রোকারিজ।",
    delivery: false,
    rating: "৪.৭",
    icon: "🛍️"
  },
  {
    id: "ss-4",
    name: "রাজবাড়ী এগ্রো অর্গানিক সুপার শপ",
    location: "লেকমোড়, পুঠিয়া রাজবাড়ী রোড",
    timing: "প্রতিদিন সকাল ৯:০০ — রাত ৮:৩০",
    contact: "০১৭০০-৩৩৪৪৫৫",
    products: "পুঠিয়ার খাঁটি খেজুরের গুড়, কেমিক্যালমুক্ত খামারের দেশি ঘি, সর্ষের তেল, অর্গানিক শাকসবজি।",
    delivery: true,
    rating: "৫.০",
    icon: "🍯"
  }
];

export const SuperShopInfo: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userShops, setUserShops] = useState<SuperShop[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [timing, setTiming] = useState("");
  const [contact, setContact] = useState("");
  const [products, setProducts] = useState("");
  const [delivery, setDelivery] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "supershops"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: SuperShop[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<SuperShop, "id">)
      }));
      setUserShops(fetched);
    }, (error) => {
      console.error("Firestore error:", error);
      handleFirestoreError(error, OperationType.READ, "supershops");
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !contact) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "supershops"), {
        name,
        location,
        timing: timing || "প্রতিদিন সকাল ৮:০০ — রাত ৯:৩০",
        contact,
        products: products || "মুদি বাজার ও নিত্যপ্রয়োজনীয় সামগ্রী।",
        delivery,
        rating: "৫.০",
        icon: "🛒",
        createdAt: serverTimestamp()
      });

      setName("");
      setLocation("");
      setTiming("");
      setContact("");
      setProducts("");
      setShowForm(false);
    } catch (error) {
      console.error("Error adding supershop:", error);
      handleFirestoreError(error, OperationType.CREATE, "supershops");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি এই সুপার শপের তথ্য মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "supershops", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `supershops/${id}`);
    }
  };

  const allShops = [...userShops, ...staticSuperShops];

  const filteredShops = allShops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.products.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans space-y-6 pb-8">
      <UnifiedHeroHeader
        badgeText="ব্যবসা ও কেনাকাটা"
        title="সুপার শপ ও মেগা বাজার"
        subtitle="পুঠিয়ার আধুনিক সুপার শপ, অর্গানিক গ্রোসারি বাজার, হোম ডেলিভারি ও বিশেষ মূল্যছাড়ের বিস্তারিত তথ্য।"
        icon={<ShoppingBag size={20} />}
        showBack={!!onGoBack}
        onBack={onGoBack}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="সুপার শপের নাম বা পণ্য দিয়ে খুঁজুন..."
        rightAction={
          <button 
            onClick={() => setShowForm(!showForm)}
            className="w-10 h-10 rounded-full bg-white text-emerald-950 hover:bg-emerald-50 flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm"
            title="নতুন সুপার শপ যোগ করুন"
          >
            <Plus size={18} />
          </button>
        }
      />

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-md space-y-4 overflow-hidden"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              নতুন সুপার শপের বিবরণ যুক্ত করুন
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">সুপার শপের নাম *</label>
                <input 
                  type="text" required placeholder="উদাঃ পুঠিয়া সেন্ট্রাল সুপার শপ"
                  value={name || ""} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">অবস্থান / ঠিকানা *</label>
                <input 
                  type="text" required placeholder="উদাঃ বানেশ্বর বাজার মোড়, পুঠিয়া"
                  value={location || ""} onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">যোগাযোগ নম্বর *</label>
                <input 
                  type="text" required placeholder="উদাঃ 01700-000000"
                  value={contact || ""} onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">সময়সূচী</label>
                <input 
                  type="text" placeholder="উদাঃ প্রতিদিন সকাল ৮:০০ — রাত ১০:০০"
                  value={timing || ""} onChange={(e) => setTiming(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block">পণ্য ও সেবার বিবরণ</label>
              <textarea 
                rows={2} placeholder="উদাঃ চাল, ডাল, তেল, কসমেটিক্স, বেকারি ফুড ইত্যাদি..."
                value={products || ""} onChange={(e) => setProducts(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" id="delivery" checked={delivery} onChange={(e) => setDelivery(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="delivery" className="text-xs font-bold text-gray-700 cursor-pointer">হোম ডেলিভারি সুবিধা আছে</label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                বাতিল
              </button>
              <button 
                type="submit" disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer flex items-center gap-1 shadow-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} সংরক্ষণ করুন
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredShops.map((shop) => {
          const isUserAdded = userShops.some(u => u.id === shop.id);
          return (
            <div key={shop.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600"></div>
              <div>
                <div className="flex items-start justify-between gap-2 pl-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{shop.icon || "🛒"}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          সুপার শপ
                        </span>
                        {shop.delivery && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                            <Truck className="w-3 h-3" /> হোম ডেলিভারি
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-base leading-snug mt-0.5">{shop.name}</h3>
                    </div>
                  </div>
                  {isUserAdded && (
                    <button 
                      onClick={() => handleDelete(shop.id)}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="pl-2 space-y-2 my-3 text-xs text-gray-600">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><b>ঠিকানা:</b> {shop.location}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><b>সময়সূচী:</b> {shop.timing}</span>
                  </p>
                  <p className="flex items-start gap-1.5 bg-emerald-50/50 p-2.5 rounded-xl text-gray-700">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><b>প্রধান পণ্য:</b> {shop.products}</span>
                  </p>
                </div>
              </div>

              <div className="pl-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> {shop.contact}
                </span>
                <a 
                  href={`tel:${shop.contact.replace(/[^0-9]/g, '')}`} 
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
                >
                  কল করুন
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
