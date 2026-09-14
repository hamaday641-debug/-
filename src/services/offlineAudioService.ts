// Offline Audio & Data Management Service for Quran & Adhan
// Uses IndexedDB & Cache API with Blob streaming for 100% offline playback with zero internet
import { Reciter } from '../types';
import { RECITERS_LIST, getAyahAudioUrl, getSurahAudioUrl, getSurahAudioUrlsWithFallbacks } from '../data/reciters';

const DB_NAME = 'tareeq_offline_db';
const DB_VERSION = 1;
const STORE_AUDIO = 'audio_cache';
const STORE_METADATA = 'downloads_meta';
const CACHE_NAME = 'tareeq-audio-cache-v1';

let dbInstance: IDBDatabase | null = null;
const blobUrlCache = new Map<string, string>();

// Initialize IndexedDB with persistent storage request to prevent data loss across updates
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log('Tareeq persistent storage status:', isPersisted ? 'Persisted' : 'Not persisted');
      return isPersisted;
    } catch (e) {
      console.warn('Could not request persistent storage:', e);
      return false;
    }
  }
  return false;
}

function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  // Request persistent storage in background
  requestPersistentStorage().catch(() => {});

  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO, { keyPath: 'url' });
      }
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => {
      dbInstance = event.target.result;
      resolve(dbInstance!);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

/**
 * Checks if a specific URL is cached offline
 */
export async function isAudioUrlCached(url: string): Promise<boolean> {
  if (!url) return false;
  if (blobUrlCache.has(url)) return true;

  // 1. Try Cache API first
  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(url);
      if (match) return true;
    } catch {
      // ignore
    }
  }

  // 2. Try IndexedDB
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_AUDIO, 'readonly');
      const store = tx.objectStore(STORE_AUDIO);
      const req = store.get(url);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Retrieves an offline blob URL for the given audio URL if available
 */
export async function getOfflineAudioUrl(url: string): Promise<string | null> {
  if (!url) return null;

  // 0. Check in-memory active blob URL cache
  if (blobUrlCache.has(url)) {
    return blobUrlCache.get(url)!;
  }

  // 1. Check IndexedDB (Most robust for persistent audio Blobs on Mobile & Desktop)
  try {
    const db = await getDB();
    const dbBlobUrl = await new Promise<string | null>((resolve) => {
      const tx = db.transaction(STORE_AUDIO, 'readonly');
      const store = tx.objectStore(STORE_AUDIO);
      const req = store.get(url);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          const blobUrl = URL.createObjectURL(req.result.blob);
          blobUrlCache.set(url, blobUrl);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });

    if (dbBlobUrl) return dbBlobUrl;
  } catch (e) {
    console.warn('IndexedDB audio lookup error:', e);
  }

  // 2. Check Cache API
  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const res = await cache.match(url);
      if (res && res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        blobUrlCache.set(url, blobUrl);
        return blobUrl;
      }
    } catch (e) {
      console.warn('Cache API lookup error:', e);
    }
  }

  return null;
}

/**
 * Helper to fetch audio either directly or via proxy fallback
 */
async function fetchAudioBlob(url: string): Promise<Blob> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      return await response.blob();
    }
  } catch (err) {
    // Network / CORS error, attempt backend proxy
  }

  // Fallback to proxy endpoint if available
  const proxyUrl = `/api/audio-proxy?url=${encodeURIComponent(url)}`;
  const proxyRes = await fetch(proxyUrl);
  if (!proxyRes.ok) {
    throw new Error(`Failed to fetch audio from direct and proxy for ${url}`);
  }
  return await proxyRes.blob();
}

/**
 * Saves an audio file to offline cache (both Cache API & IndexedDB for reliability)
 */
export async function cacheAudioUrl(url: string): Promise<boolean> {
  if (!url) return false;

  try {
    const blob = await fetchAudioBlob(url);

    // 1. Store in Cache API
    if ('caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const response = new Response(blob, {
          headers: { 'Content-Type': blob.type || 'audio/mpeg' }
        });
        await cache.put(url, response);
      } catch (e) {
        console.warn('Could not store in Cache API:', e);
      }
    }

    // 2. Store in IndexedDB
    try {
      const db = await getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_AUDIO, 'readwrite');
        const store = tx.objectStore(STORE_AUDIO);
        const item = { url, blob, timestamp: Date.now(), size: blob.size };
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Could not store in IndexedDB:', e);
    }

    // Pre-create and store blob URL in memory
    const bUrl = URL.createObjectURL(blob);
    blobUrlCache.set(url, bUrl);

    return true;
  } catch (err) {
    console.warn(`Failed to cache audio URL (${url}):`, err);
    return false;
  }
}

export interface DownloadProgress {
  surahNumber: number;
  reciterId: string;
  totalAyahs: number;
  completedAyahs: number;
  percentage: number;
  status: 'idle' | 'downloading' | 'completed' | 'error';
  errorMessage?: string;
}

/**
 * Downloads full surah (both continuous high quality MP3 and individual Ayahs) for 100% offline listening
 */
export async function downloadSurahForOffline(
  surahNumber: number,
  reciterFolder: string,
  reciterId: string,
  totalAyahs: number,
  onProgress?: (p: DownloadProgress) => void
): Promise<boolean> {
  const downloadId = `${surahNumber}_${reciterId}`;
  const reciterObj = RECITERS_LIST.find((r) => r.id === reciterId);

  const totalSteps = totalAyahs + 1; // 1 for full continuous surah + N for verses
  let completed = 0;

  const update = (status: DownloadProgress['status'], errMsg?: string) => {
    if (onProgress) {
      onProgress({
        surahNumber,
        reciterId,
        totalAyahs,
        completedAyahs: Math.min(completed, totalAyahs),
        percentage: totalSteps > 0 ? Math.min(100, Math.round((completed / totalSteps) * 100)) : 0,
        status,
        errorMessage: errMsg
      });
    }
  };

  update('downloading');

  try {
    const sStr = String(surahNumber).padStart(3, '0');

    // 1. Download Full Continuous Surah MP3 file (crucial for smooth uninterrupted listening)
    if (reciterObj) {
      const surahUrls = getSurahAudioUrlsWithFallbacks(reciterObj, surahNumber);
      for (const sUrl of surahUrls) {
        if (sUrl) {
          try {
            await cacheAudioUrl(sUrl);
          } catch (e) {
            console.warn(`Failed caching continuous surah url: ${sUrl}`);
          }
        }
      }
    }
    completed++;
    update('downloading');

    // 2. Download individual Ayahs if reciter has verse-by-verse folder
    if (reciterFolder) {
      const chunkSize = 5;
      for (let i = 1; i <= totalAyahs; i += chunkSize) {
        const batch: Promise<void>[] = [];

        for (let ayah = i; ayah < Math.min(i + chunkSize, totalAyahs + 1); ayah++) {
          const aStr = String(ayah).padStart(3, '0');
          const audioUrl = `https://everyayah.com/data/${reciterFolder}/${sStr}${aStr}.mp3`;

          batch.push(
            (async () => {
              const alreadyCached = await isAudioUrlCached(audioUrl);
              if (!alreadyCached) {
                await cacheAudioUrl(audioUrl);
              }
              completed++;
              update('downloading');
            })()
          );
        }

        await Promise.all(batch);
      }
    } else {
      completed = totalSteps;
      update('downloading');
    }

    // 3. Save download metadata in IndexedDB
    try {
      const db = await getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_METADATA, 'readwrite');
        const store = tx.objectStore(STORE_METADATA);
        store.put({
          id: downloadId,
          surahNumber,
          reciterId,
          reciterFolder: reciterFolder || '',
          totalAyahs,
          downloadedAt: Date.now(),
          approxSizeMB: (totalAyahs * 0.15 + 3.5).toFixed(1)
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Metadata save error:', e);
    }

    update('completed');
    return true;
  } catch (err: any) {
    console.error('Surah download error:', err);
    update('error', err.message || 'حدث خطأ أثناء تنزيل التلاوة');
    return false;
  }
}

/**
 * Checks if a Surah is fully downloaded offline
 */
export async function isSurahDownloaded(surahNumber: number, reciterId: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_METADATA, 'readonly');
      const store = tx.objectStore(STORE_METADATA);
      const req = store.get(`${surahNumber}_${reciterId}`);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Gets list of all offline downloaded surahs
 */
export async function getAllDownloadedSurahs(): Promise<any[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_METADATA, 'readonly');
      const store = tx.objectStore(STORE_METADATA);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Deletes a downloaded Surah from IndexedDB & Cache API
 */
export async function deleteDownloadedSurah(surahNumber: number, reciterId: string): Promise<boolean> {
  const downloadId = `${surahNumber}_${reciterId}`;
  const reciterObj = RECITERS_LIST.find((r) => r.id === reciterId);

  try {
    const db = await getDB();

    // 1. Delete metadata
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_METADATA, 'readwrite');
      const store = tx.objectStore(STORE_METADATA);
      store.delete(downloadId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });

    // 2. Delete continuous audio URLs
    if (reciterObj) {
      const surahUrls = getSurahAudioUrlsWithFallbacks(reciterObj, surahNumber);
      for (const u of surahUrls) {
        blobUrlCache.delete(u);
        const tx = db.transaction(STORE_AUDIO, 'readwrite');
        tx.objectStore(STORE_AUDIO).delete(u);
        if ('caches' in window) {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.delete(u);
          } catch {}
        }
      }
    }

    // 3. Delete ayah files if folder existed
    if (reciterObj?.everyAyahFolder) {
      const sStr = String(surahNumber).padStart(3, '0');
      for (let ayah = 1; ayah <= 286; ayah++) {
        const aStr = String(ayah).padStart(3, '0');
        const audioUrl = `https://everyayah.com/data/${reciterObj.everyAyahFolder}/${sStr}${aStr}.mp3`;
        blobUrlCache.delete(audioUrl);
        const tx = db.transaction(STORE_AUDIO, 'readwrite');
        tx.objectStore(STORE_AUDIO).delete(audioUrl);
        if ('caches' in window) {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.delete(audioUrl);
          } catch {}
        }
      }
    }

    return true;
  } catch (err) {
    console.warn('Error deleting downloaded surah:', err);
    return false;
  }
}

/**
 * Pre-cache all Adhan audio files for 100% offline playback
 */
export async function precacheAllAdhans(onProgress?: (msg: string, pct: number) => void): Promise<boolean> {
  const adhanUrls = [
    // Makkah - Ali Mala
    'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Ali_Ibn_Ahmad_Mala_1_-_Al_Haram_Al_Maki_(%D8%B9%D9%84%D9%8A_%D8%A8%D9%86_%D8%A3%D8%AD%D9%85%D8%AF_%D9%85%D9%84%D8%A7_-_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D9%83%D9%8A).mp3',
    'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__01.athan.mp3',
    // Madinah
    'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Al_Haram_Al_Madani_-_Al_Madinah_1_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D8%AF%D9%86%D9%8A_-_%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9).mp3',
    'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__02.athan.mp3',
    // Abdelbasset
    'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Abdulbasit_Abdusamad_1_-_Egypt_(%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7_%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%B5%D9%85%D8%AF_-_%D9%85%D8%B5%D8%B1).mp3',
    'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__03.athan.mp3',
    // Mishary Alafasy
    'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Mishary_Rashid_Alafasy_1_-_Kuwait_(%D9%85%D8%B4%D8%A7%D8%B1%D9%8A_%D8%B1%D8%A7%D8%B4%D8%AF_%D8%A7%D9%84%D8%B9%D9%81%D8%A7%D8%B3%D9%8A_-_%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA).mp3',
    'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__04.athan.mp3',
    // Al-Aqsa
    'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Al_Aqsa_-_Jerusalem_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF_%D8%A7%D9%84%D8%A3%D9%82%D8%B5%D9%89_-_%D8%A7%D9%84%D9%82%D8%AF%D8%B3).mp3',
    // Fajr
    'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Fajr_Al_Haram_Al_Maki_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D9%81%D8%AC%D8%B1_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D9%83%D9%8A).mp3',
    'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__05.athan.mp3',
    'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Fajr_Adhan_by_Nasreddine_Toubar_(%D8%A7%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D9%81%D8%AC%D8%B1_%D8%A8%D8%B5%D9%88%D8%AA_%D9%86%D8%B5%D8%B1_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%B7%D9%88%D8%A8%D8%A7%D8%B1).mp3'
  ];

  let done = 0;
  for (const url of adhanUrls) {
    if (onProgress) {
      onProgress(`جاري حفظ صوت الأذان في الذاكرة (${done + 1}/${adhanUrls.length})...`, Math.round((done / adhanUrls.length) * 100));
    }
    await cacheAudioUrl(url);
    done++;
  }

  if (onProgress) {
    onProgress('تم حفظ جميع أصوات الأذان للعمل بدون إنترنت بنجاح!', 100);
  }
  return true;
}
