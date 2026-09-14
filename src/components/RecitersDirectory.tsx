import React, { useState } from 'react';
import { 
  Headphones, 
  Search, 
  Star, 
  Play, 
  User, 
  CheckCircle2,
  Flame,
  Volume2,
  BookOpen,
  Sparkles,
  Info
} from 'lucide-react';
import { Reciter, ReciterCategory, RiwayahType } from '../types';
import { RECITERS_LIST, RECITER_CATEGORIES, RIWAYAT_INFO } from '../data/reciters';
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
  const [selectedCategory, setSelectedCategory] = useState<ReciterCategory | 'all' | 'favorites' | 'by_riwayah'>('all');
  const [selectedRiwayah, setSelectedRiwayah] = useState<RiwayahType | 'all'>('all');
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

    // Category & Riwayah
    let matchesCat = true;
    if (selectedCategory === 'favorites') {
      matchesCat = favoriteReciters.includes(reciter.id);
    } else if (selectedCategory === 'by_riwayah') {
      if (selectedRiwayah !== 'all') {
        matchesCat = reciter.riwayah === selectedRiwayah;
      }
    } else if (selectedCategory !== 'all') {
      matchesCat = reciter.category === selectedCategory;
    }

    // Direct Riwayah filter when not in by_riwayah category mode
    if (selectedRiwayah !== 'all' && selectedCategory !== 'by_riwayah') {
      matchesCat = matchesCat && reciter.riwayah === selectedRiwayah;
    }

    return matchesSearch && matchesCat;
  });

  const currentRiwayahDetails = RIWAYAT_INFO.find((r) => r.id === selectedRiwayah);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#1B3022] border border-[#2D4536] p-6 sm:p-8 text-[#E0E7E1] shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#142419] border border-[#2D4536] text-[#E9B161] text-xs font-semibold mb-3">
            <Headphones className="w-3.5 h-3.5" />
            <span>مكتبة القراء والروايات القرآنية المتواترة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#E9B161] font-scheherazade leading-tight mb-2">
            أصوات الحرمين الشريفين، دولة التلاوة، والروايات القرآنية
          </h2>
          <p className="text-xs sm:text-sm text-[#A8BCAD] leading-relaxed">
            استمع لكبار القراء برواية حفص عن عاصم، ورش، قالون، الدوري، السوسي، شعبة، وخلف عن حمزة بدقة عالية.
          </p>
        </div>

        <div className="absolute left-6 -bottom-10 opacity-10 text-9xl font-scheherazade text-[#E9B161] select-none pointer-events-none hidden sm:block">
          صوت
        </div>
      </div>

      {/* Riwayah Filter Ribbon */}
      <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#E9B161]" />
            <span className="text-xs font-bold text-stone-800 dark:text-stone-100">تصفية حسب الرواية القرآنية:</span>
          </div>
          {selectedRiwayah !== 'all' && (
            <button
              onClick={() => setSelectedRiwayah('all')}
              className="text-[11px] text-[#E9B161] hover:underline font-bold"
            >
              إعادة ضبط للكل
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedRiwayah('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedRiwayah === 'all'
                ? 'bg-[#1B3022] text-[#E9B161] dark:bg-[#E9B161] dark:text-[#1B3022] shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            جميع الروايات
          </button>
          {RIWAYAT_INFO.map((rw) => (
            <button
              key={rw.id}
              onClick={() => setSelectedRiwayah(rw.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedRiwayah === rw.id
                  ? 'bg-[#1B3022] text-[#E9B161] dark:bg-[#E9B161] dark:text-[#1B3022] shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <span>{rw.id}</span>
            </button>
          ))}
        </div>

        {/* Selected Riwayah Info Card */}
        {currentRiwayahDetails && (
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-amber-900 dark:text-amber-200">{currentRiwayahDetails.name}</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                انتشارها: {currentRiwayahDetails.geography}
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
              {currentRiwayahDetails.description}
            </p>
          </div>
        )}
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
            placeholder="ابحث باسم القارئ (مثلاً: مصطفى إسماعيل، السديس، المنشاوي، الحصري، العفاسي، ورش، قالون)..."
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
            جميع القراء ({filteredReciters.length})
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
                  <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#1B3022]/10 dark:bg-[#142419] border border-[#2D4536]/30 text-[#1B3022] dark:text-[#A8BCAD] font-bold">
                    رواية {reciter.riwayah}
                  </span>
                  {reciter.style && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#E9B161]/10 dark:bg-[#E9B161]/20 border border-[#E9B161]/30 text-[#8B6014] dark:text-[#E9B161]">
                      مصحف {reciter.style}
                    </span>
                  )}
                  {reciter.origin && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                      {reciter.origin}
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
