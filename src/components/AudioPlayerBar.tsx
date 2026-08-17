import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Repeat, 
  Repeat1, 
  Sliders, 
  User, 
  BookOpen, 
  Layers,
  X,
  FastForward,
  Rewind
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { SURAHS_LIST } from '../data/surahs';
import { RECITERS_LIST } from '../data/reciters';
import { AudioRepeatMode } from '../types';

interface AudioPlayerBarProps {
  onOpenQuranAt?: (surahNum: number, ayahNum: number) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ onOpenQuranAt }) => {
  const {
    isPlaying,
    activeSurah,
    activeAyahNumber,
    currentReciter,
    repeatMode,
    loopRange,
    playbackRate,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    isFullPlayerOpen,
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
    setIsFullPlayerOpen
  } = useAudio();

  const [showRangeModal, setShowRangeModal] = useState(false);
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(5);
  const [rangeTargetLoops, setRangeTargetLoops] = useState(3);
  const [showReciterDrawer, setShowReciterDrawer] = useState(false);

  if (!activeSurah && !isPlaying) {
    return null;
  }

  const surahMeta = activeSurah ? SURAHS_LIST.find((s) => s.number === activeSurah) : null;
  const currentSurahName = surahMeta ? surahMeta.name : '';

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seekTo(val);
  };

  const cycleRepeatMode = () => {
    if (repeatMode === 'continuous') {
      setRepeatMode('single_ayah');
    } else if (repeatMode === 'single_ayah') {
      setRepeatMode('surah');
    } else if (repeatMode === 'surah') {
      setShowRangeModal(true);
    } else {
      clearRangeLoop();
    }
  };

  const handleApplyRange = () => {
    if (surahMeta) {
      const validFrom = Math.max(1, Math.min(rangeFrom, surahMeta.numberOfAyahs));
      const validTo = Math.max(validFrom, Math.min(rangeTo, surahMeta.numberOfAyahs));
      setRangeLoop(validFrom, validTo, rangeTargetLoops);
      setShowRangeModal(false);
    }
  };

  return (
    <>
      {/* 1. Floating Mini Bar (Visible on bottom above tabs) */}
      <div 
        id="mini-audio-player-bar"
        className="fixed bottom-16 md:bottom-3 left-2 right-2 md:left-6 md:right-6 max-w-4xl md:mx-auto z-30 bg-[#1B3022]/95 border border-[#2D4536] shadow-2xl rounded-2xl backdrop-blur-xl text-white px-3 py-2.5 transition-all duration-300"
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Info & Reciter */}
          <div 
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
            onClick={() => setIsFullPlayerOpen(true)}
          >
            <div className="w-10 h-10 rounded-xl bg-[#2D4536] border border-[#3D5A47] flex items-center justify-center text-[#E9B161] font-bold shrink-0 relative overflow-hidden">
              <span className="text-xs">سورة</span>
              {isPlaying && (
                <div className="absolute inset-0 bg-[#1B3022]/50 flex items-end justify-center gap-0.5 pb-1">
                  <span className="w-1 bg-[#E9B161] rounded-full animate-eq-1"></span>
                  <span className="w-1 bg-[#E9B161] rounded-full animate-eq-2"></span>
                  <span className="w-1 bg-[#E9B161] rounded-full animate-eq-3"></span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  سورة {currentSurahName}
                </h4>
                {activeAyahNumber && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-[#142419] border border-[#3D5A47] text-[#E9B161] shrink-0 font-mono">
                    آية {activeAyahNumber}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#A8BCAD] truncate">
                القارئ: {currentReciter.name}
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Prev Ayah */}
            <button
              onClick={prevTrack}
              id="audio-prev-track-btn"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-[#2D4536] text-[#E0E7E1] hover:text-white transition-colors"
              title="الآية السابقة"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              id="audio-toggle-play-btn"
              disabled={isLoading}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] font-bold flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#1B3022] border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current mr-0.5" />
              )}
            </button>

            {/* Next Ayah */}
            <button
              onClick={nextTrack}
              id="audio-next-track-btn"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-[#2D4536] text-[#E0E7E1] hover:text-white transition-colors"
              title="الآية التالية"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Repeat Mode Badge */}
            <button
              onClick={cycleRepeatMode}
              id="audio-repeat-mode-mini-btn"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-[#2D4536] text-[#E0E7E1] hover:text-[#E9B161] transition-colors hidden xs:block"
              title={`وضع التكرار: ${
                repeatMode === 'continuous'
                  ? 'تشغيل متواصل'
                  : repeatMode === 'single_ayah'
                  ? 'تكرار الآية الحالية'
                  : repeatMode === 'surah'
                  ? 'تكرار السورة'
                  : 'تكرار نطاق آيات'
              }`}
            >
              {repeatMode === 'single_ayah' ? (
                <Repeat1 className="w-4 h-4 text-[#E9B161]" />
              ) : repeatMode === 'range' ? (
                <Layers className="w-4 h-4 text-[#E9B161]" />
              ) : (
                <Repeat className={`w-4 h-4 ${repeatMode === 'surah' ? 'text-[#E9B161]' : ''}`} />
              )}
            </button>

            {/* Expand / Close */}
            <button
              onClick={() => setIsFullPlayerOpen(true)}
              id="audio-expand-full-btn"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-[#2D4536] text-[#E0E7E1] hover:text-white transition-colors"
              title="تكبير المشغل والشاشة الكاملة"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full mt-1.5 flex items-center gap-2 text-[10px] text-[#A8BCAD] font-mono">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 relative h-1 bg-[#142419] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E9B161] rounded-full transition-all duration-150"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 2. Full Screen Audio Player Modal */}
      {isFullPlayerOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F1D13]/95 backdrop-blur-xl flex flex-col justify-between text-[#E0E7E1] p-4 sm:p-6 md:p-8 animate-fadeIn">
          {/* Top Bar */}
          <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
            <button
              onClick={() => setIsFullPlayerOpen(false)}
              id="full-player-close-btn"
              className="p-2 rounded-xl bg-[#1B3022] border border-[#2D4536] text-[#E0E7E1] hover:text-white"
            >
              <Minimize2 className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-[#E9B161] font-semibold">مشغل القرآن الكريم</span>
              <h3 className="text-sm font-bold text-white">سورة {currentSurahName}</h3>
            </div>

            <button
              onClick={() => setShowReciterDrawer(true)}
              id="full-player-reciter-menu-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B3022] border border-[#2D4536] text-xs text-[#E9B161] hover:bg-[#2D4536]"
            >
              <User className="w-3.5 h-3.5" />
              <span>تغيير القارئ</span>
            </button>
          </div>

          {/* Center Visual Art & Reciter Info */}
          <div className="max-w-2xl mx-auto w-full my-auto flex flex-col items-center text-center px-4 py-4">
            {/* Visual Sacred Medallion */}
            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-[#1B3022] via-[#233F2E] to-[#15271B] border-4 border-[#E9B161]/60 shadow-2xl flex items-center justify-center p-4 relative mb-6">
              <div className="text-center">
                <span className="text-xs text-[#E9B161] font-medium block">سورة</span>
                <span className="font-scheherazade text-3xl sm:text-4xl text-white font-bold block leading-tight">
                  {currentSurahName}
                </span>
                {activeAyahNumber && (
                  <span className="text-xs text-[#E9B161] block mt-1">الآية {activeAyahNumber}</span>
                )}
              </div>

              {isPlaying && (
                <div className="absolute inset-0 rounded-full border-2 border-[#E9B161] animate-ping opacity-25"></div>
              )}
            </div>

            {/* Reciter Name & Bio */}
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              القارئ الشيخ {currentReciter.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#A8BCAD] max-w-md mb-2">
              {currentReciter.subname} • <span className="text-[#E9B161]">رواية {currentReciter.riwayah}</span>
            </p>

            {/* Range Loop Badge if active */}
            {loopRange && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9B161]/20 border border-[#E9B161]/40 text-[#E9B161] text-xs my-1">
                <Layers className="w-3.5 h-3.5" />
                <span>تكرار النطاق: الآيات ({loopRange.fromAyah} - {loopRange.toAyah}) • التكرار {loopRange.currentLoop} من {loopRange.targetLoops}</span>
                <button 
                  onClick={clearRangeLoop} 
                  className="hover:text-red-400 font-bold ml-1"
                  title="إلغاء التكرار"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Go to Surah in Quran reader */}
            {activeSurah && onOpenQuranAt && (
              <button
                onClick={() => {
                  setIsFullPlayerOpen(false);
                  onOpenQuranAt(activeSurah, activeAyahNumber || 1);
                }}
                className="mt-2 text-xs text-[#E9B161] hover:underline flex items-center gap-1 underline-offset-4 font-semibold"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>عرض ومتابعة الآيات في المصحف</span>
              </button>
            )}
          </div>

          {/* Bottom Timeline & Controls */}
          <div className="max-w-2xl mx-auto w-full space-y-4">
            {/* Timeline Slider */}
            <div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime || 0}
                onChange={handleSeek}
                className="w-full h-1.5 bg-[#1B3022] rounded-lg appearance-none cursor-pointer accent-[#E9B161]"
              />
              <div className="flex justify-between text-xs text-[#A8BCAD] font-mono mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main playback buttons */}
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {/* Loop/Repeat */}
              <button
                onClick={cycleRepeatMode}
                id="full-player-repeat-btn"
                className={`p-2.5 rounded-2xl border transition-colors ${
                  repeatMode !== 'continuous'
                    ? 'bg-[#E9B161]/20 border-[#E9B161]/60 text-[#E9B161]'
                    : 'bg-[#1B3022] border-[#2D4536] text-[#A8BCAD] hover:text-white'
                }`}
                title={`الوضع الحالي: ${
                  repeatMode === 'continuous'
                    ? 'تشغيل متواصل'
                    : repeatMode === 'single_ayah'
                    ? 'تكرار الآية'
                    : repeatMode === 'surah'
                    ? 'تكرار السورة'
                    : 'تكرار نطاق'
                }`}
              >
                {repeatMode === 'single_ayah' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : repeatMode === 'range' ? (
                  <Layers className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>

              {/* Prev Verse */}
              <button
                onClick={prevTrack}
                id="full-player-prev-btn"
                className="p-3 rounded-2xl bg-[#1B3022] border border-[#2D4536] text-[#E0E7E1] hover:text-white hover:bg-[#2D4536] transition-colors"
                title="الآية السابقة"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              {/* Play/Pause Main */}
              <button
                onClick={togglePlayPause}
                id="full-player-play-btn"
                disabled={isLoading}
                className="w-16 h-16 rounded-2xl bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] font-bold flex items-center justify-center shadow-xl shadow-black/40 transition-transform active:scale-95"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-[#1B3022] border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current mr-1" />
                )}
              </button>

              {/* Next Verse */}
              <button
                onClick={nextTrack}
                id="full-player-next-btn"
                className="p-3 rounded-2xl bg-[#1B3022] border border-[#2D4536] text-[#E0E7E1] hover:text-white hover:bg-[#2D4536] transition-colors"
                title="الآية التالية"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              {/* Range Loop config modal trigger */}
              <button
                onClick={() => setShowRangeModal(true)}
                id="full-player-range-modal-btn"
                className="p-2.5 rounded-2xl bg-[#1B3022] border border-[#2D4536] text-[#A8BCAD] hover:text-[#E9B161] hover:bg-[#2D4536] transition-colors"
                title="تحديد تكرار نطاق آيات للحفظ"
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>

            {/* Secondary Controls: Speed & Volume */}
            <div className="flex items-center justify-between pt-2 border-t border-[#2D4536] text-xs text-[#A8BCAD]">
              {/* Playback speed */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">السرعة:</span>
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-1 rounded-md text-xs font-mono font-semibold ${
                      playbackRate === rate
                        ? 'bg-[#E9B161] text-[#1B3022] font-bold'
                        : 'bg-[#1B3022] text-[#A8BCAD] hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-[#A8BCAD] hover:text-white">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 sm:w-28 h-1.5 bg-[#1B3022] rounded-lg appearance-none cursor-pointer accent-[#E9B161]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Range Loop Configuration Dialog */}
      {showRangeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1B3022] border border-[#2D4536] rounded-2xl max-w-sm w-full p-5 text-[#E0E7E1] shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2D4536]">
              <h3 className="font-bold text-base text-[#E9B161] flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>تكرار نطاق آيات (للحفظ والمراجعة)</span>
              </h3>
              <button onClick={() => setShowRangeModal(false)} className="text-[#A8BCAD] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#E0E7E1] mb-4">
              حدد نطاق الآيات في <strong className="text-[#E9B161]">سورة {currentSurahName}</strong> وعدد مرات التكرار:
            </p>

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs text-[#A8BCAD]">من الآية رقم:</label>
                <input
                  type="number"
                  min={1}
                  max={surahMeta?.numberOfAyahs || 286}
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1.5 rounded-lg bg-[#142419] border border-[#3D5A47] text-center text-sm font-mono text-[#E9B161] font-bold"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="text-xs text-[#A8BCAD]">إلى الآية رقم:</label>
                <input
                  type="number"
                  min={1}
                  max={surahMeta?.numberOfAyahs || 286}
                  value={rangeTo}
                  onChange={(e) => setRangeTo(parseInt(e.target.value) || 5)}
                  className="w-20 px-2 py-1.5 rounded-lg bg-[#142419] border border-[#3D5A47] text-center text-sm font-mono text-[#E9B161] font-bold"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="text-xs text-[#A8BCAD]">عدد مرات التكرار:</label>
                <select
                  value={rangeTargetLoops}
                  onChange={(e) => setRangeTargetLoops(parseInt(e.target.value))}
                  className="w-24 px-2 py-1.5 rounded-lg bg-[#142419] border border-[#3D5A47] text-xs font-semibold text-[#E9B161]"
                >
                  <option value={2}>مرتان (2)</option>
                  <option value={3}>3 مرات</option>
                  <option value={5}>5 مرات</option>
                  <option value={7}>7 مرات</option>
                  <option value={10}>10 مرات</option>
                  <option value={999}>تكرار دائم</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApplyRange}
                className="flex-1 py-2.5 rounded-xl bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] font-bold text-xs transition-colors"
              >
                تطبيق التكرار وبدء التلاوة
              </button>
              <button
                onClick={() => setShowRangeModal(false)}
                className="py-2.5 px-4 rounded-xl bg-[#2D4536] text-[#E0E7E1] hover:bg-[#3D5A47] text-xs font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Quick Reciter Drawer inside Full Player */}
      {showReciterDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#142419] border-r border-[#2D4536] h-full p-4 flex flex-col text-[#E0E7E1] animate-slideLeft">
            <div className="flex items-center justify-between pb-3 border-b border-[#2D4536]">
              <h3 className="font-bold text-[#E9B161] text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>اختر القارئ</span>
              </h3>
              <button onClick={() => setShowReciterDrawer(false)} className="text-[#A8BCAD] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-3">
              {RECITERS_LIST.map((reciter) => {
                const isSelected = reciter.id === currentReciter.id;
                return (
                  <button
                    key={reciter.id}
                    onClick={() => {
                      setReciter(reciter);
                      setShowReciterDrawer(false);
                      if (activeSurah && activeAyahNumber) {
                        playAyah(activeSurah, activeAyahNumber, reciter);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#1B3022] border-[#E9B161] text-white'
                        : 'bg-[#1B3022]/40 border-[#2D4536] text-[#E0E7E1] hover:bg-[#1B3022]'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">{reciter.name}</h4>
                      <p className="text-[11px] text-[#A8BCAD]">{reciter.subname}</p>
                      <span className="text-[10px] text-[#E9B161] font-mono">رواية {reciter.riwayah}</span>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E9B161] text-[#1B3022] text-[10px] font-bold">
                        الحالي
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
