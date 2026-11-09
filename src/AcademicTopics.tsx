import type { Lang } from './i18n'
import { TOPICS } from './knowledgeGraph'
import ArticleVisual, { topicImageArticle } from './ArticleVisual'
export default function AcademicTopics({domain,lang}:{domain:string;lang:Lang}){
 const branches=domain==='science'?['chemistry','physics']:domain==='technology'?['tech']:[domain]
 const topics=TOPICS.filter(t=>branches.includes(t.branch))
 return <section className="academic-topic-gallery"><h2>{lang==='ar'?'دراسات وموضوعات أكاديمية':lang==='fr'?'Études et sujets académiques':'Academic studies and topics'}</h2><div className="academic-topic-grid">{topics.map(t=><a className="academic-topic-card" key={t.id} href={`#/topic/${t.id}`}><ArticleVisual article={topicImageArticle(t)} lang={lang} level="school"/><div><h3>{t.title[lang]}</h3><p>{t.idea[lang]}</p><span>{lang==='ar'?'افتح الدراسة والأشكال والبيانات':lang==='fr'?'Étude, figures et données':'Study, figures and data'}</span></div></a>)}</div></section>
}
