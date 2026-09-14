import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Check, 
  Trash2, 
  HardDrive, 
  Radio, 
  Volume2, 
  Sparkles, 
  X, 
  RefreshCw,
  Play,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { SURAHS_LIST } from '../data/surahs';
import { RECITERS_LIST } from '../data/reciters';
import { 
  downloadSurahForOffline, 
  precacheAllAdhans, 
  getAllDownloadedSurahs, 
  deleteDownloadedSurah,
  DownloadProgress 
} from '../services/offlineAudioService';
import { useAudio } from '../context/AudioContext';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({ isOpen, onClose }) => {
  const { currentReciter, playSurah } = useAudio();

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [downloadedList, setDownloadedList] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1); // Default Al-Fatihah
  const [selectedReciterId, setSelectedReciterId] = useState<string>(currentReciter.id);

  // Active download state
  const [currentProgress, setCurrentProgress] = useState<DownloadProgress | null>(null);
  const [adhanProgressMsg, setAdhanProgressMsg] = useState<string | null>(null);
  const [adhanProgressPct, setAdhanProgressPct] = useState<number>(0);
  const [isAdhanDownloading, setIsAdhanDownloading] = useState(false);

  // Quick download Juz 30 state
  const [isJuzDownloading, setIsJuzDownloading] = useState(false);
  const [juzProgressMsg, setJuzProgressMsg] = useState<string | null>(null);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshDownloaded = async () => {
    const list = await getAllDownloadedSurahs();
    setDownloadedList(list);
  };

  useEffect(() => {
    if (isOpen) {
      refreshDownloaded();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetReciterObj = RECITERS_LIST.find((r) => r.id === selectedReciterId) || RECITERS_LIST[0];
  const targetSurahObj = SURAHS_LIST.find((s) => s.number === selectedSurah) || SURAHS_LIST[0];

  // Handle single Surah download
  const handleStartDownload = async () => {
    if (!targetSurahObj || !targetReciterObj) return;

    await downloadSurahForOffline(
      targetSurahObj.number,
      targetReciterObj.everyAyahFolder,
      targetReciterObj.id,
      targetSurahObj.numberOfAyahs,
      (prog) => {
        setCurrentProgress(prog);
        if (prog.status === 'completed') {
          refreshDownloaded();
        }
      }
    );
  };

  // Handle all Adhans download
  const handleDownloadAllAdhans = async () => {
    setIsAdhanDownloading(true);
    setAdhanProgressMsg('جاري بدء حفظ أصوات الأذان...');
    setAdhanProgressPct(10);

    await precacheAllAdhans((msg, pct) => {
      setAdhanProgressMsg(msg);
      setAdhanProgressPct(pct);
    });

    setIsAdhanDownloading(false);
    setTimeout(() => {
      setAdhanProgressMsg(null);
    }, 4000);
  };

  // Handle Juz 30 (قصار السور) 1-click download
  const handleDownloadJuzAmma = async () => {
    setIsJuzDownloading(true);
    const juz30Surahs = SURAHS_LIST.filter((s) => s.number >= 78 && s.number <= 114);

    for (let i = 0; i < juz30Surahs.length; i++) {
      const s = juz30Surahs[i];
      setJuzProgressMsg(`جاري تحميل سورة ${s.name} (${i + 1}/${juz30Surahs.length})...`);

      await downloadSurahForOffline(
        s.number,
        targetReciterObj.everyAyahFolder,
        targetReciterObj.id,
        s.numberOfAyahs
      );
    }

    setIsJuzDownloading(false);
    setJuzProgressMsg('تم تحميل جزء عم (قصار السور) كاملاً للعمل بدون إنترنت!');
    refreshDownloaded();

    setTimeout(() => {
      setJuzProgressMsg(null);
    }, 4000);
  };

  const handleDeleteDownloaded = async (surahNumber: number, reciterId: string) => {
    await deleteDownloadedSurah(surahNumber, reciterId);
    refreshDownloaded();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 0.75rem), 0.75rem)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 0.75rem), 0.75rem)',
      }}
    >
      <div 
        className="w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#142419] via-[#1B3022] to-[#0E1A11] border border-[#3D5A47] text-white shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#2D4536]/80 bg-[#101F15]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9B161]/20 border border-[#E9B161]/50 flex items-center justify-center text-[#E9B161] shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white font-scheherazade">
                  إدارة الاستماع والأذان بدون إنترنت (Offline)
                </h3>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                  isOnline ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
                  <span>{isOnline ? 'متصل بالشبكة' : 'يعمل بدون إنترنت'}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#A8BCAD]">
                احفظ السور وأصوات الأذان في ذاكرة هاتفك لتستمع لها في أي وقت دون استهلاك الباقة
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: 1-Click Fast Offline Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Download Adhans Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#101F15] to-[#1B3022] border border-[#E9B161]/40 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E9B161]/20 text-[#E9B161] flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">أصوات الأذان كاملة</h4>
                  <span className="text-[10px] text-[#A8BCAD]">الحرم المكي، المدني، الأقصى، ومصر</span>
                </div>
              </div>

              {adhanProgressMsg && (
                <div className="space-y-1">
                  <p className="text-[11px] text-[#E9B161] truncate">{adhanProgressMsg}</p>
                  <div className="w-full bg-[#142419] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#E9B161] h-full transition-all duration-300"
                      style={{ width: `${adhanProgressPct}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleDownloadAllAdhans}
                disabled={isAdhanDownloading}
                className="w-full py-2.5 rounded-xl bg-[#E9B161] hover:bg-[#dfa755] disabled:opacity-50 text-[#142419] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {isAdhanDownloading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الحفظ في الذاكرة...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل أصوات الأذان للعمل بدون نت</span>
                  </>
                )}
              </button>
            </div>

            {/* Download Juz 30 Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#101F15] to-[#1B3022] border border-[#3D5A47] space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2D4536] text-[#E9B161] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">قصار السور (جزء عم)</h4>
                  <span className="text-[10px] text-[#A8BCAD]">من سورة النبأ إلى الناس (37 سورة)</span>
                </div>
              </div>

              {juzProgressMsg && (
                <p className="text-[11px] text-[#E9B161] truncate">{juzProgressMsg}</p>
              )}

              <button
                onClick={handleDownloadJuzAmma}
                disabled={isJuzDownloading}
                className="w-full py-2.5 rounded-xl bg-[#2D4536] hover:bg-[#3D5A47] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#3D5A47] transition-all"
              >
                {isJuzDownloading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري تحميل السور...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-[#E9B161]" />
                    <span>تحميل قصار السور بصوت {targetReciterObj.name}</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Section 2: Download Custom Surah */}
          <div className="p-5 rounded-2xl bg-[#101F15] border border-[#2D4536] space-y-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E9B161]" />
              <span>تحميل سورة مخصصة بصوت قارئك المفضل:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Surah */}
              <div>
                <label className="text-[11px] text-[#A8BCAD] block mb-1">اختر السورة:</label>
                <select
                  value={selectedSurah}
                  onChange={(e) => setSelectedSurah(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#1B3022] border border-[#3D5A47] text-white text-xs font-bold focus:outline-none"
                >
                  {SURAHS_LIST.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Reciter */}
              <div>
                <label className="text-[11px] text-[#A8BCAD] block mb-1">اختر القارئ:</label>
                <select
                  value={selectedReciterId}
                  onChange={(e) => setSelectedReciterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1B3022] border border-[#3D5A47] text-white text-xs font-bold focus:outline-none"
                >
                  {RECITERS_LIST.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.style})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Progress Display */}
            {currentProgress && (
              <div className="p-3 rounded-xl bg-[#142419] border border-[#2D4536] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A8BCAD]">
                    {currentProgress.status === 'downloading' && 'جاري حفظ الآيات في الهاتف...'}
                    {currentProgress.status === 'completed' && 'اكتمل التحميل بنجاح!'}
                    {currentProgress.status === 'error' && 'حدث خطأ'}
                  </span>
                  <span className="font-mono text-[#E9B161] font-bold">
                    {currentProgress.completedAyahs} / {currentProgress.totalAyahs} ({currentProgress.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#1B3022] rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#E9B161] h-full transition-all duration-200"
                    style={{ width: `${currentProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleStartDownload}
              disabled={currentProgress?.status === 'downloading'}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E9B161] to-[#D99A45] hover:brightness-110 disabled:opacity-50 text-[#142419] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#E9B161]/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تحميل سورة {targetSurahObj.name} كاملة ({targetSurahObj.numberOfAyahs} آية)</span>
            </button>
          </div>

          {/* Section 3: Downloaded Surahs List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>السور المحفوظة في الهاتف للتشغيل بدون نت ({downloadedList.length})</span>
              </h4>
              <button 
                onClick={refreshDownloaded}
                className="text-[11px] text-[#A8BCAD] hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>تحديث</span>
              </button>
            </div>

            {downloadedList.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#101F15]/50 border border-dashed border-[#2D4536] text-center text-xs text-[#A8BCAD] space-y-1">
                <p>لم تقم بتحميل سور بعد.</p>
                <p className="text-[11px] text-[#7A8C80]">اختر السورة من الأعلى واضغط "تحميل" للاستماع إليها في أي مكان بدون اتصال بالإنترنت.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {downloadedList.map((item) => {
                  const sObj = SURAHS_LIST.find((s) => s.number === item.surahNumber);
                  const rObj = RECITERS_LIST.find((r) => r.id === item.reciterId);

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-[#101F15] border border-[#2D4536] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white flex items-center gap-1.5 truncate">
                          <span>سورة {sObj?.name || item.surahNumber}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono shrink-0">
                            جاهزة بدون نت
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#A8BCAD] mt-0.5">
                          <span className="truncate">القارئ: {rObj?.name || item.reciterId}</span>
                          {item.approxSizeMB && (
                            <span className="text-[10px] text-stone-400 font-mono">({item.approxSizeMB} MB)</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleDeleteDownloaded(item.surahNumber, item.reciterId)}
                          className="p-2 rounded-xl bg-[#1B3022] hover:bg-rose-950/50 text-stone-400 hover:text-rose-400 border border-[#3D5A47] hover:border-rose-900/50 transition-colors"
                          title="حذف من الذاكرة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (sObj) {
                              playSurah(sObj.number, rObj);
                              onClose();
                            }
                          }}
                          className="p-2 rounded-xl bg-[#E9B161] hover:bg-[#D99A45] text-[#142419] font-bold transition-colors shadow-sm"
                          title="تشغيل السورة فوراً بدون نت"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#101F15] border-t border-[#2D4536] flex items-center justify-between text-xs">
          <span className="text-[#A8BCAD]">
            طريق الهدى • تلاوة واستماع بدون اتصال 100%
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
