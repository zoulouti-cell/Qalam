import { useEffect, useState } from 'react'
import { t, type Lang } from './i18n'
import type { DiagramKind } from './mediaData'

/* ---------- generic SVG chart components ---------- */

export function BarChart({
  title,
  items,
  lang,
}: {
  title: string
  items: { label: string; value: number; color: string }[]
  lang: Lang
}) {
  const max = Math.max(...items.map((i) => i.value))
  const w = 480
  const rowH = 34
  const padL = 8
  const barMax = 240
  const h = items.length * rowH + 24
  return (
    <div className="chart-card">
      <h4 className="chart-title">{title}</h4>
      <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" role="img">
        {items.map((it, i) => {
          const y = 16 + i * rowH
          const bw = Math.max(6, (it.value / max) * barMax)
          return (
            <g key={i}>
              <text
                x={lang === 'ar' ? w - padL : padL}
                y={y + 11}
                textAnchor={lang === 'ar' ? 'end' : 'start'}
                className="chart-label"
                fontSize={13}
              >
                {it.label}
              </text>
              <rect
                x={lang === 'ar' ? w - padL - 160 - bw : 170}
                y={y}
                width={bw}
                height={18}
                rx={5}
                fill={it.color}
              />
              <text
                x={lang === 'ar' ? w - padL - 166 - bw : 174 + bw}
                y={y + 13}
                className="chart-value"
                fontSize={11.5}
                textAnchor={lang === 'ar' ? 'end' : 'start'}
              >
                {it.value.toLocaleString(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-US')}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function PieChart({
  title,
  items,
}: {
  title: string
  items: { label: string; value: number; color: string }[]
}) {
  const total = items.reduce((s, i) => s + i.value, 0)
  const cx = 100
  const cy = 100
  const r = 78
  let angle = -Math.PI / 2
  const arcs = items.map((it) => {
    const a0 = angle
    angle += (it.value / total) * Math.PI * 2
    const a1 = angle
    const large = a1 - a0 > Math.PI ? 1 : 0
    const x0 = cx + r * Math.cos(a0)
    const y0 = cy + r * Math.sin(a0)
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    return { it, d: `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z` }
  })
  return (
    <div className="chart-card">
      <h4 className="chart-title">{title}</h4>
      <div className="pie-wrap">
        <svg viewBox="0 0 200 200" className="pie-svg" role="img">
          {arcs.map((a, i) => (
            <path key={i} d={a.d} fill={a.it.color} stroke="#fff" strokeWidth={1.5} />
          ))}
        </svg>
        <ul className="pie-legend">
          {items.map((it, i) => (
            <li key={i}>
              <span className="pie-dot" style={{ background: it.color }} />
              {it.label} — {((it.value / total) * 100).toFixed(it.value < 1 ? 3 : 1)}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------- interactive diagrams ---------- */

export function Diagram({ kind, lang, title }: { kind: DiagramKind; lang: Lang; title: string }) {
  const [sel, setSel] = useState<string>('')

  const stepText = (k: string) => t(lang, k + 'Text')

  if (kind === 'water') {
    const steps = ['evap', 'cond', 'prec', 'run'] as const
    return (
      <div className="diagram-card">
        <h4 className="chart-title">{t(lang, 'mediaDiagram')} — {title}</h4>
        <svg viewBox="0 0 520 300" className="diagram-svg" role="img">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bcd8f2" />
              <stop offset="100%" stopColor="#e8f2fb" />
            </linearGradient>
          </defs>
          <rect width="520" height="300" fill="url(#sky)" />
          <circle cx="455" cy="48" r="26" fill="#ffd54f" className={sel === 'evap' ? 'hot' : ''}>
            <animate attributeName="r" values="26;28;26" dur="4s" repeatCount="indefinite" />
          </circle>
          <g className={sel === 'evap' ? 'hot' : ''}>
            <path d="M 455 74 V 200" stroke="#d9822b" strokeWidth="3" fill="none" strokeDasharray="6 6" />
            <path d="M 448 190 l 7 -12 l 7 12 z" fill="#d9822b" />
          </g>
          <g className="cloud">
            <ellipse cx="250" cy="72" rx="58" ry="26" fill="#ffffff" />
            <ellipse cx="300" cy="86" rx="46" ry="22" fill="#ffffff" />
            <ellipse cx="206" cy="88" rx="38" ry="18" fill="#ffffff" />
          </g>
          <g className={sel === 'cond' ? 'hot' : ''}>
            <path d="M 210 118 C 235 132, 265 132, 290 116" stroke="#5b8fc9" strokeWidth="3" fill="none" strokeDasharray="6 6" />
            <path d="M 282 108 l -12 6 l 4 12 z" fill="#5b8fc9" />
          </g>
          <g className={sel === 'prec' ? 'hot' : ''}>
            <path d="M 262 110 v 92" stroke="#3d7db8" strokeWidth="3" strokeDasharray="5 6" />
            <path d="M 232 112 v 78" stroke="#3d7db8" strokeWidth="3" strokeDasharray="5 6" />
            <path d="M 292 114 v 82" stroke="#3d7db8" strokeWidth="3" strokeDasharray="5 6" />
          </g>
          <path d="M 0 205 Q 130 185 260 205 T 520 205 V 300 H 0 Z" fill="#5fb0e8" />
          <path d="M 0 205 Q 130 185 260 205 T 520 205" stroke="#2f6fb3" strokeWidth="3" fill="none" />
          <g className={sel === 'run' ? 'hot' : ''}>
            <path d="M 470 236 C 430 250, 350 248, 300 238" stroke="#2e7d32" strokeWidth="3.5" fill="none" strokeDasharray="7 5" />
            <path d="M 312 242 l -12 -6 l 4 -12 z" fill="#2e7d32" />
          </g>
          <text x="455" y="150" fontSize="13" fill="#8a5a1b" textAnchor="middle">{t(lang, 'evap')}</text>
          <text x="150" y="105" fontSize="13" fill="#2f6fb3" textAnchor="middle">{t(lang, 'cond')}</text>
          <text x="272" y="160" fontSize="13" fill="#3d7db8" textAnchor="middle">{t(lang, 'prec')}</text>
          <text x="400" y="262" fontSize="13" fill="#2e7d32" textAnchor="middle">{t(lang, 'run')}</text>
        </svg>
        <div className="diagram-steps">
          {steps.map((s) => (
            <button key={s} className={sel === s ? 'step-btn active' : 'step-btn'} onClick={() => setSel(s)}>
              {t(lang, s)}
            </button>
          ))}
        </div>
        {sel && <p className="diagram-caption">{stepText(sel)}</p>}
      </div>
    )
  }

  if (kind === 'heart') {
    const parts = [
      { id: 'rightAtrium', x: 128, y: 118 },
      { id: 'leftAtrium', x: 212, y: 118 },
      { id: 'rightVentricle', x: 128, y: 210 },
      { id: 'leftVentricle', x: 212, y: 210 },
      { id: 'aorta', x: 232, y: 48 },
      { id: 'venaCava', x: 108, y: 48 },
    ] as const
    return (
      <div className="diagram-card">
        <h4 className="chart-title">{t(lang, 'mediaDiagram')} — {title}</h4>
        <svg viewBox="0 0 340 300" className="diagram-svg" role="img">
          <path d="M 170 265 C 90 220 60 180 60 140 C 60 100 90 78 118 78 C 140 78 160 92 170 110 C 180 92 200 78 222 78 C 250 78 280 100 280 140 C 280 180 250 220 170 265 Z" fill="#e57373" stroke="#b03a3a" strokeWidth="3" />
          <path d="M 170 110 V 240" stroke="#b03a3a" strokeWidth="2.5" fill="none" />
          <path d="M 80 150 Q 170 130 260 150" stroke="#b03a3a" strokeWidth="2.5" fill="none" />
          <path d="M 232 30 C 226 50 226 66 236 84" stroke="#d13b3b" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M 108 30 C 114 50 114 66 104 84" stroke="#3b6fd1" strokeWidth="7" fill="none" strokeLinecap="round" />
          {parts.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r="13"
              fill={sel === p.id ? '#ffd54f' : 'transparent'}
              stroke={sel === p.id ? '#b38600' : 'rgba(255,255,255,0.5)'}
              strokeWidth={sel === p.id ? 3 : 1.5}
              className="clickable"
              onClick={() => setSel(p.id)}
            />
          ))}
          <circle cx="170" cy="90" r="4" fill="#fff">
            <animateMotion dur="2.4s" repeatCount="indefinite" path="M 170 90 Q 100 130 60 170" />
          </circle>
        </svg>
        <div className="diagram-steps">
          {parts.map((p) => (
            <button key={p.id} className={sel === p.id ? 'step-btn active' : 'step-btn'} onClick={() => setSel(p.id)}>
              {t(lang, p.id)}
            </button>
          ))}
        </div>
        {sel && <p className="diagram-caption">{t(lang, sel)} ✓</p>}
      </div>
    )
  }

  if (kind === 'atom') {
    const shells = [
      { r: 42, n: 2, key: 'electronShell' },
      { r: 66, n: 4, key: 'electronShell' },
      { r: 90, n: 2, key: 'electronShell' },
    ]
    return (
      <div className="diagram-card">
        <h4 className="chart-title">{t(lang, 'mediaDiagram')} — {title}</h4>
        <svg viewBox="0 0 300 300" className="diagram-svg" role="img">
          {shells.map((s, i) => (
            <circle key={i} cx="150" cy="150" r={s.r} fill="none" stroke="#8fb8d8" strokeWidth="1.5" className={sel === s.key ? 'hot' : ''} onClick={() => setSel(s.key)} />
          ))}
          <g onClick={() => setSel('nucleus')} className={sel === 'nucleus' ? 'hot' : ''}>
            <circle cx="150" cy="150" r="26" fill="#e05a5a" />
            <circle cx="140" cy="143" r="7" fill="#e05a5a" stroke="#c24b4b" />
            <circle cx="158" cy="152" r="7" fill="#9aa0a6" stroke="#7f848a" />
            <circle cx="153" cy="140" r="7" fill="#e05a5a" stroke="#c24b4b" />
            <circle cx="145" cy="156" r="7" fill="#9aa0a6" stroke="#7f848a" />
          </g>
          {shells.map((s, si) =>
            Array.from({ length: s.n }, (_, i) => {
              const a = (i / s.n) * Math.PI * 2 + si * 0.7
              return (
                <circle
                  key={`${si}-${i}`}
                  cx={150 + s.r * Math.cos(a)}
                  cy={150 + s.r * Math.sin(a)}
                  r="5"
                  fill="#4fc3f7"
                  className={sel === 'electrons' ? 'hot' : ''}
                  onClick={() => setSel('electrons')}
                />
              )
            })
          )}
        </svg>
        <div className="diagram-steps">
          {(['nucleus', 'protons', 'neutrons', 'electrons', 'electronShell'] as const).map((k) => (
            <button key={k} className={sel === k ? 'step-btn active' : 'step-btn'} onClick={() => setSel(k)}>
              {t(lang, k)}
            </button>
          ))}
        </div>
        {sel && <p className="diagram-caption">{t(lang, sel)} ✓</p>}
      </div>
    )
  }

  if (kind === 'pyramid') {
    const parts = [
      { id: 'kingChamber', x: 260, y: 128 },
      { id: 'queenChamber', x: 260, y: 196 },
      { id: 'grandGallery', x: 300, y: 152 },
      { id: 'entrance', x: 320, y: 222 },
    ] as const
    return (
      <div className="diagram-card">
        <h4 className="chart-title">{t(lang, 'mediaDiagram')} — {title}</h4>
        <svg viewBox="0 0 440 260" className="diagram-svg" role="img">
          <rect width="440" height="260" fill="#eef3f7" />
          <polygon points="40,240 400,240 220,30" fill="#e0c088" stroke="#b0894c" strokeWidth="3" />
          <line x1="220" y1="30" x2="220" y2="240" stroke="#b0894c" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="120" y1="240" x2="240" y2="135" stroke="#b0894c" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="320" y1="240" x2="200" y2="135" stroke="#b0894c" strokeWidth="1.5" strokeDasharray="4 4" />
          <rect x="238" y="112" width="44" height="26" rx="3" fill={sel === 'kingChamber' ? '#ffd54f' : '#8a6d3b'} className="clickable" onClick={() => setSel('kingChamber')} />
          <rect x="238" y="186" width="44" height="24" rx="3" fill={sel === 'queenChamber' ? '#ffd54f' : '#9c7c45'} className="clickable" onClick={() => setSel('queenChamber')} />
          <rect x="252" y="150" width="62" height="16" rx="3" transform="rotate(-26 283 158)" fill={sel === 'grandGallery' ? '#ffd54f' : '#b0894c'} className="clickable" onClick={() => setSel('grandGallery')} />
          <rect x="296" y="212" width="52" height="18" rx="3" fill={sel === 'entrance' ? '#ffd54f' : '#a57f41'} className="clickable" onClick={() => setSel('entrance')} />
          <rect x="30" y="240" width="380" height="20" fill="#d9c9a8" />
          {parts.map((p) => (
            <text key={p.id} x={p.x} y={p.y + 4} fontSize="11" fill="#4a3620" textAnchor="middle" pointerEvents="none">
              {t(lang, p.id)}
            </text>
          ))}
        </svg>
        <div className="diagram-steps">
          {parts.map((p) => (
            <button key={p.id} className={sel === p.id ? 'step-btn active' : 'step-btn'} onClick={() => setSel(p.id)}>
              {t(lang, p.id)}
            </button>
          ))}
        </div>
        {sel && <p className="diagram-caption">{t(lang, sel)} ✓</p>}
      </div>
    )
  }

  if (kind === 'solar') {
    const planets = [
      { key: 'pMercury', d: 28, size: 4, color: '#b8a99a' },
      { key: 'pVenus', d: 58, size: 6, color: '#e8c98a' },
      { key: 'pEarth', d: 92, size: 7, color: '#4f9dde' },
      { key: 'pMars', d: 128, size: 5, color: '#d76b4f' },
      { key: 'pJupiter', d: 210, size: 15, color: '#d9a066' },
      { key: 'pSaturn', d: 290, size: 13, color: '#e5cf8a' },
      { key: 'pUranus', d: 360, size: 10, color: '#86d5e8' },
      { key: 'pNeptune', d: 420, size: 9, color: '#4a6fd8' },
    ]
    return (
      <div className="diagram-card">
        <h4 className="chart-title">{t(lang, 'mediaDiagram')} — {title}</h4>
        <svg viewBox="0 0 460 140" className="diagram-svg" role="img">
          <line x1="12" y1="70" x2="450" y2="70" stroke="#c9bda5" strokeWidth="2" />
          <circle cx="14" cy="70" r="11" fill="#ffb347" onClick={() => setSel('pSun')} className={sel === 'pSun' ? 'hot' : ''} />
          {planets.map((p) => (
            <g key={p.key} onClick={() => setSel(p.key)} className={sel === p.key ? 'hot' : ''}>
              <circle cx={p.d} cy="70" r={p.size} fill={p.color} />
              <text x={p.d} y={p.size > 8 ? 96 : 90} fontSize="10.5" textAnchor="middle" fill="#5a5146">
                {t(lang, p.key)}
              </text>
            </g>
          ))}
        </svg>
        <div className="diagram-steps">
          <button className={sel === 'pSun' ? 'step-btn active' : 'step-btn'} onClick={() => setSel('pSun')}>
            {t(lang, 'pSun')}
          </button>
          {planets.map((p) => (
            <button key={p.key} className={sel === p.key ? 'step-btn active' : 'step-btn'} onClick={() => setSel(p.key)}>
              {t(lang, p.key)}
            </button>
          ))}
        </div>
        {sel && <p className="diagram-caption">{t(lang, sel)} ✓</p>}
      </div>
    )
  }

  /* africa map from GeoJSON */
  return <AfricaMap lang={lang} title={title} />
}

function AfricaMap({ lang, title }: { lang: Lang; title: string }) {
  const [sel, setSel] = useState('')
  const [paths, setPaths] = useState<{ d: string; name: string }[]>([])
  const [err, setErr] = useState(false)

  useEffect(() => {
    let live = true
    void fetch('/assets/ne_110m_admin_0_countries.geojson')
      .then((r) => r.json())
      .then((data: { features: any[] }) => {
        if (!live) return
        const out: { d: string; name: string }[] = []
        const X = (lon: number) => 30 + (lon + 20) * 8.1
        const Y = (lat: number) => 30 + (38 - lat) * 7.3
        for (const f of data.features) {
          const props = f.properties
          if (!props || props.CONTINENT !== 'Africa') continue
          const polys: any[][][] = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
          const name =
            (lang === 'ar' ? props.NAME_AR : lang === 'fr' ? props.NAME_FR : props.NAME_EN) ||
            props.NAME ||
            props.ADMIN
          for (const poly of polys) {
            const ring = poly[0] as [number, number][]
            if (!ring || ring.length < 4) continue
            let d = ''
            ring.forEach(([lon, lat], i) => {
              d += `${i === 0 ? 'M' : 'L'} ${X(lon).toFixed(1)} ${Y(lat).toFixed(1)} `
            })
            out.push({ d: d + 'Z', name })
          }
        }
        setPaths(out)
      })
      .catch(() => live && setErr(true))
    return () => {
      live = false
    }
  }, [lang])

  if (err) return <p className="empty">Map unavailable</p>
  return (
    <div className="diagram-card">
      <h4 className="chart-title">{t(lang, 'mediaDiagram')} — {title}</h4>
      <svg viewBox="0 0 520 430" className="diagram-svg" role="img">
        <rect width="520" height="430" fill="#e8f2fb" />
        <line x1="30" y1="196" x2="505" y2="196" stroke="#d9822b" strokeWidth="2" strokeDasharray="6 5" />
        {paths.length === 0 && <text x="260" y="215" fontSize="14" fill="#888" textAnchor="middle">…</text>}
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={sel === p.name ? '#ffd54f' : '#e8c98a'}
            stroke="#7a5a2a"
            strokeWidth="1.2"
            className="clickable"
            onClick={() => setSel(p.name)}
          />
        ))}
        <text x="260" y="420" fontSize="12" fill="#4a3620" textAnchor="middle">
          {sel || (lang === 'ar' ? 'انقر على دولة' : lang === 'fr' ? 'Cliquez sur un pays' : 'Click a country')}
        </text>
      </svg>
    </div>
  )
}
