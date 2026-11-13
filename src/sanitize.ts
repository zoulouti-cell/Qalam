import type { Article, ArticleContent } from './data'
import type { Lang } from './i18n'

const AR = /[\u0600-\u06FF]/
const LATIN = /[A-Za-zÀ-ÿ]/

/** Remove foreign-language glosses that break language purity, e.g.
 *  "تاريخ الشعب (الإنجليزية: People's history) هو…" → "تاريخ الشعب هو…". */
const LANG_LABEL = /(بالإنجليزية|بالإنجليزية|بالفرنسية|بالألمانية|بالإسبانية|بالإيطالية|بالتركية|بالبرتغالية|بالروسية|باليونانية|باللاتينية|باليابانية|بالصينية|بالهندية|بالإندونيسية|en anglais|en français|en allemand|in English|in French|in German)\s*:?/g
const FOREIGN_PAREN = /\(([^()]{2,120})\)/g

const GLOSS_LABEL = /^(?:ب?(?:الإنجليزية|الإنكليزية|الفرنسية|الألمانية|الإسبانية|الإيطالية|التركية|البرتغالية|الروسية|اليونانية|اللاتينية|اليابانية|الصينية|الهندية|الإندونيسية|السويدية|الهولندية|البولندية|الأوكرانية|العبرية|الفارسية)|en anglais|en français|en allemand|in English|in French|in German)/i

/** A parenthetical is a foreign gloss when it starts with a language label
 *  or is written almost entirely in the other script. */
function mostlyForeign(inner: string, _lang: Lang): boolean { return GLOSS_LABEL.test(inner.trim()) }

export function scrubText(text: string, lang: 'ar' | 'fr' | 'en'): string {
  if (!text) return text
  let out = text.replace(/[\u0660-\u0669\u06f0-\u06f9]/g, c => String(c.charCodeAt(0) - (c.charCodeAt(0) >= 0x6f0 ? 0x6f0 : 0x660)))
  // remove "(English: …)" / "(بالفرنسية: …)" glosses entirely
  out = out.replace(FOREIGN_PAREN, (whole, inner: string) => (mostlyForeign(inner, lang) ? ' ' : whole))
  // remove a dangling language label left behind
  out = out.replace(LANG_LABEL, ' ')
  // invisible direction marks and leftover separators
  out = out.replace(/[\u200e\u200f\u202a-\u202e]/g, ' ')
  // tidy punctuation / spacing
  out = out
    .replace(/\s+([،,.؛;:!?])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*[،,؛;:]+\s*/, '')
    .trim()
  return out
}

const JUNK = /^(مستخدم|نقاش المستخدم|ملف|تصنيف|قالب|ويكيبيديا|User|File|Category|Template|Talk|Draft):/i

function scriptOk(text: string, lang: Lang): boolean {
  if (!text) return false
  if (lang === 'ar') return AR.test(text)
  return LATIN.test(text)
}

/**
 * Strict language hygiene for imported packs:
 *  - removes a language variant whose title is written in another script
 *    (e.g. a Latin-only title must never appear in the Arabic interface)
 *  - drops talk/file pages and empty records
 *  - guarantees every article keeps only usable language variants
 */
export function sanitizeArticles(list: unknown, lang?: Lang): Article[] {
  if (!Array.isArray(list)) return []
  const out: Article[] = []
  for (const raw of list) {
    const a = raw as Article
    if (!a || !a.content || !a.cat) continue
    const content: Partial<Record<Lang, ArticleContent>> = {}
    for (const key of ['ar', 'fr', 'en'] as Lang[]) {
      const c = a.content[key]
      if (!c) continue
      if (JUNK.test(c.title ?? '')) continue
      if (!scriptOk(c.title ?? '', key)) continue
      content[key] = {
        title: scrubText(c.title ?? '', key),
        summary: scrubText(c.summary ?? '', key),
        body: (c.body ?? []).map((p) => scrubText(p, key)).filter((p) => p.length > 20),
      }
    }
    if (Object.keys(content).length === 0) continue
    if (lang && !content[lang]) continue

    // keep category labels only when written in a matching script
    const cat: Article['cat'] = { ...a.cat }
    for (const key of ['ar', 'fr', 'en'] as Lang[]) {
      const label = cat[key]
      if (label && !scriptOk(label, key)) {
        cat[key] = { ar: 'معرفة عامة', fr: 'Savoirs généraux', en: 'General knowledge' }[key]
      }
    }
    out.push({ ...a, content: content as Article['content'], cat })
  }
  return out
}
