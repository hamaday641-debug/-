import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  Sparkles, 
  SlidersHorizontal,
  Volume2,
  BookOpen
} from 'lucide-react';
import { SURAHS_LIST } from '../data/surahs';
import { normalizeArabic } from '../services/quranApi';
import { useAudio } from '../context/AudioContext';

interface QuranReaderProps {
  initialSurah?: number;
  initialAyah?: number;
  fontSize: number;
  onBookmarkChange?: () => void;
  onSurahChange?: (surahNumber: number | null) => void;
  onOpenReadingPage?: (pageNumber: number) => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  onOpenReadingPage
}) => {
  const { 
    playSurah, 
    isPlaying, 
    activeSurah, 
    togglePlayPause
  } = useAudio();

  // Search & Filters in Surah Index
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);

  // Filtered Surahs List for Index
  const filteredSurahs = useMemo(() => {
    return SURAHS_LIST.filter((surah) => {
      const q = searchQuery.trim();
      const matchesSearch =
        !q ||
        normalizeArabic(surah.name).includes(normalizeArabic(q)) ||
        surah.englishName.toLowerCase().includes(q.toLowerCase()) ||
        surah.englishNameTranslation.toLowerCase().includes(q.toLowerCase()) ||
        surah.number.toString() === q;

      const matchesType =
        filterType === 'all' || surah.revelationType === filterType;

      const matchesJuz =
        selectedJuz === null || surah.juzStart === selectedJuz;

      return matchesSearch && matchesType && matchesJuz;
    });
  }, [searchQuery, filterType, selectedJuz]);

  const handleSurahClick = (surahNumber: number, pageStart: number) => {
    if (onOpenReadingPage) {
      onOpenReadingPage(pageStart);
    }
  };

  const meccanCount = useMemo(() => SURAHS_LIST.filter(s => s.revelationType === 'Meccan').length, []);
  const medinanCount = useMemo(() => SURAHS_LIST.filter(s => s.revelationType === 'Medinan').length, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-2 sm:px-4 font-cairo">
      
      {/* Top Banner Matching Screenshot */}
      <div className="rounded-3xl bg-[#142E20] border border-[#274834] p-5 sm:p-7 text-white shadow-xl relative overflow-hidden text-center space-y-2.5">
        {/* Golden Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5B869]/15 border border-[#E5B869]/40 text-[#E5B869] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>المصحف الشريف المرتل والمكتوب</span>
        </div>

        {/* Big Ayat Calligraphy Title */}
        <h1 className="font-scheherazade text-2xl sm:text-4xl font-bold text-amber-100 tracking-wide">
          ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#A0B8A8] max-w-2xl mx-auto leading-relaxed">
          تصفح سور القرآن الكريم كاملة بالنص العثماني الموثق، واستمع لتلاوات أئمة الحرمين الشريفين وكبار قراء العالم الإسلامي.
        </p>
      </div>

      {/* Search Input matching screenshot */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="ابحث باسم السورة أو رقمها (مثلاً: الكهف، 18)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="surah-search-input"
          className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-2xl bg-white dark:bg-[#1A2E20] border border-slate-200 dark:border-[#2D4536] text-[#142E20] dark:text-white placeholder-slate-400 dark:placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:border-[#E5B869] shadow-sm transition-all text-right"
        />
        <Search className="w-4 h-4 text-slate-400 dark:text-stone-400 absolute left-3.5 top-3.5 sm:top-4" />
      </div>

      {/* Filter Tabs matching screenshot */}
      <div className="flex items-center justify-between gap-2 bg-slate-100/80 dark:bg-[#142318] p-1.5 rounded-2xl border border-slate-200 dark:border-[#263D2D]">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            filterType === 'all'
              ? 'bg-[#142E20] dark:bg-[#101D14] text-amber-100 border border-[#E5B869]/70 shadow-sm'
              : 'text-slate-600 dark:text-[#A0B8A8] hover:text-[#E5B869]'
          }`}
        >
          جميع السور ({SURAHS_LIST.length})
        </button>

        <button
          onClick={() => setFilterType('Meccan')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            filterType === 'Meccan'
              ? 'bg-[#142E20] dark:bg-[#101D14] text-amber-100 border border-[#E5B869]/70 shadow-sm'
              : 'text-slate-600 dark:text-[#A0B8A8] hover:text-[#E5B869]'
          }`}
        >
          مكية ({meccanCount})
        </button>

        <button
          onClick={() => setFilterType('Medinan')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            filterType === 'Medinan'
              ? 'bg-[#142E20] dark:bg-[#101D14] text-amber-100 border border-[#E5B869]/70 shadow-sm'
              : 'text-slate-600 dark:text-[#A0B8A8] hover:text-[#E5B869]'
          }`}
        >
          مدنية ({medinanCount})
        </button>
      </div>

      {/* Juz Filter Bar matching screenshot */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <div className="flex items-center gap-1 text-[#8FA797] font-bold shrink-0 pl-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5B869]" />
          <span>الأجزاء:</span>
        </div>

        <button
          onClick={() => setSelectedJuz(null)}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border shrink-0 ${
            selectedJuz === null
              ? 'bg-[#E5B869] text-[#142E20] border-[#E5B869] shadow-sm'
              : 'bg-white dark:bg-[#1A2E20] text-slate-700 dark:text-stone-300 border-slate-200 dark:border-[#2D4536]'
          }`}
        >
          الكل
        </button>

        {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => (
          <button
            key={juzNum}
            onClick={() => setSelectedJuz(juzNum === selectedJuz ? null : juzNum)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border shrink-0 ${
              selectedJuz === juzNum
                ? 'bg-[#E5B869] text-[#142E20] border-[#E5B869] shadow-sm'
                : 'bg-white dark:bg-[#1A2E20] text-slate-700 dark:text-stone-300 border-slate-200 dark:border-[#2D4536] hover:border-[#E5B869]'
            }`}
          >
            جزء {juzNum}
          </button>
        ))}
      </div>

      {/* Surahs List matching screenshot */}
      <div className="space-y-2.5 pt-1">
        {filteredSurahs.map((surah) => {
          const isThisPlaying = activeSurah === surah.number && isPlaying;

          return (
            <div
              key={surah.number}
              onClick={() => handleSurahClick(surah.number, surah.pageStart)}
              id={`surah-card-${surah.number}`}
              className="w-full p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#17281D] border border-slate-200/90 dark:border-[#284232] hover:border-[#E5B869] dark:hover:border-[#E5B869] shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group select-none"
            >
              {/* Play Audio Button (Left in RTL) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isThisPlaying) {
                    togglePlayPause();
                  } else {
                    playSurah(surah.number);
                  }
                }}
                id={`play-surah-btn-${surah.number}`}
                aria-label={`تلاوة سورة ${surah.name}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  isThisPlaying
                    ? 'bg-[#E5B869] text-[#142E20] shadow-md shadow-[#E5B869]/30 ring-2 ring-[#E5B869]'
                    : 'bg-slate-100 dark:bg-[#101D14] text-slate-700 dark:text-[#A0B8A8] hover:bg-[#E5B869] hover:text-[#142E20]'
                }`}
                title={isThisPlaying ? 'إيقاف التلاوة' : `استماع لسورة ${surah.name}`}
              >
                {isThisPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Middle: Surah Name & Info */}
              <div className="flex-1 text-right">
                <div className="flex items-center gap-2 justify-start flex-wrap">
                  <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-amber-100 font-scheherazade group-hover:text-[#E5B869] transition-colors">
                    سورة {surah.name}
                  </h2>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-[#8FA797] font-mono mt-0.5">
                  {surah.englishName} • {surah.englishNameTranslation}
                </p>

                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#101D14] border border-slate-200 dark:border-[#263D2D] text-[10px] font-bold text-slate-600 dark:text-[#A0B8A8]">
                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#101D14] border border-slate-200 dark:border-[#263D2D] text-[10px] font-bold text-slate-600 dark:text-[#A0B8A8]">
                    {surah.numberOfAyahs} آية
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#101D14] border border-slate-200 dark:border-[#263D2D] text-[10px] font-bold text-slate-600 dark:text-[#A0B8A8]">
                    جزء {surah.juzStart}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-[#203325] border border-amber-200 dark:border-[#E5B869]/30 text-[10px] font-bold text-amber-800 dark:text-[#E5B869]">
                    صفحة {surah.pageStart}
                  </span>
                </div>
              </div>

              {/* Surah Number Badge (Right in RTL) */}
              <div className="w-11 h-11 rounded-2xl bg-[#F0F5F2] dark:bg-[#101D14] border border-slate-200 dark:border-[#284232] text-slate-800 dark:text-amber-100 font-bold text-sm flex items-center justify-center font-mono group-hover:bg-[#E5B869] group-hover:text-[#142E20] group-hover:border-[#E5B869] transition-all shrink-0 shadow-xs">
                {surah.number}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
