import { useEffect, useRef, useState } from 'react'
import type { Lang } from './i18n'
import type { Article } from './data'
import { contentOf } from './content'

type Props = {
  articles: Article[]
  lang: Lang
  query: string
  onOpen: (id: string) => void
}

type Node = {
  id: string
  x: number
  y: number
  cat: string
  title: string
  phase: number
  r: number
}

const CAT_COLORS = [
  '#d5ad56', // gold
  '#7fb9a3', // sage
  '#9ec2d4', // sky
  '#e0b0a0', // clay
  '#c3b7dc', // lavender
  '#a9c58f', // moss
  '#e6c98c', // sand
  '#8fb0d6', // periwinkle
]

function hash(s: string): number {
  let h = 7
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/** Deterministic cluster layout: categories on a ring, nodes on golden-angle spirals. */
function layout(articles: Article[], lang: Lang): { nodes: Node[]; cats: string[] } {
  const byCat = new Map<string, Article[]>()
  for (const a of articles) {
    const cat = a.cat?.[lang] || a.cat?.ar || '—'
    if (!byCat.has(cat)) byCat.set(cat, [])
    byCat.get(cat)!.push(a)
  }
  const cats = [...byCat.keys()]
  const nodes: Node[] = []
  const MAXNODES = 720
  const worldR = 620
  const GOLDEN = Math.PI * (3 - Math.sqrt(5))
  cats.forEach((cat, ci) => {
    const angle = (ci / cats.length) * Math.PI * 2 - Math.PI / 2
    const cx = Math.cos(angle) * worldR
    const cy = Math.sin(angle) * worldR
    const list = byCat.get(cat)!.slice(0, 60)
    const inner = 36 + Math.sqrt(list.length) * 26
    list.forEach((a, i) => {
      if (nodes.length >= MAXNODES) return
      const t = i + 0.5
      const r = Math.max(8, (Math.sqrt(t) / Math.sqrt(list.length)) * inner)
      const th = t * GOLDEN + (hash(a.id) % 100) / 100
      const jx = ((hash(a.id + 'x') % 1000) / 1000 - 0.5) * 8
      const jy = ((hash(a.id + 'y') % 1000) / 1000 - 0.5) * 8
      if (nodes.length >= MAXNODES) return
      nodes.push({
        id: a.id,
        x: cx + Math.cos(th) * r + jx,
        y: cy + Math.sin(th) * r + jy,
        cat,
        title: contentOf(a, lang).title,
        phase: (hash(a.id + 'p') % 1000) / 1000 * Math.PI * 2,
        r: 1.6 + ((hash(a.id + 'r') % 100) / 100) * 1.4,
      })
    })
  })
  return { nodes, cats }
}

export default function KnowledgeSky({ articles, lang, query, onOpen }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [hover, setHover] = useState<{ x: number; y: number; title: string } | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { nodes, cats } = layout(articles, lang)
    const catColor = new Map<string, string>()
    cats.forEach((c, i) => catColor.set(c, CAT_COLORS[i % CAT_COLORS.length]))

    let W = 0
    let H = 0
    let dpr = 1
    let raf = 0
    let t0 = performance.now()

    // view transform
    let scale = 0.62
    let ox = 0
    let oy = 0
    let dragging = false
    let lastX = 0
    let lastY = 0

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = rect.width
      H = Math.max(460, rect.height)
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const toScreen = (x: number, y: number) => ({
      sx: W / 2 + (x + ox) * scale,
      sy: H / 2 + (y + oy) * scale,
    })

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      // throttle to ~30fps on large sets to keep the page light
      if (nodes.length > 700 && (now - t0) % 2 < 1) return
      const t = (now - t0) / 1000
      ctx.clearRect(0, 0, W, H)

      // ambient glow
      const g = ctx.createRadialGradient(W * 0.5, H * 0.45, 10, W * 0.5, H * 0.45, Math.max(W, H) * 0.75)
      g.addColorStop(0, 'rgba(18,63,53,0.16)')
      g.addColorStop(0.5, 'rgba(18,63,53,0.06)')
      g.addColorStop(1, 'rgba(18,63,53,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      // faint zellige rings around cluster centers (from node spread)
      const q = (query || '').normalize('NFKD').toLowerCase()
      for (const n of nodes) {
        const { sx, sy } = toScreen(n.x, n.y)
        if (sx < -40 || sy < -40 || sx > W + 40 || sy > H + 40) continue
        const color = catColor.get(n.cat) || '#d5ad56'
        const tw = 0.55 + 0.45 * Math.sin(t * 1.1 + n.phase)
        const matched = !q || n.title.toLowerCase().includes(q)
        const alpha = matched ? tw : 0.12
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.globalAlpha = alpha
        ctx.arc(sx, sy, Math.max(1.1, n.r * (0.8 + 0.5 * scale) * (matched ? 1 : 0.7)), 0, Math.PI * 2)
        ctx.fill()
        // glow for stronger nodes
        if (n.r > 2.4 && scale > 0.5) {
          ctx.globalAlpha = alpha * 0.25
          ctx.beginPath()
          ctx.arc(sx, sy, n.r * 3.4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    // interactions
    const pick = (px: number, py: number) => {
      let best: Node | null = null
      let bestD = 22 * 22
      for (const n of nodes) {
        const { sx, sy } = toScreen(n.x, n.y)
        const d = (sx - px) * (sx - px) + (sy - py) * (sy - py)
        if (d < bestD) {
          bestD = d
          best = n
        }
      }
      return best
    }

    const onDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (dragging) {
        ox += (e.clientX - lastX) / scale
        oy += (e.clientY - lastY) / scale
        lastX = e.clientX
        lastY = e.clientY
        return
      }
      const rect = canvas.getBoundingClientRect()
      const n = pick(e.clientX - rect.left, e.clientY - rect.top)
      if (n) setHover({ x: e.clientX, y: e.clientY, title: n.title })
      else setHover(null)
    }
    const onUp = () => {
      dragging = false
    }
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const n = pick(e.clientX - rect.left, e.clientY - rect.top)
      if (n) onOpen(n.id)
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const wx = (mx - W / 2) / scale - ox
      const wy = (my - H / 2) / scale - oy
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
      scale = Math.min(4, Math.max(0.22, scale * factor))
      ox = (mx - W / 2) / scale - wx
      oy = (my - H / 2) / scale - wy
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointerleave', onUp)
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    setReady(true)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerleave', onUp)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('wheel', onWheel)
    }
  }, [articles, lang, query, onOpen])

  return (
    <div className="sky-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} className="sky-canvas" aria-label="Knowledge sky" />
      {!ready && <div className="sky-loading">…</div>}
      {hover && (
        <div className="sky-tooltip" style={{ left: hover.x + 14, top: hover.y + 14 }}>
          {hover.title}
        </div>
      )}
      <div className="sky-hint">
        {lang === 'ar' ? 'اسحب للتحريك • عجلة الفأرة للتكبير • انقر نجمًا ليُفتح' : lang === 'fr' ? 'Glissez • Molette pour zoomer • Cliquez une étoile' : 'Drag • Wheel to zoom • Click a star'}
      </div>
    </div>
  )
}
