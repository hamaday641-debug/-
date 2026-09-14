import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { AudioProvider, useAudio } from './context/AudioContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { QuranReader } from './components/QuranReader';
import { QuranReadingView } from './components/QuranReadingView';
import { KhatmahTracker } from './components/KhatmahTracker';
import { RecitersDirectory } from './components/RecitersDirectory';
import { AdhkarView } from './components/AdhkarView';
import { DuasHadithView } from './components/DuasHadithView';
import { PrayerTimesQibla } from './components/PrayerTimesQibla';
import { DigitalTasbih } from './components/DigitalTasbih';
import { LecturesView } from './components/LecturesView';
import { AIScholarView } from './components/AIScholarView';
import { HajjUmrahHaramainView } from './components/HajjUmrahHaramainView';
import { ProphetsStoriesView } from './components/ProphetsStoriesView';
import { TajweedGuideView } from './components/TajweedGuideView';
import { QuranTasmeeView } from './components/QuranTasmeeView';
import { HomeHubView } from './components/HomeHubView';
import { SearchModal } from './components/SearchModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { OfflineManagerModal } from './components/OfflineManagerModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { TributeDedicationModal } from './components/TributeDedicationModal';
import { ThemeModal } from './components/ThemeModal';
import { PermissionsModal } from './components/PermissionsModal';
import { recordAppVisit } from './services/analytics';
import { adhanScheduler } from './services/adhanScheduler';
import { requestPersistentStorage } from './services/offlineAudioService';
import { AdhanPlayerModal } from './components/AdhanPlayerModal';
import { ActiveTab, Bookmark, ThemeMode } from './types';
import { SURAHS_LIST } from './data/surahs';

const AppContent: React.FC = () => {
  const { isOfflineModalOpen, setIsOfflineModalOpen, isOffline } = useAudio();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isDedicationModalOpen, setIsDedicationModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  // Auto-prompt permissions and ensure persistent storage on first app entry
  useEffect(() => {
    requestPersistentStorage().catch(() => {});
    try {
      const prompted = localStorage.getItem('nour_permissions_prompted');
      if (!prompted) {
        const timer = setTimeout(() => {
          setIsPermissionsModalOpen(true);
        }, 750);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Track visits on load and tab change
  useEffect(() => {
    recordAppVisit(activeTab);
  }, [activeTab]);

  // Enhanced Theme Mode with 7 distinct palettes
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('nour_theme_mode') as ThemeMode;
      const validThemes: ThemeMode[] = ['emerald', 'pitch_black', 'royal_purple', 'midnight_navy', 'warm_amber', 'pure_white', 'light'];
      if (saved && validThemes.includes(saved)) {
        return saved;
      }
      const legacyDark = localStorage.getItem('nour_dark_mode');
      if (legacyDark !== null) {
        return JSON.parse(legacyDark) ? 'emerald' : 'light';
      }
      return 'emerald'; // Default elegant deep theme
    } catch {
      return 'emerald';
    }
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nour_font_size');
      return saved ? parseInt(saved) : 24;
    } catch {
      return 24;
    }
  });

  // Selected Surah/Ayah when navigating from search or bookmarks
  const [selectedSurahForReader, setSelectedSurahForReader] = useState<number | undefined>(undefined);
  const [selectedAyahForReader, setSelectedAyahForReader] = useState<number | undefined>(undefined);
  const [readingPage, setReadingPage] = useState<number | undefined>(undefined);
  const [isReadingFromKhatmah, setIsReadingFromKhatmah] = useState<boolean>(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [globalAdhanModal, setGlobalAdhanModal] = useState<{
    isOpen: boolean;
    prayerName: string;
    adhanId: string;
  }>({
    isOpen: false,
    prayerName: 'الصلاة',
    adhanId: 'makkah_ali_mulla'
  });

  // Pre-Prayer 15-min Alert Toast
  const [prePrayerAlertToast, setPrePrayerAlertToast] = useState<{
    show: boolean;
    prayerName: string;
    minutes: number;
    prevPrayerName: string;
  } | null>(null);

  // Initialize Global Background Adhan Scheduler
  useEffect(() => {
    adhanScheduler.init();

    const unsubscribeAdhan = adhanScheduler.subscribe((prayerKey, prayerName, adhanId) => {
      setGlobalAdhanModal({
        isOpen: true,
        prayerName,
        adhanId
      });
    });

    const unsubscribePreAlert = adhanScheduler.subscribePrePrayerAlert((prayerKey, prayerName, minutes, prevPrayerName) => {
      setPrePrayerAlertToast({
        show: true,
        prayerName,
        minutes,
        prevPrayerName
      });
    });

    return () => {
      unsubscribeAdhan();
      unsubscribePreAlert();
    };
  }, []);

  // Last read tracking
  const [lastRead, setLastRead] = useState<{ surahNumber: number; ayahNumber: number; surahName: string; page?: number } | null>(() => {
    try {
      const saved = localStorage.getItem('nour_last_read');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Handle URL query parameters and Service Worker notification clicks (e.g. ?action=play_adhan)
  useEffect(() => {
    const handleUrlAction = () => {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      if (params.has('admin') || params.has('owner') || params.has('stats') || params.has('hamada')) {
        setIsAdminDashboardOpen(true);
      }
      if (action === 'play_adhan') {
        const prayerName = params.get('prayer') || 'الصلاة';
        const adhanId = params.get('adhanId') || 'makkah_ali_mulla';
        setActiveTab('prayers');
        setGlobalAdhanModal({
          isOpen: true,
          prayerName,
          adhanId
        });
        // Clean URL query without refreshing
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleUrlAction();

    // Listen for messages from Service Worker when notification is clicked
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TRIGGER_ADHAN_FROM_NOTIFICATION') {
        const prayerName = event.data.prayerLabel || 'الصلاة';
        const adhanId = event.data.adhanId || 'makkah_ali_mulla';
        setActiveTab('prayers');
        setGlobalAdhanModal({
          isOpen: true,
          prayerName,
          adhanId
        });
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, []);

  // Sync theme with <html> element and body
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'dark', 
      'theme-pitch-black', 
      'theme-emerald', 
      'theme-royal-purple', 
      'theme-midnight-navy', 
      'theme-warm-amber', 
      'theme-pure-white'
    );
    
    if (themeMode === 'pitch_black') {
      root.classList.add('dark', 'theme-pitch-black');
      document.body.style.backgroundColor = '#000000';
    } else if (themeMode === 'royal_purple') {
      root.classList.add('dark', 'theme-royal-purple');
      document.body.style.backgroundColor = '#090414';
    } else if (themeMode === 'midnight_navy') {
      root.classList.add('dark', 'theme-midnight-navy');
      document.body.style.backgroundColor = '#070D18';
    } else if (themeMode === 'warm_amber') {
      root.classList.add('dark', 'theme-warm-amber');
      document.body.style.backgroundColor = '#1C150D';
    } else if (themeMode === 'pure_white') {
      root.classList.add('theme-pure-white');
      document.body.style.backgroundColor = '#FFFFFF';
    } else if (themeMode === 'emerald') {
      root.classList.add('dark', 'theme-emerald');
      document.body.style.backgroundColor = '#15231A';
    } else {
      document.body.style.backgroundColor = '#F4F7F5';
    }

    try {
      localStorage.setItem('nour_theme_mode', themeMode);
      localStorage.setItem('nour_dark_mode', JSON.stringify(themeMode !== 'light' && themeMode !== 'pure_white'));
    } catch {
      // ignore
    }
  }, [themeMode]);

  // Sync font size
  useEffect(() => {
    try {
      localStorage.setItem('nour_font_size', String(fontSize));
    } catch {
      // ignore
    }
  }, [fontSize]);

  const refreshLastRead = () => {
    try {
      const saved = localStorage.getItem('nour_last_read');
      if (saved) setLastRead(JSON.parse(saved));
    } catch {
      // ignore
    }
  };

  const handleOpenQuranAt = (surahNum: number, ayahNum = 1) => {
    const surahMeta = SURAHS_LIST.find(s => s.number === surahNum);
    const targetPage = surahMeta?.pageStart || 1;
    setReadingPage(targetPage);
    setSelectedSurahForReader(surahNum);
    setSelectedAyahForReader(ayahNum);
    setActiveTab('reading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReadingAtPage = (page: number, fromKhatmah: boolean = false) => {
    setReadingPage(page);
    setIsReadingFromKhatmah(fromKhatmah);
    setActiveTab('reading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeReading = () => {
    if (lastRead) {
      if (lastRead.page) {
        setReadingPage(lastRead.page);
        setActiveTab('reading');
      } else {
        handleOpenQuranAt(lastRead.surahNumber, lastRead.ayahNumber);
      }
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'reading') {
      setIsReadingFromKhatmah(false);
      try {
        const savedLast = localStorage.getItem('nour_last_read');
        if (savedLast) {
          const parsed = JSON.parse(savedLast);
          if (parsed.page && parsed.page >= 1 && parsed.page <= 604) {
            setReadingPage(parsed.page);
          }
        } else {
          const saved = localStorage.getItem('tareeq_reading_page') || localStorage.getItem('nour_reading_page');
          if (saved) {
            const p = parseInt(saved, 10);
            if (p >= 1 && p <= 604) setReadingPage(p);
          }
        }
      } catch {
        // ignore
      }
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bgClasses = 
    themeMode === 'pitch_black'
      ? 'bg-[#000000] text-[#E5EAE6]'
      : themeMode === 'royal_purple'
      ? 'bg-[#090414] text-[#F3E8FF]'
      : themeMode === 'midnight_navy'
      ? 'bg-[#070D18] text-[#E2E8F0]'
      : themeMode === 'warm_amber'
      ? 'bg-[#1C150D] text-[#FEF3C7]'
      : themeMode === 'pure_white'
      ? 'bg-[#FFFFFF] text-[#0F172A]'
      : themeMode === 'emerald'
      ? 'bg-[#15231A] text-[#E0E9E2]'
      : 'bg-[#F4F7F5] text-[#222E26]';

  const isSurahReadingActive = activeTab === 'reading';

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden relative ${bgClasses} flex flex-col font-cairo transition-colors duration-200 selection:bg-[#E9B161] selection:text-[#1B3022]`}>
      {/* Top Navigation - Automatically hidden during Surah reading for 100% distraction-free experience */}
      {!isSurahReadingActive && (
        <Navbar
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenPermissions={() => setIsPermissionsModalOpen(true)}
          fontSize={fontSize}
          setFontSize={setFontSize}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
          onOpenAdmin={() => setIsAdminDashboardOpen(true)}
          onOpenDedication={() => setIsDedicationModalOpen(true)}
          onNavigateHome={() => setActiveTab('home')}
          lastRead={lastRead}
          onResumeReading={handleResumeReading}
        />
      )}

      {/* Top Dedication Banner (صدقة جارية) - Hidden in dedicated Quran Reading view to give full screen height */}
      {!isSurahReadingActive && (
        <aside 
          aria-label="إهداء الصدقة الجارية" 
          className={`w-full ${
            themeMode === 'pitch_black' 
              ? 'bg-[#121C15] border-b border-[#243529]' 
              : 'bg-gradient-to-r from-[#1B2B20] via-[#16251B] to-[#121E16] border-b border-[#E9B161]/35'
          } py-2 px-3 text-white text-xs shadow-sm`}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-full bg-[#E9B161]/20 text-[#E9B161] shrink-0">
                ❤️
              </span>
              <p className="font-arabic text-stone-200">
                <strong className="text-[#E9B161] font-bold">صدقة جارية:</strong> عن روح القائمين عليه وجميع المسلمين، وعن روح المرحوم <strong className="text-white underline decoration-[#E9B161]">حسين الدسوقي رجب</strong> والمرحومة <strong className="text-white underline decoration-[#E9B161]">وجيهة عبدالجواد سكر</strong> وموتى المسلمين جميعاً.
              </p>
            </div>
            <button
              onClick={() => setIsDedicationModalOpen(true)}
              id="app-top-dedication-details-btn"
              className="shrink-0 px-3 py-1 rounded-lg bg-[#E9B161] hover:bg-[#D99A45] text-[#1B3022] font-bold text-[11px] transition-transform active:scale-95 shadow-sm"
            >
              دعاء الفاتحة والإهداء 🤲
            </button>
          </div>
        </aside>
      )}

      {/* Main Active Tab Content */}
      <main className={`flex-1 w-full mx-auto ${
        isSurahReadingActive 
          ? 'p-0 m-0 max-w-full h-[100dvh] overflow-hidden' 
          : 'max-w-7xl px-2 sm:px-4 py-4 pb-28 sm:pb-32'
      }`}>
        {activeTab === 'home' && (
          <HomeHubView
            onNavigate={(tab, extra) => {
              if (extra?.page !== undefined) {
                setReadingPage(extra.page);
              } else if (tab === 'reading') {
                try {
                  const savedLast = localStorage.getItem('nour_last_read');
                  if (savedLast) {
                    const parsed = JSON.parse(savedLast);
                    if (parsed.page && parsed.page >= 1 && parsed.page <= 604) {
                      setReadingPage(parsed.page);
                    }
                  } else {
                    const saved = localStorage.getItem('tareeq_reading_page') || localStorage.getItem('nour_reading_page');
                    if (saved) {
                      const p = parseInt(saved, 10);
                      if (p >= 1 && p <= 604) setReadingPage(p);
                    }
                  }
                } catch {
                  // ignore
                }
              }
              if (extra?.surah !== undefined) {
                setSelectedSurahForReader(extra.surah);
              }
              if (extra?.fromKhatmah !== undefined) {
                setIsReadingFromKhatmah(Boolean(extra.fromKhatmah));
              } else if (tab === 'reading') {
                setIsReadingFromKhatmah(false);
              }
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenDedicationModal={() => setIsDedicationModalOpen(true)}
            onOpenPermissionsModal={() => setIsPermissionsModalOpen(true)}
          />
        )}

        {activeTab === 'reading' && (
          <QuranReadingView
            initialPage={readingPage}
            fontSize={fontSize}
            isKhatmahMode={isReadingFromKhatmah}
            onBookmarkChange={refreshLastRead}
            onOpenKhatmahTab={() => setActiveTab('khatmah')}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'khatmah' && (
          <KhatmahTracker onGoToReadingPage={handleOpenReadingAtPage} />
        )}

        {activeTab === 'quran' && (
          <QuranReader
            initialSurah={selectedSurahForReader}
            initialAyah={selectedAyahForReader}
            fontSize={fontSize}
            onBookmarkChange={refreshLastRead}
            onSurahChange={(surahNum) => setSelectedSurahForReader(surahNum ?? undefined)}
            onOpenReadingPage={handleOpenReadingAtPage}
          />
        )}

        {activeTab === 'tasmee' && (
          <QuranTasmeeView />
        )}

        {activeTab === 'prophets' && (
          <ProphetsStoriesView onGoHome={() => setActiveTab('home')} />
        )}

        {activeTab === 'tajweed' && (
          <TajweedGuideView />
        )}

        {activeTab === 'reciters' && (
          <RecitersDirectory
            onSelectSurahForReading={(surahNum) => handleOpenQuranAt(surahNum, 1)}
          />
        )}

        {activeTab === 'lectures' && <LecturesView />}

        {activeTab === 'adhkar' && <AdhkarView />}

        {activeTab === 'duas' && <DuasHadithView />}

        {activeTab === 'prayers' && <PrayerTimesQibla />}

        {activeTab === 'tasbih' && <DigitalTasbih />}

        {activeTab === 'hajj_umrah' && <HajjUmrahHaramainView />}

        {activeTab === 'ai_scholar' && <AIScholarView />}
      </main>

      {/* Floating Audio Player mini bar & full modal (hidden if in full reading unless playing) */}
      <AudioPlayerBar onOpenQuranAt={handleOpenQuranAt} />

      {/* Bottom Navigation - Hidden in Quran Reading mode for 100% immersive physical Mushaf experience */}
      {activeTab !== 'reading' && (
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
        />
      )}

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(surahNum, ayahNum) => {
          handleOpenQuranAt(surahNum, ayahNum);
        }}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onSelectBookmark={(surahNum, ayahNum) => {
          handleOpenQuranAt(surahNum, ayahNum);
        }}
      />

      {/* Offline Quran & Adhan Manager Modal */}
      <OfflineManagerModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

      {/* Global Background Auto-Adhan Trigger Modal */}
      <AdhanPlayerModal
        isOpen={globalAdhanModal.isOpen}
        onClose={() => setGlobalAdhanModal(prev => ({ ...prev, isOpen: false }))}
        prayerName={globalAdhanModal.prayerName}
        initialAdhanId={globalAdhanModal.adhanId}
        autoPlay={true}
      />

      {/* Owner Private Admin & Analytics Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />

      {/* Theme Selection Gallery Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={themeMode}
        onSelectTheme={(th) => setThemeMode(th)}
      />

      {/* Permissions and Privacy Preference Modal */}
      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
      />

      {/* Dedication Noble Modal (صدقة جارية) */}
      <TributeDedicationModal
        isOpen={isDedicationModalOpen}
        onClose={() => setIsDedicationModalOpen(false)}
      />

      {/* Pre-Prayer Alert Floating Toast Banner (15-Minute reminder) */}
      {prePrayerAlertToast?.show && (
        <div className="fixed top-4 left-4 right-4 max-w-lg mx-auto z-[250] animate-bounce-short">
          <div className="p-4 rounded-2xl bg-[#1B3022] border-2 border-[#E9B161] shadow-2xl text-white flex items-start gap-3 backdrop-blur-md">
            <div className="p-2 rounded-xl bg-[#E9B161] text-[#1B3022] shrink-0 mt-0.5">
              <Bell className="w-5 h-5 animate-pulse fill-current" />
            </div>
            <div className="flex-1 text-right space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#E9B161]">
                  ⏰ اقترب موعد أذان صلاة {prePrayerAlertToast.prayerName}
                </span>
                <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  بقي {prePrayerAlertToast.minutes} دقيقة
                </span>
              </div>
              <p className="text-xs text-stone-200 leading-relaxed font-scheherazade text-sm">
                اقْتَرَبَ مَوْعِدُ أَذَانِ صَلَاةِ {prePrayerAlertToast.prayerName}. إِنْ لَمْ تَكُنْ صَلَّيْتَ صَلَاةَ {prePrayerAlertToast.prevPrayerName} فَقُمْ وَصَلِّ، ﴿فَإِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('prayers');
                    setPrePrayerAlertToast(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#E9B161] text-[#1B3022] font-bold text-xs hover:bg-[#dfa755] cursor-pointer"
                >
                  عرض المواقيت والودجات
                </button>
                <button
                  type="button"
                  onClick={() => setPrePrayerAlertToast(null)}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-stone-300 cursor-pointer"
                >
                  حسنًا، جزاك الله خيراً
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}

export default App;
