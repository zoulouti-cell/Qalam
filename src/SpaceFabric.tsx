import { useId, useState } from 'react'
import type { Lang } from './i18n'

export default function SpaceFabric({ lang }: { lang: Lang }) {
  const [depth, setDepth] = useState(150)
  const id = useId().replace(/:/g, '')
  const words = lang === 'ar'
    ? { title: 'الفضاء كنسيج: كيف نتصوّر الانحناء؟', control: 'غيّر عمق الانخفاض في الرسم', note: 'تشبيه بصري مبسّط لانحناء الزمكان. الفضاء ليس بساطًا ماديًا، ولا توجد جهة «أسفل» يسقط نحوها الثقب الأسود. هذا الرسم لا يمثّل داخل الثقب أو مقياسًا حقيقيًا.', hole: 'الثقب الأسود', star: 'نجم', planet: 'كوكب' }
    : lang === 'fr'
    ? { title: 'L’espace comme un tissu : imaginer la courbure', control: 'Profondeur du creux dans le dessin', note: 'Analogie simplifiée de la courbure de l’espace-temps. L’espace n’est pas un tissu matériel et il n’existe pas de « bas » vers lequel tombe le trou noir. Ni son intérieur ni une échelle réelle ne sont représentés.', hole: 'Trou noir', star: 'Étoile', planet: 'Planète' }
    : { title: 'Space as a fabric: imagining curvature', control: 'Change the depth of the illustrated dip', note: 'A simplified analogy for spacetime curvature. Space is not a material sheet, and there is no downward direction into which a black hole falls. This does not depict its interior or a true scale.', hole: 'Black hole', star: 'Star', planet: 'Planet' }
  const point = (x: number, z: number) => {
    const dip = depth * Math.exp(-((x - 1.2) ** 2 + z ** 2) / 3)
    return [480 + x * 47 + z * 23, 230 + z * 20 + dip]
  }
  const line = (fixed: number, alongX: boolean) => Array.from({ length: 101 }, (_, i) => {
    const v = -7 + i * .14
    const [x, y] = alongX ? point(v, fixed) : point(fixed, v)
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const center = point(1.2, 0)
  return <figure style={{ margin: '20px 0', color: '#17382f' }}>
    <h4>{words.title}</h4>
    <svg viewBox="0 0 960 510" style={{ width: '100%', display: 'block', borderRadius: 22 }} role="img" aria-label={words.title}>
      <defs>
        <radialGradient id={`${id}bg`}><stop stopColor="#193d61"/><stop offset="1" stopColor="#050c20"/></radialGradient>
        <radialGradient id={`${id}sun`}><stop stopColor="#fffbd0"/><stop offset=".6" stopColor="#ffd26a"/><stop offset="1" stopColor="#f59335"/></radialGradient>
      </defs>
      <rect width="960" height="510" fill={`url(#${id}bg)`}/>
      {Array.from({ length: 65 }, (_, i) => <circle key={i} cx={(i * 173 + 31) % 950} cy={(i * 79 + 13) % 500} r={i % 4 ? 1 : 2} fill="#dcefff" opacity=".65"/>)}
      <g fill="none" stroke="#55d5dc" strokeWidth="1.2" opacity=".7">
        {Array.from({ length: 15 }, (_, i) => <g key={i}><path d={line(i - 7, true)}/><path d={line(i - 7, false)}/></g>)}
      </g>
      <circle cx="238" cy="170" r="30" fill={`url(#${id}sun)`}/>
      <text x="238" y="123" textAnchor="middle" fill="#fff3c1" fontSize="20">{words.star}</text>
      <circle cx="738" cy="209" r="22" fill="#63b9ed"/>
      <path d="M723 195 Q750 200 735 215 Q727 224 719 209Z" fill="#57b58b"/>
      <text x="738" y="166" textAnchor="middle" fill="#e0f5ff" fontSize="20">{words.planet}</text>
      <ellipse cx={center[0]} cy={center[1]} rx="29" ry="12" fill="#01030b" stroke="#ffcb7b" strokeWidth="3"/>
      <path d={`M${center[0]+36},${center[1]} L760,440`} stroke="#ffd68f" fill="none"/>
      <text x="780" y="468" textAnchor="middle" fill="#ffdfaa" fontSize="22">{words.hole}</text>
    </svg>
    <label style={{ display: 'grid', gap: 10, margin: '16px 0', fontWeight: 700 }}>{words.control}<input type="range" min="50" max="180" value={depth} onChange={e => setDepth(Number(e.target.value))}/></label>
    <figcaption style={{ lineHeight: 1.9 }}>{words.note}</figcaption>
  </figure>
}
