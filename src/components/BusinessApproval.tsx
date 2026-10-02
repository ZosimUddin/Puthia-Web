import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Store, CheckCircle, XCircle, MapPin, Phone, User, Edit, Trash2, Star, ShieldCheck } from 'lucide-react';

interface LocalShop {
  id: string;
  name: string;
  owner: string;
  category: string;
  union: string;
  address: string;
  phone: string;
  image: string;
  verified: boolean;
  featured?: boolean;
  createdAt: string;
}

export default function BusinessApproval() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [businesses, setBusinesses] = useState<LocalShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "local_shops"), where("verified", "==", activeTab === 'approved'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: LocalShop[] = [];
      snapshot.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() } as LocalShop);
      });
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBusinesses(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching businesses:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিত যে এই ব্যবসাটি অনুমোদন করতে চান?")) {
      try {
        await updateDoc(doc(db, "local_shops", id), { verified: true });
        setBusinesses(prev => prev.filter(b => b.id !== id));
      } catch (error) {
        console.error("Error approving business:", error);
        alert("অনুমোদন করতে সমস্যা হয়েছে।");
      }
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিত যে এই ব্যবসাটি বাতিল/ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "local_shops", id));
        setBusinesses(prev => prev.filter(b => b.id !== id));
      } catch (error) {
        console.error("Error rejecting business:", error);
        alert("বাতিল করতে সমস্যা হয়েছে।");
      }
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
        await updateDoc(doc(db, "local_shops", id), { featured: !currentFeatured });
        setBusinesses(prev => prev.map(b => b.id === id ? { ...b, featured: !currentFeatured } : b));
    } catch(err) {
        console.error(err);
        alert('ফিচার আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-gray-800 gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-amber-500" />
            <span>ব্যবসা ম্যানেজমেন্ট (Business Management)</span>
        </h3>
        
        <div className="flex bg-[#121212] p-1 rounded-xl border border-gray-800">
            <button 
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
                অপেক্ষমান
            </button>
            <button 
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'approved' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
                অনুমোদিত
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">লোড হচ্ছে...</div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-[#121212] rounded-xl border border-gray-800 flex flex-col items-center justify-center">
          <Store className="w-12 h-12 mb-4 opacity-20" />
          <p>কোনো তথ্য পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {businesses.map(biz => (
            <div key={biz.id} className="bg-[#121212] border border-gray-800 rounded-xl overflow-hidden flex">
                <div className="w-32 h-full min-h-[160px] bg-gray-800 shrink-0 relative">
                    {biz.image ? (
                        <img src={biz.image} alt={biz.name} className="w-full h-full object-cover opacity-80" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Store className="w-8 h-8" />
                        </div>
                    )}
                    {biz.featured && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-white p-1 rounded-md shadow-lg">
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                    )}
                </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-white flex items-center gap-1">
                        {biz.name} 
                        {biz.verified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                    </h4>
                    {activeTab === 'approved' && (
                        <button onClick={() => toggleFeatured(biz.id, !!biz.featured)} className={`p-1.5 rounded-lg ${biz.featured ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-800 text-gray-400'}`}>
                            <Star className="w-4 h-4" />
                        </button>
                    )}
                </div>
                
                <div className="space-y-1 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User className="w-4 h-4 shrink-0" />
                        <span className="truncate">{biz.owner}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{biz.address}, {biz.union}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Phone className="w-4 h-4 shrink-0" />
                        <span className="truncate">{biz.phone}</span>
                    </div>
                </div>
                
                <div className="mt-auto flex gap-2">
                    {activeTab === 'pending' ? (
                        <>
                            <button onClick={() => handleApprove(biz.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors font-medium text-sm">
                                <CheckCircle className="w-4 h-4" /> অনুমোদন
                            </button>
                            <button onClick={() => handleReject(biz.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors font-medium text-sm">
                                <XCircle className="w-4 h-4" /> বাতিল
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors font-medium text-sm">
                                <Edit className="w-4 h-4" /> এডিট
                            </button>
                            <button onClick={() => handleReject(biz.id)} className="flex items-center justify-center px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
