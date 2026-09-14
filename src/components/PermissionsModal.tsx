import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MapPin, 
  Volume2, 
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles,
  ChevronLeft,
  Settings,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { adhanScheduler } from '../services/adhanScheduler';
import { reverseGeocodeLocation } from '../utils/qiblaLocation';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied' | 'loading'>('prompt');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [enableNotifications, setEnableNotifications] = useState<boolean>(true);
  const [enableLocation, setEnableLocation] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check initial permissions state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setNotificationStatus(Notification.permission);
      }
      if ('permissions' in navigator && (navigator as any).permissions?.query) {
        (navigator as any).permissions.query({ name: 'geolocation' }).then((result: any) => {
          setLocationStatus(result.state);
          result.onchange = () => {
            setLocationStatus(result.state);
          };
        }).catch(() => {});
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGrantAll = async () => {
    setIsProcessing(true);
    try {
      // 1. Audio Engine unlock
      adhanScheduler.unlockAudioEngine();

      // 2. Request Notifications
      if ('Notification' in window && enableNotifications) {
        try {
          const res = await Notification.requestPermission();
          setNotificationStatus(res);
          if (res === 'granted') {
            localStorage.setItem('nour_notifications_enabled', 'true');
            // Try activating background service worker notification if ready
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({ type: 'SCHEDULE_PRAYER_NOTIFICATIONS' });
            }
          } else {
            localStorage.setItem('nour_notifications_enabled', 'false');
          }
        } catch (err) {
          console.warn('Notification permission error:', err);
        }
      }

      // 3. Request Geolocation
      if (enableLocation && 'geolocation' in navigator) {
        setLocationStatus('loading');
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              setLocationStatus('granted');
              try {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                localStorage.setItem('nour_user_lat', lat.toString());
                localStorage.setItem('nour_user_lng', lng.toString());
                localStorage.setItem('nour_use_gps', 'true');

                const geo = await reverseGeocodeLocation(lat, lng);
                const gpsCity = {
                  name: geo.cityName || 'موقعي الدقيق (GPS)',
                  country: geo.countryName || 'الموقع الجغرافي المباشر',
                  lat: lat,
                  lng: lng,
                  timezone: -new Date().getTimezoneOffset() / 60,
                  method: 5
                };
                localStorage.setItem('tareeq_selected_city', JSON.stringify(gpsCity));
                localStorage.setItem('nour_selected_city', JSON.stringify(gpsCity));

                window.dispatchEvent(new CustomEvent('nour_location_updated', {
                  detail: { lat, lng, city: gpsCity }
                }));
              } catch {}
              resolve();
            },
            () => {
              setLocationStatus('denied');
              resolve();
            },
            { timeout: 8000, enableHighAccuracy: true }
          );
        });
      }

      // Record that user made their decision
      localStorage.setItem('nour_permissions_prompted', 'true');
      localStorage.setItem('nour_permissions_accepted', 'true');

    } finally {
      setIsProcessing(false);
      if (onComplete) onComplete();
      onClose();
    }
  };

  const handleDeclineOrSkip = () => {
    // Record user preference to not prompt again unless manually opened
    localStorage.setItem('nour_permissions_prompted', 'true');
    localStorage.setItem('nour_permissions_accepted', 'false');
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 0.75rem), 0.75rem)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 0.75rem), 0.75rem)',
      }}
      onClick={handleDeclineOrSkip}
    >
      <div 
        className="w-full max-w-lg bg-[#142419] dark:bg-[#121212] border border-[#2D4536] dark:border-[#2D2D2D] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[#E0E7E1] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
        id="permissions-modal-dialog"
      >
        {/* Header Header Pattern */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-b from-[#1B3022] to-[#142419] dark:from-[#1E1E1E] dark:to-[#121212] border-b border-[#2D4536] dark:border-[#2D2D2D] text-center">
          <button
            onClick={handleDeclineOrSkip}
            className="absolute left-4 top-4 p-2 rounded-full text-[#A3B899] hover:text-white hover:bg-white/10 transition-colors"
            title="إغلاق أو تخطي"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#E9B161]/20 to-[#E9B161]/5 border border-[#E9B161]/40 flex items-center justify-center text-[#E9B161] shadow-lg shadow-[#E9B161]/10">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-amiri text-[#E9B161] tracking-wide">
            أذونات تطبيق طريق الهدى
          </h2>
          <p className="text-xs sm:text-sm text-[#A3B899] dark:text-[#9E9E9E] mt-1.5 leading-relaxed max-w-md mx-auto">
            نحترم خصوصيتك بالكامل. يمكنك قبول الأذونات للحصول على مواقيت دقيقة وتنبيهات الأذان، أو الرفض والمتابعة يدوياً.
          </p>
        </div>

        {/* Permissions List */}
        <div className="p-4 sm:p-6 space-y-3.5 max-h-[55vh] overflow-y-auto custom-scrollbar">
          {/* 1. Notifications Permission */}
          <div 
            onClick={() => setEnableNotifications(!enableNotifications)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              enableNotifications 
                ? 'bg-[#1D3325]/80 dark:bg-[#1C261F] border-[#E9B161]/50 shadow-sm' 
                : 'bg-[#101C14]/50 dark:bg-[#181818] border-[#24382B] opacity-75'
            }`}
          >
            <div className={`p-2.5 rounded-xl mt-0.5 ${enableNotifications ? 'bg-[#E9B161]/20 text-[#E9B161]' : 'bg-gray-800 text-gray-400'}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base text-white flex items-center gap-2">
                  إشعارات وتنبيهات الصلاة
                  {notificationStatus === 'granted' && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                      مفعل بالنظام
                    </span>
                  )}
                  {notificationStatus === 'denied' && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-normal">
                      محظور بالمتصفح
                    </span>
                  )}
                </h3>
                <input 
                  type="checkbox" 
                  checked={enableNotifications} 
                  onChange={(e) => setEnableNotifications(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E9B161] accent-[#E9B161] cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <p className="text-xs text-[#A3B899] dark:text-[#8E8E8E] mt-1 leading-relaxed">
                إرسال إشعار فوري عند دخول وقت كل صلاة مع إمكانية سماع الأذان، وتنبيهات أذكار الصباح والمساء.
              </p>
            </div>
          </div>

          {/* 2. Geolocation Permission */}
          <div 
            onClick={() => setEnableLocation(!enableLocation)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              enableLocation 
                ? 'bg-[#1D3325]/80 dark:bg-[#1C261F] border-[#E9B161]/50 shadow-sm' 
                : 'bg-[#101C14]/50 dark:bg-[#181818] border-[#24382B] opacity-75'
            }`}
          >
            <div className={`p-2.5 rounded-xl mt-0.5 ${enableLocation ? 'bg-[#E9B161]/20 text-[#E9B161]' : 'bg-gray-800 text-gray-400'}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base text-white flex items-center gap-2">
                  الموقع الجغرافي ومواقيت الصلاة
                  {locationStatus === 'granted' && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                      محدد
                    </span>
                  )}
                </h3>
                <input 
                  type="checkbox" 
                  checked={enableLocation} 
                  onChange={(e) => setEnableLocation(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E9B161] accent-[#E9B161] cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <p className="text-xs text-[#A3B899] dark:text-[#8E8E8E] mt-1 leading-relaxed">
                حساب مواقيت الصلوات الخمس بدقة لمدينتك وضبط بوصلة اتجاه القبلة نحو الكعبة المشرفة. (يمكنك دائماً اختيار المدينة يدوياً).
              </p>
            </div>
          </div>

          {/* 3. Audio Permission */}
          <div 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              audioEnabled 
                ? 'bg-[#1D3325]/80 dark:bg-[#1C261F] border-[#E9B161]/50 shadow-sm' 
                : 'bg-[#101C14]/50 dark:bg-[#181818] border-[#24382B] opacity-75'
            }`}
          >
            <div className={`p-2.5 rounded-xl mt-0.5 ${audioEnabled ? 'bg-[#E9B161]/20 text-[#E9B161]' : 'bg-gray-800 text-gray-400'}`}>
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base text-white">
                  محرك الصوت وتلاوة القرآن والأذان
                </h3>
                <input 
                  type="checkbox" 
                  checked={audioEnabled} 
                  onChange={(e) => setAudioEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E9B161] accent-[#E9B161] cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <p className="text-xs text-[#A3B899] dark:text-[#8E8E8E] mt-1 leading-relaxed">
                تهيئة مكبر الصوت لتشغيل تلاوات المصحف الشريف والأذان بصوت كبار القراء والمؤذنين بدون تقطيع.
              </p>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-[#111E15] dark:bg-[#161616] border border-[#203627] dark:border-[#2A2A2A] rounded-xl flex items-center gap-2.5 text-xs text-[#95AB93] dark:text-gray-400">
            <Lock className="w-4 h-4 text-[#E9B161] flex-shrink-0" />
            <span>بياناتك وموقعك لا يتم حفظها على أي خوادم خارجية ويتم معالجتها على هاتفك فقط.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 bg-[#101E14] dark:bg-[#0E0E0E] border-t border-[#2D4536] dark:border-[#2D2D2D] flex flex-col sm:flex-row-reverse items-center gap-2.5">
          <button
            onClick={handleGrantAll}
            disabled={isProcessing}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D49845] via-[#E9B161] to-[#D49845] text-[#122316] font-bold text-sm sm:text-base hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#E9B161]/20 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="inline-block w-5 h-5 border-2 border-[#122316] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>قبول وتفعيل الأذونات</span>
              </>
            )}
          </button>

          <button
            onClick={handleDeclineOrSkip}
            disabled={isProcessing}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#1C2F22] dark:bg-[#222222] border border-[#2D4536] dark:border-[#333333] text-[#A3B899] dark:text-[#AAAAAA] hover:text-white hover:bg-[#253D2D] text-sm font-medium transition-all"
          >
            رفض / المتابعة لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
};
