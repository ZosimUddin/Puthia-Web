import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { X, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    contentId: string;
    contentTitle: string;
}

export function ReportModal({ isOpen, onClose, contentId, contentTitle }: ReportModalProps) {
    const [reportDetails, setReportDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportDetails) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'reports'), {
                contentId,
                contentTitle,
                details: reportDetails,
                createdAt: serverTimestamp(),
                status: 'Pending'
            });
            alert('আপনার রিপোর্টটি গৃহীত হয়েছে। ধন্যবাদ!');
            setReportDetails('');
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('রিপোর্ট জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" /> রিপোর্ট করুন
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-gray-600">আপনি <span className="font-bold">{contentTitle}</span>-এ ভুল তথ্য পেয়েছেন? আমাদের জানান।</p>
                    <textarea 
                        value={reportDetails || ""}
                        onChange={(e) => setReportDetails(e.target.value)}
                        placeholder="বিস্তারিত লিখুন..."
                        className="w-full p-3 border rounded-lg h-32"
                        required
                    />
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'জমা হচ্ছে...' : 'রিপোর্ট পাঠান'}
                    </button>
                </form>
            </div>
        </div>
    );
}
