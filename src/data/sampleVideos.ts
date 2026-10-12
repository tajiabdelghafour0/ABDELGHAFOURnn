import { VideoMetadata } from '../types';

export const INITIAL_PIXEL_VIDEOS: VideoMetadata[] = [
  {
    id: 'pxl_latest_01',
    name: 'PXL_20261012_125022830.TS.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 60,
    sizeBytes: 1184890880, // ~1.18 GB (approx 1GB/min)
    resolution: '3840x2160 (4K UHD)',
    fps: 60,
    bitDepth: 10,
    colorSpace: 'BT.2020 HDR10 / 10-bit',
    codec: 'HEVC Main 10 @ L5.1',
    dateRecorded: 'Today, 12:50 PM',
    location: 'DCIM/Camera (Pixel 6 Pro)',
    isDark: false,
    averageLuma: 142,
  },
  {
    id: 'pxl_night_02',
    name: 'PXL_20261011_214510009.TS.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 68,
    sizeBytes: 1342177280, // ~1.34 GB
    resolution: '3840x2160 (4K UHD)',
    fps: 60,
    bitDepth: 10,
    colorSpace: 'BT.2020 HDR10 / 10-bit',
    codec: 'HEVC Main 10 @ L5.1',
    dateRecorded: 'Yesterday, 09:45 PM',
    location: 'DCIM/Camera (Pixel 6 Pro Night Sight)',
    isDark: true, // triggers smart filter atadenoise
    averageLuma: 48,
  },
  {
    id: 'pxl_action_03',
    name: 'PXL_20261010_163012440.TS.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 45,
    sizeBytes: 885000000, // ~885 MB
    resolution: '3840x2160 (4K UHD)',
    fps: 60,
    bitDepth: 10,
    colorSpace: 'BT.2020 HDR10 / 10-bit',
    codec: 'HEVC Main 10 @ L5.1',
    dateRecorded: '2 days ago, 04:30 PM',
    location: 'DCIM/Camera (Pixel 6 Pro)',
    isDark: false,
    averageLuma: 168,
  },
];

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
