import React, { useState } from "react";
import { 
  Users, Building2, Store, Briefcase, FileText, Newspaper, 
  Megaphone, CreditCard, Award, Bell, BarChart3, Activity, 
  ShieldCheck, Database, Server, Settings, CheckCircle, 
  AlertTriangle, Search, ActivitySquare, BadgeCheck, X, Menu,
  Trophy
} from "lucide-react";

export default function AdminCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navGroups = [
    {
      title: "Core Operations",
      items: [
        { id: "overview", label: "Overview", icon: <ActivitySquare size={18} /> },
        { id: "users", label: "User Management", icon: <Users size={18} /> },
        { id: "services", label: "60+ Services Directory", icon: <Building2 size={18} /> },
        { id: "verification", label: "Submissions & Verification", icon: <BadgeCheck size={18} /> },
        { id: "reports", label: "Reports & Reviews", icon: <AlertTriangle size={18} /> },
      ]
    },
    {
      title: "Economy & Content",
      items: [
        { id: "business", label: "Businesses & Subscriptions", icon: <Store size={18} /> },
        { id: "marketplace", label: "Marketplace & Jobs", icon: <Briefcase size={18} /> },
        { id: "news", label: "News & Portal", icon: <Newspaper size={18} /> },
        { id: "ads", label: "Ads & Payments", icon: <Megaphone size={18} /> },
        { id: "rewards", label: "Rewards & Leaderboard", icon: <Trophy size={18} /> },
      ]
    },
    {
      title: "System Health",
      items: [
        { id: "notifications", label: "Push Notifications", icon: <Bell size={18} /> },
        { id: "analytics", label: "Search Analytics", icon: <Search size={18} /> },
        { id: "logs", label: "System Logs & Security", icon: <ShieldCheck size={18} /> },
        { id: "health", label: "Database Health", icon: <Database size={18} /> },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 w-64 flex-shrink-0 border-r border-slate-800 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute h-full z-20'} lg:relative lg:translate-x-0 flex flex-col`}>
        <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">COMMAND CENTER</h2>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6 px-3">
              <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                      activeTab === item.id 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className={activeTab === item.id ? 'text-emerald-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-600" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-black text-slate-800 uppercase tracking-wide">
              {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-700">System Online</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Default Overview Layout for all tabs to show it's working */}
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-600">
                Welcome to the unified command center. Here you control the entire portal.
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">
                  Generate Report
                </button>
                <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">
                  Apply Security Patch
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: "24,592", trend: "+12%", icon: <Users size={20}/>, color: "blue" },
                { label: "Pending Verifications", value: "145", trend: "-5%", icon: <BadgeCheck size={20}/>, color: "amber" },
                { label: "Active Ads Revenue", value: "৳ ৪৫,২০০", trend: "+24%", icon: <Megaphone size={20}/>, color: "emerald" },
                { label: "System Health", value: "99.9%", trend: "Stable", icon: <Activity size={20}/>, color: "indigo" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-${stat.color}-100 text-${stat.color}-600`}>
                    {stat.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${stat.trend.includes('+') || stat.trend === 'Stable' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Module Specific Placeholder */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center min-h-[400px] flex flex-col items-center justify-center border-dashed border-2">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.icon}
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">
                {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label} Module
              </h2>
              <p className="text-sm text-slate-500 max-w-md">
                This centralized dashboard gives you full control over the {activeTab} section. All corresponding settings, metrics, and data tables will be rendered here.
              </p>
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <div className="w-1/2 h-2 bg-slate-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
