import { useEffect, type ReactNode } from 'react'
import type { Lang } from './i18n'
import { LEARNING_THEMES, themeById, journeyHref, labHref, futureHref, type LearningTheme } from './learningRoute'
import RouteAssessment from './RouteAssessment'
import Mi from './Mi'
import { scrollToDetail } from './scrollToDetail'
import './learningRoute.css'

const text = (lang: Lang, ar: string, fr: string, en: string) => ({ ar, fr, en })[lang]

function Stage({number, title, description, href, action, children}:{number:number;title:string;description:string;href?:string;action?:string;children?:ReactNode}) {
  return <li id={`learning-route-stage-${number}`} className="learning-route-stage"><span className="learning-route-number" aria-hidden="true">{number}</span><div><h3>{title}</h3><p>{description}</p>{children}{href && <a href={href} className="learning-route-link">{action}<Mi name="arrow_forward"/></a>}</div></li>
}

function ThemeRoute({theme,lang,level,done}:{theme:LearningTheme;lang:Lang;level:'kids'|'school';done:string[]}) {
  const kids=level==='kids'
  const future=futureHref(theme)
  return <div className={'page-wide learning-route-page '+(kids?'learning-route-kids':'learning-route-academic')}>
    <a className="learning-route-back" href="#/path"><Mi name="arrow_back"/>{text(lang,'كل مسارات التعلم','Tous les parcours','All learning routes')}</a>
    <header className="learning-route-hero"><small>{text(lang,kids?'المستكشف الصغير':'الرحالة الكبير',kids?'Jeune explorateur':'Grand voyageur',kids?'Young explorer':'Advanced explorer')}</small><h1>{theme.title[lang]}</h1><p>{theme.question[lang]}</p><nav className="learning-route-progress" aria-label={text(lang,'تسلسل التعلم','Progression pédagogique','Learning sequence')}>{[text(lang,'اكتشف','Découvrir','Discover'),text(lang,'تتبّع','Retracer','Trace'),text(lang,'جرّب','Explorer','Explore'),text(lang,'استشرف','Anticiper','Anticipate'),text(lang,'تحقّق','Vérifier','Check')].map((label,index)=><button type="button" key={index} onClick={()=>scrollToDetail(()=>document.getElementById(`learning-route-stage-${index+1}`))}>{label}</button>)}</nav></header>
    <ol className="learning-route-stages">
      <Stage number={1} title={text(lang,'نافذة قلم · ابدأ بالمعلومة','Fenêtre Qalam · partir d’un fait','Qalam Window · start with a fact')} description={theme.hook[lang]} href={theme.windowArticle?`#/article/${theme.windowArticle}`:undefined} action={text(lang,'اقرأ الموضوع الممهّد','Lire le sujet introductif','Read the introductory topic')}>
        {!theme.windowArticle&&<p className="learning-route-method">{text(lang,'هذا مدخل موجز للموضوع؛ انتقل إلى الرحلة لتفحص الشواهد والمصادر بدل الاكتفاء بهذه العبارة.','Ce point de départ conduit aux traces et sources examinées dans le parcours.','This opening leads to the evidence and sources examined in the journey.')}</p>}
        {theme.windowArticle&&done.includes(theme.windowArticle)&&<span className="learning-route-done"><Mi name="check_circle"/>{text(lang,'قرأت المدخل','Introduction lue','Introduction read')}</span>}
        <a className="learning-route-source" href={theme.source.url} target="_blank" rel="noreferrer">{text(lang,'مرجع للتحقق','Source à consulter','Source to examine')}: {theme.source.label[lang]} ↗</a>
      </Stage>
      <Stage number={2} title={text(lang,'رحلة قلم · كيف نشأت الفكرة وتغيرت؟','Parcours Qalam · d’où vient l’idée ?','Qalam Journey · how did the idea develop?')} description={theme.journey==='medicine'?text(lang,'تتبّع تطور فهم الجسم والطب عبر الشواهد والاكتشافات والممارسات.','Suivez l’évolution des savoirs et pratiques médicales à partir des traces.','Trace changing medical knowledge and practice through evidence.'):theme.journey==='mathematics'?text(lang,'تتبّع ظهور الفكرة وطرق برهانها عبر مجتمعات وأزمنة مختلفة.','Suivez l’idée et ses démonstrations à travers les époques et les sociétés.','Trace the idea and its proofs across times and societies.'):theme.journey==='chemistry'?text(lang,'تتبّع كيف تغيّرت أفكار العلماء عن المادة والذرة بتغيّر أدوات القياس.','Suivez l’évolution des idées sur la matière et l’atome avec les instruments de mesure.','Trace how ideas about matter and atoms changed as measurement tools improved.'):theme.journeyRoute?text(lang,'تتبّع المحطات التاريخية، وقارن الشواهد ونتائج التغير على الناس.','Suivez les étapes historiques et comparez les traces et leurs effets.','Trace historical stages and compare evidence and effects on people.'):text(lang,'تتبّع الشواهد عبر الزمن، ثم قارن الأمكنة التي ظهرت فيها أو تغيّرت.','Suivez les traces dans le temps et comparez les lieux.','Follow evidence through time and compare places.')} href={journeyHref(theme,level)} action={text(lang,'افتح المسار الزمني','Ouvrir la chronologie','Open the timeline')}>
        {theme.journey!=='morocco'&&!theme.journeyRoute&&<a className="learning-route-secondary" href={journeyHref(theme,level).replace('/time','/place')}>{text(lang,'قارن عبر المكان','Comparer les lieux','Compare places')}</a>}
      </Stage>
      <Stage number={3} title={text(lang,'المختبر · كيف تعمل؟','Laboratoire · comment cela fonctionne ?','Lab · how does it work?')} description={kids?text(lang,'حرّك عنصرًا أو افحص شاهدًا، ثم صف ما تغير وما بقي ثابتًا.','Manipulez un élément ou examinez une trace, puis décrivez ce qui change.','Change one element or inspect evidence; describe what changes.'):text(lang,'افحص النموذج أو المصدر، وافصل بين الملاحظة والتفسير وحدود الاستنتاج.','Examinez modèle ou source ; distinguez observation, interprétation et limites.','Examine a model or source; distinguish observation, interpretation, and limits.')} href={labHref(theme)} action={text(lang,'افتح المختبر المرتبط','Ouvrir le laboratoire associé','Open the related lab')}/>
      <Stage number={4} title={text(lang,'عالم الغد · ما الذي قد يتغير؟','Monde de demain · que pourrait-il changer ?','Tomorrow’s World · what might change?')} description={theme.futureQuestion[lang]} href={future} action={text(lang,'افحص الأدلة والعقبات','Examiner preuves et obstacles','Examine evidence and barriers')}/>
      <Stage number={5} title={text(lang,'تعلّم وتحقق · انقل الفكرة إلى موقف جديد','Apprendre et vérifier · transférer l’idée','Learn and check · apply the idea elsewhere')} description={kids?text(lang,'اختر إجابة، اكتشف لماذا، ثم جرّب الفكرة في مثال آخر.','Choisissez, découvrez pourquoi, puis réutilisez l’idée.','Choose an answer, see why, then try the idea in another example.'):text(lang,'اختبر تفسيرك، ثم قدّم شاهدًا وحدًّا للاستنتاج في مثال جديد.','Vérifiez votre explication, puis proposez une preuve et une limite dans un autre cas.','Check your explanation, then give evidence and a limitation for a new case.')}>
        <a className="learning-route-secondary" href={kids?'#/play':'#/learning'}>{kids?text(lang,'أنشطة أخرى لتعلّم والعب','Autres activités pour apprendre et jouer','More activities to learn and play'):text(lang,'أدوات التعلم والمراجع','Outils et ressources','Learning tools and references')}</a>
        <RouteAssessment key={`${theme.id}-${level}-${lang}`} themeId={theme.id} lang={lang} academic={!kids}/>
      </Stage>
    </ol>
  </div>
}

export default function PathPage({lang,done,level,themeId,focusCheck=false}:{lang:Lang;done:string[];level:'kids'|'school';themeId?:string;focusCheck?:boolean}) {
  const theme=themeById(themeId)
  useEffect(()=>{if(theme&&focusCheck)scrollToDetail(()=>document.getElementById('learning-route-stage-5'))},[theme?.id,focusCheck])
  if(theme) return <ThemeRoute theme={theme} lang={lang} done={done} level={level}/>
  return <div className="page-wide learning-route-page"><header className="learning-route-hero"><small>{text(lang,'من المعلومة إلى الفهم','Du fait à la compréhension','From fact to understanding')}</small><h1>{text(lang,'مسارات التعلم المترابطة','Parcours d’apprentissage reliés','Connected learning routes')}</h1><p>{text(lang,'اختر موضوعًا واحدًا، ثم انتقل فيه من نافذة قلم إلى تاريخه وتجربته وآفاقه واختبار فهمه.','Choisissez un sujet et suivez ses faits, son histoire, son exploration, ses perspectives et sa vérification.','Choose one subject and follow its facts, history, exploration, future questions, and check for understanding.')}</p></header><div className="learning-route-grid">{LEARNING_THEMES.map(item=><a key={item.id} className="learning-route-card" href={`#/path/${item.id}`}><small>{item.title[lang]}</small><strong>{item.question[lang]}</strong><span>{text(lang,'ابدأ هذا المسار','Commencer ce parcours','Start this route')} <Mi name="arrow_forward"/></span></a>)}</div></div>
}
