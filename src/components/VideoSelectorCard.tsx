import React, { useRef } from 'react';
import { VideoMetadata } from '../types';
import { formatBytes, formatDuration } from '../data/sampleVideos';
import { Film, Sparkles, Sun, Moon, HardDrive, CheckCircle2 } from 'lucide-react';

interface VideoSelectorCardProps {
  currentVideo: VideoMetadata;
  allVideos: VideoMetadata[];
  onSelectVideo: (video: VideoMetadata) => void;
  onUploadFile: (file: File) => void;
  language: 'darija' | 'en';
}

export const VideoSelectorCard: React.FC<VideoSelectorCardProps> = ({
  currentVideo,
  allVideos,
  onSelectVideo,
  onUploadFile,
  language,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isArabic = language === 'darija';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full bg-[#14171d] rounded-2xl border border-white/8 overflow-hidden shadow-2xl transition-all">
      {/* Visual Header / Banner */}
      <div className="relative aspect-video sm:aspect-[21/9] w-full bg-slate-900 overflow-hidden group">
        <img
          src={currentVideo.thumbnailUrl}
          alt={currentVideo.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14171d] via-[#14171d]/40 to-transparent" />

        {/* 4K60 10-bit HDR Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-white font-mono text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ea8612]" />
            4K 60FPS
          </div>
          <div className="bg-cyan-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold">
            10-bit HDR
          </div>
        </div>

        {/* Duration in bottom right */}
        <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-0.5 rounded text-white text-xs font-mono tabular-nums">
          {formatDuration(currentVideo.durationSeconds)}
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Title and Origin */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#ea8612]">
              {isArabic ? 'آخر فيديو ملتقط بـ Pixel 6 Pro' : 'Latest Video from DCIM/Camera'}
            </span>
            <span className="text-xs text-slate-400">
              {currentVideo.dateRecorded}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5 break-all">
            {currentVideo.name}
          </h2>
        </div>

        {/* Unboxed Metadata Strip (Anti-slop clean text with · separators) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-mono pt-1 pb-1">
          <span className="text-white font-bold text-sm text-[#ea8612]">
            {formatBytes(currentVideo.sizeBytes)}
          </span>
          <span className="text-slate-600">·</span>
          <span>{currentVideo.resolution}</span>
          <span className="text-slate-600">·</span>
          <span>{currentVideo.fps} FPS</span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-300">{currentVideo.colorSpace}</span>
          <span className="text-slate-600">·</span>
          <span>{currentVideo.codec}</span>
        </div>

        {/* Smart Filter Sensor Status */}
        <div className="p-3.5 rounded-xl bg-[#0f1115] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-[#ea8612]" />
              <span className="font-semibold">
                {isArabic ? 'الفلتر الذكي التلقائي (Smart Sensor)' : 'Smart Filter Sensor'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              {currentVideo.isDark ? (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Luma: {currentVideo.averageLuma}/255</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {currentVideo.isDark ? (
              <span className="text-indigo-300">
                {isArabic
                  ? '✨ إضاءة ليلية / منخفضة: غادي يتطبق atadenoise + unsharp 0.6 الخفيف لتنقية التحبيب بدون تشويه الملامح.'
                  : '✨ Low-light detected: applying fast atadenoise + light unsharp 0.6 to clean sensor grain without plastic face artifacts.'}
              </span>
            ) : (
              <span className="text-emerald-300">
                {isArabic
                  ? '☀️ إضاءة نهارية نقية: تم إلغاء الفلتر الثقيل (hqdn3d ممنوع) باش الوجه ما يوليش بلاستيك، مع درع unsharp 0.6 لمقاومة ضغط إنستغرام وتيكتوك.'
                  : '☀️ Clean daylight footage: heavy denoise skipped to avoid plastic faces; applying light unsharp 0.6 anti-compression armor for TikTok/Reels.'}
              </span>
            )}
          </p>
        </div>

        {/* Recent Videos Switcher */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            {isArabic ? 'فيديوهات أخرى في DCIM/Camera' : 'Recent Camera Recordings'}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {allVideos.map((vid) => {
              const isSelected = vid.id === currentVideo.id;
              return (
                <button
                  key={vid.id}
                  onClick={() => onSelectVideo(vid)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#1e232d] border-[#ea8612] text-white ring-1 ring-[#ea8612]/30'
                      : 'bg-[#101217] border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="aspect-video w-full rounded-md overflow-hidden mb-1.5 bg-black/40">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-[11px] font-semibold truncate text-white">
                    {vid.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatBytes(vid.sizeBytes)} · 4K60
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-[#ea8612] text-black rounded-full p-0.5 shadow">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hidden File Input for Custom Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*"
          className="hidden"
        />
      </div>
    </div>
  );
};
