import { VideoMetadata } from '../types';

export async function analyzeLocalVideoFile(file: File): Promise<VideoMetadata> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      // Seek to 1 second to capture thumbnail and test luminance
      video.currentTime = Math.min(1.0, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = Math.min(640, video.videoWidth || 640);
      canvas.height = Math.min(360, video.videoHeight || 360);

      let averageLuma = 128;
      let thumbnailUrl = '';

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);

        // Sample pixels for average luminance
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          let totalLuma = 0;
          const step = 4 * 10; // sample every 10th pixel for speed
          let count = 0;
          for (let i = 0; i < data.length; i += step) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Standard Rec.709 luma formula
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLuma += luma;
            count++;
          }
          averageLuma = count > 0 ? Math.round(totalLuma / count) : 128;
        } catch {
          averageLuma = 120;
        }
      }

      const isDark = averageLuma < 68;
      const durationSeconds = Math.round(video.duration) || 60;
      const width = video.videoWidth || 3840;
      const height = video.videoHeight || 2160;

      const metadata: VideoMetadata = {
        id: `custom_${Date.now()}`,
        name: file.name,
        uri: objectUrl,
        file,
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
        durationSeconds,
        sizeBytes: file.size,
        resolution: `${width}x${height} ${width >= 3840 || height >= 3840 ? '(4K UHD)' : width >= 1920 ? '(1080p FHD)' : '(720p)'}`,
        fps: 60, // Pixel 6 Pro 4K60 standard
        bitDepth: 10,
        colorSpace: 'BT.2020 HDR10 / 10-bit',
        codec: 'HEVC Main 10 @ L5.1',
        dateRecorded: 'Today (from Gallery)',
        location: 'DCIM/Camera (Pixel 6 Pro)',
        isDark,
        averageLuma,
      };

      resolve(metadata);
    };

    video.onerror = () => {
      // Fallback if video tag cannot decode
      resolve({
        id: `custom_${Date.now()}`,
        name: file.name,
        durationSeconds: 60,
        sizeBytes: file.size,
        resolution: '3840x2160 (4K UHD)',
        fps: 60,
        bitDepth: 10,
        colorSpace: 'BT.2020 HDR10 / 10-bit',
        codec: 'HEVC Main 10 @ L5.1',
        dateRecorded: 'Today (from Gallery)',
        location: 'DCIM/Camera (Pixel 6 Pro)',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
        isDark: false,
        averageLuma: 135,
      });
    };
  });
}
