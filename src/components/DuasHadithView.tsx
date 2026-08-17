import React, { useState } from 'react';
import { 
  HeartHandshake, 
  BookOpen, 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  Share2, 
  ShieldCheck, 
  Bookmark, 
  Filter,
  Flame,
  Award
} from 'lucide-react';
import { DUAS_LIST, DUA_CATEGORIES } from '../data/duas';
import { HADITHS_LIST, HADITH_CATEGORIES } from '../data/hadith';
import { normalizeArabic } from '../services/quranApi';

export const DuasHadithView: React.FC = () => {
  const [mainTab, setMainTab] = useState<'duas' | 'hadith'>('duas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDuaCat, setSelectedDuaCat] = useState('all');
  const [selectedHadithCat, setSelectedHadithCat] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (title: string, text: string, source: string, id: string) => {
    const full = `[${title}]\n\n${text}\n\nالمصدر: ${source}\n(منصة نور الإسلامية الشاملة)`;
    navigator.clipboard.writeText(full).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShare = (title: string, text: string, source: string, id: string) => {
    if (navigator.share) {
      navigator.share({
        title,
        text: `${text}\n\nالمصدر: ${source}`
      }).catch(() => {});
    } else {
      handleCopy(title, text, source, id);
    }
  };

  // Filter Duas
  const filteredDuas = DUAS_LIST.filter((dua) => {
    const matchesCat = selectedDuaCat === 'all' || dua.categoryId === selectedDuaCat;
    if (!matchesCat) return false;

    if (!searchQuery) return true;
    const q = normalizeArabic(searchQuery);
    return (
      normalizeArabic(dua.title).includes(q) ||
      normalizeArabic(dua.text).includes(q) ||
      normalizeArabic(dua.source).includes(q)
    );
  });

  // Filter Hadiths
  const filteredHadiths = HADITHS_LIST.filter((h) => {
    const matchesCat = selectedHadithCat === 'all' || h.categoryId === selectedHadithCat;
    if (!matchesCat) return false;

    if (!searchQuery) return true;
    const q = normalizeArabic(searchQuery);
    return (
      normalizeArabic(h.title).includes(q) ||
      normalizeArabic(h.arabicText).includes(q) ||
      normalizeArabic(h.narrator).includes(q) ||
      normalizeArabic(h.source).includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1B3022] via-[#233F2E] to-[#142419] border border-[#2D4536] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#142419]/70 border border-[#3D5A47] text-[#E9B161] text-xs font-semibold mb-3">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>الأدعية المأثورة وصحيح الحديث النبوي</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-scheherazade leading-tight mb-2">
            ﴿ وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ ﴾
          </h2>
          <p className="text-xs sm:text-sm text-[#A8BCAD] leading-relaxed">
            مكتبة متكاملة تضم جوامع الدعاء القرآني والنبوي، والرقية الشرعية، والأربعين النووية مع شرح المعاني والفوائد.
          </p>
        </div>

        <div className="absolute left-6 -bottom-10 opacity-10 text-9xl font-scheherazade text-[#E9B161] select-none pointer-events-none hidden sm:block">
          دعاء
        </div>
      </div>

      {/* Main Switcher: Duas vs Hadith */}
      <div className="flex items-center p-1.5 rounded-2xl bg-[#1B3022]/10 dark:bg-[#1B3022]/40 border border-[#2D4536]/20 dark:border-[#2D4536]">
        <button
          onClick={() => {
            setMainTab('duas');
            setSearchQuery('');
          }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            mainTab === 'duas'
              ? 'bg-[#1B3022] text-[#E9B161] shadow-md dark:bg-[#1B3022] dark:text-[#E9B161]'
              : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>الأدعية المأثورة والرقية ({DUAS_LIST.length})</span>
        </button>

        <button
          onClick={() => {
            setMainTab('hadith');
            setSearchQuery('');
          }}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            mainTab === 'hadith'
              ? 'bg-[#1B3022] text-[#E9B161] shadow-md dark:bg-[#1B3022] dark:text-[#E9B161]'
              : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>الأحاديث النبوية الصحيحة ({HADITHS_LIST.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B3022] dark:text-[#E9B161]" />
        <input
          type="text"
          placeholder={
            mainTab === 'duas'
              ? 'ابحث في الأدعية (مثلاً: ربي زدني علماً، الرقية، الاستخارة)...'
              : 'ابحث في الأحاديث الشريفة (مثلاً: إنما الأعمال بالنيات، بني الإسلام)...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/20 dark:border-[#2D4536] text-[#2C3E30] dark:text-[#E0E7E1] placeholder:text-[#55695C]/60 dark:placeholder:text-[#A8BCAD]/60 focus:outline-none focus:ring-2 focus:ring-[#E9B161]/50 shadow-sm text-sm"
        />
      </div>

      {/* Subcategory Filter Pills */}
      {mainTab === 'duas' ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedDuaCat('all')}
            className={`px-4 py-2 rounded-xl shrink-0 font-semibold transition-all border ${
              selectedDuaCat === 'all'
                ? 'bg-[#1B3022] text-[#E9B161] border-[#E9B161] shadow-md'
                : 'bg-white dark:bg-[#1B3022]/30 text-[#2C3E30] dark:text-[#E0E7E1] border-[#2D4536]/20 dark:border-[#2D4536]'
            }`}
          >
            جميع الأدعية
          </button>
          {DUA_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedDuaCat(cat.id)}
              className={`px-4 py-2 rounded-xl shrink-0 font-semibold transition-all border ${
                selectedDuaCat === cat.id
                  ? 'bg-[#1B3022] text-[#E9B161] border-[#E9B161] shadow-md'
                  : 'bg-white dark:bg-[#1B3022]/30 text-[#2C3E30] dark:text-[#E0E7E1] border-[#2D4536]/20 dark:border-[#2D4536]'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedHadithCat('all')}
            className={`px-4 py-2 rounded-xl shrink-0 font-semibold transition-all border ${
              selectedHadithCat === 'all'
                ? 'bg-[#1B3022] text-[#E9B161] border-[#E9B161] shadow-md'
                : 'bg-white dark:bg-[#1B3022]/30 text-[#2C3E30] dark:text-[#E0E7E1] border-[#2D4536]/20 dark:border-[#2D4536]'
            }`}
          >
            جميع الأحاديث
          </button>
          {HADITH_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedHadithCat(cat.id)}
              className={`px-4 py-2 rounded-xl shrink-0 font-semibold transition-all border ${
                selectedHadithCat === cat.id
                  ? 'bg-[#1B3022] text-[#E9B161] border-[#E9B161] shadow-md'
                  : 'bg-white dark:bg-[#1B3022]/30 text-[#2C3E30] dark:text-[#E0E7E1] border-[#2D4536]/20 dark:border-[#2D4536]'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      )}

      {/* CONTENT LIST: DUAS */}
      {mainTab === 'duas' && (
        <div className="space-y-4">
          {filteredDuas.map((dua) => (
            <div
              key={dua.id}
              id={`dua-card-${dua.id}`}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] hover:border-[#E9B161]/50 shadow-sm transition-all space-y-3"
            >
              {/* Dua Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#2D4536]/10 dark:border-[#2D4536]/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E9B161]"></span>
                  <h3 className="font-bold text-sm sm:text-base text-[#2C3E30] dark:text-white">
                    {dua.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(dua.title, dua.text, dua.source, dua.id)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#2D4536] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white transition-colors"
                    title="نسخ الدعاء"
                  >
                    {copiedId === dua.id ? <Check className="w-4 h-4 text-[#1B3022] dark:text-[#E9B161]" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleShare(dua.title, dua.text, dua.source, dua.id)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#2D4536] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white transition-colors"
                    title="مشاركة"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dua Text */}
              <div className="py-2">
                <p className="font-quran text-lg sm:text-xl text-[#2C3E30] dark:text-[#E0E7E1] text-right leading-loose">
                  {dua.text}
                </p>
              </div>

              {/* Source & Occasion */}
              <div className="pt-2 border-t border-[#2D4536]/10 dark:border-[#2D4536]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#55695C] dark:text-[#A8BCAD]">
                <span className="font-medium text-[#1B3022] dark:text-[#E9B161]">
                  المصدر: {dua.source}
                </span>
                {dua.occasion && (
                  <span className="text-[11px] text-[#55695C]/70 dark:text-[#A8BCAD]/70">
                    المناسبة: {dua.occasion}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTENT LIST: HADITH */}
      {mainTab === 'hadith' && (
        <div className="space-y-4">
          {filteredHadiths.map((h) => (
            <div
              key={h.id}
              id={`hadith-card-${h.id}`}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1B3022]/30 border border-[#2D4536]/15 dark:border-[#2D4536] hover:border-[#E9B161]/50 shadow-sm transition-all space-y-3"
            >
              {/* Hadith Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#2D4536]/10 dark:border-[#2D4536]/60">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-[#1B3022]/10 dark:bg-[#1B3022] text-[#1B3022] dark:text-[#E9B161] font-bold text-xs font-mono border border-[#2D4536]/20 dark:border-[#3D5A47]">
                    الحديث #{h.hadithNumber}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-[#2C3E30] dark:text-white">
                    {h.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(h.title, h.arabicText, h.source, h.id)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#2D4536] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white transition-colors"
                    title="نسخ الحديث"
                  >
                    {copiedId === h.id ? <Check className="w-4 h-4 text-[#1B3022] dark:text-[#E9B161]" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleShare(h.title, h.arabicText, h.source, h.id)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#2D4536] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white transition-colors"
                    title="مشاركة"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Narrator */}
              <p className="text-xs text-[#8A5612] dark:text-[#E9B161] font-semibold">
                عن {h.narrator} رضي الله عنه قال:
              </p>

              {/* Hadith Matn / Arabic Text */}
              <div className="py-1">
                <p className="font-quran text-lg sm:text-xl text-[#2C3E30] dark:text-[#E0E7E1] text-right leading-loose">
                  «{h.arabicText}»
                </p>
              </div>

              {/* Explanation & Benefits */}
              {h.explanation && (
                <div className="p-3 rounded-2xl bg-[#1B3022]/5 dark:bg-[#142419] border border-[#2D4536]/15 dark:border-[#2D4536] text-xs text-[#55695C] dark:text-[#E0E7E1] space-y-1">
                  <p className="font-semibold text-[#1B3022] dark:text-[#E9B161]">الشرح والفوائد المستنبطة:</p>
                  <p className="leading-relaxed">{h.explanation}</p>
                </div>
              )}

              {/* Grade & Source Badge */}
              <div className="pt-2 border-t border-[#2D4536]/10 dark:border-[#2D4536]/60 flex items-center justify-between text-xs text-[#55695C] dark:text-[#A8BCAD]">
                <span className="font-semibold text-[#1B3022] dark:text-[#E9B161]">
                  {h.source}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#1B3022]/10 dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] text-[#1B3022] dark:text-[#E9B161] text-[11px] font-bold">
                  {h.grade}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
