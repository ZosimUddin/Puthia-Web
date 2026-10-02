import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Video, Image as ImageIcon, Play, 
  Search, Filter, LayoutGrid, List,
  Calendar, MapPin, Eye, Star,
  TrendingUp, Activity, Plus
} from 'lucide-react';
import Header from '../../../components/home/Header';
import Footer from '../../../components/home/Footer';
import BottomNavigation from '../../../components/home/BottomNavigation';
import PhotoGallery from '../PhotoGallery';
import VideoGallery from '../VideoGallery';

export default function MediaGallery() {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Unified Hero for Media Gallery */}
        <section className="relative bg-emerald-950 text-white overflow-hidden pt-20 pb-24">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2000&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-10"
              alt="Media background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-950 to-slate-50" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-emerald-400 border border-white/10 mb-6"
            >
              <Activity size={16} /> পুঠিয়া মিডিয়া হাব
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
            >
              মিডিয়া <span className="text-emerald-500">গ্যালারি</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 font-bold"
            >
              পুঠিয়ার ঐতিহ্য, প্রকৃতি, উন্নয়ন ও স্মরণীয় মুহূর্তগুলোর ছবি এবং ভিডিওর এক বিশাল ডিজিটাল আর্কাইভ।
            </motion.p>

            {/* Tab Switcher */}
            <div className="flex justify-center">
              <div className="bg-emerald-900/50 backdrop-blur-xl p-1.5 rounded-[24px] border border-white/10 flex gap-2">
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all ${
                    activeTab === 'photos' 
                      ? 'bg-white text-emerald-950 shadow-xl' 
                      : 'text-emerald-300 hover:bg-white/5'
                  }`}
                >
                  <ImageIcon size={20} />
                  ছবি গ্যালারি
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all ${
                    activeTab === 'videos' 
                      ? 'bg-white text-emerald-950 shadow-xl' 
                      : 'text-emerald-300 hover:bg-white/5'
                  }`}
                >
                  <Video size={20} />
                  ভিডিও গ্যালারি
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="-mt-12 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'photos' ? (
                <PhotoGalleryContent />
              ) : (
                <VideoGalleryContent />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
      <BottomNavigation activeTab="home" onTabChange={() => {}} />
    </div>
  );
}

// These would normally be the content extracted from PhotoGallery/index.tsx and VideoGallery/index.tsx
// To keep it simple and modular, I will modify the original index.tsx files to export only their content
// or I will just copy the relevant parts here.
// For now, I'll use a simplified version and then I can refine it.

function PhotoGalleryContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* This will eventually contain the logic from the old PhotoGallery index.tsx */}
      {/* For now let's just use the component itself but stripped of Header/Footer */}
      <PhotoGallery isEmbed />
    </div>
  );
}

function VideoGalleryContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <VideoGallery isEmbed />
    </div>
  );
}
