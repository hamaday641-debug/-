// Service to power Home Screen and Lock Screen widgets simultaneously with One-Click Activation
import { prayerTimesService, TodayPrayerTimes } from './prayerTimes';
import { adhanScheduler } from './adhanScheduler';

const STORAGE_MASTER_KEY = 'tareeq_widgets_master_active';

class PrayerWidgetService {
  // Master State
  private isMasterActive: boolean = false;
  private masterListeners: Set<(active: boolean) => void> = new Set();

  // Floating Window (Picture-in-Picture)
  private pipVideo: HTMLVideoElement | null = null;
  private pipCanvas: HTMLCanvasElement | null = null;
  private pipCtx: CanvasRenderingContext2D | null = null;
  private pipAnimId: number | null = null;
  private pipBackupInterval: any = null;
  private isPipActive: boolean = false;
  private pipListeners: Set<(active: boolean) => void> = new Set();

  // Lock Screen Media Activity (iOS & Android)
  private audioContext: (AudioContext | any) | null = null;
  private audioDestination: MediaStreamAudioDestinationNode | null = null;
  private silentOscillator: OscillatorNode | null = null;
  private lockScreenAudio: HTMLAudioElement | null = null;
  private isLockScreenMediaActive: boolean = false;
  private lockScreenListeners: Set<(active: boolean) => void> = new Set();

  // Continuous Updates Interval
  private updateInterval: any = null;
  private lastNotificationUpdate: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initMediaSessionActionHandlers();
      this.initServiceWorkerListener();

      // Check if was previously activated
      try {
        const saved = localStorage.getItem(STORAGE_MASTER_KEY);
        if (saved === 'true') {
          this.isMasterActive = true;
        }
      } catch {}

      // Ensure any floating widget is stopped
      this.ensureFloatingDisabled();
    }
  }

  public ensureFloatingDisabled() {
    this.isPipActive = false;
    this.stopFloatingWidget().catch(() => {});
  }

  // --- LISTENERS & STATUS ---

  public isBothActive(): boolean {
    return this.isMasterActive;
  }

  public subscribeMaster(cb: (active: boolean) => void) {
    this.masterListeners.add(cb);
    // Initial call
    cb(this.isMasterActive);
    return () => {
      this.masterListeners.delete(cb);
    };
  }

  private notifyMasterChange(active: boolean) {
    this.isMasterActive = active;
    try {
      localStorage.setItem(STORAGE_MASTER_KEY, active ? 'true' : 'false');
    } catch {}
    this.masterListeners.forEach((cb) => {
      try { cb(active); } catch {}
    });
  }

  // --- 1. ONE-CLICK MASTER ACTIVATION (RUN BOTH TOGETHER) ---

  public async activateBothWidgets(): Promise<{
    success: boolean;
    lockScreen: boolean;
    homeScreen: boolean;
    floating: boolean;
  }> {
    let lockScreenOk = false;
    let homeScreenOk = false;
    let floatingOk = false;

    // 1. Request Notification Permission if default
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch {}
      }
    }

    // 2. Start Lock Screen Media Live Activity
    try {
      lockScreenOk = await this.startLockScreenMediaWidget();
    } catch (e) {
      console.warn('Could not start lockscreen media widget:', e);
    }

    // 3. Start Persistent Background Notification (Home Screen & Lock Screen Notification)
    try {
      homeScreenOk = await this.postWidgetToServiceWorker(true);
    } catch (e) {
      console.warn('Could not post widget to Service Worker:', e);
    }

    // Note: Floating Picture-in-Picture widget is explicitly disabled by default per user preference
    // (We do not auto-launch floating overlays over apps)
    floatingOk = false;

    // Set Master Active if at least one widget type succeeded
    const anySucceeded = lockScreenOk || homeScreenOk;
    this.notifyMasterChange(anySucceeded);

    // Setup Continuous Loop (every 1 second for metadata/pip, and periodic notification refresh)
    if (anySucceeded) {
      this.startContinuousLoop();
    }

    return {
      success: anySucceeded,
      lockScreen: lockScreenOk,
      homeScreen: homeScreenOk,
      floating: floatingOk
    };
  }

  // --- 2. ONE-CLICK MASTER DEACTIVATION (USER FREEDOM TO CLOSE ANYTIME) ---

  public async deactivateBothWidgets(): Promise<void> {
    // 1. Stop Continuous Loop
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // 2. Stop Lock Screen Media
    this.stopLockScreenMediaWidget();

    // 3. Stop/Dismiss Persistent Notification in Service Worker
    this.removeWidgetFromServiceWorker();

    // 4. Stop Floating PiP
    await this.stopFloatingWidget();

    // 5. Update Master State
    this.notifyMasterChange(false);
  }

  // --- CONTINUOUS BACKGROUND LOOP ---

  private startContinuousLoop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      if (!this.isMasterActive) {
        clearInterval(this.updateInterval);
        return;
      }

      // Update Lock Screen Media Session every second (shows real-time countdown on lock screen)
      if (this.isLockScreenMediaActive) {
        this.updateMediaSessionMetadata();
      }

      // Update Persistent Notification every 30 seconds to conserve device battery while remaining accurate
      const now = Date.now();
      if (now - this.lastNotificationUpdate > 30000) {
        this.lastNotificationUpdate = now;
        this.postWidgetToServiceWorker(false);
      }
    }, 1000);
  }

  // --- LOCK SCREEN MEDIA ACTIVITY IMPLEMENTATION ---

  public isMediaSessionSupported(): boolean {
    return typeof navigator !== 'undefined' && 'mediaSession' in navigator;
  }

  public isLockScreenWidgetActive(): boolean {
    return this.isLockScreenMediaActive;
  }

  public subscribeLockScreen(cb: (active: boolean) => void) {
    this.lockScreenListeners.add(cb);
    return () => {
      this.lockScreenListeners.delete(cb);
    };
  }

  private notifyLockScreenChange(active: boolean) {
    this.isLockScreenMediaActive = active;
    this.lockScreenListeners.forEach((cb) => {
      try { cb(active); } catch {}
    });
  }

  public async startLockScreenMediaWidget(): Promise<boolean> {
    if (!this.isMediaSessionSupported()) return false;

    try {
      // 1. Create or resume Web Audio API oscillator for true background persistence
      const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass && !this.audioContext) {
        try {
          this.audioContext = new AudioCtxClass();
          this.audioDestination = this.audioContext.createMediaStreamDestination();
          this.silentOscillator = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          gain.gain.value = 0.00001; // inaudible
          this.silentOscillator.connect(gain);
          gain.connect(this.audioDestination);
          this.silentOscillator.start();
        } catch {}
      }

      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume().catch(() => {});
      }

      // 2. Attach to Audio element
      if (!this.lockScreenAudio) {
        this.lockScreenAudio = new Audio();
        this.lockScreenAudio.setAttribute('playsinline', 'true');
        this.lockScreenAudio.setAttribute('webkit-playsinline', 'true');
        this.lockScreenAudio.loop = true;
      }

      if (this.audioDestination && this.audioDestination.stream) {
        this.lockScreenAudio.srcObject = this.audioDestination.stream;
      } else {
        // Fallback valid silent WAV with duration
        this.lockScreenAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
      }

      await this.lockScreenAudio.play().catch(() => {});

      // 3. Update MediaSession metadata
      this.updateMediaSessionMetadata();
      this.notifyLockScreenChange(true);

      // 4. Also activate persistent Notification Shade Widget
      this.postWidgetToServiceWorker(true).catch(() => {});

      return true;
    } catch (e) {
      console.warn('Failed to start Lock Screen Media Widget:', e);
      return false;
    }
  }

  public stopLockScreenMediaWidget() {
    try {
      if (this.lockScreenAudio) {
        this.lockScreenAudio.pause();
      }
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.suspend().catch(() => {});
      }
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
      this.removeWidgetFromServiceWorker();
    } catch {}
    this.notifyLockScreenChange(false);
  }

  public updateMediaSessionMetadata() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      const now = new Date();
      const times = prayerTimesService.getTodayPrayerTimes(now);
      const city = adhanScheduler.getSelectedCity();

      const title = times.isPrayerTimeNow 
        ? `🟢 حان الآن موعد أذان ${times.currentPrayerName}!`
        : `🕌 القادمة: صلاة ${times.nextPrayerName} (${times.nextPrayerTime || ''})`;

      const artist = times.isPrayerTimeNow
        ? `⏱️ القادمة: ${times.nextPrayerName} (خلال ${times.timeToNext}) • 📍 ${city.name}`
        : `⏱️ متبقي: ${times.timeToNext} • 📍 ${city.name}`;

      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album: `الفجر ${times.fajr} | الظهر ${times.dhuhr} | العصر ${times.asr} | المغرب ${times.maghrib} | العشاء ${times.isha}`,
        artwork: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.playbackState = 'playing';
    } catch (e) {
      console.warn('MediaSession metadata update error:', e);
    }
  }

  private initMediaSessionActionHandlers() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.activateBothWidgets();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        this.deactivateBothWidgets();
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        this.deactivateBothWidgets();
      });
    } catch {}
  }

  // --- SERVICE WORKER BACKGROUND NOTIFICATION WIDGET ---

  public async postWidgetToServiceWorker(force: boolean = false): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const now = new Date();
      const times = prayerTimesService.getTodayPrayerTimes(now);
      const city = adhanScheduler.getSelectedCity();

      const title = times.isPrayerTimeNow
        ? `🟢 حان الآن أذان ${times.currentPrayerName} - ${city.name}`
        : `🕌 مواقيت الصلاة - طريق الهدى (${city.name})`;
      const summaryText = times.isPrayerTimeNow
        ? `🟢 وقت صلاة ${times.currentPrayerName} الآن • القادمة: صلاة ${times.nextPrayerName} خلال ${times.timeToNext}`
        : `القادمة: صلاة ${times.nextPrayerName} (${times.nextPrayerTime}) • متبقي: ${times.timeToNext}`;
      const allTimesText = `الفجر ${times.fajr} • الظهر ${times.dhuhr} • العصر ${times.asr} • المغرب ${times.maghrib} • العشاء ${times.isha}`;

      const payload = {
        type: force ? 'START_BACKGROUND_WIDGET' : 'UPDATE_BACKGROUND_WIDGET',
        title,
        body: `${summaryText}\n${allTimesText}`,
        nextPrayer: times.nextPrayerName,
        timeToNext: times.timeToNext,
        city: city.name
      };

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(payload);
        return true;
      }

      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.active) {
        reg.active.postMessage(payload);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Failed to dispatch widget to Service Worker:', err);
      return false;
    }
  }

  private removeWidgetFromServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    try {
      const payload = { type: 'STOP_BACKGROUND_WIDGET' };
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(payload);
      } else {
        navigator.serviceWorker.ready.then((reg) => {
          reg.active?.postMessage(payload);
        });
      }
    } catch {}
  }

  private initServiceWorkerListener() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'WIDGET_CLOSED_BY_USER') {
        // User clicked "إغلاق الودجت ❌" directly on the persistent notification!
        this.deactivateBothWidgets();
      }
    });
  }

  // --- FLOATING PICTURE-IN-PICTURE (PIP) WIDGET ---

  public isPipSupported(): boolean {
    if (typeof document === 'undefined') return false;
    return Boolean(
      'pictureInPictureEnabled' in document &&
      document.pictureInPictureEnabled &&
      HTMLVideoElement.prototype.requestPictureInPicture
    );
  }

  public isFloatingWidgetActive(): boolean {
    return this.isPipActive;
  }

  public subscribePip(cb: (active: boolean) => void) {
    this.pipListeners.add(cb);
    return () => {
      this.pipListeners.delete(cb);
    };
  }

  public subscribeFloating(cb: (active: boolean) => void) {
    return this.subscribePip(cb);
  }

  private notifyPipChange(active: boolean) {
    this.isPipActive = active;
    this.pipListeners.forEach((cb) => {
      try { cb(active); } catch {}
    });
  }

  public async startFloatingWidget(): Promise<boolean> {
    if (!this.isPipSupported()) return false;

    try {
      if (!this.pipCanvas) {
        this.pipCanvas = document.createElement('canvas');
        this.pipCanvas.width = 512;
        this.pipCanvas.height = 288;
        this.pipCtx = this.pipCanvas.getContext('2d');
      }

      if (!this.pipVideo) {
        this.pipVideo = document.createElement('video');
        this.pipVideo.muted = true;
        this.pipVideo.playsInline = true;
        this.pipVideo.autoplay = true;
        this.pipVideo.style.position = 'fixed';
        this.pipVideo.style.bottom = '0px';
        this.pipVideo.style.right = '0px';
        this.pipVideo.style.width = '1px';
        this.pipVideo.style.height = '1px';
        this.pipVideo.style.opacity = '0.001';
        this.pipVideo.style.pointerEvents = 'none';
        this.pipVideo.style.zIndex = '-9999';

        this.pipVideo.addEventListener('leavepictureinpicture', () => {
          this.notifyPipChange(false);
          if (this.pipAnimId) {
            cancelAnimationFrame(this.pipAnimId);
            this.pipAnimId = null;
          }
        });
      }

      if (!this.pipVideo.parentElement) {
        document.body.appendChild(this.pipVideo);
      }

      // Render first frame BEFORE captureStream to ensure readyState is ready
      this.renderWidgetFrame();

      const stream = (this.pipCanvas as any).captureStream ? (this.pipCanvas as any).captureStream(12) : null;
      if (!stream) return false;

      this.pipVideo.srcObject = stream;
      await this.pipVideo.play();

      await this.pipVideo.requestPictureInPicture();
      this.isPipActive = true;
      this.notifyPipChange(true);

      // Start dual render loop: requestAnimationFrame for smooth display + 1000ms interval for background execution
      if (this.pipBackupInterval) clearInterval(this.pipBackupInterval);
      this.pipBackupInterval = setInterval(() => {
        this.renderWidgetFrame();
      }, 1000);

      if (this.pipAnimId) cancelAnimationFrame(this.pipAnimId);
      this.pipAnimId = requestAnimationFrame(this.renderWidgetFrame);
      return true;
    } catch (err) {
      console.warn('Floating PiP Widget error:', err);
      this.isPipActive = false;
      this.notifyPipChange(false);
      return false;
    }
  }

  public async stopFloatingWidget(): Promise<void> {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    } catch {}
    this.isPipActive = false;
    this.notifyPipChange(false);
    if (this.pipBackupInterval) {
      clearInterval(this.pipBackupInterval);
      this.pipBackupInterval = null;
    }
    if (this.pipAnimId) {
      cancelAnimationFrame(this.pipAnimId);
      this.pipAnimId = null;
    }
  }

  private renderWidgetFrame = () => {
    if (!this.pipCanvas || !this.pipCtx) return;
    const ctx = this.pipCtx;
    const width = this.pipCanvas.width;
    const height = this.pipCanvas.height;

    const now = new Date();
    const city = adhanScheduler.getSelectedCity();
    const times = prayerTimesService.getTodayPrayerTimes(now);

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0F2317');
    bgGrad.addColorStop(0.5, '#162F20');
    bgGrad.addColorStop(1, '#0B1710');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Accent Gold Line
    const goldGrad = ctx.createLinearGradient(0, 0, width, 0);
    goldGrad.addColorStop(0, 'rgba(233, 177, 97, 0)');
    goldGrad.addColorStop(0.5, '#E9B161');
    goldGrad.addColorStop(1, 'rgba(233, 177, 97, 0)');
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, width, 4);

    // Header: Live Clock & App Name & City
    const hours = now.getHours();
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    const displayHours = hours % 12 || 12;
    const liveClockStr = `${String(displayHours).padStart(2, '0')}:${mins}:${secs} ${ampm}`;

    ctx.textAlign = 'right';
    ctx.fillStyle = '#E9B161';
    ctx.font = 'bold 16px "Cairo", sans-serif';
    ctx.fillText('طريق الهدى 🕌', width - 20, 32);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#A8BCAD';
    ctx.font = '13px "Cairo", sans-serif';
    ctx.fillText(`📍 ${city.name}`, 20, 32);

    // Centered Live Clock Pill Badge
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    const clockBadgeW = 164;
    const clockBadgeH = 26;
    const clockBadgeX = (width - clockBadgeW) / 2;
    const clockBadgeY = 14;
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(clockBadgeX, clockBadgeY, clockBadgeW, clockBadgeH, 13);
    } else {
      ctx.rect(clockBadgeX, clockBadgeY, clockBadgeW, clockBadgeH);
    }
    ctx.fill();
    ctx.strokeStyle = '#E9B161';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#FCE3B4';
    ctx.font = 'bold 13px monospace, sans-serif';
    ctx.fillText(`⏰ ${liveClockStr}`, width / 2, 32);

    // Next Prayer & Countdown with transition logic
    ctx.textAlign = 'center';
    if (times.isPrayerTimeNow) {
      ctx.fillStyle = '#4ADE80';
      ctx.font = 'bold 18px "Cairo", sans-serif';
      ctx.fillText(`🟢 حان الآن موعد أذان ${times.currentPrayerName}!`, width / 2, 74);

      ctx.fillStyle = '#E9B161';
      ctx.font = 'bold 38px monospace, "Cairo", sans-serif';
      ctx.fillText(times.timeToNext, width / 2, 124);

      ctx.fillStyle = '#A8BCAD';
      ctx.font = '12px "Cairo", sans-serif';
      ctx.fillText(`الوقت المتبقي لصلاة ${times.nextPrayerName} (${times.nextPrayerTime})`, width / 2, 152);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Cairo", sans-serif';
      ctx.fillText(`الصلاة القادمة: صلاة ${times.nextPrayerName}`, width / 2, 78);

      ctx.fillStyle = '#E9B161';
      ctx.font = 'bold 42px monospace, "Cairo", sans-serif';
      ctx.fillText(times.timeToNext, width / 2, 130);

      ctx.fillStyle = '#A8BCAD';
      ctx.font = '12px "Cairo", sans-serif';
      ctx.fillText(`موعد الأذان: ${times.nextPrayerTime}`, width / 2, 156);
    }

    // 5 Prayers Row
    const prayers = [
      { name: 'الفجر', time: times.fajr },
      { name: 'الظهر', time: times.dhuhr },
      { name: 'العصر', time: times.asr },
      { name: 'المغرب', time: times.maghrib },
      { name: 'العشاء', time: times.isha }
    ];

    const cardW = 86;
    const cardH = 58;
    const gap = 12;
    const totalW = prayers.length * cardW + (prayers.length - 1) * gap;
    const startX = (width - totalW) / 2;
    const startY = 198;

    prayers.forEach((p, idx) => {
      const x = startX + idx * (cardW + gap);
      const isNext = p.name === times.nextPrayerName;
      const isCurrent = times.isPrayerTimeNow && p.name === times.currentPrayerName;

      ctx.fillStyle = isCurrent 
        ? 'rgba(74, 222, 128, 0.25)' 
        : isNext 
        ? 'rgba(233, 177, 97, 0.22)' 
        : 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(x, startY, cardW, cardH, 10);
      } else {
        ctx.rect(x, startY, cardW, cardH);
      }
      ctx.fill();

      ctx.strokeStyle = isCurrent ? '#4ADE80' : isNext ? '#E9B161' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = (isCurrent || isNext) ? 1.5 : 1;
      ctx.stroke();

      ctx.fillStyle = isCurrent ? '#4ADE80' : isNext ? '#E9B161' : '#E0E7E1';
      ctx.font = 'bold 13px "Cairo", sans-serif';
      ctx.fillText(p.name, x + cardW / 2, startY + 22);

      ctx.fillStyle = isCurrent ? '#4ADE80' : isNext ? '#FFFFFF' : '#A8BCAD';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(p.time, x + cardW / 2, startY + 44);
    });

    if (this.isPipActive) {
      this.pipAnimId = requestAnimationFrame(this.renderWidgetFrame);
    }
  };
}

export const prayerWidgetService = new PrayerWidgetService();
