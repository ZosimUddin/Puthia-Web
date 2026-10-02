import React, { useState, useEffect } from "react";
import { 
  Users, 
  Store,
  Newspaper,
  Heart
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export const QuickActionsStatsCard: React.FC = () => {
  const [stats, setStats] = useState({
    registeredUsers: "৮৫,২৪৭",
    totalBusinesses: "৪,৬২৮",
    totalNews: "১,২৮০",
    bloodDonors: "২,১৯৫"
  });

  useEffect(() => {
    // Fetch dynamic platform stats if stored in firestore
    const fetchStats = async () => {
      try {
        const docRef = doc(db, "settings", "platformStats");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setStats({
            registeredUsers: data.registeredUsers || data.totalMembers || "৮৫,২৪৭",
            totalBusinesses: data.totalBusinesses || "৪,৬২৮",
            totalNews: data.totalNews || "১,২৮০",
            bloodDonors: data.bloodDonors || "২,১৯৫"
          });
        }
      } catch (e) {
        // Fallback to default state values
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    {
      id: "users",
      label: "নিবন্ধিত ব্যবহারকারী",
      value: stats.registeredUsers,
      icon: Users,
      iconBg: "bg-emerald-100/90 text-emerald-700",
      textColor: "text-slate-900"
    },
    {
      id: "business",
      label: "মোট ব্যবসা",
      value: stats.totalBusinesses,
      icon: Store,
      iconBg: "bg-amber-100/90 text-amber-700",
      textColor: "text-slate-900"
    },
    {
      id: "news",
      label: "মোট সংবাদ",
      value: stats.totalNews,
      icon: Newspaper,
      iconBg: "bg-sky-100/90 text-sky-700",
      textColor: "text-slate-900"
    },
    {
      id: "blood",
      label: "মোট রক্তদাতা",
      value: stats.bloodDonors,
      icon: Heart,
      iconBg: "bg-rose-100/90 text-rose-600",
      textColor: "text-slate-900"
    }
  ];

  return null;
};

export default QuickActionsStatsCard;
