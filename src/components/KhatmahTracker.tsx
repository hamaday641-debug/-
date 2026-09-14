import React, { useState, useEffect } from 'react';
import { 
  BookMarked, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Clock, 
  Flame, 
  Award, 
  Sliders, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  RefreshCw, 
  Plus, 
  Share2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Check
} from 'lucide-react';
import { KhatmahPlan, WirdType } from '../types';
import { SURAHS_LIST, JUZ_NAMES } from '../data/surahs';
import { toArabicNumerals } from '../services/quranApi';

interface KhatmahTrackerProps {
  onGoToReadingPage: (page: number, fromKhatmah?: boolean) => void;
}

const DEFAULT_PLAN: KhatmahPlan = {
  id: 'khatmah_default',
  title: 'ختمة القرآن الكريم',
  wirdType: 'juz',
  wirdLabel: 'جزء واحد يومياً (ختمة شهرية)',
  dailyPages: 20,
  startPage: 1,
  currentPage: 1,
  startDate: new Date().toISOString(),
  targetDays: 30,
  streakDays: 1,
  todayCompleted: false,
  history: []
};

export const DUAA_KHATM_ALQURAN = [
  "اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً.",
  "اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ وَارْزُقْنِي تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ العَالَمِينَ.",
  "اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ وَاجْعَلِ المَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.",
  "اللَّهُمَّ اجْعَلْ خَيْرَ عُمْرِي آخِرَهُ وَخَيْرَ عَمَلِي خَوَاتِمَهُ وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ.",
  "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِيشَةً هَنِيَّةً وَمِيتَةً سَوِيَّةً وَمَرَدّاً غَيْرَ مُخْزٍ وَلاَ فَاضِحٍ.",
  "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ المَسْأَلَةِ وَخَيْرَ الدُّعَاءِ وَخَيْرَ النَّجَاحِ وَخَيْرَ العِلْمِ وَخَيْرَ العَمَلِ وَخَيْرَ الثَّوَابِ وَخَيْرَ الحَيَاةِ وَخَيْرَ المَمَاتِ وَثَبِّتْنِي وَثَقِّلْ مَوَازِينِي وَحَقِّقْ إِيمَانِي وَارْفَعْ دَرَجَتِي وَتَقَبَّلْ صَلاَتِي وَاغْفِرْ خَطِيئَاتِي وَأَسْأَلُكَ العُلَا مِنَ الجَنَّةِ."
];

export const KhatmahTracker: React.FC<KhatmahTrackerProps> = ({ onGoToReadingPage }) => {
  // Load saved active Khatmah
  const [plan, setPlan] = useState<KhatmahPlan>(() => {
    try {
      const saved = localStorage.getItem('nour_khatmah_plan');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if day rolled over
        const todayStr = new Date().toISOString().split('T')[0];
        if (parsed.lastReadDate !== todayStr) {
          parsed.todayCompleted = false;
        }
        return parsed;
      }
      return DEFAULT_PLAN;
    } catch {
      return DEFAULT_PLAN;
    }
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDuaaModal, setShowDuaaModal] = useState(false);
  const [showManualPageModal, setShowManualPageModal] = useState(false);
  const [manualPageInput, setManualPageInput] = useState(String(plan.currentPage));
  const [customPagesInput, setCustomPagesInput] = useState(String(plan.dailyPages || 20));
  const [customDaysInput, setCustomDaysInput] = useState(String(plan.targetDays || 30));
  const [copiedDuaa, setCopiedDuaa] = useState(false);

  // Save changes to localStorage & broadcast event
  const savePlan = (newPlan: KhatmahPlan) => {
    setPlan(newPlan);
    try {
      localStorage.setItem('nour_khatmah_plan', JSON.stringify(newPlan));
      window.dispatchEvent(new CustomEvent('khatmah_updated', { detail: newPlan }));
    } catch {
      // ignore
    }
  };

  // Keep plan in sync with Quran Reading View auto-save in real time
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('nour_khatmah_plan');
        if (saved) {
          const parsed = JSON.parse(saved);
          setPlan(parsed);
          setManualPageInput(String(parsed.currentPage));
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('khatmah_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('khatmah_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Determine current Juz and page details
  const totalPages = 604;
  const completedPages = Math.min(totalPages, Math.max(0, plan.currentPage - 1));
  const progressPercent = Math.min(100, Math.round((completedPages / totalPages) * 100));

  // Determine current Juz from current page
  const currentJuz = Math.min(30, Math.max(1, Math.ceil(plan.currentPage / 20.2)));
  const currentHizb = Math.min(60, Math.max(1, Math.ceil(plan.currentPage / 10.1)));

  // Calculate today's target range
  const todayStartPage = plan.currentPage;
  const todayEndPage = Math.min(604, plan.currentPage + plan.dailyPages - 1);
  const pagesLeft = Math.max(0, totalPages - plan.currentPage + 1);
  const daysLeft = Math.ceil(pagesLeft / (plan.dailyPages || 1));

  // Find nearest Surah around current page
  const currentSurah = SURAHS_LIST.find((s, idx) => {
    const nextS = SURAHS_LIST[idx + 1];
    if (nextS) {
      return plan.currentPage >= s.pageStart && plan.currentPage < nextS.pageStart;
    }
    return plan.currentPage >= s.pageStart;
  }) || SURAHS_LIST[0];

  // Mark today's wird as completed
  const handleMarkTodayCompleted = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newCurrentPage = Math.min(604, plan.currentPage + plan.dailyPages);
    const isFinished = newCurrentPage >= 604;

    const newHistory = [
      {
        date: todayStr,
        pagesRead: plan.dailyPages,
        fromPage: plan.currentPage,
        toPage: Math.min(604, todayEndPage)
      },
      ...(plan.history || [])
    ];

    const updatedPlan: KhatmahPlan = {
      ...plan,
      currentPage: newCurrentPage,
      todayCompleted: true,
      lastReadDate: todayStr,
      streakDays: plan.lastReadDate === todayStr ? plan.streakDays : plan.streakDays + 1,
      completedAt: isFinished ? new Date().toISOString() : undefined,
      history: newHistory.slice(0, 60)
    };

    savePlan(updatedPlan);

    if (isFinished) {
      setShowDuaaModal(true);
    }
  };

  // Quick preset apply
  const handleApplyPreset = (type: WirdType, label: string, pages: number, targetDays: number) => {
    const updated: KhatmahPlan = {
      ...plan,
      wirdType: type,
      wirdLabel: label,
      dailyPages: pages,
      targetDays: targetDays
    };
    savePlan(updated);
    setShowConfigModal(false);
  };

  // Start fresh Khatmah
  const handleResetKhatmah = () => {
    if (window.confirm('هل تود بدء ختمة جديدة من الصفحة الأولى؟')) {
      const fresh: KhatmahPlan = {
        ...plan,
        id: `khatmah_${Date.now()}`,
        startPage: 1,
        currentPage: 1,
        startDate: new Date().toISOString(),
        todayCompleted: false,
        completedAt: undefined
      };
      savePlan(fresh);
      setShowDuaaModal(false);
    }
  };

  // Update current page manually (e.g. read from physical Mushaf)
  const handleSaveManualPage = () => {
    const p = parseInt(manualPageInput);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      savePlan({
        ...plan,
        currentPage: p
      });
      setShowManualPageModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-6 pb-28">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1B3022] via-[#233F2E] to-[#142419] border border-[#2D4536] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#142419]/80 border border-[#3D5A47] text-[#E9B161] text-xs font-semibold mb-3">
            <BookMarked className="w-3.5 h-3.5" />
            <span>الورد اليومي وخطة الختم المبارك</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-scheherazade leading-tight mb-2">
            ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
          </h2>
          <p className="text-xs sm:text-sm text-[#A8BCAD] leading-relaxed">
            قال رسول الله ﷺ: «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ تَعَالَى أَدْوَمُهَا وَإِنْ قَلَّ». حدد وردك اليومي وثابر على تلاوة كتاب الله حتى الختم.
          </p>
        </div>

        <div className="absolute left-6 -bottom-10 opacity-10 text-9xl font-scheherazade text-[#E9B161] select-none pointer-events-none hidden sm:block">
          ختمة
        </div>
      </div>

      {/* Main Today's Assigned Wird Action Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1B3022]/40 border-2 border-[#E9B161]/40 dark:border-[#3D5A47] shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#E9B161]/20 text-[#C2822B] dark:text-[#E9B161] text-xs font-bold font-mono">
                {plan.wirdLabel}
              </span>
              <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD]">
                • معدل {plan.dailyPages} صفحة / اليوم
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#1B3022] dark:text-white font-scheherazade">
              ورد اليوم: من صفحة <strong className="text-[#C2822B] dark:text-[#E9B161] font-mono">{toArabicNumerals(todayStartPage)}</strong> إلى صفحة <strong className="text-[#C2822B] dark:text-[#E9B161] font-mono">{toArabicNumerals(todayEndPage)}</strong>
            </h3>

            <p className="text-xs sm:text-sm text-[#55695C] dark:text-[#A8BCAD]">
              موضعك الحالي: <strong className="text-[#1B3022] dark:text-white font-bold">سورة {currentSurah.name}</strong> • {JUZ_NAMES[currentJuz - 1]} (الحزب {currentHizb})
            </p>

            {/* Auto-save notification badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>الحفظ التلقائي مفعّل: يتم تحديث موضع الختمة تلقائياً مع كل صفحة تقرأها في المصحف.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full md:w-auto">
            {/* Direct Jump to Reading View */}
            <button
              onClick={() => onGoToReadingPage(plan.currentPage, true)}
              id="start-today-wird-btn"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1B3022] hover:bg-[#233F2E] text-[#E9B161] font-bold text-sm shadow-md border border-[#3D5A47] transition-all hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              <span>اقرأ ورد اليوم الآن (صـ {plan.currentPage})</span>
            </button>

            {/* Mark Completed Toggle */}
            <button
              onClick={handleMarkTodayCompleted}
              disabled={plan.todayCompleted || plan.currentPage >= 604}
              id="complete-today-wird-btn"
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                plan.todayCompleted
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] shadow-md hover:scale-[1.02]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{plan.todayCompleted ? 'تم إنجاز ورد اليوم بفضل الله ✓' : 'تسجيل إتمام ورد اليوم'}</span>
            </button>
          </div>
        </div>

        {/* Quick controls bar under card */}
        <div className="mt-6 pt-4 border-t border-[#2D4536]/10 dark:border-[#2D4536] flex flex-wrap items-center justify-between gap-3 text-xs text-[#55695C] dark:text-[#A8BCAD]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-600 dark:text-[#E9B161] font-bold">
              <Flame className="w-4 h-4 fill-current" />
              <span>الالتزام المتتالي: {plan.streakDays} أيام</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setManualPageInput(String(plan.currentPage));
                setShowManualPageModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F3F5F4] dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#3D5A47] hover:text-[#1B3022] dark:hover:text-white font-semibold transition-colors"
            >
              تعديل رقم الصفحة الحالية
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1B3022]/10 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#3D5A47] text-[#1B3022] dark:text-[#E9B161] font-semibold hover:bg-[#1B3022]/20 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>تغيير خطة الورد (حزب / جزء / مخصص)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Completion Percentage */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD] font-semibold">نسبة الختمة</span>
            <TrendingUp className="w-4 h-4 text-[#E9B161]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1B3022] dark:text-[#E9B161]">
            {progressPercent}%
          </div>
          <div className="w-full bg-[#142419]/10 dark:bg-[#142419] h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-l from-[#E9B161] to-[#C2822B] h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Stat 2: Pages completed */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD] font-semibold">الصفحات المنجزة</span>
            <BookOpen className="w-4 h-4 text-[#E9B161]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1B3022] dark:text-white">
            {completedPages} <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD] font-normal">/ 604</span>
          </div>
          <span className="text-[11px] text-[#7A8C80] dark:text-[#A8BCAD] mt-1 block">
            متبقي {pagesLeft} صفحة
          </span>
        </div>

        {/* Stat 3: Juz Count */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD] font-semibold">الأجزاء المكتملة</span>
            <Award className="w-4 h-4 text-[#E9B161]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1B3022] dark:text-white">
            {Math.max(0, currentJuz - 1)} <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD] font-normal">/ 30</span>
          </div>
          <span className="text-[11px] text-[#7A8C80] dark:text-[#A8BCAD] mt-1 block">
            تقرأ في الجزء {currentJuz}
          </span>
        </div>

        {/* Stat 4: Estimated days remaining */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD] font-semibold">الأيام المتبقية للختم</span>
            <Calendar className="w-4 h-4 text-[#E9B161]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#C2822B] dark:text-[#E9B161]">
            ~{daysLeft} <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD] font-normal">يوم</span>
          </div>
          <span className="text-[11px] text-[#7A8C80] dark:text-[#A8BCAD] mt-1 block">
            بمعدل {plan.dailyPages} صفحة يومياً
          </span>
        </div>
      </div>

      {/* 30 Juz Visual Progress Grid */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm sm:text-base text-[#1B3022] dark:text-white">
            خريطة أجزاء القرآن الكريم (30 جزء)
          </h4>
          <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD]">
            اضغط على أي جزء للانتقال لصفحته
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((jNum) => {
            const juzStartPage = (jNum - 1) * 20 + 2;
            const validPage = jNum === 1 ? 1 : Math.min(604, juzStartPage);
            const isDone = plan.currentPage > validPage + 19;
            const isCurrent = currentJuz === jNum;

            return (
              <button
                key={jNum}
                onClick={() => onGoToReadingPage(validPage, true)}
                className={`py-2 px-1 rounded-xl text-center border transition-all text-xs flex flex-col items-center justify-center gap-1 ${
                  isDone
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : isCurrent
                    ? 'bg-[#E9B161] text-[#1B3022] font-bold border-[#E9B161] ring-2 ring-[#E9B161]/50 shadow-md'
                    : 'bg-[#1B3022]/5 dark:bg-[#142419] text-[#55695C] dark:text-[#A8BCAD] border-[#2D4536]/20 dark:border-[#2D4536] hover:border-[#E9B161]'
                }`}
                title={`الجزء ${jNum} (يبدأ من صفحة ${validPage})`}
              >
                <span className="font-bold text-[11px]">جـ {jNum}</span>
                {isDone ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : (
                  <span className="text-[9px] font-mono opacity-80">ص {validPage}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duaa Khatm Al-Quran Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1B3022] to-[#233F2E] border border-[#3D5A47] text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142419] text-[#E9B161] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>دعاء مبارك</span>
          </div>
          <h4 className="text-xl font-bold font-scheherazade text-white">
            دعاء ختم القرآن الكريم
          </h4>
          <p className="text-xs text-[#A8BCAD] mt-1">
            اقرأ الأدعية الجامعة المأثورة عند إتمام الختمة المباركة أو في ختام وردك.
          </p>
        </div>

        <button
          onClick={() => setShowDuaaModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] font-bold text-xs shadow-md transition-all shrink-0"
        >
          قراءة دعاء الختم
        </button>
      </div>

      {/* MODAL: Configure Wird Plan (حزب / جزء / مخصص) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-xl rounded-3xl bg-[#1B3022] border border-[#3D5A47] p-6 text-white shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2D4536] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#E9B161]" />
                <h3 className="font-bold text-base text-white">تحديد وتخصيص الورد اليومي</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-[#A8BCAD] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A8BCAD]">
              اختر الخطة المناسبة لوقتك وقدرتك على التلاوة، وسيتم ضبط وردك اليومي وحساب مدة الختم تلقائياً:
            </p>

            {/* Popular Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: 1 Juz (30 days) */}
              <button
                onClick={() => handleApplyPreset('juz', 'جزء واحد يومياً (ختمة شهرية)', 20, 30)}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                  plan.wirdType === 'juz'
                    ? 'bg-[#E9B161]/20 border-[#E9B161] shadow-md'
                    : 'bg-[#142419] border-[#2D4536] hover:border-[#E9B161]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm text-[#E9B161]">جزء واحد يومياً</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1B3022] text-[#A8BCAD]">30 يوماً</span>
                </div>
                <p className="text-[11px] text-[#A8BCAD]">معدل ~20 صفحة يومياً (الختمة الشهرية المعتادة)</p>
              </button>

              {/* Option 2: 1 Hizb (60 days) */}
              <button
                onClick={() => handleApplyPreset('hizb', 'حزب واحد يومياً (60 يوماً)', 10, 60)}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                  plan.wirdType === 'hizb'
                    ? 'bg-[#E9B161]/20 border-[#E9B161] shadow-md'
                    : 'bg-[#142419] border-[#2D4536] hover:border-[#E9B161]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm text-[#E9B161]">حزب واحد يومياً</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1B3022] text-[#A8BCAD]">60 يوماً</span>
                </div>
                <p className="text-[11px] text-[#A8BCAD]">معدل ~10 صفحات يومياً (توازن رائع ومريح)</p>
              </button>

              {/* Option 3: 2 Hizbs (1 Juz / 30 days) */}
              <button
                onClick={() => handleApplyPreset('two_hizbs', 'حزبان يومياً (30 يوماً)', 20, 30)}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                  plan.wirdType === 'two_hizbs'
                    ? 'bg-[#E9B161]/20 border-[#E9B161] shadow-md'
                    : 'bg-[#142419] border-[#2D4536] hover:border-[#E9B161]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm text-[#E9B161]">حزبان يومياً</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1B3022] text-[#A8BCAD]">30 يوماً</span>
                </div>
                <p className="text-[11px] text-[#A8BCAD]">حزب صباحاً وحزب مساءً (~20 صفحة يومياً)</p>
              </button>

              {/* Option 4: 2 Juz (15 days) */}
              <button
                onClick={() => handleApplyPreset('two_juz', 'جزآن يومياً (15 يوماً)', 40, 15)}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                  plan.wirdType === 'two_juz'
                    ? 'bg-[#E9B161]/20 border-[#E9B161] shadow-md'
                    : 'bg-[#142419] border-[#2D4536] hover:border-[#E9B161]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm text-[#E9B161]">جزآن يومياً</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1B3022] text-[#A8BCAD]">15 يوماً</span>
                </div>
                <p className="text-[11px] text-[#A8BCAD]">معدل ~40 صفحة يومياً (للمواسم والهمم العالية)</p>
              </button>

              {/* Option 5: Half Hizb (120 days) */}
              <button
                onClick={() => handleApplyPreset('half_hizb', 'نصف حزب يومياً (4 أشهر)', 5, 120)}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                  plan.wirdType === 'half_hizb'
                    ? 'bg-[#E9B161]/20 border-[#E9B161] shadow-md'
                    : 'bg-[#142419] border-[#2D4536] hover:border-[#E9B161]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm text-[#E9B161]">نصف حزب يومياً (ربعان)</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1B3022] text-[#A8BCAD]">120 يوماً</span>
                </div>
                <p className="text-[11px] text-[#A8BCAD]">معدل ~5 صفحات يومياً (تدرج يسير بدون انقطاع)</p>
              </button>
            </div>

            {/* Custom Pages Setup Form */}
            <div className="p-4 rounded-2xl bg-[#142419] border border-[#2D4536] space-y-3">
              <h4 className="font-bold text-xs text-[#E9B161]">أو خصص عدد الصفحات اليومية بنفسك:</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customPagesInput}
                  onChange={(e) => setCustomPagesInput(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl bg-[#1B3022] border border-[#3D5A47] text-white font-mono text-center font-bold text-sm focus:outline-none"
                />
                <span className="text-xs text-[#A8BCAD]">صفحة يومياً</span>
                <button
                  onClick={() => {
                    const p = parseInt(customPagesInput);
                    if (!isNaN(p) && p >= 1 && p <= 100) {
                      const days = Math.ceil(604 / p);
                      handleApplyPreset('custom_pages', `مخصص (${p} صفحات يومياً)`, p, days);
                    }
                  }}
                  className="mr-auto px-4 py-2 rounded-xl bg-[#E9B161] text-[#1B3022] font-bold text-xs hover:bg-[#dfa755]"
                >
                  تطبيق التخصيص
                </button>
              </div>
            </div>

            {/* Start Fresh Khatmah Button */}
            <div className="pt-2 border-t border-[#2D4536] flex items-center justify-between">
              <button
                onClick={handleResetKhatmah}
                className="text-xs text-red-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة ضبط وبدء ختمة جديدة من صـ 1</span>
              </button>
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2 rounded-xl bg-[#2D4536] hover:bg-[#3D5A47] text-white text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Manual Page Editor (e.g. read from physical Mushaf) */}
      {showManualPageModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md rounded-3xl bg-[#1B3022] border border-[#3D5A47] p-6 text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2D4536] pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#E9B161]" />
                <h3 className="font-bold text-base text-white">تعديل موضعك الحالي في الختمة</h3>
              </div>
              <button
                onClick={() => setShowManualPageModal(false)}
                className="p-1 rounded-lg text-[#A8BCAD] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A8BCAD]">
              إذا كنت تقرأ في مصحفك الورقي الخاص، يمكنك كتابة رقم الصفحة التي وصلت إليها لمزامنة تقدم الختمة:
            </p>

            <div className="space-y-2">
              <label className="text-xs text-[#E9B161] font-bold block">رقم الصفحة الحالية (1 - 604):</label>
              <input
                type="number"
                min="1"
                max="604"
                value={manualPageInput}
                onChange={(e) => setManualPageInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#142419] border border-[#3D5A47] text-white font-mono text-center text-lg font-bold focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2D4536]">
              <button
                onClick={() => setShowManualPageModal(false)}
                className="px-4 py-2 rounded-xl bg-[#142419] text-[#A8BCAD] text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveManualPage}
                className="px-5 py-2 rounded-xl bg-[#E9B161] text-[#1B3022] font-bold text-xs hover:bg-[#dfa755]"
              >
                حفظ الموضع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Duaa Khatm Al-Quran */}
      {showDuaaModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-2xl rounded-3xl bg-[#1B3022] border-2 border-[#E9B161]/60 p-6 sm:p-8 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2 border-b border-[#2D4536] pb-4">
              <div className="inline-flex p-3 rounded-full bg-[#E9B161]/20 text-[#E9B161] mb-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-scheherazade text-[#E9B161]">
                دعاء ختم القرآن الكريم المبارك
              </h3>
              <p className="text-xs text-[#A8BCAD]">
                تقبل الله طاعتكم وختمتكم وجعل القرآن العظيم ربيع قلوبكم ونور صدوركم
              </p>
            </div>

            {/* Duaa Paragraphs */}
            <div className="space-y-4 text-center font-scheherazade text-lg sm:text-xl leading-loose text-[#F0F5F1] px-2 sm:px-6">
              {DUAA_KHATM_ALQURAN.map((para, i) => (
                <p key={i} className="p-3 rounded-2xl bg-[#142419]/70 border border-[#2D4536]">
                  {para}
                </p>
              ))}
            </div>

            {/* Modal actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#2D4536]">
              <button
                onClick={() => {
                  const fullText = DUAA_KHATM_ALQURAN.join('\n\n');
                  navigator.clipboard.writeText(fullText).then(() => {
                    setCopiedDuaa(true);
                    setTimeout(() => setCopiedDuaa(false), 2000);
                  });
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#142419] border border-[#3D5A47] text-[#E9B161] hover:bg-[#2D4536] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                {copiedDuaa ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedDuaa ? 'تم نسخ الدعاء' : 'نسخ الدعاء للمشاركة'}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleResetKhatmah}
                  className="px-4 py-2.5 rounded-xl bg-[#E9B161] text-[#1B3022] font-bold text-xs hover:bg-[#dfa755]"
                >
                  بدء ختمة جديدة مباركة
                </button>
                <button
                  onClick={() => setShowDuaaModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#2D4536] text-white text-xs font-semibold"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
