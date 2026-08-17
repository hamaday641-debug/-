import React, { useState } from 'react';
import { 
  Headphones, 
  Search, 
  Star, 
  Play, 
  User, 
  CheckCircle2,
  Flame,
  Volume2
} from 'lucide-react';
import { Reciter, ReciterCategory } from '../types';
import { RECITERS_LIST, RECITER_CATEGORIES } from '../data/reciters';
import { SURAHS_LIST } from '../data/surahs';
import { useAudio } from '../context/AudioContext';
import { normalizeArabic } from '../services/quranApi';

interface RecitersDirectoryProps {
  onSelectSurahForReading?: (surahNum: number) => void;
}

export const RecitersDirectory: React.FC<RecitersDirectoryProps> = ({ onSelectSurahForReading }) => {
  const { 
    currentReciter, 
    setReciter, 
    playSurah, 
    isPlaying, 
    activeSurah, 
    favoriteReciters, 
    toggleFavoriteReciter,
    recentReciters,
    setIsFullPlayerOpen
  } = useAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReciterCategory | 'all' | 'favorites'>('all');
  const [activeSurahPickerReciter, setActiveSurahPickerReciter] = useState<Reciter | null>(null);

  const filteredReciters = RECITERS_LIST.filter((reciter) => {
    // Search
    const qNorm = normalizeArabic(searchQuery);
    const nameNorm = normalizeArabic(reciter.name);
    const subNorm = normalizeArabic(reciter.subname);
    const riwayahNorm = normalizeArabic(reciter.riwayah);

    const matchesSearch =
      !searchQuery ||
      nameNorm.includes(qNorm) ||
      subNorm.includes(qNorm) ||
      riwayahNorm.includes(qNorm);

    // Category
    let matchesCat = true;
    if (selectedCategory === 'favorites') {
      matchesCat = favoriteReciters.includes(reciter.id);
    } else if (selectedCategory !== 'all') {
      matchesCat = reciter.category === selectedCategory;
    }

    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#1B3022] border border-[#2D4536] p-6 sm:p-8 text-[#E0E7E1] shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#142419] border border-[#2D4536] text-[#E9B161] text-xs font-semibold mb-3">
            <Headphones className="w-3.5 h-3.5" />
            <span>مكتبة التلاوات المعتمدة الموثوقة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#E9B161] font-scheherazade leading-tight mb-2">
            أصوات الحرمين الشريفين وأساطين دولة التلاوة
          </h2>
          <p className="text-xs sm:text-sm text-[#A8BCAD] leading-relaxed">
            استمع لكبار القراء مع ضبط فوري مطابق تماماً لاسم كل شيخ وتلاوته الحقيقية المعتمدة بجودة صوتية عالية.
          </p>
        </div>

        <div className="absolute left-6 -bottom-10 opacity-10 text-9xl font-scheherazade text-[#E9B161] select-none pointer-events-none hidden sm:block">
          صوت
        </div>
      </div>

      {/* Recently Used Reciters Bar */}
      {recentReciters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1B3022] dark:text-[#E9B161]">
            <Flame className="w-3.5 h-3.5 text-[#E9B161]" />
            <span>القراء الذين استمعت إليهم مؤخراً:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recentReciters.map((id) => {
              const r = RECITERS_LIST.find((item) => item.id === id);
              if (!r) return null;
              const isCurrent = currentReciter.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setReciter(r)}
                  className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap flex items-center gap-2 transition-all border shrink-0 ${
                    isCurrent
                      ? 'bg-[#1B3022] text-[#E9B161] border-[#E9B161] font-bold shadow-sm'
                      : 'bg-white dark:bg-[#142419] border-[#2D4536]/20 dark:border-[#2D4536] text-slate-700 dark:text-[#E0E7E1] hover:border-[#E9B161]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[#E9B161]" />
                  <span>{r.name}</span>
                  {isCurrent && <Volume2 className="w-3.5 h-3.5 text-[#E9B161] animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Category Filter Tabs */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BCAD]" />
          <input
            type="text"
            placeholder="ابحث باسم القارئ (مثلاً: السديس، المنشاوي، الحصري، العفاسي، المعيقلي)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white dark:bg-[#142419] border border-[#2D4536]/30 text-slate-900 dark:text-[#E0E7E1] placeholder:text-[#A8BCAD] focus:outline-none focus:ring-2 focus:ring-[#E9B161]/50 shadow-sm text-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl shrink-0 font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#1B3022] text-[#E9B161] border border-[#E9B161] shadow-md'
                : 'bg-white dark:bg-[#142419] text-slate-600 dark:text-[#A8BCAD] border border-[#2D4536]/30'
            }`}
          >
            جميع القراء ({RECITERS_LIST.length})
          </button>

          <button
            onClick={() => setSelectedCategory('favorites')}
            className={`px-4 py-2 rounded-xl shrink-0 font-semibold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'favorites'
                ? 'bg-[#E9B161] text-[#1B3022] font-bold shadow-md'
                : 'bg-white dark:bg-[#142419] text-slate-600 dark:text-[#A8BCAD] border border-[#2D4536]/30'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>المفضلة ({favoriteReciters.length})</span>
          </button>

          {RECITER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl shrink-0 font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#1B3022] text-[#E9B161] border border-[#E9B161] shadow-md'
                  : 'bg-white dark:bg-[#142419] text-slate-600 dark:text-[#A8BCAD] border border-[#2D4536]/30'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Reciters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReciters.map((reciter) => {
          const isSelected = currentReciter.id === reciter.id;
          const isFav = favoriteReciters.includes(reciter.id);

          return (
            <div
              key={reciter.id}
              id={`reciter-card-${reciter.id}`}
              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#1B3022]/10 dark:bg-[#1B3022]/40 border-[#E9B161] shadow-md shadow-[#E9B161]/5'
                  : 'bg-white dark:bg-[#142419] border-[#2D4536]/20 dark:border-[#2D4536] hover:border-[#E9B161]/50 hover:shadow-md'
              }`}
            >
              <div>
                {/* Header: Title + Favorite Star */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg font-scheherazade shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#E9B161] text-[#1B3022] shadow-md'
                          : 'bg-[#1B3022]/10 dark:bg-[#1B3022] text-[#1B3022] dark:text-[#E9B161]'
                      }`}
                    >
                      {reciter.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-[#E0E7E1]">
                          {reciter.name}
                        </h3>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-[#1B3022] text-[#E9B161] border border-[#E9B161]/50 text-[10px] font-bold">
                            القارئ الحالي
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A8BCAD] leading-snug line-clamp-1">
                        {reciter.subname}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFavoriteReciter(reciter.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isFav ? 'text-[#E9B161] hover:text-[#d69f50]' : 'text-slate-300 dark:text-[#2D4536] hover:text-[#A8BCAD]'
                    }`}
                    title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Riwayah & Style Badges */}
                <div className="flex items-center gap-1.5 flex-wrap my-3">
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#1B3022]/10 dark:bg-[#142419] border border-[#2D4536]/30 text-[#1B3022] dark:text-[#A8BCAD] font-mono">
                    رواية {reciter.riwayah}
                  </span>
                  {reciter.style && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#E9B161]/10 dark:bg-[#E9B161]/20 border border-[#E9B161]/30 text-[#8B6014] dark:text-[#E9B161]">
                      مصحف {reciter.style}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#2D4536]/20">
                <button
                  onClick={() => {
                    setReciter(reciter);
                    if (!isSelected && activeSurah) {
                      playSurah(activeSurah, reciter);
                    }
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1B3022] text-[#E9B161] hover:bg-[#142419]'
                      : 'bg-[#1B3022]/10 dark:bg-[#1B3022] hover:bg-[#1B3022] hover:text-[#E9B161] text-[#1B3022] dark:text-[#E0E7E1]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'القارئ المعتمد' : 'تعيين كقارئ أساسي'}</span>
                </button>

                {/* Direct Listen to any Surah with this reciter */}
                <button
                  onClick={() => setActiveSurahPickerReciter(reciter)}
                  className="p-2 rounded-xl bg-[#E9B161] hover:bg-[#dfa654] text-[#1B3022] font-bold transition-colors shadow-sm"
                  title="استماع لسورة محددة بهذا القارئ"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Surah Picker Modal for a Reciter */}
      {activeSurahPickerReciter && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#142419] border border-[#2D4536] rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col text-[#E0E7E1] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2D4536]">
              <div>
                <h3 className="font-bold text-[#E9B161] text-base">
                  اختر السورة للاستماع بصوت {activeSurahPickerReciter.name}
                </h3>
                <p className="text-xs text-[#A8BCAD]">114 سورة كاملة متوفرة</p>
              </div>
              <button
                onClick={() => setActiveSurahPickerReciter(null)}
                className="text-[#A8BCAD] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {SURAHS_LIST.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => {
                    setReciter(activeSurahPickerReciter);
                    playSurah(surah.number, activeSurahPickerReciter);
                    setActiveSurahPickerReciter(null);
                    setIsFullPlayerOpen(true);
                  }}
                  className="w-full p-3 rounded-xl bg-[#1B3022]/40 hover:bg-[#1B3022] border border-[#2D4536] hover:border-[#E9B161] transition-all flex items-center justify-between text-right"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#142419] border border-[#2D4536] text-[#E9B161] text-xs font-mono font-bold flex items-center justify-center">
                      {surah.number}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-white">سورة {surah.name}</h4>
                      <p className="text-[11px] text-[#A8BCAD]">{surah.numberOfAyahs} آية</p>
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-[#E9B161] fill-current" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
