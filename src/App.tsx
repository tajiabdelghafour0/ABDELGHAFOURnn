import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { VideoMetadata, CompressionResult, CompressionState } from './types';
import { INITIAL_PIXEL_VIDEOS } from './data/sampleVideos';
import { analyzeLocalVideoFile } from './services/videoAnalyzer';
import { runDualTrackCompression } from './services/dualTrackProcessor';
import { PixelHeader } from './components/PixelHeader';
import { VideoSelectorCard } from './components/VideoSelectorCard';
import { OneBigButton } from './components/OneBigButton';
import { ProcessingModal } from './components/ProcessingModal';
import { ResultScreen } from './components/ResultScreen';
import { ApkExportModal } from './components/ApkExportModal';
import { EdlModal } from './components/EdlModal';

export default function App() {
  const [language, setLanguage] = useState<'darija' | 'en'>('darija');
  const [videos, setVideos] = useState<VideoMetadata[]>(INITIAL_PIXEL_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata>(INITIAL_PIXEL_VIDEOS[0]);

  const [compressionState, setCompressionState] = useState<CompressionState>({
    status: 'idle',
    currentTrack: 'master',
    progressMaster: 0,
    progressProxy: 0,
    overallProgress: 0,
    fpsCurrent: 0,
    speed: '0x',
    etaSeconds: 0,
    temperatureC: 38.2,
    isThermalThrottled: false,
    notificationMessage: '',
    logLines: [],
  });

  const [result, setResult] = useState<CompressionResult | null>(null);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isEdlModalOpen, setIsEdlModalOpen] = useState(false);

  const abortSignalRef = useRef<{ aborted: boolean }>({ aborted: false });
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const isArabic = language === 'darija';

  const handleStartCompression = async () => {
    abortSignalRef.current = { aborted: false };
    setResult(null);

    setCompressionState((prev) => ({
      ...prev,
      status: 'analyzing',
      overallProgress: 2,
      notificationMessage: isArabic
        ? 'كيحلل الفيديو والإضاءة... (Tensor G1)'
        : 'Analyzing video luma & Tensor G1 thermal status...',
    }));

    try {
      const compressionResult = await runDualTrackCompression(
        selectedVideo,
        {
          onStateChange: (state) => setCompressionState(state),
          onLog: (line) => {
            // Log output handled inside service
          },
        },
        abortSignalRef.current
      );

      setResult(compressionResult);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ea8612', '#38bdf8', '#10b981', '#ffffff'],
        });
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      if ((err as Error)?.message !== 'Cancelled by user') {
        setCompressionState((prev) => ({
          ...prev,
          status: 'error',
          notificationMessage: 'خطأ أثناء المعالجة',
        }));
      }
    }
  };

  const handleCancel = () => {
    abortSignalRef.current.aborted = true;
    setCompressionState((prev) => ({
      ...prev,
      status: 'idle',
      overallProgress: 0,
    }));
  };

  const handlePickFromGallery = () => {
    hiddenFileInputRef.current?.click();
  };

  const handleCustomFileUpload = async (file: File) => {
    const analyzed = await analyzeLocalVideoFile(file);
    setVideos((prev) => [analyzed, ...prev]);
    setSelectedVideo(analyzed);
    setResult(null);
  };

  const handleResetToNewVideo = () => {
    setResult(null);
    setCompressionState((prev) => ({
      ...prev,
      status: 'idle',
      overallProgress: 0,
    }));
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-100 flex flex-col font-sans selection:bg-[#ea8612] selection:text-black">
      {/* Pixel 6 Pro Header */}
      <PixelHeader
        language={language}
        onToggleLanguage={() => setLanguage(language === 'darija' ? 'en' : 'darija')}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        temperatureC={compressionState.temperatureC}
      />

      {/* Main Single-Screen Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 sm:py-8 flex flex-col justify-start space-y-6">
        {result ? (
          /* Result Screen */
          <ResultScreen
            result={result}
            language={language}
            onReset={handleResetToNewVideo}
            onOpenEdlModal={() => setIsEdlModalOpen(true)}
          />
        ) : (
          /* Main Screen 1 */
          <>
            {/* DCIM/Camera Video Card */}
            <VideoSelectorCard
              currentVideo={selectedVideo}
              allVideos={videos}
              onSelectVideo={(v) => {
                setSelectedVideo(v);
                setResult(null);
              }}
              onUploadFile={handleCustomFileUpload}
              language={language}
            />

            {/* The One Big Button */}
            <OneBigButton
              onStart={handleStartCompression}
              onPickFromGallery={handlePickFromGallery}
              language={language}
              isProcessing={compressionState.status === 'processing'}
            />
          </>
        )}
      </main>

      {/* Hidden File Input for Gallery Picker */}
      <input
        type="file"
        ref={hiddenFileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleCustomFileUpload(e.target.files[0]);
          }
        }}
        accept="video/*"
        className="hidden"
      />

      {/* Processing Modal Screen */}
      {(compressionState.status === 'processing' || compressionState.status === 'analyzing') && (
        <ProcessingModal
          state={compressionState}
          video={selectedVideo}
          language={language}
          onCancel={handleCancel}
        />
      )}

      {/* Sideload APK & Project Download Modal */}
      <ApkExportModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        language={language}
      />

      {/* AI EDL Cut Modal */}
      <EdlModal
        isOpen={isEdlModalOpen}
        onClose={() => setIsEdlModalOpen(false)}
        video={selectedVideo}
        language={language}
      />
    </div>
  );
}
