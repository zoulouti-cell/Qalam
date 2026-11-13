import { useEffect, useState } from 'react'
import type { Lang } from './i18n'
import { scrollToDetail } from './scrollToDetail'
import { sound } from './sound'

export default function ArticleNavigation({lang,kids}:{lang:Lang;kids:boolean}) {
  const [active,setActive]=useState('article-visual')
  useEffect(()=>{
    if(!('IntersectionObserver' in window))return
    const ids=['article-visual','article-explanation','article-practice','article-sources']
    const sections=ids.map(id=>document.getElementById(id)).filter((item):item is HTMLElement=>Boolean(item))
    if(!sections.length)return
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)
      if(visible[0])setActive(visible[0].target.id)
    },{rootMargin:'-18% 0px -68% 0px',threshold:0})
    sections.forEach(section=>observer.observe(section))
    return()=>observer.disconnect()
  },[lang,kids])
  const labels=lang==='ar'?(kids?['ابدأ','افهم','جرّب','تحقّق']:['المقدمة','الدراسة التفصيلية','التطبيق والنقد','المصادر']):lang==='fr'?(kids?['Commencer','Comprendre','Essayer','Vérifier']:['Introduction','Étude détaillée','Application et critique','Sources']):(kids?['Start','Understand','Try','Check']:['Introduction','Detailed study','Application and critique','Sources'])
  return <nav className="article-learning-nav" aria-label={lang==='ar'?'تسلسل التعلم داخل الموضوع':lang==='fr'?'Parcours du sujet':'Topic learning sequence'}>
    {['article-visual','article-explanation','article-practice','article-sources'].map((id,i)=><button key={id} aria-controls={id} aria-pressed={active===id} onClick={()=>{setActive(id);if(kids)sound.click();scrollToDetail(()=>document.getElementById(id))}}><span aria-hidden="true">{i+1}</span>{labels[i]}</button>)}
  </nav>
}
