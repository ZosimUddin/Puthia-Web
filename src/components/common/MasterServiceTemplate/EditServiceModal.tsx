import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Save, AlertCircle, Image as ImageIcon, Trash2, Camera, ShieldAlert } from 'lucide-react';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { ServiceConfig } from '../../../config/servicesConfig';
import { logAuditActivity } from '../../../services/auditLogger';

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Record<string, any>;
  config: ServiceConfig;
  onSuccess?: () => void;
}

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  isOpen,
  onClose,
  item,
  config,
  onSuccess,
}) => {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Permission calculation
  const isStaff = userProfile?.role === 'super_admin' || userProfile?.role === 'admin' || userProfile?.role === 'moderator' || userProfile?.role === 'editor';
  const isOwner = Boolean(user && item && (item.userId === user.uid || item.createdBy === user.uid || item.authorId === user.uid));
  const canEdit = isStaff || isOwner;

  useEffect(() => {
    if (item) {
      const initial: Record<string, string> = {};
      config.addFormFields.forEach((f) => {
        initial[f.id] = String(item[f.id] || item[config.fieldsSchema.nameKey] || '');
      });
      setFormData({
        ...initial,
        ...item,
      });
      setSelectedImage(item.imageUrl || item.image || item.photo || null);
    }
  }, [item, config]);

  if (!isOpen) return null;

  const handleChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('ছবিটির সাইজ ১০ মেগাবাইটের কম হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setSelectedImage(compressedDataUrl);
          setErrorMessage(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage('সম্পাদনা করতে আপনাকে প্রথমে লগইন করতে হবে।');
      return;
    }

    if (!canEdit) {
      setErrorMessage('নিরাপত্তা নীতি: আপনার অন্যের যোগ করা তথ্য পরিবর্তনের অনুমতি নেই।');
      return;
    }

    // Validate required fields
    for (const field of config.addFormFields) {
      if (field.required && !formData[field.id]?.trim()) {
        setErrorMessage(`"${field.label}" ঘরটি পূরণ করা আবশ্যক।`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Build safe payload: non-staff users cannot change verification badges or admin notes
      const payload: Record<string, any> = {
        ...formData,
        imageUrl: selectedImage || '',
        image: selectedImage || '',
        photo: selectedImage || '',
        updatedAt: new Date().toISOString(),
      };

      // Ensure author/user attribution for ownership rules
      if (!payload.userId && (user?.uid || item.userId)) {
        payload.userId = user?.uid || item.userId;
      }
      if (!payload.createdAt) {
        payload.createdAt = item.createdAt || new Date().toISOString();
      }

      // If regular user edits a record with 'correction_required', reset to 'pending'
      if (!isStaff) {
        if (item.status === 'correction_required') {
          payload.status = 'pending';
          payload.correctionNote = '';
        }
        // Protect admin fields from tampering by regular users
        delete payload.isVerified;
        delete payload.verificationBadge;
        delete payload.adminNote;
        delete payload.rejectionReason;
        delete payload.role;
      }

      const colName = item._collectionName || config.collectionName;
      const docRef = doc(db, colName, item.id);

      if (typeof item.id === 'string' && item.id.startsWith('fallback-')) {
        await setDoc(docRef, { ...item, ...payload }, { merge: true });
      } else {
        try {
          await updateDoc(docRef, payload);
        } catch (updateErr: any) {
          if (
            updateErr?.code === 'not-found' ||
            updateErr?.message?.includes('No document to update')
          ) {
            await setDoc(docRef, { ...item, ...payload }, { merge: true });
          } else {
            throw updateErr;
          }
        }
      }

      // Compute the changed fields for audit logging
      const diff: Record<string, { old: any; new: any }> = {};
      config.addFormFields.forEach((field) => {
        const oldVal = item[field.id] !== undefined ? String(item[field.id]) : "";
        const newVal = payload[field.id] !== undefined ? String(payload[field.id]) : "";
        if (oldVal !== newVal && field.id !== 'imageUrl' && field.id !== 'image' && field.id !== 'photo') {
          diff[field.label || field.id] = { old: oldVal, new: newVal };
        }
      });

      // Log to Global Activity & Audit Log
      const itemName = item[config.fieldsSchema.nameKey] || item.name || item.title || "নামহীন আইটেম";
      await logAuditActivity({
        action: "তথ্য সংস্করণ / এডিট",
        details: `${config.title} মডিউলে "${itemName}" নামক তথ্য আপডেট করা হয়েছে।`,
        category: "content",
        severity: "info",
        changes: diff,
        customUser: userProfile?.name || user?.displayName || "ব্যবহারকারী",
        customEmail: user?.email || user?.phoneNumber || "unknown"
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating service document:', err);
      setErrorMessage('তথ্য আপডেট করতে সমস্যা হয়েছে। আপনার অনুমতি যাচাই করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] my-auto"
        >
          {/* Header */}
          <div className="bg-[#006a4e] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">{config.icon}</span>
              <div>
                <h2 className="text-base sm:text-lg font-black leading-tight">তথ্য সম্পাদনা করুন</h2>
                <p className="text-xs text-emerald-100">{config.title}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-left flex-1">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Image section */}
            <div className="space-y-1.5 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <ImageIcon size={16} className="text-[#006a4e]" />
                <span>ছবি পরিবর্তন করুন (ঐচ্ছিক)</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {selectedImage ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 transition-colors border-none cursor-pointer"
                    title="ছবি মুছে ফেলুন"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-3 bg-white hover:bg-emerald-50/50 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl text-xs font-black text-[#006a4e] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Camera size={18} />
                    <span>নতুন ছবি তুলুন / আপলোড করুন</span>
                  </button>
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-4">
              {config.addFormFields
                .filter(
                  (f) =>
                    f.id !== 'imageUrl' &&
                    f.id !== 'image' &&
                    f.id !== 'photo' &&
                    f.id !== 'avatar' &&
                    !f.label.includes('ছবি') &&
                    !f.label.includes('ইমেজ')
                )
                .map((field) => (
                  <div key={field.id} className="space-y-1 text-left">
                    <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </span>
                      {field.required ? (
                        <span className="text-[10px] font-semibold text-rose-400">আবশ্যক</span>
                      ) : (
                        <span className="text-[10px] font-normal text-slate-400">ঐচ্ছিক</span>
                      )}
                    </label>

                    {field.type === 'select' ? (
                      <div className="space-y-2">
                        <select
                          value={
                            formData[field.id] && !field.options?.some(o => o.value === formData[field.id])
                              ? 'অন্যান্য'
                              : formData[field.id] || ''
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'অন্যান্য') {
                              handleChange(field.id, customInputs[field.id] || 'অন্যান্য');
                            } else {
                              handleChange(field.id, val);
                            }
                          }}
                          className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e] transition-all"
                          required={field.required}
                        >
                          <option value="">-- {field.label} নির্বাচন করুন --</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {(formData[field.id] === 'অন্যান্য' || (formData[field.id] && !field.options?.some(o => o.value === formData[field.id]))) && (
                          <input
                            type="text"
                            placeholder="নির্দিষ্ট বিবরণ নিজে টাইপ করুন..."
                            value={customInputs[field.id] || (formData[field.id] === 'অন্যান্য' ? '' : formData[field.id])}
                            onChange={(e) => {
                              const txt = e.target.value;
                              setCustomInputs((prev) => ({ ...prev, [field.id]: txt }));
                              handleChange(field.id, txt.trim() ? txt : 'অন্যান্য');
                            }}
                            className="w-full bg-emerald-50/70 border border-emerald-300 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                            required={field.required}
                          />
                        )}
                      </div>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e] transition-all"
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e] transition-all"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 border-none cursor-pointer transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 px-5 bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black rounded-2xl flex items-center gap-1.5 shadow-md border-none cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <Save size={15} />
                <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট করুন'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
