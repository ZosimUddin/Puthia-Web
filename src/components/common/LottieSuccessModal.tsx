import React, { useEffect, useMemo } from 'react';
import Lottie from 'lottie-react';
import { CheckCircle2, Copy, ShieldCheck, Clock, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';

export interface LottieSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  type: 'recharge' | 'withdrawal';
  amount: number;
  recipient: string; // Phone number or Bank Account
  methodOrOperator: string; // e.g. 'Grameenphone' or 'bKash' or 'Islami Bank'
  bankName?: string;
  trackingId?: string;
  notes?: string;
  onViewHistory?: () => void;
}

export const LottieSuccessModal: React.FC<LottieSuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  type,
  amount,
  recipient,
  methodOrOperator,
  bankName,
  trackingId,
  notes,
  onViewHistory
}) => {
  // Generate random tracking ID if not provided
  const reqId = useMemo(() => {
    if (trackingId) return trackingId;
    const prefix = type === 'recharge' ? 'RC' : 'WD';
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${Date.now().toString().slice(-6)}-${random}`;
  }, [trackingId, type, isOpen]);

  // Audio chimes on open (guarded)
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = audioCtx.currentTime;
        
        // Soft celebration dual-tone chime
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18); // A5
        gain1.gain.setValueAtTime(0.08, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880, now + 0.12);
        osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.32); // D6
        gain2.gain.setValueAtTime(0.08, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.55);
      } catch {
        // audio context not allowed or supported
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyTrackingId = () => {
    navigator.clipboard.writeText(reqId);
    toast.success('ট্র্যাকিং আইডি কপি করা হয়েছে!');
  };

  // High-fidelity standard Lottie animation payload for celebratory checkmark with radiating burst rings & confetti
  const successLottieData = {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 90,
    w: 300,
    h: 300,
    nm: "Success Burst",
    ddd: 0,
    assets: [],
    layers: [
      // Particle 1 (Top star)
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Star1",
        sr: 1,
        ks: {
          o: { k: [{ t: 0, s: [0] }, { t: 20, s: [100] }, { t: 60, s: [0] }] },
          r: { k: [{ t: 0, s: [0] }, { t: 60, s: [90] }] },
          p: { k: [{ t: 15, s: [150, 150, 0] }, { t: 60, s: [150, 50, 0] }] },
          a: { k: [0, 0, 0] },
          s: { k: [{ t: 15, s: [0, 0, 100] }, { t: 35, s: [100, 100, 100] }, { t: 60, s: [0, 0, 100] }] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { k: [0, 0] },
                s: { k: [12, 12] }
              },
              {
                ty: "fl",
                c: { k: [0.98, 0.75, 0.18, 1] } // amber-400
              },
              {
                ty: "tr",
                p: { k: [0, 0] },
                a: { k: [0, 0] },
                s: { k: [100, 100] },
                r: { k: 0 },
                o: { k: 100 }
              }
            ]
          }
        ]
      },
      // Particle 2 (Top Right)
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "Star2",
        sr: 1,
        ks: {
          o: { k: [{ t: 0, s: [0] }, { t: 20, s: [100] }, { t: 60, s: [0] }] },
          r: { k: [{ t: 0, s: [0] }, { t: 60, s: [-60] }] },
          p: { k: [{ t: 15, s: [150, 150, 0] }, { t: 60, s: [230, 80, 0] }] },
          a: { k: [0, 0, 0] },
          s: { k: [{ t: 15, s: [0, 0, 100] }, { t: 35, s: [120, 120, 100] }, { t: 60, s: [0, 0, 100] }] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { k: [0, 0] },
                s: { k: [10, 10] }
              },
              {
                ty: "fl",
                c: { k: [0.0, 0.65, 0.42, 1] } // emerald-500
              },
              {
                ty: "tr",
                p: { k: [0, 0] },
                a: { k: [0, 0] },
                s: { k: [100, 100] },
                r: { k: 0 },
                o: { k: 100 }
              }
            ]
          }
        ]
      },
      // Particle 3 (Top Left)
      {
        ddd: 0,
        ind: 3,
        ty: 4,
        nm: "Star3",
        sr: 1,
        ks: {
          o: { k: [{ t: 0, s: [0] }, { t: 20, s: [100] }, { t: 60, s: [0] }] },
          r: { k: [{ t: 0, s: [0] }, { t: 60, s: [45] }] },
          p: { k: [{ t: 15, s: [150, 150, 0] }, { t: 60, s: [70, 80, 0] }] },
          a: { k: [0, 0, 0] },
          s: { k: [{ t: 15, s: [0, 0, 100] }, { t: 35, s: [110, 110, 100] }, { t: 60, s: [0, 0, 100] }] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { k: [0, 0] },
                s: { k: [10, 10] }
              },
              {
                ty: "fl",
                c: { k: [0.2, 0.5, 0.95, 1] } // sky-500
              },
              {
                ty: "tr",
                p: { k: [0, 0] },
                a: { k: [0, 0] },
                s: { k: [100, 100] },
                r: { k: 0 },
                o: { k: 100 }
              }
            ]
          }
        ]
      },
      // Particle 4 (Bottom Right)
      {
        ddd: 0,
        ind: 4,
        ty: 4,
        nm: "Star4",
        sr: 1,
        ks: {
          o: { k: [{ t: 0, s: [0] }, { t: 20, s: [100] }, { t: 60, s: [0] }] },
          p: { k: [{ t: 15, s: [150, 150, 0] }, { t: 60, s: [240, 210, 0] }] },
          a: { k: [0, 0, 0] },
          s: { k: [{ t: 15, s: [0, 0, 100] }, { t: 35, s: [100, 100, 100] }, { t: 60, s: [0, 0, 100] }] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { k: [0, 0] },
                s: { k: [8, 8] }
              },
              {
                ty: "fl",
                c: { k: [0.93, 0.28, 0.6, 1] } // rose-400
              },
              {
                ty: "tr",
                p: { k: [0, 0] },
                a: { k: [0, 0] },
                s: { k: [100, 100] },
                r: { k: 0 },
                o: { k: 100 }
              }
            ]
          }
        ]
      },
      // Particle 5 (Bottom Left)
      {
        ddd: 0,
        ind: 5,
        ty: 4,
        nm: "Star5",
        sr: 1,
        ks: {
          o: { k: [{ t: 0, s: [0] }, { t: 20, s: [100] }, { t: 60, s: [0] }] },
          p: { k: [{ t: 15, s: [150, 150, 0] }, { t: 60, s: [60, 210, 0] }] },
          a: { k: [0, 0, 0] },
          s: { k: [{ t: 15, s: [0, 0, 100] }, { t: 35, s: [100, 100, 100] }, { t: 60, s: [0, 0, 100] }] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { k: [0, 0] },
                s: { k: [8, 8] }
              },
              {
                ty: "fl",
                c: { k: [0.98, 0.75, 0.18, 1] } // amber-400
              },
              {
                ty: "tr",
                p: { k: [0, 0] },
                a: { k: [0, 0] },
                s: { k: [100, 100] },
                r: { k: 0 },
                o: { k: 100 }
              }
            ]
          }
        ]
      },
      // Checkmark tick drawing
      {
        ddd: 0,
        ind: 6,
        ty: 4,
        nm: "Checkmark",
        sr: 1,
        ks: {
          o: { k: 100 },
          r: { k: 0 },
          p: { k: [150, 150, 0] },
          a: { k: [0, 0, 0] },
          s: { k: [{ t: 10, s: [0, 0, 100] }, { t: 25, s: [110, 110, 100] }, { t: 35, s: [100, 100, 100] }] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sh",
                ks: {
                  k: {
                    i: [[0, 0], [0, 0], [0, 0]],
                    o: [[0, 0], [0, 0], [0, 0]],
                    v: [[-26, 2], [-8, 22], [28, -18]],
                    c: false
                  }
                }
              },
              {
                ty: "st",
                c: { k: [1, 1, 1, 1] }, // white
                w: { k: 8 },
                lc: 2,
                lj: 2
              },
              {
                ty: "tm",
                s: { k: 0 },
                e: { k: [{ t: 15, s: [0] }, { t: 35, s: [100] }] },
                o: { k: 0 }
              },
              {
                ty: "tr",
                p: { k: [0, 0] },
                a: { k: [0, 0] },
                s: { k: [100, 100] },
                r: { k: 0 },
                o: { k: 100 }
              }
            ]
          }
        ]
      },
      // Central Green Circle Pop
      {
        ddd: 0,
        ind: 7,
        ty: 4,
        nm: "CenterCircle",
        sr: 1,
        ks: {
          o: { k: 100 },
          r: { k: 0 },
          p: { k: [150, 150, 0] },
          a: { k: [0, 0, 0] },
          s: { k: [{ t: 0, s: [0, 0, 100] }, { t: 18, s: [115, 115, 100] }, { t: 28, s: [100, 100, 100] }] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { k: [0, 0] },
                s: { k: [96, 96] }
              },
              {
                ty: "fl",
                c: { k: [0.0, 0.416, 0.306, 1] } // #006a4e
              },
              {
                ty: "tr",
                p: { k: [0, 0] },
                a: { k: [0, 0] },
                s: { k: [100, 100] },
                r: { k: 0 },
                o: { k: 100 }
              }
            ]
          }
        ]
      },
      // Expanding Outer Glow Ring
      {
        ddd: 0,
        ind: 8,
        ty: 4,
        nm: "OuterRing",
        sr: 1,
        ks: {
          o: { k: [{ t: 5, s: [100] }, { t: 40, s: [0] }] },
          r: { k: 0 },
          p: { k: [150, 150, 0] },
          a: { k: [0, 0, 0] },
          s: { k: [{ t: 5, s: [60, 60, 100] }, { t: 40, s: [180, 180, 100] }] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { k: [0, 0] },
                s: { k: [96, 96] }
              },
              {
                ty: "st",
                c: { k: [0.1, 0.75, 0.45, 0.7] },
                w: { k: 4 }
              },
              {
                ty: "tr",
                p: { k: [0, 0] },
                a: { k: [0, 0] },
                s: { k: [100, 100] },
                r: { k: 0 },
                o: { k: 100 }
              }
            ]
          }
        ]
      }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-emerald-100 overflow-hidden text-center">
        {/* Decorative Top Gradient Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="বন্ধ করুন"
        >
          <X size={18} />
        </button>

        {/* Lottie Animation Header */}
        <div className="w-32 h-32 mx-auto -mt-2 -mb-2 flex items-center justify-center relative">
          <Lottie
            animationData={successLottieData}
            loop={false}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Heading and Category Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200 mb-2">
          <ShieldCheck size={14} className="text-[#006a4e]" />
          <span>{type === 'recharge' ? 'মোবাইল রিচার্জ রিকোয়েস্ট' : 'টাকা উত্তোলন আবেদন'}</span>
        </div>

        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {subtitle}
          </p>
        )}

        {/* Financial Details Card */}
        <div className="my-4 bg-gradient-to-b from-slate-50 to-emerald-50/30 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500">পরিমাণ:</span>
            <span className="text-base sm:text-lg font-black text-emerald-700">
              ৳{amount.toLocaleString('bn-BD')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">
              {type === 'recharge' ? 'অপারেটর:' : 'পেমেন্ট মেথড:'}
            </span>
            <span className="font-bold text-slate-800 uppercase px-2 py-0.5 bg-white rounded-md border border-slate-200/80">
              {methodOrOperator}
            </span>
          </div>

          {bankName && (
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">ব্যাংক ও ব্রাঞ্চ:</span>
              <span className="font-bold text-slate-800 text-right truncate max-w-[180px]">
                {bankName}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">
              {type === 'recharge' ? 'মোবাইল নম্বর:' : 'হিসাব / ওয়ালেট:'}
            </span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/70">
              {recipient}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Clock size={12} className="text-amber-600" />
              <span>স্ট্যাটাস:</span>
            </span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>প্রক্রিয়াধীন (Processing)</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
            <span>ট্র্যাকিং আইডি:</span>
            <button
              type="button"
              onClick={copyTrackingId}
              className="inline-flex items-center gap-1 font-mono font-bold text-slate-600 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
              title="কপি করুন"
            >
              <span>{reqId}</span>
              <Copy size={11} />
            </button>
          </div>
        </div>

        {/* Trust & Security Guarantee Message */}
        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-left mb-4">
          <ShieldCheck size={18} className="text-[#006a4e] shrink-0 mt-0.5" />
          <div className="text-[11px] text-emerald-950 font-medium leading-relaxed">
            {notes || 'আপনার আবেদনটি সুরক্ষিতভাবে সিস্টেমে লিপিবদ্ধ হয়েছে। পুঠিয়া এডমিন প্যানেল দ্রুততম সময়ে যাচাই করে আপনার অ্যাকাউন্টে টাকা পাঠিয়ে ট্রানজেকশন রেফারেন্স প্রদান করবে।'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {onViewHistory && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewHistory();
              }}
              className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>হিস্ট্রি চেক করুন</span>
              <ExternalLink size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`w-full ${onViewHistory ? 'sm:w-1/2' : ''} py-2.5 px-4 rounded-xl bg-[#006a4e] hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5`}
          >
            <CheckCircle2 size={15} />
            <span>ঠিক আছে, বুঝেছি</span>
          </button>
        </div>
      </div>
    </div>
  );
};
