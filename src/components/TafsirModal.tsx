import React, { useState, useEffect } from 'react';
import { BookOpen, X, Copy, Check, Search, Share2, Sparkles, Loader2 } from 'lucide-react';
import { TAFSIR_BOOKS } from '../data/tafsirBooks';
import { fetchAyahTafsir } from '../services/quranApi';
import { SURAHS_LIST } from '../data/surahs';

interface TafsirModalProps {
  surahNumber: number;
  ayahNumber: number;
  ayahText: string;
  onClose: () => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  surahNumber,
  ayahNumber,
  ayahText,
  onClose
}) => {
  const [selectedBook, setSelectedBook] = useState(TAFSIR_BOOKS[0]);
  const [tafsirText, setTafsirText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const surahMeta = SURAHS_LIST.find((s) => s.number === surahNumber);
  const surahName = surahMeta ? surahMeta.name : '';

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
      .catch((err) => {
        if (isMounted) {
          setTafsirText('تعذر تحميل التفسير في الوقت الحالي.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [surahNumber, ayahNumber, selectedBook]);

  const handleCopy = () => {
    const content = `﴿${ayahText}﴾ [سورة ${surahName}: الآية ${ayahNumber}]\n\nتفسير (${selectedBook.name}):\n${tafsirText}\n\nالمصدر: منصة نور الإسلامية الشاملة`;
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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FDFCFB] dark:bg-[#1B3022] border border-[#2D4536]/20 dark:border-[#2D4536] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col text-[#2C3E30] dark:text-[#E0E7E1] shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2D4536]/15 dark:border-[#2D4536] bg-[#1B3022]/10 dark:bg-[#142419] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1B3022] text-[#E9B161] border border-[#3D5A47]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#2C3E30] dark:text-white">
                تفسير سورة {surahName} - الآية ({ayahNumber})
              </h3>
              <p className="text-[11px] text-[#55695C] dark:text-[#A8BCAD]">المصادر المعتمدة الموثوقة</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-stone-100 dark:bg-[#1B3022] hover:bg-stone-200 dark:hover:bg-[#233F2E] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white border border-[#2D4536]/15 dark:border-[#3D5A47] transition-colors"
              title="نسخ التفسير"
            >
              {copied ? <Check className="w-4 h-4 text-[#1B3022] dark:text-[#E9B161]" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-stone-100 dark:bg-[#1B3022] hover:bg-stone-200 dark:hover:bg-[#233F2E] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white border border-[#2D4536]/15 dark:border-[#3D5A47] transition-colors"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 dark:bg-[#1B3022] hover:bg-stone-200 dark:hover:bg-[#233F2E] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white border border-[#2D4536]/15 dark:border-[#3D5A47] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ayah Card */}
        <div className="p-4 bg-[#1B3022]/5 dark:bg-[#142419]/50 border-b border-[#2D4536]/15 dark:border-[#2D4536]">
          <p className="font-quran text-lg sm:text-xl text-[#1B3022] dark:text-[#E9B161] text-center leading-loose">
            ﴿ {ayahText} ﴾
          </p>
        </div>

        {/* Tafsir Book Selection Tabs */}
        <div className="p-2.5 bg-[#1B3022]/5 dark:bg-[#142419] border-b border-[#2D4536]/15 dark:border-[#2D4536] flex items-center gap-1.5 overflow-x-auto">
          {TAFSIR_BOOKS.map((book) => {
            const isSelected = book.id === selectedBook.id;
            return (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#1B3022] text-[#E9B161] border-[#E9B161] shadow-sm'
                    : 'bg-white dark:bg-[#1B3022]/30 text-[#55695C] dark:text-[#A8BCAD] border-[#2D4536]/15 dark:border-[#2D4536]'
                }`}
              >
                {book.name}
              </button>
            );
          })}
        </div>

        {/* Author / Source Attribution Info */}
        <div className="px-4 py-2 bg-[#1B3022]/10 dark:bg-[#142419]/70 border-b border-[#2D4536]/15 dark:border-[#2D4536] text-[11px] text-[#8A5612] dark:text-[#E9B161] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#E9B161] shrink-0" />
          <span>المصدر: {selectedBook.author}</span>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-[#2C3E30] dark:text-[#E0E7E1] text-sm sm:text-base leading-relaxed">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#55695C] dark:text-[#A8BCAD] gap-2">
              <Loader2 className="w-7 h-7 text-[#E9B161] animate-spin" />
              <span className="text-xs">جاري جلب التفسير الموثوق من المصدر...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-normal text-[#2C3E30] dark:text-[#E0E7E1] whitespace-pre-wrap leading-relaxed text-justify">
                {tafsirText}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1B3022]/5 dark:bg-[#142419] border-t border-[#2D4536]/15 dark:border-[#2D4536] flex items-center justify-between text-xs text-[#55695C] dark:text-[#A8BCAD]">
          <span>{copied ? 'تم نسخ النص بنجاح!' : 'النص محفوظ من أمهات كتب التفسير المعتمدة'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1B3022] hover:bg-[#233F2E] text-[#E9B161] font-medium text-xs border border-[#3D5A47] transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
