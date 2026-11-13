import { useState } from 'react'
import { publicUrl } from './publicUrl'
const recordings = {
  science: { file:'einstein-ar.ogg', title:'ألبرت أينشتاين', author:'Riadismet', year:'2009', source:'Einstein.ogg', license:'CC BY-SA 3.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/' },
  technology: { file:'programming-ar.ogg', title:'البرمجة', author:'Yousry753', year:'2009', source:'Programming.ogg', license:'CC BY-SA 4.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/' },
  transport: { file:'airplane-ar.ogg', title:'الطائرة', author:'Riadismet', year:'2013', source:'Airplane article in Arabic Wikipedia.ogg', license:'الملك العام', licenseUrl:'https://commons.wikimedia.org/wiki/File:Airplane_article_in_Arabic_Wikipedia.ogg' },
}
export function recordingForTitle(title:string) {
  return /^(?:ألبرت |البرت )?(?:أينشتاين|اينشتاين)$/.test(title)?'science':/^(?:برمجة|البرمجة)$/.test(title)?'technology':/^(?:طائرة|الطائرة)$/.test(title)?'transport':undefined
}
export default function RecordedArabic({topic}:{topic?:string}) {
  const [failed,setFailed]=useState(false)
  const r=recordings[topic as keyof typeof recordings]
  if(!r)return null
  return <section className="recorded-arabic"><h3>استمع بالعربية: {r.title}</h3><p>مادة صوتية أرشيفية مكملة من ويكيبيديا العربية، مسجلة سنة {r.year}. ليست قراءة حرفية لنص موسوعة قلم ولا تحديثًا لأحدث المعطيات.</p><audio controls preload="none" src={publicUrl(`assets/audio/${r.file}`)} onError={()=>setFailed(true)}/>{failed&&<p role="alert">تعذر تحميل التسجيل. حاول إعادة تحميل الصفحة.</p>}<details><summary>مصدر التسجيل وحقوقه</summary><p>{r.author} — <a href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(r.source)}`} target="_blank" rel="noreferrer">ويكيميديا كومنز</a> — <a href={r.licenseUrl} target="_blank" rel="noreferrer">{r.license}</a>. التسجيل الأصلي دون تعديل.</p></details></section>
}
