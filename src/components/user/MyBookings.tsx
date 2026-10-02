import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Loader2,
  ChevronRight,
  Ticket,
  User as UserIcon,
  Phone,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUsersBookings, getEventDetails } from "../../api";
import { EventRegistration, SocialEvent } from "../../types";
import Header from "../home/Header";
import Footer from "../home/Footer";
import BottomNavigation from "../home/BottomNavigation";

interface BookingWithEvent extends EventRegistration {
  event?: SocialEvent;
}

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const registrations = await getUsersBookings(user!.uid);
      const bookingsWithDetails = await Promise.all(
        registrations.map(async (reg) => {
          const event = await getEventDetails(reg.eventId);
          return { ...reg, event: event || undefined };
        })
      );
      setBookings(bookingsWithDetails);
    } catch (err) {
      console.error(err);
      setError("বুকিং লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
          <button 
            onClick={() => navigate("/profile")}
            className="hidden lg:inline-flex items-center gap-2 text-gray-400 hover:text-emerald-600 transition-colors mb-2 group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">ড্যাশবোর্ডে ফিরে যান</span>
          </button>
          <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            আমার বুকিং <Calendar size={28} className="text-indigo-600" />
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">আপনার নিবন্ধিত ইভেন্ট ও বুকিংগুলো দেখুন</p>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-sm font-black text-gray-400">লোড হচ্ছে...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-900/5 transition-all group border-l-4 border-l-indigo-500"
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
                  <div className="shrink-0 w-20 h-20 bg-indigo-50 rounded-3xl flex flex-col items-center justify-center text-indigo-600 border border-indigo-100">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">ইভেন্ট</span>
                    <Ticket size={24} />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-wider">
                        {booking.event?.category || "সামাজিক অনুষ্ঠান"}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> নিবন্ধিত: {booking.createdAt}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-emerald-950 mb-4">{booking.event?.title || "অজানা ইভেন্ট"}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-gray-500">
                        <Calendar size={16} className="shrink-0 text-indigo-400" />
                        <p className="text-xs font-bold">তারিখ: {booking.event?.eventDate || "অজানা"}</p>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500">
                        <MapPin size={16} className="shrink-0 text-indigo-400" />
                        <p className="text-xs font-bold">স্থান: {booking.event?.venue || "অজানা"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:border-l border-gray-100 md:pl-8 pt-6 md:pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <UserIcon size={14} /> {booking.userName}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Phone size={14} /> {booking.userPhone}
                      </div>
                    </div>
                    <button className="mt-6 w-full py-3 px-6 bg-gray-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                      টিকিট দেখুন <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto shadow-sm mb-6 text-gray-300">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-black text-emerald-950 mb-2">কোন বুকিং পাওয়া যায়নি</h3>
            <p className="text-sm font-bold text-gray-400 max-w-xs mx-auto mb-8">
              আপনি এখনো কোন ইভেন্ট বা সেবার জন্য বুকিং করেননি।
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200"
            >
              ইভেন্ট দেখুন
            </motion.button>
          </div>
        )}

        <div className="mt-12 p-6 bg-amber-50 border border-amber-100 rounded-[32px] flex gap-4">
          <AlertCircle className="text-amber-500 shrink-0" size={24} />
          <div>
            <h4 className="text-sm font-black text-amber-950 mb-1">প্রয়োজনীয় তথ্য</h4>
            <p className="text-xs font-bold text-amber-700 leading-relaxed">
              ইভেন্ট ভেন্যুতে প্রবেশের সময় আপনার ডিজিটাল টিকিট বা মোবাইল নম্বর যাচাই করা হবে। ইভেন্ট সংক্রান্ত যে কোন পরিবর্তনের জন্য নিয়মিত আমাদের অ্যাপ চেক করুন।
            </p>
          </div>
        </div>
      </div>
    );
  };

export default MyBookings;
