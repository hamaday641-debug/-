import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Eye, 
  Volume2, 
  Sparkles, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Info,
  ListFilter
} from 'lucide-react';
import { SurahMeta, SurahDetail, Ayah, Bookmark as BookmarkType } from '../types';
import { SURAHS_LIST, JUZ_NAMES } from '../data/surahs';
import { 
  fetchSurahDetail, 
  separateBasmalahFromAyah, 
  BASMALAH_TEXT, 
  toArabicNumerals, 
  normalizeArabic 
} from '../services/quranApi';
import { useAudio } from '../context/AudioContext';
import { TafsirModal } from './TafsirModal';

interface QuranReaderProps {
  initialSurah?: number;
  initialAyah?: number;
  fontSize: number;
  onBookmarkChange?: () => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  initialSurah,
  initialAyah,
  fontSize,
  onBookmarkChange
}) => {
  const { 
    playAyah, 
    playSurah, 
    isPlaying, 
    activeSurah, 
    activeAyahNumber, 
    currentReciter,
    setRangeLoop
  } = useAudio();

  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(initialSurah || null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loadingSurah, setLoadingSurah] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filters in Surah Index
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);

  // Reading Mode: 'cards' (بطاقات الآيات) vs 'flow' (مصحف متصل)
  const [readingMode, setReadingMode] = useState<'cards' | 'flow'>('cards');

  // Tafsir Modal State
  const [tafsirTarget, setTafsirTarget] = useState<{ surah: number; ayah: number; text: string } | null>(null);

  // Jump to Ayah Picker
  const [jumpAyah, setJumpAyah] = useState<number>(1);

  // Copy notification state
  const [copiedAyahId, setCopiedAyahId] = useState<number | null>(null);

  // Bookmarks in LocalStorage
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(() => {
    try {
      const saved = localStorage.getItem('nour_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const ayahRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // If initialSurah changes from props (e.g. search or navbar resume)
  useEffect(() => {
    if (initialSurah) {
      setSelectedSurahNumber(initialSurah);
    }
  }, [initialSurah]);

  // Load Surah data whenever selectedSurahNumber changes
  useEffect(() => {
    if (!selectedSurahNumber) return;

    let isMounted = true;
    setLoadingSurah(true);
    setErrorMsg(null);

    fetchSurahDetail(selectedSurahNumber)
      .then((detail) => {
        if (isMounted) {
          setSurahDetail(detail);
          setLoadingSurah(false);

          // Save last read
          const last = {
            surahNumber: detail.number,
            ayahNumber: initialAyah || 1,
            surahName: detail.name,
            timestamp: Date.now()
          };
          localStorage.setItem('nour_last_read', JSON.stringify(last));
          if (onBookmarkChange) onBookmarkChange();
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMsg(err.message || 'تعذر تحميل بيانات السورة');
          setLoadingSurah(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber]);

  // Scroll to active Ayah when playing
  useEffect(() => {
    if (activeSurah === selectedSurahNumber && activeAyahNumber) {
      const el = ayahRefs.current[activeAyahNumber];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSurah, activeAyahNumber, selectedSurahNumber]);

  // Handle jump to ayah on load if provided
  useEffect(() => {
    if (initialAyah && surahDetail) {
      setTimeout(() => {
        const el = ayahRefs.current[initialAyah];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [initialAyah, surahDetail]);

  const handleToggleBookmark = (ayah: Ayah) => {
    if (!surahDetail) return;
    const existing = bookmarks.find(
      (b) => b.surahNumber === surahDetail.number && b.ayahNumber === ayah.numberInSurah
    );

    let updated: BookmarkType[];
    if (existing) {
      updated = bookmarks.filter((b) => b.id !== existing.id);
    } else {
      const newBm: BookmarkType = {
        id: `${surahDetail.number}_${ayah.numberInSurah}_${Date.now()}`,
        surahNumber: surahDetail.number,
        ayahNumber: ayah.numberInSurah,
        surahName: surahDetail.name,
        ayahText: ayah.text,
        timestamp: Date.now()
      };
      updated = [newBm, ...bookmarks];
    }

    setBookmarks(updated);
    try {
      localStorage.setItem('nour_bookmarks', JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (onBookmarkChange) onBookmarkChange();
  };

  const isBookmarked = (ayahNumber: number) => {
    if (!surahDetail) return false;
    return bookmarks.some(
      (b) => b.surahNumber === surahDetail.number && b.ayahNumber === ayahNumber
    );
  };

  const handleCopyAyah = (ayah: Ayah) => {
    if (!surahDetail) return;
    const text = `﴿${ayah.text}﴾ [سورة ${surahDetail.name}: الآية ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAyahId(ayah.numberInSurah);
      setTimeout(() => setCopiedAyahId(null), 2000);
    });
  };

  const handleShareAyah = (ayah: Ayah) => {
    if (!surahDetail) return;
    const text = `﴿${ayah.text}﴾ [سورة ${surahDetail.name}: الآية ${ayah.numberInSurah}]`;
    if (navigator.share) {
      navigator.share({
        title: `آية من سورة ${surahDetail.name}`,
        text
      }).catch(() => {});
    } else {
      handleCopyAyah(ayah);
    }
  };

  const filteredSurahs = SURAHS_LIST.filter((s) => {
    // Search matching
    const queryNorm = normalizeArabic(searchQuery);
    const nameNorm = normalizeArabic(s.name);
    const engName = s.englishName.toLowerCase();
    const queryLower = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      nameNorm.includes(queryNorm) ||
      engName.includes(queryLower) ||
      String(s.number) === searchQuery.trim();

    // Filter type matching
    const matchesType = filterType === 'all' || s.revelationType === filterType;

    // Juz matching
    const matchesJuz = selectedJuz === null || s.juzStart === selectedJuz;

    return matchesSearch && matchesType && matchesJuz;
  });

  const nextSurah = selectedSurahNumber && selectedSurahNumber < 114 ? selectedSurahNumber + 1 : null;
  const prevSurah = selectedSurahNumber && selectedSurahNumber > 1 ? selectedSurahNumber - 1 : null;

  // -------------------------------------------------------------
  // VIEW 1: SURAH DIRECTORY / LIST VIEW
  // -------------------------------------------------------------
  if (!selectedSurahNumber) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Spiritual Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1B3022] via-[#2D4536] to-[#1B3022] border border-[#2D4536] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D4536] border border-[#3D5A47] text-[#E9B161] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>المصحف الشريف المرتل والمكتوب</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-100 font-scheherazade leading-tight mb-2">
              ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
            </h2>
            <p className="text-xs sm:text-sm text-[#A8BCAD] leading-relaxed">
              تصفح سور القرآن الكريم كاملة بالنص العثماني الموثوق، واستمع لتلاوات أئمة الحرمين الشريفين وكبار قراء العالم الإسلامي.
            </p>
          </div>

          <div className="absolute left-4 -bottom-10 opacity-10 text-9xl font-scheherazade text-[#E9B161] select-none pointer-events-none hidden sm:block">
            قرآن
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8C80]" />
              <input
                type="text"
                placeholder="ابحث باسم السورة أو رقمها (مثلاً: الكهف، 18)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white dark:bg-[#1B3022] border border-[#E0E7E1] dark:border-[#2D4536] text-[#2D3436] dark:text-[#E0E7E1] placeholder:text-[#7A8C80] focus:outline-none focus:ring-2 focus:ring-[#E9B161] shadow-sm text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7A8C80] hover:text-[#2D3436] dark:hover:text-white"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Filter Tabs (All / Meccan / Medinan) */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F3F5F4] dark:bg-[#1B3022] border border-[#E0E7E1] dark:border-[#2D4536] w-full sm:w-auto justify-center">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterType === 'all'
                    ? 'bg-[#1B3022] dark:bg-[#E9B161] text-white dark:text-[#1B3022] shadow-sm'
                    : 'text-[#7A8C80] dark:text-[#A8BCAD] hover:text-[#2D3436] dark:hover:text-white'
                }`}
              >
                جميع السور (114)
              </button>
              <button
                onClick={() => setFilterType('Meccan')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterType === 'Meccan'
                    ? 'bg-[#1B3022] dark:bg-[#E9B161] text-white dark:text-[#1B3022] shadow-sm'
                    : 'text-[#7A8C80] dark:text-[#A8BCAD] hover:text-[#2D3436] dark:hover:text-white'
                }`}
              >
                مكية (86)
              </button>
              <button
                onClick={() => setFilterType('Medinan')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterType === 'Medinan'
                    ? 'bg-[#1B3022] dark:bg-[#E9B161] text-white dark:text-[#1B3022] shadow-sm'
                    : 'text-[#7A8C80] dark:text-[#A8BCAD] hover:text-[#2D3436] dark:hover:text-white'
                }`}
              >
                مدنية (28)
              </button>
            </div>
          </div>

          {/* Quick Juz Scroller */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="text-[#7A8C80] text-xs shrink-0 flex items-center gap-1 pl-1">
              <ListFilter className="w-3.5 h-3.5 text-[#E9B161]" />
              <span>الأجزاء:</span>
            </span>
            <button
              onClick={() => setSelectedJuz(null)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium ${
                selectedJuz === null
                  ? 'bg-[#E9B161] text-[#1B3022] font-bold shadow-sm'
                  : 'bg-[#F3F5F4] dark:bg-[#1B3022] text-[#7A8C80] dark:text-[#A8BCAD] hover:bg-[#E0E7E1] dark:hover:bg-[#2D4536]'
              }`}
            >
              الكل
            </button>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => (
              <button
                key={juzNum}
                onClick={() => setSelectedJuz(selectedJuz === juzNum ? null : juzNum)}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium ${
                  selectedJuz === juzNum
                    ? 'bg-[#E9B161] text-[#1B3022] font-bold shadow-sm'
                    : 'bg-[#F3F5F4] dark:bg-[#1B3022] text-[#7A8C80] dark:text-[#A8BCAD] hover:bg-[#E0E7E1] dark:hover:bg-[#2D4536]'
                }`}
              >
                جزء {juzNum}
              </button>
            ))}
          </div>
        </div>

        {/* Surahs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredSurahs.map((surah) => {
            const isCurrentlyPlayingSurah = activeSurah === surah.number && isPlaying;
            return (
              <div
                key={surah.number}
                onClick={() => setSelectedSurahNumber(surah.number)}
                id={`surah-card-${surah.number}`}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between ${
                  isCurrentlyPlayingSurah
                    ? 'bg-[#E9B161]/15 dark:bg-[#E9B161]/20 border-[#E9B161] shadow-md shadow-[#E9B161]/10'
                    : 'bg-white dark:bg-[#1B3022] border-[#E0E7E1] dark:border-[#2D4536] hover:border-[#1B3022] dark:hover:border-[#E9B161] hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {/* Number & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#F3F5F4] dark:bg-[#2D4536] text-[#1B3022] dark:text-[#E0E7E1] font-bold flex items-center justify-center text-sm font-mono border border-[#E0E7E1] dark:border-[#3D5A47] shrink-0 group-hover:bg-[#1B3022] group-hover:text-[#E9B161] transition-colors">
                    {surah.number}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[#2D3436] dark:text-[#E0E7E1] group-hover:text-[#1B3022] dark:group-hover:text-[#E9B161] transition-colors">
                        سورة {surah.name}
                      </h3>
                      {isCurrentlyPlayingSurah && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#E9B161] text-[#1B3022] font-bold animate-pulse">
                          <Volume2 className="w-3 h-3" />
                          <span>تُتلى الآن</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#7A8C80] dark:text-[#A8BCAD] truncate">
                      {surah.englishName} • {surah.englishNameTranslation}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#7A8C80] dark:text-[#A8BCAD]">
                      <span className="px-1.5 py-0.2 rounded bg-[#F3F5F4] dark:bg-[#2D4536]">
                        {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </span>
                      <span>{surah.numberOfAyahs} آية</span>
                      <span>• جزء {surah.juzStart}</span>
                    </div>
                  </div>
                </div>

                {/* Right Calligraphy & Quick Play */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSurah(surah.number);
                    }}
                    className="p-2 rounded-xl bg-[#F3F5F4] dark:bg-[#2D4536] hover:bg-[#1B3022] dark:hover:bg-[#E9B161] hover:text-white dark:hover:text-[#1B3022] text-[#1B3022] dark:text-[#E0E7E1] transition-colors shadow-sm"
                    title={`تشغيل سورة ${surah.name}`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSurahs.length === 0 && (
          <div className="p-12 text-center text-[#7A8C80] space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-[#7A8C80] stroke-1" />
            <p className="text-sm font-semibold">لم يتم العثور على أي سورة مطابقة للبحث</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setSelectedJuz(null);
              }}
              className="text-xs text-[#E9B161] underline font-bold"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: SURAH READING VIEW
  // -------------------------------------------------------------
  const surahMeta = SURAHS_LIST.find((s) => s.number === selectedSurahNumber);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6 pb-28">
      {/* Top Navigation & Surah Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1B3022] via-[#233F2E] to-[#15271B] border border-[#2D4536] shadow-xl p-5 sm:p-7 text-white relative overflow-hidden">
        {/* Navigation Bar inside header */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <button
            onClick={() => setSelectedSurahNumber(null)}
            id="back-to-surahs-list-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D4536]/80 hover:bg-[#2D4536] border border-[#3D5A47] text-xs font-semibold text-[#E0E7E1] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>فهرس السور</span>
          </button>

          {/* Quick Surah switcher */}
          <div className="flex items-center gap-1">
            <button
              disabled={!prevSurah}
              onClick={() => setSelectedSurahNumber(prevSurah)}
              className="p-1.5 rounded-lg bg-[#2D4536]/80 hover:bg-[#2D4536] text-[#E0E7E1] disabled:opacity-40 transition-colors"
              title="السورة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <select
              value={selectedSurahNumber}
              onChange={(e) => setSelectedSurahNumber(parseInt(e.target.value))}
              className="px-2 py-1 rounded-lg bg-[#1B3022] border border-[#3D5A47] text-[#E9B161] text-xs font-bold font-scheherazade focus:outline-none"
            >
              {SURAHS_LIST.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. سورة {s.name}
                </option>
              ))}
            </select>

            <button
              disabled={!nextSurah}
              onClick={() => setSelectedSurahNumber(nextSurah)}
              className="p-1.5 rounded-lg bg-[#2D4536]/80 hover:bg-[#2D4536] text-[#E0E7E1] disabled:opacity-40 transition-colors"
              title="السورة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Reading Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#142419] border border-[#2D4536] text-xs">
            <button
              onClick={() => setReadingMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                readingMode === 'cards' ? 'bg-[#E9B161] text-[#1B3022] font-bold' : 'text-[#A8BCAD]'
              }`}
              title="وضع البطاقات"
            >
              الآيات
            </button>
            <button
              onClick={() => setReadingMode('flow')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                readingMode === 'flow' ? 'bg-[#E9B161] text-[#1B3022] font-bold' : 'text-[#A8BCAD]'
              }`}
              title="المصحف المتصل"
            >
              المصحف
            </button>
          </div>
        </div>

        {/* Surah Title & Meta Centerpiece */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-[#142419] border border-[#2D4536] text-[11px] text-[#E9B161] font-mono">
            سورة رقم {selectedSurahNumber} • جزء {surahMeta?.juzStart} • صفحة {surahMeta?.pageStart}
          </div>
          <h2 className="font-scheherazade text-3xl sm:text-5xl font-bold text-amber-100 tracking-wide">
            سُورَةُ {surahDetail?.name || surahMeta?.name}
          </h2>
          <div className="flex items-center justify-center gap-3 text-xs text-[#A8BCAD] pt-1">
            <span>{surahMeta?.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
            <span>•</span>
            <span>{surahMeta?.numberOfAyahs} آية</span>
            <span>•</span>
            <span>القارئ: {currentReciter.name}</span>
          </div>

          {/* Quick Play Surah button */}
          <div className="pt-3">
            <button
              onClick={() => playSurah(selectedSurahNumber)}
              id="surah-play-all-btn"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] font-bold text-xs sm:text-sm shadow-lg shadow-black/30 transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>استماع لسورة {surahMeta?.name} كاملة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Jump to Ayah selector */}
      {surahDetail && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1B3022] border border-[#E0E7E1] dark:border-[#2D4536] shadow-sm text-xs text-[#2D3436] dark:text-[#E0E7E1]">
          <div className="flex items-center gap-2">
            <span className="text-[#7A8C80] dark:text-[#A8BCAD]">الانتقال السريع لآية:</span>
            <select
              value={jumpAyah}
              onChange={(e) => {
                const target = parseInt(e.target.value);
                setJumpAyah(target);
                const el = ayahRefs.current[target];
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-2 py-1 rounded-lg bg-[#F3F5F4] dark:bg-[#2D4536] border border-[#E0E7E1] dark:border-[#3D5A47] text-xs font-bold text-[#1B3022] dark:text-[#E9B161]"
            >
              {Array.from({ length: surahDetail.numberOfAyahs }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  الآية {n}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-[#7A8C80] dark:text-[#A8BCAD]">
            حجم الخط: <strong className="text-[#1B3022] dark:text-[#E9B161]">{fontSize}px</strong>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loadingSurah && (
        <div className="p-16 text-center text-[#7A8C80] space-y-3">
          <div className="w-8 h-8 border-3 border-[#E9B161] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">جاري تحميل النص القرآني الموثوق...</p>
        </div>
      )}

      {/* Error state */}
      {errorMsg && (
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-800/40 text-red-300 text-center space-y-2">
          <Info className="w-6 h-6 mx-auto text-red-400" />
          <p className="text-xs font-semibold">{errorMsg}</p>
          <button
            onClick={() => setSelectedSurahNumber(selectedSurahNumber)}
            className="px-3 py-1.5 rounded-lg bg-red-800 text-white text-xs font-bold hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Quran Content */}
      {surahDetail && !loadingSurah && (
        <div className="space-y-6">
          {/* Visual Sacred Basmalah Banner (Separated properly, except Surah 9 At-Tawbah & Surah 1) */}
          {selectedSurahNumber !== 9 && selectedSurahNumber !== 1 && (
            <div className="py-6 sm:py-8 text-center border-y border-[#E0E7E1] dark:border-[#2D4536] bg-[#F3F5F4]/70 dark:bg-[#1B3022]/50 rounded-3xl">
              <div className="inline-block relative">
                <span className="font-scheherazade text-2xl sm:text-4xl text-[#1B3022] dark:text-amber-100 font-bold tracking-wide">
                  {BASMALAH_TEXT}
                </span>
                <div className="w-24 h-0.5 bg-[#E9B161] mx-auto mt-2 opacity-70"></div>
              </div>
            </div>
          )}

          {/* MODE 1: VERSE-BY-VERSE CARDS */}
          {readingMode === 'cards' && (
            <div className="space-y-4">
              {surahDetail.ayahs.map((ayah) => {
                const isCurrentlyPlaying =
                  activeSurah === selectedSurahNumber && activeAyahNumber === ayah.numberInSurah && isPlaying;
                const bookmarked = isBookmarked(ayah.numberInSurah);
                const { cleanText } = separateBasmalahFromAyah(ayah.text, selectedSurahNumber, ayah.numberInSurah);

                return (
                  <div
                    key={ayah.numberInSurah}
                    ref={(el) => (ayahRefs.current[ayah.numberInSurah] = el)}
                    id={`ayah-card-${selectedSurahNumber}-${ayah.numberInSurah}`}
                    className={`p-4 sm:p-6 rounded-2xl border transition-all relative ${
                      isCurrentlyPlaying
                        ? 'bg-[#E9B161]/15 dark:bg-[#E9B161]/20 border-[#E9B161] shadow-xl ring-1 ring-[#E9B161]/50'
                        : 'bg-white dark:bg-[#1B3022] border-[#E0E7E1] dark:border-[#2D4536] hover:border-[#7A8C80]'
                    }`}
                  >
                    {/* Ayah Header Bar (Number + Actions) */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E0E7E1] dark:border-[#2D4536] text-xs text-[#7A8C80] dark:text-[#A8BCAD]">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#F3F5F4] dark:bg-[#2D4536] text-[#1B3022] dark:text-[#E9B161] font-bold flex items-center justify-center font-mono text-xs border border-[#E0E7E1] dark:border-[#3D5A47]">
                          {ayah.numberInSurah}
                        </span>
                        <span className="text-[11px] text-[#7A8C80] dark:text-[#A8BCAD]">
                          جزء {ayah.juz} • صفحة {ayah.page}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        {/* Play this Ayah */}
                        <button
                          onClick={() => playAyah(selectedSurahNumber, ayah.numberInSurah)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isCurrentlyPlaying
                              ? 'bg-[#E9B161] text-[#1B3022] font-bold'
                              : 'hover:bg-[#F3F5F4] dark:hover:bg-[#2D4536] text-[#1B3022] dark:text-[#E0E7E1]'
                          }`}
                          title={isCurrentlyPlaying ? 'قيد التلاوة' : 'تلاوة هذه الآية'}
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>

                        {/* Tafsir */}
                        <button
                          onClick={() =>
                            setTafsirTarget({
                              surah: selectedSurahNumber,
                              ayah: ayah.numberInSurah,
                              text: cleanText
                            })
                          }
                          className="p-1.5 rounded-lg hover:bg-[#F3F5F4] dark:hover:bg-[#2D4536] text-[#7A8C80] dark:text-[#A8BCAD] hover:text-[#1B3022] dark:hover:text-white transition-colors"
                          title="عرض التفسير المعتمد"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>

                        {/* Bookmark */}
                        <button
                          onClick={() => handleToggleBookmark(ayah)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            bookmarked
                              ? 'text-[#E9B161]'
                              : 'text-[#7A8C80] hover:text-[#2D3436] dark:hover:text-white'
                          }`}
                          title={bookmarked ? 'إزالة من العلامات المرجعية' : 'إضافة للعلامات المرجعية'}
                        >
                          {bookmarked ? (
                            <BookmarkCheck className="w-4 h-4 fill-current" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        {/* Copy */}
                        <button
                          onClick={() => handleCopyAyah(ayah)}
                          className="p-1.5 rounded-lg hover:bg-[#F3F5F4] dark:hover:bg-[#2D4536] text-[#7A8C80] hover:text-[#2D3436] dark:hover:text-white transition-colors"
                          title="نسخ الآية الكريمة"
                        >
                          {copiedAyahId === ayah.numberInSurah ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Share */}
                        <button
                          onClick={() => handleShareAyah(ayah)}
                          className="p-1.5 rounded-lg hover:bg-[#F3F5F4] dark:hover:bg-[#2D4536] text-[#7A8C80] hover:text-[#2D3436] dark:hover:text-white transition-colors"
                          title="مشاركة الآية"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {/* Loop range from here */}
                        <button
                          onClick={() => setRangeLoop(ayah.numberInSurah, Math.min(ayah.numberInSurah + 4, surahDetail.numberOfAyahs), 3)}
                          className="p-1.5 rounded-lg hover:bg-[#F3F5F4] dark:hover:bg-[#2D4536] text-[#7A8C80] hover:text-[#E9B161] transition-colors hidden sm:block"
                          title="تكرار نطاق يبدأ من هنا (للحفظ)"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Ayah Text Display */}
                    <div className="text-right">
                      <p
                        className="font-quran text-[#2D3436] dark:text-[#E0E7E1] transition-all text-justify leading-loose"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {cleanText}
                        <span className="ayah-number-symbol text-[#E9B161] font-bold">
                          ۝{toArabicNumerals(ayah.numberInSurah)}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: CONTINUOUS MUSHAF FLOW */}
          {readingMode === 'flow' && (
            <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#1B3022] border border-[#E0E7E1] dark:border-[#2D4536] shadow-xl space-y-4">
              <div className="text-justify font-quran leading-loose" style={{ fontSize: `${fontSize}px` }}>
                {surahDetail.ayahs.map((ayah) => {
                  const isCurrentlyPlaying =
                    activeSurah === selectedSurahNumber && activeAyahNumber === ayah.numberInSurah && isPlaying;
                  const { cleanText } = separateBasmalahFromAyah(ayah.text, selectedSurahNumber, ayah.numberInSurah);

                  return (
                    <span
                      key={ayah.numberInSurah}
                      ref={(el) => (ayahRefs.current[ayah.numberInSurah] = el)}
                      onClick={() => playAyah(selectedSurahNumber, ayah.numberInSurah)}
                      id={`flow-ayah-${ayah.numberInSurah}`}
                      className={`cursor-pointer transition-all duration-200 px-1 py-0.5 rounded-lg inline ${
                        isCurrentlyPlaying
                          ? 'bg-[#E9B161]/30 text-[#1B3022] dark:text-[#E9B161] font-bold underline decoration-[#E9B161] decoration-2 underline-offset-8'
                          : 'hover:bg-[#E9B161]/10 text-[#2D3436] dark:text-[#E0E7E1]'
                      }`}
                      title={`آية ${ayah.numberInSurah} - اضغط للتلاوة`}
                    >
                      {cleanText}
                      <span className="ayah-number-symbol text-[#E9B161] font-bold mx-1">
                        ۝{toArabicNumerals(ayah.numberInSurah)}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Surah Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E0E7E1] dark:border-[#2D4536]">
            {prevSurah ? (
              <button
                onClick={() => setSelectedSurahNumber(prevSurah)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1B3022] border border-[#E0E7E1] dark:border-[#2D4536] text-xs font-semibold text-[#2D3436] dark:text-[#E0E7E1] hover:bg-[#F3F5F4] dark:hover:bg-[#2D4536]"
              >
                <ChevronRight className="w-4 h-4 text-[#E9B161]" />
                <span>السورة السابقة ({SURAHS_LIST.find((s) => s.number === prevSurah)?.name})</span>
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-[#1B3022] dark:text-[#E9B161] hover:underline font-semibold"
            >
              العودة لأعلى السورة ↑
            </button>

            {nextSurah ? (
              <button
                onClick={() => setSelectedSurahNumber(nextSurah)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1B3022] border border-[#E0E7E1] dark:border-[#2D4536] text-xs font-semibold text-[#2D3436] dark:text-[#E0E7E1] hover:bg-[#F3F5F4] dark:hover:bg-[#2D4536]"
              >
                <span>السورة التالية ({SURAHS_LIST.find((s) => s.number === nextSurah)?.name})</span>
                <ChevronLeft className="w-4 h-4 text-[#E9B161]" />
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}

      {/* Tafsir Modal */}
      {tafsirTarget && (
        <TafsirModal
          surahNumber={tafsirTarget.surah}
          ayahNumber={tafsirTarget.ayah}
          ayahText={tafsirTarget.text}
          onClose={() => setTafsirTarget(null)}
        />
      )}
    </div>
  );
};
