import Mi from './Mi'
import { useEffect, useMemo, useRef, useState } from 'react'
import type * as THREE from 'three'
import type { Lang } from './i18n'
import { publicUrl } from './publicUrl'
import { COSMOS_BODIES, COSMOS_TRAIL, bodyById, type BodyId, type CosmosBody } from './cosmosData'
import { COSMOS_ANNOTATIONS } from './cosmosAnnotations'
import './cosmos.css'

/* ============================================================
   Cosmos Explorer — academic register (15+).
   Unified 3D view from nebula → planets → galaxies → comets →
   black holes → dark matter, with mass data + cinematic tour.
   ============================================================ */

const T = {
  ar: {
    title: 'نافذة الكون', sub: 'من السديم إلى المادة المظلمة — مجسمات ثلاثية الأبعاد وبيانات فيزيائية.',
    solar: 'المجموعة الشمسية', trail: 'المسار الكوني', hint: 'اسحب للدوران · عجلة للتقريب',
    rotate: 'دوران', reset: 'إعادة ضبط', pause: 'إيقاف', play: 'تشغيل', labels: 'الشروح', tour: 'جولة سينمائية', stopTour: 'إيقاف الجولة',
    mass: 'الكتلة', radius: 'نصف القطر', temp: 'الحرارة', distance: 'البعد', density: 'الكثافة',
    loading: 'جارٍ البناء…', error: 'تعذّر تشغيل ثلاثية الأبعاد', academic: 'محتوى أكاديمي · +15',
    dmTitle: 'نموذج المادة المظلمة', dmNote: 'الهالة البنفسجية تمثل المادة المظلمة (غير مرئية)؛ القرص المضيء هو المادة المرئية.',
    curve: 'منحنى الدوران', velocity: 'السرعة', radiusAx: 'المسافة من المركز', observed: 'المرصود (مسطح)', visible: 'المرئي فقط',
  },
  fr: {
    title: 'Fenêtre sur l’Univers', sub: 'De la nébuleuse à la matière noire — modèles 3D et données physiques.',
    solar: 'Système solaire', trail: 'Parcours cosmique', hint: 'Glissez pour tourner · molette pour zoomer',
    rotate: 'Rotation', reset: 'Réinitialiser', pause: 'Pause', play: 'Lecture', labels: 'Légendes', tour: 'Visite guidée', stopTour: 'Arrêter',
    mass: 'Masse', radius: 'Rayon', temp: 'Température', distance: 'Distance', density: 'Densité',
    loading: 'Construction…', error: '3D indisponible', academic: 'Contenu académique · +15',
    dmTitle: 'Modèle de matière noire', dmNote: 'Le halo violet représente la matière noire (invisible) ; le disque lumineux est la matière visible.',
    curve: 'Courbe de rotation', velocity: 'Vitesse', radiusAx: 'Distance au centre', observed: 'Observé (plat)', visible: 'Visible seul',
  },
  en: {
    title: 'Cosmos Window', sub: 'From the nebula to dark matter — 3D models and physical data.',
    solar: 'Solar System', trail: 'Cosmic trail', hint: 'Drag to rotate · wheel to zoom',
    rotate: 'Rotate', reset: 'Reset', pause: 'Pause', play: 'Play', labels: 'Labels', tour: 'Cinematic tour', stopTour: 'Stop',
    mass: 'Mass', radius: 'Radius', temp: 'Temperature', distance: 'Distance', density: 'Density',
    loading: 'Building…', error: '3D unavailable', academic: 'Academic content · 15+',
    dmTitle: 'Dark matter model', dmNote: 'The purple halo represents dark matter (invisible); the glowing disk is visible matter.',
    curve: 'Rotation curve', velocity: 'Velocity', radiusAx: 'Distance from centre', observed: 'Observed (flat)', visible: 'Visible only',
  },
} as const

function mulberry32(seed: number) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

function sphereTexture(body: CosmosBody): HTMLCanvasElement {
  const W = 512, H = 256
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  const pal = body.palette.map((x) => [parseInt(x.slice(1, 3), 16), parseInt(x.slice(3, 5), 16), parseInt(x.slice(5, 7), 16)])
  const rng = mulberry32(body.id.length * 7919 + 7)
  for (let y = 0; y < H; y++) {
    const k = y / H
    const band = (body.kind === 'gasGiant' || body.kind === 'iceGiant') ? Math.sin(k * Math.PI * (body.kind === 'gasGiant' ? 7 : 4)) * 0.5 + 0.5 : 1 - Math.abs(k - 0.5) * 0.4
    const f = band * (pal.length - 1)
    const i0 = Math.floor(f)
    const i1 = Math.min(pal.length - 1, Math.ceil(f))
    const kk = f - i0
    const base = [0, 1, 2].map((ch) => Math.round(pal[i0][ch] + (pal[i1][ch] - pal[i0][ch]) * kk))
    for (let x = 0; x < W; x++) {
      const noise = (rng() - 0.5) * 14
      ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, base[0] + noise))},${Math.max(0, Math.min(255, base[1] + noise))},${Math.max(0, Math.min(255, base[2] + noise))})`
      ctx.fillRect(x, y, 1, 1)
    }
  }
  if (body.greatSpot) { ctx.fillStyle = '#c65f3d'; ctx.beginPath(); ctx.ellipse(W * 0.68, H * 0.62, W * 0.08, H * 0.05, 0, 0, Math.PI * 2); ctx.fill() }
  if (body.kind === 'rocky' || body.kind === 'moon') { for (let i = 0; i < 220; i++) { const cx = rng() * W, cy = rng() * H, r = 1 + rng() * 4; ctx.strokeStyle = 'rgba(30,24,20,0.35)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke() } }
  if (body.polarCaps || body.id === 'earth') { ctx.fillStyle = '#f4f8ff'; ctx.fillRect(0, 0, W, H * 0.06); ctx.fillRect(0, H * 0.94, W, H * 0.06) }
  return c
}

function makeGlow(THREE: typeof import('three'), inner: string, outer: string): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, inner); g.addColorStop(0.4, outer); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c); return t
}

function brightenOceans(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!
  const d = ctx.getImageData(0, 0, c.width, c.height)
  const px = d.data
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2]
    if (b > r && b >= g) { // blue-dominant => ocean
      px[i] = Math.min(255, r * 1.6)
      px[i + 1] = Math.min(255, g * 1.6 + 12)
      px[i + 2] = Math.min(255, b * 1.5 + 24)
    }
  }
  ctx.putImageData(d, 0, 0)
}

function sunTexture(W = 1024, H = 512): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const g = 200 + Math.random() * 55
    ctx.fillStyle = 'rgb(' + Math.min(255, g + 45) + ',' + Math.min(255, g + 12) + ',' + Math.max(0, g - 110) + ')'
    ctx.fillRect(x, y, 1, 1)
  }
  const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, W / 2)
  grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(0.8, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(120,60,0,0.55)')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)
  return c
}

function nebulaTexture(S = 512): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = S; c.height = S
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, S, S)
  const blobs: [string, number, number, number][] = [['#8f5bd8', 0.5, 0.5, 0.85], ['#d85b7d', 0.72, 0.32, 0.75], ['#3f8fd8', 0.3, 0.68, 0.65], ['#f3d17e', 0.5, 0.5, 0.4]]
  ctx.globalCompositeOperation = 'screen'
  for (const [col, x, y, r] of blobs) {
    const g = ctx.createRadialGradient(x * S, y * S, 0, x * S, y * S, r * S)
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S)
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = 'rgba(5,6,10,0.75)'
  for (let i = 0; i < 5; i++) {
    ctx.save(); ctx.translate(S * (0.2 + Math.random() * 0.6), S * 0.5); ctx.rotate((Math.random() - 0.5) * 0.6)
    ctx.fillRect(-S * 0.02, -S * 0.3, S * 0.04, S * 0.6); ctx.restore()
  }
  for (let i = 0; i < 140; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = Math.random() * 1.5
    ctx.fillStyle = 'rgba(255,255,255,' + (0.4 + Math.random() * 0.6) + ')'
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }
  return c
}

function pointsCloud(THREE: typeof import('three'), count: number, gen: (i: number) => [number, number, number, string], size = 0.05): THREE.Points {
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) { const [x, y, z, hex] = gen(i); pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; const cc = new THREE.Color(hex); col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return new THREE.Points(g, new THREE.PointsMaterial({ size, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }))
}

export default function CosmosExplorer({ lang }: { lang: Lang }) {
  const [selected, setSelected] = useState<BodyId>('sun')
  const ui = T[lang]
  const body = bodyById(selected)!

  const groups = useMemo(() => {
    const g: Record<CosmosBody['group'], CosmosBody[]> = { solar: [], deep: [], cosmic: [] }
    COSMOS_BODIES.forEach((b) => g[b.group].push(b))
    return g
  }, [])

  const solarOrder: BodyId[] = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

  return (
    <div className="cosmos">
      <header className="cosmos-head">
        <div>
          <h1>{ui.title}</h1>
          <p>{ui.sub}</p>

        </div>
        <a className="cosmos-mars-link" href="#/mars">
          <Mi name="view_in_ar"/>
          {lang === 'ar' ? 'تجربة المريخ التفاعلية' : lang === 'fr' ? 'Mars interactif' : 'Interactive Mars'}
        </a>
      </header>

      <div className="cosmos-trail">
        <span className="cosmos-trail-label">{ui.trail}</span>
        {COSMOS_TRAIL.map((id) => {
          const b = bodyById(id)!
          return <button key={id} className={selected === id ? 'active' : ''} aria-pressed={selected === id} onClick={() => setSelected(id)}>{b.title[lang]}</button>
        })}
      </div>

      <div className="cosmos-main">
        <div className="cosmos-stage">
          <CosmosCanvas key={selected} bodyId={selected} lang={lang} />
        </div>

        <aside className="cosmos-panel">
          <h2>{body.title[lang]}</h2>
          <p className="cosmos-sub">{body.subtitle[lang]}</p>
          <dl className="cosmos-data">
            <div><dt>{ui.mass}</dt><dd>{body.mass[lang]}</dd></div>
            <div><dt>{ui.radius}</dt><dd>{body.radius[lang]}</dd></div>
            <div><dt>{ui.temp}</dt><dd>{body.temp[lang]}</dd></div>
            {body.distance && <div><dt>{ui.distance}</dt><dd>{body.distance[lang]}</dd></div>}
            {body.density && <div><dt>{ui.density}</dt><dd>{body.density[lang]}</dd></div>}
          </dl>
          <p className="cosmos-facts">{body.facts[lang]}</p>
          {body.id === 'darkmatter' && (
            <div className="dm-panel">
              <h3>{ui.dmTitle}</h3>
              <p>{ui.dmNote}</p>
              <svg viewBox="0 0 220 120" className="dm-curve" role="img" aria-label={ui.curve}>
                <line x1="20" y1="100" x2="20" y2="10" stroke="#8899bb" strokeWidth="1" />
                <line x1="20" y1="100" x2="210" y2="100" stroke="#8899bb" strokeWidth="1" />
                <text x="4" y="16" className="dm-tick">{ui.velocity}</text>
                <text x="140" y="116" className="dm-tick">{ui.radiusAx}</text>
                <path d="M20 100 C 70 98 120 96 200 95" fill="none" stroke="#f3d17e" strokeWidth="2" />
                <path d="M20 100 C 40 70 60 40 90 24 C 120 14 160 12 200 12" fill="none" stroke="#7a5bd8" strokeWidth="2" strokeDasharray="4 4" />
                <text x="140" y="86" fill="#f3d17e" fontSize="8">{ui.observed}</text>
                <text x="110" y="16" fill="#7a5bd8" fontSize="8">{ui.visible}</text>
              </svg>
            </div>
          )}
        </aside>
      </div>

      <section className="cosmos-solar">
        <h2>{ui.solar}</h2>
        <div className="solar-map" role="group" aria-label={ui.solar}>
          {solarOrder.map((id, i) => {
            const b = bodyById(id)!
            return (
              <button key={id} className={selected === id ? 'active' : ''} style={{ order: i }} aria-pressed={selected === id} onClick={() => setSelected(id)}>
                <span className="solar-dot" style={{ background: b.palette[0] }} />
                <span className="solar-name">{b.title[lang]}</span>
              </button>
            )
          })}
        </div>
      </section>

      <div className="cosmos-groups">
        <h3>{ui.trail}</h3>
        {(['deep', 'cosmic'] as const).map((g) => (
          <div key={g} className="cosmos-group">
            {groups[g].map((b) => (
              <button key={b.id} className={selected === b.id ? 'active' : ''} onClick={() => setSelected(b.id)}>{b.title[lang]}</button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function CosmosCanvas({ bodyId, lang }: { bodyId: BodyId; lang: Lang }) {
  const host = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [tour, setTour] = useState(false)
  const [paused, setPaused] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const pausedRef = useRef(false)
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  const ctrlRef = useRef<{ reset: () => void } | null>(null)
  const tourRef = useRef({ active: false, t: 0 })
  const ui = T[lang]
  const anns = COSMOS_ANNOTATIONS[bodyId] || []

  useEffect(() => {
    let disposed = false
    let cleanup: (() => void) | undefined
    ;(async () => {
      try {
        const THREE = await import('three')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
        if (disposed || !host.current) return
        const mount = host.current
        const W = mount.clientWidth || 640
        const H = Math.max(430, Math.round(W * 0.72))
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200)
        camera.position.set(0, 1.3, 5.2)
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setSize(W, H)
        renderer.toneMapping = THREE.NoToneMapping
        mount.appendChild(renderer.domElement)
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true; controls.dampingFactor = 0.06; controls.minDistance = 1.8; controls.maxDistance = 14; controls.enablePan = false
        controls.autoRotate = true; controls.autoRotateSpeed = 0.7

        const starGeo = new THREE.BufferGeometry(); const sp = new Float32Array(700 * 3)
        for (let i = 0; i < 700; i++) { const th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 2 - 1), r = 30 + Math.random() * 40; sp[i * 3] = r * Math.sin(ph) * Math.cos(th); sp[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); sp[i * 3 + 2] = r * Math.cos(ph) }
        starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
        const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xdfe9ff, size: 0.06, transparent: true, opacity: 0.8, sizeAttenuation: true }))
        scene.add(stars)
        const sun = new THREE.DirectionalLight(0xfff2df, 3.4); sun.position.set(6, 3, 5); scene.add(sun)
        scene.add(new THREE.AmbientLight(0xffffff, 0.95))
        scene.add(new THREE.DirectionalLight(0xffffff, 0.6).translateX(-3).translateY(-1).translateZ(-2))

        const body = bodyById(bodyId)!
        const MAP_DIRS: Record<string, string> = { mars: 'assets/mars', earth: 'assets/earth', moon: 'assets/moon', mercury: 'assets/mercury', venus: 'assets/venus', jupiter: 'assets/jupiter', saturn: 'assets/saturn', uranus: 'assets/uranus', neptune: 'assets/neptune' }
        const MAP_DIR = MAP_DIRS[body.id] || null
        const loadCanvas = (name: string) => new Promise<HTMLCanvasElement>((res, rej) => {
          const im = new Image(); im.crossOrigin = 'anonymous'
          im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d')!.drawImage(im, 0, 0); res(c) }
          im.onerror = rej
          im.src = publicUrl(name)
        })
        const loadFirst = (names: string[]) => new Promise<HTMLCanvasElement>((res, rej) => {
          const next = (i: number) => { if (i >= names.length) return rej(new Error('missing')); loadCanvas(names[i]).then(res).catch(() => next(i + 1)) }
          next(0)
        })
        let preColor: HTMLCanvasElement | null = null
        let preElev: HTMLCanvasElement | null = null
        if (MAP_DIR) {
          try {
            preColor = await loadFirst([MAP_DIR + '/color.jpg', MAP_DIR + '/color.png'])
            if (body.id === 'earth') brightenOceans(preColor)
            if (body.id === 'mars') { try { preElev = await loadCanvas(MAP_DIR + '/elevation.png') } catch {} }
          } catch {}
        }
        const root = new THREE.Group(); scene.add(root)
        const disposables: { dispose: () => void }[] = []
        let planetMesh: THREE.Mesh | null = null

        if (body.kind === 'nebula') {
          const nebTex = new THREE.CanvasTexture(nebulaTexture()); disposables.push(nebTex)
          const gas = new THREE.Sprite(new THREE.SpriteMaterial({ map: nebTex, transparent: true, opacity: 0.85, depthWrite: false }))
          gas.scale.set(4.2, 4.2, 1); root.add(gas)
          root.add(pointsCloud(THREE, 900, (i) => { const th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 2 - 1), r = 0.5 + Math.random() * 1.9; return [r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.7, r * Math.cos(ph), ['#f3d17e', '#9fc2ff', '#ffffff'][i % 3]] }, 0.05))
          const cluster = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlow(THREE, '#fff2d0', '#f3d17e'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
          cluster.scale.set(0.9, 0.9, 1); root.add(cluster)
        } else if (body.kind === 'galaxy') {
          const bulge = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlow(THREE, '#fff6df', '#ffd98a'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
          bulge.scale.set(0.7, 0.7, 1); root.add(bulge)
          root.add(pointsCloud(THREE, 3200, () => {
            const a = Math.random() * Math.PI * 2, r = Math.random() * 2.4
            const arm = Math.sin(Math.log(r * 4 + 1) * 2.4 + a) * 0.55
            const th = a + arm
            const dust = Math.random() < 0.32
            const col = dust ? '#3a2a1a' : (Math.random() < 0.5 ? '#9fc2ff' : '#ffe2b8')
            return [r * Math.cos(th), r * Math.sin(th) * 0.16, r * Math.sin(th), col]
          }, 0.045))
        } else if (body.kind === 'comet') {
          const coma = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlow(THREE, '#ffffff', '#8fd4ff'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
          coma.scale.set(1.0, 1.0, 1); root.add(coma)
          root.add(new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 16), new THREE.MeshStandardMaterial({ color: 0xd7e6f0, roughness: 0.5 })))
          // ion tail: straight, blue, pointing away from the Sun (-X)
          root.add(pointsCloud(THREE, 1600, (i) => { const k = i / 1600; return [-0.3 - k * 4.5, (Math.random() - 0.5) * (0.04 + k * 0.10), (Math.random() - 0.5) * (0.04 + k * 0.10), i % 2 ? '#8fd4ff' : '#5aa8d0'] }, 0.03))
          // dust tail: curved, yellowish
          root.add(pointsCloud(THREE, 1300, (i) => { const k = i / 1300; const curve = k * k * 1.2; return [-0.3 - k * 3.2, curve + (Math.random() - 0.5) * (0.08 + k * 0.25), (Math.random() - 0.5) * (0.06 + k * 0.2), i % 2 ? '#ffe2b8' : '#d8cfa0'] }, 0.035))
        } else if (body.kind === 'blackhole') {
          const shadow = new THREE.Mesh(new THREE.SphereGeometry(0.6, 48, 32), new THREE.MeshBasicMaterial({ color: 0x000000 }))
          root.add(shadow)
          const diskCanvas = document.createElement('canvas'); diskCanvas.width = 512; diskCanvas.height = 512
          const dc = diskCanvas.getContext('2d')!
          const dg = dc.createRadialGradient(256, 256, 18, 256, 256, 256)
          dg.addColorStop(0, 'rgba(0,0,0,0)')
          dg.addColorStop(0.22, '#ffd98a')
          dg.addColorStop(0.5, '#ff8a3d')
          dg.addColorStop(1, 'rgba(0,0,0,0)')
          dc.fillStyle = dg; dc.fillRect(0, 0, 512, 512)
          const diskTex = new THREE.CanvasTexture(diskCanvas); disposables.push(diskTex)
          const disk = new THREE.Mesh(new THREE.RingGeometry(0.7, 2.0, 128), new THREE.MeshBasicMaterial({ map: diskTex, side: THREE.DoubleSide, transparent: true, depthWrite: false }))
          disk.rotation.x = Math.PI / 2.6; root.add(disk)
          const photonRing = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.02, 8, 160), new THREE.MeshBasicMaterial({ color: 0xffd98a }))
          photonRing.rotation.x = Math.PI / 2; root.add(photonRing)
          // Doppler beaming: brighter on the approaching side
          const beam = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlow(THREE, '#fff6df', '#ff9d3d'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
          beam.scale.set(0.8, 0.8, 1); beam.position.set(1.25, 0, 0); root.add(beam)
        } else if (body.kind === 'darkmatter') {
          const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlow(THREE, '#fff6df', '#ffe2b8'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
          core.scale.set(0.9, 0.9, 1); root.add(core)
          root.add(pointsCloud(THREE, 1600, (i) => { const a = Math.random() * Math.PI * 2, r = Math.random() * 1.6; return [r * Math.cos(a), r * Math.sin(a) * 0.12, r * Math.sin(a), i % 2 ? '#9fc2ff' : '#ffe2b8'] }, 0.04))
          root.add(pointsCloud(THREE, 2400, (i) => { const th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 2 - 1), r = 2.2 + Math.pow(Math.random(), 0.5) * 2.6; return [r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.7, r * Math.cos(ph), i % 3 ? '#7a5bd8' : '#4a2f8a'] }, 0.05))
        } else {
          const colorCanvas = preColor || (body.kind === 'star' ? sunTexture() : sphereTexture(body))
          const tex = new THREE.CanvasTexture(colorCanvas); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = THREE.RepeatWrapping; disposables.push(tex)
          let mat: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial
          if (body.kind === 'star') {
            mat = new THREE.MeshBasicMaterial({ map: tex })
          } else {
            mat = new THREE.MeshStandardMaterial({ map: tex, roughness: (body.kind === 'gasGiant' || body.kind === 'iceGiant') ? 0.5 : 0.95, metalness: 0 })
            if (preElev) { const bumpTex = new THREE.CanvasTexture(preElev); bumpTex.wrapS = THREE.RepeatWrapping; disposables.push(bumpTex); (mat as THREE.MeshStandardMaterial).bumpMap = bumpTex; (mat as THREE.MeshStandardMaterial).bumpScale = 0.03 }
          }
          const r = body.kind === 'star' ? 1.9 : 1.4
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 96, 64), mat)
          root.add(mesh)
          planetMesh = mesh
          if (body.kind === 'star') { const c = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlow(THREE, '#fff6df', '#ffb347'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); c.scale.set(5, 5, 1); root.add(c) }
          if (body.rings) {
            const bands: [number, number, string, number][] = [
              [1.8, 2.0, '#b7a06a', 0.5],
              [2.05, 2.55, '#e8d9a8', 0.7],
              [2.6, 2.75, '#cbb57e', 0.35],
              [2.8, 3.2, '#d8cfa0', 0.5],
            ]
            bands.forEach(([ri, ro, c, o]) => {
              const ring = new THREE.Mesh(new THREE.RingGeometry(ri, ro, 128), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, transparent: true, opacity: o }))
              ring.rotation.x = Math.PI / 2.4
              root.add(ring)
            })
          }
          if (body.kind === 'rocky' || body.kind === 'gasGiant' || body.kind === 'iceGiant') { const atmo = new THREE.Mesh(new THREE.SphereGeometry(r + 0.04, 64, 48), new THREE.MeshBasicMaterial({ color: 0x9fc2ff, transparent: true, opacity: body.id === 'earth' ? 0.04 : 0.08, side: THREE.BackSide })); root.add(atmo) }
        }

        const markers: { obj: THREE.Object3D; sphere: boolean }[] = []
        const sphereGeo = planetMesh ? (planetMesh.geometry as THREE.BufferGeometry) : null
        anns.forEach((a) => {
          const obj = new THREE.Object3D()
          let onSphere = false
          if (a.xyz) { obj.position.set(a.xyz[0], a.xyz[1], a.xyz[2]) }
          else if (a.lat !== undefined && a.lon !== undefined && sphereGeo) {
            // place the marker on the exact surface vertex matching the texture UV,
            // so the label always aligns with the real geography
            const posAttr = sphereGeo.attributes.position as THREE.BufferAttribute
            const uvAttr = sphereGeo.attributes.uv as THREE.BufferAttribute
            const lonCenter = body.id === 'earth' || body.id === 'moon'
            const u = ((((a.lon + (lonCenter ? 180 : 0)) % 360) + 360) % 360) / 360
            const v = (a.lat + 90) / 180
            let best = -1, bestD = Infinity
            for (let i = 0; i < posAttr.count; i++) {
              const uu = uvAttr.getX(i), vv = uvAttr.getY(i)
              let du = uu - u
              if (du > 0.5) du -= 1
              if (du < -0.5) du += 1
              const d = du * du + (vv - v) * (vv - v)
              if (d < bestD) { bestD = d; best = i }
            }
            if (best >= 0) obj.position.fromBufferAttribute(posAttr, best)
            onSphere = true
          }
          root.add(obj)
          markers.push({ obj, sphere: onSphere })
        })

        // Earth clouds + blue atmosphere
        if (body.id === 'earth') {
          const cloudCanvas = document.createElement('canvas'); cloudCanvas.width = 512; cloudCanvas.height = 256
          const cc = cloudCanvas.getContext('2d')!
          cc.fillStyle = 'rgba(0,0,0,0)'; cc.fillRect(0, 0, 512, 256)
          for (let i = 0; i < 1800; i++) {
            const x = Math.random() * 512, y = Math.random() * 256, r = 2 + Math.random() * 14
            cc.fillStyle = 'rgba(255,255,255,' + (0.05 + Math.random() * 0.10) + ')'
            cc.beginPath(); cc.ellipse(x, y, r, r * 0.4, Math.random() * 3, 0, Math.PI * 2); cc.fill()
          }
          const cloudTex = new THREE.CanvasTexture(cloudCanvas); cloudTex.wrapS = THREE.RepeatWrapping
          const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.42, 64, 48), new THREE.MeshStandardMaterial({ map: cloudTex, transparent: true, opacity: 0.3, depthWrite: false, roughness: 1 }))
          root.add(clouds); disposables.push(cloudTex)
        }

        setStatus('ready')
        const clock = new THREE.Clock()
        let raf = 0
        const proj = new THREE.Vector3()
        const world = new THREE.Vector3()
        const normal = new THREE.Vector3()
        const loop = () => {
          raf = requestAnimationFrame(loop)
          const t = clock.getElapsedTime()
          if (!pausedRef.current) {
            stars.rotation.y = t * 0.004
            root.rotation.y = t * 0.12
            if (tourRef.current.active) {
              tourRef.current.t += 1 / 60
              const a = tourRef.current.t * 0.6, rad = 3.4 + Math.sin(tourRef.current.t * 0.3) * 1.2
              camera.position.set(Math.cos(a) * rad, 1.1 + Math.sin(tourRef.current.t * 0.4) * 0.8, Math.sin(a) * rad)
              controls.target.set(0, 0, 0); controls.enabled = false
              if (tourRef.current.t > 9) { tourRef.current.active = false; tourRef.current.t = 0; controls.enabled = true; setTour(false) }
            }
          }
          // anchored labels follow the rotating model
          const occupied: {x:number;y:number;w:number;h:number}[] = []
          const screenW = renderer.domElement.clientWidth || W, screenH = renderer.domElement.clientHeight || H
          markers.forEach((m, i) => {
            const el = labelRefs.current[i]
            if (!el) return
            m.obj.getWorldPosition(world)
            let occluded = false
            if (m.sphere) { normal.copy(world).normalize(); const view = camera.position.clone().sub(world); occluded = normal.dot(view) < 0 }
            proj.copy(world).project(camera)
            const behind = proj.z > 1
            const rawX = (proj.x * 0.5 + 0.5) * screenW
            const rawY = (-proj.y * 0.5 + 0.5) * screenH
            const width = 36, height = 36
            const x = Math.max(28, Math.min(screenW - width - 28, rawX))
            let y = Math.max(28, Math.min(screenH - height - 28, rawY))
            for(let attempt=0;attempt<markers.length;attempt++) {
              if(!occupied.some(b=>x<b.x+b.w+8 && x+width+8>b.x && y<b.y+b.h+8 && y+height+8>b.y)) break
              y = y + height + 10 < screenH-height-12 ? y+height+10 : 12
            }
            const hidden = behind || occluded || proj.z < -1
            if(!hidden) occupied.push({x,y,w:width,h:height})
            el.style.opacity = hidden ? '0' : '1'
            el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'
          })
          controls.update(); renderer.render(scene, camera)
        }
        const resize = () => { if (!host.current) return; const w = host.current.clientWidth || W, h = Math.max(400, Math.round(w * 0.72)); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h) }
        window.addEventListener('resize', resize)
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { controls.autoRotate = false; renderer.render(scene, camera) } else loop()
        ctrlRef.current = { reset: () => controls.reset() }
        cleanup = () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); controls.dispose(); renderer.dispose(); starGeo.dispose(); disposables.forEach((d) => d.dispose()); if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement) }
      } catch { if (!disposed) setStatus('error') }
    })()
    return () => { disposed = true; cleanup?.() }
  }, [bodyId])

  return (
    <div className="cosmos-canvas-wrap">
      <div ref={host} className="cosmos-canvas" role="img" aria-label={bodyById(bodyId)!.title[lang]} />
      {status === 'loading' && <p className="cosmos-status">{ui.loading}</p>}
      {status === 'error' && <p className="cosmos-status cosmos-error">{ui.error}</p>}
      <div className={'cosmos-labels' + (showLabels ? '' : ' hidden')} aria-hidden={!showLabels}>
        {anns.map((a, i) => (
          <div key={i} className="cosmos-label" ref={(el) => { labelRefs.current[i] = el }} data-i={i}>
            <span className="cosmos-label-dot" />
            <span className="cosmos-label-card">
              <b aria-label={a.title[lang]}>{i + 1}</b>
              <small>{a.desc[lang]}</small>
            </span>
          </div>
        ))}
      </div>
      <div className="cosmos-annotation-reading">{anns.map((a,i)=><details key={i}><summary>{i + 1}. {a.title[lang]}</summary><p>{a.desc[lang]}</p></details>)}</div>
      <div className="cosmos-tools">
        <span className="cosmos-hint">{ui.hint}</span>
        <button onClick={() => { tourRef.current.active = !tourRef.current.active; tourRef.current.t = 0; setTour(tourRef.current.active) }}>{tour ? ui.stopTour : ui.tour}</button>
        <button className={showLabels ? '' : 'muted'} onClick={() => setShowLabels((v) => !v)}>{showLabels ? '👁 ' : '👁‍🗨 '}{ui.labels}</button>
        <button onClick={() => { const p = !paused; setPaused(p); pausedRef.current = p; if (!p) tourRef.current.t = 0 }}>{paused ? '▶ ' + ui.play : '⏸ ' + ui.pause}</button>
        <button onClick={() => ctrlRef.current?.reset()}>{ui.reset}</button>
      </div>
    </div>
  )
}
