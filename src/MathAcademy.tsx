import { useState } from 'react'
import Mi from './Mi'
import type { Lang } from './i18n'
import type { Level } from './content'

const COPY = {
  ar: {
    title: 'رياضيات تُرى وتُجرّب', sub: 'اختر مسارك، حرّك الرسم، واكتشف الفكرة بنفسك.', young: 'حتى 15 سنة', adult: 'بعد 15 سنة',
    childTitle: 'مختبر الكسور والهندسة', childDesc: 'كل مربع يمثل جزءًا متساويًا. غيّر عدد الأجزاء والمظلّل لتشاهد الكسر.',
    parts: 'الأجزاء', shaded: 'المظلّل', fraction: 'الكسر الذي صنعته', lesson: 'خطوة تعلم',
    fractionTab: 'الكسور', triangleTab: 'مساحة المثلث', triangleTitle: 'حرّك أبعاد المثلث', base: 'القاعدة', height: 'الارتفاع', area: 'المساحة = القاعدة × الارتفاع ÷ 2', adultSteps: [['التفاضل', 'معدلات التغير والمشتقات والنمذجة.'], ['الجبر الخطي', 'المتجهات والمصفوفات وحل الأنظمة.'], ['الاحتمال والإحصاء', 'الاستدلال من البيانات وعدم اليقين.'], ['الهندسة والبرهان', 'التعريفات والمسلمات والبراهين والنماذج.'], ['الرياضيات الحاسوبية', 'الخوارزميات والتحسين والتعلم الآلي.']],
    youngSteps: [['الأعداد', 'الجمع والطرح والضرب والقسمة وتقدير النتائج.'], ['الكسور والنسب', 'قسمة الكل إلى أجزاء، ومقارنة النسب في وصفات وخرائط.'], ['الهندسة', 'المحيط والمساحة والزوايا والمجسمات من حولنا.'], ['الجبر', 'اكتشاف العدد المجهول بميزان يحافظ على التساوي.'], ['البيانات', 'قراءة الجداول والرسوم وفهم المتوسط والاحتمال.']],
    adultTitle: 'منحنى المشتقة: ميل يتغيّر', adultDesc: 'حرّك النقطة على f(x)=x². الخط المماس يقرّب الميل المحلي؛ وعندما نصغّر فرق x يقترب ميل القاطع من المشتقة 2x.',
    xpoint: 'موضع x', value: 'قيمة المشتقة عند النقطة', limit: 'الفكرة: مشتقة f عند x هي نهاية معدل التغيّر عندما يقترب h من الصفر.',
    mathHistory: 'أفكار غيّرت الرياضيات', timeline: [
      ['نحو 300 ق.م. · إقليدس', 'رتّب الهندسة في تعريفات ومسلمات وبراهين مترابطة؛ ما زالت طريقة البرهان أساسًا للتفكير الرياضي.'],
      ['القرن 9 · الخوارزمي', 'نظّم طرق حل المعادلات؛ ومن عنوان كتابه ارتبط اسم الجبر، كما انتقلت عنه طرق حسابية مؤثرة.'],
      ['القرن 17 · ديكارت', 'ربط الجبر بالهندسة عبر الإحداثيات، فصار بالإمكان تمثيل المنحنيات بمعادلات.'],
      ['القرن 17 · نيوتن ولايبنتس', 'طوّرا حساب التفاضل والتكامل بصيغ متقاربة؛ صار أداة لوصف الحركة والتغيّر والعلوم الهندسية.'],
      ['القرن 20 · إيمي نوثر', 'أظهرت صلات عميقة بين التناظر وقوانين الحفظ، وهي فكرة أساسية في الرياضيات والفيزياء الحديثة.'],
      ['القرن 20 · آلان تورينغ', 'أسّس أفكارًا رياضية للحوسبة، وأثّرت نماذجه في علوم الحاسوب والذكاء الاصطناعي.'],
    ],
    sources: 'مصادر وقراءة إضافية', archiveName: 'أرشيف تاريخ الرياضيات', sourceNames: ['إقليدس', 'الخوارزمي', 'ديكارت', 'تاريخ حساب التفاضل والتكامل', 'إيمي نوثر', 'آلان تورينغ'],
  },
  fr: {
    title: 'Les maths en mouvement', sub: 'Choisissez un parcours, manipulez le graphique et découvrez par vous-même.', young: 'Jusqu’à 15 ans', adult: 'Après 15 ans',
    childTitle: 'Atelier des fractions et de la géométrie', childDesc: 'Chaque case représente une part égale. Modifiez le nombre de parts coloriées pour observer la fraction.',
    parts: 'Parts', shaded: 'Coloriées', fraction: 'Fraction obtenue', lesson: 'Étape d’apprentissage',
    fractionTab: 'Fractions', triangleTab: 'Aire du triangle', triangleTitle: 'Modifiez les dimensions', base: 'Base', height: 'Hauteur', area: 'Aire = base × hauteur ÷ 2', adultSteps: [['Analyse', 'Taux de variation, dérivées et modélisation.'], ['Algèbre linéaire', 'Vecteurs, matrices et systèmes.'], ['Probabilités et statistiques', 'Raisonner à partir des données et de l’incertitude.'], ['Géométrie et démonstration', 'Définitions, axiomes, preuves et modèles.'], ['Mathématiques computationnelles', 'Algorithmes, optimisation et apprentissage automatique.']],
    youngSteps: [['Nombres', 'Addition, soustraction, multiplication, division et estimation.'], ['Fractions et proportions', 'Partager un tout et comparer des proportions dans des recettes et des cartes.'], ['Géométrie', 'Périmètres, aires, angles et solides autour de nous.'], ['Algèbre', 'Trouver l’inconnue avec une balance qui conserve l’égalité.'], ['Données', 'Lire tableaux et graphiques, comprendre moyenne et probabilité.']],
    adultTitle: 'La dérivée : une pente qui varie', adultDesc: 'Déplacez le point sur f(x)=x². La tangente approche la pente locale ; en réduisant l’écart h, la pente de la sécante tend vers la dérivée 2x.',
    xpoint: 'Position de x', value: 'Valeur de la dérivée au point', limit: 'Idée : la dérivée de f en x est la limite du taux de variation lorsque h tend vers zéro.',
    mathHistory: 'Des idées qui ont transformé les mathématiques', timeline: [
      ['Vers 300 av. J.-C. · Euclide', 'Il organise la géométrie en définitions, postulats et démonstrations ; la preuve reste au cœur du raisonnement mathématique.'],
      ['IXe siècle · Al-Khwarizmi', 'Il systématise des méthodes de résolution des équations ; son ouvrage donne son nom à l’algèbre.'],
      ['XVIIe siècle · Descartes', 'Il relie algèbre et géométrie par les coordonnées, permettant de représenter les courbes par des équations.'],
      ['XVIIe siècle · Newton et Leibniz', 'Ils développent le calcul différentiel et intégral sous des formes proches ; il devient essentiel pour le mouvement et les sciences.'],
      ['XXe siècle · Emmy Noether', 'Elle révèle des liens profonds entre symétries et lois de conservation, essentiels aux mathématiques et à la physique modernes.'],
      ['XXe siècle · Alan Turing', 'Il pose des bases mathématiques de l’informatique; ses modèles influencent l’informatique et l’intelligence artificielle.'],
    ],
    sources: 'Sources et lectures', archiveName: 'Archives d’histoire des mathématiques', sourceNames: ['Euclide', 'Al-Khwarizmi', 'Descartes', 'Histoire du calcul différentiel', 'Emmy Noether', 'Alan Turing'],
  },
  en: {
    title: 'Mathematics you can see and explore', sub: 'Choose a path, move the graph, and discover the idea yourself.', young: 'Up to age 15', adult: 'Over age 15',
    childTitle: 'Fractions and geometry lab', childDesc: 'Each tile is an equal part. Change the total and shaded parts to see the fraction.',
    parts: 'Parts', shaded: 'Shaded', fraction: 'Your fraction', lesson: 'Learning step',
    fractionTab: 'Fractions', triangleTab: 'Triangle area', triangleTitle: 'Move the triangle dimensions', base: 'Base', height: 'Height', area: 'Area = base × height ÷ 2', adultSteps: [['Calculus', 'Rates of change, derivatives, and modeling.'], ['Linear algebra', 'Vectors, matrices, and systems of equations.'], ['Probability and statistics', 'Reason from data and uncertainty.'], ['Geometry and proof', 'Definitions, axioms, proofs, and models.'], ['Computational mathematics', 'Algorithms, optimization, and machine learning.']],
    youngSteps: [['Numbers', 'Addition, subtraction, multiplication, division, and estimation.'], ['Fractions and ratios', 'Split a whole into parts and compare ratios in recipes and maps.'], ['Geometry', 'Perimeter, area, angles, and solids around us.'], ['Algebra', 'Find an unknown with a balance that keeps both sides equal.'], ['Data', 'Read tables and charts; understand averages and chance.']],
    adultTitle: 'The derivative: a changing slope', adultDesc: 'Move the point along f(x)=x². The tangent approximates the local slope; as the gap h shrinks, the secant slope approaches the derivative 2x.',
    xpoint: 'Position x', value: 'Derivative at the point', limit: 'Idea: the derivative of f at x is the limit of the rate of change as h approaches zero.',
    mathHistory: 'Ideas that reshaped mathematics', timeline: [
      ['c. 300 BCE · Euclid', 'Organized geometry into definitions, postulates, and linked proofs; proof remains central to mathematical reasoning.'],
      ['9th century · Al-Khwarizmi', 'Systematized methods for solving equations; the title of his book gave algebra its name.'],
      ['17th century · Descartes', 'Connected algebra and geometry through coordinates, representing curves with equations.'],
      ['17th century · Newton and Leibniz', 'Developed calculus in closely related forms; it became a key tool for motion and the sciences.'],
      ['20th century · Emmy Noether', 'She revealed deep links between symmetry and conservation laws, foundational in modern mathematics and physics.'],
      ['20th century · Alan Turing', 'He laid mathematical foundations for computing; his models shaped computer science and artificial intelligence.'],
    ],
    sources: 'Sources and further reading', archiveName: 'History of Mathematics Archive', sourceNames: ['Euclid', 'Al-Khwarizmi', 'Descartes', 'History of calculus', 'Emmy Noether', 'Alan Turing'],
  },
} as const

const HIST_LINKS = [
  'https://mathshistory.st-andrews.ac.uk/Biographies/Euclid/',
  'https://mathshistory.st-andrews.ac.uk/Biographies/Al-Khwarizmi/',
  'https://mathshistory.st-andrews.ac.uk/Biographies/Descartes/',
  'https://mathshistory.st-andrews.ac.uk/HistTopics/The_rise_of_calculus/',
  'https://mathshistory.st-andrews.ac.uk/Biographies/Noether_Emmy/',
  'https://mathshistory.st-andrews.ac.uk/Biographies/Turing/',
]

export default function MathAcademy({ lang, level }: { lang: Lang; level: Level }) {
  const c = COPY[lang]
  const [track, setTrack] = useState<'young' | 'adult'>(level === 'kids' ? 'young' : 'adult')
  const [parts, setParts] = useState(6)
  const [shaded, setShaded] = useState(3)
  const [mathTool, setMathTool] = useState<'fraction' | 'triangle'>('fraction')
  const [base, setBase] = useState(12)
  const [triangleHeight, setTriangleHeight] = useState(8)
  const [x, setX] = useState(1.4)
  const px = 250 + x * 42
  const py = 190 - x * x * 12
  const slope = 2 * x
  const tangentPixelSlope = -slope * 2 / 7
  return <div className="page-wide math-academy" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <a className="math-back" href="#/"><Mi name="arrow_back" /> {lang === 'ar' ? 'الرئيسية' : lang === 'fr' ? 'Accueil' : 'Home'}</a>
    <header className="academy-heading"><span className="academy-kicker"><Mi name="functions" /> {lang === 'ar' ? 'مختبر الرياضيات' : lang === 'fr' ? 'Atelier de mathématiques' : 'Mathematics lab'}</span><h1>{c.title}</h1><p>{c.sub}</p></header>
    {level === 'kids' ? <div className="academy-track-switch"><span className="age-path-badge"><Mi name="child_care" /> {c.young}</span></div> : <div className="academy-track-switch" role="tablist">
      <button className={track === 'young' ? 'active' : ''} onClick={() => setTrack('young')}><Mi name="child_care" /> {c.young}</button>
      <button className={track === 'adult' ? 'active' : ''} onClick={() => setTrack('adult')}><Mi name="school" /> {c.adult}</button>
    </div>}
    {track === 'young' ? <>
      <section className="math-lab-panel"><div className="math-lab-copy"><span className="academy-kicker">{c.lesson} 01</span><h2>{c.childTitle}</h2><p>{c.childDesc}</p><label>{c.parts}: {parts}<input type="range" min="2" max="12" value={parts} onChange={e => { const n = Number(e.target.value); setParts(n); setShaded(Math.min(shaded, n)) }} /></label><label>{c.shaded}: {shaded}<input type="range" min="0" max={parts} value={shaded} onChange={e => setShaded(Number(e.target.value))} /></label><strong className="math-answer">{c.fraction}: {shaded}/{parts} = {(shaded / parts).toFixed(2)}</strong></div>
      <div className="math-visual-column"><div className="math-tool-switch"><button className={mathTool==='fraction'?'active':''} onClick={()=>setMathTool('fraction')}>{c.fractionTab}</button><button className={mathTool==='triangle'?'active':''} onClick={()=>setMathTool('triangle')}>{c.triangleTab}</button></div>{mathTool === 'fraction' ? <div className="fraction-visual" role="img" aria-label={`${shaded}/${parts}`}><div className="fraction-cells" style={{ gridTemplateColumns: `repeat(${Math.min(parts, 6)}, 1fr)` }}>{Array.from({ length: parts }, (_, i) => <span key={i} className={i < shaded ? 'filled' : ''} />)}</div><div className="fraction-wheel" style={{ background: `conic-gradient(#22a884 0 ${shaded / parts * 360}deg, #e6edf3 ${shaded / parts * 360}deg 360deg)` }}><span>{shaded}/{parts}</span></div></div> : <div className="triangle-visual"><h3>{c.triangleTitle}</h3><svg viewBox="0 0 360 230" role="img" aria-label={c.triangleTab}><path d={`M45 192 H${45+base*12} L${45+base*4} ${192-triangleHeight*10} Z`} fill="rgba(27,158,126,.2)" stroke="#137e69" strokeWidth="4"/><path d={`M${45+base*4} ${192-triangleHeight*10} V192`} stroke="#c89133" strokeWidth="2" strokeDasharray="5 5"/><text x={45+base*6} y="218" textAnchor="middle">{c.base}: {base}</text><text x="26" y={205-triangleHeight*5}>{c.height}: {triangleHeight}</text></svg><label>{c.base}: {base}<input type="range" min="6" max="20" value={base} onChange={e=>setBase(Number(e.target.value))}/></label><label>{c.height}: {triangleHeight}<input type="range" min="4" max="14" value={triangleHeight} onChange={e=>setTriangleHeight(Number(e.target.value))}/></label><strong className="math-answer">{c.area} = {base*triangleHeight/2}</strong></div>}</div></section>
      <div className="math-skill-grid">{c.youngSteps.map(([title, body], i) => <article className="math-skill-card" key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
    </> : <>
      <section className="math-lab-panel adult-math-panel"><div className="math-lab-copy"><span className="academy-kicker">f(x) = x²</span><h2>{c.adultTitle}</h2><p>{c.adultDesc}</p><label>{c.xpoint}: {x.toFixed(1)}<input type="range" min="-3" max="3" step="0.1" value={x} onChange={e => setX(Number(e.target.value))} /></label><strong className="math-answer">{c.value}: f′({x.toFixed(1)}) = {slope.toFixed(1)}</strong><p className="math-limit-note">{c.limit}</p></div>
      <div className="derivative-visual"><svg viewBox="0 0 500 300" role="img" aria-label="Interactive parabola and tangent"><path d="M40 220 H470 M250 25 V270" className="graph-axis"/><path d="M90 40 Q250 270 410 40" className="graph-curve"/><line x1={px - 95} y1={py - 95 * tangentPixelSlope} x2={px + 95} y2={py + 95 * tangentPixelSlope} className="graph-tangent"/><circle cx={px} cy={py} r="7" className="graph-point"/><text x="420" y="242">x</text><text x="260" y="36">f(x)</text></svg></div></section>
      <div className="math-skill-grid">{c.adultSteps.map(([title, body], i) => <article className="math-skill-card" key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
    </>}
    <section className="math-history"><div className="academy-section-title"><span className="academy-kicker"><Mi name="timeline" /> {c.mathHistory}</span></div><div className="math-history-track">{c.timeline.map(([date, note], i) => <article key={date} className="math-history-item"><span className="math-history-dot">{i + 1}</span><small>{date}</small><p>{note}</p><a href={HIST_LINKS[i]} target="_blank" rel="noreferrer">{c.sourceNames[i]} ↗</a></article>)}</div></section>
    <p className="academy-sources-label">{c.sources} · {c.archiveName}</p>
  </div>
}
