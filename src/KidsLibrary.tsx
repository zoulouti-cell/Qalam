import { useState } from 'react'
import type { Article } from './data'
import type { Lang } from './i18n'
import { KIDS, KIDS_NEW } from './content'
import ArticleVisual from './ArticleVisual'

export function childEdition(article:Article,lang:Lang) {
  return article.kidsContent?.[lang]??[article.id,...(article.aliases||[])].map(id=>(KIDS[id]??KIDS_NEW[id])?.[lang]).find(Boolean)
}

export default function KidsLibrary({articles,lang}:{articles:Article[];lang:Lang}) {
  const [query,setQuery]=useState('')
  const entries=articles.map(article=>({article,content:childEdition(article,lang)})).filter(entry=>entry.content&&`${entry.content.title} ${entry.content.summary}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const title={ar:'مكتبة الصغار',fr:'Bibliothèque des enfants',en:'Children’s library'}[lang]
  return <section className="page-wide"><h1>{title}</h1><p>{lang==='ar'?'قصص معرفة ومقالات بصياغة مخصصة للصغار. اختر موضوعًا للقراءة والاستكشاف.':lang==='fr'?'Des articles écrits pour les jeunes lecteurs. Choisissez un sujet à lire et explorer.':'Articles written for young readers. Choose a topic to read and explore.'}</p><label className="kids-library-search">{lang==='ar'?'ابحث في مكتبتك':lang==='fr'?'Chercher dans votre bibliothèque':'Search your library'}<input type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="cards">{entries.map(({article,content})=><a className="card" key={article.id} href={`#/article/${article.id}`}><div className="card-photo"><ArticleVisual article={article} lang={lang} level="kids"/></div><div className="card-body"><h2 className="card-title">{content!.title}</h2><p className="card-summary">{content!.summary}</p></div></a>)}</div>{!entries.length&&<p>{lang==='ar'?'لا توجد نتائج مطابقة.':lang==='fr'?'Aucun résultat.':'No matching results.'}</p>}</section>
}
