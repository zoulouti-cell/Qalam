import { articleHasLanguage, type Article, type ArticleContent, type ArticleSource } from './data'
import type { Lang } from './i18n'

const LANGS:Lang[]=['ar','fr','en']
/** Keep parenthetical disambiguation: Mercury (planet) and Mercury (element) differ. */
export function subjectKey(title:string,lang:Lang):string {
  let value=title.normalize('NFKC').toLowerCase().replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[’‘]/g,"'").replace(/[‐‑–—]/g,'-').replace(/\s+/g,' ').trim()
  if(lang==='en')value=value.replace(/^the /,'')
  if(lang==='fr')value=value.replace(/^(?:le |la |les |l')/,'')
  return value
}
const textKey=(text:string)=>text.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}\p{M}]/gu,'')
const sourceKey=(source:ArticleSource)=>{try{const url=new URL(source.url);return url.origin+decodeURIComponent(url.pathname)}catch{return source.url}}
const names=(a:Article,l:Lang)=>{
  const ar=subjectKey(articleHasLanguage(a,'ar')?a.content.ar?.title||'':'','ar'),fr=subjectKey(articleHasLanguage(a,'fr')?a.content.fr?.title||'':'','fr')
  // Reviewed lexical variants in the existing imports; never generalise this to all near matches.
  const reviewed=l==='ar'&&fr==='atome'&&['ذرة','الذرة'].includes(ar)?['ذرة','الذرة']
    :l==='ar'&&fr==='monnaie'&&['مال','نقود'].includes(ar)?['مال','نقود']
    :l==='fr'&&ar==='عقار (مادة كيميائية)'&&['drogue','drogues'].includes(fr)?['drogue','drogues']:[]
  return [articleHasLanguage(a,l)?a.content[l]?.title:'',...(a.subjectAliases?.[l]||[]),...reviewed].filter((s):s is string=>Boolean(s)).map(s=>subjectKey(s,l))
}
function sameSubject(a:Article,b:Article):boolean {
  const shared=LANGS.filter(l=>articleHasLanguage(a,l)&&articleHasLanguage(b,l)&&a.content[l]?.title&&b.content[l]?.title)
  // A shared ambiguous name with contradictory translations requires editorial review.
  const exact=(lang:Lang)=>names(a,lang).some(name=>names(b,lang).includes(name))
  const unaccent=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  return shared.length>0 && shared.every(l=>exact(l)||(l==='fr'&&shared.includes('ar')&&exact('ar')&&names(a,l).some(name=>names(b,l).some(other=>unaccent(name)===unaccent(other)))))
}
function sameGroupSubject(group:Article[],article:Article):boolean {
  const authority=group.find(a=>a.editorialEdition)||group.find(a=>a.subjectAliases)
  if(authority)return sameSubject(authority,article)
  return group.every(other=>sameSubject(other,article))
}
function mergeText(entries:ArticleContent[]):ArticleContent {
  const first=entries[0]
  const ordered=[...entries].sort((a,b)=>b.body.join(' ').length-a.body.join(' ').length)
  const body:string[]=[]
  for(const entry of ordered)for(const p of entry.body){const key=textKey(p);if(!key)continue
    if(body.some(q=>{const other=textKey(q);return key===other||(key.length>80&&other.includes(key))}))continue
    // Replace a truncated excerpt with its complete paragraph, preserving position.
    const short=body.findIndex(q=>{const other=textKey(q);return other.length>80&&key.includes(other)})
    if(short>=0)body[short]=p;else body.push(p)
  }
  const summary=entries.map(e=>e.summary).sort((a,b)=>b.length-a.length)[0]||''
  return {title:first.title,summary,body}
}
function hash(value:string){let result=2166136261;for(const char of value)result=Math.imul(result^char.codePointAt(0)!,16777619);return(result>>>0).toString(36)}

/** Merge by proven subject identity, never by recycled importer IDs alone. First rows win IDs. */
export function reconcileArticles(input:Article[]):Article[] {
  const groups:Article[][]=[]
  const index=new Map<string,number[]>()
  for(const article of input){
    const keys=LANGS.flatMap(l=>names(article,l).map(name=>l+':'+name))
    if(!keys.length)continue
    const candidates=[...new Set(keys.flatMap(k=>index.get(k)||[]))]
    const matches=candidates.filter(i=>groups[i].length && sameGroupSubject(groups[i],article))
    const group=matches[0]??groups.length
    if(!groups[group])groups[group]=[]
    groups[group].push(article)
    // A multilingual row may bridge two formerly separate monolingual editions.
    for(const other of matches.slice(1)){
      if(groups[group].every(a=>groups[other].every(b=>sameSubject(a,b)||LANGS.every(l=>!a.content[l]||!b.content[l])))){
        groups[group].push(...groups[other]);groups[other]=[]
        for(const [k,values] of index)if(values.includes(other))index.set(k,[...new Set(values.map(i=>i===other?group:i))])
      }
    }
    for(const key of keys)index.set(key,[...new Set([...(index.get(key)||[]),group])])
  }
  const used=new Set<string>()
  const merged=groups.filter(g=>g.length).map(group=>{
    const preferred=group.find(a=>a.editorialEdition)||group[0]
    let id=preferred.id
    if(used.has(id)){const identity=LANGS.map(l=>preferred.content[l]?.title?l+':'+subjectKey(preferred.content[l].title,l):'').join('|');id+='--'+hash(identity);while(used.has(id))id+='x'}
    used.add(id)
    const content:Partial<Article['content']>={},kidsContent:Partial<Article['content']>={},sources:Partial<Record<Lang,ArticleSource[]>>={},cat={...preferred.cat}
    for(const lang of LANGS){
      const editions=group.flatMap(a=>articleHasLanguage(a,lang)&&a.content[lang]?[a.content[lang]]:[])
      if(editions.length)content[lang]=preferred.editorialEdition&&articleHasLanguage(preferred,lang)?preferred.content[lang]:mergeText(editions)
      const kids=group.flatMap(a=>a.kidsContent?.[lang]?[a.kidsContent[lang]!]:[])
      if(kids.length)kidsContent[lang]=preferred.kidsContent?.[lang]||mergeText(kids)
      const references=preferred.editorialEdition&&preferred.sources?.[lang]?preferred.sources[lang]!:group.flatMap(a=>a.sources?.[lang]||[]);const unique=new Map(references.map(s=>[sourceKey(s),s]));if(unique.size)sources[lang]=[...unique.values()]
      const specific=group.map(a=>a.cat[lang]).find(c=>c&&!/مجموعة قلم|collection qalam|qalam collection|معرفة عامة|savoirs generaux|general knowledge/i.test(c));if(specific)cat[lang]=specific
    }
    const hasExplicitAvailability=group.some(a=>a.availableLanguages!==undefined)
    const availableLanguages=hasExplicitAvailability?LANGS.filter(l=>group.some(a=>articleHasLanguage(a,l))):undefined
    return {...preferred,id,cat,content:content as Article['content'],availableLanguages,kidsContent,sources,related:[...new Set(preferred.editorialEdition?preferred.related:group.flatMap(a=>a.related||[]))],aliases:[...new Set(group.flatMap(a=>[a.id,...(a.aliases||[])]))]} as Article
  })
  const aliases=new Map<string,string>()
  for(const article of merged){article.aliases=article.aliases?.filter(id=>id!==article.id&&!used.has(id));for(const alias of article.aliases||[])if(!aliases.has(alias))aliases.set(alias,article.id)}
  for(const article of merged)article.related=[...new Set(article.related.map(id=>aliases.get(id)||id))].filter(id=>id!==article.id)
  return merged
}

export function articleMatchesId(article:Article,id:string){return article.id===id||Boolean(article.aliases?.includes(id))}
