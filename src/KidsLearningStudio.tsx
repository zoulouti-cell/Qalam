import { useEffect, useMemo, useState } from 'react'
import type { Lang } from './i18n'

type LabId = 'math' | 'space' | 'body' | 'nature' | 'physics' | 'chemistry' | 'technology' | 'ai' | 'algorithm'

const COPY: Record<Lang, {
  title: string; subtitle: string; ages: [string, string]; tryIt: string; question: string
  labels: Record<LabId, string>; hints: Record<LabId, [string, string]>; facts: Record<LabId, [string, string]>
  fraction: string; choose: string; numerator: string; slow: string; fast: string; temperature: string
  solid: string; liquid: string; gas: string; switchOn: string; switchOff: string
  train: string; test: string; animal: string; result: string; stages: Record<string, string>
  algorithmNext: string; algorithmReset: string; algorithmSorted: string
}> = {
  ar: {
    title: 'مختبر الاستكشاف', subtitle: 'حرّك، جرّب، واكتشف الفكرة بنفسك', ages: ['مستكشف صغير · 4–7', 'مستكشف · 8–15'], tryIt: 'جرّب بيدك', question: 'فكّر واكتشف',
    labels: { math: 'رياضيات', space: 'الفضاء', body: 'جسم الإنسان', nature: 'الطبيعة', physics: 'الفيزياء', chemistry: 'الكيمياء', technology: 'التقنية', ai: 'الذكاء الاصطناعي', algorithm: 'الخوارزميات' },
    hints: { math: ['اضغط على قطعة البيتزا لتغيّر الجزء الملوّن!', 'غيّر عدد الأجزاء ثم قارن الكسر الملوّن بالكُل.'], space: ['شاهد الكواكب وهي تدور حول الشمس.', 'لاحظ: لكل كوكب مدار وزمن مختلفان حول الشمس.'], body: ['شاهد القلب يدقّ، ثم اضغط لتسرّع النبض.', 'يقيس النبض عدد ضربات القلب خلال دقيقة.'], nature: ['اضغط على مراحل رحلة قطرة الماء.', 'تتحول المياه بين السائل والبخار والجليد في دورة مستمرة.'], physics: ['اسحب المنزلق لترى الكرة تنزل المنحدر.', 'زيادة الميل تجعل الجاذبية تسحب الكرة لأسفل أسرع.'], chemistry: ['دفّئ الجسيمات وبرّدها وشاهد حركتها.', 'تغيّر الطاقة الحرارية حركة الجسيمات وحالة المادة.'], technology: ['المس المفتاح لتضيء المصباح!', 'أغلق الدائرة الكهربائية كي يمر التيار ويضيء المصباح.'], ai: ['اختر صورة ودع النموذج يخمّن ما يراها.', 'يتعلم النموذج من أمثلة كثيرة، ثم يقدّم تخمينًا قد يصيب أو يخطئ.'], algorithm: ['اضغط «الخطوة التالية» لترتيب الأرقام.', 'تقارن الخوارزمية كل رقم بجاره وتبدّل بينهما عند الحاجة.'] },
    facts: { math: ['الكسر يصف جزءًا من شيء كامل.', 'في 3⁄4، قُسّم الكل إلى أربعة أجزاء وأُخذت ثلاثة.'], space: ['الأرض كوكب يدور حول الشمس.', 'يكمل كوكب الأرض دورة حول الشمس خلال سنة تقريبًا.'], body: ['قلبك عضلة تعمل ليلًا ونهارًا.', 'يتغير معدّل النبض مع الحركة والراحة.'], nature: ['الماء يسافر في الطبيعة باستمرار.', 'التبخر والتكاثف والهطول مراحل من دورة الماء.'], physics: ['الجاذبية تجذب الأشياء نحو الأرض.', 'تؤثر الجاذبية في تسارع الأجسام الساقطة.'], chemistry: ['المادة تتكون من جسيمات صغيرة.', 'حالة المادة ترتبط بحركة جسيماتها وطاقة الترابط بينها.'], technology: ['الدائرة طريق للكهرباء.', 'يحتاج التيار إلى مسار مغلق ليجري في الدائرة.'], ai: ['الحاسوب يبحث عن أنماط في الأمثلة.', 'تنبؤ النموذج احتمال مبني على بيانات التدريب، وليس فهمًا بشريًا.'], algorithm: ['الخوارزمية خطوات مرتبة لحل مشكلة.', 'تكرار المقارنة والتبديل يرتّب الأرقام من الأصغر إلى الأكبر.'] },
    fraction: 'الأجزاء الملوّنة', choose: 'اختر عدد الأجزاء', numerator: 'الأجزاء الملوّنة', slow: 'بطيء', fast: 'سريع', temperature: 'درجة التسخين', solid: 'صلب', liquid: 'سائل', gas: 'غاز', switchOn: 'أغلق المفتاح', switchOff: 'افتح المفتاح', train: 'أضف أمثلة للتعلّم', test: 'اختبر النموذج', animal: 'اختر صورة', result: 'تخمين النموذج', stages: { evaporate: 'تبخّر', cloud: 'تكوّن السحب', rain: 'مطر', river: 'عودة إلى النهر' }, algorithmNext: 'الخطوة التالية', algorithmReset: 'ابدأ من جديد', algorithmSorted: 'أحسنت! أصبحت الأرقام مرتبة.',
  },
  fr: {
    title: 'L’atelier de découverte', subtitle: 'Bouge, essaie et découvre par toi-même', ages: ['Petit explorateur · 4–7', 'Explorateur · 8–15'], tryIt: 'À toi d’essayer', question: 'Observe et découvre',
    labels: { math: 'Maths', space: 'Espace', body: 'Corps humain', nature: 'Nature', physics: 'Physique', chemistry: 'Chimie', technology: 'Technologie', ai: 'Intelligence artificielle', algorithm: 'Algorithmes' },
    hints: { math: ['Touche une part de pizza pour la colorier !', 'Change le nombre de parts et compare la fraction au tout.'], space: ['Observe les planètes tourner autour du Soleil.', 'Chaque planète suit une orbite et une durée différentes.'], body: ['Regarde le cœur battre et accélère son rythme.', 'Le pouls compte les battements du cœur en une minute.'], nature: ['Choisis une étape du voyage de la goutte.', 'L’eau passe entre l’état liquide, la vapeur et la glace.'], physics: ['Fais glisser le curseur pour faire rouler la bille.', 'Plus la pente est forte, plus la gravité accélère la bille.'], chemistry: ['Chauffe ou refroidis les particules.', 'La chaleur change le mouvement des particules et l’état de la matière.'], technology: ['Touche l’interrupteur pour allumer la lampe !', 'Le circuit fermé laisse passer le courant.'], ai: ['Choisis une image : le modèle va deviner.', 'Le modèle apprend avec des exemples et peut se tromper.'], algorithm: ['Appuie sur « Étape suivante » pour ranger les nombres.', 'L’algorithme compare deux nombres voisins et les échange si besoin.'] },
    facts: { math: ['Une fraction décrit une partie d’un tout.', 'Dans 3/4, le tout est divisé en quatre parts, dont trois sont prises.'], space: ['La Terre tourne autour du Soleil.', 'La Terre fait un tour complet en environ un an.'], body: ['Ton cœur est un muscle qui travaille sans arrêt.', 'Le rythme change avec l’activité et le repos.'], nature: ['L’eau circule sans cesse dans la nature.', 'Évaporation, condensation et pluie font partie du cycle.'], physics: ['La gravité attire les objets vers la Terre.', 'La gravité agit sur l’accélération des objets qui tombent.'], chemistry: ['La matière est faite de très petites particules.', 'L’état de la matière dépend du mouvement et de l’énergie des particules.'], technology: ['Un circuit est un chemin pour l’électricité.', 'Le courant circule dans un circuit fermé.'], ai: ['Un ordinateur repère des motifs dans les exemples.', 'Une prédiction est une probabilité : le modèle peut se tromper.'], algorithm: ['Un algorithme est une suite d’étapes pour résoudre un problème.', 'En comparant puis en échangeant les nombres, on les trie du plus petit au plus grand.'] },
    fraction: 'Parts colorées', choose: 'Choisir le nombre de parts', numerator: 'parts colorées', slow: 'Lent', fast: 'Rapide', temperature: 'Chaleur', solid: 'Solide', liquid: 'Liquide', gas: 'Gaz', switchOn: 'Fermer le circuit', switchOff: 'Ouvrir le circuit', train: 'Ajouter des exemples', test: 'Tester le modèle', animal: 'Choisir une image', result: 'Réponse du modèle', stages: { evaporate: 'Évaporation', cloud: 'Nuages', rain: 'Pluie', river: 'Retour à la rivière' }, algorithmNext: 'Étape suivante', algorithmReset: 'Recommencer', algorithmSorted: 'Bravo ! Les nombres sont rangés.',
  },
  en: {
    title: 'Discovery studio', subtitle: 'Move, try, and discover the idea yourself', ages: ['Little explorer · 4–7', 'Explorer · 8–15'], tryIt: 'Try it yourself', question: 'Think and explore',
    labels: { math: 'Maths', space: 'Space', body: 'Human body', nature: 'Nature', physics: 'Physics', chemistry: 'Chemistry', technology: 'Technology', ai: 'Artificial intelligence', algorithm: 'Algorithms' },
    hints: { math: ['Tap a pizza slice to change the colored part!', 'Change the number of pieces, then compare the fraction to the whole.'], space: ['Watch planets travel around the Sun.', 'Each planet has its own orbit and travel time.'], body: ['Watch the heart beat, then make it go faster.', 'Pulse counts how many times the heart beats in a minute.'], nature: ['Choose a step in the water drop’s journey.', 'Water moves between liquid, vapor, and ice in a cycle.'], physics: ['Move the slider to roll the ball down the slope.', 'A steeper slope lets gravity pull the ball down faster.'], chemistry: ['Warm or cool the particles and watch them move.', 'Heat changes particle motion and the state of matter.'], technology: ['Tap the switch to light the bulb!', 'Close the circuit so electricity can flow.'], ai: ['Pick a picture and let the model make a guess.', 'A model learns from examples; its guess can be right or wrong.'], algorithm: ['Tap “Next step” to sort the numbers.', 'The algorithm compares neighbors and swaps them when needed.'] },
    facts: { math: ['A fraction describes part of a whole.', 'In 3/4, the whole is split into four equal parts and three are chosen.'], space: ['Earth is a planet that travels around the Sun.', 'Earth completes one trip around the Sun in about a year.'], body: ['Your heart is a muscle that works day and night.', 'Your pulse changes when you move or rest.'], nature: ['Water keeps moving through nature.', 'Evaporation, clouds, and rain are parts of the water cycle.'], physics: ['Gravity pulls things toward Earth.', 'Gravity affects how quickly falling objects speed up.'], chemistry: ['Matter is made of tiny particles.', 'A material’s state depends on particle motion and energy.'], technology: ['A circuit is a path for electricity.', 'Electric current can flow around a closed circuit.'], ai: ['Computers look for patterns in examples.', 'A model’s prediction is a probability, and it can be wrong.'], algorithm: ['An algorithm is a sequence of steps for solving a problem.', 'Compare and swap the numbers repeatedly to sort them from smallest to largest.'] },
    fraction: 'Colored parts', choose: 'Choose the number of parts', numerator: 'colored parts', slow: 'Slow', fast: 'Fast', temperature: 'Heat level', solid: 'Solid', liquid: 'Liquid', gas: 'Gas', switchOn: 'Close the switch', switchOff: 'Open the circuit', train: 'Add learning examples', test: 'Test the model', animal: 'Choose a picture', result: 'Model’s guess', stages: { evaporate: 'Evaporation', cloud: 'Clouds form', rain: 'Rain', river: 'Back to the river' }, algorithmNext: 'Next step', algorithmReset: 'Start again', algorithmSorted: 'Great! The numbers are sorted.',
  },
}

const ORDER: LabId[] = ['math', 'space', 'body', 'nature', 'physics', 'chemistry', 'technology', 'ai', 'algorithm']
const EMOJI: Record<LabId, string> = { math: '🍕', space: '🪐', body: '💓', nature: '🌧️', physics: '🛝', chemistry: '🧪', technology: '💡', ai: '🤖', algorithm: '🔢' }

function guessLab(articleId = '', title = '', category = ''): LabId {
  const text = `${articleId} ${title} ${category}`.toLowerCase()
  if (/math|fraction|number|addition|geometry|رياض|حساب|كسر|هندس|عدد/.test(text)) return 'math'
  if (/algorithm|sorting|خوارزم/.test(text)) return 'algorithm'
  if (/sun|solar|mars|space|planet|moon|star|universe|orbit|شمس|فضاء|مريخ|قمر|كوكب|كون|نجم/.test(text)) return 'space'
  if (/heart|body|blood|lung|brain|human|anatom|قلب|جسم|دم|رئة|دماغ|إنسان|جسم الإنسان/.test(text)) return 'body'
  if (/water|climate|plant|forest|animal|nature|weather|ماء|مناخ|نبات|غابة|حيوان|طبيعة|طقس/.test(text)) return 'nature'
  if (/physics|gravity|force|motion|energy|light|sound|فيزياء|جاذبية|قوة|حركة|طاقة|ضوء|صوت/.test(text)) return 'physics'
  if (/chem|atom|molecule|matter|element|كيمياء|ذرة|جزيء|مادة|عنصر/.test(text)) return 'chemistry'
  if (/technology|computer|circuit|robot|engineering|تقنية|حاسوب|دائرة|روبوت|هندسة/.test(text)) return 'technology'
  if (/artificial|intelligence|machine|\bai\b|ذكاء|تعلم الآلة/.test(text)) return 'ai'
  return 'nature'
}

function Fraction({ lang, older, copy }: { lang: Lang; older: boolean; copy: (typeof COPY)[Lang] }) {
  const [parts, setParts] = useState(4)
  const [filled, setFilled] = useState(2)
  const pieces = Array.from({ length: parts }, (_, i) => {
    const a0 = -Math.PI / 2 + (i * Math.PI * 2) / parts
    const a1 = -Math.PI / 2 + ((i + 1) * Math.PI * 2) / parts
    const x0 = 100 + 74 * Math.cos(a0), y0 = 100 + 74 * Math.sin(a0)
    const x1 = 100 + 74 * Math.cos(a1), y1 = 100 + 74 * Math.sin(a1)
    return `M 100 100 L ${x0} ${y0} A 74 74 0 ${parts === 1 ? 1 : 0} 1 ${x1} ${y1} Z`
  })
  return <>
    <svg className="kids-lab-svg fraction-svg" viewBox="0 0 200 200" role="img" aria-label={`${filled}/${parts}`}>
      {pieces.map((d, i) => <path key={i} d={d} role="button" tabIndex={0} aria-pressed={i < filled} aria-label={`${copy.fraction} ${i + 1}`} fill={i < filled ? '#ff9f43' : '#dceafa'} stroke="white" strokeWidth="3" onClick={() => setFilled(i + 1)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFilled(i + 1) } }} className="lab-slice" />)}
    </svg>
    <div className="lab-controls"><span>{copy.choose}</span>{[2, 3, 4, 6, 8].map((n) => <button key={n} className={parts === n ? 'lab-pill selected' : 'lab-pill'} onClick={() => { setParts(n); setFilled(Math.min(n, Math.max(1, Math.round(n / 2)))) }}>{n}</button>)}</div>
    <p className="lab-readout">{copy.fraction}: <strong>{filled} / {parts}</strong></p>
    {older && <p className="lab-readout secondary">{filled} ÷ {parts} = {(filled / parts).toLocaleString(lang, { maximumFractionDigits: 2 })}</p>}
  </>
}

function Space({ copy }: { copy: (typeof COPY)[Lang] }) {
  const [speed, setSpeed] = useState(1)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return <>
    <svg className="kids-lab-svg space-svg" viewBox="0 0 420 250" role="img" aria-label={copy.labels.space}>
      <defs><radialGradient id="sunGlow"><stop stopColor="#fff3a6"/><stop offset="1" stopColor="#ff9d32"/></radialGradient></defs>
      <circle cx="210" cy="125" r="36" fill="url(#sunGlow)" className="lab-sun" />
      {[64, 97, 132, 166].map((r, i) => <g key={r}><ellipse cx="210" cy="125" rx={r} ry={r * .58} fill="none" stroke="#a8c8ee" strokeDasharray="4 5" opacity=".7"/><circle r={5 + i} fill={['#55a9ea','#fa805e','#91c875','#d7aa72'][i]}>{!reduced && <animateMotion dur={`${(8 + i * 5) / speed}s`} repeatCount="indefinite" path={`M ${210-r} 125 a ${r} ${r * .58} 0 1 0 ${2*r} 0 a ${r} ${r * .58} 0 1 0 ${-2*r} 0`} />}</circle></g>)}
    </svg>
    <div className="lab-controls"><span>{copy.slow}</span><input aria-label={copy.labels.space} type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}/><span>{copy.fast}</span></div>
  </>
}

function Body({ copy }: { copy: (typeof COPY)[Lang] }) {
  const [active, setActive] = useState(false)
  return <>
    <svg className="kids-lab-svg body-svg" viewBox="0 0 420 220" role="img" aria-label={copy.labels.body}>
      <path d="M185 105 C150 55 85 72 76 120 C68 164 145 177 184 131 M235 105 C270 55 335 72 344 120 C352 164 275 177 236 131" fill="#bce8ee" stroke="#55a6b7" strokeWidth="4"/>
      <path d="M210 57 C183 28 157 65 180 91 L210 123 L240 91 C263 65 237 28 210 57Z" fill="#ff6475" className={active ? 'lab-heart fast' : 'lab-heart'}/>
      <path d="M210 123 C210 160 166 169 126 181 M210 123 C210 160 255 169 294 181" stroke="#ef6371" strokeWidth="8" fill="none" strokeDasharray="7 9" className="blood-flow"/>
      <circle cx="126" cy="181" r="7" fill="#ef6371"/><circle cx="294" cy="181" r="7" fill="#ef6371"/>
      <text x="210" y="207" textAnchor="middle" fontSize="15" fill="#31566a">{copy.labels.body}</text>
    </svg>
    <div className="lab-controls"><button className={active ? 'lab-pill selected' : 'lab-pill'} onClick={() => setActive(!active)}>{active ? copy.fast : copy.slow}</button></div>
  </>
}

function Nature({ lang, copy }: { lang: Lang; copy: (typeof COPY)[Lang] }) {
  const stages = ['evaporate', 'cloud', 'rain', 'river']
  const [stage, setStage] = useState(0)
  return <>
    <svg className="kids-lab-svg nature-svg" viewBox="0 0 420 230" role="img" aria-label={copy.labels.nature}>
      <circle cx="353" cy="48" r="27" fill="#ffcf55" className={stage === 0 ? 'lab-sun' : ''}/>
      <path d="M0 161 Q75 132 147 165 T290 160 T420 165 V230 H0Z" fill="#77c98d"/><path d="M0 190 Q115 174 220 196 T420 190 V230 H0Z" fill="#43a9e0"/>
      <g fill="#fff" className={stage === 1 ? 'lab-cloud cloud-bounce' : 'lab-cloud'}><circle cx="190" cy="79" r="25"/><circle cx="224" cy="64" r="35"/><circle cx="258" cy="81" r="25"/><rect x="174" y="78" width="101" height="28" rx="14"/></g>
      <path d="M344 78 Q300 84 268 84" fill="none" stroke="#4d9ad8" strokeWidth="4" strokeDasharray="7 7" className={stage === 0 ? 'lab-dash' : ''}/>
      {[193,223,251].map((x) => <path key={x} d={`M${x} 112v38`} stroke="#4d9ad8" strokeWidth="4" strokeLinecap="round" className={stage === 2 ? 'lab-rain' : ''}/>)}
      <path d="M65 187 Q115 173 170 184" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="8 8" className={stage === 3 ? 'lab-dash' : ''}/>
      <text x="210" y="220" textAnchor="middle" fontSize="14" fill="#31566a">{copy.stages[stages[stage]]}</text>
    </svg>
    <div className="lab-controls">{stages.map((s, i) => <button key={s} className={stage === i ? 'lab-pill selected' : 'lab-pill'} onClick={() => setStage(i)}>{copy.stages[s]}</button>)}</div>
    <span className="sr-only">{lang}</span>
  </>
}

function Physics({ copy }: { copy: (typeof COPY)[Lang] }) {
  const [tilt, setTilt] = useState(35)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return <>
    <svg className="kids-lab-svg physics-svg" viewBox="0 0 420 230" role="img" aria-label={copy.labels.physics}>
      <path d={`M70 180 L350 ${180 - tilt * 1.55} L350 190 L70 190 Z`} fill="#a7d9ad" stroke="#529566" strokeWidth="4"/>
      <path d={`M100 174 L330 ${174 - tilt * 1.55}`} stroke="#8a714e" strokeWidth="6" strokeLinecap="round"/>
      <circle r="18" fill="#ffa43b" stroke="#df7635" strokeWidth="4">{!reduced && <animateMotion dur={`${Math.max(1.2, 5 - tilt / 18)}s`} repeatCount="indefinite" path={`M 116 165 L 319 ${165 - tilt * 1.55}`}/>}</circle>
      <text x="210" y="220" textAnchor="middle" fontSize="15" fill="#31566a">{copy.labels.physics}</text>
    </svg>
    <div className="lab-controls"><span>{copy.slow}</span><input aria-label={copy.labels.physics} type="range" min="15" max="55" value={tilt} onChange={(e) => setTilt(Number(e.target.value))}/><span>{copy.fast}</span></div>
  </>
}

function Chemistry({ copy }: { copy: (typeof COPY)[Lang] }) {
  const [heat, setHeat] = useState(30)
  const state = heat < 34 ? copy.solid : heat < 68 ? copy.liquid : copy.gas
  const dots = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ x: 30 + ((i * 47) % 260), y: 30 + ((i * 71) % 130), delay: `${i * -0.17}s` })), [])
  return <>
    <div className={`molecule-stage phase-${heat < 34 ? 'solid' : heat < 68 ? 'liquid' : 'gas'}`} role="img" aria-label={`${copy.labels.chemistry}: ${state}`}>
      {dots.map((p, i) => <span key={i} className="molecule-dot" style={{ left: `${p.x / 3.2}%`, top: `${p.y / 1.9}%`, animationDelay: p.delay }} />)}
    </div>
    <div className="lab-controls"><span>{copy.temperature}</span><input aria-label={copy.temperature} type="range" min="0" max="100" value={heat} onChange={(e) => setHeat(Number(e.target.value))}/><strong className="lab-pill selected">{state}</strong></div>
  </>
}

function Technology({ copy }: { copy: (typeof COPY)[Lang] }) {
  const [closed, setClosed] = useState(false)
  return <>
    <svg className="kids-lab-svg circuit-svg" viewBox="0 0 420 230" role="img" aria-label={copy.labels.technology}>
      <path d="M80 170V85H171 M249 85H340V170H80" fill="none" stroke={closed ? '#3cb98d' : '#91a5aa'} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={closed ? 'none' : '8 10'}/>
      <path d="M171 85 Q210 22 249 85" fill="none" stroke={closed ? '#3cb98d' : '#91a5aa'} strokeWidth="7"/>
      <path d="M210 65v42m-19-23h38" stroke="#536c76" strokeWidth="6"/>
      <path d="M210 107 C185 132 193 165 210 165 C227 165 235 132 210 107Z" fill={closed ? '#ffdc68' : '#d9e2dd'} stroke={closed ? '#f2ae38' : '#95a6a0'} strokeWidth="5" className={closed ? 'bulb-on' : ''}/>
      <path d="M197 170h26m-22 8h18" stroke="#647b7a" strokeWidth="5" strokeLinecap="round"/>
    </svg>
    <div className="lab-controls"><button className="lab-pill selected" onClick={() => setClosed(!closed)}>{closed ? copy.switchOff : copy.switchOn}</button><span>{closed ? '✨' : '🔌'}</span></div>
  </>
}

function ArtificialIntelligence({ copy }: { copy: (typeof COPY)[Lang] }) {
  const [animal, setAnimal] = useState<'cat' | 'dog'>('cat')
  const [examples, setExamples] = useState({ cat: 0, dog: 0 })
  const [tested, setTested] = useState(false)
  const visibleGuess = tested ? examples.cat === examples.dog ? animal : examples.cat > examples.dog ? 'cat' : 'dog' : ''
  return <>
    <div className="ai-lab-stage"><div className="ai-example">{animal === 'cat' ? '🐱' : '🐶'}<span>{copy.animal}</span></div><div className="ai-network" aria-hidden="true"><i/><i/><i/><i/><b>AI</b></div><div className="ai-example result">{visibleGuess ? (visibleGuess === 'cat' ? '🐱' : '🐶') : '❔'}<span>{copy.result}</span></div></div>
    <p className="ai-example-counts">🐱 {examples.cat}　·　🐶 {examples.dog}</p>
    <div className="lab-controls"><button className="lab-pill selected" onClick={() => { setExamples((x) => ({ ...x, [animal]: x[animal] + 1 })); setTested(false) }}>{copy.train} {animal === 'cat' ? '🐱' : '🐶'}</button><button className="lab-pill" onClick={() => { setAnimal(animal === 'cat' ? 'dog' : 'cat'); setTested(false) }}>{copy.animal} {animal === 'cat' ? '🐶' : '🐱'}</button><button className="lab-pill selected" onClick={() => setTested(true)}>{copy.test}</button></div>
    {tested && <p className="lab-readout">{copy.result}: <strong>{visibleGuess === 'cat' ? '🐱' : '🐶'}</strong></p>}
  </>
}

function Algorithm({ copy }: { copy: (typeof COPY)[Lang] }) {
  const [numbers, setNumbers] = useState([4, 1, 3, 2])
  const [index, setIndex] = useState(0)
  const sorted = numbers.every((value, i) => i === 0 || numbers[i - 1] <= value)
  const next = () => {
    if (sorted) return
    setNumbers((values) => {
      const result = [...values]
      if (result[index] > result[index + 1]) [result[index], result[index + 1]] = [result[index + 1], result[index]]
      return result
    })
    setIndex((i) => i >= numbers.length - 2 ? 0 : i + 1)
  }
  const reset = () => { setNumbers([4, 1, 3, 2]); setIndex(0) }
  return <>
    <div className="algorithm-stage" role="img" aria-label={copy.labels.algorithm}>
      {numbers.map((n, i) => <div key={i} className={i === index || i === index + 1 ? 'algorithm-bar comparing' : 'algorithm-bar'} style={{ height: `${36 + n * 22}px` }}><b>{n}</b></div>)}
    </div>
    <div className="lab-controls"><button className="lab-pill selected" onClick={next} disabled={sorted}>{sorted ? copy.algorithmSorted : copy.algorithmNext}</button><button className="lab-pill" onClick={reset}>{copy.algorithmReset}</button></div>
  </>
}

export default function KidsLearningStudio({ lang, articleId, articleTitle = '', category = '' }: { lang: Lang; articleId?: string; articleTitle?: string; category?: string }) {
  const copy = COPY[lang]
  const recommended = guessLab(articleId, articleTitle, category)
  const [selected, setSelected] = useState<LabId>(recommended)
  const [age, setAge] = useState<0 | 1>(0)
  const current = articleId ? recommended : selected
  const older = age === 1
  const visual = () => {
    switch (current) {
      case 'math': return <Fraction lang={lang} older={older} copy={copy} />
      case 'space': return <Space copy={copy} />
      case 'body': return <Body copy={copy} />
      case 'nature': return <Nature lang={lang} copy={copy} />
      case 'physics': return <Physics copy={copy} />
      case 'chemistry': return <Chemistry copy={copy} />
      case 'technology': return <Technology copy={copy} />
      case 'ai': return <ArtificialIntelligence copy={copy} />
      case 'algorithm': return <Algorithm copy={copy} />
    }
  }
  return (
    <section className={articleId ? 'kids-studio article-studio' : 'kids-studio'} aria-label={copy.title}>
      <header className="kids-studio-head"><div><span className="kids-studio-kicker">✨ {copy.tryIt}</span><h2>{copy.title}</h2><p>{copy.subtitle}</p></div><div className="kids-age-switch" role="group" aria-label="العمر"><button className={!older ? 'active' : ''} onClick={() => setAge(0)}>{copy.ages[0]}</button><button className={older ? 'active' : ''} onClick={() => setAge(1)}>{copy.ages[1]}</button></div></header>
      {!articleId && <div className="kids-lab-rail" role="tablist" aria-label={copy.title}>{ORDER.map((lab) => <button key={lab} role="tab" aria-selected={current === lab} className={current === lab ? 'active' : ''} onClick={() => setSelected(lab)}><span>{EMOJI[lab]}</span>{copy.labels[lab]}</button>)}</div>}
      <div className="kids-lab-card"><div className="kids-lab-visual"><span className="kids-lab-badge">{EMOJI[current]} {copy.labels[current]}</span>{visual()}</div><div className="kids-lab-copy"><strong>{copy.question}</strong><p>{copy.hints[current][age]}</p><div className="kids-lab-fact"><span>💡</span><p>{copy.facts[current][age]}</p></div></div></div>
    </section>
  )
}
