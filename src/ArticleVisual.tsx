import { useEffect, useState } from 'react'
import type { Article } from './data'
import type { Lang } from './i18n'
import type { Level } from './content'
import { publicUrl } from './publicUrl'
import { domainForArticle } from './articleDomain'
import { QURAN_ARTICLE_VISUALS } from './quranArticleVisuals'

type ReferenceImage = {url:string;file:string;source:string;title:string;reviewed?:boolean;kind?:string;caption?:Record<Lang,string>;creator?:string;license?:string;licenseUrl?:string;localAsset?:string}
type Manifest = Record<string, ReferenceImage>
let images: Manifest = {}
let request: Promise<Manifest> | undefined
const key = (s:string) => s.normalize('NFKC').trim().toLowerCase()
type Rights = {author:string;license:string;url:string}
const rightsRequests = new Map<string,Promise<Rights|undefined>>()
function useRights(file:string|undefined,fallback?:Rights) {
  const [rights,setRights]=useState<Rights|undefined>(fallback)
  useEffect(()=>{
    setRights(fallback);if(!file||fallback?.license)return
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
  },[file,fallback?.author,fallback?.license,fallback?.url])
  return rights
}
function useImages() {
  const [value, setValue] = useState(images)
  useEffect(() => { let active=true; request ??= fetch(publicUrl('data/articleImages.json')).then(r=>{if(!r.ok)throw Error('images');return r.json()}).then(data=>images=data).catch(()=>{request=undefined;return images});request.then(data=>{if(active)setValue(data)});return()=>{active=false} },[])
  return value
}
const KIDS: [RegExp,string][] = [
  [/^algebra$/i,'algebra-kids-editorial-v1.jpg'],
  [/^photosynthesis$/i,'photosynthesis-kids-editorial-v1.jpg'],
  [/^plate-tectonics$/i,'plate-tectonics-kids-editorial-v1.jpg'],
  [/^industrialRevolution$/i,'industrialRevolution-kids-editorial-v1.jpg'],
  [/^arabic-poetry$/i,'arabic-poetry-kids-editorial-v1.jpg'],
  [/^ai$/i,'ai-kids-editorial-v1.jpg'],
  [/^(?:hubble-space-telescope|تلسكوب هابل الفضائي|télescope spatial hubble)$/i,'telescope-space-kids-v1.jpg'],
  [/^(?:black-holes-guide|الثقوب السوداء|ثقب أسود|trou noir|black holes?)$/i,'blackhole-kids-v1.jpg'],

]
// Exact, locally bundled artwork for priority topics that had no reliable
// subject image. These assets are deliberately per subject rather than branch
// fallbacks, and the child/adult variants are selected by the audience mode.
const TOPIC_ARTWORK: {pattern:RegExp;kids:string;academic:string;alt:Record<Lang,string>}[] = [
  {pattern:/^(?:morocco|المغرب|maroc)$/i,kids:'homeland-kids-v3.jpg',academic:'homeland-academic-v3.jpg',alt:{ar:'مشهد بصري للمغرب يجمع العلم الوطني ومعالم مدنية مغربية',fr:'Vue du Maroc réunissant le drapeau national et des monuments urbains marocains',en:'View of Morocco featuring the national flag and Moroccan urban landmarks'}},
  {pattern:/^(?:climate change|تغير المناخ|le changement climatique)$/i,kids:'climate-change-v1.jpg',academic:'climate-change-v1.jpg',alt:{ar:'رسم توضيحي يربط بين احترار المناخ والجليد والجفاف والطاقة المتجددة',fr:'Illustration reliant le réchauffement climatique, la glace, la sécheresse et les énergies renouvelables',en:'Illustration connecting climate warming, ice, drought, and renewable energy'}},
  {pattern:/^(?:renewable energy|الطاقة المتجددة|les énergies renouvelables)$/i,kids:'renewable-energy-kids-v1.jpg',academic:'renewable-energy.jpg',alt:{ar:'مجسم تعليمي يجمع الطاقة الشمسية والرياح والمياه المتجددة',fr:'Diorama pédagogique réunissant énergie solaire, éolienne et hydraulique',en:'Educational diorama combining solar, wind, and hydropower'}},
  {pattern:/^(?:water|الماء|l’eau|l'eau)$/i,kids:'water-kids-v1.jpg',academic:'water.jpg',alt:{ar:'مشهد تعليمي لدورة الماء بين الجبال والنهر والغابة داخل قطرة',fr:'Scène pédagogique du cycle de l’eau entre montagnes, rivière et forêt dans une goutte',en:'Educational water-cycle scene linking mountains, river, and forest inside a droplet'}},
  {pattern:/^(?:the )?heart$|^القلب$|^le cœur$/i,kids:'heart-kids-v1.jpg',academic:'heart.jpg',alt:{ar:'مقطع توضيحي للقلب ومسارات الدم، أو نموذج تشريحي للقلب',fr:'Coupe pédagogique du cœur et circulation du sang, ou modèle anatomique',en:'Educational heart cutaway and blood flow, or an anatomical heart model'}},
  {pattern:/^(?:africa|أفريقيا|l’afrique|l'afrique)$/i,kids:'africa-kids-v1.jpg',academic:'africa.jpg',alt:{ar:'خريطة تضاريسية مصورة لقارة أفريقيا',fr:'Carte en relief illustrée du continent africain',en:'Illustrated relief map of the African continent'}},
  {pattern:/^(?:the )?atom$|^الذرة$|^l’atome$|^l'atome$/i,kids:'atom-kids-v1.jpg',academic:'atom-kids-v1.jpg',alt:{ar:'تصور علمي حديث للسحابة الإلكترونية ونواة الذرة',fr:'Visualisation scientifique moderne du nuage électronique et du noyau atomique',en:'Modern scientific visualization of an atom’s electron cloud and nucleus'}},
  {pattern:/^(?:cell \(biology\)|cellule \(biologie\)|الخلية|خلية حية)$/i,kids:'cell-kids-v1.jpg',academic:'cell-academic-v1.jpg',alt:{ar:'مقطع ثلاثي الأبعاد لخلية حيوانية وأجزائها الرئيسية',fr:'Coupe tridimensionnelle d’une cellule animale et de ses principaux organites',en:'Three-dimensional cutaway of an animal cell and its main organelles'}},
  {pattern:/^(?:mountain formation|تكوين الجبال|formation des montagnes)$/i,kids:'mountain-formation-kids-v1.jpg',academic:'mountain-formation-academic-v1.jpg',alt:{ar:'مشهد مقطعي يوضح انضغاط الطبقات الصخرية وتكوّن الجبال',fr:'Coupe montrant la compression des strates et la formation des montagnes',en:'Cutaway showing compressed rock strata and mountain formation'}},
  {pattern:/^(?:mesopotamia|بلاد الرافدين|mésopotamie)$/i,kids:'mesopotamia-kids-v1.jpg',academic:'mesopotamia-academic-v1.jpg',alt:{ar:'إعادة بناء تعليمية لمدينة من بلاد الرافدين بين النهرين',fr:'Reconstitution pédagogique d’une ville de Mésopotamie entre les fleuves',en:'Educational reconstruction of a Mesopotamian city between the rivers'}},
  {pattern:/^(?:biology|biologie|علم الأحياء)$/i,kids:'biology-kids-v1.jpg',academic:'biology-academic-v1.jpg',alt:{ar:'الحياة من الخلية إلى النظام البيئي ودراسة الأحياء',fr:'La vie, de la cellule à l’écosystème, et son étude scientifique',en:'Life from cells to ecosystems, and its scientific study'}},
  {pattern:/^(?:poetry|poésie|شعر(?: \(أدب\))?|الشعر)$/i,kids:'poetry-kids-v1.jpg',academic:'poetry-academic-v1.jpg',alt:{ar:'مشهد بصري للشعر بوصفه كتابة وإلقاءً وتجربة أدبية',fr:'Évocation de la poésie comme écriture, récitation et expérience littéraire',en:'Poetry represented through writing, recitation, and literary experience'}},
]
function topicArtwork(article:Article, lang:Lang, level:Level) {
  const titles=Object.values(article.content).flatMap(content=>content?.title?[content.title]:[])
  const match=TOPIC_ARTWORK.find(item=>titles.some(title=>item.pattern.test(title)))
  return match?{src:level==='kids'?match.kids:match.academic,alt:match.alt[lang]}:undefined
}
export function findArticleImage(article:Article, lang:Lang, manifest:Manifest):ReferenceImage|undefined {
  for(const language of [lang,'en','fr','ar'] as Lang[]){const titles=[article.content[language]?.title,...(article.subjectAliases?.[language]||[])];for(const title of titles)if(title && manifest[language+':'+key(title)])return manifest[language+':'+key(title)]}
}

const TOPIC_TITLES:Record<string,string>={stars:'Star',planets:'Planet',galaxies:'Galaxy',volcanoes:'Volcano',oceans:'Ocean',cells:'Cell (biology)',dna:'DNA',humanBody:'Human body',atoms:'Atom',molecules:'Molecule',waves:'Wave',electricity:'Electricity',ai:'Artificial intelligence'}
export function topicImageArticle(topic:{id:string;title:Record<Lang,string>;idea:Record<Lang,string>}):Article {
  const content=(lang:Lang)=>({title:lang==='en'?(TOPIC_TITLES[topic.id]||topic.title.en):topic.title[lang],summary:topic.idea[lang],body:[]})
  return {id:topic.id,cat:{ar:'',fr:'',en:''},related:[],content:{ar:content('ar'),fr:content('fr'),en:content('en')}}
}
export default function ArticleVisual({article,lang,level,className=''}:{article:Article;lang:Lang;level:Level;className?:string}) {
  const manifest=useImages()
  const reference=findArticleImage(article,lang,manifest)
  const topic=topicArtwork(article,lang,level)
  const quranKind=QURAN_ARTICLE_VISUALS[article.id]
  const quranPrimary=quranKind?manifest[quranKind==='madani'?'quran-visual:madani':'quran-visual:makki']:undefined
  const quranSecondary=quranKind==='mixed'?manifest['quran-visual:madani']:undefined
  const showQuranPair=quranKind==='mixed'&&quranPrimary&&quranSecondary&&quranPrimary.file!==quranSecondary.file
  const illustration=level==='kids'?KIDS.find(([re])=>re.test(article.id)||Object.values(article.content).some(c=>c && re.test(c.title)))?.[1]:undefined
  const domain=domainForArticle(article)
  const fieldArtwork=!quranKind&&!topic&&!illustration&&!reference&&domain!=='unclassified'
  const audience=level==='kids'?'kids':'academic'
  const localArtwork=topic?.src||illustration
  const src=quranPrimary?.localAsset?publicUrl(quranPrimary.localAsset):quranPrimary?.url||(localArtwork?publicUrl('assets/img/'+localArtwork):(reference?.localAsset?publicUrl(reference.localAsset):reference?.url)||(fieldArtwork?publicUrl(`assets/img/journey-discovery-${domain}-${audience}-v1.jpg`):undefined))
  const srcSet=!localArtwork && !reference?.localAsset && src?.match(/\/\d+px-/)?[640,960,1280].map(width=>`${src.replace(/\/\d+px-/,`/${width}px-`)} ${width}w`).join(', '):undefined
  const [failed,setFailed]=useState(false)
  useEffect(()=>setFailed(false),[src])
  if(!src||failed)return <div className={`article-visual-empty ${className}`} aria-hidden="true"/>
  if(showQuranPair)return <div className={`article-subject-image--quran-pair ${className}`}><img src={quranPrimary!.url} alt={quranPrimary!.caption?.[lang]||''} loading="lazy" decoding="async"/><img src={quranSecondary!.url} alt={quranSecondary!.caption?.[lang]||''} loading="lazy" decoding="async"/></div>
  const alt=fieldArtwork
    ?(lang==='ar'?'رسم توضيحي عام لفرع '+article.cat[lang]:lang==='fr'?'Illustration générale du domaine '+article.cat[lang]:'General illustration for the '+article.cat[lang]+' field')
    :quranKind?(quranPrimary?.caption?.[lang]||'')
    :(topic?.alt||article.content[lang]?.title||'')
  return <img className={`article-subject-image${fieldArtwork?' article-subject-image--field-art':''} ${className}`} src={src} srcSet={srcSet} sizes={className.includes('banner')?'(max-width: 800px) 100vw, 900px':'(max-width: 600px) 100vw, 360px'} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>
}
export function ArticleImageCredits({article,lang,level}:{article:Article;lang:Lang;level:Level}) {
  const manifest=useImages();const image=findArticleImage(article,lang,manifest)
  const topic=topicArtwork(article,lang,level)
  const quranKind=QURAN_ARTICLE_VISUALS[article.id]
  const quranPrimary=quranKind?manifest[quranKind==='madani'?'quran-visual:madani':'quran-visual:makki']:undefined
  const generated=Boolean(topic && /^(?:climate-change|heart-kids|africa-kids|atom-kids|water-kids|renewable-energy-kids|cell-|mountain-formation-|mesopotamia-|biology-|poetry-|homeland-(?:kids|academic)-).*\.jpg$/.test(topic.src)) || (level==='kids' && KIDS.some(([re])=>re.test(article.id)||Object.values(article.content).some(c=>c&&re.test(c.title))))
  const primaryCreditImage=quranPrimary||image
  const rights=useRights(primaryCreditImage?.file||((generated)?undefined:image?.file),primaryCreditImage?{author:primaryCreditImage.creator||'',license:primaryCreditImage.license||'',url:primaryCreditImage.licenseUrl||''}:undefined)
  const label=lang==='ar'?'مصدر صورة الموضوع وحقوق استخدامها':lang==='fr'?'Source et droits de l’image':'Image source and usage rights'
  const licenseText=(image:ReferenceImage,details:Rights|undefined)=>{const author=details?.author||image.creator,license=details?.license||image.license,url=details?.url||image.licenseUrl||'',source=image.source||(image.localAsset?publicUrl(image.localAsset):'');return <>{source&&<><a href={source} target="_blank" rel="noreferrer">{label}</a>{' · '}</>}{author&&<>{author}</>}{license&&<> · {url.startsWith('https://')?<a href={url} target="_blank" rel="noreferrer">{license}</a>:license}</>}</>}
  if(quranKind&&quranPrimary)return <><p className="article-image-caption">{quranPrimary.caption?.[lang]||''}</p><p className="article-image-credit">{licenseText(quranPrimary,rights)}</p></>
  if(generated)return <p className="article-image-credit">{lang==='ar'?'صورة توضيحية تعليمية مولّدة؛ ليست صورة توثيقية.':lang==='fr'?'Illustration pédagogique générée, non documentaire.':'Generated educational illustration, not documentary photography.'}</p>
  if(topic)return <p className="article-image-credit">{lang==='ar'?'صورة موضوعية من مكتبة الصور المرفقة بالموسوعة.':lang==='fr'?'Image thématique issue de la bibliothèque visuelle de l’encyclopédie.':'Subject image from the encyclopedia’s bundled visual library.'}</p>
  if(!image){const domain=domainForArticle(article);if(domain!=='unclassified')return <p className="article-image-credit">{lang==='ar'?'رسم توضيحي عام للفرع، وليس صورة توثيقية للموضوع.':lang==='fr'?'Illustration générale du domaine, et non image documentaire du sujet.':'General field illustration, not documentary imagery of this subject.'}</p>}
  return image?<>{image.caption?.[lang]&&<p className="article-image-caption">{image.caption[lang]}</p>}<p className="article-image-credit">{licenseText(image,rights)}</p></>:null
}
