/** Realistic scientific visuals — shared procedural engine (SVG + noise + bloom).
    One engine, many domains, kid/adult captions live in ScientificGallery. */

import { createContext, useContext } from 'react'

export type Mode = 'kids' | 'academic'
const ModeContext = createContext<Mode>('kids')

export type Subject =
  | 'gasGiant'
  | 'rockyPlanet'
  | 'nebula'
  | 'galaxy'
  | 'comet'
  | 'volcano'
  | 'cyclone'
  | 'oceanLayers'
  | 'cell'
  | 'dna'
  | 'neuron'
  | 'heart'
  | 'leaf'
  | 'virus'
  | 'waterMolecule'
  | 'atom'
  | 'crystal'
  | 'waveInterference'
  | 'prism'
  | 'circuit'
  | 'neuralNet'
  | 'chip'

export type Domain = 'space' | 'earth' | 'life' | 'chemistry' | 'physics' | 'tech'

export const SUBJECT_DOMAIN: Record<Subject, Domain> = {
  gasGiant: 'space',
  rockyPlanet: 'space',
  nebula: 'space',
  galaxy: 'space',
  comet: 'space',
  volcano: 'earth',
  cyclone: 'earth',
  oceanLayers: 'earth',
  cell: 'life',
  dna: 'life',
  neuron: 'life',
  heart: 'life',
  leaf: 'life',
  virus: 'life',
  waterMolecule: 'chemistry',
  atom: 'chemistry',
  crystal: 'chemistry',
  waveInterference: 'physics',
  prism: 'physics',
  circuit: 'physics',
  neuralNet: 'tech',
  chip: 'tech',
}

/* ---------- shared filters ---------- */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
        <feColorMatrix in="n" type="saturate" values="0" result="g" />
        <feComponentTransfer in="g" result="g2">
          <feFuncA type="linear" slope="0.10" />
        </feComponentTransfer>
        <feBlend in="SourceGraphic" in2="g2" mode="overlay" />
      </filter>
      <filter id={`${id}-bloom`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
      <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="4" seed="7" result="t" />
        <feDisplacementMap in="SourceGraphic" scale="16" />
        <feGaussianBlur stdDeviation="0.7" />
      </filter>
      <radialGradient id={`${id}-sphere`} cx="36%" cy="30%" r="72%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
        <stop offset="42%" stopColor="#ffffff" stopOpacity="0.02" />
        <stop offset="78%" stopColor="#000000" stopOpacity="0.34" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.62" />
      </radialGradient>
      <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
      </linearGradient>
      <radialGradient id={`${id}-vignette`} cx="50%" cy="48%" r="72%">
        <stop offset="55%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
      </radialGradient>
    </defs>
  )
}

function Frame({ id, bg, children }: { id: string; bg: string; children: React.ReactNode }) {
  const mode = useContext(ModeContext)
  const academic = mode === 'academic'
  return (
    <svg viewBox="0 0 320 220" className={'sci-svg' + (academic ? ' sci-svg-academic' : '')} aria-hidden="true">
      <Defs id={id} />
      <rect width="320" height="220" fill={bg} />
      <g filter={`url(#${id}-grain)`} opacity={academic ? 0.92 : 1}>{children}</g>
      {academic && (
        <g className="sci-graticule" stroke="#9fd8ff" strokeOpacity="0.14" strokeWidth="0.6">
          {[40, 80, 120, 160, 200, 240, 280].map((x) => <line key={'x' + x} x1={x} y1="6" x2={x} y2="214" />)}
          {[30, 60, 90, 120, 150, 180].map((y) => <line key={'y' + y} x1="6" y1={y} x2="314" y2={y} />)}
          <rect x="6" y="6" width="308" height="208" fill="none" stroke="#9fd8ff" strokeOpacity="0.3" />
          {[6, 86, 166, 246, 314].map((x) => <line key={'t' + x} x1={x} y1="6" x2={x} y2="13" strokeOpacity="0.55" />)}
          {[6, 70, 134, 198, 214].map((y) => <line key={'l' + y} x1="6" y1={y} x2="13" y2={y} strokeOpacity="0.55" />)}
        </g>
      )}
      <rect width="320" height="220" fill={`url(#${id}-vignette)`} />
    </svg>
  )
}

const stars = (seed: number) =>
  Array.from({ length: 40 }, (_, i) => {
    const h = (seed * 7919 + i * 104729) % 233280
    return <circle key={i} cx={(h % 310) + 5} cy={((h * 3) % 205) + 5} r={0.5 + ((h * 11) % 9) / 12} fill="#e8f0ff" opacity={0.2 + ((h * 7) % 60) / 160} />
  })

/* ---------- domain figures ---------- */
function GasGiant({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#05070d">
      {stars(3)}
      <circle cx="160" cy="112" r="108" fill="#c9a15e" opacity="0.12" filter={`url(#${id}-bloom)`} />
      <g filter={`url(#${id}-soft)`}>
        <ellipse cx="160" cy="112" rx="86" ry="84" fill="#d8b47a" />
        <ellipse cx="160" cy="70" rx="84" ry="18" fill="#f0dbb0" opacity="0.55" />
        <ellipse cx="160" cy="96" rx="86" ry="16" fill="#b8874f" opacity="0.65" />
        <ellipse cx="160" cy="124" rx="86" ry="14" fill="#e6c99a" opacity="0.55" />
        <ellipse cx="160" cy="150" rx="82" ry="16" fill="#a9743f" opacity="0.6" />
        <ellipse cx="150" cy="140" rx="18" ry="9" fill="#c65f3d" opacity="0.85" />
      </g>
      <ellipse cx="160" cy="112" rx="86" ry="84" fill={`url(#${id}-sphere)`} opacity="0.55" />
      <ellipse cx="128" cy="78" rx="34" ry="22" fill="#fff" opacity="0.14" />
    </Frame>
  )
}

function RockyPlanet({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#05070d">
      {stars(11)}
      <circle cx="160" cy="112" r="70" fill="#c96b3f" opacity="0.16" filter={`url(#${id}-bloom)`} />
      <g filter={`url(#${id}-soft)`}>
        <circle cx="160" cy="112" r="72" fill="#b2603c" />
        <ellipse cx="134" cy="88" rx="30" ry="18" fill="#8f4529" opacity="0.8" />
        <ellipse cx="190" cy="130" rx="26" ry="14" fill="#8f4529" opacity="0.6" />
        <ellipse cx="160" cy="60" rx="64" ry="14" fill="#f5eae0" opacity="0.75" />
        <ellipse cx="160" cy="166" rx="52" ry="10" fill="#f5eae0" opacity="0.6" />
      </g>
      <circle cx="160" cy="112" r="72" fill={`url(#${id}-sphere)`} opacity="0.6" />
      <circle cx="160" cy="112" r="72" fill="none" stroke="#ffd9b0" strokeOpacity="0.25" strokeWidth="1.5" />
    </Frame>
  )
}

function Nebula({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#03040a">
      {stars(19)}
      <g filter={`url(#${id}-soft)`} opacity="0.9">
        <ellipse cx="140" cy="110" rx="120" ry="74" fill="#7d5bd8" opacity="0.35" />
        <ellipse cx="200" cy="90" rx="80" ry="52" fill="#3f8fd8" opacity="0.3" />
        <ellipse cx="110" cy="150" rx="90" ry="46" fill="#d85b7d" opacity="0.22" />
        <ellipse cx="168" cy="118" rx="34" ry="26" fill="#fff2d0" opacity="0.7" />
      </g>
      <circle cx="168" cy="118" r="26" fill="#fff8e6" opacity="0.35" filter={`url(#${id}-bloom)`} />
      <circle cx="168" cy="118" r="4" fill="#fff" />
    </Frame>
  )
}

function Galaxy({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#03040a">
      {stars(23)}
      <g transform="translate(160 110) rotate(-18)" filter={`url(#${id}-soft)`}>
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} rx={92 - i * 18} ry={30 - i * 6} fill="none" stroke={i % 2 ? '#9fc2ff' : '#ffe2b8'} strokeOpacity={0.5 - i * 0.08} strokeWidth={7 - i} />
        ))}
        <ellipse rx="26" ry="10" fill="#fff6df" opacity="0.9" />
      </g>
      <ellipse cx="160" cy="110" rx="24" ry="9" fill="#fff" opacity="0.75" filter={`url(#${id}-bloom)`} />
    </Frame>
  )
}

function Comet({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#03040a">
      {stars(29)}
      <g filter={`url(#${id}-soft)`}>
        <path d="M250 40 L120 130" stroke="#8fd4ff" strokeWidth="26" strokeOpacity="0.25" strokeLinecap="round" />
        <path d="M250 40 L140 120" stroke="#dff0ff" strokeWidth="12" strokeOpacity="0.45" strokeLinecap="round" />
      </g>
      <circle cx="120" cy="130" r="16" fill="#eaf6ff" opacity="0.5" filter={`url(#${id}-bloom)`} />
      <circle cx="120" cy="130" r="8" fill="#ffffff" />
      <circle cx="120" cy="130" r="8" fill="none" stroke="#bfe8ff" strokeOpacity="0.6" />
    </Frame>
  )
}

function Volcano({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#1b120e">
      <path d="M0 200 L90 90 L150 150 L200 80 L320 200 Z" fill="#2a1c16" />
      <path d="M60 200 L120 120 L170 170 L230 110 L320 200 Z" fill="#3a261d" />
      <g filter={`url(#${id}-soft)`}>
        <path d="M140 78 C150 70 172 70 182 80 C176 96 166 104 160 108 C152 100 144 92 140 78 Z" fill="#ff6a2a" />
        <path d="M160 104 C150 140 132 168 118 196 C126 200 136 200 144 196 C152 168 160 140 160 104 Z" fill="#ff8a3d" opacity="0.9" />
        <path d="M162 106 C168 142 182 170 196 198 C202 198 206 194 208 190 C196 164 180 136 162 106 Z" fill="#ffb36b" opacity="0.75" />
      </g>
      <circle cx="160" cy="96" r="34" fill="#ff8a3d" opacity="0.28" filter={`url(#${id}-bloom)`} />
      <ellipse cx="160" cy="200" rx="120" ry="10" fill="#0b0705" opacity="0.7" />
    </Frame>
  )
}

function Cyclone({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#071420">
      <g transform="translate(160 110)">
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 30})`}>
            <ellipse rx={86 - i * 9} ry={26 - i * 3} fill="none" stroke={i % 2 ? '#cfe9ff' : '#8fc6ee'} strokeOpacity={0.55 - i * 0.05} strokeWidth={4 - i * 0.4} filter={`url(#${id}-soft)`} />
          </g>
        ))}
        <circle r="12" fill="#0b2338" />
        <circle r="17" fill="none" stroke="#eaf6ff" strokeOpacity="0.5" strokeWidth="2" />
      </g>
    </Frame>
  )
}

function OceanLayers({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#04121c">
      <rect x="0" y="0" width="320" height="60" fill="#7fc4e8" opacity="0.55" />
      <rect x="0" y="60" width="320" height="60" fill="#2f7fb0" opacity="0.75" />
      <rect x="0" y="120" width="320" height="60" fill="#175a86" opacity="0.85" />
      <rect x="0" y="180" width="320" height="40" fill="#0b3550" />
      <g filter={`url(#${id}-soft)`}>
        <path d="M0 62 Q40 54 80 62 T160 62 T240 62 T320 62" stroke="#dff3ff" strokeOpacity="0.7" strokeWidth="2" fill="none" />
        <path d="M0 120 Q50 112 100 120 T200 120 T320 120" stroke="#bfe8ff" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
      </g>
      <g opacity="0.6">
        <ellipse cx="90" cy="150" rx="16" ry="6" fill="#9fd8ff" opacity="0.4" />
        <ellipse cx="210" cy="166" rx="12" ry="5" fill="#9fd8ff" opacity="0.3" />
      </g>
      <rect x="0" y="0" width="320" height="220" fill={`url(#${id}-depth)`} opacity="0.35" />
    </Frame>
  )
}

function Cell({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#06110d">
      <circle cx="160" cy="110" r="96" fill="#0f3a2b" opacity="0.6" filter={`url(#${id}-bloom)`} />
      <g filter={`url(#${id}-soft)`}>
        <circle cx="160" cy="110" r="86" fill="#2f7a5f" opacity="0.75" />
        <circle cx="160" cy="110" r="86" fill="none" stroke="#8fe0c0" strokeOpacity="0.6" strokeWidth="3" />
        <circle cx="150" cy="100" r="30" fill="#7fc9a8" opacity="0.85" />
        <circle cx="150" cy="100" r="14" fill="#3f8f70" opacity="0.9" />
        {[[210, 70], [216, 140], [100, 160], [120, 66]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="14" ry="8" fill="#a8e6c8" opacity="0.55" transform={`rotate(${i * 40} ${x} ${y})`} />
        ))}
      </g>
      <ellipse cx="132" cy="76" rx="26" ry="16" fill="#fff" opacity="0.12" />
    </Frame>
  )
}

function Dna({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#05080f">
      <g strokeWidth="7" strokeLinecap="round" fill="none">
        {Array.from({ length: 12 }, (_, i) => {
          const y = 20 + i * 16
          const k = Math.sin(i * 0.8) * 40
          return (
            <g key={i}>
              <path d={`M${130 + k} ${y} C ${160} ${y - 6}, ${160} ${y + 6}, ${190 - k} ${y}`} stroke={i % 2 ? '#7fd4c1' : '#f3d17e'} strokeOpacity="0.85" />
              <circle cx={130 + k} cy={y} r="4" fill="#dff3ff" />
              <circle cx={190 - k} cy={y} r="4" fill="#ffe8b8" />
            </g>
          )
        })}
      </g>
      <ellipse cx="160" cy="110" rx="90" ry="100" fill="#7fd4c1" opacity="0.08" filter={`url(#${id}-bloom)`} />
    </Frame>
  )
}

function Neuron({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#0a0616">
      <g filter={`url(#${id}-soft)`} stroke="#c8a8ff" strokeOpacity="0.75" fill="none">
        <path d="M120 110 C70 80, 40 60, 20 40" strokeWidth="4" />
        <path d="M120 110 C80 110, 44 108, 12 104" strokeWidth="3" />
        <path d="M120 110 C70 140, 40 168, 18 190" strokeWidth="4" />
        <path d="M200 110 C246 78, 272 58, 296 34" strokeWidth="5" />
        <path d="M200 110 C250 112, 280 116, 310 120" strokeWidth="3" />
        <path d="M200 110 C250 144, 276 168, 300 192" strokeWidth="4" />
      </g>
      <circle cx="160" cy="110" r="40" fill="#8b5bd8" opacity="0.55" filter={`url(#${id}-bloom)`} />
      <circle cx="160" cy="110" r="22" fill="#c9a8ff" opacity="0.9" />
      <circle cx="160" cy="110" r="10" fill="#f0e6ff" />
    </Frame>
  )
}

function Heart({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#12060a">
      <g filter={`url(#${id}-soft)`}>
        <path d="M160 190 C90 140, 60 104, 70 76 C80 44, 122 40, 148 66 C156 74, 160 80, 160 88 C160 80, 164 74, 172 66 C198 40, 240 44, 250 76 C260 104, 230 140, 160 190 Z" fill="#b03a4a" />
        <path d="M160 190 C90 140, 60 104, 70 76 C80 44, 122 40, 148 66 C156 74, 160 80, 160 88" fill="#d4586a" opacity="0.7" />
      </g>
      <g stroke="#ff9db0" strokeOpacity="0.7" strokeWidth="3" fill="none" filter={`url(#${id}-soft)`}>
        <path d="M120 84 C104 96, 96 110, 100 126" />
        <path d="M200 84 C216 96, 224 110, 220 126" />
        <path d="M160 108 L160 160" />
      </g>
      <circle cx="160" cy="112" r="46" fill="#e0556b" opacity="0.2" filter={`url(#${id}-bloom)`} />
    </Frame>
  )
}

function Leaf({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#05120c">
      <g filter={`url(#${id}-soft)`}>
        <path d="M160 20 C230 60, 240 130, 160 200 C80 130, 90 60, 160 20 Z" fill="#2f8a4f" />
        <path d="M160 20 C160 90, 160 140, 160 200" stroke="#a8e6b8" strokeOpacity="0.6" strokeWidth="2" fill="none" />
        {[60, 90, 120, 150].map((y, i) => (
          <g key={i} opacity="0.5">
            <path d={`M160 ${y} C140 ${y - 8}, 120 ${y - 4}, 108 ${y + 6}`} stroke="#a8e6b8" strokeWidth="1.6" fill="none" />
            <path d={`M160 ${y} C180 ${y - 8}, 200 ${y - 4}, 212 ${y + 6}`} stroke="#a8e6b8" strokeWidth="1.6" fill="none" />
          </g>
        ))}
        {[[132, 110], [186, 130], [150, 156]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="7" ry="4" fill="#7fe0a0" opacity="0.7" />
        ))}
      </g>
      <ellipse cx="140" cy="70" rx="22" ry="34" fill="#eafff0" opacity="0.12" />
    </Frame>
  )
}

function Virus({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#0a0710">
      <g filter={`url(#${id}-soft)`}>
        <circle cx="160" cy="110" r="56" fill="#7a5bd8" opacity="0.85" />
        <circle cx="160" cy="110" r="56" fill="none" stroke="#c9a8ff" strokeOpacity="0.7" strokeWidth="4" />
        <circle cx="160" cy="110" r="34" fill="#4a2f8a" opacity="0.8" />
        <circle cx="160" cy="110" r="18" fill="#e0d0ff" opacity="0.65" />
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2
          const x1 = 160 + Math.cos(a) * 56
          const y1 = 110 + Math.sin(a) * 56
          const x2 = 160 + Math.cos(a) * 84
          const y2 = 110 + Math.sin(a) * 84
          return (
            <g key={i} stroke="#c9a8ff" strokeOpacity="0.8" strokeWidth="3">
              <line x1={x1} y1={y1} x2={x2} y2={y2} />
              <circle cx={x2} cy={y2} r="4" fill="#e0d0ff" />
            </g>
          )
        })}
      </g>
      <circle cx="160" cy="110" r="70" fill="#7a5bd8" opacity="0.18" filter={`url(#${id}-bloom)`} />
    </Frame>
  )
}

function WaterMolecule({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#04121a">
      <circle cx="160" cy="110" r="96" fill="#5fa8c8" opacity="0.16" filter={`url(#${id}-bloom)`} />
      <g filter={`url(#${id}-soft)`}>
        <line x1="160" y1="120" x2="100" y2="80" stroke="#dff3ff" strokeOpacity="0.55" strokeWidth="8" strokeLinecap="round" />
        <line x1="160" y1="120" x2="220" y2="80" stroke="#dff3ff" strokeOpacity="0.55" strokeWidth="8" strokeLinecap="round" />
        <circle cx="160" cy="120" r="26" fill="#c83f4a" />
        <circle cx="100" cy="80" r="15" fill="#dfe9f5" />
        <circle cx="220" cy="80" r="15" fill="#dfe9f5" />
        <circle cx="152" cy="112" r="8" fill="#fff" opacity="0.35" />
        <circle cx="95" cy="75" r="5" fill="#fff" opacity="0.7" />
        <circle cx="215" cy="75" r="5" fill="#fff" opacity="0.7" />
      </g>
    </Frame>
  )
}

function Atom({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#050810">
      <g transform="translate(160 110)">
        {[0, 60, 120].map((r, i) => (
          <ellipse key={i} rx="92" ry="34" transform={`rotate(${r})`} fill="none" stroke={['#7fd4ff', '#f3d17e', '#c9a8ff'][i]} strokeOpacity="0.65" strokeWidth="2" filter={`url(#${id}-soft)`} />
        ))}
        <circle r="24" fill="#ffb36b" opacity="0.5" filter={`url(#${id}-bloom)`} />
        <circle r="13" fill="#ffd7a0" />
        <circle r="6" fill="#fff" opacity="0.85" />
        {[[92, 0], [-46, 80], [46, -80]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="#dff3ff" />
        ))}
      </g>
    </Frame>
  )
}

function Crystal({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#060a12">
      <g filter={`url(#${id}-soft)`} stroke="#9fc2ff" strokeOpacity="0.65" strokeWidth="1.6" fill="none">
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 5 }, (_, c) => {
            const x = 60 + c * 50
            const y = 40 + r * 30
            return <circle key={`${r}-${c}`} cx={x} cy={y} r="4" fill="#cfe4ff" fillOpacity="0.7" />
          })
        )}
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => (
            <line key={`h-${r}-${c}`} x1={60 + c * 50} y1={40 + r * 30} x2={60 + (c + 1) * 50} y2={40 + r * 30} />
          ))
        )}
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 5 }, (_, c) => (
            <line key={`v-${r}-${c}`} x1={60 + c * 50} y1={40 + r * 30} x2={60 + c * 50} y2={40 + (r + 1) * 30} />
          ))
        )}
      </g>
      <ellipse cx="160" cy="110" rx="120" ry="90" fill="#7fa8ff" opacity="0.10" filter={`url(#${id}-bloom)`} />
    </Frame>
  )
}

function WaveInterference({ id }: { id: string }) {
  const paths = (amp: number, freq: number, phase: number) =>
    Array.from({ length: 200 }, (_, i) => {
      const x = i * 1.6
      const y = 110 + amp * Math.sin((x / 320) * Math.PI * 2 * freq + phase)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    }).join(' ')
  return (
    <Frame id={id} bg="#050a12">
      <path d={paths(26, 2, 0)} fill="none" stroke="#7fd4ff" strokeOpacity="0.8" strokeWidth="2" filter={`url(#${id}-soft)`} />
      <path d={paths(26, 2, 2.2)} fill="none" stroke="#f3d17e" strokeOpacity="0.8" strokeWidth="2" filter={`url(#${id}-soft)`} />
      <path d={paths(52, 2, 1.1)} fill="none" stroke="#c9a8ff" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="0" y1="110" x2="320" y2="110" stroke="#ffffff" strokeOpacity="0.12" />
    </Frame>
  )
}

function Prism({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#04060d">
      <g filter={`url(#${id}-soft)`}>
        <path d="M120 40 L200 160 L40 160 Z" fill="#bfe3ff" opacity="0.18" stroke="#dff3ff" strokeOpacity="0.55" strokeWidth="2" />
        <line x1="20" y1="100" x2="118" y2="104" stroke="#ffffff" strokeWidth="5" strokeOpacity="0.85" />
        {['#ff4d4d', '#ff9d3d', '#ffe14d', '#5cff8f', '#4dc9ff', '#7a5bff', '#c85bff'].map((c, i) => (
          <line key={c} x1="150" y1="120" x2="316" y2={50 + i * 22} stroke={c} strokeWidth="4" strokeOpacity="0.85" />
        ))}
      </g>
      <ellipse cx="160" cy="130" rx="110" ry="60" fill="#7fd4ff" opacity="0.10" filter={`url(#${id}-bloom)`} />
    </Frame>
  )
}

function Circuit({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#060a12">
      <g stroke="#9fc2ff" strokeOpacity="0.7" strokeWidth="3" fill="none">
        <rect x="70" y="60" width="180" height="110" rx="8" />
        <line x1="70" y1="115" x2="130" y2="115" />
        <line x1="190" y1="115" x2="250" y2="115" />
      </g>
      <g>
        <rect x="130" y="100" width="24" height="30" fill="#0b1220" stroke="#f3d17e" strokeWidth="2" />
        <line x1="130" y1="110" x2="154" y2="110" stroke="#f3d17e" strokeWidth="2" />
        <line x1="130" y1="120" x2="154" y2="120" stroke="#f3d17e" strokeWidth="2" />
        <circle cx="226" cy="115" r="13" fill="#ffd7a0" opacity="0.9" />
        <circle cx="226" cy="115" r="22" fill="#ffd7a0" opacity="0.25" filter={`url(#${id}-bloom)`} />
        <path d="M160 170 L160 196" stroke="#9fc2ff" strokeWidth="3" />
        <line x1="146" y1="196" x2="174" y2="196" stroke="#9fc2ff" strokeWidth="3" />
      </g>
    </Frame>
  )
}

function NeuralNet({ id }: { id: string }) {
  const layers = [4, 6, 6, 3]
  return (
    <Frame id={id} bg="#040a12">
      <g>
        {layers.map((n, li) => {
          const x = 50 + li * 74
          return Array.from({ length: n }, (_, i) => {
            const y = 32 + (144 / (n + 1)) * (i + 1)
            return <circle key={`${li}-${i}`} cx={x} cy={y} r="6" fill={li === layers.length - 1 ? '#f3d17e' : '#7fd4ff'} opacity="0.9" />
          })
        })}
        {layers.slice(0, -1).map((n, li) =>
          Array.from({ length: n }, (_, i) =>
            Array.from({ length: layers[li + 1] }, (_, j) => {
              const x1 = 50 + li * 74
              const y1 = 32 + (144 / (n + 1)) * (i + 1)
              const x2 = 50 + (li + 1) * 74
              const y2 = 32 + (144 / (layers[li + 1] + 1)) * (j + 1)
              return <line key={`${li}-${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7fd4ff" strokeOpacity="0.16" strokeWidth="1" />
            })
          )
        )}
      </g>
      <circle cx="160" cy="110" r="80" fill="#7fd4ff" opacity="0.08" filter={`url(#${id}-bloom)`} />
    </Frame>
  )
}

function Chip({ id }: { id: string }) {
  return (
    <Frame id={id} bg="#05080f">
      <g filter={`url(#${id}-soft)`}>
        <rect x="96" y="56" width="128" height="108" rx="10" fill="#16233a" stroke="#7fd4ff" strokeOpacity="0.6" strokeWidth="2" />
        <rect x="118" y="78" width="84" height="64" rx="6" fill="#0d1728" stroke="#9fc2ff" strokeOpacity="0.5" />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} stroke="#f3d17e" strokeOpacity="0.8" strokeWidth="3">
            <line x1={96} y1={72 + i * 12} x2={76} y2={72 + i * 12} />
            <line x1={224} y1={72 + i * 12} x2={244} y2={72 + i * 12} />
          </g>
        ))}
        <g stroke="#f3d17e" strokeOpacity="0.7" strokeWidth="3">
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={120 + i * 22} y1={56} x2={120 + i * 22} y2={34} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <line key={'d' + i} x1={120 + i * 22} y1={164} x2={120 + i * 22} y2={186} />
          ))}
        </g>
      </g>
      <circle cx="160" cy="110" r="70" fill="#7fd4ff" opacity="0.12" filter={`url(#${id}-bloom)`} />
    </Frame>
  )
}

export function ScientificFigure({ subject, mode = 'kids' }: { subject: Subject; mode?: Mode }) {
  const id = 'sci-' + subject
  const body = renderFigure(subject, id)
  return <ModeContext.Provider value={mode}>{body}</ModeContext.Provider>
}

function renderFigure(subject: Subject, id: string) {
  switch (subject) {
    case 'gasGiant':
      return <GasGiant id={id} />
    case 'rockyPlanet':
      return <RockyPlanet id={id} />
    case 'nebula':
      return <Nebula id={id} />
    case 'galaxy':
      return <Galaxy id={id} />
    case 'comet':
      return <Comet id={id} />
    case 'volcano':
      return <Volcano id={id} />
    case 'cyclone':
      return <Cyclone id={id} />
    case 'oceanLayers':
      return <OceanLayers id={id} />
    case 'cell':
      return <Cell id={id} />
    case 'dna':
      return <Dna id={id} />
    case 'neuron':
      return <Neuron id={id} />
    case 'heart':
      return <Heart id={id} />
    case 'leaf':
      return <Leaf id={id} />
    case 'virus':
      return <Virus id={id} />
    case 'waterMolecule':
      return <WaterMolecule id={id} />
    case 'atom':
      return <Atom id={id} />
    case 'crystal':
      return <Crystal id={id} />
    case 'waveInterference':
      return <WaveInterference id={id} />
    case 'prism':
      return <Prism id={id} />
    case 'circuit':
      return <Circuit id={id} />
    case 'neuralNet':
      return <NeuralNet id={id} />
    case 'chip':
      return <Chip id={id} />
  }
}
