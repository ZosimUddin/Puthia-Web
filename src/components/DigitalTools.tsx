import React, { useState, useEffect, useRef } from 'react';
import { copyToClipboard as safeCopyToClipboard } from '../utils/clipboard';
import {
  ArrowLeft, QrCode, Clipboard, ExternalLink, Download, Upload, 
  Camera, Check, AlertCircle, FileArchive, Minimize2, Settings, 
  Type, RefreshCw, Layers, Scissors, Eye, FileImage, Image as ImageIcon,
  FolderOpen, MoveUp, MoveDown, Trash2, Maximize2, Play, Pause, List, CheckCircle,
  Crop, Eraser
} from 'lucide-react';
import jsQR from 'jsqr';
import { PDFDocument, degrees } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDFJS Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js`;

// Helper to convert numbers to Bengali
export function toBn(n: number | string): string {
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/[0-9]/g, (w) => bnNums[+w]);
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '০ B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const sizeVal = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${toBn(sizeVal)} ${sizes[i]}`;
};

// Main Digital Tools Wrapper Component
export default function DigitalTools({ 
  initialTool = 'qr_scanner', 
  onGoBack 
}: { 
  initialTool?: string; 
  onGoBack: () => void;
}) {
  const [activeTool, setActiveTool] = useState<string>(initialTool);

  const toolsList = [
    { id: 'qr_scanner', title: 'QR Code Scanner', bnTitle: 'কিউআর কোড স্ক্যানার', desc: 'ক্যামেরা বা ইমেজ থেকে কিউআর কোড স্ক্যান এবং ডিকোড করুন' },
    { id: 'file_compressor', title: 'File Compressor', bnTitle: 'ফাইল কম্প্রেশন', desc: 'ইমেজ সাইজ কমান এবং টেক্সট ফাইল জিপ কমপ্রেস করুন' },
    { id: 'image_resize', title: 'Image Resize', bnTitle: 'ইমেজ রিসাইজার', desc: 'ছবির দৈর্ঘ্য, প্রস্থ পরিবর্তন ও স্কেল অ্যাডজাস্ট করুন' },
    { id: 'pdf_merge', title: 'PDF Merge', bnTitle: 'পিডিএফ মার্জার', desc: 'একাধিক পিডিএফ ফাইল একত্রিত করে একটি ফাইল তৈরি করুন' },
    { id: 'pdf_split', title: 'PDF Split', bnTitle: 'পিডিএফ স্প্লিটার', desc: 'পিডিএফ ফাইল থেকে নির্দিষ্ট পৃষ্ঠা আলাদা বা বিভক্ত করুন' },
    { id: 'compress_pdf', title: 'Compress PDF', bnTitle: 'পিডিএফ কম্প্রেশন', desc: 'পিডিএফ ফাইলের সাইজ কমান' },
    { id: 'pdf_to_image', title: 'PDF to Image', bnTitle: 'পিডিএফ থেকে ছবি', desc: 'পিডিএফ ফাইলের প্রতিটি পৃষ্ঠাকে জেপিজি/পিএনজি ছবিতে রূপান্তর করুন' },
    { id: 'image_to_pdf', title: 'Image to PDF', bnTitle: 'ছবি থেকে পিডিএফ', desc: 'একাধিক ছবি দিয়ে একটি পিডিএফ ডকুমেন্ট তৈরি করুন' },
    { id: 'rotate_pdf', title: 'Rotate PDF', bnTitle: 'পিডিএফ রোটেশন', desc: 'পিডিএফ ফাইলের পৃষ্ঠাগুলো ঘুরান' }
  ];

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'qr_scanner':
        return <QRCodeScanner onGoBack={() => setActiveTool('')} />;
      case 'file_compressor':
        return <FileCompressor onGoBack={() => setActiveTool('')} />;
      case 'image_resize':
        return <ImageResizer onGoBack={() => setActiveTool('')} />;
      case 'pdf_merge':
        return <PDFMerge onGoBack={() => setActiveTool('')} />;
      case 'pdf_split':
        return <PDFSplit onGoBack={() => setActiveTool('')} />;
      case 'compress_pdf':
        return <CompressPDF onGoBack={() => setActiveTool('')} />;
      case 'pdf_to_image':
        return <PDFToImage onGoBack={() => setActiveTool('')} />;
      case 'image_to_pdf':
        return <ImageToPDF onGoBack={() => setActiveTool('')} />;
      case 'rotate_pdf':
        return <RotatePDF onGoBack={() => setActiveTool('')} />;
      default:
        return null;
    }
  };

  if (activeTool) {
    const activeToolInfo = toolsList.find(t => t.id === activeTool);
    return (
      <div className="max-w-6xl mx-auto px-4 py-4">
        {renderActiveTool()}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 justify-between">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <ArrowLeft className="w-4 h-4" /> প্রধান মেনু
          </button>
          <h1 className="text-2xl font-black text-slate-800 mt-1 flex items-center gap-2">
            💻 ডিজিটাল টুলস (Digital Tools Suite)
          </h1>
        </div>
        <span className="text-xs font-black bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full">স্মার্ট ইউটিলিটি</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsList.map((tool) => (
          <button
            key={tool.id}
            id={`digital_tool_${tool.id}`}
            onClick={() => setActiveTool(tool.id)}
            className="flex flex-col items-start text-left bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              {tool.id === 'qr_scanner' && <QrCode className="w-6 h-6" />}
              {tool.id === 'file_compressor' && <FileArchive className="w-6 h-6" />}
              {tool.id === 'image_resize' && <Minimize2 className="w-6 h-6" />}
              {tool.id === 'pdf_merge' && <Layers className="w-6 h-6" />}
              {tool.id === 'pdf_split' && <Scissors className="w-6 h-6" />}
              {tool.id === 'pdf_to_image' && <Eye className="w-6 h-6" />}
              {tool.id === 'image_to_pdf' && <FileImage className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
              {tool.bnTitle}
            </h3>
            <span className="text-xs text-slate-400 font-bold block mt-0.5">{tool.title}</span>
            <p className="text-xs text-slate-500 font-semibold mt-2 leading-relaxed">
              {tool.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 1. QR Code Scanner (কিউআর কোড স্ক্যানার)
// ============================================================================
export function QRCodeScanner({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('upload');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Image Upload State
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  // Handle Tab Switch
  useEffect(() => {
    if (activeTab !== 'camera') {
      stopCamera();
    }
    setScannedResult(null);
    setScanError(null);
  }, [activeTab]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    setScanning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    setScanError(null);
    setScannedResult(null);
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setScanError('ক্যামেরা চালু করা সম্ভব হয়নি। দয়া করে ক্যামেরা পারমিশন চেক করুন।');
      setScanning(false);
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (decoded && decoded.data) {
        setScannedResult(decoded.data);
        stopCamera();
        // Visual flash or sound could go here
        return;
      }
    }

    if (scanning) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  };

  // Decode QR code from file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScannedResult(null);
    setScanError(null);
    setSelectedImg(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      const dataUrl = event.target.result as string;
      setSelectedImg(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height);

        if (decoded && decoded.data) {
          setScannedResult(decoded.data);
        } else {
          setScanError('ছবিতে কোনো কিউআর কোড সনাক্ত করা যায়নি। অনুগ্রহ করে পরিষ্কার ছবি আপলোড করুন।');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = async () => {
    if (!scannedResult) return;
    await safeCopyToClipboard(scannedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <QrCode className="w-6 h-6" /> কিউআর কোড স্ক্যানার (QR Scanner)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">ডিজিটাল টুলস</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-4 text-center font-black text-xs border-b-2 transition-all ${activeTab === 'upload' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          📁 ছবি আপলোড স্ক্যান
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-4 text-center font-black text-xs border-b-2 transition-all ${activeTab === 'camera' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          📷 লাইভ ক্যামেরা স্ক্যান
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side Scanner Sandbox */}
        <div className="md:col-span-7 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200/50 p-6 min-h-[350px] relative overflow-hidden">
          {activeTab === 'upload' ? (
            <div className="w-full text-center space-y-4">
              {selectedImg ? (
                <div className="relative inline-block max-w-[280px] rounded-xl overflow-hidden border-2 border-slate-200 bg-white">
                  <img src={selectedImg} alt="Uploaded QR Code" className="w-full h-auto object-contain max-h-[220px]" />
                  <button 
                    onClick={() => { setSelectedImg(null); setScannedResult(null); }}
                    className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:bg-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-indigo-500 cursor-pointer bg-white transition-colors group">
                  <Upload className="w-12 h-12 text-slate-400 group-hover:text-indigo-500 transition-colors mb-3" />
                  <span className="text-xs font-black text-slate-700">ডিভাইস থেকে ছবি আপলোড করুন</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">PNG, JPG, JPEG সমর্থিত</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center space-y-4">
              {scanning ? (
                <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border-4 border-indigo-600 bg-black">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Laser Scan Overlay */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_15px_#4f46e5] animate-[scan_2s_infinite_ease-in-out]"></div>
                  
                  {/* Targets borders */}
                  <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>
              ) : (
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-colors"
                >
                  <Camera className="w-4 h-4" /> ক্যামেরা চালু করুন
                </button>
              )}
              {scanning && (
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold"
                >
                  ক্যামেরা বন্ধ করুন
                </button>
              )}
            </div>
          )}
          {scanError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold w-full">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}
        </div>
        {/* Right Side Result Card */}
        <div className="md:col-span-5 flex flex-col justify-between bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
              স্ক্যানকৃত ফলাফল (Decoded Result)
            </span>
            {scannedResult ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs">
                    <CheckCircle className="w-4 h-4" /> কোড সফলভাবে সনাক্ত হয়েছে!
                  </div>
                  <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 break-all select-all font-mono max-h-44 overflow-y-auto">
                    {scannedResult}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
                    {copied ? 'কপি হয়েছে' : 'ফলাফল কপি করুন'}
                  </button>
                  {isUrl(scannedResult) && (
                    <a
                      href={scannedResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-sm text-center"
                    >
                      <ExternalLink className="w-4 h-4" /> লিংক ওপেন করুন
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-2">
                <div className="text-3xl text-slate-300">🔍</div>
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  কোনো কিউআর কোড স্ক্যান করা হয়নি। <br /> বামপাশে লাইভ ক্যামেরা ব্যবহার করুন অথবা ছবি আপলোড করুন।
                </p>
              </div>
            )}
          </div>
          <div className="mt-6 border-t border-slate-200/60 pt-4 bg-white/50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider mb-1">
              ব্যবহার নির্দেশিকা
            </span>
            <ul className="text-[10px] text-slate-500 font-semibold space-y-1 pl-4 list-disc leading-relaxed">
              <li>পরিষ্কার আলোযুক্ত স্থানে কোডটি ক্যামেরার সামনে ধরুন।</li>
              <li>ছবির ক্ষেত্রে কোডটি যাতে আঁকাবাঁকা বা ঘোলা না হয়।</li>
              <li>লিংক ডিকোড হলে সরাসরি ব্রাউজারে খোলার সুবিধা পাবেন।</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. File Compressor (ফাইল কম্প্রেশন)
// ============================================================================
export function FileCompressor({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [compressing, setCompressing] = useState(false);

  // Image State
  const [origImage, setOrigImage] = useState<string | null>(null);
  const [origImageFile, setOrigImageFile] = useState<File | null>(null);
  const [compressedImg, setCompressedImg] = useState<string | null>(null);
  const [compressedImgSize, setCompressedImgSize] = useState<number | null>(null);
  const [quality, setQuality] = useState<number>(75);

  // Text State
  const [rawText, setRawText] = useState<string>('');
  const [compressedTextBlob, setCompressedTextBlob] = useState<Blob | null>(null);
  const [decompressedText, setDedecompressedText] = useState<string | null>(null);

  // Trigger compression when quality or image changes
  useEffect(() => {
    if (origImage) {
      compressImage();
    }
  }, [origImage, quality]);

  // Image Compress Function
  const compressImage = () => {
    if (!origImage) return;
    setCompressing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setCompressing(false);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Convert and compress with quality factor (0 to 1)
      const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      setCompressedImg(dataUrl);

      // Estimate compressed file size based on base64 string length
      const head = dataUrl.indexOf(',') + 1;
      const sizeBytes = Math.round((dataUrl.length - head) * 0.75);
      setCompressedImgSize(sizeBytes);
      setCompressing(false);
    };
    img.src = origImage;
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOrigImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setOrigImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadCompressedImage = () => {
    if (!compressedImg) return;
    const link = document.createElement('a');
    link.href = compressedImg;
    link.download = `compressed_${origImageFile?.name || 'image.jpg'}`;
    link.click();
  };

  // Text GZIP Compression using modern CompressionStream Web API
  const handleCompressText = async () => {
    if (!rawText.trim()) return;
    setCompressing(true);

    try {
      const textBlob = new Blob([rawText], { type: 'text/plain' });
      // CompressionStream API Check
      if ('CompressionStream' in window) {
        const cs = new CompressionStream('gzip');
        const compressedStream = textBlob.stream().pipeThrough(cs);
        const responseBlob = await new Response(compressedStream).blob();
        setCompressedTextBlob(responseBlob);
      } else {
        // Fallback LZW-like basic compress for safe offline conversion if browser unsupported
        const fallbackBlob = new Blob([encodeURIComponent(rawText)], { type: 'text/plain' });
        setCompressedTextBlob(fallbackBlob);
      }
    } catch (err) {
      console.error("Text compression error:", err);
    } finally {
      setCompressing(false);
    }
  };

  const downloadCompressedText = () => {
    if (!compressedTextBlob) return;
    const url = URL.createObjectURL(compressedTextBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed_text.txt.gz`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reductionPercentage = (origSize: number, newSize: number) => {
    if (!origSize) return 0;
    const diff = origSize - newSize;
    return Math.max(0, Math.round((diff / origSize) * 100));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <FileArchive className="w-6 h-6" /> ফাইল কম্প্রেশন (File Compressor)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">ডিজিটাল টুলস</span>
      </div>

      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-4 text-center font-black text-xs border-b-2 transition-all ${activeTab === 'image' ? 'border-emerald-600 text-emerald-600 bg-emerald-50/20' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          🖼️ ছবির কম্প্রেশন (Image)
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-4 text-center font-black text-xs border-b-2 transition-all ${activeTab === 'text' ? 'border-emerald-600 text-emerald-600 bg-emerald-50/20' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          📄 টেক্সট/ডকুমেন্ট কম্প্রেশন (Gzip)
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'image' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Control & Configuration */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-700 flex items-center gap-1">
                  <Settings size={14} /> কম্প্রেশন কনফিগারেশন
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">
                      কম্প্রেশন কোয়ালিটি: <span className="text-emerald-600">{toBn(quality)}%</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={quality || ""}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                      <span>কম কোয়ালিটি (বেশি ছোট)</span>
                      <span>বেশি কোয়ালিটি (কম ছোট)</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-4 text-center">
                  <label className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm transition">
                    <Upload className="w-4 h-4 mr-1.5" /> অন্য ছবি নির্বাচন করুন
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageFileSelect} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Reduction Stats */}
              {origImageFile && compressedImgSize && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black text-emerald-800">📊 কম্প্রেশন রিপোর্ট</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 font-bold block">মূল ফাইল সাইজ</span>
                      <span className="font-black text-slate-800 block mt-0.5">{formatSize(origImageFile.size)}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 font-bold block">কম্প্রেসড সাইজ</span>
                      <span className="font-black text-emerald-600 block mt-0.5">{formatSize(compressedImgSize)}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 col-span-2 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block">সর্বমোট সাইজ সাশ্রয়</span>
                      <span className="font-black text-rose-600 text-sm block mt-0.5">
                        {toBn(reductionPercentage(origImageFile.size, compressedImgSize))}% ছোট হয়েছে!
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={downloadCompressedImage}
                    disabled={compressing}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> কম্প্রেসড ছবি ডাউনলোড করুন
                  </button>
                </div>
              )}
            </div>

            {/* Sandbox Area */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200/50 p-6 min-h-[380px] text-center">
              {origImage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-black block uppercase">মূল ছবির রূপ</span>
                    <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-center h-[200px]">
                      <img src={origImage} alt="Original Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 block">{formatSize(origImageFile?.size || 0)}</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-black block uppercase">কম্প্রেসড রূপ</span>
                    <div className="bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-center h-[200px] relative">
                      {compressing ? (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                        </div>
                      ) : null}
                      {compressedImg ? (
                        <img src={compressedImg} alt="Compressed Preview" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-xs text-slate-300">কম্প্রেসিং...</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-600 block">
                      {compressedImgSize ? formatSize(compressedImgSize) : 'হিসাব করা হচ্ছে...'}
                    </span>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-10 hover:border-emerald-500 cursor-pointer bg-white transition-colors group max-w-sm w-full">
                  <Upload className="w-12 h-12 text-slate-400 group-hover:text-emerald-500 transition-colors mb-3" />
                  <span className="text-xs font-black text-slate-700">একটি ছবি নির্বাচন করুন</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">JPEG, JPG, PNG বা WEBP</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageFileSelect} className="hidden" />
                </label>
              )}
            </div>
          </div>
        ) : (
          /* Text Gzip Compressor */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 block">কম্প্রেস করার টেক্সট বা ডাটা লিখুন:</label>
                <textarea
                  value={rawText || ""}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    setCompressedTextBlob(null);
                  }}
                  placeholder="এখানে আপনার টেক্সট পেস্ট করুন যা আপনি হাই-কম্প্রেশন ফরম্যাটে রূপান্তর করতে চান..."
                  className="w-full h-64 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCompressText}
                  disabled={!rawText.trim() || compressing}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-4 h-4 ${compressing ? 'animate-spin' : ''}`} /> কম্প্রেস করুন (Gzip)
                </button>
                <button
                  onClick={() => { setRawText(''); setCompressedTextBlob(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition"
                >
                  মুছে ফেলুন
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
                  কম্প্রেশন মেট্রিক্স
                </span>

                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">মূল ক্যারেক্টার সংখ্যা:</span>
                    <span className="font-black text-slate-800">{toBn(rawText.length)} টি</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">মূল ফাইল সাইজ:</span>
                    <span className="font-black text-slate-800">{formatSize(rawText.length)}</span>
                  </div>

                  {compressedTextBlob && (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
                      <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                        <span className="text-slate-400 font-bold">GZIP কম্প্রেসড সাইজ:</span>
                        <span className="font-black text-emerald-600">{formatSize(compressedTextBlob.size)}</span>
                      </div>
                      <div className="text-center py-2">
                        <span className="text-[11px] font-bold text-slate-400 block">রেশিও উন্নয়ন হার</span>
                        <span className="text-lg font-black text-rose-600">
                          {toBn(reductionPercentage(rawText.length, compressedTextBlob.size))}% ডাটা সাশ্রয়!
                        </span>
                      </div>

                      <button
                        onClick={downloadCompressedText}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Download size={13} /> GZIP (.gz) ফাইল ডাউনলোড
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200/60 pt-4 bg-white/50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider mb-1">
                  Gzip কেন ব্যবহার করবেন?
                </span>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                  Gzip হল একটি স্ট্যান্ডার্ড হাই-কম্প্রেশন অ্যালগরিদম যা টেক্সট ডাটাকে প্রায় ৭০-৮০% পর্যন্ত ছোট করতে পারে। এটি ক্লাউড ডাটা ট্রান্সমিশন বা স্টোরেজ খরচে অবিশ্বাস্য সাশ্রয় এনে দেয়।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// 3. Ultimate Image Tools Suite (ইমেজ টুলস সুইট) - Resize, Compress, Crop, Background Remove, Convert
// ============================================================================
export function ImageResizer({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'resize' | 'compress' | 'crop' | 'bg_remove' | 'convert'>('resize');
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [origFile, setOrigFile] = useState<File | null>(null);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });

  // 1. Resize State
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [resizeFormat, setResizeFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [resizing, setResizing] = useState(false);

  // 2. Compress State
  const [compressQuality, setCompressQuality] = useState<number>(70);
  const [compressedImg, setCompressedImg] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressing, setCompressing] = useState(false);

  // 3. Crop State
  const [cropX, setCropX] = useState<number>(10);
  const [cropY, setCropY] = useState<number>(10);
  const [cropW, setCropW] = useState<number>(80);
  const [cropH, setCropH] = useState<number>(80);
  const [cropFormat, setCropFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/png');
  const [cropping, setCropping] = useState(false);

  // 4. Background Remove State
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tolerance, setTolerance] = useState<number>(40);
  const [keyColor, setKeyColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [bgProcessing, setBgProcessing] = useState(false);

  // 5. Convert State
  const [convertFormat, setConvertFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
  const [convertQuality, setConvertQuality] = useState<number>(90);
  const [converting, setConverting] = useState(false);

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOrigFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      const dataUrl = event.target.result as string;
      setSelectedImg(dataUrl);

      const img = new Image();
      img.onload = () => {
        setOriginalDims({ w: img.width, h: img.height });
        setTargetWidth(img.width);
        setTargetHeight(img.height);
        setScalePercent(100);
        // Reset crop settings
        setCropX(15);
        setCropY(15);
        setCropW(70);
        setCropH(70);
        // Reset bg removal
        setKeyColor(null);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // 1. Resize logic
  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && originalDims.w > 0) {
      const ratio = originalDims.h / originalDims.w;
      setTargetHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && originalDims.h > 0) {
      const ratio = originalDims.w / originalDims.h;
      setTargetWidth(Math.round(val * ratio));
    }
  };

  const handleScaleChange = (percent: number) => {
    setScalePercent(percent);
    const scale = percent / 100;
    setTargetWidth(Math.round(originalDims.w * scale));
    setTargetHeight(Math.round(originalDims.h * scale));
  };

  const downloadResized = () => {
    if (!selectedImg || targetWidth <= 0 || targetHeight <= 0) return;
    setResizing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setResizing(false);
        return;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const ext = resizeFormat === 'image/png' ? 'png' : resizeFormat === 'image/webp' ? 'webp' : 'jpg';
      const resizedDataUrl = canvas.toDataURL(resizeFormat, 0.9);
      
      const link = document.createElement('a');
      link.href = resizedDataUrl;
      link.download = `resized_${targetWidth}x${targetHeight}.${ext}`;
      link.click();
      setResizing(false);
    };
    img.src = selectedImg;
  };

  // 2. Compress logic
  useEffect(() => {
    if (selectedImg && activeTab === 'compress') {
      compressImage();
    }
  }, [selectedImg, compressQuality, activeTab]);

  const compressImage = () => {
    if (!selectedImg) return;
    setCompressing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setCompressing(false);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL('image/jpeg', compressQuality / 100);
      setCompressedImg(dataUrl);

      const head = dataUrl.indexOf(',') + 1;
      const sizeBytes = Math.round((dataUrl.length - head) * 0.75);
      setCompressedSize(sizeBytes);
      setCompressing(false);
    };
    img.src = selectedImg;
  };

  const downloadCompressed = () => {
    if (!compressedImg) return;
    const link = document.createElement('a');
    link.href = compressedImg;
    link.download = `compressed_${origFile?.name || 'image.jpg'}`;
    link.click();
  };

  // 3. Crop logic
  const handleCropPreset = (ratio: '1:1' | '16:9' | '4:3' | '3:4' | 'custom') => {
    if (ratio === '1:1') {
      const size = Math.min(60, Math.round(60 * (originalDims.h / originalDims.w)));
      setCropW(size);
      setCropH(Math.round(size * (originalDims.w / originalDims.h)));
    } else if (ratio === '16:9') {
      setCropW(80);
      setCropH(Math.round(80 * (9 / 16) * (originalDims.w / originalDims.h)));
    } else if (ratio === '4:3') {
      setCropW(75);
      setCropH(Math.round(75 * (3 / 4) * (originalDims.w / originalDims.h)));
    } else if (ratio === '3:4') {
      setCropW(55);
      setCropH(Math.round(55 * (4 / 3) * (originalDims.w / originalDims.h)));
    } else {
      setCropW(70);
      setCropH(70);
    }
  };

  const handleCropDownload = () => {
    if (!selectedImg) return;
    setCropping(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setCropping(false);
        return;
      }

      const sX = (cropX / 100) * img.naturalWidth;
      const sY = (cropY / 100) * img.naturalHeight;
      const sW = (cropW / 100) * img.naturalWidth;
      const sH = (cropH / 100) * img.naturalHeight;

      canvas.width = sW;
      canvas.height = sH;
      ctx.drawImage(img, sX, sY, sW, sH, 0, 0, sW, sH);

      const ext = cropFormat === 'image/png' ? 'png' : cropFormat === 'image/webp' ? 'webp' : 'jpg';
      const dataUrl = canvas.toDataURL(cropFormat, 0.95);

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `cropped_${Math.round(sW)}x${Math.round(sH)}.${ext}`;
      link.click();
      setCropping(false);
    };
    img.src = selectedImg;
  };

  // 4. Background Remove drawing & processing
  useEffect(() => {
    if (selectedImg && activeTab === 'bg_remove') {
      drawBgCanvas();
    }
  }, [selectedImg, keyColor, tolerance, activeTab]);

  const drawBgCanvas = () => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas to natural image sizes (or scaled down if too huge for performance)
      const maxDim = 1200;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      if (keyColor) {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const { r: tr, g: tg, b: tb } = keyColor;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Euclidean distance in RGB space
          const dist = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);
          if (dist <= tolerance) {
            data[i + 3] = 0; // Transparent
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
    };
    img.src = selectedImg;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);

    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      setKeyColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    } catch (err) {
      console.error("Canvas pixel read failed", err);
    }
  };

  const downloadTransparentImg = () => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    // Transparent requires PNG
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `no_bg_${origFile?.name?.replace(/\.[^/.]+$/, "") || 'image'}.png`;
    link.click();
  };

  // 5. Convert logic
  const handleConvertDownload = () => {
    if (!selectedImg) return;
    setConverting(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setConverting(false);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const ext = convertFormat === 'image/png' ? 'png' : convertFormat === 'image/webp' ? 'webp' : 'jpg';
      const dataUrl = canvas.toDataURL(convertFormat, convertQuality / 100);

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `converted_${origFile?.name?.replace(/\.[^/.]+$/, "") || 'image'}.${ext}`;
      link.click();
      setConverting(false);
    };
    img.src = selectedImg;
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-teal-600 to-indigo-600 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs font-bold">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 animate-pulse" /> আলটিমেট ইমেজ টুলস (Image Suite)
          </h2>
          <p className="text-[11px] text-teal-100 font-semibold mt-0.5">রিসাইজ, কম্প্রেশন, ক্রপিং, ব্যাকগ্রাউন্ড অপসারণ এবং ফরম্যাট রূপান্তর</p>
        </div>
        <span className="text-xs bg-white/20 px-3.5 py-1.5 rounded-full font-black self-start sm:self-center">৫-ইন-১ স্মার্ট ইমেজ ল্যাব</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-50 border-b border-slate-100 p-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('resize')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'resize' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Minimize2 className="w-4 h-4" /> রিসাইজ (Resize)
        </button>
        <button
          onClick={() => setActiveTab('compress')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'compress' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <FileArchive className="w-4 h-4" /> কম্প্রেস (Compress)
        </button>
        <button
          onClick={() => setActiveTab('crop')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'crop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Crop className="w-4 h-4" /> ক্রপ (Crop)
        </button>
        <button
          onClick={() => setActiveTab('bg_remove')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'bg_remove' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Eraser className="w-4 h-4" /> ব্যাকগ্রাউন্ড মুছুন
        </button>
        <button
          onClick={() => setActiveTab('convert')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'convert' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <FileImage className="w-4 h-4" /> কনভার্ট (Format)
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Controls Panel */}
        <div className="lg:col-span-5 space-y-4">
          {selectedImg ? (
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4">
              {/* Tab 1: Resize Controls */}
              {activeTab === 'resize' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-700 flex items-center gap-1">
                    <Settings size={14} className="text-indigo-600" /> রিসাইজ প্যারামিটারস
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">প্রস্থ (Width px):</label>
                      <input
                        type="number"
                        value={targetWidth || ''}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">উচ্চতা (Height px):</label>
                      <input
                        type="number"
                        value={targetHeight || ''}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockAspect}
                      onChange={(e) => setLockAspect(e.target.checked)}
                      className="accent-indigo-600"
                    />
                    <span className="text-xs font-black text-slate-600">অনুপাত ঠিক রাখুন (Aspect Ratio)</span>
                  </label>

                  <div>
                    <label className="text-xs font-bold text-slate-700 flex justify-between block mb-1">
                      <span>শতকরা স্কেল অনুপাত:</span>
                      <span className="font-black text-indigo-600">{toBn(scalePercent)}%</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      value={scalePercent || ""}
                      onChange={(e) => handleScaleChange(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">আউটপুট ফরম্যাট:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['image/jpeg', 'image/png', 'image/webp'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setResizeFormat(type as any)}
                          className={`py-1.5 rounded-lg border text-[10px] font-black text-center transition ${resizeFormat === type ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          {type === 'image/jpeg' ? 'JPEG' : type === 'image/png' ? 'PNG' : 'WebP'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={downloadResized}
                    disabled={resizing}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-black flex items-center justify-center gap-1.5 shadow mt-2"
                  >
                    {resizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    রিসাইজড ছবি ডাউনলোড করুন
                  </button>
                </div>
              )}

              {/* Tab 2: Compress Controls */}
              {activeTab === 'compress' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-700 flex items-center gap-1">
                    <FileArchive size={14} className="text-indigo-600" /> সাইজ কম্প্রেশন সেটিংস
                  </h3>

                  <div>
                    <label className="text-xs font-bold text-slate-700 flex justify-between block mb-1">
                      <span>কম্প্রেশন কোয়ালিটি:</span>
                      <span className="font-black text-indigo-600">{toBn(compressQuality)}%</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={compressQuality || ""}
                      onChange={(e) => setCompressQuality(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-slate-400 font-bold mt-1">টিপস: কোয়ালিটি ৬০%-৮০% এর মধ্যে রাখলে ছবির সাইজ অনেক কমে যায় কিন্তু কোয়ালিটি ঠিক থাকে।</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-150 space-y-1.5 text-xs font-bold text-slate-600">
                    <div className="flex justify-between">
                      <span>মূল ফাইলের সাইজ:</span>
                      <span className="text-slate-800">{origFile ? formatSize(origFile.size) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>কম্প্রেসড সাইজ (আনুমানিক):</span>
                      <span className="text-indigo-600 font-black">
                        {compressedSize ? formatSize(compressedSize) : 'হিসাব করা হচ্ছে...'}
                      </span>
                    </div>
                    {origFile && compressedSize && (
                      <div className="flex justify-between border-t pt-1.5 text-emerald-600">
                        <span>সাইজ কমেছে:</span>
                        <span>
                          {toBn(Math.max(0, Math.round(((origFile.size - compressedSize) / origFile.size) * 100)))}%
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={downloadCompressed}
                    disabled={compressing || !compressedImg}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center justify-center gap-1.5 shadow"
                  >
                    <Download className="w-4 h-4" /> কম্প্রেসড ছবি ডাউনলোড করুন
                  </button>
                </div>
              )}

              {/* Tab 3: Crop Controls */}
              {activeTab === 'crop' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-700 flex items-center gap-1">
                    <Crop size={14} className="text-indigo-600" /> ক্রপ বা খণ্ডিত করার প্যারামিটারস
                  </h3>

                  {/* Ratio Presets */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold block">অ্যাসপেক্ট রেশিও প্রিসেট:</label>
                    <div className="grid grid-cols-5 gap-1">
                      {['1:1', '16:9', '4:3', '3:4', 'custom'].map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => handleCropPreset(ratio as any)}
                          className="py-1 rounded-lg border text-[9px] font-bold bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                        >
                          {ratio === 'custom' ? 'কাস্টম' : ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Range Sliders for Precise Crop */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-600 mb-0.5">
                        <span>ক্রপ শুরু ডানে (X Axis):</span>
                        <span>{toBn(cropX)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={100 - cropW}
                        value={cropX || ""}
                        onChange={(e) => setCropX(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-1 bg-slate-200 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-600 mb-0.5">
                        <span>ক্রপ শুরু নিচে (Y Axis):</span>
                        <span>{toBn(cropY)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={100 - cropH}
                        value={cropY || ""}
                        onChange={(e) => setCropY(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-1 bg-slate-200 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-600 mb-0.5">
                        <span>ক্রপ প্রস্থ (Width):</span>
                        <span>{toBn(cropW)}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max={100 - cropX}
                        value={cropW || ""}
                        onChange={(e) => setCropW(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-1 bg-slate-200 rounded cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-600 mb-0.5">
                        <span>ক্রপ উচ্চতা (Height):</span>
                        <span>{toBn(cropH)}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max={100 - cropY}
                        value={cropH || ""}
                        onChange={(e) => setCropH(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-1 bg-slate-200 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">আউটপুট ফরম্যাট:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['image/jpeg', 'image/png', 'image/webp'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setCropFormat(type as any)}
                          className={`py-1.5 rounded-lg border text-[10px] font-black text-center transition ${cropFormat === type ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          {type === 'image/jpeg' ? 'JPEG' : type === 'image/png' ? 'PNG' : 'WebP'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCropDownload}
                    disabled={cropping}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black flex items-center justify-center gap-1.5 shadow"
                  >
                    {cropping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crop className="w-4 h-4" />}
                    নির্বাচিত অংশ ক্রপ করে ডাউনলোড করুন
                  </button>
                </div>
              )}

              {/* Tab 4: Background Remove Controls */}
              {activeTab === 'bg_remove' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-700 flex items-center gap-1">
                    <Eraser size={14} className="text-indigo-600" /> ব্যাকগ্রাউন্ড ম্যাজিক রিমুভার
                  </h3>
                  
                  <div className="bg-amber-50 text-[10px] text-amber-800 p-3 rounded-xl border border-amber-200/50 leading-relaxed font-semibold">
                    💡 <strong>ব্যবহার বিধি:</strong> ডান পাশের ছবির যেকোনো অংশে ক্লিক করুন, সেই রঙের ব্যাকগ্রাউন্ড স্বয়ংক্রিয়ভাবে মুছে যাবে। এছাড়া নিচের প্রিসেট বাটনগুলো ব্যবহার করতে পারেন।
                  </div>

                  {/* Presets */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold block">ব্যাকগ্রাউন্ড প্রিসেট রিমুভার:</label>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                      <button
                        onClick={() => setKeyColor({ r: 255, g: 255, b: 255 })}
                        className="py-1.5 rounded-xl border bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      >
                        ⬜ সাদা ব্যাকগ্রাউন্ড বাদ দিন
                      </button>
                      <button
                        onClick={() => setKeyColor({ r: 0, g: 0, b: 0 })}
                        className="py-1.5 rounded-xl border bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      >
                        ⬛ কালো ব্যাকগ্রাউন্ড বাদ দিন
                      </button>
                    </div>
                  </div>

                  {/* Tolerance Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>ম্যাচিং টলারেন্স (Tolerance):</span>
                      <span className="font-black text-indigo-600">{toBn(tolerance)}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      value={tolerance || ""}
                      onChange={(e) => setTolerance(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-slate-400 font-bold mt-1">টলারেন্স বাড়ালে কাছাকাছি রঙের ব্যাকগ্রাউন্ডও মুছে যাবে।</p>
                  </div>

                  {keyColor && (
                    <div className="bg-slate-100 p-2.5 rounded-xl border flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-2">
                        <span>নির্বাচিত রঙ:</span>
                        <div
                          className="w-5 h-5 rounded-md border"
                          style={{ backgroundColor: `rgb(${keyColor.r}, ${keyColor.g}, ${keyColor.b})` }}
                        />
                        <span className="font-mono">RGB({keyColor.r},{keyColor.g},{keyColor.b})</span>
                      </div>
                      <button onClick={() => setKeyColor(null)} className="text-rose-600 hover:underline">রিসেট</button>
                    </div>
                  )}

                  <button
                    onClick={downloadTransparentImg}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black flex items-center justify-center gap-1.5 shadow"
                  >
                    <Download className="w-4 h-4" /> ব্যাকগ্রাউন্ড ছাড়া PNG ডাউনলোড করুন
                  </button>
                </div>
              )}

              {/* Tab 5: Convert Format Controls */}
              {activeTab === 'convert' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-700 flex items-center gap-1">
                    <FileImage size={14} className="text-indigo-600" /> ফরম্যাট কনভার্টার সেটিংস
                  </h3>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1.5">কোন ফরম্যাটে রূপান্তর করতে চান?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { ext: 'image/jpeg', name: 'JPEG (.jpg)' },
                        { ext: 'image/png', name: 'PNG (.png)' },
                        { ext: 'image/webp', name: 'WebP (.webp)' }
                      ].map((item) => (
                        <button
                          key={item.ext}
                          onClick={() => setConvertFormat(item.ext as any)}
                          className={`py-2 rounded-xl border text-[11px] font-black text-center transition ${convertFormat === item.ext ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {convertFormat !== 'image/png' && (
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>আউটপুট কোয়ালিটি:</span>
                        <span className="font-black text-indigo-600">{toBn(convertQuality)}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={convertQuality || ""}
                        onChange={(e) => setConvertQuality(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleConvertDownload}
                    disabled={converting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center justify-center gap-1.5 shadow"
                  >
                    {converting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    ফরম্যাট কনভার্ট করে ডাউনলোড করুন
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center text-xs font-bold text-slate-400">
              শুরু করতে প্রথমে ডান পাশে একটি ছবি আপলোড করুন।
            </div>
          )}

          {selectedImg && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 text-xs font-semibold space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মেটাডাটা বিবরণ (Original Image)</span>
              <div className="flex justify-between text-slate-600">
                <span>মূল ডাইমেনশন:</span>
                <span className="font-black text-slate-800">{toBn(originalDims.w)} × {toBn(originalDims.h)} px</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ফাইলের নাম:</span>
                <span className="font-black text-slate-800 truncate max-w-[150px]">{origFile?.name || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Visual Stage */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-50 border border-slate-200/50 rounded-3xl p-6 min-h-[420px] relative overflow-hidden">
          {selectedImg ? (
            <div className="text-center space-y-4 max-w-full w-full">
              {/* Crop Visual Stage */}
              {activeTab === 'crop' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ক্রপ সিলেকশন প্রিভিউ (Crop Boundary Preview)</span>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center max-h-[300px] overflow-hidden relative mx-auto" style={{ maxWidth: '400px' }}>
                    <div className="relative inline-block max-w-full">
                      <img
                        src={selectedImg}
                        alt="Crop target"
                        className="max-h-[260px] object-contain max-w-full block pointer-events-none"
                      />
                      {/* Interactive Crop Boundary Box Overlay */}
                      <div
                        className="absolute border-2 border-dashed border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all pointer-events-none"
                        style={{
                          left: `${cropX}%`,
                          top: `${cropY}%`,
                          width: `${cropW}%`,
                          height: `${cropH}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Background Removal Canvas Stage */}
              {activeTab === 'bg_remove' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ব্যাকগ্রাউন্ড রিমুভ প্রিভিউ (ক্লিক করুন কাঙ্ক্ষিত রঙে)</span>
                  {/* Checkerboard Pattern CSS Background to visualize transparency clearly */}
                  <div 
                    className="p-3 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center max-h-[300px] overflow-auto mx-auto relative cursor-crosshair"
                    style={{ 
                      maxWidth: '400px',
                      backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                    }}
                  >
                    <canvas
                      ref={bgCanvasRef}
                      onClick={handleCanvasClick}
                      className="max-h-[260px] max-w-full object-contain block border border-slate-300 shadow-sm bg-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Resize, Compress, Convert Normal Image Preview */}
              {activeTab !== 'crop' && activeTab !== 'bg_remove' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ইমেজ প্রিভিউ</span>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center h-[280px] max-w-[400px] mx-auto">
                    <img
                      src={activeTab === 'compress' && compressedImg ? compressedImg : selectedImg}
                      alt="Current state preview"
                      className="max-h-full max-w-full object-contain transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Re-upload Option */}
              <div className="flex justify-center">
                <label className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] font-black cursor-pointer transition shadow-sm">
                  <Upload className="w-4 h-4 mr-1" /> অন্য ছবি বেছে নিন
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-3xl p-10 hover:border-indigo-500 cursor-pointer bg-white transition-colors group max-w-sm w-full text-center shadow-inner">
              <Upload className="w-12 h-12 text-slate-400 group-hover:text-indigo-600 transition-colors mb-3 animate-bounce" />
              <span className="text-xs font-black text-slate-700">ছবি আপলোড করুন</span>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">সব প্রচলিত ইমেজ ফাইল ফরম্যাট সমর্থিত (PNG, JPG, WebP)</span>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// 10. PDF Compression (পিডিএফ কম্প্রেশন)
// ============================================================================
export function CompressPDF({ onGoBack }: { onGoBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);

  const handleCompress = async () => {
    if (!file) return;
    setCompressing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compressed_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('কম্প্রেস করতে সমস্যা হয়েছে।');
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-teal-600 to-indigo-600 text-white flex justify-between items-center">
        <button onClick={onGoBack} className="flex items-center gap-1 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> ফিরে যান
        </button>
        <h2 className="text-xl font-black">পিডিএফ কম্প্রেশন (Compress PDF)</h2>
      </div>
      <div className="p-6 space-y-4">
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleCompress} disabled={!file || compressing} className="w-full py-2 bg-indigo-600 text-white rounded-lg">
          {compressing ? 'কম্প্রেস হচ্ছে...' : 'কম্প্রেস করুন'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 11. PDF Rotation (পিডিএফ রোটেশন)
// ============================================================================
export function RotatePDF({ onGoBack }: { onGoBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [rotating, setRotating] = useState(false);
  const [angle, setAngle] = useState(90);

  const handleRotate = async () => {
    if (!file) return;
    setRotating(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      pages.forEach(page => page.setRotation(degrees(angle)));
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rotated_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('ঘুরাতে সমস্যা হয়েছে।');
    } finally {
      setRotating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-teal-600 to-indigo-600 text-white flex justify-between items-center">
        <button onClick={onGoBack} className="flex items-center gap-1 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> ফিরে যান
        </button>
        <h2 className="text-xl font-black">পিডিএফ রোটেশন (Rotate PDF)</h2>
      </div>
      <div className="p-6 space-y-4">
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <select value={angle || ""} onChange={(e) => setAngle(Number(e.target.value))}>
          <option value={90}>৯০ ডিগ্রি</option>
          <option value={180}>১৮০ ডিগ্রি</option>
          <option value={270}>২৭০ ডিগ্রি</option>
        </select>
        <button onClick={handleRotate} disabled={!file || rotating} className="w-full py-2 bg-indigo-600 text-white rounded-lg">
          {rotating ? 'ঘুরানো হচ্ছে...' : 'ঘুরান'}
        </button>
      </div>
    </div>
  );
}

export function PDFMerge({ onGoBack }: { onGoBack: () => void }) {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files);
      setPdfFiles([...pdfFiles, ...arr]);
    }
  };

  const removeFile = (index: number) => {
    setPdfFiles(pdfFiles.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...pdfFiles];
    const item = next[index];
    next[index] = next[index - 1];
    next[index - 1] = item;
    setPdfFiles(next);
  };

  const moveDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    const next = [...pdfFiles];
    const item = next[index];
    next[index] = next[index + 1];
    next[index + 1] = item;
    setPdfFiles(next);
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) return;
    setMerging(true);
    setMergeProgress(10);

    try {
      const mergedPdf = await PDFDocument.create();
      setMergeProgress(30);

      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        setMergeProgress(30 + Math.round((i + 1) / pdfFiles.length * 50));
      }

      setMergeProgress(90);
      const pdfBytes = await mergedPdf.save();
      setMergeProgress(100);

      // Download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged_${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Merge error:", err);
      alert('পিডিএফ মার্জ করতে সমস্যা হয়েছে। দয়া করে পিডিএফ ফাইল চেক করুন।');
    } finally {
      setMerging(false);
      setMergeProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-teal-600 to-indigo-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Layers className="w-6 h-6 animate-pulse" /> পিডিএফ মার্জার (PDF Merge)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">ডিজিটালツール</span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Merge Actions & Files List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-700">ফাইল একত্রিতকরণের তালিকা:</span>
            <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm">
              ➕ পিডিএফ যোগ করুন
              <input type="file" accept="application/pdf" multiple onChange={handleFilesSelect} className="hidden" />
            </label>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 min-h-[250px] flex flex-col justify-between">
            {pdfFiles.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {pdfFiles.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white border border-slate-200/60 p-3 rounded-xl shadow-sm text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-400">{toBn(idx + 1)}.</span>
                      <div>
                        <span className="font-black text-slate-700 block max-w-sm truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{formatSize(file.size)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-400 disabled:text-slate-200 transition"
                      >
                        <MoveUp size={14} />
                      </button>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === pdfFiles.length - 1}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-400 disabled:text-slate-200 transition"
                      >
                        <MoveDown size={14} />
                      </button>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1.5 hover:bg-rose-50 rounded text-rose-500 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-3">
                <FolderOpen className="w-12 h-12 text-slate-300" />
                <p className="text-xs font-bold text-slate-400">কোনো পিডিএফ ফাইল যুক্ত করা হয়নি।</p>
              </div>
            )}

            {pdfFiles.length > 0 && (
              <div className="border-t border-slate-200/60 pt-4 flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>সর্বমোট যুক্ত ফাইল: {toBn(pdfFiles.length)}টি</span>
                <button
                  onClick={() => setPdfFiles([])}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  সব মুছে ফেলুন
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Info Section & Merge Start Trigger */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
              একত্রিতকরণ রিপোর্ট (Merge Summary)
            </span>

            {pdfFiles.length >= 2 ? (
              <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-sm space-y-4">
                <div className="space-y-1.5 text-xs text-slate-600 font-bold">
                  <div className="flex justify-between">
                    <span>সংযুক্ত ফাইলের হার:</span>
                    <span className="font-black text-slate-800">{toBn(pdfFiles.length)} টি</span>
                  </div>
                  <div className="flex justify-between">
                    <span>মোট সংগৃহীত ডাটা:</span>
                    <span className="font-black text-slate-800">
                      {formatSize(pdfFiles.reduce((sum, f) => sum + f.size, 0))}
                    </span>
                  </div>
                </div>

                {merging ? (
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 transition-all duration-200" style={{ width: `${mergeProgress}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-black text-center block">মার্জ করা হচ্ছে: {toBn(mergeProgress)}%</span>
                  </div>
                ) : (
                  <button
                    onClick={handleMerge}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-xs font-black transition shadow"
                  >
                    ফাইল একত্রিত করুন (Merge Now)
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>পিডিএফ একত্রিত করতে ন্যূনতম ২টি পিডিএফ ফাইল নির্বাচন করতে হবে।</span>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-slate-200/60 pt-4 bg-white/50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider mb-1">
              নিরাপত্তা নিশ্চয়তা
            </span>
            <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
              আপনার সমস্ত পিডিএফ ফাইল সম্পূর্ণ ক্লায়েন্ট সাইডে (আপনার ব্রাউজারেই) প্রসেস করা হয়। কোনো ফাইলই সার্ভারে আপলোড করা হয় না। তাই আপনার ডাটা শতভাগ নিরাপদ ও গোপনীয়।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. PDF Split (পিডিএফ স্প্লিটার)
// ============================================================================
export function PDFSplit({ onGoBack }: { onGoBack: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'all' | 'range'>('all');
  const [rangeStr, setRangeStr] = useState('');
  const [splitting, setSplitting] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingFile(true);
    setSelectedFile(file);

    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      setTotalPages(doc.getPageCount());
    } catch (err) {
      console.error("Error reading PDF:", err);
      alert('পিডিএফ ফাইলটি লোড করতে সমস্যা হয়েছে।');
      setSelectedFile(null);
    } finally {
      setLoadingFile(false);
    }
  };

  const handleSplit = async () => {
    if (!selectedFile || totalPages === 0) return;
    setSplitting(true);

    try {
      const bytes = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(bytes);

      if (splitMode === 'all') {
        // Splitting every page into a single PDF
        for (let i = 0; i < totalPages; i++) {
          const splitDoc = await PDFDocument.create();
          const [copiedPage] = await splitDoc.copyPages(doc, [i]);
          splitDoc.addPage(copiedPage);

          const splitBytes = await splitDoc.save();
          const blob = new Blob([splitBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `page_${i + 1}_of_${selectedFile.name}`;
          link.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // Splitting by custom ranges e.g. "1-2, 4"
        const pagesToExtract: number[] = [];
        const parts = rangeStr.split(',');
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(p => parseInt(p.trim()));
            if (!isNaN(start) && !isNaN(end)) {
              for (let p = start; p <= end; p++) {
                if (p >= 1 && p <= totalPages) {
                  pagesToExtract.push(p - 1);
                }
              }
            }
          } else {
            const val = parseInt(part.trim());
            if (!isNaN(val) && val >= 1 && val <= totalPages) {
              pagesToExtract.push(val - 1);
            }
          }
        }

        if (pagesToExtract.length === 0) {
          alert('অনুগ্রহ করে সঠিক পৃষ্ঠা সীমা বা পৃষ্ঠা নম্বর টাইপ করুন।');
          setSplitting(false);
          return;
        }

        const rangeDoc = await PDFDocument.create();
        const copiedPages = await rangeDoc.copyPages(doc, pagesToExtract);
        copiedPages.forEach(p => rangeDoc.addPage(p));

        const rangeBytes = await rangeDoc.save();
        const blob = new Blob([rangeBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `extracted_pages_${selectedFile.name}`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("PDF splitting error:", err);
      alert('পিডিএফ স্প্লিট করতে সমস্যা হয়েছে। পৃষ্ঠা সীমা সঠিক আছে কিনা নিশ্চিত করুন।');
    } finally {
      setSplitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Scissors className="w-6 h-6 animate-bounce" /> পিডিএফ স্প্লিটার (PDF Splitter)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">ডিজিটাল টুলস</span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Split Options Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1">
              <Settings size={14} className="text-cyan-600" /> স্প্লিট সেটিংস
            </h3>

            {selectedFile && totalPages > 0 ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">স্প্লিট করার মোড:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSplitMode('all')}
                      className={`py-2 rounded-xl border text-xs font-black text-center transition ${splitMode === 'all' ? 'bg-cyan-600 border-cyan-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                      প্রতিটি পৃষ্ঠা আলাদা করুন
                    </button>
                    <button
                      onClick={() => setSplitMode('range')}
                      className={`py-2 rounded-xl border text-xs font-black text-center transition ${splitMode === 'range' ? 'bg-cyan-600 border-cyan-600 text-white' : 'bg-white text-slate-600'}`}
                    >
                      নির্দিষ্ট পৃষ্ঠা সীমা
                    </button>
                  </div>
                </div>

                {splitMode === 'range' && (
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">পৃষ্ঠা সীমা টাইপ করুন:</label>
                    <input
                      type="text"
                      value={rangeStr || ""}
                      onChange={(e) => setRangeStr(e.target.value)}
                      placeholder="যেমন: 1-3, 5, 8-10"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black focus:outline-none"
                    />
                    <span className="text-[9px] text-slate-400 font-bold block mt-1 leading-normal">
                      কমা (,) দিয়ে আলাদা পৃষ্ঠা বা মাইনাস (-) দিয়ে সীমা লিখুন। যেমন: ১-৩ পৃষ্ঠা ও ৫ নম্বর পৃষ্ঠা নিষ্কাশন করতে "1-3, 5" লিখুন।
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-200/60 pt-4">
                  <button
                    onClick={handleSplit}
                    disabled={splitting}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                  >
                    {splitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                    পিডিএফ স্প্লিট করুন (Split)
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs font-bold text-slate-400">
                শুরু করতে প্রথমে একটি পিডিএফ ফাইল আপলোড করুন।
              </div>
            )}
          </div>

          {selectedFile && totalPages > 0 && (
            <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4 text-xs font-semibold space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-1">ফাইল বিবরণ</span>
              <div className="flex justify-between">
                <span className="text-slate-400">নাম:</span>
                <span className="font-black text-slate-700 truncate max-w-[150px]">{selectedFile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">মোট পৃষ্ঠা:</span>
                <span className="font-black text-cyan-600">{toBn(totalPages)} পৃষ্ঠা</span>
              </div>
            </div>
          )}
        </div>

        {/* File Drag / Preview Box */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-50 border border-slate-200/50 rounded-2xl p-6 min-h-[380px] relative">
          {loadingFile ? (
            <div className="text-center space-y-2">
              <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-400">পিডিএফ মেটাডাটা লোড হচ্ছে...</p>
            </div>
          ) : selectedFile ? (
            <div className="text-center space-y-3">
              <div className="text-5xl">📄</div>
              <h3 className="text-xs font-black text-slate-700 max-w-sm truncate">{selectedFile.name}</h3>
              <p className="text-[11px] font-bold text-slate-400">মোট সাইজ: {formatSize(selectedFile.size)}</p>
              
              <label className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[11px] font-bold cursor-pointer transition">
                <Upload className="w-4 h-4 mr-1" /> অন্য পিডিএফ ফাইল
                <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-10 hover:border-cyan-500 cursor-pointer bg-white transition-colors group max-w-sm w-full text-center">
              <Upload className="w-12 h-12 text-slate-400 group-hover:text-cyan-500 transition-colors mb-3" />
              <span className="text-xs font-black text-slate-700">পিডিএফ ফাইল ড্রপ বা আপলোড করুন</span>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">সব প্রচলিত পিডিএফ ডকুমেন্ট</span>
              <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. PDF to Image (পিডিএফ থেকে ছবি)
// ============================================================================
export function PDFToImage({ onGoBack }: { onGoBack: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagesImages, setPagesImages] = useState<string[]>([]);
  const [renderProgress, setRenderProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);
    setPagesImages([]);
    setRenderProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Load PDF document using pdfjs-dist
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalNumPages = pdf.numPages;

      const imgUrls: string[] = [];
      for (let i = 1; i <= totalNumPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // High-quality resolution

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        } as any).promise;

        const imgUrl = canvas.toDataURL('image/png');
        imgUrls.push(imgUrl);

        setRenderProgress(Math.round((i / totalNumPages) * 100));
      }
      setPagesImages(imgUrls);
    } catch (err) {
      console.error("PDF to Image conversion error:", err);
      alert('পিডিএফ ফাইলটি ছবিতে রূপান্তর করতে সমস্যা হয়েছে। দয়া করে ফাইলের উৎস চেক করুন।');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imgUrl: string, idx: number) => {
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `page_${idx + 1}_of_${selectedFile?.name || 'document'}.png`;
    link.click();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-amber-600 to-rose-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Eye className="w-6 h-6 animate-pulse" /> পিডিএফ থেকে ছবি (PDF to Image)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">ডিজিটাল টুলস</span>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200/50 rounded-2xl p-6 min-h-[160px] relative">
          {loading ? (
            <div className="text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
              <p className="text-xs font-black text-slate-700">পিডিএফ ছবি রেন্ডার হচ্ছে: {toBn(renderProgress)}%</p>
              <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-amber-600" style={{ width: `${renderProgress}%` }} />
              </div>
            </div>
          ) : selectedFile ? (
            <div className="text-center space-y-2">
              <span className="text-4xl">📁</span>
              <h3 className="text-xs font-black text-slate-700 max-w-md truncate mx-auto">{selectedFile.name}</h3>
              <p className="text-[10px] text-emerald-600 font-bold">রূপান্তর সফল! নিচে পৃষ্ঠাগুলো প্রিভিউ করুন ও ডাউনলোড করুন।</p>
              <label className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[11px] font-bold cursor-pointer transition">
                <Upload className="w-4 h-4 mr-1" /> অন্য পিডিএফ ফাইল
                <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-amber-500 cursor-pointer bg-white transition-colors group max-w-sm w-full text-center">
              <Upload className="w-10 h-10 text-slate-400 group-hover:text-amber-500 transition-colors mb-2" />
              <span className="text-xs font-black text-slate-700">পিডিএফ ডকুমেন্ট বেছে নিন</span>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">সব পাতার ছবি তৈরি হবে</span>
              <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        {pagesImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-700">🖼️ রূপান্তরিত পৃষ্ঠা:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pagesImages.map((imgUrl, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between space-y-3 hover:shadow transition">
                  <span className="text-[10px] font-black text-slate-400 text-center block">পৃষ্ঠা নম্বর {toBn(idx + 1)}</span>
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200/60 p-1.5 flex items-center justify-center h-48">
                    <img src={imgUrl} alt={`Page ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                  </div>
                  <button
                    onClick={() => downloadImage(imgUrl, idx)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 transition"
                  >
                    <Download size={13} /> ইমেজ ডাউনলোড করুন
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 7. Image to PDF (ছবি থেকে পিডিএফ)
// ============================================================================
export function ImageToPDF({ onGoBack }: { onGoBack: () => void }) {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [pdfLayout, setPdfLayout] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [generating, setGenerating] = useState(false);

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages([...images, ...arr]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].preview);
    setImages(images.filter((_, i) => i !== index));
  };

  const handleGeneratePDF = async () => {
    if (images.length === 0) return;
    setGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pdfLayout === 'fit' ? 'a4' : pdfLayout
      });

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        
        // Load image to draw
        const img = new Image();
        img.src = item.preview;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();

        // Calculate aspect ratios for optimal fitting inside margins
        const margin = 10;
        const targetW = pdfWidth - margin * 2;
        const targetH = pdfHeight - margin * 2;

        const imgRatio = img.width / img.height;
        const targetRatio = targetW / targetH;

        let drawW = targetW;
        let drawH = targetH;

        if (imgRatio > targetRatio) {
          drawH = targetW / imgRatio;
        } else {
          drawW = targetH * imgRatio;
        }

        const x = (pdfWidth - drawW) / 2;
        const y = (pdfHeight - drawH) / 2;

        if (i > 0) {
          doc.addPage();
        }

        doc.addImage(item.preview, 'JPEG', x, y, drawW, drawH);
      }

      doc.save(`compiled_${Date.now()}.pdf`);
    } catch (err) {
      console.error("Image to PDF compilation error:", err);
      alert('পিডিএফ ফাইল তৈরি করতে সমস্যা হয়েছে। দয়া করে ছবির উৎস বা ফাইল টাইপ চেক করুন।');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-rose-600 to-indigo-600 text-white flex justify-between items-center">
        <div>
          <button onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <FileImage className="w-6 h-6 animate-pulse" /> ছবি থেকে পিডিএফ (Image to PDF)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">ডিজিটাল টুলস</span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PDF Settings & Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1">
              <Settings size={14} className="text-rose-600" /> পিডিএফ সেটিংস
            </h3>

            {images.length > 0 ? (
              <div className="space-y-4 text-xs">
                {/* Page Size Selection */}
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">পৃষ্ঠার মাপ (Format):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['a4', 'letter', 'fit'].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setPdfLayout(sz as any)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold text-center transition uppercase ${pdfLayout === sz ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        {sz === 'fit' ? 'অটো ফিট' : sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page Orientation */}
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">পৃষ্ঠা বিন্যাস (Orientation):</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOrientation('portrait')}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold text-center transition ${orientation === 'portrait' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      লম্বালম্বি (Portrait)
                    </button>
                    <button
                      onClick={() => setOrientation('landscape')}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold text-center transition ${orientation === 'landscape' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      আড়াআড়ি (Landscape)
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-4">
                  <button
                    onClick={handleGeneratePDF}
                    disabled={generating}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                  >
                    {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    পিডিএফ ডকুমেন্ট তৈরি করুন
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs font-bold text-slate-400">
                শুরু করতে ডানপাশে কয়েকটি ছবি আপলোড করুন।
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-xs font-semibold space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">কম্পাইল রিপোর্ট</span>
              <div className="flex justify-between">
                <span className="text-slate-400">মোট ছবি:</span>
                <span className="font-black text-slate-700">{toBn(images.length)} টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">পিডিএফ লেআউট:</span>
                <span className="font-black text-rose-600 uppercase">{pdfLayout} ({orientation})</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Images Grid & Upload Box */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-700">সংযুক্ত ছবির তালিকা:</span>
            <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm">
              ➕ ছবি যোগ করুন
              <input type="file" accept="image/*" multiple onChange={handleImagesSelect} className="hidden" />
            </label>
          </div>

          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 min-h-[300px] flex flex-col justify-between">
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[320px] overflow-y-auto p-1">
                {images.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-2 relative group hover:shadow transition">
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="h-24 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-1 border border-slate-100">
                      <img src={item.preview} alt={`Upload preview ${idx}`} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 text-center block mt-1.5 truncate">{item.file.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-3">
                <ImageIcon className="w-12 h-12 text-slate-300 animate-pulse" />
                <p className="text-xs font-bold text-slate-400">কোনো ছবি সংযুক্ত করা হয়নি।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
