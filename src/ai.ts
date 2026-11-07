import type { Article } from './data'
import { normalize, type Lang } from './i18n'
import { loadTutorSettings, type TutorSettings } from './storage'
import { ALL_ARTICLES_FULL, contentOf } from './content'

const SYS_PROMPT: Record<Lang, string> = {
  ar: 'أنت معلم ودود في موسوعة تفاعلية ثلاثية اللغات. اشرح ببساطة وبأمثلة مناسبة للتلاميذ، باللغة العربية. استخدم المعلومات المحلية المرفقة عند توفرها، وإن كانت غير كافية قل ذلك بصدق. أجب في 3-6 أسطر.',
  fr: "Tu es un tuteur bienveillant d'une encyclopédie interactive trilingue. Explique simplement, avec des exemples adaptés aux élèves, en français. Utilise les informations locales fournies quand elles existent, et dis honnêtement si elles sont insuffisantes. Réponds en 3 à 6 lignes.",
  en: 'You are a friendly tutor in a trilingual interactive encyclopedia. Explain simply, with examples suited to school students, in English. Use the provided local information when available, and honestly say if it is insufficient. Answer in 3-6 lines.',
}

export function findRelevantArticles(query: string): Article[] {
  const q = normalize(query)
  const words = q.split(' ').filter((w) => w.length > 2)
  const scored = ALL_ARTICLES_FULL.map((a) => {
    const hay = Object.values(a.content)
      .map((c) => normalize(c.title + ' ' + c.summary + ' ' + c.body.join(' ')))
      .join(' ')
    let score = 0
    for (const w of words) if (hay.includes(w)) score++
    return { a, score }
  })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
  return scored.slice(0, 2).map((x) => x.a)
}

function articleContext(a: Article, lang: Lang): string {
  const c = contentOf(a, lang)
  return `[${c.title}]\n${c.summary}\n${c.body.join('\n')}`
}

const FALLBACK_HINT: Record<Lang, string> = {
  ar: 'لا أملك محرك ذكاء متصلاً، لكن إليك ما وجدته في المقالات المحلية:',
  fr: "Je n'ai pas de moteur d'IA connecté, mais voici ce que j'ai trouvé dans les articles locaux :",
  en: 'I have no AI engine connected, but here is what I found in the local articles:',
}

const TOPICS: Record<Lang, string> = {
  ar: 'جرّب السؤال عن أحد المواضيع المتاحة:',
  fr: "Essayez de poser une question sur l'un des sujets disponibles :",
  en: 'Try asking about one of the available topics:',
}

export function offlineAnswer(query: string, lang: Lang): string {
  const rel = findRelevantArticles(query)
  if (rel.length === 0) {
    const topics = ALL_ARTICLES_FULL.slice(0, 6)
      .map((a) => contentOf(a, lang).title)
      .join('، ')
    return `${FALLBACK_HINT[lang]}\n\n${TOPICS[lang]} ${topics}.`
  }
  return rel.map((a) => articleContext(a, lang)).join('\n\n')
}

interface Msg {
  role: string
  content: string
}

async function chatOllama(s: TutorSettings, messages: Msg[]): Promise<string> {
  const res = await fetch(`${s.baseUrl.replace(/\/+$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: s.model, messages, stream: false }),
  })
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`)
  const j = await res.json()
  return j.message?.content ?? ''
}

async function chatApi(s: TutorSettings, messages: Msg[]): Promise<string> {
  const res = await fetch(`${s.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(s.apiKey ? { Authorization: `Bearer ${s.apiKey}` } : {}),
    },
    body: JSON.stringify({ model: s.model, messages, stream: false }),
  })
  if (!res.ok) throw new Error(`API HTTP ${res.status}`)
  const j = await res.json()
  return j.choices?.[0]?.message?.content ?? ''
}

export async function askTutor(
  query: string,
  lang: Lang,
  onError: (msg: string) => void
): Promise<string> {
  const s = loadTutorSettings()
  const rel = findRelevantArticles(query)
  const context = rel.map((a) => articleContext(a, lang)).join('\n\n')
  if (s.engine === 'offline') return offlineAnswer(query, lang)
  const messages: Msg[] = [
    {
      role: 'system',
      content: `${SYS_PROMPT[lang]}${context ? '\n\nLocal articles available:\n' + context : ''}`,
    },
    { role: 'user', content: query },
  ]
  try {
    const out = s.engine === 'ollama' ? await chatOllama(s, messages) : await chatApi(s, messages)
    return out || offlineAnswer(query, lang)
  } catch (e) {
    onError(e instanceof Error ? e.message : String(e))
    return offlineAnswer(query, lang)
  }
}

const LANG_NAMES: Record<Lang, string> = { ar: 'Arabic', fr: 'French', en: 'English' }

export async function translateText(text: string, from: Lang, to: Lang): Promise<string | null> {
  const s = loadTutorSettings()
  if (s.engine === 'offline') return null
  const prompt = `Translate the following text from ${LANG_NAMES[from]} to ${LANG_NAMES[to]} accurately. Keep names and titles unchanged. Return only the translation:\n\n${text}`
  const messages: Msg[] = [{ role: 'user', content: prompt }]
  try {
    const out = s.engine === 'ollama' ? await chatOllama(s, messages) : await chatApi(s, messages)
    return out?.trim() || null
  } catch {
    return null
  }
}

export async function simplifyArticle(
  a: Article,
  lang: Lang,
  onError: (msg: string) => void
): Promise<string> {
  const s = loadTutorSettings()
  const c = a.content[lang]
  if (s.engine === 'offline') {
    return `${c.summary}\n\n${c.body[0] ?? ''}`
  }
  const messages: Msg[] = [
    {
      role: 'system',
      content: `You simplify encyclopedia articles for 10-year-old students. Answer ONLY in ${LANG_NAMES[lang]}. Use very simple words, short sentences and one concrete example. Maximum 5 lines.`,
    },
    { role: 'user', content: `Simplify this article:\n\n${articleContext(a, lang)}` },
  ]
  try {
    const out = s.engine === 'ollama' ? await chatOllama(s, messages) : await chatApi(s, messages)
    return out || c.summary
  } catch (e) {
    onError(e instanceof Error ? e.message : String(e))
    return c.summary
  }
}

export async function quizMeArticle(
  a: Article,
  lang: Lang,
  onError: (msg: string) => void
): Promise<string> {
  const s = loadTutorSettings()
  const c = a.content[lang]
  const offline: Record<Lang, string> = {
    ar: `1) ما هو/ما هي «${c.title}» بكلماتك الخاصة؟\n2) اذكر حقيقتين تعلمتهما من المقال.\n3) لماذا هذا الموضوع مهم في حياتنا اليومية؟`,
    fr: `1) Qu'est-ce que « ${c.title} » avec vos propres mots ?\n2) Citez deux faits appris dans l'article.\n3) Pourquoi ce sujet est-il important dans la vie quotidienne ?`,
    en: `1) What is "${c.title}" in your own words?\n2) Name two facts you learned from the article.\n3) Why does this topic matter in everyday life?`,
  }
  if (s.engine === 'offline') return offline[lang]
  const messages: Msg[] = [
    {
      role: 'system',
      content: `You are a teacher. Write 3 multiple-choice questions (with 4 options each, and the correct answer marked with *) about the article below. Write ONLY in ${LANG_NAMES[lang]}.`,
    },
    { role: 'user', content: articleContext(a, lang) },
  ]
  try {
    const out = s.engine === 'ollama' ? await chatOllama(s, messages) : await chatApi(s, messages)
    return out || offline[lang]
  } catch (e) {
    onError(e instanceof Error ? e.message : String(e))
    return offline[lang]
  }
}

/* ---------- generative system ---------- */

export interface GeneratedArticle {
  title: string
  summary: string
  body: string[]
}

export async function generateArticle(
  topic: string,
  lang: Lang,
  level: string,
  onError: (msg: string) => void
): Promise<GeneratedArticle | null> {
  const s = loadTutorSettings()
  if (s.engine === 'offline') {
    onError('offline')
    return null
  }
  const prompt =
    `Write a concise encyclopedia article about "${topic}" for a ${level}-level reader, in ${LANG_NAMES[lang]}. ` +
    `Return ONLY valid JSON with this exact shape: {"title":"...","summary":"one short sentence","body":["p1","p2","p3","p4"]}. ` +
    `Write 3 to 4 short paragraphs, accurate and neutral. No markdown, no code fences.`
  const messages: Msg[] = [{ role: 'user', content: prompt }]
  try {
    const out = s.engine === 'ollama' ? await chatOllama(s, messages) : await chatApi(s, messages)
    const cleaned = out.replace(/```(?:json)?/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start < 0 || end <= start) {
      onError('bad-json')
      return null
    }
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<GeneratedArticle>
    if (!parsed.title || !Array.isArray(parsed.body) || parsed.body.length === 0) {
      onError('empty')
      return null
    }
    return {
      title: String(parsed.title),
      summary: String(parsed.summary ?? ''),
      body: parsed.body.map(String).filter((p) => p.trim().length > 0),
    }
  } catch (e) {
    onError(e instanceof Error ? e.message : String(e))
    return null
  }
}
