import { useEffect, useState } from 'react'
import type { Lang } from './i18n'
type Copy = Record<Lang,string>
const TOPICS: Record<string, [string,string,string][]> = {
 life:[['الموطن','Habitat','Habitat'],['الشبكة الغذائية','Réseau trophique','Food web'],['التنوع والتكيف','Diversité et adaptation','Diversity and adaptation']],
 civilizations:[['الاستقرار والماء','Eau et peuplement','Water and settlement'],['المدينة والتبادل','Ville et échanges','Cities and exchange'],['المعرفة والمؤسسات','Savoirs et institutions','Knowledge and institutions']],
 science:[['السؤال والملاحظة','Question et observation','Question and observation'],['التجربة والقياس','Expérience et mesure','Experiment and measurement'],['النموذج والدليل','Modèle et preuve','Models and evidence']],
 'human-history':[['الهجرات والبيئة','Migrations et environnement','Migration and environment'],['المجتمع والسلطة','Société et pouvoir','Society and power'],['التحولات والتفاعل','Transformations et échanges','Change and interaction']],
 arts:[['الإبداع والتعبير','Création et expression','Creation and expression'],['الشكل والإيقاع','Forme et rythme','Form and rhythm'],['التلقي والتأويل','Réception et interprétation','Reception and interpretation']],
 religions:[['النص والسياق','Texte et contexte','Text and context'],['الأماكن والمسارات','Lieux et itinéraires','Places and routes'],['التراث والتنوع','Patrimoine et diversité','Heritage and diversity']],
 technology:[['المعلومة والإشارة','Information et signal','Information and signals'],['المعالجة والخوارزمية','Traitement et algorithme','Processing and algorithms'],['الشبكات والأثر','Réseaux et impacts','Networks and impact']],
 future:[['مؤشرات الحاضر','Signaux actuels','Present signals'],['البدائل والسيناريوهات','Options et scénarios','Options and scenarios'],['الاختيار والنتائج','Choix et conséquences','Choices and consequences']],
}
const NOTES:Record<string,[string,string,string]>={
 life:['ابدأ بالكائن داخل موطنه: الماء والضوء والغذاء عوامل تؤثر في بقائه.','انتقل إلى العلاقات: المنتج والمستهلك والمحلل أجزاء من شبكة مترابطة، وليست سلسلة واحدة دائمًا.','قارن التكيفات والتنوع؛ تغير عنصر واحد قد يؤثر في عناصر أخرى، ولا تكون الاستجابة متساوية في كل البيئات.'],
 civilizations:['قارن كيف أسهم الماء والزراعة والطرق في الاستقرار في أقاليم متعددة.','استكشف المدينة بوصفها شبكة عمل وتبادل وحرف، لا مبنى أثريًا منفردًا.','اربط الكتابة والمعرفة والمؤسسات بظروف كل مجتمع؛ لا تتبع الحضارات كلها مسارًا واحدًا.'],
 science:['ابدأ بسؤال يمكن فحصه، وافصل الملاحظة عن تفسيرها.','غيّر عاملًا مع ضبط العوامل الأخرى قدر الإمكان، ثم قارن القياسات وتكرارها.','قارن تنبؤ النموذج بالنتائج؛ توافقه مع تجربة لا يجعله حقيقة نهائية في كل الظروف.'],
 'human-history':['تتفاعل حركة السكان مع المناخ والموارد والتقنيات؛ لا يفسر عامل واحد كل الهجرات.','قارن تنظيم العمل والسلطة والعلاقات الاجتماعية ضمن سياق زمني ومكاني محدد.','اربط الأحداث بنتائجها ومصادرها، وانتبه إلى اختلاف خبرات الشعوب والفئات داخل المرحلة نفسها.'],
 arts:['اسأل: ماذا يحاول العمل التعبير عنه، وفي أي سياق نشأ؟','قارن التنظيم البصري والإيقاع والتكرار في النص والصورة والموسيقى.','قد تتعدد قراءات العمل، لكن التأويل الجيد يستند إلى عناصره وسياقه وشواهده.'],
 religions:['ميّز بين عرض المعتقد كما تفهمه جماعته ودراسة تاريخه ومصادره.','تتبّع انتقال النصوص والأفكار والأشخاص والعمارة عبر طرق التبادل والهجرة.','قارن التراث والممارسات مع احترام التنوع الداخلي؛ الرسم تجريدي ولا يجسد الأنبياء أو الشخصيات المقدسة.'],
 technology:['المعلومة تحتاج إلى تمثيل: رمز أو إشارة أو بيانات قابلة للنقل.','تطبق الخوارزمية خطوات محددة على مدخلات لإنتاج مخرجات؛ جودة النتيجة مرتبطة بالبيانات والتصميم.','تتصل الأنظمة عبر الشبكات، وتُقيّم آثارها في الطاقة والعمل والخصوصية وإتاحة المعرفة.'],
 future:['ابدأ بمؤشرات قابلة للرصد، وحدد ما نعرفه وما نجهله.','ابنِ أكثر من سيناريو مع افتراضات واضحة؛ الاستشراف لا يعني الجزم بالغيب.','قارن النتائج المحتملة والآثار غير المقصودة، ثم حدّث السيناريو عند ظهور دليل جديد.'],
}
export default function BranchDiscovery({id,lang,academic,title,child,adult}:{id:string;lang:Lang;academic:boolean;title:Copy;child:Copy;adult:Copy}){
 const [step,setStep]=useState(0),[playing,setPlaying]=useState(false)
 useEffect(()=>{setStep(0);setPlaying(false)},[id])
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setStep(x=>(x+1)%3),3200);return()=>clearInterval(timer)},[playing])
 const topics=TOPICS[id];if(!topics)return null
 const index=lang==='ar'?0:lang==='fr'?1:2
 const select=(i:number)=>{setStep(i);setPlaying(false)}
 return <section className={`branch-discovery branch-scene-${id}`}>
 <header><span>{lang==='ar'?'استكشاف بصري تفاعلي':lang==='fr'?'Exploration visuelle interactive':'Interactive visual exploration'}</span><h3>{title[lang]}</h3></header>
 <div className="branch-discovery-tabs">{topics.map((topic,i)=><button key={topic[2]} aria-pressed={step===i} className={step===i?'active':''} onClick={()=>select(i)}><b>{i+1}</b>{topic[index]}</button>)}</div>
 <div className="branch-discovery-stage">
 {academic ? <svg viewBox="0 0 1000 500" role="img" aria-label={title[lang]}><defs><pattern id={`grid-${id}`} width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#cddbd4" strokeWidth=".6"/></pattern></defs><rect width="1000" height="500" rx="20" fill="#edf3ef"/><rect width="1000" height="500" fill={`url(#grid-${id})`}/><text x="500" y="45" textAnchor="middle" fill="#193d30" fontSize="24">{title[lang]}</text>{topics.map((topic,i)=><g key={topic[2]}><path d={`M${180+i*320} 155 V330`} stroke="#628676" strokeWidth="2" strokeDasharray="5 4"/>{i<2&&<path d={`M${260+i*320} 205 H${420+i*320}`} stroke="#406654" strokeWidth="3"/>}<rect x={60+i*320} y="110" width="240" height="180" rx="14" fill={step===i?"#d4e8d9":"#ffffff"} stroke={step===i?"#276a46":"#92ae9e"} strokeWidth="2"/><text x={180+i*320} y="145" textAnchor="middle" fill="#355b49" fontSize="15">{String(i+1).padStart(2,"0")}</text><text x={180+i*320} y="190" textAnchor="middle" fill="#183d2c" fontSize="19">{topic[index]}</text>{[0,1,2,3].map(j=><g key={j}><circle cx={110+i*320+j*46} cy="245" r={j===step?10:6} fill={j===step?"#a26e32":"#4b7b62"}/>{j<3&&<path d={`M${120+i*320+j*46} 245 h25`} stroke="#6a8d7a"/>}</g>)}<text x={180+i*320} y="355" textAnchor="middle" fill="#274c3a" fontSize="15">{lang==="ar"?(i===0?"السياق والمدخلات":i===1?"الآليات والعلاقات":"النتائج وحدود التفسير"):lang==="fr"?(i===0?"Contexte et entrées":i===1?"Mécanismes et relations":"Résultats et limites"):(i===0?"Context and inputs":i===1?"Mechanisms and relationships":"Outcomes and limitations")}</text></g>)}<text x="500" y="430" textAnchor="middle" fill="#3c6150" fontSize="17">{lang==="ar"?"اقرأ العلاقات ضمن سياق الموضوع، ثم راجع الشرح والمصادر أدناه":lang==="fr"?"Reliez le schéma au contexte, au texte et aux sources":"Read the relationships alongside context, explanation and sources"}</text></svg> : <svg viewBox="0 0 900 340" role="img" aria-label={topics[step][index]}>
 <defs><linearGradient id={`bg-${id}`}><stop stopColor="#e3f1e5"/><stop offset="1" stopColor="#fff2d3"/></linearGradient></defs>
 <rect width="900" height="340" rx="24" fill={`url(#bg-${id})`}/>
 {id==='life'&&<g fill="#4d9870"><path d="M0 300 Q200 200 450 270 T900 230 V340 H0Z"/><path d="M115 270V150m-50 35 50-100 50 100m-65 20 15-90 40 90" stroke="#245c3f" strokeWidth="10"/><circle cx="735" cy="73" r="38" fill="#edbd4d"/></g>}
 {(id==='civilizations'||id==='human-history'||id==='religions')&&<g fill="#b98c54" stroke="#806444" strokeWidth="3">{[95,310,590,775].map((x,i)=><g key={x}><rect x={x-35} y={210-i*12} width="70" height={90+i*12}/><path d={`M${x-45} ${210-i*12} L${x} ${170-i*12} L${x+45} ${210-i*12}Z`}/></g>)}</g>}
 {id==='science'&&<g transform="translate(450 170)" fill="none" stroke="#638ca4" strokeWidth="3"><ellipse rx="100" ry="40"/><ellipse rx="100" ry="40" transform="rotate(60)"/><ellipse rx="100" ry="40" transform="rotate(120)"/><circle r="16" fill="#c98a48"/></g>}
 {id==='arts'&&<g fill="none" stroke="#98618b" strokeWidth="5">{[0,1,2].map(i=><path key={i} d={`M40 ${90+i*65} Q150 ${10+i*65} 250 ${90+i*65} T450 ${90+i*65} T650 ${90+i*65} T860 ${90+i*65}`}/>)}</g>}
 {id==='technology'&&<g fill="none" stroke="#387b86" strokeWidth="5"><rect x="380" y="100" width="140" height="140" rx="16"/>{[0,1,2,3].map(i=><path key={i} d={`M${395+i*35} 100V60 M${395+i*35} 240V280 M380 ${115+i*35}H300 M520 ${115+i*35}H600`}/>)}</g>}
 {id==='future'&&<g fill="#7b84b0">{[100,200,310,440,570,690,800].map((x,i)=><rect key={x} x={x-30} y={110+(i%3)*38} width="60" height={190-(i%3)*38} rx="9"/>)}</g>}
 <path d="M155 175 Q450 40 745 175" fill="none" stroke="#58796d" strokeWidth="3" strokeDasharray="8 9"/>
 {[155,450,745].map((x,i)=><g key={x} onClick={()=>select(i)} style={{cursor:'pointer'}}><circle cx={x} cy={i===1?108:175} r={step===i?39:29} fill={step===i?'#174c3c':'#ffffff'} stroke="#5f846c" strokeWidth="3"/><text x={x} y={(i===1?108:175)+8} textAnchor="middle" fill={step===i?'#ffffff':'#17382f'} fontSize="26">{i+1}</text></g>)}
 </svg>}</div>
 <div className="branch-playback"><button onClick={()=>setPlaying(x=>!x)}>{playing?(lang==='ar'?'إيقاف':'Pause'):(lang==='ar'?'تشغيل التسلسل':lang==='fr'?'Lire la séquence':'Play sequence')}</button><label>{lang==='ar'?'مرحلة الاستكشاف':lang==='fr'?'Étape':'Stage'} <input type="range" min="0" max="2" value={step} onChange={e=>select(Number(e.target.value))}/></label></div>
 <article className="branch-reading" aria-live="polite" key={`${id}-${step}-${academic}`}><h4>{topics[step][index]}</h4>{lang==='ar'&&<p>{NOTES[id][step]}</p>}<p>{academic?adult[lang]:child[lang]}</p><small>{lang==='ar'?'رسم مفاهيمي للتفسير، وليس محاكاة تاريخية أو علمية مقاسة.':lang==='fr'?'Schéma conceptuel explicatif, pas une simulation mesurée.':'Conceptual teaching diagram, not a measured simulation.'}</small></article>
 </section>
}
