import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  Share2,
  Clock,
  Ticket,
  ArrowRight
} from "lucide-react";
import { getSocialEvents } from "../../api";
import { SocialEvent } from "../../types";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";
import EmptyState from "./EmptyState";
import Skeleton from "./Skeleton";

import { useNavigate } from "react-router-dom";

const EventsSection: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getSocialEvents();
        setEvents(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto">
      <SectionHeader
        title="ইভেন্টস"
        subtitle="চারপাশের সকল আয়োজন"
        icon={<Calendar size={24} />}
        buttonText="সব দেখুন"
        onButtonClick={() => navigate("/events")}
      />

      <div className="flex overflow-x-auto gap-6 md:gap-8 pb-5 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[310px] sm:w-[350px] shrink-0 bg-white rounded-[20px] border border-slate-100/80 p-6 flex flex-col gap-4 animate-pulse shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <Skeleton className="h-[180px] w-full rounded-[20px]" />
              <Skeleton className="h-6 w-3/4 rounded-full" />
              <Skeleton className="h-4 w-1/2 rounded-full" />
              <div className="mt-auto flex gap-3">
                <Skeleton className="h-10 flex-1 rounded-[12px]" />
                <Skeleton className="h-10 w-10 rounded-[12px]" />
              </div>
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="col-span-full w-full">
            <EmptyState 
              icon={Calendar} 
              title="কোনো ইভেন্ট নেই" 
              message="বর্তমানে পুঠিয়াতে কোনো আসন্ন ইভেন্ট পাওয়া যায়নি। নতুন ইভেন্টের জন্য পরবর্তীতে চেক করুন।" 
            />
          </div>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => navigate("/events")}
              className="w-[310px] sm:w-[350px] h-[430px] shrink-0 snap-start bg-white rounded-[20px] overflow-hidden border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-200/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
                <img
                  src={
                    (event as any).imageUrl ||
                    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&fm=webp&q=75&w=800"
                  }
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-[12px] text-emerald-600 shadow-sm flex flex-col items-center border border-white/20">
                  <span className="text-lg font-black leading-tight">
                    {(() => {
                      try {
                        const d = new Date(event.eventDate);
                        return isNaN(d.getTime()) ? "২৫" : d.toLocaleString('bn-BD', { day: '2-digit' });
                      } catch {
                        return "২৫";
                      }
                    })()}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">
                    {(() => {
                      try {
                        const d = new Date(event.eventDate);
                        return isNaN(d.getTime()) ? "জুন" : d.toLocaleString('bn-BD', { month: 'short' });
                      } catch {
                        return "জুন";
                      }
                    })()}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[13px] font-black uppercase tracking-widest border border-emerald-100">
                      {event.category || "উৎসব"}
                    </span>
                    <div className="flex items-center gap-1 text-[13px] font-bold text-gray-400">
                      <Users size={11} />
                      <span>
                        {(event as any).registrationCount || 0} জন নিবন্ধিত
                      </span>
                    </div>
                  </div>

                  <h3 className="text-[17px] font-black text-gray-850 mb-1.5 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[2.6rem]">
                    {event.title}
                  </h3>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-500">
                      <MapPin size={12} className="text-emerald-400" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-500">
                      <Clock size={12} className="text-emerald-400" />
                      <span className="truncate">{event.eventTime || "সকাল ১০:০০ - বিকাল ৫:০০"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100">
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
    </section>
  );
};

export default EventsSection;
