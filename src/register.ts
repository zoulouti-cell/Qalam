import type { Lang } from './i18n'
import type { Article, ArticleContent } from './data'
import type { Level } from './content'

/** Register layer: every article is rendered in the register of the chosen audience.
    Adult = full text. Child = shortened, simplified, plain-language version.
    The transform is deterministic (no network) so the whole encyclopedia switches
    instantly and consistently. */

const REPLACE: Record<Lang, [RegExp, string][]> = {
  ar: [
    [/يُعدّ|تُعدّ|يعد|تعد/g, 'هو'],
    [/نظرية/g, 'فكرة'],
    [/التركيب/g, 'البناء'],
    [/يُستخدم|تستخدم/g, 'نستعمل'],
    [/بالإضافة إلى ذلك|علاوة على ذلك/g, 'وأيضاً'],
    [/تُشير|يشير/g, 'تعني'],
    [/مما أدى إلى|أدى إلى/g, 'فنتج عنه'],
    [/تقريباً|نحو/g, 'حوالي'],
    [/الجدير بالذكر أن|من الجدير بالذكر أن/g, ''],
    [/على سبيل المثال/g, 'مثلاً'],
    [/بالنسبة إلى/g, 'عن'],
    [/كذلك/g, 'أيضاً'],
  ],
  fr: [
    [/\bnotamment\b/g, 'surtout'],
    [/\bconstitué de\b|\bcomposé de\b/g, 'formé de'],
    [/\bpar conséquent\b|\ben conséquence\b/g, 'donc'],
    [/\bde plus\b|\ben outre\b/g, 'aussi'],
    [/\bapproximativement\b|\benviron\b/g, 'environ'],
    [/\bnéanmoins\b|\btoutefois\b/g, 'mais'],
    [/\billustre\b|\bdémontre\b/g, 'montre'],
    [/\bafin de\b/g, 'pour'],
    [/\bainsi que\b/g, 'et'],
  ],
  en: [
    [/\bapproximately\b|\broughly\b/g, 'about'],
    [/\bfurthermore\b|\bmoreover\b/g, 'also'],
    [/\bconsequently\b|\btherefore\b/g, 'so'],
    [/\bconstitutes\b|\bcomprises\b/g, 'is made of'],
    [/\bdemonstrates\b|\billustrates\b/g, 'shows'],
    [/\bin order to\b/g, 'to'],
    [/\bas well as\b/g, 'and'],
    [/\bnevertheless\b|\bhowever\b/g, 'but'],
  ],
}

const KID_OPENER: Record<Lang, string> = {
  ar: '',
  fr: '',
  en: '',
}

const MAX_SENTENCES = 3

function trimSynonyms(text: string, lang: Lang): string {
  if (lang !== 'ar') return text
  // "X أو Y أو Z" → keep the first form only
  return text.replace(/\sأو\s[^،.؛:]{1,40}(?=\s(?:أو|هي|هو|،|\.))/g, ' ')
}

function clean(text: string): string {
  return text
    .replace(/\[[^\]]{0,80}\]/g, ' ')
    .replace(/\([^)]{0,90}\)/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function sentences(text: string): string[] {
  return clean(text)
    .split(/(?<=[.!?…؟])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
}

const DANGLING = /(?:^|\s)(et|à|de|du|des|la|le|les|qui|que|pour|avec|dans|en|au|aux|ou|ni|of|and|the|to|with|that|which|while|as|by|for|or)$/i

function trimDangling(text: string): string {
  let words = text.trim().split(/\s+/)
  while (words.length > 4 && DANGLING.test(words[words.length - 1])) words = words.slice(0, -1)
  return words.join(' ')
}

function shorten(sentence: string, lang: Lang): string {
  const words = sentence.split(/\s+/)
  if (words.length <= 20) return sentence
  const connectors = lang === 'ar' ? /(?:،|؛|\sثم\s|\sلأن\s|\sحيث\s|\sلكن\s|\sإذ\s)/g : /(?:,|;|\sbut\s|\sbecause\s|\swhile\s|\swhich\s)/g
  const window = words.slice(0, 26).join(' ')
  // choose the LAST connector that still leaves a meaningful clause (>= 9 words)
  let cut = -1
  let m: RegExpExecArray | null
  while ((m = connectors.exec(window)) !== null) {
    const wordsBefore = window.slice(0, m.index).split(/\s+/).length
    if (wordsBefore >= 9) cut = m.index
  }
  if (cut > 0) {
    const piece = trimDangling(window.slice(0, cut).trim().replace(/[,;،]$/, ''))
    return piece + '.'
  }
  const tail = trimDangling(words.slice(0, 20).join(' ').replace(/[,;،]$/, ''))
  return tail + '.'
}

export function kidify(text: string, lang: Lang): string {
  if (!text) return ''
  let out = trimSynonyms(text, lang)
  for (const [re, rep] of REPLACE[lang]) out = out.replace(re, rep)
  const parts = sentences(out).slice(0, MAX_SENTENCES).map((s) => shorten(s, lang))
  const joined = parts.join(' ').replace(/\s{2,}/g, ' ').trim()
  return joined || clean(text).slice(0, 220)
}

/** Build the content object for a chosen language + register. */
export function viewContent(article: Article, lang: Lang, level: Level): ArticleContent {
  const c = article.content[lang]
  if (!c) {
    return {
      title: lang === 'ar' ? 'غير متوفر بالعربية' : lang === 'fr' ? 'Non disponible en français' : 'Not available in English',
      summary: '',
      body: [],
    }
  }
  if (level !== 'kids') return c
  if (article.kidsContent?.[lang]) return article.kidsContent[lang]!
  const summary = kidify(c.summary, lang)
  const body = c.body.map((p) => kidify(p, lang)).filter(Boolean).slice(0, 3)
  return { ...c, summary, body }
}

/** Register descriptor used by badges in the UI. */
export function registerLabel(level: Level, lang: Lang): string {
  const map = {
    ar: { kids: 'مستوى الطفل · مبسّط', adult: 'مستوى الكبار · كامل' },
    fr: { kids: 'Niveau enfant · simplifié', adult: 'Niveau adulte · complet' },
    en: { kids: 'Child level · simplified', adult: 'Adult level · full' },
  }
  return level === 'kids' ? map[lang].kids : map[lang].adult
}

export { KID_OPENER }
