import { useState } from 'react'
import type { Lang } from './i18n'
import type { Level } from './content'

type FrontierId = 'biology-ai' | 'quantum' | 'planetary-defense' | 'fusion'
type Frontier = {
  id: FrontierId
  icon: string
  title: Record<Lang, string>
  status: Record<Lang, string>
  child: Record<Lang, [string, string]>
  adult: Record<Lang, string>
  question: Record<Lang, string>
  metric: Record<Lang, string>
  source: Record<Lang, string>
  date: Record<Lang, string>
  url: string
}

const FRONTIERS: Frontier[] = [
  {
    id: 'biology-ai', icon: '🧬',
    title: { ar: 'الذكاء الاصطناعي والأحياء', fr: 'IA et biologie', en: 'AI and biology' },
    status: { ar: 'أداة بحث', fr: 'Outil de recherche', en: 'Research tool' },
    child: {
      ar: ['يساعد برنامج ذكي العلماء على تخمين أشكال بعض جزيئات الحياة وكيفية تفاعلها.', 'يمكن أن يرشد التوقع العلماء إلى تجارب جديدة، لكنه لا يثبت وحده أن دواءً ما سينجح.'],
      fr: ['Un programme d’IA aide les scientifiques à prévoir la forme et les interactions de certaines molécules du vivant.', 'Ces prédictions orientent des expériences, mais ne prouvent pas qu’un médicament fonctionne.'],
      en: ['An AI model helps scientists predict the shapes and interactions of some molecules in living things.', 'A prediction can guide experiments, but it cannot prove that a medicine will work.'],
    },
    adult: {
      ar: 'نُشر AlphaFold 3 في Nature عام 2024. يتنبأ ببنى معقّدات جزيئية تشمل البروتينات والأحماض النووية وجزيئات صغيرة. هذه نماذج حاسوبية لتوجيه البحث، وتظل النتائج بحاجة إلى تحقق تجريبي؛ ولا تمثل تشخيصًا طبيًا أو إثباتًا لفعالية دواء.',
      fr: 'Publié dans Nature en 2024, AlphaFold 3 prédit des structures de complexes comprenant protéines, acides nucléiques et petites molécules. Ces prédictions guident la recherche, mais nécessitent une validation expérimentale et ne constituent ni un diagnostic ni une preuve d’efficacité thérapeutique.',
      en: 'Published in Nature in 2024, AlphaFold 3 predicts structures of complexes involving proteins, nucleic acids, and small molecules. These computational predictions can guide research, but need experimental validation; they are not diagnoses or proof that a drug works.',
    },
    question: { ar: 'كيف نختبر إن كان شكل جزيء توقّعه الحاسوب قريبًا من الحقيقة؟', fr: 'Comment vérifier qu’une forme moléculaire prédite est proche de la réalité ?', en: 'How could scientists check whether a predicted molecule shape matches reality?' },
    metric: { ar: 'تنبؤ حاسوبي ← تجربة مخبرية', fr: 'Prédiction numérique ← expérience', en: 'Computer prediction → lab experiment' },
    source: { ar: 'دراسة بحثية · Nature', fr: 'Étude scientifique · Nature', en: 'Research paper · Nature' },
    date: { ar: '8 مايو 2024', fr: '8 mai 2024', en: '8 May 2024' },
    url: 'https://www.nature.com/articles/s41586-024-07487-w',
  },
  {
    id: 'quantum', icon: '⚛️',
    title: { ar: 'الحوسبة الكمّية', fr: 'Calcul quantique', en: 'Quantum computing' },
    status: { ar: 'تجربة بحثية', fr: 'Recherche expérimentale', en: 'Research experiment' },
    child: {
      ar: ['تجرب الحواسيب الكمّية طرقًا جديدة للحساب، لكن أجزاءها شديدة الحساسية للأخطاء.', 'اختبر باحثون طريقة تجعل مجموعة من البتّات الكمّية أقل عرضة لبعض الأخطاء عند تكبيرها.'],
      fr: ['Les ordinateurs quantiques explorent de nouvelles façons de calculer, mais leurs composants sont très sensibles aux erreurs.', 'Des chercheurs ont testé une méthode qui réduit certaines erreurs lorsque le système grandit.'],
      en: ['Quantum computers explore new ways to calculate, but their parts are very sensitive to errors.', 'Researchers tested a method that reduced some errors as a quantum system grew.'],
    },
    adult: {
      ar: 'في تجربة منشورة في Nature عام 2024، عرض فريق Google Quantum AI ذاكرة كمّية لشفرة سطحية تعمل دون العتبة، بحيث انخفض معدل الخطأ المنطقي عند زيادة مسافة الشفرة. هذا تقدم في تصحيح الأخطاء، وليس حاسوبًا كمّيًا عامًا جاهزًا للاستخدام اليومي.',
      fr: 'Dans une étude publiée dans Nature en 2024, Google Quantum AI a présenté une mémoire quantique à code de surface sous le seuil, où le taux d’erreur logique diminue lorsque la distance du code augmente. C’est un progrès de correction d’erreurs, pas un ordinateur quantique général prêt à l’usage courant.',
      en: 'A 2024 Nature paper from Google Quantum AI demonstrated a below-threshold surface-code memory, where logical error rates fell as code distance increased. This is a quantum error-correction milestone, not a general-purpose quantum computer ready for everyday use.',
    },
    question: { ar: 'لماذا يحتاج الحاسوب إلى تصحيح الأخطاء قبل إنجاز حسابات طويلة؟', fr: 'Pourquoi faut-il corriger les erreurs avant de longs calculs ?', en: 'Why must a computer correct errors before it can run long calculations?' },
    metric: { ar: 'البتّات الكمّية تحتاج إلى حماية من الضوضاء', fr: 'Les qubits doivent être protégés du bruit', en: 'Qubits need protection from noise' },
    source: { ar: 'دراسة بحثية · Nature', fr: 'Étude scientifique · Nature', en: 'Research paper · Nature' },
    date: { ar: '9 ديسمبر 2024', fr: '9 décembre 2024', en: '9 December 2024' },
    url: 'https://www.nature.com/articles/s41586-024-08449-y',
  },
  {
    id: 'planetary-defense', icon: '☄️',
    title: { ar: 'حماية الكواكب', fr: 'Défense planétaire', en: 'Planetary defense' },
    status: { ar: 'اختُبرت في الفضاء', fr: 'Testée dans l’espace', en: 'Tested in space' },
    child: {
      ar: ['أرسلت ناسا مركبة لتصطدم بقمر كويكب صغير اسمه ديمورفوس، فغيّرت مدة دورانه حول رفيقه.', 'كان هذا اختبارًا بعيدًا عن الأرض؛ لم يكن الكويكب متجهًا إلينا.'],
      fr: ['La NASA a fait percuter une petite lune d’astéroïde, Dimorphos, afin de modifier sa période orbitale.', 'C’était un essai loin de la Terre : l’astéroïde ne se dirigeait pas vers nous.'],
      en: ['NASA crashed a spacecraft into the small asteroid moon Dimorphos and changed how long it takes to orbit its partner.', 'The test happened far from Earth; the asteroid was not heading toward us.'],
    },
    adult: {
      ar: 'أثبت اختبار DART أن الاصطدام الحركي يمكنه تغيير حركة جرم سماوي. استقر زمن دورة ديمورفوس حول ديديموس عند 11 ساعة و22 دقيقة و3 ثوانٍ، أقصر بـ33 دقيقة و15 ثانية من السابق. لم يكن أي من الجرمين يشكل خطر اصطدام بالأرض.',
      fr: 'La mission DART a démontré qu’un impact cinétique peut modifier le mouvement d’un corps céleste. La période orbitale de Dimorphos autour de Didymos s’est établie à 11 h 22 min 3 s, soit 33 min 15 s de moins qu’avant. Aucun des deux objets ne menaçait la Terre.',
      en: 'DART demonstrated that a kinetic impact can change a celestial body’s motion. Dimorphos settled into an 11-hour, 22-minute, 3-second orbit around Didymos, 33 minutes and 15 seconds shorter than before. Neither object posed a threat to Earth.',
    },
    question: { ar: 'لماذا نحتاج إلى اكتشاف الكويكب مبكرًا قبل محاولة تغيير مساره؟', fr: 'Pourquoi faut-il repérer un astéroïde tôt avant d’essayer de modifier sa trajectoire ?', en: 'Why would an asteroid need to be found early before trying to change its path?' },
    metric: { ar: 'تغيير المدار: 33 دقيقة و15 ثانية', fr: 'Période orbitale réduite de 33 min 15 s', en: 'Orbit shortened by 33 min 15 sec' },
    source: { ar: 'مهمة DART · ناسا', fr: 'Mission DART · NASA', en: 'DART mission · NASA' },
    date: { ar: '19 مارس 2024', fr: '19 mars 2024', en: '19 March 2024' },
    url: 'https://www.nasa.gov/missions/dart/nasa-study-asteroids-orbit-shape-changed-after-dart-impact/',
  },
  {
    id: 'fusion', icon: '☀️',
    title: { ar: 'طاقة الاندماج', fr: 'Énergie de fusion', en: 'Fusion energy' },
    status: { ar: 'تجارب مخبرية', fr: 'Expériences en laboratoire', en: 'Laboratory experiments' },
    child: {
      ar: ['يحاول العلماء تعلّم صنع طاقة تشبه الطاقة التي تضيء الشمس، باستخدام وقود خفيف شديد السخونة.', 'حققت تجارب الليزر تقدمًا مهمًا، لكننا لا نحصل منها بعد على كهرباء للمنازل.'],
      fr: ['Les scientifiques cherchent à produire une énergie semblable à celle du Soleil, avec un combustible léger extrêmement chaud.', 'Les lasers ont franchi des étapes importantes, mais ces expériences ne fournissent pas encore d’électricité aux maisons.'],
      en: ['Scientists are learning how to make energy like the Sun’s using very hot, light fuel.', 'Laser experiments have made important progress, but they do not yet supply electricity to homes.'],
    },
    adult: {
      ar: 'تذكر خارطة وزارة الطاقة الأمريكية المنشورة في يونيو 2026 أن منشأة NIF حققت في 2025 مردودًا علميًا يقارب 4.13 عند الهدف (8.6 ميغاجول من طاقة الاندماج مقابل 2.08 ميغاجول وصلت إلى الهدف). هذا لا يعني صافي كهرباء للمحطة؛ فتحويل الطاقة وكفاءة الليزر وبقية أجزاء المنظومة ما زالت تحديات بحث وهندسة.',
      fr: 'La feuille de route du département américain de l’Énergie publiée en juin 2026 rapporte un gain scientifique d’environ 4,13 à la cible du NIF en 2025 (8,6 MJ de fusion pour 2,08 MJ reçus par la cible). Ce n’est pas un gain électrique net : conversion, efficacité laser et intégration restent des défis d’ingénierie.',
      en: 'The U.S. Department of Energy’s June 2026 roadmap reports a 2025 NIF target gain of about 4.13 (8.6 MJ of fusion output from 2.08 MJ delivered to the target). This is not net electricity: conversion, laser efficiency, and whole-plant engineering remain challenges.',
    },
    question: { ar: 'ما الفرق بين إنتاج طاقة في تجربة وبين تشغيل محطة كهرباء؟', fr: 'Quelle différence entre produire de l’énergie lors d’un essai et faire fonctionner une centrale ?', en: 'What is the difference between producing energy in an experiment and running a power station?' },
    metric: { ar: 'مردود علمي عند الهدف ≠ كهرباء صافية', fr: 'Gain à la cible ≠ électricité nette', en: 'Target gain ≠ net electricity' },
    source: { ar: 'خارطة علوم وتقنية الاندماج · وزارة الطاقة الأمريكية', fr: 'Feuille de route fusion · Département de l’Énergie des États-Unis', en: 'Fusion S&T roadmap · U.S. Department of Energy' },
    date: { ar: 'يونيو 2026', fr: 'juin 2026', en: 'June 2026' },
    url: 'https://www.energy.gov/documents/fusion-science-and-technology-roadmap',
  },
]

const UI: Record<Lang, { title: string; subtitle: string; ages: [string, string]; explore: string; sources: string; think: string; updated: string }> = {
  ar: { title: 'نافذة على المستقبل', subtitle: 'اكتشافات حقيقية اليوم… وأسئلة الغد', ages: ['4–7 سنوات', '8–15 سنة'], explore: 'اختر موضوعًا', sources: 'المصدر الأصلي', think: 'تحدّي الباحث الصغير', updated: 'مراجعة المصادر: 6 نوفمبر 2026' },
  fr: { title: 'Fenêtre sur le futur', subtitle: 'Des découvertes réelles aujourd’hui… et les questions de demain', ages: ['4–7 ans', '8–15 ans'], explore: 'Choisir un sujet', sources: 'Source originale', think: 'Défi du jeune chercheur', updated: 'Sources vérifiées le 6 novembre 2026' },
  en: { title: 'A window into the future', subtitle: 'Real discoveries today… and tomorrow’s questions', ages: ['Ages 4–7', 'Ages 8–15'], explore: 'Choose a topic', sources: 'Original source', think: 'Young researcher challenge', updated: 'Sources checked: 6 November 2026' },
}

function FrontierVisual({ kind }: { kind: FrontierId }) {
  if (kind === 'biology-ai') return <svg viewBox="0 0 260 130" aria-hidden="true" className="frontier-visual"><path d="M58 20 C200 30 60 100 202 110 M202 20 C60 30 200 100 58 110" fill="none" stroke="#5d70cb" strokeWidth="5" strokeLinecap="round"/><path d="M83 24 177 106 M177 24 83 106 M68 49h124 M69 81h122" stroke="#ed85ad" strokeWidth="3" strokeDasharray="5 5"/><circle cx="130" cy="65" r="17" fill="#ffc75f" className="frontier-orb"/><text x="130" y="70" textAnchor="middle" fontSize="12" fill="#553d63">AI</text></svg>
  if (kind === 'quantum') return <svg viewBox="0 0 260 130" aria-hidden="true" className="frontier-visual"><circle cx="130" cy="65" r="14" fill="#8f78dc"/><ellipse cx="130" cy="65" rx="83" ry="30" fill="none" stroke="#7696ec" strokeWidth="3"/><ellipse cx="130" cy="65" rx="83" ry="30" fill="none" stroke="#e683c5" strokeWidth="3" transform="rotate(55 130 65)"/><circle r="6" fill="#ffc75f"><animateMotion dur="5s" repeatCount="indefinite" path="M47 65a83 30 0 1 0 166 0a83 30 0 1 0-166 0"/></circle><circle r="5" fill="#53cbb6"><animateMotion dur="7s" repeatCount="indefinite" path="M130 35a83 30 55 1 0 0 60a83 30 55 1 0 0 0-60"/></circle></svg>
  if (kind === 'planetary-defense') return <svg viewBox="0 0 260 130" aria-hidden="true" className="frontier-visual"><ellipse cx="142" cy="68" rx="88" ry="34" fill="none" stroke="#90a4cb" strokeDasharray="5 5" strokeWidth="2"/><circle cx="154" cy="67" r="28" fill="#a8b0ca"/><circle cx="145" cy="57" r="4" fill="#878fae"/><circle cx="166" cy="75" r="6" fill="#858ca8"/><g><path d="m45 63 25-10-6 13 6 9-25-7-8 8 1-12-1-10z" fill="#ff9d62"/><path d="M73 66 113 68" stroke="#ff8c59" strokeWidth="3" strokeDasharray="4 5"/><animateMotion dur="4s" repeatCount="indefinite" path="M-2 0h12"/></g><circle cx="42" cy="108" r="8" fill="#72b6ed"/></svg>
  return <svg viewBox="0 0 260 130" aria-hidden="true" className="frontier-visual"><circle cx="130" cy="65" r="32" fill="#ffbf45" className="frontier-star"/><circle cx="130" cy="65" r="47" fill="none" stroke="#f19b44" strokeWidth="3" opacity=".6"/><path d="M18 22 99 55M18 108 99 75M242 22 161 55M242 108 161 75" stroke="#6fa8e2" strokeWidth="5" strokeLinecap="round"/><path d="M23 22 92 51M23 108 92 79M237 22 168 51M237 108 168 79" stroke="#b9e0ff" strokeWidth="1.5" strokeDasharray="4 5"/></svg>
}

export default function FrontierExplorer({ lang, level }: { lang: Lang; level: Level }) {
  const ui = UI[lang]
  const [selected, setSelected] = useState(3)
  const [age, setAge] = useState<0 | 1>(0)
  const item = FRONTIERS[selected]
  const child = level === 'kids'
  return <section className={`frontier-section ${child ? 'frontier-kids' : 'frontier-academic'}`}>
    <header className="frontier-head"><div><span>🚀 {ui.updated}</span><h2>{ui.title}</h2><p>{ui.subtitle}</p></div>{child && <div className="frontier-ages">{ui.ages.map((a, i) => <button key={a} className={age === i ? 'active' : ''} onClick={() => setAge(i as 0 | 1)}>{a}</button>)}</div>}</header>
    <div className="frontier-grid">
      <nav className="frontier-nav" aria-label={ui.explore}>{FRONTIERS.map((f, i) => <button key={f.id} className={selected === i ? 'active' : ''} onClick={() => setSelected(i)}><span>{f.icon}</span><strong>{f.title[lang]}</strong><small>{f.status[lang]}</small></button>)}</nav>
      <article className="frontier-card" key={item.id}><div className="frontier-card-visual"><span className="frontier-stage">{item.status[lang]}</span><FrontierVisual kind={item.id}/><strong>{item.metric[lang]}</strong></div><div className="frontier-copy"><span className="frontier-date">{item.date[lang]}</span><h3>{item.icon} {item.title[lang]}</h3><p>{child ? item.child[lang][age] : item.adult[lang]}</p>{child && <div className="frontier-question"><b>💡 {ui.think}</b><span>{item.question[lang]}</span></div>}<a href={item.url} target="_blank" rel="noreferrer">{ui.sources}: {item.source[lang]} ↗</a></div></article>
    </div>
  </section>
}
