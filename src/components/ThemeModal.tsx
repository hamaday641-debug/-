import React from 'react';
import { X, Check, Palette, Sparkles, Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export interface ThemeOption {
  id: ThemeMode;
  name: string;
  subtitle: string;
  bgHex: string;
  cardHex: string;
  accentHex: string;
  borderHex: string;
  isDark: boolean;
  tag?: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'emerald',
    name: 'الزمردي الإسلامي المتوازن',
    subtitle: 'مظهر إسلامي مريح ومريح للعين مع تفاصيل ذهبية أصيلة',
    bgHex: '#15231A',
    cardHex: '#1B3022',
    accentHex: '#E9B161',
    borderHex: '#2D4536',
    isDark: true,
    tag: 'الافتراضي الموصى به'
  },
  {
    id: 'pitch_black',
    name: 'السواد الليلي الحالك (AMOLED)',
    subtitle: 'سواد نقي بنسبة 100% لتوفير البطارية وراحة قصوى في الظلام',
    bgHex: '#000000',
    cardHex: '#121212',
    accentHex: '#E9B161',
    borderHex: '#2E2E2E',
    isDark: true,
    tag: 'AMOLED 100%'
  },
  {
    id: 'royal_purple',
    name: 'البنفسجي الملكي الفاخر',
    subtitle: 'طابع ملكي مريح وهادئ بتدرجات البنفسجي والذهب المطفي',
    bgHex: '#090414',
    cardHex: '#130B24',
    accentHex: '#C084FC',
    borderHex: '#3B1D6B',
    isDark: true,
    tag: 'ملكي فاخر'
  },
  {
    id: 'midnight_navy',
    name: 'الكحلي الليلي الهادئ (Navy)',
    subtitle: 'أزرق كحلي عميق مستوحى من سماء الليل مع لمسات زرقاء مضيئة',
    bgHex: '#070D18',
    cardHex: '#0F172A',
    accentHex: '#38BDF8',
    borderHex: '#334155',
    isDark: true,
    tag: 'أزرق كحلي'
  },
  {
    id: 'warm_amber',
    name: 'الورقي الدافئ (Amber Parchment)',
    subtitle: 'أجواء المخطوطات والرق القديم المريحة للقراءة المطولة',
    bgHex: '#1C150D',
    cardHex: '#291E13',
    accentHex: '#F59E0B',
    borderHex: '#573E24',
    isDark: true,
    tag: 'مخطوطة دافئة'
  },
  {
    id: 'pure_white',
    name: 'الأبيض الصافي (Paper White)',
    subtitle: 'قراءة نهارية عالية الوضوح والتباين مثل ورق المصحف المطبوع',
    bgHex: '#FFFFFF',
    cardHex: '#F8FAFC',
    accentHex: '#1B3022',
    borderHex: '#CBD5E1',
    isDark: false,
    tag: 'ورقي أبيض'
  },
  {
    id: 'light',
    name: 'النهاري المنعش (Light Fresh)',
    subtitle: 'وضع نهاري ناصع بدرجات العاجي والأخضر الهادئ',
    bgHex: '#F4F7F5',
    cardHex: '#FFFFFF',
    accentHex: '#166534',
    borderHex: '#D1D5DB',
    isDark: false,
    tag: 'نهاري كلاسيكي'
  }
];

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 1rem), 1rem)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 1rem), 1rem)',
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#142419] dark:bg-[#121212] border border-[#2D4536] dark:border-[#333333] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#E0E7E1] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D4536] dark:border-[#262626] bg-[#182B1E]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9B161]/20 border border-[#E9B161]/40 flex items-center justify-center text-[#E9B161]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#E9B161] font-scheherazade">
                مظهر وثيمات التطبيق
              </h2>
              <p className="text-xs text-[#A8BCAD]">
                اختر لوحة الألوان والإضاءة الأنسب لعينيك للقراءة والاستماع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Themes Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEME_OPTIONS.map((th) => {
              const isSelected = currentTheme === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => {
                    onSelectTheme(th.id);
                  }}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 relative overflow-hidden group ${
                    isSelected
                      ? 'border-[#E9B161] ring-2 ring-[#E9B161]/50 shadow-lg scale-[1.01]'
                      : 'border-[#2D4536] hover:border-[#4B6B55] hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: th.cardHex,
                    borderColor: isSelected ? th.accentHex : th.borderHex
                  }}
                >
                  {/* Top bar with colors preview */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full border border-white/30 shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: th.bgHex }}
                      >
                        <div 
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: th.accentHex }}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        {th.isDark ? (
                          <Moon className="w-3.5 h-3.5 text-stone-400" />
                        ) : (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{
                          backgroundColor: `${th.accentHex}25`,
                          color: th.accentHex
                        }}>
                          {th.tag}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#E9B161] bg-[#142419] px-2 py-0.5 rounded-full border border-[#E9B161]/50">
                        <Check className="w-3.5 h-3.5" />
                        <span>نشط الآن</span>
                      </span>
                    )}
                  </div>

                  {/* Title and details */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-white flex items-center justify-between">
                      <span>{th.name}</span>
                    </h3>
                    <p className="text-xs text-stone-300/80 leading-relaxed">
                      {th.subtitle}
                    </p>
                  </div>

                  {/* Mini Palette preview line */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-stone-400">التدرج:</span>
                    <div className="flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-md border border-white/20" style={{ backgroundColor: th.bgHex }} title="الخلفية" />
                      <span className="w-3.5 h-3.5 rounded-md border border-white/20" style={{ backgroundColor: th.cardHex }} title="البطاقات" />
                      <span className="w-3.5 h-3.5 rounded-md border border-white/20" style={{ backgroundColor: th.accentHex }} title="اللون المميز" />
                      <span className="w-3.5 h-3.5 rounded-md border border-white/20" style={{ backgroundColor: th.borderHex }} title="الإطارات" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2D4536] dark:border-[#262626] bg-[#182B1E]/90 flex items-center justify-between">
          <p className="text-xs text-[#A8BCAD]">
            يتم حفظ اختيارك وتطبيقه تلقائياً على كامل التطبيق والمصحف الشريف
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#E9B161] hover:bg-[#D99A45] text-[#1B3022] font-bold text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
