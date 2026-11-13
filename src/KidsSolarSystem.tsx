import { useEffect, useState } from 'react'
import type { Lang } from './i18n'

const LABELS: Record<Lang, { name: string; slow: string; fast: string; speed: string }> = {
  ar: { name: 'المجموعة الشمسية', slow: 'أبطأ', fast: 'أسرع', speed: 'سرعة دوران الكواكب' },
  fr: { name: 'Système solaire', slow: 'Plus lent', fast: 'Plus rapide', speed: 'Vitesse des planètes' },
  en: { name: 'Solar System', slow: 'Slower', fast: 'Faster', speed: 'Planet speed' },
}

export default function KidsSolarSystem({ lang, slow, fast }: { lang: Lang; slow?: string; fast?: string }) {
  const [speed, setSpeed] = useState(1)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const text = LABELS[lang]
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return <div className="kids-solar-system">
    <svg className="kids-lab-svg space-svg" viewBox="0 0 420 250" role="img" aria-label={text.name}>
      <defs><radialGradient id="kidsSolarGlow"><stop stopColor="#fff3a6"/><stop offset="1" stopColor="#ff9d32"/></radialGradient></defs>
      <circle cx="210" cy="125" r="36" fill="url(#kidsSolarGlow)" className="lab-sun" />
      {[64, 97, 132, 166].map((r, i) => <g key={r}><ellipse cx="210" cy="125" rx={r} ry={r * .58} fill="none" stroke="#a8c8ee" strokeDasharray="4 5" opacity=".7"/><circle r={5 + i} fill={['#55a9ea','#fa805e','#91c875','#d7aa72'][i]}>{!reduced && <animateMotion dur={`${(8 + i * 5) / speed}s`} repeatCount="indefinite" path={`M ${210-r} 125 a ${r} ${r * .58} 0 1 0 ${2*r} 0 a ${r} ${r * .58} 0 1 0 ${-2*r} 0`} />}</circle></g>)}
    </svg>
    <div className="lab-controls"><span>{slow ?? text.slow}</span><input aria-label={text.speed} type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}/><span>{fast ?? text.fast}</span></div>
  </div>
}
