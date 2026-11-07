import type { Lang } from './i18n'
import { hasZimApi, publicUrl } from './publicUrl'

export interface ZimPack {
  id: string
  file: string
  url: string
  sizeMB: number
  lang: Lang
  title: Record<Lang, string>
  desc: Record<Lang, string>
}

export const ZIM_CATALOG: ZimPack[] = [
  {
    id: 'ar-top',
    file: 'wikipedia_ar_top_mini_2026-10.zim',
    url: 'https://download.kiwix.org/zim/wikipedia/wikipedia_ar_top_mini_2026-10.zim',
    sizeMB: 238,
    lang: 'ar',
    title: { ar: 'ويكيبيديا العربية — أهم المقالات', fr: 'Wikipédia arabe — articles essentiels', en: 'Arabic Wikipedia — top articles' },
    desc: { ar: 'أهم مقالات ويكيبيديا العربية (مقدمات المقالات).', fr: 'Les articles essentiels de Wikipédia en arabe (introductions).', en: 'The essential Arabic Wikipedia articles (introductions).' },
  },
  {
    id: 'ar-history',
    file: 'wikipedia_ar_history_nopic_2026-10.zim',
    url: 'https://download.kiwix.org/zim/wikipedia/wikipedia_ar_history_nopic_2026-10.zim',
    sizeMB: 148,
    lang: 'ar',
    title: { ar: 'ويكيبيديا العربية — التاريخ', fr: 'Wikipédia arabe — histoire', en: 'Arabic Wikipedia — history' },
    desc: { ar: 'مقالات التاريخ كاملة بالعربية (بدون صور).', fr: "Articles d'histoire complets en arabe (sans images).", en: 'Full history articles in Arabic (no images).' },
  },
  {
    id: 'fr-vikidia',
    file: 'vikidia_fr_all_nopic_2026-09.zim',
    url: 'https://download.kiwix.org/zim/vikidia/vikidia_fr_all_nopic_2026-09.zim',
    sizeMB: 98,
    lang: 'fr',
    title: { ar: 'فيكيديا الفرنسية', fr: 'Vikidia en français', en: 'French Vikidia' },
    desc: { ar: 'موسوعة الأطفال الفرنسية كاملة (بدون صور) — مثالية للتلاميذ.', fr: "L'encyclopédie des enfants en français (sans images) — idéale pour les élèves.", en: 'The children’s encyclopedia in French (no images) — ideal for students.' },
  },
  {
    id: 'en-vikidia',
    file: 'vikidia_en_all_nopic_2026-09a.zim',
    url: 'https://download.kiwix.org/zim/vikidia/vikidia_en_all_nopic_2026-09a.zim',
    sizeMB: 10,
    lang: 'en',
    title: { ar: 'فيكيديا الإنجليزية', fr: 'Vikidia en anglais', en: 'English Vikidia' },
    desc: { ar: 'موسوعة الأطفال الإنجليزية (بدون صور) — خفيفة وسريعة.', fr: "L'encyclopédie des enfants en anglais (sans images) — légère et rapide.", en: 'The children’s encyclopedia in English (no images) — light and fast.' },
  },
  {
    id: 'ar-full',
    file: 'wikipedia_ar_all_mini_2026-08.zim',
    url: 'https://download.kiwix.org/zim/wikipedia/wikipedia_ar_all_mini_2026-08.zim',
    sizeMB: 3023,
    lang: 'ar',
    title: { ar: 'ويكيبيديا العربية كاملة', fr: 'Wikipédia arabe complète', en: 'Full Arabic Wikipedia' },
    desc: { ar: 'الموسوعة العربية الكاملة (مقدمات جميع المقالات) — 3 غيغابايت.', fr: 'Wikipédia arabe complète (introductions de tous les articles) — 3 Go.', en: 'The full Arabic Wikipedia (introductions of all articles) — 3 GB.' },
  },
  {
    id: 'fr-full',
    file: 'wikipedia_fr_all_mini_2026-05.zim',
    url: 'https://download.kiwix.org/zim/wikipedia/wikipedia_fr_all_mini_2026-05.zim',
    sizeMB: 3418,
    lang: 'fr',
    title: { ar: 'ويكيبيديا الفرنسية كاملة', fr: 'Wikipédia française complète', en: 'Full French Wikipedia' },
    desc: { ar: 'الموسوعة الفرنسية الكاملة — 3.4 غيغابايت.', fr: 'Wikipédia française complète — 3,4 Go.', en: 'The full French Wikipedia — 3.4 GB.' },
  },
  {
    id: 'en-full',
    file: 'wikipedia_en_all_mini_2026-06.zim',
    url: 'https://download.kiwix.org/zim/wikipedia/wikipedia_en_all_mini_2026-06.zim',
    sizeMB: 0,
    lang: 'en',
    title: { ar: 'ويكيبيديا الإنجليزية كاملة', fr: 'Wikipédia anglaise complète', en: 'Full English Wikipedia' },
    desc: { ar: 'الموسوعة الإنجليزية الكاملة — عدة غيغابايت.', fr: 'Wikipédia anglaise complète — plusieurs Go.', en: 'The full English Wikipedia — several GB.' },
  },
]

export interface InstalledZim {
  name: string
  sizeMB: number
}

export async function listInstalledZims(): Promise<InstalledZim[]> {
  if (!hasZimApi) return []
  try {
    const res = await fetch(publicUrl('api/zim-list'))
    if (!res.ok) return []
    return (await res.json()) as InstalledZim[]
  } catch {
    return []
  }
}

export function kiwixReaderUrl(_file: string, _query?: string): string {
  // jQuery mode: Kiwix reads the ZIM directly (no service worker needed)
  return `${publicUrl('kiwix/index.html')}?contentInjectionMode=jquery`
}

export function zimPath(file: string): string {
  return publicUrl(`zim/${encodeURIComponent(file)}`)
}
