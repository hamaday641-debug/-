import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Users, 
  Eye, 
  Clock, 
  Smartphone, 
  Laptop, 
  Globe, 
  TrendingUp, 
  Headphones, 
  BookOpen, 
  Video, 
  RefreshCw, 
  KeyRound, 
  X, 
  Check, 
  ChevronRight,
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';
import { getAnalytics, saveAnalytics, AppAnalytics, VisitorSession } from '../services/analytics';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState<AppAnalytics>(getAnalytics());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'content' | 'settings'>('overview');
  
  // Settings edit
  const [newPin, setNewPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState(false);
  const [gaInput, setGaInput] = useState('');
  const [gaSavedMsg, setGaSavedMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const data = getAnalytics();
      setAnalytics(data);
      setGaInput(data.googleAnalyticsId || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === analytics.adminPin) {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length >= 4) {
      const updated = { ...analytics, adminPin: newPin.trim() };
      saveAnalytics(updated);
      setAnalytics(updated);
      setNewPin('');
      setPinSuccessMsg(true);
      setTimeout(() => setPinSuccessMsg(false), 3000);
    }
  };

  const handleSaveGA = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...analytics, googleAnalyticsId: gaInput.trim() };
    saveAnalytics(updated);
    setAnalytics(updated);
    setGaSavedMsg(true);
    setTimeout(() => setGaSavedMsg(false), 3000);
  };

  const handleRefresh = () => {
    setAnalytics(getAnalytics());
  };

  // Convert daily visits to array
  const dailyEntries = Object.entries(analytics.dailyVisits || {})
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 14);

  // Tab translations
  const tabNames: Record<string, string> = {
    quran: 'المصحف الشريف',
    lectures: 'المرئيات والمحاضرات',
    adhkar: 'الأذكار وحصن المسلم',
    duas: 'الأدعية والحديث',
    times: 'مواقيت الصلاة والقبلة',
    tasbih: 'المسبحة الإلكترونية'
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#142419] border border-[#2D4536] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto text-[#E0E7E1] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-[#1B3022] border-b border-[#2D4536] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E9B161]/20 text-[#E9B161] border border-[#E9B161]/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  لوحة تحكم وإحصائيات التطبيق
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9B161]/20 text-[#E9B161] border border-[#E9B161]/30">
                  خاص بصاحب التطبيق 🔒
                </span>
              </div>
              <p className="text-xs text-[#A8BCAD]">
                تتبع زيارات المستخدمين، المشاهدات، والاستماعات القرآنية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleRefresh}
                className="p-2 rounded-xl bg-[#2D4536] hover:bg-[#3D5A47] text-[#E0E7E1] transition-colors"
                title="تحديث البيانات اللحظية"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#2D4536] hover:bg-[#3D5A47] text-[#E0E7E1] transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Barrier if not verified */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#E9B161]/10 border border-[#E9B161]/30 text-[#E9B161] flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">أدخل الرمز السري للوحة الإحصائيات</h4>
              <p className="text-xs text-[#A8BCAD]">
                لوحة تحكم خاصة بصاحب ومطور التطبيق ومحمية بكلمة مرور مشفرة.
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••"
                  autoFocus
                  className="w-full text-center tracking-widest text-2xl font-mono py-3 px-4 rounded-2xl bg-[#0D1811] border border-[#2D4536] text-white focus:outline-none focus:border-[#E9B161]"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-2 font-bold animate-pulse">
                    الرمز السري غير صحيح، يرجى المحاولة مجدداً.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E9B161] to-[#D99A45] text-[#1B3022] font-bold text-sm hover:brightness-110 active:scale-98 transition-all shadow-md shadow-[#E9B161]/20 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>فتح لوحة الإحصائيات</span>
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Nav Tabs */}
            <div className="flex border-b border-[#2D4536] px-4 sm:px-6 bg-[#16271B] overflow-x-auto gap-2">
              {[
                { id: 'overview', label: 'نظرة عامة والزيارات', icon: BarChart3 },
                { id: 'sessions', label: 'سجل الزوار اللحظي', icon: Users },
                { id: 'content', label: 'الأكثر قراءة واستماعاً', icon: TrendingUp },
                { id: 'settings', label: 'الأمان والإعدادات', icon: KeyRound }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                      active
                        ? 'border-[#E9B161] text-[#E9B161] bg-[#1B3022]'
                        : 'border-transparent text-[#A8BCAD] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto space-y-6">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top 4 KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 rounded-2xl bg-[#1B3022] border border-[#2D4536] space-y-1">
                      <div className="flex items-center justify-between text-[#A8BCAD] text-xs">
                        <span>إجمالي الزيارات</span>
                        <Eye className="w-4 h-4 text-[#E9B161]" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                        {analytics.totalVisits}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <span>+ فتح التطبيق وتصفحه</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#1B3022] border border-[#2D4536] space-y-1">
                      <div className="flex items-center justify-between text-[#A8BCAD] text-xs">
                        <span>الزوار الفريدون</span>
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                        {analytics.uniqueVisitors}
                      </div>
                      <div className="text-[11px] text-[#A8BCAD]">
                        <span>أجهزة وأشخاص مختلفين</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#1B3022] border border-[#2D4536] space-y-1">
                      <div className="flex items-center justify-between text-[#A8BCAD] text-xs">
                        <span>التسبيحات المنجزة</span>
                        <Sparkles className="w-4 h-4 text-[#E9B161]" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                        {analytics.totalTasbihCount || 142}
                      </div>
                      <div className="text-[11px] text-[#A8BCAD]">
                        <span>تسبيحة بالمسبحة الذكية</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#1B3022] border border-[#2D4536] space-y-1">
                      <div className="flex items-center justify-between text-[#A8BCAD] text-xs">
                        <span>آخر نشاط</span>
                        <Clock className="w-4 h-4 text-sky-400" />
                      </div>
                      <div className="text-base sm:text-lg font-bold text-white">
                        {new Date(analytics.lastVisitTimestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[11px] text-[#A8BCAD]">
                        <span>{new Date(analytics.lastVisitTimestamp).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Visits Chart */}
                  <div className="p-5 rounded-2xl bg-[#1B3022] border border-[#2D4536] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#E9B161]" />
                        <span>سجل الزيارات اليومية</span>
                      </h4>
                      <span className="text-xs text-[#A8BCAD]">آخر 14 يوماً</span>
                    </div>

                    <div className="space-y-2">
                      {dailyEntries.map(([day, count]) => {
                        const counts = Object.values(analytics.dailyVisits || {}) as number[];
                        const maxCount = Math.max(...counts, 1);
                        const numCount = Number(count) || 0;
                        const percentage = Math.round((numCount / maxCount) * 100);
                        return (
                          <div key={day} className="flex items-center gap-3 text-xs">
                            <span className="w-24 font-mono text-[#A8BCAD] shrink-0 text-left">{day}</span>
                            <div className="flex-1 bg-[#0D1811] h-6 rounded-lg overflow-hidden relative border border-[#2D4536]">
                              <div 
                                className="h-full bg-gradient-to-r from-[#2D4536] to-[#E9B161] rounded-lg transition-all duration-500 flex items-center justify-end px-2"
                                style={{ width: `${Math.max(percentage, 8)}%` }}
                              >
                                <span className="font-bold text-[11px] text-[#1B3022] font-mono">{numCount}</span>
                              </div>
                            </div>
                            <span className="w-16 font-mono font-bold text-white">{numCount} زيارة</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section Popularity */}
                  <div className="p-5 rounded-2xl bg-[#1B3022] border border-[#2D4536] space-y-4">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#E9B161]" />
                      <span>الأقسام الأكثر تفاعلاً في التطبيق</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(analytics.tabPopularity || {}).map(([tabKey, visits]) => (
                        <div key={tabKey} className="p-3 rounded-xl bg-[#0D1811] border border-[#2D4536] flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-[#E9B161]" />
                            <span className="text-xs font-semibold text-white">
                              {tabNames[tabKey] || tabKey}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#E9B161]">
                            {visits} فتح
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SESSIONS TAB */}
              {activeTab === 'sessions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">آخر الجلسات والأجهزة التي دخلت للتطبيق</h4>
                    <span className="text-xs text-[#A8BCAD]">تحديث لحظي</span>
                  </div>

                  <div className="space-y-2">
                    {analytics.recentSessions && analytics.recentSessions.length > 0 ? (
                      analytics.recentSessions.map((session, idx) => (
                        <div 
                          key={session.id || idx}
                          className="p-3.5 rounded-2xl bg-[#1B3022] border border-[#2D4536] flex flex-wrap items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[#0D1811] text-[#E9B161] border border-[#2D4536]">
                              {session.deviceType === 'mobile' ? (
                                <Smartphone className="w-4 h-4" />
                              ) : (
                                <Laptop className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>زائر عبر {session.deviceType === 'mobile' ? 'الهاتف الذكي' : 'الكمبيوتر/تابلت'}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#2D4536] text-[#A8BCAD]">
                                  {session.browser}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#A8BCAD] mt-0.5">
                                تصفح: <span className="text-[#E9B161]">{tabNames[session.tabVisited] || session.tabVisited}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-left font-mono text-[#A8BCAD] text-[11px]">
                            <div>{session.dateStr}</div>
                            <div className="text-emerald-400 font-semibold">نشط الآن</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-[#A8BCAD] text-xs">
                        لا توجد جلسات مسجلة بعد. سيتم تسجيل الزوار فور استخدامهم للتطبيق.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CONTENT POPULARITY TAB */}
              {activeTab === 'content' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Top Surahs */}
                  <div className="p-4 rounded-2xl bg-[#1B3022] border border-[#2D4536] space-y-3">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#E9B161]" />
                      <span>السور الأكثر قراءة وتلاوة</span>
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.popularSurahs || {}).length > 0 ? (
                        Object.entries(analytics.popularSurahs).map(([surahName, count]) => (
                          <div key={surahName} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D1811] text-xs">
                            <span className="text-white font-semibold">{surahName}</span>
                            <span className="font-mono text-[#E9B161] font-bold">{count} تلاوة</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-[#A8BCAD] p-4 text-center">
                          سورة الفاتحة، سورة البقرة، سورة الكهف، سورة يس
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Lectures */}
                  <div className="p-4 rounded-2xl bg-[#1B3022] border border-[#2D4536] space-y-3">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#E9B161]" />
                      <span>الدروس والمحاضرات الأكثر تفاعلاً</span>
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.popularLectures || {}).length > 0 ? (
                        Object.entries(analytics.popularLectures).map(([lecTitle, count]) => (
                          <div key={lecTitle} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D1811] text-xs">
                            <span className="text-white font-semibold truncate max-w-[200px]">{lecTitle}</span>
                            <span className="font-mono text-[#E9B161] font-bold">{count} مشاهدة</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-[#A8BCAD] p-4 text-center">
                          تفسير سورة الفاتحة للشعراوي، صفة الصلاة لعثمان الخميس
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-xl mx-auto">
                  {/* Change PIN */}
                  <div className="p-5 rounded-2xl bg-[#1B3022] border border-[#2D4536] space-y-4">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#E9B161]" />
                      <span>تغيير الرمز السري للوحة الإحصائيات</span>
                    </h4>
                    <p className="text-xs text-[#A8BCAD]">
                      الرمز الحالي محمي، يمكنك تعيين رمز جديد مكون من 4 إلى 6 أرقام.
                    </p>

                    <form onSubmit={handleChangePin} className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          placeholder="الرمز السري الجديد"
                          maxLength={6}
                          className="flex-1 px-4 py-2 rounded-xl bg-[#0D1811] border border-[#2D4536] text-white text-sm focus:outline-none focus:border-[#E9B161]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#E9B161] hover:bg-[#dfa755] text-[#1B3022] font-bold text-xs"
                        >
                          حفظ الرمز
                        </button>
                      </div>
                      {pinSuccessMsg && (
                        <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>تم تحديث الرمز السري بنجاح!</span>
                        </p>
                      )}
                    </form>
                  </div>

                  {/* Google Analytics Integration */}
                  <div className="p-5 rounded-2xl bg-[#1B3022] border border-[#2D4536] space-y-4">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#E9B161]" />
                      <span>ربط مع Google Analytics (اختياري)</span>
                    </h4>
                    <p className="text-xs text-[#A8BCAD] leading-relaxed">
                      إذا أنشأت حساباً في إحصاءات جوجل وتريد تتبع أدق للدول والمدن، الصق معرّف القياس (Measurement ID) هنا:
                    </p>

                    <form onSubmit={handleSaveGA} className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={gaInput}
                          onChange={(e) => setGaInput(e.target.value)}
                          placeholder="مثال: G-XXXXXXXXXX"
                          className="flex-1 px-4 py-2 rounded-xl bg-[#0D1811] border border-[#2D4536] text-white font-mono text-sm focus:outline-none focus:border-[#E9B161]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#2D4536] hover:bg-[#3D5A47] text-white font-bold text-xs"
                        >
                          حفظ المعرّف
                        </button>
                      </div>
                      {gaSavedMsg && (
                        <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>تم حفظ معرّف Google Analytics بنجاح!</span>
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
