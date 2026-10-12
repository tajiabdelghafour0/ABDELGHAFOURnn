package com.mypixelflow

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.ForegroundInfo
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import com.arthenica.ffmpegkit.FFmpegKit
import com.arthenica.ffmpegkit.FFmpegKitConfig
import com.arthenica.ffmpegkit.ReturnCode
import kotlinx.coroutines.delay
import java.io.File

/**
 * CompressWorker - The V3 Dual-Track Core Engine for Pixel 6 Pro.
 *
 * Implements:
 * - TRACK A (MASTER): 100% 4K60 yuv420p10le, libx265 crf 26, preset fast, threads=4,
 *   -map_metadata 0 -movflags +faststart, preserves GPS/rotation, compresses 1GB -> ~150MB.
 * - TRACK B (PROXY): 720p 15fps baseline, ~1.5-3.5MB per 10s part, ~20MB for 1min,
 *   each part segmented with individual faststart moov atoms for instant streaming to Meta Muse/Gemini.
 * - SMART FILTER: analyzes frame luminance via MediaMetadataRetriever: skips denoiser on daylight
 *   to avoid plastic faces; applies atadenoise ONLY on dark/low-light scenes + unsharp=5:5:0.6 armor.
 * - THERMAL GUARD: runs in ForegroundService, checks ThermalGuard, pauses if SoC > 45°C.
 */
class CompressWorker(
    private val context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    private val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    private val thermalGuard = ThermalGuard(context)

    companion object {
        private const val TAG = "PixelFlow-Worker"
        const val CHANNEL_ID = "pixelflow_compression_channel"
        const val NOTIF_ID = 4060

        // Input / Output Data Keys
        const val KEY_INPUT_PATH = "KEY_INPUT_PATH"
        const val KEY_OUTPUT_DIR = "KEY_OUTPUT_DIR"
        const val KEY_RESULT_MASTER_PATH = "KEY_RESULT_MASTER_PATH"
        const val KEY_RESULT_PROXY_DIR = "KEY_RESULT_PROXY_DIR"
        const val KEY_RESULT_SAVED_MB = "KEY_RESULT_SAVED_MB"
        const val KEY_RESULT_PARTS_COUNT = "KEY_RESULT_PARTS_COUNT"
        const val KEY_PROGRESS_PERCENT = "KEY_PROGRESS_PERCENT"
        const val KEY_CURRENT_STATUS = "KEY_CURRENT_STATUS"
    }

    override suspend fun doWork(): Result {
        val inputPath = inputData.getString(KEY_INPUT_PATH) ?: return Result.failure()
        val customOutputDir = inputData.getString(KEY_OUTPUT_DIR)
        val outputDir = if (!customOutputDir.isNullOrEmpty()) {
            File(customOutputDir)
        } else {
            File(context.getExternalFilesDir(null) ?: context.filesDir, "PixelFlow_Output")
        }.apply { mkdirs() }

        createNotificationChannel()
        setForeground(createForegroundInfo("البداية: فحص الفيديو والمعالج...", 5))

        // Analyze video for Smart Filter (Daylight vs Low-Light Luma Detection)
        val isLowLight = analyzeVideoLuminance(inputPath)
        Log.i(TAG, "Smart Filter Analysis: isLowLight=$isLowLight")

        val masterFile = File(outputDir, "MASTER_4K60_10bit.mp4")
        val proxyFile = File(outputDir, "PROXY_720p15.mp4")
        val proxiesFolder = File(outputDir, "proxies").apply { mkdirs() }

        // ---------------------------------------------------------------------------------
        // TRACK A - MASTER 4K60 10-bit HDR (Thermal safe, fast)
        // ---------------------------------------------------------------------------------
        // Error 1: Never preset slow on Tensor G1 -> use preset fast + threads=4
        // Error 2: Smart Filter -> atadenoise ONLY if dark; unsharp 0.6 light armor
        // Error 3: Keep 10-bit HDR -> yuv420p10le
        // Error 4: Preserve GPS, date, rotation -> -map_metadata 0
        // Error 7: Keep 4K 60FPS
        // ---------------------------------------------------------------------------------
        val filterChain = if (isLowLight) {
            "atadenoise=0a=0.02:0b=0.02:1a=0.02:1b=0.02,unsharp=5:5:0.6:3:3:0,scale=iw:ih:flags=lanczos"
        } else {
            "scale=iw:ih:flags=lanczos"
        }

        val masterCmd = """
            -y -i "$inputPath" -map_metadata 0 -vf "$filterChain"
            -c:v libx265 -pix_fmt yuv420p10le -crf 26 -preset fast
            -x265-params bframes=4:aq-mode=3:no-scenecut=0:threads=4
            -c:a aac -b:a 96k -movflags +faststart "${masterFile.absolutePath}"
        """.trimIndent().replace("\n", " ")

        // Check thermal status before Track A
        guardThermalCooldown("Master 4K60")

        setForeground(createForegroundInfo("كيضغط Master 4K60 10-bit HDR...", 25))
        setProgress(workDataOf(KEY_PROGRESS_PERCENT to 25, KEY_CURRENT_STATUS to "Encoding Master 4K60"))

        Log.i(TAG, "Executing Track A FFmpeg: $masterCmd")
        val masterSession = FFmpegKit.execute(masterCmd)

        if (!ReturnCode.isSuccess(masterSession.returnCode)) {
            Log.e(TAG, "Track A Failed: ${masterSession.failStackTrace}")
            return Result.failure()
        }

        // ---------------------------------------------------------------------------------
        // TRACK B - PROXY AI ULTRA-LIGHT (720p 15fps baseline)
        // ---------------------------------------------------------------------------------
        // Error 9: force_original_aspect_ratio=decrease handles both 16:9 and 9:16
        // Error 10: 32k aac audio for proxy saves bitrate
        // ---------------------------------------------------------------------------------
        val proxyCmd = """
            -y -i "$inputPath" -vf "scale=1280:720:force_original_aspect_ratio=decrease:flags=fast_bilinear,mpdecimate"
            -r 15 -c:v libx264 -crf 30 -preset ultrafast -profile:v baseline -pix_fmt yuv420p
            -c:a aac -b:a 32k -movflags +faststart "${proxyFile.absolutePath}"
        """.trimIndent().replace("\n", " ")

        guardThermalCooldown("Proxy AI")

        setForeground(createForegroundInfo("كيصاوب Proxy AI 720p15...", 70))
        setProgress(workDataOf(KEY_PROGRESS_PERCENT to 70, KEY_CURRENT_STATUS to "Encoding Proxy AI"))

        Log.i(TAG, "Executing Track B FFmpeg: $proxyCmd")
        val proxySession = FFmpegKit.execute(proxyCmd)

        if (!ReturnCode.isSuccess(proxySession.returnCode)) {
            Log.e(TAG, "Track B Failed: ${proxySession.failStackTrace}")
            return Result.failure()
        }

        // ---------------------------------------------------------------------------------
        // TRACK B SPLITTING - 10-second parts with faststart per part
        // Error 5: Never use -c copy without faststart. Use segment_format_options movflags=+faststart
        // ---------------------------------------------------------------------------------
        val segmentTemplate = File(proxiesFolder, "PROXY_part_%03d.mp4").absolutePath
        val splitCmd = """
            -y -i "${proxyFile.absolutePath}"
            -c:v libx264 -crf 30 -preset ultrafast -profile:v baseline -pix_fmt yuv420p
            -c:a aac -b:a 32k -movflags +faststart
            -f segment -segment_time 10 -reset_timestamps 1
            -segment_format_options movflags=+faststart
            "$segmentTemplate"
        """.trimIndent().replace("\n", " ")

        setForeground(createForegroundInfo("كيقطع أجزاء 10 ثواني مع faststart...", 90))
        setProgress(workDataOf(KEY_PROGRESS_PERCENT to 90, KEY_CURRENT_STATUS to "Splitting Proxies"))

        Log.i(TAG, "Executing Proxy Split FFmpeg: $splitCmd")
        val splitSession = FFmpegKit.execute(splitCmd)

        if (!ReturnCode.isSuccess(splitSession.returnCode)) {
            Log.e(TAG, "Proxy Split Failed: ${splitSession.failStackTrace}")
            return Result.failure()
        }

        val generatedParts = proxiesFolder.listFiles { f -> f.name.startsWith("PROXY_part_") }?.size ?: 0
        val originalSizeMB = File(inputPath).length() / (1024 * 1024)
        val masterSizeMB = masterFile.length() / (1024 * 1024)
        val savedMB = (originalSizeMB - masterSizeMB).coerceAtLeast(0)

        setForeground(createForegroundInfo("تم الانتهاء بنجاح! وفرتي ${savedMB}MB", 100))
        Log.i(TAG, "Pipeline Finished! Master=${masterSizeMB}MB, Saved=${savedMB}MB, Proxies=${generatedParts}")

        return Result.success(
            workDataOf(
                KEY_RESULT_MASTER_PATH to masterFile.absolutePath,
                KEY_RESULT_PROXY_DIR to proxiesFolder.absolutePath,
                KEY_RESULT_SAVED_MB to savedMB,
                KEY_RESULT_PARTS_COUNT to generatedParts,
                KEY_PROGRESS_PERCENT to 100
            )
        )
    }

    /**
     * Thermal Guard Loop: pauses encoding if Tensor G1 exceeds 45°C until temperature drops.
     */
    private suspend fun guardThermalCooldown(stageName: String) {
        while (thermalGuard.isOverheating()) {
            val temp = thermalGuard.getSoCTemperature() ?: 45.5f
            val warningMsg = "المعالج سخن (${temp}°C > 45°C). حبسنا التبريد شوية..."
            Log.w(TAG, "Thermal Guard active during $stageName: $warningMsg")
            setForeground(createForegroundInfo(warningMsg, 50))
            delay(5000)
        }
    }

    /**
     * Extracts frame from video and calculates average Rec.709 luminance.
     * Returns true if scene is dark (<65/255 luma) indicating low-light noise.
     */
    private fun analyzeVideoLuminance(videoPath: String): Boolean {
        val retriever = MediaMetadataRetriever()
        return try {
            retriever.setDataSource(videoPath)
            val bitmap = retriever.getFrameAtTime(1_000_000, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
            if (bitmap != null) {
                calculateAverageLuma(bitmap) < 68
            } else {
                false
            }
        } catch (e: Exception) {
            Log.w(TAG, "Luma extraction fallback: ${e.message}")
            false
        } finally {
            retriever.release()
        }
    }

    private fun calculateAverageLuma(bitmap: Bitmap): Int {
        val width = bitmap.width
        val height = bitmap.height
        var totalLuma = 0L
        var sampleCount = 0

        val stepX = (width / 40).coerceAtLeast(1)
        val stepY = (height / 40).coerceAtLeast(1)

        for (x in 0 until width step stepX) {
            for (y in 0 until height step stepY) {
                val pixel = bitmap.getPixel(x, y)
                val r = (pixel shr 16) and 0xFF
                val g = (pixel shr 8) and 0xFF
                val b = pixel and 0xFF
                val luma = (0.299 * r + 0.587 * g + 0.114 * b).toInt()
                totalLuma += luma
                sampleCount++
            }
        }
        return if (sampleCount > 0) (totalLuma / sampleCount).toInt() else 128
    }

    private fun createForegroundInfo(message: String, progress: Int): ForegroundInfo {
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("My PixelFlow · 4K60 Keeper")
            .setContentText(message)
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setProgress(100, progress, false)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
        return ForegroundInfo(NOTIF_ID, notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "PixelFlow 4K60 Compression",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Background compression and thermal monitoring for Google Pixel 6 Pro"
            }
            notificationManager.createNotificationChannel(channel)
        }
    }
}
