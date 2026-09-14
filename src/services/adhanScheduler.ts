// Global Background Prayer Times & Adhan Audio Scheduler Service
import { CITIES, CityOption } from '../components/PrayerTimesQibla';
import { ADHAN_LIST } from '../components/AdhanPlayerModal';
import { getOfflineAudioUrl, cacheAudioUrl } from './offlineAudioService';
import { showSafeNotification } from '../utils/notificationHelper';

export interface PrayerTimesSchedule {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  qiyam?: string;
}

/**
 * Returns phonetically accurate Arabic text with complete diacritics (تشكيل دقيق)
 * to ensure speech synthesis correctly articulates consonants and vowels (مخارج الحروف).
 * Note: The Ayah from Surah An-Nisa (103) is: ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾ (بدون ف)
 */
export function getFormattedPrePrayerSpeech(prayerKey: string): {
  spokenText: string;
  notificationText: string;
  nextLabel: string;
  prevLabel: string;
} {
  const norm = (prayerKey || '').toLowerCase();
  
  // Note on pronunciation (النطق ومخارج الحروف):
  // 1. "صَلَّيْتَ": Shaddah + Fatha on Lam, Sukoon on Ya, Fatha on Ta ensures accurate articulation (صَلَّـيْـتَ).
  // 2. "وَ صَلِّ": Separating 'وَ' from 'صَلِّ' with a space prevents Arabic TTS engines from incorrectly reading it as the root 'وَصَلَ' (arrived) or 'وَصْل'. With space, it unequivocally articulates: 'wa' then 'salli' (and pray).
  // 3. Using Arabic comma '،' instead of ellipsis '...' gives natural breathing pauses between clauses for TTS.
  // 4. Surah An-Nisa Ayah 103: ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾ (without 'ف').
  if (norm.includes('fajr') || norm.includes('فجر')) {
    return {
      spokenText: 'اقْتَرَبَ مَوْعِدُ أَذَانِ صَلَاةِ الفَجْرِ، إِنْ لَمْ تَكُنْ صَلَّيْتَ صَلَاةَ العِشَاءِ فَقُمْ، وَ صَلِّ، إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا.',
      notificationText: 'اقترب موعد أذان صلاة الفجر. إن لم تكن صليت صلاة العشاء فقم وصلِّ، ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾.',
      nextLabel: 'الفجر',
      prevLabel: 'العشاء'
    };
  }
  if (norm.includes('dhuhr') || norm.includes('ظهر')) {
    return {
      spokenText: 'اقْتَرَبَ مَوْعِدُ أَذَانِ صَلَاةِ الظُّهْرِ، إِنْ لَمْ تَكُنْ صَلَّيْتَ صَلَاةَ الفَجْرِ فَقُمْ، وَ صَلِّ، إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا.',
      notificationText: 'اقترب موعد أذان صلاة الظهر. إن لم تكن صليت صلاة الفجر فقم وصلِّ، ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾.',
      nextLabel: 'الظهر',
      prevLabel: 'الفجر'
    };
  }
  if (norm.includes('asr') || norm.includes('عصر')) {
    return {
      spokenText: 'اقْتَرَبَ مَوْعِدُ أَذَانِ صَلَاةِ العَصْرِ، إِنْ لَمْ تَكُنْ صَلَّيْتَ صَلَاةَ الظُّهْرِ فَقُمْ، وَ صَلِّ، إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا.',
      notificationText: 'اقترب موعد أذان صلاة العصر. إن لم تكن صليت صلاة الظهر فقم وصلِّ، ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾.',
      nextLabel: 'العصر',
      prevLabel: 'الظهر'
    };
  }
  if (norm.includes('maghrib') || norm.includes('مغرب')) {
    return {
      spokenText: 'اقْتَرَبَ مَوْعِدُ أَذَانِ صَلَاةِ المَغْرِبِ، إِنْ لَمْ تَكُنْ صَلَّيْتَ صَلَاةَ العَصْرِ فَقُمْ، وَ صَلِّ، إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا.',
      notificationText: 'اقترب موعد أذان صلاة المغرب. إن لم تكن صليت صلاة العصر فقم وصلِّ، ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾.',
      nextLabel: 'المغرب',
      prevLabel: 'العصر'
    };
  }
  if (norm.includes('isha') || norm.includes('عشاء')) {
    return {
      spokenText: 'اقْتَرَبَ مَوْعِدُ أَذَانِ صَلَاةِ العِشَاءِ، إِنْ لَمْ تَكُنْ صَلَّيْتَ صَلَاةَ المَغْرِبِ فَقُمْ، وَ صَلِّ، إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا.',
      notificationText: 'اقترب موعد أذان صلاة العشاء. إن لم تكن صليت صلاة المغرب فقم وصلِّ، ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾.',
      nextLabel: 'العشاء',
      prevLabel: 'المغرب'
    };
  }

  return {
    spokenText: 'اقْتَرَبَ مَوْعِدُ أَذَانِ الصَّلَاةِ، إِنْ لَمْ تَكُنْ صَلَّيْتَ الصَّلَاةَ السَّابِقَةَ فَقُمْ، وَ صَلِّ، إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا.',
    notificationText: 'اقترب موعد أذان الصلاة. إن لم تكن صليت الصلاة السابقة فقم وصلِّ، ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾.',
    nextLabel: 'الصلاة',
    prevLabel: 'السابقة'
  };
}

export function getAvailableArabicVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const allVoices = window.speechSynthesis.getVoices();
  return allVoices.filter(v => 
    v.lang.startsWith('ar') || 
    v.name.toLowerCase().includes('arabic') ||
    v.name.toLowerCase().includes('maged') ||
    v.name.toLowerCase().includes('tarik') ||
    v.name.toLowerCase().includes('tariq') ||
    v.name.toLowerCase().includes('laila') ||
    v.name.toLowerCase().includes('shakir') ||
    v.name.toLowerCase().includes('salma') ||
    v.name.includes('العربية')
  );
}

class AdhanSchedulerService {
  private timerId: any = null;
  private audioInstance: HTMLAudioElement | null = null;
  private isAdhanPlaying: boolean = false;
  private lastTriggerKey: string = '';
  private lastPreAlertKey: string = '';
  private onAdhanTriggerCallbacks: Set<(prayerKey: string, prayerName: string, adhanId: string) => void> = new Set();
  private onPrePrayerTriggerCallbacks: Set<(prayerKey: string, prayerName: string, minutes: number, prevPrayerName: string) => void> = new Set();
  private wakeLock: any = null;
  private audioContext: AudioContext | null = null;
  private isAudioUnlocked: boolean = false;

  constructor() {
    // Listen for any user gesture to unlock AudioContext/HTMLAudioElement autoplay and activate background heartbeat
    const unlockAudio = () => {
      this.unlockAudioEngine();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
    }
  }

  public unlockAudioEngine() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.audioInstance) {
        this.audioInstance = new Audio();
        this.audioInstance.preload = 'auto';
      }

      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }

      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      this.isAudioUnlocked = true;
      this.initBackgroundKeepAlive();
    } catch (e) {
      console.warn('Audio unlock notice:', e);
    }
  }

  // Prevents mobile OS browsers from suspending background timers when screen locks
  public initBackgroundKeepAlive() {
    if (typeof window === 'undefined') return;
    try {
      // Request Screen Wake Lock if available and supported
      if ('wakeLock' in navigator && !this.wakeLock) {
        (navigator as any).wakeLock.request('screen').then((lock: any) => {
          this.wakeLock = lock;
          lock.addEventListener('release', () => {
            this.wakeLock = null;
          });
        }).catch(() => {
          // Expected if not focused or policy restricted
        });
      }
    } catch (e) {
      console.warn('Background keep-alive init:', e);
    }
  }

  public init() {
    if (typeof window === 'undefined') return;
    if (this.timerId) clearInterval(this.timerId);

    // Run check every 1000ms for exact second-level precision
    this.timerId = setInterval(() => {
      this.checkAndTriggerAdhan();
    }, 1000);

    // Initial check
    this.checkAndTriggerAdhan();

    // Sync upcoming prayer alarms to Service Worker for background execution
    this.syncAdhanScheduleToServiceWorker();
  }

  public async syncAdhanScheduleToServiceWorker() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      if (!reg) return;

      const city = this.getSelectedCity();
      const notifs = this.getPrayerNotifications();
      const chosenAdhanId = this.getSelectedAdhanId();
      const daytimeAdhanId = chosenAdhanId === 'fajr_makkah' ? 'makkah_ali_mulla' : chosenAdhanId;
      const now = new Date();

      const prayersToSchedule: Array<{
        prayerKey: string;
        prayerLabel: string;
        timestamp: number;
        timeStr: string;
        cityName: string;
        adhanId: string;
        isPreAlert?: boolean;
        preMinutes?: number;
      }> = [];

      for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + dayOffset);
        const timings = this.calculatePrayerTimes(city.lat, city.lng, targetDate, city.timezone);

        const list = [
          { key: 'fajr', label: 'الفجر', time: timings.fajr, adhan: 'fajr_makkah' },
          { key: 'dhuhr', label: 'الظهر', time: timings.dhuhr, adhan: daytimeAdhanId },
          { key: 'asr', label: 'العصر', time: timings.asr, adhan: daytimeAdhanId },
          { key: 'maghrib', label: 'المغرب', time: timings.maghrib, adhan: daytimeAdhanId },
          { key: 'isha', label: 'العشاء', time: timings.isha, adhan: daytimeAdhanId },
        ];

        for (const p of list) {
          if (notifs[p.key] === false) continue;
          const [h, m] = p.time.split(':').map(Number);
          const pDate = new Date(targetDate);
          pDate.setHours(h, m, 0, 0);
          const timestamp = pDate.getTime();

          // 1. Pre-Prayer Alert (voice reminder before adhan)
          if (this.isPrePrayerAlertEnabled()) {
            const preMins = this.getPrePrayerAlertMinutes();
            const preTimestamp = timestamp - (preMins * 60 * 1000);
            if (preTimestamp > Date.now()) {
              prayersToSchedule.push({
                prayerKey: p.key,
                prayerLabel: p.label,
                timestamp: preTimestamp,
                timeStr: p.time,
                cityName: city.name,
                adhanId: p.adhan,
                isPreAlert: true,
                preMinutes: preMins
              });
            }
          }

          // 2. Exact Adhan Time
          if (timestamp > Date.now()) {
            prayersToSchedule.push({
              prayerKey: p.key,
              prayerLabel: p.label,
              timestamp,
              timeStr: p.time,
              cityName: city.name,
              adhanId: p.adhan,
              isPreAlert: false
            });
          }
        }
      }

      if (reg.active) {
        reg.active.postMessage({
          type: 'SCHEDULE_OFFLINE_ADHAN_TIMERS',
          prayers: prayersToSchedule
        });
      }

      if ('periodicSync' in reg) {
        try {
          const status = await (navigator as any).permissions?.query({ name: 'periodic-background-sync' });
          if (status && status.state === 'granted') {
            await (reg as any).periodicSync.register('check-adhan-times', {
              minInterval: 15 * 60 * 1000
            });
          }
        } catch {}
      }
    } catch (e) {
      console.warn('Sync adhan schedule error:', e);
    }
  }

  public subscribe(cb: (prayerKey: string, prayerName: string, adhanId: string) => void) {
    this.onAdhanTriggerCallbacks.add(cb);
    return () => {
      this.onAdhanTriggerCallbacks.delete(cb);
    };
  }

  public subscribePrePrayerAlert(cb: (prayerKey: string, prayerName: string, minutes: number, prevPrayerName: string) => void) {
    this.onPrePrayerTriggerCallbacks.add(cb);
    return () => {
      this.onPrePrayerTriggerCallbacks.delete(cb);
    };
  }

  public isPrePrayerAlertEnabled(): boolean {
    try {
      const saved = localStorage.getItem('tareeq_pre_prayer_alert');
      return saved !== null ? saved === 'true' : true; // Default TRUE
    } catch {
      return true;
    }
  }

  public setPrePrayerAlertEnabled(enabled: boolean) {
    try {
      localStorage.setItem('tareeq_pre_prayer_alert', String(enabled));
    } catch {}
  }

  public getPrePrayerAlertMinutes(): number {
    try {
      const saved = localStorage.getItem('tareeq_pre_prayer_minutes');
      return saved ? parseInt(saved, 10) : 15; // Default 15 minutes as requested
    } catch {
      return 15;
    }
  }

  public setPrePrayerAlertMinutes(minutes: number) {
    try {
      localStorage.setItem('tareeq_pre_prayer_minutes', String(minutes));
    } catch {}
  }

  public isPrePrayerVoiceEnabled(): boolean {
    try {
      const saved = localStorage.getItem('tareeq_pre_prayer_voice');
      return saved !== null ? saved === 'true' : true; // Default TRUE
    } catch {
      return true;
    }
  }

  public setPrePrayerVoiceEnabled(enabled: boolean) {
    try {
      localStorage.setItem('tareeq_pre_prayer_voice', String(enabled));
    } catch {}
  }

  public getPreviousPrayer(prayerKey: string): { key: string; label: string } {
    switch (prayerKey) {
      case 'fajr':
        return { key: 'isha', label: 'العشاء' };
      case 'dhuhr':
        return { key: 'fajr', label: 'الفجر' };
      case 'asr':
        return { key: 'dhuhr', label: 'الظهر' };
      case 'maghrib':
        return { key: 'asr', label: 'العصر' };
      case 'isha':
        return { key: 'maghrib', label: 'المغرب' };
      default:
        return { key: 'fajr', label: 'الفجر' };
    }
  }

  public playPrePrayerChime(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = this.audioContext || new AudioCtx();
      this.audioContext = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // 4 Peaceful harmonic sine chime frequencies: C5, E5, G5, C6
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.8 },
        { freq: 659.25, time: 0.22, dur: 0.8 },
        { freq: 783.99, time: 0.44, dur: 0.9 },
        { freq: 1046.50, time: 0.66, dur: 1.4 }
      ];

      const now = ctx.currentTime;
      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.0001, now + time);
        gain.gain.linearRampToValueAtTime(0.28, now + time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    } catch (err) {
      console.warn('Pre-prayer chime audio notice:', err);
    }
  }

  public getPreferredVoiceUri(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('nour_preprayer_voice_uri');
  }

  public setPreferredVoiceUri(uri: string): void {
    if (typeof window === 'undefined') return;
    if (!uri) {
      localStorage.removeItem('nour_preprayer_voice_uri');
    } else {
      localStorage.setItem('nour_preprayer_voice_uri', uri);
    }
  }

  public getVoiceRate(): number {
    if (typeof window === 'undefined') return 0.92;
    const val = localStorage.getItem('nour_preprayer_voice_rate');
    return val ? parseFloat(val) : 0.92;
  }

  public setVoiceRate(rate: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('nour_preprayer_voice_rate', rate.toString());
  }

  public getVoicePitch(): number {
    if (typeof window === 'undefined') return 1.0;
    const val = localStorage.getItem('nour_preprayer_voice_pitch');
    return val ? parseFloat(val) : 1.0;
  }

  public setVoicePitch(pitch: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('nour_preprayer_voice_pitch', pitch.toString());
  }

  public playPrePrayerVoiceReminder(prayerKey: string, customVoiceUri?: string): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (!this.isPrePrayerVoiceEnabled()) return;

    try {
      window.speechSynthesis.cancel();
      const { spokenText } = getFormattedPrePrayerSpeech(prayerKey);

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'ar-SA';
      // Refined rate (0.92) gives measured cadence without unnatural robotic elongation
      utterance.rate = this.getVoiceRate();
      utterance.pitch = this.getVoicePitch();
      utterance.volume = 1.0;

      const pickVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferredUri = customVoiceUri || this.getPreferredVoiceUri();
        if (preferredUri) {
          const match = voices.find((v) => v.voiceURI === preferredUri || v.name === preferredUri);
          if (match) {
            utterance.voice = match;
            return;
          }
        }

        // Priority 1: High quality Natural / Neural / Enhanced Arabic voices
        const naturalArabic = voices.find(
          (v) =>
            (v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic')) &&
            (v.name.toLowerCase().includes('natural') ||
              v.name.toLowerCase().includes('neural') ||
              v.name.toLowerCase().includes('online') ||
              v.name.toLowerCase().includes('enhanced') ||
              v.name.includes('العربية'))
        );
        if (naturalArabic) {
          utterance.voice = naturalArabic;
          return;
        }

        // Priority 2: Standard Saudi Arabia voices (ar-SA)
        const saudi = voices.find((v) => v.lang === 'ar-SA');
        if (saudi) {
          utterance.voice = saudi;
          return;
        }

        // Priority 3: Regional Arabic (ar-EG, ar-AE, ar)
        const regional = voices.find((v) => v.lang.startsWith('ar'));
        if (regional) {
          utterance.voice = regional;
          return;
        }

        // Priority 4: Specific named Arabic voices
        const namedArabic = voices.find(
          (v) =>
            v.name.toLowerCase().includes('maged') ||
            v.name.toLowerCase().includes('tarik') ||
            v.name.toLowerCase().includes('tariq') ||
            v.name.toLowerCase().includes('laila') ||
            v.name.toLowerCase().includes('shakir') ||
            v.name.toLowerCase().includes('salma') ||
            v.name.toLowerCase().includes('arabic')
        );
        if (namedArabic) {
          utterance.voice = namedArabic;
        }
      };

      pickVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = pickVoice;
      }

      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('Speech synthesis speak error:', e);
        }
      }, 1000);
    } catch (e) {
      console.warn('Speech synthesis setup error:', e);
    }
  }

  public triggerPrePrayerAlert(prayerKey: string, prayerName: string, minutes: number = 15) {
    const { notificationText, prevLabel } = getFormattedPrePrayerSpeech(prayerKey);
    const city = this.getSelectedCity();

    // 1. Play serene harmonic chime
    this.playPrePrayerChime();

    // 2. Play spoken Arabic reminder with exact pronunciation & Quranic ayah
    this.playPrePrayerVoiceReminder(prayerKey);

    // 3. Dispatch safe notification
    showSafeNotification(`⏰ اقتراب موعد أذان ${prayerName} (بقي ${minutes} دقيقة)`, {
      body: `${notificationText} • طريق الهدى (${city.name})`,
      icon: '/icon-192.png',
      requireInteraction: true,
      tag: `pre-adhan-${prayerKey}`,
      data: {
        type: 'pre_prayer_alert',
        prayerKey,
        prayerName,
        prevPrayerName: prevLabel,
        minutes
      }
    }).catch(() => {});

    // 4. Vibration pattern
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([250, 150, 250, 150, 400]);
      } catch {}
    }

    // 5. Notify React UI callbacks
    this.onPrePrayerTriggerCallbacks.forEach((cb) => {
      try {
        cb(prayerKey, prayerName, minutes, prevLabel);
      } catch (err) {
        console.error('Pre-prayer callback error:', err);
      }
    });
  }

  public testPrePrayerAlert(prayerKey: string = 'dhuhr', minutes?: number) {
    const chosenMinutes = minutes || this.getPrePrayerAlertMinutes();
    this.unlockAudioEngine();
    const prayerMap: Record<string, string> = {
      fajr: 'الفجر',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء'
    };
    const name = prayerMap[prayerKey] || 'الظهر';
    this.triggerPrePrayerAlert(prayerKey, name, chosenMinutes);
  }

  public getSelectedCity(): CityOption {
    try {
      const saved = localStorage.getItem('tareeq_selected_city') || localStorage.getItem('nour_selected_city');
      return saved ? JSON.parse(saved) : CITIES[0];
    } catch {
      return CITIES[0];
    }
  }

  public isAutoAdhanEnabled(): boolean {
    try {
      const saved = localStorage.getItem('tareeq_auto_adhan');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  }

  public getPrayerNotifications(): { [key: string]: boolean } {
    try {
      const saved = localStorage.getItem('tareeq_prayer_notifications');
      return saved ? JSON.parse(saved) : {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
        sunrise: false
      };
    } catch {
      return {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
        sunrise: false
      };
    }
  }

  public getSelectedAdhanId(): string {
    try {
      return localStorage.getItem('tareeq_selected_adhan_id') || ADHAN_LIST[0].id;
    } catch {
      return ADHAN_LIST[0].id;
    }
  }

  // Calculate Astronomical Fallback
  public calculatePrayerTimes(lat: number, lng: number, date: Date, timezone: number): PrayerTimesSchedule {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const B = (2 * Math.PI * (dayOfYear - 81)) / 365;
    const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
    const declination = 23.45 * Math.sin(((dayOfYear - 81) * 2 * Math.PI) / 365) * (Math.PI / 180);

    const latRad = (lat * Math.PI) / 180;
    const solarNoonMinutes = 720 - 4 * lng - EoT + timezone * 60;
    const dhuhrTime = solarNoonMinutes / 60;

    const getHourAngle = (angleDeg: number) => {
      const angleRad = (angleDeg * Math.PI) / 180;
      const cosHA = (Math.cos(angleRad) - Math.sin(latRad) * Math.sin(declination)) / (Math.cos(latRad) * Math.cos(declination));
      if (cosHA > 1) return 0;
      if (cosHA < -1) return Math.PI;
      return Math.acos(cosHA);
    };

    const fajrHA = getHourAngle(90 + 19.5) * (180 / Math.PI) * 4;
    const fajrTime = (solarNoonMinutes - fajrHA) / 60;

    const sunriseHA = getHourAngle(90 + 0.833) * (180 / Math.PI) * 4;
    const sunriseTime = (solarNoonMinutes - sunriseHA) / 60;

    const sunsetHA = getHourAngle(90 + 0.833) * (180 / Math.PI) * 4;
    const maghribTime = (solarNoonMinutes + sunsetHA) / 60;

    const noonShadowAngle = Math.abs(latRad - declination);
    const asrAlt = Math.atan(1 / (1 + Math.tan(noonShadowAngle)));
    const asrHA = (Math.acos((Math.sin(asrAlt) - Math.sin(latRad) * Math.sin(declination)) / (Math.cos(latRad) * Math.cos(declination))) * 180) / Math.PI * 4;
    const asrTime = (solarNoonMinutes + asrHA) / 60;

    const ishaHA = getHourAngle(90 + 17.5) * (180 / Math.PI) * 4;
    const ishaTime = (solarNoonMinutes + ishaHA) / 60;

    const toTimeString = (decimalHours: number) => {
      let normalized = (decimalHours + 24) % 24;
      const h = Math.floor(normalized);
      const m = Math.floor((normalized - h) * 60);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    return {
      fajr: toTimeString(fajrTime),
      sunrise: toTimeString(sunriseTime),
      dhuhr: toTimeString(dhuhrTime),
      asr: toTimeString(asrTime),
      maghrib: toTimeString(maghribTime),
      isha: toTimeString(ishaTime)
    };
  }

  public async playAdhanAudio(adhanId: string, _prayerName: string = 'الصلاة'): Promise<boolean> {
    const foundAdhan = ADHAN_LIST.find((a) => a.id === adhanId) || ADHAN_LIST[0];
    if (!this.audioInstance) {
      this.audioInstance = new Audio();
    }

    const audio = this.audioInstance;
    audio.pause();
    this.isAdhanPlaying = true;

    // Try mirrors in sequence
    for (let i = 0; i < foundAdhan.audioUrls.length; i++) {
      const url = foundAdhan.audioUrls[i];
      try {
        const cachedBlob = await getOfflineAudioUrl(url);
        audio.src = cachedBlob || url;
        audio.currentTime = 0;
        await audio.play();
        cacheAudioUrl(url); // Ensure cached for offline next time
        return true;
      } catch (err) {
        console.warn(`Adhan mirror ${i} play failed, attempting next mirror...`, err);
      }
    }

    this.isAdhanPlaying = false;
    return false;
  }

  public stopAdhanAudio() {
    if (this.audioInstance) {
      this.audioInstance.pause();
      this.audioInstance.currentTime = 0;
    }
    this.isAdhanPlaying = false;
  }

  public triggerAdhanNow(prayerKey: string = 'dhuhr', prayerName: string = 'الظهر', adhanId?: string) {
    const userSelected = this.getSelectedAdhanId();
    let chosenAdhanId = adhanId;

    if (!chosenAdhanId) {
      if (prayerKey === 'fajr') {
        chosenAdhanId = 'fajr_makkah';
      } else {
        // If user had saved fajr_makkah globally, fallback to daytime adhan without Tathweeb
        chosenAdhanId = userSelected === 'fajr_makkah' ? 'makkah_ali_mulla' : userSelected;
      }
    } else if (prayerKey !== 'fajr' && chosenAdhanId === 'fajr_makkah') {
      chosenAdhanId = 'makkah_ali_mulla';
    }

    const city = this.getSelectedCity();

    // 1. Play audio immediately
    this.playAdhanAudio(chosenAdhanId, prayerName);

    // 2. Dispatch notifications and vibration
    showSafeNotification(`حان الآن موعد أذان ${prayerName}`, {
      body: `حي على الصلاة • طريق الهدى (${city.name})`,
      icon: '/icon.svg',
      requireInteraction: true,
      tag: `adhan-${prayerKey}`,
      data: {
        prayerLabel: prayerName,
        cityName: city.name,
        adhanId: chosenAdhanId
      }
    }).catch(() => {});

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([400, 200, 400, 200, 800]);
      } catch {}
    }

    // 3. Notify all React UI listeners (to pop open modal or visual bar)
    this.onAdhanTriggerCallbacks.forEach((cb) => {
      try {
        cb(prayerKey, prayerName, chosenAdhanId);
      } catch (err) {
        console.error('Callback error:', err);
      }
    });
  }

  public checkAndTriggerAdhan() {
    if (!this.isAutoAdhanEnabled()) return;

    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentTimeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
    const todayDateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    const city = this.getSelectedCity();
    const notifs = this.getPrayerNotifications();

    // Get adjustments
    let adjustments: Record<string, number> = {};
    try {
      const savedAdj = localStorage.getItem('tareeq_prayer_adjustments');
      if (savedAdj) adjustments = JSON.parse(savedAdj);
    } catch {}

    // 1. Try to get cached timings from AlAdhan API or fallback calculation
    let timings: PrayerTimesSchedule;
    try {
      const cachedApi = localStorage.getItem(`tareeq_api_timings_${city.name}_${todayDateKey}`);
      if (cachedApi) {
        timings = JSON.parse(cachedApi);
      } else {
        timings = this.calculatePrayerTimes(city.lat, city.lng, now, city.timezone);
      }
    } catch {
      timings = this.calculatePrayerTimes(city.lat, city.lng, now, city.timezone);
    }

    const applyAdj = (timeStr: string, key: string) => {
      const adj = adjustments[key] || 0;
      if (adj === 0) return timeStr;
      const [h, m] = timeStr.split(':').map(Number);
      let totalMins = (h * 60 + m + adj + 1440) % 1440;
      const newH = Math.floor(totalMins / 60);
      const newM = totalMins % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    const prayerScheduleList = [
      { key: 'fajr', label: 'الفجر', time: applyAdj(timings.fajr, 'fajr'), defaultAdhan: 'fajr_makkah' },
      { key: 'dhuhr', label: 'الظهر', time: applyAdj(timings.dhuhr, 'dhuhr'), defaultAdhan: this.getSelectedAdhanId() },
      { key: 'asr', label: 'العصر', time: applyAdj(timings.asr, 'asr'), defaultAdhan: this.getSelectedAdhanId() },
      { key: 'maghrib', label: 'المغرب', time: applyAdj(timings.maghrib, 'maghrib'), defaultAdhan: this.getSelectedAdhanId() },
      { key: 'isha', label: 'العشاء', time: applyAdj(timings.isha, 'isha'), defaultAdhan: this.getSelectedAdhanId() },
    ];

    for (const prayer of prayerScheduleList) {
      if (notifs[prayer.key] === false) continue;

      // 1. Exact Prayer Time -> Trigger Adhan
      if (prayer.time === currentTimeStr) {
        const triggerKey = `${todayDateKey}_${prayer.key}`;
        if (this.lastTriggerKey === triggerKey) {
          // Already triggered for this prayer today
          continue;
        }

        this.lastTriggerKey = triggerKey;
        const userAdhan = this.getSelectedAdhanId();
        const daytimeAdhan = userAdhan === 'fajr_makkah' ? 'makkah_ali_mulla' : userAdhan;
        const chosenAdhanId = prayer.key === 'fajr' ? 'fajr_makkah' : daytimeAdhan;

        this.triggerAdhanNow(prayer.key, prayer.label, chosenAdhanId);
      }

      // 2. Pre-Prayer Alert Check (e.g. 15 minutes before)
      if (this.isPrePrayerAlertEnabled()) {
        const preAlertMinutes = this.getPrePrayerAlertMinutes();
        const [pHour, pMin] = prayer.time.split(':').map(Number);
        const prayerTotalMins = pHour * 60 + pMin;
        const preAlertTotalMins = (prayerTotalMins - preAlertMinutes + 1440) % 1440;
        const currentTotalMins = currentH * 60 + currentM;

        if (currentTotalMins === preAlertTotalMins) {
          const preTriggerKey = `${todayDateKey}_pre_${prayer.key}`;
          if (this.lastPreAlertKey !== preTriggerKey) {
            this.lastPreAlertKey = preTriggerKey;
            this.triggerPrePrayerAlert(prayer.key, prayer.label, preAlertMinutes);
          }
        }
      }
    }
  }

  // Test both Background Adhan and Voice Alert while the phone screen is locked
  public scheduleBackgroundTrial(delaySeconds: number = 10): Promise<boolean> {
    return new Promise((resolve) => {
      this.unlockAudioEngine();
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }

      setTimeout(() => {
        try {
          this.triggerPrePrayerAlert('dhuhr', 'الظهر (تجربة)', 15);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, delaySeconds * 1000);
    });
  }
}

export const adhanScheduler = new AdhanSchedulerService();

