// Types for comprehensive authentic Prophet stories
export interface ProphetStoryChapter {
  title: string;
  subtitle?: string;
  quranVerse?: string;
  quranVerseRef?: string; // Surah & Ayah reference e.g. "البقرة: ٣٠"
  sunnah?: string; // Prophetic Sunnah / Hadith connection
  content: string;
}

export interface ProphetData {
  id: string;
  name: string;
  fullName: string;
  title: string; // e.g. أبو البشر، خليل الله، كليم الله، خاتم النبيين
  era: string; // e.g. بداية الخلق، حوالي 3000 ق.م
  place: string; // e.g. مكة المكرمة، الشام، مصر، العراق، الأحقاف
  people: string; // e.g. بنو إسرائيل، عاد، ثمود، قريش، البشرية جمعاء
  mentionsInQuran: number; // Number of times mentioned in the Quran
  quranSurahs: string[]; // Key Surahs mentioning the prophet
  summary: string;
  miracles: string[];
  quranicDua: {
    text: string;
    surah: string;
    ayahNumber: number;
    explanation: string;
  };
  chapters: ProphetStoryChapter[];
  lessons: string[];
}
