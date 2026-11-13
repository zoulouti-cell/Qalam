import type { Lang } from './i18n'
import { articleHasLanguage, type Article, type ArticleContent } from './data'
import type { Level } from './content'

/**
 * Audience layer: authored child editions take precedence. For imported articles
 * without one, show a short, deterministic introduction while preserving complete
 * sentences. This fallback is not presented as a fully age-edited translation.
 */

const REPLACE: Record<Lang, [RegExp, string][]> = {
  ar: [
    [/بالإضافة إلى ذلك|علاوة على ذلك/g, 'وأيضاً'],
    [/تقريباً/g, 'حوالي'],
    [/الجدير بالذكر أن|من الجدير بالذكر أن/g, ''],
    [/على سبيل المثال/g, 'مثلاً'],
    [/كذلك/g, 'أيضاً'],
  ],
  fr: [
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

function clean(text: string): string {
  return text
    .replace(/\[\s*\d{1,4}\s*\]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function sentences(text: string): string[] {
  return clean(text)
    .split(/(?<=[.!?…؟])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
}

export function kidify(text: string, lang: Lang): string {
  if (!text) return ''
  // Quran quotations must never be paraphrased by vocabulary substitutions or
  // cut by the introductory sentence limit. Keep their surrounding paragraph.
  if (lang === 'ar' && /﴿[^﴾]*﴾/u.test(text)) return text.trim()
  let out = clean(text)
  for (const [re, rep] of REPLACE[lang]) out = out.replace(re, rep)
  return sentences(out).slice(0, MAX_SENTENCES).join(' ').replace(/\s{2,}/g, ' ').trim() || out
}

/** Build the content object for a chosen language + register. */
export function viewContent(article: Article, lang: Lang, level: Level): ArticleContent {
  const c = article.content[lang]
  if (!c || !articleHasLanguage(article,lang)) {
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
