import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  Sun, 
  Moon, 
  Volume2, 
  Download, 
  Sparkles,
  Type
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { SURAHS_LIST } from '../data/surahs';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  fontSize: number;
  setFontSize: (val: number | ((prev: number) => number)) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  lastRead: { surahNumber: number; ayahNumber: number; surahName: string } | null;
  onResumeReading: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  fontSize,
  setFontSize,
  onOpenSearch,
  onOpenBookmarks,
  lastRead,
  onResumeReading
}) => {
  const { isPlaying, activeSurah, activeAyahNumber, setIsFullPlayerOpen } = useAudio();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showFontMenu, setShowFontMenu] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('لتثبيت تطبيق "طريق الهدى" على هاتفك، اضغط على خيارات المتصفح ثم "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const activeSurahMeta = activeSurah ? SURAHS_LIST.find((s) => s.number === activeSurah) : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2D4536] bg-[#1B3022]/95 dark:bg-[#101F14]/95 backdrop-blur-md text-[#E0E7E1] shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#142419] to-[#0A120D] border border-[#E9B161]/50 p-1 flex items-center justify-center shadow-md shadow-[#1B3022]/60 shrink-0 overflow-hidden">
            <img src="/icon.svg" alt="الكعبة المشرفة - طريق الهدى" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-lg sm:text-xl tracking-wide text-white font-scheherazade">طَرِيقُ الهُدَى</h1>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2D4536] border border-[#3D5A47] text-[#E9B161] font-semibold">
                القرآن الكريم
              </span>
            </div>
            <p className="text-[11px] text-[#A8BCAD] hidden sm:block">المنصة القرآنية والإسلامية الشاملة</p>
          </div>
        </div>

        {/* Center: Last Read shortcut & Playing Status (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-3">
          {lastRead && (
            <button
              onClick={onResumeReading}
              id="resume-reading-nav-btn"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#2D4536]/80 hover:bg-[#2D4536] border border-[#3D5A47] text-[#E0E7E1] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#E9B161]" />
              <span>متابعة القراءة: <strong className="text-white font-semibold">سورة {lastRead.surahName}</strong> (آية {lastRead.ayahNumber})</span>
            </button>
          )}

          {isPlaying && activeSurahMeta && (
            <button
              onClick={() => setIsFullPlayerOpen(true)}
              id="active-audio-indicator-btn"
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl bg-[#E9B161]/20 border border-[#E9B161]/50 text-[#E9B161] hover:bg-[#E9B161]/30 transition-colors animate-pulse"
            >
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-1 bg-[#E9B161] rounded-full animate-eq-1"></span>
                <span className="w-1 bg-[#E9B161] rounded-full animate-eq-2"></span>
                <span className="w-1 bg-[#E9B161] rounded-full animate-eq-3"></span>
              </div>
              <span>جاري تلاوة سورة {activeSurahMeta.name}</span>
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            id="nav-search-button"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#2D4536]/70 hover:bg-[#2D4536] border border-[#3D5A47] text-[#E0E7E1] hover:text-white flex items-center gap-2 text-xs transition-colors"
            title="البحث في القرآن الكريم"
          >
            <Search className="w-4 h-4 text-[#E9B161]" />
            <span className="hidden lg:inline text-xs text-[#A8BCAD]">بحث في القرآن...</span>
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            id="nav-bookmarks-button"
            className="p-2 rounded-xl bg-[#2D4536]/70 hover:bg-[#2D4536] border border-[#3D5A47] text-[#E0E7E1] hover:text-[#E9B161] transition-colors"
            title="العلامات المرجعية والمفضلة"
          >
            <Bookmark className="w-4 h-4 text-[#E9B161]" />
          </button>

          {/* Font Scaling Control */}
          <div className="relative">
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              id="nav-font-size-toggle"
              className="p-2 rounded-xl bg-[#2D4536]/70 hover:bg-[#2D4536] border border-[#3D5A47] text-[#E0E7E1] hover:text-white transition-colors flex items-center gap-1"
              title="حجم خط المصحف"
            >
              <Type className="w-4 h-4 text-[#E9B161]" />
              <span className="text-[11px] font-mono hidden sm:inline">{fontSize}</span>
            </button>

            {showFontMenu && (
              <div 
                className="absolute left-0 mt-2 w-48 p-3 rounded-2xl bg-[#1B3022] border border-[#3D5A47] shadow-2xl z-50 text-[#E0E7E1]"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs font-semibold mb-2 text-[#E9B161]">حجم خط القراءة: {fontSize}px</p>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setFontSize((s) => Math.max(18, s - 2))}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#2D4536] border border-[#3D5A47] text-xs hover:bg-[#3D5A47] text-center font-bold"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize(24)}
                    className="py-1 px-2 rounded-lg bg-[#2D4536] border border-[#3D5A47] text-xs hover:bg-[#3D5A47] text-center"
                  >
                    افتراضي
                  </button>
                  <button
                    onClick={() => setFontSize((s) => Math.min(42, s + 2))}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#2D4536] border border-[#3D5A47] text-xs hover:bg-[#3D5A47] text-center font-bold"
                  >
                    A+
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            id="nav-theme-toggle"
            className="p-2 rounded-xl bg-[#2D4536]/70 hover:bg-[#2D4536] border border-[#3D5A47] text-[#E9B161] hover:text-white transition-colors"
            title={darkMode ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-[#E9B161]" /> : <Moon className="w-4 h-4 text-[#E0E7E1]" />}
          </button>

          {/* PWA Install Button */}
          <button
            onClick={handleInstallPWA}
            id="nav-install-pwa"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] text-xs font-bold shadow-md transition-all"
            title="تثبيت التطبيق"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت التطبيق</span>
          </button>
        </div>
      </div>
    </header>
  );
};
