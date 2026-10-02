import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Store, CheckCircle2, XCircle, Search, Clock } from 'lucide-react';
import { getAllBusinesses, updateBusinessStatus } from '../../api';

const BusinessApproval: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlStatus = searchParams.get('status');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (urlStatus && ['all', 'pending', 'approved', 'rejected'].includes(urlStatus)) {
      setFilter(urlStatus as any);
    }
  }, [urlStatus]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const data = await getAllBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateBusinessStatus(id, status);
      fetchBusinesses();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-emerald-950">ব্যবসা অনুমোদন</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">নতুন ব্যবসার আবেদন যাচাই ও অনুমোদন করুন</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filter || ""}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">সকল</option>
            <option value="pending">অপেক্ষমাণ</option>
            <option value="approved">অনুমোদিত</option>
            <option value="rejected">বাতিলকৃত</option>
          </select>
          <div className="relative w-full max-w-[200px]">
            <input
              type="text"
              placeholder="খুঁজুন..."
              value={searchTerm || ""}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business, index) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Store size={24} />
                </div>
                {business.status === 'pending' && <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md"><Clock size={12} /> অপেক্ষমাণ</span>}
                {business.status === 'approved' && <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md"><CheckCircle2 size={12} /> অনুমোদিত</span>}
                {business.status === 'rejected' && <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md"><XCircle size={12} /> বাতিল</span>}
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-1">{business.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{business.category}</p>
              
              <div className="space-y-2 mb-6 flex-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">মালিক:</span>
                  <span className="font-medium text-gray-700">{business.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ফোন:</span>
                  <span className="font-medium text-gray-700">{business.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ঠিকানা:</span>
                  <span className="font-medium text-gray-700 text-right max-w-[60%]">{business.address}</span>
                </div>
              </div>
              
              {business.status === 'pending' && (
                <div className="flex items-center gap-3 mt-auto">
                  <button
                    onClick={() => handleStatusUpdate(business.id, 'rejected')}
                    className="flex-1 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    বাতিল করুন
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(business.id, 'approved')}
                    className="flex-1 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    অনুমোদন দিন
                  </button>
                </div>
              )}
            </motion.div>
          ))}
          {filteredBusinesses.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">কোন ব্যবসা পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessApproval;
