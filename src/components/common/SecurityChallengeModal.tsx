import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  Sparkles,
  Smartphone,
  KeyRound
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SecurityChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  challengeType?: 'math' | 'slider' | 'pin';
  ruleCode?: string;
  reason?: string;
}

export const SecurityChallengeModal: React.FC<SecurityChallengeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  challengeType = 'math',
  ruleCode = 'BOT-001',
  reason
}) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<'+' | '-' | '×'>('+');
  const [userAnswer, setUserAnswer] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [targetSlider, setTargetSlider] = useState(80);
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const generateNewMath = () => {
    const n1 = Math.floor(Math.random() * 12) + 3;
    const n2 = Math.floor(Math.random() * 8) + 1;
    const ops: ('+' | '-' | '×')[] = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    setUserAnswer('');
    setTargetSlider(Math.floor(Math.random() * 40) + 50); // 50 to 90
    setSliderValue(0);
  };

  useEffect(() => {
    if (isOpen) {
      generateNewMath();
      setAttempts(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const calculateCorrectAnswer = (): number => {
    if (operator === '+') return num1 + num2;
    if (operator === '-') return num1 - num2;
    return num1 * num2;
  };

  const handleVerify = () => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      let isSuccess = false;

      if (challengeType === 'math') {
        const correct = calculateCorrectAnswer();
        if (parseInt(userAnswer.trim(), 10) === correct) {
          isSuccess = true;
        }
      } else if (challengeType === 'slider') {
        if (Math.abs(sliderValue - targetSlider) <= 5) {
          isSuccess = true;
        }
      } else {
        isSuccess = true;
      }

      if (isSuccess) {
        toast.success('সিকিউরিটি ভেরিফিকেশন সফল হয়েছে!', { icon: '🛡️' });
        onSuccess();
        onClose();
      } else {
        setAttempts(prev => prev + 1);
        toast.error('উত্তর সঠিক হয়নি। আবার চেষ্টা করুন।');
        generateNewMath();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              নিরাপত্তা যাচাই (Security Verification)
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                {ruleCode}
              </span>
            </h3>
            <p className="text-xs text-slate-400">অ্যাকাউন্টের সুরক্ষা নিশ্চিত করতে নিচের কুইজটি সমাধান করুন</p>
          </div>
        </div>

        {reason && (
          <div className="p-3 mb-5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <span>{reason}</span>
          </div>
        )}

        {/* MATH CHALLENGE BOX */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 mb-5 text-center">
          <div className="text-xs text-slate-400 font-medium">নিচের গাণিতিক হিসাবটির সঠিক উত্তর লিখুন:</div>
          
          <div className="flex items-center justify-center gap-3 text-2xl font-black text-white font-mono bg-slate-900 py-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400">{num1}</span>
            <span className="text-amber-400">{operator}</span>
            <span className="text-cyan-400">{num2}</span>
            <span className="text-slate-500">=</span>
            <span className="text-slate-400">?</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="আপনার উত্তর লিখুন..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-bold text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              onKeyDown={(e) => e.key === 'Enter' && userAnswer && handleVerify()}
              autoFocus
            />
            <button
              type="button"
              onClick={generateNewMath}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              title="নতুন প্রশ্ন"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition"
          >
            বাতিল
          </button>
          <button
            type="button"
            disabled={!userAnswer || isVerifying}
            onClick={handleVerify}
            className={`flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition ${
              userAnswer && !isVerifying
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isVerifying ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={16} />
                ভেরিফাই করুন
              </>
            )}
          </button>
        </div>

        {attempts > 1 && (
          <p className="text-[11px] text-center text-amber-400 mt-3">
            বারবার ভুল হলে অ্যাকাউন্ট সাময়িকভাবে বিরতিতে যেতে পারে।
          </p>
        )}
      </div>
    </div>
  );
};
