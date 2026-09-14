import { Reciter, RiwayahType } from '../types';

export interface RiwayahInfo {
  id: RiwayahType;
  name: string;
  imam: string;
  rawi: string;
  geography: string;
  description: string;
  popularRecitersCount: number;
}

export const RIWAYAT_INFO: RiwayahInfo[] = [
  {
    id: 'حفص عن عاصم',
    name: 'حفص عن عاصم الكوفي',
    imam: 'عاصم بن بهدلة أبي النَّجود الكوفي',
    rawi: 'حفص بن سليمان بن المغيرة الأسدي الكوفي',
    geography: 'الأكثر انتشاراً في العالم الإسلامي (مصر، الشام، الحجاز، الخليج، آسيا)',
    description: 'الرواية الأشهر والأوسع تداولاً في مصاحف العالم الإسلامي لقوة سندها وإتقان رواة الكوفة لأحكام الترتيل.',
    popularRecitersCount: 35
  },
  {
    id: 'ورش عن نافع',
    name: 'ورش عن نافع المدني (طريق الأزرق)',
    imam: 'نافع بن عبدالرحمن بن أبي نعيم المدني',
    rawi: 'عثمان بن سعيد المصري المشهور بـ «ورش»',
    geography: 'المغرب العربي (المغرب، الجزائر، موريتانيا، وأجزاء من تونس وغرب إفريقيا)',
    description: 'تتميز بترقيق الراءات وتغليظ اللامات وتسهيل الهمزات ونقل حركة الهمزة إلى الساكن قبلها والمد المشبع.',
    popularRecitersCount: 8
  },
  {
    id: 'قالون عن نافع',
    name: 'قالون عن نافع المدني',
    imam: 'نافع بن عبدالرحمن بن أبي نعيم المدني',
    rawi: 'عيسى بن مينا المدني الملقب بـ «قالون» (أي الجيد بلغة الروم)',
    geography: 'ليبيا، تونس، وأجزاء من تشاد وإفريقيا',
    description: 'تتميز بقصر المنفصل وتوسطه، وتسهيل الهمزة الثانية مع الإدخال في الهمزتين من كلمة واحدة وصلة ميم الجمع.',
    popularRecitersCount: 5
  },
  {
    id: 'الدوري عن أبي عمرو',
    name: 'الدوري عن أبي عمرو البصري',
    imam: 'أبو عمرو زبان بن العلاء البصري',
    rawi: 'حفص بن عمر بن عبدالعزيز الدوري',
    geography: 'السودان، الصومال، إريتريا، وتشاد وشرق إفريقيا',
    description: 'تتميز بالإدغام الكبير للسواكن والمتحركات، والإمالة في ذوات الياء، وتسهيل الهمزات وقصر المنفصل.',
    popularRecitersCount: 4
  },
  {
    id: 'السوسي عن أبي عمرو',
    name: 'السوسي عن أبي عمرو البصري',
    imam: 'أبو عمرو زبان بن العلاء البصري',
    rawi: 'أبو شعيب صالح بن زياد السوسي',
    geography: 'أهل الاختصاص ومقارئ العالم الإسلامي',
    description: 'تتميز بالإدغام الكبير الشهير لكلمات ومخارج الحروف المتقاربة والمتماثلة وإبدال الهمز الساكن حرف مد.',
    popularRecitersCount: 3
  },
  {
    id: 'شعبة عن عاصم',
    name: 'شعبة عن عاصم الكوفي',
    imam: 'عاصم بن بهدلة أبي النَّجود الكوفي',
    rawi: 'شعبة بن عياش بن سالم الأسدي الكوفي',
    geography: 'المقارئ الإسلامية المتخصصة وحلقات الإجازات',
    description: 'الرواية الثانية عن الإمام عاصم، تختلف عن حفص في بعض الأصول والفرش والإمالات.',
    popularRecitersCount: 3
  },
  {
    id: 'خلف عن حمزة',
    name: 'خلف عن حمزة الكوفي',
    imam: 'حمزة بن حبيب الزيات الكوفي',
    rawi: 'خلف بن هشام البزاز الكوفي',
    geography: 'حلقات القراءات العشر الكبرى والصغرى',
    description: 'تتميز بالسكت على المفصول والموصول، وإمالة ذوات الياء، والإشباع في المدين المتصل والمنفصل 6 حركات.',
    popularRecitersCount: 2
  },
  {
    id: 'رويس عن يعقوب',
    name: 'رويس عن يعقوب الحضرمي',
    imam: 'يعقوب بن إسحاق الحضرمي البصري',
    rawi: 'محمد بن المتوكل اللؤلؤي البصري الملقب بـ «رويس»',
    geography: 'إحدى القراءات العشر المتواترة المتممة للعشر',
    description: 'تتميز بتسهيل الهمز، وهاء السكت عند الوقف على بعض الكلمات والاستفهام المكرر.',
    popularRecitersCount: 2
  }
];

export const RECITERS_LIST: Reciter[] = [
  // ==========================================
  // 1. أئمة وقراء المسجد الحرام بمكة المكرمة
  // ==========================================
  {
    id: 'sudais',
    name: 'عبدالرحمن السديس',
    subname: 'إمام وخطيب المسجد الحرام ورئيس الشؤون الدينية بالحرمين',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Abdurrahmaan_As-Sudais_192kbps',
    mp3quranServer: 'https://server11.mp3quran.net/sds/',
    origin: 'مكة المكرمة'
  },
  {
    id: 'shuraim',
    name: 'سعود الشريم',
    subname: 'إمام وخطيب المسجد الحرام (سابقاً)',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Saood_ash-Shuraym_128kbps',
    mp3quranServer: 'https://server7.mp3quran.net/shur/',
    origin: 'مكة المكرمة'
  },
  {
    id: 'muaiqly',
    name: 'ماهر المعيقلي',
    subname: 'إمام وخطيب المسجد الحرام',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'MaherAlMuaiqly128kbps',
    mp3quranServer: 'https://server12.mp3quran.net/maher/',
    origin: 'مكة المكرمة'
  },
  {
    id: 'dossari',
    name: 'ياسر الدوسري',
    subname: 'إمام وخطيب المسجد الحرام',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Yasser_Ad-Dussary_128kbps',
    mp3quranServer: 'https://server11.mp3quran.net/yasser/',
    origin: 'مكة المكرمة'
  },
  {
    id: 'juhany',
    name: 'عبدالله عواد الجهني',
    subname: 'إمام المسجد الحرام',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps',
    mp3quranServer: 'https://server13.mp3quran.net/jhn/',
    origin: 'مكة المكرمة'
  },
  {
    id: 'ali_jaber',
    name: 'علي عبدالله جابر',
    subname: 'إمام المسجد الحرام (رحمه الله)',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ali_Jaber_64kbps',
    mp3quranServer: 'https://server11.mp3quran.net/a_jbr/',
    origin: 'مكة المكرمة'
  },
  {
    id: 'baleela',
    name: 'بندر بليلة',
    subname: 'إمام وخطيب المسجد الحرام وعضو هيئة كبار العلماء',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server6.mp3quran.net/balilah/',
    origin: 'مكة المكرمة'
  },

  // ==========================================
  // 2. أئمة وقراء المسجد النبوي الشريف
  // ==========================================
  {
    id: 'hudhaify',
    name: 'علي بن عبدالرحمن الحذيفي',
    subname: 'إمام وخطيب المسجد النبوي الشريف وشيخ عموم مقارئ المدينة',
    category: 'haram_madinah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Hudhaify_128kbps',
    mp3quranServer: 'https://server9.mp3quran.net/hthfi/',
    origin: 'المدينة المنورة'
  },
  {
    id: 'budair',
    name: 'صلاح البدير',
    subname: 'إمام وخطيب المسجد النبوي الشريف',
    category: 'haram_madinah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Salah_Al_Budair_128kbps',
    mp3quranServer: 'https://server6.mp3quran.net/s_bud/',
    origin: 'المدينة المنورة'
  },
  {
    id: 'qasim',
    name: 'عبدالمحسن القاسم',
    subname: 'إمام وخطيب المسجد النبوي الشريف',
    category: 'haram_madinah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Muhsin_Al_Qasim_192kbps',
    mp3quranServer: 'https://server8.mp3quran.net/qasm/',
    origin: 'المدينة المنورة'
  },
  {
    id: 'ayyoub',
    name: 'محمد أيوب',
    subname: 'إمام المسجد النبوي الشريف (رحمه الله)',
    category: 'haram_madinah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Muhammad_Ayyoub_128kbps',
    mp3quranServer: 'https://server8.mp3quran.net/ayyub/',
    origin: 'المدينة المنورة'
  },
  {
    id: 'akhdar',
    name: 'إبراهيم الأخضر',
    subname: 'شيخ قراء المدينة المنورة وإمام المسجد النبوي سابقاً',
    category: 'haram_madinah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ibrahim_Akhdar_32kbps',
    mp3quranServer: 'https://server6.mp3quran.net/akdr/',
    origin: 'المدينة المنورة'
  },
  {
    id: 'khalid_muhanna',
    name: 'خالد المهنا',
    subname: 'إمام المسجد النبوي الشريف',
    category: 'haram_madinah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server11.mp3quran.net/mohna/',
    origin: 'المدينة المنورة'
  },

  // ==========================================
  // 3. أساطين دولة التلاوة المصرية (الرعيل الأول)
  // ==========================================
  {
    id: 'mustafa_ismail',
    name: 'مصطفى إسماعيل (مرتل)',
    subname: 'مقرئ الجامع الأزهر الشريف والقصر الملكي',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Mustafa_Ismail_48kbps',
    mp3quranServer: 'https://server8.mp3quran.net/mustafa/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'mustafa_ismail_mujawwad',
    name: 'مصطفى إسماعيل (المصحف المجود والنوادر)',
    subname: 'روائع التجويد الفريدة والمحافل التاريخية الخالدة',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مجود',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server8.mp3quran.net/mustafa/Almusshaf-Al-Mojawwad/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'minshawi_murattal',
    name: 'محمد صديق المنشاوي (مرتل)',
    subname: 'صوت البكاء الخاشع وريحانة دولة التلاوة',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Minshawy_Murattal_128kbps',
    mp3quranServer: 'https://server10.mp3quran.net/minsh/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'minshawi_mujawwad',
    name: 'محمد صديق المنشاوي (مجود)',
    subname: 'التلاوة التجويدية الخاشعة الخالدة',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مجود',
    everyAyahFolder: 'Minshawy_Mujawwad_192kbps',
    mp3quranServer: 'https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'husary_murattal',
    name: 'محمود خليل الحصري (مرتل)',
    subname: 'شيخ عموم المقارئ المصرية وأول من سجل المصحف المرتل في العالم',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Husary_128kbps',
    mp3quranServer: 'https://server13.mp3quran.net/husr/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'husary_mujawwad',
    name: 'محمود خليل الحصري (مجود)',
    subname: 'أتقن تلاوة تجويدية ومخارج حروف في العصر الحديث',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مجود',
    everyAyahFolder: 'Husary_128kbps_Mujawwad',
    mp3quranServer: 'https://server13.mp3quran.net/husr/Almusshaf-Al-Mojawwad/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'abdulbasit_murattal',
    name: 'عبدالباسط عبدالصمد (مرتل)',
    subname: 'صوت مكة الخالد وسفير القرآن الكريم في العالم',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Abdul_Basit_Murattal_192kbps',
    mp3quranServer: 'https://server7.mp3quran.net/basit/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'abdulbasit_mujawwad',
    name: 'عبدالباسط عبدالصمد (مجود)',
    subname: 'الحنجرة الذهبية وروائع التجويد في المسجد الأقصى والجامع الأموي',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مجود',
    everyAyahFolder: 'Abdul_Basit_Mujawwad_128kbps',
    mp3quranServer: 'https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'banna',
    name: 'محمود علي البنا',
    subname: 'مقرئ مسجد الإمام الحسين والجامع الأزهر الشريف',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'mahmoud_ali_al_banna_32kbps',
    mp3quranServer: 'https://server8.mp3quran.net/bna/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'tablawi',
    name: 'محمد محمود الطبلاوي',
    subname: 'نقيب قراء مصر وصاحب النبرة الشجية القوية',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Mohammad_al_Tablaway_128kbps',
    mp3quranServer: 'https://server12.mp3quran.net/tblawi/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'rifat',
    name: 'محمد رفعت',
    subname: 'قيثارة السماء ورائد الإذاعة المصرية الأول (تسجيلات نادرة)',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مجود',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server14.mp3quran.net/refat/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'naina',
    name: 'أحمد نعينع',
    subname: 'طبيب القلوب وقارئ الإذاعة والجامع الأزهر الشريف (مرتل)',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ahmed_Neana_128kbps',
    mp3quranServer: 'https://server11.mp3quran.net/ahmad_nu/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'naina_mujawwad',
    name: 'أحمد نعينع (المصحف المجود)',
    subname: 'طبيب القلوب وأستاذ المقامات - المصحف المجود الخاشع',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مجود',
    isFullSurahOnly: true,
    everyAyahFolder: 'Ahmed_Neana_128kbps',
    mp3quranServer: 'https://server11.mp3quran.net/ahmad_nu/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'sayyad',
    name: 'شعبان الصياد',
    subname: 'فارس التلاوة وصاحب المقامات الصعبة والتصوير العظيم',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server11.mp3quran.net/shaban/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'hajjaj',
    name: 'علي حجاج السويسي',
    subname: 'علم من أعلام التلاوة المصرية الخاشعة',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ali_Hajjaj_AlSuesy_128kbps',
    mp3quranServer: 'https://server9.mp3quran.net/hajjaj/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'hakem',
    name: 'محمود عبدالحكم',
    subname: 'أحد رواد إذاعة القرآن الكريم المصرية وتلاوات الزمن الجميل',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server16.mp3quran.net/m_abdelhakam/Rewayat-Hafs-A-n-Assem/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'shahhat',
    name: 'عبدالرحمن الشحات أنور',
    subname: 'امتداد مدرسة نغمية مصرية أصيلة بصوت عذب',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server16.mp3quran.net/a_alshahhat/Rewayat-Hafs-A-n-Assem/',
    origin: 'جمهورية مصر العربية'
  },

  // ==========================================
  // 4. قراء الروايات القرآنية المختلفة (ورش، قالون، الدوري، السوسي، شعبة، خلف)
  // ==========================================
  {
    id: 'husary_warsh',
    name: 'محمود خليل الحصري (ورش عن نافع)',
    subname: 'المصحف المرتل برواية ورش من طريق الأزرق',
    category: 'riwayah_masters',
    riwayah: 'ورش عن نافع',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server13.mp3quran.net/husr/Rewayat-Warsh-A-n-Nafi/',
    origin: 'مصر / المغرب العربي'
  },
  {
    id: 'abdulbasit_warsh',
    name: 'عبدالباسط عبدالصمد (ورش عن نافع)',
    subname: 'المصحف المرتل برواية ورش عن نافع بصوته الشجي',
    category: 'riwayah_masters',
    riwayah: 'ورش عن نافع',
    style: 'مرتل',
    everyAyahFolder: 'warsh/warsh_Abdul_Basit_128kbps',
    mp3quranServer: 'https://server7.mp3quran.net/basit/Rewayat-Warsh-A-n-Nafi/',
    origin: 'مصر / المغرب العربي'
  },
  {
    id: 'qazabri_warsh',
    name: 'عمر القزابري (ورش عن نافع)',
    subname: 'إمام مسجد الحسن الثاني بالدار البيضاء',
    category: 'riwayah_masters',
    riwayah: 'ورش عن نافع',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server9.mp3quran.net/omar_warsh/',
    origin: 'المملكة المغربية'
  },
  {
    id: 'jazaery_warsh',
    name: 'ياسين الجزائري (ورش عن نافع)',
    subname: 'تلاوة جزائرية خاشعة ومتقنة برواية ورش',
    category: 'riwayah_masters',
    riwayah: 'ورش عن نافع',
    style: 'مرتل',
    everyAyahFolder: 'warsh/warsh_yassin_al_jazaery_64kbps',
    mp3quranServer: 'https://server11.mp3quran.net/qari/',
    origin: 'الجمهورية الجزائرية'
  },
  {
    id: 'kouchi_warsh',
    name: 'العيون الكوشي (ورش عن نافع)',
    subname: 'إمام مسجد الأندلس بالدار البيضاء والمغرب',
    category: 'riwayah_masters',
    riwayah: 'ورش عن نافع',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server11.mp3quran.net/koshi/',
    origin: 'المملكة المغربية'
  },
  {
    id: 'husary_qaloon',
    name: 'محمود خليل الحصري (قالون عن نافع)',
    subname: 'المصحف المرتل برواية قالون عن نافع المدني',
    category: 'riwayah_masters',
    riwayah: 'قالون عن نافع',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server13.mp3quran.net/husr/Rewayat-Qalon-A-n-Nafi/',
    origin: 'مصر / ليبيا وتونس'
  },
  {
    id: 'hudhaify_qaloon',
    name: 'علي بن عبدالرحمن الحذيفي (قالون عن نافع)',
    subname: 'تلاوة متقنة برواية قالون عن نافع',
    category: 'riwayah_masters',
    riwayah: 'قالون عن نافع',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server9.mp3quran.net/huthifi_qalon/',
    origin: 'المدينة المنورة'
  },
  {
    id: 'trabulsi_qaloon',
    name: 'أحمد خضر الطرابلسي (قالون عن نافع)',
    subname: 'تلاوة هادئة ومتقنة برواية قالون',
    category: 'riwayah_masters',
    riwayah: 'قالون عن نافع',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server10.mp3quran.net/trablsi/',
    origin: 'لبنان / الكويت'
  },
  {
    id: 'husary_duri',
    name: 'محمود خليل الحصري (الدوري عن أبي عمرو)',
    subname: 'المصحف المرتل برواية الدوري عن أبي عمرو البصري',
    category: 'riwayah_masters',
    riwayah: 'الدوري عن أبي عمرو',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server13.mp3quran.net/husr/Rewayat-Aldori-A-n-Abi-Amr/',
    origin: 'مصر / السودان وشرق إفريقيا'
  },
  {
    id: 'noreen_duri',
    name: 'نورين محمد صديق (الدوري عن أبي عمرو)',
    subname: 'التلاوة السودانية الخاشعة الفريدة برواية الدوري',
    category: 'riwayah_masters',
    riwayah: 'الدوري عن أبي عمرو',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server16.mp3quran.net/nourin_siddig/Rewayat-Aldori-A-n-Abi-Amr/',
    origin: 'السودان'
  },
  {
    id: 'sultany_duri',
    name: 'مفتاح السلطني (الدوري عن أبي عمرو)',
    subname: 'برواية الدوري عن أبي عمرو البصري',
    category: 'riwayah_masters',
    riwayah: 'الدوري عن أبي عمرو',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server14.mp3quran.net/muftah_sultany/Rewayat-Aldori-A-n-Abi-Amr/',
    origin: 'ليبيا'
  },
  {
    id: 'sultany_shoba',
    name: 'مفتاح السلطني (شعبة عن عاصم)',
    subname: 'برواية شعبة عن عاصم الكوفي',
    category: 'riwayah_masters',
    riwayah: 'شعبة عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server14.mp3quran.net/muftah_sultany/Rewayat_Sho-bah-A-n-Asim/',
    origin: 'ليبيا'
  },
  {
    id: 'hudhaify_shoba',
    name: 'علي الحذيفي (شعبة عن عاصم)',
    subname: 'المصحف المرتل برواية شعبة عن عاصم الكوفي',
    category: 'riwayah_masters',
    riwayah: 'شعبة عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server9.mp3quran.net/hthfi/Rewayat-Sho-bah-A-n-Asim/',
    origin: 'المدينة المنورة'
  },
  {
    id: 'soufi_khalaf',
    name: 'عبدالرشيد صوفي (خلف عن حمزة)',
    subname: 'المصحف المرتل برواية خلف عن حمزة الكوفي بالسكت والإشباع',
    category: 'riwayah_masters',
    riwayah: 'خلف عن حمزة',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server16.mp3quran.net/soufi/Rewayat-Khalaf-A-n-Hamzah/',
    origin: 'الصومال / قطر'
  },
  {
    id: 'soufi_soosi',
    name: 'عبدالرشيد صوفي (السوسي عن أبي عمرو)',
    subname: 'تلاوة محكمة برواية السوسي عن أبي عمرو بالإدغام الكبير',
    category: 'riwayah_masters',
    riwayah: 'السوسي عن أبي عمرو',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server16.mp3quran.net/soufi/Rewayat-Assosi-A-n-Abi-Amr/',
    origin: 'الصومال / قطر'
  },
  {
    id: 'mazrui_ruwais',
    name: 'ياسر المزروعي (رويس عن يعقوب)',
    subname: 'المصحف المرتل برواية رويس عن يعقوب الحضرمي',
    category: 'riwayah_masters',
    riwayah: 'رويس عن يعقوب',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server9.mp3quran.net/mzroyee/',
    origin: 'الكويت'
  },

  // ==========================================
  // 5. كبار القراء المشهورين في العالم الإسلامي
  // ==========================================
  {
    id: 'alafasy',
    name: 'مشاري بن راشد العفاسي',
    subname: 'إمام المسجد الكبير بدولة الكويت وصاحب الصوت العذب',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Alafasy_128kbps',
    mp3quranServer: 'https://server8.mp3quran.net/afs/',
    origin: 'دولة الكويت'
  },
  {
    id: 'ghamadi',
    name: 'سعد الغامدي',
    subname: 'القارئ وإمام جامع كانو بالدمام وإمام الحرم النبوي بالتراويح سابقاً',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ghamadi_40kbps',
    mp3quranServer: 'https://server7.mp3quran.net/s_gmd/',
    origin: 'المملكة العربية السعودية'
  },
  {
    id: 'ajmy',
    name: 'أحمد بن علي العجمي',
    subname: 'القارئ السعودي وإمام جامع خادم الحرمين الشريفين بالخبر سابقاً',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'ahmed_ibn_ali_al_ajamy_128kbps',
    mp3quranServer: 'https://server10.mp3quran.net/ajm/',
    origin: 'المملكة العربية السعودية'
  },
  {
    id: 'qatami',
    name: 'ناصر القطامي',
    subname: 'إمام وخطيب جامع الأمير سلطان بن عبدالعزيز بالرياض',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Nasser_Alqatami_128kbps',
    mp3quranServer: 'https://server6.mp3quran.net/qtm/',
    origin: 'المملكة العربية السعودية'
  },
  {
    id: 'jibreel',
    name: 'محمد جبريل',
    subname: 'إمام مسجد عمرو بن العاص بالقاهرة وسفير القرآن في العالم',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Muhammad_Jibreel_128kbps',
    mp3quranServer: 'https://server8.mp3quran.net/jbrl/',
    origin: 'جمهورية مصر العربية'
  },
  {
    id: 'kurdi',
    name: 'رعد محمد الكردي',
    subname: 'إمام جامع الشافعي بكركوك وإمام زائر بدبي',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server6.mp3quran.net/kurdi/',
    origin: 'العراق'
  },
  {
    id: 'hazza',
    name: 'هزاع البلوشي',
    subname: 'القارئ العُماني وصاحب النبرة الرقيقة الهادئة',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server11.mp3quran.net/hazza/',
    origin: 'سلطنة عُمان'
  },
  {
    id: 'lahidan',
    name: 'محمد اللحيدان',
    subname: 'إمام وخطيب جامع الناصر بالرياض وصاحب التلاوة الباكية',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server8.mp3quran.net/lhdan/',
    origin: 'المملكة العربية السعودية'
  },
  {
    id: 'abdulwasi',
    name: 'وديع اليمني',
    subname: 'القارئ اليمني وإمام مسجد أبي بكر الصديق بالكويت',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server6.mp3quran.net/wdee3/',
    origin: 'اليمن / الكويت'
  },
  {
    id: 'fares_abbad',
    name: 'فارس عباد',
    subname: 'القارئ اليمني وإمام جامع الإمام علي بن أبي طالب بالدوحة',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Fares_Abbad_64kbps',
    mp3quranServer: 'https://server8.mp3quran.net/frs_a/',
    origin: 'اليمن'
  },
  {
    id: 'sowaid',
    name: 'أيمن سويد',
    subname: 'عالم القراءات والتجويد المعروف ورئيس المجلس العلمي',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ayman_Sowaid_64kbps',
    origin: 'سوريا'
  },
  {
    id: 'shatri',
    name: 'أبو بكر الشاطري',
    subname: 'إمام جامع الفرقان بجدة وصاحب الصوت الرخيم',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Abu_Bakr_Ash-Shaatree_128kbps',
    mp3quranServer: 'https://server11.mp3quran.net/shatri/',
    origin: 'المملكة العربية السعودية'
  },
  {
    id: 'nufais',
    name: 'أحمد النفيس',
    subname: 'إمام المسجد الكبير بالكويت وصاحب الصوت العذب',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server16.mp3quran.net/nufais/Rewayat-Hafs-A-n-Assem/',
    origin: 'دولة الكويت'
  },
  {
    id: 'jleel',
    name: 'خالد الجليل',
    subname: 'إمام وخطيب جامع الملك خالد بالرياض',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server10.mp3quran.net/jleel/',
    origin: 'المملكة العربية السعودية'
  },
  {
    id: 'mansor',
    name: 'منصور السالمي',
    subname: 'الداعية والقارئ السعودي وصاحب التلاوات الخاشعة',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://server14.mp3quran.net/mansor/',
    origin: 'المملكة العربية السعودية'
  },
  {
    id: 'mohamed_obada',
    name: 'محمد عباده (محمد عبادة)',
    subname: 'القارئ المصري صاحب الصوت الندي والتلاوات الخاشعة المؤثرة (المصحف المرتل كاملاً 114 سورة)',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    isFullSurahOnly: true,
    mp3quranServer: 'https://ia801403.us.archive.org/24/items/mohammed-abada/',
    origin: 'جمهورية مصر العربية'
  }
];

export const RECITER_CATEGORIES: { id: Reciter['category']; title: string; desc: string }[] = [
  { id: 'haram_makkah', title: 'أئمة وقراء الحرم المكي', desc: 'أصوات بيت الله الحرام الشريف' },
  { id: 'haram_madinah', title: 'أئمة وقراء المسجد النبوي', desc: 'أصوات مسجد رسول الله ﷺ بالمدينة المنورة' },
  { id: 'egypt_masters', title: 'قراء مصر والعالم الإسلامي', desc: 'رواد التلاوة والرعيل الأول الخالد' },
  { id: 'riwayah_masters', title: 'قراء الروايات القرآنية', desc: 'ورش، قالون، الدوري، السوسي، شعبة، وخلف عن حمزة' },
  { id: 'renowned', title: 'مشاهير قراء العالم الإسلامي', desc: 'أعذب الأصوات القرآنية في العالم الإسلامي' },
];

/**
 * Builds the authentic Ayah audio URL for EveryAyah CDN (verse-by-verse playback)
 */
export function getAyahAudioUrl(reciterFolder: string, surahNum: number, ayahNum: number): string {
  if (!reciterFolder) {
    return '';
  }
  const sStr = String(surahNum).padStart(3, '0');
  const aStr = String(ayahNum).padStart(3, '0');
  return `https://everyayah.com/data/${reciterFolder}/${sStr}${aStr}.mp3`;
}

/**
 * Builds the full Surah mp3 URL from mp3quran or archive server
 */
export function getSurahAudioUrl(mp3ServerUrl: string, surahNum: number): string {
  const sStr = String(surahNum).padStart(3, '0');
  const server = mp3ServerUrl.endsWith('/') ? mp3ServerUrl : `${mp3ServerUrl}/`;
  return `${server}${sStr}.mp3`;
}

/**
 * Returns a list of candidate mirror URLs for a full surah stream to guarantee instant playback & zero failure
 */
export function getSurahAudioUrlsWithFallbacks(reciter: Reciter, surahNum: number): string[] {
  const urls: string[] = [];
  const sStr = String(surahNum).padStart(3, '0');

  if (reciter.mp3quranServer) {
    urls.push(getSurahAudioUrl(reciter.mp3quranServer, surahNum));
    
    // Archive.org mirror redundancy
    if (reciter.mp3quranServer.includes('archive.org')) {
      if (reciter.id === 'mohamed_obada') {
        urls.push(`https://ia601403.us.archive.org/24/items/mohammed-abada/${sStr}.mp3`);
        urls.push(`https://archive.org/download/mohammed-abada/${sStr}.mp3`);
      }
    }
  }

  // If everyAyahFolder exists, fallback to first verse or ayah URL
  if (reciter.everyAyahFolder) {
    urls.push(getAyahAudioUrl(reciter.everyAyahFolder, surahNum, 1));
  }

  return urls;
}

