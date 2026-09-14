import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Share2,
  BookOpen,
  Volume2,
  Play,
  Pause,
  Sliders,
  Check,
  Copy,
  Flame,
  Palette,
  Eye,
  EyeOff,
  Home,
  RotateCcw,
  Search,
  Sparkles,
  Info,
  BookMarked,
  X
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { TafsirModal } from './TafsirModal';
import { normalizeArabic } from '../services/quranApi';

interface PageAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
}

interface PageData {
  pageNumber: number;
  ayahs: PageAyah[];
  surahNames: string[];
  juz: number;
  hizbQuarter: number;
}

interface BookmarkType {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;
  timestamp: number;
}

interface QuranReadingViewProps {
  initialPage?: number;
  fontSize?: number;
  isKhatmahMode?: boolean;
  onBookmarkChange?: () => void;
  onOpenKhatmahTab?: () => void;
  onNavigateHome?: () => void;
}

// Convert numbers to Arabic-Indic digits: 1 -> ١
function toArabicNumerals(n: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n).replace(/[0-9]/g, (w) => arabicDigits[+w]);
}

const BASMALAH_TEXT = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

function separateBasmalahFromAyah(text: string, surahNumber: number, ayahNumber: number): { hasBasmalah: boolean; cleanText: string } {
  if (ayahNumber === 1 && surahNumber !== 1 && surahNumber !== 9) {
    if (text.startsWith(BASMALAH_TEXT)) {
      return {
        hasBasmalah: true,
        cleanText: text.slice(BASMALAH_TEXT.length).trim()
      };
    }
    const normalized = text.replace(/^بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ\s*/, '').trim();
    if (normalized !== text) {
      return {
        hasBasmalah: true,
        cleanText: normalized
      };
    }
  }
  return { hasBasmalah: false, cleanText: text };
}

// Surahs list for index modal
const SURAHS_LIST = [
  { number: 1, name: 'الفاتحة', pageStart: 1, juzStart: 1 },
  { number: 2, name: 'البقرة', pageStart: 2, juzStart: 1 },
  { number: 3, name: 'آل عمران', pageStart: 50, juzStart: 3 },
  { number: 4, name: 'النساء', pageStart: 77, juzStart: 4 },
  { number: 5, name: 'المائدة', pageStart: 106, juzStart: 6 },
  { number: 6, name: 'الأنعام', pageStart: 128, juzStart: 7 },
  { number: 7, name: 'الأعراف', pageStart: 151, juzStart: 8 },
  { number: 8, name: 'الأنفال', pageStart: 177, juzStart: 9 },
  { number: 9, name: 'التوبة', pageStart: 187, juzStart: 10 },
  { number: 10, name: 'يونس', pageStart: 208, juzStart: 11 },
  { number: 11, name: 'هود', pageStart: 221, juzStart: 11 },
  { number: 12, name: 'يوسف', pageStart: 235, juzStart: 12 },
  { number: 13, name: 'الرعد', pageStart: 249, juzStart: 13 },
  { number: 14, name: 'إبراهيم', pageStart: 255, juzStart: 13 },
  { number: 15, name: 'الحجر', pageStart: 262, juzStart: 14 },
  { number: 16, name: 'النحل', pageStart: 267, juzStart: 14 },
  { number: 17, name: 'الإسراء', pageStart: 282, juzStart: 15 },
  { number: 18, name: 'الكهف', pageStart: 293, juzStart: 15 },
  { number: 19, name: 'مريم', pageStart: 305, juzStart: 16 },
  { number: 20, name: 'طه', pageStart: 312, juzStart: 16 },
  { number: 21, name: 'الأنبياء', pageStart: 322, juzStart: 17 },
  { number: 22, name: 'الحج', pageStart: 332, juzStart: 17 },
  { number: 23, name: 'المؤمنون', pageStart: 342, juzStart: 18 },
  { number: 24, name: 'النور', pageStart: 350, juzStart: 18 },
  { number: 25, name: 'الفرقان', pageStart: 359, juzStart: 18 },
  { number: 26, name: 'الشعراء', pageStart: 367, juzStart: 19 },
  { number: 27, name: 'النمل', pageStart: 377, juzStart: 19 },
  { number: 28, name: 'القصص', pageStart: 385, juzStart: 20 },
  { number: 29, name: 'العنكبوت', pageStart: 396, juzStart: 20 },
  { number: 30, name: 'الروم', pageStart: 404, juzStart: 21 },
  { number: 31, name: 'لقمان', pageStart: 411, juzStart: 21 },
  { number: 32, name: 'السجدة', pageStart: 415, juzStart: 21 },
  { number: 33, name: 'الأحزاب', pageStart: 418, juzStart: 21 },
  { number: 34, name: 'سبأ', pageStart: 428, juzStart: 22 },
  { number: 35, name: 'فاطر', pageStart: 434, juzStart: 22 },
  { number: 36, name: 'يس', pageStart: 440, juzStart: 22 },
  { number: 37, name: 'الصافات', pageStart: 446, juzStart: 23 },
  { number: 38, name: 'ص', pageStart: 453, juzStart: 23 },
  { number: 39, name: 'الزمر', pageStart: 458, juzStart: 23 },
  { number: 40, name: 'غافر', pageStart: 467, juzStart: 24 },
  { number: 41, name: 'فصلت', pageStart: 477, juzStart: 24 },
  { number: 42, name: 'الشورى', pageStart: 483, juzStart: 25 },
  { number: 43, name: 'الزخرف', pageStart: 489, juzStart: 25 },
  { number: 44, name: 'الدخان', pageStart: 496, juzStart: 25 },
  { number: 45, name: 'الجاثية', pageStart: 499, juzStart: 25 },
  { number: 46, name: 'الأحقاف', pageStart: 502, juzStart: 26 },
  { number: 47, name: 'محمد', pageStart: 507, juzStart: 26 },
  { number: 48, name: 'الفتح', pageStart: 511, juzStart: 26 },
  { number: 49, name: 'الحجرات', pageStart: 515, juzStart: 26 },
  { number: 50, name: 'ق', pageStart: 518, juzStart: 26 },
  { number: 51, name: 'الذاريات', pageStart: 520, juzStart: 26 },
  { number: 52, name: 'الطور', pageStart: 523, juzStart: 27 },
  { number: 53, name: 'النجم', pageStart: 526, juzStart: 27 },
  { number: 54, name: 'القمر', pageStart: 528, juzStart: 27 },
  { number: 55, name: 'الرحمن', pageStart: 531, juzStart: 27 },
  { number: 56, name: 'الواقعة', pageStart: 534, juzStart: 27 },
  { number: 57, name: 'الحديد', pageStart: 537, juzStart: 27 },
  { number: 58, name: 'المجادلة', pageStart: 542, juzStart: 28 },
  { number: 59, name: 'الحشر', pageStart: 545, juzStart: 28 },
  { number: 60, name: 'الممتحنة', pageStart: 549, juzStart: 28 },
  { number: 61, name: 'الصف', pageStart: 551, juzStart: 28 },
  { number: 62, name: 'الجمعة', pageStart: 553, juzStart: 28 },
  { number: 63, name: 'المنافقون', pageStart: 554, juzStart: 28 },
  { number: 64, name: 'التغابن', pageStart: 556, juzStart: 28 },
  { number: 65, name: 'الطلاق', pageStart: 558, juzStart: 28 },
  { number: 66, name: 'التحريم', pageStart: 560, juzStart: 28 },
  { number: 67, name: 'الملك', pageStart: 562, juzStart: 29 },
  { number: 68, name: 'القلم', pageStart: 564, juzStart: 29 },
  { number: 69, name: 'الحاقة', pageStart: 566, juzStart: 29 },
  { number: 70, name: 'المعارج', pageStart: 568, juzStart: 29 },
  { number: 71, name: 'نوح', pageStart: 570, juzStart: 29 },
  { number: 72, name: 'الجن', pageStart: 572, juzStart: 29 },
  { number: 73, name: 'المزمل', pageStart: 574, juzStart: 29 },
  { number: 74, name: 'المدثر', pageStart: 575, juzStart: 29 },
  { number: 75, name: 'القيامة', pageStart: 577, juzStart: 29 },
  { number: 76, name: 'الإنسان', pageStart: 578, juzStart: 29 },
  { number: 77, name: 'المرسلات', pageStart: 580, juzStart: 29 },
  { number: 78, name: 'النبأ', pageStart: 582, juzStart: 30 },
  { number: 79, name: 'النازعات', pageStart: 583, juzStart: 30 },
  { number: 80, name: 'عبس', pageStart: 585, juzStart: 30 },
  { number: 81, name: 'التكوير', pageStart: 586, juzStart: 30 },
  { number: 82, name: 'الانفطار', pageStart: 587, juzStart: 30 },
  { number: 83, name: 'المطففين', pageStart: 587, juzStart: 30 },
  { number: 84, name: 'الانشقاق', pageStart: 589, juzStart: 30 },
  { number: 85, name: 'البروج', pageStart: 590, juzStart: 30 },
  { number: 86, name: 'الطارق', pageStart: 591, juzStart: 30 },
  { number: 87, name: 'الأعلى', pageStart: 591, juzStart: 30 },
  { number: 88, name: 'الغاشية', pageStart: 592, juzStart: 30 },
  { number: 89, name: 'الفجر', pageStart: 593, juzStart: 30 },
  { number: 90, name: 'البلد', pageStart: 594, juzStart: 30 },
  { number: 91, name: 'الشمس', pageStart: 595, juzStart: 30 },
  { number: 92, name: 'الليل', pageStart: 595, juzStart: 30 },
  { number: 93, name: 'الضحى', pageStart: 596, juzStart: 30 },
  { number: 94, name: 'الشرح', pageStart: 596, juzStart: 30 },
  { number: 95, name: 'التين', pageStart: 597, juzStart: 30 },
  { number: 96, name: 'العلق', pageStart: 597, juzStart: 30 },
  { number: 97, name: 'القدر', pageStart: 598, juzStart: 30 },
  { number: 98, name: 'البينة', pageStart: 598, juzStart: 30 },
  { number: 99, name: 'الزلزلة', pageStart: 599, juzStart: 30 },
  { number: 100, name: 'العاديات', pageStart: 599, juzStart: 30 },
  { number: 101, name: 'القارعة', pageStart: 600, juzStart: 30 },
  { number: 102, name: 'التكاثر', pageStart: 600, juzStart: 30 },
  { number: 103, name: 'العصر', pageStart: 601, juzStart: 30 },
  { number: 104, name: 'الهمزة', pageStart: 601, juzStart: 30 },
  { number: 105, name: 'الفيل', pageStart: 601, juzStart: 30 },
  { number: 106, name: 'قريش', pageStart: 602, juzStart: 30 },
  { number: 107, name: 'الماعون', pageStart: 602, juzStart: 30 },
  { number: 108, name: 'الكوثر', pageStart: 602, juzStart: 30 },
  { number: 109, name: 'الكافرون', pageStart: 603, juzStart: 30 },
  { number: 110, name: 'النصر', pageStart: 603, juzStart: 30 },
  { number: 111, name: 'المسد', pageStart: 603, juzStart: 30 },
  { number: 112, name: 'الإخلاص', pageStart: 604, juzStart: 30 },
  { number: 113, name: 'الفلق', pageStart: 604, juzStart: 30 },
  { number: 114, name: 'الناس', pageStart: 604, juzStart: 30 }
];

const JUZ_NAMES = [
  'الجزء الأول', 'الجزء الثاني', 'الجزء الثالث', 'الجزء الرابع', 'الجزء الخامس',
  'الجزء السادس', 'الجزء السابع', 'الجزء الثامن', 'الجزء التاسع', 'الجزء العاشر',
  'الجزء الحادي عشر', 'الجزء الثاني عشر', 'الجزء الثالث عشر', 'الجزء الرابع عشر', 'الجزء الخامس عشر',
  'الجزء السادس عشر', 'الجزء السابع عشر', 'الجزء الثامن عشر', 'الجزء التاسع عشر', 'الجزء العشرون',
  'الجزء الحادي والعشرون', 'الجزء الثاني والعشرون', 'الجزء الثالث والعشرون', 'الجزء الرابع والعشرون', 'الجزء الخامس والعشرون',
  'الجزء السادس والعشرون', 'الجزء السابع والعشرون', 'الجزء الثامن والعشرون', 'الجزء التاسع والعشرون', 'الجزء الثلاثون'
];

type PaperLightingFilter = 'natural' | 'warm' | 'dark' | 'emerald' | 'sepia';

export const QuranReadingView: React.FC<QuranReadingViewProps> = ({
  initialPage,
  fontSize: initialFontSize = 20,
  isKhatmahMode = false,
  onBookmarkChange,
  onOpenKhatmahTab,
  onNavigateHome
}) => {
  const { playAyah, isPlaying, activeSurah, activeAyahNumber, playSurah } = useAudio();

  // Current page (Defaults to Page 1 - Surah Al-Fatihah, unless specified or loaded from saved progress)
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (initialPage && initialPage >= 1 && initialPage <= 604) return initialPage;
    try {
      const savedLast = localStorage.getItem('nour_last_read');
      if (savedLast) {
        const parsed = JSON.parse(savedLast);
        if (parsed.page && parsed.page >= 1 && parsed.page <= 604) {
          return parsed.page;
        }
      }
      const saved = localStorage.getItem('tareeq_reading_page');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 1 && parsed <= 604) return parsed;
      }
      return 1;
    } catch {
      return 1;
    }
  });

  // Sync if parent passes a new initialPage
  useEffect(() => {
    if (initialPage && initialPage >= 1 && initialPage <= 604 && initialPage !== currentPage) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  // Immersive state: by default during reading, showControls is false so NOTHING is visible on screen except the pure Quran page!
  const [showControls, setShowControls] = useState<boolean>(false);
  const [paperFilter, setPaperFilter] = useState<PaperLightingFilter>(() => {
    try {
      const saved = localStorage.getItem('nour_mushaf_paper_filter') as PaperLightingFilter;
      return saved || 'natural';
    } catch {
      return 'natural';
    }
  });

  // Display Mode: 'printed' (Real Scanned King Fahd Madinah Mushaf) or 'digital_text'
  const [displayMode, setDisplayMode] = useState<'printed' | 'digital_text'>('printed');

  // Image loading state & fallback
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);
  const [cdnIndex, setCdnIndex] = useState<number>(0);

  // Page metadata for header / search
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageFlipAnim, setPageFlipAnim] = useState<'next' | 'prev' | null>(null);

  // UI Modals
  const [showNavPicker, setShowNavPicker] = useState<boolean>(false);
  const [showFilterPicker, setShowFilterPicker] = useState<boolean>(false);
  const [showPageAyahsTafsirList, setShowPageAyahsTafsirList] = useState<boolean>(false);
  const [selectedAyah, setSelectedAyah] = useState<PageAyah | null>(null);
  const [tafsirTarget, setTafsirTarget] = useState<{ surah: number; ayah: number; text: string } | null>(null);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [khatmahPlan, setKhatmahPlan] = useState<any>(null);

  // Direct Page Input & Surah Search in picker
  const [pageInput, setPageInput] = useState<string>('');

  // Dedicated Reading Mode: true = Khatmah Wird (saves ONLY to Khatmah), false = General/Free Reading (saves ONLY to Mushaf)
  const [isKhatmahActive, setIsKhatmahActive] = useState<boolean>(() => Boolean(isKhatmahMode));

  useEffect(() => {
    setIsKhatmahActive(Boolean(isKhatmahMode));
  }, [isKhatmahMode]);

  const toggleKhatmahMode = (activate: boolean) => {
    setIsKhatmahActive(activate);
    if (activate) {
      // Switch to Khatmah mode: Jump to the user's separate saved Khatmah page
      try {
        const savedKhatmah = localStorage.getItem('nour_khatmah_plan');
        const plan = savedKhatmah ? JSON.parse(savedKhatmah) : null;
        if (plan?.currentPage && plan.currentPage >= 1 && plan.currentPage <= 604) {
          if (plan.currentPage !== currentPage) {
            setCurrentPage(plan.currentPage);
          }
        }
      } catch {
        // ignore
      }
    } else {
      // Switch to Free Reading mode: Jump to the user's separate saved Mushaf page
      try {
        let freePage = 1;
        const savedLast = localStorage.getItem('nour_last_read');
        if (savedLast) {
          const parsed = JSON.parse(savedLast);
          if (parsed.page && parsed.page >= 1 && parsed.page <= 604) {
            freePage = parsed.page;
          }
        } else {
          const saved = localStorage.getItem('tareeq_reading_page') || localStorage.getItem('nour_reading_page');
          if (saved) {
            const p = parseInt(saved, 10);
            if (p >= 1 && p <= 604) freePage = p;
          }
        }
        if (freePage !== currentPage) {
          setCurrentPage(freePage);
        }
      } catch {
        // ignore
      }
    }
  };

  const handleSetKhatmahHere = () => {
    try {
      const savedKhatmah = localStorage.getItem('nour_khatmah_plan');
      let plan = savedKhatmah ? JSON.parse(savedKhatmah) : null;
      if (plan) {
        plan.currentPage = currentPage;
        localStorage.setItem('nour_khatmah_plan', JSON.stringify(plan));
        setKhatmahPlan(plan);
        window.dispatchEvent(new CustomEvent('khatmah_updated', { detail: plan }));
      }
    } catch {
      // ignore
    }
  };

  // Get the independently saved Mushaf free reading page
  const savedFreePage = useMemo(() => {
    try {
      const savedLast = localStorage.getItem('nour_last_read');
      if (savedLast) {
        const parsed = JSON.parse(savedLast);
        if (parsed.page && parsed.page >= 1 && parsed.page <= 604) return parsed.page;
      }
      const saved = localStorage.getItem('tareeq_reading_page') || localStorage.getItem('nour_reading_page');
      if (saved) {
        const p = parseInt(saved, 10);
        if (p >= 1 && p <= 604) return p;
      }
    } catch {
      // ignore
    }
    return null;
  }, [currentPage, isKhatmahActive]);
  const [searchSurahQuery, setSearchSurahQuery] = useState<string>('');

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(() => {
    try {
      const saved = localStorage.getItem('nour_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auto-hide controls timer
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
    }
    if (showControls) {
      autoHideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }
  }, [showControls]);

  useEffect(() => {
    resetAutoHideTimer();
    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, [showControls, resetAutoHideTimer]);

  // Touch & Drag Gesture handling for turning pages like a real Mushaf
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Preload neighboring page images for instantaneous flip with zero lag
  useEffect(() => {
    const pagesToPreload = [currentPage - 1, currentPage + 1, currentPage + 2].filter(
      (p) => p >= 1 && p <= 604
    );

    pagesToPreload.forEach((p) => {
      const img1 = new Image();
      img1.src = `https://files.quran.app/hafs/madani/width_1260/page${String(p).padStart(3, '0')}.png`;
      const img2 = new Image();
      img2.src = `https://quran.ksu.edu.sa/png_big/${p}.png`;
    });
  }, [currentPage]);

  // Load Khatmah Plan & listen for external changes
  useEffect(() => {
    const loadPlan = () => {
      try {
        const savedKhatmah = localStorage.getItem('nour_khatmah_plan');
        if (savedKhatmah) {
          setKhatmahPlan(JSON.parse(savedKhatmah));
        }
      } catch {
        // ignore
      }
    };
    loadPlan();
    window.addEventListener('khatmah_updated', loadPlan);
    window.addEventListener('storage', loadPlan);
    return () => {
      window.removeEventListener('khatmah_updated', loadPlan);
      window.removeEventListener('storage', loadPlan);
    };
  }, []);

  // Automatic Khatmah and Reading Page Sync on every page turn
  useEffect(() => {
    try {
      if (!isKhatmahActive) {
        // =========================================================================
        // 1. FREE MUSHAF READING ONLY (الحفظ المستقل لتصفح وقراءة المصحف الشريف)
        // STRICT RULE: Never overwrite or touch Khatmah plan!
        // =========================================================================
        localStorage.setItem('tareeq_reading_page', String(currentPage));
        localStorage.setItem('nour_reading_page', String(currentPage));

        // Fast synchronous Surah fallback from SURAHS_LIST for last read
        const currentSurah = [...SURAHS_LIST].reverse().find((s) => s.pageStart <= currentPage) || SURAHS_LIST[0];
        const initialLastReadObj = {
          surahNumber: currentSurah.number,
          ayahNumber: 1,
          surahName: currentSurah.name.replace(/^سُورَةُ\s*/, ''),
          page: currentPage
        };
        localStorage.setItem('nour_last_read', JSON.stringify(initialLastReadObj));
        window.dispatchEvent(new CustomEvent('last_read_updated', { detail: initialLastReadObj }));
        if (onBookmarkChange) onBookmarkChange();
      } else {
        // =========================================================================
        // 2. KHATMAH PLAN AUTO-SAVE ONLY (الحفظ المستقل لخطة وورد الختمة القرآنية)
        // STRICT RULE: Never overwrite or touch Mushaf last_read or reading_page!
        // =========================================================================
        const savedKhatmah = localStorage.getItem('nour_khatmah_plan');
        let plan = savedKhatmah ? JSON.parse(savedKhatmah) : null;
        if (!plan) {
          plan = {
            id: 'khatmah_default',
            title: 'ختمة القرآن الكريم',
            wirdType: 'juz',
            wirdLabel: 'جزء واحد يومياً (ختمة شهرية)',
            dailyPages: 20,
            startPage: 1,
            currentPage: currentPage,
            startDate: new Date().toISOString(),
            targetDays: 30,
            streakDays: 1,
            todayCompleted: false,
            history: []
          };
        }

        if (plan) {
          const todayStr = new Date().toISOString().split('T')[0];
          plan.currentPage = currentPage;
          plan.lastReadDate = todayStr;

          const history = Array.isArray(plan.history) ? [...plan.history] : [];
          const todayIndex = history.findIndex((h: any) => h.date === todayStr);
          if (todayIndex >= 0) {
            const entry = history[todayIndex];
            const minP = Math.min(entry.fromPage, currentPage);
            const maxP = Math.max(entry.toPage, currentPage);
            history[todayIndex] = {
              ...entry,
              fromPage: minP,
              toPage: maxP,
              pagesRead: Math.max(entry.pagesRead, maxP - minP + 1)
            };
          } else {
            history.unshift({
              date: todayStr,
              fromPage: currentPage,
              toPage: currentPage,
              pagesRead: 1
            });
          }
          plan.history = history.slice(0, 60);

          if (currentPage >= 604) {
            plan.todayCompleted = true;
            plan.completedAt = new Date().toISOString();
          }

          localStorage.setItem('nour_khatmah_plan', JSON.stringify(plan));
          setKhatmahPlan(plan);
          window.dispatchEvent(new CustomEvent('khatmah_updated', { detail: plan }));
        }
      }
    } catch (e) {
      console.warn('Auto-save failed:', e);
    }
  }, [currentPage, isKhatmahActive]);

  // Fetch Page Ayahs for Info, Surahs & Tafsir
  useEffect(() => {
    let isMounted = true;
    setImageLoading(true);
    setImageError(false);
    setCdnIndex(0);

    const cacheKey = `nour_mushaf_page_${currentPage}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (isMounted) {
          setPageData(parsed);
        }
      }
    } catch {
      // ignore
    }

    fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.code === 200 && data.data && data.data.ayahs) {
          const ayahs: PageAyah[] = data.data.ayahs;
          const surahNamesSet = new Set<string>();
          ayahs.forEach((a) => {
            surahNamesSet.add(a.surah.name.replace(/^سُورَةُ\s*/, ''));
          });

          const structured: PageData = {
            pageNumber: currentPage,
            ayahs,
            surahNames: Array.from(surahNamesSet),
            juz: ayahs[0]?.juz || 1,
            hizbQuarter: ayahs[0]?.hizbQuarter || 1
          };

          setPageData(structured);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(structured));
            // Only update Mushaf last read if in Free Reading mode
            if (!isKhatmahActive) {
              localStorage.setItem('tareeq_reading_page', String(currentPage));
              localStorage.setItem('nour_reading_page', String(currentPage));
              if (ayahs[0]) {
                const lastReadObj = {
                  surahNumber: ayahs[0].surah.number,
                  ayahNumber: ayahs[0].numberInSurah,
                  surahName: ayahs[0].surah.name.replace(/^سُورَةُ\s*/, ''),
                  page: currentPage
                };
                localStorage.setItem('nour_last_read', JSON.stringify(lastReadObj));
                window.dispatchEvent(new CustomEvent('last_read_updated', { detail: lastReadObj }));
              }
            }
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Fallback info from SURAHS_LIST
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, isKhatmahActive]);

  // Turn to specific page with realistic page turn animation
  const goToPage = (p: number, anim?: 'next' | 'prev') => {
    const safePage = Math.max(1, Math.min(604, p));
    if (safePage === currentPage) return;
    if (anim) {
      setPageFlipAnim(anim);
      setTimeout(() => setPageFlipAnim(null), 300);
    }
    setCurrentPage(safePage);
    setShowNavPicker(false);
    setSelectedAyah(null);
    setDragOffset(0);
  };

  // Debounced toggle for Controls on tap / click
  const lastToggleTime = useRef<number>(0);
  const toggleControls = () => {
    const now = Date.now();
    if (now - lastToggleTime.current < 350) return; // Prevent double-trigger from touch+click
    lastToggleTime.current = now;
    setShowControls((prev) => !prev);
  };

  // Touch Gesture handlers (Moving/Swiping the screen turns the page)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchStartTime.current = Date.now();
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current || !isDragging.current) return;
    const currentX = e.targetTouches[0].clientX;
    const diffX = currentX - touchStartX.current;
    // Limit drag offset for visual feedback
    setDragOffset(Math.max(-120, Math.min(120, diffX)));
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !isDragging.current) return;
    isDragging.current = false;
    const touchEndXVal = e.changedTouches[0].clientX;
    const touchEndYVal = e.changedTouches[0].clientY;
    const distanceX = touchStartX.current - touchEndXVal;
    const distanceY = (touchStartY.current || 0) - touchEndYVal;
    const timeTaken = Date.now() - touchStartTime.current;

    setDragOffset(0);

    // Tap without drag -> Toggles top and bottom menus/controls on screen
    if (Math.abs(distanceX) < 18 && Math.abs(distanceY) < 18 && timeTaken < 500) {
      toggleControls();
      return;
    }

    // Drag / Swipe movement threshold:
    // Movement from Left to Right (touchEndX > touchStartX, distanceX < 0) opens NEXT PAGE
    // Movement from Right to Left (touchEndX < touchStartX, distanceX > 0) opens PREVIOUS PAGE
    const minSwipeDistance = 25;
    if (Math.abs(distanceX) > minSwipeDistance && Math.abs(distanceX) > Math.abs(distanceY) * 0.7) {
      if (distanceX < 0) {
        // Swiped from Left to Right -> NEXT PAGE
        if (currentPage < 604) goToPage(currentPage + 1, 'next');
      } else {
        // Swiped from Right to Left -> PREVIOUS PAGE
        if (currentPage > 1) goToPage(currentPage - 1, 'prev');
      }
    }
  };

  // Mouse Drag / Click support for Desktop
  const mouseStartX = useRef<number | null>(null);
  const mouseStartTime = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    mouseStartTime.current = Date.now();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return;
    const diff = mouseStartX.current - e.clientX;
    const timeTaken = Date.now() - mouseStartTime.current;

    // If dragged/swiped
    if (Math.abs(diff) > 25) {
      if (diff < 0 && currentPage < 604) {
        // Dragged from Left to Right -> NEXT PAGE
        goToPage(currentPage + 1, 'next');
      } else if (diff > 0 && currentPage > 1) {
        // Dragged from Right to Left -> PREVIOUS PAGE
        goToPage(currentPage - 1, 'prev');
      }
    } else if (timeTaken < 500 && Math.abs(diff) < 12) {
      // Click without drag -> toggle controls
      toggleControls();
    }
    mouseStartX.current = null;
  };

  // Trackpad / Wheel Horizontal Scroll support
  const lastWheelTime = useRef<number>(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 400) return;

    if (Math.abs(e.deltaX) > 30) {
      if (e.deltaX < 0 && currentPage < 604) {
        // Moved left to right -> Next page
        lastWheelTime.current = now;
        goToPage(currentPage + 1, 'next');
      } else if (e.deltaX > 0 && currentPage > 1) {
        // Moved right to left -> Previous page
        lastWheelTime.current = now;
        goToPage(currentPage - 1, 'prev');
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage < 604) {
        goToPage(currentPage + 1, 'next');
      } else if (e.key === 'ArrowRight' && currentPage > 1) {
        goToPage(currentPage - 1, 'prev');
      } else if (e.key === ' ' || e.key === 'Escape') {
        setShowControls((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  // Primary and fallback Image CDNs
  const getPageImageUrl = (page: number, index: number) => {
    const padded = String(page).padStart(3, '0');
    if (index === 0) {
      return `https://files.quran.app/hafs/madani/width_1260/page${padded}.png`;
    }
    return `https://quran.ksu.edu.sa/png_big/${page}.png`;
  };

  const handleImageError = () => {
    if (cdnIndex === 0) {
      setCdnIndex(1); // switch to secondary CDN
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  };

  // Bookmark Toggle
  const handleToggleCurrentPageBookmark = () => {
    const firstAyah = pageData?.ayahs?.[0];
    const surahNum = firstAyah?.surah.number || SURAHS_LIST.find((s) => s.pageStart <= currentPage)?.number || 1;
    const ayahNum = firstAyah?.numberInSurah || 1;
    const surahName = firstAyah?.surah.name.replace(/^سُورَةُ\s*/, '') || 'الفاتحة';

    const isBookmarked = bookmarks.some((b) => b.surahNumber === surahNum && b.ayahNumber === ayahNum);
    let updated: BookmarkType[];
    if (isBookmarked) {
      updated = bookmarks.filter((b) => !(b.surahNumber === surahNum && b.ayahNumber === ayahNum));
    } else {
      const newBm: BookmarkType = {
        id: `bm_page_${currentPage}_${Date.now()}`,
        surahNumber: surahNum,
        ayahNumber: ayahNum,
        surahName,
        ayahText: `صفحة ${toArabicNumerals(currentPage)} - سورة ${surahName}`,
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

  const handleCopyAyah = (ayah: PageAyah) => {
    const sName = ayah.surah.name.replace(/^سُورَةُ\s*/, '');
    const text = `﴿${ayah.text}﴾ [سورة ${sName}: الآية ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAyah(ayah.numberInSurah);
      setTimeout(() => setCopiedAyah(null), 2000);
    });
  };

  const isCurrentPageBookmarked = React.useMemo(() => {
    const firstAyah = pageData?.ayahs?.[0];
    if (!firstAyah) return false;
    return bookmarks.some(
      (b) => b.surahNumber === firstAyah.surah.number && b.ayahNumber === firstAyah.numberInSurah
    );
  }, [bookmarks, pageData]);

  // Current page headers
  const currentJuz = pageData?.juz || Math.ceil(currentPage / 20);
  const juzName = JUZ_NAMES[currentJuz - 1] || `الجزء ${currentJuz}`;
  const currentHizb = pageData?.hizbQuarter ? Math.ceil(pageData.hizbQuarter / 4) : Math.ceil(currentPage / 10);
  const surahsOnPage = pageData?.surahNames.join(' • ') || '';

  // Lighting Filter Styles
  const filterStyles = {
    natural: {
      bg: 'bg-[#18130B]',
      imgFilter: 'brightness-100 contrast-100',
      canvasBg: 'bg-[#FAF7EE]'
    },
    warm: {
      bg: 'bg-[#1E160C]',
      imgFilter: 'sepia-[0.35] brightness-[0.96] contrast-[1.03]',
      canvasBg: 'bg-[#F5ECD5]'
    },
    dark: {
      bg: 'bg-[#000000]',
      imgFilter: 'invert-[0.92] hue-rotate-180 brightness-[0.95] contrast-[1.15]',
      canvasBg: 'bg-[#0A0A0A]'
    },
    emerald: {
      bg: 'bg-[#06180E]',
      imgFilter: 'sepia-[0.25] hue-rotate-[70deg] brightness-[0.97]',
      canvasBg: 'bg-[#EDF6EE]'
    },
    sepia: {
      bg: 'bg-[#1C1309]',
      imgFilter: 'sepia-[0.65] brightness-[0.92] contrast-[1.08]',
      canvasBg: 'bg-[#EBDBC1]'
    }
  };

  const currentFilter = filterStyles[paperFilter] || filterStyles.natural;

  // Filtered Surahs in Index Picker
  const filteredSurahs = React.useMemo(() => {
    const q = searchSurahQuery.trim();
    if (!q) return SURAHS_LIST;
    const normQ = normalizeArabic(q);
    return SURAHS_LIST.filter((s) => {
      const normName = normalizeArabic(s.name);
      return (
        normName.includes(normQ) ||
        s.name.includes(q) ||
        String(s.number) === q ||
        String(s.pageStart) === q
      );
    });
  }, [searchSurahQuery]);

  return (
    <div
      id="real-mushaf-root"
      className={`fixed inset-0 z-50 w-screen h-[100dvh] max-h-[100dvh] ${currentFilter.bg} overflow-hidden select-none flex flex-col justify-between items-center transition-colors duration-300 overscroll-none`}
    >
      {/* 1. TOP HEADER BAR (Fades out completely during reading for 100% immersive experience) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 transform ${
          showControls ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 0px)',
          paddingRight: 'max(env(safe-area-inset-right, 0px), 0px)',
        }}
      >
        <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-1.5 sm:pt-2">
          <div className="flex items-center justify-between gap-1.5 px-3 py-2 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 text-white shadow-2xl">
            
            {/* Left: Home / Mode Switcher / Index */}
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              {onNavigateHome && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateHome();
                  }}
                  id="mushaf-exit-home-btn"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
                  title="العودة للرئيسية"
                >
                  <Home className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span className="hidden sm:inline">الرئيسية</span>
                </button>
              )}

              {/* Mode Switcher: قراءة حرة vs قراءة الختمة (حفظ مستقل لكل منهما) */}
              <div className="flex items-center bg-black/60 p-0.5 rounded-xl border border-white/20 shadow-inner">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleKhatmahMode(false);
                  }}
                  id="mushaf-mode-free-btn"
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                    !isKhatmahActive
                      ? 'bg-[#E5B869] text-[#142E20] font-bold shadow-sm'
                      : 'text-[#A8BCAD] hover:text-white'
                  }`}
                  title="قراءة عامة حرة: حفظ مستقل لصفحات المصحف دون التأثير على الختمة"
                >
                  <BookOpen className="w-3 h-3" />
                  <span className="text-[11px] whitespace-nowrap">قراءة حرة</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleKhatmahMode(true);
                  }}
                  id="mushaf-mode-khatmah-btn"
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                    isKhatmahActive
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-[#A8BCAD] hover:text-white'
                  }`}
                  title="وضع الختمة: حفظ مستقل لورد الختمة دون التأثير على قراءة المصحف"
                >
                  <Flame className="w-3 h-3 text-[#E5B869]" />
                  <span className="text-[11px] whitespace-nowrap">الختمة</span>
                </button>
              </div>

              {/* إذا كان في وضع الختمة: زر لعرض تفاصيل الختمة */}
              {isKhatmahActive && onOpenKhatmahTab && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenKhatmahTab();
                  }}
                  id="mushaf-open-khatmah-btn"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="الانتقال إلى خطة الختمة ومتابعة الورد القرآني"
                >
                  <BookMarked className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span className="hidden sm:inline">الختمة:</span>
                  <span className="font-mono text-[#E5B869] font-black">صـ {toArabicNumerals(currentPage)}</span>
                </button>
              )}

              {/* إذا كان في وضع الختمة وموضع قراءة المصحف الحرة مختلف: زر للذهاب إلى موضع المصحف */}
              {isKhatmahActive && savedFreePage && savedFreePage !== currentPage && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleKhatmahMode(false);
                  }}
                  id="mushaf-jump-free-btn"
                  className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
                  title={`الانتقال إلى موضعك في قراءة المصحف الحرة (صـ ${toArabicNumerals(savedFreePage)})`}
                >
                  <BookOpen className="w-3 h-3 text-purple-300" />
                  <span>موضع المصحف: صـ {toArabicNumerals(savedFreePage)}</span>
                </button>
              )}

              {/* إذا كان في وضع القراءة الحرة وموضع الختمة مختلف: زر للذهاب إلى موضع الختمة */}
              {!isKhatmahActive && khatmahPlan?.currentPage && khatmahPlan.currentPage !== currentPage && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleKhatmahMode(true);
                  }}
                  id="mushaf-jump-khatmah-btn"
                  className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
                  title={`الانتقال إلى موضعك في الختمة (صـ ${toArabicNumerals(khatmahPlan.currentPage)}) وتفعيل وضع الختمة`}
                >
                  <Flame className="w-3 h-3 text-[#E5B869]" />
                  <span>موضع الختمة: صـ {toArabicNumerals(khatmahPlan.currentPage)}</span>
                </button>
              )}

              {/* خيار تثبيت هذه الصفحة كموضع للختمة أثناء القراءة الحرة */}
              {!isKhatmahActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetKhatmahHere();
                  }}
                  id="mushaf-set-khatmah-here-btn"
                  className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all active:scale-95 cursor-pointer"
                  title="تثبيت هذه الصفحة كموضع لبدء ختمتك القرآنية"
                >
                  <BookmarkCheck className="w-3 h-3 text-emerald-400" />
                  <span>تثبيت للختمة</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNavPicker(true);
                }}
                id="mushaf-open-index-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E5B869]/20 hover:bg-[#E5B869]/30 border border-[#E5B869]/40 text-[#E5B869] font-bold text-xs transition-all active:scale-95 cursor-pointer"
                title="فهرس السور والأجزاء"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="font-scheherazade hidden sm:inline">فهرس المصحف</span>
              </button>

              {currentPage !== 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPage(1, 'prev');
                  }}
                  id="mushaf-quick-start-btn"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all cursor-pointer"
                  title="الانتقال إلى بداية المصحف (صفحة ١ - الفاتحة)"
                >
                  <span>بداية المصحف</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E5B869]" />
                </button>
              )}
            </div>

            {/* Center: Surah & Juz Badge */}
            <div className="flex flex-col items-center text-center">
              <span className="font-scheherazade font-bold text-sm sm:text-base text-[#E5B869] leading-tight">
                {surahsOnPage ? `سورة ${surahsOnPage}` : 'القرآن الكريم'}
              </span>
              <span className="text-[10px] text-white/70 font-scheherazade">
                {juzName} • الحزب {toArabicNumerals(currentHizb)}
              </span>
            </div>

            {/* Right: Tafsir, Lighting Filter, Bookmark & Close */}
            <div className="flex items-center gap-1">
              {/* Ayah Tafsir Page Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPageAyahsTafsirList(true);
                }}
                id="mushaf-open-page-tafsir-btn"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#E5B869]/20 hover:bg-[#E5B869]/35 border border-[#E5B869]/40 text-[#E5B869] text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                title="تفسير آيات هذه الصفحة"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">تفسير الصفحة</span>
              </button>

              {/* Paper Filter Button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFilterPicker(!showFilterPicker);
                  }}
                  id="mushaf-lighting-filter-btn"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-[#E5B869] transition-all cursor-pointer"
                  title="إضاءة ولون ورقة المصحف"
                >
                  <Palette className="w-4 h-4" />
                </button>

                {showFilterPicker && (
                  <div
                    className="absolute left-0 mt-2 z-50 w-52 p-2 rounded-2xl bg-[#18130B]/95 backdrop-blur-xl border border-[#E5B869]/40 text-white shadow-2xl space-y-1 animate-in zoom-in-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2 py-1 border-b border-white/10 text-[11px] text-[#E5B869] font-bold">
                      لون ورق المصحف والإضاءة
                    </div>
                    {[
                      { id: 'natural', label: 'الورقي الطبيعي (الأصلي)', color: '#FAF7EE' },
                      { id: 'warm', label: 'الورقي الدافئ (حماية العين)', color: '#F5ECD5' },
                      { id: 'dark', label: 'الوضع الليلي (AMOLED)', color: '#111111' },
                      { id: 'emerald', label: 'الأخضر النبوي (المدينة)', color: '#EDF6EE' },
                      { id: 'sepia', label: 'العتيق الكلاسيكي (Sepia)', color: '#EBDBC1' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaperFilter(f.id as PaperLightingFilter);
                          setShowFilterPicker(false);
                          try {
                            localStorage.setItem('nour_mushaf_paper_filter', f.id);
                          } catch {
                            // ignore
                          }
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                          paperFilter === f.id
                            ? 'bg-[#E5B869] text-[#1B2B20] font-bold'
                            : 'hover:bg-white/10 text-stone-200'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                          style={{ backgroundColor: f.color }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bookmark Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCurrentPageBookmark();
                }}
                id="mushaf-save-bookmark-btn"
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrentPageBookmarked
                    ? 'bg-[#E5B869] text-[#1B2B20] border-[#E5B869] shadow-md'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                }`}
                title={isCurrentPageBookmarked ? 'الصفحة محفوظة في العلامات' : 'حفظ فاصل القراءة لهذه الصفحة'}
              >
                {isCurrentPageBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>

              {/* Close / Hide Controls button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowControls(false);
                }}
                id="mushaf-hide-controls-btn"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-stone-300 hover:text-white transition-all cursor-pointer"
                title="إخفاء الأشرطة للقراءة الخاشعة"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CENTER STAGE: THE REAL PRINTED MADINAH MUSHAF PAGE (FITS SCREEN VIEWPORT HEIGHT 100%) */}
      <main
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-[100dvh] max-h-[100dvh] flex items-center justify-center p-0 m-0 overflow-hidden relative cursor-pointer touch-none"
        style={{
          perspective: '1200px'
        }}
      >
        {/* Real Mushaf Page Card (Aspect ratio 1:1.48, object-contain, fits viewport height exactly with NO scrolling) */}
        <div
          className={`h-[100dvh] max-h-[100dvh] max-w-full w-auto aspect-[1/1.48] ${currentFilter.canvasBg} relative shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-200 ${
            pageFlipAnim === 'next'
              ? 'animate-in slide-in-from-left-6 fade-in duration-200'
              : pageFlipAnim === 'prev'
              ? 'animate-in slide-in-from-right-6 fade-in duration-200'
              : ''
          }`}
          style={{
            transform: dragOffset ? `translateX(${dragOffset * 0.4}px) rotateY(${dragOffset * -0.05}deg)` : undefined
          }}
        >
          {/* Authentic Scanned High-Res Page Image */}
          {!imageError ? (
            <div className="w-full h-full flex items-center justify-center relative">
              {imageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF7EE]/90 z-10 space-y-3">
                  <div className="w-10 h-10 border-4 border-[#E5B869] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold font-scheherazade text-[#142E20]">
                    جاري فتح صفحة {toArabicNumerals(currentPage)} من المصحف الشريف...
                  </p>
                </div>
              )}
              <img
                src={getPageImageUrl(currentPage, cdnIndex)}
                alt={`مصحف المدينة المنورة - صفحة ${currentPage}`}
                className={`w-full h-full object-contain pointer-events-none select-none transition-all duration-300 ${currentFilter.imgFilter}`}
                onLoad={() => setImageLoading(false)}
                onError={handleImageError}
                draggable={false}
              />
            </div>
          ) : (
            /* Fallback Authentic Vector Layout */
            <div className="w-full h-full flex flex-col justify-between p-4 border-[6px] border-double border-[#C2822B] text-justify font-quran text-[#142E20]">
              <div className="flex items-center justify-between border-b border-[#C2822B]/40 pb-1 text-xs font-scheherazade font-bold">
                <span>{juzName}</span>
                <span>سورة {surahsOnPage}</span>
                <span>صفحة {toArabicNumerals(currentPage)}</span>
              </div>
              <div className="flex-1 my-auto flex flex-col justify-center text-center font-scheherazade text-xl sm:text-2xl leading-[2.2]">
                {pageData?.ayahs?.map((a) => (
                  <span key={a.numberInSurah} className="inline mx-1">
                    {a.text}{' '}
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E5B869] text-[#142E20] font-bold text-xs">
                      {toArabicNumerals(a.numberInSurah)}
                    </span>
                  </span>
                ))}
              </div>
              <div className="text-center font-bold text-xs border-t border-[#C2822B]/40 pt-1">
                — {toArabicNumerals(currentPage)} —
              </div>
            </div>
          )}
        </div>

        {/* Desktop Side Turn Buttons (Visible when controls shown or on hover) */}
        {currentPage > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPage(currentPage - 1, 'prev');
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            id="desktop-mushaf-prev-btn"
            className={`hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-[#E5B869] hover:text-white shadow-2xl items-center justify-center transition-all hover:scale-110 active:scale-95 z-30 cursor-pointer ${
              showControls ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            }`}
            title="الصفحة السابقة (نحو بداية المصحف يميناً)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {currentPage < 604 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPage(currentPage + 1, 'next');
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            id="desktop-mushaf-next-btn"
            className={`hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-[#E5B869] hover:text-white shadow-2xl items-center justify-center transition-all hover:scale-110 active:scale-95 z-30 cursor-pointer ${
              showControls ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            }`}
            title="الصفحة التالية (التقدم للأمام يساراً)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </main>

      {/* 3. BOTTOM CONTROL BAR (Fades out completely during reading) */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-50 w-full transition-all duration-300 transform ${
          showControls ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)',
          paddingLeft: 'max(env(safe-area-inset-left, 0px), 0px)',
          paddingRight: 'max(env(safe-area-inset-right, 0px), 0px)',
        }}
      >
        <div className="max-w-2xl mx-auto px-2 sm:px-4 pb-2.5 sm:pb-3">
          <div className="flex items-center justify-between gap-2 px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 text-white shadow-2xl">
            
            {/* Prev Page (Right in Arabic RTL - Towards Page 1) */}
            <button
              disabled={currentPage <= 1}
              onClick={(e) => {
                e.stopPropagation();
                goToPage(currentPage - 1, 'prev');
              }}
              id="footer-prev-page-btn"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 text-xs font-bold text-[#E5B869] transition-all active:scale-95 cursor-pointer"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابقة</span>
            </button>

            {/* Middle: Current Page Pill & Tafsir Button */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNavPicker(true);
                }}
                id="footer-page-pill-btn"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-[#E5B869]/40 text-xs font-mono font-bold text-[#E5B869] transition-all active:scale-95 cursor-pointer"
                title="اضغط للانتقال المباشر لأي صفحة أو سورة"
              >
                {isKhatmahActive ? (
                  <span className="flex items-center gap-1 text-emerald-300">
                    <Flame className="w-3 h-3 text-[#E5B869]" />
                    <span>ورد الختمة: صـ {toArabicNumerals(currentPage)}</span>
                  </span>
                ) : (
                  <span>صفحة {toArabicNumerals(currentPage)} من ٦٠٤</span>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPageAyahsTafsirList(true);
                }}
                id="footer-open-tafsir-pill-btn"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E5B869]/20 hover:bg-[#E5B869]/35 border border-[#E5B869]/50 text-xs font-bold text-[#E5B869] transition-all active:scale-95 cursor-pointer"
                title="تفسير آيات هذه الصفحة"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>التفسير</span>
              </button>
            </div>

            {/* Next Page (Left in Arabic RTL - Towards Page 604) */}
            <button
              disabled={currentPage >= 604}
              onClick={(e) => {
                e.stopPropagation();
                goToPage(currentPage + 1, 'next');
              }}
              id="footer-next-page-btn"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 text-xs font-bold text-[#E5B869] transition-all active:scale-95 cursor-pointer"
              title="الصفحة التالية"
            >
              <span>التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* 4. MODAL: MUSHAF SURAH INDEX & PAGE PICKER */}
      {showNavPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowNavPicker(false)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-[#142E20] border border-[#274834] text-white shadow-2xl overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#274834] flex items-center justify-between bg-[#102318]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#E5B869]" />
                <h3 className="font-scheherazade font-bold text-lg text-amber-100">فهرس المصحف الشريف</h3>
              </div>
              <button
                onClick={() => setShowNavPicker(false)}
                className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions: Start of Quran & Direct Page Input */}
            <div className="p-4 space-y-3 bg-[#12271B] border-b border-[#274834]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => goToPage(1, 'prev')}
                  id="picker-go-to-start-btn"
                  className="p-2.5 rounded-2xl bg-[#E5B869]/20 hover:bg-[#E5B869]/30 border border-[#E5B869]/40 text-[#E5B869] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>بداية المصحف (صفحة ١ - الفاتحة)</span>
                </button>

                <button
                  onClick={() => goToPage(604, 'next')}
                  id="picker-go-to-end-btn"
                  className="p-2.5 rounded-2xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-600/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>ختام المصحف (صفحة ٦٠٤ - الناس)</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Page Input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="604"
                  placeholder="اكتب رقم الصفحة (1 - 604)..."
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && pageInput) {
                      const p = parseInt(pageInput, 10);
                      if (p >= 1 && p <= 604) goToPage(p);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#1A3828] border border-[#2D4536] text-white text-xs placeholder-stone-400 focus:outline-none focus:border-[#E5B869] text-right"
                />
                <button
                  onClick={() => {
                    const p = parseInt(pageInput, 10);
                    if (p >= 1 && p <= 604) goToPage(p);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#E5B869] text-[#142E20] font-bold text-xs hover:bg-[#D99A45] transition-all"
                >
                  انتقال
                </button>
              </div>

              {/* Surah Filter Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث باسم السورة (مثلاً: الكهف، يس، الملك)..."
                  value={searchSurahQuery}
                  onChange={(e) => setSearchSurahQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A3828] border border-[#2D4536] text-white text-xs placeholder-stone-400 focus:outline-none focus:border-[#E5B869] text-right"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Surahs Scrollable List */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[45vh]">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => goToPage(surah.pageStart)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-right transition-all ${
                    currentPage >= surah.pageStart &&
                    currentPage < (SURAHS_LIST[surah.number]?.pageStart || 605)
                      ? 'bg-[#E5B869]/25 border-[#E5B869] text-amber-100 font-bold'
                      : 'bg-[#183324] hover:bg-[#204430] border-[#274834] text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center font-mono text-xs text-[#E5B869]">
                      {surah.number}
                    </span>
                    <span className="font-scheherazade text-sm font-bold">سورة {surah.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#E5B869]">
                    ص {toArabicNumerals(surah.pageStart)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: PAGE AYAHS TAFSIR PICKER */}
      {showPageAyahsTafsirList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowPageAyahsTafsirList(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-[#142E20] border border-[#274834] text-white shadow-2xl overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#274834] flex items-center justify-between bg-[#102318]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-[#1A3828] text-[#E5B869] border border-[#274834]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-scheherazade font-bold text-lg text-amber-100">
                    تفسير آيات الصفحة {toArabicNumerals(currentPage)}
                  </h3>
                  <p className="text-[11px] text-stone-300">
                    {surahsOnPage ? `سورة ${surahsOnPage}` : 'القرآن الكريم'} • اختر أي آية لعرض تفسيرها المعتمد
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPageAyahsTafsirList(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Ayahs */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {pageData?.ayahs && pageData.ayahs.length > 0 ? (
                pageData.ayahs.map((ayah) => {
                  const sNum = ayah.surah.number;
                  const aNum = ayah.numberInSurah;
                  const sName = ayah.surah.name.replace(/^سُورَةُ\s*/, '');
                  const isCopied = copiedAyah === aNum;

                  return (
                    <div
                      key={ayah.number}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#183324] border border-[#274834] hover:border-[#E5B869]/50 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-[#142E20] border border-[#274834] text-[#E5B869] font-mono text-xs font-bold">
                            آية {toArabicNumerals(aNum)}
                          </span>
                          <span className="font-scheherazade font-bold text-sm text-amber-200">
                            سورة {sName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyAyah(ayah)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer text-xs"
                            title="نسخ الآية"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => {
                              playAyah(sNum, aNum, sName);
                            }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#E5B869] transition-colors cursor-pointer text-xs flex items-center gap-1"
                            title="استماع للآية"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="font-scheherazade text-base sm:text-lg text-stone-100 leading-relaxed text-right">
                        ﴿ {ayah.text} ﴾
                      </p>

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            setTafsirTarget({
                              surah: sNum,
                              ayah: aNum,
                              text: ayah.text
                            });
                            setShowPageAyahsTafsirList(false);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E5B869] hover:bg-[#D99A45] text-[#142E20] font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>عرض تفسير الآية</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-stone-300 space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-[#E5B869]/60" />
                  <p className="text-sm">جاري تجهيز آيات الصفحة...</p>
                </div>
              )}
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
          onNavigateAyah={(newAyah) => {
            const foundAyah = pageData?.ayahs.find(a => a.surah.number === tafsirTarget.surah && a.numberInSurah === newAyah);
            if (foundAyah) {
              setTafsirTarget({
                surah: foundAyah.surah.number,
                ayah: foundAyah.numberInSurah,
                text: foundAyah.text
              });
            } else {
              setTafsirTarget(prev => prev ? { ...prev, ayah: newAyah, text: `الآية ${newAyah}` } : null);
            }
          }}
        />
      )}
    </div>
  );
};
