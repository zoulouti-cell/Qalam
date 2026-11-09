import { useState } from 'react'
import type { Article } from './data'
import type { Lang } from './i18n'
import type { Level } from './content'
import { publicUrl } from './publicUrl'
import SpaceFabric from './SpaceFabric'

export default function SpaceArticleMedia({article,lang,level}:{article:Article;lang:Lang;level:Level}) {
  const [active,setActive]=useState(0)
  const hubble=article.id==='hubble-space-telescope'
  if(!hubble && article.id!=='black-holes-guide')return null
  const kids=level==='kids'
  const labels=lang==='ar'?(hubble?['المرآة','الألواح الشمسية','أدوات الرصد']:['أفق الحدث','المادة المضيئة','كيف نرصد الثقب؟']):lang==='fr'?(hubble?['Miroir','Panneaux solaires','Instruments']:['Horizon','Matière lumineuse','Observation']):(hubble?['Mirror','Solar panels','Instruments']:['Event horizon','Glowing matter','Observation'])
  const notes=lang==='ar'?(hubble?(kids?['تجمع المرآة الضوء مثل وعاء يجمع المطر، وتوجّهه إلى أدوات الرصد.','تلتقط الألواح ضوء الشمس وتحوله إلى كهرباء لتشغيل التلسكوب.','تسجل الأدوات الضوء وترسل بياناته إلى الأرض لنصنع الصور ونفهمها.']:['تجمع مرآة قطرها 2.4 متر الضوء وتوجّهه إلى الأجهزة؛ تؤثر مساحة التجميع وجودة البصريات والطول الموجي في القدرة الرصدية.','توفر الألواح الكهروضوئية طاقة تشغيل الأجهزة. جمع الضوء للقياس يختلف عن تحويل ضوء الشمس إلى طاقة كهربائية.','تفصل المطيافات الضوء بحسب الطول الموجي، بينما تقيس الكاميرات توزع الشدة عبر مرشحات. تتطلب النتائج معايرة وقراءة وصف المرشحات.']):(kids?['حد لا يمكن للضوء الرجوع بعد عبوره نحو الداخل.','قد يضيء الغاز الساخن خارج الثقب، وليس داخل أفقه.','نبحث عن أثره في النجوم والغاز، ونستعمل مراصد خاصة لقياس الضوء القادم من محيطه.']:['الأفق حد سببي في الزمكان وليس سطحًا صلبًا. تعتمد هندسته على الكتلة والدوران في النماذج الفيزيائية.','القرص المتراكم بنية من مادة خارج الأفق؛ الإشعاع المرصود لا يصدر من داخل الثقب، وقد يغيب القرص أصلًا.','تتكامل ديناميات النجوم وأطياف الغاز والقياسات الراديوية وموجات الجاذبية لبناء الأدلة؛ لا تعني الصورة أننا رصدنا التفرّد.'])):lang==='fr'?(hubble?['Le miroir collecte et dirige la lumière vers les instruments. Son diamètre est de 2,4 mètres.','Les panneaux transforment la lumière solaire en électricité ; ils ne forment pas les images astronomiques.','Caméras et spectrographes mesurent la lumière. Les données nécessitent un étalonnage.']:['Une frontière causale : la lumière qui la franchit vers l’intérieur ne peut plus revenir.','Le gaz lumineux se trouve à l’extérieur de l’horizon. Tous les trous noirs n’ont pas de disque brillant.','Les mouvements stellaires, le rayonnement et les ondes gravitationnelles fournissent des indices complémentaires.']):(hubble?['The 2.4-metre mirror collects light and directs it to the instruments.','Panels turn sunlight into electricity; they do not form astronomical images.','Cameras and spectrographs measure light. Their data require calibration.']:['A causal boundary: light crossing inward cannot return.','Glowing gas lies outside the horizon. Not all black holes have bright disks.','Stellar motion, radiation and gravitational waves provide complementary evidence.'])
  return <section className="space-article-media">
    <h2>{lang==='ar'?'استكشف الصورة وافهم الأجزاء':lang==='fr'?'Explorer et comprendre':'Explore and understand'}</h2>
    <figure>{!kids && <img src={publicUrl(`assets/img/${hubble?'telescope-space-kids-v1':'blackhole-kids-v1'}.jpg`)} alt={article.content[lang].title} loading="lazy"/>}
      <figcaption>{lang==='ar'?(hubble?'إعادة تصور تعليمية مولّدة لتلسكوب فضائي مستوحى من هابل؛ ليست صورة حقيقية أو مخططًا هندسيًا مطابقًا.':'رسم توضيحي مولّد للثقب ومادته المحيطة؛ ليس صورة رصدية، والألوان والأحجام لتقريب الفكرة.'):lang==='fr'?'Illustration pédagogique générée, ni photographie documentaire ni plan technique exact.':'Generated educational illustration, not a documentary photograph or exact engineering plan.'}</figcaption>
    </figure>
    <div className="math-lab-tabs">{labels.map((label,i)=><button key={label} onClick={()=>setActive(i)} className={active===i?'active':''} aria-pressed={active===i}>{label}</button>)}</div>
    <p aria-live="polite">{notes[active]}</p>
    {!hubble && kids && <SpaceFabric lang={lang}/>}
  </section>
}
