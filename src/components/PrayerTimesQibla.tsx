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
  Volume2,
  Check,
  Play,
  Radio,
  HeartHandshake
} from 'lucide-react';
import { AdhanPlayerModal, ADHAN_LIST, AdhanOption } from './AdhanPlayerModal';

export interface CityOption {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: number; // UTC offset in hours
  method: number; // Calculation Method ID: 5 = Egyptian General Authority of Survey (الهيئة المصرية العامة للمساحة)
}

export const CITIES: CityOption[] = [
  // Egyptian Governorates & Major Cities (Default & Primary)
  { name: 'القاهرة', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 30.0444, lng: 31.2357, timezone: 3, method: 5 },
  { name: 'الجيزة', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 30.0131, lng: 31.2089, timezone: 3, method: 5 },
  { name: 'الإسكندرية', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 31.2001, lng: 29.9187, timezone: 3, method: 5 },
  { name: 'المنصورة (الدقهلية)', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 31.0409, lng: 31.3785, timezone: 3, method: 5 },
  { name: 'طنطا (الغربية)', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 30.7865, lng: 31.0004, timezone: 3, method: 5 },
  { name: 'الزقازيق (الشرقية)', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 30.5877, lng: 31.5020, timezone: 3, method: 5 },
  { name: 'شبين الكوم (المنوفية)', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 30.5526, lng: 31.0084, timezone: 3, method: 5 },
  { name: 'بنها (القليوبية)', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 30.4660, lng: 31.1853, timezone: 3, method: 5 },
  { name: 'دمنهور (البحيرة)', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 31.0379, lng: 30.4685, timezone: 3, method: 5 },
  { name: 'كفر الشيخ', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 31.1107, lng: 30.9388, timezone: 3, method: 5 },
  { name: 'دمياط', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 31.4175, lng: 31.8144, timezone: 3, method: 5 },
  { name: 'بورسعيد', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 31.2653, lng: 32.3019, timezone: 3, method: 5 },
  { name: 'الإسماعيلية', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 30.5965, lng: 32.2715, timezone: 3, method: 5 },
  { name: 'السويس', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 29.9668, lng: 32.5498, timezone: 3, method: 5 },
  { name: 'الفيوم', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 29.3084, lng: 30.8428, timezone: 3, method: 5 },
  { name: 'بني سويف', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 29.0661, lng: 31.0994, timezone: 3, method: 5 },
  { name: 'المنيا', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 28.1099, lng: 30.7503, timezone: 3, method: 5 },
  { name: 'أسيوط', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 27.1809, lng: 31.1837, timezone: 3, method: 5 },
  { name: 'سوهاج', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 26.5569, lng: 31.6948, timezone: 3, method: 5 },
  { name: 'قنا', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 26.1551, lng: 32.7160, timezone: 3, method: 5 },
  { name: 'الأقصر', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 25.6872, lng: 32.6396, timezone: 3, method: 5 },
  { name: 'أسوان', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 24.0889, lng: 32.8998, timezone: 3, method: 5 },
  { name: 'الغردقة (البحر الأحمر)', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 27.2579, lng: 33.8116, timezone: 3, method: 5 },
  { name: 'شرم الشيخ (جنوب سيناء)', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 27.9158, lng: 34.3299, timezone: 3, method: 5 },
  { name: 'العريش (شمال سيناء)', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 31.1316, lng: 33.7984, timezone: 3, method: 5 },
  { name: 'مرسى مطروح', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 31.3543, lng: 27.2373, timezone: 3, method: 5 },
  { name: 'الخارجة (الوادي الجديد)', country: 'مصر (الهيئة المصرية العامة للمساحة)', lat: 25.4514, lng: 30.5472, timezone: 3, method: 5 },

  // Holy cities & Capitals
  { name: 'مكة المكرمة', country: 'المملكة العربية السعودية', lat: 21.4225, lng: 39.8262, timezone: 3, method: 4 },
  { name: 'المدينة المنورة', country: 'المملكة العربية السعودية', lat: 24.4672, lng: 39.6111, timezone: 3, method: 4 },
  { name: 'القدس الشريف', country: 'فلسطين', lat: 31.7683, lng: 35.2137, timezone: 3, method: 3 },
  { name: 'الرياض', country: 'المملكة العربية السعودية', lat: 24.7136, lng: 46.6753, timezone: 3, method: 4 },
  { name: 'جدة', country: 'المملكة العربية السعودية', lat: 21.5433, lng: 39.1728, timezone: 3, method: 4 },
  { name: 'دبي', country: 'الإمارات العربية المتحدة', lat: 25.2048, lng: 55.2708, timezone: 4, method: 4 },
  { name: 'الكويت', country: 'الكويت', lat: 29.3759, lng: 47.9774, timezone: 3, method: 4 },
  { name: 'عمان', country: 'الأردن', lat: 31.9454, lng: 35.9284, timezone: 3, method: 3 }
];

// Kaaba Coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

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

  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
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
      return saved === 'true';
    } catch {
      return false;
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

  // Adhan Player Modal state
  const [isAdhanModalOpen, setIsAdhanModalOpen] = useState<boolean>(false);
  const [adhanModalPrayer, setAdhanModalPrayer] = useState<string>('الصلاة');

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

  // Update clock every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
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
          setApiTimings({
            fajr: t.Fajr?.slice(0, 5) || '04:49',
            sunrise: t.Sunrise?.slice(0, 5) || '06:23',
            dhuhr: t.Dhuhr?.slice(0, 5) || '12:59',
            asr: t.Asr?.slice(0, 5) || '16:36',
            maghrib: t.Maghrib?.slice(0, 5) || '19:34',
            isha: t.Isha?.slice(0, 5) || '20:57',
            qiyam: t.Lastthird?.slice(0, 5) || '02:47'
          });

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

  // Listen to device orientation for real Compass
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const anyEvent = e as any;
      if (anyEvent.webkitCompassHeading !== undefined) {
        // iOS
        setDeviceHeading(anyEvent.webkitCompassHeading);
      } else if (e.alpha !== null) {
        // Android
        setDeviceHeading(360 - e.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
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

  const handleToggleAutoAdhan = () => {
    const nextVal = !autoAdhanEnabled;
    setAutoAdhanEnabled(nextVal);
    try {
      localStorage.setItem('tareeq_auto_adhan', String(nextVal));
    } catch {
      // ignore
    }

    if (nextVal && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
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

  const qiblaBearing = calculateQibla(selectedCity.lat, selectedCity.lng);
  const distanceKaaba = calculateDistanceToKaaba(selectedCity.lat, selectedCity.lng);

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

    // Check if current time matches any prayer that has adhan
    prayersList.filter(p => p.hasAdhan).forEach((p) => {
      if (p.rawTime === currentTimeStr && lastTriggeredPrayerRef.current !== `${p.key}-${currentTimeStr}`) {
        lastTriggeredPrayerRef.current = `${p.key}-${currentTimeStr}`;
        setAdhanModalPrayer(p.label);
        setIsAdhanModalOpen(true);

        // Browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`حان الآن موعد أذان ${p.label}`, {
            body: `حي على الصلاة • طريق الهدى (${selectedCity.name})`,
            icon: '/icon.svg'
          });
        }
      }
    });
  }, [currentTimeStr, autoAdhanEnabled, prayersList, selectedCity.name]);

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
        
        {/* City Select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <MapPin className="w-4 h-4 text-[#1B3022] dark:text-[#E9B161] shrink-0" />
          <span className="font-semibold text-[#2C3E30] dark:text-[#E0E7E1] shrink-0">المدينة:</span>
          <select
            value={selectedCity.name}
            onChange={(e) => {
              const found = CITIES.find((c) => c.name === e.target.value);
              if (found) handleCityChange(found);
            }}
            className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#3D5A47] font-bold text-[#2C3E30] dark:text-[#E0E7E1] focus:outline-none"
          >
            <optgroup label="محافظات ومدن جمهورية مصر العربية">
              {CITIES.filter(c => c.country.includes('مصر')).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="مدن وعواصم إسلامية أخرى">
              {CITIES.filter(c => !c.country.includes('مصر')).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.country})
                </option>
              ))}
            </optgroup>
          </select>
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

          {/* Auto Adhan Alert Toggle */}
          <button
            onClick={handleToggleAutoAdhan}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all font-semibold ${
              autoAdhanEnabled
                ? 'bg-[#E9B161]/20 border-[#E9B161] text-[#E9B161] dark:bg-[#E9B161]/15'
                : 'bg-[#F3F5F4] dark:bg-[#142419] border-[#2D4536]/20 dark:border-[#3D5A47] text-[#55695C] dark:text-[#A8BCAD]'
            }`}
            title="تفعيل التنبيه الصوتي التلقائي للأذان عند دخول وقت الصلاة"
          >
            {autoAdhanEnabled ? <BellRing className="w-3.5 h-3.5 text-[#E9B161] animate-bounce" /> : <Bell className="w-3.5 h-3.5" />}
            <span>تنبيه الأذان: {autoAdhanEnabled ? 'مفعّل' : 'معطّل'}</span>
          </button>

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

          {/* Prayers Grid with Adhan Listen Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {prayersList.map((p) => {
              const Icon = p.icon;
              const isNext = p.key === nextPrayer.key;
              const adj = timeAdjustments[p.key] || 0;
              const timeObj = formatPrayerTime(p.rawTime, use12HourFormat);

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

                  {/* Card Bottom: Listen to Adhan action */}
                  {p.hasAdhan && (
                    <div className="pt-2 border-t border-[#2D4536]/10 dark:border-[#2D4536]/40 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleOpenAdhanModal(p.label, p.key === 'fajr' ? 'fajr_makkah' : undefined)}
                        className="inline-flex items-center gap-1.5 text-[#1B3022] dark:text-[#E9B161] hover:underline font-semibold"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>استماع لأذان {p.label}</span>
                      </button>
                      <span className="text-[10px] text-[#7A8C80] dark:text-[#A8BCAD]">
                        {p.key === 'fajr' ? 'أذان الفجر' : 'الأذان الشرعي'}
                      </span>
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

              <button
                onClick={() => handleOpenAdhanModal('الأذان')}
                className="px-5 py-2.5 rounded-xl bg-[#1B3022] hover:bg-[#233F2E] text-[#E9B161] font-bold text-xs flex items-center gap-2 border border-[#3D5A47] transition-all shadow-md"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>فتح مشغل الأذان الكامل</span>
              </button>
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

      {/* VIEW 3: QIBLA COMPASS */}
      {activeTab === 'qibla' && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-xl text-center space-y-6">
          <div>
            <h3 className="text-xl font-bold text-[#2C3E30] dark:text-white mb-1">
              اتجاه القبلة نحو المسجد الحرام بمكة المكرمة
            </h3>
            <p className="text-xs text-[#55695C] dark:text-[#A8BCAD]">
              زاوية الانحراف من {selectedCity.name}: <strong className="text-[#1B3022] dark:text-[#E9B161] font-mono text-sm">{Math.round(qiblaBearing)}°</strong> بالنسبة للشمال الجغرافي
            </p>
            <p className="text-xs text-[#55695C] dark:text-[#A8BCAD] mt-1">
              المسافة إلى الكعبة المشرفة: <strong className="font-mono text-[#C2822B] dark:text-[#E9B161]">{distanceKaaba.toLocaleString('ar-EG')} كم</strong>
            </p>
          </div>

          {/* Visual Interactive Compass Dial */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
            {/* Outer Ring */}
            <div className="w-full h-full rounded-full border-4 border-[#2D4536]/20 dark:border-[#2D4536] flex items-center justify-center p-3 relative shadow-inner">
              {/* Compass Cardinal Points */}
              <span className="absolute top-2 text-xs font-bold text-red-500 font-mono">N (شمال)</span>
              <span className="absolute bottom-2 text-xs font-bold text-[#55695C] dark:text-[#A8BCAD] font-mono">S (جنوب)</span>
              <span className="absolute right-2 text-xs font-bold text-[#55695C] dark:text-[#A8BCAD] font-mono">E (شرق)</span>
              <span className="absolute left-2 text-xs font-bold text-[#55695C] dark:text-[#A8BCAD] font-mono">W (غرب)</span>

              {/* Dial Face with Qibla Pointer */}
              <div
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-[#142419] via-[#1B3022] to-[#233F2E] border-2 border-[#E9B161]/60 shadow-2xl flex items-center justify-center relative transition-transform duration-500 ease-out"
                style={{
                  transform: `rotate(${deviceHeading !== null ? qiblaBearing - deviceHeading : qiblaBearing}deg)`
                }}
              >
                {/* Pointer to Kaaba */}
                <div className="absolute top-3 flex flex-col items-center">
                  <div className="w-4 h-4 bg-[#E9B161] rounded-full shadow-lg shadow-[#E9B161]/50 border border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-[#1B3022] rounded-full"></span>
                  </div>
                  <span className="text-[10px] font-bold text-[#E9B161] mt-1">الكعبة</span>
                </div>

                {/* Center Kaaba Icon Graphic */}
                <div className="w-12 h-12 rounded-xl bg-[#142419] border-2 border-[#E9B161] p-1 flex items-center justify-center shadow-lg">
                  <img src="/icon.svg" alt="الكعبة" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto p-3 rounded-xl bg-[#1B3022]/5 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] text-xs text-[#55695C] dark:text-[#E0E7E1]">
            <p>
              💡 ضع هاتفك على سطح أفقي مستوٍ، وقم بتدوير الجهاز حتى يشير السهم الذهبي إلى الأعلى باتجاه الكعبة المشرفة.
            </p>
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

      {/* Full Adhan Player & Du'a Modal */}
      <AdhanPlayerModal
        isOpen={isAdhanModalOpen}
        onClose={() => setIsAdhanModalOpen(false)}
        prayerName={adhanModalPrayer}
        initialAdhanId={selectedAdhanId}
      />
    </div>
  );
};
