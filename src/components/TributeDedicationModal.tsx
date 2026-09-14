import React from 'react';
import { Heart, Sparkles, X, Share2, BookOpen, Star } from 'lucide-react';

interface TributeDedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TributeDedicationModal: React.FC<TributeDedicationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'صدقة جارية • طريق الهدى',
        text: 'هذا التطبيق صدقة جارية خالصة لوجه الله تعالى عني وعن جميع المسلمين والمسلمات وعن روح المرحوم حسين الدسوقي رجب والمرحومة وجيهة عبدالجواد سكر وعن أرواح موتانا وموتى المسلمين جميعاً. نسألكم الفاتحة والدعاء لهم بالرحمة.',
        url: window.location.href
      }).catch(console.warn);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 1rem), 1rem)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 1rem), 1rem)',
      }}
    >
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#182A1E] via-[#122016] to-[#0A130D] border-2 border-[#E9B161]/50 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#E9B161]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#2D4536]/30 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#E9B161]/20 border-2 border-[#E9B161] flex items-center justify-center text-[#E9B161] shadow-lg animate-pulse">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#E9B161] tracking-widest">بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ</span>
            <h2 className="text-xl sm:text-2xl font-bold font-arabic text-stone-100">
              إهداء وصدقة جارية لوجه الله تعالى
            </h2>
          </div>
        </div>

        {/* Tribute Noble Body Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#142318]/90 border border-[#2D4536] space-y-4 text-center">
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-arabic font-medium">
            «هذا التطبيق <span className="text-[#E9B161] font-bold">صدقة جارية</span> خالصة لوجه الله تعالى عنّي وعن جميع المسلمين والمسلمات، الأحياء منهم والأموات،
          </p>

          <div className="py-2 border-y border-[#2D4536]/60 space-y-2">
            <p className="text-[#E9B161] font-bold text-base sm:text-lg font-arabic">
              وعن روح المغفور له بإذن الله تعالى / <br />
              <span className="text-white text-lg sm:text-xl underline decoration-[#E9B161]/60 underline-offset-4">
                حسين الدسوقي رجب
              </span>
            </p>

            <p className="text-[#E9B161] font-bold text-base sm:text-lg font-arabic">
              وعن روح المغفور لها بإذن الله تعالى / <br />
              <span className="text-white text-lg sm:text-xl underline decoration-[#E9B161]/60 underline-offset-4">
                وجيهة عبدالجواد سكر
              </span>
            </p>
          </div>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            وعلى أرواح آبائنا وأمهاتنا وموتانا وموتى المسلمين جميعاً.. نسأل الله العلي القدير أن يتغمدهم بواسع رحمته، وأن يفسح لهم في قبورهم، وأن يجعل كل حرفٍ يُتلى، وكل تسبيحةٍ تُقال، وكل صلاةٍ يُنادى لها في هذا التطبيق نوراً وضياءً وأجراً جارياً في موازين حسناتهم إلى يوم القيامة.»
          </p>

          <div className="pt-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#E9B161]/20 text-[#E9B161] text-xs font-bold border border-[#E9B161]/40">
              نسألكم الفاتحة والدعاء لهم ولموتى المسلمين جميعاً بالرحمة والمغفرة 🤲
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-2xl bg-[#E9B161] hover:bg-[#D99A45] text-[#1B3022] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>نشر التطبيق طلباً للأجر والصدقة الجارية</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
