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
  Github,
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
  const [activeTab, setActiveTab] = useState<'build' | 'github' | 'code'>('build');
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
      a.download = 'MyPixelFlow_Android_Studio_Gradle_Project.zip';
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
                  ? 'مشروع الأندرويد الحقيقي (Android Studio & Gradle Project)'
                  : 'Real Android Studio Gradle Project (Pixel 6 Pro)'}
              </h3>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'مشروع Gradle حقيقي جاهز للبناء مع ./gradlew assembleDebug و GitHub Actions'
                  : 'Complete Gradle Project buildable with ./gradlew assembleDebug & GitHub Actions'}
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
            {isArabic ? '1. تحميل مشروع Gradle (.ZIP)' : '1. Download Gradle Project (.ZIP)'}
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'github'
                ? 'border-[#ea8612] text-[#ea8612]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {isArabic ? '2. بناء APK عبر GitHub Actions' : '2. Build via GitHub Actions / CLI'}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-[#ea8612] text-[#ea8612]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {isArabic ? '3. معاينة كود الأندرويد' : '3. Inspect Android Files'}
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
                    {isArabic ? 'ملف الـ ZIP يحتوي على مشروع الأندرويد الحقيقي بالكامل:' : 'The ZIP Contains the Complete Real Android Project:'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isArabic
                    ? 'مشروع Gradle أصلي متكامل خاص بـ Google Pixel 6 Pro، يحتوي على settings.gradle، build.gradle، gradlew، app/build.gradle (مع ffmpeg-kit-full-gpl:6.0-2.LTS و WorkManager 2.9.0)، AndroidManifest.xml، MainActivity.kt، CompressWorker.kt (مع نظام Dual-Track V3 الكامل)، و ThermalGuard.kt.'
                    : 'A complete native Gradle project built specifically for Google Pixel 6 Pro. Contains settings.gradle, build.gradle, gradlew wrappers, app/build.gradle with ffmpeg-kit-full-gpl:6.0-2.LTS, WorkManager 2.9.0, AndroidManifest.xml, MainActivity.kt, CompressWorker.kt (with full V3 Dual-Track engine), and ThermalGuard.kt.'}
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
                          ? 'جاري تجميع ملفات الأندرويد...'
                          : 'Packaging Gradle Project...'
                        : isArabic
                        ? 'تحميل مشروع الأندرويد كامل (MyPixelFlow_Android_Project.zip)'
                        : 'Download Real Android Gradle Project (.ZIP)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Guarantees checklist */}
              <div className="p-4 rounded-xl bg-[#0f1115] border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-slate-200">
                  {isArabic ? 'هيكل المشروع داخل الـ ZIP:' : 'Project Hierarchy in ZIP:'}
                </h4>
                <ul className="text-xs text-slate-400 space-y-1 font-mono">
                  <li>📁 MyPixelFlow/</li>
                  <li>├── 📄 settings.gradle (include ':app')</li>
                  <li>├── 📄 build.gradle (AGP 8.2.0, Kotlin 1.9.22)</li>
                  <li>├── 📄 gradlew & gradlew.bat (Gradle 8.4 wrappers)</li>
                  <li>├── 📁 gradle/wrapper/gradle-wrapper.properties</li>
                  <li>├── 📁 .github/workflows/build-apk.yml (automated GitHub build)</li>
                  <li>└── 📁 app/</li>
                  <li>    ├── 📄 build.gradle (namespace 'com.mypixelflow', compileSdk 34)</li>
                  <li>    └── 📁 src/main/</li>
                  <li>        ├── 📄 AndroidManifest.xml (READ_MEDIA_VIDEO, FOREGROUND_SERVICE)</li>
                  <li>        ├── 📁 java/com/mypixelflow/</li>
                  <li>        │   ├── 📄 MainActivity.kt (DCIM Detection, One Big Button)</li>
                  <li>        │   ├── 📄 CompressWorker.kt (Master 4K60 + Proxies Dual-Track)</li>
                  <li>        │   └── 📄 ThermalGuard.kt (Tensor G1 sensor monitor)</li>
                  <li>        └── 📁 res/layout/activity_main.xml (Material You 3 Dark)</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#12161f] border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Github className="w-5 h-5" />
                    <span className="font-bold text-sm text-white">
                      {isArabic ? 'بناء الـ APK تلقائياً عبر GitHub Actions' : 'Automated Build in GitHub Actions'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(ANDROID_FILES.githubWorkflow)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'منسوخ!' : 'نسخ workflow'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300">
                  {isArabic
                    ? 'مشروع الـ ZIP يحتوي بالفعل على ملف .github/workflows/build-apk.yml. غير دير Push فـ GitHub، وغادي تبنى ليك الـ APK تلقائياً في دقيقتين وتقدر تنزلها مباشرة للموبايل!'
                    : 'The project includes a ready-to-use GitHub Actions workflow. Simply push the files to GitHub, and your APK will be automatically built and downloadable under Actions Artifacts in ~2 minutes!'}
                </p>

                <div className="p-3 bg-black/80 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto">
                  <pre>{ANDROID_FILES.githubWorkflow}</pre>
                </div>
              </div>

              {/* Local build commands */}
              <div className="p-4 rounded-xl bg-[#0f1115] border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-slate-200">
                  {isArabic ? 'أو ابنيها محلياً بسطر واحد:' : 'Or Build Locally with One Command:'}
                </h4>
                <div className="p-3 bg-black/70 rounded-lg font-mono text-xs text-amber-300 flex items-center justify-between">
                  <code>./gradlew assembleDebug</code>
                  <button
                    onClick={() => handleCopyCode('./gradlew assembleDebug')}
                    className="p-1 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  APK Output: <span className="font-mono text-slate-300">app/build/outputs/apk/debug/app-debug.apk</span>
                </p>
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
                    {fileKey === 'settingsGradle' && 'settings.gradle'}
                    {fileKey === 'buildGradleRoot' && 'build.gradle (root)'}
                    {fileKey === 'buildGradleApp' && 'app/build.gradle'}
                    {fileKey === 'manifest' && 'AndroidManifest.xml'}
                    {fileKey === 'mainActivity' && 'MainActivity.kt'}
                    {fileKey === 'compressWorker' && 'CompressWorker.kt'}
                    {fileKey === 'thermalGuard' && 'ThermalGuard.kt'}
                    {fileKey === 'layoutActivityMain' && 'activity_main.xml'}
                    {fileKey === 'githubWorkflow' && 'build-apk.yml'}
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
          <span>Namespace: com.mypixelflow · compileSdk 34 · ffmpeg-kit-full-gpl 6.0</span>
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
