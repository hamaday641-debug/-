import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, BookOpen, Loader2, ArrowLeft, Sparkles, Book, Check } from 'lucide-react';
import { searchQuran, searchSurahs, normalizeArabic } from '../services/quranApi';
import { SearchResultItem } from '../types';
import { SURAHS_LIST } from '../data/surahs';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (surahNumber: number, ayahNumber: number) => void;
}

const QUICK_SEARCH_TAGS = [
  'آية الكرسي',
  'سورة الكهف',
  'سورة يس',
  'سورة الملك',
  'سورة الرحمن',
  'سورة الإخلاص',
  'الصابرين',
  'الجنة',
  'التوبة',
  'الرحمة'
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Instant surah name matches
  const matchedSurahs = useMemo(() => {
    if (!query.trim()) return [];
    return searchSurahs(query.trim()).slice(0, 4);
  }, [query]);

  // Debounced Quran Text Search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      searchQuran(trimmed)
        .then((res) => {
          setResults(res);
          setLoading(false);
          setHasSearched(true);
        })
        .catch(() => {
          setLoading(false);
          setHasSearched(true);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 animate-fadeIn"
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 1rem), 2.5rem)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 1rem), 2.5rem)'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-[#FDFCFB] dark:bg-[#15271D] border border-[#2D4536]/20 dark:border-[#2D4536] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col text-[#2C3E30] dark:text-[#E0E7E1] shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 border-b border-[#2D4536]/15 dark:border-[#2D4536] flex items-center gap-3 bg-stone-50 dark:bg-[#112017]">
          <div className="p-2 rounded-xl bg-[#E9B161]/15 text-[#E9B161]">
            <Search className="w-5 h-5 shrink-0" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            placeholder="ابحث باسم السورة، أو كلمة، أو آية من القرآن الكريم..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-[#2C3E30] dark:text-[#E0E7E1] placeholder:text-[#55695C]/60 dark:placeholder:text-[#A8BCAD]/60 focus:outline-none font-medium"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-[#1B3022] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white"
            >
              مسح
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#1B3022]/10 dark:bg-[#1B3022] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Tag Pills */}
        {!query && (
          <div className="p-3.5 border-b border-[#2D4536]/10 dark:border-[#2D4536]/40 bg-[#F7F5F0] dark:bg-[#13241A] space-y-2">
            <span className="text-[11px] font-bold text-[#55695C] dark:text-[#A8BCAD] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E9B161]" />
              <span>عمليات بحث شائعة مقترحة:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SEARCH_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-2.5 py-1 rounded-full text-xs bg-white dark:bg-[#1B3022] border border-[#2D4536]/15 dark:border-[#2D4536] text-[#2C3E30] dark:text-stone-300 hover:border-[#E9B161] hover:text-[#E9B161] transition-all cursor-pointer shadow-xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {/* Matched Surahs Section (Instant) */}
          {matchedSurahs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#E9B161] flex items-center gap-1">
                <Book className="w-3.5 h-3.5" />
                <span>سور تطابق بحثك:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedSurahs.map((surah) => (
                  <div
                    key={surah.number}
                    onClick={() => {
                      onSelectResult(surah.number, 1);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-[#E9B161]/10 dark:bg-[#1B3022] border border-[#E9B161]/40 hover:border-[#E9B161] text-[#2C3E30] dark:text-white flex items-center justify-between cursor-pointer transition-all active:scale-98 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-[#E9B161]/20 text-[#1B3022] dark:text-[#E9B161] flex items-center justify-center font-mono text-xs font-bold">
                        {surah.number}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm font-scheherazade text-[#2C3E30] dark:text-amber-100">
                          سورة {surah.name}
                        </h4>
                        <span className="text-[10px] text-[#55695C] dark:text-[#A8BCAD]">
                          {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#E9B161] font-bold group-hover:translate-x-[-2px] transition-transform flex items-center gap-1">
                      <span>فتح</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="py-10 flex flex-col items-center justify-center text-[#55695C] dark:text-[#A8BCAD] gap-2">
              <Loader2 className="w-7 h-7 text-[#E9B161] animate-spin" />
              <span className="text-xs">جاري البحث في آيات الذكر الحكيم...</span>
            </div>
          )}

          {/* No results found */}
          {!loading && hasSearched && results.length === 0 && matchedSurahs.length === 0 && (
            <div className="py-12 text-center text-[#55695C] dark:text-[#A8BCAD] space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-[#2D4536] stroke-1" />
              <p className="text-sm font-semibold">لم يتم العثور على نتائج تطابق: "{query}"</p>
              <p className="text-xs text-[#55695C]/70 dark:text-[#A8BCAD]/70">
                تأكد من صحة الكلمة أو جرب البحث بجزء منها أو كتابة اسم السورة.
              </p>
            </div>
          )}

          {/* Initial Search Prompt */}
          {!loading && !hasSearched && !query && (
            <div className="py-10 text-center text-[#55695C] dark:text-[#A8BCAD] space-y-2">
              <Search className="w-10 h-10 mx-auto text-[#E9B161]/60" />
              <p className="text-xs text-[#55695C] dark:text-[#A8BCAD]">
                ابحث في القرآن الكريم كاملاً بدقة عالية وسرعة فائقة.
              </p>
            </div>
          )}

          {/* Ayah Results List */}
          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#55695C] dark:text-[#A8BCAD] block">
                الآيات الكريمة ({results.length} آية):
              </span>

              {results.map((res, idx) => (
                <div
                  key={`${res.surahNumber}_${res.ayahNumberInSurah}_${idx}`}
                  onClick={() => {
                    onSelectResult(res.surahNumber, res.ayahNumberInSurah);
                    onClose();
                  }}
                  className="p-4 rounded-2xl bg-white dark:bg-[#142419] border border-[#2D4536]/15 dark:border-[#2D4536] hover:border-[#E9B161] cursor-pointer transition-all space-y-2 group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#1B3022]/10 dark:bg-[#1B3022] text-[#1B3022] dark:text-[#E9B161] font-bold text-xs font-mono border border-[#2D4536]/20 dark:border-[#3D5A47]">
                      سورة {res.surahName} (الآية {res.ayahNumberInSurah})
                    </span>
                    <span className="text-xs text-[#55695C] dark:text-[#A8BCAD] group-hover:text-[#E9B161] transition-colors flex items-center gap-1 font-bold">
                      <span>قراءة الآية في المصحف</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <p className="font-scheherazade text-lg sm:text-xl text-[#2C3E30] dark:text-[#E0E7E1] text-right leading-loose">
                    {res.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results count footer */}
        {hasSearched && (results.length > 0 || matchedSurahs.length > 0) && (
          <div className="p-3 bg-stone-50 dark:bg-[#112017] border-t border-[#2D4536]/15 dark:border-[#2D4536] text-xs text-[#55695C] dark:text-[#A8BCAD] text-center font-medium">
            تم العثور على <strong className="text-[#1B3022] dark:text-[#E9B161]">{results.length + matchedSurahs.length}</strong> نتيجة
          </div>
        )}
      </div>
    </div>
  );
};
