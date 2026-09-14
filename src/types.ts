export type ThemeMode = 
  | 'emerald' 
  | 'pitch_black' 
  | 'royal_purple' 
  | 'midnight_navy' 
  | 'warm_amber' 
  | 'pure_white' 
  | 'light';

export type RevelationType = 'Meccan' | 'Medinan';

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: RevelationType;
  juzStart: number;
  pageStart: number;
}

export interface Ayah {
  number: number; // global ayah number 1..6236
  numberInSurah: number;
  text: string;
  audio?: string;
  audioSecondary?: string[];
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: RevelationType;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export type ReciterCategory = 'haram_makkah' | 'haram_madinah' | 'egypt_masters' | 'renowned' | 'riwayah_masters';

export type RiwayahType = 
  | 'حفص عن عاصم'
  | 'ورش عن نافع'
  | 'قالون عن نافع'
  | 'الدوري عن أبي عمرو'
  | 'السوسي عن أبي عمرو'
  | 'شعبة عن عاصم'
  | 'خلف عن حمزة'
  | 'رويس عن يعقوب';

export interface Reciter {
  id: string;
  name: string;
  subname: string;
  category: ReciterCategory;
  riwayah: string;
  style?: 'مرتل' | 'مجود' | 'معلم' | 'تلاوة نادرة';
  everyAyahFolder?: string; // e.g. "Abdurrahmaan_As-Sudais_192kbps"
  mp3quranServer?: string; // e.g. "https://server11.mp3quran.net/sds/"
  isFullSurahOnly?: boolean; // For classical historical masters whose recordings are complete surahs
  fallbackEveryAyahFolder?: string;
  image?: string;
  bio?: string;
  origin?: string;
}

export type AudioRepeatMode = 'continuous' | 'single_ayah' | 'range' | 'surah';

export interface AudioLoopRange {
  fromAyah: number;
  toAyah: number;
  currentLoop: number;
  targetLoops: number;
}

export interface AudioState {
  isPlaying: boolean;
  activeSurah: number | null;
  activeAyahNumber: number | null; // number in surah (1..N)
  activeGlobalAyah: number | null;
  currentReciter: Reciter;
  repeatMode: AudioRepeatMode;
  loopRange: AudioLoopRange | null;
  playbackRate: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TafsirBook {
  id: string;
  name: string;
  author: string;
  editionId: string;
}

export interface TafsirResult {
  surahNumber: number;
  ayahNumber: number;
  text: string;
  bookName: string;
  author: string;
}

export interface DhikrCategory {
  id: string;
  title: string;
  iconName: string;
  description: string;
}

export interface DhikrItem {
  id: string;
  categoryId: string;
  text: string;
  count: number;
  benefit?: string;
  source: string;
}

export interface DuaCategory {
  id: string;
  title: string;
}

export interface DuaItem {
  id: string;
  categoryId: string;
  title: string;
  text: string;
  source: string;
  benefit?: string;
  occasion?: string;
}

export interface HadithCategory {
  id: string;
  title: string;
}

export interface HadithItem {
  id: string;
  categoryId: string;
  hadithNumber: number;
  title: string;
  arabicText: string;
  narrator: string;
  source: string;
  grade: string;
  explanation?: string;
}

export interface SearchResultItem {
  surahNumber: number;
  surahName: string;
  ayahNumberInSurah: number;
  text: string;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;
  timestamp: number;
  note?: string;
}

export interface LastRead {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  timestamp: number;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  qiyam?: string;
  nextPrayerName: string;
  nextPrayerTime?: string;
  timeToNext: string;
  secondsToNext?: number;
  currentPrayerName?: string;
  isPrayerTimeNow?: boolean;
  hijriFormatted: string;
  city: string;
}

export type TodayPrayerTimes = PrayerTimes;

export interface PageAyah {
  number: number;
  numberInSurah: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    revelationType: RevelationType;
  };
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
}

export interface QuranPageData {
  pageNumber: number;
  ayahs: PageAyah[];
  juz: number;
  surahNames: string[];
}

export type WirdType = 'juz' | 'hizb' | 'two_hizbs' | 'two_juz' | 'half_hizb' | 'custom_pages';

export interface KhatmahPlan {
  id: string;
  title: string;
  wirdType: WirdType;
  wirdLabel: string;
  dailyPages: number; // e.g. 20 pages for 1 juz, 10 for 1 hizb
  startPage: number;
  currentPage: number; // 1..604
  startDate: string; // ISO date string
  targetDays: number;
  lastReadDate?: string;
  todayCompleted?: boolean;
  streakDays: number;
  completedAt?: string;
  history: {
    date: string;
    pagesRead: number;
    fromPage: number;
    toPage: number;
  }[];
}

export type LectureCategory = 
  | 'all'
  | 'tafsir'
  | 'seerah'
  | 'fiqh'
  | 'raqaiq'
  | 'aqeedah'
  | 'family'
  | 'shorts';

export interface ScholarItem {
  id: string;
  name: string;
  title: string;
  era?: string;
  country: string;
  image: string;
  bio: string;
  specialty: string;
}

export interface LectureItem {
  id: string;
  title: string;
  scholarId: string;
  scholarName: string;
  category: LectureCategory;
  categoryLabel: string;
  youtubeId: string;
  duration: string;
  seriesTitle?: string;
  seriesEpisode?: number;
  description: string;
  keyPoints?: string[];
  viewsCount?: string;
  featured?: boolean;
  publishedYear?: string;
}

export type ActiveTab = 
  | 'home'
  | 'quran' 
  | 'reading' 
  | 'tasmee'
  | 'khatmah' 
  | 'reciters' 
  | 'prophets'
  | 'tajweed'
  | 'adhkar' 
  | 'duas' 
  | 'prayers' 
  | 'tasbih' 
  | 'lectures' 
  | 'ai_scholar' 
  | 'hajj_umrah';

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  sources?: string[];
  isError?: boolean;
}
