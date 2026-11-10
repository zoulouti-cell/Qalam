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
const input=[...load('content').ALL_ARTICLES_FULL,...sanitizeArticles(raw.reverse())]
const reconciled=reconcileArticles(input)
const articles=reconciled.filter(a=>!load('spaceArticles').isReplacedSpaceArticle(a))
const images=JSON.parse(fs.readFileSync('public/data/articleImages.json','utf8'))
const languages=['ar','fr','en'],byBranch={},missingTranslations=[],missingImages=[],titles=new Map()
for(const article of articles){
  const domain=domainForArticle(article)
  const stats=byBranch[domain]??={subjects:0,ar:0,fr:0,en:0,parallel:0,withImage:0}
  stats.subjects++
  for(const lang of languages){const title=article.content[lang]?.title;if(title){stats[lang]++;const key=lang+':'+subjectKey(title,lang);titles.set(key,[...(titles.get(key)||[]),article.id])}}
  if(article.editorialEdition?.parallel)stats.parallel++
  const missing=languages.filter(l=>!article.content[l]?.body?.length)
  if(missing.length)missingTranslations.push({id:article.id,branch:domain,titles:Object.fromEntries(languages.filter(l=>article.content[l]).map(l=>[l,article.content[l].title])),missing})
  const match=languages.flatMap(l=>[article.content[l]?.title,...(article.subjectAliases?.[l]||[])].filter(Boolean).map(title=>images[l+':'+title.normalize('NFKC').trim().toLowerCase()])).find(Boolean)
  if(match)stats.withImage++;else missingImages.push({id:article.id,branch:domain,titles:Object.fromEntries(languages.filter(l=>article.content[l]).map(l=>[l,article.content[l].title]))})
}
const ambiguousNames=[...titles].filter(([,ids])=>ids.length>1).map(([title,ids])=>({title,ids}))
const summary={inputRecords:input.length,uniqueSubjects:articles.length,duplicateRecordsMerged:input.length-reconciled.length,replacedObsoleteRecords:reconciled.length-articles.length,uniquePrimaryIds:new Set(articles.map(a=>a.id)).size,parallelEditorialSubjects:articles.filter(a=>a.editorialEdition?.parallel).length,subjectsWithThreeLanguages:articles.filter(a=>languages.every(l=>a.content[l]?.body?.length)).length,subjectsNeedingTranslation:missingTranslations.length,subjectsWithReferenceImage:articles.length-missingImages.length,subjectsNeedingImage:missingImages.length,ambiguousNamesForReview:ambiguousNames.length,branches:byBranch}
fs.mkdirSync('reports',{recursive:true})
fs.writeFileSync('reports/editorial-progress.json',JSON.stringify({summary,translationQueue:missingTranslations,imageQueue:missingImages,ambiguousNames},null,2))
fs.writeFileSync('reports/collection-reconciliation.json',JSON.stringify(summary,null,2))
console.log(JSON.stringify(summary,null,2))
