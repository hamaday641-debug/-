import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  X, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TAFSIR_BOOKS } from '../data/tafsirBooks';
import { fetchAyahTafsir } from '../services/quranApi';
import { SURAHS_LIST } from '../data/surahs';

interface TafsirModalProps {
  surahNumber: number;
  ayahNumber: number;
  ayahText: string;
  onClose: () => void;
  onNavigateAyah?: (newAyah: number) => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  surahNumber,
  ayahNumber,
  ayahText,
  onClose,
  onNavigateAyah
}) => {
  const [selectedBook, setSelectedBook] = useState(TAFSIR_BOOKS[0]);
  const [tafsirText, setTafsirText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);
  const [isAyahExpanded, setIsAyahExpanded] = useState(false);

  const surahMeta = SURAHS_LIST.find((s) => s.number === surahNumber);
  const surahName = surahMeta ? surahMeta.name : '';
  const totalAyahs = surahMeta ? surahMeta.numberOfAyahs : 286;

  const isLongAyah = ayahText.length > 150;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchAyahTafsir(surahNumber, ayahNumber, selectedBook.editionId)
      .then((text) => {
        if (isMounted) {
          setTafsirText(text);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTafsirText('تعذر تحميل التفسير في الوقت الحالي. يرجى التأكد من الاتصال بالإنترنت.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [surahNumber, ayahNumber, selectedBook]);

  const handleCopy = () => {
    const content = `﴿${ayahText}﴾ [سورة ${surahName}: الآية ${ayahNumber}]\n\nتفسير (${selectedBook.name}):\n${tafsirText}\n\nالمصدر: منصة طريق الهدى القرآنية`;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `تفسير الآية ${ayahNumber} من سورة ${surahName}`,
        text: `﴿${ayahText}﴾\n\nتفسير (${selectedBook.name}):\n${tafsirText}`
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const increaseFontSize = () => {
    if (fontSizeOffset < 8) setFontSizeOffset((prev) => prev + 2);
  };

  const decreaseFontSize = () => {
    if (fontSizeOffset > -4) setFontSizeOffset((prev) => prev - 2);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF7EE] dark:bg-[#14261B] border border-[#C2822B]/40 dark:border-[#274834] rounded-3xl max-w-3xl w-full h-[94vh] sm:h-[88vh] max-h-[94vh] flex flex-col text-[#142E20] dark:text-[#E0E7E1] shadow-2xl overflow-hidden animate-in zoom-in-95" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. TOP HEADER (Fixed) */}
        <div className="p-3.5 sm:p-4 border-b border-[#C2822B]/20 dark:border-[#274834] bg-[#F5ECD5] dark:bg-[#0F1E15] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-2xl bg-[#142E20] text-[#E5B869] border border-[#274834] shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold font-scheherazade text-sm sm:text-lg text-[#142E20] dark:text-white truncate">
                تفسير سورة {surahName} • الآية ({ayahNumber})
              </h3>
              <p className="text-[10px] sm:text-xs text-[#55695C] dark:text-[#A8BCAD] truncate">
                المصادر والتفاسير المعتمدة الموثوقة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Font size adjustment */}
            <div className="hidden sm:flex items-center bg-white/70 dark:bg-[#1B3524] rounded-xl border border-stone-200 dark:border-[#2D4536] p-0.5">
              <button
                onClick={decreaseFontSize}
                className="p-1.5 hover:bg-stone-200 dark:hover:bg-[#274834] rounded-lg text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                title="تصغير الخط"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={increaseFontSize}
                className="p-1.5 hover:bg-stone-200 dark:hover:bg-[#274834] rounded-lg text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                title="تكبير الخط"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white/80 dark:bg-[#1B3524] hover:bg-white dark:hover:bg-[#204430] text-[#55695C] dark:text-[#A8BCAD] border border-stone-200 dark:border-[#2D4536] transition-colors cursor-pointer"
              title="نسخ التفسير"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-[#E5B869]" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/80 dark:bg-[#1B3524] hover:bg-white dark:hover:bg-[#204430] text-[#55695C] dark:text-[#A8BCAD] border border-stone-200 dark:border-[#2D4536] transition-colors cursor-pointer"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/80 dark:bg-[#1B3524] hover:bg-white dark:hover:bg-[#204430] text-[#55695C] dark:text-[#A8BCAD] border border-stone-200 dark:border-[#2D4536] transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 scroll-smooth">
          
          {/* A. Ayah Card & Navigation */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#0D1C13] border border-[#C2822B]/25 dark:border-[#274834] shadow-sm space-y-2.5">
            <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#E5B869]/20 border border-[#E5B869]/30 text-[#142E20] dark:text-[#E5B869] text-xs font-bold font-mono">
                  آية {ayahNumber}
                </span>
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                  سورة {surahName}
                </span>
              </div>

              {onNavigateAyah && (
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={ayahNumber <= 1}
                    onClick={() => onNavigateAyah(ayahNumber - 1)}
                    className="px-2.5 py-1 rounded-xl bg-[#E5B869]/15 hover:bg-[#E5B869]/25 disabled:opacity-20 text-[#142E20] dark:text-[#E5B869] transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="الآية السابقة"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>السابقة</span>
                  </button>
                  <button
                    disabled={ayahNumber >= totalAyahs}
                    onClick={() => onNavigateAyah(ayahNumber + 1)}
                    className="px-2.5 py-1 rounded-xl bg-[#E5B869]/15 hover:bg-[#E5B869]/25 disabled:opacity-20 text-[#142E20] dark:text-[#E5B869] transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="الآية التالية"
                  >
                    <span>التالية</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Ayah Quranic Text with smart expansion for long ayahs */}
            <div className="relative">
              <div className={`${isLongAyah && !isAyahExpanded ? 'max-h-24 overflow-hidden relative' : ''}`}>
                <p className="font-scheherazade font-bold text-base sm:text-2xl text-[#142E20] dark:text-[#E5B869] text-center leading-[2.1] px-2 py-1 select-text">
                  ﴿ {ayahText} ﴾
                </p>
                {isLongAyah && !isAyahExpanded && (
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-[#0D1C13] to-transparent pointer-events-none" />
                )}
              </div>

              {isLongAyah && (
                <div className="text-center mt-1">
                  <button
                    onClick={() => setIsAyahExpanded(!isAyahExpanded)}
                    className="inline-flex items-center gap-1 text-xs text-[#C2822B] hover:text-[#8A5612] dark:text-[#E5B869] font-bold py-1 px-3 rounded-lg hover:bg-amber-50 dark:hover:bg-[#1B3524] transition-colors cursor-pointer"
                  >
                    <span>{isAyahExpanded ? 'طي نص الآية' : 'عرض نص الآية كاملاً'}</span>
                    {isAyahExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* B. Tafsir Books Tabs Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#55695C] dark:text-[#A8BCAD] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#C2822B]" />
                <span>اختر كتاب التفسير:</span>
              </span>
              <span className="text-[11px] text-stone-400">
                ({TAFSIR_BOOKS.length} كتب معتمدة)
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {TAFSIR_BOOKS.map((book) => {
                const isSelected = book.id === selectedBook.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#142E20] text-[#E5B869] border-[#E5B869] shadow-sm ring-2 ring-[#E5B869]/30'
                        : 'bg-white dark:bg-[#15271D] text-[#55695C] dark:text-[#A8BCAD] border-stone-200 dark:border-[#274834] hover:border-stone-300'
                    }`}
                  >
                    {book.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. Source Attribution Bar */}
          <div className="px-3.5 py-2 rounded-xl bg-amber-50/80 dark:bg-[#102318] border border-[#C2822B]/20 dark:border-[#274834] text-xs text-[#8A5612] dark:text-[#E5B869] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C2822B] shrink-0" />
              <span className="font-semibold">المصدر: {selectedBook.author}</span>
            </div>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 bg-white/60 dark:bg-black/30 px-2 py-0.5 rounded-md">
              {selectedBook.name}
            </span>
          </div>

          {/* D. Full Tafsir Content Area */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0D1C13] border border-stone-200 dark:border-[#274834] shadow-sm text-[#142E20] dark:text-[#E0E7E1] min-h-[180px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#55695C] dark:text-[#A8BCAD] gap-3">
                <Loader2 className="w-8 h-8 text-[#C2822B] animate-spin" />
                <span className="text-xs font-bold">جاري تحميل وتوثيق التفسير من المصدر...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <p 
                  className="font-normal text-[#142E20] dark:text-[#E0E7E1] whitespace-pre-wrap leading-[2.2] text-justify font-sans select-text"
                  style={{ fontSize: `${15 + fontSizeOffset}px` }}
                >
                  {tafsirText}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. BOTTOM FOOTER (Fixed) */}
        <div className="p-3 sm:p-4 bg-[#F5ECD5] dark:bg-[#0F1E15] border-t border-[#C2822B]/20 dark:border-[#274834] flex items-center justify-between text-xs text-[#55695C] dark:text-[#A8BCAD] shrink-0">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">
              {copied ? '✅ تم نسخ التفسير بنجاح!' : 'النص موثق من أمهات كتب التفسير المعتمدة'}
            </span>
            <span className="sm:hidden text-[11px]">
              {copied ? '✅ تم النسخ!' : 'تفسير موثق'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1B3524] hover:bg-stone-100 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-[#2D4536] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5 text-[#E5B869]" />
              <span>نسخ</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl bg-[#142E20] hover:bg-[#1B3524] text-[#E5B869] font-bold text-xs border border-[#E5B869]/40 transition-colors cursor-pointer shadow-sm"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
