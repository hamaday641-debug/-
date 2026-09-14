import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Search, 
  Volume2, 
  Info, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Zap, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  Bookmark, 
  Share2,
  Check
} from 'lucide-react';
import { TAJWEED_CATEGORIES, TajweedCategory, TajweedSubRule } from '../data/tajweedData';
import { QURAN_SIGNS_LIST, QuranSignItem } from '../data/quranSignsData';

export const TajweedGuideView: React.FC = () => {
  const [mainTab, setMainTab] = useState<'tajweed' | 'quran_signs'>('tajweed');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(TAJWEED_CATEGORIES[0].id);
  const [selectedRuleId, setSelectedRuleId] = useState<string>(TAJWEED_CATEGORIES[0].rules[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [signsCategoryFilter, setSignsCategoryFilter] = useState<'all' | 'waqf' | 'dabt' | 'sajda_hizb' | 'special_recitation'>('all');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Filtered Quran Signs
  const filteredSigns = useMemo(() => {
    return QURAN_SIGNS_LIST.filter(sign => {
      const matchesCategory = signsCategoryFilter === 'all' || sign.category === signsCategoryFilter;
      const matchesSearch = !searchQuery.trim() || 
        sign.name.includes(searchQuery.trim()) || 
        sign.symbol.includes(searchQuery.trim()) ||
        sign.meaning.includes(searchQuery.trim()) ||
        sign.ruleDescription.includes(searchQuery.trim());
      return matchesCategory && matchesSearch;
    });
  }, [signsCategoryFilter, searchQuery]);

  const currentCategory = useMemo(() => {
    return TAJWEED_CATEGORIES.find(c => c.id === selectedCategoryId) || TAJWEED_CATEGORIES[0];
  }, [selectedCategoryId]);

  const currentRule = useMemo(() => {
    return currentCategory.rules.find(r => r.id === selectedRuleId) || currentCategory.rules[0];
  }, [currentCategory, selectedRuleId]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div id="tajweed-guide-view" className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 pb-28 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>دليل التلاوة المتقنة وأحكام التجويد ورسم المصحف</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-arabic">
              أحكام التجويد وعلامات المصحف الشريف
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/80 max-w-2xl leading-relaxed">
              تعلّم قواعد وأحكام تجويد القرآن الكريم خطوة بخطوة مع الشواهد والأمثلة الملونة، وتعرف على معاني جميع علامات الوقف والضبط والرسم العثماني.
            </p>
          </div>

          {/* Main Mode Switch */}
          <div className="flex items-center bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 self-start md:self-auto">
            <button
              id="tab-tajweed-rules"
              onClick={() => setMainTab('tajweed')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mainTab === 'tajweed'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              أحكام التجويد
            </button>
            <button
              id="tab-quran-signs"
              onClick={() => setMainTab('quran_signs')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mainTab === 'quran_signs'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              شرح علامات المصحف
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: TAJWEED RULES CURRICULUM */}
      {mainTab === 'tajweed' && (
        <div className="space-y-6">
          
          {/* Category Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {TAJWEED_CATEGORIES.map((category) => {
              const isSelected = category.id === currentCategory.id;
              return (
                <button
                  key={category.id}
                  id={`tajweed-category-${category.id}`}
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setSelectedRuleId(category.rules[0].id);
                  }}
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>{category.title}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Layout: Rules List & Active Rule Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Sub-Rules Sidebar */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-2">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1 mb-2">
                الأحكام المندرجة تحت هذا الباب ({currentCategory.rules.length})
              </div>

              {currentCategory.rules.map((rule) => {
                const isSelected = rule.id === currentRule.id;
                return (
                  <button
                    key={rule.id}
                    id={`tajweed-rule-${rule.id}`}
                    onClick={() => setSelectedRuleId(rule.id)}
                    className={`w-full text-right p-3.5 rounded-xl transition-all duration-200 flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="truncate text-sm font-arabic">{rule.name}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                      {rule.examples.length} أمثلة
                    </span>
                  </button>
                );
              })}

              {/* Category Summary Box */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  <span>نبذة عن الباب</span>
                </div>
                <p className="leading-relaxed">{currentCategory.summary}</p>
              </div>
            </div>

            {/* Main Rule Detailed Card */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                
                {/* Title & Definition */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-arabic text-indigo-900 dark:text-indigo-200 mb-3">
                    {currentRule.name}
                  </h2>
                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                    <span className="font-bold text-indigo-800 dark:text-indigo-300">التعريف الاصطلاحي: </span>
                    {currentRule.definition}
                  </div>
                </div>

                {/* Letters Badge List */}
                {currentRule.letters.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">حروف الحكم:</div>
                    <div className="flex flex-wrap gap-2">
                      {currentRule.letters.map((char, cIdx) => (
                        <span 
                          key={cIdx} 
                          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-base font-bold font-arabic text-indigo-600 dark:text-indigo-400 shadow-2xs"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* How to Pronounce */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>كيفية النطق والأداء الصوتي:</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {currentRule.mannerOfPronunciation}
                  </p>
                </div>

                {/* Levels or Types if exist */}
                {currentRule.levelsOrTypes && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">الأقسام والمراتب:</div>
                    <div className="space-y-2">
                      {currentRule.levelsOrTypes.map((lvl, lIdx) => (
                        <div key={lIdx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                          {lvl}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Poetic Evidence (تحفة الأطفال / الجزرية) */}
                {currentRule.poemBayt && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-950 dark:text-amber-200">
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-1">الشاهد من المنظومة (تحفة الأطفال / الجزرية):</div>
                    <div className="text-sm sm:text-base font-arabic font-bold text-center leading-loose">
                      « {currentRule.poemBayt} »
                    </div>
                  </div>
                )}

                {/* Quranic Examples Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <span>شواهد وأمثلة تطبيقية من القرآن الكريم:</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentRule.examples.map((ex, eIdx) => (
                      <div 
                        key={eIdx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-lg sm:text-xl font-bold font-arabic text-emerald-800 dark:text-emerald-300">
                            ﴿ {ex.ayahSnippet} ﴾
                          </div>
                          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-arabic">
                            سورة {ex.surahName} ({ex.ayahNumber})
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-arabic">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">التطبيق: </span>
                          {ex.ruleApplication}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: QURAN SIGNS & WAQF GUIDE */}
      {mainTab === 'quran_signs' && (
        <div className="space-y-6">
          
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSignsCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  signsCategoryFilter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                جميع العلامات ({QURAN_SIGNS_LIST.length})
              </button>
              <button
                onClick={() => setSignsCategoryFilter('waqf')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  signsCategoryFilter === 'waqf'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                علامات الوقف (مـ، لا، ج، صلى، قلى)
              </button>
              <button
                onClick={() => setSignsCategoryFilter('dabt')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  signsCategoryFilter === 'dabt'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                علامات الضبط والرسم
              </button>
              <button
                onClick={() => setSignsCategoryFilter('special_recitation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  signsCategoryFilter === 'special_recitation'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                الإمالة والتسهيل والصاد
              </button>
              <button
                onClick={() => setSignsCategoryFilter('sajda_hizb')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  signsCategoryFilter === 'sajda_hizb'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                السجدة والأحزاب (۩، ۞)
              </button>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث عن رمز أو علامة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quran Signs Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSigns.map((sign) => (
              <div
                key={sign.id}
                id={`quran-sign-${sign.id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4 hover:shadow-md transition-all"
              >
                {/* Sign Symbol & Name */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-2xl font-bold font-arabic text-emerald-700 dark:text-emerald-400 shrink-0 shadow-inner">
                      {sign.symbol}
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg font-arabic text-slate-900 dark:text-white">
                        {sign.name}
                      </h3>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {sign.meaning}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rule Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {sign.ruleDescription}
                </p>

                {/* How to recite */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">كيف تقرأ عند هذه العلامة؟ </span>
                  {sign.howToRecite}
                </div>

                {/* Quranic Example */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">مثال من المصحف:</span>
                    <span className="text-[10px] text-slate-500 font-arabic">سورة {sign.quranExample.surahName} ({sign.quranExample.ayahNumber})</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold font-arabic text-emerald-950 dark:text-emerald-200 text-center py-1">
                    ﴿ {sign.quranExample.verseText} ﴾
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-arabic">
                    {sign.quranExample.explanation}
                  </div>
                </div>

                {/* Golden Tip */}
                <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                  <span className="font-bold shrink-0">💡 قاعدة ذهبية:</span>
                  <span>{sign.tip}</span>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
