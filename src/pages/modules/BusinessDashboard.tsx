import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Users, MessageSquare, Star, 
  ArrowLeft, Store, Settings, TrendingUp, 
  Eye, Heart, PhoneCall, Share2, Plus,
  ChevronRight, Edit3, Trash2, CheckCircle2,
  AlertCircle, Clock, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { Business, Review } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const BusinessDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalReviews: 0,
    avgRating: 0,
    totalFavorites: 0
  });

  const chartData = [
    { name: 'Sat', views: 400, reviews: 24 },
    { name: 'Sun', views: 300, reviews: 13 },
    { name: 'Mon', views: 200, reviews: 98 },
    { name: 'Tue', views: 278, reviews: 39 },
    { name: 'Wed', views: 189, reviews: 48 },
    { name: 'Thu', views: 239, reviews: 38 },
    { name: 'Fri', views: 349, reviews: 43 },
  ];

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const bQuery = query(collection(db, "businesses"), where("userId", "==", user.uid));
        const bSnapshot = await getDocs(bQuery);
        const bData = bSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
        setBusinesses(bData);

        // Fetch reviews for all user's businesses
        if (bData.length > 0) {
          const businessIds = bData.map(b => b.id);
          const rQuery = query(
            collection(db, "reviews"), 
            where("targetId", "in", businessIds),
            orderBy("createdAt", "desc"),
            limit(10)
          );
          const rSnapshot = await getDocs(rQuery);
          setReviews(rSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));

          // Calculate stats
          const totalViews = bData.reduce((acc, b) => acc + (b.reportCount || 0), 0); // Using reportCount as placeholder for views
          const totalReviews = bData.reduce((acc, b) => acc + (b.reviewCount || 0), 0);
          const avgRating = bData.length > 0 ? bData.reduce((acc, b) => acc + b.rating, 0) / bData.length : 0;
          
          setStats({
            totalViews,
            totalReviews,
            avgRating,
            totalFavorites: 0 // Fetch from user_business_favorites if needed
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/business')}
              className="p-2.5 bg-slate-50 text-slate-400 rounded-2xl hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800">বিজনেস ড্যাশবোর্ড</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">আপনার ব্যবসার তথ্য ও ফলাফল পরিচালনা করুন</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/add-business')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
            >
              <Plus size={16} />
              নতুন ব্যবসা
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'মোট ভিউ', value: stats.totalViews, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'মোট রিভিউ', value: stats.totalReviews, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'গড় রেটিং', value: stats.avgRating.toFixed(1), icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'সেভ করেছেন', value: stats.totalFavorites, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 transition-all"
            >
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
              <span className="text-3xl font-black text-slate-800">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-800">পারফরম্যান্স ট্র্যাকার</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">গত ৭ দিনের ব্যবসার ফলাফল</p>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button className="px-4 py-2 bg-white text-emerald-600 rounded-lg text-[10px] font-black uppercase shadow-sm">Views</button>
                <button className="px-4 py-2 text-slate-400 text-[10px] font-black uppercase">Reviews</button>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    labelStyle={{ fontWeight: 900, fontSize: '12px', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col">
            <h2 className="text-2xl font-black text-slate-800 mb-8">সাম্প্রতিক রিভিউ</h2>
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {reviews.length > 0 ? reviews.map((review, i) => (
                <div key={review.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={10} fill={idx < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed mb-3">"{review.comment}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-600">
                      {review.userName.charAt(0)}
                    </div>
                    <span className="text-[10px] font-black text-slate-800">{review.userName}</span>
                  </div>
                </div>
              )) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                  <MessageSquare className="text-slate-200 mb-4" size={48} />
                  <p className="text-xs font-bold text-slate-400 italic">এখনো কোন রিভিউ নেই</p>
                </div>
              )}
            </div>
            <button className="w-full mt-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors">
              সব রিভিউ দেখুন
            </button>
          </div>
        </div>

        {/* Business List Management */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-800">আমার ব্যবসাগুলো</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">আপনার নিবন্ধিত প্রতিষ্ঠানের তালিকা</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businesses.map((business) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={business.id}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                      {business.logoUrl ? (
                        <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="text-slate-200" size={32} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">{business.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          business.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {business.status === 'approved' ? 'Approved' : 'Pending Approval'}
                        </span>
                        {business.isVerified && (
                          <div className="p-1 bg-blue-50 text-blue-500 rounded-full">
                            <CheckCircle2 size={12} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/edit-business/${business.id}`)}
                      className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">খোলার সময়</span>
                    <div className="flex items-center gap-2 mt-1 font-bold text-slate-700 text-sm">
                      <Clock size={14} className="text-emerald-500" />
                      {business.openingHours?.open} - {business.openingHours?.close}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">অবস্থান</span>
                    <div className="flex items-center gap-2 mt-1 font-bold text-slate-700 text-sm">
                      <MapPin size={14} className="text-rose-500" />
                      {business.union}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/business')}
                  className="mt-4 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest group-hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  পাবলিক ভিউ দেখুন <ExternalLink size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const ExternalLink = ({ size }: { size: number }) => <Share2 size={size} />;

export default BusinessDashboard;
