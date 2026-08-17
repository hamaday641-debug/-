import { Reciter } from '../types';

export const RECITERS_LIST: Reciter[] = [
  // --- أئمة وقراء الحرم المكي الشريف ---
  {
    id: 'sudais',
    name: 'عبدالرحمن السديس',
    subname: 'إمام وخطيب المسجد الحرام ورئيس الشؤون الدينية',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Abdurrahmaan_As-Sudais_192kbps',
    mp3quranServer: 'https://server11.mp3quran.net/sds/'
  },
  {
    id: 'shuraim',
    name: 'سعود الشريم',
    subname: 'إمام وخطيب المسجد الحرام (سابقاً)',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Saood_ash-Shuraym_128kbps',
    mp3quranServer: 'https://server7.mp3quran.net/shur/'
  },
  {
    id: 'muaiqly',
    name: 'ماهر المعيقلي',
    subname: 'إمام وخطيب المسجد الحرام',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'MaherAlMuaiqly128kbps',
    mp3quranServer: 'https://server12.mp3quran.net/maher/'
  },
  {
    id: 'dossari',
    name: 'ياسر الدوسري',
    subname: 'إمام وخطيب المسجد الحرام',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Yasser_Ad-Dussary_128kbps',
    mp3quranServer: 'https://server11.mp3quran.net/yasser/'
  },
  {
    id: 'juhany',
    name: 'عبدالله عواد الجهني',
    subname: 'إمام المسجد الحرام',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps',
    mp3quranServer: 'https://server13.mp3quran.net/jhn/'
  },
  {
    id: 'ali_jaber',
    name: 'علي عبدالله جابر',
    subname: 'إمام المسجد الحرام (رحمه الله)',
    category: 'haram_makkah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ali_Jaber_64kbps',
    mp3quranServer: 'https://server11.mp3quran.net/a_jbr/'
  },

  // --- أئمة وقراء المسجد النبوي الشريف ---
  {
    id: 'hudhaify',
    name: 'علي بن عبدالرحمن الحذيفي',
    subname: 'إمام وخطيب المسجد النبوي الشريف وشيخ عموم مقارئ المدينة',
    category: 'haram_madinah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Hudhaify_128kbps',
    mp3quranServer: 'https://server9.mp3quran.net/hthfi/'
  },
  {
    id: 'budair',
    name: 'صلاح البدير',
    subname: 'إمام وخطيب المسجد النبوي الشريف',
    category: 'haram_madinah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Salah_Al_Budair_128kbps',
    mp3quranServer: 'https://server6.mp3quran.net/s_bud/'
  },
  {
    id: 'qasim',
    name: 'عبدالمحسن القاسم',
    subname: 'إمام وخطيب المسجد النبوي الشريف',
    category: 'haram_madinah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Muhsin_Al_Qasim_192kbps',
    mp3quranServer: 'https://server8.mp3quran.net/qasm/'
  },
  {
    id: 'ayyoub',
    name: 'محمد أيوب',
    subname: 'إمام المسجد النبوي الشريف (رحمه الله)',
    category: 'haram_madinah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Muhammad_Ayyoub_128kbps',
    mp3quranServer: 'https://server8.mp3quran.net/ayyub/'
  },
  {
    id: 'akhdar',
    name: 'إبراهيم الأخضر',
    subname: 'شيخ قراء المدينة المنورة وإمام المسجد النبوي سابقاً',
    category: 'haram_madinah',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ibrahim_Akhdar_32kbps',
    mp3quranServer: 'https://server6.mp3quran.net/akdr/'
  },

  // --- كبار القراء والمشايخ المصريين (الرعيل الأول وأساطين التلاوة) ---
  {
    id: 'minshawi_murattal',
    name: 'محمد صديق المنشاوي (مرتل)',
    subname: 'صوت البكاء الخاشع ومن أساطين دولة التلاوة',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Minshawy_Murattal_128kbps',
    mp3quranServer: 'https://server10.mp3quran.net/minsh/'
  },
  {
    id: 'minshawi_mujawwad',
    name: 'محمد صديق المنشاوي (مجود)',
    subname: 'التلاوة التجويدية الخاشعة الخالدة',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مجود',
    everyAyahFolder: 'Minshawy_Mujawwad_192kbps',
    mp3quranServer: 'https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/'
  },
  {
    id: 'minshawi_teacher',
    name: 'محمد صديق المنشاوي (المصحف المعلم)',
    subname: 'ترديد لتعليم وتصحيح التلاوة مع الأطفال',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'معلم',
    everyAyahFolder: 'Minshawy_Teacher_128kbps',
    mp3quranServer: 'https://server10.mp3quran.net/minsh/Almusshaf-Al-Moalim/'
  },
  {
    id: 'husary_murattal',
    name: 'محمود خليل الحصري (مرتل)',
    subname: 'شيخ المقارئ المصرية وأول من سجل المصحف المرتل',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Husary_128kbps',
    mp3quranServer: 'https://server13.mp3quran.net/husr/'
  },
  {
    id: 'husary_mujawwad',
    name: 'محمود خليل الحصري (مجود)',
    subname: 'أتقن تلاوة تجويدية ومخارج حروف في العصر الحديث',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مجود',
    everyAyahFolder: 'Husary_128kbps_Mujawwad',
    mp3quranServer: 'https://server13.mp3quran.net/husr/Almusshaf-Al-Mojawwad/'
  },
  {
    id: 'husary_muallim',
    name: 'محمود خليل الحصري (المصحف المعلم)',
    subname: 'ترديد لتعليم وتصحيح التلاوة وأحكام التجويد',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'معلم',
    everyAyahFolder: 'Husary_Muallim_128kbps',
    mp3quranServer: 'https://server13.mp3quran.net/husr/Almusshaf-Al-Moalim/'
  },
  {
    id: 'abdulbasit_murattal',
    name: 'عبدالباسط عبدالصمد (مرتل)',
    subname: 'صوت مكة الخالد وسفير القرآن الكريم في العالم',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Abdul_Basit_Murattal_192kbps',
    mp3quranServer: 'https://server7.mp3quran.net/basit/'
  },
  {
    id: 'abdulbasit_mujawwad',
    name: 'عبدالباسط عبدالصمد (مجود)',
    subname: 'روائع التجويد الفريدة والحنجرة الذهبية',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مجود',
    everyAyahFolder: 'Abdul_Basit_Mujawwad_128kbps',
    mp3quranServer: 'https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/'
  },
  {
    id: 'mustafa_ismail',
    name: 'مصطفى إسماعيل',
    subname: 'عبقري التلاوة ومقرئ الجامع الأزهر الشريف',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مجود',
    everyAyahFolder: 'Mustafa_Ismail_48kbps',
    mp3quranServer: 'https://server8.mp3quran.net/mustafa/'
  },
  {
    id: 'banna',
    name: 'محمود علي البنا',
    subname: 'مقرئ مسجد الإمام الحسين والجامع الأزهر',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'mahmoud_ali_al_banna_32kbps',
    mp3quranServer: 'https://server8.mp3quran.net/bna/'
  },
  {
    id: 'tablawi',
    name: 'محمد محمود الطبلاوي',
    subname: 'نقيب قراء مصر وصاحب النبرة القوية الشجية',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Mohammad_al_Tablaway_128kbps',
    mp3quranServer: 'https://server12.mp3quran.net/tblawi/'
  },
  {
    id: 'naina',
    name: 'أحمد نعينع',
    subname: 'طبيب القلوب وقارئ المناسبات الرسمية الكبرى',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ahmed_Neana_128kbps',
    mp3quranServer: 'https://server11.mp3quran.net/naina/'
  },
  {
    id: 'suesy',
    name: 'علي حجاج السويسي',
    subname: 'قارئ الإذاعة والتلفزيون وصاحب التلاوات الخاشعة',
    category: 'egypt_masters',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ali_Hajjaj_AlSuesy_128kbps',
    mp3quranServer: 'https://server11.mp3quran.net/suesy/'
  },

  // --- كبار القراء المشاهير في العالم الإسلامي ---
  {
    id: 'alafasy',
    name: 'مشاري بن راشد العفاسي',
    subname: 'إمام المسجد الكبير بدولة الكويت',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Alafasy_128kbps',
    mp3quranServer: 'https://server8.mp3quran.net/afs/'
  },
  {
    id: 'ghamadi',
    name: 'سعد الغامدي',
    subname: 'إمام جامع كانو وإمام الحرم النبوي الشريف (سابقاً)',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ghamadi_40kbps',
    mp3quranServer: 'https://server7.mp3quran.net/s_gmd/'
  },
  {
    id: 'abbad',
    name: 'فارس عباد',
    subname: 'القارئ الشهير ذو الصوت الشجي الخاشع',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Fares_Abbad_64kbps',
    mp3quranServer: 'https://server8.mp3quran.net/frs_a/'
  },
  {
    id: 'ajmy',
    name: 'أحمد بن علي العجمي',
    subname: 'القارئ السعودي الشهير وصاحب التلاوات المؤثرة',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
    mp3quranServer: 'https://server10.mp3quran.net/ajm/'
  },
  {
    id: 'qatami',
    name: 'ناصر القطامي',
    subname: 'إمام وخطيب جامع الأميرة لطيفة بالرياض',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Nasser_Alqatami_128kbps',
    mp3quranServer: 'https://server6.mp3quran.net/qtm/'
  },
  {
    id: 'shaatree',
    name: 'أبو بكر الشاطري',
    subname: 'القارئ والداعية السعودي الشهير',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Abu_Bakr_Ash-Shaatree_128kbps',
    mp3quranServer: 'https://server11.mp3quran.net/shatri/'
  },
  {
    id: 'hani_rifai',
    name: 'هاني الرفاعي',
    subname: 'إمام جامع العناني بجدة',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Hani_Rifai_192kbps',
    mp3quranServer: 'https://server8.mp3quran.net/rifai/'
  },
  {
    id: 'nabil_rifai',
    name: 'نبيل الرفاعي',
    subname: 'إمام مسجد التقوى بجدة',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Nabil_Rifa3i_48kbps',
    mp3quranServer: 'https://server8.mp3quran.net/nabil/'
  },
  {
    id: 'jibreel',
    name: 'محمد جبريل',
    subname: 'مقرئ مسجد عمرو بن العاص الشهير بالقاهرة',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Muhammad_Jibreel_128kbps',
    mp3quranServer: 'https://server8.mp3quran.net/jbrl/'
  },
  {
    id: 'basfar',
    name: 'عبدالله بصفر',
    subname: 'أمين عام الهيئة العالمية لتحفيظ القرآن الكريم سابقاً',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Abdullah_Basfar_192kbps',
    mp3quranServer: 'https://server6.mp3quran.net/bsfr/'
  },
  {
    id: 'matroud',
    name: 'عبدالله مطرود',
    subname: 'القارئ السعودي صاحب الصوت العذب والترتيل المتقن',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Abdullah_Matroud_128kbps',
    mp3quranServer: 'https://server8.mp3quran.net/mtrod/'
  },
  {
    id: 'qahtani',
    name: 'خالد القحطاني',
    subname: 'إمام جامع عبدالرزاق قنبر بالدمام',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Khaalid_Abdullaah_al-Qahtaanee_192kbps',
    mp3quranServer: 'https://server10.mp3quran.net/qht/'
  },
  {
    id: 'bukhatir',
    name: 'صلاح بوخاطر',
    subname: 'القارئ الإماراتي ذو الصوت الشجي المشابه للحرم المكي',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Salaah_AbdulRahman_Bukhatir_128kbps',
    mp3quranServer: 'https://server8.mp3quran.net/bu_khtr/'
  },
  {
    id: 'sahl_yassin',
    name: 'سهل ياسين',
    subname: 'إمام وخطيب جامع الأمير سلطان بجدة',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Sahl_Yassin_128kbps',
    mp3quranServer: 'https://server6.mp3quran.net/shl/'
  },
  {
    id: 'tunaiji',
    name: 'خليفة الطنيجي',
    subname: 'القارئ الإماراتي وعضو لجنة تحكيم مسابقات القرآن الدولية',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'khalefa_al_tunaiji_64kbps',
    mp3quranServer: 'https://server12.mp3quran.net/tnjy/'
  },
  {
    id: 'abdulkareem',
    name: 'محمد عبدالكريم',
    subname: 'القارئ السوداني برواية الدوري عن أبي عمرو',
    category: 'renowned',
    riwayah: 'الدوري عن أبي عمرو',
    style: 'مرتل',
    everyAyahFolder: 'Muhammad_AbdulKareem_128kbps',
    mp3quranServer: 'https://server12.mp3quran.net/m_krm/'
  },
  {
    id: 'salamah',
    name: 'ياسر سلامة',
    subname: 'مقرئ مصري وإمام مسجد السلام بالقاهرة',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Yaser_Salamah_128kbps',
    mp3quranServer: 'https://server11.mp3quran.net/salamah/'
  },
  {
    id: 'sowaid',
    name: 'أيمن سويد',
    subname: 'عالم القراءات والتجويد المعروف ومقدم البرامج التعليمية',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Ayman_Sowaid_64kbps',
    mp3quranServer: 'https://server10.mp3quran.net/swaid/'
  },
  {
    id: 'alaqimy',
    name: 'أكرم العلاقمي',
    subname: 'القارئ الأردني وإمام مسجد الهاشمي الشمالي بعمان',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'Akram_AlAlaqimy_128kbps',
    mp3quranServer: 'https://server9.mp3quran.net/akrm/'
  },
  {
    id: 'mansoori',
    name: 'كريم منصوري',
    subname: 'القارئ الدولي وصاحب المقامات القرآنية المحكمة',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مجود',
    everyAyahFolder: 'Karim_Mansoori_40kbps',
    mp3quranServer: 'https://server11.mp3quran.net/mansor/'
  },
  {
    id: 'alili',
    name: 'عزيز عليلي',
    subname: 'القارئ البوسني وإمام وخطيب المركز الإسلامي في زغرب',
    category: 'renowned',
    riwayah: 'حفص عن عاصم',
    style: 'مرتل',
    everyAyahFolder: 'aziz_alili_128kbps',
    mp3quranServer: 'https://server11.mp3quran.net/alili/'
  }
];

export const RECITER_CATEGORIES: { id: Reciter['category']; title: string; desc: string }[] = [
  { id: 'haram_makkah', title: 'أئمة وقراء الحرم المكي', desc: 'أصوات بيت الله الحرام الشريف' },
  { id: 'haram_madinah', title: 'أئمة وقراء المسجد النبوي', desc: 'أصوات مسجد رسول الله ﷺ بالمدينة المنورة' },
  { id: 'egypt_masters', title: 'كبار القراء والمشايخ المصريين', desc: 'أساطين التلاوة والتجويد والرعيل الأول الخالد' },
  { id: 'renowned', title: 'كبار القراء المشهورين', desc: 'مشاهير القراء في العالم الإسلامي' },
];

/**
 * Builds the authentic Ayah audio URL for EveryAyah CDN (verse-by-verse playback)
 */
export function getAyahAudioUrl(reciterFolder: string, surahNum: number, ayahNum: number): string {
  const sStr = String(surahNum).padStart(3, '0');
  const aStr = String(ayahNum).padStart(3, '0');
  return `https://everyayah.com/data/${reciterFolder}/${sStr}${aStr}.mp3`;
}

/**
 * Builds the full Surah mp3 URL from mp3quran server
 */
export function getSurahAudioUrl(mp3ServerUrl: string, surahNum: number): string {
  const sStr = String(surahNum).padStart(3, '0');
  const server = mp3ServerUrl.endsWith('/') ? mp3ServerUrl : `${mp3ServerUrl}/`;
  return `${server}${sStr}.mp3`;
}
