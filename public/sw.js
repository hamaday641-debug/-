// Service Worker for "طريق الهدى" - Offline First PWA
const CACHE_NAME = 'tareeq-app-v3';
const AUDIO_CACHE = 'tareeq-audio-cache-v1';
const DATA_CACHE = 'tareeq-data-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json'
];

// Install Event - Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== AUDIO_CACHE && key !== DATA_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate and Cache-First strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Handle Audio Files (EveryAyah, mp3quran, Adhan, etc.)
  if (
    url.pathname.endsWith('.mp3') || 
    url.hostname.includes('everyayah.com') || 
    url.hostname.includes('mp3quran.net') ||
    url.hostname.includes('quranicaudio.com') ||
    url.hostname.includes('islamic.network') ||
    url.hostname.includes('archive.org')
  ) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) {
          return cached;
        }

        try {
          const networkRes = await fetch(event.request);
          if (networkRes && networkRes.ok) {
            cache.put(event.request, networkRes.clone());
          }
          return networkRes;
        } catch (e) {
          if (cached) return cached;
          throw e;
        }
      })
    );
    return;
  }

  // 2. Handle Quran & Prayer Times APIs (Cache & Network Fallback)
  if (
    url.hostname.includes('api.alquran.cloud') || 
    url.hostname.includes('api.aladhan.com')
  ) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }
        } catch (err) {
          // Network failed, try cache
        }

        const cached = await cache.match(event.request);
        if (cached) {
          return cached;
        }

        return new Response(JSON.stringify({ error: 'offline', offline: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 3. Handle Fonts & Static Assets (Cache First)
  if (
    url.hostname.includes('fonts.googleapis.com') || 
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res.ok) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          }
          return res;
        });
      })
    );
    return;
  }

  // 4. Default Navigation / App Shell (Network First with Cache Fallback)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// 5. Automatic Adhan & Background Persistent Prayer Widget Handling
const LIVE_WIDGET_TAG = 'tareeq-live-prayer-widget';

// In-memory scheduled adhans in Service Worker
let scheduledAdhanList = [];
let adhanTimers = [];

function clearScheduledTimers() {
  adhanTimers.forEach((timer) => clearTimeout(timer));
  adhanTimers = [];
}

function scheduleAdhanNotifications(prayers) {
  clearScheduledTimers();
  if (!Array.isArray(prayers) || prayers.length === 0) return;
  scheduledAdhanList = prayers;

  const now = Date.now();

  prayers.forEach((prayer) => {
    const delay = prayer.timestamp - now;
    if (delay <= 0) return;

    const isPreAlert = Boolean(prayer.isPreAlert);
    const title = isPreAlert
      ? `⏰ اقترب موعد أذان ${prayer.prayerLabel} (بقي ${prayer.preMinutes || 15} دقيقة)`
      : `🕌 حان الآن موعد أذان ${prayer.prayerLabel}`;
    const body = isPreAlert
      ? `استعد للوضوء والصلاة • طريق الهدى (${prayer.cityName || 'مواقيت الصلاة'})`
      : `حي على الصلاة • طريق الهدى (${prayer.cityName || 'مواقيت الصلاة'})`;
    const tag = isPreAlert
      ? `pre-adhan-${prayer.prayerKey}-${prayer.timestamp}`
      : `adhan-${prayer.prayerKey}-${prayer.timestamp}`;
    const vibrate = isPreAlert
      ? [350, 150, 350, 150, 600]
      : [600, 300, 600, 300, 1200];
    const url = isPreAlert
      ? `/?tab=prayers&preAlert=true&prayer=${encodeURIComponent(prayer.prayerLabel)}`
      : `/?action=play_adhan&prayer=${encodeURIComponent(prayer.prayerLabel)}&adhanId=${prayer.adhanId || ''}`;
    const actions = isPreAlert
      ? [{ action: 'open_app', title: 'فتح مواقيت الصلاة 📖' }]
      : [
          { action: 'play_adhan', title: 'سماع الأذان 🔊' },
          { action: 'open_app', title: 'فتح التطبيق 📖' }
        ];

    // 1. Try modern Notification Triggers API (Supported on Android Chrome/Edge - triggers even if browser is closed)
    if ('showTrigger' in Notification.prototype && typeof TimestampTrigger !== 'undefined') {
      try {
        self.registration.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon.svg',
          tag,
          showTrigger: new TimestampTrigger(prayer.timestamp),
          renotify: true,
          requireInteraction: true,
          vibrate,
          data: {
            isPreAlert,
            prayerLabel: prayer.prayerLabel,
            cityName: prayer.cityName,
            adhanId: prayer.adhanId,
            url
          },
          actions
        });
      } catch (e) {
        // Fallback to internal timer
      }
    }

    // 2. Schedule in-memory timeout in Service Worker
    if (delay < 24 * 60 * 60 * 1000) {
      const timer = setTimeout(() => {
        self.registration.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon.svg',
          tag,
          renotify: true,
          requireInteraction: true,
          vibrate,
          data: {
            isPreAlert,
            prayerLabel: prayer.prayerLabel,
            cityName: prayer.cityName,
            adhanId: prayer.adhanId,
            url
          },
          actions
        });
      }, delay);
      adhanTimers.push(timer);
    }
  });
}

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Schedule offline adhan alarms for today & tomorrow
  if (event.data.type === 'SCHEDULE_OFFLINE_ADHAN_TIMERS') {
    scheduleAdhanNotifications(event.data.prayers);
    return;
  }

  if (event.data.type === 'SHOW_ADHAN_NOTIFICATION') {
    const { prayerLabel, cityName, adhanId } = event.data;
    const title = `حان الآن موعد أذان ${prayerLabel || 'الصلاة'}`;
    const options = {
      body: `حي على الصلاة • طريق الهدى (${cityName || 'مواقيت الصلاة'})`,
      icon: '/icon-192.png',
      badge: '/icon.svg',
      tag: `adhan-${prayerLabel}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [500, 200, 500, 200, 1000],
      data: {
        prayerLabel,
        cityName,
        adhanId,
        url: `/?action=play_adhan&prayer=${encodeURIComponent(prayerLabel || 'الصلاة')}&adhanId=${adhanId || ''}`
      },
      actions: [
        { action: 'play_adhan', title: 'سماع الأذان 🔊' },
        { action: 'open_app', title: 'فتح التطبيق 📖' }
      ]
    };

    self.registration.showNotification(title, options);
    return;
  }

  // Persistent Home & Lock Screen Live Widget Notification
  if (event.data.type === 'START_BACKGROUND_WIDGET' || event.data.type === 'UPDATE_BACKGROUND_WIDGET') {
    const { 
      title = '🕌 مواقيت الصلاة - طريق الهدى', 
      body = '', 
      nextPrayer = '', 
      timeToNext = '', 
      city = '' 
    } = event.data;

    const widgetOptions = {
      body: body || `القادمة: ${nextPrayer} • متبقي: ${timeToNext}\n📍 ${city}`,
      icon: '/icon-192.png',
      badge: '/icon.svg',
      tag: LIVE_WIDGET_TAG,
      renotify: false,
      silent: true,
      sticky: true,
      ongoing: true,
      requireInteraction: false,
      data: {
        isWidget: true,
        url: '/?tab=prayers'
      },
      actions: [
        { action: 'close_widget', title: 'إغلاق الودجت ❌' },
        { action: 'open_app', title: 'عرض المواقيت 📖' }
      ]
    };

    self.registration.showNotification(title, widgetOptions);
    return;
  }

  // Stop/Dismiss Live Widget Notification
  if (event.data.type === 'STOP_BACKGROUND_WIDGET') {
    self.registration.getNotifications({ tag: LIVE_WIDGET_TAG }).then((notifications) => {
      notifications.forEach((n) => n.close());
    });
    return;
  }
});

// Periodic & Background Sync Listeners for offline adhan checks
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-adhan-times' && scheduledAdhanList.length > 0) {
    const now = Date.now();
    scheduledAdhanList.forEach((prayer) => {
      // If within 2 minutes of prayer time
      if (Math.abs(prayer.timestamp - now) < 2 * 60 * 1000) {
        self.registration.showNotification(`🕌 حان الآن موعد أذان ${prayer.prayerLabel}`, {
          body: `حي على الصلاة • طريق الهدى (${prayer.cityName})`,
          icon: '/icon-192.png',
          badge: '/icon.svg',
          tag: `adhan-${prayer.prayerKey}-${prayer.timestamp}`,
          renotify: true,
          requireInteraction: true,
          vibrate: [500, 200, 500, 200, 1000],
          data: {
            prayerLabel: prayer.prayerLabel,
            cityName: prayer.cityName,
            adhanId: prayer.adhanId,
            url: `/?action=play_adhan&prayer=${encodeURIComponent(prayer.prayerLabel)}&adhanId=${prayer.adhanId || ''}`
          }
        });
      }
    });
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-adhan-times' && scheduledAdhanList.length > 0) {
    scheduleAdhanNotifications(scheduledAdhanList);
  }
});

// Notification Click Handler - Open app, close widget, or trigger Adhan
self.addEventListener('notificationclick', (event) => {
  const action = event.action;

  // If user clicked 'Close Widget' action
  if (action === 'close_widget') {
    event.notification.close();
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({ type: 'WIDGET_CLOSED_BY_USER' });
      });
    });
    return;
  }

  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/?tab=prayers';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and notify it
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (event.notification.data?.prayerLabel) {
            client.postMessage({
              type: 'TRIGGER_ADHAN_FROM_NOTIFICATION',
              prayerLabel: event.notification.data?.prayerLabel,
              adhanId: event.notification.data?.adhanId
            });
          }
          return;
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. PWA Widgets Lifecycle Support (Native Android & Windows Widgets)
self.addEventListener('widgetinstall', (event) => {
  if (event.widget) {
    event.waitUntil(updateWidgetData(event.widget));
  }
});

self.addEventListener('widgetupdate', (event) => {
  if (event.widget) {
    event.waitUntil(updateWidgetData(event.widget));
  }
});

async function updateWidgetData(widget) {
  try {
    const templateRes = await fetch('/widgets/prayer-widget-template.json');
    const template = await templateRes.text();
    const dataRes = await fetch('/widgets/prayer-widget-data.json');
    const data = await dataRes.text();
    if (self.widgets && self.widgets.updateByTag) {
      await self.widgets.updateByTag('prayer-times-widget', { template, data });
    }
  } catch (err) {
    // PWA widget API graceful fallback
  }
}


