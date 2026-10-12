import React from 'react';
import { Cpu, Thermometer, Package, Smartphone, Download, Globe } from 'lucide-react';

interface PixelHeaderProps {
  language: 'darija' | 'en';
  onToggleLanguage: () => void;
  onOpenApkModal: () => void;
  temperatureC: number;
}

export const PixelHeader: React.FC<PixelHeaderProps> = ({
  language,
  onToggleLanguage,
  onOpenApkModal,
  temperatureC,
}) => {
  const isArabic = language === 'darija';

  return (
    <header className="sticky top-0 z-30 bg-[#0d0f12]/90 backdrop-blur-md border-b border-white/5 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ea8612] to-[#f59e0b] flex items-center justify-center text-black font-extrabold text-base shadow-sm">
            4K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                My PixelFlow
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#ea8612] bg-[#ea8612]/10 px-1.5 py-0.5 rounded border border-[#ea8612]/20">
                Pixel 6 Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {isArabic ? 'حامي 4K60 10-bit HDR مع نظام المسارين' : 'Personal 4K60 10-bit Dual-Track Keeper'}
            </p>
          </div>
        </div>

        {/* Telemetry & Action Zone */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* SoC Thermal Sensor */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] text-cyan-300">Tensor G1</span>
            <span className="text-white/20">|</span>
            <Thermometer className={`w-3.5 h-3.5 ${temperatureC >= 45 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={`font-mono text-[11px] tabular-nums font-medium ${temperatureC >= 45 ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
              {temperatureC.toFixed(1)}°C
            </span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            title={isArabic ? 'Switch to English' : 'التحويل للدارجة'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/5 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{isArabic ? 'English' : 'الدارجة'}</span>
          </button>

          {/* Sideload APK Button */}
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ea8612] hover:bg-[#d97706] text-black font-semibold text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{isArabic ? 'ملف APK للموبايل' : 'Get APK'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
