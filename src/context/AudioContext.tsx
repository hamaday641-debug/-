import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Reciter, AudioRepeatMode, AudioLoopRange, AudioState } from '../types';
import { RECITERS_LIST, getAyahAudioUrl, getSurahAudioUrl } from '../data/reciters';
import { SURAHS_LIST } from '../data/surahs';

interface AudioContextType extends AudioState {
  playAyah: (surahNumber: number, ayahNumber: number, reciterOverride?: Reciter) => Promise<void>;
  playSurah: (surahNumber: number, reciterOverride?: Reciter) => Promise<void>;
  togglePlayPause: () => void;
  stopAudio: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  setReciter: (reciter: Reciter) => void;
  setRepeatMode: (mode: AudioRepeatMode) => void;
  setRangeLoop: (fromAyah: number, toAyah: number, targetLoops?: number) => void;
  clearRangeLoop: () => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  isFullPlayerOpen: boolean;
  setIsFullPlayerOpen: (open: boolean) => void;
  favoriteReciters: string[];
  toggleFavoriteReciter: (reciterId: string) => void;
  recentReciters: string[];
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved reciter preferences
  const [favoriteReciters, setFavoriteReciters] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nour_fav_reciters');
      return saved ? JSON.parse(saved) : ['sudais', 'minshawi_murattal', 'husary_murattal', 'alafasy', 'dossari'];
    } catch {
      return ['sudais', 'minshawi_murattal', 'husary_murattal', 'alafasy'];
    }
  });

  const [recentReciters, setRecentReciters] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nour_recent_reciters');
      return saved ? JSON.parse(saved) : ['sudais', 'minshawi_murattal', 'alafasy'];
    } catch {
      return ['sudais'];
    }
  });

  const [currentReciter, setCurrentReciterState] = useState<Reciter>(() => {
    try {
      const savedId = localStorage.getItem('nour_current_reciter_id');
      const found = RECITERS_LIST.find((r) => r.id === savedId);
      return found || RECITERS_LIST[0]; // Default: Sheikh Al-Sudais
    } catch {
      return RECITERS_LIST[0];
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSurah, setActiveSurah] = useState<number | null>(null);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);
  const [activeGlobalAyah, setActiveGlobalAyah] = useState<number | null>(null);
  const [repeatMode, setRepeatMode] = useState<AudioRepeatMode>('continuous');
  const [loopRange, setLoopRange] = useState<AudioLoopRange | null>(null);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  // Initialize HTML5 Audio instance
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);

    const onError = (e: any) => {
      console.warn('Audio playback error:', e);
      setIsLoading(false);
      setIsPlaying(false);
      setError('تعذر تشغيل المقطع الصوتي، جاري المحاولة من المصدر البديل...');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update recent reciters list when current reciter changes
  const setReciter = useCallback((reciter: Reciter) => {
    setCurrentReciterState(reciter);
    try {
      localStorage.setItem('nour_current_reciter_id', reciter.id);
      setRecentReciters((prev) => {
        const next = [reciter.id, ...prev.filter((id) => id !== reciter.id)].slice(0, 10);
        localStorage.setItem('nour_recent_reciters', JSON.stringify(next));
        return next;
      });
    } catch {
      // ignore
    }
  }, []);

  const toggleFavoriteReciter = useCallback((reciterId: string) => {
    setFavoriteReciters((prev) => {
      const next = prev.includes(reciterId) ? prev.filter((id) => id !== reciterId) : [...prev, reciterId];
      try {
        localStorage.setItem('nour_fav_reciters', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Update MediaSession API for OS lock screen and notification controls
  useEffect(() => {
    if (!('mediaSession' in navigator) || !activeSurah) return;

    const surahMeta = SURAHS_LIST.find((s) => s.number === activeSurah);
    const surahName = surahMeta ? surahMeta.name : `السورة ${activeSurah}`;
    const trackTitle = activeAyahNumber ? `سورة ${surahName} - الآية ${activeAyahNumber}` : `سورة ${surahName}`;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: trackTitle,
      artist: `القارئ الشيخ ${currentReciter.name}`,
      album: 'القرآن الكريم - منصة نور',
      artwork: [
        { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play().catch(console.warn);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      prevTrack();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      nextTrack();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
      }
    });
  }, [activeSurah, activeAyahNumber, currentReciter]);

  // Audio Playback functions
  const playAyah = useCallback(
    async (surahNumber: number, ayahNumber: number, reciterOverride?: Reciter) => {
      const reciter = reciterOverride || currentReciter;
      if (reciterOverride && reciterOverride.id !== currentReciter.id) {
        setReciter(reciterOverride);
      }
      const audio = audioRef.current;
      if (!audio) return;

      setIsLoading(true);
      setError(null);
      setActiveSurah(surahNumber);
      setActiveAyahNumber(ayahNumber);

      const url = getAyahAudioUrl(reciter.everyAyahFolder, surahNumber, ayahNumber);
      
      try {
        audio.src = url;
        audio.playbackRate = playbackRate;
        audio.volume = isMuted ? 0 : volume;
        await audio.play();
        setIsPlaying(true);
      } catch (err: any) {
        console.warn('Playback initiation error:', err);
        setError('تعذر بدء تشغيل تلاوة الآية، جاري إعادة المحاولة...');
      } finally {
        setIsLoading(false);
      }
    },
    [currentReciter, playbackRate, volume, isMuted, setReciter]
  );

  const playSurah = useCallback(
    async (surahNumber: number, reciterOverride?: Reciter) => {
      const targetReciter = reciterOverride || currentReciter;
      if (reciterOverride && reciterOverride.id !== currentReciter.id) {
        setReciter(reciterOverride);
      }
      // Start playback from ayah 1 with the target reciter
      await playAyah(surahNumber, 1, targetReciter);
    },
    [playAyah, currentReciter, setReciter]
  );

  // Next track handler
  const nextTrack = useCallback(() => {
    if (!activeSurah || !activeAyahNumber) return;
    const surahMeta = SURAHS_LIST.find((s) => s.number === activeSurah);
    if (!surahMeta) return;

    // Check Range loop
    if (loopRange) {
      if (activeAyahNumber < loopRange.toAyah) {
        playAyah(activeSurah, activeAyahNumber + 1);
        return;
      } else {
        // reached end of range
        if (loopRange.currentLoop < loopRange.targetLoops) {
          setLoopRange({ ...loopRange, currentLoop: loopRange.currentLoop + 1 });
          playAyah(activeSurah, loopRange.fromAyah);
          return;
        }
      }
    }

    if (activeAyahNumber < surahMeta.numberOfAyahs) {
      playAyah(activeSurah, activeAyahNumber + 1);
    } else {
      // End of Surah reached
      if (repeatMode === 'surah') {
        playAyah(activeSurah, 1);
      } else if (repeatMode === 'continuous' && activeSurah < 114) {
        // Auto continue to next Surah
        playAyah(activeSurah + 1, 1);
      } else {
        setIsPlaying(false);
      }
    }
  }, [activeSurah, activeAyahNumber, loopRange, repeatMode, playAyah]);

  // Previous track handler
  const prevTrack = useCallback(() => {
    if (!activeSurah || !activeAyahNumber) return;
    if (activeAyahNumber > 1) {
      playAyah(activeSurah, activeAyahNumber - 1);
    } else if (activeSurah > 1) {
      const prevSurahMeta = SURAHS_LIST.find((s) => s.number === activeSurah - 1);
      if (prevSurahMeta) {
        playAyah(activeSurah - 1, prevSurahMeta.numberOfAyahs);
      }
    }
  }, [activeSurah, activeAyahNumber, playAyah]);

  // Audio 'ended' event handler logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (repeatMode === 'single_ayah') {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
        return;
      }

      nextTrack();
    };

    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeatMode, nextTrack]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (!audio.src && (!activeSurah || !activeAyahNumber)) {
        // Start from Surah 1 Ayah 1
        playAyah(1, 1);
      } else {
        audio.play().catch(console.warn);
      }
    }
  }, [isPlaying, activeSurah, activeAyahNumber, playAyah]);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setActiveAyahNumber(null);
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume;
      }
      return next;
    });
  }, [volume]);

  const setRangeLoop = useCallback((fromAyah: number, toAyah: number, targetLoops = 3) => {
    setLoopRange({
      fromAyah: Math.min(fromAyah, toAyah),
      toAyah: Math.max(fromAyah, toAyah),
      currentLoop: 1,
      targetLoops
    });
    setRepeatMode('range');
  }, []);

  const clearRangeLoop = useCallback(() => {
    setLoopRange(null);
    setRepeatMode('continuous');
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        activeSurah,
        activeAyahNumber,
        activeGlobalAyah,
        currentReciter,
        repeatMode,
        loopRange,
        playbackRate,
        currentTime,
        duration,
        volume,
        isMuted,
        isLoading,
        error,
        isFullPlayerOpen,
        favoriteReciters,
        recentReciters,
        playAyah,
        playSurah,
        togglePlayPause,
        stopAudio,
        nextTrack,
        prevTrack,
        seekTo,
        setReciter,
        setRepeatMode,
        setRangeLoop,
        clearRangeLoop,
        setPlaybackRate,
        setVolume,
        toggleMute,
        setIsFullPlayerOpen,
        toggleFavoriteReciter
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
