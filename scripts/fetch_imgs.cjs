// Fetch image candidates from Commons with machine-readable attribution and license metadata.
// Candidates stay outside public/ until a person reviews the image and its rights.
const fs = require('node:fs')
const path = require('node:path')

const OUT = path.join(__dirname, '..', 'media-candidates')
const MANIFEST = path.join(__dirname, '..', 'public', 'assets', 'media-manifest.json')

const TOPICS = [
  { id: 'sun', q: ['Sun surface granulation NASA', 'Sun white'] },
  { id: 'water', q: ['water drop macro', 'droplet water'] },
  { id: 'pyramids', q: ['Giza pyramid complex panorama', 'Great Pyramid of Giza'] },
  { id: 'heart', q: ['human heart anatomy', 'Heart anatomical'] },
  { id: 'africa', q: ['African savanna sunset', 'Serengeti landscape'] },
  { id: 'atom', q: ['Bohr atom model diagram', 'atom illustration'] },
  { id: 'ai', q: ['artificial intelligence robot', 'AI technology'] },
  { id: 'climate', q: ['Earth from space blue marble', 'climate change earth'] },
  { id: 'mars', q: ['Mars planet Valles Marineris', 'planet Mars red'] },
  { id: 'energy', q: ['wind turbines renewable energy', 'solar panels field'] },
]

function plain(meta) {
  return String(meta?.value ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
  } catch {
    return { version: 1, assets: {} }
  }
}

function writeManifest(manifest) {
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true })
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
}

async function findImage(qs) {
  for (const q of qs) {
    const url =
      'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
      encodeURIComponent(`filetype:bitmap ${q}`) +
      '&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1280&format=json&origin=*'
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'QalamEncyclopedia/1.0 (educational app)' } })
      const j = await res.json()
      const pages = j?.query?.pages
      if (!pages) continue
      for (const p of Object.values(pages)) {
        const ii = p.imageinfo?.[0]
        const metadata = ii?.extmetadata ?? {}
        const license = plain(metadata.LicenseShortName) || plain(metadata.UsageTerms)
        const licenseUrl = plain(metadata.LicenseUrl)
        const publicDomain = /public domain|cc0/i.test(license)
        if (ii?.thumburl && ii.descriptionurl && license && (licenseUrl || publicDomain)) {
          return {
            thumbUrl: ii.thumburl,
            originalUrl: ii.url,
            fileTitle: p.title,
            descriptionUrl: ii.descriptionurl,
            artist: plain(metadata.Artist),
            credit: plain(metadata.Credit),
            description: plain(metadata.ImageDescription),
            license,
            licenseUrl,
            attributionRequired: plain(metadata.AttributionRequired),
            retrievedAt: new Date().toISOString(),
          }
        }
      }
    } catch (e) {
      console.log('API ERR', q, e.message)
    }
  }
  return null
}

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const manifest = readManifest()
  manifest.assets ??= {}
  let ok = 0
  for (const t of TOPICS) {
    const dest = path.join(OUT, t.id + '.jpg')
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      const candidate = manifest.assets[t.id]?.candidate
      if (candidate?.sourcePage && candidate?.license) console.log('SKIP (candidate has source metadata)', t.id)
      else console.log('REVIEW (candidate file has no verified credit)', t.id)
      ok++
      continue
    }
    const image = await findImage(t.q)
    if (!image) {
      console.log('MISS (no reusable file with machine-readable license)', t.id)
      continue
    }
    try {
      const res = await fetch(image.thumbUrl, { headers: { 'User-Agent': 'QalamEncyclopedia/1.0' } })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const buf = Buffer.from(await res.arrayBuffer())
      fs.writeFileSync(dest, buf)
      const asset = manifest.assets[t.id] ?? { id: t.id, reviewStatus: 'current-app-image-needs-source-review' }
      asset.candidate = {
        file: `media-candidates/${t.id}.jpg`,
        sourcePage: image.descriptionUrl,
        originalUrl: image.originalUrl,
        fileTitle: image.fileTitle,
        artist: image.artist,
        credit: image.credit,
        description: image.description,
        license: image.license,
        licenseUrl: image.licenseUrl,
        attributionRequired: image.attributionRequired,
        retrievedAt: image.retrievedAt,
        reviewStatus: 'candidate-not-approved-for-publication',
      }
      manifest.assets[t.id] = asset
      writeManifest(manifest)
      console.log('OK', t.id, (buf.length / 1024).toFixed(0) + ' KB', image.descriptionUrl)
      ok++
    } catch (e) {
      console.log('FAIL', t.id, e.message)
    }
  }
  writeManifest(manifest)
  console.log('DONE', ok + '/' + TOPICS.length)
})()
