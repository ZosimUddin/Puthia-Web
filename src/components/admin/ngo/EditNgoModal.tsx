import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { NGO, Project } from '../../../types';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { NGO_CATEGORIES } from '../../../pages/modules/NGOs/constants';

export default function EditNgoModal({ ngo, onClose }: { ngo: NGO; onClose: () => void }) {
  const [formData, setFormData] = useState<NGO>(ngo);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "ngos_list", ngo.id!), { 
        ...formData,
        updatedAt: serverTimestamp()
      });
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error updating NGO');
    }
    setLoading(false);
  };

  const handleProjectUpdate = (index: number, field: keyof Project, value: string) => {
    const updatedProjects = [...(formData.projects || [])];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setFormData({ ...formData, projects: updatedProjects });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...(formData.projects || []), { id: Date.now().toString(), title: '', description: '', status: 'ongoing', duration: '', area: '' }]
    });
  };

  const removeProject = (index: number) => {
    const updated = [...(formData.projects || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, projects: updated });
  };

  const addGalleryImage = () => {
    const url = prompt("ছবির URL দিন:");
    if (url) {
      setFormData({
        ...formData,
        gallery: [...(formData.gallery || []), url]
      });
    }
  };
  
  const addVideo = () => {
    const url = prompt("ভিডিও URL দিন (যেমন YouTube link):");
    if (url) {
      setFormData({
        ...formData,
        videos: [...(formData.videos || []), url]
      });
    }
  };
  
  const addDocument = () => {
    const title = prompt("ডকুমেন্টের নাম দিন:");
    if (!title) return;
    const url = prompt("PDF/ডকুমেন্ট URL দিন:");
    if (url) {
      setFormData({
        ...formData,
        documents: [...(formData.documents || []), { title, url }]
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[10006] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 bg-emerald-600 text-white flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-black">{formData.name} - সম্পাদনা</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800">সাধারণ তথ্য</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="font-black text-slate-800">Verified Badge</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.isVerified || false}
                    onChange={e => setFormData({...formData, isVerified: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <input 
                type="text" 
                value={formData.name || ""} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="এনজিও এর নাম"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <select
                value={formData.category || ""}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              >
                {NGO_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id || ""}>{cat.label}</option>
                ))}
              </select>
              <input 
                type="text" 
                value={formData.registrationNumber || ''} 
                onChange={e => setFormData({...formData, registrationNumber: e.target.value})} 
                placeholder="নিবন্ধন নম্বর"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input 
                type="text" 
                value={formData.establishedYear || ""} 
                onChange={e => setFormData({...formData, establishedYear: e.target.value})} 
                placeholder="প্রতিষ্ঠার বছর"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input 
                type="text" 
                value={formData.location || ""} 
                onChange={e => setFormData({...formData, location: e.target.value})} 
                placeholder="ইউনিয়ন"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input 
                type="text" 
                value={formData.workingArea || ''} 
                onChange={e => setFormData({...formData, workingArea: e.target.value})} 
                placeholder="কার্যক্ষেত্র"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <textarea 
                value={formData.shortDescription || ''} 
                onChange={e => setFormData({...formData, shortDescription: e.target.value})} 
                placeholder="সংক্ষিপ্ত পরিচিতি"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl md:col-span-2"
                rows={2}
              />
              <textarea 
                value={formData.description || ""} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="বিস্তারিত বিবরণ"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl md:col-span-2"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800">যোগাযোগ ও অন্যান্য</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                value={formData.phone || ""} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                placeholder="মোবাইল নম্বর"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input 
                type="email" 
                value={formData.email || ''} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="ইমেইল"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input 
                type="text" 
                value={formData.address || ""} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                placeholder="ঠিকানা"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl md:col-span-2"
              />
              <input 
                type="text" 
                value={formData.officeTime || ''} 
                onChange={e => setFormData({...formData, officeTime: e.target.value})} 
                placeholder="অফিস সময়"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input 
                type="text" 
                value={formData.googleMapUrl || ''} 
                onChange={e => setFormData({...formData, googleMapUrl: e.target.value})} 
                placeholder="Google Map Location URL"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input 
                type="url" 
                value={formData.website || ''} 
                onChange={e => setFormData({...formData, website: e.target.value})} 
                placeholder="ওয়েবসাইট URL"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input 
                type="url" 
                value={formData.facebook || ''} 
                onChange={e => setFormData({...formData, facebook: e.target.value})} 
                placeholder="Facebook Page URL"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input 
                type="url" 
                value={formData.logoUrl || ''} 
                onChange={e => setFormData({...formData, logoUrl: e.target.value})} 
                placeholder="লোগো URL"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input 
                type="url" 
                value={formData.coverUrl || ''} 
                onChange={e => setFormData({...formData, coverUrl: e.target.value})} 
                placeholder="কভার ছবি URL"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800">প্রকল্প</h3>
              <button onClick={addProject} className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold text-sm">
                <Plus size={16} /> নতুন প্রকল্প
              </button>
            </div>
            {formData.projects?.map((proj, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                <button onClick={() => removeProject(i)} className="absolute top-4 right-4 text-rose-500"><Trash2 size={16}/></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                  <input type="text" value={proj.title || ""} onChange={e => handleProjectUpdate(i, 'title', e.target.value)} placeholder="প্রকল্পের নাম" className="w-full px-3 py-2 border rounded-xl" />
                  <input type="text" value={proj.area || ""} onChange={e => handleProjectUpdate(i, 'area', e.target.value)} placeholder="এলাকা" className="w-full px-3 py-2 border rounded-xl" />
                  <input type="text" value={proj.duration || ""} onChange={e => handleProjectUpdate(i, 'duration', e.target.value)} placeholder="সময়কাল" className="w-full px-3 py-2 border rounded-xl" />
                  <select value={proj.status || ""} onChange={e => handleProjectUpdate(i, 'status', e.target.value)} className="w-full px-3 py-2 border rounded-xl">
                    <option value="ongoing">চলমান</option>
                    <option value="completed">সম্পন্ন</option>
                    <option value="pending">অপেক্ষমান</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800">মিডিয়া (গ্যালারি, ভিডিও, পিডিএফ)</h3>
            </div>
            <div className="space-y-6">
              <div>
                <button onClick={addGalleryImage} className="mb-2 flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl font-bold text-sm">
                  <Plus size={16} /> ছবি যোগ করুন
                </button>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.gallery?.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => {
                          const updated = [...(formData.gallery || [])];
                          updated.splice(i, 1);
                          setFormData({...formData, gallery: updated});
                        }}
                        className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button onClick={addVideo} className="mb-2 flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl font-bold text-sm">
                  <Plus size={16} /> ভিডিও যোগ করুন
                </button>
                <ul className="space-y-2">
                  {formData.videos?.map((url, i) => (
                    <li key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="truncate flex-1 mr-4">{url}</span>
                      <button 
                        onClick={() => {
                          const updated = [...(formData.videos || [])];
                          updated.splice(i, 1);
                          setFormData({...formData, videos: updated});
                        }}
                        className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button onClick={addDocument} className="mb-2 flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl font-bold text-sm">
                  <Plus size={16} /> পিডিএফ/ডকুমেন্ট যোগ করুন
                </button>
                <ul className="space-y-2">
                  {formData.documents?.map((docItem, i) => (
                    <li key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="truncate flex-1 font-bold">{docItem.title}</span>
                      <button 
                        onClick={() => {
                          const updated = [...(formData.documents || [])];
                          updated.splice(i, 1);
                          setFormData({...formData, documents: updated});
                        }}
                        className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black shadow-sm"
          >
            বাতিল
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/30 flex items-center gap-2"
          >
            {loading ? 'সংরক্ষণ হচ্ছে...' : <><Save size={18} /> সংরক্ষণ করুন</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
