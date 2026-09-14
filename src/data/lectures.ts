import { ScholarItem, LectureItem } from '../types';

export const SCHOLARS_LIST: ScholarItem[] = [
  {
    id: 'shaarawi',
    name: 'الشيخ محمد متولي الشعراوي',
    title: 'إمام الدعاة ومفسر العصر',
    country: 'مصر 🇪🇬',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    bio: 'أحد أشهر وأبرز مفسري القرآن الكريم في العصر الحديث، اشتهر بأسلوبه البسيط والعميق الذي يصل لقلوب وعقول جميع المسلمين.',
    specialty: 'تفسير القرآن الكريم والخواطر الإيمانية'
  },
  {
    id: 'kishk',
    name: 'الشيخ عبد الحميد كشك',
    title: 'فارس المنابر ومحامي الإسلام',
    country: 'مصر 🇪🇬',
    image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=400&q=80',
    bio: 'خطيب ومفكر إسلامي مصري، عُرف بفصاحته وقوة خطبه وبلاغته المؤثرة في الوعظ والتذكير بالآخرة والتوبة.',
    specialty: 'الخطب والمواعظ والرقائق'
  },
  {
    id: 'othman_alkhamees',
    name: 'الشيخ د. عثمان الخميس',
    title: 'عالم وفقيه ومحدث معاصر',
    country: 'الكويت 🇰🇼',
    image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=400&q=80',
    bio: 'أستاذ الفقه والحديث والعلوم الشرعية، يتميز بالبيان العلمي الدقيق والردود الشرعية المؤصلة وشرح السيرة النبوية.',
    specialty: 'الفقه المقارن والسيرة والعقيدة'
  },
  {
    id: 'nabulsi',
    name: 'الشيخ د. محمد راتب النابلسي',
    title: 'عالم ومربي وداعية إسلامي',
    country: 'سوريا 🇸🇾',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
    bio: 'عالم إسلامي معاصر عُرف بشرحه البديع لأسماء الله الحسنى والإعجاز العلمي والتربية الإيمانية وبناء الأسرة المسلمة.',
    specialty: 'أسماء الله الحسنى وتزكية النفس'
  },
  {
    id: 'omar_abdelkafy',
    name: 'الدكتور عمر عبد الكافي',
    title: 'داعية ومفكر وباحث إسلامي',
    country: 'مصر 🇪🇬',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    bio: 'صاحب سلاسل الوعد الحق وصفوة الصفوة والدار الآخرة، يتميز بأسلوبه القصصي الرائع والتحفيز على العمل الصالح.',
    specialty: 'قصص الأنبياء والدار الآخرة والتربية'
  },
  {
    id: 'othaimin',
    name: 'الشيخ محمد بن صالح العثيمين',
    title: 'فقيه الأمة وأحد كبار العلماء',
    country: 'السعودية 🇸🇦',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    bio: 'عضو هيئة كبار العلماء وأستاذ الشريعة، اشتُهر بالدقة الفقهية وشرح المتون وتيسير الفقه لعامة الناس وطلاب العلم.',
    specialty: 'الفقه وأصوله وتفسير القرآن'
  },
  {
    id: 'bin_baz',
    name: 'الشيخ عبد العزيز بن باز',
    title: 'سماحة المفتي العام وإمام العصر',
    country: 'السعودية 🇸🇦',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=400&q=80',
    bio: 'مفتي عام المملكة العربية السعودية الأسبق، عالم جليل كرس حياته لخدمة السنة النبوية والدعوة إلى التوحيد الخالص.',
    specialty: 'العقيدة والفتاوى الشرعية والحديث'
  },
  {
    id: 'meshari_kharaz',
    name: 'الشيخ مشاري الخراز',
    title: 'داعية ومؤلف برنامج كيف تتلذذ بصلاتك',
    country: 'الكويت 🇰🇼',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'اشتهر بسلسلته الشهيرة في الخشوع في الصلاة والتعامل مع الله والتأمل في عظمة الخالق بأرق وأجمل أسلوب.',
    specialty: 'فقه الخشوع والتعامل مع الله'
  },
  {
    id: 'ragheb_sergani',
    name: 'د. راغب السرجاني',
    title: 'مؤرخ وباحث ومفكر إسلامي',
    country: 'مصر 🇪🇬',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    bio: 'المشرف على موقع قصة الإسلام، متخصص في التاريخ الإسلامي وسيرة الخلفاء وقصة الأندلس وبطولات الصحابة.',
    specialty: 'التاريخ الإسلامي والسيرة والفتوحات'
  },
  {
    id: 'hazem_shouman',
    name: 'الشيخ د. حازم شومان',
    title: 'داعية وموجه للشباب',
    country: 'مصر 🇪🇬',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    bio: 'طبيب وداعية إسلامي، رائد في مخاطبة الشباب وتحفيزهم على التوبة وترك المعاصي وتحديد الهدف في الحياة.',
    specialty: 'دعوة الشباب والتوبة وتحفيز الهمم'
  }
];

export const LECTURES_LIST: LectureItem[] = [
  // 1. الشيخ الشعراوي
  {
    id: 'shaarawi-tafsir-fatiha',
    title: 'خواطر وتفسير سورة الفاتحة وأسرارها العظيمة',
    scholarId: 'shaarawi',
    scholarName: 'الشيخ محمد متولي الشعراوي',
    category: 'tafsir',
    categoryLabel: 'تفسير القرآن',
    youtubeId: 'pcHAyfyBsOU',
    duration: '42 دقيقة',
    seriesTitle: 'تفسير خواطر الشعراوي',
    seriesEpisode: 1,
    description: 'شرح فريد وعميق لأسرار وفضائل أم الكتاب سورة الفاتحة، ومعاني أسماء الله الحسنى في مطلع السورة وكيف تناجي بها ربك.',
    keyPoints: [
      'سر افتتاح القرآن بالحمد لله رب العالمين',
      'الفرق بين الرحمن والرحيم في الدلالة والبلاغة',
      'معنى إياك نعبد وإياك نستعين وتوحيد العبادة والاستعانة',
      'حقيقة الصراط المستقيم وسبل الثبات عليه'
    ],
    viewsCount: '6.3M',
    featured: true,
    publishedYear: '1985'
  },
  {
    id: 'shaarawi-rizq-qadar',
    title: 'حقيقة الرزق والقضاء والقدر وراحة البال',
    scholarId: 'shaarawi',
    scholarName: 'الشيخ محمد متولي الشعراوي',
    category: 'raqaiq',
    categoryLabel: 'الرقائق وتزكية النفس',
    youtubeId: 'bsg8eduPnRY',
    duration: '35 دقيقة',
    seriesTitle: 'روائع الخواطر الإيمانية',
    description: 'درس مريح للقلب يشرح فيه الشيخ الشعراوي الفرق بين الرزق والأجل، ولماذا لا ينبغي للمؤمن أن يقلق على رزق الغد مادام يسعى ويتوكل.',
    keyPoints: [
      'الرزق نوعان: رزق يطلبك ورزق تطلبه',
      'الأخذ بالأسباب مع تمام التوكل على مسبب الأسباب',
      'حكمة الله في توزيع الأرزاق بالعدل والحكمة'
    ],
    viewsCount: '5.1M',
    featured: true,
    publishedYear: '1990'
  },
  {
    id: 'shaarawi-sabr-faraj',
    title: 'كيف تتعامل مع البلاء وأسرار الصبر والفرج القريب',
    scholarId: 'shaarawi',
    scholarName: 'الشيخ محمد متولي الشعراوي',
    category: 'raqaiq',
    categoryLabel: 'الرقائق وتزكية النفس',
    youtubeId: 'QvT9seCYUFI',
    duration: '28 دقيقة',
    seriesTitle: 'روائع الخواطر الإيمانية',
    description: 'درر وبيان حول حقيقة الابتلاء وأنه علامة حب من الله لتمحيص العبد ورفع درجاته في الجنة وبشائر الفرج بعد الشدة.',
    keyPoints: [
      'إن مع العسر يسراً: حتمية الفرج بعد الصبر',
      'مراتب الصبر عند نزول المصائب',
      'دعاء الكرب وتفريج الهموم'
    ],
    viewsCount: '2.8M',
    publishedYear: '1992'
  },

  // 2. الشيخ عبد الحميد كشك
  {
    id: 'kishk-mawt-aakhirah',
    title: 'خطبة مؤثرة جداً: حقيقة الموت وسكراته والدار الآخرة',
    scholarId: 'kishk',
    scholarName: 'الشيخ عبد الحميد كشك',
    category: 'raqaiq',
    categoryLabel: 'الرقائق وتزكية النفس',
    youtubeId: '94iJbwHBLOo',
    duration: '48 دقيقة',
    description: 'خطبة مبكية تهز القلوب للشيخ كشك يذكر فيها بلقاء الله تعالى وساعة الرحيل وفضل الاستعداد للجنة بالعمل الصالح والتوبة.',
    keyPoints: [
      'عبر ومواعظ من سكرات الموت',
      'نعيم القبر وعذابه وفتنة الملكين',
      'دعوة صادقة للتوبة قبل فوات الأوان'
    ],
    viewsCount: '4.2M',
    featured: true,
    publishedYear: '1984'
  },
  {
    id: 'kishk-birr-walidayn',
    title: 'بر الوالدين وأثره العظيم في تفريج الكربات ودخول الجنة',
    scholarId: 'kishk',
    scholarName: 'الشيخ عبد الحميد كشك',
    category: 'family',
    categoryLabel: 'الأسرة والمجتمع',
    youtubeId: 'mrU3980VRnw',
    duration: '38 دقيقة',
    description: 'خطبة جامعة في حقوق الأب والأم وفضل الإحسان إليهما في حياتهما وبعد مماتهما والتحذير الشديد من العقوق.',
    keyPoints: [
      'وقضى ربك ألا تعبدوا إلا إياه وبالوالدين إحسانا',
      'قصص مؤثرة في بر الصحابة والسلف بأمهاتهم',
      'كيف تبر والديك بعد وفاتهما بالصدقة والدعاء'
    ],
    viewsCount: '1.9M',
    publishedYear: '1988'
  },

  // 3. الشيخ عثمان الخميس
  {
    id: 'khamis-seerah-prophet',
    title: 'مختصر السيرة النبوية العطرة من المولد حتى الوفاة',
    scholarId: 'othman_alkhamees',
    scholarName: 'الشيخ د. عثمان الخميس',
    category: 'seerah',
    categoryLabel: 'السيرة النبوية',
    youtubeId: 'BUn1-eUCrWg',
    duration: '55 دقيقة',
    seriesTitle: 'سلسلة السيرة النبوية',
    seriesEpisode: 1,
    description: 'عرض ماتع وشامل وموثق لسيرة خير البرية محمد ﷺ، نشأته وبعثته وهجرته وغزواته وحسن خلقه وشريعته الخاتمة.',
    keyPoints: [
      'نسب النبي ﷺ وطفولته الشريفة ورعاية جده وعمه',
      'نزول الوحي في غار حراء والدعوة السرية والجهرية',
      'الهجرة المباركة وبناء دولة الإسلام في المدينة المنورة',
      'حجة الوداع ووصايا النبي ﷺ الأخيرة'
    ],
    viewsCount: '2.5M',
    featured: true,
    publishedYear: '2021'
  },
  {
    id: 'khamis-salah-description',
    title: 'صفة صلاة النبي ﷺ خطوة بخطوة بالدليل الشرعي الصحيح',
    scholarId: 'othman_alkhamees',
    scholarName: 'الشيخ د. عثمان الخميس',
    category: 'fiqh',
    categoryLabel: 'الفقه والأحكام',
    youtubeId: 'sU4JIFbPhDI',
    duration: '40 دقيقة',
    description: 'شرح عملي تطبيقي ومفصل لكيفية أداء الصلاة الصحيحة كما صلاها النبي ﷺ من تكبيرة الإحرام حتى التسليم مع بيان السنن والمكروهات.',
    keyPoints: [
      'شروط وأركان وواجبات الصلاة',
      'كيفية الركوع والرفع منه والاعتدال والطمأنينة',
      'السجود على الأعضاء السبعة والتشهد الأخير',
      'الأخطاء الشائعة في الصلاة وكيفية تجنبها'
    ],
    viewsCount: '6.7M',
    featured: true,
    publishedYear: '2020'
  },
  {
    id: 'khamis-wudu-ghusl',
    title: 'شرح أحكام الوضوء والطهارة والغسل الصحيح',
    scholarId: 'othman_alkhamees',
    scholarName: 'الشيخ د. عثمان الخميس',
    category: 'fiqh',
    categoryLabel: 'الفقه والأحكام',
    youtubeId: 'jj8DbMqQTgY',
    duration: '32 دقيقة',
    description: 'دورة فقهية ميسرة في فرائض وسنن الوضوء ونواقضه ومسح الخفين والجبيرة والغسل الأكبر.',
    keyPoints: [
      'فرائض الوضوء الستة والسنن المستحبة',
      'نواقض الوضوء المجمع عليها والمختلف فيها',
      'صفة الغسل الكامل والغسل المجزئ'
    ],
    viewsCount: '3.1M',
    publishedYear: '2022'
  },

  // 4. الشيخ راتب النابلسي
  {
    id: 'nabulsi-asma-allah-rahman',
    title: 'اسم الله الرحمن الرحيم واللطيف وأسرار رحمته بعباده',
    scholarId: 'nabulsi',
    scholarName: 'الشيخ د. محمد راتب النابلسي',
    category: 'aqeedah',
    categoryLabel: 'العقيدة والأسماء الحسنى',
    youtubeId: 'qzRnVfaZEmA',
    duration: '45 دقيقة',
    seriesTitle: 'موسوعة أسماء الله الحسنى',
    seriesEpisode: 1,
    description: 'تأملات روحانية وتربوية بديعة في معاني اسمي الله الرحمن الرحيم، وكيف تتجلى رحمة الله في كل تفاصيل الكون وحياة الإنسان.',
    keyPoints: [
      'الفرق بين الرحمة العامة لجميع الخلق والرحمة الخاصة بالمؤمنين',
      'كيف تلمس رحمة الله ولطفه في أقسى الابتلاءات',
      'التخلق بأخلاق الرحمة والعفو مع الخلق'
    ],
    viewsCount: '1.8M',
    featured: true,
    publishedYear: '2019'
  },
  {
    id: 'nabulsi-qalaq-hamm',
    title: 'علاج القلق والخوف والهم في ضوء القرآن والسنة',
    scholarId: 'nabulsi',
    scholarName: 'الشيخ د. محمد راتب النابلسي',
    category: 'raqaiq',
    categoryLabel: 'الرقائق وتزكية النفس',
    youtubeId: 'QNssVzekTnI',
    duration: '36 دقيقة',
    description: 'خطوات عملية إيمانية وسيكولوجية للتخلص من الخوف من المستقبل والقلق على الرزق وعيش حياة السكينة والطمأنينة.',
    keyPoints: [
      'أسباب القلق النفسي وغياب التوكل',
      'ألا بذكر الله تطمئن القلوب: قوة الأذكار والصلاة',
      'حسن الظن بالله وقانون الرضا'
    ],
    viewsCount: '3.9M',
    featured: true,
    publishedYear: '2021'
  },

  // 5. الدكتور عمر عبد الكافي
  {
    id: 'abdelkafy-waad-haqq-1',
    title: 'سلسلة الوعد الحق (1): رحلة الروح وخروج النفس والموت',
    scholarId: 'omar_abdelkafy',
    scholarName: 'الدكتور عمر عبد الكافي',
    category: 'raqaiq',
    categoryLabel: 'الرقائق وتزكية النفس',
    youtubeId: '1IHVc4KMUkQ',
    duration: '50 دقيقة',
    seriesTitle: 'سلسلة الوعد الحق',
    seriesEpisode: 1,
    description: 'الحلقة الأولى من السلسلة الخالدة (الوعد الحق) التي ترسم مسار النفس البشرية من لحظات الاحتضار حتى الاستقرار في دار البقاء.',
    keyPoints: [
      'علامات حضور الأجل والوصية الشرعية',
      'كيفية خروج روح المؤمن وروح الفاجر',
      'أول ليلة في القبر وعالم البرزخ'
    ],
    viewsCount: '5.8M',
    featured: true,
    publishedYear: '2004'
  },
  {
    id: 'abdelkafy-safwat-safwah',
    title: 'صفوة الصفوة: سيرة الصديق أبي بكر رضي الله عنه وأعظم مواقفه',
    scholarId: 'omar_abdelkafy',
    scholarName: 'الدكتور عمر عبد الكافي',
    category: 'seerah',
    categoryLabel: 'السيرة النبوية',
    youtubeId: '4PhRmzzbdNU',
    duration: '44 دقيقة',
    seriesTitle: 'صفوة الصفوة',
    seriesEpisode: 1,
    description: 'محاضرة ثرية عن مناقب ومواقف أول الخلفاء الراشدين ورفيق درب النبي ﷺ في الغار والهجرة وثباته يوم وفاة النبي وحروب الردة.',
    keyPoints: [
      'إسلام الصديق وبذل كل ماله في سبيل الله',
      'موقف أبي بكر في حادثة الإسراء والمعراج',
      'خلافة أبي بكر وجهاده لجمع القرآن'
    ],
    viewsCount: '1.6M',
    publishedYear: '2016'
  },

  // 6. الشيخ مشاري الخراز
  {
    id: 'kharaz-ladhdhat-salah-1',
    title: 'كيف تتلذذ بصلاتك (الحلقة الأولى): سر الخشوع وحب الوقوف بين يدي الله',
    scholarId: 'meshari_kharaz',
    scholarName: 'الشيخ مشاري الخراز',
    category: 'raqaiq',
    categoryLabel: 'الرقائق وتزكية النفس',
    youtubeId: '5IK8LpEHhbc',
    duration: '26 دقيقة',
    seriesTitle: 'كيف تتلذذ بصلاتك',
    seriesEpisode: 1,
    description: 'البرنامج الأكثر تأثيراً في تحويل الصلاة من مجرد حركات تؤدى إلى أعظم راحة ولذة يذوقها القلب في يومه وليله.',
    keyPoints: [
      'أرحنا بها يا بلال: كيف تصبح الصلاة راحة لا عبئاً',
      'استحضار عظمة من تقف بين يديه سبحانه',
      'التدبر في كل كلمة وكل ركوع وسجود'
    ],
    viewsCount: '7.2M',
    featured: true,
    publishedYear: '2011'
  },
  {
    id: 'kharaz-taamul-maa-allah',
    title: 'كيف تتعامل مع الله إذا وقعت في ذنب أو ابتلاء',
    scholarId: 'meshari_kharaz',
    scholarName: 'الشيخ مشاري الخراز',
    category: 'raqaiq',
    categoryLabel: 'الرقائق وتزكية النفس',
    youtubeId: 'qSGbpTcNjgk',
    duration: '30 دقيقة',
    seriesTitle: 'كيف تتعامل مع الله',
    description: 'إرشادات قلبية مخلصة لكيفية اللجوء إلى الله والاعتراف بالتقصير وفرح الله تعالى بتوبة عبده وإبدال السيئات حسنات.',
    keyPoints: [
      'فرح الله بتوبة العبد إذا رجع إليه',
      'شروط التوبة الصادقة ومسح آثار الذنوب',
      'استشعار كرم الله وفضله الواسع'
    ],
    viewsCount: '3.3M',
    publishedYear: '2015'
  },

  // 7. الشيخ ابن عثيمين
  {
    id: 'othaimin-tafsir-juz-amma',
    title: 'شرح وتفسير سورة النبأ وعظة يوم القيامة',
    scholarId: 'othaimin',
    scholarName: 'الشيخ محمد بن صالح العثيمين',
    category: 'tafsir',
    categoryLabel: 'تفسير القرآن',
    youtubeId: 'bIfUkOtZNcQ',
    duration: '38 دقيقة',
    seriesTitle: 'تفسير جزء عم',
    seriesEpisode: 1,
    description: 'تفسير ميسر ومؤصل لآيات سورة النبأ المباركة يستعرض فيها الشيخ ابن عثيمين أدلة البعث والنشور وجزاء المتقين.',
    keyPoints: [
      'عم يتساءلون: تساؤل المشركين عن البعث',
      'دلائل قدرة الله في خلق الأرض والجبال والأزواج',
      'يوم الفصل وميقات الحساب العظيم'
    ],
    viewsCount: '920K',
    publishedYear: '1995'
  },

  // 8. الدكتور راغب السرجاني
  {
    id: 'sergani-andalus-story',
    title: 'قصة الأندلس: من الفتح الإسلامي حتى قمة المجد الحضاري',
    scholarId: 'ragheb_sergani',
    scholarName: 'د. راغب السرجاني',
    category: 'seerah',
    categoryLabel: 'السيرة والتاريخ',
    youtubeId: '63rz5bGbBXA',
    duration: '52 دقيقة',
    seriesTitle: 'قصة الأندلس',
    seriesEpisode: 1,
    description: 'سرد تاريخي شيق وموثق لقصة فتح الأندلس على يد طارق بن زياد وموسى بن نصير وبناء أعظم حضارة إنسانية في أوروبا.',
    keyPoints: [
      'الأوضاع في شبه الجزيرة الأيبيرية قبل الفتح',
      'عبور طارق بن زياد ومعركة وادي لكة',
      'دروس وعبر من صعود الحضارة الإسلامية بالأندلس'
    ],
    viewsCount: '2.1M',
    publishedYear: '2013'
  },

  // 9. الشيخ حازم شومان
  {
    id: 'shouman-tobah-shabab',
    title: 'رسالة لكل شاب وفتاة: كيف تبدأ صفحة بيضاء جديدة مع الله الآن؟',
    scholarId: 'hazem_shouman',
    scholarName: 'الشيخ د. حازم شومان',
    category: 'shorts',
    categoryLabel: 'مقاطع مؤثرة وهادفة',
    youtubeId: 'Mt8XnH2Z1Mo',
    duration: '18 دقيقة',
    description: 'كلمات حماسية مؤثرة موجهة للشباب لتجديد النية وقطع حبال المعاصي والعودة الصادقة لرحاب الإيمان والتفوق.',
    keyPoints: [
      'لا تيأس من رحمة الله مهما بلغت ذنوبك',
      'خطوات عملية للتخلص من إدمان المعاصي',
      'كيف تختار الصحبة الصالحة المعينة على الطاعة'
    ],
    viewsCount: '4.5M',
    featured: true,
    publishedYear: '2023'
  },

  // 10. الشيخ ابن باز
  {
    id: 'binbaz-asbab-inshirah-sadr',
    title: 'أعظم أسباب انشراح الصدر وطمأنينة القلب والتوفيق في الحياة',
    scholarId: 'bin_baz',
    scholarName: 'الشيخ عبد العزيز بن باز',
    category: 'raqaiq',
    categoryLabel: 'الرقائق وتزكية النفس',
    youtubeId: 'xnc5LDKSt1k',
    duration: '25 دقيقة',
    description: 'نصيحة جامعة وموعظة ذهبية لسماحة الشيخ ابن باز رحمه الله يوضح فيها أسباب سعادة المسلم في الدنيا والآخرة.',
    keyPoints: [
      'التوحيد الخالص لله أعظم مفرج للكروب',
      'ملازمة الاستغفار وذكر الله في كل وقت',
      'الإحسان إلى الخلق بالقول والعمل والمال'
    ],
    viewsCount: '1.2M',
    publishedYear: '1996'
  }
];

export const LECTURE_CATEGORIES = [
  { id: 'all' as const, label: 'جميع المحاضرات', icon: 'Sparkles', desc: 'كل المحاضرات والدروس' },
  { id: 'tafsir' as const, label: 'تفسير القرآن', icon: 'BookOpen', desc: 'تفسير الآيات وتدبر معانيها' },
  { id: 'seerah' as const, label: 'السيرة والتاريخ', icon: 'Scroll', desc: 'سيرة النبي والفتوحات الإسلامية' },
  { id: 'fiqh' as const, label: 'الفقه والأحكام', icon: 'Scale', desc: 'أحكام الصلاة والطهارة والمعاملات' },
  { id: 'raqaiq' as const, label: 'الرقائق والتزكية', icon: 'Heart', desc: 'تهذيب النفس والخشوع والدار الآخرة' },
  { id: 'aqeedah' as const, label: 'العقيدة والأسماء الحسنى', icon: 'Sun', desc: 'معرفة الله وأسمائه وصفاته' },
  { id: 'family' as const, label: 'الأسرة والمجتمع', icon: 'Users', desc: 'بر الوالدين وتربية الأبناء' },
  { id: 'shorts' as const, label: 'مقاطع مؤثرة وقصيرة', icon: 'Flame', desc: 'دروس سريعة ورسائل هادفة' },
];
