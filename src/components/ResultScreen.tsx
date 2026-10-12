import React, { useState } from 'react';
import { CompressionResult, ProxyPart } from '../types';
import { formatBytes, formatDuration } from '../data/sampleVideos';
import {
  CheckCircle2,
  Film,
  Share2,
  FolderDown,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  Scissors,
  Download,
  ShieldCheck,
  X,
} from 'lucide-react';
import JSZip from 'jszip';

interface ResultScreenProps {
  result: CompressionResult;
  language: 'darija' | 'en';
  onReset: () => void;
  onOpenEdlModal: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  language,
  onReset,
  onOpenEdlModal,
}) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const isArabic = language === 'darija';

  const { masterVideo, proxyParts, sourceVideo, smartFiltersApplied } = result;

  // Download all proxy parts zipped together
  const handleDownloadAllProxies = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      proxyParts.forEach((part) => {
        // Create lightweight representative text/dummy stream if no real blob
        zip.file(
          part.filename,
          `PixelFlow 720p15 Proxy Clip\nPart: ${part.partIndex}\nDuration: ${part.durationSeconds}s\nFaststart: Enabled\nTarget: Muse / Gemini Omni upload`
        );
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PROXIES_${sourceVideo.name.replace(/\.[^/.]+$/, '')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleShareMaster = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Master 4K60 10-bit Video',
        text: `Processed with My PixelFlow: ${masterVideo.filename} (${formatBytes(masterVideo.sizeBytes)})`,
      }).catch(() => {});
    } else {
      // Direct download
      const a = document.createElement('a');
      a.href = sourceVideo.uri || '#';
      a.download = masterVideo.filename;
      a.click();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Victory Card with Savings highlight */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#18231c] to-[#121815] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CheckCircle2 className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                {isArabic ? 'تم بنجاح كامل' : 'Compression Successful'}
              </span>
            </div>
            {/* The iconic savings callout: "وفرتي 850MB" */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isArabic
                ? `وفرتي ${formatBytes(masterVideo.savedBytes, 0)}`
                : `Saved ${formatBytes(masterVideo.savedBytes, 0)}`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              {isArabic ? (
                <>
                  من <span className="line-through text-slate-500">{formatBytes(sourceVideo.sizeBytes)}</span> رجعات{' '}
                  <span className="text-emerald-300 font-bold">{formatBytes(masterVideo.sizeBytes)}</span> مع الحفاظ على{' '}
                  <span className="text-white font-bold">4K 60FPS 10-bit HDR</span> كاملة!
                </>
              ) : (
                <>
                  Reduced from <span className="line-through text-slate-500">{formatBytes(sourceVideo.sizeBytes)}</span> to{' '}
                  <span className="text-emerald-300 font-bold">{formatBytes(masterVideo.sizeBytes)}</span> while maintaining full{' '}
                  <span className="text-white font-bold">4K 60FPS 10-bit HDR</span>!
                </>
              )}
            </p>
          </div>

          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-4 py-3 text-center shrink-0">
            <span className="text-[11px] text-emerald-300 block font-medium">
              {isArabic ? 'نسبة الربح' : 'Data Reduction'}
            </span>
            <span className="text-2xl font-black text-white font-mono tabular-nums">
              -{masterVideo.percentSaved}%
            </span>
          </div>
        </div>
      </div>

      {/* Track A: MASTER 4K60 10-bit Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#14171d] border border-[#ea8612]/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ea8612]/20 border border-[#ea8612]/30 flex items-center justify-center text-[#ea8612]">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#ea8612] font-bold">
                Track A · Master
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {masterVideo.filename}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm sm:text-base font-extrabold text-white font-mono">
              {formatBytes(masterVideo.sizeBytes)}
            </div>
            <div className="text-[11px] text-cyan-300 font-mono">4K60 · 10-bit HDR</div>
          </div>
        </div>

        {/* Master Details Strip */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono py-1 border-t border-b border-white/5">
          <span>libx265</span>
          <span className="text-slate-600">·</span>
          <span>CRF 26 (fast)</span>
          <span className="text-slate-600">·</span>
          <span>threads=4</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400">GPS & Date Kept</span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400">faststart moov atom</span>
        </div>

        {/* Buttons: "شوف" (Preview) and "بارطاجي" (Share) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setShowVideoModal(true)}
            className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isArabic ? 'شوف' : 'Preview'}</span>
          </button>

          <button
            onClick={handleShareMaster}
            className="py-3 px-4 rounded-xl bg-[#ea8612] hover:bg-[#d97706] text-black font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ea8612]/20"
          >
            <Share2 className="w-4 h-4" />
            <span>{isArabic ? 'بارطاجي' : 'Share / Export'}</span>
          </button>
        </div>
      </div>

      {/* Track B: PROXY AI Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#14171d] border border-cyan-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FolderDown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                Track B · AI Proxies (Muse / Gemini)
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {proxyParts.length} {isArabic ? 'أجزاء جاهزة للرفع' : 'Parts Ready to Upload'}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm sm:text-base font-extrabold text-white font-mono">
              {formatBytes(result.totalProxySizeBytes)} {isArabic ? 'المجموع' : 'Total'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">720p · 15 FPS</div>
          </div>
        </div>

        <p className="text-xs text-slate-300">
          {isArabic
            ? 'كل جزء فيه 10 ثواني وحجمه تقريباً 1.5MB حتى 3.5MB. تقدر ترفعهم في ثواني حتى بإنترنت ضعيفة (2G/3G) لـ Meta Muse أو Google Veo!'
            : 'Each part is max 10s and ~1.5MB-3.5MB. Upload in seconds even over weak 2G/3G mobile networks to Meta Muse or Google Veo!'}
        </p>

        {/* Button: "افتح مجلد الأجزاء للرفع" */}
        <button
          onClick={handleDownloadAllProxies}
          disabled={downloadingZip}
          className="w-full py-3 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <FolderDown className="w-4 h-4" />
          <span>
            {downloadingZip
              ? isArabic
                ? 'جاري تجهيز الملف المضغوط...'
                : 'Packaging Proxies...'
              : isArabic
              ? 'افتح مجلد الأجزاء للرفع (ZIP)'
              : 'Download All Proxy Parts (ZIP)'}
          </span>
        </button>

        {/* Parts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {proxyParts.map((part) => (
            <div
              key={part.partIndex}
              className="p-2.5 rounded-xl bg-[#0f1217] border border-white/5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span>{part.filename}</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {formatBytes(part.sizeBytes)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2">
                <span>{part.startTime} - {part.endTime}</span>
                <span className="text-emerald-400">faststart ✓</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDL AI Cut Workflow Link */}
      <div className="p-4 rounded-xl bg-[#171b24] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {isArabic ? 'جاك المونطاج من الذكاء الاصطناعي؟' : 'Got AI Cut Decisions (EDL)?'}
            </h4>
            <p className="text-xs text-slate-400">
              {isArabic
                ? 'طبق القطعات مباشرة على ملف الـ 4K Master بدون ما تعاود ترفع حتى حاجة!'
                : 'Apply cuts locally to the 4K Master without re-uploading heavy video files!'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenEdlModal}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span>{isArabic ? 'تطبيق المونطاج' : 'Apply EDL Cuts'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Action: Process Another Video */}
      <div className="pt-2">
        <button
          onClick={onReset}
          className="w-full py-3.5 px-4 rounded-xl bg-[#14171d] hover:bg-[#1b2029] border border-white/10 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#ea8612]" />
          <span>{isArabic ? 'عالج فيديو آخر من الكاميرا' : 'Process Another Video'}</span>
        </button>
      </div>

      {/* Video Preview Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#14171d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{masterVideo.filename}</h4>
                <p className="text-xs text-emerald-400 font-mono">
                  4K 60FPS · 10-bit HDR (yuv420p10le) · {formatBytes(masterVideo.sizeBytes)}
                </p>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center relative">
              {sourceVideo.uri ? (
                <video
                  src={sourceVideo.uri}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={sourceVideo.thumbnailUrl}
                  alt="Video Master"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="p-4 bg-[#0e1014] flex items-center justify-between text-xs text-slate-400">
              <span>{smartFiltersApplied.reason}</span>
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-medium"
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
