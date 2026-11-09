import { useState } from 'react'
import type { Lang } from './i18n'
import { STAGE_FIGURES, type StageKey } from './stellarFigures'
import { STAGE_CHILD } from './stellarFiguresKids'

/* Realistic procedural portraits for each stellar stage (SVG with fractal-noise
   textures + bloom). Used until a photoreal asset is dropped into
   public/assets/stellar/<stage>.webp — then the real image takes over. */

function Starfield({ seed }: { seed: number }) {
  // deterministic pseudo-stars
  const stars = Array.from({ length: 46 }, (_, i) => {
    const h = (seed * 9301 + i * 49297) % 233280
    const x = (h % 300) + 10
    const y = ((h * 7) % 250) + 10
    const r = 0.4 + ((h * 13) % 10) / 12
    return <circle key={i} cx={x} cy={y} r={r} fill="#dfe9ff" opacity={0.25 + ((h * 3) % 60) / 140} />
  })
  return <g>{stars}</g>
}

type P = { id: string; size?: number }

function Nebula({ id }: P) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-wisp`} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#8fb3ff" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#8f5bd8" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#0a1430" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-turb`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.016" numOctaves="5" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="34" />
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <rect width="320" height="300" fill="#04070f" />
      <Starfield seed={11} />
      <g filter={`url(#${id}-turb)`}>
        <ellipse cx="150" cy="150" rx="130" ry="86" fill={`url(#${id}-wisp)`} />
        <ellipse cx="210" cy="120" rx="70" ry="46" fill={`url(#${id}-wisp)`} opacity="0.7" />
        <ellipse cx="96" cy="190" rx="86" ry="40" fill="#1b2a4d" opacity="0.55" />
      </g>
    </g>
  )
}

function Proto({ id }: P) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-core`}>
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="45%" stopColor="#ffb266" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ff7a3d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-disk`} x1="0" x2="1">
          <stop offset="0%" stopColor="#d9a25a" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#f4c98a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#d9a25a" stopOpacity="0.12" />
        </linearGradient>
        <filter id={`${id}-jet`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" scale="6" />
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <rect width="320" height="300" fill="#05070d" />
      <Starfield seed={23} />
      <g filter={`url(#${id}-jet)`} opacity="0.85">
        <path d="M160 150 L118 26" stroke="#ffcf8a" strokeWidth="7" opacity="0.5" />
        <path d="M160 150 L202 26" stroke="#ffcf8a" strokeWidth="7" opacity="0.5" />
        <path d="M160 150 L126 274" stroke="#9fd0ff" strokeWidth="7" opacity="0.4" />
        <path d="M160 150 L194 274" stroke="#9fd0ff" strokeWidth="7" opacity="0.4" />
      </g>
      <ellipse cx="160" cy="150" rx="118" ry="30" fill={`url(#${id}-disk)`} />
      <ellipse cx="160" cy="150" rx="118" ry="30" fill="none" stroke="#f6d9a6" strokeOpacity="0.4" strokeDasharray="2 5" />
      <circle cx="160" cy="148" r="34" fill={`url(#${id}-core)`} />
      <circle cx="160" cy="148" r="10" fill="#fffbe8" />
    </g>
  )
}

function StarSurface({ id, hot, giant }: P & { hot?: boolean; giant?: boolean }) {
  const base = hot ? '#cfe4ff' : giant ? '#ff8a52' : '#ffd98a'
  const deep = hot ? '#5f8fdc' : giant ? '#b3351f' : '#e08a3c'
  const r = giant ? 112 : hot ? 62 : 78
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-sphere`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor={base} />
          <stop offset="82%" stopColor={deep} />
          <stop offset="100%" stopColor={deep} stopOpacity="0.85" />
        </radialGradient>
        <filter id={`${id}-gran`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency={giant ? '0.012 0.02' : '0.05 0.045'} numOctaves="5" seed="9" result="t" />
          <feColorMatrix in="t" type="saturate" values="0" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="0.9" k2="0.55" k3="0.15" k4="0" />
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
        <filter id={`${id}-bloom`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <radialGradient id={`${id}-limb`}>
          <stop offset="72%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.42" />
        </radialGradient>
      </defs>
      <rect width="320" height="300" fill="#04060c" />
      <Starfield seed={35} />
      <circle cx="160" cy="150" r={r * 1.5} fill={base} opacity={hot ? 0.3 : 0.22} filter={`url(#${id}-bloom)`} />
      <circle cx="160" cy="150" r={r} fill={`url(#${id}-sphere)`} filter={`url(#${id}-gran)`} />
      <circle cx="160" cy="150" r={r} fill={`url(#${id}-limb)`} />
      {giant && (
        <g opacity="0.35" filter={`url(#${id}-gran)`}>
          <ellipse cx="130" cy="128" rx="30" ry="16" fill="#7e1f12" />
          <ellipse cx="196" cy="182" rx="24" ry="12" fill="#8c2a16" />
        </g>
      )}
      {!giant && !hot && (
        <g opacity="0.5">
          <ellipse cx="128" cy="132" rx="12" ry="6" fill="#a85b1c" />
          <ellipse cx="196" cy="168" rx="9" ry="5" fill="#a85b1c" />
        </g>
      )}
    </g>
  )
}

function Planetary({ id }: P) {
  return (
    <g>
      <defs>
        <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.03" numOctaves="4" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" scale="26" />
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <rect width="320" height="300" fill="#04060c" />
      <Starfield seed={47} />
      <g filter={`url(#${id}-soft)`}>
        {[0.55, 0.8, 1.05].map((k, i) => (
          <ellipse
            key={i}
            cx="160"
            cy="150"
            rx={96 * k}
            ry={66 * k}
            fill="none"
            stroke={i % 2 ? '#f3d17e' : '#7fd4c1'}
            strokeOpacity={0.75 - i * 0.18}
            strokeWidth={6 - i * 1.4}
          />
        ))}
      </g>
      <circle cx="160" cy="150" r="26" fill="#dfe9ff" opacity="0.25" filter={`url(#${id}-soft)`} />
      <circle cx="160" cy="150" r="7" fill="#ffffff" />
    </g>
  )
}

function Supernova({ id }: P) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-flash`}>
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#ffe9a8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff8a3d" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-debris`}>
          <feTurbulence type="turbulence" baseFrequency="0.03 0.05" numOctaves="4" seed="13" result="n" />
          <feDisplacementMap in="SourceGraphic" scale="30" />
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <rect width="320" height="300" fill="#03050b" />
      <Starfield seed={59} />
      <circle cx="160" cy="150" r="120" fill={`url(#${id}-flash)`} opacity="0.55" />
      <g filter={`url(#${id}-debris)`}>
        <ellipse cx="160" cy="150" rx="130" ry="110" fill="none" stroke="#ffb36b" strokeOpacity="0.7" strokeWidth="9" />
        <ellipse cx="160" cy="150" rx="96" ry="78" fill="none" stroke="#ff7f5c" strokeOpacity="0.55" strokeWidth="6" />
        <ellipse cx="160" cy="150" rx="62" ry="50" fill="none" stroke="#7fd4ff" strokeOpacity="0.4" strokeWidth="4" />
      </g>
      <circle cx="160" cy="150" r="16" fill="#fffdf0" />
    </g>
  )
}

function Remnant({ id, kind }: P & { kind: 'wd' | 'ns' | 'bh' }) {
  if (kind === 'bh') {
    return (
      <g>
        <defs>
          <linearGradient id={`${id}-disk`} x1="0" x2="1">
            <stop offset="0%" stopColor="#ffb36b" stopOpacity="0.05" />
            <stop offset="45%" stopColor="#ffcf8a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ff7a3d" stopOpacity="0.1" />
          </linearGradient>
          <filter id={`${id}-lens`}>
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        <rect width="320" height="300" fill="#03050b" />
        <Starfield seed={71} />
        <ellipse cx="160" cy="152" rx="118" ry="30" fill={`url(#${id}-disk)`} filter={`url(#${id}-lens)`} />
        <ellipse cx="160" cy="150" rx="86" ry="20" fill="none" stroke="#ffe2b8" strokeOpacity="0.85" strokeWidth="3" />
        <circle cx="160" cy="150" r="44" fill="#000" />
        <circle cx="160" cy="150" r="46" fill="none" stroke="#ffd59a" strokeOpacity="0.7" strokeWidth="1.5" />
      </g>
    )
  }
  const isNs = kind === 'ns'
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-pt`}>
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor={isNs ? '#bfe8ff' : '#f4f8ff'} stopOpacity="0.9" />
          <stop offset="100%" stopColor={isNs ? '#5fa8e0' : '#9fb6d8'} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <rect width="320" height="300" fill="#04060c" />
      <Starfield seed={83} />
      <circle cx="160" cy="150" r="60" fill={`url(#${id}-pt)`} filter={`url(#${id}-glow)`} />
      {isNs && (
        <g opacity="0.75">
          <path d="M160 60 L138 96 M160 60 L182 96" stroke="#9fd8ff" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
          <path d="M160 240 L138 204 M160 240 L182 204" stroke="#9fd8ff" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
          <circle cx="160" cy="150" r="34" fill="none" stroke="#8fd4ff" strokeOpacity="0.35" strokeDasharray="3 7" />
        </g>
      )}
      <circle cx="160" cy="150" r={isNs ? 10 : 13} fill="#ffffff" />
      {!isNs && (
        <g stroke="#dbe7ff" strokeOpacity="0.55" strokeWidth="1.5">
          <path d="M160 116v-22M160 184v22M126 150h-22M194 150h22" />
        </g>
      )}
    </g>
  )
}

function BrownDwarf({ id }: P) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-bd`} cx="42%" cy="35%">
          <stop offset="0%" stopColor="#f6b8c8" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#a1486a" />
          <stop offset="100%" stopColor="#4a1f33" />
        </radialGradient>
        <filter id={`${id}-bands`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.09" numOctaves="4" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="12" />
        </filter>
      </defs>
      <rect width="320" height="300" fill="#04060c" />
      <Starfield seed={97} />
      <circle cx="160" cy="150" r="96" fill="#a1486a" opacity="0.18" />
      <circle cx="160" cy="150" r="68" fill={`url(#${id}-bd)`} filter={`url(#${id}-bands)`} />
      <g opacity="0.3" filter={`url(#${id}-bands)`}>
        <rect x="92" y="128" width="136" height="9" fill="#2c0f1d" />
        <rect x="92" y="156" width="136" height="7" fill="#2c0f1d" />
        <rect x="92" y="176" width="136" height="5" fill="#2c0f1d" />
      </g>
    </g>
  )
}

export function StagePortrait({ stageId }: { stageId: StageKey }) {
  const id = 'sp-' + stageId
  switch (stageId) {
    case 'cloud':
      return <Nebula id={id} />
    case 'protostar':
      return <Proto id={id} />
    case 'mainSun':
      return <StarSurface id={id} />
    case 'mainMassive':
      return <StarSurface id={id} hot />
    case 'redGiant':
      return <StarSurface id={id} giant />
    case 'redSupergiant':
      return <StarSurface id={id} giant />
    case 'planetary':
      return <Planetary id={id} />
    case 'supernova':
      return <Supernova id={id} />
    case 'whiteDwarf':
      return <Remnant id={id} kind="wd" />
    case 'neutron':
      return <Remnant id={id} kind="ns" />
    case 'blackHole':
      return <Remnant id={id} kind="bh" />
    case 'brownDwarf':
      return <BrownDwarf id={id} />
    default:
      return <rect width="320" height="300" fill="#04060c" />
  }
}

/** Caption (explanatory text) + expressive image underneath. */
// generated photoreal assets are not published yet: keep the procedural render
const USE_GENERATED_IMAGES = false

export default function StageFigure({
  stageId,
  lang,
  audience,
}: {
  stageId: StageKey
  lang: Lang
  audience: 'kids' | 'academic'
}) {
  const fig = STAGE_FIGURES[stageId]
  const caption = audience === 'kids' ? STAGE_CHILD[stageId][lang] : fig.caption[lang]
  const [imgOk, setImgOk] = useState(USE_GENERATED_IMAGES)
  const src = `assets/${fig.file}`
  return (
    <figure className="stellar2-figure">
      <figcaption data-audience={audience}>{caption}</figcaption>
      <div className="stellar2-figure-media">
        {imgOk ? (
          <img
            src={src}
            alt={caption}
            loading="lazy"
            decoding="async"
            onError={() => setImgOk(false)}
          />
        ) : null}
        {!imgOk && (
          <svg viewBox="0 0 320 300" role="img" aria-label={caption} className="stellar2-portrait">
            <StagePortrait stageId={stageId} />
          </svg>
        )}
      </div>
      <span className="stellar2-credit" aria-hidden="false">
        {audience === 'kids'
          ? lang === 'ar'
            ? 'رسم توضيحي مبسّط للأطفال'
            : lang === 'fr'
              ? 'Illustration simplifiée pour enfants'
              : 'Simplified illustration for children'
          : lang === 'ar'
            ? 'توضيح علمي: نموذج مُولَّد بالحاسوب'
            : lang === 'fr'
              ? 'Illustration scientifique : rendu généré'
              : 'Scientific illustration: procedurally generated render'}
      </span>
    </figure>
  )
}
