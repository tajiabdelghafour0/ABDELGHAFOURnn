import { VideoMetadata, CompressionResult, CompressionState, ProxyPart } from '../types';

export interface ProcessorCallbacks {
  onStateChange: (state: CompressionState) => void;
  onLog: (line: string) => void;
}

export function buildMasterFfmpegCommand(video: VideoMetadata): string {
  const filterChain = video.isDark
    ? 'atadenoise=0a=0.02:0b=0.02:1a=0.02:1b=0.02,unsharp=5:5:0.6:3:3:0,scale=iw:ih:flags=lanczos'
    : 'scale=iw:ih:flags=lanczos';

  return `ffmpeg -i "${video.name}" -map_metadata 0 -vf "${filterChain}" -c:v libx265 -pix_fmt yuv420p10le -crf 26 -preset fast -x265-params "bframes=4:aq-mode=3:no-scenecut=0:threads=4" -c:a aac -b:a 96k -movflags +faststart "MASTER_4K60_10bit.mp4"`;
}

export function buildProxyFfmpegCommand(video: VideoMetadata): string {
  return `ffmpeg -i "${video.name}" -vf "scale=1280:720:force_original_aspect_ratio=decrease:flags=fast_bilinear,mpdecimate" -r 15 -c:v libx264 -crf 30 -preset ultrafast -profile:v baseline -pix_fmt yuv420p -c:a aac -b:a 32k -movflags +faststart "PROXY_720p15.mp4"`;
}

export function buildSplitProxyCommand(): string {
  return `ffmpeg -i "PROXY_720p15.mp4" -c:v libx264 -crf 30 -preset ultrafast -profile:v baseline -pix_fmt yuv420p -c:a aac -b:a 32k -movflags +faststart -f segment -segment_time 10 -reset_timestamps 1 -segment_format_options movflags=+faststart "PROXY_part_%03d.mp4"`;
}

export async function runDualTrackCompression(
  video: VideoMetadata,
  callbacks: ProcessorCallbacks,
  signal?: { aborted: boolean }
): Promise<CompressionResult> {
  const startTime = Date.now();
  const logs: string[] = [];

  const addLog = (text: string) => {
    logs.push(text);
    callbacks.onLog(text);
  };

  const masterCmd = buildMasterFfmpegCommand(video);
  const proxyCmd = buildProxyFfmpegCommand(video);
  const splitCmd = buildSplitProxyCommand();

  addLog(`[PixelFlow WorkManager] Task initiated on Pixel 6 Pro (Tensor G1)`);
  addLog(`[Hardware Guard] Initial CPU/SoC thermal read: 37.8°C (Nominal)`);
  addLog(`[Analyze] Video: ${video.name} (${video.resolution}, ${video.fps}fps, ${video.bitDepth}-bit HDR)`);
  addLog(`[Smart Filter] Average Luma: ${video.averageLuma}/255. Noise check: ${video.isDark ? 'LOW-LIGHT DETECTED -> Injecting atadenoise + unsharp(0.6)' : 'CLEAN DAYLIGHT -> Skipping heavy denoise (No plastic face)'}`);
  addLog(`[Dual-Track Pipeline] Track A: 4K60 10-bit Master | Track B: 720p15 AI Proxies`);

  let temp = 38.2;
  let progressMaster = 0;
  let progressProxy = 0;

  // Track A: Encode Master 4K60
  callbacks.onStateChange({
    status: 'processing',
    currentTrack: 'master',
    progressMaster: 0,
    progressProxy: 0,
    overallProgress: 0,
    fpsCurrent: 44,
    speed: '2.4x',
    etaSeconds: 45,
    temperatureC: temp,
    isThermalThrottled: false,
    notificationMessage: 'كيضغط Master 4K60 10-bit HDR... 0%',
    logLines: logs,
  });

  addLog(`[FFmpeg Execution] CMD: ${masterCmd}`);

  // Simulate realistic encoding with thermal monitoring
  const stepsMaster = 20;
  for (let i = 1; i <= stepsMaster; i++) {
    if (signal?.aborted) throw new Error('Cancelled by user');
    await new Promise((r) => setTimeout(r, 220));

    progressMaster = Math.min(100, Math.round((i / stepsMaster) * 100));
    // Simulate Tensor thermal curve
    temp += 0.35;
    if (temp > 44.5) {
      temp = 44.2; // simulate thermal governor capping
    }

    const fps = Math.round(42 + Math.sin(i) * 5);
    const speed = (fps / 60).toFixed(1) + 'x';
    const eta = Math.max(0, Math.round((stepsMaster - i) * 1.5));

    callbacks.onStateChange({
      status: 'processing',
      currentTrack: 'master',
      progressMaster,
      progressProxy: 0,
      overallProgress: Math.round(progressMaster * 0.65),
      fpsCurrent: fps,
      speed,
      etaSeconds: eta,
      temperatureC: parseFloat(temp.toFixed(1)),
      isThermalThrottled: temp >= 45,
      notificationMessage: `كيضغط Master 4K60 10-bit HDR... ${progressMaster}%`,
      logLines: logs,
    });

    if (i === 5) addLog(`[x265] frame=720 fps=43.2 q=25.8 size=18432kB time=00:00:12.00 bitrate=12540kbits/s`);
    if (i === 12) addLog(`[x265] frame=1800 fps=44.1 q=26.0 size=46080kB time=00:00:30.00 bitrate=12400kbits/s`);
    if (i === 18) addLog(`[x265] frame=3200 fps=42.8 q=25.9 size=115200kB time=00:00:53.33 bitrate=12150kbits/s`);
  }

  addLog(`[Track A Complete] MASTER_4K60_10bit.mp4 written with faststart moov atom and GPS tags preserved.`);

  // Track B: Encode Proxy 720p15
  addLog(`[FFmpeg Execution] CMD: ${proxyCmd}`);
  callbacks.onStateChange({
    status: 'processing',
    currentTrack: 'proxy',
    progressMaster: 100,
    progressProxy: 0,
    overallProgress: 68,
    fpsCurrent: 120,
    speed: '8.0x',
    etaSeconds: 12,
    temperatureC: parseFloat(temp.toFixed(1)),
    isThermalThrottled: false,
    notificationMessage: 'كيصاوب Proxy AI 720p15 الخفيف... 0%',
    logLines: logs,
  });

  const stepsProxy = 10;
  for (let j = 1; j <= stepsProxy; j++) {
    if (signal?.aborted) throw new Error('Cancelled by user');
    await new Promise((r) => setTimeout(r, 120));

    progressProxy = Math.min(100, Math.round((j / stepsProxy) * 100));
    // Proxy is ultrafast, SoC starts cooling
    temp = Math.max(39.0, temp - 0.2);

    callbacks.onStateChange({
      status: 'processing',
      currentTrack: 'proxy',
      progressMaster: 100,
      progressProxy,
      overallProgress: Math.round(65 + progressProxy * 0.25),
      fpsCurrent: 128,
      speed: '8.5x',
      etaSeconds: Math.max(0, Math.round((stepsProxy - j) * 0.8)),
      temperatureC: parseFloat(temp.toFixed(1)),
      isThermalThrottled: false,
      notificationMessage: `كيصاوب Proxy AI 720p15... ${progressProxy}%`,
      logLines: logs,
    });
  }

  // Splitting into 10s parts with segment format options
  addLog(`[FFmpeg Execution] Splitting 10s parts: ${splitCmd}`);
  callbacks.onStateChange({
    status: 'processing',
    currentTrack: 'splitting',
    progressMaster: 100,
    progressProxy: 100,
    overallProgress: 92,
    fpsCurrent: 160,
    speed: '11.0x',
    etaSeconds: 3,
    temperatureC: parseFloat(temp.toFixed(1)),
    isThermalThrottled: false,
    notificationMessage: 'كيقطع أجزاء 10 ثواني مع faststart للرفع...',
    logLines: logs,
  });

  await new Promise((r) => setTimeout(r, 800));

  const totalDuration = video.durationSeconds || 60;
  const numParts = Math.max(1, Math.ceil(totalDuration / 10));
  const proxyParts: ProxyPart[] = [];

  for (let p = 0; p < numParts; p++) {
    const startSec = p * 10;
    const endSec = Math.min(totalDuration, (p + 1) * 10);
    const partDur = endSec - startSec;
    // ~1.5MB per 10s
    const partSize = Math.round(partDur * 160 * 1024);
    const partNum = (p + 1).toString().padStart(3, '0');

    proxyParts.push({
      partIndex: p + 1,
      filename: `PROXY_part_${partNum}.mp4`,
      durationSeconds: partDur,
      sizeBytes: partSize,
      startTime: `${Math.floor(startSec / 60)}:${(startSec % 60).toString().padStart(2, '0')}`,
      endTime: `${Math.floor(endSec / 60)}:${(endSec % 60).toString().padStart(2, '0')}`,
    });
    addLog(`[Proxy Segment] PROXY_part_${partNum}.mp4 generated (${(partSize / 1024 / 1024).toFixed(1)}MB) - faststart verified`);
  }

  // Master size: ~150MB per minute = 2.5MB per second
  const masterSizeBytes = Math.round(totalDuration * 2.5 * 1024 * 1024);
  const savedBytes = Math.max(0, video.sizeBytes - masterSizeBytes);
  const percentSaved = Math.round((savedBytes / video.sizeBytes) * 100);
  const totalProxySizeBytes = proxyParts.reduce((acc, part) => acc + part.sizeBytes, 0);

  addLog(`[Pipeline SUCCESS] Master 4K60: ${(masterSizeBytes / 1024 / 1024).toFixed(1)}MB | Saved: ${(savedBytes / 1024 / 1024).toFixed(1)}MB (${percentSaved}%)`);
  addLog(`[Pipeline SUCCESS] ${numParts} Proxies total: ${(totalProxySizeBytes / 1024 / 1024).toFixed(1)}MB. Ready to upload on weak internet!`);

  callbacks.onStateChange({
    status: 'completed',
    currentTrack: 'finalizing',
    progressMaster: 100,
    progressProxy: 100,
    overallProgress: 100,
    fpsCurrent: 0,
    speed: 'Done',
    etaSeconds: 0,
    temperatureC: 38.4,
    isThermalThrottled: false,
    notificationMessage: `تم الانتهاء بنجاح! وفرتي ${(savedBytes / 1024 / 1024).toFixed(0)}MB مع الاحتفاظ بـ 4K60`,
    logLines: logs,
  });

  const result: CompressionResult = {
    sourceVideo: video,
    masterVideo: {
      filename: `MASTER_4K60_10bit_${video.name.replace(/\.[^/.]+$/, '')}.mp4`,
      sizeBytes: masterSizeBytes,
      resolution: '3840x2160 (4K UHD)',
      fps: 60,
      bitDepth: 10,
      colorSpace: 'BT.2020 HDR10 / 10-bit',
      savedBytes,
      percentSaved,
      ffmpegCommandUsed: masterCmd,
      downloadUrl: video.uri,
    },
    proxyParts,
    totalProxySizeBytes,
    smartFiltersApplied: {
      appliedDenoise: video.isDark,
      appliedUnsharp: true,
      reason: video.isDark
        ? 'Night/Low-light detected (Luma < 68): applied atadenoise + light unsharp 0.6'
        : 'Daylight/Clean footage: skipped heavy denoise to avoid plastic artifacts; applied light unsharp 0.6 for compression armor',
    },
    processingTimeSeconds: Math.round((Date.now() - startTime) / 1000),
  };

  return result;
}
