import React from 'react';
import { Zap, FolderOpen, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface OneBigButtonProps {
  onStart: () => void;
  onPickFromGallery: () => void;
  language: 'darija' | 'en';
  isProcessing: boolean;
}

export const OneBigButton: React.FC<OneBigButtonProps> = ({
  onStart,
  onPickFromGallery,
  language,
  isProcessing,
}) => {
  const isArabic = language === 'darija';

  const handleBigButtonClick = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 20, 40]);
      } catch {
        // ignore
      }
    }
    onStart();
  };

  return (
    <div className="w-full space-y-3 pt-2">
      {/* THE ONE BIG BUTTON */}
      <button
        onClick={handleBigButtonClick}
        disabled={isProcessing}
        className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-[#ea8612] via-[#f59e0b] to-[#ea8612] bg-[length:200%_auto] hover:bg-right transition-all duration-500 p-[1.5px] shadow-xl hover:shadow-[#ea8612]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-full bg-gradient-to-b from-[#181a20] to-[#111317] group-hover:from-[#1c1f26] group-hover:to-[#14171d] rounded-2xl p-5 sm:p-6 transition-all flex flex-col items-center justify-center text-center relative">
          {/* Subtle amber ambient glow behind button text */}
          <div className="absolute inset-0 bg-[#ea8612]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ea8612] animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-[#ea8612] uppercase font-bold">
              {isArabic ? 'نظام المسارين الفوري' : 'Dual-Track Instant Engine'}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{isArabic ? 'وجد ليا كلشي 4K60' : 'Compress Keep 4K60'}</span>
            <Zap className="w-6 h-6 text-[#ea8612] fill-[#ea8612] group-hover:scale-110 transition-transform" />
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
            {isArabic ? (
              <>
                <span className="text-white font-bold">Master 4K60 (150MB)</span> كيبقى فتيليفونك +{' '}
                <span className="text-cyan-300 font-bold">6 أجزاء Proxy (20MB)</span> كتصيفط لـ Muse/Gemini
              </>
            ) : (
              <>
                <span className="text-white font-bold">Master 4K60 (150MB)</span> stays local +{' '}
                <span className="text-cyan-300 font-bold">6 AI Proxies (20MB)</span> for Muse/Gemini
              </>
            )}
          </p>
        </div>
      </button>

      {/* Second Small Button: Choose From Gallery */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPickFromGallery}
          className="flex-1 py-3 px-4 rounded-xl bg-[#14171d] hover:bg-[#1b1f27] border border-white/10 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FolderOpen className="w-4 h-4 text-[#ea8612]" />
          <span>{isArabic ? 'اختار من المعرض' : 'Choose from Gallery'}</span>
        </button>
      </div>

      {/* Safety guarantees footnote */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono text-center pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          {isArabic ? 'بدون تنقيص لـ 1080p' : 'No 1080p Downscale'}
        </span>
        <span className="text-slate-700">·</span>
        <span className="flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          {isArabic ? 'حماية حرارة Tensor G1 (<45°C)' : 'Thermal Guard <45°C'}
        </span>
        <span className="text-slate-700">·</span>
        <span className="text-cyan-300">
          {isArabic ? '10-bit HDR محفوظ 100%' : '10-bit HDR Preserved'}
        </span>
      </div>
    </div>
  );
};
