import { defineConfig, type Plugin } from 'vite'
import { promises as fs, createReadStream, createWriteStream } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { randomUUID } from 'node:crypto'

const ZIM_DIR = path.resolve(import.meta.dirname, 'public', 'zim')
const ZIM_HOSTS = new Set(['download.kiwix.org', 'ftp.fau.de'])

function isTrustedZimUrl(url: URL): boolean {
  return url.protocol === 'https:' && ZIM_HOSTS.has(url.hostname) &&
    (url.port === '' || url.port === '443') && !url.username && !url.password
}

async function fetchTrustedZimUrl(initial: URL, init: RequestInit): Promise<Response> {
  let url = initial
  for (let redirects = 0; redirects <= 5; redirects++) {
    if (!isTrustedZimUrl(url)) throw new Error('untrusted upstream redirect')
    const response = await fetch(url, { ...init, redirect: 'manual' })
    if (![301, 302, 303, 307, 308].includes(response.status)) return response
    const location = response.headers.get('location')
    await response.body?.cancel()
    if (!location || redirects === 5) throw new Error('too many or invalid upstream redirects')
    url = new URL(location, url)
  }
  throw new Error('too many upstream redirects')
}

function parseByteRange(value: string, size: number): { start: number; end: number } | 'ignore' | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim())
  if (!match) return value.includes(',') && value.trim().startsWith('bytes=') ? 'ignore' : null
  const [, first, last] = match
  if (!first && !last) return null
  if (!first) {
    const suffix = Number(last)
    if (!Number.isSafeInteger(suffix) || suffix <= 0 || size === 0) return null
    return { start: Math.max(0, size - suffix), end: size - 1 }
  }
  const start = Number(first)
  const requestedEnd = last ? Number(last) : size - 1
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd) || start >= size || start > requestedEnd) return null
  return { start, end: Math.min(requestedEnd, size - 1) }
}

function zimApi(): Plugin {
  return {
    name: 'zim-api',
    configureServer(server) {
      // 1) List installed ZIM files
      server.middlewares.use('/api/zim-list', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Allow', 'GET')
          res.end('method not allowed')
          return
        }
        try {
          const files = await fs.readdir(ZIM_DIR)
          const list = await Promise.all(
            files
              .filter((f) => f.endsWith('.zim'))
              .map(async (name) => {
                const st = await fs.stat(path.join(ZIM_DIR, name))
                return st.isFile() ? { name, sizeMB: Math.round(st.size / 1048576) } : null
              })
          )
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(list.filter(Boolean)))
        } catch (e) {
          res.statusCode = 500
          res.end(String(e))
        }
      })

      // 2) Stream a ZIM download from the Kiwix CDN into public/zim
      server.middlewares.use('/api/zim-download', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Allow', 'GET')
          res.end('method not allowed')
          return
        }
        let temporaryPath: string | undefined
        const downloadController = new AbortController()
        try {
          const u = new URL(req.url ?? '', 'http://localhost')
          const name = u.searchParams.get('name') ?? ''
          const url = u.searchParams.get('url') ?? ''
          if (!/^[A-Za-z0-9._-]+\.zim$/.test(name)) {
            res.statusCode = 400
            res.end('bad name')
            return
          }
          let upstream: URL
          try {
            upstream = new URL(url)
          } catch {
            res.statusCode = 400
            res.end('bad url')
            return
          }
          if (!isTrustedZimUrl(upstream)) {
            res.statusCode = 400
            res.end('untrusted host')
            return
          }
          const dest = path.join(ZIM_DIR, name)
          const temporary = `${dest}.${randomUUID()}.part`
          temporaryPath = temporary
          const head = await fetchTrustedZimUrl(upstream, { method: 'HEAD' })
          if (!head.ok) {
            res.statusCode = 502
            res.end(`upstream ${head.status}`)
            return
          }
          const total = Number(head.headers.get('content-length') ?? 0)
          const get = await fetchTrustedZimUrl(upstream, { method: 'GET', signal: downloadController.signal })
          if (!get.ok || !get.body) {
            await get.body?.cancel()
            res.statusCode = 502
            res.end('upstream stream failed')
            return
          }
          res.setHeader('Content-Type', 'application/octet-stream')
          if (total) res.setHeader('Content-Length', String(total))
          const [toClient, toFile] = get.body.tee()
          const transfers = [
            pipeline(Readable.fromWeb(toClient as never), res, { end: false }),
            pipeline(Readable.fromWeb(toFile as never), createWriteStream(temporary, { flags: 'wx' })),
          ]
          try {
            await Promise.all(transfers)
          } catch (error) {
            downloadController.abort(error)
            await Promise.allSettled(transfers)
            throw error
          }
          const completed = await fs.stat(temporary)
          if (total && completed.size !== total) throw new Error(`incomplete download: ${completed.size}/${total}`)
          // Publish the archive only after the whole file has arrived, so partial .zim files never look installed.
          await fs.rename(temporary, dest)
          res.end()
        } catch (e) {
          if (temporaryPath) await fs.rm(temporaryPath, { force: true }).catch(() => undefined)
          if (!res.headersSent) {
            res.statusCode = 500
            res.end(String(e))
          } else res.destroy(e instanceof Error ? e : undefined)
        }
      })

      // 3) Serve /zim/* with HTTP Range support (needed by the Kiwix reader)
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/zim/')) return next()
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.statusCode = 405
          res.setHeader('Allow', 'GET, HEAD')
          res.end('method not allowed')
          return
        }
        let name: string
        try {
          name = decodeURIComponent(req.url.slice(5).split('?')[0])
        } catch {
          res.statusCode = 400
          res.end('bad name')
          return
        }
        if (!/^[A-Za-z0-9._-]+\.zim$/.test(name)) {
          res.statusCode = 400
          res.end('bad name')
          return
        }
        const file = path.join(ZIM_DIR, name)
        fs.stat(file)
          .then((st) => {
            if (!st.isFile()) {
              res.statusCode = 404
              res.end('not found')
              return
            }
            const range = req.headers.range
            res.setHeader('Accept-Ranges', 'bytes')
            res.setHeader('Content-Type', 'application/octet-stream')
            let start = 0
            let end = Math.max(0, st.size - 1)
            if (range) {
              const parsed = parseByteRange(range, st.size)
              if (parsed === null) {
                res.statusCode = 416
                res.setHeader('Content-Range', `bytes */${st.size}`)
                res.end()
                return
              }
              if (parsed !== 'ignore') {
                start = parsed.start
                end = parsed.end
                res.statusCode = 206
                res.setHeader('Content-Range', `bytes ${start}-${end}/${st.size}`)
              }
            }
            const length = st.size === 0 ? 0 : end - start + 1
            res.setHeader('Content-Length', String(length))
            if (req.method === 'HEAD' || length === 0) {
              res.end()
              return
            }
            const stream = createReadStream(file, { start, end })
            stream.on('error', (error) => {
              if (!res.headersSent) {
                res.statusCode = 500
                res.end('file read failed')
              } else res.destroy(error)
            })
            stream.pipe(res)
          })
          .catch((error: NodeJS.ErrnoException) => {
            res.statusCode = error.code === 'ENOENT' ? 404 : 500
            res.end(error.code === 'ENOENT' ? 'not found' : 'file read failed')
          })
      })
    },
    // Keep the offline-library API available in `vite preview` as well as `vite dev`.
    configurePreviewServer(server) {
      const register = zimApi().configureServer as (server: unknown) => void
      register(server)
    },
  }
}

export default defineConfig({
  plugins: [zimApi()],
  base: './',
  build: {
    cssMinify: 'lightningcss',
  },
})
