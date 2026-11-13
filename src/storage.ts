import type { Article, ArticleSource } from './data'
import { LANGS } from './i18n'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isArticleSource(value: unknown): value is ArticleSource {
  if (!isRecord(value)) return false
  if (!['name', 'title', 'url', 'attribution', 'license'].every((key) => typeof value[key] === 'string')) return false
  const validExternalUrl = (raw: unknown) => {
    if (typeof raw !== 'string') return false
    try {
      const url = new URL(raw)
      return (url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password
    } catch { return false }
  }
  return validExternalUrl(value.url) &&
    (!('licenseUrl' in value) || value.licenseUrl === undefined || validExternalUrl(value.licenseUrl))
}

function loadStringArray(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch { return [] }
}

export function isArticleRecord(value: unknown): value is Article {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim() || value.id.length > 200) return false
  const cat = value.cat
  const contentByLang = value.content
  const related = value.related
  const sources = value.sources
  const availableLanguages = value.availableLanguages
  if (!isRecord(cat) || !isRecord(contentByLang) || !Array.isArray(related)) return false
  if (!LANGS.every((lang) => typeof cat[lang] === 'string')) return false
  if (!related.every((id) => typeof id === 'string')) return false
  if (availableLanguages !== undefined && (!Array.isArray(availableLanguages) || !availableLanguages.every((lang) => LANGS.includes(lang as (typeof LANGS)[number]) ))) return false
  if (!LANGS.every((lang) => {
    const content = contentByLang[lang]
    return isRecord(content) && typeof content.title === 'string' && typeof content.summary === 'string' &&
      Array.isArray(content.body) && content.body.every((paragraph) => typeof paragraph === 'string')
  })) return false
  if (sources !== undefined) {
    if (!isRecord(sources)) return false
    if (!LANGS.every((lang) => sources[lang] === undefined ||
      (Array.isArray(sources[lang]) && (sources[lang] as unknown[]).every(isArticleSource)))) return false
  }
  return true
}

const K_ARTICLES = 'encarta.customArticles'
const K_SETTINGS = 'encarta.tutorSettings'

export function loadCustomArticles(): Article[] {
  try {
    const raw = localStorage.getItem(K_ARTICLES)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(isArticleRecord) : []
  } catch {
    return []
  }
}

export function saveCustomArticles(list: Article[]) {
  try {
    localStorage.setItem(K_ARTICLES, JSON.stringify(list))
  } catch {
    // Quota and privacy-mode failures should not crash the editor or route.
  }
}

export interface TutorSettings {
  engine: 'offline' | 'ollama' | 'api'
  baseUrl: string
  model: string
  apiKey: string
}

export const DEFAULT_SETTINGS: TutorSettings = {
  engine: 'offline',
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2',
  apiKey: '',
}

export function loadTutorSettings(): TutorSettings {
  try {
    const raw = localStorage.getItem(K_SETTINGS)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<TutorSettings>) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveTutorSettings(s: TutorSettings) {
  try { localStorage.setItem(K_SETTINGS, JSON.stringify(s)) } catch { /* storage may be unavailable */ }
}

/* ---------- learner level & progress ---------- */

import type { Level } from './content'

const K_LEVEL = 'encarta.level'
const K_DONE = 'encarta.done'

export function loadLevel(): Level | null {
  try {
    const v = localStorage.getItem(K_LEVEL)
    if (v === 'kids') return 'kids'
    if (v === 'school' || v === 'advanced' || v === 'academic') return 'school'
    return null
  } catch {
    return null
  }
}

export function saveLevel(l: Level) {
  try { localStorage.setItem(K_LEVEL, l) } catch { /* storage may be unavailable */ }
}

export function loadDone(): string[] {
  return loadStringArray(K_DONE)
}

export function addDone(id: string) {
  const set = new Set(loadDone())
  set.add(id)
  try { localStorage.setItem(K_DONE, JSON.stringify([...set])) } catch { /* storage may be unavailable */ }
}

export function removeDone(ids: string[]) {
  const remove = new Set(ids)
  const next = loadDone().filter((id) => !remove.has(id))
  try { localStorage.setItem(K_DONE, JSON.stringify(next)) } catch { /* keep the current session usable if storage is unavailable */ }
  return next
}

/* ---------- ink points, badges, used languages ---------- */

const K_INK = 'encarta.ink'
const K_BADGES = 'encarta.badges'
const K_LANGS = 'encarta.usedLangs'
const K_NAME = 'encarta.name'

export function loadInk(): number {
  try {
    const value = Number(localStorage.getItem(K_INK) ?? 0)
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

export function saveInk(n: number) {
  try { localStorage.setItem(K_INK, String(n)) } catch { /* storage may be unavailable */ }
}

export function loadBadges(): string[] {
  return loadStringArray(K_BADGES)
}

export function saveBadges(list: string[]) {
  try { localStorage.setItem(K_BADGES, JSON.stringify(list)) } catch { /* storage may be unavailable */ }
}

export function loadUsedLangs(): string[] {
  return loadStringArray(K_LANGS)
}

export function saveUsedLangs(list: string[]) {
  try { localStorage.setItem(K_LANGS, JSON.stringify(list)) } catch { /* storage may be unavailable */ }
}

export function loadName(): string {
  try {
    return localStorage.getItem(K_NAME) ?? ''
  } catch {
    return ''
  }
}

export function saveName(name: string) {
  try { localStorage.setItem(K_NAME, name) } catch { /* storage may be unavailable */ }
}
