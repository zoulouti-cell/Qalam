// Exact normalized quotation matching only; ambiguous matches require review.
const fs = require('node:fs')
const source = JSON.parse(fs.readFileSync('reports/quran-simple-source.json', 'utf8'))
if (source.code !== 200 || source.data.surahs.length !== 114) throw Error('Invalid Quran source')
const normalize = s => s.normalize('NFKD').replace(/\p{M}|ـ/gu, '').replace(/ٱ/g, 'ا').replace(/ى/g, 'ي').replace(/[^\p{L}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
const basmala = source.data.surahs[95].ayahs[0].text.split(' ').slice(0, 4).join(' ')
const verses = source.data.surahs.flatMap(s => s.ayahs.map(a => {
  const text = a.numberInSurah === 1 && s.number !== 1 && a.text.startsWith(basmala + ' ') ? a.text.slice(basmala.length + 1) : a.text
  return { surah: s.number, name: s.name.replace(/^سُورَةُ\s*/, ''), number: a.numberInSurah, text, normalized: normalize(text) }
}))
if (verses.length !== 6236) throw Error('Incomplete Quran source')
const changes = [], review = []
const files = fs.readdirSync('public/data').filter(f => /^(wikiArticles|collectionFr|library_extra\d*)\.json$/.test(f))
function complete(text, context) {
  return text.replace(/﴿([^﴾]*)(﴾|$)|\{([^{}]+)\}|[«"]([^»"]+)[»"]/gu, (whole, bracket, closing, curly, quoted, offset) => {
    const raw = bracket ?? curly ?? quoted
    if (bracket === undefined && !/قال.{0,45}تعالى|قوله\s+تعالى/u.test(text.slice(Math.max(0, offset - 90), offset))) return whole
    const n = normalize(raw)
    if (n.split(' ').length < 3) return whole
    let matches = verses.filter(v => (` ${v.normalized} `).includes(` ${n} `))
    // An imported paragraph can end in the middle of a word.
    if (!matches.length && closing === '' && n.length > 40) matches = verses.filter(v => v.normalized.startsWith(n))
    if (matches.length > 1) {
      const contextText = normalize(text)
      matches = matches.filter(v => contextText.includes(normalize(v.name)))
    }
    if (!matches.length && bracket !== undefined) {
      // Whole adjacent verses are already complete, even in one quotation.
      if (verses.some((v, i) => verses[i + 1]?.surah === v.surah && `${v.normalized} ${verses[i + 1].normalized}` === n)) return whole
      // A historical spelling of David does not make this complete verse truncated.
      if (verses.some(v => v.normalized.replace(/داوود/g, 'داود') === n)) return whole
    }
    if (matches.length !== 1) {
      if (bracket !== undefined) review.push({ ...context, quote: raw, reason: matches.length ? 'ambiguous' : 'multi-verse-or-unmatched' })
      return whole
    }
    const v = matches[0]
    if (n === v.normalized && closing !== '') return whole
    const after = text.slice(offset + whole.length)
    const hasReference = /^\s*\[[^\]]+:[^\]]+\]/u.test(after)
    const replacement = `﴿${v.text}﴾${hasReference ? '' : ` [${v.name}: ${v.number}]`}`
    changes.push({ ...context, before: whole, after: replacement, reference: `${v.surah}:${v.number}`, source: `https://quran.com/${v.surah}/${v.number}` })
    return replacement
  })
}
for (const file of files) {
  const path = 'public/data/' + file
  const data = JSON.parse(fs.readFileSync(path, 'utf8'))
  let changed = false
  function walk(value, context, key = '') {
    if (typeof value === 'string') {
      if (!/[﴿{]|قال.{0,45}تعالى|قوله\s+تعالى/u.test(value)) return value
      const next = complete(value, { ...context, field: key })
      if (next !== value) changed = true
      return next
    }
    if (Array.isArray(value)) return value.map((v, i) => walk(v, context, `${key}.${i}`))
    if (value && typeof value === 'object') for (const k of Object.keys(value)) value[k] = walk(value[k], context, `${key}.${k}`)
    return value
  }
  for (const article of data) walk(article, { file, id: article.id, title: article.content?.ar?.title })
  if (changed && process.argv.includes('--write')) fs.writeFileSync(path, JSON.stringify(data, null, 1))
}
if (!process.argv.includes('--check')) fs.writeFileSync('reports/quran-quote-completion.json', JSON.stringify({ source: 'https://api.alquran.cloud/v1/quran/quran-simple', changes, review }, null, 2))
if (process.argv.includes('--check') && (changes.length || review.length)) process.exitCode = 1
console.log(JSON.stringify({ changes: changes.length, review: review.length, proposals: changes.map(c => ({ title: c.title, reference: c.reference, field: c.field })), unmatched: review.map(r => ({ title: r.title, quote: r.quote })) }, null, 2))
