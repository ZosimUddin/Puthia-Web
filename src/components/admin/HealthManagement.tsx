import React, { useState, useEffect } from "react";
import { 
  HeartPulse, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Edit, 
  Building2, 
  Stethoscope, 
  Truck, 
  Droplets,
  Loader2,
  Phone,
  MapPin,
  Clock,
  Star,
  ExternalLink,
  Save,
  X,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getHealthServices, 
  addHealthService, 
  updateHealthService, 
  deleteHealthService,
  getBloodDonors,
  addBloodDonor,
  updateBloodDonor,
  deleteBloodDonor
} from "../../api";
import { HealthService, BloodDonor, Doctor } from "../../types";

const HealthManagement = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'donors'>('services');
  const [services, setServices] = useState<HealthService[]>([]);
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for Health Service
  const [serviceForm, setServiceForm] = useState<Partial<HealthService>>({
    name: "",
    type: "hospital",
    phone: "",
    address: "",
    hours: "২৪ ঘণ্টা খোলা",
    rating: 5,
    about: "",
    departments: [],
    doctors: [],
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80"
  });

  // Form states for Blood Donor
  const [donorForm, setDonorForm] = useState<Partial<BloodDonor>>({
    name: "",
    bloodGroup: "A+",
    phone: "",
    location: "",
    isAvailable: true,
    union: ""
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'services') {
        const data = await getHealthServices();
        setServices(data);
      } else {
        const data = await getBloodDonors();
        setDonors(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateHealthService(editingId, serviceForm);
      } else {
        await addHealthService(serviceForm as Omit<HealthService, 'id'>);
      }
      setIsAdding(false);
      setEditingId(null);
      resetServiceForm();
      await fetchData();
    } catch (error) {
      alert("তথ্য সংরক্ষণ করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateBloodDonor(editingId, donorForm);
      } else {
        await addBloodDonor({
          ...donorForm as Omit<BloodDonor, 'id'>,
          createdAt: new Date().toISOString()
        });
      }
      setIsAdding(false);
      setEditingId(null);
      resetDonorForm();
      await fetchData();
    } catch (error) {
      alert("তথ্য সংরক্ষণ করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই সেবাটি মুছে ফেলতে চান?")) return;
    setLoading(true);
    try {
      await deleteHealthService(id);
      await fetchData();
    } catch (error) {
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonor = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই রক্তদাতার তথ্য মুছে ফেলতে চান?")) return;
    setLoading(true);
    try {
      await deleteBloodDonor(id);
      await fetchData();
    } catch (error) {
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: "",
      type: "hospital",
      phone: "",
      address: "",
      hours: "২৪ ঘণ্টা খোলা",
      rating: 5,
      about: "",
      departments: [],
      doctors: [],
      image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80"
    });
  };

  const resetDonorForm = () => {
    setDonorForm({
      name: "",
      bloodGroup: "A+",
      phone: "",
      location: "",
      isAvailable: true,
      union: ""
    });
  };

  const startEditService = (service: HealthService) => {
    setServiceForm(service);
    setEditingId(service.id);
    setIsAdding(true);
  };

  const startEditDonor = (donor: BloodDonor) => {
    setDonorForm(donor);
    setEditingId(donor.id);
    setIsAdding(true);
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDonors = donors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-1">স্বাস্থ্য ও রক্তদাতা মডিউল</h2>
            <p className="text-xs font-bold text-gray-400">হাসপাতাল, ডাক্তার ও রক্তদাতাদের তথ্য ব্যবস্থাপনা</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-[#F8FAFC] p-1.5 rounded-2xl border border-gray-100">
              <button
                onClick={() => { setActiveTab('services'); setIsAdding(false); setEditingId(null); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'services' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Building2 size={16} /> স্বাস্থ্য সেবা
              </button>
              <button
                onClick={() => { setActiveTab('donors'); setIsAdding(false); setEditingId(null); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'donors' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Droplets size={16} /> রক্তদাতা
              </button>
            </div>
            <button 
              onClick={() => { setIsAdding(!isAdding); setEditingId(null); if(!isAdding) { resetServiceForm(); resetDonorForm(); } }}
              className="bg-[#007A5E] text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-[#00634B] transition-all shadow-lg shadow-emerald-100"
            >
              {isAdding ? <X size={20} /> : <Plus size={20} />}
              {isAdding ? "বন্ধ করুন" : (activeTab === 'services' ? "নতুন সেবা যোগ" : "নতুন দাতা যোগ")}
            </button>
          </div>
        </div>

        {!isAdding && (
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={activeTab === 'services' ? "হাসপাতাল বা সেবার নাম দিয়ে খুঁজুন..." : "দাতার নাম বা রক্ত গ্রুপ দিয়ে খুঁজুন..."}
              value={searchTerm || ""}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 transition-all" 
            />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8"
          >
            <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2">
              {editingId ? <Edit size={24} className="text-emerald-600" /> : <Plus size={24} className="text-emerald-600" />}
              {editingId ? "তথ্য পরিবর্তন করুন" : "নতুন তথ্য যোগ করুন"}
            </h3>

            {activeTab === 'services' ? (
              <form onSubmit={handleSubmitService} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">নাম</label>
                  <input 
                    type="text" 
                    required
                    value={serviceForm.name || ""}
                    onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">সেবার ধরন</label>
                  <select 
                    value={serviceForm.type || ""}
                    onChange={(e) => setServiceForm({...serviceForm, type: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="hospital">সরকারি হাসপাতাল</option>
                    <option value="clinic">প্রাইভেট ক্লিনিক</option>
                    <option value="ambulance">অ্যাম্বুলেন্স</option>
                    <option value="pharmacy">ফার্মেসি</option>
                    <option value="diagnostic">ডায়াগনস্টিক</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">ফোন নম্বর</label>
                  <input 
                    type="text" 
                    required
                    value={serviceForm.phone || ""}
                    onChange={(e) => setServiceForm({...serviceForm, phone: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">ঠিকানা</label>
                  <input 
                    type="text" 
                    required
                    value={serviceForm.address || ""}
                    onChange={(e) => setServiceForm({...serviceForm, address: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">বিস্তারিত তথ্য</label>
                  <textarea 
                    rows={4}
                    value={serviceForm.about || ""}
                    onChange={(e) => setServiceForm({...serviceForm, about: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all resize-none" 
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button 
                    type="button"
                    onClick={() => { setIsAdding(false); setEditingId(null); }}
                    className="px-8 py-3.5 rounded-2xl text-sm font-black text-gray-400 hover:bg-gray-50 transition-all"
                  >
                    বাতিল
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#007A5E] text-white px-10 py-3.5 rounded-2xl font-black text-sm hover:bg-[#00634B] transition-all shadow-lg shadow-emerald-100"
                  >
                    {editingId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitDonor} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">দাতার নাম</label>
                  <input 
                    type="text" 
                    required
                    value={donorForm.name || ""}
                    onChange={(e) => setDonorForm({...donorForm, name: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">রক্ত গ্রুপ</label>
                  <select 
                    value={donorForm.bloodGroup || ""}
                    onChange={(e) => setDonorForm({...donorForm, bloodGroup: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                      <option key={bg} value={bg || ""}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">ফোন নম্বর</label>
                  <input 
                    type="text" 
                    required
                    value={donorForm.phone || ""}
                    onChange={(e) => setDonorForm({...donorForm, phone: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">অবস্থান (গ্রাম/পাড়া)</label>
                  <input 
                    type="text" 
                    required
                    value={donorForm.location || ""}
                    onChange={(e) => setDonorForm({...donorForm, location: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">ইউনিয়ন</label>
                  <input 
                    type="text" 
                    required
                    value={donorForm.union || ""}
                    onChange={(e) => setDonorForm({...donorForm, union: e.target.value})}
                    className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all" 
                  />
                </div>
                <div className="space-y-2 flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setDonorForm({...donorForm, isAvailable: !donorForm.isAvailable})}
                    className={`mt-6 px-6 py-3 rounded-xl text-xs font-black transition-all ${donorForm.isAvailable ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}
                  >
                    {donorForm.isAvailable ? "রক্ত দিতে প্রস্তুত" : "আপাতত উপলব্ধ নয়"}
                  </button>
                </div>
                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button 
                    type="button"
                    onClick={() => { setIsAdding(false); setEditingId(null); }}
                    className="px-8 py-3.5 rounded-2xl text-sm font-black text-gray-400 hover:bg-gray-50 transition-all"
                  >
                    বাতিল
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#007A5E] text-white px-10 py-3.5 rounded-2xl font-black text-sm hover:bg-[#00634B] transition-all shadow-lg shadow-emerald-100"
                  >
                    {editingId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        ) : loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'services' ? (
              filteredServices.map(service => (
                <motion.div 
                  layout
                  key={service.id}
                  className="bg-white border border-gray-50 rounded-[32px] overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative h-48">
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-600 text-[10px] font-black rounded-full shadow-sm uppercase tracking-wider">
                        {service.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-black text-gray-900 mb-1">{service.name}</h4>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <MapPin size={14} className="text-emerald-500" />
                        <span className="truncate">{service.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <Phone size={14} className="text-emerald-500" />
                        <span>{service.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditService(service)}
                          className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-emerald-500 fill-amber-400" />
                        <span className="text-xs font-black text-gray-900">{service.rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              filteredDonors.map(donor => (
                <motion.div 
                  layout
                  key={donor.id}
                  className="bg-white border border-gray-50 rounded-[32px] p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black text-lg">
                        {donor.bloodGroup}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${donor.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {donor.isAvailable ? "প্রস্তুত" : "বিরতি"}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 mb-1">{donor.name}</h4>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <MapPin size={14} className="text-rose-400" />
                        <span>{donor.location}, {donor.union}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <Phone size={14} className="text-rose-400" />
                        <span>{donor.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-50">
                    <button 
                      onClick={() => startEditDonor(donor)}
                      className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteDonor(donor.id)}
                      className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthManagement;
