import { useEffect, useRef, useState } from 'react'
import { t, type Lang } from './i18n'
import { sound } from './sound'
import { awardBadge } from './rewards'

/* ---------- 1. Electric circuit ---------- */

function Circuit({ lang }: { lang: Lang }) {
  const [closed, setClosed] = useState(true)
  const [parallel, setParallel] = useState(true)
  const lit = closed
  const dim = closed && !parallel
  return (
    <div className="lab-card">
      <h3 className="chart-title">💡 {t(lang, 'labCircuit')}</h3>
      <div className="lab-toolbar">
        <button className={closed ? 'step-btn active' : 'step-btn'} onClick={() => (setClosed(!closed), sound.click())}>
          {t(lang, 'labSwitch')}: {closed ? t(lang, 'labClosed') : t(lang, 'labOpen')}
        </button>
        <button className={parallel ? 'step-btn active' : 'step-btn'} onClick={() => (setParallel(true), sound.click())}>
          {t(lang, 'labParallel')}
        </button>
        <button className={!parallel ? 'step-btn active' : 'step-btn'} onClick={() => (setParallel(false), sound.click())}>
          {t(lang, 'labSeries')}
        </button>
      </div>
      <svg viewBox="0 0 460 230" className="lab-svg">
        <g stroke="#5a5146" strokeWidth="3" fill="none">
          <line x1="30" y1="60" x2="30" y2="170" />
          <line x1="30" y1="170" x2="430" y2="170" />
          <line x1="430" y1="60" x2="430" y2="170" />
          <line x1="60" y1="60" x2="90" y2="60" />
          {closed ? <line x1="130" y1="60" x2="170" y2="60" /> : <line x1="130" y1="60" x2="148" y2="60" />}
          <line x1="200" y1="60" x2="430" y2="60" />
        </g>
        <g stroke="#5a5146" strokeWidth="3" fill="none">
          {parallel ? (
            <>
              <line x1="170" y1="60" x2="170" y2="115" />
              <line x1="170" y1="115" x2="290" y2="115" />
              <line x1="170" y1="115" x2="290" y2="115" />
              <line x1="230" y1="60" x2="230" y2="115" />
              <line x1="230" y1="60" x2="290" y2="60" />
              <line x1="290" y1="60" x2="290" y2="115" />
            </>
          ) : (
            <>
              <line x1="170" y1="60" x2="170" y2="115" />
              <line x1="170" y1="115" x2="230" y2="115" />
              <line x1="230" y1="115" x2="230" y2="60" />
            </>
          )}
        </g>
        <rect x="90" y="48" width="40" height="24" rx="3" fill={closed ? '#d9822b' : '#c9bda5'} />
        <circle cx="200" cy="115" r="16" fill={lit ? '#ffd54f' : '#eee'} stroke="#5a5146" strokeWidth="2.5" opacity={dim ? 0.55 : 1} />
        <circle cx="260" cy="115" r="16" fill={lit ? '#ffd54f' : '#eee'} stroke="#5a5146" strokeWidth="2.5" opacity={dim ? 0.55 : 1} />
        <text x="200" y="150" textAnchor="middle" fontSize="12" fill="#5a5146">1</text>
        <text x="260" y="150" textAnchor="middle" fontSize="12" fill="#5a5146">2</text>
      </svg>
      <p className="kid-note">{t(lang, 'labCircuitNote')}</p>
    </div>
  )
}

/* ---------- 2. Projectile ---------- */

function Projectile({ lang }: { lang: Lang }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const [angle, setAngle] = useState(45)
  const [power, setPower] = useState(60)
  const [flying, setFlying] = useState(false)
  const [dist, setDist] = useState(0)

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const launch = () => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    sound.whoosh()
    cancelAnimationFrame(rafRef.current)
    const w = cv.width
    const h = cv.height
    const rad = (angle * Math.PI) / 180
    const v = power * 4.2
    let x = 24
    let y = h - 34
    let vx = Math.cos(rad) * v
    let vy = -Math.sin(rad) * v
    const g = 0.32
    const trail: [number, number][] = []
    setFlying(true)
    setDist(0)
    const step = () => {
      vy += g
      x += vx
      y += vy
      trail.push([x, y])
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#bcd9f5'
      ctx.fillRect(0, 0, w, h - 26)
      ctx.fillStyle = '#8fbf7f'
      ctx.fillRect(0, h - 26, w, 26)
      ctx.strokeStyle = 'rgba(216, 130, 43, 0.65)'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      trail.forEach(([px2, py2], i) => (i ? ctx.lineTo(px2, py2) : ctx.moveTo(px2, py2)))
      ctx.stroke()
      ctx.fillStyle = '#d8762b'
      ctx.beginPath()
      ctx.arc(x, y, 9, 0, Math.PI * 2)
      ctx.fill()
      if (y < h - 26 && x < w && x > -20) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setDist(Math.max(0, Math.round(x)))
        setFlying(false)
        sound.pop()
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  return (
    <div className="lab-card">
      <h3 className="chart-title">🚀 {t(lang, 'labProjectile')}</h3>
      <canvas ref={canvasRef} width={460} height={230} className="lab-canvas" />
      <div className="lab-toolbar">
        <label className="scene-slider">
          {t(lang, 'labAngle')}: {angle}°
          <input type="range" min={10} max={80} value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
        </label>
        <label className="scene-slider">
          {t(lang, 'labPower')}: {power}
          <input type="range" min={20} max={100} value={power} onChange={(e) => setPower(Number(e.target.value))} />
        </label>
        <button className="primary-btn small" onClick={launch} disabled={flying}>
          {t(lang, 'labLaunch')}
        </button>
        <span className="kid-note">
          {t(lang, 'labDistance')}: {dist}
        </span>
      </div>
    </div>
  )
}

/* ---------- 3. pH scale ---------- */

const SUBSTANCES = [
  { id: 'lemon', ph: 2, label: { ar: 'ليمون 🍋', fr: 'Citron 🍋', en: 'Lemon 🍋' } },
  { id: 'vinegar', ph: 3, label: { ar: 'خل 🧪', fr: 'Vinaigre 🧪', en: 'Vinegar 🧪' } },
  { id: 'rain', ph: 5.5, label: { ar: 'ماء المطر 🌧', fr: 'Eau de pluie 🌧', en: 'Rainwater 🌧' } },
  { id: 'water', ph: 7, label: { ar: 'ماء نقي 💧', fr: 'Eau pure 💧', en: 'Pure water 💧' } },
  { id: 'soap', ph: 9, label: { ar: 'صابون 🧼', fr: 'Savon 🧼', en: 'Soap 🧼' } },
  { id: 'bleach', ph: 12.5, label: { ar: 'مبيض 🫧', fr: 'Eau de Javel 🫧', en: 'Bleach 🫧' } },
]

function PhScale({ lang }: { lang: Lang }) {
  const [sel, setSel] = useState('water')
  const sub = SUBSTANCES.find((s) => s.id === sel) ?? SUBSTANCES[3]
  const y = 10 + ((14 - sub.ph) / 14) * 200
  const kind = sub.ph < 6.5 ? t(lang, 'labPhAcid') : sub.ph > 7.5 ? t(lang, 'labPhBase') : t(lang, 'labPhNeutral')
  return (
    <div className="lab-card">
      <h3 className="chart-title">🌈 {t(lang, 'labPh')}</h3>
      <div className="ph-wrap">
        <svg viewBox="0 0 90 230" className="ph-svg">
          <defs>
            <linearGradient id="phg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2554d" />
              <stop offset="45%" stopColor="#ffd54f" />
              <stop offset="50%" stopColor="#8fbf7f" />
              <stop offset="100%" stopColor="#3b6fd1" />
            </linearGradient>
          </defs>
          <rect x="30" y="10" width="30" height="210" rx="15" fill="url(#phg)" stroke="#5a5146" strokeWidth="2" />
          <polygon points={`22,${y} 30,${y - 8} 30,${y + 8}`} fill="#16293f" />
        </svg>
        <div className="ph-info">
          <p className="kid-note">
            {sub.label[lang]} — pH {sub.ph} ({kind})
          </p>
          <div className="diagram-steps">
            {SUBSTANCES.map((s) => (
              <button key={s.id} className={sel === s.id ? 'step-btn active' : 'step-btn'} onClick={() => (setSel(s.id), sound.pop())}>
                {s.label[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- 4. Pythagoras ---------- */

function Pythagoras({ lang }: { lang: Lang }) {
  const [a, setA] = useState(3)
  const [b, setB] = useState(4)
  const c = Math.sqrt(a * a + b * b)
  const s = 26
  const x0 = 250
  const y0 = 190
  const ax = x0 - (a * s) / 2 - b * s
  const ay = y0
  const bx = x0 - (a * s) / 2
  const by = y0
  const cx2 = x0 - (a * s) / 2
  const cy2 = y0 - a * s
  return (
    <div className="lab-card">
      <h3 className="chart-title">📐 {t(lang, 'labPyth')}</h3>
      <svg viewBox="0 0 460 240" className="lab-svg">
        <rect x={ax - b * s} y={ay} width={b * s} height={b * s} fill="#ffd54f" opacity="0.5" />
        <rect x={bx} y={cy2 - a * s} width={a * s} height={a * s} fill="#8fc3e8" opacity="0.5" />
        <polygon
          points={`${ax},${ay} ${ax + c * Math.cos(Math.atan2(cy2 - ay, cx2 - ax)) * s * 2},${ay} ${bx},${by} ${cx2},${cy2}`}
          fill="rgba(142, 111, 181, 0.3)"
        />
        <polygon points={`${ax},${ay} ${bx},${by} ${cx2},${cy2}`} fill="#7d5ba6" />
        <text x={ax + (bx - ax) / 2} y={ay + 16} fontSize="13" fill="#5a5146" textAnchor="middle">
          b² = {b * b}
        </text>
        <text x={bx + (a * s) / 2} y={cy2 - a * s + 16} fontSize="13" fill="#5a5146" textAnchor="middle">
          a² = {a * a}
        </text>
        <text x={(bx + cx2) / 2 + 40} y={(by + cy2) / 2} fontSize="13" fill="#5a5146">
          c² = {c.toFixed(2)}² ≈ {(c * c).toFixed(1)}
        </text>
      </svg>
      <div className="lab-toolbar">
        <label className="scene-slider">
          a: {a}
          <input type="range" min={1} max={6} value={a} onChange={(e) => setA(Number(e.target.value))} />
        </label>
        <label className="scene-slider">
          b: {b}
          <input type="range" min={1} max={6} value={b} onChange={(e) => setB(Number(e.target.value))} />
        </label>
      </div>
      <p className="kid-note">
        {a * a} + {b * b} = {(c * c).toFixed(1)} — {t(lang, 'labPythNote')}
      </p>
    </div>
  )
}

export default function Lab({ lang }: { lang: Lang }) {
  useEffect(() => {
    awardBadge('scientist')
  }, [])
  return (
    <div className="page-wide lab">
      <h1 className="article-title">🧪 {t(lang, 'navLab')}</h1>
      <p className="empty">{t(lang, 'labIntro')}</p>
      <div className="lab-grid">
        <Circuit lang={lang} />
        <Projectile lang={lang} />
        <PhScale lang={lang} />
        <Pythagoras lang={lang} />
      </div>
    </div>
  )
}
