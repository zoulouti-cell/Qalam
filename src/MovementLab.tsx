import { useState } from 'react'
import type { Lang } from './i18n'
import type { Level } from './content'
import type { Words } from './learningRoute'
import './learningRoute.css'

const w=(ar:string,fr:string,en:string):Words=>({ar,fr,en})
const MODES={
  communications:[
    {name:w('رسول يسير','Messager à pied','Walking messenger'),speed:5},
    {name:w('قطار يحمل رسالة','Train postal','Mail train'),speed:100},
    {name:w('إشارة راديوية','Signal radio','Radio signal'),speed:300000000},
    {name:w('ضوء في ألياف بصرية','Lumière dans la fibre','Light in fiber'),speed:200000000},
  ],
  transport:[
    {name:w('سير على الأقدام','Marche','Walking'),speed:5},
    {name:w('قطار','Train','Train'),speed:100},
    {name:w('سفينة','Navire','Ship'),speed:35},
    {name:w('طائرة','Avion','Airplane'),speed:900},
  ],
}

export default function MovementLab({lang,level,kind}:{lang:Lang;level:Level;kind:'communications'|'transport'}) {
  const [distance,setDistance]=useState(100)
  const [mode,setMode]=useState(0)
  const options=MODES[kind]
  const selected=options[mode]
  const isSignal=selected.speed>100000
  const seconds=isSignal?distance*1000/selected.speed:distance/selected.speed*3600
  const duration=seconds<1?`${(seconds*1000).toFixed(1)} ${w('مللي ثانية','ms','ms')[lang]}`:seconds<60?`${seconds.toFixed(1)} ${w('ثانية','s','seconds')[lang]}`:seconds<3600?`${(seconds/60).toFixed(1)} ${w('دقيقة','min','minutes')[lang]}`:`${(seconds/3600).toFixed(1)} ${w('ساعة','h','hours')[lang]}`
  return <section className="movement-lab">
    <header><small>{kind==='communications'?w('مختبر انتقال الرسالة','Laboratoire du message','Message travel lab')[lang]:w('مختبر حركة الناس والسلع','Laboratoire des déplacements','Travel and freight lab')[lang]}</small><h3>{w('غيّر المسافة والوسيلة، ثم قارن الزمن','Changez distance et moyen, puis comparez le temps','Change distance and mode, then compare travel time')[lang]}</h3><p>{w('هذا نموذج حسابي مبسط؛ لا يصف رحلة حقيقية كاملة.','Ce modèle simplifié ne décrit pas un trajet réel complet.','This simplified calculation does not describe a complete real journey.')[lang]}</p></header>
    <div className="movement-lab-track" aria-hidden="true"><span>{w('البداية','Départ','Start')[lang]}</span><div><i style={{width:`${Math.max(8,distance/50)}%`}}/></div><span>{w('الوصول','Arrivée','Arrival')[lang]}</span></div>
    <label className="movement-lab-distance">{w('المسافة','Distance','Distance')[lang]}: <strong>{distance} {w('كم','km','km')[lang]}</strong><input type="range" min="10" max="5000" step="10" value={distance} onChange={event=>setDistance(Number(event.target.value))}/></label>
    <div className="movement-lab-modes" role="group" aria-label={w('اختر الوسيلة','Choisir un moyen','Choose a mode')[lang]}>{options.map((option,index)=><button key={index} type="button" className={index===mode?'selected':''} aria-pressed={index===mode} onClick={()=>setMode(index)}>{option.name[lang]}</button>)}</div>
    <output className="movement-lab-result">{w('الزمن النظري','Temps théorique','Theoretical time')[lang]}: <strong>{duration}</strong></output>
    <p className="movement-lab-limit">{level==='kids'?(kind==='communications'?w('تخيّل أن الرسالة قد تصل قبل المسافر. هل يستطيع الضوء نقل حقيبة أيضًا؟','Un message peut arriver avant le voyageur. La lumière peut-elle porter une valise ?','A message can arrive before a traveler. Can light carry a suitcase?')[lang]:w('جرّب مسافة قصيرة ثم بعيدة. هل أسرع وسيلة مناسبة دائمًا لكل الناس والبضائع؟','Essayez un court trajet puis un long. Le moyen le plus rapide convient-il toujours ?','Try a short and a long trip. Is the fastest mode always suitable?')[lang]):(kind==='communications'?w('الحساب: الزمن = المسافة ÷ السرعة. تضيف الشبكات الحقيقية زمن معالجة وتوجيه؛ سرعة الإشارة في الألياف قيمة تقريبية.','Calcul : durée = distance ÷ vitesse. Traitement et routage ajoutent des délais ; la vitesse en fibre est approximative.','Calculation: time = distance ÷ speed. Processing and routing add delays; fiber speed is approximate.')[lang]:w('الحساب: الزمن = المسافة ÷ السرعة. تشمل الرحلة الفعلية الانتظار والتوقف والمسار والبنية التحتية؛ السرعات هنا قيم تعليمية تقريبية.','Calcul : durée = distance ÷ vitesse. Attente, arrêts, itinéraire et infrastructure comptent ; ces vitesses sont approximatives.','Calculation: time = distance ÷ speed. Waiting, stops, route, and infrastructure matter; speeds here are illustrative approximations.')[lang])}</p>
  </section>
}
