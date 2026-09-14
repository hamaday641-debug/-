import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Heart, 
  Lightbulb, 
  MapPin, 
  Info, 
  Copy, 
  Check, 
  Home,
  CheckCircle2,
  Calendar,
  Users
} from 'lucide-react';
import { PROPHETS_DATA } from '../data/prophets';

interface ProphetsStoriesViewProps {
  onGoHome?: () => void;
}

export const ProphetsStoriesView: React.FC<ProphetsStoriesViewProps> = ({ onGoHome }) => {
  const [selectedProphetId, setSelectedProphetId] = useState<string>(PROPHETS_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedDua, setCopiedDua] = useState(false);
  const [copiedStory, setCopiedStory] = useState(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [activeSubTab, setActiveSubTab] = useState<'story' | 'miracles' | 'dua' | 'lessons' | 'profile'>('story');

  const filteredProphets = useMemo(() => {
    if (!searchQuery.trim()) return PROPHETS_DATA;
    const q = searchQuery.toLowerCase().trim();
    return PROPHETS_DATA.filter(
      p => p.name.includes(q) || 
           p.title.includes(q) || 
           p.people.includes(q) || 
           p.place.includes(q) ||
           p.summary.includes(q)
    );
  }, [searchQuery]);

  const currentProphet = useMemo(() => {
    return PROPHETS_DATA.find(p => p.id === selectedProphetId) || PROPHETS_DATA[0];
  }, [selectedProphetId]);

  const currentProphetIndex = useMemo(() => {
    return PROPHETS_DATA.findIndex(p => p.id === currentProphet.id);
  }, [currentProphet]);

  const cleanProphetName = currentProphet.name.replace(/عليه\s*السلام/g, '').replace(/صلى\s*الله\s*عليه\s*وسلم/g, '').trim();

  const handleCopyDua = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedDua(true);
      setTimeout(() => setCopiedDua(false), 2000);
    });
  };

  const handleCopyFullStory = () => {
    const fullText = `قصة ${currentProphet.fullName}\n\n${currentProphet.summary}\n\n` +
      currentProphet.chapters.map(c => `${c.title}\n${c.content}`).join('\n\n') +
      `\n\nدعاء ${currentProphet.name}:\n${currentProphet.quranicDua.text}`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedStory(true);
      setTimeout(() => setCopiedStory(false), 2000);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-6 pb-28 font-cairo select-none">
      
      {/* Top Header Card with Back to Home button */}
      <div className="rounded-3xl bg-[#142E20] border border-[#274834] p-5 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[#E5B869] text-xs font-bold transition-colors"
                title="العودة للصفحة الرئيسية"
              >
                <Home className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5B869]/20 border border-[#E5B869]/40 text-[#E5B869] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>سير وقصص الأنبياء والمرسلين في القرآن الكريم</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-scheherazade text-amber-100">
            قصص الأنبياء عليهم الصلاة والسلام
          </h1>
          <p className="text-xs sm:text-sm text-[#A0B8A8] leading-relaxed">
            توثيق موثوق وشامل لسيرة ٢٥ نبياً ورسولاً مع فصول السيرة، المعجزات والآيات، الأدعية القرآنية، والدروس والعِبر المستفادة.
          </p>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="ابحث عن نبي، معجزة، مكان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-black/40 border border-[#E5B869]/40 text-white text-xs placeholder-stone-400 focus:outline-none focus:border-[#E5B869] font-arabic"
          />
          <Search className="w-4 h-4 text-[#E5B869] absolute left-3 top-3" />
        </div>
      </div>

      {/* Horizontal Multi-Line Prophets Selector Grid (2-3 Rows, fully visible without scrolling) */}
      <div className="p-3 sm:p-4 rounded-3xl bg-[#142E20]/90 border border-[#274834] shadow-lg space-y-2">
        <div className="flex items-center justify-between text-xs text-[#A0B8A8] font-bold px-1">
          <span className="flex items-center gap-1.5 text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
            <span>اختر النبي أو الرسول مباشرة ({filteredProphets.length}):</span>
          </span>
          <span className="text-[11px] text-stone-400">مرتبة حسب التسلسل الزمني</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-1.5 sm:gap-2">
          {filteredProphets.map((prophet, idx) => {
            const isSelected = prophet.id === selectedProphetId;
            return (
              <button
                key={prophet.id}
                onClick={() => {
                  setSelectedProphetId(prophet.id);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                id={`prophet-select-btn-${prophet.id}`}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#E5B869] text-[#142E20] shadow-md shadow-[#E5B869]/30 border border-[#E5B869] scale-[1.03] ring-2 ring-white/40 font-black'
                    : 'bg-[#182C1E] hover:bg-[#223A2A] text-stone-200 border border-[#2D4536] hover:border-[#E5B869]/60'
                }`}
                title={`نبي الله ${prophet.name}`}
              >
                <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[9px] font-mono shrink-0">
                  {idx + 1}
                </span>
                <span className="font-arabic truncate">{prophet.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Prophet Detailed Card */}
      <div className="rounded-3xl bg-white dark:bg-[#152419] border border-slate-200 dark:border-[#2D4536] shadow-xl overflow-hidden">
        
        {/* Prophet Summary Banner */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-[#E5B869]/10 via-[#1B3022]/10 to-transparent border-b border-slate-200 dark:border-[#2D4536] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E5B869]/20 text-[#D99A45] dark:text-[#E5B869] font-bold text-xs">
                نبي الله {currentProphet.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-stone-300">
                لقبه: <strong className="text-slate-800 dark:text-amber-100">{currentProphet.title}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-arabic text-[#1B3022] dark:text-[#E5B869]">
              {currentProphet.fullName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-300 font-arabic max-w-3xl leading-relaxed">
              {currentProphet.summary}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-[#1C2F22] border border-slate-200 dark:border-[#2D4536] text-center">
              <span className="text-[10px] text-slate-500 dark:text-stone-400 block">ذُكر بالقرآن</span>
              <span className="text-sm font-bold font-mono text-[#1B3022] dark:text-[#E5B869]">
                {currentProphet.mentionsInQuran} مرة
              </span>
            </div>
            <div className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-[#1C2F22] border border-slate-200 dark:border-[#2D4536] text-center">
              <span className="text-[10px] text-slate-500 dark:text-stone-400 block">القوم والرسالة</span>
              <span className="text-xs font-bold font-arabic text-[#1B3022] dark:text-stone-200">
                {currentProphet.people}
              </span>
            </div>
          </div>
        </div>

        {/* Subtabs Navigation Grid (5 organized tabs, fully visible without horizontal scrolling) */}
        <div className="p-2 sm:p-3 border-b border-slate-200 dark:border-[#2D4536] bg-slate-50 dark:bg-[#111C14]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveSubTab('story')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                activeSubTab === 'story'
                  ? 'bg-[#1B3022] text-[#E5B869] border border-[#E5B869] shadow'
                  : 'bg-white dark:bg-[#182C1E] text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-[#2D4536] hover:border-[#E5B869]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#E5B869] shrink-0" />
              <span className="truncate">السيرة والتفاصيل</span>
            </button>

            <button
              onClick={() => setActiveSubTab('miracles')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                activeSubTab === 'miracles'
                  ? 'bg-[#1B3022] text-[#E5B869] border border-[#E5B869] shadow'
                  : 'bg-white dark:bg-[#182C1E] text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-[#2D4536] hover:border-[#E5B869]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#E5B869] shrink-0" />
              <span className="truncate">المعجزات والآيات</span>
            </button>

            <button
              onClick={() => setActiveSubTab('dua')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                activeSubTab === 'dua'
                  ? 'bg-[#1B3022] text-[#E5B869] border border-[#E5B869] shadow'
                  : 'bg-white dark:bg-[#182C1E] text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-[#2D4536] hover:border-[#E5B869]'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate">دعاء النبي بالقرآن</span>
            </button>

            <button
              onClick={() => setActiveSubTab('lessons')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                activeSubTab === 'lessons'
                  ? 'bg-[#1B3022] text-[#E5B869] border border-[#E5B869] shadow'
                  : 'bg-white dark:bg-[#182C1E] text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-[#2D4536] hover:border-[#E5B869]'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">الدروس والعِبر</span>
            </button>

            <button
              onClick={() => setActiveSubTab('profile')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                activeSubTab === 'profile'
                  ? 'bg-[#1B3022] text-[#E5B869] border border-[#E5B869] shadow'
                  : 'bg-white dark:bg-[#182C1E] text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-[#2D4536] hover:border-[#E5B869]'
              }`}
            >
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">بطاقة التعريف والرسالة</span>
            </button>
          </div>
        </div>

        {/* SUBTAB 1: STORY NARRATIVE */}
        {activeSubTab === 'story' && (
          <div className="p-4 sm:p-7 space-y-6">
            
            {/* Top Toolbar (Font Size & Copy Full Story) */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#2D4536]">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-[#E5B869]" />
                <span>مكان الدعوة: <strong>{currentProphet.place}</strong></span>
                <span>•</span>
                <span>العصر: <strong>{currentProphet.era}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyFullStory}
                  className="flex items-center gap-1 px-3 py-1 text-xs rounded-xl bg-slate-100 dark:bg-[#1A2C20] hover:bg-slate-200 dark:hover:bg-[#253D2D] text-slate-700 dark:text-stone-200 transition-colors"
                >
                  {copiedStory ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStory ? 'تم النسخ' : 'نسخ القصة'}</span>
                </button>

                <div className="flex items-center bg-white dark:bg-[#121E16] rounded-xl border border-slate-200 dark:border-[#2D4536] p-0.5">
                  <button
                    onClick={() => setFontSize(Math.min(26, fontSize + 1))}
                    className="px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-[#203627] rounded-lg font-bold font-mono text-slate-700 dark:text-stone-200"
                    title="تكبير الخط"
                  >
                    A+
                  </button>
                  <span className="px-1.5 text-xs font-mono text-slate-600 dark:text-stone-300">{fontSize}</span>
                  <button
                    onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                    className="px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-[#203627] rounded-lg font-bold font-mono text-slate-700 dark:text-stone-200"
                    title="تصغير الخط"
                  >
                    A-
                  </button>
                </div>
              </div>
            </div>

            {/* Continuous Story Article */}
            <article 
              className="space-y-6 select-text"
              style={{ fontSize: `${fontSize}px`, lineHeight: 2.2 }}
            >
              {/* Ornate Opening Bismillah */}
              <div className="text-center my-4 py-2 border-b border-emerald-500/20">
                <span className="font-scheherazade text-2xl sm:text-3xl font-bold text-[#1B3022] dark:text-[#E5B869] tracking-wide">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
              </div>

              {/* Narrative Chapters */}
              {currentProphet.chapters.map((chapter, cIdx) => (
                <section 
                  key={cIdx} 
                  className="space-y-3 p-4 rounded-2xl bg-slate-50/60 dark:bg-[#1A2C20]/40 border border-slate-200/80 dark:border-[#2D4536]/60 hover:border-[#E5B869]/50 transition-colors"
                >
                  <h3 className="font-bold text-lg sm:text-xl font-scheherazade text-[#1B3022] dark:text-amber-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E5B869]"></span>
                    <span>{chapter.title}</span>
                  </h3>
                  {chapter.quranVerse && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 dark:bg-[#E5B869]/10 border border-amber-500/25 dark:border-[#E5B869]/25 text-center space-y-1">
                      <p className="font-quran text-base sm:text-lg text-amber-900 dark:text-amber-200 leading-loose">
                        ﴿ {chapter.quranVerse} ﴾
                      </p>
                      {chapter.quranVerseRef && (
                        <span className="inline-block text-[11px] sm:text-xs font-bold text-amber-800 dark:text-[#E5B869] bg-amber-500/10 dark:bg-black/30 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          سورة {chapter.quranVerseRef}
                        </span>
                      )}
                    </div>
                  )}
                  {chapter.sunnah && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>من السنة النبوية المطهرة:</span>
                      </span>
                      <p className="leading-relaxed font-arabic">{chapter.sunnah}</p>
                    </div>
                  )}
                  <p className="text-slate-800 dark:text-stone-200 text-justify font-arabic">
                    {chapter.content}
                  </p>
                </section>
              ))}
            </article>
          </div>
        )}

        {/* SUBTAB 2: MIRACLES */}
        {activeSubTab === 'miracles' && (
          <div className="p-4 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-[#1B3022] dark:text-[#E5B869] font-bold text-base font-arabic">
              <Sparkles className="w-4 h-4 text-[#E5B869]" />
              <span>المعجزات والآيات الكبرى التي أيد الله بها نبيّه {currentProphet.name}:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentProphet.miracles.map((miracle, mIdx) => (
                <div 
                  key={mIdx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2C20]/50 border border-slate-200 dark:border-[#2D4536] space-y-2 hover:border-[#E5B869]/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#E5B869]/20 text-[#D99A45] dark:text-[#E5B869] flex items-center justify-center text-xs font-bold font-mono">
                      {mIdx + 1}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-amber-100 font-arabic">
                      معجزة ربانية
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-300 font-arabic leading-relaxed">
                    {miracle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 3: DUA */}
        {activeSubTab === 'dua' && (
          <div className="p-4 sm:p-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#142E20] to-[#0A1A11] border border-[#2D4536] text-white shadow-xl space-y-4 text-center">
              <span className="px-3 py-1 rounded-full bg-[#E5B869]/20 text-[#E5B869] text-xs font-bold">
                من دعاء {currentProphet.name} في القرآن الكريم
              </span>

              <p className="font-quran text-xl sm:text-2xl text-amber-100 leading-loose py-2 select-text">
                ﴿ {currentProphet.quranicDua.text} ﴾
              </p>

              <div className="flex items-center justify-center gap-3 text-xs text-[#A0B8A8]">
                <span>سورة {currentProphet.quranicDua.surah}</span>
                <span>•</span>
                <span>آية رقم {currentProphet.quranicDua.ayahNumber}</span>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => handleCopyDua(currentProphet.quranicDua.text)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E5B869] text-[#142E20] text-xs font-bold shadow-md hover:bg-[#D99A45] transition-all"
                >
                  {copiedDua ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedDua ? 'تم نسخ الدعاء' : 'نسخ نص الدعاء'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2C20]/40 border border-slate-200 dark:border-[#2D4536] space-y-1">
              <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-amber-100 font-arabic">
                فضل ومناسبة هذا الدعاء:
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-300 font-arabic leading-relaxed">
                {currentProphet.quranicDua.explanation}
              </p>
            </div>
          </div>
        )}

        {/* SUBTAB 4: LESSONS */}
        {activeSubTab === 'lessons' && (
          <div className="p-4 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-[#1B3022] dark:text-[#E5B869] font-bold text-base font-arabic">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>الدروس والعِبر المستفادة من سيرة {currentProphet.name}:</span>
            </div>

            <div className="space-y-2.5">
              {currentProphet.lessons.map((lesson, lIdx) => (
                <div 
                  key={lIdx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1A2C20]/40 border border-slate-200 dark:border-[#2D4536] flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-[#E5B869]/20 text-[#D99A45] dark:text-[#E5B869] flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5">
                    {lIdx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-stone-200 font-arabic leading-relaxed">
                    {lesson}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 5: PROFILE & INFO */}
        {activeSubTab === 'profile' && (
          <div className="p-4 sm:p-7 space-y-5">
            <div className="flex items-center gap-2 text-[#1B3022] dark:text-[#E5B869] font-bold text-base font-arabic">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>بطاقة التعريف والتوثيق النبوي: {currentProphet.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2C20]/40 border border-slate-200 dark:border-[#2D4536] space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>الاسم الكامل والنسب</span>
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-amber-100 font-arabic">
                  {currentProphet.fullName}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2C20]/40 border border-slate-200 dark:border-[#2D4536] space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>اللقب والصفة</span>
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-amber-100 font-arabic">
                  {currentProphet.title}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2C20]/40 border border-slate-200 dark:border-[#2D4536] space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400 font-bold">
                  <Users className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>القوم المبعوث إليهم</span>
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-amber-100 font-arabic">
                  {currentProphet.people}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2C20]/40 border border-slate-200 dark:border-[#2D4536] space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>موطن ومكان الدعوة</span>
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-amber-100 font-arabic">
                  {currentProphet.place}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2C20]/40 border border-slate-200 dark:border-[#2D4536] space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>الحقبة والعصر التاريخي</span>
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-amber-100 font-arabic">
                  {currentProphet.era}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2C20]/40 border border-slate-200 dark:border-[#2D4536] space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400 font-bold">
                  <BookOpen className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>عدد مرات الذكر في القرآن</span>
                </div>
                <p className="font-bold text-sm text-[#1B3022] dark:text-[#E5B869] font-mono">
                  {currentProphet.mentionsInQuran} مرة
                </p>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#1A2C20]/30 border border-slate-200 dark:border-[#2D4536] space-y-2">
              <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-amber-100 font-arabic">
                خلاصة الرسالة النبوية:
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-stone-300 font-arabic leading-relaxed">
                {currentProphet.summary}
              </p>
            </div>
          </div>
        )}

        {/* Prophet Bottom Navigation (Next / Prev Prophet) */}
        <div className="p-4 bg-slate-50 dark:bg-[#111C14] border-t border-slate-200 dark:border-[#2D4536] flex items-center justify-between">
          <button
            disabled={currentProphetIndex <= 0}
            onClick={() => {
              const prev = PROPHETS_DATA[currentProphetIndex - 1];
              if (prev) {
                setSelectedProphetId(prev.id);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#1B3022] text-slate-800 dark:text-stone-200 text-xs font-bold disabled:opacity-30 transition-colors"
          >
            <span>النبي السابق</span>
          </button>

          <span className="text-xs text-slate-500 dark:text-stone-400 font-mono">
            {currentProphetIndex + 1} / {PROPHETS_DATA.length}
          </span>

          <button
            disabled={currentProphetIndex >= PROPHETS_DATA.length - 1}
            onClick={() => {
              const next = PROPHETS_DATA[currentProphetIndex + 1];
              if (next) {
                setSelectedProphetId(next.id);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#1B3022] text-slate-800 dark:text-stone-200 text-xs font-bold disabled:opacity-30 transition-colors"
          >
            <span>النبي التالي</span>
          </button>
        </div>

      </div>

    </div>
  );
};

