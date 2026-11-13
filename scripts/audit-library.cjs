const fs=require('fs'),ts=require('typescript'),vm=require('vm')
const cache={}
function load(name){
  if(cache[name])return cache[name]
  const context={exports:{},URL,require:ref=>load(ref.replace('./',''))}
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context)
  return cache[name]=context.exports
}
const packs=fs.readdirSync('public/data').filter(f=>/^(?:wikiArticles|collectionFr|library_extra\d*)\.json$/.test(f))
const raw=packs.flatMap(f=>JSON.parse(fs.readFileSync('public/data/'+f,'utf8')))
const {sanitizeArticles}=load('sanitize'),{reconcileArticles,subjectKey}=load('articleCollection'),{domainForArticle}=load('articleDomain')
const {articleCardVisual,articleCardCategory}=load('content')
const {QURAN_ARTICLE_VISUALS}=load('quranArticleVisuals')
const input=[...load('content').ALL_ARTICLES_FULL,...sanitizeArticles(raw.reverse())]
const reconciled=reconcileArticles(input)
const articles=reconciled.filter(a=>!load('spaceArticles').isReplacedSpaceArticle(a))
const images=JSON.parse(fs.readFileSync('public/data/articleImages.json','utf8'))
const languages=['ar','fr','en'],byBranch={},missingTranslations=[],missingImages=[],titles=new Map()
const localImagePatterns=[
  /^(?:morocco|المغرب|maroc)$/i,
  /^(?:climate change|تغير المناخ|le changement climatique)$/i,
  /^(?:renewable energy|الطاقة المتجددة|les énergies renouvelables)$/i,
  /^(?:water|الماء|l’eau|l'eau)$/i,
  /^(?:the )?heart$|^القلب$|^le cœur$/i,
  /^(?:africa|أفريقيا|l’afrique|l'afrique)$/i,
  /^(?:the )?atom$|^الذرة$|^l’atome$|^l'atome$/i,
  /^(?:cell \(biology\)|cellule \(biologie\)|الخلية|خلية حية)$/i,
  /^(?:mountain formation|تكوين الجبال|formation des montagnes)$/i,
  /^(?:mesopotamia|بلاد الرافدين|mésopotamie)$/i,
  /^(?:biology|biologie|علم الأحياء)$/i,
  /^(?:poetry|poésie|شعر(?: \(أدب\))?|الشعر)$/i,
]
const hasLocalArtwork=article=>Object.values(article.content).some(content=>content?.title&&localImagePatterns.some(pattern=>pattern.test(content.title)))
const hasQuranVisual=article=>Boolean(QURAN_ARTICLE_VISUALS[article.id]&&images['quran-visual:'+(QURAN_ARTICLE_VISUALS[article.id]==='madani'?'madani':'makki')]&&(QURAN_ARTICLE_VISUALS[article.id]!=='mixed'||images['quran-visual:madani']))
const hasReferenceImage=article=>languages.flatMap(lang=>[article.content[lang]?.title,...(article.subjectAliases?.[lang]||[])].filter(Boolean).map(title=>images[lang+':'+title.normalize('NFKC').trim().toLowerCase()])).some(Boolean)
for(const article of articles){
  const domain=domainForArticle(article)
  const stats=byBranch[domain]??={subjects:0,ar:0,fr:0,en:0,parallel:0,withImage:0,withReferenceImage:0,withLocalArtwork:0}
  stats.subjects++
  for(const lang of languages){const title=article.content[lang]?.title;if(title){stats[lang]++;const key=lang+':'+subjectKey(title,lang);titles.set(key,[...(titles.get(key)||[]),article.id])}}
  if(article.editorialEdition?.parallel)stats.parallel++
  const missing=languages.filter(l=>!article.content[l]?.body?.length)
  if(missing.length)missingTranslations.push({id:article.id,branch:domain,titles:Object.fromEntries(languages.filter(l=>article.content[l]).map(l=>[l,article.content[l].title])),missing})
  const referenceImage=hasReferenceImage(article),localArtwork=hasLocalArtwork(article),quranVisual=hasQuranVisual(article)
  if(referenceImage||quranVisual)stats.withReferenceImage++
  if(localArtwork)stats.withLocalArtwork++
  if(referenceImage||localArtwork||quranVisual)stats.withImage++;else missingImages.push({id:article.id,branch:domain,titles:Object.fromEntries(languages.filter(l=>article.content[l]).map(l=>[l,article.content[l].title])),summaries:Object.fromEntries(languages.filter(l=>article.content[l]).map(l=>[l,[article.content[l].summary,...(article.content[l].body||[]).slice(0,2)].filter(Boolean).join(' ').slice(0,420)]))})
}
const ambiguousNames=[...titles].filter(([,ids])=>ids.length>1).map(([title,ids])=>({title,ids}))
const cardIcons={},genericCollectionLabels=[]
for(const article of articles){
  const visual=articleCardVisual(article)
  cardIcons[visual.icon]=(cardIcons[visual.icon]||0)+1
  for(const lang of languages){
    const label=articleCardCategory(article,lang,visual).toLocaleLowerCase().trim()
    if(['qalam collection','collection qalam','مجموعة قلم'].includes(label))genericCollectionLabels.push({id:article.id,lang})
  }
}
const summary={inputRecords:input.length,uniqueSubjects:articles.length,duplicateRecordsMerged:input.length-reconciled.length,replacedObsoleteRecords:reconciled.length-articles.length,uniquePrimaryIds:new Set(articles.map(a=>a.id)).size,parallelEditorialSubjects:articles.filter(a=>a.editorialEdition?.parallel).length,subjectsWithThreeLanguages:articles.filter(a=>languages.every(l=>a.content[l]?.body?.length)).length,subjectsNeedingTranslation:missingTranslations.length,subjectsWithReferenceImage:articles.filter(hasReferenceImage).length,subjectsWithLocalArtwork:articles.filter(hasLocalArtwork).length,subjectsWithImage:articles.length-missingImages.length,subjectsNeedingImage:missingImages.length,ambiguousNamesForReview:ambiguousNames.length,branches:byBranch}
summary.articleCardAudit={uniqueTopicMarks:Object.keys(cardIcons).length,articlesByMark:cardIcons,unreplacedGenericCollectionLabels:genericCollectionLabels.length}
fs.mkdirSync('reports',{recursive:true})
const topicIndex=Object.groupBy?Object.groupBy(articles,a=>domainForArticle(a)):articles.reduce((groups,a)=>{(groups[domainForArticle(a)]??=[]).push(a);return groups},{})
const reviewRow=article=>{const visual=articleCardVisual(article);return {id:article.id,primaryDomain:article.primaryDomain||null,subjectCategories:Object.fromEntries(languages.map(lang=>[lang,articleCardCategory(article,lang,visual)])),cardMark:visual.icon,titles:Object.fromEntries(languages.filter(l=>article.content[l]?.title).map(l=>[l,article.content[l].title])),sourceCategories:Object.fromEntries(languages.filter(l=>article.cat[l]).map(l=>[l,article.cat[l]])),evidence:Object.fromEntries(languages.filter(l=>article.content[l]).map(l=>[l,[article.content[l].summary,...(article.content[l].body||[]).slice(0,2)].filter(Boolean).join(' ').slice(0,720)]))}}
const topicCatalog=Object.fromEntries(Object.entries(topicIndex).map(([topic,rows])=>[topic,rows.map(reviewRow)]))
const topicReviewQueue=articles.filter(a=>domainForArticle(a)==='unclassified'||(a.primaryDomain&&a.primaryDomain!==domainForArticle(a)&&a.primaryDomain!=='future')).map(a=>({...reviewRow(a),assignedDomain:domainForArticle(a)}))
fs.writeFileSync('reports/article-topic-index.json',JSON.stringify({generatedAt:new Date().toISOString(),summary,topics:topicCatalog},null,2))
fs.writeFileSync('reports/article-topic-review-queue.json',JSON.stringify({count:topicReviewQueue.length,items:topicReviewQueue},null,2))
fs.writeFileSync('reports/editorial-progress.json',JSON.stringify({summary,translationQueue:missingTranslations,imageQueue:missingImages,ambiguousNames},null,2))
fs.writeFileSync('reports/collection-reconciliation.json',JSON.stringify(summary,null,2))
console.log(JSON.stringify(summary,null,2))
