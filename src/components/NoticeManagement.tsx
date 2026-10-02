import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Megaphone, Plus, Edit2, Trash2, CheckCircle, XCircle, Pin, Save, X } from 'lucide-react';
import { NoticeItem } from '../types';
import { ListSkeleton } from './home/Skeleton';
import { getNoticeItems, addNoticeItem, updateNoticeItem, deleteNoticeItem } from '../api';

const NoticeManagement: React.FC = () => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{ text: string, color: string, link: string, isActive: boolean, order: number, isPinned?: boolean }>({
    text: '',
    color: 'emerald-400',
    link: '',
    isActive: true,
    order: 0,
    isPinned: false
  });

  useEffect(() => {
    setIsLoading(true);
    const q = collection(db, "notice_items");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: NoticeItem[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as NoticeItem);
      });
      data.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.order - b.order;
      });
      setNotices(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching notices:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddNotice = async () => {
    if (!formData.text.trim()) {
        alert('দয়া করে নোটিশের টেক্সট লিখুন');
        return;
    }
    
    try {
      if (editingId) {
        await updateNoticeItem(editingId, formData);
      } else {
        await addNoticeItem({
          ...formData,
          order: notices.length + 1,
          createdAt: new Date().toISOString()
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ text: '', color: 'emerald-400', link: '', isActive: true, order: 0, isPinned: false });
    } catch (error) {
      console.error("Error saving notice:", error);
    }
  };

  const handleEditClick = (notice: NoticeItem) => {
    setFormData({
      text: notice.text,
      color: notice.color,
      link: notice.link || '',
      isActive: notice.isActive,
      order: notice.order,
      isPinned: notice.isPinned || false
    });
    setEditingId(notice.id);
    setIsAdding(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateNoticeItem(id, { isActive: !currentStatus });
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    try {
      await updateNoticeItem(id, { isPinned: !currentPin });
    } catch (error) {
      console.error("Error toggling pin status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('আপনি কি নিশ্চিত যে এই নোটিশটি মুছতে চান?')) {
        try {
            await deleteNoticeItem(id);
        } catch (error) {
            console.error("Error deleting notice:", error);
        }
    }
  };

  return (
    <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6">
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-500" />
            <span>নোটিশ ম্যানেজমেন্ট (Notice Board)</span>
        </h3>
        <button 
            onClick={() => {
                if (isAdding) {
                    setIsAdding(false);
                    setEditingId(null);
                    setFormData({ text: '', color: 'emerald-400', link: '', isActive: true, order: 0, isPinned: false });
                } else {
                    setIsAdding(true);
                }
            }}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${isAdding ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#006A4E] hover:bg-[#005c43]'}`}
        >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAdding ? 'বাতিল করুন' : 'নতুন নোটিশ যোগ করুন'}</span>
        </button>
      </div>

      {isAdding && (
          <div className="bg-[#121212] p-5 rounded-xl border border-gray-700 mb-6 space-y-4">
              <h4 className="font-bold text-white mb-2">{editingId ? 'নোটিশ আপডেট করুন' : 'নতুন নোটিশ তৈরি করুন'}</h4>
              <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">নোটিশের টেক্সট *</label>
                  <input 
                      type="text" 
                      value={formData.text || ""}
                      onChange={(e) => setFormData({...formData, text: e.target.value})}
                      className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#006A4E]"
                      placeholder="যেমন: উপজেলা প্রশাসনের নতুন নির্দেশিকা প্রকাশ..."
                  />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">লিংক (ঐচ্ছিক)</label>
                      <input 
                          type="text" 
                          value={formData.link || ""}
                          onChange={(e) => setFormData({...formData, link: e.target.value})}
                          className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#006A4E]"
                          placeholder="https://..."
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">বিন্দুর রঙ (Dot Color)</label>
                      <select 
                          value={formData.color || ""}
                          onChange={(e) => setFormData({...formData, color: e.target.value})}
                          className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#006A4E]"
                      >
                          <option value="emerald-400">সবুজ (Emerald)</option>
                          <option value="sky-400">নীল (Sky)</option>
                          <option value="rose-400">লাল (Rose)</option>
                          <option value="amber-400">হলুদ (Amber)</option>
                          <option value="purple-400">বেগুনি (Purple)</option>
                      </select>
                  </div>
              </div>
              <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                      <input 
                          type="checkbox" 
                          id="isActiveNotice"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          className="w-4 h-4 rounded bg-[#1E1E1E] border-gray-700 text-[#006A4E] focus:ring-[#006A4E]"
                      />
                      <label htmlFor="isActiveNotice" className="text-gray-300">সক্রিয় (Active)</label>
                  </div>
                  <div className="flex items-center gap-2">
                      <input 
                          type="checkbox" 
                          id="isPinnedNotice"
                          checked={formData.isPinned}
                          onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
                          className="w-4 h-4 rounded bg-[#1E1E1E] border-gray-700 text-[#006A4E] focus:ring-[#006A4E]"
                      />
                      <label htmlFor="isPinnedNotice" className="text-gray-300">পিন করুন (Pin to Top)</label>
                  </div>
              </div>
              <button 
                  onClick={handleAddNotice}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-[#006A4E] hover:bg-[#005c43] text-white rounded-lg font-medium transition-colors mt-2"
              >
                  <Save className="w-4 h-4" /> {editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
              </button>
          </div>
      )}

      {isLoading ? (
          <ListSkeleton count={4} />
      ) : notices.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-[#121212] rounded-xl border border-gray-800 flex flex-col items-center">
              <Megaphone className="w-12 h-12 mb-4 opacity-20" />
              <p>কোনো নোটিশ পাওয়া যায়নি</p>
          </div>
      ) : (
          <div className="space-y-3">
              {notices.map((notice) => (
                  <div key={notice.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border ${notice.isActive ? 'bg-[#121212] border-gray-700' : 'bg-[#121212]/50 border-gray-800 opacity-60'}`}>
                      <div className="flex items-start gap-3 overflow-hidden mb-3 sm:mb-0">
                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                              notice.color === 'emerald-400' ? 'bg-emerald-400' :
                              notice.color === 'sky-400' ? 'bg-sky-400' :
                              notice.color === 'rose-400' ? 'bg-rose-400' :
                              notice.color === 'amber-400' ? 'bg-amber-400' :
                              'bg-purple-400'
                          }`}></div>
                          <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-white font-medium">{notice.text}</p>
                                  {notice.isPinned && <span className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">Pinned</span>}
                              </div>
                              {notice.link && <a href={notice.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block truncate max-w-[200px] sm:max-w-md">{notice.link}</a>}
                          </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 sm:ml-4 bg-[#1A1A1A] p-1 rounded-lg">
                          <button 
                              onClick={() => handleTogglePin(notice.id, !!notice.isPinned)}
                              className={`p-2 rounded-md transition-colors ${notice.isPinned ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20' : 'text-gray-500 hover:bg-gray-800'}`}
                              title={notice.isPinned ? "আনপিন করুন" : "পিন করুন"}
                          >
                              <Pin className="w-4 h-4" />
                          </button>
                          <button 
                              onClick={() => handleToggleActive(notice.id, notice.isActive)}
                              className={`p-2 rounded-md transition-colors ${notice.isActive ? 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-gray-500 hover:bg-gray-800'}`}
                              title={notice.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                          >
                              {notice.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </button>
                          <button 
                              onClick={() => handleEditClick(notice)}
                              className="p-2 rounded-md text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="এডিট করুন"
                          >
                              <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                              onClick={() => handleDelete(notice.id)}
                              className="p-2 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="মুছে ফেলুন"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default NoticeManagement;
