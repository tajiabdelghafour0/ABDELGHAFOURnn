export interface VideoMetadata {
  id: string;
  name: string;
  uri?: string;
  file?: File;
  thumbnailUrl: string;
  durationSeconds: number;
  sizeBytes: number;
  resolution: string; // e.g. "3840x2160 (4K UHD)"
  fps: number; // 60
  bitDepth: number; // 10
  colorSpace: string; // "BT.2020 HDR10" or "HLG"
  codec: string; // "HEVC / H.265"
  dateRecorded: string;
  location?: string;
  isDark: boolean;
  averageLuma: number; // 0-255
}

export interface ProxyPart {
  partIndex: number;
  filename: string;
  durationSeconds: number;
  sizeBytes: number;
  startTime: string;
  endTime: string;
  downloadUrl?: string;
}

export interface CompressionState {
  status: 'idle' | 'analyzing' | 'processing' | 'paused_thermal' | 'completed' | 'error';
  currentTrack: 'master' | 'proxy' | 'splitting' | 'finalizing';
  progressMaster: number; // 0-100
  progressProxy: number; // 0-100
  overallProgress: number; // 0-100
  fpsCurrent: number;
  speed: string; // e.g. "2.4x"
  etaSeconds: number;
  temperatureC: number;
  isThermalThrottled: boolean;
  notificationMessage: string;
  logLines: string[];
}

export interface CompressionResult {
  sourceVideo: VideoMetadata;
  masterVideo: {
    filename: string;
    sizeBytes: number;
    resolution: string;
    fps: number;
    bitDepth: number;
    colorSpace: string;
    savedBytes: number;
    percentSaved: number;
    ffmpegCommandUsed: string;
    downloadUrl?: string;
  };
  proxyParts: ProxyPart[];
  totalProxySizeBytes: number;
  smartFiltersApplied: {
    appliedDenoise: boolean;
    appliedUnsharp: boolean;
    reason: string;
  };
  processingTimeSeconds: number;
}

export interface EdlCut {
  id: string;
  label: string;
  startTime: number;
  endTime: number;
  selected: boolean;
}
