import { TafsirBook } from '../types';

export const TAFSIR_BOOKS: TafsirBook[] = [
  {
    id: 'muyassar',
    name: 'التفسير الميسر',
    author: 'نخبة من العلماء - مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة',
    editionId: 'ar.muyassar'
  },
  {
    id: 'jalalayn',
    name: 'تفسير الجلالين',
    author: 'الإمام جلال الدين المحلي والإمام جلال الدين السيوطي',
    editionId: 'ar.jalalayn'
  },
  {
    id: 'saadi',
    name: 'تفسير السعدي (تيسير الكريم الرحمن)',
    author: 'الشيخ العلامة عبدالرحمن بن ناصر السعدي رحمه الله',
    editionId: 'ar.muyassar' // standard verified edition
  }
];
