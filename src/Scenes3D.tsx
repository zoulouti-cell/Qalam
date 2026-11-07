import { useEffect, useRef, useState } from 'react'
import type * as THREE from 'three'
import { t, type Lang } from './i18n'
import type { SceneKind } from './mediaData'

interface SceneParams {
  exploded: boolean
  speed: number
  bpm: number
  inside: boolean
}

type ThreeModule = typeof import('three')

/* eslint-disable @typescript-eslint/no-explicit-any */
function buildScene(
  THREE: ThreeModule,
  OrbitControls: any,
  mount: HTMLDivElement,
  kind: SceneKind,
  params: SceneParams,
  setLabel: (s: string) => void,
  lang: Lang
): () => void {
  const w = mount.clientWidth || 640
  const h = mount.clientHeight || 400
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  mount.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 300)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08

  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const dir = new THREE.DirectionalLight(0xffffff, 1.4)
  dir.position.set(6, 10, 8)
  scene.add(dir)

  const clickables: THREE.Object3D[] = []
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let downX = 0
  let downY = 0
  const onDown = (e: PointerEvent) => {
    downX = e.clientX
    downY = e.clientY
  }
  const onUp = (e: PointerEvent) => {
    if (Math.abs(e.clientX - downX) > 5 || Math.abs(e.clientY - downY) > 5) return
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(clickables, false)
    if (hits.length > 0) {
      const label = hits[0].object.userData.label as string | undefined
      if (label) setLabel(label)
    }
  }
  renderer.domElement.addEventListener('pointerdown', onDown)
  renderer.domElement.addEventListener('pointerup', onUp)

  let disposed = false
  const state = (() => {
    switch (kind) {
      case 'sun':
        return buildSun(THREE, scene, clickables, camera, controls, params, lang)
      case 'atom':
        return buildAtom(THREE, scene, clickables, camera, controls, params, lang)
      case 'heart':
        return buildHeart(THREE, scene, clickables, camera, controls, params, lang)
      case 'water':
        return buildWater(THREE, scene, clickables, camera, controls, params, lang)
      case 'pyramid':
        return buildPyramid(THREE, scene, clickables, camera, controls, params, lang)
      case 'africa':
        return buildAfrica(THREE, scene, clickables, camera, controls, params, lang, () => disposed)
      default:
        return { update: () => {} }
    }
  })()

  const clock = new THREE.Clock()
  let raf = 0
  const loop = () => {
    if (disposed) return
    raf = requestAnimationFrame(loop)
    const dt = Math.min(clock.getDelta(), 0.1)
    const time = clock.elapsedTime
    state.update(time, dt)
    controls.update()
    renderer.render(scene, camera)
  }
  loop()

  const ro = new ResizeObserver(() => {
    const nw = mount.clientWidth || 640
    const nh = mount.clientHeight || 400
    renderer.setSize(nw, nh)
    camera.aspect = nw / nh
    camera.updateProjectionMatrix()
  })
  ro.observe(mount)

  return () => {
    disposed = true
    cancelAnimationFrame(raf)
    ro.disconnect()
    renderer.domElement.removeEventListener('pointerdown', onDown)
    renderer.domElement.removeEventListener('pointerup', onUp)
    controls.dispose()
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else if (mat) mat.dispose()
    })
    renderer.dispose()
    if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement)
  }
}

interface Updater {
  update: (time: number, dt: number) => void
}

function mark(mesh: THREE.Object3D, label: string, clickables: THREE.Object3D[]) {
  mesh.userData.label = label
  clickables.push(mesh)
}

function buildSun(
  THREE: ThreeModule,
  scene: THREE.Scene,
  clickables: THREE.Object3D[],
  camera: THREE.PerspectiveCamera,
  controls: unknown,
  params: SceneParams,
  lang: Lang
): Updater {
  camera.position.set(0, 16, 30)
  ;(controls as { target: THREE.Vector3; minDistance: number; maxDistance: number }).target.set(0, 0, 0)
  ;(controls as { minDistance: number; maxDistance: number }).minDistance = 8
  ;(controls as { minDistance: number; maxDistance: number }).maxDistance = 60
  const group = new THREE.Group()
  scene.add(group)
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(3, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffb347 })
  )
  mark(sun, t(lang, 'pSun'), clickables)
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(3.7, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffa726, transparent: true, opacity: 0.16 })
  )
  group.add(glow, sun)
  group.add(new THREE.PointLight(0xffd27f, 2.5, 70))
  const defs = [
    { key: 'pMercury', d: 4.2, r: 0.16, c: 0xb8a99a, sp: 1.6 },
    { key: 'pVenus', d: 5.6, r: 0.3, c: 0xe8c98a, sp: 1.18 },
    { key: 'pEarth', d: 7.2, r: 0.32, c: 0x4f9dde, sp: 1.0 },
    { key: 'pMars', d: 8.9, r: 0.22, c: 0xd76b4f, sp: 0.81 },
    { key: 'pJupiter', d: 12.5, r: 0.85, c: 0xd9a066, sp: 0.44 },
    { key: 'pSaturn', d: 15.6, r: 0.72, c: 0xe5cf8a, sp: 0.33, ring: true },
    { key: 'pUranus', d: 18.6, r: 0.5, c: 0x86d5e8, sp: 0.23 },
    { key: 'pNeptune', d: 21.4, r: 0.48, c: 0x4a6fd8, sp: 0.18 },
  ]
  const holders = defs.map((p) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(p.r, 24, 24),
      new THREE.MeshStandardMaterial({ color: p.c, roughness: 0.65 })
    )
    mark(mesh, t(lang, p.key), clickables)
    const holder = new THREE.Group()
    holder.add(mesh)
    if (p.ring) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(p.r * 1.9, 0.05, 8, 48),
        new THREE.MeshBasicMaterial({ color: 0xcfc2a0 })
      )
      ring.rotation.x = Math.PI / 2.4
      holder.add(ring)
    }
    const orbit = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 128 }, (_, i) => {
          const a = (i / 128) * Math.PI * 2
          return new THREE.Vector3(Math.cos(a) * p.d, 0, Math.sin(a) * p.d)
        })
      ),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })
    )
    orbit.rotation.x = 0.06
    group.add(orbit)
    holder.userData = { angle: Math.random() * Math.PI * 2, base: p.d, sp: p.sp }
    group.add(holder)
    return holder
  })
  return {
    update: (time) => {
      glow.scale.setScalar(1 + 0.03 * Math.sin(time * 1.5))
      for (const h of holders) {
        h.userData.angle += 0.008 * h.userData.sp * params.speed
        const target = h.userData.base + (params.exploded ? 2.6 : 0)
        const a = h.userData.angle
        h.position.set(Math.cos(a) * target, Math.sin(a * 0.5) * 0.3, Math.sin(a) * target)
      }
    },
  }
}

function buildAtom(
  THREE: ThreeModule,
  scene: THREE.Scene,
  clickables: THREE.Object3D[],
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3; minDistance: number; maxDistance: number },
  params: SceneParams,
  lang: Lang
): Updater {
  camera.position.set(0, 6, 12)
  controls.target.set(0, 0, 0)
  controls.minDistance = 5
  controls.maxDistance = 30
  const group = new THREE.Group()
  scene.add(group)
  const nucleus = new THREE.Group()
  const pPos = [
    [0.5, 0.3, 0.2], [-0.5, 0.2, -0.3], [0.2, -0.5, 0.3],
    [-0.2, -0.2, -0.5], [0.4, -0.1, -0.4], [-0.4, 0.4, 0.1],
  ]
  const nPos = [
    [-0.1, 0.5, -0.2], [0.3, -0.4, -0.2], [-0.5, -0.4, 0.4],
    [0.1, 0.1, 0.5], [-0.3, 0.1, 0.4], [0.5, 0.5, -0.4],
  ]
  const pGeo = new THREE.SphereGeometry(0.42, 24, 24)
  const pMat = new THREE.MeshStandardMaterial({ color: 0xe05a5a, roughness: 0.4 })
  const nGeo = new THREE.SphereGeometry(0.4, 24, 24)
  const nMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.4 })
  for (const [x, y, z] of pPos) {
    const m = new THREE.Mesh(pGeo, pMat)
    m.position.set(x, y, z)
    mark(m, t(lang, 'protons'), clickables)
    nucleus.add(m)
  }
  for (const [x, y, z] of nPos) {
    const m = new THREE.Mesh(nGeo, nMat)
    m.position.set(x, y, z)
    mark(m, t(lang, 'neutrons'), clickables)
    nucleus.add(m)
  }
  mark(nucleus, t(lang, 'nucleus'), clickables)
  group.add(nucleus)
  const shells = [
    { r: 2.2, n: 2, sp: 0.9, inc: 0.25 },
    { r: 3.2, n: 4, sp: 0.55, inc: -0.4 },
    { r: 4.2, n: 2, sp: 0.32, inc: 0.6 },
  ]
  const electrons: { mesh: THREE.Mesh; phase: number; shell: (typeof shells)[number] }[] = []
  const eGeo = new THREE.SphereGeometry(0.18, 16, 16)
  const eMat = new THREE.MeshBasicMaterial({ color: 0x4fc3f7 })
  for (const s of shells) {
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 96 }, (_, i) => {
          const a = (i / 96) * Math.PI * 2
          return new THREE.Vector3(Math.cos(a) * s.r, Math.sin(a) * s.r, 0)
        })
      ),
      new THREE.LineBasicMaterial({ color: 0x8fb8d8, transparent: true, opacity: 0.35 })
    )
    line.rotation.x = s.inc
    group.add(line)
    for (let i = 0; i < s.n; i++) {
      const m = new THREE.Mesh(eGeo, eMat)
      mark(m, t(lang, 'electrons'), clickables)
      group.add(m)
      electrons.push({ mesh: m, phase: (i / s.n) * Math.PI * 2, shell: s })
    }
  }
  return {
    update: (time) => {
      nucleus.rotation.y = time * 0.6
      nucleus.rotation.x = time * 0.3
      for (const e of electrons) {
        const a = e.phase + time * e.shell.sp * params.speed
        const r = e.shell.r + (params.exploded ? 1.15 : 0)
        const x = Math.cos(a) * r
        e.mesh.position.set(x, 0, 0)
        e.mesh.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), e.shell.inc)
        e.mesh.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), e.shell.inc * 2)
      }
    },
  }
}

function buildHeart(
  THREE: ThreeModule,
  scene: THREE.Scene,
  clickables: THREE.Object3D[],
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3; minDistance: number; maxDistance: number },
  params: SceneParams,
  lang: Lang
): Updater {
  camera.position.set(0, 2, 10)
  controls.target.set(0, 0, 0)
  controls.minDistance = 4.5
  controls.maxDistance = 18
  const group = new THREE.Group()
  scene.add(group)
  const mat = new THREE.MeshStandardMaterial({ color: 0xd13b3b, roughness: 0.45 })
  const ra = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), mat)
  ra.position.set(-0.62, 0.45, 0)
  mark(ra, t(lang, 'rightAtrium'), clickables)
  const la = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), mat)
  la.position.set(0.62, 0.45, 0)
  mark(la, t(lang, 'leftAtrium'), clickables)
  const rv = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.1, 32), mat)
  rv.rotation.x = Math.PI
  rv.position.set(-0.6, -0.85, 0)
  mark(rv, t(lang, 'rightVentricle'), clickables)
  const lv = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.1, 32), mat)
  lv.rotation.x = Math.PI
  lv.position.set(0.6, -0.85, 0)
  mark(lv, t(lang, 'leftVentricle'), clickables)
  const aorta = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 1.9, 24), mat)
  aorta.position.set(0.45, 1.75, 0)
  aorta.rotation.z = -0.25
  mark(aorta, t(lang, 'aorta'), clickables)
  const vc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.34, 1.7, 24),
    new THREE.MeshStandardMaterial({ color: 0x3b6fd1, roughness: 0.5 })
  )
  vc.position.set(-0.5, 1.65, 0)
  vc.rotation.z = 0.2
  mark(vc, t(lang, 'venaCava'), clickables)
  group.add(ra, la, rv, lv, aorta, vc)
  return {
    update: (time) => {
      const pulse = 1 + 0.09 * Math.sin(((time * params.bpm) / 60) * Math.PI * 2)
      group.scale.setScalar(pulse)
      ra.position.x = -0.62 + (params.exploded ? -0.55 : 0)
      la.position.x = 0.62 + (params.exploded ? 0.55 : 0)
      rv.position.x = -0.6 + (params.exploded ? -0.45 : 0)
      lv.position.x = 0.6 + (params.exploded ? 0.45 : 0)
      aorta.position.y = 1.75 + (params.exploded ? 0.55 : 0)
      vc.position.y = 1.65 + (params.exploded ? 0.55 : 0)
    },
  }
}

function makeBond(THREE: ThreeModule, from: THREE.Vector3, to: THREE.Vector3): THREE.Mesh {
  const dir = to.clone().sub(from)
  const len = dir.length()
  const bond = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, len, 16),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5 })
  )
  bond.position.copy(from).add(to).multiplyScalar(0.5)
  bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  return bond
}

function buildWater(
  THREE: ThreeModule,
  scene: THREE.Scene,
  clickables: THREE.Object3D[],
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3; minDistance: number; maxDistance: number },
  params: SceneParams,
  lang: Lang
): Updater {
  camera.position.set(0, 2.5, 8)
  controls.target.set(0, 0, 0)
  controls.minDistance = 3.5
  controls.maxDistance = 16
  const group = new THREE.Group()
  scene.add(group)
  const o = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xd84343, roughness: 0.4 })
  )
  mark(o, t(lang, 'oxygen'), clickables)
  const h1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.4 })
  )
  mark(h1, t(lang, 'hydrogen'), clickables)
  const h2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.4 })
  )
  mark(h2, t(lang, 'hydrogen'), clickables)
  const b1 = makeBond(THREE, new THREE.Vector3(), new THREE.Vector3(0, 1, 0))
  const b2 = makeBond(THREE, new THREE.Vector3(), new THREE.Vector3(0, 1, 0))
  mark(b1, t(lang, 'bond'), clickables)
  mark(b2, t(lang, 'bond'), clickables)
  group.add(o, h1, h2, b1, b2)
  return {
    update: (time) => {
      const vibr = Math.sin(time * 3) * 0.04 * params.speed
      const dist = 1.5 + vibr + (params.exploded ? 0.95 : 0)
      const ang = (104.5 / 2) * (Math.PI / 180)
      const p1 = new THREE.Vector3(Math.sin(ang) * dist, Math.cos(ang) * dist * 0.92, 0)
      const p2 = new THREE.Vector3(-Math.sin(ang) * dist, Math.cos(ang) * dist * 0.92, 0)
      h1.position.copy(p1)
      h2.position.copy(p2)
      const zero = new THREE.Vector3()
      b1.position.copy(p1).multiplyScalar(0.5)
      b1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(zero).normalize())
      b1.scale.y = p1.length() / 1
      b2.position.copy(p2).multiplyScalar(0.5)
      b2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(zero).normalize())
      b2.scale.y = p2.length() / 1
      group.rotation.y = time * 0.4
    },
  }
}

function buildPyramid(
  THREE: ThreeModule,
  scene: THREE.Scene,
  clickables: THREE.Object3D[],
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3; minDistance: number; maxDistance: number },
  params: SceneParams,
  lang: Lang
): Updater {
  camera.position.set(10, 7, 14)
  controls.target.set(0, 1.6, 0)
  controls.minDistance = 6
  controls.maxDistance = 40
  const group = new THREE.Group()
  scene.add(group)
  const mat = new THREE.MeshStandardMaterial({
    color: 0xe0c088,
    roughness: 0.85,
    flatShading: true,
    transparent: true,
  })
  const slices: { mesh: THREE.Mesh; baseY: number }[] = []
  const bands = [
    { rt: 4.5, rb: 6, y: 0.575 },
    { rt: 3.0, rb: 4.5, y: 1.725 },
    { rt: 1.5, rb: 3.0, y: 2.875 },
    { rt: 0.02, rb: 1.5, y: 4.025 },
  ]
  for (const b of bands) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(b.rt, b.rb, 1.15, 4), mat)
    m.rotation.y = Math.PI / 4
    m.position.y = b.y
    group.add(m)
    slices.push({ mesh: m, baseY: b.y })
  }
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0xd9c9a8, roughness: 1 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.02
  scene.add(ground)
  const chambers = new THREE.Group()
  const makeBox = (w: number, hh: number, d: number, x: number, y: number, z: number, key: string, col: number) => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(w, hh, d),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 })
    )
    box.position.set(x, y, z)
    mark(box, t(lang, key), clickables)
    chambers.add(box)
    return box
  }
  makeBox(0.6, 0.7, 0.6, 0, 0.15, 3.1, 'entrance', 0x8a6d3b)
  const gallery = makeBox(0.5, 1.5, 0.5, 0, 1.25, 1.05, 'grandGallery', 0x9c7c45)
  gallery.rotation.x = -0.5
  makeBox(1.2, 1.0, 1.7, 0, 1.95, 0.15, 'kingChamber', 0xb0894c)
  makeBox(1.0, 0.8, 1.3, 0, 0.95, -0.55, 'queenChamber', 0xa57f41)
  group.add(chambers)
  return {
    update: () => {
      mat.opacity = params.inside ? 0.45 : 1
      chambers.visible = params.inside
      for (const s of slices) {
        s.mesh.position.y = s.baseY + (params.exploded ? (s.baseY * 2) / 4.6 * 1.4 : 0)
      }
    },
  }
}

function buildAfrica(
  THREE: ThreeModule,
  scene: THREE.Scene,
  clickables: THREE.Object3D[],
  camera: THREE.PerspectiveCamera,
  controls: {
    target: THREE.Vector3
    minDistance: number
    maxDistance: number
    autoRotate: boolean
    autoRotateSpeed: number
  },
  _params: SceneParams,
  lang: Lang,
  isDisposed: () => boolean
): Updater {
  camera.position.set(0, 2.5, 9.5)
  controls.target.set(0, 0, 0)
  controls.minDistance = 4.5
  controls.maxDistance = 14
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.6
  const group = new THREE.Group()
  scene.add(group)
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(3, 48, 48),
    new THREE.MeshStandardMaterial({ color: 0x123a6b, roughness: 0.85 })
  )
  group.add(globe)
  const graticule = new THREE.Mesh(
    new THREE.SphereGeometry(3.02, 32, 18),
    new THREE.MeshBasicMaterial({ color: 0x7fb3ff, wireframe: true, transparent: true, opacity: 0.08 })
  )
  group.add(graticule)
  const starsGeo = new THREE.BufferGeometry()
  const starsPos: number[] = []
  for (let i = 0; i < 400; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 60)
    starsPos.push(v.x, v.y, v.z)
  }
  starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starsPos, 3))
  scene.add(
    new THREE.Points(
      starsGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.8 })
    )
  )
  const toVec = (lon: number, lat: number) => {
    const phi = ((90 - lat) * Math.PI) / 180
    const theta = ((lon + 180) * Math.PI) / 180
    const R = 3.03
    return new THREE.Vector3(
      -R * Math.sin(phi) * Math.cos(theta),
      R * Math.cos(phi),
      R * Math.sin(phi) * Math.sin(theta)
    )
  }
  void fetch('/assets/ne_110m_admin_0_countries.geojson')
    .then((r) => r.json())
    .then((data: { features: any[] }) => {
      if (isDisposed()) return
      for (const f of data.features) {
        const props = f.properties
        if (!props || props.ADMIN === 'Antarctica') continue
        const isAfrica = props.CONTINENT === 'Africa'
        const polys: any[][][] =
          f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
        for (const poly of polys) {
          const ring = poly[0] as [number, number][]
          if (!ring || ring.length < 4) continue
          if (isAfrica) {
            const shape = new THREE.Shape()
            ring.forEach(([lon, lat], i) => {
              if (i === 0) shape.moveTo(lon, lat)
              else shape.lineTo(lon, lat)
            })
            const geo = new THREE.ShapeGeometry(shape, 24)
            const pos = geo.attributes.position
            for (let i = 0; i < pos.count; i++) {
              const v = toVec(pos.getX(i), pos.getY(i))
              pos.setXYZ(i, v.x, v.y, v.z)
            }
            geo.computeVertexNormals()
            const mesh = new THREE.Mesh(
              geo,
              new THREE.MeshStandardMaterial({ color: 0xe0a53f, roughness: 0.55, side: THREE.DoubleSide })
            )
            const name =
              (lang === 'ar' ? props.NAME_AR : lang === 'fr' ? props.NAME_FR : props.NAME_EN) ||
              props.NAME ||
              props.ADMIN
            mesh.userData.label = name
            clickables.push(mesh)
            group.add(mesh)
          } else {
            const pts = ring.map(([lon, lat]) => toVec(lon, lat))
            group.add(
              new THREE.LineLoop(
                new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color: 0x7fa3c8, transparent: true, opacity: 0.4 })
              )
            )
          }
        }
      }
    })
    .catch(() => {})
  return {
    update: () => {
      /* rotation handled by OrbitControls.autoRotate */
    },
  }
}

export default function Scene3D({ kind, lang }: { kind: SceneKind; lang: Lang }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const paramsRef = useRef<SceneParams>({ exploded: false, speed: 1, bpm: 72, inside: false })
  const [selected, setSelected] = useState('')
  const [ui, setUi] = useState({ exploded: false, inside: false, speed: 1, bpm: 72 })

  useEffect(() => {
    let disposed = false
    let cleanup: (() => void) | undefined
    const mount = mountRef.current
    if (!mount) return
    void (async () => {
      const THREE = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
      if (disposed || !mountRef.current) return
      cleanup = buildScene(THREE, OrbitControls, mount, kind, paramsRef.current, (s) => setSelected(s), lang)
    })().catch((e) => console.error('3D load failed', e))
    return () => {
      disposed = true
      cleanup?.()
    }
  }, [kind, lang])

  const toggle = (key: 'exploded' | 'inside') => {
    const v = !paramsRef.current[key]
    paramsRef.current[key] = v
    setUi((u) => ({ ...u, [key]: v }))
  }
  const setSpeed = (n: number) => {
    paramsRef.current.speed = n
    setUi((u) => ({ ...u, speed: n }))
  }
  const setBpm = (n: number) => {
    paramsRef.current.bpm = n
    setUi((u) => ({ ...u, bpm: n }))
  }

  const hasExplode = kind !== 'africa'
  const hasInside = kind === 'pyramid'
  const hasBpm = kind === 'heart'
  const hasSpeed = kind === 'sun' || kind === 'atom' || kind === 'water'

  return (
    <div className="scene3d">
      <div className="scene3d-canvas" ref={mountRef} />
      {selected && <div className="scene3d-label">{selected}</div>}
      <div className="scene3d-hint">{t(lang, 'dragHint')}</div>
      <div className="scene3d-controls">
        {hasExplode && (
          <button className="ghost-btn small" onClick={() => toggle('exploded')}>
            {ui.exploded ? t(lang, 'assemble') : t(lang, 'explode')}
          </button>
        )}
        {hasInside && (
          <button className="ghost-btn small" onClick={() => toggle('inside')}>
            {ui.inside ? t(lang, 'hideInside') : t(lang, 'showInside')}
          </button>
        )}
        {hasSpeed && (
          <label className="scene-slider">
            {t(lang, 'speed')}
            <input
              type="range"
              min={0}
              max={3}
              step={0.1}
              value={ui.speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </label>
        )}
        {hasBpm && (
          <label className="scene-slider">
            {t(lang, 'bpm')}: {ui.bpm}
            <input
              type="range"
              min={40}
              max={160}
              step={1}
              value={ui.bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </label>
        )}
      </div>
    </div>
  )
}
