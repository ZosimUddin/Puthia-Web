import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Send, 
  CheckCircle, 
  Upload, 
  FileText, 
  Building, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  CreditCard,
  AlertCircle,
  Sparkles,
  Printer,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { addServiceApplication } from "../api";

interface ServiceApplicationFormProps {
  serviceType: "birth_registration" | "death_registration" | "nid_service" | "e_mutation" | "citizen_certificate" | "trade_license" | "charity_allowance" | "passport" | "other";
  serviceName: string;
  onClose: () => void;
}

export function ServiceApplicationForm({ serviceType, serviceName, onClose }: ServiceApplicationFormProps) {
  const { user, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appId, setAppId] = useState("");
  const [error, setError] = useState("");

  // Base Form Fields
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantNid, setApplicantNid] = useState("");
  const [unionName, setUnionName] = useState("পুঠিয়া সদর ইউনিয়ন");

  // Custom Service Fields
  const [details, setDetails] = useState<Record<string, any>>({});
  const [fileAttached, setFileAttached] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  // Pre-fill user profile if available
  useEffect(() => {
    if (userProfile) {
      setApplicantName(userProfile.name || "");
      setApplicantPhone(userProfile.phone || "");
      setApplicantNid(userProfile.nidNumber || "");
      setUnionName(userProfile.union ? `${userProfile.union} ইউনিয়ন` : "পুঠিয়া সদর ইউনিয়ন");
    }
  }, [userProfile]);

  const handleDetailChange = (key: string, value: any) => {
    setDetails(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Simulate file upload to base64 or placeholder
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileAttached(event.target?.result as string || "file_placeholder");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!applicantName.trim()) {
      setError("আবেদনকারীর নাম প্রদান করুন।");
      return;
    }
    if (!applicantPhone.trim()) {
      setError("মোবাইল নম্বর প্রদান করুন।");
      return;
    }

    setLoading(true);

    try {
      const applicationData = {
        userId: user?.uid || "guest",
        applicantName,
        applicantPhone,
        applicantNid,
        serviceType,
        serviceName,
        unionName,
        details: {
          ...details,
          attachedFileName: fileName,
          attachedFile: fileAttached || ""
        }
      };

      const newId = await addServiceApplication(applicationData);
      setAppId(newId);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError("আবেদন সাবমিট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const renderServiceSpecificFields = () => {
    switch (serviceType) {
      case "e_mutation":
        return (
          <div className="space-y-4">
            <h3 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
              <span>📜</span> ই-নামজারি ও জমির বিবরণ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">মৌজার নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="যেমন: পুঠিয়া মৌজা"
                  required
                  value={details.mouza || ""}
                  onChange={(e) => handleDetailChange("mouza", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">খতিয়ান নম্বর <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="আরএস / সিএস খতিয়ান নং"
                  required
                  value={details.khatiyanNo || ""}
                  onChange={(e) => handleDetailChange("khatiyanNo", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">দাগ নম্বর <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="জমির দাগ নম্বর"
                  required
                  value={details.dagNo || ""}
                  onChange={(e) => handleDetailChange("dagNo", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">জমির পরিমাণ (শতক) <span className="text-red-500">*</span></label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="যেমন: ১৫.৫ শতক"
                  required
                  value={details.landArea || ""}
                  onChange={(e) => handleDetailChange("landArea", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">পূর্ববর্তী মালিক / দাতা নাম ও তথ্য</label>
                <textarea 
                  placeholder="যার কাছ থেকে জমি ক্রয় করেছেন বা যার ওয়ারিশ সূত্রে পেয়েছেন তার নাম ও ঠিকানা"
                  rows={2}
                  value={details.previousOwner || ""}
                  onChange={(e) => handleDetailChange("previousOwner", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
            </div>
          </div>
        );

      case "birth_registration":
        return (
          <div className="space-y-4">
            <h3 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
              <span>👶</span> শিশুর তথ্য ও অভিভাবক বিবরণ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">শিশুর সম্পূর্ণ নাম (বাংলা) <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="যেমন: আবরার রহমান"
                  required
                  value={details.childNameBn || ""}
                  onChange={(e) => handleDetailChange("childNameBn", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">শিশুর সম্পূর্ণ নাম (ইংরেজি) <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="যেমন: Abrar Rahman"
                  required
                  value={details.childNameEn || ""}
                  onChange={(e) => handleDetailChange("childNameEn", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">জন্ম তারিখ <span className="text-red-500">*</span></label>
                <input 
                  type="date"
                  required
                  value={details.dob || ""}
                  onChange={(e) => handleDetailChange("dob", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">জন্মের সুনির্দিষ্ট স্থান <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="যেমন: উপজেলা স্বাস্থ্য কমপ্লেক্স / গ্রামের নাম"
                  required
                  value={details.birthPlace || ""}
                  onChange={(e) => handleDetailChange("birthPlace", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">পিতার নাম ও এনআইডি <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="পিতার নাম এবং এনআইডি নং"
                  required
                  value={details.fatherDetails || ""}
                  onChange={(e) => handleDetailChange("fatherDetails", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">মাতার নাম ও এনআইডি <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="মাতার নাম এবং এনআইডি নং"
                  required
                  value={details.motherDetails || ""}
                  onChange={(e) => handleDetailChange("motherDetails", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
            </div>
          </div>
        );

      case "death_registration":
        return (
          <div className="space-y-4">
            <h3 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
              <span>🕯️</span> মৃত ব্যক্তির বিবরণ ও তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">মৃত ব্যক্তির নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="মৃত ব্যক্তির নাম"
                  required
                  value={details.deceasedName || ""}
                  onChange={(e) => handleDetailChange("deceasedName", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">মৃত্যু তারিখ <span className="text-red-500">*</span></label>
                <input 
                  type="date"
                  required
                  value={details.deathDate || ""}
                  onChange={(e) => handleDetailChange("deathDate", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">মৃত্যুর স্থান <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="গ্রাম / হাসপাতাল / ঠিকানা"
                  required
                  value={details.deathPlace || ""}
                  onChange={(e) => handleDetailChange("deathPlace", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">মৃতের সাথে সম্পর্ক <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="যেমন: সন্তান / স্বামী / স্ত্রী / ভাই"
                  required
                  value={details.relationship || ""}
                  onChange={(e) => handleDetailChange("relationship", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">মৃত্যুর কারণ</label>
                <input 
                  type="text"
                  placeholder="যেমন: বার্ধক্যজনিত / দুর্ঘটনা / হৃদযন্ত্রের ক্রিয়া বন্ধ হয়ে"
                  value={details.deathReason || ""}
                  onChange={(e) => handleDetailChange("deathReason", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
            </div>
          </div>
        );

      case "nid_service":
        return (
          <div className="space-y-4">
            <h3 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
              <span>🪪</span> ভোটার নিবন্ধন ও সংশোধনের আবেদন
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">আবেদনের ধরন <span className="text-red-500">*</span></label>
                <select 
                  value={details.requestType || "new"}
                  onChange={(e) => handleDetailChange("requestType", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                >
                  <option value="new">নতুন ভোটার আবেদন (New Voter)</option>
                  <option value="correction">এনআইডি কার্ড তথ্য সংশোধন (Correction)</option>
                  <option value="duplicate">হারানো এনআইডি রি-ইস্যু (Re-issue)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">স্লিপ নম্বর / এনআইডি নম্বর (যদি থাকে)</label>
                <input 
                  type="text"
                  placeholder="পুরাতন এনআইডি বা ভোটার স্লিপ নং"
                  value={details.nidOrSlipNo || ""}
                  onChange={(e) => handleDetailChange("nidOrSlipNo", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">সংশোধন বা আবেদনের বিস্তারিত বিবরণ <span className="text-red-500">*</span></label>
                <textarea 
                  placeholder="আপনি কি সংশোধন করতে চান (যেমন: নাম পরিবর্তন, জন্ম তারিখ ভুল সংশোধন) তা বিস্তারিত লিখুন।"
                  rows={3}
                  required
                  value={details.nidRemarks || ""}
                  onChange={(e) => handleDetailChange("nidRemarks", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
            </div>
          </div>
        );

      case "citizen_certificate":
      case "charity_allowance":
        return (
          <div className="space-y-4">
            <h3 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
              <span>📜</span> নাগরিক প্রত্যয়ন ও ঠিকানা বিবরণ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">পিতা / স্বামীর নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="পিতা অথবা স্বামীর নাম"
                  required
                  value={details.fatherOrHusband || ""}
                  onChange={(e) => handleDetailChange("fatherOrHusband", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">মাতার নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="মাতার নাম"
                  required
                  value={details.motherName || ""}
                  onChange={(e) => handleDetailChange("motherName", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">গ্রাম / মহল্লা <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="স্থায়ী বসবাসের ঠিকানা"
                  required
                  value={details.villageAddress || ""}
                  onChange={(e) => handleDetailChange("villageAddress", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">ওয়ার্ড নম্বর <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="ওয়ার্ড নম্বর (যেমন: ৪ নং ওয়ার্ড)"
                  required
                  value={details.wardNo || ""}
                  onChange={(e) => handleDetailChange("wardNo", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              {serviceType === "charity_allowance" && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">ভাতার ধরন / আবেদন ক্যাটাগরি <span className="text-red-500">*</span></label>
                  <select 
                    value={details.allowanceType || "senior"}
                    onChange={(e) => handleDetailChange("allowanceType", e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                  >
                    <option value="senior">বয়স্ক ভাতা (Senior Citizen Allowance)</option>
                    <option value="widow">বিধবা ও স্বামী নিগৃহীতা মহিলা ভাতা (Widow Allowance)</option>
                    <option value="disabled">প্রতিবন্ধী ভাতা (Disability Allowance)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        );

      case "trade_license":
        return (
          <div className="space-y-4">
            <h3 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
              <span>🏢</span> বাণিজ্যিক প্রতিষ্ঠান ও লাইসেন্স তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">প্রতিষ্ঠানের নাম <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="যেমন: মেসার্স পুঠিয়া টেডার্স"
                  required
                  value={details.businessName || ""}
                  onChange={(e) => handleDetailChange("businessName", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">ব্যবসার ধরন <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="যেমন: মুদি দোকান / কুরিয়ার / হোটেল"
                  required
                  value={details.businessType || ""}
                  onChange={(e) => handleDetailChange("businessType", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">প্রতিষ্ঠানের সুনির্দিষ্ট ঠিকানা <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="যেমন: বানেশ্বর বাজার, ৪ নং ওয়ার্ড"
                  required
                  value={details.businessAddress || ""}
                  onChange={(e) => handleDetailChange("businessAddress", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">বার্ষিক মূলধন বিনিয়োগ (টাকা)</label>
                <input 
                  type="number"
                  placeholder="যেমন: ৫০,০০০ টাকা"
                  value={details.capital || ""}
                  onChange={(e) => handleDetailChange("capital", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">আবেদনের সুনির্দিষ্ট বিবরণ ও উদ্দেশ্য <span className="text-red-500">*</span></label>
            <textarea 
              placeholder="আবেদনের সুনির্দিষ্ট বিবরণ বা মন্তব্য লিখুন..."
              rows={4}
              required
              value={details.generalRemarks || ""}
              onChange={(e) => handleDetailChange("generalRemarks", e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
            />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="p-6 text-white flex justify-between items-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #B71C1C, #424242)" }}>
          <div className="relative z-10">
            <span className="text-xs bg-white/20 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-1 inline-block">ডিজিটাল নাগরিক সেবা হাব</span>
            <h2 className="text-2xl font-black">{serviceName} আবেদন</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-6 -mt-6 blur-xl"></div>
        </div>

        {/* Success Screen */}
        {success ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-black text-gray-900">আবেদনটি সফলভাবে জমা হয়েছে!</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                আপনার আবেদনটি পুঠিয়া উপজেলার সংশ্লিষ্ট ডিজিটাল সেবা পোর্টালে নিবন্ধিত হয়েছে। কর্মকর্তা পর্যালোচনার পর পরবর্তী আপডেট জানতে পারবেন।
              </p>
            </div>

            {/* Application Info Badge */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 max-w-md mx-auto text-left space-y-2.5 font-sans">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">আবেদন আইডি:</span>
                <span className="font-mono font-bold text-[#B71C1C] bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-md">{appId}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">সেবার নাম:</span>
                <span className="text-gray-800 font-bold">{serviceName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">আবেদনকারী:</span>
                <span className="text-gray-800 font-bold">{applicantName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">অবস্থা:</span>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">Pending (অপেক্ষমান)</span>
              </div>
            </div>

            <div className="flex gap-4 max-w-md mx-auto">
              <button 
                onClick={() => window.print()}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> রশিদ প্রিন্ট করুন
              </button>
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-[#B71C1C] hover:bg-[#D32F2F] text-white rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Stepper Progress Bar */}
            <div className="flex items-center gap-2 pb-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#B71C1C] transition-all duration-300" style={{ width: step === 1 ? "50%" : "100%" }}></div>
              </div>
              <span className="text-xs font-mono font-bold text-[#B71C1C]">ধাপ {step}/২</span>
            </div>

            {/* Step 1: Applicant Demographics */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
                  <span>👤</span> আবেদনকারীর বেসিক তথ্য
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">আবেদনকারীর নাম <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="আপনার পূর্ণ নাম"
                        required
                        value={applicantName || ""}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="tel"
                        placeholder="মোবাইল নম্বর (যেমন: 017XXXXXXXX)"
                        required
                        value={applicantPhone || ""}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="১৭ বা ১০ ডিজিটের এনআইডি"
                        value={applicantNid || ""}
                        onChange={(e) => setApplicantNid(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">ইউনিয়ন পরিষদ <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select 
                        value={unionName || ""}
                        onChange={(e) => setUnionName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B71C1C] focus:border-transparent outline-none text-sm transition"
                      >
                        <option value="পুঠিয়া সদর ইউনিয়ন">পুঠিয়া সদর ইউনিয়ন</option>
                        <option value="বানেশ্বর ইউনিয়ন">বানেশ্বর ইউনিয়ন</option>
                        <option value="বেলপুকুরিয়া ইউনিয়ন">বেলপুকুরিয়া ইউনিয়ন</option>
                        <option value="ভালুকগাছী ইউনিয়ন">ভালুকগাছী ইউনিয়ন</option>
                        <option value="জিল্লা ইউনিয়ন">জিল্লা ইউনিয়ন</option>
                        <option value="পৌরসভা">পুঠিয়া পৌরসভা</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Info block for non-registered users */}
                {!user && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-2.5 text-xs text-amber-800 font-sans leading-relaxed">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                    <p>
                      আপনি অতিথি ইউজার হিসেবে আবেদন করতে পারেন। তবে অ্যাপে আপনার নাগরিক অ্যাকাউন্ট থাকলে যেকোনো সময় আবেদনের বর্তমান অবস্থা ট্র্যাক করা এবং রশিদ সংগ্রহ করা অনেক সহজ হবে।
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Service-Specific details and attachment */}
            {step === 2 && (
              <div className="space-y-6">
                {renderServiceSpecificFields()}

                {/* File Attachment Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">সহায়ক কাগজপত্র যুক্ত করুন (ঐচ্ছিক)</label>
                  <div className="border-2 border-dashed border-gray-200 hover:border-[#B71C1C] rounded-2xl p-5 text-center cursor-pointer transition relative group">
                    <input 
                      type="file" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-[#B71C1C] transition" />
                    <p className="text-sm font-bold text-gray-700">ফাইল ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা ব্রাউজ করুন</p>
                    <p className="text-xs text-gray-400 mt-1">সর্বোচ্চ ৫ মেগাবাইট (PDF, JPG, PNG)</p>
                    {fileName && (
                      <div className="mt-3 bg-[#B71C1C]/10 text-[#B71C1C] text-xs font-bold py-1 px-3 rounded-full inline-flex items-center gap-1.5 border border-[#B71C1C]/20">
                        <FileText className="w-3.5 h-3.5" /> {fileName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              {step === 2 ? (
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> পূর্ববর্তী ধাপ
                </button>
              ) : (
                <div></div>
              )}

              {step === 1 ? (
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-[#B71C1C] hover:bg-[#D32F2F] text-white rounded-xl font-bold text-sm transition flex items-center gap-1 shadow-sm hover:shadow-md cursor-pointer ml-auto"
                >
                  পরবর্তী ধাপ <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition flex items-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>সাবমিট হচ্ছে...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> আবেদন নিশ্চিত করুন
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
