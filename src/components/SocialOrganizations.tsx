import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Heart, Shield, Phone, Globe, X, CheckCircle2, User, MessageSquare, Plus, Trash2, Loader2 } from "lucide-react";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

interface Props { onGoBack: () => void; }

interface Organization {
  id: string;
  name: string;
  logoType: "heart" | "shield";
  colorTheme: "red" | "blue";
  target: string;
  contactName: string;
  phone: string;
  facebookUrl: string;
  details: string;
  joinType: "blood_donor" | "volunteer";
}

export const SocialOrganizations: React.FC<Props> = ({ onGoBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJoinOrg, setSelectedJoinOrg] = useState<Organization | null>(null);
  const [selectedFbOrg, setSelectedFbOrg] = useState<Organization | null>(null);
  const [dbOrgs, setDbOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmittingNewOrg, setIsSubmittingNewOrg] = useState(false);
  
  // Registration Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bloodGroup: "A+",
    address: "",
    interest: "শীতবস্ত্র বিতরণ"
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // New Organization Form State
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    target: "",
    contactName: "",
    phone: "",
    facebookUrl: "",
    details: "",
    joinType: "volunteer" as "volunteer" | "blood_donor",
    logoType: "shield" as "shield" | "heart",
    colorTheme: "blue" as "blue" | "red"
  });

  const staticOrganizations: Organization[] = [
    {
      id: "blood_donor",
      name: "পুঠিয়া ব্লাড ডোনার ফাউন্ডেশন",
      logoType: "heart",
      colorTheme: "red",
      target: "জরুরি মুহূর্তে রক্তদান নিশ্চিত করা।",
      contactName: "মো: সাঈদ আনোয়ার (সাধারণ সম্পাদক)",
      phone: "০১৭১২-৩৪৫৬৭৮",
      facebookUrl: "https://www.facebook.com",
      details: "রক্তদানে উৎসাহ সৃষ্টি, বিনামূল্যে রক্তের গ্রুপ পরীক্ষা, এবং জরুরি মুহূর্তে মুমূর্ষু রোগীর জন্য রক্তদাতার ব্যবস্থা করাই আমাদের মূল লক্ষ্য।",
      joinType: "blood_donor"
    },
    {
      id: "youth_welfare",
      name: "তরুণ যুব কল্যাণ ক্লাব",
      logoType: "shield",
      colorTheme: "blue",
      target: "মাদকবিরোধী সচেতনতা ও শীতবস্ত্র বিতরণ।",
      contactName: "মো: কামরুল হাসান (সভাপতি)",
      phone: "০১৭১৩-৯৮৭৬৫৪",
      facebookUrl: "https://www.facebook.com",
      details: "তরুণদের ক্রীড়া ও সংস্কৃতির সাথে যুক্ত রাখা, মাদক ও অপরাধের বিরুদ্ধে সচেতনতা এবং প্রতি বছর শীতকালে শীতার্তদের মাঝে শীতবস্ত্র ও কম্বল বিতরণ করা।",
      joinType: "volunteer"
    }
  ];

  // Load organizations from Firestore
  useEffect(() => {
    const q = query(collection(db, "social_events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Organization[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.category === "social_org") {
          list.push({
            id: docSnap.id,
            name: data.name || "",
            logoType: data.logoType || "shield",
            colorTheme: data.colorTheme || "blue",
            target: data.target || "",
            contactName: data.contactName || "",
            phone: data.phone || "",
            facebookUrl: data.facebookUrl || "https://www.facebook.com",
            details: data.details || "",
            joinType: data.joinType || "volunteer"
          });
        }
      });
      setDbOrgs(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading social organizations:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const allOrganizations = [...staticOrganizations, ...dbOrgs];

  const filteredOrganizations = allOrganizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Submit join registration form (blood donor or general volunteer)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJoinOrg) return;
    setIsRegistering(true);

    try {
      if (selectedJoinOrg.joinType === "blood_donor") {
        await addDoc(collection(db, "blood_donors"), {
          name: formData.name,
          group: formData.bloodGroup,
          phone: formData.phone,
          location: formData.address,
          lastDonate: "",
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "volunteers"), {
          name: formData.name,
          phone: formData.phone,
          bloodGroup: formData.bloodGroup || "",
          union: formData.address,
          skill: formData.interest,
          createdAt: serverTimestamp()
        });
      }

      setFormSubmitted(true);
      setTimeout(() => {
        setSelectedJoinOrg(null);
        setFormSubmitted(false);
        setFormData({
          name: "",
          phone: "",
          bloodGroup: "A+",
          address: "",
          interest: "শীতবস্ত্র বিতরণ"
        });
      }, 2500);
    } catch (err) {
      console.error("Error submitting registration:", err);
      alert("নিবন্ধন সাবমিট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsRegistering(false);
    }
  };

  // Submit custom organization form
  const handleAddOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgData.name.trim() || !newOrgData.target.trim() || !newOrgData.contactName.trim() || !newOrgData.phone.trim()) {
      alert("অনুগ্রহ করে সব তারকা (*) চিহ্নিত ফিল্ডগুলো পূরণ করুন।");
      return;
    }

    setIsSubmittingNewOrg(true);
    try {
      await addDoc(collection(db, "social_events"), {
        category: "social_org",
        name: newOrgData.name,
        target: newOrgData.target,
        contactName: newOrgData.contactName,
        phone: newOrgData.phone,
        facebookUrl: newOrgData.facebookUrl || "https://www.facebook.com",
        details: newOrgData.details || newOrgData.target,
        joinType: newOrgData.joinType,
        logoType: newOrgData.logoType,
        colorTheme: newOrgData.colorTheme,
        createdAt: new Date().toISOString()
      });

      alert("সামাজিক সংগঠনটি সফলভাবে ডিরেক্টরিতে যুক্ত হয়েছে!");
      setShowAddModal(false);
      setNewOrgData({
        name: "",
        target: "",
        contactName: "",
        phone: "",
        facebookUrl: "",
        details: "",
        joinType: "volunteer",
        logoType: "shield",
        colorTheme: "blue"
      });
    } catch (err) {
      console.error("Error adding social organization:", err);
      alert("সংগঠন যুক্ত করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmittingNewOrg(false);
    }
  };

  // Delete custom organization
  const handleDeleteOrg = async (id: string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে "${name}" সংগঠনটি ডিরেক্টরি থেকে ডিলিট করতে চান?`)) {
      try {
        await deleteDoc(doc(db, "social_events", id));
        alert("সংগঠনটি সফলভাবে ডিলিট করা হয়েছে!");
      } catch (err) {
        console.error("Error deleting social organization:", err);
        alert("ডিলিট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      }
    }
  };

  // Handle Logo/Theme dynamic settings on selection
  const handleJoinTypeChange = (type: "volunteer" | "blood_donor") => {
    if (type === "blood_donor") {
      setNewOrgData(prev => ({
        ...prev,
        joinType: type,
        logoType: "heart",
        colorTheme: "red"
      }));
    } else {
      setNewOrgData(prev => ({
        ...prev,
        joinType: type,
        logoType: "shield",
        colorTheme: "blue"
      }));
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #7A1C28, #A82C35)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-emerald-600 text-sm font-medium mb-2 uppercase tracking-wide">ঐক্যবদ্ধ পুঠিয়া</p>
          <h1 className="text-4xl font-black mb-1 text-white">সামাজিক সংগঠন ডিরেক্টরি</h1>
          <div className="w-10 h-1 bg-white rounded-full my-3"></div>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
            পুঠিয়ার সার্বিক উন্নয়নে নিয়োজিত অরাজনৈতিক, সামাজিক ও জনকল্যাণমূলক সংগঠনগুলোর তালিকা।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Search and Add Buttons Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সামাজিক সংগঠন খুঁজুন..." 
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl py-3 pl-9 pr-4 text-sm focus:outline-none focus:border-[#7A1C28] focus:ring-1 focus:ring-[#7A1C28] transition-all"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#7A1C28] hover:bg-red-800 text-white font-extrabold px-5 py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 text-xs transition cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" /> নতুন সংগঠন যোগ করুন
          </button>
        </div>

        {/* Organizations List */}
        {isLoading ? (
          <div className="text-center py-12 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#7A1C28] animate-spin" />
            <p className="text-gray-400 text-xs font-semibold">সংগঠন তালিকা লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrganizations.map((org) => {
              const isRed = org.colorTheme === "red";
              const isStatic = org.id === "blood_donor" || org.id === "youth_welfare";
              return (
                <div 
                  key={org.id} 
                  className="bg-white rounded-2xl p-5 shadow-lg border border-red-50 flex flex-col gap-3 relative overflow-hidden animate-fade-in"
                >
                  {/* Delete Button for dynamic organizations */}
                  {!isStatic && (
                    <button
                      onClick={() => handleDeleteOrg(org.id, org.name)}
                      className="absolute top-4 right-4 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 p-2 rounded-full transition-all cursor-pointer z-10"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex gap-3 items-center pr-8">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border shrink-0 ${
                      isRed ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
                    }`}>
                      {org.logoType === "heart" ? (
                        <Heart className="w-5 h-5 text-red-500" />
                      ) : (
                        <Shield className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-gray-800 leading-snug">{org.name}</h3>
                      {org.details && (
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5 line-clamp-1">
                          {org.details}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs text-gray-600 p-2.5 rounded-xl border ${
                    isRed ? "bg-red-50/50 border-red-50" : "bg-blue-50/50 border-blue-50"
                  }`}>
                    <span className="font-bold text-[#7A1C28]">লক্ষ্য:</span> {org.target}
                  </p>
                  <div className="flex gap-2 w-full mt-auto pt-1">
                    <button 
                      onClick={() => setSelectedJoinOrg(org)}
                      className="flex-1 py-2.5 text-xs font-bold text-[#7A1C28] bg-[#FFC107] rounded-xl hover:bg-yellow-400 transition-colors shadow-sm flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" /> যুক্ত হোন
                    </button>
                    <button 
                      onClick={() => setSelectedFbOrg(org)}
                      className="flex-1 py-2.5 text-xs font-bold text-[#7A1C28] bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" /> ফেসবুক গ্রুপ
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredOrganizations.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-sm font-medium">কোনো সংগঠন খুঁজে পাওয়া যায়নি।</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add New Organization Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up my-8">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-red-900 to-slate-950 text-white">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">নতুন সংগঠন যোগ করুন</span>
              </div>
              <h3 className="text-base font-black">ডিরেক্টরিতে আপনার সংগঠন নিবন্ধন করুন</h3>
            </div>

            <form onSubmit={handleAddOrgSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">সংগঠনের নাম *</label>
                <input 
                  type="text" 
                  required
                  placeholder="যেমন: পুঠিয়া সবুজ দল"
                  value={newOrgData.name || ""}
                  onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">নিবন্ধনের ধরণ *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleJoinTypeChange("volunteer")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      newOrgData.joinType === "volunteer"
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                  >
                    <Shield className="w-4 h-4" /> সমাজসেবা/স্বেচ্ছাসেবক
                  </button>
                  <button
                    type="button"
                    onClick={() => handleJoinTypeChange("blood_donor")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      newOrgData.joinType === "blood_donor"
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                  >
                    <Heart className="w-4 h-4" /> রক্তদান/ব্লাড ব্যাংক
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">সংগঠনের লক্ষ্য *</label>
                <input 
                  type="text" 
                  required
                  placeholder="যেমন: রক্তদানে উৎসাহিত করা ও শীতবস্ত্র বিতরণ"
                  value={newOrgData.target || ""}
                  onChange={(e) => setNewOrgData({ ...newOrgData, target: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">প্রধান যোগাযোগ ব্যক্তি *</label>
                <input 
                  type="text" 
                  required
                  placeholder="যেমন: মো: রফিকুল ইসলাম (সভাপতি)"
                  value={newOrgData.contactName || ""}
                  onChange={(e) => setNewOrgData({ ...newOrgData, contactName: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">মোবাইল নম্বর *</label>
                <input 
                  type="tel" 
                  required
                  placeholder="যেমন: ০১৭১১-২২৩৩৪৪"
                  value={newOrgData.phone || ""}
                  onChange={(e) => setNewOrgData({ ...newOrgData, phone: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">ফেসবুক গ্রুপ লিংক (ঐচ্ছিক)</label>
                <input 
                  type="url" 
                  placeholder="যেমন: https://www.facebook.com/groups/..."
                  value={newOrgData.facebookUrl || ""}
                  onChange={(e) => setNewOrgData({ ...newOrgData, facebookUrl: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">বিস্তারিত বিবরণ (ঐচ্ছিক)</label>
                <textarea 
                  rows={3}
                  placeholder="সংগঠনের প্রধান উদ্দেশ্য এবং অন্যান্য কার্যক্রম সম্পর্কে লিখুন..."
                  value={newOrgData.details || ""}
                  onChange={(e) => setNewOrgData({ ...newOrgData, details: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewOrg}
                  className="flex-1 py-3 bg-[#7A1C28] hover:bg-red-800 disabled:bg-red-300 text-emerald-600 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingNewOrg ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      যুক্ত হচ্ছে...
                    </>
                  ) : (
                    "সংগঠন যোগ করুন"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join/Connect Modal */}
      {selectedJoinOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-red-900 to-slate-950 text-white">
              <button 
                onClick={() => setSelectedJoinOrg(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">যোগাযোগ ও নিবন্ধন</span>
              </div>
              <h3 className="text-base font-black pr-8">{selectedJoinOrg.name}</h3>
            </div>

            {formSubmitted ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
                <h4 className="text-base font-bold text-gray-800">নিবন্ধন সফল হয়েছে!</h4>
                <p className="text-xs text-gray-500 font-semibold">সংগঠনের প্রতিনিধি আপনার সাথে দ্রুত যোগাযোগ করবেন। ধন্যবাদ!</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Contact Info Card */}
                <div className="bg-red-50/50 p-3.5 rounded-2xl border border-red-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{selectedJoinOrg.contactName}</h4>
                    <p className="text-[10px] text-gray-500 font-bold mt-0.5">প্রধান যোগাযোগ কর্মকর্তা</p>
                  </div>
                  <a 
                    href={`tel:${selectedJoinOrg.phone}`}
                    className="p-2.5 bg-[#7A1C28] text-emerald-600 rounded-xl hover:bg-red-800 transition flex items-center gap-1 text-[10px] font-bold shadow-sm cursor-pointer"
                  >
                    📞 কল করুন
                  </a>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-3 text-gray-400 text-[10px] font-bold uppercase tracking-wider">অথবা অনলাইনে যুক্ত হোন</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">আপনার নাম *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="যেমন: মো: কামরুল ইসলাম"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">মোবাইল নম্বর *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="যেমন: ০১৭১১-২২৩৩৪৪"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                    />
                  </div>

                  {selectedJoinOrg.joinType === "blood_donor" ? (
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">রক্তের গ্রুপ</label>
                      <select
                        value={formData.bloodGroup || ""}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                      >
                        <option value="A+">A+ (এ পজিটিভ)</option>
                        <option value="A-">A- (এ নেগেティブ)</option>
                        <option value="B+">B+ (বি পজিটিভ)</option>
                        <option value="B-">B- (বি নেগেティブ)</option>
                        <option value="O+">O+ (ও পজিটিভ)</option>
                        <option value="O-">O- (ও নেগেティブ)</option>
                        <option value="AB+">AB+ (এবি পজিটিভ)</option>
                        <option value="AB-">AB- (এবি নেগেティブ)</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">আগ্রহের ক্ষেত্র</label>
                      <select
                        value={formData.interest || ""}
                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                        className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                      >
                        <option value="শীতবস্ত্র বিতরণ">শীতবস্ত্র বিতরণ ও সমাজসেবা</option>
                        <option value="মাদকবিরোধী প্রচারণা">মাদকবিরোধী প্রচারণা ও ক্যাম্পিং</option>
                        <option value="বৃক্ষরোপণ">পরিবেশ রক্ষা ও বৃক্ষরোপণ</option>
                        <option value="রক্তদান কর্মসূচি">রক্তদান কর্মসূচির স্বেচ্ছাসেবক</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">গ্রাম/এলাকা *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="যেমন: পুঠিয়া সদর, বানেশ্বর"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3 bg-[#7A1C28] hover:bg-red-800 disabled:bg-red-300 text-emerald-600 text-xs font-black rounded-xl transition mt-2 shadow-md shadow-[#7A1C28]/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        নিবন্ধন করা হচ্ছে...
                      </>
                    ) : (
                      "আবেদন সাবমিট করুন"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Facebook Group Modal */}
      {selectedFbOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-blue-900 to-slate-950 text-white">
              <button 
                onClick={() => setSelectedFbOrg(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">অনলাইন কমিউনিটি</span>
              </div>
              <h3 className="text-base font-black pr-8">{selectedFbOrg.name}</h3>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-600 font-bold leading-relaxed text-center">
                🌐 আমাদের সামাজিক কার্যক্রমের সাথে যুক্ত হতে এবং সরাসরি আপডেট পেতে অফিসিয়াল ফেসবুক গ্রুপে যুক্ত হোন।
              </p>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-center">
                <span className="text-xs font-bold text-blue-900 block mb-1">গ্রুপের নাম:</span>
                <span className="text-sm font-black text-blue-950 block">{selectedFbOrg.name} অফিসিয়াল গ্রুপ</span>
              </div>

              <div className="flex flex-col gap-2">
                <a 
                  href={selectedFbOrg.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Globe className="w-4 h-4" /> ফেসবুক গ্রুপে যান
                </a>
                <button
                  onClick={() => setSelectedFbOrg(null)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
