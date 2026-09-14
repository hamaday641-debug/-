export interface VideoSource {
  id: string;
  label: string;
  type: 'hls' | 'iframe' | 'embed';
  url: string;
  directUrl: string;
  quality?: string;
  note?: string;
}

export interface LiveStreamChannel {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  type: 'video' | 'audio';
  videoSources: VideoSource[];
  audioStreamUrl?: string;
  fallbackAudioStreamUrl?: string;
  audioSources?: { label: string; url: string }[];
  thumbnail: string;
  badge: string;
  description: string;
  youtubeLiveUrl?: string;
}

export const LIVE_CHANNELS: LiveStreamChannel[] = [
  {
    id: 'makkah_live',
    title: 'بث مباشر من المسجد الحرام (مكة المكرمة)',
    subtitle: 'قناة القرآن الكريم السعودية الرسمية - الكعبة المشرفة',
    location: 'مكة المكرمة، المملكة العربية السعودية',
    type: 'video',
    youtubeLiveUrl: 'https://www.youtube.com/@makkahlive/live',
    videoSources: [
      {
        id: 'makkah_hls_akamai_1',
        label: 'سيرفر أكامي الرئيسي 1 (Akamai HLS HD)',
        type: 'hls',
        url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8',
        directUrl: 'https://www.youtube.com/@makkahlive/live',
        quality: '1080p / 720p HD',
        note: 'سيرفر شبكة أكامي العالمية المعتمد للبث الفوري لقناة القرآن الكريم بدون إعلانات'
      },
      {
        id: 'makkah_hls_akamai_2',
        label: 'سيرفر أكامي البديل 2 (Akamai Video)',
        type: 'hls',
        url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_video/index.m3u8',
        directUrl: 'https://www.youtube.com/@makkahlive/live',
        quality: '720p HD',
        note: 'سيرفر أكامي فائق السرعة والخفة'
      },
      {
        id: 'makkah_hls_holol',
        label: 'سيرفر هولول 3 (Holol CDN)',
        type: 'hls',
        url: 'https://win.holol.com/live/quran/playlist.m3u8',
        directUrl: 'https://www.youtube.com/@makkahlive/live',
        quality: 'FHD 1080p',
        note: 'سيرفر البث الاحتياطي السريع'
      },
      {
        id: 'makkah_dailymotion',
        label: 'سيرفر ديليموشن 4 (Dailymotion)',
        type: 'iframe',
        url: 'https://www.dailymotion.com/embed/video/x7vubk5?autoplay=1&mute=0',
        directUrl: 'https://www.dailymotion.com/video/x7vubk5',
        quality: 'FHD 1080p',
        note: 'بث منصة ديليموشن لقناة القرآن الكريم'
      }
    ],
    audioStreamUrl: 'https://stream.radiojar.com/4wqre23fytzuv',
    thumbnail: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    badge: 'بث حي متواصل 24/7',
    description: 'بث مباشر عالي الدقة على مدار 24 ساعة ينقل الصلوات الخمس المكتوبة، الطواف حول الكعبة المشرفة، وتلاوات أئمة الحرم المكي الشريف.'
  },
  {
    id: 'madinah_live',
    title: 'بث مباشر من المسجد النبوي الشريف',
    subtitle: 'قناة السنة النبوية السعودية الرسمية - الروضة الشريفة',
    location: 'المدينة المنورة، المملكة العربية السعودية',
    type: 'video',
    youtubeLiveUrl: 'https://www.youtube.com/@sunnahmadinah/live',
    videoSources: [
      {
        id: 'madinah_hls_akamai_1',
        label: 'سيرفر أكامي الرئيسي 1 (Akamai HLS HD)',
        type: 'hls',
        url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8',
        directUrl: 'https://www.youtube.com/@sunnahmadinah/live',
        quality: '1080p / 720p HD',
        note: 'سيرفر شبكة أكامي الرسمية لقناة السنة النبوية الشريفة - بث فوري مستقر'
      },
      {
        id: 'madinah_hls_akamai_2',
        label: 'سيرفر أكامي البديل 2 (Akamai Video)',
        type: 'hls',
        url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_video/index.m3u8',
        directUrl: 'https://www.youtube.com/@sunnahmadinah/live',
        quality: '720p HD',
        note: 'سيرفر أكامي خفيف وسريع للمسجد النبوي الشريف'
      },
      {
        id: 'madinah_hls_holol',
        label: 'سيرفر هولول 3 (Holol CDN)',
        type: 'hls',
        url: 'https://win.holol.com/live/sunnah/playlist.m3u8',
        directUrl: 'https://www.youtube.com/@sunnahmadinah/live',
        quality: 'FHD 1080p',
        note: 'بث رسمي سريع للمسجد النبوي الشريف'
      },
      {
        id: 'madinah_dailymotion',
        label: 'سيرفر ديليموشن 4 (Dailymotion)',
        type: 'iframe',
        url: 'https://www.dailymotion.com/embed/video/x8j0a7g?autoplay=1&mute=0',
        directUrl: 'https://www.dailymotion.com/video/x8j0a7g',
        quality: '1080p FHD',
        note: 'بث قناة السنة النبوية الرسمية من الروضة الشريفة'
      }
    ],
    audioStreamUrl: 'https://stream.radiojar.com/4wqre23fytzuv',
    thumbnail: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80',
    badge: 'بث حي متواصل 24/7',
    description: 'نقل مباشر مستمر من رحاب مسجد رسول الله ﷺ بالمدينة المنورة، مع نقل الأذان والصلوات وزيارة الروضة الشريفة والسلام على النبي ﷺ.'
  },
  {
    id: 'cairo_quran_radio_live',
    title: 'إذاعة القرآن الكريم من القاهرة (مصر)',
    subtitle: 'أعرق إذاعة قرآنية في العالم الإسلامي - بث مباشر 24/7',
    location: 'القاهرة، جمهورية مصر العربية',
    type: 'audio',
    videoSources: [],
    audioStreamUrl: '/api/radio/cairo',
    fallbackAudioStreamUrl: 'https://stream.radiojar.com/8s5u5tpdtwzuv',
    audioSources: [
      { label: 'بث القاهرة الرسمي المباشر (سيرفر فائق السرعة)', url: '/api/radio/cairo' },
      { label: 'بث القاهرة المباشر (راديو جار مباشر)', url: 'https://stream.radiojar.com/8s5u5tpdtwzuv' },
      { label: 'بث القاهرة الاحتياطي 2', url: 'https://stream.radiojar.com/0tpy1h0kxtzuv' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80',
    badge: 'إذاعة القاهرة التاريخية',
    description: 'بث حي ومباشر على مدار 24 ساعة لإذاعة القرآن الكريم من القاهرة، يضم تلاوات كبار عمالقة دولة التلاوة المصرية (المنشاوي، الحصري، عبد الباسط، ومصطفى إسماعيل)، مع الابتهالات والبرامج والتفاسير.'
  },
  {
    id: 'saudi_quran_radio_live',
    title: 'إذاعة القرآن الكريم (المملكة العربية السعودية)',
    subtitle: 'الإذاعة الرسمية للقرآن الكريم من مكة المكرمة والرياض',
    location: 'مكة المكرمة والرياض',
    type: 'audio',
    videoSources: [],
    audioStreamUrl: '/api/radio/saudi',
    fallbackAudioStreamUrl: 'https://stream.radiojar.com/4wqre23fytzuv',
    audioSources: [
      { label: 'إذاعة القرآن الكريم السعودية الرسمية (سيرفر مباشر)', url: '/api/radio/saudi' },
      { label: 'إذاعة القرآن السعودية (راديو جار)', url: 'https://stream.radiojar.com/4wqre23fytzuv' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
    badge: 'إذاعة مكة 24/7',
    description: 'بث صوتي مباشر مستمر لأعذب التلاوات القرآنية الخاشعة من أئمة الحرم المكي والمسجد النبوي الشريف والبرامج الدينية وتفسير الآيات وأحاديث السنة النبوية.'
  }
];
