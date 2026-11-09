import { useEffect, useState } from 'react'
import type { Article } from './data'
import type { Lang } from './i18n'
import type { Level } from './content'
import { publicUrl } from './publicUrl'

type ReferenceImage = {url:string;file:string;source:string;title:string}
type Manifest = Record<string, ReferenceImage>
let images: Manifest = {}
let request: Promise<Manifest> | undefined
const key = (s:string) => s.normalize('NFKC').trim().toLowerCase()
type Rights = {author:string;license:string;url:string}
const rightsRequests = new Map<string,Promise<Rights|undefined>>()
function useRights(file:string|undefined) {
  const [rights,setRights]=useState<Rights>()
  useEffect(()=>{
    setRights(undefined);if(!file)return
    let active=true
    if(!rightsRequests.has(file)) {
      const params=new URLSearchParams({action:'query',format:'json',origin:'*',prop:'imageinfo',iiprop:'extmetadata',titles:'File:'+file})
      const plain=(value:string|undefined)=>new DOMParser().parseFromString(value||'','text/html').body.textContent?.trim()||''
      rightsRequests.set(file,fetch(`https://commons.wikimedia.org/w/api.php?${params}`).then(r=>r.json()).then(data=>{
        const pages=Object.values(data.query?.pages||{}) as {imageinfo?:{extmetadata?:Record<string,{value:string}>}[]}[]
        const meta=pages[0]?.imageinfo?.[0]?.extmetadata
        return meta?{author:plain(meta.Artist?.value),license:plain(meta.LicenseShortName?.value),url:meta.LicenseUrl?.value||''}:undefined
      }).catch(()=>undefined))
    }
    rightsRequests.get(file)!.then(value=>{if(active)setRights(value)})
    return()=>{active=false}
  },[file])
  return rights
}
function useImages() {
  const [value, setValue] = useState(images)
  useEffect(() => { let active=true; request ??= fetch(publicUrl('data/articleImages.json')).then(r=>{if(!r.ok)throw Error('images');return r.json()}).then(data=>images=data).catch(()=>{request=undefined;return images});request.then(data=>{if(active)setValue(data)});return()=>{active=false} },[])
  return value
}
const KIDS: [RegExp,string][] = [
  [/^(?:hubble-space-telescope|تلسكوب هابل الفضائي|télescope spatial hubble)$/i,'telescope-space-kids-v1.jpg'],
  [/^(?:black-holes-guide|الثقوب السوداء|ثقب أسود|trou noir|black holes?)$/i,'blackhole-kids-v1.jpg'],
  [/^(?:heart|القلب|cœur|coeur|human body|جسم الإنسان|corps humain)$/i,'body-kids-v2.jpg'],
  [/^(?:ai|الذكاء الاصطناعي|artificial intelligence|intelligence artificielle)$/i,'ai-future-kids.jpg'],
  [/^(?:mars|المريخ)$/i,'space-future-kids.jpg'],
  [/^(?:atom|الذرة|atome|chemistry|الكيمياء|chimie)$/i,'chemistry-kids.jpg'],
  [/^(?:sun|الشمس|soleil|the sun)$/i,'atlas-space-kids.jpg'],
  [/^(?:climate|المناخ|climat|earth|الأرض|terre)$/i,'atlas-earth-kids.jpg'],
  [/^(?:energy|الطاقة|énergie)$/i,'energy-future-kids.jpg'],
]
export function findArticleImage(article:Article, lang:Lang, manifest:Manifest):ReferenceImage|undefined {
  for(const language of [lang,'en','fr','ar'] as Lang[]){const title=article.content[language]?.title;if(title && manifest[language+':'+key(title)])return manifest[language+':'+key(title)]}
}

const TOPIC_TITLES:Record<string,string>={stars:'Star',planets:'Planet',galaxies:'Galaxy',volcanoes:'Volcano',oceans:'Ocean',cells:'Cell (biology)',dna:'DNA',humanBody:'Human body',atoms:'Atom',molecules:'Molecule',waves:'Wave',electricity:'Electricity',ai:'Artificial intelligence'}
export function topicImageArticle(topic:{id:string;title:Record<Lang,string>;idea:Record<Lang,string>}):Article {
  const content=(lang:Lang)=>({title:lang==='en'?(TOPIC_TITLES[topic.id]||topic.title.en):topic.title[lang],summary:topic.idea[lang],body:[]})
  return {id:topic.id,cat:{ar:'',fr:'',en:''},related:[],content:{ar:content('ar'),fr:content('fr'),en:content('en')}}
}
export default function ArticleVisual({article,lang,level,className=''}:{article:Article;lang:Lang;level:Level;className?:string}) {
  const manifest=useImages()
  const reference=findArticleImage(article,lang,manifest)
  const illustration=level==='kids'?KIDS.find(([re])=>re.test(article.id)||Object.values(article.content).some(c=>c && re.test(c.title)))?.[1]:undefined
  const src=illustration?publicUrl('assets/img/'+illustration):reference?.url
  const srcSet=!illustration && src?.match(/\/\d+px-/)?[640,960,1280].map(width=>`${src.replace(/\/\d+px-/,`/${width}px-`)} ${width}w`).join(', '):undefined
  const [failed,setFailed]=useState(false)
  useEffect(()=>setFailed(false),[src])
  if(!src||failed)return <div className={`article-visual-empty ${className}`} aria-hidden="true"/>
  return <img className={`article-subject-image ${className}`} src={src} srcSet={srcSet} sizes={className.includes('banner')?'(max-width: 800px) 100vw, 900px':'(max-width: 600px) 100vw, 360px'} alt={article.content[lang]?.title||''} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>
}
export function ArticleImageCredits({article,lang,level}:{article:Article;lang:Lang;level:Level}) {
  const manifest=useImages();const image=findArticleImage(article,lang,manifest)
  const generated=level==='kids' && KIDS.some(([re])=>re.test(article.id)||Object.values(article.content).some(c=>c&&re.test(c.title)))
  const rights=useRights(generated?undefined:image?.file)
  const label=lang==='ar'?'مصدر صورة الموضوع وحقوق استخدامها':lang==='fr'?'Source et droits de l’image':'Image source and usage rights'
  if(generated)return <p className="article-image-credit">{lang==='ar'?'صورة توضيحية تعليمية مولّدة؛ ليست صورة توثيقية.':lang==='fr'?'Illustration pédagogique générée, non documentaire.':'Generated educational illustration, not documentary photography.'}</p>
  return image?<p className="article-image-credit"><a href={image.source} target="_blank" rel="noreferrer">{label}</a>{rights?.author && <> · {rights.author}</>}{rights?.license && <> · {rights.url.startsWith('https://')?<a href={rights.url} target="_blank" rel="noreferrer">{rights.license}</a>:rights.license}</>}</p>:null
}
