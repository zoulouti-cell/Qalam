import ScientificMotion from './ScientificMotion'
import RealisticScene from './RealisticScene'
import { EARTH_FEATURES } from './earthFeatures'
import { useState } from 'react'
import Scene3D from './Scenes3D'
import type { Lang } from './i18n'
const LAYERS = [
 {id:'rivers',ar:'الأنهار',fr:'Fleuves',en:'Rivers',child:'يتحرك الماء نحو المناطق المنخفضة. تتجمع الجداول لتكوّن أنهارًا تصل إلى بحر أو بحيرة أو حوض داخلي.',adult:'تتشكل الشبكات النهرية داخل أحواض تصريف تفصلها خطوط تقسيم المياه. يرتبط الجريان بالتساقطات والتبخر والتسرب والتخزين؛ ويعيد النحت والنقل والترسيب تشكيل الوادي.'},
 {id:'mountains',ar:'الجبال',fr:'Montagnes',en:'Mountains',child:'قد ترتفع الجبال عندما تتقارب الصفائح، ثم تنحتها المياه والرياح والجليد عبر زمن طويل.',adult:'تنتج السلاسل الجبلية من عمليات تكتونية تشمل التقارب والتثخين القشري، وتتفاعل مع الرفع المتوازن والتعرية. رموز الخريطة لا تمثل ارتفاعات مقاسة.'},
 {id:'terrain',ar:'التضاريس',fr:'Reliefs',en:'Landforms',child:'قارن بين الجبل والهضبة والسهل والحوض: كيف يتغير شكل سطح الأرض؟',adult:'تُقرأ التضاريس عبر الارتفاع والانحدار والبنية الصخرية وتاريخ النحت والترسيب. الأمثلة هنا نقاط استكشاف تقريبية، وليست نموذج ارتفاع رقميًا شاملًا.'},
 {id:'volcanoes',ar:'البراكين',fr:'Volcans',en:'Volcanoes',child:'تصعد الصهارة من باطن الأرض، وقد تصل إلى السطح فتسمى حممًا. ليس كل جبل بركانًا.',adult:'تتركز براكين كثيرة عند حدود الصفائح، وتوجد براكين داخل الصفائح مرتبطة ببؤر ساخنة. الرسوم لا تشير إلى ثوران جارٍ أو تقييم خطر آني.'},
 {id:'storms',ar:'الأعاصير',fr:'Cyclones',en:'Cyclones',child:'تستمد الأعاصير المدارية طاقتها من مياه المحيط الدافئة. تدور السحب حول مركز العاصفة.',adult:'يتطلب تطور الإعصار المداري اضطرابًا أوليًا ورطوبة وطاقة محيطية وظروف رياح مناسبة. اللوالب أمثلة متحركة لأحواض مدارية، وليست مواقع عواصف حية أو توقعات.'},
] as const
export default function EarthDiscovery({lang,academic}:{lang:Lang;academic:boolean}) {
 const [layer,setLayer]=useState<string>('rivers')
 const current=LAYERS.find(x=>x.id===layer)!
 return <section className="earth-discovery"><h3>{lang==='ar'?'اكتشف تضاريس الأرض وظواهرها':lang==='fr'?'Reliefs et phénomènes terrestres':'Earth landforms and phenomena'}</h3>
 <div className="math-lab-tabs">{LAYERS.map(x=><button key={x.id} className={layer===x.id?'active':''} aria-pressed={layer===x.id} onClick={()=>setLayer(x.id)}>{x[lang]}</button>)}</div>
 <ScientificMotion kind="earth" lang={lang} academic={academic}/>{academic && ["terrain","mountains","rivers"].includes(layer) && <RealisticScene kind="terrain" lang={lang}/>}<details open={!academic}><summary>{lang === 'ar' ? 'الخريطة الكروية التعليمية' : 'Interactive teaching globe'}</summary><Scene3D kind="earth" lang={lang} earthLayer={layer} academic={academic}/></details>
 <p className="earth-layer-explanation">{lang==='ar'?current[academic?'adult':'child']:lang==='fr'?'Repères géographiques approximatifs et symboles pédagogiques. Cliquez sur un repère pour lire son nom. Les cyclones ne sont pas des données en temps réel.':'Approximate geographic landmarks and teaching symbols. Click a marker for its name. Cyclones are not live weather data.'}</p>
 {academic && <p className="earth-layer-explanation">{lang === 'ar' ? 'قراءة مرجعية: خط الاستواء، المداران، الدائرتان القطبيتان ومحور الدوران. الدوائر تبين دوائر عرض تقريبية، ولا تمثل شبكة لقياس الارتفاعات.' : lang === 'fr' ? 'Repères : équateur, tropiques, cercles polaires et axe. Les cercles indiquent des latitudes approximatives, pas des altitudes.' : 'Reference: equator, tropics, polar circles and axis. Circles show approximate latitudes, not elevation measurements.'}</p>}<div className="earth-location-list">{EARTH_FEATURES.filter(x=>x.layer===layer).map(x=><span key={x.en}>{x[lang]}</span>)}</div>
 <footer className="body-explorer-sources"><a href="https://pubs.usgs.gov/gip/volc/text.html">USGS</a><a href="https://www.noaa.gov/education/resource-collections/weather-atmosphere/hurricanes">NOAA</a></footer></section>
}
