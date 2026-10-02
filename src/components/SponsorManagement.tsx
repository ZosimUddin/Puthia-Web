import React, { useState, useEffect, useRef } from 'react';
import { SpecialOffer, getSpecialOffers, saveSpecialOffer, deleteSpecialOffer, compressImageToBase64 } from '../api';
import { Megaphone, Plus, Edit, Trash2, X, RefreshCw, Upload, Save } from 'lucide-react';

export default function SponsorManagement() {
    const [offers, setOffers] = useState<SpecialOffer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Partial<SpecialOffer>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        setIsLoading(true);
        try {
            const data = await getSpecialOffers();
            setOffers(data);
        } catch (error) {
            console.error('Failed to load offers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOffer.title || !editingOffer.imageUrl || !editingOffer.description || !editingOffer.category || !editingOffer.expiryDate || !editingOffer.phone) {
            alert('সবগুলো আবশ্যক (*) ঘর পূরণ করুন এবং ছবি আপলোড করুন।');
            return;
        }

        setIsSaving(true);
        try {
            const offerToSave: SpecialOffer = {
                id: editingOffer.id || Date.now().toString(),
                title: editingOffer.title || '',
                description: editingOffer.description || '',
                imageUrl: editingOffer.imageUrl || '',
                rating: editingOffer.rating || 0,
                expiryDate: editingOffer.expiryDate || '',
                category: editingOffer.category || '',
                phone: editingOffer.phone || '',
                mapUrl: editingOffer.mapUrl || '',
                type: (editingOffer.type as 'partner' | 'offer' | 'topBanner') || 'partner',
                link: editingOffer.link || '',
            };
            await saveSpecialOffer(offerToSave);
            await loadOffers();
            setIsModalOpen(false);
            setEditingOffer({});
        } catch (error) {
            console.error('Failed to save offer:', error);
            alert('তথ্য সেভ করতে সমস্যা হয়েছে।');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('আপনি কি নিশ্চিত যে এই বিজ্ঞাপনটি ডিলিট করতে চান?')) {
            try {
                await deleteSpecialOffer(id);
                await loadOffers();
            } catch (error) {
                console.error('Failed to delete offer:', error);
                alert(' বিজ্ঞাপন ডিলিট করতে সমস্যা হয়েছে।');
            }
        }
    };

    const handleEdit = (offer: SpecialOffer) => {
        setEditingOffer(offer);
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsUploadingImage(true);
        try {
            const base64Image = await compressImageToBase64(file);
            setEditingOffer(prev => ({ ...prev, imageUrl: base64Image }));
        } catch (error) {
            console.error('Image compression failed:', error);
            alert('ছবি আপলোড করতে সমস্যা হয়েছে।');
        } finally {
            setIsUploadingImage(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-800">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-emerald-500" />
                        <span>স্পন্সর ও বিজ্ঞাপন ম্যানেজমেন্ট</span>
                    </h3>
                    <button 
                        onClick={() => { setEditingOffer({}); setIsModalOpen(true); }}
                        className="bg-[#006A4E] hover:bg-[#005A42] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        নতুন বিজ্ঞাপন যোগ করুন
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">লোড হচ্ছে...</div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-800 rounded-xl">
                        <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <h4 className="text-lg font-bold text-gray-300">কোনো বিজ্ঞাপন নেই</h4>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {offers.map(offer => (
                            <div key={offer.id} className="bg-[#121212] p-4 rounded-xl border border-gray-800">
                                <img src={offer.imageUrl} alt={offer.title} className="w-full h-32 object-cover rounded-lg mb-4" />
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white">{offer.title}</h4>
                                    <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded-full uppercase tracking-wider">{offer.type}</span>
                                </div>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{offer.description}</p>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEdit(offer)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(offer.id)} className="p-2 hover:bg-red-900/20 rounded-lg text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#1A1A1A] border border-gray-800 p-6 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#1A1A1A] z-10 pb-4 border-b border-gray-800">
                            <h3 className="text-lg font-bold text-white">{editingOffer.id ? 'বিজ্ঞাপন এডিট করুন' : 'নতুন বিজ্ঞাপন যোগ করুন'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">ছবি (আবশ্যক)</label>
                                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer bg-[#121212] border border-gray-700 p-4 rounded-xl text-center border-dashed border-2">
                                    {editingOffer.imageUrl ? <img src={editingOffer.imageUrl} alt="preview" className="h-20 mx-auto" /> : <Upload className="w-8 h-8 text-gray-500 mx-auto" />}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">বিজ্ঞাপনের ধরন (Type) *</label>
                                <select value={editingOffer.type || 'partner'} onChange={e => setEditingOffer(p => ({...p, type: e.target.value as 'partner' | 'offer' | 'topBanner'}))} className="w-full bg-[#121212] border border-gray-700 p-3 rounded-lg text-white">
                                    <option value="partner">আমাদের পার্টনার (Partner Card)</option>
                                    <option value="offer">স্পেশাল অফার (Banner Ad)</option>
                                    <option value="topBanner">টপ ব্যানার (Top Banner Sliders)</option>
                                </select>
                            </div>
                            <input type="text" placeholder="প্রতিষ্ঠানের নাম *" value={editingOffer.title || ''} onChange={e => setEditingOffer(p => ({...p, title: e.target.value}))} className="w-full bg-[#121212] border border-gray-700 p-3 rounded-lg text-white" />
                            <input type="text" placeholder="ক্লিক লিংক / অ্যাকশন বাটন URL (ঐচ্ছিক)" value={editingOffer.link || ''} onChange={e => setEditingOffer(p => ({...p, link: e.target.value}))} className="w-full bg-[#121212] border border-gray-700 p-3 rounded-lg text-white" />
                            <input type="text" placeholder="বিজ্ঞাপনের ক্যাটাগরি *" value={editingOffer.category || ''} onChange={e => setEditingOffer(p => ({...p, category: e.target.value}))} className="w-full bg-[#121212] border border-gray-700 p-3 rounded-lg text-white" />
                            <textarea placeholder="বিজ্ঞাপন সম্পর্কে বিস্তারিত (অফার) *" value={editingOffer.description || ''} onChange={e => setEditingOffer(p => ({...p, description: e.target.value}))} className="w-full bg-[#121212] border border-gray-700 p-3 rounded-lg text-white" rows={3}></textarea>
                            <input type="date" placeholder="অফারের মেয়াদ *" value={editingOffer.expiryDate || ''} onChange={e => setEditingOffer(p => ({...p, expiryDate: e.target.value}))} className="w-full bg-[#121212] border border-gray-700 p-3 rounded-lg text-white" />
                            <input type="text" placeholder="যোগাযোগের নম্বর *" value={editingOffer.phone || ''} onChange={e => setEditingOffer(p => ({...p, phone: e.target.value}))} className="w-full bg-[#121212] border border-gray-700 p-3 rounded-lg text-white" />
                            <input type="text" placeholder="গুগল ম্যাপ লিংক (ঐচ্ছিক)" value={editingOffer.mapUrl || ''} onChange={e => setEditingOffer(p => ({...p, mapUrl: e.target.value}))} className="w-full bg-[#121212] border border-gray-700 p-3 rounded-lg text-white" />
                            
                            <button type="submit" disabled={isSaving} className="w-full bg-[#006A4E] hover:bg-[#005A42] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                {isSaving ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                                {editingOffer.id ? 'আপডেট করুন' : 'সেভ করুন'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
