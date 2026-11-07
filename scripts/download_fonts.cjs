// Download Google Fonts woff2 files locally for offline use.
const fs = require('node:fs')
const path = require('node:path')

const CSS_URL =
  process.argv[2] ||
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;700&family=Playfair+Display:wght@600;800&display=swap'

const outDir = path.join(__dirname, '..', 'public', 'fonts')

;(async () => {
  fs.mkdirSync(outDir, { recursive: true })
  const cssRes = await fetch(CSS_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' },
  })
  const css = await cssRes.text()
  // extract each @font-face block: family, weight, url
  const blocks = [...css.matchAll(/\/\* ([a-z-]+) \*\/\s*@font-face\s*\{([^}]+)\}/g)]
  let count = 0
  for (const [, subset, body] of blocks) {
    const fam = (body.match(/font-family:\s*'([^']+)'/) || [])[1] || ''
    const weight = (body.match(/font-weight:\s*(\d+)/) || [])[1] || '400'
    const url = (body.match(/url\((https:[^)]+)\)/) || [])[1]
    if (!url) continue
    const name = `${fam.replace(/\s+/g, '')}-${weight}${subset === 'latin' ? '' : '-' + subset}.woff2`
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const buf = Buffer.from(await res.arrayBuffer())
      fs.writeFileSync(path.join(outDir, name), buf)
      console.log('OK', name, buf.length, 'bytes')
      count++
    } catch (e) {
      console.log('SKIP', name, e.message)
    }
  }
  console.log('FONT BLOCKS:', blocks.length, '| downloaded:', count)
  if (count === 0) {
    console.log('--- CSS sample ---')
    console.log(css.slice(0, 1500))
  }
})()
