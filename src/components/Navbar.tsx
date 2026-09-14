import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  Sun, 
  Moon, 
  Download, 
  Type, 
  HardDrive, 
  WifiOff, 
  ShieldCheck, 
  Heart,
  Palette
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { SURAHS_LIST } from '../data/surahs';
import { checkIsAppInstalled, markAppAsInstalled, promptDirectInstall } from '../utils/pwaUtils';
import { InstallAppModal } from './InstallAppModal';
import { ThemeMode } from '../types';

interface NavbarProps {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  onOpenThemeModal?: () => void;
  onOpenPermissions?: () => void;
  fontSize: number;
  setFontSize: (val: number | ((prev: number) => number)) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  onOpenAdmin?: () => void;
  onOpenDedication?: () => void;
  onNavigateHome?: () => void;
  lastRead: { surahNumber: number; ayahNumber: number; surahName: string } | null;
  onResumeReading: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  themeMode,
  setThemeMode,
  onOpenThemeModal,
  onOpenPermissions,
  fontSize,
  setFontSize,
  onOpenSearch,
  onOpenBookmarks,
  onOpenAdmin,
  onOpenDedication,
  onNavigateHome,
  lastRead,
  onResumeReading
}) => {
  const { isPlaying, activeSurah, setIsFullPlayerOpen, isOffline, setIsOfflineModalOpen } = useAudio();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(() => checkIsAppInstalled());

  // Discreet owner secret trigger: Triple tap on the logo opens Admin Panel
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 600) {
      const newCount = logoClickCount + 1;
      setLogoClickCount(newCount);
      if (newCount >= 3) {
        setLogoClickCount(0);
        if (onOpenAdmin) onOpenAdmin();
        return;
      }
    } else {
      setLogoClickCount(1);
    }
    setLastClickTime(now);
    onNavigateHome();
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      markAppAsInstalled();
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    const handleCustomInstallStatus = () => {
      setIsAppInstalled(checkIsAppInstalled());
    };

    const handleWindowClick = () => {
      setShowFontMenu(false);
      setShowThemeMenu(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('app_installed_status_change', handleCustomInstallStatus);
    window.addEventListener('click', handleWindowClick);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('app_installed_status_change', handleCustomInstallStatus);
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  const handleInstallClick = async () => {
    try {
      const res = await promptDirectInstall();
      if (res === 'accepted') {
        setIsAppInstalled(true);
        return;
      }
    } catch (e) {
      console.warn('Direct install prompt exception:', e);
    }
    setIsInstallModalOpen(true);
  };

  const activeSurahMeta = activeSurah ? SURAHS_LIST.find((s) => s.number === activeSurah) : null;

  return (
    <header 
      className="sticky top-0 z-50 w-full max-w-full border-b border-[#2D4536] bg-[#18291F]/95 backdrop-blur-md text-[#E0E7E1] shadow-sm transition-colors duration-200 select-none pt-safe"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0px)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand / Logo */}
        <button 
          onClick={handleLogoClick}
          className="flex items-center gap-2 sm:gap-3 text-right hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
          title="العودة للصفحة الرئيسية"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#142419] to-[#0A120D] border border-[#E9B161]/50 p-1 flex items-center justify-center shadow-md shadow-[#1B3022]/60 shrink-0 overflow-hidden">
            <img src="/icon.svg" alt="الكعبة المشرفة - طريق الهدى" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-[#E9B161] tracking-wide font-scheherazade">
                طريق الهدى
              </h1>
              <span className="text-[9px] bg-[#E9B161]/20 text-[#E9B161] border border-[#E9B161]/40 px-1.5 py-0.2 rounded-full font-bold">
                الرئيسية
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#A8BCAD] hidden sm:block">المنصة القرآنية والإسلامية الشاملة</p>
          </div>
        </button>

        {/* Center: Last Read shortcut & Dedication button (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Dedication Noble Button */}
          {onOpenDedication && (
            <button
              onClick={onOpenDedication}
              id="navbar-dedication-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#E9B161]/15 hover:bg-[#E9B161]/25 border border-[#E9B161]/40 text-[#E9B161] transition-all shadow-sm active:scale-95"
              title="صدقة جارية عن روح المرحوم حسين الدسوقي رجب والمرحومة وجيهة عبدالجواد سكر وجميع موتى المسلمين"
            >
              <Heart className="w-3.5 h-3.5 fill-[#E9B161]" />
              <span>صدقة جارية</span>
            </button>
          )}

          {lastRead && (
            <button
              onClick={onResumeReading}
              id="resume-reading-nav-btn"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#2D4536]/80 dark:bg-[#1A1A1A] hover:bg-[#2D4536] border border-[#3D5A47] dark:border-[#333] text-[#E0E7E1] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#E9B161]" />
              <span>متابعة: <strong className="text-white font-semibold">سورة {lastRead.surahName}</strong> (آية {lastRead.ayahNumber})</span>
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
          {/* Mobile Dedication Heart */}
          {onOpenDedication && (
            <button
              onClick={onOpenDedication}
              className="md:hidden p-2 rounded-xl bg-[#E9B161]/15 text-[#E9B161] border border-[#E9B161]/40"
              title="صدقة جارية"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          )}

          {/* Offline Audio & Adhan Manager */}
          <button
            onClick={() => setIsOfflineModalOpen(true)}
            id="nav-offline-manager-button"
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-1.5 text-xs transition-all ${
              isOffline
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
                : 'bg-[#2D4536]/70 dark:bg-[#1A1A1A] hover:bg-[#2D4536] border-[#3D5A47] dark:border-[#333] text-[#E0E7E1] hover:text-white'
            }`}
            title="إدارة الاستماع والأذان بدون إنترنت"
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <HardDrive className="w-3.5 h-3.5 text-[#E9B161]" />}
            <span className="hidden sm:inline font-bold">
              {isOffline ? 'وضع بدون نت' : 'التحميل بدون نت'}
            </span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            id="nav-search-button"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#2D4536]/70 dark:bg-[#1A1A1A] hover:bg-[#2D4536] border border-[#3D5A47] dark:border-[#333] text-[#E0E7E1] hover:text-white flex items-center gap-2 text-xs transition-colors"
            title="البحث في القرآن الكريم"
          >
            <Search className="w-4 h-4 text-[#E9B161]" />
            <span className="hidden lg:inline text-xs text-[#A8BCAD]">بحث في القرآن...</span>
          </button>

          {/* Permissions / Privacy Access */}
          {onOpenPermissions && (
            <button
              onClick={onOpenPermissions}
              id="nav-permissions-button"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#2D4536]/70 dark:bg-[#1A1A1A] hover:bg-[#2D4536] border border-[#3D5A47] dark:border-[#333] text-[#E0E7E1] hover:text-[#E9B161] flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
              title="إدارة الأذونات (الموقع، الإشعارات، الصوت)"
            >
              <ShieldCheck className="w-4 h-4 text-[#E9B161]" />
              <span className="hidden md:inline text-xs font-semibold text-[#E0E7E1]">الأذونات</span>
            </button>
          )}

          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            id="nav-bookmarks-button"
            className="p-2 rounded-xl bg-[#2D4536]/70 dark:bg-[#1A1A1A] hover:bg-[#2D4536] border border-[#3D5A47] dark:border-[#333] text-[#E0E7E1] hover:text-[#E9B161] transition-colors"
            title="العلامات المرجعية والمفضلة"
          >
            <Bookmark className="w-4 h-4 text-[#E9B161]" />
          </button>

          {/* Font Scaling Control */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFontMenu(!showFontMenu);
                setShowThemeMenu(false);
              }}
              id="nav-font-size-toggle"
              className="p-2 rounded-xl bg-[#2D4536]/70 dark:bg-[#1A1A1A] hover:bg-[#2D4536] border border-[#3D5A47] dark:border-[#333] text-[#E0E7E1] hover:text-white transition-colors flex items-center gap-1"
              title="حجم خط المصحف"
            >
              <Type className="w-4 h-4 text-[#E9B161]" />
              <span className="text-[11px] font-mono hidden sm:inline">{fontSize}</span>
            </button>

            {showFontMenu && (
              <div 
                className="absolute left-0 mt-2 w-48 p-3 rounded-2xl bg-[#1B3022] dark:bg-[#151515] border border-[#3D5A47] dark:border-[#333] shadow-2xl z-50 text-[#E0E7E1]"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-xs font-semibold mb-2 text-[#E9B161]">حجم خط القراءة: {fontSize}px</p>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setFontSize((s) => Math.max(18, s - 2))}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#2D4536] dark:bg-[#222] border border-[#3D5A47] dark:border-[#333] text-xs hover:bg-[#3D5A47] text-center font-bold"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize(24)}
                    className="py-1 px-2 rounded-lg bg-[#2D4536] dark:bg-[#222] border border-[#3D5A47] dark:border-[#333] text-xs hover:bg-[#3D5A47] text-center"
                  >
                    افتراضي
                  </button>
                  <button
                    onClick={() => setFontSize((s) => Math.min(42, s + 2))}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#2D4536] dark:bg-[#222] border border-[#3D5A47] dark:border-[#333] text-xs hover:bg-[#3D5A47] text-center font-bold"
                  >
                    A+
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Mode Selector (محدد الألوان والثيمات الشامل) */}
          <div className="relative">
            <button
              onClick={() => {
                if (onOpenThemeModal) {
                  onOpenThemeModal();
                } else {
                  setShowThemeMenu(!showThemeMenu);
                  setShowFontMenu(false);
                }
              }}
              id="nav-theme-toggle"
              className="p-2 rounded-xl bg-[#2D4536]/70 dark:bg-[#1A1A1A] hover:bg-[#2D4536] border border-[#3D5A47] dark:border-[#333] text-[#E9B161] hover:text-white transition-colors flex items-center gap-1"
              title="تغيير ثيم الإضاءة والألوان"
            >
              {themeMode === 'pitch_black' ? (
                <Moon className="w-4 h-4 text-cyan-400 fill-current" />
              ) : themeMode === 'royal_purple' ? (
                <Palette className="w-4 h-4 text-purple-400" />
              ) : themeMode === 'midnight_navy' ? (
                <Moon className="w-4 h-4 text-sky-400" />
              ) : themeMode === 'warm_amber' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : themeMode === 'pure_white' || themeMode === 'light' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Palette className="w-4 h-4 text-[#E9B161]" />
              )}
            </button>

            {showThemeMenu && (
              <div 
                className="absolute left-0 mt-2 w-64 p-2.5 rounded-2xl bg-[#142419] dark:bg-[#121212] border border-[#2D4536] dark:border-[#333333] shadow-2xl z-50 text-right space-y-1.5 animate-fadeIn max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-2 py-1 border-b border-[#2D4536] dark:border-[#262626] mb-1">
                  <div>
                    <p className="text-xs font-bold text-[#E9B161]">ألوان وثيمات التطبيق</p>
                    <p className="text-[10px] text-[#A8BCAD]">اختر مظهر القراءة المفضل</p>
                  </div>
                  {onOpenThemeModal && (
                    <button
                      onClick={() => {
                        setShowThemeMenu(false);
                        onOpenThemeModal();
                      }}
                      className="px-2 py-1 rounded-lg bg-[#E9B161]/20 hover:bg-[#E9B161]/30 text-[#E9B161] text-[10px] font-bold transition-all border border-[#E9B161]/40"
                    >
                      عرض الكل
                    </button>
                  )}
                </div>

                {/* 1. Emerald Dark Balanced (Default) */}
                <button
                  onClick={() => {
                    setThemeMode('emerald');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    themeMode === 'emerald'
                      ? 'bg-[#223528] border border-[#E9B161] text-[#E9B161] shadow-sm'
                      : 'hover:bg-[#223528]/60 text-[#E0E7E1]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#15231A] border border-[#E9B161]"></div>
                    <span>الزمردي الإسلامي (مريح)</span>
                  </div>
                  {themeMode === 'emerald' && <span className="text-[10px] text-[#E9B161]">✓ نشط</span>}
                </button>

                {/* 2. Dark Night Comfort (AMOLED) */}
                <button
                  onClick={() => {
                    setThemeMode('pitch_black');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    themeMode === 'pitch_black'
                      ? 'bg-[#18241C] border border-[#E9B161] text-[#E9B161] shadow-sm'
                      : 'hover:bg-[#18241C]/60 text-[#E0E7E1]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#000000] border border-stone-500"></div>
                    <span>السواد الليلي (AMOLED)</span>
                  </div>
                  {themeMode === 'pitch_black' && <span className="text-[10px] text-[#E9B161]">✓ نشط</span>}
                </button>

                {/* 3. Royal Purple */}
                <button
                  onClick={() => {
                    setThemeMode('royal_purple');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    themeMode === 'royal_purple'
                      ? 'bg-[#241442] border border-[#C084FC] text-[#C084FC] shadow-sm'
                      : 'hover:bg-[#1C0F33]/70 text-[#E0E7E1]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#090414] border border-[#C084FC]"></div>
                    <span>البنفسجي الملكي</span>
                  </div>
                  {themeMode === 'royal_purple' && <span className="text-[10px] text-[#C084FC]">✓ نشط</span>}
                </button>

                {/* 4. Midnight Navy */}
                <button
                  onClick={() => {
                    setThemeMode('midnight_navy');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    themeMode === 'midnight_navy'
                      ? 'bg-[#1E293B] border border-[#38BDF8] text-[#38BDF8] shadow-sm'
                      : 'hover:bg-[#0F172A]/70 text-[#E0E7E1]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#070D18] border border-[#38BDF8]"></div>
                    <span>الكحلي الليلي (Navy)</span>
                  </div>
                  {themeMode === 'midnight_navy' && <span className="text-[10px] text-[#38BDF8]">✓ نشط</span>}
                </button>

                {/* 5. Warm Amber Parchment */}
                <button
                  onClick={() => {
                    setThemeMode('warm_amber');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    themeMode === 'warm_amber'
                      ? 'bg-[#3D2D1C] border border-[#F59E0B] text-[#F59E0B] shadow-sm'
                      : 'hover:bg-[#291E13]/70 text-[#E0E7E1]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#1C150D] border border-[#F59E0B]"></div>
                    <span>الورقي الدافئ (Amber)</span>
                  </div>
                  {themeMode === 'warm_amber' && <span className="text-[10px] text-[#F59E0B]">✓ نشط</span>}
                </button>

                {/* 6. Pure White */}
                <button
                  onClick={() => {
                    setThemeMode('pure_white');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    themeMode === 'pure_white'
                      ? 'bg-[#E2E8F0] border border-slate-700 text-slate-900 shadow-sm'
                      : 'hover:bg-slate-800/40 text-[#E0E7E1]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FFFFFF] border border-slate-400"></div>
                    <span>الأبيض الصافي (Paper)</span>
                  </div>
                  {themeMode === 'pure_white' && <span className="text-[10px] text-slate-900">✓ نشط</span>}
                </button>

                {/* 7. Light Fresh */}
                <button
                  onClick={() => {
                    setThemeMode('light');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    themeMode === 'light'
                      ? 'bg-[#EBF1ED] border border-[#1B3022] text-[#1B3022] shadow-sm'
                      : 'hover:bg-stone-800/40 text-[#E0E7E1]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#F4F7F5] border border-stone-400"></div>
                    <span>النهاري المنعش (Light)</span>
                  </div>
                  {themeMode === 'light' && <span className="text-[10px] text-[#1B3022]">✓ نشط</span>}
                </button>
              </div>
            )}
          </div>

          {/* PWA Install Button (Hidden if already installed) */}
          {!isAppInstalled && (
            <button
              onClick={handleInstallClick}
              id="nav-install-pwa"
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-full bg-gradient-to-r from-[#E9B161] to-[#D99A45] hover:brightness-110 active:scale-95 text-[#1B3022] text-xs font-bold shadow-md shadow-[#E9B161]/20 transition-all border border-[#E9B161]"
              title="تثبيت التطبيق على الهاتف"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold hidden sm:inline">تثبيت</span>
            </button>
          )}
        </div>
      </div>

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallPromptSuccess={() => setDeferredPrompt(null)}
      />
    </header>
  );
};
