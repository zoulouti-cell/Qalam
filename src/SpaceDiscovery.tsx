import { useEffect, useState } from 'react'
import type { Lang } from './i18n'
import CosmosKids from './CosmosKids'
import Scene3D from './Scenes3D'
import ScientificMotion from './ScientificMotion'
import RealisticScene from './RealisticScene'
import KidsLearningStudio from './KidsLearningStudio'
import BlackHoleKids from './BlackHoleKids'

type SpaceTopic = 'planets' | 'blackholes' | 'missions'
type Localized = Record<Lang, string>
const TOPICS: { id: SpaceTopic; title: Localized; child: Localized; adult: Localized }[] = [
  {
    id: 'planets',
    title: { ar: 'المجموعة الشمسية', fr: 'Système solaire', en: 'Solar System' },
    child: { ar: 'شاهد الكواكب وهي تدور حول الشمس، وغيّر سرعة العرض. المدارات والأحجام تقريبية وليست مرسومة بمقياس حقيقي.', fr: 'Observe les planètes tourner autour du Soleil et règle leur vitesse. Les orbites et les tailles sont schématiques.', en: 'Watch the planets orbit the Sun and adjust their speed. The paths and sizes are schematic.' },
    adult: { ar: 'افحص ترتيب الكواكب ومداراتها في نموذج تفاعلي. يستخدم النموذج مقاييس منفصلة للحجم والمسافة، فلا تُقرأ المسافات النسبية من الرسم.', fr: 'Explorez les planètes et leurs orbites dans un modèle interactif. Tailles et distances utilisent des échelles distinctes.', en: 'Explore planets and orbits in an interactive model. Size and distance use separate scales; do not infer relative distances from the drawing.' },
  },
  {
    id: 'blackholes',
    title: { ar: 'الثقوب السوداء', fr: 'Trous noirs', en: 'Black holes' },
    child: { ar: 'للثقب الأسود حد يسمى أفق الحدث. إذا عبره الضوء إلى الداخل، لا يستطيع العودة. قد يضيء الغاز الساخن المحيط، لا داخل الثقب.', fr: 'Un trou noir possède un horizon des événements. La lumière qui le franchit vers l’intérieur ne peut revenir. Le gaz chaud autour peut briller.', en: 'A black hole has an event horizon. Light crossing inward cannot return. Hot gas around it may glow; the glow does not come from inside.' },
    adult: { ar: 'أفق الحدث حد سببي في الزمكان، لا سطح مادي. قد يصدر الإشعاع المرصود عن مادة خارج الأفق، ويتأثر بانحناء الضوء وحركة الغاز. هذا العرض البصري توضيحي ولا يقيس حجم ثقب بعينه.', fr: 'L’horizon est une frontière causale de l’espace-temps, pas une surface matérielle. Le rayonnement observé peut venir de matière extérieure et dépend de la courbure et du mouvement du gaz.', en: 'The event horizon is a causal boundary in spacetime, not a material surface. Observed radiation may come from matter outside it and is affected by light bending and gas motion. This visualization is illustrative, not a measurement of a specific black hole.' },
  },
  {
    id: 'missions',
    title: { ar: 'المركبات والاستكشاف', fr: 'Missions spatiales', en: 'Space missions' },
    child: { ar: 'تساعد الأقمار والمسابير العلماء على مراقبة الأرض وزيارة عوالم بعيدة وإرسال المعلومات.', fr: 'Satellites et sondes observent la Terre, visitent des mondes lointains et transmettent des données.', en: 'Satellites and probes observe Earth, visit distant worlds, and send information back.' },
    adult: { ar: 'تجمع المهمة الفضائية بين المدار والطاقة والاتصال والحمولة العلمية. تُمثّل الوسائط التعليمية أنواعًا من المركبات ولا تدعي محاكاة مهمة جارية.', fr: 'Une mission combine orbite, énergie, communication et instruments scientifiques. Les modèles sont pédagogiques, pas le suivi d’une mission en direct.', en: 'A mission combines orbit, power, communication, and scientific instruments. These are educational representations, not live mission tracking.' },
  },
]

export default function SpaceDiscovery({ lang, academic, initialTopic }: { lang: Lang; academic: boolean; initialTopic?: string }) {
  const [topic, setTopic] = useState<SpaceTopic>(initialTopic === 'blackholes' ? 'blackholes' : 'planets')
  useEffect(() => setTopic(initialTopic === 'blackholes' ? 'blackholes' : 'planets'), [initialTopic])
  const selected = TOPICS.find((item) => item.id === topic) ?? TOPICS[0]
  const title = lang === 'ar' ? 'مختبر استكشاف الفضاء' : lang === 'fr' ? 'Laboratoire d’exploration spatiale' : 'Space Exploration Lab'
  const modelNote = lang === 'ar' ? 'نموذج أو محاكاة تعليمية، وليست رصدًا مباشرًا. اقرأ وصف كل تجربة لمعرفة ما تمثله وحدودها.' : lang === 'fr' ? 'Modèle pédagogique, pas une observation en direct. La légende précise ce qu’il représente et ses limites.' : 'An educational model or simulation, not a live observation. Each caption explains what it represents and its limits.'
  return <section className="earth-discovery space-discovery" data-audience={academic ? 'academic' : 'kids'}>
    <header><h3>{title}</h3><p>{academic ? selected.adult[lang] : selected.child[lang]}</p></header>
    <div className="math-lab-tabs" role="tablist" aria-label={title}>
      {TOPICS.map((item) => <button key={item.id} type="button" role="tab" aria-selected={topic === item.id} className={topic === item.id ? 'active' : ''} onClick={() => setTopic(item.id)}>{item.title[lang]}</button>)}
    </div>
    {topic === 'planets' && (academic ? <div className="space-discovery-scene"><h4>{lang === 'ar' ? 'النموذج التفاعلي للمجموعة الشمسية' : lang === 'fr' ? 'Modèle interactif du système solaire' : 'Interactive Solar System model'}</h4><Scene3D kind="sun" lang={lang}/></div> : <KidsLearningStudio lang={lang} spaceLab/>)}
    {topic === 'blackholes' && (academic ? <ScientificMotion kind="blackhole" lang={lang} academic/> : <BlackHoleKids lang={lang}/>)}
    {topic === 'missions' && (academic ? <RealisticScene kind="satellite" lang={lang}/> : <CosmosKids lang={lang}/>)}
    <p className="space-discovery-note">{modelNote}</p>
  </section>
}
