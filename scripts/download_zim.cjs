const fs = require('node:fs')
const path = require('node:path')
const [, , url, dest] = process.argv

;(async () => {
  let existing = 0
  try {
    existing = fs.statSync(dest).size
  } catch {
    /* fresh download */
  }
  if (existing > 0) console.log(`[resume] continuing ${path.basename(dest)} from ${(existing / 1048576).toFixed(1)} MB`)

  const res = await fetch(url, {
    redirect: 'follow',
    headers: existing > 0 ? { Range: `bytes=${existing}-` } : {},
  })
  if (!res.ok && res.status !== 206) {
    console.error('HTTP', res.status)
    process.exit(1)
  }

  const resuming = res.status === 206
  const total = resuming ? existing + Number(res.headers.get('content-length') || 0) : Number(res.headers.get('content-length') || 0)
  const ws = fs.createWriteStream(dest, { flags: resuming ? 'a' : 'w' })
  let got = existing
  let logged = existing
  const reader = res.body.getReader()
  const started = Date.now()

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    got += value.length
    if (!ws.write(Buffer.from(value))) await new Promise((r) => ws.once('drain', r))
    if (total && got - logged >= 20 * 1048576) {
      logged = got
      const s = (Date.now() - started) / 1000
      console.log(
        `[${path.basename(dest)}] ${(got / 1048576).toFixed(1)} / ${(total / 1048576).toFixed(0)} MB (${((got / total) * 100).toFixed(1)}%) ${((got - existing) / 1048576 / s).toFixed(2)} MB/s`
      )
    }
  }
  await new Promise((r) => ws.end(r))
  console.log('DONE', path.basename(dest), (got / 1048576).toFixed(1), 'MB')
})().catch((e) => {
  console.error('FAIL', e.message)
  process.exit(1)
})
