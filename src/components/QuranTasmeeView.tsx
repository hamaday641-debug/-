import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Mic, 
  MicOff, 
  RotateCcw, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Volume2, 
  BookOpen, 
  Check, 
  RefreshCw, 
  Award,
  Type,
  FileText,
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SURAHS_LIST } from '../data/surahs';
import { fetchSurahDetail } from '../services/quranApi';
import { Ayah } from '../types';
import { 
  evaluateFullTasmeeSession, 
  TasmeeSessionSummary, 
  normalizeQuranicText, 
  tokenizeWords 
} from '../services/quranTasmeeEngine';
import { useAudio } from '../context/AudioContext';

// Web Speech API interface definitions
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type TasmeePhase = 'ready' | 'recording' | 'finished';
type RecitationStyle = 'murattal' | 'mujawwad';

export const QuranTasmeeView: React.FC = () => {
  // State for Surah selection
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1); // Default Al-Fatihah
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(7);
  const [surahAyahs, setSurahAyahs] = useState<Ayah[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(false);

  // Recitation Phase: 'ready' -> 'recording' -> 'finished'
  const [phase, setPhase] = useState<TasmeePhase>('ready');

  // Recitation Style: 'murattal' (الترتيل وصحة الحفظ) vs 'mujawwad' (التجويد والمخارج)
  const [recitationStyle, setRecitationStyle] = useState<RecitationStyle>(() => {
    try {
      const saved = localStorage.getItem('tareeq_recitation_style');
      return (saved === 'mujawwad' || saved === 'murattal') ? saved : 'murattal';
    } catch {
      return 'murattal';
    }
  });

  const handleSetRecitationStyle = (style: RecitationStyle) => {
    setRecitationStyle(style);
    try {
      localStorage.setItem('tareeq_recitation_style', style);
    } catch {}
  };

  // Input Mode: 'voice' or 'text'
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Transcripts (captured in background without displaying during voice recording)
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [accumulatedSpokenText, setAccumulatedSpokenText] = useState<string>('');
  const [manualTextInput, setManualTextInput] = useState<string>('');

  // Results & Verification (Computed only when user finishes reciting)
  const [sessionSummary, setSessionSummary] = useState<TasmeeSessionSummary | null>(null);
  const [showOriginalMushaf, setShowOriginalMushaf] = useState<boolean>(false);
  const [showDetailedWordComparison, setShowDetailedWordComparison] = useState<boolean>(false);
  const [aiAuditReport, setAiAuditReport] = useState<string | null>(null);
  const [isAiAuditing, setIsAiAuditing] = useState<boolean>(false);

  // Recording Timer
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Playback
  const { playAyah, isPlaying, audioState } = useAudio();
  const [currentlyPlayingAyahNumber, setCurrentlyPlayingAyahNumber] = useState<number | null>(null);

  // Speech Recognition Ref
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);

  // Current selected Surah metadata
  const currentSurahMeta = useMemo(() => {
    return SURAHS_LIST.find(s => s.number === selectedSurahNumber) || SURAHS_LIST[0];
  }, [selectedSurahNumber]);

  // Active Ayahs to recite
  const targetAyahs = useMemo(() => {
    if (!surahAyahs.length) return [];
    return surahAyahs.filter(
      a => a.numberInSurah >= startAyah && a.numberInSurah <= endAyah
    );
  }, [surahAyahs, startAyah, endAyah]);

  // Fetch Surah Ayahs on Surah selection change
  useEffect(() => {
    let isMounted = true;
    const loadAyahs = async () => {
      setIsLoadingAyahs(true);
      try {
        const fullSurah = await fetchSurahDetail(selectedSurahNumber);
        if (isMounted && fullSurah && fullSurah.ayahs) {
          setSurahAyahs(fullSurah.ayahs);
          setStartAyah(1);
          setEndAyah(fullSurah.ayahs.length);
          handleResetSession();
        }
      } catch (err) {
        console.error("Failed to load surah ayahs:", err);
      } finally {
        if (isMounted) setIsLoadingAyahs(false);
      }
    };
    loadAyahs();
    return () => { isMounted = false; };
  }, [selectedSurahNumber]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("المتصفح لا يدعم التسميع الصوتي المباشر. يمكنك استخدام التسميع بالكتابة أو استخدام متصفح Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setSpeechError(null);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let finals = '';

      for (let i = 0; i < event.results.length; i++) {
        const part = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finals += part + ' ';
        } else {
          interim += part;
        }
      }

      setInterimTranscript(interim);
      if (finals) {
        setAccumulatedSpokenText(prev => (prev + ' ' + finals).trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        setSpeechError("الرجاء السماح بالوصول إلى الميكروفون للبدء في التسميع الصوتي.");
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
          isListeningRef.current = false;
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        isListeningRef.current = false;
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Timer while recording
  useEffect(() => {
    if (phase === 'recording') {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  // Start Recitation
  const handleStartRecitation = () => {
    setSpeechError(null);
    setInterimTranscript('');
    setAccumulatedSpokenText('');
    setManualTextInput('');
    setSessionSummary(null);
    setAiAuditReport(null);
    setPhase('recording');

    if (inputMode === 'voice') {
      if (recognitionRef.current) {
        try {
          isListeningRef.current = true;
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.warn("Could not start recognition:", e);
        }
      } else {
        setInputMode('text');
      }
    }
  };

  // Finish Recitation and Run Comprehensive Post-Recitation Evaluation
  const handleFinishRecitation = () => {
    // 1. Stop Speech
    if (recognitionRef.current) {
      isListeningRef.current = false;
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    }

    // 2. Prepare full text
    const fullText = inputMode === 'text' 
      ? manualTextInput.trim() 
      : (accumulatedSpokenText + ' ' + interimTranscript).trim();

    if (!fullText) {
      setSpeechError("لم يتم تسجيل أي كلمات. يرجى تكرار التسميع والتأكد من التحدث بوضوح.");
      setPhase('ready');
      return;
    }

    // 3. Evaluate full session at once
    const evaluation = evaluateFullTasmeeSession(
      targetAyahs,
      selectedSurahNumber,
      currentSurahMeta.name,
      fullText
    );

    setSessionSummary(evaluation);
    setPhase('finished');
  };

  // Reset current session
  const handleResetSession = () => {
    if (recognitionRef.current) {
      isListeningRef.current = false;
      try { recognitionRef.current.stop(); } catch(e) {}
      setIsListening(false);
    }
    setInterimTranscript('');
    setAccumulatedSpokenText('');
    setManualTextInput('');
    setSessionSummary(null);
    setAiAuditReport(null);
    setSpeechError(null);
    setPhase('ready');
  };

  // Trigger Advanced AI Quranic Recitation Audit
  const handleAiAudit = async () => {
    const fullText = inputMode === 'text' 
      ? manualTextInput.trim() 
      : (accumulatedSpokenText + ' ' + interimTranscript).trim();

    if (!targetAyahs.length || !fullText) return;

    setIsAiAuditing(true);
    setAiAuditReport(null);

    const expectedVersesText = targetAyahs.map(a => `(${a.numberInSurah}) ${a.text}`).join(' ');

    try {
      const response = await fetch('/api/ai/verify-recitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surahName: currentSurahMeta.name,
          ayahRange: `من ${startAyah} إلى ${endAyah}`,
          expectedVerses: expectedVersesText,
          userRecitation: fullText,
          recitationStyle: recitationStyle
        })
      });

      const data = await response.json();
      if (data.success && data.auditReport) {
        setAiAuditReport(data.auditReport);
      } else {
        setAiAuditReport("تعذر إتمام التحليل الذكي في الوقت الحالي. يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      console.error("AI Audit error:", err);
      setAiAuditReport("حدث خطأ أثناء الاتصال بخدمة التحليل القرآني.");
    } finally {
      setIsAiAuditing(false);
    }
  };

  // Play Ayah Audio
  const handlePlayAyahAudio = (ayahNumberInSurah: number) => {
    const target = surahAyahs.find(a => a.numberInSurah === ayahNumberInSurah);
    if (!target) return;
    setCurrentlyPlayingAyahNumber(ayahNumberInSurah);
    playAyah(target);
  };

  return (
    <div id="quran-tasmee-view" className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-32 font-sans">
      
      {/* 1. TOP HEADER & SETTINGS CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-7 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ركن التسميع الذاتي والتدقيق القرآني</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-arabic text-slate-900 dark:text-white">
              تسميع القرآن الكريم ومراجعة الحفظ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-arabic">
              تسميع هادئ ومريح: اقرأ بحرية دون مقاطعة، ولن يظهر أي نص يشتت ذهنك أثناء التلاوة، وعند الانتهاء ستظهر لك مواضع الخطأ فقط وتصويبها.
            </p>
          </div>

          {/* Mode Selector (Voice vs Text) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start md:self-auto border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { if (phase === 'ready') setInputMode('voice'); }}
              disabled={phase !== 'ready'}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                inputMode === 'voice'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>تسميع صوتي بالمايك</span>
            </button>
            <button
              onClick={() => { if (phase === 'ready') setInputMode('text'); }}
              disabled={phase !== 'ready'}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                inputMode === 'text'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>تسميع كتابي</span>
            </button>
          </div>
        </div>

        {/* 2. RECITATION STYLE SELECTOR (مجود أم مرتل) */}
        <div className="pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 font-arabic">
            اختر أسلوب ونمط التسميع:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Murattal Option */}
            <button
              type="button"
              onClick={() => { if (phase === 'ready') handleSetRecitationStyle('murattal'); }}
              disabled={phase !== 'ready'}
              className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-start gap-3 ${
                recitationStyle === 'murattal'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                recitationStyle === 'murattal' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-arabic">🎵 تسميع مُرتَّل (الترتيل وصحة الحفظ)</span>
                  {recitationStyle === 'murattal' && (
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">مُفعَّل</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-arabic">
                  التركيز على ضبط الحفظ، صحة الكلمات، تتابع الآيات وتثبيت المتشابهات.
                </p>
              </div>
            </button>

            {/* Mujawwad Option */}
            <button
              type="button"
              onClick={() => { if (phase === 'ready') handleSetRecitationStyle('mujawwad'); }}
              disabled={phase !== 'ready'}
              className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-start gap-3 ${
                recitationStyle === 'mujawwad'
                  ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 shadow-sm ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                recitationStyle === 'mujawwad' ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-arabic">💎 تسميع مُجوَّد (التجويد والإتقان)</span>
                  {recitationStyle === 'mujawwad' && (
                    <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">مُفعَّل</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-arabic">
                  تدقيق أحكام التجويد (المدود، الغنن، القلقلة، أحكام النون والميم) ومخارج الحروف.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Surah & Ayah Range Selector (Disabled while recording) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Surah Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 font-arabic">
              السورة المراد تسميعها:
            </label>
            <select
              value={selectedSurahNumber}
              disabled={phase !== 'ready'}
              onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold font-arabic text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            >
              {SURAHS_LIST.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
                </option>
              ))}
            </select>
          </div>

          {/* Start Ayah */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              من الآية:
            </label>
            <input
              type="number"
              min={1}
              max={surahAyahs.length || 1}
              value={startAyah}
              disabled={phase !== 'ready'}
              onChange={(e) => setStartAyah(Math.max(1, Math.min(Number(e.target.value), endAyah)))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            />
          </div>

          {/* End Ayah */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              إلى الآية:
            </label>
            <input
              type="number"
              min={startAyah}
              max={surahAyahs.length || 1}
              value={endAyah}
              disabled={phase !== 'ready'}
              onChange={(e) => setEndAyah(Math.min(surahAyahs.length || 1, Math.max(Number(e.target.value), startAyah)))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Quick Range Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">نطاق التسميع:</span>
            <button
              onClick={() => { if (phase === 'ready') { setStartAyah(1); setEndAyah(surahAyahs.length || 1); } }}
              disabled={phase !== 'ready'}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-50"
            >
              كامل السورة ({surahAyahs.length} آية)
            </button>
            {surahAyahs.length > 10 && (
              <button
                onClick={() => { if (phase === 'ready') { setStartAyah(1); setEndAyah(10); } }}
                disabled={phase !== 'ready'}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-50"
              >
                أول ١٠ آيات
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOriginalMushaf(!showOriginalMushaf)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showOriginalMushaf ? 'إخفاء النص الأصلي للمساعدة' : 'إظهار النص الأصلي للمراجعة'}</span>
            </button>

            <button
              onClick={handleResetSession}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          </div>
        </div>
      </div>

      {/* Helper Reference Box */}
      {showOriginalMushaf && (
        <div className="mb-6 p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>النص القرآني الأصلي للمراجعة قبل التسميع:</span>
            </span>
          </div>
          <div className="text-base sm:text-xl font-arabic leading-loose text-center py-2 px-4">
            {targetAyahs.map((a) => (
              <span key={a.numberInSurah} className="mx-1">
                {a.text} <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">﴿{a.numberInSurah}﴾</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Speech Error Notice */}
      {speechError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 1: READY STATE (قبل بدء التسميع) */}
      {/* ========================================================================= */}
      {phase === 'ready' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600">
            {inputMode === 'voice' ? <Mic className="w-10 h-10" /> : <Type className="w-10 h-10" />}
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              {recitationStyle === 'mujawwad' ? '💎 النمط المختار: تسميع مجوَّد' : '🎵 النمط المختار: تسميع مرتَّل'}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-arabic text-slate-900 dark:text-white">
              جاهز لتسميع سورة {currentSurahMeta.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-arabic leading-relaxed">
              المقطع المحدد: من الآية ({startAyah}) إلى الآية ({endAyah}) • إجمالي ({targetAyahs.length}) آيات.
            </p>
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-right space-y-1">
              <p className="font-bold">✨ راحة وطمأنينة تامة أثناء التسميع:</p>
              <p>• لن يتم كتابة أي نصوص على الشاشة أثناء تلاوتك لتسمع من حفظك الصادق دون تشتيت.</p>
              <p>• عند الانتهاء، اضغط «إنهاء التسميع» ليقوم النظام بإظهار مواضع الخطأ وتصويبها فقط.</p>
            </div>
          </div>

          <button
            id="btn-start-tasmee-session"
            onClick={handleStartRecitation}
            className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base font-arabic shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-3"
          >
            {inputMode === 'voice' ? <Mic className="w-5 h-5" /> : <Type className="w-5 h-5" />}
            <span>ابدأ التسميع الآن</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: RECORDING / RECITING IN PROGRESS (أثناء التسميع بحرية ودون كتابة نصوص) */}
      {/* ========================================================================= */}
      {phase === 'recording' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/50 shadow-xl p-6 sm:p-10 space-y-6 animate-in fade-in">
          {/* Active Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-sm font-arabic text-emerald-700 dark:text-emerald-300">
                {inputMode === 'voice' ? 'المايكروفون يستمع لتلاوتك الآن بكل هدوء...' : 'تسميع كتابي جارٍ...'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{formatTime(recordingSeconds)}</span>
            </div>
          </div>

          {/* Surah Scope & Style Reminder */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-xs">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 font-arabic">
              سورة {currentSurahMeta.name} • الآيات ({startAyah} - {endAyah})
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {recitationStyle === 'mujawwad' ? '💎 تسميع مجوَّد' : '🎵 تسميع مرتَّل'}
            </span>
          </div>

          {/* Tranquil Recording Visualizer (NO TEXT DISPLAYED AS REQUESTED BY USER) */}
          {inputMode === 'voice' ? (
            <div className="min-h-[220px] p-8 rounded-3xl bg-gradient-to-b from-emerald-50/30 via-slate-50 to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border border-emerald-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-5">
              
              {/* Pulsing Spiritual Audio Waveform / Mic Halo */}
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 animate-ping absolute" />
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 animate-pulse absolute" />
                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 z-10">
                  <Mic className="w-8 h-8 animate-bounce" />
                </div>
              </div>

              {/* Animated Peaceful Sound Wave Bars */}
              <div className="flex items-center justify-center gap-1.5 h-8">
                {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 65, 35].map((height, i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-500/70 dark:bg-emerald-400/80 rounded-full animate-pulse"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${i * 120}ms`,
                      animationDuration: '1.2s'
                    }}
                  />
                ))}
              </div>

              {/* Serene Guidance Note */}
              <div className="max-w-md space-y-1.5">
                <p className="text-sm font-bold font-arabic text-slate-800 dark:text-slate-100">
                  🌿 استمر في التسميع بسكينة وخشوع وتأنٍّ
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic leading-relaxed">
                  المايكروفون يلتقط تلاوتك في الخلفية بأمانة، ولن تظهر أي نصوص على الشاشة لتجنب التشتيت. عند انتهائك اضغط على زر الإنهاء بالأسفل.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">اكتب تلاوتك للآيات هنا:</label>
              <textarea
                rows={4}
                value={manualTextInput}
                onChange={(e) => setManualTextInput(e.target.value)}
                placeholder="اكتب الآيات الكريمة كما تحفظها..."
                className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-arabic text-base resize-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Action Buttons: Finish Recitation */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleResetSession}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              إلغاء التسميع
            </button>

            <button
              id="btn-finish-and-evaluate"
              onClick={handleFinishRecitation}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base font-arabic shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>إنهاء التسميع وعرض الأخطاء فقط 🎯</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 3: COMPLETED STATE (عرض مواضع الخطأ فقط والتصويب عند الانتهاء) */}
      {/* ========================================================================= */}
      {phase === 'finished' && sessionSummary && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Score Header Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 ${
            sessionSummary.accuracyScore >= 90
              ? 'bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 border-emerald-500/40 text-white'
              : sessionSummary.accuracyScore >= 70
              ? 'bg-gradient-to-br from-amber-900 via-slate-900 to-amber-950 border-amber-500/40 text-white'
              : 'bg-gradient-to-br from-rose-900 via-slate-900 to-rose-950 border-rose-500/40 text-white'
          }`}>
            <div className="space-y-2 text-center md:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>نتيجة ختام التسميع ({recitationStyle === 'mujawwad' ? 'مجوَّد 💎' : 'مرتَّل 🎵'})</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-arabic text-amber-100">
                {sessionSummary.mistakeHighlights.length === 0 ? 'ما شاء الله! حفظ متقن 100% بلا أي خطأ' :
                 sessionSummary.accuracyScore >= 85 ? 'تسميع جيد جداً، مع بعض مواضع الخطأ المحددة بالأسفل' :
                 'يرجى مراجعة مواضع الخطأ الموضحة وتثبيتها'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 font-arabic">
                سورة {sessionSummary.surahName} • من الآية ({sessionSummary.startAyah}) إلى ({sessionSummary.endAyah})
              </p>
            </div>

            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="text-center px-3">
                <span className="block text-3xl font-bold font-mono text-amber-300">{sessionSummary.accuracyScore}%</span>
                <span className="text-[11px] text-stone-400">نسبة الإتقان</span>
              </div>
              <div className="w-px h-10 bg-white/15" />
              <div className="text-center px-3">
                <span className={`block text-2xl font-bold font-mono ${sessionSummary.mistakeHighlights.length === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {sessionSummary.mistakeHighlights.length}
                </span>
                <span className="text-[11px] text-stone-400">مواضع الخطأ</span>
              </div>
              <div className="w-px h-10 bg-white/15" />
              <div className="text-center px-3">
                <span className="block text-2xl font-bold font-mono text-emerald-400">{sessionSummary.correctWordsCount}</span>
                <span className="text-[11px] text-stone-400">كلمات صحيحة</span>
              </div>
            </div>
          </div>

          {/* PRIMARY FOCUS: MISTAKES ONLY (مواضع الخطأ والتصحيح فقط كما طلب المستخدم تماماً) */}
          {sessionSummary.mistakeHighlights.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-rose-300 dark:border-rose-900/60 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 dark:border-rose-900/40 pb-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-lg font-arabic">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>مواضع الخطأ التي وقعت فيها وتصويبها ({sessionSummary.mistakeHighlights.length} أخطاء)</span>
                </div>
                <span className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-full font-bold">
                  تم استخراج الأخطاء فقط لتثبيت حفظها
                </span>
              </div>

              <div className="space-y-3">
                {sessionSummary.mistakeHighlights.map((m, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/25 border border-rose-200/80 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white font-arabic text-sm">
                        <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-mono">
                          {idx + 1}
                        </span>
                        <span>الآية رقم ({m.ayahNumber}):</span>
                      </div>
                      
                      <div className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm space-y-1 font-arabic">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">الخطأ المنطوق:</span>
                          <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                            {m.received || '(كلمة منسية / ساقطة)'} ❌
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">الصواب القرآني المعتمد:</span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            {m.expected} ✅
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayAyahAudio(m.ayahNumber)}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800 shrink-0 self-start sm:self-auto flex items-center gap-2 shadow-sm hover:bg-emerald-50 transition-all cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                      <span>استمع لصوت الآية الصحيحة</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-center space-y-3 shadow-sm">
              <Award className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold font-arabic">ما شاء الله تبارك الله! لا توجد أي أخطاء</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-md mx-auto leading-relaxed">
                لقد قرأت جميع آيات المقطع المحدد ({targetAyahs.length} آيات) بحفظ سليم وإتقان تام دون أي تبديل أو إسقاط لكلمات كتاب الله الكريم.
              </p>
            </div>
          )}

          {/* TAJWEED AUDIT NOTES (IF MUJAWWAD MODE) */}
          {recitationStyle === 'mujawwad' && (
            <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-3xl border border-amber-300 dark:border-amber-900/50 p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-base font-arabic">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>💎 إرشادات التجويد الخاصة بآيات سورة {sessionSummary.surahName}:</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-arabic leading-relaxed">
                في التسميع المجود، يُراعى ضبط مخارج الحروف كالراء والضاد والطاء، وإعطاء الغنة حقها بمقدار حركتين في النون والميم المشددتين، ومدود الحروف (المد المتصل ٤-٥ حركات، والمد المنفصل، ومد البدل والعارض للسكون)، وقلقلة حروف (ق، ط، ب، ج، د) عند السكون.
              </p>
            </div>
          )}

          {/* AI SCHOLAR AUDIT CARD */}
          <div className="bg-gradient-to-r from-[#102318] via-[#1B3524] to-[#0A160F] rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-[#274834]">
            <div className="space-y-1 text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-2 text-[#E5B869] text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>المحكّم القرآني الذكي ({recitationStyle === 'mujawwad' ? 'تحليل التجويد' : 'تحليل الحفظ'})</span>
              </div>
              <h3 className="text-lg font-bold font-arabic text-amber-100">
                تدقيق التسميع الشامل بالذكاء الاصطناعي
              </h3>
              <p className="text-xs text-stone-300 max-w-xl">
                احصل على تقرير تفسيري ونصائح عملية لتثبيت حفظ هذه الآيات وعدم الوقوع في المتشابهات {recitationStyle === 'mujawwad' ? 'مع تدقيق أحكام التجويد' : ''}.
              </p>
            </div>

            <button
              onClick={handleAiAudit}
              disabled={isAiAuditing}
              className="px-6 py-3 rounded-2xl bg-[#E5B869] hover:bg-[#D99A45] text-[#142E20] font-bold text-xs sm:text-sm shrink-0 flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isAiAuditing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جارٍ التحليل القرآني...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>طلب تقرير المحكّم الذكي</span>
                </>
              )}
            </button>
          </div>

          {aiAuditReport && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/50 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-lg font-arabic border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>تقرير المحكّم القرآني المعتمد:</span>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-arabic whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                {aiAuditReport}
              </div>
            </div>
          )}

          {/* OPTIONAL COLLAPSIBLE: FULL MUSHAF WORD-BY-WORD COMPARISON */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <button
              onClick={() => setShowDetailedWordComparison(!showDetailedWordComparison)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>عرض المقارنة التفصيلية لكافة كلمات المقطع في المصحف (اختياري)</span>
              </div>
              <span>{showDetailedWordComparison ? '▲ إخفاء' : '▼ إظهار'}</span>
            </button>

            {showDetailedWordComparison && (
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-end gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-700"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> صواب</span>
                  <span className="flex items-center gap-1 text-rose-700"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> خطأ</span>
                </div>

                <div className="space-y-4">
                  {sessionSummary.resultsByAyah.map((ayahRes) => (
                    <div 
                      key={ayahRes.ayahNumber}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200/50 dark:border-slate-700">
                        <span className="font-bold text-slate-500 font-arabic">الآية ({ayahRes.ayahNumber}):</span>
                        <button
                          onClick={() => handlePlayAyahAudio(ayahRes.ayahNumber)}
                          className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>استماع للآية</span>
                        </button>
                      </div>

                      <div className="text-xl sm:text-2xl font-arabic leading-loose flex flex-wrap items-center gap-x-2 gap-y-2 text-slate-800 dark:text-slate-100 py-1">
                        {ayahRes.words.map((w, wIdx) => {
                          if (w.status === 'correct') {
                            return (
                              <span 
                                key={wIdx}
                                className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-lg"
                              >
                                {w.originalWord}
                              </span>
                            );
                          } else if (w.status === 'wrong') {
                            return (
                              <span 
                                key={wIdx}
                                className="text-rose-700 dark:text-rose-300 font-bold bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-xl border border-rose-300"
                                title={`نطقت: ${w.userSpoken}`}
                              >
                                {w.originalWord}
                              </span>
                            );
                          } else {
                            return (
                              <span 
                                key={wIdx}
                                className="text-slate-400 line-through px-1"
                                title="كلمة منسية"
                              >
                                {w.originalWord}
                              </span>
                            );
                          }
                        })}
                        <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-mono font-bold">
                          {ayahRes.ayahNumber}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Bar: Retake session */}
          <div className="text-center pt-4">
            <button
              onClick={handleResetSession}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm font-arabic shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              تسميع مقطع آخر أو إعادة التسميع
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
