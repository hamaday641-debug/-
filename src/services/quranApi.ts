import { Ayah, SurahDetail, SearchResultItem, QuranPageData } from '../types';
import { SURAHS_LIST } from '../data/surahs';

// In-memory cache for ultra-fast instant lookups and offline capability
const surahCache = new Map<number, SurahDetail>();
const tafsirCache = new Map<string, string>();

/**
 * Normalizes Arabic text by removing Harakat (Tashkeel) and normalizing Alef/Yaa/Ta-Marbuta
 * Used for high-precision search.
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove Quranic pauses, sajda marks, end ayah symbols, and special Quranic unicode marks
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    // Normalize Alefs (أ إ آ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Yaa (ى -> ي)
    .replace(/ى/g, 'ي')
    // Normalize Taa Marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Normalize Tanween / Shadda
    .replace(/[\u0640]/g, '') // tatweel
    .trim();
}

/**
 * Formats Quranic numbers to Eastern Arabic numerals (١, ٢, ٣, ...)
 */
export function toArabicNumerals(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
}

/**
 * Standard Basmalah text for visual separation
 */
export const BASMALAH_TEXT = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

/**
 * Extracts and visually separates the Basmalah prefix from Surah Ayah 1
 * without modifying or altering the authentic source text.
 */
export function separateBasmalahFromAyah(text: string, surahNum: number, ayahNum: number): { hasBasmalahPrefix: boolean; cleanText: string } {
  if (surahNum === 1 || surahNum === 9 || ayahNum !== 1) {
    return { hasBasmalahPrefix: false, cleanText: text };
  }

  // Check if text begins with Basmalah variation
  const basmalahPatterns = [
    /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u,
    /^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/u,
    /^بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\s*/u,
    /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u,
    /^بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ\s*/u
  ];

  for (const pattern of basmalahPatterns) {
    if (pattern.test(text)) {
      const stripped = text.replace(pattern, '').trim();
      return {
        hasBasmalahPrefix: true,
        cleanText: stripped.length > 0 ? stripped : text
      };
    }
  }

  return { hasBasmalahPrefix: false, cleanText: text };
}

/**
 * Fetches the full text and metadata of a Surah using verified Uthmani edition from api.alquran.cloud
 * Features robust caching in memory and localStorage for instant offline access.
 */
export async function fetchSurahDetail(surahNumber: number): Promise<SurahDetail> {
  // Check in-memory cache
  if (surahCache.has(surahNumber)) {
    return surahCache.get(surahNumber)!;
  }

  // Check localStorage cache
  const storageKey = `nour_surah_uthmani_${surahNumber}`;
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed: SurahDetail = JSON.parse(cached);
      surahCache.set(surahNumber, parsed);
      return parsed;
    }
  } catch {
    // localStorage unavailable or full, continue
  }

  // Fetch from verified endpoint (quran-uthmani)
  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.code === 200 && data.data) {
      const surahData = data.data;
      const meta = SURAHS_LIST.find((s) => s.number === surahNumber);

      const detail: SurahDetail = {
        number: surahData.number,
        name: surahData.name || meta?.name || `سورة ${surahNumber}`,
        englishName: surahData.englishName || meta?.englishName || '',
        englishNameTranslation: surahData.englishNameTranslation || meta?.englishNameTranslation || '',
        revelationType: (surahData.revelationType || meta?.revelationType || 'Meccan') as any,
        numberOfAyahs: surahData.numberOfAyahs || surahData.ayahs.length,
        ayahs: surahData.ayahs.map((a: any) => ({
          number: a.number,
          numberInSurah: a.numberInSurah,
          text: a.text,
          juz: a.juz,
          manzil: a.manzil,
          page: a.page,
          ruku: a.ruku,
          hizbQuarter: a.hizbQuarter,
          sajda: a.sajda
        }))
      };

      // Save to memory cache & localStorage
      surahCache.set(surahNumber, detail);
      try {
        localStorage.setItem(storageKey, JSON.stringify(detail));
      } catch {
        // storage overflow safe ignore
      }

      return detail;
    } else {
      throw new Error(data.status || 'فشل تحميل بيانات السورة');
    }
  } catch (err: any) {
    // Secondary fallback: AlQuran Cloud alternative edition
    try {
      const fallbackUrl = `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`;
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      if (fallbackData.code === 200 && fallbackData.data) {
        const d = fallbackData.data;
        const meta = SURAHS_LIST.find((s) => s.number === surahNumber);
        const detail: SurahDetail = {
          number: d.number,
          name: d.name || meta?.name || `سورة ${surahNumber}`,
          englishName: d.englishName || meta?.englishName || '',
          englishNameTranslation: d.englishNameTranslation || meta?.englishNameTranslation || '',
          revelationType: (d.revelationType || meta?.revelationType || 'Meccan') as any,
          numberOfAyahs: d.numberOfAyahs || d.ayahs.length,
          ayahs: d.ayahs.map((a: any) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
            juz: a.juz,
            manzil: a.manzil,
            page: a.page,
            ruku: a.ruku,
            hizbQuarter: a.hizbQuarter,
            sajda: a.sajda
          }))
        };
        surahCache.set(surahNumber, detail);
        return detail;
      }
    } catch {
      // ignore
    }
    throw new Error('تعذر تحميل النص القرآني، يرجى التحقق من اتصالك بالإنترنت.');
  }
}

/**
 * Fetches authentic Tafsir for a specific Ayah from reputable Tafsir editions
 * (e.g. ar.muyassar, ar.jalalayn)
 */
export async function fetchAyahTafsir(
  surahNumber: number,
  ayahNumberInSurah: number,
  tafsirEdition = 'ar.muyassar'
): Promise<string> {
  const cacheKey = `${tafsirEdition}_${surahNumber}_${ayahNumberInSurah}`;
  if (tafsirCache.has(cacheKey)) {
    return tafsirCache.get(cacheKey)!;
  }

  const storageKey = `nour_tafsir_${cacheKey}`;
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      tafsirCache.set(cacheKey, cached);
      return cached;
    }
  } catch {
    // continue
  }

  try {
    const url = `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumberInSurah}/${tafsirEdition}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code === 200 && data.data && data.data.text) {
      const text = data.data.text;
      tafsirCache.set(cacheKey, text);
      try {
        localStorage.setItem(storageKey, text);
      } catch {
        // ignore
      }
      return text;
    }
    throw new Error('تفسير غير متوفر');
  } catch (err) {
    console.warn(`Error fetching tafsir for ${cacheKey}:`, err);
    return 'لم يتوفر التفسير في الوقت الحالي، يرجى التحقق من الاتصال بالشبكة.';
  }
}

/**
 * Searches across Surah names for quick navigation
 */
export function searchSurahs(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const normalized = normalizeArabic(trimmed);
  return SURAHS_LIST.filter((s) => {
    const normName = normalizeArabic(s.name);
    const normEnglish = s.englishName.toLowerCase();
    const qLower = trimmed.toLowerCase();
    return (
      normName.includes(normalized) ||
      normEnglish.includes(qLower) ||
      String(s.number) === trimmed ||
      String(s.pageStart) === trimmed
    );
  });
}

/**
 * Searches across Quran text for a given query with normalized Arabic matching
 */
export async function searchQuran(query: string): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const normalizedQuery = normalizeArabic(trimmed);

  try {
    // 1. Try search on non-vocalized Arabic text (edition: 'ar') for maximum fuzzy match coverage
    const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(trimmed)}/all/ar`);
    const data = await res.json();
    if (data.code === 200 && data.data && Array.isArray(data.data.matches) && data.data.matches.length > 0) {
      return data.data.matches.slice(0, 60).map((m: any) => ({
        surahNumber: m.surah.number,
        surahName: m.surah.name ? m.surah.name.replace(/^سُورَةُ\s*/, '') : `سورة ${m.surah.number}`,
        ayahNumberInSurah: m.numberInSurah,
        text: m.text
      }));
    }
  } catch (e) {
    console.warn('API simple search failed, trying fallback edition', e);
  }

  try {
    // 2. Try search with uthmani edition
    const res2 = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(trimmed)}/all/ar.uthmani`);
    const data2 = await res2.json();
    if (data2.code === 200 && data2.data && Array.isArray(data2.data.matches) && data2.data.matches.length > 0) {
      return data2.data.matches.slice(0, 60).map((m: any) => ({
        surahNumber: m.surah.number,
        surahName: m.surah.name ? m.surah.name.replace(/^سُورَةُ\s*/, '') : `سورة ${m.surah.number}`,
        ayahNumberInSurah: m.numberInSurah,
        text: m.text
      }));
    }
  } catch (e2) {
    console.warn('API uthmani search failed, checking memory cache', e2);
  }

  // 3. Fallback: search in loaded cached surahs
  const results: SearchResultItem[] = [];
  for (const [surahNum, detail] of surahCache.entries()) {
    for (const ayah of detail.ayahs) {
      const normText = normalizeArabic(ayah.text);
      if (normText.includes(normalizedQuery)) {
        results.push({
          surahNumber: surahNum,
          surahName: detail.name.replace(/^سُورَةُ\s*/, ''),
          ayahNumberInSurah: ayah.numberInSurah,
          text: ayah.text
        });
        if (results.length >= 60) break;
      }
    }
    if (results.length >= 60) break;
  }

  return results;
}

const pageCache = new Map<number, QuranPageData>();

/**
 * Fetches an entire Mushaf page (1..604) in authentic Uthmani script
 */
export async function fetchQuranPage(pageNumber: number): Promise<QuranPageData> {
  const page = Math.max(1, Math.min(604, pageNumber));
  
  if (pageCache.has(page)) {
    return pageCache.get(page)!;
  }

  const storageKey = `nour_mushaf_page_${page}`;
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed: QuranPageData = JSON.parse(cached);
      pageCache.set(page, parsed);
      return parsed;
    }
  } catch {
    // continue
  }

  const url = `https://api.alquran.cloud/v1/page/${page}/quran-uthmani`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    if (data.code === 200 && data.data && Array.isArray(data.data.ayahs)) {
      const ayahs = data.data.ayahs;
      const surahNamesSet = new Set<string>();
      ayahs.forEach((a: any) => {
        if (a.surah?.name) surahNamesSet.add(a.surah.name.replace(/^سُورَةُ\s*/, ''));
      });

      const pageData: QuranPageData = {
        pageNumber: page,
        ayahs,
        juz: ayahs[0]?.juz || 1,
        surahNames: Array.from(surahNamesSet)
      };

      pageCache.set(page, pageData);
      try {
        localStorage.setItem(storageKey, JSON.stringify(pageData));
      } catch {
        // ignore
      }

      return pageData;
    }
    throw new Error('فشل تحميل الصفحة');
  } catch (err) {
    throw new Error('تعذر تحميل صفحة المصحف، يرجى التأكد من اتصال الإنترنت.');
  }
}

export const searchInQuran = searchQuran;

