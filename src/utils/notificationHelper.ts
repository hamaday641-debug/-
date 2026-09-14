/**
 * Cross-platform safe notification dispatcher.
 * Handles Android Chrome (where `new Notification()` throws "Illegal constructor"),
 * desktop browsers, and PWAs safely with Service Worker and try/catch protections.
 */

export interface SafeNotificationPayload {
  title?: string;
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  vibrate?: number[];
  data?: any;
}

export async function showSafeNotification(
  title: string,
  options: SafeNotificationPayload = {}
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const notificationOptions: NotificationOptions = {
    body: options.body || '',
    icon: options.icon || '/icon.svg',
    tag: options.tag,
    requireInteraction: options.requireInteraction ?? false,
    ...((options.data ? { data: options.data } : {}) as any)
  };

  // 1. Try Service Worker showNotification (Mandatory on Android Chrome)
  if ('serviceWorker' in navigator) {
    try {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_ADHAN_NOTIFICATION',
          prayerLabel: title,
          cityName: options.body || '',
          ...options
        });
      }

      // Check if registration is already active or ready
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
      ]);

      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    } catch {
      // SW notification failed or timed out, continue to constructor fallback
    }
  }

  // 2. Standard Desktop Browser Notification Constructor (wrapped safely in try/catch)
  try {
    new Notification(title, notificationOptions);
    return true;
  } catch (err) {
    // Catches "TypeError: Failed to construct 'Notification': Illegal constructor" on mobile devices
    console.info('Desktop Notification constructor not supported on this device:', err);
    return false;
  }
}
