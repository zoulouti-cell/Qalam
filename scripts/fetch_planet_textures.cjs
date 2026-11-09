#!/usr/bin/env node
/* Download REAL planet textures (NASA / Solar System Scope, CC BY 4.0)
   into public/assets/<planet>/color.jpg so the app auto-uses them.
   Run on a machine with open network:  node scripts/fetch_planet_textures.cjs   */
const fs = require('node:fs')
const https = require('node:https')
const path = require('node:path')

const ROOT = path.join(__dirname, '..', 'public', 'assets')

// Solar System Scope 2K maps (CC BY 4.0) — stable direct URLs
const SOURCES = {
  earth: 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
  mars: 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
  mercury: 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
  venus: 'https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg',
  jupiter: 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
  saturn: 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
  uranus: 'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg',
  neptune: 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg',
  moon: 'https://www.solarsystemscope.com/textures/download/2k_moon.jpg',
  sun: 'https://www.solarsystemscope.com/textures/download/2k_sun.jpg',
}

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode + ' ' + url))
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    }).on('error', reject)
  })
}

;(async () => {
  for (const [planet, url] of Object.entries(SOURCES)) {
    const dir = path.join(ROOT, planet)
    fs.mkdirSync(dir, { recursive: true })
    const dst = path.join(dir, 'color.jpg')
    try {
      const buf = await get(url)
      if (buf.length < 50000) throw new Error('too small: ' + buf.length)
      fs.writeFileSync(dst, buf)
      console.log('✓', planet, '→', (buf.length / 1024).toFixed(0) + ' KB')
    } catch (e) {
      console.log('✗', planet, '→', e.message)
    }
  }
  console.log('done — refresh the app (the real .jpg now overrides the procedural .png)')
})()
