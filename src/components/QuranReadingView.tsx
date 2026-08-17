import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  BookmarkCheck, 
  Play, 
  Sparkles, 
  Type, 
  Search, 
  Compass, 
  ListFilter,
  Volume2,
  Share2,
  Copy,
  Check,
  RotateCcw,
  BookCheck,
  Sliders,
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Flame,
  Calendar,
  Palette,
  Eye,
  Settings2
} from 'lucide-react';
import { SURAHS_LIST, JUZ_NAMES } from '../data/surahs';
import { fetchQuranPage, toArabicNumerals, separateBasmalahFromAyah, BASMALAH_TEXT } from '../services/quranApi';
import { QuranPageData, PageAyah, Bookmark as BookmarkType, KhatmahPlan } from '../types';
import { useAudio } from '../context/AudioContext';
import { TafsirModal } from './TafsirModal';

export type MushafThemeType = 'royal_purple' | 'madinah_green' | 'warm_parchment' | 'night_charcoal' | 'pure_white';

interface QuranReadingViewProps {
  initialPage?: number;
  fontSize?: number;
  onBookmarkChange?: () => void;
  onOpenKhatmahTab?: () => void;
}

export const QuranReadingView: React.FC<QuranReadingViewProps> = ({
  initialPage,
  fontSize: appFontSize,
  onBookmarkChange,
  onOpenKhatmahTab
}) => {
  const { playAyah, isPlaying, activeSurah, activeAyahNumber } = useAudio();

  // Saved last read page or default to 1 (Surah Al-Fatihah)
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (initialPage && initialPage >= 1 && initialPage <= 604) return initialPage;
    try {
      const saved = localStorage.getItem('tareeq_mushaf_reading_page') || localStorage.getItem('nour_mushaf_reading_page');
      return saved ? Math.max(1, Math.min(604, parseInt(saved))) : 1;
    } catch {
      return 1;
    }
  });

  const [pageData, setPageData] = useState<QuranPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fullscreen / Immersive Reading mode (hides surrounding distractions)
  const [isImmersiveFull, setIsImmersiveFull] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Reading Theme: default to 'royal_purple' matching the user's exact uploaded image!
  const [mushafTheme, setMushafTheme] = useState<MushafThemeType>(() => {
    try {
      const saved = (localStorage.getItem('tareeq_mushaf_theme') || localStorage.getItem('nour_mushaf_theme')) as MushafThemeType;
      if (saved && ['royal_purple', 'madinah_green', 'warm_parchment', 'night_charcoal', 'pure_white'].includes(saved)) {
        return saved;
      }
      return 'royal_purple';
    } catch {
      return 'royal_purple';
    }
  });

  // Local font size scale for reading mode (default large and crystal clear)
  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tareeq_reading_font_size') || localStorage.getItem('nour_reading_font_size');
      return saved ? parseInt(saved) : 30;
    } catch {
      return 30;
    }
  });

  // Selected Ayah for quick inline action / tafsir
  const [selectedAyah, setSelectedAyah] = useState<PageAyah | null>(null);
  const [tafsirTarget, setTafsirTarget] = useState<{ surah: number; ayah: number; text: string } | null>(null);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  // Quick navigation modal / picker
  const [showNavPicker, setShowNavPicker] = useState<boolean>(false);
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);
  const [targetSurahPick, setTargetSurahPick] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('');

  // Page swipe gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const [pageFlipAnim, setPageFlipAnim] = useState<'next' | 'prev' | null>(null);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(() => {
    try {
      const saved = localStorage.getItem('tareeq_bookmarks') || localStorage.getItem('nour_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Khatmah active plan synchronization
  const [khatmahPlan, setKhatmahPlan] = useState<KhatmahPlan | null>(() => {
    try {
      const saved = localStorage.getItem('tareeq_khatmah_plan') || localStorage.getItem('nour_khatmah_plan');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // If initialPage prop changes from outside
  useEffect(() => {
    if (initialPage && initialPage >= 1 && initialPage <= 604 && initialPage !== currentPage) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  // Load Page Data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setSelectedAyah(null);

    fetchQuranPage(currentPage)
      .then((data) => {
        if (isMounted) {
          setPageData(data);
          setLoading(false);

          // Save current reading page
          try {
            localStorage.setItem('tareeq_mushaf_reading_page', String(currentPage));
            localStorage.setItem('nour_mushaf_reading_page', String(currentPage));
            if (data.ayahs.length > 0) {
              const first = data.ayahs[0];
              const lastReadObj = {
                surahNumber: first.surah.number,
                ayahNumber: first.numberInSurah,
                surahName: first.surah.name.replace(/^سُورَةُ\s*/, ''),
                page: currentPage,
                timestamp: Date.now()
              };
              localStorage.setItem('tareeq_last_read', JSON.stringify(lastReadObj));
              localStorage.setItem('nour_last_read', JSON.stringify(lastReadObj));
              if (onBookmarkChange) onBookmarkChange();
            }

            // Sync with Khatmah if current page is ahead
            const savedPlanStr = localStorage.getItem('tareeq_khatmah_plan') || localStorage.getItem('nour_khatmah_plan');
            if (savedPlanStr) {
              const p: KhatmahPlan = JSON.parse(savedPlanStr);
              if (currentPage > p.currentPage) {
                p.currentPage = currentPage;
                localStorage.setItem('tareeq_khatmah_plan', JSON.stringify(p));
                localStorage.setItem('nour_khatmah_plan', JSON.stringify(p));
                setKhatmahPlan(p);
              }
            }
          } catch {
            // ignore
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'تعذر تحميل صفحة المصحف الشريف');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  // Save theme
  const handleThemeChange = (th: MushafThemeType) => {
    setMushafTheme(th);
    try {
      localStorage.setItem('tareeq_mushaf_theme', th);
      localStorage.setItem('nour_mushaf_theme', th);
    } catch {
      // ignore
    }
  };

  // Save font size
  const handleFontSizeChange = (delta: number) => {
    setFontSize((prev) => {
      const n = Math.max(22, Math.min(56, prev + delta));
      try {
        localStorage.setItem('tareeq_reading_font_size', String(n));
        localStorage.setItem('nour_reading_font_size', String(n));
      } catch {
        // ignore
      }
      return n;
    });
  };

  const goToPage = (p: number, direction?: 'next' | 'prev') => {
    const valid = Math.max(1, Math.min(604, p));
    if (valid === currentPage) return;
    
    if (direction) {
      setPageFlipAnim(direction);
      setTimeout(() => setPageFlipAnim(null), 300);
    }

    setCurrentPage(valid);
    setShowNavPicker(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentPage < 604) goToPage(currentPage + 1, 'next');
      } else if (e.key === 'ArrowRight') {
        if (currentPage > 1) goToPage(currentPage - 1, 'prev');
      } else if (e.key === 'Escape' && isImmersiveFull) {
        setIsImmersiveFull(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isImmersiveFull]);

  // Touch Swipe Handlers for smooth mobile flipping
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchEndY.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = (touchStartY.current || 0) - (touchEndY.current || 0);

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        if (currentPage < 604) goToPage(currentPage + 1, 'next');
      } else {
        if (currentPage > 1) goToPage(currentPage - 1, 'prev');
      }
    }
  };

  const isAyahBookmarked = (surahNum: number, ayahNum: number) => {
    return bookmarks.some((b) => b.surahNumber === surahNum && b.ayahNumber === ayahNum);
  };

  const handleToggleBookmark = (ayah: PageAyah) => {
    const existing = bookmarks.find(
      (b) => b.surahNumber === ayah.surah.number && b.ayahNumber === ayah.numberInSurah
    );

    let updated: BookmarkType[];
    if (existing) {
      updated = bookmarks.filter((b) => b.id !== existing.id);
    } else {
      const newBm: BookmarkType = {
        id: `${ayah.surah.number}_${ayah.numberInSurah}_${Date.now()}`,
        surahNumber: ayah.surah.number,
        ayahNumber: ayah.numberInSurah,
        surahName: ayah.surah.name.replace(/^سُورَةُ\s*/, ''),
        ayahText: ayah.text,
        timestamp: Date.now()
      };
      updated = [newBm, ...bookmarks];
    }

    setBookmarks(updated);
    try {
      localStorage.setItem('tareeq_bookmarks', JSON.stringify(updated));
      localStorage.setItem('nour_bookmarks', JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (onBookmarkChange) onBookmarkChange();
  };

  const handleCopyAyah = (ayah: PageAyah) => {
    const text = `﴿${ayah.text}﴾ [سورة ${ayah.surah.name.replace(/^سُورَةُ\s*/, '')}: ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAyah(ayah.numberInSurah);
      setTimeout(() => setCopiedAyah(null), 2000);
    });
  };

  // Determine current Juz, Hizb, Surah info from page
  const currentJuz = pageData?.juz || Math.min(30, Math.max(1, Math.ceil(currentPage / 20.2)));
  const juzName = JUZ_NAMES[currentJuz - 1] || `الجزء ${currentJuz}`;
  const currentHizb = Math.min(60, Math.max(1, Math.ceil(currentPage / 10.1)));
  const surahsOnPage = pageData?.surahNames.join(' • ') || '';

  // Theme styling configurations
  const themeStyles = {
    royal_purple: {
      bg: 'bg-black text-[#FFFFFF]',
      pageBg: 'bg-[#000000] text-[#FFFFFF]',
      frameBorder: 'border-[#3B1D54]/50',
      headerBg: 'bg-[#0F081D]/90 border-b border-[#2A1540]',
      headerAccent: 'text-[#C084FC]',
      ayahMarkerClass: 'bg-[#8B5CF6] text-white border border-[#C4B5FD]/50 shadow-sm shadow-[#7C3AED]/40',
      bannerGradient: 'from-[#7E22CE] via-[#A855F7] to-[#6B21A8]',
      bannerInner: 'bg-[#0B0517]/95 border border-[#A855F7]/80 text-[#FFFFFF]',
      basmalahColor: 'text-[#FFFFFF]',
      playingHighlight: 'bg-[#9333EA]/35 text-white ring-1 ring-[#C084FC]',
      selectedHighlight: 'bg-[#7C3AED]/25 ring-1 ring-[#A855F7]'
    },
    madinah_green: {
      bg: 'bg-[#07130B] text-[#E0EBE2]',
      pageBg: 'bg-[#0A170F] text-[#F0FDF4]',
      frameBorder: 'border-[#1B3022]',
      headerBg: 'bg-[#0F2317]/90 border-b border-[#1E432D]',
      headerAccent: 'text-[#E9B161]',
      ayahMarkerClass: 'bg-[#059669] text-white border border-[#6EE7B7]/40 shadow-sm',
      bannerGradient: 'from-[#065F46] via-[#10B981] to-[#047857]',
      bannerInner: 'bg-[#042014]/95 border border-[#E9B161]/80 text-[#E9B161]',
      basmalahColor: 'text-[#E9B161]',
      playingHighlight: 'bg-[#059669]/40 text-white ring-1 ring-[#34D399]',
      selectedHighlight: 'bg-[#047857]/30 ring-1 ring-[#10B981]'
    },
    warm_parchment: {
      bg: 'bg-[#F4EEDB] text-[#2C2114]',
      pageBg: 'bg-[#FAF5E8] text-[#221B10]',
      frameBorder: 'border-[#D8C7A5]',
      headerBg: 'bg-[#EFE5CD]/90 border-b border-[#D8C7A5]',
      headerAccent: 'text-[#9A3412]',
      ayahMarkerClass: 'bg-[#C2822B] text-white border border-[#FDE68A]/60 shadow-sm',
      bannerGradient: 'from-[#9A3412] via-[#C2822B] to-[#7C2D12]',
      bannerInner: 'bg-[#FFFBEB]/95 border border-[#C2822B] text-[#7C2D12]',
      basmalahColor: 'text-[#854D0E]',
      playingHighlight: 'bg-[#E9B161]/35 text-[#1B3022] ring-1 ring-[#C2822B]',
      selectedHighlight: 'bg-[#E9B161]/20 ring-1 ring-[#E9B161]'
    },
    night_charcoal: {
      bg: 'bg-[#0B0F17] text-[#E2E8F0]',
      pageBg: 'bg-[#111827] text-[#F8FAFC]',
      frameBorder: 'border-[#1E293B]',
      headerBg: 'bg-[#1E293B]/90 border-b border-[#334155]',
      headerAccent: 'text-[#60A5FA]',
      ayahMarkerClass: 'bg-[#3B82F6] text-white border border-[#93C5FD]/50 shadow-sm',
      bannerGradient: 'from-[#1E3A8A] via-[#3B82F6] to-[#1D4ED8]',
      bannerInner: 'bg-[#0F172A]/95 border border-[#60A5FA]/80 text-[#FFFFFF]',
      basmalahColor: 'text-[#93C5FD]',
      playingHighlight: 'bg-[#2563EB]/35 text-white ring-1 ring-[#60A5FA]',
      selectedHighlight: 'bg-[#1D4ED8]/25 ring-1 ring-[#3B82F6]'
    },
    pure_white: {
      bg: 'bg-[#F8FAFC] text-[#0F172A]',
      pageBg: 'bg-[#FFFFFF] text-[#0F172A]',
      frameBorder: 'border-slate-200',
      headerBg: 'bg-slate-100/90 border-b border-slate-200',
      headerAccent: 'text-slate-700',
      ayahMarkerClass: 'bg-[#475569] text-white border border-slate-300 shadow-sm',
      bannerGradient: 'from-slate-700 via-slate-600 to-slate-800',
      bannerInner: 'bg-slate-900/95 border border-slate-400 text-white',
      basmalahColor: 'text-slate-800',
      playingHighlight: 'bg-slate-200 text-slate-900 ring-1 ring-slate-400',
      selectedHighlight: 'bg-slate-100 ring-1 ring-slate-300'
    }
  };

  const currentTheme = themeStyles[mushafTheme] || themeStyles.royal_purple;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isImmersiveFull ? 'fixed inset-0 z-50 overflow-y-auto' : 'py-3 sm:py-6 px-2 sm:px-4 md:px-6'} ${currentTheme.bg}`}>
      
      {/* Top Floating Control Bar */}
      <div className={`max-w-4xl mx-auto mb-3 transition-opacity duration-300 ${!showControls && isImmersiveFull ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-black/40 dark:bg-black/60 backdrop-blur-md border border-white/10 text-xs sm:text-sm text-white shadow-xl">
          
          {/* Quick Index / Page Select */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNavPicker(true)}
              id="mushaf-index-picker-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C084FC]" />
              <span className="font-scheherazade text-sm sm:text-base">فهرس المصحف</span>
              <span className="font-mono text-xs opacity-75">({currentPage}/604)</span>
            </button>

            {onOpenKhatmahTab && khatmahPlan && (
              <button
                onClick={onOpenKhatmahTab}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs font-semibold"
              >
                <Flame className="w-3 h-3 text-purple-400" />
                <span>الورد اليومي</span>
              </button>
            )}
          </div>

          {/* Center Info on Tablet/Desktop */}
          <div className="hidden sm:flex items-center gap-2 text-xs opacity-90 font-scheherazade">
            <span className="font-bold">{juzName}</span>
            <span>•</span>
            <span>الحزب {toArabicNumerals(currentHizb)}</span>
          </div>

          {/* Right Controls: Font size, Themes, Fullscreen */}
          <div className="flex items-center gap-1.5">
            {/* Font size zoom */}
            <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
              <button
                onClick={() => handleFontSizeChange(2)}
                className="px-2 py-1 hover:bg-white/20 rounded-lg text-xs font-bold font-mono"
                title="تكبير الخط"
              >
                A+
              </button>
              <span className="text-[10px] opacity-60 px-1 font-mono">{fontSize}</span>
              <button
                onClick={() => handleFontSizeChange(-2)}
                className="px-2 py-1 hover:bg-white/20 rounded-lg text-xs font-bold font-mono"
                title="تصغير الخط"
              >
                A-
              </button>
            </div>

            {/* Theme Picker */}
            <div className="relative">
              <button
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-purple-300 transition-colors"
                title="تغيير مظهر المصحف"
              >
                <Palette className="w-4 h-4" />
              </button>

              {showThemePicker && (
                <div 
                  className="absolute left-0 mt-2 z-50 w-48 p-2 rounded-2xl bg-[#1A1325] border border-purple-900 text-white shadow-2xl space-y-1 animate-in fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[10px] text-purple-300 font-bold px-2 py-1 border-b border-purple-900/50">نمط العرض والألوان</p>
                  <button
                    onClick={() => { handleThemeChange('royal_purple'); setShowThemePicker(false); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs ${
                      mushafTheme === 'royal_purple' ? 'bg-purple-600 text-white font-bold' : 'hover:bg-purple-900/40 text-purple-200'
                    }`}
                  >
                    <span>البنفسجي الملكي (AMOLED)</span>
                    <span className="w-3 h-3 rounded-full bg-purple-500 border border-white/40"></span>
                  </button>
                  <button
                    onClick={() => { handleThemeChange('madinah_green'); setShowThemePicker(false); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs ${
                      mushafTheme === 'madinah_green' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-purple-900/40 text-purple-200'
                    }`}
                  >
                    <span>مصحف المدينة (أخضر)</span>
                    <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white/40"></span>
                  </button>
                  <button
                    onClick={() => { handleThemeChange('warm_parchment'); setShowThemePicker(false); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs ${
                      mushafTheme === 'warm_parchment' ? 'bg-amber-700 text-white font-bold' : 'hover:bg-purple-900/40 text-purple-200'
                    }`}
                  >
                    <span>الورقي الدافئ (Warm)</span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 border border-white/40"></span>
                  </button>
                  <button
                    onClick={() => { handleThemeChange('night_charcoal'); setShowThemePicker(false); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs ${
                      mushafTheme === 'night_charcoal' ? 'bg-blue-800 text-white font-bold' : 'hover:bg-purple-900/40 text-purple-200'
                    }`}
                  >
                    <span>الوضع الليلي (Night)</span>
                    <span className="w-3 h-3 rounded-full bg-slate-700 border border-white/40"></span>
                  </button>
                  <button
                    onClick={() => { handleThemeChange('pure_white'); setShowThemePicker(false); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs ${
                      mushafTheme === 'pure_white' ? 'bg-slate-700 text-white font-bold' : 'hover:bg-purple-900/40 text-purple-200'
                    }`}
                  >
                    <span>الأبيض الصافي (Light)</span>
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-400"></span>
                  </button>
                </div>
              )}
            </div>

            {/* Toggle Fullscreen / Immersive */}
            <button
              onClick={() => setIsImmersiveFull(!isImmersiveFull)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors"
              title={isImmersiveFull ? 'إلغاء وضع ملء الشاشة' : 'وضع القراءة الغامرة (ملء الشاشة)'}
            >
              {isImmersiveFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Mushaf Page Container */}
      <div 
        className="max-w-4xl mx-auto relative select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={`rounded-2xl sm:rounded-3xl border ${currentTheme.frameBorder} ${currentTheme.pageBg} p-3 sm:p-8 md:p-10 shadow-2xl transition-all duration-300 min-h-[750px] flex flex-col justify-between relative overflow-hidden ${
            pageFlipAnim === 'next' ? 'animate-in slide-in-from-left-4 duration-200' : ''
          } ${pageFlipAnim === 'prev' ? 'animate-in slide-in-from-right-4 duration-200' : ''}`}
        >
          {/* Subtle Outer Corner Islamic Accents */}
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg pointer-events-none"></div>
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-purple-500/30 rounded-tl-lg pointer-events-none"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-purple-500/30 rounded-br-lg pointer-events-none"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg pointer-events-none"></div>

          {/* Top Page Header (Juz & Surah & Page info) */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6 text-xs sm:text-sm font-semibold opacity-90 font-scheherazade select-none">
            <div className="text-right flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base">{juzName}</span>
              <span className="opacity-60 text-xs hidden sm:inline">(الحزب {toArabicNumerals(currentHizb)})</span>
            </div>
            <div className="text-center font-bold text-base sm:text-lg text-purple-300">
              {surahsOnPage ? `سورة ${surahsOnPage}` : 'القرآن الكريم'}
            </div>
            <div className="text-left font-mono text-xs sm:text-sm font-bold text-purple-300">
              صفحة {toArabicNumerals(currentPage)}
            </div>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center py-28 space-y-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs sm:text-sm font-semibold text-purple-200">جاري عرض صفحة المصحف الشريف...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3">
              <p className="text-xs sm:text-sm text-red-400 font-semibold">{error}</p>
              <button
                onClick={() => goToPage(currentPage)}
                className="px-5 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-600"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Authentic Page Ayahs Content */}
          {!loading && pageData && (
            <div 
              className="flex-1 my-auto text-justify font-quran leading-[2.5] sm:leading-[2.7] select-text tracking-wide px-1 sm:px-3"
              style={{ fontSize: `${fontSize}px` }}
            >
              {(() => {
                let lastSurahNum = -1;
                return pageData.ayahs.map((ayah) => {
                  const isNewSurah = ayah.surah.number !== lastSurahNum;
                  lastSurahNum = ayah.surah.number;
                  const isSurahStart = ayah.numberInSurah === 1;

                  const isCurrentlyPlaying =
                    activeSurah === ayah.surah.number && activeAyahNumber === ayah.numberInSurah && isPlaying;
                  const isSelected =
                    selectedAyah?.surah.number === ayah.surah.number &&
                    selectedAyah?.numberInSurah === ayah.numberInSurah;

                  const { cleanText } = separateBasmalahFromAyah(ayah.text, ayah.surah.number, ayah.numberInSurah);

                  return (
                    <React.Fragment key={`${ayah.surah.number}_${ayah.numberInSurah}`}>
                      
                      {/* Authentic Ornate Islamic Surah Header (Matching User's Photo!) */}
                      {isNewSurah && isSurahStart && (
                        <div className="w-full my-6 sm:my-8 text-center block clear-both select-none">
                          {/* Ornamental Header Box */}
                          <div className="relative mx-auto max-w-xl py-2 px-4 rounded-xl bg-gradient-to-r from-[#7E22CE] via-[#A855F7] to-[#7E22CE] shadow-lg shadow-purple-950/60 border border-purple-400/50 flex items-center justify-between overflow-hidden">
                            
                            {/* Left Arabesque flourish SVG */}
                            <svg className="w-10 sm:w-16 h-8 text-purple-200/80 shrink-0 transform -scale-x-100" viewBox="0 0 100 40" fill="currentColor">
                              <path d="M0 20 C20 5, 40 35, 60 20 C75 10, 85 25, 100 20 C85 15, 75 30, 60 20 C40 5, 20 35, 0 20 Z" opacity="0.9" />
                              <circle cx="25" cy="20" r="3" fill="#FFFFFF" />
                              <circle cx="50" cy="20" r="4" fill="#FFFFFF" />
                              <path d="M10 20 Q30 0 60 18 Q80 2 95 20" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7"/>
                            </svg>

                            {/* Center Title Cartouche */}
                            <div className="flex-1 mx-2 py-1 px-4 sm:px-6 rounded-lg bg-black/90 border border-purple-300/40 shadow-inner flex items-center justify-center">
                              <h3 className="font-scheherazade font-black text-xl sm:text-3xl text-white tracking-wider">
                                سُورَةُ {ayah.surah.name.replace(/^سُورَةُ\s*/, '')}
                              </h3>
                            </div>

                            {/* Right Arabesque flourish SVG */}
                            <svg className="w-10 sm:w-16 h-8 text-purple-200/80 shrink-0" viewBox="0 0 100 40" fill="currentColor">
                              <path d="M0 20 C20 5, 40 35, 60 20 C75 10, 85 25, 100 20 C85 15, 75 30, 60 20 C40 5, 20 35, 0 20 Z" opacity="0.9" />
                              <circle cx="25" cy="20" r="3" fill="#FFFFFF" />
                              <circle cx="50" cy="20" r="4" fill="#FFFFFF" />
                              <path d="M10 20 Q30 0 60 18 Q80 2 95 20" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7"/>
                            </svg>
                          </div>

                          {/* Ornate Basmalah Calligraphy (except Surah 9 At-Tawbah & Surah 1) */}
                          {ayah.surah.number !== 9 && ayah.surah.number !== 1 && (
                            <div className="my-4 sm:my-6 text-center">
                              <span className={`font-scheherazade text-xl sm:text-3xl font-bold block ${currentTheme.basmalahColor} tracking-wide drop-shadow-sm`}>
                                {BASMALAH_TEXT}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Clickable Quranic Ayah Text */}
                      <span
                        onClick={() => setSelectedAyah(ayah)}
                        id={`page-ayah-${ayah.surah.number}-${ayah.numberInSurah}`}
                        className={`cursor-pointer transition-all duration-150 rounded px-1 py-0.5 inline ${
                          isCurrentlyPlaying
                            ? currentTheme.playingHighlight
                            : isSelected
                            ? currentTheme.selectedHighlight
                            : 'hover:bg-white/10'
                        }`}
                        title={`سورة ${ayah.surah.name.replace(/^سُورَةُ\s*/, '')} - آية ${ayah.numberInSurah}`}
                      >
                        {cleanText}

                        {/* Distinctive Purple Ayah Circle Marker (Exact match to User's Photo!) */}
                        <span 
                          className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 mx-1.5 rounded-full font-bold font-scheherazade text-[11px] sm:text-xs align-middle select-none ${currentTheme.ayahMarkerClass}`}
                        >
                          {toArabicNumerals(ayah.numberInSurah)}
                        </span>
                      </span>
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          )}

          {/* Bottom Page Footer (Page Number Centerpiece) */}
          <div className="border-t border-white/10 pt-4 mt-6 text-center select-none">
            <div className="inline-flex items-center gap-3 px-6 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-mono font-bold text-purple-200">
              <span>— {toArabicNumerals(currentPage)} —</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Selected Ayah Action Bar */}
      {selectedAyah && (
        <div className="max-w-2xl mx-auto mt-4 p-4 rounded-2xl bg-[#170E28] border border-purple-700/60 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0 font-mono">
              {selectedAyah.numberInSurah}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-purple-200 truncate">
                سورة {selectedAyah.surah.name.replace(/^سُورَةُ\s*/, '')} (الآية {selectedAyah.numberInSurah})
              </h4>
              <p className="text-[11px] text-purple-300/70 truncate font-scheherazade">
                ﴿{selectedAyah.text.slice(0, 40)}...﴾
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => playAyah(selectedAyah.surah.number, selectedAyah.numberInSurah)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>تلاوة</span>
            </button>

            <button
              onClick={() => {
                const { cleanText } = separateBasmalahFromAyah(selectedAyah.text, selectedAyah.surah.number, selectedAyah.numberInSurah);
                setTafsirTarget({
                  surah: selectedAyah.surah.number,
                  ayah: selectedAyah.numberInSurah,
                  text: cleanText
                });
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-700 text-purple-200 hover:text-white text-xs font-medium transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>التفسير</span>
            </button>

            <button
              onClick={() => handleToggleBookmark(selectedAyah)}
              className="p-1.5 rounded-xl bg-purple-950 border border-purple-700 text-purple-300 hover:bg-purple-900 transition-all"
              title="حفظ علامة مرجعية"
            >
              {isAyahBookmarked(selectedAyah.surah.number, selectedAyah.numberInSurah) ? (
                <BookmarkCheck className="w-4 h-4 fill-current text-purple-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => handleCopyAyah(selectedAyah)}
              className="p-1.5 rounded-xl bg-purple-950 border border-purple-700 text-purple-300 hover:text-white transition-all"
              title="نسخ الآية"
            >
              {copiedAyah === selectedAyah.numberInSurah ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setSelectedAyah(null)}
              className="p-1.5 rounded-xl bg-purple-950 text-purple-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Mushaf Page Turners / Navigation Buttons */}
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 pt-3">
        {/* Next Page in Arabic RTL is Left arrow */}
        <button
          disabled={currentPage >= 604}
          onClick={() => goToPage(currentPage + 1, 'next')}
          id="mushaf-next-page-btn"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-bold text-white disabled:opacity-30 shadow-sm transition-all"
        >
          <ChevronRight className="w-4 h-4 text-purple-400" />
          <span>الصفحة التالية ({currentPage + 1})</span>
        </button>

        <button
          onClick={() => setShowNavPicker(true)}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-950/60 transition-all shrink-0 font-mono"
        >
          <span>{currentPage} / 604</span>
        </button>

        {/* Prev Page in Arabic RTL is Right arrow */}
        <button
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1, 'prev')}
          id="mushaf-prev-page-btn"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-bold text-white disabled:opacity-30 shadow-sm transition-all"
        >
          <span>الصفحة السابقة ({currentPage - 1})</span>
          <ChevronLeft className="w-4 h-4 text-purple-400" />
        </button>
      </div>

      {/* Index Navigation Modal / Picker */}
      {showNavPicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg rounded-3xl bg-[#140D24] border border-purple-700/60 p-6 text-white shadow-2xl space-y-5 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-purple-900 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-white">الانتقال السريع في المصحف</h3>
              </div>
              <button
                onClick={() => setShowNavPicker(false)}
                className="p-1 rounded-lg text-purple-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Direct Page Input */}
            <div className="space-y-2">
              <label className="text-xs text-purple-300 font-bold block">رقم الصفحة مباشرة (1 - 604):</label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const p = parseInt(pageInput);
                  if (!isNaN(p)) goToPage(p);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="number"
                  min="1"
                  max="604"
                  placeholder="اكتب رقم الصفحة..."
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  انتقال
                </button>
              </form>
            </div>

            {/* Surah List Selector */}
            <div className="space-y-2">
              <label className="text-xs text-purple-300 font-bold block">الانتقال لبداية سورة:</label>
              <select
                value={targetSurahPick}
                onChange={(e) => {
                  const sNum = parseInt(e.target.value);
                  setTargetSurahPick(sNum);
                  const meta = SURAHS_LIST.find((s) => s.number === sNum);
                  if (meta) goToPage(meta.pageStart);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-700 text-white text-xs font-semibold focus:outline-none"
              >
                {SURAHS_LIST.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. سورة {s.name} (صفحة {s.pageStart} • جزء {s.juzStart})
                  </option>
                ))}
              </select>
            </div>

            {/* Juz Quick Grid (30 Parts) */}
            <div className="space-y-2">
              <label className="text-xs text-purple-300 font-bold block">الانتقال لجزء محدد:</label>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((jNum) => {
                  const approxPage = (jNum - 1) * 20 + 2;
                  const validPage = jNum === 1 ? 1 : Math.min(604, approxPage);
                  return (
                    <button
                      key={jNum}
                      onClick={() => goToPage(validPage)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                        currentJuz === jNum
                          ? 'bg-purple-600 text-white border-purple-400'
                          : 'bg-purple-950/40 text-purple-200 border-purple-900 hover:border-purple-500'
                      }`}
                    >
                      جـ {jNum}
                    </button>
                  );
                })}
              </div>
            </div>
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
