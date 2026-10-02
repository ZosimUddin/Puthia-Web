import React from "react";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import { MemoriesHome } from "../../components/memories/MemoriesHome";
import { useNavigate } from "react-router-dom";
import { SEO } from "../../components/SEO";

export default function MemoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
      <SEO
        title="স্মৃতি ও টাইমলাইন (Memories) | পুঠিয়া উপজেলা পোর্টাল ও আড্ডা"
        description="পুঠিয়া আড্ডায় আপনার বিগত বছরগুলোর মধুর স্মৃতি, ফটো ও স্টোরি ফিরে দেখুন এবং বন্ধুদের সাথে উদযাপন করুন।"
      />

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <MemoriesHome
          onOpenCreatePostModal={() => navigate("/adda")}
          onNavigateToFeed={() => navigate("/adda")}
        />
      </main>

      <Footer />
    </div>
  );
}
