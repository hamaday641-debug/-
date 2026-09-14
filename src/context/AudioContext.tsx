import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Reciter, AudioRepeatMode, AudioLoopRange, AudioState } from '../types';
import { RECITERS_LIST, getAyahAudioUrl, getSurahAudioUrl, getSurahAudioUrlsWithFallbacks } from '../data/reciters';
import { SURAHS_LIST } from '../data/surahs';

export type AudioPlaybackMode = 'continuous_surah' | 'verse_by_verse';

interface AudioContextType extends AudioState {
  playAyah: (surahNumber: number, ayahNumber: number, reciterOverride?: Reciter) => void;
  playSurah: (surahNumber: number, reciterOverride?: Reciter) => void;
  playFullSurahStream: (surahNumber: number, reciterOverride?: Reciter) => void;
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
  isOffline: boolean;
  isOfflineModalOpen: boolean;
  setIsOfflineModalOpen: (open: boolean) => void;
  playbackMode: AudioPlaybackMode;
  setPlaybackMode: (mode: AudioPlaybackMode) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

// Audio cache helper for offline storage
import { getOfflineAudioUrl, cacheAudioUrl } from '../services/offlineAudioService';

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Seamless Dual-Channel HTML5 Audio elements for ZERO-LATENCY gapless playback
  const audioSlotA = useRef<HTMLAudioElement | null>(null);
  const audioSlotB = useRef<HTMLAudioElement | null>(null);
  const activeSlotRef = useRef<'A' | 'B'>('A');

  // Saved reciter preferences
  const [favoriteReciters, setFavoriteReciters] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nour_fav_reciters');
      return saved ? JSON.parse(saved) : ['mustafa_ismail', 'minshawi_murattal', 'husary_murattal', 'sudais', 'abdulbasit_murattal'];
    } catch {
      return ['mustafa_ismail', 'minshawi_murattal', 'husary_murattal', 'sudais'];
    }
  });

  const [recentReciters, setRecentReciters] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nour_recent_reciters');
      return saved ? JSON.parse(saved) : ['mustafa_ismail', 'minshawi_murattal', 'sudais'];
    } catch {
      return ['mustafa_ismail', 'sudais'];
    }
  });

  const [currentReciter, setCurrentReciterState] = useState<Reciter>(() => {
    try {
      const savedId = localStorage.getItem('nour_current_reciter_id');
      const found = RECITERS_LIST.find((r) => r.id === savedId);
      return found || RECITERS_LIST[0];
    } catch {
      return RECITERS_LIST[0];
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSurah, setActiveSurah] = useState<number | null>(null);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);
  const [activeGlobalAyah, setActiveGlobalAyah] = useState<number | null>(null);
  const [repeatMode, setRepeatMode] = useState<AudioRepeatMode>('continuous');
  const [playbackMode, setPlaybackMode] = useState<AudioPlaybackMode>('continuous_surah');
  const [loopRange, setLoopRange] = useState<AudioLoopRange | null>(null);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Volatile persistent state refs to prevent any stale closure bugs
  const activeSurahRef = useRef<number | null>(null);
  const activeAyahNumberRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const currentReciterRef = useRef<Reciter>(currentReciter);
  const repeatModeRef = useRef<AudioRepeatMode>(repeatMode);
  const playbackModeRef = useRef<AudioPlaybackMode>(playbackMode);
  const loopRangeRef = useRef<AudioLoopRange | null>(loopRange);
  const playbackRateRef = useRef<number>(playbackRate);
  const volumeRef = useRef<number>(volume);
  const isMutedRef = useRef<boolean>(isMuted);
  const currentCandidateUrlsRef = useRef<string[]>([]);
  const currentCandidateIndexRef = useRef<number>(0);

  useEffect(() => { activeSurahRef.current = activeSurah; }, [activeSurah]);
  useEffect(() => { activeAyahNumberRef.current = activeAyahNumber; }, [activeAyahNumber]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentReciterRef.current = currentReciter; }, [currentReciter]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { playbackModeRef.current = playbackMode; }, [playbackMode]);
  useEffect(() => { loopRangeRef.current = loopRange; }, [loopRange]);
  useEffect(() => { playbackRateRef.current = playbackRate; }, [playbackRate]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper to get active Audio element
  const getActiveAudio = () => {
    return activeSlotRef.current === 'A' ? audioSlotA.current : audioSlotB.current;
  };

  const getStandbyAudio = () => {
    return activeSlotRef.current === 'A' ? audioSlotB.current : audioSlotA.current;
  };

  // Preloads the upcoming ayah into the standby audio slot for verse-by-verse mode
  const preloadUpcomingTrack = useCallback(async (surahNum: number, ayahNum: number, reciter: Reciter) => {
    const surahMeta = SURAHS_LIST.find((s) => s.number === surahNum);
    if (!surahMeta) return;

    let targetSurah = surahNum;
    let targetAyah = ayahNum + 1;

    if (targetAyah > surahMeta.numberOfAyahs) {
      if (surahNum < 114) {
        targetSurah = surahNum + 1;
        targetAyah = 1;
      } else {
        return;
      }
    }

    const nextUrl = getAyahAudioUrl(reciter.everyAyahFolder, targetSurah, targetAyah);
    if (!nextUrl) return;

    const offlineNextUrl = await getOfflineAudioUrl(nextUrl);
    const chosenNext = offlineNextUrl || nextUrl;

    const standby = getStandbyAudio();
    if (standby) {
      standby.src = chosenNext;
      standby.preload = 'auto';
    }
  }, []);

  // Play a track on the currently active slot with INSTANT streaming & 100% offline support
  const playTrackSeamlessly = useCallback(async (
    url: string, 
    surahNum: number, 
    ayahNum: number | null, 
    pMode: AudioPlaybackMode,
    useStandbyIfReady = false
  ) => {
    setError(null);
    activeSurahRef.current = surahNum;
    activeAyahNumberRef.current = ayahNum;
    playbackModeRef.current = pMode;
    
    setActiveSurah(surahNum);
    setActiveAyahNumber(ayahNum);
    setPlaybackMode(pMode);

    let active = getActiveAudio();
    let standby = getStandbyAudio();

    if (!active) return;

    // Check if there is an offline cached Blob for this audio URL
    const offlineBlobUrl = await getOfflineAudioUrl(url);
    const effectiveUrl = offlineBlobUrl || url;

    if (useStandbyIfReady && standby && (standby.src === effectiveUrl || standby.src === url) && standby.readyState >= 2) {
      // Standby already buffered! Swap slots instantly
      active.pause();
      active.currentTime = 0;
      activeSlotRef.current = activeSlotRef.current === 'A' ? 'B' : 'A';
      active = standby;
    } else {
      if (standby) {
        standby.pause();
        standby.currentTime = 0;
      }
      // Instant direct assignment
      if (active.src !== effectiveUrl) {
        active.src = effectiveUrl;
        active.load();
      }
    }

    active.playbackRate = playbackRateRef.current;
    active.volume = isMutedRef.current ? 0 : volumeRef.current;

    setIsLoading(true);
    const playPromise = active.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          // Optional non-blocking cache when online
          if (!offlineBlobUrl && navigator.onLine) {
            cacheAudioUrl(url);
          }
        })
        .catch((err) => {
          console.warn('Audio play notice:', err);
          setIsLoading(false);
        });
    }

    // Schedule standby preload for next verse if in verse mode
    if (pMode === 'verse_by_verse' && ayahNum && currentReciterRef.current.everyAyahFolder) {
      preloadUpcomingTrack(surahNum, ayahNum, currentReciterRef.current);
    }
  }, [preloadUpcomingTrack]);

  // Play Full Continuous Uninterrupted Surah Stream (Instant streaming from server)
  const playFullSurahStream = useCallback((surahNumber: number, reciterOverride?: Reciter) => {
    const reciter = reciterOverride || currentReciterRef.current;
    if (reciterOverride && reciterOverride.id !== currentReciterRef.current.id) {
      setCurrentReciterState(reciterOverride);
      currentReciterRef.current = reciterOverride;
      try {
        localStorage.setItem('nour_current_reciter_id', reciterOverride.id);
      } catch {}
    }

    const fallbackUrls = getSurahAudioUrlsWithFallbacks(reciter, surahNumber);
    currentCandidateUrlsRef.current = fallbackUrls;
    currentCandidateIndexRef.current = 0;
    const primaryUrl = fallbackUrls[0] || (reciter.mp3quranServer
      ? getSurahAudioUrl(reciter.mp3quranServer, surahNumber)
      : getAyahAudioUrl(reciter.everyAyahFolder, surahNumber, 1));

    playTrackSeamlessly(primaryUrl, surahNumber, 1, 'continuous_surah', false);
  }, [playTrackSeamlessly]);

  // Play Surah (Continuous mode by default for smooth uninterrupted listening)
  const playSurah = useCallback((surahNumber: number, reciterOverride?: Reciter) => {
    playFullSurahStream(surahNumber, reciterOverride);
  }, [playFullSurahStream]);

  // Play specific Ayah (Verse-by-Verse mode with instant streaming)
  const playAyah = useCallback((surahNumber: number, ayahNumber: number, reciterOverride?: Reciter) => {
    const reciter = reciterOverride || currentReciterRef.current;
    if (reciterOverride && reciterOverride.id !== currentReciterRef.current.id) {
      setCurrentReciterState(reciterOverride);
      currentReciterRef.current = reciterOverride;
      try {
        localStorage.setItem('nour_current_reciter_id', reciterOverride.id);
      } catch {}
    }

    // If reciter is full surah only (like Sheikh Mohamed Rifat / Bahtimi), play their real recording
    if (reciter.isFullSurahOnly || !reciter.everyAyahFolder) {
      const url = reciter.mp3quranServer
        ? getSurahAudioUrl(reciter.mp3quranServer, surahNumber)
        : `https://server14.mp3quran.net/refat/${String(surahNumber).padStart(3, '0')}.mp3`;
      playTrackSeamlessly(url, surahNumber, ayahNumber, 'continuous_surah', false);
      return;
    }

    const url = getAyahAudioUrl(reciter.everyAyahFolder, surahNumber, ayahNumber);
    playTrackSeamlessly(url, surahNumber, ayahNumber, 'verse_by_verse', false);
  }, [playTrackSeamlessly]);

  // Reciter selection with INSTANT live hot-switching
  const setReciter = useCallback((reciter: Reciter) => {
    setCurrentReciterState(reciter);
    currentReciterRef.current = reciter;
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

    // INSTANT LIVE SWITCH: If audio is active or playing, immediately switch to the new reciter!
    const activeS = activeSurahRef.current;
    const activeA = activeAyahNumberRef.current;
    const wasPlaying = isPlayingRef.current;

    if (activeS) {
      if (playbackModeRef.current === 'continuous_surah') {
        playFullSurahStream(activeS, reciter);
      } else {
        playAyah(activeS, activeA || 1, reciter);
      }
    }
  }, [playFullSurahStream, playAyah]);

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

  // Advance to next track with 0.00ms gap!
  const advanceToNext = useCallback(() => {
    const sNum = activeSurahRef.current;
    const aNum = activeAyahNumberRef.current;
    const pMode = playbackModeRef.current;
    const rMode = repeatModeRef.current;
    const lRange = loopRangeRef.current;
    const reciter = currentReciterRef.current;

    if (!sNum) return;

    // 1. Single Ayah repeat mode
    if (rMode === 'single_ayah' && pMode === 'verse_by_verse' && aNum) {
      const url = getAyahAudioUrl(reciter.everyAyahFolder, sNum, aNum);
      playTrackSeamlessly(url, sNum, aNum, 'verse_by_verse', false);
      return;
    }

    // 2. Full Continuous Surah Stream Mode -> Advances to Next Surah
    if (pMode === 'continuous_surah') {
      if (rMode === 'surah') {
        playFullSurahStream(sNum, reciter);
      } else if (sNum < 114) {
        playFullSurahStream(sNum + 1, reciter);
      } else {
        setIsPlaying(false);
      }
      return;
    }

    // 3. Verse-by-Verse Mode: Ultra-smooth zero gap transition
    if (pMode === 'verse_by_verse' && aNum) {
      const surahMeta = SURAHS_LIST.find((s) => s.number === sNum);
      if (!surahMeta) return;

      // Range loop handling
      if (lRange) {
        if (aNum < lRange.toAyah) {
          const nextAyah = aNum + 1;
          const url = getAyahAudioUrl(reciter.everyAyahFolder, sNum, nextAyah);
          playTrackSeamlessly(url, sNum, nextAyah, 'verse_by_verse', true);
          return;
        } else {
          if (lRange.currentLoop < lRange.targetLoops) {
            const nextRange = { ...lRange, currentLoop: lRange.currentLoop + 1 };
            loopRangeRef.current = nextRange;
            setLoopRange(nextRange);
            const url = getAyahAudioUrl(reciter.everyAyahFolder, sNum, lRange.fromAyah);
            playTrackSeamlessly(url, sNum, lRange.fromAyah, 'verse_by_verse', false);
            return;
          }
        }
      }

      // Normal progression to next Ayah (using standby pre-buffered audio)
      if (aNum < surahMeta.numberOfAyahs) {
        const nextAyah = aNum + 1;
        const url = getAyahAudioUrl(reciter.everyAyahFolder, sNum, nextAyah);
        playTrackSeamlessly(url, sNum, nextAyah, 'verse_by_verse', true);
      } else {
        // End of Surah reached in verse mode
        if (rMode === 'surah') {
          const url = getAyahAudioUrl(reciter.everyAyahFolder, sNum, 1);
          playTrackSeamlessly(url, sNum, 1, 'verse_by_verse', false);
        } else if (rMode === 'continuous' && sNum < 114) {
          const url = getAyahAudioUrl(reciter.everyAyahFolder, sNum + 1, 1);
          playTrackSeamlessly(url, sNum + 1, 1, 'verse_by_verse', true);
        } else {
          setIsPlaying(false);
        }
      }
    }
  }, [playTrackSeamlessly, playFullSurahStream]);

  const nextTrack = useCallback(() => {
    advanceToNext();
  }, [advanceToNext]);

  const prevTrack = useCallback(() => {
    const sNum = activeSurahRef.current;
    const aNum = activeAyahNumberRef.current;
    const pMode = playbackModeRef.current;
    const reciter = currentReciterRef.current;
    if (!sNum) return;

    if (pMode === 'continuous_surah') {
      if (sNum > 1) playFullSurahStream(sNum - 1, reciter);
      return;
    }

    if (aNum && aNum > 1) {
      const prevAyah = aNum - 1;
      const url = getAyahAudioUrl(reciter.everyAyahFolder, sNum, prevAyah);
      playTrackSeamlessly(url, sNum, prevAyah, 'verse_by_verse', false);
    } else if (sNum > 1) {
      const prevSurahMeta = SURAHS_LIST.find((s) => s.number === sNum - 1);
      if (prevSurahMeta) {
        const targetAyah = prevSurahMeta.numberOfAyahs;
        const url = getAyahAudioUrl(reciter.everyAyahFolder, sNum - 1, targetAyah);
        playTrackSeamlessly(url, sNum - 1, targetAyah, 'verse_by_verse', false);
      }
    }
  }, [playFullSurahStream, playTrackSeamlessly]);

  // Attach audio listeners to both slots
  useEffect(() => {
    const slotA = new Audio();
    slotA.preload = 'auto';
    audioSlotA.current = slotA;

    const slotB = new Audio();
    slotB.preload = 'auto';
    audioSlotB.current = slotB;

    const setupSlotListeners = (slot: HTMLAudioElement, slotId: 'A' | 'B') => {
      const onTimeUpdate = () => {
        if (activeSlotRef.current === slotId) {
          setCurrentTime(slot.currentTime);
          setDuration(slot.duration || 0);
        }
      };

      const onLoadedMetadata = () => {
        if (activeSlotRef.current === slotId) {
          setDuration(slot.duration || 0);
          setIsLoading(false);
        }
      };

      const onWaiting = () => {
        if (activeSlotRef.current === slotId) setIsLoading(true);
      };

      const onPlaying = () => {
        if (activeSlotRef.current === slotId) {
          setIsLoading(false);
          setIsPlaying(true);
        }
      };

      const onPause = () => {
        if (activeSlotRef.current === slotId) {
          setIsPlaying(false);
        }
      };

      const onEnded = () => {
        if (activeSlotRef.current === slotId) {
          advanceToNext();
        }
      };

      const onError = async (e: any) => {
        console.warn(`Audio slot ${slotId} playback error:`, e);
        if (activeSlotRef.current === slotId) {
          const sNum = activeSurahRef.current;
          const aNum = activeAyahNumberRef.current || 1;
          const reciter = currentReciterRef.current;

          // 1. If in continuous surah mode and network failed, try offline verse-by-verse audio if available
          if (playbackModeRef.current === 'continuous_surah' && sNum && reciter?.everyAyahFolder) {
            const vUrl = getAyahAudioUrl(reciter.everyAyahFolder, sNum, aNum);
            const offlineAyahUrl = await getOfflineAudioUrl(vUrl);
            if (offlineAyahUrl) {
              console.log('Falling back to downloaded verse-by-verse audio for offline playback');
              playbackModeRef.current = 'verse_by_verse';
              setPlaybackMode('verse_by_verse');
              slot.src = offlineAyahUrl;
              slot.load();
              slot.play().then(() => {
                setIsPlaying(true);
                setIsLoading(false);
              }).catch(() => {
                setIsLoading(false);
                setIsPlaying(false);
              });
              return;
            }
          }

          // 2. Check if there is an alternative mirror candidate URL available
          const candidates = currentCandidateUrlsRef.current;
          const nextIdx = currentCandidateIndexRef.current + 1;
          if (candidates && nextIdx < candidates.length && activeSurahRef.current) {
            currentCandidateIndexRef.current = nextIdx;
            const nextCandidateUrl = candidates[nextIdx];
            const offlineNext = await getOfflineAudioUrl(nextCandidateUrl);
            const chosenNextUrl = offlineNext || nextCandidateUrl;
            console.log(`Switching seamlessly to alternative mirror: ${chosenNextUrl}`);
            slot.src = chosenNextUrl;
            slot.load();
            slot.play().then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            }).catch(() => {
              setIsLoading(false);
              setIsPlaying(false);
            });
            return;
          }
          setIsLoading(false);
          setIsPlaying(false);
        }
      };

      slot.addEventListener('timeupdate', onTimeUpdate);
      slot.addEventListener('loadedmetadata', onLoadedMetadata);
      slot.addEventListener('waiting', onWaiting);
      slot.addEventListener('playing', onPlaying);
      slot.addEventListener('pause', onPause);
      slot.addEventListener('ended', onEnded);
      slot.addEventListener('error', onError);

      return () => {
        slot.removeEventListener('timeupdate', onTimeUpdate);
        slot.removeEventListener('loadedmetadata', onLoadedMetadata);
        slot.removeEventListener('waiting', onWaiting);
        slot.removeEventListener('playing', onPlaying);
        slot.removeEventListener('pause', onPause);
        slot.removeEventListener('ended', onEnded);
        slot.removeEventListener('error', onError);
        slot.pause();
        slot.src = '';
      };
    };

    const cleanupA = setupSlotListeners(slotA, 'A');
    const cleanupB = setupSlotListeners(slotB, 'B');

    return () => {
      cleanupA();
      cleanupB();
    };
  }, [advanceToNext]);

  // Lock screen / MediaSession API controls
  useEffect(() => {
    if (!('mediaSession' in navigator) || !activeSurah) return;

    const surahMeta = SURAHS_LIST.find((s) => s.number === activeSurah);
    const surahName = surahMeta ? surahMeta.name : `السورة ${activeSurah}`;
    const trackTitle = playbackMode === 'verse_by_verse' && activeAyahNumber 
      ? `سورة ${surahName} - الآية ${activeAyahNumber}` 
      : `سورة ${surahName} كاملة`;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: trackTitle,
      artist: `القارئ الشيخ ${currentReciter.name}`,
      album: 'القرآن الكريم - طريق الهدى',
      artwork: [
        { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      getActiveAudio()?.play().catch(console.warn);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      getActiveAudio()?.pause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      prevTrack();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      nextTrack();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      const active = getActiveAudio();
      if (details.seekTime !== undefined && active) {
        active.currentTime = details.seekTime;
      }
    });
  }, [activeSurah, activeAyahNumber, currentReciter, playbackMode, nextTrack, prevTrack]);

  const togglePlayPause = useCallback(() => {
    const audio = getActiveAudio();
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src && (!activeSurah || !activeAyahNumber)) {
        playSurah(1);
      } else {
        audio.play().catch(console.warn);
        setIsPlaying(true);
      }
    }
  }, [isPlaying, activeSurah, activeAyahNumber, playSurah]);

  const stopAudio = useCallback(() => {
    const active = getActiveAudio();
    const standby = getStandbyAudio();
    if (active) {
      active.pause();
      active.currentTime = 0;
    }
    if (standby) {
      standby.pause();
      standby.currentTime = 0;
    }
    setIsPlaying(false);
    setActiveAyahNumber(null);
  }, []);

  const seekTo = useCallback((time: number) => {
    const active = getActiveAudio();
    if (active) {
      active.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    const active = getActiveAudio();
    const standby = getStandbyAudio();
    if (active) active.playbackRate = rate;
    if (standby) standby.playbackRate = rate;
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    setIsMuted(vol === 0);
    const active = getActiveAudio();
    const standby = getStandbyAudio();
    if (active) active.volume = vol;
    if (standby) standby.volume = vol;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const effectiveVol = next ? 0 : volume;
      const active = getActiveAudio();
      const standby = getStandbyAudio();
      if (active) active.volume = effectiveVol;
      if (standby) standby.volume = effectiveVol;
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
        playbackMode,
        setPlaybackMode,
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
        playFullSurahStream,
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
        toggleFavoriteReciter,
        isOffline,
        isOfflineModalOpen,
        setIsOfflineModalOpen
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
