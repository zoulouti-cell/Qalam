import Mi from './Mi'
import type { Lang } from './i18n'

type Props = { lang: Lang; current: string; previous?: string; next?: string; lens: 'history' | 'morocco' | 'ideas' | 'culture' }

const COPY = {
  ar: {
    title: 'قراءة أكاديمية مترابطة', before: 'السياق السابق', selected: 'المحطة الحالية', after: 'ما يتلوها',
    history: 'لا تكفي المجاورة الزمنية لإثبات السببية. افحص نوع المصدر، والفاعلين، وشبكات الحركة والمؤسسات، وميّز بين انتشار الاعتقاد، وتوسع السلطة، وتغير الممارسة الاجتماعية.',
    morocco: 'اربط الحدث بتحولات المؤسسات والسكان والاقتصاد والمجال. التزامن لا يثبت السببية؛ وقارن بين النص الدستوري أو الإداري وبين الممارسة والنتائج الاجتماعية، مع مراعاة اختلاف الجهات.',
    ideas: 'ضع الفكرة في شبكات التعليم والنشر والرعاية والجدل التي أتاحت تداولها. قارن بين أطروحتها وسياقها، ثم اسأل كيف اختبرها مفكرون لاحقون أو اعترضوا عليها؛ فالتأثير لا يعني الإجماع.',
    culture: 'تتبّع انتقال الأشخاص والنصوص والسلع والأشكال الفنية بين الأمكنة، وافصل بين التشابه والاقتباس المثبت. تساعد المقارنة على رؤية التفاعل والتنوع المحلي معًا.',
    prompt: 'سؤال بحثي', promptText: 'ما الدليل الذي يربط هذه المحطة بما قبلها أو بعدها؟ وما التفسيرات البديلة التي ينبغي اختبارها؟',
  },
  fr: {
    title: 'Lecture académique reliée', before: 'Contexte antérieur', selected: 'Étape étudiée', after: 'Prolongement',
    history: 'La proximité chronologique ne prouve pas la causalité. Examinez les sources, les acteurs, les réseaux et les institutions; distinguez diffusion religieuse, extension du pouvoir et transformations sociales.',
    morocco: 'Reliez l’événement aux institutions, à la population, à l’économie et au territoire. La simultanéité ne prouve pas la causalité : comparez textes officiels, pratiques et effets sociaux selon les régions.',
    ideas: 'Situez les idées dans les réseaux d’enseignement, d’édition, de patronage et de débat qui les ont fait circuler. Comparez la thèse à son contexte et aux critiques ultérieures : influence ne signifie pas consensus.',
    culture: 'Suivez les personnes, textes, biens et formes artistiques entre les lieux; distinguez ressemblance et emprunt documenté. La comparaison révèle à la fois échanges et diversité locale.',
    prompt: 'Question de recherche', promptText: 'Quelle preuve relie cette étape à la précédente ou à la suivante ? Quelles explications concurrentes faut-il examiner ?',
  },
  en: {
    title: 'Connected academic reading', before: 'Prior context', selected: 'Focus', after: 'What follows',
    history: 'Chronological proximity alone does not establish causation. Examine sources, actors, networks, and institutions; distinguish religious diffusion, political expansion, and social change.',
    morocco: 'Connect the event to institutions, population, economy, and place. Simultaneity is not proof of causation: compare formal texts with practice and social outcomes across regions.',
    ideas: 'Place ideas within the educational, publishing, patronage, and debate networks that circulated them. Compare a thesis with its context and later criticism; influence does not mean consensus.',
    culture: 'Trace the movement of people, texts, goods, and artistic forms between places; distinguish resemblance from evidenced borrowing. Comparison reveals exchange and local diversity together.',
    prompt: 'Research question', promptText: 'What evidence connects this stage to what came before or after? Which alternative explanations should be tested?',
  },
}

export default function AcademicContext({ lang, current, previous, next, lens }: Props) {
  const c = COPY[lang]
  return <aside className="academic-context" aria-label={c.title}>
    <header><span className="academy-kicker"><Mi name="schema" /> {c.title}</span><p>{c[lens]}</p></header>
    <div className="academic-context-chain">
      {previous && <span><small>{c.before}</small><strong>{previous}</strong></span>}
      <span className="academic-context-current"><small>{c.selected}</small><strong>{current}</strong></span>
      {next && <span><small>{c.after}</small><strong>{next}</strong></span>}
    </div>
    <div className="academic-context-question"><Mi name="help_outline"/><span><b>{c.prompt}</b>{c.promptText}</span></div>
  </aside>
}
