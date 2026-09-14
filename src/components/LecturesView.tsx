import React, { useState, useMemo, useEffect } from 'react';
import { 
  Play, 
  Video, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  CheckCircle, 
  Clock, 
  User, 
  Sparkles, 
  BookOpen, 
  Heart, 
  Layers, 
  X, 
  ExternalLink,
  ChevronRight,
  Tv,
  ListFilter,
  Flame,
  Award
} from 'lucide-react';
import { LectureItem, ScholarItem, LectureCategory } from '../types';
import { LECTURES_LIST, SCHOLARS_LIST, LECTURE_CATEGORIES } from '../data/lectures';
import { trackEvent } from '../services/analytics';

export const LecturesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LectureCategory>('all');
  const [selectedScholarId, setSelectedScholarId] = useState<string | null>(null);
  const [activeTabMode, setActiveTabMode] = useState<'lectures' | 'scholars' | 'series' | 'saved'>('lectures');
  
  // Active Video Player Modal state
  const [activeLecture, setActiveLecture] = useState<LectureItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Favorites & Watched state in localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tareeq_fav_lectures');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [watchedIds, setWatchedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tareeq_watched_lectures');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Toggle favorite
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('tareeq_fav_lectures', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Toggle watched status
  const handleToggleWatched = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('tareeq_watched_lectures', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Play lecture
  const handlePlayLecture = (lecture: LectureItem) => {
    setActiveLecture(lecture);
    setIsPlayerOpen(true);
    trackEvent('lecture', `${lecture.scholarName}: ${lecture.title}`);
    // Automatically mark as watched or recently opened
    if (!watchedIds.includes(lecture.id)) {
      setWatchedIds((prev) => {
        const next = [...prev, lecture.id];
        try {
          localStorage.setItem('tareeq_watched_lectures', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  // Share lecture
  const handleShare = (lecture: LectureItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = `🎥 محاضرة مميزة: "${lecture.title}" لـ ${lecture.scholarName}\nمشاهدة على تطبيق طريق الهدى: https://youtube.com/watch?v=${lecture.youtubeId}`;
    if (navigator.share) {
      navigator.share({
        title: lecture.title,
        text: text,
        url: `https://youtube.com/watch?v=${lecture.youtubeId}`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedShareId(lecture.id);
      setTimeout(() => setCopiedShareId(null), 3000);
    }
  };

  // Filtered lectures
  const filteredLectures = useMemo(() => {
    return LECTURES_LIST.filter((lec) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = lec.title.toLowerCase().includes(q);
        const matchScholar = lec.scholarName.toLowerCase().includes(q);
        const matchDesc = lec.description.toLowerCase().includes(q);
        const matchSeries = lec.seriesTitle?.toLowerCase().includes(q);
        if (!matchTitle && !matchScholar && !matchDesc && !matchSeries) {
          return false;
        }
      }

      // 2. Scholar Filter
      if (selectedScholarId && lec.scholarId !== selectedScholarId) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'all' && lec.category !== selectedCategory) {
        return false;
      }

      // 4. Saved Mode
      if (activeTabMode === 'saved' && !favoriteIds.includes(lec.id)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedScholarId, activeTabMode, favoriteIds]);

  // Grouped Series
  const seriesGroups = useMemo(() => {
    const map = new Map<string, LectureItem[]>();
    LECTURES_LIST.forEach((lec) => {
      if (lec.seriesTitle) {
        if (!map.has(lec.seriesTitle)) {
          map.set(lec.seriesTitle, []);
        }
        map.get(lec.seriesTitle)!.push(lec);
      }
    });
    return Array.from(map.entries()).map(([title, items]) => ({
      title,
      scholar: items[0].scholarName,
      scholarId: items[0].scholarId,
      items
    }));
  }, []);

  const activeScholarObj = selectedScholarId 
    ? SCHOLARS_LIST.find((s) => s.id === selectedScholarId) 
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1B3022] via-[#233F2E] to-[#142419] border border-[#3D5A47] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E9B161]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9B161]/20 border border-[#E9B161]/40 text-[#E9B161] text-xs font-bold">
              <Tv className="w-3.5 h-3.5" />
              <span>المكتبة المرئية الإسلامية الكبرى</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-scheherazade text-white tracking-wide">
              محاضرات وفيديوهات كبار العلماء والمشايخ
            </h2>
            <p className="text-xs sm:text-sm text-[#A8BCAD] leading-relaxed">
              شاهد واستمع لأقوى الخطب والدروس وتفاسير القرآن الكريم والسيرة النبوية من نخبة أعلام الأمة الإسلامية بجودة عالية.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 rounded-2xl bg-[#142419]/80 border border-[#2D4536] text-center shrink-0">
              <span className="block text-xl font-bold text-[#E9B161] font-mono">{LECTURES_LIST.length}+</span>
              <span className="text-[10px] text-[#A8BCAD] font-semibold">محاضرة مختارة</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#142419]/80 border border-[#2D4536] text-center shrink-0">
              <span className="block text-xl font-bold text-[#E9B161] font-mono">{SCHOLARS_LIST.length}</span>
              <span className="text-[10px] text-[#A8BCAD] font-semibold">علماء ومشايخ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="flex items-center p-1.5 rounded-2xl bg-white dark:bg-[#1B3022]/40 border border-[#2D4536]/15 dark:border-[#2D4536] shadow-sm overflow-x-auto gap-1">
        <button
          onClick={() => {
            setActiveTabMode('lectures');
            setSelectedScholarId(null);
          }}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTabMode === 'lectures' && !selectedScholarId
              ? 'bg-[#1B3022] text-[#E9B161] shadow-md dark:bg-[#1B3022] dark:text-[#E9B161]'
              : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>كل الفيديوهات</span>
        </button>

        <button
          onClick={() => setActiveTabMode('scholars')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTabMode === 'scholars'
              ? 'bg-[#1B3022] text-[#E9B161] shadow-md dark:bg-[#1B3022] dark:text-[#E9B161]'
              : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>كبار المشايخ ({SCHOLARS_LIST.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTabMode('series');
            setSelectedScholarId(null);
          }}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTabMode === 'series'
              ? 'bg-[#1B3022] text-[#E9B161] shadow-md dark:bg-[#1B3022] dark:text-[#E9B161]'
              : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>السلاسل العلمية ({seriesGroups.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTabMode('saved');
            setSelectedScholarId(null);
          }}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTabMode === 'saved'
              ? 'bg-[#1B3022] text-[#E9B161] shadow-md dark:bg-[#1B3022] dark:text-[#E9B161]'
              : 'text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>المفضلة ({favoriteIds.length})</span>
        </button>
      </div>

      {/* Search & Active Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8C80]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن محاضرة، شيخ، موضوع، تفسير سورة..."
            className="w-full pl-4 pr-11 py-3 rounded-2xl bg-white dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] text-[#2C3E30] dark:text-white placeholder-[#7A8C80] text-xs sm:text-sm focus:outline-none focus:border-[#E9B161] transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selected Scholar Badge Filter (if active) */}
        {activeScholarObj && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#E9B161]/15 border border-[#E9B161] text-[#1B3022] dark:text-[#E9B161] text-xs font-bold shrink-0">
            <span>دروس: {activeScholarObj.name}</span>
            <button
              onClick={() => setSelectedScholarId(null)}
              className="p-0.5 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Categories Filter Pills */}
      {activeTabMode === 'lectures' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {LECTURE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#1B3022] text-[#E9B161] shadow-md border border-[#E9B161]'
                    : 'bg-white dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] text-[#55695C] dark:text-[#A8BCAD] hover:text-[#2C3E30] dark:hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* MODE 1: SCHOLARS DIRECTORY VIEW */}
      {activeTabMode === 'scholars' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#2C3E30] dark:text-white font-scheherazade">
              أعلام ودعاة العالم الإسلامي
            </h3>
            <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD]">
              اختر أي شيخ لعرض جميع محاضراته وسلاسله
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCHOLARS_LIST.map((scholar) => {
              const lecturesCount = LECTURES_LIST.filter((l) => l.scholarId === scholar.id).length;
              return (
                <div
                  key={scholar.id}
                  onClick={() => {
                    setSelectedScholarId(scholar.id);
                    setActiveTabMode('lectures');
                  }}
                  className="p-5 rounded-3xl bg-white dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] hover:border-[#E9B161] transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B3022] to-[#2D4536] border border-[#E9B161]/40 flex items-center justify-center text-[#E9B161] font-bold text-base shadow-sm shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#2C3E30] dark:text-white group-hover:text-[#E9B161] transition-colors">
                            {scholar.name}
                          </h4>
                        </div>
                        <span className="text-[11px] text-[#E9B161] font-semibold block">{scholar.title}</span>
                        <span className="text-[10px] text-[#7A8C80] dark:text-[#A8BCAD]">{scholar.country}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#55695C] dark:text-[#A8BCAD] leading-relaxed line-clamp-2">
                      {scholar.bio}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#2D4536]/10 dark:border-[#2D4536]/50 flex items-center justify-between text-xs">
                    <span className="text-[#E9B161] font-bold">
                      {lecturesCount} محاضرات متاحة
                    </span>
                    <span className="text-[11px] font-semibold text-[#1B3022] dark:text-[#E9B161] group-hover:underline flex items-center gap-0.5">
                      <span>عرض الدروس</span>
                      <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: SERIES VIEW */}
      {activeTabMode === 'series' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#2C3E30] dark:text-white font-scheherazade">
              السلاسل والبرامج العلمية الكاملة
            </h3>
            <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD]">
              مجموعات دروس متسلسلة للتعلم المنهجي
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seriesGroups.map((group) => (
              <div
                key={group.title}
                className="p-5 rounded-3xl bg-white dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#2D4536]/15 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#E9B161] px-2 py-0.5 rounded-full bg-[#E9B161]/15">
                      سلسلة مميزة
                    </span>
                    <h4 className="text-base font-bold text-[#2C3E30] dark:text-white mt-1">
                      {group.title}
                    </h4>
                    <span className="text-xs text-[#7A8C80] dark:text-[#A8BCAD]">
                      الشيخ: {group.scholar}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-[#E9B161]">
                      {group.items.length} حلقات
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {group.items.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => handlePlayLecture(item)}
                      className="p-3 rounded-2xl bg-stone-50 dark:bg-[#1B3022]/40 hover:bg-[#E9B161]/10 border border-[#2D4536]/10 dark:border-[#2D4536]/40 flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-[#2D4536] text-[#E9B161] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="text-xs font-bold text-[#2C3E30] dark:text-white group-hover:text-[#E9B161] transition-colors">
                            {item.title}
                          </h5>
                          <span className="text-[10px] text-[#7A8C80] dark:text-[#A8BCAD] font-mono">
                            {item.duration}
                          </span>
                        </div>
                      </div>

                      <button className="p-2 rounded-xl bg-[#1B3022] text-[#E9B161] group-hover:scale-105 transition-transform">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 3: LECTURES LIST / GRID (Default or Saved) */}
      {(activeTabMode === 'lectures' || activeTabMode === 'saved') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#2C3E30] dark:text-white font-scheherazade">
                {activeTabMode === 'saved' ? 'المحاضرات المحفوظة والمفضلة' : 'قائمة المحاضرات والفيديوهات'}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1B3022]/10 dark:bg-[#1B3022] text-[#E9B161] font-bold">
                {filteredLectures.length}
              </span>
            </div>

            {selectedScholarId && (
              <button
                onClick={() => setSelectedScholarId(null)}
                className="text-xs text-[#E9B161] hover:underline font-bold"
              >
                عرض محاضرات جميع المشايخ
              </button>
            )}
          </div>

          {filteredLectures.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E9B161]/20 text-[#E9B161] mx-auto flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-[#2C3E30] dark:text-white">
                {activeTabMode === 'saved' ? 'لا توجد محاضرات في المفضلة حالياً' : 'لم يتم العثور على نتائج'}
              </h4>
              <p className="text-xs text-[#7A8C80] dark:text-[#A8BCAD] max-w-sm mx-auto">
                {activeTabMode === 'saved'
                  ? 'اضغط على رمز المفضلة 🔖 على أي محاضرة لحفظها والرجوع إليها بسهولة في أي وقت.'
                  : 'جرب البحث بكلمات أخرى أو تغيير تصنيف المحاضرات.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLectures.map((lecture) => {
                const isFav = favoriteIds.includes(lecture.id);
                const isWatched = watchedIds.includes(lecture.id);

                return (
                  <div
                    key={lecture.id}
                    onClick={() => handlePlayLecture(lecture)}
                    className="rounded-3xl bg-white dark:bg-[#142419] border border-[#2D4536]/20 dark:border-[#2D4536] hover:border-[#E9B161] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Video Thumbnail Placeholder / Card Header */}
                      <div className="relative aspect-video bg-[#1B3022] overflow-hidden flex items-center justify-center text-white">
                        <img 
                          src={`https://img.youtube.com/vi/${lecture.youtubeId}/hqdefault.jpg`} 
                          alt={lecture.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                          onError={(e) => {
                            // Fallback if image blocked
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#E9B161] text-[#1B3022] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current mr-0.5" />
                          </div>
                        </div>

                        {/* Top Badges */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-[#E9B161]">
                            {lecture.categoryLabel}
                          </span>
                          {lecture.featured && (
                            <span className="px-2 py-0.5 rounded-md bg-[#E9B161] text-[#1B3022] text-[10px] font-bold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              مميزة
                            </span>
                          )}
                        </div>

                        {/* Bottom Info on Image */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium text-white/90">
                          <span className="font-mono bg-black/60 px-2 py-0.5 rounded-md">
                            {lecture.duration}
                          </span>
                          {lecture.viewsCount && (
                            <span className="bg-black/60 px-2 py-0.5 rounded-md text-[10px]">
                              {lecture.viewsCount} مشاهدة
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs text-[#E9B161] font-bold">
                          <User className="w-3.5 h-3.5" />
                          <span>{lecture.scholarName}</span>
                        </div>

                        <h4 className="font-bold text-sm text-[#2C3E30] dark:text-white group-hover:text-[#E9B161] transition-colors leading-snug line-clamp-2">
                          {lecture.title}
                        </h4>

                        <p className="text-xs text-[#55695C] dark:text-[#A8BCAD] line-clamp-2 leading-relaxed">
                          {lecture.description}
                        </p>

                        {/* Key Takeaways preview */}
                        {lecture.keyPoints && lecture.keyPoints.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[10px] text-[#7A8C80] dark:text-[#A8BCAD] font-semibold block mb-1">
                              💡 من أهم محاور الدرس:
                            </span>
                            <ul className="text-[11px] text-[#55695C] dark:text-[#D1DCD3] space-y-0.5 list-disc list-inside">
                              {lecture.keyPoints.slice(0, 2).map((pt, i) => (
                                <li key={i} className="truncate">{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Bottom */}
                    <div className="p-3 bg-stone-50 dark:bg-[#1B3022]/30 border-t border-[#2D4536]/10 dark:border-[#2D4536]/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(lecture.id, e)}
                          className={`p-2 rounded-xl border transition-all ${
                            isFav
                              ? 'bg-[#E9B161]/20 border-[#E9B161] text-[#E9B161]'
                              : 'bg-white dark:bg-[#142419] border-[#2D4536]/20 text-[#7A8C80] hover:text-[#2C3E30] dark:hover:text-white'
                          }`}
                          title={isFav ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                        >
                          {isFav ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>

                        {/* Share Button */}
                        <button
                          type="button"
                          onClick={(e) => handleShare(lecture, e)}
                          className="p-2 rounded-xl bg-white dark:bg-[#142419] border border-[#2D4536]/20 text-[#7A8C80] hover:text-[#E9B161] transition-colors"
                          title="مشاركة المحاضرة"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        {copiedShareId === lecture.id && (
                          <span className="text-[10px] text-emerald-500 font-bold">تم النسخ!</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://www.youtube.com/watch?v=${lecture.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-xl bg-white dark:bg-[#142419] border border-[#2D4536]/20 text-[#7A8C80] hover:text-[#E9B161] transition-colors"
                          title="فتح في YouTube مباشرة"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handlePlayLecture(lecture)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1B3022] hover:bg-[#233F2E] text-[#E9B161] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>مشاهدة</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FULL SCREEN / MODAL VIDEO PLAYER */}
      {isPlayerOpen && activeLecture && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={() => setIsPlayerOpen(false)}
        >
          <div 
            className="w-full max-w-4xl rounded-3xl bg-[#142419] border border-[#3D5A47] text-white shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Player Header */}
            <div className="p-3.5 sm:p-4 border-b border-[#2D4536] flex items-center justify-between gap-3 bg-[#1B3022]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-[#E9B161]/20 text-[#E9B161] shrink-0">
                  <Tv className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-[#E9B161] font-bold block truncate">
                    {activeLecture.scholarName} • {activeLecture.categoryLabel}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-white truncate">
                    {activeLecture.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${activeLecture.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  title="فتح ومشاهدة مباشرة على منصة يوتيوب"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">مشاهدة على يوتيوب</span>
                  <span className="sm:hidden">يوتيوب</span>
                </a>

                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(activeLecture.id, e)}
                  className={`p-2 rounded-xl border transition-all ${
                    favoriteIds.includes(activeLecture.id)
                      ? 'bg-[#E9B161]/20 border-[#E9B161] text-[#E9B161]'
                      : 'bg-[#142419] border-[#2D4536] text-[#A8BCAD] hover:text-white'
                  }`}
                  title="حفظ في المفضلة"
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlayerOpen(false)}
                  className="p-2 rounded-xl bg-[#142419] hover:bg-[#2D4536] text-[#A8BCAD] hover:text-white border border-[#2D4536] transition-colors"
                  title="إغلاق المشغل"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Iframe Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeLecture.youtubeId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
                title={activeLecture.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
              />
            </div>

            {/* Fallback Tip Bar if video blocked by browser or iframe */}
            <div className="px-4 py-2 bg-[#1B3022]/80 border-b border-[#2D4536] flex flex-wrap items-center justify-between gap-2 text-xs text-[#A8BCAD]">
              <div className="flex items-center gap-1.5">
                <span className="text-[#E9B161]">💡</span>
                <span>إذا ظهرت لك رسالة تعذر التشغيل في متصفحك أو مانع الإعلانات:</span>
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${activeLecture.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E9B161] font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>اضغط هنا لفتح المحاضرة مباشرة على YouTube بدقة كاملة</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Player Details & Key Points (Scrollable) */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-72">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D4536] pb-3">
                <div>
                  <h4 className="text-base font-bold text-white">{activeLecture.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#E9B161] font-semibold">
                    <span>{activeLecture.scholarName}</span>
                    <span>•</span>
                    <span className="text-[#A8BCAD]">{activeLecture.duration}</span>
                    {activeLecture.publishedYear && (
                      <>
                        <span>•</span>
                        <span className="text-[#A8BCAD]">إنتاج {activeLecture.publishedYear}م</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleShare(activeLecture, e)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2D4536] hover:bg-[#3D5A47] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#E9B161]" />
                    <span>مشاركة الرابط</span>
                  </button>
                  {copiedShareId === activeLecture.id && (
                    <span className="text-xs text-emerald-400 font-bold">تم نسخ الرابط!</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#D1DCD3] leading-relaxed">
                {activeLecture.description}
              </p>

              {/* Key Takeaways */}
              {activeLecture.keyPoints && activeLecture.keyPoints.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#1B3022] border border-[#2D4536] space-y-2.5">
                  <span className="text-xs font-bold text-[#E9B161] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>أهم الفوائد والمحاور الإيمانية في هذا الدرس:</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {activeLecture.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-stone-200">
                        <CheckCircle className="w-3.5 h-3.5 text-[#E9B161] shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
