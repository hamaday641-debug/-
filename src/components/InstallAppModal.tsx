import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Apple, 
  Monitor, 
  Share2, 
  Check, 
  Copy, 
  X, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Zap,
  WifiOff
} from 'lucide-react';
import { markAppAsInstalled } from '../utils/pwaUtils';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPromptSuccess: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPromptSuccess
}) => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'pc'>('android');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if already opened in standalone PWA mode
    const isApp = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!isApp);

    // Auto-detect user platform
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setActivePlatform('ios');
    } else if (/android/.test(ua)) {
      setActivePlatform('android');
    } else {
      setActivePlatform('pc');
    }
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        markAppAsInstalled();
        onInstallPromptSuccess();
        onClose();
      }
    }
  };

  const handleCopyAppUrl = () => {
    const url = window.location.origin || window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 0.75rem), 0.75rem)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 0.75rem), 0.75rem)',
      }}
    >
      <div 
        className="w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#142419] via-[#1B3022] to-[#0D1811] border border-[#3D5A47] text-white shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#2D4536]/80 bg-[#101F15]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E9B161] to-[#C99042] text-[#1B3022] flex items-center justify-center shadow-lg shadow-[#E9B161]/20 font-bold shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-scheherazade">
                تثبيت تطبيق "طريق الهدى" على الهاتف
              </h3>
              <p className="text-[11px] text-[#A8BCAD]">
                تطبيق كامل بدون إعلانات • سريع • يعمل بدون إنترنت
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1B3022] hover:bg-[#2D4536] text-[#A8BCAD] hover:text-white border border-[#3D5A47] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Direct 1-Click Install Button (When Browser Prompt is Ready) */}
          {deferredPrompt && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E9B161]/20 via-[#E9B161]/10 to-transparent border border-[#E9B161]/50 space-y-3">
              <div className="flex items-center gap-2 text-[#E9B161] text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>متصفحك يدعم التثبيت الفوري بنقرة واحدة:</span>
              </div>
              <button
                onClick={handleNativeInstall}
                id="modal-direct-install-btn"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E9B161] to-[#D99A45] hover:brightness-110 active:scale-95 text-[#142419] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#E9B161]/25 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>تثبيت التطبيق الآن على جهازك</span>
              </button>
            </div>
          )}

          {/* Key Advantages */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#101F15] border border-[#2D4536]">
              <Zap className="w-4 h-4 text-[#E9B161] mx-auto mb-1" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#E0E7E1] block">سريع وخفيف</span>
              <span className="text-[9px] text-[#7A8C80]">لا يستهلك ذاكرة</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#101F15] border border-[#2D4536]">
              <WifiOff className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#E0E7E1] block">يعمل بدون نت</span>
              <span className="text-[9px] text-[#7A8C80]">للقراءة والاستماع</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#101F15] border border-[#2D4536]">
              <ShieldCheck className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#E0E7E1] block">بدون إعلانات</span>
              <span className="text-[9px] text-[#7A8C80]">مجاني لوجه الله</span>
            </div>
          </div>

          {/* Platform Selector Tabs */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#A8BCAD] block">
              طريقة التثبيت حسب نوع جهازك:
            </span>

            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#101F15] border border-[#2D4536]">
              <button
                onClick={() => setActivePlatform('android')}
                className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activePlatform === 'android'
                    ? 'bg-[#E9B161] text-[#142419] shadow-sm'
                    : 'text-[#A8BCAD] hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>أندرويد</span>
              </button>

              <button
                onClick={() => setActivePlatform('ios')}
                className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activePlatform === 'ios'
                    ? 'bg-[#E9B161] text-[#142419] shadow-sm'
                    : 'text-[#A8BCAD] hover:text-white'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>آيفون / آيباد</span>
              </button>

              <button
                onClick={() => setActivePlatform('pc')}
                className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activePlatform === 'pc'
                    ? 'bg-[#E9B161] text-[#142419] shadow-sm'
                    : 'text-[#A8BCAD] hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>الكمبيوتر</span>
              </button>
            </div>
          </div>

          {/* Platform Detailed Guide */}
          <div className="p-4 rounded-2xl bg-[#101F15] border border-[#2D4536] text-xs space-y-3">
            {activePlatform === 'android' && (
              <div className="space-y-2.5 leading-relaxed text-[#E0E7E1]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4536] text-[#E9B161] flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                  <span>افتح هذا الرابط في متصفح <strong>Google Chrome</strong> أو <strong>Samsung Internet</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4536] text-[#E9B161] flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                  <span>اضغط على زر القائمة <strong>(الثلاث نقاط ⋮)</strong> بأعلى الشاشة.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4536] text-[#E9B161] flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                  <span>اختر <strong>«تثبيت التطبيق» (Install app)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</span>
                </div>
              </div>
            )}

            {activePlatform === 'ios' && (
              <div className="space-y-2.5 leading-relaxed text-[#E0E7E1]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4536] text-[#E9B161] flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                  <span>تأكد من فتح الرابط داخل متصفح <strong>Safari</strong> الأصلي للآيفون.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4536] text-[#E9B161] flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                  <span>اضغط على زر <strong>المشاركة (Share) ⬆️</strong> في أسفل شاشة المتصفح.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4536] text-[#E9B161] flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                  <span>مرر للأسفل واختر <strong>«إضافة إلى الصفحة الرئيسية» ➕ (Add to Home Screen)</strong>.</span>
                </div>
              </div>
            )}

            {activePlatform === 'pc' && (
              <div className="space-y-2.5 leading-relaxed text-[#E0E7E1]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4536] text-[#E9B161] flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                  <span>في متصفح <strong>Google Chrome</strong> أو <strong>Microsoft Edge</strong> على جهازك.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4536] text-[#E9B161] flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                  <span>ستجد أيقونة تثبيت صغيرة 🖥️ داخل <strong>شريط عنوان المتصفح</strong> في أعلى اليمين.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4536] text-[#E9B161] flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                  <span>انقر عليها واضغط <strong>«تثبيت» (Install)</strong> وسيفتح كتطبيق مستقل على سطح المكتب.</span>
                </div>
              </div>
            )}
          </div>

          {/* Share App Link with Others */}
          <div className="p-4 rounded-2xl bg-[#101F15] border border-[#2D4536] space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#E9B161]" />
              <span>مشاركة رابط التطبيق مع الأهل والأصدقاء:</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={window.location.origin || window.location.href}
                className="flex-1 px-3 py-2 rounded-xl bg-[#1B3022] border border-[#3D5A47] text-white text-xs font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyAppUrl}
                className="px-3.5 py-2 rounded-xl bg-[#2D4536] hover:bg-[#3D5A47] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#E9B161]" />}
                <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#101F15] border-t border-[#2D4536] flex items-center justify-between text-xs">
          <span className="text-[#A8BCAD]">
            طريق الهدى • صدقة جارية
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D4536] hover:bg-[#3D5A47] text-white font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
