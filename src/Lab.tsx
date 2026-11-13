import ExperimentWorkbench from './ExperimentWorkbench'
import { Circuit, Projectile } from './LabDynamics'
import { lazy, Suspense, useEffect, useState } from 'react'
import { t, type Lang } from './i18n'
import Scene3D from './Scenes3D'
import BodyExplorer3D from './BodyExplorer3D'
import { sound } from './sound'
import { awardBadge } from './rewards'
import { publicUrl } from './publicUrl'
import type { Level } from './content'
import { scrollToDetail } from './scrollToDetail'
import KidsLearningStudio from './KidsLearningStudio'
import HumanInquiryLab from './HumanInquiryLab'
import MovementLab from './MovementLab'

const EarthDiscovery = lazy(() => import('./EarthDiscovery'))
const SpaceDiscovery = lazy(() => import('./SpaceDiscovery'))
const ScientificGallery = lazy(() => import('./ScientificGallery'))
const HumanitiesExplorer = lazy(() => import('./HumanitiesExplorer'))

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
  const y = 10 + ((14 - sub.ph) / 14) * 210
  const kind = sub.ph < 7 ? t(lang, 'labPhAcid') : sub.ph > 7 ? t(lang, 'labPhBase') : t(lang, 'labPhNeutral')
  return (
    <div className="lab-card">
      <h3 className="chart-title">🌈 {t(lang, 'labPh')}</h3>
      <div className="ph-wrap">
        <svg viewBox="0 0 90 230" className="ph-svg">
          <defs>
            <linearGradient id="phg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7561b7" />
              <stop offset="45%" stopColor="#ffd54f" />
              <stop offset="50%" stopColor="#8fbf7f" />
              <stop offset="100%" stopColor="#d64a49" />
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

function Pythagoras({ lang, level }: { lang: Lang; level: Level }) {
  const [a, setA] = useState(3)
  const [b, setB] = useState(4)
  const c = Math.sqrt(a * a + b * b)
  const s = 12, ox=180, oy=160
  const A=[ox,oy], B=[ox+b*s,oy], C=[ox,oy-a*s]
  const hyp=[B,C,[C[0]+a*s,C[1]-b*s],[B[0]+a*s,B[1]-b*s]].map(p=>p.join(',')).join(' ')
  return (
    <div className="lab-card">
      <h3 className="chart-title">📐 {t(lang, 'labPyth')}</h3>
      <svg viewBox="80 0 300 250" className="lab-svg" role="img" aria-label={t(lang,'labPyth')}>
        <rect x={ox-a*s} y={oy-a*s} width={a*s} height={a*s} fill="#75b6d7" opacity=".7"/>
        <rect x={ox} y={oy} width={b*s} height={b*s} fill="#e8bd4f" opacity=".7"/>
        <polygon points={hyp} fill="#b69bd1" opacity=".7"/>
        <polygon points={[A,B,C].map(p=>p.join(',')).join(' ')} fill="#326f75"/>
        <path d={`M${ox+9} ${oy}v-9h-9`} stroke="white" fill="none"/>
        <g fill="#233f4b" fontSize="12" textAnchor="middle"><text x={ox-a*s/2} y={oy-a*s/2}>a² = {a*a}</text><text x={ox+b*s/2} y={oy+b*s/2+4}>b² = {b*b}</text><text x={(B[0]+C[0]+a*s)/2} y={(B[1]+C[1]-b*s)/2}>c² = {a*a+b*b}</text></g>
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
      {level !== 'kids' && <p className="kid-note">{lang==='ar'?'هذه العلاقة خاصة بالمثلث القائم: مربعا الضلعين القائمين يساوي مجموع مساحتيهما مساحة مربع الوتر. في مثلث عام تستبدل بقانون جيب التمام: c² = a² + b² − 2ab cos(γ)، فتختفي الإضافة عندما γ = 90°. طول الوتر المعروض مقرب؛ المساحات محسوبة من a² + b² قبل التقريب.':lang==='fr'?'Cette relation suppose un angle droit. Pour un triangle général : c² = a² + b² − 2ab cos(γ). Le terme supplémentaire disparaît à 90°. La longueur affichée est arrondie ; les aires sont calculées avant cet arrondi.':'This relation requires a right angle. For a general triangle, c² = a² + b² − 2ab cos(γ). The extra term vanishes at 90°. Displayed length is rounded; areas are computed before rounding.'}</p>}
    </div>
  )
}

function FractionsLab({ lang, level }: { lang: Lang; level: Level }) {
  const [denominator, setDenominator] = useState(5)
  const [numerator, setNumerator] = useState(3)
  const copy = {
    numerator: { ar: 'الأجزاء المختارة', fr: 'Parts sélectionnées', en: 'Selected parts' },
    denominator: { ar: 'عدد الأجزاء المتساوية', fr: 'Nombre de parts égales', en: 'Equal parts' },
    child: { ar: 'الكسر يخبرنا كم جزءًا أخذنا من أجزاء متساوية.', fr: 'La fraction indique le nombre de parts prises parmi des parts égales.', en: 'A fraction tells how many equal parts we have.' },
    academic: { ar: 'غيّر البسط والمقام، ثم قارن النسبة الممثلة بصريًا. البسط يعدّ الأجزاء المختارة، والمقام يحدد عدد الأجزاء المتساوية في الوحدة.', fr: 'Modifiez numérateur et dénominateur, puis comparez la proportion représentée. Le numérateur compte les parts retenues; le dénominateur définit les parts égales de l’unité.', en: 'Change the numerator and denominator, then compare the visual proportion. The numerator counts selected parts; the denominator sets the equal parts in the whole.' },
  }
  const setDen = (value: number) => { setDenominator(value); setNumerator((current) => Math.min(current, value)) }
  return <div className="lab-card math-fraction-lab"><h3 className="chart-title"><span className="material-symbols-rounded">pie_chart</span>{lang === 'ar' ? 'ورشة الكسور المرئية' : lang === 'fr' ? 'Atelier des fractions' : 'Fraction workshop'}</h3><div className="fraction-visual" role="img" aria-label={`${numerator}/${denominator}`}><div className="fraction-bar" style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}>{Array.from({ length: denominator }, (_, index) => <span key={index} className={index < numerator ? 'filled' : ''}/>)}</div><strong>{numerator}<i/>{denominator}</strong><p>{copy[level === 'kids' ? 'child' : 'academic'][lang]}</p></div><div className="lab-toolbar fraction-controls"><label className="scene-slider">{copy.numerator[lang]}: {numerator}<input type="range" min={0} max={denominator} value={numerator} onChange={(event) => setNumerator(Number(event.target.value))}/></label><label className="scene-slider">{copy.denominator[lang]}: {denominator}<input type="range" min={2} max={12} value={denominator} onChange={(event) => setDen(Number(event.target.value))}/></label></div></div>
}

function DiceLab({ lang, level }: { lang: Lang; level: Level }) {
  const [rolls, setRolls] = useState<[number, number][]>([])
  const lastRoll = rolls[rolls.length - 1]
  const last = lastRoll ? lastRoll[0] + lastRoll[1] : undefined
  const counts = Array.from({ length: 11 }, (_, index) => rolls.filter(([first, second]) => first + second === index + 2).length)
  const max = Math.max(1, ...counts)
  const copy = {
    roll: { ar: 'ارمِ مكعبي النرد', fr: 'Lancer les deux dés', en: 'Roll both dice' },
    child: { ar: 'كل مكعب يعطي عددًا من 1 إلى 6. اجمع العددين، ثم راقب النتائج التي تتكرر أكثر.', fr: 'Chaque dé donne un nombre de 1 à 6. Additionnez-les et observez les résultats qui reviennent le plus.', en: 'Each die shows 1 to 6. Add them and watch which totals appear most often.' },
    academic: { ar: 'يعرض التكرار التجريبي لمجموع مكعبين. النتائج الوسطى لها مسارات تركيبية أكثر من الطرفين؛ لكن عينة قصيرة قد تنحرف عن الاحتمال النظري.', fr: 'La simulation montre les fréquences du total de deux dés. Les valeurs centrales ont davantage de combinaisons que les extrêmes; un petit échantillon peut toutefois s’écarter de la probabilité théorique.', en: 'This simulates sums of two dice. Middle totals have more combinations than extremes, though a small sample can differ from theoretical probabilities.' },
  }
  const roll = () => { const result: [number, number] = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]; setRolls((current) => [...current, result].slice(-120)); sound.pop() }
  return <div className="lab-card math-dice-lab"><h3 className="chart-title"><span className="material-symbols-rounded">casino</span>{lang === 'ar' ? 'مختبر الاحتمالات' : lang === 'fr' ? 'Laboratoire des probabilités' : 'Probability lab'}</h3><div className="dice-lab-readout"><div className="dice-pair" aria-hidden="true"><span>{lastRoll?.[0] ?? '⚄'}</span><span>{lastRoll?.[1] ?? '⚄'}</span></div><div><small>{lang === 'ar' ? 'آخر مجموع' : lang === 'fr' ? 'Dernière somme' : 'Last total'}</small><strong>{last ?? '—'}</strong></div><button type="button" className="primary-btn small" onClick={roll}>{copy.roll[lang]}</button></div><div className="dice-histogram" role="img" aria-label={lang === 'ar' ? `نتائج ${rolls.length} رمية` : `${rolls.length} rolls`}>
    {counts.map((count, index) => <div key={index} className="dice-bar-wrap"><span>{count || ''}</span><i style={{ height: `${count ? Math.max(8, (count / max) * 100) : 3}%` }}/><small>{index + 2}</small></div>)}
    </div><p className="kid-note">{copy[level === 'kids' ? 'child' : 'academic'][lang]} · {rolls.length} {lang === 'ar' ? 'محاولة' : lang === 'fr' ? 'lancers' : 'rolls'}</p></div>
}

function SymmetryLab({ lang, level }: { lang: Lang; level: Level }) {
  const [folds, setFolds] = useState(6)
  const [angle, setAngle] = useState(0)
  const petals = Array.from({ length: folds }, (_, index) => index)
  return <div className="lab-card math-symmetry-lab"><h3 className="chart-title"><span className="material-symbols-rounded">flare</span>{lang === 'ar' ? 'استوديو الأنماط والتماثل' : lang === 'fr' ? 'Studio des motifs et symétries' : 'Patterns and symmetry studio'}</h3><div className="symmetry-stage"><svg viewBox="0 0 240 210" role="img" aria-label={lang === 'ar' ? `نمط له ${folds} محاور` : `${folds}-fold pattern`}><g transform={`translate(120 102) rotate(${angle})`}>{petals.map((index) => <g key={index} transform={`rotate(${index * (360 / folds)})`}><ellipse cx="0" cy="-49" rx="17" ry="43" fill="#2e8a70" fillOpacity=".82"/><circle cx="0" cy="-81" r="5" fill="#f8e8bd"/></g>)}<circle r="16" fill="#153f35"/><circle r="6" fill="#d7b25e"/></g></svg></div><div className="lab-toolbar"><label className="scene-slider">{lang === 'ar' ? `محاور التماثل: ${folds}` : lang === 'fr' ? `Axes de symétrie : ${folds}` : `Symmetry axes: ${folds}`}<input type="range" min={2} max={12} value={folds} onChange={(event) => setFolds(Number(event.target.value))}/></label><label className="scene-slider">{lang === 'ar' ? `زاوية الدوران: ${angle}°` : lang === 'fr' ? `Angle : ${angle}°` : `Rotation: ${angle}°`}<input type="range" min={0} max={360} step={5} value={angle} onChange={(event) => setAngle(Number(event.target.value))}/></label></div><p className="kid-note">{level === 'kids' ? (lang === 'ar' ? 'غيّر عدد البتلات، ثم أدر الشكل: هل يعود إلى صورته قبل دورة كاملة؟' : lang === 'fr' ? 'Changez le nombre de pétales et faites tourner le motif : quand retrouve-t-il sa position ?' : 'Change the petals and rotate the pattern: when does it return to its starting position?') : (lang === 'ar' ? 'اختبر التناظر الدوراني: أصغر زاوية تعيد الشكل إلى صورته هي 360° مقسومة على عدد مرات التكرار.' : lang === 'fr' ? 'Testez la symétrie de rotation : le plus petit angle de retour est 360° divisé par l’ordre du motif.' : 'Test rotational symmetry: the smallest return angle is 360° divided by the pattern order.')}</p></div>
}

function MathLab({ lang, level }: { lang: Lang; level: Level }) {
  const [tool, setTool] = useState<'pythagoras' | 'fractions' | 'probability' | 'symmetry'>('pythagoras')
  const labels = {
    pythagoras: { ar: 'مثلث فيثاغورس', fr: 'Triangle de Pythagore', en: 'Pythagorean triangle' },
    fractions: { ar: 'الكسور', fr: 'Fractions', en: 'Fractions' },
    probability: { ar: 'الاحتمالات', fr: 'Probabilités', en: 'Probability' },
    symmetry: { ar: 'الأنماط', fr: 'Motifs', en: 'Patterns' },
    child: { ar: 'تجارب قصيرة: غيّر رقمًا، راقب الشكل، واكتشف القاعدة بنفسك.', fr: 'De petites expériences : changez une valeur, observez et découvrez la règle.', en: 'Short experiments: change a value, observe, and discover the rule.' },
    academic: { ar: 'نماذج قابلة للتغيير تربط التمثيل البصري بالعلاقات الرياضية، وتسمح بمقارنة التوقع بالنتيجة.', fr: 'Des modèles ajustables relient représentation visuelle et relations mathématiques, pour comparer hypothèse et résultat.', en: 'Adjustable models connect visual representations with mathematical relations and let you compare prediction with result.' },
  }
  return <div className="math-lab"><header className="math-lab-intro"><span className="material-symbols-rounded" aria-hidden="true">functions</span><div><h3>{lang === 'ar' ? 'اختر تجربة رياضية' : lang === 'fr' ? 'Choisissez une expérience' : 'Choose a math experiment'}</h3><p>{labels[level === 'kids' ? 'child' : 'academic'][lang]}</p></div></header><div className="math-lab-tabs" role="tablist" aria-label={lang === 'ar' ? 'تجارب الرياضيات' : lang === 'fr' ? 'Expériences mathématiques' : 'Math experiments'}>{(['pythagoras', 'fractions', 'probability', 'symmetry'] as const).map((id) => <button type="button" role="tab" aria-selected={tool === id} className={tool === id ? 'active' : ''} key={id} onClick={() => { setTool(id); sound.click() }}>{labels[id][lang]}</button>)}</div>{tool === 'pythagoras' ? <Pythagoras lang={lang} level={level}/> : tool === 'fractions' ? <FractionsLab lang={lang} level={level}/> : tool === 'probability' ? <DiceLab lang={lang} level={level}/> : <SymmetryLab lang={lang} level={level}/>}</div>
}

const WATER_STAGES = [
  { id: 'evaporation', label: { ar: 'التبخر والنتح', fr: 'Évaporation et transpiration', en: 'Evaporation and transpiration' }, child: { ar: 'تسخّن الشمس الماء في البحر والأنهار، فيصعد بعضه إلى الهواء بخارًا. وتطلق النباتات بخار الماء أيضًا.', fr: 'Le Soleil réchauffe l’eau des mers et des rivières : une partie monte dans l’air sous forme de vapeur. Les plantes libèrent aussi de la vapeur.', en: 'The Sun warms water in seas and rivers, and some rises into the air as vapor. Plants release water vapor too.' }, adult: { ar: 'تنتقل المياه إلى الغلاف الجوي بالتبخر من الأسطح المائية والتربة، وبالنتح من النباتات. تتأثر التدفقات بالطاقة الشمسية والرطوبة والرياح.', fr: 'L’eau rejoint l’atmosphère par évaporation des surfaces et des sols, ainsi que par transpiration des plantes. Les flux dépendent de l’énergie solaire, de l’humidité et du vent.', en: 'Water enters the atmosphere by evaporation from water and soil, and by plant transpiration. Fluxes depend on solar energy, humidity, and wind.' } },
  { id: 'condensation', label: { ar: 'التكاثف', fr: 'Condensation', en: 'Condensation' }, child: { ar: 'يرتفع البخار ويبرد، فتتجمع قطرات صغيرة وتكوّن السحب.', fr: 'La vapeur monte et refroidit. De minuscules gouttes se rassemblent pour former des nuages.', en: 'Water vapor rises and cools. Tiny droplets gather to form clouds.' }, adult: { ar: 'يؤدي تبريد الهواء الرطب إلى بلوغ التشبع وتكاثف بخار الماء على نوى دقيقة، فتتشكل السحب والقطيرات.', fr: 'Le refroidissement de l’air humide atteint la saturation et condense la vapeur sur de petites particules, formant nuages et gouttelettes.', en: 'Cooling moist air can reach saturation, condensing vapor on tiny particles and forming clouds and droplets.' } },
  { id: 'precipitation', label: { ar: 'الهطول', fr: 'Précipitations', en: 'Precipitation' }, child: { ar: 'عندما تكبر قطرات السحب وتثقل، تسقط مطرًا أو ثلجًا بحسب حرارة الجو.', fr: 'Quand les gouttes deviennent assez grosses, elles tombent en pluie ou en neige selon la température.', en: 'When cloud droplets grow heavy enough, they fall as rain or snow depending on the temperature.' }, adult: { ar: 'يحدث الهطول عندما تنمو القطرات أو البلورات الجليدية داخل السحب بما يكفي لمقاومة التيارات الصاعدة، ثم تصل إلى السطح.', fr: 'Les gouttes ou cristaux de glace grossissent dans les nuages jusqu’à tomber malgré les courants ascendants et atteindre le sol.', en: 'Droplets or ice crystals grow in clouds until they overcome rising air currents and fall to the surface.' } },
  { id: 'collection', label: { ar: 'الجريان والتسرّب', fr: 'Ruissellement et infiltration', en: 'Runoff and infiltration' }, child: { ar: 'تعود المياه إلى الأنهار والبحار، ويتسرب جزء منها إلى التربة؛ ثم تبدأ الرحلة من جديد.', fr: 'L’eau rejoint les rivières et les mers. Une partie s’infiltre dans le sol, puis le cycle recommence.', en: 'Water returns to rivers and seas. Some seeps into the ground, and the cycle begins again.' }, adult: { ar: 'يتوزع الهطول بين الجريان السطحي والتسرب والتخزين في التربة والمياه الجوفية والجليد. تعيد هذه المخازن الماء إلى الدورة على مدد متفاوتة.', fr: 'Les précipitations se répartissent entre ruissellement, infiltration et stockage dans les sols, les nappes et les glaces. Ces réservoirs restituent l’eau à des rythmes différents.', en: 'Precipitation is divided among surface runoff, infiltration, and storage in soil, groundwater, and ice. These reservoirs return water to the cycle at different rates.' } },
] as const

function WaterCycleLab({ lang, level }: { lang: Lang; level: Level }) {
  const [stage, setStage] = useState(0)
  const item = WATER_STAGES[stage]
  const labels = { ar: 'دورة الماء في الطبيعة', fr: 'Le cycle de l’eau', en: 'The water cycle' }
  return <section className={`lab-exploration water-cycle ${level === 'kids' ? 'kids' : 'academic'}`} aria-label={labels[lang]}>
    <header><small>{lang === 'ar' ? 'استكشاف تفاعلي' : lang === 'fr' ? 'Exploration interactive' : 'Interactive exploration'}</small><h3>{labels[lang]}</h3><p>{lang === 'ar' ? 'اتبع قطرة الماء من البحر إلى السحاب ثم عودتها إلى الأرض.' : lang === 'fr' ? 'Suivez une goutte de la mer aux nuages, puis son retour sur Terre.' : 'Follow a drop from the sea to the clouds and back to Earth.'}</p></header>
    <div className="water-cycle-stage" data-stage={item.id}>
      <svg viewBox="0 0 760 330" role="img" aria-label={item.label[lang]}>
        <defs><linearGradient id="waterSky" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#d9f1fc"/><stop offset="1" stopColor="#f7fbf4"/></linearGradient><linearGradient id="waterSea" x1="0" x2="1"><stop stopColor="#48a9c1"/><stop offset="1" stopColor="#217899"/></linearGradient><marker id="waterArrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 9 4.5 0 9z" fill="#278c90"/></marker></defs>
        <rect x="1" y="1" width="758" height="328" rx="22" fill="url(#waterSky)"/>
        <circle cx="116" cy="75" r="35" fill="#f5bf4b"/><g stroke="#f5bf4b" strokeWidth="5" strokeLinecap="round"><path d="M116 22V8M116 142v-14M63 75H49M183 75h-14M78 37 67 26M165 124l-11-11M154 37l11-11M67 124l11-11"/></g>
        <path d="M247 90a39 39 0 0 1 75-14 34 34 0 0 1 53 31H235a30 30 0 0 1 12-17Z" fill="#fff" stroke="#8aaebc" strokeWidth="3"/>
        <path d="M0 245Q116 226 234 252T470 242V330H0Z" fill="url(#waterSea)"/><path d="m448 260 74-106 61 56 82-133 95 182v71H448Z" fill="#94ba83"/><path d="m523 154 30 56-31-14-30 15ZM583 210l82-133 37 75-37-23-37 50Z" fill="#f7f4e9"/>
        <path d="M170 205Q185 130 248 113" fill="none" stroke="#278c90" strokeWidth="5" strokeDasharray="10 8" markerEnd="url(#waterArrow)" className="water-cycle-flow"/>
        <path d="M380 132Q423 164 446 219" fill="none" stroke="#278c90" strokeWidth="5" strokeDasharray="10 8" markerEnd="url(#waterArrow)" className="water-cycle-flow"/>
        <path d="M656 230Q607 286 516 274" fill="none" stroke="#278c90" strokeWidth="5" strokeDasharray="10 8" markerEnd="url(#waterArrow)" className="water-cycle-flow"/>
        <g fill="#267277" fontFamily="sans-serif" fontSize="16" fontWeight="700"><text x="95" y="298">{lang === 'ar' ? 'البحر' : lang === 'fr' ? 'Mer' : 'Sea'}</text><text x="287" y="166">{lang === 'ar' ? 'السحب' : lang === 'fr' ? 'Nuages' : 'Clouds'}</text><text x="615" y="297">{lang === 'ar' ? 'اليابسة' : lang === 'fr' ? 'Terre' : 'Land'}</text></g>
        <circle className="water-cycle-drop" cx={stage === 0 ? 185 : stage === 1 ? 312 : stage === 2 ? 430 : 562} cy={stage === 0 ? 178 : stage === 1 ? 91 : stage === 2 ? 183 : 250} r="9" fill="#238eb7" stroke="#fff" strokeWidth="3"/>
      </svg>
    </div>
    <div className="water-cycle-controls" role="tablist" aria-label={labels[lang]}>{WATER_STAGES.map((step, index) => <button key={step.id} type="button" role="tab" aria-selected={index === stage} className={index === stage ? 'active' : ''} onClick={() => setStage(index)}>{step.label[lang]}</button>)}</div>
    <p className="water-cycle-reading" aria-live="polite">{item[level === 'kids' ? 'child' : 'adult'][lang]}</p>
  </section>
}

export type LabModule = 'math' | 'chemistry' | 'physics' | 'body' | 'earth' | 'human' | 'technology' | 'space'

export default function Lab({ lang, level, kidMode = false, initialModule, initialSpaceTopic, themeId }: { lang: Lang; level: Level; kidMode?: boolean; initialModule?: LabModule; initialSpaceTopic?: string; themeId?: string }) {
  const [module, setModule] = useState<LabModule | null>(initialModule ?? null)
  const presentationLevel: Level = level === 'kids' || kidMode ? 'kids' : 'school'
  useEffect(() => setModule(initialModule ?? null), [initialModule])
  useEffect(() => {
    if (module) scrollToDetail(() => document.getElementById(`lab-${module}`))
  }, [module])
  useEffect(() => {
    awardBadge('scientist')
  }, [])
  const labels = {
    heading: { ar: 'مختبر قلم العلمي', fr: 'Laboratoire scientifique Qalam', en: 'Qalam Science Lab' },
    intro: { ar: 'اختر موضوعًا، ثم استكشف الفكرة بالتجربة أو بالمشهد التفاعلي الملائم لها.', fr: 'Choisissez un sujet, puis explorez-le avec une expérience ou une scène interactive adaptée.', en: 'Choose a topic, then explore it through a matching experiment or interactive scene.' },
    tabs: {
      math: { ar: 'الرياضيات', fr: 'Mathématiques', en: 'Mathematics' },
      chemistry: { ar: 'الكيمياء', fr: 'Chimie', en: 'Chemistry' },
      physics: { ar: 'الفيزياء', fr: 'Physique', en: 'Physics' },
    body: { ar: 'اعرف جسمك', fr: 'Découvrir le corps humain', en: 'Know your body' },
      earth: { ar: 'علوم الأرض', fr: 'Sciences de la Terre', en: 'Earth Sciences' },
      human: { ar: 'علوم الإنسان', fr: 'Sciences humaines', en: 'Human Sciences' },
      technology: { ar: 'علوم التقنية', fr: 'Technologie', en: 'Technology' },
      space: { ar: 'علوم الفضاء', fr: 'Sciences spatiales', en: 'Space science' },
    },
    mathText: { ar: 'حرّك أضلاع المثلث لتتبّع علاقة فيثاغورس، ثم جرّب تغيير أطواله ولاحظ كيف تتغير المساحة على كل ضلع.', fr: 'Modifiez les côtés du triangle pour explorer Pythagore, puis faites varier leurs longueurs et observez l’aire construite sur chaque côté.', en: 'Adjust the triangle sides to explore Pythagoras, then vary their lengths and observe the area built on each side.' },
    chemistryText: { ar: 'استكشف مقياس الحموضة وبنية الذرة ثلاثية الأبعاد. النموذج الذري تعليمي ومبسّط؛ لا تمثل المدارات مسارات كواكب صغيرة حول النواة.', fr: 'Explorez l’échelle de pH et un modèle atomique 3D. Ce modèle est simplifié : les orbitales ne sont pas de petites trajectoires planétaires autour du noyau.', en: 'Explore pH and a 3D atom model. The model is simplified: orbitals are not tiny planet-like paths around the nucleus.' },
    physicsText: { ar: 'بدّل الدائرة بين التوالي والتوازي، أو غيّر زاوية المقذوف وسرعته لتلاحظ أثرهما في المسار.', fr: 'Comparez les circuits en série et en parallèle, ou modifiez l’angle et la vitesse du projectile pour observer sa trajectoire.', en: 'Compare series and parallel circuits, or change launch angle and speed to observe a projectile’s path.' },
    bodyText: { ar: 'انقر على الأعضاء الظاهرة في الصورة، أو اختر من القائمة العظام والعضلات وغيرها. يشرح الدليل وظيفة كل عضو وصلته ببقية الجسم.', fr: 'Touchez les organes visibles sur l’image ou choisissez les os, les muscles et les autres parties dans la liste. Le guide explique leur fonction et leurs relations.', en: 'Click visible organs in the image, or choose bones, muscles, and other parts from the list. The guide explains their functions and connections.' },
    earthText: { ar: 'اكتشف تضاريس الأرض ومياهها، ثم تتبّع رحلة قطرة الماء بين البحر والسحب واليابسة.', fr: 'Explorez les reliefs et les eaux de la Terre, puis suivez le trajet d’une goutte entre mer, nuages et continents.', en: 'Explore Earth’s landforms and waters, then follow a drop from sea to clouds and land.' },
    humanText: { ar: 'ادرس الإنسان والمجتمع عبر التاريخ: الثقافة والمؤسسات والأفكار وطرق بناء المجتمعات، بمسار مخصص للناشئة وآخر أكاديمي.', fr: 'Étudiez les sociétés, leurs cultures, institutions et idées à travers le temps, avec des parcours adaptés aux jeunes et aux adultes.', en: 'Study people and societies through time—their cultures, institutions, and ideas—with age-appropriate and academic pathways.' },
    technologyText: { ar: 'افحص كيف تعمل الأنظمة والأجهزة الرقمية، وتعرّف إلى الإلكترونيات والروبوتات والذكاء الاصطناعي بتجارب ورسوم تفاعلية.', fr: 'Explorez les systèmes numériques, l’électronique, la robotique et l’intelligence artificielle avec des expériences et schémas interactifs.', en: 'Investigate digital systems, electronics, robotics, and AI through interactive models and explanatory figures.' },
    spaceText: { ar: 'مختبر للمشاهدة والتجريب في الفضاء: اختر المجموعة الشمسية أو الثقوب السوداء، وافحص النموذج وحدوده. السرد الزمني للكون يبقى في رحلة قلم.', fr: 'Un laboratoire d’observation et d’expérimentation : explorez le système solaire ou les trous noirs, avec les limites de chaque modèle. La chronologie cosmique reste dans le Parcours Qalam.', en: 'An observation and experimentation lab: explore the Solar System or black holes, including each model’s limits. Cosmic chronology remains in Qalam Journey.' },
  }
  const baseModuleText = module ? ({ math: labels.mathText, chemistry: labels.chemistryText, physics: labels.physicsText, body: labels.bodyText, earth: labels.earthText, human: labels.humanText, technology: labels.technologyText, space: labels.spaceText })[module][lang] : ''
  const moduleText = module==='technology'&&themeId==='transport'
    ? ({ar:'قارن زمن انتقال الناس والسلع بوسائل مختلفة، ثم افحص حدود النموذج والحاجات الفعلية.',fr:'Comparez les durées de déplacement des personnes et des biens, puis les limites du modèle.',en:'Compare how long people and goods take to travel, then examine the model’s limits.'})[lang]
    : module==='technology'&&themeId==='communications'
      ? ({ar:'قارن زمن انتقال الرسالة بوسائل مختلفة، وافصل بين سرعة الإشارة وزمن الخدمة الكامل.',fr:'Comparez le temps de transmission et distinguez vitesse du signal et délai du service.',en:'Compare message travel times and distinguish signal speed from total service delay.'})[lang]
      : module==='human'&&themeId
        ? ({ar:'افحص سجلات تدريبية، واختر الشاهد الأنسب ثم اختبر قوة استنتاجك وحدوده.',fr:'Examinez des dossiers d’exercice, choisissez la trace pertinente et testez les limites de votre conclusion.',en:'Examine practice records, choose appropriate evidence, and test the limits of your conclusion.'})[lang]
        : baseModuleText
  const moduleCards = [
    { id: 'math' as const, image: 'math-academic.jpg', childImage: 'math-kids.jpg', title: labels.tabs.math[lang], description: labels.mathText[lang] },
    { id: 'physics' as const, image: 'physics-academic.jpg', childImage: 'physics-kids.jpg', title: labels.tabs.physics[lang], description: labels.physicsText[lang] },
    { id: 'chemistry' as const, image: 'chemistry-academic.jpg', childImage: 'chemistry-kids.jpg', title: labels.tabs.chemistry[lang], description: labels.chemistryText[lang] },
    { id: 'body' as const, image: 'body-academic-v2.jpg', childImage: 'body-kids-v2.jpg', title: labels.tabs.body[lang], description: labels.bodyText[lang] },
    { id: 'earth' as const, image: 'journey-discovery-earth-academic-v1.jpg', childImage: 'journey-discovery-earth-kids-v1.jpg', title: labels.tabs.earth[lang], description: labels.earthText[lang] },
    { id: 'human' as const, image: 'journey-discovery-human-history-academic-v1.jpg', childImage: 'journey-discovery-human-history-kids-v1.jpg', title: labels.tabs.human[lang], description: labels.humanText[lang] },
    { id: 'technology' as const, image: 'journey-discovery-technology-academic-v1.jpg', childImage: 'journey-discovery-technology-kids-v1.jpg', title: labels.tabs.technology[lang], description: labels.technologyText[lang] },
    { id: 'space' as const, image: 'journey-discovery-space-academic-v1.jpg', childImage: 'journey-discovery-space-kids-v1.jpg', title: labels.tabs.space[lang], description: labels.spaceText[lang] },
  ]
  return (
    <div className="page-wide lab">
      <header className="lab-portal-hero"><span className="material-symbols-rounded">science</span><div><small>{t(lang, 'navLab')}</small><h1>{labels.heading[lang]}</h1><p>{labels.intro[lang]}</p></div></header>
      {!module ? <section className="lab-module-cards" aria-label={labels.heading[lang]}>{moduleCards.map((card) => <button className="lab-module-card" key={card.id} onClick={() => { setModule(card.id); sound.click() }}><span className="lab-module-card-image"><img src={publicUrl(`assets/img/${presentationLevel === 'kids' ? card.childImage : card.image}`)} alt="" loading="lazy"/></span><span className="lab-module-card-copy"><strong>{card.title}</strong><small>{card.description}</small><b>{lang === 'ar' ? 'ابدأ الاستكشاف' : lang === 'fr' ? 'Commencer' : 'Start exploring'} <span className="material-symbols-rounded">arrow_forward</span></b></span></button>)}</section> : <>
      <button className="lab-back-to-modules" onClick={() => { setModule(null); window.location.hash = '#/lab' }}><span className="material-symbols-rounded">arrow_back</span>{lang === 'ar' ? 'كل المختبرات' : lang === 'fr' ? 'Tous les laboratoires' : 'All laboratories'}</button>
      <nav className="lab-module-tabs" role="tablist" aria-label={labels.heading[lang]}>
        {moduleCards.map((card) => <button key={card.id} role="tab" aria-selected={module === card.id} className={module === card.id ? 'active' : ''} onClick={() => { setModule(card.id); window.location.hash = `#/lab/${card.id}`; sound.click() }}>{card.title}</button>)}
      </nav>
      <section className="lab-module-panel" id={`lab-${module}`} tabIndex={-1}>
        <header><div><h2>{labels.tabs[module][lang]}</h2><p>{moduleText}</p></div></header>
        {module === 'math' && <><ExperimentWorkbench key={`math-${presentationLevel}`} module="math" lang={lang} level={presentationLevel}/><MathLab lang={lang} level={presentationLevel}/></>}
        {module === 'chemistry' && <><ExperimentWorkbench key={`chemistry-${presentationLevel}`} module="chemistry" lang={lang} level={presentationLevel}/><div className="lab-grid"><PhScale lang={lang}/><div className="lab-card lab-3d-card"><img src={publicUrl(`assets/img/${presentationLevel === 'kids' ? 'chemistry-kids.jpg' : 'chemistry-academic.jpg'}`)} alt={lang === 'ar' ? 'تصوير تعليمي لبنية الذرة' : lang === 'fr' ? 'Illustration pédagogique d’un atome' : 'Educational atom illustration'} loading="lazy"/><Scene3D kind="atom" lang={lang}/></div></div><Suspense fallback={null}><ScientificGallery lang={lang} level={presentationLevel === 'kids' ? 'kids' : 'academic'} domains={['chemistry']}/></Suspense></>}
        {module === 'physics' && <><ExperimentWorkbench key={`physics-${presentationLevel}`} module="physics" lang={lang} level={presentationLevel}/><div className="lab-grid"><Circuit lang={lang} level={presentationLevel}/><Projectile lang={lang} level={presentationLevel}/></div><Suspense fallback={null}><ScientificGallery lang={lang} level={presentationLevel === 'kids' ? 'kids' : 'academic'} domains={['physics']}/></Suspense></>}
        {module === 'body' && <><ExperimentWorkbench key={`body-${presentationLevel}`} module="body" lang={lang} level={presentationLevel}/><p className="lab-body-intro">{labels.bodyText[lang]}</p><BodyExplorer3D lang={lang} level={presentationLevel}/></>}
        {module === 'earth' && <Suspense fallback={<p>{lang==='ar'?'جار تحميل مختبر الأرض…':lang==='fr'?'Chargement du laboratoire terrestre…':'Loading the Earth lab…'}</p>}><EarthDiscovery lang={lang} academic={presentationLevel !== 'kids'}/><WaterCycleLab lang={lang} level={presentationLevel}/><ScientificGallery lang={lang} level={presentationLevel === 'kids' ? 'kids' : 'academic'} domains={['earth']}/></Suspense>}
        {module === 'human' && (themeId ? <HumanInquiryLab key={themeId} lang={lang} level={presentationLevel} themeId={themeId}/> : <Suspense fallback={<p>{lang==='ar'?'جار تحميل مختبر علوم الإنسان…':lang==='fr'?'Chargement du laboratoire des sciences humaines…':'Loading the human sciences lab…'}</p>}><HumanitiesExplorer lang={lang} level={presentationLevel} embedded/></Suspense>)}
        {module === 'technology' && (themeId==='communications'||themeId==='transport' ? <MovementLab key={themeId} lang={lang} level={presentationLevel} kind={themeId}/> : <><Suspense fallback={<p>{lang==='ar'?'جار تحميل مختبر علوم التقنية…':lang==='fr'?'Chargement du laboratoire technologique…':'Loading the technology lab…'}</p>}><ScientificGallery lang={lang} level={presentationLevel === 'kids' ? 'kids' : 'academic'} domains={['tech']}/></Suspense>{presentationLevel === 'kids' && <KidsLearningStudio lang={lang} technologyLab/>}</>)}
        {module === 'space' && <Suspense fallback={<p>{lang==='ar'?'جار تحميل مختبر الفضاء…':lang==='fr'?'Chargement du laboratoire spatial…':'Loading the space lab…'}</p>}><SpaceDiscovery lang={lang} academic={presentationLevel !== 'kids'} initialTopic={initialSpaceTopic}/></Suspense>}
      </section>
      </>}
    </div>
  )
}
