import React, { useState, useEffect, useRef } from "react";
import {
  Newspaper,
  Clock,
  ChevronRight,
  Share2,
  Heart,
  MessageSquare,
  Loader2,
  ArrowRight,
  Calendar,
  Sparkles,
} from "lucide-react";
import { getUserPosts } from "../../api";
import { UserPost } from "../../api";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";
import EmptyState from "./EmptyState";
import Skeleton from "./Skeleton";
import { useNavigate } from "react-router-dom";

const NewsSection: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const fetchNews = async (isInitial = true) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await getUserPosts();
      const approvedNews = data.filter((p) => p.status === "approved");
      
      if (isInitial) {
        setNews(approvedNews.slice(0, 3));
      } else {
        // Simulate loading more
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNews(prev => [...prev, ...approvedNews.slice(prev.length, prev.length + 3)]);
        if (news.length + 3 >= approvedNews.length) setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchNews(false);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, news.length]);

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto">
      <SectionHeader
        title="পুঠিয়া ডায়েরি"
        subtitle="সংবাদ ও নাগরিক পোস্ট"
        icon={<Newspaper size={24} />}
        count={news.length}
        buttonText="সব খবর"
        onButtonClick={() => navigate("/news")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[20px] border border-slate-100 p-5 h-[480px] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <Skeleton className="h-64 w-full rounded-[20px] mb-4" />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 rounded-full" />
                    <Skeleton className="h-2 w-16 rounded-full" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full rounded-full" />
                  <Skeleton className="h-5 w-4/5 rounded-full" />
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-50 mt-4">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
              </div>
            </div>
          ))
        ) : news.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={Newspaper} 
              title="কোনো সংবাদ নেই" 
              message="বর্তমানে পুঠিয়া ডায়েরিতে কোনো নতুন নাগরিক সংবাদ বা আপডেট পাওয়া যায়নি।" 
            />
          </div>
        ) : (
          news.map((post, index) => (
            <motion.div
              key={post.id}
              onClick={() => navigate("/news")}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-[20px] overflow-hidden border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group flex flex-col cursor-pointer h-full"
            >
              {post.images && post.images.length > 0 && (
                <div className="p-2.5 pb-0">
                  <div className="relative h-52 sm:h-60 w-full overflow-hidden rounded-[16px] shadow-2xs">
                    <img
                      src={post.images[0]}
                      alt="খবর"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1 border border-white/20">
                      <Sparkles size={11} className="text-amber-300" />
                      <span>{post.category || "নাগরিক খবর"}</span>
                    </div>

                    {/* Date Badge */}
                    <div className="absolute bottom-2.5 left-2.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-md flex items-center gap-1 z-10 border border-white/20">
                      <Calendar size={11} className="text-emerald-400" />
                      <span>{(post as any).date || "২০ মে, ২০২৪"}</span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )}

              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 shrink-0">
                      <img
                        src={
                          post.userPhoto ||
                          `https://ui-avatars.com/api/?name=${post.userName}&background=random`
                        }
                        alt={post.userName}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-none mb-1">
                        {post.userName}
                      </p>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.1em]">
                        পুঠিয়া সিটিজেন
                      </p>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[2.75rem] tracking-tight">
                    {post.text}
                  </h3>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <button className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-all active:scale-110 group/like">
                        <Heart size={18} className="group-hover/like:fill-rose-500 transition-colors" />
                        <span className="text-xs font-black">
                          {post.likes || 0}
                        </span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-all active:scale-110">
                        <MessageSquare size={18} />
                        <span className="text-xs font-black">১২</span>
                      </button>
                    </div>
                    <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all bg-slate-50 hover:bg-emerald-50 rounded-xl active:scale-95 border border-slate-100">
                      <Share2 size={16} />
                    </button>
                  </div>

                  <button className="w-full h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer">
                    <span>আরও দেখুন</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          {loadingMore && (
            <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
              <Loader2 className="animate-spin" size={20} />
              আরও লোড হচ্ছে...
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default NewsSection;
