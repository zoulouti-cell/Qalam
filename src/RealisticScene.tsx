import { useState } from 'react'
import type { Lang } from './i18n'
import { publicUrl } from './publicUrl'
export default function RealisticScene({kind,lang}:{kind:'terrain'|'satellite';lang:Lang}){
 const [zoom,setZoom]=useState(false),[active,setActive]=useState(0)
 const labels=kind==='terrain'?['الجبال','المجرى النهري','الطبقات الصخرية']:['الخلايا الشمسية','هوائي الاتصال','العزل والحمولة']
 const en=kind==='terrain'?['Mountains','River channel','Rock strata']:['Solar cells','Communications antenna','Insulation and payload']
 const fr=kind==='terrain'?['Montagnes','Cours fluvial','Strates rocheuses']:['Cellules solaires','Antenne','Isolation et charge utile']
 const notes=kind==='terrain'?['يتفاعل الرفع التكتوني مع التعرية في تشكيل السفوح والأحواض.','يعمل الجريان على النحت والنقل والترسيب، وقد تتغير القناة والسهول الفيضية مع الزمن.','تساعد الطبقات والبنية الصخرية في قراءة تاريخ الترسيب والتشوه؛ اللون وحده لا يحدد عمر الصخر.']:['تحول الخلايا الضوء إلى كهرباء؛ تعتمد القدرة المتاحة على الإضاءة والاتجاه والكفاءة والتخزين.','تعتمد وصلة الاتصال على التردد والقدرة والتوجيه والمسافة إلى المحطة الأرضية.','يساعد العزل متعدد الطبقات في التحكم بالتبادل الحراري الإشعاعي، وتضم الحمولة أدوات المهمة.']
 const names=lang==='ar'?labels:lang==='fr'?fr:en
 return <section className="realistic-scene"><div className={`realistic-scene-image ${zoom?'is-zoomed':''}`}><img src={publicUrl(`assets/img/${kind}-academic-realistic-v1.png`)} alt={names.join(' · ')}/></div><div className="realistic-scene-tools"><button onClick={()=>setZoom(x=>!x)}>{lang==='ar'?(zoom?'إظهار الصورة كاملة':'تكبير التفاصيل'):(zoom?'Full view':'Zoom')}</button>{names.map((name,i)=><button key={name} aria-pressed={active===i} onClick={()=>setActive(i)}>{name}</button>)}</div><article aria-live="polite"><h4>{names[active]}</h4><p>{lang==='ar'?notes[active]:lang==='fr'?'Observez cette structure dans la reconstruction pédagogique.':'Examine this structure in the educational reconstruction.'}</p></article><small>{lang==='ar'?'صورة تعليمية مولدة، وليست توثيقًا لموقع أو مهمة محددة.':lang==='fr'?'Illustration générée, pas une photographie documentaire.':'Generated educational illustration, not documentary photography.'}</small></section>
}
