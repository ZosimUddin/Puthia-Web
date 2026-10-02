import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Save, Image as ImageIcon, Upload, Trash2, Globe } from 'lucide-react';
import { getAllSubMenuPages, updateSubMenuPage } from '../../api';
import { SubMenuPageData } from '../../types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';

const PageManagement: React.FC = () => {
  const [pages, setPages] = useState<SubMenuPageData[]>([]);
  const [selectedPage, setSelectedPage] = useState<SubMenuPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const data = await getAllSubMenuPages();
    setPages(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    setSaving(true);
    try {
      const { id, ...updates } = selectedPage;
      await updateSubMenuPage(id, updates);
      alert('পেজ সফলভাবে সেভ হয়েছে!');
      fetchPages();
    } catch (error) {
      console.error(error);
      alert('Error saving page.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedPage) return;
    const file = e.target.files[0];
    
    try {
      const storageRef = ref(storage, `pages/${selectedPage.slug}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setSelectedPage({ ...selectedPage, coverImage: url });
    } catch (error) {
      console.error("Error uploading image: ", error);
      alert("ছবি আপলোড করতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar for Pages */}
      <div className="w-full lg:w-1/3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm h-[calc(100vh-120px)] overflow-y-auto">
        <h2 className="text-xl font-black text-gray-800 mb-4 px-2">সকল পেজ</h2>
        {loading ? (
          <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>
        ) : (
          <div className="space-y-2">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPage(p)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 ${selectedPage?.id === p.id ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50 text-gray-600'}`}
              >
                <FileText size={18} />
                <span>{p.title}</span>
              </button>
            ))}
            {pages.length === 0 && <p className="text-gray-500 text-sm p-4">কোন পেজ পাওয়া যায়নি।</p>}
          </div>
        )}
      </div>

      {/* Editor Area */}
      <div className="w-full lg:w-2/3">
        {selectedPage ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <Globe className="text-emerald-500" /> {selectedPage.title}
              </h1>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={18} />}
                সেভ করুন
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">পেজের নাম (Title)</label>
                <input 
                  type="text" 
                  value={selectedPage.title}
                  onChange={(e) => setSelectedPage({...selectedPage, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">পরিচিতি / বিবরণ (Description)</label>
                <textarea 
                  rows={6}
                  value={selectedPage.description}
                  onChange={(e) => setSelectedPage({...selectedPage, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon size={18} className="text-gray-400" /> কাভার ছবি
                </label>
                <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 aspect-video flex items-center justify-center">
                  {selectedPage.coverImage ? (
                    <>
                      <img src={selectedPage.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100">
                          <Upload size={18} /> ছবি পরিবর্তন করুন
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer text-gray-500 flex flex-col items-center gap-3 hover:text-emerald-600 transition-colors">
                      <div className="p-4 bg-white rounded-full shadow-sm"><Upload size={24} /></div>
                      <span className="font-bold text-sm">কাভার ছবি আপলোড করুন</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">যোগাযোগের নম্বর</label>
                  <input 
                    type="text" 
                    value={selectedPage.callNumber || ''}
                    onChange={(e) => setSelectedPage({...selectedPage, callNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="যেমন: 01700-000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ওয়েবসাইট</label>
                  <input 
                    type="url" 
                    value={selectedPage.websiteUrl || ''}
                    onChange={(e) => setSelectedPage({...selectedPage, websiteUrl: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
            <div className="text-center">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-500">বাম পাশ থেকে একটি পেজ নির্বাচন করুন</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageManagement;
