import { useEffect, useState } from 'react'
import type { Lang } from './i18n'
import TopicActivity, { activityModeFor } from './TopicActivity'

type Copy = Record<Lang, string>
const c = (ar: string, fr: string, en: string): Copy => ({ ar, fr, en })

function challengeFor(subject: string, title: string, lang: Lang) {
  const key = `${subject} ${title}`.toLowerCase()
  if (/heart|قلب|cœur|coeur/.test(key)) return {
    prompt: c('ارسم مسارًا من الرئتين إلى القلب ثم إلى خلايا الجسم. ماذا يحمل الدم في كل خطوة؟', 'Tracez le trajet des poumons au cœur puis aux cellules. Que transporte le sang à chaque étape ?', 'Trace a path from the lungs to the heart and then to body cells. What does blood carry at each step?')[lang],
    answer: c('تضيف الرئتان الأكسجين إلى الدم، ثم يضخ القلب الدم عبر الأوعية إلى الأنسجة. يعود الدم إلى القلب والرئتين ليطرح ثاني أكسيد الكربون. هذه دورة مترابطة، لا عمل القلب وحده.', 'Les poumons apportent de l’oxygène au sang, puis le cœur l’envoie vers les tissus. Le sang revient ensuite aux poumons pour éliminer le dioxyde de carbone : c’est un circuit coordonné.', 'The lungs add oxygen to blood, then the heart pumps it through vessels to tissues. Blood returns to the lungs to release carbon dioxide. It is a connected circuit, not the heart acting alone.')[lang],
  }
  if (/water|ماء|مياه|مطر|دورة الماء|eau|pluie/.test(key)) return {
    prompt: c('اختر مرحلة من دورة الماء واشرح ما الذي ينقل الماء إلى المرحلة التالية.', 'Choisissez une étape du cycle de l’eau et expliquez le passage à la suivante.', 'Choose a water-cycle stage and explain what moves water to the next one.')[lang],
    answer: c('تساعد حرارة الشمس على التبخر؛ يبرد بخار الماء فيتكاثف، وقد تهطل القطرات مطرًا. يعود جزء من الماء بالجريان والتسرب. الرسم يبيّن الروابط ولا يقيس الكميات.', 'La chaleur favorise l’évaporation ; la vapeur refroidie se condense, puis l’eau peut tomber en pluie et revenir par écoulement ou infiltration. Le schéma ne quantifie pas les flux.', 'Heat drives evaporation; cooled vapor condenses, rain may fall, and water returns through runoff or infiltration. The diagram does not measure quantities.')[lang],
  }
  if (/body|brain|lung|organ|جسم|دماغ|رئة|عضو|عظم|كبد/.test(key)) return {
    prompt: c('اختر عضوًا يتعاون مع هذا العضو، واكتب سهمين يوضحان ما الذي يرسله كل واحد أو يستقبله.', 'Choisissez un organe qui coopère avec celui-ci et tracez deux flèches montrant ce que chacun envoie ou reçoit.', 'Choose an organ that works with this one. Draw two arrows showing what each sends or receives.' )[lang],
    answer: c('الإجابة الجيدة تسمّي العضوين، وتشرح الوظيفة المشتركة، وتوضح اتجاه انتقال شيء بينهما مثل الدم أو الأكسجين أو الإشارات العصبية. لا يكفي أن نذكر أنهما «يعملان معًا».', 'Une bonne réponse nomme les deux organes, précise leur fonction commune et indique ce qui circule entre eux : sang, oxygène ou signaux nerveux.', 'A strong answer names both organs, explains their shared function, and shows what passes between them, such as blood, oxygen, or nerve signals. Saying only that they “work together” is not enough.')[lang],
  }
  if (/future|ai|quant|energy|technology|تقنية|ذكاء|كمي|طاقة|مستقبل/.test(key)) return {
    prompt: c('ما الدليل الذي تحتاج إليه قبل أن تقول إن هذه الفكرة تعمل خارج المختبر؟ اذكر اختبارًا واحدًا وعقبة محتملة.', 'Quelle preuve faudrait-il avant d’affirmer que cette idée fonctionne hors du laboratoire ? Citez un test et un obstacle possible.', 'What evidence would you need before claiming this works outside a lab? Name one test and one possible barrier.')[lang],
    answer: c('نبحث عن نتائج قابلة للتكرار في ظروف واقعية، ثم نفحص السلامة والكلفة والطاقة وإمكان التوسع. نجاح نموذج أولي يثبت أن تجربة حدثت، ولا يثبت وحده أن التقنية جاهزة أو نافعة للجميع.', 'Il faut des résultats reproductibles en conditions réelles, puis examiner sécurité, coût, énergie et passage à l’échelle. Un prototype prouve un essai, pas une disponibilité générale.', 'Look for repeatable results in real conditions, then examine safety, cost, energy, and scale. A prototype proves a trial occurred; it does not prove broad readiness or benefit.')[lang],
  }
  if (activityModeFor(subject,title)==='fraction') return {
    prompt: c('ابتكر مثالًا عدديًا صغيرًا يشرح الفكرة، ثم تحقق من أن النتيجة توافق الخطوات.', 'Inventez un petit exemple numérique, puis vérifiez que le résultat suit les étapes.', 'Create a small numerical example, then check that the result follows from the steps.')[lang],
    answer: c('اكتب المعطيات أولًا، ثم وضح العملية في كل خطوة، وأخيرًا أعد التعويض أو الحساب للتحقق. إذا لم تتفق النتيجة مع التحقق، راجع الخطوة التي تغير فيها المقدار.', 'Écrivez les données, justifiez chaque opération, puis vérifiez le résultat. En cas d’écart, reprenez l’étape où la quantité a changé.', 'List the givens, explain each operation, then check the result. If it does not match, revisit the step where the quantity changed.')[lang],
  }
  if (activityModeFor(subject,title)==='orbit') return {
    prompt: c('غيّر بعد المدار. ماذا يحدث لزمن دورة الكوكب حول النجم نفسه؟', 'Changez la distance orbitale. Que devient la période autour de la même étoile ?', 'Change orbital distance. What happens to the period around the same star?')[lang],
    answer: c('يزداد زمن الدورة كلما ازداد حجم المدار حول الكتلة المركزية نفسها، وفق قانون كبلر الثالث. الرسم تخطيطي والنسبة تقريبية؛ لا نستنتج منه أحجام الأجرام الحقيقية.', 'La période augmente avec la taille de l’orbite autour d’une même masse centrale, selon la troisième loi de Kepler. Le schéma n’est pas à l’échelle.', 'The orbital period grows with orbit size around the same central mass, following Kepler’s third law. The diagram is not to scale.')[lang],
  }
  return {
    prompt: c('اختر مثالًا من حياتك يوضح الفكرة، ثم اشرح ما الذي تلاحظه وما الذي تستنتجه.', 'Choisissez un exemple quotidien et expliquez ce que vous observez et ce que vous en déduisez.', 'Choose an everyday example. Explain what you observe and what you infer from it.')[lang],
    answer: c('افصل بين المشاهدة والتفسير: اذكر دليلًا محددًا من المثال، ثم اربطه بالفكرة، وأشر إلى معلومة إضافية قد تغيّر استنتاجك.', 'Séparez observation et interprétation : citez un indice précis, reliez-le à l’idée et indiquez quelle information pourrait modifier votre conclusion.', 'Separate observation from interpretation: cite a specific clue, connect it to the idea, and name information that could change your conclusion.')[lang],
  }
}

export default function TopicExperience({lang,title,explanation,subject}:{lang:Lang;title:string;explanation:string;subject:string}) {
  const [step,setStep]=useState(0)
  const [response,setResponse]=useState('')
  const [activityNote,setActivityNote]=useState('')
  const [showGuide,setShowGuide]=useState(false)
  useEffect(()=>{setStep(0);setResponse('');setActivityNote('');setShowGuide(false)},[title,subject])
  const mode=activityModeFor(subject,title)
  const words=lang==='ar'?{heading:'من الفكرة إلى الفهم',steps:['الفكرة',mode==='evidence'?'افحص الفكرة':'جرّب ولاحظ','تحقّق من فهمك'],next:'التالي',previous:'السابق',write:'دوّن ما لاحظته واستنتجته',guide:'افتح دليل الإجابة',hide:'أخفِ الدليل',yourAnswer:'ملاحظتك',guideTitle:'ما الذي تتضمنه إجابة قوية؟'}:lang==='fr'?{heading:'De l’idée à la compréhension',steps:['L’idée',mode==='evidence'?'Examiner l’idée':'Manipuler et observer','Vérifier'],next:'Suivant',previous:'Précédent',write:'Notez votre observation et votre conclusion',guide:'Voir le guide de réponse',hide:'Masquer le guide',yourAnswer:'Votre observation',guideTitle:'Les éléments d’une bonne réponse'}:{heading:'From idea to understanding',steps:['The idea',mode==='evidence'?'Examine the idea':'Try and observe','Check your thinking'],next:'Next',previous:'Previous',write:'Record what you observed and inferred',guide:'Reveal an answer guide',hide:'Hide the guide',yourAnswer:'Your observation',guideTitle:'What makes a strong answer?'}
  const challenge=challengeFor(subject,title,lang)
  const number=(value:number)=>new Intl.NumberFormat(lang==='ar'?'ar-MA':lang==='fr'?'fr-FR':'en-US',{useGrouping:false}).format(value)
  const attemptFeedback=response.trim()
    ? lang==='ar'?'سُجّلت محاولتك. افتح الدليل وقارن بين فكرتك والأدلة التي استندت إليها.':lang==='fr'?'Votre proposition est conservée. Ouvrez le guide et comparez votre raisonnement aux indices.':'Your attempt is saved. Reveal the guide and compare your reasoning with its evidence.'
    : lang==='ar'?'جرّب كتابة إجابتك أولًا، أو افتح الدليل لتتعرف إلى خطوات التفكير.':lang==='fr'?'Essayez d’abord une réponse, ou ouvrez le guide pour découvrir les étapes du raisonnement.':'Try writing first, or reveal the guide to see the reasoning steps.'
  return <section className="topic-experience" aria-label={words.heading}>
    <header className="topic-experience-heading"><span aria-hidden="true">{number(step+1)}</span><div><h3>{words.heading}</h3><p>{title}</p></div></header>
    <nav className="learning-experience-steps" aria-label={words.heading}>{words.steps.map((name,index)=><button type="button" key={name} onClick={()=>setStep(index)} aria-current={step===index?'step':undefined} className={step===index?'active':''}><b>{number(index+1)}</b>{name}</button>)}</nav>
    <div className="learning-experience-panel" aria-live="polite">
      {step===0&&<><strong>{lang==='ar'?'الفكرة المحورية':lang==='fr'?'Idée centrale':'Core idea'}</strong><p>{explanation}</p></>}
      <div hidden={step!==1}><TopicActivity key={`${subject}-${title}-${mode}`} lang={lang} mode={mode} title={title} onObserve={setActivityNote}/></div>
      {step===1&&<><strong>{challenge.prompt}</strong><label>{words.yourAnswer}<textarea value={response} onChange={event=>setResponse(event.target.value)} rows={3} placeholder={words.write}/></label></>}
      {step===2&&<><strong>{words.guideTitle}</strong>{activityNote&&<p className="activity-recalled">{lang==='ar'?'ما غيّرته أو اخترته:':lang==='fr'?'Votre choix :':'Your selection:'} {activityNote}</p>}<p>{attemptFeedback}</p><button type="button" className="learning-guide-toggle" aria-expanded={showGuide} onClick={()=>setShowGuide(value=>!value)}>{showGuide?words.hide:words.guide}</button>{showGuide&&<p className="learning-answer-guide">{challenge.answer}</p>}</>}
    </div>
    <div className="learning-experience-controls"><button type="button" onClick={()=>setStep(value=>Math.max(0,value-1))} disabled={step===0}>{words.previous}</button><span>{number(step+1)} / {number(3)}</span><button type="button" onClick={()=>setStep(value=>Math.min(2,value+1))} disabled={step===2}>{words.next}</button></div>
  </section>
}
