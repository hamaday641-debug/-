import React, { useState, useEffect } from 'react';
import { Sun, Sparkles, Clock, CheckCircle, ArrowUpRight, HelpCircle } from 'lucide-react';
import { calculateSunPosition } from '../utils/qiblaLocation';

interface QiblaSunShadowViewerProps {
  cityLat: number;
  cityLng: number;
  cityName: string;
  qiblaBearing: number;
}

export const QiblaSunShadowViewer: React.FC<QiblaSunShadowViewerProps> = ({
  cityLat,
  cityLng,
  cityName,
  qiblaBearing,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sunData = calculateSunPosition(currentTime, cityLat, cityLng);
  const qiblaDeg = Math.round(qiblaBearing);

  // Relative angle from Sun to Qibla
  const sunToQiblaDiff = ((qiblaBearing - sunData.azimuth + 540) % 360) - 180;
  // Relative angle from Shadow to Qibla
  const shadowToQiblaDiff = ((qiblaBearing - sunData.shadowBearing + 540) % 360) - 180;

  return (
    <div className="space-y-6 text-right">
      {/* Intro Box */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400">
          <Sun className="w-5 h-5 shrink-0 animate-spin-slow" />
          <h4 className="text-sm sm:text-base font-arabic">
            تحديد القبلة بالشمس والظل (الطريقة الفلكية الشرعية الموثوقة 100% بدون هواتف)
          </h4>
        </div>
        <p className="text-xs leading-relaxed text-stone-700 dark:text-amber-100/90">
          اعتمد المسلمون وعلماء الفلك عبر التاريخ على حركة الشمس لتحديد القبلة بدقة متناهية دون الحاجة لأي حساسات إلكترونية قد تتأثر بالمغناطيس.
        </p>
      </div>

      {/* Real-time Sun & Shadow Live Dial */}
      <div className="p-5 rounded-3xl bg-stone-50 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] shadow-xl max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-[#2D4536]/20 dark:border-[#2D4536] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Clock className="w-4 h-4" />
            <span>التوقيت اللحظي: {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            sunData.isDaytime 
              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40' 
              : 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/40'
          }`}>
            {sunData.isDaytime ? '☀️ نهاراً (الشمس في السماء)' : '🌙 ليلاً (الشمس تحت الأفق)'}
          </span>
        </div>

        {/* Circular Sun & Shadow Dial */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center select-none">
          {/* Dial Base */}
          <div className="w-full h-full rounded-full border-4 border-amber-500/30 dark:border-amber-500/40 bg-gradient-to-tr from-amber-50/50 via-stone-50 to-amber-100/30 dark:from-[#0E1A12] dark:via-[#142419] dark:to-[#1B3022] shadow-inner relative flex items-center justify-center">
            
            {/* Cardinal Points */}
            <span className="absolute top-2 text-[11px] font-bold text-red-600 dark:text-red-400 font-mono">N (شمال 0°)</span>
            <span className="absolute right-2 text-[11px] font-bold text-amber-700 dark:text-amber-400 font-mono">E (شرق 90°)</span>
            <span className="absolute bottom-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">S (جنوب 180°)</span>
            <span className="absolute left-2 text-[11px] font-bold text-stone-600 dark:text-stone-400 font-mono">W (غرب 270°)</span>

            {/* Qibla Direction Ray (Green Line) */}
            <div
              className="absolute inset-0 flex items-start justify-center pointer-events-none"
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
            >
              <div className="flex flex-col items-center mt-3">
                <div className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1 border border-white">
                  <span>القبلة 🕋</span>
                  <span className="font-mono">{qiblaDeg}°</span>
                </div>
                <div className="w-1.5 h-20 sm:h-24 bg-emerald-500 rounded-full shadow-[0_0_8px_#10B981] mt-1" />
              </div>
            </div>

            {/* Sun Ray (Golden/Yellow Line) */}
            {sunData.isDaytime && (
              <div
                className="absolute inset-0 flex items-start justify-center pointer-events-none transition-transform duration-300"
                style={{ transform: `rotate(${sunData.azimuth}deg)` }}
              >
                <div className="flex flex-col items-center mt-3">
                  <div className="bg-amber-500 text-[#142419] px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1 border border-white">
                    <span>الشمس ☀️</span>
                    <span className="font-mono">{Math.round(sunData.azimuth)}°</span>
                  </div>
                  <div className="w-1.5 h-16 sm:h-20 bg-amber-400 rounded-full shadow-[0_0_8px_#F59E0B] mt-1 border-dashed" />
                </div>
              </div>
            )}

            {/* Shadow Ray (Black/Gray Line Opposite to Sun) */}
            {sunData.isDaytime && (
              <div
                className="absolute inset-0 flex items-start justify-center pointer-events-none transition-transform duration-300"
                style={{ transform: `rotate(${sunData.shadowBearing}deg)` }}
              >
                <div className="flex flex-col items-center mt-5">
                  <div className="bg-stone-800 text-stone-200 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-md">
                    <span>اتجاه الظل 🪵</span>
                  </div>
                  <div className="w-1 h-14 sm:h-18 bg-stone-700 dark:bg-stone-400 rounded-full mt-1 opacity-75" />
                </div>
              </div>
            )}

            {/* Center Pin */}
            <div className="w-10 h-10 rounded-full bg-[#1B3022] border-2 border-[#E9B161] flex items-center justify-center text-white shadow-xl z-10">
              <span className="text-[10px] font-bold">أنت</span>
            </div>
          </div>
        </div>

        {/* Live Calculation Cards */}
        <div className="grid grid-cols-2 gap-3 text-center text-xs">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <span className="text-stone-600 dark:text-stone-300 block text-[11px]">موقع الشمس الآن:</span>
            <span className="font-mono font-bold text-base text-amber-700 dark:text-amber-400">
              {sunData.isDaytime ? `${Math.round(sunData.azimuth)}°` : 'تحت الأفق'}
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
              ارتفاعها: {sunData.altitude > 0 ? `${Math.round(sunData.altitude)}° فوق الأفق` : 'مغيبة'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
            <span className="text-stone-600 dark:text-stone-300 block text-[11px]">زاوية القبلة الثابتة:</span>
            <span className="font-mono font-bold text-base text-emerald-700 dark:text-emerald-400">{qiblaDeg}°</span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 block">جنوب شرق (مكة المكرمة)</span>
          </div>
        </div>

        {/* Practical Sun Alignment Guide for Santa/Egypt */}
        <div className="p-4 rounded-2xl bg-[#1B3022]/10 dark:bg-[#1B3022] border border-[#2D4536]/20 dark:border-[#3D5A47] space-y-2 text-xs leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
            <Sparkles className="w-4 h-4 text-[#E9B161]" />
            <span>كيف تعرف القبلة عملياً في {cityName} / مصر بدون أي جهاز:</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-stone-700 dark:text-[#E0E7E1] pr-1 text-[11px]">
            <li>
              <strong>في الصباح الباكر (وقت الشروق):</strong> انظر إلى شروق الشمس (الشرق = 90°)، القبلة تقع على <strong>يمينك بمقدار ثلث المسافة نحو الجنوب</strong> (138°).
            </li>
            <li>
              <strong>وقت صلاة الظهر (الزوال):</strong> تكون الشمس في الجنوب (180°)، وظلال الأشياء تشير للشمال تماماً. القبلة تكون <strong>على يسار الشمس بحوالي 42 درجة</strong> (بين الشرق والجنوب).
            </li>
            <li>
              <strong>في المساء (قبل الغروب):</strong> تكون الشمس في الغرب (270°)، إذا جعلت الغرب خلفك والشروق أمامك، تكون القبلة <strong>أمامك مائلة إلى اليمين</strong>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
