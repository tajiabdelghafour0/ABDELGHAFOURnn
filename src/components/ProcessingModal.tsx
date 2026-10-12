import React, { useState } from 'react';
import { CompressionState, VideoMetadata } from '../types';
import {
  Cpu,
  Thermometer,
  Bell,
  Terminal,
  AlertTriangle,
  Layers,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ProcessingModalProps {
  state: CompressionState;
  video: VideoMetadata;
  language: 'darija' | 'en';
  onCancel: () => void;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  state,
  video,
  language,
  onCancel,
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const isArabic = language === 'darija';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#14171d] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Android Foreground Notification Preview */}
        <div className="p-3.5 rounded-xl bg-[#1c2029] border border-white/10 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ea8612] text-black flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-white">WorkManager · PixelFlow</span>
              <span>الان</span>
            </div>
            <p className="text-xs font-medium text-slate-200 truncate mt-0.5">
              {state.notificationMessage}
            </p>
            {/* Small notification progress bar */}
            <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#ea8612] h-full transition-all duration-300 rounded-full"
                style={{ width: `${state.overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Big Overall Progress Display */}
        <div className="text-center space-y-1">
          <div className="text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            {state.overallProgress}%
          </div>
          <p className="text-xs text-slate-400">
            {isArabic ? 'جاري المعالجة بنظام المسارين' : 'Dual-Track In Progress'}
          </p>
        </div>

        {/* Dual Track Status Cards */}
        <div className="space-y-3">
          {/* Track A: Master 4K60 10-bit */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              state.currentTrack === 'master'
                ? 'bg-[#1b212c] border-[#ea8612]/50 shadow-sm'
                : state.progressMaster === 100
                ? 'bg-[#11161d] border-emerald-500/30'
                : 'bg-[#111419] border-white/5 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ea8612]" />
                <span className="font-bold text-white">Track A: Master 4K60 10-bit HDR</span>
              </div>
              <span className="font-mono text-slate-300 tabular-nums">
                {state.progressMaster}%
              </span>
            </div>
            <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#ea8612] h-full transition-all duration-200"
                style={{ width: `${state.progressMaster}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
              <span>libx265 · crf 26 · preset fast</span>
              <span>yuv420p10le</span>
            </div>
          </div>

          {/* Track B: Proxy AI 720p15 */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              state.currentTrack === 'proxy' || state.currentTrack === 'splitting'
                ? 'bg-[#142231] border-cyan-500/50 shadow-sm'
                : state.progressProxy === 100
                ? 'bg-[#11161d] border-emerald-500/30'
                : 'bg-[#111419] border-white/5 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="font-bold text-white">
                  Track B: Proxy AI 720p15 (10s segments)
                </span>
              </div>
              <span className="font-mono text-slate-300 tabular-nums">
                {state.progressProxy}%
              </span>
            </div>
            <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-200"
                style={{ width: `${state.progressProxy}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
              <span>libx264 · ultrafast · faststart</span>
              <span>~1.5MB / 10s part</span>
            </div>
          </div>
        </div>

        {/* Telemetry Row: Speed, ETA, Thermal Guard */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-[#0f1115] border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              {isArabic ? 'السرعة' : 'Speed'}
            </span>
            <span className="text-sm font-bold text-white font-mono">{state.speed}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0f1115] border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              {isArabic ? 'الوقت المتبقي' : 'ETA'}
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {state.etaSeconds}s
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0f1115] border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              {isArabic ? 'حرارة Tensor' : 'Tensor Temp'}
            </span>
            <span
              className={`text-sm font-bold font-mono ${
                state.temperatureC >= 45 ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              {state.temperatureC}°C
            </span>
          </div>
        </div>

        {/* Thermal Guard Warning if Overheating */}
        {state.temperatureC >= 45 && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              {isArabic
                ? 'الحرارة فاتت 45°C: المعالج كيرتاح 5 ثواني باش التيليفون ما يسخنش.'
                : 'Thermal Guard Active: Tensor G1 reached 45°C. Throttling paused to cool down.'}
            </span>
          </div>
        )}

        {/* Collapsible FFmpeg Log Output */}
        <div className="border border-white/5 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="w-full px-3 py-2 bg-[#0e1014] hover:bg-[#12151b] flex items-center justify-between text-xs text-slate-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>FFmpeg-Kit Logs</span>
            </div>
            {showLogs ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {showLogs && (
            <div className="p-3 bg-black/60 font-mono text-[10px] text-emerald-400 max-h-36 overflow-y-auto space-y-1">
              {state.logLines.slice(-10).map((line, idx) => (
                <div key={idx} className="leading-tight">
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
        >
          {isArabic ? 'إلغاء العملية' : 'Cancel Process'}
        </button>
      </div>
    </div>
  );
};
