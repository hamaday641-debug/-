import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  X, 
  Maximize2, 
  Minimize2, 
  Clock, 
  Calendar, 
  Compass, 
  Volume2, 
  ShieldCheck, 
  Sparkles,
  MapPin,
  Bell
} from 'lucide-react';
import { prayerTimesService } from '../services/prayerTimes';
import { adhanScheduler } from '../services/adhanScheduler';
import { getHijriDateArabic } from '../utils/islamicDates';

interface LockScreenAmbientViewProps {
  onClose: () => void;
}

export const LockScreenAmbientView: React.FC<LockScreenAmbientViewProps> = ({ onClose }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDimmed, setIsDimmed] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Request screen WakeLock so the display stays awake like an Always-on lock screen
  useEffect(() => {
    let wakeLockSentinel: any = null;

    async function requestWakeLock() {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
          setWakeLockActive(true);
          wakeLockSentinel.addEventListener('release', () => {
            setWakeLockActive(false);
          });
        } catch (err) {
          console.warn('Wake Lock request error:', err);
        }
      }
    }

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLockSentinel) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const city = adhanScheduler.getSelectedCity();
  const times = prayerTimesService.getTodayPrayerTimes(currentTime);
  const hijri = getHijriDateArabic(currentTime);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const isPM = hours >= 12;
  const displayHours = hours % 12 || 12;
  const pad = (n: number) => String(n).padStart(2, '0');

  const prayers = [
    { key: 'fajr', label: 'الفجر', time: times.fajr },
    { key: 'dhuhr', label: 'الظهر', time: times.dhuhr },
    { key: 'asr', label: 'العصر', time: times.asr },
    { key: 'maghrib', label: 'المغرب', time: times.maghrib },
    { key: 'isha', label: 'العشاء', time: times.isha },
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[200] flex flex-col justify-between p-6 sm:p-10 select-none transition-colors duration-500 font-arabic ${
        isDimmed 
          ? 'bg-black text-[#55695C]' 
          : 'bg-gradient-to-b from-[#0B1710] via-[#102417] to-[#08120B] text-white'
      }`}
    >
      {/* Top Bar: Controls & City */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#E9B161]">
            <MapPin className="w-3.5 h-3.5" />
            <span className="font-bold">{city.name}</span>
          </div>

          {wakeLockActive && (
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2.5 py-1 rounded-full hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              الشاشة مستمرة في العمل (Always-On)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Night Dim Toggle */}
          <button
            type="button"
            onClick={() => setIsDimmed(!isDimmed)}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
              isDimmed 
                ? 'bg-[#E9B161]/20 border-[#E9B161] text-[#E9B161]' 
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
            }`}
            title="وضع السكون الليلي الخافت"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all cursor-pointer"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all cursor-pointer"
            title="إغلاق ودجت شاشة القفل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center Display: Time & Dates & Next Prayer */}
      <div className="flex flex-col items-center justify-center text-center my-auto space-y-6">
        {/* Hijri & Gregorian Dates */}
        <div className="space-y-1">
          <div className="text-sm sm:text-base font-bold text-[#E9B161] tracking-wide font-scheherazade">
            {hijri.fullArabic} هـ
          </div>
          <div className="text-xs sm:text-sm text-stone-400">
            {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Large Digital Clock */}
        <div className="flex items-baseline justify-center gap-2 font-mono" dir="ltr">
          <div className={`font-black tracking-tight ${isDimmed ? 'text-stone-500' : 'text-white'} text-6xl sm:text-8xl md:text-9xl`}>
            {pad(displayHours)}:{pad(minutes)}
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-lg sm:text-2xl font-bold text-[#E9B161]">
              {isPM ? 'م' : 'ص'}
            </span>
            <span className="text-sm sm:text-lg text-stone-500 font-mono">
              :{pad(seconds)}
            </span>
          </div>
        </div>

        {/* Next Prayer Highlight Card */}
        <div className={`px-6 py-4 rounded-3xl border transition-all max-w-md w-full ${
          isDimmed 
            ? 'bg-black/50 border-stone-800' 
            : 'bg-[#142419]/80 border-[#E9B161]/40 shadow-2xl backdrop-blur-md'
        }`}>
          <div className="flex items-center justify-between">
            <div className="text-right">
              <span className="text-xs text-stone-400 block">الصلاة القادمة</span>
              <span className="text-xl sm:text-2xl font-bold text-[#E9B161] font-scheherazade">
                صلاة {times.nextPrayerName}
              </span>
            </div>

            <div className="text-left font-mono">
              <span className="text-xs text-stone-400 block">الوقت المتبقي</span>
              <span className="text-xl sm:text-2xl font-bold text-white tracking-wider">
                {times.timeToNext}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Timeline: 5 Prayers in horizontal row */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {prayers.map((p) => {
            const isNext = p.label === times.nextPrayerName;
            return (
              <div
                key={p.key}
                className={`py-3 px-2 rounded-2xl text-center border transition-all ${
                  isNext
                    ? 'bg-[#E9B161] text-[#1B3022] border-[#E9B161] font-bold shadow-lg scale-105'
                    : isDimmed
                    ? 'bg-black/60 border-stone-900 text-stone-600'
                    : 'bg-white/5 border-white/10 text-stone-300'
                }`}
              >
                <div className="text-[11px] sm:text-xs font-semibold">{p.label}</div>
                <div className="text-xs sm:text-sm font-mono mt-0.5">{p.time}</div>
                {isNext && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1B3022] mx-auto mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
