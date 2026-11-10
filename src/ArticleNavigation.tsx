import { useState } from 'react'
import type { Lang } from './i18n'
import { scrollToDetail } from './scrollToDetail'
import { sound } from './sound'

export default function ArticleNavigation({lang,kids}:{lang:Lang;kids:boolean}) {
  const [active,setActive]=useState('article-visual')
  const labels=lang==='ar'?(kids?['شاهد','افهم','جرّب','تحقّق']:['الصورة والسياق','الدراسة التفصيلية','التطبيق والنقد','المصادر']):lang==='fr'?(kids?['Observer','Comprendre','Essayer','Vérifier']:['Image et contexte','Étude détaillée','Application et critique','Sources']):(kids?['Observe','Understand','Try','Check']:['Image and context','Detailed study','Application and critique','Sources'])
  return <nav className="article-learning-nav" aria-label={lang==='ar'?'تسلسل التعلم داخل الموضوع':lang==='fr'?'Parcours du sujet':'Topic learning sequence'}>
    {['article-visual','article-explanation','article-practice','article-sources'].map((id,i)=><button key={id} aria-controls={id} aria-pressed={active===id} onClick={()=>{setActive(id);if(kids)sound.click();scrollToDetail(()=>document.getElementById(id))}}><span aria-hidden="true">{i+1}</span>{labels[i]}</button>)}
  </nav>
}
