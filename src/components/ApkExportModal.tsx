import React, { useState } from 'react';
import { generatePixelFlowZip, ANDROID_FILES } from '../services/androidProjectGenerator';
import {
  Package,
  Download,
  Terminal,
  Code2,
  Copy,
  Check,
  X,
  Smartphone,
  ExternalLink,
  ShieldAlert,
  Cpu,
} from 'lucide-react';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'darija' | 'en';
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'code' | 'termux'>('build');
  const [selectedFile, setSelectedFile] = useState<keyof typeof ANDROID_FILES>('compressWorker');
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (!isOpen) return null;

  const isArabic = language === 'darija';

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const blob = await generatePixelFlowZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MyPixelFlow_Pixel6Pro_AndroidProject.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-3xl bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#101217]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ea8612] text-black flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isArabic
                  ? 'بناء وتثبيت APK على Pixel 6 Pro (Sideload)'
                  : 'Sideload APK for Google Pixel 6 Pro'}
              </h3>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'مشروع أندرويد جاهز مع ffmpeg-kit v6.0 و WorkManager و Thermal Guard'
                  : 'Complete Android Studio Project + Termux On-Device APK Builder'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 sm:px-6 border-b border-white/10 bg-[#0d0f13] text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('build')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'build'
                ? 'border-[#ea8612] text-[#ea8612]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {isArabic ? '1. تحميل المشروع (1-Click ZIP)' : '1. Download Project (ZIP)'}
          </button>
          <button
            onClick={() => setActiveTab('termux')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'termux'
                ? 'border-[#ea8612] text-[#ea8612]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {isArabic ? '2. بناء الـ APK عبر Termux (بدون PC)' : '2. Termux On-Device Build'}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-[#ea8612] text-[#ea8612]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {isArabic ? '3. معاينة كود Kotlin و FFmpeg' : '3. Inspect Kotlin Source'}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'build' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#1b2029] border border-[#ea8612]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#ea8612]">
                  <Smartphone className="w-5 h-5" />
                  <span className="font-bold text-sm text-white">
                    {isArabic ? 'حزمة التثبيت الشخصي لـ Pixel 6 Pro' : 'Personal Sideload Package'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isArabic
                    ? 'هذا المشروع كامل ومجهز بجميع مكتبات الأندرويد المطلوبة: FFmpeg Kit v6.0 LTS مع دعم 16KB Page Size الخاص بـ Android 15، و WorkManager لتشغيل الضغط في الخلفية، ونظام Thermal Guard لحماية معالج Tensor G1 من السخونية.'
                    : 'This production-ready native Android project contains everything: FFmpeg Kit v6.0 LTS with 16KB page size support for Android 15, WorkManager background foreground service, and Tensor G1 Thermal Guard.'}
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadZip}
                    disabled={downloadingZip}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#ea8612] hover:bg-[#d97706] text-black font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ea8612]/20 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {downloadingZip
                        ? isArabic
                          ? 'جاري تجميع الملفات...'
                          : 'Bundling Project...'
                        : isArabic
                        ? 'تحميل مشروع الأندرويد كامل (MyPixelFlow.zip)'
                        : 'Download Complete Project (.ZIP)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Guarantees checklist */}
              <div className="p-4 rounded-xl bg-[#0f1115] border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-slate-200">
                  {isArabic ? 'مواصفات الـ APK المصنوع:' : 'Native App Specifications:'}
                </h4>
                <ul className="text-xs text-slate-400 space-y-1 font-mono">
                  <li>✓ Package: com.pixelflow.keeper</li>
                  <li>✓ Target SDK: 35 (Android 15 Ready - 16KB Alignment)</li>
                  <li>✓ CPU ABI: arm64-v8a (Google Tensor G1 Native)</li>
                  <li>✓ Permissions: READ_MEDIA_VIDEO, POST_NOTIFICATIONS (No Internet needed - 100% offline)</li>
                  <li>✓ Background Service: Foreground WorkManager with Ongoing Notification</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'termux' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#12161f] border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Terminal className="w-5 h-5" />
                    <span className="font-bold text-sm text-white">
                      {isArabic ? 'بناء الـ APK مباشرة داخل التيليفون' : 'Build On Pixel 6 Pro via Termux'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(ANDROID_FILES.termuxBuildScript)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'منسوخ!' : 'نسخ السكربت'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300">
                  {isArabic
                    ? 'إيلا ما عندكش بيسي، تقدر تبني الـ APK مباشرة فـ Pixel 6 Pro ديالك باستعمال تطبيق Termux مجاناً وبدون روت:'
                    : 'If you do not have a computer, you can compile the APK directly on your Pixel 6 Pro using Termux (no root required):'}
                </p>

                <div className="p-3 bg-black/80 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto">
                  <pre>{ANDROID_FILES.termuxBuildScript}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              {/* File switcher buttons */}
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ANDROID_FILES) as Array<keyof typeof ANDROID_FILES>).map((fileKey) => (
                  <button
                    key={fileKey}
                    onClick={() => setSelectedFile(fileKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      selectedFile === fileKey
                        ? 'bg-[#ea8612] text-black font-bold'
                        : 'bg-[#181c24] text-slate-300 hover:bg-[#202530]'
                    }`}
                  >
                    {fileKey === 'compressWorker' && 'CompressWorker.kt'}
                    {fileKey === 'thermalGuard' && 'ThermalGuard.kt'}
                    {fileKey === 'mainActivity' && 'MainActivity.kt'}
                    {fileKey === 'buildGradleApp' && 'build.gradle.kts'}
                    {fileKey === 'manifest' && 'AndroidManifest.xml'}
                    {fileKey === 'termuxBuildScript' && 'build_apk.sh'}
                    {fileKey === 'readme' && 'README.md'}
                  </button>
                ))}
              </div>

              {/* Code viewer */}
              <div className="relative">
                <button
                  onClick={() => handleCopyCode(ANDROID_FILES[selectedFile])}
                  className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'منسوخ!' : 'نسخ'}</span>
                </button>
                <div className="p-4 bg-black/90 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
                  <pre>{ANDROID_FILES[selectedFile]}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#101217] flex items-center justify-between text-xs text-slate-400">
          <span>Pixel 6 Pro · Tensor G1 · ffmpeg-kit-full-gpl 6.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium cursor-pointer"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
