import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Sparkles, CheckCircle, Compass, RotateCcw, AlertTriangle } from 'lucide-react';

interface QiblaCameraARProps {
  qiblaBearing: number;
  deviceHeading: number | null;
  cityName: string;
}

export const QiblaCameraAR: React.FC<QiblaCameraARProps> = ({
  qiblaBearing,
  deviceHeading,
  cityName,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCameraAngle, setManualCameraAngle] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeHeading = deviceHeading !== null ? deviceHeading : manualCameraAngle;
  const qiblaDeg = Math.round(qiblaBearing);

  // Angle difference between camera facing direction and Kaaba
  const diffAngle = ((qiblaBearing - activeHeading + 540) % 360) - 180;
  const isAligned = Math.abs(diffAngle) <= 6;

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('متصفحك لا يدعم فتح الكاميرا المباشرة.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      let message = 'تعذر فتح الكاميرا.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission denied')) {
        message = 'تم رفض إذن الكاميرا من المتصفح. يُرجى السماح للتطبيق باستخدام الكاميرا من إعدادات المتصفح أو أيقونة القفل أعلى الصفحة.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'لم يتم العثور على كاميرا في جهازك.';
      } else if (err.message) {
        message = err.message;
      }
      setCameraError(message);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4 text-right">
      {/* Intro Box */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-950 dark:text-indigo-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-indigo-800 dark:text-indigo-400">
          <Camera className="w-5 h-5 shrink-0" />
          <h4 className="text-sm sm:text-base font-arabic">
            كاميرا الواقع المعزز (AR) لرؤية موقع الكعبة في غرفتك مباشرة
          </h4>
        </div>
        <p className="text-xs leading-relaxed text-stone-700 dark:text-indigo-100/90">
          وجّه كاميرا هاتفك حول الغرفة: ستظهر لك علامة الكعبة المشرفة ومؤشر التوجيه مباشرة على شاشة الكاميرا لتشاهد أين تقع الكعبة في محيطك الفعلي.
        </p>
      </div>

      {/* Camera Viewport / Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-[#2D4536] shadow-2xl bg-black flex items-center justify-center">
        {/* Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
        />

        {/* Inactive Camera Placeholder */}
        {!isCameraActive && (
          <div className="text-center p-6 space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>
            <h5 className="font-bold text-white text-base">تشغيل كاميرا القبلة الحية</h5>
            <p className="text-xs text-stone-300">
              انقر على الزر أدناه للسماح بفتح الكاميرا ورؤية القبلة المشرفة في الغرفة
            </p>
            <button
              type="button"
              onClick={startCamera}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto shadow-lg cursor-pointer transition-transform active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>تشغيل الكاميرا الآن</span>
            </button>
            {cameraError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] flex items-center gap-2 text-right">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}

        {/* Live AR Overlay (when camera is on) */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
            {/* Top Status Header */}
            <div className="flex items-center justify-between z-20">
              <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 text-white text-xs font-bold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>القبلة: <strong className="text-emerald-400 font-mono">{qiblaDeg}°</strong></span>
              </div>

              <button
                type="button"
                onClick={stopCamera}
                className="pointer-events-auto bg-rose-600/80 hover:bg-rose-700 text-white px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <CameraOff className="w-3.5 h-3.5" />
                <span>إغلاق الكاميرا</span>
              </button>
            </div>

            {/* Central AR Kaaba Target & Guidance */}
            <div className="relative flex items-center justify-center flex-1">
              {/* Screen Horizon Center Crosshair */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/70" />
              </div>

              {/* Floating Kaaba AR Marker based on diffAngle */}
              {/* If Kaaba is in field of view (-45° to +45°), place it horizontally on screen */}
              {Math.abs(diffAngle) <= 50 ? (
                <div
                  className="absolute flex flex-col items-center transition-all duration-200"
                  style={{
                    transform: `translateX(${-diffAngle * 5}px) scale(${isAligned ? 1.2 : 1})`,
                  }}
                >
                  <div className={`p-3 rounded-3xl border-2 flex flex-col items-center justify-center shadow-2xl transition-all ${
                    isAligned 
                      ? 'bg-emerald-600 border-white text-white ring-8 ring-emerald-500/50 scale-110' 
                      : 'bg-black/80 border-emerald-400 text-emerald-300'
                  }`}>
                    <img src="/icon.svg" alt="الكعبة" className="w-8 h-8 object-contain drop-shadow" />
                    <span className="text-[11px] font-bold mt-1">الكعبة المشرفة 🕋</span>
                  </div>
                  {isAligned && (
                    <span className="mt-2 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                      ✨ أنت تواجه القبلة تماماً!
                    </span>
                  )}
                </div>
              ) : (
                /* Out of view arrow guidance */
                <div className="absolute bg-black/80 text-white px-4 py-2 rounded-2xl border border-emerald-500 text-xs font-bold flex items-center gap-2 shadow-2xl animate-pulse">
                  {diffAngle > 0 ? (
                    <>أدر الكاميرا يميناً ➡️ بمقدار {Math.round(diffAngle)}°</>
                  ) : (
                    <>⬅️ أدر الكاميرا يساراً بمقدار {Math.round(Math.abs(diffAngle))}°</>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Guidance Bar */}
            <div className="bg-black/75 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 text-center text-xs font-bold text-white z-20">
              {isAligned ? (
                <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  أنت الآن تنظر مباشرة باتجاه الكعبة المشرفة في {cityName}
                </span>
              ) : (
                <span className="text-amber-300">
                  {diffAngle > 0 ? `أدر هاتفك يميناً (${Math.round(diffAngle)}°)` : `أدر هاتفك يساراً (${Math.round(Math.abs(diffAngle))}°)`} للوصول للكعبة
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Manual rotate slider fallback if sensor is unavailable on PC */}
      {isCameraActive && deviceHeading === null && (
        <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-[#142419] border border-[#2D4536]/20 text-xs space-y-2">
          <div className="flex justify-between font-bold text-stone-700 dark:text-stone-300">
            <span>توجيه الكاميرا يدوياً (لأجهزة الكمبيوتر):</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">{manualCameraAngle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="359"
            value={manualCameraAngle}
            onChange={(e) => setManualCameraAngle(Number(e.target.value))}
            className="w-full h-2 bg-stone-300 dark:bg-[#1B3022] rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>
      )}
    </div>
  );
};
