/** Visual identity for each knowledge section (cover icon + color). */
export type SectionMeta = { icon: string; color: string; pattern: 'stars' | 'lines' | 'grid' | 'waves' | 'dots' }

const RULES: { match: RegExp; meta: SectionMeta }[] = [
  { match: /تاريخ|History|Histoire/i, meta: { icon: 'account_balance', color: '#8a6d23', pattern: 'lines' } },
  { match: /أدب|Literature|Littérature/i, meta: { icon: 'menu_book', color: '#7a4b2e', pattern: 'lines' } },
  { match: /فضاء|Space|Espace/i, meta: { icon: 'rocket_launch', color: '#2e4a9e', pattern: 'stars' } },
  { match: /أديان|Religions|Religion/i, meta: { icon: 'mosque', color: '#0f4635', pattern: 'dots' } },
  { match: /تقنية|Technolog|Technologie/i, meta: { icon: 'memory', color: '#315d6b', pattern: 'grid' } },
  { match: /فلسفة|Philosoph/i, meta: { icon: 'psychology', color: '#5a3d7a', pattern: 'waves' } },
  { match: /إنسانية|Humanities|Sciences humaines/i, meta: { icon: 'groups', color: '#7a4b6b', pattern: 'dots' } },
  { match: /علوم|Sciences|Science/i, meta: { icon: 'science', color: '#1f6b5a', pattern: 'grid' } },
  { match: /جغرافيا|Géographie|Geography/i, meta: { icon: 'public', color: '#2e5d7a', pattern: 'waves' } },
  { match: /قلم|Qalam/i, meta: { icon: 'edit_note', color: '#b8954a', pattern: 'stars' } },
]

const FALLBACKS: SectionMeta[] = [
  { icon: 'auto_stories', color: '#31546b', pattern: 'lines' },
  { icon: 'category', color: '#6b4b31', pattern: 'dots' },
  { icon: 'explore', color: '#2f5d4a', pattern: 'waves' },
]

export function sectionMeta(name: string): SectionMeta {
  for (const r of RULES) if (r.match.test(name)) return r.meta
  let h = 7
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return FALLBACKS[h % FALLBACKS.length]
}

export function sectionCoverStyle(meta: SectionMeta): React.CSSProperties {
  return {
    background: `linear-gradient(140deg, ${meta.color}, ${meta.color}c0 55%, #123f3580)`,
  }
}
