import React from 'react';
import { Compass, CheckCircle, MapPin, Building, Sun, ArrowRight, ShieldCheck } from 'lucide-react';

interface QiblaEgyptGuideProps {
  cityName: string;
  qiblaBearing: number;
}

export const QiblaEgyptGuide: React.FC<QiblaEgyptGuideProps> = ({
  cityName,
  qiblaBearing,
}) => {
  return (
    <div className="space-y-6 text-right">
      {/* Intro Header */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <h4 className="text-sm sm:text-base font-arabic">
            الدليل القاطع والموثق لاتجاه القبلة في جمهورية مصر العربية ومحافظة الغربية
          </h4>
        </div>
        <p className="text-xs leading-relaxed text-stone-700 dark:text-emerald-100/90">
          تعتمد دار الإفتاء المصرية وهيئة المساحة المصرية والحسابات الفلكية العالمية أن اتجاه القبلة لجميع مدن الدلتا والقاهرة ومصر هو <strong>الجنوب الشرقي (بزاوية 136° إلى 138° من الشمال)</strong>.
        </p>
      </div>

      {/* Visual Direction Compass Diagram */}
      <div className="p-6 rounded-3xl bg-stone-50 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] shadow-xl max-w-xl mx-auto space-y-6">
        <h5 className="font-bold text-sm text-[#2C3E30] dark:text-white text-center font-arabic">
          خريطة الجهات الأربع والقبلة في مصر
        </h5>

        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          {/* North West */}
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300">
            <span className="font-bold block text-sm">↖️ شمال غرب</span>
            <span className="text-[10px] block opacity-75">315° (أوروبا والبحر)</span>
            <span className="text-[10px] font-bold text-rose-600 block mt-1">❌ عكس القبلة</span>
          </div>

          {/* North */}
          <div className="p-3 rounded-2xl bg-stone-200 dark:bg-[#1B3022] text-[#2C3E30] dark:text-white">
            <span className="font-bold block text-sm">⬆️ الشمال (0°)</span>
            <span className="text-[10px] block text-[#55695C] dark:text-[#A8BCAD]">طنطا / الإسكندرية</span>
          </div>

          {/* North East */}
          <div className="p-3 rounded-2xl bg-stone-200 dark:bg-[#1B3022] text-[#2C3E30] dark:text-white">
            <span className="font-bold block text-sm">↗️ شمال شرق</span>
            <span className="text-[10px] block text-[#55695C] dark:text-[#A8BCAD]">45° (دمياط / بورسعيد)</span>
          </div>

          {/* West */}
          <div className="p-3 rounded-2xl bg-stone-200 dark:bg-[#1B3022] text-[#2C3E30] dark:text-white">
            <span className="font-bold block text-sm">⬅️ الغرب (270°)</span>
            <span className="text-[10px] block text-[#55695C] dark:text-[#A8BCAD]">غروب الشمس / مطروح</span>
          </div>

          {/* Center */}
          <div className="p-3 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center shadow-lg ring-4 ring-emerald-500/30">
            <MapPin className="w-5 h-5" />
            <span className="font-bold text-xs mt-1">{cityName}</span>
          </div>

          {/* East */}
          <div className="p-3 rounded-2xl bg-stone-200 dark:bg-[#1B3022] text-[#2C3E30] dark:text-white">
            <span className="font-bold block text-sm">➡️ الشرق (90°)</span>
            <span className="text-[10px] block text-[#55695C] dark:text-[#A8BCAD]">شروق الشمس / القناة</span>
          </div>

          {/* South West */}
          <div className="p-3 rounded-2xl bg-stone-200 dark:bg-[#1B3022] text-[#2C3E30] dark:text-white">
            <span className="font-bold block text-sm">↙️ جنوب غرب</span>
            <span className="text-[10px] block text-[#55695C] dark:text-[#A8BCAD]">225° (الواحات / الصحراء)</span>
          </div>

          {/* South */}
          <div className="p-3 rounded-2xl bg-stone-200 dark:bg-[#1B3022] text-[#2C3E30] dark:text-white">
            <span className="font-bold block text-sm">⬇️ الجنوب (180°)</span>
            <span className="text-[10px] block text-[#55695C] dark:text-[#A8BCAD]">الصعيد / أسوان</span>
          </div>

          {/* South East (Qibla) */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white ring-4 ring-emerald-500/40 shadow-xl scale-105">
            <span className="font-bold block text-sm">↘️ جنوب شرق</span>
            <span className="font-mono text-[11px] block font-bold text-amber-300">138° (مكة المكرمة)</span>
            <span className="text-[10px] font-bold text-emerald-200 block mt-1">🕋 القبلة الصحيحة ✅</span>
          </div>
        </div>

        {/* 3 Practical Tests Anyone Can Do in 10 Seconds */}
        <div className="space-y-3 pt-2">
          <h6 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Building className="w-4 h-4" />
            <span>3 طرق مؤكدة لتطبيق القبلة في منزلك فوراً:</span>
          </h6>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1B3022] border border-[#2D4536]/20 text-xs space-y-1.5">
            <div className="font-bold text-stone-800 dark:text-[#E0E7E1] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0">1</span>
              <span>محراب أقرب مسجد لك:</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-[#A8BCAD] pr-7 leading-relaxed">
              جميع مساجد السنطة ومحافظة الغربية ومصر مبنية وموجهة بدقة بالغة إلى <strong>الجنوب الشرقي</strong>. اتجاه القبلة في بيتك موازٍ تماماً لاتجاه الإمام ومحراب المسجد المجاور لك.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1B3022] border border-[#2D4536]/20 text-xs space-y-1.5">
            <div className="font-bold text-stone-800 dark:text-[#E0E7E1] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0">2</span>
              <span>شروق الشمس (الشرق 90°):</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-[#A8BCAD] pr-7 leading-relaxed">
              قف وانظر إلى الجهة التي تشرق منها الشمس صباحاً (الشرق). القبلة تكون <strong>إلى يمينك بحوالي ثلث المسافة نحو الجنوب</strong> (بين الشرق والجنوب تماماً).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1B3022] border border-[#2D4536]/20 text-xs space-y-1.5">
            <div className="font-bold text-stone-800 dark:text-[#E0E7E1] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0">3</span>
              <span>التحقق عبر خريطة الشوارع (تبويب الخريطة):</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-[#A8BCAD] pr-7 leading-relaxed">
              افتح تبويب <strong>«خريطة الأقمار الصناعية»</strong> في التطبيق لتشاهد خط الليزر الأخضر فوق خريطة بيتك والشارع لتضبط زاوية سجادة الصلاة مع جدران شقتك بدقة 100%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
