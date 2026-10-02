import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, HeartPulse, GraduationCap, Sprout, Landmark, 
  ShieldAlert, Bus, HelpCircle, Plus, Edit2, Trash2, Save, X, 
  Loader2, Globe, Phone, MapPin, Clock, Tag, Compass, FileText, Check, AlertTriangle, Settings, Sparkles
} from 'lucide-react';

// Import existing admin sub-managers
import BusinessManagement from './BusinessManagement';
import HealthManagement from './HealthManagement';
import AgriManagement from './AgriManagement';
import HospitalManagement from '../HospitalManagement';
import EducationManagement from '../EducationManagement';
import AgricultureManagement from '../AgricultureManagement';
import ServiceCatalogManagement from './ServiceCatalogManagement';

type ServiceTab = 
  | 'business'
  | 'health'
  | 'education'
  | 'agri'
  | 'tourism'
  | 'bank'
  | 'insurance'
  | 'transport'
  | 'emergency'
  | 'services';

export default function ServiceManagement() {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<ServiceTab>('services');

  useEffect(() => {
    if (urlTab) {
      if (['business', 'health', 'education', 'agri', 'tourism', 'bank', 'insurance', 'transport', 'emergency', 'services'].includes(urlTab)) {
        setActiveTab(urlTab as ServiceTab);
      } else if (urlTab === 'all' || urlTab === 'catalog') {
        setActiveTab('services');
      }
    }
  }, [urlTab]);
  
  // Sub-tabs for combined sections
  const [healthSubTab, setHealthSubTab] = useState<'donors' | 'hospitals'>('donors');
  const [agriSubTab, setAgriSubTab] = useState<'advice' | 'prices'>('advice');
  const [transportSubTab, setTransportSubTab] = useState<'bus' | 'train'>('bus');
  const [emergencySubTab, setEmergencySubTab] = useState<'ambulance' | 'police' | 'fire'>('ambulance');

  // Generic states for our custom CRUD sections
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Forms for Custom CRUDs
  const [tourismForm, setTourismForm] = useState({
    id: '',
    name: '',
    category: 'temples',
    icon: '🏛️',
    detail: '',
    coords: '',
    order: 1
  });

  const [bankForm, setBankForm] = useState({
    name: '',
    branch: '',
    category: 'commercial',
    isIslamic: false,
    hasAtm: false,
    address: '',
    phone: '',
    schedule: 'সকাল ১০:০০ - বিকাল ০৪:০০',
    manager: '',
    services: '',
    atmInfo: '',
    website: '',
    desc: '',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3625.545!2d88.8251!3d24.3606!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fc177f0a6d1bb7%3A0xc6a827bcbe3d65b1!2sPuthia%20Rajbari!5e0!3m2!1sen!2sbd!4v1700000000000'
  });

  const [insuranceForm, setInsuranceForm] = useState({
    name: '',
    branch: '',
    category: 'life',
    type: 'private',
    address: '',
    phone: '',
    schedule: 'সকাল ১০:০০ - বিকাল ০৪:০০',
    desc: '',
    services: '',
    website: ''
  });

  const [busForm, setBusForm] = useState({
    operator: '',
    type: 'নন-এসি',
    route: 'পুঠিয়া ⇆ ঢাকা (সরাসরি)',
    timing: '',
    ticketPrice: '',
    boarding: '',
    counters: '' // Format: CounterName: Phone, CounterName2: Phone2
  });

  const [trainForm, setTrainForm] = useState({
    name: '',
    route: 'রাজশাহী ⇆ ঢাকা (ভায়া আব্দুলপুর)',
    offDay: 'শুক্রবার (Friday)',
    timing: '',
    ticketPrice: '',
    boarding: 'রাজশাহী রেলওয়ে স্টেশন',
    note: ''
  });

  const [emergencyForm, setEmergencyForm] = useState({
    name: '',
    category: '', // will be set based on subtab
    location: '',
    contact: '',
    serviceHours: '২৪ ঘণ্টা',
    details: ''
  });

  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'general',
    description: '',
    isApproved: false,
    isVisible: true,
    isFeatured: false
  });

  // Fetch handler for custom CRUD items
  useEffect(() => {
    // We only load dynamic data for custom tabs
    const customTabs = ['tourism', 'bank', 'insurance', 'transport', 'emergency', 'services'];
    if (!customTabs.includes(activeTab)) {
      setItems([]);
      return;
    }

    setLoading(true);
    let collectionName = '';
    
    if (activeTab === 'tourism') {
      collectionName = 'tourist_spots';
    } else if (activeTab === 'bank') {
      collectionName = 'banks';
    } else if (activeTab === 'insurance') {
      collectionName = 'insurance_companies';
    } else if (activeTab === 'transport') {
      collectionName = transportSubTab === 'bus' ? 'bus_schedules' : 'train_schedules';
    } else if (activeTab === 'emergency') {
      collectionName = emergencySubTab === 'ambulance' ? 'ambulances' : emergencySubTab === 'police' ? 'police_posts' : 'fire_posts';
    } else if (activeTab === 'services') {
      collectionName = 'services';
    }

    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      setItems(fetched);
      setLoading(false);
    }, (error) => {
      console.error(`Error loading collection ${collectionName}:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab, transportSubTab, emergencySubTab]);

  // Reset helper
  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setTourismForm({ id: '', name: '', category: 'temples', icon: '🏛️', detail: '', coords: '', order: 1 });
    setBankForm({
      name: '', branch: '', category: 'commercial', isIslamic: false, hasAtm: false, address: '', phone: '',
      schedule: 'সকাল ১০:০০ - বিকাল ০৪:০০', manager: '', services: '', atmInfo: '', website: '', desc: '', mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3625.545!2d88.8251!3d24.3606!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fc177f0a6d1bb7%3A0xc6a827bcbe3d65b1!2sPuthia%20Rajbari!5e0!3m2!1sen!2sbd!4v1700000000000'
    });
    setInsuranceForm({ name: '', branch: '', category: 'life', type: 'private', address: '', phone: '', schedule: 'সকাল ১০:০০ - বিকাল ০৪:০০', desc: '', services: '', website: '' });
    setBusForm({ operator: '', type: 'নন-এসি', route: 'পুঠিয়া ⇆ ঢাকা (সরাসরি)', timing: '', ticketPrice: '', boarding: '', counters: '' });
    setTrainForm({ name: '', route: 'রাজশাহী ⇆ ঢাকা (ভায়া আব্দুলপুর)', offDay: 'শুক্রবার (Friday)', timing: '', ticketPrice: '', boarding: 'রাজশাহী রেলওয়ে স্টেশন', note: '' });
    setEmergencyForm({ name: '', category: '', location: '', contact: '', serviceHours: '২৪ ঘণ্টা', details: '' });
    setServiceForm({ name: '', category: 'general', description: '', isApproved: false, isVisible: true, isFeatured: false });
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setIsAdding(true);
    if (activeTab === 'tourism') {
      setTourismForm({
        id: item.id,
        name: item.name || '',
        category: item.category || 'temples',
        icon: item.icon || '🏛️',
        detail: item.detail || '',
        coords: item.coords ? item.coords.join(', ') : '',
        order: item.order || 1
      });
    } else if (activeTab === 'bank') {
      setBankForm({
        ...item,
        services: Array.isArray(item.services) ? item.services.join(', ') : (item.services || '')
      });
    } else if (activeTab === 'insurance') {
      setInsuranceForm({
        ...item,
        services: Array.isArray(item.services) ? item.services.join(', ') : (item.services || '')
      });
    } else if (activeTab === 'transport') {
      if (transportSubTab === 'bus') {
        const counterStr = Array.isArray(item.counters)
          ? item.counters.map((c: any) => `${c.name}: ${c.phone}`).join(', ')
          : (item.counters || '');
        setBusForm({ ...item, counters: counterStr });
      } else {
        setTrainForm({ ...item });
      }
    } else if (activeTab === 'emergency') {
      setEmergencyForm({ ...item });
    } else if (activeTab === 'services') {
      setServiceForm({ ...item });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?')) return;
    
    let collectionName = '';
    if (activeTab === 'tourism') collectionName = 'tourist_spots';
    else if (activeTab === 'bank') collectionName = 'banks';
    else if (activeTab === 'insurance') collectionName = 'insurance_companies';
    else if (activeTab === 'transport') collectionName = transportSubTab === 'bus' ? 'bus_schedules' : 'train_schedules';
    else if (activeTab === 'emergency') collectionName = emergencySubTab === 'ambulance' ? 'ambulances' : emergencySubTab === 'police' ? 'police_posts' : 'fire_posts';
    else if (activeTab === 'services') collectionName = 'services';

    try {
      await deleteDoc(doc(db, collectionName, id));
      alert('সফলভাবে মুছে ফেলা হয়েছে!');
    } catch (err) {
      console.error(err);
      alert('মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let collectionName = '';
    let payload: any = {};

    try {
      if (activeTab === 'tourism') {
        collectionName = 'tourist_spots';
        const coordsArr = tourismForm.coords 
          ? tourismForm.coords.split(',').map(c => parseFloat(c.trim())).filter(c => !isNaN(c))
          : [];
        
        payload = {
          name: tourismForm.name.trim(),
          category: tourismForm.category,
          icon: tourismForm.icon,
          detail: tourismForm.detail.trim(),
          order: Number(tourismForm.order) || 1,
          updatedAt: serverTimestamp()
        };
        if (coordsArr.length === 2) {
          payload.coords = coordsArr;
        }
      } 
      else if (activeTab === 'bank') {
        collectionName = 'banks';
        payload = {
          ...bankForm,
          services: bankForm.services ? bankForm.services.split(',').map(s => s.trim()) : ['সাধারণ ব্যাংকিং'],
          updatedAt: serverTimestamp()
        };
      } 
      else if (activeTab === 'insurance') {
        collectionName = 'insurance_companies';
        payload = {
          ...insuranceForm,
          services: insuranceForm.services ? insuranceForm.services.split(',').map(s => s.trim()) : [],
          updatedAt: serverTimestamp()
        };
      } 
      else if (activeTab === 'transport') {
        if (transportSubTab === 'bus') {
          collectionName = 'bus_schedules';
          const counterList = busForm.counters 
            ? busForm.counters.split(',').map(c => {
                const parts = c.split(':');
                return {
                  name: parts[0]?.trim() || 'কাউন্টার',
                  phone: parts[1]?.trim() || 'N/A'
                };
              })
            : [{ name: 'সরাসরি বাস স্ট্যান্ড', phone: 'N/A' }];
          
          payload = {
            operator: busForm.operator.trim(),
            type: busForm.type,
            route: busForm.route.trim(),
            timing: busForm.timing.trim(),
            ticketPrice: busForm.ticketPrice.trim(),
            boarding: busForm.boarding.trim(),
            counters: counterList,
            updatedAt: serverTimestamp()
          };
        } else {
          collectionName = 'train_schedules';
          payload = {
            name: trainForm.name.trim(),
            route: trainForm.route.trim(),
            offDay: trainForm.offDay,
            timing: trainForm.timing.trim(),
            ticketPrice: trainForm.ticketPrice.trim(),
            boarding: trainForm.boarding.trim(),
            note: trainForm.note.trim(),
            updatedAt: serverTimestamp()
          };
        }
      } 
      else if (activeTab === 'emergency') {
        if (emergencySubTab === 'ambulance') {
          collectionName = 'ambulances';
          payload = {
            name: emergencyForm.name.trim(),
            category: emergencyForm.category || 'private',
            location: emergencyForm.location.trim(),
            contact: emergencyForm.contact.trim(),
            serviceHours: emergencyForm.serviceHours.trim(),
            details: emergencyForm.details.trim(),
            updatedAt: serverTimestamp()
          };
        } else if (emergencySubTab === 'police') {
          collectionName = 'police_posts';
          payload = {
            name: emergencyForm.name.trim(),
            category: emergencyForm.category || 'station',
            location: emergencyForm.location.trim(),
            contact: emergencyForm.contact.trim(),
            serviceHours: emergencyForm.serviceHours.trim(),
            details: emergencyForm.details.trim(),
            updatedAt: serverTimestamp()
          };
        } else {
          collectionName = 'fire_posts';
          payload = {
            name: emergencyForm.name.trim(),
            category: emergencyForm.category || 'puthia',
            location: emergencyForm.location.trim(),
            contact: emergencyForm.contact.trim(),
            serviceHours: emergencyForm.serviceHours.trim(),
            details: emergencyForm.details.trim(),
            updatedAt: serverTimestamp()
          };
        }
      }
      else if (activeTab === 'services') {
        collectionName = 'services';
        payload = {
          ...serviceForm,
          name: serviceForm.name.trim(),
          description: serviceForm.description.trim(),
          updatedAt: serverTimestamp()
        };
      }

      if (editingId) {
        await updateDoc(doc(db, collectionName, editingId), payload);
      } else {
        payload.createdAt = serverTimestamp();
        if (activeTab === 'tourism' && tourismForm.id) {
          // Use specified custom ID for tourist spots
          await updateDoc(doc(db, collectionName, tourismForm.id), payload).catch(async () => {
            // Document doesn't exist, create it
            const { setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, collectionName, tourismForm.id), payload);
          });
        } else {
          await addDoc(collection(db, collectionName), payload);
        }
      }

      alert('সফলভাবে তথ্য সংরক্ষিত করা হয়েছে!');
      closeForm();
    } catch (err) {
      console.error(err);
      alert('সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'services', label: '৬৩টি সেবা ম্যানেজমেন্ট', icon: Sparkles },
    { id: 'business', label: 'বিজনেস ডিরেক্টরি', icon: Building2 },
    { id: 'health', label: 'স্বাস্থ্য ও রক্তদাতা', icon: HeartPulse },
    { id: 'education', label: 'শিক্ষা প্রতিষ্ঠান', icon: GraduationCap },
    { id: 'agri', label: 'কৃষি ও আবহাওয়া', icon: Sprout },
    { id: 'tourism', label: 'পর্যটন গাইড', icon: Compass },
    { id: 'bank', label: 'ব্যাংক ও অর্থসেবা', icon: Landmark },
    { id: 'insurance', label: 'বীমা কোম্পানি', icon: FileText },
    { id: 'transport', label: 'পরিবহন সময়সূচী', icon: Bus },
    { id: 'emergency', label: 'জরুরী কন্টাক্ট', icon: ShieldAlert },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-[32px] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-black tracking-widest uppercase text-emerald-100 border border-white/5">
            🛠️ পোর্টাল কন্ট্রোল প্যানেল
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            সার্ভিস ও সেবা ম্যানেজমেন্ট
          </h1>
          <p className="text-emerald-100/90 text-sm md:text-lg font-medium leading-relaxed">
            পুঠিয়া উপজেলাবাসীদের জন্য বরাদ্দকৃত সকল ডিজিটাল সার্ভিস ও তথ্যভান্ডার এখানে একযোগে অ্যাডমিন মডারেশন করা যায়। সঠিক এবং হালনাগাদ তথ্য প্রদান নিশ্চিত করুন।
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-4 shadow-sm h-fit space-y-2">
          <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-2">
            সেবা ক্যাটাগরি নির্বাচন করুন
          </div>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 scrollbar-none pb-2 lg:pb-0">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); closeForm(); }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer border-none shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm font-extrabold border-l-4 border-l-emerald-600'
                      : 'bg-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent size={18} className={activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Workspace */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Workspaces Wrapper */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (activeTab === 'transport' ? transportSubTab : activeTab === 'emergency' ? emergencySubTab : '')}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* TAB 0: 63 Services Catalog */}
              {activeTab === 'services' && (
                <ServiceCatalogManagement />
              )}

              {/* TAB 1: Business Directory */}
              {activeTab === 'business' && (
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-6">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-5 mb-6">
                    <Building2 className="text-emerald-600" size={24} />
                    <div>
                      <h2 className="text-lg font-black text-gray-800">বিজনেস ডিরেক্টরি মডারেশন</h2>
                      <p className="text-xs text-gray-400 font-bold">পুঠিয়া উপজেলার নিবন্ধিত ব্যবসা অনুমোদন ও নিয়ন্ত্রণ করুন।</p>
                    </div>
                  </div>
                  <BusinessManagement />
                </div>
              )}

              {/* TAB 2: Health */}
              {activeTab === 'health' && (
                <div className="space-y-6">
                  {/* Health Sub-tabs */}
                  <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-2">
                    <button
                      onClick={() => setHealthSubTab('donors')}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${
                        healthSubTab === 'donors' ? 'bg-rose-50 text-rose-600 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      🩸 রক্তদাতা ও ব্লাড ব্যাংক
                    </button>
                    <button
                      onClick={() => setHealthSubTab('hospitals')}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${
                        healthSubTab === 'hospitals' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      🏥 হাসপাতাল, ডাক্তার ও অ্যাম্বুলেন্স
                    </button>
                  </div>

                  <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-6">
                    {healthSubTab === 'donors' ? <HealthManagement /> : <HospitalManagement />}
                  </div>
                </div>
              )}

              {/* TAB 3: Education */}
              {activeTab === 'education' && (
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-6">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-5 mb-6">
                    <GraduationCap className="text-emerald-600" size={24} />
                    <div>
                      <h2 className="text-lg font-black text-gray-800">শিক্ষা প্রতিষ্ঠান ম্যানেজমেন্ট</h2>
                      <p className="text-xs text-gray-400 font-bold">উপজেলার স্কুল, কলেজ, মাদ্রাসা ও লাইব্রেরি তালিকা হালনাগাদ করুন।</p>
                    </div>
                  </div>
                  <EducationManagement />
                </div>
              )}

              {/* TAB 4: Agriculture */}
              {activeTab === 'agri' && (
                <div className="space-y-6">
                  {/* Agri Sub-tabs */}
                  <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-2">
                    <button
                      onClick={() => setAgriSubTab('advice')}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${
                        agriSubTab === 'advice' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      🌾 কৃষি ডিলার ও ঋণ পরামর্শ
                    </button>
                    <button
                      onClick={() => setAgriSubTab('prices')}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${
                        agriSubTab === 'prices' ? 'bg-amber-50 text-amber-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      📊 বাজারের দর ও আবহাওয়া সতর্কতা
                    </button>
                  </div>

                  <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-6">
                    {agriSubTab === 'advice' ? <AgricultureManagement /> : <AgriManagement />}
                  </div>
                </div>
              )}

              {/* CUSTOM CRUD MODULES (Tourism, Bank, Insurance, Transport, Emergency) */}
              {['tourism', 'bank', 'insurance', 'transport', 'emergency'].includes(activeTab) && (
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-6">
                  {/* Control Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                    <div className="flex items-center gap-3">
                      {activeTab === 'tourism' && <Compass className="text-emerald-600" size={24} />}
                      {activeTab === 'bank' && <Landmark className="text-emerald-600" size={24} />}
                      {activeTab === 'insurance' && <FileText className="text-emerald-600" size={24} />}
                      {activeTab === 'transport' && <Bus className="text-emerald-600" size={24} />}
                      {activeTab === 'emergency' && <ShieldAlert className="text-emerald-600" size={24} />}
                      <div>
                        <h2 className="text-lg font-black text-gray-800">
                          {activeTab === 'tourism' && 'পর্যটন স্থান ও গাইড কন্ট্রোল'}
                          {activeTab === 'bank' && 'ব্যাংক ও আর্থিক প্রতিষ্ঠান কন্ট্রোল'}
                          {activeTab === 'insurance' && 'বীমা কোম্পানি ডিরেক্টরি কন্ট্রোল'}
                          {activeTab === 'transport' && `পরিবহন সময়সূচী (${transportSubTab === 'bus' ? 'বাস' : 'ট্রেন'})`}
                          {activeTab === 'emergency' && `জরুরী সেবা কন্টাক্ট (${emergencySubTab === 'ambulance' ? 'অ্যাম্বুলেন্স' : emergencySubTab === 'police' ? 'পুলিশি তথ্য' : 'ফায়ার সার্ভিস'})`}
                        </h2>
                        <p className="text-xs text-gray-400 font-bold">সার্ভিস ইনফরমেশন আপডেট এবং এন্ট্রি মডিউল।</p>
                      </div>
                    </div>

                    {!isAdding && (
                      <button
                        onClick={() => setIsAdding(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 border-none cursor-pointer self-start shadow-sm transition-all"
                      >
                        <Plus size={16} /> নতুন যোগ করুন
                      </button>
                    )}
                  </div>

                  {/* SUB TAB CONTROLS for Transport and Emergency */}
                  {activeTab === 'transport' && !isAdding && (
                    <div className="flex gap-2 p-1 bg-gray-50 rounded-xl mb-6 max-w-xs border border-gray-100">
                      <button
                        onClick={() => setTransportSubTab('bus')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                          transportSubTab === 'bus' ? 'bg-white text-emerald-600 shadow-sm font-extrabold' : 'bg-transparent text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        🚌 বাস সিডিউল
                      </button>
                      <button
                        onClick={() => setTransportSubTab('train')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                          transportSubTab === 'train' ? 'bg-white text-emerald-600 shadow-sm font-extrabold' : 'bg-transparent text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        🚆 ট্রেন সিডিউল
                      </button>
                    </div>
                  )}

                  {activeTab === 'emergency' && !isAdding && (
                    <div className="flex gap-2 p-1 bg-gray-50 rounded-xl mb-6 max-w-md border border-gray-100">
                      <button
                        onClick={() => setEmergencySubTab('ambulance')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                          emergencySubTab === 'ambulance' ? 'bg-white text-rose-600 shadow-sm font-extrabold' : 'bg-transparent text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        🚑 অ্যাম্বুলেন্স
                      </button>
                      <button
                        onClick={() => setEmergencySubTab('police')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                          emergencySubTab === 'police' ? 'bg-white text-blue-600 shadow-sm font-extrabold' : 'bg-transparent text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        👮 পুলিশি তথ্য
                      </button>
                      <button
                        onClick={() => setEmergencySubTab('fire')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                          emergencySubTab === 'fire' ? 'bg-white text-amber-600 shadow-sm font-extrabold' : 'bg-transparent text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        🚒 ফায়ার সার্ভিস
                      </button>
                    </div>
                  )}

                  {/* CRUD FORM WORKSPACE */}
                  {isAdding ? (
                    <form onSubmit={handleFormSubmit} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl shadow-inner space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
                        <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
                          <Plus size={16} /> {editingId ? 'এডিট করুন' : 'নতুন রেকর্ড যোগ করুন'}
                        </h3>
                        <button type="button" onClick={closeForm} className="text-slate-400 hover:text-rose-500 bg-transparent border-none cursor-pointer p-1">
                          <X size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* FORM: Tourism */}
                        {activeTab === 'tourism' && (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">স্পট ইউনিক আইডি (e.g. rajbari-palace)*</label>
                              <input
                                type="text"
                                disabled={!!editingId}
                                value={tourismForm.id || ""}
                                onChange={e => setTourismForm({ ...tourismForm, id: e.target.value })}
                                placeholder="রাজবাড়ী প্রাসাদের জন্য: rajbari-palace"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">স্পট এর নাম*</label>
                              <input
                                type="text"
                                value={tourismForm.name || ""}
                                onChange={e => setTourismForm({ ...tourismForm, name: e.target.value })}
                                placeholder="যেমন: প্রধান রাজপ্রাসাদ"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ক্যাটাগরি*</label>
                              <select
                                value={tourismForm.category || ""}
                                onChange={e => setTourismForm({ ...tourismForm, category: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                              >
                                <option value="rajbari">পুঠিয়া রাজবাড়ী</option>
                                <option value="temples">বড় শিব মন্দির / অন্যান্য মন্দির</option>
                                <option value="spots">ঐতিহাসিক স্থান ও দিঘী</option>
                                <option value="guide">ভ্রমণ গাইডলাইন</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ইমোজি আইকন*</label>
                              <input
                                type="text"
                                value={tourismForm.icon || ""}
                                onChange={e => setTourismForm({ ...tourismForm, icon: e.target.value })}
                                placeholder="🏛️, 🧱, 🧭, 🛶, 🚌"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                required
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-1">বিস্তারিত তথ্য বা গাইডলাইন*</label>
                              <textarea
                                value={tourismForm.detail || ""}
                                onChange={e => setTourismForm({ ...tourismForm, detail: e.target.value })}
                                placeholder="স্পট এর বিস্তারিত ইতিহাস, পরিদর্শনের নিয়ম ও বিবরণ..."
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white h-28"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ম্যাপ কোঅর্ডিনেটস (Latitude, Longitude)</label>
                              <input
                                type="text"
                                value={tourismForm.coords || ""}
                                onChange={e => setTourismForm({ ...tourismForm, coords: e.target.value })}
                                placeholder="যেমন: 24.3644, 88.8413"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">সিরিয়াল অর্ডার (সাজানোর জন্য ক্রম)</label>
                              <input
                                type="number"
                                value={tourismForm.order || ""}
                                onChange={e => setTourismForm({ ...tourismForm, order: Number(e.target.value) })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                              />
                            </div>
                          </>
                        )}

                        {/* FORM: Bank */}
                        {activeTab === 'bank' && (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ব্যাংকের নাম*</label>
                              <input
                                type="text"
                                value={bankForm.name || ""}
                                onChange={e => setBankForm({ ...bankForm, name: e.target.value })}
                                placeholder="যেমন: সোনালী ব্যাংক পিএলসি"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">শাখার নাম*</label>
                              <input
                                type="text"
                                value={bankForm.branch || ""}
                                onChange={e => setBankForm({ ...bankForm, branch: e.target.value })}
                                placeholder="যেমন: পুঠিয়া শাখা"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">শ্রেণী*</label>
                              <select
                                value={bankForm.category || ""}
                                onChange={e => setBankForm({ ...bankForm, category: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                              >
                                <option value="commercial">বাণিজ্যিক ব্যাংক (Commercial)</option>
                                <option value="specialized">বিশেষায়িত ব্যাংক (Specialized)</option>
                                <option value="mfi">আর্থিক প্রতিষ্ঠান ও ক্ষুদ্রঋণ (MFI)</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-6 p-3">
                              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bankForm.isIslamic}
                                  onChange={e => setBankForm({ ...bankForm, isIslamic: e.target.checked })}
                                  className="w-4 h-4 text-emerald-600 rounded"
                                />
                                ইসলামী ব্যাংকিং সেবা
                              </label>
                              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bankForm.hasAtm}
                                  onChange={e => setBankForm({ ...bankForm, hasAtm: e.target.checked })}
                                  className="w-4 h-4 text-emerald-600 rounded"
                                />
                                এটিএম (ATM) বুথ সুবিধা
                              </label>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ঠিকানা*</label>
                              <input
                                type="text"
                                value={bankForm.address || ""}
                                onChange={e => setBankForm({ ...bankForm, address: e.target.value })}
                                placeholder="যেমন: পুঠিয়া বাজার, পুঠিয়া সদর"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ফোন কন্টাক্ট নম্বর*</label>
                              <input
                                type="text"
                                value={bankForm.phone || ""}
                                onChange={e => setBankForm({ ...bankForm, phone: e.target.value })}
                                placeholder="যেমন: ০১৭০০-০০০০০০"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">সেবার সময়সূচী*</label>
                              <input
                                type="text"
                                value={bankForm.schedule || ""}
                                onChange={e => setBankForm({ ...bankForm, schedule: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">শাখা ব্যবস্থাপক (Manager)</label>
                              <input
                                type="text"
                                value={bankForm.manager || ""}
                                onChange={e => setBankForm({ ...bankForm, manager: e.target.value })}
                                placeholder="ম্যানেজারের নাম..."
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-1">বিশেষ সেবা (Comma Separated)</label>
                              <input
                                type="text"
                                value={bankForm.services || ""}
                                onChange={e => setBankForm({ ...bankForm, services: e.target.value })}
                                placeholder="মেয়াদী আমানত, ডিপিএস, লোন, রেমিটেন্স..."
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">এটিএম তথ্য ও বুথ লোকেশন</label>
                              <input
                                type="text"
                                value={bankForm.atmInfo || ""}
                                onChange={e => setBankForm({ ...bankForm, atmInfo: e.target.value })}
                                placeholder="যেমন: ব্যাংকের সাথে এটিএম বুথ ২৪ ঘণ্টা সচল"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ওয়েবসাইট ইউআরএল (Website Link)</label>
                              <input
                                type="url"
                                value={bankForm.website || ""}
                                onChange={e => setBankForm({ ...bankForm, website: e.target.value })}
                                placeholder="https://www.example.com"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-1">পরিচিতিমূলক সংক্ষিপ্ত বিবরণ*</label>
                              <textarea
                                value={bankForm.desc || ""}
                                onChange={e => setBankForm({ ...bankForm, desc: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white h-20"
                                required
                              />
                            </div>
                          </>
                        )}

                        {/* FORM: Insurance */}
                        {activeTab === 'insurance' && (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">বীমা কোম্পানির নাম*</label>
                              <input
                                type="text"
                                value={insuranceForm.name || ""}
                                onChange={e => setInsuranceForm({ ...insuranceForm, name: e.target.value })}
                                placeholder="যেমন: পপুলার লাইফ ইন্স্যুরেন্স"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">শাখার নাম*</label>
                              <input
                                type="text"
                                value={insuranceForm.branch || ""}
                                onChange={e => setInsuranceForm({ ...insuranceForm, branch: e.target.value })}
                                placeholder="যেমন: পুঠিয়া সদর ইউনিট"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">বীমার ধরণ*</label>
                              <select
                                value={insuranceForm.category || ""}
                                onChange={e => setInsuranceForm({ ...insuranceForm, category: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                              >
                                <option value="life">জীবন বীমা (Life Insurance)</option>
                                <option value="non-life">সাধারণ / অ-জীবন বীমা (General/Non-Life)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">মালিকানা ধরণ*</label>
                              <select
                                value={insuranceForm.type || ""}
                                onChange={e => setInsuranceForm({ ...insuranceForm, type: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                              >
                                <option value="govt">সরকারি (Government)</option>
                                <option value="private">বেসরকারি (Private)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ঠিকানা*</label>
                              <input
                                type="text"
                                value={insuranceForm.address || ""}
                                onChange={e => setInsuranceForm({ ...insuranceForm, address: e.target.value })}
                                placeholder="পুঠিয়া সদর"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">মোবাইল কন্টাক্ট নম্বর*</label>
                              <input
                                type="text"
                                value={insuranceForm.phone || ""}
                                onChange={e => setInsuranceForm({ ...insuranceForm, phone: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-1">বীমা সেবা (Comma Separated)</label>
                              <input
                                type="text"
                                value={insuranceForm.services || ""}
                                onChange={e => setInsuranceForm({ ...insuranceForm, services: e.target.value })}
                                placeholder="শিক্ষা বীমা, ডিপিএস স্কিম, হজ্জ স্কিম, স্বাস্থ্য বীমা..."
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ওয়েবসাইট ইউআরএল</label>
                              <input
                                type="url"
                                value={insuranceForm.website || ""}
                                onChange={e => setInsuranceForm({ ...insuranceForm, website: e.target.value })}
                                placeholder="https://www.example.com"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-1">সংক্ষিপ্ত পরিচিতি ও বিবরণ*</label>
                              <textarea
                                value={insuranceForm.desc || ""}
                                onChange={e => setInsuranceForm({ ...insuranceForm, desc: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white h-20"
                                required
                              />
                            </div>
                          </>
                        )}

                        {/* FORM: Transport (Bus) */}
                        {activeTab === 'transport' && transportSubTab === 'bus' && (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">পরিবহন / বাস অপারেটর নাম*</label>
                              <input
                                type="text"
                                value={busForm.operator || ""}
                                onChange={e => setBusForm({ ...busForm, operator: e.target.value })}
                                placeholder="যেমন: দেশ ট্রাভেলস (Desh Travels)"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">বাসের ধরণ*</label>
                              <select
                                value={busForm.type || ""}
                                onChange={e => setBusForm({ ...busForm, type: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                              >
                                <option value="এসি ও নন-এসি লাক্সারি (AC & Non-AC)">এসি ও নন-এসি লাক্সারি</option>
                                <option value="নন-এসি (Non-AC)">নন-এসি লাক্সারি</option>
                                <option value="এসি লাক্সারি (AC)">এসি লাক্সারি</option>
                                <option value="লোকাল / সিটিং সার্ভিস (Local)">লোকাল / সিটিং সার্ভিস</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">যাত্রাপথ / রুট*</label>
                              <input
                                type="text"
                                value={busForm.route || ""}
                                onChange={e => setBusForm({ ...busForm, route: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ছাড়ার সময়সূচী*</label>
                              <input
                                type="text"
                                value={busForm.timing || ""}
                                onChange={e => setBusForm({ ...busForm, timing: e.target.value })}
                                placeholder="সকাল ০৭:১৫, ০৯:৩০, রাত ০৯:৩০"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">টিকিট ভাড়া*</label>
                              <input
                                type="text"
                                value={busForm.ticketPrice || ""}
                                onChange={e => setBusForm({ ...busForm, ticketPrice: e.target.value })}
                                placeholder="নন-এসি: ৮০০ টাকা | এসি: ১২০০ টাকা"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">বোর্ডিং ইস্টার (উঠার স্থান)*</label>
                              <input
                                type="text"
                                value={busForm.boarding || ""}
                                onChange={e => setBusForm({ ...busForm, boarding: e.target.value })}
                                placeholder="যেমন: পুঠিয়া বাস স্ট্যান্ড, বানেশ্বর মোড়"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-1">টিকিট কাউন্টার ও কন্টাক্ট নম্বর (Format: Counter: Phone, Counter2: Phone2)*</label>
                              <textarea
                                value={busForm.counters || ""}
                                onChange={e => setBusForm({ ...busForm, counters: e.target.value })}
                                placeholder="পুঠিয়া কাউন্টার: ০১৭১৩-১৪৯২০২, বানেশ্বর কাউন্টার: ০১৭১৩-১৪৯২০৫"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white h-20"
                                required
                              />
                            </div>
                          </>
                        )}

                        {/* FORM: Transport (Train) */}
                        {activeTab === 'transport' && transportSubTab === 'train' && (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ট্রেনের নাম*</label>
                              <input
                                type="text"
                                value={trainForm.name || ""}
                                onChange={e => setTrainForm({ ...trainForm, name: e.target.value })}
                                placeholder="যেমন: বনলতা এক্সপ্রেস (Banalata Express)"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ছুটির দিন / বন্ধের দিন*</label>
                              <input
                                type="text"
                                value={trainForm.offDay || ""}
                                onChange={e => setTrainForm({ ...trainForm, offDay: e.target.value })}
                                placeholder="যেমন: শুক্রবার (Friday)"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">রুট / যাতায়াত পথ*</label>
                              <input
                                type="text"
                                value={trainForm.route || ""}
                                onChange={e => setTrainForm({ ...trainForm, route: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">সময়সূচী (Arrival & Departure)*</label>
                              <input
                                type="text"
                                value={trainForm.timing || ""}
                                onChange={e => setTrainForm({ ...trainForm, timing: e.target.value })}
                                placeholder="রাজশাহী থেকে: সকাল ০৭:৩০, ঢাকা পৌঁছে: দুপুর ০১:০০"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">টিকিট ভাড়া*</label>
                              <input
                                type="text"
                                value={trainForm.ticketPrice || ""}
                                onChange={e => setTrainForm({ ...trainForm, ticketPrice: e.target.value })}
                                placeholder="শোভন চেয়ার: ৪২৫ টাকা | এসি: ৮২৫ টাকা"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">বোর্ডিং স্টেশন*</label>
                              <input
                                type="text"
                                value={trainForm.boarding || ""}
                                onChange={e => setTrainForm({ ...trainForm, boarding: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-1">গুরুত্বপূর্ণ নোট / মন্তব্য</label>
                              <textarea
                                value={trainForm.note || ""}
                                onChange={e => setTrainForm({ ...trainForm, note: e.target.value })}
                                placeholder="ট্রেনটি পুঠিয়ার কাছাকাছি আব্দুলপুর স্টেশনে ৩ মিনিট বিরতি দেয়..."
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white h-20"
                              />
                            </div>
                          </>
                        )}

                        {/* FORM: Emergency Service */}
                        {activeTab === 'emergency' && (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">সেবা প্রদানকারী / সেন্টারের নাম*</label>
                              <input
                                type="text"
                                value={emergencyForm.name || ""}
                                onChange={e => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
                                placeholder={emergencySubTab === 'ambulance' ? 'যেমন: পুঠিয়া উপজেলা হেলথ অ্যাম্বুলেন্স' : emergencySubTab === 'police' ? 'যেমন: অফিসার ইন চার্জ (OC)' : 'যেমন: পুঠিয়া ফায়ার স্টেশন'}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ক্যাটাগরি বা টাইপ*</label>
                              <select
                                value={emergencyForm.category || ""}
                                onChange={e => setEmergencyForm({ ...emergencyForm, category: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              >
                                <option value="">নির্বাচন করুন</option>
                                {emergencySubTab === 'ambulance' && (
                                  <>
                                    <option value="govt">উপজেলা সরকারি অ্যাম্বুলেন্স</option>
                                    <option value="private">বেসরকারি / ক্লিনিক অ্যাম্বুলেন্স</option>
                                    <option value="free">ফ্রি অ্যাম্বুলেন্স সার্ভিস</option>
                                  </>
                                )}
                                {emergencySubTab === 'police' && (
                                  <>
                                    <option value="station">পুলিশ স্টেশন / থানা</option>
                                    <option value="officer">আইনশৃঙ্খলা রক্ষাকারী অফিসার কন্টাক্ট</option>
                                    <option value="legal">আইনী সহায়তা ও জিডি সেল</option>
                                    <option value="complaint">নারী ও শিশু ডেস্ক</option>
                                  </>
                                )}
                                {emergencySubTab === 'fire' && (
                                  <>
                                    <option value="puthia">পুঠিয়া ফায়ার স্টেশন কন্টাক্ট</option>
                                    <option value="control_room">কেন্দ্রীয় কন্ট্রোল রুম</option>
                                    <option value="team_leader">স্টেশন অফিসার / টিম লিডার</option>
                                  </>
                                )}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">লোকেশন / কাভারেজ এরিয়া*</label>
                              <input
                                type="text"
                                value={emergencyForm.location || ""}
                                onChange={e => setEmergencyForm({ ...emergencyForm, location: e.target.value })}
                                placeholder="যেমন: পুঠিয়া উপজেলা কমপ্লেক্স, পুঠিয়া সদর"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">জরুরী ফোন কন্টাক্ট নম্বর*</label>
                              <input
                                type="text"
                                value={emergencyForm.contact || ""}
                                onChange={e => setEmergencyForm({ ...emergencyForm, contact: e.target.value })}
                                placeholder="যেমন: ০১৭০০-০০০০০০"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">সেবার সময়সূচী*</label>
                              <input
                                type="text"
                                value={emergencyForm.serviceHours || ""}
                                onChange={e => setEmergencyForm({ ...emergencyForm, serviceHours: e.target.value })}
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-1">সেবার বিবরণ / কন্টাক্ট তথ্য*</label>
                              <textarea
                                value={emergencyForm.details || ""}
                                onChange={e => setEmergencyForm({ ...emergencyForm, details: e.target.value })}
                                placeholder="যেমন: পুঠিয়া উপজেলায় যেকোন ফায়ার বা উদ্ধারকাজে যোগাযোগের জন্য প্রধান নম্বর।"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white h-20"
                                required
                              />
                            </div>
                          </>
                        )}
                        {/* FORM: Services */}
                        {activeTab === 'services' && (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">সেবার নাম*</label>
                              <input
                                type="text"
                                value={serviceForm.name || ""}
                                onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                                placeholder="যেমন: সরকারি সেবা"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">ক্যাটাগরি</label>
                              <input
                                type="text"
                                value={serviceForm.category || ""}
                                onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}
                                placeholder="যেমন: general"
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-1">বিস্তারিত বিবরণ</label>
                              <textarea
                                value={serviceForm.description || ""}
                                onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                                placeholder="সেবার বিবরণ..."
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white h-20"
                              />
                            </div>
                            <div className="flex items-center gap-6 p-3 md:col-span-2">
                              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={serviceForm.isApproved}
                                  onChange={e => setServiceForm({ ...serviceForm, isApproved: e.target.checked })}
                                  className="w-4 h-4 text-emerald-600 rounded"
                                />
                                অনুমোদিত (Approved)
                              </label>
                              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={serviceForm.isVisible}
                                  onChange={e => setServiceForm({ ...serviceForm, isVisible: e.target.checked })}
                                  className="w-4 h-4 text-emerald-600 rounded"
                                />
                                দৃশ্যমান (Visible)
                              </label>
                              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={serviceForm.isFeatured}
                                  onChange={e => setServiceForm({ ...serviceForm, isFeatured: e.target.checked })}
                                  className="w-4 h-4 text-emerald-600 rounded"
                                />
                                ফিচারড (Featured)
                              </label>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200/50">
                        <button
                          type="button"
                          onClick={closeForm}
                          className="bg-white hover:bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl text-xs font-black border border-slate-200 cursor-pointer transition-all"
                        >
                          বাতিল করুন
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 border-none cursor-pointer transition-all disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          <span>সেভ করুন</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* LISTING TABLE */
                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-inner bg-slate-50/50">
                      {loading ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                          <Loader2 size={36} className="text-emerald-600 animate-spin" />
                          <p className="text-xs text-gray-400 font-bold">সার্ভিস ডাটা লোড হচ্ছে...</p>
                        </div>
                      ) : items.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 font-bold text-xs flex flex-col items-center gap-2">
                          <AlertTriangle size={32} className="text-gray-300" />
                          <span>কোনো সার্ভিস ডাটা পাওয়া যায়নি। ডাটা এন্ট্রি করতে উপরে "নতুন যোগ করুন" বাটনে ক্লিক করুন।</span>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                              <tr>
                                {activeTab === 'tourism' && (
                                  <>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">স্পট আইডি</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">নাম</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">ক্যাটাগরি</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">অবস্থান</th>
                                  </>
                                )}
                                {activeTab === 'bank' && (
                                  <>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">ব্যাংকের নাম</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">শাখা ও ধরণ</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">কন্টাক্ট</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">লোকেশন</th>
                                  </>
                                )}
                                {activeTab === 'insurance' && (
                                  <>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">কোম্পানির নাম</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">শাখা ও মালিকানা</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">কন্টাক্ট</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">ক্যাটাগরি</th>
                                  </>
                                )}
                                {activeTab === 'transport' && transportSubTab === 'bus' && (
                                  <>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">অপারেটর</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">যাত্রাপথ ও ভাড়া</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">সময়সূচী</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">বোর্ডিং ইস্টার</th>
                                  </>
                                )}
                                {activeTab === 'transport' && transportSubTab === 'train' && (
                                  <>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">ট্রেনের নাম</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">যাত্রাপথ</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">বন্ধের দিন</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">সময় ও ভাড়া</th>
                                  </>
                                )}
                                {activeTab === 'emergency' && (
                                  <>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">সেবা কেন্দ্র</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">ক্যাটাগরি</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">জরুরী কন্টাক্ট</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">ডিউটি আওয়ার</th>
                                  </>
                                )}
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">অ্যাকশন</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                  {/* ROW: Tourism */}
                                  {activeTab === 'tourism' && (
                                    <>
                                      <td className="px-6 py-4 text-xs font-black text-gray-900">{item.id}</td>
                                      <td className="px-6 py-4 text-xs font-extrabold text-slate-700 flex items-center gap-2">
                                        <span>{item.icon}</span>
                                        <span>{item.name}</span>
                                      </td>
                                      <td className="px-6 py-4 text-[11px] font-bold text-gray-500">
                                        {item.category === 'rajbari' ? '🏰 রাজবাড়ী' : item.category === 'temples' ? '🏛️ শিব মন্দির' : item.category === 'spots' ? '🛶 দিঘী ও পুণ্যক্ষেত্র' : '🧭 ভ্রমণ গাইড'}
                                      </td>
                                      <td className="px-6 py-4 text-[11px] font-medium text-slate-500 max-w-[200px] truncate">{item.detail}</td>
                                    </>
                                  )}

                                  {/* ROW: Bank */}
                                  {activeTab === 'bank' && (
                                    <>
                                      <td className="px-6 py-4 text-xs font-black text-gray-900">{item.name}</td>
                                      <td className="px-6 py-4 text-[11px] font-bold text-slate-600">
                                        {item.branch} <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-full ml-1">{item.category === 'commercial' ? 'বাণিজ্যিক' : item.category === 'specialized' ? 'বিশেষায়িত' : 'ক্ষুদ্রঋণ'}</span>
                                      </td>
                                      <td className="px-6 py-4 text-xs font-extrabold text-slate-800">{item.phone}</td>
                                      <td className="px-6 py-4 text-[11px] font-medium text-gray-500">{item.address}</td>
                                    </>
                                  )}

                                  {/* ROW: Insurance */}
                                  {activeTab === 'insurance' && (
                                    <>
                                      <td className="px-6 py-4 text-xs font-black text-gray-900">{item.name}</td>
                                      <td className="px-6 py-4 text-[11px] font-bold text-slate-600">
                                        {item.branch} <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full ml-1">{item.type === 'govt' ? 'সরকারি' : 'বেসরকারি'}</span>
                                      </td>
                                      <td className="px-6 py-4 text-xs font-extrabold text-slate-800">{item.phone}</td>
                                      <td className="px-6 py-4 text-[11px] font-bold text-emerald-600">{item.category === 'life' ? 'জীবন বীমা' : 'জেনারেল বীমা'}</td>
                                    </>
                                  )}

                                  {/* ROW: Transport (Bus) */}
                                  {activeTab === 'transport' && transportSubTab === 'bus' && (
                                    <>
                                      <td className="px-6 py-4 text-xs font-black text-slate-900">{item.operator}</td>
                                      <td className="px-6 py-4 text-[11px] font-bold text-slate-600">
                                        {item.route} <span className="block text-[10px] text-orange-600 font-extrabold mt-1">🎫 {item.ticketPrice}</span>
                                      </td>
                                      <td className="px-6 py-4 text-xs font-bold text-gray-700 leading-tight">{item.timing}</td>
                                      <td className="px-6 py-4 text-[11px] font-medium text-gray-500">{item.boarding}</td>
                                    </>
                                  )}

                                  {/* ROW: Transport (Train) */}
                                  {activeTab === 'transport' && transportSubTab === 'train' && (
                                    <>
                                      <td className="px-6 py-4 text-xs font-black text-slate-900">{item.name}</td>
                                      <td className="px-6 py-4 text-[11px] font-bold text-slate-600">{item.route}</td>
                                      <td className="px-6 py-4 text-xs font-extrabold text-rose-600">{item.offDay}</td>
                                      <td className="px-6 py-4 text-[11px] font-bold text-emerald-600">
                                        {item.timing} <span className="block text-[10px] text-orange-600 font-extrabold mt-1">💵 {item.ticketPrice}</span>
                                      </td>
                                    </>
                                  )}

                                  {/* ROW: Emergency */}
                                  {activeTab === 'emergency' && (
                                    <>
                                      <td className="px-6 py-4 text-xs font-black text-slate-900">{item.name}</td>
                                      <td className="px-6 py-4 text-[11px] font-bold text-slate-500">
                                        {emergencySubTab === 'ambulance' ? `🚑 ${item.category === 'govt' ? 'সরকারি অ্যাম্বুলেন্স' : 'প্রাইভেট অ্যাম্বুলেন্স'}` : emergencySubTab === 'police' ? `👮 ${item.category === 'station' ? 'পুলিশ থানা' : 'পুলিশ অফিসার'}` : `🚒 ফায়ার স্টেশন`}
                                      </td>
                                      <td className="px-6 py-4 text-xs font-extrabold text-rose-600">{item.contact}</td>
                                      <td className="px-6 py-4 text-xs font-extrabold text-slate-700">{item.serviceHours}</td>
                                    </>
                                  )}

                                  <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <button
                                      onClick={() => handleEditClick(item)}
                                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl border-none cursor-pointer bg-transparent transition-all"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl border-none cursor-pointer bg-transparent transition-all ml-1.5"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
