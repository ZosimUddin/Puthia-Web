import React, { useState, useRef } from 'react';
import { 
  X, 
  Home, 
  Briefcase, 
  Tag, 
  Image as ImageIcon,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Video,
  FileText,
  MapPin,
  Smile,
  Hash,
  AtSign,
  BarChart,
  Calendar,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadFileToStorage, addToLetAd, addAdApplication } from '../api';

interface Props {
  onBack: () => void;
}

type PostType = 'rent' | 'job' | 'ad';

const POST_TYPES = [
  { id: 'rent', label: 'বাসা ভাড়া', icon: Home, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'job', label: 'চাকরির বিজ্ঞপ্তি', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'ad', label: 'বিজ্ঞাপন', icon: Tag, color: 'text-orange-500', bg: 'bg-orange-50' },
];

export default function PostForm({ onBack }: Props) {
  const { user, userProfile } = useAuth();
  const [selectedType, setSelectedType] = useState<PostType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [poll, setPoll] = useState<{ question: string; options: string[] } | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImages(prev => [...prev, ...files].slice(0, 10));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // keeping it just in case it is used by handleSubmit or other parts, but I should probably refactor to use images only
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('দয়া করে লগইন করুন');
      return;
    }

    if (!selectedType || !title || !description) {
      alert('সবগুলো ঘর পূরণ করুন');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = '';
      if (images.length > 0) {
        const path = `posts/${user.uid}/${Date.now()}_${images[0].name}`;
        imageUrl = await uploadFileToStorage(images[0], path);
      }

      if (selectedType === 'rent') {
        await addToLetAd({
          title,
          description,
          rent: price,
          location,
          ownerName: userProfile?.name || user.displayName || 'Unknown',
          ownerPhone: userProfile?.phone || '',
          category: 'house',
          details: description
        });
      } else if (selectedType === 'ad') {
        await addAdApplication({
          businessName: title,
          duration: '১ মাস',
          paymentMethod: 'বিকাশ',
          senderNumber: userProfile?.phone || '',
          txId: 'N/A',
          details: description,
          phone: userProfile?.phone || '',
          contactName: userProfile?.name || user.displayName || 'Unknown',
          adType: 'ব্যানার বিজ্ঞাপন'
        });
      }
      // Note: Job posting logic could be added here similarly

      setIsSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error);
      alert('পোস্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">সফল হয়েছে!</h2>
        <p className="text-gray-500">আপনার পোস্টটি পর্যালোচনার জন্য পাঠানো হয়েছে।</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-['Hind_Siliguri']">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">নতুন পোস্ট করুন</h2>
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <section>
          <h3 className="text-sm font-bold text-gray-700 mb-3">পোস্টের ধরন নির্বাচন করুন</h3>
          <div className="grid grid-cols-1 gap-3">
            {POST_TYPES.map((type) => (
              <button 
                key={type.id}
                onClick={() => setSelectedType(type.id as PostType)}
                className={`bg-white border p-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${selectedType === type.id ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-gray-100'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${type.bg} ${type.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                    <type.icon size={24} />
                  </div>
                  <span className="font-bold text-gray-800">{type.label}</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            ))}
          </div>
        </section>

        {selectedType && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">শিরোনাম</label>
              <input 
                type="text" 
                value={title || ""}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="এখানে লিখুন..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors text-sm"
              />
            </div>
            
            {selectedType === 'rent' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">ভাড়া (টাকা)</label>
                  <input 
                    type="text" 
                    value={price || ""}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="৫০০০"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">লোকেশন</label>
                  <input 
                    type="text" 
                    value={location || ""}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="বানেশ্বর"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">বিস্তারিত বিবরণ</label>
              <textarea 
                rows={4}
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="পোস্ট সম্পর্কে বিস্তারিত লিখুন..."
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors text-sm resize-none"
              ></textarea>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-100 rounded-full text-gray-600"><ImageIcon size={20} /></button>
              <button className="p-2 bg-gray-100 rounded-full text-gray-600"><Video size={20} /></button>
              <button className="p-2 bg-gray-100 rounded-full text-gray-600"><FileText size={20} /></button>
              <button className="p-2 bg-gray-100 rounded-full text-gray-600"><MapPin size={20} /></button>
              <button className="p-2 bg-gray-100 rounded-full text-gray-600"><Smile size={20} /></button>
              <button className="p-2 bg-gray-100 rounded-full text-gray-600"><Hash size={20} /></button>
              <button className="p-2 bg-gray-100 rounded-full text-gray-600"><AtSign size={20} /></button>
              <button className="p-2 bg-gray-100 rounded-full text-gray-600"><BarChart size={20} /></button>
              <button className="p-2 bg-gray-100 rounded-full text-gray-600"><Calendar size={20} /></button>
              <button className="p-2 bg-gray-100 rounded-full text-gray-600"><Save size={20} /></button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImagesChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((img, i) => (
                  <img key={i} src={URL.createObjectURL(img)} alt="Preview" className="w-full h-20 object-cover rounded-lg" />
                ))}
              </div>
            )}
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#004D20] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-green-900/20 active:scale-95 transition-transform mt-4 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  সাবমিট হচ্ছে...
                </>
              ) : 'পোস্ট পাবলিশ করুন'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
