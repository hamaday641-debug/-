// Analytics & Visitor Tracking Service
export interface VisitorSession {
  id: string;
  timestamp: number;
  dateStr: string;
  hour: number;
  tabVisited: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  surahRead?: number;
  ayahRead?: number;
  reciterListened?: string;
  lectureWatched?: string;
}

export interface AppAnalytics {
  totalVisits: number;
  uniqueVisitors: number;
  totalAudioMinutes: number;
  totalTasbihCount: number;
  totalAyahsRead: number;
  lastVisitTimestamp: number;
  dailyVisits: Record<string, number>; // "YYYY-MM-DD" -> count
  tabPopularity: Record<string, number>; // "quran" -> count, "lectures" -> count
  popularSurahs: Record<string, number>; // "سورة البقرة" -> count
  popularReciters: Record<string, number>; // "مشاري العفاسي" -> count
  popularLectures: Record<string, number>; // Lecture Title -> count
  recentSessions: VisitorSession[];
  adminPin: string;
  googleAnalyticsId: string;
}

const STORAGE_KEY = 'huda_app_analytics_v1';
const VISITOR_ID_KEY = 'huda_visitor_id';

const DEFAULT_ANALYTICS: AppAnalytics = {
  totalVisits: 1,
  uniqueVisitors: 1,
  totalAudioMinutes: 12,
  totalTasbihCount: 0,
  totalAyahsRead: 0,
  lastVisitTimestamp: Date.now(),
  dailyVisits: {},
  tabPopularity: {
    quran: 1,
    lectures: 0,
    adhkar: 0,
    duas: 0,
    times: 0,
    tasbih: 0
  },
  popularSurahs: {},
  popularReciters: {},
  popularLectures: {},
  recentSessions: [],
  adminPin: '7788', // Default secure PIN code
  googleAnalyticsId: 'G-HMNDLEHG1B'
};

export const getAnalytics = (): AppAnalytics => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const today = new Date().toISOString().split('T')[0];
      const initial = {
        ...DEFAULT_ANALYTICS,
        dailyVisits: { [today]: 1 },
        lastVisitTimestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const data = JSON.parse(raw);
    return { ...DEFAULT_ANALYTICS, ...data };
  } catch {
    return DEFAULT_ANALYTICS;
  }
};

export const saveAnalytics = (analytics: AppAnalytics) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics));
  } catch (e) {
    console.error('Failed to save analytics', e);
  }
};

// Detect Device
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

const getBrowserName = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  return 'Browser';
};

// Record page / visit event
export const recordAppVisit = (tab: string = 'quran') => {
  try {
    const analytics = getAnalytics();
    const today = new Date().toISOString().split('T')[0];
    const now = Date.now();

    // Check unique visitor
    let isNewVisitor = false;
    if (!localStorage.getItem(VISITOR_ID_KEY)) {
      isNewVisitor = true;
      localStorage.setItem(VISITOR_ID_KEY, 'visitor_' + Math.random().toString(36).substring(2, 10));
    }

    analytics.totalVisits = (analytics.totalVisits || 0) + 1;
    if (isNewVisitor) {
      analytics.uniqueVisitors = (analytics.uniqueVisitors || 0) + 1;
    }

    analytics.dailyVisits[today] = (analytics.dailyVisits[today] || 0) + 1;
    analytics.tabPopularity[tab] = (analytics.tabPopularity[tab] || 0) + 1;
    analytics.lastVisitTimestamp = now;

    // Log session
    const session: VisitorSession = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: now,
      dateStr: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      hour: new Date().getHours(),
      tabVisited: tab,
      deviceType: getDeviceType(),
      browser: getBrowserName()
    };

    analytics.recentSessions = [session, ...(analytics.recentSessions || [])].slice(0, 50);

    saveAnalytics(analytics);
  } catch (e) {
    console.error('Error logging visit', e);
  }
};

// Track specific actions
export const trackEvent = (
  type: 'surah' | 'reciter' | 'lecture' | 'tasbih' | 'ayah',
  name: string,
  extraVal?: number
) => {
  try {
    const analytics = getAnalytics();
    if (type === 'surah') {
      analytics.popularSurahs[name] = (analytics.popularSurahs[name] || 0) + 1;
    } else if (type === 'reciter') {
      analytics.popularReciters[name] = (analytics.popularReciters[name] || 0) + 1;
    } else if (type === 'lecture') {
      analytics.popularLectures[name] = (analytics.popularLectures[name] || 0) + 1;
    } else if (type === 'tasbih') {
      analytics.totalTasbihCount = (analytics.totalTasbihCount || 0) + (extraVal || 1);
    } else if (type === 'ayah') {
      analytics.totalAyahsRead = (analytics.totalAyahsRead || 0) + (extraVal || 1);
    }
    saveAnalytics(analytics);
  } catch (e) {
    console.error('Error tracking event', e);
  }
};
