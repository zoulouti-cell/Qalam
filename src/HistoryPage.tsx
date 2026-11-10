import { useEffect, useRef } from 'react'
import { scrollToDetail } from './scrollToDetail'
import type { Lang } from './i18n'
import type { Level } from './content'
import type { HistoryData } from './historyTypes'
import { h } from './historyTypes'
import HistoryExplorer from './HistoryExplorer'
import { MEDICINE_HISTORY } from './medicineHistory'
import { TRANSPORT_HISTORY } from './transportHistory'
import { MATHEMATICS_HISTORY, CHEMISTRY_HISTORY, PHYSICS_HISTORY } from './scienceHistories'
import { WAR_HISTORY, PEACE_HISTORY } from './warPeaceHistory'
const histories:Record<string,HistoryData>={medicine:MEDICINE_HISTORY,transport:TRANSPORT_HISTORY,mathematics:MATHEMATICS_HISTORY,chemistry:CHEMISTRY_HISTORY,physics:PHYSICS_HISTORY,war:WAR_HISTORY,peace:PEACE_HISTORY}
export default function HistoryPage({id,lang,level}:{id:string;lang:Lang;level:Level}){const start=useRef<HTMLDivElement>(null);useEffect(()=>scrollToDetail(()=>start.current),[id]);const data=histories[id];const warfare=id==='war'||id==='peace';const home=id==='transport';return <div className="page-wide" ref={start}><a className="math-back" href={home?'#/journey':warfare?'#/war-peace':'#/explorer/'+(level==='kids'?'kids':'academic')+'/science/time'}>{(home?h('رحلة قلم','Parcours Qalam','Qalam Journey'):warfare?h('الحرب والسلام','Guerre et paix','War and peace'):h('العلوم والطب','Sciences et médecine','Science and medicine'))[lang]}</a>{data?<HistoryExplorer key={id} data={data} lang={lang} level={level}/>:<p>{h('لم يُعثر على هذا المسار.','Parcours introuvable.','Journey not found.')[lang]}</p>}</div>}
