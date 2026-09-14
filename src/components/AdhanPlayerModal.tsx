import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Sparkles, 
  Radio, 
  AlertCircle, 
  RefreshCw, 
  Check, 
  HeartHandshake, 
  Download, 
  WifiOff 
} from 'lucide-react';
import { getOfflineAudioUrl, cacheAudioUrl } from '../services/offlineAudioService';

export interface AdhanOption {
  id: string;
  name: string;
  location: string;
  country: string;
  audioUrls: string[]; // List of primary and fallback URLs
  isFajr?: boolean;
}

export const ADHAN_LIST: AdhanOption[] = [
  {
    id: 'makkah_ali_mulla',
    name: 'أذان الحرم المكي الشريف',
    location: 'مكة المكرمة (الشيخ علي بن أحمد ملا - بدون تثويب)',
    country: 'المملكة العربية السعودية',
    audioUrls: [
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Ali_Ibn_Ahmad_Mala_1_-_Al_Haram_Al_Maki_(%D8%B9%D9%84%D9%8A_%D8%A8%D9%86_%D8%A3%D8%AD%D9%85%D8%AF_%D9%85%D9%84%D8%A7_-_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D9%83%D9%8A).mp3',
      'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__02.athan.mp3',
      'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__03.athan.mp3'
    ]
  },
  {
    id: 'madinah',
    name: 'أذان المسجد النبوي الشريف',
    location: 'المدينة المنورة (الحرم المدني)',
    country: 'المملكة العربية السعودية',
    audioUrls: [
      'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__02.athan.mp3',
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Al_Haram_Al_Madani_-_Al_Madinah_1_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D8%AF%D9%86%D9%8A_-_%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9).mp3',
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Al_Haram_Al_Madani_-_Al_Madinah_2_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D8%AF%D9%86%D9%8A_-_%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9).mp3'
    ]
  },
  {
    id: 'abdelbasset',
    name: 'أذان الشيخ عبد الباسط عبد الصمد',
    location: 'مصر التاريخي',
    country: 'جمهورية مصر العربية',
    audioUrls: [
      'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__03.athan.mp3',
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Abdulbasit_Abdusamad_1_-_Egypt_(%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7_%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%B5%D9%85%D8%AF_-_%D9%85%D8%B5%D8%B1).mp3',
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Abdulbasit_Abdusamad_5_-_Cairo_(%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7_%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%B5%D9%85%D8%AF_-_%D8%A7%D9%84%D9%82%D8%A7%D9%87%D8%B1%D8%A9).mp3'
    ]
  },
  {
    id: 'alafasy',
    name: 'أذان الشيخ مشاري راشد العفاسي',
    location: 'دولة الكويت',
    country: 'الكويت',
    audioUrls: [
      'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__04.athan.mp3',
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Mishary_Rashid_Alafasy_1_-_Kuwait_(%D9%85%D8%B4%D8%A7%D8%B1%D9%8A_%D8%B1%D8%A7%D8%B4%D8%AF_%D8%A7%D9%84%D8%B9%D9%81%D8%A7%D8%B3%D9%8A_-_%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA).mp3',
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Mishary_Rashid_Alafasy_2_-_Kuwait_(%D9%85%D8%B4%D8%A7%D8%B1%D9%8A_%D8%B1%D8%A7%D8%B4%D8%AF_%D8%A7%D9%84%D8%B9%D9%81%D8%A7%D8%B3%D9%8A_-_%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA).mp3'
    ]
  },
  {
    id: 'al_aqsa',
    name: 'أذان المسجد الأقصى المبارك',
    location: 'القدس الشريف',
    country: 'فلسطين',
    audioUrls: [
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Al_Aqsa_-_Jerusalem_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF_%D8%A7%D9%84%D8%A3%D9%82%D8%B5%D9%89_-_%D8%A7%D9%84%D9%82%D8%AF%D8%B3).mp3',
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Najee_Qazaz_-_Al_Aqsa_Jerusalem_(%D9%86%D8%A7%D8%AC%D9%8A_%D9%82%D8%B2%D8%A7%D8%B2_-_%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF_%D8%A7%D9%84%D8%A3%D9%82%D8%B5%D9%89_%D8%A7%D9%84%D9%82%D8%AF%D8%B3).mp3'
    ]
  },
  {
    id: 'fajr_makkah',
    name: 'أذان الفجر (الصلاة خير من النوم)',
    location: 'الحرم المكي والمدني الشريف',
    country: 'المملكة العربية السعودية',
    audioUrls: [
      'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__01.athan.mp3',
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Fajr_Al_Haram_Al_Maki_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D9%81%D8%AC%D8%B1_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D9%83%D9%8A).mp3',
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Ali_Ibn_Ahmad_Mala_2_-_Al_Haram_Al_Maki_(%D8%B9%D9%84%D9%8A_%D8%A8%D9%86_%D8%A3%D8%AD%D9%85%D8%AF_%D9%85%D9%84%D8%A7_-_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D9%83%D9%8A).mp3',
      'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Mishary_Rashid_Alafasy_3_-_Fajr_Kuwait_(%D9%85%D8%B4%D8%A7%D8%B1%D9%8A_%D8%B1%D8%A7%D8%B4%D8%AF_%D8%A7%D9%84%D8%B9%D9%81%D8%A7%D8%B3%D9%8A_-_%D9%81%D8%AC%D8%B1_%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA).mp3'
    ],
    isFajr: true
  }
];

export const getAdhanWords = (isFajr: boolean = false) => {
  const baseWords = [
    { phrase: 'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ', response: 'اللهُ أكبر، اللهُ أكبر', count: 'مرتان' },
    { phrase: 'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ', response: 'اللهُ أكبر، اللهُ أكبر', count: 'مرتان' },
    { phrase: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ', response: 'أشهد أن لا إله إلا الله', count: 'مرتان' },
    { phrase: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ', response: 'أشهد أن لا إله إلا الله', count: 'مرتان' },
    { phrase: 'أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللهِ', response: 'أشهد أن محمداً رسول الله', count: 'مرتان' },
    { phrase: 'أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللهِ', response: 'أشهد أن محمداً رسول الله', count: 'مرتان' },
    { phrase: 'حَيَّ عَلَى الصَّلَاةِ', response: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', count: 'مرتان' },
    { phrase: 'حَيَّ عَلَى الصَّلَاةِ', response: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', count: 'مرتان' },
    { phrase: 'حَيَّ عَلَى الْفَلَاحِ', response: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', count: 'مرتان' },
    { phrase: 'حَيَّ عَلَى الْفَلَاحِ', response: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', count: 'مرتان' },
  ];

  if (isFajr) {
    baseWords.push({
      phrase: 'الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ (خاص بأذان الفجر فقط)',
      response: 'صدقت وبررت / أو مثل قوله',
      count: 'مرتان في صلاة الفجر فقط'
    });
  }

  baseWords.push(
    { phrase: 'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ', response: 'اللهُ أكبر، اللهُ أكبر', count: 'مرة' },
    { phrase: 'لَا إِلَهَ إِلَّا اللهُ', response: 'لَا إِلَهَ إِلَّا اللهُ', count: 'مرة' }
  );

  return baseWords;
};

export const ADHAN_WORDS = getAdhanWords(false);

interface AdhanPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName?: string;
  initialAdhanId?: string;
  autoPlay?: boolean;
}

export const AdhanPlayerModal: React.FC<AdhanPlayerModalProps> = ({
  isOpen,
  onClose,
  prayerName = 'الصلاة',
  initialAdhanId,
  autoPlay = true
}) => {
  const isFajrContext = Boolean(prayerName === 'الفجر' || prayerName?.includes('فجر') || initialAdhanId === 'fajr_makkah');

  const [selectedAdhan, setSelectedAdhan] = useState<AdhanOption>(() => {
    try {
      if (isFajrContext) {
        const fajrFound = ADHAN_LIST.find((a) => a.id === 'fajr_makkah');
        if (fajrFound) return fajrFound;
      }
      const savedId = localStorage.getItem('tareeq_selected_adhan_id') || initialAdhanId;
      // If user had fajr_makkah saved, but the current prayer is NOT Fajr, fallback to daytime adhan
      if (savedId === 'fajr_makkah' && !isFajrContext) {
        return ADHAN_LIST[0];
      }
      const found = ADHAN_LIST.find((a) => a.id === savedId);
      return found || ADHAN_LIST[0];
    } catch {
      return ADHAN_LIST[0];
    }
  });

  const isFajrActive = Boolean(selectedAdhan?.isFajr || isFajrContext);
  const activeAdhanWords = getAdhanWords(isFajrActive);

  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'dua' | 'words'>('player');
  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const [isDownloadingOffline, setIsDownloadingOffline] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync initialAdhanId if provided
  useEffect(() => {
    if (initialAdhanId) {
      const found = ADHAN_LIST.find((a) => a.id === initialAdhanId);
      if (found) {
        setSelectedAdhan(found);
        setCurrentUrlIndex(0);
      }
    }
  }, [initialAdhanId]);

  // Clean audio on unmount or close
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Initialize single Audio object on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 180);
      setIsLoadingAudio(false);
      setAudioError(false);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => {
      console.warn(`Adhan audio mirror ${currentUrlIndex} failed. Attempting next mirror...`);
      // Try next mirror
      if (currentUrlIndex + 1 < selectedAdhan.audioUrls.length) {
        setCurrentUrlIndex((prev) => prev + 1);
      } else {
        setAudioError(true);
        setIsLoadingAudio(false);
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, [currentUrlIndex, selectedAdhan.audioUrls.length]);

  // Setup active audio source whenever selected adhan or url index changes
  useEffect(() => {
    if (!isOpen || !audioRef.current) return;

    let isMounted = true;
    const rawUrl = selectedAdhan.audioUrls[currentUrlIndex] || selectedAdhan.audioUrls[0];
    const audio = audioRef.current;

    setIsLoadingAudio(true);
    setAudioError(false);

    // Check if cached offline first
    getOfflineAudioUrl(rawUrl).then((cachedBlobUrl) => {
      if (!isMounted || !audioRef.current) return;
      const finalSrc = cachedBlobUrl || rawUrl;
      setIsOfflineCached(!!cachedBlobUrl);

      audio.src = finalSrc;
      audio.load();

      if (autoPlay) {
        audio
          .play()
          .then(() => {
            if (isMounted) {
              setIsPlaying(true);
              setIsLoadingAudio(false);
              setAudioError(false);
              cacheAudioUrl(rawUrl);
            }
          })
          .catch((err) => {
            console.warn('Adhan autoplay notice:', err);
            if (isMounted) {
              setIsLoadingAudio(false);
              setIsPlaying(false);
            }
          });
      } else {
        setIsLoadingAudio(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedAdhan, currentUrlIndex, autoPlay]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoadingAudio(true);
      setAudioError(false);

      const rawUrl = selectedAdhan.audioUrls[currentUrlIndex] || selectedAdhan.audioUrls[0];
      const offlineUrl = await getOfflineAudioUrl(rawUrl);
      if (offlineUrl && audio.src !== offlineUrl) {
        audio.src = offlineUrl;
      }

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoadingAudio(false);
          setAudioError(false);

          // Background cache for next time
          cacheAudioUrl(rawUrl);
        })
        .catch((err) => {
          console.warn('Adhan play error:', err);
          // Try next mirror
          if (currentUrlIndex + 1 < selectedAdhan.audioUrls.length) {
            setCurrentUrlIndex((p) => p + 1);
          } else {
            setAudioError(true);
            setIsPlaying(false);
            setIsLoadingAudio(false);
          }
        });
    }
  };


  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSelectAdhan = (adhan: AdhanOption) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setSelectedAdhan(adhan);
    setCurrentUrlIndex(0);
    setAudioError(false);
    setIsPlaying(false);
    try {
      localStorage.setItem('tareeq_selected_adhan_id', adhan.id);
    } catch {
      // ignore
    }
  };

  const handleSaveAdhanOffline = async () => {
    setIsDownloadingOffline(true);
    const rawUrl = selectedAdhan.audioUrls[0];
    const success = await cacheAudioUrl(rawUrl);
    setIsDownloadingOffline(false);
    if (success) {
      setIsOfflineCached(true);
    }
  };

  const formatSecs = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#142419] via-[#1B3022] to-[#0D1811] border border-[#3D5A47] text-white shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#2D4536]/80 bg-[#101F15]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E9B161]/20 border border-[#E9B161]/50 flex items-center justify-center text-[#E9B161]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-scheherazade">
                نداء الصلاة • أذان {prayerName}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#A8BCAD]">
                  {selectedAdhan.name} ({selectedAdhan.location})
                </span>
                {isOfflineCached && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">
                    محفوظ بدون نت
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              onClose();
            }}
            className="p-2 rounded-xl bg-[#1B3022] hover:bg-[#2D4536] text-[#A8BCAD] hover:text-white border border-[#3D5A47] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-[#2D4536] bg-[#142419]/60 px-2 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('player')}
            className={`flex-1 py-2.5 font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'player'
                ? 'border-[#E9B161] text-[#E9B161]'
                : 'border-transparent text-[#A8BCAD] hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>مشغل الأذان</span>
          </button>

          <button
            onClick={() => setActiveTab('dua')}
            className={`flex-1 py-2.5 font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'dua'
                ? 'border-[#E9B161] text-[#E9B161]'
                : 'border-transparent text-[#A8BCAD] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>دعاء ما بعد الأذان</span>
          </button>

          <button
            onClick={() => setActiveTab('words')}
            className={`flex-1 py-2.5 font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'words'
                ? 'border-[#E9B161] text-[#E9B161]'
                : 'border-transparent text-[#A8BCAD] hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>كلمات وسنن الأذان</span>
          </button>
        </div>

        {/* TAB 1: PLAYER */}
        {activeTab === 'player' && (
          <div className="p-5 space-y-5">
            {/* Visual Mosque Badge & Animated Waves */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#101F15] via-[#1B3022] to-[#142419] border border-[#2D4536] text-center relative overflow-hidden shadow-inner">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#1B3022] border-2 border-[#E9B161] p-2 flex items-center justify-center shadow-lg shadow-[#E9B161]/20 relative mb-3">
                <img src="/icon.svg" alt="الكعبة المشرفة" className="w-full h-full object-contain" />
                {isPlaying && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9B161] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#E9B161]"></span>
                  </span>
                )}
              </div>

              <h4 className="text-xl font-bold font-scheherazade text-[#E9B161] mb-1">
                {selectedAdhan.name}
              </h4>
              <p className="text-xs text-[#A8BCAD]">
                {selectedAdhan.location} • {selectedAdhan.country}
              </p>

              {/* Soundwaves */}
              <div className="flex items-center justify-center gap-1.5 h-8 mt-4">
                {[40, 70, 100, 60, 90, 45, 80, 55, 95, 65, 35].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 bg-[#E9B161] rounded-full transition-all duration-300 ${
                      isPlaying ? 'animate-pulse' : 'opacity-30'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 1 : 0.8)))}%` : '20%',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>

              {/* Progress Slider */}
              <div className="mt-4 space-y-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 180}
                  value={currentTime}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (audioRef.current) {
                      audioRef.current.currentTime = val;
                      setCurrentTime(val);
                    }
                  }}
                  className="w-full accent-[#E9B161] bg-[#2D4536] h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#A8BCAD]">
                  <span>{formatSecs(currentTime)}</span>
                  <span>{formatSecs(duration)}</span>
                </div>
              </div>
            </div>

            {/* Error or Loading Notice */}
            {isLoadingAudio && (
              <div className="p-2.5 rounded-xl bg-[#142419] border border-[#2D4536] text-xs text-[#E9B161] flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>جاري تحميل الأذان الشريف...</span>
              </div>
            )}

            {audioError && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>انقر على زر "تشغيل الأذان" للاستماع فوراً</span>
                </div>
                <button
                  onClick={togglePlay}
                  className="px-2.5 py-1 rounded bg-[#E9B161] text-[#142419] font-bold text-[11px]"
                >
                  تشغيل
                </button>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={toggleMute}
                className="p-3 rounded-xl bg-[#142419] hover:bg-[#233F2E] border border-[#2D4536] text-[#A8BCAD] hover:text-white transition-colors"
                title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={handleRestart}
                className="p-3 rounded-xl bg-[#142419] hover:bg-[#233F2E] border border-[#2D4536] text-[#A8BCAD] hover:text-white transition-colors"
                title="إعادة من البداية"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Main Play / Pause Button */}
              <button
                onClick={togglePlay}
                id="modal-adhan-play-pause-btn"
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#E9B161] to-[#D99A45] hover:brightness-110 active:scale-95 text-[#142419] font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-[#E9B161]/25 transition-all scale-100 hover:scale-105"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل الأذان الآن'}</span>
              </button>

              {/* Save Offline Button */}
              <button
                onClick={handleSaveAdhanOffline}
                disabled={isOfflineCached || isDownloadingOffline}
                className={`p-3 rounded-xl border transition-colors ${
                  isOfflineCached 
                    ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300' 
                    : 'bg-[#142419] hover:bg-[#233F2E] border-[#2D4536] text-[#E9B161]'
                }`}
                title={isOfflineCached ? 'محفوظ للعمل بدون نت' : 'حفظ في الهاتف بدون نت'}
              >
                {isDownloadingOffline ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : isOfflineCached ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* List of Available Adhan Reciters */}
            <div className="space-y-2 pt-2 border-t border-[#2D4536]">
              <span className="text-xs font-semibold text-[#A8BCAD] block">
                اختر صوت المؤذن المفضل:
              </span>
              <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
                {ADHAN_LIST.map((adh) => {
                  const isSelected = adh.id === selectedAdhan.id;
                  return (
                    <button
                      key={adh.id}
                      onClick={() => handleSelectAdhan(adh)}
                      className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#E9B161]/15 border-[#E9B161] text-white shadow-sm'
                          : 'bg-[#142419]/70 hover:bg-[#1B3022] border-[#2D4536] text-[#A8BCAD] hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <span>{adh.name}</span>
                          {adh.isFajr && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                              خاص بالفجر
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#A8BCAD] block">{adh.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#E9B161] text-[#142419] flex items-center justify-center font-bold text-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: POST-ADHAN DU'A */}
        {activeTab === 'dua' && (
          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#101F15] to-[#1B3022] border border-[#E9B161]/40 text-center space-y-3 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9B161]/20 border border-[#E9B161]/40 text-[#E9B161] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>الدعاء المأثور عن النبي ﷺ بعد انتهاء الأذان</span>
              </div>

              <p className="text-xl sm:text-2xl font-bold font-scheherazade text-white leading-relaxed pt-2">
                «اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ القَائِمَةِ، آتِ مُحَمَّداً الوَسِيلَةَ وَالفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ، [إِنَّكَ لَا تُخْلِفُ المِيعَادَ]»
              </p>

              <div className="pt-2 border-t border-[#2D4536] text-xs text-[#E9B161]">
                <strong>فضل هذا الدعاء:</strong> قال رسول الله ﷺ: «مَنْ قَالَ حِينَ يَسْمَعُ النِّدَاءَ ... حَلَّتْ لَهُ شَفَاعَتِي يَوْمَ القِيَامَةِ» [صحيح البخاري].
              </div>
            </div>

            {/* Prayers between Adhan & Iqamah */}
            <div className="p-4 rounded-2xl bg-[#142419] border border-[#2D4536] space-y-2 text-xs">
              <h5 className="font-bold text-[#E9B161] flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                <span>الدعاء بين الأذان والإقامة مستجاب:</span>
              </h5>
              <p className="text-[#E0E7E1] leading-relaxed">
                قال النبي ﷺ: «الدُّعَاءُ لَا يُرَدُّ بَيْنَ الأَذَانِ وَالإِقَامَةِ» [رواه الترمذي وأبو داود].
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: ADHAN WORDS & SUNNAH */}
        {activeTab === 'words' && (
          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="p-3 rounded-xl bg-[#142419] border border-[#2D4536] text-xs text-[#A8BCAD]">
              💡 <strong>سُنَّة المتابعة:</strong> يُستحب لمن يسمع المؤذن أن يقول مثل ما يقول، إلا عند قوله (حي على الصلاة) و(حي على الفلاح) فيقول: «لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ».
            </div>

            <div className="space-y-2">
              {activeAdhanWords.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-[#142419]/70 border border-[#2D4536] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="text-white font-bold font-scheherazade text-base block">
                      {item.phrase}
                    </span>
                    <span className="text-[#A8BCAD] text-[11px]">
                      تردّد خلفه: <strong className="text-[#E9B161]">{item.response}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A8BCAD] font-mono px-2 py-1 rounded bg-[#1B3022] border border-[#2D4536]">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#101F15] border-t border-[#2D4536] flex items-center justify-between text-xs">
          <span className="text-[#A8BCAD]">
            طريق الهدى • مواقيت الصلاة والأذان
          </span>
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-[#2D4536] hover:bg-[#3D5A47] text-white font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
