// Fetch free, article-level lead images for exactly the subjects still missing
// from the editorial image audit. Never substitutes a branch image or guesses
// from loose keywords. Run again to resume from the current manifest.
const fs = require('fs')
const queueFile = 'reports/editorial-progress.json'
const manifestFile = 'public/data/articleImages.json'
const key = value => value.normalize('NFKC').trim().toLowerCase()
const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8')).imageQueue
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {}
const limit = Number(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || Infinity)

function tasksForRound(round, subjects) {
  const tasks = { en: new Map(), fr: new Map(), ar: new Map() }
  for (const subject of subjects) {
    const aliases = Object.entries(subject.titles || {}).filter(([, title]) => title).map(([lang, title]) => `${lang}:${key(title)}`)
    if (aliases.some(alias => manifest[alias])) continue
    const candidates = ['en', 'fr', 'ar'].filter(lang => subject.titles?.[lang])
    const lang = candidates[round]
    if (!lang) continue
    const title = subject.titles[lang]
    const group = tasks[lang].get(title) || []
    tasks[lang].set(title, [...group, ...aliases])
  }
  const batches = []
  for (const [lang, entries] of Object.entries(tasks)) {
    const rows = [...entries]
    for (let i = 0; i < rows.length; i += 30) batches.push({ lang, entries: rows.slice(i, i + 30) })
  }
  return batches
}

async function runRound(round, subjects) {
  const batches = tasksForRound(round, subjects)
  console.log(`Pass ${round + 1}: ${batches.length} batches`)
  let found = 0
  let done = 0
  for (const { lang, entries } of batches) {
    await new Promise(resolve => setTimeout(resolve, 2600))
    const params = new URLSearchParams({ action:'query', format:'json', formatversion:'2', redirects:'1', prop:'pageimages', piprop:'thumbnail|name', pithumbsize:'1200', pilicense:'free', titles:entries.map(([title]) => title).join('|') })
    let response
    try {
      response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`, { headers:{'User-Agent':'QalamEncyclopedia/1.0 (educational image metadata)'}, signal:AbortSignal.timeout(25000) })
      if (response.status === 429) {
        const retry = Math.max(30, Number(response.headers.get('retry-after') || 30))
        console.log(`Rate limit: waiting ${retry}s`)
        await new Promise(resolve => setTimeout(resolve, Math.min(retry, 90000) * 1000))
        response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`, { headers:{'User-Agent':'QalamEncyclopedia/1.0 (educational image metadata)'}, signal:AbortSignal.timeout(25000) })
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error.info)
      const redirects = new Map([...(data.query?.normalized || []), ...(data.query?.redirects || [])].map(row => [row.from, row.to]))
      for (const [original, aliases] of entries) {
        let title = original
        for (let i = 0; i < 6 && redirects.has(title); i++) title = redirects.get(title)
        const page = data.query?.pages?.find(row => row.title === title)
        if (!page?.thumbnail || !/\.(?:jpg|jpeg|png|webp)$/i.test(page.pageimage || '') || /icon|logo|flag|coat.of.arms|pictogram|symbol|emblem|placeholder|disambig/i.test(page.pageimage)) continue
        const image = { url:page.thumbnail.source.split('?')[0], file:page.pageimage, source:`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(page.pageimage.replace(/ /g,'_'))}`, title:page.title, kind:'wikipedia-pageimage' }
        for (const alias of aliases) manifest[alias] = image
        found++
      }
    } catch (error) {
      console.log(`Batch unavailable (${lang}): ${error.message}`)
    }
    done++
    fs.writeFileSync(manifestFile, JSON.stringify(manifest))
    if (done % 10 === 0) console.log(`Pass ${round + 1}: ${done}/${batches.length}; new subjects ${found}; image keys ${Object.keys(manifest).length}`)
  }
  return found
}

async function main() {
  const subjects = queue.slice(0, limit)
  let total = 0
  for (let round = 0; round < 3; round++) total += await runRound(round, subjects)
  console.log(`Finished queued image lookup: ${total} new subjects, ${Object.keys(manifest).length} image keys`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
