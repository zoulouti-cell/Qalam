import { useEffect, useRef, useState } from 'react'
import type { Lang } from './i18n'
import { publicUrl } from './publicUrl'
import './mars3d.css'

/* ============================================================
   Mars — maximum-fidelity globe v2
   Real geography + geometric terrain displacement + Phobos/Deimos
   + tilted axis + moving terminator. Loads real NASA/USGS maps from
   /assets/mars/{color,elevation}.jpg when present, else procedural.
   ============================================================ */

type LayerId = 'color' | 'topo' | 'relief'

const T = {
  ar: {
    title: 'المريخ — كرة ثلاثية الأبعاد', hint: 'اسحب للدوران · عجلة للتقريب',
    layer: 'الطبقة', color: 'ألوان حقيقية', topo: 'ارتفاعات ملونة', relief: 'إغاثة',
    rotate: 'دوران تلقائي', reset: 'إعادة ضبط', loading: 'جارٍ بناء المريخ…', error: 'تعذّر تشغيل ثلاثية الأبعاد',
    displacement: 'تضاريس مجسّمة', moons: 'الأقمار', terminator: 'منهي النهار/الليل', sunset: 'غروب/شروق المريخ', tour: 'جولة سينمائية', stopTour: 'إيقاف الجولة',
    diameter: 'القطر', gravity: 'الجاذبية', day: 'طول اليوم', year: 'طول السنة', tilt: 'الميل المحوري',
    temp: 'متوسط الحرارة', atmo: 'الغلاف الجوي', moonsL: 'القمران',
    d1: '6 779 كم', g1: '3.72 م/ث²', day1: '24.6 ساعة', year1: '687 يوماً', tilt1: '25.2°', temp1: '−63 °م', atmo1: 'CO₂ 95%', moons1: 'فوبوس ودايموس',
    cap: 'شروح المعالم',
    olympus: 'أوليمبوس مونس — أعلى بركان (21 كم)', valles: 'وادي مارينيريس — أخدود بطول 4000 كم',
    hellas: 'حوض هيلاس — فوهة اصطدام ضخمة', tharsis: 'هضبة ثارسيس — تجمّع براكين', pole: 'القلنسوة القطبية الشمالية',
    phobos: 'فوبوس', deimos: 'دايموس',
  },
  fr: {
    title: 'Mars — globe 3D', hint: 'Glissez pour tourner · molette pour zoomer',
    layer: 'Couche', color: 'Couleurs réelles', topo: 'Relief coloré', relief: 'Relief',
    rotate: 'Rotation auto', reset: 'Réinitialiser', loading: 'Construction de Mars…', error: '3D indisponible',
    displacement: 'Relief 3D', moons: 'Lunes', terminator: 'Terminateur jour/nuit', sunset: 'Coucher/lever de Mars', tour: 'Visite guidée', stopTour: 'Arrêter la visite',
    diameter: 'Diamètre', gravity: 'Gravité', day: 'Jour', year: 'Année', tilt: 'Inclinaison',
    temp: 'Température moyenne', atmo: 'Atmosphère', moonsL: 'Lunes',
    d1: '6 779 km', g1: '3,72 m/s²', day1: '24,6 h', year1: '687 jours', tilt1: '25,2°', temp1: '−63 °C', atmo1: 'CO₂ 95 %', moons1: 'Phobos et Deimos',
    cap: 'Légendes des reliefs',
    olympus: 'Olympus Mons — volcan le plus haut (21 km)', valles: 'Valles Marineris — canyon de 4 000 km',
    hellas: 'Hellas Planitia — vaste bassin d’impact', tharsis: 'Tharsis — groupe volcanique', pole: 'Calotte polaire nord',
    phobos: 'Phobos', deimos: 'Deimos',
  },
  en: {
    title: 'Mars — interactive 3D globe', hint: 'Drag to rotate · wheel to zoom',
    layer: 'Layer', color: 'True color', topo: 'Elevation tint', relief: 'Relief',
    rotate: 'Auto-rotate', reset: 'Reset', loading: 'Building Mars…', error: '3D unavailable',
    displacement: '3D terrain', moons: 'Moons', terminator: 'Day/night terminator', sunset: 'Mars sunset/sunrise', tour: 'Cinematic tour', stopTour: 'Stop the tour',
    diameter: 'Diameter', gravity: 'Gravity', day: 'Day length', year: 'Year length', tilt: 'Axial tilt',
    temp: 'Mean temperature', atmo: 'Atmosphere', moonsL: 'Moons',
    d1: '6,779 km', g1: '3.72 m/s²', day1: '24.6 h', year1: '687 days', tilt1: '25.2°', temp1: '−63 °C', atmo1: 'CO₂ 95%', moons1: 'Phobos and Deimos',
    cap: 'Feature labels',
    olympus: 'Olympus Mons — tallest volcano (21 km)', valles: 'Valles Marineris — 4,000 km canyon',
    hellas: 'Hellas Planitia — huge impact basin', tharsis: 'Tharsis — volcanic plateau', pole: 'North polar cap',
    phobos: 'Phobos', deimos: 'Deimos',
  },
} as const

function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

function makeMarsMaps(W: number, H: number) {
  const color = document.createElement('canvas'); color.width = W; color.height = H
  const relief = document.createElement('canvas'); relief.width = W; relief.height = H
  const topo = document.createElement('canvas'); topo.width = W; topo.height = H
  const cc = color.getContext('2d')!
  const rc = relief.getContext('2d')!
  const tc = topo.getContext('2d')!
  const rng = mulberry32(20241108)
  const x = (lon: number) => ((lon + 360) % 360) / 360 * W
  const y = (lat: number) => ((90 - lat) / 180) * H

  const img = cc.createImageData(W, H)
  for (let py = 0; py < H; py++) {
    const lat = 90 - (py / H) * 180
    for (let px = 0; px < W; px++) {
      const lon = (px / W) * 360
      const i = (py * W + px) * 4
      const n1 = Math.sin(lon * 0.06 + Math.sin(lat * 0.12) * 2.2) * 0.5 + 0.5
      const n2 = Math.sin(lat * 0.10 + lon * 0.02) * 0.5 + 0.5
      const n3 = Math.sin((lon + 50) * 0.11) * Math.sin(lat * 0.09) * 0.5 + 0.5
      let base = 0.62 + n1 * 0.18 + n2 * 0.12 + n3 * 0.10
      if (lat < -30) base += (lat + 30) / 60 * 0.10
      base += (rng() - 0.5) * 0.06
      img.data[i] = Math.round(Math.min(230, 150 + base * 90))
      img.data[i + 1] = Math.round(Math.min(200, 95 + base * 70))
      img.data[i + 2] = Math.round(Math.min(170, 70 + base * 60))
      img.data[i + 3] = 255
    }
  }
  cc.putImageData(img, 0, 0)

  const feature = (lx: number, ly: number, radius: number, col: string) => {
    cc.beginPath(); cc.arc(lx, ly, radius, 0, Math.PI * 2); cc.fillStyle = col; cc.globalAlpha = 0.5; cc.fill(); cc.globalAlpha = 1
    const g = rc.createRadialGradient(lx, ly, 1, lx, ly, radius); g.addColorStop(0, '#fff'); g.addColorStop(1, '#7f7f7f'); rc.fillStyle = g; rc.fillRect(lx - radius, ly - radius, radius * 2, radius * 2)
  }

  cc.fillStyle = '#5a3d30'; cc.globalAlpha = 0.5; cc.beginPath(); cc.ellipse(x(292), y(8), 22, 14, -0.4, 0, Math.PI * 2); cc.fill(); cc.globalAlpha = 1
  cc.fillStyle = '#d8b28a'; cc.globalAlpha = 0.4; cc.beginPath(); cc.ellipse(x(250), y(8), 40, 26, 0, 0, Math.PI * 2); cc.fill(); cc.globalAlpha = 1
  ;[[11.8, 255], [0.8, 247], [-9, 239]].forEach(([lat, lon], i) => feature(x(lon), y(lat), 5 + i, '#e8cfae'))

  const olx = x(226.2), oly = y(18.65)
  const og = rc.createRadialGradient(olx, oly, 1, olx, oly, 26); og.addColorStop(0, '#fff'); og.addColorStop(0.7, '#d8d8d8'); og.addColorStop(1, '#7f7f7f')
  rc.fillStyle = og; rc.beginPath(); rc.arc(olx, oly, 26, 0, Math.PI * 2); rc.fill()
  cc.fillStyle = '#f0dcc0'; cc.globalAlpha = 0.85; cc.beginPath(); cc.arc(olx, oly, 16, 0, Math.PI * 2); cc.fill()
  cc.fillStyle = '#c9a06a'; cc.beginPath(); cc.arc(olx, oly, 7, 0, Math.PI * 2); cc.fill(); cc.globalAlpha = 1

  cc.strokeStyle = '#4a2f22'; cc.lineWidth = 4; cc.globalAlpha = 0.85; cc.lineJoin = 'round'
  cc.beginPath(); let px0 = x(252), py0 = y(-8); cc.moveTo(px0, py0)
  for (let lon = 256; lon <= 330; lon += 6) cc.lineTo(x(lon), y(-12 + Math.sin(lon * 0.4) * 4))
  cc.stroke(); cc.globalAlpha = 1
  rc.strokeStyle = '#222'; rc.lineWidth = 4; rc.beginPath(); rc.moveTo(px0, py0)
  for (let lon = 256; lon <= 330; lon += 6) rc.lineTo(x(lon), y(-12 + Math.sin(lon * 0.4) * 4))
  rc.stroke()

  cc.fillStyle = '#e6cfa8'; cc.globalAlpha = 0.7; cc.beginPath(); cc.ellipse(x(70), y(-42), 24, 15, 0.2, 0, Math.PI * 2); cc.fill(); cc.globalAlpha = 1
  const hg = rc.createRadialGradient(x(70), y(-42), 1, x(70), y(-42), 24); hg.addColorStop(0, '#666'); hg.addColorStop(1, '#bbb'); rc.fillStyle = hg; rc.beginPath(); rc.ellipse(x(70), y(-42), 24, 15, 0.2, 0, Math.PI * 2); rc.fill()

  for (let i = 0; i < 180; i++) {
    const lat = -75 + rng() * 130, lon = rng() * 360, r = 1 + rng() * 3, cx = x(lon), cy = y(lat)
    cc.strokeStyle = 'rgba(70,45,30,0.5)'; cc.lineWidth = 0.7; cc.beginPath(); cc.arc(cx, cy, r, 0, Math.PI * 2); cc.stroke()
    cc.fillStyle = 'rgba(210,180,140,0.25)'; cc.beginPath(); cc.arc(cx, cy, r * 0.6, 0, Math.PI * 2); cc.fill()
    const cg = rc.createRadialGradient(cx, cy, 0, cx, cy, r); cg.addColorStop(0, '#666'); cg.addColorStop(1, '#aaa'); rc.fillStyle = cg; rc.beginPath(); rc.arc(cx, cy, r, 0, Math.PI * 2); rc.fill()
  }

  for (const [plat, dir] of [[82, 1], [-82, -1]] as const) {
    const capY = y(plat)
    cc.fillStyle = '#f7f3ea'; cc.fillRect(0, dir > 0 ? 0 : capY, W, dir > 0 ? capY : H - capY)
    cc.strokeStyle = '#f7f3ea'; cc.lineWidth = 1.4; cc.beginPath()
    for (let lon = 0; lon <= 360; lon += 4) { const yy = y(plat + Math.sin(lon * 0.9) * 3); lon === 0 ? cc.moveTo(x(lon), yy) : cc.lineTo(x(lon), yy) }
    cc.stroke()
  }

  tc.drawImage(relief, 0, 0)
  const topoData = tc.getImageData(0, 0, W, H)
  const ramp = ['#3b5f2e', '#8a7a4a', '#b98d5a', '#d1b28a', '#efe0c8', '#ffffff']
  for (let i = 0; i < topoData.data.length; i += 4) {
    const v = topoData.data[i] / 255, c = ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))]
    topoData.data[i] = parseInt(c.slice(1, 3), 16); topoData.data[i + 1] = parseInt(c.slice(3, 5), 16); topoData.data[i + 2] = parseInt(c.slice(5, 7), 16)
  }
  tc.putImageData(topoData, 0, 0)
  return { color, relief, topo }
}

/** Displace a sphere's vertices from an elevation canvas. */
function displace(THREE: typeof import('three'), baseR: number, elev: HTMLCanvasElement, amp: number) {
  const W = elev.width, H = elev.height
  const ctx = elev.getContext('2d')!
  const data = ctx.getImageData(0, 0, W, H).data
  const geo = new THREE.SphereGeometry(baseR, 256, 128)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i)
    const py = pos.getY(i)
    const pz = pos.getZ(i)
    const lat = Math.asin(Math.max(-1, Math.min(1, py / baseR)))
    const lon = Math.atan2(pz, px)
    const tx = Math.floor(((lon / (Math.PI * 2)) + 0.5) * W) % W
    const ty = Math.floor((0.5 - lat / Math.PI) * H)
    const tyc = Math.max(0, Math.min(H - 1, ty))
    const idx = (tyc * W + tx) * 4
    const h = (data[idx] / 255 - 0.5) * amp
    const scale = 1 + h / baseR
    pos.setXYZ(i, px * scale, py * scale, pz * scale)
  }
  geo.computeVertexNormals()
  return geo
}

export default function Mars3D({ lang }: { lang: Lang }) {
  const host = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [spin, setSpin] = useState(true)
  const [layer, setLayer] = useState<LayerId>('color')
  const [displ, setDispl] = useState(true)
  const [moons, setMoons] = useState(true)
  const [hotspot, setHotspot] = useState<string | null>(null)
  const [sunset, setSunset] = useState(false)
  const [tour, setTour] = useState(false)
  const tourRef = useRef({ active: false, t: 0 })
  const ctrlRef = useRef<{ reset: () => void; setMap: (l: LayerId) => void; setDispl: (b: boolean) => void; setMoons: (b: boolean) => void; setSunset: (b: boolean) => void } | null>(null)
  const ui = T[lang]

  useEffect(() => {
    let disposed = false
    let cleanup: (() => void) | undefined
    ;(async () => {
      try {
        const THREE = await import('three')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
        if (disposed || !host.current) return
        const mount = host.current
        const W = mount.clientWidth || 720
        const H = Math.max(420, Math.round(W * 0.72))

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100)
        camera.position.set(0, 0.5, 5.6)
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(W, H)
        renderer.toneMapping = THREE.NoToneMapping
        mount.appendChild(renderer.domElement)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true; controls.dampingFactor = 0.06; controls.minDistance = 2.4; controls.maxDistance = 12; controls.enablePan = false
        controls.autoRotate = true; controls.autoRotateSpeed = 0.5

        const disposables: { dispose: () => void }[] = []
        const mars = new THREE.Group()
        mars.rotation.z = THREE.MathUtils.degToRad(-25.19) // axial tilt
        scene.add(mars)

        const maps = makeMarsMaps(1024, 512)
        const makeTex = (c: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t }
        const texColor = makeTex(maps.color)
        const texTopo = makeTex(maps.topo)
        const texRelief = makeTex(maps.relief)

        const BASE_R = 1.55
        const geometry = displace(THREE, BASE_R, maps.relief, 0.14)
        const material = new THREE.MeshStandardMaterial({ map: texColor, bumpMap: texRelief, bumpScale: 0.01, roughness: 0.96, metalness: 0 })
        const sphere = new THREE.Mesh(geometry, material)
        mars.add(sphere)

        // upgrade to the real NASA Mars colour map (map-only, no geometry flash)
        const realImg = new Image(); realImg.crossOrigin = 'anonymous'
        realImg.onload = () => {
          const c = document.createElement('canvas'); c.width = realImg.width; c.height = realImg.height
          c.getContext('2d')!.drawImage(realImg, 0, 0)
          const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping
          material.map = t; material.needsUpdate = true
          disposables.push(t)
        }
        realImg.src = publicUrl('assets/mars/color.jpg')

        // atmosphere (dust haze + fresnel rim)
        const haze = new THREE.Mesh(new THREE.SphereGeometry(BASE_R + 0.035, 64, 48), new THREE.MeshBasicMaterial({ color: 0xd98f5a, transparent: true, opacity: 0.10, side: THREE.BackSide }))
        const rim = new THREE.Mesh(new THREE.SphereGeometry(BASE_R + 0.07, 64, 48), new THREE.MeshBasicMaterial({ color: 0xf2b27a, transparent: true, opacity: 0.05, side: THREE.BackSide }))
        mars.add(haze, rim)

        // Phobos & Deimos (sizes exaggerated for visibility)
        const moonsGroup = new THREE.Group()
        const phobos = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 16), new THREE.MeshStandardMaterial({ color: 0x7a6a5a, roughness: 0.9 }))
        const deimos = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 16), new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.9 }))
        const phobosOrbit = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.002, 8, 160), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.25 }))
        const deimosOrbit = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.002, 8, 160), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.18 }))
        phobosOrbit.rotation.x = Math.PI / 2; deimosOrbit.rotation.x = Math.PI / 2.4
        moonsGroup.add(phobos, deimos, phobosOrbit, deimosOrbit)
        scene.add(moonsGroup)

        // stars
        const starGeo = new THREE.BufferGeometry(); const starPos = new Float32Array(700 * 3)
        for (let i = 0; i < 700; i++) { const th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 2 - 1), r = 22 + Math.random() * 18; starPos[i * 3] = r * Math.sin(ph) * Math.cos(th); starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); starPos[i * 3 + 2] = r * Math.cos(ph) }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
        const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xdfe9ff, size: 0.05, transparent: true, opacity: 0.8, sizeAttenuation: true }))
        scene.add(stars)

        // sun + fill + ambient
        const sun = new THREE.DirectionalLight(0xfff2df, 3.4); sun.position.set(6, 1.5, 4); scene.add(sun)
        scene.add(new THREE.AmbientLight(0xffffff, 0.9))
        const fill = new THREE.DirectionalLight(0xffffff, 0.7); fill.position.set(-4, -1, -3); scene.add(fill)

        // Martian sunset: blue aureole near the sun at the limb
        const glowCanvas = document.createElement('canvas'); glowCanvas.width = 256; glowCanvas.height = 256
        const gctx = glowCanvas.getContext('2d')!
        const gg = gctx.createRadialGradient(128, 128, 0, 128, 128, 128)
        gg.addColorStop(0, 'rgba(255,255,255,1)')
        gg.addColorStop(0.18, 'rgba(180,215,255,0.9)')
        gg.addColorStop(0.45, 'rgba(110,150,220,0.35)')
        gg.addColorStop(1, 'rgba(0,0,0,0)')
        gctx.fillStyle = gg; gctx.fillRect(0, 0, 256, 256)
        const glowTex = new THREE.CanvasTexture(glowCanvas)
        const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }))
        const sunDir = sun.position.clone().normalize()
        sunGlow.position.copy(sunDir).multiplyScalar(BASE_R + 0.22)
        sunGlow.scale.set(1.1, 1.1, 1)
        sunGlow.visible = false
        scene.add(sunGlow)

        const setMap = (l: LayerId) => { material.map = l === 'topo' ? texTopo : texColor; material.needsUpdate = true }
        const setDispl = (b: boolean) => {
          if (b) { const g2 = displace(THREE, BASE_R, maps.relief, 0.14); sphere.geometry.dispose(); sphere.geometry = g2 } else { const g2 = new THREE.SphereGeometry(BASE_R, 256, 128); sphere.geometry.dispose(); sphere.geometry = g2 }
        }
        const setMoons = (b: boolean) => { moonsGroup.visible = b }
        const setSunset = (b: boolean) => {
          sunGlow.visible = b
          sun.intensity = b ? 1.1 : 3.4
          fill.color.setHex(b ? 0x5070b0 : 0xc08050)
          haze.material = new THREE.MeshBasicMaterial({ color: 0xd98f5a, transparent: true, opacity: b ? 0.24 : 0.10, side: THREE.BackSide })
        }
        ctrlRef.current = { reset: () => controls.reset(), setMap, setDispl, setMoons, setSunset }

        const R = BASE_R
        const pt = (lat: number, lon: number, r: number) => {
          const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180
          return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo))
        }
        const tourKeys = [
          { cam: new THREE.Vector3(0, 1.3, 6.8), tgt: new THREE.Vector3(0, 0, 0), glow: false },
          { cam: pt(-12, 300, R * 1.4), tgt: pt(-12, 300, R), glow: false },
          { cam: pt(18.65, 226.2, R * 1.32), tgt: pt(18.65, 226.2, R), glow: false },
          { cam: pt(4, 8, R * 1.15), tgt: pt(4, 8, R), glow: true },
          { cam: new THREE.Vector3(0, 1.3, 6.8), tgt: new THREE.Vector3(0, 0, 0), glow: false },
        ]
        const SEG_DUR = 3.6
        const TOUR_TOTAL = (tourKeys.length - 1) * SEG_DUR
        const smooth = (x: number) => x * x * (3 - 2 * x)
        const clock = new THREE.Clock()
        let raf = 0
        const loop = () => {
          raf = requestAnimationFrame(loop)
          const t = clock.getElapsedTime()
          if (!tourRef.current.active) sphere.rotation.y = t * 0.06
          phobos.position.set(Math.cos(t * 0.5) * 2.0, Math.sin(t * 0.5) * 2.0 * 0.08, Math.sin(t * 0.5) * 2.0)
          deimos.position.set(Math.cos(t * 0.2) * 2.5, Math.sin(t * 0.2) * 2.5 * 0.12, Math.sin(t * 0.2) * 2.5)
          stars.rotation.y = -t * 0.004
          if (tourRef.current.active) {
            tourRef.current.t += 1 / 60
            const tt = Math.min(tourRef.current.t, TOUR_TOTAL)
            const seg = tt / SEG_DUR
            const i = Math.min(tourKeys.length - 2, Math.floor(seg))
            const k = smooth(seg - i)
            const a = tourKeys[i], b = tourKeys[i + 1]
            camera.position.lerpVectors(a.cam, b.cam, k)
            controls.target.lerpVectors(a.tgt, b.tgt, k)
            controls.enabled = false
            sunGlow.visible = b.glow || a.glow
            if (tourRef.current.t >= TOUR_TOTAL) {
              tourRef.current.active = false
              tourRef.current.t = 0
              controls.enabled = true
              sunGlow.visible = sunset
              setTour(false)
            }
          }
          controls.update(); renderer.render(scene, camera)
        }
        const resize = () => { if (!host.current) return; const w = host.current.clientWidth || W, h = Math.max(380, Math.round(w * 0.72)); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h) }
        window.addEventListener('resize', resize)
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { controls.autoRotate = false; renderer.render(scene, camera) } else loop()
        setStatus('ready')

        cleanup = () => {
          cancelAnimationFrame(raf); window.removeEventListener('resize', resize); controls.dispose(); renderer.dispose()
          texColor.dispose(); texTopo.dispose(); texRelief.dispose()
          geometry.dispose(); starGeo.dispose()
          if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement)
        }
      } catch { if (!disposed) setStatus('error') }
    })()
    return () => { disposed = true; cleanup?.() }
  }, [])

  const hotspots = [
    { id: 'olympus', label: ui.olympus, top: 38, left: 30 },
    { id: 'valles', label: ui.valles, top: 52, left: 62 },
    { id: 'hellas', label: ui.hellas, top: 70, left: 24 },
    { id: 'tharsis', label: ui.tharsis, top: 36, left: 70 },
    { id: 'pole', label: ui.pole, top: 8, left: 50 },
  ]

  return (
    <div className="mars3d">
      <div className="mars3d-head">
        <h3>{ui.title}</h3>
        <div className="mars3d-layer" role="group" aria-label={ui.layer}>
          {([['color', ui.color], ['topo', ui.topo], ['relief', ui.relief]] as const).map(([id, label]) => (
            <button key={id} className={layer === id ? 'active' : ''} aria-pressed={layer === id} onClick={() => { setLayer(id); ctrlRef.current?.setMap(id) }}>{label}</button>
          ))}
        </div>
      </div>

      <div className="mars3d-stage">
        <div ref={host} className="mars3d-canvas" role="img" aria-label={ui.title} />
        {status === 'loading' && <p className="mars3d-status">{ui.loading}</p>}
        {status === 'error' && <p className="mars3d-status mars3d-error">{ui.error}</p>}
        {status === 'ready' && (
          <div className="mars3d-hotspots">
            {hotspots.map((h) => (
              <button key={h.id} className={'mars3d-spot' + (hotspot === h.id ? ' on' : '')} style={{ top: h.top + '%', left: h.left + '%' }} onClick={() => setHotspot(hotspot === h.id ? null : h.id)} aria-expanded={hotspot === h.id}>
                <span className="mars3d-dot" /><span className="mars3d-spot-label">{h.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mars3d-tools">
        <span className="mars3d-hint">{ui.hint}</span>
        <label className="mars3d-toggle"><input type="checkbox" checked={displ} onChange={(e) => { setDispl(e.target.checked); ctrlRef.current?.setDispl(e.target.checked) }} />{ui.displacement}</label>
        <label className="mars3d-toggle"><input type="checkbox" checked={moons} onChange={(e) => { setMoons(e.target.checked); ctrlRef.current?.setMoons(e.target.checked) }} />{ui.moons}</label>
        <label className="mars3d-toggle"><input type="checkbox" checked={sunset} onChange={(e) => { setSunset(e.target.checked); ctrlRef.current?.setSunset(e.target.checked) }} />{ui.sunset}</label>
        <button className="mars3d-tour" onClick={() => {
          tourRef.current.active = !tourRef.current.active
          tourRef.current.t = 0
          if (tourRef.current.active) ctrlRef.current?.reset()
          setTour(tourRef.current.active)
        }}>
          {tour ? ui.stopTour : ui.tour}
        </button>
        <button onClick={() => { setSpin((v) => !v); ctrlRef.current?.reset() }} aria-pressed={spin}>{spin ? '⏸ ' : '▶ '}{ui.rotate}</button>
        <button onClick={() => ctrlRef.current?.reset()}>{ui.reset}</button>
      </div>

      <dl className="mars3d-data">
        {([['diameter', ui.diameter, ui.d1], ['gravity', ui.gravity, ui.g1], ['day', ui.day, ui.day1], ['year', ui.year, ui.year1], ['tilt', ui.tilt, ui.tilt1], ['temp', ui.temp, ui.temp1], ['atmo', ui.atmo, ui.atmo1], ['moons', ui.moonsL, ui.moons1]] as const).map(([k, label, val]) => (
          <div key={k}><dt>{label}</dt><dd>{val}</dd></div>
        ))}
      </dl>
    </div>
  )
}
