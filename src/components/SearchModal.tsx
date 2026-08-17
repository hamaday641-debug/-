import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Loader2, ArrowLeft } from 'lucide-react';
import { searchQuran } from '../services/quranApi';
import { SearchResultItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (surahNumber: number, ayahNumber: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      searchQuran(query.trim())
        .then((res) => {
          setResults(res);
          setLoading(false);
          setHasSearched(true);
        })
        .catch(() => {
          setLoading(false);
          setHasSearched(true);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 animate-fadeIn">
      <div className="bg-[#FDFCFB] dark:bg-[#1B3022] border border-[#2D4536]/20 dark:border-[#2D4536] rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col text-[#2C3E30] dark:text-[#E0E7E1] shadow-2xl overflow-hidden animate-scaleUp">
        {/* Search Header */}
        <div className="p-4 border-b border-[#2D4536]/15 dark:border-[#2D4536] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#1B3022] dark:text-[#E9B161] shrink-0" />
          <input
            type="text"
            placeholder="اكتب كلمة أو آية للبحث في القرآن الكريم..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm sm:text-base text-[#2C3E30] dark:text-[#E0E7E1] placeholder:text-[#55695C]/60 dark:placeholder:text-[#A8BCAD]/60 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white"
            >
              مسح
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#1B3022]/5 dark:bg-[#142419] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-[#55695C] dark:text-[#A8BCAD] gap-2">
              <Loader2 className="w-7 h-7 text-[#E9B161] animate-spin" />
              <span className="text-xs">جاري البحث في آيات الذكر الحكيم...</span>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="py-12 text-center text-[#55695C] dark:text-[#A8BCAD] space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-[#2D4536] stroke-1" />
              <p className="text-sm font-semibold">لم يتم العثور على آيات تطابق: "{query}"</p>
              <p className="text-xs text-[#55695C]/70 dark:text-[#A8BCAD]/70">تأكد من صحة كتابة الكلمات أو جرب كلمات أخرى.</p>
            </div>
          )}

          {!loading && !hasSearched && !query && (
            <div className="py-10 text-center text-[#55695C] dark:text-[#A8BCAD] space-y-2">
              <Search className="w-10 h-10 mx-auto text-[#E9B161]/60" />
              <p className="text-xs text-[#55695C] dark:text-[#A8BCAD]">
                ابحث في القرآن الكريم كاملاً بالنص العثماني الموثوق.
              </p>
            </div>
          )}

          {!loading &&
            results.map((res, idx) => (
              <div
                key={`${res.surahNumber}_${res.ayahNumberInSurah}_${idx}`}
                onClick={() => {
                  onSelectResult(res.surahNumber, res.ayahNumberInSurah);
                  onClose();
                }}
                className="p-4 rounded-2xl bg-white dark:bg-[#142419] border border-[#2D4536]/15 dark:border-[#2D4536] hover:border-[#E9B161] cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#1B3022]/10 dark:bg-[#1B3022] text-[#1B3022] dark:text-[#E9B161] font-bold text-xs font-mono border border-[#2D4536]/20 dark:border-[#3D5A47]">
                    سورة {res.surahName} (الآية {res.ayahNumberInSurah})
                  </span>
                  <span className="text-xs text-[#55695C] dark:text-[#A8BCAD] group-hover:text-[#E9B161] transition-colors flex items-center gap-1">
                    <span>قراءة الآية</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>

                <p className="font-quran text-base sm:text-lg text-[#2C3E30] dark:text-[#E0E7E1] text-right leading-loose">
                  {res.text}
                </p>
              </div>
            ))}
        </div>

        {/* Results count footer */}
        {hasSearched && results.length > 0 && (
          <div className="p-3 bg-[#1B3022]/5 dark:bg-[#142419] border-t border-[#2D4536]/15 dark:border-[#2D4536] text-xs text-[#55695C] dark:text-[#A8BCAD] text-center">
            تم العثور على <strong className="text-[#1B3022] dark:text-[#E9B161]">{results.length}</strong> نتائج
          </div>
        )}
      </div>
    </div>
  );
};
