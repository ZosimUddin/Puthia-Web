import React, { useState, useEffect } from 'react';
import { copyToClipboard as safeCopyToClipboard } from '../../utils/clipboard';
import { 
  Image as ImageIcon, Video, FileText, Folder, Layers, Trash2, Upload, 
  Plus, Copy, Check, Eye, X, Edit2, Zap, FolderPlus, RefreshCw, ChevronRight, FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, getDocs, addDoc, deleteDoc, doc, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { logAuditEvent } from '../../utils/audit';

// Canvas-based image compression helper
const compressImage = (base64Str: string, quality: number = 0.6): Promise<{ url: string, sizeKB: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Limit max dimensions to 1200px for web optimization
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ url: base64Str, sizeKB: Math.round(base64Str.length / 1024) });
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      const approxSize = Math.round((compressedDataUrl.length - 814) / 1.37 / 1024); // approx KB from base64 length
      resolve({ url: compressedDataUrl, sizeKB: approxSize });
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
};

export default function MediaManagement() {
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'pdf' | 'file'>('all');
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);

  // Folders state
  const [selectedFolder, setSelectedFolder] = useState<string>('Root');
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  // Form states
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'image' as 'image' | 'video' | 'pdf' | 'file',
    url: '',
    size: 0,
    folder: 'Root',
    compressOnUpload: true,
  });
  const [saving, setSaving] = useState(false);

  // Detail edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isMovingFolder, setIsMovingFolder] = useState(false);
  const [moveFolderSelected, setMoveFolderSelected] = useState('Root');
  const [customMoveFolderInput, setCustomMoveFolderInput] = useState('');
  
  // Replace file states
  const [replacingFile, setReplacingFile] = useState<any | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'media_files'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setFiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Compute all folders
  const allFolders = Array.from(new Set(['Root', ...customFolders, ...files.map(f => f.folder || 'Root')]));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let detectedType: 'image' | 'video' | 'pdf' | 'file' = 'file';
    if (file.type.startsWith('image/')) detectedType = 'image';
    else if (file.type.startsWith('video/')) detectedType = 'video';
    else if (file.type === 'application/pdf') detectedType = 'pdf';

    const reader = new FileReader();
    reader.onloadend = async () => {
      let url = reader.result as string;
      let sizeKB = Math.round(file.size / 1024);

      if (detectedType === 'image' && uploadForm.compressOnUpload) {
        try {
          const compResult = await compressImage(url, 0.6);
          url = compResult.url;
          sizeKB = compResult.sizeKB;
        } catch (err) {
          console.error("Compression failed:", err);
        }
      }

      setUploadForm(prev => ({
        ...prev,
        name: file.name.split('.')[0],
        type: detectedType,
        url: url,
        size: sizeKB,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    let detectedType: 'image' | 'video' | 'pdf' | 'file' = 'file';
    if (file.type.startsWith('image/')) detectedType = 'image';
    else if (file.type.startsWith('video/')) detectedType = 'video';
    else if (file.type === 'application/pdf') detectedType = 'pdf';

    const reader = new FileReader();
    reader.onloadend = async () => {
      let url = reader.result as string;
      let sizeKB = Math.round(file.size / 1024);

      if (detectedType === 'image' && uploadForm.compressOnUpload) {
        try {
          const compResult = await compressImage(url, 0.6);
          url = compResult.url;
          sizeKB = compResult.sizeKB;
        } catch (err) {
          console.error("Compression failed:", err);
        }
      }

      setUploadForm(prev => ({
        ...prev,
        name: file.name.split('.')[0],
        type: detectedType,
        url: url,
        size: sizeKB,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name.trim() || !uploadForm.url.trim()) {
      alert("দয়া করে নাম এবং ফাইল/ইউআরএল প্রদান করুন।");
      return;
    }

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'media_files'), {
        name: uploadForm.name.trim(),
        type: uploadForm.type,
        url: uploadForm.url.trim(),
        size: uploadForm.size || 0,
        folder: uploadForm.folder,
        createdAt: serverTimestamp(),
      });

      await logAuditEvent('create_media', 'media_files', docRef.id, { name: uploadForm.name, folder: uploadForm.folder });
      setUploadForm({ name: '', type: 'image', url: '', size: 0, folder: 'Root', compressOnUpload: true });
      setShowAddForm(false);
      fetchFiles();
    } catch (error) {
      console.error("Error adding file:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${name}" ফাইলটি স্থায়ীভাবে মুছে ফেলতে চান?`)) return;
    try {
      await deleteDoc(doc(db, 'media_files', id));
      setFiles(files.filter(f => f.id !== id));
      if (selectedFile?.id === id) {
        setSelectedFile(null);
      }
      await logAuditEvent('delete_media', 'media_files', id, { name });
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleRename = async () => {
    if (!selectedFile || !editNameValue.trim()) return;
    try {
      const docRef = doc(db, 'media_files', selectedFile.id);
      await updateDoc(docRef, { name: editNameValue.trim() });
      await logAuditEvent('rename_media', 'media_files', selectedFile.id, { oldName: selectedFile.name, newName: editNameValue.trim() });
      
      setSelectedFile({ ...selectedFile, name: editNameValue.trim() });
      setIsEditingName(false);
      fetchFiles();
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  };

  const handleMoveFolder = async () => {
    if (!selectedFile) return;
    const targetFolder = moveFolderSelected === 'custom' ? customMoveFolderInput.trim() : moveFolderSelected;
    if (!targetFolder) return;

    try {
      const docRef = doc(db, 'media_files', selectedFile.id);
      await updateDoc(docRef, { folder: targetFolder });
      await logAuditEvent('move_media_folder', 'media_files', selectedFile.id, { name: selectedFile.name, from: selectedFile.folder || 'Root', to: targetFolder });
      
      if (!customFolders.includes(targetFolder) && targetFolder !== 'Root') {
        setCustomFolders([...customFolders, targetFolder]);
      }
      
      setSelectedFile({ ...selectedFile, folder: targetFolder });
      setIsMovingFolder(false);
      setCustomMoveFolderInput('');
      fetchFiles();
    } catch (error) {
      console.error("Error moving folder:", error);
    }
  };

  const handleReplaceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let detectedType: 'image' | 'video' | 'pdf' | 'file' = 'file';
    if (file.type.startsWith('image/')) detectedType = 'image';
    else if (file.type.startsWith('video/')) detectedType = 'video';
    else if (file.type === 'application/pdf') detectedType = 'pdf';

    const reader = new FileReader();
    reader.onloadend = async () => {
      let url = reader.result as string;
      let sizeKB = Math.round(file.size / 1024);

      if (detectedType === 'image') {
        try {
          const compResult = await compressImage(url, 0.6);
          url = compResult.url;
          sizeKB = compResult.sizeKB;
        } catch (err) {
          console.error("Compression failed:", err);
        }
      }

      setReplacingFile({
        url,
        size: sizeKB,
        type: detectedType,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const confirmReplace = async () => {
    if (!selectedFile || !replacingFile) return;
    try {
      const docRef = doc(db, 'media_files', selectedFile.id);
      await updateDoc(docRef, {
        url: replacingFile.url,
        size: replacingFile.size,
        type: replacingFile.type,
      });

      await logAuditEvent('replace_media', 'media_files', selectedFile.id, { name: selectedFile.name });
      
      setSelectedFile({
        ...selectedFile,
        url: replacingFile.url,
        size: replacingFile.size,
        type: replacingFile.type
      });
      setReplacingFile(null);
      fetchFiles();
    } catch (error) {
      console.error("Error replacing file:", error);
    }
  };

  const handleCompressExisting = async () => {
    if (!selectedFile || selectedFile.type !== 'image') return;
    try {
      const result = await compressImage(selectedFile.url, 0.5);
      if (result.sizeKB >= (selectedFile.size || 0)) {
        alert("ফাইলটি ইতিমধ্যে যথেষ্ট কমপ্রেসড অবস্থায় রয়েছে।");
        return;
      }
      
      if (confirm(`ইমেজটি কমপ্রেস করার ফলে সাইজ ${selectedFile.size || '??'} KB থেকে কমে ${result.sizeKB} KB হবে। আপনি কি পরিবর্তনটি সংরক্ষণ করতে চান?`)) {
        const docRef = doc(db, 'media_files', selectedFile.id);
        await updateDoc(docRef, {
          url: result.url,
          size: result.sizeKB
        });
        await logAuditEvent('compress_media', 'media_files', selectedFile.id, { name: selectedFile.name, originalSize: selectedFile.size, newSize: result.sizeKB });
        
        setSelectedFile({
          ...selectedFile,
          url: result.url,
          size: result.sizeKB
        });
        fetchFiles();
      }
    } catch (err) {
      console.error("Compression failed:", err);
      alert("কমপ্রেশন সম্পন্ন করা যায়নি।");
    }
  };

  const createNewFolder = () => {
    const name = newFolderNameInput.trim();
    if (!name) return;
    if (!customFolders.includes(name) && name !== 'Root') {
      setCustomFolders([...customFolders, name]);
    }
    setSelectedFolder(name);
    setNewFolderNameInput('');
    setShowNewFolderModal(false);
  };

  const copyToClipboard = async (id: string, url: string) => {
    await safeCopyToClipboard(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs = [
    { id: 'all', label: 'মিডিয়া লাইব্রেরি', icon: Layers },
    { id: 'image', label: 'ইমেজ ম্যানেজার', icon: ImageIcon },
    { id: 'video', label: 'ভিডিও ম্যানেজার', icon: Video },
    { id: 'pdf', label: 'PDF ম্যানেজার', icon: FileText },
    { id: 'file', label: 'ফাইল ম্যানেজার', icon: Folder },
  ] as const;

  // Filter files based on tab & folder selection
  const filteredFiles = files.filter(f => {
    const matchesTab = activeTab === 'all' ? true : f.type === activeTab;
    const fileFolder = f.folder || 'Root';
    const matchesFolder = fileFolder === selectedFolder;
    return matchesTab && matchesFolder;
  });

  // Unique subfolders within current active tab
  const activeSubfolders = Array.from(new Set(
    files
      .filter(f => activeTab === 'all' ? true : f.type === activeTab)
      .map(f => f.folder || 'Root')
  )).filter(fol => fol !== 'Root');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800">মিডিয়া লাইব্রেরি ও ফাইল কন্ট্রোল</h2>
          <p className="text-xs font-bold text-slate-400 mt-1">সব ধরনের মিডিয়া ফাইল এখান থেকে আপলোড, কমপ্রেস ও ফোল্ডারে গুছিয়ে রাখুন।</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-[16px] text-xs font-black transition-all"
          >
            <FolderPlus size={16} />
            নতুন ফোল্ডার
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-[16px] text-xs font-black transition-all shadow-sm"
          >
            <Plus size={16} />
            {showAddForm ? 'ফর্ম বন্ধ করুন' : 'নতুন ফাইল আপলোড'}
          </button>
        </div>
      </div>

      {/* Add File Collapsible Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-700 border-b pb-2 mb-2">নতুন ফাইল আপলোড বা লিঙ্ক যুক্ত করুন</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Drag and Drop Zone */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-[24px] p-6 text-center bg-slate-50/50 transition-all flex flex-col justify-center items-center gap-2 cursor-pointer relative"
                >
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload size={32} className="text-slate-400" />
                  <p className="text-xs font-bold text-slate-600">কম্পিউটার থেকে ড্র্যাগ ও ড্রপ করুন অথবা এখানে ক্লিক করুন</p>
                  <p className="text-[10px] font-bold text-slate-400">ইমেজ হলে স্বয়ংক্রিয়ভাবে কমপ্রেস হবে।</p>
                </div>

                {/* Text Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">ফাইলের নাম</label>
                    <input 
                      type="text"
                      value={uploadForm.name || ""}
                      onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                      placeholder="ফাইলের নাম লিখুন"
                      className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white focus:border-emerald-500 focus:outline-none font-bold text-slate-700"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">ফাইলের ধরন</label>
                      <select 
                        value={uploadForm.type || ""}
                        onChange={e => setUploadForm({ ...uploadForm, type: e.target.value as any })}
                        className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white focus:border-emerald-500 focus:outline-none font-bold text-slate-700"
                      >
                        <option value="image">ইমেজ</option>
                        <option value="video">ভিডিও</option>
                        <option value="pdf">পিডিএফ (PDF)</option>
                        <option value="file">অন্যান্য ফাইল</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">টার্গেট ফোল্ডার</label>
                      <select 
                        value={uploadForm.folder || ""}
                        onChange={e => setUploadForm({ ...uploadForm, folder: e.target.value })}
                        className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white focus:border-emerald-500 focus:outline-none font-bold text-slate-700"
                      >
                        {allFolders.map(fol => (
                          <option key={fol} value={fol || ""}>{fol === 'Root' ? 'মূল ডিরেক্টরি (Root)' : fol}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={uploadForm.compressOnUpload}
                        onChange={e => setUploadForm({ ...uploadForm, compressOnUpload: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      আপলোডের সময় সাইজ কমপ্রেস (অপ্টিমাইজ) করুন
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">ফাইল ইউআরএল / লিঙ্ক (অথবা ড্রপ করা ফাইল ডাটা)</label>
                    <input 
                      type="text"
                      value={uploadForm.url || ""}
                      onChange={e => setUploadForm({ ...uploadForm, url: e.target.value })}
                      placeholder="https://example.com/image.jpg বা সরাসরি ফাইল ড্রপ করুন"
                      className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white focus:border-emerald-500 focus:outline-none font-bold text-slate-700 truncate"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setUploadForm({ name: '', type: 'image', url: '', size: 0, folder: 'Root', compressOnUpload: true });
                    setShowAddForm(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-[12px] text-xs font-black transition-all shadow-sm"
                >
                  {saving ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-xl border border-slate-100"
            >
              <h3 className="text-sm font-black text-slate-800 mb-3">নতুন ফোল্ডার তৈরি করুন</h3>
              <input 
                type="text"
                value={newFolderNameInput || ""}
                onChange={e => setNewFolderNameInput(e.target.value)}
                placeholder="যেমন: Banner-Images"
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold mb-4"
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  বাতিল
                </button>
                <button 
                  onClick={createNewFolder}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black"
                >
                  তৈরি করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedFolder('Root'); // Reset folder selection when tab changes
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-[16px] text-xs font-black transition-all ${
                activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Directory Explorer / Folder Navigation */}
      <div className="bg-white px-6 py-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 overflow-x-auto py-1">
          <span className="text-slate-400">বর্তমান ডিরেক্টরি:</span>
          <button 
            onClick={() => setSelectedFolder('Root')}
            className={`px-2.5 py-1 rounded-md transition-all ${selectedFolder === 'Root' ? 'bg-emerald-50 text-emerald-700 font-black' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            Root
          </button>
          {selectedFolder !== 'Root' && (
            <>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-black">
                {selectedFolder}
              </span>
            </>
          )}
        </div>

        {/* Dynamic empty state or quick filter options */}
        {allFolders.length > 1 && (
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-1">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">ফোল্ডার লিস্ট:</span>
            {allFolders.map(fol => (
              <button
                key={fol}
                onClick={() => setSelectedFolder(fol)}
                className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 transition-all ${
                  selectedFolder === fol ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {fol === 'Root' ? '📁 Root' : `📁 ${fol}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Files & Folder Grid */}
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-sm font-bold text-slate-400">লোডিং...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Show folders first inside active directory if we are at Root */}
            {selectedFolder === 'Root' && activeSubfolders.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">সাব-ফোল্ডার </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {activeSubfolders.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setSelectedFolder(sub)}
                      className="p-4 bg-amber-50/40 hover:bg-amber-50 border border-amber-100 hover:border-amber-200 rounded-[20px] transition-all flex items-center gap-3 text-left shadow-sm group"
                    >
                      <div className="bg-amber-100 text-amber-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
                        <FolderOpen size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-amber-900 truncate">{sub}</p>
                        <p className="text-[10px] font-bold text-amber-500 mt-0.5">
                          {files.filter(f => f.folder === sub).length} ফাইল
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Files Grid */}
            <div>
              {selectedFolder === 'Root' && activeSubfolders.length > 0 && (
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 mt-6">ফাইল </h3>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredFiles.map(file => {
                  const isImage = file.type === 'image' || (file.url && file.url.startsWith('data:image/'));
                  return (
                    <div key={file.id} className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-[20px] border border-slate-100 relative group flex flex-col justify-between h-48 transition-all shadow-sm">
                      {/* Preview Container */}
                      <div className="w-full h-28 bg-slate-200/50 rounded-xl overflow-hidden flex items-center justify-center relative">
                        {isImage ? (
                          <img 
                            src={file.url} 
                            alt={file.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            referrerPolicy="no-referrer"
                          />
                        ) : file.type === 'video' ? (
                          <Video size={36} className="text-emerald-500" />
                        ) : file.type === 'pdf' ? (
                          <FileText size={36} className="text-rose-500" />
                        ) : (
                          <FileText size={36} className="text-blue-500" />
                        )}
                        
                        {/* Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                          <button
                            onClick={() => {
                              setSelectedFile(file);
                              setEditNameValue(file.name);
                              setMoveFolderSelected(file.folder || 'Root');
                            }}
                            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-all"
                            title="বিস্তারিত ও অপশনস"
                          >
                            <Eye size={14} className="text-slate-700" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(file.id, file.url)}
                            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-all"
                            title="লিঙ্ক কপি করুন"
                          >
                            {copiedId === file.id ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} className="text-slate-700" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="mt-2 text-center">
                        <p className="text-xs font-black text-slate-700 truncate px-1" title={file.name}>{file.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{file.size ? `${file.size} KB` : 'সাইজ অজানা'}</p>
                      </div>

                      {/* Absolute Delete Button */}
                      <button 
                        onClick={() => handleDelete(file.id, file.name)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
                {filteredFiles.length === 0 && (
                  <div className="col-span-full text-center py-16 bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200">
                    <Layers className="mx-auto text-slate-300 mb-2" size={40} />
                    <p className="text-xs font-bold text-slate-400">এই ফোল্ডারে কোনো ফাইল পাওয়া যায়নি।</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Details Modal */}
      <AnimatePresence>
        {selectedFile && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] max-w-2xl w-full p-6 shadow-2xl border border-slate-100 relative overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setIsEditingName(false);
                  setIsMovingFolder(false);
                  setReplacingFile(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all z-10"
              >
                <X size={18} />
              </button>

              {/* Title / Renaming Section */}
              <div className="mb-4 pr-8">
                {isEditingName ? (
                  <div className="flex gap-2 max-w-md">
                    <input 
                      type="text"
                      value={editNameValue || ""}
                      onChange={e => setEditNameValue(e.target.value)}
                      className="p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-bold text-slate-700 w-full"
                    />
                    <button 
                      onClick={handleRename}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-bold shrink-0"
                    >
                      সেভ করুন
                    </button>
                    <button 
                      onClick={() => setIsEditingName(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold shrink-0"
                    >
                      বাতিল
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-800 truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </h3>
                    <button 
                      onClick={() => {
                        setIsEditingName(true);
                        setEditNameValue(selectedFile.name);
                      }}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                      title="নাম পরিবর্তন করুন"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Lightbox Preview */}
              <div className="w-full max-h-80 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 mb-4 p-2 relative">
                {(selectedFile.type === 'image' || (selectedFile.url && selectedFile.url.startsWith('data:image/'))) ? (
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.name} 
                    className="max-h-80 w-auto object-contain rounded-xl" 
                    referrerPolicy="no-referrer"
                  />
                ) : selectedFile.type === 'video' ? (
                  <div className="flex flex-col items-center gap-2 p-10">
                    <Video size={48} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-500">ভিডিও লিঙ্ক</span>
                  </div>
                ) : selectedFile.type === 'pdf' ? (
                  <div className="flex flex-col items-center gap-2 p-10">
                    <FileText size={48} className="text-rose-500" />
                    <span className="text-xs font-bold text-slate-500">পিডিএফ ডকুমেন্ট (PDF)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-10">
                    <Folder size={48} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-500">অন্যান্য ফাইল</span>
                  </div>
                )}
              </div>

              {/* Advanced Super Admin Tools Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Organize Folder Control */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Folder size={12} />
                    ফোল্ডার পরিবর্তন (Organize)
                  </h4>
                  {isMovingFolder ? (
                    <div className="space-y-2">
                      <select 
                        value={moveFolderSelected || ""}
                        onChange={e => setMoveFolderSelected(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg font-bold bg-white"
                      >
                        {allFolders.map(fol => (
                          <option key={fol} value={fol || ""}>{fol === 'Root' ? 'মূল ডিরেক্টরি (Root)' : fol}</option>
                        ))}
                        <option value="custom">+ নতুন তৈরি করুন</option>
                      </select>
                      
                      {moveFolderSelected === 'custom' && (
                        <input 
                          type="text"
                          value={customMoveFolderInput || ""}
                          onChange={e => setCustomMoveFolderInput(e.target.value)}
                          placeholder="নতুন ফোল্ডারের নাম"
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                        />
                      )}

                      <div className="flex gap-2">
                        <button 
                          onClick={handleMoveFolder}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold w-full"
                        >
                          স্থানান্তর সম্পন্ন
                        </button>
                        <button 
                          onClick={() => setIsMovingFolder(false)}
                          className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          বাতিল
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">ফোল্ডার: <strong className="text-slate-900 bg-slate-200/50 px-2 py-0.5 rounded ml-1">{selectedFile.folder || 'Root'}</strong></span>
                      <button 
                        onClick={() => {
                          setIsMovingFolder(true);
                          setMoveFolderSelected(selectedFile.folder || 'Root');
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                      >
                        স্থানান্তর করুন
                      </button>
                    </div>
                  )}
                </div>

                {/* Compression / Optimize Tool */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Zap size={12} className="text-amber-500" />
                      ইমেজ সাইজ অপ্টিমাইজেশন
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400">রিসাইজ ও JPEG কম্প্রেশন দ্বারা ফাইলের সাইজ কমান।</p>
                  </div>
                  {selectedFile.type === 'image' ? (
                    <button 
                      onClick={handleCompressExisting}
                      className="mt-3 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-xs font-black transition-all"
                    >
                      <Zap size={14} />
                      ফাইলটি কমপ্রেস করুন
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold mt-2">কম্প্রেশন শুধুমাত্র ইমেজের ক্ষেত্রে প্রযোজ্য।</span>
                  )}
                </div>
              </div>

              {/* Replace File Control */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 space-y-3">
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw size={12} className="text-indigo-500" />
                  ফাইল প্রতিস্থাপন (Replace File)
                </h4>
                
                {replacingFile ? (
                  <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-indigo-900 truncate max-w-sm">{replacingFile.name}</p>
                      <p className="text-[10px] font-bold text-indigo-500 mt-0.5">সাইজ: {replacingFile.size} KB • ধরন: {replacingFile.type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={confirmReplace}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shrink-0"
                      >
                        প্রতিস্থাপন নিশ্চিত
                      </button>
                      <button 
                        onClick={() => setReplacingFile(null)}
                        className="bg-slate-200 text-slate-600 px-2 py-1.5 rounded-lg text-[10px] font-black shrink-0"
                      >
                        বাতিল
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2">
                      <Upload size={14} />
                      নতুন ফাইল দিয়ে রিপ্লেস করুন
                      <input 
                        type="file"
                        onChange={handleReplaceFileSelect}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">এই ফাইলের আইডি ঠিক রেখে নতুন ফাইল আপলোড করুন।</span>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl text-xs font-bold text-slate-600">
                <div className="flex justify-between border-b pb-1">
                  <span>ফাইলের ধরন:</span>
                  <span className="text-slate-800 uppercase">{selectedFile.type}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>ফাইলের সাইজ:</span>
                  <span className="text-slate-800">{selectedFile.size ? `${selectedFile.size} KB` : 'অজানা'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span>ফাইল লিঙ্ক / ইউআরএল:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="text" 
                      readOnly 
                      value={selectedFile.url || ""} 
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-500"
                    />
                    <button 
                      onClick={() => copyToClipboard(selectedFile.id, selectedFile.url)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center"
                      title="লিঙ্ক কপি করুন"
                    >
                      {copiedId === selectedFile.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <button 
                  onClick={() => handleDelete(selectedFile.id, selectedFile.name)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  স্থায়ীভাবে মুছুন
                </button>
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setIsEditingName(false);
                    setIsMovingFolder(false);
                    setReplacingFile(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black transition-all"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
