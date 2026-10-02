import React, { useState } from 'react';
import { ReportModal } from './ReportModal';

export function ReportProblemLink({ contentId, contentTitle }: { contentId: string, contentTitle: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="text-base text-red-500 font-bold flex items-center justify-center gap-1 mt-2"
            >
                🐞 কোনো সমস্যা? জানান
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
