import React from 'react';
import { Bookmark, X, Trash2, BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { Bookmark as BookmarkType } from '../types';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBookmark: (surahNumber: number, ayahNumber: number) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  onSelectBookmark
}) => {
  const [bookmarks, setBookmarks] = React.useState<BookmarkType[]>(() => {
    try {
      const saved = localStorage.getItem('nour_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const lastRead = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('nour_last_read');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [isOpen]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    try {
      localStorage.setItem('nour_bookmarks', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleClearAll = () => {
    if (confirm('هل تريد حذف جميع العلامات المرجعية المحفوظة؟')) {
      setBookmarks([]);
      localStorage.removeItem('nour_bookmarks');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-start animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#FDFCFB] dark:bg-[#1B3022] border-l border-[#2D4536]/20 dark:border-[#2D4536] h-full p-5 flex flex-col text-[#2C3E30] dark:text-[#E0E7E1] shadow-2xl animate-slideRight"
        style={{
          paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 1.25rem), 1.25rem)',
          paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 1.25rem), 1.25rem)',
          paddingRight: 'max(calc(env(safe-area-inset-right, 0px) + 1.25rem), 1.25rem)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D4536]/15 dark:border-[#2D4536]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#1B3022]/10 dark:bg-[#142419] text-[#E9B161] border border-[#2D4536]/20 dark:border-[#3D5A47]">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#2C3E30] dark:text-white">
                العلامات المرجعية والمحفوظات
              </h3>
              <p className="text-xs text-[#55695C] dark:text-[#A8BCAD]">
                {bookmarks.length} علامات محفوظة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1B3022]/5 dark:bg-[#142419] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Last Read Card */}
          {lastRead && (
            <div
              onClick={() => {
                onSelectBookmark(lastRead.surahNumber, lastRead.ayahNumber);
                onClose();
              }}
              className="p-4 rounded-2xl bg-gradient-to-r from-[#1B3022] to-[#2D4536] border border-[#3D5A47] text-white cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between text-xs text-[#E9B161] mb-1">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>آخر موضع قراءة</span>
                </span>
                <span className="text-[11px] text-[#A8BCAD]">متابعة الآن ←</span>
              </div>
              <h4 className="font-bold text-base text-white">
                سورة {lastRead.surahName} (الآية {lastRead.ayahNumber})
              </h4>
            </div>
          )}

          {/* Bookmarks List */}
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center text-[#55695C] dark:text-[#A8BCAD] space-y-3">
              <Bookmark className="w-12 h-12 mx-auto text-[#2D4536] stroke-1" />
              <p className="text-xs font-semibold">لا توجد علامات مرجعية محفوظة حالياً</p>
              <p className="text-[11px] text-[#55695C]/70 dark:text-[#A8BCAD]/70">
                أثناء تلاوة أو قراءة الآيات، اضغط على أيقونة الإشارة المرجعية لحفظها هنا.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  onClick={() => {
                    onSelectBookmark(bm.surahNumber, bm.ayahNumber);
                    onClose();
                  }}
                  className="p-4 rounded-2xl bg-white dark:bg-[#142419] border border-[#2D4536]/15 dark:border-[#2D4536] hover:border-[#E9B161] cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-lg bg-[#1B3022]/10 dark:bg-[#1B3022] text-[#1B3022] dark:text-[#E9B161] font-bold text-xs font-mono border border-[#2D4536]/20 dark:border-[#3D5A47]">
                      سورة {bm.surahName} : آية {bm.ayahNumber}
                    </span>
                    <button
                      onClick={(e) => handleDelete(bm.id, e)}
                      className="p-1 rounded-md text-[#55695C] dark:text-[#A8BCAD] hover:text-red-500 transition-colors"
                      title="حذف الإشارة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="font-quran text-sm text-[#2C3E30] dark:text-[#E0E7E1] line-clamp-2 leading-relaxed text-right">
                    {bm.ayahText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {bookmarks.length > 0 && (
          <div className="pt-3 border-t border-[#2D4536]/15 dark:border-[#2D4536] flex items-center justify-between">
            <button
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-600 font-semibold"
            >
              مسح جميع العلامات
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-[#142419] text-xs font-bold text-[#2C3E30] dark:text-[#E0E7E1] border border-[#2D4536]/15 dark:border-[#2D4536]"
            >
              إغلاق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
