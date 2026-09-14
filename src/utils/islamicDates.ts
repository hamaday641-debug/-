/**
 * Helper to compute and format Hijri (Islamic) dates in Arabic
 */

const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة'
];

const ARABIC_DAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

export interface HijriDateObject {
  fullArabic: string;
  dayName: string;
  toString(): string;
}

/**
 * Returns formatted Hijri date in Arabic, e.g. "الجمعة ١٥ رمضان ١٤٤٧ هـ"
 * Returns an object with fullArabic property and toString() compatibility
 */
export function getHijriDateArabic(date: Date = new Date()): HijriDateObject {
  let fullArabic = '';
  const dayName = ARABIC_DAYS[date.getDay()];

  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    fullArabic = formatter.format(date);
  } catch {
    try {
      const altFormatter = new Intl.DateTimeFormat('ar-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      fullArabic = `${dayName}، ${altFormatter.format(date)} هـ`;
    } catch {
      fullArabic = `${dayName}، ١٤٤٧ هـ`;
    }
  }

  return {
    fullArabic,
    dayName,
    toString: () => fullArabic
  };
}

/**
 * Returns short Hijri date, e.g. "١٥ رمضان"
 */
export function getShortHijriDate(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long'
    });
    return formatter.format(date);
  } catch {
    return 'رمضان المبارك';
  }
}
