// Import school-relevant Wikipedia articles in three languages (AR/FR/EN).
// Batched API requests (50 titles per call), maxlag, retries with backoff on throttling.
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
}

const TOPICS = [
  { id: 'photosynthesis', cat: 'science', ar: 'التمثيل الضوئي', fr: 'Photosynthèse', en: 'Photosynthesis' },
  { id: 'gravity', cat: 'science', ar: 'الجاذبية', fr: 'Gravitation', en: 'Gravity' },
  { id: 'electricity', cat: 'science', ar: 'الكهرباء', fr: 'Électricité', en: 'Electricity' },
  { id: 'magnetism', cat: 'science', ar: 'المغناطيسية', fr: 'Magnétisme', en: 'Magnetism' },
  { id: 'light', cat: 'science', ar: 'الضوء', fr: 'Lumière', en: 'Light' },
  { id: 'sound', cat: 'science', ar: 'الصوت', fr: 'Son (physique)', en: 'Sound' },
  { id: 'cell', cat: 'science', ar: 'الخلية', fr: 'Cellule (biologie)', en: 'Cell (biology)' },
  { id: 'dna', cat: 'science', ar: 'حمض نووي ريبوزي منقوص الأكسجين', fr: 'Acide désoxyribonucléique', en: 'DNA' },
  { id: 'ecosystem', cat: 'science', ar: 'نظام بيئي', fr: 'Écosystème', en: 'Ecosystem' },
  { id: 'volcano', cat: 'science', ar: 'بركان', fr: 'Volcan', en: 'Volcano' },
  { id: 'earthquake', cat: 'science', ar: 'زلزال', fr: 'Séisme', en: 'Earthquake' },
  { id: 'moon', cat: 'science', ar: 'القمر', fr: 'Lune', en: 'Moon' },
  { id: 'stars', cat: 'science', ar: 'نجم', fr: 'Étoile', en: 'Star' },
  { id: 'galaxy', cat: 'science', ar: 'مجرة', fr: 'Galaxie', en: 'Galaxy' },
  { id: 'evolution', cat: 'science', ar: 'التطور', fr: 'Évolution (biologie)', en: 'Evolution' },
  { id: 'virus', cat: 'science', ar: 'فيروس', fr: 'Virus', en: 'Virus' },
  { id: 'bacteria', cat: 'science', ar: 'بكتيريا', fr: 'Bacteria', en: 'Bacteria' },
  { id: 'nutrition', cat: 'health', ar: 'التغذية', fr: 'Nutrition', en: 'Nutrition' },
  { id: 'digestion', cat: 'health', ar: 'الهضم', fr: 'Digestion', en: 'Digestion' },
  { id: 'respiration', cat: 'health', ar: 'التنفس', fr: 'Respiration (physiologie)', en: 'Respiration (physiology)' },
  { id: 'skeleton', cat: 'health', ar: 'هيكل عظمي بشري', fr: 'Squelette humain', en: 'Human skeleton' },
  { id: 'brain', cat: 'health', ar: 'الدماغ البشري', fr: 'Cerveau humain', en: 'Human brain' },
  { id: 'immuneSystem', cat: 'health', ar: 'جهاز مناعي', fr: 'Système immunitaire', en: 'Immune system' },
  { id: 'algeria', cat: 'geo', ar: 'الجزائر', fr: 'Algérie', en: 'Algeria' },
  { id: 'morocco', cat: 'geo', ar: 'المغرب', fr: 'Maroc', en: 'Morocco' },
  { id: 'tunisia', cat: 'geo', ar: 'تونس', fr: 'Tunisie', en: 'Tunisia' },
  { id: 'sahara', cat: 'geo', ar: 'الصحراء الكبرى', fr: 'Sahara', en: 'Sahara' },
  { id: 'nile', cat: 'geo', ar: 'نهر النيل', fr: 'Nil', en: 'Nile' },
  { id: 'mediterranean', cat: 'geo', ar: 'البحر الأبيض المتوسط', fr: 'Mer Méditerranée', en: 'Mediterranean Sea' },
  { id: 'ocean', cat: 'geo', ar: 'المحيط', fr: 'Océan', en: 'Ocean' },
  { id: 'desert', cat: 'geo', ar: 'صحراء', fr: 'Désert', en: 'Desert' },
  { id: 'mountain', cat: 'geo', ar: 'جبل', fr: 'Montagne', en: 'Mountain' },
  { id: 'amazonRiver', cat: 'geo', ar: 'نهر الأمازون', fr: 'Amazone (fleuve)', en: 'Amazon River' },
  { id: 'ancientGreece', cat: 'history', ar: 'اليونان القديمة', fr: 'Grèce antique', en: 'Ancient Greece' },
  { id: 'ancientRome', cat: 'history', ar: 'روما القديمة', fr: 'Rome antique', en: 'Ancient Rome' },
  { id: 'islamicGoldenAge', cat: 'history', ar: 'العصر الذهبي للإسلام', fr: "Âge d'or de l'Islam", en: 'Islamic Golden Age' },
  { id: 'alandalus', cat: 'history', ar: 'الأندلس', fr: 'Al-Andalus', en: 'Al-Andalus' },
  { id: 'phoenicia', cat: 'history', ar: 'فينيقيا', fr: 'Phéniciens', en: 'Phoenicia' },
  { id: 'berbers', cat: 'history', ar: 'الأمازيغ', fr: 'Berbères', en: 'Berbers' },
  { id: 'ottomanEmpire', cat: 'history', ar: 'الدولة العثمانية', fr: 'Empire ottoman', en: 'Ottoman Empire' },
  { id: 'frenchRevolution', cat: 'history', ar: 'الثورة الفرنسية', fr: 'Révolution française', en: 'French Revolution' },
  { id: 'industrialRevolution', cat: 'history', ar: 'الثورة الصناعية', fr: 'Révolution industrielle', en: 'Industrial Revolution' },
  { id: 'ancientChina', cat: 'history', ar: 'الصين القديمة', fr: 'Chine ancienne', en: 'History of China' },
  { id: 'internet', cat: 'tech', ar: 'الإنترنت', fr: 'Internet', en: 'Internet' },
  { id: 'computer', cat: 'tech', ar: 'حاسوب', fr: 'Ordinateur', en: 'Computer' },
  { id: 'robot', cat: 'tech', ar: 'روبوت', fr: 'Robot', en: 'Robot' },
  { id: 'democracy', cat: 'society', ar: 'الديمقراطية', fr: 'Démocratie', en: 'Democracy' },
  { id: 'money', cat: 'society', ar: 'نقود', fr: 'Monnaie', en: 'Money' },
  { id: 'art', cat: 'society', ar: 'فن', fr: 'Art', en: 'Art' },
  { id: 'poetry', cat: 'society', ar: 'شعر (أدب)', fr: 'Poésie', en: 'Poetry' },
]

const UA = 'QalamEncyclopedia/1.0 (educational offline-first app; contact: local)'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function apiGet(url, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      const text = await res.text()
      if (text.trim().startsWith('<')) {
        // HTML = throttled or error page
        await sleep(6000 * (i + 1))
        continue
      }
      return JSON.parse(text)
    } catch (e) {
      await sleep(4000 * (i + 1))
    }
  }
  return null
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

/** Fetch extracts for many titles in batches of 40. Returns {title: text}. */
async function fetchExtractsBatch(lang, titles) {
  const out = {}
  for (let i = 0; i < titles.length; i += 40) {
    const chunk = titles.slice(i, i + 40)
    const url =
      `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts|info|revisions&explaintext=1&exintro=1` +
      `&inprop=url&rvprop=ids|timestamp&rvlimit=1&redirects=1&maxlag=5&format=json&origin=*&titles=${encodeURIComponent(chunk.join('|'))}`
    const j = await apiGet(url)
    await sleep(400)
    if (!j?.query?.pages) continue
    const norm = j.query.normalized ?? []
    const redirects = j.query.redirects ?? []
    const byTitle = {}
    for (const [pid, p] of Object.entries(j.query.pages)) {
      if (p.title) byTitle[p.title] = p
    }
    const normMap = {}
    for (const n of norm) normMap[n.to] = n.from
    for (const r of redirects) normMap[r.to] = normMap[r.from] ?? r.from
    for (const t of chunk) {
      const resolved = normMap[t] ?? t
      const p = byTitle[resolved]
      if (p && p.extract && p.extract.trim().length >= 40) {
        const revision = p.revisions?.[0]
        out[t] = {
          text: p.extract.trim(),
          title: p.title,
          url: p.fullurl,
          revisionId: revision?.revid,
          revisionTimestamp: revision?.timestamp,
        }
      }
    }
  }
  return out
}

;(async () => {
  const langs = [
    { code: 'ar', key: 'ar' },
    { code: 'fr', key: 'fr' },
    { code: 'en', key: 'en' },
  ]
  const extracts = {}
  const importedAt = new Date().toISOString()
  for (const L of langs) {
    const titles = TOPICS.map((t) => t[L.key])
    extracts[L.key] = await fetchExtractsBatch(L.code, titles)
    console.log('EXTRACTS', L.code, Object.keys(extracts[L.key]).length + '/' + titles.length)
  }
  const out = []
  for (const t of TOPICS) {
    const content = {}
    const sources = {}
    let n = 0
    for (const L of langs) {
      const page = extracts[L.key][t[L.key]]
      if (!page) continue
      const paras = splitParagraphs(page.text)
      const [summary, ...rest] = paras
      content[L.key] = {
        title: t[L.key],
        summary: (summary ?? '').slice(0, 220),
        body: rest.length ? rest : paras.slice(0, 1),
      }
      const source = makeWikiSource(page, importedAt)
      if (source) sources[L.key] = [source]
      n++
    }
    if (n >= 2) out.push({ id: t.id, cat: CATS[t.cat], related: [], content, sources })
  }
  const dest = path.join(__dirname, '..', 'src', 'wikiArticles.json')
  const existing = fs.existsSync(dest) ? JSON.parse(fs.readFileSync(dest, 'utf8')) : []
  const merged = mergeArticles(existing, out)
  fs.writeFileSync(dest, JSON.stringify(merged, null, 1))
  console.log('SAVED', dest, '| refreshed:', out.length, '| total:', merged.length, '| refreshed with 3 langs:', out.filter((a) => Object.keys(a.content).length === 3).length)
})()
