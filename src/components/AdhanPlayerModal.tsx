import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Sparkles, 
  Bell, 
  Check, 
  Music, 
  HeartHandshake,
  Compass,
  Radio,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

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
    location: 'مكة المكرمة (الشيخ علي ملا)',
    country: 'المملكة العربية السعودية',
    audioUrls: [
      'https://cdn.islamic.network/adhan/makkah.mp3',
      'https://download.quranicaudio.com/adhan/makkah.mp3',
      'https://ia800301.us.archive.org/24/items/AdhanMakkah/Adhan%20Makkah.mp3',
      'https://media.sd.ma/assabile/adhan/makkah/adhan_makkah_1.mp3'
    ]
  },
  {
    id: 'madinah',
    name: 'أذان المسجد النبوي الشريف',
    location: 'المدينة المنورة (الحرم المدني)',
    country: 'المملكة العربية السعودية',
    audioUrls: [
      'https://cdn.islamic.network/adhan/madina.mp3',
      'https://download.quranicaudio.com/adhan/madina.mp3',
      'https://media.sd.ma/assabile/adhan/madinah/adhan_madina_1.mp3'
    ]
  },
  {
    id: 'abdelbasset',
    name: 'أذان الشيخ عبد الباسط عبد الصمد',
    location: 'مصر التاريخي',
    country: 'جمهورية مصر العربية',
    audioUrls: [
      'https://ia801503.us.archive.org/15/items/Adhan_Abdulbasit/Adhan_Abdulbasit.mp3',
      'https://media.sd.ma/assabile/adhan/adhan_abdelbasset_abdessamad.mp3',
      'https://download.quranicaudio.com/adhan/abdulbasit.mp3'
    ]
  },
  {
    id: 'al_aqsa',
    name: 'أذان المسجد الأقصى المبارك',
    location: 'القدس الشريف',
    country: 'فلسطين',
    audioUrls: [
      'https://ia800707.us.archive.org/15/items/AdhanAl-aqsa/Adhan%20Al-aqsa.mp3',
      'https://media.sd.ma/assabile/adhan/adhan_al_aqsa.mp3'
    ]
  },
  {
    id: 'fajr_makkah',
    name: 'أذان الفجر (الصلاة خير من النوم)',
    location: 'الحرم المكي الشريف',
    country: 'المملكة العربية السعودية',
    audioUrls: [
      'https://ia801604.us.archive.org/34/items/adhan-fajr-makkah/adhan_fajr.mp3',
      'https://cdn.islamic.network/adhan/fajr.mp3',
      'https://media.sd.ma/assabile/adhan/adhan_fajr.mp3'
    ],
    isFajr: true
  }
];

export const ADHAN_WORDS = [
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
  { phrase: 'الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ (في الفجر)', response: 'صدقت وبررت / أو مثل قوله', count: 'في صلاة الصبح' },
  { phrase: 'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ', response: 'اللهُ أكبر، اللهُ أكبر', count: 'مرة' },
  { phrase: 'لَا إِلَهَ إِلَّا اللهُ', response: 'لَا إِلَهَ إِلَّا اللهُ', count: 'مرة' }
];

interface AdhanPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName?: string;
  initialAdhanId?: string;
}

export const AdhanPlayerModal: React.FC<AdhanPlayerModalProps> = ({
  isOpen,
  onClose,
  prayerName = 'الصلاة',
  initialAdhanId
}) => {
  const [selectedAdhan, setSelectedAdhan] = useState<AdhanOption>(() => {
    try {
      const savedId = localStorage.getItem('tareeq_selected_adhan_id') || initialAdhanId;
      const found = ADHAN_LIST.find((a) => a.id === savedId);
      return found || ADHAN_LIST[0];
    } catch {
      return ADHAN_LIST[0];
    }
  });

  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'dua' | 'words'>('player');

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

  // Handle current active audio URL with fallbacks
  const activeUrl = selectedAdhan.audioUrls[currentUrlIndex] || selectedAdhan.audioUrls[0];

  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    setAudioError(false);
    setIsLoadingAudio(true);

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.src = activeUrl;
    audio.preload = 'auto';

    const handleCanPlay = () => {
      setIsLoadingAudio(false);
      setAudioError(false);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 180);
      setIsLoadingAudio(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      console.warn(`Adhan URL failed to load: ${activeUrl}. Trying fallback...`);
      // Try next fallback URL if available
      if (currentUrlIndex + 1 < selectedAdhan.audioUrls.length) {
        setCurrentUrlIndex((prev) => prev + 1);
      } else {
        setAudioError(true);
        setIsLoadingAudio(false);
        setIsPlaying(false);
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Attempt to play
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoadingAudio(false);
        })
        .catch((err) => {
          // Autoplay blocked by browser policy until user click
          setIsPlaying(false);
          setIsLoadingAudio(false);
        });
    }

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isOpen, selectedAdhan, currentUrlIndex, activeUrl]);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(activeUrl);
    }
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoadingAudio(true);
      setAudioError(false);
      
      if (!audio.src || audio.src === '') {
        audio.src = activeUrl;
      }

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoadingAudio(false);
          setAudioError(false);
        })
        .catch((err) => {
          console.warn('Audio play error:', err);
          setIsPlaying(false);
          setIsLoadingAudio(false);
          // Try next fallback URL if primary fails
          if (currentUrlIndex + 1 < selectedAdhan.audioUrls.length) {
            setCurrentUrlIndex((prev) => prev + 1);
          } else {
            setAudioError(true);
          }
        });
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSelectAdhan = (adhan: AdhanOption) => {
    setSelectedAdhan(adhan);
    setCurrentUrlIndex(0);
    setAudioError(false);
    try {
      localStorage.setItem('tareeq_selected_adhan_id', adhan.id);
    } catch {
      // ignore
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
        {/* Hidden native audio element */}
        <audio ref={audioRef} preload="auto" />

        {/* Header with Close */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#2D4536]/80 bg-[#101F15]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E9B161]/20 border border-[#E9B161]/50 flex items-center justify-center text-[#E9B161]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-scheherazade">
                نداء الصلاة • أذان {prayerName}
              </h3>
              <span className="text-[11px] text-[#A8BCAD] block">
                {selectedAdhan.name} ({selectedAdhan.location})
              </span>
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

        {/* TAB 1: PLAYER & RECITER CHOOSER */}
        {activeTab === 'player' && (
          <div className="p-5 space-y-5">
            {/* Visual Mosque Kaaba Badge & Animated Waves */}
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

              {/* Live Soundwave bar animation */}
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
                  max={duration || 100}
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
                  <span>انقر على زر "تشغيل الأذان" لبدء الاستماع</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentUrlIndex((prev) => (prev + 1) % selectedAdhan.audioUrls.length);
                    togglePlay();
                  }}
                  className="px-2.5 py-1 rounded bg-[#E9B161] text-[#142419] font-bold text-[11px]"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex items-center justify-center gap-4">
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

              {/* Main Play / Pause Button with prominent touch area */}
              <button
                onClick={togglePlay}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E9B161] to-[#D99A45] hover:brightness-110 active:scale-95 text-[#142419] font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-[#E9B161]/25 transition-all scale-100 hover:scale-105"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل الأذان الآن'}</span>
              </button>
            </div>

            {/* List of Available Adhan Reciters */}
            <div className="space-y-2 pt-2 border-t border-[#2D4536]">
              <span className="text-xs font-semibold text-[#A8BCAD] block">
                اختر صوت المؤذن المفضل:
              </span>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
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
                قال النبي ﷺ: «الدُّعَاءُ لَا يُرَدُّ بَيْنَ الأَذَانِ وَالإِقَامَةِ» [رواه الترمذي وأبو داود]. فاغتنم هذا الوقت الفضيل بالدعاء لنفسك ولوالديك وللمسلمين.
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
              {ADHAN_WORDS.map((item, idx) => (
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
