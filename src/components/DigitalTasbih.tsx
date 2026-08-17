import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Award, 
  Flame, 
  Check, 
  Plus, 
  Layers,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TasbihPreset {
  id: string;
  arabic: string;
  target: number;
  virtue: string;
}

const PRESETS: TasbihPreset[] = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', target: 33, virtue: 'غرست له شجرة في الجنة ومحت عنه خطاياه' },
  { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', target: 33, virtue: 'تملأ الميزان بالخير والبركة' },
  { id: 'allahuakbar', arabic: 'اللَّهُ أَكْبَرُ', target: 34, virtue: 'أحب الكلام إلى الله' },
  { id: 'la_ilaha', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', target: 100, virtue: 'كانت له عدل عشر رقاب وحطت عنه مائة سيئة' },
  { id: 'istighfar', arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ', target: 100, virtue: 'يفتح أبواب الرزق والفرج ومغفرة الذنوب' },
  { id: 'salawat', arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', target: 100, virtue: 'من صلى علي صلاة صلى الله عليه بها عشراً' },
  { id: 'hawqala', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ', target: 100, virtue: 'كنز من كنوز الجنة' },
  { id: 'subhan_wa_bihamdihi', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ', target: 100, virtue: 'كلمتان خفيفتان على اللسان ثقيلتان في الميزان' }
];

export const DigitalTasbih: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<TasbihPreset>(PRESETS[0]);
  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nour_tasbih_total');
      return saved ? parseInt(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [customGoal, setCustomGoal] = useState<number>(33);

  const handleIncrement = () => {
    const next = count + 1;
    const nextTotal = totalCount + 1;
    setCount(next);
    setTotalCount(nextTotal);

    try {
      localStorage.setItem('nour_tasbih_total', String(nextTotal));
    } catch {
      // ignore
    }

    // Vibration
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(next % customGoal === 0 ? [50, 50, 50] : 25);
    }

    // Audio click sound
    if (soundEnabled) {
      playBeep(next % customGoal === 0 ? 880 : 540);
    }

    // Goal reached celebration
    if (customGoal > 0 && next % customGoal === 0) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    }
  };

  const playBeep = (freq: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const progress = customGoal > 0 ? Math.min(100, Math.round(((count % customGoal) / customGoal) * 100)) : 0;
  const completedRounds = customGoal > 0 ? Math.floor(count / customGoal) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-28 text-center">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1B3022] via-[#233F2E] to-[#142419] border border-[#2D4536] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#142419]/70 border border-[#3D5A47] text-[#E9B161] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>المسبحة الإلكترونية الذكية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-scheherazade leading-tight mb-2">
            ﴿ وَاذْكُر رَّبَّكَ كَثِيرًا وَسَبِّحْ بِالْعَشِيِّ وَالْإِبْكَارِ ﴾
          </h2>
          <p className="text-xs sm:text-sm text-[#A8BCAD] leading-relaxed">
            سبحة تفاعلية مريحة للعين مع حفظ إجمالي التسبيحات ودعم الاهتزاز والأصوات الهادئة.
          </p>
        </div>
      </div>

      {/* Preset Adhkar Horizontal Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {PRESETS.map((preset) => {
          const isSelected = preset.id === selectedPreset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPreset(preset);
                setCustomGoal(preset.target);
                setCount(0);
              }}
              className={`px-4 py-2.5 rounded-2xl whitespace-nowrap font-bold transition-all shrink-0 border ${
                isSelected
                  ? 'bg-[#1B3022] text-[#E9B161] border-[#E9B161] shadow-md'
                  : 'bg-white dark:bg-[#1B3022]/30 text-[#2C3E30] dark:text-[#E0E7E1] border-[#2D4536]/15 dark:border-[#2D4536] hover:border-[#E9B161]'
              }`}
            >
              {preset.arabic}
            </button>
          );
        })}
      </div>

      {/* Active Dhikr Display & Virtue */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm space-y-2">
        <h3 className="font-quran text-2xl sm:text-3xl font-bold text-[#1B3022] dark:text-[#E9B161] leading-relaxed">
          {selectedPreset.arabic}
        </h3>
        <p className="text-xs text-[#8A5612] dark:text-[#E9B161] flex items-center justify-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-[#E9B161] shrink-0" />
          <span>{selectedPreset.virtue}</span>
        </p>
      </div>

      {/* Main Interactive Subha Dial */}
      <div className="py-4 flex flex-col items-center justify-center">
        <div
          onClick={handleIncrement}
          id="digital-tasbih-click-target"
          className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-[#142419] via-[#1B3022] to-[#233F2E] border-8 border-[#E9B161]/50 shadow-2xl shadow-[#142419]/50 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all select-none relative group hover:border-[#E9B161]/80"
        >
          {/* Progress Ring */}
          <div className="text-center text-white">
            <span className="text-xs text-[#E9B161] font-semibold block mb-1">
              الهدف: {customGoal} • الدورات: {completedRounds}
            </span>
            <div className="font-mono text-6xl sm:text-7xl font-extrabold text-[#E9B161] tracking-tight">
              {count}
            </div>
            <span className="text-xs text-[#A8BCAD] block mt-2 font-medium">
              اضغط للتسبيح
            </span>
          </div>

          {/* Pulse animation on click */}
          <div className="absolute inset-0 rounded-full border-2 border-white/20 pointer-events-none group-active:scale-105 transition-transform"></div>
        </div>

        {/* Progress Bar under Dial */}
        <div className="w-64 sm:w-72 mt-4 space-y-1">
          <div className="w-full h-2 bg-[#2D4536]/20 dark:bg-[#142419] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E9B161] to-[#2D4536] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-[#55695C] dark:text-[#A8BCAD] font-mono">
            <span>الدورة الحالية: {count % customGoal}/{customGoal}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Controls & Statistics Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        {/* Total lifetime count */}
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#E9B161]" />
          <span className="text-[#55695C] dark:text-[#A8BCAD]">
            إجمالي التسبيحات المحفوظة:{' '}
            <strong className="font-mono text-sm text-[#1B3022] dark:text-[#E9B161] font-bold">
              {totalCount.toLocaleString('ar-EG')}
            </strong>
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Goal Selector */}
          <select
            value={customGoal}
            onChange={(e) => setCustomGoal(parseInt(e.target.value))}
            className="px-2.5 py-1.5 rounded-xl bg-stone-50 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#3D5A47] text-[#2C3E30] dark:text-[#E0E7E1] font-bold text-xs"
          >
            <option value={33}>هدف 33</option>
            <option value={100}>هدف 100</option>
            <option value={500}>هدف 500</option>
            <option value={1000}>هدف 1000</option>
            <option value={99999}>مفتوح</option>
          </select>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-[#1B3022]/10 dark:bg-[#142419] text-[#1B3022] dark:text-[#E9B161] border-[#2D4536]/30 dark:border-[#3D5A47]'
                : 'bg-stone-100 dark:bg-[#142419] text-[#55695C] dark:text-[#A8BCAD] border-[#2D4536]/10 dark:border-[#2D4536]'
            }`}
            title="الصوت"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Current Count */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#142419] hover:bg-stone-200 dark:hover:bg-[#2D4536] text-[#2C3E30] dark:text-[#E0E7E1] font-semibold border border-[#2D4536]/15 dark:border-[#2D4536] transition-colors"
            title="تصفير العداد الحالي"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفير</span>
          </button>
        </div>
      </div>
    </div>
  );
};
