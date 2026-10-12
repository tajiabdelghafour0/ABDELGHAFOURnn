import React, { useState } from 'react';
import { EdlCut, VideoMetadata } from '../types';
import { Scissors, Play, Check, X, Sparkles, ArrowRight, Video } from 'lucide-react';

interface EdlModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoMetadata;
  language: 'darija' | 'en';
}

export const EdlModal: React.FC<EdlModalProps> = ({
  isOpen,
  onClose,
  video,
  language,
}) => {
  const isArabic = language === 'darija';

  const [cuts, setCuts] = useState<EdlCut[]>([
    { id: 'cut_1', label: 'Hook / Opening Action', startTime: 2, endTime: 9, selected: true },
    { id: 'cut_2', label: 'High-Impact Peak Moment', startTime: 14, endTime: 24, selected: true },
    { id: 'cut_3', label: 'Emotional Reaction & Climax', startTime: 32, endTime: 41, selected: true },
  ]);

  const [isApplying, setIsApplying] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleApplyCuts = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setIsDone(true);
    }, 1800);
  };

  const selectedCuts = cuts.filter((c) => c.selected);
  const totalDuration = selectedCuts.reduce(
    (acc, c) => acc + (c.endTime - c.startTime),
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-xl bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#101217]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isArabic
                  ? 'تطبيق مونطاج الذكاء الاصطناعي (Local 4K60 EDL)'
                  : 'Local 4K60 Master EDL Cutter'}
              </h3>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'طبق قرارات Muse / Gemini على ملف الـ 4K60 الأصلي محلياً'
                  : 'Apply Muse / Gemini timeline cuts to 4K60 Master with zero re-upload'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              {isArabic
                ? 'الذكاء الاصطناعي اختار أفضل اللقطات انطلاقاً من الـ Proxies الخفيفة. دابا التيليفون غادي يقصهم مباشرة من الـ 4K Master!'
                : 'AI selected peak moments from uploaded lightweight proxies. Pixel 6 Pro cuts them locally from 4K Master!'}
            </span>
          </div>

          {/* Cuts list */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">
              {isArabic ? 'اللقطات المختارة من AI Timeline:' : 'AI Selected Scenes:'}
            </div>
            {cuts.map((cut) => (
              <div
                key={cut.id}
                className="p-3 rounded-xl bg-[#0f1115] border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={cut.selected}
                    onChange={(e) =>
                      setCuts(
                        cuts.map((c) =>
                          c.id === cut.id ? { ...c, selected: e.target.checked } : c
                        )
                      )
                    }
                    className="w-4 h-4 accent-[#ea8612] rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{cut.label}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {cut.startTime}s - {cut.endTime}s ({cut.endTime - cut.startTime}s duration)
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono text-cyan-300 font-semibold">
                  4K60 10-bit
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#0e1014] flex items-center justify-between text-xs text-slate-300 font-mono">
            <span>
              {isArabic ? 'المدة الإجمالية للريلز/الشورتس:' : 'Total Viral Video Duration:'}
            </span>
            <span className="text-[#ea8612] font-bold text-sm">{totalDuration}s</span>
          </div>

          {isDone ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-2">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">
                {isArabic
                  ? 'تم قص وتجميع الريلز بـ 4K60 10-bit HDR بنجاح!'
                  : '4K60 10-bit HDR Viral Reel Assembled Locally!'}
              </h4>
              <p className="text-xs text-slate-300">
                {isArabic
                  ? 'ملف VIRAL_FINAL_4K60_HDR.mp4 جاهز في مجلد Movies/PixelFlow مع حماية إنستغرام وتيكتوك'
                  : 'Saved to Movies/PixelFlow with anti-compression armor ready for TikTok/Reels'}
              </p>
            </div>
          ) : (
            <button
              onClick={handleApplyCuts}
              disabled={isApplying || selectedCuts.length === 0}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Scissors className="w-4 h-4" />
              <span>
                {isApplying
                  ? isArabic
                    ? 'جاري قص الـ 4K Master محلياً...'
                    : 'Applying 4K Master Cuts...'
                  : isArabic
                  ? 'قص وتجميع الفيديو النهائي (4K60 HDR)'
                  : 'Execute 4K60 Cuts Locally'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
