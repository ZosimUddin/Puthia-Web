import React from 'react';
import { Video } from 'lucide-react';

export default function ContentVideoManagement() {
    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Video className="w-6 h-6 text-emerald-500" />
                <span>Video Gallery</span>
            </h3>
            <div className="text-center py-12 px-4 border-2 border-dashed border-gray-800 rounded-xl">
                <p className="text-gray-400">ভিডিও গ্যালারি মডিউল খুব শিঘ্রই আসছে...</p>
            </div>
        </div>
    );
}
