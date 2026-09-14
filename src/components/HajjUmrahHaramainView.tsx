import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Compass,
  MapPin,
  Building2,
  Utensils,
  Train,
  PhoneCall,
  CheckSquare,
  Square,
  Sparkles,
  BookOpen,
  Info,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Flame,
  Clock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Heart,
  Radio,
  Tv,
  Award,
  Search,
  Filter,
  Car,
  Footprints,
  Accessibility,
  ArrowUpRight,
  RefreshCw,
  Star
} from 'lucide-react';
import { LiveStreamPlayer } from './LiveStreamPlayer';
import { DUAS_LIST } from '../data/duas';
import { HADITHS_LIST } from '../data/hadith';
import { LIVE_CHANNELS, LiveStreamChannel } from '../data/liveStreams';
import { HOTELS_DATA, RESTAURANTS_DATA, HotelItem, RestaurantItem } from '../data/hajjHotelsAndFood';
import { TRANSPORTATION_MODES, TransportMode } from '../data/hajjTransportation';

type SectionTab = 'live' | 'umrah' | 'hajj' | 'duas_hadith' | 'hotels_food' | 'transport_logistics' | 'checklist';

export const HajjUmrahHaramainView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionTab>('live');
  const [selectedLiveChannel, setSelectedLiveChannel] = useState<LiveStreamChannel>(LIVE_CHANNELS[0]);
  const [activeVideoServerIndex, setActiveVideoServerIndex] = useState<number>(0);
  const [activeHajjDay, setActiveHajjDay] = useState<number>(1);

  // Hotels and Restaurants State
  const [hotelCity, setHotelCity] = useState<'makkah' | 'madinah'>('makkah');
  const [hotelTier, setHotelTier] = useState<'all' | 'luxury' | 'mid' | 'economy'>('all');
  const [hotelSearchQuery, setHotelSearchQuery] = useState<string>('');

  const [restaurantCity, setRestaurantCity] = useState<'all' | 'makkah' | 'madinah'>('all');
  const [restaurantCategory, setRestaurantCategory] = useState<string>('all');
  const [activeFoodOrHotelSubTab, setActiveFoodOrHotelSubTab] = useState<'hotels' | 'restaurants'>('hotels');

  // Transportation State
  const [selectedTransportModeId, setSelectedTransportModeId] = useState<string>(TRANSPORTATION_MODES[0].id);

  // Duas and Hadiths filter
  const [hajjDuasFilter, setHajjDuasFilter] = useState<'all' | 'hajj' | 'hadith' | 'travel'>('all');

  // Audio Radio Player State
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Interactive Tawaf / Sai counter
  const [tawafRound, setTawafRound] = useState<number>(1);
  const [saiRound, setSaiRound] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('tareeq_hajj_checklist_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('tareeq_hajj_checklist_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const [activeAudioStreamUrl, setActiveAudioStreamUrl] = useState<string>('');
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);

  // Play / Pause live audio stream with auto fallback
  const startPlayAudio = (targetUrl: string, fallbackUrl?: string) => {
    setIsAudioLoading(true);
    setActiveAudioStreamUrl(targetUrl);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(targetUrl);
    audioRef.current = audio;

    audio.onplaying = () => {
      setIsAudioLoading(false);
      setIsAudioPlaying(true);
    };

    audio.onwaiting = () => {
      setIsAudioLoading(true);
    };

    audio.onerror = () => {
      console.warn('Primary stream failed:', targetUrl);
      if (fallbackUrl && fallbackUrl !== targetUrl) {
        console.log('Switching to fallback audio stream:', fallbackUrl);
        setActiveAudioStreamUrl(fallbackUrl);
        audio.src = fallbackUrl;
        audio.play().catch(() => {
          setIsAudioLoading(false);
          setIsAudioPlaying(false);
        });
      } else {
        setIsAudioLoading(false);
        setIsAudioPlaying(false);
      }
    };

    audio.play().then(() => {
      setIsAudioLoading(false);
      setIsAudioPlaying(true);
    }).catch((err) => {
      console.warn('Direct play blocked, trying fallback or retrying:', err);
      if (fallbackUrl && fallbackUrl !== targetUrl) {
        audio.src = fallbackUrl;
        setActiveAudioStreamUrl(fallbackUrl);
        audio.play().then(() => {
          setIsAudioLoading(false);
          setIsAudioPlaying(true);
        }).catch(() => {
          setIsAudioLoading(false);
          setIsAudioPlaying(false);
        });
      } else {
        setIsAudioLoading(false);
        setIsAudioPlaying(false);
      }
    });
  };

  const toggleLiveAudio = (url?: string, fallbackUrl?: string) => {
    const streamUrl = url || selectedLiveChannel.audioStreamUrl || 'https://stream.radiojar.com/8s5u5tpdtwzuv';
    const fallback = fallbackUrl || selectedLiveChannel.fallbackAudioStreamUrl;

    if (isAudioPlaying) {
      if (activeAudioStreamUrl === streamUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsAudioPlaying(false);
        setIsAudioLoading(false);
      } else {
        // Switch to the other radio channel immediately
        startPlayAudio(streamUrl, fallback);
      }
    } else {
      startPlayAudio(streamUrl, fallback);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const tawafDuas = [
    { round: 1, title: 'الشوط الأول (البداية من الحجر الأسود)', dua: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ، اللَّهُمَّ إِيمَانًا بِكَ وَتَصْدِيقًا بِكِتَابِكَ، وَوَفَاءً بِعَهْدِكَ، وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ مُحَمَّدٍ ﷺ. رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.' },
    { round: 2, title: 'الشوط الثاني', dua: 'اللَّهُمَّ إِنَّ هَذَا الْبَيْتَ بَيْتُكَ، وَالْحَرَمَ حَرَمُكَ، وَالأَمْنَ أَمْنُكَ، وَهَذَا مَقَامُ الْعَائِذِ بِكَ مِنَ النَّارِ. اللَّهُمَّ حَبِّبْ إِلَيْنَا الإِيمَانَ وَزَيِّنْهُ فِي قُلُوبِنَا، وَكَرِّهْ إِلَيْنَا الْكُفْرَ وَالْفُسُوقَ وَالْعِصْيَانَ.' },
    { round: 3, title: 'الشوط الثالث', dua: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الشَّكِّ وَالشِّرْكِ وَالشِّقَاقِ وَالنِّفَاقِ وَسُوءِ الأَخْلاقِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالأَهْلِ وَالْوَلَدِ. رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.' },
    { round: 4, title: 'الشوط الرابع', dua: 'اللَّهُمَّ اجْعَلْهُ حَجًّا مَبْرُورًا، وَسَعْيًا مَشْكُورًا، وَذَنْبًا مَغْفُورًا، وَعَمَلاً صَالِحًا مَقْبُولاً، وَتِجَارَةً لَنْ تَبُورَ. يَا عَالِمَ مَا فِي الصُّدُورِ، أَخْرِجْنَا مِنَ الظُّلُمَاتِ إِلَى النُّورِ.' },
    { round: 5, title: 'الشوط الخامس', dua: 'اللَّهُمَّ أَظِلَّنِي تَحْتَ ظِلِّ عَرْشِكَ يَوْمَ لا ظِلَّ إِلا ظِلُّكَ، وَلا بَاقِيَ إِلا وَجْهُكَ، وَاسْقِنِي مِنْ حَوْضِ نَبِيِّكَ مُحَمَّدٍ ﷺ شَرْبَةً هَنِيئَةً مَرِيئَةً لا أَظْمَأُ بَعْدَهَا أَبَدًا.' },
    { round: 6, title: 'الشوط السادس', dua: 'اللَّهُمَّ إِنَّ لَكَ عَلَيَّ حُقُوقًا كَثِيرَةً فِيمَا بَيْنِي وَبَيْنَكَ، وَحُقُوقًا كَثِيرَةً فِيمَا بَيْنِي وَبَيْنَ خَلْقِكَ، فَاغْفِرْ لِي مَا كَانَ لَكَ، وَتَحَمَّلْ عَنِّي مَا كَانَ لِخَلْقِكَ، وَأَغْنِنِي بِحَلالِكَ عَنْ حَرَامِكَ.' },
    { round: 7, title: 'الشوط السابع (الختام)', dua: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ إِيمَانًا كَامِلاً، وَيَقِينًا صَادِقًا، وَرِزْقًا وَاسِعًا، وَقَلْبًا خَاشِعًا، وَلِسَانًا ذَاكِرًا، وَتَوْبَةً نَصُوحًا قَبْلَ الْمَوْتِ، وَرَاحَةً عِنْدَ الْمَوْتِ، وَمَغْفِرَةً وَرَحْمَةً بَعْدَ الْمَوْتِ.' }
  ];

  const saiDuas = [
    { round: 1, from: 'الصفا إلى المروة', dua: '﴿إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ...﴾ أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ. اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لا إِلَهَ إِلا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.' },
    { round: 2, from: 'المروة إلى الصفا', dua: 'رَبِّ اغْفِرْ وَارْحَمْ، وَتَجَاوَزْ عَمَّا تَعْلَمْ، إِنَّكَ أَنْتَ الأَعَزُّ الأَكْرَمُ. اللَّهُمَّ آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.' },
    { round: 3, from: 'الصفا إلى المروة', dua: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالسَّلامَةَ مِنْ كُلِّ إِثْمٍ، وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ، وَالْفَوْزَ بِالْجَنَّةِ، وَالنَّجَاةَ مِنَ النَّارِ.' },
    { round: 4, from: 'المروة إلى الصفا', dua: 'اللَّهُمَّ يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ. اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى.' },
    { round: 5, from: 'الصفا إلى المروة', dua: 'اللَّهُمَّ احْفَظْنِي بِالإِسْلامِ قَائِمًا، وَاحْفَظْنِي بِالإِسْلامِ قَاعِدًا، وَاحْفَظْنِي بِالإِسْلامِ رَاقِدًا، وَلا تُشْمِتْ بِي عَدُوًّا وَلا حَاسِدًا.' },
    { round: 6, from: 'المروة إلى الصفا', dua: 'اللَّهُمَّ اغْفِرْ لِي ذُنُوبِي وَخَطَايَايَ كُلَّهَا، اللَّهُمَّ أَنْعِشْنِي وَاجْبُرْنِي وَاهْدِنِي لِصَالِحِ الأَعْمَالِ وَالأَخْلاقِ، فَإِنَّهُ لا يَهْدِي لِصَالِحِهَا إِلا أَنْتَ.' },
    { round: 7, from: 'الصفا إلى المروة (الانتهاء)', dua: 'الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَذَا وَمَا كُنَّا لِنَهْتَدِيَ لَوْلا أَنْ هَدَانَا اللَّهُ. اللَّهُمَّ تَقَبَّلْ مِنَّا عُمْرَتَنَا وَطَوَافَنَا وَسَعْيَنَا، وَاغْفِرْ لَنَا وَلِوَالِدَيْنَا وَلِجَمِيعِ الْمُسْلِمِينَ.' }
  ];

  // Authentic Hajj / Umrah Hadiths and Duas
  const hajjHadiths = HADITHS_LIST.filter(h => h.categoryId === 'hajj_umrah');
  const hajjDuas = DUAS_LIST.filter(d => d.categoryId === 'hajj_umrah' || d.categoryId === 'travel');

  // Filtered Hotels
  const filteredHotels = HOTELS_DATA.filter((h) => {
    const matchesCity = h.city === hotelCity;
    const matchesTier = hotelTier === 'all' || h.tier === hotelTier;
    const matchesSearch =
      !hotelSearchQuery ||
      h.name.toLowerCase().includes(hotelSearchQuery.toLowerCase()) ||
      h.zone.toLowerCase().includes(hotelSearchQuery.toLowerCase()) ||
      h.features.some(f => f.toLowerCase().includes(hotelSearchQuery.toLowerCase()));
    return matchesCity && matchesTier && matchesSearch;
  });

  // Filtered Restaurants
  const filteredRestaurants = RESTAURANTS_DATA.filter((r) => {
    const matchesCity = restaurantCity === 'all' || r.city === restaurantCity;
    const matchesCat = restaurantCategory === 'all' || r.category === restaurantCategory;
    return matchesCity && matchesCat;
  });

  // Active Transport Mode
  const activeTransport = TRANSPORTATION_MODES.find(t => t.id === selectedTransportModeId) || TRANSPORTATION_MODES[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 font-cairo" dir="rtl">
      {/* Top Banner Header */}
      <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#16271B] via-[#1E3626] to-[#0D1810] border border-[#3D5A47] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 text-right">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E9B161] to-[#C99141] text-[#1B3022] flex items-center justify-center shadow-lg shrink-0">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg sm:text-xl text-[#E9B161]">بوابة الحرمين الشريفين ودليل الحج والعمرة</h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#2D4536] text-[#A8BCAD] font-medium border border-[#3D5A47]">
                بث مباشر وتوجيه شامل
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A8BCAD] mt-1">
              البث المباشر المحدث من مكة المكرمة والمدينة المنورة، مع دليل موسع للفنادق، المطاعم، والمواصلات، والأدعية والأحاديث الصحيحة الموثقة
            </p>
          </div>
        </div>

        {/* Live Audio Radio Quick Pill */}
        <button
          onClick={() => toggleLiveAudio()}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#E9B161] hover:bg-[#D99A45] text-[#1B3022] font-bold text-xs shadow-md transition-all shrink-0 self-end md:self-center"
        >
          {isAudioPlaying ? (
            <>
              <Pause className="w-4 h-4 text-[#1B3022]" />
              <span>إيقاف إذاعة القرآن المباشرة</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 text-[#1B3022]" />
              <span>تشغيل إذاعة القرآن مباشر (صوت)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-6">
        {[
          { id: 'live', label: 'البث المباشر والإذاعات', icon: Video },
          { id: 'umrah', label: 'صفة العمرة', icon: Sparkles },
          { id: 'hajj', label: 'مناسك الحج', icon: MapPin },
          { id: 'duas_hadith', label: 'أدعية وأحاديث صحيحة', icon: BookOpen },
          { id: 'hotels_food', label: 'الفنادق والمطاعم', icon: Building2 },
          { id: 'transport_logistics', label: 'طرق التنقل والمواصلات', icon: Train },
          { id: 'checklist', label: 'حقيبة المعتمر والحاج', icon: CheckSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as SectionTab)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center gap-1.5 ${
                isActive
                  ? 'bg-[#1B3022] text-[#E9B161] border-[#E9B161] shadow-md dark:bg-[#E9B161] dark:text-[#1B3022]'
                  : 'bg-white dark:bg-[#142318] text-stone-600 dark:text-stone-300 border-stone-200 dark:border-[#2D4536] hover:border-[#E9B161]/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-bold whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: LIVE 24/7 STREAMS & RADIOS (WITH MULTI-SERVER FALLBACK & 4K EXTERNAL LINK) */}
      {activeSection === 'live' && (
        <div className="space-y-6">
          {/* Stream Selector Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {LIVE_CHANNELS.map((ch) => {
              const isSelected = selectedLiveChannel.id === ch.id;
              const isThisAudioPlaying = isAudioPlaying && isSelected && ch.type === 'audio';

              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    const wasSelected = selectedLiveChannel.id === ch.id;
                    setSelectedLiveChannel(ch);
                    setActiveVideoServerIndex(0);

                    if (ch.type === 'audio') {
                      if (wasSelected) {
                        toggleLiveAudio(ch.audioStreamUrl, ch.fallbackAudioStreamUrl);
                      } else {
                        startPlayAudio(ch.audioStreamUrl || '', ch.fallbackAudioStreamUrl);
                      }
                    } else {
                      // If switching to video, stop radio audio to prevent sound clash
                      if (isAudioPlaying && audioRef.current) {
                        audioRef.current.pause();
                        setIsAudioPlaying(false);
                        setIsAudioLoading(false);
                      }
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-[#1B3022] text-white border-[#E9B161] shadow-lg ring-2 ring-[#E9B161]/40'
                      : 'bg-white dark:bg-[#142318] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-[#2D4536] hover:bg-stone-50 dark:hover:bg-[#1B3022]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden relative shrink-0 border border-[#E9B161]/30">
                      <img src={ch.thumbnail} alt={ch.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        {ch.type === 'video' ? (
                          <Tv className="w-4 h-4 text-white" />
                        ) : (
                          <Radio className="w-4 h-4 text-[#E9B161]" />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-[#E9B161] truncate">{ch.title}</h3>
                      <p className="text-[10px] text-stone-400 dark:text-[#A8BCAD] truncate mt-0.5">{ch.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-600/90 text-white font-bold animate-pulse">
                      {ch.badge}
                    </span>
                    {isThisAudioPlaying && (
                      <span className="text-[9px] text-[#E9B161] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E9B161] animate-ping" />
                        <span>يعمل الآن</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Video & Live Audio Player Container */}
          <div>
            {selectedLiveChannel.type === 'video' ? (
              <LiveStreamPlayer
                channel={selectedLiveChannel}
                activeServerIndex={activeVideoServerIndex}
                onServerChange={setActiveVideoServerIndex}
              />
            ) : (
              /* High Definition Direct Live Radio Player */
              <div className="p-6 sm:p-10 text-center bg-gradient-to-br from-[#16271B] to-[#0D1810] text-white space-y-6 rounded-3xl border border-[#3D5A47] shadow-2xl relative overflow-hidden">
                {/* Background glow decoration */}
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#E9B161]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-5 max-w-xl mx-auto">
                  <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden border-2 border-[#E9B161] shadow-2xl relative">
                    <img
                      src={selectedLiveChannel.thumbnail}
                      alt={selectedLiveChannel.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Radio className="w-10 h-10 text-[#E9B161] animate-pulse" />
                    </div>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9B161]/20 text-[#E9B161] text-xs font-bold mb-2 border border-[#E9B161]/30">
                      <Radio className="w-3.5 h-3.5" />
                      <span>{selectedLiveChannel.badge}</span>
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#E9B161]">{selectedLiveChannel.title}</h3>
                    <p className="text-xs sm:text-sm text-[#A8BCAD] mt-2 leading-relaxed">
                      {selectedLiveChannel.description}
                    </p>
                  </div>

                  {/* Audio Equalizer or Loading Indicator */}
                  {isAudioLoading ? (
                    <div className="flex items-center justify-center gap-2 py-3 text-[#E9B161] font-bold text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الاتصال بالإذاعة وتهيئة البث الصوتي المباشر...</span>
                    </div>
                  ) : isAudioPlaying ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5 py-2">
                        <span className="w-1.5 h-6 bg-[#E9B161] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-10 bg-[#E9B161] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-4 bg-[#E9B161] rounded-full animate-bounce [animation-delay:-0.45s]" />
                        <span className="w-1.5 h-8 bg-[#E9B161] rounded-full animate-bounce [animation-delay:-0.2s]" />
                        <span className="w-1.5 h-12 bg-[#E9B161] rounded-full animate-bounce [animation-delay:-0.35s]" />
                        <span className="w-1.5 h-5 bg-[#E9B161] rounded-full animate-bounce [animation-delay:-0.1s]" />
                      </div>
                      <p className="text-[11px] text-[#A8BCAD]">البث الصوتي المباشر يعمل الآن بنقاء فائق 24/7</p>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400">انقر على الزر أدناه لبدء الاستماع الفوري</p>
                  )}

                  {/* Radio Server Sources */}
                  {selectedLiveChannel.audioSources && selectedLiveChannel.audioSources.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#2D4536]/60">
                      <span className="text-[11px] text-stone-400 font-bold block">سيرفرات البث الصوتي المباشر:</span>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {selectedLiveChannel.audioSources.map((srv, idx) => {
                          const isActiveSrv = (activeAudioStreamUrl === srv.url) || (!activeAudioStreamUrl && idx === 0);
                          return (
                            <button
                              key={srv.url}
                              onClick={() => {
                                startPlayAudio(srv.url);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                isActiveSrv && isAudioPlaying
                                  ? 'bg-[#E9B161] text-[#1B3022] shadow-md ring-1 ring-[#E9B161]'
                                  : 'bg-[#1C3122] hover:bg-[#25422E] text-stone-300 border border-[#2D4536]'
                              }`}
                            >
                              {isActiveSrv && isAudioPlaying && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                              )}
                              <span>{srv.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                    <button
                      onClick={() => toggleLiveAudio(activeAudioStreamUrl || selectedLiveChannel.audioStreamUrl)}
                      className="px-8 py-3.5 rounded-2xl bg-[#E9B161] hover:bg-[#D99A45] text-[#1B3022] font-bold text-sm shadow-xl flex items-center gap-3 transition-transform active:scale-95"
                    >
                      {isAudioPlaying ? (
                        <>
                          <Pause className="w-5 h-5" />
                          <span>إيقاف البث الصوتي</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-current" />
                          <span>تشغيل الإذاعة المباشرة</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: UMRAH STEP BY STEP GUIDE & INTERACTIVE COUNTERS */}
      {activeSection === 'umrah' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { step: 1, title: '١. الإحرام والنية', desc: 'من الميقات أو بمحاذاته مع التلبية: «لبيك عمرة»' },
              { step: 2, title: '٢. طواف القدوم', desc: '7 أشواط حول الكعبة تبدأ وتنتهي عند الحجر الأسود' },
              { step: 3, title: '٣. السعي بين الصفا والمروة', desc: '7 أشواط تبدأ بالصفا وتنتهي بالمروة' },
              { step: 4, title: '٤. الحلق أو التقصير', desc: 'حلق شعر الرأس أو تقصيره بالكامل للتحلل' }
            ].map((st) => (
              <div
                key={st.step}
                className="p-4 rounded-2xl bg-white dark:bg-[#142318] border border-stone-200 dark:border-[#2D4536] shadow-sm text-right space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1B3022] dark:text-[#E9B161]">{st.title}</span>
                  <span className="w-6 h-6 rounded-full bg-[#E9B161]/20 text-[#E9B161] flex items-center justify-center font-bold text-xs">
                    {st.step}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-[#A8BCAD] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* Interactive Tawaf Assistant */}
          <div className="bg-white dark:bg-[#142318] p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-[#2D4536] shadow-md space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#E9B161]" />
                <h3 className="font-bold text-base text-[#1B3022] dark:text-[#E9B161]">مساعد أشواط الطواف (7 أشواط حول الكعبة)</h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[#1B3022] text-[#E9B161] font-bold">
                الشوط الحالي: {tawafRound} من 7
              </span>
            </div>

            {/* Round Buttons */}
            <div className="grid grid-cols-7 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  onClick={() => setTawafRound(num)}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                    tawafRound === num
                      ? 'bg-[#E9B161] text-[#1B3022] shadow-md scale-105 ring-2 ring-[#E9B161]'
                      : 'bg-stone-100 dark:bg-[#1B3022] text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  <span>{num}</span>
                  <span className="text-[9px] font-normal">شوط</span>
                </button>
              ))}
            </div>

            {/* Active Tawaf Dua Box */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#18291E] border border-stone-200 dark:border-[#2D4536] text-right space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#E9B161]">
                  {tawafDuas[tawafRound - 1]?.title}
                </span>
                <button
                  onClick={() => handleCopy(tawafDuas[tawafRound - 1]?.dua, `tawaf-${tawafRound}`)}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-[#E9B161] transition-colors"
                >
                  {copiedText === `tawaf-${tawafRound}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === `tawaf-${tawafRound}` ? 'تم النسخ' : 'نسخ الدعاء'}</span>
                </button>
              </div>
              <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-200 font-scheherazade text-lg">
                {tawafDuas[tawafRound - 1]?.dua}
              </p>
            </div>

            {/* Next / Prev buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={tawafRound <= 1}
                onClick={() => setTawafRound((r) => Math.max(1, r - 1))}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-[#1B3022] text-xs font-bold disabled:opacity-40"
              >
                الشوط السابق
              </button>
              <button
                disabled={tawafRound >= 7}
                onClick={() => setTawafRound((r) => Math.min(7, r + 1))}
                className="px-4 py-2 rounded-xl bg-[#1B3022] dark:bg-[#E9B161] text-[#E9B161] dark:text-[#1B3022] text-xs font-bold disabled:opacity-40"
              >
                الشوط التالي
              </button>
            </div>
          </div>

          {/* Interactive Sai Assistant */}
          <div className="bg-white dark:bg-[#142318] p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-[#2D4536] shadow-md space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-[#1B3022] dark:text-[#E9B161]">مساعد أشواط السعي (الصفا والمروة 7 أشواط)</h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-800 text-emerald-100 font-bold">
                الشوط {saiRound} من 7 ({saiDuas[saiRound - 1]?.from})
              </span>
            </div>

            {/* Round Buttons */}
            <div className="grid grid-cols-7 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  onClick={() => setSaiRound(num)}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                    saiRound === num
                      ? 'bg-emerald-600 text-white shadow-md scale-105 ring-2 ring-emerald-500'
                      : 'bg-stone-100 dark:bg-[#1B3022] text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  <span>{num}</span>
                  <span className="text-[9px] font-normal">سعي</span>
                </button>
              ))}
            </div>

            {/* Active Sai Dua Box */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#18291E] border border-stone-200 dark:border-[#2D4536] text-right space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                  اتجاه المسار: {saiDuas[saiRound - 1]?.from}
                </span>
                <button
                  onClick={() => handleCopy(saiDuas[saiRound - 1]?.dua, `sai-${saiRound}`)}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-emerald-500 transition-colors"
                >
                  {copiedText === `sai-${saiRound}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === `sai-${saiRound}` ? 'تم النسخ' : 'نسخ الدعاء'}</span>
                </button>
              </div>
              <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-200 font-scheherazade text-lg">
                {saiDuas[saiRound - 1]?.dua}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: HAJJ STEP BY STEP GUIDE */}
      {activeSection === 'hajj' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { day: 1, title: 'يوم التروية', date: '8 ذو الحجة', place: 'منى' },
              { day: 2, title: 'يوم عرفة ومزدلفة', date: '9 ذو الحجة', place: 'عرفة ⟵ مزدلفة' },
              { day: 3, title: 'يوم النحر (العيد)', date: '10 ذو الحجة', place: 'رمي جمرة العقبة وطواف الإفاضة' },
              { day: 4, title: 'أيام التشريق', date: '11-13 ذو الحجة', place: 'منى ورمي الجمرات الثلاث' },
              { day: 5, title: 'طواف الوداع', date: 'ختام الحج', place: 'المسجد الحرام' },
            ].map((d) => (
              <button
                key={d.day}
                onClick={() => setActiveHajjDay(d.day)}
                className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1 ${
                  activeHajjDay === d.day
                    ? 'bg-[#1B3022] text-[#E9B161] border-[#E9B161] shadow-lg ring-2 ring-[#E9B161]/50 dark:bg-[#E9B161] dark:text-[#1B3022]'
                    : 'bg-white dark:bg-[#142318] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-[#2D4536]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{d.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/20 font-bold">{d.date}</span>
                </div>
                <span className="text-[11px] opacity-80 mt-1">{d.place}</span>
              </button>
            ))}
          </div>

          {/* Active Hajj Day Details Card */}
          <div className="bg-white dark:bg-[#142318] p-6 rounded-3xl border border-stone-200 dark:border-[#2D4536] shadow-md text-right space-y-4">
            {activeHajjDay === 1 && (
              <>
                <h3 className="text-base font-bold text-[#1B3022] dark:text-[#E9B161] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E9B161]" />
                  <span>اليوم الأول: يوم التروية (8 ذو الحجة) - المبيت بمنى</span>
                </h3>
                <ul className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 space-y-2.5 leading-relaxed list-disc list-inside">
                  <li><strong>الإحرام:</strong> يحرم المتمتع من مكانه في مكة ضحى 8 ذي الحجة، ويغتسل ويتطيب في بدنه ويلبس ثياب الإحرام ويلبي: «لبيك حجاً».</li>
                  <li><strong>التوجه إلى منى:</strong> التوجه إلى مشعر منى والمبيت بها سنة مؤكدة.</li>
                  <li><strong>الصلوات في منى:</strong> يصلي الحاج في منى الظهر، العصر، المغرب، العشاء، وفجر يوم عرفة قصراً للرباعية ركعتين في وقت كل صلاة بدون جمع.</li>
                </ul>
              </>
            )}

            {activeHajjDay === 2 && (
              <>
                <h3 className="text-base font-bold text-[#1B3022] dark:text-[#E9B161] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E9B161]" />
                  <span>اليوم الثاني: يوم عرفة والمزدلفة (9 ذو الحجة) - الركن الأعظم</span>
                </h3>
                <ul className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 space-y-2.5 leading-relaxed list-disc list-inside">
                  <li><strong>التوجه إلى عرفات:</strong> بعد شروق شمس يوم 9 ذي الحجة يتوجه الحجاج من منى إلى صعيد عرفات.</li>
                  <li><strong>خطبة عرفة والجمع والقصر:</strong> يصلي الحجاج الظهر والعصر جمع تقديم وقصراً بأذان وإقامتين في مسجد نمرة أو مخيماتهم.</li>
                  <li><strong>الدعاء والتضرع:</strong> التفرغ التام للذكر والدعاء والتسبيح والتوبة حتى غروب الشمس؛ قال ﷺ: «الحج عرفة».</li>
                  <li><strong>الإفاضة إلى مزدلفة:</strong> بعد غروب الشمس يفيض الحاج بسكينة إلى مزدلفة ويصلي بها المغرب والعشاء جمع تأخير وقصراً للعشاء، ويبيت بمزدلفة ويجمع حصى الجمرات (7 حصيات لجمرة العقبة).</li>
                </ul>
              </>
            )}

            {activeHajjDay === 3 && (
              <>
                <h3 className="text-base font-bold text-[#1B3022] dark:text-[#E9B161] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E9B161]" />
                  <span>اليوم الثالث: يوم النحر (10 ذو الحجة - عيد الأضحى المبارك)</span>
                </h3>
                <ul className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 space-y-2.5 leading-relaxed list-disc list-inside">
                  <li><strong>رمي جمرة العقبة الكبرى:</strong> بعد صلاة الفجر في مزدلفة يتوجه لمنى ويرمي جمرة العقبة الكبرى بـ 7 حصيات متعاقبات مكبراً مع كل حصاة: «الله أكبر».</li>
                  <li><strong>ذبح الهدي:</strong> يذبح المتمتع والقارن هديه (عبر منصة أضاحي المعتمدة).</li>
                  <li><strong>الحلق أو التقصير (التحلل الأول):</strong> يحلق الرجل رأسه (وهو الأفضل) أو يقصر، وتقصر المرأة قدر أنملة، وبذلك يتحلل التحلل الأول.</li>
                  <li><strong>طواف الإفاضة والسعي (التحلل الأكبر):</strong> يتوجه للمسجد الحرام ويطوف طواف الإفاضة ويسعى سعي الحج، وبذلك يتم التحلل الأكبر.</li>
                </ul>
              </>
            )}

            {activeHajjDay === 4 && (
              <>
                <h3 className="text-base font-bold text-[#1B3022] dark:text-[#E9B161] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E9B161]" />
                  <span>اليوم الرابع: أيام التشريق (11 و 12 و 13 ذو الحجة)</span>
                </h3>
                <ul className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 space-y-2.5 leading-relaxed list-disc list-inside">
                  <li><strong>المبيت بمنى:</strong> المبيت بمنى ليالي أيام التشريق واجب من واجبات الحج.</li>
                  <li><strong>رمي الجمرات الثلاث يومياً:</strong> بعد زوال الشمس (أذان الظهر) يرمي الجمرات الثلاث بالترتيب: الجمرة الصغرى (7 حصيات) ثم يدعو، ثم الجمرة الوسطى (7 حصيات) ثم يدعو، ثم جمرة العقبة الكبرى (7 حصيات) ولا يقف عندها.</li>
                  <li><strong>التعجل:</strong> يجوز للحاج أن يتعجل ويغادر منى في اليوم الثاني عشر قبل غروب الشمس؛ ﴿فَمَن تَعَجَّلَ فِي يَوْمَيْنِ فَلَا إِثْمَ عَلَيْهِ﴾.</li>
                </ul>
              </>
            )}

            {activeHajjDay === 5 && (
              <>
                <h3 className="text-base font-bold text-[#1B3022] dark:text-[#E9B161] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E9B161]" />
                  <span>ختام المناسك: طواف الوداع</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
                  إذا عزم الحاج على السفر ومغادرة مكة المكرمة يطوف بالبيت سبعة أشواط طواف الوداع، ليكون آخر عهده بالبيت الحرام؛ قال ابن عباس رضي الله عنهما: «أُمر الناس أن يكون آخر عهدهم بالبيت، إلا أنه خفف عن المرأة الحائض والنفساء» (صحيح البخاري ومسلم).
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: AUTHENTIC DUAS & HADITHS 100% VERIFIED */}
      {activeSection === 'duas_hadith' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-[#E9B161]" />
              <h3 className="font-bold text-base text-[#1B3022] dark:text-[#E9B161]">الأدعية والأحاديث الصحيحة 100% في الحج والعمرة والزيارة</h3>
            </div>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'hadith', label: 'أحاديث صحيحة' },
                { id: 'hajj', label: 'أدعية المناسك' },
                { id: 'travel', label: 'أدعية السفر' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setHajjDuasFilter(f.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    hajjDuasFilter === f.id
                      ? 'bg-[#1B3022] text-[#E9B161] dark:bg-[#E9B161] dark:text-[#1B3022]'
                      : 'bg-stone-100 dark:bg-[#142318] text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Authentic Hadiths Cards */}
          {(hajjDuasFilter === 'all' || hajjDuasFilter === 'hadith') && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#1B3022] dark:text-[#E9B161] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E9B161]" />
                <span>أحاديث نبوية صحيحة في فضل الحج والعمرة والحرمين (صحيح البخاري ومسلم)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hajjHadiths.map((h) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#142318] border border-stone-200 dark:border-[#2D4536] shadow-sm text-right space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#E9B161]">{h.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                        {h.grade}
                      </span>
                    </div>
                    <p className="text-sm text-stone-800 dark:text-stone-100 font-scheherazade leading-relaxed">
                      {h.arabicText}
                    </p>
                    <div className="pt-2 border-t border-stone-100 dark:border-[#2D4536] flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                      <span>الراوي: {h.narrator}</span>
                      <span>المصدر: {h.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authentic Duas Cards */}
          {(hajjDuasFilter === 'all' || hajjDuasFilter === 'hajj' || hajjDuasFilter === 'travel') && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-[#1B3022] dark:text-[#E9B161] flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>الأدعية المأثورة الصحيحة في الطواف، السعي، عرفة، والسفر</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hajjDuas
                  .filter(d => hajjDuasFilter === 'all' || (hajjDuasFilter === 'hajj' && d.categoryId === 'hajj_umrah') || (hajjDuasFilter === 'travel' && d.categoryId === 'travel'))
                  .map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#142318] border border-stone-200 dark:border-[#2D4536] shadow-sm text-right space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#E9B161]">{d.title}</span>
                        <button
                          onClick={() => handleCopy(`${d.text}\n\nالمصدر: ${d.source}`, d.id)}
                          className="flex items-center gap-1 text-xs text-stone-400 hover:text-[#E9B161]"
                        >
                          {copiedText === d.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedText === d.id ? 'تم النسخ' : 'نسخ'}</span>
                        </button>
                      </div>
                      <p className="text-sm text-stone-800 dark:text-stone-100 font-scheherazade text-lg leading-relaxed">
                        {d.text}
                      </p>
                      <div className="pt-2 border-t border-stone-100 dark:border-[#2D4536] text-[11px] text-stone-500 dark:text-stone-400">
                        <span>المصدر: {d.source}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: EXPANDED HOTELS & RESTAURANTS GUIDE */}
      {activeSection === 'hotels_food' && (
        <div className="space-y-6">
          {/* Sub Tab Switcher: Hotels vs Restaurants */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveFoodOrHotelSubTab('hotels')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeFoodOrHotelSubTab === 'hotels'
                  ? 'bg-[#1B3022] text-[#E9B161] shadow-lg ring-2 ring-[#E9B161]/50 dark:bg-[#E9B161] dark:text-[#1B3022]'
                  : 'bg-white dark:bg-[#142318] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#2D4536]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>دليل فنادق الحرمين الشريفين ({HOTELS_DATA.length} فندق مختار)</span>
            </button>
            <button
              onClick={() => setActiveFoodOrHotelSubTab('restaurants')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeFoodOrHotelSubTab === 'restaurants'
                  ? 'bg-[#1B3022] text-[#E9B161] shadow-lg ring-2 ring-[#E9B161]/50 dark:bg-[#E9B161] dark:text-[#1B3022]'
                  : 'bg-white dark:bg-[#142318] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#2D4536]'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>دليل المطاعم والمأكولات والمقاهي ({RESTAURANTS_DATA.length} وجهة)</span>
            </button>
          </div>

          {/* === HOTELS SUBTAB === */}
          {activeFoodOrHotelSubTab === 'hotels' && (
            <div className="space-y-5">
              {/* City and Tier Filter Bar */}
              <div className="bg-white dark:bg-[#142318] p-4 rounded-3xl border border-stone-200 dark:border-[#2D4536] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                {/* City Switcher */}
                <div className="flex items-center p-1 bg-stone-100 dark:bg-[#18291E] rounded-2xl border border-stone-200 dark:border-[#2D4536] w-full md:w-auto">
                  <button
                    onClick={() => setHotelCity('makkah')}
                    className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      hotelCity === 'makkah'
                        ? 'bg-[#1B3022] text-[#E9B161] shadow-sm dark:bg-[#E9B161] dark:text-[#1B3022]'
                        : 'text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    فنادق مكة المكرمة ({HOTELS_DATA.filter(h => h.city === 'makkah').length})
                  </button>
                  <button
                    onClick={() => setHotelCity('madinah')}
                    className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      hotelCity === 'madinah'
                        ? 'bg-[#1B3022] text-[#E9B161] shadow-sm dark:bg-[#E9B161] dark:text-[#1B3022]'
                        : 'text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    فنادق المدينة المنورة ({HOTELS_DATA.filter(h => h.city === 'madinah').length})
                  </button>
                </div>

                {/* Tier Filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'جميع الفئات' },
                    { id: 'luxury', label: 'فاخرة ومطلة (5 نجوم)' },
                    { id: 'mid', label: 'متوسطة ومركزية' },
                    { id: 'economy', label: 'اقتصادية وشاتل باص' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setHotelTier(t.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        hotelTier === t.id
                          ? 'bg-[#1B3022] text-[#E9B161] dark:bg-[#E9B161] dark:text-[#1B3022]'
                          : 'bg-stone-100 dark:bg-[#18291E] text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-60">
                  <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={hotelSearchQuery}
                    onChange={(e) => setHotelSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الفندق أو المنطقة..."
                    className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-stone-50 dark:bg-[#18291E] border border-stone-200 dark:border-[#2D4536] text-stone-800 dark:text-stone-100 outline-none focus:border-[#E9B161]"
                  />
                </div>
              </div>

              {/* Hotels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHotels.map((h) => (
                  <div
                    key={h.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#142318] border border-stone-200 dark:border-[#2D4536] shadow-sm hover:shadow-md transition-all text-right space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E9B161]/15 text-[#E9B161]">
                            {h.zone}
                          </span>
                          <h4 className="font-bold text-base text-[#1B3022] dark:text-stone-100 mt-1">
                            {h.name}
                          </h4>
                          <p className="text-[11px] text-stone-400 font-sans">{h.nameEn}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold text-xs shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{h.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        {h.description}
                      </p>

                      {/* Distance & Walking Time info */}
                      <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#18291E] border border-stone-200 dark:border-[#2D4536] space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-200">
                          <MapPin className="w-3.5 h-3.5 text-[#E9B161] shrink-0" />
                          <span className="font-bold">الموقع:</span>
                          <span>{h.distanceToHaram}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-200">
                          <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-bold">الوقت للساحات:</span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">{h.walkingTime}</span>
                        </div>
                      </div>

                      {/* Features Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {h.features.map((feat, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#1C3222] text-stone-600 dark:text-stone-300"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tip */}
                    <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-[#1A2E20] border border-amber-200/50 dark:border-[#2D4536] text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#E9B161] shrink-0 mt-0.5" />
                      <span><strong>نصيحة إقامة:</strong> {h.tips}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === RESTAURANTS SUBTAB === */}
          {activeFoodOrHotelSubTab === 'restaurants' && (
            <div className="space-y-5">
              {/* Category and City Filter */}
              <div className="bg-white dark:bg-[#142318] p-4 rounded-3xl border border-stone-200 dark:border-[#2D4536] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                {/* City Filter */}
                <div className="flex items-center p-1 bg-stone-100 dark:bg-[#18291E] rounded-2xl border border-stone-200 dark:border-[#2D4536] w-full md:w-auto">
                  {[
                    { id: 'all', label: 'جميع المدن' },
                    { id: 'makkah', label: 'مطاعم مكة المكرمة' },
                    { id: 'madinah', label: 'مطاعم المدينة المنورة' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setRestaurantCity(c.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        restaurantCity === c.id
                          ? 'bg-[#1B3022] text-[#E9B161] shadow-sm dark:bg-[#E9B161] dark:text-[#1B3022]'
                          : 'text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'fast_food', label: 'البيك والوجبات السريعة' },
                    { id: 'traditional', label: 'مندي وكبسات وبخاري' },
                    { id: 'breakfast_cafes', label: 'فطور حجازي ومقاهي' },
                    { id: 'food_court', label: 'مجمعات المطاعم' },
                    { id: 'fine_dining', label: 'بوفيه فاخر' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setRestaurantCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        restaurantCategory === cat.id
                          ? 'bg-[#1B3022] text-[#E9B161] dark:bg-[#E9B161] dark:text-[#1B3022]'
                          : 'bg-stone-100 dark:bg-[#18291E] text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Restaurants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRestaurants.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#142318] border border-stone-200 dark:border-[#2D4536] shadow-sm hover:shadow-md transition-all text-right space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {r.city === 'makkah' ? 'مكة المكرمة' : 'المدينة المنورة'}
                        </span>
                        <span className="text-xs text-stone-400">
                          {r.zone}
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-[#1B3022] dark:text-[#E9B161]">
                        {r.name}
                      </h4>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        {r.description}
                      </p>

                      <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#18291E] border border-stone-200 dark:border-[#2D4536] space-y-1 text-xs">
                        <div className="font-bold text-[#E9B161]">الأطباق المميزة:</div>
                        <p className="text-stone-700 dark:text-stone-200">{r.specialty}</p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {r.features.map((feat, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#1C3222] text-stone-600 dark:text-stone-300"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-[#1A2E20] border border-emerald-200/50 dark:border-[#2D4536] text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>نصيحة الزائر:</strong> {r.tips}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 6: COMPREHENSIVE TRANSPORTATION & TRANSIT GUIDE */}
      {activeSection === 'transport_logistics' && (
        <div className="space-y-6">
          {/* Transportation Mode Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {TRANSPORTATION_MODES.map((mode) => {
              const isActive = selectedTransportModeId === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedTransportModeId(mode.id)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-[#1B3022] text-[#E9B161] border-[#E9B161] shadow-lg ring-2 ring-[#E9B161]/40 dark:bg-[#E9B161] dark:text-[#1B3022]'
                      : 'bg-white dark:bg-[#142318] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-[#2D4536]'
                  }`}
                >
                  {mode.iconType === 'train' && <Train className="w-5 h-5" />}
                  {mode.iconType === 'bus' && <Car className="w-5 h-5" />}
                  {mode.iconType === 'taxi' && <Car className="w-5 h-5" />}
                  {mode.iconType === 'wheelchair' && <Accessibility className="w-5 h-5" />}
                  {mode.iconType === 'walk' && <Footprints className="w-5 h-5" />}
                  <span className="text-[11px] font-bold leading-tight">{mode.title.split('(')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Transportation Detailed Card */}
          <div className="bg-white dark:bg-[#142318] p-6 sm:p-7 rounded-3xl border border-stone-200 dark:border-[#2D4536] shadow-lg space-y-5 text-right">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-stone-100 dark:border-[#2D4536]">
              <div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#E9B161]/20 text-[#E9B161] border border-[#E9B161]/30">
                  {activeTransport.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#1B3022] dark:text-[#E9B161] mt-2">
                  {activeTransport.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-3xl leading-relaxed">
                  {activeTransport.summary}
                </p>
              </div>

              {activeTransport.officialAppOrBooking && (
                <a
                  href={activeTransport.officialAppOrBooking.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1B3022] dark:bg-[#E9B161] text-[#E9B161] dark:text-[#1B3022] font-bold text-xs shadow-md hover:opacity-90 transition-all shrink-0"
                >
                  <span>{activeTransport.officialAppOrBooking.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeTransport.keyDetails.map((kd, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#18291E] border border-stone-200 dark:border-[#2D4536] space-y-1"
                >
                  <span className="text-[11px] text-stone-400 dark:text-[#A8BCAD] font-bold">{kd.label}</span>
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-100">{kd.value}</p>
                </div>
              ))}
            </div>

            {/* Main Routes & Times & Fares Table */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-sm text-[#1B3022] dark:text-[#E9B161] flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#E9B161]" />
                <span>أبرز المسارات، الأوقات، والتكاليف التقديرية</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeTransport.routesAndDestinations.map((route, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-[#18291E] border border-stone-200 dark:border-[#2D4536] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1B3022] dark:text-stone-100">
                        {route.from} ⟵ {route.to}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                        {route.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 pt-1 border-t border-stone-200 dark:border-[#2D4536]">
                      <span className="text-[#E9B161] font-bold">{route.cost}</span>
                      <span className="text-[11px] text-stone-400">{route.notes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips & Recommendations */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-[#1A2E20] border border-amber-200 dark:border-[#3D5A47] space-y-2">
              <span className="font-bold text-xs text-amber-900 dark:text-[#E9B161] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>إرشادات ونصائح التنقل الآمن:</span>
              </span>
              <ul className="text-xs text-stone-700 dark:text-stone-200 space-y-1.5 list-disc list-inside leading-relaxed">
                {activeTransport.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: INTERACTIVE CHECKLIST (REFINED ARABIC CATEGORIES) */}
      {activeSection === 'checklist' && (
        <div className="bg-white dark:bg-[#142318] p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-[#2D4536] shadow-md space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-base text-[#1B3022] dark:text-[#E9B161]">حقيبة ومستلزمات المعتمر والحاج (قائمة تفاعلية شاملة)</h3>
              <p className="text-xs text-stone-500 dark:text-[#A8BCAD] mt-0.5">
                قائمة مرتبة بفصاحة ودقة لأهم المستلزمات الشرعية والصحية واللوجستية مع حفظ التقدم تلقائياً
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('هل تريد إعادة تعيين كافة بنود الحقيبة؟')) {
                  setChecklist({});
                  localStorage.removeItem('tareeq_hajj_checklist_v2');
                }
              }}
              className="text-xs text-stone-400 hover:text-red-500 transition-colors"
            >
              إعادة تعيين القائمة
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {[
              // 1. مستلزمات الإحرام والملابس الشرعية
              { id: 'c1', cat: 'مستلزمات الإحرام والملابس الشرعية', text: 'إحرام قطني أبيض فاخر غير مخيط للرجال (إزار ورداء قطعتين) وحزام محكم لتثبيت الإزار وحفظ الأغراض' },
              { id: 'c2', cat: 'مستلزمات الإحرام والملابس الشرعية', text: 'حذاء طبي مريح للطواف والمشي الطويل بدون خياطة للرجال، وخف أو حذاء مريح للمرأة' },
              { id: 'c3', cat: 'مستلزمات الإحرام والملابس الشرعية', text: 'ملابس قطنية واسعة وساترة للمرأة (بدون نقاب أو قفازين أثناء فترة الإحرام)' },
              { id: 'c4', cat: 'مستلزمات الإحرام والملابس الشرعية', text: 'ملابس داخلية وثياب مريحة لاستخدامها بعد إنهاء النسك والتحلل' },

              // 2. الوثائق الرسمية والتصاريح والأموال
              { id: 'c5', cat: 'الوثائق الرسمية وتصاريح تطبيق نُسك والأموال', text: 'جواز السفر ساري المفعول / بطاقة الهوية الوطنية مع نسخ إلكترونية على الهاتف' },
              { id: 'c6', cat: 'الوثائق الرسمية وتصاريح تطبيق نُسك والأموال', text: 'حجز تصريح العمرة وتصريح الصلاة في الروضة الشريفة عبر تطبيق «نُسك» الرسمي' },
              { id: 'c7', cat: 'الوثائق الرسمية وتصاريح تطبيق نُسك والأموال', text: 'تأكيد حجوزات الفنادق وتذاكر قطار الحرمين السريع أو وسيلة النقل' },
              { id: 'c8', cat: 'الوثائق الرسمية وتصاريح تطبيق نُسك والأموال', text: 'بطاقة بنكية مفعلة دولياً ومبلغ نقدي بالريال السعودي للصدقة والمشتريات اليومية' },

              // 3. الحقيبة الطبية والصيدلانية الوقائية
              { id: 'c9', cat: 'الحقيبة الطبية والصيدلانية الوقائية', text: 'الأدوية المزمنة الخاصة بك بكمية كافية مع الوصفة الطبية في حقيبة اليد' },
              { id: 'c10', cat: 'الحقيبة الطبية والصيدلانية الوقائية', text: 'مسكنات الصداع وآلام العضلات والمفاصل وخافض حرارة وأقراص استحلاب لالتهاب الحلق' },
              { id: 'c11', cat: 'الحقيبة الطبية والصيدلانية الوقائية', text: 'مرهم للوقاية من التسلخات الجلدية الناتجة عن المشي الطويل، ولاصقات طبية للقدمين' },
              { id: 'c12', cat: 'الحقيبة الطبية والصيدلانية الوقائية', text: 'كمامات طبية واقية ومعقم يدين غير معطر للوقاية في أوقات الزحام الشديد' },

              // 4. أدوات العناية والنظافة الشخصية غير المعطرة
              { id: 'c13', cat: 'أدوات العناية والنظافة الشخصية (غير المعطرة للمُحرِم)', text: 'صابون وشامبو طبي خالٍ تماماً من أي روائح عطرية لاستخدامه أثناء فترة الإحرام' },
              { id: 'c14', cat: 'أدوات العناية والنظافة الشخصية (غير المعطرة للمُحرِم)', text: 'مزيل عرق طبي خالٍ من العطور للاستخدام في الإحرام' },
              { id: 'c15', cat: 'أدوات العناية والنظافة الشخصية (غير المعطرة للمُحرِم)', text: 'مقص أظافر ومقص شعر صغير أو ماكينة لحلق الرأس أو تقصيره بعد الفراغ من النسك' },
              { id: 'c16', cat: 'أدوات العناية والنظافة الشخصية (غير المعطرة للمُحرِم)', text: 'فرشاة ومعجون أسنان أو سواك طبيعي، ومناديل مبللة غير معطرة' },

              // 5. مستلزمات المشي والتنقل في المشاعر المقدسة
              { id: 'c17', cat: 'مستلزمات المشي والتنقل في المشاعر المقدسة (منى، عرفات، مزدلفة)', text: 'مظلة شمسية خفيفة بيضاء أو فاتحة عاكسة لأشعة الشمس ونظارة شمسية طبية' },
              { id: 'c18', cat: 'مستلزمات المشي والتنقل في المشاعر المقدسة (منى، عرفات، مزدلفة)', text: 'حقيبة ظهر خفيفة لحمل قارورة ماء زمزم والمصحف والكتيبات أثناء الطواف والسعي' },
              { id: 'c19', cat: 'مستلزمات المشي والتنقل في المشاعر المقدسة (منى، عرفات، مزدلفة)', text: 'كيس قماشي مخصص لجمع وحمل حصى الجمرات لمزدلفة وأيام منى' },
              { id: 'c20', cat: 'مستلزمات المشي والتنقل في المشاعر المقدسة (منى، عرفات، مزدلفة)', text: 'سجادة صلاة خفيفة قابلة للطي ووسادة هوائية خفيفة للراحة في المشاعر' },

              // 6. الأجهزة التقنية والشواحن
              { id: 'c21', cat: 'الأجهزة التقنية والشواحن وبنوك الطاقة', text: 'بنك طاقة (Power Bank) أصلي سعة 10,000-20,000 مللي أمبير معتمد للنقل بالطيران' },
              { id: 'c22', cat: 'الأجهزة التقنية والشواحن وبنوك الطاقة', text: 'شاحن جداري ثلاثي وسلك شحن إضافي وسماعات أذن للاستماع لتلاوات القرآن' },

              // 7. الزاد الروحي والأدعية والمأثورات
              { id: 'c23', cat: 'الزاد الروحي والمصحف والأدعية المأثورة', text: 'مصحف الجيب أو تثبيت تطبيق «طريق الهدى» للاستفادة من المصحف والأدعية والأذكار' },
              { id: 'c24', cat: 'الزاد الروحي والمصحف والأدعية المأثورة', text: 'كتابة قائمة خاصة بأدعية الوالدين والأهل والأحباب والذرية للدعاء لهم عند الكعبة وفي عرفات' },
            ].map((item) => {
              const isChecked = !!checklist[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none text-right ${
                    isChecked
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                      : 'bg-stone-50 dark:bg-[#18291E] border-stone-200 dark:border-[#2D4536] hover:border-[#E9B161]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 text-[#E9B161]">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 dark:bg-[#2D4536] text-stone-700 dark:text-stone-300">
                      {item.cat}
                    </span>
                    <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isChecked ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-800 dark:text-stone-200 font-medium'}`}>
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
