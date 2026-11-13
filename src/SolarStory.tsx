import { useState } from 'react'
import { Diagram } from './Diagrams'
import type { Lang } from './i18n'

const BODIES = [
  ['الشمس','Soleil','Sun',0,0], ['عطارد','Mercure','Mercury',.39,88],
  ['الزهرة','Vénus','Venus',.72,224.7], ['الأرض','Terre','Earth',1,365.25],
  ['المريخ','Mars','Mars',1.52,687], ['المشتري','Jupiter','Jupiter',5.2,4333],
  ['زحل','Saturne','Saturn',9.58,10759], ['أورانوس','Uranus','Uranus',19.2,30687],
  ['نبتون','Neptune','Neptune',30.05,60190],
] as const

export default function SolarStory({ lang }: { lang: Lang }) {
  const [selected, setSelected] = useState(0)
  const index = lang === 'ar' ? 0 : lang === 'fr' ? 1 : 2
  const w = lang === 'ar' ? {
    title:'رحلة عبر الزمن والمسافة: من ولادة الشمس إلى نبتون',
    intro:'عمر الجرم يختلف عن مدة دورانه حول الشمس. تشكّلت الشمس والكواكب من سحابة واحدة قبل نحو 4.6 مليار سنة، خلال مراحل متداخلة؛ لم تتكوّن بترتيب بعدها عن الشمس.',
    phases:['قبل نحو 4.6 مليار سنة: انهيار سحابة الغاز والغبار','شمس فتية وقرص من المادة حولها','تجمّع الحبيبات وتصادم الأجسام وبناء الكواكب','اليوم: ثمانية كواكب تدور حول الشمس'],
    age:'العمر التقريبي', ageValue:'نحو 4.5–4.6 مليار سنة؛ تقدير عام لنشأة النظام وتكوّن أجرامه، وليس تاريخ ميلاد دقيقًا لكل كوكب.',
    distance:'متوسط البعد عن الشمس', orbit:'مدة دورة حول الشمس', days:'يوم أرضي', au:'وحدة فلكية', million:'مليون كم تقريبًا', sun:'الشمس هي النجم المركزي وليست كوكبًا يدور حول الشمس؛ وهي تدور حول محورها.',
    scale:'الوحدة الفلكية نحو 150 مليون كم. الأبعاد في الرسم توضيحية، وليست بمقياس حقيقي. نبتون أبعد الكواكب الثمانية، لكنه ليس نهاية النظام الشمسي.', sources:'المصادر',
  } : lang === 'fr' ? {
    title:'Voyage dans le temps et les distances : du jeune Soleil à Neptune',
    intro:'L’âge ne correspond pas à la période orbitale. Le Soleil et les planètes se sont formés à partir du même nuage il y a environ 4,6 milliards d’années, par étapes qui se chevauchent, sans suivre leur ordre de distance.',
    phases:['Il y a environ 4,6 milliards d’années : effondrement du nuage','Jeune Soleil entouré d’un disque','Accrétion et collisions : formation des planètes','Aujourd’hui : huit planètes autour du Soleil'],
    age:'Âge approximatif', ageValue:'Environ 4,5 à 4,6 milliards d’années : estimation générale de la formation du système, sans date de naissance précise pour chaque planète.',
    distance:'Distance moyenne au Soleil', orbit:'Période orbitale', days:'jours terrestres', au:'UA', million:'millions de km environ', sun:'Le Soleil est l’étoile centrale, pas une planète en orbite autour du Soleil.',
    scale:'Une UA vaut environ 150 millions de km. Le dessin n’est pas à l’échelle. Neptune est la dernière des huit planètes, mais pas la limite du Système solaire.', sources:'Sources',
  } : {
    title:'A journey through time and distance: from the young Sun to Neptune',
    intro:'Age is different from orbital period. The Sun and planets formed from one cloud about 4.6 billion years ago in overlapping stages, not in order of distance from the Sun.',
    phases:['About 4.6 billion years ago: a cloud collapses','A young Sun surrounded by a disk','Accretion and collisions build planets','Today: eight planets orbit the Sun'],
    age:'Approximate age', ageValue:'About 4.5–4.6 billion years: a broad estimate for the system’s formation, not a precise birthday for each planet.',
    distance:'Mean distance from the Sun', orbit:'Orbital period', days:'Earth days', au:'AU', million:'million km, approximately', sun:'The Sun is the central star, not a planet orbiting the Sun.',
    scale:'One AU is about 150 million km. The illustration is not to scale. Neptune is the outermost of the eight planets, not the edge of the solar system.', sources:'Sources',
  }
  const body = BODIES[selected]
  const number = (n: number) => n.toLocaleString(lang === 'ar' ? 'ar-MA-u-nu-latn' : lang, { maximumFractionDigits: 2 })
  return <section className="solar-story" style={{marginTop:32,padding:'clamp(16px,3vw,30px)',border:'1px solid #b9d6d1',borderRadius:24,background:'#f7fbf7',color:'#17382f'}}>
    <h3>{w.title}</h3><p style={{lineHeight:1.9}}>{w.intro}</p>
    <ol style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,paddingInlineStart:24,lineHeight:1.8}}>{w.phases.map(p=><li key={p}>{p}</li>)}</ol>
    <Diagram kind="solar" lang={lang} title={w.title} onSelect={key => { const i = ['pSun','pMercury','pVenus','pEarth','pMars','pJupiter','pSaturn','pUranus','pNeptune'].indexOf(key); if (i >= 0) setSelected(i) }}/>
    <div className="math-lab-tabs" aria-label={w.title}>{BODIES.map((b,i)=><button key={b[2]} aria-pressed={i===selected} className={i===selected?'active':''} onClick={()=>setSelected(i)}>{b[index]}</button>)}</div>
    <article aria-live="polite" style={{padding:20,background:'#fff',borderRadius:16,lineHeight:1.9}}>
      <h4>{body[index]}</h4><p><strong>{w.age}: </strong>{w.ageValue}</p>
      {selected===0 ? <p>{w.sun}</p> : <><p><strong>{w.distance}: </strong>{number(body[3])} {w.au} ≈ {number(body[3]*149.6)} {w.million}</p><p><strong>{w.orbit}: </strong>{number(body[4])} {w.days}</p></>}
    </article>
    <p style={{lineHeight:1.8}}>{w.scale}</p>
    <footer className="body-explorer-sources">{w.sources}: <a href="https://science.nasa.gov/solar-system/solar-system-facts/">NASA · Solar System</a> · <a href="https://science.nasa.gov/neptune/neptune-facts/">NASA · Neptune</a></footer>
  </section>
}
