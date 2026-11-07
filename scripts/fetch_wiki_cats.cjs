// Phase 2: harvest hundreds of school articles from Arabic Wikipedia categories,
// align them to FR/EN via langlinks, and fetch trilingual intros (batched).
const fs = require('node:fs')
const path = require('node:path')
const { makeWikiSource, mergeArticles } = require('./wiki_sources.cjs')

const CATS = {
  science: { ar: 'علوم', fr: 'Sciences', en: 'Science' },
  geo: { ar: 'جغرافيا', fr: 'Géographie', en: 'Geography' },
  history: { ar: 'تاريخ', fr: 'Histoire', en: 'History' },
  tech: { ar: 'تقنية', fr: 'Technologie', en: 'Technology' },
  health: { ar: 'صحة', fr: 'Santé', en: 'Health' },
  society: { ar: 'مجتمع وثقافة', fr: 'Société et culture', en: 'Society & culture' },
  space: { ar: 'فضاء', fr: 'Espace', en: 'Space' },
  math: { ar: 'رياضيات', fr: 'Mathématiques', en: 'Mathematics' },
  animals: { ar: 'حيوانات', fr: 'Animaux', en: 'Animals' },
  plants: { ar: 'نباتات', fr: 'Plantes', en: 'Plants' },
  religion: { ar: 'أديان', fr: 'Religions', en: 'Religions' },
  economy: { ar: 'اقتصاد', fr: 'Économie', en: 'Economy' },
  politics: { ar: 'سياسة', fr: 'Politique', en: 'Politics' },
  sport: { ar: 'رياضة', fr: 'Sport', en: 'Sport' },
  language: { ar: 'لغات', fr: 'Langues', en: 'Languages' },
  architecture: { ar: 'عمارة', fr: 'Architecture', en: 'Architecture' },
  transport: { ar: 'نقل', fr: 'Transport', en: 'Transport' },
  agriculture: { ar: 'زراعة', fr: 'Agriculture', en: 'Agriculture' },
}

// school-relevant categories on Arabic Wikipedia
const CATEGORIES = [
  { cat: 'science', name: 'تصنيف:مفاهيم فيزيائية' },
  { cat: 'science', name: 'تصنيف:علم الأحياء' },
  { cat: 'science', name: 'تصنيف:علم الفلك' },
  { cat: 'science', name: 'تصنيف:كيمياء' },
  { cat: 'science', name: 'تصنيف:علوم الأرض' },
  { cat: 'space', name: 'تصنيف:النظام الشمسي' },
  { cat: 'geo', name: 'تصنيف:دول أفريقيا' },
  { cat: 'geo', name: 'تصنيف:بحار ومحيطات' },
  { cat: 'geo', name: 'تصنيف:أنهار' },
  { cat: 'geo', name: 'تصنيف:جبال' },
  { cat: 'history', name: 'تصنيف:حضارات' },
  { cat: 'history', name: 'تصنيف:الإمبراطوريات' },
  { cat: 'history', name: 'تصنيف:تاريخ أفريقيا' },
  { cat: 'health', name: 'تصنيف:أمراض' },
  { cat: 'health', name: 'تصنيف:طب' },
  { cat: 'tech', name: 'تصنيف:تقنية المعلومات' },
  { cat: 'tech', name: 'تصنيف:إلكترونيات' },
  { cat: 'society', name: 'تصنيف:فنون' },
  { cat: 'society', name: 'تصنيف:أدب' },
  { cat: 'society', name: 'تصنيف:موسيقى' },
  { cat: 'math', name: 'تصنيف:رياضيات' },
  { cat: 'animals', name: 'تصنيف:حيوانات' },
  { cat: 'plants', name: 'تصنيف:نباتات' },
  { cat: 'religion', name: 'تصنيف:أديان' },
  { cat: 'economy', name: 'تصنيف:اقتصاد' },
  { cat: 'politics', name: 'تصنيف:سياسة' },
  { cat: 'sport', name: 'تصنيف:رياضة' },
  { cat: 'language', name: 'تصنيف:لغات' },
  { cat: 'architecture', name: 'تصنيف:عمارة' },
  { cat: 'transport', name: 'تصنيف:نقل' },
  { cat: 'agriculture', name: 'تصنيف:زراعة' },
]

const UA = 'QalamEncyclopedia/1.0 (educational offline-first app; contact: local)'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function apiGet(url, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      const text = await res.text()
      if (text.trim().startsWith('<')) {
        await sleep(8000 * (i + 1))
        continue
      }
      return JSON.parse(text)
    } catch {
      await sleep(6000 * (i + 1))
    }
  }
  return null
}

const skipRE = /(توضيح|قائمة|تصنيف|بوابة:|ملحق:|ويكيبيديا:)/

async function categoryMembers(name, limit = 45) {
  const out = []
  let cont = ''
  for (;;) {
    const url =
      `https://ar.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(name)}` +
      `&cmnamespace=0&cmlimit=500&format=json&maxlag=5${cont}`
    const j = await apiGet(url)
    await sleep(350)
    if (!j) break
    for (const m of j.query?.categorymembers ?? []) {
      if (!skipRE.test(m.title) && !out.includes(m.title)) out.push(m.title)
      if (out.length >= limit) return out
    }
    if (j.continue?.cmcontinue) cont = '&cmcontinue=' + encodeURIComponent(j.continue.cmcontinue)
    else break
  }
  return out
}

async function langlinksBatch(titles) {
  const map = {}
  for (let i = 0; i < titles.length; i += 30) {
    const chunk = titles.slice(i, i + 30)
    const url =
      `https://ar.wikipedia.org/w/api.php?action=query&prop=langlinks&llprop=lang&lllimit=500` +
      `&format=json&maxlag=5&titles=${encodeURIComponent(chunk.join('|'))}`
    const j = await apiGet(url)
    await sleep(600)
    if (!j?.query?.pages) continue
    const norm = {}
    for (const n of j.query.normalized ?? []) norm[n.to] = n.from
    for (const p of Object.values(j.query.pages)) {
      const ar = norm[p.title] ?? p.title
      const langs = {}
      for (const ll of p.langlinks ?? []) if (ll.lang === 'fr' || ll.lang === 'en') langs[ll.lang] = ll['*']
      if (langs.fr || langs.en) map[ar] = langs
    }
  }
  return map
}

async function extractsBatch(lang, titles) {
  const out = {}
  for (let i = 0; i < titles.length; i += 20) {
    const chunk = titles.slice(i, i + 20)
    const url =
      `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts|info|revisions&explaintext=1&exintro=1` +
      `&inprop=url&rvprop=ids|timestamp&rvlimit=1&redirects=1&maxlag=5&format=json&origin=*&titles=${encodeURIComponent(chunk.join('|'))}`
    const j = await apiGet(url)
    await sleep(800)
    if (!j?.query?.pages) {
      console.log('EXTRACT FAIL', lang, 'chunk', i)
      continue
    }
    const normMap = {}
    for (const n of j.query.normalized ?? []) normMap[n.to] = n.from
    for (const r of j.query.redirects ?? []) normMap[r.to] = normMap[r.from] ?? r.from
    for (const t of chunk) {
      const resolved = normMap[t] ?? t
      for (const p of Object.values(j.query.pages)) {
        if (p.title === resolved && p.extract && p.extract.trim().length >= 40) {
          const revision = p.revisions?.[0]
          out[t] = {
            text: p.extract.trim(),
            title: p.title,
            url: p.fullurl,
            revisionId: revision?.revid,
            revisionTimestamp: revision?.timestamp,
          }
          break
        }
      }
    }
  }
  return out
}

function splitParagraphs(text, max = 5) {
  const clean = text.replace(/\s+/g, ' ').trim()
  const sentences = clean.match(/[^.!?؟]+[.!?؟]+/g) ?? [clean]
  const paras = []
  let buf = ''
  for (const s of sentences) {
    buf += s.trim() + ' '
    if (buf.length > 520) {
      paras.push(buf.trim())
      buf = ''
      if (paras.length >= max) break
    }
  }
  if (buf.trim() && paras.length < max) paras.push(buf.trim())
  return paras.length ? paras : [clean.slice(0, 600)]
}

;(async () => {
  // 1) gather members
  const topics = new Map() // ar title -> {cat, fr, en}
  for (const c of CATEGORIES) {
    const members = await categoryMembers(c.name)
    for (const t of members) {
      if (!topics.has(t)) topics.set(t, { cat: c.cat })
    }
    console.log('CAT', c.name, '+', members.length, '| total unique:', topics.size)
  }
  const arTitles = [...topics.keys()]
  console.log('TOTAL AR TITLES:', arTitles.length)

  // 2) langlinks
  const links = await langlinksBatch(arTitles)
  let frTitles = []
  let enTitles = []
  for (const t of arTitles) {
    const l = links[t]
    if (!l) continue
    topics.get(t).fr = l.fr
    topics.get(t).en = l.en
    if (l.fr) frTitles.push(l.fr)
    if (l.en) enTitles.push(l.en)
  }
  console.log('LANGALIGNED: fr', frTitles.length, '| en', enTitles.length)

  // 3) extracts
  const exAr = await extractsBatch('ar', arTitles)
  const exFr = await extractsBatch('fr', frTitles)
  const exEn = await extractsBatch('en', enTitles)
  const importedAt = new Date().toISOString()
  console.log('EXTRACTS ar', Object.keys(exAr).length, 'fr', Object.keys(exFr).length, 'en', Object.keys(exEn).length)

  // 4) build articles
  const out = []
  for (const t of arTitles) {
    const info = topics.get(t)
    const content = {}
    const sources = {}
    const arPage = exAr[t]
    if (arPage) {
      const paras = splitParagraphs(arPage.text)
      const [s, ...r] = paras
      content.ar = { title: t, summary: (s ?? '').slice(0, 220), body: r.length ? r : paras.slice(0, 1) }
      const source = makeWikiSource(arPage, importedAt)
      if (source) sources.ar = [source]
    }
    const frPage = info.fr ? exFr[info.fr] : null
    if (frPage) {
      const paras = splitParagraphs(frPage.text)
      const [s, ...r] = paras
      content.fr = { title: info.fr, summary: (s ?? '').slice(0, 220), body: r.length ? r : paras.slice(0, 1) }
      const source = makeWikiSource(frPage, importedAt)
      if (source) sources.fr = [source]
    }
    const enPage = info.en ? exEn[info.en] : null
    if (enPage) {
      const paras = splitParagraphs(enPage.text)
      const [s, ...r] = paras
      content.en = { title: info.en, summary: (s ?? '').slice(0, 220), body: r.length ? r : paras.slice(0, 1) }
      const source = makeWikiSource(enPage, importedAt)
      if (source) sources.en = [source]
    }
    if (Object.keys(content).length >= 2) {
      const hash = Array.from(t).reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 100000, 7)
      out.push({ id: 'w-' + hash, cat: CATS[info.cat], related: [], content, sources })
    }
  }

  const dest = path.join(__dirname, '..', 'src', 'wikiArticles.json')
  const existing = fs.existsSync(dest) ? JSON.parse(fs.readFileSync(dest, 'utf8')) : []
  const merged = mergeArticles(existing, out)
  fs.writeFileSync(dest, JSON.stringify(merged, null, 1))
  console.log('SAVED', dest, '| refreshed:', out.length, '| total now:', merged.length)
})()
