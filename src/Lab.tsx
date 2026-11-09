import { useEffect, useRef, useState } from 'react'
import { t, type Lang } from './i18n'
import Scene3D from './Scenes3D'
import BodyExplorer3D from './BodyExplorer3D'
import { sound } from './sound'
import { awardBadge } from './rewards'
import { publicUrl } from './publicUrl'
import type { Level } from './content'
import { scrollToDetail } from './scrollToDetail'

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
  return <div className="lab-card math-fraction-lab"><h3 className="chart-title"><span className="material-symbols-rounded">pie_chart</span>{lang === 'ar' ? 'ورشة الكسور المرئية' : lang === 'fr' ? 'Atelier des fractions' : 'Fraction workshop'}</h3><div className="fraction-visual" role="img" aria-label={`${numerator}/${denominator}`}><div className="fraction-bar" style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}>{Array.from({ length: denominator }, (_, index) => <span key={index} className={index < numerator ? 'filled' : ''}/>)}</div><strong>{numerator}<i/>{denominator}</strong><p>{copy[level === 'kids' ? 'child' : 'academic'][lang]}</p></div><div className="lab-toolbar fraction-controls"><label className="scene-slider">{copy.numerator[lang]}: {numerator}<input type="range" min={1} max={denominator} value={numerator} onChange={(event) => setNumerator(Number(event.target.value))}/></label><label className="scene-slider">{copy.denominator[lang]}: {denominator}<input type="range" min={2} max={12} value={denominator} onChange={(event) => setDen(Number(event.target.value))}/></label></div></div>
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
  return <div className="lab-card math-symmetry-lab"><h3 className="chart-title"><span className="material-symbols-rounded">flare</span>{lang === 'ar' ? 'استوديو الأنماط والتماثل' : lang === 'fr' ? 'Studio des motifs et symétries' : 'Patterns and symmetry studio'}</h3><div className="symmetry-stage"><svg viewBox="0 0 240 210" role="img" aria-label={lang === 'ar' ? `نمط له ${folds} محاور` : `${folds}-fold pattern`}><g transform={`translate(120 102) rotate(${angle})`}>{petals.map((index) => <g key={index} transform={`rotate(${index * (360 / folds)})`}><ellipse cx="0" cy="-49" rx="17" ry="43" fill={index % 2 ? '#2e8a70' : '#d7b25e'} fillOpacity=".82"/><circle cx="0" cy="-81" r="5" fill="#f8e8bd"/></g>)}<circle r="16" fill="#153f35"/><circle r="6" fill="#d7b25e"/></g></svg></div><div className="lab-toolbar"><label className="scene-slider">{lang === 'ar' ? `محاور التماثل: ${folds}` : lang === 'fr' ? `Axes de symétrie : ${folds}` : `Symmetry axes: ${folds}`}<input type="range" min={2} max={12} value={folds} onChange={(event) => setFolds(Number(event.target.value))}/></label><label className="scene-slider">{lang === 'ar' ? `زاوية الدوران: ${angle}°` : lang === 'fr' ? `Angle : ${angle}°` : `Rotation: ${angle}°`}<input type="range" min={0} max={360} step={5} value={angle} onChange={(event) => setAngle(Number(event.target.value))}/></label></div><p className="kid-note">{level === 'kids' ? (lang === 'ar' ? 'غيّر عدد البتلات، ثم أدر الشكل: هل يعود إلى صورته قبل دورة كاملة؟' : lang === 'fr' ? 'Changez le nombre de pétales et faites tourner le motif : quand retrouve-t-il sa position ?' : 'Change the petals and rotate the pattern: when does it return to its starting position?') : (lang === 'ar' ? 'اختبر التناظر الدوراني: أصغر زاوية تعيد الشكل إلى صورته هي ٣٦٠° مقسومة على عدد مرات التكرار.' : lang === 'fr' ? 'Testez la symétrie de rotation : le plus petit angle de retour est 360° divisé par l’ordre du motif.' : 'Test rotational symmetry: the smallest return angle is 360° divided by the pattern order.')}</p></div>
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
  return <div className="math-lab"><header className="math-lab-intro"><span className="material-symbols-rounded" aria-hidden="true">functions</span><div><h3>{lang === 'ar' ? 'اختر تجربة رياضية' : lang === 'fr' ? 'Choisissez une expérience' : 'Choose a math experiment'}</h3><p>{labels[level === 'kids' ? 'child' : 'academic'][lang]}</p></div></header><div className="math-lab-tabs" role="tablist" aria-label={lang === 'ar' ? 'تجارب الرياضيات' : lang === 'fr' ? 'Expériences mathématiques' : 'Math experiments'}>{(['pythagoras', 'fractions', 'probability', 'symmetry'] as const).map((id) => <button type="button" role="tab" aria-selected={tool === id} className={tool === id ? 'active' : ''} key={id} onClick={() => { setTool(id); sound.click() }}>{labels[id][lang]}</button>)}</div>{tool === 'pythagoras' ? <Pythagoras lang={lang}/> : tool === 'fractions' ? <FractionsLab lang={lang} level={level}/> : tool === 'probability' ? <DiceLab lang={lang} level={level}/> : <SymmetryLab lang={lang} level={level}/>}</div>
}

type LabModule = 'math' | 'chemistry' | 'physics' | 'body'

export default function Lab({ lang, level, kidMode = false, initialModule }: { lang: Lang; level: Level; kidMode?: boolean; initialModule?: LabModule }) {
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
    intro: { ar: 'اختر مختبرًا، غيّر المتغيرات، وشاهد أثرها. النماذج تفاعلية وتشرح الفكرة ولا تستبدل التجربة الواقعية.', fr: 'Choisissez un laboratoire, modifiez les variables et observez leurs effets. Les modèles interactifs expliquent les idées sans remplacer les expériences réelles.', en: 'Choose a lab, change variables, and observe the result. Interactive models explain ideas; they do not replace real experiments.' },
    tabs: {
      math: { ar: 'الرياضيات', fr: 'Mathématiques', en: 'Mathematics' },
      chemistry: { ar: 'الكيمياء', fr: 'Chimie', en: 'Chemistry' },
      physics: { ar: 'الفيزياء', fr: 'Physique', en: 'Physics' },
    body: { ar: 'اعرف جسمك', fr: 'Découvrir le corps humain', en: 'Know your body' },
    },
    mathText: { ar: 'حرّك أضلاع المثلث لتتبّع علاقة فيثاغورس، ثم جرّب تغيير أطواله ولاحظ كيف تتغير المساحة على كل ضلع.', fr: 'Modifiez les côtés du triangle pour explorer Pythagore, puis faites varier leurs longueurs et observez l’aire construite sur chaque côté.', en: 'Adjust the triangle sides to explore Pythagoras, then vary their lengths and observe the area built on each side.' },
    chemistryText: { ar: 'استكشف مقياس الحموضة وبنية الذرة ثلاثية الأبعاد. النموذج الذري تعليمي ومبسّط؛ لا تمثل المدارات مسارات كواكب صغيرة حول النواة.', fr: 'Explorez l’échelle de pH et un modèle atomique 3D. Ce modèle est simplifié : les orbitales ne sont pas de petites trajectoires planétaires autour du noyau.', en: 'Explore pH and a 3D atom model. The model is simplified: orbitals are not tiny planet-like paths around the nucleus.' },
    physicsText: { ar: 'بدّل الدائرة بين التوالي والتوازي، أو غيّر زاوية المقذوف وسرعته لتلاحظ أثرهما في المسار.', fr: 'Comparez les circuits en série et en parallèle, ou modifiez l’angle et la vitesse du projectile pour observer sa trajectoire.', en: 'Compare series and parallel circuits, or change launch angle and speed to observe a projectile’s path.' },
    bodyText: { ar: 'أدر نموذج الجسم، واختر الدماغ أو القلب أو الرئتين أو الكبد أو العظام والعضلات. يشرح الدليل وظيفة العضو وصلته بالجهاز الذي يعمل ضمنه.', fr: 'Faites tourner le corps et choisissez le cerveau, le cœur, les poumons, le foie, les os ou les muscles. Le guide explique la fonction et le système de chaque organe.', en: 'Rotate the body and choose the brain, heart, lungs, liver, bones, or muscles. The guide explains each function and organ system.' },
  }
  const moduleText = module ? { math: labels.mathText, chemistry: labels.chemistryText, physics: labels.physicsText, body: labels.bodyText }[module][lang] : ''
  const moduleCards = [
    { id: 'math' as const, image: 'math-academic.jpg', childImage: 'math-kids.jpg', icon: 'functions', title: labels.tabs.math[lang], description: labels.mathText[lang] },
    { id: 'chemistry' as const, image: 'chemistry-academic.jpg', childImage: 'chemistry-kids.jpg', icon: 'experiment', title: labels.tabs.chemistry[lang], description: labels.chemistryText[lang] },
    { id: 'physics' as const, image: 'physics-academic.jpg', childImage: 'physics-kids.jpg', icon: 'bolt', title: labels.tabs.physics[lang], description: labels.physicsText[lang] },
    { id: 'body' as const, image: 'body-academic.jpg', childImage: 'body-kids.jpg', icon: 'biotech', title: labels.tabs.body[lang], description: labels.bodyText[lang] },
  ]
  return (
    <div className="page-wide lab">
      <header className="lab-portal-hero"><span className="material-symbols-rounded">science</span><div><small>{t(lang, 'navLab')}</small><h1>{labels.heading[lang]}</h1><p>{labels.intro[lang]}</p></div></header>
      {!module ? <section className="lab-module-cards" aria-label={labels.heading[lang]}>{moduleCards.map((card) => <button className="lab-module-card" key={card.id} onClick={() => { setModule(card.id); sound.click() }}><span className="lab-module-card-image"><img src={publicUrl(`assets/img/${presentationLevel === 'kids' ? card.childImage : card.image}`)} alt="" loading="lazy"/><span className="material-symbols-rounded">{card.icon}</span></span><span className="lab-module-card-copy"><strong>{card.title}</strong><small>{card.description}</small><b>{lang === 'ar' ? 'ابدأ الاستكشاف' : lang === 'fr' ? 'Commencer' : 'Start exploring'} <span className="material-symbols-rounded">arrow_forward</span></b></span></button>)}</section> : <>
      <button className="lab-back-to-modules" onClick={() => { setModule(null); window.location.hash = '#/lab' }}><span className="material-symbols-rounded">arrow_back</span>{lang === 'ar' ? 'كل المختبرات' : lang === 'fr' ? 'Tous les laboratoires' : 'All laboratories'}</button>
      <nav className="lab-module-tabs" role="tablist" aria-label={labels.heading[lang]}>
        {(['math', 'chemistry', 'physics', 'body'] as const).map((key) => <button key={key} role="tab" aria-selected={module === key} className={module === key ? 'active' : ''} onClick={() => { setModule(key); sound.click() }}><span className="material-symbols-rounded">{{ math: 'functions', chemistry: 'experiment', physics: 'bolt', body: 'biotech' }[key]}</span>{labels.tabs[key][lang]}</button>)}
      </nav>
      <section className="lab-module-panel" id={`lab-${module}`} tabIndex={-1}>
        <header><span className="material-symbols-rounded">{{ math: 'functions', chemistry: 'experiment', physics: 'bolt', body: 'biotech' }[module]}</span><div><h2>{labels.tabs[module][lang]}</h2><p>{moduleText}</p></div></header>
        {module === 'math' && <MathLab lang={lang} level={presentationLevel}/>}
        {module === 'chemistry' && <div className="lab-grid"><PhScale lang={lang}/><div className="lab-card lab-3d-card"><img src={publicUrl(`assets/img/${presentationLevel === 'kids' ? 'chemistry-kids.jpg' : 'chemistry-academic.jpg'}`)} alt={lang === 'ar' ? 'تصوير تعليمي لبنية الذرة' : lang === 'fr' ? 'Illustration pédagogique d’un atome' : 'Educational atom illustration'} loading="lazy"/><Scene3D kind="atom" lang={lang}/></div></div>}
        {module === 'physics' && <div className="lab-grid"><Circuit lang={lang}/><Projectile lang={lang}/></div>}
        {module === 'body' && <><p className="lab-body-intro">{labels.bodyText[lang]}</p><BodyExplorer3D lang={lang} level={presentationLevel}/></>}
      </section>
      </>}
    </div>
  )
}
