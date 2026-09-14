// Utility to detect if the app is already installed or running in standalone / APK mode

let globalDeferredPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    (window as any).deferredInstallPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa_prompt_available', { detail: e }));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    (window as any).deferredInstallPrompt = null;
    markAppAsInstalled();
  });
}

export function getDeferredPrompt(): any {
  return globalDeferredPrompt || (typeof window !== 'undefined' ? (window as any).deferredInstallPrompt : null);
}

export function hasDeferredPrompt(): boolean {
  return !!getDeferredPrompt();
}

export async function promptDirectInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const prompt = getDeferredPrompt();
  if (prompt && typeof prompt.prompt === 'function') {
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        markAppAsInstalled();
        globalDeferredPrompt = null;
        (window as any).deferredInstallPrompt = null;
        return 'accepted';
      }
      return 'dismissed';
    } catch (e) {
      console.warn('Install prompt error:', e);
      return 'unavailable';
    }
  }
  return 'unavailable';
}

export function checkIsAppInstalled(): boolean {
  try {
    // 1. Check if running in standalone display mode (PWA / Installed Web App)
    if (typeof window !== 'undefined') {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        return true;
      }
      if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) {
        return true;
      }
      if (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) {
        return true;
      }
      // 2. iOS standalone check
      if ((window.navigator as any)?.standalone === true) {
        return true;
      }
      // 3. Android APK / TWA referrer or user agent check
      if (document.referrer && document.referrer.includes('android-app://')) {
        return true;
      }
      // 4. URL query flags from shortcut or APK launcher
      const search = window.location.search;
      if (search.includes('source=pwa') || search.includes('source=apk') || search.includes('source=twa') || search.includes('installed=1')) {
        return true;
      }
      // 5. Local storage persistence (e.g. user previously installed or marked as installed)
      const stored = localStorage.getItem('nour_app_installed');
      if (stored === 'true') {
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
}

export function markAppAsInstalled(): void {
  try {
    localStorage.setItem('nour_app_installed', 'true');
    window.dispatchEvent(new Event('app_installed_status_change'));
  } catch {
    // ignore
  }
}
