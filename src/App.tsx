import React, { useState, useEffect } from 'react';
import { AudioProvider } from './context/AudioContext';
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
import { SearchModal } from './components/SearchModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { ActiveTab, Bookmark } from './types';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('quran');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nour_dark_mode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
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

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  // Last read tracking
  const [lastRead, setLastRead] = useState<{ surahNumber: number; ayahNumber: number; surahName: string; page?: number } | null>(() => {
    try {
      const saved = localStorage.getItem('nour_last_read');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync dark mode class with <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('nour_dark_mode', JSON.stringify(darkMode));
    } catch {
      // ignore
    }
  }, [darkMode]);

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
    setSelectedSurahForReader(surahNum);
    setSelectedAyahForReader(ayahNum);
    setActiveTab('quran');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReadingAtPage = (page: number) => {
    setReadingPage(page);
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

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0F1D13] text-[#2D3436] dark:text-[#E0E7E1] flex flex-col font-cairo transition-colors duration-200 selection:bg-[#E9B161] selection:text-[#1B3022]">
      {/* Top Navigation */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        lastRead={lastRead}
        onResumeReading={handleResumeReading}
      />

      {/* Main Active Tab Content */}
      <main className="flex-1">
        {activeTab === 'reading' && (
          <QuranReadingView
            initialPage={readingPage}
            fontSize={fontSize}
            onBookmarkChange={refreshLastRead}
            onOpenKhatmahTab={() => setActiveTab('khatmah')}
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
          />
        )}

        {activeTab === 'reciters' && (
          <RecitersDirectory
            onSelectSurahForReading={(surahNum) => handleOpenQuranAt(surahNum, 1)}
          />
        )}

        {activeTab === 'adhkar' && <AdhkarView />}

        {activeTab === 'duas' && <DuasHadithView />}

        {activeTab === 'prayers' && <PrayerTimesQibla />}

        {activeTab === 'tasbih' && <DigitalTasbih />}
      </main>

      {/* Floating Audio Player mini bar & full modal */}
      <AudioPlayerBar onOpenQuranAt={handleOpenQuranAt} />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

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
