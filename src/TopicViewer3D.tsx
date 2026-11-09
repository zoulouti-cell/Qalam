import { useEffect, useRef, useState } from 'react'
import type { Lang } from './i18n'

export type Model3DKind = 'atom' | 'cell' | 'planet' | 'molecule'

const T = {
  ar: { loading: 'جارٍ بناء المجسم…', error: 'تعذّر تشغيل المجسم ثلاثي الأبعاد على هذا الجهاز.', hint: 'اسحب للدوران · عجلة للتقريب', spin: 'دوران تلقائي', reset: 'إعادة الضبط' },
  fr: { loading: 'Construction du modèle…', error: 'Le modèle 3D ne peut pas s’exécuter sur cet appareil.', hint: 'Glissez pour tourner · molette pour zoomer', spin: 'Rotation automatique', reset: 'Réinitialiser' },
  en: { loading: 'Building model…', error: 'The 3D model cannot run on this device.', hint: 'Drag to rotate · wheel to zoom', spin: 'Auto-rotate', reset: 'Reset' },
} as const

function bandTexture(THREE: typeof import('three')) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const ctx = c.getContext('2d')!
  const bands = ['#f2d9b0', '#d8b47a', '#c19a63', '#efdcbb', '#b8874f', '#e6c99a', '#a9743f']
  bands.forEach((col, i) => {
    ctx.fillStyle = col
    ctx.fillRect(0, (256 / bands.length) * i, 512, 256 / bands.length + 1)
  })
  // subtle turbulence
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 256
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`
    ctx.fillRect(x, y, 6, 1)
  }
  ctx.fillStyle = 'rgba(190,70,50,0.75)'
  ctx.beginPath()
  ctx.ellipse(360, 168, 34, 16, 0, 0, Math.PI * 2)
  ctx.fill()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export default function TopicViewer3D({ kind, lang }: { kind: Model3DKind; lang: Lang }) {
  const host = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [spin, setSpin] = useState(true)
  const controlsRef = useRef<{ reset: () => void } | null>(null)
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
        const W = mount.clientWidth || 520
        const H = Math.max(280, Math.round(W * 0.62))

        const scene = new THREE.Scene()
        scene.background = null
        const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100)
        camera.position.set(2.6, 1.4, 3.2)
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(W, H)
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.15
        mount.appendChild(renderer.domElement)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.06
        controls.minDistance = 2
        controls.maxDistance = 9
        controls.enablePan = false
        controls.autoRotate = true
        controls.autoRotateSpeed = 0.9
        controlsRef.current = { reset: () => controls.reset() }

        // lights
        const key = new THREE.DirectionalLight(0xfff3d6, 3.1)
        key.position.set(3, 4, 4)
        scene.add(key)
        const rim = new THREE.DirectionalLight(0x7fd4ff, 1.9)
        rim.position.set(-4, -1, -3)
        scene.add(rim)
        scene.add(new THREE.AmbientLight(0x223344, 1.1))
        const spot = new THREE.PointLight(0xffd7a0, 14, 12)
        spot.position.set(0, 0, 0)
        scene.add(spot)

        const animate: ((t: number) => void)[] = []

        if (kind === 'atom') {
          const nucleus = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.52, 3),
            new THREE.MeshStandardMaterial({ color: 0xffb36b, metalness: 0.55, roughness: 0.32, emissive: 0x552500, emissiveIntensity: 0.35 })
          )
          scene.add(nucleus)
          const shells = [1.05, 1.45, 1.85]
          const electrons: { mesh: import('three').Mesh; r: number; speed: number; tilt: number }[] = []
          shells.forEach((r, i) => {
            const ring = new THREE.Mesh(
              new THREE.TorusGeometry(r, 0.006, 8, 160),
              new THREE.MeshBasicMaterial({ color: [0x7fd4ff, 0xf3d17e, 0xc9a8ff][i], transparent: true, opacity: 0.55 })
            )
            ring.rotation.x = Math.PI / 2.4 + i * 0.32
            ring.rotation.y = i * 0.6
            scene.add(ring)
            for (let k = 0; k < 2 + i; k++) {
              const e = new THREE.Mesh(
                new THREE.SphereGeometry(0.055, 20, 16),
                new THREE.MeshStandardMaterial({ color: 0xdff3ff, emissive: 0x66c8ff, emissiveIntensity: 1.6 })
              )
              scene.add(e)
              electrons.push({ mesh: e, r, speed: 0.9 + i * 0.35, tilt: ring.rotation.x })
            }
          })
          animate.push((t) => {
            nucleus.rotation.y = t * 0.15
            electrons.forEach((e, i) => {
              const a = t * e.speed + (i * Math.PI) / 2
              e.mesh.position.set(Math.cos(a) * e.r, Math.sin(a) * e.r * Math.cos(e.tilt), Math.sin(a) * e.r * Math.sin(e.tilt))
            })
          })
        }

        if (kind === 'cell') {
          const membrane = new THREE.Mesh(
            new THREE.SphereGeometry(1.35, 64, 48),
            new THREE.MeshPhysicalMaterial({
              color: 0x2f9a74,
              transparent: true,
              opacity: 0.42,
              roughness: 0.18,
              metalness: 0.05,
              transmission: 0.85,
              thickness: 1.4,
              clearcoat: 0.8,
            })
          )
          scene.add(membrane)
          const nucleus = new THREE.Mesh(
            new THREE.SphereGeometry(0.46, 48, 32),
            new THREE.MeshStandardMaterial({ color: 0x7fc9a8, roughness: 0.45, metalness: 0.1, emissive: 0x123a2b, emissiveIntensity: 0.5 })
          )
          nucleus.position.set(-0.18, 0.12, 0.05)
          scene.add(nucleus)
          const nucleolus = new THREE.Mesh(
            new THREE.SphereGeometry(0.16, 32, 24),
            new THREE.MeshStandardMaterial({ color: 0x2f7a5f, roughness: 0.6 })
          )
          nucleolus.position.set(-0.18, 0.12, 0.05)
          scene.add(nucleolus)
          for (let i = 0; i < 5; i++) {
            const m = new THREE.Mesh(
              new THREE.SphereGeometry(0.16, 28, 20),
              new THREE.MeshStandardMaterial({ color: 0xa8e6c8, roughness: 0.5, emissive: 0x1f5c43, emissiveIntensity: 0.4 })
            )
            const a = (i / 5) * Math.PI * 2
            m.scale.set(1.6, 0.85, 1)
            m.position.set(Math.cos(a) * 0.78, Math.sin(a * 1.7) * 0.5, Math.sin(a) * 0.78)
            m.rotation.set(a, a * 0.6, a * 0.3)
            scene.add(m)
          }
          animate.push((t) => {
            membrane.rotation.y = t * 0.06
            nucleus.rotation.y = t * 0.25
          })
        }

        if (kind === 'planet') {
          const tex = bandTexture(THREE)
          const planet = new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 96, 64),
            new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.05 })
          )
          scene.add(planet)
          const atmo = new THREE.Mesh(
            new THREE.SphereGeometry(1.32, 64, 48),
            new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.16, side: THREE.BackSide })
          )
          scene.add(atmo)
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.65, 0.03, 12, 200),
            new THREE.MeshBasicMaterial({ color: 0xf3d17e, transparent: true, opacity: 0.35 })
          )
          ring.rotation.x = Math.PI / 2.1
          scene.add(ring)
          animate.push((t) => {
            planet.rotation.y = t * 0.12
            atmo.rotation.y = t * 0.09
          })
        }

        if (kind === 'molecule') {
          const O = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 48, 32),
            new THREE.MeshStandardMaterial({ color: 0xc83f4a, roughness: 0.28, metalness: 0.15 })
          )
          scene.add(O)
          const angle = (104.5 * Math.PI) / 180
          const positions = [
            new THREE.Vector3(Math.cos(Math.PI / 2 + angle / 2) * 1.0, Math.sin(Math.PI / 2 + angle / 2) * 1.0, 0),
            new THREE.Vector3(Math.cos(Math.PI / 2 - angle / 2) * 1.0, Math.sin(Math.PI / 2 - angle / 2) * 1.0, 0),
          ]
          positions.forEach((p) => {
            const H = new THREE.Mesh(
              new THREE.SphereGeometry(0.28, 36, 24),
              new THREE.MeshStandardMaterial({ color: 0xe8eef7, roughness: 0.35, metalness: 0.1 })
            )
            H.position.copy(p)
            scene.add(H)
            const dir = p.clone()
            const bond = new THREE.Mesh(
              new THREE.CylinderGeometry(0.085, 0.085, dir.length() - 0.55, 20),
              new THREE.MeshStandardMaterial({ color: 0xbfd0e2, roughness: 0.4, metalness: 0.25 })
            )
            bond.position.copy(dir.clone().multiplyScalar(0.5))
            bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
            scene.add(bond)
          })
          animate.push((t) => {
            O.rotation.y = t * 0.2
          })
        }

        let raf = 0
        const clock = new THREE.Clock()
        const loop = () => {
          raf = requestAnimationFrame(loop)
          const t = clock.getElapsedTime()
          animate.forEach((fn) => fn(t))
          controls.update()
          renderer.render(scene, camera)
        }

        const resize = () => {
          if (!host.current) return
          const w = host.current.clientWidth || W
          const h = Math.max(260, Math.round(w * 0.62))
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }
        window.addEventListener('resize', resize)

        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) loop()
        else {
          animate.forEach((fn) => fn(0.6))
          renderer.render(scene, camera)
        }
        setStatus('ready')

        cleanup = () => {
          cancelAnimationFrame(raf)
          window.removeEventListener('resize', resize)
          controls.dispose()
          renderer.dispose()
          scene.traverse((o) => {
            const mesh = o as import('three').Mesh
            if (mesh.geometry) mesh.geometry.dispose()
            const mat = mesh.material as import('three').Material | import('three').Material[] | undefined
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
            else mat?.dispose()
          })
          if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement)
        }
      } catch {
        if (!disposed) setStatus('error')
      }
    })()
    return () => {
      disposed = true
      cleanup?.()
    }
  }, [kind])

  return (
    <div className="viewer3d">
      <div ref={host} className="viewer3d-canvas" aria-label={lang === 'ar' ? 'مجسم ثلاثي الأبعاد تفاعلي' : lang === 'fr' ? 'Modèle 3D interactif' : 'Interactive 3D model'} role="img" />
      {status === 'loading' && <p className="viewer3d-status">{ui.loading}</p>}
      {status === 'error' && <p className="viewer3d-status viewer3d-error">{ui.error}</p>}
      <div className="viewer3d-tools">
        <span className="viewer3d-hint">{ui.hint}</span>
        <button
          onClick={() => {
            setSpin((v) => !v)
            controlsRef.current && controlsRef.current.reset()
          }}
          aria-pressed={spin}
        >
          {spin ? '⏸ ' : '▶ '}
          {ui.spin}
        </button>
        <button onClick={() => controlsRef.current?.reset()}>{ui.reset}</button>
      </div>
    </div>
  )
}

export const MODEL_FOR_TOPIC: Partial<Record<string, Model3DKind>> = { planets: 'planet', cells: 'cell', atoms: 'atom', molecules: 'molecule' }
