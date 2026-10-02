import React, { useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, RefreshCw, Sparkles, Clock, MessageSquareOff, Shield, UserPlus, StopCircle } from 'lucide-react';

interface LiveHostControlsProps {
  isCameraOn: boolean;
  isMicOn: boolean;
  activeFilter: string;
  slowModeSeconds: number;
  commentsDisabled: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onSwitchCamera: () => void;
  onChangeFilter: (filter: string) => void;
  onToggleSlowMode: (seconds: number) => void;
  onToggleCommentsDisabled: (disabled: boolean) => void;
  onOpenAddModerator: () => void;
  onOpenInviteGuest: () => void;
  onEndLiveClick: () => void;
}

export const LiveHostControls: React.FC<LiveHostControlsProps> = ({
  isCameraOn,
  isMicOn,
  activeFilter,
  slowModeSeconds,
  commentsDisabled,
  onToggleCamera,
  onToggleMic,
  onSwitchCamera,
  onChangeFilter,
  onToggleSlowMode,
  onToggleCommentsDisabled,
  onOpenAddModerator,
  onOpenInviteGuest,
  onEndLiveClick,
}) => {
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [showSlowModePicker, setShowSlowModePicker] = useState(false);

  const filters = [
    { id: 'none', label: 'নরমাল' },
    { id: 'warm', label: 'ওয়ার্ম' },
    { id: 'bright', label: 'ব্রাইট' },
    { id: 'vintage', label: 'ভিন্টেজ' },
    { id: 'bw', label: 'ব্ল্যাক এন্ড হোয়াইট' },
  ];

  return (
    <div className="relative bg-slate-950/80 backdrop-blur-lg border border-white/10 p-2.5 sm:p-3 rounded-2xl flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap text-white z-30">
      
      {/* Primary Media Toggles */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleCamera}
          className={`p-2.5 rounded-full font-semibold text-xs transition-all flex items-center justify-center cursor-pointer ${
            isCameraOn ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-red-500 text-white'
          }`}
          title="ক্যামেরা অন/অফ"
        >
          {isCameraOn ? <Camera size={18} /> : <CameraOff size={18} />}
        </button>

        <button
          onClick={onToggleMic}
          className={`p-2.5 rounded-full font-semibold text-xs transition-all flex items-center justify-center cursor-pointer ${
            isMicOn ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-red-500 text-white'
          }`}
          title="মাইক অন/অফ"
        >
          {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        <button
          onClick={onSwitchCamera}
          className="p-2.5 bg-white/15 hover:bg-white/25 rounded-full text-white transition-all cursor-pointer"
          title="ক্যামেরা সুইচ"
        >
          <RefreshCw size={18} />
        </button>

        {/* Filters Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilterPicker(!showFilterPicker)}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${
              activeFilter !== 'none' ? 'bg-amber-500 text-slate-950' : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title="ফিল্টার ও ইফেক্ট"
          >
            <Sparkles size={18} />
          </button>

          {showFilterPicker && (
            <div className="absolute bottom-12 left-0 bg-slate-900 border border-white/20 p-2 rounded-xl shadow-2xl flex flex-col gap-1 w-36 z-40 text-xs">
              {filters.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    onChangeFilter(f.id);
                    setShowFilterPicker(false);
                  }}
                  className={`text-left px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                    activeFilter === f.id ? 'bg-emerald-600 text-white' : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Moderation Controls */}
      <div className="flex items-center gap-1.5">
        {/* Slow Mode */}
        <div className="relative">
          <button
            onClick={() => setShowSlowModePicker(!showSlowModePicker)}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${
              slowModeSeconds > 0 ? 'bg-amber-500 text-slate-950' : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title="স্লো মোড সেটআপ"
          >
            <Clock size={18} />
          </button>

          {showSlowModePicker && (
            <div className="absolute bottom-12 right-0 bg-slate-900 border border-white/20 p-2 rounded-xl shadow-2xl flex flex-col gap-1 w-36 z-40 text-xs">
              <span className="text-[10px] text-slate-400 font-bold px-2 py-1">স্লো মোড টাইমার</span>
              {[0, 5, 10, 30].map(sec => (
                <button
                  key={sec}
                  onClick={() => {
                    onToggleSlowMode(sec);
                    setShowSlowModePicker(false);
                  }}
                  className={`text-left px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                    slowModeSeconds === sec ? 'bg-emerald-600 text-white' : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  {sec === 0 ? 'বন্ধ' : `${sec} সেকেন্ড`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment Disable */}
        <button
          onClick={() => onToggleCommentsDisabled(!commentsDisabled)}
          className={`p-2.5 rounded-full transition-all cursor-pointer ${
            commentsDisabled ? 'bg-red-500/80 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
          }`}
          title={commentsDisabled ? 'কমেন্ট চালু করুন' : 'কমেন্ট বন্ধ করুন'}
        >
          <MessageSquareOff size={18} />
        </button>

        {/* Add Moderator */}
        <button
          onClick={onOpenAddModerator}
          className="p-2.5 bg-white/15 hover:bg-white/25 rounded-full text-white transition-all cursor-pointer"
          title="মডারেটর যুক্ত করুন"
        >
          <Shield size={18} />
        </button>

        {/* Invite Guest */}
        <button
          onClick={onOpenInviteGuest}
          className="p-2.5 bg-white/15 hover:bg-white/25 rounded-full text-white transition-all cursor-pointer"
          title="গেস্ট আমন্ত্রণ জানান"
        >
          <UserPlus size={18} />
        </button>
      </div>

      {/* End Live Button */}
      <button
        onClick={onEndLiveClick}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition-transform active:scale-95"
      >
        <StopCircle size={16} /> End Live
      </button>
    </div>
  );
};
