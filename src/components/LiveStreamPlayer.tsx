import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { LiveStreamChannel } from '../data/liveStreams';
import { Play, Pause, Volume2, VolumeX, Maximize, RefreshCw, ArrowUpRight, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LiveStreamPlayerProps {
  channel: LiveStreamChannel;
  activeServerIndex: number;
  onServerChange: (idx: number) => void;
}

export const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({
  channel,
  activeServerIndex,
  onServerChange
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeSource = channel.videoSources[activeServerIndex] || channel.videoSources[0];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSource) return;

    setHasError(false);
    setIsLoading(true);
    setErrorMessage(null);

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (activeSource.type === 'hls') {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          manifestLoadingTimeOut: 15000,
          manifestLoadingMaxRetry: 5,
          levelLoadingTimeOut: 15000,
          levelLoadingMaxRetry: 4
        });
        hlsRef.current = hls;

        hls.loadSource(activeSource.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.warn('Autoplay blocked or muted required:', err);
            // Try muted autoplay if unmuted was blocked
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {
              setIsPlaying(false);
            });
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.warn('HLS Stream error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Fatal network error encountered, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Fatal media error encountered, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                setIsLoading(false);
                setHasError(true);
                setErrorMessage('تعذر الاتصال بهذا السيرفر، يرجى تجربة سيرفر آخر من القائمة بالأعلى.');
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS for Safari iOS/macOS
        video.src = activeSource.url;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          video.play().catch(console.warn);
        });
        video.addEventListener('error', () => {
          setIsLoading(false);
          setHasError(true);
        });
      } else {
        setHasError(true);
        setErrorMessage('المتصفح لا يدعم بث HLS المباشر مباشرة، يرجى التبديل لسيرفر بديل.');
      }
    } else {
      // For iframe or standard embed
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeSource, channel.id]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(console.warn);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullScreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.warn);
    } else {
      document.exitFullscreen().catch(console.warn);
    }
  };

  const handleAutoSwitch = () => {
    const next = (activeServerIndex + 1) % channel.videoSources.length;
    onServerChange(next);
  };

  return (
    <div ref={containerRef} className="space-y-0 bg-black rounded-3xl overflow-hidden shadow-2xl border border-[#2D4536]">
      {/* Header bar with Server Selector & Direct 4K Link */}
      <div className="p-3 bg-[#111C14] border-b border-[#2D4536] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#A8BCAD] font-bold text-xs">سيرفر البث:</span>
          <div className="flex items-center gap-1 flex-wrap">
            {channel.videoSources.map((srv, idx) => (
              <button
                key={srv.id || srv.label}
                onClick={() => onServerChange(idx)}
                className={`px-3 py-1 rounded-xl font-bold transition-all text-xs flex items-center gap-1 ${
                  activeServerIndex === idx
                    ? 'bg-[#E9B161] text-[#1B3022] shadow-sm'
                    : 'bg-[#1E3626] text-stone-300 hover:bg-[#2A4B35]'
                }`}
              >
                {activeServerIndex === idx && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />}
                <span>{srv.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Direct Link button */}
        <a
          href={activeSource?.directUrl || channel.youtubeLiveUrl || 'https://www.youtube.com'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm"
        >
          <span>فتح البث بجودة 4K في يوتيوب</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Video Viewport */}
      <div className="relative aspect-video w-full bg-black flex flex-col items-center justify-center overflow-hidden">
        {activeSource.type === 'hls' ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              muted={isMuted}
              autoPlay
            />

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white">
                <RefreshCw className="w-8 h-8 text-[#E9B161] animate-spin" />
                <span className="text-xs text-[#E9B161] font-bold">جاري تحميل البث المباشر الفائق...</span>
              </div>
            )}

            {/* Error Message with Auto Recovery */}
            {hasError && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                <AlertTriangle className="w-12 h-12 text-amber-400 animate-bounce" />
                <div className="space-y-1 max-w-md">
                  <h4 className="font-bold text-sm text-stone-200">تعذر تشغيل هذا السيرفر في المتصفح حالياً</h4>
                  <p className="text-xs text-stone-400">
                    {errorMessage || 'قد يكون السيرفر مشغولاً أو مقيداً بجدار الحماية.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={handleAutoSwitch}
                    className="px-4 py-2 rounded-xl bg-[#E9B161] text-[#1B3022] font-bold text-xs flex items-center gap-1.5 hover:bg-[#D99A45]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>التبديل إلى السيرفر التالي تلقائياً</span>
                  </button>
                  <a
                    href={activeSource.directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-red-700"
                  >
                    <span>مشاهدة البث الخارجي 4K</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Video Custom Floating Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex items-center justify-between text-white text-xs opacity-90 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-stone-200" />}
                </button>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-600/80 text-white text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>مباشر 24/7</span>
                </div>
                <span className="text-[11px] text-stone-300 hidden sm:inline">{activeSource.quality || 'FHD 1080p'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoSwitch}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#E9B161] font-bold text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>تبديل السيرفر</span>
                </button>
                <button
                  onClick={toggleFullScreen}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="ملء الشاشة"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Iframe Player (Dailymotion / YouTube nocookie) */
          <div className="relative w-full h-full">
            <iframe
              key={`${channel.id}-${activeServerIndex}-${activeSource.url}`}
              src={activeSource.url}
              title={channel.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              loading="lazy"
            />
            {/* Direct 4K external button floating over iframe if needed */}
            <div className="absolute top-2 left-2 z-10">
              <a
                href={activeSource.directUrl || channel.youtubeLiveUrl || 'https://www.youtube.com'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-[#E9B161] font-bold text-[11px] backdrop-blur-md border border-[#E9B161]/30 transition-all shadow-md"
                title="فتح البث بأعلى جودة في نافذة مستقلة"
              >
                <span>فتح 4K</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Tip */}
      <div className="p-3 bg-[#142318] text-xs text-stone-300 flex items-center justify-between flex-wrap gap-2 border-t border-[#2D4536]">
        <div className="flex items-center gap-2 text-xs">
          <Info className="w-4 h-4 text-[#E9B161] shrink-0" />
          <span>
            {activeSource.note || 'إذا واجهت أي بطء في البث، يمكنك التبديل الفوري بين سيرفرات البث بالأعلى.'}
          </span>
        </div>
        <button
          onClick={handleAutoSwitch}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#233B2B] hover:bg-[#2E4E39] text-[#E9B161] font-bold text-xs transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>تبديل السيرفر تلقائياً</span>
        </button>
      </div>
    </div>
  );
};
