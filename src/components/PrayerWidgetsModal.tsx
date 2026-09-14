import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Volume2, 
  Check, 
  Sparkles, 
  Play, 
  Radio, 
  Tv, 
  Eye, 
  CheckCircle2, 
  Layers,
  Sliders,
  Palette,
  FileCode,
  Share2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  BellRing,
  Zap,
  ShieldCheck,
  AlertCircle,
  Copy,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { 
  adhanScheduler, 
  getFormattedPrePrayerSpeech, 
  getAvailableArabicVoices 
} from '../services/adhanScheduler';
import { prayerWidgetService } from '../services/prayerWidgetService';
import { prayerTimesService } from '../services/prayerTimes';
import { getHijriDateArabic } from '../utils/islamicDates';
import { 
  downloadWidgetImage, 
  downloadOfflineHtmlWidget, 
  generateWidgetImageDataUrl,
  shareOrSaveWidgetImage,
  WidgetStyle, 
  WidgetAspect, 
  WidgetData 
} from '../utils/widgetImageGenerator';
import { promptDirectInstall, hasDeferredPrompt, checkIsAppInstalled } from '../utils/pwaUtils';

interface PrayerWidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAmbientLockScreen: () => void;
}

export const PrayerWidgetsModal: React.FC<PrayerWidgetsModalProps> = ({
  isOpen,
  onClose,
  onOpenAmbientLockScreen
}) => {
  type WidgetModalTab = 'live_widget' | 'install_guide' | 'background_alert' | 'voice_alert' | 'styles_and_download' | 'lockscreen';
  const [activeTab, setActiveTab] = useState<WidgetModalTab>('live_widget');
  
  // Widget Customization & Download states
  const [selectedStyle, setSelectedStyle] = useState<WidgetStyle>('gold');
  const [selectedAspect, setSelectedAspect] = useState<WidgetAspect>('wide');
  const [previewMode, setPreviewMode] = useState<'interactive' | 'image'>('interactive');
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);
  const [isDownloadingHtml, setIsDownloadingHtml] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Guide platform tab
  const [guidePlatform, setGuidePlatform] = useState<'android' | 'ios'>(() => {
    if (typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      return 'ios';
    }
    return 'android';
  });

  // Pre-prayer alert voice states
  const [preAlertEnabled, setPreAlertEnabled] = useState(adhanScheduler.isPrePrayerAlertEnabled());
  const [preAlertMinutes, setPreAlertMinutes] = useState(adhanScheduler.getPrePrayerAlertMinutes());
  const [preAlertVoice, setPreAlertVoice] = useState(adhanScheduler.isPrePrayerVoiceEnabled());
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>(adhanScheduler.getPreferredVoiceUri() || '');
  const [voiceRate, setVoiceRate] = useState<number>(adhanScheduler.getVoiceRate());
  const [voicePitch, setVoicePitch] = useState<number>(adhanScheduler.getVoicePitch());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testingPrayerKey, setTestingPrayerKey] = useState<string | null>(null);
  const [isVoiceSamplePlaying, setIsVoiceSamplePlaying] = useState(false);

  // Live services state
  const [isLockScreenMediaActive, setIsLockScreenMediaActive] = useState(prayerWidgetService.isLockScreenWidgetActive());
  const [isFloatingActive, setIsFloatingActive] = useState(prayerWidgetService.isFloatingWidgetActive());
  const [isBgAlertActive, setIsBgAlertActive] = useState(false);
  const [bgAlertMsg, setBgAlertMsg] = useState<string | null>(null);

  // PWA & Home Screen installation state
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(() => checkIsAppInstalled());
  const [showPwaHelpModal, setShowPwaHelpModal] = useState<boolean>(false);
  const [copiedWidgetUrl, setCopiedWidgetUrl] = useState<boolean>(false);

  // Live timer for previews & clocks
  const [now, setNow] = useState(new Date());

  // Load available speech synthesis voices
  useEffect(() => {
    const updateVoices = () => {
      const voices = getAvailableArabicVoices();
      setAvailableVoices(voices);
      if (!selectedVoiceUri && voices.length > 0) {
        const preferred = adhanScheduler.getPreferredVoiceUri();
        if (preferred) {
          setSelectedVoiceUri(preferred);
        } else {
          setSelectedVoiceUri(voices[0].voiceURI);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, [selectedVoiceUri]);

  useEffect(() => {
    const unsubMedia = prayerWidgetService.subscribeLockScreen((active) => {
      setIsLockScreenMediaActive(active);
    });

    const unsubFloating = prayerWidgetService.subscribeFloating((active) => {
      setIsFloatingActive(active);
    });

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      unsubMedia();
      unsubFloating();
      clearInterval(timer);
    };
  }, []);

  const city = adhanScheduler.getSelectedCity();
  const times = prayerTimesService.getTodayPrayerTimes(now);
  const hijri = getHijriDateArabic(now);
  const gregorianStr = now.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const hours = now.getHours();
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours % 12 || 12;
  const liveClockStr = `${String(displayHours).padStart(2, '0')}:${mins}:${secs} ${ampm}`;

  const widgetData: WidgetData = {
    cityName: city.name,
    hijriDate: hijri.fullArabic,
    gregorianDate: gregorianStr,
    nextPrayerName: times.nextPrayerName,
    nextPrayerTime: times.nextPrayerTime,
    timeToNext: times.timeToNext,
    prayers: {
      fajr: times.fajr,
      dhuhr: times.dhuhr,
      asr: times.asr,
      maghrib: times.maghrib,
      isha: times.isha
    }
  };

  // Generate real preview image URL for direct display and long-press saving
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    generateWidgetImageDataUrl(widgetData, selectedStyle, selectedAspect)
      .then((url) => {
        if (isMounted) {
          setPreviewImageUrl(url);
        }
      })
      .catch((err) => {
        console.error('Failed to generate widget preview image:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedStyle, selectedAspect, widgetData.nextPrayerTime, widgetData.timeToNext, widgetData.cityName]);

  // Share or Save directly to phone gallery
  const handleShareOrSaveWidgetImage = async () => {
    setIsSharingImage(true);
    try {
      const shared = await shareOrSaveWidgetImage(widgetData, selectedStyle, selectedAspect);
      if (shared) {
        setDownloadSuccessMessage('تم فتح نافذة المشاركة والحفظ! اختر "حفظ في المعرض / الاستوديو" لتثبيتها فوراً.');
        setTimeout(() => setDownloadSuccessMessage(null), 7000);
      } else {
        // If native share is not supported, fallback to direct download
        await handleDownloadWidgetImage();
      }
    } catch {
      await handleDownloadWidgetImage();
    } finally {
      setIsSharingImage(false);
    }
  };

  // Download high-resolution widget image
  const handleDownloadWidgetImage = async () => {
    setIsDownloadingImage(true);
    try {
      await downloadWidgetImage(widgetData, selectedStyle, selectedAspect);
      setDownloadSuccessMessage('تم تحميل صورة الودجت بنجاح إلى جهازك! يمكنك الآن إضافتها لشاشتك الرئيسية.');
      setTimeout(() => setDownloadSuccessMessage(null), 7000);
    } catch (err) {
      console.error('Failed to download widget image:', err);
      setDownloadSuccessMessage('حدث خطأ أثناء تنزيل الودجت، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDownloadingImage(false);
    }
  };

  // Download standalone offline HTML widget
  const handleDownloadHtmlWidget = () => {
    setIsDownloadingHtml(true);
    try {
      downloadOfflineHtmlWidget(widgetData, selectedStyle);
      setDownloadSuccessMessage('تم تحميل ملف الودجت التفاعلي (HTML)! يمكنك فتحه واستخدامه أوفلاين.');
      setTimeout(() => setDownloadSuccessMessage(null), 7000);
    } finally {
      setIsDownloadingHtml(false);
    }
  };

  // Pre-prayer toggles
  const handleTogglePreAlert = () => {
    const next = !preAlertEnabled;
    setPreAlertEnabled(next);
    adhanScheduler.setPrePrayerAlertEnabled(next);
  };

  const handleChangePreAlertMinutes = (mins: number) => {
    setPreAlertMinutes(mins);
    adhanScheduler.setPrePrayerAlertMinutes(mins);
  };

  const handleTogglePreAlertVoice = () => {
    const next = !preAlertVoice;
    setPreAlertVoice(next);
    adhanScheduler.setPrePrayerVoiceEnabled(next);
  };

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceUri(uri);
    adhanScheduler.setPreferredVoiceUri(uri);
  };

  const handleVoiceRateChange = (rate: number) => {
    setVoiceRate(rate);
    adhanScheduler.setVoiceRate(rate);
  };

  const handleVoicePitchChange = (pitch: number) => {
    setVoicePitch(pitch);
    adhanScheduler.setVoicePitch(pitch);
  };

  // Test full pre-prayer pronunciation sample with exact diacritics
  const handlePlayVoiceSample = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    setIsVoiceSamplePlaying(true);
    window.speechSynthesis.cancel();

    // Sample phrase with carefully separated "وَ صَلِّ" and diacritized "صَلَّيْتَ" and Quranic Ayah without 'ف'
    const sampleText = 'اقْتَرَبَ مَوْعِدُ أَذَانِ صَلَاةِ الظُّهْرِ، إِنْ لَمْ تَكُنْ صَلَّيْتَ صَلَاةَ الفَجْرِ فَقُمْ، وَ صَلِّ، إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا.';
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.lang = 'ar-SA';
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.voiceURI === selectedVoiceUri || v.name === selectedVoiceUri);
    if (match) {
      utterance.voice = match;
    }

    utterance.onend = () => setIsVoiceSamplePlaying(false);
    utterance.onerror = () => setIsVoiceSamplePlaying(false);

    window.speechSynthesis.speak(utterance);
    setTimeout(() => {
      setIsVoiceSamplePlaying(false);
    }, 6000);
  };

  const handleToggleFloatingWidget = async () => {
    if (isFloatingActive) {
      await prayerWidgetService.stopFloatingWidget();
      setIsFloatingActive(false);
      setDownloadSuccessMessage('تم إيقاف الودجت المصغّر العائم بنجاح.');
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } else {
      const ok = await prayerWidgetService.startFloatingWidget();
      setIsFloatingActive(ok);
      if (!ok) {
        setDownloadSuccessMessage('لتشغيل الودجت العائم، يرجى السماح بميزة النافذة المنبثقة (Picture-in-Picture) في متصفحك.');
      } else {
        setDownloadSuccessMessage('🟢 تم تشغيل الودجت المصغّر الحي فوق الشاشة الرئيسية! يمكنك نقله إلى أي مكان وسحبه وتكبيره.');
      }
      setTimeout(() => setDownloadSuccessMessage(null), 6000);
    }
  };

  const handleInstallPwa = async () => {
    try {
      const outcome = await promptDirectInstall();
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
        setDownloadSuccessMessage('🎉 جزاك الله خيراً! تم تثبيت تطبيق طريق الهدى بنجاح على شاشتك الرئيسية!');
        setTimeout(() => setDownloadSuccessMessage(null), 6000);
      } else if (outcome === 'unavailable') {
        setShowPwaHelpModal(true);
      }
    } catch {
      setShowPwaHelpModal(true);
    }
  };

  const getPublicWidgetUrl = () => {
    if (typeof window === 'undefined') return '';
    let origin = window.location.origin;
    // CRITICAL: ais-dev- is the private development URL protected by Google Cloud Identity-Aware Proxy (IAP)
    // which redirects external apps/browsers to accounts.google.com for login.
    // Replacing 'ais-dev-' with 'ais-pre-' converts it to the unrestricted public preview URL
    // which NEVER redirects or asks for Google sign in!
    if (origin.includes('ais-dev-')) {
      origin = origin.replace('ais-dev-', 'ais-pre-');
    }
    const params = new URLSearchParams({
      city: city.name,
      lat: city.lat.toString(),
      lng: city.lng.toString(),
      tz: city.timezone.toString(),
    });
    return `${origin}/widget.html?${params.toString()}`;
  };

  const handleCopyDirectWidgetUrl = async () => {
    try {
      const widgetUrl = getPublicWidgetUrl();
      await navigator.clipboard.writeText(widgetUrl);
      setCopiedWidgetUrl(true);
      setDownloadSuccessMessage('✅ تم نسخ الرابط العام المفتوح (بدون حساب جوجل نهائياً)! يمكنك الآن لصقه في تطبيق الودجت على هاتفك.');
      setTimeout(() => {
        setCopiedWidgetUrl(false);
        setDownloadSuccessMessage(null);
      }, 6000);
    } catch {
      const widgetUrl = getPublicWidgetUrl();
      setDownloadSuccessMessage(`رابط الودجت المفتوح: ${widgetUrl}`);
    }
  };

  const handleStopFloatingWidgetPermanently = async () => {
    await prayerWidgetService.stopFloatingWidget();
    prayerWidgetService.ensureFloatingDisabled();
    setIsFloatingActive(false);
    setDownloadSuccessMessage('تم تأكيد إيقاف وتعطيل الودجت العائم بنجاح 🚫');
    setTimeout(() => setDownloadSuccessMessage(null), 5000);
  };

  const [backgroundTrialCountdown, setBackgroundTrialCountdown] = useState<number | null>(null);

  const handleStartBackgroundTrial = async () => {
    if (backgroundTrialCountdown !== null) return;
    
    // Request permission if needed
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }

    // Unlock audio context and media session
    adhanScheduler.unlockAudioEngine();
    await prayerWidgetService.startLockScreenMediaWidget().catch(() => {});

    setBackgroundTrialCountdown(10);
    setDownloadSuccessMessage('⏳ بدأ العد التنازلي للتجربة! يرجى قفل شاشة هاتفك الآن لتجربة سماع التنبيه وشاشتك مقفلة.');

    adhanScheduler.scheduleBackgroundTrial(10);

    const interval = setInterval(() => {
      setBackgroundTrialCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setTimeout(() => setDownloadSuccessMessage(null), 6000);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEnableBackgroundAlert = async () => {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          setBgAlertMsg('⚠️ يرجى السماح بالإشعارات في هاتفك حتى يتمكن التطبيق من إطلاق الأذان في موعده.');
          return;
        }
      }

      adhanScheduler.unlockAudioEngine();
      await adhanScheduler.syncAdhanScheduleToServiceWorker();
      await prayerWidgetService.startLockScreenMediaWidget();

      setIsLockScreenMediaActive(true);
      setIsBgAlertActive(true);
      setBgAlertMsg('✅ تم تفعيل التنبيه بنجاح! تم جدولة مواقيت الصلوات وتثبيت الخدمة في الخلفية لتعمل حتى والتطبيق وشاشة الهاتف مغلقة.');
      setTimeout(() => setBgAlertMsg(null), 9000);
    } catch (e) {
      console.warn('Background alert enable error:', e);
      setBgAlertMsg('حدث خطأ أثناء التفعيل، تأكد من دعم الإشعارات في متصفحك.');
    }
  };

  const handleTestPrayerSpeech = (prayerKey: string) => {
    setTestingPrayerKey(prayerKey);
    adhanScheduler.unlockAudioEngine();
    adhanScheduler.testPrePrayerAlert(prayerKey, preAlertMinutes);
    setTimeout(() => {
      setTestingPrayerKey(null);
    }, 6000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#142419] border-2 border-[#2D4536] rounded-3xl max-w-3xl w-full p-4 sm:p-6 space-y-5 text-right shadow-2xl my-auto animate-fade-in text-[#E0E7E1]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2D4536] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E9B161] text-[#142419] shadow-md">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-white font-scheherazade">
                ودجت شاشة الهاتف والتنبيه الصوتي
              </h3>
              <p className="text-xs text-[#A8BCAD]">
                اختيار شكل الودجت وتحميله • طريقة الإضافة للشاشة • ضبط النطق الفصيح للآية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#A8BCAD] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 p-1 bg-[#102015] rounded-2xl border border-[#2D4536]">
          <button
            type="button"
            onClick={() => setActiveTab('live_widget')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'live_widget'
                ? 'bg-[#E9B161] text-[#142419] shadow-md font-black'
                : 'text-[#A8BCAD] hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>الودجت الحي وساعة القفل</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('install_guide')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'install_guide'
                ? 'bg-[#E9B161] text-[#142419] shadow-md font-black'
                : 'text-[#A8BCAD] hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>التثبيت على الشاشة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('background_alert')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'background_alert'
                ? 'bg-[#E9B161] text-[#142419] shadow-md font-black'
                : 'text-amber-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>الأذان وقفل الهاتف 📴</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice_alert')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'voice_alert'
                ? 'bg-[#E9B161] text-[#142419] shadow-md font-black'
                : 'text-[#A8BCAD] hover:text-white hover:bg-white/5'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>ضبط الصوت والنطق</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('styles_and_download')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'styles_and_download'
                ? 'bg-[#E9B161] text-[#142419] shadow-md font-black'
                : 'text-[#A8BCAD] hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>خلفيات وتصاميم الاستوديو</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lockscreen')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer col-span-2 sm:col-span-1 ${
              activeTab === 'lockscreen'
                ? 'bg-[#E9B161] text-[#142419] shadow-md font-black'
                : 'text-[#A8BCAD] hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>شاشة السكون AOD</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: LIVE WIDGETS & ACTIVE HOME SCREEN ENGINE          */}
        {/* ======================================================== */}
        {activeTab === 'live_widget' && (
          <div className="space-y-4">
            {/* Live Clock & Next Prayer Header Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#1C3322] via-[#142419] to-[#0A160F] border border-[#E9B161]/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="p-3 rounded-2xl bg-[#E9B161] text-[#142419] shadow-md shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A8BCAD]">الساعة الحية الآن:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ثانية بثانية ⏱️
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-mono font-black text-white tracking-wider mt-0.5">
                    {liveClockStr}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                <div className="text-right sm:text-left">
                  <span className="text-xs text-[#E9B161] font-bold block">
                    الصلاة القادمة: صلاة {times.nextPrayerName} ({times.nextPrayerTime})
                  </span>
                  <span className="text-xs text-stone-300 font-mono">
                    الوقت المتبقي: {times.timeToNext} • 📍 {city.name}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center shrink-0">
                  <span className="text-[10px] text-[#A8BCAD] block">التاريخ الهجري</span>
                  <span className="text-xs font-bold text-[#E9B161]">{hijri.fullArabic}</span>
                </div>
              </div>
            </div>

            {/* Special Notice: For a real second-by-second ticking clock on the phone screen */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-teal-950/90 border-2 border-emerald-400 shadow-2xl space-y-2.5 text-right">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-emerald-300 font-black text-sm sm:text-base font-scheherazade text-lg">
                  <span className="text-xl">⏱️</span>
                  <span>تريد ساعة تدق ثانية بثانية على شاشتك (بدون الحاجة لعمل ريفريش)؟</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-400 text-[#09150E] animate-pulse">
                  الحل المباشر والفعّال ✅
                </span>
              </div>
              <p className="text-xs text-[#E2EFE5] leading-relaxed">
                تطبيقات الودجات الخارجية على أندرويد تلتقط <strong>صورة فوتوغرافية ثابتة (Snapshot)</strong> لأي رابط تضعه، وتجمّد النظام لتوفير بطارية الهاتف، ولذلك لا تتحرك الساعة إلا بعد عمل "ريفريش" يدوي.
                <br />
                <strong>للحصول على ساعة حية تدق ثانية بثانية أمام عينيك:</strong> اضغط على الزر الأخضر الكبير أدناه في <strong>«الخيار الأول»</strong>؛ حيث يفتح نافذة مصغّرة حية عائمة فوق شاشتك الرئيسية وفوق كل التطبيقات بساعة رقمية حية وعد تنازلي مباشر يتغير ثانية بثانية دون توقف ودون الحاجة لعمل ريفريش نهائياً!
              </p>
            </div>

            {/* SOLUTION 1: Picture-in-Picture Live Mini-Widget on Home Screen */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#183120] via-[#102216] to-[#0A160F] border-2 border-emerald-500/80 shadow-2xl space-y-3.5">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500 text-[#142419] shadow-md shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-base sm:text-lg text-white font-scheherazade">
                        الخيار الأول: الودجت المصغّر الحي فوق الشاشة الرئيسية 📱
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        يعمل بالثواني الآن ⭐
                      </span>
                    </div>
                    <p className="text-xs text-[#A8BCAD] mt-0.5 leading-relaxed">
                      يطفو كنافذة مصغّرة حية فوق شاشة الهاتف الرئيسية وفوق جميع التطبيقات (واتساب، فيسبوك، يوتيوب...)
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                  isFloatingActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                }`}>
                  {isFloatingActive ? 'يعمل حياً 🟢' : 'متوقف ⚪'}
                </span>
              </div>

              {/* Three key features of floating widget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 space-y-0.5">
                  <div className="font-bold text-[#E9B161] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ساعة رقمية تدق بالثواني</span>
                  </div>
                  <p className="text-[11px] text-[#A8BCAD] leading-relaxed">
                    تتحدث ثانية بثانية أمام عينيك مع اسم مدينتك ومواقيت الصلوات الخمس.
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 space-y-0.5">
                  <div className="font-bold text-[#E9B161] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>عد تنازلي دقيق للصلاة</span>
                  </div>
                  <p className="text-[11px] text-[#A8BCAD] leading-relaxed">
                    يعرض الوقت المتبقي لأذان الصلاة القادمة بدقة فائقة ويتغير لونه عند دخول الوقت.
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 space-y-0.5">
                  <div className="font-bold text-[#E9B161] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>تحريك وتكبير حر</span>
                  </div>
                  <p className="text-[11px] text-[#A8BCAD] leading-relaxed">
                    يمكنك سحبه بإصبعك لأي زاوية تحبها على شاشتك أو تكبيره وتصغيره بلمسة واحدة.
                  </p>
                </div>
              </div>

              {/* Floating Widget Action Button */}
              <button
                type="button"
                onClick={handleToggleFloatingWidget}
                className={`w-full py-4 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl ${
                  isFloatingActive
                    ? 'bg-red-500/20 text-red-300 border-2 border-red-500/50 hover:bg-red-500/30'
                    : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#09150E] hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                <Zap className="w-5 h-5 shrink-0" />
                <span>
                  {isFloatingActive
                    ? 'إيقاف الودجت المصغّر الحي ⏹️'
                    : 'تشغيل الودجت المصغّر الحي فوق الشاشة الرئيسية الآن (ساعة حية بالثواني) 🟢'}
                </span>
              </button>
            </div>

            {/* SOLUTION 2: PWA Install to Home Screen */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#1C3322] via-[#142419] to-[#0A160F] border-2 border-[#E9B161] shadow-2xl space-y-3.5">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#E9B161] text-[#142419] shadow-md shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-base sm:text-lg text-white font-scheherazade">
                        الخيار الثاني: تثبيت التطبيق على الشاشة الرئيسية (PWA) 📲
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        شاشة كاملة وسرعة فائقة ⚡
                      </span>
                    </div>
                    <p className="text-xs text-[#A8BCAD] mt-0.5 leading-relaxed">
                      يضع أيقونة طريق الهدى الرسمية على شاشتك الرئيسية، وعند فتحها تعمل بكامل الشاشة وبساعة حية متجددة بدون شريط المتصفح
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                  isAppInstalled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isAppInstalled ? 'مثبت على شاشتك ✅' : 'جاهز للتثبيت 📲'}
                </span>
              </div>

              {/* Install Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#E9B161] via-[#f3c178] to-[#dfa755] hover:from-[#dfa755] hover:to-[#e5b36a] text-[#142419] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Smartphone className="w-4 h-4 text-[#142419]" />
                  <span>تثبيت تطبيق طريق الهدى على الشاشة الرئيسية الآن (بنقرة واحدة)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPwaHelpModal(!showPwaHelpModal)}
                  className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/15"
                >
                  <HelpCircle className="w-4 h-4 text-[#E9B161]" />
                  <span>{showPwaHelpModal ? 'إخفاء خطوات التثبيت' : 'خطوات التثبيت بالصور 📋'}</span>
                </button>
              </div>

              {/* PWA Help Instructions Drawer */}
              {showPwaHelpModal && (
                <div className="p-3.5 rounded-2xl bg-black/60 border border-[#E9B161]/30 space-y-3 text-xs">
                  <div className="font-bold text-[#E9B161] text-xs sm:text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span>خطوات سريعة وسهلة لإضافة التطبيق لشاشتك يدوياً في ثوانٍ:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                      <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <span>🤖 في هواتف أندرويد (متصفح كروم / سامسونج):</span>
                      </div>
                      <p className="text-[#C4D5C9] leading-relaxed">
                        1. اضغط على زر القائمة <strong>(الثلاث نقاط ⋮)</strong> في الزاوية العلوية للمتصفح.<br />
                        2. اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.<br />
                        3. اضغط «تثبيت»، وستظهر أيقونة التطبيق الذهبية على شاشة هاتفك فوراً!
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                      <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <span>🍎 في هواتف آيفون (متصفح Safari):</span>
                      </div>
                      <p className="text-[#C4D5C9] leading-relaxed">
                        1. اضغط على زر المشاركة <strong>(مربع وسهم للأعلى ⎋)</strong> في أسفل شاشة المتصفح.<br />
                        2. مرر للأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية ➕»</strong>.<br />
                        3. اضغط «إضافة»، وسيصبح التطبيق موجوداً بين تطبيقات هاتفك بشاشة كاملة وساعة حية!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SOLUTION 3: Lock Screen & Notification Shade Widget */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#15281B] via-[#0F1E14] to-[#0A160F] border border-white/15 shadow-xl space-y-3.5">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#E9B161]/20 text-[#E9B161] border border-[#E9B161]/40 shrink-0">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-white font-scheherazade">
                      الخيار الثالث: ودجت ستارة الإشعارات وشاشة القفل الدائم 🔔
                    </h4>
                    <p className="text-xs text-[#A8BCAD] mt-0.5">
                      يعمل في الخلفية ويظهر في ستارة الإشعارات وعند قفل الهاتف مع عد تنازلي متجدد ومواقيت الصلاة
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                  isLockScreenMediaActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                }`}>
                  {isLockScreenMediaActive ? 'يعمل الآن 🟢' : 'متوقف ⚪'}
                </span>
              </div>

              {/* Toggle Lock Screen Widget */}
              <button
                type="button"
                onClick={async () => {
                  if (isLockScreenMediaActive) {
                    prayerWidgetService.stopLockScreenMediaWidget();
                    setIsLockScreenMediaActive(false);
                    setDownloadSuccessMessage('تم إيقاف ودجت شاشة القفل بنجاح.');
                    setTimeout(() => setDownloadSuccessMessage(null), 4000);
                  } else {
                    const ok = await prayerWidgetService.startLockScreenMediaWidget();
                    setIsLockScreenMediaActive(ok);
                    if (ok) {
                      setDownloadSuccessMessage('✅ تم تشغيل ودجت شاشة القفل والإشعارات الحية! اسحب ستارة الإشعارات أو اقفل شاشتك لتجربته.');
                    }
                    setTimeout(() => setDownloadSuccessMessage(null), 6000);
                  }
                }}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isLockScreenMediaActive
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                    : 'bg-[#1C3322] hover:bg-[#233F2B] text-[#E9B161] border border-[#E9B161]/40'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>
                  {isLockScreenMediaActive
                    ? 'إيقاف ودجت شاشة القفل والإشعارات ⏹️'
                    : 'تفعيل ودجت شاشة القفل والإشعارات الحية 🟢'}
                </span>
              </button>

              {/* Instant 10-Second Test for Background / Locked Phone */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🧪</span>
                    <div>
                      <h5 className="font-bold text-white text-xs sm:text-sm">
                        تجربة فورية للأذان والتنبيه وشاشة هاتفك مقفلة (خلال 10 ثوانٍ)
                      </h5>
                      <p className="text-[11px] text-[#A8BCAD]">
                        اضغط على الزر واقفل شاشة هاتفك فوراً لتتأكد من سماع الصوت ومشاهدة الودجت
                      </p>
                    </div>
                  </div>
                  {backgroundTrialCountdown !== null && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-[#142419] font-mono font-black text-xs animate-pulse whitespace-nowrap">
                      {backgroundTrialCountdown} ث
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleStartBackgroundTrial}
                  disabled={backgroundTrialCountdown !== null}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {backgroundTrialCountdown !== null
                      ? `⏳ التنبيه قادم خلال ${backgroundTrialCountdown} ثوانٍ.. اقفل شاشتك الآن!`
                      : 'بدء تجربة الأذان مع قفل الشاشة (10 ثوانٍ) 📲'}
                  </span>
                </button>
              </div>
            </div>

            {/* SOLUTION 4: Standalone Web Widget & Android Grid Widgets */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#142419] to-[#0A160F] border-2 border-teal-500/50 shadow-xl space-y-3.5">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shrink-0">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base sm:text-lg text-white font-scheherazade">
                        الخيار الرابع: ودجت الويب لشبكة الشاشة الرئيسية (Web Widget) 🌐
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        مفتوح بدون حساب جوجل ✅
                      </span>
                    </div>
                    <p className="text-xs text-[#A8BCAD] mt-0.5 leading-relaxed">
                      لمن يريد وضع ودجت مدمج داخل شبكة مربعات شاشة هاتفه (مثل ودجات الطقس والساعة)
                    </p>
                  </div>
                </div>
              </div>

              {/* Clarification about Google Login fix & Second-by-Second behavior */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-[#D1E7D7] leading-relaxed space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>حل مشكلة التحويل لتسجيل حساب جوجل:</span>
                </div>
                <p>
                  تم توفير <strong>الرابط العام المفتوح</strong> أدناه وهو يعمل مباشرة بدون حساب جوجل وبدون أي تسجيل دخول.
                </p>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed space-y-1">
                  <strong className="text-amber-300 block">⚠️ لماذا لا تدق الساعة ثانية بثانية داخل تطبيقات الودجات الخارجية وتحتاج ريفريش؟</strong>
                  <span>
                    نظام أندرويد لا يسمح بتشغيل أكواد الويب كل ثانية داخل ودجات الشاشة للحفاظ على البطارية، بل يلتقط التطبيق صورة ثابتة للموقع وتتجدد فقط عند الضغط على ريفريش.
                    <br />
                    👉 <strong>إذا أردت ساعة تدق ثانية بثانية فعلياً وبدون ريفريش:</strong> استخدم <strong>«الخيار الأول: الودجت المصغّر الحي»</strong> بالأعلى؛ فهو يعمل بنافذة عائمة حية فوق شاشتك وتدق ساعتها ثانية بثانية دون توقف!
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyDirectWidgetUrl}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>{copiedWidgetUrl ? 'تم نسخ الرابط العام بنجاح ✓' : 'نسخ الرابط العام المفتوح (بدون حساب جوجل)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadHtmlWidget}
                  disabled={isDownloadingHtml}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/15"
                >
                  <FileCode className="w-4 h-4 text-[#E9B161] shrink-0" />
                  <span>{isDownloadingHtml ? 'جارٍ تحميل الملف...' : 'تحميل الودجت كملف أوفلاين (HTML)'}</span>
                </button>
              </div>

              {/* Direct Link Preview Bar */}
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-[#A8BCAD] shrink-0">الرابط المفتوح:</span>
                <span className="text-[11px] font-mono text-teal-300 truncate text-left dir-ltr select-all">
                  {getPublicWidgetUrl() || '/widget.html'}
                </span>
                <a
                  href={getPublicWidgetUrl() || '/widget.html'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-[11px] shrink-0 transition-all border border-teal-500/30"
                >
                  تجربة الرابط ↗
                </a>
              </div>
            </div>

            {/* Note on Gallery Image Limitations */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5">توضيح بخصوص صور الاستوديو الثابتة:</strong>
                عند حفظ صورة الودجت في الاستوديو ووضعها عبر «ودجت الصور»، يعاملها نظام الهاتف كصورة فوتوغرافية ثابتة لا تدق ساعتها. لذلك ننصحك دائماً باستخدام <strong>الخيار الأول (الودجت المصغّر الحي)</strong> أو <strong>الخيار الثاني (تثبيت التطبيق على الشاشة PWA)</strong> لتعمل ساعتك ومواقيتك ثانية بثانية!
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: WIDGET STYLES SELECTION & WALLPAPER DOWNLOADS     */}
        {/* ======================================================== */}
        {activeTab === 'styles_and_download' && (
          <div className="space-y-4">
            {/* Warning banner about static gallery images */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
              <Info className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>تنبيه:</strong> الصور المُحمّلة من هذا القسم هي صور ثابتة (Wallpapers) للاستخدام كخلفيات أو للمشاركة، وليست ودجت حيّ متحرك. لتشغيل ودجت حيّ متجدد، استخدم تبويب <strong>«الودجت الحي وساعة القفل»</strong>.
              </span>
            </div>

            {/* Style Selector Buttons (4 distinct designs) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#E9B161]" />
                <span>اختر تصميم وشكل الودجت المفضل لهاتفك:</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Style 1: Royal Gold */}
                <button
                  type="button"
                  onClick={() => setSelectedStyle('gold')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer space-y-1 ${
                    selectedStyle === 'gold'
                      ? 'bg-gradient-to-br from-[#1C3322] to-[#122216] border-[#E9B161] shadow-lg shadow-[#E9B161]/15 ring-2 ring-[#E9B161]/30'
                      : 'bg-[#102015] border-[#2D4536] hover:border-stone-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#E9B161]">✨ الذهبي الملكي</span>
                    {selectedStyle === 'gold' && <Check className="w-3.5 h-3.5 text-[#E9B161]" />}
                  </div>
                  <p className="text-[10px] text-[#A8BCAD] leading-snug">
                    خلفية زمردية كحلية مع إطار ولمسات ذهبية فاخرة
                  </p>
                </button>

                {/* Style 2: Emerald Mosque */}
                <button
                  type="button"
                  onClick={() => setSelectedStyle('emerald')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer space-y-1 ${
                    selectedStyle === 'emerald'
                      ? 'bg-gradient-to-br from-[#123E28] to-[#0A2417] border-emerald-400 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-400/30'
                      : 'bg-[#102015] border-[#2D4536] hover:border-stone-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400">🌿 الزمردي المسجدي</span>
                    {selectedStyle === 'emerald' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-[#A8BCAD] leading-snug">
                    طابع إسلامي أخضر نضر مع وضوح عالي للصلوات
                  </p>
                </button>

                {/* Style 3: OLED Obsidian Dark */}
                <button
                  type="button"
                  onClick={() => setSelectedStyle('obsidian')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer space-y-1 ${
                    selectedStyle === 'obsidian'
                      ? 'bg-black border-amber-400 shadow-lg shadow-amber-500/15 ring-2 ring-amber-400/30'
                      : 'bg-[#102015] border-[#2D4536] hover:border-stone-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300">🖤 الأسود المودرن</span>
                    {selectedStyle === 'obsidian' && <Check className="w-3.5 h-3.5 text-amber-300" />}
                  </div>
                  <p className="text-[10px] text-[#A8BCAD] leading-snug">
                    أسود داكن عميق 100% موفر للطاقة ومريح جداً للعين
                  </p>
                </button>

                {/* Style 4: Frosted Midnight Glass */}
                <button
                  type="button"
                  onClick={() => setSelectedStyle('glass')}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer space-y-1 ${
                    selectedStyle === 'glass'
                      ? 'bg-gradient-to-br from-[#1A2D42] to-[#0F1E2E] border-sky-400 shadow-lg shadow-sky-500/15 ring-2 ring-sky-400/30'
                      : 'bg-[#102015] border-[#2D4536] hover:border-stone-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-sky-300">💎 الزجاجي العصري</span>
                    {selectedStyle === 'glass' && <Check className="w-3.5 h-3.5 text-sky-300" />}
                  </div>
                  <p className="text-[10px] text-[#A8BCAD] leading-snug">
                    أزرق ليلي زجاجي حديث مع خطوط هندسية عصرية
                  </p>
                </button>
              </div>
            </div>

            {/* Aspect Ratio Selector (Wide 4x2 vs Square 2x2) */}
            <div className="flex items-center justify-between p-2.5 bg-[#102015] rounded-2xl border border-[#2D4536]">
              <span className="text-xs text-[#A8BCAD] font-bold">
                مقاس الودجت على شاشة الهاتف:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedAspect('wide')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedAspect === 'wide'
                      ? 'bg-[#E9B161] text-[#142419] shadow font-black'
                      : 'text-stone-300 hover:text-white bg-black/30'
                  }`}
                >
                  مستطيل عريض (4x2)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAspect('square')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedAspect === 'square'
                      ? 'bg-[#E9B161] text-[#142419] shadow font-black'
                      : 'text-stone-300 hover:text-white bg-black/30'
                  }`}
                >
                  مربع مدمج (2x2)
                </button>
              </div>
            </div>

            {/* Live Interactive or Real Image Rendered Preview */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
                <span className="font-bold text-[#E9B161] flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>معاينة الودجت:</span>
                </span>
                
                {/* Selector between Live Interactive Clock and Gallery Image */}
                <div className="flex items-center gap-1 bg-[#102015] p-1 rounded-xl border border-[#2D4536]">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('interactive')}
                    className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      previewMode === 'interactive'
                        ? 'bg-[#E9B161] text-[#142419] font-black shadow'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>ساعة حية تفاعلية ⏰</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('image')}
                    className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      previewMode === 'image'
                        ? 'bg-[#E9B161] text-[#142419] font-black shadow'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <Download className="w-3 h-3" />
                    <span>صورة الاستوديو 🖼️</span>
                  </button>
                </div>
              </div>

              {/* VIEW 1: Live Interactive Ticking Clock & Countdown Widget */}
              {previewMode === 'interactive' ? (
                <div 
                  className={`mx-auto p-4 sm:p-5 rounded-3xl border-2 transition-all shadow-2xl ${
                    selectedAspect === 'wide' ? 'max-w-xl' : 'max-w-sm'
                  } ${
                    selectedStyle === 'gold'
                      ? 'bg-gradient-to-br from-[#1C3322] via-[#142419] to-[#0D1811] border-[#E9B161]'
                      : selectedStyle === 'emerald'
                      ? 'bg-gradient-to-br from-[#123E28] via-[#0D2A1C] to-[#071A10] border-emerald-400'
                      : selectedStyle === 'obsidian'
                      ? 'bg-black border-amber-400'
                      : 'bg-gradient-to-br from-[#1A2D42] via-[#122030] to-[#0A131C] border-sky-400'
                  }`}
                >
                  {/* Header inside preview with LIVE TICKING CLOCK */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🕌</span>
                      <span className={`font-black text-sm ${
                        selectedStyle === 'emerald' ? 'text-emerald-300' :
                        selectedStyle === 'obsidian' ? 'text-amber-300' :
                        selectedStyle === 'glass' ? 'text-sky-300' : 'text-[#E9B161]'
                      }`}>
                        طريق الهدى
                      </span>
                    </div>

                    {/* LIVE TICKING CLOCK BADGE */}
                    <div className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/15 font-mono text-xs font-black text-white flex items-center gap-1.5 shadow-inner">
                      <Clock className="w-3 h-3 text-[#E9B161] animate-spin" style={{ animationDuration: '6s' }} />
                      <span className="tracking-wider">{liveClockStr}</span>
                    </div>

                    <div className="text-left text-[11px] text-stone-300">
                      <div>{city.name}</div>
                      <div className="text-[10px] text-stone-400">{hijri.fullArabic}</div>
                    </div>
                  </div>

                  {/* Active / Next Prayer Live Dynamic Banner */}
                  {times.isPrayerTimeNow ? (
                    <div className="p-3 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-between mb-3 animate-pulse">
                      <div className="space-y-0.5 text-right">
                        <div className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>حان الآن موعد الصلاة!</span>
                        </div>
                        <div className="text-lg sm:text-xl font-black text-white font-scheherazade">
                          أذان صلاة {times.currentPrayerName}
                        </div>
                        <div className="text-[11px] text-emerald-200">
                          القادمة: {times.nextPrayerName} ({times.nextPrayerTime})
                        </div>
                      </div>

                      <div className="text-center p-2 px-3 rounded-xl bg-black/60 border border-emerald-400/40 font-mono">
                        <div className="text-[9px] text-emerald-300">متبقي للقادمة</div>
                        <div className="text-base sm:text-lg font-black text-emerald-300">
                          {times.timeToNext}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between mb-3">
                      <div className="space-y-0.5 text-right">
                        <div className="text-[11px] text-stone-300">الصلاة القادمة:</div>
                        <div className="text-lg sm:text-xl font-black text-white font-scheherazade">
                          صلاة {times.nextPrayerName}
                        </div>
                        <div className={`text-sm font-bold font-mono ${
                          selectedStyle === 'emerald' ? 'text-emerald-400' :
                          selectedStyle === 'obsidian' ? 'text-amber-400' :
                          selectedStyle === 'glass' ? 'text-sky-400' : 'text-[#E9B161]'
                        }`}>
                          {times.nextPrayerTime}
                        </div>
                      </div>

                      <div className="text-center p-2 px-3 rounded-xl bg-black/60 border border-white/10 font-mono">
                        <div className="text-[9px] text-stone-400">الوقت المتبقي</div>
                        <div className={`text-base sm:text-lg font-black ${
                          selectedStyle === 'emerald' ? 'text-emerald-300' :
                          selectedStyle === 'obsidian' ? 'text-amber-300' :
                          selectedStyle === 'glass' ? 'text-sky-300' : 'text-[#E9B161]'
                        }`}>
                          {times.timeToNext}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5 Prayers Grid */}
                  <div className="grid grid-cols-5 gap-1.5 text-center mb-2">
                    {[
                      { name: 'فجر', time: times.fajr, full: 'الفجر' },
                      { name: 'ظهر', time: times.dhuhr, full: 'الظهر' },
                      { name: 'عصر', time: times.asr, full: 'العصر' },
                      { name: 'مغرب', time: times.maghrib, full: 'المغرب' },
                      { name: 'عشاء', time: times.isha, full: 'العشاء' }
                    ].map((p) => {
                      const isCurrent = times.isPrayerTimeNow && times.currentPrayerName === p.full;
                      const isNext = !times.isPrayerTimeNow && p.full === times.nextPrayerName;
                      return (
                        <div
                          key={p.name}
                          className={`py-1.5 px-0.5 rounded-xl text-[11px] transition-all ${
                            isCurrent
                              ? 'bg-emerald-500 text-[#071A10] font-black shadow ring-2 ring-emerald-300'
                              : isNext
                              ? selectedStyle === 'emerald'
                                ? 'bg-emerald-500 text-[#071A10] font-black shadow'
                                : selectedStyle === 'obsidian'
                                ? 'bg-amber-400 text-black font-black shadow'
                                : selectedStyle === 'glass'
                                ? 'bg-sky-400 text-[#0A131C] font-black shadow'
                                : 'bg-[#E9B161] text-[#142419] font-black shadow'
                              : 'bg-black/35 text-stone-300 border border-white/5'
                          }`}
                        >
                          <div>{p.name}</div>
                          <div className="font-mono text-[10px] mt-0.5">{p.time}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quran Verse Footer */}
                  <div className="text-center text-[10px] text-stone-400 pt-1 font-scheherazade">
                    ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾
                  </div>
                </div>
              ) : (
                /* VIEW 2: Real Generated High-Res Image Display */
                previewImageUrl ? (
                  <div className="space-y-2 text-center">
                    <div className={`mx-auto rounded-3xl overflow-hidden border-2 shadow-2xl transition-all relative group ${
                      selectedAspect === 'wide' ? 'max-w-xl' : 'max-w-sm'
                    } ${
                      selectedStyle === 'gold' ? 'border-[#E9B161]' :
                      selectedStyle === 'emerald' ? 'border-emerald-400' :
                      selectedStyle === 'obsidian' ? 'border-amber-400' : 'border-sky-400'
                    }`}>
                      <img 
                        src={previewImageUrl} 
                        alt="ودجت مواقيت الصلاة"
                        className="w-full h-auto block select-auto cursor-pointer"
                        title="اضغط مطولاً لحفظ الصورة في الاستوديو مباشرة"
                      />
                      {/* Floating Helper Tag */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/80 backdrop-blur border border-white/20 text-[10px] text-white flex items-center gap-1.5 pointer-events-none shadow-md">
                        <span>👆 اضغط مطولاً على الصورة لحفظها مباشرة في الاستوديو</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-stone-400">جارٍ تجهيز صورة المعرض...</div>
                )
              )}
            </div>

            {/* Where to find image helper banner */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#E9B161]/10 border border-[#E9B161]/30 text-stone-200 text-xs space-y-2">
              <div className="font-bold flex items-center gap-2 text-[#E9B161]">
                <Info className="w-4 h-4 shrink-0" />
                <span>أين تجد صورة الودجت في هاتف سامسونج وأندرويد؟</span>
              </div>
              <ul className="text-[11px] text-[#C4D5C9] space-y-1 list-disc list-inside leading-relaxed">
                <li>
                  في تطبيق <strong>«الاستوديو» (Gallery)</strong>: اضغط على تبويب <strong>«الألبومات» (Albums)</strong> بالأسفل، وستجد الصورة في ألبوم <strong>«التنزيلات (Downloads)»</strong>.
                </li>
                <li>
                  <strong>طريقة سريعة جداً:</strong> اضغط <strong>مطولاً بإصبعك</strong> على صورة الودجت أعلاه ثم اختر <strong>«حفظ الصورة»</strong> لتظهر فوراً في واجهة الاستوديو.
                </li>
                <li>
                  أو افتح تطبيق <strong>«ملفاتي» (My Files)</strong> في هاتفك وستجدها في قسم <strong>«التنزيلات»</strong>.
                </li>
              </ul>
            </div>

            {/* DOWNLOAD & SHARE ACTION BUTTONS */}
            <div className="space-y-2.5 pt-1">
              {downloadSuccessMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2 shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{downloadSuccessMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Button 1: Share / Save Directly to Gallery */}
                <button
                  type="button"
                  onClick={handleShareOrSaveWidgetImage}
                  disabled={isSharingImage}
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#E9B161] via-[#f3c178] to-[#dfa755] hover:from-[#dfa755] hover:to-[#e5b36a] text-[#142419] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#142419]" />
                  <span>
                    {isSharingImage ? 'جارٍ فتح نافذة المعرض...' : 'حفظ / مشاركة في الاستوديو مباشرة 📲'}
                  </span>
                </button>

                {/* Button 2: Download High-Res PNG */}
                <button
                  type="button"
                  onClick={handleDownloadWidgetImage}
                  disabled={isDownloadingImage}
                  className="py-3.5 px-4 rounded-2xl bg-[#102015] hover:bg-[#1B3022] border-2 border-[#E9B161]/60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#E9B161]" />
                  <span>
                    {isDownloadingImage ? 'جارٍ تنزيل الصورة...' : 'تحميل الودجت كصورة (PNG) 📥'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Button 3: Download Standalone HTML Widget */}
                <button
                  type="button"
                  onClick={handleDownloadHtmlWidget}
                  disabled={isDownloadingHtml}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-[#2D4536] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-[#E9B161]" />
                  <span>تحميل ملف ودجت مستقل (HTML)</span>
                </button>

                {/* Button 4: Go to Installation Steps Guide */}
                <button
                  type="button"
                  onClick={() => setActiveTab('install_guide')}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-[#2D4536] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-[#E9B161]" />
                  <span>طريقة وضع الودجت على الشاشة خطوة بخطوة 📲</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BACKGROUND ADHAN & LOCKED PHONE ALERT (📴)       */}
        {/* ======================================================== */}
        {activeTab === 'background_alert' && (
          <div className="space-y-4">
            {/* Hero Enabler Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#1C3322] via-[#142419] to-[#0D1811] border-2 border-[#E9B161] shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#E9B161] text-[#142419] shadow-md">
                  <BellRing className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base sm:text-lg text-white font-scheherazade">
                    تشغيل تنبيه الأذان والتطبيق مغلق وشاشة الهاتف مقفلة 📴
                  </h4>
                  <p className="text-xs text-[#A8BCAD]">
                    جدولة مواقيت الصلوات وتثبيت خدمة الأذان لتعمل في خلفية هاتفك حتى لو أغلقت التطبيق تماماً
                  </p>
                </div>
              </div>

              {bgAlertMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2 shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{bgAlertMsg}</span>
                </div>
              )}

              {/* Primary 1-Click Action Button */}
              <button
                type="button"
                onClick={handleEnableBackgroundAlert}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#E9B161] via-[#f3c178] to-[#dfa755] hover:from-[#dfa755] hover:to-[#e5b36a] text-[#142419] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <BellRing className="w-5 h-5 text-[#142419]" />
                <span>تفعيل التنبيه في الخلفية وعند إغلاق الهاتف الآن 🔔</span>
              </button>

              {/* Instant 10-Second Test for Background / Locked Phone */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-black/50 border-2 border-emerald-500/50 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧪</span>
                    <div>
                      <h5 className="font-bold text-white text-xs sm:text-sm">
                        تجربة فورية للأذان والتنبيه وشاشة هاتفك مقفلة (خلال 10 ثوانٍ)
                      </h5>
                      <p className="text-[11px] text-[#A8BCAD]">
                        اضغط على الزر أدناه واقفل شاشة هاتفك فوراً لتتأكد من سماع الصوت والنداء
                      </p>
                    </div>
                  </div>
                  {backgroundTrialCountdown !== null && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-[#142419] font-mono font-black text-xs animate-pulse whitespace-nowrap">
                      {backgroundTrialCountdown} ث
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleStartBackgroundTrial}
                  disabled={backgroundTrialCountdown !== null}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {backgroundTrialCountdown !== null
                      ? `⏳ التنبيه قادم خلال ${backgroundTrialCountdown} ثوانٍ.. اقفل شاشة هاتفك الآن!`
                      : 'بدء تجربة الأذان والتنبيه الصوتي مع قفل الشاشة (10 ثوانٍ) 📲'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <div className="font-bold text-[#E9B161] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>جدولة الصلوات في Service Worker</span>
                  </div>
                  <p className="text-[11px] text-[#A8BCAD] leading-relaxed">
                    يقوم ببرمجة مواعيد الأذان الخمسة لليوم والغد مباشرة في نظام المتصفح لترن في موعدها بالثانية.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <div className="font-bold text-[#E9B161] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>إشعار الخدمة الدائمة (Foreground)</span>
                  </div>
                  <p className="text-[11px] text-[#A8BCAD] leading-relaxed">
                    يمنع نظام أندرويد من قتل التطبيق في الخلفية عند قفل الشاشة أو تشغيل تطبيقات أخرى.
                  </p>
                </div>
              </div>
            </div>

            {/* Crucial Phone Optimization Steps (Samsung, Xiaomi, Huawei, etc.) */}
            <div className="p-4 rounded-2xl bg-[#102015] border border-[#2D4536] space-y-3">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#E9B161]" />
                <span>خطوات هامة لضمان عمل الأذان 100% في هواتف سامسونج وأندرويد:</span>
              </div>

              <div className="space-y-2.5 text-xs text-[#C4D5C9]">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <div className="font-bold text-amber-300">1. إلغاء «تحسين البطارية» (Unrestricted Battery):</div>
                  <p className="text-[11px] leading-relaxed">
                    افتح <strong>الضبط (Settings)</strong> في هاتفك &gt; <strong>التطبيقات (Apps)</strong> &gt; اختر متصفحك أو <strong>طريق الهدى</strong> &gt; اضغط على <strong>البطارية (Battery)</strong> &gt; اختر <strong>«غير مقيّد» (Unrestricted)</strong> لكي لا يقوم النظام بإيقاف تشغيل الأذان في الخلفية.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <div className="font-bold text-amber-300">2. السماح بالإشعارات والأصوات:</div>
                  <p className="text-[11px] leading-relaxed">
                    تأكد من تفعيل إشعارات التطبيق في إعدادات الهاتف، وأن الهاتف ليس في وضع «عدم الإزعاج الصامت» أثناء أوقات الصلاة.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <div className="font-bold text-amber-300">3. قفل التطبيق في قائمة التطبيقات المفتوحة (Lock App):</div>
                  <p className="text-[11px] leading-relaxed">
                    عند فتح شاشة التطبيقات المفتوحة (Recent Apps)، اضغط مطولاً على أيقونة التطبيق أو المتصفح واختر <strong>«قفل التطبيق» (Lock)</strong> في هواتف شاومي وسامسونج وريلمي لضمان عدم مسحه من الذاكرة العشوائية.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'install_guide' && (
          <div className="space-y-4">
            
            {/* Device Switcher (Android vs iPhone) */}
            <div className="flex items-center justify-center gap-2 p-1 bg-[#102015] rounded-2xl border border-[#2D4536]">
              <button
                type="button"
                onClick={() => setGuidePlatform('android')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  guidePlatform === 'android'
                    ? 'bg-[#E9B161] text-[#142419] font-black shadow'
                    : 'text-[#A8BCAD] hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>دليل هواتف أندرويد (سامسونج، شاومي، هواوي)</span>
              </button>

              <button
                type="button"
                onClick={() => setGuidePlatform('ios')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  guidePlatform === 'ios'
                    ? 'bg-[#E9B161] text-[#142419] font-black shadow'
                    : 'text-[#A8BCAD] hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>دليل هواتف آيفون (iOS / iPhone)</span>
              </button>
            </div>

            {/* Guide Steps for Android */}
            {guidePlatform === 'android' && (
              <div className="space-y-3.5">
                {/* Method A: Live Floating Mini-Widget */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#183120] to-[#102015] border-2 border-emerald-500/70 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Zap className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>🌟 الطريقة الأولى (الأسرع): تشغيل الودجت المصغّر الحي فوق الشاشة الرئيسية:</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                      يعمل بالثواني ⏱️
                    </span>
                  </div>

                  <p className="text-xs text-[#C4D5C9] leading-relaxed">
                    هذا الخيار يفتح لك نافذة صغيرة أنيقة تطفو مباشرة فوق الشاشة الرئيسية وفوق كل التطبيقات، وتدق فيها الساعة الرقمية ثانية بثانية مع العد التنازلي لموعد الصلاة القادمة واسم مدينتك، وتستطيع تحريكها وتكبيرها بحرية تامة!
                  </p>

                  <button
                    type="button"
                    onClick={handleToggleFloatingWidget}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#09150E] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>{isFloatingActive ? 'إيقاف الودجت المصغّر العائم ⏹️' : 'تشغيل الودجت المصغّر الحي الآن 🟢'}</span>
                  </button>
                </div>

                {/* Method B: PWA Direct Install */}
                <div className="p-4 rounded-2xl bg-[#102015] border-2 border-[#E9B161] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[#E9B161] font-bold text-sm">
                      <Smartphone className="w-4 h-4 shrink-0" />
                      <span>📲 الطريقة الثانية: تثبيت التطبيق على الشاشة الرئيسية (PWA):</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-[#C4D5C9]">
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="w-5 h-5 rounded-full bg-[#E9B161] text-[#142419] font-black flex items-center justify-center shrink-0 text-[11px]">1</span>
                      <p className="leading-relaxed">اضغط على زر <strong>«تثبيت التطبيق على الشاشة الرئيسية»</strong> أدناه مباشرة، أو اضغط على قائمة المتصفح <strong>(الثلاث نقاط ⋮)</strong> ثم اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</p>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="w-5 h-5 rounded-full bg-[#E9B161] text-[#142419] font-black flex items-center justify-center shrink-0 text-[11px]">2</span>
                      <p className="leading-relaxed">ستظهر لك أيقونة طريق الهدى الرسمية على شاشة هاتفك الرئيسية، وعند فتحها تعمل شاشة كاملة فائقة السرعة بساعة تدق حية في كل لحظة.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleInstallPwa}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E9B161] via-[#f3c178] to-[#dfa755] hover:from-[#dfa755] hover:to-[#e5b36a] text-[#142419] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>تثبيت تطبيق طريق الهدى على شاشة هاتفك الآن</span>
                  </button>
                </div>

                {/* Method C: Web Widget Tile for Android Grid */}
                <div className="p-4 rounded-2xl bg-[#102015] border-2 border-teal-500/40 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                      <ExternalLink className="w-4 h-4 shrink-0" />
                      <span>🌐 الطريقة الثالثة: وضع ودجت مدمج داخل شبكة الشاشة (Web Widget):</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      بدون حساب جوجل ✅
                    </span>
                  </div>

                  <p className="text-xs text-[#C4D5C9] leading-relaxed">
                    إذا أردت وضع مستطيل مدمج بين أيقونات الشاشة الرئيسية (مثل ودجات الطقس والساعة)، يمكنك تثبيت تطبيق مجاني صغير من Google Play اسمه <strong>Web Widget</strong>، ثم لصق الرابط المفتوح أدناه (أو تحميل ملف الودجت الأوفلاين) ليعمل حياً وبدون أي تسجيل دخول نهائياً.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyDirectWidgetUrl}
                      className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copiedWidgetUrl ? 'تم نسخ الرابط العام بنجاح ✓' : 'نسخ الرابط العام (بدون حساب جوجل)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadHtmlWidget}
                      disabled={isDownloadingHtml}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/15"
                    >
                      <FileCode className="w-4 h-4 text-[#E9B161]" />
                      <span>{isDownloadingHtml ? 'جارٍ التحميل...' : 'تحميل كملف أوفلاين'}</span>
                    </button>
                  </div>
                </div>

                {/* Method D: Photo Widget Static Gallery */}
                <div className="p-4 rounded-2xl bg-[#102015] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-stone-300 font-bold text-sm">
                    <span>🖼️ الطريقة الرابعة: صورة الودجت الفاخرة عبر الاستوديو (صورة ثابتة):</span>
                  </div>
                  <p className="text-xs text-[#A8BCAD] leading-relaxed">
                    تستطيع حفظ تصميم الودجت الفاخر كصورة عالية الدقة ووضعها في شاشتك عبر «ودجت الصور / المعرض» المدمج في هاتفك. <em>(ملاحظة: لأن نظام الهاتف يعتبرها صورة ثابتة، فلن تدق ساعتها ثانية بثانية، بل تظل ثابتة عند وقت التصميم).</em>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('styles_and_download');
                      handleDownloadWidgetImage();
                    }}
                    disabled={isDownloadingImage}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all shadow cursor-pointer flex items-center justify-center gap-2 border border-white/15"
                  >
                    <Download className="w-4 h-4 text-[#E9B161]" />
                    <span>{isDownloadingImage ? 'جارٍ تحميل صورة الودجت...' : 'تحميل صورة الودجت للاستوديو (PNG)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Guide Steps for iOS / iPhone */}
            {guidePlatform === 'ios' && (
              <div className="space-y-3.5">
                {/* Method A for iOS: PWA Home Screen */}
                <div className="p-4 rounded-2xl bg-[#102015] border-2 border-[#E9B161] space-y-3">
                  <div className="flex items-center gap-2 text-[#E9B161] font-bold text-sm">
                    <Smartphone className="w-4 h-4 shrink-0" />
                    <span>🍎 الطريقة الأولى والأفضل في الآيفون: إضافة التطبيق إلى الشاشة الرئيسية:</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-300">
                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="w-6 h-6 rounded-full bg-[#E9B161] text-[#142419] font-black flex items-center justify-center shrink-0">1</span>
                      <div>
                        <div className="font-bold text-white">افتح متصفح Safari على الآيفون:</div>
                        <p className="text-[#A8BCAD] mt-0.5">تأكد أنك تتصفح التطبيق من متصفح Safari الرسمي لآبل.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="w-6 h-6 rounded-full bg-[#E9B161] text-[#142419] font-black flex items-center justify-center shrink-0">2</span>
                      <div>
                        <div className="font-bold text-white">اضغط على زر المشاركة:</div>
                        <p className="text-[#A8BCAD] mt-0.5">اضغط على زر المشاركة أسفل الشاشة <strong>(مربع يخرج منه سهم للأعلى ⎋)</strong>.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="w-6 h-6 rounded-full bg-[#E9B161] text-[#142419] font-black flex items-center justify-center shrink-0">3</span>
                      <div>
                        <div className="font-bold text-white">اختر «إضافة إلى الصفحة الرئيسية»:</div>
                        <p className="text-[#A8BCAD] mt-0.5">مرر القائمة للأسفل واختر <strong>«إضافة إلى الصفحة الرئيسية ➕ (Add to Home Screen)»</strong> ثم اضغط <strong>«إضافة (Add)»</strong>.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="w-6 h-6 rounded-full bg-[#E9B161] text-[#142419] font-black flex items-center justify-center shrink-0">4</span>
                      <div>
                        <div className="font-bold text-white">ساعة حية كاملة وتطبيق فوري:</div>
                        <p className="text-[#A8BCAD] mt-0.5">ستظهر أيقونة التطبيق على شاشة الآيفون، وعند فتحها تعمل بساعة رقمية حية ومواقيت صلاة متجددة فوراً!</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Method B for iOS: Picture-in-Picture Mini-Widget */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#183120] to-[#102015] border border-emerald-500/50 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>🌟 الطريقة الثانية: الودجت المصغّر العائم في الآيفون (Picture-in-Picture):</span>
                  </div>
                  <p className="text-xs text-[#C4D5C9] leading-relaxed">
                    يدعم نظام iOS ميزة النافذة المصغّرة التي تطفو فوق شاشة الآيفون أثناء تصفح التطبيقات الأخرى مع ساعة تدق حية في كل لحظة.
                  </p>
                  <button
                    type="button"
                    onClick={handleToggleFloatingWidget}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isFloatingActive ? 'إيقاف النافذة المصغّرة' : 'تشغيل النافذة المصغّرة الحية للآيفون'}</span>
                  </button>
                </div>

                {/* Method C for iOS: Photos Widget */}
                <div className="p-4 rounded-2xl bg-[#102015] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-[#E9B161] font-bold text-sm">
                    <span>🖼️ الطريقة الثالثة: وضع الودجت في شاشة الآيفون عبر تطبيق الصور الرسمي:</span>
                  </div>
                  <p className="text-xs text-[#A8BCAD] leading-relaxed">
                    احفظ صورة الودجت في ألبوم الصور، ثم اضغط مطولاً على شاشة الآيفون واضغط زر الزائد (+) واختر ودجت «الصور (Photos)» لتظهر صورة مواقيت الصلاة الفاخرة على شاشتك.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('styles_and_download');
                      handleDownloadWidgetImage();
                    }}
                    disabled={isDownloadingImage}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all shadow cursor-pointer flex items-center justify-center gap-2 border border-white/15"
                  >
                    <Download className="w-4 h-4 text-[#E9B161]" />
                    <span>{isDownloadingImage ? 'جارٍ تحميل صورة الودجت...' : 'تحميل صورة الودجت للآيفون (PNG)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DIACRITIC SOUND & PRONUNCIATION SETTINGS          */}
        {/* ======================================================== */}
        {activeTab === 'voice_alert' && (
          <div className="space-y-4">
            
            {/* Master Alert Switch Card */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              preAlertEnabled
                ? 'bg-[#142419] border-[#E9B161] shadow-md shadow-[#E9B161]/10'
                : 'bg-[#142419]/60 border-[#2D4536]'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-white">
                      تنبيه واقتراب موعد الأذان ({preAlertMinutes} دقيقة قبل كل صلاة)
                    </span>
                    {preAlertEnabled && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50 font-bold">
                        مفعّل
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A8BCAD] leading-relaxed">
                    يصدر التطبيق نغمة رخيمة وتذكيراً صوتياً ناطقاً بالصيغة والآية القرآنية الكريمة قبل خروج وقت الصلاة الحالية واستعداداً للصلاة القادمة.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTogglePreAlert}
                  className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center shrink-0 cursor-pointer ${
                    preAlertEnabled ? 'bg-[#E9B161] justify-end' : 'bg-[#2D4536] justify-start'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-[#1B3022] shadow-md transition-transform ${
                    preAlertEnabled ? 'border-2 border-[#1B3022]' : ''
                  }`} />
                </button>
              </div>
            </div>

            {/* Exact Diacritized Text Display Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#102015] border-2 border-[#E9B161]/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E9B161] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4" />
                  <span>النص الصوتي المعتمد مع ضبط التشكيل ومخارج الحروف:</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#142419] text-[#A8BCAD] border border-[#2D4536]">
                  ضبط دقيق لنطق (صَلَّيْتَ) و (وَ صَلِّ)
                </span>
              </div>

              {/* Calligraphy Diacritized Text with VERIFIED AYAH WITHOUT 'ف' and correct phonetics */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-[#2D4536] text-right space-y-2">
                <p className="text-sm sm:text-base font-bold text-white font-scheherazade leading-loose">
                  «اقْتَرَبَ مَوْعِدُ أَذَانِ صَلَاةِ <span className="text-[#E9B161]">الظُّهْرِ</span>، إِنْ لَمْ تَكُنْ <span className="text-amber-300 font-black underline underline-offset-4">صَلَّيْتَ</span> صَلَاةَ <span className="text-[#E9B161]">الفَجْرِ</span> فَقُمْ، <span className="text-amber-300 font-black underline underline-offset-4">وَ صَلِّ</span>، <span className="text-emerald-400">إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا</span>»
                </p>
                <div className="text-[11px] text-[#A8BCAD] flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                  <span className="text-emerald-300 font-bold">📖 سورة النساء: الآية 103 (﴿إِنَّ الصَّلَاةَ...﴾ بدون ف)</span>
                  <span>•</span>
                  <span>تم فصل الواو في «وَ صَلِّ» لمنع محركات الصوت من نطقها «وصل»، وضبط حركات «صَلَّيْتَ» كاملة.</span>
                </div>
              </div>
            </div>

            {/* VOICE ENGINE & ACCENT SELECTION */}
            <div className="p-4 rounded-2xl bg-[#142419] border border-[#2D4536] space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#E9B161]" />
                    <span>اختيار أفضل صوت عربي من جهازك وضبط النبرة:</span>
                  </div>
                  <div className="text-[10px] text-[#A8BCAD]">
                    اختر الصوت الفصيح الأنسب مع ضبط سرعة التلاوة والتأني
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlayVoiceSample}
                  disabled={isVoiceSamplePlaying}
                  className="px-3 py-1.5 rounded-xl bg-[#E9B161] hover:bg-[#dfa755] text-[#142419] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer font-black"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isVoiceSamplePlaying ? 'جارٍ الاستماع...' : 'استمع للصوت الفصيح 🔊'}</span>
                </button>
              </div>

              {/* Voices Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#A8BCAD] block">
                  الصوت العربي المستخدم:
                </label>
                <select
                  value={selectedVoiceUri}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#102015] border border-[#2D4536] text-white text-xs focus:border-[#E9B161] outline-none"
                >
                  {availableVoices.length > 0 ? (
                    availableVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))
                  ) : (
                    <option value="">الصوت العربي التلقائي الافتراضي الفصيح</option>
                  )}
                </select>
              </div>

              {/* Speed & Pitch Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Voice Speed */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#A8BCAD]">
                    <span>سرعة النطق (التأني والوضوح):</span>
                    <span className="font-mono text-[#E9B161] font-bold">{voiceRate}x</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'وقور (0.85)', val: 0.85 },
                      { label: 'فصيح (0.92)', val: 0.92 },
                      { label: 'طبيعي (1.0)', val: 1.0 },
                      { label: 'سريع (1.1)', val: 1.1 }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => handleVoiceRateChange(item.val)}
                        className={`py-1 px-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          voiceRate === item.val
                            ? 'bg-[#E9B161] text-[#142419] border-[#E9B161]'
                            : 'bg-[#102015] border-[#2D4536] text-[#A8BCAD] hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Pitch */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#A8BCAD]">
                    <span>طبقة الصوت (النبرة):</span>
                    <span className="font-mono text-[#E9B161] font-bold">{voicePitch}x</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { label: 'رخيم ووقور', val: 0.9 },
                      { label: 'معتدل (مستحسن)', val: 1.0 },
                      { label: 'أعلى وأوضح', val: 1.1 }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => handleVoicePitchChange(item.val)}
                        className={`py-1 px-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          voicePitch === item.val
                            ? 'bg-[#E9B161] text-[#142419] border-[#E9B161]'
                            : 'bg-[#102015] border-[#2D4536] text-[#A8BCAD] hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Prayers Interactive Sound & Pronunciation Tester */}
            <div className="p-4 rounded-2xl bg-[#142419] border border-[#2D4536] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white block">
                  تجربة واستماع النطق الفصيح لكل صلاة مع الآية:
                </span>
                <span className="text-[10px] text-[#A8BCAD]">اضغط للاستماع فوراً</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {[
                  { key: 'fajr', label: 'صلاة الفجر', prev: 'العشاء', icon: '🌅' },
                  { key: 'dhuhr', label: 'صلاة الظهر', prev: 'الفجر', icon: '☀️' },
                  { key: 'asr', label: 'صلاة العصر', prev: 'الظهر', icon: '🌤️' },
                  { key: 'maghrib', label: 'صلاة المغرب', prev: 'العصر', icon: '🌇' },
                  { key: 'isha', label: 'صلاة العشاء', prev: 'المغرب', icon: '🌙' }
                ].map((item) => {
                  const isPlaying = testingPrayerKey === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleTestPrayerSpeech(item.key)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                        isPlaying
                          ? 'bg-[#E9B161] text-[#142419] border-[#E9B161] shadow-lg font-black animate-pulse'
                          : 'bg-[#102015] border-[#2D4536] hover:border-[#E9B161] text-[#E0E7E1]'
                      }`}
                    >
                      <div className="text-base">{item.icon}</div>
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[9px] text-[#A8BCAD]">تذكير بـ {item.prev}</div>
                      <div className="text-[10px] font-bold text-[#E9B161] pt-1">
                        {isPlaying ? 'جارٍ النطق 🔊' : 'استمع 🔊'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alert Time Selector */}
            <div className="p-3.5 rounded-2xl bg-[#142419] border border-[#2D4536] space-y-2">
              <label className="text-xs font-bold text-[#E0E7E1] block">
                وقت التنبيه قبل الأذان:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 10, 15, 20, 30].map((mins) => {
                  const isSelected = preAlertMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleChangePreAlertMinutes(mins)}
                      className={`py-2 px-1 rounded-xl text-center border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E9B161] text-[#142419] border-[#E9B161] font-bold shadow'
                          : 'bg-[#102015] border-[#2D4536] text-[#A8BCAD] hover:text-white'
                      }`}
                    >
                      <span className="block font-bold">{mins} د</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: LOCK SCREEN MEDIA WIDGET & AMBIENT DISPLAY        */}
        {/* ======================================================== */}
        {activeTab === 'lockscreen' && (
          <div className="space-y-4">
            {/* Lock screen media session widget */}
            <div className="p-4 rounded-2xl bg-[#142419] border border-[#3D5A47] space-y-3">
              <div className="flex items-center gap-2 text-[#E9B161]">
                <Radio className="w-5 h-5" />
                <span className="font-bold text-sm">ودجت شاشة القفل التفاعلي والإشعارات الحية</span>
              </div>
              <p className="text-xs text-[#A8BCAD]">
                يعرض مواقيت الصلاة والوقت المتبقي مباشرة على شاشة قفل هاتفك وفي مركز الإشعارات والتحكم حتى مع قفل الهاتف.
              </p>

              <button
                type="button"
                onClick={async () => {
                  if (isLockScreenMediaActive) {
                    prayerWidgetService.stopLockScreenMediaWidget();
                  } else {
                    await prayerWidgetService.startLockScreenMediaWidget();
                  }
                }}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isLockScreenMediaActive
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                    : 'bg-[#E9B161] text-[#142419] hover:bg-[#dfa755] shadow-md font-black'
                }`}
              >
                {isLockScreenMediaActive ? (
                  <span>إيقاف ودجت شاشة القفل الآن</span>
                ) : (
                  <span>تفعيل ودجت شاشة القفل بضغطة زر 🟢</span>
                )}
              </button>
            </div>

            {/* Ambient screen display button */}
            <div className="p-4 rounded-2xl bg-[#102015] border border-[#3D5A47] space-y-3">
              <div className="flex items-center gap-2 text-[#E9B161]">
                <Tv className="w-5 h-5" />
                <span className="font-bold text-sm">الشاشة المحيطية الليلية (Always-On Display)</span>
              </div>
              <p className="text-xs text-[#A8BCAD]">
                شاشة ساعة إسلامية ليلية لسطح المكتب أو بجانب السرير تمنع إغلاق الشاشة وتظهر المواقيت بوضوح تام.
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAmbientLockScreen();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E9B161] to-[#dfa755] text-[#142419] font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>فتح الشاشة المحيطية الآن</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2D4536]">
          <span className="text-xs text-[#A8BCAD]">
            📍 مدينتك: <strong className="text-white">{city.name}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#E9B161] hover:bg-[#dfa755] text-[#142419] font-bold text-xs transition-all shadow-md cursor-pointer font-black"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
