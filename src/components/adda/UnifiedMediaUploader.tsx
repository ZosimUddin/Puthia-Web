import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Globe, 
  Users, 
  Film,
  Camera,
  Play
} from 'lucide-react';
import { 
  mediaProcessingService, 
  MediaTarget, 
  MediaPrivacy, 
  MediaRecord, 
  UploadProgressInfo,
  MEDIA_VALIDATION_RULES
} from '../../services/mediaProcessingService';

interface UnifiedMediaUploaderProps {
  target: MediaTarget;
  userId: string;
  userName?: string;
  defaultPrivacy?: MediaPrivacy;
  allowMultiple?: boolean;
  onUploadSuccess: (media: MediaRecord | MediaRecord[]) => void;
  onClose?: () => void;
}

export const UnifiedMediaUploader: React.FC<UnifiedMediaUploaderProps> = ({
  target,
  userId,
  userName = 'নাগরিক',
  defaultPrivacy = 'public',
  allowMultiple = false,
  onUploadSuccess,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [privacy, setPrivacy] = useState<MediaPrivacy>(defaultPrivacy);
  const [isDragging, setIsDragging] = useState(false);
  
  // Upload & processing state
  const [isUploading, setIsUploading] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<UploadProgressInfo | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [completedRecords, setCompletedRecords] = useState<MediaRecord[]>([]);
  
  // Custom video thumbnail
  const [customThumbnail, setCustomThumbnail] = useState<string | undefined>(undefined);
  const [previewUrls, setPreviewUrls] = useState<{ url: string; type: string; name: string; size: string }[]>([]);

  const rules = MEDIA_VALIDATION_RULES[target] || MEDIA_VALIDATION_RULES.post_photo;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      processSelectedFiles(allowMultiple ? files : [files[0]]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      processSelectedFiles(allowMultiple ? files : [files[0]]);
    }
  };

  const processSelectedFiles = (files: File[]) => {
    setSelectedFiles(files);
    setUploadError(null);
    const previews = files.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type,
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB'
    }));
    setPreviewUrls(previews);
  };

  const handleRemoveFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updatedPreviews);
    if (updated.length === 0) {
      setUploadError(null);
      setCurrentProgress(null);
    }
  };

  const startUploadPipeline = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    const results: MediaRecord[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const record = await mediaProcessingService.uploadMedia(file, {
          ownerId: userId,
          uploaderId: userId,
          uploaderName: userName,
          target,
          privacy,
          customThumbnail,
          onProgress: (prog) => {
            // Adjust progress relative to total files
            const adjustedPercent = Math.round(((i * 100) + prog.percent) / selectedFiles.length);
            setCurrentProgress({
              ...prog,
              percent: adjustedPercent,
              message: selectedFiles.length > 1 
                ? `(${i + 1}/${selectedFiles.length}) ${prog.message}`
                : prog.message
            });
          }
        });
        results.push(record);
      }

      setCompletedRecords(results);
      setIsUploading(false);
      
      // Notify parent after brief confirmation
      setTimeout(() => {
        if (allowMultiple) {
          onUploadSuccess(results);
        } else {
          onUploadSuccess(results[0]);
        }
      }, 700);

    } catch (err: any) {
      setIsUploading(false);
      setUploadError(err.message || 'মিডিয়া আপলোড ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    }
  };

  const getTargetTitle = () => {
    switch (target) {
      case 'profile_photo': return '👤 প্রোফাইল ছবি আপলোড';
      case 'cover_photo': return '🖼️ কভার ফটো আপলোড';
      case 'post_photo': return '📝 পোস্ট ছবি আপলোড';
      case 'post_video': return '🎥 পোস্ট ভিডিও আপলোড';
      case 'reel': return '🎬 পুঠিয়া রিলস আপলোড';
      case 'story': return '📸 আজকের আড্ডা (স্টোরি)';
      case 'marketplace_image': return '🛒 মার্কেটপ্লেস পণ্য ছবি';
      case 'chat_image': return '💬 চ্যাট ছবি/ফাইল';
      default: return '📁 ফাইল ও মিডিয়া আপলোড';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden max-w-xl w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#006a4e] flex items-center justify-center font-black">
            {target.includes('video') || target === 'reel' ? <Film size={18} /> : <Camera size={18} />}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
              {getTargetTitle()}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold">
              স্বয়ংক্রিয় ভ্যারিয়েন্ট, নিরাপত্তা স্ক্যান ও EXIF অপ্টিমাইজেশন
            </p>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer border-0 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Dropzone Area */}
        {selectedFiles.length === 0 ? (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragging 
                ? 'border-[#006a4e] bg-emerald-50/50 scale-[0.99]' 
                : 'border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              multiple={allowMultiple}
              accept={rules.allowedMimeTypes.join(',')}
              className="hidden" 
            />

            <div className="w-16 h-16 rounded-full bg-white text-[#006a4e] shadow-md border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>

            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-black text-slate-800">
                ফাইল ড্র্যাগ করে এখানে আনুন অথবা <span className="text-[#006a4e] underline">ব্রাউজ করুন</span>
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">
                অনুমোদিত: {rules.allowedMimeTypes.map(m => m.split('/')[1]?.toUpperCase()).join(', ')} • সর্বোচ্চ সাইজ: {rules.maxSizeMB} MB
              </p>
              {rules.maxDurationSeconds && (
                <p className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  ⏱️ সর্বোচ্চ সময়সীমা: {Math.floor(rules.maxDurationSeconds / 60)} মিনিট {rules.maxDurationSeconds % 60 ? `${rules.maxDurationSeconds % 60} সে.` : ''}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Selected Files Preview Grid */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700">
                নির্বাচিত ফাইল ({selectedFiles.length})
              </span>
              {!isUploading && allowMultiple && (
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-black text-[#006a4e] hover:underline cursor-pointer bg-transparent border-0"
                >
                  + আরও ফাইল যোগ করুন
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                multiple={allowMultiple}
                accept={rules.allowedMimeTypes.join(',')}
                className="hidden" 
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
              {previewUrls.map((prev, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900 aspect-square shadow-xs">
                  {prev.type.startsWith('video/') ? (
                    <div className="w-full h-full relative flex items-center justify-center">
                      <video src={prev.url} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs">
                          <Play size={14} className="ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img src={prev.url} alt={prev.name} className="w-full h-full object-cover" />
                  )}

                  {!isUploading && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition border-0 cursor-pointer shadow-sm"
                    >
                      <X size={12} />
                    </button>
                  )}

                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-white text-[9px] font-bold truncate">
                    {prev.name} ({prev.size})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security & Privacy Settings Bar */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          {/* Privacy Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-600">গোপনীয়তা:</span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
              {privacy === 'public' && <Globe size={13} className="text-[#006a4e]" />}
              {privacy === 'friends' && <Users size={13} className="text-blue-600" />}
              {privacy === 'only_me' && <Lock size={13} className="text-amber-600" />}
              
              <select 
                value={privacy} 
                onChange={(e) => setPrivacy(e.target.value as MediaPrivacy)}
                disabled={isUploading}
                className="text-[11px] font-bold text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer"
              >
                <option value="public">🌎 পাবলিক (Public)</option>
                <option value="friends">👥 শুধুমাত্র বন্ধুরা (Friends)</option>
                <option value="only_me">🔒 শুধুমাত্র আমি (Only Me)</option>
              </select>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60">
            <ShieldCheck size={13} />
            <span>EXIF ও লোকেশন মেটাডাটা মুক্ত</span>
          </div>
        </div>

        {/* Real-time Progress Bar */}
        {isUploading && currentProgress && (
          <div className="space-y-2 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/70">
            <div className="flex items-center justify-between text-xs font-black text-slate-800">
              <span className="flex items-center gap-1.5 text-[#006a4e]">
                <RefreshCw size={14} className="animate-spin" />
                {currentProgress.message}
              </span>
              <span className="bg-[#006a4e] text-white px-2 py-0.5 rounded-full text-[10px]">
                {currentProgress.percent}%
              </span>
            </div>

            {/* Visual ASCII / Gradient Progress Bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-[#006a4e] to-teal-700 h-full rounded-full transition-all duration-300 relative"
                style={{ width: `${currentProgress.percent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span>স্টেপ: {currentProgress.step.replace('_', ' ').toUpperCase()}</span>
              {currentProgress.bytesUploaded && (
                <span>{(currentProgress.bytesUploaded / (1024 * 1024)).toFixed(1)} MB / {(currentProgress.totalBytes! / (1024 * 1024)).toFixed(1)} MB</span>
              )}
            </div>
          </div>
        )}

        {/* Error Alert with Retry */}
        {uploadError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold space-y-2 flex flex-col items-start">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
            <button 
              type="button" 
              onClick={startUploadPipeline}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer border-0 transition shadow-xs"
            >
              <RefreshCw size={13} /> পুনরায় চেষ্টা করুন (Retry)
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          {onClose && (
            <button 
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black cursor-pointer border-0 transition"
            >
              বাতিল
            </button>
          )}

          <button 
            type="button"
            onClick={startUploadPipeline}
            disabled={selectedFiles.length === 0 || isUploading}
            className="px-6 py-2.5 rounded-2xl bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-black shadow-md shadow-emerald-800/20 flex items-center gap-2 cursor-pointer border-0 transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            {isUploading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>প্রসেসিং ও আপলোড হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>আপলোড ও ভ্যারিয়েন্ট তৈরি করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
