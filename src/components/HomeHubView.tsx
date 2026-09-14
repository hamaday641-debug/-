import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookMarked,
  BookOpen, 
  Flame,
  Mic,
  GraduationCap,
  Scroll,
  Headphones, 
  Compass, 
  Sun, 
  Heart, 
  Sparkles,
  MapPin,
  Bot,
  Video,
  Youtube,
  Users,
  Search,
  ArrowLeft,
  Calendar,
  Clock,
  ChevronLeft,
  Volume2,
  Share2,
  BookmarkCheck,
  CheckCircle2,
  Compass as CompassIcon,
  Play
} from 'lucide-react';
import { ActiveTab, KhatmahPlan } from '../types';
import { prayerTimesService } from '../services/prayerTimes';

interface HomeHubViewProps {
  onNavigate: (tab: ActiveTab, extra?: { surah?: number; page?: number; fromKhatmah?: boolean }) => void;
  onOpenDedicationModal?: () => void;
  onOpenPermissionsModal?: () => void;
}

interface HubItem {
  id: ActiveTab;
  title: string;
  subtitle: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  category: 'quran' | 'stories_recitations' | 'worship_dhikr' | 'knowledge_community';
  categoryLabel: string;
  badge?: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  glowClass: string;
}

export const HomeHubView: React.FC<HomeHubViewProps> = ({ 
  onNavigate, 
  onOpenDedicationModal,
  onOpenPermissionsModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Last read state
  const [lastRead, setLastRead] = useState<{ surahNumber: number; ayahNumber: number; surahName: string; page?: number } | null>(() => {
    try {
      const saved = localStorage.getItem('nour_last_read');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Khatmah state
  const [khatmahPlan, setKhatmahPlan] = useState<KhatmahPlan | null>(() => {
    try {
      const saved = localStorage.getItem('nour_khatmah_plan');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Keep khatmah plan and separate Mushaf last read synced in real time
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('nour_khatmah_plan');
        if (saved) setKhatmahPlan(JSON.parse(saved));
      } catch {
        // ignore
      }
      try {
        const savedLast = localStorage.getItem('nour_last_read');
        if (savedLast) setLastRead(JSON.parse(savedLast));
      } catch {
        // ignore
      }
    };
    window.addEventListener('khatmah_updated', handleUpdate);
    window.addEventListener('last_read_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('khatmah_updated', handleUpdate);
      window.removeEventListener('last_read_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Prayer times
  const prayerTimes = useMemo(() => {
    return prayerTimesService.getTodayPrayerTimes(new Date());
  }, []);

  // Today Hijri / Gregorian Date
  const dateFormatted = useMemo(() => {
    const today = new Date();
    const gregorian = today.toLocaleDateString('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return {
      gregorian,
      hijri: prayerTimes.hijriFormatted
    };
  }, [prayerTimes]);

  // Curated list of all 15 core app sections
  const hubItems: HubItem[] = [
    // 1. Quran & Sciences
    {
      id: 'reading',
      title: 'المصحف الشريف',
      subtitle: 'القراءة بالرسم العثماني',
      description: 'تصفح صفحات المصحف الشريف الـ 604 بنص متصل ومتقن، مع ميزة التكبير والأنماط المتعددة والتنقل السريع.',
      icon: BookMarked,
      category: 'quran',
      categoryLabel: 'القرآن وعلومه',
      badge: 'مصحف المدينة',
      colorClass: 'text-purple-400',
      bgClass: 'bg-purple-950/40 hover:bg-purple-950/70',
      borderClass: 'border-purple-800/50 hover:border-purple-500',
      glowClass: 'from-purple-900/40 to-transparent'
    },
    {
      id: 'quran',
      title: 'فهرس سور القرآن',
      subtitle: '١١٤ سورة مع التفسير والترجمة',
      description: 'استعراض جميع سور القرآن الكريم مع التفسير الميسر، أسباب النزول، والاستماع للآيات صوتياً.',
      icon: BookOpen,
      category: 'quran',
      categoryLabel: 'القرآن وعلومه',
      badge: 'تفسير وتلاوة',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-950/40 hover:bg-emerald-950/70',
      borderClass: 'border-emerald-800/50 hover:border-emerald-500',
      glowClass: 'from-emerald-900/40 to-transparent'
    },
    {
      id: 'khatmah',
      title: 'ختمة القرآن الكريم',
      subtitle: 'متابعة الورد والخطط اليومية',
      description: 'حدد خطة ختمتك (جزء، حزب، حزبين يومياً) وتابع تقدمك ونسبة إنجازك بالصفحات والأيام وسجل القراءة.',
      icon: Flame,
      category: 'quran',
      categoryLabel: 'القرآن وعلومه',
      badge: 'خطة الختم',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-950/40 hover:bg-amber-950/70',
      borderClass: 'border-amber-800/50 hover:border-amber-500',
      glowClass: 'from-amber-900/40 to-transparent'
    },
    {
      id: 'tasmee',
      title: 'التسميع وتثبيت الحفظ',
      subtitle: 'اختبار الحفظ والتسميع الصوتي',
      description: 'أداة ذكية لتسميع آيات وسور القرآن صوتياً أو كتابياً، والتحقق من صحة القراءة وتثبيت المتشابهات.',
      icon: Mic,
      category: 'quran',
      categoryLabel: 'القرآن وعلومه',
      badge: 'تسميع ذكي',
      colorClass: 'text-teal-400',
      bgClass: 'bg-teal-950/40 hover:bg-teal-950/70',
      borderClass: 'border-teal-800/50 hover:border-teal-500',
      glowClass: 'from-teal-900/40 to-transparent'
    },
    {
      id: 'tajweed',
      title: 'دليل أحكام التجويد',
      subtitle: 'المخارج والصفات والأحكام',
      description: 'شرح مبسط ومرتب لأحكام النون الساكنة والتنوين والميم والمدود ومخارج الحروف مع أمثلة صوتية وتطبيقية.',
      icon: GraduationCap,
      category: 'quran',
      categoryLabel: 'القرآن وعلومه',
      badge: 'أحكام التلاوة',
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-950/40 hover:bg-cyan-950/70',
      borderClass: 'border-cyan-800/50 hover:border-cyan-500',
      glowClass: 'from-cyan-900/40 to-transparent'
    },

    // 2. Stories & Recitations
    {
      id: 'prophets',
      title: 'قصص الأنبياء والمرسلين',
      subtitle: 'سيرة ٢٥ نبياً مع كرتون هادف للأطفال',
      description: 'توثيق شامل لسيرة وقصص الأنبياء من القرآن والسنة، مع فيديوهات ورسوم متحركة للأطفال، معجزاتهم وأدعيتهم.',
      icon: Scroll,
      category: 'stories_recitations',
      categoryLabel: 'السير والتلاوات',
      badge: 'فيديوهات كرتون',
      colorClass: 'text-yellow-400',
      bgClass: 'bg-yellow-950/40 hover:bg-yellow-950/70',
      borderClass: 'border-yellow-800/50 hover:border-yellow-500',
      glowClass: 'from-yellow-900/40 to-transparent'
    },
    {
      id: 'reciters',
      title: 'مشاهير القراء والروايات',
      subtitle: 'أكثر من ١٥٠ قارئاً ومصحفاً',
      description: 'استمع وحمّل تلاوات كبار القراء بروايات حفص، ورش، قالون، والدوري، مع مصاحف الحرمين وأعلام التلاوة.',
      icon: Headphones,
      category: 'stories_recitations',
      categoryLabel: 'السير والتلاوات',
      badge: 'تلاوات صوتية',
      colorClass: 'text-indigo-400',
      bgClass: 'bg-indigo-950/40 hover:bg-indigo-950/70',
      borderClass: 'border-indigo-800/50 hover:border-indigo-500',
      glowClass: 'from-indigo-900/40 to-transparent'
    },

    // 3. Worship & Adhkar
    {
      id: 'prayers',
      title: 'مواقيت الصلاة والقبلة',
      subtitle: 'حساب دقيق للأوقات والأذان التلقائي',
      description: 'مواقيت الصلوات الخمس والشروق وقيام الليل لجميع مدن العالم مع بوصلة القبلة الدقيقة والتنبيه بالأذان.',
      icon: Compass,
      category: 'worship_dhikr',
      categoryLabel: 'العبادات والأذكار',
      badge: 'أوقات وأذان',
      colorClass: 'text-blue-400',
      bgClass: 'bg-blue-950/40 hover:bg-blue-950/70',
      borderClass: 'border-blue-800/50 hover:border-blue-500',
      glowClass: 'from-blue-900/40 to-transparent'
    },
    {
      id: 'adhkar',
      title: 'حصن المسلم والأذكار',
      subtitle: 'أذكار الصباح والمساء واليوم والليلة',
      description: 'أذكار الصباح والمساء، النوم، الاستيقاظ، الصلاة، بعدادات تفاعلية مريحة وفضائل كل ذكر من السنة.',
      icon: Sun,
      category: 'worship_dhikr',
      categoryLabel: 'العبادات والأذكار',
      badge: 'عداد الأذكار',
      colorClass: 'text-amber-300',
      bgClass: 'bg-orange-950/40 hover:bg-orange-950/70',
      borderClass: 'border-orange-800/50 hover:border-orange-500',
      glowClass: 'from-orange-900/40 to-transparent'
    },
    {
      id: 'duas',
      title: 'الأدعية المأثورة والأحاديث',
      subtitle: 'أدعية القرآن والسنة النبوية',
      description: 'موسوعة الأدعية القرآنية والنبوية الجامعة لمختلف الكرب والحاجات والشفاء ومواسم الخير مع أحاديث مختارة.',
      icon: Heart,
      category: 'worship_dhikr',
      categoryLabel: 'العبادات والأذكار',
      badge: 'أدعية مستجابة',
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-950/40 hover:bg-rose-950/70',
      borderClass: 'border-rose-800/50 hover:border-rose-500',
      glowClass: 'from-rose-900/40 to-transparent'
    },
    {
      id: 'tasbih',
      title: 'السبحة الإلكترونية',
      subtitle: 'مسبحة ذكية مع أوراد مخصصة',
      description: 'سبحة رقمية مع أذكار وتسبيحات متنوعة، واهتزاز تفاعلي عند كل تسبيحة، وسجل تلقائي لمجموع التسبيحات.',
      icon: Sparkles,
      category: 'worship_dhikr',
      categoryLabel: 'العبادات والأذكار',
      badge: 'تسبيح وذكر',
      colorClass: 'text-violet-400',
      bgClass: 'bg-violet-950/40 hover:bg-violet-950/70',
      borderClass: 'border-violet-800/50 hover:border-violet-500',
      glowClass: 'from-violet-900/40 to-transparent'
    },
    {
      id: 'hajj_umrah',
      title: 'الحرمين الشريفين والحج والعمرة',
      subtitle: 'دليل المناسك خطوة بخطوة وبث مباشر',
      description: 'دليل شامل ومصور لمناسك العمرة والحج، وأدعية الطواف والسعي، مع بث مباشر للحرم المكي والمسجد النبوي.',
      icon: MapPin,
      category: 'worship_dhikr',
      categoryLabel: 'العبادات والأذكار',
      badge: 'بث مباشر ومناسك',
      colorClass: 'text-emerald-300',
      bgClass: 'bg-emerald-950/40 hover:bg-emerald-950/70',
      borderClass: 'border-emerald-800/50 hover:border-emerald-500',
      glowClass: 'from-emerald-900/40 to-transparent'
    },

    // 4. Knowledge & Lectures
    {
      id: 'ai_scholar',
      title: 'المرشد الإسلامي الذكي',
      subtitle: 'إجابات وفتاوى مستندة للقرآن والسنة',
      description: 'مساعد ذكي للإجابة عن التساؤلات الدينية وشرح الآيات والأحاديث والأحكام الفقهية بمصادر موثوقة.',
      icon: Bot,
      category: 'knowledge_community',
      categoryLabel: 'العلم والدروس',
      badge: 'إرشاد وبحث',
      colorClass: 'text-sky-400',
      bgClass: 'bg-sky-950/40 hover:bg-sky-950/70',
      borderClass: 'border-sky-800/50 hover:border-sky-500',
      glowClass: 'from-sky-900/40 to-transparent'
    },
    {
      id: 'lectures',
      title: 'المرئيات والدروس المؤثرة',
      subtitle: 'محاضرات وسلاسل إيمانية لكبار العلماء',
      description: 'مكتبة مرئية غنية بدروس التفسير، السيرة النبوية، الفقه، وتزكية النفوس لكبار الدعاة والعلماء.',
      icon: Video,
      category: 'knowledge_community',
      categoryLabel: 'العلم والدروس',
      badge: 'محاضرات وسلاسل',
      colorClass: 'text-red-400',
      bgClass: 'bg-red-950/40 hover:bg-red-950/70',
      borderClass: 'border-red-800/50 hover:border-red-500',
      glowClass: 'from-red-900/40 to-transparent'
    }
  ];

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    return hubItems.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [hubItems, selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 font-cairo select-none pb-12">
      
      {/* Top Welcome Hero Banner */}
      <section 
        aria-label="الترحيب والمواقيت"
        className="rounded-3xl bg-gradient-to-br from-[#1B3224] via-[#14261B] to-[#0D1811] border border-[#2D4D38] p-5 sm:p-8 text-white shadow-2xl relative overflow-hidden"
      >
        {/* Background Islamic Arabesque Accent SVG */}
        <div className="absolute top-0 left-0 w-96 h-96 opacity-5 pointer-events-none -translate-x-1/4 -translate-y-1/4">
          <svg viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 0 L130 70 L200 100 L130 130 L100 200 L70 130 L0 100 L70 70 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Right: Greetings & Dates */}
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5B869]/20 border border-[#E5B869]/40 text-[#E5B869] text-xs font-bold font-arabic">
              <Sparkles className="w-3.5 h-3.5" />
              <span>طريق الهدى • الصفحة الرئيسية الشاملة</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-scheherazade text-amber-100 tracking-wide">
              مرحباً بك في طريق الهدى
            </h1>

            <p className="text-xs sm:text-sm text-[#A0B8A8] leading-relaxed">
              بوابتك الإسلامية المتكاملة للقرآن الكريم، قصص الأنبياء، الأذكار، مواقيت الصلاة، والتسميع. اختر ما تريد البدء به أدناه:
            </p>

            {/* Dates Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-300 font-arabic">
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-xl border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-[#E5B869]" />
                <span>{dateFormatted.hijri}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-xl border border-white/10">
                <span>{dateFormatted.gregorian}</span>
              </span>
            </div>
          </div>

          {/* Left: Quick Next Prayer Card */}
          <div className="w-full lg:w-auto flex-shrink-0 bg-black/40 border border-[#E5B869]/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between lg:flex-col lg:items-end gap-4 shadow-xl">
            <div className="text-right space-y-1">
              <span className="text-[11px] text-[#A0B8A8] font-bold block">الصلاة القادمة:</span>
              <p className="text-xl sm:text-2xl font-bold font-scheherazade text-[#E5B869]">
                {prayerTimes.nextPrayerName}
              </p>
              <span className="text-xs text-stone-300 block">
                متبقي: <strong className="text-white font-mono">{prayerTimes.timeToNext}</strong>
              </span>
              <span className="text-[10px] text-[#E5B869] block">
                ⏰ تنبيه صوتي قبل الصلاة بـ 15 دقيقة
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('prayers')}
                id="home-prayer-times-quick-btn"
                className="px-3.5 py-2 rounded-xl bg-[#E5B869] hover:bg-[#D99A45] text-[#142E20] text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-md cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>المواقيت والودجات</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Highlights (Continue Reading + Khatmah Progress) */}
      <section 
        aria-label="المتابعة السريعة والختمة"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        
        {/* Card 1: Continue Reading (General Reading - Independent) */}
        <div 
          onClick={() => {
            if (lastRead?.page) {
              onNavigate('reading', { page: lastRead.page, fromKhatmah: false });
            } else {
              onNavigate('reading', { page: 1, fromKhatmah: false });
            }
          }}
          className="cursor-pointer rounded-3xl bg-gradient-to-r from-purple-950/50 via-[#1C102E] to-purple-950/40 border border-purple-800/60 p-5 text-white shadow-xl hover:border-purple-400 transition-all hover:scale-[1.01] flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform shrink-0">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                  متابعة القراءة الحرة
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 font-bold">
                  حفظ مستقل
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-scheherazade text-white">
                {lastRead ? `سورة ${lastRead.surahName} (صفحة ${lastRead.page || '—'})` : 'المصحف الشريف (صفحة ١)'}
              </h3>
              <p className="text-xs text-purple-200/80 line-clamp-1">
                تصفح حر للمصحف دون التأثير على موضع الختمة
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-600/40 flex items-center justify-center text-white shrink-0 group-hover:-translate-x-1 transition-transform">
            <ChevronLeft className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Khatmah Plan / Daily Wird (Khatmah - Independent) */}
        <div 
          onClick={() => onNavigate('khatmah')}
          className="cursor-pointer rounded-3xl bg-gradient-to-r from-amber-950/50 via-[#271C0F] to-amber-950/40 border border-amber-800/60 p-5 text-white shadow-xl hover:border-amber-400 transition-all hover:scale-[1.01] flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  الورد والختمة القرآنية
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 font-bold">
                  موضع الختمة
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-scheherazade text-white">
                {khatmahPlan ? `موضع الختمة: صـ ${khatmahPlan.currentPage}` : 'ابدأ ختمتك القرآنية الآن'}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-amber-200/80 line-clamp-1">
                  {khatmahPlan 
                    ? `أنجزت ${Math.round((khatmahPlan.currentPage / 604) * 100)}% من الختمة`
                    : 'حدد وردك اليومي وتابع الإنجاز بانتظام'}
                </p>
                {khatmahPlan && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('reading', { page: khatmahPlan.currentPage, fromKhatmah: true });
                    }}
                    id="hub-resume-khatmah-btn"
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/40 text-amber-200 flex items-center gap-1 transition-all cursor-pointer"
                    title="فتح المصحف مباشرة في وضع الختمة"
                  >
                    <span>اقرأ الورد (صـ {khatmahPlan.currentPage})</span>
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-600/40 flex items-center justify-center text-white shrink-0 group-hover:-translate-x-1 transition-transform">
            <ChevronLeft className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Interactive Navigation Hub & Section Picker */}
      <section 
        aria-label="أقسام التطبيق والتبويبات"
        className="space-y-5"
      >
        
        {/* Search and Category Filter Controls */}
        <div className="space-y-3">
          
          {/* Category Tabs Grid - 100% Horizontal & Visible without scrolling */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                selectedCategory === 'all'
                  ? 'bg-[#E5B869] text-[#142E20] shadow-md shadow-[#E5B869]/25 ring-2 ring-white/30 font-black'
                  : 'bg-[#182C1E] text-stone-200 hover:text-white hover:bg-[#223A2A] border border-[#2D4536]'
              }`}
            >
              <span>جميع الأقسام</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-black/20">
                {hubItems.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('quran')}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                selectedCategory === 'quran'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-white/30 font-black'
                  : 'bg-[#182C1E] text-stone-200 hover:text-white hover:bg-[#223A2A] border border-[#2D4536]'
              }`}
            >
              <span>📖 القرآن وعلومه</span>
            </button>

            <button
              onClick={() => setSelectedCategory('stories_recitations')}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                selectedCategory === 'stories_recitations'
                  ? 'bg-yellow-600 text-white shadow-md shadow-yellow-600/30 ring-2 ring-white/30 font-black'
                  : 'bg-[#182C1E] text-stone-200 hover:text-white hover:bg-[#223A2A] border border-[#2D4536]'
              }`}
            >
              <span>📜 السير والتلاوات</span>
            </button>

            <button
              onClick={() => setSelectedCategory('worship_dhikr')}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                selectedCategory === 'worship_dhikr'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-white/30 font-black'
                  : 'bg-[#182C1E] text-stone-200 hover:text-white hover:bg-[#223A2A] border border-[#2D4536]'
              }`}
            >
              <span>🕌 العبادات والأذكار</span>
            </button>

            <button
              onClick={() => setSelectedCategory('knowledge_community')}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm col-span-2 sm:col-span-1 ${
                selectedCategory === 'knowledge_community'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-white/30 font-black'
                  : 'bg-[#182C1E] text-stone-200 hover:text-white hover:bg-[#223A2A] border border-[#2D4536]'
              }`}
            >
              <span>💡 العلم والدروس</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ابحث عن أي قسم أو ميزة في طريق الهدى (المصحف، الأنبياء، التجويد، الأذكار، التسميع...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-[#2D4D38] text-white text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:border-[#E5B869] font-arabic shadow-inner"
            />
            <Search className="w-4 h-4 text-[#E5B869] absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Hub Items Grid (All Sections as Grand Interactive Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                id={`hub-card-${item.id}`}
                className={`cursor-pointer rounded-3xl p-5 border ${item.borderClass} ${item.bgClass} backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between space-y-4 group relative overflow-hidden`}
              >
                {/* Top Glowing Ambient Line */}
                <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${item.glowClass}`}></div>

                {/* Card Top: Icon & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center ${item.colorClass} group-hover:scale-110 transition-transform shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-stone-200">
                    {item.badge || item.categoryLabel}
                  </span>
                </div>

                {/* Card Content: Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold font-scheherazade text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-stone-300 line-clamp-1">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Card Bottom: Entry CTA Button */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-stone-300 group-hover:text-white">
                  <span>فتح القسم</span>
                  <div className="flex items-center gap-1 text-[#E5B869] group-hover:-translate-x-1 transition-transform font-mono">
                    <span>انتقال</span>
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 space-y-3 bg-[#14261B]/60 rounded-3xl border border-[#2D4D38]">
            <Search className="w-8 h-8 text-[#E5B869] mx-auto opacity-70" />
            <p className="text-sm font-bold text-stone-200">لم يتم العثور على قسم يطابق بحثك</p>
            <p className="text-xs text-stone-400">جرب كتابة كلمات أخرى مثل: المصحف، الأنبياء، الأذكار، التجويد...</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-4 py-2 rounded-xl bg-[#E5B869] text-[#142E20] text-xs font-bold hover:bg-[#D99A45]"
            >
              عرض جميع الأقسام
            </button>
          </div>
        )}
      </section>

      {/* Dedication Banner / صدقة جارية Bottom Card */}
      {onOpenDedicationModal && (
        <section 
          onClick={onOpenDedicationModal}
          className="cursor-pointer rounded-3xl bg-gradient-to-r from-[#1B2B20] via-[#16251B] to-[#121E16] border border-[#E9B161]/40 p-5 sm:p-6 text-white shadow-xl hover:border-[#E5B869] transition-all flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤲</span>
            <div>
              <h4 className="font-bold text-base sm:text-lg text-amber-200 font-scheherazade">
                صدقة جارية ودعاء للمسلمين
              </h4>
              <p className="text-xs text-stone-300">
                عن روح المرحوم حسين الدسوقي رجب والمرحومة وجيهة عبدالجواد سكر وموتى المسلمين جميعاً.
              </p>
            </div>
          </div>
          <button 
            className="px-4 py-2 rounded-xl bg-[#E9B161] text-[#1B3022] font-bold text-xs shadow-md shrink-0"
          >
            قراءة الفاتحة والإهداء
          </button>
        </section>
      )}

    </div>
  );
};
