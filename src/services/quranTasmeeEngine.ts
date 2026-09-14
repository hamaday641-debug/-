// High-Precision Quranic Recitation & Memorization Verification Engine
// Implements zero-error comparison between recited/spoken words and authentic Quranic Text.

import { Ayah } from '../types';

export interface RecitedWordToken {
  word: string;
  rawSpoken: string;
  status: 'correct' | 'wrong' | 'missing' | 'extra';
  expectedWord?: string;
  ayahNumber?: number;
  wordIndexInAyah?: number;
}

export interface AyahVerificationResult {
  ayahNumber: number;
  originalTextWithTashkeel: string;
  originalTextClean: string;
  words: {
    originalWord: string;
    normalizedWord: string;
    status: 'correct' | 'wrong' | 'missing';
    userSpoken?: string;
    correctionNote?: string;
  }[];
  isComplete: boolean;
  accuracyPercentage: number;
  mistakesCount: number;
}

export interface TasmeeSessionSummary {
  surahNumber: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
  totalAyahs: number;
  completedAyahs: number;
  totalWords: number;
  correctWordsCount: number;
  wrongWordsCount: number;
  missingWordsCount: number;
  extraWordsCount: number;
  accuracyScore: number; // 0 - 100%
  resultsByAyah: AyahVerificationResult[];
  mistakeHighlights: {
    ayahNumber: number;
    expected: string;
    received: string;
    type: 'wrong_word' | 'missing_word' | 'extra_word' | 'skipped_ayah';
    suggestion: string;
  }[];
}

// 1. Arabic Text Normalization Utility for Authentic Quranic Alignment
export function normalizeQuranicText(text: string): string {
  if (!text) return '';
  return text
    // Remove Quranic Waqf & Sajda Symbols (U+06D6 to U+06ED, etc.)
    .replace(/[\u06D6-\u06ED\u0610-\u061A\uFD3E\uFD3F\u060C\u061B\u061F]/g, '')
    // Remove Tashkeel / Harakat (Fatha, Damma, Kasra, Sukoon, Shaddah, Tanween, etc.)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alif forms (أ, إ, آ, ٱ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Taa Marbuta & Haa (ة -> ه)
    .replace(/ة/g, 'ه')
    // Normalize Yaa & Alif Maqsura (ى -> ي)
    .replace(/ى/g, 'ي')
    // Remove Tatweel / Kashida (ـ)
    .replace(/ـ/g, '')
    // Normalize Persian/Urdu variants (ك -> ك, etc.)
    .replace(/[\u06A9\u06AA]/g, 'ك')
    .replace(/[\u06CC]/g, 'ي')
    // Remove punctuation, numbers, brackets, quotes
    .replace(/[0-9٠-٩\-.,!?:;"'«»()[\]{}—_]/g, ' ')
    // Normalize multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// 2. Extract Individual Clean Words
export function tokenizeWords(text: string): string[] {
  const normalized = normalizeQuranicText(text);
  if (!normalized) return [];
  return normalized.split(' ').filter(w => w.length > 0);
}

// 3. String Similarity (Levenshtein Distance) for slight phonetic/voice recognition tolerance
function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, () => Array(an + 1).fill(0));

  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (b.charAt(j - 1) === a.charAt(i - 1)) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

// Check if two Arabic words match exactly or within speech recognition phonetic tolerance
export function isWordMatch(recitedWord: string, originalWord: string): boolean {
  const normRecited = normalizeQuranicText(recitedWord);
  const normOriginal = normalizeQuranicText(originalWord);

  if (normRecited === normOriginal) return true;

  // Handle common Arabic speech-to-text prefix variations (e.g., و/ف/ب/ل attachments)
  if (normRecited.startsWith('و') && normRecited.slice(1) === normOriginal) return true;
  if (normOriginal.startsWith('و') && normOriginal.slice(1) === normRecited) return true;
  if (normRecited.startsWith('ف') && normRecited.slice(1) === normOriginal) return true;
  if (normOriginal.startsWith('ف') && normOriginal.slice(1) === normRecited) return true;

  // Very close phonetic tolerance for long words (1 char difference in length >= 5)
  if (normOriginal.length >= 5 && normRecited.length >= 5) {
    const dist = levenshteinDistance(normRecited, normOriginal);
    if (dist <= 1) return true;
  }

  return false;
}

// 4. Verify Single Ayah Recitation
export function verifySingleAyah(
  ayah: Ayah,
  recitedText: string
): AyahVerificationResult {
  const originalWordsWithTashkeel = ayah.text.split(/\s+/).filter(w => w.trim().length > 0);
  const originalCleanTokens = originalWordsWithTashkeel.map(w => normalizeQuranicText(w));
  const recitedTokens = tokenizeWords(recitedText);

  let matchIndex = 0;
  let correctCount = 0;
  let mistakesCount = 0;

  const wordsResult = originalWordsWithTashkeel.map((origWithTashkeel, idx) => {
    const origNorm = originalCleanTokens[idx];
    
    // Check if the user has spoken up to this word
    if (matchIndex < recitedTokens.length) {
      const currentRecited = recitedTokens[matchIndex];

      // Exact or phonetic match
      if (isWordMatch(currentRecited, origNorm)) {
        matchIndex++;
        correctCount++;
        return {
          originalWord: origWithTashkeel,
          normalizedWord: origNorm,
          status: 'correct' as const,
          userSpoken: currentRecited
        };
      }

      // Check if user skipped this word and matched the next one
      if (idx + 1 < originalCleanTokens.length && isWordMatch(currentRecited, originalCleanTokens[idx + 1])) {
        mistakesCount++;
        return {
          originalWord: origWithTashkeel,
          normalizedWord: origNorm,
          status: 'missing' as const,
          correctionNote: 'كلمة ناقصة سقطت من التلاوة'
        };
      }

      // Otherwise it's a mismatch / wrong word
      matchIndex++;
      mistakesCount++;
      return {
        originalWord: origWithTashkeel,
        normalizedWord: origNorm,
        status: 'wrong' as const,
        userSpoken: currentRecited,
        correctionNote: `نطقت "${currentRecited}" والصواب القرآني هو "${origWithTashkeel}"`
      };
    }

    // User hasn't recited this word yet
    return {
      originalWord: origWithTashkeel,
      normalizedWord: origNorm,
      status: 'missing' as const,
      correctionNote: 'لم تُتلَ بعد'
    };
  });

  const totalWords = originalCleanTokens.length;
  const isComplete = matchIndex >= totalWords && mistakesCount === 0;
  const accuracyPercentage = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;

  return {
    ayahNumber: ayah.numberInSurah,
    originalTextWithTashkeel: ayah.text,
    originalTextClean: normalizeQuranicText(ayah.text),
    words: wordsResult,
    isComplete,
    accuracyPercentage,
    mistakesCount
  };
}

// 5. Full Session Quranic Recitation Verification (Multi-Ayah)
export function evaluateFullTasmeeSession(
  ayahsToRecite: Ayah[],
  surahNumber: number,
  surahName: string,
  fullRecitedSpeech: string
): TasmeeSessionSummary {
  const recitedWords = tokenizeWords(fullRecitedSpeech);
  let globalRecitedWordPointer = 0;

  const resultsByAyah: AyahVerificationResult[] = [];
  const mistakeHighlights: TasmeeSessionSummary['mistakeHighlights'] = [];

  let totalWordsInSelection = 0;
  let totalCorrectWords = 0;
  let totalWrongWords = 0;
  let totalMissingWords = 0;

  for (const ayah of ayahsToRecite) {
    const rawAyahWords = ayah.text.split(/\s+/).filter(w => w.trim().length > 0);
    const origAyahTokens = rawAyahWords.map(w => normalizeQuranicText(w));
    totalWordsInSelection += origAyahTokens.length;

    let ayahCorrect = 0;
    let ayahMistakes = 0;

    const wordsStatus = rawAyahWords.map((origWithTashkeel, wordIdx) => {
      const expectedClean = origAyahTokens[wordIdx];

      if (globalRecitedWordPointer < recitedWords.length) {
        const spokenWord = recitedWords[globalRecitedWordPointer];

        if (isWordMatch(spokenWord, expectedClean)) {
          globalRecitedWordPointer++;
          totalCorrectWords++;
          ayahCorrect++;
          return {
            originalWord: origWithTashkeel,
            normalizedWord: expectedClean,
            status: 'correct' as const,
            userSpoken: spokenWord
          };
        }

        // Lookahead to check if the speaker skipped current word
        if (
          wordIdx + 1 < origAyahTokens.length &&
          isWordMatch(spokenWord, origAyahTokens[wordIdx + 1])
        ) {
          totalMissingWords++;
          ayahMistakes++;
          mistakeHighlights.push({
            ayahNumber: ayah.numberInSurah,
            expected: origWithTashkeel,
            received: '(كلمة منسية / ساقطة)',
            type: 'missing_word',
            suggestion: `نسيت كلمة "${origWithTashkeel}" في الآية ${ayah.numberInSurah}`
          });
          return {
            originalWord: origWithTashkeel,
            normalizedWord: expectedClean,
            status: 'missing' as const,
            correctionNote: 'كلمة ساقطة من التلاوة'
          };
        }

        // Wrong word
        globalRecitedWordPointer++;
        totalWrongWords++;
        ayahMistakes++;
        mistakeHighlights.push({
          ayahNumber: ayah.numberInSurah,
          expected: origWithTashkeel,
          received: spokenWord,
          type: 'wrong_word',
          suggestion: `قرأت "${spokenWord}" والصواب في المصحف: "${origWithTashkeel}"`
        });

        return {
          originalWord: origWithTashkeel,
          normalizedWord: expectedClean,
          status: 'wrong' as const,
          userSpoken: spokenWord,
          correctionNote: `الخطأ: "${spokenWord}" ❌ | الصواب: "${origWithTashkeel}" ✅`
        };
      }

      // Word not reached yet
      totalMissingWords++;
      return {
        originalWord: origWithTashkeel,
        normalizedWord: expectedClean,
        status: 'missing' as const,
        correctionNote: 'لم تُتلَ'
      };
    });

    const isAyahFinished = ayahCorrect === origAyahTokens.length && ayahMistakes === 0;
    const ayahAccuracy = origAyahTokens.length > 0 ? Math.round((ayahCorrect / origAyahTokens.length) * 100) : 0;

    resultsByAyah.push({
      ayahNumber: ayah.numberInSurah,
      originalTextWithTashkeel: ayah.text,
      originalTextClean: normalizeQuranicText(ayah.text),
      words: wordsStatus,
      isComplete: isAyahFinished,
      accuracyPercentage: ayahAccuracy,
      mistakesCount: ayahMistakes
    });
  }

  // Check extra words at the end
  const extraWordsCount = Math.max(0, recitedWords.length - globalRecitedWordPointer);
  if (extraWordsCount > 0) {
    const extraTokens = recitedWords.slice(globalRecitedWordPointer);
    mistakeHighlights.push({
      ayahNumber: ayahsToRecite[ayahsToRecite.length - 1]?.numberInSurah || 1,
      expected: '(نهاية الآيات المحددة)',
      received: extraTokens.join(' '),
      type: 'extra_word',
      suggestion: `كلمات زائدة بعد الآيات: "${extraTokens.join(' ')}"`
    });
  }

  const completedAyahs = resultsByAyah.filter(r => r.isComplete).length;
  const overallAccuracy = totalWordsInSelection > 0 
    ? Math.max(0, Math.round(((totalCorrectWords) / totalWordsInSelection) * 100))
    : 0;

  return {
    surahNumber,
    surahName,
    startAyah: ayahsToRecite[0]?.numberInSurah || 1,
    endAyah: ayahsToRecite[ayahsToRecite.length - 1]?.numberInSurah || 1,
    totalAyahs: ayahsToRecite.length,
    completedAyahs,
    totalWords: totalWordsInSelection,
    correctWordsCount: totalCorrectWords,
    wrongWordsCount: totalWrongWords,
    missingWordsCount: totalMissingWords,
    extraWordsCount,
    accuracyScore: overallAccuracy,
    resultsByAyah,
    mistakeHighlights
  };
}
