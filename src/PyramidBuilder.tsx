import { useEffect, useState } from 'react'
import Mi from './Mi'
import type { Lang } from './i18n'
import type { Level } from './content'

const DATA = {
  ar: {
    title: 'كيف بُني الهرم الأكبر؟', sub: 'محاكاة تعليمية لمراحل العمل؛ تفاصيل بعض وسائل رفع الكتل ما زالت موضع نقاش علمي.', play: 'سرّع الزمن', pause: 'أوقف الزمن', stage: 'المرحلة', stages: [
      ['اختيار الموقع', 'اختار البناؤون هضبة صخرية قرب النيل، وخُطّطت مساحة القاعدة بدقة.', 'جُهّزت منطقة الجيزة ومحيطها لتكون جزءًا من مشروع جنائزي ملكي واسع.'],
      ['استخراج الكتل', 'قُطعت الحجارة من المحاجر، ثم شُذّبت إلى كتل مناسبة للبناء.', 'تكشف آثار المحاجر والأدوات عن استخراج أنواع مختلفة من الحجر، وبعض أحجار الكسوة نُقلت من مناطق أبعد.'],
      ['نقل الأحجار', 'نُقلت الكتل على زلاجات وطرق مهيأة؛ واستُخدمت المراكب لنقل الحجر عبر النيل.', 'أظهرت بردية وادي الجرف سجلات لفرق نقل الحجر الجيري بالقوارب إلى مشروع خوفو؛ وتنتمي الأدلة إلى منظومة لوجستية منظمة.'],
      ['رفع الكتل وتركيبها', 'وُضعت الكتل طبقة فوق طبقة. ربما ساعدت المنحدرات في رفعها.', 'تُظهر مواقع الأهرام منحدرات بناء، لكن شكل المنحدرات ومسارها وطريقة رفع الكتل في الهرم الأكبر تحديدًا ما زالت مواضيع بحث ونقاش.'],
      ['الكسوة والإنجاز', 'اكتمل الشكل بكسوة حجرية فاتحة، وأصبح الهرم معلمًا هائلًا.', 'كان الارتفاع الأصلي للهرم الأكبر نحو 146.6 مترًا. فُقد معظم حجر الكسوة الخارجي، وبقي الهيكل الداخلي شاهدًا على تخطيط وتقنيات عصر الدولة القديمة.'],
    ], sources: [
      ['متحف المتروبوليتان: الدولة القديمة', 'https://www.metmuseum.org/essays/egypt-in-the-old-kingdom-ca-2649-2150-b-c'],
      ['المعهد الفرنسي للآثار الشرقية: برديات وادي الجرف', 'https://www.ifao.egnet.net/uploads/publications/divers/MIFAO136_ann_01.pdf'],
      ['سميثسونيان: كيف بنيت الأهرامات؟', 'https://www.smithsonianmag.com/history/how-did-the-egyptians-build-the-pyramids-180981480/'],
    ] as [string, string][]
  },
  fr: {
    title: 'Comment la grande pyramide fut-elle bâtie ?', sub: 'Simulation pédagogique des étapes ; certaines méthodes de levage restent débattues.', play: 'Accélérer le temps', pause: 'Mettre en pause', stage: 'Étape', stages: [
      ['Choisir le site', 'Les bâtisseurs ont choisi un plateau rocheux près du Nil et préparé une base soigneusement planifiée.', 'Le plateau de Gizeh et ses alentours faisaient partie d’un vaste complexe funéraire royal.'],
      ['Extraire les blocs', 'La pierre était extraite des carrières, puis taillée en blocs adaptés.', 'Les carrières et outils témoignent de l’extraction de plusieurs pierres; certains matériaux venaient de plus loin.'],
      ['Transporter la pierre', 'Les blocs voyageaient sur des traîneaux et des bateaux par le Nil.', 'Le journal de Merer, sur papyrus, décrit le transport par bateau de calcaire vers le chantier de Khéops.'],
      ['Élever et poser', 'Les blocs étaient posés par couches ; des rampes ont pu aider à les hisser.', 'Des rampes sont attestées sur des sites pyramidaux, mais leur forme et leur usage précis pour la grande pyramide restent discutés.'],
      ['Finition', 'Un revêtement clair achevait la surface du monument.', 'La pyramide de Khéops mesurait environ 146,6 m à l’origine. La plupart des pierres de revêtement ont disparu.'],
    ], sources: [
      ['Metropolitan Museum : Ancien Empire', 'https://www.metmuseum.org/essays/egypt-in-the-old-kingdom-ca-2649-2150-b-c'],
      ['Institut français d’archéologie orientale : papyrus de Wadi al-Jarf', 'https://www.ifao.egnet.net/uploads/publications/divers/MIFAO136_ann_01.pdf'],
      ['Smithsonian : construction des pyramides', 'https://www.smithsonianmag.com/history/how-did-the-egyptians-build-the-pyramids-180981480/'],
    ] as [string, string][]
  },
  en: {
    title: 'How was the Great Pyramid built?', sub: 'A learning simulation of the work stages; some lifting methods remain debated.', play: 'Speed up time', pause: 'Pause time', stage: 'Stage', stages: [
      ['Choose the site', 'Builders selected a rocky plateau near the Nile and planned a carefully aligned base.', 'The Giza plateau formed part of a much larger royal funerary landscape.'],
      ['Quarry the blocks', 'Stone was cut from quarries and shaped into building blocks.', 'Quarry remains and tools show how different stones were extracted; some casing stone came from farther away.'],
      ['Move the stone', 'Blocks travelled on sledges and by boat along the Nile.', 'The Diary of Merer, an ancient papyrus log, records crews transporting limestone by boat for Khufu’s project.'],
      ['Raise and place', 'Blocks were laid in courses; ramps may have helped move them upward.', 'Ramps are known at pyramid sites, but their exact design and role at the Great Pyramid remain debated.'],
      ['Finish the surface', 'A pale stone casing completed the monument’s smooth outer face.', 'Khufu’s pyramid originally stood about 146.6 m tall. Most casing blocks are gone today.'],
    ], sources: [
      ['Metropolitan Museum: Old Kingdom Egypt', 'https://www.metmuseum.org/essays/egypt-in-the-old-kingdom-ca-2649-2150-b-c'],
      ['French Institute for Oriental Archaeology: Wadi al-Jarf papyri', 'https://www.ifao.egnet.net/uploads/publications/divers/MIFAO136_ann_01.pdf'],
      ['Smithsonian: How the pyramids were built', 'https://www.smithsonianmag.com/history/how-did-the-egyptians-build-the-pyramids-180981480/'],
    ] as [string, string][]
  },
} as const

export default function PyramidBuilder({ lang, level }: { lang: Lang; level: Level }) {
  const c = DATA[lang]
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setStep(i => (i + 1) % c.stages.length), 2500)
    return () => window.clearInterval(timer)
  }, [playing, c.stages.length])
  const fill = [0, 1, 2, 3, 4].slice(0, step + 1)
  const [title, child, detail] = c.stages[step]
  return <section className="pyramid-builder" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <header className="pyramid-builder-head"><div><span className="academy-kicker"><Mi name="account_balance"/> {lang === 'ar' ? 'مختبر التاريخ والهندسة' : lang === 'fr' ? 'Atelier d’histoire et de construction' : 'History and construction lab'}</span><h3>{c.title}</h3><p>{c.sub}</p></div><button className="primary-btn small" onClick={() => setPlaying(v => !v)}><Mi name={playing ? 'pause' : 'play_arrow'}/>{playing ? c.pause : c.play}</button></header>
    <div className="pyramid-visual" role="img" aria-label={title}><svg viewBox="0 0 520 290"><defs><linearGradient id="sand" x1="0" x2="0.8" y1="0" y2="1"><stop stopColor="#f3d99b"/><stop offset="1" stopColor="#c88e4e"/></linearGradient><linearGradient id="stone" x1="0" x2="1"><stop stopColor="#fff3cb"/><stop offset="1" stopColor="#c79b55"/></linearGradient></defs><rect width="520" height="290" rx="20" fill="#eaf4f1"/><circle cx="438" cy="55" r="25" fill="#ffd982"/><path d="M0 233 Q130 212 250 232 T520 222 V290 H0Z" fill="url(#sand)"/><path d="M115 232 L265 55 L420 232Z" fill="#b77a37" opacity=".42"/>{Array.from({length:8},(_,row)=>{const y=223-row*20, width=30+row*18, left=265-width/2; return <path key={row} d={`M${left} ${y} h${width} l-6 15 h-${width-12}z`} fill={fill.includes(row%5)?'url(#stone)':'#d9c08c'} stroke="#b38a4d" strokeWidth="1.5" opacity={step<row/2?'.22':'1'}/>})}<path d="M409 226 Q374 158 335 142" fill="none" stroke="#9d7448" strokeWidth="7" strokeDasharray="9 7" opacity={step>=3?'.95':'.15'}/>{step>=2&&Array.from({length:5},(_,i)=><g key={i} transform={`translate(${100+i*22},${220-i*4})`}><circle r="4" fill="#315849"/><path d="M0 4v12m-5-7h10m-5 7-4 6m4-6 4 6" stroke="#315849" strokeWidth="2"/></g>)}</svg><span className="pyramid-step-label">{step+1}/{c.stages.length} · {title}</span></div>
    <div className="pyramid-builder-controls"><span>{c.stage} {step+1}/{c.stages.length}</span><input type="range" min="0" max={c.stages.length-1} value={step} onChange={e=>{setPlaying(false);setStep(Number(e.target.value))}}/><button className="ghost-btn small" onClick={()=>setStep(i=>(i+c.stages.length-1)%c.stages.length)}>{lang==='ar'?'السابق':lang==='fr'?'Précédent':'Previous'}</button><button className="ghost-btn small" onClick={()=>setStep(i=>(i+1)%c.stages.length)}>{lang==='ar'?'التالي':lang==='fr'?'Suivant':'Next'}</button></div>
    <article className="pyramid-builder-detail"><h4>{title}</h4><p>{level==='kids'?child:detail}</p></article>
    <div className="pyramid-sources">{c.sources.map(([name,url])=><a key={name} href={url} target="_blank" rel="noreferrer">{name} ↗</a>)}</div>
  </section>
}
