export interface HaramainSpecialAudio {
  id: string;
  title: string;
  category: 'adhan' | 'taraweeh' | 'khatmah' | 'takbeer' | 'khutbah';
  location: 'makkah' | 'madinah';
  reciterOrMuazzin: string;
  audioUrl: string;
  duration?: string;
  description: string;
}

export const HARAMAIN_SPECIAL_RECORDINGS: HaramainSpecialAudio[] = [
  {
    id: 'makkah_adhan_1',
    title: 'أذان المسجد الحرام بمكة المكرمة (الأذان الحجازي الخاشع)',
    category: 'adhan',
    location: 'makkah',
    reciterOrMuazzin: 'مؤذنو المسجد الحرام (الشيخ علي ملا)',
    audioUrl: 'https://backup.qurango.net/radio/tarteel',
    duration: '04:15',
    description: 'أذان المسجد الحرام بصوت شيخ مؤذني الحرم المكي الشريف علي ملا بمقام البيات اليماني.'
  },
  {
    id: 'madinah_adhan_1',
    title: 'أذان المسجد النبوي الشريف بالمدينة المنورة',
    category: 'adhan',
    location: 'madinah',
    reciterOrMuazzin: 'مؤذنو المسجد النبوي الشريف',
    audioUrl: 'https://backup.qurango.net/radio/tarteel',
    duration: '04:30',
    description: 'نداء الحق من رحاب مسجد رسول الله ﷺ بالمدينة المنورة.'
  },
  {
    id: 'takbeerat_haram',
    title: 'تكبيرات العيد والحج من الحرم المكي الشريف',
    category: 'takbeer',
    location: 'makkah',
    reciterOrMuazzin: 'مؤذنو وأئمة الحرمين الشريفين',
    audioUrl: 'https://backup.qurango.net/radio/tarteel',
    duration: '15:20',
    description: 'تكبيرات الحج والتلبية الجماعية العذبة: «لبيك اللهم لبيك، لبيك لا شريك لك لبيك».'
  },
  {
    id: 'sudais_khatm',
    title: 'دعاء ختم القرآن الكريم من المسجد الحرام (الشيخ عبدالرحمن السديس)',
    category: 'khatmah',
    location: 'makkah',
    reciterOrMuazzin: 'الشيخ د. عبدالرحمن السديس',
    audioUrl: 'https://server11.mp3quran.net/sds/114.mp3',
    duration: '32:40',
    description: 'الدعاء الخاشع ليلة 29 رمضان في رحاب البيت العتيق بمكة المكرمة.'
  },
  {
    id: 'shuraim_fatihah_baqarah',
    title: 'تلاوة تراويح الحرم المكي (سورة الفاتحة وأوائل البقرة)',
    category: 'taraweeh',
    location: 'makkah',
    reciterOrMuazzin: 'الشيخ د. سعود الشريم',
    audioUrl: 'https://server7.mp3quran.net/shur/001.mp3',
    duration: '02:30',
    description: 'التلاوة الحجازية الرخيمة لفضيلة الشيخ سعود الشريم من صلاة التراويح.'
  },
  {
    id: 'muaiqly_yusuf',
    title: 'سورة يوسف كاملة بتلاوة باكية خاشعة من الحرم المكي',
    category: 'taraweeh',
    location: 'makkah',
    reciterOrMuazzin: 'الشيخ د. ماهر المعيقلي',
    audioUrl: 'https://server12.mp3quran.net/maher/012.mp3',
    duration: '28:10',
    description: 'تلاوة محبرة تهتز لها القلوب من صلوات الحرم المكي الشريف.'
  },
  {
    id: 'dossari_kahf',
    title: 'سورة الكهف كاملة بصوت عذب ندي من المسجد الحرام',
    category: 'taraweeh',
    location: 'makkah',
    reciterOrMuazzin: 'الشيخ د. ياسر الدوسري',
    audioUrl: 'https://server11.mp3quran.net/yasser/018.mp3',
    duration: '24:50',
    description: 'تلاوة يوم الجمعة الممتعة للشيخ ياسر الدوسري من محراب المسجد الحرام.'
  },
  {
    id: 'juhany_maryam',
    title: 'سورة مريم كاملة بصوت شجي من المسجد الحرام',
    category: 'taraweeh',
    location: 'makkah',
    reciterOrMuazzin: 'الشيخ عبدالله عواد الجهني',
    audioUrl: 'https://server13.mp3quran.net/jhn/019.mp3',
    duration: '18:40',
    description: 'تلاوة هادئة خاشعة من صلاة الفجر بالحرم المكي الشريف.'
  },
  {
    id: 'ali_jaber_rahman',
    title: 'سورة الرحمن بصوت الشيخ علي عبدالله جابر (رحمه الله)',
    category: 'taraweeh',
    location: 'makkah',
    reciterOrMuazzin: 'الشيخ علي جابر (رحمه الله)',
    audioUrl: 'https://server11.mp3quran.net/a_jbr/055.mp3',
    duration: '12:15',
    description: 'تلاوة تاريخية خالدة من نوادر تراويح المسجد الحرام في الثمانينات.'
  },
  {
    id: 'hudhaify_mulk',
    title: 'سورة الملك من محراب المسجد النبوي الشريف',
    category: 'taraweeh',
    location: 'madinah',
    reciterOrMuazzin: 'الشيخ علي بن عبدالرحمن الحذيفي',
    audioUrl: 'https://server9.mp3quran.net/hthfi/067.mp3',
    duration: '08:30',
    description: 'تلاوة متقنة بقواعد الترتيل المحكم لشيخ عموم مقارئ المدينة المنورة.'
  },
  {
    id: 'budair_qiyama',
    title: 'سورة القيامة بتلاوة مؤثرة من المسجد النبوي',
    category: 'taraweeh',
    location: 'madinah',
    reciterOrMuazzin: 'الشيخ د. صلاح البدير',
    audioUrl: 'https://server6.mp3quran.net/s_bud/075.mp3',
    duration: '04:50',
    description: 'تلاوة تحبيرية خاشعة من صلاة التراويح بمسجد رسول الله ﷺ.'
  },
  {
    id: 'ayyoub_waqiah',
    title: 'سورة الواقعة بصوت الشيخ محمد أيوب (رحمه الله)',
    category: 'taraweeh',
    location: 'madinah',
    reciterOrMuazzin: 'الشيخ محمد أيوب (رحمه الله)',
    audioUrl: 'https://server8.mp3quran.net/ayyub/056.mp3',
    duration: '10:45',
    description: 'تلاوة حجازية نادرة تأسرك بجمالها من صلوات المسجد النبوي الشريف.'
  }
];
