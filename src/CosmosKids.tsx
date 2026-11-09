import { useState } from 'react'
import type { Lang } from './i18n'
import './cosmos-kids.css'

/* ============================================================
   Cosmos for kids — illustrated (not photographic), playful.
   A clickable cartoon solar system + simple facts per body.
   ============================================================ */

type KidBody = { id: string; color: string; ring?: boolean; emoji: string; size: number }

const BODIES: KidBody[] = [
  { id: 'sun', color: '#ffc107', emoji: '☀️', size: 40 },
  { id: 'mercury', color: '#9e9e9e', emoji: '🪐', size: 8 },
  { id: 'venus', color: '#e8cfa0', emoji: '🪐', size: 12 },
  { id: 'earth', color: '#3f8fd8', emoji: '🌍', size: 13 },
  { id: 'mars', color: '#d2693a', emoji: '🔴', size: 10 },
  { id: 'jupiter', color: '#c99a63', emoji: '🟠', size: 28 },
  { id: 'saturn', color: '#e8d9a8', ring: true, emoji: '🪐', size: 24 },
  { id: 'uranus', color: '#7fd4c8', emoji: '🔵', size: 18 },
  { id: 'neptune', color: '#5f8fd8', emoji: '🔵', size: 17 },
]

const COPY: Record<string, Record<Lang, { title: string; fact: string; didYouKnow: string }>> = {
  sun: {
    ar: { title: 'الشمس', fact: 'الشمس نجم ضخم جداً يضيء ويدفئنا كل يوم.', didYouKnow: 'حجم الشمس نحو 1.3 مليون مرة حجم الأرض؛ هذه مقارنة بالحجم وليست بالقطر.' },
    fr: { title: 'Le Soleil', fact: 'Le Soleil est une étoile immense qui nous éclaire et nous réchauffe.', didYouKnow: 'Le volume du Soleil est environ 1,3 million de fois celui de la Terre.' },
    en: { title: 'The Sun', fact: 'The Sun is a huge star that lights and warms us every day.', didYouKnow: 'The Sun has about 1.3 million times Earth’s volume, not its diameter!' },
  },
  mercury: {
    ar: { title: 'عطارد', fact: 'عطارد أصغر كوكب وأقربه إلى الشمس.', didYouKnow: 'سنة عطارد 88 يوماً فقط!' },
    fr: { title: 'Mercure', fact: 'Mercure est la plus petite planète et la plus proche du Soleil.', didYouKnow: 'Une année sur Mercure ne dure que 88 jours !' },
    en: { title: 'Mercury', fact: 'Mercury is the smallest planet and closest to the Sun.', didYouKnow: 'A year on Mercury lasts only 88 days!' },
  },
  venus: {
    ar: { title: 'الزهرة', fact: 'الزهرة أسخن كوكب، تغطيه غيوم كثيفة.', didYouKnow: 'الزهرة أسخن من عطارد رغم بعده!' },
    fr: { title: 'Vénus', fact: 'Vénus est la planète la plus chaude, couverte de nuages épais.', didYouKnow: 'Vénus est plus chaude que Mercure, même plus loin !' },
    en: { title: 'Venus', fact: 'Venus is the hottest planet, covered in thick clouds.', didYouKnow: 'Venus is hotter than Mercury, even though it is farther!' },
  },
  earth: {
    ar: { title: 'الأرض', fact: 'الأرض كوكبنا الأزرق الجميل، فيه الماء والحياة.', didYouKnow: 'الأرض هي الكوكب الوحيد الذي نعرفه بالحياة!' },
    fr: { title: 'La Terre', fact: 'La Terre est notre belle planète bleue, avec de l’eau et la vie.', didYouKnow: 'La Terre est la seule planète où l’on connaît la vie !' },
    en: { title: 'Earth', fact: 'Earth is our beautiful blue planet, with water and life.', didYouKnow: 'Earth is the only planet we know with life!' },
  },
  mars: {
    ar: { title: 'المريخ', fact: 'المريخ الكوكب الأحمر، وفيه أعلى بركان في المجموعة الشمسية.', didYouKnow: 'المريخ أحمر بسبب صدأ الحديد في ترابه!' },
    fr: { title: 'Mars', fact: 'Mars est la planète rouge, avec le plus haut volcan du Système solaire.', didYouKnow: 'Mars est rouge à cause de la rouille dans son sol !' },
    en: { title: 'Mars', fact: 'Mars is the red planet, with the tallest volcano in the Solar System.', didYouKnow: 'Mars is red because of rust in its soil!' },
  },
  jupiter: {
    ar: { title: 'المشتري', fact: 'المشتري أكبر كوكب، وله بقعة حمراء عملاقة.', didYouKnow: 'يتسع المشتري لأكثر من 1300 أرض!' },
    fr: { title: 'Jupiter', fact: 'Jupiter est la plus grande planète, avec une grande tache rouge.', didYouKnow: 'Jupiter pourrait contenir plus de 1300 Terres !' },
    en: { title: 'Jupiter', fact: 'Jupiter is the biggest planet, with a giant red spot.', didYouKnow: 'Jupiter could fit over 1300 Earths inside!' },
  },
  saturn: {
    ar: { title: 'زحل', fact: 'زحل له حلقات جميلة من الجليد والصخور.', didYouKnow: 'حلقات زحل واسعة جداً لكنها رقيقة!' },
    fr: { title: 'Saturne', fact: 'Saturne a de magnifiques anneaux de glace et de roche.', didYouKnow: 'Les anneaux de Saturne sont très larges mais très fins !' },
    en: { title: 'Saturn', fact: 'Saturn has beautiful rings of ice and rock.', didYouKnow: 'Saturn’s rings are very wide but very thin!' },
  },
  uranus: {
    ar: { title: 'أورانوس', fact: 'أورانوس كوكب مائل يدور على جنبه.', didYouKnow: 'أورانوس أبرد كوكب في المجموعة الشمسية!' },
    fr: { title: 'Uranus', fact: 'Uranus est une planète inclinée qui roule sur le côté.', didYouKnow: 'Uranus est la planète la plus froide du Système solaire !' },
    en: { title: 'Uranus', fact: 'Uranus is a tilted planet that rolls on its side.', didYouKnow: 'Uranus is the coldest planet in the Solar System!' },
  },
  neptune: {
    ar: { title: 'نبتون', fact: 'نبتون أبعد كوكب، ورياحه الأسرع في المجموعة الشمسية.', didYouKnow: 'رياح نبتون أسرع من الصوت!' },
    fr: { title: 'Neptune', fact: 'Neptune est la planète la plus lointaine, avec les vents les plus rapides.', didYouKnow: 'Les vents de Neptune sont plus rapides que le son !' },
    en: { title: 'Neptune', fact: 'Neptune is the most distant planet, with the fastest winds.', didYouKnow: 'Neptune’s winds are faster than sound!' },
  },
}

const T = {
  ar: { title: 'الفضاء والكون', sub: 'مرحباً أيها المستكشف الصغير! اضغط على كوكب لتتعرف عليه.', tap: 'اضغط كوكباً', know: 'هل تعلم؟' },
  fr: { title: 'L’espace et le cosmos', sub: 'Bonjour petit explorateur ! Clique sur une planète pour la découvrir.', tap: 'Choisis une planète', know: 'Le savais-tu ?' },
  en: { title: 'Space & Cosmos', sub: 'Hello little explorer! Tap a planet to learn about it.', tap: 'Pick a planet', know: 'Did you know?' },
} as const

export default function CosmosKids({ lang }: { lang: Lang }) {
  const [selected, setSelected] = useState('sun')
  const ui = T[lang]
  const body = BODIES.find((b) => b.id === selected)!
  const copy = COPY[selected][lang]

  return (
    <div className="cosmos-kids">
      <header className="ck-head">
        <h1>{ui.title}</h1>
        <p>{ui.sub}</p>
      </header>

      <div className="ck-stage">
        <svg viewBox="0 0 640 420" className="ck-solar" role="group" aria-label={ui.tap}>
          {/* orbits */}
          {[60, 95, 130, 165, 200, 235, 270, 305].map((r) => (
            <ellipse key={r} cx="320" cy="210" rx={r} ry={r * 0.42} fill="none" stroke="#b9c8d8" strokeDasharray="4 6" strokeOpacity="0.5" />
          ))}
          {/* sun (center) */}
          <g className="ck-sun" onClick={() => setSelected('sun')}>
            <circle cx="320" cy="210" r="30" fill="#ffc107" />
            <g stroke="#ffb300" strokeWidth="4" strokeLinecap="round">
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2
                return <line key={i} x1={320 + Math.cos(a) * 38} y1={210 + Math.sin(a) * 38} x2={320 + Math.cos(a) * 48} y2={210 + Math.sin(a) * 48} />
              })}
            </g>
          </g>
          {/* planets placed on orbits */}
          {BODIES.filter((b) => b.id !== 'sun').map((b, i) => {
            const orbit = [60, 95, 130, 165, 200, 235, 270, 305][i]
            const ang = (i * 1.1) % (Math.PI * 2)
            const px = 320 + Math.cos(ang) * orbit
            const py = 210 + Math.sin(ang) * orbit * 0.42
            return (
              <g key={b.id} className="ck-planet" onClick={() => setSelected(b.id)}>
                <circle cx={px} cy={py} r={b.size} fill={b.color} />
                {b.ring && <ellipse cx={px} cy={py} rx={b.size * 1.8} ry={b.size * 0.5} fill="none" stroke="#d8cfa0" strokeWidth="3" transform={`rotate(-20 ${px} ${py})`} />}
                {b.id === 'earth' && <circle cx={px - b.size * 0.3} cy={py - b.size * 0.3} r={b.size * 0.35} fill="#2f9a5a" />}
                <circle cx={px + b.size * 0.25} cy={py - b.size * 0.25} r={b.size * 0.18} fill="#fff" opacity="0.6" />
              </g>
            )
          })}
        </svg>
        <div className="ck-tap">{ui.tap}</div>
      </div>

      <div className="ck-card" key={selected}>
        <span className="ck-emoji">{body.emoji}</span>
        <div>
          <h2>{copy.title}</h2>
          <p>{copy.fact}</p>
        </div>
        <div className="ck-fact">
          <b>{ui.know}</b>
          <span>{copy.didYouKnow}</span>
        </div>
      </div>
    </div>
  )
}
