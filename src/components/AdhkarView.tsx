import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Sunrise, 
  Bed, 
  Clock, 
  Sparkles, 
  Compass, 
  Coffee, 
  Flame, 
  RotateCcw, 
  Check, 
  Copy, 
  Share2, 
  Search, 
  CheckCircle2, 
  Volume2, 
  VolumeX,
  Award
} from 'lucide-react';
import { DHIKR_CATEGORIES, ADHKAR_LIST } from '../data/adhkar';
import { DhikrItem } from '../types';
import { normalizeArabic } from '../services/quranApi';
import confetti from 'canvas-confetti';

export const AdhkarView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('sabah');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Track progress counts in state & localStorage
  const [counts, setCounts] = useState<{ [id: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('nour_adhkar_counts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getRemainingCount = (item: DhikrItem) => {
    if (counts[item.id] !== undefined) {
      return counts[item.id];
    }
    return item.count;
  };

  const handleDecrement = (item: DhikrItem) => {
    const current = getRemainingCount(item);
    if (current <= 0) return;

    const next = current - 1;
    const newCounts = { ...counts, [item.id]: next };
    setCounts(newCounts);

    try {
      localStorage.setItem('nour_adhkar_counts', JSON.stringify(newCounts));
    } catch {
      // ignore
    }

    // Haptic vibration feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    // Audio click effect using Web Audio API
    if (soundEnabled) {
      playBeep(next === 0 ? 800 : 520);
    }

    // If completed this dhikr, celebrate!
    if (next === 0) {
      const categoryItems = ADHKAR_LIST.filter((i) => i.categoryId === selectedCategory);
      const allDone = categoryItems.every((i) => (newCounts[i.id] !== undefined ? newCounts[i.id] : i.count) === 0);
      if (allDone) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const playBeep = (freq: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  };

  const handleResetCategory = () => {
    const categoryItems = ADHKAR_LIST.filter((i) => i.categoryId === selectedCategory);
    const newCounts = { ...counts };
    categoryItems.forEach((i) => {
      newCounts[i.id] = i.count;
    });
    setCounts(newCounts);
    try {
      localStorage.setItem('nour_adhkar_counts', JSON.stringify(newCounts));
    } catch {
      // ignore
    }
  };

  const handleResetSingle = (item: DhikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const newCounts = { ...counts, [item.id]: item.count };
    setCounts(newCounts);
    try {
      localStorage.setItem('nour_adhkar_counts', JSON.stringify(newCounts));
    } catch {
      // ignore
    }
  };

  const handleCopyDhikr = (item: DhikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${item.text}\n\nالمصدر: ${item.source}\n${item.benefit ? `الفضل: ${item.benefit}` : ''}\n\n(منصة نور الإسلامية الشاملة)`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShareDhikr = (item: DhikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${item.text}\n\nالمصدر: ${item.source}`;
    if (navigator.share) {
      navigator.share({ title: 'ذكر مأثور', text }).catch(() => {});
    } else {
      handleCopyDhikr(item, e);
    }
  };

  const categoryItems = ADHKAR_LIST.filter((i) => i.categoryId === selectedCategory);

  const filteredItems = categoryItems.filter((item) => {
    if (!searchQuery) return true;
    const qNorm = normalizeArabic(searchQuery);
    const textNorm = normalizeArabic(item.text);
    const benNorm = item.benefit ? normalizeArabic(item.benefit) : '';
    const srcNorm = normalizeArabic(item.source);
    return textNorm.includes(qNorm) || benNorm.includes(qNorm) || srcNorm.includes(qNorm);
  });

  const totalCategoryDhikrs = categoryItems.length;
  const completedCategoryDhikrs = categoryItems.filter((i) => getRemainingCount(i) === 0).length;
  const progressPercent = totalCategoryDhikrs > 0 ? Math.round((completedCategoryDhikrs / totalCategoryDhikrs) * 100) : 0;

  const currentCategoryMeta = DHIKR_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1B3022] via-[#233F2E] to-[#142419] border border-[#2D4536] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#142419]/70 border border-[#3D5A47] text-[#E9B161] text-xs font-semibold mb-3">
            <Sun className="w-3.5 h-3.5" />
            <span>حصن المسلم والأذكار الصحيحة المأثورة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-scheherazade leading-tight mb-2">
            ﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾
          </h2>
          <p className="text-xs sm:text-sm text-[#A8BCAD] leading-relaxed">
            أذكار موثقة بالأسانيد الصحيحة مع عداد تسبيح تفاعلي واهتزاز وصوت لتيسير وردك اليومي.
          </p>
        </div>

        <div className="absolute left-6 -bottom-10 opacity-10 text-9xl font-scheherazade text-[#E9B161] select-none pointer-events-none hidden sm:block">
          أذكار
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {DHIKR_CATEGORIES.map((cat) => {
          const isSelected = cat.id === selectedCategory;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl whitespace-nowrap font-bold transition-all shrink-0 flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#1B3022] text-[#E9B161] border-[#E9B161] shadow-md dark:bg-[#1B3022] dark:text-[#E9B161]'
                  : 'bg-white dark:bg-[#1B3022]/40 text-[#2C3E30] dark:text-[#E0E7E1] border-[#2D4536]/20 dark:border-[#2D4536] hover:border-[#E9B161]/50'
              }`}
            >
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Progress & Quick Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1B3022]/40 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
          <div>
            <h3 className="font-bold text-sm text-[#2C3E30] dark:text-white">
              {currentCategoryMeta?.title}
            </h3>
            <p className="text-[11px] text-[#55695C] dark:text-[#A8BCAD]">
              {currentCategoryMeta?.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#1B3022] dark:text-[#E9B161] font-bold font-mono">
              {completedCategoryDhikrs}/{totalCategoryDhikrs}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#1B3022]/10 dark:bg-[#1B3022] text-[#1B3022] dark:text-[#E9B161] border border-[#2D4536]/20 dark:border-[#3D5A47] text-[10px] font-bold">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-[#1B3022]/10 dark:bg-[#1B3022] text-[#1B3022] dark:text-[#E9B161] border-[#2D4536]/30 dark:border-[#3D5A47]'
                : 'bg-stone-100 dark:bg-[#142419] text-[#55695C] dark:text-[#A8BCAD] border-stone-200 dark:border-[#2D4536]'
            }`}
            title={soundEnabled ? 'كتم صوت النقرات' : 'تفعيل صوت النقرات'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetCategory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-[#1B3022] hover:bg-stone-200 dark:hover:bg-[#2D4536] text-[#2C3E30] dark:text-[#E0E7E1] font-semibold border border-stone-200 dark:border-[#2D4536] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط العدادات</span>
          </button>
        </div>
      </div>

      {/* Category Progress Bar */}
      <div className="w-full h-2 bg-[#E5E0D8] dark:bg-[#142419] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#1B3022] to-[#3D5A47] dark:from-[#E9B161] dark:to-[#dfa755] rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Dhikr Cards List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const remaining = getRemainingCount(item);
          const isDone = remaining === 0;

          return (
            <div
              key={item.id}
              onClick={() => handleDecrement(item)}
              id={`dhikr-card-${item.id}`}
              className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer select-none relative overflow-hidden flex flex-col justify-between ${
                isDone
                  ? 'bg-[#1B3022]/5 dark:bg-[#1B3022]/40 border-[#3D5A47]/40 opacity-85'
                  : 'bg-white dark:bg-[#1B3022]/30 border-[#2D4536]/15 dark:border-[#2D4536] hover:border-[#E9B161]/60 hover:shadow-lg active:scale-[0.99]'
              }`}
            >
              {/* Top Row: Actions & Status */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2D4536]/10 dark:border-[#2D4536]/60 text-xs text-[#55695C] dark:text-[#A8BCAD]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#2C3E30] dark:text-[#E0E7E1]">
                    التكرار المطلوب: <strong className="text-[#C2822B] dark:text-[#E9B161]">{item.count}</strong>
                  </span>
                  {isDone && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#1B3022] text-[#E9B161] border border-[#3D5A47] font-bold">
                      <Check className="w-3 h-3" />
                      <span>تم بحمد الله</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleResetSingle(item, e)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#2D4536] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white transition-colors"
                    title="إعادة تعيين العداد"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleCopyDhikr(item, e)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#2D4536] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white transition-colors"
                    title="نسخ الذكر"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-[#1B3022] dark:text-[#E9B161]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={(e) => handleShareDhikr(item, e)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#2D4536] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white transition-colors"
                    title="مشاركة"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Arabic Dhikr Text */}
              <div className="py-2">
                <p className="font-quran text-lg sm:text-xl text-[#2C3E30] dark:text-[#E0E7E1] text-right leading-loose">
                  {item.text}
                </p>
              </div>

              {/* Benefit & Source Badges */}
              <div className="pt-3 mt-2 border-t border-[#2D4536]/10 dark:border-[#2D4536]/60 space-y-1.5">
                {item.benefit && (
                  <p className="text-xs text-[#8A5612] dark:text-[#E9B161] flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C2822B] shrink-0 mt-0.5" />
                    <span><strong>الفضل:</strong> {item.benefit}</span>
                  </p>
                )}
                <p className="text-[11px] text-[#55695C] dark:text-[#A8BCAD] flex items-center gap-1">
                  <span><strong>المصدر:</strong> {item.source}</span>
                </p>
              </div>

              {/* Interactive Big Counter Button at Bottom of Card */}
              <div className="pt-4 flex items-center justify-center">
                <div
                  className={`w-full py-3 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                    isDone
                      ? 'bg-[#1B3022]/15 dark:bg-[#2D4536]/40 text-[#1B3022] dark:text-[#E9B161] font-bold'
                      : 'bg-[#1B3022] hover:bg-[#233F2E] text-[#E9B161] font-bold shadow-md shadow-[#1B3022]/20'
                  }`}
                >
                  <span className="text-sm">
                    {isDone ? 'اكتمل الذكر ✓' : 'انقر للعد'}
                  </span>
                  <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-mono text-base font-extrabold text-white">
                    {remaining}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
