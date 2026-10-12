package com.mypixelflow

import android.content.Context
import android.os.Build
import android.os.HardwarePropertiesManager
import android.os.PowerManager
import android.util.Log

/**
 * ThermalGuard for Google Pixel 6 Pro (Tensor G1 SoC).
 * Monitors CPU/SoC temperatures and thermal status.
 *
 * Tensor G1 heats rapidly under multi-threaded HEVC encoding.
 * If temperature exceeds 45.0°C or Thermal Status reaches SEVERE,
 * this guard signals CompressWorker to pause until cooled.
 */
class ThermalGuard(private val context: Context) {

    private val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
    private val hardwarePropertiesManager =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            context.getSystemService(Context.HARDWARE_PROPERTIES_SERVICE) as? HardwarePropertiesManager
        } else {
            null
        }

    companion object {
        private const val TAG = "PixelFlow-Thermal"
        const val MAX_SAFE_TEMP_C = 45.0f
        const val RESUME_TEMP_C = 41.0f
    }

    /**
     * Checks if the device is currently overheating and needs an encoding pause.
     */
    fun isOverheating(): Boolean {
        // 1. Android Q+ PowerManager Thermal Status API
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val status = powerManager.currentThermalStatus
            if (status >= PowerManager.THERMAL_STATUS_SEVERE) {
                Log.w(TAG, "Thermal throttling triggered: PowerManager status=$status")
                return true
            }
        }

        // 2. HardwarePropertiesManager CPU / Skin temperature read
        val temp = getSoCTemperature()
        if (temp != null && temp >= MAX_SAFE_TEMP_C) {
            Log.w(TAG, "Thermal throttling triggered: SoC Temp = ${temp}°C >= ${MAX_SAFE_TEMP_C}°C")
            return true
        }

        return false
    }

    /**
     * Reads current SoC/CPU temperature in Celsius.
     */
    fun getSoCTemperature(): Float? {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && hardwarePropertiesManager != null) {
            try {
                val cpuTemps = hardwarePropertiesManager.getDeviceTemperatures(
                    HardwarePropertiesManager.DEVICE_TEMPERATURE_CPU,
                    HardwarePropertiesManager.TEMPERATURE_CURRENT
                )
                if (!cpuTemps.isNullOrEmpty() && cpuTemps[0] > 0) {
                    return cpuTemps[0]
                }
            } catch (e: Exception) {
                Log.d(TAG, "HardwarePropertiesManager query skipped: ${e.message}")
            }
        }
        return null
    }
}
