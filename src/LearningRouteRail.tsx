import type { Lang } from './i18n'
import type { Level } from './content'
import { themeForRoute, journeyHref, labHref, futureHref } from './learningRoute'
import './learningRoute.css'

export default function LearningRouteRail({route,lang,level}:{route:string;lang:Lang;level:Level}) {
  const theme=themeForRoute(route)
  if(!theme||route.startsWith('path/')) return null
  const current=route.startsWith('explorer/')||route==='morocco'||['history/medicine','history/mathematics','history/chemistry','history/communications','history/transport','history/peace'].includes(route)?1:route.startsWith('lab/')?2:route.startsWith('future/')||route.startsWith('future-lens/')?3:0
  const names={ar:['النافذة','الرحلة','المختبر','عالم الغد','تحقق من فهمك'],fr:['Fenêtre','Parcours','Laboratoire','Demain','Vérifier'],en:['Window','Journey','Lab','Tomorrow','Check']}[lang]
  const urls=[theme.windowArticle?`#/article/${theme.windowArticle}`:`#/path/${theme.id}`,journeyHref(theme,level),labHref(theme),futureHref(theme),`#/path/${theme.id}?step=check`]
  return <nav className="curriculum-rail" aria-label={lang==='ar'?'تسلسل الموضوع عبر الموسوعة':lang==='fr'?'Progression du sujet dans l’encyclopédie':'Topic sequence across the encyclopedia'}><strong>{theme.title[lang]}</strong>{names.map((name,index)=><a key={name} href={urls[index]} aria-current={current===index?'step':undefined}>{name}</a>)}</nav>
}
