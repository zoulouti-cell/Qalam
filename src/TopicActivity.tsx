import { useState } from 'react'
import type { Lang } from './i18n'

export type ActivityMode = 'fraction' | 'heart' | 'orbit' | 'water' | 'readiness' | 'evidence'

const t = (lang: Lang, ar: string, fr: string, en: string) => ({ ar, fr, en })[lang]
const number = (lang: Lang, value: number) => new Intl.NumberFormat(lang === 'ar' ? 'ar-MA-u-nu-latn' : lang, { maximumFractionDigits: 1 }).format(value)

export function activityModeFor(subject: string, title: string): ActivityMode {
  const key = `${subject} ${title}`.toLowerCase()
  if (/heart|قلب|cœur|coeur/.test(key)) return 'heart'
  if (/fraction|fractions|كسر|كسور|نسبة مئوية|percentage|pourcentage/.test(key)) return 'fraction'
  if (/water|ماء|مياه|مطر|دورة الماء|eau|pluie/.test(key)) return 'water'
  if (/future|ai|quant|energy|technology|تقنية|ذكاء|كمي|طاقة|مستقبل|robot|ordinateur/.test(key)) return 'readiness'
  if (/solar|planet|orbit|sun|كوكب|شمس|مدار|planète|orbite/.test(key) && !/black.hole|ثقب أسود|الثقوب السوداء/.test(key)) return 'orbit'
  return 'evidence'
}

export default function TopicActivity({ lang, mode, title, onObserve }: { lang: Lang; mode: ActivityMode; title: string; onObserve: (note: string) => void }) {
  const [amount, setAmount] = useState(2)
  const [parts, setParts] = useState(4)
  const [phase, setPhase] = useState(0)
  const [condition, setCondition] = useState(0)

  if (mode === 'fraction') {
    const filled = Math.min(amount, parts)
    const pct = Math.round(filled / parts * 100)
    return <div className="topic-activity" aria-label={t(lang, 'جرّب الكسر', 'Explorer une fraction', 'Explore a fraction')}>
      <p>{t(lang, 'غيّر عدد الأجزاء ثم لوّن بعضها. راقب كيف يتغير الجزء من الكل.', 'Changez le nombre de parts puis coloriez-en quelques-unes. Observez la part du tout.', 'Change the number of parts, then color some. Watch the share of the whole change.')}</p>
      <div className="activity-fraction-bar" aria-label={`${number(lang, filled)} / ${number(lang, parts)}`}>{Array.from({ length: parts }, (_, i) => <button key={i} type="button" className={i < filled ? 'filled' : ''} aria-label={`${t(lang, 'لوّن حتى الجزء', 'Colorier jusqu’à la part', 'Color through part')} ${number(lang, i + 1)}`} onClick={() => { setAmount(i + 1); onObserve(`${number(lang, i + 1)} / ${number(lang, parts)}`) }} />)}</div>
      <div className="activity-controls"><label>{t(lang, 'عدد الأجزاء المتساوية', 'Nombre de parts égales', 'Equal parts')} <select value={parts} onChange={event => { const next = Number(event.target.value); setParts(next); setAmount(Math.min(amount, next)); onObserve(`${number(lang, Math.min(amount, next))} / ${number(lang, next)}`) }}>{[2, 3, 4, 6, 8].map(n => <option value={n} key={n}>{number(lang, n)}</option>)}</select></label><output>{number(lang, filled)} / {number(lang, parts)} = {number(lang, pct)}%</output></div>
    </div>
  }

  if (mode === 'heart') {
    const beats = 50 + amount * 10
    return <div className="topic-activity" aria-label={t(lang, 'مسار الدم', 'Circulation du sang', 'Blood flow')}>
      <p>{t(lang, 'غيّر وتيرة الضخ، ثم تتبّع مسار الدم بين الرئتين والقلب وخلايا الجسم.', 'Changez la fréquence des battements puis suivez le trajet du sang entre poumons, cœur et cellules.', 'Change the beat rate, then follow blood between lungs, heart, and body cells.')}</p>
      <svg className="activity-diagram" viewBox="0 0 420 180" role="img" aria-label={t(lang, 'الرئتان ثم القلب ثم الجسم ثم العودة', 'Poumons, cœur, corps et retour', 'Lungs, heart, body, and return')}>
        <path d="M80 90 H190 H330 M330 105 Q210 160 80 105" fill="none" stroke="#9db5c4" strokeWidth="9" strokeLinecap="round"/>
        <path className="activity-flow" style={{ animationDuration: `${Math.max(.7, 3 - amount * .25)}s` }} d="M80 90 H190 H330 M330 105 Q210 160 80 105" fill="none" stroke="#d45565" strokeWidth="5" strokeDasharray="12 19" strokeLinecap="round"/>
        <circle cx="80" cy="90" r="30" fill="#d8f2f7"/><circle cx="210" cy="90" r="30" fill="#fce0df"/><circle cx="330" cy="90" r="30" fill="#e9f4dc"/>
        <text x="80" y="96" textAnchor="middle">{t(lang, 'رئتان', 'Poumons', 'Lungs')}</text><text x="210" y="96" textAnchor="middle">{t(lang, 'قلب', 'Cœur', 'Heart')}</text><text x="330" y="96" textAnchor="middle">{t(lang, 'جسم', 'Corps', 'Body')}</text>
      </svg>
      <div className="activity-controls"><label>{t(lang, 'وتيرة المحاكاة', 'Rythme simulé', 'Simulated beat rate')} <input type="range" min="0" max="8" value={amount} onChange={event => { const next = Number(event.target.value); setAmount(next); onObserve(`${number(lang, 50 + next * 10)} ${t(lang, 'نبضة في الدقيقة', 'battements par minute', 'beats per minute')}`) }} /></label><output>{number(lang, beats)} {t(lang, 'نبضة/دقيقة', 'battements/min', 'beats/min')}</output></div>
      <small>{t(lang, 'رسم وظيفي مبسط؛ سرعة الحركة لا تمثل جريان الدم الفعلي.', 'Schéma fonctionnel simplifié ; la vitesse de l’animation ne représente pas le débit réel.', 'Simplified diagram; animation speed does not represent real blood flow.')}</small>
    </div>
  }

  if (mode === 'orbit') {
    const radius = 40 + amount * 17
    const period = Math.sqrt(Math.pow(radius / 57, 3)).toFixed(1)
    return <div className="topic-activity" aria-label={t(lang, 'غيّر المدار', 'Modifier l’orbite', 'Change the orbit')}>
      <p>{t(lang, 'أبعد الكوكب عن النجم وقارن زمن الدورة في نموذج مبسط يدور حول النجم نفسه.', 'Éloignez la planète de la même étoile et comparez la durée de l’orbite dans un modèle simplifié.', 'Move the planet farther from the same star and compare orbital periods in a simplified model.')}</p>
      <svg className="activity-diagram activity-orbit" viewBox="0 0 420 210" role="img" aria-label={t(lang, 'مدار كوكب حول نجم', 'Orbite d’une planète autour d’une étoile', 'Planet orbiting a star')}>
        <circle cx="210" cy="105" r={radius} fill="none" stroke="#91bfc7" strokeWidth="2" strokeDasharray="5 5"/>
        <circle cx="210" cy="105" r="19" fill="#f8bb50"/>
        <circle cx={210 + radius} cy="105" r="9" fill="#4088be"><animateMotion key={radius} dur={`${Math.max(3, 3 + Number(period) * 2)}s`} repeatCount="indefinite" path={`M 0 0 A ${radius} ${radius} 0 1 1 ${-2 * radius} 0 A ${radius} ${radius} 0 1 1 0 0`}/></circle>
      </svg>
      <div className="activity-controls"><label>{t(lang, 'بعد المدار في النموذج', 'Distance orbitale du modèle', 'Model orbit distance')} <input type="range" min="0" max="4" value={amount} onChange={event => { const next = Number(event.target.value); setAmount(next); onObserve(t(lang, 'عند زيادة البعد يطول زمن الدورة', 'Une orbite plus éloignée prend plus de temps', 'A farther orbit takes longer')) }} /></label><output>≈ {number(lang, Number(period))} ×</output></div>
      <small>{t(lang, 'النسبة تقريبية وفق قانون كبلر الثالث لمدارات حول الكتلة نفسها؛ الأحجام والمسافات غير مرسومة بمقياس حقيقي.', 'Rapport approximatif selon la troisième loi de Kepler pour une même masse centrale ; tailles et distances non à l’échelle.', 'Approximate ratio from Kepler’s third law for the same central mass; sizes and distances are not to scale.')}</small>
    </div>
  }

  if (mode === 'water') {
    const stages = [t(lang, 'تبخر', 'Évaporation', 'Evaporation'), t(lang, 'تكاثف', 'Condensation', 'Condensation'), t(lang, 'هطول', 'Précipitation', 'Precipitation'), t(lang, 'جريان', 'Écoulement', 'Runoff')]
    return <div className="topic-activity" aria-label={t(lang, 'دورة الماء', 'Cycle de l’eau', 'Water cycle')}>
      <p>{t(lang, 'اضغط على مرحلة، ثم راقب انتقال الماء بين السطح والهواء واليابسة.', 'Choisissez une étape et suivez l’eau entre surface, air et terre.', 'Choose a stage and follow water between surface, air, and land.')}</p>
      <svg className="activity-diagram" viewBox="0 0 420 190" role="img" aria-label={stages[phase]}>
        <circle cx="65" cy="45" r="24" fill="#ffd06c"/><path d="M0 145 Q80 130 165 146 T420 145 V190 H0Z" fill="#7ec6ee"/><path d="M240 145 Q330 95 420 145" fill="#7ac895"/>
        <g fill="#e9f1f7"><circle cx="190" cy="55" r="25"/><circle cx="220" cy="43" r="32"/><circle cx="250" cy="60" r="25"/></g>
        <path d="M130 132 Q130 65 170 64" fill="none" stroke={phase===0?'#dc724a':'#aabfc1'} strokeWidth="6" strokeLinecap="round" markerEnd="none"/>
        <path d="M265 73 L318 125" fill="none" stroke={phase===2?'#3f95c9':'#aabfc1'} strokeWidth="6" strokeDasharray="8 7"/>
        <path d="M370 145 Q325 172 235 151" fill="none" stroke={phase===3?'#2b819f':'#aabfc1'} strokeWidth="6"/>
        <text x="210" y="177" textAnchor="middle">{stages[phase]}</text>
      </svg>
      <div className="activity-options">{stages.map((name, i) => <button type="button" key={name} className={phase===i?'selected':''} aria-pressed={phase===i} onClick={() => { setPhase(i); onObserve(name) }}>{name}</button>)}</div>
      <small>{t(lang, 'رسم تخطيطي للدورة؛ لا يحدد سرعة انتقال الماء أو كميته.', 'Schéma du cycle ; il ne mesure ni vitesse ni quantité d’eau.', 'Cycle diagram; it does not measure transfer speed or amount.')}</small>
    </div>
  }

  if (mode === 'readiness') {
    const states = [t(lang, 'فكرة', 'Idée', 'Idea'), t(lang, 'نموذج أولي', 'Prototype', 'Prototype'), t(lang, 'اختبار واقعي', 'Essai réel', 'Real-world trial')]
    return <div className="topic-activity" aria-label={t(lang, 'افحص جاهزية الفكرة', 'Examiner la maturité', 'Examine readiness')}>
      <p>{t(lang, 'انقل الفكرة بين مراحل التطوير. ما الدليل الذي تحتاجه في كل مرحلة قبل إعلان نجاحها؟', 'Faites avancer l’idée entre les étapes. Quelle preuve faut-il à chaque stade ?', 'Move the idea through development stages. What evidence is needed at each one?')}</p>
      <div className="activity-readiness">{states.map((name,i)=><button type="button" key={name} className={condition===i?'selected':''} aria-pressed={condition===i} onClick={()=>{setCondition(i);onObserve(name)}}><span className="activity-stage-dot"/><strong>{name}</strong></button>)}</div>
      <p className="activity-observation">{[t(lang, 'اشرح الآلية المتوقعة، وحدد ما يمكن قياسه.', 'Décrivez le mécanisme attendu et ce qui peut être mesuré.', 'Describe the expected mechanism and what could be measured.'),t(lang, 'قِس أداء النموذج وكرر التجربة؛ لا تعمم النتيجة بعد.', 'Mesurez le prototype et répétez l’essai sans généraliser encore.', 'Measure the prototype and repeat the trial; do not generalize yet.'),t(lang, 'اختبر السلامة والأداء والكلفة في ظروف مختلفة ومع مستخدمين حقيقيين.', 'Testez sécurité, performance et coût dans plusieurs conditions réelles.', 'Test safety, performance, and cost in varied real conditions.')][condition]}</p>
    </div>
  }

  const lenses = [t(lang, 'ما الذي نراه؟', 'Que voit-on ?', 'What do we observe?'),t(lang, 'كيف نفسره؟', 'Comment l’expliquer ?', 'How do we explain it?'),t(lang, 'ما الذي ينقص؟', 'Que manque-t-il ?', 'What is missing?')]
  return <div className="topic-activity" aria-label={t(lang, 'افحص الفكرة', 'Examiner l’idée', 'Examine the idea')}>
    <p>{t(lang, 'اختر زاوية للنظر في الموضوع. استخدمها لتفصل بين الملاحظة والتفسير والسؤال المفتوح.', 'Choisissez un angle pour distinguer observation, interprétation et question ouverte.', 'Choose a lens to separate observation, interpretation, and an open question.')}</p>
    <div className="activity-readiness">{lenses.map((name,i)=><button type="button" key={name} className={condition===i?'selected':''} aria-pressed={condition===i} onClick={()=>{setCondition(i);onObserve(name)}}><span className="activity-stage-dot"/><strong>{name}</strong></button>)}</div>
    <p className="activity-observation">{[t(lang, `استخرج من «${title}» معلومة يمكن التحقق منها بمصدر أو قياس.`, `Trouvez dans « ${title} » un fait vérifiable par une source ou une mesure.`, `Find in “${title}” a claim you could check with a source or measurement.`),t(lang, 'اقترح تفسيرًا، ثم اذكر الدليل الذي يدعمه.', 'Proposez une explication et indiquez la preuve qui la soutient.', 'Propose an explanation and name evidence supporting it.'),t(lang, 'اكتب سؤالًا لم يُجب عنه النص، وحدد مصدرًا قد يساعدك.', 'Formulez une question encore ouverte et une source possible.', 'Write an unanswered question and name a source that may help.')][condition]}</p>
  </div>
}
