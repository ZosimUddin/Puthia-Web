import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ReportModal } from './ReportModal';

interface ReportButtonProps {
    contentId: string;
    contentTitle: string;
}

export function ReportButton({ contentId, contentTitle }: ReportButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold p-2 bg-red-50 rounded-lg"
            >
                <AlertTriangle className="w-4 h-4" /> রিপোর্ট
            </button>
            <ReportModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                contentId={contentId} 
                contentTitle={contentTitle} 
            />
        </>
    );
}
