import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Calendar, 
  Sun, 
  Moon, 
  Sunrise, 
  Sparkles, 
  Navigation, 
  RotateCw, 
  CheckCircle2, 
  Globe, 
  Sliders, 
  Bell, 
  BellRing,
  BellOff,
  Volume2,
  Check,
  Play,
  Radio,
  HeartHandshake,
  Settings2,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  Info,
  CheckCircle,
  Search,
  Crosshair,
  ArrowUp,
  ExternalLink,
  Target,
  Layers,
  Tv,
  Download,
  Zap
} from 'lucide-react';
import { AdhanPlayerModal, ADHAN_LIST, AdhanOption } from './AdhanPlayerModal';
import { showSafeNotification } from '../utils/notificationHelper';
import { adhanScheduler } from '../services/adhanScheduler';
import { prayerWidgetService } from '../services/prayerWidgetService';
import { PrayerWidgetsModal } from './PrayerWidgetsModal';
import { LockScreenAmbientView } from './LockScreenAmbientView';
import { 
  ALL_CITIES, 
  CityOption, 
  calculateQiblaBearing, 
  calculateDistanceToKaabaKm, 
  getCardinalDirectionArabic, 
  reverseGeocodeLocation,
  findNearestCity,
  calculateSunPosition,
  KAABA_LAT,
  KAABA_LNG
} from '../utils/qiblaLocation';

export type { CityOption };
export const CITIES: CityOption[] = ALL_CITIES;

/**
 * Converts 24-hour time "HH:MM" to 12-hour formatted object
 */
export function formatPrayerTime(
  time24: string, 
  use12Hour: boolean = true
): { formatted: string; timeOnly: string; period: 'ص' | 'م' | ''; isPM: boolean } {
  if (!time24) return { formatted: '--:--', timeOnly: '--:--', period: '', isPM: false };
  const parts = time24.split(':');
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return { formatted: time24, timeOnly: time24, period: '', isPM: false };

  const isPM = h >= 12;
  const period: 'ص' | 'م' = isPM ? 'م' : 'ص';

  if (!use12Hour) {
    const formatted24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return { formatted: formatted24, timeOnly: formatted24, period: '', isPM };
  }

  let h12 = h % 12;
  if (h12 === 0) h12 = 12;

  const timeOnly = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return {
    formatted: `${timeOnly} ${period}`,
    timeOnly,
    period,
    isPM
  };
}

// Astronomical calculation of prayer times fallback
function calculateFallbackPrayerTimes(lat: number, lng: number, date: Date, timezone: number) {
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

  // Egyptian General Authority uses 19.5 degrees for Fajr and 17.5 degrees for Isha
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

  const nightDuration = 24 - (maghribTime - fajrTime);
  const qiyamTime = (maghribTime + (2 / 3) * nightDuration) % 24;

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
    isha: toTimeString(ishaTime),
    qiyam: toTimeString(qiyamTime)
  };
}

// Calculate Qibla bearing from user location
function calculateQibla(lat: number, lng: number) {
  const phiK = (KAABA_LAT * Math.PI) / 180;
  const lambdaK = (KAABA_LNG * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;

  const y = Math.sin(lambdaK - lambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

// Calculate distance to Kaaba (Haversine formula in KM)
function calculateDistanceToKaaba(lat: number, lng: number) {
  const R = 6371; // Earth radius in km
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) * Math.cos((KAABA_LAT * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const PrayerTimesQibla: React.FC = () => {
  // Default to Cairo, Egypt with Egyptian Survey Authority
  const [selectedCity, setSelectedCity] = useState<CityOption>(() => {
    try {
      const saved = localStorage.getItem('tareeq_selected_city') || localStorage.getItem('nour_selected_city');
      return saved ? JSON.parse(saved) : CITIES[0]; // Default: Cairo
    } catch {
      return CITIES[0];
    }
  });

  const [activeTab, setActiveTab] = useState<'prayers' | 'adhan_guide' | 'qibla'>('prayers');
  const [now, setNow] = useState(new Date());

  // 12-Hour format setting (Default is TRUE / 12 Hours with ص / م)
  const [use12HourFormat, setUse12HourFormat] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tareeq_time_format_12h');
      return saved !== null ? saved === 'true' : true; // Default to 12-hour format
    } catch {
      return true;
    }
  });

  // Auto-Adhan Notification & Audio Toggle
  const [autoAdhanEnabled, setAutoAdhanEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tareeq_auto_adhan');
      return saved !== null ? saved === 'true' : true; // Default to TRUE
    } catch {
      return true;
    }
  });

  // Individual prayer notification settings
  const [prayerNotifications, setPrayerNotifications] = useState<{ [key: string]: boolean }>(() => {
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
  });

  // Selected Adhan voice
  const [selectedAdhanId, setSelectedAdhanId] = useState<string>(() => {
    try {
      return localStorage.getItem('tareeq_selected_adhan_id') || ADHAN_LIST[0].id;
    } catch {
      return ADHAN_LIST[0].id;
    }
  });

  // Notification Permission State
  const [notificationStatus, setNotificationStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');

  // Modals state
  const [isAdhanModalOpen, setIsAdhanModalOpen] = useState<boolean>(false);
  const [adhanModalPrayer, setAdhanModalPrayer] = useState<string>('الصلاة');
  const [showAutoAdhanModal, setShowAutoAdhanModal] = useState<boolean>(false);
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);
  
  // Home & Lock Screen Widgets & Pre-Prayer Alert States
  const [showWidgetsModal, setShowWidgetsModal] = useState<boolean>(false);
  const [showAmbientLockScreen, setShowAmbientLockScreen] = useState<boolean>(false);
  const [isFloatingWidgetActive, setIsFloatingWidgetActive] = useState<boolean>(() => prayerWidgetService.isFloatingWidgetActive());
  const [prePrayerAlertEnabled, setPrePrayerAlertEnabled] = useState<boolean>(() => adhanScheduler.isPrePrayerAlertEnabled());
  const [prePrayerMinutes, setPrePrayerMinutes] = useState<number>(() => adhanScheduler.getPrePrayerAlertMinutes());
  const [prePrayerVoice, setPrePrayerVoice] = useState<boolean>(() => adhanScheduler.isPrePrayerVoiceEnabled());
  const [isTestingPreAlertSound, setIsTestingPreAlertSound] = useState<boolean>(false);

  // Subscribe to live floating widget state
  useEffect(() => {
    const unsub = prayerWidgetService.subscribeFloating((active) => {
      setIsFloatingWidgetActive(active);
    });
    return () => unsub();
  }, []);

  const handleQuickToggleFloatingWidget = async () => {
    if (isFloatingWidgetActive) {
      await prayerWidgetService.stopFloatingWidget();
      setIsFloatingWidgetActive(false);
    } else {
      const ok = await prayerWidgetService.startFloatingWidget();
      setIsFloatingWidgetActive(ok);
      if (!ok) {
        setShowWidgetsModal(true);
      }
    }
  };

  // Manual minute adjustment for local mosque sync
  const [timeAdjustments, setTimeAdjustments] = useState<{ [key: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('tareeq_prayer_adjustments') || localStorage.getItem('nour_prayer_adjustments');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [showAdjustModal, setShowAdjustModal] = useState(false);


  // Live Accurate Timings from AlAdhan API
  const [apiTimings, setApiTimings] = useState<{
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    qiyam?: string;
  } | null>(null);

  const [hijriDateFromApi, setHijriDateFromApi] = useState<string | null>(null);
  const [loadingApi, setLoadingApi] = useState<boolean>(false);

  // Last prayer time that triggered auto-adhan to prevent double ringing
  const lastTriggeredPrayerRef = useRef<string>('');

  // Update clock every second for exact second precision
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch precise prayer times from AlAdhan API based on selected city & Egyptian method 5
  useEffect(() => {
    let isMounted = true;
    setLoadingApi(true);

    const d = new Date();
    const dateStr = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    const methodParam = selectedCity.method || 5;
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${selectedCity.lat}&longitude=${selectedCity.lng}&method=${methodParam}`;

    fetch(url)
      .then((res) => res.json())
      .then((resData) => {
        if (isMounted && resData.code === 200 && resData.data) {
          const t = resData.data.timings;
          const parsedTimings = {
            fajr: t.Fajr?.slice(0, 5) || '04:49',
            sunrise: t.Sunrise?.slice(0, 5) || '06:23',
            dhuhr: t.Dhuhr?.slice(0, 5) || '12:59',
            asr: t.Asr?.slice(0, 5) || '16:36',
            maghrib: t.Maghrib?.slice(0, 5) || '19:34',
            isha: t.Isha?.slice(0, 5) || '20:57',
            qiyam: t.Lastthird?.slice(0, 5) || '02:47'
          };
          setApiTimings(parsedTimings);

          try {
            const todayKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            localStorage.setItem(`tareeq_api_timings_${selectedCity.name}_${todayKey}`, JSON.stringify(parsedTimings));
          } catch {}

          if (resData.data.date?.hijri) {
            const h = resData.data.date.hijri;
            setHijriDateFromApi(`${h.weekday?.ar || ''} ${h.day} ${h.month?.ar || ''} ${h.year} هـ`);
          }
          setLoadingApi(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('AlAdhan API unavailable, fallback to astronomical calculation', err);
          setLoadingApi(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // State for Qibla & Compass
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [compassInputMode, setCompassInputMode] = useState<'auto' | 'manual'>('auto');
  const [manualFacingAngle, setManualFacingAngle] = useState<number>(0);
  const [compassPermission, setCompassPermission] = useState<'granted' | 'denied' | 'prompt' | 'unsupported'>('prompt');
  const [isCalibrated, setIsCalibrated] = useState<boolean>(true);
  const [isGpsLocating, setIsGpsLocating] = useState<boolean>(false);
  const [manualHeadingOffset, setManualHeadingOffset] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tareeq_qibla_heading_offset');
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const updateHeadingOffset = (newOffset: number | ((prev: number) => number)) => {
    setManualHeadingOffset((prev) => {
      const val = typeof newOffset === 'function' ? newOffset(prev) : newOffset;
      const clamped = Math.max(-45, Math.min(45, val));
      try {
        localStorage.setItem('tareeq_qibla_heading_offset', String(clamped));
      } catch {}
      return clamped;
    });
  };
  const [isCitySearchModalOpen, setIsCitySearchModalOpen] = useState<boolean>(false);
  const [citySearchText, setCitySearchText] = useState<string>('');
  const [gpsNotification, setGpsNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const lastHeadingRef = useRef<number | null>(null);
  const hasVibratedRef = useRef<boolean>(false);

  // Device Level / Tilt State for High Precision Angle Detection
  const [phoneTilt, setPhoneTilt] = useState<{ pitch: number; roll: number; isFlat: boolean }>({ pitch: 0, roll: 0, isFlat: true });

  // Clear any legacy flipped flag from localStorage so user never has inverted heading
  useEffect(() => {
    try {
      localStorage.removeItem('tareeq_compass_flipped');
    } catch {}
  }, []);

  // Qibla Angle Standard / Mode (Defaults to auto_calculated for exact city bearing)
  const [qiblaAngleMode, setQiblaAngleMode] = useState<'survey_egypt_137' | 'auto_calculated' | 'custom'>(() => {
    try {
      const saved = localStorage.getItem('tareeq_qibla_angle_mode');
      return (saved as any) || 'auto_calculated';
    } catch {
      return 'auto_calculated';
    }
  });

  const [customAngleValue, setCustomAngleValue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tareeq_custom_qibla_angle');
      return saved ? Number(saved) : 137;
    } catch {
      return 137;
    }
  });

  const handleSetQiblaMode = (mode: 'survey_egypt_137' | 'auto_calculated' | 'custom', customVal?: number) => {
    setQiblaAngleMode(mode);
    try {
      localStorage.setItem('tareeq_qibla_angle_mode', mode);
      if (customVal !== undefined) {
        setCustomAngleValue(customVal);
        localStorage.setItem('tareeq_custom_qibla_angle', String(customVal));
      }
    } catch {}
  };

  const calculatedBearing = calculateQiblaBearing(selectedCity.lat, selectedCity.lng);
  const qiblaBearing = 
    qiblaAngleMode === 'survey_egypt_137'
      ? 137
      : qiblaAngleMode === 'custom'
      ? customAngleValue
      : calculatedBearing;

  const distanceKaaba = calculateDistanceToKaabaKm(selectedCity.lat, selectedCity.lng);
  const cardinalInfo = getCardinalDirectionArabic(qiblaBearing);
  const qiblaDeg = Math.round(qiblaBearing);

  // Live Solar Position Calculation for ground-truth visual verification
  const [currentTimeForSun, setCurrentTimeForSun] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTimeForSun(new Date()), 2000);
    return () => clearInterval(timer);
  }, []);
  const liveSunData = calculateSunPosition(currentTimeForSun, selectedCity.lat, selectedCity.lng);

  // Listen to device orientation for real-time accurate Compass with reliable web standards
  useEffect(() => {
    let isMounted = true;
    let hasAbsoluteSensor = false;

    const processHeading = (rawHeading: number, beta: number | null, gamma: number | null, isTrueNorth: boolean = false) => {
      if (!isMounted || isNaN(rawHeading) || rawHeading === null) return;

      // Track tilt for high-precision leveling (Phone is flat if pitch & roll <= 18°)
      if (beta !== null && gamma !== null) {
        const isFlat = Math.abs(beta) <= 18 && Math.abs(gamma) <= 18;
        setPhoneTilt({ pitch: Math.round(beta), roll: Math.round(gamma), isFlat });
      }

      // Apply manual offset if calibrated by user
      let adjusted = (rawHeading + manualHeadingOffset + 360) % 360;

      // Adaptive smoothing filter: Smooth micro-jitter (0.25), responsive turns (0.80)
      if (lastHeadingRef.current !== null) {
        let diff = adjusted - lastHeadingRef.current;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        const absDiff = Math.abs(diff);
        const lerpFactor = absDiff > 40 ? 0.85 : absDiff > 10 ? 0.50 : 0.25;
        adjusted = (lastHeadingRef.current + diff * lerpFactor + 360) % 360;
      }

      lastHeadingRef.current = adjusted;
      setDeviceHeading(Math.round(adjusted));
      setCompassPermission('granted');
    };

    const computeHeadingFromAngles = (alpha: number, beta: number | null, gamma: number | null): number => {
      const screenAngle = 
        (window.screen?.orientation?.angle !== undefined) 
          ? window.screen.orientation.angle 
          : ((window as any).orientation !== undefined ? Number((window as any).orientation) : 0);

      // W3C standard 3D tilt-compensated compass calculation
      if (beta !== null && beta !== undefined && gamma !== null && gamma !== undefined) {
        const degToRad = Math.PI / 180;
        const a = alpha * degToRad;
        const b = beta * degToRad;
        const g = gamma * degToRad;

        const cA = Math.cos(a);
        const sA = Math.sin(a);
        const sB = Math.sin(b);
        const cG = Math.cos(g);
        const sG = Math.sin(g);

        const rA = -cA * sG - sA * sB * cG;
        const rB = -sA * sG + cA * sB * cG;

        if (Math.hypot(rA, rB) > 0.08) {
          let compassHeading = Math.atan2(rA, rB) * (180 / Math.PI);
          if (compassHeading < 0) compassHeading += 360;
          return (compassHeading + screenAngle + 360) % 360;
        }
      }

      return (360 - alpha + screenAngle + 360) % 360;
    };

    // 1. Android Absolute Orientation Event (Magnetic/True North)
    const handleAbsoluteOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && e.alpha !== undefined) {
        hasAbsoluteSensor = true;
        const heading = computeHeadingFromAngles(e.alpha, e.beta, e.gamma);
        processHeading(heading, e.beta, e.gamma, false);
      }
    };

    // 2. Standard Orientation Event (iOS webkitCompassHeading or Android fallback)
    const handleStandardOrientation = (e: DeviceOrientationEvent) => {
      const anyEvent = e as any;
      // iOS webkitCompassHeading provides true/magnetic heading directly (0-360 clockwise)
      if (anyEvent.webkitCompassHeading !== undefined && anyEvent.webkitCompassHeading !== null && !isNaN(anyEvent.webkitCompassHeading)) {
        processHeading(anyEvent.webkitCompassHeading, e.beta, e.gamma, true);
        return;
      }

      // If absolute sensor is already providing reliable orientation data, ignore relative orientation
      if (hasAbsoluteSensor) {
        return;
      }

      // Android deviceorientation with absolute=true
      if (e.absolute && e.alpha !== null && e.alpha !== undefined) {
        const heading = computeHeadingFromAngles(e.alpha, e.beta, e.gamma);
        processHeading(heading, e.beta, e.gamma, false);
        return;
      }

      // Fallback relative alpha
      if (e.alpha !== null && e.alpha !== undefined) {
        const heading = computeHeadingFromAngles(e.alpha, e.beta, e.gamma);
        processHeading(heading, e.beta, e.gamma, false);
      }
    };

    try {
      window.addEventListener('deviceorientationabsolute' as any, handleAbsoluteOrientation, true);
      window.addEventListener('deviceorientation', handleStandardOrientation, true);
    } catch {}

    return () => {
      isMounted = false;
      try {
        window.removeEventListener('deviceorientationabsolute' as any, handleAbsoluteOrientation, true);
        window.removeEventListener('deviceorientation', handleStandardOrientation, true);
      } catch {}
    };
  }, [activeTab, manualHeadingOffset]);

  // Vibrate phone gently when user is facing Qibla exactly (within 3 degrees)
  useEffect(() => {
    if (activeTab === 'qibla' && deviceHeading !== null) {
      const diff = Math.abs(((qiblaBearing - deviceHeading + 540) % 360) - 180);
      if (diff <= 3) {
        if (!hasVibratedRef.current && navigator.vibrate) {
          try {
            navigator.vibrate([70, 50, 70]);
            hasVibratedRef.current = true;
          } catch {}
        }
      } else {
        hasVibratedRef.current = false;
      }
    }
  }, [activeTab, deviceHeading, qiblaBearing]);

  // Request iOS Compass Permission
  const handleRequestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') {
          setCompassPermission('granted');
        } else {
          setCompassPermission('denied');
        }
      } catch (err) {
        console.warn('Compass permission error:', err);
      }
    } else {
      // Android / other browsers start automatically when moved
      if (deviceHeading !== null) {
        setCompassPermission('granted');
      }
    }
  };

  // Check Notification permission status on mount & listen to location updates
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    } else {
      setNotificationStatus('unsupported');
    }

    const handleLocationUpdated = (e: any) => {
      if (e.detail?.city) {
        setSelectedCity(e.detail.city);
      } else if (e.detail?.lat && e.detail?.lng) {
        const custom: CityOption = {
          name: 'موقعي الدقيق (GPS)',
          country: 'الموقع الجغرافي المباشر',
          lat: e.detail.lat,
          lng: e.detail.lng,
          timezone: -new Date().getTimezoneOffset() / 60,
          method: 5
        };
        setSelectedCity(custom);
      }
    };

    window.addEventListener('nour_location_updated', handleLocationUpdated);
    return () => {
      window.removeEventListener('nour_location_updated', handleLocationUpdated);
    };
  }, []);

  // Listen to messages from Service Worker (e.g. user clicked notification)
  useEffect(() => {
    const handleSwMsg = (e: MessageEvent) => {
      if (e.data?.type === 'TRIGGER_ADHAN_FROM_NOTIFICATION') {
        const prayer = e.data.prayerLabel || 'الصلاة';
        const adhanId = e.data.adhanId;
        if (adhanId) setSelectedAdhanId(adhanId);
        setAdhanModalPrayer(prayer);
        setIsAdhanModalOpen(true);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMsg);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMsg);
      };
    }
  }, []);

  // Check URL query action
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'play_adhan') {
      const prayerParam = params.get('prayer') || 'الصلاة';
      const adhanIdParam = params.get('adhanId');
      if (adhanIdParam) setSelectedAdhanId(adhanIdParam);
      setAdhanModalPrayer(prayerParam);
      setIsAdhanModalOpen(true);
      // Clean up URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleCityChange = (city: CityOption) => {
    setSelectedCity(city);
    try {
      localStorage.setItem('tareeq_selected_city', JSON.stringify(city));
      localStorage.setItem('nour_selected_city', JSON.stringify(city));
    } catch {
      // ignore
    }
  };

  const handleToggle12Hour = (val: boolean) => {
    setUse12HourFormat(val);
    try {
      localStorage.setItem('tareeq_time_format_12h', String(val));
    } catch {
      // ignore
    }
  };

  const handleToggleAutoAdhan = async () => {
    const nextVal = !autoAdhanEnabled;
    setAutoAdhanEnabled(nextVal);
    try {
      localStorage.setItem('tareeq_auto_adhan', String(nextVal));
    } catch {
      // ignore
    }

    if (nextVal && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        const res = await Notification.requestPermission();
        setNotificationStatus(res);
      }
    }
  };

  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported');
      return;
    }

    try {
      let res: NotificationPermission = 'default';
      if (typeof Notification.requestPermission === 'function') {
        try {
          res = await Notification.requestPermission();
        } catch {
          // Callback style fallback for legacy/safari
          Notification.requestPermission((p) => {
            setNotificationStatus(p);
            if (p === 'granted') {
              setAutoAdhanEnabled(true);
              try {
                localStorage.setItem('tareeq_auto_adhan', 'true');
              } catch {}
            }
          });
          return;
        }
      }

      setNotificationStatus(res);
      if (res === 'granted') {
        setAutoAdhanEnabled(true);
        try {
          localStorage.setItem('tareeq_auto_adhan', 'true');
        } catch {}
      }
    } catch (err) {
      console.warn('Notification permission request error:', err);
    }
  };

  const handleTogglePrayerNotification = (key: string) => {
    const updated = {
      ...prayerNotifications,
      [key]: !prayerNotifications[key]
    };
    setPrayerNotifications(updated);
    try {
      localStorage.setItem('tareeq_prayer_notifications', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSendTestNotification = async () => {
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 5000);

    // 1. Try sending system notification safely
    if ('Notification' in window) {
      try {
        let perm = Notification.permission;
        if (perm === 'default') {
          try {
            perm = await Notification.requestPermission();
            setNotificationStatus(perm);
          } catch {
            // ignore
          }
        }

        if (perm === 'granted') {
          showSafeNotification('تجربة تنبيه الأذان • طريق الهدى', {
            body: `تم تفعيل التنبيه بنجاح لمحافظة ${selectedCity.name}، سيصدح الأذان تلقائياً عند حلول موعد الصلاة.`,
            icon: '/icon.svg',
            data: {
              prayerLabel: 'أذان تجريبي',
              cityName: selectedCity.name,
              adhanId: selectedAdhanId
            }
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('Notification push dispatch error:', err);
      }
    }

    // 2. ALWAYS open adhan modal and start playing sound immediately
    setAdhanModalPrayer('أذان تجريبي');
    setIsAdhanModalOpen(true);
  };


  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('المتصفح لا يدعم تحديد الموقع الجغرافي.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const custom: CityOption = {
          name: 'موقعي الحالي (GPS)',
          country: 'الموقع الجغرافي المباشر',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timezone: -new Date().getTimezoneOffset() / 60,
          method: 5
        };
        handleCityChange(custom);
      },
      (err) => {
        alert('تعذر الوصول للموقع الجغرافي، يرجى اختيار محافظتك أو مدينتك من القائمة.');
      }
    );
  };

  const fallbackTimes = calculateFallbackPrayerTimes(selectedCity.lat, selectedCity.lng, now, selectedCity.timezone);
  const baseTimes = apiTimings || fallbackTimes;

  // Apply minute adjustments if any (in 24-hour domain)
  const applyAdj = (timeStr: string, key: string) => {
    const adj = timeAdjustments[key] || 0;
    if (adj === 0) return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    let totalMins = (h * 60 + m + adj + 1440) % 1440;
    const newH = Math.floor(totalMins / 60);
    const newM = totalMins % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  const prayerTimes24 = {
    fajr: applyAdj(baseTimes.fajr, 'fajr'),
    sunrise: applyAdj(baseTimes.sunrise, 'sunrise'),
    dhuhr: applyAdj(baseTimes.dhuhr, 'dhuhr'),
    asr: applyAdj(baseTimes.asr, 'asr'),
    maghrib: applyAdj(baseTimes.maghrib, 'maghrib'),
    isha: applyAdj(baseTimes.isha, 'isha'),
    qiyam: applyAdj(baseTimes.qiyam || fallbackTimes.qiyam, 'qiyam')
  };

  // Format Hijri Date
  const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  });
  const hijriDateStr = hijriDateFromApi || hijriFormatter.format(now);

  const prayersList = [
    { key: 'fajr', label: 'الفجر', rawTime: prayerTimes24.fajr, icon: Sunrise, desc: 'صلاة الصبح ركعتان', hasAdhan: true },
    { key: 'sunrise', label: 'الشروق', rawTime: prayerTimes24.sunrise, icon: Sun, desc: 'وقت انتهاء صلاة الصبح', hasAdhan: false },
    { key: 'dhuhr', label: 'الظهر', rawTime: prayerTimes24.dhuhr, icon: Sun, desc: 'أربع ركعات', hasAdhan: true },
    { key: 'asr', label: 'العصر', rawTime: prayerTimes24.asr, icon: Sun, desc: 'أربع ركعات (الصلاة الوسطى)', hasAdhan: true },
    { key: 'maghrib', label: 'المغرب', rawTime: prayerTimes24.maghrib, icon: Moon, desc: 'ثلاث ركعات مع الإفطار', hasAdhan: true },
    { key: 'isha', label: 'العشاء', rawTime: prayerTimes24.isha, icon: Moon, desc: 'أربع ركعات', hasAdhan: true },
    { key: 'qiyam', label: 'قيام الليل (الثلث الأخير)', rawTime: prayerTimes24.qiyam, icon: Sparkles, desc: 'أفضل الصلاة بعد الفريضة', hasAdhan: false }
  ];

  // Determine current & next prayer
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeMinutes = currentHours * 60 + currentMinutes;
  const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

  let nextPrayer = prayersList[0];
  let minDiff = 9999;

  prayersList.slice(0, 6).forEach((p) => {
    const [h, m] = p.rawTime.split(':').map(Number);
    const pMinutes = h * 60 + m;
    let diff = pMinutes - currentTimeMinutes;
    if (diff <= 0) diff += 1440;
    if (diff < minDiff) {
      minDiff = diff;
      nextPrayer = p;
    }
  });

  const nextHours = Math.floor(minDiff / 60);
  const nextMins = minDiff % 60;
  const nextPrayerFormatted = formatPrayerTime(nextPrayer.rawTime, use12HourFormat);

  // Background Auto-Adhan detection
  useEffect(() => {
    if (!autoAdhanEnabled) return;

    // Check if current time matches any prayer that has adhan and is enabled
    prayersList.forEach((p) => {
      const isEnabledForThisPrayer = prayerNotifications[p.key] !== false;
      if (
        p.rawTime === currentTimeStr && 
        isEnabledForThisPrayer &&
        lastTriggeredPrayerRef.current !== `${p.key}-${currentTimeStr}`
      ) {
        lastTriggeredPrayerRef.current = `${p.key}-${currentTimeStr}`;
        const targetAdhanId = p.key === 'fajr' ? 'fajr_makkah' : selectedAdhanId;
        
        // Dispatch safe cross-platform notification
        showSafeNotification(`حان الآن موعد أذان ${p.label}`, {
          body: `حي على الصلاة • طريق الهدى (${selectedCity.name})`,
          icon: '/icon.svg',
          tag: `adhan-${p.key}`,
          data: {
            prayerLabel: p.label,
            cityName: selectedCity.name,
            adhanId: targetAdhanId
          }
        }).catch(() => {});

        // Open Adhan player and play sound
        setAdhanModalPrayer(p.label);
        if (p.key === 'fajr') {
          setSelectedAdhanId('fajr_makkah');
        }
        setIsAdhanModalOpen(true);
      }
    });
  }, [currentTimeStr, autoAdhanEnabled, prayerNotifications, prayersList, selectedCity.name, selectedAdhanId]);

  const handleOpenAdhanModal = (prayerLabel: string, specificAdhanId?: string) => {
    setAdhanModalPrayer(prayerLabel);
    if (specificAdhanId) {
      setSelectedAdhanId(specificAdhanId);
    }
    setIsAdhanModalOpen(true);
  };


  const handleAdjustmentChange = (key: string, delta: number) => {
    const updated = {
      ...timeAdjustments,
      [key]: (timeAdjustments[key] || 0) + delta
    };
    setTimeAdjustments(updated);
    try {
      localStorage.setItem('tareeq_prayer_adjustments', JSON.stringify(updated));
      localStorage.setItem('nour_prayer_adjustments', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const selectedAdhanObj = ADHAN_LIST.find(a => a.id === selectedAdhanId) || ADHAN_LIST[0];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-6 pb-28">
      {/* Header Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1B3022] via-[#233F2E] to-[#142419] border border-[#2D4536] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#142419]/80 border border-[#3D5A47] text-[#E9B161] text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>مواقيت الصلاة والأذان • الهيئة المصرية العامة للمساحة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-scheherazade leading-tight mb-2">
            ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا ﴾
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#A8BCAD]">
            <span>{hijriDateStr}</span>
            <span>•</span>
            <span className="text-[#E9B161] font-semibold">{selectedCity.name}</span>
            <span>•</span>
            <span className="text-stone-300">نظام {use12HourFormat ? '١٢ ساعة (ص / م)' : '٢٤ ساعة'}</span>
          </div>
        </div>

        <div className="absolute left-6 -bottom-10 opacity-10 text-9xl font-scheherazade text-[#E9B161] select-none pointer-events-none hidden sm:block">
          صلاة
        </div>
      </div>

      {/* City Selector Bar, 12-Hour Toggle, Adhan Alert, and Adjustments */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* City Select & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <MapPin className="w-4 h-4 text-[#1B3022] dark:text-[#E9B161] shrink-0" />
          <span className="font-semibold text-[#2C3E30] dark:text-[#E0E7E1] shrink-0">المدينة:</span>
          <select
            value={selectedCity.name}
            onChange={(e) => {
              const found = CITIES.find((c) => c.name === e.target.value);
              if (found) handleCityChange(found);
            }}
            aria-label="اختر مدينتك لحساب المواقيت والقبلة"
            className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#3D5A47] font-bold text-[#2C3E30] dark:text-[#E0E7E1] focus:outline-none cursor-pointer"
          >
            {/* If selected city is custom or GPS */}
            {!CITIES.some(c => c.name === selectedCity.name) && (
              <option value={selectedCity.name}>📍 {selectedCity.name} ({selectedCity.country})</option>
            )}

            <optgroup label="🇪🇬 محافظات جمهورية مصر العربية">
              {CITIES.filter(c => c.country === 'مصر').map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </optgroup>

            <optgroup label="🇸🇦 المملكة العربية السعودية">
              {CITIES.filter(c => c.country === 'السعودية').map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </optgroup>

            <optgroup label="🇵🇸 🇯🇴 🇸🇾 🇱🇧 فلسطين والأردن والشام">
              {CITIES.filter(c => ['فلسطين', 'الأردن', 'سوريا', 'لبنان'].includes(c.country)).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.country})
                </option>
              ))}
            </optgroup>

            <optgroup label="🇦🇪 🇰🇼 🇶🇦 🇧🇭 🇴🇲 الإمارات والخليج العربي">
              {CITIES.filter(c => ['الإمارات', 'الكويت', 'قطر', 'البحرين', 'عمان'].includes(c.country)).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.country})
                </option>
              ))}
            </optgroup>

            <optgroup label="🇮🇶 🇾🇪 العراق واليمن">
              {CITIES.filter(c => ['العراق', 'اليمن'].includes(c.country)).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.country})
                </option>
              ))}
            </optgroup>

            <optgroup label="🇲🇦 🇩🇿 🇹🇳 🇱🇾 🇸🇩 المغرب العربي وشمال أفريقيا">
              {CITIES.filter(c => ['السودان', 'ليبيا', 'تونس', 'الجزائر', 'المغرب', 'موريتانيا', 'الصومال', 'جيبوتي'].includes(c.country)).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.country})
                </option>
              ))}
            </optgroup>

            <optgroup label="🌍 تركيا والعواصم الإسلامية والعالمية">
              {CITIES.filter(c => ['تركيا', 'ماليزيا', 'إندونيسيا', 'باكستان', 'بنغلاديش', 'المملكة المتحدة', 'فرنسا', 'ألمانيا', 'الولايات المتحدة', 'كندا', 'أستراليا'].includes(c.country)).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.country})
                </option>
              ))}
            </optgroup>
          </select>

          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setIsCitySearchModalOpen(true)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-[#E9B161]/20 dark:bg-[#142419] dark:hover:bg-[#2D4536] border border-[#2D4536]/20 dark:border-[#3D5A47] text-[#55695C] dark:text-[#E9B161] transition-colors cursor-pointer shrink-0"
            title="بحث سريع في كل المدن والمحافظات"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Tools: 12H Switch, Auto-Adhan, Adjust Minutes, GPS */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* 12H vs 24H Toggle Switch */}
          <div className="flex items-center p-1 rounded-xl bg-[#F3F5F4] dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#3D5A47]">
            <button
              onClick={() => handleToggle12Hour(true)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                use12HourFormat
                  ? 'bg-[#1B3022] text-[#E9B161] shadow-sm'
                  : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
              }`}
              title="عرض الوقت بنظام 12 ساعة مع ص/م"
            >
              <span>١٢ ساعة</span>
            </button>
            <button
              onClick={() => handleToggle12Hour(false)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                !use12HourFormat
                  ? 'bg-[#1B3022] text-[#E9B161] shadow-sm'
                  : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
              }`}
              title="عرض الوقت بنظام 24 ساعة"
            >
              <span>٢٤ ساعة</span>
            </button>
          </div>

          {/* Auto Adhan Alert Toggle & Settings */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleAutoAdhan}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all font-semibold cursor-pointer ${
                autoAdhanEnabled
                  ? 'bg-[#E9B161]/20 border-[#E9B161] text-[#E9B161] dark:bg-[#E9B161]/15'
                  : 'bg-[#F3F5F4] dark:bg-[#142419] border-[#2D4536]/20 dark:border-[#3D5A47] text-[#55695C] dark:text-[#A8BCAD]'
              }`}
              title="تفعيل التنبيه الصوتي التلقائي للأذان عند موعد الصلاة حتى لو التطبيق مغلق"
            >
              {autoAdhanEnabled ? <BellRing className="w-3.5 h-3.5 text-[#E9B161] animate-bounce" /> : <BellOff className="w-3.5 h-3.5" />}
              <span>الأذان التلقائي: {autoAdhanEnabled ? 'مفعّل' : 'معطّل'}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAutoAdhanModal(true);
              }}
              className="p-2 rounded-xl bg-[#F3F5F4] dark:bg-[#142419] hover:bg-[#E0E7E1] dark:hover:bg-[#2D4536] text-[#2C3E30] dark:text-[#E9B161] border border-[#2D4536]/20 dark:border-[#3D5A47] transition-colors cursor-pointer"
              title="إعدادات وتخصيص الأذان التلقائي وتنبيهات الخلفية"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Adjust Minutes */}
          <button
            onClick={() => setShowAdjustModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F3F5F4] dark:bg-[#142419] hover:bg-[#E0E7E1] dark:hover:bg-[#2D4536] text-[#2C3E30] dark:text-[#E0E7E1] font-semibold border border-[#2D4536]/20 dark:border-[#3D5A47] transition-colors"
            title="ضبط دقائق الصلوات يدوياً لمطابقة مسجدك المحلي"
          >
            <Sliders className="w-3.5 h-3.5 text-[#E9B161]" />
            <span>ضبط الدقائق</span>
          </button>

          {/* GPS Location */}
          <button
            onClick={handleUseCurrentLocation}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B3022] hover:bg-[#233F2E] text-[#E9B161] font-semibold border border-[#3D5A47] transition-colors justify-center"
            title="تحديد الموقع الجغرافي تلقائياً عبر الـ GPS"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>موقعي</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Prayers vs Adhan Voices vs Qibla */}
      <div className="flex items-center p-1.5 rounded-2xl bg-[#1B3022]/10 dark:bg-[#1B3022]/40 border border-[#2D4536]/20 dark:border-[#2D4536]">
        <button
          onClick={() => setActiveTab('prayers')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'prayers'
              ? 'bg-[#1B3022] text-[#E9B161] shadow-md dark:bg-[#1B3022] dark:text-[#E9B161]'
              : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>مواقيت الصلوات الخمس</span>
        </button>

        <button
          onClick={() => setActiveTab('adhan_guide')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'adhan_guide'
              ? 'bg-[#1B3022] text-[#E9B161] shadow-md dark:bg-[#1B3022] dark:text-[#E9B161]'
              : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>صوت وسُنن الأذان</span>
        </button>

        <button
          onClick={() => setActiveTab('qibla')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'qibla'
              ? 'bg-[#1B3022] text-[#E9B161] shadow-md dark:bg-[#1B3022] dark:text-[#E9B161]'
              : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>اتجاه القبلة</span>
        </button>
      </div>

      {/* VIEW 1: PRAYER TIMES */}
      {activeTab === 'prayers' && (
        <div className="space-y-6">
          {/* Auto-Adhan Status & Config Banner */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            autoAdhanEnabled
              ? 'bg-emerald-50/80 dark:bg-[#142419] border-emerald-300/40 dark:border-[#3D5A47]'
              : 'bg-amber-50/80 dark:bg-[#1f1a14] border-amber-300/40 dark:border-amber-900/50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                autoAdhanEnabled ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {autoAdhanEnabled ? <BellRing className="w-4 h-4 animate-pulse" /> : <BellOff className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#2C3E30] dark:text-white flex items-center gap-2">
                  <span>{autoAdhanEnabled ? 'الأذان التلقائي مفعّل عند كل صلاة' : 'تنبيه الأذان التلقائي معطّل'}</span>
                  {autoAdhanEnabled && notificationStatus === 'granted' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                      جاهز بالخلفية
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-[#55695C] dark:text-[#A8BCAD] mt-0.5">
                  {autoAdhanEnabled
                    ? 'سيصدح الأذان بصوت المؤذن المختار فور حلول وقت الصلاة حتى لو التطبيق في الخلفية'
                    : 'اضغط لتفعيل الأذان التلقائي ليؤذن التطبيق عند حلول موعد الصلاة'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAutoAdhanModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B3022] hover:bg-stone-100 dark:hover:bg-[#233F2E] text-[#1B3022] dark:text-[#E9B161] font-bold text-xs border border-[#2D4536]/20 dark:border-[#3D5A47] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>إعدادات التنبيه</span>
              </button>

              {!autoAdhanEnabled ? (
                <button
                  type="button"
                  onClick={handleToggleAutoAdhan}
                  className="px-4 py-1.5 rounded-xl bg-[#1B3022] dark:bg-[#E9B161] hover:bg-[#233F2E] text-[#E9B161] dark:text-[#1B3022] font-bold text-xs shadow transition-all cursor-pointer"
                >
                  تفعيل الآن
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  className="px-3 py-1.5 rounded-xl bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                  title="تجربة تنبيه الأذان الفوري"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>تجربة الأذان</span>
                </button>
              )}
            </div>
          </div>

          {/* Phone Widget Download and Customization Card */}
          <div className="p-4 sm:p-5 rounded-3xl border transition-all duration-300 bg-white dark:bg-[#1B3022]/40 border-[#2D4536]/20 dark:border-[#2D4536] text-[#2C3E30] dark:text-white shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="p-2.5 rounded-2xl bg-[#E9B161]/15 text-[#E9B161]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg font-scheherazade">
                      ودجت مواقيت الصلاة لشاشة الهاتف
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#E9B161]/20 text-[#E9B161] border border-[#E9B161]/30">
                        ✨ تصاميم وأشكال متعددة
                      </span>
                      <span className="text-[10px] text-[#A8BCAD] hidden sm:inline">
                        • تحميل مباشر لجهازك
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#55695C] dark:text-[#A8BCAD] leading-relaxed">
                  اختر شكل وتصميم الودجت المفضل لديك (الذهبي، الزمردي، أو الأسود) وقم بتحميله مباشرة كصورة فائقة الدقة أو كملف ودجت، لوضعه على شاشة هاتفك الرئيسية وشاشة القفل.
                </p>
              </div>

              {/* Master Control Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
                {/* 1. Quick Floating Live Widget Trigger (Seconds Clock) */}
                <button
                  type="button"
                  onClick={handleQuickToggleFloatingWidget}
                  className={`px-4 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] ${
                    isFloatingWidgetActive
                      ? 'bg-red-500/20 text-red-300 border-2 border-red-500/50 hover:bg-red-500/30'
                      : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 text-[#09150E] hover:from-emerald-400 hover:to-teal-400 shadow-emerald-900/30'
                  }`}
                  title="تشغيل ساعة وودجت الصلاة الحية فوق شاشة الهاتف مباشرة"
                >
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>{isFloatingWidgetActive ? 'إيقاف الودجت العائم ⏹️' : 'تشغيل الودجت المصغّر الحي (ساعة بالثواني) 🟢'}</span>
                </button>

                {/* 2. Full Widgets Center Trigger */}
                <button
                  type="button"
                  onClick={() => setShowWidgetsModal(true)}
                  className="px-4 py-3 rounded-2xl bg-[#E9B161]/15 hover:bg-[#E9B161]/25 text-[#E9B161] border border-[#E9B161]/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="كل خيارات وأشكال وتصاميم ودجات شاشة الهاتف"
                >
                  <Download className="w-4 h-4 text-[#E9B161] shrink-0" />
                  <span>ودجات شاشة الهاتف 📱</span>
                </button>

                {/* 3. Ambient Display Mode Trigger */}
                <button
                  type="button"
                  onClick={() => setShowAmbientLockScreen(true)}
                  className="p-3 rounded-2xl bg-stone-100 dark:bg-[#142419] hover:bg-stone-200 dark:hover:bg-[#233F2E] text-[#2C3E30] dark:text-[#A8BCAD] hover:text-white border border-[#2D4536]/20 dark:border-[#3D5A47] text-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="شاشة القفل الحية الليلية (Always-On)"
                >
                  <Tv className="w-4 h-4 text-[#E9B161]" />
                </button>
              </div>
            </div>
          </div>

          {/* Dedicated 15-Minute Pre-Prayer Alert Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2D4536]/10 dark:border-[#2D4536]/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#E9B161]/15 text-[#E9B161] border border-[#E9B161]/30">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2C3E30] dark:text-white flex items-center gap-2">
                    <span>التنبيه الصوتي المسبق قبل دخول الصلاة ({prePrayerMinutes} دقيقة)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      prePrayerAlertEnabled 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400/30'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}>
                      {prePrayerAlertEnabled ? 'مفعّل' : 'معطّل'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#55695C] dark:text-[#A8BCAD] mt-0.5">
                    نطق فصيح بالتشكيل للآية: ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾ وتذكير بالصلاة السابقة والاستعداد للصلاة القادمة
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !prePrayerAlertEnabled;
                  setPrePrayerAlertEnabled(next);
                  adhanScheduler.setPrePrayerAlertEnabled(next);
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center shrink-0 cursor-pointer ${
                  prePrayerAlertEnabled ? 'bg-[#E9B161] justify-end' : 'bg-stone-300 dark:bg-[#2D4536] justify-start'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white dark:bg-[#1B3022] shadow-md transition-transform ${
                  prePrayerAlertEnabled ? 'border-2 border-[#1B3022]' : ''
                }`} />
              </button>
            </div>

            {/* Quick Settings & Test */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-[#55695C] dark:text-[#A8BCAD] ml-1">
                  موعد التنبيه:
                </span>
                {[10, 15, 20, 30].map((mins) => {
                  const isCur = prePrayerMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setPrePrayerMinutes(mins);
                        adhanScheduler.setPrePrayerAlertMinutes(mins);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                        isCur
                          ? 'bg-[#E9B161] text-[#142419] font-bold shadow-sm'
                          : 'bg-stone-100 dark:bg-[#142419] text-[#55695C] dark:text-[#A8BCAD] hover:bg-stone-200 dark:hover:bg-[#233F2E]'
                      }`}
                    >
                      {mins} دقيقة {mins === 15 ? '⭐' : ''}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsTestingPreAlertSound(true);
                    adhanScheduler.testPrePrayerAlert(nextPrayer.label, prePrayerMinutes);
                    setTimeout(() => setIsTestingPreAlertSound(false), 3500);
                  }}
                  disabled={isTestingPreAlertSound}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                    isTestingPreAlertSound
                      ? 'bg-amber-500 text-black animate-pulse'
                      : 'bg-stone-100 dark:bg-[#142419] hover:bg-stone-200 dark:hover:bg-[#233F2E] text-[#1B3022] dark:text-[#E9B161] border border-[#2D4536]/20 dark:border-[#3D5A47]'
                  }`}
                  title="تجربة صوت النغمة والتذكير الصوتي الآن"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isTestingPreAlertSound ? 'جارٍ التشغيل...' : '🔊 تجربة صوت التنبيه'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowWidgetsModal(true)}
                  className="px-2.5 py-1.5 rounded-xl text-[#55695C] dark:text-[#A8BCAD] hover:text-[#1B3022] dark:hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                  title="المزيد من خيارات ودجات وتنبيهات الصلاة"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>تخصيص</span>
                </button>
              </div>
            </div>
          </div>

          {/* Next Prayer Countdown & Instant Adhan Play Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1B3022] via-[#233F2E] to-[#1B3022] border border-[#3D5A47] text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
            <div>
              <span className="text-xs text-[#E9B161] font-semibold block mb-1">الصلاة القادمة</span>
              <h3 className="text-2xl sm:text-3xl font-bold font-scheherazade text-white">
                صلاة {nextPrayer.label}
              </h3>
              <p className="text-xs text-[#A8BCAD] mt-1">
                موعد الأذان: <strong className="font-mono text-[#E9B161] text-base">{nextPrayerFormatted.formatted}</strong> • {nextPrayer.desc}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-center">
              <div className="px-5 py-3 rounded-2xl bg-[#142419]/80 border border-[#3D5A47] backdrop-blur-md">
                <span className="text-[11px] text-[#A8BCAD] block mb-0.5">متبقي على الأذان:</span>
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#E9B161]">
                  {nextHours > 0 ? `${nextHours} ساعة و ` : ''}{nextMins} دقيقة
                </div>
              </div>

              {/* Quick Listen to Adhan Button */}
              <button
                onClick={() => handleOpenAdhanModal(nextPrayer.label)}
                className="px-4 py-3 rounded-2xl bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#E9B161]/20 transition-all hover:scale-105"
                title="استماع فوري للأذان ودعاء ما بعد الأذان"
              >
                <Volume2 className="w-4 h-4 fill-current" />
                <span>سماع الأذان الآن</span>
              </button>
            </div>
          </div>

          {/* Prayers Grid with Adhan Listen Buttons & Per-Prayer Alarm Bells */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {prayersList.map((p) => {
              const Icon = p.icon;
              const isNext = p.key === nextPrayer.key;
              const adj = timeAdjustments[p.key] || 0;
              const timeObj = formatPrayerTime(p.rawTime, use12HourFormat);
              const isNotificationEnabled = prayerNotifications[p.key] !== false;

              return (
                <div
                  key={p.key}
                  id={`prayer-card-${p.key}`}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isNext
                      ? 'bg-[#1B3022]/10 dark:bg-[#1B3022]/50 border-[#E9B161] shadow-md shadow-[#E9B161]/5 ring-1 ring-[#E9B161]/40'
                      : 'bg-white dark:bg-[#1B3022]/30 border-[#2D4536]/15 dark:border-[#2D4536]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isNext ? 'bg-[#E9B161] text-[#1B3022]' : 'bg-[#1B3022]/10 dark:bg-[#142419] text-[#1B3022] dark:text-[#E9B161]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-[#2C3E30] dark:text-white">{p.label}</h4>
                          {adj !== 0 && (
                            <span className="text-[10px] text-[#E9B161] font-mono font-bold">
                              ({adj > 0 ? `+${adj}` : adj}د)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#7A8C80] dark:text-[#A8BCAD]">{p.desc}</p>
                        {isNext && (
                          <span className="text-[10px] text-[#C2822B] dark:text-[#E9B161] font-semibold block mt-0.5">الصلاة القادمة</span>
                        )}
                      </div>
                    </div>

                    {/* Prayer Time Value with 12H Badge */}
                    <div className="text-left flex items-baseline gap-1">
                      <span className="font-mono font-bold text-xl sm:text-2xl text-[#2C3E30] dark:text-white tracking-tight">
                        {timeObj.timeOnly}
                      </span>
                      {use12HourFormat && timeObj.period && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                          timeObj.isPM 
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40' 
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40'
                        }`}>
                          {timeObj.period === 'ص' ? 'صباحاً' : 'مساءً'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Listen to Adhan action & Per-Prayer Alert Bell */}
                  {p.hasAdhan ? (
                    <div className="pt-2 border-t border-[#2D4536]/10 dark:border-[#2D4536]/40 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleOpenAdhanModal(p.label, p.key === 'fajr' ? 'fajr_makkah' : undefined)}
                        className="inline-flex items-center gap-1.5 text-[#1B3022] dark:text-[#E9B161] hover:underline font-semibold"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>استماع لأذان {p.label}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Per-Prayer Notification Bell */}
                        <button
                          onClick={() => handleTogglePrayerNotification(p.key)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            autoAdhanEnabled && isNotificationEnabled
                              ? 'text-[#E9B161] bg-[#E9B161]/10 hover:bg-[#E9B161]/20'
                              : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                          }`}
                          title={isNotificationEnabled ? `تنبيه أذان ${p.label} مفعّل` : `تنبيه أذان ${p.label} معطّل`}
                        >
                          {autoAdhanEnabled && isNotificationEnabled ? (
                            <Bell className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <BellOff className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <span className="text-[10px] text-[#7A8C80] dark:text-[#A8BCAD]">
                          {p.key === 'fajr' ? 'أذان الفجر' : 'الأذان الشرعي'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[#2D4536]/10 dark:border-[#2D4536]/40 flex items-center justify-between text-xs text-[#7A8C80] dark:text-[#A8BCAD]">
                      <span>{p.desc}</span>
                      <button
                        onClick={() => handleTogglePrayerNotification(p.key)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isNotificationEnabled
                            ? 'text-[#E9B161] bg-[#E9B161]/10 hover:bg-[#E9B161]/20'
                            : 'text-stone-400 hover:text-stone-600'
                        }`}
                        title={isNotificationEnabled ? `تنبيه وقت ${p.label} مفعّل` : `تنبيه وقت ${p.label} معطّل`}
                      >
                        {isNotificationEnabled ? <Bell className="w-3.5 h-3.5 fill-current" /> : <BellOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* VIEW 2: ADHAN VOICES & DUAS DIRECTORY */}
      {activeTab === 'adhan_guide' && (
        <div className="space-y-6">
          {/* Adhan Voice Selector Hero */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2D4536]/20 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#2C3E30] dark:text-white font-scheherazade">
                  أصوات الأذان وتلاوات النداء للصلاة
                </h3>
                <p className="text-xs text-[#55695C] dark:text-[#A8BCAD]">
                  استمع لأعذب أصوات الأذان من الحرم المكي والحرم المدني والمسجد الأقصى ومصر
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAutoAdhanModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-[#142419] hover:bg-stone-200 dark:hover:bg-[#233F2E] text-[#1B3022] dark:text-[#E9B161] font-bold text-xs flex items-center gap-1.5 border border-[#2D4536]/20 dark:border-[#3D5A47] transition-all cursor-pointer"
                >
                  <Settings2 className="w-4 h-4" />
                  <span>إعدادات الأذان والتنبيهات</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAdhanModal('الأذان')}
                  className="px-5 py-2.5 rounded-xl bg-[#1B3022] hover:bg-[#233F2E] text-[#E9B161] font-bold text-xs flex items-center gap-2 border border-[#3D5A47] transition-all shadow-md cursor-pointer"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>فتح مشغل الأذان الكامل</span>
                </button>
              </div>
            </div>

            {/* List of Voices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ADHAN_LIST.map((adh) => {
                const isCurrent = adh.id === selectedAdhanId;
                return (
                  <div
                    key={adh.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#E9B161]/10 border-[#E9B161] shadow-sm'
                        : 'bg-stone-50 dark:bg-[#142419]/60 border-[#2D4536]/20 dark:border-[#2D4536]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#2C3E30] dark:text-white">{adh.name}</h4>
                        {adh.isFajr && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                            الفجر
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD] block mt-0.5">
                        {adh.location} • {adh.country}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAdhanModal('الأذان', adh.id)}
                        className="px-3 py-2 rounded-xl bg-[#1B3022] text-[#E9B161] hover:bg-[#233F2E] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        title="استماع للأذان"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>استماع</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Post-Adhan Du'a Highlight */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1B3022] to-[#142419] border border-[#3D5A47] text-white shadow-lg space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9B161]/20 border border-[#E9B161]/40 text-[#E9B161] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>دعاء ما بعد سماع الأذان (مستحب)</span>
            </div>

            <p className="text-xl sm:text-2xl font-bold font-scheherazade text-white leading-relaxed">
              «اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ القَائِمَةِ، آتِ مُحَمَّداً الوَسِيلَةَ وَالفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ»
            </p>

            <p className="text-xs text-[#A8BCAD]">
              روى البخاري عن جابر بن عبد الله رضي الله عنه أن رسول الله ﷺ قال: «مَنْ قَالَ حِينَ يَسْمَعُ النِّدَاءَ ... حَلَّتْ لَهُ شَفَاعَتِي يَوْمَ القِيَامَةِ».
            </p>
          </div>
        </div>
      )}

      {/* VIEW 3: QIBLA COMPASS & ASTRONOMICAL ORIENTATION */}
      {activeTab === 'qibla' && (() => {
        const qiblaDeg = Math.round(qiblaBearing * 10) / 10;
        const heading = deviceHeading;
        
        let normalizedDiff = 0;
        let isAligned = false;
        if (heading !== null) {
          const angleDiff = (qiblaBearing - heading + 360) % 360;
          normalizedDiff = angleDiff > 180 ? angleDiff - 360 : angleDiff;
          isAligned = Math.abs(normalizedDiff) <= 4;
        }

        const handleGpsLocation = () => {
          if (!('geolocation' in navigator)) {
            setGpsNotification({ text: 'المتصفح لا يدعم تحديد الموقع الجغرافي.', type: 'error' });
            return;
          }
          setIsGpsLocating(true);
          setGpsNotification(null);

          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const geo = await reverseGeocodeLocation(lat, lng);
                const custom: CityOption = {
                  name: geo.cityName || 'موقعي الدقيق (GPS)',
                  country: geo.countryName || 'الموقع الجغرافي المباشر',
                  lat,
                  lng,
                  timezone: -new Date().getTimezoneOffset() / 60,
                  method: 5
                };
                handleCityChange(custom);
                setGpsNotification({
                  text: `تم تحديد موقعك بنجاح: ${custom.name} (${custom.country}) - إحداثيات: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
                  type: 'success'
                });
                if (navigator.vibrate) navigator.vibrate([70, 50, 70]);
              } catch (err) {
                console.error('Reverse geocode error:', err);
                const fallback: CityOption = {
                  name: 'موقعي الدقيق (GPS)',
                  country: 'الموقع الجغرافي المباشر',
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  timezone: -new Date().getTimezoneOffset() / 60,
                  method: 5
                };
                handleCityChange(fallback);
              } finally {
                setIsGpsLocating(false);
              }
            },
            (err) => {
              setIsGpsLocating(false);
              setGpsNotification({
                text: 'تعذر الوصول لنظام GPS، يرجى التأكد من تشغيل الموقع الجغرافي ومنح الإذن للمتصفح.',
                type: 'error'
              });
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
          );
        };

        return (
          <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-xl text-center space-y-6">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E9B161]/15 text-[#E9B161] border border-[#E9B161]/30 text-xs font-bold font-arabic">
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                <span>بوصلة القبلة الفلكية المباشرة</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-arabic text-[#2C3E30] dark:text-white">
                تحديد اتجاه القبلة نحو الكعبة المشرفة بمكة المكرمة
              </h3>
              <p className="text-xs text-[#55695C] dark:text-[#A8BCAD] max-w-lg mx-auto">
                حساب فلكي دقيق بالدرجات والجهات انطلاقاً من إحداثيات موقعك الجغرافي الفعلي
              </p>
            </div>

            {/* Location & GPS Bar */}
            <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-stone-50 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
                <div className="w-9 h-9 rounded-xl bg-[#E9B161]/15 border border-[#E9B161]/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#E9B161]" />
                </div>
                <div className="text-right flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#2C3E30] dark:text-white">{selectedCity.name}</span>
                    <span className="text-xs text-[#55695C] dark:text-[#A8BCAD]">({selectedCity.country})</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#55695C] dark:text-[#A8BCAD] block">
                    {selectedCity.lat.toFixed(4)}°N, {selectedCity.lng.toFixed(4)}°E
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCitySearchModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1B3022] hover:bg-[#E9B161]/20 border border-[#2D4536]/20 text-[#2C3E30] dark:text-[#E0E7E1] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="اختر مدينتك من القائمة"
                >
                  <Search className="w-3.5 h-3.5 text-[#E9B161]" />
                  <span>تغيير المدينة</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleGpsLocation}
                disabled={isGpsLocating}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#E9B161] hover:bg-[#d99f4c] text-[#142419] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isGpsLocating ? 'animate-spin' : ''}`} />
                <span>{isGpsLocating ? 'جاري تحديد GPS...' : 'تحديد موقعي الدقيق (GPS)'}</span>
              </button>
            </div>

            {/* Notification Banner if GPS was updated */}
            {gpsNotification && (
              <div className={`p-3 rounded-2xl max-w-xl mx-auto text-xs font-bold flex items-center justify-between gap-2 ${
                gpsNotification.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}>
                <div className="flex items-center gap-2 text-right">
                  {gpsNotification.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span>{gpsNotification.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGpsNotification(null)}
                  className="p-1 hover:opacity-75 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Qibla Direction & Distance Stats */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1B3022]/10 via-[#E9B161]/10 to-[#1B3022]/10 dark:from-[#142419] dark:via-[#1B3022] dark:to-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] max-w-xl mx-auto space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center items-center">
                <div className="p-2">
                  <span className="text-[#55695C] dark:text-[#A8BCAD] block text-[11px]">زاوية القبلة الدقيقة:</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{qiblaDeg}°</span>
                  <span className="text-[10px] text-[#55695C] dark:text-[#A8BCAD] block">من الشمال الجغرافي</span>
                </div>
                <div className="p-2 border-x border-[#2D4536]/20 dark:border-[#2D4536]">
                  <span className="text-[#55695C] dark:text-[#A8BCAD] block text-[11px]">الاتجاه الجغرافي:</span>
                  <span className="font-bold text-sm sm:text-base text-[#2C3E30] dark:text-white block">{cardinalInfo.name}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">مكة المكرمة</span>
                </div>
                <div className="p-2">
                  <span className="text-[#55695C] dark:text-[#A8BCAD] block text-[11px]">المسافة للكعبة:</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#1B3022] dark:text-[#E9B161]">{distanceKaaba.toLocaleString('ar-EG')}</span>
                  <span className="text-[10px] text-[#55695C] dark:text-[#A8BCAD] mr-1">كم</span>
                </div>
              </div>
            </div>

            {/* Dedicated High-Precision Interactive Compass View */}
            <div className="space-y-6">
              {/* Phone Level / Tilt Status (ميزان الاستواء الأفقي للدقة القصوى) */}
              <div className={`max-w-xl mx-auto p-3 rounded-2xl border transition-all text-xs font-bold flex items-center justify-between gap-3 ${
                phoneTilt.isFlat
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-[#E9B161] animate-pulse'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${phoneTilt.isFlat ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500'}`} />
                  <span>
                    {phoneTilt.isFlat 
                      ? '🟢 الهاتف في وضع أفقي مستوٍ تماماً (دقة قصوى للحساس)' 
                      : '⚠️ يرجى حمل الهاتف أفقياً ومسطحاً في راحة اليد لأعلى دقة'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] bg-black/10 dark:bg-black/30 px-2 py-0.5 rounded-lg shrink-0">
                  <span>الميل:</span>
                  <span>{Math.max(Math.abs(phoneTilt.pitch), Math.abs(phoneTilt.roll))}°</span>
                </div>
              </div>

              {/* Mode Switcher: Auto Sensor vs Manual Facing Mode */}
              <div className="flex items-center justify-center p-1 rounded-2xl bg-stone-100 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#3D5A47] max-w-md mx-auto gap-1">
                <button
                  type="button"
                  onClick={() => setCompassInputMode('auto')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    compassInputMode === 'auto'
                      ? 'bg-[#1B3022] dark:bg-[#E9B161] text-[#E9B161] dark:text-[#142419] shadow-sm'
                      : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>حساس الهاتف التلقائي (حي ومباشر)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompassInputMode('manual')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    compassInputMode === 'manual'
                      ? 'bg-[#1B3022] dark:bg-[#E9B161] text-[#E9B161] dark:text-[#142419] shadow-sm'
                      : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
                  <span>توجيه يدوي / اختياري</span>
                </button>
              </div>

              {/* Location & Great Circle Haversine Info Bar */}
              <div className="max-w-xl mx-auto p-3.5 rounded-3xl bg-emerald-50/80 dark:bg-[#142419] border border-emerald-500/30 text-right flex flex-wrap items-center justify-between gap-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
                      {selectedCity.name} ({selectedCity.lat.toFixed(4)}°, {selectedCity.lng.toFixed(4)}°)
                    </span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      المسار المباشر للكعبة المشرفة: <strong className="text-emerald-700 dark:text-emerald-300 font-mono">{distanceKaaba.toLocaleString('ar-EG')} كم</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 font-mono font-extrabold text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-xl border border-emerald-500/30">
                    <span>زاوية القبلة: {qiblaDeg}°</span>
                  </div>
                </div>
              </div>

              {/* Qibla Angle Standard Selector (Egypt 137° vs Astronomical vs Custom) */}
              <div className="max-w-xl mx-auto p-4 rounded-3xl bg-stone-50 dark:bg-[#142419] border border-emerald-600/30 text-right space-y-3 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-xs sm:text-sm text-[#2C3E30] dark:text-white font-arabic">
                      مرجع زاوية القبلة المعتمد:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                    <span>الزاوية الحالية:</span>
                    <span>{qiblaDeg}°</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* 1. Egypt General Survey Standard: 137° */}
                  <button
                    type="button"
                    onClick={() => handleSetQiblaMode('survey_egypt_137')}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-1 ${
                      qiblaAngleMode === 'survey_egypt_137'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/50'
                        : 'bg-white dark:bg-[#1B3022] hover:bg-emerald-50 dark:hover:bg-[#233A2C] border-stone-200 dark:border-[#2D4536] text-[#2C3E30] dark:text-[#E0E7E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">🇪🇬 معيار مصر (137°)</span>
                      {qiblaAngleMode === 'survey_egypt_137' && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                    <span className={`text-[10px] ${qiblaAngleMode === 'survey_egypt_137' ? 'text-emerald-100' : 'text-[#55695C] dark:text-[#A8BCAD]'}`}>
                      الهيئة المصرية العامة للمساحة ودار الإفتاء
                    </span>
                  </button>

                  {/* 2. Astronomical Spherical Calculation */}
                  <button
                    type="button"
                    onClick={() => handleSetQiblaMode('auto_calculated')}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-1 ${
                      qiblaAngleMode === 'auto_calculated'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/50'
                        : 'bg-white dark:bg-[#1B3022] hover:bg-emerald-50 dark:hover:bg-[#233A2C] border-stone-200 dark:border-[#2D4536] text-[#2C3E30] dark:text-[#E0E7E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">🌐 الحساب الفلكي ({Math.round(calculatedBearing)}°)</span>
                      {qiblaAngleMode === 'auto_calculated' && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                    <span className={`text-[10px] ${qiblaAngleMode === 'auto_calculated' ? 'text-emerald-100' : 'text-[#55695C] dark:text-[#A8BCAD]'}`}>
                      حساب الدائرة العظمى لإحداثيات {selectedCity.name}
                    </span>
                  </button>

                  {/* 3. Custom Angle */}
                  <button
                    type="button"
                    onClick={() => handleSetQiblaMode('custom')}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col gap-1 ${
                      qiblaAngleMode === 'custom'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/50'
                        : 'bg-white dark:bg-[#1B3022] hover:bg-emerald-50 dark:hover:bg-[#233A2C] border-stone-200 dark:border-[#2D4536] text-[#2C3E30] dark:text-[#E0E7E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">⚙️ زاوية مخصصة</span>
                      {qiblaAngleMode === 'custom' && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                    <span className={`text-[10px] ${qiblaAngleMode === 'custom' ? 'text-emerald-100' : 'text-[#55695C] dark:text-[#A8BCAD]'}`}>
                      تحديد زاوية بالدرجات حسب رغبتك
                    </span>
                  </button>
                </div>

                {/* Custom Angle Slider if Custom mode selected */}
                {qiblaAngleMode === 'custom' && (
                  <div className="p-3 rounded-2xl bg-stone-100 dark:bg-[#1B3022] border border-[#2D4536]/20 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2C3E30] dark:text-white">
                      <span>اختر زاوية القبلة المخصصة:</span>
                      <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#142419] px-2 py-0.5 rounded-lg border border-emerald-500/30">
                        {customAngleValue}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      value={customAngleValue}
                      onChange={(e) => handleSetQiblaMode('custom', Number(e.target.value))}
                      className="w-full h-2 bg-stone-300 dark:bg-[#142419] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-[#55695C] dark:text-[#A8BCAD]">
                      <button type="button" onClick={() => handleSetQiblaMode('custom', 137)} className="underline hover:text-emerald-500">مصر (137°)</button>
                      <button type="button" onClick={() => handleSetQiblaMode('custom', 136)} className="underline hover:text-emerald-500">القاهرة (136°)</button>
                      <button type="button" onClick={() => handleSetQiblaMode('custom', 138)} className="underline hover:text-emerald-500">الدلتا (138°)</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Alignment Guidance Banner & Status */}
              {(() => {
                const activeHeading = compassInputMode === 'auto' ? deviceHeading : manualFacingAngle;
                const isSensorActive = compassInputMode === 'auto' ? deviceHeading !== null : true;
                const normalizedDiff = isSensorActive && activeHeading !== null ? ((qiblaBearing - activeHeading + 540) % 360) - 180 : null;
                const isAligned = normalizedDiff !== null && Math.abs(normalizedDiff) <= 4;

                if (activeHeading !== null) {
                  return (
                    <div className="text-center py-2 min-h-[44px] flex items-center justify-center">
                      {isAligned ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 text-white font-bold text-base sm:text-lg animate-pulse shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-400/40">
                          <CheckCircle className="w-6 h-6 shrink-0 text-white" />
                          <span>✨ مقدمة هاتفك تشير إلى اتجاه القبلة مباشرة ({qiblaDeg}°) 🕋</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-[#E9B161] font-bold text-sm sm:text-base">
                          <Compass className="w-5 h-5 shrink-0 animate-spin-slow" />
                          <span>
                            {normalizedDiff !== null && normalizedDiff > 0 ? (
                              <>أدر مقدمة الهاتف إلى اليمين بمقدار <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-lg">{Math.round(normalizedDiff)}°</strong> ↻</>
                            ) : (
                              <>↺ أدر مقدمة الهاتف إلى اليسار بمقدار <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-lg">{Math.round(Math.abs(normalizedDiff || 0))}°</strong></>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>لتفعيل دوران البوصلة الحية مع حركة هاتفك:</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestCompassPermission}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shrink-0 cursor-pointer shadow-md transition-transform active:scale-95"
                    >
                      تشغيل بوصلة الهاتف
                    </button>
                  </div>
                );
              })()}

              {/* THE HIGH PRECISION COMPASS VISUAL DIAL */}
              {(() => {
                const activeHeading = compassInputMode === 'auto' ? (deviceHeading ?? 0) : manualFacingAngle;
                const isSensorActive = compassInputMode === 'auto' ? deviceHeading !== null : true;
                const normalizedDiff = isSensorActive ? ((qiblaBearing - activeHeading + 540) % 360) - 180 : null;
                const isAligned = normalizedDiff !== null && Math.abs(normalizedDiff) <= 4;
                const needleAngle = (qiblaBearing - activeHeading + 360) % 360;

                // Bubble level offset calculations (clamped inside center hub)
                const bubbleX = Math.max(-12, Math.min(12, phoneTilt.roll * 0.7));
                const bubbleY = Math.max(-12, Math.min(12, phoneTilt.pitch * 0.7));

                return (
                  <div className="space-y-6">
                    {/* Phone Top / Front Aiming Indicator Banner */}
                    <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto text-center">
                      <div className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all ${
                        isAligned 
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-400/30 animate-pulse'
                          : 'bg-[#1B3022] text-[#E9B161] border-[#2D4536]'
                      }`}>
                        <div className="flex items-center gap-2">
                          <ArrowUp className={`w-5 h-5 shrink-0 ${isAligned ? 'animate-bounce text-white' : 'text-[#E9B161]'}`} />
                          <span className="text-xs sm:text-sm font-bold">
                            {isAligned ? '✨ مقدمة هاتفك متجهة للقبلة المشرفة تماماً!' : 'مقدمة الهاتف (الأعلى ⬆️) هي التي توجّهها للقبلة'}
                          </span>
                        </div>
                        <div className="font-mono text-xs px-2 py-0.5 rounded-lg bg-black/20 text-white font-bold">
                          {activeHeading}°
                        </div>
                      </div>
                      
                      {/* Live Comparison Bar */}
                      <div className="flex items-center justify-center gap-4 text-[11px] text-[#55695C] dark:text-[#A8BCAD] font-medium">
                        <span>📱 مقدمة الهاتف: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{activeHeading}°</strong></span>
                        <span>•</span>
                        <span>🕋 القبلة المطلوبة: <strong className="font-mono text-[#E9B161]">{qiblaDeg}°</strong></span>
                      </div>
                    </div>

                    <div className="relative w-80 h-80 sm:w-92 sm:h-92 mx-auto flex items-center justify-center select-none pt-4">
                      
                      {/* Phone Front / Aiming Chevron at 12 o'clock (Top of phone) */}
                      <div className="absolute -top-1 z-30 flex flex-col items-center pointer-events-none">
                        <div className={`relative flex items-center justify-center px-3.5 py-1.5 rounded-full shadow-2xl transition-all ${
                          isAligned 
                            ? 'scale-115 ring-4 ring-emerald-400 bg-emerald-500 text-white' 
                            : 'bg-[#1B3022] border-2 border-emerald-400 text-emerald-300'
                        }`}>
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <ArrowUp className="w-4 h-4 animate-pulse text-emerald-300" />
                            <span>مقدمة الهاتف ⬆️</span>
                          </div>
                        </div>
                        {/* Teardrop indicator pointing into compass center */}
                        <div className={`w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[12px] transition-colors ${
                          isAligned ? 'border-t-emerald-500' : 'border-t-emerald-400'
                        }`} />
                      </div>

                      {/* Outer Housing Ring & Circular Card */}
                      <div className={`w-full h-full rounded-full border-4 flex items-center justify-center p-4 relative shadow-xl transition-all duration-300 ${
                        isAligned 
                          ? 'border-emerald-500 shadow-emerald-500/20 bg-emerald-50/40 dark:bg-[#142419]' 
                          : 'border-emerald-200 dark:border-[#2D4536] bg-stone-50/80 dark:bg-[#142419]'
                      }`}>
                        
                        {/* Rotating Compass Dial Face (Ticks & Cardinal Directions) */}
                        <div
                          className="w-full h-full rounded-full bg-white dark:bg-[#0E1A12] border-2 border-emerald-100 dark:border-[#2D4536] shadow-inner relative flex items-center justify-center transition-transform duration-200 ease-out overflow-hidden"
                          style={{
                            transform: `rotate(${-activeHeading}deg)`
                          }}
                        >
                          {/* 72 Precision perimeter tick marks (Every 5 degrees) */}
                          {Array.from({ length: 72 }).map((_, i) => {
                            const deg = i * 5;
                            const isMajor = deg % 90 === 0;
                            const isSemi = deg % 30 === 0;
                            const isTen = deg % 10 === 0;
                            return (
                              <div
                                key={i}
                                className="absolute inset-0 flex items-start justify-center pointer-events-none"
                                style={{ transform: `rotate(${deg}deg)` }}
                              >
                                <div
                                  className={`rounded-full transition-colors ${
                                    isMajor
                                      ? 'w-1.5 h-3.5 bg-emerald-600 dark:bg-emerald-400 mt-2'
                                      : isSemi
                                      ? 'w-1 h-3 bg-emerald-500/80 dark:bg-emerald-500 mt-2.5'
                                      : isTen
                                      ? 'w-0.5 h-2 bg-emerald-400/60 dark:bg-emerald-700 mt-3'
                                      : 'w-0.5 h-1 bg-stone-300 dark:bg-[#233A2C] mt-3.5'
                                  }`}
                                />
                              </div>
                            );
                          })}

                          {/* Degree numbers every 30 degrees */}
                          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                            <div
                              key={`num-${deg}`}
                              className="absolute inset-0 flex items-start justify-center pointer-events-none"
                              style={{ transform: `rotate(${deg}deg)` }}
                            >
                              <span 
                                className={`mt-5 font-mono text-[9px] font-bold ${
                                  deg === 0 ? 'text-rose-500 font-extrabold' : deg === 90 || deg === 180 || deg === 270 ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-stone-400 dark:text-stone-500'
                                }`}
                                style={{ transform: `rotate(${-deg}deg)` }}
                              >
                                {deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : deg === 270 ? 'W' : `${deg}°`}
                              </span>
                            </div>
                          ))}

                          {/* Red Pointer pointing towards North (0° on the Earth dial) */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="absolute top-13 flex flex-col items-center">
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[22px] border-b-rose-500 drop-shadow-md" />
                              <span className="text-[8px] font-black text-rose-500 mt-0.5">الشمال N</span>
                            </div>
                          </div>

                          {/* Fixed Qibla & Kaaba Marker permanently on the Earth Dial at South-East (137°) */}
                          <div 
                            className="absolute inset-0 flex items-start justify-center pointer-events-none z-10"
                            style={{ transform: `rotate(${qiblaDeg}deg)` }}
                          >
                            <div className="flex flex-col items-center mt-2.5">
                              {/* Glowing Kaaba Badge on the Dial at South-East */}
                              <div className="px-2 py-1 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1 border-2 border-emerald-300">
                                <span>🕋</span>
                                <span className="font-arabic font-extrabold text-[9px]">القبلة {qiblaDeg}° (الجنوب الشرقي)</span>
                              </div>
                              {/* Directional beam pointing inward */}
                              <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 via-emerald-400 to-transparent mt-0.5" />
                            </div>
                          </div>

                          {/* Sun Position Indicator on Dial for 100% Real-World Ground Truth Verification */}
                          {liveSunData.isDaytime && (
                            <div
                              className="absolute inset-0 flex items-start justify-center pointer-events-none z-10"
                              style={{ transform: `rotate(${liveSunData.azimuth}deg)` }}
                            >
                              <div className="flex flex-col items-center mt-2" title={`موقع الشمس الفلكي الآن: ${Math.round(liveSunData.azimuth)}°`}>
                                <div className="px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[9px] font-bold shadow-sm flex items-center gap-0.5 border border-amber-200">
                                  <span>☀️</span>
                                  <span className="font-mono text-[8px]">{Math.round(liveSunData.azimuth)}°</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Golden & Emerald Pointer Needle pointing towards Holy Kaaba (relative to device heading) */}
                        <div 
                          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-200 ease-out z-20"
                          style={{ transform: `rotate(${needleAngle}deg)` }}
                        >
                          {/* Upper Pointer Arrow Needle with Kaaba Emblem */}
                          <div className="absolute top-7 flex flex-col items-center">
                            {/* Kaaba Badge at tip of arrow */}
                            <div className={`w-9 h-9 rounded-full shadow-lg flex items-center justify-center p-1.5 transition-all mb-1 ${
                              isAligned ? 'bg-emerald-500 ring-4 ring-emerald-300 scale-110' : 'bg-[#1B3022] border-2 border-emerald-400'
                            }`}>
                              <img src="/icon.svg" alt="الكعبة" className="w-6 h-6 object-contain" />
                            </div>

                            {/* Sharp Needle Tip */}
                            <div className={`w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[64px] transition-colors drop-shadow-lg ${
                              isAligned ? 'border-b-emerald-400' : 'border-b-emerald-600'
                            }`} />
                          </div>

                          {/* Center Pivot Hub with Built-In Bubble Level */}
                          <div className={`w-10 h-10 rounded-full border-2 shadow-md z-30 transition-colors flex items-center justify-center relative overflow-hidden ${
                            isAligned ? 'bg-emerald-600 border-emerald-300' : 'bg-[#1B3022] border-white/80'
                          }`}>
                            {/* Level target crosshair in hub */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-3 h-3 rounded-full border border-white/30" />
                            </div>
                            {/* Floating level bubble indicator */}
                            <div 
                              className={`w-3 h-3 rounded-full transition-transform duration-100 ${
                                phoneTilt.isFlat ? 'bg-emerald-300 shadow-sm shadow-emerald-400' : 'bg-[#E9B161]'
                              }`}
                              style={{
                                transform: `translate(${bubbleX}px, ${bubbleY}px)`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ground-Truth Geographic Cardinal Explanation Card */}
                    <div className="max-w-xl mx-auto p-4 rounded-3xl bg-emerald-50/70 dark:bg-[#142419] border-2 border-emerald-500/30 text-right space-y-2.5">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm font-arabic">
                        <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>خريطة اتجاه القبلة الجغرافية في مصر ({selectedCity.name}):</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium text-[#2C3E30] dark:text-[#D1E0D5]">
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-[#1B3022] border border-emerald-100 dark:border-[#2D4536] flex flex-col items-center text-center">
                          <span className="text-rose-500 font-bold">الشمال (N)</span>
                          <span className="font-mono text-xs text-stone-500">0° / 360°</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-[#1B3022] border border-emerald-100 dark:border-[#2D4536] flex flex-col items-center text-center">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">الشرق (E)</span>
                          <span className="font-mono text-xs text-stone-500">90°</span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm flex flex-col items-center text-center ring-2 ring-emerald-400/50">
                          <span className="font-extrabold flex items-center gap-0.5">🕋 القبلة (SE)</span>
                          <span className="font-mono text-xs font-bold text-emerald-100">{qiblaDeg}° (الجنوب الشرقي)</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-[#1B3022] border border-emerald-100 dark:border-[#2D4536] flex flex-col items-center text-center">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">الجنوب (S)</span>
                          <span className="font-mono text-xs text-stone-500">180°</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed font-arabic pt-1">
                        💡 <strong>طريقة التوجيه:</strong> القبلة في مصر تقع دائماً في جهة <strong>الجنوب الشرقي ({qiblaDeg}°)</strong> بالنسبة للأرض. أدر هاتفك حتى تتطابق <strong>مقدمة الهاتف (الأعلى ⬆️)</strong> مع علامة الكعبة الخضراء على القرص.
                      </p>
                    </div>

                    {/* Official Great-Circle & Haversine Method Specification Box (مطابقة طبق الأصل للصورة المعتمدة) */}
                    <div className="max-w-xl mx-auto p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-[#142419] border-2 border-emerald-500/30 text-right space-y-3 shadow-md">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm sm:text-base font-arabic">
                        <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span>طريقة تحديد اتجاه القبلة</span>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 leading-relaxed font-arabic">
                        نستخدم موقع الكعبة (<strong className="font-mono text-emerald-700 dark:text-emerald-400">خط عرض 21.4224779</strong> و<strong className="font-mono text-emerald-700 dark:text-emerald-400">خط طول 39.8251832</strong>) وموقعك الحالي (المزوّد بواسطة نظام تحديد المواقع العالمي أو الذي تزوّدنا به بنفسك) لتحديد <strong>المسار المباشر الأقصر بين نقطتين على الكرة الأرضية، والمعروف أيضاً باسم مسافة الدائرة الكبرى</strong>. ويتم تحديد هذا المسار باستخدام <strong>معادلة هافيرسين</strong>، وعند النظر إليه على خريطة مسطحة، قد يظهر على شكل خط مائل أحياناً بسبب تقوّس الأرض.
                      </p>

                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                        <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          <span>🧭</span>
                          <span>التأكد من دقة الاتجاه:</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                          يستخدم "اتجاه القبلة" البوصلة في جهازك. وللتأكد من دقة الاتجاه الذي يشير إليه الموقع، ننصحك <strong>بمعايرة بوصلة جهازك</strong> قبل استخدام "اتجاه القبلة" بتحريكه في الهواء على شكل <strong>(∞) أو رقم 8</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Qibla Angle from North */}
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                        اتجاه القبلة من الشمال
                      </p>
                      <p className="text-4xl sm:text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                        {qiblaDeg}°
                      </p>
                    </div>

                    {/* Manual Controls (Sliders & Facing Presets) */}
                    {compassInputMode === 'manual' && (
                      <div className="max-w-xl mx-auto p-4 rounded-2xl bg-[#142419] border border-[#2D4536] text-white space-y-4 text-right">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#E9B161]">
                            <Sliders className="w-4 h-4" />
                            <span>حدد اتجاه نظرك الحالي (أين يقف وجهك الآن؟):</span>
                          </div>
                          <span className="font-mono font-bold text-sm text-[#E9B161] bg-[#1B3022] px-2.5 py-1 rounded-lg border border-[#2D4536]">
                            {manualFacingAngle}°
                          </span>
                        </div>

                        {/* Facing Presets */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setManualFacingAngle(qiblaDeg)}
                            className={`p-2 rounded-xl border font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                              manualFacingAngle === qiblaDeg ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/50' : 'bg-[#1B3022] hover:bg-[#2D4536] border-[#2D4536] text-emerald-400'
                            }`}
                          >
                            <span>🕋 القبلة ({qiblaDeg}°)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualFacingAngle(0)}
                            className={`p-2 rounded-xl border font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                              manualFacingAngle === 0 ? 'bg-[#E9B161] text-[#142419] border-[#E9B161]' : 'bg-[#1B3022] hover:bg-[#2D4536] border-[#2D4536]'
                            }`}
                          >
                            <span>⬆️ للشمال (0°)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualFacingAngle(45)}
                            className={`p-2 rounded-xl border font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                              manualFacingAngle === 45 ? 'bg-[#E9B161] text-[#142419] border-[#E9B161]' : 'bg-[#1B3022] hover:bg-[#2D4536] border-[#2D4536]'
                            }`}
                          >
                            <span>↗️ شمال شرق (45°)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualFacingAngle(90)}
                            className={`p-2 rounded-xl border font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                              manualFacingAngle === 90 ? 'bg-[#E9B161] text-[#142419] border-[#E9B161]' : 'bg-[#1B3022] hover:bg-[#2D4536] border-[#2D4536]'
                            }`}
                          >
                            <span>➡️ للشرق (90°)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualFacingAngle(180)}
                            className={`p-2 rounded-xl border font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                              manualFacingAngle === 180 ? 'bg-[#E9B161] text-[#142419] border-[#E9B161]' : 'bg-[#1B3022] hover:bg-[#2D4536] border-[#2D4536]'
                            }`}
                          >
                            <span>⬇️ للجنوب (180°)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualFacingAngle(270)}
                            className={`p-2 rounded-xl border font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                              manualFacingAngle === 270 ? 'bg-[#E9B161] text-[#142419] border-[#E9B161]' : 'bg-[#1B3022] hover:bg-[#2D4536] border-[#2D4536]'
                            }`}
                          >
                            <span>⬅️ للغرب (270°)</span>
                          </button>
                        </div>

                        {/* Smooth Range Slider */}
                        <div className="space-y-1">
                          <input
                            type="range"
                            min="0"
                            max="359"
                            value={manualFacingAngle}
                            onChange={(e) => setManualFacingAngle(Number(e.target.value))}
                            className="w-full h-2 bg-[#1B3022] rounded-lg appearance-none cursor-pointer accent-[#E9B161]"
                          />
                          <div className="flex justify-between text-[10px] text-[#A8BCAD] font-mono">
                            <span>0° (شمال)</span>
                            <span>90° (شرق)</span>
                            <span>180° (جنوب)</span>
                            <span>270° (غرب)</span>
                            <span>360°</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Auto Mode Sensor Status & Micro-Calibration */}
                    {compassInputMode === 'auto' && (
                      <div className="max-w-xl mx-auto space-y-3 text-xs">
                        {/* Advanced Live Calibration Card */}
                        <div className="p-4 rounded-2xl bg-[#1B3022]/10 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] space-y-3.5 text-right">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-[#2C3E30] dark:text-white font-bold">
                              <Sliders className="w-4 h-4 text-[#E9B161]" />
                              <span>معايرة دقيقة لمطابقة محراب مسجدك:</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-[#55695C] dark:text-[#A8BCAD]">المعايرة:</span>
                              <span className="font-mono font-bold text-sm px-2 py-0.5 rounded-lg bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                {manualHeadingOffset > 0 ? `+${manualHeadingOffset}° (يمين)` : manualHeadingOffset < 0 ? `${manualHeadingOffset}° (يسار)` : '0° (الأصلية)'}
                              </span>
                            </div>
                          </div>

                          {/* Quick One-Tap Nudge Buttons */}
                          <div>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-center">
                              <button
                                type="button"
                                onClick={() => updateHeadingOffset((prev) => prev - 5)}
                                className="py-2 px-1 rounded-xl bg-stone-100 dark:bg-[#1B3022] hover:bg-emerald-600 hover:text-white text-[#2C3E30] dark:text-emerald-300 font-bold text-xs border border-[#2D4536]/20 transition-all cursor-pointer shadow-sm active:scale-95 flex flex-col items-center justify-center gap-0.5"
                                title="إمالة 5 درجات لليسار"
                              >
                                <span>-5°</span>
                                <span className="text-[9px] opacity-80">يسار</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateHeadingOffset((prev) => prev - 1)}
                                className="py-2 px-1 rounded-xl bg-stone-100 dark:bg-[#1B3022] hover:bg-emerald-600 hover:text-white text-[#2C3E30] dark:text-emerald-300 font-bold text-xs border border-[#2D4536]/20 transition-all cursor-pointer shadow-sm active:scale-95 flex flex-col items-center justify-center gap-0.5"
                                title="إمالة درجة واحدة لليسار"
                              >
                                <span>-1°</span>
                                <span className="text-[9px] opacity-80">يسار</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateHeadingOffset(0)}
                                className="py-2 px-1 rounded-xl bg-stone-200 dark:bg-[#233A2C] hover:bg-[#E9B161] hover:text-[#142419] text-[#2C3E30] dark:text-white font-bold text-xs border border-[#2D4536]/40 transition-all cursor-pointer shadow-sm active:scale-95 flex flex-col items-center justify-center gap-0.5"
                                title="إعادة ضبط القبلة على الوضع الافتراضي"
                              >
                                <span>🔄 0°</span>
                                <span className="text-[9px] opacity-80">تصفير</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateHeadingOffset((prev) => (prev + 180) % 360 > 180 ? ((prev + 180) % 360) - 360 : (prev + 180) % 360)}
                                className="py-2 px-1 rounded-xl bg-amber-500/20 hover:bg-amber-600 hover:text-white text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-500/30 transition-all cursor-pointer shadow-sm active:scale-95 flex flex-col items-center justify-center gap-0.5"
                                title="قلب اتجاه البوصلة 180 درجة"
                              >
                                <span>🔁 180°</span>
                                <span className="text-[9px] opacity-80">قلب</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateHeadingOffset((prev) => prev + 1)}
                                className="py-2 px-1 rounded-xl bg-stone-100 dark:bg-[#1B3022] hover:bg-emerald-600 hover:text-white text-[#2C3E30] dark:text-emerald-300 font-bold text-xs border border-[#2D4536]/20 transition-all cursor-pointer shadow-sm active:scale-95 flex flex-col items-center justify-center gap-0.5"
                                title="إمالة درجة واحدة لليمين"
                              >
                                <span>+1°</span>
                                <span className="text-[9px] opacity-80">يمين</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateHeadingOffset((prev) => prev + 2)}
                                className="py-2 px-1 rounded-xl bg-stone-100 dark:bg-[#1B3022] hover:bg-emerald-600 hover:text-white text-[#2C3E30] dark:text-emerald-300 font-bold text-xs border border-[#2D4536]/20 transition-all cursor-pointer shadow-sm active:scale-95 flex flex-col items-center justify-center gap-0.5"
                                title="إمالة درجتين لليمين"
                              >
                                <span>+2°</span>
                                <span className="text-[9px] opacity-80">يمين</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateHeadingOffset((prev) => prev + 5)}
                                className="py-2 px-1 rounded-xl bg-stone-100 dark:bg-[#1B3022] hover:bg-emerald-600 hover:text-white text-[#2C3E30] dark:text-emerald-300 font-bold text-xs border border-[#2D4536]/20 transition-all cursor-pointer shadow-sm active:scale-95 flex flex-col items-center justify-center gap-0.5"
                                title="إمالة 5 درجات لليمين"
                              >
                                <span>+5°</span>
                                <span className="text-[9px] opacity-80">يمين</span>
                              </button>
                            </div>
                          </div>

                          {/* Slider for smooth calibration */}
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[10px] text-[#55695C] dark:text-[#A8BCAD] font-mono">
                              <span>⬅️ -180° (يسار)</span>
                              <span className="font-bold text-[#E9B161]">معايرة دقيقة بالسلايدر</span>
                              <span>+180° (يمين) ➡️</span>
                            </div>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              step="1"
                              value={manualHeadingOffset}
                              onChange={(e) => updateHeadingOffset(Number(e.target.value))}
                              className="w-full h-2 bg-stone-200 dark:bg-[#1B3022] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>
                        </div>

                        {/* Calibration Tips */}
                        <div className="p-4 rounded-2xl bg-[#1B3022]/5 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] text-[#55695C] dark:text-[#A8BCAD] text-right space-y-2 leading-relaxed">
                          <div className="flex items-center gap-2 text-[#E9B161] font-bold">
                            <Sparkles className="w-4 h-4 shrink-0" />
                            <span>إرشادات لأعلى دقة بوصلة بهاتفك:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-1 pr-1 text-[11px]">
                            <li>احمل الهاتف <strong>أفقياً بشكل مسطح</strong> على راحة يدك مثل البوصلة الحقيقية وتأكد من أن ميزان الاستواء باللون الأخضر.</li>
                            <li>ابتعد عن الأجسام المعدنية والمغناطيسية والأسلاك الكهربائية التي قد تشوش على حساس البوصلة.</li>
                            <li>حرّك هاتفك في الهواء على شكل <strong>رقم 8 بالإنجليزي (∞)</strong> لمعايرة حساس الهاتف.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Google Maps Route Verification */}
                    <div className="max-w-xl mx-auto pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#55695C] dark:text-[#A8BCAD]">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#E9B161]" />
                        <span>الكعبة: 21.4225°N, 39.8262°E</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          window.open(`https://www.google.com/maps/dir/${selectedCity.lat},${selectedCity.lng}/21.4225,39.8262`, '_blank');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-[#1B3022] hover:bg-[#E9B161] hover:text-[#142419] text-[#2C3E30] dark:text-[#E9B161] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-[#2D4536]/20 dark:border-[#3D5A47]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>عرض مسار القبلة المباشر على خرائط Google</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        );
      })()}

      {/* Global City Search & Selection Modal */}
      {isCitySearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg rounded-3xl bg-[#1B3022] border border-[#3D5A47] p-6 text-white shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2D4536] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#E9B161]" />
                <h3 className="font-bold text-base text-white font-arabic">اختيار مدينتك لتحديد القبلة والمواقيت</h3>
              </div>
              <button
                onClick={() => setIsCitySearchModalOpen(false)}
                className="p-1 text-[#A8BCAD] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative shrink-0">
              <input
                type="text"
                value={citySearchText}
                onChange={(e) => setCitySearchText(e.target.value)}
                placeholder="ابحث باسم المحافظة أو المدينة أو الدولة..."
                autoFocus
                className="w-full bg-[#142419] text-[#E0E7E1] placeholder-[#55695C] text-xs font-bold rounded-2xl px-4 py-3 border border-[#3D5A47] focus:outline-none focus:border-[#E9B161] pr-10"
              />
              <Search className="w-4 h-4 text-[#E9B161] absolute right-3.5 top-3.5" />
            </div>

            {/* City List with live filter */}
            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 custom-scrollbar">
              {CITIES.filter((c) => {
                if (!citySearchText.trim()) return true;
                const query = citySearchText.toLowerCase().trim();
                return c.name.toLowerCase().includes(query) || c.country.toLowerCase().includes(query);
              }).map((c) => {
                const isCurrent = c.name === selectedCity.name;
                const bearing = calculateQiblaBearing(c.lat, c.lng);
                const distance = calculateDistanceToKaabaKm(c.lat, c.lng);
                return (
                  <button
                    key={`${c.name}-${c.country}`}
                    onClick={() => {
                      handleCityChange(c);
                      setIsCitySearchModalOpen(false);
                      setCitySearchText('');
                    }}
                    className={`w-full p-3 rounded-2xl text-right transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                      isCurrent
                        ? 'bg-[#E9B161] text-[#142419] border-[#E9B161] font-bold shadow-md'
                        : 'bg-[#142419]/70 hover:bg-[#142419] border-[#2D4536] text-[#E0E7E1] hover:border-[#E9B161]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs">{c.name}</span>
                        <span className={`text-[10px] ${isCurrent ? 'text-[#142419]/80' : 'text-[#A8BCAD]'}`}>({c.country})</span>
                      </div>
                      <span className={`font-mono text-[10px] block mt-0.5 ${isCurrent ? 'text-[#142419]/75' : 'text-[#55695C]'}`}>
                        {c.lat.toFixed(2)}°N, {c.lng.toFixed(2)}°E
                      </span>
                    </div>

                    <div className="text-left font-mono text-[11px] shrink-0">
                      <div className="font-bold">{Math.round(bearing)}° قبلة</div>
                      <div className={`text-[10px] ${isCurrent ? 'text-[#142419]/80' : 'text-[#A8BCAD]'}`}>{distance.toLocaleString('ar-EG')} كم</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* GPS shortcut inside Modal */}
            <div className="pt-2 border-t border-[#2D4536] shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsCitySearchModalOpen(false);
                  if ('geolocation' in navigator) {
                    setIsGpsLocating(true);
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        const geo = await reverseGeocodeLocation(lat, lng);
                        handleCityChange({
                          name: geo.cityName || 'موقعي الدقيق (GPS)',
                          country: geo.countryName || 'الموقع الجغرافي المباشر',
                          lat,
                          lng,
                          timezone: -new Date().getTimezoneOffset() / 60,
                          method: 5
                        });
                        setIsGpsLocating(false);
                      },
                      () => setIsGpsLocating(false),
                      { enableHighAccuracy: true }
                    );
                  }
                }}
                className="w-full py-2.5 rounded-2xl bg-[#142419] hover:bg-[#2D4536] border border-[#3D5A47] text-[#E9B161] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
                <span>استخدام إحداثيات موقعي الحالية (GPS)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Time Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md rounded-3xl bg-[#1B3022] border border-[#3D5A47] p-6 text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2D4536] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#E9B161]" />
                <h3 className="font-bold text-base text-white">ضبط دقائق المواقيت</h3>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 text-[#A8BCAD] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A8BCAD]">
              يمكنك زيادة أو إنقاص دقائق كل صلاة لتتطابق تماماً مع تقويم مسجدك المحلي:
            </p>

            <div className="space-y-2.5">
              {prayersList.slice(0, 6).map((p) => {
                const adj = timeAdjustments[p.key] || 0;
                const formatted = formatPrayerTime(p.rawTime, use12HourFormat);
                return (
                  <div
                    key={p.key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#142419] border border-[#2D4536]"
                  >
                    <div>
                      <span className="text-xs font-bold block">{p.label}</span>
                      <span className="text-[11px] text-[#A8BCAD] font-mono">{formatted.formatted}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustmentChange(p.key, -1)}
                        className="w-7 h-7 rounded-lg bg-[#2D4536] hover:bg-[#3D5A47] font-bold text-sm flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold text-[#E9B161] w-12 text-center">
                        {adj > 0 ? `+${adj}` : adj} دقيقة
                      </span>
                      <button
                        onClick={() => handleAdjustmentChange(p.key, 1)}
                        className="w-7 h-7 rounded-lg bg-[#2D4536] hover:bg-[#3D5A47] font-bold text-sm flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2D4536]">
              <button
                onClick={() => {
                  setTimeAdjustments({});
                  localStorage.removeItem('tareeq_prayer_adjustments');
                  localStorage.removeItem('nour_prayer_adjustments');
                }}
                className="text-xs text-red-400 hover:underline"
              >
                إعادة ضبط للصفر
              </button>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-5 py-2 rounded-xl bg-[#E9B161] text-[#1B3022] font-bold text-xs hover:bg-[#dfa755]"
              >
                تم وحفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Adhan & Background Notification Settings Modal */}
      {showAutoAdhanModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setShowAutoAdhanModal(false)}
        >
          <div 
            className="w-full max-w-lg rounded-3xl bg-[#1B3022] border border-[#3D5A47] p-5 sm:p-6 text-white shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2D4536] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#E9B161]/20 text-[#E9B161]">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">إعدادات الأذان التلقائي والتنبيهات</h3>
                  <p className="text-[11px] text-[#A8BCAD]">التنبيه الصوتي عند حلول موعد الصلاة وفي الخلفية</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAutoAdhanModal(false)}
                className="p-2 rounded-xl hover:bg-[#2D4536] text-[#A8BCAD] hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Master Switch Card */}
            <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              autoAdhanEnabled
                ? 'bg-[#142419] border-[#E9B161] shadow-md shadow-[#E9B161]/10'
                : 'bg-[#142419]/60 border-[#2D4536]'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">تفعيل الأذان التلقائي</span>
                  {autoAdhanEnabled && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50 font-bold">
                      مفعّل
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#A8BCAD]">
                  رفع الأذان وإرسال إشعار فوري عند دخول وقت كل صلاة تلقائياً
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={handleToggleAutoAdhan}
                className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center shrink-0 ${
                  autoAdhanEnabled ? 'bg-[#E9B161] justify-end' : 'bg-[#2D4536] justify-start'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-[#1B3022] shadow-md transition-transform ${
                  autoAdhanEnabled ? 'border-2 border-[#1B3022]' : ''
                }`} />
              </button>
            </div>

            {/* Notification Permission Status */}
            <div className="p-4 rounded-2xl bg-[#142419] border border-[#2D4536] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A8BCAD]">حالة إذن إشعارات النظام:</span>
                {notificationStatus === 'granted' ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    ممنوح بنجاح ومفعّل
                  </span>
                ) : (
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    يحتاج إلى إذن المتصفح
                  </span>
                )}
              </div>

              {notificationStatus !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestNotificationPermission}
                  className="w-full py-2.5 rounded-xl bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Bell className="w-4 h-4 fill-current" />
                  <span>السماح بإشعارات الأذان في المتصفح / الهاتف</span>
                </button>
              )}
            </div>

            {/* Default Muezzin Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#E0E7E1] block">
                صوت المؤذن الافتراضي للأذان:
              </label>
              <select
                value={selectedAdhanId}
                onChange={(e) => {
                  setSelectedAdhanId(e.target.value);
                  try {
                    localStorage.setItem('tareeq_selected_adhan', e.target.value);
                    localStorage.setItem('tareeq_selected_adhan_id', e.target.value);
                  } catch {
                    // ignore
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#142419] border border-[#2D4536] text-white text-xs font-semibold focus:outline-none focus:border-[#E9B161]"
              >
                {ADHAN_LIST.map((adh) => (
                  <option key={adh.id} value={adh.id}>
                    {adh.name} ({adh.location} • {adh.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Individual Prayer Toggles */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[#E0E7E1] block">
                تخصيص تنبيه كل صلاة على حدة:
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                {prayersList.map((p) => {
                  const isEnabled = prayerNotifications[p.key] !== false;
                  return (
                    <button
                      key={p.key}
                      onClick={() => handleTogglePrayerNotification(p.key)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                        isEnabled
                          ? 'bg-[#142419] border-[#E9B161]/50 text-white'
                          : 'bg-[#142419]/40 border-[#2D4536]/50 text-[#A8BCAD] opacity-60'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{p.label}</span>
                        <span className="text-[10px] text-[#A8BCAD] font-mono">{p.rawTime}</span>
                      </div>
                      <div className={`p-1.5 rounded-lg ${
                        isEnabled ? 'bg-[#E9B161] text-[#1B3022]' : 'bg-[#2D4536] text-[#A8BCAD]'
                      }`}>
                        {isEnabled ? <Check className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Alarm / Notification Button */}
            <div className="pt-2 border-t border-[#2D4536] space-y-2">
              <button
                type="button"
                onClick={handleSendTestNotification}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#233F2E] to-[#1B3022] hover:from-[#2D4536] hover:to-[#233F2E] border border-[#E9B161]/60 text-[#E9B161] font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <Play className="w-4 h-4 fill-current animate-pulse" />
                <span>تجربة إشعار وصوت الأذان الآن للتأكد من عمله</span>
              </button>

              {testNotificationSent && (
                <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs text-center flex items-center justify-center gap-2 animate-fadeIn shadow-md">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>تم إرسال إشعار التجربة وتشغيل الأذان الصوتي بنجاح!</span>
                </div>
              )}
            </div>

            {/* Background Notification Guidance */}
            <div className="p-3.5 rounded-2xl bg-[#142419]/70 border border-[#2D4536] text-[11px] text-[#A8BCAD] space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 text-[#E9B161] font-bold">
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>كيف يعمل الأذان التلقائي والتنبيهات؟</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pr-1 text-stone-300">
                <li>يتم فحص مواقيت الصلاة في كل دقيقة بدقة لمحافظتك.</li>
                <li>عند حلول وقت الصلاة، يرسل النظام إشعاراً فورياً ويصدح الأذان الصوتي تلقائياً.</li>
                <li><strong>على الهاتف أو الكمبيوتر:</strong> اضغط على «السماح بالإشعارات» في الأعلى لتصلك التنبيهات حتى عند قفل الشاشة أو استخدام تطبيقات أخرى.</li>
              </ul>
            </div>

            {/* Modal Bottom Close */}
            <div className="flex items-center justify-end pt-2 border-t border-[#2D4536]">
              <button
                type="button"
                onClick={() => setShowAutoAdhanModal(false)}
                className="px-6 py-2 rounded-xl bg-[#E9B161] text-[#1B3022] font-bold text-xs hover:bg-[#dfa755] transition-all cursor-pointer"
              >
                تم وحفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Adhan Player & Du'a Modal */}
      <AdhanPlayerModal
        isOpen={isAdhanModalOpen}
        onClose={() => setIsAdhanModalOpen(false)}
        prayerName={adhanModalPrayer}
        initialAdhanId={selectedAdhanId}
      />

      {/* Home & Lock Screen Widgets Modal */}
      <PrayerWidgetsModal
        isOpen={showWidgetsModal}
        onClose={() => setShowWidgetsModal(false)}
        onOpenAmbientLockScreen={() => setShowAmbientLockScreen(true)}
      />

      {/* Fullscreen Always-On Lock Screen Ambient Display */}
      {showAmbientLockScreen && (
        <LockScreenAmbientView onClose={() => setShowAmbientLockScreen(false)} />
      )}
    </div>
  );
};

